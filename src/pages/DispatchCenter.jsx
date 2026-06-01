import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCAD } from '../store/cadStore';
import { STATUS_COLORS as ST_COLOR } from '../constants/statusColors';

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

function StatusBadge({ status }) {
  const map = { AVAILABLE:'av', BUSY:'busy', ENRT:'enrt', ARRVD:'arrvd', OFFDUTY:'od', UNAVAILABLE:'unavl' };
  const labels = { AVAILABLE:'AVL', BUSY:'BUSY', ENRT:'ENRT', ARRVD:'ARRVD', OFFDUTY:'OFD', UNAVAILABLE:'UNAVL' };
  return <span className={`cad-status ${map[status] || 'od'}`}>{labels[status] || status}</span>;
}

function CallStatus({ status }) {
  const cls = { PENDING:'pending', ACTIVE:'active', ENRT:'enrt', CLOSED:'closed' }[status] || 'closed';
  return <span className={`cad-call-status ${cls}`}>{status}</span>;
}

function PriBadge({ p }) {
  return <span className={`cad-pri p${p}`}>P{p}</span>;
}


const CALL_NATURES = [
  'Traffic Stop','Suspicious Person','Suspicious Vehicle','Domestic Disturbance',
  'Assault','Robbery','Burglary','MVA','MVA w/ Injuries','Medical Emergency',
  'Medical - Cardiac Arrest','Structure Fire','Vehicle Fire','Brush Fire',
  'Officer Needs Assistance','Pursuit','Noise Complaint','Check Welfare',
  'Armed Subject','Shooting','Stabbing','Shots Fired','Drug Activity',
  'Theft - Shoplifting','Road Hazard','Trespassing','Other',
];

