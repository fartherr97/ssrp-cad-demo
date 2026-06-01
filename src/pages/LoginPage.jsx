import { useCAD } from '../store/cadStore';
import { OFFICERS } from '../data/mockData';
import { FaDiscord, FaShieldHalved, FaLock } from 'react-icons/fa6';

export default function LoginPage() {
  const { dispatch } = useCAD();

  const signIn = () => {
    const user = OFFICERS.find(o => o.role === 'admin') || OFFICERS[0];
    dispatch({ type: 'LOGIN', payload: user });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #06080f 0%, #080b14 60%, #06070c 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Ubuntu', system-ui, sans-serif",
    }}>

      {/* Top system bar */}
      <div style={{
        background: '#08090e',
        borderBottom: '1px solid #1a1e2c',
        padding: '0 24px',
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" style={{ height: '22px', width: 'auto' }} />
          <div>
            <span style={{ color: '#cbd5e1', fontWeight: 700, fontSize: '13px' }}>
              SSRP <span style={{ color: '#f97316' }}>CAD</span>
            </span>
            <span style={{ color: '#1e3a5f', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginLeft: '10px' }}>
              Computer Aided Dispatch
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#374151', fontSize: '11px', fontFamily: "'Ubuntu', sans-serif" }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
          DISPATCH NET ONLINE
        </div>
      </div>

      {/* Main body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: '840px', display: 'flex', gap: '48px', alignItems: 'center' }}>

          {/* Left: Branding */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <img
              src="https://cdn.ssrp.us/images/ssrp.png"
              alt="SSRP Logo"
              className="logo-float"
              style={{ height: '90px', width: 'auto', margin: '0 auto 20px', display: 'block', opacity: 0.9 }}
            />
            <div style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>
              Sunshine State Roleplay
            </div>
            <div style={{ color: '#374151', fontSize: '12px', letterSpacing: '3px', marginTop: '6px', textTransform: 'uppercase' }}>
              Computer Aided Dispatch &amp; RMS
            </div>
            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                'Tampa Police Department',
                'Hillsborough County Sheriff\'s Office',
                'Florida Highway Patrol',
                'Hillsborough County Fire Rescue',
              ].map(dept => (
                <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e3a5f', fontSize: '12px', justifyContent: 'center' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#1d4ed8', flexShrink: 0 }} />
                  {dept}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Login card */}
          <div style={{
            width: '320px',
            flexShrink: 0,
            background: '#0d1117',
            border: '1px solid #1a1e2c',
            borderTop: '3px solid #1d4ed8',
            borderRadius: '4px',
            padding: '28px 24px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <FaLock size={14} color="#1d4ed8" />
              <span style={{ color: '#93c5fd', fontSize: '13px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                Secure Sign In
              </span>
            </div>
            <div style={{ color: '#374151', fontSize: '11px', marginBottom: '24px', fontFamily: "'Ubuntu', sans-serif" }}>
              AUTHORIZED PERSONNEL ONLY
            </div>

            <button
              onClick={signIn}
              style={{
                width: '100%',
                background: 'linear-gradient(180deg, #1e40af, #1d3a99)',
                border: '1px solid #2563eb',
                borderRadius: '3px',
                color: '#eff6ff',
                padding: '11px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '1.5px',
                marginBottom: '10px',
                boxShadow: '0 0 20px rgba(37,99,235,0.2)',
              }}
            >
              SIGN IN TO CAD
            </button>

            <button
              onClick={signIn}
              style={{
                width: '100%',
                background: '#5865F2',
                border: '1px solid #7c86f8',
                borderRadius: '3px',
                color: '#fff',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <FaDiscord size={16} />
              Sign in with Discord
            </button>

            <div style={{ borderTop: '1px solid #1a1e2c', marginTop: '20px', paddingTop: '14px' }}>
              <div style={{ color: '#1f2937', fontSize: '11px', fontFamily: "'Ubuntu', sans-serif", lineHeight: 1.7 }}>
                <div>SYSTEM: SSRP CAD v2.4</div>
                <div>JURISDICTION: HILLSBOROUGH COUNTY, FL</div>
                <div>ENCRYPTION: TLS 1.3</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        background: '#06070c',
        borderTop: '1px solid #141720',
        padding: '0 24px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        fontFamily: "'Ubuntu', sans-serif",
      }}>
        <span style={{ color: '#1f2937', fontSize: '10px' }}>Sunshine State Roleplay • Computer Aided Dispatch</span>
        <span style={{ color: '#1f2937', fontSize: '10px' }}>All rights reserved</span>
      </div>
    </div>
  );
}
