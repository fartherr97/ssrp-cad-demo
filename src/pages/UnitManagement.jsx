import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { useToast } from '../contexts/ToastContext';
import { DeptTag } from '../constants/deptLogos.jsx';
import {
  MdArrowBack, MdLocalFireDepartment, MdMyLocation, MdLocationOn,
  MdCheckCircle, MdArrowForward,
} from 'react-icons/md';
import { STATUS_COLORS } from '../constants/statusColors';
import {
  S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_CARD,
  S_SELECT, S_LABEL,
  S_BTN_PRIMARY, S_BTN_SECONDARY,
  S_STAT, S_STAT_LABEL, S_STAT_VALUE,
  xs,
  S_TABLE, S_TABLE_TH, S_TABLE_TD, trHoverOn, trHoverOff,
  BADGE,
  S_DETAIL_ROW, S_DETAIL_LABEL, S_DETAIL_VALUE, S_DETAIL_VALUE_MONO,
  S_DATA,
} from '../constants/styles';

function StatusBadge({ status }) {
  const key = { AVAILABLE:'available', BUSY:'busy', ENRT:'enrt', ARRVD:'arrvd', OFFDUTY:'offduty', UNAVAILABLE:'unavailable' }[status] || 'gray';
  return <span className={BADGE[key] || BADGE.gray}>{status}</span>;
}

function PriBadge({ p }) {
  const m = { 1: BADGE.p1, 2: BADGE.p2, 3: BADGE.p3, 4: BADGE.p4 };
  return <span className={m[p] || BADGE.gray}>P{p}</span>;
}

/* Field-unit self-service status codes (mirrors the dispatcher set). */
const MY_STATUSES = [
  { code: 'AVAILABLE',   label: 'Available'   },
  { code: 'ENRT',        label: 'En Route'    },
  { code: 'ARRVD',       label: 'On Scene'    },
  { code: 'BUSY',        label: 'Busy'        },
  { code: 'UNAVAILABLE', label: 'Unavailable' },
  { code: 'OFFDUTY',     label: 'Off Duty'    },
];

/* HCFR "My Status" + self-dispatch sidebar. Lets a field unit set its own
   status and attach itself to an active fire / EMS incident without waiting
   on a dispatcher. */
