"use client"

import { siteConfig } from "@/app/siteConfig";
import { Loader } from "@/components/ui/PageLoad";
import { useAuth } from "@clerk/nextjs";
import {
    BuildingIcon,
    EuroIcon,
    ExternalLinkIcon,
    FileTextIcon,
    BookmarkIcon,
    DownloadIcon,
    FileDownIcon,
    MailIcon,
    MessageSquareIcon,
    PencilIcon,
    PhoneIcon,
    TrendingDownIcon,
    TrendingUpIcon,
    UsersIcon
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AwardEntryDialog from "../../_components/AwardEntryDialog";
import ChatComponent from "../../../publications/_components/ChatComponent";

// Types
interface ContractOrganization {
    id: number;
    name: string;
    business_id?: string;
    website?: string;
    phone?: string;
    email?: string;
    company_size?: string;
    subcontracting?: string;
    address?: {
        street?: string;
        city?: string;
        postal_code?: string;
        country?: string;
        nuts_code?: string;
    };
    contact_persons?: Array<{
        name: string;
        job_title?: string;
        phone?: string;
        email?: string;
    }>;
}

interface ContractDetail {
    notice_id: string;
    contract_id: string;
    internal_id?: string;
    issue_date?: string;
    notice_type?: string;
    total_contract_amount?: number;
    currency?: string;
    lowest_publication_amount?: number;
    highest_publication_amount?: number;
    number_of_publications_received?: number;
    number_of_participation_requests?: number;
    electronic_auction_used?: boolean;
    dynamic_purchasing_system?: string;
    framework_agreement?: string;
    contracting_authority?: ContractOrganization;
    winning_publisher?: ContractOrganization;
    appeals_body?: ContractOrganization;
    service_provider?: ContractOrganization;
    // Publication-related fields
    title?: string;
    publication_date?: string;
    submission_deadline?: string;
    sector?: string;
    cpv_code?: string;
    organisation?: string;
}

interface ContractDetailPageProps {
    params: Promise<{
        contractId: string;
    }>;
}

// Utility functions
const formatCurrency = (value?: number, currency: string = 'EUR') => {
    if (!value) return 'Niet beschikbaar';
    return new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    }).format(value);
};

