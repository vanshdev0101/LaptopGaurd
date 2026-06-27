const API_BASE = "http://100.92.192.6:5000";

export interface Incident {
    Id: number;
    Timestamp: string;
    Username: string;
    LogonType: number;
    FailureReason: string;
    Photos: string[];
}

export interface UsbEvent {
    Id: number;
    Timestamp: string;
    DeviceName: string;
    EventType: string;
}

export interface AppEvent {
    Id: number;
    Timestamp: string;
    AppName: string;
    ExecutablePath: string;
    Publisher: string;
    ProcessId: number;
    IncidentId: number;
}

export interface Stats {
    total: number;
    today: number;
    photos: number;
}

async function api<T>(url: string, token: string): Promise<T> {
    const response = await fetch(
        `${API_BASE}${url}?token=${encodeURIComponent(token)}`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

export function verifyOtp(code: string) {
    return fetch(`${API_BASE}/api/verify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            code,
        }),
    }).then((r) => r.json());
}

export function getStats(token: string) {
    return api<Stats>("/api/stats", token);
}

export function getIncidents(token: string) {
    return api<Incident[]>("/api/incidents", token);
}

export function getUsbEvents(token: string) {
    return api<UsbEvent[]>("/api/usb", token);
}

export function getApps(token: string) {
    return api<AppEvent[]>("/api/apps", token);
}

export function getAppsForIncident(
    incidentId: number,
    token: string
) {
    return api<AppEvent[]>(
        `/api/apps/${incidentId}`,
        token
    );
}

export function photoUrl(path: string) {
    return `${API_BASE}${path}`;
}