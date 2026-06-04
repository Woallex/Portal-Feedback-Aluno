import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { C, styles, fmtDate, getAuthorName, statusTokens } from './adminHelpers';

export default function PublicationsTable({ publications, onEdit, onDelete }) {
    const { badge, th, td } = styles;

    if (publications.length === 0) {
        return <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '2rem 0' }}>Nenhuma publicação encontrada.</p>;
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        {['ID', 'Título', 'Autor', 'Categoria', 'Status', 'Data', 'Ações'].map(h => (
                            <th key={h} style={th}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {publications.map(pub => {
                        const st = statusTokens(pub.status);
                        return (
                            <tr
                                key={pub.id}
                                onMouseEnter={e => e.currentTarget.style.background = C.grayLight}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ ...td, fontSize: 11, fontFamily: 'monospace', color: C.muted, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {pub.id ?? '—'}
                                </td>
                                <td style={td}>{pub.title ?? pub.titulo ?? '—'}</td>
                                <td style={{ ...td, color: C.muted }}>{getAuthorName(pub.author)}</td>
                                <td style={{ ...td, color: C.muted }}>{pub.category ?? pub.categoria ?? '—'}</td>
                                <td style={td}>
                                    <span style={badge(st.bg, st.color, st.border)}>
                                        {pub.status ?? 'Sem status'}
                                    </span>
                                </td>
                                <td style={{ ...td, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                                    {fmtDate(pub.createdAt ?? pub.created_at ?? pub.data)}
                                </td>
                                <td style={td}>
                                    <div style={{ display: 'flex', gap: '.375rem' }}>
                                        <button
                                            onClick={() => onEdit(pub)}
                                            style={{ background: C.amberLight, border: `1px solid ${C.amberBorder}`, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, color: C.amber, fontWeight: 500 }}
                                        >
                                            <FaEdit size={11} /> Editar
                                        </button>
                                        <button
                                            onClick={() => onDelete(pub.id)}
                                            style={{ background: C.redLight, border: `1px solid ${C.redBorder}`, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, color: C.red, fontWeight: 500 }}
                                        >
                                            <FaTrashAlt size={11} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}