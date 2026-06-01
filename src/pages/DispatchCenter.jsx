import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCAD } from '../store/cadStore';
import {
  S_FIELD, S_LABEL, S_SELECT, S_INPUT, S_TEXTAREA,
  S_BTN_PRIMARY, S_BTN_SECONDARY, S_BTN_GHOST,
  xs, btnActiveOn,
  S_OVERLAY, S_MODAL, S_MODAL_HEADER, S_MODAL_TITLE, S_MODAL_BODY, S_MODAL_FOOTER,
  cadStatus, CAD_STATUS_LABEL, cadCallStatus, cadPri, cadElapsed,
  S_TABLE_TH, S_TABLE_TD, trHoverOn, trHoverOff,
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

  // Status color map for unit table (runtime-dynamic, kept as style)
  const unitStatusColor = { AVAILABLE:'#22ff66', BUSY:'#ff8822', ENRT:'#ddff33', ARRVD:'#ffee22', UNAVAILABLE:'#dd44aa', OFFDUTY:'#ff4444' };

  return (
    <div className="cad-dispatch flex-col">
      {/* Mobile tab switcher */}
      <div className="mob-tab-bar">
        <button className={`mob-tab${mobileTab === 'calls' ? ' active' : ''}`} onClick={() => setMobileTab('calls')}>
          CALLS ({sortedCalls.length})
          {p1Count > 0 && <span className="ml-1 text-red-400">▲P1</span>}
        </button>
        <button className={`mob-tab${mobileTab === 'units' ? ' active' : ''}`} onClick={() => setMobileTab('units')}>
          UNITS ({onDutyOfficers.length})
        </button>
      </div>

      {/* CALLS GRID */}
      <div className={`cad-grid-panel calls-panel${mobileTab === 'calls' ? ' mob-active' : ''}`} style={{ flex: '55 1 0' }}>
        <div className="flex items-center gap-1.5 px-2 py-[2px] bg-app-bg border-b border-border-strong shrink-0 flex-wrap">
          <span className="text-[10px] font-bold font-mono text-yellow-600 tracking-[0.8px] uppercase">■ ACTIVE SERVICE CALLS</span>
          <span className="text-[10px] font-mono text-cad-muted">({sortedCalls.length})</span>
          {p1Count > 0 && (
            <span className="text-[11px] font-mono text-red-400 font-bold ml-1 animate-pulse-red">
              ▲ P1:{p1Count}
            </span>
          )}
          {pendingCount > 0 && <span className="text-[11px] font-mono text-amber-400 ml-1">PNDG:{pendingCount}</span>}
          {unassignedCount > 0 && <span className="text-[11px] font-mono text-yellow-400 ml-1">UNASN:{unassignedCount}</span>}
          <div className="flex gap-0.5 items-center ml-auto flex-wrap">
            {['ALL','PENDING','ACTIVE','ENRT','P1','P2','P3','P4'].map(f => {
              const active = callFilter === f;
              return (
                <button key={f}
                  onClick={() => setCallFilter(f)}
                  className={`px-[7px] py-[2px] text-[9px] font-mono font-bold tracking-[0.4px] cursor-pointer transition-all border ${active ? 'bg-sky-950 text-sky-300 border-sky-700' : 'bg-app-bg text-slate-500 border-white/[0.05]'}`}
                >{f}</button>
              );
            })}
          </div>
          {isDispatch && (
            <button
              onClick={() => setSearchParams({ new:'1' })}
              className="px-[10px] py-[2px] text-[9px] font-mono font-bold tracking-[0.5px] cursor-pointer bg-sky-950 text-sky-300 border border-sky-700 ml-1"
            >+ NEW CALL</button>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse table-fixed">
            <colgroup>
              <col style={{ width:84 }} /><col style={{ width:180 }} /><col />
              <col style={{ width:110 }} /><col style={{ width:130 }} />
              <col style={{ width:44 }} /><col style={{ width:80 }} />
              <col style={{ width:68 }} /><col style={{ width:180 }} />
            </colgroup>
            <thead>
              <tr className="bg-app-bg">
                {['CALL #','NATURE','LOCATION','CITY','COUNTY','PRI','STATUS','ELAPSED','UNITS'].map(h => (
                  <th key={h} className={`${S_TABLE_TH} whitespace-nowrap z-[1]`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedCalls.length === 0 ? (
                <tr><td colSpan={9}><div className="p-5 text-center text-slate-600 font-mono text-[11px] tracking-[0.5px]">NO ACTIVE CALLS</div></td></tr>
              ) : sortedCalls.map(c => {
                const priColor = { 1:'#ff2222', 2:'#ff8822', 3:'#ddcc00', 4:'#22cc55' }[c.priority] || 'transparent';
                return (
                <tr
                  key={c.id}
                  className="cursor-pointer transition-colors"
                  style={{ borderLeft:`2px solid ${priColor}44`, borderBottom:'1px solid #060e18', background:'#030810' }}
                  onMouseEnter={trHoverOn}
                  onMouseLeave={trHoverOff}
                  onClick={() => navigate('/cad/' + c.id)}
                >
                  <td className={`${S_TABLE_TD} font-mono font-bold text-white`}>{c.id}</td>
                  <td className={`${S_TABLE_TD} font-semibold text-white text-sm`}>{c.nature}</td>
                  <td className={`${S_TABLE_TD} text-white font-medium`}>{c.location}</td>
                  <td className={`${S_TABLE_TD} text-white`}>{c.city}</td>
                  <td className={`${S_TABLE_TD} text-slate-300`}>{c.county}</td>
                  <td className={S_TABLE_TD}><PriBadge p={c.priority} /></td>
                  <td className={S_TABLE_TD}><CallStatus status={c.status} /></td>
                  <td className={S_TABLE_TD}>{c.createdAt ? <Elapsed createdAt={c.createdAt} /> : <span className="text-slate-600">*</span>}</td>
                  <td className={`${S_TABLE_TD} font-mono ${c.units.length > 0 ? 'text-green-400' : 'text-slate-600'}`}>
                    {c.units.length > 0 ? c.units.join(', ') : '*'}
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
        <div className="flex items-center gap-1.5 px-2 py-[2px] bg-app-bg border-b border-border-strong shrink-0 flex-wrap">
          <span className="text-[10px] font-bold font-mono text-yellow-600 tracking-[0.8px] uppercase">■ FIELD UNITS</span>
          <span className="text-[10px] font-mono text-cad-muted">({onDutyOfficers.length} ON DUTY)</span>
          <span className="text-[11px] font-mono text-green-400 ml-1.5">
            AVL:{officers.filter(o => o.status === 'AVAILABLE').length}
          </span>
          <span className="text-[11px] font-mono text-red-400 ml-1.5">
            BUSY:{officers.filter(o => o.status === 'BUSY').length}
          </span>
          <span className="text-[11px] font-mono text-yellow-400 ml-1.5">
            ENRT:{officers.filter(o => o.status === 'ENRT').length}
          </span>
          <div className="flex gap-0.5 items-center ml-auto flex-wrap">
            {['ALL','AVAILABLE','ENRT','BUSY','ARRVD','UNAVAILABLE'].map(f => {
              const active = unitFilter === f;
              return (
                <button key={f}
                  onClick={() => setUnitFilter(f)}
                  className={`px-[7px] py-[2px] text-[9px] font-mono font-bold tracking-[0.4px] cursor-pointer transition-all border ${active ? 'bg-sky-950 text-sky-300 border-sky-700' : 'bg-app-bg text-slate-500 border-white/[0.05]'}`}
                >{f === 'UNAVAILABLE' ? 'UNAVL' : f === 'AVAILABLE' ? 'AVL' : f}</button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse table-fixed">
            <colgroup>
              <col style={{ width:120 }} /><col style={{ width:120 }} /><col style={{ width:100 }} />
              <col style={{ width:100 }} /><col style={{ width:240 }} /><col />
            </colgroup>
            <thead>
              <tr className="bg-app-bg">
                {['UNIT','STATUS','CALL #','AGENCY','LOCATION','NAME / RANK'].map(h => (
                  <th key={h} className={`${S_TABLE_TH} !px-3.5 !text-center whitespace-nowrap z-[1]`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUnits.length === 0 ? (
                <tr><td colSpan={6}><div className="p-5 text-center text-slate-600 font-mono text-[11px] tracking-[0.5px]">NO UNITS MATCH FILTER</div></td></tr>
              ) : filteredUnits.map(o => (
                <tr
                  key={o.id}
                  className={`${o.callId ? 'cursor-pointer' : 'cursor-default'} transition-colors`}
                  style={{ borderBottom:'1px solid #060e18', background:'#030810' }}
                  onMouseEnter={trHoverOn}
                  onMouseLeave={trHoverOff}
                  onClick={() => o.callId && navigate('/cad/' + o.callId)}
                >
                  <td className={`${S_TABLE_TD} !px-3.5 !py-2 !text-center font-mono font-bold`} style={{ color: unitStatusColor[o.status] || '#ffffff' }}>{o.unitId}</td>
                  <td className={`${S_TABLE_TD} !px-3.5 !py-2 !text-center`}><StatusBadge status={o.status} /></td>
                  <td className={`${S_TABLE_TD} !px-3.5 !py-2 !text-center font-mono font-semibold ${o.callId ? 'text-yellow-300' : 'text-slate-500'}`}>{o.callId || '*'}</td>
                  <td className={`${S_TABLE_TD} !px-3.5 !py-2 !text-center text-white font-semibold`}>{o.deptShort}</td>
                  <td className={`${S_TABLE_TD} !px-3.5 !py-2 !text-center text-slate-300`}>{o.location}</td>
                  <td className={`${S_TABLE_TD} !px-3.5 !py-2 !text-center text-white font-medium`}>
                    {o.name}
                    {o.rank && <span className="text-slate-500 ml-1">· {o.rank}</span>}
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
          <div className={`${S_MODAL} max-w-[640px]`}>
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
                <div className={S_FIELD}>
                  <label className={S_LABEL}>Nature of Call *</label>
                  <select className={S_SELECT} value={newCall.nature} onChange={e => setNewCall(p => ({ ...p, nature:e.target.value }))}>
                    <option value="">Select nature...</option>
                    {CALL_NATURES.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div className={S_FIELD}>
                  <label className={S_LABEL}>Priority</label>
                  <select className={S_SELECT} value={newCall.priority} onChange={e => setNewCall(p => ({ ...p, priority:Number(e.target.value) }))}>
                    <option value={1}>P1 * Critical / Life Safety</option>
                    <option value={2}>P2 * High</option>
                    <option value={3}>P3 * Medium</option>
                    <option value={4}>P4 * Low / Routine</option>
                  </select>
                </div>
              </div>
              <div className="n-grid-2">
                <div className={S_FIELD}>
                  <label className={S_LABEL}>Category</label>
                  <select className={S_SELECT} value={newCall.category} onChange={e => setNewCall(p => ({ ...p, category:e.target.value }))}>
                    <option value="police">Law Enforcement</option>
                    <option value="fire">Fire / EMS</option>
                    <option value="traffic">Traffic / FDOT</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className={S_FIELD}>
                  <label className={S_LABEL}>City</label>
                  <select className={S_SELECT} value={newCall.city} onChange={e => setNewCall(p => ({ ...p, city:e.target.value }))}>
                    {['Tampa','Brandon','Plant City','Riverview','Ruskin','Gibsonton','Temple Terrace','Unincorporated'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className={S_FIELD}>
                <label className={S_LABEL}>Location / Address *</label>
                <input className={S_INPUT} placeholder="e.g. 412 Oakwood Ave / I-275 MM 42 SB" value={newCall.location} onChange={e => setNewCall(p => ({ ...p, location:e.target.value }))} />
              </div>
              <div className={S_FIELD}>
                <label className={S_LABEL}>Reporting Party</label>
                <input className={S_INPUT} placeholder="911 Caller / Officer / FDOT / Dispatch..." value={newCall.reportingParty} onChange={e => setNewCall(p => ({ ...p, reportingParty:e.target.value }))} />
              </div>
              <div className={S_FIELD}>
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
