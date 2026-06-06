import { useState, useMemo } from 'react';
import Select from '../../../components/ui/Select';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import { isESDept } from '../../../constants/portals';
import {
  AdminPageTitle, AdminPanel, SonButton, SonIconBtn, SonBadge, EmptyState, ADMIN, SON_INPUT, SON_LABEL,
} from '../AdminKit';
import {
  MdAdd, MdEdit, MdDelete, MdContentCopy, MdCheck, MdArrowForward,
  MdInfo, MdWarning, MdCode, MdShield, MdExpandMore,
} from 'react-icons/md';
import { FaDiscord } from 'react-icons/fa6';

/* ── Portal + role metadata ─────────────────────────────────────────── */
const PORTAL_META = {
  civilian:   { label: 'Civilian',        color: '#9090cc' },
  business:   { label: 'Business',        color: '#44aacc' },
  leo:        { label: 'Law Enforcement', color: '#3a88e8' },
  fire:       { label: 'Fire / EMS',      color: '#e04020' },
  dispatch:   { label: 'Dispatch',        color: '#a855f7' },
  supervisor: { label: 'Supervisor',      color: '#f59e0b' },
  command:    { label: 'Command',         color: '#3d82f0' },
  admin:      { label: 'Admin',           color: '#22c55e' },
};

const ROLE_META = {
  civilian:   { label: 'Civilian',   desc: 'Civilian portal only'                      },
  officer:    { label: 'Officer',    desc: 'LEO CAD + records access'                  },
  fire:       { label: 'Fire / EMS', desc: 'Fire Board + EMS tools'                    },
  dispatcher: { label: 'Dispatcher', desc: 'Full dispatch console + CAD board'         },
  supervisor: { label: 'Supervisor', desc: 'Report review + Supervisor Portal'         },
  command:    { label: 'Command',    desc: 'Command Portal + cross-dept analytics'     },
  admin:      { label: 'Admin',      desc: 'Full admin access — all portals + config'  },
};

const EMPTY_MAPPING = {
  label: '', discordRoleName: '', discordRoleId: '',
  cadPortal: 'leo', cadRole: 'officer',
  deptId: null, autoRank: '',
  priority: 50, notes: '',
};

/* ── Small helpers ──────────────────────────────────────────────────── */
function PortalBadge({ portal }) {
  const m = PORTAL_META[portal] || { label: portal, color: ADMIN.textMute };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: `${m.color}22`, color: m.color, border: `1px solid ${m.color}40` }}>
      {m.label}
    </span>
  );
}

function RoleBadge({ role }) {
  const m = ROLE_META[role] || { label: role };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold"
      style={{ background: '#ffffff0d', color: '#94a3b8', border: '1px solid #1e293b' }}>
      {m.label}
    </span>
  );
}

function PriorityBadge({ value }) {
  const heat = value >= 80 ? '#22c55e' : value >= 50 ? '#3a88e8' : value >= 30 ? '#f59e0b' : '#64748b';
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[12px] font-bold tabular-nums"
      style={{ background: `${heat}18`, color: heat, border: `1.5px solid ${heat}50` }}>
      {value}
    </span>
  );
}

function IdPill({ id }) {
  if (!id) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold"
      style={{ background: '#f59e0b18', color: '#f59e0b', border: '1px solid #f59e0b40' }}>
      <MdWarning size={10} /> Needs ID
    </span>
  );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono"
      style={{ background: '#1e3a5f', color: '#7dd3fc', border: '1px solid #1e4a7a' }}>
      {id}
    </span>
  );
}

