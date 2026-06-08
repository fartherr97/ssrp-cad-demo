import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { AdminContent } from './AdminKit';
import {
  MdPeople, MdFingerprint, MdVpnKey, MdBrush, MdInventory2, MdShield,
  MdFormatListNumbered, MdGavel, MdHistory, MdChat,
  MdHourglassBottom, MdLayers, MdLock,
  MdHome, MdLogout, MdRemoveModerator, MdGppBad,
  MdMenu, MdClose, MdFlag, MdMessage,
  MdManageAccounts, MdTune, MdDns, MdExpandMore, MdStore, MdLocalPhone,
  MdHelpOutline, MdContactPage, MdSwapHoriz, MdAdminPanelSettings, MdReportProblem,
} from 'react-icons/md';
import { useCAD } from '../../store/cadStore';

/* permKey maps each nav item to the adminTier permissions key that gates it.
   Items with no permKey are visible to all admin-tier users. */
const GROUPS = [
  {
    label: 'Users',
    Icon: MdManageAccounts,
    items: [
      { icon: MdSwapHoriz,          label: 'Role Mapping',     route: '/admin/role-mapping',    permKey: 'roleMapping'          },
      { icon: MdAdminPanelSettings, label: 'Mgmt. Roles',      route: '/admin/admin-tiers',     permKey: 'canManageAdminTiers'  },
      { icon: MdPeople,             label: 'Accounts',         route: '/admin/accounts',         permKey: 'accounts'             },
      { icon: MdGppBad,             label: 'Ban Management',   route: '/bans',                   permKey: 'accounts'             },
      { icon: MdFingerprint,        label: 'Identifiers',      route: '/admin/identifiers',      permKey: 'identifiers'          },
      { icon: MdVpnKey,             label: 'Permission Keys',  route: '/admin/permission-keys',  permKey: 'permissionKeys'       },
      { icon: MdStore,              label: 'Businesses',       route: '/admin/businesses',       permKey: 'businesses'           },
    ],
  },
  {
    label: 'Configuration',
    Icon: MdTune,
    items: [
      { icon: MdBrush,              label: 'Customization',  route: '/admin', exact: true,        permKey: 'customization'        },
      { icon: MdInventory2,         label: 'Custom Records', route: '/admin/custom-records',      permKey: 'customRecords'        },
      { icon: MdContactPage,        label: 'Civilian Forms', route: '/admin/civilian-forms',      permKey: 'civilianForms'        },
      { icon: MdHelpOutline,        label: 'Help Center',    route: '/admin/help-center',         permKey: 'helpCenter'           },
      { icon: MdShield,             label: 'Departments',    route: '/admin/departments',         permKey: 'departments'          },
      { icon: MdLocalPhone,         label: 'Call Types',     route: '/admin/call-types',          permKey: 'callTypes'            },
      { icon: MdReportProblem,      label: 'Citizen Report Types', route: '/admin/citizen-report-types', permKey: 'callTypes'      },
      { icon: MdFormatListNumbered, label: '10-Codes',       route: '/admin/ten-codes',           permKey: 'tenCodes'             },
      { icon: MdGavel,              label: 'Penal Code',     route: '/admin/statutes',            permKey: 'statutes'             },
      { icon: MdRemoveModerator,    label: 'Auto Suspend',   route: '/admin/license-points',      permKey: 'licensePoints'        },
      { icon: MdFlag,               label: 'Flags',          route: '/admin/flags',               permKey: 'flags'                },
    ],
  },
  {
    label: 'System',
    Icon: MdDns,
    items: [
      { icon: MdHistory,         label: 'Audit Log',       route: '/admin/logs',            permKey: 'logs'           },
      { icon: MdMessage,         label: 'Message Logs',    route: '/admin/message-logs',    permKey: 'messageLogs'    },
      { icon: MdChat,            label: 'Discord',         route: '/admin/discord',         permKey: 'discord'        },
      { icon: MdHourglassBottom, label: 'Limits',          route: '/admin/limits',          permKey: 'limits'         },
      { icon: MdLayers,          label: 'Wipe Records',    route: '/admin/wipe',            permKey: 'wipeRecords'    },
      { icon: MdLock,            label: 'Authenticate',    route: '/admin/authenticate'                               },
    ],
  },
];

/* Only one dropdown open at a time */
/* Shared hover state for the nav group dropdowns: exactly one open at a time,
   driven by a single shared close timer. Lifting this out of the individual
   dropdowns removes the fast-hover races (stale per-instance timers) that could
   leave a menu stuck closed when sweeping the pointer quickly across groups. */
