/* Shared building blocks for the citizen-facing (Civilian / Business) portals. */

const ACCENT_HEX = {
  sky:    '#3a88e8',
  cyan:   '#44aacc',
  violet: '#9090cc',
  green:  '#2fd968',
  amber:  '#f5a93b',
  red:    '#ff5454',
};
const ACCENT_TEXT = {
  sky:    'text-sky-400',
  cyan:   'text-cyan-400',
  violet: 'text-violet-400',
  green:  'text-green-400',
  amber:  'text-amber-400',
  red:    'text-red-400',
};
const ACCENT_BG = {
  sky:    'bg-sky-500/10',
  cyan:   'bg-cyan-400/10',
  violet: 'bg-violet-400/10',
  green:  'bg-green-400/10',
  amber:  'bg-amber-400/10',
  red:    'bg-red-400/10',
};
const ACCENT_BORDER = {
  sky:    'border-sky-500/30',
  cyan:   'border-cyan-400/30',
  violet: 'border-violet-400/30',
  green:  'border-green-400/30',
  amber:  'border-amber-400/30',
  red:    'border-red-400/30',
};

function resolveHex(accent) {
  return ACCENT_HEX[accent] || accent || '#3a88e8';
}

export function PortalPage({ children }) {
  return (
    <div className="flex-1 w-full min-w-0 h-full overflow-auto box-border px-10 py-7 font-ui"
      style={{ background: 'radial-gradient(ellipse at 20% -10%, rgba(40,90,170,0.10) 0%, transparent 55%), var(--n-bg-app)' }}
    >
      {children}
    </div>
  );
}

export function PortalHeader({ icon: Icon, title, subtitle, accent = 'sky', action }) {
  const hex = resolveHex(accent);
  return (
    <div className="flex items-center gap-4 mb-6 pb-[18px] border-b border-white/[0.08]">
      {Icon && (
        <div
          className={`w-[52px] h-[52px] rounded-xl shrink-0 flex items-center justify-center ${ACCENT_BG[accent] || ''} ${ACCENT_BORDER[accent] ? `border ${ACCENT_BORDER[accent]}` : ''}`}
          style={!ACCENT_BG[accent] ? { background: `${hex}1f`, border: `1px solid ${hex}55` } : undefined}
        >
          <Icon size={28} color={hex} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[22px] font-extrabold text-white tracking-[-0.3px] leading-tight">{title}</div>
        {subtitle && <div className="text-[13px] text-slate-300/55 mt-0.5">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, accent = 'sky', icon: Icon, hint }) {
  const hex = resolveHex(accent);
  return (
    <div className="stat-card-enter animate-slide-up bg-white/[0.035] border border-white/[0.08] rounded-xl px-5 py-[18px] flex-1 min-w-[150px] flex flex-col gap-1.5 relative overflow-hidden transition-[border-color,transform]">
      <div className="absolute top-[-10px] right-[-10px] opacity-10">
        {Icon && <Icon size={68} color={hex} />}
      </div>
      <div className="text-[11px] font-bold tracking-[0.8px] uppercase text-slate-300/60">{label}</div>
      <div className="text-[30px] font-extrabold leading-none" style={{ color: hex }}>{value}</div>
      {hint && <div className="text-[11px] text-slate-300/50">{hint}</div>}
    </div>
  );
}

export function PortalCard({ children, accent, style = {}, onClick, hover, className = '' }) {
  const hex = accent ? resolveHex(accent) : null;
  return (
    <div
      onClick={onClick}
      className={`bg-white/[0.035] rounded-xl p-5 ${hover ? 'portal-card-hover cursor-pointer' : ''} ${className}`}
      style={{
        border: `1px solid ${hex ? hex + '44' : 'rgba(255,255,255,0.08)'}`,
        ...(hex ? { borderLeft: `3px solid ${hex}` } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, accent = 'sky' }) {
  const hex = resolveHex(accent);
  return (
    <div
      className="text-[13px] font-bold tracking-[0.6px] uppercase mb-3.5 flex items-center gap-2"
      style={{ color: hex }}
    >
      {children}
    </div>
  );
}

export function Field({ label, value, mono }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold tracking-[0.6px] uppercase text-slate-300/50">{label}</span>
      <span className={`text-[14px] text-slate-200 ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
    </div>
  );
}

export const PORTAL_INPUT = 'w-full bg-black/25 border border-white/[0.12] rounded px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-700 transition-colors';

export const PORTAL_LABEL = 'block text-[11px] font-bold tracking-[0.5px] uppercase text-slate-400 mb-1.5';
