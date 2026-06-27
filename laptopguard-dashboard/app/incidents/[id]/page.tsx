'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getIncidentById, getAppEventsByIncident, getUsbEvents, photoUrl, Incident, AppEvent, UsbEvent } from '@/lib/api';

function decodeReason(raw: string): string {
    if (!raw) return '—';
    try { return decodeURIComponent(raw.replace(/\+/g, ' ')); }
    catch { return raw; }
}

function formatTs(ts: string): string {
    const d = new Date(ts);
    return d.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
    } as Intl.DateTimeFormatOptions);
}

function getAppIcon(name: string): string {
    const n = name?.toLowerCase() || '';
    if (n.includes('chrome')) return '🌐';
    if (n.includes('firefox')) return '🦊';
    if (n.includes('edge')) return '🌀';
    if (n.includes('code') || n.includes('vscode')) return '💻';
    if (n.includes('terminal') || n.includes('cmd') || n.includes('powershell')) return '⬛';
    if (n.includes('notepad')) return '📝';
    if (n.includes('explorer')) return '📁';
    if (n.includes('discord') || n.includes('slack') || n.includes('teams')) return '💬';
    return '⚙️';
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 16,
            padding: '12px 0', borderBottom: '1px solid var(--border)',
        }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', minWidth: 140 }}>
                {label}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text)', flex: 1, wordBreak: 'break-all' }}>
                {value}
            </span>
        </div>
    );
}

