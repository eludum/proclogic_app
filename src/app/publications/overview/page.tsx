"use client"
import { siteConfig } from "@/app/siteConfig";
import { Button } from "@/components/Button";
import { Table, TableBody, TableCell, TableRoot, TableRow } from "@/components/Table";
import { Publication } from "@/data/publicationSchema";
import { RiChatSmile2Line } from '@remixicon/react';
import { BuildingIcon, CalendarIcon, CheckCircleIcon, ClockIcon, CodeIcon, MapPinIcon, PlusIcon, StarIcon, TagIcon, ThumbsUpIcon } from 'lucide-react';
import { useEffect, useState } from "react";
import ChatComponent from "../_components/ChatComponent";

const API_BASE_URL = siteConfig.api_base_url;

export default function Overview() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChatPublication, setActiveChatPublication] = useState<Publication | null>(null);

  useEffect(() => {
    async function fetchPublications() {
      try {
        const response = await fetch(`${API_BASE_URL}/publications/BE0893620715/`);
        const data = await response.json();
        setPublications(data);
      } catch (error) {
        console.error("Error fetching publications:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPublications();
  }, []);

  // Format dates nicely
  const formatDate = (dateString: string | number | Date | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate time remaining until deadline
  const getTimeRemaining = (deadline: string | number | Date | null | undefined) => {
    if (!deadline) return { text: "No deadline", variant: "neutral" };

    const now = new Date();
    const dueDate = new Date(deadline);
    const timeDiff = dueDate.getTime() - now.getTime();

    // If past due
    if (timeDiff < 0) return { text: "Expired", variant: "expired" };

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // Urgent: less than 3 days
    if (days < 3) {
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (days === 0) {
        return { text: `${hours} hours remaining`, variant: "urgent" };
      }
      return { text: `${days}d ${hours}h remaining`, variant: "urgent" };
    }

    // Soon: less than 7 days
    if (days < 7) {
      return { text: `${days} days remaining`, variant: "soon" };
    }

    // Weeks
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      return {
        text: `${weeks} week${weeks !== 1 ? 's' : ''} ${remainingDays > 0 ? `${remainingDays}d` : ''} remaining`,
        variant: "comfortable"
      };
    }

    // Months
    const months = Math.floor(days / 30);
    return {
      text: `${months} month${months !== 1 ? 's' : ''} remaining`,
      variant: "comfortable"
    };
  };

  // Get the appropriate styling for the time remaining badge
  const getTimeRemainingStyles = (variant: string) => {
    switch (variant) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "soon":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "comfortable":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "expired":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Start a chat with a publication
  const startChat = (publication: Publication) => {
    setActiveChatPublication(publication);
  };

  return (
    <section aria-label="Overview Table">
      <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
        <div className="w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Aanbestedingen Overzicht</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Bekijk en monitor aanbestedingsmogelijkheden</p>
        </div>
      </div>

      <TableRoot className="border-t border-gray-200 dark:border-gray-800 w-full">
        <Table>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell>

                  <div className="relative min-h-60 w-full flex flex-col justify-center items-center my-6 bg-white shadow-sm border border-slate-200 rounded-lg p-2 dark:bg-[#090E1A]">
                    <div className="p-3 text-center">
                      <div className="flex justify-center mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="text-slate-400 w-10 h-10"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                          />
                        </svg>
                      </div>
                      <div className="flex justify-center mb-2">
                        <h5 className="text-slate-800 text-2xl font-semibold">
                          Aanbestedingen aan het laden...
                        </h5>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              publications.map((publication, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="w-full max-w-full border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900">
                      {/* Status banner - Green for active */}
                      <div className={`w-full py-2 px-4 flex flex-wrap justify-between items-center gap-2 text-xs font-medium text-white ${publication.is_active ? "bg-emerald-500" : "bg-amber-500"}`}>
                        <div className="flex items-center gap-1">
                          <CheckCircleIcon size={14} />
                          <span>{publication.is_active ? "Actieve aanbesteding" : "Inactieve aanbesting"}</span>
                        </div>

                        {publication.is_recommended && (
                          <div className="flex items-center gap-1 bg-white text-emerald-600 px-2 py-1 rounded-full text-xs font-medium">
                            <ThumbsUpIcon size={12} />
                            <span>ProcLogic aanbeveling</span>
                          </div>
                        )}
                      </div>

                      {/* Recommendation banner (if recommended) */}
                      {publication.is_recommended && (
                        <div className="w-full bg-blue-50 dark:bg-blue-900/20 px-4 py-2 border-b border-blue-100 dark:border-blue-800">
                          <div className="flex items-center gap-2">
                            <StarIcon size={14} className="text-amber-500 shrink-0" />
                            <span className="text-xs text-blue-800 dark:text-blue-200">
                              <strong>ProcLogic AI beveelt deze publicatie aan voor uw bedrijf</strong> gebaseerd op uw profiel en eerdere activiteit.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Content with padding */}
                      <div className="p-4 sm:p-6 flex flex-col gap-4">
                        {/* Header with time remaining badge */}
                        <div className="flex flex-col gap-2 w-full">
                          <div className="flex flex-wrap items-start justify-between gap-2 w-full">
                            <a href={`/publications/detail/${publication.workspace_id}`} target="_blank" className="text-base sm:text-lg font-semibold leading-tight break-words flex-1 min-w-0 hover:underline focus:outline-none">
                              {publication.title}
                            </a>

                            {/* Time remaining badge */}
                            <div className={`flex items-center shrink-0 gap-1 px-3 py-1 rounded-full text-xs font-medium ${getTimeRemainingStyles(getTimeRemaining(publication.submission_deadline).variant)}`}>
                              <ClockIcon size={12} />
                              <span>{getTimeRemaining(publication.submission_deadline).text}</span>
                            </div>
                          </div>
                          <a href={`/publications/detail/${publication.workspace_id}`} target="_blank" className="text-xs text-gray-500 dark:text-gray-400 hover:underline focus:outline-none">
                            ID: {publication.workspace_id}
                          </a>
                        </div>

                        {/* Description with proper wrapping */}
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words whitespace-normal">{publication.original_description}</p>

                        {/* Details grid - properly responsive layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                          <div className="flex items-start sm:items-center gap-2">
                            <BuildingIcon size={14} className="text-gray-400 mt-0.5 sm:mt-0 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-medium text-gray-500 dark:text-gray-400 block sm:inline sm:after:content-[':'] sm:after:mr-1">Organisatie</span>
                              <span className="text-gray-800 dark:text-gray-200 break-words">{publication.organisation}</span>
                            </div>
                          </div>

                          <div className="flex items-start sm:items-center gap-2">
                            <TagIcon size={14} className="text-gray-400 mt-0.5 sm:mt-0 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-medium text-gray-500 dark:text-gray-400 block sm:inline sm:after:content-[':'] sm:after:mr-1">Sector</span>
                              <span className="text-gray-800 dark:text-gray-200 break-words">{publication.sector}</span>
                            </div>
                          </div>

                          <div className="flex items-start sm:items-center gap-2">
                            <CodeIcon size={14} className="text-gray-400 mt-0.5 sm:mt-0 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-medium text-gray-500 dark:text-gray-400 block sm:inline sm:after:content-[':'] sm:after:mr-1">CPV Code</span>
                              <span className="text-gray-800 dark:text-gray-200 break-words">{publication.cpv_code}</span>
                            </div>
                          </div>

                          <div className="flex items-start sm:items-center gap-2">
                            <MapPinIcon size={14} className="text-gray-400 mt-0.5 sm:mt-0 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-medium text-gray-500 dark:text-gray-400 block sm:inline sm:after:content-[':'] sm:after:mr-1">Regio</span>
                              <span className="text-gray-800 dark:text-gray-200 break-words">{publication.region?.join(", ") || "N/A"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                        {/* Date badges */}
                        <div className="flex flex-col sm:flex-row gap-2 text-xs">
                          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-md w-full sm:w-auto">
                            <CalendarIcon size={14} className="shrink-0" />
                            <span className="whitespace-nowrap">Published: {formatDate(publication.publication_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-3 py-2 rounded-md w-full sm:w-auto">
                            <CalendarIcon size={14} className="shrink-0" />
                            <span className="whitespace-nowrap">Due: {formatDate(publication.submission_deadline)}</span>
                          </div>
                        </div>

                        {/* Action buttons - fully responsive */}
                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                          <Button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full sm:w-auto">
                            <PlusIcon size={16} />
                            <span>Opslaan</span>
                          </Button>
                          <Button
                            onClick={() => startChat(publication)}
                            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-md w-full sm:w-auto"
                          >
                            <RiChatSmile2Line className="size-5" />
                            <span>Analyze met ProcLogic AI</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableRoot>

      {/* Chat dialog */}
      {activeChatPublication && (
        <ChatComponent
          publicationId={activeChatPublication.workspace_id}
          onClose={() => setActiveChatPublication(null)}
        />
      )}
    </section>
  );
}