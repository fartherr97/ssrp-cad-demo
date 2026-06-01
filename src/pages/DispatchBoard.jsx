import { useState, useEffect } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';

const MONO = "'Ubuntu', sans-serif";

const PR_COLOR = { 1: '#dc2626', 2: '#ea580c', 3: '#ca8a04', 4: '#16a34a' };
const PR_BG    = { 1: '#450a0a', 2: '#431407', 3: '#422006', 4: '#052e16' };

const UNIT_TONE = {
  AVAILABLE:   { text: '#4ade80',  bar: '#16a34a',  bg: 'rgba(22,163,74,0.04)' },
  ENRT:        { text: '#fbbf24',  bar: '#d97706',  bg: 'rgba(217,119,6,0.05)' },
  ARRVD:       { text: '#c084fc',  bar: '#9333ea',  bg: 'rgba(147,51,234,0.05)' },
  ONSCENE:     { text: '#c084fc',  bar: '#9333ea',  bg: 'rgba(147,51,234,0.05)' },
  BUSY:        { text: '#fb923c',  bar: '#ea580c',  bg: 'rgba(234,88,12,0.05)' },
  UNAVAILABLE: { text: '#f87171',  bar: '#dc2626',  bg: 'rgba(220,38,38,0.05)' },
  OFFDUTY:     { text: '#374151',  bar: '#1f2937',  bg: 'transparent' },
};
const tone = s => UNIT_TONE[s] || UNIT_TONE.AVAILABLE;

function useTick() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const d = new Date(now);
  const p = n => String(n).padStart(2, '0');
  return { now, clock: `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}` };
}

