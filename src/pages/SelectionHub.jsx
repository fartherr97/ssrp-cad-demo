import { useCAD } from '../store/cadStore';
import {
  FaUser, FaIdCard, FaGavel, FaShieldHalved, FaFireFlameCurved,
  FaKitMedical, FaTowerBroadcast, FaUsersGear, FaRightFromBracket,
} from 'react-icons/fa6';

// Each tile is a "direction" into the CAD. The page values map onto the
// existing router keys in App.jsx, so picking a module deep-links straight into
// the relevant workspace.
const MODULES = [
  { key: 'civilian', label: 'Civilian', desc: 'Character files & civilian records', Icon: FaUser, page: 'civilian', color: '#46c971' },
  { key: 'dmv', label: 'DMV', desc: 'Vehicle & license returns', Icon: FaIdCard, page: 'returns', color: '#2bc7d4' },
  { key: 'law', label: 'Law', desc: 'Penal code & statutes', Icon: FaGavel, page: 'penalcode', color: '#f5b740' },
  { key: 'police', label: 'Police', desc: 'Patrol CAD & mobile terminal', Icon: FaShieldHalved, page: 'dispatch', color: '#4aa3ff' },
  { key: 'fire', label: 'Fire', desc: 'HCFR fire & rescue board', Icon: FaFireFlameCurved, page: 'fire', color: '#f0883e' },
  { key: 'ems', label: 'EMS', desc: 'HCFR medical response', Icon: FaKitMedical, page: 'fire', color: '#e5484d' },
  { key: 'dispatch', label: 'Dispatch', desc: 'Console, units & call control', Icon: FaTowerBroadcast, page: 'console', color: '#b56cf0' },
  { key: 'admin', label: 'Admin', desc: 'Staff tools & administration', Icon: FaUsersGear, page: 'admin', color: '#f97316', adminOnly: true },
];

export default function SelectionHub() {
  const { state, dispatch } = useCAD();
  const { currentUser } = state;

  const tiles = MODULES.filter((m) => !m.adminOnly || currentUser?.role === 'admin');
  const open = (page) => dispatch({ type: 'SET_PAGE', payload: page });

  return (
    <div style={{
      minHeight: '100vh',
      background:
        'radial-gradient(1000px 520px at 50% -8%, #1c1f24 0%, rgba(28,31,36,0) 60%), linear-gradient(160deg, #131519 0%, #0c0d10 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Ubuntu', system-ui, sans-serif",
    }}>
      {/* ── Header ── */}
      <div style={{
        background: '#111216',
        borderBottom: '1px solid #2a2d33',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" style={{ height: '34px', width: 'auto' }} />
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px' }}>
              Sunshine State <span style={{ color: '#f97316' }}>RP</span>
            </div>
            <div style={{ color: '#6b7888', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Computer Aided Dispatch
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {currentUser && (
            <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
              <div style={{ color: '#d8dde4', fontSize: '12px', fontWeight: 600 }}>{currentUser.name}</div>
              <div style={{ color: '#f97316', fontSize: '10px' }}>{currentUser.rank} · {currentUser.deptShort}</div>
            </div>
          )}
          <button
            onClick={() => dispatch({ type: 'LOGOUT' })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'transparent', color: '#9aa3af', border: '1px solid #2e3138', borderRadius: '5px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
          >
            <FaRightFromBracket size={12} /> Sign Out
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '34px' }}>
          <div style={{ color: '#f4f6f8', fontSize: '28px', fontWeight: 700, letterSpacing: '3px' }}>
            SELECT A MODULE
          </div>
          <div style={{ color: '#8a93a0', fontSize: '13px', letterSpacing: '1.5px', marginTop: '6px', textTransform: 'uppercase' }}>
            Choose where you want to go
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: '16px',
          width: '100%',
          maxWidth: '820px',
        }}>
          {tiles.map((m) => (
            <ModuleCard key={m.key} module={m} onClick={() => open(m.page)} />
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        background: '#0c0d10',
        borderTop: '1px solid #2a2d33',
        padding: '0 24px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color: '#3a4250', fontSize: '12px' }}>
          Sunshine State Roleplay • Computer Aided Dispatch
        </span>
      </div>
    </div>
  );
}

function ModuleCard({ module, onClick }) {
  const { label, desc, Icon, color } = module;
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        textAlign: 'left',
        background: 'linear-gradient(180deg, #1c1e23, #15161a)',
        border: '1px solid #2e3138',
        borderLeft: `4px solid ${color}`,
        borderRadius: '8px',
        padding: '18px 18px',
        cursor: 'pointer',
        transition: 'transform 0.12s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 10px 26px rgba(0,0,0,0.5), 0 0 0 1px ${color}55`;
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.35)';
        e.currentTarget.style.borderColor = '#2e3138';
      }}
    >
      <span style={{
        width: '48px',
        height: '48px',
        flexShrink: 0,
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `${color}1f`,
        border: `1px solid ${color}55`,
        color,
        fontSize: '22px',
      }}>
        <Icon />
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', color: '#f4f6f8', fontSize: '17px', fontWeight: 700, letterSpacing: '0.3px' }}>{label}</span>
        <span style={{ display: 'block', color: '#8a93a0', fontSize: '12px', marginTop: '2px' }}>{desc}</span>
      </span>
    </button>
  );
}
