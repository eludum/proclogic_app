'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

export default function Banner() {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="relative mt-5 mx-4 sm:mx-6 mb-6 p-4 bg-gradient-to-r from-astral-50 to-astral-100 dark:from-astral-900/30 dark:to-astral-800/30 rounded-lg border border-astral-200 dark:border-astral-800 shadow-xs">
            {/* Close button */}
            <button
                onClick={handleClose}
                className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-slate-800 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors group flex items-center justify-center"
                aria-label="Banner sluiten"
            >
                <X
                    size={14}
                    className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-8">
                <div className="flex-1">
                    <h3 className="text-base font-semibold text-astral-800 dark:text-astral-300 mb-1">
                        Maak een account aan
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Registreer voor toegang tot uitgebreide zoekmogelijkheden, AI-aanbevelingen en meer.
                    </p>
                </div>
                <a
                    href="/sign-up"
                    className="inline-flex items-center px-4 py-2 bg-astral-600 text-white text-sm font-medium rounded-md hover:bg-astral-700 transition-colors"
                >
                    Gratis account aanmaken
                </a>
            </div>
        </div>
    );
}