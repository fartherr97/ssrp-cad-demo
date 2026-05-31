import { useCAD } from '../store/cadStore';
import StatusBadge from './StatusBadge';

const STATUSES = ['AVAILABLE', 'BUSY', 'UNAVAILABLE', 'OFFDUTY'];

const STATUS_COLORS = {
  AVAILABLE: '#22c55e',
  BUSY: '#f59e0b',
  UNAVAILABLE: '#ef4444',
  OFFDUTY: '#6b7280',
  ENRT: '#22c55e',
};

/* ── icon map for each page ── */
const NAV = [
  { page: 'dispatch', label: 'CAD',         icon: <DispatchIcon /> },
  { page: 'search',   label: 'Search',       icon: <SearchIcon /> },
  { page: 'returns',  label: 'Returns',      icon: <ReturnsIcon /> },
  { page: 'mdt',      label: 'MDT',          icon: <MDTIcon />,    badge: true },
  { page: 'forms',    label: 'Forms',        icon: <FormsIcon /> },
  { page: 'rms',      label: 'RMS',          icon: <RMSIcon /> },
  { page: 'livemap',  label: 'Live Map',     icon: <MapIcon /> },
  { page: 'createcall', label: 'New Call',   icon: <NewCallIcon /> },
  { page: 'profile',  label: 'My Profile',   icon: <ProfileIcon /> },
];

const ADMIN_NAV = [
  { page: 'departments',    label: 'Depts',      icon: <DeptsIcon /> },
  { page: 'penalcode',      label: 'Penal Code', icon: <PenalIcon /> },
  { page: 'recordtemplates',label: 'Templates',  icon: <TplIcon /> },
  { page: 'admin',          label: 'Admin',      icon: <AdminIcon /> },
  { page: 'bans',           label: 'Bans',       icon: <BanIcon /> },
];

