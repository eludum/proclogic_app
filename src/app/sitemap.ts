import type { MetadataRoute } from "next"
import { siteConfig } from "./siteConfig"

export const revalidate = 86400

// The free search API caps pages at 100 items; the newest 1000 tenders cover
// everything still open without hammering the API on every regeneration.
const PAGES = 10
const PAGE_SIZE = 100

interface FreePublication {
    workspace_id: string
    publication_date?: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const entries: MetadataRoute.Sitemap = [
        { url: `${siteConfig.url}/search`, changeFrequency: "daily", priority: 1 },
    ]

    for (let page = 1; page <= PAGES; page++) {
        try {
            const response = await fetch(
                `${siteConfig.api_base_url}/publications/free/search/?page=${page}&size=${PAGE_SIZE}&sort_by=publication_date&sort_order=desc`,
            )
            if (!response.ok) break
            const data: { items: FreePublication[]; pages: number } = await response.json()
            for (const pub of data.items) {
                entries.push({
                    url: `${siteConfig.url}/publications/free/detail/${pub.workspace_id}`,
                    lastModified: pub.publication_date ? new Date(pub.publication_date) : undefined,
                })
            }
            if (page >= data.pages) break
        } catch (error) {
            console.error("Error building sitemap:", error)
            break
        }
    }

    return entries
}
