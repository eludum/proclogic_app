import ContractDetailPage from './_components/ContractDetailPage';

interface PageProps {
    params: Promise<{
        contractId: string;
    }>;
}

export default function Page({ params }: PageProps) {
    return <ContractDetailPage params={params} />;
}

export async function generateMetadata({ params }: PageProps) {
    const { contractId } = await params;
    return {
        title: `Gunning Details`,
        description: `Bekijk de details van gunning ${contractId}`,
    };
}