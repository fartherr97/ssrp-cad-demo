import { useState, useEffect } from 'react';
import { useCAD } from '../store/cadStore';
import { useResponsive } from '../hooks/useResponsive';
import { FaBars, FaXmark, FaShieldHalved } from 'react-icons/fa6';

const STATUS_ORDER = ['AVAILABLE', 'BUSY', 'UNAVAILABLE', 'OFFDUTY'];
const STATUS_CONFIG = {
  AVAILABLE:   { bg: '#052e16', text: '#4ade80', border: '#166534', label: 'ON DUTY' },
  BUSY:        { bg: '#431407', text: '#fb923c', border: '#9a3412', label: 'BUSY' },
  UNAVAILABLE: { bg: '#450a0a', text: '#f87171', border: '#991b1b', label: 'UNAVAIL' },
  OFFDUTY:     { bg: '#111827', text: '#6b7280', border: '#374151', label: 'OFF DUTY' },
};

const NAV = [
  { label: 'DISPATCH',  page: 'dispatch' },
  { label: 'MAP',       page: 'livemap' },
  { label: 'RECORDS',   page: 'search' },
  { label: 'VEHICLES',  page: 'returns' },
  { label: 'WARRANTS',  page: 'rms' },
  { label: 'MESSAGES',  page: 'mdt', badge: true },
  { label: 'REPORTS',   page: 'forms' },
  { label: 'NEW CALL',  page: 'createcall' },
  { label: 'PROFILE',   page: 'profile' },
];
const CONSOLE_ITEM = { label: 'CONSOLE', page: 'console' };
const ADMIN_NAV = [
  { label: 'DEPARTMENTS', page: 'departments' },
  { label: 'PENAL CODE',  page: 'penalcode' },
  { label: 'TEMPLATES',   page: 'recordtemplates' },
  { label: 'ADMIN',       page: 'admin' },
  { label: 'BANS',        page: 'bans' },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const p = n => String(n).padStart(2, '0');
  return `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
}

export default function NavBar() {
  const { state, dispatch } = useCAD();
  const { currentUser, currentPage, officers, messages } = state;
  const { isMobile } = useResponsive();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const clock = useClock();

  const myOfficer   = officers.find(o => o.id === currentUser?.id);
  const myStatus    = myOfficer?.status || 'OFFDUTY';
  const statusCfg   = STATUS_CONFIG[myStatus] || STATUS_CONFIG.OFFDUTY;
  const unread      = messages.filter(m => !m.read).length;
  const go          = page => { dispatch({ type: 'SET_PAGE', payload: page }); setDrawerOpen(false); };
  const canDispatch = currentUser?.role === 'dispatch' || currentUser?.role === 'admin';
  const navItems    = canDispatch ? [CONSOLE_ITEM, ...NAV] : NAV;

  const cycleStatus = () => {
    const idx = STATUS_ORDER.indexOf(myStatus);
    dispatch({ type: 'SET_STATUS', payload: STATUS_ORDER[(idx + 1) % STATUS_ORDER.length] });
  };

  // Derive short last name for the display (mirrors the reference: "Sgt. J. Davis")
  const nameShort = currentUser
    ? `${currentUser.rank || ''} ${currentUser.name.split(' ').pop()}`
    : '';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
      {/* ── Single CAD navigation bar ── */}
      <div style={{
        background: '#08090e',
        borderBottom: '1px solid #1a1e2c',
        height: '42px',
        display: 'flex',
        alignItems: 'stretch',
        paddingLeft: '0',
        paddingRight: '8px',
        gap: 0,
      }}>

        {/* Logo / branding */}
        <button
          onClick={() => go('hub')}
          style={{
            background: 'transparent',
            border: 'none',
            borderRight: '1px solid #1a1e2c',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 14px 0 12px',
            flexShrink: 0,
          }}
        >
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" style={{ height: '22px', width: 'auto' }} />
          <span style={{ color: '#cbd5e1', fontWeight: 700, fontSize: '13px', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
            SSRP <span style={{ color: '#f97316' }}>CAD</span>
          </span>
        </button>

        {/* Desktop nav items */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'stretch', overflowX: 'auto', scrollbarWidth: 'none', flex: 1 }}>
            {navItems.map(item => (
              <NavBtn
                key={item.page}
                label={item.label}
                active={currentPage === item.page}
                badge={item.badge ? unread : 0}
                onClick={() => go(item.page)}
              />
            ))}
            {currentUser?.role === 'admin' && (
              <>
                <div style={{ width: '1px', background: '#1a1e2c', margin: '8px 2px', flexShrink: 0 }} />
                {ADMIN_NAV.map(item => (
                  <NavBtn
                    key={item.page}
                    label={item.label}
                    active={currentPage === item.page}
                    onClick={() => go(item.page)}
                    admin
                  />
                ))}
              </>
            )}
          </div>
        )}

        {/* Right side: status + user */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '8px', flexShrink: 0 }}>
          {!isMobile && (
            <>
              {/* Status badge */}
              <button
                onClick={cycleStatus}
                title="Click to cycle status"
                style={{
                  background: statusCfg.bg,
                  color: statusCfg.text,
                  border: `1px solid ${statusCfg.border}`,
                  borderRadius: '3px',
                  padding: '3px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusCfg.text, flexShrink: 0 }} />
                STATUS: {statusCfg.label}
              </button>

              {currentUser && (
                <>
                  <div style={{ width: '1px', height: '22px', background: '#1a1e2c' }} />
                  <div style={{ lineHeight: 1.25, textAlign: 'right' }}>
                    <div style={{ color: '#d1d5db', fontSize: '12px', fontWeight: 600 }}>
                      {nameShort}
                    </div>
                    <div style={{ color: '#4b5563', fontSize: '10px' }}>
                      Badge: {currentUser.badge}
                    </div>
                  </div>
                </>
              )}

              <div style={{ width: '1px', height: '22px', background: '#1a1e2c' }} />
              <button
                onClick={() => dispatch({ type: 'LOGOUT' })}
                style={{ background: 'transparent', border: '1px solid #1a1e2c', borderRadius: '3px', color: '#4b5563', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Sign Out
              </button>
            </>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <button
              onClick={() => setDrawerOpen(d => !d)}
              style={{ background: drawerOpen ? '#1e293b' : 'transparent', border: '1px solid #1a1e2c', borderRadius: '4px', color: '#9ca3af', padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {drawerOpen ? <FaXmark size={15} /> : <FaBars size={15} />}
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {isMobile && drawerOpen && (
        <div style={{
          background: '#08090e',
          borderBottom: '2px solid #1a1e2c',
          padding: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.85)',
          maxHeight: 'calc(100vh - 42px)',
          overflowY: 'auto',
        }}>
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #1a1e2c' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.rank} {currentUser.name}
                </div>
                <div style={{ color: '#4b5563', fontSize: '11px' }}>
                  Badge: {currentUser.badge} · {currentUser.deptShort}
                </div>
              </div>
              <button
                onClick={cycleStatus}
                style={{ background: statusCfg.bg, color: statusCfg.text, border: `1px solid ${statusCfg.border}`, borderRadius: '3px', padding: '3px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
              >
                {statusCfg.label}
              </button>
              <button onClick={() => dispatch({ type: 'LOGOUT' })} style={{ background: 'transparent', border: '1px solid #1a1e2c', borderRadius: '3px', color: '#4b5563', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}>
                Out
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', marginBottom: '8px' }}>
            {navItems.map(item => (
              <button
                key={item.page}
                onClick={() => go(item.page)}
                style={{
                  background: currentPage === item.page ? '#1e3a5f' : '#0d1117',
                  border: `1px solid ${currentPage === item.page ? '#1d4ed8' : '#1a1e2c'}`,
                  borderRadius: '3px',
                  color: currentPage === item.page ? '#93c5fd' : '#6b7280',
                  padding: '8px 4px',
                  fontSize: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  letterSpacing: '0.3px',
                  position: 'relative',
                }}
              >
                {item.label}
                {item.badge && unread > 0 && (
                  <span style={{ position: 'absolute', top: '3px', right: '3px', background: '#dc2626', color: '#fff', borderRadius: '8px', fontSize: '9px', padding: '0 3px', lineHeight: '15px' }}>
                    {unread}
                  </span>
                )}
              </button>
            ))}
          </div>

          {currentUser?.role === 'admin' && (
            <>
              <div style={{ color: '#f97316', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '10px 0 6px', paddingTop: '10px', borderTop: '1px solid #1a1e2c' }}>
                Admin Tools
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' }}>
                {ADMIN_NAV.map(item => (
                  <button
                    key={item.page}
                    onClick={() => go(item.page)}
                    style={{
                      background: currentPage === item.page ? '#431407' : '#0d1117',
                      border: `1px solid ${currentPage === item.page ? '#c2410c' : '#1a1e2c'}`,
                      borderRadius: '3px',
                      color: currentPage === item.page ? '#fb923c' : '#78350f',
                      padding: '8px 4px',
                      fontSize: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #1a1e2c', fontFamily: "'Ubuntu Mono', monospace" }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
            <span style={{ color: '#1d4ed8', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>{clock}</span>
            <span style={{ color: '#374151', fontSize: '11px', marginLeft: 'auto' }}>Dispatch Net Online</span>
          </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({ label, active, onClick, admin, badge }) {
  const [hovered, setHovered] = useState(false);
  const activeColor  = admin ? '#fb923c' : '#93c5fd';
  const hoverColor   = admin ? '#d97706' : '#9ca3af';
  const defaultColor = admin ? '#78350f' : '#4b5563';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'transparent',
        border: 'none',
        borderBottom: active ? `2px solid ${admin ? '#f97316' : '#1d4ed8'}` : '2px solid transparent',
        color: active ? activeColor : hovered ? hoverColor : defaultColor,
        padding: '0 10px',
        height: '42px',
        fontSize: '11px',
        fontWeight: active ? 700 : 500,
        letterSpacing: '0.5px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        transition: 'color 0.1s',
        flexShrink: 0,
      }}
    >
      {label}
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: '6px', right: '3px',
          background: '#dc2626', color: '#fff', borderRadius: '8px',
          fontSize: '9px', padding: '0 3px', lineHeight: '15px', fontWeight: 700,
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}
