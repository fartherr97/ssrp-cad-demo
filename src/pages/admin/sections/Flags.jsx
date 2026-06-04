import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import {
  ADMIN, AdminPageTitle, AdminPanel, SonButton, SonField, SON_INPUT, SON_LABEL,
  SonTable, SonRow, SonCell, SonBadge, SonIconBtn, EmptyState,
} from '../AdminKit';
import { MdFlag, MdAdd, MdDelete, MdEdit, MdCheck, MdClose } from 'react-icons/md';

const PRESET_COLORS = [
  '#ef4444', '#dc2626', '#b91c1c',
  '#f97316', '#f59e0b', '#eab308',
  '#22c55e', '#10b981', '#06b6d4',
  '#3b82f6', '#6366f1', '#a855f7',
  '#ec4899', '#94a3b8',
];

function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {PRESET_COLORS.map(c => (
        <button key={c} type="button" onClick={() => onChange(c)}
          className="w-6 h-6 rounded-md border-2 cursor-pointer transition-transform hover:scale-110 shrink-0"
          style={{ background: c, borderColor: value === c ? '#fff' : 'transparent' }} />
      ))}
    </div>
  );
}

const blank = { name: '', color: '#ef4444', description: '' };

export default function Flags() {
  const { state, dispatch } = useCAD();
  const { customFlags = [], civilians = [] } = state;
  const toast = useToast();

  const [editing, setEditing] = useState(null); // flagId being edited, or 'new'
  const [draft, setDraft] = useState(blank);

  const startNew = () => { setDraft(blank); setEditing('new'); };
  const startEdit = (f) => { setDraft({ name: f.name, color: f.color, description: f.description }); setEditing(f.id); };
  const cancel = () => { setEditing(null); setDraft(blank); };

  const save = () => {
    if (!draft.name.trim()) return;
    if (editing === 'new') {
      dispatch({ type: 'ADD_FLAG_DEF', payload: draft });
      toast.success('Flag created.');
    } else {
      dispatch({ type: 'UPDATE_FLAG_DEF', payload: { id: editing, ...draft } });
      toast.success('Flag updated.');
    }
    cancel();
  };

  const del = (id) => {
    if (!window.confirm('Delete this flag? It will be removed from all civilians.')) return;
    dispatch({ type: 'DELETE_FLAG_DEF', payload: id });
    toast.success('Flag deleted.');
  };

  // Count civilians using each flag
  const usageCount = (id) => civilians.filter(c => (c.flags || []).includes(id)).length;

  return (
    <>
      <AdminPageTitle right={
        <SonButton variant="red" onClick={startNew}><MdAdd size={16} /> New Flag</SonButton>
      }>
        <span className="inline-flex items-center gap-2">
          <MdFlag size={20} className="text-brand-bright" /> Civilian Flags
        </span>
      </AdminPageTitle>

      {/* ── New / Edit form ── */}
      {editing && (
        <AdminPanel title={editing === 'new' ? 'Create Flag' : 'Edit Flag'}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SonField label="Flag Name">
              <input style={SON_INPUT} value={draft.name} placeholder="e.g. Felon"
                onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} />
            </SonField>
            <SonField label="Description">
              <input style={SON_INPUT} value={draft.description} placeholder="Short description…"
                onChange={e => setDraft(p => ({ ...p, description: e.target.value }))} />
            </SonField>
            <SonField label="Colour">
              <div className="flex items-center gap-2 mt-1">
                <span className="w-6 h-6 rounded-md shrink-0" style={{ background: draft.color }} />
                <input style={{ ...SON_INPUT, width: 90, fontFamily: 'monospace' }} value={draft.color}
                  onChange={e => setDraft(p => ({ ...p, color: e.target.value }))} />
              </div>
              <ColorPicker value={draft.color} onChange={c => setDraft(p => ({ ...p, color: c }))} />
            </SonField>
          </div>
          {/* Preview */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-[11px] text-slate-500 uppercase tracking-[0.5px]">Preview:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{ background: `${draft.color}22`, color: draft.color, border: `1px solid ${draft.color}55` }}>
              <MdFlag size={11} /> {draft.name || 'Flag Name'}
            </span>
          </div>
          <div className="flex gap-2 mt-5">
            <SonButton variant="red" onClick={save}><MdCheck size={15} /> Save Flag</SonButton>
            <SonButton onClick={cancel}><MdClose size={15} /> Cancel</SonButton>
          </div>
        </AdminPanel>
      )}

      {/* ── Flag list ── */}
      <AdminPanel title="Configured Flags" subtitle="These flags can be applied to any civilian record.">
        <SonTable columns={[
          { label: 'Flag' },
          { label: 'Description' },
          { label: 'In Use', align: 'center', width: 80 },
          { label: '', align: 'right', width: 80 },
        ]}>
          {customFlags.map((f, i) => (
            <SonRow key={f.id} i={i}>
              <SonCell>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: `${f.color}22`, color: f.color, border: `1px solid ${f.color}55` }}>
                  <MdFlag size={11} /> {f.name}
                </span>
              </SonCell>
              <SonCell color={ADMIN.textDim}>{f.description || '*'}</SonCell>
              <SonCell align="center">
                <span className="text-[12px] font-mono" style={{ color: usageCount(f.id) > 0 ? ADMIN.amber : ADMIN.textMute }}>
                  {usageCount(f.id)}
                </span>
              </SonCell>
              <SonCell align="right">
                <div className="flex gap-1 justify-end">
                  <SonIconBtn icon={MdEdit} title="Edit" onClick={() => startEdit(f)} />
                  <SonIconBtn icon={MdDelete} danger title="Delete" onClick={() => del(f.id)} />
                </div>
              </SonCell>
            </SonRow>
          ))}
        </SonTable>
        {customFlags.length === 0 && <EmptyState>No flags configured.</EmptyState>}
      </AdminPanel>

      {/* ── Civilians with flags ── */}
      <AdminPanel title="Flagged Civilians" subtitle="All civilians currently carrying at least one flag.">
        {(() => {
          const flagged = civilians.filter(c => (c.flags || []).length > 0);
          if (flagged.length === 0) return <EmptyState>No flagged civilians.</EmptyState>;
          return (
            <SonTable columns={[
              { label: 'Name' }, { label: 'DL #' }, { label: 'Flags' },
              { label: '', align: 'right', width: 40 },
            ]}>
              {flagged.map((c, i) => (
                <SonRow key={c.id} i={i}>
                  <SonCell bold>{c.firstName} {c.lastName}</SonCell>
                  <SonCell mono color={ADMIN.textDim}>{c.dlNumber || '*'}</SonCell>
                  <SonCell>
                    <div className="flex flex-wrap gap-1">
                      {(c.flags || []).map(fid => {
                        const def = customFlags.find(f => f.id === fid);
                        if (!def) return null;
                        return (
                          <span key={fid} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ background: `${def.color}22`, color: def.color, border: `1px solid ${def.color}55` }}>
                            <MdFlag size={9} /> {def.name}
                          </span>
                        );
                      })}
                    </div>
                  </SonCell>
                  <SonCell align="right">
                    <SonIconBtn icon={MdFlag} title="Manage flags"
                      onClick={() => {}} color={ADMIN.textDim} />
                  </SonCell>
                </SonRow>
              ))}
            </SonTable>
          );
        })()}
      </AdminPanel>
    </>
  );
}
