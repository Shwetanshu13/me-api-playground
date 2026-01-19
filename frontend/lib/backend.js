function normalizeBaseUrl(value) {
    if (!value) return null;
    return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getBackendBaseUrl() {
    return (
        normalizeBaseUrl(process.env.BACKEND_BASE_URL) ||
        normalizeBaseUrl(process.env.NEXT_PUBLIC_BACKEND_BASE_URL) ||
        "http://localhost:3001"
    );
}

export function buildBackendUrl(pathname, searchParams) {
    const base = getBackendBaseUrl();
    const url = new URL(`${base}${pathname.startsWith("/") ? "" : "/"}${pathname}`);
    if (searchParams) {
        for (const [key, value] of searchParams.entries()) {
            url.searchParams.set(key, value);
        }
    }
    return url;
}

export async function fetchBackendJson(pathname, { searchParams, ...init } = {}) {
    const url = buildBackendUrl(pathname, searchParams);
    const res = await fetch(url, {
        ...init,
        headers: {
            accept: "application/json",
            ...(init.headers || {}),
        },
        cache: init.cache ?? "no-store",
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const body = isJson ? await res.json() : await res.text();

    if (!res.ok) {
        const message =
            typeof body === "string" && body
                ? body
                : JSON.stringify(body || { error: res.statusText });
        const err = new Error(`Backend request failed (${res.status}): ${message}`);
        err.status = res.status;
        err.body = body;
        throw err;
    }

    return body;
}
