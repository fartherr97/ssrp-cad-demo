import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import {
  S_PAGE, S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_BTN_PRIMARY, S_BTN_GHOST, S_BTN_SUCCESS,
  xs, sm, btnHoverOn, btnHoverOff,
  S_TABS, tabStyle,
  S_TABLE, S_TABLE_TH, S_TABLE_TD, trHoverOn, trHoverOff,
  BADGE, S_DATA, S_UNIT_ROW, unitRowHoverOn, unitRowHoverOff,
} from '../constants/styles';

function PriBadge({ p }) {
  const variants = { 1: BADGE.p1, 2: BADGE.p2, 3: BADGE.p3, 4: BADGE.p4 };
  return <span style={variants[p] || BADGE.gray}>P{p}</span>;
}

function StatusBadge({ status }) {
  const map = { AVAILABLE: BADGE.available, BUSY: BADGE.busy, ENRT: BADGE.enrt, ARRVD: BADGE.arrvd, OFFDUTY: BADGE.offduty, UNAVAILABLE: BADGE.unavailable };
  return <span style={map[status] || BADGE.gray}>{status}</span>;
}

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
  const callStatusBadge = s => s === 'PENDING' ? BADGE.orange : s === 'ACTIVE' ? BADGE.blue : s === 'ENRT' ? BADGE.yellow : BADGE.gray;

  return (
    <div style={{ ...S_PAGE, padding: 0, overflow: 'hidden', gap: 0 }}>
      {/* My status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px',
        background: 'var(--n-bg-panel)', borderBottom: '1px solid var(--n-border)', flexShrink: 0,
      }}>
        <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          MY STATUS:
        </span>
        {['AVAILABLE','BUSY','ENRT','ARRVD','UNAVAILABLE','OFFDUTY'].map(s => (
          <button key={s}
            style={{ ...xs(myStatus === s ? S_BTN_PRIMARY : S_BTN_GHOST), fontFamily: 'var(--font-mono)', letterSpacing: '0.3px' }}
           
            onClick={() => setMyStatus(s)}>{s}</button>
        ))}
        <div style={{ width: 1, height: 18, background: 'var(--n-border)', margin: '0 4px' }} />
        <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
          UNIT: <span style={{ color: 'var(--n-text-data)' }}>{me?.unitId || '—'}</span>
          {myCall && <> · CALL: <span style={{ color: 'var(--pr3-text)' }}>{myCall.id} — {myCall.nature}</span></>}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 8, flex: 1, minHeight: 0, padding: 8, overflow: 'hidden' }}>
        {/* Call table */}
        <div className={S_PANEL}>
          <div className={S_PANEL_HEADER}>
            <div className={S_PANEL_TITLE}>Active Calls</div>
            <div style={{ display: 'flex', gap: 1 }}>
              {TABS.map(t => (
                <button key={t}
                  style={{ ...tabStyle(filter === t), padding: '3px 10px', fontSize: 9 }}
                 
                  onClick={() => setFilter(t)}>
                  {t} {t === 'ALL' ? `(${activeCalls.length})` : `(${activeCalls.filter(c => c.status === t).length})`}
                </button>
              ))}
            </div>
          </div>
          <div className={S_PANEL_BODY}>
            {filtered.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--n-text-muted)', fontSize: 11 }}>No calls matching filter</div>
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
                      style={{
                        cursor: 'pointer',
                        transition: 'background 0.14s, transform 0.14s',
                        background: selectedCall === c.id ? 'var(--n-bg-selected)' : '',
                        boxShadow: selectedCall === c.id ? 'inset 2px 0 0 var(--acc-blue-hi)' : '',
                        borderLeft: c.priority === 1 ? '2px solid var(--pr1-text)' : '',
                      }}
                      onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}
                      onClick={() => setSelectedCall(c.id)}>
                      <td className={S_TABLE_TD}><span className={S_DATA}>{c.id}</span></td>
                      <td className={S_TABLE_TD}><PriBadge p={c.priority} /></td>
                      <td style={{ ...S_TABLE_TD, fontWeight: 500 }}>{c.nature}</td>
                      <td style={{ ...S_TABLE_TD, color: 'var(--n-text-dim)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.location}</td>
                      <td style={{ ...S_TABLE_TD, color: 'var(--n-text-dim)', fontSize: 11 }}>{c.city}</td>
                      <td className={S_TABLE_TD}><span style={callStatusBadge(c.status)}>{c.status}</span></td>
                      <td style={{ ...S_TABLE_TD, fontFamily: 'var(--font-mono)', fontSize: 10, color: c.units.length > 0 ? 'var(--n-text)' : 'var(--pr2-text)' }}>
                        {c.units.length > 0 ? c.units.join(', ') : 'UNASSIGNED'}
                      </td>
                      <td style={{ ...S_TABLE_TD, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--n-text-dim)' }}>
                        {c.timestamp?.split(' ')[1] || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Call detail strip */}
          {selCall && (
            <div style={{ borderTop: '1px solid var(--n-border)', padding: '8px 12px', background: 'var(--n-bg-card)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>
                    {selCall.nature} — <span style={{ color: 'var(--n-text-dim)', fontWeight: 400 }}>{selCall.location}, {selCall.city}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--n-text-dim)', lineHeight: 1.5 }}>{selCall.description}</div>
                  <div style={{ fontSize: 10, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                    Reporting Party: {selCall.reportingParty || '—'} · {selCall.timestamp}
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
            <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{onDuty.length} ON</span>
          </div>
          <div className={S_PANEL_BODY}>
            {onDuty.map(o => {
              const assignedCall = o.callId ? calls.find(c => c.id === o.callId) : null;
              return (
                <div key={o.id} className={S_UNIT_ROW}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    background: o.status === 'AVAILABLE' ? 'var(--st-av-text)' :
                      o.status === 'BUSY' ? 'var(--st-busy-text)' :
                      o.status === 'ENRT' ? 'var(--st-enrt-text)' :
                      o.status === 'ARRVD' ? 'var(--st-arv-text)' : 'var(--st-od-text)',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      <span style={{ ...S_DATA, fontSize: 10 }}>{o.unitId}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--n-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.name}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {o.deptShort} · {o.badge}
                    </div>
                    {assignedCall && (
                      <div style={{ fontSize: 9, color: 'var(--pr3-text)', fontFamily: 'var(--font-mono)' }}>
                        {assignedCall.id} — {assignedCall.nature}
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
