import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { ADMIN, AdminContent } from './AdminKit';
import {
  MdPeople, MdFingerprint, MdVpnKey, MdBrush, MdInventory2, MdShield,
  MdFormatListNumbered, MdGavel, MdHistory, MdVideogameAsset, MdChat,
  MdHourglassBottom, MdLayers, MdKey, MdLock, MdDelete, MdOpenInNew,
} from 'react-icons/md';

const SECTIONS = [
  {
    group: 'Accounts',
    items: [
      { icon: MdPeople,      label: 'Accounts',        route: '/admin/accounts' },
      { icon: MdFingerprint, label: 'Identifiers',     route: '/admin/identifiers' },
      { icon: MdVpnKey,      label: 'Permission Keys', route: '/admin/permission-keys' },
    ],
  },
  {
    group: 'Customization',
    items: [
      { icon: MdBrush,             label: 'Customization', route: '/admin', exact: true },
      { icon: MdInventory2,        label: 'Custom Records', route: '/admin/custom-records' },
      { icon: MdShield,            label: 'Departments',    route: '/admin/departments' },
      { icon: MdFormatListNumbered,label: '10-Codes',       route: '/admin/ten-codes' },
      { icon: MdGavel,             label: 'Statutes',       route: '/admin/statutes' },
    ],
  },
  {
    group: 'Advanced',
    items: [
      { icon: MdHistory,         label: 'Logs',                route: '/admin/logs' },
      { icon: MdVideogameAsset,  label: 'In-Game Integration', route: '/admin/in-game' },
      { icon: MdChat,            label: 'Discord Integration', route: '/admin/discord' },
      { icon: MdHourglassBottom, label: 'Limits',              route: '/admin/limits' },
      { icon: MdLayers,          label: 'Wipe Records',        route: '/admin/wipe' },
      { icon: MdKey,             label: 'Change Community ID',  route: '/admin/community-id' },
      { icon: MdLock,            label: 'Authenticate',        route: '/admin/authenticate' },
      { icon: MdDelete,          label: 'Transfer or Delete CAD', route: '/admin/transfer' },
    ],
  },
];

export default function AdminShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (item) =>
    item.exact ? pathname === item.route : (pathname === item.route || pathname.startsWith(item.route + '/'));

  return (
    <div style={{ display: 'flex', height: '100%', background: ADMIN.bg, minHeight: 0 }}>
      {/* ── Sidebar ── */}
      <div style={{
        width: 238, flexShrink: 0, background: ADMIN.panel, borderRight: `1px solid ${ADMIN.border}`,
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        <div style={{ flex: 1, padding: '14px 12px' }}>
          {SECTIONS.map(section => (
            <div key={section.group} style={{ marginBottom: 18 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                color: ADMIN.textMute, padding: '0 10px', marginBottom: 8,
              }}>{section.group}</div>
              {section.items.map(item => {
                const active = isActive(item);
                const Icon = item.icon;
                return (
                  <button key={item.route} onClick={() => navigate(item.route)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                      padding: '9px 12px', marginBottom: 2, borderRadius: 7, cursor: 'pointer',
                      background: active ? ADMIN.red : 'transparent',
                      border: '1px solid transparent',
                      color: active ? '#fff' : ADMIN.textDim,
                      fontSize: 13, fontWeight: active ? 700 : 500, fontFamily: 'var(--font-ui)',
                      boxShadow: active ? `0 2px 12px ${ADMIN.redGlow}` : 'none',
                      transition: 'background .14s, color .14s',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = ADMIN.panel2; e.currentTarget.style.color = ADMIN.text; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ADMIN.textDim; } }}
                  >
                    <Icon size={18} color={active ? '#fff' : ADMIN.red} style={{ flexShrink: 0 }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ padding: 12, borderTop: `1px solid ${ADMIN.border}` }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 7,
            color: ADMIN.textDim, fontSize: 13, fontWeight: 600,
          }}>
            <MdOpenInNew size={16} color={ADMIN.red} /> Documentation
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <AdminContent><Outlet /></AdminContent>
    </div>
  );
}
