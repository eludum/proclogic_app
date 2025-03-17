'use server'

import { siteConfig } from "@/app/siteConfig"
import { auth, clerkClient } from "@clerk/nextjs/server"

export const updateCompanyInfo = async (formData: FormData) => {
    const { userId, getToken } = await auth()

    if (!userId) {
        return { error: "No authenticated user found" }
    }

    try {
        const token = await getToken()

        // First create/update the company via your API
        const apiFormData = {
            name: formData.get('name'),
            vat_number: formData.get('vat_number') || "BE0000000000",
            emails: [formData.get('email')],
            summary_activities: formData.get('summary_activities'),
            subscription: "starter", // TODO: get this from attributes
            number_of_employees: parseInt(formData.get('number_of_employees') as string) || 1,
            max_publication_value: formData.get('max_publication_value')
                ? parseInt(formData.get('max_publication_value') as string)
                : null
        }

        // Check if company exists first to determine method
        let companyExists = false
        try {
            const checkResponse = await fetch(`${siteConfig.api_base_url}/company/`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            })
            companyExists = checkResponse.status === 200
        } catch (error) {
            console.error("Error checking company existence:", error)
        }

        // Send to your API - use PATCH if company exists, otherwise POST
        const response = await fetch(`${siteConfig.api_base_url}/company/`, {
            method: companyExists ? "PATCH" : "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(apiFormData),
        })

        if (!response.ok) {
            throw new Error(`API error: ${response.status} - ${await response.text()}`)
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
        return { error: error instanceof Error ? error.message : "Failed to save company information" }
    }
}

export const updateSectorsInfo = async (formData: FormData) => {
    const { userId, getToken } = await auth()

    if (!userId) {
        return { error: "No authenticated user found" }
    }

    try {
        const token = await getToken()

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

        // Add any custom CPV codes to the sectors
        for (const sector of sectors) {
            const sectorCode = sector.cpv_codes[0]
            const customCpvCodes = formData.get(`custom-cpv-${sectorCode}`)
            if (customCpvCodes) {
                const additionalCodes = (customCpvCodes as string)
                    .split(',')
                    .map(code => code.trim())
                    .filter(code => code.length > 0)

                // Add additional codes to the sector
                sector.cpv_codes.push(...additionalCodes)
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
            throw new Error(`API error: ${response.status} - ${await response.text()}`)
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
        return { error: error instanceof Error ? error.message : "Failed to save sectors information" }
    }
}

export const updateRegionsInfo = async (formData: FormData) => {
    const { userId, getToken } = await auth()

    if (!userId) {
        return { error: "No authenticated user found" }
    }

    try {
        const token = await getToken()

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
            throw new Error(`API error: ${response.status} - ${await response.text()}`)
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
        return { error: error instanceof Error ? error.message : "Failed to save regions information" }
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
        return { error: error instanceof Error ? error.message : "Failed to complete onboarding" }
    }
}
