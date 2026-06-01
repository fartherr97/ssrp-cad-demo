import { useState, useEffect } from 'react';
import { useCAD } from '../store/cadStore';

// Pops a brief on-screen toast whenever a dispatcher broadcasts radio traffic.
// Mounted once globally so it surfaces on any page. The dispatcher who sent the
// broadcast doesn't get toasted for their own message.
export default function RadioToast() {
  const { state } = useCAD();
  const { lastRadio, currentUser } = state;
  // We never copy the broadcast into local state; instead we track which
  // broadcast id has been dismissed and derive the visible toast from the
  // store. setState only happens inside callbacks (timer / click), which keeps
  // us clear of both set-state-in-effect and ref-in-render lint rules.
  const [dismissedId, setDismissedId] = useState(null);

  const isSender = currentUser?.role === 'dispatch';
  const toast =
    lastRadio && lastRadio.id !== dismissedId && currentUser && !isSender ? lastRadio : null;

  // Auto-dismiss the visible toast after a few seconds.
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setDismissedId(toast.id), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      onClick={() => setDismissedId(toast.id)}
      style={{
        position: 'fixed',
        top: '50px',
        right: '14px',
        zIndex: 4000,
        width: '300px',
        maxWidth: 'calc(100vw - 28px)',
        background: '#0d1117',
        border: '1px solid #92400e',
        borderLeft: '3px solid #f59e0b',
        borderRadius: '2px',
        boxShadow: '0 8px 28px rgba(0,0,0,0.7)',
        padding: '8px 10px',
        cursor: 'pointer',
        fontFamily: "'Ubuntu', sans-serif",
        animation: 'radioToastIn 0.2s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
        <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '10px', letterSpacing: '1px' }}>
          DISPATCH RADIO
        </span>
        <span style={{ marginLeft: 'auto', color: '#374151', fontSize: '10px' }}>{toast.time}</span>
      </div>
      <div style={{ color: '#d1d5db', fontSize: '12px', lineHeight: 1.5 }}>{toast.text}</div>
    </div>
  );
}
