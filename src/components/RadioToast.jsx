import { useState, useEffect } from 'react';
import { useCAD } from '../store/cadStore';

export default function RadioToast() {
  const { state } = useCAD();
  const { lastRadio, currentUser } = state;
  const [dismissedId, setDismissedId] = useState(null);

  const isSender = currentUser?.role === 'dispatch';
  // Panic alerts broadcast to everyone (including dispatch); normal radio
  // traffic still hides for the dispatcher who sent it.
  const visible = lastRadio && lastRadio.id !== dismissedId && currentUser &&
    (lastRadio.panic || !isSender);
  const toast = visible ? lastRadio : null;

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setDismissedId(toast.id), toast.panic ? 10000 : 6000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  if (toast.panic) {
    return (
      <div
        onClick={() => setDismissedId(toast.id)}
        className="fixed bottom-20 right-5 z-[1000] bg-[rgba(40,4,4,0.97)] border border-red-600/60 border-l-[4px] border-l-red-500 rounded-lg px-4 py-3 min-w-[280px] max-w-[400px] shadow-[0_4px_28px_rgba(220,0,0,0.4)] animate-slide-in-right cursor-pointer animate-pulse-red"
      >
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_theme(colors.red.500)] shrink-0" />
          <span className="text-[10px] font-extrabold tracking-[1px] uppercase text-red-400 font-mono">
            🚨 PANIC ALERT
          </span>
          <span className="ml-auto text-red-300/70 text-[10px] font-mono">
            {toast.time}
          </span>
        </div>
        <div className="text-white text-[12px] font-bold leading-[1.5] font-mono">
          {toast.text}
        </div>
      </div>
    );
  }

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
