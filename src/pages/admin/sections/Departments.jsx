import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import {
  AdminPanel, SonButton, SonIconBtn, SonSearch, SON_INPUT, SON_LABEL, SonBadge, EmptyState, ADMIN,
} from '../AdminKit';
import { MdAdd, MdDelete, MdExpandMore, MdChevronRight } from 'react-icons/md';

export default function Departments() {
  const { state, dispatch } = useCAD();
  const { departments } = state;
  const groups = state.persistentGroups || [];
  const [groupName, setGroupName] = useState('');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(null);

  const addGroup = () => {
    if (!groupName.trim()) return;
    dispatch({ type: 'ADMIN_ADD', payload: { key: 'persistentGroups', item: { name: groupName.trim() } } });
    setGroupName('');
  };

  const filtered = departments.filter(d => !query || d.name.toLowerCase().includes(query.toLowerCase()) || d.short.toLowerCase().includes(query.toLowerCase()));
  const updateDept = (d, patch) => dispatch({ type: 'UPDATE_DEPARTMENT', payload: { ...d, ...patch } });

  return (
    <>
      {/* Persistent Unit Groups */}
      <AdminPanel center title="Persistent Unit Groups" subtitle="These groups always appear in dispatch, even when no units are assigned.">
        {groups.length === 0
          ? <div className="text-[12px] mb-3" style={{ color: ADMIN.textMute }}>No persistent groups configured.</div>
          : (
            <div className="flex flex-wrap gap-2 mb-3">
              {groups.map(g => (
                <div key={g.id} className="flex items-center gap-2 px-3 py-1.5 rounded-[7px]"
                  style={{ background: ADMIN.panel2, border: `1px solid ${ADMIN.border}` }}>
                  <span className="text-[13px]" style={{ color: ADMIN.text }}>{g.name}</span>
                  <SonIconBtn icon={MdDelete} danger onClick={() => dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'persistentGroups', id: g.id } })} />
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

      {/* Department editor */}
      <AdminPanel
        title="Department Editor"
        subtitle="Manage agencies, departments, and sub-departments."
        right={<SonSearch value={query} onChange={setQuery} placeholder="Search agencies…" />}
      >
        {filtered.length === 0 ? <EmptyState>No agencies match.</EmptyState> : (
          <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))' }}>
            {filtered.map(d => {
              const open = expanded === d.id;
              return (
                <div key={d.id} className="rounded-lg p-4" style={{ background: ADMIN.bg, border: `1px solid ${ADMIN.border}` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <SonBadge color={ADMIN.blue}>Agency</SonBadge>
                    <SonBadge color={d.color || ADMIN.green}>{d.subdivisions?.length || 0} depts</SonBadge>
                    <div className="ml-auto flex gap-1.5">
                      <SonIconBtn icon={MdDelete} danger title="Delete agency"
                        onClick={() => dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'departments', id: d.id } })} />
                      <SonIconBtn icon={open ? MdExpandMore : MdChevronRight} title="Expand"
                        onClick={() => setExpanded(open ? null : d.id)} />
                    </div>
                  </div>
                  <div className="grid gap-[10px]">
                    <div>
                      <label style={SON_LABEL}>Name</label>
                      <input style={SON_INPUT} value={d.name} onChange={e => updateDept(d, { name: e.target.value })} />
                    </div>
                    <div>
                      <label style={SON_LABEL}>Short / Description</label>
                      <input style={SON_INPUT} value={d.short} onChange={e => updateDept(d, { short: e.target.value })} />
                    </div>
                    {open && (
                      <div className="expand-section grid grid-cols-2 gap-[10px]">
                        <div>
                          <label style={SON_LABEL}>Type</label>
                          <input style={SON_INPUT} value={d.type} onChange={e => updateDept(d, { type: e.target.value })} />
                        </div>
                        <div>
                          <label style={SON_LABEL}>Radio Channel</label>
                          <input style={SON_INPUT} value={d.radioChannel || ''} onChange={e => updateDept(d, { radioChannel: e.target.value })} />
                        </div>
                        <div className="col-span-2">
                          <label style={SON_LABEL}>Sub-departments (comma separated)</label>
                          <input style={SON_INPUT} value={(d.subdivisions || []).join(', ')}
                            onChange={e => updateDept(d, { subdivisions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-4">
          <SonButton variant="red" onClick={() => dispatch({ type: 'ADD_DEPARTMENT', payload: { name: 'New Agency', short: 'NEW', type: 'LEO', color: '#3a88e8', subdivisions: [], radioChannel: '' } })}>
            <MdAdd size={16} /> Add Agency
          </SonButton>
        </div>
      </AdminPanel>
    </>
  );
}
