import { useEffect, useState } from 'react';
import { Alert, Button, Card, Container, Form } from 'react-bootstrap';
import { FaLock, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import LogoIFCE from '../../img/logo-if.png';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
    const [loginInput, setLoginInput] = useState('');
    const [senhaInput, setSenhaInput] = useState('');
    const [code2FA, setcode2FA] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [sendCode, setSendCode] = useState(false);

    const { login, isLoggedIn, Verify2FA } = useState();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const result = await login(loginInput, senhaInput);

        if (result.success && requires2FA) {
            setSendCode(true)
            alert("Verifique seu email.")
        } else if (result.success) {
            navigate('/')
        }
            else {
            setError(result.error || "Erro ao realizar login.")
        }
        setIsSubmitting(false);
    };

    const handleVerify2FA = async (e) => {
            e.preventDefault();
            setError(null);

            const result = await Verify2FA(loginInput, senhaInput);

            if (result.success) {
                navigate('/home');
            } else {
                setError(result.error || "Código inválido.")
            }
        }

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card className="login-box p-4 shadow-lg rounded-4 text-center" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="text-center">
                    <img src={LogoIFCE} alt="Logo IFCE" className="logo-ifce" style={{ width: '150px' }} />
                    <h3 className="text-center mb-4">Portal de Feedback</h3>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                {!sendCode ? (
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-2">
                            <Form.Label className='d-block text-start'>Login (E-mail Institucional)</Form.Label>
                            <div className="input-group">
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

                        <Form.Group className="mb-4">
                            <Form.Label className='d-block text-start'>Senha</Form.Label>
                            <div className="input-group">
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

                        <Button variant="success" type="submit" className="w-100 mb-3" disabled={isSubmitting}>
                            {isSubmitting ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </Form>
                ) : (
                    <Form onSubmit={handleVerify2FA}>
                        <Form.Group className="mb-3">
                            <Form.Label className='d-block text-start'>Código de Verificação</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Digite o código do e-mail"
                                value={code2FA}
                                onChange={(e) => setcode2FA(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100 mb-3">
                            Validar Código
                        </Button>
                        <Button variant="link" onClick={() => setSendCode(false)} className="text-muted">
                            Voltar para o login
                        </Button>
                    </Form>
                )}

                <Card.Footer className="text-center border-0 bg-white p-0">
                    Ainda não tem conta? <Link to="/cadastro">Cadastre-se aqui</Link>
                </Card.Footer>
            </Card>
        </Container>
    );
}

export default LoginPage;