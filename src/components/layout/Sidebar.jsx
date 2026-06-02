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
      className="flex-1 py-1 text-[9px] font-bold uppercase tracking-wide font-mono rounded cursor-pointer transition-all"
      style={{
        border: `1px solid ${active ? color : 'var(--n-border)'}`,
        background: active ? `${color}22` : 'var(--n-bg-card)',
        color: active ? color : 'var(--n-text-muted)',
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

  const go = (page) => dispatch({ type: 'SET_PAGE', payload: page });

  const statusColors = {
    AVAILABLE:   'var(--st-av-text)',
    BUSY:        'var(--st-busy-text)',
    ENRT:        'var(--st-enrt-text)',
    UNAVAILABLE: 'var(--st-unav-text)',
    OFFDUTY:     'var(--st-od-text)',
  };

  const setStatus = (s) => dispatch({ type: 'SET_STATUS', payload: s });

  const activeCalls = state.calls.filter(c => c.status !== 'CLOSED').length;
  const statusColor = statusColors[myStatus] || 'var(--n-text-muted)';

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="w-[200px] min-w-[200px] flex flex-col bg-app-panel border-r border-border-base h-full overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2.5 pt-3 pb-2.5 border-b border-border-base bg-app-card shrink-0">
        <SSRPShield />
        <div>
          <div className="text-[11px] font-bold text-gold-bright leading-tight tracking-wide">
            SSRP NEXUS
          </div>
          <div className="text-[9px] text-cad-muted tracking-wide leading-snug">
            CAD v2.0
          </div>
          <div className="text-[8px] text-cad-muted tracking-wide mt-px">
            SSRP
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-auto">
        {NAV.map((section) => {
          if (section.adminOnly && !isAdmin) return null;
          return (
            <div key={section.section}>
              <div className="h-px bg-border-base my-1" />
              <div className="text-[8px] font-bold tracking-[0.7px] uppercase text-cad-muted px-2.5 py-0.5 font-mono">{section.section}</div>
              {section.items.map((item) => {
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.page}
                    onClick={() => go(item.page)}
                    title={item.label}
                    className={`flex items-center gap-2 w-full text-left text-xs border-none cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-app-elevated text-sky-300 border-l-[3px] border-l-sky-700 pl-[7px] pr-2.5 py-[7px]'
                        : 'bg-transparent text-cad-dim hover:bg-app-hover hover:text-cad-text border-l-[3px] border-l-transparent px-2.5 py-[7px]'
                    }`}
                  >
                    <span className="w-4 h-4 shrink-0"><Icon name={item.icon} /></span>
                    <span className="flex-1">{item.label}</span>
                    {item.page === 'dispatch' && activeCalls > 0 && (
                      <span className="text-[9px] font-bold bg-[var(--pr2-bg)] text-[var(--pr2-text)] border border-[var(--pr2-border)] px-1.5 py-px rounded-full">{activeCalls}</span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
        <div className="h-px bg-border-base mt-2" />
      </div>

      {/* User card */}
      <div className="px-2.5 pt-2 pb-2.5 border-t border-border-base bg-app-card shrink-0">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div
            className="w-[7px] h-[7px] rounded-full shrink-0"
            style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-cad-text overflow-hidden text-ellipsis whitespace-nowrap">
              {currentUser?.name || 'Unknown'}
            </div>
            <div className="text-[9px] text-cad-muted font-mono">
              {me?.badge || '*'} · {me?.deptShort || '*'}
            </div>
          </div>
        </div>

        {/* Status buttons */}
        <div className="flex gap-1 mb-1.5">
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
          className="w-full text-center text-[10px] text-cad-muted bg-transparent border-none cursor-pointer py-1.5 hover:text-cad-dim transition-colors"
          onClick={() => dispatch({ type: 'LOGOUT' })}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
