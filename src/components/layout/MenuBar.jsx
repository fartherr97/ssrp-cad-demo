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
    <span className="font-mono text-[11px] font-semibold text-cad-data tracking-[0.4px] px-2.5 shrink-0">
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

/* Map status to a Tailwind dot color class */
const STATUS_DOT_COLOR = {
  AVAILABLE:   'bg-green-400',
  BUSY:        'bg-amber-500',
  ENRT:        'bg-yellow-400',
  ARRVD:       'bg-violet-400',
  UNAVAILABLE: 'bg-violet-400',
  OFFDUTY:     'bg-red-600',
};

/* Map status to Tailwind classes for the mobile status button (active state) */
const STATUS_BTN_ACTIVE = {
  AVAILABLE:   'border-green-400 bg-green-400/[0.13] text-green-400',
  BUSY:        'border-amber-500 bg-amber-500/[0.13] text-amber-500',
  ENRT:        'border-yellow-400 bg-yellow-400/[0.13] text-yellow-400',
  ARRVD:       'border-violet-400 bg-violet-400/[0.13] text-violet-400',
  UNAVAILABLE: 'border-violet-400 bg-violet-400/[0.13] text-violet-400',
  OFFDUTY:     'border-red-500 bg-red-500/[0.13] text-red-500',
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
      <div className="h-[var(--menubar-h,36px)] min-h-[var(--menubar-h,36px)] flex items-center bg-app-toolbar border-b border-border-strong shrink-0 select-none p-0 gap-0 overflow-x-hidden">
        {/* Branding */}
        <div className="flex items-center gap-[7px] px-3 h-full border-r border-border-base bg-app-card shrink-0">
          <img
            src="https://cdn.ssrp.us/images/ssrp.png"
            alt="SSRP"
            className="w-[22px] h-[22px] shrink-0 object-contain"
          />
          <div>
            <div className="text-[10px] font-bold text-gold tracking-[0.4px] leading-[1.2]">Sunshine State RP</div>
            <div className="text-[8px] text-cad-muted tracking-[0.5px] uppercase leading-[1.3]">CAD · ECC</div>
          </div>
        </div>

        {/* Desktop navigation */}
        <nav className="flex items-stretch h-full flex-1 overflow-hidden">
          {navItems.map(item => {
            const active = isActive(item.route);
            return (
              <button
                key={item.route}
                onClick={() => go(item.route)}
                className={`flex items-center gap-1 px-[11px] h-full border-none shrink-0 text-[11px] tracking-[0.2px] transition-colors whitespace-nowrap font-ui cursor-pointer
                  ${active
                    ? 'bg-app-selected border-b-2 border-sky-600 text-white font-bold'
                    : 'bg-transparent border-b-2 border-transparent text-cad-dim font-medium hover:bg-white/[0.06] hover:text-cad-text'}`}
              >
                {item.label}
                {item.route === '/cad' && p1Count > 0 && (
                  <span className="ml-1 px-[3px] text-[7px] font-mono bg-red-950 text-red-400 border border-red-900 font-bold leading-[12px]">
                    {p1Count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: desktop stats + clock, then hamburger (always last) */}
        <div className="flex items-stretch gap-0 ml-auto shrink-0">
          {p1Count > 0 && (
            <div className="flex items-center px-2.5 text-[9px] font-mono text-red-400 animate-pulse-red border-l border-border-base shrink-0">
              ▲ P1: {p1Count}
            </div>
          )}
          <div className="flex items-center px-2.5 text-[9px] font-mono text-cad-muted border-l border-border-base shrink-0">
            ACTIVE: <span className="text-cad-data ml-1">{activeCalls}</span>
          </div>
          <div className="flex items-center px-2.5 text-[9px] font-mono text-cad-muted border-l border-border-base shrink-0">
            ON DUTY: <span className="text-cad-data ml-1">{onDuty}</span>
          </div>
          <div className="flex items-center gap-[5px] px-2.5 text-[9px] font-mono text-cad-muted border-l border-border-base shrink-0">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT_COLOR[myStatus] || 'bg-[#2e4258]'}`} />
            <span className="text-cad-dim">{me?.badge || '—'} · {me?.deptShort || '—'}</span>
          </div>
          <Clock />
          {/* Hamburger — lives here so it's always on the far right */}
          <button
            className="cad-mobile-toggle border-l border-border-strong ml-0"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Open navigation"
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
            <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" className="w-[22px] h-[22px]" />
            <div className="flex-1">
              <div className="text-[11px] font-bold text-[#c8a050] tracking-[0.3px]">Sunshine State RP</div>
              <div className="text-[9px] text-cad-muted">
                {me?.name} · {me?.badge} · {me?.deptShort}
              </div>
            </div>
            <button className="cad-mobile-nav-close" onClick={() => setMobileOpen(false)}>✕</button>
          </div>

          {/* My call indicator */}
          <div className="flex items-center gap-1.5 px-3.5 py-2 bg-[#040c18] border-b border-border-faint text-[11px] font-mono text-cad-muted">
            <span>MY CALL:</span>
            <span className={`font-bold ${myCall ? 'text-amber-400' : 'text-cad-muted'}`}>
              {myCall ? myCall.id : 'UNASSIGNED'}
            </span>
            {myCall && <span className="text-cad-dim text-[10px]">· {myCall.nature}</span>}
          </div>

          {/* Status quick-set */}
          <div className="px-3.5 py-2 bg-[#040c18] border-b border-border-base">
            <div className="text-[9px] font-mono text-cad-muted mb-1.5 uppercase tracking-[0.5px]">
              Set Status
            </div>
            <div className="flex gap-[5px] flex-wrap">
              {[
                { status: 'AVAILABLE',   label: 'AVL'   },
                { status: 'ENRT',        label: 'ENRT'  },
                { status: 'BUSY',        label: 'BUSY'  },
                { status: 'ARRVD',       label: 'ARRVD' },
                { status: 'UNAVAILABLE', label: 'UNAVL' },
                { status: 'OFFDUTY',     label: 'OFD'   },
              ].map(s => {
                const active = myStatus === s.status;
                return (
                  <button
                    key={s.status}
                    onClick={() => setStatus(s.status)}
                    className={`h-8 px-3 text-[10px] font-mono font-bold tracking-[0.5px] uppercase rounded-[3px] cursor-pointer border transition-colors
                      ${active
                        ? STATUS_BTN_ACTIVE[s.status] || 'border-sky-500 bg-sky-500/[0.13] text-sky-400'
                        : 'border-border-base bg-app-card text-cad-muted'}`}
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
              className="cad-mobile-nav-item text-sky-300 border-b border-border-base font-semibold"
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
                <span className="ml-2 px-[5px] py-px text-[9px] bg-red-950 text-red-400 font-bold">
                  P1: {p1Count}
                </span>
              )}
            </button>
          ))}

          {/* Live stats */}
          <div className="flex gap-4 px-3.5 py-2 bg-[#030810] border-t border-border-base text-[10px] font-mono text-cad-muted">
            <span>ACTIVE: <span className="text-cad-data">{activeCalls}</span></span>
            <span>ON DUTY: <span className="text-green-400">{onDuty}</span></span>
          </div>

          {/* Sign out */}
          <button
            className="cad-mobile-nav-item text-cad-muted bg-[#030810]"
            onClick={() => { dispatch({ type: 'LOGOUT' }); setMobileOpen(false); }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
