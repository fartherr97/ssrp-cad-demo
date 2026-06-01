import { useState, useEffect } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';

// HCFR livery * fire-rescue red.
const FIRE_RED = '#e5484d';
const FIRE_RED_DEEP = '#7f1d1d';

const PRIORITY_COLORS = { 1: '#e5484d', 2: '#f0883e', 3: '#f5b740', 4: '#46c971' };

const UNIT_TONE = {
  AVAILABLE:   { text: '#46c971', bar: '#46c971', tint: 'rgba(70,201,113,0.06)' },
  ENRT:        { text: '#f5b740', bar: '#f5b740', tint: 'rgba(245,183,64,0.07)' },
  ARRVD:       { text: '#c66cf0', bar: '#c66cf0', tint: 'rgba(198,108,240,0.07)' },
  ONSCENE:     { text: '#c66cf0', bar: '#c66cf0', tint: 'rgba(198,108,240,0.07)' },
  BUSY:        { text: '#f0883e', bar: '#f0883e', tint: 'rgba(240,136,62,0.06)' },
  UNAVAILABLE: { text: '#e5484d', bar: '#e5484d', tint: 'rgba(229,72,77,0.06)' },
  OFFDUTY:     { text: '#6b7280', bar: '#33415a', tint: 'transparent' },
};
const toneFor = (status) => UNIT_TONE[status] || UNIT_TONE.AVAILABLE;

const APPARATUS = {
  E:   { label: 'ENGINE',  color: '#e5484d' },
  L:   { label: 'LADDER',  color: '#f0883e' },
  MED: { label: 'RESCUE',  color: '#46c971' },
  BC:  { label: 'COMMAND', color: '#f5b740' },
  HZ:  { label: 'HAZMAT',  color: '#c66cf0' },
};
function apparatusFor(unitId = '') {
  if (unitId.startsWith('MED')) return APPARATUS.MED;
  const key = unitId.split('-')[0];
  return APPARATUS[key] || { label: 'UNIT', color: '#93a6c4' };
}

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

