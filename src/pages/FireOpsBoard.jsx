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
import {
  MdLocalHospital, MdSearch, MdWarningAmber, MdPerson, MdShield,
} from 'react-icons/md';

function PriBadge({ p }) {
  const badgeMap = { 1: BADGE.p1, 2: BADGE.p2, 3: BADGE.p3, 4: BADGE.p4 };
  return <span className={badgeMap[p] || BADGE.gray}>P{p}</span>;
}

function MedicalLookup({ civilians }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const doSearch = () => {
    if (!query.trim()) return;
    setSearched(true);
    const q = query.toLowerCase();
    const found = civilians.find(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.dob?.includes(q) || c.ssn?.includes(q)
    );
    setResult(found || null);
  };

  const mp = result?.medicalProfile;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Search input */}
      <div className="p-3 border-b border-border-faint shrink-0">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-orange-500/50 transition-all"
            placeholder="Name, DOB, or SSN"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
          />
          <button onClick={doSearch}
            className="shrink-0 flex items-center justify-center px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white cursor-pointer transition-colors">
            <MdSearch size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {!searched && (
          <div className="text-center p-6 text-slate-600">
            <MdLocalHospital size={36} className="mx-auto mb-2 opacity-30" />
            <div className="text-[12px]">Search by patient name, DOB, or SSN</div>
          </div>
        )}

        {searched && !result && (
          <div className="text-center p-6 text-slate-600 text-[12px]">No record found</div>
        )}

        {result && (
          <div className="flex flex-col gap-3">
            {/* Patient header */}
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-app-elevated border border-border-base">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)' }}>
                <MdPerson size={20} color="#fb923c" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-extrabold text-white">{result.firstName} {result.lastName}</div>
                <div className="text-[10.5px] text-slate-500 font-mono">DOB {result.dob} · {result.gender}</div>
              </div>
            </div>

            {!mp ? (
              <div className="text-center py-6 text-slate-600 text-[12px]">No medical profile on file</div>
            ) : (
              <>
                {/* Blood type + critical flags */}
                <div className="flex flex-wrap gap-2">
                  {mp.bloodType && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                      style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.28)' }}>
                      <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-red-400/70">Blood</span>
                      <span className="text-[18px] font-extrabold text-red-300 leading-none">{mp.bloodType}</span>
                    </div>
                  )}
                  {mp.dnr && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                      style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.45)' }}>
                      <MdWarningAmber size={14} color="#ef4444" />
                      <span className="text-[12px] font-extrabold text-red-300">DNR</span>
                    </div>
                  )}
                  {mp.organDonor && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                      style={{ background: 'rgba(61,130,240,0.10)', border: '1px solid rgba(61,130,240,0.28)' }}>
                      <span className="text-[11px] font-semibold text-blue-300">Organ Donor</span>
                    </div>
                  )}
                </div>

                {/* Conditions */}
                {mp.conditions?.length > 0 && (
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-[0.7px] text-slate-500 mb-1.5">Conditions</div>
                    <div className="flex flex-wrap gap-1">
                      {mp.conditions.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/22 text-[10.5px] text-amber-200">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Allergies */}
                {mp.allergies?.length > 0 && (
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-[0.7px] text-red-400/70 mb-1.5">Allergies</div>
                    <div className="flex flex-wrap gap-1">
                      {mp.allergies.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/25 text-[10.5px] text-red-200 font-semibold">{a}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medications */}
                {mp.medications?.length > 0 && (
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-[0.7px] text-slate-500 mb-1.5">Current Medications</div>
                    <div className="flex flex-col gap-0.5">
                      {mp.medications.map((m, i) => (
                        <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                          <span className="text-slate-600 mt-0.5 shrink-0">•</span> {m}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emergency contact */}
                {mp.emergencyContact?.name && (
                  <div className="rounded-xl px-3 py-2.5 bg-app-elevated border border-border-base">
                    <div className="text-[9.5px] font-bold uppercase tracking-[0.7px] text-slate-500 mb-1">Emergency Contact</div>
                    <div className="text-[12.5px] font-semibold text-slate-200">{mp.emergencyContact.name}</div>
                    <div className="text-[11px] text-slate-400">{mp.emergencyContact.relationship}</div>
                    <div className="text-[11px] font-mono text-slate-400">{mp.emergencyContact.phone}</div>
                  </div>
                )}

                {/* Safety notes (for fire awareness) */}
                {mp.safetyNotes && (
                  <div className="rounded-xl px-3 py-2.5"
                    style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.22)' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <MdShield size={11} color="#f59e0b" />
                      <span className="text-[9.5px] font-bold uppercase tracking-[0.6px] text-amber-500">Safety Notes</span>
                    </div>
                    <div className="text-[11px] text-amber-200/80 leading-relaxed">{mp.safetyNotes}</div>
                  </div>
                )}

                {/* EMS / Fire notes */}
                {mp.notes && (
                  <div className="rounded-xl px-3 py-2.5"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <MdLocalHospital size={11} color="#ef4444" />
                      <span className="text-[9.5px] font-bold uppercase tracking-[0.6px] text-red-400">Clinical Notes</span>
                    </div>
                    <div className="text-[11px] text-red-200/80 leading-relaxed">{mp.notes}</div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FireOpsBoard() {
  const { state, dispatch } = useCAD();
  const { calls, officers, currentUser } = state;
  const [selectedCall, setSelectedCall] = useState(null);
  const [rosterTab, setRosterTab] = useState('APPARATUS');

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

        {/* Apparatus Roster + Medical Lookup */}
        <div className={S_PANEL}>
          {/* Tab strip */}
          <div className="flex border-b border-border-faint shrink-0">
            {[
              { id: 'APPARATUS', label: 'Apparatus' },
              { id: 'MEDICAL',   label: 'Medical Lookup', icon: MdLocalHospital },
            ].map(t => (
              <button key={t.id}
                onClick={() => setRosterTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.4px] cursor-pointer transition-colors border-none relative ${rosterTab === t.id ? 'text-orange-400' : 'text-slate-500 hover:text-slate-300'}`}
                style={{ background: 'transparent' }}>
                {t.icon && <t.icon size={13} />}
                {t.label}
                {rosterTab === t.id && <span className="absolute -bottom-px left-2 right-2 h-[2.5px] rounded-full bg-orange-500" />}
              </button>
            ))}
          </div>

          {rosterTab === 'APPARATUS' && (
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
          )}

          {rosterTab === 'MEDICAL' && (
            <MedicalLookup civilians={state.civilians} />
          )}
        </div>
      </div>
    </div>
  );
}
