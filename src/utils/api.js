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
            return { 
                error: data.message || "Erro na requisição.", 
                status: response.status 
            };
        }

        const receivedToken = data.token || data.data?.token;

        if (endpoint === '/auth/login' && receivedToken) {
            localStorage.setItem('token', receivedToken);
        }

        return { ...data, status: response.status };

    } catch (error) {
        console.error("Erro no apiFetch:", error);
        return { error: "Falha na conexão com o servidor." };
    }
}