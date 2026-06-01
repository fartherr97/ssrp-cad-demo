import { useState } from 'react';
import { useCAD } from '../store/cadStore';

function PriBadge({ p }) {
  const cls = ['','badge-p1','badge-p2','badge-p3','badge-p4'][p]||'badge-gray';
  return <span className={`n-badge ${cls}`}>P{p}</span>;
}

export default function FireOpsBoard() {
  const { state, dispatch } = useCAD();
  const { calls, officers, currentUser } = state;
  const [selectedCall, setSelectedCall] = useState(null);

  const me = officers.find(o => o.id === currentUser?.id);

  const fireCalls = calls.filter(c => c.category === 'fire' && c.status !== 'CLOSED');
  const fireUnits = officers.filter(o => o.deptShort === 'HCFR' && o.status !== 'OFFDUTY');

  const selCall = selectedCall ? calls.find(c => c.id === selectedCall) : null;

  const selfAssign = () => {
    if (!selectedCall || !me) return;
    dispatch({ type: 'ASSIGN_UNIT', payload: { callId: selectedCall, unitId: me.unitId } });
    dispatch({ type: 'SET_MY_CALL', payload: selectedCall });
  };

  const APPARATUS_TYPES = [
    { label: 'Engines', icon: '🚒', units: fireUnits.filter(u => u.subdivision === 'Engine') },
    { label: 'Ladders', icon: '🚒', units: fireUnits.filter(u => u.subdivision === 'Ladder') },
    { label: 'Rescue/EMS', icon: '🚑', units: fireUnits.filter(u => u.subdivision === 'Rescue') },
    { label: 'Hazmat', icon: '⚠️', units: fireUnits.filter(u => u.subdivision === 'Hazmat') },
    { label: 'Command', icon: '🎖️', units: fireUnits.filter(u => u.subdivision === 'Command') },
  ];

  return (
    <div className="n-page" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
      {/* Header stats */}
      <div style={{
        display: 'flex', gap: 20, alignItems: 'center',
        padding: '5px 10px', background: 'var(--n-bg-panel)',
        borderBottom: '1px solid var(--n-border)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🔥</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#d04020', letterSpacing: '0.3px' }}>HCFR OPERATIONS</div>
            <div style={{ fontSize: 9, color: 'var(--n-text-muted)', letterSpacing: '0.5px' }}>HILLSBOROUGH COUNTY FIRE RESCUE</div>
          </div>
        </div>
        {[
          { label: 'ACTIVE', value: fireCalls.length, color: 'var(--pr2-text)' },
          { label: 'P1 INCIDENTS', value: fireCalls.filter(c => c.priority === 1).length, color: 'var(--pr1-text)' },
          { label: 'APPARATUS ON DUTY', value: fireUnits.length, color: 'var(--n-text-data)' },
          { label: 'AVAILABLE', value: fireUnits.filter(u => u.status === 'AVAILABLE').length, color: 'var(--st-av-text)' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, paddingLeft: 12, borderLeft: '1px solid var(--n-border)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 8, color: 'var(--n-text-muted)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="split-3" style={{ padding: 8 }}>
        {/* Fire Incidents */}
        <div className="n-panel">
          <div className="n-panel-header">
            <div className="n-panel-title" style={{ color: '#c03820' }}>Active Incidents</div>
            <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{fireCalls.length}</span>
          </div>
          <div className="n-panel-body scroll-y">
            {fireCalls.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--n-text-muted)', fontSize: 11 }}>No active fire/EMS incidents</div>
            ) : fireCalls.sort((a,b) => a.priority - b.priority).map(c => (
              <div
                key={c.id}
                className={`call-card p${c.priority}${selectedCall === c.id ? ' selected' : ''}`}
                onClick={() => setSelectedCall(c.id)}
              >
                <div style={{ display: 'flex', gap: 5, marginBottom: 3, alignItems: 'center' }}>
                  <PriBadge p={c.priority} />
                  <span className="n-data" style={{ fontSize: 10 }}>{c.id}</span>
                  <span className={`n-badge badge-${c.status === 'PENDING' ? 'orange' : c.status === 'ACTIVE' ? 'fire' : c.status === 'ENRT' ? 'yellow' : 'gray'}`} style={{ marginLeft: 'auto', fontSize: 8 }}>
                    {c.status}
                  </span>
                </div>
                <div className="call-nature">{c.nature}</div>
                <div className="call-meta">{c.location}</div>
                <div style={{ fontSize: 10, color: 'var(--n-text-muted)', marginTop: 3 }}>
                  {c.units.length > 0 ? c.units.join(', ') : 'No apparatus'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incident Detail */}
        <div className="n-panel">
          {!selCall ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--n-text-muted)', padding: 24 }}>
              <span style={{ fontSize: 40, opacity: 0.3 }}>🔥</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--n-text-dim)', marginBottom: 3 }}>No incident selected</div>
                <div style={{ fontSize: 10 }}>Select an incident from the queue</div>
              </div>
            </div>
          ) : (
            <>
              <div className="n-panel-header">
                <div>
                  <div className="n-panel-title" style={{ color: '#c03820' }}>
                    <span className="n-data">{selCall.id}</span> · {selCall.nature}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{selCall.timestamp}</div>
                </div>
                <PriBadge p={selCall.priority} />
              </div>
              <div className="n-panel-body scroll-y" style={{ padding: 12 }}>
                <div className="n-card" style={{ marginBottom: 10, borderLeft: '3px solid #c03820' }}>
                  <div className="n-label" style={{ marginBottom: 3 }}>Incident Location</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{selCall.location}</div>
                  <div style={{ fontSize: 11, color: 'var(--n-text-dim)' }}>{selCall.city}, {selCall.county}</div>
                </div>

                <div className="n-card" style={{ marginBottom: 10 }}>
                  <div className="n-label" style={{ marginBottom: 6 }}>Incident Description</div>
                  <div style={{ fontSize: 11.5, lineHeight: 1.6 }}>{selCall.description}</div>
                </div>

                <div className="n-card" style={{ marginBottom: 10 }}>
                  <div className="n-label" style={{ marginBottom: 6 }}>Assigned Apparatus ({selCall.units.length})</div>
                  {selCall.units.length === 0 ? (
                    <div style={{ fontSize: 11, color: 'var(--n-text-muted)' }}>No apparatus on scene</div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {selCall.units.map(uid => {
                        const off = officers.find(o => o.unitId === uid);
                        return (
                          <div key={uid} style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            background: 'var(--n-bg-elevated)', border: '1px solid #601010',
                            borderRadius: 3, padding: '3px 8px',
                          }}>
                            <span style={{ color: '#c03820', fontSize: 10, fontFamily: 'var(--font-mono)' }}>{uid}</span>
                            {off && <span style={{ fontSize: 10, color: 'var(--n-text-dim)' }}>{off.name}</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {me?.deptShort === 'HCFR' && !selCall.units.includes(me.unitId) && (
                  <button className="n-btn n-btn-fire" style={{ width: '100%', justifyContent: 'center' }} onClick={selfAssign}>
                    Assign Apparatus to Incident
                  </button>
                )}

                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button className="n-btn n-btn-secondary n-btn-sm"
                    onClick={() => dispatch({ type: 'CLOSE_CALL', payload: selCall.id }) || setSelectedCall(null)}>
                    Clear Incident
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Apparatus Roster */}
        <div className="n-panel">
          <div className="n-panel-header">
            <div className="n-panel-title" style={{ color: '#c03820' }}>Apparatus Status</div>
          </div>
          <div className="n-panel-body scroll-y">
            {APPARATUS_TYPES.map(ap => (
              ap.units.length > 0 && (
                <div key={ap.label}>
                  <div className="n-section-title" style={{ color: '#8a3010' }}>
                    {ap.icon} {ap.label} ({ap.units.length})
                  </div>
                  {ap.units.map(o => (
                    <div key={o.id} className="unit-row">
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                        background: o.status === 'AVAILABLE' ? 'var(--st-av-text)' :
                          o.status === 'ENRT' ? 'var(--st-enrt-text)' :
                          o.status === 'ARRVD' ? 'var(--st-arv-text)' : 'var(--st-busy-text)',
                      }} />
                      <span className="n-data" style={{ minWidth: 40, fontSize: 10, color: '#d04020' }}>{o.unitId}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.name}</div>
                        <div style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{o.rank}</div>
                      </div>
                      <span className={`n-badge badge-${o.status === 'AVAILABLE' ? 'available' : o.status === 'ENRT' ? 'enrt' : o.status === 'ARRVD' ? 'arrvd' : 'busy'}`} style={{ fontSize: 8 }}>
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ))}
            {fireUnits.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--n-text-muted)', fontSize: 11 }}>
                No HCFR units on duty
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
