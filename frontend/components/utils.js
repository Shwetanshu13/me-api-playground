export function classNames(...values) {
    return values.filter(Boolean).join(" ");
}

export function formatLinks(links) {
    if (!links) return [];
    if (Array.isArray(links)) return links.filter(Boolean);
    if (typeof links === "string") {
        return links
            .split(/\s*,\s*|\s*\n\s*/g)
            .map((s) => s.trim())
            .filter(Boolean);
    }
    return [];
}