function MyStatusPanel({ me, calls, dispatch, toast }) {
  const myCall = me?.callId ? calls.find(c => c.id === me.callId) : null;
  const fireCalls = calls
    .filter(c => c.category === 'fire' && c.status !== 'CLOSED')
    .sort((a, b) => a.priority - b.priority);

  const setStatus = (code) => {
    dispatch({ type: 'SET_STATUS', payload: code });
    const lbl = MY_STATUSES.find(s => s.code === code)?.label || code;
    toast.info(`Status set to ${lbl}`, { color: STATUS_COLORS[code] });
  };

  const respond = (callId) => {
    // Switching incidents: clear off the previous one first so it doesn't
    // keep showing this unit on scene.
    if (me.callId && me.callId !== callId) {
      dispatch({ type: 'DETACH_UNIT', payload: { callId: me.callId, unitId: me.unitId } });
    }
    dispatch({ type: 'ASSIGN_UNIT', payload: { callId, unitId: me.unitId } });
    dispatch({ type: 'SET_MY_CALL', payload: callId });
    toast.success(`${me.unitId} en route to ${callId}`, { title: 'Self-Dispatched' });
  };

  const clearCall = () => {
    if (!me.callId) return;
    const prev = me.callId;
    dispatch({ type: 'DETACH_UNIT', payload: { callId: prev, unitId: me.unitId } });
    dispatch({ type: 'SET_MY_CALL', payload: null });
    toast.info(`${me.unitId} cleared from ${prev}`);
  };

  const dot = STATUS_COLORS[me.status] || '#94a3b8';

  return (
    <div className="flex flex-col min-h-0 bg-app-panel/80 border rounded-xl overflow-hidden backdrop-blur-sm shadow-lg shadow-black/20"
      style={{ borderColor: 'rgba(224,64,32,0.38)' }}>
      <div className={S_PANEL_HEADER}>
        <MdLocalFireDepartment size={15} className="text-orange-400 shrink-0" />
        <div className={S_PANEL_TITLE}>My Status</div>
      </div>
      <div className={`${S_PANEL_BODY} p-3.5 gap-3.5`}>
        {/* Identity */}
        <div className="flex items-center gap-2.5">
          <span className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-app-elevated border border-border-base flex items-center justify-center text-[14px] font-bold text-slate-300">
              {me.name.charAt(0)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-app-panel" style={{ background: dot }} />
          </span>
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-white truncate">{me.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`${S_DATA} text-[10px] text-orange-400`}>{me.unitId}</span>
              <StatusBadge status={me.status} />
            </div>
          </div>
        </div>

        {/* Status toggles */}
        <div>
          <div className={`${S_LABEL} mb-1.5`}>Set My Status</div>
          <div className="grid grid-cols-2 gap-1.5">
            {MY_STATUSES.map(s => {
              const on = me.status === s.code;
              const c = STATUS_COLORS[s.code];
              return (
                <button key={s.code} onClick={() => setStatus(s.code)}
                  className="press-sm flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11.5px] font-bold cursor-pointer transition-all border"
                  style={on
                    ? { background: `${c}22`, borderColor: `${c}66`, color: c }
                    : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c }} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Self-dispatch */}
        <div className="border-t border-border-faint pt-3 min-h-0 flex flex-col">
          <div className={`${S_LABEL} mb-2 flex items-center gap-1.5`}>
            <MdMyLocation size={12} className="text-orange-400" /> Self-Dispatch
          </div>

          {myCall ? (
            <div className={`${S_CARD} !border-orange-500/40 bg-orange-500/[0.07] gap-1`}>
              <div className="flex items-center gap-1.5">
                <PriBadge p={myCall.priority} />
                <span className={`${S_DATA} text-[10px]`}>{myCall.id}</span>
                <span className="ml-auto text-[9.5px] font-bold uppercase tracking-wide text-orange-400">Assigned</span>
              </div>
              <div className="text-[12.5px] font-semibold text-white">{myCall.nature}</div>
              <div className="text-[11px] text-slate-400">{myCall.location}</div>
              <button onClick={clearCall}
                className="mt-2 press-sm w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11.5px] font-bold cursor-pointer border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] transition-colors">
                <MdCheckCircle size={13} /> Clear &amp; Mark Available
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 mb-1">Not assigned. Respond to an active incident below.</div>
          )}

          <div className="flex flex-col gap-1.5 mt-2 overflow-y-auto" style={{ maxHeight: 280 }}>
            {fireCalls.length === 0 ? (
              <div className="text-[11px] text-slate-600 text-center py-4">No active fire / EMS incidents</div>
            ) : fireCalls.map(c => {
              const onThis = me.callId === c.id;
              return (
                <div key={c.id} className="rounded-lg border border-border-base bg-app-card/70 p-2.5 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <PriBadge p={c.priority} />
                    <span className={`${S_DATA} text-[10px]`}>{c.id}</span>
                    <span className="ml-auto text-[10px] text-slate-500 font-mono">{c.units.length} unit{c.units.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="text-[12px] font-semibold text-slate-100 leading-snug">{c.nature}</div>
                  <div className="flex items-start gap-1 text-[11px] text-slate-400">
                    <MdLocationOn size={12} className="text-slate-500 shrink-0 mt-0.5" /> {c.location}
                  </div>
                  <button onClick={() => respond(c.id)} disabled={onThis}
                    className="press-sm mt-0.5 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors border-0 disabled:cursor-default"
                    style={onThis
                      ? { background: 'rgba(74,222,128,0.15)', color: '#4ade80' }
                      : { background: '#e04020', color: '#fff' }}>
                    {onThis
                      ? <><MdCheckCircle size={13} /> Responding</>
                      : <><MdArrowForward size={13} /> Respond En Route</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnitManagement() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const { officers, departments, calls, currentUser } = state;
  const setUnitStatus = (unitId, status) => {
    dispatch({ type: 'SET_UNIT_STATUS', payload: { unitId, status } });
    toast.info(`${unitId} → ${status}`);
  };
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'dispatch';

  // HCFR field members get a self-service "My Status" + self-dispatch sidebar.
  const me = officers.find(o => o.id === currentUser?.id);
  const showMyStatus = me?.deptShort === 'HCFR';

  const filtered = officers.filter(o => {
    const deptMatch = deptFilter === 'ALL' || o.deptShort === deptFilter || o.dept === Number(deptFilter);
    const statMatch = statusFilter === 'ALL' || o.status === statusFilter;
    return deptMatch && statMatch;
  });

  const selOfficer = selected ? officers.find(o => o.id === selected) : null;
  const selCall = selOfficer?.callId ? calls.find(c => c.id === selOfficer.callId) : null;

  const onDuty = officers.filter(o => o.status !== 'OFFDUTY').length;
  const available = officers.filter(o => o.status === 'AVAILABLE').length;
  const responding = officers.filter(o => o.status === 'ENRT' || o.status === 'ARRVD').length;

  const STATUSES = ['ALL','AVAILABLE','BUSY','ENRT','ARRVD','UNAVAILABLE','OFFDUTY'];
  const DEPTS = ['ALL', ...departments.map(d => d.abbreviation)];

  return (
    <div className="flex flex-col flex-1 overflow-hidden p-3 md:p-5 gap-4 lg:gap-5">
      {/* Header * stat widgets + filters */}
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 min-w-0 sm:min-w-[280px]">
          {[
            { label: 'On Duty', value: onDuty, color: '#ffffff' },
            { label: 'Available', value: available, color: '#4ade80' },
            { label: 'Responding', value: responding, color: '#fbbf24' },
            { label: 'Off Duty', value: officers.length - onDuty, color: '#94a3b8' },
          ].map(s => (
            <div key={s.label} className={S_STAT}>
              <span className={S_STAT_LABEL}>{s.label}</span>
              <span className={S_STAT_VALUE} style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 ml-auto">
          <select className={`${S_SELECT} !w-[130px]`} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            {DEPTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <select className={`${S_SELECT} !w-[150px]`} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="mob-two-pane grid flex-1 overflow-hidden min-h-0 gap-4 lg:gap-5"
        style={{ gridTemplateColumns: showMyStatus ? '290px minmax(0,1fr) 300px' : '1fr 300px' }}>
        {/* HCFR My Status + Self-Dispatch sidebar */}
        {showMyStatus && (
          <MyStatusPanel me={me} calls={calls} dispatch={dispatch} toast={toast} />
        )}

        {/* Roster table */}
        <div className={`mob-list-panel${selected ? ' mob-gone' : ''} flex flex-col min-h-0 bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm shadow-lg shadow-black/20`}>
          <div className={S_PANEL_HEADER}>
            <div className={S_PANEL_TITLE}>Unit Roster</div>
            <span className="ml-auto px-1.5 py-0.5 rounded-md bg-brand/15 text-brand-bright text-[11px] font-bold leading-none">
              {filtered.length}
            </span>
          </div>
          <div className={`${S_PANEL_BODY} overflow-x-auto`}>
            <table className={`${S_TABLE} min-w-[640px]`}>
              <thead>
                <tr>
                  <th className={S_TABLE_TH}>Status</th>
                  <th className={S_TABLE_TH}>Unit ID</th>
                  <th className={S_TABLE_TH}>Name</th>
                  <th className={S_TABLE_TH}>Badge</th>
                  <th className={S_TABLE_TH}>Department</th>
                  <th className={S_TABLE_TH}>Division</th>
                  <th className={S_TABLE_TH}>Rank</th>
                  <th className={S_TABLE_TH}>Assigned Call</th>
                  {isAdmin && <th className={S_TABLE_TH}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id}
                    className={`cursor-pointer ${selected === o.id ? 'bg-app-selected' : ''}`}
                    onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}
                    onClick={() => setSelected(o.id)}>
                    <td className={S_TABLE_TD}><StatusBadge status={o.status} /></td>
                    <td className={S_TABLE_TD}><span className={S_DATA}>{o.unitId}</span></td>
                    <td className={`${S_TABLE_TD} font-medium`}>{o.name}</td>
                    <td className={S_TABLE_TD}><span className={`${S_DATA} text-[10px]`}>{o.badge}</span></td>
                    <td className={S_TABLE_TD}>
                      <DeptTag code={o.deptShort} />
                    </td>
                    <td className={`${S_TABLE_TD} text-[11px] text-cad-dim`}>{o.subdivision}</td>
                    <td className={`${S_TABLE_TD} text-[11px] text-cad-dim`}>{o.rank}</td>
                    <td className={S_TABLE_TD}>
                      {o.callId
                        ? <span className={`${S_DATA} text-[10px]`}>{o.callId}</span>
                        : <span className="text-cad-muted text-[10px]">—</span>
                      }
                    </td>
                    {isAdmin && (
                      <td className={S_TABLE_TD} onClick={e => e.stopPropagation()}>
                        <select className={`${S_SELECT} !w-20 !text-[9px] !px-1 !py-px`}
                          value={o.status}
                          onChange={e => setUnitStatus(o.unitId, e.target.value)}>
                          <option>AVAILABLE</option>
                          <option>BUSY</option>
                          <option>ENRT</option>
                          <option>ARRVD</option>
                          <option>UNAVAILABLE</option>
                          <option>OFFDUTY</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        <div className={`mob-detail-panel${!selected ? ' mob-gone' : ''} flex flex-col min-h-0 bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm shadow-lg shadow-black/20`}>
          <button className="mob-back-btn !rounded-none" onClick={() => setSelected(null)}>
            <MdArrowBack size={14} /> Back to roster
          </button>
          {!selOfficer ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-cad-muted p-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              <span className="text-[11px] text-center">Select a unit to view details</span>
            </div>
          ) : (
            <>
              <div className={S_PANEL_HEADER}>
                <div className={S_PANEL_TITLE}>Unit Profile</div>
                <StatusBadge status={selOfficer.status} />
              </div>
              <div className={`${S_PANEL_BODY} p-4 gap-3`}>
                {/* Avatar / Name */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-app-elevated border border-border-base flex items-center justify-center text-base font-bold text-slate-300 shrink-0">
                    {selOfficer.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold text-white truncate">{selOfficer.name}</div>
                    <div className={`${S_DATA} text-[10px]`}>{selOfficer.badge}</div>
                  </div>
                </div>

                <div className={S_CARD}>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.7px] mb-2">Assignment</div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Unit ID</span><span className={S_DETAIL_VALUE_MONO}>{selOfficer.unitId}</span></div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Department</span><span className={S_DETAIL_VALUE}><DeptTag code={selOfficer.deptShort} /></span></div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Division</span><span className={S_DETAIL_VALUE}>{selOfficer.subdivision}</span></div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Rank</span><span className={S_DETAIL_VALUE}>{selOfficer.rank}</span></div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Role</span><span className={S_DETAIL_VALUE}>{selOfficer.role}</span></div>
                </div>

                <div className={S_CARD}>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.7px] mb-2">Current Status</div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Status</span><StatusBadge status={selOfficer.status} /></div>
                  <div className={S_DETAIL_ROW}>
                    <span className={S_DETAIL_LABEL}>Assigned Call</span>
                    <span className={S_DETAIL_VALUE_MONO}>{selOfficer.callId || '—'}</span>
                  </div>
                  <div className={S_DETAIL_ROW}>
                    <span className={S_DETAIL_LABEL}>Location</span>
                    <span className={S_DETAIL_VALUE}>{selOfficer.location || '—'}</span>
                  </div>
                </div>

                {selCall && (
                  <div className={`${S_CARD} !border-brand/40 bg-brand/[0.07]`}>
                    <div className="text-[10px] text-brand-bright uppercase tracking-[0.7px] font-bold mb-1.5">Active Call</div>
                    <div className="font-semibold text-white mb-[3px]">{selCall.nature}</div>
                    <div className="text-[11px] text-slate-400">{selCall.location}, {selCall.city}</div>
                    <div className={`${S_DATA} text-[10px] mt-1`}>{selCall.id}</div>
                  </div>
                )}

                {isAdmin && (
                  <div className="mt-1">
                    <div className={`${S_LABEL} mb-1.5`}>Set Status</div>
                    <div className="flex flex-wrap gap-1">
                      {['AVAILABLE','BUSY','ENRT','ARRVD','UNAVAILABLE','OFFDUTY'].map(s => (
                        <button key={s}
                          className={`press-sm ${xs(selOfficer.status === s ? S_BTN_PRIMARY : S_BTN_SECONDARY)}`}
                          onClick={() => setUnitStatus(selOfficer.unitId, s)}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
