import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { OFFICERS } from '../data/mockData';

export default function LoginPage() {
  const { dispatch } = useCAD();
  const [selected, setSelected] = useState('');

  const handleLogin = () => {
    const officer = OFFICERS.find(o => o.id === Number(selected)) || OFFICERS[0];
    dispatch({ type: 'LOGIN', payload: officer });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #050d1a 0%, #0a1a35 50%, #050d1a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Ubuntu Mono, monospace',
    }}>
      {/* Shield logo */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP Logo" style={{ height: '80px', width: 'auto', margin: '0 auto 12px', display: 'block', filter: 'drop-shadow(0 0 18px rgba(74,158,255,0.4))' }} />
        <div style={{ color: '#4a9eff', fontSize: '28px', fontWeight: 800, letterSpacing: '4px' }}>SUNSHINE STATE ROLEPLAY</div>
        <div style={{ color: '#94a3b8', fontSize: '13px', letterSpacing: '2px', marginTop: '4px' }}>COMPUTER AIDED DISPATCH</div>
      </div>

      {/* Login card */}
      <div style={{
        background: '#0d1f3c',
        border: '1px solid #1e4080',
        borderRadius: '8px',
        padding: '32px 40px',
        width: '380px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <div style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: 700, marginBottom: '24px', textAlign: 'center', letterSpacing: '1px' }}>
          OFFICER SIGN IN
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>SELECT OFFICER (DEMO)</label>
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            style={{ width: '100%', background: '#0a1a35', border: '1px solid #1e4080', borderRadius: '4px', color: '#e2e8f0', padding: '8px', fontSize: '13px', fontFamily: 'Ubuntu Mono, monospace' }}
          >
            <option value="">-- Select Officer --</option>
            {OFFICERS.map(o => (
              <option key={o.id} value={o.id}>{o.name} ({o.badge}) - {o.deptShort}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #1a3a6b, #1e4080)',
            border: '1px solid #4a9eff',
            borderRadius: '4px',
            color: '#fff',
            padding: '12px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '2px',
            marginBottom: '12px',
            fontFamily: 'Ubuntu Mono, monospace',
            boxShadow: '0 0 15px rgba(74,158,255,0.2)',
          }}
        >
          🔐 SIGN IN
        </button>

        <div style={{ borderTop: '1px solid #1e4080', paddingTop: '16px', marginTop: '8px' }}>
          <button
            style={{
              width: '100%',
              background: '#5865F2',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              padding: '11px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '1px',
              fontFamily: 'Ubuntu Mono, monospace',
            }}
          >
            🎮 Sign in with Discord
          </button>
          <div style={{ color: '#475569', fontSize: '11px', textAlign: 'center', marginTop: '8px' }}>
            Discord OAuth — connect your account
          </div>
        </div>
      </div>

      <div style={{ color: '#334155', fontSize: '11px', marginTop: '24px', letterSpacing: '1px' }}>
        SUNSHINE STATE RP CAD v2.4.1 • © 2023 Sunshine State RP Community
      </div>
    </div>
  );
}
