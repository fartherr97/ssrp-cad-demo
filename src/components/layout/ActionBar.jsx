import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCAD } from '../../store/cadStore';
import {
  MdDashboard, MdSearch, MdRefresh, MdDescription, MdMap, MdGridView,
  MdGroups, MdGavel, MdPeopleAlt, MdPhoneAndroid,
  MdAdminPanelSettings, MdMenuBook, MdBlock, MdBuild,
  MdAddCall, MdPhone, MdPersonAdd, MdLogout,
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
      display: 'flex', alignItems: 'center', padding: '0 12px', height: '100%',
      borderLeft: '1px solid #253a5e', fontFamily: 'var(--font-mono)',
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

const STATUS_COLORS = {
  AVAILABLE: '#22ff66', ENRT: '#aaff33', BUSY: '#ff8822',
  ARRVD: '#ffee22', UNAVAILABLE: '#dd44aa', OFFDUTY: '#cc3333',
};

const STATUS_BTNS = [
  { status: 'AVAILABLE',   label: 'AVL',   cls: 'st-available', Icon: MdCheckCircle      },
  { status: 'ENRT',        label: 'ENRT',  cls: 'st-enrt',      Icon: MdDirectionsCar    },
  { status: 'BUSY',        label: 'BUSY',  cls: 'st-busy',      Icon: MdWarningAmber     },
  { status: 'ARRVD',       label: 'ARRVD', cls: 'st-arrvd',     Icon: MdLocationOn       },
  { status: 'UNAVAILABLE', label: 'UNAVL', cls: 'st-unavl',     Icon: MdDoNotDisturb     },
  { status: 'OFFDUTY',     label: 'OFD',   cls: 'st-offduty',   Icon: MdPowerSettingsNew },
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
  { Icon: MdGroups,      label: 'Units',     route: '/units'     },
  { Icon: MdGavel,       label: 'Warrants',  route: '/warrants'  },
  { Icon: MdPeopleAlt,   label: 'Civilians', route: '/civilians' },
  { Icon: MdPhoneAndroid,label: 'MDT',       route: '/mdt'       },
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

  const me = officers.find(o => o.id === currentUser?.id);
  const myStatus = me?.status || 'OFFDUTY';
  const myCall = myCallId ? calls.find(c => c.id === myCallId) : null;
  const isDispatch = currentUser?.role === 'dispatch' || currentUser?.role === 'admin';
  const isAdmin = currentUser?.role === 'admin';

  const activeCalls = calls.filter(c => c.status !== 'CLOSED').length;
  const onDuty = officers.filter(o => o.status !== 'OFFDUTY').length;
  const p1Count = calls.filter(c => c.priority === 1 && c.status !== 'CLOSED').length;

  const go = (route) => navigate(route);
  const isActive = (route) => location.pathname === route || location.pathname.startsWith(route + '/');
  const setStatus = (s) => dispatch({ type: 'SET_STATUS', payload: s });

  const activeStatusColor = STATUS_COLORS[myStatus] || '#cc3333';
  const activeStatusLabel = STATUS_BTNS.find(s => s.status === myStatus)?.label || '—';

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

      {/* ── Primary icon nav ── */}
      {PRIMARY_NAV.map(item => (
        <ToolBtn
          key={item.route}
          Icon={item.Icon}
          label={item.label}
          onClick={() => go(item.route)}
          active={isActive(item.route)}
        />
      ))}

      <div className="cad-tool-sep" />

      {/* ── Secondary icon nav ── */}
      {SECONDARY_NAV.map(item => (
        <ToolBtn
          key={item.route}
          Icon={item.Icon}
          label={item.label}
          onClick={() => go(item.route)}
          active={isActive(item.route)}
        />
      ))}

      {/* ── Admin icon nav ── */}
      {isAdmin && ADMIN_NAV.map(item => (
        <ToolBtn
          key={item.route}
          Icon={item.Icon}
          label={item.label}
          onClick={() => go(item.route)}
          active={isActive(item.route)}
        />
      ))}

      <div className="cad-tool-sep" />

      {/* ── Call actions ── */}
      {isDispatch && <ToolBtn Icon={MdAddCall} label="New Call" onClick={onCreateCall} />}
      <ToolBtn Icon={MdPhone} label="My Call" onClick={() => myCall && go('/cad/' + myCall.id)} disabled={!myCall} />
      <ToolBtn Icon={MdPersonAdd} label="Assign" onClick={() => {
        if (me && myCall) dispatch({ type: 'ASSIGN_UNIT', payload: { callId: myCall.id, unitId: me.unitId } });
      }} disabled={!myCall || !me} />

      <div className="cad-tool-sep" />

      {/* ── My Call display ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        justifyContent: 'center', padding: '0 10px', height: '100%',
        borderRight: '1px solid #1a3050', flexShrink: 0, minWidth: 90,
      }}>
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#3a5878', letterSpacing: '0.4px' }}>MY CALL</span>
        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: myCall ? '#66ddff' : '#283848', lineHeight: 1.2 }}>
          {myCall ? myCall.id : 'NONE'}
        </span>
      </div>

      {/* ── Status ── */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 2, padding: '0 6px', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingRight: 8, borderRight: '1px solid #1a3050', marginRight: 4, height: 40 }}>
          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#3a5878', letterSpacing: '0.3px' }}>STATUS</span>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: activeStatusColor }}>{activeStatusLabel}</span>
        </div>
        {STATUS_BTNS.map(s => (
          <button
            key={s.status}
            className={`cad-status-btn ${myStatus === s.status ? s.cls : ''}`}
            style={{ height: 26, padding: '0 8px', fontSize: 10 }}
            onClick={() => setStatus(s.status)}
            title={`Set status: ${s.status}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Right: stats + clock + sign out ── */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>

        {p1Count > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', padding: '0 10px',
            borderLeft: '1px solid #1a3050',
            fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700,
            color: '#ff3333', animation: 'pulseRed 1.5s ease-in-out infinite',
            whiteSpace: 'nowrap',
          }}>
            ▲ P1: {p1Count}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', borderLeft: '1px solid #1a3050', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#5070a0', whiteSpace: 'nowrap' }}>
          ACTIVE: <span style={{ color: '#4890c0', fontWeight: 600, marginLeft: 4 }}>{activeCalls}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', borderLeft: '1px solid #1a3050', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#5070a0', whiteSpace: 'nowrap' }}>
          ON DUTY: <span style={{ color: '#22cc55', fontWeight: 600, marginLeft: 4 }}>{onDuty}</span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px',
          borderLeft: '1px solid #1a3050', fontSize: 11, fontFamily: 'var(--font-mono)',
          color: '#5070a0', whiteSpace: 'nowrap',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: activeStatusColor, flexShrink: 0 }} />
          <span style={{ color: '#7090a8' }}>{me?.badge || '—'}</span>
          <span style={{ color: '#3a5060' }}>·</span>
          <span style={{ color: '#5080a0' }}>{me?.deptShort || '—'}</span>
        </div>

        <Clock />

        <ToolBtn Icon={MdLogout} label="Sign Out" onClick={() => dispatch({ type: 'LOGOUT' })} style={{ borderLeft: '1px solid #0d1e32' }} />
      </div>
    </div>
  );
}
