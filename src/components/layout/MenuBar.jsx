import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCAD } from '../../store/cadStore';

function Clock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const p = n => String(n).padStart(2, '0');
      setTime(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--n-text-data)', letterSpacing: '0.4px', padding: '0 10px', flexShrink: 0 }}>
      {time}
    </span>
  );
}

const NAV_ITEMS = [
  { route: '/cad',       label: 'CAD'       },
  { route: '/search',    label: 'Search'    },
  { route: '/returns',   label: 'Returns'   },
  { route: '/forms',     label: 'Forms'     },
  { route: '/map',       label: 'Live Map'  },
  { route: '/board',     label: 'Board'     },
  { route: '/units',     label: 'Units'     },
  { route: '/warrants',  label: 'Warrants'  },
  { route: '/civilians', label: 'Civilians' },
  { route: '/mdt',       label: 'MDT'       },
];

const ADMIN_ITEMS = [
  { route: '/admin',   label: 'Admin'   },
  { route: '/penal',   label: 'Penal'   },
  { route: '/bans',    label: 'Bans'    },
  { route: '/builder', label: 'Builder' },
];

const STATUS_COLORS = {
  AVAILABLE:   '#22cc55',
  BUSY:        '#dd8800',
  ENRT:        '#ddcc00',
  ARRVD:       '#aa22dd',
  UNAVAILABLE: '#aa22dd',
  OFFDUTY:     '#cc2222',
};

