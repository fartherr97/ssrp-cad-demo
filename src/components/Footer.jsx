import { useState, useEffect } from 'react';
import { useCAD } from '../store/cadStore';
import { useResponsive } from '../hooks/useResponsive';

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const p = n => String(n).padStart(2, '0');
  const date = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  return { time: `${p(now.getHours())}:${p(now.getMinutes())}`, date };
}

const SHORTCUTS = [
  { key: 'F1', label: 'Records',    page: 'search' },
  { key: 'F2', label: 'Reports',    page: 'forms' },
  { key: 'F3', label: 'Run Plate',  page: 'returns' },
  { key: 'F4', label: 'Dispatch',   page: 'dispatch' },
  { key: 'F5', label: 'MDT',        page: 'mdt' },
  { key: 'F6', label: 'New Call',   page: 'createcall' },
  { key: 'F7', label: 'Live Map',   page: 'livemap' },
];

export default function Footer() {
  const { state, dispatch } = useCAD();
  const { currentUser, officers } = state;
  const { time, date } = useClock();
  const { isMobile } = useResponsive();
  if (isMobile) return null;
  const go = page => dispatch({ type: 'SET_PAGE', payload: page });

  const myOfficer = officers.find(o => o.id === currentUser?.id);
  const stationLine = currentUser
    ? `${currentUser.deptShort || 'SSRP'} / ${myOfficer?.location || 'Tampa, FL'}`
    : 'SSRP CAD';

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '28px',
      background: '#06070c',
      borderTop: '1px solid #141720',
      display: 'flex',
      alignItems: 'stretch',
      zIndex: 900,
      fontFamily: "'Ubuntu', sans-serif",
      overflow: 'hidden',
    }}>
      {/* Left: action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1px', padding: '0 6px', borderRight: '1px solid #141720', flexShrink: 0 }}>
        <CmdBtn onClick={() => go('search')}>Clear</CmdBtn>
        <CmdBtn onClick={() => window.print()}>Print</CmdBtn>
      </div>

      {/* F-key shortcuts */}
      <div style={{ display: 'flex', alignItems: 'stretch', overflowX: 'auto', scrollbarWidth: 'none', flex: 1 }}>
        {SHORTCUTS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => go(s.page)}
            style={{
              background: 'transparent',
              border: 'none',
              borderRight: '1px solid #141720',
              color: '#374151',
              padding: '0 7px',
              fontSize: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              whiteSpace: 'nowrap',
              height: '28px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#0d1117'; e.currentTarget.style.color = '#6b7280'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; }}
          >
            <span style={{ color: '#1d4ed8', fontWeight: 700, fontSize: '10px' }}>{s.key}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Right: station + clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px', borderLeft: '1px solid #141720', flexShrink: 0 }}>
        <span style={{ color: '#1f2937', fontSize: '10px', whiteSpace: 'nowrap' }}>{stationLine}</span>
        <span style={{ color: '#1f2937', fontSize: '10px' }}>{date}</span>
        <span style={{ color: '#1d4ed8', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px' }}>{time}</span>
      </div>
    </div>
  );
}

function CmdBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#0d1117',
        border: '1px solid #1a1e2c',
        borderRadius: '2px',
        color: '#6b7280',
        padding: '1px 7px',
        fontSize: '10px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = '#9ca3af'; }}
      onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; }}
    >
      {children}
    </button>
  );
}
