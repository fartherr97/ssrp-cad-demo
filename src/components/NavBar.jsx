import { useCAD } from '../store/cadStore';
import StatusBadge from './StatusBadge';

const STATUSES = ['AVAILABLE', 'BUSY', 'UNAVAILABLE', 'OFFDUTY'];

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
    { page: 'livemap', icon: '🗺️', label: 'LiveMap' },
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

  return (
    <div style={{
      background: 'linear-gradient(180deg, #0f2548 0%, #0a1a35 100%)',
      borderBottom: '2px solid #1e4080',
      padding: '0 12px',
      display: 'flex',
      alignItems: 'center',
      height: '48px',
      gap: '2px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
    }}>
      {/* Logo */}
      <div
        onClick={() => go('dispatch')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}
      >
        <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" style={{ height: '28px', width: 'auto' }} />
        <span style={{ color: '#4a9eff', fontWeight: 800, fontSize: '14px', letterSpacing: '1px', fontFamily: 'Courier New, monospace' }}>SUNSHINE STATE RP CAD</span>
      </div>

      {/* Status indicator */}
      <div style={{ marginRight: '8px', cursor: 'pointer' }} onClick={() => {
        const idx = STATUSES.indexOf(myStatus);
        const next = STATUSES[(idx + 1) % STATUSES.length];
        dispatch({ type: 'SET_STATUS', payload: next });
      }}>
        <StatusBadge status={myStatus} />
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', gap: '2px', flex: 1, overflowX: 'auto', alignItems: 'center' }}>
        {nav.map(item => (
          <NavBtn key={item.page} item={item} active={currentPage === item.page} onClick={() => go(item.page)} />
        ))}
        {currentUser?.role === 'admin' && adminNav.map(item => (
          <NavBtn key={item.page} item={item} active={currentPage === item.page} onClick={() => go(item.page)} admin />
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
        {currentUser && (
          <span style={{ color: '#94a3b8', fontSize: '12px', whiteSpace: 'nowrap' }}>
            {currentUser.name} <span style={{ color: '#4a9eff' }}>({currentUser.badge || currentUser.role})</span>
          </span>
        )}
        <button
          onClick={() => dispatch({ type: 'LOGOUT' })}
          style={{ background: '#c62828', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
        >
          LOG OUT
        </button>
      </div>
    </div>
  );
}

function NavBtn({ item, active, onClick, admin }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? '#1e4080' : 'transparent',
        border: active ? '1px solid #4a9eff' : '1px solid transparent',
        borderRadius: '4px',
        color: active ? '#4a9eff' : (admin ? '#f59e0b' : '#94a3b8'),
        padding: '4px 8px',
        fontSize: '11px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
        position: 'relative',
      }}
    >
      <span>{item.icon}</span>
      <span style={{ display: window.innerWidth < 900 ? 'none' : 'inline' }}>{item.label}</span>
      {item.badge && (
        <span style={{ background: '#ef4444', color: '#fff', borderRadius: '10px', fontSize: '10px', padding: '0 5px', position: 'absolute', top: -4, right: -4 }}>
          {item.badge}
        </span>
      )}
    </button>
  );
}
