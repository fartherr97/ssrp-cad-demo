import { useState, useEffect } from 'react';
import { useCAD } from '../store/cadStore';
import { useResponsive } from '../hooks/useResponsive';
import StatusBadge from '../components/StatusBadge';

const MONO = 'Ubuntu Mono, monospace';

const PRIORITY_COLORS = { 1: '#e5484d', 2: '#f0883e', 3: '#f5b740', 4: '#46c971' };

// Statuses a dispatcher can set on any unit.
const UNIT_STATUSES = ['AVAILABLE', 'ENRT', 'ARRVD', 'BUSY', 'UNAVAILABLE', 'OFFDUTY'];

const UNIT_TONE = {
  AVAILABLE: '#46c971',
  ENRT: '#f5b740',
  ARRVD: '#c66cf0',
  ONSCENE: '#c66cf0',
  BUSY: '#f0883e',
  UNAVAILABLE: '#e5484d',
  OFFDUTY: '#6b7280',
};
const toneFor = (s) => UNIT_TONE[s] || '#46c971';

const LOG_TONE = {
  call: '#46c971',
  unit: '#4aa3ff',
  status: '#f5b740',
  alert: '#e5484d',
  info: '#93a6c4',
};

// A single ticking "now" shared by the header clock and every call's elapsed
// timer, so they stay in sync and only one interval runs.
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function fmtClock(ms) {
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// mm:ss for the first hour, then h:mm:ss.
function fmtElapsed(fromMs, nowMs) {
  if (!fromMs) return '--:--';
  const total = Math.max(0, Math.floor((nowMs - fromMs) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const p = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}

// Calls that have been waiting unassigned too long should glow red/amber.
function elapsedTone(fromMs, nowMs, hasUnits) {
  if (!fromMs) return '#5f779b';
  const mins = (nowMs - fromMs) / 60000;
  if (!hasUnits && mins >= 10) return '#e5484d';
  if (!hasUnits && mins >= 5) return '#f0883e';
  return '#7aa0cc';
}

const NATURES = [
  'Traffic Stop', 'Suspicious Person', 'Domestic Disturbance', 'MVA w/ Injuries',
  'Structure Fire', 'Medical Emergency', 'Armed Robbery', 'Noise Complaint',
  'Welfare Check', 'Foot Pursuit', 'Shots Fired', 'Other',
];

export default function DispatchConsole() {
  const { state, dispatch } = useCAD();
  const { calls, officers, currentUser, dispatchLog } = state;
  const { isMobile } = useResponsive();
  const now = useNow();
  const clock = fmtClock(now);

  const [selectedCallId, setSelectedCallId] = useState(null);
  const [radio, setRadio] = useState('');
  const [showNew, setShowNew] = useState(false);

  const activeCalls = calls.filter((c) => c.status !== 'CLOSED');
  const selectedCall = activeCalls.find((c) => c.id === selectedCallId) || null;
  const onDuty = officers.filter((o) => o.status !== 'OFFDUTY');
  const available = officers.filter((o) => o.status === 'AVAILABLE');
  const pending = activeCalls.filter((c) => c.units.length === 0).length;

  const sendRadio = () => {
    const msg = radio.trim();
    if (!msg) return;
    dispatch({ type: 'DISPATCH_RADIO', payload: msg });
    setRadio('');
  };

  const panelStyle = {
    background: 'linear-gradient(180deg, #1c1e23, #15161a)',
    border: '1px solid #2e3138',
    borderRadius: '6px',
    boxShadow: '0 6px 22px rgba(0,0,0,0.45)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  };

  return (
    <div style={{ padding: '12px 14px 24px', fontFamily: MONO }}>
      {/* ── Console header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '8px 14px',
          marginBottom: '12px',
          background: 'linear-gradient(180deg, #26282e, #161357X)',
          border: '1px solid #2e3138',
          borderRadius: '6px',
          boxShadow: '0 6px 22px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <span style={{ color: '#f5b740', fontWeight: 800, letterSpacing: '1px', fontSize: '14px' }}>
          ⬢ DISPATCH CONSOLE
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontWeight: 700, fontSize: '12px', color: '#46c971' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#46c971', boxShadow: '0 0 6px #46c971', animation: 'cadPulse 1.6s ease-in-out infinite' }} />
          ON AIR
        </span>
        <Divider />
        <span style={{ color: '#93a6c4', fontSize: '12px' }}>
          OPER: <span style={{ color: '#dce6f5' }}>{currentUser?.name || '—'}</span>
        </span>
        <Divider />
        <Stat label="CALLS" value={activeCalls.length} color="#f5b740" />
        <Stat label="UNASSIGNED" value={pending} color="#e5484d" />
        <Stat label="ON-DUTY" value={onDuty.length} color="#46c971" />
        <Stat label="AVAIL" value={available.length} color="#4aa3ff" />
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#dce6f5', fontWeight: 700, fontSize: '14px' }}>
          <span style={{ color: '#5f779b', fontSize: '11px', fontWeight: 400 }}>AOP</span>
          {clock}
        </span>
      </div>

      {/* ── Main 3-column grid: calls | units | log ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.15fr) minmax(0, 1fr) minmax(0, 0.95fr)',
          gap: '12px',
          alignItems: 'start',
        }}
      >
        {/* ===== CALLS QUEUE ===== */}
        <div style={{ ...panelStyle, maxHeight: isMobile ? 'none' : 'calc(100vh - 190px)' }}>
          <PanelHead title="CALL QUEUE" count={activeCalls.length}>
            <button onClick={() => setShowNew((v) => !v)} style={miniBtn(showNew ? '#1e4d90' : '#15356a')}>
              {showNew ? '× Cancel' : '+ New Call'}
            </button>
          </PanelHead>

          {showNew && <NewCallForm onClose={() => setShowNew(false)} dispatch={dispatch} />}

          <div className="table-scroll" style={{ overflowY: 'auto', flex: 1 }}>
            {activeCalls.length === 0 && <Empty>No active calls.</Empty>}
            {activeCalls.map((call) => {
              const sel = call.id === selectedCallId;
              return (
                <div
                  key={call.id}
                  onClick={() => setSelectedCallId(sel ? null : call.id)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderLeft: `4px solid ${PRIORITY_COLORS[call.priority] || '#33415a'}`,
                    borderBottom: '1px solid #23252b',
                    background: sel ? 'rgba(47,129,247,0.14)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        minWidth: '22px',
                        textAlign: 'center',
                        background: PRIORITY_COLORS[call.priority],
                        color: call.priority >= 3 ? '#1a1205' : '#fff',
                        borderRadius: '3px',
                        padding: '0 5px',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      P{call.priority}
                    </span>
                    <span style={{ color: '#46c971', fontWeight: 700, fontSize: '13px' }}>{call.id}</span>
                    <span style={{ color: '#dce6f5', fontWeight: 600, fontSize: '13px' }}>{call.nature}</span>
                    <span
                      className="tnum"
                      title="Time since call created"
                      style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px', color: elapsedTone(call.createdAt, now, call.units.length > 0), fontSize: '12px', fontWeight: 700 }}
                    >
                      ⏱ {fmtElapsed(call.createdAt, now)}
                    </span>
                    <StatusBadge status={call.status} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ color: '#93a6c4', fontSize: '12px' }}>{call.location}</span>
                    <span style={{ color: call.units.length ? '#4aa3ff' : '#e5484d', fontSize: '12px' }}>
                      {call.units.length ? call.units.join(', ') : 'UNASSIGNED'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected-call control footer */}
          {selectedCall && (
            <div style={{ borderTop: '1px solid #2e3138', padding: '10px 12px', background: '#131418' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#f5b740', fontWeight: 700, fontSize: '12px' }}>
                  CALL {selectedCall.id} • CONTROL
                  <span className="tnum" style={{ color: elapsedTone(selectedCall.createdAt, now, selectedCall.units.length > 0), marginLeft: '8px' }}>
                    ⏱ {fmtElapsed(selectedCall.createdAt, now)}
                  </span>
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => dispatch({ type: 'UPDATE_CALL', payload: { id: selectedCall.id, status: 'ACTIVE' } })}
                    style={miniBtn('#15356a')}
                  >
                    Set Active
                  </button>
                  <button
                    onClick={() => { dispatch({ type: 'CLOSE_CALL', payload: selectedCall.id }); setSelectedCallId(null); }}
                    style={miniBtn('#7f1d1d')}
                  >
                    Close Call
                  </button>
                </div>
              </div>
              <div style={{ color: '#93a6c4', fontSize: '12px', marginBottom: '6px' }}>{selectedCall.description}</div>
              <div style={{ color: '#5f779b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Attached Units
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedCall.units.length === 0 && <span style={{ color: '#5f779b', fontSize: '12px' }}>None — dispatch from the units panel →</span>}
                {selectedCall.units.map((u) => (
                  <span key={u} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#23252b', border: '1px solid #393c44', borderRadius: '4px', padding: '2px 6px', fontSize: '12px', color: '#4aa3ff' }}>
                    {u}
                    <button
                      onClick={() => dispatch({ type: 'DETACH_UNIT', payload: { callId: selectedCall.id, unitId: u } })}
                      title="Clear unit"
                      style={{ background: 'none', border: 'none', color: '#e5848a', cursor: 'pointer', fontSize: '13px', padding: 0, lineHeight: 1 }}
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
        <div style={{ ...panelStyle, maxHeight: isMobile ? 'none' : 'calc(100vh - 190px)' }}>
          <PanelHead title="UNITS" count={onDuty.length} />
          <div className="table-scroll" style={{ overflowY: 'auto', flex: 1 }}>
            {officers.map((o) => {
              const tone = toneFor(o.status);
              return (
                <div key={o.id} style={{ padding: '8px 12px', borderBottom: '1px solid #23252b', borderLeft: `3px solid ${tone}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="tnum" style={{ color: '#4aa3ff', fontWeight: 700, fontSize: '13px' }}>{o.unitId}</span>
                    <span style={{ color: tone, fontWeight: 600, fontSize: '13px' }}>{o.name}</span>
                    <span style={{ color: '#5f779b', fontSize: '11px' }}>{o.deptShort}</span>
                    <span style={{ marginLeft: 'auto' }}>
                      <StatusBadge status={o.status} />
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {o.callId ? (
                      <span style={{ color: '#f5b740', fontSize: '11px' }}>▸ {o.callId}</span>
                    ) : (
                      <span style={{ color: '#5f779b', fontSize: '11px' }}>▸ unassigned</span>
                    )}
                    {/* Status selector */}
                    <select
                      value={UNIT_STATUSES.includes(o.status) ? o.status : ''}
                      onChange={(e) => dispatch({ type: 'SET_UNIT_STATUS', payload: { unitId: o.unitId, status: e.target.value } })}
                      style={{
                        marginLeft: 'auto',
                        background: '#0b0c0f',
                        border: '1px solid #393c44',
                        borderRadius: '4px',
                        color: '#dce6f5',
                        fontSize: '11px',
                        fontFamily: MONO,
                        padding: '2px 4px',
                      }}
                    >
                      {!UNIT_STATUSES.includes(o.status) && <option value="">{o.status}</option>}
                      {UNIT_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {/* One-click dispatch to selected call */}
                    <button
                      disabled={!selectedCall || selectedCall.units.includes(o.unitId)}
                      onClick={() => dispatch({ type: 'ASSIGN_UNIT', payload: { callId: selectedCall.id, unitId: o.unitId } })}
                      title={selectedCall ? `Dispatch to ${selectedCall.id}` : 'Select a call first'}
                      style={{
                        ...miniBtn('#15603a'),
                        opacity: !selectedCall || selectedCall.units.includes(o.unitId) ? 0.4 : 1,
                      }}
                    >
                      ▸ Dispatch
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== DISPATCH LOG ===== */}
        <div style={{ ...panelStyle, maxHeight: isMobile ? '420px' : 'calc(100vh - 190px)' }}>
          <PanelHead title="TX LOG" count={dispatchLog.length} />
          <div className="terminal table-scroll" style={{ overflowY: 'auto', flex: 1, padding: '8px 10px', background: '#0b0c0f' }}>
            {dispatchLog.map((e) => (
              <div key={e.id} style={{ display: 'flex', gap: '8px', padding: '2px 0', fontSize: '12px', lineHeight: 1.5 }}>
                <span style={{ color: '#3f5878', flexShrink: 0 }}>{e.time}</span>
                <span style={{ color: LOG_TONE[e.kind] || '#93a6c4' }}>{e.text}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #2e3138', padding: '8px 10px', display: 'flex', gap: '6px', background: '#131418' }}>
            <span style={{ color: '#46c971', alignSelf: 'center', fontWeight: 700 }}>›</span>
            <input
              value={radio}
              onChange={(e) => setRadio(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendRadio(); }}
              placeholder="Broadcast radio traffic…"
              style={{
                flex: 1,
                background: '#0b0c0f',
                border: '1px solid #393c44',
                borderRadius: '4px',
                color: '#dce6f5',
                fontFamily: MONO,
                fontSize: '12px',
                padding: '5px 8px',
              }}
            />
            <button onClick={sendRadio} style={miniBtn('#1e4d90')}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Small building blocks ── */

function Divider() {
  return <span style={{ width: '1px', height: '14px', background: '#33363d' }} />;
}

function Stat({ label, value, color }) {
  return (
    <span style={{ color: '#93a6c4', fontSize: '12px' }}>
      {label} <span style={{ color, fontWeight: 700 }}>{value}</span>
    </span>
  );
}

function PanelHead({ title, count, children }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        background: 'linear-gradient(180deg, #26282e, #1c1e23)',
        borderBottom: '1px solid #2e3138',
        borderRadius: '6px 6px 0 0',
      }}
    >
      <span style={{ color: '#f5b740', fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px' }}>{title}</span>
      <span style={{ background: 'rgba(0,0,0,0.35)', color: '#4aa3ff', border: '1px solid rgba(21,38,66,0.5)', borderRadius: '9px', padding: '1px 8px', fontSize: '11px', fontWeight: 700 }}>
        {count}
      </span>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>{children}</div>
    </div>
  );
}

function Empty({ children }) {
  return <div style={{ padding: '18px', textAlign: 'center', color: '#5f779b', fontSize: '13px' }}>{children}</div>;
}

function miniBtn(bg) {
  return {
    background: bg,
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    padding: '3px 9px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: MONO,
    whiteSpace: 'nowrap',
  };
}

function NewCallForm({ onClose, dispatch }) {
  const [form, setForm] = useState({
    nature: 'Traffic Stop',
    priority: 2,
    location: '',
    city: 'Tampa',
    county: 'Hillsborough County',
    reportingParty: 'Dispatch',
    description: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.location.trim()) return;
    dispatch({ type: 'CREATE_CALL', payload: { ...form, priority: Number(form.priority), status: 'PENDING' } });
    onClose();
  };

  const field = {
    width: '100%',
    background: '#0b0c0f',
    border: '1px solid #393c44',
    borderRadius: '4px',
    color: '#dce6f5',
    fontFamily: MONO,
    fontSize: '12px',
    padding: '5px 7px',
  };
  const lbl = { color: '#5f779b', fontSize: '10px', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: '3px' };

  return (
    <div style={{ padding: '10px 12px', borderBottom: '1px solid #2e3138', background: '#131418' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <label>
          <span style={lbl}>Nature</span>
          <select value={form.nature} onChange={(e) => set('nature', e.target.value)} style={field}>
            {NATURES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label>
          <span style={lbl}>Priority</span>
          <select value={form.priority} onChange={(e) => set('priority', e.target.value)} style={field}>
            <option value={1}>P1 — Emergency</option>
            <option value={2}>P2 — Urgent</option>
            <option value={3}>P3 — Routine</option>
            <option value={4}>P4 — Non-urgent</option>
          </select>
        </label>
        <label style={{ gridColumn: '1 / -1' }}>
          <span style={lbl}>Location</span>
          <input value={form.location} onChange={(e) => set('location', e.target.value)} style={field} placeholder="e.g. 412 Oakwood Ave" />
        </label>
        <label>
          <span style={lbl}>City</span>
          <input value={form.city} onChange={(e) => set('city', e.target.value)} style={field} />
        </label>
        <label>
          <span style={lbl}>Reporting Party</span>
          <input value={form.reportingParty} onChange={(e) => set('reportingParty', e.target.value)} style={field} />
        </label>
        <label style={{ gridColumn: '1 / -1' }}>
          <span style={lbl}>Description</span>
          <input value={form.description} onChange={(e) => set('description', e.target.value)} style={field} placeholder="Brief details…" />
        </label>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
        <button onClick={onClose} style={miniBtn('#33415a')}>Cancel</button>
        <button onClick={submit} style={miniBtn('#15603a')}>Create Call</button>
      </div>
    </div>
  );
}
