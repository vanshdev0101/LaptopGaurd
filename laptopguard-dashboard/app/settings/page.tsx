'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getStats } from '@/lib/api';
import DashboardShell from '@/components/layout/DashboardShell';

function SettingRow({ label, value, description, action }: {
    label: string; value?: string; description?: string; action?: React.ReactNode;
}) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', borderBottom: '1px solid var(--border)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{label}</div>
                {description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{description}</div>}
            </div>
            {value && <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{value}</span>}
            {action && <div>{action}</div>}
        </div>
    );
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            style={{ padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: '1px solid var(--border)', background: 'transparent', color: copied ? 'var(--green)' : 'var(--text-secondary)', cursor: 'pointer' }}>
            {copied ? '✓ Copied' : 'Copy'}
        </button>
    );
}

function Section({ title, color = 'var(--text-secondary)', children }: {
    title: string; color?: string; children: React.ReactNode;
}) {
    return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
            </div>
            <div style={{ padding: '8px 0' }}>{children}</div>
        </div>
    );
}

export default function SettingsPage() {
    const { token, ready } = useAuth();
    const [stats, setStats] = useState<{ total: number; today: number; photos: number } | null>(null);

    useEffect(() => {
        if (!ready) return;
        if (!token) { window.location.href = '/login'; return; }
        getStats(token).then(setStats).catch(() => { });
    }, [ready, token]);

    function handleLogout() {
        sessionStorage.removeItem('lg_token');
        window.location.href = '/login';
    }

    const API_BASE = 'http://100.92.192.6:5000';

    return (
        <DashboardShell>
            <div style={{ padding: '32px 36px', minHeight: '100vh', maxWidth: 800 }}>

                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(167,139,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚙️</div>
                        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Settings</h1>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14, paddingLeft: 48 }}>
                        System configuration and device information.
                    </p>
                </div>

                {/* System */}
                <Section title="System">
                    <SettingRow label="Backend URL" description="ASP.NET Minimal API (Tailscale)" value={API_BASE} action={<CopyButton text={API_BASE} />} />
                    <SettingRow label="Frontend Port" description="Next.js dev server" value="localhost:3001" />
                    <SettingRow label="Database" description="SQLite — incidents, USB events, app captures" value="C:\ProgramData\LaptopGuard\laptopguard.db" />
                    <SettingRow label="Photos Directory" description="Webcam evidence captures (JPEG)" value="C:\ProgramData\LaptopGuard\Photos\" />
                    <SettingRow label="OTP Secret" description="TOTP authentication seed" value="C:\ProgramData\LaptopGuard\otp.secret" />
                </Section>

                {/* DB Stats */}
                {stats && (
                    <Section title="Database Stats">
                        <SettingRow label="Total Incidents" value={String(stats.total)} />
                        <SettingRow label="Incidents Today" value={String(stats.today)} />
                        <SettingRow label="Photos Stored" value={String(stats.photos)} />
                    </Section>
                )}

                {/* Session */}
                <Section title="Session">
                    <SettingRow
                        label="Session Token"
                        description="Valid for 8 hours. Stored in sessionStorage, invalidated on backend restart."
                        value={token ? `${token.slice(0, 8)}...${token.slice(-4)}` : '—'}
                        action={<CopyButton text={token || ''} />}
                    />
                    <SettingRow label="Authentication" description="TOTP via Google Authenticator or any compatible app" value="OTP (Otp.NET)" />
                </Section>

                {/* Monitoring */}
                <Section title="Monitoring">
                    <SettingRow label="Login Failure Event" description="Windows Security Log" value="Event ID 4625" />
                    <SettingRow label="USB Detection" description="WMI Win32_DeviceChangeEvent" value="3s debounce" />
                    <SettingRow label="App Capture" description="Snapshot of running processes at time of incident" value="System.Diagnostics.Process" />
                    <SettingRow label="Auto Refresh" description="Dashboard and USB page polling interval" value="30 seconds" />
                    <SettingRow label="Session Validity" description="Backend in-memory session lifetime" value="8 hours" />
                </Section>

                {/* API */}
                <Section title="API Endpoints">
                    {[
                        { label: 'Stats', value: '/api/stats?token=...' },
                        { label: 'Incidents', value: '/api/incidents?token=...' },
                        { label: 'USB Events', value: '/api/usb?token=...' },
                        { label: 'App Events', value: '/api/apps?token=...' },
                        { label: 'Photo', value: '/photo/{filename}' },
                    ].map(e => <SettingRow key={e.label} label={e.label} value={e.value} />)}
                </Section>

                {/* Danger Zone */}
                <div style={{ background: 'rgba(252,165,165,0.05)', border: '1px solid rgba(252,165,165,0.15)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(252,165,165,0.15)' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Danger Zone</div>
                    </div>
                    <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Sign Out</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Clears your session token. You'll need your OTP to log back in.</div>
                        </div>
                        <button onClick={handleLogout}
                            style={{ padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: '1px solid rgba(252,165,165,0.3)', background: 'rgba(252,165,165,0.1)', color: 'var(--red)', cursor: 'pointer' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(252,165,165,0.2)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(252,165,165,0.1)')}>
                            Sign Out
                        </button>
                    </div>
                </div>

            </div>
        </DashboardShell>
    );
}