import { useState, useEffect } from 'react';
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
  return <span className="cad-clock">{time}</span>;
}

const NAV_ITEMS = [
  { page: 'dispatch',  label: 'CAD'       },
  { page: 'records',   label: 'Search'    },
  { page: 'returns',   label: 'Returns'   },
  { page: 'reports',   label: 'Forms'     },
  { page: 'map',       label: 'Live Map'  },
  { page: 'board',     label: 'Board'     },
  { page: 'units',     label: 'Units'     },
  { page: 'warrants',  label: 'Warrants'  },
  { page: 'civilian',  label: 'Civilians' },
  { page: 'mdt',       label: 'MDT'       },
];

const ADMIN_ITEMS = [
  { page: 'admin', label: 'Admin' },
  { page: 'penal', label: 'Penal' },
  { page: 'bans',  label: 'Bans'  },
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
  const { currentPage, currentUser, officers, calls, myCallId } = state;
  const [mobileOpen, setMobileOpen] = useState(false);

  const me = officers.find(o => o.id === currentUser?.id);
  const myStatus = me?.status || 'OFFDUTY';
  const isAdmin = currentUser?.role === 'admin';
  const isDispatch = currentUser?.role === 'dispatch' || currentUser?.role === 'admin';
  const activeCalls = calls.filter(c => c.status !== 'CLOSED').length;
  const onDuty = officers.filter(o => o.status !== 'OFFDUTY').length;
  const p1Count = calls.filter(c => c.priority === 1 && c.status !== 'CLOSED').length;
  const myCall = myCallId ? calls.find(c => c.id === myCallId) : null;

  const go = (page) => { dispatch({ type: 'SET_PAGE', payload: page }); setMobileOpen(false); };
  const setStatus = (s) => dispatch({ type: 'SET_STATUS', payload: s });

  const navItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS;

  return (
    <>
      <div className="cad-menubar">
        {/* Branding */}
        <div className="cad-menubar-brand">
          <img
            src="https://cdn.ssrp.us/images/ssrp.png"
            alt="SSRP"
            style={{ width: 22, height: 22, flexShrink: 0, objectFit: 'contain' }}
          />
          <div>
            <div className="cad-menubar-agency">Sunshine State RP</div>
            <div className="cad-menubar-sub">CAD · ECC</div>
          </div>
        </div>

        {/* Desktop navigation */}
        <nav className="cad-nav">
          {navItems.map(item => (
            <button
              key={item.page}
              className={`cad-nav-item${currentPage === item.page ? ' active' : ''}`}
              onClick={() => go(item.page)}
            >
              {item.label}
              {item.page === 'dispatch' && p1Count > 0 && (
                <span style={{
                  marginLeft: 4, padding: '0 3px', fontSize: 7, fontFamily: 'var(--font-mono)',
                  background: 'var(--pr1-bg)', color: 'var(--pr1-text)',
                  border: '1px solid var(--pr1-border)', fontWeight: 700, lineHeight: '12px',
                }}>
                  {p1Count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right: desktop stats + clock, then hamburger (always last) */}
        <div className="cad-menubar-right">
          {p1Count > 0 && (
            <div className="cad-menubar-stat" style={{ color: 'var(--pr1-text)', animation: 'pulseRed 1.5s ease-in-out infinite' }}>
              ▲ P1: {p1Count}
            </div>
          )}
          <div className="cad-menubar-stat">ACTIVE: <span className="val">{activeCalls}</span></div>
          <div className="cad-menubar-stat">ON DUTY: <span className="val">{onDuty}</span></div>
          <div className="cad-menubar-stat" style={{ borderLeft: '1px solid var(--n-border)' }}>
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
                { status: 'AVAILABLE',   label: 'AVL',   cls: 'st-available' },
                { status: 'ENRT',        label: 'ENRT',  cls: 'st-enrt'      },
                { status: 'BUSY',        label: 'BUSY',  cls: 'st-busy'      },
                { status: 'ARRVD',       label: 'ARRVD', cls: 'st-arrvd'     },
                { status: 'UNAVAILABLE', label: 'UNAVL', cls: 'st-unavl'     },
                { status: 'OFFDUTY',     label: 'OFD',   cls: 'st-offduty'   },
              ].map(s => (
                <button
                  key={s.status}
                  className={`cad-status-btn ${myStatus === s.status ? s.cls : ''}`}
                  style={{ height: 32, padding: '0 12px', fontSize: 10 }}
                  onClick={() => setStatus(s.status)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Create call (dispatch only) */}
          {isDispatch && (
            <button
              className="cad-mobile-nav-item"
              style={{ color: '#80c8f0', borderBottom: '1px solid var(--n-border)', fontWeight: 600 }}
              onClick={() => { go('dispatch'); /* trigger create */ setMobileOpen(false); }}
            >
              + Create Call
            </button>
          )}

          {/* Nav links */}
          {navItems.map(item => (
            <button
              key={item.page}
              className={`cad-mobile-nav-item${currentPage === item.page ? ' active' : ''}`}
              onClick={() => go(item.page)}
            >
              {item.label}
              {item.page === 'dispatch' && p1Count > 0 && (
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
