import { useState } from 'react';
import { Badge, Button, Card, Spinner, Modal } from 'react-bootstrap';
import { FaCalendarAlt, FaRegStar, FaStar, FaTag, FaUser, FaTrash } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';

const getCategoryVariant = (category) => {
    switch (category) {
        case 'Infraestrutura': return 'danger';
        case 'Alimentação': return 'warning';
        case 'TI/Portais': return 'info';
        case 'Acadêmico': return 'primary';
        case 'Segurança': return 'dark';
        default: return 'secondary';
    }
};

function CardPublicacao({ publicacao, onToggleFavorite, onDeletePublication }) {
    const { isLoggedIn, user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(publicacao.favorito);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isOwner = isLoggedIn && user?.login === publicacao.author;

    const handleToggleFavorite = async () => {
        if (!isLoggedIn) {
            alert("Você precisa estar logado para favoritar!");
            return;
        }

        setLoading(true);
        const endpoint = `/favorites/${publicacao.id}`;
        
        try {
            const response = await apiFetch(endpoint, { method: 'POST' });

            if (!response.error){
                const newState = !isFavorite;
                setIsFavorite(newState);
                if (onToggleFavorite) {
                    onToggleFavorite(publicacao.id, newState);
                }
            } else {
                alert(response.error || "Erro ao atualizar favorito.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await apiFetch(`/publications/${publicacao.id}`, { method: 'DELETE' });
            if (!response.error) {
                if (onDeletePublication) onDeletePublication(publicacao.id);
            } else {
                alert(response.error || "Erro ao excluir.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="card-wrapper">
            {isOwner && (
                <Button 
                    className="btn-delete-float"
                    onClick={() => setShowDeleteModal(true)}
                    title="Excluir publicação"
                >
                    <FaTrash size={18} />
                </Button>
            )}

            <Card className="publicacao-card h-100 shadow-sm">
                <Card.Body>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <Card.Title className="mb-0">
                            {publicacao.title}
                        </Card.Title>

                        <Button
                            variant="link"
                            onClick={handleToggleFavorite}
                            disabled={loading || !isLoggedIn}
                            title={isFavorite ? "Desfavoritar" : "Favoritar"}
                            className="p-0 text-decoration-none"
                        >
                            {loading ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                isFavorite
                                    ? <FaStar size={30} className="text-warning" />
                                    : <FaRegStar size={30} className="text-muted" />
                            )}
                        </Button>
                    </div>

                    <Card.Text className="text-muted mb-3">
                        {publicacao.description}
                    </Card.Text>

                    <Badge pill bg={getCategoryVariant(publicacao.category)} className="mb-2">
                        <FaTag className="me-1" /> {publicacao.category}
                    </Badge>

                    <div className="d-flex flex-column text-sm">
                        <small className="mb-1">
                            <FaUser className="me-1" /> {publicacao.author}
                        </small>
                        <small className="text-muted">
                            <FaCalendarAlt className="me-1" /> Publicado em {publicacao.date}
                        </small>
                    </div>
                </Card.Body>
            </Card>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Excluir Publicação</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Tem certeza que deseja excluir "<strong>{publicacao.title}</strong>"? 
                    Essa ação não pode ser desfeita.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default CardPublicacao;