import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { useToast } from '../contexts/ToastContext';
import { DeptTag } from '../constants/deptLogos.jsx';
import { MdArrowBack } from 'react-icons/md';
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

      <div className="mob-two-pane grid flex-1 overflow-hidden min-h-0 gap-4 lg:gap-5" style={{ gridTemplateColumns: '1fr 300px' }}>
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
