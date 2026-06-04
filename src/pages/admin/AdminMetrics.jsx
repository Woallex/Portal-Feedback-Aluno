import { C } from './adminHelpers';

const metricStyle = {
    background: C.grayLight,
    borderRadius: 10,
    padding: '1rem 1.25rem',
    border: `1px solid ${C.border}`,
};

const METRICS = [
    { key: 'publications', label: 'Publicações',          color: C.green   },
    { key: 'users',        label: 'Usuários cadastrados', color: '#1d4ed8'  },
    { key: 'pending',      label: 'Sem status',           color: C.red     },
];

export default function AdminMetrics({ publications, users, pending }) {
    const values = { publications, users, pending };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.875rem' }}>
            {METRICS.map(({ key, label, color }) => (
                <div key={key} style={metricStyle}>
                    <p style={{ fontSize: 12, color: C.muted, marginBottom: '.25rem' }}>{label}</p>
                    <p style={{ fontSize: 26, fontWeight: 600, color, margin: 0 }}>{values[key]}</p>
                </div>
            ))}
        </div>
    );
}