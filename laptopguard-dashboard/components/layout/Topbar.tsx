'use client';

import { usePathname } from 'next/navigation';

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
    const title = PAGE_TITLES[pathname] ?? 'LaptopGuard';

    return (
        <header className="
      relative flex items-center justify-between
      h-12 px-6 flex-shrink-0
      bg-[#060910] border-b border-[#0f1729]
    ">
            {/* Bottom glow line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1d4ed8] to-transparent opacity-30" />

            {/* Left: breadcrumb style title */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#1e3a5f] tracking-widest font-medium">LAPTOPGUARD</span>
                <span className="text-[#0f1729]">/</span>
                <span className="text-[11px] text-[#60a5fa] font-semibold tracking-wider uppercase">
                    {title}
                </span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-5">

                {/* Threat level */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0a1628] border border-[#0f2040]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                    <span className="text-[9px] text-[#22c55e] font-bold tracking-widest">PROTECTED</span>
                </div>

                {/* Divider */}
                <div className="w-px h-4 bg-[#0f1729]" />

                {/* Notification dot */}
                <button className="relative w-7 h-7 rounded-md bg-[#0a0f1a] border border-[#0f1729] flex items-center justify-center text-[#374151] hover:text-[#60a5fa] hover:border-[#1e3a5f] transition-all">
                    <span className="text-sm">🔔</span>
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                </button>

                {/* Avatar */}
                <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-[#0a0f1a] border border-[#0f1729] hover:border-[#1e3a5f] transition-all cursor-pointer">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-[#1d4ed8] to-[#7c3aed] flex items-center justify-center">
                        <span className="text-[7px] text-white font-black">VR</span>
                    </div>
                    <span className="text-[10px] text-[#374151] font-medium">Vansh</span>
                </div>
            </div>
        </header>
    );
}