import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCAD } from '../store/cadStore';
import {
  S_PAGE, S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_CARD, S_INPUT, S_SELECT, S_LABEL, S_FIELD,
  S_BTN_PRIMARY, S_BTN_SECONDARY, S_BTN_DANGER, S_BTN_SUCCESS,
  sm, xs, btnHoverOn, btnHoverOff, btnActiveOn,
  S_TABS, tabStyle,
  S_TABLE, S_TABLE_TH, S_TABLE_TD, trHoverOn, trHoverOff,
  BADGE, S_DATA, S_DETAIL_ROW, S_DETAIL_LABEL,
} from '../constants/styles';

export default function AdminCenter() {
  const { state, dispatch } = useCAD();
  const navigate = useNavigate();
  const { officers, activeSessions, auditLog, departments, whitelistApps, customRecordTypes, currentUser } = state;
  const [tab, setTab] = useState('USERS');
  const [deptForm, setDeptForm] = useState({ name:'',short:'',abbreviation:'',color:'#1060a0',type:'LEO',badgePrefix:'',radioChannel:'' });
  const [showDeptForm, setShowDeptForm] = useState(false);

  const TABS = ['USERS', 'SESSIONS', 'AUDIT LOG', 'DEPARTMENTS', 'WHITELIST', 'SETTINGS'];

  const pendingApps = whitelistApps.filter(w => w.status === 'Pending');

  const addDept = () => {
    if (!deptForm.name) return;
    dispatch({ type: 'ADD_DEPARTMENT', payload: { ...deptForm, subdivisions: [] } });
    setDeptForm({ name:'',short:'',abbreviation:'',color:'#1060a0',type:'LEO',badgePrefix:'',radioChannel:'' });
    setShowDeptForm(false);
  };

  return (
    <div style={{ ...S_PAGE, padding: 0, overflow: 'hidden', gap: 0 }}>
      {/* Tabs */}
      <div style={S_TABS}>
        {TABS.map(t => (
          <button key={t} style={{ ...tabStyle(tab === t), fontSize: 10 }} onClick={() => setTab(t)}>
            {t}
            {t === 'WHITELIST' && pendingApps.length > 0 && (
              <span style={{ marginLeft: 4, fontSize: 9, background: 'var(--pr2-bg)', color: 'var(--pr2-text)', borderRadius: 2, padding: '0 3px', fontFamily: 'var(--font-mono)' }}>
                {pendingApps.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ ...S_PANEL_BODY, padding: 12, flex: 1 }}>

        {/* USERS */}
        {tab === 'USERS' && (
          <div style={S_PANEL}>
            <div style={S_PANEL_HEADER}>
              <div style={S_PANEL_TITLE}>Personnel Registry</div>
              <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{officers.length} MEMBERS</span>
            </div>
            <div style={S_PANEL_BODY}>
              <table style={S_TABLE}>
                <thead>
                  <tr>
                    <th style={S_TABLE_TH}>Name</th>
                    <th style={S_TABLE_TH}>Badge</th>
                    <th style={S_TABLE_TH}>Department</th>
                    <th style={S_TABLE_TH}>Rank</th>
                    <th style={S_TABLE_TH}>Role</th>
                    <th style={S_TABLE_TH}>Status</th>
                    <th style={S_TABLE_TH}>Discord</th>
                    <th style={S_TABLE_TH}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map(o => (
                    <tr key={o.id} onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}>
                      <td style={{ ...S_TABLE_TD, fontWeight: 500 }}>{o.name}</td>
                      <td style={S_TABLE_TD}><span style={{ ...S_DATA, fontSize: 10 }}>{o.badge}</span></td>
                      <td style={S_TABLE_TD}><span style={{ ...BADGE.blue, fontSize: 9 }}>{o.deptShort}</span></td>
                      <td style={{ ...S_TABLE_TD, fontSize: 11, color: 'var(--n-text-dim)' }}>{o.rank}</td>
                      <td style={S_TABLE_TD}>
                        <span style={{ ...( o.role === 'admin' ? BADGE.gold : o.role === 'dispatch' ? BADGE.cyan : BADGE.gray ), fontSize: 9 }}>
                          {o.role}
                        </span>
                      </td>
                      <td style={S_TABLE_TD}>
                        <span style={{ ...( o.status === 'OFFDUTY' ? BADGE.offduty : BADGE.available ), fontSize: 9 }}>
                          {o.status === 'OFFDUTY' ? 'OFF DUTY' : 'ON DUTY'}
                        </span>
                      </td>
                      <td style={S_TABLE_TD}><span style={{ ...S_DATA, fontSize: 9 }}>{o.discordId}</span></td>
                      <td style={S_TABLE_TD}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button style={xs(S_BTN_SECONDARY)} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn}>Edit</button>
                          <button style={xs(S_BTN_DANGER)} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={() => navigate('/bans')}>Ban</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SESSIONS */}
        {tab === 'SESSIONS' && (
          <div style={S_PANEL}>
            <div style={S_PANEL_HEADER}>
              <div style={S_PANEL_TITLE}>Active Sessions</div>
              <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{activeSessions.length} ONLINE</span>
            </div>
            <div style={S_PANEL_BODY}>
              <table style={S_TABLE}>
                <thead>
                  <tr>
                    <th style={S_TABLE_TH}>Name</th>
                    <th style={S_TABLE_TH}>Role</th>
                    <th style={S_TABLE_TH}>Login Time</th>
                    <th style={S_TABLE_TH}>Last Active</th>
                    <th style={S_TABLE_TH}>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSessions.map(s => (
                    <tr key={s.userId} onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}>
                      <td style={{ ...S_TABLE_TD, fontWeight: 500 }}>{s.name}</td>
                      <td style={S_TABLE_TD}><span style={{ ...( s.role === 'Admin' ? BADGE.gold : BADGE.gray ), fontSize: 9 }}>{s.role}</span></td>
                      <td style={S_TABLE_TD}><span style={{ ...S_DATA, fontSize: 10 }}>{s.loginTime}</span></td>
                      <td style={S_TABLE_TD}><span style={{ ...S_DATA, fontSize: 10 }}>{s.lastActive}</span></td>
                      <td style={S_TABLE_TD}><span style={{ ...S_DATA, fontSize: 10 }}>{s.ip}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AUDIT LOG */}
        {tab === 'AUDIT LOG' && (
          <div style={S_PANEL}>
            <div style={S_PANEL_HEADER}>
              <div style={S_PANEL_TITLE}>System Audit Log</div>
              <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{auditLog.length} ENTRIES</span>
            </div>
            <div style={S_PANEL_BODY}>
              <table style={S_TABLE}>
                <thead>
                  <tr>
                    <th style={S_TABLE_TH}>Timestamp</th>
                    <th style={S_TABLE_TH}>User</th>
                    <th style={S_TABLE_TH}>Module</th>
                    <th style={S_TABLE_TH}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map(e => (
                    <tr key={e.id} onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}>
                      <td style={S_TABLE_TD}><span style={{ ...S_DATA, fontSize: 10 }}>{e.timestamp}</span></td>
                      <td style={{ ...S_TABLE_TD, fontSize: 11 }}>{e.user}</td>
                      <td style={S_TABLE_TD}><span style={{ ...BADGE.gray, fontSize: 9 }}>{e.module}</span></td>
                      <td style={{ ...S_TABLE_TD, fontSize: 11, color: 'var(--n-text-dim)' }}>{e.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DEPARTMENTS */}
        {tab === 'DEPARTMENTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button style={sm(S_BTN_PRIMARY)} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={() => setShowDeptForm(!showDeptForm)}>
                {showDeptForm ? '✕ Cancel' : '+ Add Department'}
              </button>
            </div>

            {showDeptForm && (
              <div style={S_CARD}>
                <div style={{ fontSize: 9, color: 'var(--n-gold)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>New Department</div>
                <div className="n-grid-2" style={{ gap: 8, marginBottom: 8 }}>
                  <div style={S_FIELD}><label style={S_LABEL}>Full Name</label><input style={S_INPUT} value={deptForm.name} onChange={e => setDeptForm(p=>({...p,name:e.target.value}))} /></div>
                  <div style={S_FIELD}><label style={S_LABEL}>Short Name</label><input style={S_INPUT} value={deptForm.short} onChange={e => setDeptForm(p=>({...p,short:e.target.value}))} /></div>
                  <div style={S_FIELD}><label style={S_LABEL}>Abbreviation</label><input style={S_INPUT} value={deptForm.abbreviation} onChange={e => setDeptForm(p=>({...p,abbreviation:e.target.value}))} /></div>
                  <div style={S_FIELD}><label style={S_LABEL}>Type</label><select style={S_SELECT} value={deptForm.type} onChange={e => setDeptForm(p=>({...p,type:e.target.value}))}><option value="LEO">LEO</option><option value="Fire">Fire</option><option value="EMS">EMS</option><option value="Dispatch">Dispatch</option></select></div>
                  <div style={S_FIELD}><label style={S_LABEL}>Badge Prefix</label><input style={S_INPUT} value={deptForm.badgePrefix} onChange={e => setDeptForm(p=>({...p,badgePrefix:e.target.value}))} /></div>
                  <div style={S_FIELD}><label style={S_LABEL}>Radio Channel</label><input style={S_INPUT} value={deptForm.radioChannel} onChange={e => setDeptForm(p=>({...p,radioChannel:e.target.value}))} /></div>
                  <div style={S_FIELD}><label style={S_LABEL}>Color</label><input type="color" value={deptForm.color} onChange={e => setDeptForm(p=>({...p,color:e.target.value}))} style={{ width: '100%', height: 32, borderRadius: 3, border: '1px solid var(--n-border)', background: 'none', cursor: 'pointer' }} /></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                  <button style={sm(S_BTN_PRIMARY)} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={addDept}>Create Department</button>
                </div>
              </div>
            )}

            <div style={S_PANEL}>
              <div style={S_PANEL_HEADER}>
                <div style={S_PANEL_TITLE}>Departments</div>
                <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{departments.length}</span>
              </div>
              <div style={S_PANEL_BODY}>
                <table style={S_TABLE}>
                  <thead>
                    <tr><th style={S_TABLE_TH}>Name</th><th style={S_TABLE_TH}>Abbrev</th><th style={S_TABLE_TH}>Type</th><th style={S_TABLE_TH}>Badge Prefix</th><th style={S_TABLE_TH}>Radio</th><th style={S_TABLE_TH}>Subdivisions</th></tr>
                  </thead>
                  <tbody>
                    {departments.map(d => (
                      <tr key={d.id} onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}>
                        <td style={{ ...S_TABLE_TD, fontWeight: 500 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                            {d.name}
                          </div>
                        </td>
                        <td style={S_TABLE_TD}><span style={S_DATA}>{d.abbreviation}</span></td>
                        <td style={S_TABLE_TD}><span style={{ ...( d.type === 'LEO' ? BADGE.blue : d.type === 'Fire' ? BADGE.fire : BADGE.green ), fontSize: 9 }}>{d.type}</span></td>
                        <td style={S_TABLE_TD}><span style={{ ...S_DATA, fontSize: 10 }}>{d.badgePrefix}</span></td>
                        <td style={S_TABLE_TD}><span style={{ ...S_DATA, fontSize: 10 }}>{d.radioChannel}</span></td>
                        <td style={{ ...S_TABLE_TD, fontSize: 10, color: 'var(--n-text-dim)' }}>{d.subdivisions?.join(', ') || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* WHITELIST */}
        {tab === 'WHITELIST' && (
          <div style={S_PANEL}>
            <div style={S_PANEL_HEADER}>
              <div style={S_PANEL_TITLE}>Whitelist Applications</div>
              <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
                {pendingApps.length} PENDING
              </span>
            </div>
            <div style={S_PANEL_BODY}>
              <table style={S_TABLE}>
                <thead>
                  <tr><th style={S_TABLE_TH}>Name</th><th style={S_TABLE_TH}>Discord ID</th><th style={S_TABLE_TH}>Applied</th><th style={S_TABLE_TH}>Status</th><th style={S_TABLE_TH}>Notes</th><th style={S_TABLE_TH}>Actions</th></tr>
                </thead>
                <tbody>
                  {whitelistApps.map(w => (
                    <tr key={w.id} onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}>
                      <td style={{ ...S_TABLE_TD, fontWeight: 500 }}>{w.name}</td>
                      <td style={S_TABLE_TD}><span style={{ ...S_DATA, fontSize: 10 }}>{w.discordId}</span></td>
                      <td style={S_TABLE_TD}><span style={{ ...S_DATA, fontSize: 10 }}>{w.appliedDate}</span></td>
                      <td style={S_TABLE_TD}>
                        <span style={w.status === 'Approved' ? BADGE.green : w.status === 'Pending' ? BADGE.orange : BADGE.red}>
                          {w.status}
                        </span>
                      </td>
                      <td style={{ ...S_TABLE_TD, fontSize: 11, color: 'var(--n-text-dim)' }}>{w.notes || '—'}</td>
                      <td style={S_TABLE_TD}>
                        {w.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button style={xs(S_BTN_SUCCESS)} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={() => dispatch({ type: 'APPROVE_WHITELIST', payload: w.id })}>Approve</button>
                            <button style={xs(S_BTN_DANGER)} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={() => dispatch({ type: 'DENY_WHITELIST', payload: w.id })}>Deny</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'SETTINGS' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={S_CARD}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 10, color: 'var(--n-gold)' }}>Community Configuration</div>
              <div style={{ ...S_FIELD, marginBottom: 8 }}><label style={S_LABEL}>Community Name</label><input style={S_INPUT} defaultValue="Sunshine State RP" /></div>
              <div style={{ ...S_FIELD, marginBottom: 8 }}><label style={S_LABEL}>Dispatch Channel</label><input style={S_INPUT} defaultValue="Hillsborough Main" /></div>
              <div style={{ ...S_FIELD, marginBottom: 8 }}><label style={S_LABEL}>CAD System Name</label><input style={S_INPUT} defaultValue="SSRP NEXUS CAD v2.0" /></div>
              <button style={sm(S_BTN_PRIMARY)} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn}>Save Configuration</button>
            </div>
            <div style={S_CARD}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 10, color: 'var(--n-gold)' }}>System Statistics</div>
              {[
                { label: 'Total Members', value: officers.length },
                { label: 'Total Departments', value: departments.length },
                { label: 'Active Sessions', value: activeSessions.length },
                { label: 'Pending Applications', value: pendingApps.length },
                { label: 'Audit Log Entries', value: auditLog.length },
              ].map(s => (
                <div key={s.label} style={S_DETAIL_ROW}>
                  <span style={S_DETAIL_LABEL}>{s.label}</span>
                  <span style={{ ...S_DATA, fontSize: 12 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
