// app/dashboard/page.jsx
"use server"
import { siteConfig } from "@/app/siteConfig";
import { auth } from '@clerk/nextjs/server';
import Dashboard from "./_components/Dashboard";

const API_BASE_URL = siteConfig.api_base_url;

export default async function DashboardPage() {
    const { getToken } = await auth();

    // Initialize data containers for all our fetches with pagination structure
    let publicationsData = {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        pages: 0
    };

    let recommendedPublicationsData = {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        pages: 0
    };

    let savedPublicationsData = {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        pages: 0
    };

    let error = null;

    try {
        const token = await getToken();

        // Fetch all publications with pagination
        const allResponse = await fetch(`${API_BASE_URL}/publications/?page=1&size=10`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store'
        });

        // Fetch recommended publications with pagination
        const recommendedResponse = await fetch(`${API_BASE_URL}/publications/recommended/?page=1&size=10`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store'
        });

        // Fetch saved publications with pagination
        const savedResponse = await fetch(`${API_BASE_URL}/publications/saved/?page=1&size=10`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store'
        });

        if (!allResponse.ok || !recommendedResponse.ok || !savedResponse.ok) {
            throw new Error(`API error: ${allResponse.status}`);
        }

        // Parse all responses
        publicationsData = await allResponse.json();
        recommendedPublicationsData = await recommendedResponse.json();
        savedPublicationsData = await savedResponse.json();
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        error = error.message;
    }

    // Calculate stats
    const stats = {
        total: publicationsData.total || 0,
        recommended: recommendedPublicationsData.total || 0,
        saved: savedPublicationsData.total || 0,
        active: (publicationsData.items || []).filter(pub => pub.is_active === true).length
    };

    // Get publications due in the next 7 days
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingDeadlines = (publicationsData.items || []).filter(pub => {
        if (!pub.submission_deadline || !pub.is_active) return false;
        const deadline = new Date(pub.submission_deadline);
        return deadline >= today && deadline <= nextWeek;
    });

    // Pass the initially fetched data to the client component
    return (
        <Dashboard
            initialData={{
                publications: publicationsData,
                recommendedPublications: recommendedPublicationsData,
                savedPublications: savedPublicationsData,
                stats: stats,
                upcomingDeadlines: upcomingDeadlines,
                error: error
            }}
        />
    );
}
