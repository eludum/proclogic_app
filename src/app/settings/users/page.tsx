"use client"
import { siteConfig } from "@/app/siteConfig";
import { Toaster } from '@/components/Toaster';
import { Loader } from "@/components/ui/PageLoad";
import { useToast } from '@/lib/useToast';
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import AddUserForm from "../_components/AddUserForm";
import UsersList from "../_components/UsersList";

const API_BASE_URL = siteConfig.api_base_url;

export interface CompanyUser {
    id: string | null;
    email: string;
    first_name: string | null;
    last_name: string | null;
    created_at: string | null;
    last_sign_in_at: string | null;
    status: string;
}

export default function UsersSettingsPage() {
    const [users, setUsers] = useState<CompanyUser[]>([]);
    const [emails, setEmails] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingUser, setAddingUser] = useState(false);
    const { getToken } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = await getToken();

            // Get company emails (for reference)
            const emailsResponse = await fetch(`${API_BASE_URL}/users/company-emails`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!emailsResponse.ok) {
                throw new Error(`Failed to fetch company emails: ${emailsResponse.status}`);
            }

            const emailsData = await emailsResponse.json();
            setEmails(emailsData.emails || []);

            // Get users associated with this company
            const usersResponse = await fetch(`${API_BASE_URL}/users/company-users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!usersResponse.ok) {
                throw new Error(`Failed to fetch company users: ${usersResponse.status}`);
            }

            const usersData = await usersResponse.json();
            setUsers(usersData || []);
        } catch (error) {
            console.error("Error fetching users data:", error);
            toast({
                title: "Fout bij laden",
                description: "Gebruikersgegevens konden niet worden geladen. Probeer het later opnieuw.",
                variant: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const addUser = async (email: string) => {
        setAddingUser(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/users/invite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                throw new Error(`Failed to invite user: ${response.status}`);
            }

            toast({
                title: "Gebruiker uitgenodigd",
                description: `E-mail uitnodiging is verstuurd naar ${email}. De gebruiker moet deze accepteren om toegang te krijgen.`,
                variant: "success"
            });

            // Refresh the user list
            await fetchUsers();
        } catch (error) {
            console.error("Error inviting user:", error);
            toast({
                title: "Fout bij uitnodigen",
                description: "Gebruiker kon niet worden uitgenodigd. Controleer het e-mailadres en probeer het opnieuw.",
                variant: "error"
            });
        } finally {
            setAddingUser(false);
        }
    };

    const removeUser = async (email: string, userId?: string) => {
        try {
            const token = await getToken();
            let url = `${API_BASE_URL}/users/remove/${encodeURIComponent(email)}`;
            if (userId) {
                url += `?user_id=${encodeURIComponent(userId)}`;
            }

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to remove user: ${response.status}`);
            }

            toast({
                title: "Gebruiker verwijderd",
                description: `Gebruiker ${email} is succesvol verwijderd.`,
                variant: "success"
            });

            // Refresh the user list
            await fetchUsers();
        } catch (error) {
            console.error("Error removing user:", error);
            toast({
                title: "Fout bij verwijderen",
                description: "Gebruiker kon niet worden verwijderd. Je kunt je eigen account niet verwijderen.",
                variant: "error"
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader loadingtext="Gebruikers laden..." size={32} />
            </div>
        );
    }

    return (
        <section aria-label="Users Settings" className="pb-12">
            <Toaster />
            <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Gebruikersbeheer</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Beheer de gebruikers die toegang hebben tot dit bedrijfsaccount
                    </p>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                        Gebruikers
                    </h2>

                    {/* Users list */}
                    <UsersList users={users} onRemoveUser={removeUser} />

                    {/* Add user form */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">
                            Gebruiker uitnodigen
                        </h3>
                        <AddUserForm onAddUser={addUser} loading={addingUser} />
                    </div>
                </div>
            </div>
        </section>
    );
}