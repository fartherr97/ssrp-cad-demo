import { useState, useEffect } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';

const MONO = 'Ubuntu Mono, monospace';

const PRIORITY_COLORS = { 1: '#e5484d', 2: '#f0883e', 3: '#f5b740', 4: '#46c971' };

// Maps a unit status to a row "tone" used to color-code the roster the way a
// real CAD does: available=green, en route=gold, on-scene=purple, busy=orange,
// unavailable=red, off-duty=gray.
const UNIT_TONE = {
  AVAILABLE: { text: '#46c971', bar: '#46c971', tint: 'rgba(70, 201, 113, 0.06)' },
  ENRT: { text: '#f5b740', bar: '#f5b740', tint: 'rgba(245, 183, 64, 0.07)' },
  ARRVD: { text: '#c66cf0', bar: '#c66cf0', tint: 'rgba(198, 108, 240, 0.07)' },
  ONSCENE: { text: '#c66cf0', bar: '#c66cf0', tint: 'rgba(198, 108, 240, 0.07)' },
  BUSY: { text: '#f0883e', bar: '#f0883e', tint: 'rgba(240, 136, 62, 0.06)' },
  UNAVAILABLE: { text: '#e5484d', bar: '#e5484d', tint: 'rgba(229, 72, 77, 0.06)' },
  OFFDUTY: { text: '#6b7280', bar: '#33415a', tint: 'transparent' },
};
const toneFor = (status) => UNIT_TONE[status] || UNIT_TONE.AVAILABLE;

function useClock() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const d = new Date(now);
  const p = (n) => String(n).padStart(2, '0');
  return { clock: `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`, now };
}

