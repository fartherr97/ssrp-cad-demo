import { useState, useRef } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import {
  AdminPanel, SonTable, SonRow, SonCell, SonButton, SonIconBtn, SonSearch, SON_INPUT, EmptyState, ADMIN,
} from '../AdminKit';
import { MdAdd, MdDelete, MdUploadFile, MdDownload } from 'react-icons/md';

export default function Addresses() {
  const { state, dispatch } = useCAD();
  const { adminAddresses } = state;
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [postal, setPostal] = useState('');
  const fileRef = useRef(null);

  const add = () => {
    if (!name.trim() || !street.trim()) return;
    dispatch({ type: 'ADMIN_ADD', payload: { key: 'adminAddresses', item: { name: name.trim(), street: street.trim(), area: area.trim(), postal: postal.trim() } } });
    toast.success('Address added.');
    setName(''); setStreet(''); setArea(''); setPostal('');
  };

  const handleExport = () => {
    const rows = [['Name','Street','Area','Postal'], ...adminAddresses.map(a => [a.name, a.street, a.area, a.postal])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'addresses.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const lines = String(ev.target.result || '').split(/\r?\n/).filter(l => l.trim());
        let n = 0;
        lines.forEach((line, idx) => {
          const cells = line.includes('"')
            ? [...line.matchAll(/"([^"]*)"/g)].map(m => m[1])
            : line.split(',').map(c => c.trim());
          const [name, street, area, postal] = cells;
          if (idx === 0 && /name/i.test(name || '') && /street/i.test(street || '')) return; // header
          if (name && street) {
            dispatch({ type: 'ADMIN_ADD', payload: { key: 'adminAddresses', item: { name: name.trim(), street: street.trim(), area: (area || '').trim(), postal: (postal || '').trim() } } });
            n++;
          }
        });
        n ? toast.success(`Imported ${n} address${n === 1 ? '' : 'es'}.`) : toast.warning('No valid addresses found in file.');
      } catch { toast.error('Could not parse CSV file.'); }
    };
    reader.readAsText(file);
  };

  const q = query.toLowerCase();
  const filtered = adminAddresses.filter(a =>
    !q ||
    a.name.toLowerCase().includes(q) ||
    a.street.toLowerCase().includes(q) ||
    a.area.toLowerCase().includes(q));

  return (
    <AdminPanel
      title="Addresses"
      subtitle={`${filtered.length} addresses`}
      right={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <SonSearch value={query} onChange={setQuery} placeholder="Search name / street / area…" />
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImport} />
          <SonButton variant="ghost" onClick={() => fileRef.current?.click()} title="Import from CSV">
            <MdUploadFile size={15} /> Import
          </SonButton>
          <SonButton variant="ghost" onClick={() => handleExport()} title="Export to CSV">
            <MdDownload size={15} /> Export
          </SonButton>
        </div>
      }
    >
      {/* New row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input style={{ ...SON_INPUT, width: 200 }} placeholder="Name" value={name}
          onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <input style={{ ...SON_INPUT, flex: 1, minWidth: 200 }} placeholder="Street" value={street}
          onChange={e => setStreet(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <input style={{ ...SON_INPUT, width: 180 }} placeholder="Area" value={area}
          onChange={e => setArea(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <input style={{ ...SON_INPUT, width: 120 }} placeholder="Postal" value={postal}
          onChange={e => setPostal(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <SonButton variant="red" onClick={add}><MdAdd size={16} /> Add</SonButton>
      </div>

      {filtered.length === 0 ? <EmptyState>No addresses match.</EmptyState> : (
        <SonTable columns={[
          { label: 'Name' }, { label: 'Street' }, { label: 'Area' },
          { label: 'Postal', width: 110 }, { label: 'Action', align: 'center', width: 90 },
        ]}>
          {filtered.map((a, i) => (
            <SonRow key={a.id} i={i}>
              <SonCell bold>{a.name}</SonCell>
              <SonCell color={ADMIN.textDim}>{a.street}</SonCell>
              <SonCell color={ADMIN.textDim}>{a.area}</SonCell>
              <SonCell mono color={ADMIN.textMute}>{a.postal}</SonCell>
              <SonCell align="center">
                <SonIconBtn icon={MdDelete} danger title="Delete"
                  onClick={() => { dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'adminAddresses', id: a.id } }); toast.success('Address deleted.'); }} />
              </SonCell>
            </SonRow>
          ))}
        </SonTable>
      )}
    </AdminPanel>
  );
}
