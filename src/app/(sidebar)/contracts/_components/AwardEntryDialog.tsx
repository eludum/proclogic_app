"use client"

import { siteConfig } from "@/app/siteConfig";
import { Button } from "@/components/Button";
import { useLatestRef } from "@/lib/useLatestRef";
import { useToast } from "@/lib/useToast";
import { useAuth } from "@clerk/nextjs";
import { AlertTriangle, FileUp, Loader2, Sparkles, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const API = siteConfig.api_base_url;

/** The fields a company may supply. Mirrors OVERRIDABLE_FIELDS on the API. */
export interface AwardFields {
    title: string;
    award_date: string;   // yyyy-mm-dd, what <input type="date"> wants
    winner: string;
    buyer: string;
    value: string;        // kept as a string so a half-typed number is not clobbered
    currency: string;
    reference_number: string;
    notes: string;
}

const EMPTY: AwardFields = {
    title: "", award_date: "", winner: "", buyer: "",
    value: "", currency: "EUR", reference_number: "", notes: "",
};

const FIELD_LABELS: Record<keyof AwardFields, string> = {
    title: "Omschrijving",
    award_date: "Gunningsdatum",
    winner: "Opdrachtnemer",
    buyer: "Aanbestedende dienst",
    value: "Gegund bedrag",
    currency: "Valuta",
    reference_number: "Referentie",
    notes: "Notities",
};

/** Values already on the BOSA row, shown as placeholders so it is obvious what is being completed. */
export interface BosaValues {
    title?: string | null;
    award_date?: string | null;
    winner?: string | null;
    buyer?: string | null;
    value?: number | null;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    /** Set for an existing BOSA award; null when creating one of the company's own. */
    publicationId?: string | null;
    /** Set when editing an award the company created earlier. */
    entryId?: number | null;
    bosa?: BosaValues;
    onSaved?: () => void;
}

function toDateInput(value?: string | null): string {
    if (!value) return "";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export default function AwardEntryDialog({
    isOpen, onClose, publicationId = null, entryId = null, bosa, onSaved,
}: Props) {
    const { getToken } = useAuth();
    const getTokenRef = useLatestRef(getToken);
    const { toast } = useToast();

    const [fields, setFields] = useState<AwardFields>(EMPTY);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [hasEntry, setHasEntry] = useState(false);
    // Which fields the model filled in this session, so they can be flagged for
    // a second look rather than blending in with values the user typed.
    const [aiFilled, setAiFilled] = useState<Set<keyof AwardFields>>(new Set());
    const [warnings, setWarnings] = useState<string[]>([]);
    const [documentName, setDocumentName] = useState<string | null>(null);

    const set = (key: keyof AwardFields, value: string) => {
        setFields(prev => ({ ...prev, [key]: value }));
        // Once a person edits a field it is theirs, not the model's.
        setAiFilled(prev => {
            if (!prev.has(key)) return prev;
            const next = new Set(prev);
            next.delete(key);
            return next;
        });
    };

    const loadExisting = useCallback(async () => {
        if (!publicationId) return;
        setLoading(true);
        try {
            const token = await getTokenRef.current();
            const res = await fetch(`${API}/contracts/${publicationId}/entry`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;
            const data = await res.json();
            if (!data) return;
            setHasEntry(true);
            setDocumentName(data.source_document_name ?? null);
            setFields({
                title: data.title ?? "",
                award_date: toDateInput(data.award_date),
                winner: data.winner ?? "",
                buyer: data.buyer ?? "",
                value: data.value != null ? String(data.value) : "",
                currency: data.currency ?? "EUR",
                reference_number: data.reference_number ?? "",
                notes: data.notes ?? "",
            });
        } catch (e) {
            console.error("Kon eigen gegevens niet laden", e);
        } finally {
            setLoading(false);
        }
    }, [publicationId, getTokenRef]);

    useEffect(() => {
        if (!isOpen) return;
        setFields(EMPTY);
        setAiFilled(new Set());
        setWarnings([]);
        setHasEntry(false);
        setDocumentName(null);
        void loadExisting();
    }, [isOpen, loadExisting]);

    const handleUpload = async (file: File) => {
        setExtracting(true);
        setWarnings([]);
        try {
            const token = await getTokenRef.current();
            const body = new FormData();
            body.append("file", file);
            const res = await fetch(`${API}/contracts/extract-document`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body,
            });
            if (!res.ok) {
                const detail = await res.json().catch(() => null);
                throw new Error(detail?.detail || `Upload mislukt (${res.status})`);
            }
            const data = await res.json();

            // Only fill fields the user has not already filled in themselves.
            const filled = new Set<keyof AwardFields>();
            setFields(prev => {
                const next = { ...prev };
                const apply = (key: keyof AwardFields, value: unknown) => {
                    if (value === null || value === undefined || value === "") return;
                    if (next[key]) return;
                    next[key] = key === "award_date"
                        ? toDateInput(String(value))
                        : String(value);
                    filled.add(key);
                };
                apply("title", data.title);
                apply("award_date", data.award_date);
                apply("winner", data.winner);
                apply("buyer", data.buyer);
                apply("value", data.value);
                apply("currency", data.currency);
                apply("reference_number", data.reference_number);
                apply("notes", data.notes);
                return next;
            });
            setAiFilled(filled);
            setWarnings(data.warnings ?? []);
            setDocumentName(data.source_document_name ?? file.name);

            if (filled.size === 0) {
                toast({
                    title: "Niets gevonden",
                    description: "Er kon niets uit dit document gehaald worden. Vul de gegevens handmatig in.",
                    variant: "warning",
                });
            }
        } catch (e) {
            toast({
                title: "Uploaden mislukt",
                description: e instanceof Error ? e.message : "Onbekende fout",
                variant: "error",
            });
        } finally {
            setExtracting(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = await getTokenRef.current();
            const payload: Record<string, unknown> = {
                source: aiFilled.size > 0 || documentName ? "pdf" : "manual",
                source_document_name: documentName,
                title: fields.title || null,
                award_date: fields.award_date ? `${fields.award_date}T00:00:00` : null,
                winner: fields.winner || null,
                buyer: fields.buyer || null,
                value: fields.value ? Number(fields.value) : null,
                currency: fields.currency || null,
                reference_number: fields.reference_number || null,
                notes: fields.notes || null,
            };

            const url = publicationId
                ? `${API}/contracts/${publicationId}/entry`
                : entryId
                    ? `${API}/company-awards/${entryId}`
                    : `${API}/company-awards`;
            const method = publicationId ? "PUT" : entryId ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const detail = await res.json().catch(() => null);
                throw new Error(detail?.detail || `Opslaan mislukt (${res.status})`);
            }
            toast({
                title: "Opgeslagen",
                description: "Alleen jouw bedrijf ziet deze gegevens.",
                variant: "success",
            });
            onSaved?.();
            onClose();
        } catch (e) {
            toast({
                title: "Opslaan mislukt",
                description: e instanceof Error ? e.message : "Onbekende fout",
                variant: "error",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleRevert = async () => {
        if (!publicationId) return;
        setSaving(true);
        try {
            const token = await getTokenRef.current();
            const res = await fetch(`${API}/contracts/${publicationId}/entry`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Verwijderen mislukt (${res.status})`);
            toast({
                title: "Teruggezet",
                description: "De oorspronkelijke gegevens zijn weer zichtbaar.",
                variant: "success",
            });
            onSaved?.();
            onClose();
        } catch (e) {
            toast({
                title: "Verwijderen mislukt",
                description: e instanceof Error ? e.message : "Onbekende fout",
                variant: "error",
            });
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const busy = saving || extracting || loading;

    const textField = (
        key: keyof AwardFields,
        placeholder?: string | null,
        type: "text" | "date" | "number" = "text",
    ) => (
        <div>
            <div className="flex items-center gap-2 mb-1">
                <label htmlFor={key} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {FIELD_LABELS[key]}
                </label>
                {aiFilled.has(key) && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        <Sparkles size={11} /> uit PDF — controleer
                    </span>
                )}
            </div>
            <input
                id={key}
                type={type}
                inputMode={type === "number" ? "decimal" : undefined}
                value={fields[key]}
                onChange={(e) => set(key, e.target.value)}
                disabled={busy}
                placeholder={placeholder ? `${placeholder}` : undefined}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-astral-500 dark:bg-gray-800 dark:text-white ${aiFilled.has(key)
                    ? "border-amber-400 dark:border-amber-600"
                    : "border-gray-300 dark:border-gray-700"
                    }`}
            />
            {placeholder && !fields[key] && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Huidige waarde: {placeholder}
                </p>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                    aria-label="Sluiten"
                >
                    <X size={20} />
                </button>

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {publicationId ? "Gunning aanvullen" : entryId ? "Gunning bewerken" : "Gunning toevoegen"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                    {publicationId
                        ? "Vul aan wat ontbreekt of corrigeer wat niet klopt. De oorspronkelijke gegevens blijven bewaard en alleen jouw bedrijf ziet je aanvullingen."
                        : "Voeg een gunning toe die niet gepubliceerd is. Alleen jouw bedrijf ziet deze."}
                </p>

                <div className="mb-5 rounded-md border border-dashed border-gray-300 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Gunningsdocument uploaden
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                PDF — de velden hieronder worden ingevuld, niets wordt opgeslagen tot je bevestigt.
                            </p>
                            {documentName && (
                                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{documentName}</p>
                            )}
                        </div>
                        <label className="shrink-0">
                            <input
                                type="file"
                                accept="application/pdf,.pdf"
                                className="hidden"
                                disabled={busy}
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    e.target.value = "";
                                    if (f) void handleUpload(f);
                                }}
                            />
                            <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${busy
                                ? "bg-gray-100 text-gray-400 dark:bg-gray-800 cursor-not-allowed"
                                : "bg-astral-600 text-white hover:bg-astral-700"
                                }`}>
                                {extracting ? <Loader2 size={15} className="animate-spin" /> : <FileUp size={15} />}
                                {extracting ? "Bezig met lezen..." : "PDF kiezen"}
                            </span>
                        </label>
                    </div>

                    {warnings.length > 0 && (
                        <div className="mt-3 flex gap-2 rounded-md bg-amber-50 dark:bg-amber-900/20 p-3">
                            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-800 dark:text-amber-300">
                                <p className="font-medium mb-1">Even nakijken:</p>
                                <ul className="list-disc list-inside space-y-0.5">
                                    {warnings.map((w, i) => <li key={i}>{w}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">{textField("title", bosa?.title)}</div>
                    {textField("winner", bosa?.winner)}
                    {textField("buyer", bosa?.buyer)}
                    {textField("value", bosa?.value != null && bosa.value > 0 ? String(bosa.value) : null, "number")}
                    {textField("currency")}
                    {textField("award_date", bosa?.award_date ? toDateInput(bosa.award_date) : null, "date")}
                    {textField("reference_number")}
                    <div className="md:col-span-2">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {FIELD_LABELS.notes}
                        </label>
                        <textarea
                            id="notes"
                            rows={3}
                            value={fields.notes}
                            onChange={(e) => set("notes", e.target.value)}
                            disabled={busy}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-astral-500 dark:bg-gray-800 dark:text-white resize-none"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center gap-2 mt-6">
                    <div>
                        {hasEntry && publicationId && (
                            <button
                                type="button"
                                onClick={handleRevert}
                                disabled={busy}
                                className="inline-flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                            >
                                <Trash2 size={14} /> Eigen gegevens verwijderen
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
                            Annuleren
                        </Button>
                        <Button type="button" onClick={handleSave} disabled={busy}>
                            {saving ? "Opslaan..." : "Opslaan"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
