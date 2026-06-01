import { useState, useEffect } from 'react';
import { useCAD } from '../store/cadStore';
import {
  BADGE, S_PAGE, S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_BTN_PRIMARY, S_BTN_DANGER, S_BTN_GHOST, S_TABLE, S_TABLE_TH, S_TABLE_TD,
  S_STAT, S_STAT_LABEL, S_STAT_VALUE, S_STAT_SUB, S_DATA,
  S_TX_ENTRY, S_TX_TIME, TX_KIND_COLOR, S_UNIT_ROW, cadStatus,
  trHoverOn, trHoverOff, xs,
} from '../constants/styles';

function StatCard({ label, value, sub, borderColor, valueColor }) {
  return (
    <div className={`${S_STAT} border-t-2`} style={{ borderTopColor: borderColor || 'var(--color-border-base)' }}>
      <div className={S_STAT_LABEL}>{label}</div>
      <div className={S_STAT_VALUE} style={valueColor ? { color: valueColor } : {}}>{value}</div>
      {sub && <div className={S_STAT_SUB}>{sub}</div>}
    </div>
  );
}

function PriBadge({ p }) {
  const cls = [BADGE.gray, BADGE.p1, BADGE.p2, BADGE.p3, BADGE.p4][p] || BADGE.gray;
  return <span className={cls}>P{p}</span>;
}

function StatusDot({ status }) {
  const colors = {
    AVAILABLE: '#22c55e', BUSY: '#ef4444',
    ENRT: '#eab308', ARRVD: '#06b6d4',
    UNAVAILABLE: '#8b5cf6', OFFDUTY: '#6b7280',
  };
  return (
    <span
      className="inline-block w-[7px] h-[7px] rounded-full shrink-0"
      style={{ background: colors[status] || '#6b7280' }}
    />
  );
}

function ModuleCard({ label, desc, page, color, icon, go }) {
  return (
    <button
      onClick={() => go(page)}
      className="bg-app-card border border-border-base rounded text-left cursor-pointer transition-all flex flex-col gap-0.5 w-full p-2.5 font-ui hover:bg-app-elevated"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="text-[18px] mb-0.5">{icon}</div>
      <div className="text-[11.5px] font-semibold text-cad-text">{label}</div>
      <div className="text-[10px] text-slate-500 leading-[1.4]">{desc}</div>
    </button>
  );
}

