import {
  MdMyLocation, MdLocationOn, MdCheckCircle, MdArrowForward,
} from 'react-icons/md';
import { STATUS_COLORS } from '../constants/statusColors';
import { S_CARD, S_LABEL, S_DATA, BADGE } from '../constants/styles';

function StatusBadge({ status }) {
  const key = { AVAILABLE:'available', BUSY:'busy', ENRT:'enrt', ARRVD:'arrvd', OFFDUTY:'offduty', UNAVAILABLE:'unavailable' }[status] || 'gray';
  return <span className={BADGE[key] || BADGE.gray}>{status}</span>;
}

function PriBadge({ p }) {
  const m = { 1: BADGE.p1, 2: BADGE.p2, 3: BADGE.p3, 4: BADGE.p4 };
  return <span className={m[p] || BADGE.gray}>P{p}</span>;
}

/* Field-unit self-service status codes (mirrors the dispatcher set). */
export const MY_STATUSES = [
  { code: 'AVAILABLE',   label: 'Available'   },
  { code: 'ENRT',        label: 'En Route'    },
  { code: 'ARRVD',       label: 'On Scene'    },
  { code: 'BUSY',        label: 'Busy'        },
  { code: 'UNAVAILABLE', label: 'Unavailable' },
  { code: 'OFFDUTY',     label: 'Off Duty'    },
];

/* "My Status" + self-dispatch body for an HCFR field unit. Renders as the
   scrollable contents of a panel (no outer chrome) so it can drop into the
   Fire Board roster column. Lets a unit set its own status and attach itself
   to an active fire / EMS incident without waiting on a dispatcher. */
export default function MyStatusContent({ me, calls, dispatch, toast }) {
  if (!me) return null;

  const myCall = me.callId ? calls.find(c => c.id === me.callId) : null;
  const fireCalls = calls
    .filter(c => c.category === 'fire' && c.status !== 'CLOSED')
    .sort((a, b) => a.priority - b.priority);

  const setStatus = (code) => {
    dispatch({ type: 'SET_STATUS', payload: code });
    const lbl = MY_STATUSES.find(s => s.code === code)?.label || code;
    toast.info(`Status set to ${lbl}`, { color: STATUS_COLORS[code] });
  };

  const respond = (callId) => {
    // Switching incidents: clear off the previous one first so it doesn't
    // keep showing this unit on scene.
    if (me.callId && me.callId !== callId) {
      dispatch({ type: 'DETACH_UNIT', payload: { callId: me.callId, unitId: me.unitId } });
    }
    dispatch({ type: 'ASSIGN_UNIT', payload: { callId, unitId: me.unitId } });
    dispatch({ type: 'SET_MY_CALL', payload: callId });
    toast.success(`${me.unitId} en route to ${callId}`, { title: 'Self-Dispatched' });
  };

  const clearCall = () => {
    if (!me.callId) return;
    const prev = me.callId;
    dispatch({ type: 'DETACH_UNIT', payload: { callId: prev, unitId: me.unitId } });
    dispatch({ type: 'SET_MY_CALL', payload: null });
    toast.info(`${me.unitId} cleared from ${prev}`);
  };

  const dot = STATUS_COLORS[me.status] || '#94a3b8';

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-col gap-3.5">
      {/* Identity */}
      <div className="flex items-center gap-2.5">
        <span className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-app-elevated border border-border-base flex items-center justify-center text-[14px] font-bold text-slate-300">
            {me.name.charAt(0)}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-app-panel" style={{ background: dot }} />
        </span>
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-white truncate">{me.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`${S_DATA} text-[10px] text-orange-400`}>{me.unitId}</span>
            <StatusBadge status={me.status} />
          </div>
        </div>
      </div>

      {/* Status toggles */}
      <div>
        <div className={`${S_LABEL} mb-1.5`}>Set My Status</div>
        <div className="grid grid-cols-2 gap-1.5">
          {MY_STATUSES.map(s => {
            const on = me.status === s.code;
            const c = STATUS_COLORS[s.code];
            return (
              <button key={s.code} onClick={() => setStatus(s.code)}
                className="press-sm flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11.5px] font-bold cursor-pointer transition-all border"
                style={on
                  ? { background: `${c}22`, borderColor: `${c}66`, color: c }
                  : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c }} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Self-dispatch */}
      <div className="border-t border-border-faint pt-3 flex flex-col">
        <div className={`${S_LABEL} mb-2 flex items-center gap-1.5`}>
          <MdMyLocation size={12} className="text-orange-400" /> Self-Dispatch
        </div>

        {myCall ? (
          <div className={`${S_CARD} !border-orange-500/40 bg-orange-500/[0.07] gap-1`}>
            <div className="flex items-center gap-1.5">
              <PriBadge p={myCall.priority} />
              <span className={`${S_DATA} text-[10px]`}>{myCall.id}</span>
              <span className="ml-auto text-[9.5px] font-bold uppercase tracking-wide text-orange-400">Assigned</span>
            </div>
            <div className="text-[12.5px] font-semibold text-white">{myCall.nature}</div>
            <div className="text-[11px] text-slate-400">{myCall.location}</div>
            <button onClick={clearCall}
              className="mt-2 press-sm w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11.5px] font-bold cursor-pointer border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] transition-colors">
              <MdCheckCircle size={13} /> Clear &amp; Mark Available
            </button>
          </div>
        ) : (
          <div className="text-[11px] text-slate-500 mb-1">Not assigned. Respond to an active incident below.</div>
        )}

        <div className="flex flex-col gap-1.5 mt-2">
          {fireCalls.length === 0 ? (
            <div className="text-[11px] text-slate-600 text-center py-4">No active fire / EMS incidents</div>
          ) : fireCalls.map(c => {
            const onThis = me.callId === c.id;
            return (
              <div key={c.id} className="rounded-lg border border-border-base bg-app-card/70 p-2.5 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <PriBadge p={c.priority} />
                  <span className={`${S_DATA} text-[10px]`}>{c.id}</span>
                  <span className="ml-auto text-[10px] text-slate-500 font-mono">{c.units.length} unit{c.units.length === 1 ? '' : 's'}</span>
                </div>
                <div className="text-[12px] font-semibold text-slate-100 leading-snug">{c.nature}</div>
                <div className="flex items-start gap-1 text-[11px] text-slate-400">
                  <MdLocationOn size={12} className="text-slate-500 shrink-0 mt-0.5" /> {c.location}
                </div>
                <button onClick={() => respond(c.id)} disabled={onThis}
                  className="press-sm mt-0.5 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors border-0 disabled:cursor-default"
                  style={onThis
                    ? { background: 'rgba(74,222,128,0.15)', color: '#4ade80' }
                    : { background: '#e04020', color: '#fff' }}>
                  {onThis
                    ? <><MdCheckCircle size={13} /> Responding</>
                    : <><MdArrowForward size={13} /> Respond En Route</>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
