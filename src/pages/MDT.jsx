import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';

const SIDEBAR_ITEMS = ['Messages', 'Alerts', 'State Returns', 'History', 'Saved'];

export default function MDT() {
  const { state, dispatch } = useCAD();
  const { messages, calls, officers, currentUser, civilians, vehicles } = state;
  const [activeSection, setActiveSection] = useState('Messages');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [returnResult, setReturnResult] = useState(null);

  const myOfficer = officers.find(o => o.id === currentUser?.id);
  const myCall = calls.find(c => c.id === myOfficer?.callId);
  const unread = messages.filter(m => !m.read).length;

  const handleMsgClick = (msg) => {
    setSelectedMessage(msg);
    dispatch({ type: 'MARK_MESSAGE_READ', payload: msg.id });
  };

  const runReturn = () => {
    const q = searchQuery.trim().toUpperCase();
    const civ = civilians.find(c =>
      `${c.firstName} ${c.lastName}`.toUpperCase().includes(q) ||
      c.ssn.replace(/-/g,'').includes(q.replace(/-/g,''))
    );
    const veh = vehicles.find(v => v.plate.toUpperCase().includes(q));
    setReturnResult({ civ, veh });
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 48px)', fontFamily: 'Ubuntu Mono, monospace' }}>
      {/* Sidebar */}
      <div style={{ width: '180px', background: '#060d1a', borderRight: '1px solid #1e4080', display: 'flex', flexDirection: 'column' }}>
        {/* My status */}
        <div style={{ padding: '12px', borderBottom: '1px solid #1e3060' }}>
          <div style={{ color: '#4a9eff', fontSize: '12px', letterSpacing: '1px', marginBottom: '6px' }}>MY STATUS</div>
          <StatusBadge status={myOfficer?.status || 'OFFDUTY'} />
          {myCall && <div style={{ color: '#f59e0b', fontSize: '12px', marginTop: '6px' }}>ON CALL: {myCall.id}</div>}
        </div>
        {SIDEBAR_ITEMS.map(item => (
          <button
            key={item}
            onClick={() => setActiveSection(item)}
            style={{
              background: activeSection === item ? '#0d2545' : 'transparent',
              border: 'none',
              borderLeft: activeSection === item ? '3px solid #4a9eff' : '3px solid transparent',
              color: activeSection === item ? '#4a9eff' : '#64748b',
              padding: '10px 14px',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'Ubuntu Mono, monospace',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {item}
            {item === 'Messages' && unread > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', borderRadius: '10px', fontSize: '11px', padding: '1px 6px' }}>{unread}</span>
            )}
          </button>
        ))}
      </div>

      {/* Main panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {activeSection === 'Messages' && (
          <>
            {/* Message list */}
            <div style={{ width: '280px', borderRight: '1px solid #1e4080', overflow: 'auto' }}>
              <div style={{ padding: '10px 12px', background: '#0a1a35', borderBottom: '1px solid #1e3060', color: '#e2a84b', fontSize: '14px', fontWeight: 700, letterSpacing: '1px' }}>
                INBOX ({messages.length})
              </div>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => handleMsgClick(msg)}
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #0f1e35',
                    cursor: 'pointer',
                    background: selectedMessage?.id === msg.id ? '#0d2545' : !msg.read ? '#090f20' : 'transparent',
                    borderLeft: `3px solid ${msg.priority === 'HIGH' ? '#ef4444' : '#1e4080'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: !msg.read ? '#fff' : '#94a3b8', fontSize: '12px', fontWeight: !msg.read ? 700 : 400 }}>{msg.from}</span>
                    {msg.priority === 'HIGH' && <StatusBadge status="HIGH" />}
                  </div>
                  <div style={{ color: !msg.read ? '#e2e8f0' : '#64748b', fontSize: '12px', marginTop: '3px', fontWeight: !msg.read ? 600 : 400 }}>{msg.subject}</div>
                  <div style={{ color: '#475569', fontSize: '11px', marginTop: '2px' }}>{msg.timestamp}</div>
                </div>
              ))}
            </div>
            {/* Message detail */}
            <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
              {selectedMessage ? (
                <>
                  <div style={{ background: '#0a1a35', border: '1px solid #1e4080', borderRadius: '4px', padding: '12px', marginBottom: '12px', fontSize: '14px' }}>
                    <div style={{ color: '#4a9eff', fontWeight: 700, marginBottom: '6px', fontSize: '16px' }}>{selectedMessage.subject}</div>
                    <div style={{ color: '#94a3b8', marginBottom: '4px' }}>From: <span style={{ color: '#e2e8f0' }}>{selectedMessage.from}</span></div>
                    <div style={{ color: '#94a3b8', marginBottom: '4px' }}>To: <span style={{ color: '#e2e8f0' }}>{selectedMessage.to}</span></div>
                    <div style={{ color: '#475569', fontSize: '12px' }}>{selectedMessage.timestamp}</div>
                  </div>
                  <div style={{ background: '#060d1a', border: '1px solid #1e3060', borderRadius: '4px', padding: '14px', color: '#c4cdd6', fontSize: '15px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                    {selectedMessage.body}
                  </div>
                </>
              ) : (
                <div style={{ color: '#334155', textAlign: 'center', marginTop: '80px', fontSize: '15px' }}>Select a message to read</div>
              )}
            </div>
          </>
        )}

        {activeSection === 'State Returns' && (
          <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
            <div style={{ color: '#e2a84b', fontSize: '15px', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>STATE TERMINAL — NCIC/DMV RETURNS</div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runReturn()}
                placeholder="Enter name, SSN, or plate..."
                style={{ flex: 1, background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', color: '#e2e8f0', padding: '8px 12px', fontSize: '15px', fontFamily: 'Ubuntu Mono, monospace' }}
              />
              <button onClick={runReturn} style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '8px 16px', cursor: 'pointer', fontSize: '14px', fontFamily: 'Ubuntu Mono, monospace', fontWeight: 700 }}>
                RUN RETURN
              </button>
            </div>

            {returnResult && (
              <div>
                {returnResult.civ ? (
                  <CivilianTerminal civ={returnResult.civ} />
                ) : returnResult.veh ? null : (
                  <div style={{ color: '#ef4444', fontFamily: 'Ubuntu Mono, monospace', fontSize: '15px' }}>*** NO RECORDS FOUND FOR QUERY ***</div>
                )}
                {returnResult.veh && (
                  <VehicleTerminal veh={returnResult.veh} civ={civilians.find(c => c.id === returnResult.veh.ownerId)} />
                )}
              </div>
            )}
          </div>
        )}

        {activeSection === 'Alerts' && (
          <div style={{ flex: 1, padding: '16px' }}>
            <div style={{ color: '#e2a84b', fontSize: '15px', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>ACTIVE ALERTS</div>
            <div style={{ background: '#1a0505', border: '1px solid #ef4444', borderRadius: '4px', padding: '12px', marginBottom: '10px', fontSize: '14px', color: '#fca5a5' }}>
              ⚠️ BOLO — BLACK DODGE CHARGER, PLATE SUS-1109 — OWNER HAS ACTIVE WARRANT — DO NOT APPROACH WITHOUT BACKUP
            </div>
            <div style={{ background: '#1a1005', border: '1px solid #f59e0b', borderRadius: '4px', padding: '12px', fontSize: '14px', color: '#fcd34d' }}>
              ⚠️ INCREASED ACTIVITY — RIVERSIDE DISTRICT — EXERCISE CAUTION
            </div>
          </div>
        )}

        {activeSection === 'History' && (
          <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
            <div style={{ color: '#e2a84b', fontSize: '15px', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>RETURN HISTORY</div>
            {[
              { time: '14:18', query: 'Plate: SUS-1109', result: 'OWNER WANTED' },
              { time: '14:02', query: 'Name: Darnell Washington', result: 'ACTIVE WARRANT' },
              { time: '13:45', query: 'Plate: ARC-1204', result: 'CLEAR' },
            ].map((h, i) => (
              <div key={i} style={{ background: '#0a1525', border: '1px solid #1e3060', borderRadius: '4px', padding: '10px 12px', marginBottom: '8px', fontSize: '14px', display: 'flex', gap: '16px' }}>
                <span style={{ color: '#475569' }}>{h.time}</span>
                <span style={{ color: '#94a3b8' }}>{h.query}</span>
                <span style={{ color: h.result === 'CLEAR' ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{h.result}</span>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'Saved' && (
          <div style={{ flex: 1, padding: '16px' }}>
            <div style={{ color: '#e2a84b', fontSize: '15px', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>SAVED RETURNS</div>
            <div style={{ color: '#334155', textAlign: 'center', marginTop: '60px', fontSize: '15px' }}>No saved returns.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function TermRow({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', gap: '4px', marginBottom: '3px' }}>
      <span style={{ color: '#4a9eff', minWidth: '160px', fontSize: '14px' }}>{label}:</span>
      <span style={{ color: valueColor || '#e2e8f0', fontSize: '14px' }}>{value}</span>
    </div>
  );
}

export function CivilianTerminal({ civ }) {
  if (!civ) return null;
  return (
    <div style={{ background: '#040a10', border: '1px solid #1e4080', borderRadius: '4px', padding: '16px', fontFamily: 'Ubuntu Mono, monospace', marginBottom: '16px' }}>
      <div style={{ color: '#e2a84b', borderBottom: '1px solid #2a3a50', paddingBottom: '8px', marginBottom: '12px', fontSize: '12px', letterSpacing: '1px' }}>
        *** STATE OF FLORIDA — DEPARTMENT OF MOTOR VEHICLES — NCIC RETURN ***
      </div>
      <TermRow label="NAME" value={`${civ.lastName}, ${civ.firstName}`} valueColor="#fff" />
      <TermRow label="DATE OF BIRTH" value={civ.dob} />
      <TermRow label="GENDER" value={civ.gender} />
      <TermRow label="ETHNICITY" value={civ.ethnicity} />
      <TermRow label="HEIGHT" value={civ.height} />
      <TermRow label="WEIGHT" value={civ.weight} />
      <TermRow label="HAIR COLOR" value={civ.hair} />
      <TermRow label="EYE COLOR" value={civ.eyes} />
      <TermRow label="SSN" value={civ.ssn} />
      <TermRow label="PHONE" value={civ.phone} />
      <TermRow label="ADDRESS" value={civ.address} />
      <div style={{ margin: '8px 0', borderTop: '1px dashed #1e3060', paddingTop: '8px' }}>
        <TermRow label="DL NUMBER" value={civ.dlNumber} />
        <TermRow label="DL CLASS" value={civ.dlClass} />
        <TermRow
          label="DL STATUS"
          value={civ.dlStatus}
          valueColor={civ.dlStatus === 'ACTIVE' ? '#22c55e' : '#ef4444'}
        />
        <TermRow label="DL EXPIRY" value={civ.dlExpiry} />
      </div>
      {civ.flags?.length > 0 && (
        <div style={{ marginTop: '8px', padding: '8px', background: '#1a0505', border: '1px solid #ef4444', borderRadius: '4px' }}>
          <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 700 }}>*** FLAGS: {civ.flags.join(' | ')} ***</span>
        </div>
      )}
      <div style={{ color: '#334155', fontSize: '11px', marginTop: '10px', borderTop: '1px solid #1e3060', paddingTop: '6px' }}>
        RETURN GENERATED: {new Date().toLocaleString()} — ARCADIA STATE SYSTEMS
      </div>
    </div>
  );
}

export function VehicleTerminal({ veh, civ }) {
  if (!veh) return null;
  return (
    <div style={{ background: '#040a10', border: '1px solid #1e4080', borderRadius: '4px', padding: '16px', fontFamily: 'Ubuntu Mono, monospace', marginBottom: '16px' }}>
      <div style={{ color: '#e2a84b', borderBottom: '1px solid #2a3a50', paddingBottom: '8px', marginBottom: '12px', fontSize: '12px', letterSpacing: '1px' }}>
        *** STATE OF ARCADIA — VEHICLE REGISTRATION RETURN ***
      </div>
      <TermRow label="PLATE" value={veh.plate} valueColor="#fff" />
      <TermRow label="YEAR / MAKE / MODEL" value={`${veh.year} ${veh.make} ${veh.model}`} />
      <TermRow label="COLOR" value={veh.color} />
      <TermRow label="REGISTRATION" value={veh.regStatus} valueColor={veh.regStatus === 'VALID' ? '#22c55e' : '#ef4444'} />
      <TermRow label="REG EXPIRY" value={veh.regExpiry} />
      <TermRow label="STOLEN" value={veh.stolen ? 'YES — BOLO' : 'NO'} valueColor={veh.stolen ? '#ef4444' : '#22c55e'} />
      {civ && (
        <>
          <div style={{ margin: '8px 0', borderTop: '1px dashed #1e3060', paddingTop: '8px', color: '#4a9eff', fontSize: '12px', letterSpacing: '1px' }}>REGISTERED OWNER</div>
          <TermRow label="NAME" value={`${civ.lastName}, ${civ.firstName}`} />
          <TermRow label="ADDRESS" value={civ.address} />
          {civ.flags?.length > 0 && (
            <div style={{ marginTop: '6px', padding: '6px', background: '#1a0505', border: '1px solid #ef4444', borderRadius: '4px' }}>
              <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 700 }}>*** OWNER FLAGS: {civ.flags.join(' | ')} ***</span>
            </div>
          )}
        </>
      )}
      {veh.flags?.length > 0 && (
        <div style={{ marginTop: '8px', padding: '8px', background: '#1a0505', border: '1px solid #ef4444', borderRadius: '4px' }}>
          <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 700 }}>*** VEHICLE FLAGS: {veh.flags.join(' | ')} ***</span>
        </div>
      )}
    </div>
  );
}
