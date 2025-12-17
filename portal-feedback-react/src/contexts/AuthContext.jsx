import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/api'; // Importa nossa função de API

// 1. Cria o Contexto
const AuthContext = createContext();

// Hook personalizado para facilitar o uso
export const useAuth = () => useContext(AuthContext);

// 2. Componente Provedor (Provider)
export const AuthProvider = ({ children }) => {
    // useState para armazenar as informações do usuário logado
    // user = { id: 1, login: "aluno1@ifce.edu.br" } ou null se deslogado
    const [user, setUser] = useState(null); 
    const [loading, setLoading] = useState(true);

    // Tenta obter o status do login ao carregar a aplicação
    useEffect(() => {
        // Esta função tentará fazer um GET em uma rota que requer login para checar o status.
        // Como não temos uma rota /status, vamos usar o /logout para "simular"
        // o fim da sessão ao iniciar e manter o estado limpo, mas na prática
        // para um check de status, você faria um GET numa rota protegida.
        
        // PARA SIMPLIFICAR: No React, vamos assumir que se a página é carregada, 
        // o usuário está deslogado e só fica logado após um POST /login BEM-SUCEDIDO.
        // A API Flask cuidará da sessão via cookies.
        setLoading(false);
    }, []);

    // Função de Login que será chamada da LoginPage
    const login = async (login, senha) => {
        setLoading(true);
        const { ok, data, error } = await apiFetch('/login', {
            method: 'POST',
            body: JSON.stringify({ login, senha }),
        });
        setLoading(false);

        if (ok) {
            // A API retorna o id e o login do usuário (data: {id, login})
            setUser(data); 
            return { ok: true };
        } else {
            setUser(null);
            return { ok: false, error };
        }
    };

    // Função de Logout
    const logout = async () => {
        setLoading(true);
        // A requisição POST /logout na sua API limpa a sessão no servidor.
        await apiFetch('/logout', { method: 'POST' }); 
        setUser(null); // Limpa o estado no React
        setLoading(false);
        return { ok: true };
    };

    // Objeto que será fornecido a todos os componentes
    const value = {
        user,
        isLoggedIn: !!user,
        loading,
        login,
        logout,
        // Você pode adicionar funções para favoritados aqui depois
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};