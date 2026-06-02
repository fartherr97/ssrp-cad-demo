import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { DeptTag } from '../constants/deptLogos.jsx';
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

// Tab pill style helper — blue accent when active
const tabCls = (active) =>
  `px-3 py-1 rounded-lg text-[11px] font-semibold cursor-pointer border transition-all ${
    active
      ? 'bg-brand/15 text-brand-bright border-brand/40'
      : 'bg-white/[0.03] text-slate-400 border-border-base hover:bg-white/[0.07] hover:text-slate-200'
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

  // Unit status dot color (runtime dynamic · kept in style)
  const dotColor = (status) => ({
    AVAILABLE: '#4ade80',
    BUSY:      '#f87171',
    ENRT:      '#a78bfa',
    ARRVD:     '#34d399',
  }[status] || '#5d6f88');

  // Priority left-accent for table rows
  const priLeft = { 1: '#f87171', 2: '#fb923c', 3: '#facc15', 4: '#4ade80' };

  return (
    <div className={`${S_PAGE} !p-4 lg:!p-5 !gap-4 lg:!gap-5 !overflow-hidden`}>
      {/* My status bar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-app-panel/80 border border-border-base rounded-xl backdrop-blur-sm shrink-0">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.7px]">
          My Status
        </span>
        {['AVAILABLE','BUSY','ENRT','ARRVD','UNAVAILABLE','OFFDUTY'].map(s => (
          <button key={s}
            className={xs(myStatus === s ? S_BTN_PRIMARY : S_BTN_GHOST)}
            onClick={() => setMyStatus(s)}>{s}</button>
        ))}
        <div className="w-px h-[18px] bg-border-base mx-1" />
        <span className="text-[11px] text-slate-500 font-mono">
          UNIT: <span className="text-brand-bright">{me?.unitId || '—'}</span>
          {myCall && <> · CALL: <span className="text-brand-bright">{myCall.id} · {myCall.nature}</span></>}
        </span>
      </div>

      <div className="grid gap-4 lg:gap-5 flex-1 min-h-0 overflow-auto lg:overflow-hidden grid-cols-1 lg:grid-cols-[1fr_300px]">
        {/* Call table */}
        <div className={S_PANEL}>
          <div className={S_PANEL_HEADER}>
            <div className={S_PANEL_TITLE}>Active Calls</div>
            <div className="flex gap-1.5 ml-auto flex-wrap">
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
              <div className="p-8 text-center text-slate-600 text-[12px]">No calls matching filter</div>
            ) : (
              <>
                {/* ── Mobile card list ── */}
                <div className="lg:hidden flex flex-col divide-y divide-border-faint">
                  {filtered.sort((a,b) => a.priority - b.priority).map(c => (
                    <div key={c.id}
                      className="px-3.5 py-3 cursor-pointer transition-colors active:bg-white/[0.04]"
                      style={{
                        borderLeft: `3px solid ${priLeft[c.priority] || 'transparent'}`,
                        background: selectedCall === c.id ? 'rgba(61,130,240,0.10)' : '',
                      }}
                      onClick={() => setSelectedCall(selectedCall === c.id ? null : c.id)}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={S_DATA + ' text-[11px]'}>{c.id}</span>
                        <PriBadge p={c.priority} />
                        <span className={cadCallStatus(c.status) + ' ml-auto'}>{c.status}</span>
                      </div>
                      <div className="text-[13px] font-semibold text-slate-100 mb-0.5">{c.nature}</div>
                      <div className="text-[11px] text-slate-400">{c.location}{c.city ? `, ${c.city}` : ''}</div>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono">
                        <span className={c.units.length > 0 ? 'text-emerald-400' : 'text-amber-400'}>
                          {c.units.length > 0 ? c.units.join(', ') : 'UNASSIGNED'}
                        </span>
                        <span className="text-slate-600 ml-auto">{c.timestamp?.split(' ')[1] || '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Desktop table ── */}
                <div className="hidden lg:block overflow-x-auto">
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
                          className="cursor-pointer transition-colors"
                          style={{
                            background: selectedCall === c.id ? 'rgba(61,130,240,0.12)' : '',
                            boxShadow: selectedCall === c.id ? 'inset 2px 0 0 #3d82f0' : '',
                            borderLeft: `3px solid ${priLeft[c.priority] || 'transparent'}`,
                          }}
                          onMouseEnter={selectedCall === c.id ? undefined : trHoverOn}
                          onMouseLeave={selectedCall === c.id ? undefined : trHoverOff}
                          onClick={() => setSelectedCall(c.id)}>
                          <td className={S_TABLE_TD}><span className={S_DATA}>{c.id}</span></td>
                          <td className={S_TABLE_TD}><PriBadge p={c.priority} /></td>
                          <td className={`${S_TABLE_TD} font-medium text-slate-200`}>{c.nature}</td>
                          <td className={`${S_TABLE_TD} text-slate-400 max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap`}>{c.location}</td>
                          <td className={`${S_TABLE_TD} text-slate-400 text-[11px]`}>{c.city}</td>
                          <td className={S_TABLE_TD}><span className={cadCallStatus(c.status)}>{c.status}</span></td>
                          <td className={`${S_TABLE_TD} font-mono text-[10px] ${c.units.length > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {c.units.length > 0 ? c.units.join(', ') : 'UNASSIGNED'}
                          </td>
                          <td className={`${S_TABLE_TD} font-mono text-[10px] text-slate-500`}>
                            {c.timestamp?.split(' ')[1] || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Call detail strip */}
          {selCall && (
            <div className="border-t border-border-faint px-4 py-3 bg-app-card/70 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-white mb-0.5">
                    {selCall.nature} <span className="text-slate-400 font-normal">· {selCall.location}, {selCall.city}</span>
                  </div>
                  <div className="text-[11.5px] text-slate-400 leading-[1.5]">{selCall.description}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Reporting Party: {selCall.reportingParty || '—'} · {selCall.timestamp}
                  </div>
                </div>
                {me && !selCall.units.includes(me.unitId) && (
                  <button className={`${sm(S_BTN_SUCCESS)} shrink-0 w-full sm:w-auto`} onClick={selfAssign}>
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
            <span className="ml-auto px-1.5 py-0.5 rounded-md bg-brand/15 text-brand-bright text-[11px] font-bold leading-none">{onDuty.length} ON</span>
          </div>
          <div className={S_PANEL_BODY}>
            {onDuty.map(o => {
              const assignedCall = o.callId ? calls.find(c => c.id === o.callId) : null;
              return (
                <div key={o.id} className={S_UNIT_ROW}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor(o.status) }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-1.5 items-center">
                      <span className={`${S_DATA} text-[10px]`}>{o.unitId}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="text-[11px] text-slate-200 overflow-hidden text-ellipsis whitespace-nowrap mt-0.5">
                      {o.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono mt-0.5">
                      <DeptTag code={o.deptShort} /> · {o.badge}
                    </div>
                    {assignedCall && (
                      <div className="text-[9px] text-brand-bright font-mono mt-0.5">
                        {assignedCall.id} · {assignedCall.nature}
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
