import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCAD } from '../store/cadStore';
import { useToast } from '../contexts/ToastContext';
import { DeptTag } from '../constants/deptLogos.jsx';
import RequestFDOTModal from '../components/RequestFDOTModal';
import RequestHCFRModal from '../components/RequestHCFRModal';
import { MdEngineering, MdLocalFireDepartment } from 'react-icons/md';
import {
  cadElapsed, cadPri, cadCallStatus, cadStatus, CAD_STATUS_LABEL,
  S_BTN_SECONDARY, S_BTN_DANGER, S_BTN_PRIMARY, sm,
  S_INPUT,
  S_TX_ENTRY, S_TX_TIME, TX_KIND_COLOR,
} from '../constants/styles';

function Elapsed({ createdAt }) {
  const [elapsed, setElapsed] = useState('');
  const [cls, setCls] = useState('ok');
  useEffect(() => {
    const tick = () => {
      const s = Math.floor((Date.now() - createdAt) / 1000);
      const m = Math.floor(s / 60);
      const sec = s % 60;
      setElapsed(`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`);
      setCls(m >= 15 ? 'crit' : m >= 8 ? 'warn' : 'ok');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  return <span className={`font-mono tabular-nums ${cadElapsed(cls)}`}>{elapsed}</span>;
}

function PriBadge({ p }) {
  return <span className={cadPri(p)}>P{p}</span>;
}

function CallStatusBadge({ status }) {
  return <span className={cadCallStatus(status)}>{status}</span>;
}

function StatusBadge({ status }) {
  return <span className={cadStatus(status)}>{CAD_STATUS_LABEL[status] || status}</span>;
}

// Runtime-dynamic status colors used for dot/text coloring in unit rows
const ST_COLOR = {
  AVAILABLE:'#4ade80', ENRT:'#a78bfa', BUSY:'#f87171',
  ARRVD:'#34d399', UNAVAILABLE:'#e879f9', OFFDUTY:'#94a3b8',
};

const PRI_COLORS = { 1:'#f87171', 2:'#fb923c', 3:'#facc15', 4:'#4ade80' };

const FDOT_REQ_META = {
  PENDING:      { label: 'FDOT Requested — Pending',  color: '#f59e0b' },
  ACKNOWLEDGED: { label: 'FDOT Acknowledged',         color: '#06b6d4' },
  DISPATCHED:   { label: 'FDOT Unit Dispatched',      color: '#22c55e' },
  COMPLETED:    { label: 'FDOT Assist Completed',     color: '#6b7280' },
  DECLINED:     { label: 'FDOT Declined Request',     color: '#ef4444' },
};

export default function IncidentDetail() {
  const { callId } = useParams();
  const { state, dispatch } = useCAD();
  const { calls, officers, dispatchLog, currentUser, fdotRequests = [], hcfrRequests = [] } = state;
  const navigate = useNavigate();
  const toast = useToast();

  const [radioMsg, setRadioMsg] = useState('');
  const [showFdot, setShowFdot]   = useState(false);
  const [showHcfr, setShowHcfr]   = useState(false);

  const call = calls.find(c => c.id === callId);
  const me = officers.find(o => o.id === currentUser?.id);
  // Most recent FDOT request tied to this call (any status).
  const fdotReq  = fdotRequests.find(r => r.callId === callId);
  const hcfrReq  = hcfrRequests.find(r => r.callId === callId);
  const isDispatch = currentUser?.portal === 'dispatch' || currentUser?.portal === 'admin' || currentUser?.role === 'dispatch' || currentUser?.role === 'admin';
  const onDutyOfficers = officers.filter(o => o.status !== 'OFFDUTY');
  const availableUnits = onDutyOfficers.filter(o => (o.status === 'AVAILABLE' || o.status === 'ENRT') && !call?.units.includes(o.unitId));

  const assignUnit = (unitId) => {
    if (!call) return;
    dispatch({ type:'ASSIGN_UNIT', payload:{ callId:call.id, unitId } });
    toast.success(`${unitId} assigned to ${call.id}`);
  };
  const detachUnit = (unitId) => {
    if (!call) return;
    dispatch({ type:'DETACH_UNIT', payload:{ callId:call.id, unitId } });
    toast.info(`${unitId} detached`);
  };
  const updateStatus = (status) => {
    if (!call) return;
    dispatch({ type:'UPDATE_CALL', payload:{ id:call.id, status } });
    toast.info(`Call status → ${status}`);
  };
  const closeCall = () => {
    if (!call) return;
    dispatch({ type:'CLOSE_CALL', payload:call.id });
    toast.success(`Call ${call.id} closed`);
    navigate('/cad');
  };
  const sendRadio = () => {
    if (!radioMsg.trim()) return;
    dispatch({ type:'DISPATCH_RADIO', payload:radioMsg.trim() });
    toast.info('Radio broadcast sent');
    setRadioMsg('');
  };
  const setUnitStatus = (unitId, status) => {
    dispatch({ type:'SET_UNIT_STATUS', payload:{ unitId, status } });
    toast.info(`${unitId} → ${CAD_STATUS_LABEL[status] || status}`);
  };

  if (!call) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-app-bg text-slate-600 gap-3">
        <div className="text-lg font-bold text-slate-400">CALL NOT FOUND</div>
        <div className="text-xs text-slate-600">Call {callId} does not exist or has been closed.</div>
        <button className={`${sm(S_BTN_SECONDARY)} mt-2`} onClick={() => navigate('/cad')}>← Back to CAD</button>
      </div>
    );
  }

  const priColor = PRI_COLORS[call.priority] || '#5d6f88';

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-app-bg p-4 lg:p-5 gap-4 lg:gap-5">

      {/* ── Top header bar ── */}
      <div
        className="px-4 py-3 flex flex-wrap items-center gap-4 shrink-0 bg-app-panel/80 border border-border-base rounded-xl backdrop-blur-sm shadow-lg shadow-black/20"
        style={{ borderLeft: `3px solid ${priColor}` }}
      >
        <button
          className={`${sm(S_BTN_SECONDARY)} shrink-0`}
          onClick={() => navigate('/cad')}
        >
          ← CAD
        </button>

        <div className="border-l border-border-base pl-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500">Incident</div>
          <div className="text-[15px] font-mono font-bold text-white leading-[1.1]">{call.id}</div>
        </div>

        <div className="border-l border-border-base pl-4 flex-1 min-w-[200px]">
          <div className="text-base font-bold text-white tracking-[0.2px]">{call.nature}</div>
          <div className="text-xs text-slate-300 mt-px">{call.location}</div>
          <div className="text-[10px] text-brand-bright font-mono">{call.city} · {call.county}</div>
        </div>

        <div className="flex gap-2.5 items-center shrink-0">
          <PriBadge p={call.priority} />
          <CallStatusBadge status={call.status} />
          {call.createdAt && <Elapsed createdAt={call.createdAt} />}
        </div>

        <button
          onClick={() => setShowFdot(true)}
          disabled={!!fdotReq && !['DECLINED', 'COMPLETED'].includes(fdotReq.status)}
          title={fdotReq && !['DECLINED', 'COMPLETED'].includes(fdotReq.status) ? 'FDOT already requested for this call' : 'Request FDOT assistance'}
          className="press shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer bg-amber-500/15 border border-amber-500/35 text-amber-400 hover:bg-amber-500/25 transition-colors disabled:opacity-45 disabled:cursor-default"
        >
          <MdEngineering size={15} /> REQUEST FDOT
        </button>

        <button
          onClick={() => setShowHcfr(true)}
          disabled={!!hcfrReq && !['DECLINED', 'COMPLETED'].includes(hcfrReq.status)}
          title={hcfrReq && !['DECLINED', 'COMPLETED'].includes(hcfrReq.status) ? 'HCFR already requested for this call' : 'Request HCFR assistance'}
          className="press shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer bg-red-500/15 border border-red-500/35 text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-45 disabled:cursor-default"
        >
          <MdLocalFireDepartment size={15} /> REQUEST HCFR
        </button>

        {isDispatch && (
          <button
            className={`press ${sm(S_BTN_DANGER)} shrink-0`}
            onClick={closeCall}
          >
            CLOSE CALL
          </button>
        )}
      </div>

      {/* ── FDOT request status banner ── */}
      {fdotReq && (() => {
        const m = FDOT_REQ_META[fdotReq.status] || FDOT_REQ_META.PENDING;
        return (
          <div className="shrink-0 flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{ background: `${m.color}14`, border: `1px solid ${m.color}40`, borderLeft: `3px solid ${m.color}` }}>
            <MdEngineering size={18} style={{ color: m.color }} className="shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12.5px] font-bold" style={{ color: m.color }}>{m.label}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/[0.06] text-slate-400">P{fdotReq.priority}</span>
                <span className="text-[11px] text-slate-500">{fdotReq.assistType}</span>
              </div>
              <div className="text-[11.5px] text-slate-400 mt-0.5 leading-relaxed">{fdotReq.description}</div>
              <div className="text-[10.5px] text-slate-600 mt-0.5">
                Requested by {fdotReq.requestedBy}{fdotReq.requestedByUnit ? ` (${fdotReq.requestedByUnit})` : ''}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── HCFR request status banner ── */}
      {hcfrReq && (() => {
        const HCFR_META = {
          PENDING:      { label: 'HCFR Requested — Pending',  color: '#ef4444' },
          ACKNOWLEDGED: { label: 'HCFR Acknowledged',         color: '#06b6d4' },
          DISPATCHED:   { label: 'HCFR Unit Dispatched',      color: '#22c55e' },
          COMPLETED:    { label: 'HCFR Assist Completed',     color: '#6b7280' },
          DECLINED:     { label: 'HCFR Declined Request',     color: '#ef4444' },
        };
        const m = HCFR_META[hcfrReq.status] || HCFR_META.PENDING;
        return (
          <div className="shrink-0 flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{ background: `${m.color}14`, border: `1px solid ${m.color}40`, borderLeft: `3px solid ${m.color}` }}>
            <MdLocalFireDepartment size={18} style={{ color: m.color }} className="shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12.5px] font-bold" style={{ color: m.color }}>{m.label}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/[0.06] text-slate-400">P{hcfrReq.priority}</span>
                <span className="text-[11px] text-slate-500">{hcfrReq.assistType}</span>
              </div>
              <div className="text-[11.5px] text-slate-400 mt-0.5 leading-relaxed">{hcfrReq.description}</div>
              <div className="text-[10.5px] text-slate-600 mt-0.5">
                Requested by {hcfrReq.requestedBy}{hcfrReq.requestedByUnit ? ` (${hcfrReq.requestedByUnit})` : ''}
              </div>
            </div>
          </div>
        );
      })()}

      {showFdot && (
        <RequestFDOTModal call={call} officer={me} onClose={() => setShowFdot(false)} />
      )}
      {showHcfr && (
        <RequestHCFRModal call={call} officer={me} onClose={() => setShowHcfr(false)} />
      )}

      {/* ── Body: 3-column layout ── */}
      <div className="flex-1 grid overflow-auto lg:overflow-hidden gap-4 lg:gap-5 min-h-0 grid-cols-1 lg:grid-cols-3">

        {/* ── COL 1: Incident info + narrative ── */}
        <Panel>
          <Section title="Incident Information">
            <DetailRow label="Call #"    value={call.id} mono />
            <DetailRow label="Category"  value={call.category?.toUpperCase()} />
            <DetailRow label="Rpt Party" value={call.reportingParty || '—'} />
            <DetailRow label="Timestamp" value={call.timestamp} mono small />
            <DetailRow label="Priority"  value={`P${call.priority} · ${['Critical','High','Medium','Low'][call.priority-1] || ''}`} color={priColor} mono />
          </Section>

          <Section title="Narrative" flex>
            <div className="text-slate-300 text-sm leading-[1.7] whitespace-pre-wrap">
              {call.description || 'No narrative provided.'}
            </div>
          </Section>
        </Panel>

        {/* ── COL 2: Units ── */}
        <Panel>
          {/* Assigned units */}
          <Section title={`Assigned Units (${call.units.length})`}>
            {call.units.length === 0 ? (
              <div className="text-[11px] text-slate-600 font-mono">NO UNITS ASSIGNED</div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {call.units.map(uid => {
                  const off = officers.find(o => o.unitId === uid);
                  const sc = ST_COLOR[off?.status] || '#93a4bd';
                  return (
                    <div key={uid} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-app-card/70 border border-border-base">
                      <span className="font-mono font-bold text-[13px] min-w-[60px]" style={{ color: sc }}>{uid}</span>
                      {off?.deptShort && <DeptTag code={off.deptShort} />}
                      <span className="text-xs flex-1 text-slate-200">{off?.name || '—'}</span>
                      {off && <StatusBadge status={off.status} />}
                      {isDispatch && (
                        <button
                          onClick={() => detachUnit(uid)}
                          className="press-sm bg-transparent border-none text-red-400 hover:text-red-300 cursor-pointer text-base px-1 leading-none"
                          title="Detach unit"
                        >×</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Assign unit (dispatch only) */}
          {isDispatch && (
            <Section title="Assign Unit">
              {availableUnits.length === 0 ? (
                <div className="text-[11px] text-slate-600 font-mono">NO AVAILABLE UNITS</div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {availableUnits.map(o => (
                    <button
                      key={o.id}
                      onClick={() => assignUnit(o.unitId)}
                      title={`${o.name} · ${o.deptShort} · ${o.status}`}
                      className="press-sm px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition-colors"
                    >
                      {o.unitId}
                    </button>
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* Call status controls (dispatch only) */}
          {isDispatch && (
            <Section title="Call Status">
              <div className="flex gap-1.5 flex-wrap">
                {['PENDING','ACTIVE','ENRT'].map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    className={`press-sm px-3.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer border transition-all ${
                      call.status === s
                        ? 'bg-brand/15 text-brand-bright border-brand/40'
                        : 'bg-white/[0.03] text-slate-400 border-border-base hover:bg-white/[0.07] hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* All field units at this call · let dispatch change their status */}
          {isDispatch && call.units.length > 0 && (
            <Section title="Unit Status Control">
              <div className="flex flex-col gap-2.5">
                {call.units.map(uid => {
                  const off = officers.find(o => o.unitId === uid);
                  if (!off) return null;
                  return (
                    <div key={uid} className="flex flex-col gap-1.5 pb-2.5 border-b border-border-faint last:border-0 last:pb-0">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold" style={{ color: ST_COLOR[off.status] || '#93a4bd' }}>
                        {uid} · {off.name}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {['AVAILABLE','ENRT','BUSY','ARRVD','UNAVAILABLE','OFFDUTY'].map(s => {
                          const on = off.status === s;
                          return (
                            <button
                              key={s}
                              onClick={() => setUnitStatus(uid, s)}
                              className={`press-sm px-2 py-1 rounded-md text-[9px] font-mono font-bold cursor-pointer border transition-all ${
                                on
                                  ? 'bg-brand/15 text-brand-bright border-brand/40'
                                  : 'bg-white/[0.03] text-slate-500 border-border-base hover:bg-white/[0.07] hover:text-slate-300'
                              }`}
                            >
                              {s === 'AVAILABLE' ? 'AVL' : s === 'UNAVAILABLE' ? 'UNAVL' : s === 'OFFDUTY' ? 'OFD' : s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}
        </Panel>

        {/* ── COL 3: Radio TX + dispatch log ── */}
        <Panel>
          {/* Radio TX (dispatch only) */}
          {isDispatch && (
            <Section title="Radio Broadcast">
              <div className="flex gap-2">
                <input
                  className={`${S_INPUT} flex-1`}
                  placeholder="Broadcast message..."
                  value={radioMsg}
                  onChange={e => setRadioMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendRadio()}
                />
                <button
                  onClick={sendRadio}
                  disabled={!radioMsg.trim()}
                  className={`press ${sm(S_BTN_PRIMARY)} shrink-0`}
                >
                  TX
                </button>
              </div>
            </Section>
          )}

          {/* Dispatch log */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border-faint shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-[0.9px] text-slate-400">
                Dispatch Log
              </span>
            </div>
            <div className="flex-1 overflow-y-auto px-2.5 py-2">
              {dispatchLog.slice(0, 100).map(e => (
                <div key={e.id} className={S_TX_ENTRY}>
                  <span className={S_TX_TIME}>{e.time}</span>
                  <span className={`${TX_KIND_COLOR[e.kind] || 'text-slate-500'} flex-1 whitespace-normal break-words`}>
                    {e.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ── Small helpers ── */
function Panel({ children }) {
  return (
    <div className="flex flex-col min-h-0 overflow-auto bg-app-panel/80 border border-border-base rounded-xl backdrop-blur-sm shadow-lg shadow-black/20">
      {children}
    </div>
  );
}

function Section({ title, children, flex }) {
  return (
    <div className={`flex flex-col border-b border-border-faint last:border-0${flex ? ' flex-1' : ''}`}>
      <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.9px] text-slate-400 shrink-0">
        {title}
      </div>
      <div className={`px-4 pb-4${flex ? ' flex-1' : ''}`}>
        {children}
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono, small, color }) {
  return (
    <div className="flex gap-3 mb-2 items-baseline">
      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.5px] min-w-[80px] shrink-0">
        {label}
      </span>
      <span
        className={`${small ? 'text-[11px]' : 'text-[13px]'} font-medium text-slate-200${mono ? ' font-mono' : ''}`}
        style={color ? { color } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
