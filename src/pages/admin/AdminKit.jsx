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
    <div
      className="flex-1 min-w-0 min-h-0 w-full overflow-auto p-[22px] box-border font-ui"
      style={{ background: ADMIN.bg }}
    >
      {children}
    </div>
  );
}

/* A titled dark panel (the boxed sections in Sonoran) */
export function AdminPanel({ title, subtitle, right, children, center, style = {} }) {
  return (
    <div
      className="rounded-lg mb-4 overflow-hidden"
      style={{ background: ADMIN.panel, border: `1px solid ${ADMIN.border}`, ...style }}
    >
      {(title || right) && (
        <div
          className={`flex items-center gap-3 px-[18px] py-[14px] flex-wrap relative ${center ? 'justify-center' : 'justify-between'}`}
          style={{ borderBottom: `1px solid ${ADMIN.border}`, background: ADMIN.panel2 }}
        >
          <div style={{ textAlign: center ? 'center' : 'left' }}>
            {title && <div className="text-[17px] font-bold tracking-[0.2px]" style={{ color: ADMIN.text }}>{title}</div>}
            {subtitle && <div className="text-[12px] mt-0.5" style={{ color: ADMIN.textDim }}>{subtitle}</div>}
          </div>
          {right && (
            <div className={`flex gap-2 items-center ${center ? 'absolute right-[18px]' : ''}`}>{right}</div>
          )}
        </div>
      )}
      <div className="p-[18px]">{children}</div>
    </div>
  );
}

/* Page-level header (e.g. "Community Customization") */
export function AdminPageTitle({ children, right }) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-lg px-5 py-[14px] mb-4"
      style={{ background: ADMIN.panel, border: `1px solid ${ADMIN.border}` }}
    >
      <div className="text-[18px] font-semibold" style={{ color: ADMIN.text }}>{children}</div>
      {right && <div className="flex gap-2">{right}</div>}
    </div>
  );
}

/* Customization hub card (icon + title) */
export function SonCard({ icon: Icon, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="son-card text-left rounded-lg p-[20px_22px] cursor-pointer flex flex-col gap-7 min-h-[120px] transition-all duration-150 hover:-translate-y-0.5"
      style={{
        background: ADMIN.panel,
        border: `1px solid ${ADMIN.border}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = ADMIN.panel2; e.currentTarget.style.borderColor = ADMIN.red; }}
      onMouseLeave={e => { e.currentTarget.style.background = ADMIN.panel; e.currentTarget.style.borderColor = ADMIN.border; }}
    >
      {Icon && <Icon size={26} color={ADMIN.red} />}
      <div>
        <div className="text-[14px] font-bold" style={{ color: ADMIN.text }}>{title}</div>
        {desc && <div className="text-[11px] mt-1 leading-[1.4]" style={{ color: ADMIN.textDim }}>{desc}</div>}
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
      className={`inline-flex items-center justify-center gap-1.5 font-semibold rounded-md cursor-pointer font-ui whitespace-nowrap transition-all duration-150
        ${size === 'sm' ? 'px-[11px] py-[5px] text-[12px]' : 'px-4 py-2 text-[13px]'}
        ${disabled ? 'opacity-50 cursor-default' : 'hover:brightness-[1.15] hover:-translate-y-px active:translate-y-0'}`}
      style={{ ...variants[variant], ...style }}
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
    <div className="overflow-x-auto rounded-lg" style={{ border: `1px solid ${ADMIN.border}` }}>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr style={{ background: ADMIN.panel2 }}>
            {columns.map((c, i) => (
              <th key={i} className="text-[11px] font-bold tracking-[0.5px] uppercase py-[11px] px-[14px] whitespace-nowrap"
                style={{
                  textAlign: c.align || 'left', color: ADMIN.textDim,
                  borderBottom: `1px solid ${ADMIN.border}`, width: c.width,
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
    <tr
      className="transition-all duration-[140ms] hover:translate-x-0.5"
      style={{ background: i % 2 ? ADMIN.rowAlt : ADMIN.row }}
      onMouseEnter={e => { e.currentTarget.style.background = ADMIN.panel2; }}
      onMouseLeave={e => { e.currentTarget.style.background = i % 2 ? ADMIN.rowAlt : ADMIN.row; }}
    >
      {children}
    </tr>
  );
}

export function SonCell({ children, align, mono, color, bold, width }) {
  return (
    <td className="py-[10px] px-[14px] whitespace-nowrap"
      style={{
        textAlign: align || 'left', color: color || ADMIN.text,
        borderBottom: `1px solid ${ADMIN.border}`,
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-ui)',
        fontWeight: bold ? 700 : 400, width,
      }}>{children}</td>
  );
}

/* Small round icon action button (reorder / delete in lists) */
export function SonIconBtn({ icon: Icon, onClick, color = ADMIN.textDim, title, danger }) {
  return (
    <button onClick={onClick} title={title}
      className="w-7 h-7 rounded-md inline-flex items-center justify-center cursor-pointer transition-[filter] duration-[120ms] hover:brightness-[1.3]"
      style={{
        background: danger ? 'rgba(227,52,47,0.12)' : ADMIN.panel2,
        border: `1px solid ${danger ? 'rgba(227,52,47,0.4)' : ADMIN.border}`,
        color: danger ? ADMIN.red : color,
      }}>
      <Icon size={15} />
    </button>
  );
}

export function SonBadge({ children, color = ADMIN.blue }) {
  return (
    <span className="inline-flex items-center px-[9px] py-[2px] text-[11px] font-bold rounded-full tracking-[0.3px] whitespace-nowrap"
      style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
    >{children}</span>
  );
}

export function EmptyState({ children }) {
  return (
    <div className="text-center py-[50px] text-[13px]" style={{ color: ADMIN.textMute }}>{children}</div>
  );
}

/* "Coming soon" panel for sections not yet wired to real services */
export function ComingSoon({ icon: Icon, title, note }) {
  return (
    <AdminPanel center title={title}>
      <div className="text-center py-[36px] px-5" style={{ color: ADMIN.textDim }}>
        {Icon && <Icon size={44} color={ADMIN.textMute} style={{ marginBottom: 14 }} />}
        <div className="text-[14px] mb-1.5" style={{ color: ADMIN.text }}>{title}</div>
        <div className="text-[12px] max-w-[460px] mx-auto leading-[1.6]" style={{ color: ADMIN.textMute }}>
          {note || 'This integration panel is configured here. Live service connections are managed by your server administrator.'}
        </div>
      </div>
    </AdminPanel>
  );
}
