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
  { page: 'admin',     label: 'Admin'     },
  { page: 'penal',     label: 'Penal'     },
  { page: 'bans',      label: 'Bans'      },
];

export default function MenuBar() {
  const { state, dispatch } = useCAD();
  const { currentPage, currentUser, officers, calls } = state;
  const [mobileOpen, setMobileOpen] = useState(false);

  const me = officers.find(o => o.id === currentUser?.id);
  const myStatus = me?.status || 'OFFDUTY';
  const isAdmin = currentUser?.role === 'admin';
  const activeCalls = calls.filter(c => c.status !== 'CLOSED').length;
  const onDuty = officers.filter(o => o.status !== 'OFFDUTY').length;
  const p1Count = calls.filter(c => c.priority === 1 && c.status !== 'CLOSED').length;

  const go = (page) => {
    dispatch({ type: 'SET_PAGE', payload: page });
    setMobileOpen(false);
  };

  const statusDotColor = {
    AVAILABLE:   '#22cc55',
    BUSY:        '#dd8800',
    ENRT:        '#ddcc00',
    ARRVD:       '#aa22dd',
    UNAVAILABLE: '#aa22dd',
    OFFDUTY:     '#cc2222',
  }[myStatus] || '#2e4258';

  const navItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS;

  return (
    <>
      <div className="cad-menubar">
        {/* Agency branding */}
        <div className="cad-menubar-brand">
          <svg width="16" height="19" viewBox="0 0 36 42" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M18 1L2 8v16c0 9.5 7.2 17.5 16 19 8.8-1.5 16-9.5 16-19V8L18 1z"
              fill="#040c1c" stroke="#6a4808" strokeWidth="1.2"/>
            <path d="M18 6L5 11.5v12.5c0 7.5 5.8 13.8 13 15.2 7.2-1.4 13-7.7 13-15.2V11.5L18 6z"
              fill="rgba(10,60,130,0.25)" stroke="#0a3a70" strokeWidth="0.8"/>
            <text x="18" y="22" textAnchor="middle" fill="#0e5090" fontSize="11" fontFamily="system-ui">★</text>
            <text x="18" y="32" textAnchor="middle" fill="#a07808" fontSize="5.5" fontWeight="700"
              fontFamily="system-ui" letterSpacing="1.5">SSRP</text>
          </svg>
          <div>
            <div className="cad-menubar-agency">HILLSBOROUGH COUNTY</div>
            <div className="cad-menubar-sub">EMERGENCY COMMUNICATIONS</div>
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

        {/* Hamburger toggle (mobile only) */}
        <button
          className="cad-mobile-toggle"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Open navigation"
        >
          {mobileOpen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          ) : (
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
              <rect y="0" width="16" height="1.8" rx="0.5"/>
              <rect y="5.1" width="16" height="1.8" rx="0.5"/>
              <rect y="10.2" width="16" height="1.8" rx="0.5"/>
            </svg>
          )}
        </button>

        {/* Right side: stats + unit + clock */}
        <div className="cad-menubar-right">
          {p1Count > 0 && (
            <div className="cad-menubar-stat" style={{ color: 'var(--pr1-text)', animation: 'pulseRed 1.5s ease-in-out infinite' }}>
              ▲ P1: {p1Count}
            </div>
          )}
          <div className="cad-menubar-stat">
            ACTIVE: <span className="val">{activeCalls}</span>
          </div>
          <div className="cad-menubar-stat">
            ON DUTY: <span className="val">{onDuty}</span>
          </div>
          <div className="cad-menubar-stat" style={{ borderLeft: '1px solid var(--n-border)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusDotColor, flexShrink: 0 }} />
            <span style={{ color: 'var(--n-text-dim)' }}>
              {me?.badge || '—'} · {me?.deptShort || '—'}
            </span>
          </div>
          <Clock />
        </div>
      </div>

      {/* Mobile nav drawer */}
      <div className={`cad-mobile-nav${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)}>
        <div className="cad-mobile-nav-panel" onClick={e => e.stopPropagation()}>
          <div className="cad-mobile-nav-header">
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--n-gold-bright)', fontWeight: 700, letterSpacing: '0.8px' }}>
              NAVIGATION
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--n-text-muted)' }}>
              <span>ACTIVE: <span style={{ color: 'var(--n-text-data)' }}>{activeCalls}</span></span>
              <span>ON DUTY: <span style={{ color: '#22cc55' }}>{onDuty}</span></span>
            </div>
            <button className="cad-mobile-nav-close" onClick={() => setMobileOpen(false)}>✕</button>
          </div>
          {navItems.map(item => (
            <button
              key={item.page}
              className={`cad-mobile-nav-item${currentPage === item.page ? ' active' : ''}`}
              onClick={() => go(item.page)}
            >
              {item.label}
              {item.page === 'dispatch' && p1Count > 0 && (
                <span style={{
                  marginLeft: 8, padding: '1px 5px', fontSize: 9, fontFamily: 'var(--font-mono)',
                  background: 'var(--pr1-bg)', color: 'var(--pr1-text)', fontWeight: 700,
                }}>
                  P1: {p1Count}
                </span>
              )}
            </button>
          ))}
          {/* Sign out in mobile nav */}
          <button
            className="cad-mobile-nav-item"
            style={{ color: 'var(--n-text-muted)', marginTop: 4, borderTop: '1px solid var(--n-border)' }}
            onClick={() => { dispatch({ type: 'LOGOUT' }); setMobileOpen(false); }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
