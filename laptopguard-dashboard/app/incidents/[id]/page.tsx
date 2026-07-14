'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import DashboardShell from '@/components/layout/DashboardShell';

interface IncidentDetail {
    id: number;
    timestamp: string;
    username: string;
    logonType: number;
    failureReason: string;
    photos: string[];
    photoHashes: string[];
    apps: AppEvent[];
}

interface AppEvent {
    id: number;
    appName: string;
    executablePath: string;
    publisher: string;
    processId: number;
    timestamp: string;
}

const BASE = 'http://100.92.192.6:5000';

function decodeReason(raw: string): string {
    if (!raw) return '—';
    try { return decodeURIComponent(raw.replace(/\+/g, ' ')); }
    catch { return raw; }
}

function logonType(n: number): string {
    return ({ 2: 'Interactive', 3: 'Network', 4: 'Batch', 5: 'Service', 7: 'Unlock', 10: 'Remote', 11: 'Cached' } as Record<number, string>)[n] ?? `Type ${n}`;
}

function fmt(ts: string) {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function IncidentDetailPage() {
    const { token, ready } = useAuth();
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [incident, setIncident] = useState<IncidentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState<string | null>(null);

    useEffect(() => {
        if (!ready) return;
        if (!token) { window.location.href = '/login'; return; }
        fetch(`${BASE}/api/incidents/${id}?token=${token}`)
            .then(r => r.json())
            .then(async data => {
                // Also fetch apps for this incident
                const appsRes = await fetch(`${BASE}/api/apps/${id}?token=${token}`);
                const apps = appsRes.ok ? await appsRes.json() : [];
                setIncident({ ...data, apps });
            })
            .catch(() => router.push('/incidents'))
            .finally(() => setLoading(false));
    }, [ready, token, id]);

    if (!ready || loading) return (
        <DashboardShell>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', color: 'var(--primary)', animation: 'pulse 1.5s infinite' }}>⟳</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '0.15em', marginTop: '8px' }}>LOADING</div>
                </div>
            </div>
        </DashboardShell>
    );

    if (!incident) return null;

    return (
        <DashboardShell>
            <div className="fade-up">

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <button
                        onClick={() => router.push('/incidents')}
                        style={{
                            background: 'var(--bg-hover)', border: '1px solid var(--border)',
                            borderRadius: '8px', padding: '6px 14px', cursor: 'pointer',
                            fontSize: '12px', color: 'var(--text-secondary)',
                            transition: 'border-color 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
                    >
                        ← Back
                    </button>
                    <div>
                        <h1 className="title">Incident #{incident.id}</h1>
                        <p className="subtitle" style={{ marginTop: '4px' }}>{fmt(incident.timestamp)}</p>
                    </div>
                    <div style={{
                        marginLeft: 'auto', padding: '5px 12px', borderRadius: '8px',
                        background: 'var(--red-dim)', border: '1px solid rgba(252,165,165,0.2)',
                        fontSize: '9px', color: 'var(--red)', fontWeight: 700, letterSpacing: '0.12em',
                    }}>
                        ● SECURITY EVENT
                    </div>
                </div>

                {/* Info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                    {[
                        { label: 'USERNAME', value: incident.username },
                        { label: 'LOGON TYPE', value: logonType(incident.logonType) },
                        { label: 'FAILURE REASON', value: decodeReason(incident.failureReason) },
                    ].map(f => (
                        <div key={f.label} className="glass card-padding">
                            <div style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px' }}>
                                {f.label}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{f.value || '—'}</div>
                        </div>
                    ))}
                </div>

                {/* Photos */}
                <div className="glass" style={{ overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '2px', height: '14px', background: 'var(--blue)', borderRadius: '2px' }} />
                        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>
                            PHOTO EVIDENCE
                        </span>
                        <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)' }}>
                            {incident.photos.length} captured
                        </span>
                    </div>
                    {incident.photos.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                            No photos captured
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '12px', padding: '16px', overflowX: 'auto' }}>
                            {incident.photos.map((p, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setLightbox(`${BASE}${p}`)}
                                    style={{
                                        flexShrink: 0, cursor: 'pointer',
                                        borderRadius: '10px', overflow: 'hidden',
                                        border: '1px solid var(--border)',
                                        transition: 'border-color 0.15s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
                                >
                                    <img
                                        src={`${BASE}${p}`}
                                        alt={`Evidence ${idx + 1}`}
                                        style={{ height: '160px', width: 'auto', display: 'block' }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Hashes */}
                    {incident.photoHashes && incident.photoHashes.length > 0 && (
                        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                            {incident.photoHashes.map((h, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SHA-256 [{idx + 1}]</span>
                                    <span style={{ fontFamily: 'monospace', fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Apps */}
                <div className="glass" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '2px', height: '14px', background: 'var(--primary)', borderRadius: '2px' }} />
                        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>
                            RUNNING APPLICATIONS AT TIME OF INCIDENT
                        </span>
                        <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)' }}>
                            {incident.apps.length} captured
                        </span>
                    </div>
                    {incident.apps.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                            No applications captured — this incident may predate app monitoring
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['APPLICATION', 'EXECUTABLE', 'PUBLISHER', 'PID'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.12em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {incident.apps.map(a => (
                                    <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{a.appName}</td>
                                        <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: '10px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.executablePath || '—'}</td>
                                        <td style={{ padding: '11px 16px', fontSize: '11px', color: 'var(--text-muted)' }}>{a.publisher || '—'}</td>
                                        <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>{a.processId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>

            {/* Lightbox */}
            {lightbox && (
                <div
                    onClick={() => setLightbox(null)}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.85)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 999,
                    }}
                >
                    <button
                        onClick={() => setLightbox(null)}
                        style={{
                            position: 'absolute', top: '20px', right: '24px',
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '28px', color: 'var(--text-muted)',
                        }}
                    >✕</button>
                    <img
                        src={lightbox}
                        alt="Evidence"
                        style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '10px' }}
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}
        </DashboardShell>
    );
}