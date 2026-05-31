import { useCAD } from '../store/cadStore';
import StatusBadge from './StatusBadge';
import {
  FaBullhorn, FaMagnifyingGlass, FaFileLines, FaDesktop,
  FaFolder, FaDatabase, FaMap, FaPhoneFlip, FaIdBadge,
  FaBuilding, FaGavel, FaLayerGroup, FaGear, FaBan,
  FaArrowLeft, FaArrowRight, FaStar, FaPhone, FaShieldHalved,
} from 'react-icons/fa6';

const STATUSES = ['AVAILABLE', 'BUSY', 'UNAVAILABLE', 'OFFDUTY'];

const STATUS_COLORS = {
  AVAILABLE: '#22c55e',
  BUSY:      '#f59e0b',
  UNAVAILABLE: '#ef4444',
  OFFDUTY:   '#6b7280',
  ENRT:      '#22c55e',
};

const NAV = [
  { page: 'dispatch',   label: 'CAD',        Icon: FaBullhorn },
  { page: 'search',     label: 'Search',      Icon: FaMagnifyingGlass },
  { page: 'returns',    label: 'Returns',     Icon: FaFileLines },
  { page: 'mdt',        label: 'MDT',         Icon: FaDesktop,    badge: true },
  { page: 'forms',      label: 'Forms',       Icon: FaFolder },
  { page: 'rms',        label: 'RMS',         Icon: FaDatabase },
  { page: 'livemap',    label: 'Live Map',    Icon: FaMap },
  { page: 'createcall', label: 'New Call',    Icon: FaPhoneFlip },
  { page: 'profile',    label: 'My Profile',  Icon: FaIdBadge },
];

const ADMIN_NAV = [
  { page: 'departments',     label: 'Depts',       Icon: FaBuilding },
  { page: 'penalcode',       label: 'Penal Code',  Icon: FaGavel },
  { page: 'recordtemplates', label: 'Templates',   Icon: FaLayerGroup },
  { page: 'admin',           label: 'Admin',       Icon: FaGear },
  { page: 'bans',            label: 'Bans',        Icon: FaBan },
];

