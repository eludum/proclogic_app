"use client"
import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { ArrowAnimated } from "@/components/ui/ArrowAnimated"
import { cx } from "@/lib/utils"
import {
    RiArrowRightLine,
    RiCalendarLine
} from "@remixicon/react"
import Link from "next/link"

// Sample data for the dashboard
const recentTenders = [
    {
        id: "TEN-2025-001",
        title: "Ontwikkeling IT-infrastructuur gemeente Utrecht",
        deadline: "28-03-2025",
        value: "€450.000",
        status: "Actief",
        sector: "IT & Software",
        match: 87,
    },
    {
        id: "TEN-2025-002",
        title: "Aanbesteding kantoorartikelen Ministerie van Defensie",
        deadline: "15-03-2025",
        value: "€124.000",
        status: "Actief",
        sector: "Facilitaire diensten",
        match: 75,
    },
    {
        id: "TEN-2025-003",
        title: "Onderhoud groenvoorzieningen Rotterdam",
        deadline: "22-03-2025",
        value: "€290.000",
        status: "Actief",
        sector: "Groenvoorziening",
        match: 62,
    },
    {
        id: "TEN-2025-004",
        title: "Levering schoolmaterialen basisscholen Amsterdam",
        deadline: "10-03-2025",
        value: "€86.000",
        status: "Actief",
        sector: "Onderwijs",
        match: 58,
    },
]

const savedTenders = [
    {
        id: "TEN-2024-187",
        title: "Cybersecurity diensten Provincie Noord-Holland",
        deadline: "08-03-2025",
        status: "In bewerking",
        progress: 65,
    },
    {
        id: "TEN-2024-153",
        title: "Levering kantoormeubilair UWV",
        deadline: "12-03-2025",
        status: "In bewerking",
        progress: 42,
    },
]

const upcomingDeadlines = [
    {
        id: "TEN-2024-187",
        title: "Cybersecurity diensten Provincie Noord-Holland",
        deadline: "08-03-2025",
        daysLeft: 10,
    },
    {
        id: "TEN-2024-153",
        title: "Levering kantoormeubilair UWV",
        deadline: "12-03-2025",
        daysLeft: 14,
    },
    {
        id: "TEN-2025-002",
        title: "Aanbesteding kantoorartikelen Ministerie van Defensie",
        deadline: "15-03-2025",
        daysLeft: 17,
    },
]

const insights = [
    {
        title: "Tenderactiviteit per sector",
        value: "+24%",
        trend: "up",
        description: "Meer IT & Software aanbestedingen deze maand",
    },
    {
        title: "Gemiddelde aanbestedingswaarde",
        value: "€127.000",
        trend: "neutral",
        description: "Stabiel in vergelijking met vorige maand",
    },
    {
        title: "Uw slagingspercentage",
        value: "38%",
        trend: "up",
        description: "5% hoger dan branchegemiddelde",
    },
]

