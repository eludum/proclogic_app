// userUtils.js
import { siteConfig } from "@/app/siteConfig";
import { CompanySchema } from '@/data/companySchema';

const API_BASE_URL = siteConfig.api_base_url;

// Server-side function to fetch company data
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