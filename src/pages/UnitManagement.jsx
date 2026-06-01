import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import {
  S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_CARD,
  S_SELECT, S_LABEL,
  S_BTN_PRIMARY, S_BTN_SECONDARY,
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
  const { officers, departments, calls, currentUser } = state;
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
    <div className="flex-1 overflow-hidden flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-center gap-5 px-2.5 py-1.5 bg-app-panel border-b border-border-base shrink-0">
        {[
          { label: 'ON DUTY', value: onDuty, colorClass: 'text-cad-data' },
          { label: 'AVAILABLE', value: available, colorClass: 'text-green-400' },
          { label: 'RESPONDING', value: responding, colorClass: 'text-amber-400' },
          { label: 'OFF DUTY', value: officers.length - onDuty, colorClass: 'text-cad-muted' },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center">
            <span className={`font-mono text-[15px] font-bold leading-none ${s.colorClass}`}>{s.value}</span>
            <span className="text-[8px] text-cad-muted tracking-[0.6px] uppercase">{s.label}</span>
          </div>
        ))}
        <div className="ml-auto flex gap-1.5">
          <select className={`${S_SELECT} !w-[110px] !text-[10px]`} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            {DEPTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <select className={`${S_SELECT} !w-[110px] !text-[10px]`} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid flex-1 overflow-hidden min-h-0" style={{ gridTemplateColumns: '1fr 280px' }}>
        {/* Roster table */}
        <div className={`${S_PANEL} rounded-none border-t-0 border-l-0 border-b-0 border-r-0`}>
          <div className={S_PANEL_HEADER}>
            <div className={S_PANEL_TITLE}>Unit Roster</div>
            <span className="text-[9px] text-cad-muted font-mono">
              {filtered.length} RECORDS
            </span>
          </div>
          <div className={S_PANEL_BODY}>
            <table className={S_TABLE}>
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
                      <span className={`${BADGE.blue} text-[9px]`}>{o.deptShort}</span>
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
                          onChange={e => dispatch({ type: 'SET_UNIT_STATUS', payload: { unitId: o.unitId, status: e.target.value } })}>
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
        <div className={`${S_PANEL} rounded-none border-t-0 border-r-0 border-b-0`}>
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
              <div className={`${S_PANEL_BODY} p-3`}>
                {/* Avatar / Name */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-10 h-10 rounded-full bg-app-card border border-border-base flex items-center justify-center text-base text-cad-dim shrink-0">
                    {selOfficer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold">{selOfficer.name}</div>
                    <div className={`${S_DATA} text-[10px]`}>{selOfficer.badge}</div>
                  </div>
                </div>

                <div className={`${S_CARD} mb-2`}>
                  <div className="text-[9px] text-cad-muted uppercase tracking-[0.7px] mb-2">Assignment</div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Unit ID</span><span className={S_DETAIL_VALUE_MONO}>{selOfficer.unitId}</span></div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Department</span><span className={S_DETAIL_VALUE}>{selOfficer.deptShort}</span></div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Division</span><span className={S_DETAIL_VALUE}>{selOfficer.subdivision}</span></div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Rank</span><span className={S_DETAIL_VALUE}>{selOfficer.rank}</span></div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Role</span><span className={S_DETAIL_VALUE}>{selOfficer.role}</span></div>
                </div>

                <div className={`${S_CARD} mb-2`}>
                  <div className="text-[9px] text-cad-muted uppercase tracking-[0.7px] mb-2">Current Status</div>
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
                  <div className={`${S_CARD} border-sky-700/50`}>
                    <div className="text-[9px] text-amber-400 uppercase tracking-[0.7px] mb-1.5">Active Call</div>
                    <div className="font-semibold mb-[3px]">{selCall.nature}</div>
                    <div className="text-[11px] text-cad-dim">{selCall.location}, {selCall.city}</div>
                    <div className={`${S_DATA} text-[10px] mt-1`}>{selCall.id}</div>
                  </div>
                )}

                {isAdmin && (
                  <div className="mt-2.5">
                    <div className={`${S_LABEL} mb-1.5`}>Set Status</div>
                    <div className="flex flex-wrap gap-1">
                      {['AVAILABLE','BUSY','ENRT','ARRVD','UNAVAILABLE','OFFDUTY'].map(s => (
                        <button key={s}
                          className={xs(selOfficer.status === s ? S_BTN_PRIMARY : S_BTN_SECONDARY)}
                          onClick={() => dispatch({ type: 'SET_UNIT_STATUS', payload: { unitId: selOfficer.unitId, status: s } })}>
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
