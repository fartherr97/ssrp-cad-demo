import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCAD } from '../../store/cadStore';
import { useToast } from '../../contexts/ToastContext';
import { useMountTransition } from '../ui/Modal';
import { STATUS_COLORS, BUSINESS_STATUSES, DEFAULT_BUSINESS_STATUS } from '../../constants/statusColors';
import { PORTALS, DEFAULT_PORTAL } from '../../constants/portals';
import { templatesForPortal } from '../../utils/templateScope';
import { useActiveBusiness } from '../../contexts/BusinessContext';
import {
  MdLogout, MdAccountCircle,
  MdCheckCircle, MdDirectionsCar, MdWarningAmber, MdLocationOn,
  MdDoNotDisturb, MdPowerSettingsNew, MdHome, MdSos, MdPerson, MdExpandMore,
  MdMenu, MdClose, MdCircle, MdInbox, MdNotifications, MdNotificationsNone,
  MdStorefront,
} from 'react-icons/md';

// Icons matched to standard status codes; custom admin codes fall back to a dot.
const STATUS_ICONS = {
  AVAILABLE:   MdCheckCircle,
  ENRT:        MdDirectionsCar,
  BUSY:        MdWarningAmber,
  ARRVD:       MdLocationOn,
  UNAVAILABLE: MdDoNotDisturb,
  OFFDUTY:     MdPowerSettingsNew,
};

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

