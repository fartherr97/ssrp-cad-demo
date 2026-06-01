import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';
import { useResponsive } from '../hooks/useResponsive';

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

const PRIORITY_COLORS = { 1: '#dc2626', 2: '#ea580c', 3: '#16a34a' };
const STATUS_COLORS = { AVAILABLE: '#22c55e', BUSY: '#f59e0b', ENRT: '#60a5fa', UNAVAILABLE: '#ef4444', OFFDUTY: '#374151' };

export default function LiveMap() {
  const { state } = useCAD();
  const { officers, calls } = state;
  const [hoveredUnit, setHoveredUnit] = useState(null);
  const [hoveredCall, setHoveredCall] = useState(null);
  const [showUnits, setShowUnits] = useState(true);
  const [showCalls, setShowCalls] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const { isMobile } = useResponsive();
  const activeCalls = calls.filter(c => c.status !== 'CLOSED');

  return (
    <div style={{ padding: '12px', fontFamily: 'Ubuntu Mono, monospace', height: isMobile ? 'calc(100vh - 50px)' : 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', background: '#0b0d14', border: '1px solid #1e2533', padding: '7px 12px' }}>
        <div style={{ color: '#f9fafb', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px' }}>LIVE MAP &bull; HILLSBOROUGH COUNTY DISPATCH</div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <LayerToggle active={showUnits} onClick={() => setShowUnits(v => !v)} label="Units" color="#22c55e" />
          <LayerToggle active={showCalls} onClick={() => setShowCalls(v => !v)} label="Calls" color="#ef4444" />
          {isMobile && (
            <LayerToggle active={showLegend} onClick={() => setShowLegend(v => !v)} label="Legend" color="#3b82f6" />
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '10px', minHeight: 0 }}>
        {/* Map area */}
        <div style={{ flex: 1, position: 'relative', background: '#060c14', border: '1px solid #1e2533', overflow: 'hidden' }}>
          {/* Grid lines */}
          {[...Array(10)].map((_, i) => (
            <div key={`v${i}`} style={{ position: 'absolute', left: `${(i+1)*10}%`, top: 0, bottom: 0, borderLeft: '1px solid rgba(30,37,51,0.6)' }} />
          ))}
          {[...Array(8)].map((_, i) => (
            <div key={`h${i}`} style={{ position: 'absolute', top: `${(i+1)*12.5}%`, left: 0, right: 0, borderTop: '1px solid rgba(30,37,51,0.6)' }} />
          ))}

          {/* Road overlay */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="50" x2="100" y2="50" stroke="#1e2533" strokeWidth="0.7" strokeDasharray="3,3" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="#1e2533" strokeWidth="0.7" strokeDasharray="3,3" />
            <line x1="0" y1="30" x2="100" y2="70" stroke="#1e2533" strokeWidth="0.4" strokeDasharray="2,4" />
            <line x1="20" y1="0" x2="80" y2="100" stroke="#1e2533" strokeWidth="0.4" strokeDasharray="2,4" />
            {/* I-275 label */}
            <text x="5" y="52" fill="#2d3d55" fontSize="3.5" fontFamily="Courier New" fontWeight="700">I-275</text>
            <text x="10" y="10" fill="#1e2d40" fontSize="3" fontFamily="Courier New">TAMPA NORTH</text>
            <text x="60" y="10" fill="#1e2d40" fontSize="3" fontFamily="Courier New">BRANDON</text>
            <text x="5" y="95" fill="#1e2d40" fontSize="3" fontFamily="Courier New">RIVERVIEW</text>
            <text x="62" y="95" fill="#1e2d40" fontSize="3" fontFamily="Courier New">PLANT CITY</text>
            <text x="30" y="52" fill="#2d3d55" fontSize="3" fontFamily="Courier New">DOWNTOWN TAMPA</text>
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
                  border: '2px solid rgba(255,255,255,0.6)',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#fff',
                  boxShadow: `0 0 8px ${PRIORITY_COLORS[call.priority]}80`,
                  zIndex: 10,
                  animation: call.priority === 1 ? 'mapPulse 1.5s infinite' : 'none',
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
            const color = STATUS_COLORS[officer.status] || '#374151';
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
                  width: '26px',
                  height: '26px',
                  background: '#0d1117',
                  border: `2px solid ${color}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontWeight: 800,
                  color,
                  boxShadow: `0 0 6px ${color}40`,
                  zIndex: 20,
                }}
              >
                {officer.unitId.split('-').pop()?.slice(-3) || officer.unitId.slice(-3)}
              </div>
            );
          })}

          {/* Unit tooltip */}
          {hoveredUnit && (
            <div style={{
              position: 'absolute',
              left: `${UNIT_POSITIONS[hoveredUnit.id]?.x}%`,
              top: `${(UNIT_POSITIONS[hoveredUnit.id]?.y || 0) - 14}%`,
              transform: 'translateX(-50%)',
              background: '#0d1117',
              border: '1px solid #3b82f6',
              padding: '8px 12px',
              fontSize: '11px',
              zIndex: 100,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(0,0,0,0.7)',
            }}>
              <div style={{ color: '#3b82f6', fontWeight: 700 }}>{hoveredUnit.unitId} &bull; {hoveredUnit.name}</div>
              <div style={{ color: '#9ca3af' }}>{hoveredUnit.deptShort} / {hoveredUnit.subdivision}</div>
              <div style={{ color: STATUS_COLORS[hoveredUnit.status], fontWeight: 600 }}>{hoveredUnit.status}</div>
              <div style={{ color: '#4b5563' }}>{hoveredUnit.location}</div>
              {hoveredUnit.callId && <div style={{ color: '#fbbf24' }}>Call: {hoveredUnit.callId}</div>}
            </div>
          )}

          {/* Call tooltip */}
          {hoveredCall && (
            <div style={{
              position: 'absolute',
              left: `${CALL_POSITIONS[hoveredCall.id]?.x}%`,
              top: `${(CALL_POSITIONS[hoveredCall.id]?.y || 0) - 12}%`,
              transform: 'translateX(-50%)',
              background: '#0d1117',
              border: `1px solid ${PRIORITY_COLORS[hoveredCall.priority]}`,
              padding: '8px 12px',
              fontSize: '11px',
              zIndex: 100,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(0,0,0,0.7)',
            }}>
              <div style={{ color: PRIORITY_COLORS[hoveredCall.priority], fontWeight: 700 }}>{hoveredCall.id} &bull; P{hoveredCall.priority}</div>
              <div style={{ color: '#d1d5db' }}>{hoveredCall.nature}</div>
              <div style={{ color: '#9ca3af' }}>{hoveredCall.location}</div>
              <div style={{ color: '#4b5563' }}>{hoveredCall.units.length} unit(s) assigned</div>
            </div>
          )}

          {/* Compass */}
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: '#090b10', border: '1px solid #1e2533', padding: '4px 8px', fontSize: '10px', color: '#374151' }}>
            N
          </div>
        </div>

        {/* Side panel */}
        {(!isMobile || showLegend) && (
          <div style={{ width: isMobile ? '100%' : '190px', display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '10px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <div style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '10px' }}>
              <div style={{ color: '#6b7280', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '10px' }}>LEGEND</div>
              {Object.entries(STATUS_COLORS).map(([s, c]) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#0d1117', border: `2px solid ${c}` }} />
                  <span style={{ color: '#9ca3af', fontSize: '11px' }}>{s}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #1f2937', marginTop: '8px', paddingTop: '8px' }}>
                {[1,2,3].map(p => (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <div style={{ width: '12px', height: '12px', background: PRIORITY_COLORS[p], borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)' }} />
                    <span style={{ color: '#9ca3af', fontSize: '11px' }}>Priority {p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '10px', flex: 1, overflowY: 'auto' }}>
              <div style={{ color: '#6b7280', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '10px' }}>
                ACTIVE UNITS ({officers.filter(o => o.status !== 'OFFDUTY').length})
              </div>
              {officers.filter(o => o.status !== 'OFFDUTY').map(o => (
                <div key={o.id} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #1f2937' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#60a5fa', fontSize: '11px', fontWeight: 700 }}>{o.unitId}</span>
                    <StatusBadge status={o.status} style={{ fontSize: '9px', padding: '1px 4px' }} />
                  </div>
                  <div style={{ color: '#4b5563', fontSize: '10px', marginTop: '1px' }}>{o.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes mapPulse { 0%,100% { box-shadow: 0 0 8px #dc262680; } 50% { box-shadow: 0 0 18px #dc2626; } }`}</style>
    </div>
  );
}

function LayerToggle({ active, onClick, label, color }) {
  return (
    <button onClick={onClick} style={{ background: active ? '#090b10' : 'transparent', border: `1px solid ${active ? color : '#1e2533'}`, color: active ? color : '#374151', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: active ? color : '#374151' }} />
      {label}
    </button>
  );
}
