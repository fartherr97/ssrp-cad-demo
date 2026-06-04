/* Shared building blocks for the citizen-facing (Civilian / Business) portals. */

const BRAND = '#3d82f0';

const ACCENT_HEX = {
  sky:    BRAND,
  brand:  BRAND,
  blue:   BRAND,
  cyan:   '#44aacc',
  violet: '#9090cc',
  green:  '#2fd968',
  amber:  '#f5a93b',
  red:    '#ff5454',
};
const ACCENT_BG = {
  sky:    'bg-brand/15',
  brand:  'bg-brand/15',
  blue:   'bg-brand/15',
  cyan:   'bg-cyan-400/10',
  violet: 'bg-violet-400/10',
  green:  'bg-green-400/10',
  amber:  'bg-amber-400/10',
  red:    'bg-red-400/10',
};
const ACCENT_BORDER = {
  sky:    'border-brand/30',
  brand:  'border-brand/30',
  blue:   'border-brand/30',
  cyan:   'border-cyan-400/30',
  violet: 'border-violet-400/30',
  green:  'border-green-400/30',
  amber:  'border-amber-400/30',
  red:    'border-red-400/30',
};

function resolveHex(accent) {
  return ACCENT_HEX[accent] || accent || BRAND;
}

export function PortalPage({ children }) {
  return (
    <div className="flex-1 w-full min-w-0 h-full overflow-auto box-border px-4 py-5 sm:px-10 sm:py-7 font-ui bg-app-bg"
      style={{ background: 'radial-gradient(ellipse at 20% -10%, rgba(61,130,240,0.12) 0%, transparent 55%), var(--n-bg-app)' }}
    >
      {children}
    </div>
  );
}

export function PortalHeader({ icon: Icon, title, subtitle, accent = 'brand', action }) {
  const hex = resolveHex(accent);
  return (
    <div className="flex items-center flex-wrap gap-x-4 gap-y-3 mb-6 pb-[18px] border-b border-border-base">
      {Icon && (
        <div
          className={`w-11 h-11 sm:w-[52px] sm:h-[52px] rounded-xl shrink-0 flex items-center justify-center backdrop-blur-sm ${ACCENT_BG[accent] || ''} ${ACCENT_BORDER[accent] ? `border ${ACCENT_BORDER[accent]}` : ''}`}
          style={!ACCENT_BG[accent] ? { background: `${hex}1f`, border: `1px solid ${hex}55` } : undefined}
        >
          <Icon size={28} color={hex} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[19px] sm:text-[22px] font-extrabold text-white tracking-[-0.3px] leading-tight">{title}</div>
        {subtitle && <div className="text-[13px] text-cad-muted mt-0.5">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, accent = 'brand', icon: Icon, hint }) {
  const hex = resolveHex(accent);
  const valStr = String(value ?? '');
  const valSize = valStr.length <= 3 ? 'text-[30px]' : valStr.length <= 6 ? 'text-[20px]' : 'text-[15px]';
  return (
    <div className="portal-card-enter bg-app-card/70 border border-border-base rounded-xl px-4 py-4 sm:px-5 sm:py-[18px] flex-1 min-w-[130px] flex flex-col gap-1.5 relative overflow-hidden backdrop-blur-sm transition-[border-color,transform]">
      <div className="absolute top-[-10px] right-[-10px] opacity-10">
        {Icon && <Icon size={68} color={hex} />}
      </div>
      <div className="text-[11px] font-bold tracking-[0.8px] uppercase text-cad-muted">{label}</div>
      <div className={`${valSize} font-extrabold leading-none`} style={{ color: hex }}>{value}</div>
      {hint && <div className="text-[11px] text-cad-dim">{hint}</div>}
    </div>
  );
}

export function PortalCard({ children, accent, style = {}, onClick, hover, className = '', noAnim = false }) {
  const hex = accent ? resolveHex(accent) : null;
  return (
    <div
      onClick={onClick}
      className={`${noAnim ? '' : 'portal-card-enter'} bg-app-panel/80 border border-border-base rounded-xl p-4 sm:p-5 backdrop-blur-sm transition-[border-color,box-shadow,transform] ${hover ? 'portal-card-hover lift cursor-pointer' : ''} ${className}`}
      style={{
        ...(hex ? { borderColor: `${hex}44`, borderLeft: `3px solid ${hex}` } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, accent }) {
  const hex = accent ? resolveHex(accent) : null;
  return (
    <div
      className="text-[12px] font-bold tracking-[0.7px] uppercase mb-3.5 flex items-center gap-2 text-cad-muted"
      style={hex ? { color: hex } : undefined}
    >
      {children}
    </div>
  );
}

export function Field({ label, value, mono }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold tracking-[0.6px] uppercase text-cad-muted">{label}</span>
      <span className={`text-[14px] text-cad-text ${mono ? 'font-mono' : ''}`}>{value || '*'}</span>
    </div>
  );
}

export const PORTAL_INPUT = 'w-full bg-app-input border border-border-base rounded-lg px-3.5 py-2.5 text-sm text-cad-text placeholder:text-slate-600 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/20 transition-all';

export const PORTAL_LABEL = 'block text-[11px] font-bold tracking-[0.5px] uppercase text-cad-muted mb-1.5';
