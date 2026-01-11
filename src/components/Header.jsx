import { Button, Container, Navbar } from 'react-bootstrap';
import { FaDoorOpen, FaSignOutAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import LogoIFCE from '../../img/logo-if.png';
import { useAuth } from '../contexts/AuthContext';

function Header() {
    const { logout } = useAuth();
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
                        src={LogoIFCE}
                        alt="Logo IFCE"
                        className="me-2"
                        style={{ height: '100px' }}
                    />
                </div>

                <Navbar.Brand
                    as={Link}
                    to="/"
                    className="mx-auto fw-bold fs-2"
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
                            <FaDoorOpen className="me-1" /> Voltar
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