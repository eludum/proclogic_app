'use server'

import { siteConfig } from "@/app/siteConfig"
import { auth, clerkClient } from "@clerk/nextjs/server"

export const updateCompanyInfo = async (formData: FormData) => {
    const { userId, getToken } = await auth()

    if (!userId) {
        return { error: "No authenticated user found" }
    }

    try {
        const token = getToken()

        // First create/update the company via your API
        const apiFormData = {
            name: formData.get('name'),
            vat_number: formData.get('vat_number') || "BE0000000000",
            emails: [formData.get('email')],
            summary_activities: formData.get('summary_activities'),
            subscription: "premium",
            max_publication_value: formData.get('max_publication_value')
                ? parseInt(formData.get('max_publication_value') as string)
                : null
        }

        // Send to your API
        const response = await fetch(`${siteConfig.api_base_url}/company/`, {
            method: "POST", // Or PATCH if the company already exists
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(apiFormData),
        })

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        const companyData = await response.json()

        // Update Clerk metadata
        const clerk = await clerkClient()
        await clerk.users.updateUser(userId, {
            publicMetadata: {
                hasCompanyInfo: true,
                companyVatNumber: companyData.vat_number,
                companyName: companyData.name
            }
        })

        return { success: true, message: "Company information saved successfully" }
    } catch (error) {
        console.error("Error saving company data:", error)
        return { error: "Failed to save company information" }
    }
}

export const updateSectorsInfo = async (formData: FormData) => {
    const { userId, getToken } = await auth()

    if (!userId) {
        return { error: "No authenticated user found" }
    }

    try {
        const token = getToken()

        // Process formData to get selected sectors
        const sectors = []
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('sector-') && value === 'on') {
                const sectorCode = key.replace('sector-', '')
                sectors.push({
                    sector: formData.get(`sector-name-${sectorCode}`),
                    cpv_codes: [sectorCode]
                })
            }
        }

        // Send sectors to your API
        const response = await fetch(`${siteConfig.api_base_url}/company/`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                interested_sectors: sectors
            }),
        })

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        // Update Clerk metadata
        const clerk = await clerkClient()
        await clerk.users.updateUser(userId, {
            publicMetadata: {
                hasSectors: true
            }
        })

        return { success: true, message: "Sectors information saved successfully" }
    } catch (error) {
        console.error("Error saving sectors data:", error)
        return { error: "Failed to save sectors information" }
    }
}

export const updateRegionsInfo = async (formData: FormData) => {
    const { userId, getToken } = await auth()

    if (!userId) {
        return { error: "No authenticated user found" }
    }

    try {
        const token = getToken()

        // Process formData to get selected regions
        const regions = []
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('region-') && value === 'on') {
                regions.push(key.replace('region-', ''))
            }
        }

        // Send regions to your API
        const response = await fetch(`${siteConfig.api_base_url}/company/`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                operating_regions: regions
            }),
        })

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        // Update Clerk metadata
        const clerk = await clerkClient()
        await clerk.users.updateUser(userId, {
            publicMetadata: {
                hasRegions: true
            }
        })

        return { success: true, message: "Regions information saved successfully" }
    } catch (error) {
        console.error("Error saving regions data:", error)
        return { error: "Failed to save regions information" }
    }
}

export const completeOnboarding = async () => {
    const { userId } = await auth()

    if (!userId) {
        return { error: "No authenticated user found" }
    }

    try {
        // Update Clerk metadata to mark onboarding as complete
        const clerk = await clerkClient()
        await clerk.users.updateUser(userId, {
            publicMetadata: {
                onboardingComplete: true
            }
        })

        return { success: true, message: "Onboarding completed successfully" }
    } catch (error) {
        console.error("Error completing onboarding:", error)
        return { error: "Failed to complete onboarding" }
    }
}