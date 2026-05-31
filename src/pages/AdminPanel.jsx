import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';

const TABS = ['Users', 'Active Sessions', 'Audit Log', 'Whitelist', 'Settings'];

export default function AdminPanel() {
  const { state, dispatch } = useCAD();
  const { officers, activeSessions, auditLog, whitelistApps, departments } = state;
  const [tab, setTab] = useState('Users');
  const [communityName, setCommunityName] = useState('Sunshine State Roleplay Community');
  const [logoUrl, setLogoUrl] = useState('');
  const [accentColor, setAccentColor] = useState('#1a3a6b');

  return (
    <div style={{ padding: '16px', fontFamily: 'Ubuntu Mono, monospace' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ color: '#f59e0b', fontSize: '16px', fontWeight: 700, letterSpacing: '2px' }}>⚙ ADMIN PANEL</span>
        <span style={{ color: '#475569', fontSize: '11px' }}>Restricted — Admin Access Only</span>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Total Officers', val: officers.length, color: '#4a9eff' },
          { label: 'Active Sessions', val: activeSessions.length, color: '#22c55e' },
          { label: 'Pending Whitelist', val: whitelistApps.filter(w => w.status === 'Pending').length, color: '#f59e0b' },
          { label: 'Departments', val: departments.length, color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0d1f3c', border: `1px solid ${s.color}30`, borderRadius: '6px', padding: '12px 16px' }}>
            <div style={{ color: s.color, fontSize: '24px', fontWeight: 700 }}>{s.val}</div>
            <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #1e3060', marginBottom: '16px' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? '#0d2545' : 'transparent', border: tab === t ? '1px solid #f59e0b' : '1px solid transparent', borderBottom: 'none', borderRadius: '4px 4px 0 0', color: tab === t ? '#f59e0b' : '#64748b', padding: '7px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Users' && (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#0a1a35' }}>
                {['Name','Badge','Discord ID','Role','Department','Rank','Status','Actions'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#f59e0b', fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #1e4080' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {officers.map((o, i) => (
                <tr key={o.id} style={{ background: i % 2 === 0 ? '#080f1e' : '#0a1525' }}>
                  <td style={{ padding: '7px 10px', color: '#e2e8f0', fontWeight: 600 }}>{o.name}</td>
                  <td style={{ padding: '7px 10px', color: '#60a5fa' }}>{o.badge}</td>
                  <td style={{ padding: '7px 10px', color: '#475569', fontSize: '11px' }}>{o.discordId}</td>
                  <td style={{ padding: '7px 10px' }}>
                    <span style={{ color: o.role === 'admin' ? '#f59e0b' : '#94a3b8', fontWeight: o.role === 'admin' ? 700 : 400 }}>{o.role}</span>
                  </td>
                  <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{o.deptShort}</td>
                  <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{o.rank}</td>
                  <td style={{ padding: '7px 10px' }}><StatusBadge status={o.status} /></td>
                  <td style={{ padding: '7px 10px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button style={aBtn('#1e4080','#4a9eff')}>Edit</button>
                      <button style={aBtn('#7f1d1d','#ef4444')}>Ban</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Active Sessions' && (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#0a1a35' }}>
                {['User','Role','Login Time','Last Active','IP'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#f59e0b', fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #1e4080' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeSessions.map((s, i) => (
                <tr key={s.userId} style={{ background: i % 2 === 0 ? '#080f1e' : '#0a1525' }}>
                  <td style={{ padding: '7px 10px', color: '#e2e8f0' }}>{s.name}</td>
                  <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{s.role}</td>
                  <td style={{ padding: '7px 10px', color: '#475569' }}>{s.loginTime}</td>
                  <td style={{ padding: '7px 10px', color: '#22c55e' }}>{s.lastActive}</td>
                  <td style={{ padding: '7px 10px', color: '#475569' }}>{s.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Audit Log' && (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#0a1a35' }}>
                {['Timestamp','User','Action','Module'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#f59e0b', fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #1e4080' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auditLog.map((entry, i) => (
                <tr key={entry.id} style={{ background: i % 2 === 0 ? '#080f1e' : '#0a1525' }}>
                  <td style={{ padding: '7px 10px', color: '#475569', fontSize: '11px', whiteSpace: 'nowrap' }}>{entry.timestamp}</td>
                  <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{entry.user}</td>
                  <td style={{ padding: '7px 10px', color: '#e2e8f0' }}>{entry.action}</td>
                  <td style={{ padding: '7px 10px' }}>
                    <span style={{ background: '#1e3060', color: '#4a9eff', borderRadius: '4px', padding: '2px 7px', fontSize: '10px' }}>{entry.module}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Whitelist' && (
        <div>
          <div style={{ color: '#f59e0b', fontSize: '12px', marginBottom: '12px' }}>Pending Applications: {whitelistApps.filter(w => w.status === 'Pending').length}</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#0a1a35' }}>
                {['Discord ID','Name','Applied','Status','Notes','Actions'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#f59e0b', fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #1e4080' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {whitelistApps.map((app, i) => (
                <tr key={app.id} style={{ background: i % 2 === 0 ? '#080f1e' : '#0a1525' }}>
                  <td style={{ padding: '7px 10px', color: '#60a5fa' }}>{app.discordId}</td>
                  <td style={{ padding: '7px 10px', color: '#e2e8f0' }}>{app.name}</td>
                  <td style={{ padding: '7px 10px', color: '#475569' }}>{app.appliedDate}</td>
                  <td style={{ padding: '7px 10px' }}><StatusBadge status={app.status} /></td>
                  <td style={{ padding: '7px 10px', color: '#64748b', fontSize: '11px' }}>{app.notes || '—'}</td>
                  <td style={{ padding: '7px 10px' }}>
                    {app.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => dispatch({ type: 'APPROVE_WHITELIST', payload: app.id })} style={aBtn('#14532d','#22c55e')}>Approve</button>
                        <button onClick={() => dispatch({ type: 'DENY_WHITELIST', payload: app.id })} style={aBtn('#7f1d1d','#ef4444')}>Deny</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Settings' && (
        <div style={{ maxWidth: '500px' }}>
          <div style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '6px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ color: '#4a9eff', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>COMMUNITY SETTINGS</div>
            {[['Community Name', communityName, setCommunityName], ['Logo URL', logoUrl, setLogoUrl]].map(([l, v, s]) => (
              <div key={l}>
                <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>{l.toUpperCase()}</label>
                <input value={v} onChange={e => s(e.target.value)} style={{ background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', color: '#e2e8f0', padding: '8px 10px', fontSize: '12px', fontFamily: 'Ubuntu Mono, monospace', width: '100%', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div>
              <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>CAD ACCENT COLOR</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', padding: '4px', width: '50px', height: '36px', cursor: 'pointer' }} />
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>{accentColor}</span>
              </div>
            </div>
            <button style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', letterSpacing: '1px', marginTop: '8px' }}>
              SAVE SETTINGS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const aBtn = (bg, c) => ({ background: bg, border: `1px solid ${c}`, borderRadius: '3px', color: c, padding: '4px 8px', fontSize: '10px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', fontWeight: 600 });