export default function NavBar() {
  const { state, dispatch } = useCAD();
  const { currentUser, currentPage, officers } = state;
  const myOfficer = officers.find(o => o.id === currentUser?.id);
  const myStatus  = myOfficer?.status || 'OFFDUTY';
  const unread    = state.messages.filter(m => !m.read).length;
  const go        = (page) => dispatch({ type: 'SET_PAGE', payload: page });
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

        <div style={{ color:'#4a7aaa', fontSize:'13px', fontWeight:500, letterSpacing:'0.5px' }}>
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
              style={{ background:'transparent', color:'#4a6a8a', border:'1px solid #1e3050', borderRadius:'4px', padding:'4px 10px', fontSize:'11px', cursor:'pointer', fontFamily:'inherit' }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div style={{
        background: 'linear-gradient(180deg, #1a3a6b 0%, #162f5a 100%)',
        borderBottom: '2px solid #0d1e3a',
        padding: '4px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        boxShadow: '0 3px 10px rgba(0,0,0,0.6)',
      }}>
        {/* Status pill */}
        <div
          onClick={() => {
            const idx = STATUSES.indexOf(myStatus);
            dispatch({ type:'SET_STATUS', payload: STATUSES[(idx+1) % STATUSES.length] });
          }}
          style={{ marginRight:'8px', cursor:'pointer' }}
        >
          <StatusBadge status={myStatus} />
        </div>

        <div style={{ width:'1px', height:'32px', background:'rgba(255,255,255,0.1)', marginRight:'6px' }} />

        {/* Main nav icon-boxes */}
        {NAV.map(item => (
          <ToolBtn
            key={item.page}
            label={item.label}
            icon={item.icon}
            active={currentPage === item.page}
            badge={item.badge ? unread : 0}
            onClick={() => go(item.page)}
          />
        ))}

        {/* Admin section */}
        {currentUser?.role === 'admin' && (
          <>
            <div style={{ width:'1px', height:'32px', background:'rgba(255,255,255,0.1)', margin:'0 6px' }} />
            {ADMIN_NAV.map(item => (
              <ToolBtn
                key={item.page}
                label={item.label}
                icon={item.icon}
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

/* ── Toolbar button ── */
function ToolBtn({ label, icon, active, onClick, admin, badge }) {
  const accent = admin ? '#f97316' : '#60a5fa';
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
        border: active ? `1px solid ${accent}` : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '5px',
        color: active ? accent : (admin ? '#f9a05a' : '#b0c8e8'),
        padding: '3px 8px 4px',
        minWidth: '52px',
        height: '44px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        fontFamily: 'inherit',
        position: 'relative',
        transition: 'background 0.15s, border-color 0.15s',
        boxShadow: active ? `0 0 8px ${accent}40` : 'none',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
    >
      <div style={{ width:'18px', height:'18px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {icon}
      </div>
      <span style={{ fontSize:'9px', fontWeight: active ? 700 : 500, letterSpacing:'0.3px', whiteSpace:'nowrap', lineHeight:1 }}>
        {label}
      </span>
      {badge > 0 && (
        <span style={{
          background:'#ef4444', color:'#fff', borderRadius:'8px',
          fontSize:'8px', padding:'1px 4px', lineHeight:1.4,
          position:'absolute', top:'2px', right:'2px',
        }}>{badge}</span>
      )}
    </button>
  );
}

/* ── Page title map ── */
const PAGE_TITLES = {
  dispatch:       'Dispatch Board',
  mdt:            'Mobile Data Terminal',
  search:         'Records Search',
  returns:        'NCIC / DMV Returns',
  forms:          'Report Center',
  rms:            'Records Management',
  livemap:        'Live Map',
  createcall:     'Create Call',
  profile:        'Officer Profile',
  civilian:       'Civilian Portal',
  departments:    'Department Management',
  penalcode:      'Penal Code Editor',
  recordtemplates:'Record Templates',
  admin:          'Admin Panel',
  bans:           'Ban Management',
};

/* ── SVG icons (18×18) ── */
function DispatchIcon() {
  return <svg viewBox="0 0 18 18" fill="currentColor" width="18" height="18"><path d="M9 1L1 5v8l8 4 8-4V5L9 1zm0 2.2L15 6.5v5l-6 3-6-3v-5l6-3.3z"/></svg>;
}
function SearchIcon() {
  return <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><circle cx="7.5" cy="7.5" r="4.5"/><line x1="11" y1="11" x2="16" y2="16"/></svg>;
}
function ReturnsIcon() {
  return <svg viewBox="0 0 18 18" fill="currentColor" width="18" height="18"><rect x="1" y="3" width="16" height="12" rx="1.5" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M4 7h7M4 10h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function MDTIcon() {
  return <svg viewBox="0 0 18 18" fill="currentColor" width="18" height="18"><rect x="2" y="2" width="14" height="11" rx="1.5" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M6 16h6M9 13v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function FormsIcon() {
  return <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18"><rect x="3" y="1" width="12" height="16" rx="1.5"/><path d="M6 5h6M6 8h6M6 11h4" strokeLinecap="round"/></svg>;
}
function RMSIcon() {
  return <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18"><ellipse cx="9" cy="5" rx="6" ry="2.5"/><path d="M3 5v4c0 1.38 2.69 2.5 6 2.5S15 10.38 15 9V5"/><path d="M3 9v4c0 1.38 2.69 2.5 6 2.5S15 14.38 15 13V9"/></svg>;
}
function MapIcon() {
  return <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18"><path d="M1 3l5 2 6-2 5 2v12l-5-2-6 2-5-2V3z"/><path d="M6 5v12M12 3v12" strokeLinecap="round"/></svg>;
}
function NewCallIcon() {
  return <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" width="18" height="18"><path d="M3 3h3l1.5 4-2 1.5a10 10 0 004 4L11 11l4 1.5V16a1 1 0 01-1 1C6.16 17 1 11.84 1 4a1 1 0 011-1z"/><path d="M13 1v6M10 4h6" strokeLinecap="round"/></svg>;
}
function ProfileIcon() {
  return <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18"><circle cx="9" cy="6" r="3.5"/><path d="M2 16c0-3.87 3.13-7 7-7s7 3.13 7 7" strokeLinecap="round"/></svg>;
}
function DeptsIcon() {
  return <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18"><rect x="3" y="8" width="4" height="8"/><rect x="7" y="4" width="4" height="12"/><rect x="11" y="6" width="4" height="10"/></svg>;
}
function PenalIcon() {
  return <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18"><path d="M9 2L4 6v5c0 3.31 2.15 6.41 5 7 2.85-.59 5-3.69 5-7V6L9 2z"/></svg>;
}
function TplIcon() {
  return <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18"><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="10" y="2" width="6" height="6" rx="1"/><rect x="2" y="10" width="6" height="6" rx="1"/><rect x="10" y="10" width="6" height="6" rx="1"/></svg>;
}
function AdminIcon() {
  return <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18"><circle cx="9" cy="9" r="2.5"/><path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.22 3.22l1.42 1.42M13.36 13.36l1.42 1.42M3.22 14.78l1.42-1.42M13.36 4.64l1.42-1.42"/></svg>;
}
function BanIcon() {
  return <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18"><circle cx="9" cy="9" r="7"/><line x1="4" y1="4" x2="14" y2="14"/></svg>;
}