export default function CommandDashboard() {
  const { state, dispatch } = useCAD();
  const { calls, officers, reports, warrants, dispatchLog, currentUser } = state;
  const [clock, setClock] = useState('');
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const p = n => String(n).padStart(2, '0');
      setClock(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const go = page => dispatch({ type: 'SET_PAGE', payload: page });

  const active = calls.filter(c => c.status !== 'CLOSED');
  const p1 = active.filter(c => c.priority === 1);
  const pending = active.filter(c => c.status === 'PENDING');
  const onDuty = officers.filter(o => o.status !== 'OFFDUTY');
  const available = officers.filter(o => o.status === 'AVAILABLE');
  const pendingReports = reports.filter(r => r.status === 'Pending Review');
  const activeWarrants = warrants.filter(w => w.status === 'ACTIVE');

  const modules = [
    { label: 'Dispatch Console', desc: 'Manage active calls, assign units, TX radio', page: 'dispatch', color: '#0d5492', icon: '📡' },
    { label: 'Dispatch Board', desc: 'Overview of all active calls and units', page: 'board', color: '#0d5492', icon: '📋' },
    { label: 'Records Bureau', desc: 'Person, vehicle, and incident lookups', page: 'records', color: '#1a6820', icon: '🔍' },
    { label: 'Reports Center', desc: 'File, review, and approve reports', page: 'reports', color: '#8a6808', icon: '📄' },
    { label: 'Warrant Control', desc: 'Issue and manage active warrants', page: 'warrants', color: '#600a0a', icon: '⚖️' },
    { label: 'Fire / EMS Ops', desc: 'HCFR apparatus and incident management', page: 'fire', color: '#a02010', icon: '🚒' },
    { label: 'Civilian Registry', desc: 'Create and manage civilian characters', page: 'civilian', color: '#4a2a8a', icon: '👤' },
    { label: 'Unit Management', desc: 'Full roster, statuses, and assignments', page: 'units', color: '#206870', icon: '🪪' },
    { label: 'Live Map', desc: 'Real-time unit and call visualization', page: 'map', color: '#1a5020', icon: '🗺️' },
    { label: 'MDT', desc: 'Messages, radio, and state returns', page: 'mdt', color: '#3a3880', icon: '💻' },
    ...(isAdmin ? [
      { label: 'Admin Center', desc: 'Users, sessions, audit log, departments', page: 'admin', color: '#6a4a08', icon: '⚙️' },
      { label: 'Penal Codes', desc: 'Manage charges, fines, and sentencing', page: 'penal', color: '#5a0a0a', icon: '📜' },
      { label: 'Ban Management', desc: 'Issue and review community bans', page: 'bans', color: '#4a0a0a', icon: '🚫' },
    ] : []),
  ];

  return (
    <div className={`${S_PAGE} gap-2.5`}>
      {/* P1 Alert Banner */}
      {p1.length > 0 && (
        <div className="bg-red-950/30 border border-red-900/50 rounded px-3.5 py-2 flex items-center gap-2.5">
          <span className="text-red-400 font-bold text-[12px] animate-pulse">
            ▲ PRIORITY 1 ACTIVE
          </span>
          <span className="text-red-400 text-[11px] font-mono">
            {p1.map(c => `${c.id} — ${c.nature} @ ${c.location}`).join(' · ')}
          </span>
          <button className={`${xs(S_BTN_DANGER)} ml-auto`} onClick={() => go('dispatch')}>
            Go to Dispatch
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2.5">
        <StatCard label="Active Calls" value={active.length} sub={`${p1.length} priority 1`} borderColor="#f59e0b" valueColor={active.length > 0 ? '#f59e0b' : undefined} />
        <StatCard label="Units On Duty" value={onDuty.length} sub={`${available.length} available`} borderColor="#0ea5e9" valueColor="#cdd4e0" />
        <StatCard label="Pending Reports" value={pendingReports.length} sub="awaiting review" borderColor="#eab308" valueColor={pendingReports.length > 0 ? '#eab308' : undefined} />
        <StatCard label="Active Warrants" value={activeWarrants.length} sub="outstanding" borderColor="#ef4444" valueColor={activeWarrants.length > 0 ? '#ef4444' : undefined} />
      </div>

      {/* Main grid */}
      <div className="grid flex-1 min-h-0 gap-2.5" style={{ gridTemplateColumns: '1fr 280px' }}>
        {/* Left: modules + active calls */}
        <div className="flex flex-col gap-2 min-h-0">
          {/* Module grid */}
          <div className={`${S_PANEL} shrink-0`}>
            <div className={S_PANEL_HEADER}>
              <div className={S_PANEL_TITLE}>Operational Workspaces</div>
              <span className="text-[9px] text-cad-muted font-mono">{modules.length} MODULES</span>
            </div>
            <div className="p-2.5">
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                {modules.map(m => (
                  <ModuleCard key={m.page} {...m} go={go} />
                ))}
              </div>
            </div>
          </div>

          {/* Active calls */}
          <div className={`${S_PANEL} flex-1 min-h-0`}>
            <div className={S_PANEL_HEADER}>
              <div className={S_PANEL_TITLE}>Active Incidents</div>
              <div className="flex gap-1.5 items-center">
                <span className="text-[9px] text-cad-muted font-mono">
                  {pending.length} PENDING · {active.filter(c => c.status === 'ACTIVE').length} ACTIVE
                </span>
                <button className={xs(S_BTN_PRIMARY)} onClick={() => go('dispatch')}>
                  Open Console
                </button>
              </div>
            </div>
            <div className={S_PANEL_BODY}>
              {active.length === 0 ? (
                <div className="p-5 text-center text-cad-muted text-[11px]">
                  No active incidents
                </div>
              ) : (
                <table className={S_TABLE}>
                  <thead>
                    <tr>
                      {['Call #','Pri','Nature','Location','Status','Units'].map(h => (
                        <th key={h} className={S_TABLE_TH}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {active.map(c => (
                      <tr key={c.id}
                        className={`cursor-pointer ${c.priority === 1 ? 'bg-red-950/10' : c.priority === 2 ? 'bg-orange-950/10' : ''}`}
                        onClick={() => go('dispatch')}
                        onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}>
                        <td className={S_TABLE_TD}><span className={S_DATA}>{c.id}</span></td>
                        <td className={S_TABLE_TD}><PriBadge p={c.priority} /></td>
                        <td className={`${S_TABLE_TD} font-medium`}>{c.nature}</td>
                        <td className={`${S_TABLE_TD} text-slate-500 text-[11px]`}>{c.location}</td>
                        <td className={S_TABLE_TD}>
                          <span className={c.status === 'PENDING' ? BADGE.orange : c.status === 'ACTIVE' ? BADGE.blue : c.status === 'ENRT' ? BADGE.yellow : BADGE.gray}>
                            {c.status}
                          </span>
                        </td>
                        <td className={`${S_TABLE_TD} font-mono text-[11px] text-slate-500`}>
                          {c.units.length > 0 ? c.units.join(', ') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right: TX log + unit summary */}
        <div className="flex flex-col gap-2 min-h-0">
          {/* TX feed */}
          <div className={`${S_PANEL} flex-1 min-h-0`}>
            <div className={S_PANEL_HEADER}>
              <div className={S_PANEL_TITLE}>Dispatch Feed</div>
              <span className="w-[7px] h-[7px] rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
            </div>
            <div className={`${S_PANEL_BODY} overflow-y-auto`}>
              {dispatchLog.slice(0, 40).map(e => (
                <div key={e.id} className={S_TX_ENTRY}>
                  <span className={S_TX_TIME}>{e.time}</span>
                  <span className={TX_KIND_COLOR[e.kind] || 'text-slate-400'}>{e.text}</span>
                </div>
              ))}
              {dispatchLog.length === 0 && (
                <div className="p-4 text-cad-muted text-[11px] text-center">
                  No activity
                </div>
              )}
            </div>
          </div>

          {/* Unit quick view */}
          <div className={`${S_PANEL} max-h-[200px] shrink-0`}>
            <div className={S_PANEL_HEADER}>
              <div className={S_PANEL_TITLE}>Unit Summary</div>
              <button className={xs(S_BTN_GHOST)} onClick={() => go('units')}>View All</button>
            </div>
            <div className={`${S_PANEL_BODY} overflow-y-auto`}>
              {onDuty.slice(0, 8).map(o => (
                <div key={o.id} className={S_UNIT_ROW}>
                  <StatusDot status={o.status} />
                  <span className="font-mono text-[11px] text-cad-data min-w-[52px]">
                    {o.unitId}
                  </span>
                  <span className="text-[11px] flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-cad-text">
                    {o.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
