'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getIncidents, photoUrl, Incident } from '@/lib/api';

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
                const allPhotos: Photo[] = [];
                for (const inc of incidents) {
                    for (const f of (inc.Photos || [])) {
                        allPhotos.push({
                            filename: f,
                            incidentId: inc.Id,
                            timestamp: inc.Timestamp,
                            username: inc.Username,
                        });
                    }
                }
                // sort newest first
                allPhotos.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setPhotos(allPhotos);
                setLoading(false);
            })
            .catch(e => { setError(e.message); setLoading(false); });
    }, [ready, token]);

    function openLightbox(photo: Photo, idx: number) {
        setLightbox(photo);
        setLightboxIdx(idx);
    }

    function closeLightbox() {
        setLightbox(null);
    }

    function prevPhoto() {
        const newIdx = (lightboxIdx - 1 + photos.length) % photos.length;
        setLightbox(photos[newIdx]);
        setLightboxIdx(newIdx);
    }

    function nextPhoto() {
        const newIdx = (lightboxIdx + 1) % photos.length;
        setLightbox(photos[newIdx]);
        setLightboxIdx(newIdx);
    }

    // Keyboard nav
    useEffect(() => {
        if (!lightbox) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevPhoto();
            if (e.key === 'ArrowRight') nextPhoto();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightbox, lightboxIdx]);

    return (
        <div style={{ padding: '32px 36px', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10, background: 'rgba(252,165,165,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>📸</div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Photo Gallery</h1>
                </div>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14, paddingLeft: 48 }}>
                    Webcam captures taken during failed login attempts.
                </p>
            </div>

            {/* Stats */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24,
                padding: '14px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
            }}>
                <div>
                    <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--red)' }}>{photos.length}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 8 }}>total photos</span>
                </div>
                <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Click any photo to open fullscreen · Use ← → to navigate · Esc to close
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                    Loading photos...
                </div>
            ) : error ? (
                <div style={{ padding: 64, textAlign: 'center', color: 'var(--red)' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                    {error}
                </div>
            ) : photos.length === 0 ? (
                <div style={{
                    padding: 64, textAlign: 'center', color: 'var(--text-muted)',
                    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
                    <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>No photos captured yet</div>
                    <div style={{ fontSize: 13 }}>Photos are taken automatically when a failed login is detected.</div>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 12,
                }}>
                    {photos.map((photo, idx) => (
                        <div
                            key={`${photo.filename}-${idx}`}
                            onClick={() => openLightbox(photo, idx)}
                            style={{
                                borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                                border: '1px solid var(--border)', position: 'relative',
                                background: 'var(--bg-card)', aspectRatio: '4/3',
                                transition: 'transform 0.15s, border-color 0.15s',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
                                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-strong)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                            }}
                        >
                            <img
                                src={photoUrl(photo.filename)}
                                alt={`Capture from incident ${photo.incidentId}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                onError={e => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).parentElement!.style.display = 'flex';
                                    (e.target as HTMLImageElement).parentElement!.style.alignItems = 'center';
                                    (e.target as HTMLImageElement).parentElement!.style.justifyContent = 'center';
                                    (e.target as HTMLImageElement).parentElement!.innerHTML += '<span style="font-size:32px">🖼️</span>';
                                }}
                            />
                            {/* Overlay */}
                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                                padding: '20px 10px 8px', opacity: 0, transition: 'opacity 0.15s',
                            }}
                                onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.opacity = '1')}
                                onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.opacity = '0')}
                            >
                                <div style={{ fontSize: 11, color: '#fff', fontWeight: 500 }}>Incident #{photo.incidentId}</div>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{formatTs(photo.timestamp)}</div>
                            </div>
                            {/* Incident badge */}
                            <div style={{
                                position: 'absolute', top: 8, right: 8,
                                padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                                background: 'rgba(252,165,165,0.9)', color: '#1a0a0a',
                            }}>
                                #{photo.incidentId}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {lightbox && (
                <div
                    onClick={closeLightbox}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0,0,0,0.92)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    {/* Close */}
                    <button
                        onClick={closeLightbox}
                        style={{
                            position: 'absolute', top: 20, right: 24,
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 8, color: '#fff', fontSize: 14, padding: '6px 14px', cursor: 'pointer',
                        }}
                    >✕ Close</button>

                    {/* Prev */}
                    <button
                        onClick={e => { e.stopPropagation(); prevPhoto(); }}
                        style={{
                            position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 8, color: '#fff', fontSize: 20, padding: '12px 16px', cursor: 'pointer',
                        }}
                    >‹</button>

                    {/* Image */}
                    <div onClick={e => e.stopPropagation()} style={{ maxWidth: '80vw', maxHeight: '80vh' }}>
                        <img
                            src={photoUrl(lightbox.filename)}
                            alt="Evidence capture"
                            style={{ maxWidth: '80vw', maxHeight: '72vh', objectFit: 'contain', borderRadius: 10, display: 'block' }}
                        />
                        <div style={{ marginTop: 14, textAlign: 'center' }}>
                            <span style={{
                                padding: '4px 14px', borderRadius: 20, fontSize: 12,
                                background: 'rgba(252,165,165,0.2)', color: 'var(--red)',
                                border: '1px solid rgba(252,165,165,0.3)',
                            }}>
                                Incident #{lightbox.incidentId} · {lightbox.username}
                            </span>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
                                {formatTs(lightbox.timestamp)} · {lightboxIdx + 1} of {photos.length}
                            </div>
                        </div>
                    </div>

                    {/* Next */}
                    <button
                        onClick={e => { e.stopPropagation(); nextPhoto(); }}
                        style={{
                            position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 8, color: '#fff', fontSize: 20, padding: '12px 16px', cursor: 'pointer',
                        }}
                    >›</button>
                </div>
            )}
        </div>
    );
}
