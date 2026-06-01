import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import {
  S_PAGE, S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_BTN_PRIMARY, S_BTN_GHOST, S_BTN_SUCCESS,
  xs, sm,
  S_TABLE, S_TABLE_TH, S_TABLE_TD, trHoverOn, trHoverOff,
  BADGE, S_DATA, S_UNIT_ROW,
  cadCallStatus,
} from '../constants/styles';

function PriBadge({ p }) {
  const variants = { 1: BADGE.p1, 2: BADGE.p2, 3: BADGE.p3, 4: BADGE.p4 };
  return <span className={variants[p] || BADGE.gray}>P{p}</span>;
}

function StatusBadge({ status }) {
  const map = {
    AVAILABLE: BADGE.available, BUSY: BADGE.busy, ENRT: BADGE.enrt,
    ARRVD: BADGE.arrvd, OFFDUTY: BADGE.offduty, UNAVAILABLE: BADGE.unavailable,
  };
  return <span className={map[status] || BADGE.gray}>{status}</span>;
}

// Tab button style helper (replaces removed tabStyle)
const tabCls = (active) =>
  `px-[10px] py-[3px] text-[9px] font-mono font-bold cursor-pointer border transition-all ${
    active
      ? 'bg-sky-950 text-sky-300 border-sky-700'
      : 'bg-app-bg text-slate-500 border-white/[0.05] hover:text-slate-300'
  }`;

