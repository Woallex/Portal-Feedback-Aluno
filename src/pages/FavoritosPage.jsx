import { useCallback, useEffect, useState } from 'react';
import { Alert, Col, Container, Row, Spinner } from 'react-bootstrap';
import CardPublicacao from '../components/CardPublicacao';
import NavCategorias from '../components/NavCategorias';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';

function FavoritesPage() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);

    const { user } = useAuth();

    const loadFavorites = useCallback(async () => {
        setLoading(true);
        setError(null);

        const response = await apiFetch('/favorites');

        if (!response.error) {
            const favoritesWithFlag = response.data.map(pub => ({
                ...pub,
                favorito: true
            }));
            setFavorites(favoritesWithFlag);
        } else {
            setError(response.error || "Erro ao carregar favoritos.");
            setFavorites([]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (user) {
            loadFavorites();
        }
    }, [user, loadFavorites]);


    const handleToggleFavorite = (complaintId, isNowFavorite) => {
        if (!isNowFavorite) {
            setFavorites(prevFavorites =>
                prevFavorites.filter(fav => fav.id !== complaintId)
            );
        }
    };

    const filteredFavorites = activeCategory
        ? favorites.filter(fav => fav.category === activeCategory)
        : favorites;


    return (
        <div style={{ minHeight: '100vh', paddingBottom: '80px', backgroundColor: '#f8f9fa' }}>
            <NavCategorias
                categoriaAtiva={activeCategory}
                onCategoriaChange={setActiveCategory}
            />

            <Container className="mt-4">
                <h4 className="mb-3">
                    {activeCategory && ` em ${activeCategory}`}
                </h4>

                {loading && (
                    <div className="text-center mt-5">
                        <Spinner animation="border" role="status" />
                    </div>
                )}

                {error && <Alert variant="danger">{error}</Alert>}

                {!loading && !error && filteredFavorites.length === 0 && (
                    <Alert variant="info" className="text-center">
                        { activeCategory
                            ? `Você ainda não favoritou nenhuma publicação em ${activeCategory}.`
                            : `Você ainda não favoritou nenhuma publicação.`
                        }
                    </Alert>
                )}

                <Row>
                    {filteredFavorites.map(fav => (
                        <Col md={6} lg={4} key={fav.id}>
                            <CardPublicacao
                                publicacao={fav}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
}

export default FavoritesPage;