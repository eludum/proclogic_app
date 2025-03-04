import { siteConfig } from "@/app/siteConfig";
import { CompanySchema } from '@/data/companySchema';
import { User } from '@clerk/nextjs/server';

const API_BASE_URL = siteConfig.api_base_url;

export interface SafeUser {
    id: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
    emailAddress: string | null;
}

export function extractSafeUser(user: User | null | undefined): SafeUser | null {
    if (!user) return null;

    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        emailAddress: user.emailAddresses[0]?.emailAddress || null,
    };
}

export async function getCompanyData(user: { emailAddresses: string | any[]; primaryEmailAddress: { emailAddress: any; }; }) {
    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
        return { company: null, error: 'User not available or no email found' };
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;

    try {
        const response = await fetch(`${API_BASE_URL}/company/${userEmail}`);

        if (!response.ok) {
            return {
                company: null,
                error: `API error: ${response.status}`
            };
        }

        const data = await response.json();

        // Validate with schema
        const parseResult = CompanySchema.safeParse(data);
        if (parseResult.success) {
            return { company: parseResult.data, error: null };
        } else {
            return {
                company: null,
                error: `Schema validation error: ${parseResult.error.message}`
            };
        }
    } catch (error) {
        return {
            company: null,
            error: `Error fetching company data: ${error.message}`
        };
    }
}
