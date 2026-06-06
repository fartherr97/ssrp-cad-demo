import { useState, useMemo } from 'react';
import Select from '../../../components/ui/Select';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import {
  AdminPanel, SonButton, SonIconBtn, EmptyState, ADMIN, SON_INPUT, SON_LABEL,
} from '../AdminKit';
import {
  MdAdd, MdEdit, MdDelete, MdSave, MdShield, MdCheck, MdClose,
  MdWarning, MdExpandMore, MdLock, MdAdminPanelSettings,
} from 'react-icons/md';

/* ── Permission schema ──────────────────────────────────────────────── */
export const PERM_GROUPS = [
  {
    label: 'Users',
    items: [
      { key: 'roleMapping',    label: 'Role Mapping',      note: 'Who gets which portal'           },
      { key: 'accounts',       label: 'Accounts',          note: 'View and manage user accounts'   },
      { key: 'identifiers',    label: 'Identifiers',       note: 'DL format and unique field rules' },
      { key: 'permissionKeys', label: 'Permission Keys',   note: 'API access token scopes'         },
      { key: 'businesses',     label: 'Businesses',        note: 'Business registry and licensing' },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { key: 'customization',  label: 'Customization Hub', note: 'Branding, login page, tones'    },
      { key: 'customRecords',  label: 'Custom Records',    note: 'Report and record template builder' },
      { key: 'civilianForms',  label: 'Civilian Forms',    note: 'DL, vehicle, medical form schemas' },
      { key: 'helpCenter',     label: 'Help Center',       note: 'Portal help content editor'     },
      { key: 'departments',    label: 'Departments',       note: 'Agencies and subdivisions'      },
      { key: 'callTypes',      label: 'Call Types',        note: 'Dispatch call natures'          },
      { key: 'tenCodes',       label: '10-Codes',          note: 'Radio code definitions'         },
      { key: 'statutes',       label: 'Penal Code',        note: 'Criminal charges and statutes'  },
      { key: 'licensePoints',  label: 'Auto Suspend',      note: 'DL point-suspension engine'     },
      { key: 'flags',          label: 'Flags',             note: 'Civilian flag definitions'      },
    ],
  },
  {
    label: 'System',
    items: [
      { key: 'logs',           label: 'Audit Logs',        note: 'Full system audit trail'        },
      { key: 'messageLogs',    label: 'Message Logs',      note: 'Blast and DM history'           },
      { key: 'inGame',         label: 'In-Game Config',    note: 'API key and live map settings'  },
      { key: 'discord',        label: 'Discord Integration', note: 'Webhook configuration'        },
      { key: 'limits',         label: 'Limits',            note: 'Per-user resource caps'         },
      { key: 'wipeRecords',    label: 'Wipe Records',      note: 'Permanent data deletion', danger: true },
    ],
  },
];

export const ACTION_PERMS = [
  { key: 'canBanUsers',         label: 'Ban Users',             note: 'Issue bans from the Accounts page',                    danger: false },
  { key: 'canUnbanUsers',       label: 'Unban / Lift Bans',     note: 'Lift existing bans and suspensions',                   danger: false },
  { key: 'canWipeData',         label: 'Execute Data Wipes',    note: 'Permanently erase records, reports, and logs',         danger: true  },
  { key: 'canManageAdminTiers', label: 'Manage Admin Tiers',    note: 'Create, edit, or delete management tier definitions',  danger: true  },
];

const ALL_PERM_KEYS = [
  ...PERM_GROUPS.flatMap(g => g.items.map(i => i.key)),
  ...ACTION_PERMS.map(a => a.key),
];

const FULL_PERMS   = Object.fromEntries(ALL_PERM_KEYS.map(k => [k, true]));
const EMPTY_PERMS  = Object.fromEntries(ALL_PERM_KEYS.map(k => [k, false]));

