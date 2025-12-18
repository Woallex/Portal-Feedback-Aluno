import { useState } from 'react';
import { Badge, Button, Card, Spinner } from 'react-bootstrap';
import { FaCalendarAlt, FaRegStar, FaStar, FaTag, FaUser } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';

// Mapeamento de cores para as categorias (opcional, para visual)
const getCategoryVariant = (categoria) => {
    switch (categoria) {
        case 'Infraestrutura': return 'danger';
        case 'Alimentação': return 'warning';
        case 'TI/Portais': return 'info';
        case 'Acadêmico': return 'primary';
        case 'Segurança': return 'dark';
        default: return 'secondary';
    }
};

function CardPublicacao({ publicacao, onToggleFavorite }) {
    const { isLoggedIn, user } = useAuth();

    // Requisito 3: Gerencia o estado local de favorito e loading
    const [isFavorite, setIsFavorite] = useState(publicacao.favorito);
    // Cria um estado chamado isFavorite (booleano).
    // O valor inicial vem da propriedade publicacao.favorito.
    //setIsFavorite é a função usada para atualizar esse estado.
    const [loading, setLoading] = useState(false);
    // Cria um estado chamado loading (booleano).
    // O valor inicial é false.
    //setLoading é a função usada para mudar esse estado, por exemplo, quando a requisição está em andamento.


    // Função para alternar o estado de favorito
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

        // Requisito 4: Fazendo request da API para favoritar/desfavoritar
        const { ok } = await apiFetch(endpoint, { method });

        if (ok) {
            const newState = !isFavorite;
            setIsFavorite(newState);
            // Notifica o componente pai (HomePage/FavoritosPage) para que a lista seja atualizada (se necessário)
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


                {/* Corpo da Publicação */}
                <Card.Text className="text-muted mb-3">
                    {publicacao.corpo}
                </Card.Text>

                <Badge pill bg={getCategoryVariant(publicacao.categoria)} className="mb-2">
                    <FaTag className="me-1" /> {publicacao.categoria}
                </Badge>

                <div className="d-flex flex-column text-sm">
                    {/* Autor */}
                    <small className="mb-1">
                        <FaUser className="me-1" /> {publicacao.autor}
                    </small>
                    {/* Data */}
                    <small className="text-muted">
                        <FaCalendarAlt className="me-1" /> Publicado em {publicacao.data}
                    </small>
                </div>
            </Card.Body>
        </Card>
    );
}

export default CardPublicacao;