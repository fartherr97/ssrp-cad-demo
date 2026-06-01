import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCAD } from '../store/cadStore';
import { OFFICERS } from '../data/mockData';

const ROLES = [
  {
    id: 'admin', label: 'Admin', icon: '⚙', route: '/admin',
    color: '#c09010', bg: 'rgba(160,120,8,0.12)', border: 'rgba(160,120,8,0.35)',
    deptShorts: ['TPD'],
  },
  {
    id: 'leo', label: 'Law Enforcement', icon: '⭐', route: '/cad',
    color: '#3a88e8', bg: 'rgba(58,136,232,0.12)', border: 'rgba(58,136,232,0.35)',
    deptShorts: ['TPD', 'HCSO', 'FHP'],
  },
  {
    id: 'civilian', label: 'Civilian', icon: '👤', route: '/civilians',
    color: '#9090cc', bg: 'rgba(144,144,204,0.12)', border: 'rgba(144,144,204,0.35)',
    deptShorts: [],
  },
  {
    id: 'business', label: 'Business', icon: '🏢', route: '/civilians',
    color: '#44aacc', bg: 'rgba(68,170,204,0.12)', border: 'rgba(68,170,204,0.35)',
    deptShorts: [],
  },
  {
    id: 'fire', label: 'Fire & EMS', icon: '🔥', route: '/fire',
    color: '#e04020', bg: 'rgba(224,64,32,0.12)', border: 'rgba(224,64,32,0.35)',
    deptShorts: ['HCFR'],
  },
  {
    id: 'dispatch', label: 'Dispatch', icon: '📡', route: '/cad',
    color: '#3aaa44', bg: 'rgba(58,170,68,0.12)', border: 'rgba(58,170,68,0.35)',
    deptShorts: ['FDOT'],
  },
];

const DiscordSVG = () => (
  <svg width="20" height="16" viewBox="0 0 71 55" fill="currentColor">
    <path d="M60.1 4.9A58.5 58.5 0 0045.8 1a40 40 0 00-1.8 3.7 54.1 54.1 0 00-16.1 0A40.3 40.3 0 0026.1 1 58.6 58.6 0 0011.8 4.9C1.7 19.7-1 34.1.3 48.3A59 59 0 0018 55.5a44.3 44.3 0 003.8-6.2 38.3 38.3 0 01-6-2.9l1.4-1.1a42.1 42.1 0 0036.2 0l1.5 1.1a38.1 38.1 0 01-6 2.9 44.6 44.6 0 003.8 6.2 58.7 58.7 0 0018.1-7.2C72 34 68.7 19.7 60.1 4.9zM23.7 39.8c-3.5 0-6.3-3.2-6.3-7.1s2.8-7.1 6.3-7.1c3.5 0 6.4 3.2 6.3 7.1 0 3.9-2.8 7.1-6.3 7.1zm23.6 0c-3.5 0-6.3-3.2-6.3-7.1s2.8-7.1 6.3-7.1c3.5 0 6.4 3.2 6.3 7.1 0 3.9-2.8 7.1-6.3 7.1z" />
  </svg>
);

