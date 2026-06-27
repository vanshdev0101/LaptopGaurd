'use client';
import DashboardShell from '@/components/layout/DashboardShell';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getIncidents, type Incident } from '@/lib/api';

function decodeReason(raw: string): string {
    if (!raw) return '—';
    try { return decodeURIComponent(raw.replace(/\+/g, ' ')); }
    catch { return raw; }
}

export default function IncidentsPage() {
    const { token, ready } = useAuth();
    const router = useRouter();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ready) return;
        if (!token) { window.location.href = '/login'; return; }
        getIncidents(token).then(setIncidents).finally(() => setLoading(false));
    }, [ready, token]);

    function fmt(ts: string) {
        const d = new Date(ts);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    }

    return (
        <DashboardShell>
            <div className="fade-up">
                <div style={{ marginBottom: '20px' }}>
                    <h1 className="title">Incidents</h1>
                    <p className="subtitle" style={{ marginTop: '4px' }}>All recorded failed login attempts</p>
                </div>
                <div className="glass" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '2px', height: '14px', background: 'var(--red)', borderRadius: '2px' }} />
                        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>ALL INCIDENTS</span>
                        <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)' }}>{incidents.length} total</span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['#', 'TIMESTAMP', 'USERNAME', 'LOGON TYPE', 'REASON', 'EVIDENCE', ''].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.12em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
                            ) : incidents.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No incidents recorded</td></tr>
                            ) : incidents.map(i => (
                                <tr
                                    key={i.id}
                                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                    onClick={() => router.push(`/incidents/${i.id}`)}
                                >
                                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>#{i.id}</td>
                                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmt(i.timestamp)}</td>
                                    <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{i.username}</td>
                                    <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)' }}>{i.logonType}</td>
                                    <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)' }}>{decodeReason(i.failureReason)}</td>
                                    <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--blue)' }}>{i.photos.length} 📷</td>
                                    <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--primary)' }}>View →</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardShell>
    );
}