export default function Dashboard() {
    return (
        <div className="flex-1">
            {/* Content Area */}
            <main className="p-4 md:p-6">
                <section className="mb-6">
                    <Badge>Dashboard</Badge>
                    <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-50 sm:text-3xl">
                        Welkom terug, Jan
                    </h1>
                    <p className="mt-1 text-gray-700 dark:text-gray-400">
                        U heeft vandaag 5 nieuwe aanbestedingen die passen bij uw profiel.
                    </p>
                </section>

                {/* Insights Section */}
                <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {insights.map((insight, index) => (
                        <div
                            key={index}
                            className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
                        >
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {insight.title}
                            </h3>
                            <div className="mt-2 flex items-baseline">
                                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                                    {insight.value}
                                </p>
                                <span
                                    className={cx(
                                        "ml-2 text-sm font-medium",
                                        insight.trend === "up" ? "text-green-600 dark:text-green-400" :
                                            insight.trend === "down" ? "text-red-600 dark:text-red-400" :
                                                "text-gray-600 dark:text-gray-400"
                                    )}
                                >
                                    {insight.trend === "up" ? "↑" : insight.trend === "down" ? "↓" : "→"}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {insight.description}
                            </p>
                        </div>
                    ))}
                </section>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Recent Tenders */}
                    <section className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-50">
                                Recente aanbestedingen
                            </h2>
                            <Button variant="light" asChild className="group">
                                <Link href="#">
                                    Bekijk alles
                                    <ArrowAnimated />
                                </Link>
                            </Button>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-800">
                            {recentTenders.map((tender) => (
                                <div key={tender.id} className="px-6 py-4">
                                    <div className="flex justify-between">
                                        <div>
                                            <div className="mb-1 flex items-center">
                                                <span className="mr-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {tender.id}
                                                </span>
                                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                    {tender.status}
                                                </span>
                                            </div>
                                            <h3 className="font-medium text-gray-900 dark:text-gray-50">
                                                {tender.title}
                                            </h3>
                                            <div className="mt-1 flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400">
                                                <span className="mr-4 flex items-center">
                                                    <RiCalendarLine className="mr-1 h-4 w-4" />
                                                    Deadline: {tender.deadline}
                                                </span>
                                                <span className="mr-4">
                                                    Waarde: {tender.value}
                                                </span>
                                                <span>
                                                    Sector: {tender.sector}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4 flex flex-col items-end">
                                            <div
                                                className={cx(
                                                    "flex h-10 w-10 items-center justify-center rounded-full text-white",
                                                    tender.match >= 80 ? "bg-green-600" :
                                                        tender.match >= 60 ? "bg-yellow-500" : "bg-gray-500"
                                                )}
                                            >
                                                <span className="font-medium">{tender.match}%</span>
                                            </div>
                                            <span className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                                Match
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex space-x-2">
                                        <Button size="sm">
                                            Details bekijken
                                        </Button>
                                        <Button variant="light" size="sm">
                                            Opslaan
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="space-y-6">
                        {/* Saved Tenders */}
                        <section className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                                <h2 className="font-semibold text-gray-900 dark:text-gray-50">
                                    Opgeslagen aanbestedingen
                                </h2>
                                <Button variant="light" size="sm" asChild className="group">
                                    <Link href="#">
                                        Bekijk alles
                                        <ArrowAnimated />
                                    </Link>
                                </Button>
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                {savedTenders.map((tender) => (
                                    <div key={tender.id} className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="mb-1 flex items-center">
                                                    <span className="mr-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        {tender.id}
                                                    </span>
                                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                        {tender.status}
                                                    </span>
                                                </div>
                                                <h3 className="font-medium text-gray-900 dark:text-gray-50">
                                                    {tender.title}
                                                </h3>
                                                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                    Deadline: {tender.deadline}
                                                </div>
                                            </div>
                                            <Button size="sm">
                                                <RiArrowRightLine className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="mt-2">
                                            <div className="flex items-center">
                                                <div className="flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                                                    <div
                                                        className="rounded-full bg-indigo-600 p-0.5 text-center text-xs font-medium leading-none text-indigo-100 dark:bg-indigo-500"
                                                        style={{ width: `${tender.progress}%` }}
                                                    >
                                                        <span className="sr-only">{tender.progress}% compleet</span>
                                                    </div>
                                                </div>
                                                <span className="ml-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {tender.progress}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Upcoming Deadlines */}
                        <section className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                                <h2 className="font-semibold text-gray-900 dark:text-gray-50">
                                    Aankomende deadlines
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                {upcomingDeadlines.map((deadline) => (
                                    <div key={deadline.id} className="px-6 py-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-gray-50">
                                                    {deadline.title}
                                                </h3>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {deadline.deadline}
                                                </div>
                                            </div>
                                            <span
                                                className={cx(
                                                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                    deadline.daysLeft <= 7
                                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                                        : deadline.daysLeft <= 14
                                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                )}
                                            >
                                                {deadline.daysLeft} dagen
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}