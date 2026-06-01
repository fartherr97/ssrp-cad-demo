import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCAD } from '../store/cadStore';

function Elapsed({ createdAt }) {
  const [elapsed, setElapsed] = useState('');
  const [cls, setCls] = useState('ok');
  useEffect(() => {
    const tick = () => {
      const s = Math.floor((Date.now() - createdAt) / 1000);
      const m = Math.floor(s / 60);
      const sec = s % 60;
      setElapsed(`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`);
      setCls(m >= 15 ? 'crit' : m >= 8 ? 'warn' : 'ok');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  return <span className={`elapsed ${cls}`}>{elapsed}</span>;
}

function PriBadge({ p }) {
  return <span className={`cad-pri p${p}`}>P{p}</span>;
}

function CallStatusBadge({ status }) {
  const cls = { PENDING:'pending', ACTIVE:'active', ENRT:'enrt', CLOSED:'closed' }[status] || 'closed';
  return <span className={`cad-call-status ${cls}`}>{status}</span>;
}

function StatusBadge({ status }) {
  const map = { AVAILABLE:'av', BUSY:'busy', ENRT:'enrt', ARRVD:'arrvd', OFFDUTY:'od', UNAVAILABLE:'unavl' };
  const labels = { AVAILABLE:'AVL', BUSY:'BUSY', ENRT:'ENRT', ARRVD:'ARRVD', OFFDUTY:'OFD', UNAVAILABLE:'UNAVL' };
  return <span className={`cad-status ${map[status] || 'od'}`}>{labels[status] || status}</span>;
}

const ST_COLOR = {
  AVAILABLE:'#22ff66', ENRT:'#ddff33', BUSY:'#ff8822',
  ARRVD:'#ffee22', UNAVAILABLE:'#dd44aa', OFFDUTY:'#ff4444',
};

const PRI_COLORS = { 1:'#ff3333', 2:'#ff8822', 3:'#ffee22', 4:'#22ff66' };

export default function IncidentDetail() {
  const { callId } = useParams();
  const { state, dispatch } = useCAD();
  const { calls, officers, dispatchLog, currentUser } = state;
  const navigate = useNavigate();

  const [radioMsg, setRadioMsg] = useState('');

  const call = calls.find(c => c.id === callId);
  const isDispatch = currentUser?.role === 'dispatch' || currentUser?.role === 'admin';
  const onDutyOfficers = officers.filter(o => o.status !== 'OFFDUTY');
  const availableUnits = onDutyOfficers.filter(o => (o.status === 'AVAILABLE' || o.status === 'ENRT') && !call?.units.includes(o.unitId));

  const assignUnit = (unitId) => {
    if (!call) return;
    dispatch({ type:'ASSIGN_UNIT', payload:{ callId:call.id, unitId } });
  };
  const detachUnit = (unitId) => {
    if (!call) return;
    dispatch({ type:'DETACH_UNIT', payload:{ callId:call.id, unitId } });
  };
  const updateStatus = (status) => {
    if (!call) return;
    dispatch({ type:'UPDATE_CALL', payload:{ id:call.id, status } });
  };
  const closeCall = () => {
    if (!call) return;
    dispatch({ type:'CLOSE_CALL', payload:call.id });
    navigate('/cad');
  };
  const sendRadio = () => {
    if (!radioMsg.trim()) return;
    dispatch({ type:'DISPATCH_RADIO', payload:radioMsg.trim() });
    setRadioMsg('');
  };
  const setUnitStatus = (unitId, status) => {
    dispatch({ type:'SET_UNIT_STATUS', payload:{ unitId, status } });
  };

  if (!call) {
    return (
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#000', color:'#556677', gap:12 }}>
        <div style={{ fontSize:18, fontFamily:'var(--font-mono)', fontWeight:700 }}>CALL NOT FOUND</div>
        <div style={{ fontSize:12, color:'#334455' }}>Call {callId} does not exist or has been closed.</div>
        <button className="n-btn n-btn-secondary" style={{ marginTop:8 }} onClick={() => navigate('/cad')}>← Back to CAD</button>
      </div>
    );
  }

  const priColor = PRI_COLORS[call.priority] || '#aabbcc';

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'#000' }}>

      {/* ── Top header bar ── */}
      <div style={{
        background:'#040d1c', borderBottom:`2px solid ${priColor}44`,
        padding:'0 16px', display:'flex', alignItems:'center', gap:16,
        flexShrink:0, minHeight:52,
      }}>
        <button
          className="n-btn n-btn-secondary"
          onClick={() => navigate('/cad')}
          style={{ flexShrink:0 }}
        >
          ← CAD
        </button>

        <div style={{ borderLeft:'1px solid #1a3050', paddingLeft:16 }}>
          <div style={{ fontSize:10, fontFamily:'var(--font-mono)', color:'#4a6a88', letterSpacing:'0.5px' }}>INCIDENT</div>
          <div style={{ fontSize:15, fontFamily:'var(--font-mono)', fontWeight:700, color:'#ffffff', lineHeight:1.1 }}>{call.id}</div>
        </div>

        <div style={{ borderLeft:'1px solid #1a3050', paddingLeft:16, flex:1 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#00ee44', letterSpacing:'0.3px' }}>{call.nature}</div>
          <div style={{ fontSize:12, color:'#ffff00', marginTop:1 }}>{call.location}</div>
          <div style={{ fontSize:10, color:'#44bbff', fontFamily:'var(--font-mono)' }}>{call.city} · {call.county}</div>
        </div>

        <div style={{ display:'flex', gap:10, alignItems:'center', flexShrink:0 }}>
          <PriBadge p={call.priority} />
          <CallStatusBadge status={call.status} />
          {call.createdAt && <Elapsed createdAt={call.createdAt} />}
        </div>

        {isDispatch && (
          <button
            className="n-btn n-btn-danger"
            onClick={closeCall}
            style={{ flexShrink:0 }}
          >
            CLOSE CALL
          </button>
        )}
      </div>

      {/* ── Body: 3-column layout ── */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', overflow:'hidden', gap:0 }}>

        {/* ── COL 1: Incident info + narrative ── */}
        <div style={{ display:'flex', flexDirection:'column', borderRight:'1px solid #0d1e30', overflow:'auto' }}>
          {/* Info block */}
          <Section title="INCIDENT INFORMATION">
            <DetailRow label="CALL #"    value={call.id} mono />
            <DetailRow label="CATEGORY"  value={call.category?.toUpperCase()} />
            <DetailRow label="RPT PARTY" value={call.reportingParty || '—'} />
            <DetailRow label="TIMESTAMP" value={call.timestamp} mono small />
            <DetailRow label="PRIORITY"  value={`P${call.priority} — ${['Critical','High','Medium','Low'][call.priority-1] || ''}`} color={priColor} mono />
          </Section>

          {/* Narrative */}
          <Section title="NARRATIVE" flex>
            <div style={{
              color:'#b8c8d8', fontSize:13, lineHeight:1.7, padding:4,
              fontFamily:'var(--font-ui)', whiteSpace:'pre-wrap',
            }}>
              {call.description || 'No narrative provided.'}
            </div>
          </Section>
        </div>

        {/* ── COL 2: Units ── */}
        <div style={{ display:'flex', flexDirection:'column', borderRight:'1px solid #0d1e30', overflow:'auto' }}>
          {/* Assigned units */}
          <Section title={`ASSIGNED UNITS (${call.units.length})`}>
            {call.units.length === 0 ? (
              <div style={{ fontSize:11, color:'#334455', fontFamily:'var(--font-mono)', padding:4 }}>NO UNITS ASSIGNED</div>
            ) : call.units.map(uid => {
              const off = officers.find(o => o.unitId === uid);
              const sc = ST_COLOR[off?.status] || '#aabbcc';
              return (
                <div key={uid} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'6px 8px',
                  borderBottom:'1px solid #060e18', background:'#030810',
                }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:sc, fontSize:13, minWidth:60 }}>{uid}</span>
                  <span style={{ color:sc, fontSize:12, flex:1 }}>{off?.name || '—'}</span>
                  {off && <StatusBadge status={off.status} />}
                  {isDispatch && (
                    <button
                      onClick={() => detachUnit(uid)}
                      style={{ background:'none', border:'none', color:'#cc2222', cursor:'pointer', fontSize:16, padding:'0 4px', lineHeight:1 }}
                      title="Detach unit"
                    >×</button>
                  )}
                </div>
              );
            })}
          </Section>

          {/* Assign unit (dispatch only) */}
          {isDispatch && (
            <Section title="ASSIGN UNIT">
              {availableUnits.length === 0 ? (
                <div style={{ fontSize:11, color:'#334455', fontFamily:'var(--font-mono)', padding:4 }}>NO AVAILABLE UNITS</div>
              ) : (
                <div style={{ display:'flex', flexWrap:'wrap', gap:4, padding:4 }}>
                  {availableUnits.map(o => (
                    <button
                      key={o.id}
                      onClick={() => assignUnit(o.unitId)}
                      title={`${o.name} · ${o.deptShort} · ${o.status}`}
                      style={{
                        padding:'3px 10px', fontSize:11, fontFamily:'var(--font-mono)',
                        background:'#001406', color: ST_COLOR[o.status] || '#22ff66',
                        border:`1px solid ${ST_COLOR[o.status] || '#22ff66'}44`,
                        cursor:'pointer', fontWeight:700,
                      }}
                    >
                      {o.unitId}
                    </button>
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* Call status controls (dispatch only) */}
          {isDispatch && (
            <Section title="CALL STATUS">
              <div style={{ display:'flex', gap:4, flexWrap:'wrap', padding:4 }}>
                {['PENDING','ACTIVE','ENRT'].map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    style={{
                      padding:'5px 14px', fontSize:11, fontFamily:'var(--font-mono)',
                      background: call.status === s ? '#0e2848' : '#04090f',
                      color: call.status === s ? '#80c8f0' : '#4a6a88',
                      border:`1px solid ${call.status === s ? '#1a5090' : '#0d1e30'}`,
                      cursor:'pointer', fontWeight:700,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* All field units at this call — let dispatch change their status */}
          {isDispatch && call.units.length > 0 && (
            <Section title="UNIT STATUS CONTROL">
              {call.units.map(uid => {
                const off = officers.find(o => o.unitId === uid);
                if (!off) return null;
                return (
                  <div key={uid} style={{ padding:'4px 0', borderBottom:'1px solid #060e18' }}>
                    <div style={{ fontSize:11, fontFamily:'var(--font-mono)', color: ST_COLOR[off.status] || '#aabbcc', marginBottom:4, fontWeight:700 }}>
                      {uid} · {off.name}
                    </div>
                    <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
                      {['AVAILABLE','ENRT','BUSY','ARRVD','UNAVAILABLE','OFFDUTY'].map(s => (
                        <button
                          key={s}
                          onClick={() => setUnitStatus(uid, s)}
                          style={{
                            padding:'2px 7px', fontSize:9, fontFamily:'var(--font-mono)',
                            background: off.status === s ? '#0e2848' : '#04090f',
                            color: off.status === s ? ST_COLOR[s] || '#80c8f0' : '#3a5a78',
                            border:`1px solid ${off.status === s ? '#1a5090' : '#0d1e30'}`,
                            cursor:'pointer', fontWeight:700,
                          }}
                        >
                          {s === 'AVAILABLE' ? 'AVL' : s === 'UNAVAILABLE' ? 'UNAVL' : s === 'OFFDUTY' ? 'OFD' : s}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </Section>
          )}
        </div>

        {/* ── COL 3: Radio TX + dispatch log ── */}
        <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Radio TX (dispatch only) */}
          {isDispatch && (
            <Section title="RADIO BROADCAST">
              <div style={{ display:'flex', gap:6 }}>
                <input
                  style={{
                    flex:1, background:'#060f1e', border:'1px solid #1a3050',
                    color:'#c8e0f0', fontFamily:'var(--font-mono)', fontSize:12,
                    padding:'6px 8px', outline:'none',
                  }}
                  placeholder="Broadcast message..."
                  value={radioMsg}
                  onChange={e => setRadioMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendRadio()}
                />
                <button
                  onClick={sendRadio}
                  disabled={!radioMsg.trim()}
                  style={{
                    padding:'6px 16px', fontSize:11, fontFamily:'var(--font-mono)',
                    background: radioMsg.trim() ? '#0e2848' : '#04090f',
                    color: radioMsg.trim() ? '#80c8f0' : '#334455',
                    border:`1px solid ${radioMsg.trim() ? '#1a5090' : '#0d1e30'}`,
                    cursor: radioMsg.trim() ? 'pointer' : 'default', fontWeight:700,
                  }}
                >
                  TX
                </button>
              </div>
            </Section>
          )}

          {/* Dispatch log */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{
              padding:'0 10px', height:28, display:'flex', alignItems:'center',
              background:'#040a14', borderBottom:'1px solid #0d1e30', flexShrink:0,
            }}>
              <span style={{ fontSize:10, fontWeight:700, color:'#4a6a88', fontFamily:'var(--font-mono)', letterSpacing:'0.8px', textTransform:'uppercase' }}>
                ■ DISPATCH LOG
              </span>
              <span style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'#22ff66' }} />
            </div>
            <div style={{ flex:1, overflowY:'auto' }}>
              {dispatchLog.slice(0, 100).map(e => (
                <div key={e.id} className="detail-log-entry">
                  <span className="detail-log-time">{e.time}</span>
                  <span className={`detail-log-${e.kind}`} style={{ flex:1, whiteSpace:'normal', wordBreak:'break-word' }}>
                    {e.text}
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

/* ── Small helpers ── */
function Section({ title, children, flex }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', borderBottom:'1px solid #0d1e30', ...(flex ? { flex:1 } : {}) }}>
      <div style={{
        padding:'4px 10px', background:'#040d1c', borderBottom:'1px solid #0d1e30',
        fontSize:10, fontWeight:700, color:'#4a6a88', fontFamily:'var(--font-mono)',
        letterSpacing:'0.8px', textTransform:'uppercase', flexShrink:0,
      }}>
        {title}
      </div>
      <div style={{ padding:'8px 10px', flex: flex ? 1 : undefined }}>
        {children}
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono, small, color }) {
  return (
    <div style={{ display:'flex', gap:8, marginBottom:5, alignItems:'baseline' }}>
      <span style={{ fontSize:10, color:'#3a5a78', fontFamily:'var(--font-mono)', letterSpacing:'0.3px', minWidth:80, flexShrink:0, textTransform:'uppercase' }}>
        {label}
      </span>
      <span style={{
        fontSize: small ? 11 : 13,
        color: color || '#c8d8e8',
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-ui)',
        fontWeight: 500,
      }}>
        {value}
      </span>
    </div>
  );
}
