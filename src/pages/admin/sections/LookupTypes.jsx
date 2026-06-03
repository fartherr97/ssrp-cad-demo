import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import {
  AdminPanel, SonButton, SonIconBtn, SON_INPUT, EmptyState, ADMIN,
} from '../AdminKit';
import { MdAdd, MdClose, MdDelete } from 'react-icons/md';

function LookupCard({ type, dispatch, toast }) {
  const [val, setVal] = useState('');

  const addValue = () => {
    const v = val.trim();
    if (!v || type.values.includes(v)) { setVal(''); return; }
    dispatch({ type: 'ADMIN_UPDATE', payload: { key: 'lookupTypes', item: { id: type.id, values: [...type.values, v] } } });
    toast.success('Value added.');
    setVal('');
  };
  const removeValue = idx => {
    dispatch({ type: 'ADMIN_UPDATE', payload: { key: 'lookupTypes', item: { id: type.id, values: type.values.filter((_, i) => i !== idx) } } });
    toast.success('Value removed.');
  };

  return (
    <div style={{
      background: ADMIN.bg, border: `1px solid ${ADMIN.border}`, borderRadius: 8, padding: 16, marginBottom: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: ADMIN.text }}>{type.category}</div>
        <SonIconBtn icon={MdDelete} danger title="Delete lookup type"
          onClick={() => { dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'lookupTypes', id: type.id } }); toast.success('Lookup type deleted.'); }} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, minHeight: 8 }}>
        {type.values.length === 0 ? (
          <span style={{ fontSize: 12, color: ADMIN.textMute }}>No values yet.</span>
        ) : type.values.map((v, i) => (
          <span key={`${v}-${i}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 6px 5px 11px',
            background: ADMIN.panel2, border: `1px solid ${ADMIN.border}`, borderRadius: 999,
            fontSize: 13, color: ADMIN.text,
          }}>
            {v}
            <SonIconBtn icon={MdClose} danger title="Remove" onClick={() => removeValue(i)} />
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input style={{ ...SON_INPUT, maxWidth: 280 }} placeholder={`Add ${type.category.toLowerCase()} value…`}
          value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && addValue()} />
        <SonButton variant="red" onClick={addValue}><MdAdd size={16} /> Add</SonButton>
      </div>
    </div>
  );
}

export default function LookupTypes() {
  const { state, dispatch } = useCAD();
  const { lookupTypes } = state;
  const toast = useToast();
  const [category, setCategory] = useState('');

  const addType = () => {
    const c = category.trim();
    if (!c) return;
    dispatch({ type: 'ADMIN_ADD', payload: { key: 'lookupTypes', item: { category: c, values: [] } } });
    toast.success('Lookup type added.');
    setCategory('');
  };

  return (
    <AdminPanel
      title="Lookup Types"
      subtitle="Reusable dropdown value sets used across records and forms."
      right={
        <div style={{ display: 'flex', gap: 6 }}>
          <input style={{ ...SON_INPUT, width: 180 }} placeholder="New Lookup Type" value={category}
            onChange={e => setCategory(e.target.value)} onKeyDown={e => e.key === 'Enter' && addType()} />
          <SonButton variant="red" onClick={addType}><MdAdd size={16} /> Add Type</SonButton>
        </div>
      }
    >
      {lookupTypes.length === 0 ? (
        <EmptyState>No lookup types configured.</EmptyState>
      ) : (
        lookupTypes.map(t => <LookupCard key={t.id} type={t} dispatch={dispatch} toast={toast} />)
      )}
    </AdminPanel>
  );
}
