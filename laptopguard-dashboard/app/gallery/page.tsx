'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getIncidents, photoUrl, Incident } from '@/lib/api';
import DashboardShell from '@/components/layout/DashboardShell';

interface Photo {
    filename: string;
    incidentId: number;
    timestamp: string;
    username: string;
}

function formatTs(ts: string): string {
    const d = new Date(ts);
    return d.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
    } as Intl.DateTimeFormatOptions);
}

export default function GalleryPage() {
    const { token, ready } = useAuth();
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lightbox, setLightbox] = useState<Photo | null>(null);
    const [lightboxIdx, setLightboxIdx] = useState(0);

    useEffect(() => {
        if (!ready) return;
        if (!token) { window.location.href = '/login'; return; }
        getIncidents(token)
            .then(incidents => {
                const all: Photo[] = [];
                for (const inc of incidents) {
                    for (const f of (inc.photos || [])) {
                        all.push({ filename: f, incidentId: inc.id, timestamp: inc.timestamp, username: inc.username });
                    }
                }
                all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setPhotos(all);
                setLoading(false);
            })
            .catch(e => { setError(e.message); setLoading(false); });
    }, [ready, token]);

    useEffect(() => {
        if (!lightbox) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightbox(null);
            if (e.key === 'ArrowLeft') { const i = (lightboxIdx - 1 + photos.length) % photos.length; setLightbox(photos[i]); setLightboxIdx(i); }
            if (e.key === 'ArrowRight') { const i = (lightboxIdx + 1) % photos.length; setLightbox(photos[i]); setLightboxIdx(i); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightbox, lightboxIdx, photos]);

    return (
        <DashboardShell>
            <div style={{ padding: '32px 36px', minHeight: '100vh' }}>

                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(252,165,165,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📸</div>
                        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Photo Gallery</h1>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14, paddingLeft: 48 }}>
                        Webcam captures taken during failed login attempts.
                    </p>
                </div>

                {/* Stats bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, padding: '14px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                    <div>
                        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--red)' }}>{photos.length}</span>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 8 }}>total photos</span>
                    </div>
                    <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Click to open · ← → to navigate · Esc to close</div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-muted)' }}>⏳ Loading photos...</div>
                ) : error ? (
                    <div style={{ padding: 64, textAlign: 'center', color: 'var(--red)' }}>⚠️ {error}</div>
                ) : photos.length === 0 ? (
                    <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
                        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>No photos captured yet</div>
                        <div style={{ fontSize: 13 }}>Photos are taken automatically when a failed login is detected.</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                        {photos.map((photo, idx) => (
                            <div key={`${photo.filename}-${idx}`} onClick={() => { setLightbox(photo); setLightboxIdx(idx); }}
                                style={{ borderRadius: 10, overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--border)', position: 'relative', background: 'var(--bg-card)', aspectRatio: '4/3', transition: 'transform 0.15s, border-color 0.15s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-strong)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}>
                                <img src={photoUrl(photo.filename)} alt={`Capture ${photo.incidentId}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                <div style={{ position: 'absolute', top: 8, right: 8, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: 'rgba(252,165,165,0.9)', color: '#1a0a0a' }}>
                                    #{photo.incidentId}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Lightbox */}
                {lightbox && (
                    <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 20, right: 24, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', fontSize: 14, padding: '6px 14px', cursor: 'pointer' }}>✕ Close</button>
                        {photos.length > 1 && (
                            <button onClick={e => { e.stopPropagation(); const i = (lightboxIdx - 1 + photos.length) % photos.length; setLightbox(photos[i]); setLightboxIdx(i); }}
                                style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', fontSize: 20, padding: '12px 16px', cursor: 'pointer' }}>‹</button>
                        )}
                        <div onClick={e => e.stopPropagation()}>
                            <img src={photoUrl(lightbox.filename)} alt="Evidence" style={{ maxWidth: '80vw', maxHeight: '72vh', objectFit: 'contain', borderRadius: 10, display: 'block' }} />
                            <div style={{ marginTop: 14, textAlign: 'center' }}>
                                <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, background: 'rgba(252,165,165,0.2)', color: 'var(--red)', border: '1px solid rgba(252,165,165,0.3)' }}>
                                    Incident #{lightbox.incidentId} · {lightbox.username}
                                </span>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>{formatTs(lightbox.timestamp)} · {lightboxIdx + 1} of {photos.length}</div>
                            </div>
                        </div>
                        {photos.length > 1 && (
                            <button onClick={e => { e.stopPropagation(); const i = (lightboxIdx + 1) % photos.length; setLightbox(photos[i]); setLightboxIdx(i); }}
                                style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', fontSize: 20, padding: '12px 16px', cursor: 'pointer' }}>›</button>
                        )}
                    </div>
                )}

            </div>
        </DashboardShell>
    );
}
