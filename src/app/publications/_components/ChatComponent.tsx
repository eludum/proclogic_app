"use client"

import { siteConfig } from "@/app/siteConfig";
import { Button } from "@/components/Button";
import { useAuth } from "@clerk/nextjs";
import { RiChatSmile2Line, RiCloseLine, RiFullscreenExitLine, RiFullscreenLine } from "@remixicon/react";
import { FileTextIcon, LoaderIcon, SendIcon } from 'lucide-react';
import { useEffect, useRef, useState } from "react";

const API_BASE_URL = siteConfig.api_base_url;

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    citations?: string[] | string;
    timestamp: Date;
}

interface ChatComponentProps {
    publicationId: string;
    onClose: () => void;
    isFullscreen?: boolean;
    toggleFullscreen?: () => void;
}

// Type definition for file information
interface FileInfo {
    name: string;
    [key: string]: any;
}

// Type definition for WebSocket response data
interface WebSocketResponseData {
    type?: string;
    content?: string;
    data?: {
        content?: string;
        citations?: string[] | string;
        done?: boolean;
        thread_id?: string;
        detail?: string;
    };
    detail?: string;
}

export default function ChatComponent({ publicationId, onClose, isFullscreen = false, toggleFullscreen }: ChatComponentProps) {
    const { getToken } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
    const [localIsFullscreen, setLocalIsFullscreen] = useState(false);
    const [availableFiles, setAvailableFiles] = useState<Record<string, FileInfo>>({});
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const websocketRef = useRef<WebSocket | null>(null);

    // Determine which fullscreen state and toggle function to use
    const fullscreenState = toggleFullscreen ? isFullscreen : localIsFullscreen;
    const handleToggleFullscreen = toggleFullscreen || (() => setLocalIsFullscreen(prev => !prev));

    // Setup WebSocket connection
    const setupWebSocket = async (): Promise<boolean> => {
        try {
            const token = await getToken();
            if (!token) {
                console.error("No authentication token available");
                setConnectionError("Authentication failed. Please log in again.");
                return false;
            }

            // Close existing connection if any
            if (websocketRef.current &&
                (websocketRef.current.readyState === WebSocket.OPEN ||
                    websocketRef.current.readyState === WebSocket.CONNECTING)) {
                websocketRef.current.close();
            }

            const wsUrl = `wss://${API_BASE_URL.replace(/^https?:\/\//, '')}/ws/conversation`;

            websocketRef.current = new WebSocket(wsUrl);

            return new Promise<boolean>((resolve) => {
                if (!websocketRef.current) {
                    resolve(false);
                    return;
                }

                websocketRef.current.onopen = () => {
                    setConnectionError(null);

                    // Sending the initial connection data right after connection is established
                    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
                        // First message format based on backend requirements
                        const connectionMessage = JSON.stringify({
                            publication_workspace_id: publicationId,
                            token: token
                        });

                        websocketRef.current.send(connectionMessage);
                    }
                    resolve(true);
                };

                websocketRef.current.onmessage = handleWebSocketMessage;

                websocketRef.current.onerror = (event: Event) => {
                    console.error("WebSocket connection error occurred", event);
                    setConnectionError("Connection error occurred. Please try again.");
                    resolve(false);
                };

                websocketRef.current.onclose = (event: CloseEvent) => {
                    if (event.code !== 1000) { // Not a normal closure
                        setConnectionError("Connection was closed. Please try again.");
                        // Add this line to reset loading state when connection closes unexpectedly
                        setLoading(false);
                        setStreamingMessage(null);
                    }
                    resolve(false);
                };
            });
        } catch (error) {
            console.error("Error setting up WebSocket:", error);
            setConnectionError("Failed to establish connection. Please try again later.");
            return false;
        }
    };

    // Handler for WebSocket messages
    const handleWebSocketMessage = (event: MessageEvent) => {
        try {
            const data: WebSocketResponseData = JSON.parse(event.data);

            // Direct content handling first (without type field)
            if (!data.type && data.content !== undefined) {
                setStreamingMessage(prev => {
                    if (!prev) {
                        return {
                            id: `assistant-${Date.now()}`,
                            role: "assistant",
                            content: data.content ?? "",
                            timestamp: new Date()
                        };
                    }
                    return {
                        ...prev,
                        content: data.content ?? ""
                    };
                });
                return;
            }

            // Handle different message types
            switch (data.type) {
                case "connected":
                    break;

                case "stream_start":
                    // Reset any previous streaming message
                    setStreamingMessage({
                        id: `assistant-${Date.now()}`,
                        role: "assistant",
                        content: "",
                        timestamp: new Date()
                    });
                    break;

                case "stream_chunk":
                    const chunkContent = data.data?.content || "";

                    setStreamingMessage(prev => {
                        if (!prev) {
                            return {
                                id: `assistant-${Date.now()}`,
                                role: "assistant",
                                content: chunkContent || "",
                                timestamp: new Date()
                            };
                        }
                        return {
                            ...prev,
                            content: prev.content + (chunkContent || "")
                        };
                    });
                    break;

                case "stream_end":
                case "response_complete":
                    // Determine content and citations based on available data
                    const content = data.data?.content || streamingMessage?.content || "";
                    const citations = data.data?.citations || [];

                    setMessages(prev => [
                        ...prev,
                        {
                            id: `assistant-${Date.now()}`,
                            role: "assistant",
                            content: content || "",
                            citations: citations,
                            timestamp: new Date()
                        }
                    ]);

                    setStreamingMessage(null);
                    setLoading(false);
                    break;

                case "error":
                    // Handle errors - safely extract error details
                    const errorDetail = data.data?.detail || data.detail || "Onbekende fout";
                    console.error("WebSocket error:", errorDetail);
                    setConnectionError(null); // Clear connection error
                    setMessages(prev => [
                        ...prev,
                        {
                            id: `error-${Date.now()}`,
                            role: "assistant",
                            content: `Er is een fout opgetreden: ${errorDetail}`,
                            timestamp: new Date()
                        }
                    ]);
                    setStreamingMessage(null);
                    setLoading(false);
                    break;

                case "response_chunk":
                    // Support for alternate chunk format
                    const responseChunkContent = data.data?.content || "";
                    const isDone = data.data?.done === true;

                    if (!isDone) {
                        setStreamingMessage(prev => {
                            if (!prev) {
                                return {
                                    id: `assistant-${Date.now()}`,
                                    role: "assistant",
                                    content: responseChunkContent,
                                    timestamp: new Date()
                                };
                            }
                            return {
                                ...prev,
                                content: responseChunkContent
                            };
                        });
                    } else {
                        // Handle completion
                        if (data.data?.thread_id) {
                            // Thread ID processing if needed
                        }

                        setMessages(prev => [
                            ...prev,
                            {
                                id: `assistant-${Date.now()}`,
                                role: "assistant",
                                content: responseChunkContent || "",
                                timestamp: new Date()
                            }
                        ]);

                        setStreamingMessage(null);
                        setLoading(false);
                    }
                    break;

                case "citations":
                    // Handle citations separately
                    // Update the last assistant message to include citations
                    setMessages(prev => {
                        const lastAssistantIndex = [...prev].reverse().findIndex(msg => msg.role === 'assistant');
                        if (lastAssistantIndex === -1) return prev;

                        const actualIndex = prev.length - 1 - lastAssistantIndex;
                        const newMessages = [...prev];
                        newMessages[actualIndex] = {
                            ...newMessages[actualIndex],
                            citations: data.data?.citations
                        };
                        return newMessages;
                    });
                    break;

                default:
                    // Try to handle data even without a recognized type
                    if (data.content) {
                        setMessages(prev => [
                            ...prev,
                            {
                                id: `assistant-${Date.now()}`,
                                role: "assistant",
                                content: data.content || "",
                                timestamp: new Date()
                            }
                        ]);
                        setStreamingMessage(null);
                        setLoading(false);
                    }
                    break;
            }
        } catch (err) {
            console.error("Error parsing WebSocket message:", err);
            if (err instanceof Error) {
                setConnectionError(`Error parsing message: ${err.message}`);
            } else {
                setConnectionError("Error parsing message: Unknown error occurred");
            }
        }
    };

    // Fetch documents and set up initial state when component mounts
    useEffect(() => {
        // Fetch documents and conversation history
        const initializeChat = async () => {
            setLoading(true);
            try {
                // Step 1: Fetch publication details
                const token = await getToken();
                if (!token) {
                    console.error("Failed to get authentication token");
                    setConnectionError("Authentication failed. Please log in again.");
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/publications/publication/${publicationId}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data.documents) {
                        const fileMap: Record<string, FileInfo> = {};
                        Object.keys(data.documents).forEach(key => {
                            fileMap[key] = { name: key };
                        });
                        setAvailableFiles(fileMap);
                    }
                } else {
                    console.error("Failed to fetch publication:", response.status);
                    setConnectionError(`Failed to fetch publication data: ${response.status}`);
                }

                // Step 2: Fetch previous conversation if it exists
                const conversationResponse = await fetch(`${API_BASE_URL}/publications/${publicationId}/conversation`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (conversationResponse.ok) {
                    const conversationData = await conversationResponse.json();

                    if (conversationData && conversationData.messages && conversationData.messages.length > 0) {
                        // Convert backend messages to our message format
                        const previousMessages = conversationData.messages.map((msg: any) => {
                            // Process citations based on format
                            let citations = msg.citations;
                            if (citations && typeof citations === 'string' && citations.includes('\n')) {
                                // If citations is a newline-separated string, split it into an array
                                citations = citations.split('\n').filter((c: string) => c.trim() !== '');
                            }

                            return {
                                id: `${msg.role}-${new Date(msg.created_at).getTime()}`,
                                role: msg.role,
                                content: msg.content,
                                citations: citations, // Use the processed citations
                                timestamp: new Date(msg.created_at)
                            };
                        });

                        setMessages(previousMessages);
                    } else {
                        // If no previous conversation, show welcome message
                        setMessages([{
                            id: "welcome",
                            role: "assistant",
                            content: `Hallo! Ik ben Procy. Ik kan je helpen met het analyseren van deze aanbesteding. Wat wil je graag weten?`,
                            timestamp: new Date()
                        }]);
                    }
                } else {
                    // If error or no previous conversation, show welcome message
                    setMessages([{
                        id: "welcome",
                        role: "assistant",
                        content: `Hallo! Ik ben Procy. Ik kan je helpen met het analyseren van deze aanbesteding. Wat wil je graag weten?`,
                        timestamp: new Date()
                    }]);
                }

                // Step 3: Setup WebSocket
                const connectionSuccess = await setupWebSocket();

                if (!connectionSuccess) {
                    // WebSocket connection failed handling
                }
            } catch (error) {
                console.error("Error initializing chat:", error);
                setConnectionError(`Error initializing chat: ${error instanceof Error ? error.message : "Unknown error"}`);

                // Fall back to welcome message if there's an error
                setMessages([{
                    id: "welcome",
                    role: "assistant",
                    content: `Hallo! Ik ben Procy. Ik kan je helpen met het analyseren van deze aanbesteding. Wat wil je graag weten?`,
                    timestamp: new Date()
                }]);
            } finally {
                setLoading(false);
            }
        };

        initializeChat();

        // Focus input field
        if (inputRef.current) {
            inputRef.current.focus();
        }

        // Cleanup function
        return () => {
            if (websocketRef.current) {
                websocketRef.current.close();
            }
        };
    }, [publicationId, getToken]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, streamingMessage?.content]);

    // Handle sending messages
    const handleSendMessage = async () => {
        if (currentMessage.trim() === "" || loading) return;

        // Add user message to chat
        const userMessageId = `user-${Date.now()}`;
        const userMessageContent = currentMessage;
        setMessages((prev) => [
            ...prev,
            {
                id: userMessageId,
                role: "user",
                content: userMessageContent,
                timestamp: new Date()
            }
        ]);
        setCurrentMessage("");
        setLoading(true);
        setConnectionError(null); // Clear any previous errors

        // Ensure WebSocket connection is active
        if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
            const connectionSuccess = await setupWebSocket();

            if (!connectionSuccess) {
                console.error("Failed to establish WebSocket connection");
                setMessages((prev) => [
                    ...prev,
                    {
                        id: `error-${Date.now()}`,
                        role: "assistant",
                        content: "Kon geen verbinding maken. Probeer het later opnieuw.",
                        timestamp: new Date()
                    }
                ]);
                setLoading(false);
                return;
            }

            // Wait a moment for the connection to fully establish
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Send message through WebSocket
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            try {
                // Format message according to what the backend expects
                const messageObject = {
                    content: userMessageContent
                };

                websocketRef.current.send(JSON.stringify(messageObject));
            } catch (error) {
                console.error("Error sending message:", error);
                setMessages((prev) => [
                    ...prev,
                    {
                        id: `error-${Date.now()}`,
                        role: "assistant",
                        content: `Fout bij het verzenden van bericht: ${error instanceof Error ? error.message : "Onbekende fout"}`,
                        timestamp: new Date()
                    }
                ]);
                setLoading(false);
            }
        } else {
            // WebSocket is not connected
            console.error("WebSocket is not open, cannot send message");
            setMessages((prev) => [
                ...prev,
                {
                    id: `error-${Date.now()}`,
                    role: "assistant",
                    content: "Verbinding verbroken. Probeer het later opnieuw.",
                    timestamp: new Date()
                }
            ]);
            setLoading(false);
        }
    };

    // Handle pressing Enter to send message
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Handle closing the chat
    const handleClose = () => {
        if (websocketRef.current) {
            websocketRef.current.close();
        }
        onClose();
    };

    // Helper function to render citations
    const renderCitations = (citations: string[] | string | undefined) => {
        if (!citations) return null;

        // Handle string citations by splitting them into an array
        const citationsArray = typeof citations === 'string'
            ? citations.split('\n').filter(c => c.trim() !== '')
            : citations;

        return (
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Bronnen:</p>
                <ul className="space-y-1">
                    {citationsArray.map((citation, index) => (
                        <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                            <FileTextIcon size={10} className="mt-1 shrink-0" />
                            <span>{citation}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            margin: 0,
            padding: 0
        }} onClick={handleClose}>
            <div
                ref={chatContainerRef}
                className={`bg-white dark:bg-slate-900 rounded-xl shadow-2xl flex flex-col
                ${fullscreenState
                        ? "w-full h-full max-w-none m-0 rounded-none"
                        : "w-full max-w-4xl h-full sm:h-[85vh] sm:max-h-[800px] m-4"
                    } 
                border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 ease-in-out`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-linear-to-r from-blue-50 to-astral-50 dark:from-slate-800 dark:to-slate-900">
                    <div className="flex items-center gap-2">
                        <div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-xs">
                            <RiChatSmile2Line className="size-5 text-astral-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Procy Chat</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Fullscreen toggle button */}
                        <Button
                            onClick={handleToggleFullscreen}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                            aria-label={fullscreenState ? "Exit fullscreen" : "Enter fullscreen"}
                            variant="ghost"
                        >
                            {fullscreenState
                                ? <RiFullscreenExitLine className="size-5" />
                                : <RiFullscreenLine className="size-5" />
                            }
                        </Button>
                        <Button
                            onClick={handleClose}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                            aria-label="Close chat"
                            variant="ghost"
                        >
                            <RiCloseLine className="size-5" />
                        </Button>
                    </div>
                </div>

                {/* Connection error notification */}
                {connectionError && (
                    <div className="px-4 py-2 bg-red-100 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-300">
                            <span>{connectionError}</span>
                        </div>
                    </div>
                )}

                {/* Available files */}
                {Object.keys(availableFiles).length > 0 && (
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            {Object.values(availableFiles).map((file, index) => (
                                <div key={index} className="flex items-center gap-1 bg-white dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-2 py-1 rounded-full shadow-xs">
                                    <FileTextIcon size={12} />
                                    <span className="truncate max-w-[150px]">{file.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                        >
                            <div
                                className={`max-w-[80%] rounded-xl p-4 shadow-xs ${message.role === "user"
                                    ? "bg-astral-600 text-white"
                                    : "bg-white dark:bg-slate-800 text-gray-800 dark:text-white"
                                    }`}
                            >
                                <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>

                                {/* Citations */}
                                {renderCitations(message.citations)}

                                <div className="mt-1 text-right">
                                    <span className="text-xs opacity-70">
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Streaming message (showing real-time response) */}
                    {streamingMessage && (
                        <div
                            className="flex justify-start animate-fadeIn"
                        >
                            <div className="max-w-[80%] rounded-xl p-4 shadow-xs bg-white dark:bg-slate-800 text-gray-800 dark:text-white">
                                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                    {streamingMessage.content}
                                    <span className="inline-block w-2 h-4 ml-1 bg-astral-500 animate-pulse"></span>
                                </div>
                                <div className="mt-1 text-right">
                                    <span className="text-xs opacity-70">
                                        {streamingMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading && !streamingMessage && (
                        <div className="flex items-start animate-fadeIn">
                            <div className="rounded-xl px-4 py-3 bg-white dark:bg-slate-800 shadow-xs">
                                <div className="flex items-center gap-2">
                                    <LoaderIcon size={16} className="animate-spin text-astral-600" />
                                    <span className="text-sm text-gray-800 dark:text-gray-200">Procy is aan het denken...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input container */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
                    <div className="flex gap-2">
                        <textarea
                            ref={inputRef}
                            className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-hidden focus:ring-2 focus:ring-astral-500 dark:bg-slate-800 dark:text-white resize-none shadow-xs transition-all"
                            placeholder="Stel een vraag over deze aanbesteding..."
                            rows={2}
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={loading || currentMessage.trim() === ""}
                            className={`h-auto flex items-center justify-center transition-all duration-200 ${loading || currentMessage.trim() === ""
                                ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-70"
                                : "bg-astral-600 hover:bg-astral-700 dark:bg-astral-600 dark:hover:bg-astral-700 shadow-md hover:shadow-lg"
                                } text-white p-3 rounded-lg`}
                        >
                            <SendIcon size={20} />
                        </Button>
                    </div>

                    {/* Suggestion buttons */}
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <p>Suggesties:</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {[
                                "Samenvatting van deze aanbesteding",
                                "Wat is de deadline?",
                                "Wat zijn de belangrijkste vereisten?",
                                "Is dit geschikt voor mijn bedrijf?"
                            ].map((suggestion, index) => (
                                <button
                                    key={index}
                                    className="bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors shadow-xs hover:shadow-sm text-gray-700 dark:text-gray-300"
                                    onClick={() => {
                                        setCurrentMessage(suggestion);
                                        if (inputRef.current) {
                                            inputRef.current.focus();
                                        }
                                    }}
                                    disabled={loading}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}