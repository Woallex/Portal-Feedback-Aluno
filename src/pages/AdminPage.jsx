import { useEffect, useState } from 'react';
import { Alert, Button, Container, Row, Col, Table, Spinner } from 'react-bootstrap';
import { FaUsers, FaFileAlt, FaChartBar, FaShieldAlt, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';

const normalizeDashboardData = (response) => {
    const raw = response?.data && typeof response.data === 'object' && !Array.isArray(response.data)
        ? response.data
        : response;

    return {
        totalPublications: Number(raw?.totalPublications ?? raw?.publicationsCount ?? raw?.total ?? 0),
        totalUsers: Number(raw?.totalUsers ?? raw?.usersCount ?? raw?.users ?? 0),
        pendingPublications: Number(raw?.pendingPublications ?? raw?.pendingCount ?? raw?.pending ?? 0),
    };
};

const normalizeListData = (response) => {
    const raw = response?.data ?? response;

    if (Array.isArray(raw)) {
        return raw;
    }

    if (raw && typeof raw === 'object') {
        if (Array.isArray(raw.items)) return raw.items;
        if (Array.isArray(raw.data)) return raw.data;
        if (Array.isArray(raw.publications)) return raw.publications;
        if (Array.isArray(raw.users)) return raw.users;
    }

    return [];
};

const getStatusBadgeClass = (status) => {
    if (status === 'approved') return 'bg-success';
    if (status === 'rejected') return 'bg-danger';
    return 'bg-warning text-dark';
};

const formatDate = (value) => {
    if (!value) return 'Data indisponível';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Data indisponível';

    return date.toLocaleDateString('pt-BR');
};

function AdminPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState({
        totalPublications: 0,
        totalUsers: 0,
        pendingPublications: 0,
    });
    const [publications, setPublications] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('publications');

    useEffect(() => {
        loadData();
    }, []);

    const handleUnauthorized = () => {
        logout();
        localStorage.removeItem('userType');
        navigate('/login');
        setError('Sessão expirada ou não autorizada. Faça login novamente.');
    };

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            const [dashboardResponse, publicationsResponse, usersResponse] = await Promise.all([
                apiFetch('/admin/dashboard'),
                apiFetch('/admin/publications'),
                apiFetch('/admin/users'),
            ]);

            if (dashboardResponse.status === 401 || publicationsResponse.status === 401 || usersResponse.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!dashboardResponse.error) {
                setDashboard(normalizeDashboardData(dashboardResponse));
            } else {
                setError('Erro ao carregar o dashboard administrativo');
            }

            setPublications(normalizeListData(publicationsResponse));
            setUsers(normalizeListData(usersResponse));
        } catch (err) {
            setError('Erro ao carregar dados do painel administrativo');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePublication = async (publicationId) => {
        if (!window.confirm('Deseja excluir esta publicação? Esta ação não pode ser desfeita.')) {
            return;
        }

        setLoading(true);
        setError(null);

        const response = await apiFetch(`/publications/${publicationId}`, {
            method: 'DELETE',
        });

        if (response.status === 401) {
            setLoading(false);
            handleUnauthorized();
            return;
        }

        if (response.error) {
            setError(response.status === 404 ? 'Publicação não encontrada.' : response.error);
            setLoading(false);
            return;
        }

        await loadData();
    };

    const handleEditPublication = async (publication) => {
        const currentTitle = publication.title || publication.titulo || '';
        const currentDescription = publication.description || publication.descricao || '';
        const currentCategory = publication.category || publication.categoria || '';

        const updatedTitle = window.prompt('Novo título', currentTitle);
        if (updatedTitle === null) return;

        const updatedDescription = window.prompt('Nova descrição', currentDescription);
        if (updatedDescription === null) return;

        const updatedCategory = window.prompt('Nova categoria', currentCategory);
        if (updatedCategory === null) return;

        const body = {};
        if (updatedTitle !== currentTitle) body.title = updatedTitle;
        if (updatedDescription !== currentDescription) body.description = updatedDescription;
        if (updatedCategory !== currentCategory) body.category = updatedCategory;

        if (Object.keys(body).length === 0) {
            return;
        }

        setLoading(true);
        setError(null);

        const response = await apiFetch(`/publications/${publication.id}`, {
            method: 'PUT',
            body: JSON.stringify(body),
        });

        if (response.status === 401) {
            setLoading(false);
            handleUnauthorized();
            return;
        }

        if (response.error) {
            setError(response.status === 404 ? 'Publicação não encontrada.' : response.error);
            setLoading(false);
            return;
        }

        await loadData();
    };

    const handleLogout = () => {
        logout();
        localStorage.removeItem('userType');
        navigate('/iniciopage');
    };

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center vh-100"
                style={{
                    background: 'radial-gradient(circle at top, #030712 0%, #01040a 100%)',
                    color: '#f8fafc',
                }}
            >
                <div className="text-center p-4 rounded-4" style={{
                    background: 'rgba(9, 11, 19, 0.78)',
                    border: '1px solid rgba(71, 85, 105, 0.55)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
                    backdropFilter: 'blur(6px)',
                }}>
                    <Spinner animation="border" role="status" variant="light">
                        <span className="visually-hidden">Carregando...</span>
                    </Spinner>
                    <p className="mt-3 mb-0" style={{ color: '#d0e2ff' }}>Carregando painel administrativo...</p>
                </div>
            </div>
        );
    }

    const totalPublications = dashboard.totalPublications || publications.length;
    const totalUsers = dashboard.totalUsers || users.length;
    const pendingPublications = dashboard.pendingPublications ?? publications.filter(p => !p.status || p.status === 'pending').length;

    return (
        <div
            className="min-vh-100"
            style={{
                paddingTop: '20px',
                paddingBottom: '40px',
                background: 'radial-gradient(circle at top, #020617 0%, #01030b 42%, #000000 100%)',
                color: '#f8fafc',
            }}
        >
            <Container>
                {/* Header Admin */}
                <div
                    className="d-flex justify-content-between align-items-center mb-4 p-4 rounded-4 shadow-sm"
                    style={{
                        background: 'rgba(6, 10, 20, 0.88)',
                        border: '1px solid rgba(59, 130, 246, 0.22)',
                        boxShadow: '0 18px 50px rgba(0, 0, 0, 0.35)',
                        backdropFilter: 'blur(5px)',
                    }}
                >
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <span className="badge rounded-pill" style={{ background: 'rgba(248, 113, 113, 0.2)', color: '#fecaca' }}>Admin</span>
                            <span className="badge rounded-pill" style={{ background: 'rgba(45, 212, 191, 0.18)', color: '#99f6e4' }}>Acesso restrito</span>
                        </div>
                        <h2 className="mb-1 fw-bold" style={{ color: '#f8fafc' }}>
                            <FaShieldAlt className="me-2" style={{ color: '#fb7185' }} />
                            Painel de Administração
                        </h2>
                        <p className="mb-0" style={{ color: '#93c5fd' }}>Bem-vindo, {user?.login || 'administrador'}</p>
                    </div>
                    <Button
                        onClick={handleLogout}
                        className="rounded-pill px-4"
                        style={{
                            borderColor: '#fb7185',
                            color: '#fff5f5',
                            background: 'linear-gradient(180deg, #be123c, #9f1239)',
                            boxShadow: '0 10px 30px rgba(190, 18, 60, 0.28)',
                        }}
                    >
                        Logout
                    </Button>
                </div>

                {error && (
                    <Alert
                        variant="dark"
                        className="rounded-3 mb-4"
                        style={{
                            background: 'rgba(24, 29, 43, 0.95)',
                            borderColor: 'rgba(239, 68, 68, 0.35)',
                            color: '#fecaca',
                        }}
                    >
                        {error}
                    </Alert>
                )}

                <div className="mb-4">
                    <h4 className="fw-semibold mb-1" style={{ color: '#f8fafc' }}>Visão geral do sistema</h4>
                    <p className="mb-0 small" style={{ color: '#94a3b8' }}>Resumo dos dados administrativos carregados do backend.</p>
                </div>

                {/* Cards de Estatísticas */}
                <Row className="mb-5 g-4">
                    <Col md={4}>
                        <div
                            className="p-4 rounded-4 h-100"
                            style={{
                                background: 'linear-gradient(180deg, rgba(6, 10, 20, 0.95), rgba(8, 14, 28, 0.78))',
                                border: '1px solid rgba(45, 212, 191, 0.28)',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.28)',
                            }}
                        >
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px', backgroundColor: 'rgba(45, 212, 191, 0.16)' }}>
                                    <FaFileAlt style={{ fontSize: '22px', color: '#5eead4' }} />
                                </div>
                                <span className="badge rounded-pill" style={{ background: 'rgba(45, 212, 191, 0.18)', color: '#99f6e4' }}>Total</span>
                            </div>
                            <h6 style={{ color: '#cbd5e1', marginBottom: '8px' }}>Publicações</h6>
                            <h2 className="fw-bold mb-0" style={{ color: '#67e8f9' }}>{totalPublications}</h2>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div
                            className="p-4 rounded-4 h-100"
                            style={{
                                background: 'linear-gradient(180deg, rgba(10, 10, 20, 0.95), rgba(12, 16, 28, 0.78))',
                                border: '1px solid rgba(96, 165, 250, 0.24)',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.28)',
                            }}
                        >
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px', backgroundColor: 'rgba(96, 165, 250, 0.16)' }}>
                                    <FaUsers style={{ fontSize: '22px', color: '#93c5fd' }} />
                                </div>
                                <span className="badge rounded-pill" style={{ background: 'rgba(96, 165, 250, 0.18)', color: '#d0e2ff' }}>Usuários</span>
                            </div>
                            <h6 style={{ color: '#cbd5e1', marginBottom: '8px' }}>Usuários cadastrados</h6>
                            <h2 className="fw-bold mb-0" style={{ color: '#60a5fa' }}>{totalUsers}</h2>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div
                            className="p-4 rounded-4 h-100"
                            style={{
                                background: 'linear-gradient(180deg, rgba(16, 10, 18, 0.96), rgba(20, 14, 24, 0.78))',
                                border: '1px solid rgba(251, 113, 133, 0.26)',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.28)',
                            }}
                        >
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px', backgroundColor: 'rgba(251, 113, 133, 0.16)' }}>
                                    <FaChartBar style={{ fontSize: '22px', color: '#fda4af' }} />
                                </div>
                                <span className="badge rounded-pill" style={{ background: 'rgba(251, 113, 133, 0.18)', color: '#fecdd3' }}>Pendentes</span>
                            </div>
                            <h6 style={{ color: '#cbd5e1', marginBottom: '8px' }}>Publicações sem status</h6>
                            <h2 className="fw-bold mb-0" style={{ color: '#fda4af' }}>{pendingPublications}</h2>
                        </div>
                    </Col>
                </Row>

                {/* Tabs */}
                <div className="mb-4 d-flex align-items-center gap-2">
                    <Button
                        onClick={() => setActiveTab('publications')}
                        className="rounded-pill px-4"
                        style={
                            activeTab === 'publications'
                                ? {
                                    background: 'linear-gradient(180deg, #0f766e, #0891b2)',
                                    borderColor: '#06b6d4',
                                    color: '#fff',
                                    boxShadow: '0 10px 28px rgba(8, 145, 178, 0.28)',
                                }
                                : {
                                    background: 'rgba(8, 14, 24, 0.78)',
                                    borderColor: 'rgba(59, 130, 246, 0.32)',
                                    color: '#d0e2ff',
                                }
                        }
                    >
                        <FaFileAlt className="me-2" />
                        Publicações
                    </Button>
                    <Button
                        onClick={() => setActiveTab('users')}
                        className="rounded-pill px-4"
                        style={
                            activeTab === 'users'
                                ? {
                                    background: 'linear-gradient(180deg, #1d4ed8, #2563eb)',
                                    borderColor: '#60a5fa',
                                    color: '#fff',
                                    boxShadow: '0 10px 28px rgba(37, 99, 235, 0.26)',
                                }
                                : {
                                    background: 'rgba(8, 14, 24, 0.78)',
                                    borderColor: 'rgba(59, 130, 246, 0.32)',
                                    color: '#d0e2ff',
                                }
                        }
                    >
                        <FaUsers className="me-2" />
                        Usuários
                    </Button>
                </div>

                {/* Seção de Publicações */}
                {activeTab === 'publications' && (
                    <div
                        className="p-4 rounded-4"
                        style={{
                            background: 'rgba(7, 11, 22, 0.92)',
                            border: '1px solid rgba(14, 116, 144, 0.28)',
                            boxShadow: '0 18px 45px rgba(0, 0, 0, 0.35)',
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h4 className="mb-1 fw-semibold" style={{ color: '#f8fafc' }}>Gerenciar Publicações</h4>
                                <p className="mb-0 small" style={{ color: '#94a3b8' }}>Listagem das publicações disponíveis no sistema.</p>
                            </div>
                            <span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(16, 185, 129, 0.18)', color: '#a7f3d0' }}>{publications.length} registros</span>
                        </div>
                        {publications.length === 0 ? (
                            <Alert
                                variant="dark"
                                className="rounded-3"
                                style={{
                                    background: 'rgba(12, 18, 30, 0.95)',
                                    borderColor: 'rgba(45, 212, 191, 0.28)',
                                    color: '#e2e8f0',
                                }}
                            >
                                Nenhuma publicação encontrada
                            </Alert>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="align-middle mb-0" style={{ color: '#f8fafc' }}>
                                    <thead style={{ background: 'rgba(8, 15, 30, 0.96)' }}>
                                        <tr>
                                            <th style={{ color: '#e2e8f0', borderBottomColor: 'rgba(45, 212, 191, 0.18)' }}>ID</th>
                                            <th style={{ color: '#e2e8f0', borderBottomColor: 'rgba(45, 212, 191, 0.18)' }}>Título</th>
                                            <th style={{ color: '#e2e8f0', borderBottomColor: 'rgba(45, 212, 191, 0.18)' }}>Autor</th>
                                            <th style={{ color: '#e2e8f0', borderBottomColor: 'rgba(45, 212, 191, 0.18)' }}>Categoria</th>
                                            <th style={{ color: '#e2e8f0', borderBottomColor: 'rgba(45, 212, 191, 0.18)' }}>Status</th>
                                            <th style={{ color: '#e2e8f0', borderBottomColor: 'rgba(45, 212, 191, 0.18)' }}>Data</th>
                                            <th style={{ color: '#e2e8f0', borderBottomColor: 'rgba(45, 212, 191, 0.18)' }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {publications.map(pub => {
                                            const authorName = typeof pub.author === 'string'
                                                ? pub.author
                                                : pub.author?.login || pub.author?.name || 'Anônimo';

                                            const createdAt = pub.createdAt || pub.created_at || pub.data;

                                            return (
                                                <tr key={pub.id ?? `${authorName}-${pub.title}`} style={{ borderBottomColor: 'rgba(45, 212, 191, 0.08)' }}>
                                                    <td className="fw-semibold" style={{ color: '#67e8f9' }}>{pub.id ?? '—'}</td>
                                                    <td style={{ color: '#f8fafc' }}>{pub.title || pub.titulo || 'Sem título'}</td>
                                                    <td style={{ color: '#cbd5e1' }}>{authorName}</td>
                                                    <td style={{ color: '#cbd5e1' }}>{pub.category || pub.categoria || 'Sem categoria'}</td>
                                                    <td>
                                                        <span className="badge rounded-pill" style={{ background: getStatusBadgeClass(pub.status) === 'bg-success' ? 'rgba(16, 185, 129, 0.18)' : getStatusBadgeClass(pub.status) === 'bg-danger' ? 'rgba(248, 113, 113, 0.18)' : 'rgba(251, 191, 36, 0.18)', color: getStatusBadgeClass(pub.status) === 'bg-success' ? '#a7f3d0' : getStatusBadgeClass(pub.status) === 'bg-danger' ? '#fecdd3' : '#fde68a' }}>
                                                            {pub.status || 'Sem status'}
                                                        </span>
                                                    </td>
                                                    <td style={{ color: '#94a3b8' }}>{formatDate(createdAt)}</td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline-warning"
                                                                onClick={() => handleEditPublication(pub)}
                                                            >
                                                                <FaEdit className="me-1" /> Editar
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline-danger"
                                                                onClick={() => handleDeletePublication(pub.id)}
                                                            >
                                                                <FaTrashAlt className="me-1" /> Excluir
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                )}

                {/* Seção de Usuários */}
                {activeTab === 'users' && (
                    <div
                        className="p-4 rounded-4"
                        style={{
                            background: 'rgba(7, 11, 22, 0.92)',
                            border: '1px solid rgba(96, 165, 250, 0.24)',
                            boxShadow: '0 18px 45px rgba(0, 0, 0, 0.35)',
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h4 className="mb-1 fw-semibold" style={{ color: '#f8fafc' }}>Gerenciar Usuários</h4>
                                <p className="mb-0 small" style={{ color: '#94a3b8' }}>Lista de usuários cadastrados no sistema.</p>
                            </div>
                            <span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(96, 165, 250, 0.18)', color: '#d0e2ff' }}>{users.length} registros</span>
                        </div>
                        {users.length === 0 ? (
                            <Alert
                                variant="dark"
                                className="rounded-3"
                                style={{
                                    background: 'rgba(12, 18, 30, 0.95)',
                                    borderColor: 'rgba(96, 165, 250, 0.24)',
                                    color: '#e2e8f0',
                                }}
                            >
                                Nenhum usuário encontrado
                            </Alert>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="align-middle mb-0" style={{ color: '#f8fafc' }}>
                                    <thead style={{ background: 'rgba(8, 15, 30, 0.96)' }}>
                                        <tr>
                                            <th style={{ color: '#e2e8f0', borderBottomColor: 'rgba(96, 165, 250, 0.18)' }}>ID</th>
                                            <th style={{ color: '#e2e8f0', borderBottomColor: 'rgba(96, 165, 250, 0.18)' }}>Login (Email)</th>
                                            <th style={{ color: '#e2e8f0', borderBottomColor: 'rgba(96, 165, 250, 0.18)' }}>Data de Cadastro</th>
                                            <th style={{ color: '#e2e8f0', borderBottomColor: 'rgba(96, 165, 250, 0.18)' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(usr => (
                                            <tr key={usr.id ?? usr.email ?? usr.login} style={{ borderBottomColor: 'rgba(96, 165, 250, 0.08)' }}>
                                                <td className="fw-semibold" style={{ color: '#60a5fa' }}>{usr.id ?? '—'}</td>
                                                <td style={{ color: '#f8fafc' }}>{usr.login || usr.email || 'Sem login'}</td>
                                                <td style={{ color: '#94a3b8' }}>{formatDate(usr.createdAt || usr.created_at || usr.data)}</td>
                                                <td>
                                                    <span className="badge rounded-pill" style={{ background: 'rgba(16, 185, 129, 0.18)', color: '#a7f3d0' }}>Ativo</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                )}
            </Container>
        </div>
    );
}

export default AdminPage;
