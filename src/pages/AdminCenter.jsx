import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCAD } from '../store/cadStore';

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
    <div className="n-page" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
      {/* Tabs */}
      <div className="n-tabs">
        {TABS.map(t => (
          <button key={t} className={`n-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)} style={{ fontSize: 10 }}>
            {t}
            {t === 'WHITELIST' && pendingApps.length > 0 && (
              <span style={{ marginLeft: 4, fontSize: 9, background: 'var(--pr2-bg)', color: 'var(--pr2-text)', borderRadius: 2, padding: '0 3px', fontFamily: 'var(--font-mono)' }}>
                {pendingApps.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="n-panel-body scroll-y" style={{ padding: 12, flex: 1 }}>

        {/* USERS */}
        {tab === 'USERS' && (
          <div className="n-panel">
            <div className="n-panel-header">
              <div className="n-panel-title">Personnel Registry</div>
              <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{officers.length} MEMBERS</span>
            </div>
            <div className="n-panel-body">
              <table className="n-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Badge</th>
                    <th>Department</th>
                    <th>Rank</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Discord</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map(o => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 500 }}>{o.name}</td>
                      <td><span className="n-data" style={{ fontSize: 10 }}>{o.badge}</span></td>
                      <td><span className="n-badge badge-blue" style={{ fontSize: 9 }}>{o.deptShort}</span></td>
                      <td style={{ fontSize: 11, color: 'var(--n-text-dim)' }}>{o.rank}</td>
                      <td>
                        <span className={`n-badge ${o.role === 'admin' ? 'badge-gold' : o.role === 'dispatch' ? 'badge-cyan' : 'badge-gray'}`} style={{ fontSize: 9 }}>
                          {o.role}
                        </span>
                      </td>
                      <td>
                        <span className={`n-badge badge-${o.status === 'OFFDUTY' ? 'offduty' : 'available'}`} style={{ fontSize: 9 }}>
                          {o.status === 'OFFDUTY' ? 'OFF DUTY' : 'ON DUTY'}
                        </span>
                      </td>
                      <td><span className="n-data" style={{ fontSize: 9 }}>{o.discordId}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="n-btn n-btn-secondary n-btn-xs">Edit</button>
                          <button className="n-btn n-btn-danger n-btn-xs" onClick={() => navigate('/bans')}>Ban</button>
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
          <div className="n-panel">
            <div className="n-panel-header">
              <div className="n-panel-title">Active Sessions</div>
              <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{activeSessions.length} ONLINE</span>
            </div>
            <div className="n-panel-body">
              <table className="n-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Login Time</th>
                    <th>Last Active</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSessions.map(s => (
                    <tr key={s.userId}>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td><span className={`n-badge ${s.role === 'Admin' ? 'badge-gold' : 'badge-gray'}`} style={{ fontSize: 9 }}>{s.role}</span></td>
                      <td><span className="n-data" style={{ fontSize: 10 }}>{s.loginTime}</span></td>
                      <td><span className="n-data" style={{ fontSize: 10 }}>{s.lastActive}</span></td>
                      <td><span className="n-data" style={{ fontSize: 10 }}>{s.ip}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AUDIT LOG */}
        {tab === 'AUDIT LOG' && (
          <div className="n-panel">
            <div className="n-panel-header">
              <div className="n-panel-title">System Audit Log</div>
              <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{auditLog.length} ENTRIES</span>
            </div>
            <div className="n-panel-body">
              <table className="n-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Module</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map(e => (
                    <tr key={e.id}>
                      <td><span className="n-data" style={{ fontSize: 10 }}>{e.timestamp}</span></td>
                      <td style={{ fontSize: 11 }}>{e.user}</td>
                      <td><span className="n-badge badge-gray" style={{ fontSize: 9 }}>{e.module}</span></td>
                      <td style={{ fontSize: 11, color: 'var(--n-text-dim)' }}>{e.action}</td>
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
              <button className="n-btn n-btn-primary n-btn-sm" onClick={() => setShowDeptForm(!showDeptForm)}>
                {showDeptForm ? '✕ Cancel' : '+ Add Department'}
              </button>
            </div>

            {showDeptForm && (
              <div className="n-card">
                <div style={{ fontSize: 9, color: 'var(--n-gold)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>New Department</div>
                <div className="n-grid-2" style={{ gap: 8, marginBottom: 8 }}>
                  <div className="n-field"><label className="n-label">Full Name</label><input className="n-input" value={deptForm.name} onChange={e => setDeptForm(p=>({...p,name:e.target.value}))} /></div>
                  <div className="n-field"><label className="n-label">Short Name</label><input className="n-input" value={deptForm.short} onChange={e => setDeptForm(p=>({...p,short:e.target.value}))} /></div>
                  <div className="n-field"><label className="n-label">Abbreviation</label><input className="n-input" value={deptForm.abbreviation} onChange={e => setDeptForm(p=>({...p,abbreviation:e.target.value}))} /></div>
                  <div className="n-field"><label className="n-label">Type</label><select className="n-select" value={deptForm.type} onChange={e => setDeptForm(p=>({...p,type:e.target.value}))}><option value="LEO">LEO</option><option value="Fire">Fire</option><option value="EMS">EMS</option><option value="Dispatch">Dispatch</option></select></div>
                  <div className="n-field"><label className="n-label">Badge Prefix</label><input className="n-input" value={deptForm.badgePrefix} onChange={e => setDeptForm(p=>({...p,badgePrefix:e.target.value}))} /></div>
                  <div className="n-field"><label className="n-label">Radio Channel</label><input className="n-input" value={deptForm.radioChannel} onChange={e => setDeptForm(p=>({...p,radioChannel:e.target.value}))} /></div>
                  <div className="n-field"><label className="n-label">Color</label><input type="color" value={deptForm.color} onChange={e => setDeptForm(p=>({...p,color:e.target.value}))} style={{ width: '100%', height: 32, borderRadius: 3, border: '1px solid var(--n-border)', background: 'none', cursor: 'pointer' }} /></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                  <button className="n-btn n-btn-primary n-btn-sm" onClick={addDept}>Create Department</button>
                </div>
              </div>
            )}

            <div className="n-panel">
              <div className="n-panel-header">
                <div className="n-panel-title">Departments</div>
                <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{departments.length}</span>
              </div>
              <div className="n-panel-body">
                <table className="n-table">
                  <thead>
                    <tr><th>Name</th><th>Abbrev</th><th>Type</th><th>Badge Prefix</th><th>Radio</th><th>Subdivisions</th></tr>
                  </thead>
                  <tbody>
                    {departments.map(d => (
                      <tr key={d.id}>
                        <td style={{ fontWeight: 500 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                            {d.name}
                          </div>
                        </td>
                        <td><span className="n-data">{d.abbreviation}</span></td>
                        <td><span className={`n-badge ${d.type === 'LEO' ? 'badge-blue' : d.type === 'Fire' ? 'badge-fire' : 'badge-green'}`} style={{ fontSize: 9 }}>{d.type}</span></td>
                        <td><span className="n-data" style={{ fontSize: 10 }}>{d.badgePrefix}</span></td>
                        <td><span className="n-data" style={{ fontSize: 10 }}>{d.radioChannel}</span></td>
                        <td style={{ fontSize: 10, color: 'var(--n-text-dim)' }}>{d.subdivisions?.join(', ') || '—'}</td>
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
          <div className="n-panel">
            <div className="n-panel-header">
              <div className="n-panel-title">Whitelist Applications</div>
              <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
                {pendingApps.length} PENDING
              </span>
            </div>
            <div className="n-panel-body">
              <table className="n-table">
                <thead>
                  <tr><th>Name</th><th>Discord ID</th><th>Applied</th><th>Status</th><th>Notes</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {whitelistApps.map(w => (
                    <tr key={w.id}>
                      <td style={{ fontWeight: 500 }}>{w.name}</td>
                      <td><span className="n-data" style={{ fontSize: 10 }}>{w.discordId}</span></td>
                      <td><span className="n-data" style={{ fontSize: 10 }}>{w.appliedDate}</span></td>
                      <td>
                        <span className={`n-badge ${w.status === 'Approved' ? 'badge-green' : w.status === 'Pending' ? 'badge-orange' : 'badge-red'}`}>
                          {w.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 11, color: 'var(--n-text-dim)' }}>{w.notes || '—'}</td>
                      <td>
                        {w.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="n-btn n-btn-success n-btn-xs" onClick={() => dispatch({ type: 'APPROVE_WHITELIST', payload: w.id })}>Approve</button>
                            <button className="n-btn n-btn-danger n-btn-xs" onClick={() => dispatch({ type: 'DENY_WHITELIST', payload: w.id })}>Deny</button>
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
            <div className="n-card">
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 10, color: 'var(--n-gold)' }}>Community Configuration</div>
              <div className="n-field" style={{ marginBottom: 8 }}><label className="n-label">Community Name</label><input className="n-input" defaultValue="Sunshine State RP" /></div>
              <div className="n-field" style={{ marginBottom: 8 }}><label className="n-label">Dispatch Channel</label><input className="n-input" defaultValue="Hillsborough Main" /></div>
              <div className="n-field" style={{ marginBottom: 8 }}><label className="n-label">CAD System Name</label><input className="n-input" defaultValue="SSRP NEXUS CAD v2.0" /></div>
              <button className="n-btn n-btn-primary n-btn-sm">Save Configuration</button>
            </div>
            <div className="n-card">
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 10, color: 'var(--n-gold)' }}>System Statistics</div>
              {[
                { label: 'Total Members', value: officers.length },
                { label: 'Total Departments', value: departments.length },
                { label: 'Active Sessions', value: activeSessions.length },
                { label: 'Pending Applications', value: pendingApps.length },
                { label: 'Audit Log Entries', value: auditLog.length },
              ].map(s => (
                <div key={s.label} className="detail-row">
                  <span className="detail-label">{s.label}</span>
                  <span className="n-data" style={{ fontSize: 12 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
