import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';

const UNIT_POSITIONS = {
  1: { x: 42, y: 35 },
  2: { x: 58, y: 48 },
  3: { x: 25, y: 62 },
  4: { x: 72, y: 28 },
  5: { x: 83, y: 55 },
  6: { x: 50, y: 70 },
  7: { x: 38, y: 20 },
  8: { x: 65, y: 40 },
};

const CALL_POSITIONS = {
  '23-1042': { x: 56, y: 47 },
  '23-1043': { x: 44, y: 38 },
  '23-1044': { x: 70, y: 65 },
  '23-1045': { x: 48, y: 32 },
  '23-1046': { x: 80, y: 52 },
  '23-1047': { x: 36, y: 55 },
};

const PRIORITY_COLORS = { 1: '#ef4444', 2: '#f59e0b', 3: '#22c55e' };
const STATUS_COLORS = { AVAILABLE: '#22c55e', BUSY: '#f59e0b', ENRT: '#22c55e', UNAVAILABLE: '#ef4444', OFFDUTY: '#475569' };

export default function LiveMap() {
  const { state } = useCAD();
  const { officers, calls } = state;
  const [hoveredUnit, setHoveredUnit] = useState(null);
  const [hoveredCall, setHoveredCall] = useState(null);
  const [showUnits, setShowUnits] = useState(true);
  const [showCalls, setShowCalls] = useState(true);
  const activeCalls = calls.filter(c => c.status !== 'CLOSED');

  return (
    <div style={{ padding: '16px', fontFamily: 'Courier New, monospace', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ color: '#4a9eff', fontSize: '16px', fontWeight: 700, letterSpacing: '2px' }}>LIVE MAP — ARCADIA DISPATCH</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px' }}>
          <LayerToggle active={showUnits} onClick={() => setShowUnits(v => !v)} label="Units" color="#22c55e" />
          <LayerToggle active={showCalls} onClick={() => setShowCalls(v => !v)} label="Calls" color="#ef4444" />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '12px', minHeight: 0 }}>
        {/* Map area */}
        <div style={{ flex: 1, position: 'relative', background: '#0a1a2e', border: '1px solid #1e4080', borderRadius: '6px', overflow: 'hidden' }}>
          {/* Grid lines */}
          {[...Array(10)].map((_, i) => (
            <div key={`v${i}`} style={{ position: 'absolute', left: `${(i+1)*10}%`, top: 0, bottom: 0, borderLeft: '1px solid rgba(30,64,128,0.3)' }} />
          ))}
          {[...Array(8)].map((_, i) => (
            <div key={`h${i}`} style={{ position: 'absolute', top: `${(i+1)*12.5}%`, left: 0, right: 0, borderTop: '1px solid rgba(30,64,128,0.3)' }} />
          ))}

          {/* Road overlay (decorative) */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="50" x2="100" y2="50" stroke="#1e3060" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="#1e3060" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="0" y1="30" x2="100" y2="70" stroke="#1e3060" strokeWidth="0.3" strokeDasharray="2,2" />
            <line x1="20" y1="0" x2="80" y2="100" stroke="#1e3060" strokeWidth="0.3" strokeDasharray="2,2" />
            <text x="10" y="10" fill="#1e3060" fontSize="3" fontFamily="Courier New">ARCADIA NORTH</text>
            <text x="60" y="10" fill="#1e3060" fontSize="3" fontFamily="Courier New">GREENVIEW</text>
            <text x="5" y="95" fill="#1e3060" fontSize="3" fontFamily="Courier New">ROCA BAY</text>
            <text x="65" y="95" fill="#1e3060" fontSize="3" fontFamily="Courier New">UNINCORPORATED</text>
          </svg>

          {/* Call markers */}
          {showCalls && activeCalls.map(call => {
            const pos = CALL_POSITIONS[call.id];
            if (!pos) return null;
            return (
              <div
                key={call.id}
                onMouseEnter={() => setHoveredCall(call)}
                onMouseLeave={() => setHoveredCall(null)}
                style={{
                  position: 'absolute',
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '20px',
                  height: '20px',
                  background: PRIORITY_COLORS[call.priority],
                  border: '2px solid rgba(255,255,255,0.7)',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#fff',
                  boxShadow: `0 0 10px ${PRIORITY_COLORS[call.priority]}60`,
                  zIndex: 10,
                  animation: call.priority === 1 ? 'pulse 1.5s infinite' : 'none',
                }}
              >
                P{call.priority}
              </div>
            );
          })}

          {/* Unit markers */}
          {showUnits && officers.filter(o => o.status !== 'OFFDUTY').map(officer => {
            const pos = UNIT_POSITIONS[officer.id];
            if (!pos) return null;
            const color = STATUS_COLORS[officer.status] || '#475569';
            return (
              <div
                key={officer.id}
                onMouseEnter={() => setHoveredUnit(officer)}
                onMouseLeave={() => setHoveredUnit(null)}
                style={{
                  position: 'absolute',
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '28px',
                  height: '28px',
                  background: '#0d1f3c',
                  border: `2px solid ${color}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontWeight: 700,
                  color,
                  boxShadow: `0 0 8px ${color}40`,
                  zIndex: 20,
                }}
              >
                {officer.unitId.split('-').pop() || officer.unitId.slice(-3)}
              </div>
            );
          })}

          {/* Hover tooltip - unit */}
          {hoveredUnit && (
            <div style={{
              position: 'absolute',
              left: `${UNIT_POSITIONS[hoveredUnit.id]?.x}%`,
              top: `${(UNIT_POSITIONS[hoveredUnit.id]?.y || 0) - 12}%`,
              transform: 'translateX(-50%)',
              background: '#0d1f3c',
              border: '1px solid #4a9eff',
              borderRadius: '4px',
              padding: '8px 12px',
              fontSize: '11px',
              zIndex: 100,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}>
              <div style={{ color: '#4a9eff', fontWeight: 700 }}>{hoveredUnit.unitId} — {hoveredUnit.name}</div>
              <div style={{ color: '#94a3b8' }}>{hoveredUnit.deptShort} / {hoveredUnit.subdivision}</div>
              <div style={{ color: STATUS_COLORS[hoveredUnit.status], fontWeight: 600 }}>{hoveredUnit.status}</div>
              <div style={{ color: '#64748b' }}>{hoveredUnit.location}</div>
              {hoveredUnit.callId && <div style={{ color: '#f59e0b' }}>Call: {hoveredUnit.callId}</div>}
            </div>
          )}

          {/* Hover tooltip - call */}
          {hoveredCall && (
            <div style={{
              position: 'absolute',
              left: `${CALL_POSITIONS[hoveredCall.id]?.x}%`,
              top: `${(CALL_POSITIONS[hoveredCall.id]?.y || 0) - 10}%`,
              transform: 'translateX(-50%)',
              background: '#0d1f3c',
              border: `1px solid ${PRIORITY_COLORS[hoveredCall.priority]}`,
              borderRadius: '4px',
              padding: '8px 12px',
              fontSize: '11px',
              zIndex: 100,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}>
              <div style={{ color: PRIORITY_COLORS[hoveredCall.priority], fontWeight: 700 }}>{hoveredCall.id} — P{hoveredCall.priority}</div>
              <div style={{ color: '#e2e8f0' }}>{hoveredCall.nature}</div>
              <div style={{ color: '#94a3b8' }}>{hoveredCall.location}</div>
              <div style={{ color: '#64748b' }}>{hoveredCall.units.length} unit(s) assigned</div>
            </div>
          )}

          {/* Compass */}
          <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: '#060d1a', border: '1px solid #1e3060', borderRadius: '4px', padding: '6px 8px', fontSize: '10px', color: '#475569' }}>
            N ↑
          </div>
        </div>

        {/* Legend / status panel */}
        <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '4px', padding: '12px' }}>
            <div style={{ color: '#4a9eff', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '10px' }}>LEGEND</div>
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '14px', height: '14px', background: '#0d1f3c', border: `2px solid ${c}`, borderRadius: '3px' }} />
                <span style={{ color: '#94a3b8', fontSize: '11px' }}>{s}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #1e3060', marginTop: '8px', paddingTop: '8px' }}>
              {[1,2,3].map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '14px', height: '14px', background: PRIORITY_COLORS[p], borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)' }} />
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>Priority {p}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '4px', padding: '12px', flex: 1, overflowY: 'auto' }}>
            <div style={{ color: '#4a9eff', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '10px' }}>ACTIVE UNITS ({officers.filter(o => o.status !== 'OFFDUTY').length})</div>
            {officers.filter(o => o.status !== 'OFFDUTY').map(o => (
              <div key={o.id} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #0f1e35' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#60a5fa', fontSize: '11px', fontWeight: 700 }}>{o.unitId}</span>
                  <StatusBadge status={o.status} style={{ fontSize: '9px', padding: '1px 5px' }} />
                </div>
                <div style={{ color: '#64748b', fontSize: '10px' }}>{o.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100% { box-shadow: 0 0 10px #ef444460; } 50% { box-shadow: 0 0 20px #ef4444; } }`}</style>
    </div>
  );
}

function LayerToggle({ active, onClick, label, color }) {
  return (
    <button onClick={onClick} style={{ background: active ? '#060d1a' : 'transparent', border: `1px solid ${active ? color : '#1e3060'}`, borderRadius: '4px', color: active ? color : '#475569', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Courier New, monospace', display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: active ? color : '#475569' }} />
      {label}
    </button>
  );
}
