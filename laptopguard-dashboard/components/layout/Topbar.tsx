'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

const PAGE_TITLES: Record<string, string> = {
    '/dashboard': 'Overview',
    '/incidents': 'Incidents',
    '/usb': 'USB Activity',
    '/applications': 'Applications',
    '/gallery': 'Evidence Gallery',
    '/analytics': 'Analytics',
    '/settings': 'Settings',
};

export default function Topbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();
    const title = PAGE_TITLES[pathname] ?? 'LaptopGuard';
    const [showBell, setShowBell] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    function handleLogout() {
        logout();
        sessionStorage.removeItem('lg_token');
        window.location.href = '/login';
    }

    return (
        <header style={{
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            position: 'relative',
            zIndex: 50,
        }}>

            {/* Bottom accent */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px',
                background: 'linear-gradient(to right, transparent, var(--primary), transparent)',
                opacity: 0.2,
            }} />

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.2em', fontWeight: 600 }}>
                    LAPTOPGUARD
                </span>
                <span style={{ color: 'var(--border-strong)', fontSize: '14px', fontWeight: 300 }}>/</span>
                <span style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    {title}
                </span>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

               

                {/* Bell */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => { setShowBell(b => !b); setShowProfile(false); }}
                        style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: showBell ? 'var(--primary-dim)' : 'var(--bg-hover)',
                            border: `1px solid ${showBell ? 'var(--primary)' : 'var(--border)'}`,
                            cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s', position: 'relative',
                        }}
                    >
                        <svg
                            width="14" height="14" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor"
                            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                            style={{ color: showBell ? 'var(--primary)' : 'var(--text-muted)' }}
                        >
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <div style={{
                            position: 'absolute', top: '6px', right: '6px',
                            width: '5px', height: '5px',
                            borderRadius: '50%', background: 'var(--red)',
                            boxShadow: '0 0 4px var(--red)',
                        }} />
                    </button>

                    {showBell && (
                        <div style={{
                            position: 'absolute', top: '40px', right: 0,
                            width: '300px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-strong)',
                            borderRadius: '12px',
                            boxShadow: 'var(--shadow)',
                            overflow: 'hidden',
                            zIndex: 100,
                        }}>
                            <div style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}>
                                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
                                    RECENT ALERTS
                                </span>
                                <button
                                    onClick={() => { setShowBell(false); router.push('/incidents'); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', color: 'var(--primary)' }}
                                >
                                    View all →
                                </button>
                            </div>
                            <RecentAlerts onClose={() => setShowBell(false)} />
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div style={{ position: 'relative' }}>
                    <div
                        onClick={() => { setShowProfile(p => !p); setShowBell(false); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '5px 12px', borderRadius: '8px',
                            background: showProfile ? 'var(--primary-dim)' : 'var(--bg-hover)',
                            border: `1px solid ${showProfile ? 'var(--primary)' : 'var(--border)'}`,
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}
                    >
                        <div style={{
                            width: '24px', height: '24px', borderRadius: '6px',
                            background: 'linear-gradient(135deg, var(--primary), var(--blue))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <span style={{ fontSize: '8px', color: '#000', fontWeight: 900 }}>VR</span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Vansh</span>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>▾</span>
                    </div>

                    {showProfile && (
                        <div style={{
                            position: 'absolute', top: '40px', right: 0,
                            width: '200px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-strong)',
                            borderRadius: '12px',
                            boxShadow: 'var(--shadow)',
                            overflow: 'hidden',
                            zIndex: 100,
                        }}>
                            {/* User info */}
                            <div style={{
                                padding: '14px 16px',
                                borderBottom: '1px solid var(--border)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '10px',
                                        background: 'linear-gradient(135deg, var(--primary), var(--blue))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <span style={{ fontSize: '11px', color: '#000', fontWeight: 900 }}>VR</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>Vansh</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>Administrator</div>
                                    </div>
                                </div>
                            </div>

                            {/* Menu items */}
                            {[
                                { icon: '⊞', label: 'Dashboard', action: () => { router.push('/dashboard'); setShowProfile(false); } },
                                { icon: '⚙', label: 'Settings', action: () => { router.push('/settings'); setShowProfile(false); } },
                            ].map(item => (
                                <button
                                    key={item.label}
                                    onClick={item.action}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '10px 16px', border: 'none', background: 'none',
                                        cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '12px',
                                        textAlign: 'left', transition: 'background 0.15s',
                                        borderBottom: '1px solid var(--border)',
                                    }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                                >
                                    <span style={{ fontSize: '13px' }}>{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '10px 16px', border: 'none', background: 'none',
                                    cursor: 'pointer', color: 'var(--red)', fontSize: '12px',
                                    textAlign: 'left', transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--red-dim)'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                            >
                                <span style={{ fontSize: '13px' }}>→</span>
                                Sign out
                            </button>
                        </div>
                    )}
                </div>

            </div>

            {/* Click outside to close */}
            {(showBell || showProfile) && (
                <div
                    onClick={() => { setShowBell(false); setShowProfile(false); }}
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                />
            )}
        </header>
    );
}

// Separate component to fetch and show recent incidents in bell dropdown
function RecentAlerts({ onClose }: { onClose: () => void }) {
    const { token } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<any[]>([]);

    useState(() => {
        if (!token) return;
        fetch(`http://100.92.192.6:5000/api/incidents?token=${token}`)
            .then(r => r.json())
            .then((data: any[]) => setItems(data.slice(0, 5)))
            .catch(() => { });
    });

    function fmtTime(ts: string) {
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (items.length === 0) return (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No recent alerts
        </div>
    );

    return (
        <div>
            {items.map((i: any) => (
                <div
                    key={i.Id ?? i.id}
                    onClick={() => { router.push(`/incidents/${i.Id ?? i.id}`); onClose(); }}
                    style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                        padding: '10px 16px', borderBottom: '1px solid var(--border)',
                        cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', marginTop: '4px', flexShrink: 0 }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)' }}>
                            Failed login — {i.Username ?? i.username}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {fmtTime(i.Timestamp ?? i.timestamp)}
                        </div>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--primary)', flexShrink: 0 }}>→</span>
                </div>
            ))}
        </div>
    );
}