import { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ login: email, password }),
            });

            if (!response.error && response.status === 200) {
                const token = response.token || response.data?.token;
                const userData = response.data || response.data?.user || { login: email };

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));

                setUser(userData);
                return { success: true };
            } 

            if (response.status === 202) {
                return { success: true, requires2FA: true, message: response.message };
            }

            setUser(null);
            return { success: false, error: response.error || "Erro ao realizar login." };
        } catch (err) {
            setUser(null);
            return { success: false, error: "Erro de conexão com o servidor." };
        } finally {
            setLoading(false);
        }
    };

    const verify2FA = async (email, code) => {
        setLoading(true);
        try {
            const response = await apiFetch('/auth/verify-2fa', {
                method: 'POST',
                body: JSON.stringify({ login: email, code: code }),
            });

            if (!response.error && response.status === 200) {
                const token = response.token || response.data?.token;
                const userData = response.data || response.data?.user || { login: email };

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));

                setUser(userData);
                return { success: true };
            }

            return { success: false, error: response.error || "Código inválido." };
        } catch (err) {
            return { success: false, error: "Erro ao validar código." };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setLoading(true);
        localStorage.clear();
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
        verify2FA,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};