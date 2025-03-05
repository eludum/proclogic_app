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
    citations?: string[];
    timestamp: Date;
}

interface ChatComponentProps {
    publicationId: string;
    onClose: () => void;
    isFullscreen?: boolean;
    toggleFullscreen?: () => void;
}

export default function ChatComponent({ publicationId, onClose, isFullscreen = false, toggleFullscreen }: ChatComponentProps) {
    const { getToken } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [threadId, setThreadId] = useState<string | null>(null);
    const [availableFiles, setAvailableFiles] = useState<Record<string, { name: string }>>({});
    const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
    const [localIsFullscreen, setLocalIsFullscreen] = useState(false);
    const [connectionEstablished, setConnectionEstablished] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const websocketRef = useRef<WebSocket | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Determine which fullscreen state and toggle function to use
    const fullscreenState = toggleFullscreen ? isFullscreen : localIsFullscreen;
    const handleToggleFullscreen = toggleFullscreen || (() => setLocalIsFullscreen(prev => !prev));

    // Setup WebSocket when component mounts
    useEffect(() => {
        let reconnectTimeout: NodeJS.Timeout;

        const setupWebSocket = async () => {
            try {
                const token = await getToken();
                if (!token) {
                    console.error("No authentication token available");
                    return;
                }

                // Close existing connection if any
                if (websocketRef.current) {
                    websocketRef.current.close();
                }

                // Create new WebSocket connection
                const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsUrl = `${wsProtocol}//${API_BASE_URL.replace(/^https?:\/\//, '')}/ws/conversation`;
                console.log(`Connecting to WebSocket at: ${wsUrl}`);

                websocketRef.current = new WebSocket(wsUrl);

                websocketRef.current.onopen = () => {
                    console.log("WebSocket connection established");

                    // Send initial connection message with required parameters
                    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
                        const connectionMessage = {
                            type: "connect",
                            data: {
                                publication_workspace_id: publicationId,
                                thread_id: threadId,
                                token: token
                            }
                        };

                        console.log("Sending connection message:", connectionMessage);
                        websocketRef.current.send(JSON.stringify(connectionMessage));
                        setConnectionEstablished(true);
                    }
                };

                websocketRef.current.onmessage = (event) => {
                    console.log("Received WebSocket message:", event.data);
                    try {
                        const data = JSON.parse(event.data);

                        switch (data.type) {
                            case "response_chunk":
                                // Handle streaming chunks of response
                                if (!data.data.done) {
                                    setStreamingMessage(prev => {
                                        if (!prev) {
                                            return {
                                                id: `assistant-${Date.now()}`,
                                                role: "assistant",
                                                content: data.data.content || "",
                                                timestamp: new Date()
                                            };
                                        }
                                        return {
                                            ...prev,
                                            content: data.data.content || prev.content
                                        };
                                    });
                                }
                                break;

                            case "response_complete":
                                // Handle complete response
                                if (data.data.thread_id) {
                                    setThreadId(data.data.thread_id);
                                }

                                setMessages(prev => [
                                    ...prev,
                                    {
                                        id: `assistant-${Date.now()}`,
                                        role: "assistant",
                                        content: data.data.content,
                                        timestamp: new Date()
                                    }
                                ]);

                                setStreamingMessage(null);
                                setLoading(false);
                                break;

                            case "citations":
                                // Handle citations
                                setMessages(prev => {
                                    // Get the last assistant message
                                    const lastAssistantIndex = [...prev].reverse().findIndex(msg => msg.role === 'assistant');
                                    if (lastAssistantIndex === -1) return prev;

                                    const actualIndex = prev.length - 1 - lastAssistantIndex;
                                    const newMessages = [...prev];
                                    newMessages[actualIndex] = {
                                        ...newMessages[actualIndex],
                                        citations: data.data.citations
                                    };
                                    return newMessages;
                                });
                                break;

                            case "error":
                                // Handle errors
                                console.error("WebSocket error:", data.data.detail);
                                setMessages(prev => [
                                    ...prev,
                                    {
                                        id: `error-${Date.now()}`,
                                        role: "assistant",
                                        content: `Er is een fout opgetreden: ${data.data.detail}`,
                                        timestamp: new Date()
                                    }
                                ]);
                                setStreamingMessage(null);
                                setLoading(false);
                                break;

                            default:
                                console.log("Unhandled message type:", data.type);
                                break;
                        }
                    } catch (err) {
                        console.error("Error parsing WebSocket message:", err);
                    }
                };

                websocketRef.current.onerror = (event) => {
                    // The error event itself doesn't contain much useful information
                    // Just log that an error occurred
                    console.log("WebSocket connection error occurred");
                    setConnectionEstablished(false);
                    setMessages(prev => [
                        ...prev,
                        {
                            id: `error-${Date.now()}`,
                            role: "assistant",
                            content: "Er is een fout opgetreden bij de verbinding. Probeer het later opnieuw.",
                            timestamp: new Date()
                        }
                    ]);
                    setLoading(false);
                };

                websocketRef.current.onclose = (event) => {
                    console.log(`WebSocket connection closed: code=${event.code}`);
                    setConnectionEstablished(false);

                    // Attempt to reconnect after a delay
                    reconnectTimeout = setTimeout(() => {
                        if (document.visibilityState !== 'hidden') {
                            setupWebSocket();
                        }
                    }, 3000);
                };
            } catch (error) {
                console.error("Error setting up WebSocket:", error);
            }
        };

        // When component mounts, try to get the list of documents from the publication first
        const fetchDocuments = async () => {
            try {
                const token = await getToken();
                if (!token) return;

                // Get publication details which includes documents
                const response = await fetch(`${API_BASE_URL}/publications/publication/${publicationId}/`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const publicationData = await response.json();
                    // If documents exists in the publication data, use it
                    if (publicationData.documents) {
                        const fileMap: Record<string, { name: string }> = {};
                        Object.keys(publicationData.documents).forEach(key => {
                            fileMap[key] = { name: key };
                        });
                        setAvailableFiles(fileMap);
                    }
                }
            } catch (error) {
                console.error("Error fetching documents:", error);
            }
        };

        // Set up WebSocket and fetch documents
        setupWebSocket();
        fetchDocuments();

        // Add welcome message
        setMessages([
            {
                id: "welcome",
                role: "assistant",
                content: `Hallo! Ik ben ProcLogic AI. Ik kan je helpen met het analyseren van deze aanbesteding. Wat wil je graag weten?`,
                timestamp: new Date()
            }
        ]);

        // Focus input field
        if (inputRef.current) {
            inputRef.current.focus();
        }

        // Cleanup function for when component unmounts
        return () => {
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
            handleCleanup();
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
        setMessages((prev) => [
            ...prev,
            {
                id: userMessageId,
                role: "user",
                content: currentMessage,
                timestamp: new Date()
            }
        ]);
        setCurrentMessage("");
        setLoading(true);

        // Send message through WebSocket
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            websocketRef.current.send(JSON.stringify({
                type: "message",
                data: {
                    content: currentMessage
                }
            }));
        } else {
            // WebSocket is not connected, try to reconnect
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

    // Cleanup resources
    const handleCleanup = async () => {
        try {
            // Close WebSocket connection
            if (websocketRef.current) {
                websocketRef.current.close();
                websocketRef.current = null;
            }

            // Abort any in-progress HTTP requests
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }

            // If we have a thread ID, call endpoint to clean up the thread
            if (threadId) {
                const token = await getToken();
                if (token) {
                    await fetch(`${API_BASE_URL}/conversation/${publicationId}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Error cleaning up conversation:", error);
        }
    };

    // Handle closing the chat
    const handleClose = () => {
        handleCleanup();
        onClose();
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
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900">
                    <div className="flex items-center gap-2">
                        <div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm">
                            <RiChatSmile2Line className="size-5 text-emerald-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">ProcLogic AI Chat</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Connection indicator */}
                        <div className={`w-3 h-3 rounded-full ${connectionEstablished ? 'bg-green-500' : 'bg-red-500'}`} title={connectionEstablished ? 'Verbinding actief' : 'Verbinding verbroken'}></div>
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

                {/* Available files */}
                {Object.keys(availableFiles).length > 0 && (
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-medium text-blue-700 dark:text-blue-300">Beschikbare documenten:</span>
                            {Object.values(availableFiles).map((file, index) => (
                                <div key={index} className="flex items-center gap-1 bg-white dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-2 py-1 rounded-full shadow-sm">
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
                                className={`max-w-[80%] rounded-xl p-4 shadow-sm ${message.role === "user"
                                    ? "bg-blue-600 text-white"
                                    : "bg-white dark:bg-slate-800 text-gray-800 dark:text-white"
                                    }`}
                            >
                                <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>

                                {/* Citations */}
                                {message.citations && message.citations.length > 0 && (
                                    <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Bronnen:</p>
                                        <ul className="space-y-1">
                                            {message.citations.map((citation, index) => (
                                                <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                                                    <FileTextIcon size={10} className="mt-1 flex-shrink-0" />
                                                    <span>{citation}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

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
                            <div className="max-w-[80%] rounded-xl p-4 shadow-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white">
                                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                    {streamingMessage.content}
                                    <span className="inline-block w-2 h-4 ml-1 bg-emerald-500 animate-pulse"></span>
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
                            <div className="rounded-xl px-4 py-3 bg-white dark:bg-slate-800 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <LoaderIcon size={16} className="animate-spin text-emerald-600" />
                                    <span className="text-sm text-gray-800 dark:text-gray-200">ProcLogic AI is aan het denken...</span>
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
                            className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white resize-none shadow-sm transition-all"
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
                                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-md hover:shadow-lg"
                                } text-white p-3 rounded-lg`}
                        >
                            <SendIcon size={20} />
                        </Button>
                    </div>

                    {/* Assistant capabilities */}
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
                                    className="bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors shadow-sm hover:shadow text-gray-700 dark:text-gray-300"
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