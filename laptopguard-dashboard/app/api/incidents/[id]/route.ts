import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/auth';
import { getIncidentById, getAppEventsByIncident } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const token = req.nextUrl.searchParams.get('token') ?? '';
    if (!verifyOtp(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const incident = getIncidentById(Number(params.id));
    if (!incident) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const apps = getAppEventsByIncident(incident.Id).map(a => ({
        id: a.Id,
        timestamp: a.Timestamp,
        appName: a.AppName,
        executablePath: a.ExecutablePath,
        publisher: a.Publisher,
        processId: a.ProcessId,
    }));

    return NextResponse.json({
        id: incident.Id,
        timestamp: incident.Timestamp,
        username: incident.Username,
        logonType: incident.LogonType,
        failureReason: incident.FailureReason,
        uploaded: incident.Uploaded === 1,
        photos: incident.PhotoPaths
            ? incident.PhotoPaths.split(',').filter(Boolean).map(p => `/photo/${p.split('\\').pop()}`)
            : [],
        photoHashes: incident.PhotoHashes
            ? incident.PhotoHashes.split(',').filter(Boolean)
            : [],
        apps,
    });
}