import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import {
  AdminPanel, SonTable, SonRow, SonCell, SonButton, SonIconBtn, SonBadge, SON_INPUT, EmptyState, ADMIN,
} from '../AdminKit';
import { MdAdd, MdDelete } from 'react-icons/md';

export default function PermissionKeys() {
  const { state, dispatch } = useCAD();
  const { permissionKeys } = state;
  const [name, setName] = useState('');
  const [scope, setScope] = useState('');

  const add = () => {
    if (!name.trim() || !scope.trim()) return;
    dispatch({ type: 'ADMIN_ADD', payload: { key: 'permissionKeys', item: { name: name.trim(), scope: scope.trim(), members: 0 } } });
    setName(''); setScope('');
  };

  return (
    <AdminPanel
      title="Permission Keys"
      subtitle="Access groups that gate features across the CAD/MDT."
      right={<SonButton size="sm" variant="red" onClick={add}><MdAdd size={15} /> New</SonButton>}
    >
      {/* New row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input style={{ ...SON_INPUT, width: 200 }} placeholder="Name" value={name}
          onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <input style={{ ...SON_INPUT, flex: 1, minWidth: 220 }} placeholder="Scope / description" value={scope}
          onChange={e => setScope(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <SonButton variant="red" onClick={add}><MdAdd size={16} /> Add</SonButton>
      </div>

      {permissionKeys.length === 0 ? <EmptyState>No permission keys configured.</EmptyState> : (
        <SonTable columns={[
          { label: 'Name' }, { label: 'Scope' }, { label: 'Members', align: 'center', width: 120 },
          { label: 'Action', align: 'center', width: 90 },
        ]}>
          {permissionKeys.map((p, i) => (
            <SonRow key={p.id} i={i}>
              <SonCell bold>{p.name}</SonCell>
              <SonCell color={ADMIN.textDim}>{p.scope}</SonCell>
              <SonCell align="center"><SonBadge color={ADMIN.blue}>{p.members}</SonBadge></SonCell>
              <SonCell align="center">
                <SonIconBtn icon={MdDelete} danger title="Delete"
                  onClick={() => dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'permissionKeys', id: p.id } })} />
              </SonCell>
            </SonRow>
          ))}
        </SonTable>
      )}
    </AdminPanel>
  );
}
