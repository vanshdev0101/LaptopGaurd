import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

export async function GET(req: NextRequest) {
    const auth = req.headers.get("authorization") ?? "";

    const response = await fetch(`${API_BASE}/api/stats`, {
        headers: {
            Authorization: auth,
        },
        cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data, {
        status: response.status,
    });
}