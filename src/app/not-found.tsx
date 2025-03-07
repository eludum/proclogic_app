import { Button } from "@/components/Button";
import { FileX2Icon, HomeIcon } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-16 text-center">
            <div className="max-w-md mx-auto">
                {/* Error Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full">
                        <FileX2Icon
                            className="h-16 w-16 text-red-600 dark:text-red-400"
                            aria-hidden="true"
                        />
                    </div>
                </div>

                {/* Error Title */}
                <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
                    Pagina niet gevonden
                </h1>

                {/* Error Message */}
                <p className="mb-8 text-base text-gray-500 dark:text-gray-400">
                    Sorry, we konden de pagina die u zocht niet vinden. Mogelijk is de URL onjuist of is de pagina verplaatst.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <a href="/" className="inline-flex items-center gap-2">
                            <HomeIcon className="h-4 w-4" />
                            Terug naar startpagina
                        </a>
                    </Button>

                    <Button className="inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <a href="/publications/search" className="inline-flex items-center gap-2">
                            Zoek aanbestedingen
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
}