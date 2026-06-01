import { useState, useEffect } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';
import { useResponsive } from '../hooks/useResponsive';

const MONO = "'Ubuntu Mono', monospace";

const SIDEBAR_ITEMS = ['Messages', 'Radio', 'Alerts', 'State Returns', 'History', 'Saved'];

const LOG_COLOR = { call: '#4ade80', unit: '#93c5fd', status: '#fbbf24', alert: '#f87171', info: '#374151' };
const LOG_TAG   = { call: 'CALL', unit: 'UNIT', status: 'STAT', alert: 'RADIO', info: 'INFO' };

export default function MDT() {
  const { state, dispatch } = useCAD();
  const { messages, calls, officers, currentUser, civilians, vehicles, dispatchLog } = state;
  const { isMobile } = useResponsive();
  const [activeSection, setActiveSection] = useState('Messages');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [mobileMsgView, setMobileMsgView] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [returnResult, setReturnResult] = useState(null);

  const myOfficer  = officers.find(o => o.id === currentUser?.id);
  const myCall     = calls.find(c => c.id === myOfficer?.callId);
  const unread     = messages.filter(m => !m.read).length;
  const unreadRadio = Math.max(0, state.radioCount - state.radioSeen);

  useEffect(() => {
    if (activeSection === 'Radio' && unreadRadio > 0) {
      dispatch({ type: 'MARK_RADIO_SEEN' });
    }
  }, [activeSection, unreadRadio, dispatch]);

  const handleMsgClick = msg => {
    setSelectedMessage(msg);
    dispatch({ type: 'MARK_MESSAGE_READ', payload: msg.id });
    if (isMobile) setMobileMsgView('detail');
  };

  const runReturn = () => {
    const q = searchQuery.trim().toUpperCase();
    const civ = civilians.find(c => `${c.firstName} ${c.lastName}`.toUpperCase().includes(q) || c.ssn.replace(/-/g,'').includes(q.replace(/-/g,'')));
    const veh = vehicles.find(v => v.plate.toUpperCase().includes(q));
    setReturnResult({ civ, veh });
  };

  const mainContent = (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

      {/* MESSAGES */}
      {activeSection === 'Messages' && (
        <>
          {(!isMobile || mobileMsgView === 'list') && (
            <div style={{ width: isMobile ? '100%' : '260px', borderRight: isMobile ? 'none' : '1px solid #141720', overflow: 'auto', display: 'flex', flexDirection: 'column', flexShrink: 0, background: '#09090f' }}>
              <ColHead title={`INBOX (${messages.length})`} />
              {messages.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => handleMsgClick(msg)}
                  style={{
                    padding: '8px 10px',
                    borderBottom: '1px solid #141720',
                    cursor: 'pointer',
                    background: selectedMessage?.id === msg.id ? '#0f172a' : !msg.read ? '#0a0d17' : 'transparent',
                    borderLeft: `3px solid ${msg.priority === 'HIGH' ? '#dc2626' : selectedMessage?.id === msg.id ? '#1d4ed8' : 'transparent'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: !msg.read ? '#e2e8f0' : '#6b7280', fontSize: '12px', fontWeight: !msg.read ? 700 : 400 }}>{msg.from}</span>
                    {msg.priority === 'HIGH' && <StatusBadge status="HIGH" />}
                  </div>
                  <div style={{ color: !msg.read ? '#9ca3af' : '#374151', fontSize: '11px', marginTop: '2px', fontWeight: !msg.read ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.subject}</div>
                  <div style={{ color: '#1f2937', fontSize: '10px', marginTop: '2px', fontFamily: MONO }}>{msg.timestamp}</div>
                </div>
              ))}
            </div>
          )}
          {(!isMobile || mobileMsgView === 'detail') && (
            <div style={{ flex: 1, padding: '12px', overflow: 'auto', background: '#080b12' }}>
              {isMobile && (
                <button onClick={() => setMobileMsgView('list')} style={{ background: '#0d1117', border: '1px solid #1a1e2c', borderRadius: '2px', color: '#93c5fd', padding: '5px 10px', fontSize: '11px', cursor: 'pointer', marginBottom: '10px', fontFamily: MONO }}>
                  ← Back to Inbox
                </button>
              )}
              {selectedMessage ? (
                <>
                  <div style={{ background: '#0d1117', border: '1px solid #1a1e2c', borderRadius: '3px', padding: '10px', marginBottom: '10px' }}>
                    <div style={{ color: '#93c5fd', fontWeight: 700, marginBottom: '6px', fontSize: '14px' }}>{selectedMessage.subject}</div>
                    <div style={{ color: '#374151', fontSize: '11px', marginBottom: '3px', fontFamily: MONO }}>
                      FROM: <span style={{ color: '#9ca3af' }}>{selectedMessage.from}</span>
                    </div>
                    <div style={{ color: '#374151', fontSize: '11px', marginBottom: '3px', fontFamily: MONO }}>
                      TO: <span style={{ color: '#9ca3af' }}>{selectedMessage.to}</span>
                    </div>
                    <div style={{ color: '#1f2937', fontSize: '10px', fontFamily: MONO }}>{selectedMessage.timestamp}</div>
                  </div>
                  <div style={{ background: '#06070c', border: '1px solid #141720', borderRadius: '3px', padding: '12px', color: '#9ca3af', fontSize: '13px', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: MONO }}>
                    {selectedMessage.body}
                  </div>
                </>
              ) : (
                <div style={{ color: '#1f2937', textAlign: 'center', marginTop: '80px', fontSize: '12px' }}>Select a message to read</div>
              )}
            </div>
          )}
        </>
      )}

      {/* RADIO */}
      {activeSection === 'Radio' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#080b12' }}>
          <ColHead title="DISPATCH RADIO — LIVE FEED" live />
          <div className="terminal" style={{ flex: 1, overflow: 'auto', padding: '8px 12px', background: '#06070c' }}>
            {dispatchLog.length === 0 && <div style={{ color: '#1f2937', textAlign: 'center', marginTop: '40px', fontSize: '12px' }}>No radio traffic yet.</div>}
            {dispatchLog.map(e => (
              <div key={e.id} style={{ display: 'flex', gap: '8px', padding: '2px 0', fontSize: '12px', lineHeight: 1.5 }}>
                <span style={{ color: '#1f2937', flexShrink: 0 }}>{e.time}</span>
                <span style={{ color: LOG_COLOR[e.kind] || '#374151', fontWeight: 700, fontSize: '10px', flexShrink: 0, minWidth: '42px' }}>
                  [{LOG_TAG[e.kind] || 'INFO'}]
                </span>
                <span style={{ color: e.kind === 'alert' ? '#fca5a5' : '#6b7280' }}>{e.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATE RETURNS */}
      {activeSection === 'State Returns' && (
        <div style={{ flex: 1, padding: '14px', overflow: 'auto', background: '#080b12' }}>
          <div style={{ color: '#fbbf24', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', marginBottom: '14px' }}>
            STATE TERMINAL — FL DEPARTMENT OF LAW ENFORCEMENT
          </div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runReturn()}
              placeholder="Enter name, SSN, or plate..."
              style={{ flex: 1, background: '#06070c', border: '1px solid #1a1e2c', borderRadius: '2px', color: '#d1d5db', padding: '7px 10px', fontSize: '12px', fontFamily: MONO }}
            />
            <button onClick={runReturn} style={{ background: '#0f2451', border: '1px solid #1d4ed8', borderRadius: '2px', color: '#93c5fd', padding: '7px 14px', cursor: 'pointer', fontSize: '12px', fontFamily: MONO, fontWeight: 700 }}>
              RUN RETURN
            </button>
          </div>
          {returnResult && (
            <div>
              {returnResult.civ ? <CivilianTerminal civ={returnResult.civ} /> :
               returnResult.veh ? null :
               <div style={{ color: '#dc2626', fontFamily: MONO, fontSize: '12px', padding: '8px', background: '#1a0505', border: '1px solid #450a0a', borderRadius: '2px' }}>
                 *** NO RECORDS FOUND FOR QUERY ***
               </div>}
              {returnResult.veh && <VehicleTerminal veh={returnResult.veh} civ={civilians.find(c => c.id === returnResult.veh.ownerId)} />}
            </div>
          )}
        </div>
      )}

      {/* ALERTS */}
      {activeSection === 'Alerts' && (
        <div style={{ flex: 1, padding: '14px', background: '#080b12' }}>
          <div style={{ color: '#fbbf24', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', marginBottom: '14px' }}>ACTIVE ALERTS</div>
          <div style={{ background: '#1a0505', border: '1px solid #991b1b', borderLeft: '3px solid #dc2626', borderRadius: '2px', padding: '10px 12px', marginBottom: '8px', fontSize: '12px', color: '#fca5a5', fontFamily: MONO }}>
            BOLO — BLACK DODGE CHARGER, PLATE SUS-1109 — OWNER HAS ACTIVE WARRANT — DO NOT APPROACH WITHOUT BACKUP
          </div>
          <div style={{ background: '#1c1505', border: '1px solid #92400e', borderLeft: '3px solid #ea580c', borderRadius: '2px', padding: '10px 12px', fontSize: '12px', color: '#fed7aa', fontFamily: MONO }}>
            INCREASED ACTIVITY — RIVERSIDE DISTRICT — EXERCISE CAUTION
          </div>
        </div>
      )}

      {/* HISTORY */}
      {activeSection === 'History' && (
        <div style={{ flex: 1, padding: '14px', overflow: 'auto', background: '#080b12' }}>
          <div style={{ color: '#fbbf24', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', marginBottom: '14px' }}>RETURN HISTORY</div>
          {[
            { time: '14:18', query: 'Plate: SUS-1109', result: 'OWNER WANTED' },
            { time: '14:02', query: 'Name: Darnell Washington', result: 'ACTIVE WARRANT' },
            { time: '13:45', query: 'Plate: ARC-1204', result: 'CLEAR' },
          ].map((h, i) => (
            <div key={i} style={{ background: '#0d1117', border: '1px solid #141720', borderRadius: '2px', padding: '8px 10px', marginBottom: '6px', fontSize: '12px', display: 'flex', gap: '14px', fontFamily: MONO }}>
              <span style={{ color: '#1f2937' }}>{h.time}</span>
              <span style={{ color: '#6b7280' }}>{h.query}</span>
              <span style={{ color: h.result === 'CLEAR' ? '#4ade80' : '#f87171', fontWeight: 700 }}>{h.result}</span>
            </div>
          ))}
        </div>
      )}

      {/* SAVED */}
      {activeSection === 'Saved' && (
        <div style={{ flex: 1, padding: '14px', background: '#080b12' }}>
          <div style={{ color: '#fbbf24', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', marginBottom: '14px' }}>SAVED RETURNS</div>
          <div style={{ color: '#1f2937', textAlign: 'center', marginTop: '60px', fontSize: '12px' }}>No saved returns.</div>
        </div>
      )}
    </div>
  );

  // ── Mobile layout ──
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)', fontFamily: MONO, background: '#080b12' }}>
        <div style={{ background: '#09090f', borderBottom: '1px solid #141720', display: 'flex', overflowX: 'auto' }} className="tab-scroll">
          <div style={{ padding: '0 10px', borderRight: '1px solid #141720', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <StatusBadge status={myOfficer?.status || 'OFFDUTY'} />
          </div>
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item}
              onClick={() => { setActiveSection(item); setMobileMsgView('list'); }}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeSection === item ? '2px solid #1d4ed8' : '2px solid transparent',
                color: activeSection === item ? '#93c5fd' : '#374151',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: MONO,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              {item}
              {item === 'Messages' && unread > 0 && <Badge n={unread} color="#dc2626" />}
              {item === 'Radio' && unreadRadio > 0 && <Badge n={unreadRadio} color="#fbbf24" dark />}
            </button>
          ))}
        </div>
        {mainContent}
      </div>
    );
  }

  // ── Desktop layout ──
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 70px)', fontFamily: MONO, background: '#080b12', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: '170px', background: '#09090f', borderRight: '1px solid #141720', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '10px', borderBottom: '1px solid #141720' }}>
          <div style={{ color: '#374151', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>My Status</div>
          <StatusBadge status={myOfficer?.status || 'OFFDUTY'} />
          {myCall && (
            <div style={{ color: '#fbbf24', fontSize: '11px', marginTop: '6px', fontFamily: MONO }}>
              ON CALL: {myCall.id}
            </div>
          )}
        </div>
        {SIDEBAR_ITEMS.map(item => (
          <button
            key={item}
            onClick={() => setActiveSection(item)}
            style={{
              background: activeSection === item ? '#0f172a' : 'transparent',
              border: 'none',
              borderLeft: activeSection === item ? '3px solid #1d4ed8' : '3px solid transparent',
              color: activeSection === item ? '#93c5fd' : '#374151',
              padding: '9px 12px',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: MONO,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            {item}
            {item === 'Messages' && unread > 0 && <Badge n={unread} color="#dc2626" />}
            {item === 'Radio' && unreadRadio > 0 && <Badge n={unreadRadio} color="#fbbf24" dark />}
          </button>
        ))}
      </div>
      {mainContent}
    </div>
  );
}

function Badge({ n, color, dark }) {
  return (
    <span style={{ background: color, color: dark ? '#1a1205' : '#fff', borderRadius: '10px', fontSize: '10px', padding: '0 5px', lineHeight: '16px', fontWeight: 700 }}>
      {n}
    </span>
  );
}

function ColHead({ title, live }) {
  return (
    <div style={{ padding: '5px 10px', background: '#0d1117', borderBottom: '1px solid #141720', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
      {live && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px #22c55e' }} />}
      <span style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px' }}>{title}</span>
    </div>
  );
}

/* ── Exported terminal components used by SearchPage ── */

function TermRow({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
      <span style={{ color: '#1d4ed8', minWidth: '150px', fontSize: '12px' }}>{label}:</span>
      <span style={{ color: valueColor || '#d1d5db', fontSize: '12px' }}>{value}</span>
    </div>
  );
}

export function CivilianTerminal({ civ }) {
  if (!civ) return null;
  return (
    <div style={{ background: '#06070c', border: '1px solid #1a1e2c', borderTop: '2px solid #1d4ed8', borderRadius: '3px', padding: '14px', fontFamily: "'Ubuntu Mono', monospace", marginBottom: '14px' }}>
      <div style={{ color: '#374151', borderBottom: '1px solid #141720', paddingBottom: '6px', marginBottom: '10px', fontSize: '10px', letterSpacing: '1.5px' }}>
        *** STATE OF FLORIDA — FL DEPT OF LAW ENFORCEMENT — NCIC RETURN ***
      </div>
      <TermRow label="NAME"            value={`${civ.lastName}, ${civ.firstName}`} valueColor="#e2e8f0" />
      <TermRow label="DATE OF BIRTH"   value={civ.dob} />
      <TermRow label="GENDER"          value={civ.gender} />
      <TermRow label="ETHNICITY"       value={civ.ethnicity} />
      <TermRow label="HEIGHT"          value={civ.height} />
      <TermRow label="WEIGHT"          value={civ.weight} />
      <TermRow label="HAIR COLOR"      value={civ.hair} />
      <TermRow label="EYE COLOR"       value={civ.eyes} />
      <TermRow label="SSN"             value={civ.ssn} />
      <TermRow label="PHONE"           value={civ.phone} />
      <TermRow label="ADDRESS"         value={civ.address} />
      <div style={{ margin: '8px 0', borderTop: '1px dashed #141720', paddingTop: '8px' }}>
        <TermRow label="DL NUMBER"  value={civ.dlNumber} />
        <TermRow label="DL CLASS"   value={civ.dlClass} />
        <TermRow label="DL STATUS"  value={civ.dlStatus} valueColor={civ.dlStatus === 'ACTIVE' ? '#4ade80' : '#f87171'} />
        <TermRow label="DL EXPIRY"  value={civ.dlExpiry} />
      </div>
      {civ.flags?.length > 0 && (
        <div style={{ marginTop: '8px', padding: '6px 8px', background: '#1a0505', border: '1px solid #991b1b', borderRadius: '2px' }}>
          <span style={{ color: '#f87171', fontSize: '11px', fontWeight: 700 }}>*** FLAGS: {civ.flags.join(' | ')} ***</span>
        </div>
      )}
      <div style={{ color: '#1f2937', fontSize: '10px', marginTop: '8px', borderTop: '1px solid #141720', paddingTop: '5px' }}>
        RETURN GENERATED: {new Date().toLocaleString()} — HILLSBOROUGH COUNTY, FL
      </div>
    </div>
  );
}

export function VehicleTerminal({ veh, civ }) {
  if (!veh) return null;
  return (
    <div style={{ background: '#06070c', border: '1px solid #1a1e2c', borderTop: '2px solid #1d4ed8', borderRadius: '3px', padding: '14px', fontFamily: "'Ubuntu Mono', monospace", marginBottom: '14px' }}>
      <div style={{ color: '#374151', borderBottom: '1px solid #141720', paddingBottom: '6px', marginBottom: '10px', fontSize: '10px', letterSpacing: '1.5px' }}>
        *** STATE OF FLORIDA — DHSMV — VEHICLE REGISTRATION RETURN ***
      </div>
      <TermRow label="PLATE"            value={veh.plate}                    valueColor="#e2e8f0" />
      <TermRow label="YEAR / MAKE / MODEL" value={`${veh.year} ${veh.make} ${veh.model}`} />
      <TermRow label="COLOR"            value={veh.color} />
      <TermRow label="REGISTRATION"     value={veh.regStatus}               valueColor={veh.regStatus === 'VALID' ? '#4ade80' : '#f87171'} />
      <TermRow label="REG EXPIRY"       value={veh.regExpiry} />
      <TermRow label="STOLEN"           value={veh.stolen ? 'YES — BOLO' : 'NO'} valueColor={veh.stolen ? '#f87171' : '#4ade80'} />
      {civ && (
        <>
          <div style={{ margin: '8px 0', borderTop: '1px dashed #141720', paddingTop: '8px', color: '#1d4ed8', fontSize: '10px', letterSpacing: '1px' }}>
            REGISTERED OWNER
          </div>
          <TermRow label="NAME"    value={`${civ.lastName}, ${civ.firstName}`} />
          <TermRow label="ADDRESS" value={civ.address} />
          {civ.flags?.length > 0 && (
            <div style={{ marginTop: '6px', padding: '6px 8px', background: '#1a0505', border: '1px solid #991b1b', borderRadius: '2px' }}>
              <span style={{ color: '#f87171', fontSize: '11px', fontWeight: 700 }}>*** OWNER FLAGS: {civ.flags.join(' | ')} ***</span>
            </div>
          )}
        </>
      )}
      {veh.flags?.length > 0 && (
        <div style={{ marginTop: '6px', padding: '6px 8px', background: '#1a0505', border: '1px solid #991b1b', borderRadius: '2px' }}>
          <span style={{ color: '#f87171', fontSize: '11px', fontWeight: 700 }}>*** VEHICLE FLAGS: {veh.flags.join(' | ')} ***</span>
        </div>
      )}
    </div>
  );
}
