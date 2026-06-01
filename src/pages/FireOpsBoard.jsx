import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import {
  S_PAGE, S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_CARD,
  S_LABEL,
  S_BTN_FIRE, S_BTN_SECONDARY,
  sm, btnHoverOn, btnHoverOff, btnActiveOn,
  BADGE,
  S_DATA,
  S_UNIT_ROW, unitRowHoverOn, unitRowHoverOff,
  S_CALL_CARD, callCardHoverOn, callCardHoverOff,
} from '../constants/styles';

function PriBadge({ p }) {
  const badgeMap = { 1: BADGE.p1, 2: BADGE.p2, 3: BADGE.p3, 4: BADGE.p4 };
  return <span style={badgeMap[p] || BADGE.gray}>P{p}</span>;
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
    <div style={{ ...S_PAGE, padding: 0, overflow: 'hidden', gap: 0 }}>
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
        <div className={S_PANEL}>
          <div className={S_PANEL_HEADER}>
            <div style={{ ...S_PANEL_TITLE, color: '#c03820' }}>Active Incidents</div>
            <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{fireCalls.length}</span>
          </div>
          <div className={S_PANEL_BODY}>
            {fireCalls.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--n-text-muted)', fontSize: 11 }}>No active fire/EMS incidents</div>
            ) : fireCalls.sort((a,b) => a.priority - b.priority).map(c => (
              <div
                key={c.id}
                style={S_CALL_CARD(c.priority, selectedCall === c.id)}
                onClick={() => setSelectedCall(c.id)}
               
                onMouseLeave={e => callCardHoverOff(selectedCall === c.id, e)}
              >
                <div style={{ display: 'flex', gap: 5, marginBottom: 3, alignItems: 'center' }}>
                  <PriBadge p={c.priority} />
                  <span style={{ ...S_DATA, fontSize: 10 }}>{c.id}</span>
                  <span style={{ ...(c.status === 'PENDING' ? BADGE.orange : c.status === 'ACTIVE' ? BADGE.fire : c.status === 'ENRT' ? BADGE.yellow : BADGE.gray), marginLeft: 'auto', fontSize: 8 }}>
                    {c.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--n-text)', marginBottom: 2 }}>{c.nature}</div>
                <div style={{ fontSize: 11, color: 'var(--n-text-muted)' }}>{c.location}</div>
                <div style={{ fontSize: 10, color: 'var(--n-text-muted)', marginTop: 3 }}>
                  {c.units.length > 0 ? c.units.join(', ') : 'No apparatus'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incident Detail */}
        <div className={S_PANEL}>
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
              <div className={S_PANEL_HEADER}>
                <div>
                  <div style={{ ...S_PANEL_TITLE, color: '#c03820' }}>
                    <span className={S_DATA}>{selCall.id}</span> · {selCall.nature}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{selCall.timestamp}</div>
                </div>
                <PriBadge p={selCall.priority} />
              </div>
              <div style={{ ...S_PANEL_BODY, padding: 12 }}>
                <div style={{ ...S_CARD, marginBottom: 10, borderLeft: '3px solid #c03820' }}>
                  <div style={{ ...S_LABEL, marginBottom: 3 }}>Incident Location</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{selCall.location}</div>
                  <div style={{ fontSize: 11, color: 'var(--n-text-dim)' }}>{selCall.city}, {selCall.county}</div>
                </div>

                <div style={{ ...S_CARD, marginBottom: 10 }}>
                  <div style={{ ...S_LABEL, marginBottom: 6 }}>Incident Description</div>
                  <div style={{ fontSize: 11.5, lineHeight: 1.6 }}>{selCall.description}</div>
                </div>

                <div style={{ ...S_CARD, marginBottom: 10 }}>
                  <div style={{ ...S_LABEL, marginBottom: 6 }}>Assigned Apparatus ({selCall.units.length})</div>
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
                  <button
                    style={{ ...S_BTN_FIRE, width: '100%', justifyContent: 'center' }}
                    onMouseDown={btnActiveOn}
                    onClick={selfAssign}
                  >
                    Assign Apparatus to Incident
                  </button>
                )}

                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button
                    className={sm(S_BTN_SECONDARY)}
                    onMouseDown={btnActiveOn}
                    onClick={() => dispatch({ type: 'CLOSE_CALL', payload: selCall.id }) || setSelectedCall(null)}>
                    Clear Incident
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Apparatus Roster */}
        <div className={S_PANEL}>
          <div className={S_PANEL_HEADER}>
            <div style={{ ...S_PANEL_TITLE, color: '#c03820' }}>Apparatus Status</div>
          </div>
          <div className={S_PANEL_BODY}>
            {APPARATUS_TYPES.map(ap => (
              ap.units.length > 0 && (
                <div key={ap.label}>
                  <div style={{ padding: '3px 8px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8a3010', borderBottom: '1px solid var(--n-border-faint)' }}>
                    {ap.icon} {ap.label} ({ap.units.length})
                  </div>
                  {ap.units.map(o => (
                    <div key={o.id} className={S_UNIT_ROW}>
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                        background: o.status === 'AVAILABLE' ? 'var(--st-av-text)' :
                          o.status === 'ENRT' ? 'var(--st-enrt-text)' :
                          o.status === 'ARRVD' ? 'var(--st-arv-text)' : 'var(--st-busy-text)',
                      }} />
                      <span style={{ ...S_DATA, minWidth: 40, fontSize: 10, color: '#d04020' }}>{o.unitId}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.name}</div>
                        <div style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{o.rank}</div>
                      </div>
                      <span style={{ ...(o.status === 'AVAILABLE' ? BADGE.available : o.status === 'ENRT' ? BADGE.enrt : o.status === 'ARRVD' ? BADGE.arrvd : BADGE.busy), fontSize: 8 }}>
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
