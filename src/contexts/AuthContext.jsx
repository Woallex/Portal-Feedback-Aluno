import { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    const login = async (login, senha) => {
        setLoading(true);

        try {
            const response = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ login, senha })
        });

            if (response.ok) {
                const data = await response.json();
                setUser(data.data);
                return { ok: true, data };
            } else {
                const errorText = await response.text();
                setUser(null);
                return { ok: false, error: errorText };
            }
        } catch (err) {
            setUser(null);
            return { ok: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        await apiFetch('/logout', { method: 'POST' });
        setUser(null);
        setLoading(false);
        return { ok: true };
    };

    const value = {
        user,
        isLoggedIn: !!user,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};