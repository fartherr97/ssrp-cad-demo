import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCAD } from '../store/cadStore';
import { OFFICERS } from '../data/mockData';
import { PORTALS } from '../constants/portals';
import { MdAdminPanelSettings, MdLocalPolice, MdPeopleAlt, MdStorefront, MdLocalFireDepartment, MdHeadsetMic } from 'react-icons/md';
import SiteFooter from '../components/SiteFooter';

const ROLE_ICONS = {
  admin:    MdAdminPanelSettings,
  leo:      MdLocalPolice,
  civilian: MdPeopleAlt,
  business: MdStorefront,
  fire:     MdLocalFireDepartment,
  dispatch: MdHeadsetMic,
};

const ROLES = [
  {
    id: 'admin', label: 'Admin', route: '/admin',
    color: '#c09010', bg: 'rgba(160,120,8,0.12)', border: 'rgba(160,120,8,0.35)',
    deptShorts: ['TPD'],
  },
  {
    id: 'leo', label: 'Law Enforcement', route: '/cad',
    color: '#3a88e8', bg: 'rgba(58,136,232,0.12)', border: 'rgba(58,136,232,0.35)',
    deptShorts: ['TPD', 'HCSO', 'FHP'],
  },
  {
    id: 'civilian', label: 'Civilian', route: '/civilians',
    color: '#9090cc', bg: 'rgba(144,144,204,0.12)', border: 'rgba(144,144,204,0.35)',
    deptShorts: [],
  },
  {
    id: 'business', label: 'Business', route: '/civilians',
    color: '#44aacc', bg: 'rgba(68,170,204,0.12)', border: 'rgba(68,170,204,0.35)',
    deptShorts: [],
  },
  {
    id: 'fire', label: 'Fire & EMS', route: '/fire',
    color: '#e04020', bg: 'rgba(224,64,32,0.12)', border: 'rgba(224,64,32,0.35)',
    deptShorts: ['HCFR'],
  },
  {
    id: 'dispatch', label: 'Dispatch', route: '/cad',
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
  const { state, dispatch } = useCAD();
  const navigate = useNavigate();
  const connected = state.discordConnected;
  const [loading, setLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);

  // Resolve a stable Discord account identity for this browser. In a real
  // deployment this comes from the Discord OAuth callback; here we persist a
  // mock account so per-account flags (like the guided tour) survive refreshes.
  const getDiscordAccount = () => {
    const KEY = 'ssrp_discord_account';
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    const id = (crypto?.randomUUID?.() || `disc-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const account = { id, username: 'SSRP Member' };
    try { localStorage.setItem(KEY, JSON.stringify(account)); } catch { /* ignore */ }
    return account;
  };

  const handleConnect = () => {
    setConnectLoading(true);
    setTimeout(() => {
      setConnectLoading(false);
      dispatch({ type: 'CONNECT_DISCORD', payload: getDiscordAccount() });
    }, 600);
  };

  const handleRoleSelect = (role) => {
    setLoading(role.id);
    setTimeout(() => {
      const portal = PORTALS[role.id];
      let user;
      if (role.id === 'civilian' || role.id === 'business') {
        // Citizen-facing portals * not tied to an officer record.
        user = {
          id: role.id === 'civilian' ? 'self-civ' : 'self-biz',
          name: 'Jordan Maxwell',
          role: role.id,
          badge: role.id === 'civilian' ? 'CIV' : 'BIZ',
          deptShort: role.id === 'civilian' ? 'CIV' : 'BIZ',
        };
      } else {
        // Emergency-service portals log in as a representative officer.
        const officer = OFFICERS.find(o =>
          role.deptShorts.length === 0 ? true : role.deptShorts.includes(o.deptShort)
        ) || OFFICERS[0];
        user = { ...officer };
      }
      dispatch({ type: 'LOGIN', payload: { ...user, portal: role.id } });
      navigate(portal?.landing || role.route, { replace: true });
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
      <header className="relative z-10 w-full shrink-0 bg-[rgba(4,10,24,0.92)] border-b border-white/[0.08] backdrop-blur-[8px] flex items-center px-4 sm:px-8 h-[52px] sm:h-[60px] gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" className="w-8 h-8 sm:w-9 sm:h-9" />
          <div>
            <div className="text-[13px] sm:text-[15px] font-extrabold text-white leading-tight tracking-[-0.2px]">
              Sunshine State <span className="text-[#ff8822]">RP</span>
            </div>
            <div className="text-[9px] sm:text-[10px] font-semibold text-[rgba(120,160,220,0.6)] tracking-[1.2px] uppercase">
              Computer Aided Dispatch
            </div>
          </div>
        </div>

        {/* Right * connect */}
        <div className="ml-auto flex items-center gap-3 sm:gap-5">
          {!connected && (
            <button
              onClick={handleConnect}
              disabled={connectLoading}
              className="flex items-center gap-2 px-3 sm:px-[18px] py-2 text-[12px] sm:text-[13px] font-bold bg-[#5865F2] text-white border-none rounded-md cursor-pointer transition-opacity disabled:opacity-70"
            >
              <DiscordSVG />
              <span className="hidden sm:inline">{connectLoading ? 'Connecting...' : 'Connect'}</span>
            </button>
          )}
          {connected && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: '#22ff66', animation: 'connectedGlow 2.4s ease-in-out infinite' }} />
              <span className="text-[11px] sm:text-[12px] font-semibold text-[#22ff66]">
                <span className="hidden sm:inline">Discord </span>Connected
              </span>
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
            Unified Platform for Emergency Services and Civilian Operations
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
              Demo environment * select your role after connecting
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
                {ROLES.map(role => {
                  const RoleIcon = ROLE_ICONS[role.id];
                  const isActive = loading === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role)}
                      disabled={!!loading}
                      style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        gap: 12, padding: '22px 12px',
                        background: isActive ? role.bg : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isActive ? role.border : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 10, cursor: 'pointer',
                        transition: 'all 0.15s',
                        opacity: loading && !isActive ? 0.4 : 1,
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
                      <RoleIcon size={42} color={isActive ? role.color : 'rgba(180,210,240,0.55)'} />
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: isActive ? role.color : 'rgba(200,220,240,0.85)',
                        textAlign: 'center', lineHeight: 1.2,
                      }}>
                        {isActive ? 'Loading...' : role.label}
                      </span>
                    </button>
                  );
                })}
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

      <SiteFooter />
    </div>
  );
}
