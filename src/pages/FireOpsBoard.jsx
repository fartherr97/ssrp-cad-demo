import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import {
  S_PAGE, S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_CARD,
  S_LABEL,
  S_BTN_FIRE, S_BTN_SECONDARY,
  sm,
  BADGE,
  S_DATA,
  S_UNIT_ROW,
  S_CALL_CARD,
} from '../constants/styles';

function PriBadge({ p }) {
  const badgeMap = { 1: BADGE.p1, 2: BADGE.p2, 3: BADGE.p3, 4: BADGE.p4 };
  return <span className={badgeMap[p] || BADGE.gray}>P{p}</span>;
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
    <div className={`${S_PAGE} !p-0 overflow-hidden !gap-0`}>
      {/* Header stats */}
      <div className="flex gap-5 items-center px-2.5 py-[5px] bg-app-panel border-b border-border-base shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <div>
            <div className="text-[11px] font-bold text-red-700 tracking-[0.3px]">HCFR OPERATIONS</div>
            <div className="text-[9px] text-cad-muted tracking-[0.5px]">HILLSBOROUGH COUNTY FIRE RESCUE</div>
          </div>
        </div>
        {[
          { label: 'ACTIVE', value: fireCalls.length, colorClass: 'text-orange-400' },
          { label: 'P1 INCIDENTS', value: fireCalls.filter(c => c.priority === 1).length, colorClass: 'text-red-400' },
          { label: 'APPARATUS ON DUTY', value: fireUnits.length, colorClass: 'text-cad-data' },
          { label: 'AVAILABLE', value: fireUnits.filter(u => u.status === 'AVAILABLE').length, colorClass: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center gap-px pl-3 border-l border-border-base">
            <span className={`font-mono text-[15px] font-bold ${s.colorClass}`}>{s.value}</span>
            <span className="text-[8px] text-cad-muted tracking-[0.6px] uppercase">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="split-3 p-2">
        {/* Fire Incidents */}
        <div className={S_PANEL}>
          <div className={S_PANEL_HEADER}>
            <div className={`${S_PANEL_TITLE} !text-red-700`}>Active Incidents</div>
            <span className="text-[9px] text-cad-muted font-mono">{fireCalls.length}</span>
          </div>
          <div className={S_PANEL_BODY}>
            {fireCalls.length === 0 ? (
              <div className="p-6 text-center text-cad-muted text-[11px]">No active fire/EMS incidents</div>
            ) : fireCalls.sort((a,b) => a.priority - b.priority).map(c => (
              <div
                key={c.id}
                className={S_CALL_CARD(c.priority, selectedCall === c.id)}
                onClick={() => setSelectedCall(c.id)}
              >
                <div className="flex gap-1.5 mb-[3px] items-center">
                  <PriBadge p={c.priority} />
                  <span className={`${S_DATA} text-[10px]`}>{c.id}</span>
                  <span className={`${c.status === 'PENDING' ? BADGE.orange : c.status === 'ACTIVE' ? BADGE.fire : c.status === 'ENRT' ? BADGE.yellow : BADGE.gray} ml-auto text-[8px]`}>
                    {c.status}
                  </span>
                </div>
                <div className="text-[12px] font-semibold text-cad-text mb-0.5">{c.nature}</div>
                <div className="text-[11px] text-cad-muted">{c.location}</div>
                <div className="text-[10px] text-cad-muted mt-[3px]">
                  {c.units.length > 0 ? c.units.join(', ') : 'No apparatus'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incident Detail */}
        <div className={S_PANEL}>
          {!selCall ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2.5 text-cad-muted p-6">
              <span className="text-[40px] opacity-30">🔥</span>
              <div className="text-center">
                <div className="text-[12px] font-medium text-cad-dim mb-[3px]">No incident selected</div>
                <div className="text-[10px]">Select an incident from the queue</div>
              </div>
            </div>
          ) : (
            <>
              <div className={S_PANEL_HEADER}>
                <div>
                  <div className={`${S_PANEL_TITLE} !text-red-700`}>
                    <span className={S_DATA}>{selCall.id}</span> · {selCall.nature}
                  </div>
                  <div className="text-[9px] text-cad-muted font-mono mt-px">{selCall.timestamp}</div>
                </div>
                <PriBadge p={selCall.priority} />
              </div>
              <div className={`${S_PANEL_BODY} p-3`}>
                <div className={`${S_CARD} mb-2.5 border-l-[3px] border-l-red-700`}>
                  <div className={`${S_LABEL} mb-[3px]`}>Incident Location</div>
                  <div className="text-[13px] font-semibold">{selCall.location}</div>
                  <div className="text-[11px] text-cad-dim">{selCall.city}, {selCall.county}</div>
                </div>

                <div className={`${S_CARD} mb-2.5`}>
                  <div className={`${S_LABEL} mb-1.5`}>Incident Description</div>
                  <div className="text-[11.5px] leading-relaxed">{selCall.description}</div>
                </div>

                <div className={`${S_CARD} mb-2.5`}>
                  <div className={`${S_LABEL} mb-1.5`}>Assigned Apparatus ({selCall.units.length})</div>
                  {selCall.units.length === 0 ? (
                    <div className="text-[11px] text-cad-muted">No apparatus on scene</div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selCall.units.map(uid => {
                        const off = officers.find(o => o.unitId === uid);
                        return (
                          <div key={uid} className="flex items-center gap-1.5 bg-app-card border border-red-900/60 rounded-[3px] px-2 py-[3px]">
                            <span className="text-red-700 text-[10px] font-mono">{uid}</span>
                            {off && <span className="text-[10px] text-cad-dim">{off.name}</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {me?.deptShort === 'HCFR' && !selCall.units.includes(me.unitId) && (
                  <button
                    className={`${S_BTN_FIRE} w-full justify-center`}
                    onClick={selfAssign}
                  >
                    Assign Apparatus to Incident
                  </button>
                )}

                <div className="flex gap-1.5 mt-2">
                  <button
                    className={sm(S_BTN_SECONDARY)}
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
            <div className={`${S_PANEL_TITLE} !text-red-700`}>Apparatus Status</div>
          </div>
          <div className={S_PANEL_BODY}>
            {APPARATUS_TYPES.map(ap => (
              ap.units.length > 0 && (
                <div key={ap.label}>
                  <div className="px-2 py-[3px] text-[9px] font-bold uppercase tracking-[0.5px] text-orange-900 border-b border-border-faint">
                    {ap.icon} {ap.label} ({ap.units.length})
                  </div>
                  {ap.units.map(o => (
                    <div key={o.id} className={S_UNIT_ROW}>
                      <div className={`w-[7px] h-[7px] rounded-full shrink-0 ${
                        o.status === 'AVAILABLE' ? 'bg-green-400' :
                        o.status === 'ENRT' ? 'bg-amber-400' :
                        o.status === 'ARRVD' ? 'bg-cyan-400' : 'bg-red-400'
                      }`} />
                      <span className={`${S_DATA} min-w-[40px] text-[10px] text-orange-700`}>{o.unitId}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] overflow-hidden text-ellipsis whitespace-nowrap">{o.name}</div>
                        <div className="text-[9px] text-cad-muted font-mono">{o.rank}</div>
                      </div>
                      <span className={`${o.status === 'AVAILABLE' ? BADGE.available : o.status === 'ENRT' ? BADGE.enrt : o.status === 'ARRVD' ? BADGE.arrvd : BADGE.busy} text-[8px]`}>
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ))}
            {fireUnits.length === 0 && (
              <div className="p-5 text-center text-cad-muted text-[11px]">
                No HCFR units on duty
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
