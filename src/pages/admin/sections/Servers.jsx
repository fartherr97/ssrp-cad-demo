import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import {
  AdminPanel, SonTable, SonRow, SonCell, SonButton, SonIconBtn, EmptyState, ADMIN, SON_INPUT,
} from '../AdminKit';
import { MdAdd, MdDelete } from 'react-icons/md';

export default function Servers() {
  const { state, dispatch } = useCAD();
  const { adminServers } = state;
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const add = () => {
    if (!name.trim()) return;
    dispatch({ type: 'ADMIN_ADD', payload: { key: 'adminServers', item: { name: name.trim(), description: description.trim() } } });
    toast.success('Server added.');
    setName(''); setDescription('');
  };

  return (
    <AdminPanel
      title="Servers"
      subtitle="Game server connections monitored by the CAD."
    >
      {/* New row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input style={{ ...SON_INPUT, width: 200 }} placeholder="Name" value={name}
          onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <input style={{ ...SON_INPUT, flex: 1, minWidth: 260 }} placeholder="Description" value={description}
          onChange={e => setDescription(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <SonButton variant="red" onClick={add}><MdAdd size={16} /> Add</SonButton>
      </div>

      {adminServers.length === 0 ? <EmptyState>No servers configured.</EmptyState> : (
        <SonTable columns={[
          { label: 'ID', width: 70 }, { label: 'Name', width: 180 }, { label: 'Description' }, { label: 'Action', align: 'center', width: 90 },
        ]}>
          {adminServers.map((s, i) => (
            <SonRow key={s.id} i={i}>
              <SonCell>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, color: ADMIN.textMute,
                  background: ADMIN.panel2, border: `1px solid ${ADMIN.border}`,
                  borderRadius: 4, padding: '2px 6px',
                }}>#{s.id}</span>
              </SonCell>
              <SonCell bold>{s.name}</SonCell>
              <SonCell color={ADMIN.textDim}>{s.description}</SonCell>
              <SonCell align="center">
                <SonIconBtn icon={MdDelete} danger title="Delete"
                  onClick={() => { dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'adminServers', id: s.id } }); toast.success('Server deleted.'); }} />
              </SonCell>
            </SonRow>
          ))}
        </SonTable>
      )}
    </AdminPanel>
  );
}
