import { useNavigate } from 'react-router-dom';
import { MdSos, MdLocationOn, MdCheckCircle } from 'react-icons/md';
import { useCAD } from '../store/cadStore';
import { useToast } from '../contexts/ToastContext';

/*
  Persistent reference for every unresolved officer panic, so any LEO — whether
  on the Dispatch Center or their MDT, self-dispatching or not — can still see
  who hit their panic after the toast disappears. Self-contained: reads the
  active panics from the store and handles locate/clear itself. Renders nothing
  when there are no active panics.

  Clear is gated to dispatch/admin/supervisor or the officer who triggered it.
*/
export default function ActivePanicsPanel({ className = '' }) {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const navigate = useNavigate();
  const { activePanics = [], currentUser } = state;

  if (!activePanics.length) return null;

  const isDispatcher = currentUser?.portal === 'dispatch' || currentUser?.portal === 'admin';
  const canClear = (p) =>
    isDispatcher || ['admin', 'supervisor'].includes(currentUser?.role) || p.officerId === currentUser?.id;

  const clear = (officerId) => {
    dispatch({ type: 'CLEAR_PANIC', payload: officerId });
    toast.success('Panic cleared');
  };

  return (
    <div className={`rounded-xl overflow-hidden border border-red-500/45 shadow-lg shadow-red-900/20 ${className}`}
      style={{ background: 'rgba(239,68,68,0.07)' }}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-red-500/25" style={{ background: 'rgba(239,68,68,0.15)' }}>
        <MdSos size={16} className="text-red-400 shrink-0 animate-pulse" />
        <span className="text-[11px] font-bold uppercase tracking-[0.7px] text-red-300">Active Panics</span>
        <span className="ml-auto text-[11px] font-bold text-red-200 tabular-nums px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.25)' }}>
          {activePanics.length}
        </span>
      </div>
      <div className="flex flex-col">
        {activePanics.map((p, i) => (
          <div key={p.id} className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? 'border-t border-red-500/15' : ''}`}>
            <span className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 border border-red-500/40" style={{ background: 'rgba(239,68,68,0.2)' }}>
              <MdSos size={15} className="text-red-400" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-bold text-red-200 truncate">
                {p.unit || 'UNIT'}{p.name && <span className="text-red-300/60 font-normal ml-1.5">· {p.name}</span>}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-red-300/70 truncate">
                <MdLocationOn size={12} className="shrink-0" /> {p.location || 'Location unknown'}
                {p.time && <span className="text-red-300/40 ml-1">· {p.time}</span>}
              </div>
            </div>
            <button onClick={() => navigate('/map')}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-red-200 cursor-pointer border border-red-500/35 hover:bg-red-500/15 transition-colors"
              style={{ background: 'rgba(239,68,68,0.08)' }} title="Show on live map">
              <MdLocationOn size={13} /> Locate
            </button>
            {canClear(p) && (
              <button onClick={() => clear(p.officerId)}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-300 cursor-pointer border border-border-base hover:bg-white/[0.07] hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)' }} title="Mark this panic resolved">
                <MdCheckCircle size={13} /> Clear
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
