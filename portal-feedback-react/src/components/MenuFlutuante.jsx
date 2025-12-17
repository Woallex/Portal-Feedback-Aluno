import { useState } from 'react';
import { Button, Nav } from 'react-bootstrap';
import { FaPlus, FaTimes, FaStar, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function MenuFlutuante() {
    // Requisito 3: Usando useState para controlar a abertura/fechamento do menu
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => setIsOpen(!isOpen);

    // Estilos adaptados para simular o comportamento flutuante do seu CSS
    const menuStyle = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000, // Garante que fique acima de outros elementos
    };

    return (
        <div style={menuStyle}>
            {/* Opções do Menu */}
            {isOpen && (
                <Nav className="flex-column mb-2 align-items-end gap-2">
                    <Button 
                        variant="primary" 
                        onClick={() => navigate('/publicar')}
                    >
                        <FaEdit className="me-2" /> Criar Publicação
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={() => navigate('/favoritos')}
                    >
                        <FaStar className="me-2" /> Ver Favoritos
                    </Button>
                </Nav>
            )}

            {/* Botão de Toggle */}
            <Button 
                variant={isOpen ? 'danger' : 'success'} 
                size="lg" 
                onClick={toggleMenu} 
                className="rounded-circle shadow-lg"
                style={{ width: '60px', height: '60px' }}
            >
                {isOpen ? <FaTimes size={24} /> : <FaPlus size={24} />}
            </Button>
        </div>
    );
}

export default MenuFlutuante;