import { useState } from 'react';
import { Button, Nav } from 'react-bootstrap';
import { FaDownload, FaEdit, FaFilePdf, FaPlus, FaStar, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function MenuFlutuante() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch('https://api-portal-feedback-aluno.onrender.com/publications/export', {
                method: 'GET',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!response.ok) {
                throw new Error("Erro ao baixar o arquivo");
            }

            const blob = await response.blob();
            
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'feedbacks_portal.csv');
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            setIsOpen(false);
            
        } catch (error) {
            console.error("Erro na exportação:", error);
            alert("Não foi possível exportar os dados no momento.");
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://api-portal-feedback-aluno.onrender.com/metrics/export-pdf', {
                method: 'GET',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!response.ok) throw new Error("Erro ao baixar o relatório PDF");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `relatorio_monitoramento.pdf`); 
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            setIsOpen(false);
        } catch (error) {
            console.error("Erro na exportação do PDF:", error);
            alert("Não foi possível exportar o relatório no momento.");
        }
    };

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
                        onClick={() => {
                            navigate('/publicar');
                            setIsOpen(false);
                        }}
                    >
                        <FaEdit className="me-2" /> Criar Publicação
                    </Button>
                    <Button
                        variant="success"
                        onClick={() => {
                            navigate('/favorites');
                            setIsOpen(false);
                        }}
                    >
                        <FaStar className="me-2" /> Ver Favoritos
                    </Button>
                    
                    <Button
                        variant="success"
                        className="text-white fw-bold"
                        onClick={handleExport}
                    >
                        <FaDownload className="me-2" /> Exportar CSV
                    </Button>

                    <Button
                        variant="success"
                        className="text-dark fw-bold"
                        onClick={handleDownloadPDF}
                    >
                        <FaFilePdf className="me-2" /> Relatório PDF
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