export const toNum = (v) => Number(v ?? 0);

export const normalizeDashboard = (res) => {
    const r = res?.data ?? res ?? {};
    return {
        totalPublications: toNum(r.totalPublications ?? r.publicationsCount ?? r.total),
        totalUsers:        toNum(r.totalUsers        ?? r.usersCount        ?? r.users),
        pendingCount:      toNum(r.pendingPublications ?? r.pendingCount    ?? r.pending),
    };
};

export const normalizeList = (res) => {
    const r = res?.data ?? res;
    if (Array.isArray(r)) return r;
    if (r && typeof r === 'object') {
        for (const key of ['items', 'data', 'publications', 'users']) {
            if (Array.isArray(r[key])) return r[key];
        }
    }
    return [];
};


export const fmtDate = (v) => {
    if (!v) return '—';
    const d = new Date(v);
    return isNaN(d) ? '—' : d.toLocaleDateString('pt-BR');
};

export const getAuthorName = (author) =>
    typeof author === 'string' ? author : author?.login ?? author?.name ?? 'Anônimo';

// ─── Design tokens ────────────────────────────────────────────────────────────

export const C = {
    green:       '#047857',
    greenLight:  '#d1fae5',
    greenBorder: '#6ee7b7',
    greenText:   '#065f46',
    red:         '#b91c1c',
    redLight:    '#fee2e2',
    redBorder:   '#fca5a5',
    amber:       '#92400e',
    amberLight:  '#fef3c7',
    amberBorder: '#fcd34d',
    gray:        '#6b7280',
    grayLight:   '#f3f4f6',
    border:      'rgba(0,0,0,.08)',
    text:        '#111827',
    muted:       '#6b7280',
    white:       '#ffffff',
    pageBg:      '#f3f4f6',
};

export const statusTokens = (status) => {
    if (status === 'approved') return { bg: C.greenLight, color: C.greenText,  border: C.greenBorder };
    if (status === 'rejected') return { bg: C.redLight,   color: C.red,        border: C.redBorder   };
    return                            { bg: C.amberLight,  color: C.amber,      border: C.amberBorder };
};

export const styles = {
    card: {
        background: '#fff',
        border: `1px solid rgba(0,0,0,.08)`,
        borderRadius: 12,
        padding: '1.25rem 1.5rem',
    },
    badge: (bg, color, border) => ({
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 11,
        fontWeight: 500,
        padding: '3px 10px',
        borderRadius: 999,
        background: bg,
        color,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
    }),
    th: {
        textAlign: 'left',
        fontSize: 12,
        fontWeight: 600,
        color: '#047857',
        padding: '0 8px .625rem 0',
        borderBottom: '2px solid #6ee7b7',
        whiteSpace: 'nowrap',
    },
    td: {
        padding: '.625rem 8px .625rem 0',
        borderBottom: '1px solid rgba(0,0,0,.08)',
        fontSize: 13,
        verticalAlign: 'middle',
        color: '#111827',
    },
};