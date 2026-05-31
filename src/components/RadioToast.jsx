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
        top: '64px',
        right: '16px',
        zIndex: 4000,
        width: '320px',
        maxWidth: 'calc(100vw - 32px)',
        background: 'linear-gradient(180deg, #1c1405, #12203a)',
        border: '1px solid #f5b740',
        borderLeft: '4px solid #f5b740',
        borderRadius: '6px',
        boxShadow: '0 10px 34px rgba(0,0,0,0.6)',
        padding: '10px 12px',
        cursor: 'pointer',
        fontFamily: "'Ubuntu Mono', monospace",
        animation: 'radioToastIn 0.25s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#f5b740',
            boxShadow: '0 0 6px #f5b740',
            animation: 'cadPulse 1.2s ease-in-out infinite',
          }}
        />
        <span style={{ color: '#f5b740', fontWeight: 800, fontSize: '11px', letterSpacing: '1px' }}>
          📻 DISPATCH RADIO
        </span>
        <span style={{ marginLeft: 'auto', color: '#5f779b', fontSize: '11px' }}>{toast.time}</span>
      </div>
      <div style={{ color: '#fce8be', fontSize: '13px', lineHeight: 1.45 }}>{toast.text}</div>
    </div>
  );
}
