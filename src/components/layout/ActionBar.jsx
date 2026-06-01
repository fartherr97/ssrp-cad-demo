import { useState, useEffect } from 'react';
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
  const { currentUser, officers, calls, myCallId } = state;
  const navigate = useNavigate();
  const location = useLocation();

  const portal = PORTALS[currentUser?.portal] || PORTALS[DEFAULT_PORTAL];

  const me      = officers.find(o => o.id === currentUser?.id);
  const myStatus = me?.status || 'OFFDUTY';
  const myCall  = myCallId ? calls.find(c => c.id === myCallId) : null;

  const go      = (route) => navigate(route);
  const isActive = (route) => location.pathname === route || location.pathname.startsWith(route + '/');
  const setStatus = (s) => dispatch({ type: 'SET_STATUS', payload: s });

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
          <div
            className="text-[9px] font-bold tracking-[0.8px] uppercase mt-px transition-colors"
            style={{ color: portal.color }}
          >
            {portal.label}
          </div>
        </div>
      </div>

      {/* ── Portal nav ── */}
      {portal.nav.map(item => (
        <ToolBtn key={item.route} Icon={item.Icon} label={item.label}
          onClick={() => go(item.route)} active={isActive(item.route)} />
      ))}

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

      {/* ── Call actions (dispatch / field roles) ── */}
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

      {/* ── Far right: clock + profile + home + sign out ── */}
      <div className="ml-auto flex items-stretch shrink-0">
        <Clock />
        <ToolBtn Icon={MdAccountCircle} label="Profile"
          onClick={() => go('/profile')} active={isActive('/profile')}
          title="My Profile & Signature"
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
