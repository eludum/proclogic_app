// app/analytics/page.jsx
import { siteConfig } from "@/app/siteConfig";
import { auth } from '@clerk/nextjs/server';
import AnalyticsDashboard from './_components/AnalyticsDashboard';

export const metadata = {
    title: 'Sectoranalyse | ProcLogic',
    description: 'Analyse van gunningstrends, concurrentie en marktontwikkelingen in uw sector',
};

const API_BASE_URL = siteConfig.api_base_url;

export default async function AnalyticsPage() {
    // Get server-side authentication token
    const { getToken } = await auth();
    const token = await getToken();

    // Fetch initial analytics data for the dashboard
    let initialData = {
        totalValue: 0,
        sectorData: [],
        years: [],
        companySectors: []
    };
    let error = null;

    try {
        // Fetch company data to identify sectors
        const companyResponse = await fetch(`${API_BASE_URL}/company/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store'
        });

        if (!companyResponse.ok) {
            throw new Error(`Company API error: ${companyResponse.status}`);
        }

        const companyData = await companyResponse.json();

        // Extract company sectors
        if (companyData.interested_sectors && companyData.interested_sectors.length > 0) {
            initialData.companySectors = companyData.interested_sectors.map(sector => ({
                name: sector.sector,
                cpvCodes: sector.cpv_codes
            }));
        }

        // Fetch total value data
        const totalValueResponse = await fetch(`${API_BASE_URL}/analytics/total-value`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store'
        });

        if (!totalValueResponse.ok) {
            throw new Error(`API error: ${totalValueResponse.status}`);
        }

        const totalValueData = await totalValueResponse.json();
        initialData.totalValue = totalValueData.total_value;

        // Fetch sector data
        const sectorResponse = await fetch(`${API_BASE_URL}/analytics/by-sector`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store'
        });

        if (!sectorResponse.ok) {
            throw new Error(`API error: ${sectorResponse.status}`);
        }

        initialData.sectorData = await sectorResponse.json();

        // Fetch time series data to extract available years
        const timeSeriesResponse = await fetch(`${API_BASE_URL}/analytics/time-series?timeframe=yearly`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store'
        });

        if (timeSeriesResponse.ok) {
            const timeSeriesData = await timeSeriesResponse.json();
            initialData.years = Array.from(new Set(timeSeriesData.map(item => {
                // Handle different possible formats - either direct year or 'YYYY-Q1' format
                const period = item.period;
                if (typeof period === 'number') return period;
                if (typeof period === 'string' && period.length === 4) return parseInt(period);
                if (typeof period === 'string' && period.includes('-')) return parseInt(period.split('-')[0]);
                return new Date().getFullYear(); // Fallback to current year
            }))).sort((a, b) => b - a); // Sort descending
        }

    } catch (e) {
        console.error("Error fetching initial analytics data:", e);
        error = e.message;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <AnalyticsDashboard
                error={error}
                apiBaseUrl={API_BASE_URL}
            />
        </div>
    );
}