const PRESETS = [
  {
    id: 'full',
    label: 'Full Access',
    color: '#22c55e',
    perms: { ...FULL_PERMS },
  },
  {
    id: 'moderation',
    label: 'Moderation Only',
    color: '#f59e0b',
    perms: {
      ...EMPTY_PERMS,
      accounts: true, businesses: true, flags: true, logs: true, messageLogs: true,
      canBanUsers: true, canUnbanUsers: true,
    },
  },
  {
    id: 'config',
    label: 'Config Only',
    color: '#a855f7',
    perms: {
      ...EMPTY_PERMS,
      customization: true, customRecords: true, civilianForms: true, helpCenter: true,
      departments: true, callTypes: true, tenCodes: true, statutes: true, licensePoints: true,
      flags: true, logs: true,
    },
  },
  {
    id: 'none',
    label: 'No Access',
    color: '#64748b',
    perms: { ...EMPTY_PERMS },
  },
];

const EMPTY_TIER = {
  name: '', level: 50, color: '#3a88e8', description: '',
  permissions: { ...EMPTY_PERMS },
};

/* ── Sub-components ─────────────────────────────────────────────────── */
function Toggle({ checked, onChange, danger = false }) {
  const onColor = danger ? '#ef4444' : '#3a88e8';
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="relative shrink-0 rounded-full transition-all duration-150 cursor-pointer"
      style={{ width: 34, height: 18, background: checked ? onColor : '#1e293b', border: `1px solid ${checked ? onColor : '#334155'}`, padding: 0 }}>
      <span className="absolute top-0.5 rounded-full bg-white shadow-sm transition-all duration-150"
        style={{ width: 13, height: 13, left: checked ? 17 : 2 }} />
    </button>
  );
}

function PermRow({ item, value, onChange }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b last:border-0"
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <Toggle checked={!!value} onChange={onChange} danger={!!item.danger} />
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-semibold leading-tight"
          style={{ color: value ? (item.danger ? '#fca5a5' : ADMIN.text) : '#475569' }}>
          {item.label}
          {item.danger && value && <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#ef444420', color: '#f87171' }}>SENSITIVE</span>}
        </div>
        <div className="text-[11px] mt-0.5" style={{ color: '#334155' }}>{item.note}</div>
      </div>
    </div>
  );
}

