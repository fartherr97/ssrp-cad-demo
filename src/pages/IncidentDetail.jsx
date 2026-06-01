import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCAD } from '../store/cadStore';
import {
  cadElapsed, cadPri, cadCallStatus, cadStatus, CAD_STATUS_LABEL,
  S_BTN_SECONDARY, S_BTN_DANGER, sm,
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
  return <span className={cadElapsed(cls)}>{elapsed}</span>;
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
  AVAILABLE:'#22ff66', ENRT:'#ddff33', BUSY:'#ff8822',
  ARRVD:'#ffee22', UNAVAILABLE:'#dd44aa', OFFDUTY:'#ff4444',
};

const PRI_COLORS = { 1:'#ff3333', 2:'#ff8822', 3:'#ffee22', 4:'#22ff66' };

export default function IncidentDetail() {
  const { callId } = useParams();
  const { state, dispatch } = useCAD();
  const { calls, officers, dispatchLog, currentUser } = state;
  const navigate = useNavigate();

  const [radioMsg, setRadioMsg] = useState('');

  const call = calls.find(c => c.id === callId);
  const isDispatch = currentUser?.role === 'dispatch' || currentUser?.role === 'admin';
  const onDutyOfficers = officers.filter(o => o.status !== 'OFFDUTY');
  const availableUnits = onDutyOfficers.filter(o => (o.status === 'AVAILABLE' || o.status === 'ENRT') && !call?.units.includes(o.unitId));

  const assignUnit = (unitId) => {
    if (!call) return;
    dispatch({ type:'ASSIGN_UNIT', payload:{ callId:call.id, unitId } });
  };
  const detachUnit = (unitId) => {
    if (!call) return;
    dispatch({ type:'DETACH_UNIT', payload:{ callId:call.id, unitId } });
  };
  const updateStatus = (status) => {
    if (!call) return;
    dispatch({ type:'UPDATE_CALL', payload:{ id:call.id, status } });
  };
  const closeCall = () => {
    if (!call) return;
    dispatch({ type:'CLOSE_CALL', payload:call.id });
    navigate('/cad');
  };
  const sendRadio = () => {
    if (!radioMsg.trim()) return;
    dispatch({ type:'DISPATCH_RADIO', payload:radioMsg.trim() });
    setRadioMsg('');
  };
  const setUnitStatus = (unitId, status) => {
    dispatch({ type:'SET_UNIT_STATUS', payload:{ unitId, status } });
  };

  if (!call) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-app-bg text-slate-600 gap-3">
        <div className="text-lg font-mono font-bold">CALL NOT FOUND</div>
        <div className="text-xs text-slate-700">Call {callId} does not exist or has been closed.</div>
        <button className={`${sm(S_BTN_SECONDARY)} mt-2`} onClick={() => navigate('/cad')}>← Back to CAD</button>
      </div>
    );
  }

  const priColor = PRI_COLORS[call.priority] || '#aabbcc';

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-app-bg">

      {/* ── Top header bar ── */}
      <div
        className="px-4 flex items-center gap-4 shrink-0 min-h-[52px] bg-[#040d1c]"
        style={{ borderBottom: `2px solid ${priColor}44` }}
      >
        <button
          className={`${sm(S_BTN_SECONDARY)} shrink-0`}
          onClick={() => navigate('/cad')}
        >
          ← CAD
        </button>

        <div className="border-l border-[#1a3050] pl-4">
          <div className="text-[10px] font-mono text-slate-500 tracking-[0.5px]">INCIDENT</div>
          <div className="text-[15px] font-mono font-bold text-white leading-[1.1]">{call.id}</div>
        </div>

        <div className="border-l border-[#1a3050] pl-4 flex-1">
          <div className="text-base font-bold text-green-400 tracking-[0.3px]">{call.nature}</div>
          <div className="text-xs text-yellow-300 mt-[1px]">{call.location}</div>
          <div className="text-[10px] text-sky-400 font-mono">{call.city} · {call.county}</div>
        </div>

        <div className="flex gap-2.5 items-center shrink-0">
          <PriBadge p={call.priority} />
          <CallStatusBadge status={call.status} />
          {call.createdAt && <Elapsed createdAt={call.createdAt} />}
        </div>

        {isDispatch && (
          <button
            className={`${sm(S_BTN_DANGER)} shrink-0`}
            onClick={closeCall}
          >
            CLOSE CALL
          </button>
        )}
      </div>

      {/* ── Body: 3-column layout ── */}
      <div className="flex-1 grid overflow-hidden gap-0" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>

        {/* ── COL 1: Incident info + narrative ── */}
        <div className="flex flex-col border-r border-[#0d1e30] overflow-auto">
          <Section title="INCIDENT INFORMATION">
            <DetailRow label="CALL #"    value={call.id} mono />
            <DetailRow label="CATEGORY"  value={call.category?.toUpperCase()} />
            <DetailRow label="RPT PARTY" value={call.reportingParty || '*'} />
            <DetailRow label="TIMESTAMP" value={call.timestamp} mono small />
            <DetailRow label="PRIORITY"  value={`P${call.priority} * ${['Critical','High','Medium','Low'][call.priority-1] || ''}`} color={priColor} mono />
          </Section>

          <Section title="NARRATIVE" flex>
            <div className="text-slate-300 text-sm leading-[1.7] p-1 font-ui whitespace-pre-wrap">
              {call.description || 'No narrative provided.'}
            </div>
          </Section>
        </div>

        {/* ── COL 2: Units ── */}
        <div className="flex flex-col border-r border-[#0d1e30] overflow-auto">
          {/* Assigned units */}
          <Section title={`ASSIGNED UNITS (${call.units.length})`}>
            {call.units.length === 0 ? (
              <div className="text-[11px] text-slate-600 font-mono p-1">NO UNITS ASSIGNED</div>
            ) : call.units.map(uid => {
              const off = officers.find(o => o.unitId === uid);
              const sc = ST_COLOR[off?.status] || '#aabbcc';
              return (
                <div key={uid} className="flex items-center gap-2.5 px-2 py-1.5 border-b border-[#060e18] bg-[#030810]">
                  <span className="font-mono font-bold text-[13px] min-w-[60px]" style={{ color: sc }}>{uid}</span>
                  <span className="text-xs flex-1" style={{ color: sc }}>{off?.name || '*'}</span>
                  {off && <StatusBadge status={off.status} />}
                  {isDispatch && (
                    <button
                      onClick={() => detachUnit(uid)}
                      className="bg-transparent border-none text-red-600 cursor-pointer text-base px-1 leading-none"
                      title="Detach unit"
                    >×</button>
                  )}
                </div>
              );
            })}
          </Section>

          {/* Assign unit (dispatch only) */}
          {isDispatch && (
            <Section title="ASSIGN UNIT">
              {availableUnits.length === 0 ? (
                <div className="text-[11px] text-slate-600 font-mono p-1">NO AVAILABLE UNITS</div>
              ) : (
                <div className="flex flex-wrap gap-1 p-1">
                  {availableUnits.map(o => (
                    <button
                      key={o.id}
                      onClick={() => assignUnit(o.unitId)}
                      title={`${o.name} · ${o.deptShort} · ${o.status}`}
                      className="px-[10px] py-[3px] text-[11px] font-mono font-bold cursor-pointer bg-green-950/30"
                      style={{
                        color: ST_COLOR[o.status] || '#22ff66',
                        border: `1px solid ${ST_COLOR[o.status] || '#22ff66'}44`,
                      }}
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
            <Section title="CALL STATUS">
              <div className="flex gap-1 flex-wrap p-1">
                {['PENDING','ACTIVE','ENRT'].map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    className={`px-[14px] py-[5px] text-[11px] font-mono font-bold cursor-pointer border transition-all ${
                      call.status === s
                        ? 'bg-sky-950 text-sky-300 border-sky-700'
                        : 'bg-app-bg text-slate-500 border-white/[0.05]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* All field units at this call * let dispatch change their status */}
          {isDispatch && call.units.length > 0 && (
            <Section title="UNIT STATUS CONTROL">
              {call.units.map(uid => {
                const off = officers.find(o => o.unitId === uid);
                if (!off) return null;
                return (
                  <div key={uid} className="py-1 border-b border-[#060e18]">
                    <div className="text-[11px] font-mono font-bold mb-1" style={{ color: ST_COLOR[off.status] || '#aabbcc' }}>
                      {uid} · {off.name}
                    </div>
                    <div className="flex gap-[3px] flex-wrap">
                      {['AVAILABLE','ENRT','BUSY','ARRVD','UNAVAILABLE','OFFDUTY'].map(s => (
                        <button
                          key={s}
                          onClick={() => setUnitStatus(uid, s)}
                          className="px-[7px] py-[2px] text-[9px] font-mono font-bold cursor-pointer border transition-all"
                          style={{
                            background: off.status === s ? '#0e2848' : '#04090f',
                            color: off.status === s ? (ST_COLOR[s] || '#80c8f0') : '#3a5a78',
                            borderColor: off.status === s ? '#1a5090' : '#0d1e30',
                          }}
                        >
                          {s === 'AVAILABLE' ? 'AVL' : s === 'UNAVAILABLE' ? 'UNAVL' : s === 'OFFDUTY' ? 'OFD' : s}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </Section>
          )}
        </div>

        {/* ── COL 3: Radio TX + dispatch log ── */}
        <div className="flex flex-col overflow-hidden">
          {/* Radio TX (dispatch only) */}
          {isDispatch && (
            <Section title="RADIO BROADCAST">
              <div className="flex gap-1.5">
                <input
                  className="flex-1 bg-[#060f1e] border border-[#1a3050] text-sky-100 font-mono text-xs px-2 py-1.5 outline-none"
                  placeholder="Broadcast message..."
                  value={radioMsg}
                  onChange={e => setRadioMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendRadio()}
                />
                <button
                  onClick={sendRadio}
                  disabled={!radioMsg.trim()}
                  className={`px-4 py-1.5 text-[11px] font-mono font-bold border transition-all ${
                    radioMsg.trim()
                      ? 'bg-sky-950 text-sky-300 border-sky-700 cursor-pointer'
                      : 'bg-app-bg text-slate-600 border-white/[0.05] cursor-default'
                  }`}
                >
                  TX
                </button>
              </div>
            </Section>
          )}

          {/* Dispatch log */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-2.5 h-7 flex items-center bg-[#040a14] border-b border-[#0d1e30] shrink-0">
              <span className="text-[10px] font-bold text-slate-500 font-mono tracking-[0.8px] uppercase">
                ■ DISPATCH LOG
              </span>
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 overflow-y-auto">
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
        </div>
      </div>
    </div>
  );
}

/* ── Small helpers ── */
function Section({ title, children, flex }) {
  return (
    <div className={`flex flex-col border-b border-[#0d1e30]${flex ? ' flex-1' : ''}`}>
      <div className="px-2.5 py-1 bg-[#040d1c] border-b border-[#0d1e30] text-[10px] font-bold text-slate-500 font-mono tracking-[0.8px] uppercase shrink-0">
        {title}
      </div>
      <div className={`px-2.5 py-2${flex ? ' flex-1' : ''}`}>
        {children}
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono, small, color }) {
  return (
    <div className="flex gap-2 mb-[5px] items-baseline">
      <span className="text-[10px] text-slate-600 font-mono tracking-[0.3px] min-w-[80px] shrink-0 uppercase">
        {label}
      </span>
      <span
        className={`${small ? 'text-[11px]' : 'text-[13px]'} font-medium${mono ? ' font-mono' : ''}`}
        style={{ color: color || '#c8d8e8' }}
      >
        {value}
      </span>
    </div>
  );
}
