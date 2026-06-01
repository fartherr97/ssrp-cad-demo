import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCAD } from '../store/cadStore';
import { OFFICERS } from '../data/mockData';

const AGENCIES = [
  { abbr: 'TPD',   label: 'Tampa PD',       color: '#3a78cc', bg: 'rgba(58,120,204,0.15)' },
  { abbr: 'HCSO',  label: 'Sheriff',         color: '#3aaa44', bg: 'rgba(58,170,68,0.15)'  },
  { abbr: 'FHP',   label: 'Highway Patrol',  color: '#c8a050', bg: 'rgba(200,160,80,0.15)' },
  { abbr: 'HCFR',  label: 'Fire Rescue',     color: '#cc3333', bg: 'rgba(204,51,51,0.15)'  },
  { abbr: 'FDOT',  label: 'Transportation',  color: '#dd7820', bg: 'rgba(221,120,32,0.15)' },
];

/* Generate a static star field via CSS box-shadow on a tiny element */
const STAR_STYLE = {
  position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
  background: [
    'radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.06) 0%, transparent 50%)',
    'radial-gradient(ellipse at 80% 80%, rgba(30,80,160,0.15) 0%, transparent 50%)',
    'radial-gradient(ellipse at 50% 0%, rgba(20,60,140,0.3) 0%, transparent 60%)',
  ].join(', '),
};

export default function LoginPage() {
  const { dispatch } = useCAD();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(OFFICERS[0].id);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const officer = OFFICERS.find(o => o.id === Number(selectedUser));
      if (officer) {
        dispatch({ type: 'LOGIN', payload: officer });
        navigate('/cad', { replace: true });
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 30% 10%, #0f2060 0%, #0a1535 30%, #050c1e 60%, #020810 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', padding: '24px 16px', position: 'relative', overflow: 'hidden',
      fontFamily: "'Ubuntu', sans-serif",
    }}>
      {/* Stars / depth layer */}
      <div style={STAR_STYLE} />

      {/* Subtle grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: '100%', maxWidth: 420, gap: 0,
      }}>
        {/* Logo */}
        <img
          src="https://cdn.ssrp.us/images/ssrp.png"
          alt="SSRP"
          style={{
            width: 110, height: 110, marginBottom: 20,
            animation: 'floatY 3s ease-in-out infinite',
          }}
        />

        {/* Title */}
        <div style={{
          fontSize: 28, fontWeight: 800, color: '#ffffff', textAlign: 'center',
          letterSpacing: '-0.3px', lineHeight: 1.15, marginBottom: 6,
          fontFamily: "'Ubuntu', sans-serif",
        }}>
          Sunshine State Roleplay
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 17, fontWeight: 600, color: '#4db8ff', textAlign: 'center',
          marginBottom: 10, fontFamily: "'Ubuntu', sans-serif",
        }}>
          Computer Aided Dispatch
        </div>

        {/* Description */}
        <div style={{
          fontSize: 13, color: 'rgba(180,200,230,0.55)', textAlign: 'center',
          lineHeight: 1.6, marginBottom: 28, maxWidth: 340,
          fontFamily: "'Ubuntu', sans-serif",
        }}>
          Unified platform for Emergency Services, Civilian Operations,
          and Command — TPD, HCSO, FHP, HCFR, FDOT, and Civ-Ops.
          All activity is logged and subject to command review.
        </div>

        {/* Officer selector */}
        <div style={{ width: '100%', marginBottom: 10 }}>
          <div style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.8px',
            textTransform: 'uppercase', color: 'rgba(150,180,220,0.6)',
            marginBottom: 6, fontFamily: "'Ubuntu', sans-serif",
          }}>
            Select Personnel · Demo Environment
          </div>
          <select
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
            style={{
              width: '100%', padding: '11px 14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, color: '#c8daf0',
              fontSize: 13, fontFamily: "'Ubuntu', sans-serif",
              outline: 'none', cursor: 'pointer', appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2360a0cc'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
            }}
          >
            {OFFICERS.map(o => (
              <option key={o.id} value={o.id} style={{ background: '#0a1535', color: '#c8daf0' }}>
                {o.badge} — {o.name} ({o.deptShort} · {o.rank})
              </option>
            ))}
          </select>
        </div>

        {/* Primary CTA */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', fontSize: 15, fontWeight: 700,
            background: loading ? 'rgba(220,120,20,0.6)' : 'linear-gradient(135deg, #e87820 0%, #d06010 100%)',
            color: '#ffffff', border: 'none', borderRadius: 8, cursor: 'pointer',
            fontFamily: "'Ubuntu', sans-serif", letterSpacing: '0.3px',
            boxShadow: '0 4px 24px rgba(220,100,20,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 10, transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          {loading ? (
            <span style={{ fontSize: 13 }}>Authenticating...</span>
          ) : (
            <>
              <span style={{ fontSize: 16 }}>⚡</span>
              Access CAD System
            </>
          )}
        </button>

        {/* Discord button */}
        <button
          onClick={handleLogin}
          style={{
            width: '100%', padding: '12px', fontSize: 13, fontWeight: 600,
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(180,210,240,0.8)', cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
            fontFamily: "'Ubuntu', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 28, transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        >
          <svg width="16" height="12" viewBox="0 0 71 55" fill="rgba(120,160,220,0.8)">
            <path d="M60.1 4.9A58.5 58.5 0 0045.8 1a40 40 0 00-1.8 3.7 54.1 54.1 0 00-16.1 0A40.3 40.3 0 0026.1 1 58.6 58.6 0 0011.8 4.9C1.7 19.7-1 34.1.3 48.3A59 59 0 0018 55.5a44.3 44.3 0 003.8-6.2 38.3 38.3 0 01-6-2.9l1.4-1.1a42.1 42.1 0 0036.2 0l1.5 1.1a38.1 38.1 0 01-6 2.9 44.6 44.6 0 003.8 6.2 58.7 58.7 0 0018.1-7.2C72 34 68.7 19.7 60.1 4.9zM23.7 39.8c-3.5 0-6.3-3.2-6.3-7.1s2.8-7.1 6.3-7.1c3.5 0 6.4 3.2 6.3 7.1 0 3.9-2.8 7.1-6.3 7.1zm23.6 0c-3.5 0-6.3-3.2-6.3-7.1s2.8-7.1 6.3-7.1c3.5 0 6.4 3.2 6.3 7.1 0 3.9-2.8 7.1-6.3 7.1z"/>
          </svg>
          Continue with Discord
        </button>

        {/* Agency badges */}
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {AGENCIES.map(ag => (
            <div key={ag.abbr} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 20,
              background: ag.bg,
              border: `1px solid ${ag.color}50`,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: ag.color, flexShrink: 0 }} />
              <span style={{
                fontSize: 11, fontWeight: 700, color: ag.color,
                fontFamily: "'Ubuntu', sans-serif", letterSpacing: '0.4px',
              }}>
                {ag.abbr}
              </span>
            </div>
          ))}
        </div>

        {/* Version footer */}
        <div style={{
          marginTop: 24, fontSize: 10, color: 'rgba(100,140,180,0.35)',
          textAlign: 'center', fontFamily: "'Ubuntu', sans-serif", letterSpacing: '0.3px',
        }}>
          SSRP CAD v3.0 · Hillsborough County ECC · All rights reserved
        </div>
      </div>
    </div>
  );
}