export default function DispatchCenter() {
  const { state, dispatch } = useCAD();
  const { calls, officers, currentUser } = state;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [callFilter, setCallFilter] = useState('ALL');
  const [unitFilter, setUnitFilter] = useState('ALL');
  const [mobileTab, setMobileTab] = useState('calls');
  const [newCall, setNewCall] = useState({
    nature:'', location:'', city:'Tampa', county:'Hillsborough',
    priority:1, category:'police', description:'', reportingParty:'',
  });

  const showCreateForm = searchParams.get('new') === '1';
  const closeCreate = () => setSearchParams({});

  const isDispatch = currentUser?.role === 'dispatch' || currentUser?.role === 'admin';

  const activeCalls = calls.filter(c => c.status !== 'CLOSED');
  const filteredCalls = callFilter === 'ALL'
    ? activeCalls
    : callFilter.startsWith('P')
      ? activeCalls.filter(c => c.priority === Number(callFilter.replace('P','')))
      : activeCalls.filter(c => c.status === callFilter);
  const sortedCalls = [...filteredCalls].sort((a,b) => a.priority - b.priority);

  const onDutyOfficers = officers.filter(o => o.status !== 'OFFDUTY');
  const filteredUnits = unitFilter === 'ALL'
    ? onDutyOfficers
    : onDutyOfficers.filter(o => o.status === unitFilter || o.deptShort === unitFilter);

  const createCall = () => {
    if (!newCall.nature || !newCall.location) return;
    dispatch({ type:'CREATE_CALL', payload:{ ...newCall, status:'PENDING' } });
    setNewCall({ nature:'', location:'', city:'Tampa', county:'Hillsborough', priority:1, category:'police', description:'', reportingParty:'' });
    closeCreate();
  };

  const p1Count = activeCalls.filter(c => c.priority === 1).length;
  const pendingCount = activeCalls.filter(c => c.status === 'PENDING').length;
  const unassignedCount = activeCalls.filter(c => c.units.length === 0).length;

  return (
    <div className="cad-dispatch" style={{ flexDirection: 'column' }}>
      {/* Mobile tab switcher */}
      <div className="mob-tab-bar">
        <button className={`mob-tab${mobileTab === 'calls' ? ' active' : ''}`} onClick={() => setMobileTab('calls')}>
          CALLS ({sortedCalls.length})
          {p1Count > 0 && <span style={{ marginLeft: 4, color:'var(--pr1-text)' }}>▲P1</span>}
        </button>
        <button className={`mob-tab${mobileTab === 'units' ? ' active' : ''}`} onClick={() => setMobileTab('units')}>
          UNITS ({onDutyOfficers.length})
        </button>
      </div>

      {/* CALLS GRID */}
      <div className={`cad-grid-panel calls-panel${mobileTab === 'calls' ? ' mob-active' : ''}`} style={{ flex: '55 1 0' }}>
        <div className="cad-grid-titlebar">
          <span className="cad-grid-title">■ ACTIVE SERVICE CALLS</span>
          <span className="cad-grid-count">({sortedCalls.length})</span>
          {p1Count > 0 && (
            <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'#ff3333', fontWeight:700, marginLeft:4, animation:'pulseRed 1.5s ease-in-out infinite' }}>
              ▲ P1:{p1Count}
            </span>
          )}
          {pendingCount > 0 && <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:ST_COLOR.BUSY, marginLeft:4 }}>PNDG:{pendingCount}</span>}
          {unassignedCount > 0 && <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:ST_COLOR.ENRT, marginLeft:4 }}>UNASN:{unassignedCount}</span>}
          <div className="cad-grid-filters">
            {['ALL','PENDING','ACTIVE','ENRT','P1','P2','P3','P4'].map(f => (
              <button key={f} className={`cad-filter-btn${callFilter === f ? ' active' : ''}`} onClick={() => setCallFilter(f)}>{f}</button>
            ))}
          </div>
          <div className="cad-grid-actions">
            {isDispatch && (
              <button className="cad-action-btn btn-create" style={{ height:18, fontSize:10 }} onClick={() => setSearchParams({ new:'1' })}>
                + NEW CALL
              </button>
            )}
          </div>
        </div>

        <div className="cad-table-wrap">
          <table className="cad-table" style={{ tableLayout:'fixed' }}>
            <colgroup>
              <col style={{ width:84 }} /><col style={{ width:180 }} /><col />
              <col style={{ width:110 }} /><col style={{ width:130 }} />
              <col style={{ width:44 }} /><col style={{ width:80 }} />
              <col style={{ width:68 }} /><col style={{ width:180 }} />
            </colgroup>
            <thead>
              <tr>
                <th>CALL #</th><th>NATURE</th><th>LOCATION</th>
                <th>CITY</th><th>COUNTY</th>
                <th>PRI</th><th>STATUS</th><th>ELAPSED</th><th>UNITS</th>
              </tr>
            </thead>
            <tbody>
              {sortedCalls.length === 0 ? (
                <tr><td colSpan={9}><div className="cad-table-empty">NO ACTIVE CALLS</div></td></tr>
              ) : sortedCalls.map(c => (
                <tr
                  key={c.id}
                  className={`pri-${c.priority}`}
                  style={{ cursor:'pointer' }}
                  onClick={() => navigate('/cad/' + c.id)}
                >
                  <td style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:'#ffffff' }}>{c.id}</td>
                  <td style={{ fontWeight:600, color:'#ffffff' }}>{c.nature}</td>
                  <td style={{ color:'#ffffff', fontWeight:500 }}>{c.location}</td>
                  <td style={{ color:'#ffffff' }}>{c.city}</td>
                  <td style={{ color:'#cccccc' }}>{c.county}</td>
                  <td><PriBadge p={c.priority} /></td>
                  <td><CallStatus status={c.status} /></td>
                  <td>{c.createdAt ? <Elapsed createdAt={c.createdAt} /> : <span style={{ color:'#334455' }}>—</span>}</td>
                  <td style={{ fontFamily:'var(--font-mono)', color: c.units.length > 0 ? '#00ee66' : '#334455' }}>
                    {c.units.length > 0 ? c.units.join(', ') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UNITS GRID */}
      <div className={`cad-grid-panel units-panel${mobileTab === 'units' ? ' mob-active' : ''}`} style={{ flex: '45 1 0' }}>
        <div className="cad-grid-titlebar">
          <span className="cad-grid-title">■ FIELD UNITS</span>
          <span className="cad-grid-count">({onDutyOfficers.length} ON DUTY)</span>
          <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:ST_COLOR.AVAILABLE, marginLeft:6 }}>
            AVL:{officers.filter(o => o.status === 'AVAILABLE').length}
          </span>
          <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:ST_COLOR.BUSY, marginLeft:6 }}>
            BUSY:{officers.filter(o => o.status === 'BUSY').length}
          </span>
          <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:ST_COLOR.ENRT, marginLeft:6 }}>
            ENRT:{officers.filter(o => o.status === 'ENRT').length}
          </span>
          <div className="cad-grid-filters">
            {['ALL','AVAILABLE','ENRT','BUSY','ARRVD','UNAVAILABLE'].map(f => (
              <button key={f} className={`cad-filter-btn${unitFilter === f ? ' active' : ''}`} onClick={() => setUnitFilter(f)}>
                {f === 'UNAVAILABLE' ? 'UNAVL' : f === 'AVAILABLE' ? 'AVL' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="cad-table-wrap">
          <table className="cad-table" style={{ tableLayout:'fixed' }}>
            <colgroup>
              <col style={{ width:90 }} /><col style={{ width:72 }} /><col style={{ width:84 }} />
              <col style={{ width:68 }} /><col style={{ width:200 }} /><col />
            </colgroup>
            <thead>
              <tr>
                <th>UNIT</th><th>STATUS</th><th>CALL #</th>
                <th>AGENCY</th><th>LOCATION</th><th>NAME / RANK</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.length === 0 ? (
                <tr><td colSpan={6}><div className="cad-table-empty">NO UNITS MATCH FILTER</div></td></tr>
              ) : filteredUnits.map(o => (
                <tr
                  key={o.id}
                  style={{ cursor: o.callId ? 'pointer' : 'default' }}
                  onClick={() => o.callId && navigate('/cad/' + o.callId)}
                >
                  <td style={{ fontFamily:'var(--font-mono)', fontWeight:700, color: ST_COLOR[o.status] || '#ffffff' }}>{o.unitId}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td style={{ fontFamily:'var(--font-mono)', fontWeight:600, color: o.callId ? '#ffee44' : '#555560' }}>{o.callId || '—'}</td>
                  <td style={{ color:'#ffffff', fontWeight:600 }}>{o.deptShort}</td>
                  <td style={{ color:'#cccccc' }}>{o.location}</td>
                  <td style={{ color:'#ffffff', fontWeight:500 }}>
                    {o.name}
                    {o.rank && <span style={{ color:'#888898', marginLeft:4 }}>· {o.rank}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Call Modal */}
      {showCreateForm && (
        <div className="n-overlay" onClick={e => e.target === e.currentTarget && closeCreate()}>
          <div className="n-modal n-modal-wide">
            <div className="n-modal-header">
              <div className="n-modal-title">■ CREATE NEW INCIDENT</div>
              <button className="n-btn n-btn-ghost n-btn-xs" onClick={closeCreate}>✕</button>
            </div>
            <div className="n-modal-body">
              <div className="n-grid-2">
                <div className="n-field">
                  <label className="n-label">Nature of Call *</label>
                  <select className="n-select" value={newCall.nature} onChange={e => setNewCall(p => ({ ...p, nature:e.target.value }))}>
                    <option value="">Select nature...</option>
                    {CALL_NATURES.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div className="n-field">
                  <label className="n-label">Priority</label>
                  <select className="n-select" value={newCall.priority} onChange={e => setNewCall(p => ({ ...p, priority:Number(e.target.value) }))}>
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
                  <select className="n-select" value={newCall.category} onChange={e => setNewCall(p => ({ ...p, category:e.target.value }))}>
                    <option value="police">Law Enforcement</option>
                    <option value="fire">Fire / EMS</option>
                    <option value="traffic">Traffic / FDOT</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="n-field">
                  <label className="n-label">City</label>
                  <select className="n-select" value={newCall.city} onChange={e => setNewCall(p => ({ ...p, city:e.target.value }))}>
                    {['Tampa','Brandon','Plant City','Riverview','Ruskin','Gibsonton','Temple Terrace','Unincorporated'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="n-field">
                <label className="n-label">Location / Address *</label>
                <input className="n-input" placeholder="e.g. 412 Oakwood Ave / I-275 MM 42 SB" value={newCall.location} onChange={e => setNewCall(p => ({ ...p, location:e.target.value }))} />
              </div>
              <div className="n-field">
                <label className="n-label">Reporting Party</label>
                <input className="n-input" placeholder="911 Caller / Officer / FDOT / Dispatch..." value={newCall.reportingParty} onChange={e => setNewCall(p => ({ ...p, reportingParty:e.target.value }))} />
              </div>
              <div className="n-field">
                <label className="n-label">Incident Narrative</label>
                <textarea className="n-textarea" rows={3} placeholder="Describe the incident..." value={newCall.description} onChange={e => setNewCall(p => ({ ...p, description:e.target.value }))} />
              </div>
            </div>
            <div className="n-modal-footer">
              <button className="n-btn n-btn-secondary" onClick={closeCreate}>Cancel</button>
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
