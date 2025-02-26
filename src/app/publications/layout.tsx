"use client"
import { usePathname } from "next/navigation"
import React from "react"
import { siteConfig } from "../siteConfig"

const navigation = [
  { name: "Overview", href: siteConfig.baseLinks.quotes.overview },
  { name: "Monitoring", href: siteConfig.baseLinks.quotes.monitoring },
  { name: "Audits", href: siteConfig.baseLinks.quotes.audits },
]
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  return (
    <>
      <div className="bg-white dark:bg-gray-925">
        <>{children}</>
      </div>
    </>
  )
}
