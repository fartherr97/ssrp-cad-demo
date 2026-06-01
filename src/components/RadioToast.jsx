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
      onClick={() => setDismissedId(toast.id)}
      className="fixed bottom-20 right-5 z-[1000] bg-[rgba(4,16,32,0.95)] border border-sky-700/40 border-l-[3px] border-l-sky-500 rounded-lg px-4 py-3 min-w-[260px] max-w-[380px] shadow-[0_4px_24px_rgba(0,0,0,0.4)] animate-slide-in-right cursor-pointer"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_6px_theme(colors.sky.500)] shrink-0" />
        <span className="text-[9px] font-bold tracking-[0.8px] uppercase text-sky-400 font-mono">
          DISPATCH RADIO
        </span>
        <span className="ml-auto text-cad-muted text-[10px] font-mono">
          {toast.time}
        </span>
      </div>
      <div className="text-cad-text text-[11.5px] leading-[1.5] font-mono">
        {toast.text}
      </div>
    </div>
  );
}
