import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';
import {
  ADMIN, AdminPageTitle, AdminPanel, SonButton, SonField, SON_INPUT,
  SonTable, SonRow, SonCell, SonIconBtn, EmptyState,
} from '../AdminKit';
import { MdFlag, MdAdd, MdDelete, MdEdit, MdCheck, MdClose, MdSearch, MdPerson } from 'react-icons/md';
import { createPortal } from 'react-dom';
import { FlagManager, FlagRow } from '../../../components/CivilianFlags';

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
  const confirm = useConfirm();

  const [editing, setEditing] = useState(null); // flagId being edited, or 'new'
  const [draft, setDraft] = useState(blank);
  const [civSearch, setCivSearch] = useState('');
  const [manageId, setManageId] = useState(null); // civilianId open in the manage modal

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

  const del = async (id) => {
    if (!(await confirm({
      title: 'Delete flag',
      message: 'Delete this flag? It will be removed from all civilians.',
      confirmLabel: 'Delete',
      danger: true,
    }))) return;
    dispatch({ type: 'DELETE_FLAG_DEF', payload: id });
    toast.success('Flag deleted.');
  };

  // Count civilians using each flag
  const usageCount = (id) => civilians.filter(c => (c.flags || []).includes(id)).length;

  // Live civilian record for the manage-flags modal (so flag pills update instantly).
  const manageCiv = manageId == null ? null : civilians.find(c => c.id === manageId);

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
              <SonCell color={ADMIN.textDim}>{f.description || '—'}</SonCell>
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

      {/* ── Assign flags to any civilian ── */}
      <AdminPanel title="Assign Flags to a Civilian" subtitle="Search any account by name, DL #, or Discord ID, then add or remove flags — changes appear on the civilian's record when searched by law enforcement.">
        <div className="flex items-center gap-2 bg-app-input border border-border-base rounded-lg px-3 py-2 mb-3 max-w-md">
          <MdSearch size={15} className="text-slate-500 shrink-0" />
          <input
            className="flex-1 min-w-0 bg-transparent text-[13px] text-slate-200 placeholder:text-slate-600 outline-none"
            placeholder="Search name, DL #, or Discord ID…"
            value={civSearch}
            onChange={e => setCivSearch(e.target.value)}
          />
          {civSearch && (
            <button type="button" onClick={() => setCivSearch('')}
              className="text-slate-500 hover:text-slate-200 cursor-pointer bg-transparent border-none p-0 shrink-0">
              <MdClose size={15} />
            </button>
          )}
        </div>

        {(() => {
          const q = civSearch.trim().toLowerCase();
          if (!q) {
            return <div className="text-[12px] text-slate-500 italic px-1 py-2">Start typing to find a civilian to flag.</div>;
          }
          const matches = civilians.filter(c =>
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
            c.dlNumber?.toLowerCase().includes(q) ||
            String(c.ownerDiscordId || '').includes(q) ||
            String(c.discordId || '').includes(q)
          ).slice(0, 25);
          if (matches.length === 0) return <EmptyState>No civilians match "{civSearch}".</EmptyState>;
          return (
            <div className="flex flex-col gap-1.5">
              {matches.map(c => (
                <button key={c.id} type="button" onClick={() => setManageId(c.id)}
                  className="flex items-center gap-3 text-left rounded-lg px-3 py-2.5 border border-border-base bg-app-card/60 hover:bg-white/[0.05] cursor-pointer transition-colors">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-brand/10 border border-brand/20">
                    <MdPerson size={16} className="text-brand-bright" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold text-cad-text truncate">{c.firstName} {c.lastName}</div>
                    <div className="text-[10.5px] font-mono text-slate-500 truncate">
                      DL {c.dlNumber || '—'}{c.ownerDiscordId ? ` · Discord ${c.ownerDiscordId}` : ''}
                    </div>
                  </div>
                  {(c.flags || []).length > 0 && (
                    <span className="shrink-0"><FlagRow flags={c.flags} /></span>
                  )}
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.5px] text-brand-bright">Manage ›</span>
                </button>
              ))}
            </div>
          );
        })()}
      </AdminPanel>

      {/* ── Manage-flags modal ── */}
      {manageCiv && createPortal(
        <div className="anim-overlay-in fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={e => e.target === e.currentTarget && setManageId(null)}>
          <div className="anim-modal-in w-full max-w-lg rounded-2xl bg-app-panel border border-border-base shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border-base">
              <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-brand/10 border border-brand/20">
                <MdPerson size={18} className="text-brand-bright" />
              </span>
              <div className="min-w-0">
                <div className="text-[14px] font-bold text-white truncate">{manageCiv.firstName} {manageCiv.lastName}</div>
                <div className="text-[11px] font-mono text-slate-500 truncate">
                  DL {manageCiv.dlNumber || '—'}{manageCiv.ownerDiscordId ? ` · Discord ${manageCiv.ownerDiscordId}` : ''}
                </div>
              </div>
              <button type="button" onClick={() => setManageId(null)}
                className="ml-auto text-slate-500 hover:text-slate-200 cursor-pointer bg-transparent border-none p-1 shrink-0">
                <MdClose size={18} />
              </button>
            </div>
            <div className="px-5 py-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-2">Flags on file</div>
              <FlagManager civilianId={manageCiv.id} flags={manageCiv.flags || []} />
              <div className="mt-4 text-[11px] text-slate-500">
                Use <span className="text-slate-300 font-semibold">Add Flag</span> to apply a flag, or click the ✕ on a pill to remove it. Changes save instantly.
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
