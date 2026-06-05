import { useState, useRef } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import {
  AdminPanel, SonTable, SonRow, SonCell, SonButton, SonIconBtn, SON_INPUT, EmptyState, ADMIN,
} from '../AdminKit';
import { MdKeyboardArrowUp, MdKeyboardArrowDown, MdDelete, MdAdd, MdFileUpload, MdFileDownload } from 'react-icons/md';

export default function TenCodes() {
  const { state, dispatch } = useCAD();
  const { tenCodes } = state;
  const toast = useToast();
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const fileRef = useRef(null);

  const add = () => {
    if (!code.trim() || !label.trim()) return;
    dispatch({ type: 'ADMIN_ADD', payload: { key: 'tenCodes', item: { code: code.trim(), label: label.trim() } } });
    toast.success('10-code added.');
    setCode(''); setLabel('');
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(tenCodes, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'ten-codes.json'; a.click();
  };

  const importJson = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) throw new Error('not an array');
        let n = 0;
        data.forEach(item => {
          const c = String(item.code || '').trim();
          const l = String(item.label || '').trim();
          if (c && l) { dispatch({ type: 'ADMIN_ADD', payload: { key: 'tenCodes', item: { code: c, label: l } } }); n++; }
        });
        n ? toast.success(`Imported ${n} 10-code${n === 1 ? '' : 's'}.`) : toast.warning('No valid 10-codes found in file.');
      } catch { toast.error('Invalid 10-codes JSON file.'); }
    };
    reader.readAsText(file);
  };

  return (
    <AdminPanel
      title="10-Codes"
      subtitle="Radio codes available to dispatch and units. Use the arrows to control display order."
      right={<>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={importJson} />
        <SonButton size="sm" variant="green" onClick={() => fileRef.current?.click()}><MdFileUpload size={15} /> Import</SonButton>
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
                    onClick={() => { dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'tenCodes', id: t.id } }); toast.success('10-code deleted.'); }} />
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
