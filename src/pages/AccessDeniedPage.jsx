import { useLocation, useNavigate } from 'react-router-dom';
import { useCAD } from '../store/cadStore';
import { MdArrowBack, MdLock } from 'react-icons/md';

const DiscordSVG = () => (
  <svg width="18" height="14" viewBox="0 0 71 55" fill="currentColor">
    <path d="M60.1 4.9A58.5 58.5 0 0045.8 1a40 40 0 00-1.8 3.7 54.1 54.1 0 00-16.1 0A40.3 40.3 0 0026.1 1 58.6 58.6 0 0011.8 4.9C1.7 19.7-1 34.1.3 48.3A59 59 0 0018 55.5a44.3 44.3 0 003.8-6.2 38.3 38.3 0 01-6-2.9l1.4-1.1a42.1 42.1 0 0036.2 0l1.5 1.1a38.1 38.1 0 01-6 2.9 44.6 44.6 0 003.8 6.2 58.7 58.7 0 0018.1-7.2C72 34 68.7 19.7 60.1 4.9zM23.7 39.8c-3.5 0-6.3-3.2-6.3-7.1s2.8-7.1 6.3-7.1c3.5 0 6.4 3.2 6.3 7.1 0 3.9-2.8 7.1-6.3 7.1zm23.6 0c-3.5 0-6.3-3.2-6.3-7.1s2.8-7.1 6.3-7.1c3.5 0 6.4 3.2 6.3 7.1 0 3.9-2.8 7.1-6.3 7.1z" />
  </svg>
);

const ERROR_CONFIGS = {
  AUTH_ROLE_MISSING: {
    message: (portal) => `Your Discord account doesn't have any roles that associate you as a ${portal || 'Staff'} member on this portal.`,
    tip: 'If you believe this is a mistake, please reach out to your supervisor directly in the Discord server.',
  },
  AUTH_PORTAL_RESTRICTED: {
    message: (portal) => `You are not authorized to access the ${portal || 'requested'} section.`,
    tip: 'Contact your department head or server administrator to request access.',
  },
  AUTH_BANNED: {
    message: () => 'Your account has been suspended from this platform.',
    tip: 'If you believe this is an error, open a support ticket in the Discord server.',
  },
};

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useCAD();
  // Computed per render so the footer reflects the denial time, not bundle load.
  const today = new Date().toISOString().split('T')[0];

  const { code = 'AUTH_ROLE_MISSING', portal = '', reason } = location.state || {};
  const cfg = ERROR_CONFIGS[code] || ERROR_CONFIGS.AUTH_ROLE_MISSING;
  const message = reason || cfg.message(portal);
  const tip = cfg.tip;

  const handleReturnHome = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/', { replace: true });
  };

  const handleReconnect = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/', { replace: true });
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'radial-gradient(ellipse at 40% 0%, #1a0a40 0%, #0d0520 30%, #060210 60%, #020108 100%)',
      fontFamily: "'Ubuntu', 'Segoe UI', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.008) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.008) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      {/* Purple glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at 50% 30%, rgba(120,60,220,0.18) 0%, transparent 60%)',
      }} />

      {/* ── HEADER ── */}
      <header style={{
        position: 'relative', zIndex: 10, width: '100%', flexShrink: 0,
        background: 'rgba(4,2,14,0.90)', borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
        padding: '0 24px', height: 56, gap: 12,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" style={{ width: 32, height: 32 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.2px' }}>
              Sunshine State <span style={{ color: '#ff8822' }}>RP</span>
            </div>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(120,160,220,0.55)', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              Computer Aided Dispatch
            </div>
          </div>
        </div>

        {/* ACCESS RESTRICTED badge */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7,
          background: 'rgba(200,30,30,0.15)', border: '1px solid rgba(200,30,30,0.4)',
          borderRadius: 20, padding: '5px 14px',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: '#ef4444',
            boxShadow: '0 0 6px #ef4444',
            animation: 'pulse 1.5s ease-in-out infinite',
            display: 'inline-block',
          }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f87171', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Access Restricted
          </span>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1, padding: '48px 24px',
      }}>
        <div style={{
          width: '100%', maxWidth: 860,
          display: 'flex', alignItems: 'center', gap: 56,
          flexWrap: 'wrap', justifyContent: 'center',
        }}>

          {/* Mascot/icon panel */}
          <div style={{
            width: 200, height: 200, flexShrink: 0,
            background: 'rgba(120,60,220,0.10)',
            border: '1px solid rgba(120,60,220,0.25)',
            borderRadius: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 60px rgba(120,60,220,0.15), inset 0 0 40px rgba(120,60,220,0.08)',
            position: 'relative',
          }}>
            {/* Inner glow ring */}
            <div style={{
              position: 'absolute', inset: 16,
              borderRadius: 16,
              background: 'radial-gradient(circle, rgba(120,60,220,0.15) 0%, transparent 70%)',
            }} />
            <MdLock size={96} style={{ color: 'rgba(160,100,255,0.7)', position: 'relative', zIndex: 1 }} />
          </div>

          {/* Text content */}
          <div style={{ flex: 1, minWidth: 280 }}>
            {/* Error label */}
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
              color: '#6090e8', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 28, height: 2, background: '#6090e8', borderRadius: 1 }} />
              Error 403
            </div>

            {/* Headline */}
            <div style={{ marginBottom: 20, lineHeight: 1.05 }}>
              <span style={{ fontSize: 58, fontWeight: 900, color: '#ffffff', display: 'block', letterSpacing: '-1.5px' }}>
                Access
              </span>
              <span style={{ fontSize: 58, fontWeight: 900, color: '#ef4444', display: 'block', letterSpacing: '-1.5px' }}>
                Denied.
              </span>
            </div>

            {/* Message */}
            <p style={{
              fontSize: 14, color: 'rgba(200,210,230,0.75)', lineHeight: 1.6,
              marginBottom: 18, maxWidth: 440,
            }}>
              {message}
            </p>

            {/* Tip callout */}
            <div style={{
              borderLeft: '3px solid rgba(96,144,232,0.5)',
              paddingLeft: 14, marginBottom: 28,
            }}>
              <p style={{ fontSize: 13, color: 'rgba(160,180,220,0.6)', lineHeight: 1.6, margin: 0 }}>
                {tip}
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={handleReturnHome}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 22px', borderRadius: 10, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(200,210,230,0.9)', fontSize: 14, fontWeight: 600,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = ''; }}
              >
                <MdArrowBack size={18} /> Return Home
              </button>
              <button
                onClick={handleReconnect}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 22px', borderRadius: 10, cursor: 'pointer',
                  background: '#5865F2', border: '1px solid rgba(88,101,242,0.6)',
                  color: '#ffffff', fontSize: 14, fontWeight: 600,
                  boxShadow: '0 4px 20px rgba(88,101,242,0.35)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#6875f5'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(88,101,242,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#5865F2'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(88,101,242,0.35)'; }}
              >
                <DiscordSVG /> Sign in again
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ── STATUS BAR ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        background: 'rgba(4,2,14,0.88)', borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 8,
      }}>
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(140,160,200,0.5)' }}>
          CODE{' '}
          <span style={{ color: '#ef4444', fontWeight: 700 }}>{code}</span>
          {' '}-{' '}{today}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(160,180,210,0.5)', letterSpacing: '0.8px', textTransform: 'uppercase', marginLeft: 4 }}>
            Auth Failed
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
