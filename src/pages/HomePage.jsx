import { useCallback, useEffect, useState } from 'react';
import { Alert, Col, Container, Row, Spinner } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import CardPublicacao from '../components/CardPublicacao';
import MenuFlutuante from '../components/MenuFlutuante';
import NavCategorias from '../components/NavCategorias';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';

function HomePage() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" />
            </div>
        );
    }

    const location = useLocation();

    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccessMessage(location.state.successMessage);

            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const loadComplaints = useCallback(async () => {
        setLoading(true);
        setError(null);

        let endpoint = `/reclamacoes2?userId=${user.id}`;
        if (activeCategory) {
            endpoint += `&categoria=${activeCategory}`;
        }

        const { ok, data, error: apiError } = await apiFetch(endpoint);

        if (ok) {
            setComplaints(data);
        } else {
            setError(apiError || "Erro ao carregar publicações.");
            setComplaints([]);
        }
        setLoading(false);
    }, [user.id, activeCategory]);

    useEffect(() => {
        if (user) {
            console.log('Usuário logado: ', user);
            loadComplaints();
        }
    }, [user, loadComplaints]);

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
    };

    const handleToggleFavorite = (complaintId, isNowFavorite) => {
        setComplaints(prevComplaints =>
            prevComplaints.map(comp =>
                comp.id === complaintId
                    ? { ...comp, favorito: isNowFavorite }
                    : comp
            )
        );
    };

    return (
        <div className="bg-white flex-grow-1" style={{ paddingBottom: '40px' }}>
            <NavCategorias
                categoriaAtiva={activeCategory}
                onCategoriaChange={handleCategoryChange}
            />

            <Container className="mt-4">
                <h4 className="mb-3">
                    {activeCategory
                        ? `Publicações em ${activeCategory}`
                        : 'Todas as Publicações'}
                </h4>

                {successMessage && (
                    <Alert
                        variant="success"
                        dismissible
                        onClose={() => setSuccessMessage(null)}
                    >
                        {successMessage}
                    </Alert>
                )}

                {loading && (
                    <div className="text-center mt-5">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </Spinner>
                    </div>
                )}

                {error && <Alert variant="danger">{error}</Alert>}

                {!loading && complaints.length === 0 && !error && (
                    <Alert variant="info" className="text-center">
                        Nenhuma publicação encontrada.
                    </Alert>
                )}

                <Row>
                    {complaints.map(comp => (
                        <Col md={6} lg={4} key={comp.id}>
                            <CardPublicacao
                                publicacao={comp}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        </Col>
                    ))}
                </Row>
            </Container>

            <MenuFlutuante />
        </div>
    );
}

export default HomePage;
