'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getAppEvents, AppEvent } from '@/lib/api';
import DashboardShell from '@/components/layout/DashboardShell';

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
    if (n.includes('task')) return '📋';
    if (n.includes('word') || n.includes('excel') || n.includes('office')) return '📄';
    if (n.includes('steam') || n.includes('game')) return '🎮';
    if (n.includes('discord') || n.includes('slack') || n.includes('teams')) return '💬';
    return '⚙️';
}

export default function ApplicationsPage() {
    const { token, ready } = useAuth();
    const [events, setEvents] = useState<AppEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [groupBy, setGroupBy] = useState<'flat' | 'app'>('flat');

    useEffect(() => {
        if (!ready) return;
        if (!token) { window.location.href = '/login'; return; }
        getAppEvents(token)
            .then(data => { setEvents(data); setLoading(false); })
            .catch(e => { setError(e.message); setLoading(false); });
    }, [ready, token]);

    const filtered = events.filter(e => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            e.appName?.toLowerCase().includes(q) ||
            e.executablePath?.toLowerCase().includes(q) ||
            e.publisher?.toLowerCase().includes(q)
        );
    });

    const grouped = filtered.reduce<Record<string, AppEvent[]>>((acc, e) => {
        const key = e.appName || 'Unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(e);
        return acc;
    }, {});
    const sortedGroups = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);

    const uniqueApps = new Set(events.map(e => e.appName)).size;
    const linkedToIncident = events.filter(e => e.incidentId !== null && e.incidentId !== undefined).length;

    return (
        <DashboardShell>
            <div style={{ padding: '32px 36px', minHeight: '100vh' }}>

                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(125,211,252,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚙️</div>
                        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Applications</h1>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14, paddingLeft: 48 }}>
                        Running processes captured at the time of failed login attempts.
                    </p>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                    {[
                        { label: 'Total Captures', value: events.length, color: 'var(--primary)' },
                        { label: 'Unique Applications', value: uniqueApps, color: 'var(--blue)' },
                        { label: 'Linked to Incidents', value: linkedToIncident, color: 'var(--yellow)' },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px', borderTop: `3px solid ${color}` }}>
                            <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search app name, path, publisher..."
                            style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px 8px 34px', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {([['flat', 'All Events'], ['app', 'Group by App']] as ['flat' | 'app', string][]).map(([val, lbl]) => (
                            <button key={val} onClick={() => setGroupBy(val)} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: groupBy === val ? '1px solid var(--primary)' : '1px solid var(--border)', background: groupBy === val ? 'rgba(167,139,250,0.15)' : 'transparent', color: groupBy === val ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer' }}>
                                {lbl}
                            </button>
                        ))}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>⏳ Loading applications...</div>
                ) : error ? (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 48, textAlign: 'center', color: 'var(--red)' }}>⚠️ {error}</div>
                ) : groupBy === 'app' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {sortedGroups.map(([appName, appEvents]) => (
                            <div key={appName} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)' }}>
                                    <span style={{ fontSize: 20 }}>{getAppIcon(appName)}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{appName}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                            {appEvents[0]?.publisher || 'Unknown Publisher'} · {appEvents[0]?.executablePath || ''}
                                        </div>
                                    </div>
                                    <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(167,139,250,0.1)', color: 'var(--primary)', border: '1px solid rgba(167,139,250,0.2)' }}>
                                        {appEvents.length}×
                                    </span>
                                </div>
                                <div style={{ padding: '8px 0' }}>
                                    {appEvents.slice(0, 5).map(e => (
                                        <div key={e.id} style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
                                            <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', minWidth: 180 }}>{formatTs(e.timestamp)}</span>
                                            <span>PID: <span style={{ color: 'var(--blue)', fontFamily: 'monospace' }}>{e.processId}</span></span>
                                            {e.incidentId && (
                                                <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, background: 'rgba(252,211,77,0.1)', color: 'var(--yellow)', border: '1px solid rgba(252,211,77,0.2)' }}>
                                                    Incident #{e.incidentId}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    {appEvents.length > 5 && <div style={{ padding: '8px 20px', fontSize: 12, color: 'var(--text-muted)' }}>+{appEvents.length - 5} more</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                        {filtered.length === 0 ? (
                            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>⚙️ No application records found.</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        {['App', 'Executable Path', 'Publisher', 'PID', 'Timestamp', 'Incident'].map(h => (
                                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((e, i) => (
                                        <tr key={e.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                                            onMouseEnter={el => (el.currentTarget.style.background = 'var(--bg-hover)')}
                                            onMouseLeave={el => (el.currentTarget.style.background = 'transparent')}>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ fontSize: 16 }}>{getAppIcon(e.appName)}</span>
                                                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{e.appName || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.executablePath || '—'}</td>
                                            <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>{e.publisher || '—'}</td>
                                            <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--blue)', fontFamily: 'monospace' }}>{e.processId}</td>
                                            <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{formatTs(e.timestamp)}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                {e.incidentId ? (
                                                    <a href={`/incidents/${e.incidentId}`} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(252,211,77,0.1)', color: 'var(--yellow)', border: '1px solid rgba(252,211,77,0.2)', textDecoration: 'none' }}>#{e.incidentId}</a>
                                                ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

            </div>
        </DashboardShell>
    );
}
