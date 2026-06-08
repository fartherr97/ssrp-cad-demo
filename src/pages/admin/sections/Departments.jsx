import { useState, useEffect } from 'react';
import Select from '../../../components/ui/Select';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import {
  AdminPanel, SonButton, SonIconBtn, SonSearch, SON_INPUT, SON_LABEL, SonBadge, EmptyState, ADMIN,
} from '../AdminKit';
import { MdAdd, MdDelete, MdExpandMore, MdChevronRight, MdSave, MdWarning, MdClose } from 'react-icons/md';

const ROUTING_ROLES = [
  { value: '',       label: 'None'                       },
  { value: 'LEO',    label: 'LEO — Law Enforcement'      },
  { value: 'HCFR',   label: 'HCFR — Fire / EMS'          },
  { value: 'FDOT',   label: 'FDOT — Transport / Tow'     },
  { value: 'DISPATCH', label: 'Dispatch'                 },
];

const ROLE_COLOR = {
  LEO:      '#3a88e8',
  HCFR:     '#e04020',
  FDOT:     '#e07820',
  DISPATCH: '#a855f7',
};

function DeleteGuard({ dept, officerCount, onConfirm, onCancel }) {
  const role = dept.routingRole;
  return (
    <div className="rounded-lg p-3 mt-2" style={{ background: '#3a1a1a', border: '1px solid #e0402060' }}>
      <div className="flex items-start gap-2 mb-3">
        <MdWarning size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
        <div className="text-[12px] leading-relaxed" style={{ color: '#f1a07a' }}>
          <strong>Delete "{dept.name}"?</strong>
          <ul className="mt-1.5 ml-2 list-disc list-inside space-y-0.5" style={{ color: '#e2c08a' }}>
            {officerCount > 0 && (
              <li>{officerCount} officer{officerCount !== 1 ? 's' : ''} will lose their department reference.</li>
            )}
            {role && (
              <li>
                Routing role <strong style={{ color: ROLE_COLOR[role] || '#f59e0b' }}>{role}</strong> will be lost —
                requests routed to this agency may become undelivered.
              </li>
            )}
          </ul>
          <div className="mt-2" style={{ color: '#94a3b8' }}>This cannot be undone. The backend configuration may need to be updated.</div>
        </div>
      </div>
      <div className="flex gap-2">
        <SonButton variant="red" onClick={onConfirm} style={{ padding: '4px 12px', fontSize: 12 }}>
          <MdDelete size={13} /> Force Delete
        </SonButton>
        <SonButton onClick={onCancel} style={{ padding: '4px 12px', fontSize: 12 }}>Cancel</SonButton>
      </div>
    </div>
  );
}

