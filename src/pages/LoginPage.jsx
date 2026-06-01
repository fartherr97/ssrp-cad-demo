import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { OFFICERS } from '../data/mockData';

const AGENCIES = [
  { abbr: 'TPD',     name: 'Tampa Police Dept.',      color: '#3a78cc' },
  { abbr: 'HCSO',    name: "Hillsborough Co. Sheriff", color: '#3aaa44' },
  { abbr: 'HCFR',    name: 'Fire Rescue',             color: '#cc3333' },
  { abbr: 'FHP',     name: 'Highway Patrol',          color: '#c8a050' },
  { abbr: 'FDOT',    name: 'Dept. of Transportation', color: '#dd7820' },
  { abbr: 'CIV-OPS', name: 'Civilian Operations',     color: '#7878aa' },
];

export default function LoginPage() {
  const { dispatch } = useCAD();
  const [selectedUser, setSelectedUser] = useState(OFFICERS[0].id);

  const handleLogin = () => {
    const officer = OFFICERS.find(o => o.id === Number(selectedUser));
    if (officer) dispatch({ type: 'LOGIN', payload: officer });
  };

  return (
    <div style={{
      minHeight: '100vh', overflow: 'auto',
      background: '#020810',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 0,
      padding: '16px 12px',
    }}>
      {/* Top accent bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, background: '#0a3a6a' }} />

      {/* Main login panel */}
      <div style={{
        background: '#040c1a',
        border: '1px solid #1a3050',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.95)',
      }}>
        {/* Title bar */}
        <div style={{
          background: '#0a1c34',
          borderBottom: '1px solid #1a3050',
          padding: '8px 12px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="14" height="16" viewBox="0 0 36 42" fill="none" aria-hidden="true">
            <path d="M18 1L2 8v16c0 9.5 7.2 17.5 16 19 8.8-1.5 16-9.5 16-19V8L18 1z"
              fill="#030810" stroke="#5a3c06" strokeWidth="1.2"/>
            <path d="M18 6L5 11.5v12.5c0 7.5 5.8 13.8 13 15.2 7.2-1.4 13-7.7 13-15.2V11.5L18 6z"
              fill="rgba(10,50,110,0.3)" stroke="#0a3060" strokeWidth="0.8"/>
            <text x="18" y="23" textAnchor="middle" fill="#0a4890" fontSize="11" fontFamily="system-ui">★</text>
          </svg>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#a07808', fontFamily: 'var(--font-mono)' }}>
              SSRP CAD SYSTEM
            </div>
            <div style={{ fontSize: 8, color: '#2e4258', fontFamily: 'var(--font-mono)', letterSpacing: '0.3px' }}>
              HILLSBOROUGH COUNTY EMERGENCY COMMUNICATIONS CENTER
            </div>
          </div>
        </div>

        {/* System status bar */}
        <div style={{
          display: 'flex', gap: 0, padding: '4px 10px',
          background: '#030810', borderBottom: '1px solid #0d1e30',
        }}>
          {[
            { label: 'DISPATCH', status: 'ONLINE', color: '#22cc55' },
            { label: 'RMS',      status: 'ONLINE', color: '#22cc55' },
            { label: 'MDT',      status: 'ONLINE', color: '#22cc55' },
            { label: 'MAPPING',  status: 'ONLINE', color: '#22cc55' },
          ].map((s, i) => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '1px 10px 1px 0', marginRight: 8,
              borderRight: i < 3 ? '1px solid #0d1e30' : 'none',
              paddingRight: i < 3 ? 8 : 0,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: '#2e4258', letterSpacing: '0.5px' }}>
                {s.label}
              </span>
              <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: s.color, fontWeight: 700 }}>
                {s.status}
              </span>
            </div>
          ))}
        </div>

        {/* Agency grid */}
        <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid #0d1e30' }}>
          <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: '#2e4258', letterSpacing: '0.8px', marginBottom: 7, textTransform: 'uppercase' }}>
            PARTICIPATING AGENCIES
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {AGENCIES.map(ag => (
              <div key={ag.abbr} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '2px 8px',
                background: '#030810',
                border: `1px solid ${ag.color}30`,
              }}>
                <div style={{ width: 4, height: 4, background: ag.color, flexShrink: 0 }} />
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: ag.color, fontWeight: 700, letterSpacing: '0.4px' }}>
                  {ag.abbr}
                </span>
                <span style={{ fontSize: 8, color: '#2e4258' }}>{ag.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Login body */}
        <div style={{ padding: '12px 12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.8px', color: '#2e4258', textTransform: 'uppercase', marginBottom: 4 }}>
              ▌ AUTHORIZED PERSONNEL ONLY
            </div>
            <div style={{ fontSize: 10, color: '#3a5070', lineHeight: 1.6 }}>
              Access is restricted to active SSRP members with a valid whitelist.
              All actions are logged and subject to command review.
            </div>
          </div>

          <div className="n-field">
            <label className="n-label" style={{ marginBottom: 4 }}>Select Personnel (Demo Environment)</label>
            <select
              className="n-select"
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}
            >
              {OFFICERS.map(o => (
                <option key={o.id} value={o.id}>
                  {o.badge} — {o.name} ({o.deptShort} · {o.rank})
                </option>
              ))}
            </select>
          </div>

          <button
            style={{
              width: '100%', padding: '6px 12px', fontSize: 11, fontWeight: 600,
              background: '#061828', color: '#80b8e0',
              border: '1px solid #0d3a60', cursor: 'pointer',
              fontFamily: 'var(--font-ui)', letterSpacing: '0.3px',
              textTransform: 'uppercase',
            }}
            onClick={handleLogin}
          >
            ▶  Access CAD System
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: '#0d1e30' }} />
            <span style={{ fontSize: 8, color: '#1a2a38', fontFamily: 'var(--font-mono)' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: '#0d1e30' }} />
          </div>

          <button
            style={{
              width: '100%', padding: '5px 12px', fontSize: 10,
              background: '#04080e', color: '#304258',
              border: '1px solid #0d1e30', cursor: 'pointer',
              fontFamily: 'var(--font-ui)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}
            onClick={handleLogin}
          >
            <svg width="13" height="10" viewBox="0 0 71 55" fill="#3a4870">
              <path d="M60.1 4.9A58.5 58.5 0 0045.8 1a40 40 0 00-1.8 3.7 54.1 54.1 0 00-16.1 0A40.3 40.3 0 0026.1 1 58.6 58.6 0 0011.8 4.9C1.7 19.7-1 34.1.3 48.3A59 59 0 0018 55.5a44.3 44.3 0 003.8-6.2 38.3 38.3 0 01-6-2.9l1.4-1.1a42.1 42.1 0 0036.2 0l1.5 1.1a38.1 38.1 0 01-6 2.9 44.6 44.6 0 003.8 6.2 58.7 58.7 0 0018.1-7.2C72 34 68.7 19.7 60.1 4.9zM23.7 39.8c-3.5 0-6.3-3.2-6.3-7.1s2.8-7.1 6.3-7.1c3.5 0 6.4 3.2 6.3 7.1 0 3.9-2.8 7.1-6.3 7.1zm23.6 0c-3.5 0-6.3-3.2-6.3-7.1s2.8-7.1 6.3-7.1c3.5 0 6.4 3.2 6.3 7.1 0 3.9-2.8 7.1-6.3 7.1z"/>
            </svg>
            Continue with Discord
          </button>
        </div>

        {/* Footer */}
        <div style={{
          padding: '5px 12px', borderTop: '1px solid #0d1e30',
          background: '#020810', display: 'flex', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 8, color: '#1a2a38', fontFamily: 'var(--font-mono)' }}>
            SSRP CAD v3.0
          </span>
          <span style={{ fontSize: 8, color: '#1a2a38', fontFamily: 'var(--font-mono)' }}>
            SECURE · AUDITED · ENCRYPTED
          </span>
        </div>
      </div>

      {/* Bottom warning */}
      <div style={{
        marginTop: 12, fontSize: 8, color: '#1a2a38', textAlign: 'center',
        maxWidth: 420, lineHeight: 1.8, fontFamily: 'var(--font-mono)',
      }}>
        UNAUTHORIZED ACCESS IS PROHIBITED · ALL ACTIVITY IS MONITORED AND LOGGED
      </div>
    </div>
  );
}
