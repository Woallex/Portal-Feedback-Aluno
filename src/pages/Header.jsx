import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap'; // Requisito 2: React Bootstrap
import { FaSignOutAlt, FaHome, FaHeart, FaPlus } from 'react-icons/fa'; // Requisito 5: React Icons
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// Importa o logo. Em um projeto React real, você importaria a imagem
// import logoIfce from '../assets/logo-if.png'; 

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
                    {/* Substitua o caminho da imagem pelo import real ou use o logo-if.png na pasta public/ */}
                    {/* Se você colocar img/logo-if.png na pasta public/ do React, use: process.env.PUBLIC_URL + '/img/logo-if.png' */}
                    <img 
                        src="/logo-if.png" // Assumindo que logo-if.png está em public/
                        alt="Logo IFCE" 
                        className="me-2" 
                        style={{ height: '40px' }} 
                    />
                </div>
                
                {/* Título Centralizado */}
                <Navbar.Brand 
                    as={Link} 
                    to="/" 
                    className="mx-auto fw-bold fs-4"
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