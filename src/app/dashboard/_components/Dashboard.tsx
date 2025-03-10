"use client"
import { siteConfig } from "@/app/siteConfig";
import { Button } from "@/components/Button";
import { Toaster } from '@/components/Toaster';
import { Loader } from "@/components/ui/PageLoad";
import { useToast } from '@/lib/useToast';
import { useAuth } from "@clerk/nextjs";
import {
    AlertTriangleIcon,
    BellIcon,
    BellOffIcon,
    BellRingIcon,
    CalendarIcon,
    CheckIcon,
    ChevronRightIcon,
    ClockIcon,
    MailOpenIcon,
    MessageSquareIcon,
    RefreshCcwIcon,
    StarIcon,
    TrashIcon,
    UserIcon
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState } from "react";

const API_BASE_URL = siteConfig.api_base_url;

interface Message {
    id: string;
    title: string;
    content: string;
    created_at: string;
    is_read: boolean;
    type: 'recommendation' | 'deadline' | 'system' | 'forum' | 'account';
    link: string;
    related_entity_id: string | null;
}

interface InboxListProps {
    initialMessages: Message[];
    fetchError: string | null;
}

export default function InboxList({ initialMessages, fetchError }: InboxListProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages || []);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<string>('all');
    const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
    const { getToken } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    // Filter messages based on current filter
    const filteredMessages = messages.filter(message => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !message.is_read;
        return message.type === filter;
    });

    // Calculate stats
    const stats = {
        all: messages.length,
        unread: messages.filter(msg => !msg.is_read).length,
        recommendation: messages.filter(msg => msg.type === 'recommendation').length,
        deadline: messages.filter(msg => msg.type === 'deadline').length,
        system: messages.filter(msg => msg.type === 'system').length,
        forum: messages.filter(msg => msg.type === 'forum').length,
        account: messages.filter(msg => msg.type === 'account').length
    };

    // Format date for display
    const formatMessageDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();

        // Check if same day
        if (date.toDateString() === now.toDateString()) {
            return `Vandaag ${date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`;
        }

        // Check if yesterday
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return `Gisteren ${date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`;
        }

        // Otherwise, return full date
        return date.toLocaleDateString('nl-NL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get icon for message type
    const getMessageIcon = (type: string, isRead: boolean) => {
        switch (type) {
            case 'recommendation':
                return <StarIcon size={18} className="text-amber-500" />;
            case 'deadline':
                return <ClockIcon size={18} className="text-red-500" />;
            case 'system':
                return <BellRingIcon size={18} className="text-blue-500" />;
            case 'forum':
                return <MessageSquareIcon size={18} className="text-green-500" />;
            case 'account':
                return <UserIcon size={18} className="text-purple-500" />;
            default:
                return isRead ?
                    <MailOpenIcon size={18} className="text-gray-400" /> :
                    <BellIcon size={18} className="text-astral-500" />;
        }
    };

    // Toggle message selection
    const toggleSelectMessage = (id: string) => {
        const newSelected = new Set(selectedMessages);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedMessages(newSelected);
    };

    // Select/deselect all filtered messages
    const toggleSelectAll = () => {
        if (selectedMessages.size === filteredMessages.length) {
            // Deselect all
            setSelectedMessages(new Set());
        } else {
            // Select all filtered messages
            const newSelected = new Set<string>();
            filteredMessages.forEach(msg => newSelected.add(msg.id));
            setSelectedMessages(newSelected);
        }
    };

    // Mark selected messages as read
    const markAsRead = async () => {
        if (selectedMessages.size === 0) return;

        setIsLoading(true);
        try {
            // Here you would make API call to mark messages as read
            // const token = await getToken();
            // await fetch(`${API_BASE_URL}/messages/mark-read`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`
            //     },
            //     body: JSON.stringify({ message_ids: Array.from(selectedMessages) })
            // });

            // For demo purposes, update state directly
            const updatedMessages = messages.map(msg =>
                selectedMessages.has(msg.id) ? { ...msg, is_read: true } : msg
            );
            setMessages(updatedMessages);
            setSelectedMessages(new Set());

            toast({
                title: "Berichten gemarkeerd als gelezen",
                variant: "success"
            });
        } catch (error) {
            toast({
                title: "Fout bij markeren als gelezen",
                description: "Er is een fout opgetreden. Probeer het later opnieuw.",
                variant: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Delete selected messages
    const deleteMessages = async () => {
        if (selectedMessages.size === 0) return;

        setIsLoading(true);
        try {
            // Here you would make API call to delete messages
            // const token = await getToken();
            // await fetch(`${API_BASE_URL}/messages/delete`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`
            //     },
            //     body: JSON.stringify({ message_ids: Array.from(selectedMessages) })
            // });

            // For demo purposes, update state directly
            const updatedMessages = messages.filter(msg => !selectedMessages.has(msg.id));
            setMessages(updatedMessages);
            setSelectedMessages(new Set());

            toast({
                title: "Berichten verwijderd",
                variant: "success"
            });
        } catch (error) {
            toast({
                title: "Fout bij verwijderen",
                description: "Er is een fout opgetreden. Probeer het later opnieuw.",
                variant: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle message click - navigate to link
    const handleMessageClick = (message: Message) => {
        // If not already read, mark as read
        if (!message.is_read) {
            const updatedMessages = messages.map(msg =>
                msg.id === message.id ? { ...msg, is_read: true } : msg
            );
            setMessages(updatedMessages);

            // Here you would make API call to mark as read
            // const markAsRead = async () => {
            //     const token = await getToken();
            //     await fetch(`${API_BASE_URL}/messages/${message.id}/read`, {
            //         method: 'POST',
            //         headers: {
            //             'Authorization': `Bearer ${token}`
            //         }
            //     });
            // };
            // markAsRead().catch(console.error);
        }

        // Navigate to linked resource
        if (message.link) {
            router.push(message.link);
        }
    };

    // Refresh messages
    const refreshMessages = async () => {
        setIsLoading(true);
        try {
            // Here you would fetch fresh messages from API
            // const token = await getToken();
            // const response = await fetch(`${API_BASE_URL}/messages/`, {
            //     headers: {
            //         'Authorization': `Bearer ${token}`
            //     }
            // });
            // const data = await response.json();
            // setMessages(data.items);

            // For demo purposes, just simulate a refresh
            setTimeout(() => {
                toast({
                    title: "Berichten bijgewerkt",
                    variant: "success"
                });
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            toast({
                title: "Fout bij vernieuwen",
                description: "Kon berichten niet ophalen. Probeer het later opnieuw.",
                variant: "error"
            });
            setIsLoading(false);
        }
    };

    return (
        <>
            <Toaster />
            <div className="space-y-6">
                {/* Filters and actions */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    onClick={() => setFilter('all')}
                                    variant={filter === 'all' ? "primary" : "secondary"}
                                    className={`px-3 py-1.5 text-xs rounded-full ${filter === 'all' ? 'bg-astral-500' : ''}`}
                                >
                                    <BellIcon size={14} className="mr-1" />
                                    Alle berichten
                                    {stats.all > 0 && <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full">{stats.all}</span>}
                                </Button>
                                <Button
                                    onClick={() => setFilter('unread')}
                                    variant={filter === 'unread' ? "primary" : "secondary"}
                                    className={`px-3 py-1.5 text-xs rounded-full ${filter === 'unread' ? 'bg-astral-500' : ''}`}
                                >
                                    <BellOffIcon size={14} className="mr-1" />
                                    Ongelezen
                                    {stats.unread > 0 && <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full">{stats.unread}</span>}
                                </Button>
                                <Button
                                    onClick={() => setFilter('recommendation')}
                                    variant={filter === 'recommendation' ? "primary" : "secondary"}
                                    className={`px-3 py-1.5 text-xs rounded-full ${filter === 'recommendation' ? 'bg-astral-500' : ''}`}
                                >
                                    <StarIcon size={14} className="mr-1" />
                                    Aanbevelingen
                                    {stats.recommendation > 0 && <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full">{stats.recommendation}</span>}
                                </Button>
                                <Button
                                    onClick={() => setFilter('deadline')}
                                    variant={filter === 'deadline' ? "primary" : "secondary"}
                                    className={`px-3 py-1.5 text-xs rounded-full ${filter === 'deadline' ? 'bg-astral-500' : ''}`}
                                >
                                    <CalendarIcon size={14} className="mr-1" />
                                    Deadlines
                                    {stats.deadline > 0 && <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full">{stats.deadline}</span>}
                                </Button>
                            </div>

                            {/* Bulk actions */}
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={refreshMessages}
                                    disabled={isLoading}
                                    variant="ghost"
                                    className="px-2 py-1.5 text-xs"
                                >
                                    <RefreshCcwIcon size={14} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                                    Vernieuwen
                                </Button>
                                <Button
                                    onClick={markAsRead}
                                    disabled={isLoading || selectedMessages.size === 0}
                                    variant="ghost"
                                    className="px-2 py-1.5 text-xs"
                                >
                                    <CheckIcon size={14} className="mr-1" />
                                    Markeer als gelezen
                                </Button>
                                <Button
                                    onClick={deleteMessages}
                                    disabled={isLoading || selectedMessages.size === 0}
                                    variant="ghost"
                                    className="px-2 py-1.5 text-xs text-red-500 hover:text-red-600"
                                >
                                    <TrashIcon size={14} className="mr-1" />
                                    Verwijderen
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Message list */}
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {isLoading ? (
                            <div className="py-8">
                                <Loader loadingtext={"Berichten laden..."} size={32} />
                            </div>
                        ) : fetchError ? (
                            <div className="p-6 text-center">
                                <AlertTriangleIcon size={32} className="mx-auto text-amber-500 mb-4" />
                                <h3 className="text-lg font-medium mb-2">Fout bij laden</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">{fetchError}</p>
                                <Button
                                    onClick={refreshMessages}
                                    className="mx-auto"
                                >
                                    <RefreshCcwIcon size={16} className="mr-2" />
                                    Probeer opnieuw
                                </Button>
                            </div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="p-6 text-center">
                                <MailOpenIcon size={32} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium mb-2">Geen berichten gevonden</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {filter === 'all'
                                        ? 'U heeft geen berichten in uw inbox.'
                                        : `U heeft geen berichten in de categorie '${filter}'.`}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Select all header */}
                                <div className="flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                                    <div className="w-6 shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={selectedMessages.size === filteredMessages.length && filteredMessages.length > 0}
                                            onChange={toggleSelectAll}
                                            className="h-4 w-4 rounded border-gray-300 text-astral-600"
                                        />
                                    </div>
                                    <div className="ml-3 text-xs font-medium text-gray-500">
                                        {selectedMessages.size > 0
                                            ? `${selectedMessages.size} geselecteerd`
                                            : 'Selecteer alles'}
                                    </div>
                                </div>

                                {filteredMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex items-start px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${!message.is_read ? 'bg-astral-50 dark:bg-astral-900/10' : ''}`}
                                    >
                                        <div className="w-6 mt-1 shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={selectedMessages.has(message.id)}
                                                onChange={() => toggleSelectMessage(message.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="h-4 w-4 rounded border-gray-300 text-astral-600"
                                            />
                                        </div>
                                        <div
                                            className="ml-3 flex-1 min-w-0"
                                            onClick={() => handleMessageClick(message)}
                                        >
                                            {/* Message header */}
                                            <div className="flex flex-wrap justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    {/* Type icon */}
                                                    <div className="shrink-0">
                                                        {getMessageIcon(message.type, message.is_read)}
                                                    </div>

                                                    {/* Title */}
                                                    <h3 className={`text-sm font-medium ${message.is_read ? 'text-gray-900 dark:text-gray-200' : 'text-astral-900 dark:text-astral-100 font-semibold'}`}>
                                                        {message.title}
                                                    </h3>

                                                    {/* Unread indicator */}
                                                    {!message.is_read && (
                                                        <span className="inline-block w-2 h-2 bg-astral-500 rounded-full"></span>
                                                    )}
                                                </div>

                                                {/* Date */}
                                                <div className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                                                    {formatMessageDate(message.created_at)}
                                                </div>
                                            </div>

                                            {/* Message content */}
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                {message.content}
                                            </p>

                                            {/* Link indicator */}
                                            <div className="flex items-center justify-end">
                                                <span className="text-xs text-astral-600 dark:text-astral-400 flex items-center">
                                                    Bekijk details
                                                    <ChevronRightIcon size={14} className="ml-1" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}