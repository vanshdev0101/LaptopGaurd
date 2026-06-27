'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import DashboardShell from '@/components/layout/DashboardShell';
import { getStats, getIncidents, getUsbEvents, type Stats, type Incident, type UsbEvent } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// ── Helpers ───────────────────────────────────────────────────────────────────
function decodeReason(raw: string): string {
    if (!raw) return '—';
    try { return decodeURIComponent(raw.replace(/\+/g, ' ')); }
    catch { return raw; }
}

function fmt(ts: string) {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) +
        ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function fmtTime(ts: string) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function buildChartData(incidents: Incident[]) {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        days[key] = 0;
    }
    incidents.forEach(inc => {
        const key = new Date(inc.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        if (key in days) days[key]++;
    });
    return Object.entries(days).map(([date, count]) => ({ date, count }));
}

// ── Sub-components ────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, color }: {
    label: string; value: string | number; sub: string; color: string;
}) {
    return (
        <div className="glass card-padding" style={{ borderTop: `2px solid ${color}` }}>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '14px' }}>
                {label}
            </div>
            <div style={{ fontSize: '38px', fontWeight: 700, color, lineHeight: 1, marginBottom: '8px', letterSpacing: '-0.02em' }}>
                {value}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</div>
        </div>
    );
}

function Panel({ title, color = 'var(--primary)', action, onAction, children }: {
    title: string; color?: string;
    action?: string; onAction?: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="glass" style={{ overflow: 'hidden' }}>
            <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '10px',
            }}>
                <div style={{ width: '2px', height: '14px', background: color, borderRadius: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-secondary)', flex: 1 }}>
                    {title}
                </span>
                {action && (
                    <button onClick={onAction} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '10px', color: color, fontWeight: 600, letterSpacing: '0.05em',
                    }}>{action}</button>
                )}
            </div>
            {children}
        </div>
    );
}

