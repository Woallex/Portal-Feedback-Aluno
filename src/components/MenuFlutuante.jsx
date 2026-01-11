import { useState } from 'react';
import { Button, Nav } from 'react-bootstrap';
import { FaEdit, FaPlus, FaStar, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function MenuFlutuante() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => setIsOpen(!isOpen);

    const menuStyle = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
    };

    return (
        <div style={menuStyle}>
            {isOpen && (
                <Nav className="flex-column mb-2 gap-2">
                    <Button
                        variant="success"
                        onClick={() => navigate('/publicar')}
                    >
                        <FaEdit className="me-2" /> Criar Publicação
                    </Button>
                    <Button
                        variant="success"
                        onClick={() => navigate('/favoritos')}
                    >
                        <FaStar className="me-2" /> Ver Favoritos
                    </Button>
                </Nav>
            )}

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