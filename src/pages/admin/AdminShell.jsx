import { useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { AdminContent } from './AdminKit';
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
      className={`group relative flex items-center gap-2 my-2 px-3.5 rounded-lg whitespace-nowrap cursor-pointer border-none text-[13px] tracking-[0.2px] shrink-0 transition-all duration-[140ms] font-ui
        ${active
          ? 'font-bold bg-brand/15 text-brand-bright'
          : 'font-medium text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'}`}
    >
      <Icon size={17} className={active ? 'text-brand-bright shrink-0' : 'text-slate-400 group-hover:text-slate-200 shrink-0'} />
      {item.label}
      {active && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-[3px] w-7 rounded-full bg-brand" />}
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
    <div className="flex flex-col flex-1 w-full h-full min-w-0 bg-app-bg">

      {/* ── Top nav bar ── */}
      <div className="flex items-stretch h-14 shrink-0 bg-app-toolbar/80 backdrop-blur-md border-b border-border-base gap-1 px-1">

        {/* Brand */}
        <div className="flex items-center gap-2.5 pl-3 pr-4 mr-1 shrink-0 border-r border-border-base select-none">
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP"
            className="w-9 h-9 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(61,130,240,0.35)]" />
          <div className="leading-[1.15] whitespace-nowrap">
            <div className="text-[15px] font-extrabold text-white tracking-[-0.3px]">Admin Panel</div>
            <div className="text-[9px] font-bold tracking-[1.2px] uppercase text-slate-500">{community}</div>
          </div>
        </div>

        {/* Scroll-left affordance */}
        <button onClick={() => scrollBy(-260)} title="Scroll left"
          className="shrink-0 w-8 my-2 rounded-lg bg-transparent border-none cursor-pointer text-slate-500 hover:bg-white/[0.05] hover:text-slate-200 transition-all">
          <MdChevronLeft size={20} className="mx-auto" />
        </button>

        {/* Section tabs (scrollable) */}
        <nav ref={scrollRef} className="admin-tabbar flex items-stretch gap-0.5 overflow-x-auto flex-1 min-w-0" onWheel={onWheel}>
          {GROUPS.map((group, gi) => (
            <div key={gi} className="flex items-stretch gap-0.5 shrink-0">
              {gi > 0 && <div className="w-px my-3 mx-1 shrink-0 bg-border-base" />}
              {group.map(item => (
                <AdminTab key={item.route} item={item} active={isActive(item)} onClick={() => navigate(item.route)} />
              ))}
            </div>
          ))}
        </nav>

        {/* Scroll-right affordance */}
        <button onClick={() => scrollBy(260)} title="Scroll right"
          className="shrink-0 w-8 my-2 rounded-lg bg-transparent border-none cursor-pointer text-slate-500 hover:bg-white/[0.05] hover:text-slate-200 transition-all">
          <MdChevronRight size={20} className="mx-auto" />
        </button>

        {/* Right actions */}
        <div className="flex items-stretch gap-0.5 shrink-0 pl-1 ml-1 border-l border-border-base">
          <button
            onClick={() => dispatch({ type: 'EXIT_TO_HOME' })}
            title="Exit to Home * choose another portal"
            className="flex items-center gap-2 my-2 px-3.5 rounded-lg cursor-pointer bg-transparent border-none text-[13px] font-semibold font-ui whitespace-nowrap text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 transition-all duration-[140ms]"
          >
            <MdHome size={17} /> Exit to Home
          </button>
          <button
            onClick={() => dispatch({ type: 'LOGOUT' })}
            title="Sign Out"
            className="flex items-center gap-2 my-2 px-3.5 rounded-lg cursor-pointer bg-transparent border-none text-[13px] font-semibold font-ui whitespace-nowrap text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-[140ms]"
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
