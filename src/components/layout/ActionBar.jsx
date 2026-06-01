import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCAD } from '../../store/cadStore';
import { STATUS_COLORS } from '../../constants/statusColors';
import { PORTALS, DEFAULT_PORTAL } from '../../constants/portals';
import {
  MdAddCall, MdPhone, MdPersonAdd, MdLogout, MdAccountCircle,
  MdCheckCircle, MdDirectionsCar, MdWarningAmber, MdLocationOn,
  MdDoNotDisturb, MdPowerSettingsNew, MdHome,
} from 'react-icons/md';

/* ─── Clock ─── */
function Clock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const p = n => String(n).padStart(2, '0');
      setTime(`${p(d.getMonth()+1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center px-3.5 h-full border-l border-[#1a3050] font-mono text-[12px] font-semibold text-sky-400/80 tracking-[0.3px] shrink-0 whitespace-nowrap">
      {time}
    </div>
  );
}

/* Primary icon+label tool button */
function ToolBtn({ Icon: IconComp, label, onClick, active, disabled, title, extraClass = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      className={`flex flex-col items-center justify-center gap-[3px] px-2.5 py-1 min-w-[54px] h-full shrink-0 border-none cursor-pointer transition-all font-ui
        ${active
          ? 'bg-sky-500/15 border-b-2 border-sky-400 text-sky-200'
          : 'bg-transparent border-b-2 border-transparent text-slate-500 hover:bg-white/[0.06] hover:text-slate-400'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${extraClass}`}
    >
      <span className="flex items-center justify-center"><IconComp size={20} /></span>
      <span className="text-[9px] font-bold uppercase tracking-[0.5px] whitespace-nowrap leading-none">{label}</span>
    </button>
  );
}

/* Dropdown nav button — click to open a template picker */
function DropdownBtn({ Icon: IconComp, label, items, active, navigate, onClose }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const ref = useRef(null);
  const btnRef = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = e => {
      if (!ref.current?.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const place = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setCoords({ left: r.left, top: r.bottom });
    }
  };

  const openMenu = () => { clearTimeout(closeTimer.current); place(); setOpen(true); };
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setOpen(false), 120); };
  const toggle = () => { if (open) setOpen(false); else openMenu(); };

  return (
    <div
      className="h-full shrink-0"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        ref={btnRef}
        onClick={toggle}
        className={`flex flex-col items-center justify-center gap-[3px] px-2.5 py-1 min-w-[58px] h-full border-none cursor-pointer transition-all font-ui
          ${active || open
            ? 'bg-sky-500/15 border-b-2 border-sky-400 text-sky-200'
            : 'bg-transparent border-b-2 border-transparent text-slate-500 hover:bg-white/[0.06] hover:text-slate-400'}`}
      >
        <span className="flex items-center justify-center"><IconComp size={20} /></span>
        <span className="text-[9px] font-bold uppercase tracking-[0.5px] whitespace-nowrap leading-none">
          {label}
        </span>
      </button>

      {open && (
        <div
          ref={ref}
          className="fixed z-[200] bg-[#0d1929] border border-[#1f3456] shadow-2xl rounded min-w-[210px] overflow-hidden py-1"
          style={{ left: coords.left, top: coords.top, animation: 'dropdownFadeIn 0.13s ease-out' }}
        >
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.route);
                setOpen(false);
              }}
              className="w-full flex items-center px-3 py-2 text-left text-[12px] font-medium text-white hover:bg-white/[0.07] transition-colors cursor-pointer border-none bg-transparent"
            >
              {item.name}
            </button>
          ))}
          {items.length === 0 && (
            <div className="px-4 py-3 text-[11px] text-slate-600 italic">No templates yet</div>
          )}
        </div>
      )}
    </div>
  );
}

/* Status square button * uses the status color when active */
function StatusBtn({ Icon: IconComp, label, status, myStatus, onClick }) {
  const isActive = myStatus === status;
  const color = STATUS_COLORS[status];
  return (
    <button
      onClick={onClick}
      title={`Set status: ${status}`}
      className={`flex flex-col items-center justify-center gap-1 px-2.5 py-1 min-w-[54px] h-full shrink-0 border-none cursor-pointer transition-all font-ui
        ${isActive ? 'border-b-2' : 'bg-transparent border-b-2 border-transparent text-slate-500 hover:bg-white/[0.06] hover:text-slate-400'}`}
      style={isActive ? {
        background: `${color}1a`,
        borderBottom: `2px solid ${color}`,
        color: color,
      } : undefined}
    >
      <IconComp size={19} color={isActive ? color : undefined} />
      <span className="text-[9px] font-bold uppercase tracking-[0.5px] whitespace-nowrap leading-none">
        {label}
      </span>
    </button>
  );
}

const STATUS_BTNS = [
  { status: 'AVAILABLE',   label: 'AVL',   Icon: MdCheckCircle      },
  { status: 'ENRT',        label: 'ENRT',  Icon: MdDirectionsCar    },
  { status: 'BUSY',        label: 'BUSY',  Icon: MdWarningAmber     },
  { status: 'ARRVD',       label: 'ARRVD', Icon: MdLocationOn       },
  { status: 'UNAVAILABLE', label: 'UNAVL', Icon: MdDoNotDisturb     },
  { status: 'OFFDUTY',     label: 'OFD',   Icon: MdPowerSettingsNew },
];

export default function ActionBar({ onCreateCall }) {
  const { state, dispatch } = useCAD();
  const { currentUser, officers, calls, myCallId, reportTemplates, recordTemplates } = state;
  const navigate = useNavigate();
  const location = useLocation();

  const portal = PORTALS[currentUser?.portal] || PORTALS[DEFAULT_PORTAL];

  const me       = officers.find(o => o.id === currentUser?.id);
  const myStatus = me?.status || 'OFFDUTY';
  const myCall   = myCallId ? calls.find(c => c.id === myCallId) : null;

  const go       = (route) => navigate(route);
  const isActive = (route) => location.pathname === route || location.pathname.startsWith(route + '/');
  const setStatus = (s) => dispatch({ type: 'SET_STATUS', payload: s });

  const dropdownItems = (kind) => {
    if (kind === 'reports') {
      return (reportTemplates || []).map(t => ({
        ...t,
        category: t.category || 'Incident',
        route: `/forms?open=${encodeURIComponent(t.name)}`,
      }));
    }
    if (kind === 'records') {
      return (recordTemplates || []).map(t => ({
        ...t,
        route: `/records?open=${encodeURIComponent(t.name)}`,
      }));
    }
    return [];
  };

  return (
    <div className="cad-actionbar flex items-stretch gap-0 overflow-x-auto">

      {/* ── Brand + active portal ── */}
      <div className="flex items-center gap-2.5 px-3.5 h-full border-r border-[#253a5e] bg-[#0e2040] shrink-0">
        <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP"
          className="w-7 h-7 shrink-0 object-contain" />
        <div className="leading-[1.25] whitespace-nowrap">
          <div className="text-[13px] font-extrabold tracking-[-0.2px]">
            <span className="text-white">Sunshine State </span>
            <span className="text-[#f2800d]">RP</span>
          </div>
          <div className="text-[9px] font-bold tracking-[0.8px] uppercase mt-px transition-colors" style={{ color: portal.color }}>
            {portal.label}
          </div>
        </div>
      </div>

      {/* ── Portal nav ── */}
      {portal.nav.map(item =>
        item.dropdown ? (
          <DropdownBtn
            key={item.route}
            Icon={item.Icon}
            label={item.label}
            items={dropdownItems(item.dropdown)}
            active={isActive(item.route)}
            navigate={go}
          />
        ) : (
          <ToolBtn key={item.route} Icon={item.Icon} label={item.label}
            onClick={() => go(item.route)} active={isActive(item.route)} />
        )
      )}

      {/* ── Admin extras ── */}
      {portal.adminNav && (
        <>
          <div className="w-px bg-[#1a3050] self-stretch shrink-0" />
          {portal.adminNav.map(item => (
            <ToolBtn key={item.route} Icon={item.Icon} label={item.label}
              onClick={() => go(item.route)} active={isActive(item.route)} />
          ))}
        </>
      )}

      {/* ── Call actions ── */}
      {(portal.showNewCall || portal.showCalls) && <div className="w-px bg-[#1a3050] self-stretch shrink-0" />}
      {portal.showNewCall && <ToolBtn Icon={MdAddCall} label="New Call" onClick={onCreateCall} />}
      {portal.showCalls && (
        <>
          <ToolBtn Icon={MdPhone} label="My Call"
            onClick={() => myCall && go('/cad/' + myCall.id)} disabled={!myCall} />
          <ToolBtn Icon={MdPersonAdd} label="Assign" onClick={() => {
            if (me && myCall) dispatch({ type: 'ASSIGN_UNIT', payload: { callId: myCall.id, unitId: me.unitId } });
          }} disabled={!myCall || !me} />
        </>
      )}

      {/* ── Field-status buttons ── */}
      {portal.showStatus && (
        <>
          <div className="w-px bg-[#1a3050] self-stretch shrink-0" />
          {STATUS_BTNS.map(s => (
            <StatusBtn key={s.status} Icon={s.Icon} label={s.label}
              status={s.status} myStatus={myStatus} onClick={() => setStatus(s.status)} />
          ))}
        </>
      )}

      {/* ── Far right ── */}
      <div className="ml-auto flex items-stretch shrink-0">
        <Clock />
        <ToolBtn Icon={MdAccountCircle} label="Profile"
          onClick={() => go('/profile')} active={isActive('/profile')}
          title="My Profile"
          extraClass="border-l border-[#1a3050]" />
        <ToolBtn Icon={MdHome} label="Home"
          onClick={() => dispatch({ type: 'EXIT_TO_HOME' })}
          title="Exit to Home * choose another portal"
          extraClass="border-l border-[#1a3050]" />
        <ToolBtn Icon={MdLogout} label="Sign Out"
          onClick={() => dispatch({ type: 'LOGOUT' })}
          extraClass="border-l border-[#1a3050]" />
      </div>
    </div>
  );
}
