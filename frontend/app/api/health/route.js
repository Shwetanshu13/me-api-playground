import { NextResponse } from "next/server";
import { buildBackendUrl } from "../../../lib/backend";

export async function GET(request) {
    const url = buildBackendUrl("/health", request.nextUrl.searchParams);
    const res = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });
    const text = await res.text();

    return new NextResponse(text, {
        status: res.status,
        headers: {
            "content-type": res.headers.get("content-type") || "application/json",
        },
    });
}
