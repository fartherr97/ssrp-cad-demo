import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';
import { useResponsive } from '../hooks/useResponsive';

const TABS = ['Users', 'Active Sessions', 'Audit Log', 'Whitelist', 'Settings'];

export default function AdminPanel() {
  const { state, dispatch } = useCAD();
  const { officers, activeSessions, auditLog, whitelistApps, departments } = state;
  const [tab, setTab] = useState('Users');
  const [communityName, setCommunityName] = useState('Sunshine State Roleplay Community');
  const [logoUrl, setLogoUrl] = useState('');
  const [accentColor, setAccentColor] = useState('#1a3a6b');
  const { isMobile } = useResponsive();

  return (
    <div style={{ padding: '14px', fontFamily: 'Ubuntu, sans-serif' }}>
      {/* Page header */}
      <div style={{ background: '#0b0d14', border: '1px solid #1e2533', borderBottom: 'none', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 700, letterSpacing: '2px' }}>ADMIN PANEL</span>
        <span style={{ color: '#374151', fontSize: '11px' }}>Restricted &bull; Admin Access Only</span>
      </div>
      <div style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '14px', marginBottom: '14px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
          {[
            { label: 'Total Officers', val: officers.length, color: '#3b82f6' },
            { label: 'Active Sessions', val: activeSessions.length, color: '#22c55e' },
            { label: 'Pending Whitelist', val: whitelistApps.filter(w => w.status === 'Pending').length, color: '#fbbf24' },
            { label: 'Departments', val: departments.length, color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{ background: '#090b10', border: `1px solid ${s.color}25`, padding: '10px 14px' }}>
              <div style={{ color: s.color, fontSize: '22px', fontWeight: 700 }}>{s.val}</div>
              <div style={{ color: '#4b5563', fontSize: '11px', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tab-scroll" style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #1f2937', marginBottom: '14px' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? '#0f172a' : 'transparent', border: tab === t ? '1px solid #fbbf24' : '1px solid transparent', borderBottom: 'none', color: tab === t ? '#fbbf24' : '#4b5563', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif' }}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Users' && (
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <THead cols={['Name','Badge','Discord ID','Role','Department','Rank','Status','Actions']} gold />
              <tbody>
                {officers.map((o, i) => (
                  <tr key={o.id} style={{ background: i % 2 === 0 ? '#0d1117' : '#111218' }}>
                    <td style={{ padding: '7px 10px', color: '#d1d5db', fontWeight: 600 }}>{o.name}</td>
                    <td style={{ padding: '7px 10px', color: '#60a5fa' }}>{o.badge}</td>
                    <td style={{ padding: '7px 10px', color: '#374151', fontSize: '11px' }}>{o.discordId}</td>
                    <td style={{ padding: '7px 10px' }}>
                      <span style={{ color: o.role === 'admin' ? '#fbbf24' : '#9ca3af', fontWeight: o.role === 'admin' ? 700 : 400 }}>{o.role}</span>
                    </td>
                    <td style={{ padding: '7px 10px', color: '#9ca3af' }}>{o.deptShort}</td>
                    <td style={{ padding: '7px 10px', color: '#9ca3af' }}>{o.rank}</td>
                    <td style={{ padding: '7px 10px' }}><StatusBadge status={o.status} /></td>
                    <td style={{ padding: '7px 10px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button style={aBtn('#0c1a2e','#3b82f6')}>Edit</button>
                        <button style={aBtn('#450a0a','#ef4444')}>Ban</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'Active Sessions' && (
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <THead cols={['User','Role','Login Time','Last Active','IP']} gold />
              <tbody>
                {activeSessions.map((s, i) => (
                  <tr key={s.userId} style={{ background: i % 2 === 0 ? '#0d1117' : '#111218' }}>
                    <td style={{ padding: '7px 10px', color: '#d1d5db' }}>{s.name}</td>
                    <td style={{ padding: '7px 10px', color: '#9ca3af' }}>{s.role}</td>
                    <td style={{ padding: '7px 10px', color: '#374151' }}>{s.loginTime}</td>
                    <td style={{ padding: '7px 10px', color: '#22c55e' }}>{s.lastActive}</td>
                    <td style={{ padding: '7px 10px', color: '#374151' }}>{s.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'Audit Log' && (
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <THead cols={['Timestamp','User','Action','Module']} gold />
              <tbody>
                {auditLog.map((entry, i) => (
                  <tr key={entry.id} style={{ background: i % 2 === 0 ? '#0d1117' : '#111218' }}>
                    <td style={{ padding: '7px 10px', color: '#374151', fontSize: '11px', whiteSpace: 'nowrap' }}>{entry.timestamp}</td>
                    <td style={{ padding: '7px 10px', color: '#9ca3af' }}>{entry.user}</td>
                    <td style={{ padding: '7px 10px', color: '#d1d5db' }}>{entry.action}</td>
                    <td style={{ padding: '7px 10px' }}>
                      <span style={{ background: '#0f172a', color: '#3b82f6', border: '1px solid #1e2d4a', padding: '2px 7px', fontSize: '10px', fontWeight: 600 }}>{entry.module}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'Whitelist' && (
          <div>
            <div style={{ color: '#fbbf24', fontSize: '12px', letterSpacing: '1px', marginBottom: '10px' }}>PENDING APPLICATIONS: {whitelistApps.filter(w => w.status === 'Pending').length}</div>
            <div className="table-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <THead cols={['Discord ID','Name','Applied','Status','Notes','Actions']} gold />
                <tbody>
                  {whitelistApps.map((app, i) => (
                    <tr key={app.id} style={{ background: i % 2 === 0 ? '#0d1117' : '#111218' }}>
                      <td style={{ padding: '7px 10px', color: '#60a5fa' }}>{app.discordId}</td>
                      <td style={{ padding: '7px 10px', color: '#d1d5db' }}>{app.name}</td>
                      <td style={{ padding: '7px 10px', color: '#374151' }}>{app.appliedDate}</td>
                      <td style={{ padding: '7px 10px' }}><StatusBadge status={app.status} /></td>
                      <td style={{ padding: '7px 10px', color: '#4b5563', fontSize: '11px' }}>{app.notes || '—'}</td>
                      <td style={{ padding: '7px 10px' }}>
                        {app.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => dispatch({ type: 'APPROVE_WHITELIST', payload: app.id })} style={aBtn('#052e16','#22c55e')}>Approve</button>
                            <button onClick={() => dispatch({ type: 'DENY_WHITELIST', payload: app.id })} style={aBtn('#450a0a','#ef4444')}>Deny</button>
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

        {tab === 'Settings' && (
          <div style={{ maxWidth: '480px' }}>
            <div style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '2px' }}>COMMUNITY SETTINGS</div>
              {[['Community Name', communityName, setCommunityName], ['Logo URL', logoUrl, setLogoUrl]].map(([l, v, s]) => (
                <div key={l}>
                  <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>{l.toUpperCase()}</label>
                  <input value={v} onChange={e => s(e.target.value)} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>CAD ACCENT COLOR</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ background: '#090b10', border: '1px solid #1e2533', padding: '4px', width: '50px', height: '34px', cursor: 'pointer' }} />
                  <span style={{ color: '#9ca3af', fontSize: '13px', fontFamily: 'Ubuntu, sans-serif' }}>{accentColor}</span>
                </div>
              </div>
              <button style={{ background: '#0c1a2e', border: '1px solid #3b82f6', color: '#3b82f6', padding: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif', letterSpacing: '1px', marginTop: '4px' }}>
                SAVE SETTINGS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function THead({ cols, gold }) {
  return (
    <thead>
      <tr style={{ background: '#0b0d14' }}>
        {cols.map(h => (
          <th key={h} style={{ padding: '7px 10px', textAlign: 'left', color: gold ? '#ca8a04' : '#6b7280', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', borderBottom: '1px solid #1e2533', whiteSpace: 'nowrap' }}>{h}</th>
        ))}
      </tr>
    </thead>
  );
}

const aBtn = (bg, c) => ({ background: bg, border: `1px solid ${c}`, color: c, padding: '3px 8px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif', fontWeight: 600 });
const inputStyle = { width: '100%', background: '#090b10', border: '1px solid #1e2533', color: '#d1d5db', padding: '7px 10px', fontSize: '13px', fontFamily: 'Ubuntu, sans-serif', boxSizing: 'border-box' };
