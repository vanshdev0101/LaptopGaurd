'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { verifyOtp } from '@/lib/api';

export default function LoginPage() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setToken, isAuthed } = useAuth();
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isAuthed) router.push('/dashboard');
        inputRef.current?.focus();
    }, [isAuthed]);

    async function handleVerify() {
        if (code.length !== 6) return;
        setLoading(true);
        setError('');
        try {
            const result = await verifyOtp(code);
            if (result.success && result.sessionToken) {
                sessionStorage.setItem('lg_token', result.sessionToken);
                window.location.href = '/dashboard';
            } else {
                setError('Invalid code. Try again.');
                setCode('');
                inputRef.current?.focus();
            }
        } catch {
            setError('Cannot connect to backend.');
        } finally {
            setLoading(false);
        }
    }
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 50% 40%, #121926 0%, #090b10 70%)',
        }}>
            <div className="glass" style={{ width: '360px', padding: '48px 40px', textAlign: 'center' }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '32px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'var(--primary)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{ fontSize: '14px', fontWeight: 900, color: '#000' }}>LG</span>
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '0.15em', color: 'var(--text)' }}>
                        LAPTOP<span style={{ color: 'var(--primary)' }}>GUARD</span>
                    </span>
                </div>

                <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>
                    Authenticate
                </h1>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '32px' }}>
                    Enter your 6-digit authenticator code
                </p>

                <input
                    ref={inputRef}
                    type="tel"
                    maxLength={6}
                    value={code}
                    onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setCode(val);
                        setError('');
                        if (val.length === 6) setTimeout(handleVerify, 100);
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleVerify()}
                    placeholder="000000"
                    style={{
                        width: '100%',
                        background: 'var(--bg)',
                        border: `1px solid ${error ? 'var(--danger)' : 'var(--border-strong)'}`,
                        color: 'var(--primary)',
                        fontSize: '28px',
                        fontFamily: 'monospace',
                        textAlign: 'center',
                        padding: '14px',
                        borderRadius: '12px',
                        letterSpacing: '10px',
                        outline: 'none',
                        marginBottom: '8px',
                        transition: 'border-color 0.2s',
                    }}
                />

                <div style={{ minHeight: '20px', marginBottom: '16px' }}>
                    {error && (
                        <span style={{ fontSize: '11px', color: 'var(--danger)' }}>{error}</span>
                    )}
                </div>

                <button
                    onClick={handleVerify}
                    disabled={loading || code.length !== 6}
                    style={{
                        width: '100%',
                        padding: '13px',
                        borderRadius: '10px',
                        border: 'none',
                        background: code.length === 6 ? 'var(--primary)' : 'var(--bg-hover)',
                        color: code.length === 6 ? '#000' : 'var(--text-muted)',
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        cursor: code.length === 6 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                    }}
                >
                    {loading ? 'VERIFYING...' : 'AUTHENTICATE'}
                </button>

                <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '16px' }}>
                    Google Authenticator · 6-digit TOTP
                </p>
            </div>
        </div>
    );
}