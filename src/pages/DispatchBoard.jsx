import { useState } from 'react';
import { useCAD } from '../store/cadStore';

function PriBadge({ p }) {
  const cls = ['', 'badge-p1', 'badge-p2', 'badge-p3', 'badge-p4'][p] || 'badge-gray';
  return <span className={`n-badge ${cls}`}>P{p}</span>;
}

function StatusBadge({ status }) {
  const map = {
    AVAILABLE: 'badge-available', BUSY: 'badge-busy',
    ENRT: 'badge-enrt', ARRVD: 'badge-arrvd',
    OFFDUTY: 'badge-offduty', UNAVAILABLE: 'badge-unavailable',
  };
  return <span className={`n-badge ${map[status] || 'badge-gray'}`}>{status}</span>;
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

  return (
    <div className="n-page" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
      {/* My status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px',
        background: 'var(--n-bg-panel)', borderBottom: '1px solid var(--n-border)', flexShrink: 0,
      }}>
        <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          MY STATUS:
        </span>
        {['AVAILABLE','BUSY','ENRT','ARRVD','UNAVAILABLE','OFFDUTY'].map(s => {
          const map = { AVAILABLE:'badge-available',BUSY:'badge-busy',ENRT:'badge-enrt',ARRVD:'badge-arrvd',UNAVAILABLE:'badge-unavailable',OFFDUTY:'badge-offduty' };
          return (
            <button
              key={s}
              className={`n-btn n-btn-xs ${myStatus === s ? 'n-btn-primary' : 'n-btn-ghost'}`}
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.3px' }}
              onClick={() => setMyStatus(s)}
            >{s}</button>
          );
        })}
        <div style={{ width: 1, height: 18, background: 'var(--n-border)', margin: '0 4px' }} />
        <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
          UNIT: <span style={{ color: 'var(--n-text-data)' }}>{me?.unitId || '—'}</span>
          {myCall && <> · CALL: <span style={{ color: 'var(--pr3-text)' }}>{myCall.id} — {myCall.nature}</span></>}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 8, flex: 1, minHeight: 0, padding: 8, overflow: 'hidden' }}>
        {/* Call table */}
        <div className="n-panel">
          <div className="n-panel-header">
            <div className="n-panel-title">Active Calls</div>
            <div style={{ display: 'flex', gap: 1 }}>
              {TABS.map(t => (
                <button key={t} className={`n-tab${filter === t ? ' active' : ''}`}
                  style={{ padding: '3px 10px', fontSize: 9 }}
                  onClick={() => setFilter(t)}>
                  {t} {t === 'ALL' ? `(${activeCalls.length})` : `(${activeCalls.filter(c => c.status === t).length})`}
                </button>
              ))}
            </div>
          </div>
          <div className="n-panel-body scroll-y">
            {filtered.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--n-text-muted)', fontSize: 11 }}>No calls matching filter</div>
            ) : (
              <table className="n-table">
                <thead>
                  <tr>
                    <th>Call #</th>
                    <th>Pri</th>
                    <th>Nature</th>
                    <th>Location</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Units</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.sort((a,b) => a.priority - b.priority).map(c => (
                    <tr key={c.id}
                      className={`${selectedCall === c.id ? 'selected' : ''} ${c.priority === 1 ? 'row-p1' : ''}`}
                      onClick={() => setSelectedCall(c.id)}>
                      <td><span className="n-data">{c.id}</span></td>
                      <td><PriBadge p={c.priority} /></td>
                      <td style={{ fontWeight: 500 }}>{c.nature}</td>
                      <td style={{ color: 'var(--n-text-dim)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.location}</td>
                      <td style={{ color: 'var(--n-text-dim)', fontSize: 11 }}>{c.city}</td>
                      <td>
                        <span className={`n-badge badge-${c.status === 'PENDING' ? 'orange' : c.status === 'ACTIVE' ? 'blue' : c.status === 'ENRT' ? 'yellow' : 'gray'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: c.units.length > 0 ? 'var(--n-text)' : 'var(--pr2-text)' }}>
                        {c.units.length > 0 ? c.units.join(', ') : 'UNASSIGNED'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--n-text-dim)' }}>
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
            <div style={{
              borderTop: '1px solid var(--n-border)', padding: '8px 12px',
              background: 'var(--n-bg-card)', flexShrink: 0,
            }}>
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
                  <button className="n-btn n-btn-success n-btn-sm" onClick={selfAssign}>
                    Self-Assign
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Unit Roster */}
        <div className="n-panel">
          <div className="n-panel-header">
            <div className="n-panel-title">Unit Roster</div>
            <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{onDuty.length} ON</span>
          </div>
          <div className="n-panel-body scroll-y">
            {onDuty.map(o => {
              const assignedCall = o.callId ? calls.find(c => c.id === o.callId) : null;
              return (
                <div key={o.id} className="unit-row">
                  <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    background: o.status === 'AVAILABLE' ? 'var(--st-av-text)' :
                      o.status === 'BUSY' ? 'var(--st-busy-text)' :
                      o.status === 'ENRT' ? 'var(--st-enrt-text)' :
                      o.status === 'ARRVD' ? 'var(--st-arv-text)' : 'var(--st-od-text)',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      <span className="n-data" style={{ fontSize: 10 }}>{o.unitId}</span>
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
