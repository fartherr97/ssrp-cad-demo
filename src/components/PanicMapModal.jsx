import { MdSos, MdClose, MdLocationOn, MdPerson, MdBadge } from 'react-icons/md';
import { useCAD } from '../store/cadStore';

// GTA V world space → 0-100% position on map canvas
// Real transform: replace with calibrated values once live tile server is wired up
const W_X_MIN = -3200, W_X_RANGE = 7700;  // world X ∈ [-3200, 4500]
const W_Y_MAX = 7200,  W_Y_RANGE = 10600; // world Y ∈ [-3400, 7200], inverted

const toMapPct = (wx, wy) => ({
  x: Math.max(2, Math.min(97, ((wx - W_X_MIN) / W_X_RANGE) * 100)),
  y: Math.max(2, Math.min(97, ((W_Y_MAX - wy)  / W_Y_RANGE) * 100)),
});

// Simplified GTA V geography as SVG shapes (viewBox "0 0 100 100")
function MapSVG({ pinX, pinY }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ display: 'block' }}
    >
      {/* ── Ocean / water background ── */}
      <rect width="100" height="100" fill="#060e1c" />

      {/* ── Main landmass (Blaine County + LS peninsula) ── */}
      <polygon
        fill="#0c1a0f"
        points="10,100 8,88 7,74 9,60 14,46 22,34 28,24 33,14 38,7 44,4 54,4 64,7 74,13 82,20 88,30 87,42 82,52 76,58 70,64 64,70 58,76 54,84 56,92 54,100"
      />

      {/* ── Urban core — Los Santos ── */}
      <rect x="30" y="69" width="22" height="17" rx="1.5" fill="#192a3e" opacity="0.9" />
      {/* Vinewood hills */}
      <rect x="28" y="62" width="14" height="11" rx="1" fill="#111d0d" />
      {/* LSIA airport strip */}
      <rect x="20" y="83" width="16" height="8"  rx="1" fill="#141f30" />
      {/* Elysian Island / port */}
      <rect x="17" y="88" width="12" height="8"  rx="1" fill="#111e2e" />

      {/* ── Alamo Sea ── */}
      <ellipse cx="64" cy="46" rx="8" ry="5" fill="#07121e" />

      {/* ── Sandy Shores area ── */}
      <rect x="58" y="30" width="14" height="10" rx="1" fill="#181c0c" />
      {/* ── Grand Senora Desert ── */}
      <rect x="44" y="36" width="26" height="22" rx="1" fill="#121810" opacity="0.7"/>
      {/* ── Mount Chiliad ── */}
      <polygon points="53,20 58,32 48,32" fill="#0e1a0b" />
      {/* ── Paleto Bay coast ── */}
      <rect x="34" y="5"  width="14" height="8"  rx="1" fill="#172438" />

      {/* ── Major roads ── */}
      {/* N-S freeway through LS */}
      <polyline points="41,100 42,88 43,78 44,70 44,58 43,44 42,30 41,16 40,8 39,5"
        stroke="#1a3050" strokeWidth="0.7" fill="none" />
      {/* E-W Route 68 through Harmony */}
      <polyline points="10,52 22,50 36,49 50,48 65,47 80,47 95,47"
        stroke="#1a3050" strokeWidth="0.6" fill="none" />
      {/* Coastal highway S */}
      <polyline points="10,62 11,70 12,80 14,88 16,95 17,100"
        stroke="#162840" strokeWidth="0.5" fill="none" />

      {/* ── Subtle grid ── */}
      {[10,20,30,40,50,60,70,80,90].map(n => (
        <g key={n}>
          <line x1={n} y1="0" x2={n} y2="100" stroke="rgba(255,255,255,0.035)" strokeWidth="0.25" />
          <line x1="0" y1={n} x2="100" y2={n}  stroke="rgba(255,255,255,0.035)" strokeWidth="0.25" />
        </g>
      ))}

      {/* ── Zone labels ── */}
      {[
        { t: 'LOS SANTOS',   x: 41,  y: 83 },
        { t: 'SANDY SHORES', x: 63,  y: 37 },
        { t: 'PALETO BAY',   x: 41,  y: 11 },
        { t: 'ALAMO SEA',    x: 60,  y: 48 },
        { t: 'BLAINE CO.',   x: 56,  y: 22 },
      ].map(({ t, x, y }) => (
        <text key={t} x={x} y={y} textAnchor="middle"
          fontSize="2.4" fontFamily="monospace" fontWeight="700"
          fill="rgba(255,255,255,0.22)" letterSpacing="0.3">
          {t}
        </text>
      ))}

      {/* ── Officer panic pin ── */}
      {pinX !== undefined && pinY !== undefined && (
        <g transform={`translate(${pinX}, ${pinY})`}>
          {/* Sonar rings */}
          <circle r="6" fill="none" stroke="#ef4444" strokeWidth="0.5" opacity="0.5">
            <animate attributeName="r" from="3" to="10" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.7" to="0" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle r="4" fill="none" stroke="#ef4444" strokeWidth="0.5" opacity="0.4">
            <animate attributeName="r" from="2" to="7" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.6" to="0" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
          </circle>
          {/* Pin dot */}
          <circle r="2.2" fill="#ef4444" />
          <circle r="1"   fill="#fff" />
        </g>
      )}
    </svg>
  );
}

