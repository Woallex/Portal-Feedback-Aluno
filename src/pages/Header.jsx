import { Button, Container, Navbar } from 'react-bootstrap';
import { FaHome, FaSignOutAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Header() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const { ok } = await logout();
        if (ok) {
            navigate('/login');
        }
    };

    return (
        <Navbar bg="light" expand="lg" className="shadow-sm">
            <Container fluid className="px-4">
                <div className="d-flex align-items-center">
                    <img
                        src="/logo-if.png"
                        alt="Logo IFCE"
                        className="me-2"
                        style={{ height: '40px' }}
                    />
                </div>

                <Navbar.Brand
                    as={Link}
                    to="/"
                    className="mx-auto fw-bold fs-4"
                    style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
                >
                    Portal Feedback
                </Navbar.Brand>

                <div className="d-flex align-items-center gap-2 ms-auto">
                    {window.location.pathname !== '/' && (
                        <Button
                            variant="outline-secondary"
                            onClick={() => navigate('/')}
                            title="Voltar para Home"
                        >
                            <FaHome className="me-1" /> Home
                        </Button>
                    )}

                    <Button variant="outline-danger" onClick={handleLogout} title="Sair da Aplicação">
                        <FaSignOutAlt className="me-1" /> Sair
                    </Button>
                </div>
            </Container>
        </Navbar>
    );
}

export default Header;