function elapsed(fromMs, nowMs) {
  if (!fromMs) return '--:--';
  const s = Math.max(0, Math.floor((nowMs - fromMs) / 1000));
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

const STATUSES = ['AVAILABLE', 'BUSY', 'UNAVAILABLE', 'OFFDUTY'];

export default function DispatchBoard() {
  const { state, dispatch } = useCAD();
  const { calls, officers, currentUser, myCallId } = state;
  const [selectedCall, setSelectedCall] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const { clock, now } = useTick();

  const activeCalls = calls.filter(c => c.status !== 'CLOSED' && c.category !== 'fire');
  const filtered    = filter === 'ALL' ? activeCalls : activeCalls.filter(c => c.status === filter);
  const myOfficer   = officers.find(o => o.id === currentUser?.id);
  const onDuty      = officers.filter(o => o.status !== 'OFFDUTY');
  const available   = officers.filter(o => o.status === 'AVAILABLE');
  const pending     = activeCalls.filter(c => c.units.length === 0).length;

  const assignSelf = callId => {
    if (!myOfficer) return;
    dispatch({ type: 'ASSIGN_UNIT',  payload: { callId, unitId: myOfficer.unitId } });
    dispatch({ type: 'SET_MY_CALL',  payload: callId });
    dispatch({ type: 'SET_STATUS',   payload: 'ENRT' });
  };
  const closeCall = callId => {
    dispatch({ type: 'CLOSE_CALL', payload: callId });
    if (myCallId === callId) {
      dispatch({ type: 'SET_MY_CALL', payload: null });
      dispatch({ type: 'SET_STATUS',  payload: 'AVAILABLE' });
    }
    if (selectedCall?.id === callId) setSelectedCall(null);
  };

  return (
    <div style={{ padding: '10px 12px 16px', fontFamily: MONO }}>

      {/* ── Status bar ── */}
      <div style={{
        background: '#0d1117',
        border: '1px solid #1a1e2c',
        borderLeft: '3px solid #1d4ed8',
        borderRadius: '3px',
        padding: '6px 12px',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
          <span style={{ color: '#22c55e', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>CONNECTED</span>
        </div>
        <Pipe />
        <StatItem label="OPERATOR"    value={currentUser?.name || '—'} color="#e2e8f0" />
        <Pipe />
        <StatItem label="CALLS"       value={activeCalls.length}        color="#fbbf24" />
        <StatItem label="UNASSIGNED"  value={pending}                   color={pending > 0 ? '#f87171' : '#374151'} />
        <StatItem label="ON-DUTY"     value={onDuty.length}             color="#4ade80" />
        <StatItem label="AVAILABLE"   value={available.length}          color="#93c5fd" />
        <div style={{ marginLeft: 'auto', color: '#1d4ed8', fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px' }}>
          {clock}
        </div>
      </div>

      {/* ── Controls row ── */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ color: '#374151', fontSize: '11px', letterSpacing: '0.5px', marginRight: '2px' }}>MY STATUS:</span>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => dispatch({ type: 'SET_STATUS', payload: s })}
            style={{
              background: myOfficer?.status === s ? tone(s).bg : 'transparent',
              border: `1px solid ${myOfficer?.status === s ? tone(s).bar : '#1a1e2c'}`,
              borderRadius: '3px',
              color: myOfficer?.status === s ? tone(s).text : '#374151',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.4px',
              cursor: 'pointer',
            }}
          >
            {s}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          {['ALL', 'ACTIVE', 'PENDING', 'ENRT'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? '#0f172a' : 'transparent',
                border: `1px solid ${filter === f ? '#1d4ed8' : '#1a1e2c'}`,
                borderRadius: '3px',
                color: filter === f ? '#93c5fd' : '#374151',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Active calls table ── */}
      <SectionHead title="ACTIVE CALLS" count={filtered.length} />
      <div className="table-scroll" style={{ border: '1px solid #1a1e2c', borderTop: 'none', borderRadius: '0 0 3px 3px', marginBottom: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#0d1117' }}>
              {['CALL #', 'NATURE', 'LOCATION', 'CITY', 'PR', 'STATUS', 'UNITS', 'ELAPSED', 'TIME', 'ACTIONS'].map(h => (
                <th key={h} style={{
                  padding: '6px 10px',
                  textAlign: h === 'PR' ? 'center' : 'left',
                  color: '#374151',
                  fontSize: '10px',
                  letterSpacing: '0.8px',
                  fontWeight: 700,
                  borderBottom: '1px solid #141720',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((call, idx) => {
              const sel = selectedCall?.id === call.id;
              const ec  = elapsedColor(call.createdAt, now, call.units.length > 0);
              return (
                <tr
                  key={call.id}
                  onClick={() => setSelectedCall(sel ? null : call)}
                  style={{
                    background: sel ? '#0f172a' : idx % 2 === 0 ? '#090b10' : '#0b0d14',
                    cursor: 'pointer',
                    borderLeft: `3px solid ${PR_COLOR[call.priority] || '#1a1e2c'}`,
                  }}
                >
                  <td style={{ padding: '5px 10px', color: '#4ade80', fontWeight: 700 }}>{call.id}</td>
                  <td style={{ padding: '5px 10px', color: '#e2e8f0', fontWeight: 600 }}>{call.nature}</td>
                  <td style={{ padding: '5px 10px', color: '#9ca3af' }}>{call.location}</td>
                  <td style={{ padding: '5px 10px', color: '#6b7280' }}>{call.city}</td>
                  <td style={{ padding: '5px 10px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', minWidth: '26px',
                      background: PR_BG[call.priority], color: PR_COLOR[call.priority],
                      border: `1px solid ${PR_COLOR[call.priority]}44`,
                      borderRadius: '2px', padding: '1px 5px', fontSize: '11px', fontWeight: 700,
                    }}>
                      P{call.priority}
                    </span>
                  </td>
                  <td style={{ padding: '5px 10px' }}><StatusBadge status={call.status} /></td>
                  <td style={{ padding: '5px 10px', color: '#93c5fd' }}>{call.units.join(', ') || '—'}</td>
                  <td className="tnum" style={{ padding: '5px 10px', color: ec, fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {elapsed(call.createdAt, now)}
                  </td>
                  <td className="tnum" style={{ padding: '5px 10px', color: '#374151', fontSize: '11px' }}>
                    {call.timestamp?.split(' ')[1] || '—'}
                  </td>
                  <td style={{ padding: '5px 8px' }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      <Btn label="Assign"  bg="#0f2451" onClick={e => { e.stopPropagation(); assignSelf(call.id); }} />
                      <Btn label="Close"   bg="#450a0a" onClick={e => { e.stopPropagation(); closeCall(call.id);  }} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={10} style={{ padding: '16px', textAlign: 'center', color: '#374151' }}>No calls match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Call detail panel ── */}
      {selectedCall && (
        <div style={{
          background: '#0d1117',
          border: '1px solid #1a1e2c',
          borderLeft: `3px solid ${PR_COLOR[selectedCall.priority] || '#1a1e2c'}`,
          borderRadius: '3px',
          padding: '14px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '12px', letterSpacing: '0.5px' }}>
              CALL DETAIL — {selectedCall.id}
            </span>
            <button onClick={() => setSelectedCall(null)} style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: '15px', lineHeight: 1 }}>
              ×
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', fontSize: '12px' }}>
            {[
              ['NATURE',          selectedCall.nature],
              ['LOCATION',        selectedCall.location],
              ['CITY',            selectedCall.city],
              ['COUNTY',          selectedCall.county],
              ['PRIORITY',        `P${selectedCall.priority}`],
              ['STATUS',          selectedCall.status],
              ['REPORTING PARTY', selectedCall.reportingParty],
              ['TIMESTAMP',       selectedCall.timestamp],
              ['UNITS',           selectedCall.units.join(', ') || 'None'],
            ].map(([k, v]) => (
              <div key={k}>
                <span style={{ color: '#374151', fontSize: '10px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>{k}: </span>
                <span style={{ color: '#d1d5db' }}>{v}</span>
              </div>
            ))}
          </div>
          {selectedCall.description && (
            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #141720' }}>
              <span style={{ color: '#374151', fontSize: '10px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>DESCRIPTION: </span>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>{selectedCall.description}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Units roster ── */}
      <SectionHead title="UNITS ROSTER" count={onDuty.length} />
      <div className="table-scroll" style={{ border: '1px solid #1a1e2c', borderTop: 'none', borderRadius: '0 0 3px 3px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#0d1117' }}>
              {['OFFICER', 'UNIT #', 'STATUS', 'CALL #', 'AGENCY', 'SUBDIVISION', 'LOCATION'].map(h => (
                <th key={h} style={{
                  padding: '6px 10px', textAlign: 'left',
                  color: '#374151', fontSize: '10px', letterSpacing: '0.8px', fontWeight: 700,
                  borderBottom: '1px solid #141720', whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {officers.map((o, idx) => {
              const t   = tone(o.status);
              const isMe = o.id === currentUser?.id;
              return (
                <tr
                  key={o.id}
                  style={{
                    background: t.bg !== 'transparent' ? t.bg : idx % 2 === 0 ? '#090b10' : '#0b0d14',
                    borderLeft: `3px solid ${t.bar}`,
                  }}
                >
                  <td style={{ padding: '5px 10px', color: isMe ? '#fbbf24' : t.text, fontWeight: isMe ? 800 : 600 }}>
                    {isMe ? '» ' : ''}{o.name}
                  </td>
                  <td className="tnum" style={{ padding: '5px 10px', color: '#93c5fd' }}>{o.unitId}</td>
                  <td style={{ padding: '5px 10px' }}><StatusBadge status={o.status} /></td>
                  <td className="tnum" style={{ padding: '5px 10px', color: o.callId ? '#fbbf24' : '#1f2937' }}>{o.callId || '—'}</td>
                  <td style={{ padding: '5px 10px', color: '#6b7280' }}>{o.deptShort}</td>
                  <td style={{ padding: '5px 10px', color: '#6b7280' }}>{o.subdivision}</td>
                  <td style={{ padding: '5px 10px', color: '#374151' }}>{o.location}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionHead({ title, count }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '5px 10px',
      background: '#0d1117',
      border: '1px solid #1a1e2c',
      borderRadius: '3px 3px 0 0',
    }}>
      <span style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }}>{title}</span>
      <span style={{ background: 'rgba(0,0,0,0.4)', color: '#93c5fd', border: '1px solid #1d4ed844', borderRadius: '10px', padding: '0 7px', fontSize: '10px', fontWeight: 700 }}>
        {count}
      </span>
      <div style={{ flex: 1, height: '1px', background: '#141720' }} />
    </div>
  );
}

function StatItem({ label, value, color }) {
  return (
    <span style={{ fontSize: '11px', color: '#374151' }}>
      {label} <span style={{ color, fontWeight: 700 }}>{value}</span>
    </span>
  );
}

function Pipe() {
  return <span style={{ width: '1px', height: '12px', background: '#1a1e2c', flexShrink: 0 }} />;
}

function Btn({ label, bg, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: bg, border: 'none', borderRadius: '2px',
        color: '#d1d5db', padding: '2px 8px', fontSize: '11px',
        cursor: 'pointer', fontFamily: MONO, fontWeight: 600,
      }}
    >
      {label}
    </button>
  );
}
