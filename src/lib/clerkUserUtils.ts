import { User } from '@clerk/nextjs/server';

export interface SafeUser {
    id: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
    emailAddress: string | null;
    publicMetadata: UserPublicMetadata;
}

export function extractSafeUser(user: User | null | undefined): SafeUser | null {
    if (!user) return null;

    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        emailAddress: user.emailAddresses[0]?.emailAddress || null,
        publicMetadata: user.publicMetadata,
    };
}

