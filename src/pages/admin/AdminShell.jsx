import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { AdminContent } from './AdminKit';
import {
  MdPeople, MdFingerprint, MdVpnKey, MdBrush, MdInventory2, MdShield,
  MdFormatListNumbered, MdGavel, MdHistory, MdVideogameAsset, MdChat,
  MdHourglassBottom, MdLayers, MdKey, MdLock, MdDelete,
  MdHome, MdLogout, MdChevronLeft, MdChevronRight, MdRemoveModerator,
  MdMenu, MdClose, MdFlag,
} from 'react-icons/md';
import { useCAD } from '../../store/cadStore';

const GROUPS = [
  {
    label: 'Users',
    items: [
      { icon: MdPeople,      label: 'Accounts',        route: '/admin/accounts' },
      { icon: MdFingerprint, label: 'Identifiers',     route: '/admin/identifiers' },
      { icon: MdVpnKey,      label: 'Permission Keys', route: '/admin/permission-keys' },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { icon: MdBrush,              label: 'Customization',  route: '/admin', exact: true },
      { icon: MdInventory2,         label: 'Custom Records', route: '/admin/custom-records' },
      { icon: MdShield,             label: 'Departments',    route: '/admin/departments' },
      { icon: MdFormatListNumbered, label: '10-Codes',       route: '/admin/ten-codes' },
      { icon: MdGavel,              label: 'Statutes',       route: '/admin/statutes' },
      { icon: MdRemoveModerator,    label: 'Auto Suspend',   route: '/admin/license-points' },
      { icon: MdFlag,               label: 'Flags',          route: '/admin/flags' },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: MdHistory,         label: 'Logs',            route: '/admin/logs' },
      { icon: MdVideogameAsset,  label: 'In-Game',         route: '/admin/in-game' },
      { icon: MdChat,            label: 'Discord',         route: '/admin/discord' },
      { icon: MdHourglassBottom, label: 'Limits',          route: '/admin/limits' },
      { icon: MdLayers,          label: 'Wipe Records',    route: '/admin/wipe' },
      { icon: MdKey,             label: 'Community ID',    route: '/admin/community-id' },
      { icon: MdLock,            label: 'Authenticate',    route: '/admin/authenticate' },
      { icon: MdDelete,          label: 'Transfer/Delete', route: '/admin/transfer' },
    ],
  },
];

// Flat list for desktop tab bar (original flat structure)
const FLAT_GROUPS = GROUPS.map(g => g.items);

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

