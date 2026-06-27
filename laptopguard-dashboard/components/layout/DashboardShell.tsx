'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

interface DashboardShellProps {
    children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            background: 'var(--bg)',
        }}>
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
            }}>
                <Topbar />
                <main style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px',
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
}