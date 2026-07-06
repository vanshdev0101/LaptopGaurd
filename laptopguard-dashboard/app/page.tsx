'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getUsbEvents, UsbEvent } from '@/lib/api';
import DashboardShell from '@/components/layout/DashboardShell';

type Filter = 'all' | 'today' | '7days' | '30days';
type EventFilter = 'all' | 'insert' | 'remove';

function filterByDate(events: UsbEvent[], range: Filter): UsbEvent[] {
    if (range === 'all') return events;
    const now = new Date();
    const cutoff = new Date();
    if (range === 'today') cutoff.setHours(0, 0, 0, 0);
    else if (range === '7days') cutoff.setDate(now.getDate() - 7);
    else if (range === '30days') cutoff.setDate(now.getDate() - 30);
    return events.filter(e => new Date(e.timestamp) >= cutoff);
}

function formatTs(ts: string): string {
    const d = new Date(ts);
    return d.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
    } as Intl.DateTimeFormatOptions);
}

function isInsertEvent(eventType: string): boolean {
    return eventType?.toLowerCase().includes('insert') ||
        eventType?.toLowerCase().includes('connect') ||
        eventType?.toLowerCase().includes('arrival');
}

function EventTypeBadge({ type }: { type: string }) {
    const ins = isInsertEvent(type);
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: ins ? 'rgba(134,239,172,0.1)' : 'rgba(252,165,165,0.1)',
            color: ins ? 'var(--green)' : 'var(--red)',
            border: `1px solid ${ins ? 'rgba(134,239,172,0.2)' : 'rgba(252,165,165,0.2)'}`,
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: ins ? 'var(--green)' : 'var(--red)', display: 'inline-block' }} />
            {ins ? 'Connected' : 'Removed'}
        </span>
    );
}

function IncidentBadge({ during }: { during: boolean }) {
    if (!during) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: 'rgba(252,211,77,0.1)', color: 'var(--yellow)',
            border: '1px solid rgba(252,211,77,0.2)',
        }}>
            ⚠ During Incident
        </span>
    );
}

export default function UsbPage() {
    const { token, ready } = useAuth();
    const [events, setEvents] = useState<UsbEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dateFilter, setDateFilter] = useState<Filter>('all');
    const [eventFilter, setEventFilter] = useState<EventFilter>('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!ready) return;
        if (!token) { window.location.href = '/login'; return; }
        getUsbEvents(token)
            .then(data => { setEvents(data); setLoading(false); })
            .catch(e => { setError(e.message); setLoading(false); });
    }, [ready, token]);

    const filtered = filterByDate(events, dateFilter).filter(e => {
        if (eventFilter !== 'all') {
            const ins = isInsertEvent(e.eventType);
            if (eventFilter === 'insert' && !ins) return false;
            if (eventFilter === 'remove' && ins) return false;
        }
        if (search) {
            const q = search.toLowerCase();
            return (
                e.deviceName?.toLowerCase().includes(q) ||
                e.deviceType?.toLowerCase().includes(q) ||
                e.serialNumber?.toLowerCase().includes(q) ||
                e.driveLetter?.toLowerCase().includes(q)
            );
        }
        return true;
    });

    const insertCount = events.filter(e => isInsertEvent(e.eventType)).length;
    const removeCount = events.length - insertCount;
    const incidentCount = events.filter(e => e.duringIncident).length;

    const dateOptions: { label: string; value: Filter }[] = [
        { label: 'All Time', value: 'all' },
        { label: 'Today', value: 'today' },
        { label: 'Last 7 Days', value: '7days' },
        { label: 'Last 30 Days', value: '30days' },
    ];

    return (
        <DashboardShell>
            <div style={{ padding: '32px 36px', minHeight: '100vh' }}>

                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(167,139,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔌</div>
                        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', margin: 0 }}>USB Activity</h1>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14, paddingLeft: 48 }}>
                        All device connect and disconnect events logged on this machine.
                    </p>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                    {[
                        { label: 'Total Events', value: events.length, color: 'var(--primary)' },
                        { label: 'Connected', value: insertCount, color: 'var(--green)' },
                        { label: 'Removed', value: removeCount, color: 'var(--red)' },
                        { label: 'During Incident', value: incidentCount, color: 'var(--yellow)' },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px', borderTop: `3px solid ${color}` }}>
                            <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search device name, type, serial..."
                            style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px 8px 34px', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {dateOptions.map(o => (
                            <button key={o.value} onClick={() => setDateFilter(o.value)} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: dateFilter === o.value ? '1px solid var(--primary)' : '1px solid var(--border)', background: dateFilter === o.value ? 'rgba(167,139,250,0.15)' : 'transparent', color: dateFilter === o.value ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer' }}>
                                {o.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {([['all', 'All'], ['insert', 'Connected'], ['remove', 'Removed']] as [EventFilter, string][]).map(([val, lbl]) => (
                            <button key={val} onClick={() => setEventFilter(val)} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: eventFilter === val ? '1px solid var(--blue)' : '1px solid var(--border)', background: eventFilter === val ? 'rgba(125,211,252,0.1)' : 'transparent', color: eventFilter === val ? 'var(--blue)' : 'var(--text-secondary)', cursor: 'pointer' }}>
                                {lbl}
                            </button>
                        ))}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Table */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>⏳ Loading USB events...</div>
                    ) : error ? (
                        <div style={{ padding: 48, textAlign: 'center', color: 'var(--red)' }}>⚠️ {error}</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>🔌 No USB events match your filters.</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['Timestamp', 'Event', 'Device Name', 'Type', 'Drive', 'Serial Number', 'Incident'].map(h => (
                                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((e, i) => (
                                    <tr key={e.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                                        onMouseEnter={el => (el.currentTarget.style.background = 'var(--bg-hover)')}
                                        onMouseLeave={el => (el.currentTarget.style.background = 'transparent')}>
                                        <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{formatTs(e.timestamp)}</td>
                                        <td style={{ padding: '13px 16px' }}><EventTypeBadge type={e.eventType} /></td>
                                        <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.deviceName || <span style={{ color: 'var(--text-muted)' }}>Unknown Device</span>}</td>
                                        <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>{e.deviceType || '—'}</td>
                                        <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: 'var(--blue)', fontFamily: 'monospace' }}>{e.driveLetter ? `${e.driveLetter}:` : '—'}</td>
                                        <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{e.serialNumber || '—'}</td>
                                        <td style={{ padding: '13px 16px' }}><IncidentBadge during={e.duringIncident} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        </DashboardShell>
    );
}
