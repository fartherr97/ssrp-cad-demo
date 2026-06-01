import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import {
  AdminPanel, SonTable, SonRow, SonCell, SonButton, SonIconBtn, SonBadge, SON_INPUT, EmptyState, ADMIN,
} from '../AdminKit';
import { MdAdd, MdDelete } from 'react-icons/md';

export default function Servers() {
  const { state, dispatch } = useCAD();
  const { adminServers } = state;
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [map, setMap] = useState('');

  const add = () => {
    if (!name.trim() || !ip.trim()) return;
    dispatch({ type: 'ADMIN_ADD', payload: { key: 'adminServers', item: { name: name.trim(), ip: ip.trim(), status: 'OFFLINE', players: '0 / 0', map: map.trim() } } });
    setName(''); setIp(''); setMap('');
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
        <input style={{ ...SON_INPUT, width: 220 }} placeholder="ip:port" value={ip}
          onChange={e => setIp(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <input style={{ ...SON_INPUT, flex: 1, minWidth: 160 }} placeholder="Map" value={map}
          onChange={e => setMap(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <SonButton variant="red" onClick={add}><MdAdd size={16} /> Add</SonButton>
      </div>

      {adminServers.length === 0 ? <EmptyState>No servers configured.</EmptyState> : (
        <SonTable columns={[
          { label: 'Name' }, { label: 'IP' }, { label: 'Status', align: 'center', width: 110 },
          { label: 'Players', align: 'center', width: 110 }, { label: 'Map' }, { label: 'Action', align: 'center', width: 90 },
        ]}>
          {adminServers.map((s, i) => (
            <SonRow key={s.id} i={i}>
              <SonCell bold>{s.name}</SonCell>
              <SonCell mono color={ADMIN.textDim}>{s.ip}</SonCell>
              <SonCell align="center">
                <SonBadge color={s.status === 'ONLINE' ? ADMIN.green : ADMIN.red}>{s.status}</SonBadge>
              </SonCell>
              <SonCell align="center" mono color={ADMIN.textDim}>{s.players}</SonCell>
              <SonCell color={ADMIN.textDim}>{s.map}</SonCell>
              <SonCell align="center">
                <SonIconBtn icon={MdDelete} danger title="Delete"
                  onClick={() => dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'adminServers', id: s.id } })} />
              </SonCell>
            </SonRow>
          ))}
        </SonTable>
      )}
    </AdminPanel>
  );
}
