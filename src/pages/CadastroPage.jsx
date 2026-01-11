import { useState } from 'react';
import { Alert, Button, Card, Container, Form } from 'react-bootstrap';
import { FaLock, FaUser, FaUserPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';

function CadastroPage() {
    const [loginInput, setLoginInput] = useState('');
    const [senhaInput, setSenhaInput] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    if (isLoggedIn) {
        navigate('/');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (senhaInput !== confirmarSenha) {
            setError("As senhas não coincidem.");
            return;
        }

        setIsSubmitting(true);

        const { ok, error: apiError } = await apiFetch('/usuarios', {
            method: 'POST',
            body: JSON.stringify({ login: loginInput, senha: senhaInput }),
        });

        if (ok) {
            setSuccess(true);
            setError(null);
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } else {
            setError(apiError || "Erro ao realizar o cadastro.");
        }
        setIsSubmitting(false);
    };

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card className="login-box p-4 shadow-lg rounded-4">
                <Card.Header className="text-center bg-success text-white rounded-top">
                    <h3 className="mb-0"><FaUserPlus className="me-2" /> Novo Cadastro</h3>
                </Card.Header>

                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">Cadastro realizado com sucesso! Redirecionando...</Alert>}

                    <Form onSubmit={handleSubmit}>

                        <Form.Group className="mb-3" controlId="formCadastroLogin">
                            <Form.Label>Login (E-mail)</Form.Label>
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

                        <Form.Group className="mb-3" controlId="formCadastroSenha">
                            <Form.Label>Senha</Form.Label>
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

                        <Form.Group className="mb-4" controlId="formConfirmarSenha">
                            <Form.Label>Confirme a Senha</Form.Label>
                            <div className="input-group">
                                <span className="input-group-text"><FaLock /></span>
                                <Form.Control
                                    type="password"
                                    placeholder="Confirme a senha"
                                    value={confirmarSenha}
                                    onChange={(e) => setConfirmarSenha(e.target.value)}
                                    required
                                />
                            </div>
                        </Form.Group>

                        <Button
                            variant="primary"
                            type="submit"
                            className="w-100"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                        </Button>
                    </Form>
                </Card.Body>

                <Card.Footer className="text-center border-0 bg-white">
                    Já tem conta? <Link to="/login">Faça login</Link>
                </Card.Footer>
            </Card>
        </Container>
    );
}

export default CadastroPage;