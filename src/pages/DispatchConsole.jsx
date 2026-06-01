import { useState, useEffect } from 'react';
import { useCAD } from '../store/cadStore';
import { useResponsive } from '../hooks/useResponsive';
import StatusBadge from '../components/StatusBadge';

const PR = { 1: '#dc2626', 2: '#ea580c', 3: '#ca8a04', 4: '#16a34a' };
const UNIT_STATUSES = ['AVAILABLE', 'ENRT', 'ARRVD', 'BUSY', 'UNAVAILABLE', 'OFFDUTY'];
const UNIT_COLOR = { AVAILABLE: '#4ade80', ENRT: '#fbbf24', ARRVD: '#c084fc', ONSCENE: '#c084fc', BUSY: '#fb923c', UNAVAILABLE: '#f87171', OFFDUTY: '#374151' };
const uc = s => UNIT_COLOR[s] || '#4ade80';

const LOG_COLOR = { call: '#4ade80', unit: '#93c5fd', status: '#fbbf24', alert: '#f87171', info: '#4b5563' };
const LOG_TAG   = { call: 'CALL', unit: 'UNIT', status: 'STAT', alert: 'RADIO', info: 'INFO' };

const NATURES = [
  'Traffic Stop', 'Suspicious Person', 'Domestic Disturbance', 'MVA w/ Injuries',
  'Structure Fire', 'Medical Emergency', 'Armed Robbery', 'Noise Complaint',
  'Welfare Check', 'Foot Pursuit', 'Shots Fired', 'Other',
];

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  return now;
}

