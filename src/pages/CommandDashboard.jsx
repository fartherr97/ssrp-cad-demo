import { useState, useEffect } from 'react';
import { useCAD } from '../store/cadStore';

function StatCard({ label, value, sub, color, accent }) {
  return (
    <div className="n-stat" style={{ borderTop: `2px solid ${color || 'var(--n-border)'}` }}>
      <div className="n-stat-label">{label}</div>
      <div className="n-stat-value" style={{ color: accent || 'var(--n-text)' }}>{value}</div>
      {sub && <div className="n-stat-sub">{sub}</div>}
    </div>
  );
}

function PriBadge({ p }) {
  const cls = ['', 'badge-p1', 'badge-p2', 'badge-p3', 'badge-p4'][p] || 'badge-gray';
  return <span className={`n-badge ${cls}`}>P{p}</span>;
}

function StatusDot({ status }) {
  const colors = {
    AVAILABLE: 'var(--st-av-text)', BUSY: 'var(--st-busy-text)',
    ENRT: 'var(--st-enrt-text)', ARRVD: 'var(--st-arv-text)',
    UNAVAILABLE: 'var(--st-unav-text)', OFFDUTY: 'var(--st-od-text)',
  };
  return (
    <span style={{
      display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
      background: colors[status] || 'var(--n-text-muted)',
      flexShrink: 0,
    }} />
  );
}

function ModuleCard({ label, desc, page, color, icon, go }) {
  return (
    <button
      onClick={() => go(page)}
      style={{
        background: 'var(--n-bg-card)',
        border: `1px solid var(--n-border)`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 'var(--n-radius)',
        padding: '10px 12px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.1s',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        width: '100%',
        fontFamily: 'var(--font-ui)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--n-bg-elevated)'; e.currentTarget.style.borderColor = `${color}88`; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--n-bg-card)'; e.currentTarget.style.borderColor = 'var(--n-border)'; e.currentTarget.style.borderLeftColor = color; }}
    >
      <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--n-text)' }}>{label}</div>
      <div style={{ fontSize: 10, color: 'var(--n-text-dim)', lineHeight: 1.4 }}>{desc}</div>
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
    <div className="n-page" style={{ gap: 10 }}>
      {/* P1 Alert Banner */}
      {p1.length > 0 && (
        <div style={{
          background: 'var(--pr1-bg)', border: '1px solid var(--pr1-border)',
          borderRadius: 'var(--n-radius)', padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ color: 'var(--pr1-text)', fontWeight: 700, fontSize: 12, animation: 'pulseRed 1s ease-in-out infinite' }}>
            ▲ PRIORITY 1 ACTIVE
          </span>
          <span style={{ color: 'var(--pr1-text)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            {p1.map(c => `${c.id} — ${c.nature} @ ${c.location}`).join(' · ')}
          </span>
          <button className="n-btn n-btn-danger n-btn-sm" style={{ marginLeft: 'auto' }} onClick={() => go('dispatch')}>
            Go to Dispatch
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="n-grid-4">
        <StatCard label="Active Calls" value={active.length} sub={`${p1.length} priority 1`} color="var(--pr2-text)" accent={active.length > 0 ? 'var(--pr2-text)' : undefined} />
        <StatCard label="Units On Duty" value={onDuty.length} sub={`${available.length} available`} color="var(--n-blue)" accent="var(--n-text-data)" />
        <StatCard label="Pending Reports" value={pendingReports.length} sub="awaiting review" color="var(--pr3-text)" accent={pendingReports.length > 0 ? 'var(--pr3-text)' : undefined} />
        <StatCard label="Active Warrants" value={activeWarrants.length} sub="outstanding" color="var(--pr1-text)" accent={activeWarrants.length > 0 ? 'var(--pr1-text)' : undefined} />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 10, flex: 1, minHeight: 0 }}>
        {/* Left: modules + active calls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
          {/* Module grid */}
          <div className="n-panel" style={{ flexShrink: 0 }}>
            <div className="n-panel-header">
              <div className="n-panel-title">Operational Workspaces</div>
              <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
                {modules.length} MODULES
              </span>
            </div>
            <div style={{ padding: 10 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 8,
              }}>
                {modules.map(m => (
                  <ModuleCard key={m.page} {...m} go={go} />
                ))}
              </div>
            </div>
          </div>

          {/* Active calls */}
          <div className="n-panel" style={{ flex: 1, minHeight: 0 }}>
            <div className="n-panel-header">
              <div className="n-panel-title">Active Incidents</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {pending.length} PENDING · {active.filter(c => c.status === 'ACTIVE').length} ACTIVE
                </span>
                <button className="n-btn n-btn-primary n-btn-xs" onClick={() => go('dispatch')}>
                  Open Console
                </button>
              </div>
            </div>
            <div className="n-panel-body">
              {active.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--n-text-muted)', fontSize: 11 }}>
                  No active incidents
                </div>
              ) : (
                <table className="n-table">
                  <thead>
                    <tr>
                      <th>Call #</th>
                      <th>Pri</th>
                      <th>Nature</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.map(c => (
                      <tr key={c.id} className={c.priority === 1 ? 'row-p1' : c.priority === 2 ? 'row-p2' : ''}
                        onClick={() => go('dispatch')} style={{ cursor: 'pointer' }}>
                        <td><span className="n-data">{c.id}</span></td>
                        <td><PriBadge p={c.priority} /></td>
                        <td style={{ fontWeight: 500 }}>{c.nature}</td>
                        <td style={{ color: 'var(--n-text-dim)', fontSize: 11 }}>{c.location}</td>
                        <td>
                          <span className={`n-badge badge-${c.status === 'PENDING' ? 'orange' : c.status === 'ACTIVE' ? 'blue' : c.status === 'ENRT' ? 'yellow' : 'gray'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--n-text-dim)' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
          {/* TX feed */}
          <div className="n-panel" style={{ flex: 1, minHeight: 0 }}>
            <div className="n-panel-header">
              <div className="n-panel-title">Dispatch Feed</div>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--st-av-text)', boxShadow: '0 0 5px var(--st-av-text)' }} />
            </div>
            <div className="n-panel-body scroll-y">
              {dispatchLog.slice(0, 40).map(e => (
                <div key={e.id} className="tx-entry">
                  <span className="tx-time">{e.time}</span>
                  <span className={`tx-kind-${e.kind}`}>{e.text}</span>
                </div>
              ))}
              {dispatchLog.length === 0 && (
                <div style={{ padding: 16, color: 'var(--n-text-muted)', fontSize: 11, textAlign: 'center' }}>
                  No activity
                </div>
              )}
            </div>
          </div>

          {/* Unit quick view */}
          <div className="n-panel" style={{ maxHeight: 200, flexShrink: 0 }}>
            <div className="n-panel-header">
              <div className="n-panel-title">Unit Summary</div>
              <button className="n-btn n-btn-ghost n-btn-xs" onClick={() => go('units')}>View All</button>
            </div>
            <div className="n-panel-body scroll-y">
              {onDuty.slice(0, 8).map(o => (
                <div key={o.id} className="unit-row">
                  <StatusDot status={o.status} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--n-text-data)', minWidth: 52 }}>
                    {o.unitId}
                  </span>
                  <span style={{ fontSize: 11, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
