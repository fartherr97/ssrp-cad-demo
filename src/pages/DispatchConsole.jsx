import { useState, useEffect } from 'react';
import { useCAD } from '../store/cadStore';
import { useResponsive } from '../hooks/useResponsive';
import StatusBadge from '../components/StatusBadge';

const MONO = "'Ubuntu', sans-serif";
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
    <div style={{ height: `calc(100vh - ${isMobile ? 42 : 70}px)`, display: 'flex', flexDirection: 'column', fontFamily: MONO, background: '#080b12', overflow: 'hidden' }}>

      {/* ── Header strip ── */}
      <div style={{
        background: '#0d1117',
        borderBottom: '1px solid #141720',
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
          <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '11px', letterSpacing: '1px' }}>DISPATCH CONSOLE</span>
        </div>
        <Pipe />
        <span style={{ color: '#374151', fontSize: '11px' }}>OPER: <span style={{ color: '#9ca3af' }}>{currentUser?.name || '—'}</span></span>
        <Pipe />
        <StatChip label="CALLS"       value={activeCalls.length} color="#fbbf24" />
        <StatChip label="UNASSIGNED"  value={pending}            color={pending > 0 ? '#f87171' : '#374151'} />
        <StatChip label="ON-DUTY"     value={onDuty.length}      color="#4ade80" />
        <StatChip label="AVAIL"       value={available.length}   color="#93c5fd" />
        <div style={{ marginLeft: 'auto', color: '#1d4ed8', fontWeight: 700, fontSize: '13px', letterSpacing: '0.5px' }}>{clock}</div>
      </div>

      {/* Mobile tab bar */}
      {isMobile && (
        <div style={{ display: 'flex', borderBottom: '1px solid #141720', background: '#0d1117', flexShrink: 0 }}>
          {[['calls', 'CALLS'], ['units', 'UNITS'], ['log', 'TX LOG']].map(([v, l]) => (
            <button key={v} onClick={() => setMobileTab(v)} style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: mobileTab === v ? '2px solid #fbbf24' : '2px solid transparent', color: mobileTab === v ? '#fbbf24' : '#4b5563', padding: '8px 4px', fontSize: '11px', fontWeight: mobileTab === v ? 700 : 500, letterSpacing: '0.5px', cursor: 'pointer', fontFamily: MONO }}>
              {l}
            </button>
          ))}
        </div>
      )}

      {/* ── 3-column workspace ── */}
      <div style={{
        flex: 1,
        display: isMobile ? 'flex' : 'grid',
        ...(isMobile ? { flexDirection: 'column' } : { gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr) minmax(0,0.9fr)' }),
        gap: '0',
        minHeight: 0,
        overflow: 'hidden',
      }}>

        {/* ===== CALL QUEUE ===== */}
        <div style={{ display: !isMobile || mobileTab === 'calls' ? 'flex' : 'none', flexDirection: 'column', borderRight: '1px solid #141720', minHeight: 0, overflow: 'hidden' }}>
          <ColHead title="CALL QUEUE" count={activeCalls.length}>
            <HdrBtn active={showNew} onClick={() => setShowNew(v => !v)}>
              {showNew ? 'Cancel' : '+ New Call'}
            </HdrBtn>
          </ColHead>
          {showNew && <NewCallForm onClose={() => setShowNew(false)} dispatch={dispatch} />}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {activeCalls.length === 0 && <Empty>No active calls.</Empty>}
            {activeCalls.map(call => {
              const sel = call.id === selectedCallId;
              return (
                <div
                  key={call.id}
                  onClick={() => setSelectedCallId(sel ? null : call.id)}
                  style={{
                    padding: '8px 10px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #141720',
                    borderLeft: `3px solid ${PR[call.priority] || '#1a1e2c'}`,
                    background: sel ? '#0f172a' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = '#0d1117'; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#0d1117', color: PR[call.priority], border: `1px solid ${PR[call.priority]}44`,
                      borderRadius: '2px', padding: '0 4px', fontSize: '10px', fontWeight: 700,
                    }}>P{call.priority}</span>
                    <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '12px' }}>{call.id}</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '12px', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{call.nature}</span>
                    <span style={{ color: elapsedColor(call.createdAt, now, call.units.length > 0), fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                      {fmtElapsed(call.createdAt, now)}
                    </span>
                    <StatusBadge status={call.status} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ color: '#6b7280', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{call.location}</span>
                    <span style={{ color: call.units.length ? '#93c5fd' : '#dc2626', fontSize: '11px', flexShrink: 0, marginLeft: '6px' }}>
                      {call.units.length ? call.units.join(', ') : 'UNASSIGNED'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected call control */}
          {selectedCall && (
            <div style={{ borderTop: '1px solid #141720', padding: '8px 10px', background: '#0d1117', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 700 }}>
                  CALL {selectedCall.id}
                  <span style={{ color: elapsedColor(selectedCall.createdAt, now, selectedCall.units.length > 0), marginLeft: '6px' }}>
                    {fmtElapsed(selectedCall.createdAt, now)}
                  </span>
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <MiniBtn bg="#0f2451" onClick={() => dispatch({ type: 'UPDATE_CALL', payload: { id: selectedCall.id, status: 'ACTIVE' } })}>
                    Set Active
                  </MiniBtn>
                  <MiniBtn bg="#450a0a" onClick={() => { dispatch({ type: 'CLOSE_CALL', payload: selectedCall.id }); setSelectedCallId(null); }}>
                    Close
                  </MiniBtn>
                </div>
              </div>
              <div style={{ color: '#4b5563', fontSize: '11px', marginBottom: '5px' }}>{selectedCall.description}</div>
              <div style={{ color: '#374151', fontSize: '10px', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Attached Units</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {selectedCall.units.length === 0 && <span style={{ color: '#374151', fontSize: '11px' }}>None — dispatch from units panel</span>}
                {selectedCall.units.map(u => (
                  <span key={u} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#0f172a', border: '1px solid #1a1e2c', borderRadius: '2px', padding: '1px 6px', fontSize: '11px', color: '#93c5fd' }}>
                    {u}
                    <button
                      onClick={() => dispatch({ type: 'DETACH_UNIT', payload: { callId: selectedCall.id, unitId: u } })}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '12px', padding: 0, lineHeight: 1 }}
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
        <div style={{ display: !isMobile || mobileTab === 'units' ? 'flex' : 'none', flexDirection: 'column', borderRight: '1px solid #141720', minHeight: 0, overflow: 'hidden' }}>
          <ColHead title="UNITS" count={onDuty.length} />
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {officers.map(o => (
              <div key={o.id} style={{ padding: '7px 10px', borderBottom: '1px solid #141720', borderLeft: `3px solid ${uc(o.status)}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#93c5fd', fontWeight: 700, fontSize: '12px' }}>{o.unitId}</span>
                  <span style={{ color: uc(o.status), fontWeight: 600, fontSize: '12px', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.name}</span>
                  <span style={{ color: '#374151', fontSize: '10px', flexShrink: 0 }}>{o.deptShort}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                  <span style={{ color: o.callId ? '#fbbf24' : '#374151', fontSize: '10px', flex: 1, minWidth: 0 }}>
                    {o.callId ? `On Call: ${o.callId}` : 'Unassigned'}
                  </span>
                  <select
                    value={UNIT_STATUSES.includes(o.status) ? o.status : ''}
                    onChange={e => dispatch({ type: 'SET_UNIT_STATUS', payload: { unitId: o.unitId, status: e.target.value } })}
                    style={{ background: '#06070c', border: '1px solid #1a1e2c', borderRadius: '2px', color: '#9ca3af', fontSize: '10px', padding: '1px 4px', fontFamily: MONO }}
                  >
                    {!UNIT_STATUSES.includes(o.status) && <option value="">{o.status}</option>}
                    {UNIT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    disabled={!selectedCall || selectedCall.units.includes(o.unitId)}
                    onClick={() => dispatch({ type: 'ASSIGN_UNIT', payload: { callId: selectedCall.id, unitId: o.unitId } })}
                    style={{
                      background: '#0f2451', border: '1px solid #1d4ed8', borderRadius: '2px',
                      color: '#93c5fd', padding: '1px 7px', fontSize: '10px', fontWeight: 600, cursor: 'pointer',
                      opacity: !selectedCall || selectedCall.units.includes(o.unitId) ? 0.35 : 1,
                      fontFamily: MONO,
                    }}
                  >
                    Dispatch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== TX LOG ===== */}
        <div style={{ display: !isMobile || mobileTab === 'log' ? 'flex' : 'none', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <ColHead title="TX LOG" count={dispatchLog.length} />
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', background: '#06070c' }}>
            {dispatchLog.length === 0 && <Empty>No radio traffic.</Empty>}
            {dispatchLog.map(e => (
              <div key={e.id} style={{ display: 'flex', gap: '6px', padding: '2px 0', fontSize: '11px', lineHeight: 1.5 }}>
                <span style={{ color: '#1f2937', flexShrink: 0 }}>{e.time}</span>
                <span style={{ color: LOG_COLOR[e.kind] || '#374151', fontWeight: 700, fontSize: '10px', flexShrink: 0, minWidth: '38px' }}>
                  [{LOG_TAG[e.kind] || 'INFO'}]
                </span>
                <span style={{ color: e.kind === 'alert' ? '#fca5a5' : '#6b7280' }}>{e.text}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #141720', padding: '6px 8px', display: 'flex', gap: '6px', background: '#0d1117', flexShrink: 0 }}>
            <span style={{ color: '#4ade80', alignSelf: 'center', fontWeight: 700, flexShrink: 0 }}>›</span>
            <input
              value={radio}
              onChange={e => setRadio(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendRadio(); }}
              placeholder="Broadcast radio traffic…"
              style={{ flex: 1, background: '#06070c', border: '1px solid #1a1e2c', borderRadius: '2px', color: '#d1d5db', fontFamily: MONO, fontSize: '12px', padding: '4px 7px' }}
            />
            <button onClick={sendRadio} style={{ background: '#0f2451', border: '1px solid #1d4ed8', borderRadius: '2px', color: '#93c5fd', padding: '4px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: MONO }}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helper components ── */

function Pipe() { return <span style={{ width: '1px', height: '12px', background: '#1a1e2c', flexShrink: 0 }} />; }

function StatChip({ label, value, color }) {
  return (
    <span style={{ fontSize: '11px', color: '#374151' }}>
      {label} <span style={{ color, fontWeight: 700 }}>{value}</span>
    </span>
  );
}

function ColHead({ title, count, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px',
      background: '#0d1117', borderBottom: '1px solid #141720', flexShrink: 0,
    }}>
      <span style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px' }}>{title}</span>
      <span style={{ background: 'rgba(0,0,0,0.4)', color: '#93c5fd', border: '1px solid #1d4ed844', borderRadius: '10px', padding: '0 6px', fontSize: '10px', fontWeight: 700 }}>{count}</span>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>{children}</div>
    </div>
  );
}

function HdrBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{ background: active ? '#450a0a' : '#0f172a', border: `1px solid ${active ? '#dc2626' : '#1a1e2c'}`, borderRadius: '2px', color: active ? '#f87171' : '#6b7280', padding: '2px 8px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: MONO }}
    >
      {children}
    </button>
  );
}

function MiniBtn({ bg, onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: bg, border: 'none', borderRadius: '2px', color: '#d1d5db', padding: '2px 8px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: MONO, whiteSpace: 'nowrap' }}>
      {children}
    </button>
  );
}

function Empty({ children }) {
  return <div style={{ padding: '14px', textAlign: 'center', color: '#1f2937', fontSize: '12px' }}>{children}</div>;
}

function NewCallForm({ onClose, dispatch }) {
  const [form, setForm] = useState({ nature: 'Traffic Stop', priority: 2, location: '', city: 'Tampa', county: 'Hillsborough County', reportingParty: 'Dispatch', description: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.location.trim()) return;
    dispatch({ type: 'CREATE_CALL', payload: { ...form, priority: Number(form.priority), status: 'PENDING', category: 'police' } });
    onClose();
  };

  const inp = {
    width: '100%', background: '#06070c', border: '1px solid #1a1e2c', borderRadius: '2px',
    color: '#d1d5db', fontFamily: MONO, fontSize: '11px', padding: '4px 6px',
  };
  const lbl = { color: '#374151', fontSize: '9px', letterSpacing: '0.7px', textTransform: 'uppercase', display: 'block', marginBottom: '3px' };

  return (
    <div style={{ padding: '8px 10px', borderBottom: '1px solid #141720', background: '#0d1117', flexShrink: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        <label><span style={lbl}>Nature</span>
          <select value={form.nature} onChange={e => set('nature', e.target.value)} style={inp}>
            {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label><span style={lbl}>Priority</span>
          <select value={form.priority} onChange={e => set('priority', e.target.value)} style={inp}>
            <option value={1}>P1 — Emergency</option><option value={2}>P2 — Urgent</option>
            <option value={3}>P3 — Routine</option><option value={4}>P4 — Non-urgent</option>
          </select>
        </label>
        <label style={{ gridColumn: '1 / -1' }}><span style={lbl}>Location *</span>
          <input value={form.location} onChange={e => set('location', e.target.value)} style={inp} placeholder="e.g. 412 Oakwood Ave, Tampa" />
        </label>
        <label><span style={lbl}>City</span>
          <input value={form.city} onChange={e => set('city', e.target.value)} style={inp} />
        </label>
        <label><span style={lbl}>Reporting Party</span>
          <input value={form.reportingParty} onChange={e => set('reportingParty', e.target.value)} style={inp} />
        </label>
        <label style={{ gridColumn: '1 / -1' }}><span style={lbl}>Description</span>
          <input value={form.description} onChange={e => set('description', e.target.value)} style={inp} placeholder="Brief details..." />
        </label>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', marginTop: '6px' }}>
        <MiniBtn bg="#1a1e2c" onClick={onClose}>Cancel</MiniBtn>
        <MiniBtn bg="#052e16" onClick={submit}>Create Call</MiniBtn>
      </div>
    </div>
  );
}
