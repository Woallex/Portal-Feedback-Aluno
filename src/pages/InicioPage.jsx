import { useEffect } from 'react';
import { Button, Card, Container } from 'react-bootstrap';
import { FaShieldAlt, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LogoIFCE from '../../img/logo-if.png';

function UserTypeSelectionPage() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn, navigate]);

    const handleSelectType = (type) => {
        localStorage.setItem('userType', type);
        navigate('/login');
    };

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card className="p-5 shadow-lg rounded-4 text-center" style={{ maxWidth: '600px', width: '100%' }}>
                <div className="text-center mb-5">
                    <img src={LogoIFCE} alt="Logo IFCE" className="logo-ifce" style={{ width: '150px', marginBottom: '20px' }} />
                    <h2 className="mb-2">Portal de Feedback</h2>
                    <p className="text-muted">Selecione o tipo de acesso</p>
                </div>

                <div className="d-flex gap-4 justify-content-center" style={{ flexWrap: 'wrap' }}>
                    <Card
                        className="p-4 text-center cursor-pointer"
                        style={{
                            flex: '1',
                            minWidth: '180px',
                            border: '2px solid #f0f0f0',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#008037';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 128, 55, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#f0f0f0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <FaUser className="mb-3" style={{ fontSize: '48px', color: '#008037' }} />
                        <h4>Usuário</h4>
                        <p className="text-muted small">Acesse como usuário comum e veja publicações</p>
                        <Button
                            variant="outline-success"
                            onClick={() => handleSelectType('user')}
                            className="w-100"
                        >
                            Continuar como Usuário
                        </Button>
                    </Card>

                    <Card
                        className="p-4 text-center cursor-pointer"
                        style={{
                            flex: '1',
                            minWidth: '180px',
                            border: '2px solid #f0f0f0',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#dc3545';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#f0f0f0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <FaShieldAlt className="mb-3" style={{ fontSize: '48px', color: '#dc3545' }} />
                        <h4>Administrador</h4>
                        <p className="text-muted small">Acesse como administrador do sistema</p>
                        <Button
                            variant="outline-danger"
                            onClick={() => handleSelectType('admin')}
                            className="w-100"
                        >
                            Continuar como Admin
                        </Button>
                    </Card>
                </div>
            </Card>
        </Container>
    );
}

export default UserTypeSelectionPage;
