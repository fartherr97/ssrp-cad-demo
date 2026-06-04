import { useState, useEffect } from 'react';
import Select from '../../../components/ui/Select';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import {
  AdminPanel, SonButton, SonIconBtn, SonSearch, SON_INPUT, SON_LABEL, SonBadge, EmptyState, ADMIN,
} from '../AdminKit';
import { MdAdd, MdDelete, MdExpandMore, MdChevronRight, MdSave } from 'react-icons/md';

function DeptCard({ d, onSave, onDelete }) {
  const [draft, setDraft] = useState({ ...d });
  const [open, setOpen] = useState(false);

  useEffect(() => { setDraft({ ...d }); }, [d.id]);

  const set = (patch) => setDraft(p => ({ ...p, ...patch }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(d);

  return (
    <div className="rounded-lg p-4" style={{ background: ADMIN.bg, border: `1px solid ${dirty ? ADMIN.borderHi : ADMIN.border}` }}>
      <div className="flex items-center gap-2 mb-3">
        <SonBadge color={ADMIN.blue}>Agency</SonBadge>
        <SonBadge color={d.color || ADMIN.green}>{d.subdivisions?.length || 0} subdivisions</SonBadge>
        <div className="ml-auto flex gap-1.5">
          <SonButton variant="red" onClick={() => onSave(draft)} disabled={!dirty} style={{ padding: '4px 10px', fontSize: 12 }}>
            <MdSave size={14} /> {dirty ? 'Save' : 'Saved'}
          </SonButton>
          <SonIconBtn icon={MdDelete} danger title="Delete agency" onClick={onDelete} />
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
          <div className="expand-section grid grid-cols-2 gap-[10px]">
            <div className="col-span-2">
              <label style={SON_LABEL}>Type</label>
              <Select style={SON_INPUT} value={draft.type || 'Law Enforcement'} onChange={e => set({ type: e.target.value })}>
                <option>Civilian</option>
                <option>Law Enforcement</option>
                <option>Fire &amp; EMS</option>
                <option>Dispatch</option>
              </Select>
            </div>
            <div className="col-span-2">
              <label style={SON_LABEL}>Subdivisions (comma separated)</label>
              <input style={SON_INPUT} value={(draft.subdivisions || []).join(', ')}
                onChange={e => set({ subdivisions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
              <div style={{ fontSize: 11, color: ADMIN.textMute, marginTop: 4 }}>
                Subdivisions become selectable for this department's units and register in the Command Portal's Subdivision Hours tracker.
              </div>
            </div>
            <div className="col-span-2">
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
          <div className="text-[11px] text-amber-400">Unsaved changes * click Save to apply.</div>
        )}
      </div>
    </div>
  );
}

export default function Departments() {
  const { state, dispatch } = useCAD();
  const { departments } = state;
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
              <DeptCard key={d.id} d={d} onSave={saveDept} onDelete={() => deleteDept(d.id)} />
            ))}
          </div>
        )}
        <div className="mt-4">
          <SonButton variant="red" onClick={() => { dispatch({ type: 'ADD_DEPARTMENT', payload: { name: 'New Agency', short: 'NEW', type: 'LEO', color: '#3a88e8', subdivisions: [], radioChannel: '' } }); toast.success('Agency added.'); }}>
            <MdAdd size={16} /> Add Agency
          </SonButton>
        </div>
      </AdminPanel>
    </>
  );
}
