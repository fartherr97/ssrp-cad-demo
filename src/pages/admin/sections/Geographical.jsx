import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import {
  AdminPanel, SonButton, SonIconBtn, SON_INPUT, SON_LABEL, ADMIN,
} from '../AdminKit';
import { MdAdd, MdClose } from 'react-icons/md';

function ChipSection({ title, field, values, onAdd, onRemove }) {
  const [val, setVal] = useState('');
  const add = () => {
    const v = val.trim();
    if (!v) return;
    onAdd(field, v);
    setVal('');
  };
  return (
    <div style={{ marginBottom: 22 }}>
      <label style={SON_LABEL}>{title}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10, minHeight: 8 }}>
        {values.length === 0 ? (
          <span style={{ fontSize: 12, color: ADMIN.textMute }}>No entries yet.</span>
        ) : values.map((v, i) => (
          <span key={`${v}-${i}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 6px 5px 11px',
            background: ADMIN.panel2, border: `1px solid ${ADMIN.border}`, borderRadius: 999,
            fontSize: 13, color: ADMIN.text,
          }}>
            {v}
            <SonIconBtn icon={MdClose} danger title="Remove" onClick={() => onRemove(field, i)} />
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input style={{ ...SON_INPUT, maxWidth: 280 }} placeholder={`Add ${title.toLowerCase()}…`}
          value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <SonButton variant="red" onClick={add}><MdAdd size={16} /> Add</SonButton>
      </div>
    </div>
  );
}

export default function Geographical() {
  const { state, dispatch } = useCAD();
  const [draft, setDraft] = useState({ ...state.geoSettings });

  const persist = next => {
    setDraft(next);
    dispatch({ type: 'ADMIN_SET', payload: { key: 'geoSettings', value: next } });
  };
  const addVal = (field, v) => persist({ ...draft, [field]: [...draft[field], v] });
  const removeVal = (field, idx) => persist({ ...draft, [field]: draft[field].filter((_, i) => i !== idx) });

  return (
    <AdminPanel title="Geographical Settings" subtitle="Cities, counties and postal codes used across the CAD.">
      <ChipSection title="Cities" field="cities" values={draft.cities} onAdd={addVal} onRemove={removeVal} />
      <ChipSection title="Counties" field="counties" values={draft.counties} onAdd={addVal} onRemove={removeVal} />
      <ChipSection title="Postal Codes" field="postals" values={draft.postals} onAdd={addVal} onRemove={removeVal} />
    </AdminPanel>
  );
}
