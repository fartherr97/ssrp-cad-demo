import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCAD } from '../../store/cadStore';
import {
  MdDashboard, MdSearch, MdRefresh, MdDescription, MdMap, MdGridView,
  MdGroups, MdGavel, MdPeopleAlt, MdPhoneAndroid,
  MdAdminPanelSettings, MdMenuBook, MdBlock, MdBuild,
  MdAddCall, MdPhone, MdPersonAdd, MdLogout, MdAccountCircle,
  MdCheckCircle, MdDirectionsCar, MdWarningAmber, MdLocationOn,
  MdDoNotDisturb, MdPowerSettingsNew,
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
    <div style={{
      display: 'flex', alignItems: 'center', padding: '0 14px', height: '100%',
      borderLeft: '1px solid #1a3050', fontFamily: 'var(--font-mono)',
      fontSize: 12, fontWeight: 600, color: '#60a0cc', letterSpacing: '0.3px',
      flexShrink: 0, whiteSpace: 'nowrap',
    }}>
      {time}
    </div>
  );
}

/* Primary icon+label tool button */
function ToolBtn({ Icon: IconComp, label, onClick, active, disabled, title, style = {} }) {
  return (
    <button
      className={`cad-tool-btn${active ? ' active' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      style={style}
    >
      <span className="cad-tool-icon"><IconComp size={20} /></span>
      <span className="cad-tool-label">{label}</span>
    </button>
  );
}

/* Status square button — same shape as ToolBtn but uses the status color when active */
function StatusBtn({ Icon: IconComp, label, status, myStatus, onClick }) {
  const isActive = myStatus === status;
  const color = STATUS_COLORS[status];
  return (
    <button
      onClick={onClick}
      title={`Set status: ${status}`}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 4, padding: '4px 10px',
        minWidth: 54, height: '100%',
        background: isActive ? `${color}1a` : 'transparent',
        border: 'none',
        borderTop: `2px solid transparent`,
        borderBottom: `2px solid ${isActive ? color : 'transparent'}`,
        color: isActive ? color : '#4a6080',
        cursor: 'pointer', flexShrink: 0, transition: 'background 0.1s, color 0.1s',
        fontFamily: 'var(--font-ui)',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
          e.currentTarget.style.color = '#7090b0';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#4a6080';
        }
      }}
    >
      <IconComp size={19} color={isActive ? color : undefined} />
      <span style={{
        fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.5px', whiteSpace: 'nowrap', lineHeight: 1,
      }}>
        {label}
      </span>
    </button>
  );
}

const STATUS_COLORS = {
  AVAILABLE: '#22ff66', ENRT: '#ffd700', BUSY: '#ff3333',
  ARRVD: '#22ccff', UNAVAILABLE: '#cc44ff', OFFDUTY: '#888888',
};

const STATUS_BTNS = [
  { status: 'AVAILABLE',   label: 'AVL',   Icon: MdCheckCircle      },
  { status: 'ENRT',        label: 'ENRT',  Icon: MdDirectionsCar    },
  { status: 'BUSY',        label: 'BUSY',  Icon: MdWarningAmber     },
  { status: 'ARRVD',       label: 'ARRVD', Icon: MdLocationOn       },
  { status: 'UNAVAILABLE', label: 'UNAVL', Icon: MdDoNotDisturb     },
  { status: 'OFFDUTY',     label: 'OFD',   Icon: MdPowerSettingsNew },
];

const PRIMARY_NAV = [
  { Icon: MdDashboard,   label: 'CAD',     route: '/cad'     },
  { Icon: MdSearch,      label: 'Search',  route: '/search'  },
  { Icon: MdRefresh,     label: 'Returns', route: '/returns' },
  { Icon: MdDescription, label: 'Forms',   route: '/forms'   },
  { Icon: MdMap,         label: 'Map',     route: '/map'     },
  { Icon: MdGridView,    label: 'Board',   route: '/board'   },
];

const SECONDARY_NAV = [
  { Icon: MdGroups,       label: 'Units',     route: '/units'     },
  { Icon: MdGavel,        label: 'Warrants',  route: '/warrants'  },
  { Icon: MdPeopleAlt,    label: 'Civilians', route: '/civilians' },
  { Icon: MdPhoneAndroid, label: 'MDT',       route: '/mdt'       },
];

const ADMIN_NAV = [
  { Icon: MdAdminPanelSettings, label: 'Admin',   route: '/admin'   },
  { Icon: MdMenuBook,           label: 'Penal',   route: '/penal'   },
  { Icon: MdBlock,              label: 'Bans',    route: '/bans'    },
  { Icon: MdBuild,              label: 'Builder', route: '/builder' },
];

export default function ActionBar({ onCreateCall }) {
  const { state, dispatch } = useCAD();
  const { currentUser, officers, calls, myCallId } = state;
  const navigate = useNavigate();
  const location = useLocation();

  const me      = officers.find(o => o.id === currentUser?.id);
  const myStatus = me?.status || 'OFFDUTY';
  const myCall  = myCallId ? calls.find(c => c.id === myCallId) : null;
  const isDispatch = currentUser?.role === 'dispatch' || currentUser?.role === 'admin';
  const isAdmin    = currentUser?.role === 'admin';

  const go      = (route) => navigate(route);
  const isActive = (route) => location.pathname === route || location.pathname.startsWith(route + '/');
  const setStatus = (s) => dispatch({ type: 'SET_STATUS', payload: s });

  return (
    <div className="cad-actionbar" style={{ display: 'flex', alignItems: 'stretch', gap: 0, overflowX: 'auto' }}>

      {/* ── Brand ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 14px', height: '100%',
        borderRight: '1px solid #253a5e', background: '#0e2040', flexShrink: 0,
      }}>
        <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP"
          style={{ width: 28, height: 28, flexShrink: 0, objectFit: 'contain' }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: '#c09010', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
          Sunshine State RP
        </div>
      </div>

      {/* ── Primary nav ── */}
      {PRIMARY_NAV.map(item => (
        <ToolBtn key={item.route} Icon={item.Icon} label={item.label}
          onClick={() => go(item.route)} active={isActive(item.route)} />
      ))}

      <div className="cad-tool-sep" />

      {/* ── Secondary nav ── */}
      {SECONDARY_NAV.map(item => (
        <ToolBtn key={item.route} Icon={item.Icon} label={item.label}
          onClick={() => go(item.route)} active={isActive(item.route)} />
      ))}

      {/* ── Admin nav ── */}
      {isAdmin && ADMIN_NAV.map(item => (
        <ToolBtn key={item.route} Icon={item.Icon} label={item.label}
          onClick={() => go(item.route)} active={isActive(item.route)} />
      ))}

      <div className="cad-tool-sep" />

      {/* ── Call actions ── */}
      {isDispatch && <ToolBtn Icon={MdAddCall} label="New Call" onClick={onCreateCall} />}
      <ToolBtn Icon={MdPhone} label="My Call"
        onClick={() => myCall && go('/cad/' + myCall.id)} disabled={!myCall} />
      <ToolBtn Icon={MdPersonAdd} label="Assign" onClick={() => {
        if (me && myCall) dispatch({ type: 'ASSIGN_UNIT', payload: { callId: myCall.id, unitId: me.unitId } });
      }} disabled={!myCall || !me} />

      <div className="cad-tool-sep" />

      {/* ── Status buttons — same square style, colored when active ── */}
      {STATUS_BTNS.map(s => (
        <StatusBtn key={s.status} Icon={s.Icon} label={s.label}
          status={s.status} myStatus={myStatus} onClick={() => setStatus(s.status)} />
      ))}

      {/* ── Far right: clock + profile + sign out ── */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
        <Clock />
        <ToolBtn Icon={MdAccountCircle} label="Profile"
          onClick={() => go('/profile')} active={isActive('/profile')}
          title="My Profile & Signature"
          style={{ borderLeft: '1px solid #1a3050' }} />
        <ToolBtn Icon={MdLogout} label="Sign Out"
          onClick={() => dispatch({ type: 'LOGOUT' })}
          style={{ borderLeft: '1px solid #1a3050' }} />
      </div>
    </div>
  );
}
