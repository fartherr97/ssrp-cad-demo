import { useCAD } from '../store/cadStore';
import StatusBadge from './StatusBadge';

const STATUSES = ['AVAILABLE', 'BUSY', 'UNAVAILABLE', 'OFFDUTY'];

const STATUS_COLORS = {
  AVAILABLE: '#22c55e',
  BUSY: '#f59e0b',
  UNAVAILABLE: '#ef4444',
  OFFDUTY: '#6b7280',
  ENRT: '#22c55e',
};

export default function NavBar() {
  const { state, dispatch } = useCAD();
  const { currentUser, currentPage, officers } = state;
  const myOfficer = officers.find(o => o.id === currentUser?.id);
  const myStatus = myOfficer?.status || 'OFFDUTY';
  const unreadCount = state.messages.filter(m => !m.read).length;

  const nav = [
    { page: 'dispatch', icon: '📡', label: 'CAD' },
    { page: 'search', icon: '🔍', label: 'Search' },
    { page: 'returns', icon: '💻', label: 'Returns' },
    { page: 'mdt', icon: '📟', label: 'MDT', badge: unreadCount > 0 ? unreadCount : null },
    { page: 'forms', icon: '📋', label: 'Forms' },
    { page: 'rms', icon: '🗃️', label: 'RMS' },
    { page: 'livemap', icon: '🗺️', label: 'Live Map' },
    { page: 'createcall', icon: '📞', label: 'Create Call' },
    { page: 'profile', icon: '👤', label: 'My Profile' },
  ];

  const adminNav = [
    { page: 'departments', icon: '🏛️', label: 'Departments' },
    { page: 'penalcode', icon: '⚖️', label: 'Penal Codes' },
    { page: 'recordtemplates', icon: '🗂️', label: 'Templates' },
    { page: 'admin', icon: '⚙️', label: 'Admin Panel' },
    { page: 'bans', icon: '🔨', label: 'Bans' },
  ];

  const go = (page) => dispatch({ type: 'SET_PAGE', payload: page });
  const statusColor = STATUS_COLORS[myStatus] || '#6b7280';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>

      {/* ── Top branding bar ── */}
      <div style={{
        background: '#080f1e',
        borderBottom: '1px solid #1a2e50',
        padding: '0 20px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Left: logo + name */}
        <div
          onClick={() => go('dispatch')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" style={{ height: '34px', width: 'auto' }} />
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px', letterSpacing: '0.3px' }}>
              Sunshine State <span style={{ color: '#f97316' }}>RP</span>
            </div>
            <div style={{ color: '#4a6a9a', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Computer Aided Dispatch
            </div>
          </div>
        </div>

        {/* Center: page title */}
        <div style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500, letterSpacing: '0.5px' }}>
          {PAGE_TITLES[currentPage] || 'CAD System'}
        </div>

        {/* Right: user info */}
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Avatar placeholder */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px', height: '34px',
                background: 'linear-gradient(135deg, #1e4080, #2d5fa0)',
                border: `2px solid ${statusColor}`,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px',
              }}>
                👮
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>
                  {currentUser.badge} | {currentUser.rank} | {currentUser.name}
                </div>
                <div style={{ color: '#f97316', fontSize: '11px' }}>
                  {currentUser.deptShort}
                  {myOfficer?.subdivision ? ` · ${myOfficer.subdivision}` : ''}
                </div>
              </div>
            </div>
            <button
              onClick={() => dispatch({ type: 'LOGOUT' })}
              style={{ background: 'transparent', color: '#64748b', border: '1px solid #1e3060', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* ── Nav strip ── */}
      <div style={{
        background: 'linear-gradient(180deg, #0d1b32 0%, #0a1525 100%)',
        borderBottom: '1px solid #1e3060',
        padding: '0 16px',
        height: '38px',
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      }}>
        {/* Status toggle */}
        <div
          onClick={() => {
            const idx = STATUSES.indexOf(myStatus);
            dispatch({ type: 'SET_STATUS', payload: STATUSES[(idx + 1) % STATUSES.length] });
          }}
          style={{ marginRight: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <StatusBadge status={myStatus} />
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: '#1e3060', marginRight: '8px' }} />

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: '1px', flex: 1, overflowX: 'auto', alignItems: 'center' }}>
          {nav.map(item => (
            <NavBtn key={item.page} item={item} active={currentPage === item.page} onClick={() => go(item.page)} />
          ))}
          {currentUser?.role === 'admin' && (
            <>
              <div style={{ width: '1px', height: '20px', background: '#1e3060', margin: '0 6px' }} />
              {adminNav.map(item => (
                <NavBtn key={item.page} item={item} active={currentPage === item.page} onClick={() => go(item.page)} admin />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NavBtn({ item, active, onClick, admin }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(74,158,255,0.12)' : 'transparent',
        border: 'none',
        borderBottom: active ? '2px solid #4a9eff' : '2px solid transparent',
        borderRadius: '0',
        color: active ? '#4a9eff' : (admin ? '#f97316' : '#64748b'),
        padding: '0 10px',
        height: '38px',
        fontSize: '11px',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
        position: 'relative',
        transition: 'color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = admin ? '#fbbf24' : '#94a3b8'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = admin ? '#f97316' : '#64748b'; }}
    >
      <span style={{ fontSize: '12px' }}>{item.icon}</span>
      <span>{item.label}</span>
      {item.badge && (
        <span style={{
          background: '#ef4444', color: '#fff', borderRadius: '10px',
          fontSize: '9px', padding: '1px 5px',
          position: 'absolute', top: '4px', right: '2px',
          lineHeight: 1.4,
        }}>
          {item.badge}
        </span>
      )}
    </button>
  );
}

const PAGE_TITLES = {
  dispatch: 'Dispatch Board',
  mdt: 'Mobile Data Terminal',
  search: 'Records Search',
  returns: 'NCIC / DMV Returns',
  forms: 'Report Center',
  rms: 'Records Management',
  livemap: 'Live Map',
  createcall: 'Create Call',
  profile: 'Officer Profile',
  civilian: 'Civilian Portal',
  departments: 'Department Management',
  penalcode: 'Penal Code Editor',
  recordtemplates: 'Custom Record Templates',
  admin: 'Admin Panel',
  bans: 'Ban Management',
};