const formatDate = (dateString?: string) => {
    if (!dateString) return 'Niet beschikbaar';
    return new Date(dateString).toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const sanitizeBTWNumber = (btwNumber?: string): string | null => {
    if (!btwNumber) return null;

    // Remove all non-alphanumeric characters (spaces, dots, dashes, etc.)
    const cleaned = btwNumber.replace(/[^a-zA-Z0-9]/g, '');

    // Check if it's a Belgian BTW number format
    if (cleaned.startsWith('BE') && cleaned.length === 12) {
        // Extract just the 10 digits after 'BE'
        return cleaned.substring(2);
    }

    // Check if it's just 10 digits (already sanitized Belgian BTW)
    if (/^\d{10}$/.test(cleaned)) {
        return cleaned;
    }

    // If it contains weird stuff like "COR" or other non-standard formats, return null
    return null;
};

const OrganizationCard = ({
    organization,
    title,
    icon: Icon
}: {
    organization?: ContractOrganization;
    title: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}) => {
    if (!organization) {
        return (
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 mb-3">
                    <Icon size={16} className="text-gray-400" />
                    <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Niet beschikbaar</p>
            </div>
        );
    }

    // Sanitize and validate the BTW number
    const sanitizedBTW = sanitizeBTWNumber(organization.business_id);

    return (
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-3">
                <Icon size={16} className="text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
            </div>

            <div className="space-y-2">
                <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{organization.name}</p>
                    {organization.business_id && (
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                BTW Nummer: {organization.business_id}
                            </p>
                            {sanitizedBTW && (
                                <a
                                    href={`https://www.companyweb.be/nl/${sanitizedBTW}/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                    <ExternalLinkIcon size={10} />
                                    CompanyWeb
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {organization.address && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        {organization.address.street && (
                            <p>{organization.address.street}</p>
                        )}
                        {(organization.address.postal_code || organization.address.city) && (
                            <p>
                                {organization.address.postal_code} {organization.address.city}
                            </p>
                        )}
                        {organization.address.country && (
                            <p>{organization.address.country}</p>
                        )}
                    </div>
                )}

                {(organization.phone || organization.email || organization.website) && (
                    <div className="pt-2 space-y-1">
                        {organization.phone && (
                            <div className="flex items-center gap-1 text-sm">
                                <PhoneIcon size={12} className="text-gray-400" />
                                <a
                                    href={`tel:${organization.phone}`}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
                                >
                                    {organization.phone}
                                </a>
                            </div>
                        )}
                        {organization.email && (
                            <div className="flex items-center gap-1 text-sm">
                                <MailIcon size={12} className="text-gray-400" />
                                <a
                                    href={`mailto:${organization.email}`}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors break-all"
                                >
                                    {organization.email}
                                </a>
                            </div>
                        )}
                        {organization.website && (
                            <div className="flex items-center gap-1 text-sm">
                                <ExternalLinkIcon size={12} />
                                <a
                                    href={organization.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-astral-600 dark:text-astral-400 hover:underline"
                                >
                                    {organization.website}
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {organization.subcontracting && organization.subcontracting !== "Not applicable" && (
                    <div className="p-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Onderaanneming: {organization.subcontracting}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ContractInfoCard = ({ contract }: { contract: ContractDetail }) => {
    return (
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-3">
                <FileTextIcon size={16} className="text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-white">Gunning details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {contract.notice_type && (
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Gunning datum</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(contract.issue_date)}</p>
                    </div>
                )}

                {contract.internal_id && (
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Intern ID</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{contract.internal_id}</p>
                    </div>
                )}

                {contract.electronic_auction_used !== undefined && (
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Elektronische veiling</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                            {contract.electronic_auction_used ? 'Ja' : 'Nee'}
                        </p>
                    </div>
                )}

                {contract.framework_agreement && (
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Raamovereenkomst</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{contract.framework_agreement}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function ContractDetailPage({ params }: ContractDetailPageProps) {
    const router = useRouter();
    const { getToken } = useAuth();
    const [contract, setContract] = useState<ContractDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [contractId, setContractId] = useState<string | null>(null);
    const [completing, setCompleting] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    // Awards are publications, so their annexes come from the same BOSA
    // workspace and download through the same URL as a tender's documents.
    const [documents, setDocuments] = useState<{ filename: string; created_at?: string }[]>([]);
    const [docsLoading, setDocsLoading] = useState(false);

    const loadDocuments = useCallback(async () => {
        if (!contractId) return;
        setDocsLoading(true);
        try {
            const token = await getToken();
            const res = await fetch(
                `${siteConfig.api_base_url}/publications/publication/${contractId}/documents`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.ok) {
                const data = await res.json();
                setDocuments(data.documents ?? []);
            }
        } catch (e) {
            console.error("Kon documenten niet laden", e);
        } finally {
            setDocsLoading(false);
        }
    }, [contractId, getToken]);

    useEffect(() => { if (contractId) void loadDocuments(); }, [contractId, loadDocuments]);

    const downloadDocument = async (filename: string) => {
        try {
            const token = await getToken();
            const res = await fetch(
                `${siteConfig.api_base_url}/publications/publication/${contractId}/document/${encodeURIComponent(filename)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) throw new Error(`Download mislukt (${res.status})`);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Download mislukt", e);
        }
    };

    const toggleSaved = async () => {
        if (!contractId || saving) return;
        setSaving(true);
        try {
            const token = await getToken();
            const res = await fetch(
                `${siteConfig.api_base_url}/publications/publication/${contractId}/${isSaved ? "unsave" : "save"}`,
                { method: "POST", headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.ok) setIsSaved(!isSaved);
        } catch (e) {
            console.error("Opslaan mislukt", e);
        } finally {
            setSaving(false);
        }
    };

    // Resolve the params promise
    useEffect(() => {
        const resolveParams = async () => {
            const resolvedParams = await params;
            setContractId(resolvedParams.contractId);
        };
        resolveParams();
    }, [params]);

    useEffect(() => {
        // Don't fetch if contractId is not available yet
        if (!contractId) {
            return;
        }

        const fetchContract = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = await getToken();
                if (!token) {
                    throw new Error('Geen authenticatie token');
                }

                // Fetch contract details using the publication detail endpoint
                // Since contracts are linked to publications via contract_id
                const response = await fetch(
                    `${siteConfig.api_base_url}/publications/publication/${contractId}/`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Gunning niet gevonden');
                    }
                    throw new Error('Fout bij het ophalen van gunning details');
                }

                const publicationData = await response.json();
                console.log(publicationData);

                // Check if the publication has contract data
                if (!publicationData.contract) {
                    throw new Error('Deze publicatie heeft geen gunning informatie');
                }

                // Transform publication data to contract format
                const contractData: ContractDetail = {
                    ...publicationData.contract,
                    title: publicationData.title,
                    publication_date: publicationData.publication_date,
                    submission_deadline: publicationData.submission_deadline,
                    sector: publicationData.sector,
                    cpv_code: publicationData.cpv_code,
                    organisation: publicationData.organisation,
                };

                setContract(contractData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
            } finally {
                setLoading(false);
            }
        };

        fetchContract();
    }, [contractId, getToken]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <Loader loadingtext="Gunning laden..." size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <section aria-label="Gunning Detail">
                <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                    <div className="w-full">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Gunning details</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
                    </div>
                </div>
            </section>
        );
    }

    if (!contract) {
        return (
            <section aria-label="Gunning Detail">
                <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                    <div className="w-full">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Gunning details</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Gunning niet gevonden</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section aria-label="Contract Detail">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                <div className="w-full">
                    <div className="flex items-center gap-4 mb-4">

                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                Gunning details
                            </h1>
                        </div>
                    </div>

                    <div className="w-full">
                        <h2 className="text-lg font-semibold leading-tight break-words text-gray-900 dark:text-white mb-2">
                            {contract.title || 'Titel niet beschikbaar'}
                        </h2>
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleSaved}
                        disabled={saving}
                        title={isSaved ? "Uit opgeslagen verwijderen" : "Deze gunning opslaan"}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isSaved
                            ? "border-astral-300 dark:border-astral-800 bg-astral-50 dark:bg-astral-900/30 text-astral-700 dark:text-astral-300"
                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                            }`}
                    >
                        <BookmarkIcon size={16} className={isSaved ? "fill-current" : undefined} />
                        {isSaved ? "Opgeslagen" : "Opslaan"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setChatOpen(true)}
                        title="Vraag Procy over deze gunning"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-astral-200 dark:border-astral-900/50 bg-white dark:bg-slate-900 text-astral-700 dark:text-astral-300 hover:bg-astral-50 dark:hover:bg-astral-900/30 transition-colors"
                    >
                        <MessageSquareIcon size={16} />
                        Vraag het Procy
                    </button>
                    <button
                        type="button"
                        onClick={() => setCompleting(true)}
                        title="Ontbrekende gegevens aanvullen of corrigeren — alleen zichtbaar voor jouw bedrijf"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-astral-600 text-white hover:bg-astral-700 transition-colors"
                    >
                        <PencilIcon size={16} />
                        Gegevens aanvullen
                    </button>
                </div>
            </div>

            {contractId && (
                <AwardEntryDialog
                    isOpen={completing}
                    onClose={() => setCompleting(false)}
                    publicationId={contractId}
                    bosa={{
                        title: contract.title,
                        winner: contract.winning_publisher?.name,
                        buyer: contract.contracting_authority?.name,
                        value: contract.total_contract_amount,
                        award_date: contract.issue_date,
                    }}
                    onSaved={() => window.location.reload()}
                />
            )}

            {chatOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-3xl h-[80vh] bg-white dark:bg-slate-900 rounded-lg shadow-xl overflow-hidden">
                        <ChatComponent publicationId={contractId} onClose={() => setChatOpen(false)} />
                    </div>
                </div>
            )}

            {/* Award documents. Same BOSA workspace as a tender's, reached by the
                same id and downloaded through the same URL. */}
            <div className="px-4 sm:px-6 pb-6">
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                        <FileDownIcon size={18} />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Documenten{documents.length > 0 ? ` (${documents.length})` : ""}
                        </h3>
                    </div>
                    <div className="p-6">
                        {docsLoading ? (
                            <div className="space-y-2">
                                {[1, 2].map(i => (
                                    <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 rounded-md" />
                                ))}
                            </div>
                        ) : documents.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Er zijn geen documenten bij deze gunning gepubliceerd.
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {documents.map(doc => (
                                    <li
                                        key={doc.filename}
                                        className="flex items-center justify-between gap-3 rounded-md border border-slate-200 dark:border-slate-800 px-3 py-2"
                                    >
                                        <span className="min-w-0 truncate text-sm text-gray-800 dark:text-gray-200" title={doc.filename}>
                                            {doc.filename}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => void downloadDocument(doc.filename)}
                                            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-astral-50 text-astral-700 dark:bg-astral-900/30 dark:text-astral-300 hover:bg-astral-100 dark:hover:bg-astral-900/50 transition-colors"
                                        >
                                            <DownloadIcon size={13} />
                                            Downloaden
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Financial Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-2 mb-3">
                            <EuroIcon size={16} className="text-emerald-600" />
                            <h3 className="font-medium text-gray-900 dark:text-white">Totale gunningwaarde</h3>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(contract.total_contract_amount, contract.currency)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Winnend bedrag
                        </p>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUpIcon size={16} className="text-blue-600" />
                            <h3 className="font-medium text-gray-900 dark:text-white">Hoogste inschrijving</h3>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(contract.highest_publication_amount, contract.currency)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Hoogste aangeboden bedrag
                        </p>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingDownIcon size={16} className="text-orange-600" />
                            <h3 className="font-medium text-gray-900 dark:text-white">Laagste inschrijving</h3>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(contract.lowest_publication_amount, contract.currency)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Laagste aangeboden bedrag
                        </p>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-2 mb-3">
                            <UsersIcon size={16} className="text-purple-600" />
                            <h3 className="font-medium text-gray-900 dark:text-white">Inschrijvingen</h3>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {contract.number_of_participation_requests || 'Niet beschikbaar'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Aantal ontvangen
                        </p>
                    </div>
                </div>
                {/* Organizations */}
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <OrganizationCard
                            organization={contract.contracting_authority}
                            title="Aanbestedende Dienst"
                            icon={BuildingIcon}
                        />

                        <OrganizationCard
                            organization={contract.winning_publisher}
                            title="Winnende Partij"
                            icon={UsersIcon}
                        />

                        {contract.service_provider && (
                            <OrganizationCard
                                organization={contract.service_provider}
                                title="Dienstverlener"
                                icon={BuildingIcon}
                            />
                        )}

                        {contract.appeals_body && (
                            <OrganizationCard
                                organization={contract.appeals_body}
                                title="Beroepsinstantie"
                                icon={BuildingIcon}
                            />
                        )}
                    </div>
                </div>

                {/* Contract Information */}
                <ContractInfoCard contract={contract} />

            </div>
        </section>
    );
}