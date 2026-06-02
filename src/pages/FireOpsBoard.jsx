import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { DeptTag } from '../constants/deptLogos.jsx';
import {
  S_PAGE, S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_CARD,
  S_LABEL,
  S_BTN_FIRE, S_BTN_SECONDARY,
  sm,
  BADGE,
  S_DATA,
  S_UNIT_ROW,
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
    <div className={`${S_PAGE} !p-4 lg:!p-5 overflow-hidden !gap-4 lg:!gap-5`}>
      {/* Header stats */}
      <div className="flex flex-wrap gap-4 lg:gap-6 items-center px-4 py-3 bg-app-panel/80 border border-border-base rounded-xl backdrop-blur-sm shadow-lg shadow-black/20 shrink-0">
        <div className="flex items-center gap-3">
          <DeptTag code="HCFR" />
          <div>
            <div className="text-[13px] font-bold text-orange-400 tracking-[0.3px]">HCFR Operations</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500">HCFR Fire Rescue</div>
          </div>
        </div>
        {[
          { label: 'Active', value: fireCalls.length, colorClass: 'text-orange-400' },
          { label: 'P1 Incidents', value: fireCalls.filter(c => c.priority === 1).length, colorClass: 'text-red-400' },
          { label: 'Apparatus On Duty', value: fireUnits.length, colorClass: 'text-white' },
          { label: 'Available', value: fireUnits.filter(u => u.status === 'AVAILABLE').length, colorClass: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="flex flex-col gap-1 pl-4 border-l border-border-base">
            <span className={`font-extrabold text-[24px] leading-none tabular-nums ${s.colorClass}`}>{s.value}</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="split-3 flex-1 min-h-0 gap-4 lg:gap-5">
        {/* Fire Incidents */}
        <div className={S_PANEL}>
          <div className={S_PANEL_HEADER}>
            <div className={S_PANEL_TITLE}>Active Incidents</div>
            <span className="ml-auto px-1.5 py-0.5 rounded-md bg-orange-500/15 text-orange-400 text-[11px] font-bold leading-none">{fireCalls.length}</span>
          </div>
          <div className={`${S_PANEL_BODY} p-2.5 gap-2`}>
            {fireCalls.length === 0 ? (
              <div className="p-8 text-center text-slate-600 text-[12px]">No active fire/EMS incidents</div>
            ) : fireCalls.sort((a,b) => a.priority - b.priority).map(c => {
              const on = selectedCall === c.id;
              const priLeft = { 1:'border-l-red-500', 2:'border-l-orange-500', 3:'border-l-yellow-500', 4:'border-l-emerald-500' }[c.priority] || 'border-l-border-base';
              return (
                <div
                  key={c.id}
                  className={`rounded-xl border border-l-[3px] p-3 cursor-pointer transition-all backdrop-blur-sm ${priLeft} ${on ? 'bg-brand/15 border-brand/40' : 'bg-app-card/70 border-border-base hover:bg-white/[0.05]'}`}
                  onClick={() => setSelectedCall(c.id)}
                >
                  <div className="flex gap-1.5 mb-1.5 items-center">
                    <PriBadge p={c.priority} />
                    <span className={`${S_DATA} text-[10px]`}>{c.id}</span>
                    <span className={`${c.status === 'PENDING' ? BADGE.orange : c.status === 'ACTIVE' ? BADGE.fire : c.status === 'ENRT' ? BADGE.yellow : BADGE.gray} ml-auto`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="text-[13px] font-semibold text-white mb-0.5">{c.nature}</div>
                  <div className="text-[11.5px] text-slate-400">{c.location}</div>
                  <div className={`text-[10px] font-mono mt-1 ${c.units.length > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {c.units.length > 0 ? c.units.join(', ') : 'No apparatus'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Incident Detail */}
        <div className={S_PANEL}>
          {!selCall ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-600 p-6">
              <span className="text-[48px] opacity-25">🔥</span>
              <div className="text-center">
                <div className="text-[13px] font-semibold text-slate-400 mb-1">No incident selected</div>
                <div className="text-[11px] text-slate-600">Select an incident from the queue</div>
              </div>
            </div>
          ) : (
            <>
              <div className={S_PANEL_HEADER}>
                <div>
                  <div className="text-[12px] font-bold uppercase tracking-[0.7px] text-slate-200">
                    <span className={S_DATA}>{selCall.id}</span> · {selCall.nature}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{selCall.timestamp}</div>
                </div>
                <PriBadge p={selCall.priority} />
              </div>
              <div className={`${S_PANEL_BODY} p-4 gap-4`}>
                <div className={`${S_CARD} border-l-[3px] border-l-orange-500`}>
                  <div className={S_LABEL}>Incident Location</div>
                  <div className="text-[13px] font-semibold text-white">{selCall.location}</div>
                  <div className="text-[11.5px] text-slate-400">{selCall.city}, {selCall.county}</div>
                </div>

                <div className={S_CARD}>
                  <div className={S_LABEL}>Incident Description</div>
                  <div className="text-[12.5px] text-slate-300 leading-relaxed">{selCall.description}</div>
                </div>

                <div className={S_CARD}>
                  <div className={S_LABEL}>Assigned Apparatus ({selCall.units.length})</div>
                  {selCall.units.length === 0 ? (
                    <div className="text-[11.5px] text-slate-500">No apparatus on scene</div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selCall.units.map(uid => {
                        const off = officers.find(o => o.unitId === uid);
                        return (
                          <div key={uid} className="flex items-center gap-1.5 bg-app-elevated border border-border-base rounded-lg px-2.5 py-1.5">
                            <span className="text-orange-400 text-[11px] font-mono font-bold">{uid}</span>
                            {off && <span className="text-[11px] text-slate-300">{off.name}</span>}
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

                <div className="flex gap-1.5">
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
            <div className={S_PANEL_TITLE}>Apparatus Status</div>
          </div>
          <div className={S_PANEL_BODY}>
            {APPARATUS_TYPES.map(ap => (
              ap.units.length > 0 && (
                <div key={ap.label}>
                  <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.7px] text-orange-400 bg-app-bg/40 border-b border-border-faint">
                    {ap.icon} {ap.label} ({ap.units.length})
                  </div>
                  {ap.units.map(o => (
                    <div key={o.id} className={S_UNIT_ROW}>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        o.status === 'AVAILABLE' ? 'bg-emerald-400' :
                        o.status === 'ENRT' ? 'bg-amber-400' :
                        o.status === 'ARRVD' ? 'bg-emerald-400' : 'bg-red-400'
                      }`} />
                      <span className={`${S_DATA} min-w-[44px] text-[10px] text-orange-400`}>{o.unitId}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11.5px] text-slate-200 overflow-hidden text-ellipsis whitespace-nowrap">{o.name}</div>
                        <div className="text-[9.5px] text-slate-500 font-mono">{o.rank}</div>
                      </div>
                      <span className={o.status === 'AVAILABLE' ? BADGE.available : o.status === 'ENRT' ? BADGE.enrt : o.status === 'ARRVD' ? BADGE.arrvd : BADGE.busy}>
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ))}
            {fireUnits.length === 0 && (
              <div className="p-8 text-center text-slate-600 text-[12px]">
                No HCFR units on duty
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
