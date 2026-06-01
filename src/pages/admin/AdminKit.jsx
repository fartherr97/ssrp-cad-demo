/* Sonoran-style Admin customization UI kit.
   Dark panels, red accents, dense editors. Shared by every admin section. */

export const ADMIN = {
  red:      '#e3342f',
  redHi:    '#ff4b45',
  redGlow:  'rgba(227,52,47,0.4)',
  bg:       '#0e0e12',
  panel:    '#16161c',
  panel2:   '#1c1c24',
  row:      '#1a1a20',
  rowAlt:   '#15151b',
  border:   '#26262e',
  borderHi: '#33333d',
  text:     '#e8e8ec',
  textDim:  '#9a9aa6',
  textMute: '#6a6a76',
  green:    '#22c55e',
  amber:    '#f59e0b',
  blue:     '#3a88e8',
};

/* Page wrapper — full-height scroll area with dark bg */
export function AdminContent({ children }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, minHeight: 0, width: '100%', overflow: 'auto',
      background: ADMIN.bg, padding: 22, boxSizing: 'border-box',
      fontFamily: 'var(--font-ui)',
    }}>
      {children}
    </div>
  );
}

/* A titled dark panel (the boxed sections in Sonoran) */
export function AdminPanel({ title, subtitle, right, children, center, style = {} }) {
  return (
    <div style={{
      background: ADMIN.panel, border: `1px solid ${ADMIN.border}`,
      borderRadius: 8, marginBottom: 16, overflow: 'hidden', ...style,
    }}>
      {(title || right) && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: center ? 'center' : 'space-between',
          gap: 12, padding: '14px 18px', borderBottom: `1px solid ${ADMIN.border}`,
          background: ADMIN.panel2, flexWrap: 'wrap', position: 'relative',
        }}>
          <div style={{ textAlign: center ? 'center' : 'left' }}>
            {title && <div style={{ fontSize: 17, fontWeight: 700, color: ADMIN.text, letterSpacing: '0.2px' }}>{title}</div>}
            {subtitle && <div style={{ fontSize: 12, color: ADMIN.textDim, marginTop: 2 }}>{subtitle}</div>}
          </div>
          {right && <div style={{ display: 'flex', gap: 8, alignItems: 'center', ...(center ? { position: 'absolute', right: 18 } : {}) }}>{right}</div>}
        </div>
      )}
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

/* Page-level header (e.g. "Community Customization") */
export function AdminPageTitle({ children, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      background: ADMIN.panel, border: `1px solid ${ADMIN.border}`, borderRadius: 8,
      padding: '14px 20px', marginBottom: 16,
    }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: ADMIN.text }}>{children}</div>
      {right && <div style={{ display: 'flex', gap: 8 }}>{right}</div>}
    </div>
  );
}

/* Customization hub card (icon + title) */
export function SonCard({ icon: Icon, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="son-card"
      style={{
        textAlign: 'left', background: ADMIN.panel, border: `1px solid ${ADMIN.border}`,
        borderRadius: 8, padding: '20px 22px', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 28, minHeight: 120,
        transition: 'background .15s, border-color .15s, transform .15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = ADMIN.panel2; e.currentTarget.style.borderColor = ADMIN.red; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = ADMIN.panel; e.currentTarget.style.borderColor = ADMIN.border; e.currentTarget.style.transform = ''; }}
    >
      {Icon && <Icon size={26} color={ADMIN.red} />}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: ADMIN.text }}>{title}</div>
        {desc && <div style={{ fontSize: 11, color: ADMIN.textDim, marginTop: 4, lineHeight: 1.4 }}>{desc}</div>}
      </div>
    </button>
  );
}

/* Buttons */
export function SonButton({ children, onClick, variant = 'default', size, style = {}, type, disabled, title }) {
  const variants = {
    default: { background: ADMIN.panel2, color: ADMIN.text, border: `1px solid ${ADMIN.border}` },
    red:     { background: ADMIN.red, color: '#fff', border: '1px solid transparent', boxShadow: `0 2px 10px ${ADMIN.redGlow}` },
    green:   { background: '#1c8a3f', color: '#fff', border: '1px solid transparent' },
    ghost:   { background: 'transparent', color: ADMIN.textDim, border: `1px solid ${ADMIN.border}` },
  };
  return (
    <button
      type={type} onClick={onClick} disabled={disabled} title={title}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: size === 'sm' ? '5px 11px' : '8px 16px', fontSize: size === 'sm' ? 12 : 13,
        fontWeight: 600, borderRadius: 6, cursor: disabled ? 'default' : 'pointer',
        fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap', opacity: disabled ? 0.5 : 1,
        transition: 'filter .15s, transform .15s, box-shadow .15s', ...variants[variant], ...style,
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = ''; }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(0)'; }}
      onMouseUp={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(-1px)'; }}
    >
      {children}
    </button>
  );
}

