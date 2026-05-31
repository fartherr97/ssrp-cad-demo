import { useState, useEffect, useRef } from 'react';
import { useCAD } from '../store/cadStore';

// Pops a brief on-screen toast whenever a dispatcher broadcasts radio traffic.
// Mounted once globally so it surfaces on any page. The dispatcher who sent the
// broadcast doesn't get toasted for their own message.
export default function RadioToast() {
  const { state } = useCAD();
  const { lastRadio, currentUser } = state;
  const [toast, setToast] = useState(null);
  // Track the last broadcast we've reacted to via a ref so the effect only fires
  // on genuinely new broadcasts (and never calls setState just to record it).
  const seenIdRef = useRef(null);

  const isSender = currentUser?.role === 'dispatch';
  const radioId = lastRadio?.id ?? null;

  useEffect(() => {
    if (!radioId || radioId === seenIdRef.current) return;
    seenIdRef.current = radioId;
    if (isSender || !currentUser) return;

    setToast(lastRadio);
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [radioId, isSender, currentUser, lastRadio]);

  if (!toast) return null;

  return (
    <div
      onClick={() => setToast(null)}
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
