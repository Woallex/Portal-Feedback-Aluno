const API_BASE_URL = 'https://api-portal-feedback-aluno.onrender.com';

export async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const defaultOptions = {
        method: 'GET',
        ...options,
        headers: headers,
    };

    try {
        const response = await fetch(url, defaultOptions);

        if (response.status === 204) return { status: 204 };

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401) {
                console.warn(" Erro 401 na API. Token enviado:", token ? "Sim" : "Não");
            }
            return { 
                error: data.message || data.error || "Erro na requisição.", 
                status: response.status 
            };
        }

        if (endpoint === '/auth/login' && data.data?.token) {
            localStorage.setItem('token', data.data.token);
        }

        return data;

    } catch (error) {
        console.error("Erro no apiFetch:", error);
        return { error: "Falha na conexão com o servidor." };
    }
}