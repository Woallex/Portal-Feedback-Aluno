const API_BASE_URL = 'https://api-portal-feedback-aluno.onrender.com';

export async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    const defaultOptions = {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, defaultOptions);

        if (response.status === 204) { return { status: 204 }}

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            return { 
                error: data.message || data.error || "Erro na requisição.", 
                status: response.status 
            };
        }

       if (endpoint === '/auth/login' &&  data.data.token) {
            localStorage.setItem('token', data.data.token);
        }

       return data;

    } catch (error) {
        return { error: "Falha na conexão com o servidor." };
    }
}
