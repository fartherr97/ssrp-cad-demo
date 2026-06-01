import { useCAD } from '../../store/cadStore';

function SSRPShield() {
  return (
    <svg width="36" height="42" viewBox="0 0 36 42" fill="none" aria-hidden="true">
      <path d="M18 1L2 8v16c0 9.5 7.2 17.5 16 19 8.8-1.5 16-9.5 16-19V8L18 1z"
        fill="#040c1c" stroke="#8a6008" strokeWidth="1.2"/>
      <path d="M18 6L5 11.5v12.5c0 7.5 5.8 13.8 13 15.2 7.2-1.4 13-7.7 13-15.2V11.5L18 6z"
        fill="rgba(13,84,146,0.22)" stroke="#0d4a80" strokeWidth="0.8"/>
      <text x="18" y="22" textAnchor="middle" fill="#1268b0" fontSize="11" fontFamily="system-ui">★</text>
      <text x="18" y="32" textAnchor="middle" fill="#a88010" fontSize="5.5" fontWeight="700"
        fontFamily="system-ui" letterSpacing="1.5">SSRP</text>
    </svg>
  );
}

const NAV = [
  {
    section: 'Operations',
    items: [
      { page: 'dashboard', label: 'Command Center', icon: 'grid' },
      { page: 'dispatch', label: 'Dispatch Console', icon: 'radio' },
      { page: 'board', label: 'Dispatch Board', icon: 'list' },
      { page: 'fire', label: 'Fire / EMS Ops', icon: 'fire' },
      { page: 'map', label: 'Live Map', icon: 'map' },
    ],
  },
  {
    section: 'Records',
    items: [
      { page: 'records', label: 'Records Bureau', icon: 'search' },
      { page: 'warrants', label: 'Warrant Control', icon: 'warrant' },
    ],
  },
  {
    section: 'Reports',
    items: [
      { page: 'reports', label: 'Reports Center', icon: 'doc' },
    ],
  },
  {
    section: 'Civilian',
    items: [
      { page: 'civilian', label: 'Civilian Registry', icon: 'person' },
    ],
  },
  {
    section: 'Communications',
    items: [
      { page: 'mdt', label: 'MDT', icon: 'terminal' },
      { page: 'units', label: 'Unit Management', icon: 'badge' },
    ],
  },
  {
    section: 'Administration',
    adminOnly: true,
    items: [
      { page: 'admin', label: 'Admin Center', icon: 'settings' },
      { page: 'penal', label: 'Penal Codes', icon: 'law' },
      { page: 'bans', label: 'Ban Management', icon: 'ban' },
    ],
  },
];

function Icon({ name }) {
  const icons = {
    grid: (
      <svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
    ),
    radio: (
      <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 3a5 5 0 100 10A5 5 0 008 3zm0 1.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7z"/><circle cx="8" cy="8" r="1.5"/></svg>
    ),
    list: (
      <svg viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="3" width="12" height="1.5" rx="0.75"/><rect x="2" y="7.25" width="12" height="1.5" rx="0.75"/><rect x="2" y="11.5" width="12" height="1.5" rx="0.75"/></svg>
    ),
    fire: (
      <svg viewBox="0 0 16 16" fill="currentColor"><path d="M9 1s-2 2-1 4c0 0-2-1-2-3-2 2-2 5-1 7a5 5 0 0010 0c0-4-3-6-6-8zm0 10.5a2 2 0 01-2-2c0-1 1-2 1-2s1 1 1 2 .5 1.5.5 1.5A1.5 1.5 0 019 11.5z"/></svg>
    ),
    map: (
      <svg viewBox="0 0 16 16" fill="currentColor"><path d="M1 3l4.5-1.5 5 1.5L15 2v11l-4.5 1.5-5-1.5L1 14V3zm4.5.5v9l5 1.5V5L5.5 3.5z"/></svg>
    ),
    search: (
      <svg viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M6.5 11a4.5 4.5 0 110-9 4.5 4.5 0 010 9zm4.2-.8l3.5 3.5-1.1 1.1-3.5-3.5a5.5 5.5 0 111.1-1.1z"/></svg>
    ),
    warrant: (
      <svg viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="1" width="12" height="14" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2"/><path d="M5 5h6M5 8h6M5 11h4"/></svg>
    ),
    doc: (
      <svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 1h5l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1zm5 0v4h4"/><path d="M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
    ),
    person: (
      <svg viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>
    ),
    terminal: (
      <svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2"/><path d="M4 6l2.5 2L4 10M8.5 10h3.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/></svg>
    ),
    badge: (
      <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1L6 3H3v3l-2 2 2 2v3h3l2 2 2-2h3V10l2-2-2-2V3h-3L8 1z" fill="none" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8" r="2"/></svg>
    ),
    settings: (
      <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"/><path fillRule="evenodd" d="M7 1h2l.5 1.5a5.5 5.5 0 011.4.8L12.5 3l1 1.7-1.2 1a5.5 5.5 0 010 1.6l1.2 1-1 1.7-1.6-.3a5.5 5.5 0 01-1.4.8L9 11H7l-.5-1.5a5.5 5.5 0 01-1.4-.8L3.5 9l-1-1.7 1.2-1a5.5 5.5 0 010-1.6l-1.2-1L3.5 3l1.6.3a5.5 5.5 0 011.4-.8L7 1z"/></svg>
    ),
    law: (
      <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1v14M2 8h12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/><path d="M4 4l-3 4h6L4 4zM12 4l-3 4h6L12 4z"/></svg>
    ),
    ban: (
      <svg viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.2"/><path d="M4 12L12 4" stroke="currentColor" strokeWidth="1.2"/></svg>
    ),
  };
  return icons[name] || null;
}

