import { useState } from 'react';
import { Badge, Button, Card, Spinner } from 'react-bootstrap';
import { FaCalendarAlt, FaRegStar, FaStar, FaTag, FaUser } from 'react-icons/fa';
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

function CardPublicacao({ publicacao, onToggleFavorite }) {
    const { isLoggedIn } = useAuth();
    const [isFavorite, setIsFavorite] = useState(publicacao.favorito);
    const [loading, setLoading] = useState(false);

    const handleToggleFavorite = async () => {
        if (!isLoggedIn) {
            alert("Você precisa estar logado para favoritar!");
            return;
        }

        setLoading(true);
        const endpoint = isFavorite
            ? `/favoritos/${publicacao.id}`
            : `/favoritos/${publicacao.id}`;

        const method = isFavorite ? 'DELETE' : 'POST';

        const { ok } = await apiFetch(endpoint, { method });

        if (ok) {
            const newState = !isFavorite;
            setIsFavorite(newState);
            if (onToggleFavorite) {
                onToggleFavorite(publicacao.id, newState);
            }
        } else {
            alert(`Erro ao ${isFavorite ? 'desfavoritar' : 'favoritar'} a publicação.`);
        }

        setLoading(false);
    };

    return (
        <Card className="publicacao-card">
            <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <Card.Title className="mb-0">
                        {publicacao.titulo}
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
                    {publicacao.corpo}
                </Card.Text>

                <Badge pill bg={getCategoryVariant(publicacao.category)} className="mb-2">
                    <FaTag className="me-1" /> {publicacao.category}
                </Badge>

                <div className="d-flex flex-column text-sm">
                    <small className="mb-1">
                        <FaUser className="me-1" /> {publicacao.autor}
                    </small>
                    <small className="text-muted">
                        <FaCalendarAlt className="me-1" /> Publicado em {publicacao.data}
                    </small>
                </div>
            </Card.Body>
        </Card>
    );
}

export default CardPublicacao;