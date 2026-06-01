import { useState, useEffect } from 'react';
import { useCAD } from '../store/cadStore';
import { MdSos, MdCampaign, MdClose } from 'react-icons/md';

export default function RadioToast() {
  const { state } = useCAD();
  const { lastRadio, currentUser } = state;
  // Baseline to the radio that already exists when this mounts, so a stale
  // alert can't re-appear after switching portals/users (fresh mount won't
  // re-show an old broadcast — only genuinely new ones).
  const [dismissedId, setDismissedId] = useState(() => lastRadio?.id ?? null);

  const isSender = currentUser?.portal === 'dispatch';
  // Panic alerts broadcast to everyone (incl. dispatch); normal radio traffic
  // still hides for the dispatcher who sent it.
  const visible = lastRadio && lastRadio.id !== dismissedId && currentUser &&
    (lastRadio.panic || !isSender);
  const toast = visible ? lastRadio : null;

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setDismissedId(toast.id), toast.panic ? 10000 : 6000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  const panic = !!toast.panic;

  return (
    <div
      onClick={() => setDismissedId(toast.id)}
      className={`group fixed bottom-10 right-5 z-[1500] flex items-start gap-3 px-4 py-3 rounded-xl backdrop-blur-md cursor-pointer min-w-[280px] max-w-[400px] animate-slide-in-right border border-l-[4px] shadow-2xl
        ${panic
          ? 'bg-red-950/90 border-red-500/50 border-l-red-500 shadow-red-900/40 animate-pulse-red'
          : 'bg-app-card/95 border-border-strong border-l-brand shadow-black/50'}`}
    >
      <span className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${panic ? 'bg-red-500/20 text-red-300' : 'bg-brand/15 text-brand-bright'}`}>
        {panic ? <MdSos size={18} /> : <MdCampaign size={18} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`text-[10px] font-extrabold uppercase tracking-[0.8px] ${panic ? 'text-red-400' : 'text-brand-bright'}`}>
            {panic ? 'Panic Alert' : 'Dispatch Radio'}
          </span>
          <span className="ml-auto text-[10px] font-mono text-slate-500">{toast.time}</span>
        </div>
        <div className={`text-[12px] leading-[1.5] ${panic ? 'text-white font-semibold' : 'text-slate-200'}`}>
          {toast.text}
        </div>
      </div>
      <MdClose size={15} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );
}
