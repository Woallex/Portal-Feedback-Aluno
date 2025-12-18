// URL base da sua API Flask. 
// Certifique-se de que a API Python está rodando em http://127.0.0.1:5000 (padrão do Flask)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Função utilitária para fazer requisições à API.
 * Importante: 'credentials: "include"' é NECESSÁRIO para que os cookies de sessão 
 * (que o Flask usa para manter o login) sejam enviados e recebidos.
 */
export async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Configurações padrão: incluir credenciais e assumir JSON no header
    const defaultOptions = {
        ...options,
        credentials: 'include', // ESSENCIAL para a sessão do Flask
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, defaultOptions);
        
        // Se a resposta for um 204 No Content (como o logout ou favoritos), não tenta parsear JSON
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return { ok: true, data: null, status: response.status };
        }

        const data = await response.json();
        
        // A sua API retorna um objeto padrão: {ok: boolean, data: object/array, error: object}
        if (data.ok === true) {
            return { ok: true, data: data.data, status: response.status };
        } else {
            // Se o 'ok' for False, é um erro de negócio ou validação (ex: Login incorreto, 401, 400)
            const errorMsg = data.error?.message || "Ocorreu um erro desconhecido na API.";
            return { ok: false, error: errorMsg, status: response.status };
        }
    } catch (error) {
        console.error("Erro na requisição da API:", error);
        return { ok: false, error: "Não foi possível conectar ao servidor da API.", status: 500 };
    }
}