export const SON_INPUT = {
  width: '100%', background: ADMIN.bg, border: `1px solid ${ADMIN.border}`,
  borderRadius: 6, color: ADMIN.text, padding: '9px 11px', fontSize: 13,
  fontFamily: 'var(--font-ui)', boxSizing: 'border-box', outline: 'none',
};

export const SON_LABEL = {
  display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
  textTransform: 'uppercase', color: ADMIN.textMute, marginBottom: 5,
};

export function SonField({ label, children }) {
  return (
    <div>
      <label style={SON_LABEL}>{label}</label>
      {children}
    </div>
  );
}

/* Search input with icon */
export function SonSearch({ value, onChange, placeholder = 'Search' }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ ...SON_INPUT, width: 260, maxWidth: '100%' }} />
  );
}

/* Table primitives */
export function SonTable({ columns, children }) {
  return (
    <div style={{ overflowX: 'auto', border: `1px solid ${ADMIN.border}`, borderRadius: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: ADMIN.panel2 }}>
            {columns.map((c, i) => (
              <th key={i} style={{
                textAlign: c.align || 'left', padding: '11px 14px', color: ADMIN.textDim,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                borderBottom: `1px solid ${ADMIN.border}`, whiteSpace: 'nowrap', width: c.width,
              }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function SonRow({ children, i = 0 }) {
  return (
    <tr style={{ background: i % 2 ? ADMIN.rowAlt : ADMIN.row, transition: 'background .14s, transform .14s' }}
      onMouseEnter={e => { e.currentTarget.style.background = ADMIN.panel2; e.currentTarget.style.transform = 'translateX(2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = i % 2 ? ADMIN.rowAlt : ADMIN.row; e.currentTarget.style.transform = ''; }}>
      {children}
    </tr>
  );
}

export function SonCell({ children, align, mono, color, bold, width }) {
  return (
    <td style={{
      padding: '10px 14px', textAlign: align || 'left', color: color || ADMIN.text,
      borderBottom: `1px solid ${ADMIN.border}`, fontFamily: mono ? 'var(--font-mono)' : 'var(--font-ui)',
      fontWeight: bold ? 700 : 400, whiteSpace: 'nowrap', width,
    }}>{children}</td>
  );
}

/* Small round icon action button (reorder / delete in lists) */
export function SonIconBtn({ icon: Icon, onClick, color = ADMIN.textDim, title, danger }) {
  return (
    <button onClick={onClick} title={title}
      style={{
        width: 28, height: 28, borderRadius: 6, display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', background: danger ? 'rgba(227,52,47,0.12)' : ADMIN.panel2,
        border: `1px solid ${danger ? 'rgba(227,52,47,0.4)' : ADMIN.border}`, cursor: 'pointer',
        color: danger ? ADMIN.red : color, transition: 'filter .12s',
      }}
      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.3)'}
      onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
      <Icon size={15} />
    </button>
  );
}

export function SonBadge({ children, color = ADMIN.blue }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 9px', fontSize: 11, fontWeight: 700,
      borderRadius: 999, background: `${color}22`, color, border: `1px solid ${color}55`,
      letterSpacing: '0.3px', whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

export function EmptyState({ children }) {
  return (
    <div style={{ textAlign: 'center', padding: 50, color: ADMIN.textMute, fontSize: 13 }}>{children}</div>
  );
}

/* "Coming soon" panel for sections not yet wired to real services */
export function ComingSoon({ icon: Icon, title, note }) {
  return (
    <AdminPanel center title={title}>
      <div style={{ textAlign: 'center', padding: '36px 20px', color: ADMIN.textDim }}>
        {Icon && <Icon size={44} color={ADMIN.textMute} style={{ marginBottom: 14 }} />}
        <div style={{ fontSize: 14, color: ADMIN.text, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 12, color: ADMIN.textMute, maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
          {note || 'This integration panel is configured here. Live service connections are managed by your server administrator.'}
        </div>
      </div>
    </AdminPanel>
  );
}
