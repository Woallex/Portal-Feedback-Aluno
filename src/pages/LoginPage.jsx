import { useEffect, useState } from 'react';
import { Alert, Button, Card, Container, Form } from 'react-bootstrap';
import { FaLock, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import LogoIFCE from '../../img/logo-if.png';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
    const [loginInput, setLoginInput] = useState('');
    const [senhaInput, setSenhaInput] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [sendCodig, setSendCodig] = useState(false)

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn, navigate]);

    const handleSubmit = async (e) => {
        const result = await login(loginInput, senhaInput)

        if (result.success && requires2FA) {
            setSendCodig(true)
            alert("Verifique seu email.")
        } else if (result.success) {
            navigate('/home')
        }
            else {
            setError(result.error)
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card className="login-box p-4 shadow-lg rounded-4 text-center">

                <div className="text-center">
                    <img
                        src={LogoIFCE}
                        alt="Logo IFCE"
                        className="logo-ifce"
                    />
                    <h3 className="text-center mb-4">Portal de Feedback</h3>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>

                    <Form.Group className="mb-2" controlId="formBasicLogin">
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

                    <Form.Group className="mb-5" controlId="formBasicPassword">
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

                    <Button
                        variant="success"
                        type="submit"
                        className="w-100 mb-3"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Entrando...' : 'Entrar'}
                    </Button>
                </Form>

                <Card.Footer className="text-center border-0 bg-white">
                    Ainda não tem conta? <Link to="/cadastro">Cadastre-se aqui</Link>
                </Card.Footer>
            </Card>
        </Container>
    );
}

export default LoginPage;