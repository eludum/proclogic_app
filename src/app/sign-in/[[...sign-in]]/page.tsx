import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <SignIn />
        </div>
    );
}

// Disable the default layout by returning only the page component
SignInPage.getLayout = (page: React.ReactNode) => page;
