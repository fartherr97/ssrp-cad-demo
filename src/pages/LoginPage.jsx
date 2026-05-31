import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { OFFICERS } from '../data/mockData';
import { FaDiscord } from 'react-icons/fa6';

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
      background: 'linear-gradient(160deg, #050d1a 0%, #0a1a35 50%, #050d1a 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── Header ── */}
      <div style={{
        background: '#07111f',
        borderBottom: '1px solid #162540',
        padding: '0 24px',
        height: '54px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        {/* Left: logo + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" style={{ height: '32px', width: 'auto' }} />
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px' }}>
              Sunshine State <span style={{ color: '#f97316' }}>RP</span>
            </div>
            <div style={{ color: '#3a5a8a', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Computer Aided Dispatch
            </div>
          </div>
        </div>

        {/* Right: version tag */}
        <div style={{ color: '#2a4060', fontSize: '12px' }}>
          v2.4.1
        </div>
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
        {/* Logo + title */}
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <img
            src="https://cdn.ssrp.us/images/ssrp.png"
            alt="SSRP Logo"
            className="logo-float"
            style={{ height: '110px', width: 'auto', margin: '0 auto 18px', display: 'block' }}
          />
          <div style={{ color: '#f1f5f9', fontSize: '26px', fontWeight: 700, letterSpacing: '2px' }}>
            SUNSHINE STATE ROLEPLAY
          </div>
          <div style={{ color: '#4a7aaa', fontSize: '14px', letterSpacing: '2px', marginTop: '5px', textTransform: 'uppercase' }}>
            Computer Aided Dispatch
          </div>
        </div>

        {/* Login card */}
        <div style={{
          background: '#0b1929',
          border: '1px solid #1e3a60',
          borderRadius: '10px',
          padding: '32px 24px',
          width: '100%',
          maxWidth: '380px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}>
          <div style={{ color: '#f5b740', fontSize: '14px', fontWeight: 700, marginBottom: '6px', textAlign: 'center', letterSpacing: '2px' }}>
            OFFICER SIGN IN
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', marginBottom: '20px', fontSize: '10px', letterSpacing: '1px', color: '#5f8f6f' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#46c971', boxShadow: '0 0 5px #46c971', animation: 'cadPulse 1.6s ease-in-out infinite' }} />
            SECURE TERMINAL • DISPATCH NET ONLINE
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#7a9ab8', fontSize: '12px', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
              SELECT OFFICER (DEMO)
            </label>
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              style={{ width: '100%', background: '#060f1c', border: '1px solid #1e3a60', borderRadius: '5px', color: '#e2e8f0', padding: '9px 10px', fontSize: '15px' }}
            >
              <option value="">-- Select Officer --</option>
              {OFFICERS.map(o => (
                <option key={o.id} value={o.id}>{o.name} ({o.badge}) • {o.deptShort}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #1a3a6b, #1e4d90)',
              border: '1px solid #4a9eff',
              borderRadius: '5px',
              color: '#fff',
              padding: '12px',
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

          <div style={{ borderTop: '1px solid #1a3050', paddingTop: '16px', marginTop: '4px' }}>
            <button
              style={{
                width: '100%',
                background: '#5865F2',
                border: 'none',
                borderRadius: '5px',
                color: '#fff',
                padding: '11px',
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
            <div style={{ color: '#2e4060', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>
              Discord OAuth • connect your account
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        background: '#06101e',
        borderTop: '1px solid #162540',
        padding: '0 24px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" style={{ height: '16px', width: 'auto', opacity: 0.5 }} />
          <span style={{ color: '#2e4a6a', fontSize: '12px' }}>Sunshine State Roleplay</span>
        </div>
        <span style={{ color: '#1e3050', fontSize: '12px' }}>
          Computer Aided Dispatch • All rights reserved
        </span>
      </div>

    </div>
  );
}
