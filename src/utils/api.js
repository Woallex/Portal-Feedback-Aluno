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

        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return { ok: true, data: null, status: response.status };
        }

        const data = await response.json();

       if (endpoint === '/auth/login' && data.ok && data.data.token) {
            localStorage.setItem('token', data.data.token);
        }

        if (data.ok === true) {
            return { ok: true, data: data.data, status: response.status };
        } else {
            const errorMsg = data.error?.message || "Ocorreu um erro desconhecido na API.";
            return { ok: false, error: errorMsg, status: response.status };
        }
    } catch (error) {
        console.error("Erro na requisição da API:", error);
        return { ok: false, error: "Não foi possível conectar ao servidor da API.", status: 500 };
    }
}
