import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import {
  AdminPanel, SonTable, SonRow, SonCell, SonButton, SonIconBtn, SonSearch, SON_INPUT, EmptyState, ADMIN,
} from '../AdminKit';
import { MdKeyboardArrowUp, MdKeyboardArrowDown, MdDelete, MdAdd } from 'react-icons/md';

/* Small reorderable type list (Charge Types / Bond Types) */
function TypeList({ title, listKey }) {
  const { state, dispatch } = useCAD();
  const list = state[listKey];
  const [name, setName] = useState('');
  const add = () => {
    if (!name.trim()) return;
    dispatch({ type: 'ADMIN_ADD', payload: { key: listKey, item: { name: name.trim() } } });
    setName('');
  };
  return (
    <AdminPanel title={title} right={
      <div style={{ display: 'flex', gap: 6 }}>
        <input style={{ ...SON_INPUT, width: 130 }} placeholder="New" value={name}
          onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <SonButton size="sm" variant="red" onClick={add}><MdAdd size={15} /></SonButton>
      </div>
    } style={{ flex: 1, minWidth: 280 }}>
      <SonTable columns={[{ label: 'Action', width: 110 }, { label: title.replace(' Types', '') }]}>
        {list.map((t, i) => (
          <SonRow key={t.id} i={i}>
            <SonCell>
              <div style={{ display: 'flex', gap: 6 }}>
                <SonIconBtn icon={MdKeyboardArrowUp} onClick={() => dispatch({ type: 'ADMIN_REORDER', payload: { key: listKey, id: t.id, dir: -1 } })} />
                <SonIconBtn icon={MdKeyboardArrowDown} onClick={() => dispatch({ type: 'ADMIN_REORDER', payload: { key: listKey, id: t.id, dir: 1 } })} />
                <SonIconBtn icon={MdDelete} danger onClick={() => dispatch({ type: 'ADMIN_REMOVE', payload: { key: listKey, id: t.id } })} />
              </div>
            </SonCell>
            <SonCell>{t.name}</SonCell>
          </SonRow>
        ))}
      </SonTable>
    </AdminPanel>
  );
}

export default function Statutes() {
  const { state, dispatch } = useCAD();
  const { statutes, chargeTypes, bondTypes } = state;
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(null); // null or {code,title,chargeType,bondType,amount,jailTime}

  const blank = { code: '', title: '', chargeType: chargeTypes[0]?.name || '', bondType: bondTypes[0]?.name || '', amount: '', jailTime: '' };
  const filtered = statutes.filter(s =>
    !query || s.title.toLowerCase().includes(query.toLowerCase()) || s.code.includes(query));

  const save = () => {
    if (!form.code.trim() || !form.title.trim()) return;
    dispatch({ type: 'ADMIN_ADD', payload: { key: 'statutes', item: { ...form, amount: Number(form.amount) || 0 } } });
    setForm(null);
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <TypeList title="Charge Types" listKey="chargeTypes" />
        <TypeList title="Bond Types" listKey="bondTypes" />
      </div>

      <AdminPanel
        title="Statutes"
        subtitle={`${statutes.length} statutes`}
        right={<>
          <SonSearch value={query} onChange={setQuery} placeholder="Search statutes…" />
          <SonButton variant="red" onClick={() => setForm(form ? null : blank)}><MdAdd size={16} /> New</SonButton>
        </>}
      >
        {form && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: 10, marginBottom: 16, padding: 14, background: ADMIN.bg, border: `1px solid ${ADMIN.border}`, borderRadius: 8 }}>
            <input style={SON_INPUT} placeholder="Code" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            <input style={{ ...SON_INPUT, gridColumn: 'span 2' }} placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <select style={SON_INPUT} value={form.chargeType} onChange={e => setForm(f => ({ ...f, chargeType: e.target.value }))}>
              {chargeTypes.map(c => <option key={c.id}>{c.name}</option>)}
            </select>
            <select style={SON_INPUT} value={form.bondType} onChange={e => setForm(f => ({ ...f, bondType: e.target.value }))}>
              {bondTypes.map(b => <option key={b.id}>{b.name}</option>)}
            </select>
            <input style={SON_INPUT} placeholder="Bond/Fine $" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            <input style={SON_INPUT} placeholder="Jail Time" value={form.jailTime} onChange={e => setForm(f => ({ ...f, jailTime: e.target.value }))} />
            <SonButton variant="green" onClick={save}>Save</SonButton>
          </div>
        )}

        {filtered.length === 0 ? <EmptyState>No statutes match.</EmptyState> : (
          <SonTable columns={[
            { label: 'Action', width: 60 }, { label: 'Code', width: 110 }, { label: 'Title' },
            { label: 'Charge Type' }, { label: 'Bond Type' }, { label: 'Amount', align: 'right' }, { label: 'Jail Time', align: 'right' },
          ]}>
            {filtered.map((s, i) => (
              <SonRow key={s.id} i={i}>
                <SonCell><SonIconBtn icon={MdDelete} danger onClick={() => dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'statutes', id: s.id } })} /></SonCell>
                <SonCell mono color={ADMIN.red} bold>{s.code}</SonCell>
                <SonCell>{s.title}</SonCell>
                <SonCell color={ADMIN.textDim}>{s.chargeType}</SonCell>
                <SonCell color={ADMIN.textDim}>{s.bondType}</SonCell>
                <SonCell align="right" mono color={ADMIN.green}>${s.amount?.toLocaleString()}</SonCell>
                <SonCell align="right" mono color={ADMIN.amber}>{s.jailTime}</SonCell>
              </SonRow>
            ))}
          </SonTable>
        )}
      </AdminPanel>
    </>
  );
}
