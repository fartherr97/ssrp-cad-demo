import { MdErrorOutline, MdRefresh, MdInbox } from 'react-icons/md';
import { useCAD } from '../store/cadStore';

/*
  Loading / error scaffolding for the backend handoff.

  Today the store hydrates synchronously from mock data, so `state.hydrated`
  is true on first render and this gate is a pass-through. When Steve wires a
  real API he can:
    1. set `hydrated: false` in initialState,
    2. fetch on mount and dispatch HYDRATE_SUCCESS (or HYDRATE_ERROR),
  and the app will show the loading/error screens below instead of flashing
  empty states or crashing. The same pattern is exposed per-list via
  <AsyncSection> so individual fetches get consistent states.
*/

export function LoadingScreen({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-4 p-8 text-slate-400">
      <span className="ui-spinner text-brand-bright" style={{ width: 34, height: 34 }} />
      <span className="text-[13px] font-semibold tracking-wide">{label}</span>
    </div>
  );
}

export function ErrorScreen({ message = 'Something went wrong while loading.', onRetry }) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-4 p-8 text-center text-slate-400">
      <MdErrorOutline size={44} className="text-red-400" />
      <div className="max-w-[420px] text-[13px] leading-relaxed">{message}</div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-transparent cursor-pointer transition-colors"
        >
          <MdRefresh size={16} /> Retry
        </button>
      )}
    </div>
  );
}

/* Per-list/section async wrapper — Steve passes the fetch's loading/error/empty
   flags and gets consistent states. */
export function AsyncSection({ loading, error, empty, emptyLabel = 'Nothing here yet.', onRetry, children }) {
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={typeof error === 'string' ? error : undefined} onRetry={onRetry} />;
  if (empty) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-3 p-8 text-center text-slate-500">
        <MdInbox size={32} className="opacity-40" />
        <span className="text-[13px]">{emptyLabel}</span>
      </div>
    );
  }
  return children;
}

export default function HydrationGate({ children }) {
  const { state } = useCAD();
  if (state.hydrationError) {
    return <ErrorScreen message={String(state.hydrationError)} onRetry={() => window.location.reload()} />;
  }
  if (state.hydrated === false) return <LoadingScreen label="Connecting to dispatch…" />;
  return children;
}
