"use client"

import React from "react";

/**
 * Renders assistant text with the little markdown Procy actually emits.
 *
 * Procy is told to cite every tender and gunning it finds as a markdown link
 * built from the tool result's `url`. Rendering messages as plain text meant
 * those arrived on screen as literal `[Titel](https://...)`, which is worse
 * than no citation at all.
 *
 * This handles links, bare URLs and bold, and nothing else. A full markdown
 * library would pull a parser and its transitive dependencies into the bundle
 * to render three constructs.
 */

// [text](url) | bare http(s) URL | **bold**
const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s<>"')\]]+)|\*\*([^*]+)\*\*/g;

/**
 * Only absolute http(s) and site-relative paths are linkable.
 * Anything else -- javascript:, data:, protocol-relative -- renders as text.
 */
function safeHref(href: string): string | null {
    const trimmed = href.trim();
    if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
    try {
        const url = new URL(trimmed);
        return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
    } catch {
        return null;
    }
}

const linkClass =
    "underline underline-offset-2 decoration-astral-400 hover:decoration-astral-600 " +
    "text-astral-700 dark:text-astral-300 break-words";

export default function MessageContent({ content }: { content: string }) {
    if (!content) return null;

    const nodes: React.ReactNode[] = [];
    let cursor = 0;
    let key = 0;

    for (const match of content.matchAll(TOKEN)) {
        const index = match.index ?? 0;
        if (index > cursor) {
            nodes.push(content.slice(cursor, index));
        }

        const [raw, linkText, linkHref, bareUrl, boldText] = match;

        if (linkText !== undefined && linkHref !== undefined) {
            const href = safeHref(linkHref);
            nodes.push(
                href ? (
                    <a
                        key={key++}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                    >
                        {linkText}
                    </a>
                ) : (
                    linkText
                )
            );
        } else if (bareUrl !== undefined) {
            const href = safeHref(bareUrl);
            nodes.push(
                href ? (
                    <a
                        key={key++}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                    >
                        {bareUrl}
                    </a>
                ) : (
                    bareUrl
                )
            );
        } else if (boldText !== undefined) {
            nodes.push(
                <strong key={key++} className="font-semibold">
                    {boldText}
                </strong>
            );
        } else {
            nodes.push(raw);
        }

        cursor = index + raw.length;
    }

    if (cursor < content.length) {
        nodes.push(content.slice(cursor));
    }

    return <>{nodes}</>;
}