function StatusBtn({ status, label, color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '4px 2px',
        fontSize: '9px',
        fontWeight: 700,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-mono)',
        border: `1px solid ${active ? color : 'var(--n-border)'}`,
        borderRadius: '3px',
        background: active ? `${color}22` : 'var(--n-bg-card)',
        color: active ? color : 'var(--n-text-muted)',
        cursor: 'pointer',
        transition: 'all 0.1s',
      }}
    >
      {label}
    </button>
  );
}

export default function Sidebar() {
  const { state, dispatch } = useCAD();
  const { currentPage, currentUser, officers } = state;

  const me = officers.find(o => o.id === currentUser?.id);
  const myStatus = me?.status || 'OFFDUTY';
  const isAdmin = currentUser?.role === 'admin';
  const isDispatch = currentUser?.role === 'dispatch';

  const go = (page) => dispatch({ type: 'SET_PAGE', payload: page });

  const statusColors = {
    AVAILABLE: 'var(--st-av-text)',
    BUSY: 'var(--st-busy-text)',
    ENRT: 'var(--st-enrt-text)',
    UNAVAILABLE: 'var(--st-unav-text)',
    OFFDUTY: 'var(--st-od-text)',
  };

  const setStatus = (s) => dispatch({ type: 'SET_STATUS', payload: s });

  const activeCalls = state.calls.filter(c => c.status !== 'CLOSED').length;

  return (
    <nav role="navigation" aria-label="Main navigation" style={{ width: 200, minWidth: 200, display: 'flex', flexDirection: 'column', background: 'var(--n-bg-panel)', borderRight: '1px solid var(--n-border)', height: '100%', overflow: 'hidden' }}>
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 10px 10px',
        borderBottom: '1px solid var(--n-border)',
        background: 'var(--n-bg-card)',
        flexShrink: 0,
      }}>
        <SSRPShield />
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--n-gold-bright)', letterSpacing: '0.5px', lineHeight: 1.2 }}>
            SSRP NEXUS
          </div>
          <div style={{ fontSize: 9, color: 'var(--n-text-muted)', letterSpacing: '0.3px', lineHeight: 1.4 }}>
            CAD v2.0
          </div>
          <div style={{ fontSize: 8, color: 'var(--n-text-muted)', letterSpacing: '0.2px', marginTop: 1 }}>
            HILLSBOROUGH CO.
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {NAV.map((section) => {
          if (section.adminOnly && !isAdmin) return null;
          return (
            <div key={section.section}>
              <div style={{ height: 1, background: 'var(--n-border)', margin: '4px 0' }} />
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--n-text-muted)', padding: '2px 10px', fontFamily: 'var(--font-mono)' }}>{section.section}</div>
              {section.items.map((item) => {
                const isActive = currentPage === item.page;
                return (
                <button
                  key={item.page}
                  onClick={() => go(item.page)}
                  title={item.label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                    fontSize: 12, color: isActive ? '#a0c8e8' : 'var(--n-text-dim)',
                    background: isActive ? '#07111e' : 'none', border: 'none',
                    borderLeft: `3px solid ${isActive ? '#1060a8' : 'transparent'}`,
                    cursor: 'pointer', fontFamily: 'var(--font-ui)', textAlign: 'left', width: '100%',
                    paddingLeft: isActive ? 7 : 10, transition: 'background 0.1s, color 0.1s',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--n-bg-hover)'; e.currentTarget.style.color = 'var(--n-text)'; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--n-text-dim)'; } }}
                >
                  <span style={{ width: 16, height: 16, flexShrink: 0 }}><Icon name={item.icon} /></span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.page === 'dispatch' && activeCalls > 0 && (
                    <span style={{ fontSize: 9, fontWeight: 700, background: 'var(--pr2-bg)', color: 'var(--pr2-text)', padding: '1px 5px', borderRadius: 9999, border: '1px solid var(--pr2-border)' }}>{activeCalls}</span>
                  )}
                </button>
                );
              })}
            </div>
          );
        })}
        <div style={{ height: 1, background: 'var(--n-border)', marginTop: 8 }} />
      </div>

      {/* User card */}
      <div style={{
        padding: '8px 10px 10px',
        borderTop: '1px solid var(--n-border)',
        background: 'var(--n-bg-card)',
        flexShrink: 0,
      }}>
        {/* Status indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 7,
        }}>
          <div style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: statusColors[myStatus] || 'var(--n-text-muted)',
            flexShrink: 0,
            boxShadow: `0 0 6px ${statusColors[myStatus] || 'transparent'}`,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--n-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.name || 'Unknown'}
            </div>
            <div style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {me?.badge || '—'} · {me?.deptShort || '—'}
            </div>
          </div>
        </div>

        {/* Status buttons */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          <StatusBtn status="AVAILABLE" label="AVL" color="var(--st-av-text)"
            active={myStatus === 'AVAILABLE'} onClick={() => setStatus('AVAILABLE')} />
          <StatusBtn status="BUSY" label="BUSY" color="var(--st-busy-text)"
            active={myStatus === 'BUSY'} onClick={() => setStatus('BUSY')} />
          <StatusBtn status="UNAVAILABLE" label="UNV" color="var(--st-unav-text)"
            active={myStatus === 'UNAVAILABLE'} onClick={() => setStatus('UNAVAILABLE')} />
          <StatusBtn status="OFFDUTY" label="OFD" color="var(--st-od-text)"
            active={myStatus === 'OFFDUTY'} onClick={() => setStatus('OFFDUTY')} />
        </div>

        <button
          style={{ width: '100%', justifyContent: 'center', fontSize: 10, color: 'var(--n-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', fontFamily: 'var(--font-ui)' }}
          onClick={() => dispatch({ type: 'LOGOUT' })}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