function fmtElapsed(fromMs, nowMs) {
  if (!fromMs) return '--:--';
  const total = Math.max(0, Math.floor((nowMs - fromMs) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const p = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}

function elapsedTone(fromMs, nowMs, hasUnits) {
  if (!fromMs) return '#5f779b';
  const mins = (nowMs - fromMs) / 60000;
  if (!hasUnits && mins >= 10) return '#e5484d';
  if (!hasUnits && mins >= 5)  return '#f0883e';
  return '#cf8f7a';
}

const HCFR_DEPT = 3;

export default function FireBoard() {
  const { state, dispatch } = useCAD();
  const { calls, officers, currentUser, myCallId } = state;
  const [selectedCall, setSelectedCall] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { clock, now } = useClock();

  const crew = officers.filter((o) => o.dept === HCFR_DEPT);
  const fireCalls = calls.filter((c) => c.category === 'fire' && c.status !== 'CLOSED');
  const filteredCalls =
    statusFilter === 'ALL' ? fireCalls : fireCalls.filter((c) => c.status === statusFilter);

  const myOfficer = officers.find((o) => o.id === currentUser?.id);
  const onDuty = crew.filter((o) => o.status !== 'OFFDUTY');
  const availableCount = crew.filter((o) => o.status === 'AVAILABLE').length;

  const handleAssignSelf = (callId) => {
    if (!currentUser) return;
    dispatch({ type: 'ASSIGN_UNIT', payload: { callId, unitId: myOfficer?.unitId } });
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
    <div className="px-3.5 pt-3 pb-7 font-mono">
      {/* ── HCFR status bar ── */}
      <div
        className="flex items-center flex-wrap gap-2.5 px-3.5 py-2 mb-3.5 rounded border shadow-[0_6px_22px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)]"
        style={{
          background: 'linear-gradient(180deg,#2a1416,#1c1416)',
          border: `1px solid ${FIRE_RED_DEEP}`,
        }}
      >
        <span className="inline-flex items-center gap-2 font-extrabold text-[13px] tracking-[0.6px]" style={{ color: FIRE_RED }}>
          HCFR * FIRE / RESCUE
        </span>
        <Divider />
        <span className="inline-flex items-center gap-[7px] font-bold text-[12px] text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_theme(colors.green.400)] animate-pulse" />
          IN SERVICE
        </span>
        <Divider />
        <span className="text-[#b9a6a4] text-[12px]">
          INCIDENTS <span className="text-amber-400 font-bold">{fireCalls.length}</span>
        </span>
        <span className="text-[#b9a6a4] text-[12px]">
          ON-DUTY <span className="text-green-400 font-bold">{onDuty.length}</span>
        </span>
        <span className="text-[#b9a6a4] text-[12px]">
          AVAIL <span className="text-green-300 font-bold">{availableCount}</span>
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[#f0e6e4] font-bold text-[14px] tracking-[0.5px]">
          <span className="text-[#a07e7a] text-[11px] font-normal">STATION TIME</span>
          {clock}
        </span>
      </div>

      {/* ── Controls row ── */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <span className="text-[#b9a6a4] text-[13px] mr-0.5 tracking-[0.5px]">MY STATUS:</span>
        {['AVAILABLE', 'ENRT', 'ARRVD', 'UNAVAILABLE', 'OFFDUTY'].map((s) => {
          const active = myOfficer?.status === s;
          const tone = toneFor(s);
          return (
            <button
              key={s}
              onClick={() => dispatch({ type: 'SET_STATUS', payload: s })}
              className="rounded font-semibold text-[13px] font-mono tracking-[0.4px] px-3 py-[5px] cursor-pointer border transition-colors"
              style={{
                background: active ? 'rgba(229,72,77,0.16)' : '#15161a',
                border: `1px solid ${active ? tone.bar : '#2e3138'}`,
                color: active ? tone.text : '#9aa3af',
              }}
            >
              {s}
            </button>
          );
        })}
        <div className="ml-auto flex gap-1.5">
          {['ALL', 'PENDING', 'ENRT', 'ACTIVE'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className="rounded text-[13px] font-mono px-[11px] py-[5px] cursor-pointer border transition-colors"
              style={{
                background: statusFilter === f ? 'rgba(229,72,77,0.16)' : '#15161a',
                border: `1px solid ${statusFilter === f ? FIRE_RED : '#2e3138'}`,
                color: statusFilter === f ? FIRE_RED : '#71767f',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Active Incidents ── */}
      <SectionHeader title="ACTIVE INCIDENTS" count={filteredCalls.length} />
      <div className="table-scroll mb-6 border border-[#2e3138] rounded-b-md border-t-0">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {['Inc #', 'Nature', 'Location', 'City', 'County', 'Pr', 'Status', 'Apparatus', 'Elapsed', 'Time', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="px-2.5 py-[7px] text-[#b9a6a4] text-[11px] tracking-[0.6px] uppercase font-semibold border-b-2 border-[#0b0c0f] whitespace-nowrap"
                  style={{
                    textAlign: h === 'Pr' ? 'center' : 'left',
                    background: 'linear-gradient(180deg,#2a1416,#1c1416)',
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
                  className="cursor-pointer"
                  style={{
                    background: sel ? 'rgba(229,72,77,0.12)' : idx % 2 === 0 ? '#111216' : '#131418',
                    borderLeft: `3px solid ${PRIORITY_COLORS[call.priority] || '#33415a'}`,
                  }}
                >
                  <td className="px-2.5 py-1.5 text-[#f0883e] font-bold">{call.id}</td>
                  <td className="px-2.5 py-1.5 text-[#f0e6e4] font-semibold">{call.nature}</td>
                  <td className="px-2.5 py-1.5 text-[#b9a6a4]">{call.location}</td>
                  <td className="px-2.5 py-1.5 text-[#b9a6a4]">{call.city}</td>
                  <td className="px-2.5 py-1.5 text-[#a07e7a]">{call.county}</td>
                  <td className="px-2.5 py-1.5 text-center">
                    <span
                      className="inline-block min-w-[22px] rounded-sm px-1.5 py-px text-[12px] font-extrabold"
                      style={{
                        background: PRIORITY_COLORS[call.priority],
                        color: call.priority >= 3 ? '#1a1205' : '#fff',
                      }}
                    >
                      P{call.priority}
                    </span>
                  </td>
                  <td className="px-2.5 py-1.5">
                    <StatusBadge status={call.status} />
                  </td>
                  <td className="px-2.5 py-1.5 text-[#f0883e]">{call.units.join(', ') || '*'}</td>
                  <td className="px-2.5 py-1.5 text-[12px] font-bold whitespace-nowrap" style={{ color: elapsedTone(call.createdAt, now, call.units.length > 0) }}>
                    ⏱ {fmtElapsed(call.createdAt, now)}
                  </td>
                  <td className="px-2.5 py-1.5 text-[#a07e7a] text-[12px]">
                    {call.timestamp?.split(' ')[1]}
                  </td>
                  <td className="px-2.5 py-1.5">
                    <div className="flex gap-1">
                      <ActionBtn label="Respond" color={FIRE_RED_DEEP} onClick={(e) => { e.stopPropagation(); handleAssignSelf(call.id); }} />
                      <ActionBtn label="Clear" color="#3a2326" onClick={(e) => { e.stopPropagation(); handleClose(call.id); }} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredCalls.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-[18px] text-center text-[#71767f]">
                  No active fire/rescue incidents.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Incident Detail ── */}
      {selectedCall && (
        <div
          className="border rounded mb-6 p-4 shadow-[0_6px_22px_rgba(0,0,0,0.45)]"
          style={{
            background: 'linear-gradient(180deg,#1c1e23,#15161a)',
            border: `1px solid #2e3138`,
            borderLeft: `4px solid ${PRIORITY_COLORS[selectedCall.priority] || '#33415a'}`,
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-[#f0883e] font-bold text-[14px] tracking-[0.5px]">
              INCIDENT • {selectedCall.id}
            </span>
            <button onClick={() => setSelectedCall(null)} className="bg-none border-none text-[#a07e7a] cursor-pointer text-[16px]">
              ✕
            </button>
          </div>
          <div className="grid gap-2.5 text-[13px]" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
            {[
              ['Nature', selectedCall.nature],
              ['Location', selectedCall.location],
              ['City', selectedCall.city],
              ['County', selectedCall.county],
              ['Priority', `P${selectedCall.priority}`],
              ['Status', selectedCall.status],
              ['Reporting Party', selectedCall.reportingParty],
              ['Dispatched', selectedCall.timestamp],
              ['Apparatus', selectedCall.units.join(', ') || 'None'],
            ].map(([k, v]) => (
              <div key={k}>
                <span className="text-[#a07e7a] text-[11px] tracking-[0.6px] uppercase">{k}: </span>
                <span className="text-[#f0e6e4]">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#2e3138]">
            <span className="text-[#a07e7a] text-[11px] tracking-[0.6px] uppercase">Notes: </span>
            <span className="text-[#b9a6a4] text-[13px]">{selectedCall.description}</span>
          </div>
        </div>
      )}

      {/* ── Apparatus Roster ── */}
      <SectionHeader title="APPARATUS & CREW" count={onDuty.length} />
      <div className="table-scroll border border-[#2e3138] rounded-b-md border-t-0">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {['Crew', 'Unit', 'Type', 'Status', 'Inc #', 'Assignment', 'Location'].map((h) => (
                <th
                  key={h}
                  className="px-2.5 py-[7px] text-left text-[#b9a6a4] text-[11px] tracking-[0.6px] uppercase font-semibold border-b-2 border-[#0b0c0f] whitespace-nowrap"
                  style={{ background: 'linear-gradient(180deg,#2a1416,#1c1416)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {crew.map((o, idx) => {
              const tone = toneFor(o.status);
              const app = apparatusFor(o.unitId);
              const isMe = o.id === currentUser?.id;
              return (
                <tr
                  key={o.id}
                  style={{
                    background: tone.tint !== 'transparent' ? tone.tint : idx % 2 === 0 ? '#111216' : '#131418',
                    borderLeft: `3px solid ${tone.bar}`,
                  }}
                >
                  <td className="px-2.5 py-1.5" style={{ color: tone.text, fontWeight: isMe ? 800 : 600 }}>
                    {isMe ? '▶ ' : ''}{o.name}
                  </td>
                  <td className="px-2.5 py-1.5 text-[#f0883e] font-bold">{o.unitId}</td>
                  <td className="px-2.5 py-1.5">
                    <span
                      className="inline-block rounded-sm px-1.5 text-[10px] font-bold tracking-[0.5px]"
                      style={{ background: `${app.color}1f`, color: app.color, border: `1px solid ${app.color}55` }}
                    >
                      {app.label}
                    </span>
                  </td>
                  <td className="px-2.5 py-1.5">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-2.5 py-1.5" style={{ color: o.callId ? '#f5b740' : '#33415a' }}>{o.callId || '*'}</td>
                  <td className="px-2.5 py-1.5 text-[#b9a6a4]">{o.subdivision}</td>
                  <td className="px-2.5 py-1.5 text-[#a07e7a]">{o.location}</td>
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
  return <span className="w-px h-3.5 bg-[#4a2e30]" />;
}

function SectionHeader({ title, count }) {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-t-md border"
      style={{
        background: 'linear-gradient(180deg,#2a1416,#1c1416)',
        border: `1px solid ${FIRE_RED_DEEP}`,
      }}
    >
      <span className="text-[12px] font-bold tracking-[0.8px]" style={{ color: FIRE_RED }}>{title}</span>
      <span
        className="rounded-[9px] px-2 py-px text-[11px] font-bold text-[#f0883e]"
        style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(127,29,29,0.6)' }}
      >
        {count}
      </span>
      <div className="flex-1 h-px bg-[rgba(127,29,29,0.5)]" />
    </div>
  );
}

function ActionBtn({ label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="border-none rounded-sm text-white px-[9px] py-[3px] text-[12px] cursor-pointer font-mono font-semibold"
      style={{ background: color }}
    >
      {label}
    </button>
  );
}
