import { useCallback, useEffect, useState } from 'react';
import { Alert, Col, Container, Row, Spinner } from 'react-bootstrap';
import CardPublicacao from '../components/CardPublicacao';
import NavCategorias from '../components/NavCategorias';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';

function FavoritosPage() {
    const [favoritos, setFavoritos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);

    const { user } = useAuth();

    const loadFavoritos = useCallback(async () => {
        setLoading(true);
        setError(null);

        let endpoint = '/favoritos';

        const { ok, data, error: apiError } = await apiFetch(endpoint);

        if (ok) {
            const favoritosComFlag = data.map(pub => ({
                ...pub,
                favorito: true
            }));
            setFavoritos(favoritosComFlag);
        } else {
            setError(apiError || "Erro ao carregar favoritos.");
            setFavoritos([]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (user) {
            loadFavoritos();
        }
    }, [user, loadFavoritos]);


    const handleToggleFavorite = (complaintId, isNowFavorite) => {
        if (!isNowFavorite) {
            setFavoritos(prevFavoritos =>
                prevFavoritos.filter(fav => fav.id !== complaintId)
            );
        }
    };

    const filteredFavoritos = activeCategory
        ? favoritos.filter(fav => fav.categoria === activeCategory)
        : favoritos;


    return (
        <div style={{ minHeight: '100vh', paddingBottom: '80px', backgroundColor: '#f8f9fa' }}>
            <NavCategorias
                categoriaAtiva={activeCategory}
                onCategoriaChange={setActiveCategory}
            />

            <Container className="mt-4">
                <h4 className="mb-3">
                    Minhas Publicações Favoritadas
                    {activeCategory && ` em ${activeCategory}`}
                </h4>

                {loading && (
                    <div className="text-center mt-5">
                        <Spinner animation="border" role="status" />
                    </div>
                )}

                {error && <Alert variant="danger">{error}</Alert>}

                {!loading && filteredFavoritos.length === 0 && !error && (
                    <Alert variant="info" className="text-center">
                        Nenhuma publicação favoritada{activeCategory && ` para a categoria ${activeCategory}`}.
                    </Alert>
                )}

                <Row>
                    {filteredFavoritos.map(fav => (
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

export default FavoritosPage;