// mm:ss for the first hour, then h:mm:ss, since the call was created.
function fmtElapsed(fromMs, nowMs) {
  if (!fromMs) return '--:--';
  const total = Math.max(0, Math.floor((nowMs - fromMs) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const p = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}

// Unassigned calls escalate amber (5m) then red (10m) so officers can triage.
function elapsedTone(fromMs, nowMs, hasUnits) {
  if (!fromMs) return '#5f779b';
  const mins = (nowMs - fromMs) / 60000;
  if (!hasUnits && mins >= 10) return '#e5484d';
  if (!hasUnits && mins >= 5) return '#f0883e';
  return '#7aa0cc';
}

export default function DispatchBoard() {
  const { state, dispatch } = useCAD();
  const { calls, officers, currentUser, myCallId } = state;
  const [selectedCall, setSelectedCall] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { clock, now } = useClock();

  const activeCalls = calls.filter((c) => c.status !== 'CLOSED');
  const filteredCalls =
    statusFilter === 'ALL' ? activeCalls : activeCalls.filter((c) => c.status === statusFilter);
  const myOfficer = officers.find((o) => o.id === currentUser?.id);
  const onDuty = officers.filter((o) => o.status !== 'OFFDUTY');
  const availableCount = officers.filter((o) => o.status === 'AVAILABLE').length;

  const handleAssignSelf = (callId) => {
    if (!currentUser) return;
    const unitId = myOfficer?.unitId;
    dispatch({ type: 'ASSIGN_UNIT', payload: { callId, unitId } });
    dispatch({ type: 'SET_MY_CALL', payload: callId });
    dispatch({ type: 'SET_STATUS', payload: 'ENRT' });
  };

  const handleClose = (callId) => {
    dispatch({ type: 'CLOSE_CALL', payload: callId });
    if (myCallId === callId) {
      dispatch({ type: 'SET_MY_CALL', payload: null });
      dispatch({ type: 'SET_STATUS', payload: 'AVAILABLE' });
    }
  };

  return (
    <div style={{ padding: '12px 14px 28px', fontFamily: MONO }}>
      {/* ── Dispatch status bar (ImperialCAD-style) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '8px 14px',
          marginBottom: '14px',
          background: 'linear-gradient(180deg, #26282e, #15161a)',
          border: '1px solid #2e3138',
          borderRadius: '6px',
          boxShadow: '0 6px 22px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontWeight: 700, fontSize: '12px', letterSpacing: '0.5px', color: '#46c971' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#46c971', boxShadow: '0 0 6px #46c971', animation: 'cadPulse 1.6s ease-in-out infinite' }} />
          CONNECTED
        </span>
        <Divider />
        <span style={{ color: '#93a6c4', fontSize: '12px' }}>
          DISPATCH: <span style={{ color: '#dce6f5' }}>{currentUser?.name || '—'}</span>
        </span>
        <Divider />
        <span style={{ color: '#93a6c4', fontSize: '12px' }}>
          CALLS <span style={{ color: '#f5b740', fontWeight: 700 }}>{activeCalls.length}</span>
        </span>
        <span style={{ color: '#93a6c4', fontSize: '12px' }}>
          ON-DUTY <span style={{ color: '#46c971', fontWeight: 700 }}>{onDuty.length}</span>
        </span>
        <span style={{ color: '#93a6c4', fontSize: '12px' }}>
          AVAIL <span style={{ color: '#4aa3ff', fontWeight: 700 }}>{availableCount}</span>
        </span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#dce6f5', fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px' }}>
          <span style={{ color: '#5f779b', fontSize: '11px', fontWeight: 400 }}>AOP</span>
          {clock}
        </span>
      </div>

      {/* ── Controls row ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ color: '#93a6c4', fontSize: '13px', marginRight: '2px', letterSpacing: '0.5px' }}>MY STATUS:</span>
        {['AVAILABLE', 'BUSY', 'UNAVAILABLE', 'OFFDUTY'].map((s) => {
          const active = myOfficer?.status === s;
          const tone = toneFor(s);
          return (
            <button
              key={s}
              onClick={() => dispatch({ type: 'SET_STATUS', payload: s })}
              style={{
                background: active ? 'rgba(47,129,247,0.16)' : '#15161a',
                border: `1px solid ${active ? tone.bar : '#2e3138'}`,
                borderRadius: '4px',
                color: active ? tone.text : '#93a6c4',
                padding: '5px 13px',
                fontSize: '13px',
                fontFamily: MONO,
                fontWeight: 600,
                letterSpacing: '0.4px',
              }}
            >
              {s}
            </button>
          );
        })}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
          {['ALL', 'ACTIVE', 'PENDING', 'ENRT'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                background: statusFilter === f ? 'rgba(47,129,247,0.16)' : '#15161a',
                border: `1px solid ${statusFilter === f ? '#2f81f7' : '#2e3138'}`,
                borderRadius: '4px',
                color: statusFilter === f ? '#4aa3ff' : '#5f779b',
                padding: '5px 11px',
                fontSize: '13px',
                fontFamily: MONO,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Active Calls ── */}
      <SectionHeader title="ACTIVE CALLS" count={filteredCalls.length} />
      <div className="table-scroll" style={{ marginBottom: '24px', border: '1px solid #2e3138', borderRadius: '0 0 6px 6px', borderTop: 'none' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {['Call #', 'Nature', 'Location', 'City', 'County', 'Pr', 'Status', 'Units', 'Elapsed', 'Time', 'Actions'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '7px 10px',
                    textAlign: h === 'Pr' ? 'center' : 'left',
                    color: '#93a6c4',
                    fontSize: '11px',
                    letterSpacing: '0.6px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    background: 'linear-gradient(180deg, #26282e, #1c1e23)',
                    borderBottom: '2px solid #0b0c0f',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCalls.map((call, idx) => {
              const sel = selectedCall?.id === call.id;
              return (
                <tr
                  key={call.id}
                  onClick={() => setSelectedCall(sel ? null : call)}
                  style={{
                    background: sel ? 'rgba(47,129,247,0.14)' : idx % 2 === 0 ? '#111216' : '#131418',
                    cursor: 'pointer',
                    borderLeft: `3px solid ${PRIORITY_COLORS[call.priority] || '#33415a'}`,
                  }}
                >
                  <td style={{ padding: '6px 10px', color: '#46c971', fontWeight: 700 }}>{call.id}</td>
                  <td style={{ padding: '6px 10px', color: '#dce6f5', fontWeight: 600 }}>{call.nature}</td>
                  <td style={{ padding: '6px 10px', color: '#93a6c4' }}>{call.location}</td>
                  <td style={{ padding: '6px 10px', color: '#93a6c4' }}>{call.city}</td>
                  <td style={{ padding: '6px 10px', color: '#5f779b' }}>{call.county}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        minWidth: '22px',
                        background: PRIORITY_COLORS[call.priority],
                        color: call.priority >= 3 ? '#1a1205' : '#fff',
                        borderRadius: '3px',
                        padding: '1px 6px',
                        fontSize: '12px',
                        fontWeight: 800,
                      }}
                    >
                      P{call.priority}
                    </span>
                  </td>
                  <td style={{ padding: '6px 10px' }}>
                    <StatusBadge status={call.status} />
                  </td>
                  <td style={{ padding: '6px 10px', color: '#4aa3ff' }}>{call.units.join(', ') || '—'}</td>
                  <td className="tnum" style={{ padding: '6px 10px', fontSize: '12px', fontWeight: 700, color: elapsedTone(call.createdAt, now, call.units.length > 0), whiteSpace: 'nowrap' }}>
                    ⏱ {fmtElapsed(call.createdAt, now)}
                  </td>
                  <td className="tnum" style={{ padding: '6px 10px', color: '#5f779b', fontSize: '12px' }}>
                    {call.timestamp?.split(' ')[1]}
                  </td>
                  <td style={{ padding: '6px 10px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <ActionBtn label="Assign" color="#1e4080" onClick={(e) => { e.stopPropagation(); handleAssignSelf(call.id); }} />
                      <ActionBtn label="Close" color="#7f1d1d" onClick={(e) => { e.stopPropagation(); handleClose(call.id); }} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredCalls.length === 0 && (
              <tr>
                <td colSpan={11} style={{ padding: '18px', textAlign: 'center', color: '#5f779b' }}>
                  No calls match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Call Detail ── */}
      {selectedCall && (
        <div
          style={{
            background: 'linear-gradient(180deg, #1c1e23, #15161a)',
            border: '1px solid #2e3138',
            borderLeft: `4px solid ${PRIORITY_COLORS[selectedCall.priority] || '#33415a'}`,
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '24px',
            boxShadow: '0 6px 22px rgba(0,0,0,0.45)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#f5b740', fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px' }}>
              CALL DETAIL • {selectedCall.id}
            </span>
            <button onClick={() => setSelectedCall(null)} style={{ background: 'none', border: 'none', color: '#5f779b', cursor: 'pointer', fontSize: '16px' }}>
              ✕
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px', fontSize: '13px' }}>
            {[
              ['Nature', selectedCall.nature],
              ['Location', selectedCall.location],
              ['City', selectedCall.city],
              ['County', selectedCall.county],
              ['Priority', `P${selectedCall.priority}`],
              ['Status', selectedCall.status],
              ['Reporting Party', selectedCall.reportingParty],
              ['Timestamp', selectedCall.timestamp],
              ['Units Assigned', selectedCall.units.join(', ') || 'None'],
            ].map(([k, v]) => (
              <div key={k}>
                <span style={{ color: '#5f779b', fontSize: '11px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>{k}: </span>
                <span style={{ color: '#dce6f5' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #2e3138' }}>
            <span style={{ color: '#5f779b', fontSize: '11px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>Description: </span>
            <span style={{ color: '#93a6c4', fontSize: '13px' }}>{selectedCall.description}</span>
          </div>
        </div>
      )}

      {/* ── Units Roster ── */}
      <SectionHeader title="UNITS ROSTER" count={onDuty.length} />
      <div className="table-scroll" style={{ border: '1px solid #2e3138', borderRadius: '0 0 6px 6px', borderTop: 'none' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {['Officer', 'Unit #', 'Status', 'Call #', 'Agency', 'Subdivision', 'Location'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '7px 10px',
                    textAlign: 'left',
                    color: '#93a6c4',
                    fontSize: '11px',
                    letterSpacing: '0.6px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    background: 'linear-gradient(180deg, #26282e, #1c1e23)',
                    borderBottom: '2px solid #0b0c0f',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {officers.map((o, idx) => {
              const tone = toneFor(o.status);
              const isMe = o.id === currentUser?.id;
              return (
                <tr
                  key={o.id}
                  style={{
                    background: tone.tint !== 'transparent' ? tone.tint : idx % 2 === 0 ? '#111216' : '#131418',
                    borderLeft: `3px solid ${tone.bar}`,
                  }}
                >
                  <td style={{ padding: '6px 10px', color: tone.text, fontWeight: isMe ? 800 : 600 }}>
                    {isMe ? '▶ ' : ''}
                    {o.name}
                  </td>
                  <td className="tnum" style={{ padding: '6px 10px', color: '#4aa3ff' }}>{o.unitId}</td>
                  <td style={{ padding: '6px 10px' }}>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="tnum" style={{ padding: '6px 10px', color: o.callId ? '#f5b740' : '#33415a' }}>{o.callId || '—'}</td>
                  <td style={{ padding: '6px 10px', color: '#93a6c4' }}>{o.deptShort}</td>
                  <td style={{ padding: '6px 10px', color: '#93a6c4' }}>{o.subdivision}</td>
                  <td style={{ padding: '6px 10px', color: '#5f779b' }}>{o.location}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Divider() {
  return <span style={{ width: '1px', height: '14px', background: '#33363d' }} />;
}

function SectionHeader({ title, count }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 12px',
        background: 'linear-gradient(180deg, #26282e, #1c1e23)',
        border: '1px solid #2e3138',
        borderRadius: '6px 6px 0 0',
      }}
    >
      <span style={{ color: '#f5b740', fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px' }}>{title}</span>
      <span style={{ background: 'rgba(0,0,0,0.35)', color: '#4aa3ff', border: '1px solid rgba(21,38,66,0.5)', borderRadius: '9px', padding: '1px 8px', fontSize: '11px', fontWeight: 700 }}>
        {count}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'rgba(29,55,95,0.6)' }} />
    </div>
  );
}

function ActionBtn({ label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: color,
        border: 'none',
        borderRadius: '3px',
        color: '#fff',
        padding: '3px 9px',
        fontSize: '12px',
        cursor: 'pointer',
        fontFamily: MONO,
        fontWeight: 600,
      }}
    >
      {label}
    </button>
  );
}
