import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCAD } from '../../store/cadStore';

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

/* ─── SVG icon helpers ─── */
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  cad:      ['M3 3h18v4H3z', 'M3 10h18v4H3z', 'M3 17h18v4H3z'],
  search:   'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z',
  returns:  ['M1 4v6h6', 'M23 20v-6h-6', 'M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15'],
  forms:    ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M16 13H8', 'M16 17H8', 'M10 9H8'],
  map:      ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z', 'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  board:    ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
  newcall:  ['M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 11.5 19.79 19.79 0 0 1 1 2.18 2 2 0 0 1 2.98 0h3.04a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 14.91v2.01z', 'M19 3v6', 'M22 6h-6'],
  mycall:   ['M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 11.5 19.79 19.79 0 0 1 1 2.18 2 2 0 0 1 2.98 0h3.04a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 14.91v2.01z'],
  assign:   ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M19 8v6', 'M22 11h-6'],
  signout:  ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
};

/* Primary icon+label tool button */
function ToolBtn({ iconKey, label, onClick, active, disabled, title, style = {} }) {
  return (
    <button
      className={`cad-tool-btn${active ? ' active' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      style={style}
    >
      <span className="cad-tool-icon"><Icon d={ICONS[iconKey]} size={18} /></span>
      <span className="cad-tool-label">{label}</span>
    </button>
  );
}

/* Secondary text-only nav button (for extra pages) */
function NavBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', padding: '0 10px', height: '100%',
        fontSize: 11, fontWeight: active ? 600 : 400,
        color: active ? '#a0c8e8' : '#5070a0',
        background: active ? '#0d2040' : 'none',
        borderBottom: `2px solid ${active ? '#1060a8' : 'transparent'}`,
        borderTop: 'none', borderLeft: 'none', borderRight: 'none',
        cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font-ui)',
        flexShrink: 0, transition: 'none',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#8090b8'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#5070a0'; }}
    >
      {label}
    </button>
  );
}

const STATUS_COLORS = {
  AVAILABLE: '#22ff66', ENRT: '#aaff33', BUSY: '#ff8822',
  ARRVD: '#ffee22', UNAVAILABLE: '#dd44aa', OFFDUTY: '#cc3333',
};

const STATUS_BTNS = [
  { status: 'AVAILABLE',   label: 'AVL',   cls: 'st-available' },
  { status: 'ENRT',        label: 'ENRT',  cls: 'st-enrt'      },
  { status: 'BUSY',        label: 'BUSY',  cls: 'st-busy'      },
  { status: 'ARRVD',       label: 'ARRVD', cls: 'st-arrvd'     },
  { status: 'UNAVAILABLE', label: 'UNAVL', cls: 'st-unavl'     },
  { status: 'OFFDUTY',     label: 'OFD',   cls: 'st-offduty'   },
];

const PRIMARY_NAV = [
  { iconKey: 'cad',     label: 'CAD',     route: '/cad'     },
  { iconKey: 'search',  label: 'Search',  route: '/search'  },
  { iconKey: 'returns', label: 'Returns', route: '/returns' },
  { iconKey: 'forms',   label: 'Forms',   route: '/forms'   },
  { iconKey: 'map',     label: 'Map',     route: '/map'     },
  { iconKey: 'board',   label: 'Board',   route: '/board'   },
];

const SECONDARY_NAV = [
  { label: 'Units',     route: '/units'     },
  { label: 'Warrants',  route: '/warrants'  },
  { label: 'Civilians', route: '/civilians' },
  { label: 'MDT',       route: '/mdt'       },
];

const ADMIN_NAV = [
  { label: 'Admin',   route: '/admin'   },
  { label: 'Penal',   route: '/penal'   },
  { label: 'Bans',    route: '/bans'    },
  { label: 'Builder', route: '/builder' },
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
        padding: '0 12px', height: '100%',
        borderRight: '1px solid #253a5e', background: '#0e2040', flexShrink: 0,
      }}>
        <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP"
          style={{ width: 24, height: 24, flexShrink: 0, objectFit: 'contain' }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c09010', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
            Sunshine State RP
          </div>
          <div style={{ fontSize: 9, color: '#2e4258', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
            CAD · ECC
          </div>
        </div>
      </div>

      {/* ── Primary icon nav ── */}
      {PRIMARY_NAV.map(item => (
        <ToolBtn
          key={item.route}
          iconKey={item.iconKey}
          label={item.label}
          onClick={() => go(item.route)}
          active={isActive(item.route)}
        />
      ))}

      {/* ── Secondary text nav ── */}
      <div style={{ display: 'flex', alignItems: 'stretch', borderLeft: '1px solid #1a3050', borderRight: '1px solid #1a3050' }}>
        {SECONDARY_NAV.map(item => (
          <NavBtn key={item.route} label={item.label} active={isActive(item.route)} onClick={() => go(item.route)} />
        ))}
        {isAdmin && ADMIN_NAV.map(item => (
          <NavBtn key={item.route} label={item.label} active={isActive(item.route)} onClick={() => go(item.route)} />
        ))}
      </div>

      {/* ── Call actions ── */}
      {isDispatch && <ToolBtn iconKey="newcall" label="New Call" onClick={onCreateCall} />}
      <ToolBtn iconKey="mycall" label="My Call" onClick={() => myCall && go('/cad/' + myCall.id)} disabled={!myCall} />
      <ToolBtn iconKey="assign" label="Assign Self" onClick={() => {
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

        <ToolBtn iconKey="signout" label="Sign Out" onClick={() => dispatch({ type: 'LOGOUT' })} style={{ borderLeft: '1px solid #0d1e32' }} />
      </div>
    </div>
  );
}