function fmtClock(ms) {
  const d = new Date(ms), p = n => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
function fmtElapsed(from, now) {
  if (!from) return '--:--';
  const s = Math.max(0, Math.floor((now - from) / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sc = s % 60;
  const p = n => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(sc)}` : `${p(m)}:${p(sc)}`;
}
function elapsedColor(from, now, hasUnits) {
  if (!from) return '#374151';
  const mins = (now - from) / 60000;
  if (!hasUnits && mins >= 10) return '#dc2626';
  if (!hasUnits && mins >= 5)  return '#ea580c';
  return '#374151';
}

export default function DispatchConsole() {
  const { state, dispatch } = useCAD();
  const { calls, officers, currentUser, dispatchLog } = state;
  const { isMobile } = useResponsive();
  const now = useNow();
  const clock = fmtClock(now);

  const [selectedCallId, setSelectedCallId] = useState(null);
  const [radio, setRadio] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [mobileTab, setMobileTab] = useState('calls');

  const activeCalls = calls.filter(c => c.status !== 'CLOSED');
  const selectedCall = activeCalls.find(c => c.id === selectedCallId) || null;
  const onDuty    = officers.filter(o => o.status !== 'OFFDUTY');
  const available = officers.filter(o => o.status === 'AVAILABLE');
  const pending   = activeCalls.filter(c => c.units.length === 0).length;

  const sendRadio = () => {
    const msg = radio.trim();
    if (!msg) return;
    dispatch({ type: 'DISPATCH_RADIO', payload: msg });
    setRadio('');
  };

  return (
    <div
      className="flex flex-col font-mono bg-[#080b12] overflow-hidden"
      style={{ height: `calc(100vh - ${isMobile ? 42 : 70}px)` }}
    >

      {/* ── Header strip ── */}
      <div className="bg-[#0d1117] border-b border-[#141720] px-3 py-1.5 flex items-center gap-3 flex-wrap shrink-0">
        <div className="flex items-center gap-[5px]">
          <span className="w-[7px] h-[7px] rounded-full bg-green-500 shadow-[0_0_6px_theme(colors.green.500)]" />
          <span className="text-amber-400 font-bold text-[11px] tracking-[1px]">DISPATCH CONSOLE</span>
        </div>
        <Pipe />
        <span className="text-[#374151] text-[11px]">OPER: <span className="text-[#9ca3af]">{currentUser?.name || '*'}</span></span>
        <Pipe />
        <StatChip label="CALLS"       value={activeCalls.length} color="#fbbf24" />
        <StatChip label="UNASSIGNED"  value={pending}            color={pending > 0 ? '#f87171' : '#374151'} />
        <StatChip label="ON-DUTY"     value={onDuty.length}      color="#4ade80" />
        <StatChip label="AVAIL"       value={available.length}   color="#93c5fd" />
        <div className="ml-auto text-blue-700 font-bold text-[13px] tracking-[0.5px]">{clock}</div>
      </div>

      {/* Mobile tab bar */}
      {isMobile && (
        <div className="flex border-b border-[#141720] bg-[#0d1117] shrink-0">
          {[['calls', 'CALLS'], ['units', 'UNITS'], ['log', 'TX LOG']].map(([v, l]) => (
            <button key={v} onClick={() => setMobileTab(v)}
              className={`flex-1 bg-transparent border-none py-2 px-1 text-[11px] tracking-[0.5px] cursor-pointer font-mono
                ${mobileTab === v ? 'border-b-2 border-amber-400 text-amber-400 font-bold' : 'border-b-2 border-transparent text-[#4b5563] font-medium'}`}>
              {l}
            </button>
          ))}
        </div>
      )}

      {/* ── 3-column workspace ── */}
      <div
        className="flex-1 min-h-0 overflow-hidden"
        style={{
          display: isMobile ? 'flex' : 'grid',
          ...(isMobile ? { flexDirection: 'column' } : { gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr) minmax(0,0.9fr)' }),
        }}
      >

        {/* ===== CALL QUEUE ===== */}
        <div className={`${!isMobile || mobileTab === 'calls' ? 'flex' : 'hidden'} flex-col border-r border-[#141720] min-h-0 overflow-hidden`}>
          <ColHead title="CALL QUEUE" count={activeCalls.length}>
            <HdrBtn active={showNew} onClick={() => setShowNew(v => !v)}>
              {showNew ? 'Cancel' : '+ New Call'}
            </HdrBtn>
          </ColHead>
          {showNew && <NewCallForm onClose={() => setShowNew(false)} dispatch={dispatch} />}
          <div className="flex-1 overflow-y-auto">
            {activeCalls.length === 0 && <Empty>No active calls.</Empty>}
            {activeCalls.map(call => {
              const sel = call.id === selectedCallId;
              return (
                <div
                  key={call.id}
                  onClick={() => setSelectedCallId(sel ? null : call.id)}
                  className={`px-2.5 py-2 cursor-pointer border-b border-[#141720] hover:bg-[#0d1117] transition-colors`}
                  style={{
                    borderLeft: `3px solid ${PR[call.priority] || '#1a1e2c'}`,
                    background: sel ? '#0f172a' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="rounded-sm px-1 text-[10px] font-bold bg-[#0d1117]"
                      style={{ color: PR[call.priority], border: `1px solid ${PR[call.priority]}44` }}
                    >P{call.priority}</span>
                    <span className="text-green-400 font-bold text-[12px]">{call.id}</span>
                    <span className="text-slate-200 font-semibold text-[12px] flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{call.nature}</span>
                    <span className="font-mono text-[11px] font-bold shrink-0" style={{ color: elapsedColor(call.createdAt, now, call.units.length > 0) }}>
                      {fmtElapsed(call.createdAt, now)}
                    </span>
                    <StatusBadge status={call.status} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[#6b7280] text-[11px] overflow-hidden text-ellipsis whitespace-nowrap">{call.location}</span>
                    <span className={`text-[11px] shrink-0 ml-1.5 ${call.units.length ? 'text-sky-300' : 'text-red-600'}`}>
                      {call.units.length ? call.units.join(', ') : 'UNASSIGNED'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected call control */}
          {selectedCall && (
            <div className="border-t border-[#141720] px-2.5 py-2 bg-[#0d1117] shrink-0">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-amber-400 text-[11px] font-bold">
                  CALL {selectedCall.id}
                  <span className="ml-1.5 font-mono" style={{ color: elapsedColor(selectedCall.createdAt, now, selectedCall.units.length > 0) }}>
                    {fmtElapsed(selectedCall.createdAt, now)}
                  </span>
                </span>
                <div className="flex gap-1">
                  <MiniBtn bg="#0f2451" onClick={() => dispatch({ type: 'UPDATE_CALL', payload: { id: selectedCall.id, status: 'ACTIVE' } })}>
                    Set Active
                  </MiniBtn>
                  <MiniBtn bg="#450a0a" onClick={() => { dispatch({ type: 'CLOSE_CALL', payload: selectedCall.id }); setSelectedCallId(null); }}>
                    Close
                  </MiniBtn>
                </div>
              </div>
              <div className="text-[#4b5563] text-[11px] mb-[5px]">{selectedCall.description}</div>
              <div className="text-[#374151] text-[10px] tracking-[0.5px] uppercase mb-1">Attached Units</div>
              <div className="flex flex-wrap gap-1">
                {selectedCall.units.length === 0 && <span className="text-[#374151] text-[11px]">None * dispatch from units panel</span>}
                {selectedCall.units.map(u => (
                  <span key={u} className="inline-flex items-center gap-1 bg-[#0f172a] border border-[#1a1e2c] rounded-sm px-1.5 py-px text-[11px] text-sky-300">
                    {u}
                    <button
                      onClick={() => dispatch({ type: 'DETACH_UNIT', payload: { callId: selectedCall.id, unitId: u } })}
                      className="bg-none border-none text-red-400 cursor-pointer text-[12px] p-0 leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===== UNITS PANEL ===== */}
        <div className={`${!isMobile || mobileTab === 'units' ? 'flex' : 'hidden'} flex-col border-r border-[#141720] min-h-0 overflow-hidden`}>
          <ColHead title="UNITS" count={onDuty.length} />
          <div className="flex-1 overflow-y-auto">
            {officers.map(o => (
              <div key={o.id} className="px-2.5 py-[7px] border-b border-[#141720]" style={{ borderLeft: `3px solid ${uc(o.status)}` }}>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sky-300 font-bold text-[12px]">{o.unitId}</span>
                  <span className="font-semibold text-[12px] flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: uc(o.status) }}>{o.name}</span>
                  <span className="text-[#374151] text-[10px] shrink-0">{o.deptShort}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="flex items-center gap-1.5 mt-[5px] flex-wrap">
                  <span className={`text-[10px] flex-1 min-w-0 ${o.callId ? 'text-amber-400' : 'text-[#374151]'}`}>
                    {o.callId ? `On Call: ${o.callId}` : 'Unassigned'}
                  </span>
                  <select
                    value={UNIT_STATUSES.includes(o.status) ? o.status : ''}
                    onChange={e => dispatch({ type: 'SET_UNIT_STATUS', payload: { unitId: o.unitId, status: e.target.value } })}
                    className="bg-[#06070c] border border-[#1a1e2c] rounded-sm text-[#9ca3af] text-[10px] px-1 py-px font-mono"
                  >
                    {!UNIT_STATUSES.includes(o.status) && <option value="">{o.status}</option>}
                    {UNIT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    disabled={!selectedCall || selectedCall.units.includes(o.unitId)}
                    onClick={() => dispatch({ type: 'ASSIGN_UNIT', payload: { callId: selectedCall.id, unitId: o.unitId } })}
                    className="bg-[#0f2451] border border-[#1d4ed8] rounded-sm text-sky-300 px-[7px] py-px text-[10px] font-semibold cursor-pointer font-mono disabled:opacity-35"
                  >
                    Dispatch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== TX LOG ===== */}
        <div className={`${!isMobile || mobileTab === 'log' ? 'flex' : 'hidden'} flex-col min-h-0 overflow-hidden`}>
          <ColHead title="TX LOG" count={dispatchLog.length} />
          <div className="flex-1 overflow-y-auto px-2.5 py-2 bg-[#06070c]">
            {dispatchLog.length === 0 && <Empty>No radio traffic.</Empty>}
            {dispatchLog.map(e => (
              <div key={e.id} className="flex gap-1.5 py-0.5 text-[11px] leading-[1.5]">
                <span className="text-[#1f2937] shrink-0">{e.time}</span>
                <span className="font-bold text-[10px] shrink-0 min-w-[38px]" style={{ color: LOG_COLOR[e.kind] || '#374151' }}>
                  [{LOG_TAG[e.kind] || 'INFO'}]
                </span>
                <span style={{ color: e.kind === 'alert' ? '#fca5a5' : '#6b7280' }}>{e.text}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#141720] px-2 py-1.5 flex gap-1.5 bg-[#0d1117] shrink-0">
            <span className="text-green-400 self-center font-bold shrink-0">›</span>
            <input
              value={radio}
              onChange={e => setRadio(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendRadio(); }}
              placeholder="Broadcast radio traffic…"
              className="flex-1 bg-[#06070c] border border-[#1a1e2c] rounded-sm text-slate-300 font-mono text-[12px] px-[7px] py-1"
            />
            <button onClick={sendRadio} className="bg-[#0f2451] border border-[#1d4ed8] rounded-sm text-sky-300 px-2.5 py-1 text-[11px] font-bold cursor-pointer font-mono">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helper components ── */

function Pipe() {
  return <span className="w-px h-3 bg-[#1a1e2c] shrink-0" />;
}

function StatChip({ label, value, color }) {
  return (
    <span className="text-[11px] text-[#374151]">
      {label} <span style={{ color, fontWeight: 700 }}>{value}</span>
    </span>
  );
}

function ColHead({ title, count, children }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-[5px] bg-[#0d1117] border-b border-[#141720] shrink-0">
      <span className="text-amber-400 text-[11px] font-bold tracking-[0.8px]">{title}</span>
      <span className="bg-black/40 text-sky-300 border border-[#1d4ed844] rounded-[10px] px-1.5 text-[10px] font-bold">{count}</span>
      <div className="ml-auto flex gap-1">{children}</div>
    </div>
  );
}

function HdrBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-sm px-2 py-px text-[10px] font-semibold cursor-pointer font-mono border
        ${active
          ? 'bg-[#450a0a] border-red-600 text-red-400'
          : 'bg-[#0f172a] border-[#1a1e2c] text-[#6b7280]'}`}
    >
      {children}
    </button>
  );
}

function MiniBtn({ bg, onClick, children }) {
  return (
    <button onClick={onClick}
      className="border-none rounded-sm text-slate-300 px-2 py-px text-[10px] font-semibold cursor-pointer font-mono whitespace-nowrap"
      style={{ background: bg }}
    >
      {children}
    </button>
  );
}

function Empty({ children }) {
  return <div className="p-3.5 text-center text-[#1f2937] text-[12px]">{children}</div>;
}

function NewCallForm({ onClose, dispatch }) {
  const [form, setForm] = useState({ nature: 'Traffic Stop', priority: 2, location: '', city: 'Tampa', county: 'Hillsborough County', reportingParty: 'Dispatch', description: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.location.trim()) return;
    dispatch({ type: 'CREATE_CALL', payload: { ...form, priority: Number(form.priority), status: 'PENDING', category: 'police' } });
    onClose();
  };

  const inpCls = "w-full bg-[#06070c] border border-[#1a1e2c] rounded-sm text-slate-300 font-mono text-[11px] px-1.5 py-1";
  const lblCls = "text-[#374151] text-[9px] tracking-[0.7px] uppercase block mb-[3px]";

  return (
    <div className="px-2.5 py-2 border-b border-[#141720] bg-[#0d1117] shrink-0">
      <div className="grid grid-cols-2 gap-1.5">
        <label><span className={lblCls}>Nature</span>
          <select value={form.nature} onChange={e => set('nature', e.target.value)} className={inpCls}>
            {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label><span className={lblCls}>Priority</span>
          <select value={form.priority} onChange={e => set('priority', e.target.value)} className={inpCls}>
            <option value={1}>P1 * Emergency</option><option value={2}>P2 * Urgent</option>
            <option value={3}>P3 * Routine</option><option value={4}>P4 * Non-urgent</option>
          </select>
        </label>
        <label className="col-span-2"><span className={lblCls}>Location *</span>
          <input value={form.location} onChange={e => set('location', e.target.value)} className={inpCls} placeholder="e.g. 412 Oakwood Ave, Tampa" />
        </label>
        <label><span className={lblCls}>City</span>
          <input value={form.city} onChange={e => set('city', e.target.value)} className={inpCls} />
        </label>
        <label><span className={lblCls}>Reporting Party</span>
          <input value={form.reportingParty} onChange={e => set('reportingParty', e.target.value)} className={inpCls} />
        </label>
        <label className="col-span-2"><span className={lblCls}>Description</span>
          <input value={form.description} onChange={e => set('description', e.target.value)} className={inpCls} placeholder="Brief details..." />
        </label>
      </div>
      <div className="flex justify-end gap-1 mt-1.5">
        <MiniBtn bg="#1a1e2c" onClick={onClose}>Cancel</MiniBtn>
        <MiniBtn bg="#052e16" onClick={submit}>Create Call</MiniBtn>
      </div>
    </div>
  );
}
