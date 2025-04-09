import { Button } from '@/components/Button';
import { formatDate } from '@/lib/publicationUtils';
import { CalendarIcon, MailPlusIcon, UserCheckIcon, UserIcon, UserX2Icon } from 'lucide-react';
import { useState } from 'react';
import { CompanyUser } from '../users/page';

interface UsersListProps {
    users: CompanyUser[];
    onRemoveUser: (email: string, userId?: string) => Promise<void>;
    currentUserEmail: string; // Add current user email prop
}

export default function UsersList({ users, onRemoveUser, currentUserEmail }: UsersListProps) {
    const [removingEmail, setRemovingEmail] = useState<string | null>(null);

    const handleRemoveUser = async (user: CompanyUser) => {
        // Check if this is the current user
        if (user.email === currentUserEmail) {
            alert('Je kunt je eigen account niet verwijderen.');
            return;
        }

        if (window.confirm(`Weet je zeker dat je ${user.email} wilt verwijderen?`)) {
            setRemovingEmail(user.email);
            try {
                await onRemoveUser(user.email, user.id || undefined);
            } finally {
                setRemovingEmail(null);
            }
        }
    };

    const getUserStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <UserCheckIcon size={12} className="mr-1" />
                        Actief
                    </span>
                );
            case 'invited':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                        <MailPlusIcon size={12} className="mr-1" />
                        Uitgenodigd
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                        <UserIcon size={12} className="mr-1" />
                        Onbekend
                    </span>
                );
        }
    };

    if (users.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-6 text-center">
                <div className="flex justify-center mb-4">
                    <UserIcon size={32} className="text-gray-400" />
                </div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                    Geen gebruikers gevonden
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Voeg gebruikers toe door hen uit te nodigen met hun e-mailadres.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Gebruiker
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Toegevoegd op
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Laatste login
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Acties
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user, idx) => {
                        // Check if this is the current user
                        const isCurrentUser = user.email === currentUserEmail;

                        return (
                            <tr key={user.id || `email-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                            <UserIcon size={20} className="text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {user.first_name && user.last_name
                                                    ? `${user.first_name} ${user.last_name}`
                                                    : 'Onbekende naam'}
                                                {isCurrentUser && (
                                                    <span className="ml-2 px-2 py-0.5 text-xs bg-astral-100 text-astral-800 dark:bg-astral-900/20 dark:text-astral-300 rounded-full">
                                                        Jij
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getUserStatusBadge(user.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <CalendarIcon size={14} className="mr-1" />
                                        {user.created_at ? formatDate(new Date(user.created_at)) : 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {user.last_sign_in_at
                                            ? formatDate(new Date(user.last_sign_in_at))
                                            : 'Nog niet ingelogd'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Button
                                        onClick={() => handleRemoveUser(user)}
                                        disabled={removingEmail === user.email || isCurrentUser}
                                        variant="ghost"
                                        className={`flex items-center gap-1 ${isCurrentUser
                                            ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                            : "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                            }`}
                                        title={isCurrentUser ? "Je kunt je eigen account niet verwijderen" : ""}
                                    >
                                        <UserX2Icon size={16} />
                                        <span>
                                            {removingEmail === user.email ? 'Verwijderen...' : 'Verwijderen'}
                                        </span>
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}