function GroupNav({ groups, isActive, onNavigate }) {
  const [openLabel, setOpenLabel] = useState(null);
  const closeTimer = useRef(null);
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  const open = (label) => { clearTimeout(closeTimer.current); setOpenLabel(label); };
  const scheduleClose = () => { clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setOpenLabel(null), 140); };
  const cancelClose = () => clearTimeout(closeTimer.current);
  const closeNow = () => { clearTimeout(closeTimer.current); setOpenLabel(null); };
  return (
    <nav className="hidden md:flex items-stretch gap-0.5 flex-1 min-w-0">
      {groups.map(group => (
        <GroupDropdown
          key={group.label}
          group={group}
          isActive={isActive}
          onNavigate={onNavigate}
          isOpen={openLabel === group.label}
          onOpen={() => open(group.label)}
          onScheduleClose={scheduleClose}
          onCancelClose={cancelClose}
          onCloseNow={closeNow}
        />
      ))}
    </nav>
  );
}

function GroupDropdown({ group, isActive, onNavigate, isOpen, onOpen, onScheduleClose, onCancelClose, onCloseNow }) {
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return undefined;
    const h = (e) => {
      if (!containerRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) onCloseNow();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isOpen, onCloseNow]);

  const anyActive = group.items.some(item => isActive(item));
  const GroupIcon = group.Icon;

  const openMenu = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setCoords({ left: r.left, top: r.bottom + 4 });
    }
    onOpen();
  };
  const toggle = () => (isOpen ? onCloseNow() : openMenu());

  return (
    <div ref={containerRef} className="relative flex items-stretch" onMouseEnter={openMenu} onMouseLeave={onScheduleClose}>
      <button
        ref={btnRef}
        onClick={toggle}
        className={`relative flex items-center gap-1.5 my-2 px-3.5 rounded-lg whitespace-nowrap cursor-pointer border-none text-[13px] tracking-[0.2px] shrink-0 transition-all duration-75 font-ui
          ${anyActive || isOpen
            ? 'font-bold bg-brand/15 text-brand-bright'
            : 'font-medium text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'}`}
      >
        <GroupIcon size={16} className="shrink-0" />
        {group.label}
        <MdExpandMore size={15} className={`transition-transform duration-75 ${isOpen ? 'rotate-180' : ''}`} />
        {anyActive && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-[3px] w-7 rounded-full bg-brand" />
        )}
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          onMouseEnter={onCancelClose}
          onMouseLeave={onScheduleClose}
          className="fixed z-[3000] bg-app-card border border-border-strong shadow-2xl shadow-black/60 rounded-xl min-w-[210px] p-1.5"
          style={{ left: coords.left, top: coords.top, animation: 'dropdownFadeIn 0.13s ease-out' }}
        >
          <div className="px-2.5 pt-1.5 pb-1 text-[9px] font-bold uppercase tracking-[0.6px] text-slate-600">
            {group.label}
          </div>
          {group.items.map(item => {
            const ItemIcon = item.icon;
            const active = isActive(item);
            return (
              <button
                key={item.route}
                onClick={() => { onNavigate(item.route); onCloseNow(); }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-[12.5px] font-medium cursor-pointer transition-all duration-75 hover:-translate-y-0.5 ${
                  active
                    ? 'bg-brand/15 text-brand-bright font-semibold'
                    : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'
                }`}
              >
                <ItemIcon size={15} className={active ? 'text-brand-bright shrink-0' : 'text-slate-500 shrink-0'} />
                {item.label}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm anim-overlay-in" onClick={onClose} />

      <div className="relative z-10 flex flex-col w-full bg-app-panel border-b border-border-base shadow-2xl max-h-[85vh] overflow-hidden anim-drawer-in">
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border-base shrink-0">
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP"
            className="w-8 h-8 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(61,130,240,0.35)]" />
          <div className="flex-1 leading-[1.15]">
            <div className="text-[14px] font-extrabold text-white tracking-[-0.3px]">
              Sunshine State <span style={{ color: '#f2800d' }}>RP</span>
            </div>
            <div className="text-[9px] font-bold tracking-[1.2px] uppercase text-slate-500">Administration</div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 border-none cursor-pointer transition-all duration-75">
            <MdClose size={20} />
          </button>
        </div>

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
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left cursor-pointer border-none transition-all duration-75 font-ui
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

        <div className="flex gap-2 px-4 py-3 border-t border-border-base shrink-0">
          <button onClick={() => { onHome(); onClose(); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-slate-300 text-[13px] font-semibold font-ui cursor-pointer hover:bg-white/[0.09] transition-all duration-75">
            <MdHome size={16} /> Exit to Home
          </button>
          <button onClick={() => { onLogout(); onClose(); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[13px] font-semibold font-ui cursor-pointer hover:bg-red-500/20 transition-all duration-75">
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (item) =>
    item.exact ? pathname === item.route : (pathname === item.route || pathname.startsWith(item.route + '/'));

  // ── Tier-based nav filtering ──────────────────────────────────────────
  // If the signed-in admin user has an adminTierId, filter nav items to only
  // the sections their tier's permissions allow. No tierId = full access.
  const tierPerms = (() => {
    const tierId = state.currentUser?.adminTierId;
    if (!tierId) return null; // full access — no filtering
    const tier = (state.adminTiers || []).find(t => t.id === tierId);
    return tier?.permissions || null;
  })();

  const canSeeItem = (item) => {
    if (!tierPerms || !item.permKey) return true;
    return !!tierPerms[item.permKey];
  };

  const visibleGroups = GROUPS.map(g => ({
    ...g,
    items: g.items.filter(canSeeItem),
  })).filter(g => g.items.length > 0);

  const allItems = visibleGroups.flatMap(g => g.items);
  const activeItem = allItems.find(item => isActive(item));

  return (
    <div className="flex flex-col flex-1 w-full h-full min-w-0 bg-app-bg">

      {/* ── Top nav bar ── */}
      <div className="flex items-stretch h-14 shrink-0 bg-app-toolbar border-b border-border-base gap-1 px-1">

        {/* Brand (click to return to portal-selection screen) */}
        <button
          type="button"
          onClick={() => dispatch({ type: 'EXIT_TO_HOME' })}
          title="Back to portal selection"
          className="flex items-center gap-2.5 pl-3 pr-4 mr-1 shrink-0 border-r border-border-base select-none bg-transparent border-none cursor-pointer hover:opacity-90 transition-opacity">
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP"
            className="w-9 h-9 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(61,130,240,0.35)]" />
          <div className="leading-[1.15] whitespace-nowrap text-left">
            <div className="text-[15px] font-extrabold text-white tracking-[-0.3px]">
              Sunshine State <span style={{ color: '#f2800d' }}>RP</span>
            </div>
            <div className="text-[9px] font-bold tracking-[1.2px] uppercase text-slate-500">Administration</div>
          </div>
        </button>

        {/* Mobile: active section name */}
        <div className="flex md:hidden flex-1 items-center min-w-0 px-2">
          {activeItem && (
            <span className="text-[13px] font-semibold text-slate-200 truncate">{activeItem.label}</span>
          )}
        </div>

        {/* Desktop: group dropdowns */}
        <GroupNav groups={visibleGroups} isActive={isActive} onNavigate={navigate} />

        {/* Right actions */}
        <div className="flex items-stretch gap-0.5 shrink-0 pl-1 ml-1 border-l border-border-base">

          {/* Mobile hamburger */}
          <button onClick={() => setDrawerOpen(true)} title="Menu"
            className="md:hidden flex items-center justify-center w-10 my-2 rounded-lg bg-transparent border-none cursor-pointer text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 transition-all duration-75">
            <MdMenu size={22} />
          </button>

          {/* Desktop: Exit + Logout */}
          <button
            onClick={() => dispatch({ type: 'EXIT_TO_HOME' })}
            title="Exit to Home"
            className="hidden md:flex items-center gap-2 my-2 px-3 lg:px-3.5 rounded-lg cursor-pointer bg-transparent border-none text-[13px] font-semibold font-ui whitespace-nowrap text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 transition-all duration-75"
          >
            <MdHome size={17} /> <span className="hidden lg:inline">Exit to Home</span>
          </button>
          <button
            onClick={() => dispatch({ type: 'LOGOUT' })}
            title="Sign Out"
            className="hidden md:flex items-center gap-2 my-2 px-3 lg:px-3.5 rounded-lg cursor-pointer bg-transparent border-none text-[13px] font-semibold font-ui whitespace-nowrap text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-75"
          >
            <MdLogout size={17} /> <span className="hidden lg:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        groups={visibleGroups}
        isActive={isActive}
        onNavigate={(route) => navigate(route)}
        onHome={() => dispatch({ type: 'EXIT_TO_HOME' })}
        onLogout={() => dispatch({ type: 'LOGOUT' })}
      />

      {/* Content */}
      <AdminContent><Outlet /></AdminContent>
    </div>
  );
}
