import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import {
  AdminPanel, SonTable, SonRow, SonCell, SonButton, SonIconBtn, SonSearch, SonBadge,
  SON_INPUT, EmptyState, ADMIN,
} from '../AdminKit';
import { MdAdd, MdDelete, MdEdit, MdClose } from 'react-icons/md';

/* Penal Code / Statutes editor.
   Operates on the live `penalCode` slice * the single source of truth that
   feeds the report Charges picker, the citizen Laws page, and the license
   points engine. Editing here is reflected everywhere those read. */

const TYPES = ['Felony', 'Misdemeanor', 'Infraction'];
const TYPE_COLOR = { Felony: ADMIN.red, Misdemeanor: ADMIN.amber, Infraction: ADMIN.green };

const blank = { category: '', code: '', name: '', type: 'Misdemeanor', fine: '', jailTime: 'None', points: 0 };

export default function Statutes() {
  const { state, dispatch } = useCAD();
  const { penalCode = [] } = state;
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(null);   // null | { ...charge }  (id present = editing)

  const categories = [...new Set(penalCode.map(p => p.category).filter(Boolean))];

  const filtered = penalCode.filter(p =>
    !query ||
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.code.toLowerCase().includes(query.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(query.toLowerCase()));

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.code.trim() || !form.name.trim()) return;
    const payload = {
      ...form,
      code: form.code.trim(),
      name: form.name.trim(),
      category: form.category.trim() || 'Uncategorized',
      fine: Number(form.fine) || 0,
      points: Number(form.points) || 0,
      jailTime: form.jailTime?.trim() || 'None',
    };
    if (form.id) { dispatch({ type: 'UPDATE_CHARGE', payload }); toast.success('Statute updated.'); }
    else { dispatch({ type: 'ADD_CHARGE', payload }); toast.success('Statute added.'); }
    setForm(null);
  };

  return (
    <AdminPanel
      title="Penal Code / Statutes"
      subtitle={`${penalCode.length} statutes · drives report charges, citizen laws & license points`}
      right={<>
        <SonSearch value={query} onChange={setQuery} placeholder="Search code, name or category…" />
        <SonButton variant="red" onClick={() => setForm(form ? null : blank)}>
          {form ? <><MdClose size={16} /> Cancel</> : <><MdAdd size={16} /> New Statute</>}
        </SonButton>
      </>}
    >
      {form && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
          gap: 10, marginBottom: 16, padding: 14, background: ADMIN.bg, border: `1px solid ${ADMIN.border}`, borderRadius: 8,
        }}>
          <input style={SON_INPUT} list="penal-categories" placeholder="Category" value={form.category}
            onChange={e => set('category', e.target.value)} />
          <datalist id="penal-categories">{categories.map(c => <option key={c} value={c} />)}</datalist>
          <input style={SON_INPUT} placeholder="Code (e.g. 784.011)" value={form.code}
            onChange={e => set('code', e.target.value)} />
          <input style={{ ...SON_INPUT, gridColumn: 'span 2' }} placeholder="Name / Title" value={form.name}
            onChange={e => set('name', e.target.value)} />
          <select style={SON_INPUT} value={form.type} onChange={e => set('type', e.target.value)}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <input style={SON_INPUT} type="number" placeholder="Fine $" value={form.fine}
            onChange={e => set('fine', e.target.value)} />
          <input style={SON_INPUT} placeholder="Jail Time (e.g. 5 Years)" value={form.jailTime}
            onChange={e => set('jailTime', e.target.value)} />
          <input style={SON_INPUT} type="number" min="0" max="10" placeholder="Points" value={form.points}
            onChange={e => set('points', e.target.value)} />
          <SonButton variant="green" onClick={save}>{form.id ? 'Update' : 'Save'}</SonButton>
        </div>
      )}

      {filtered.length === 0 ? <EmptyState>No statutes match.</EmptyState> : (
        <SonTable columns={[
          { label: 'Action', width: 80 }, { label: 'Code', width: 110 }, { label: 'Name' },
          { label: 'Category' }, { label: 'Type' },
          { label: 'Fine', align: 'right' }, { label: 'Jail', align: 'right' }, { label: 'Pts', align: 'right', width: 60 },
        ]}>
          {filtered.map((s, i) => (
            <SonRow key={s.id} i={i}>
              <SonCell>
                <div style={{ display: 'flex', gap: 6 }}>
                  <SonIconBtn icon={MdEdit} title="Edit"
                    onClick={() => setForm({ ...s, fine: String(s.fine ?? ''), points: String(s.points ?? 0) })} />
                  <SonIconBtn icon={MdDelete} danger title="Delete"
                    onClick={() => { dispatch({ type: 'DELETE_CHARGE', payload: s.id }); toast.success('Statute deleted.'); }} />
                </div>
              </SonCell>
              <SonCell mono color={ADMIN.red} bold>{s.code}</SonCell>
              <SonCell>{s.name}</SonCell>
              <SonCell color={ADMIN.textDim}>{s.category}</SonCell>
              <SonCell><SonBadge color={TYPE_COLOR[s.type] || ADMIN.textDim}>{s.type}</SonBadge></SonCell>
              <SonCell align="right" mono color={ADMIN.green}>{s.fine > 0 ? `$${s.fine.toLocaleString()}` : '*'}</SonCell>
              <SonCell align="right" mono color={ADMIN.amber}>{s.jailTime}</SonCell>
              <SonCell align="right" mono color={s.points >= 7 ? ADMIN.red : s.points >= 4 ? ADMIN.amber : ADMIN.textDim}>{s.points}</SonCell>
            </SonRow>
          ))}
        </SonTable>
      )}
    </AdminPanel>
  );
}
