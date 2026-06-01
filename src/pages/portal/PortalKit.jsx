/* Shared building blocks for the citizen-facing (Civilian / Business) portals.
   Spacious, card-based, vibrant — matches the login-page aesthetic. */

export function PortalPage({ children }) {
  return (
    <div style={{
      height: '100%', overflow: 'auto', boxSizing: 'border-box',
      padding: '28px 32px', fontFamily: 'var(--font-ui)',
      background: 'radial-gradient(ellipse at 20% -10%, rgba(40,90,170,0.10) 0%, transparent 55%), var(--n-bg-app)',
    }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>{children}</div>
    </div>
  );
}

export function PortalHeader({ icon: Icon, title, subtitle, accent = '#3a88e8', action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
      paddingBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      {Icon && (
        <div style={{
          width: 52, height: 52, borderRadius: 12, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${accent}1f`, border: `1px solid ${accent}55`,
        }}>
          <Icon size={28} color={accent} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.1 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: 'rgba(180,200,230,0.55)', marginTop: 3 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, accent = '#3a88e8', icon: Icon, hint }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12, padding: '18px 20px', flex: 1, minWidth: 150,
      display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.10 }}>
        {Icon && <Icon size={68} color={accent} />}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(170,195,225,0.6)' }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: accent, lineHeight: 1 }}>{value}</div>
      {hint && <div style={{ fontSize: 11, color: 'rgba(150,175,205,0.5)' }}>{hint}</div>}
    </div>
  );
}

export function PortalCard({ children, accent, style = {}, onClick, hover }) {
  return (
    <div
      onClick={onClick}
      className={hover ? 'portal-card-hover' : ''}
      style={{
        background: 'rgba(255,255,255,0.035)',
        border: `1px solid ${accent ? accent + '44' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 12, padding: 20,
        ...(accent ? { borderLeft: `3px solid ${accent}` } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, accent = '#3a88e8' }) {
  return (
    <div style={{
      fontSize: 13, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase',
      color: accent, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {children}
    </div>
  );
}

export function Field({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'rgba(160,185,215,0.5)' }}>{label}</span>
      <span style={{ fontSize: 14, color: '#dce6f0', fontFamily: mono ? 'var(--font-mono)' : 'var(--font-ui)' }}>{value || '—'}</span>
    </div>
  );
}

export const PORTAL_INPUT = {
  width: '100%', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 6, color: '#e6eef6', padding: '10px 12px', fontSize: 14,
  fontFamily: 'var(--font-ui)', boxSizing: 'border-box', outline: 'none',
};

export const PORTAL_LABEL = {
  display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.5px',
  textTransform: 'uppercase', color: 'rgba(160,185,215,0.6)', marginBottom: 6,
};
