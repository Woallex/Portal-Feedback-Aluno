import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FaHeart } from 'react-icons/fa'; // Requisito 5: React Icons
import { apiFetch } from '../utils/api'; // Requisito 4
import { useAuth } from '../contexts/AuthContext';
import NavCategorias from '../components/NavCategorias';
import CardPublicacao from '../components/CardPublicacao';

function FavoritosPage() {
    // Requisito 3: Usando useState
    const [favoritos, setFavoritos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    
    const { user } = useAuth();

    // Função para carregar os favoritos do usuário logado
    const loadFavoritos = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        // A API original /favoritos já lista apenas os do usuário logado (via session)
        let endpoint = '/favoritos';
        
        // Se a sua API tivesse um filtro por categoria nos favoritos, a lógica seria:
        // if (activeCategory) { endpoint = `/favoritos?categoria=${activeCategory}`; }
        
        // No momento, vamos ignorar o filtro de categoria AQUI, pois a rota /favoritos
        // na sua API não suporta filtro de categoria. Se for necessário, precisaria adaptar o Python.
        // Carregaremos TODOS e filtramos no frontend, mas no seu caso, vamos manter simples.

        const { ok, data, error: apiError } = await apiFetch(endpoint);

        if (ok) {
            // Adiciona a flag 'favorito: true' para garantir que CardPublicacao funcione
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


    // Função que remove um favorito da lista local após desfavoritar
    const handleToggleFavorite = (complaintId, isNowFavorite) => {
        // Se o usuário desfavoritou (isNowFavorite é false), remove da lista
        if (!isNowFavorite) {
            setFavoritos(prevFavoritos =>
                prevFavoritos.filter(fav => fav.id !== complaintId)
            );
        }
        // Se fosse favoritar, a lista não mudaria (aqui só mostra favoritos)
    };
    
    // Filtra a lista localmente com base na categoria ativa (simulando filtro)
    const filteredFavoritos = activeCategory
        ? favoritos.filter(fav => fav.categoria === activeCategory)
        : favoritos;


    return (
        <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            {/* O NavCategorias será exibido, mas sem funcionalidade real de filtro no backend /favoritos */}
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