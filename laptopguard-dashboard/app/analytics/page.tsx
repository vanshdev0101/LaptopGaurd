'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getIncidents, getUsbEvents, type Incident, type UsbEvent } from '@/lib/api';
import DashboardShell from '@/components/layout/DashboardShell';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';

function groupByDay(items: { timestamp: string }[], days: number) {
    const map: Record<string, number> = {};
    const now = Date.now();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        map[key] = 0;
    }
    const cutoff = now - days * 86400000;
    for (const item of items) {
        const t = new Date(item.timestamp).getTime();
        if (t < cutoff) continue;
        const key = new Date(t).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        if (key in map) map[key]++;
    }
    return Object.entries(map).map(([date, count]) => ({ date, count }));
}

function groupByHour(items: { timestamp: string }[]) {
    const map: Record<string, number> = {};
    for (let h = 0; h < 24; h++) map[String(h).padStart(2, '0') + ':00'] = 0;
    for (const item of items) {
        const h = new Date(item.timestamp).getHours();
        map[String(h).padStart(2, '0') + ':00']++;
    }
    return Object.entries(map).map(([hour, count]) => ({ hour, count }));
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--text)',
        }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
            <div style={{ color: payload[0].color, fontWeight: 600 }}>
                {payload[0].value} {payload[0].name}
            </div>
        </div>
    );
};

const PIE_COLORS = ['#a78bfa', '#7dd3fc', '#fca5a5', '#fcd34d', '#86efac', '#f9a8d4'];

export default function AnalyticsPage() {
    const { token, ready } = useAuth();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [usbEvents, setUsbEvents] = useState<UsbEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<7 | 14 | 30>(14);

    useEffect(() => {
        if (!ready) return;
        if (!token) { window.location.href = '/login'; return; }
        Promise.all([getIncidents(token), getUsbEvents(token)])
            .then(([inc, usb]) => { setIncidents(inc); setUsbEvents(usb); setLoading(false); })
            .catch(() => setLoading(false));
    }, [ready, token]);

    const incidentsByDay = groupByDay(incidents, range);
    const usbByDay = groupByDay(usbEvents, range);
    const incidentsByHour = groupByHour(incidents);

    const reasonMap: Record<string, number> = {};
    for (const inc of incidents) {
        let r = inc.failureReason ?? '';
        try { r = decodeURIComponent(r.replace(/\+/g, ' ')); } catch { }
        if (!r) r = 'Unknown';
        if (r.length > 30) r = r.slice(0, 30) + '…';
        reasonMap[r] = (reasonMap[r] || 0) + 1;
    }
    const reasonData = Object.entries(reasonMap)
        .sort((a, b) => b[1] - a[1]).slice(0, 6)
        .map(([name, value]) => ({ name, value }));

    const insertCount = usbEvents.filter(e =>
        e.eventType?.toLowerCase().includes('insert') ||
        e.eventType?.toLowerCase().includes('connect')
    ).length;
    const usbTypeData = [
        { name: 'Connected', value: insertCount },
        { name: 'Removed', value: usbEvents.length - insertCount },
    ];

    const peakHour = [...incidentsByHour].sort((a, b) => b.count - a.count)[0];

    if (loading) return (
        <DashboardShell>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', color: 'var(--primary)', animation: 'pulse 1.5s infinite' }}>⟳</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '0.15em', marginTop: '8px' }}>LOADING</div>
                </div>
            </div>
        </DashboardShell>
    );

    return (
        <DashboardShell>
            <div className="fade-up">

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div>
                        <h1 className="title">Analytics</h1>
                        <p className="subtitle" style={{ marginTop: 4 }}>Security trends and patterns</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {([7, 14, 30] as (7 | 14 | 30)[]).map(r => (
                            <button key={r} onClick={() => setRange(r)} style={{
                                padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                border: range === r ? '1px solid var(--green)' : '1px solid var(--border)',
                                background: range === r ? 'rgba(134,239,172,0.1)' : 'transparent',
                                color: range === r ? 'var(--green)' : 'var(--text-secondary)',
                            }}>{r}d</button>
                        ))}
                    </div>
                </div>

                {/* Summary cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                    {[
                        { label: 'Total Incidents', value: incidents.length, color: 'var(--red)' },
                        { label: 'USB Events', value: usbEvents.length, color: 'var(--primary)' },
                        { label: 'Peak Hour', value: peakHour?.hour ?? '—', color: 'var(--yellow)' },
                        { label: 'Photos Taken', value: incidents.reduce((s, i) => s + (i.photos?.length || 0), 0), color: 'var(--blue)' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="glass card-padding" style={{ borderLeft: `3px solid ${color}` }}>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 10 }}>{label.toUpperCase()}</div>
                            <div style={{ fontSize: 30, fontWeight: 700, color }}>{value}</div>
                        </div>
                    ))}
                </div>

                {/* Row 1 charts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

                    <div className="glass" style={{ padding: '20px 24px' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Failed Logins — Last {range} Days</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Daily incident frequency</div>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={incidentsByDay} barSize={14}>
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                <Bar dataKey="count" name="incidents" fill="var(--red)" radius={[4, 4, 0, 0]} opacity={0.85} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="glass" style={{ padding: '20px 24px' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>USB Events — Last {range} Days</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Connect / disconnect activity</div>
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={usbByDay}>
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="count" name="events" stroke="var(--primary)" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Row 2 charts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 16 }}>

                    <div className="glass" style={{ padding: '20px 24px' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Incidents by Hour of Day</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>All-time hourly distribution</div>
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={incidentsByHour} barSize={8}>
                                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval={3} />
                                <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                <Bar dataKey="count" name="incidents" fill="var(--yellow)" radius={[3, 3, 0, 0]} opacity={0.85} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="glass" style={{ padding: '20px 24px' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Failure Reasons</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Top error codes</div>
                        {reasonData.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>No data</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {reasonData.map((r, i) => (
                                    <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: PIE_COLORS[i % PIE_COLORS.length] }}>{r.value}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="glass" style={{ padding: '20px 24px' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>USB Event Types</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Connect vs remove split</div>
                        {usbEvents.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>No data</div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={120}>
                                    <PieChart>
                                        <Pie data={usbTypeData} dataKey="value" innerRadius={30} outerRadius={50} paddingAngle={3}>
                                            {usbTypeData.map((_, i) => (
                                                <Cell key={i} fill={['var(--green)', 'var(--red)'][i]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4 }}>
                                    {usbTypeData.map((d, i) => (
                                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: ['var(--green)', 'var(--red)'][i] }} />
                                            <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                                            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{d.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </DashboardShell>
    );
}