import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { S_INPUT, S_SELECT, S_LABEL, S_BTN_SUCCESS, S_BTN_SECONDARY } from '../constants/styles';
import { MdSave } from 'react-icons/md';

export default function IdentifierEditor({ onClose }) {
  const { state, dispatch } = useCAD();
  const { officers, departments, unitStatusCodes, currentUser } = state;
  const me = officers.find(o => o.id === currentUser?.id);

  const init = () => ({
    name:        me?.name        ?? '',
    unitId:      me?.unitId      ?? '',
    rank:        me?.rank        ?? '',
    status:      me?.status      ?? 'OFFDUTY',
    location:    me?.location    ?? '',
    aop:         me?.aop         ?? '',
    dept:        me?.dept        ?? '',
    subdivision: me?.subdivision ?? '',
  });

  const [draft, setDraft] = useState(init);
  const set = (k, v) => setDraft(p => ({ ...p, [k]: v }));

  const selectedDept = departments.find(d => d.id === Number(draft.dept));
  const subdivisions = selectedDept?.subdivisions || [];

  const handleDeptChange = (val) => {
    const dept = departments.find(d => d.id === Number(val));
    setDraft(p => ({ ...p, dept: Number(val), subdivision: dept?.subdivisions?.[0] ?? '' }));
  };

  const dirty = JSON.stringify(draft) !== JSON.stringify(init());

  const save = () => {
    const deptObj = departments.find(d => d.id === Number(draft.dept));
    dispatch({
      type: 'PATCH_OFFICER',
      payload: { ...draft, dept: Number(draft.dept), deptShort: deptObj?.short ?? me?.deptShort ?? '' },
    });
    onClose?.();
  };

  if (!me) return <div className="text-slate-500 text-sm">No active identifier.</div>;

  return (
    <div className="grid gap-3">
      <div>
        <label className={S_LABEL}>Display Name</label>
        <input className={S_INPUT} value={draft.name} onChange={e => set('name', e.target.value)} placeholder="e.g. James Reeves" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={S_LABEL}>Unit Number</label>
          <input className={S_INPUT} value={draft.unitId} onChange={e => set('unitId', e.target.value)} placeholder="e.g. TPD-831" />
        </div>
        <div>
          <label className={S_LABEL}>Rank</label>
          <input className={S_INPUT} value={draft.rank} onChange={e => set('rank', e.target.value)} placeholder="e.g. Officer" />
        </div>
      </div>

      <div>
        <label className={S_LABEL}>Status</label>
        <select className={S_SELECT} value={draft.status} onChange={e => set('status', e.target.value)}>
          {unitStatusCodes.map(s => (
            <option key={s.code} value={s.code}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={S_LABEL}>Location</label>
          <input className={S_INPUT} value={draft.location} onChange={e => set('location', e.target.value)} placeholder="Current location" />
        </div>
        <div>
          <label className={S_LABEL}>AOP</label>
          <input className={S_INPUT} value={draft.aop} onChange={e => set('aop', e.target.value)} placeholder="Area of Patrol" />
        </div>
      </div>

      <div>
        <label className={S_LABEL}>Agency</label>
        <select className={S_SELECT} value={draft.dept} onChange={e => handleDeptChange(e.target.value)}>
          <option value="">— Select Agency —</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {subdivisions.length > 0 && (
        <div>
          <label className={S_LABEL}>Subdivision</label>
          <select className={S_SELECT} value={draft.subdivision} onChange={e => set('subdivision', e.target.value)}>
            <option value="">— None —</option>
            {subdivisions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          className={S_BTN_SUCCESS}
          onClick={save}
          disabled={!dirty}
        >
          <MdSave size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          Save Identifier
        </button>
        {onClose && (
          <button className={S_BTN_SECONDARY} onClick={onClose}>Cancel</button>
        )}
      </div>

      {dirty && (
        <p className="text-[11px] text-amber-400 -mt-1">Unsaved changes</p>
      )}
    </div>
  );
}