export default function MenuBar() {
  const { state, dispatch } = useCAD();
  const { currentUser, officers, calls, myCallId } = state;
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const me = officers.find(o => o.id === currentUser?.id);
  const myStatus = me?.status || 'OFFDUTY';
  const isAdmin = currentUser?.role === 'admin';
  const isDispatch = currentUser?.role === 'dispatch' || currentUser?.role === 'admin';
  const activeCalls = calls.filter(c => c.status !== 'CLOSED').length;
  const onDuty = officers.filter(o => o.status !== 'OFFDUTY').length;
  const p1Count = calls.filter(c => c.priority === 1 && c.status !== 'CLOSED').length;
  const myCall = myCallId ? calls.find(c => c.id === myCallId) : null;

  const go = (route) => { navigate(route); setMobileOpen(false); };
  const setStatus = (s) => dispatch({ type: 'SET_STATUS', payload: s });

  const navItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS;

  const isActive = (route) => location.pathname === route || location.pathname.startsWith(route + '/');

  return (
    <>
      <div style={{
        height: 'var(--menubar-h, 36px)', minHeight: 'var(--menubar-h, 36px)',
        display: 'flex', alignItems: 'center', background: 'var(--n-bg-toolbar)',
        borderBottom: '1px solid var(--n-border-strong)', flexShrink: 0, userSelect: 'none',
        padding: 0, gap: 0, overflowX: 'hidden',
      }}>
        {/* Branding */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '0 12px', height: '100%', borderRight: '1px solid var(--n-border)',
          background: 'var(--n-bg-card)', flexShrink: 0,
        }}>
          <img
            src="https://cdn.ssrp.us/images/ssrp.png"
            alt="SSRP"
            style={{ width: 22, height: 22, flexShrink: 0, objectFit: 'contain' }}
          />
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--n-gold)', letterSpacing: '0.4px', lineHeight: 1.2 }}>Sunshine State RP</div>
            <div style={{ fontSize: 8, color: 'var(--n-text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', lineHeight: 1.3 }}>CAD · ECC</div>
          </div>
        </div>

        {/* Desktop navigation */}
        <nav style={{ display: 'flex', alignItems: 'stretch', height: '100%', flex: 1, overflow: 'hidden' }}>
          {navItems.map(item => {
            const active = isActive(item.route);
            return (
            <button
              key={item.route}
              onClick={() => go(item.route)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '0 11px',
                height: '100%', background: active ? 'rgba(47,127,232,0.12)' : 'transparent',
                border: 'none', borderBottom: `2px solid ${active ? 'var(--acc-blue-hi)' : 'transparent'}`,
                color: active ? '#c0d8f0' : 'var(--n-text-dim)', cursor: 'pointer', flexShrink: 0,
                fontSize: 11, fontWeight: active ? 700 : 500, letterSpacing: '0.2px',
                transition: 'background 0.1s, color 0.1s', whiteSpace: 'nowrap',
                fontFamily: 'var(--font-ui)',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--n-text)'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--n-text-dim)'; } }}
            >
              {item.label}
              {item.route === '/cad' && p1Count > 0 && (
                <span style={{
                  marginLeft: 4, padding: '0 3px', fontSize: 7, fontFamily: 'var(--font-mono)',
                  background: 'var(--pr1-bg)', color: 'var(--pr1-text)',
                  border: '1px solid var(--pr1-border)', fontWeight: 700, lineHeight: '12px',
                }}>
                  {p1Count}
                </span>
              )}
            </button>
          );
          })}
        </nav>

        {/* Right: desktop stats + clock, then hamburger (always last) */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, marginLeft: 'auto', flexShrink: 0 }}>
          {p1Count > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--pr1-text)', animation: 'pulseRed 1.5s ease-in-out infinite', borderLeft: '1px solid var(--n-border)', flexShrink: 0 }}>
              ▲ P1: {p1Count}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--n-text-muted)', borderLeft: '1px solid var(--n-border)', flexShrink: 0 }}>ACTIVE: <span style={{ color: 'var(--n-text-data)', marginLeft: 4 }}>{activeCalls}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--n-text-muted)', borderLeft: '1px solid var(--n-border)', flexShrink: 0 }}>ON DUTY: <span style={{ color: 'var(--n-text-data)', marginLeft: 4 }}>{onDuty}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px', fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--n-text-muted)', borderLeft: '1px solid var(--n-border)', flexShrink: 0 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[myStatus] || '#2e4258', flexShrink: 0 }} />
            <span style={{ color: 'var(--n-text-dim)' }}>{me?.badge || '—'} · {me?.deptShort || '—'}</span>
          </div>
          <Clock />
          {/* Hamburger — lives here so it's always on the far right */}
          <button
            className="cad-mobile-toggle"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Open navigation"
            style={{ borderLeft: '1px solid var(--n-border-strong)', marginLeft: 0 }}
          >
            {mobileOpen ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/>
              </svg>
            ) : (
              <svg width="18" height="13" viewBox="0 0 18 13" fill="currentColor">
                <rect y="0"   width="18" height="2" rx="1"/>
                <rect y="5.5" width="18" height="2" rx="1"/>
                <rect y="11"  width="18" height="2" rx="1"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <div className={`cad-mobile-nav${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)}>
        <div className="cad-mobile-nav-panel" onClick={e => e.stopPropagation()}>

          {/* Drawer header */}
          <div className="cad-mobile-nav-header">
            <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" style={{ width: 22, height: 22 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#c8a050', letterSpacing: '0.3px' }}>Sunshine State RP</div>
              <div style={{ fontSize: 9, color: 'var(--n-text-muted)' }}>
                {me?.name} · {me?.badge} · {me?.deptShort}
              </div>
            </div>
            <button className="cad-mobile-nav-close" onClick={() => setMobileOpen(false)}>✕</button>
          </div>

          {/* My call indicator */}
          <div style={{
            padding: '8px 14px', background: '#040c18',
            borderBottom: '1px solid var(--n-border-faint)',
            fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--n-text-muted)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>MY CALL:</span>
            <span style={{ color: myCall ? 'var(--pr3-text)' : 'var(--n-text-muted)', fontWeight: 700 }}>
              {myCall ? myCall.id : 'UNASSIGNED'}
            </span>
            {myCall && <span style={{ color: 'var(--n-text-dim)', fontSize: 10 }}>· {myCall.nature}</span>}
          </div>

          {/* Status quick-set */}
          <div style={{
            padding: '8px 14px', background: '#040c18',
            borderBottom: '1px solid var(--n-border)',
          }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--n-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Set Status
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {[
                { status: 'AVAILABLE',   label: 'AVL'   },
                { status: 'ENRT',        label: 'ENRT'  },
                { status: 'BUSY',        label: 'BUSY'  },
                { status: 'ARRVD',       label: 'ARRVD' },
                { status: 'UNAVAILABLE', label: 'UNAVL' },
                { status: 'OFFDUTY',     label: 'OFD'   },
              ].map(s => {
                const isActive = myStatus === s.status;
                const color = STATUS_COLORS[s.status] || '#556677';
                return (
                  <button
                    key={s.status}
                    onClick={() => setStatus(s.status)}
                    style={{
                      height: 32, padding: '0 12px', fontSize: 10,
                      fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                      border: `1px solid ${isActive ? color : 'var(--n-border)'}`,
                      borderRadius: 3, cursor: 'pointer',
                      background: isActive ? `${color}22` : 'var(--n-bg-card)',
                      color: isActive ? color : 'var(--n-text-muted)',
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Create call (dispatch only) */}
          {isDispatch && (
            <button
              className="cad-mobile-nav-item"
              style={{ color: '#80c8f0', borderBottom: '1px solid var(--n-border)', fontWeight: 600 }}
              onClick={() => go('/cad?new=1')}
            >
              + Create Call
            </button>
          )}

          {/* Nav links */}
          {navItems.map(item => (
            <button
              key={item.route}
              className={`cad-mobile-nav-item${isActive(item.route) ? ' active' : ''}`}
              onClick={() => go(item.route)}
            >
              {item.label}
              {item.route === '/cad' && p1Count > 0 && (
                <span style={{ marginLeft: 8, padding: '1px 5px', fontSize: 9, background: 'var(--pr1-bg)', color: 'var(--pr1-text)', fontWeight: 700 }}>
                  P1: {p1Count}
                </span>
              )}
            </button>
          ))}

          {/* Live stats */}
          <div style={{
            padding: '8px 14px', background: '#030810',
            borderTop: '1px solid var(--n-border)',
            display: 'flex', gap: 16, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--n-text-muted)',
          }}>
            <span>ACTIVE: <span style={{ color: 'var(--n-text-data)' }}>{activeCalls}</span></span>
            <span>ON DUTY: <span style={{ color: '#22cc55' }}>{onDuty}</span></span>
          </div>

          {/* Sign out */}
          <button
            className="cad-mobile-nav-item"
            style={{ color: 'var(--n-text-muted)', background: '#030810' }}
            onClick={() => { dispatch({ type: 'LOGOUT' }); setMobileOpen(false); }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
