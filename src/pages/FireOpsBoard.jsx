import { useState, useMemo } from 'react';
import { useCAD } from '../store/cadStore';
import { useToast } from '../contexts/ToastContext';
import { useResponsive } from '../hooks/useResponsive';
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
  MdLocalFireDepartment, MdCheckCircle, MdThumbDownAlt, MdArrowForward,
  MdLocationOn, MdLink, MdClose, MdPhone, MdMyLocation,
} from 'react-icons/md';
import MyStatusContent from '../components/MyStatusContent';

function PriBadge({ p }) {
  const badgeMap = { 1: BADGE.p1, 2: BADGE.p2, 3: BADGE.p3, 4: BADGE.p4 };
  return <span className={badgeMap[p] || BADGE.gray}>P{p}</span>;
}

/* HCFR supervisor + command ranks. Only these (or dispatch/admin) may pull
   apparatus off a scene from the Fire Board. */
const HCFR_LEADER_RANKS = [
  'Lieutenant', 'Captain',
  'Battalion Chief', 'Division Chief', 'Assistant Chief', 'Deputy Chief', 'Fire Chief', 'Chief',
];

function elapsed(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

const PRIORITY_BADGE = {
  1: 'bg-red-500/15 border border-red-500/30 text-red-400',
  2: 'bg-amber-500/15 border border-amber-500/30 text-amber-400',
  3: 'bg-slate-500/15 border border-slate-500/30 text-slate-400',
};

/* ── HCFR Quick Dispatch Modal ── */
function HCFRDispatchModal({ req, availableUnits, onConfirm, onCancel }) {
  const [selectedId, setSelectedId] = useState(
    availableUnits.length === 1 ? availableUnits[0].id : null
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center anim-overlay-in"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="w-full sm:max-w-[460px] rounded-t-2xl sm:rounded-2xl flex flex-col gap-4 anim-sheet-in sm:anim-modal-in"
        style={{ background: '#0c1929', border: '1px solid rgba(239,68,68,0.35)', padding: '20px' }}>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)' }}>
            <MdLocalFireDepartment size={20} color="#ef4444" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold text-white">Dispatch Apparatus</div>
            <div className="text-[11.5px] text-slate-400 mt-0.5 truncate">{req.assistType} · {req.location}</div>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <MdClose size={18} className="text-slate-500 hover:text-slate-300" />
          </button>
        </div>

        {availableUnits.length === 0 ? (
          <div className="py-6 text-center text-[13px] text-slate-500">
            No available HCFR units. Mark a unit as Available first.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Select Apparatus</div>
            {availableUnits.map(u => {
              const active = selectedId === u.id;
              return (
                <button key={u.id} type="button" onClick={() => setSelectedId(u.id)}
                  className="press w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer"
                  style={{
                    background: active ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: active ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)' }}>
                    <MdLocalFireDepartment size={16} style={{ color: active ? '#ef4444' : '#64748b' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-slate-100">{u.unitId}</div>
                    <div className="text-[11px] text-slate-400">{u.name} · {u.subdivision || u.rank}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 shrink-0">
                    {u.status}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onCancel}
            className="press flex-1 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer border border-[rgba(255,255,255,0.1)] bg-white/[0.04] text-slate-400 hover:text-slate-200 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => selectedId && onConfirm(req, selectedId)}
            disabled={!selectedId}
            className="press flex-[2] py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer transition-colors border-0 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: selectedId ? '#ef4444' : '#ef444450', color: '#fff' }}>
            <span className="flex items-center justify-center gap-1.5">
              <MdArrowForward size={14} /> Dispatch En Route
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── HCFR incoming request card ── */
const HCFR_REQ_META = {
  PENDING:      { label: 'Pending',      color: '#ef4444' },
  ACKNOWLEDGED: { label: 'Acknowledged', color: '#06b6d4' },
};

function HCFRRequestCard({ req, calls, onAcknowledge, onDispatch, onDecline }) {
  const m = HCFR_REQ_META[req.status] || HCFR_REQ_META.PENDING;
  const linkedCall = req.callId ? calls.find(c => c.id === req.callId) : null;

  return (
    <div className="bg-app-panel/80 border rounded-xl p-4 flex flex-col gap-3"
      style={{ borderColor: `${m.color}55`, borderLeft: `3px solid ${m.color}` }}>
      <div className="flex justify-between items-start gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
            style={{ color: m.color, borderColor: `${m.color}55`, background: `${m.color}14` }}>
            {m.label}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${PRIORITY_BADGE[req.priority]}`}>
            P{req.priority}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">#{req.id}</span>
        </div>
        <span className="text-[10px] text-slate-500">{elapsed(req.createdAt)}</span>
      </div>

      <div className="flex items-center gap-2">
        <MdLocalFireDepartment size={16} className="text-red-400 shrink-0" />
        <span className="text-[14px] font-extrabold text-slate-100">{req.assistType}</span>
      </div>

      <div className="flex items-start gap-2">
        <MdLocationOn size={14} className="text-slate-500 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <span className="text-xs text-slate-300 leading-relaxed">{req.location}</span>
          {req.postal && <span className="text-[11px] text-slate-500 font-mono ml-2">({req.postal})</span>}
        </div>
      </div>

      <div className="flex-1 text-xs text-slate-400 leading-relaxed border-t border-border-faint pt-2">{req.description}</div>

      <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
        <MdPerson size={13} className="shrink-0" />
        <span>{req.requestedBy}{req.requestedByUnit ? ` · ${req.requestedByUnit}` : ''}</span>
        {linkedCall && (
          <span className="inline-flex items-center gap-1 ml-auto text-amber-400/80">
            <MdLink size={12} /> Call {linkedCall.id}
          </span>
        )}
      </div>

      <div className="mt-auto grid gap-2 pt-1" style={{ gridTemplateColumns: req.status === 'PENDING' ? 'repeat(3, 1fr)' : '1fr 1fr' }}>
        {req.status === 'PENDING' && (
          <button onClick={() => onAcknowledge(req)}
            className="btn-glossy inline-flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg text-[11.5px] font-bold cursor-pointer border border-transparent bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 whitespace-nowrap">
            <MdCheckCircle size={14} className="shrink-0" /> Acknowledge
          </button>
        )}
        <button onClick={() => onDispatch(req)}
          className="btn-glossy inline-flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg text-[11.5px] font-bold cursor-pointer border border-red-400/35 bg-red-500/15 text-red-200 hover:bg-red-500/25 hover:border-red-300/55 whitespace-nowrap">
          <MdArrowForward size={14} className="shrink-0" /> Dispatch
        </button>
        <button onClick={() => onDecline(req)}
          className="btn-glossy inline-flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg text-[11.5px] font-bold cursor-pointer border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] hover:border-white/20 whitespace-nowrap">
          <MdThumbDownAlt size={14} className="shrink-0" /> Decline
        </button>
      </div>
    </div>
  );
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
      <div className="p-3 border-b border-border-faint shrink-0">
        <div className="flex gap-2">
          <input
            className="flex-1 min-w-0 bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-orange-500/50 transition-all"
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

                {mp.emergencyContact?.name && (
                  <div className="rounded-xl px-3 py-2.5 bg-app-elevated border border-border-base">
                    <div className="text-[9.5px] font-bold uppercase tracking-[0.7px] text-slate-500 mb-1">Emergency Contact</div>
                    <div className="text-[12.5px] font-semibold text-slate-200">{mp.emergencyContact.name}</div>
                    <div className="text-[11px] text-slate-400">{mp.emergencyContact.relationship}</div>
                    <div className="text-[11px] font-mono text-slate-400">{mp.emergencyContact.phone}</div>
                  </div>
                )}

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
  const toast = useToast();
  const { isMobile } = useResponsive();
  const { calls, officers, currentUser, hcfrRequests = [], incoming911HCFR = [] } = state;
  const [selectedCall, setSelectedCall] = useState(null);
  const [mobileView, setMobileView] = useState('INCIDENTS'); // 'INCIDENTS' | 'DETAIL' | 'ROSTER'
  const me = officers.find(o => o.id === currentUser?.id);
  // HCFR field members land on their own status / self-dispatch tab.
  const isHCFR = me?.deptShort === 'HCFR';
  // Supervisors / command (or dispatch/admin) may pull units off a scene.
  const canRemoveUnits =
    (isHCFR && HCFR_LEADER_RANKS.includes(me?.rank)) ||
    currentUser?.role === 'admin' || currentUser?.role === 'dispatch';
  const [rosterTab, setRosterTab] = useState(isHCFR ? 'MYSTATUS' : 'APPARATUS');
  const [dispatchingReq, setDispatchingReq] = useState(null);

  const handleSelectCall = (id) => {
    setSelectedCall(id);
    if (isMobile) setMobileView('DETAIL');
  };

  const fireCalls = calls.filter(c => c.category === 'fire' && c.status !== 'CLOSED');
  const fireUnits = officers.filter(o => o.deptShort === 'HCFR' && o.status !== 'OFFDUTY');

  const selCall = selectedCall ? calls.find(c => c.id === selectedCall) : null;

  const inboundRequests = useMemo(
    () => hcfrRequests.filter(r => r.status === 'PENDING' || r.status === 'ACKNOWLEDGED'),
    [hcfrRequests]
  );

  const availableUnits = useMemo(
    () => fireUnits.filter(u => u.status === 'AVAILABLE'),
    [fireUnits]
  );

  const selfAssign = () => {
    if (!selectedCall || !me) return;
    dispatch({ type: 'ASSIGN_UNIT', payload: { callId: selectedCall, unitId: me.unitId } });
    dispatch({ type: 'SET_MY_CALL', payload: selectedCall });
  };

  const removeUnit = (callId, unitId) => {
    dispatch({ type: 'DETACH_UNIT', payload: { callId, unitId } });
    if (unitId === me?.unitId) dispatch({ type: 'SET_MY_CALL', payload: null });
    toast.info(`${unitId} removed from ${callId}`, { title: 'Unit Cleared' });
  };

  // Officer ids to notify for a request: units attached to that scene's call,
  // plus the officer who made the request (matched by unit/badge).
  const recipientsFor = (req) => {
    const ids = officers.filter(o => req.callId && o.callId === req.callId).map(o => o.id);
    const requester = officers.find(o => o.unitId === req.requestedByUnit || o.badge === req.requestedByBadge);
    if (requester && !ids.includes(requester.id)) ids.push(requester.id);
    return ids;
  };

  const acknowledgeRequest = (req) => {
    dispatch({ type: 'UPDATE_HCFR_REQUEST', payload: { id: req.id, status: 'ACKNOWLEDGED' } });
    toast.info(`Acknowledged * ${req.assistType}`, { title: 'HCFR' });
    dispatch({
      type: 'DISPATCH_RADIO',
      payload: { from: currentUser?.id, to: recipientsFor(req), text: `HCFR has acknowledged the ${req.assistType} request at ${req.location}${req.callId ? ` (Call ${req.callId})` : ''} and is responding.` },
    });
  };

  const declineRequest = (req) => {
    dispatch({ type: 'UPDATE_HCFR_REQUEST', payload: { id: req.id, status: 'DECLINED' } });
    toast.warning(`Declined * ${req.assistType}`, { title: 'HCFR' });
  };

  const confirmQuickDispatch = (req, unitId) => {
    const unit = fireUnits.find(u => u.id === unitId);
    if (req.callId) {
      dispatch({ type: 'ASSIGN_UNIT', payload: { callId: req.callId, unitId: unit?.unitId || String(unitId) } });
    }
    dispatch({ type: 'UPDATE_HCFR_REQUEST', payload: { id: req.id, status: 'DISPATCHED' } });
    toast.success(`${unit?.name || 'Unit'} dispatched en route.`, { title: 'Unit Dispatched' });
    dispatch({
      type: 'DISPATCH_RADIO',
      payload: { from: currentUser?.id, to: recipientsFor(req), text: `HCFR has dispatched ${unit?.name || 'a unit'} (${unit?.unitId || ''}) to the ${req.assistType} request at ${req.location}${req.callId ? ` (Call ${req.callId})` : ''}. Unit is en route.` },
    });
    setDispatchingReq(null);
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

      {dispatchingReq && (
        <HCFRDispatchModal
          req={dispatchingReq}
          availableUnits={availableUnits}
          onConfirm={confirmQuickDispatch}
          onCancel={() => setDispatchingReq(null)}
        />
      )}

      {/* Header stats */}
      <div className="bg-app-panel/80 border border-border-base rounded-xl backdrop-blur-sm shadow-lg shadow-black/20 shrink-0 px-4 py-3">
        {/* Mobile layout */}
        <div className="flex flex-col gap-3 lg:hidden">
          <DeptTag code="HCFR" />
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Active', value: fireCalls.length, colorClass: 'text-orange-400' },
              { label: 'P1 Incidents', value: fireCalls.filter(c => c.priority === 1).length, colorClass: 'text-red-400' },
              { label: 'On Duty', value: fireUnits.length, colorClass: 'text-white' },
              { label: 'Available', value: fireUnits.filter(u => u.status === 'AVAILABLE').length, colorClass: 'text-emerald-400' },
              ...(inboundRequests.length > 0 ? [{ label: 'LE Requests', value: inboundRequests.length, colorClass: 'text-red-400' }] : []),
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-0.5 bg-app-bg/40 rounded-lg px-2 py-2 border border-border-base/50">
                <span className={`font-extrabold text-[22px] leading-none tabular-nums ${s.colorClass}`}>{s.value}</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.6px] text-slate-500 text-center leading-tight mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Desktop layout */}
        <div className="hidden lg:flex flex-wrap gap-6 items-center">
          <DeptTag code="HCFR" />
          {[
            { label: 'Active', value: fireCalls.length, colorClass: 'text-orange-400' },
            { label: 'P1 Incidents', value: fireCalls.filter(c => c.priority === 1).length, colorClass: 'text-red-400' },
            { label: 'Apparatus On Duty', value: fireUnits.length, colorClass: 'text-white' },
            { label: 'Available', value: fireUnits.filter(u => u.status === 'AVAILABLE').length, colorClass: 'text-emerald-400' },
            ...(inboundRequests.length > 0 ? [{ label: 'LE Requests', value: inboundRequests.length, colorClass: 'text-red-400' }] : []),
          ].map(s => (
            <div key={s.label} className="flex flex-col gap-1 pl-4 border-l border-border-base">
              <span className={`font-extrabold text-[24px] leading-none tabular-nums ${s.colorClass}`}>{s.value}</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Incoming Civilian 911 (EMS / Fire routed) */}
      {incoming911HCFR.length > 0 && (
        <div className="shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
            <MdPhone size={14} /> Incoming 911 * EMS / Fire ({incoming911HCFR.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))', gap: 12 }}>
            {incoming911HCFR.map(c => (
              <div key={c.id} className="rounded-xl p-3.5 flex flex-col gap-2"
                style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)' }}>
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-amber-400/15 border border-amber-400/25 mt-0.5">
                    <MdPhone size={14} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-white leading-snug">{c.message}</div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <MdLocationOn size={11} className="text-slate-500 shrink-0" />
                      <span className="text-[11px] text-slate-400 truncate">{c.location}</span>
                    </div>
                  </div>
                </div>
                {c.caller && (
                  <div className="text-[10.5px] text-slate-500">
                    Caller: <span className="text-slate-300">{c.caller}</span>
                    {c.callbackNumber && <span className="ml-1 text-slate-600">· {c.callbackNumber}</span>}
                  </div>
                )}
                <div className="flex gap-1.5 flex-wrap">
                  {(c.esServices || []).map(svc => (
                    <span key={svc} className="text-[9.5px] font-bold px-1.5 py-0.5 rounded"
                      style={svc === 'EMS' ? { background: 'rgba(34,197,94,0.12)', color: '#86efac', border: '1px solid rgba(34,197,94,0.25)' }
                           :                 { background: 'rgba(239,68,68,0.12)',  color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)'  }}>
                      {svc === 'EMS' ? '🚑 EMS' : '🔥 Fire'}
                    </span>
                  ))}
                  <button onClick={() => dispatch({ type: 'DISMISS_HCFR_911', payload: c.id })} type="button"
                    className="ml-auto press flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: '#64748b' }}>
                    <MdClose size={11} /> Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incoming LE assistance requests */}
      {inboundRequests.length > 0 && (
        <div className="shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-2">
            <MdLocalFireDepartment size={14} /> Incoming LE Assistance Requests ({inboundRequests.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))', gap: 12 }}>
            {inboundRequests.map(req => (
              <HCFRRequestCard key={req.id} req={req} calls={calls}
                onAcknowledge={acknowledgeRequest}
                onDispatch={r => setDispatchingReq(r)}
                onDecline={declineRequest} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile tab bar — switches between Incidents / Detail / Roster */}
      {isMobile && (
        <div className="flex shrink-0 bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm">
          {[
            { id: 'INCIDENTS', label: 'Incidents', badge: fireCalls.length },
            { id: 'DETAIL',    label: 'Incident',  badge: selectedCall ? 1 : 0 },
            { id: 'ROSTER',    label: 'Roster',    badge: 0 },
          ].map(t => (
            <button key={t.id} onClick={() => setMobileView(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold uppercase tracking-wider border-b-[3px] transition-all
                ${mobileView === t.id ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              {t.label}
              {t.badge > 0 && (
                <span className={`px-1.5 py-0 rounded-full text-[9.5px] font-bold
                  ${mobileView === t.id ? 'bg-orange-500/25 text-orange-300' : 'bg-white/[0.07] text-slate-500'}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className={isMobile ? 'flex-1 min-h-0 flex flex-col' : 'split-3 flex-1 min-h-0 gap-4 lg:gap-5'}>
        {/* Fire Incidents */}
        <div className={`${S_PANEL} ${isMobile && mobileView !== 'INCIDENTS' ? 'hidden' : ''}`}>
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
                  onClick={() => handleSelectCall(c.id)}
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
        <div className={`${S_PANEL} ${isMobile && mobileView !== 'DETAIL' ? 'hidden' : ''}`}>
          {!selCall ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-600 p-6">
              <span className="text-[48px] opacity-25">🔥</span>
              <div className="text-center">
                <div className="text-[13px] font-semibold text-slate-400 mb-1">No incident selected</div>
                <div className="text-[11px] text-slate-600 mb-4">Select an incident from the queue</div>
                {isMobile && (
                  <button onClick={() => setMobileView('INCIDENTS')}
                    className="px-4 py-2 rounded-xl text-[12px] font-bold border border-orange-500/30 text-orange-400 bg-orange-500/10">
                    ← View Incidents
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className={S_PANEL_HEADER}>
                {isMobile && (
                  <button onClick={() => setMobileView('INCIDENTS')}
                    className="text-orange-400 text-[11px] font-bold flex items-center gap-1 shrink-0 mr-2 hover:text-orange-300 transition-colors"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                    ← Back
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold uppercase tracking-[0.7px] text-slate-200 truncate">
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
                  <div className="flex items-center gap-2">
                    <div className={S_LABEL}>Assigned Apparatus ({selCall.units.length})</div>
                    {canRemoveUnits && selCall.units.length > 0 && (
                      <span className="ml-auto text-[9.5px] font-bold uppercase tracking-wide text-slate-500">Supervisor · tap ✕ to clear</span>
                    )}
                  </div>
                  {selCall.units.length === 0 ? (
                    <div className="text-[11.5px] text-slate-500">No apparatus on scene</div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selCall.units.map(uid => {
                        const off = officers.find(o => o.unitId === uid);
                        return (
                          <div key={uid} className="flex items-center gap-1.5 bg-app-elevated border border-border-base rounded-lg pl-2.5 pr-1.5 py-1.5">
                            <span className="text-orange-400 text-[11px] font-mono font-bold">{uid}</span>
                            {off && <span className="text-[11px] text-slate-300">{off.name}</span>}
                            {canRemoveUnits && (
                              <button
                                onClick={() => removeUnit(selCall.id, uid)}
                                title={`Remove ${uid} from scene`}
                                aria-label={`Remove ${uid} from scene`}
                                className="ml-0.5 flex items-center justify-center w-5 h-5 rounded-md text-slate-500 hover:text-red-300 hover:bg-red-500/15 cursor-pointer transition-colors"
                                style={{ background: 'none', border: 'none' }}>
                                <MdClose size={13} />
                              </button>
                            )}
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
        <div className={`${S_PANEL} ${isMobile && mobileView !== 'ROSTER' ? 'hidden' : ''}`}>
          <div className="flex border-b border-border-faint shrink-0">
            {[
              ...(isHCFR ? [{ id: 'MYSTATUS', label: 'My Status', icon: MdMyLocation }] : []),
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

          {rosterTab === 'MYSTATUS' && isHCFR && (
            <MyStatusContent me={me} calls={calls} dispatch={dispatch} toast={toast} />
          )}

          {rosterTab === 'APPARATUS' && (
            <div className={S_PANEL_BODY}>
              {APPARATUS_TYPES.map(ap => (
                ap.units.length > 0 && (
                  <div key={ap.label}>
                    <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.7px] text-orange-400 bg-app-bg/40 border-b border-border-faint">
                      {ap.icon} {ap.label} ({ap.units.length})
                    </div>
                    {ap.units.map(o => (
                      <div key={o.id} className={`${S_UNIT_ROW} gap-2.5 py-2.5`}>
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          o.status === 'AVAILABLE' ? 'bg-emerald-400' :
                          o.status === 'ENRT' ? 'bg-amber-400' :
                          o.status === 'ARRVD' ? 'bg-emerald-400' : 'bg-red-400'
                        }`} />
                        <span className={`${S_DATA} shrink-0 text-[10px] text-orange-400`}>{o.unitId}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold text-slate-200 truncate">{o.name}</div>
                          <div className="text-[9.5px] text-slate-500 font-mono truncate">{o.rank}</div>
                        </div>
                        <span className={`${o.status === 'AVAILABLE' ? BADGE.available : o.status === 'ENRT' ? BADGE.enrt : o.status === 'ARRVD' ? BADGE.arrvd : BADGE.busy} shrink-0`}>
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
