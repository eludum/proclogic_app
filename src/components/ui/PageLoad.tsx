import { LoaderIcon } from "lucide-react";

interface LoaderProps {
    loadingtext: string;
    size: number;
}

export function Loader({ loadingtext, size }: LoaderProps) {
    return (
        <div className="w-full flex flex-col items-center pt-8">
            <LoaderIcon size={size} className="animate-spin text-astral-300" />
            <span className="mt-2 text-gray-600 dark:text-gray-300">{loadingtext}</span>
        </div>
    );
}