import { useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { ADMIN, AdminContent } from './AdminKit';
import {
  MdPeople, MdFingerprint, MdVpnKey, MdBrush, MdInventory2, MdShield,
  MdFormatListNumbered, MdGavel, MdHistory, MdVideogameAsset, MdChat,
  MdHourglassBottom, MdLayers, MdKey, MdLock, MdDelete,
  MdHome, MdLogout, MdChevronLeft, MdChevronRight,
} from 'react-icons/md';
import { useCAD } from '../../store/cadStore';

/* Section nav * grouped, rendered horizontally as the admin top bar.
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
      className={`flex items-center gap-2 h-full px-[15px] whitespace-nowrap cursor-pointer border-none text-[13px] tracking-[0.2px] shrink-0 transition-all duration-[140ms]
        ${active
          ? 'font-bold border-b-2'
          : 'font-medium border-b-2 border-transparent hover:border-b-2'}`}
      style={{
        background: active ? ADMIN.panel2 : 'transparent',
        borderBottomColor: active ? ADMIN.red : undefined,
        color: active ? '#fff' : ADMIN.textDim,
        fontFamily: 'var(--font-ui)',
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
    <div className="flex flex-col flex-1 w-full h-full min-w-0" style={{ background: ADMIN.bg }}>

      {/* ── Top nav bar ── */}
      <div className="flex items-stretch h-14 shrink-0" style={{ background: ADMIN.panel, borderBottom: `1px solid ${ADMIN.border}` }}>

        {/* Brand */}
        <div className="flex items-center gap-[11px] px-[18px] shrink-0 bg-black" style={{ borderRight: `1px solid ${ADMIN.border}` }}>
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP"
            className="w-[26px] h-[26px] object-contain" />
          <div className="leading-[1.2] whitespace-nowrap">
            <div className="text-[13px] font-extrabold text-white tracking-[-0.2px]">Admin Panel</div>
            <div className="text-[10px] font-bold tracking-[0.5px] uppercase" style={{ color: ADMIN.red }}>{community}</div>
          </div>
        </div>

        {/* Scroll-left affordance */}
        <button onClick={() => scrollBy(-260)} title="Scroll left"
          className="shrink-0 w-[30px] bg-transparent border-none cursor-pointer"
          style={{ borderRight: `1px solid ${ADMIN.border}`, color: ADMIN.textMute }}>
          <MdChevronLeft size={20} />
        </button>

        {/* Section tabs (scrollable) */}
        <div ref={scrollRef} className="admin-tabbar flex items-stretch overflow-x-auto flex-1 min-w-0" onWheel={onWheel}>
          {GROUPS.map((group, gi) => (
            <div key={gi} className="flex items-stretch shrink-0">
              {gi > 0 && <div className="w-px my-3 shrink-0" style={{ background: ADMIN.border }} />}
              {group.map(item => (
                <AdminTab key={item.route} item={item} active={isActive(item)} onClick={() => navigate(item.route)} />
              ))}
            </div>
          ))}
        </div>

        {/* Scroll-right affordance */}
        <button onClick={() => scrollBy(260)} title="Scroll right"
          className="shrink-0 w-[30px] bg-transparent border-none cursor-pointer"
          style={{ borderLeft: `1px solid ${ADMIN.border}`, color: ADMIN.textMute }}>
          <MdChevronRight size={20} />
        </button>

        {/* Right actions */}
        <div className="flex items-stretch shrink-0" style={{ borderLeft: `1px solid ${ADMIN.border}` }}>
          <button
            onClick={() => dispatch({ type: 'EXIT_TO_HOME' })}
            title="Exit to Home * choose another portal"
            className="flex items-center gap-2 px-4 cursor-pointer bg-transparent border-none text-[13px] font-semibold font-ui whitespace-nowrap transition-all duration-[140ms]"
            style={{ color: ADMIN.textDim }}
            onMouseEnter={e => { e.currentTarget.style.background = ADMIN.row; e.currentTarget.style.color = ADMIN.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ADMIN.textDim; }}
          >
            <MdHome size={17} /> Exit to Home
          </button>
          <button
            onClick={() => dispatch({ type: 'LOGOUT' })}
            title="Sign Out"
            className="flex items-center gap-2 px-4 cursor-pointer bg-transparent border-none text-[13px] font-semibold font-ui whitespace-nowrap transition-all duration-[140ms]"
            style={{ borderLeft: `1px solid ${ADMIN.border}`, color: ADMIN.textDim }}
            onMouseEnter={e => { e.currentTarget.style.background = `${ADMIN.red}22`; e.currentTarget.style.color = ADMIN.redHi; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ADMIN.textDim; }}
          >
            <MdLogout size={17} /> Sign Out
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <AdminContent><Outlet /></AdminContent>
    </div>
  );
}
