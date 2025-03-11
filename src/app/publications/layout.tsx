"use client"
import { usePathname } from "next/navigation"
import React from "react"

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
