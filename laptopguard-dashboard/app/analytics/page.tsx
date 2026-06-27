'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getIncidents, getUsbEvents, Incident, UsbEvent } from '@/lib/api';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts';

function groupByDay(items: { Timestamp: string }[], days: number): { date: string; count: number }[] {
    const map: Record<string, number> = {};
    const now = Date.now();
    // Pre-fill last N days
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        map[key] = 0;
    }
    const cutoff = now - days * 86400000;
    for (const item of items) {
        const t = new Date(item.Timestamp).getTime();
        if (t < cutoff) continue;
        const key = new Date(t).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        if (key in map) map[key] = (map[key] || 0) + 1;
    }
    return Object.entries(map).map(([date, count]) => ({ date, count }));
}

function groupByHour(items: { Timestamp: string }[]): { hour: string; count: number }[] {
    const map: Record<string, number> = {};
    for (let h = 0; h < 24; h++) map[String(h).padStart(2, '0') + ':00'] = 0;
    for (const item of items) {
        const h = new Date(item.Timestamp).getHours();
        const key = String(h).padStart(2, '0') + ':00';
        map[key]++;
    }
    return Object.entries(map).map(([hour, count]) => ({ hour, count }));
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
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
    }
    return null;
};

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

    // Failure reason distribution
    const reasonMap: Record<string, number> = {};
    for (const inc of incidents) {
        let r = inc.FailureReason;
        try { r = decodeURIComponent(r.replace(/\+/g, ' ')); } catch { }
        if (!r) r = 'Unknown';
        if (r.length > 30) r = r.slice(0, 30) + '…';
        reasonMap[r] = (reasonMap[r] || 0) + 1;
    }
    const reasonData = Object.entries(reasonMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
    const PIE_COLORS = ['#a78bfa', '#7dd3fc', '#fca5a5', '#fcd34d', '#86efac', '#f9a8d4'];

    // USB event type split
    const insertCount = usbEvents.filter(e => e.EventType?.toLowerCase().includes('insert') || e.EventType?.toLowerCase().includes('connect') || e.EventType?.toLowerCase().includes('arrival')).length;
    const removeCount = usbEvents.length - insertCount;
    const usbTypeData = [
        { name: 'Connected', value: insertCount },
        { name: 'Removed', value: removeCount },
    ];

    // Top hours
    const peakHours = [...incidentsByHour].sort((a, b) => b.count - a.count).slice(0, 3);

    if (loading) return (
        <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            Loading analytics...
        </div>
    );

    return (
        <div style={{ padding: '32px 36px', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10, background: 'rgba(134,239,172,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                        }}>📊</div>
                        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Analytics</h1>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14, paddingLeft: 48 }}>
                        Security trends and patterns across incidents and USB activity.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {([7, 14, 30] as (7 | 14 | 30)[]).map(r => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            style={{
                                padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                                border: range === r ? '1px solid var(--green)' : '1px solid var(--border)',
                                background: range === r ? 'rgba(134,239,172,0.1)' : 'transparent',
                                color: range === r ? 'var(--green)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                            }}
                        >{r}d</button>
                    ))}
                </div>
            </div>

            {/* Summary row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Total Incidents', value: incidents.length, color: 'var(--red)' },
                    { label: 'USB Events', value: usbEvents.length, color: 'var(--primary)' },
                    { label: 'Peak Hour', value: peakHours[0]?.hour ?? '—', color: 'var(--yellow)' },
                    { label: 'Photos Taken', value: incidents.reduce((s, i) => s + (i.Photos?.length || 0), 0), color: 'var(--blue)' },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)', padding: '16px 20px',
                        borderLeft: `3px solid ${color}`,
                    }}>
                        <div style={{ fontSize: 26, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Charts row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Incidents over time */}
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '20px 24px',
                }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Failed Logins — Last {range} Days</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Daily incident frequency</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={incidentsByDay} barSize={16}>
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Bar dataKey="count" name="incidents" fill="#fca5a5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* USB over time */}
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '20px 24px',
                }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>USB Events — Last {range} Days</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Connect / disconnect activity</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={usbByDay}>
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="count" name="events" stroke="#a78bfa" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 20 }}>
                {/* By hour */}
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '20px 24px',
                }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Incidents by Hour of Day</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>All-time hourly distribution</div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={incidentsByHour} barSize={10}>
                            <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval={3} />
                            <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Bar dataKey="count" name="incidents" fill="#fcd34d" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Failure reasons */}
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '20px 24px',
                }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Failure Reasons</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Top error codes</div>
                    {reasonData.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: 12, paddingTop: 20 }}>No data</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {reasonData.map((r, i) => (
                                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: PIE_COLORS[i % PIE_COLORS.length] }}>{r.value}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* USB type split */}
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '20px 24px',
                }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>USB Event Types</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Connect vs remove split</div>
                    {usbEvents.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: 12, paddingTop: 20 }}>No data</div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={120}>
                                <PieChart>
                                    <Pie data={usbTypeData} dataKey="value" innerRadius={30} outerRadius={50} paddingAngle={3}>
                                        {usbTypeData.map((_, i) => (
                                            <Cell key={i} fill={['#86efac', '#fca5a5'][i]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4 }}>
                                {usbTypeData.map((d, i) => (
                                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ['#86efac', '#fca5a5'][i] }} />
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
    );
}
