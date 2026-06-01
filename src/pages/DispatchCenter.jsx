import { useState, useEffect, useCallback } from 'react';
import { useCAD } from '../store/cadStore';

/* ─── Elapsed timer ─── */
function Elapsed({ createdAt }) {
  const [elapsed, setElapsed] = useState('');
  const [cls, setCls] = useState('ok');
  useEffect(() => {
    const tick = () => {
      const s = Math.floor((Date.now() - createdAt) / 1000);
      const m = Math.floor(s / 60);
      const sec = s % 60;
      setElapsed(`${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`);
      setCls(m >= 15 ? 'crit' : m >= 8 ? 'warn' : 'ok');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  return <span className={`elapsed ${cls}`}>{elapsed}</span>;
}

/* ─── Status badge ─── */
function StatusBadge({ status }) {
  const map = {
    AVAILABLE:   'av',
    BUSY:        'busy',
    ENRT:        'enrt',
    ARRVD:       'arrvd',
    OFFDUTY:     'od',
    UNAVAILABLE: 'unavl',
  };
  const labels = {
    AVAILABLE:   'AVL',
    BUSY:        'BUSY',
    ENRT:        'ENRT',
    ARRVD:       'ARRVD',
    OFFDUTY:     'OFD',
    UNAVAILABLE: 'UNAVL',
  };
  return <span className={`cad-status ${map[status] || 'od'}`}>{labels[status] || status}</span>;
}

/* ─── Call status badge ─── */
function CallStatus({ status }) {
  const cls = { PENDING: 'pending', ACTIVE: 'active', ENRT: 'enrt', CLOSED: 'closed' }[status] || 'closed';
  return <span className={`cad-call-status ${cls}`}>{status}</span>;
}

/* ─── Priority badge ─── */
function PriBadge({ p }) {
  return <span className={`cad-pri p${p}`}>P{p}</span>;
}

/* ─── Agency badge ─── */
function AgencyBadge({ agency }) {
  const cls = agency?.toLowerCase().replace(/[^a-z]/g, '') || 'civ';
  return <span className={`cad-agency ${cls}`}>{agency}</span>;
}

/* ─── Call nature display (for calls grid) ─── */
const CALL_NATURES = [
  'Traffic Stop', 'Suspicious Person', 'Suspicious Vehicle', 'Domestic Disturbance',
  'Assault', 'Robbery', 'Burglary', 'MVA', 'MVA w/ Injuries', 'Medical Emergency',
  'Medical - Cardiac Arrest', 'Structure Fire', 'Vehicle Fire', 'Brush Fire',
  'Officer Needs Assistance', 'Pursuit', 'Noise Complaint', 'Check Welfare',
  'Armed Subject', 'Shooting', 'Stabbing', 'Shots Fired', 'Drug Activity',
  'Theft - Shoplifting', 'Road Hazard', 'Trespassing', 'Other',
];

/* ─── Main component ─── */
export default function DispatchCenter({ showCreateForm: externalShow, onCloseCreate }) {
  const { state, dispatch } = useCAD();
  const { calls, officers, dispatchLog, currentUser } = state;

  const [selectedCallId, setSelectedCallId] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [callFilter, setCallFilter] = useState('ALL');
  const [unitFilter, setUnitFilter] = useState('ALL');
  const [internalShow, setInternalShow] = useState(false);

  const showCreateForm = externalShow || internalShow;
  const setShowCreateForm = (v) => {
    setInternalShow(v);
    if (!v && onCloseCreate) onCloseCreate();
  };
  const [mobileTab, setMobileTab] = useState('calls');
  const [radioMsg, setRadioMsg] = useState('');
  const [newCall, setNewCall] = useState({
    nature: '', location: '', city: 'Tampa', county: 'Hillsborough',
    priority: 1, category: 'police', description: '', reportingParty: '',
  });

  const isDispatch = currentUser?.role === 'dispatch' || currentUser?.role === 'admin';

  const activeCalls = calls.filter(c => c.status !== 'CLOSED');
  const filteredCalls = callFilter === 'ALL'
    ? activeCalls
    : callFilter.startsWith('P')
      ? activeCalls.filter(c => c.priority === Number(callFilter.replace('P', '')))
      : activeCalls.filter(c => c.status === callFilter);

  const sortedCalls = [...filteredCalls].sort((a, b) => a.priority - b.priority);

  const onDutyOfficers = officers.filter(o => o.status !== 'OFFDUTY');
  const filteredUnits = unitFilter === 'ALL'
    ? onDutyOfficers
    : onDutyOfficers.filter(o => o.status === unitFilter || o.deptShort === unitFilter);

  const selCall = selectedCallId ? calls.find(c => c.id === selectedCallId) : null;
  const selUnit = selectedUnitId ? officers.find(o => o.unitId === selectedUnitId) : null;

  const availableUnits = onDutyOfficers.filter(o => o.status === 'AVAILABLE' || o.status === 'ENRT');

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
    setSelectedCallId(null);
  };

  const updateCallStatus = (status) => {
    if (!selCall) return;
    dispatch({ type: 'UPDATE_CALL', payload: { id: selCall.id, status } });
  };

  const sendRadio = () => {
    if (!radioMsg.trim()) return;
    dispatch({ type: 'DISPATCH_RADIO', payload: radioMsg.trim() });
    setRadioMsg('');
  };

  const createCall = () => {
    if (!newCall.nature || !newCall.location) return;
    dispatch({ type: 'CREATE_CALL', payload: { ...newCall, status: 'PENDING' } });
    setNewCall({ nature: '', location: '', city: 'Tampa', county: 'Hillsborough', priority: 1, category: 'police', description: '', reportingParty: '' });
    setShowCreateForm(false);
  };

  const setUnitStatus = (unitId, status) => {
    dispatch({ type: 'SET_UNIT_STATUS', payload: { unitId, status } });
  };

  /* Key counts for title bars */
  const p1Count = activeCalls.filter(c => c.priority === 1).length;
  const pendingCount = activeCalls.filter(c => c.status === 'PENDING').length;
  const unassignedCount = activeCalls.filter(c => c.units.length === 0).length;

  return (
    <div className={`cad-dispatch${mobileTab === 'detail' ? ' detail-tab' : ''}`}>
      {/* ─── LEFT/CENTER: Two grids stacked ─── */}
      <div className="cad-dispatch-main">

        {/* Mobile tab bar */}
        <div className="mob-tab-bar">
          <button className={`mob-tab${mobileTab === 'calls' ? ' active' : ''}`} onClick={() => setMobileTab('calls')}>
            CALLS ({sortedCalls.length})
            {p1Count > 0 && <span style={{ marginLeft: 4, color: 'var(--pr1-text)' }}>▲P1</span>}
          </button>
          <button className={`mob-tab${mobileTab === 'units' ? ' active' : ''}`} onClick={() => setMobileTab('units')}>
            UNITS ({onDutyOfficers.length})
          </button>
          <button className={`mob-tab${mobileTab === 'detail' ? ' active' : ''}`} onClick={() => setMobileTab('detail')}>
            DETAIL {selCall ? `· ${selCall.id}` : ''}
          </button>
        </div>

        {/* CALLS GRID */}
        <div className={`cad-grid-panel calls-panel${mobileTab === 'calls' ? ' mob-active' : ''}`}>
          <div className="cad-grid-titlebar">
            <span className="cad-grid-title">■ ACTIVE SERVICE CALLS</span>
            <span className="cad-grid-count">({sortedCalls.length})</span>
            {p1Count > 0 && (
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--pr1-text)', fontWeight: 700, marginLeft: 4, animation: 'pulseRed 1.5s ease-in-out infinite' }}>
                ▲ P1:{p1Count}
              </span>
            )}
            {pendingCount > 0 && (
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--pr2-text)', marginLeft: 4 }}>
                PNDG:{pendingCount}
              </span>
            )}
            {unassignedCount > 0 && (
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--pr3-text)', marginLeft: 4 }}>
                UNASN:{unassignedCount}
              </span>
            )}

            <div className="cad-grid-filters">
              {['ALL','PENDING','ACTIVE','ENRT','P1','P2','P3','P4'].map(f => (
                <button
                  key={f}
                  className={`cad-filter-btn${callFilter === f ? ' active' : ''}`}
                  onClick={() => setCallFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="cad-grid-actions">
              {isDispatch && (
                <button
                  className="cad-action-btn btn-create"
                  style={{ height: 16, fontSize: 9 }}
                  onClick={() => setShowCreateForm(true)}
                >
                  + NEW CALL
                </button>
              )}
            </div>
          </div>

          <div className="cad-table-wrap">
            <table className="cad-table" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: 74 }} />
                <col style={{ width: 160 }} />
                <col style={{ width: 190 }} />
                <col style={{ width: 90 }} />
                <col style={{ width: 100 }} />
                <col style={{ width: 40 }} />
                <col style={{ width: 68 }} />
                <col style={{ width: 60 }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>CALL #</th>
                  <th>NATURE</th>
                  <th>LOCATION</th>
                  <th>CITY</th>
                  <th>COUNTY</th>
                  <th>PRI</th>
                  <th>STATUS</th>
                  <th>ELAPSED</th>
                  <th>ASSIGNED UNITS</th>
                </tr>
              </thead>
              <tbody>
                {sortedCalls.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="cad-table-empty">NO ACTIVE CALLS</div>
                    </td>
                  </tr>
                ) : sortedCalls.map(c => (
                  <tr
                    key={c.id}
                    className={`pri-${c.priority}${selectedCallId === c.id ? ' row-selected' : ''}`}
                    onClick={() => { setSelectedCallId(c.id); setSelectedUnitId(null); setMobileTab('detail'); }}
                  >
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--n-text-data)', fontWeight: 600 }}>{c.id}</td>
                    <td style={{ fontWeight: 500 }}>{c.nature}</td>
                    <td style={{ color: 'var(--n-text-dim)' }}>{c.location}</td>
                    <td style={{ color: 'var(--n-text-dim)' }}>{c.city}</td>
                    <td style={{ color: 'var(--n-text-muted)', fontSize: 10 }}>{c.county}</td>
                    <td><PriBadge p={c.priority} /></td>
                    <td><CallStatus status={c.status} /></td>
                    <td>{c.createdAt ? <Elapsed createdAt={c.createdAt} /> : <span style={{ color: 'var(--n-text-muted)' }}>—</span>}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: c.units.length > 0 ? 'var(--st-enrt-text)' : 'var(--n-text-muted)' }}>
                      {c.units.length > 0 ? c.units.join(', ') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* UNITS GRID */}
        <div className={`cad-grid-panel units-panel${mobileTab === 'units' ? ' mob-active' : ''}`}>
          <div className="cad-grid-titlebar">
            <span className="cad-grid-title">■ FIELD UNITS</span>
            <span className="cad-grid-count">({onDutyOfficers.length} ON DUTY)</span>
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--st-av-text)', marginLeft: 6 }}>
              AVL: {officers.filter(o => o.status === 'AVAILABLE').length}
            </span>
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--st-busy-text)', marginLeft: 6 }}>
              BUSY: {officers.filter(o => o.status === 'BUSY').length}
            </span>
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--st-enrt-text)', marginLeft: 6 }}>
              ENRT: {officers.filter(o => o.status === 'ENRT').length}
            </span>

            <div className="cad-grid-filters">
              {['ALL','AVAILABLE','ENRT','BUSY','ARRVD','UNAVAILABLE'].map(f => (
                <button
                  key={f}
                  className={`cad-filter-btn${unitFilter === f ? ' active' : ''}`}
                  onClick={() => setUnitFilter(f)}
                >
                  {f === 'UNAVAILABLE' ? 'UNAVL' : f === 'AVAILABLE' ? 'AVL' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="cad-table-wrap">
            <table className="cad-table" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: 82 }} />
                <col style={{ width: 68 }} />
                <col style={{ width: 74 }} />
                <col style={{ width: 64 }} />
                <col style={{ width: 180 }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>UNIT</th>
                  <th>STATUS</th>
                  <th>CALL #</th>
                  <th>AGENCY</th>
                  <th>LOCATION</th>
                  <th>NAME / RANK</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="cad-table-empty">NO UNITS MATCH FILTER</div>
                    </td>
                  </tr>
                ) : filteredUnits.map(o => (
                  <tr
                    key={o.id}
                    className={selectedUnitId === o.unitId ? 'row-selected' : ''}
                    onClick={() => {
                      setSelectedUnitId(o.unitId);
                      if (o.callId) setSelectedCallId(o.callId);
                      else setSelectedCallId(null);
                      setMobileTab('detail');
                    }}
                  >
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--n-text-data)' }}>{o.unitId}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: o.callId ? 'var(--pr3-text)' : 'var(--n-text-muted)' }}>
                      {o.callId || '—'}
                    </td>
                    <td><AgencyBadge agency={o.deptShort} /></td>
                    <td style={{ color: 'var(--n-text-dim)', fontSize: 10 }}>{o.location}</td>
                    <td style={{ color: 'var(--n-text-dim)', fontSize: 10 }}>
                      {o.name}
                      {o.rank && <span style={{ color: 'var(--n-text-muted)', marginLeft: 4 }}>· {o.rank}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Detail Panel ─── */}
      <div className={`cad-dispatch-detail${mobileTab === 'detail' ? ' mob-active' : ''}`}>
        {/* Mobile back button */}
        <button className="mob-back-btn" onClick={() => setMobileTab(selectedCallId ? 'calls' : 'units')}>
          ← Back to {selectedCallId ? 'Calls' : 'Units'}
        </button>
        {/* CALL DETAILS section */}
        <div className="detail-titlebar">
          <span className="detail-title">■ {selCall ? 'INCIDENT DETAIL' : 'NO CALL SELECTED'}</span>
          {selCall && <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--n-text-data)', fontWeight: 700 }}>{selCall.id}</span>}
        </div>

        <div className="detail-body">
          {selCall ? (
            <>
              {/* Call header */}
              <div className="detail-section" style={{ background: '#060f1e' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--n-text)', marginBottom: 3, lineHeight: 1.2 }}>
                  {selCall.nature}
                </div>
                <div style={{ fontSize: 10, color: 'var(--n-text-dim)', marginBottom: 2 }}>
                  {selCall.location}
                </div>
                <div style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {selCall.city}, {selCall.county}
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
                  <PriBadge p={selCall.priority} />
                  <CallStatus status={selCall.status} />
                  {selCall.createdAt && <Elapsed createdAt={selCall.createdAt} />}
                </div>
              </div>

              {/* Call details */}
              <div className="detail-section">
                <div className="detail-section-title">CALL INFORMATION</div>
                <div className="detail-row">
                  <span className="detail-label">CALL #</span>
                  <span className="detail-value mono">{selCall.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">CATEGORY</span>
                  <span className="detail-value">{selCall.category?.toUpperCase()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">RPT PARTY</span>
                  <span className="detail-value">{selCall.reportingParty || '—'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">TIMESTAMP</span>
                  <span className="detail-value mono" style={{ fontSize: 9 }}>{selCall.timestamp}</span>
                </div>
              </div>

              {/* Description */}
              <div className="detail-section">
                <div className="detail-section-title">NARRATIVE</div>
                <div className="detail-desc">{selCall.description || 'No narrative provided.'}</div>
              </div>

              {/* Assigned units */}
              <div className="detail-section">
                <div className="detail-section-title" style={{ marginBottom: 4 }}>
                  ASSIGNED UNITS ({selCall.units.length})
                </div>
                {selCall.units.length === 0 ? (
                  <div style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    NO UNITS ASSIGNED
                  </div>
                ) : (
                  selCall.units.map(uid => {
                    const off = officers.find(o => o.unitId === uid);
                    return (
                      <div key={uid} className="detail-unit-row">
                        <span className="detail-unit-id">{uid}</span>
                        <span className="detail-unit-name">{off?.name || '—'}</span>
                        {isDispatch && (
                          <button
                            onClick={() => detachUnit(uid)}
                            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--pr1-text)', cursor: 'pointer', fontSize: 12, padding: '0 2px', lineHeight: 1 }}
                            title="Detach unit"
                          >×</button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Assign unit */}
              {isDispatch && (
                <div className="detail-section">
                  <div className="detail-section-title" style={{ marginBottom: 4 }}>ASSIGN UNIT</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {availableUnits
                      .filter(o => !selCall.units.includes(o.unitId))
                      .map(o => (
                        <button
                          key={o.id}
                          style={{
                            padding: '1px 6px', fontSize: 9, fontFamily: 'var(--font-mono)',
                            background: '#001a06', color: 'var(--st-av-text)',
                            border: '1px solid var(--st-av-border)', cursor: 'pointer',
                            fontWeight: 700, letterSpacing: '0.3px',
                          }}
                          onClick={() => assignUnit(o.unitId)}
                          title={`${o.name} · ${o.deptShort}`}
                        >
                          {o.unitId}
                        </button>
                      ))
                    }
                    {availableUnits.filter(o => !selCall.units.includes(o.unitId)).length === 0 && (
                      <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        NO AVAILABLE UNITS
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Call status actions */}
              {isDispatch && (
                <div className="detail-section">
                  <div className="detail-section-title" style={{ marginBottom: 4 }}>CALL STATUS</div>
                  <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {['PENDING','ACTIVE','ENRT'].map(s => (
                      <button
                        key={s}
                        style={{
                          padding: '2px 7px', fontSize: 9, fontFamily: 'var(--font-mono)',
                          background: selCall.status === s ? '#061828' : '#04090f',
                          color: selCall.status === s ? '#80b8e0' : 'var(--n-text-muted)',
                          border: `1px solid ${selCall.status === s ? '#0d3a60' : 'var(--n-border-faint)'}`,
                          cursor: 'pointer', fontWeight: 600, letterSpacing: '0.3px',
                        }}
                        onClick={() => updateCallStatus(s)}
                      >
                        {s}
                      </button>
                    ))}
                    <button
                      style={{
                        padding: '2px 7px', fontSize: 9, fontFamily: 'var(--font-mono)',
                        background: '#0e0000', color: 'var(--pr1-text)',
                        border: '1px solid #300000', cursor: 'pointer',
                        fontWeight: 700, letterSpacing: '0.3px', marginLeft: 4,
                      }}
                      onClick={closeCall}
                    >
                      CLOSE CALL
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{
              padding: '16px 8px', textAlign: 'center',
              color: 'var(--n-text-muted)', fontSize: 9,
              fontFamily: 'var(--font-mono)', lineHeight: 2,
            }}>
              SELECT A CALL FROM THE<br />ACTIVE CALLS GRID<br />TO VIEW INCIDENT DETAILS
            </div>
          )}

          {/* Unit detail (when unit selected, no call) */}
          {!selCall && selUnit && (
            <div className="detail-section">
              <div className="detail-section-title">UNIT DETAIL</div>
              <div className="detail-row">
                <span className="detail-label">UNIT ID</span>
                <span className="detail-value mono">{selUnit.unitId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">NAME</span>
                <span className="detail-value">{selUnit.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">RANK</span>
                <span className="detail-value">{selUnit.rank}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">AGENCY</span>
                <span className="detail-value">{selUnit.deptShort}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">STATUS</span>
                <span className="detail-value"><StatusBadge status={selUnit.status} /></span>
              </div>
              <div className="detail-row">
                <span className="detail-label">LOCATION</span>
                <span className="detail-value">{selUnit.location}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">CALL</span>
                <span className="detail-value mono">{selUnit.callId || '—'}</span>
              </div>
              {isDispatch && (
                <div style={{ marginTop: 6 }}>
                  <div className="detail-section-title" style={{ marginBottom: 3 }}>SET STATUS</div>
                  <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {['AVAILABLE','ENRT','BUSY','ARRVD','UNAVAILABLE','OFFDUTY'].map(s => (
                      <button
                        key={s}
                        style={{
                          padding: '1px 5px', fontSize: 8, fontFamily: 'var(--font-mono)',
                          background: selUnit.status === s ? '#061828' : '#04090f',
                          color: selUnit.status === s ? '#80b8e0' : 'var(--n-text-muted)',
                          border: `1px solid ${selUnit.status === s ? '#0d3a60' : 'var(--n-border-faint)'}`,
                          cursor: 'pointer', fontWeight: 600, letterSpacing: '0.3px',
                        }}
                        onClick={() => setUnitStatus(selUnit.unitId, s)}
                      >
                        {s === 'AVAILABLE' ? 'AVL' : s === 'UNAVAILABLE' ? 'UNAVL' : s === 'OFFDUTY' ? 'OFD' : s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Radio TX */}
          {isDispatch && (
            <div className="detail-section">
              <div className="detail-section-title" style={{ marginBottom: 4 }}>RADIO BROADCAST</div>
              <div style={{ display: 'flex', gap: 3 }}>
                <input
                  style={{
                    flex: 1, background: 'var(--n-bg-input)', border: '1px solid var(--n-border)',
                    color: 'var(--n-text)', fontFamily: 'var(--font-mono)', fontSize: 10,
                    padding: '3px 5px', outline: 'none',
                  }}
                  placeholder="Broadcast message..."
                  value={radioMsg}
                  onChange={e => setRadioMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendRadio()}
                />
                <button
                  style={{
                    padding: '3px 8px', fontSize: 9, fontFamily: 'var(--font-mono)',
                    background: radioMsg.trim() ? '#061828' : '#04090f',
                    color: radioMsg.trim() ? '#80b8e0' : 'var(--n-text-muted)',
                    border: `1px solid ${radioMsg.trim() ? '#0d3a60' : 'var(--n-border-faint)'}`,
                    cursor: 'pointer', fontWeight: 700,
                  }}
                  onClick={sendRadio}
                  disabled={!radioMsg.trim()}
                >
                  TX
                </button>
              </div>
            </div>
          )}

          {/* Dispatch log */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 80 }}>
            <div className="detail-titlebar" style={{ height: 18, background: '#040a14' }}>
              <span className="detail-title" style={{ fontSize: 8 }}>■ DISPATCH LOG</span>
              <span style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: 'var(--st-av-text)' }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {dispatchLog.slice(0, 50).map(e => (
                <div key={e.id} className="detail-log-entry">
                  <span className="detail-log-time">{e.time}</span>
                  <span className={`detail-log-${e.kind}`} style={{ flex: 1, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {e.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Create Call Modal ─── */}
      {showCreateForm && (
        <div className="n-overlay" onClick={e => e.target === e.currentTarget && setShowCreateForm(false)}>
          <div className="n-modal n-modal-wide">
            <div className="n-modal-header">
              <div className="n-modal-title">■ CREATE NEW INCIDENT</div>
              <button className="n-btn n-btn-ghost n-btn-xs" onClick={() => setShowCreateForm(false)}>✕</button>
            </div>
            <div className="n-modal-body">
              <div className="n-grid-2">
                <div className="n-field">
                  <label className="n-label">Nature of Call *</label>
                  <select className="n-select" value={newCall.nature} onChange={e => setNewCall(p => ({ ...p, nature: e.target.value }))}>
                    <option value="">Select nature...</option>
                    {CALL_NATURES.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div className="n-field">
                  <label className="n-label">Priority</label>
                  <select className="n-select" value={newCall.priority} onChange={e => setNewCall(p => ({ ...p, priority: Number(e.target.value) }))}>
                    <option value={1}>P1 — Critical / Life Safety</option>
                    <option value={2}>P2 — High</option>
                    <option value={3}>P3 — Medium</option>
                    <option value={4}>P4 — Low / Routine</option>
                  </select>
                </div>
              </div>
              <div className="n-grid-2">
                <div className="n-field">
                  <label className="n-label">Category</label>
                  <select className="n-select" value={newCall.category} onChange={e => setNewCall(p => ({ ...p, category: e.target.value }))}>
                    <option value="police">Law Enforcement</option>
                    <option value="fire">Fire / EMS</option>
                    <option value="traffic">Traffic / FDOT</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="n-field">
                  <label className="n-label">City</label>
                  <select className="n-select" value={newCall.city} onChange={e => setNewCall(p => ({ ...p, city: e.target.value }))}>
                    {['Tampa','Brandon','Plant City','Riverview','Ruskin','Gibsonton','Temple Terrace','Unincorporated'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="n-field">
                <label className="n-label">Location / Address *</label>
                <input className="n-input" placeholder="e.g. 412 Oakwood Ave / I-275 MM 42 SB" value={newCall.location} onChange={e => setNewCall(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div className="n-field">
                <label className="n-label">Reporting Party</label>
                <input className="n-input" placeholder="911 Caller / Officer / FDOT / Dispatch..." value={newCall.reportingParty} onChange={e => setNewCall(p => ({ ...p, reportingParty: e.target.value }))} />
              </div>
              <div className="n-field">
                <label className="n-label">Incident Narrative</label>
                <textarea className="n-textarea" rows={3} placeholder="Describe the incident..." value={newCall.description} onChange={e => setNewCall(p => ({ ...p, description: e.target.value }))} />
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
