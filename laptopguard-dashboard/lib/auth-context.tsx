'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    token: string;
    setToken: (t: string) => void;
    isAuthed: boolean;
    ready: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    token: '', setToken: () => { }, isAuthed: false, ready: false, logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setTokenState] = useState('');
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const saved = sessionStorage.getItem('lg_token');
        if (saved) setTokenState(saved);
        setReady(true);
    }, []);

    const setToken = (t: string) => {
        setTokenState(t);
        sessionStorage.setItem('lg_token', t);
    };

    const logout = () => {
        setTokenState('');
        sessionStorage.removeItem('lg_token');
    };

    return (
        <AuthContext.Provider value={{ token, setToken, isAuthed: !!token, ready, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);