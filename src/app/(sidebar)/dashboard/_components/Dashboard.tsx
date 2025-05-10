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
import { useEffect, useState } from "react";
import { Pagination } from "../../publications/_components/Pagination";

const API_BASE_URL = siteConfig.api_base_url;

interface Notification {
    id: string;
    title: string;
    content: string;
    created_at: string;
    is_read: boolean;
    notification_type: 'recommendation' | 'deadline' | 'system' | 'forum' | 'account';
    link: string;
    related_entity_id: string | null;
}

interface PaginationState {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
}

interface InboxListProps {
    initialNotifications: Notification[];
    fetchError: string | null;
    totalNotifications?: number;
    unreadNotifications?: number;
    currentPage?: number;
    totalPages?: number;
}

export default function InboxList({ 
    initialNotifications, 
    fetchError, 
    totalNotifications = 0,
    unreadNotifications = 0,
    currentPage = 1,
    totalPages = 1
}: InboxListProps) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications || []);
    const [isLoading, setIsLoading] = useState(false);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false); // Separate loading state for pagination
    const [filter, setFilter] = useState<string>('all');
    const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
    
    // Default page size to 10 (can be adjusted)
    const PAGE_SIZE = 10;
    
    const [pagination, setPagination] = useState<PaginationState>({
        page: currentPage,
        pageSize: PAGE_SIZE,
        total: totalNotifications,
        pages: Math.ceil(totalNotifications / PAGE_SIZE) || 1
    });

    // Filtered stats for different categories
    const [stats, setStats] = useState({
        all: totalNotifications,
        unread: unreadNotifications,
        recommendation: 0,
        deadline: 0,
        system: 0,
        forum: 0,
        account: 0
    });
    
    const { getToken } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    // Filter notifications based on current filter
    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.is_read;
        return notification.notification_type === filter;
    });

    // Update pagination based on filtered items
    useEffect(() => {
        if (filter === 'all') {
            // For 'all' filter, use the original pagination data
            setPagination(prev => ({
                ...prev,
                total: totalNotifications,
                pages: Math.ceil(totalNotifications / PAGE_SIZE) || 1
            }));
        } else {
            // For other filters, calculate based on filtered count
            const filteredCount = filteredNotifications.length;
            setPagination(prev => ({
                ...prev,
                page: 1, // Reset to first page when filter changes
                total: filteredCount, 
                pages: Math.ceil(filteredCount / PAGE_SIZE) || 1
            }));
        }
    }, [filter, filteredNotifications.length, totalNotifications]);

    // Calculate stats for each category
    useEffect(() => {
        const newStats = {
            all: totalNotifications,
            unread: notifications.filter(msg => !msg.is_read).length,
            recommendation: notifications.filter(msg => msg.notification_type === 'recommendation').length,
            deadline: notifications.filter(msg => msg.notification_type === 'deadline').length,
            system: notifications.filter(msg => msg.notification_type === 'system').length,
            forum: notifications.filter(msg => msg.notification_type === 'forum').length,
            account: notifications.filter(msg => msg.notification_type === 'account').length
        };
        setStats(newStats);
    }, [notifications, totalNotifications]);

    // Convert page number to offset for API calls
    const pageToOffset = (page: number) => {
        return (page - 1) * pagination.pageSize;
    };
    
    // Load notifications with pagination and filters
    const loadNotifications = async (page = 1, filterType = filter) => {
        setIsLoading(true);
        try {
            const token = await getToken();
            const params = new URLSearchParams();
            
            // Calculate offset from page number
            const offset = pageToOffset(page);
            
            // Add pagination parameters using limit/offset
            params.append('limit', pagination.pageSize.toString());
            params.append('offset', offset.toString());
            
            // Add filter parameters (if API supports this)
            if (filterType !== 'all') {
                if (filterType === 'unread') {
                    params.append('unread', 'true');
                } else {
                    params.append('type', filterType);
                }
            }
            
            const response = await fetch(`${API_BASE_URL}/notifications/?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.items || []);
                
                // Update pagination state with server-provided values
                const totalPages = Math.ceil(data.total / pagination.pageSize) || 1;
                setPagination({
                    page: page,
                    pageSize: pagination.pageSize,
                    total: data.total || 0,
                    pages: totalPages
                });
            } else {
                console.error('Failed to fetch notifications:', await response.text());
                toast({
                    title: "Fout bij laden",
                    description: "De berichten konden niet worden geladen. Probeer het later opnieuw.",
                    variant: "error"
                });
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast({
                title: "Fout bij laden",
                description: "Er is een fout opgetreden bij het laden van berichten.",
                variant: "error"
            });
        } finally {
            setIsLoading(false);
            setIsPaginationLoading(false);
        }
    };

    // Load notifications when filter changes
    useEffect(() => {
        if (filter !== 'all') {
            // Only make a new API call if we're not showing "all" 
            loadNotifications(1, filter);
        }
    }, [filter]);

    // Handle page change from pagination component
    const handlePageChange = (newPage: number) => {
        if (newPage !== pagination.page) {
            setIsPaginationLoading(true); // Set pagination-specific loading
            setPagination(prev => ({
                ...prev,
                page: newPage
            }));
            
            loadNotifications(newPage, filter);
        }
    };

    // Calculate current items to show based on pagination
    const getCurrentItems = () => {
        if (filter === 'all') {
            // For server-side pagination
            return filteredNotifications;
        } else {
            // For client-side pagination
            const startIndex = (pagination.page - 1) * pagination.pageSize;
            const endIndex = startIndex + pagination.pageSize;
            return filteredNotifications.slice(startIndex, endIndex);
        }
    };

    const currentItems = getCurrentItems();

    // Format date for display
    const formatNotificationDate = (dateString: string) => {
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

    // Get icon for notification type
    const getNotificationIcon = (notification_type: string, isRead: boolean) => {
        if (isRead) {
            return <MailOpenIcon size={18} className="text-gray-400" />
        }
        switch (notification_type) {
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
                return <BellIcon size={18} className="text-astral-500" />;
        }
    };

    // Toggle notification selection
    const toggleSelectNotification = (id: string) => {
        const newSelected = new Set(selectedNotifications);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedNotifications(newSelected);
    };

    // Select/deselect all filtered notifications
    const toggleSelectAll = () => {
        if (selectedNotifications.size === currentItems.length) {
            // Deselect all
            setSelectedNotifications(new Set());
        } else {
            // Select all currently visible notifications
            const newSelected = new Set<string>();
            currentItems.forEach(msg => newSelected.add(msg.id));
            setSelectedNotifications(newSelected);
        }
    };

    // Mark selected notifications as read
    const markAsRead = async () => {
        if (selectedNotifications.size === 0) return;

        setIsLoading(true);
        try {
            const token = await getToken();
            // Convert string IDs to integers and send as direct array
            const notificationIdsAsIntegers = Array.from(selectedNotifications).map(id => parseInt(id, 10));
            
            const response = await fetch(`${API_BASE_URL}/notifications/mark-read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(notificationIdsAsIntegers) // Send as direct array, not wrapped in object
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.detail || `Error: ${response.status}`);
            }

            const updatedNotifications = notifications.map(msg =>
                selectedNotifications.has(msg.id) ? { ...msg, is_read: true } : msg
            );
            setNotifications(updatedNotifications);
            setSelectedNotifications(new Set());

            toast({
                title: "Berichten gemarkeerd als gelezen",
                variant: "success"
            });
            
            // Reload notifications if we're on unread filter to update the list
            if (filter === 'unread') {
                loadNotifications(1, filter);
            }
        } catch (error) {
            console.error("Error marking as read:", error);
            toast({
                title: "Fout bij markeren als gelezen",
                description: error instanceof Error ? error.message : "Er is een fout opgetreden. Probeer het later opnieuw.",
                variant: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Delete selected notifications
    const deleteNotifications = async () => {
        if (selectedNotifications.size === 0) return;

        setIsLoading(true);
        try {
            const token = await getToken();
            // Convert string IDs to integers and send as direct array
            const notificationIdsAsIntegers = Array.from(selectedNotifications).map(id => parseInt(id, 10));
            
            const response = await fetch(`${API_BASE_URL}/notifications/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(notificationIdsAsIntegers) // Send as direct array, not wrapped in object
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.detail || `Error: ${response.status}`);
            }

            const updatedNotifications = notifications.filter(msg => !selectedNotifications.has(msg.id));
            setNotifications(updatedNotifications);
            setSelectedNotifications(new Set());

            toast({
                title: "Berichten verwijderd",
                variant: "success"
            });
            
            // Reload notifications to update the counts
            loadNotifications(1, filter);
        } catch (error) {
            console.error("Error deleting notifications:", error);
            toast({
                title: "Fout bij verwijderen",
                description: error instanceof Error ? error.message : "Er is een fout opgetreden. Probeer het later opnieuw.",
                variant: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle notification click - navigate to link
    const handleNotificationClick = async (notification: Notification) => {
        // If not already read, mark as read
        if (!notification.is_read) {
            try {
                const token = await getToken();
                await fetch(`${API_BASE_URL}/notifications/${notification.id}/read`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const updatedNotifications = notifications.map(msg =>
                    msg.id === notification.id ? { ...msg, is_read: true } : msg
                );
                setNotifications(updatedNotifications);
                
                // Update unread count
                setStats(prev => ({
                    ...prev,
                    unread: prev.unread - 1
                }));
            } catch (error) {
                console.error("Error marking notification as read:", error);
            }
        }

        // Navigate to linked resource
        if (notification.link) {
            window.open(notification.link, "_blank");
        }
    };

    // Skeleton loader component for notifications
    const NotificationSkeleton = () => (
        <div className="px-4 py-4 animate-pulse">
            <div className="flex items-start">
                <div className="w-6 mt-1 shrink-0">
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0"></div>
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="flex justify-end">
                        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render multiple skeleton loaders
    const renderSkeletons = (count: number) => {
        return Array(count).fill(0).map((_, index) => (
            <NotificationSkeleton key={index} />
        ));
    };

    return (
        <>
            <Toaster />
            <div className="space-y-6 pb-4">
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
                                    onClick={markAsRead}
                                    disabled={isLoading || selectedNotifications.size === 0}
                                    variant="ghost"
                                    className="px-2 py-1.5 text-xs"
                                >
                                    <CheckIcon size={14} className="mr-1" />
                                    Markeer als gelezen
                                </Button>
                                <Button
                                    onClick={deleteNotifications}
                                    disabled={isLoading || selectedNotifications.size === 0}
                                    variant="ghost"
                                    className="px-2 py-1.5 text-xs text-red-500 hover:text-red-600"
                                >
                                    <TrashIcon size={14} className="mr-1" />
                                    Verwijderen
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Notification list */}
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {isLoading && !isPaginationLoading ? (
                            <div className="py-8">
                                <Loader loadingtext={"Berichten laden..."} size={32} />
                            </div>
                        ) : fetchError ? (
                            <div className="p-6 text-center">
                                <AlertTriangleIcon size={32} className="mx-auto text-amber-500 mb-4" />
                                <h3 className="text-lg font-medium mb-2">Fout bij laden</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">{fetchError}</p>
                                <Button
                                    onClick={() => router.refresh()}
                                    className="mx-auto"
                                >
                                    <RefreshCcwIcon size={16} className="mr-2" />
                                    Probeer opnieuw
                                </Button>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-6 text-center">
                                <MailOpenIcon size={32} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium mb-2">Geen berichten gevonden</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Er zijn momenteel geen nieuwe berichten. Kom later terug om te zien of er updates of belangrijke meldingen zijn.
                                </p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="p-6 text-center">
                                <MailOpenIcon size={32} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium mb-2">Geen berichten gevonden</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {`Je hebt geen berichten in de geselecteerde categorie.`}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Select all header */}
                                <div className="flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                                    <div className="w-6 shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={selectedNotifications.size === currentItems.length && currentItems.length > 0}
                                            onChange={toggleSelectAll}
                                            className="h-4 w-4 rounded border-gray-300 text-astral-600"
                                        />
                                    </div>
                                    <div className="ml-3 text-xs font-medium text-gray-500">
                                        {selectedNotifications.size > 0
                                            ? `${selectedNotifications.size} geselecteerd`
                                            : 'Selecteer alles'}
                                    </div>
                                </div>

                                {/* Show skeleton loaders when pagination is loading */}
                                {isPaginationLoading ? (
                                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {renderSkeletons(5)}
                                    </div>
                                ) : (
                                    currentItems.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`flex items-start px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${!notification.is_read ? 'bg-astral-50 dark:bg-astral-900/10' : ''}`}
                                        >
                                            <div className="w-6 mt-1 shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedNotifications.has(notification.id)}
                                                    onChange={() => toggleSelectNotification(notification.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="h-4 w-4 rounded border-gray-300 text-astral-600"
                                                />
                                            </div>
                                            <div
                                                className="ml-3 flex-1 min-w-0"
                                                onClick={() => handleNotificationClick(notification)}
                                            >
                                                {/* Notification header */}
                                                <div className="flex flex-wrap justify-between gap-2 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        {/* Type icon */}
                                                        <div className="shrink-0">
                                                            {getNotificationIcon(notification.notification_type, notification.is_read)}
                                                        </div>

                                                        {/* Title */}
                                                        <h3 className={`text-sm font-medium ${notification.is_read ? 'text-gray-900 dark:text-gray-200' : 'text-astral-900 dark:text-astral-100 font-semibold'}`}>
                                                            {notification.title}
                                                        </h3>

                                                        {/* Unread indicator */}
                                                        {!notification.is_read && (
                                                            <span className="inline-block w-2 h-2 bg-astral-500 rounded-full"></span>
                                                        )}
                                                    </div>

                                                    {/* Date */}
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                                                        {formatNotificationDate(notification.created_at)}
                                                    </div>
                                                </div>

                                                {/* Notification content */}
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                    {notification.content}
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
                                    ))
                                )}
                            </>
                        )}
                    </div>
                    
                    {/* Pagination - now using correct total based on filtered notifications */}
                    {pagination.pages > 1 && filteredNotifications.length > 0 && (
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.pages}
                            totalItems={pagination.total}
                            onPageChange={handlePageChange}
                            isLoading={isLoading || isPaginationLoading}
                        />
                    )}
                </div>
            </div>
        </>
    );
}