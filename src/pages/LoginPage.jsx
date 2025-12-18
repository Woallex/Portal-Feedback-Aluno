import { useEffect, useState } from 'react';
import { Alert, Button, Card, Container, Form } from 'react-bootstrap';
import { FaLock, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import LogoIFCE from '../../img/logo-if.png';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
    // Requisito 3: Usando useState para gerenciar o estado do formulário
    const [loginInput, setLoginInput] = useState('');
    const [senhaInput, setSenhaInput] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pega a função de login do Contexto
    const { login, isLoggedIn } = useAuth();

    const navigate = useNavigate();

    // ESTE BLOCO (useEffect) para redirecionar de forma segura
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        // Requisito 4: Fazendo request da API
        const response = await login(loginInput, senhaInput);

        if (response.ok) {
            // Login bem-sucedido: Redireciona para a página inicial (Home)
            navigate('/');
        } else {
            // Falha no login
            setError(response.error || "Erro ao realizar login.");
        }
        setIsSubmitting(false);
    };

    // src/pages/LoginPage.jsx (NOVO RETURN JSX)
    return (
        // O Container centraliza a caixa Card e aplica a classe de fundo 'login-body' do App.css
        <Container className="d-flex justify-content-center align-items-center vh-100">
            {/* Aplica a classe login-box para largura e estilo da caixa */}
            <Card className="login-box p-4 shadow-lg rounded-4 text-center">

                {/* Imagem do IFCE - Como o logo é uma imagem, carregamos ela */}
                <div className="text-center">
                    {/* Assumindo que logo-if.png está na pasta public/ */}
                    <img
                        src={LogoIFCE}
                        alt="Logo IFCE"
                        className="logo-ifce" // Classe para definir largura (do App.css)
                    />
                    <h3 className="text-center mb-4">Portal de Feedback</h3>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>

                    {/* CAMPO LOGIN (E-mail) */}
                    {/* Estilo original não tem label no topo, mas sim placeholders e ícones */}
                    <Form.Group className="mb-2" controlId="formBasicLogin">
                        <Form.Label className='d-block text-start'>Login (E-mail Institucional)</Form.Label>
                        <div className="input-group">
                            {/* Ícone à esquerda */}
                            <span className="input-group-text"><FaUser /></span>
                            <Form.Control
                                type="email"
                                placeholder="Digite seu login"
                                value={loginInput}
                                onChange={(e) => setLoginInput(e.target.value)}
                                required
                            />
                        </div>
                    </Form.Group>

                    {/* CAMPO SENHA */}
                    <Form.Group className="mb-5" controlId="formBasicPassword">
                        <Form.Label className='d-block text-start'>Senha</Form.Label>
                        <div className="input-group">
                            {/* Ícone à esquerda */}
                            <span className="input-group-text"><FaLock /></span>
                            <Form.Control
                                type="password"
                                placeholder="Senha"
                                value={senhaInput}
                                onChange={(e) => setSenhaInput(e.target.value)}
                                required
                            />
                        </div>
                    </Form.Group>

                    {/* BOTÃO ENTRAR (Usa classe btn-success do App.css) */}
                    <Button //É o componente de botão do React-Bootstrap, que já vem estilizado com classes do Bootstrap.
                        variant="success" // Define o estilo do botão. O success corresponde ao verde padrão do Bootstrap.
                        type="submit" // Indica que o botão é do tipo submit, ou seja, quando clicado dentro de um formulário, ele dispara o envio do formulário.
                        className="w-100 mb-3" // largura total (100% do container).
                        disabled={isSubmitting} // O botão ficará desabilitado (disabled) enquanto a variável isSubmitting for true. Isso evita múltiplos cliques durante o envio do formulário.

                    //expressão condicional (ternário)
                    //Se isSubmitting for true, o texto exibido será "Entrando...".
                    //Se isSubmitting for false, o texto exibido será "Entrar".
                    >
                        {isSubmitting ? 'Entrando...' : 'Entrar'}
                    </Button>
                </Form>

                {/* RODAPÉ: Link de Cadastro */}
                <Card.Footer className="text-center border-0 bg-white">
                    Ainda não tem conta? <Link to="/cadastro">Cadastre-se aqui</Link>
                </Card.Footer>
            </Card>
        </Container>
    );
}

export default LoginPage;