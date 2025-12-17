import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { FaEdit, FaRegStar, FaStar, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const CATEGORIAS = [
    "Infraestrutura", "Alimentação", "Transporte", "Limpeza",
    "TI/Portais", "Acadêmico", "Eventos/Calendário", "Segurança"
];

function CriarPublicacaoPage() {
    const navigate = useNavigate();

    // Requisito 3: Usando useState para gerenciar o estado do formulário e UI
    const [titulo, setTitulo] = useState('');
    const [corpo, setCorpo] = useState('');
    const [categoria, setCategoria] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // ✅ NOVO ESTADO: Para exibir a mensagem de sucesso antes do redirecionamento
    const [success, setSuccess] = useState(false);

    // Data formatada para exibir (como no seu JS original)
    const dataAtual = new Date().toLocaleDateString("pt-BR");

    const handleDescartar = () => {
        navigate('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!titulo || corpo.length < 10 || !categoria) {
            setError("Preencha todos os campos corretamente (descrição mínima de 10 caracteres).");
            return;
        }

        setLoading(true);

        try {
            const publicacaoResponse = await apiFetch('/reclamacoes', {
                method: 'POST',
                body: JSON.stringify({ titulo, corpo, categoria }),
            });

            if (!publicacaoResponse.ok) {
                throw new Error(publicacaoResponse.error || "Erro ao criar publicação.");
            }

            const novaPublicacao = publicacaoResponse.data;

            if (isFavorite) {
                await apiFetch(`/favoritos/${novaPublicacao.id}`, {
                    method: 'POST',
                });
            }

            // 🚀 REDIRECIONA IMEDIATAMENTE
            navigate('/', {
                replace: true,
                state: {
                    successMessage: 'Publicação criada com sucesso!'
                }
            });

        } catch (err) {
            console.error(err);
            setError(err.message || "Não foi possível publicar.");
            setLoading(false); // 👈 loading só cai em erro
        }
    };


    return (
        <Container className='d-flex justify-content-center align-items-center vh-100'>
            <Card className="shadow-lg">

                {/* HEADER AZUL COM ESTRELA DE FAVORITO */}
                <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
                    <h4 className="mb-0">
                        <FaEdit className="me-2" /> Nova Publicação
                    </h4>

                    {/* Botão de Favoritar (Estrela) */}
                    <Button
                        variant="link"
                        onClick={() => setIsFavorite(!isFavorite)}
                        className="p-0 text-white"
                        title={isFavorite ? "Desmarcar Favorito" : "Marcar como Favorito"}
                        disabled={loading || success} // Desabilita se estiver carregando ou tiver sucesso


                        //<FaStar /> é o ícone de estrela cheia (importado de react-icons/fa).
                        //size={30} define o tamanho do ícone (30px).
                        //className="text-warning" aplica a cor amarela (do Bootstrap).

                        //<FaRegStar /> é o ícone de estrela vazia (contorno)
                        //size={30} define o tamanho.
                        //className="text-white" aplica a cor branca.
                    >
                        {isFavorite
                            ? <FaStar size={30} className="text-warning" />
                            : <FaRegStar size={30} className="text-white" />
                        }
                    </Button>
                </Card.Header>

                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {/* ✅ EXIBE O ALERTA DE SUCESSO AQUI */}
                    {success && <Alert variant="success">Publicação criada com sucesso! Redirecionando...</Alert>}

                    <Form onSubmit={handleSubmit}>
                        {/* Título */}
                        <Form.Group className="mb-3" controlId="formTitulo">
                            <Form.Label>Título (máx. 20 caracteres)</Form.Label>
                            <Form.Control
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                maxLength={20}
                                required
                                disabled={loading || success} // Desabilita se estiver em sucesso
                            />
                        </Form.Group>

                        {/* Descrição / Corpo */}
                        <Form.Group className="mb-3" controlId="formDescricao">
                            <Form.Label>Descrição (min. 10, máx. 250 caracteres)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={corpo}
                                onChange={(e) => setCorpo(e.target.value)}
                                minLength={10}
                                maxLength={250}
                                required
                                disabled={loading || success}
                            />
                        </Form.Group>

                        {/* Categoria */}
                        <Form.Group className="mb-3" controlId="formCategoria">
                            <Form.Label>Categoria</Form.Label>
                            <Form.Select
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                                required
                                disabled={loading || success}
                            >
                                <option value="">Selecione uma categoria</option>
                                {CATEGORIAS.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* Data */}
                        <Row className="mb-4 align-items-center">
                            <Col xs={4}>
                                <Form.Label className="mb-0">Dados</Form.Label>
                            </Col>
                            <Col xs={8} className="text-end">
                                <Form.Control
                                    type="text"
                                    value={dataAtual}
                                    disabled
                                    className="d-inline"
                                />
                            </Col>
                        </Row>

                        {/* Botões de Ação */}
                        <div className="d-flex justify-content-between align-items-center">

                            {/* Botão Descartar */}
                            <Button
                                variant="outline-danger"
                                onClick={handleDescartar}
                                disabled={loading || success}
                            >
                                <FaTimes className="me-2" /> Descartar
                            </Button>

                            {/* Botão Publicar */}
                            <Button
                                variant="success"
                                type="submit"
                                disabled={loading || success}
                            >
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Publicando...
                                    </>
                                ) : 'Publicar'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default CriarPublicacaoPage;