/* Mobile drawer rendered via portal */
function MobileDrawer({ open, onClose, groups, isActive, onNavigate, onHome, onLogout }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[3000] flex flex-col">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer panel */}
      <div className="relative z-10 flex flex-col w-full bg-app-panel border-b border-border-base shadow-2xl max-h-[85vh] overflow-hidden">
        {/* Drawer header */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border-base shrink-0">
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP"
            className="w-8 h-8 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(61,130,240,0.35)]" />
          <div className="flex-1 leading-[1.15]">
            <div className="text-[14px] font-extrabold text-white tracking-[-0.3px]">Admin Panel</div>
            <div className="text-[9px] font-bold tracking-[1.2px] uppercase text-slate-500">Navigation</div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 border-none cursor-pointer transition-all">
            <MdClose size={20} />
          </button>
        </div>

        {/* Section groups */}
        <div className="overflow-y-auto flex-1 p-3 flex flex-col gap-1">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="text-[9px] font-bold uppercase tracking-[0.8px] text-slate-600 px-3 pt-3 pb-1.5">
                {group.label}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  return (
                    <button key={item.route}
                      onClick={() => { onNavigate(item.route); onClose(); }}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left cursor-pointer border-none transition-all duration-[120ms] font-ui
                        ${active
                          ? 'bg-brand/15 border border-brand/30 text-brand-bright font-semibold'
                          : 'bg-white/[0.03] border border-transparent text-slate-300 hover:bg-white/[0.07] hover:text-white font-medium'}`}>
                      <Icon size={16} className={active ? 'text-brand-bright shrink-0' : 'text-slate-400 shrink-0'} />
                      <span className="text-[12px] truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 px-4 py-3 border-t border-border-base shrink-0">
          <button onClick={() => { onHome(); onClose(); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-slate-300 text-[13px] font-semibold font-ui cursor-pointer hover:bg-white/[0.09] transition-all">
            <MdHome size={16} /> Exit to Home
          </button>
          <button onClick={() => { onLogout(); onClose(); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[13px] font-semibold font-ui cursor-pointer hover:bg-red-500/20 transition-all">
            <MdLogout size={16} /> Sign Out
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function AdminShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { state, dispatch } = useCAD();
  const scrollRef = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (item) =>
    item.exact ? pathname === item.route : (pathname === item.route || pathname.startsWith(item.route + '/'));

  const community = state.communityConfig?.name || 'Sunshine State RP';

  const scrollBy = (dx) => scrollRef.current?.scrollBy({ left: dx, behavior: 'smooth' });

  const onWheel = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (delta) el.scrollLeft += delta;
  };

  // Active section label for mobile header display
  const allItems = GROUPS.flatMap(g => g.items);
  const activeItem = allItems.find(item => isActive(item));

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

        {/* ── Mobile: active section name + hamburger ── */}
        <div className="flex md:hidden flex-1 items-center min-w-0 px-2">
          {activeItem && (
            <span className="text-[13px] font-semibold text-slate-200 truncate">
              {activeItem.label}
            </span>
          )}
        </div>

        {/* ── Desktop: Scroll-left affordance ── */}
        <button onClick={() => scrollBy(-260)} title="Scroll left"
          className="hidden md:block shrink-0 w-8 my-2 rounded-lg bg-transparent border-none cursor-pointer text-slate-500 hover:bg-white/[0.05] hover:text-slate-200 transition-all">
          <MdChevronLeft size={20} className="mx-auto" />
        </button>

        {/* ── Desktop: Section tabs (scrollable) ── */}
        <nav ref={scrollRef} className="admin-tabbar hidden md:flex items-stretch gap-0.5 overflow-x-auto flex-1 min-w-0" onWheel={onWheel}>
          {FLAT_GROUPS.map((group, gi) => (
            <div key={gi} className="flex items-stretch gap-0.5 shrink-0">
              {gi > 0 && <div className="w-px my-3 mx-1 shrink-0 bg-border-base" />}
              {group.map(item => (
                <AdminTab key={item.route} item={item} active={isActive(item)} onClick={() => navigate(item.route)} />
              ))}
            </div>
          ))}
        </nav>

        {/* ── Desktop: Scroll-right affordance ── */}
        <button onClick={() => scrollBy(260)} title="Scroll right"
          className="hidden md:block shrink-0 w-8 my-2 rounded-lg bg-transparent border-none cursor-pointer text-slate-500 hover:bg-white/[0.05] hover:text-slate-200 transition-all">
          <MdChevronRight size={20} className="mx-auto" />
        </button>

        {/* Right actions */}
        <div className="flex items-stretch gap-0.5 shrink-0 pl-1 ml-1 border-l border-border-base">

          {/* Mobile hamburger */}
          <button onClick={() => setDrawerOpen(true)} title="Menu"
            className="md:hidden flex items-center justify-center w-10 my-2 rounded-lg bg-transparent border-none cursor-pointer text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 transition-all">
            <MdMenu size={22} />
          </button>

          {/* Desktop: Exit + Logout */}
          <button
            onClick={() => dispatch({ type: 'EXIT_TO_HOME' })}
            title="Exit to Home"
            className="hidden md:flex items-center gap-2 my-2 px-3 lg:px-3.5 rounded-lg cursor-pointer bg-transparent border-none text-[13px] font-semibold font-ui whitespace-nowrap text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 transition-all duration-[140ms]"
          >
            <MdHome size={17} /> <span className="hidden lg:inline">Exit to Home</span>
          </button>
          <button
            onClick={() => dispatch({ type: 'LOGOUT' })}
            title="Sign Out"
            className="hidden md:flex items-center gap-2 my-2 px-3 lg:px-3.5 rounded-lg cursor-pointer bg-transparent border-none text-[13px] font-semibold font-ui whitespace-nowrap text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-[140ms]"
          >
            <MdLogout size={17} /> <span className="hidden lg:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        groups={GROUPS}
        isActive={isActive}
        onNavigate={(route) => navigate(route)}
        onHome={() => dispatch({ type: 'EXIT_TO_HOME' })}
        onLogout={() => dispatch({ type: 'LOGOUT' })}
      />

      {/* ── Content ── */}
      <AdminContent><Outlet /></AdminContent>
    </div>
  );
}
