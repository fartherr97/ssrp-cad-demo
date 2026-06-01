import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import {
  AdminPanel, SonTable, SonRow, SonCell, SonButton, SonIconBtn, SON_INPUT, EmptyState, ADMIN,
} from '../AdminKit';
import { MdAdd, MdDelete } from 'react-icons/md';

export default function QuickLinks() {
  const { state, dispatch } = useCAD();
  const { quickLinks } = state;
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');

  const add = () => {
    if (!label.trim() || !url.trim()) return;
    dispatch({ type: 'ADMIN_ADD', payload: { key: 'quickLinks', item: { label: label.trim(), url: url.trim() } } });
    setLabel(''); setUrl('');
  };

  return (
    <AdminPanel
      title="Quick Links"
      subtitle="Shortcuts surfaced to members across the portal."
    >
      {/* New row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input style={{ ...SON_INPUT, width: 220 }} placeholder="Label" value={label}
          onChange={e => setLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <input style={{ ...SON_INPUT, flex: 1, minWidth: 220 }} placeholder="https://…" value={url}
          onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <SonButton variant="red" onClick={add}><MdAdd size={16} /> Add</SonButton>
      </div>

      {quickLinks.length === 0 ? <EmptyState>No quick links configured.</EmptyState> : (
        <SonTable columns={[
          { label: 'Label' }, { label: 'URL' }, { label: 'Action', align: 'center', width: 90 },
        ]}>
          {quickLinks.map((q, i) => (
            <SonRow key={q.id} i={i}>
              <SonCell bold>{q.label}</SonCell>
              <SonCell mono color={ADMIN.blue}>{q.url}</SonCell>
              <SonCell align="center">
                <SonIconBtn icon={MdDelete} danger title="Delete"
                  onClick={() => dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'quickLinks', id: q.id } })} />
              </SonCell>
            </SonRow>
          ))}
        </SonTable>
      )}
    </AdminPanel>
  );
}