function PermGroupBlock({ group, perms, onToggle, onSetAll }) {
  const allOn = group.items.every(i => !!perms[i.key]);
  const anyOn = group.items.some(i => !!perms[i.key]);
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${ADMIN.border}` }}>
      <div className="flex items-center justify-between px-3 py-2"
        style={{ background: '#0b1424', borderBottom: `1px solid ${ADMIN.border}` }}>
        <div className="text-[10.5px] font-bold uppercase tracking-[0.7px]" style={{ color: ADMIN.textMute }}>{group.label}</div>
        <button type="button" onClick={() => onSetAll(group.items, !allOn)}
          className="text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-all"
          style={{ background: anyOn ? '#3a88e810' : 'transparent', color: anyOn ? '#3a88e8' : '#334155', border: '1px solid transparent' }}>
          {allOn ? 'Revoke All' : 'Grant All'}
        </button>
      </div>
      <div className="px-3" style={{ background: '#0d1a2c' }}>
        {group.items.map(item => (
          <PermRow key={item.key} item={item} value={perms[item.key]} onChange={v => onToggle(item.key, v)} />
        ))}
      </div>
    </div>
  );
}

function TierModal({ draft, setDraft, onSave, onClose, isNew }) {
  const set = (patch) => setDraft(p => ({ ...p, ...patch }));
  const setPerms = (patch) => setDraft(p => ({ ...p, permissions: { ...p.permissions, ...patch } }));
  const togglePerm = (key, val) => setPerms({ [key]: val });
  const setGroupAll = (items, val) => setPerms(Object.fromEntries(items.map(i => [i.key, val])));
  const applyPreset = (preset) => setDraft(p => ({ ...p, permissions: { ...preset.perms } }));

  const canSave = draft.name.trim().length > 0;
  const enabledCount = Object.values(draft.permissions).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col"
        style={{ background: '#0d1a2e', border: '1px solid #1e3a5f', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0" style={{ borderColor: '#1e3a5f', background: '#0b1424' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${draft.color}18`, border: `1px solid ${draft.color}40` }}>
            <MdAdminPanelSettings size={18} style={{ color: draft.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold text-white">{isNew ? 'Create Management Tier' : `Edit — ${draft.name || 'Untitled'}`}</div>
            <div className="text-[11px]" style={{ color: ADMIN.textMute }}>
              {enabledCount} of {ALL_PERM_KEYS.length} permissions enabled
            </div>
          </div>
          <SonIconBtn icon={MdClose} onClick={onClose} title="Cancel" />
        </div>

        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-4">

          {/* Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-1">
              <label style={SON_LABEL}>Tier Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={SON_INPUT} placeholder="e.g. Senior Admin"
                value={draft.name} onChange={e => set({ name: e.target.value })} />
            </div>
            <div className="sm:col-span-1">
              <label style={SON_LABEL}>Authority Level (1 – 100)</label>
              <input style={SON_INPUT} type="number" min={1} max={100}
                value={draft.level} onChange={e => set({ level: Math.min(100, Math.max(1, Number(e.target.value) || 1)) })} />
              <div style={{ fontSize: 11, color: ADMIN.textMute, marginTop: 3 }}>Higher level tiers supersede lower ones in authority.</div>
            </div>
            <div className="sm:col-span-1">
              <label style={SON_LABEL}>Badge Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={draft.color} onChange={e => set({ color: e.target.value })}
                  style={{ width: 36, height: 36, borderRadius: 6, border: `1px solid ${ADMIN.border}`, background: 'transparent', cursor: 'pointer', padding: 2 }} />
                <input style={{ ...SON_INPUT, flex: 1 }} value={draft.color}
                  onChange={e => set({ color: e.target.value })} />
                <span className="px-3 py-1.5 rounded-lg text-[12px] font-bold"
                  style={{ background: `${draft.color}22`, color: draft.color, border: `1px solid ${draft.color}44`, whiteSpace: 'nowrap' }}>
                  {draft.name || 'Preview'}
                </span>
              </div>
            </div>
            <div className="col-span-2">
              <label style={SON_LABEL}>Description</label>
              <input style={SON_INPUT} placeholder="What this tier can do…"
                value={draft.description} onChange={e => set({ description: e.target.value })} />
            </div>
          </div>

          {/* Presets */}
          <div>
            <div style={SON_LABEL}>Quick Presets</div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button key={p.id} type="button" onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-all"
                  style={{ background: `${p.color}15`, color: p.color, border: `1px solid ${p.color}40` }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section permissions */}
          <div>
            <div style={{ ...SON_LABEL, marginBottom: 10 }}>Portal Sections</div>
            <div className="flex flex-col gap-2">
              {PERM_GROUPS.map(group => (
                <PermGroupBlock key={group.label} group={group} perms={draft.permissions}
                  onToggle={togglePerm} onSetAll={setGroupAll} />
              ))}
            </div>
          </div>

          {/* Action permissions */}
          <div className="rounded-lg overflow-hidden" style={{ border: `1px solid #ef444440` }}>
            <div className="flex items-center justify-between px-3 py-2"
              style={{ background: '#1a0a0a', borderBottom: '1px solid #ef444440' }}>
              <div className="text-[10.5px] font-bold uppercase tracking-[0.7px] flex items-center gap-1.5" style={{ color: '#ef4444' }}>
                <MdWarning size={12} /> Sensitive Actions
              </div>
              <div className="text-[10px]" style={{ color: '#ef444480' }}>Grant carefully — these are destructive or high-impact</div>
            </div>
            <div className="px-3" style={{ background: '#120808' }}>
              {ACTION_PERMS.map(item => (
                <PermRow key={item.key} item={item} value={draft.permissions[item.key]}
                  onChange={v => togglePerm(item.key, v)} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t shrink-0"
          style={{ borderColor: '#1e3a5f', background: '#0b1424' }}>
          <SonButton onClick={onClose}>Cancel</SonButton>
          <SonButton variant="red" disabled={!canSave} onClick={() => canSave && onSave(draft)} style={{ gap: 6 }}>
            <MdSave size={15} /> {isNew ? 'Create Tier' : 'Save Changes'}
          </SonButton>
        </div>
      </div>
    </div>
  );
}

/* ── Tier card ──────────────────────────────────────────────────────── */
function TierCard({ tier, inUse, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  const sectionCount = PERM_GROUPS.flatMap(g => g.items).filter(i => tier.permissions[i.key]).length;
  const totalSections = PERM_GROUPS.flatMap(g => g.items).length;
  const enabledActions = ACTION_PERMS.filter(a => tier.permissions[a.key]);

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: ADMIN.bg, border: `1px solid ${ADMIN.border}` }}>

      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: tier.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-bold" style={{ color: tier.color }}>{tier.name}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tabular-nums"
              style={{ background: `${tier.color}18`, color: tier.color, border: `1px solid ${tier.color}40` }}>
              Lvl {tier.level}
            </span>
            {inUse > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: '#1e293b', color: '#64748b' }}>
                {inUse} mapping{inUse !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {tier.description && (
            <div className="text-[11.5px] mt-0.5 leading-snug line-clamp-1" style={{ color: ADMIN.textMute }}>{tier.description}</div>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <SonIconBtn icon={MdEdit} title="Edit tier" onClick={onEdit} />
          <SonIconBtn icon={MdDelete} danger title="Delete tier" onClick={onDelete} />
          <SonIconBtn icon={MdExpandMore} title="View permissions"
            onClick={() => setOpen(o => !o)}
            color={open ? ADMIN.blue : ADMIN.textMute} />
        </div>
      </div>

      {/* Permission summary bar */}
      <div className="px-4 pb-3 flex items-center gap-3 text-[11.5px]" style={{ color: ADMIN.textMute }}>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${(sectionCount / totalSections) * 100}%`, background: tier.color }} />
        </div>
        <span className="shrink-0">{sectionCount}/{totalSections} sections</span>
        {enabledActions.length > 0 && (
          <span className="shrink-0" style={{ color: enabledActions.some(a => a.danger) ? '#f59e0b' : ADMIN.textMute }}>
            {enabledActions.map(a => a.label).join(', ')}
          </span>
        )}
      </div>

      {/* Expanded permissions grid */}
      {open && (
        <div className="border-t px-4 py-4" style={{ borderColor: ADMIN.border }}>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))' }}>
            {PERM_GROUPS.map(group => (
              <div key={group.label}>
                <div className="text-[10px] font-bold uppercase tracking-[0.6px] mb-2" style={{ color: ADMIN.textMute }}>{group.label}</div>
                <div className="flex flex-col gap-1">
                  {group.items.map(item => (
                    <div key={item.key} className="flex items-center gap-2 text-[11.5px]"
                      style={{ color: tier.permissions[item.key] ? ADMIN.text : '#334155' }}>
                      {tier.permissions[item.key]
                        ? <MdCheck size={12} style={{ color: tier.color, flexShrink: 0 }} />
                        : <MdLock size={12} style={{ color: '#334155', flexShrink: 0 }} />
                      }
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] mb-2" style={{ color: '#ef444480' }}>Sensitive Actions</div>
              <div className="flex flex-col gap-1">
                {ACTION_PERMS.map(item => (
                  <div key={item.key} className="flex items-center gap-2 text-[11.5px]"
                    style={{ color: tier.permissions[item.key] ? (item.danger ? '#fca5a5' : ADMIN.text) : '#334155' }}>
                    {tier.permissions[item.key]
                      ? <MdCheck size={12} style={{ color: item.danger ? '#ef4444' : tier.color, flexShrink: 0 }} />
                      : <MdLock size={12} style={{ color: '#334155', flexShrink: 0 }} />
                    }
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function AdminTiers() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const tiers = useMemo(() => [...(state.adminTiers || [])].sort((a, b) => b.level - a.level), [state.adminTiers]);
  const mappings = state.discordRoleMappings || [];

  const [modal, setModal] = useState(null); // null | { draft, isNew, origId }
  const [confirmDelete, setConfirmDelete] = useState(null);

  const openAdd = () => setModal({ draft: { ...EMPTY_TIER, permissions: { ...EMPTY_PERMS } }, isNew: true, origId: null });
  const openEdit = (tier) => setModal({ draft: { ...tier, permissions: { ...tier.permissions } }, isNew: false, origId: tier.id });
  const closeModal = () => setModal(null);

  const saveTier = (draft) => {
    if (modal.isNew) {
      dispatch({ type: 'ADMIN_ADD', payload: { key: 'adminTiers', item: draft } });
      toast.success(`Tier "${draft.name}" created.`);
    } else {
      dispatch({ type: 'ADMIN_UPDATE', payload: { key: 'adminTiers', item: { ...draft, id: modal.origId } } });
      toast.success(`Tier "${draft.name}" saved.`);
    }
    closeModal();
  };

  const deleteTier = (tier) => {
    const inUse = mappings.filter(m => m.adminTierId === tier.id).length;
    if (inUse > 0) {
      toast.success(`Cannot delete — ${inUse} role mapping(s) reference this tier. Update them first.`);
      return;
    }
    dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'adminTiers', id: tier.id } });
    toast.success(`Tier "${tier.name}" deleted.`);
    setConfirmDelete(null);
  };

  return (
    <>
      {/* Page header */}
      <div className="flex items-start justify-between gap-3 flex-wrap rounded-xl px-5 py-4 mb-5 bg-app-panel/80 border border-border-base backdrop-blur-sm shadow-lg shadow-black/20">
        <div>
          <div className="text-[18px] font-bold text-white tracking-[-0.2px]">Management Roles</div>
          <div className="text-[12px] mt-1" style={{ color: ADMIN.textMute }}>
            Define admin tiers with granular section and action permissions. Assign tiers to Discord roles via the Role Mapping page.
          </div>
        </div>
        <SonButton variant="red" onClick={openAdd} style={{ gap: 6, flexShrink: 0 }}>
          <MdAdd size={16} /> Create Tier
        </SonButton>
      </div>

      {/* How it works */}
      <AdminPanel>
        <div className="flex gap-4 flex-wrap">
          {[
            { label: 'Define Tiers', desc: 'Create management roles (Admin, Senior Admin, Head Admin, etc.) with specific permissions here.', color: '#3a88e8' },
            { label: 'Assign in Role Mapping', desc: 'Link each tier to a Discord server role in Users → Role Mapping. When portal is set to "Admin", pick the tier.', color: '#a855f7' },
            { label: 'Automatic on Login', desc: "When a member logs in via Discord, the backend reads their roles, finds the right tier, and scopes their admin nav.", color: '#22c55e' },
          ].map(step => (
            <div key={step.label} className="flex-1 min-w-[200px] p-3 rounded-lg"
              style={{ background: `${step.color}0c`, border: `1px solid ${step.color}25` }}>
              <div className="text-[12px] font-bold mb-1" style={{ color: step.color }}>{step.label}</div>
              <div className="text-[11.5px] leading-relaxed" style={{ color: ADMIN.textMute }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </AdminPanel>

      {/* Tier list */}
      <AdminPanel title="Configured Tiers" subtitle={`${tiers.length} tier${tiers.length !== 1 ? 's' : ''} · sorted by authority level`}>
        {tiers.length === 0
          ? <EmptyState>No management tiers yet. Create one above.</EmptyState>
          : (
            <div className="flex flex-col gap-3">
              {tiers.map(tier => {
                const inUse = mappings.filter(m => m.adminTierId === tier.id).length;
                return (
                  <div key={tier.id}>
                    <TierCard
                      tier={tier}
                      inUse={inUse}
                      onEdit={() => openEdit(tier)}
                      onDelete={() => setConfirmDelete(tier)}
                    />
                    {confirmDelete?.id === tier.id && (
                      <div className="mt-2 rounded-lg p-3 flex items-center gap-3"
                        style={{ background: '#1a0808', border: '1px solid #ef444440' }}>
                        <MdWarning size={15} style={{ color: '#f87171', flexShrink: 0 }} />
                        <div className="text-[12px] flex-1" style={{ color: '#fca5a5' }}>
                          Delete <strong>"{tier.name}"</strong>? This cannot be undone.
                        </div>
                        <SonButton variant="red" onClick={() => deleteTier(tier)} style={{ padding: '4px 12px', fontSize: 12 }}>
                          Delete
                        </SonButton>
                        <SonButton onClick={() => setConfirmDelete(null)} style={{ padding: '4px 12px', fontSize: 12 }}>
                          Cancel
                        </SonButton>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        <div className="mt-4">
          <SonButton variant="red" onClick={openAdd} style={{ gap: 6 }}>
            <MdAdd size={16} /> Create Tier
          </SonButton>
        </div>
      </AdminPanel>

      {modal && (
        <TierModal
          draft={modal.draft}
          setDraft={(updater) => setModal(m => ({ ...m, draft: typeof updater === 'function' ? updater(m.draft) : updater }))}
          onSave={saveTier}
          onClose={closeModal}
          isNew={modal.isNew}
        />
      )}
    </>
  );
}