export default function IncidentDetailPage() {
    const { token, ready } = useAuth();
    const params = useParams();
    const id = Number(params.id);

    const [incident, setIncident] = useState<Incident | null>(null);
    const [apps, setApps] = useState<AppEvent[]>([]);
    const [usbNearby, setUsbNearby] = useState<UsbEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
    const [lightboxIdx, setLightboxIdx] = useState(0);

    useEffect(() => {
        if (!ready) return;
        if (!token) { window.location.href = '/login'; return; }

        Promise.all([
            getIncidentById(id, token),
            getAppEventsByIncident(id, token),
            getUsbEvents(token),
        ]).then(([inc, appData, usbData]) => {
            setIncident(inc);
            setApps(appData);
            // Find USB events around ±5 minutes of incident
            if (inc) {
                const incTime = new Date(inc.Timestamp).getTime();
                const nearby = usbData.filter(u => {
                    const diff = Math.abs(new Date(u.Timestamp).getTime() - incTime);
                    return diff <= 5 * 60 * 1000;
                });
                setUsbNearby(nearby);
            }
            setLoading(false);
        }).catch(e => {
            setError(e.message);
            setLoading(false);
        });
    }, [ready, token, id]);

    const photos = incident?.Photos || [];

    function openLightbox(filename: string, idx: number) {
        setLightboxPhoto(filename);
        setLightboxIdx(idx);
    }

    useEffect(() => {
        if (!lightboxPhoto) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightboxPhoto(null);
            if (e.key === 'ArrowLeft') {
                const newIdx = (lightboxIdx - 1 + photos.length) % photos.length;
                setLightboxPhoto(photos[newIdx]);
                setLightboxIdx(newIdx);
            }
            if (e.key === 'ArrowRight') {
                const newIdx = (lightboxIdx + 1) % photos.length;
                setLightboxPhoto(photos[newIdx]);
                setLightboxIdx(newIdx);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightboxPhoto, lightboxIdx, photos]);

    if (loading) return (
        <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            Loading incident...
        </div>
    );

    if (error || !incident) return (
        <div style={{ padding: 64, textAlign: 'center', color: 'var(--red)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            {error || 'Incident not found'}
            <div style={{ marginTop: 20 }}>
                <a href="/incidents" style={{ color: 'var(--primary)', fontSize: 14, textDecoration: 'none' }}>← Back to Incidents</a>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '32px 36px', minHeight: '100vh' }}>
            {/* Breadcrumb */}
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <a href="/incidents" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>Incidents</a>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>›</span>
                <span style={{ color: 'var(--text)', fontSize: 13, fontWeight: 500 }}>Incident #{incident.Id}</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 32 }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 12, background: 'rgba(252,165,165,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
                }}>🚨</div>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>
                        Failed Login — Incident #{incident.Id}
                    </h1>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {formatTs(incident.Timestamp)} · User: <span style={{ color: 'var(--red)', fontFamily: 'monospace' }}>{incident.Username}</span>
                    </div>
                </div>
                <span style={{
                    marginLeft: 'auto', padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: 'rgba(252,165,165,0.1)', color: 'var(--red)', border: '1px solid rgba(252,165,165,0.2)',
                }}>
                    FAILED LOGIN
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Incident Info */}
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '20px 24px',
                }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Event Details
                    </div>
                    <InfoRow label="Timestamp" value={formatTs(incident.Timestamp)} />
                    <InfoRow label="Username" value={incident.Username} />
                    <InfoRow label="Logon Type" value={String(incident.LogonType)} />
                    <InfoRow label="Failure Reason" value={decodeReason(incident.FailureReason)} />
                    <InfoRow label="Event Record ID" value={String(incident.EventRecordId)} />
                    <InfoRow label="Photos Taken" value={String(photos.length)} />
                </div>

                {/* Nearby USB */}
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '20px 24px',
                }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--yellow)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        USB Events ±5 min
                    </div>
                    {usbNearby.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>No USB activity near this incident.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {usbNearby.map(u => {
                                const isInsert = u.EventType?.toLowerCase().includes('insert') || u.EventType?.toLowerCase().includes('connect') || u.EventType?.toLowerCase().includes('arrival');
                                return (
                                    <div key={u.Id} style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '10px 14px', borderRadius: 8,
                                        background: isInsert ? 'rgba(134,239,172,0.05)' : 'rgba(252,165,165,0.05)',
                                        border: `1px solid ${isInsert ? 'rgba(134,239,172,0.15)' : 'rgba(252,165,165,0.15)'}`,
                                    }}>
                                        <span style={{ fontSize: 16 }}>🔌</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{u.DeviceName || 'Unknown Device'}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatTs(u.Timestamp)}</div>
                                        </div>
                                        <span style={{
                                            fontSize: 11, fontWeight: 600,
                                            color: isInsert ? 'var(--green)' : 'var(--red)',
                                        }}>
                                            {isInsert ? '↑ IN' : '↓ OUT'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Photo Strip */}
            {photos.length > 0 && (
                <div style={{
                    marginTop: 20, background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '20px 24px',
                }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        📸 Photo Evidence ({photos.length})
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {photos.map((f, idx) => (
                            <div
                                key={f}
                                onClick={() => openLightbox(f, idx)}
                                style={{
                                    width: 160, height: 120, borderRadius: 8, overflow: 'hidden',
                                    cursor: 'pointer', border: '1px solid var(--border)',
                                    transition: 'transform 0.15s, border-color 0.15s',
                                    flexShrink: 0,
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.04)';
                                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-strong)';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                                }}
                            >
                                <img
                                    src={photoUrl(f)}
                                    alt={`Evidence ${idx + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Apps */}
            {apps.length > 0 && (
                <div style={{
                    marginTop: 20, background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', overflow: 'hidden',
                }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            ⚙️ Running Applications ({apps.length})
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Application', 'Executable Path', 'Publisher', 'PID'].map(h => (
                                    <th key={h} style={{
                                        padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600,
                                        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
                                        background: 'rgba(255,255,255,0.01)',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {apps.map((a, i) => (
                                <tr
                                    key={a.Id}
                                    style={{ borderBottom: i < apps.length - 1 ? '1px solid var(--border)' : 'none' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '11px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 16 }}>{getAppIcon(a.AppName)}</span>
                                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{a.AppName}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '11px 20px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {a.ExecutablePath || '—'}
                                    </td>
                                    <td style={{ padding: '11px 20px', fontSize: 12, color: 'var(--text-secondary)' }}>
                                        {a.Publisher || '—'}
                                    </td>
                                    <td style={{ padding: '11px 20px', fontSize: 12, color: 'var(--blue)', fontFamily: 'monospace' }}>
                                        {a.ProcessId}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Lightbox */}
            {lightboxPhoto && (
                <div
                    onClick={() => setLightboxPhoto(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0,0,0,0.93)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <button
                        onClick={() => setLightboxPhoto(null)}
                        style={{
                            position: 'absolute', top: 20, right: 24, background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
                            color: '#fff', fontSize: 14, padding: '6px 14px', cursor: 'pointer',
                        }}
                    >✕ Close</button>

                    {photos.length > 1 && (
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                const newIdx = (lightboxIdx - 1 + photos.length) % photos.length;
                                setLightboxPhoto(photos[newIdx]);
                                setLightboxIdx(newIdx);
                            }}
                            style={{
                                position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)',
                                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: 8, color: '#fff', fontSize: 20, padding: '12px 16px', cursor: 'pointer',
                            }}
                        >‹</button>
                    )}

                    <div onClick={e => e.stopPropagation()}>
                        <img
                            src={photoUrl(lightboxPhoto)}
                            alt="Evidence"
                            style={{ maxWidth: '80vw', maxHeight: '75vh', objectFit: 'contain', borderRadius: 10, display: 'block' }}
                        />
                        <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                            {lightboxIdx + 1} of {photos.length} · Esc to close
                        </div>
                    </div>

                    {photos.length > 1 && (
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                const newIdx = (lightboxIdx + 1) % photos.length;
                                setLightboxPhoto(photos[newIdx]);
                                setLightboxIdx(newIdx);
                            }}
                            style={{
                                position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)',
                                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: 8, color: '#fff', fontSize: 20, padding: '12px 16px', cursor: 'pointer',
                            }}
                        >›</button>
                    )}
                </div>
            )}
        </div>
    );
}
