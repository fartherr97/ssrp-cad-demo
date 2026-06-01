import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { S_PAGE, S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY, S_BTN_PRIMARY, S_BTN_SECONDARY, xs, btnHoverOn, btnHoverOff, S_UNIT_ROW, S_DATA } from '../constants/styles';

const MAP_W = 800;
const MAP_H = 560;

const REGIONS = [
  { id: 'downtown', label: 'DOWNTOWN', x: 380, y: 200, w: 160, h: 100 },
  { id: 'port', label: 'PORT TAMPA', x: 200, y: 340, w: 120, h: 80 },
  { id: 'brandon', label: 'BRANDON', x: 560, y: 280, w: 120, h: 80 },
  { id: 'ybor', label: 'YBOR CITY', x: 460, y: 160, w: 100, h: 70 },
  { id: 'riverview', label: 'RIVERVIEW', x: 580, y: 400, w: 120, h: 70 },
  { id: 'plant-city', label: 'PLANT CITY', x: 660, y: 200, w: 110, h: 60 },
];

const ROADS = [
  { id: 'i275', label: 'I-275', x1: 350, y1: 80, x2: 340, y2: 520, color: '#204060' },
  { id: 'i4', label: 'I-4', x1: 100, y1: 200, x2: 750, y2: 200, color: '#204060' },
  { id: 'i75', label: 'I-75', x1: 620, y1: 80, x2: 640, y2: 520, color: '#204060' },
  { id: 'us41', label: 'US-41', x1: 260, y1: 80, x2: 280, y2: 520, color: '#1a3048' },
  { id: 'sr60', label: 'SR-60', x1: 100, y1: 300, x2: 750, y2: 290, color: '#1a3048' },
];

const UNIT_POSITIONS = {
  '831':    { x: 395, y: 210 },
  '831-12': { x: 360, y: 235 },
  '831-07': { x: 310, y: 195 },
  'SO-22':  { x: 430, y: 295 },
  'SHP-09': { x: 625, y: 200 },
  'MED-3':  { x: 415, y: 320 },
  'E-11':   { x: 400, y: 340 },
  '831-19': { x: 380, y: 180 },
  'DISP-1': { x: 355, y: 260 },
  'L-7':    { x: 440, y: 340 },
  'MED-7':  { x: 480, y: 380 },
  'BC-1':   { x: 360, y: 380 },
  'HZ-2':   { x: 420, y: 400 },
};

const CALL_POSITIONS = {
  '23-1042': { x: 360, y: 235 },
  '23-1043': { x: 400, y: 220 },
  '23-1044': { x: 540, y: 285 },
  '23-1045': { x: 370, y: 260 },
  '23-1046': { x: 625, y: 200 },
  '23-1047': { x: 680, y: 250 },
  '23-1048': { x: 380, y: 300 },
  '23-1049': { x: 600, y: 420 },
};

function statusColor(status) {
  return status === 'AVAILABLE' ? '#1ab858' :
    status === 'ENRT' || status === 'BUSY' ? '#bcA018' :
    status === 'ARRVD' ? '#4880c8' : '#384858';
}

function priBorderColor(p) {
  return p === 1 ? '#d83838' : p === 2 ? '#c06828' : p === 3 ? '#b09818' : '#249848';
}

