import { FaShieldAlt, FaSignOutAlt } from 'react-icons/fa';
import { C, styles } from './adminHelpers';

export default function AdminHeader({ userLogin, onLogout }) {
    const { badge } = styles;

    return (
        <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.greenLight, border: `1px solid ${C.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FaShieldAlt size={18} color={C.green} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', gap: '.375rem', marginBottom: '.375rem' }}>
                            <span style={badge(C.greenLight, C.greenText, C.greenBorder)}>Admin</span>
                            <span style={badge('#f1f5f9', '#475569', '#cbd5e1')}>Acesso restrito</span>
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: C.text }}>Painel de administração</p>
                        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                            Bem-vindo, <strong style={{ color: C.green }}>{userLogin ?? 'administrador'}</strong>
                        </p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    style={{ background: C.green, border: 'none', borderRadius: 8, padding: '7px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, color: C.white }}
                >
                    <FaSignOutAlt size={13} /> Logout
                </button>
            </div>
        </div>
    );
}