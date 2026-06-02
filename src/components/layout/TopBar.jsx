import { useState, useEffect } from 'react';
import { useCAD } from '../../store/cadStore';
import ModifyIdentifier from '../ModifyIdentifier';

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
    <span className="font-mono text-[13px] text-cad-data tracking-wide">
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
  const [showIdentifier, setShowIdentifier] = useState(false);

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
    <header className="flex items-center gap-3 px-3.5 h-[42px] min-h-[42px] bg-app-card border-b border-border-base shrink-0">
      {/* Page Title */}
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-cad-text tracking-wide uppercase overflow-hidden text-ellipsis whitespace-nowrap">
          {pageLabel}
        </div>
        <div className="text-[9px] text-cad-muted font-mono tracking-wide">
          SSRP COMMUNICATIONS · EMERGENCY COMM. CENTER
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className={`font-mono text-xs font-semibold ${activeCalls > 0 ? 'text-[var(--pr2-text)]' : 'text-cad-dim'}`}>
            {activeCalls}
          </span>
          <span className="text-[8px] text-cad-muted uppercase tracking-[0.6px]">
            Active
          </span>
        </div>
        <div className="w-px h-6 bg-border-base shrink-0" />
        <div className="flex flex-col items-end">
          <span className="font-mono text-xs font-semibold text-cad-data">
            {onDuty}
          </span>
          <span className="text-[8px] text-cad-muted uppercase tracking-[0.6px]">
            On Duty
          </span>
        </div>
        <div className="w-px h-6 bg-border-base shrink-0" />
      </div>

      {/* Clock */}
      <Clock />

      <div className="w-px h-6 bg-border-base shrink-0" />

      {/* User info — click to modify identifier */}
      <button
        onClick={() => setShowIdentifier(true)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer group"
        title="Modify Identifier"
      >
        {me?.avatarUrl ? (
          <img src={me.avatarUrl} alt="avatar" className="w-6 h-6 rounded-md object-cover object-top shrink-0" style={{ border: `1px solid ${statusColor}` }} />
        ) : (
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
        )}
        <div className="text-right">
          <div className="text-[11px] font-semibold text-cad-text tracking-wide group-hover:text-white transition-colors">
            {me?.rank ? `${me.rank.toUpperCase().slice(0, 3)}. ` : ''}{currentUser?.name}
          </div>
          <div className="text-[9px] font-mono text-cad-muted tracking-wide">
            {me?.unitId || me?.badge || '*'} · {me?.deptShort || '*'} · {myStatus}
          </div>
        </div>
      </button>

      {showIdentifier && <ModifyIdentifier onClose={() => setShowIdentifier(false)} />}
    </header>
  );
}
