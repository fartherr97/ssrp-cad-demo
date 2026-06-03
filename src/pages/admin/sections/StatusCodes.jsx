import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import {
  AdminPanel, SonTable, SonRow, SonCell, SonButton, SonIconBtn, SON_INPUT, EmptyState, ADMIN,
} from '../AdminKit';
import { MdKeyboardArrowUp, MdKeyboardArrowDown, MdDelete, MdAdd } from 'react-icons/md';

export default function StatusCodes() {
  const { state, dispatch } = useCAD();
  const { unitStatusCodes } = state;
  const toast = useToast();
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#22ff66');

  const add = () => {
    if (!code.trim() || !label.trim()) return;
    dispatch({ type: 'ADMIN_ADD', payload: { key: 'unitStatusCodes', item: { code: code.trim(), label: label.trim(), color } } });
    toast.success('Status code added.');
    setCode(''); setLabel(''); setColor('#22ff66');
  };

  return (
    <AdminPanel
      title="Unit Status Codes"
      subtitle="Status options units can broadcast. Order controls display order."
    >
      {/* New row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ ...SON_INPUT, width: 160 }} placeholder="Code" value={code}
          onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <input style={{ ...SON_INPUT, flex: 1, minWidth: 200 }} placeholder="Label" value={label}
          onChange={e => setLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <input style={{ ...SON_INPUT, width: 130 }} placeholder="#color" value={color}
          onChange={e => setColor(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <SonButton variant="red" onClick={add}><MdAdd size={16} /> New</SonButton>
      </div>

      {unitStatusCodes.length === 0 ? <EmptyState>No status codes configured.</EmptyState> : (
        <SonTable columns={[{ label: 'Action', width: 160 }, { label: 'Color', width: 80 }, { label: 'Status' }]}>
          {unitStatusCodes.map((s, i) => (
            <SonRow key={s.id} i={i}>
              <SonCell>
                <div style={{ display: 'flex', gap: 6 }}>
                  <SonIconBtn icon={MdKeyboardArrowUp} title="Move up"
                    onClick={() => dispatch({ type: 'ADMIN_REORDER', payload: { key: 'unitStatusCodes', id: s.id, dir: -1 } })} />
                  <SonIconBtn icon={MdKeyboardArrowDown} title="Move down"
                    onClick={() => dispatch({ type: 'ADMIN_REORDER', payload: { key: 'unitStatusCodes', id: s.id, dir: 1 } })} />
                  <SonIconBtn icon={MdDelete} danger title="Delete"
                    onClick={() => { dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'unitStatusCodes', id: s.id } }); toast.success('Status code deleted.'); }} />
                </div>
              </SonCell>
              <SonCell>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 4, background: s.color,
                    border: `1px solid ${ADMIN.border}`, display: 'inline-block', flexShrink: 0,
                  }} />
                  <input type="color" value={s.color}
                    onChange={e => dispatch({ type: 'ADMIN_UPDATE', payload: { key: 'unitStatusCodes', item: { id: s.id, color: e.target.value } } })}
                    title="Edit color"
                    style={{ width: 26, height: 26, padding: 0, border: `1px solid ${ADMIN.border}`, borderRadius: 4, background: ADMIN.bg, cursor: 'pointer' }} />
                </div>
              </SonCell>
              <SonCell>
                <span style={{ color: s.color, fontWeight: 700, fontFamily: 'var(--font-mono)', marginRight: 10 }}>{s.code}</span>
                {s.label}
              </SonCell>
            </SonRow>
          ))}
        </SonTable>
      )}
    </AdminPanel>
  );
}
