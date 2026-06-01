import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import {
  S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_CARD, cardHoverOn, cardHoverOff,
  S_SELECT, S_LABEL,
  S_BTN_PRIMARY, S_BTN_SECONDARY,
  xs, btnHoverOn, btnHoverOff, btnActiveOn,
  S_TABLE, S_TABLE_TH, S_TABLE_TD, trHoverOn, trHoverOff,
  BADGE,
  S_DETAIL_ROW, S_DETAIL_LABEL, S_DETAIL_VALUE, S_DETAIL_VALUE_MONO,
  S_DATA,
} from '../constants/styles';

function StatusBadge({ status }) {
  const key = { AVAILABLE:'available', BUSY:'busy', ENRT:'enrt', ARRVD:'arrvd', OFFDUTY:'offduty', UNAVAILABLE:'unavailable' }[status] || 'gray';
  return <span style={BADGE[key] || BADGE.gray}>{status}</span>;
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
    <div style={{ flex: 1, overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20, padding: '6px 10px',
        background: 'var(--n-bg-panel)', borderBottom: '1px solid var(--n-border)', flexShrink: 0,
      }}>
        {[
          { label: 'ON DUTY', value: onDuty, color: 'var(--n-text-data)' },
          { label: 'AVAILABLE', value: available, color: 'var(--st-av-text)' },
          { label: 'RESPONDING', value: responding, color: 'var(--st-enrt-text)' },
          { label: 'OFF DUTY', value: officers.length - onDuty, color: 'var(--n-text-muted)' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</span>
            <span style={{ fontSize: 8, color: 'var(--n-text-muted)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>{s.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <select style={{ ...S_SELECT, width: 110, fontSize: 10 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            {DEPTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <select style={{ ...S_SELECT, width: 110, fontSize: 10 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 0, flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Roster table */}
        <div style={{ ...S_PANEL, borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderBottom: 'none', borderRight: 'none' }}>
          <div style={S_PANEL_HEADER}>
            <div style={S_PANEL_TITLE}>Unit Roster</div>
            <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {filtered.length} RECORDS
            </span>
          </div>
          <div style={S_PANEL_BODY}>
            <table style={S_TABLE}>
              <thead>
                <tr>
                  <th style={S_TABLE_TH}>Status</th>
                  <th style={S_TABLE_TH}>Unit ID</th>
                  <th style={S_TABLE_TH}>Name</th>
                  <th style={S_TABLE_TH}>Badge</th>
                  <th style={S_TABLE_TH}>Department</th>
                  <th style={S_TABLE_TH}>Division</th>
                  <th style={S_TABLE_TH}>Rank</th>
                  <th style={S_TABLE_TH}>Assigned Call</th>
                  {isAdmin && <th style={S_TABLE_TH}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id}
                    style={{ background: selected === o.id ? 'var(--n-bg-selected)' : undefined, cursor: 'pointer' }}
                    onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}
                    onClick={() => setSelected(o.id)}>
                    <td style={S_TABLE_TD}><StatusBadge status={o.status} /></td>
                    <td style={S_TABLE_TD}><span style={S_DATA}>{o.unitId}</span></td>
                    <td style={{ ...S_TABLE_TD, fontWeight: 500 }}>{o.name}</td>
                    <td style={S_TABLE_TD}><span style={{ ...S_DATA, fontSize: 10 }}>{o.badge}</span></td>
                    <td style={S_TABLE_TD}>
                      <span style={{ ...BADGE.blue, fontSize: 9 }}>{o.deptShort}</span>
                    </td>
                    <td style={{ ...S_TABLE_TD, fontSize: 11, color: 'var(--n-text-dim)' }}>{o.subdivision}</td>
                    <td style={{ ...S_TABLE_TD, fontSize: 11, color: 'var(--n-text-dim)' }}>{o.rank}</td>
                    <td style={S_TABLE_TD}>
                      {o.callId
                        ? <span style={{ ...S_DATA, fontSize: 10 }}>{o.callId}</span>
                        : <span style={{ color: 'var(--n-text-muted)', fontSize: 10 }}>—</span>
                      }
                    </td>
                    {isAdmin && (
                      <td style={S_TABLE_TD} onClick={e => e.stopPropagation()}>
                        <select style={{ ...S_SELECT, width: 80, fontSize: 9, padding: '1px 4px' }}
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
        <div style={{ ...S_PANEL, borderRadius: 0, borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}>
          {!selOfficer ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--n-text-muted)', padding: 20 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              <span style={{ fontSize: 11, textAlign: 'center' }}>Select a unit to view details</span>
            </div>
          ) : (
            <>
              <div style={S_PANEL_HEADER}>
                <div style={S_PANEL_TITLE}>Unit Profile</div>
                <StatusBadge status={selOfficer.status} />
              </div>
              <div style={{ ...S_PANEL_BODY, padding: 12 }}>
                {/* Avatar / Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--n-bg-elevated)', border: '1px solid var(--n-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, color: 'var(--n-text-dim)', flexShrink: 0,
                  }}>
                    {selOfficer.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{selOfficer.name}</div>
                    <div style={{ ...S_DATA, fontSize: 10 }}>{selOfficer.badge}</div>
                  </div>
                </div>

                <div style={{ ...S_CARD, marginBottom: 8 }}
                  onMouseEnter={cardHoverOn} onMouseLeave={cardHoverOff}>
                  <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Assignment</div>
                  <div style={S_DETAIL_ROW}><span style={S_DETAIL_LABEL}>Unit ID</span><span style={S_DETAIL_VALUE_MONO}>{selOfficer.unitId}</span></div>
                  <div style={S_DETAIL_ROW}><span style={S_DETAIL_LABEL}>Department</span><span style={S_DETAIL_VALUE}>{selOfficer.deptShort}</span></div>
                  <div style={S_DETAIL_ROW}><span style={S_DETAIL_LABEL}>Division</span><span style={S_DETAIL_VALUE}>{selOfficer.subdivision}</span></div>
                  <div style={S_DETAIL_ROW}><span style={S_DETAIL_LABEL}>Rank</span><span style={S_DETAIL_VALUE}>{selOfficer.rank}</span></div>
                  <div style={S_DETAIL_ROW}><span style={S_DETAIL_LABEL}>Role</span><span style={S_DETAIL_VALUE}>{selOfficer.role}</span></div>
                </div>

                <div style={{ ...S_CARD, marginBottom: 8 }}
                  onMouseEnter={cardHoverOn} onMouseLeave={cardHoverOff}>
                  <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Current Status</div>
                  <div style={S_DETAIL_ROW}><span style={S_DETAIL_LABEL}>Status</span><StatusBadge status={selOfficer.status} /></div>
                  <div style={S_DETAIL_ROW}>
                    <span style={S_DETAIL_LABEL}>Assigned Call</span>
                    <span style={S_DETAIL_VALUE_MONO}>{selOfficer.callId || '—'}</span>
                  </div>
                  <div style={S_DETAIL_ROW}>
                    <span style={S_DETAIL_LABEL}>Location</span>
                    <span style={S_DETAIL_VALUE}>{selOfficer.location || '—'}</span>
                  </div>
                </div>

                {selCall && (
                  <div style={{ ...S_CARD, border: '1px solid var(--n-border-accent)' }}
                    onMouseEnter={cardHoverOn} onMouseLeave={cardHoverOff}>
                    <div style={{ fontSize: 9, color: 'var(--n-gold)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Active Call</div>
                    <div style={{ fontWeight: 600, marginBottom: 3 }}>{selCall.nature}</div>
                    <div style={{ fontSize: 11, color: 'var(--n-text-dim)' }}>{selCall.location}, {selCall.city}</div>
                    <div style={{ ...S_DATA, fontSize: 10, marginTop: 4 }}>{selCall.id}</div>
                  </div>
                )}

                {isAdmin && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ ...S_LABEL, marginBottom: 6 }}>Set Status</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {['AVAILABLE','BUSY','ENRT','ARRVD','UNAVAILABLE','OFFDUTY'].map(s => (
                        <button key={s}
                          style={selOfficer.status === s ? xs(S_BTN_PRIMARY) : xs(S_BTN_SECONDARY)}
                          onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn}
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
