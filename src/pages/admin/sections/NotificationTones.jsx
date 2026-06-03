import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import {
  AdminPanel, SonButton, SonIconBtn, SON_INPUT, EmptyState, ADMIN,
} from '../AdminKit';
import { MdAdd, MdDelete, MdPlayArrow, MdCloudUpload } from 'react-icons/md';

export default function NotificationTones() {
  const { state, dispatch } = useCAD();
  const { notificationTones } = state;
  const toast = useToast();
  const [name, setName] = useState('');
  const [event, setEvent] = useState('');
  const [url, setUrl] = useState('');

  const add = () => {
    if (!name.trim() || !event.trim() || !url.trim()) return;
    dispatch({ type: 'ADMIN_ADD', payload: { key: 'notificationTones', item: { name: name.trim(), event: event.trim(), url: url.trim(), enabled: true } } });
    toast.success('Tone added.');
    setName(''); setEvent(''); setUrl('');
  };

  const playTone = (tone) => {
    try {
      new Audio(tone.url).play();
    } catch (_) { /* no-op in demo */ }
  };

  return (
    <AdminPanel
      title="Notification Tones"
      subtitle="Audio cues played for CAD/MDT events."
    >
      {/* Add form */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <input style={{ ...SON_INPUT, width: 200 }} placeholder="Name" value={name}
          onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <input style={{ ...SON_INPUT, width: 200 }} placeholder="Event" value={event}
          onChange={e => setEvent(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <input style={{ ...SON_INPUT, flex: 1, minWidth: 200 }} placeholder="tones/file.mp3" value={url}
          onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <SonButton variant="red" onClick={add}><MdAdd size={16} /> Add</SonButton>
      </div>

      {/* Tone rows */}
      {notificationTones.length === 0 ? (
        <EmptyState>No notification tones configured.</EmptyState>
      ) : (
        <div>
          {notificationTones.map((tone, i) => (
            <div key={tone.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              background: i % 2 === 0 ? ADMIN.row : ADMIN.rowAlt,
              borderRadius: 8, marginBottom: 4,
            }}>
              {/* Play button */}
              <button
                onClick={() => playTone(tone)}
                title="Play tone"
                style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                  color: '#f87171', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.28)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
              >
                <MdPlayArrow size={18} />
              </button>

              {/* Event name */}
              <div style={{ minWidth: 120, fontWeight: 700, fontSize: 13, color: ADMIN.text }}>
                {tone.name}
              </div>

              {/* Event label */}
              <div style={{ minWidth: 100, fontSize: 12, color: ADMIN.textDim }}>
                {tone.event}
              </div>

              {/* URL / path - truncated */}
              <div style={{
                flex: 1, fontFamily: 'var(--font-mono)', fontSize: 12, color: ADMIN.textMute,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {tone.url}
              </div>

              {/* Upload button */}
              <button
                title="Upload audio file"
                style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                  color: ADMIN.textDim, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              >
                <MdCloudUpload size={16} />
              </button>

              {/* Delete button */}
              <SonIconBtn
                icon={MdDelete}
                danger
                title="Delete"
                onClick={() => { dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'notificationTones', id: tone.id } }); toast.success('Tone deleted.'); }}
              />
            </div>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}