function UsbBadge({ type }: { type: string }) {
    const ins = type === 'Inserted';
    return (
        <span style={{
            display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
            fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em',
            background: ins ? 'var(--green-dim)' : 'rgba(252,165,165,0.08)',
            color: ins ? 'var(--green)' : 'var(--red)',
            border: `1px solid ${ins ? 'rgba(134,239,172,0.2)' : 'rgba(252,165,165,0.2)'}`,
        }}>
            {type.toUpperCase()}
        </span>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const router = useRouter();
    const { token, ready } = useAuth();

    const [stats, setStats] = useState<Stats | null>(null);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [usb, setUsb] = useState<UsbEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState('');

    useEffect(() => {
        console.log('Effect fired:', { ready, token: token?.substring(0, 8) });
        if (!ready) return;
        if (!token) { window.location.href = '/login'; return; }
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [ready, token]);

    async function loadData() {
        try {
            const [s, i, u] = await Promise.all([
                getStats(token),
                getIncidents(token),
                getUsbEvents(token),
            ]);
            setStats(s);
            setIncidents(i);
            setUsb(u);
            setLastRefresh(new Date().toLocaleTimeString());
        } catch (e: any) {
            if (e?.message === 'Unauthorized') window.location.href = '/login';
        } finally {
            setLoading(false);
        }
    }

    if (!ready || loading) return (
        <DashboardShell>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', marginBottom: '10px', color: 'var(--primary)', animation: 'pulse 1.5s infinite' }}>⟳</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '0.15em' }}>LOADING</div>
                </div>
            </div>
        </DashboardShell>
    );

    const chartData = buildChartData(incidents);

    return (
        <DashboardShell>
            <div className="fade-up">

                {/* Header */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                        <h1 className="title">Security Overview</h1>
                        <p className="subtitle" style={{ marginTop: '4px' }}>
                            Real-time endpoint monitoring · {lastRefresh}
                        </p>
                    </div>
                    <div style={{
                        padding: '5px 12px', borderRadius: '6px',
                        background: 'rgba(134,239,172,0.08)',
                        border: '1px solid rgba(134,239,172,0.15)',
                        fontSize: '9px', color: 'var(--green)',
                        fontWeight: 700, letterSpacing: '0.12em',
                        display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s infinite' }} />
                        LIVE
                    </div>
                </div>

                {/* Metric Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
                    <MetricCard label="TOTAL INCIDENTS" value={stats?.total ?? '—'} sub="all time" color="var(--red)" />
                    <MetricCard label="TODAY" value={stats?.today ?? '—'} sub="incidents" color="var(--yellow)" />
                    <MetricCard label="USB EVENTS" value={usb.length} sub="detected" color="var(--blue)" />
                    <MetricCard label="EVIDENCE FILES" value={stats?.photos ?? '—'} sub="photos saved" color="var(--primary)" />
                </div>

                {/* Row 2: Chart + Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '12px', marginBottom: '12px' }}>

                    {/* Bar Chart */}
                    <Panel title="INCIDENTS · LAST 7 DAYS" color="var(--red)">
                        <div style={{ padding: '20px 16px 12px' }}>
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={chartData} barSize={28}>
                                    <CartesianGrid stroke="var(--border)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'inherit' }}
                                        axisLine={false} tickLine={false}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'inherit' }}
                                        axisLine={false} tickLine={false} width={24}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'var(--cement-2)',
                                            border: '1px solid var(--border-strong)',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            color: 'var(--text)',
                                        }}
                                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    />
                                    <Bar dataKey="count" fill="var(--red)" radius={[4, 4, 0, 0]} name="Incidents" opacity={0.85} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Panel>

                    {/* Security Status */}
                    <Panel title="SECURITY STATUS" color="var(--green)">
                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {[
                                { label: 'Service', val: 'Online', color: 'var(--green)' },
                                { label: 'Database', val: 'Healthy', color: 'var(--green)' },
                                { label: 'Camera', val: 'Connected', color: 'var(--green)' },
                                { label: 'USB Monitor', val: 'Running', color: 'var(--green)' },
                                { label: 'App Monitor', val: 'Running', color: 'var(--green)' },
                            ].map(s => (
                                <div key={s.label} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '9px 12px', borderRadius: '8px',
                                    background: 'var(--bg-hover)', border: '1px solid var(--border)',
                                }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.label}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.color }} />
                                        <span style={{ fontSize: '11px', fontWeight: 600, color: s.color }}>{s.val}</span>
                                    </div>
                                </div>
                            ))}
                            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px' }}>
                                Refreshed {lastRefresh}
                            </div>
                        </div>
                    </Panel>
                </div>

                {/* Row 3: Incidents + USB + Feed */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

                    {/* Recent Incidents */}
                    <Panel
                        title="RECENT INCIDENTS" color="var(--red)"
                        action="View all →" onAction={() => router.push('/incidents')}
                    >
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['TIME', 'USER', 'REASON', 'EVIDENCE'].map(h => (
                                        <th key={h} style={{
                                            textAlign: 'left', padding: '9px 16px',
                                            fontSize: '9px', color: 'var(--text-muted)',
                                            fontWeight: 700, letterSpacing: '0.12em',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {incidents.length === 0 ? (
                                    <tr><td colSpan={4} style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>No incidents recorded</td></tr>
                                ) : incidents.slice(0, 5).map(i => (
                                    <tr
                                        key={i.id}
                                        onClick={() => router.push(`/incidents/${i.id}`)}
                                        style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '11px 16px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{fmt(i.timestamp)}</td>
                                        <td style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{i.username}</td>
                                        <td style={{ padding: '11px 16px', fontSize: '11px', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {decodeReason(i.failureReason)}
                                        </td>
                                        <td style={{ padding: '11px 16px', fontSize: '11px', color: 'var(--blue)' }}>{i.photos.length} 📷</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Panel>

                    {/* USB + Live Feed stacked */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                        {/* USB */}
                        <Panel title="USB ACTIVITY" color="var(--blue)" action="View all →" onAction={() => router.push('/usb')}>
                            <div>
                                {usb.slice(0, 4).map(u => (
                                    <div key={u.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '9px 16px', borderBottom: '1px solid var(--border)',
                                    }}>
                                        <UsbBadge type={u.eventType} />
                                        <span style={{ flex: 1, fontSize: '12px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {u.deviceName || 'Unknown device'}
                                        </span>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', flexShrink: 0 }}>
                                            {fmtTime(u.timestamp)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Panel>

                        {/* Live Feed */}
                        <Panel title="LIVE ACTIVITY FEED" color="var(--primary)">
                            <div>
                                {[
                                    ...incidents.slice(0, 3).map(i => ({
                                        time: i.timestamp, dot: 'var(--red)',
                                        text: 'Failed login', sub: i.username,
                                    })),
                                    ...usb.slice(0, 4).map(u => ({
                                        time: u.timestamp,
                                        dot: u.eventType === 'Inserted' ? 'var(--green)' : 'var(--yellow)',
                                        text: `USB ${u.eventType}`,
                                        sub: u.deviceName || 'Unknown',
                                    })),
                                ]
                                    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                                    .slice(0, 6)
                                    .map((e, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex', gap: '10px', padding: '9px 16px',
                                            borderBottom: '1px solid var(--border)', alignItems: 'flex-start',
                                        }}>
                                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', minWidth: '44px', marginTop: '2px', flexShrink: 0 }}>
                                                {fmtTime(e.time)}
                                            </span>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: e.dot, marginTop: '4px', flexShrink: 0 }} />
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500 }}>{e.text}</div>
                                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.sub}</div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </Panel>
                    </div>
                </div>

            </div>
        </DashboardShell>
    );
}