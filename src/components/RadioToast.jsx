import { useState, useEffect } from 'react';
import { useCAD } from '../store/cadStore';

export default function RadioToast() {
  const { state } = useCAD();
  const { lastRadio, currentUser } = state;
  const [dismissedId, setDismissedId] = useState(null);

  const isSender = currentUser?.role === 'dispatch';
  const toast = lastRadio && lastRadio.id !== dismissedId && currentUser && !isSender ? lastRadio : null;

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setDismissedId(toast.id), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      className="radio-toast anim-slide-in"
      onClick={() => setDismissedId(toast.id)}
      style={{ cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--n-blue-active)',
          boxShadow: '0 0 6px var(--n-blue-active)',
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.8px',
          textTransform: 'uppercase', color: 'var(--n-blue-active)',
          fontFamily: 'var(--font-mono)',
        }}>
          DISPATCH RADIO
        </span>
        <span style={{ marginLeft: 'auto', color: 'var(--n-text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
          {toast.time}
        </span>
      </div>
      <div style={{ color: 'var(--n-text)', fontSize: 11.5, lineHeight: 1.5, fontFamily: 'var(--font-mono)' }}>
        {toast.text}
      </div>
    </div>
  );
}
