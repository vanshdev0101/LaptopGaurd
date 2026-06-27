import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

export async function GET(req: NextRequest) {
    const auth = req.headers.get("authorization") ?? "";

    const response = await fetch(`${API_BASE}/api/incidents`, {
        headers: {
            Authorization: auth,
        },
        cache: "no-store",
    });

    return NextResponse.json(await response.json(), {
        status: response.status,
    });
}