'use client';

import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const NAV = [
    { label: 'Dashboard', href: '/dashboard', icon: '⊞', section: 'MONITOR' },
    { label: 'Incidents', href: '/incidents', icon: '⚠', section: null },
    { label: 'USB Activity', href: '/usb', icon: '⏏', section: null },
    { label: 'Applications', href: '/applications', icon: '▦', section: null },
    { label: 'Gallery', href: '/gallery', icon: '◫', section: 'EVIDENCE' },
    { label: 'Analytics', href: '/analytics', icon: '▲', section: 'SYSTEM' },
    { label: 'Settings', href: '/settings', icon: '⚙', section: null },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <aside style={{
            width: collapsed ? '56px' : '220px',
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border)',
            transition: 'width 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            flexShrink: 0,
            overflow: 'hidden',
        }}>

            {/* Logo */}
            <div style={{
                padding: collapsed ? '18px 0' : '18px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                flexShrink: 0,
                minHeight: '60px',
            }}>
                {!collapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            background: 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <span style={{ fontSize: '10px', color: '#000', fontWeight: 900 }}>LG</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text)' }}>
                                LAPTOP<span style={{ color: 'var(--primary)' }}>GUARD</span>
                            </div>
                            <div style={{ fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '0.15em', marginTop: '1px' }}>
                                ENDPOINT SECURITY
                            </div>
                        </div>
                    </div>
                )}
                {collapsed && (
                    <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{ fontSize: '10px', color: '#000', fontWeight: 900 }}>LG</span>
                    </div>
                )}
                {!collapsed && (
                    <button onClick={onToggle} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: '11px', padding: '4px 6px',
                        borderRadius: '4px', lineHeight: 1,
                    }}>←</button>
                )}
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 8px' }}>
                {NAV.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <div key={item.href}>
                            {!collapsed && item.section && (
                                <div style={{
                                    padding: '14px 10px 5px',
                                    fontSize: '8px', color: 'var(--text-muted)',
                                    letterSpacing: '0.18em', fontWeight: 700,
                                }}>
                                    {item.section}
                                </div>
                            )}
                            <button
                                onClick={() => router.push(item.href)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: collapsed ? '0' : '9px',
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    padding: collapsed ? '10px 0' : '8px 10px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    marginBottom: '1px',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    position: 'relative',
                                    background: active ? 'rgba(167,139,250,0.1)' : 'transparent',
                                    color: active ? 'var(--primary)' : 'var(--text-muted)',
                                    transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={e => {
                                    if (!active) {
                                        (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                                        (e.currentTarget as HTMLElement).style.color = 'var(--text)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!active) {
                                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                                        (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                                    }
                                }}
                            >
                                {active && (
                                    <div style={{
                                        position: 'absolute', left: 0,
                                        top: '50%', transform: 'translateY(-50%)',
                                        width: '2px', height: '16px',
                                        background: 'var(--primary)',
                                        borderRadius: '0 2px 2px 0',
                                    }} />
                                )}
                                <span style={{ fontSize: '13px', flexShrink: 0, opacity: active ? 1 : 0.6 }}>{item.icon}</span>
                                {!collapsed && <span style={{ letterSpacing: '0.01em' }}>{item.label}</span>}
                            </button>
                        </div>
                    );
                })}
            </nav>

            {/* Collapse when expanded */}
            {collapsed && (
                <button onClick={onToggle} style={{
                    margin: '0 auto 10px',
                    width: '30px', height: '30px',
                    borderRadius: '8px',
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '11px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>→</button>
            )}

            {/* Status */}
            <div style={{
                borderTop: '1px solid var(--border)',
                padding: collapsed ? '12px 0' : '12px 14px',
                display: 'flex',
                justifyContent: collapsed ? 'center' : 'flex-start',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
            }}>
                <div style={{
                    width: '6px', height: '6px',
                    borderRadius: '50%', background: 'var(--green)',
                    flexShrink: 0,
                    boxShadow: '0 0 6px var(--green)',
                }} />
                {!collapsed && (
                    <div>
                        <div style={{ fontSize: '10px', color: 'var(--green)', fontWeight: 600, letterSpacing: '0.08em' }}>
                            ONLINE
                        </div>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '1px' }}>
                            :5000 · SQLite
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}