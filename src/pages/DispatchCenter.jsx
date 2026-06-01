import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCAD } from '../store/cadStore';
import { STATUS_COLORS as ST_COLOR } from '../constants/statusColors';
import {
  S_FIELD, S_LABEL, S_SELECT, S_INPUT, S_TEXTAREA,
  S_BTN_PRIMARY, S_BTN_SECONDARY, S_BTN_GHOST,
  xs, btnHoverOn, btnHoverOff, btnActiveOn,
  S_OVERLAY, S_MODAL, S_MODAL_HEADER, S_MODAL_TITLE, S_MODAL_BODY, S_MODAL_FOOTER,
  cadStatus, CAD_STATUS_LABEL, cadCallStatus, cadPri, cadElapsed,
} from '../constants/styles';

/* ─── Elapsed timer ─── */
function Elapsed({ createdAt }) {
  const [elapsed, setElapsed] = useState('');
  const [cls, setCls] = useState('ok');
  useEffect(() => {
    const tick = () => {
      const s = Math.floor((Date.now() - createdAt) / 1000);
      const m = Math.floor(s / 60);
      const sec = s % 60;
      setElapsed(`${String(m).padStart(2, '0')}:${String(sec).padStart(2, '00')}`);
      setCls(m >= 15 ? 'crit' : m >= 8 ? 'warn' : 'ok');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  return <span className={cadElapsed(cls)}>{elapsed}</span>;
}

function StatusBadge({ status }) {
  return <span className={cadStatus(status)}>{CAD_STATUS_LABEL[status] || status}</span>;
}

function CallStatus({ status }) {
  return <span className={cadCallStatus(status)}>{status}</span>;
}

function PriBadge({ p }) {
  return <span className={cadPri(p)}>P{p}</span>;
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
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'2px 8px', background:'#020810', borderBottom:'1px solid var(--n-border-strong)', flexShrink:0, flexWrap:'wrap' }}>
          <span style={{ fontSize:10, fontWeight:700, fontFamily:'var(--font-mono)', color:'var(--n-gold)', letterSpacing:'0.8px', textTransform:'uppercase' }}>■ ACTIVE SERVICE CALLS</span>
          <span style={{ fontSize:10, fontFamily:'var(--font-mono)', color:'var(--n-text-muted)' }}>({sortedCalls.length})</span>
          {p1Count > 0 && (
            <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'#ff3333', fontWeight:700, marginLeft:4, animation:'pulseRed 1.5s ease-in-out infinite' }}>
              ▲ P1:{p1Count}
            </span>
          )}
          {pendingCount > 0 && <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:ST_COLOR.BUSY, marginLeft:4 }}>PNDG:{pendingCount}</span>}
          {unassignedCount > 0 && <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:ST_COLOR.ENRT, marginLeft:4 }}>UNASN:{unassignedCount}</span>}
          <div style={{ display:'flex', gap:2, alignItems:'center', marginLeft:'auto', flexWrap:'wrap' }}>
            {['ALL','PENDING','ACTIVE','ENRT','P1','P2','P3','P4'].map(f => {
              const active = callFilter === f;
              return (
                <button key={f}
                  onClick={() => setCallFilter(f)}
                  style={{ padding:'2px 7px', fontSize:9, fontFamily:'var(--font-mono)', fontWeight:700, letterSpacing:'0.4px', cursor:'pointer', background: active ? '#0e2848' : '#04090f', color: active ? '#80c8f0' : '#4a6a88', border:`1px solid ${active ? '#1a5090' : '#0d1e30'}`, transition:'all 0.1s' }}
                >{f}</button>
              );
            })}
          </div>
          {isDispatch && (
            <button
              onClick={() => setSearchParams({ new:'1' })}
              style={{ padding:'2px 10px', fontSize:9, fontFamily:'var(--font-mono)', fontWeight:700, letterSpacing:'0.5px', cursor:'pointer', background:'#0a2040', color:'#80c8f0', border:'1px solid #1a5090', marginLeft:4 }}
            >+ NEW CALL</button>
          )}
        </div>

        <div style={{ flex:1, overflow:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
            <colgroup>
              <col style={{ width:84 }} /><col style={{ width:180 }} /><col />
              <col style={{ width:110 }} /><col style={{ width:130 }} />
              <col style={{ width:44 }} /><col style={{ width:80 }} />
              <col style={{ width:68 }} /><col style={{ width:180 }} />
            </colgroup>
            <thead>
              <tr style={{ background:'#020810' }}>
                {['CALL #','NATURE','LOCATION','CITY','COUNTY','PRI','STATUS','ELAPSED','UNITS'].map(h => (
                  <th key={h} style={{ padding:'5px 8px', textAlign:'left', fontSize:9, fontWeight:700, letterSpacing:'0.8px', textTransform:'uppercase', color:'#4a6a88', borderBottom:'1px solid #1a3050', whiteSpace:'nowrap', fontFamily:'var(--font-mono)', position:'sticky', top:0, zIndex:1, background:'#020810' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedCalls.length === 0 ? (
                <tr><td colSpan={9}><div style={{ padding:'20px', textAlign:'center', color:'#334455', fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.5px' }}>NO ACTIVE CALLS</div></td></tr>
              ) : sortedCalls.map(c => {
                const priColor = { 1:'#ff2222', 2:'#ff8822', 3:'#ddcc00', 4:'#22cc55' }[c.priority] || 'transparent';
                return (
                <tr
                  key={c.id}
                  style={{ cursor:'pointer', borderLeft:`2px solid ${priColor}44`, borderBottom:'1px solid #060e18', background:'#030810', transition:'background 0.1s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#06101a'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='#030810'; }}
                  onClick={() => navigate('/cad/' + c.id)}
                >
                  <td style={{ padding:'5px 8px', fontFamily:'var(--font-mono)', fontWeight:700, color:'#ffffff', fontSize:12 }}>{c.id}</td>
                  <td style={{ padding:'5px 8px', fontWeight:600, color:'#ffffff', fontSize:13 }}>{c.nature}</td>
                  <td style={{ padding:'5px 8px', color:'#ffffff', fontWeight:500, fontSize:12 }}>{c.location}</td>
                  <td style={{ padding:'5px 8px', color:'#ffffff', fontSize:12 }}>{c.city}</td>
                  <td style={{ padding:'5px 8px', color:'#cccccc', fontSize:12 }}>{c.county}</td>
                  <td style={{ padding:'5px 8px' }}><PriBadge p={c.priority} /></td>
                  <td style={{ padding:'5px 8px' }}><CallStatus status={c.status} /></td>
                  <td style={{ padding:'5px 8px' }}>{c.createdAt ? <Elapsed createdAt={c.createdAt} /> : <span style={{ color:'#334455' }}>—</span>}</td>
                  <td style={{ padding:'5px 8px', fontFamily:'var(--font-mono)', color: c.units.length > 0 ? '#00ee66' : '#334455', fontSize:12 }}>
                    {c.units.length > 0 ? c.units.join(', ') : '—'}
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* UNITS GRID */}
      <div className={`cad-grid-panel units-panel${mobileTab === 'units' ? ' mob-active' : ''}`} style={{ flex: '45 1 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'2px 8px', background:'#020810', borderBottom:'1px solid var(--n-border-strong)', flexShrink:0, flexWrap:'wrap' }}>
          <span style={{ fontSize:10, fontWeight:700, fontFamily:'var(--font-mono)', color:'var(--n-gold)', letterSpacing:'0.8px', textTransform:'uppercase' }}>■ FIELD UNITS</span>
          <span style={{ fontSize:10, fontFamily:'var(--font-mono)', color:'var(--n-text-muted)' }}>({onDutyOfficers.length} ON DUTY)</span>
          <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:ST_COLOR.AVAILABLE, marginLeft:6 }}>
            AVL:{officers.filter(o => o.status === 'AVAILABLE').length}
          </span>
          <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:ST_COLOR.BUSY, marginLeft:6 }}>
            BUSY:{officers.filter(o => o.status === 'BUSY').length}
          </span>
          <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:ST_COLOR.ENRT, marginLeft:6 }}>
            ENRT:{officers.filter(o => o.status === 'ENRT').length}
          </span>
          <div style={{ display:'flex', gap:2, alignItems:'center', marginLeft:'auto', flexWrap:'wrap' }}>
            {['ALL','AVAILABLE','ENRT','BUSY','ARRVD','UNAVAILABLE'].map(f => {
              const active = unitFilter === f;
              return (
                <button key={f}
                  onClick={() => setUnitFilter(f)}
                  style={{ padding:'2px 7px', fontSize:9, fontFamily:'var(--font-mono)', fontWeight:700, letterSpacing:'0.4px', cursor:'pointer', background: active ? '#0e2848' : '#04090f', color: active ? '#80c8f0' : '#4a6a88', border:`1px solid ${active ? '#1a5090' : '#0d1e30'}`, transition:'all 0.1s' }}
                >{f === 'UNAVAILABLE' ? 'UNAVL' : f === 'AVAILABLE' ? 'AVL' : f}</button>
              );
            })}
          </div>
        </div>

        <div style={{ flex:1, overflow:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
            <colgroup>
              <col style={{ width:90 }} /><col style={{ width:72 }} /><col style={{ width:84 }} />
              <col style={{ width:68 }} /><col style={{ width:200 }} /><col />
            </colgroup>
            <thead>
              <tr style={{ background:'#020810' }}>
                {['UNIT','STATUS','CALL #','AGENCY','LOCATION','NAME / RANK'].map(h => (
                  <th key={h} style={{ padding:'5px 8px', textAlign:'left', fontSize:9, fontWeight:700, letterSpacing:'0.8px', textTransform:'uppercase', color:'#4a6a88', borderBottom:'1px solid #1a3050', whiteSpace:'nowrap', fontFamily:'var(--font-mono)', position:'sticky', top:0, zIndex:1, background:'#020810' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUnits.length === 0 ? (
                <tr><td colSpan={6}><div style={{ padding:'20px', textAlign:'center', color:'#334455', fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.5px' }}>NO UNITS MATCH FILTER</div></td></tr>
              ) : filteredUnits.map(o => (
                <tr
                  key={o.id}
                  style={{ cursor: o.callId ? 'pointer' : 'default', borderBottom:'1px solid #060e18', background:'#030810', transition:'background 0.1s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#06101a'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='#030810'; }}
                  onClick={() => o.callId && navigate('/cad/' + o.callId)}
                >
                  <td style={{ padding:'5px 8px', fontFamily:'var(--font-mono)', fontWeight:700, color: ST_COLOR[o.status] || '#ffffff', fontSize:12 }}>{o.unitId}</td>
                  <td style={{ padding:'5px 8px' }}><StatusBadge status={o.status} /></td>
                  <td style={{ padding:'5px 8px', fontFamily:'var(--font-mono)', fontWeight:600, color: o.callId ? '#ffee44' : '#555560', fontSize:12 }}>{o.callId || '—'}</td>
                  <td style={{ padding:'5px 8px', color:'#ffffff', fontWeight:600, fontSize:12 }}>{o.deptShort}</td>
                  <td style={{ padding:'5px 8px', color:'#cccccc', fontSize:12 }}>{o.location}</td>
                  <td style={{ padding:'5px 8px', color:'#ffffff', fontWeight:500, fontSize:12 }}>
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
        <div className={S_OVERLAY} onClick={e => e.target === e.currentTarget && closeCreate()}>
          <div style={{ ...S_MODAL, maxWidth: 640 }}>
            <div className={S_MODAL_HEADER}>
              <div className={S_MODAL_TITLE}>■ CREATE NEW INCIDENT</div>
              <button
                className={xs(S_BTN_GHOST)}
                onMouseDown={btnActiveOn}
                onClick={closeCreate}
              >✕</button>
            </div>
            <div className={S_MODAL_BODY}>
              <div className="n-grid-2">
                <div style={S_FIELD}>
                  <label className={S_LABEL}>Nature of Call *</label>
                  <select className={S_SELECT} value={newCall.nature} onChange={e => setNewCall(p => ({ ...p, nature:e.target.value }))}>
                    <option value="">Select nature...</option>
                    {CALL_NATURES.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div style={S_FIELD}>
                  <label className={S_LABEL}>Priority</label>
                  <select className={S_SELECT} value={newCall.priority} onChange={e => setNewCall(p => ({ ...p, priority:Number(e.target.value) }))}>
                    <option value={1}>P1 — Critical / Life Safety</option>
                    <option value={2}>P2 — High</option>
                    <option value={3}>P3 — Medium</option>
                    <option value={4}>P4 — Low / Routine</option>
                  </select>
                </div>
              </div>
              <div className="n-grid-2">
                <div style={S_FIELD}>
                  <label className={S_LABEL}>Category</label>
                  <select className={S_SELECT} value={newCall.category} onChange={e => setNewCall(p => ({ ...p, category:e.target.value }))}>
                    <option value="police">Law Enforcement</option>
                    <option value="fire">Fire / EMS</option>
                    <option value="traffic">Traffic / FDOT</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={S_FIELD}>
                  <label className={S_LABEL}>City</label>
                  <select className={S_SELECT} value={newCall.city} onChange={e => setNewCall(p => ({ ...p, city:e.target.value }))}>
                    {['Tampa','Brandon','Plant City','Riverview','Ruskin','Gibsonton','Temple Terrace','Unincorporated'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={S_FIELD}>
                <label className={S_LABEL}>Location / Address *</label>
                <input className={S_INPUT} placeholder="e.g. 412 Oakwood Ave / I-275 MM 42 SB" value={newCall.location} onChange={e => setNewCall(p => ({ ...p, location:e.target.value }))} />
              </div>
              <div style={S_FIELD}>
                <label className={S_LABEL}>Reporting Party</label>
                <input className={S_INPUT} placeholder="911 Caller / Officer / FDOT / Dispatch..." value={newCall.reportingParty} onChange={e => setNewCall(p => ({ ...p, reportingParty:e.target.value }))} />
              </div>
              <div style={S_FIELD}>
                <label className={S_LABEL}>Incident Narrative</label>
                <textarea className={S_TEXTAREA} rows={3} placeholder="Describe the incident..." value={newCall.description} onChange={e => setNewCall(p => ({ ...p, description:e.target.value }))} />
              </div>
            </div>
            <div className={S_MODAL_FOOTER}>
              <button
                className={S_BTN_SECONDARY}
                onMouseDown={btnActiveOn}
                onClick={closeCreate}
              >Cancel</button>
              <button
                className={S_BTN_PRIMARY}
                onMouseDown={btnActiveOn}
                onClick={createCall}
                disabled={!newCall.nature || !newCall.location}
              >
                Create Incident
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
