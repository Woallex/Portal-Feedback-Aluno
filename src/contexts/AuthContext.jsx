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
            body: JSON.stringify({ login, senha }),
        });

        if (response.ok) {
            setUser(response.data); 
            return { ok: true };
        } else {
            setUser(null);
            return { ok: false, error: response.error }; 
        }
    } catch (err) {
        setUser(null);
        return { ok: false, error: "Erro de conexão com o servidor." };
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