export default function LiveMap() {
  const { state } = useCAD();
  const { officers, calls } = state;

  const [showUnits, setShowUnits] = useState(true);
  const [showCalls, setShowCalls] = useState(true);
  const [hover, setHover] = useState(null);

  const onDuty = officers.filter(o => o.status !== 'OFFDUTY');
  const activeCalls = calls.filter(c => c.status !== 'CLOSED');

  return (
    <div style={{ ...S_PAGE, padding: 8, gap: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 8, flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Map */}
        <div style={{ ...S_PANEL, flex: 1, position: 'relative', overflow: 'hidden' }}>
          <div className={S_PANEL_HEADER}>
            <div className={S_PANEL_TITLE}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--st-av-text)', boxShadow: '0 0 5px var(--st-av-text)', display: 'inline-block' }} />
              Live Situational Map
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {[
                { label: 'Units', active: showUnits, toggle: () => setShowUnits(v => !v) },
                { label: 'Calls', active: showCalls, toggle: () => setShowCalls(v => !v) },
              ].map(l => (
                <button key={l.label}
                  style={xs(l.active ? S_BTN_PRIMARY : S_BTN_SECONDARY)}
                 
                  onClick={l.toggle}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#050e1c' }}>
            <svg width="100%" height="100%" viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ display: 'block' }}>
              {/* Background */}
              <rect width={MAP_W} height={MAP_H} fill="#050e1c"/>

              {/* Grid lines */}
              {Array.from({ length: 20 }, (_, i) => (
                <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={MAP_H} stroke="#091828" strokeWidth="0.5"/>
              ))}
              {Array.from({ length: 14 }, (_, i) => (
                <line key={`h${i}`} x1={0} y1={i * 40} x2={MAP_W} y2={i * 40} stroke="#091828" strokeWidth="0.5"/>
              ))}

              {/* Water body */}
              <ellipse cx={200} cy={420} rx={140} ry={100} fill="#061422" stroke="#0c2840" strokeWidth="1"/>
              <text x={200} y={425} textAnchor="middle" fill="#0c3050" fontSize="11" fontFamily="var(--font-ui)" fontWeight="600">TAMPA BAY</text>

              {/* Roads */}
              {ROADS.map(r => (
                <g key={r.id}>
                  <line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke={r.color} strokeWidth="4"/>
                  <line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#081c34" strokeWidth="1.5" strokeDasharray="8 6"/>
                </g>
              ))}

              {/* Road labels */}
              {ROADS.map(r => (
                <text key={`${r.id}-lbl`}
                  x={(r.x1 + r.x2) / 2 + 6}
                  y={(r.y1 + r.y2) / 2 - 6}
                  fill="#1a4068"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  fontWeight="700">
                  {r.label}
                </text>
              ))}

              {/* Region overlays */}
              {REGIONS.map(reg => (
                <g key={reg.id}>
                  <rect x={reg.x} y={reg.y} width={reg.w} height={reg.h}
                    fill="rgba(13,84,146,0.06)" stroke="#0d3858" strokeWidth="0.8" rx="3"/>
                  <text x={reg.x + reg.w / 2} y={reg.y + 14} textAnchor="middle"
                    fill="#0c3060" fontSize="8.5" fontFamily="var(--font-mono)" fontWeight="700" letterSpacing="1">
                    {reg.label}
                  </text>
                </g>
              ))}

              {/* Call markers */}
              {showCalls && activeCalls.map(call => {
                const pos = CALL_POSITIONS[call.id] || { x: 400 + Math.random() * 100 - 50, y: 250 + Math.random() * 100 - 50 };
                const bc = priBorderColor(call.priority);
                const isHovered = hover === `call-${call.id}`;
                return (
                  <g key={call.id}
                    onMouseEnter={() => setHover(`call-${call.id}`)}
                    onMouseLeave={() => setHover(null)}
                    style={{ cursor: 'pointer' }}>
                    <circle cx={pos.x} cy={pos.y} r={isHovered ? 10 : 7}
                      fill={`${bc}22`} stroke={bc} strokeWidth="1.5"/>
                    <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill={bc} fontSize="8" fontFamily="var(--font-mono)" fontWeight="700">
                      P{call.priority}
                    </text>
                    {isHovered && (
                      <g>
                        <rect x={pos.x + 12} y={pos.y - 22} width={140} height={38} fill="#0c1828" stroke={bc} strokeWidth="1" rx="3"/>
                        <text x={pos.x + 82} y={pos.y - 9} textAnchor="middle" fill={bc} fontSize="9" fontFamily="var(--font-mono)" fontWeight="700">{call.id}</text>
                        <text x={pos.x + 82} y={pos.y + 4} textAnchor="middle" fill="#8ab0c8" fontSize="8.5" fontFamily="var(--font-ui)">{call.nature}</text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Unit markers */}
              {showUnits && onDuty.map(o => {
                const pos = UNIT_POSITIONS[o.unitId] || { x: 350 + (o.id * 23 % 80), y: 230 + (o.id * 17 % 60) };
                const sc = statusColor(o.status);
                const isHovered = hover === `unit-${o.id}`;
                return (
                  <g key={o.id}
                    onMouseEnter={() => setHover(`unit-${o.id}`)}
                    onMouseLeave={() => setHover(null)}
                    style={{ cursor: 'pointer' }}>
                    <rect x={pos.x - 14} y={pos.y - 8} width={28} height={16}
                      fill="#0a1622" stroke={sc} strokeWidth="1.2" rx="2"/>
                    <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill={sc} fontSize="7.5" fontFamily="var(--font-mono)" fontWeight="700">
                      {o.unitId.length > 6 ? o.unitId.slice(0,6) : o.unitId}
                    </text>
                    {isHovered && (
                      <g>
                        <rect x={pos.x + 16} y={pos.y - 24} width={130} height={46} fill="#0c1828" stroke={sc} strokeWidth="1" rx="3"/>
                        <text x={pos.x + 81} y={pos.y - 11} textAnchor="middle" fill={sc} fontSize="9" fontFamily="var(--font-mono)" fontWeight="700">{o.unitId}</text>
                        <text x={pos.x + 81} y={pos.y + 1} textAnchor="middle" fill="#8ab0c8" fontSize="8.5" fontFamily="var(--font-ui)">{o.name}</text>
                        <text x={pos.x + 81} y={pos.y + 12} textAnchor="middle" fill={sc} fontSize="8" fontFamily="var(--font-mono)">{o.status}</text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Compass */}
              <g transform={`translate(${MAP_W - 40}, 40)`}>
                <circle cx={0} cy={0} r={16} fill="none" stroke="#0d2840" strokeWidth="1"/>
                <text x={0} y={-20} textAnchor="middle" fill="#1a3858" fontSize="8" fontFamily="var(--font-ui)" fontWeight="700">N</text>
                <line x1={0} y1={-12} x2={0} y2={12} stroke="#0d2840" strokeWidth="0.8"/>
                <line x1={-12} y1={0} x2={12} y2={0} stroke="#0d2840" strokeWidth="0.8"/>
              </g>
            </svg>
          </div>
        </div>

        {/* Right: Legend + Unit list */}
        <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Legend */}
          <div style={{ ...S_PANEL, flexShrink: 0 }}>
            <div className={S_PANEL_HEADER}>
              <div className={S_PANEL_TITLE}>Legend</div>
            </div>
            <div style={{ padding: '8px 10px' }}>
              <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Unit Status</div>
              {[
                { label: 'Available', color: '#1ab858' },
                { label: 'Responding', color: '#bca018' },
                { label: 'On Scene', color: '#4880c8' },
                { label: 'Off Duty', color: '#384858' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, border: `1.5px solid ${l.color}`, flexShrink: 0, background: `${l.color}22` }} />
                  <span style={{ fontSize: 10, color: 'var(--n-text-dim)' }}>{l.label}</span>
                </div>
              ))}
              <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', margin: '8px 0 6px' }}>Incident Priority</div>
              {[
                { label: 'P1 — Critical', color: '#d83838' },
                { label: 'P2 — High', color: '#c06828' },
                { label: 'P3 — Medium', color: '#b09818' },
                { label: 'P4 — Low', color: '#249848' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', border: `1.5px solid ${l.color}`, flexShrink: 0, background: `${l.color}22` }} />
                  <span style={{ fontSize: 10, color: 'var(--n-text-dim)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Unit list */}
          <div style={{ ...S_PANEL, flex: 1 }}>
            <div className={S_PANEL_HEADER}>
              <div className={S_PANEL_TITLE}>On-Duty Units</div>
              <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{onDuty.length}</span>
            </div>
            <div className={S_PANEL_BODY}>
              {onDuty.map(o => (
                <div key={o.id} className={S_UNIT_ROW}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor(o.status), flexShrink: 0 }} />
                  <span style={{ ...S_DATA, minWidth: 42, fontSize: 10, color: '#6ab4d8' }}>{o.unitId}</span>
                  <span style={{ flex: 1, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active calls list */}
          <div style={{ ...S_PANEL, maxHeight: 160, flexShrink: 0 }}>
            <div className={S_PANEL_HEADER}>
              <div className={S_PANEL_TITLE}>Active Calls</div>
              <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{activeCalls.length}</span>
            </div>
            <div className={S_PANEL_BODY}>
              {activeCalls.map(c => (
                <div key={c.id} style={{ padding: '4px 8px', borderBottom: '1px solid var(--n-border-faint)', display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: priBorderColor(c.priority) }} />
                  <span style={{ ...S_DATA, fontSize: 9, minWidth: 52 }}>{c.id}</span>
                  <span style={{ fontSize: 10, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--n-text-dim)' }}>{c.nature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
