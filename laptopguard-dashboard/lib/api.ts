const BASE = 'http://100.92.192.6:5000';

export interface Stats {
    total: number;
    today: number;
    photos: number;
}

export interface Incident {
    id: number;
    timestamp: string;
    username: string;
    logonType: number;
    failureReason: string;
    uploaded: boolean;
    photos: string[];
    photoHashes: string[];
}

export interface UsbEvent {
    id: number;
    timestamp: string;
    eventType: string;
    deviceName: string;
    deviceType: string;
    vendorId: string;
    productId: string;
    serialNumber: string;
    driveLetter: string;
    duringIncident: boolean;
}

export interface AppEvent {
    id: number;
    timestamp: string;
    appName: string;
    executablePath: string;
    publisher: string;
    processId: number;
    incidentId: number;
}

export async function getStats(token: string): Promise<Stats> {
    const r = await fetch(`${BASE}/api/stats?token=${token}`, { cache: 'no-store' });
    if (r.status === 401) throw new Error('Unauthorized');
    if (!r.ok) throw new Error('ServerError');
    return r.json();
}

export async function getIncidents(token: string): Promise<Incident[]> {
    const r = await fetch(`${BASE}/api/incidents?token=${token}`, { cache: 'no-store' });
    if (r.status === 401) throw new Error('Unauthorized');
    if (!r.ok) throw new Error('ServerError');
    return r.json();
}

export async function getUsbEvents(token: string): Promise<UsbEvent[]> {
    const r = await fetch(`${BASE}/api/usb?token=${token}`, { cache: 'no-store' });
    if (r.status === 401) throw new Error('Unauthorized');
    if (!r.ok) throw new Error('ServerError');
    return r.json();
}

export async function getAppEvents(token: string): Promise<AppEvent[]> {
    const r = await fetch(`${BASE}/api/apps?token=${token}`, { cache: 'no-store' });
    if (r.status === 401) throw new Error('Unauthorized');
    if (!r.ok) throw new Error('ServerError');
    return r.json();
}

export async function verifyOtp(code: string): Promise<{ success: boolean; sessionToken: string | null }> {
    const r = await fetch(`${BASE}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
    });
    return r.json();
}

export function photoUrl(filename: string): string {
    return `${BASE}/photo/${filename}`;
}