/* ── Add / Edit Modal ───────────────────────────────────────────────── */
function MappingModal({ draft, setDraft, departments, adminTiers, onSave, onClose, isNew }) {
  const set = (patch) => setDraft(p => ({ ...p, ...patch }));
  const missingLabel = !draft.label.trim();
  const missingPortal = !draft.cadPortal;

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: '#0d1a2e', border: '1px solid #1e3a5f' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: '#1e3a5f', background: '#0b1424' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: '#5865F218', border: '1px solid #5865F240' }}>
            <FaDiscord size={17} style={{ color: '#5865F2' }} />
          </div>
          <div>
            <div className="text-[14px] font-bold text-white">{isNew ? 'Add Role Mapping' : 'Edit Role Mapping'}</div>
            <div className="text-[11px]" style={{ color: ADMIN.textMute }}>Configure a Discord role → CAD portal assignment</div>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-3 max-h-[75vh] overflow-y-auto">

          {/* Label */}
          <div>
            <label style={SON_LABEL}>Mapping Label <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={SON_INPUT} placeholder="e.g. TPD Sergeant"
              value={draft.label} onChange={e => set({ label: e.target.value })} />
            <div style={{ fontSize: 11, color: ADMIN.textMute, marginTop: 3 }}>Internal name shown in this table — not exposed to users.</div>
          </div>

          {/* Discord role name + ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label style={SON_LABEL}>Discord Role Name</label>
              <input style={SON_INPUT} placeholder="e.g. TPD Officer"
                value={draft.discordRoleName} onChange={e => set({ discordRoleName: e.target.value })} />
              <div style={{ fontSize: 11, color: ADMIN.textMute, marginTop: 3 }}>Reference only — the role's display name in Discord.</div>
            </div>
            <div>
              <label style={SON_LABEL}>Discord Role ID</label>
              <input style={{ ...SON_INPUT, fontFamily: 'monospace' }} placeholder="e.g. 1234567890123456789"
                value={draft.discordRoleId} onChange={e => set({ discordRoleId: e.target.value.trim() })} />
              <div style={{ fontSize: 11, color: ADMIN.textMute, marginTop: 3 }}>Snowflake ID from Server Settings → Roles.</div>
            </div>
          </div>

          {/* Portal + Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label style={SON_LABEL}>CAD Portal <span style={{ color: '#ef4444' }}>*</span></label>
              <Select style={SON_INPUT} value={draft.cadPortal}
                onChange={e => set({ cadPortal: e.target.value, adminTierId: null })}>
                {Object.entries(PORTAL_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </Select>
              {draft.cadPortal && (
                <div className="mt-1.5">
                  <PortalBadge portal={draft.cadPortal} />
                </div>
              )}
            </div>
            <div>
              <label style={SON_LABEL}>CAD Role Level</label>
              <Select style={SON_INPUT} value={draft.cadRole} onChange={e => set({ cadRole: e.target.value })}>
                {Object.entries(ROLE_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </Select>
              {draft.cadRole && (
                <div className="mt-1.5 text-[11px]" style={{ color: ADMIN.textMute }}>
                  {ROLE_META[draft.cadRole]?.desc}
                </div>
              )}
            </div>
          </div>

          {/* Admin Tier — only shown when portal = admin */}
          {draft.cadPortal === 'admin' && (
            <div className="rounded-lg p-3" style={{ background: '#22c55e0a', border: '1px solid #22c55e30' }}>
              <label style={{ ...SON_LABEL, color: '#22c55e' }}>Management Tier</label>
              <Select style={SON_INPUT} value={draft.adminTierId ?? ''}
                onChange={e => set({ adminTierId: e.target.value ? Number(e.target.value) : null })}>
                <option value="">No tier assigned (full access)</option>
                {[...adminTiers].sort((a, b) => b.level - a.level).map(t => (
                  <option key={t.id} value={t.id}>{t.name} (Level {t.level})</option>
                ))}
              </Select>
              <div style={{ fontSize: 11, color: '#22c55e80', marginTop: 4 }}>
                Determines which admin portal sections this person can access. Configure tiers in Users → Mgmt. Roles.
              </div>
            </div>
          )}

          {/* Department + rank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label style={SON_LABEL}>Auto-assign Department</label>
              <Select style={SON_INPUT} value={draft.deptId ?? ''} onChange={e => set({ deptId: e.target.value ? Number(e.target.value) : null })}>
                <option value="">None / Any</option>
                <optgroup label="Emergency Services">
                  {departments.filter(isESDept).map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.short})</option>
                  ))}
                </optgroup>
                <optgroup label="Support / Civilian">
                  {departments.filter(d => !isESDept(d)).map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.short})</option>
                  ))}
                </optgroup>
              </Select>
              <div style={{ fontSize: 11, color: ADMIN.textMute, marginTop: 3 }}>Automatically assigns the user to this department on sign-in.</div>
            </div>
            <div>
              <label style={SON_LABEL}>Auto-assign Rank</label>
              <input style={SON_INPUT} placeholder="e.g. Officer, Trooper"
                value={draft.autoRank} onChange={e => set({ autoRank: e.target.value })} />
              <div style={{ fontSize: 11, color: ADMIN.textMute, marginTop: 3 }}>Default rank assigned on first login. User can change later.</div>
            </div>
          </div>

          {/* Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <div>
              <label style={SON_LABEL}>Priority (1 – 100)</label>
              <input style={SON_INPUT} type="number" min={1} max={100}
                value={draft.priority} onChange={e => set({ priority: Math.min(100, Math.max(1, Number(e.target.value) || 1)) })} />
              <div style={{ fontSize: 11, color: ADMIN.textMute, marginTop: 3 }}>
                If a user holds multiple Discord roles that each match a rule, the highest priority wins.
              </div>
            </div>
            <div className="pt-5 flex items-center justify-center">
              <PriorityBadge value={draft.priority} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={SON_LABEL}>Notes for Backend Developer</label>
            <textarea style={{ ...SON_INPUT, resize: 'vertical', minHeight: 60 }}
              placeholder="Describe what this role grants, any special behavior, edge cases…"
              value={draft.notes} onChange={e => set({ notes: e.target.value })} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: '#1e3a5f', background: '#0b1424' }}>
          <SonButton onClick={onClose} style={{ padding: '6px 16px' }}>Cancel</SonButton>
          <SonButton variant="red" disabled={missingLabel || missingPortal}
            onClick={() => { if (!missingLabel && !missingPortal) onSave(draft); }}
            style={{ padding: '6px 16px' }}>
            {isNew ? <><MdAdd size={15} /> Add Mapping</> : <><MdCheck size={15} /> Save Changes</>}
          </SonButton>
        </div>
      </div>
    </div>
  );
}

/* ── Export JSON panel ──────────────────────────────────────────────── */
function ExportPanel({ mappings }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const json = useMemo(() => {
    const sorted = [...mappings].sort((a, b) => b.priority - a.priority);
    const out = sorted.map(m => ({
      discordRoleId:   m.discordRoleId   || null,
      discordRoleName: m.discordRoleName || m.label,
      cadPortal:       m.cadPortal,
      cadRole:         m.cadRole,
      deptId:          m.deptId   ?? null,
      autoRank:        m.autoRank || null,
      priority:        m.priority,
    }));
    return JSON.stringify({ roleMappings: out }, null, 2);
  }, [mappings]);

  const copy = () => {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const missingIds = mappings.filter(m => !m.discordRoleId).length;

  return (
    <div className="rounded-xl border" style={{ background: '#0b1424', borderColor: '#1e3a5f' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left cursor-pointer"
        style={{ background: 'transparent', border: 'none' }}>
        <MdCode size={18} style={{ color: '#3a88e8', flexShrink: 0 }} />
        <div className="flex-1">
          <div className="text-[13px] font-bold text-white">Configuration Export</div>
          <div className="text-[11px] mt-0.5" style={{ color: ADMIN.textMute }}>
            JSON payload the backend uses to map Discord role IDs to CAD portals on OAuth login.
            {missingIds > 0 && <span style={{ color: '#f59e0b' }}> {missingIds} role{missingIds !== 1 ? 's' : ''} still need Discord IDs.</span>}
          </div>
        </div>
        <MdExpandMore size={18} style={{ color: ADMIN.textMute, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: '#1e3a5f' }}>
          <div className="flex justify-end mt-3 mb-2">
            <SonButton onClick={copy} style={{ padding: '5px 14px', fontSize: 12, gap: 6 }}>
              {copied ? <><MdCheck size={14} /> Copied!</> : <><MdContentCopy size={14} /> Copy JSON</>}
            </SonButton>
          </div>
          <pre className="rounded-lg p-4 text-[11px] overflow-x-auto leading-relaxed"
            style={{ background: '#060d1a', color: '#7dd3fc', border: '1px solid #1e3a5f', fontFamily: 'monospace' }}>
            {json}
          </pre>
          <div className="mt-3 p-3 rounded-lg text-[11px] leading-relaxed"
            style={{ background: '#f59e0b0d', border: '1px solid #f59e0b30', color: '#d4a63a' }}>
            <strong>Implementation note:</strong> On Discord OAuth callback, query the user's role list,
            filter to IDs present in this table, pick the entry with the highest <code>priority</code>,
            then assign <code>cadPortal</code>, <code>cadRole</code>, <code>deptId</code>, and
            <code> autoRank</code> to the session. If no role matches, deny access or fall back to
            the lowest-priority civilian mapping.
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function RoleMapping() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const mappings = state.discordRoleMappings || [];
  const departments = state.departments || [];
  const adminTiers = state.adminTiers || [];

  const [modal, setModal] = useState(null); // null | { draft, isNew, origId }

  const openAdd = () => setModal({ draft: { ...EMPTY_MAPPING }, isNew: true, origId: null });
  const openEdit = (m) => setModal({ draft: { ...m }, isNew: false, origId: m.id });
  const closeModal = () => setModal(null);

  const saveMapping = (draft) => {
    if (modal.isNew) {
      dispatch({ type: 'ADMIN_ADD', payload: { key: 'discordRoleMappings', item: draft } });
      toast.success('Mapping added.');
    } else {
      dispatch({ type: 'ADMIN_UPDATE', payload: { key: 'discordRoleMappings', item: { ...draft, id: modal.origId } } });
      toast.success('Mapping saved.');
    }
    closeModal();
  };

  const deleteMapping = (id) => {
    dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'discordRoleMappings', id } });
    toast.success('Mapping removed.');
  };

  const sorted = useMemo(() =>
    [...mappings].sort((a, b) => b.priority - a.priority),
    [mappings]
  );

  const missingCount = mappings.filter(m => !m.discordRoleId).length;

  return (
    <>
      <AdminPageTitle right={
        <SonButton variant="red" onClick={openAdd} style={{ gap: 6 }}>
          <MdAdd size={16} /> Add Mapping
        </SonButton>
      }>
        Discord Role Mapping
      </AdminPageTitle>

      {/* How it works */}
      <AdminPanel>
        <div className="flex items-start gap-3 mb-4">
          <MdInfo size={16} style={{ color: '#3a88e8', flexShrink: 0, marginTop: 1 }} />
          <div className="text-[12.5px] leading-relaxed" style={{ color: '#94a3b8' }}>
            <strong className="text-white">How this works:</strong> When a member logs in via Discord OAuth,
            the backend fetches their Discord role list and finds the highest-priority rule below that matches.
            That rule determines which CAD portal they see and what they can do. If a member holds multiple
            matching roles, the one with the highest priority number wins.
          </div>
        </div>

        {/* Flow diagram */}
        <div className="flex flex-wrap items-center gap-2 text-[11.5px] font-semibold">
          {[
            { label: 'Discord OAuth Login', color: '#5865F2' },
            { label: 'Role ID Lookup',       color: '#3a88e8' },
            { label: 'Priority Resolution',  color: '#a855f7' },
            { label: 'CAD Portal Assigned',  color: '#22c55e' },
            { label: 'Feature Access',        color: '#f59e0b' },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg"
                style={{ background: `${step.color}14`, border: `1px solid ${step.color}40`, color: step.color }}>
                {step.label}
              </div>
              {i < arr.length - 1 && <MdArrowForward size={14} style={{ color: '#334155', flexShrink: 0 }} />}
            </div>
          ))}
        </div>

        {missingCount > 0 && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px]"
            style={{ background: '#f59e0b0d', border: '1px solid #f59e0b30', color: '#d4a63a' }}>
            <MdWarning size={14} style={{ flexShrink: 0 }} />
            <span><strong>{missingCount} mapping{missingCount !== 1 ? 's' : ''}</strong> still need a Discord Role ID before the backend can use them.</span>
          </div>
        )}
      </AdminPanel>

      {/* Mappings table */}
      <AdminPanel title="Role Mappings" subtitle={`${sorted.length} rules · sorted by priority (highest first)`}>
        {sorted.length === 0
          ? <EmptyState>No role mappings configured. Add one to get started.</EmptyState>
          : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12.5px]" style={{ minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${ADMIN.border}` }}>
                    {['Pri.', 'Mapping Label', 'Discord Role', 'CAD Assignment', 'Dept / Rank', 'Notes', ''].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-[10.5px] font-bold uppercase tracking-[0.5px]"
                        style={{ color: ADMIN.textMute }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(m => {
                    const dept = departments.find(d => d.id === m.deptId);
                    const tier = m.adminTierId ? adminTiers.find(t => t.id === m.adminTierId) : null;
                    return (
                      <tr key={m.id} className="group"
                        style={{ borderBottom: `1px solid ${ADMIN.border}` }}>

                        {/* Priority */}
                        <td className="py-3 px-3 w-12">
                          <PriorityBadge value={m.priority} />
                        </td>

                        {/* Label */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white leading-tight">{m.label}</div>
                        </td>

                        {/* Discord role */}
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1">
                            {m.discordRoleName && (
                              <div className="flex items-center gap-1.5 text-[12px]" style={{ color: '#cbd5e1' }}>
                                <FaDiscord size={11} style={{ color: '#5865F2', flexShrink: 0 }} />
                                {m.discordRoleName}
                              </div>
                            )}
                            <IdPill id={m.discordRoleId} />
                          </div>
                        </td>

                        {/* CAD assignment */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <PortalBadge portal={m.cadPortal} />
                            <MdArrowForward size={12} style={{ color: '#334155', flexShrink: 0 }} />
                            <RoleBadge role={m.cadRole} />
                          </div>
                          {tier && (
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold"
                                style={{ background: `${tier.color}18`, color: tier.color, border: `1px solid ${tier.color}40` }}>
                                {tier.name}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Dept / rank */}
                        <td className="py-3 px-3">
                          {dept || m.autoRank ? (
                            <div className="flex flex-col gap-0.5 text-[11.5px]" style={{ color: '#94a3b8' }}>
                              {dept && (
                                <span className="inline-flex items-center gap-1">
                                  <MdShield size={11} style={{ color: dept.color || ADMIN.blue, flexShrink: 0 }} />
                                  {dept.short}
                                </span>
                              )}
                              {m.autoRank && <span style={{ color: '#64748b' }}>{m.autoRank}</span>}
                            </div>
                          ) : (
                            <span style={{ color: '#334155', fontSize: 11 }}>—</span>
                          )}
                        </td>

                        {/* Notes */}
                        <td className="py-3 px-3 max-w-[220px]">
                          {m.notes
                            ? <div className="text-[11px] leading-relaxed line-clamp-2" style={{ color: '#64748b' }}>{m.notes}</div>
                            : <span style={{ color: '#334155', fontSize: 11 }}>—</span>
                          }
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 w-16">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <SonIconBtn icon={MdEdit} title="Edit mapping" onClick={() => openEdit(m)} />
                            <SonIconBtn icon={MdDelete} danger title="Delete mapping" onClick={() => deleteMapping(m.id)} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        <div className="mt-4">
          <SonButton variant="red" onClick={openAdd} style={{ gap: 6 }}>
            <MdAdd size={16} /> Add Mapping
          </SonButton>
        </div>
      </AdminPanel>

      {/* CAD roles reference card */}
      <AdminPanel title="CAD Role Reference" subtitle="What each role level grants inside the CAD.">
        <div className="grid grid-cols-2 gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {Object.entries(ROLE_META).map(([key, meta]) => {
            const portal = {
              civilian: 'civilian', officer: 'leo', fire: 'fire',
              dispatcher: 'dispatch', supervisor: 'supervisor', command: 'command', admin: 'admin',
            }[key] || 'civilian';
            const color = PORTAL_META[portal]?.color || '#64748b';
            return (
              <div key={key} className="flex items-start gap-3 px-3 py-2.5 rounded-lg"
                style={{ background: '#ffffff06', border: `1px solid ${ADMIN.border}` }}>
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
                <div>
                  <div className="text-[12.5px] font-bold" style={{ color }}>{meta.label}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: ADMIN.textMute }}>{meta.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </AdminPanel>

      {/* Export */}
      <ExportPanel mappings={mappings} />

      {/* Modal */}
      {modal && (
        <MappingModal
          draft={modal.draft}
          setDraft={(updater) => setModal(m => ({ ...m, draft: typeof updater === 'function' ? updater(m.draft) : updater }))}
          departments={departments}
          adminTiers={adminTiers}
          onSave={saveMapping}
          onClose={closeModal}
          isNew={modal.isNew}
        />
      )}
    </>
  );
}
