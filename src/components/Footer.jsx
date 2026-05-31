export default function Footer() {
  return (
    <div style={{
      background: '#06101e',
      borderTop: '1px solid #1a2e50',
      padding: '0 20px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Left: logo + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" style={{ height: '18px', width: 'auto', opacity: 0.7 }} />
        <span style={{ color: '#4a6a9a', fontSize: '12px' }}>Sunshine State Roleplay</span>
      </div>

      {/* Right: copyright */}
      <span style={{ color: '#2e4060', fontSize: '12px' }}>
        Computer Aided Dispatch • All rights reserved
      </span>
    </div>
  );
}
