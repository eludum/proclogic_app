import { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';

// Every protected URL redirects here with a unique ?redirect_url=, which Google
// sees as a pile of duplicate pages. Keep the sign-in page out of the index.
export const metadata: Metadata = {
    alternates: { canonical: '/sign-in' },
    robots: { index: false, follow: false },
};

export default function SignInPage() {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <SignIn />
        </div>
    );
}
