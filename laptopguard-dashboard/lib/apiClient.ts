import { API_BASE } from "./config";

export async function proxy(
    path: string,
    auth: string
): Promise<Response> {

    return fetch(`${API_BASE}${path}`, {
        headers: {
            Authorization: auth,
        },
        cache: "no-store",
    });
}