/* Primary nav button * stacked icon + label */
function NavBtn({ Icon: IconComp, label, onClick, active, refCb, onMouseEnter, onMouseLeave }) {
  return (
    <button
      ref={refCb}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={label}
      className={`group relative flex flex-col items-center justify-center gap-1 px-3.5 py-1.5 min-w-[64px] rounded-lg cursor-pointer transition-all duration-75 font-ui
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

/* Dropdown nav button * hover to open a template picker */
function DropdownNav({ Icon: IconComp, label, items, active, navigate }) {
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
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
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
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-[12.5px] font-medium text-slate-200 cursor-pointer transition-all duration-75 hover:-translate-y-0.5 hover:bg-white/[0.07] hover:text-white"
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

/* ─── User chip with dropdown (status, panic, profile, portal, sign-out) ─── */
function UserChip({ currentUser, portal, me, myStatus, statusOptions, bizStatus, bizStatusOptions = [], canSetBizStatus, setBizStatus, dispatch, navigate, isActive }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const [hoveredStatus, setHoveredStatus] = useState(null);
  const ref = useRef(null);
  const menuRef = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const MENU_W = 260;
  const place = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setCoords({ left: Math.max(8, r.right - MENU_W), top: r.bottom + 4 });
    }
  };
  const doClose = () => { setOpen(false); if (__navDropdownCloser === setOpen) __navDropdownCloser = null; };
  const openMenu = () => {
    clearTimeout(closeTimer.current);
    if (__navDropdownCloser && __navDropdownCloser !== setOpen) __navDropdownCloser(false);
    __navDropdownCloser = setOpen;
    place();
    setOpen(true);
  };
  const scheduleClose = () => { closeTimer.current = setTimeout(doClose, 80); };
  const toggle = () => open ? doClose() : openMenu();

  // Dot color depends on portal: civilians are always "online" green, businesses
  // reflect their operational status, everyone else uses their officer status.
  const bizDot = bizStatusOptions.find(s => s.code === bizStatus)?.color;
  const dot = portal.id === 'civilian' ? '#4ade80'
    : portal.id === 'business' ? (bizDot || '#94a3b8')
    : (statusOptions.find(s => s.code === myStatus)?.color || STATUS_COLORS[myStatus] || '#94a3b8');

  const setStatus = (s) => {
    dispatch({ type: 'SET_STATUS', payload: s });
    const opt = statusOptions.find(o => o.code === s);
    toast.info(`Status set to ${opt?.label || s}`, { color: opt?.color });
  };
  const setBusinessStatus = (code) => {
    setBizStatus?.(code);
    const opt = bizStatusOptions.find(o => o.code === code);
    toast.info(`Business status set to ${opt?.label || code}`, { color: opt?.color });
  };
  const triggerPanic = () => {
    const mockCoords = [
      { x:  428,  y:  -980, z:  30, area: 'Mission Row'    },
      { x: -640,  y:  -820, z:  23, area: 'Del Perro'      },
      { x: 1960,  y:  3740, z:  32, area: 'Sandy Shores'   },
      { x: -2000, y:   700, z: 140, area: 'Vinewood Hills' },
      { x:  120,  y: -1630, z:  30, area: 'Strawberry'     },
      { x: -1034, y: -2733, z:  20, area: 'LSIA'           },
      { x: -140,  y:  6280, z:  31, area: 'Paleto Bay'     },
      { x: 1140,  y:  2660, z:  45, area: 'Route 68'       },
    ];
    const c = mockCoords[Math.floor(Math.random() * mockCoords.length)];
    const unit = me?.unitId || currentUser?.badge || 'UNIT';
    const location = me?.location || c.area;
    dispatch({
      type: 'PANIC',
      payload: {
        officerId: me?.id,
        unit,
        name: me?.name || currentUser?.name,
        location,
        x: c.x, y: c.y, z: c.z,
      },
    });
    toast.error(`${unit} · ${location}`, { title: 'PANIC · Officer in Distress' });
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref} onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <button
        onClick={toggle}
        className="flex items-center gap-2.5 pl-2 pr-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-75 hover:bg-white/[0.05] border border-transparent hover:border-border-base"
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
        <MdExpandMore size={16} className={`text-slate-500 transition-transform duration-75 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
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
                {statusOptions.map(s => {
                  const on = myStatus === s.code;
                  const hov = hoveredStatus === s.code;
                  const c = s.color;
                  const lit = on || hov;
                  const Icon = s.Icon;
                  return (
                    <button key={s.code} onClick={() => setStatus(s.code)}
                      onMouseEnter={() => setHoveredStatus(s.code)}
                      onMouseLeave={() => setHoveredStatus(null)}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all duration-75 border"
                      style={lit
                        ? { background: `${c}22`, borderColor: `${c}55`, color: c }
                        : { borderColor: 'transparent', color: '#94a3b8' }
                      }
                    >
                      <Icon size={14} style={{ color: lit ? c : '#94a3b8', transition: 'color 0.075s' }} />
                      {s.label}
                    </button>
                  );
                })}
              </div>
              <button onClick={triggerPanic}
                className="w-full flex items-center justify-center gap-2 px-2.5 py-2 mb-1 rounded-lg text-[12px] font-bold text-white bg-red-600 hover:bg-red-500 cursor-pointer transition-colors animate-pulse-red">
                <MdSos size={16} /> PANIC · Officer in Distress
              </button>
              <div className="h-px bg-border-faint my-1 mx-1" />
            </>
          )}

          {/* Business operational status — owner-settable */}
          {portal.id === 'business' && canSetBizStatus && (
            <>
              <div className="px-2.5 pt-1.5 pb-1 text-[9px] font-bold uppercase tracking-[0.6px] text-slate-600">Business Status</div>
              <div className="grid grid-cols-2 gap-1 px-1 pb-1.5">
                {bizStatusOptions.map(s => {
                  const on = bizStatus === s.code;
                  const hov = hoveredStatus === s.code;
                  const c = s.color;
                  const lit = on || hov;
                  return (
                    <button key={s.code} onClick={() => setBusinessStatus(s.code)}
                      onMouseEnter={() => setHoveredStatus(s.code)}
                      onMouseLeave={() => setHoveredStatus(null)}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all duration-75 border"
                      style={lit
                        ? { background: `${c}22`, borderColor: `${c}55`, color: c }
                        : { borderColor: 'transparent', color: '#94a3b8' }
                      }
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c }} />
                      {s.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-px bg-border-faint my-1 mx-1" />
            </>
          )}

          {(() => {
            const profileRoute = portal.id === 'civilian' ? '/portal/account'
              : portal.id === 'business' ? '/portal/employee-profile'
              : '/profile';
            const profileLabel = portal.id === 'civilian' ? 'My Account' : 'My Profile';
            return (
              <button onClick={() => { navigate(profileRoute); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium cursor-pointer transition-all duration-75 hover:-translate-y-0.5 hover:bg-white/[0.06] ${isActive(profileRoute) ? 'text-brand-bright' : 'text-slate-300 hover:text-white'}`}>
                <MdPerson size={16} /> {profileLabel}
              </button>
            );
          })()}
          <button onClick={() => { navigate('/messages'); setOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium cursor-pointer transition-all duration-75 hover:-translate-y-0.5 hover:bg-white/[0.06] ${isActive('/messages') ? 'text-brand-bright' : 'text-slate-300 hover:text-white'}`}>
            <MdInbox size={16} /> Messages
          </button>
          <button onClick={() => { dispatch({ type: 'EXIT_TO_HOME' }); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium text-slate-300 hover:text-white cursor-pointer transition-all duration-75 hover:-translate-y-0.5 hover:bg-white/[0.06]">
            <MdHome size={16} /> Switch Portal
          </button>
          <button onClick={() => dispatch({ type: 'LOGOUT' })}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium text-red-400 hover:text-red-300 cursor-pointer transition-all duration-75 hover:-translate-y-0.5 hover:bg-red-500/10">
            <MdLogout size={16} /> Sign Out
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ─── Notification Bell ─── */
function NotificationBell({ notifications, dispatch, navigate }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const ref = useRef(null);
  const menuRef = useRef(null);
  const closeTimer = useRef(null);
  const PANEL_W = 320;

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const place = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      const mobile = window.innerWidth < 640;
      if (mobile) {
        setCoords({ left: 8, right: 8, top: r.bottom + 6, mobile: true });
      } else {
        setCoords({ left: Math.max(8, r.right - PANEL_W), top: r.bottom + 4, mobile: false });
      }
    }
  };
  const doClose = () => setOpen(false);
  const openPanel = () => {
    clearTimeout(closeTimer.current);
    if (__navDropdownCloser && __navDropdownCloser !== setOpen) __navDropdownCloser(false);
    __navDropdownCloser = setOpen;
    place();
    setOpen(true);
    dispatch({ type: 'MARK_NOTIFICATIONS_READ' });
  };
  const scheduleClose = () => { closeTimer.current = setTimeout(doClose, 80); };
  const toggle = () => (open ? doClose() : openPanel());

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={ref} onMouseEnter={() => { clearTimeout(closeTimer.current); }} onMouseLeave={scheduleClose}>
      <button
        onClick={toggle}
        title="Notifications"
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 cursor-pointer transition-colors"
      >
        {unread > 0 ? <MdNotifications size={20} /> : <MdNotificationsNone size={20} />}
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          onMouseEnter={() => clearTimeout(closeTimer.current)}
          onMouseLeave={scheduleClose}
          className="fixed z-[3000] bg-app-card border border-border-strong shadow-2xl shadow-black/60 rounded-xl flex flex-col overflow-hidden"
          style={{
            left: coords.left,
            top: coords.top,
            ...(coords.mobile ? { right: coords.right } : { width: PANEL_W }),
            maxHeight: 'min(420px, calc(100dvh - var(--actionbar-h, 64px) - 24px))',
            animation: 'dropdownFadeIn 0.13s ease-out',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border-faint shrink-0">
            <span className="text-[12px] font-bold text-white">Notifications</span>
            {notifications.length > 0 && (
              <button
                onClick={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })}
                className="text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                style={{ background: 'none', border: 'none' }}
              >
                Clear all
              </button>
            )}
          </div>
          {/* Body */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 px-4 text-slate-600">
                <MdNotificationsNone size={28} className="opacity-40" />
                <span className="text-[12px]">No notifications</span>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={n.link ? () => { doClose(); navigate?.(n.link); } : undefined}
                  className={`flex gap-3 px-3 py-2.5 rounded-xl border transition-colors ${n.link ? 'cursor-pointer hover:border-white/20' : ''}`}
                  style={{
                    background: n.read ? 'rgba(255,255,255,0.02)' : `${n.color || '#3a88e8'}0f`,
                    borderColor: n.read ? 'rgba(255,255,255,0.07)' : `${n.color || '#3a88e8'}35`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full mt-[5px] shrink-0" style={{ background: n.color || '#3a88e8' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-white leading-tight">{n.title}</div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-3">{n.body}</div>
                    {n.sender && (
                      <div className="text-[11px] text-slate-500 mt-1 font-medium">* {n.sender}</div>
                    )}
                    <div className="text-[10px] text-slate-600 mt-1">{n.time}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DISMISS_NOTIFICATION', payload: n.id }); }}
                    title="Dismiss"
                    className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.08] cursor-pointer transition-colors"
                    style={{ background: 'none', border: 'none' }}
                  >
                    <MdClose size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default function ActionBar() {
  const { state, dispatch } = useCAD();
  const { currentUser, officers, reportTemplates, recordTemplates, unitStatusCodes = [], businesses = [], notifications = [] } = state;
  const statusOptions = unitStatusCodes.map(s => ({ ...s, Icon: STATUS_ICONS[s.code] || MdCircle }));
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawer = useMountTransition(mobileOpen, 240);

  // For unambiguous routes, derive portal from URL so browser back/forward shows the correct subtitle
  const PATH_PORTAL_MAP = [
    ['/portal/civilian',    'civilian'],
    ['/portal/characters',  'civilian'],
    ['/portal/vehicles',    'civilian'],
    ['/portal/licenses',    'civilian'],
    ['/portal/file-report', 'civilian'],
    ['/portal/complaint',   'civilian'],
    ['/portal/business',    'business'],
    ['/portal/my-business', 'business'],
    ['/portal/employees',   'business'],
    ['/fire',               'fire'],
  ];
  const pathPortalId = (PATH_PORTAL_MAP.find(([p]) => location.pathname.startsWith(p)) || [])[1];
  const portal = PORTALS[pathPortalId || currentUser?.portal] || PORTALS[DEFAULT_PORTAL];
  const me       = officers.find(o => o.id === currentUser?.id);
  const myStatus = me?.status || 'OFFDUTY';

  // Business portal: the user-chip dot + status selector reflect the active
  // business's operational status (owner-settable).
  const { activeBiz, isOwner: isBizOwner } = useActiveBusiness();
  const bizStatus = activeBiz?.opStatus || DEFAULT_BUSINESS_STATUS;
  const setBizStatus = (code) => {
    if (!activeBiz) return;
    dispatch({ type: 'UPDATE_BUSINESS', payload: { id: activeBiz.id, opStatus: code } });
  };

  const go       = (route) => { navigate(route); setMobileOpen(false); };
  const isActive = (route) => location.pathname === route || location.pathname.startsWith(route + '/');

  // Close the mobile drawer on any navigation (including same-path query param changes)
  useEffect(() => { setMobileOpen(false); }, [location.key]);

  const dropdownItems = (kind) => {
    if (kind === 'reports') {
      return templatesForPortal(reportTemplates || [], portal.id).map(t => ({
        ...t, route: `/forms?open=${encodeURIComponent(t.name)}`,
      }));
    }
    if (kind === 'records') {
      return templatesForPortal(recordTemplates || [], portal.id).map(t => ({
        ...t, route: `/records?open=${encodeURIComponent(t.name)}`,
      }));
    }
    return [];
  };

  const hasTowBiz = portal.id === 'business' && businesses.some(b =>
    b.isTowCompany && (
      b.ownedByPlayer ||
      (currentUser?.discordId && b.ownerDiscordId === currentUser.discordId) ||
      (currentUser?.discordId && b.employees?.some(e => e.discordId === currentUser.discordId))
    )
  );

  const navItems = [...portal.nav, ...(portal.adminNav || [])].filter(item => {
    if (item.route === '/tow-cad' && portal.id === 'business') return hasTowBiz;
    return true;
  });

  return (
    <div className="cad-actionbar flex items-center gap-1 px-3 bg-app-toolbar/80 backdrop-blur-md border-b border-border-base">

      {/* ── Brand (click to return to portal-selection screen) ── */}
      <button
        type="button"
        onClick={() => { dispatch({ type: 'EXIT_TO_HOME' }); setMobileOpen(false); }}
        title="Back to portal selection"
        className="flex items-center gap-2.5 pr-3 lg:pr-4 mr-1 lg:border-r border-border-base shrink-0 select-none cursor-pointer bg-transparent border-none rounded-lg hover:opacity-90 transition-opacity">
        <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP"
          className="w-8 h-8 lg:w-9 lg:h-9 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(61,130,240,0.35)]" />
        <div className="leading-[1.15] whitespace-nowrap text-left">
          <div className="text-[15px] lg:text-[16px] font-extrabold tracking-[-0.3px] text-white">
            Sunshine State <span style={{ color: '#f2800d' }}>RP</span>
          </div>
          <div className="text-[9px] font-bold tracking-[1.2px] uppercase text-slate-500">{portal.subtitle || portal.label}</div>
        </div>
      </button>

      {/* ── Desktop portal nav ── */}
      <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto n-tabs-wrap">
        {navItems.map(item =>
          item.dropdown ? (
            <DropdownNav key={item.route} Icon={item.Icon} label={item.label}
              items={dropdownItems(item.dropdown)} active={isActive(item.route)} navigate={go} />
          ) : (
            <NavBtn key={item.route} Icon={item.Icon} label={item.label}
              onClick={() => go(item.route)} active={isActive(item.route)} />
          )
        )}
      </nav>

      {/* ── Far right: clock + search + user + mobile menu ── */}
      <div className="ml-auto flex items-center shrink-0 pl-2">
        <div className="hidden md:flex"><Clock /></div>
        <div className="hidden sm:block w-px h-8 bg-border-base mx-1" />
        <NotificationBell
          notifications={notifications.filter(n => !n.recipientBadge || n.recipientBadge === currentUser?.badge)}
          dispatch={dispatch} navigate={navigate} />
        <UserChip currentUser={currentUser} portal={portal} me={me} myStatus={myStatus} statusOptions={statusOptions}
          bizStatus={bizStatus} bizStatusOptions={BUSINESS_STATUSES} canSetBizStatus={isBizOwner} setBizStatus={setBizStatus}
          dispatch={dispatch} navigate={navigate} isActive={isActive} />
        {/* Hamburger (mobile/tablet) */}
        <button onClick={() => setMobileOpen(o => !o)}
          className="press lg:hidden relative flex items-center justify-center w-10 h-10 ml-1 rounded-lg text-slate-300 hover:bg-white/[0.06] cursor-pointer transition-colors"
          aria-label="Menu">
          <MdMenu size={22}
            className="absolute transition-all duration-200"
            style={{ opacity: mobileOpen ? 0 : 1, transform: mobileOpen ? 'rotate(-90deg) scale(0.7)' : 'rotate(0) scale(1)' }} />
          <MdClose size={22}
            className="absolute transition-all duration-200"
            style={{ opacity: mobileOpen ? 1 : 0, transform: mobileOpen ? 'rotate(0) scale(1)' : 'rotate(90deg) scale(0.7)' }} />
        </button>
      </div>

      {/* ── Mobile nav drawer ── */}
      {drawer.mounted && createPortal(
        <div className="lg:hidden fixed inset-0 z-[2500]">
          <div
            className={`absolute inset-0 bg-black/55 backdrop-blur-sm ${drawer.show ? 'anim-overlay-in' : 'anim-overlay-out'}`}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={`absolute left-0 right-0 bg-app-card border-b border-border-strong shadow-2xl shadow-black/60 flex flex-col ${drawer.show ? 'anim-drawer-in' : 'anim-drawer-out'}`}
            style={{ top: 'var(--actionbar-h)', height: 'calc(100dvh - var(--actionbar-h))' }}
          >
            {/* Brand header (click to return to portal-selection screen) */}
            <button
              type="button"
              onClick={() => { dispatch({ type: 'EXIT_TO_HOME' }); setMobileOpen(false); }}
              className="flex items-center gap-2.5 px-5 py-4 border-b border-border-faint shrink-0 w-full text-left bg-transparent cursor-pointer hover:bg-white/[0.03] transition-colors">
              <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" className="w-8 h-8 shrink-0 object-contain" />
              <div className="leading-[1.15]">
                <div className="text-[15px] font-extrabold text-white">
                  Sunshine State <span style={{ color: '#f2800d' }}>RP</span>
                </div>
                <div className="text-[9px] font-bold tracking-[1.1px] uppercase text-slate-500">Computer Aided Dispatch</div>
              </div>
            </button>

            {/* Flat grouped list * scrolls independently, items stagger in */}
            <div className="flex-1 overflow-y-auto py-3">
              {navItems.map((item, idx) => {
                const subItems = item.dropdown ? dropdownItems(item.dropdown) : null;

                if (subItems) {
                  return (
                    <div key={item.route} className={drawer.show ? 'stagger-item' : ''} style={{ '--i': idx }}>
                      <div className="flex items-center gap-2 px-5 pt-4 pb-1.5">
                        <item.Icon size={13} className="shrink-0 text-slate-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[1px] text-slate-500">{item.label}</span>
                      </div>
                      {subItems.length === 0 ? (
                        <div className="px-5 py-2 text-[12px] text-slate-600 italic">No templates yet</div>
                      ) : subItems.map(sub => (
                        <button key={sub.id} onClick={() => go(sub.route)}
                          className="press-sm w-full text-left px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-white/[0.05] active:bg-white/[0.08] cursor-pointer transition-colors border-none bg-transparent">
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  );
                }

                const on = isActive(item.route);
                return (
                  <button key={item.route} onClick={() => go(item.route)}
                    style={{ '--i': idx }}
                    className={`press-sm w-full flex items-center gap-3 px-5 py-3 text-[14px] font-semibold cursor-pointer transition-colors border-none bg-transparent
                      ${drawer.show ? 'stagger-item' : ''}
                      ${on ? 'text-brand-bright' : 'text-white hover:bg-white/[0.05] active:bg-white/[0.08]'}`}>
                    {on && <span className="w-1 h-5 rounded-full bg-brand shrink-0 -ml-1" />}
                    <item.Icon size={18} className="shrink-0 text-slate-400" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Footer * always pinned at bottom */}
            <div className="shrink-0 border-t border-border-faint px-4 py-3 flex gap-2">
              <button onClick={() => { dispatch({ type: 'EXIT_TO_HOME' }); setMobileOpen(false); }}
                className="press flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-slate-300 text-[13px] font-semibold cursor-pointer hover:bg-white/[0.09] transition-all">
                <MdHome size={16} /> Switch Portal
              </button>
              <button onClick={() => dispatch({ type: 'LOGOUT' })}
                className="press flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[13px] font-semibold cursor-pointer hover:bg-red-500/20 transition-all">
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