export default function PanicMapModal() {
  const { state, dispatch } = useCAD();
  const { panicAlert } = state;

  if (!panicAlert) return null;

  const dismiss = () => dispatch({ type: 'DISMISS_PANIC_MAP' });

  const hasCoords = panicAlert.x !== undefined && panicAlert.y !== undefined;
  const pin = hasCoords ? toMapPct(panicAlert.x, panicAlert.y) : null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-[500px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ border: '1px solid rgba(239,68,68,0.45)', background: '#0a1628' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)' }}>
          <span className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
            style={{ background: 'rgba(239,68,68,0.2)' }}>
            <MdSos size={20} className="text-red-400" style={{ animation: 'blink 1s step-end infinite' }} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-extrabold uppercase tracking-[1px] text-red-400 mb-0.5">
              Officer Panic — All Units Respond
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-300">
              <span className="flex items-center gap-1">
                <MdBadge size={12} className="text-slate-500" />
                {panicAlert.unit || 'UNIT'}
              </span>
              {panicAlert.name && (
                <span className="flex items-center gap-1">
                  <MdPerson size={12} className="text-slate-500" />
                  {panicAlert.name}
                </span>
              )}
              <span className="ml-auto font-mono text-slate-500">{panicAlert.time}</span>
            </div>
          </div>
          <button onClick={dismiss}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] cursor-pointer transition-colors">
            <MdClose size={16} />
          </button>
        </div>

        {/* ── Map ── */}
        <div className="relative" style={{ aspectRatio: '1 / 1' }}>
          <MapSVG pinX={pin?.x} pinY={pin?.y} />

          {/* ── Coordinate readout overlay ── */}
          {hasCoords && (
            <div className="absolute bottom-2 left-2 font-mono text-[10px] px-2 py-1 rounded"
              style={{ background: 'rgba(0,0,0,0.65)', color: 'rgba(255,255,255,0.55)' }}>
              X: {panicAlert.x.toFixed(1)} &nbsp; Y: {panicAlert.y.toFixed(1)}
              {panicAlert.z !== undefined && <> &nbsp; Z: {panicAlert.z.toFixed(1)}</>}
            </div>
          )}

          {/* ── Area label overlay ── */}
          {panicAlert.location && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] px-2 py-1 rounded"
              style={{ background: 'rgba(0,0,0,0.65)', color: 'rgba(239,68,68,0.9)' }}>
              <MdLocationOn size={12} />
              {panicAlert.location}
            </div>
          )}

          {/* ── "MOCKUP" watermark — remove once live map image is wired ── */}
          <div className="absolute top-2 right-2 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.2)' }}>
            demo map
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.2)' }}>
          <span className="text-[10px] text-slate-600 font-mono">
            SSRP CAD · PANIC LOCATION · {panicAlert.id}
          </span>
          <button onClick={dismiss}
            className="btn-glossy inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer bg-red-500/20 text-red-300 hover:bg-red-500/30 border-transparent">
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
