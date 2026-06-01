import { useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { ADMIN, AdminContent } from './AdminKit';
import {
  MdPeople, MdFingerprint, MdVpnKey, MdBrush, MdInventory2, MdShield,
  MdFormatListNumbered, MdGavel, MdHistory, MdVideogameAsset, MdChat,
  MdHourglassBottom, MdLayers, MdKey, MdLock, MdDelete,
  MdArrowBack, MdLogout, MdChevronLeft, MdChevronRight,
} from 'react-icons/md';
import { useCAD } from '../../store/cadStore';

/* Section nav — grouped, rendered horizontally as the admin top bar.
   Each group is separated by a thin divider in the bar. */
const GROUPS = [
  [
    { icon: MdPeople,      label: 'Accounts',        route: '/admin/accounts' },
    { icon: MdFingerprint, label: 'Identifiers',     route: '/admin/identifiers' },
    { icon: MdVpnKey,      label: 'Permission Keys', route: '/admin/permission-keys' },
  ],
  [
    { icon: MdBrush,             label: 'Customization',  route: '/admin', exact: true },
    { icon: MdInventory2,        label: 'Custom Records', route: '/admin/custom-records' },
    { icon: MdShield,            label: 'Departments',    route: '/admin/departments' },
    { icon: MdFormatListNumbered,label: '10-Codes',       route: '/admin/ten-codes' },
    { icon: MdGavel,             label: 'Statutes',       route: '/admin/statutes' },
  ],
  [
    { icon: MdHistory,         label: 'Logs',          route: '/admin/logs' },
    { icon: MdVideogameAsset,  label: 'In-Game',       route: '/admin/in-game' },
    { icon: MdChat,            label: 'Discord',       route: '/admin/discord' },
    { icon: MdHourglassBottom, label: 'Limits',        route: '/admin/limits' },
    { icon: MdLayers,          label: 'Wipe Records',  route: '/admin/wipe' },
    { icon: MdKey,             label: 'Community ID',  route: '/admin/community-id' },
    { icon: MdLock,            label: 'Authenticate',  route: '/admin/authenticate' },
    { icon: MdDelete,          label: 'Transfer/Delete', route: '/admin/transfer' },
  ],
];

function AdminTab({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      title={item.label}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, height: '100%',
        padding: '0 15px', whiteSpace: 'nowrap', cursor: 'pointer',
        background: active ? ADMIN.panel2 : 'transparent',
        border: 'none',
        borderBottom: `2px solid ${active ? ADMIN.red : 'transparent'}`,
        color: active ? '#fff' : ADMIN.textDim,
        fontSize: 13, fontWeight: active ? 700 : 500, fontFamily: 'var(--font-ui)',
        letterSpacing: '0.2px', flexShrink: 0,
        transition: 'background .14s, color .14s, border-color .14s',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = ADMIN.row; e.currentTarget.style.color = ADMIN.text; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ADMIN.textDim; } }}
    >
      <Icon size={17} color={active ? ADMIN.redHi : ADMIN.red} style={{ flexShrink: 0 }} />
      {item.label}
    </button>
  );
}

export default function AdminShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { state, dispatch } = useCAD();
  const scrollRef = useRef(null);

  const isActive = (item) =>
    item.exact ? pathname === item.route : (pathname === item.route || pathname.startsWith(item.route + '/'));

  const community = state.communityConfig?.name || 'Sunshine State RP';

  const scrollBy = (dx) => scrollRef.current?.scrollBy({ left: dx, behavior: 'smooth' });

  // Let a vertical mouse wheel scroll the tab bar horizontally.
  const onWheel = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (delta) el.scrollLeft += delta;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', height: '100%', background: ADMIN.bg, minWidth: 0 }}>

      {/* ── Top nav bar ── */}
      <div style={{
        display: 'flex', alignItems: 'stretch', height: 56, flexShrink: 0,
        background: ADMIN.panel, borderBottom: `1px solid ${ADMIN.border}`,
      }}>
        {/* Brand */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 11, padding: '0 18px', flexShrink: 0,
          borderRight: `1px solid ${ADMIN.border}`, background: '#000',
        }}>
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP"
            style={{ width: 26, height: 26, objectFit: 'contain' }} />
          <div style={{ lineHeight: 1.2, whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '-0.2px' }}>Admin Panel</div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: ADMIN.red }}>{community}</div>
          </div>
        </div>

        {/* Scroll-left affordance */}
        <button onClick={() => scrollBy(-260)} title="Scroll left"
          style={{ flexShrink: 0, width: 30, background: 'transparent', border: 'none', borderRight: `1px solid ${ADMIN.border}`, color: ADMIN.textMute, cursor: 'pointer' }}>
          <MdChevronLeft size={20} />
        </button>

        {/* Section tabs (scrollable) */}
        <div ref={scrollRef} onWheel={onWheel} style={{
          display: 'flex', alignItems: 'stretch', overflowX: 'auto', flex: 1, minWidth: 0,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}>
          {GROUPS.map((group, gi) => (
            <div key={gi} style={{ display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
              {gi > 0 && <div style={{ width: 1, background: ADMIN.border, margin: '12px 0', flexShrink: 0 }} />}
              {group.map(item => (
                <AdminTab key={item.route} item={item} active={isActive(item)} onClick={() => navigate(item.route)} />
              ))}
            </div>
          ))}
        </div>

        {/* Scroll-right affordance */}
        <button onClick={() => scrollBy(260)} title="Scroll right"
          style={{ flexShrink: 0, width: 30, background: 'transparent', border: 'none', borderLeft: `1px solid ${ADMIN.border}`, color: ADMIN.textMute, cursor: 'pointer' }}>
          <MdChevronRight size={20} />
        </button>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'stretch', flexShrink: 0, borderLeft: `1px solid ${ADMIN.border}` }}>
          <button onClick={() => navigate('/cad')} title="Back to CAD"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', cursor: 'pointer',
              background: 'transparent', border: 'none', color: ADMIN.textDim,
              fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap',
              transition: 'background .14s, color .14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = ADMIN.row; e.currentTarget.style.color = ADMIN.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ADMIN.textDim; }}>
            <MdArrowBack size={17} /> Exit to CAD
          </button>
          <button onClick={() => dispatch({ type: 'LOGOUT' })} title="Sign Out"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', cursor: 'pointer',
              background: 'transparent', border: 'none', borderLeft: `1px solid ${ADMIN.border}`, color: ADMIN.textDim,
              fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap',
              transition: 'background .14s, color .14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${ADMIN.red}22`; e.currentTarget.style.color = ADMIN.redHi; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ADMIN.textDim; }}>
            <MdLogout size={17} /> Sign Out
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <AdminContent><Outlet /></AdminContent>
    </div>
  );
}
