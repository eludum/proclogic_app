"use client"
import { siteConfig } from "@/app/siteConfig";
import { Button } from "@/components/Button";
import { Loader } from "@/components/ui/PageLoad";
import { formatDate } from "@/lib/publicationUtils";
import { useAuth } from "@clerk/nextjs";
import { RiChatSmile2Line } from '@remixicon/react';
import { ClockIcon, MessageCircleIcon } from 'lucide-react';
import { useEffect, useState } from "react";
import ChatComponent from "../../publications/_components/ChatComponent";

const API_BASE_URL = siteConfig.api_base_url;

export default function ConversationsList() {
    const [activeConversation, setActiveConversation] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getToken } = useAuth();

    // Fetch conversations
    const fetchConversations = async () => {
        setLoading(true);
        try {
            const token = await await getToken();

            const response = await fetch(`${API_BASE_URL}/conversations/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            // Sort conversations by updated_at (newest first)
            const sortedConversations = data.sort((a, b) =>
                new Date(b.updated_at) - new Date(a.updated_at)
            );
            setConversations(sortedConversations);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Load conversations on component mount
    useEffect(() => {
        fetchConversations();
    }, []);

    // Open chat with a conversation
    const openChat = (conversation) => {
        setActiveConversation(conversation);
    };

    // Format date for display
    const formatConversationDate = (dateString) => {
        const date = new Date(dateString);
        return formatDate(date);
    };

    // Calculate time since update
    const getTimeSince = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                return `${diffMinutes} minuten geleden`;
            }
            return `${diffHours} uur geleden`;
        } else if (diffDays === 1) {
            return 'gisteren';
        } else if (diffDays < 7) {
            return `${diffDays} dagen geleden`;
        } else {
            return formatConversationDate(dateString);
        }
    };

    return (
        <>
            <div className="space-y-6">
                {loading ? (
                    <Loader loadingtext={"Laden..."} size={32} />

                ) : error ? (
                    <div className="text-center py-6">
                        <p className="text-red-500">Fout bij het laden van gesprekken: {error}</p>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-6 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 p-6">
                        <RiChatSmile2Line className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Geen gesprekken gevonden</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            U heeft nog geen gesprekken gevoerd met ProcLogic AI. Start een nieuw gesprek via een aanbesteding.
                        </p>
                    </div>
                ) : (
                    conversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900"
                        >
                            {/* We've removed the header bar */}

                            {/* Content */}
                            <div className="p-4 flex flex-col gap-3">
                                {/* Title and time since */}
                                <div className="flex flex-wrap items-start justify-between gap-2 w-full">
                                    <h3 className="text-base font-semibold leading-tight ">
                                        <a
                                            href={`/publications/detail/${conversation.publication_workspace_id}`}
                                            target="_blank"
                                            className="text-base sm:text-lg font-semibold leading-tight break-words flex-1 min-w-0 hover:underline focus:outline-hidden line-clamp-1"
                                            title={conversation.publication_title}
                                        >
                                            {conversation.publication_title}
                                        </a></h3>
                                    <div className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                        <MessageCircleIcon size={12} />
                                        <span>{conversation.message_count} berichten</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        <a
                                            href={`/publications/detail/${conversation.publication_workspace_id}`}
                                            target="_blank"
                                            className="hover:underline focus:outline-hidden"
                                            title={conversation.publication_workspace_id}
                                        >
                                            ID: {conversation.publication_workspace_id}
                                        </a>
                                    </div>
                                    <div className="flex items-center shrink-0 gap-1 text-xs text-gray-500 dark:text-gray-400">
                                        <ClockIcon size={12} />
                                        <span>{getTimeSince(conversation.updated_at)}</span>
                                    </div>
                                </div>

                                {/* Message preview */}
                                {conversation.last_message_preview && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md border-l-2 border-slate-300 dark:border-slate-700">
                                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words whitespace-normal italic">
                                            "{conversation.last_message_preview}"
                                        </p>
                                    </div>
                                )}

                                {/* Action button */}
                                <Button
                                    onClick={() => openChat(conversation)}
                                    className="px-4 py-2 gap-1"
                                    variant="primary"
                                >
                                    <RiChatSmile2Line size={16} />
                                    <span> Gesprek voortzetten</span>
                                </Button>
                            </div>
                        </div>
                    ))
                )}

                {/* Chat dialog */}
                {activeConversation && (
                    <ChatComponent
                        publicationId={activeConversation.publication_workspace_id}
                        conversationId={activeConversation.id}
                        onClose={() => {
                            setActiveConversation(null);
                            fetchConversations();
                        }}
                    />
                )}
            </div >
        </>
    );
}