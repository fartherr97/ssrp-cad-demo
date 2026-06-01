import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { OFFICERS } from '../data/mockData';

function SSRPSeal() {
  return (
    <svg width="68" height="78" viewBox="0 0 68 78" fill="none" aria-hidden="true">
      <circle cx="34" cy="40" r="32" fill="none" stroke="#7a5008" strokeWidth="1"/>
      <circle cx="34" cy="40" r="29" fill="none" stroke="#5a3c06" strokeWidth="0.5"/>
      <path d="M34 4L8 16v24c0 17 12 31 26 34 14-3 26-17 26-34V16L34 4z"
        fill="#040c1c" stroke="#9a7010" strokeWidth="1.2"/>
      <path d="M34 10L12 20v20c0 13 10 24 22 27 12-3 22-14 22-27V20L34 10z"
        fill="rgba(13,84,146,0.22)" stroke="#0d4a80" strokeWidth="0.8"/>
      <text x="34" y="38" textAnchor="middle" fill="#1268b0" fontSize="18" fontFamily="system-ui">★</text>
      <text x="34" y="52" textAnchor="middle" fill="#c09018" fontSize="8" fontWeight="700"
        fontFamily="system-ui" letterSpacing="2">SSRP</text>
      <path id="topArc" d="M 10 40 A 24 24 0 0 1 58 40" fill="none"/>
      <text fontSize="5.5" fontFamily="system-ui" fill="#7a5808" letterSpacing="1.2" fontWeight="600">
        <textPath href="#topArc" startOffset="5%">SUNSHINE STATE ROLEPLAY</textPath>
      </text>
    </svg>
  );
}

export default function LoginPage() {
  const { dispatch } = useCAD();
  const [selectedUser, setSelectedUser] = useState(OFFICERS[0].id);

  const handleLogin = () => {
    const officer = OFFICERS.find(o => o.id === Number(selectedUser));
    if (officer) dispatch({ type: 'LOGIN', payload: officer });
  };

  return (
    <div className="login-bg">
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, #0d5492 0%, #1878c8 35%, #b88a0a 65%, #0d5492 100%)',
      }} />

      {/* Agency bar */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
        {[
          { abbr: 'TPD', name: 'Tampa Police', color: '#1060a0' },
          { abbr: 'HCSO', name: 'Sheriff', color: '#1a6820' },
          { abbr: 'HCFR', name: 'Fire Rescue', color: '#a02010' },
          { abbr: 'FHP', name: 'Highway Patrol', color: '#8a6808' },
        ].map(ag => (
          <div key={ag.abbr} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, opacity: 0.5 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              border: `1.5px solid ${ag.color}55`,
              background: `${ag.color}11`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 7, fontWeight: 700, color: ag.color,
              fontFamily: 'var(--font-mono)', letterSpacing: '0.5px',
            }}>{ag.abbr}</div>
          </div>
        ))}
      </div>

      <div className="login-panel">
        {/* Header */}
        <div className="login-header">
          <SSRPSeal />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--n-text-muted)', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>
              HILLSBOROUGH COUNTY COMMUNICATIONS
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--n-gold-bright)', letterSpacing: '1px', lineHeight: 1.1 }}>
              SSRP NEXUS CAD
            </div>
            <div style={{ fontSize: 10, color: 'var(--n-text-dim)', marginTop: 3, letterSpacing: '0.4px' }}>
              Computer-Aided Dispatch System · Version 2.0
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { label: 'DISPATCH', color: 'var(--st-av-text)' },
              { label: 'RMS', color: 'var(--st-av-text)' },
              { label: 'MDT LINK', color: 'var(--st-av-text)' },
            ].map(s => (
              <div key={s.label} style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '2px 7px',
                background: 'var(--n-bg-input)', border: '1px solid var(--n-border-faint)', borderRadius: 2,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, boxShadow: `0 0 4px ${s.color}` }} />
                <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--n-text-muted)', letterSpacing: '0.5px' }}>{s.label}</span>
                <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: s.color, fontWeight: 600 }}>ONLINE</span>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="login-body">
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--n-text-muted)', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>
              AUTHORIZED PERSONNEL ONLY
            </div>
            <p style={{ fontSize: 11, color: 'var(--n-text-dim)', lineHeight: 1.7 }}>
              Access is restricted to active SSRP members with a valid whitelist. All actions are monitored, logged, and subject to command review.
            </p>
          </div>

          <div className="n-field">
            <label className="n-label">Select Personnel (Demo Environment)</label>
            <select className="n-select" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
              {OFFICERS.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name} — {o.badge} ({o.deptShort} · {o.rank})
                </option>
              ))}
            </select>
          </div>

          <button
            className="n-btn n-btn-primary n-btn-lg"
            style={{ width: '100%', justifyContent: 'center', marginTop: 2, letterSpacing: '0.3px' }}
            onClick={handleLogin}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M10 2H14V14H10V12H12V4H10V2zM3 8L7 4V7H10V9H7V12L3 8z"/>
            </svg>
            Access SSRP NEXUS CAD
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--n-border-faint)' }} />
            <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--n-border-faint)' }} />
          </div>

          <button
            className="n-btn n-btn-secondary"
            style={{ width: '100%', justifyContent: 'center', fontSize: 11, gap: 7 }}
            onClick={handleLogin}
          >
            <svg width="13" height="10" viewBox="0 0 71 55" fill="#5865F2">
              <path d="M60.1 4.9A58.5 58.5 0 0045.8 1a40 40 0 00-1.8 3.7 54.1 54.1 0 00-16.1 0A40.3 40.3 0 0026.1 1 58.6 58.6 0 0011.8 4.9C1.7 19.7-1 34.1.3 48.3A59 59 0 0018 55.5a44.3 44.3 0 003.8-6.2 38.3 38.3 0 01-6-2.9l1.4-1.1a42.1 42.1 0 0036.2 0l1.5 1.1a38.1 38.1 0 01-6 2.9 44.6 44.6 0 003.8 6.2 58.7 58.7 0 0018.1-7.2C72 34 68.7 19.7 60.1 4.9zM23.7 39.8c-3.5 0-6.3-3.2-6.3-7.1s2.8-7.1 6.3-7.1c3.5 0 6.4 3.2 6.3 7.1 0 3.9-2.8 7.1-6.3 7.1zm23.6 0c-3.5 0-6.3-3.2-6.3-7.1s2.8-7.1 6.3-7.1c3.5 0 6.4 3.2 6.3 7.1 0 3.9-2.8 7.1-6.3 7.1z"/>
            </svg>
            Continue with Discord
          </button>
        </div>

        <div style={{
          padding: '7px 16px', borderTop: '1px solid var(--n-border-faint)',
          background: 'var(--n-bg-root)', display: 'flex', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 8.5, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>SSRP NEXUS CAD v2.0</span>
          <span style={{ fontSize: 8.5, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>SECURE · AUDITED · ENCRYPTED</span>
        </div>
      </div>

      <div style={{ fontSize: 8.5, color: 'var(--n-text-muted)', textAlign: 'center', maxWidth: 380, lineHeight: 1.7, fontFamily: 'var(--font-mono)', marginTop: 8 }}>
        UNAUTHORIZED ACCESS IS PROHIBITED · ALL ACTIVITY IS MONITORED AND LOGGED · SSRP STAFF ONLY
      </div>
    </div>
  );
}
