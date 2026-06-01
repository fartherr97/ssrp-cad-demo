import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import {
  AdminPanel, SonTable, SonRow, SonCell, SonButton, SonIconBtn, SonBadge, SON_INPUT, EmptyState, ADMIN,
} from '../AdminKit';
import { MdAdd, MdDelete } from 'react-icons/md';

export default function NotificationTones() {
  const { state, dispatch } = useCAD();
  const { notificationTones } = state;
  const [name, setName] = useState('');
  const [event, setEvent] = useState('');
  const [url, setUrl] = useState('');

  const add = () => {
    if (!name.trim() || !event.trim() || !url.trim()) return;
    dispatch({ type: 'ADMIN_ADD', payload: { key: 'notificationTones', item: { name: name.trim(), event: event.trim(), url: url.trim(), enabled: true } } });
    setName(''); setEvent(''); setUrl('');
  };

  const toggle = (t) =>
    dispatch({ type: 'ADMIN_UPDATE', payload: { key: 'notificationTones', item: { id: t.id, enabled: !t.enabled } } });

  return (
    <AdminPanel
      title="Notification Tones"
      subtitle="Audio cues played for CAD/MDT events."
    >
      {/* New row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input style={{ ...SON_INPUT, width: 200 }} placeholder="Name" value={name}
          onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <input style={{ ...SON_INPUT, width: 200 }} placeholder="Event" value={event}
          onChange={e => setEvent(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <input style={{ ...SON_INPUT, flex: 1, minWidth: 200 }} placeholder="tones/file.mp3" value={url}
          onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <SonButton variant="red" onClick={add}><MdAdd size={16} /> Add</SonButton>
      </div>

      {notificationTones.length === 0 ? <EmptyState>No notification tones configured.</EmptyState> : (
        <SonTable columns={[
          { label: 'Name' }, { label: 'Event' }, { label: 'File' },
          { label: 'Enabled', align: 'center', width: 110 }, { label: 'Action', align: 'center', width: 90 },
        ]}>
          {notificationTones.map((t, i) => (
            <SonRow key={t.id} i={i}>
              <SonCell bold>{t.name}</SonCell>
              <SonCell color={ADMIN.textDim}>{t.event}</SonCell>
              <SonCell mono color={ADMIN.textMute}>{t.url}</SonCell>
              <SonCell align="center">
                <span style={{ cursor: 'pointer' }} onClick={() => toggle(t)} title="Click to toggle">
                  <SonBadge color={t.enabled ? ADMIN.green : ADMIN.textMute}>{t.enabled ? 'ON' : 'OFF'}</SonBadge>
                </span>
              </SonCell>
              <SonCell align="center">
                <SonIconBtn icon={MdDelete} danger title="Delete"
                  onClick={() => dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'notificationTones', id: t.id } })} />
              </SonCell>
            </SonRow>
          ))}
        </SonTable>
      )}
    </AdminPanel>
  );
}
