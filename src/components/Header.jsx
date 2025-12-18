import { Navbar, Container, Button } from 'react-bootstrap'; // Requisito 2: React Bootstrap
import { FaSignOutAlt, FaDoorOpen} from 'react-icons/fa'; // Requisito 5: React Icons
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LogoIFCE from '../../img/logo-if.png'

function Header() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        // Requisito 4: Fazendo request da API para logout
        const { ok } = await logout();
        if (ok) {
            navigate('/login'); // Redireciona para o login após o logout
        }
    };

    return (
        // Usamos Navbar para recriar o header do seu HTML
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
                
                {/* Título Centralizado */}
                <Navbar.Brand 
                    as={Link} 
                    to="/" 
                    className="mx-auto fw-bold fs-2"
                    style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
                >
                    Portal Feedback
                </Navbar.Brand>
                
                {/* Botões de Navegação e Sair à direita */}
                <div className="d-flex align-items-center gap-2 ms-auto">
                    {/* Botão Home (visível em FavoritosPage, invisível em HomePage) */}
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