export default function NavBar() {
  const { state, dispatch } = useCAD();
  const { currentUser, currentPage, officers } = state;
  const myOfficer   = officers.find(o => o.id === currentUser?.id);
  const myStatus    = myOfficer?.status || 'OFFDUTY';
  const unread      = state.messages.filter(m => !m.read).length;
  const go          = (page) => dispatch({ type: 'SET_PAGE', payload: page });
  const statusColor = STATUS_COLORS[myStatus] || '#6b7280';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>

      {/* ── Branding bar ── */}
      <div style={{
        background: '#07111f',
        borderBottom: '1px solid #162540',
        padding: '0 20px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div onClick={() => go('dispatch')} style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }}>
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" style={{ height:'32px', width:'auto' }} />
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ color:'#ffffff', fontWeight:700, fontSize:'14px', letterSpacing:'0.2px' }}>
              Sunshine State <span style={{ color:'#f97316' }}>RP</span>
            </div>
            <div style={{ color:'#3a5a8a', fontSize:'9px', letterSpacing:'2px', textTransform:'uppercase' }}>
              Computer Aided Dispatch
            </div>
          </div>
        </div>

        <div style={{ color:'#4a7aaa', fontSize:'13px', fontWeight:500 }}>
          {PAGE_TITLES[currentPage] || 'CAD System'}
        </div>

        {currentUser && (
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{
                width:'32px', height:'32px',
                background:'linear-gradient(135deg,#1e4080,#2d5fa0)',
                border:`2px solid ${statusColor}`,
                borderRadius:'50%',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'13px',
              }}>👮</div>
              <div style={{ lineHeight:1.3 }}>
                <div style={{ color:'#d1dff0', fontSize:'12px', fontWeight:600 }}>
                  {currentUser.badge} | {currentUser.rank} | {currentUser.name}
                </div>
                <div style={{ color:'#f97316', fontSize:'10px' }}>
                  {currentUser.deptShort}{myOfficer?.subdivision ? ` · ${myOfficer.subdivision}` : ''}
                </div>
              </div>
            </div>
            <button
              onClick={() => dispatch({ type:'LOGOUT' })}
              style={{ background:'transparent', color:'#4a6a8a', border:'1px solid #1e3050', borderRadius:'4px', padding:'4px 10px', fontSize:'11px', cursor:'pointer' }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div style={{
        background: 'linear-gradient(180deg, #1a3a6b 0%, #152f58 100%)',
        borderBottom: '2px solid #0d1e3a',
        padding: '5px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        boxShadow: '0 3px 10px rgba(0,0,0,0.6)',
      }}>
        {/* Status */}
        <div
          onClick={() => {
            const idx = STATUSES.indexOf(myStatus);
            dispatch({ type:'SET_STATUS', payload: STATUSES[(idx+1) % STATUSES.length] });
          }}
          style={{ marginRight:'8px', cursor:'pointer', flexShrink:0 }}
        >
          <StatusBadge status={myStatus} />
        </div>

        <Sep />

        {/* Main nav */}
        {NAV.map(item => (
          <ToolBtn
            key={item.page}
            label={item.label}
            Icon={item.Icon}
            active={currentPage === item.page}
            badge={item.badge ? unread : 0}
            onClick={() => go(item.page)}
          />
        ))}

        {/* Admin section */}
        {currentUser?.role === 'admin' && (
          <>
            <Sep />
            {ADMIN_NAV.map(item => (
              <ToolBtn
                key={item.page}
                label={item.label}
                Icon={item.Icon}
                active={currentPage === item.page}
                onClick={() => go(item.page)}
                admin
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function Sep() {
  return <div style={{ width:'1px', height:'34px', background:'rgba(255,255,255,0.12)', margin:'0 4px', flexShrink:0 }} />;
}

function ToolBtn({ label, Icon, active, onClick, admin, badge }) {
  const accent = admin ? '#f97316' : '#60a5fa';
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.05)',
        border: active ? `1px solid ${accent}60` : '1px solid rgba(255,255,255,0.09)',
        borderRadius: '6px',
        color: active ? '#fff' : (admin ? '#fbb87a' : '#a8c4e0'),
        padding: '4px 9px 5px',
        minWidth: '54px',
        height: '46px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        position: 'relative',
        transition: 'background 0.12s, color 0.12s',
        boxShadow: active ? `inset 0 -2px 0 ${accent}` : 'none',
        flexShrink: 0,
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.11)'; e.currentTarget.style.color = '#fff'; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = admin ? '#fbb87a' : '#a8c4e0'; }}}
    >
      <Icon size={16} />
      <span style={{ fontSize:'9px', fontWeight: active ? 600 : 400, letterSpacing:'0.2px', whiteSpace:'nowrap', lineHeight:1 }}>
        {label}
      </span>
      {badge > 0 && (
        <span style={{
          background:'#ef4444', color:'#fff', borderRadius:'8px',
          fontSize:'8px', padding:'1px 4px', lineHeight:1.4,
          position:'absolute', top:'3px', right:'3px',
        }}>{badge}</span>
      )}
    </button>
  );
}

const PAGE_TITLES = {
  dispatch:        'Dispatch Board',
  mdt:             'Mobile Data Terminal',
  search:          'Records Search',
  returns:         'NCIC / DMV Returns',
  forms:           'Report Center',
  rms:             'Records Management',
  livemap:         'Live Map',
  createcall:      'Create Call',
  profile:         'Officer Profile',
  civilian:        'Civilian Portal',
  departments:     'Department Management',
  penalcode:       'Penal Code Editor',
  recordtemplates: 'Record Templates',
  admin:           'Admin Panel',
  bans:            'Ban Management',
};
