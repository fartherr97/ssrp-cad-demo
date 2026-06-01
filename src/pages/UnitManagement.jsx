import { useState } from 'react';
import { useCAD } from '../store/cadStore';

function StatusBadge({ status }) {
  const map = { AVAILABLE:'badge-available',BUSY:'badge-busy',ENRT:'badge-enrt',ARRVD:'badge-arrvd',OFFDUTY:'badge-offduty',UNAVAILABLE:'badge-unavailable' };
  return <span className={`n-badge ${map[status]||'badge-gray'}`}>{status}</span>;
}

export default function UnitManagement() {
  const { state, dispatch } = useCAD();
  const { officers, departments, calls, currentUser } = state;
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'dispatch';

  const filtered = officers.filter(o => {
    const deptMatch = deptFilter === 'ALL' || o.deptShort === deptFilter || o.dept === Number(deptFilter);
    const statMatch = statusFilter === 'ALL' || o.status === statusFilter;
    return deptMatch && statMatch;
  });

  const selOfficer = selected ? officers.find(o => o.id === selected) : null;
  const selCall = selOfficer?.callId ? calls.find(c => c.id === selOfficer.callId) : null;

  const onDuty = officers.filter(o => o.status !== 'OFFDUTY').length;
  const available = officers.filter(o => o.status === 'AVAILABLE').length;
  const responding = officers.filter(o => o.status === 'ENRT' || o.status === 'ARRVD').length;

  const STATUSES = ['ALL','AVAILABLE','BUSY','ENRT','ARRVD','UNAVAILABLE','OFFDUTY'];
  const DEPTS = ['ALL', ...departments.map(d => d.abbreviation)];

  return (
    <div className="n-page" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20, padding: '6px 10px',
        background: 'var(--n-bg-panel)', borderBottom: '1px solid var(--n-border)', flexShrink: 0,
      }}>
        {[
          { label: 'ON DUTY', value: onDuty, color: 'var(--n-text-data)' },
          { label: 'AVAILABLE', value: available, color: 'var(--st-av-text)' },
          { label: 'RESPONDING', value: responding, color: 'var(--st-enrt-text)' },
          { label: 'OFF DUTY', value: officers.length - onDuty, color: 'var(--n-text-muted)' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</span>
            <span style={{ fontSize: 8, color: 'var(--n-text-muted)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>{s.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <select className="n-select" style={{ width: 110, fontSize: 10 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            {DEPTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <select className="n-select" style={{ width: 110, fontSize: 10 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 0, flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Roster table */}
        <div className="n-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderBottom: 'none', borderRight: 'none' }}>
          <div className="n-panel-header">
            <div className="n-panel-title">Unit Roster</div>
            <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {filtered.length} RECORDS
            </span>
          </div>
          <div className="n-panel-body scroll-y">
            <table className="n-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Unit ID</th>
                  <th>Name</th>
                  <th>Badge</th>
                  <th>Department</th>
                  <th>Division</th>
                  <th>Rank</th>
                  <th>Assigned Call</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className={selected === o.id ? 'selected' : ''}
                    onClick={() => setSelected(o.id)}>
                    <td><StatusBadge status={o.status} /></td>
                    <td><span className="n-data">{o.unitId}</span></td>
                    <td style={{ fontWeight: 500 }}>{o.name}</td>
                    <td><span className="n-data" style={{ fontSize: 10 }}>{o.badge}</span></td>
                    <td>
                      <span className="n-badge badge-blue" style={{ fontSize: 9 }}>{o.deptShort}</span>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--n-text-dim)' }}>{o.subdivision}</td>
                    <td style={{ fontSize: 11, color: 'var(--n-text-dim)' }}>{o.rank}</td>
                    <td>
                      {o.callId
                        ? <span className="n-data" style={{ fontSize: 10 }}>{o.callId}</span>
                        : <span style={{ color: 'var(--n-text-muted)', fontSize: 10 }}>—</span>
                      }
                    </td>
                    {isAdmin && (
                      <td onClick={e => e.stopPropagation()}>
                        <select className="n-select" style={{ width: 80, fontSize: 9, padding: '1px 4px' }}
                          value={o.status}
                          onChange={e => dispatch({ type: 'SET_UNIT_STATUS', payload: { unitId: o.unitId, status: e.target.value } })}>
                          <option>AVAILABLE</option>
                          <option>BUSY</option>
                          <option>ENRT</option>
                          <option>ARRVD</option>
                          <option>UNAVAILABLE</option>
                          <option>OFFDUTY</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        <div className="n-panel" style={{ borderRadius: 0, borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}>
          {!selOfficer ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--n-text-muted)', padding: 20 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              <span style={{ fontSize: 11, textAlign: 'center' }}>Select a unit to view details</span>
            </div>
          ) : (
            <>
              <div className="n-panel-header">
                <div className="n-panel-title">Unit Profile</div>
                <StatusBadge status={selOfficer.status} />
              </div>
              <div className="n-panel-body scroll-y" style={{ padding: 12 }}>
                {/* Avatar / Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--n-bg-elevated)', border: '1px solid var(--n-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, color: 'var(--n-text-dim)', flexShrink: 0,
                  }}>
                    {selOfficer.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{selOfficer.name}</div>
                    <div className="n-data" style={{ fontSize: 10 }}>{selOfficer.badge}</div>
                  </div>
                </div>

                <div className="n-card" style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Assignment</div>
                  <div className="detail-row"><span className="detail-label">Unit ID</span><span className="detail-value-mono">{selOfficer.unitId}</span></div>
                  <div className="detail-row"><span className="detail-label">Department</span><span className="detail-value">{selOfficer.deptShort}</span></div>
                  <div className="detail-row"><span className="detail-label">Division</span><span className="detail-value">{selOfficer.subdivision}</span></div>
                  <div className="detail-row"><span className="detail-label">Rank</span><span className="detail-value">{selOfficer.rank}</span></div>
                  <div className="detail-row"><span className="detail-label">Role</span><span className="detail-value">{selOfficer.role}</span></div>
                </div>

                <div className="n-card" style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Current Status</div>
                  <div className="detail-row"><span className="detail-label">Status</span><StatusBadge status={selOfficer.status} /></div>
                  <div className="detail-row">
                    <span className="detail-label">Assigned Call</span>
                    <span className="detail-value-mono">{selOfficer.callId || '—'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{selOfficer.location || '—'}</span>
                  </div>
                </div>

                {selCall && (
                  <div className="n-card" style={{ border: '1px solid var(--n-border-accent)' }}>
                    <div style={{ fontSize: 9, color: 'var(--n-gold)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Active Call</div>
                    <div style={{ fontWeight: 600, marginBottom: 3 }}>{selCall.nature}</div>
                    <div style={{ fontSize: 11, color: 'var(--n-text-dim)' }}>{selCall.location}, {selCall.city}</div>
                    <div className="n-data" style={{ fontSize: 10, marginTop: 4 }}>{selCall.id}</div>
                  </div>
                )}

                {isAdmin && (
                  <div style={{ marginTop: 10 }}>
                    <div className="n-label" style={{ marginBottom: 6 }}>Set Status</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {['AVAILABLE','BUSY','ENRT','ARRVD','UNAVAILABLE','OFFDUTY'].map(s => (
                        <button key={s}
                          className={`n-btn n-btn-xs ${selOfficer.status === s ? 'n-btn-primary' : 'n-btn-secondary'}`}
                          onClick={() => dispatch({ type: 'SET_UNIT_STATUS', payload: { unitId: selOfficer.unitId, status: s } })}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
