import { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

const AuthContext = createContext();

const parseJwt = (token) => {
    if (!token) return null;
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return decoded;
    } catch {
        return null;
    }
};

const extractUserData = (response, email) => {
    const token = response.token || response.data?.token || response.data?.data?.token;
    let userData = response.user || response.data?.user || response.data?.data?.user;

    if (!userData && response.data && typeof response.data === 'object') {
        const candidate = response.data;
        if ('role' in candidate || 'login' in candidate || 'id' in candidate) {
            userData = candidate;
        }
    }

    if (!userData) {
        userData = { login: email };
    }

    const decoded = parseJwt(token);
    if (decoded) {
        userData = { ...decoded, ...userData };
    }

    return { token, userData };
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');

        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            const decoded = parseJwt(savedToken);
            if (decoded) {
                const merged = { ...parsedUser, ...decoded };
                setUser(merged);
                if (merged.role && merged.id && (!parsedUser.role || !parsedUser.id)) {
                    localStorage.setItem('user', JSON.stringify(merged));
                }
            } else {
                setUser(parsedUser);
            }
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
                const { token, userData } = extractUserData(response, email);

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));

                setUser(userData);
                return { success: true, user: userData };
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
            const response = await apiFetch('/auth/verify2FA', {
                method: 'POST',
                body: JSON.stringify({ login: email, code: code }),
            });

            if (!response.error && response.status === 200) {
                const { token, userData } = extractUserData(response, email);

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));

                setUser(userData);
                return { success: true, user: userData };
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