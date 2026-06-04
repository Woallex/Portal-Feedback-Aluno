import { C, styles, fmtDate } from './adminHelpers';

export default function UsersTable({ users }) {
    const { badge, th, td } = styles;

    if (users.length === 0) {
        return <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '2rem 0' }}>Nenhum usuário encontrado.</p>;
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        {['ID', 'Login / e-mail', 'Cadastro', 'Status'].map(h => (
                            <th key={h} style={th}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr
                            key={u.id ?? u.email ?? u.login}
                            onMouseEnter={e => e.currentTarget.style.background = C.grayLight}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <td style={{ ...td, fontSize: 11, fontFamily: 'monospace', color: C.muted }}>{u.id ?? '—'}</td>
                            <td style={td}>{u.login ?? u.email ?? 'Sem login'}</td>
                            <td style={{ ...td, color: '#9ca3af' }}>{fmtDate(u.createdAt ?? u.created_at ?? u.data)}</td>
                            <td style={td}>
                                <span style={badge(C.greenLight, C.greenText, C.greenBorder)}>Ativo</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}