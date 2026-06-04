import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../utils/api';
import { C, styles, normalizeDashboard, normalizeList } from './adminHelpers';
import AdminHeader from './AdminHeader';
import AdminMetrics from './AdminMetrics';
import PublicationsTable from './PublicationsTable';
import UsersTable from './UsersTable';

export default function AdminPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [dashboard,    setDashboard]    = useState({ totalPublications: 0, totalUsers: 0, pendingCount: 0 });
    const [publications, setPublications] = useState([]);
    const [users,        setUsers]        = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState(null);
    const [activeTab,    setActiveTab]    = useState('publications');

    const handleUnauthorized = () => { logout(); navigate('/login'); };

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [dRes, pRes, uRes] = await Promise.all([
                apiFetch('/admin/dashboard'),
                apiFetch('/admin/publications'),
                apiFetch('/admin/users'),
            ]);
            if ([dRes, pRes, uRes].some(r => r.status === 401)) { handleUnauthorized(); return; }
            setDashboard(normalizeDashboard(dRes));
            setPublications(normalizeList(pRes));
            setUsers(normalizeList(uRes));
        } catch {
            setError('Erro ao carregar dados do painel administrativo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Excluir esta publicação? Esta ação não pode ser desfeita.')) return;
        setLoading(true);
        const res = await apiFetch(`/publications/${id}`, { method: 'DELETE' });
        if (res.status === 401) { handleUnauthorized(); return; }
        if (res.error) { setError(res.error); setLoading(false); return; }
        await loadData();
    };

    const handleEdit = async (pub) => {
        const title    = window.prompt('Título',    pub.title       ?? ''); if (title    === null) return;
        const desc     = window.prompt('Descrição', pub.description ?? ''); if (desc     === null) return;
        const category = window.prompt('Categoria', pub.category    ?? ''); if (category === null) return;
        const body = {};
        if (title    !== (pub.title       ?? '')) body.title       = title;
        if (desc     !== (pub.description ?? '')) body.description = desc;
        if (category !== (pub.category    ?? '')) body.category    = category;
        if (!Object.keys(body).length) return;
        setLoading(true);
        const res = await apiFetch(`/publications/${pub.id}`, { method: 'PUT', body: JSON.stringify(body) });
        if (res.status === 401) { handleUnauthorized(); return; }
        if (res.error) { setError(res.error); setLoading(false); return; }
        await loadData();
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: C.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: C.muted, fontSize: 14 }}>Carregando…</p>
        </div>
    );

    const pending = dashboard.pendingCount ?? publications.filter(p => !p.status || p.status === 'pending').length;

    return (
        <div style={{ minHeight: '100vh', background: C.pageBg, padding: '1.5rem' }}>
            <div style={{ maxWidth: 940, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                <AdminHeader
                    userLogin={user?.login}
                    onLogout={() => { logout(); navigate('/iniciopage'); }}
                />

                {error && (
                    <div style={{ background: C.redLight, border: `1px solid ${C.redBorder}`, borderRadius: 8, padding: '.75rem 1rem', fontSize: 13, color: C.red }}>
                        {error}
                    </div>
                )}

                <AdminMetrics
                    publications={dashboard.totalPublications || publications.length}
                    users={dashboard.totalUsers || users.length}
                    pending={pending}
                />

                {/* Card de gerenciamento + tabs */}
                <div style={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '.75rem' }}>
                        <div>
                            <p style={{ fontWeight: 600, fontSize: 15, margin: 0, color: C.text }}>Gerenciamento</p>
                            <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>Publicações e usuários do sistema</p>
                        </div>
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                            {['publications', 'users'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        background: activeTab === tab ? C.greenLight : C.white,
                                        color:      activeTab === tab ? C.greenText  : C.muted,
                                        border:     `1px solid ${activeTab === tab ? C.greenBorder : C.border}`,
                                        borderRadius: 8, padding: '6px 16px', fontSize: 13,
                                        fontWeight: activeTab === tab ? 500 : 400, cursor: 'pointer',
                                    }}
                                >
                                    {tab === 'publications' ? 'Publicações' : 'Usuários'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ height: 1, background: C.greenBorder, opacity: .4, marginBottom: '1rem' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.875rem' }}>
                        <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                            {activeTab === 'publications' ? 'Listagem de publicações' : 'Listagem de usuários'}
                        </p>
                        <span style={styles.badge(C.greenLight, C.greenText, C.greenBorder)}>
                            {activeTab === 'publications' ? publications.length : users.length} registro{(activeTab === 'publications' ? publications.length : users.length) !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {activeTab === 'publications'
                        ? <PublicationsTable publications={publications} onEdit={handleEdit} onDelete={handleDelete} />
                        : <UsersTable users={users} />
                    }
                </div>

            </div>
        </div>
    );
}