export default function DispatchBoard() {
  const { state, dispatch } = useCAD();
  const { calls, officers, currentUser } = state;
  const [filter, setFilter] = useState('ALL');
  const [selectedCall, setSelectedCall] = useState(null);

  const me = officers.find(o => o.id === currentUser?.id);

  const activeCalls = calls.filter(c => c.status !== 'CLOSED');
  const filtered = filter === 'ALL' ? activeCalls : activeCalls.filter(c => c.status === filter);
  const selCall = selectedCall ? calls.find(c => c.id === selectedCall) : null;

  const onDuty = officers.filter(o => o.status !== 'OFFDUTY');
  const myCall = me?.callId ? calls.find(c => c.id === me.callId) : null;
  const myStatus = me?.status || 'OFFDUTY';

  const selfAssign = () => {
    if (!selectedCall || !me) return;
    dispatch({ type: 'ASSIGN_UNIT', payload: { callId: selectedCall, unitId: me.unitId } });
    dispatch({ type: 'SET_MY_CALL', payload: selectedCall });
  };

  const setMyStatus = (s) => dispatch({ type: 'SET_STATUS', payload: s });

  const TABS = ['ALL', 'PENDING', 'ACTIVE', 'ENRT'];

  // Unit status dot color (runtime dynamic * kept in style)
  const dotColor = (status) => ({
    AVAILABLE: '#22dd66',
    BUSY:      '#ff4444',
    ENRT:      '#ddcc00',
    ARRVD:     '#22ccff',
  }[status] || '#556677');

  return (
    <div className={`${S_PAGE} !p-0 !overflow-hidden !gap-0`}>
      {/* My status bar */}
      <div className="flex items-center gap-2 px-[10px] py-[5px] bg-app-panel border-b border-border-base shrink-0">
        <span className="text-[9px] text-cad-muted font-mono uppercase tracking-[0.6px]">
          MY STATUS:
        </span>
        {['AVAILABLE','BUSY','ENRT','ARRVD','UNAVAILABLE','OFFDUTY'].map(s => (
          <button key={s}
            className={`${xs(myStatus === s ? S_BTN_PRIMARY : S_BTN_GHOST)} font-mono tracking-[0.3px]`}
            onClick={() => setMyStatus(s)}>{s}</button>
        ))}
        <div className="w-px h-[18px] bg-border-base mx-1" />
        <span className="text-[9px] text-cad-muted font-mono">
          UNIT: <span className="text-cad-data">{me?.unitId || '*'}</span>
          {myCall && <> · CALL: <span className="text-yellow-300">{myCall.id} * {myCall.nature}</span></>}
        </span>
      </div>

      <div className="grid gap-2 flex-1 min-h-0 p-2 overflow-hidden" style={{ gridTemplateColumns: '1fr 280px' }}>
        {/* Call table */}
        <div className={S_PANEL}>
          <div className={S_PANEL_HEADER}>
            <div className={S_PANEL_TITLE}>Active Calls</div>
            <div className="flex gap-0.5">
              {TABS.map(t => (
                <button key={t}
                  className={tabCls(filter === t)}
                  onClick={() => setFilter(t)}>
                  {t} {t === 'ALL' ? `(${activeCalls.length})` : `(${activeCalls.filter(c => c.status === t).length})`}
                </button>
              ))}
            </div>
          </div>
          <div className={S_PANEL_BODY}>
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-cad-muted text-[11px]">No calls matching filter</div>
            ) : (
              <table className={S_TABLE}>
                <thead>
                  <tr>
                    {['Call #','Pri','Nature','Location','City','Status','Units','Time'].map(h => (
                      <th key={h} className={S_TABLE_TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.sort((a,b) => a.priority - b.priority).map(c => (
                    <tr key={c.id}
                      className="cursor-pointer transition-all"
                      style={{
                        background: selectedCall === c.id ? 'var(--n-bg-selected)' : '',
                        boxShadow: selectedCall === c.id ? 'inset 2px 0 0 var(--acc-blue-hi)' : '',
                        borderLeft: c.priority === 1 ? '2px solid var(--pr1-text)' : '',
                      }}
                      onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}
                      onClick={() => setSelectedCall(c.id)}>
                      <td className={S_TABLE_TD}><span className={S_DATA}>{c.id}</span></td>
                      <td className={S_TABLE_TD}><PriBadge p={c.priority} /></td>
                      <td className={`${S_TABLE_TD} font-medium`}>{c.nature}</td>
                      <td className={`${S_TABLE_TD} text-cad-dim max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap`}>{c.location}</td>
                      <td className={`${S_TABLE_TD} text-cad-dim text-[11px]`}>{c.city}</td>
                      <td className={S_TABLE_TD}><span className={cadCallStatus(c.status)}>{c.status}</span></td>
                      <td className={`${S_TABLE_TD} font-mono text-[10px] ${c.units.length > 0 ? 'text-cad-text' : 'text-amber-400'}`}>
                        {c.units.length > 0 ? c.units.join(', ') : 'UNASSIGNED'}
                      </td>
                      <td className={`${S_TABLE_TD} font-mono text-[10px] text-cad-dim`}>
                        {c.timestamp?.split(' ')[1] || '*'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Call detail strip */}
          {selCall && (
            <div className="border-t border-border-base px-3 py-2 bg-app-card shrink-0">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="text-xs font-semibold mb-0.5">
                    {selCall.nature} * <span className="text-cad-dim font-normal">{selCall.location}, {selCall.city}</span>
                  </div>
                  <div className="text-[11px] text-cad-dim leading-[1.5]">{selCall.description}</div>
                  <div className="text-[10px] text-cad-muted font-mono mt-[3px]">
                    Reporting Party: {selCall.reportingParty || '*'} · {selCall.timestamp}
                  </div>
                </div>
                {me && !selCall.units.includes(me.unitId) && (
                  <button className={sm(S_BTN_SUCCESS)} onClick={selfAssign}>
                    Self-Assign
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Unit Roster */}
        <div className={S_PANEL}>
          <div className={S_PANEL_HEADER}>
            <div className={S_PANEL_TITLE}>Unit Roster</div>
            <span className="text-[9px] text-cad-muted font-mono">{onDuty.length} ON</span>
          </div>
          <div className={S_PANEL_BODY}>
            {onDuty.map(o => {
              const assignedCall = o.callId ? calls.find(c => c.id === o.callId) : null;
              return (
                <div key={o.id} className={S_UNIT_ROW}>
                  <div className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: dotColor(o.status) }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-[5px] items-center">
                      <span className={`${S_DATA} text-[10px]`}>{o.unitId}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="text-[10.5px] text-cad-text overflow-hidden text-ellipsis whitespace-nowrap">
                      {o.name}
                    </div>
                    <div className="text-[9px] text-cad-muted font-mono">
                      {o.deptShort} · {o.badge}
                    </div>
                    {assignedCall && (
                      <div className="text-[9px] text-yellow-300 font-mono">
                        {assignedCall.id} * {assignedCall.nature}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
