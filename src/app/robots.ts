import type { MetadataRoute } from "next"
import { siteConfig } from "./siteConfig"

// /sign-in stays crawlable on purpose: it carries a noindex tag, and Google can
// only see that tag if it's allowed to fetch the page.
export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: "*", allow: "/" },
        sitemap: `${siteConfig.url}/sitemap.xml`,
    }
}