function DeptCard({ d, onSave, onDelete, officers = [] }) {
  const [draft, setDraft] = useState({ ...d });
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [subInput, setSubInput] = useState('');

  useEffect(() => { setDraft({ ...d }); setConfirmDelete(false); }, [d.id]);

  const set = (patch) => setDraft(p => ({ ...p, ...patch }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(d);

  const addSub = () => {
    const v = subInput.trim();
    if (!v) return;
    const existing = draft.subdivisions || [];
    if (!existing.some(s => s.toLowerCase() === v.toLowerCase())) {
      set({ subdivisions: [...existing, v] });
    }
    setSubInput('');
  };
  const removeSub = (idx) => set({ subdivisions: (draft.subdivisions || []).filter((_, j) => j !== idx) });

  const attachedCount = officers.filter(o => o.dept === d.id).length;
  const needsGuard = attachedCount > 0 || !!d.routingRole;

  const handleDeleteClick = () => {
    if (needsGuard) {
      setConfirmDelete(true);
    } else {
      onDelete();
    }
  };

  return (
    <div className="rounded-lg p-4" style={{ background: ADMIN.bg, border: `1px solid ${dirty ? ADMIN.borderHi : ADMIN.border}` }}>
      <div className="flex items-center gap-2 mb-3">
        <SonBadge color={ADMIN.blue}>Agency</SonBadge>
        <SonBadge color={d.color || ADMIN.green}>{d.subdivisions?.length || 0} subdivisions</SonBadge>
        {d.routingRole && (
          <SonBadge color={ROLE_COLOR[d.routingRole] || ADMIN.textMute}>{d.routingRole}</SonBadge>
        )}
        <div className="ml-auto flex gap-1.5">
          <SonButton variant="red" onClick={() => onSave(draft)} disabled={!dirty} style={{ padding: '4px 10px', fontSize: 12 }}>
            <MdSave size={14} /> {dirty ? 'Save' : 'Saved'}
          </SonButton>
          <SonIconBtn icon={MdDelete} danger title="Delete agency" onClick={handleDeleteClick} />
          <SonIconBtn icon={open ? MdExpandMore : MdChevronRight} title="Expand" onClick={() => setOpen(v => !v)} />
        </div>
      </div>
      <div className="grid gap-[10px]">
        <div>
          <label style={SON_LABEL}>Name</label>
          <input style={SON_INPUT} value={draft.name} onChange={e => set({ name: e.target.value })} />
        </div>
        <div>
          <label style={SON_LABEL}>Short / Description</label>
          <input style={SON_INPUT} value={draft.short} onChange={e => set({ short: e.target.value })} />
        </div>
        {open && (
          <div className="expand-section grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
            <div>
              <label style={SON_LABEL}>Type</label>
              <Select style={SON_INPUT} value={draft.type || 'Law Enforcement'} onChange={e => set({ type: e.target.value })}>
                <option>Civilian</option>
                <option>Law Enforcement</option>
                <option>Fire &amp; EMS</option>
                <option>Dispatch</option>
              </Select>
            </div>
            <div>
              <label style={SON_LABEL}>Routing Role</label>
              <Select
                style={SON_INPUT}
                value={draft.routingRole || ''}
                onChange={e => set({ routingRole: e.target.value || null })}
              >
                {ROUTING_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </Select>
            </div>
            <div className="sm:col-span-2" style={{ fontSize: 11, color: ADMIN.textMute, marginTop: -4 }}>
              Routing role pins this agency to a specific request feed (HCFR → Fire Board, FDOT → Tow dispatch). Agencies with a role cannot be deleted without a warning.
            </div>
            <div className="sm:col-span-2">
              <label style={SON_LABEL}>Subdivisions</label>
              {(draft.subdivisions || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {draft.subdivisions.map((s, i) => (
                    <span key={`${s}-${i}`} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-[12px] font-semibold"
                      style={{ background: 'rgba(58,136,232,0.15)', color: '#7fb3f5', border: '1px solid rgba(58,136,232,0.4)' }}>
                      {s}
                      <button type="button" onClick={() => removeSub(i)} title={`Remove ${s}`}
                        className="flex items-center justify-center cursor-pointer bg-transparent border-none p-0 hover:opacity-70"
                        style={{ color: '#7fb3f5' }}>
                        <MdClose size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...SON_INPUT, flex: 1 }} value={subInput}
                  placeholder="Type a subdivision, then press Enter"
                  onChange={e => setSubInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSub(); } }} />
                <SonButton variant="red" onClick={addSub} disabled={!subInput.trim()}><MdAdd size={15} /> Add</SonButton>
              </div>
              <div style={{ fontSize: 11, color: ADMIN.textMute, marginTop: 4 }}>
                Subdivisions become selectable for this department's units and register in the Command Portal's Subdivision Hours tracker.
              </div>
            </div>
            <div className="sm:col-span-2">
              <label style={SON_LABEL}>Department Logo URL</label>
              <div className="flex items-center gap-3">
                <input style={{ ...SON_INPUT, flex: 1 }} value={draft.logoUrl || ''} placeholder="https://…"
                  onChange={e => set({ logoUrl: e.target.value })} />
                {draft.logoUrl && (
                  <img src={draft.logoUrl} alt="logo preview"
                    style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6, background: ADMIN.panel2, border: `1px solid ${ADMIN.border}`, flexShrink: 0, padding: 3 }} />
                )}
              </div>
              <div style={{ fontSize: 11, color: ADMIN.textMute, marginTop: 4 }}>Paste a direct image URL. Logo appears on PDF exports for this department.</div>
            </div>
          </div>
        )}
        {dirty && (
          <div className="text-[11px] text-amber-400">Unsaved changes, click Save to apply.</div>
        )}
        {confirmDelete && (
          <DeleteGuard
            dept={d}
            officerCount={attachedCount}
            onConfirm={() => { setConfirmDelete(false); onDelete(); }}
            onCancel={() => setConfirmDelete(false)}
          />
        )}
      </div>
    </div>
  );
}

export default function Departments() {
  const { state, dispatch } = useCAD();
  const { departments, officers = [] } = state;
  const groups = state.persistentGroups || [];
  const toast = useToast();
  const [groupName, setGroupName] = useState('');
  const [query, setQuery] = useState('');

  const addGroup = () => {
    if (!groupName.trim()) return;
    dispatch({ type: 'ADMIN_ADD', payload: { key: 'persistentGroups', item: { name: groupName.trim() } } });
    toast.success('Group added.');
    setGroupName('');
  };

  const filtered = departments.filter(d => !query || d.name.toLowerCase().includes(query.toLowerCase()) || d.short.toLowerCase().includes(query.toLowerCase()));

  const saveDept = (updated) => { dispatch({ type: 'UPDATE_DEPARTMENT', payload: updated }); toast.success('Department saved.'); };
  const deleteDept = (id) => { dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'departments', id } }); toast.success('Agency deleted.'); };

  return (
    <>
      <AdminPanel center title="Persistent Unit Groups" subtitle="These groups always appear in dispatch, even when no units are assigned.">
        {groups.length === 0
          ? <div className="text-[12px] mb-3" style={{ color: ADMIN.textMute }}>No persistent groups configured.</div>
          : (
            <div className="flex flex-wrap gap-2 mb-3">
              {groups.map(g => (
                <div key={g.id} className="flex items-center gap-2 px-3 py-1.5 rounded-[7px]"
                  style={{ background: ADMIN.panel2, border: `1px solid ${ADMIN.border}` }}>
                  <span className="text-[13px]" style={{ color: ADMIN.text }}>{g.name}</span>
                  <SonIconBtn icon={MdDelete} danger onClick={() => { dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'persistentGroups', id: g.id } }); toast.success('Group removed.'); }} />
                </div>
              ))}
            </div>
          )}
        <div className="flex gap-2 rounded-lg p-[14px]" style={{ border: `1px dashed ${ADMIN.borderHi}` }}>
          <div className="flex-1">
            <label style={SON_LABEL}>Group Name</label>
            <input style={SON_INPUT} placeholder="e.g. SWAT Element" value={groupName}
              onChange={e => setGroupName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGroup()} />
          </div>
          <SonButton variant="green" onClick={addGroup} style={{ alignSelf: 'flex-end' }}><MdAdd size={16} /> Add</SonButton>
        </div>
      </AdminPanel>

      <AdminPanel
        title="Department Editor"
        subtitle="Manage agencies, departments, and subdivisions."
        right={<SonSearch value={query} onChange={setQuery} placeholder="Search agencies…" />}
      >
        {filtered.length === 0 ? <EmptyState>No agencies match.</EmptyState> : (
          <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))' }}>
            {filtered.map(d => (
              <DeptCard key={d.id} d={d} onSave={saveDept} onDelete={() => deleteDept(d.id)} officers={officers} />
            ))}
          </div>
        )}
        <div className="mt-4">
          <SonButton variant="red" onClick={() => { dispatch({ type: 'ADD_DEPARTMENT', payload: { name: 'New Agency', short: 'NEW', type: 'Law Enforcement', color: '#3a88e8', subdivisions: [], radioChannel: '', routingRole: null } }); toast.success('Agency added.'); }}>
            <MdAdd size={16} /> Add Agency
          </SonButton>
        </div>
      </AdminPanel>
    </>
  );
}