export default function LoginPage() {
  const { dispatch } = useCAD();
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);

  const handleConnect = () => {
    setConnectLoading(true);
    setTimeout(() => {
      setConnectLoading(false);
      setConnected(true);
    }, 600);
  };

  const handleRoleSelect = (role) => {
    setLoading(role.id);
    setTimeout(() => {
      const officer = OFFICERS.find(o =>
        role.deptShorts.length === 0 ? true : role.deptShorts.includes(o.deptShort)
      ) || OFFICERS[0];
      dispatch({ type: 'LOGIN', payload: officer });
      navigate(role.route, { replace: true });
    }, 350);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'radial-gradient(ellipse at 30% 10%, #0f2060 0%, #0a1535 30%, #050c1e 60%, #020810 100%)',
      fontFamily: "'Ubuntu', 'Segoe UI', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Background layers */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: [
          'radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)',
          'radial-gradient(ellipse at 80% 80%, rgba(30,80,160,0.12) 0%, transparent 50%)',
        ].join(', '),
      }} />
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* ── HEADER ── */}
      <header style={{
        position: 'relative', zIndex: 10,
        width: '100%', height: 60,
        background: 'rgba(4,10,24,0.92)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center',
        padding: '0 32px', gap: 16, flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" style={{ width: 36, height: 36 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.2px' }}>
              Sunshine State <span style={{ color: '#ff8822' }}>RP</span>
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(120,160,220,0.6)', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              Computer Aided Dispatch
            </div>
          </div>
        </div>

        {/* Right — status dots */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          {[
            { label: 'CAD', color: '#22ff66' },
            { label: 'MDT', color: '#22ff66' },
            { label: 'RADIO', color: '#22ff66' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(180,210,240,0.5)', letterSpacing: '0.5px' }}>{s.label}</span>
            </div>
          ))}

          {/* Connect Discord button in header */}
          {!connected && (
            <button
              onClick={handleConnect}
              disabled={connectLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 18px', fontSize: 13, fontWeight: 700,
                background: '#5865F2', color: '#ffffff',
                border: 'none', borderRadius: 6, cursor: 'pointer',
                opacity: connectLoading ? 0.7 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              <DiscordSVG />
              {connectLoading ? 'Connecting...' : 'Connect'}
            </button>
          )}
          {connected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22ff66', boxShadow: '0 0 6px #22ff66' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#22ff66' }}>Discord Connected</span>
            </div>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1, padding: '40px 16px',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: '100%', maxWidth: connected ? 680 : 440, gap: 0,
          transition: 'max-width 0.3s ease',
        }}>

          {/* Logo */}
          <img
            src="https://cdn.ssrp.us/images/ssrp.png"
            alt="SSRP"
            style={{ width: 100, height: 100, marginBottom: 20, animation: 'floatY 3s ease-in-out infinite' }}
          />

          {/* Title */}
          <div style={{
            fontSize: 30, fontWeight: 800, color: '#ffffff', textAlign: 'center',
            letterSpacing: '-0.3px', lineHeight: 1.1, marginBottom: 6,
          }}>
            Sunshine State Roleplay
          </div>

          <div style={{
            fontSize: 17, fontWeight: 600, color: '#4db8ff', textAlign: 'center', marginBottom: 10,
          }}>
            Computer Aided Dispatch
          </div>

          <div style={{
            fontSize: 13, color: 'rgba(180,200,230,0.5)', textAlign: 'center',
            lineHeight: 1.6, marginBottom: 32, maxWidth: 360,
          }}>
            Unified platform for Emergency Services, Civilian Operations,
            and Command — TPD, HCSO, FHP, HCFR, FDOT, and Civ-Ops.
          </div>

          {/* ── BEFORE CONNECT: show big Discord button ── */}
          {!connected && (
            <button
              onClick={handleConnect}
              disabled={connectLoading}
              style={{
                width: '100%', maxWidth: 380,
                padding: '16px', fontSize: 16, fontWeight: 700,
                background: connectLoading ? 'rgba(88,101,242,0.6)' : '#5865F2',
                color: '#ffffff', border: 'none', borderRadius: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                boxShadow: '0 4px 28px rgba(88,101,242,0.45)',
                transition: 'opacity 0.15s',
                marginBottom: 16,
              }}
              onMouseEnter={e => { if (!connectLoading) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              <DiscordSVG />
              {connectLoading ? 'Connecting to Discord...' : 'Connect Discord'}
            </button>
          )}

          {/* Demo note */}
          {!connected && (
            <div style={{ fontSize: 11, color: 'rgba(120,160,200,0.4)', textAlign: 'center' }}>
              Demo environment — select your role after connecting
            </div>
          )}

          {/* ── AFTER CONNECT: show role selection ── */}
          {connected && (
            <div style={{ width: '100%', animation: 'fadeIn 0.25s ease-out' }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: 'rgba(150,190,230,0.55)',
                textAlign: 'center', letterSpacing: '1px', textTransform: 'uppercase',
                marginBottom: 18,
              }}>
                Select Your Role to Continue
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10, width: '100%',
              }}>
                {ROLES.map(role => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role)}
                    disabled={!!loading}
                    style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: 10, padding: '20px 12px',
                      background: loading === role.id ? role.bg : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${loading === role.id ? role.border : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 10, cursor: 'pointer',
                      transition: 'all 0.15s',
                      opacity: loading && loading !== role.id ? 0.4 : 1,
                    }}
                    onMouseEnter={e => {
                      if (!loading) {
                        e.currentTarget.style.background = role.bg;
                        e.currentTarget.style.borderColor = role.border;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!loading) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.transform = '';
                      }
                    }}
                  >
                    <span style={{ fontSize: 28, lineHeight: 1 }}>{role.icon}</span>
                    <span style={{
                      fontSize: 13, fontWeight: 700, color: loading === role.id ? role.color : 'rgba(200,220,240,0.85)',
                      textAlign: 'center', lineHeight: 1.2,
                    }}>
                      {loading === role.id ? 'Loading...' : role.label}
                    </span>
                  </button>
                ))}
              </div>

              <div style={{
                marginTop: 16, fontSize: 11, color: 'rgba(120,160,200,0.35)',
                textAlign: 'center',
              }}>
                Demo environment · All activity logged and subject to command review
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        position: 'relative', zIndex: 10,
        width: '100%',
        background: 'rgba(4,10,24,0.9)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(8px)',
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" style={{ width: 22, height: 22, opacity: 0.5 }} />
          <span style={{ fontSize: 11, color: 'rgba(120,160,200,0.45)' }}>
            © 2025 Sunshine State Roleplay · All rights reserved
          </span>
        </div>

        {/* Center — agency tags */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {[
            { abbr: 'TPD', color: '#3a78cc' },
            { abbr: 'HCSO', color: '#3aaa44' },
            { abbr: 'FHP', color: '#c8a050' },
            { abbr: 'HCFR', color: '#cc3333' },
            { abbr: 'FDOT', color: '#dd7820' },
          ].map(ag => (
            <span key={ag.abbr} style={{
              fontSize: 10, fontWeight: 700, color: ag.color,
              letterSpacing: '0.5px', opacity: 0.6,
            }}>{ag.abbr}</span>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(120,160,200,0.4)' }}>NEXUS CAD v2.0</span>
          <span style={{ fontSize: 11, color: 'rgba(120,160,200,0.4)' }}>Hillsborough County ECC</span>
          <span style={{ fontSize: 11, color: 'rgba(120,160,200,0.4)' }}>Status: <span style={{ color: '#22ff66' }}>Online</span></span>
        </div>
      </footer>
    </div>
  );
}
