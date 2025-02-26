"use client"

import { siteConfig } from "@/app/siteConfig";
import { Button } from "@/components/Button";
import { RiChatSmile2Line, RiCloseLine } from "@remixicon/react";
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
}

export default function ChatComponent({ publicationId, onClose }: ChatComponentProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [threadId, setThreadId] = useState<string | null>(null);
    const [availableFiles, setAvailableFiles] = useState<Record<string, { name: string }>>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Fetch available files when component mounts
    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/publications/${publicationId}/files`);
                if (response.ok) {
                    const files = await response.json();
                    setAvailableFiles(files);
                }
            } catch (error) {
                console.error("Error fetching files:", error);
            }
        };

        fetchFiles();

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
    }, [publicationId]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

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

        try {
            // Call the conversation API
            const response = await fetch(`${API_BASE_URL}/conversation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    publication_id: publicationId,
                    message: currentMessage,
                    thread_id: threadId
                })
            });

            if (!response.ok) {
                throw new Error("Error getting response");
            }

            const data = await response.json();

            // Save thread ID for future messages
            setThreadId(data.thread_id);

            // Add assistant response to chat
            setMessages((prev) => [
                ...prev,
                {
                    id: `assistant-${Date.now()}`,
                    role: "assistant",
                    content: data.response,
                    citations: data.citations,
                    timestamp: new Date()
                }
            ]);
        } catch (error) {
            console.error("Error sending message:", error);
            // Add error message
            setMessages((prev) => [
                ...prev,
                {
                    id: `error-${Date.now()}`,
                    role: "assistant",
                    content: "Er is een fout opgetreden bij het verwerken van uw verzoek. Probeer het later opnieuw.",
                    timestamp: new Date()
                }
            ]);
        } finally {
            setLoading(false);
            // Focus input field after response
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    };

    // Handle pressing Enter to send message
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Cleanup when chat is closed
    const handleClose = async () => {
        try {
            if (threadId) {
                // Call the end conversation API
                await fetch(`${API_BASE_URL}/conversation/${publicationId}`, {
                    method: "DELETE"
                });
            }
        } catch (error) {
            console.error("Error ending conversation:", error);
        } finally {
            // Always call onClose, even if API call fails
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
            <div
                className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl flex flex-col w-full max-w-4xl h-full sm:h-[85vh] sm:max-h-[800px] m-4 border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-200 ease-in-out"
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
                    <Button
                        onClick={handleClose}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                        aria-label="Close chat"
                    >
                        <RiCloseLine className="size-5" />
                    </Button>
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
                    {loading && (
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