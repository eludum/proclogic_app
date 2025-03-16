import { Button } from '@/components/Button';
import { InfoIcon, MailPlusIcon } from 'lucide-react';
import { useState } from 'react';

interface AddUserFormProps {
    onAddUser: (email: string) => Promise<void>;
    loading: boolean;
}

export default function AddUserForm({ onAddUser, loading }: AddUserFormProps) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);

    const validateEmail = (email: string) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate email
        if (!email.trim()) {
            setError('E-mail is verplicht');
            return;
        }

        if (!validateEmail(email)) {
            setError('Voer een geldig e-mailadres in');
            return;
        }

        setError(null);
        await onAddUser(email);
        setEmail(''); // Clear form after submission
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md">
            <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    E-mailadres
                </label>
                <input
                    type="email"
                    id="email"
                    className={`w-full px-3 py-2 border ${error ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'} rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-astral-500`}
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null); // Clear error when input changes
                    }}
                    placeholder="example@company.com"
                    disabled={loading}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1">
                    <InfoIcon size={12} className="mt-0.5 shrink-0" />
                    <span>
                        De gebruiker ontvangt een uitnodiging per e-mail om toegang te krijgen tot het bedrijf.
                        Ze moeten deze accepteren om een account aan te maken.
                    </span>
                </p>
            </div>

            <Button
                type="submit"
                className="flex items-center gap-2"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <span className="animate-spin">⟳</span>
                        <span>Uitnodigen...</span>
                    </>
                ) : (
                    <>
                        <MailPlusIcon size={16} />
                        <span>Gebruiker uitnodigen</span>
                    </>
                )}
            </Button>
        </form>
    );
}