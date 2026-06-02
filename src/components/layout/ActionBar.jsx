import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCAD } from '../../store/cadStore';
import { STATUS_COLORS } from '../../constants/statusColors';
import { PORTALS, DEFAULT_PORTAL } from '../../constants/portals';
import {
  MdLogout, MdAccountCircle,
  MdCheckCircle, MdDirectionsCar, MdWarningAmber, MdLocationOn,
  MdDoNotDisturb, MdPowerSettingsNew, MdHome, MdSos, MdPerson, MdExpandMore,
  MdMenu, MdClose,
} from 'react-icons/md';

/* ─── Clock (date over time) ─── */
function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const p = n => String(n).padStart(2, '0');
  const date = `${p(now.getMonth() + 1)}/${p(now.getDate())}/${now.getFullYear()}`;
  const time = `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
  return (
    <div className="flex flex-col items-end justify-center px-4 leading-tight shrink-0 whitespace-nowrap">
      <span className="text-[12px] font-semibold text-slate-300 tabular-nums">{date}</span>
      <span className="text-[13px] font-bold font-mono text-brand-bright tabular-nums tracking-[0.5px]">{time}</span>
    </div>
  );
}

/* Primary nav button — stacked icon + label */
function NavBtn({ Icon: IconComp, label, onClick, active, dataTour, refCb, onMouseEnter, onMouseLeave }) {
  return (
    <button
      ref={refCb}
      onClick={onClick}
      data-tour={dataTour}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={label}
      className={`group relative flex flex-col items-center justify-center gap-1 px-3.5 py-1.5 min-w-[64px] rounded-lg cursor-pointer transition-all font-ui
        ${active
          ? 'bg-brand/15 text-brand-bright'
          : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'}`}
    >
      <IconComp size={21} />
      <span className="text-[10px] font-semibold tracking-[0.3px] whitespace-nowrap leading-none">{label}</span>
      {active && <span className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 h-[3px] w-7 rounded-full bg-brand" />}
    </button>
  );
}

/* Only one nav dropdown may be open at a time (prevents overlap). */
let __navDropdownCloser = null;

