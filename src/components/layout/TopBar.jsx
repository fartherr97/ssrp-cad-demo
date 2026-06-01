import { useState, useEffect } from 'react';
import { useCAD } from '../../store/cadStore';

function Clock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const p = n => String(n).padStart(2, '0');
      setTime(`${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--n-text-data)', letterSpacing: '0.5px' }}>
      {time}
    </span>
  );
}

const PAGE_LABELS = {
  dashboard: 'Command Center',
  dispatch:  'Dispatch Console',
  board:     'Dispatch Board',
  fire:      'Fire / EMS Operations',
  map:       'Live Situational Map',
  records:   'Records Bureau',
  warrants:  'Warrant Control',
  reports:   'Reports Center',
  civilian:  'Civilian Registry',
  mdt:       'Mobile Data Terminal',
  units:     'Unit Management',
  admin:     'Admin Center',
  penal:     'Penal Code',
  bans:      'Ban Management',
};

export default function TopBar() {
  const { state } = useCAD();
  const { currentUser, currentPage, officers, calls } = state;

  const me = officers.find(o => o.id === currentUser?.id);
  const activeCalls = calls.filter(c => c.status !== 'CLOSED').length;
  const onDuty = officers.filter(o => o.status !== 'OFFDUTY').length;

  const statusColors = {
    AVAILABLE:   'var(--st-av-text)',
    BUSY:        'var(--st-busy-text)',
    ENRT:        'var(--st-enrt-text)',
    ARRVD:       'var(--st-arv-text)',
    UNAVAILABLE: 'var(--st-unav-text)',
    OFFDUTY:     'var(--st-od-text)',
  };
  const myStatus = me?.status || 'OFFDUTY';
  const statusColor = statusColors[myStatus] || 'var(--n-text-muted)';

  const pageLabel = PAGE_LABELS[currentPage] || 'SSRP NEXUS CAD';

  return (
    <header className="n-topbar">
      {/* Page Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--n-text)',
          letterSpacing: '0.3px',
          textTransform: 'uppercase',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {pageLabel}
        </div>
        <div style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.3px' }}>
          HILLSBOROUGH CO. COMMUNICATIONS · EMERGENCY COMM. CENTER
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: activeCalls > 0 ? 'var(--pr2-text)' : 'var(--n-text-dim)' }}>
            {activeCalls}
          </span>
          <span style={{ fontSize: 8, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Active
          </span>
        </div>
        <div style={{ width: 1, height: 24, background: 'var(--n-border)', flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--n-text-data)' }}>
            {onDuty}
          </span>
          <span style={{ fontSize: 8, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            On Duty
          </span>
        </div>
        <div style={{ width: 1, height: 24, background: 'var(--n-border)', flexShrink: 0 }} />
      </div>

      {/* Clock */}
      <Clock />

      <div style={{ width: 1, height: 24, background: 'var(--n-border)', flexShrink: 0 }} />

      {/* User info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Status dot */}
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: statusColor,
          boxShadow: `0 0 6px ${statusColor}`,
          flexShrink: 0,
        }} />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--n-text)', letterSpacing: '0.2px' }}>
            {me?.rank ? `${me.rank.toUpperCase().slice(0, 3)}. ` : ''}{currentUser?.name}
          </div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--n-text-muted)', letterSpacing: '0.3px' }}>
            {me?.badge || '—'} · {me?.deptShort || '—'} · {myStatus}
          </div>
        </div>
      </div>
    </header>
  );
}
