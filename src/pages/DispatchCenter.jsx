import { useState, useEffect } from 'react';
import { useCAD } from '../store/cadStore';

function PriBadge({ p }) {
  const cls = ['', 'badge-p1', 'badge-p2', 'badge-p3', 'badge-p4'][p] || 'badge-gray';
  return <span className={`n-badge ${cls}`}>P{p}</span>;
}

function StatusBadge({ status }) {
  const map = {
    AVAILABLE: 'badge-available', BUSY: 'badge-busy',
    ENRT: 'badge-enrt', ARRVD: 'badge-arrvd',
    OFFDUTY: 'badge-offduty', UNAVAILABLE: 'badge-unavailable',
  };
  return <span className={`n-badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}

function Elapsed({ createdAt }) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    const tick = () => {
      const s = Math.floor((Date.now() - createdAt) / 1000);
      const m = Math.floor(s / 60);
      const sec = s % 60;
      setElapsed(`${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  const mins = Math.floor((Date.now() - createdAt) / 60000);
  const color = mins >= 15 ? 'var(--pr1-text)' : mins >= 8 ? 'var(--pr2-text)' : 'var(--n-text-data)';
  return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color }}>{elapsed}</span>;
}

export default function DispatchCenter() {
  const { state, dispatch } = useCAD();
  const { calls, officers, dispatchLog, currentUser } = state;
  const [selectedCall, setSelectedCall] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [radioMsg, setRadioMsg] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCall, setNewCall] = useState({
    nature: '', location: '', city: 'Tampa', county: 'Hillsborough County',
    priority: 3, category: 'police', description: '', reportingParty: '',
  });

  const isDispatch = currentUser?.role === 'dispatch' || currentUser?.role === 'admin';

  const activeCalls = calls.filter(c => c.status !== 'CLOSED');
  const filteredCalls = filter === 'ALL' ? activeCalls : activeCalls.filter(c => c.status === filter || c.priority === Number(filter.replace('P', '')));

  const selCall = selectedCall ? calls.find(c => c.id === selectedCall) : null;
  const onDuty = officers.filter(o => o.status !== 'OFFDUTY');
  const availableUnits = onDuty.filter(o => !o.callId);

  const p = (n) => String(n).padStart(2, '0');
  const nowTime = () => {
    const d = new Date();
    return `${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  const assignUnit = (unitId) => {
    if (!selCall) return;
    dispatch({ type: 'ASSIGN_UNIT', payload: { callId: selCall.id, unitId } });
  };
  const detachUnit = (unitId) => {
    if (!selCall) return;
    dispatch({ type: 'DETACH_UNIT', payload: { callId: selCall.id, unitId } });
  };
  const closeCall = () => {
    if (!selCall) return;
    dispatch({ type: 'CLOSE_CALL', payload: selCall.id });
    setSelectedCall(null);
  };
  const sendRadio = () => {
    if (!radioMsg.trim()) return;
    dispatch({ type: 'DISPATCH_RADIO', payload: radioMsg.trim() });
    setRadioMsg('');
  };
  const createCall = () => {
    if (!newCall.nature || !newCall.location) return;
    dispatch({ type: 'CREATE_CALL', payload: { ...newCall, status: 'PENDING' } });
    setNewCall({ nature: '', location: '', city: 'Tampa', county: 'Hillsborough County', priority: 3, category: 'police', description: '', reportingParty: '' });
    setShowCreateForm(false);
  };

  const NATURES = [
    'Traffic Stop', 'Suspicious Person', 'Suspicious Vehicle', 'Domestic Disturbance',
    'Assault', 'Robbery', 'Burglary', 'MVA', 'MVA w/ Injuries', 'Medical Emergency',
    'Cardiac Arrest', 'Structure Fire', 'Vehicle Fire', 'Brush Fire',
    'Officer Needs Assistance', 'Pursuit', 'Noise Complaint', 'Check Welfare',
    'Armed Subject', 'Shooting', 'Stabbing', 'Shots Fired', 'Drug Activity', 'Other',
  ];

  return (
    <div className="n-page" style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
      {/* Quick stats header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        background: 'var(--n-bg-panel)', borderBottom: '1px solid var(--n-border)',
        padding: '5px 10px', flexShrink: 0, gap: 16,
      }}>
        {[
          { label: 'TOTAL ACTIVE', value: activeCalls.length, color: 'var(--n-text)' },
          { label: 'PENDING', value: activeCalls.filter(c => c.status === 'PENDING').length, color: 'var(--pr2-text)' },
          { label: 'P1 CRITICAL', value: activeCalls.filter(c => c.priority === 1).length, color: 'var(--pr1-text)' },
          { label: 'UNASSIGNED', value: activeCalls.filter(c => c.units.length === 0).length, color: 'var(--pr3-text)' },
          { label: 'ON DUTY', value: onDuty.length, color: 'var(--n-text-data)' },
          { label: 'AVAILABLE', value: availableUnits.length, color: 'var(--st-av-text)' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: s.color, lineHeight: 1.1 }}>{s.value}</span>
            <span style={{ fontSize: 8, color: 'var(--n-text-muted)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>{s.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {isDispatch && (
            <button className="n-btn n-btn-primary n-btn-sm" onClick={() => setShowCreateForm(true)}>
              + New Call
            </button>
          )}
        </div>
      </div>

      {/* Three-column layout */}
      <div className="split-3" style={{ padding: 8 }}>
        {/* LEFT: Call Queue */}
        <div className="n-panel">
          <div className="n-panel-header">
            <div className="n-panel-title">Call Queue</div>
            <select className="n-select" style={{ width: 90, fontSize: 10, padding: '2px 5px' }} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="ENRT">En Route</option>
              <option value="P1">P1 Critical</option>
              <option value="P2">P2 High</option>
            </select>
          </div>
          <div className="n-panel-body scroll-y">
            {filteredCalls.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--n-text-muted)', fontSize: 11 }}>
                No calls
              </div>
            )}
            {filteredCalls.sort((a,b) => a.priority - b.priority).map(c => (
              <div
                key={c.id}
                className={`call-card p${c.priority}${selectedCall === c.id ? ' selected' : ''}`}
                onClick={() => setSelectedCall(c.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                  <PriBadge p={c.priority} />
                  <span className="n-data" style={{ fontSize: 10 }}>{c.id}</span>
                  <span style={{ marginLeft: 'auto' }}>
                    <span className={`n-badge badge-${c.status === 'PENDING' ? 'orange' : c.status === 'ACTIVE' ? 'blue' : c.status === 'ENRT' ? 'yellow' : 'gray'}`} style={{ fontSize: 8 }}>
                      {c.status}
                    </span>
                  </span>
                </div>
                <div className="call-nature">{c.nature}</div>
                <div className="call-meta">{c.location}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
                  <span style={{ fontSize: 10, color: 'var(--n-text-muted)' }}>
                    {c.units.length > 0 ? c.units.join(', ') : 'Unassigned'}
                  </span>
                  {c.createdAt && <Elapsed createdAt={c.createdAt} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: Call Detail */}
        <div className="n-panel">
          {!selCall ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--n-text-muted)', padding: 24 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.3">
                <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--n-text-dim)', marginBottom: 4 }}>No call selected</div>
                <div style={{ fontSize: 10, color: 'var(--n-text-muted)' }}>Select a call from the queue to view details and manage units</div>
              </div>
              {isDispatch && (
                <button className="n-btn n-btn-primary" onClick={() => setShowCreateForm(true)}>
                  Create New Call
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="n-panel-header">
                <div>
                  <div className="n-panel-title">
                    <span className="n-data">{selCall.id}</span>
                    · {selCall.nature}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
                    {selCall.timestamp}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  <PriBadge p={selCall.priority} />
                  {isDispatch && (
                    <button className="n-btn n-btn-danger n-btn-sm" onClick={closeCall}>
                      Close Call
                    </button>
                  )}
                </div>
              </div>

              <div className="n-panel-body scroll-y" style={{ padding: 12 }}>
                {/* Location */}
                <div className="n-card" style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 4 }}>Location</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{selCall.location}</div>
                  <div style={{ fontSize: 11, color: 'var(--n-text-dim)' }}>{selCall.city}, {selCall.county}</div>
                </div>

                {/* Details grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  {[
                    { label: 'Category', value: selCall.category?.toUpperCase() },
                    { label: 'Status', value: selCall.status },
                    { label: 'Reporting Party', value: selCall.reportingParty || '—' },
                    { label: 'Elapsed', value: selCall.createdAt ? <Elapsed createdAt={selCall.createdAt} /> : '—' },
                  ].map(f => (
                    <div key={f.label} className="n-card" style={{ padding: '6px 8px' }}>
                      <div className="n-label" style={{ marginBottom: 2 }}>{f.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--n-text)' }}>{f.value}</div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div className="n-card" style={{ marginBottom: 10 }}>
                  <div className="n-label" style={{ marginBottom: 4 }}>Call Description</div>
                  <div style={{ fontSize: 11.5, color: 'var(--n-text)', lineHeight: 1.6 }}>
                    {selCall.description || 'No description provided.'}
                  </div>
                </div>

                {/* Assigned units */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>
                    Assigned Units ({selCall.units.length})
                  </div>
                  {selCall.units.length === 0 ? (
                    <div style={{ fontSize: 11, color: 'var(--n-text-muted)', padding: '6px 0' }}>No units assigned</div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {selCall.units.map(uid => {
                        const off = officers.find(o => o.unitId === uid);
                        return (
                          <div key={uid} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'var(--n-bg-card)', border: '1px solid var(--n-border)',
                            borderRadius: 3, padding: '3px 8px',
                          }}>
                            <span className="n-data" style={{ fontSize: 10 }}>{uid}</span>
                            {off && <span style={{ fontSize: 10, color: 'var(--n-text-dim)' }}>{off.name}</span>}
                            {isDispatch && (
                              <button
                                style={{ background: 'none', border: 'none', color: 'var(--pr1-text)', cursor: 'pointer', fontSize: 12, padding: '0 1px', lineHeight: 1 }}
                                onClick={() => detachUnit(uid)}
                                title="Detach unit"
                              >×</button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Assign available unit */}
                {isDispatch && (
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>
                      Assign Unit
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {availableUnits.map(o => (
                        <button
                          key={o.id}
                          className="n-btn n-btn-success n-btn-sm"
                          onClick={() => assignUnit(o.unitId)}
                        >
                          {o.unitId}
                        </button>
                      ))}
                      {availableUnits.length === 0 && (
                        <span style={{ fontSize: 11, color: 'var(--n-text-muted)' }}>No available units</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Unit Roster + TX Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
          {/* Unit Roster */}
          <div className="n-panel" style={{ flex: 1, minHeight: 0 }}>
            <div className="n-panel-header">
              <div className="n-panel-title">Unit Roster</div>
              <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
                {onDuty.length} ON DUTY
              </span>
            </div>
            <div className="n-panel-body scroll-y">
              {onDuty.map(o => (
                <div key={o.id} className="unit-row" onClick={() => o.callId ? setSelectedCall(o.callId) : null}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    background: o.status === 'AVAILABLE' ? 'var(--st-av-text)' :
                      o.status === 'BUSY' ? 'var(--st-busy-text)' :
                      o.status === 'ENRT' ? 'var(--st-enrt-text)' : 'var(--st-od-text)',
                  }} />
                  <span className="n-data" style={{ minWidth: 48, fontSize: 10 }}>{o.unitId}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.name}</div>
                    <div style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {o.deptShort} · {o.callId || 'Unassigned'}
                    </div>
                  </div>
                  {isDispatch && (
                    <select
                      className="n-select"
                      style={{ width: 60, fontSize: 9, padding: '1px 3px' }}
                      value={o.status}
                      onChange={e => dispatch({ type: 'SET_UNIT_STATUS', payload: { unitId: o.unitId, status: e.target.value } })}
                      onClick={e => e.stopPropagation()}
                    >
                      <option>AVAILABLE</option>
                      <option>BUSY</option>
                      <option>ENRT</option>
                      <option>ARRVD</option>
                      <option>UNAVAILABLE</option>
                    </select>
                  )}
                </div>
              ))}
              {onDuty.length === 0 && (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--n-text-muted)', fontSize: 11 }}>
                  No units on duty
                </div>
              )}
            </div>
          </div>

          {/* TX Log */}
          <div className="n-panel" style={{ height: 180, flexShrink: 0 }}>
            <div className="n-panel-header">
              <div className="n-panel-title">TX Log</div>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--st-av-text)', boxShadow: '0 0 5px var(--st-av-text)' }} />
            </div>
            <div className="n-panel-body scroll-y" style={{ maxHeight: 120 }}>
              {dispatchLog.slice(0, 30).map(e => (
                <div key={e.id} className="tx-entry">
                  <span className="tx-time">{e.time}</span>
                  <span className={`tx-kind-${e.kind}`} style={{ flex: 1 }}>{e.text}</span>
                </div>
              ))}
            </div>
            {isDispatch && (
              <div style={{ padding: '5px 8px', borderTop: '1px solid var(--n-border-faint)', display: 'flex', gap: 5, flexShrink: 0 }}>
                <input
                  className="n-input"
                  style={{ fontSize: 11 }}
                  placeholder="Broadcast radio message..."
                  value={radioMsg}
                  onChange={e => setRadioMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendRadio()}
                />
                <button className="n-btn n-btn-primary n-btn-sm" onClick={sendRadio} disabled={!radioMsg.trim()}>TX</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Call Modal */}
      {showCreateForm && (
        <div className="n-overlay" onClick={e => e.target === e.currentTarget && setShowCreateForm(false)}>
          <div className="n-modal n-modal-wide">
            <div className="n-modal-header">
              <div className="n-modal-title">Create New Incident</div>
              <button className="n-btn n-btn-ghost n-btn-sm" onClick={() => setShowCreateForm(false)}>✕</button>
            </div>
            <div className="n-modal-body">
              <div className="n-grid-2">
                <div className="n-field">
                  <label className="n-label">Nature of Call *</label>
                  <select className="n-select" value={newCall.nature} onChange={e => setNewCall(p => ({ ...p, nature: e.target.value }))}>
                    <option value="">Select nature...</option>
                    {NATURES.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div className="n-field">
                  <label className="n-label">Category</label>
                  <select className="n-select" value={newCall.category} onChange={e => setNewCall(p => ({ ...p, category: e.target.value }))}>
                    <option value="police">Law Enforcement</option>
                    <option value="fire">Fire / EMS</option>
                  </select>
                </div>
              </div>
              <div className="n-field">
                <label className="n-label">Location / Address *</label>
                <input className="n-input" placeholder="e.g. 412 Oak Ave / I-275 MM 42" value={newCall.location} onChange={e => setNewCall(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div className="n-grid-2">
                <div className="n-field">
                  <label className="n-label">City</label>
                  <select className="n-select" value={newCall.city} onChange={e => setNewCall(p => ({ ...p, city: e.target.value }))}>
                    {['Tampa','Brandon','Plant City','Riverview','Ruskin','Gibsonton','Unincorporated'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="n-field">
                  <label className="n-label">Priority</label>
                  <select className="n-select" value={newCall.priority} onChange={e => setNewCall(p => ({ ...p, priority: Number(e.target.value) }))}>
                    <option value={1}>P1 — Critical</option>
                    <option value={2}>P2 — High</option>
                    <option value={3}>P3 — Medium</option>
                    <option value={4}>P4 — Low</option>
                  </select>
                </div>
              </div>
              <div className="n-field">
                <label className="n-label">Reporting Party</label>
                <input className="n-input" placeholder="Caller name / method..." value={newCall.reportingParty} onChange={e => setNewCall(p => ({ ...p, reportingParty: e.target.value }))} />
              </div>
              <div className="n-field">
                <label className="n-label">Incident Description</label>
                <textarea className="n-textarea" rows={3} placeholder="Describe the incident in detail..." value={newCall.description} onChange={e => setNewCall(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div className="n-modal-footer">
              <button className="n-btn n-btn-secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
              <button className="n-btn n-btn-primary" onClick={createCall} disabled={!newCall.nature || !newCall.location}>
                Create Incident
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
