import { useCAD } from '../store/cadStore';
import { OFFICERS } from '../data/mockData';
import { FaDiscord } from 'react-icons/fa6';

export default function LoginPage() {
  const { dispatch } = useCAD();

  // Single sign-in for the demo: authenticate as the admin account so every
  // module is reachable from the selection hub. The hub is where the user then
  // chooses a direction (Civilian, Police, Dispatch, etc.).
  const signIn = () => {
    const user = OFFICERS.find(o => o.role === 'admin') || OFFICERS[0];
    dispatch({ type: 'LOGIN', payload: user });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background:
        'radial-gradient(900px 500px at 50% -10%, #1c1f24 0%, rgba(28,31,36,0) 60%), linear-gradient(160deg, #131519 0%, #0c0d10 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Ubuntu', system-ui, sans-serif",
    }}>

      {/* ── Header ── */}
      <div style={{
        background: '#111216',
        borderBottom: '1px solid #2a2d33',
        padding: '0 24px',
        height: '54px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" style={{ height: '32px', width: 'auto' }} />
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px' }}>
              Sunshine State <span style={{ color: '#f97316' }}>RP</span>
            </div>
            <div style={{ color: '#6b7888', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Computer Aided Dispatch
            </div>
          </div>
        </div>
        <div style={{ color: '#4a5260', fontSize: '12px' }}>v2.4.1</div>
      </div>

      {/* ── Body ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
      }}>
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <img
            src="https://cdn.ssrp.us/images/ssrp.png"
            alt="SSRP Logo"
            className="logo-float"
            style={{ height: '110px', width: 'auto', margin: '0 auto 18px', display: 'block' }}
          />
          <div style={{ color: '#f4f6f8', fontSize: '26px', fontWeight: 700, letterSpacing: '2px' }}>
            SUNSHINE STATE ROLEPLAY
          </div>
          <div style={{ color: '#8a93a0', fontSize: '14px', letterSpacing: '2px', marginTop: '5px', textTransform: 'uppercase' }}>
            Computer Aided Dispatch
          </div>
        </div>

        {/* Login card */}
        <div style={{
          background: '#15161a',
          border: '1px solid #2e3138',
          borderRadius: '10px',
          padding: '30px 24px',
          width: '100%',
          maxWidth: '380px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}>
          <div style={{ color: '#f5b740', fontSize: '14px', fontWeight: 700, marginBottom: '6px', textAlign: 'center', letterSpacing: '2px' }}>
            SIGN IN
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', marginBottom: '22px', fontSize: '10px', letterSpacing: '1px', color: '#5f8f6f' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#46c971', boxShadow: '0 0 5px #46c971', animation: 'cadPulse 1.6s ease-in-out infinite' }} />
            SECURE TERMINAL • DISPATCH NET ONLINE
          </div>

          <button
            onClick={signIn}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #2b6cb8, #1e4d90)',
              border: '1px solid #4a9eff',
              borderRadius: '6px',
              color: '#fff',
              padding: '13px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '2px',
              marginBottom: '12px',
              boxShadow: '0 0 18px rgba(74,158,255,0.18)',
            }}
          >
            🔐 SIGN IN
          </button>

          <button
            onClick={signIn}
            style={{
              width: '100%',
              background: '#5865F2',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              padding: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FaDiscord size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Sign in with Discord
          </button>
          <div style={{ color: '#4a5260', fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>
            Discord OAuth • connect your account
          </div>
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
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" style={{ height: '16px', width: 'auto', opacity: 0.5 }} />
          <span style={{ color: '#5a6472', fontSize: '12px' }}>Sunshine State Roleplay</span>
        </div>
        <span style={{ color: '#3a4250', fontSize: '12px' }}>
          Computer Aided Dispatch • All rights reserved
        </span>
      </div>
    </div>
  );
}