/* Dropdown nav button — hover to open a template picker */
function DropdownNav({ Icon: IconComp, label, items, active, navigate, dataTour }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const place = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setCoords({ left: r.left, top: r.bottom + 4 });
    }
  };
  const doClose = () => { setOpen(false); if (__navDropdownCloser === setOpen) __navDropdownCloser = null; };
  const openMenu = () => {
    clearTimeout(closeTimer.current);
    // Immediately close any other open dropdown so two can't overlap.
    if (__navDropdownCloser && __navDropdownCloser !== setOpen) __navDropdownCloser(false);
    __navDropdownCloser = setOpen;
    place();
    setOpen(true);
  };
  const scheduleClose = () => { closeTimer.current = setTimeout(doClose, 25); };

  return (
    <div className="relative" data-tour={dataTour} onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <NavBtn Icon={IconComp} label={label} active={active || open} refCb={btnRef}
        onClick={() => (open ? setOpen(false) : openMenu())} />
      {open && createPortal(
        <div
          ref={menuRef}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
          className="fixed z-[3000] bg-app-card border border-border-strong shadow-2xl shadow-black/60 rounded-xl min-w-[230px] p-1.5"
          style={{ left: coords.left, top: coords.top, animation: 'dropdownFadeIn 0.13s ease-out' }}
        >
          {items.length === 0 && (
            <div className="px-3 py-3 text-[11px] text-slate-600 italic">No templates yet</div>
          )}
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => { navigate(item.route); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-[12.5px] font-medium text-slate-200 cursor-pointer transition-all duration-100 hover:-translate-y-px hover:bg-white/[0.07] hover:text-white"
            >
              {item.name}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

const STATUS_BTNS = [
  { status: 'AVAILABLE',   label: 'Available',   Icon: MdCheckCircle      },
  { status: 'ENRT',        label: 'En Route',    Icon: MdDirectionsCar    },
  { status: 'BUSY',        label: 'Busy',        Icon: MdWarningAmber     },
  { status: 'ARRVD',       label: 'On Scene',    Icon: MdLocationOn       },
  { status: 'UNAVAILABLE', label: 'Unavailable', Icon: MdDoNotDisturb     },
  { status: 'OFFDUTY',     label: 'Off Duty',    Icon: MdPowerSettingsNew },
];

/* ─── User chip with dropdown (status, panic, profile, portal, sign-out) ─── */
function UserChip({ currentUser, portal, me, myStatus, dispatch, navigate, isActive }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const ref = useRef(null);
  const menuRef = useRef(null);

  const MENU_W = 260;
  const toggle = () => {
    if (open) { setOpen(false); return; }
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setCoords({ left: Math.max(8, r.right - MENU_W), top: r.bottom + 8 });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const h = e => {
      if (!ref.current?.contains(e.target) && !menuRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const dot = STATUS_COLORS[myStatus] || '#94a3b8';
  const setStatus = (s) => { dispatch({ type: 'SET_STATUS', payload: s }); };
  const triggerPanic = () => {
    dispatch({
      type: 'PANIC',
      payload: {
        officerId: me?.id,
        unit: me?.unitId || currentUser?.badge || 'UNIT',
        name: me?.name || currentUser?.name,
        location: me?.location || 'LOCATION UNKNOWN',
      },
    });
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref} data-tour="account">
      <button
        onClick={toggle}
        className="flex items-center gap-2.5 pl-2 pr-2.5 py-1.5 rounded-lg cursor-pointer transition-all hover:bg-white/[0.05] border border-transparent hover:border-border-base"
      >
        <span className="relative shrink-0">
          <MdAccountCircle size={32} className="text-slate-500" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-app-bg"
            style={{ background: dot }} />
        </span>
        <span className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-[13px] font-bold text-white whitespace-nowrap">{currentUser?.name || 'Officer'}</span>
          <span className="text-[10.5px] text-slate-500 whitespace-nowrap">
            {currentUser?.badge ? `Badge #${currentUser.badge}` : portal.label}
          </span>
        </span>
        <MdExpandMore size={16} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[3000] bg-app-card border border-border-strong shadow-2xl shadow-black/60 rounded-xl w-[260px] p-1.5"
          style={{ left: coords.left, top: coords.top, animation: 'dropdownFadeIn 0.13s ease-out' }}
        >
          {/* header */}
          <div className="flex items-center gap-3 px-2.5 py-2.5 mb-1 border-b border-border-faint">
            <MdAccountCircle size={36} className="text-slate-500 shrink-0" />
            <div className="leading-tight min-w-0">
              <div className="text-[13px] font-bold text-white truncate">{currentUser?.name || 'Officer'}</div>
              <div className="text-[11px] font-semibold" style={{ color: portal.color }}>{portal.label}</div>
            </div>
          </div>

          {portal.showStatus && (
            <>
              <div className="px-2.5 pt-1.5 pb-1 text-[9px] font-bold uppercase tracking-[0.6px] text-slate-600">Set Status</div>
              <div className="grid grid-cols-2 gap-1 px-1 pb-1.5">
                {STATUS_BTNS.map(s => {
                  const on = myStatus === s.status;
                  const c = STATUS_COLORS[s.status];
                  return (
                    <button key={s.status} onClick={() => setStatus(s.status)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all border ${on ? '' : 'border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'}`}
                      style={on ? { background: `${c}22`, borderColor: `${c}55`, color: c } : undefined}
                    >
                      <s.Icon size={14} style={on ? { color: c } : undefined} />
                      {s.label}
                    </button>
                  );
                })}
              </div>
              <button onClick={triggerPanic}
                className="w-full flex items-center justify-center gap-2 px-2.5 py-2 mb-1 rounded-lg text-[12px] font-bold text-white bg-red-600 hover:bg-red-500 cursor-pointer transition-colors animate-pulse-red">
                <MdSos size={16} /> PANIC — Officer in Distress
              </button>
              <div className="h-px bg-border-faint my-1 mx-1" />
            </>
          )}

          <button onClick={() => { navigate('/profile'); setOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium cursor-pointer transition-colors hover:bg-white/[0.06] ${isActive('/profile') ? 'text-brand-bright' : 'text-slate-300 hover:text-white'}`}>
            <MdPerson size={16} /> My Profile
          </button>
          <button onClick={() => { dispatch({ type: 'EXIT_TO_HOME' }); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium text-slate-300 hover:text-white cursor-pointer transition-colors hover:bg-white/[0.06]">
            <MdHome size={16} /> Switch Portal
          </button>
          <button onClick={() => dispatch({ type: 'LOGOUT' })}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium text-red-400 hover:text-red-300 cursor-pointer transition-colors hover:bg-red-500/10">
            <MdLogout size={16} /> Sign Out
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

export default function ActionBar() {
  const { state, dispatch } = useCAD();
  const { currentUser, officers, reportTemplates, recordTemplates } = state;
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const portal = PORTALS[currentUser?.portal] || PORTALS[DEFAULT_PORTAL];
  const me       = officers.find(o => o.id === currentUser?.id);
  const myStatus = me?.status || 'OFFDUTY';

  const go       = (route) => { navigate(route); setMobileOpen(false); };
  const isActive = (route) => location.pathname === route || location.pathname.startsWith(route + '/');

  // Close the mobile drawer on any navigation (including same-path query param changes)
  useEffect(() => { setMobileOpen(false); }, [location.key]);

  const dropdownItems = (kind) => {
    if (kind === 'reports') {
      return (reportTemplates || []).map(t => ({
        ...t, route: `/forms?open=${encodeURIComponent(t.name)}`,
      }));
    }
    if (kind === 'records') {
      return (recordTemplates || []).map(t => ({
        ...t, route: `/records?open=${encodeURIComponent(t.name)}`,
      }));
    }
    return [];
  };

  const navItems = [...portal.nav, ...(portal.adminNav || [])];

  return (
    <div className="cad-actionbar flex items-center gap-1 px-3 bg-app-toolbar/80 backdrop-blur-md border-b border-border-base">

      {/* ── Brand ── */}
      <div className="flex items-center gap-2.5 pr-3 lg:pr-4 mr-1 lg:border-r border-border-base shrink-0 select-none">
        <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP"
          className="w-8 h-8 lg:w-9 lg:h-9 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(61,130,240,0.35)]" />
        <div className="leading-[1.15] whitespace-nowrap">
          <div className="text-[15px] lg:text-[16px] font-extrabold tracking-[-0.3px] text-white">
            Sunshine State <span style={{ color: '#f2800d' }}>RP</span>
          </div>
          <div className="text-[9px] font-bold tracking-[1.2px] uppercase text-slate-500">Computer Aided Dispatch</div>
        </div>
      </div>

      {/* ── Desktop portal nav ── */}
      <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto n-tabs-wrap">
        {navItems.map(item =>
          item.dropdown ? (
            <DropdownNav key={item.route} Icon={item.Icon} label={item.label}
              items={dropdownItems(item.dropdown)} active={isActive(item.route)} navigate={go}
              dataTour={item.dropdown === 'reports' ? 'reports' : undefined} />
          ) : (
            <NavBtn key={item.route} Icon={item.Icon} label={item.label}
              onClick={() => go(item.route)} active={isActive(item.route)} />
          )
        )}
      </nav>

      {/* ── Far right: clock + user + mobile menu ── */}
      <div className="ml-auto flex items-center shrink-0 pl-2">
        <div className="hidden md:flex"><Clock /></div>
        <div className="hidden sm:block w-px h-8 bg-border-base mx-1" />
        <UserChip currentUser={currentUser} portal={portal} me={me} myStatus={myStatus}
          dispatch={dispatch} navigate={navigate} isActive={isActive} />
        {/* Hamburger (mobile/tablet) */}
        <button onClick={() => setMobileOpen(o => !o)}
          className="lg:hidden flex items-center justify-center w-10 h-10 ml-1 rounded-lg text-slate-300 hover:bg-white/[0.06] cursor-pointer transition-colors"
          aria-label="Menu">
          {mobileOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
        </button>
      </div>

      {/* ── Mobile nav drawer ── */}
      {mobileOpen && createPortal(
        <div className="lg:hidden fixed inset-0 z-[2500]">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div
            className="absolute left-0 right-0 bg-app-card border-b border-border-strong shadow-2xl shadow-black/60 flex flex-col"
            style={{ top: 'var(--actionbar-h)', height: 'calc(100dvh - var(--actionbar-h))', animation: 'expandDown 0.16s ease-out' }}
          >
            {/* Brand header */}
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border-faint shrink-0">
              <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" className="w-8 h-8 shrink-0 object-contain" />
              <div className="leading-[1.15]">
                <div className="text-[15px] font-extrabold text-white">
                  Sunshine State <span style={{ color: '#f2800d' }}>RP</span>
                </div>
                <div className="text-[9px] font-bold tracking-[1.1px] uppercase text-slate-500">Computer Aided Dispatch</div>
              </div>
            </div>

            {/* Flat grouped list — scrolls independently */}
            <div className="flex-1 overflow-y-auto py-3">
              {navItems.map(item => {
                const subItems = item.dropdown ? dropdownItems(item.dropdown) : null;

                if (subItems) {
                  return (
                    <div key={item.route}>
                      <div className="flex items-center gap-2 px-5 pt-4 pb-1.5">
                        <item.Icon size={13} className="shrink-0 text-slate-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[1px] text-slate-500">{item.label}</span>
                      </div>
                      {subItems.length === 0 ? (
                        <div className="px-5 py-2 text-[12px] text-slate-600 italic">No templates yet</div>
                      ) : subItems.map(sub => (
                        <button key={sub.id} onClick={() => go(sub.route)}
                          className="w-full text-left px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-white/[0.05] cursor-pointer transition-colors border-none bg-transparent">
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  );
                }

                const on = isActive(item.route);
                return (
                  <button key={item.route} onClick={() => go(item.route)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-[14px] font-semibold cursor-pointer transition-colors border-none bg-transparent
                      ${on ? 'text-brand-bright' : 'text-white hover:bg-white/[0.05]'}`}>
                    {on && <span className="w-1 h-5 rounded-full bg-brand shrink-0 -ml-1" />}
                    <item.Icon size={18} className="shrink-0 text-slate-400" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Footer — always pinned at bottom */}
            <div className="shrink-0 border-t border-border-faint px-4 py-3 flex gap-2">
              <button onClick={() => { dispatch({ type: 'EXIT_TO_HOME' }); setMobileOpen(false); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-slate-300 text-[13px] font-semibold cursor-pointer hover:bg-white/[0.09] transition-all">
                <MdHome size={16} /> Switch Portal
              </button>
              <button onClick={() => dispatch({ type: 'LOGOUT' })}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[13px] font-semibold cursor-pointer hover:bg-red-500/20 transition-all">
                <MdLogout size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
