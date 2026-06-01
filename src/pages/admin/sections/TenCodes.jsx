import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import {
  AdminPanel, SonTable, SonRow, SonCell, SonButton, SonIconBtn, SON_INPUT, EmptyState, ADMIN,
} from '../AdminKit';
import { MdKeyboardArrowUp, MdKeyboardArrowDown, MdDelete, MdAdd, MdFileUpload, MdFileDownload } from 'react-icons/md';

export default function TenCodes() {
  const { state, dispatch } = useCAD();
  const { tenCodes } = state;
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');

  const add = () => {
    if (!code.trim() || !label.trim()) return;
    dispatch({ type: 'ADMIN_ADD', payload: { key: 'tenCodes', item: { code: code.trim(), label: label.trim() } } });
    setCode(''); setLabel('');
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(tenCodes, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'ten-codes.json'; a.click();
  };

  return (
    <AdminPanel
      title="10-Codes"
      subtitle="Radio codes available to dispatch and units. Drag order controls display order."
      right={<>
        <SonButton size="sm" variant="green" onClick={exportJson}><MdFileUpload size={15} /> Import</SonButton>
        <SonButton size="sm" variant="red" onClick={exportJson}><MdFileDownload size={15} /> Export</SonButton>
      </>}
    >
      {/* New row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input style={{ ...SON_INPUT, width: 130 }} placeholder="Code (10-X)" value={code}
          onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <input style={{ ...SON_INPUT, flex: 1, minWidth: 200 }} placeholder="Description" value={label}
          onChange={e => setLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <SonButton variant="red" onClick={add}><MdAdd size={16} /> New</SonButton>
      </div>

      {tenCodes.length === 0 ? <EmptyState>No 10-codes configured.</EmptyState> : (
        <SonTable columns={[{ label: 'Action', width: 130 }, { label: 'Code' }]}>
          {tenCodes.map((t, i) => (
            <SonRow key={t.id} i={i}>
              <SonCell>
                <div style={{ display: 'flex', gap: 6 }}>
                  <SonIconBtn icon={MdKeyboardArrowUp} title="Move up"
                    onClick={() => dispatch({ type: 'ADMIN_REORDER', payload: { key: 'tenCodes', id: t.id, dir: -1 } })} />
                  <SonIconBtn icon={MdKeyboardArrowDown} title="Move down"
                    onClick={() => dispatch({ type: 'ADMIN_REORDER', payload: { key: 'tenCodes', id: t.id, dir: 1 } })} />
                  <SonIconBtn icon={MdDelete} danger title="Delete"
                    onClick={() => dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'tenCodes', id: t.id } })} />
                </div>
              </SonCell>
              <SonCell>
                <span style={{ color: ADMIN.red, fontWeight: 700, fontFamily: 'var(--font-mono)', marginRight: 10 }}>{t.code}</span>
                {t.label}
              </SonCell>
            </SonRow>
          ))}
        </SonTable>
      )}
    </AdminPanel>
  );
}
