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

   const login = async (login, password) => {
    setLoading(true);
    try {
        const response = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ login, password }),
        });

        if (!response.error) {
            const userData = response.data;

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData))

            return { success: true };
        } else {
            setUser(null);
            return { success: false, error: response.error }; 
        }
    } catch (err) {
        setUser(null);
        return { success: false, error: "Erro de conexão com o servidor." };
    } finally {
        setLoading(false);
    }
};

    const logout = async () => {
       setLoading(true);
       localStorage.removeItem('token');
       localStorage.removeItem('user');
       setUser(null);
       setLoading(false);
       return { success: true };
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