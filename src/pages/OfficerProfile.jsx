import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';

export default function OfficerProfile() {
  const { state, dispatch } = useCAD();
  const { currentUser, officers, departments, reports, calls, criminalHistory } = state;
  const myOfficer = officers.find(o => o.id === currentUser?.id);
  const myDept = departments.find(d => d.id === myOfficer?.dept);
  const myReports = reports.filter(r => r.officerBadge === myOfficer?.badge);
  const myCallHistory = calls.filter(c => c.units.includes(myOfficer?.unitId));
  const [tab, setTab] = useState('info');
  const [requestingTransfer, setRequestingTransfer] = useState(false);
  const [transferNote, setTransferNote] = useState('');

  if (!myOfficer) return (
    <div style={{ padding: '32px', fontFamily: 'Ubuntu Mono, monospace', color: '#334155', textAlign: 'center' }}>
      No officer profile found for current session.
    </div>
  );

  const commendations = [
    { id: 1, type: 'Commendation', date: '2023-09-15', from: 'Lt. Commander', note: 'Outstanding work on the Washington arrest. Demonstrated excellent tactical judgment.' },
    { id: 2, type: 'Commendation', date: '2023-08-02', from: 'Chief of Police', note: 'Community outreach award — monthly food drive coordination.' },
  ];
  const complaints = [];

  return (
    <div style={{ padding: '16px', fontFamily: 'Ubuntu Mono, monospace', maxWidth: '900px' }}>
      {/* Profile header */}
      <div style={{ background: `linear-gradient(135deg, #0d1f3c, ${myDept?.color || '#1e4080'}20)`, border: `1px solid ${myDept?.color || '#1e4080'}`, borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '64px', height: '64px', background: '#0a1a35', border: `2px solid ${myDept?.color || '#4a9eff'}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            👮
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>{myOfficer.name}</div>
            <div style={{ color: '#94a3b8', fontSize: '15px', marginTop: '4px' }}>
              {myOfficer.rank} — {myDept?.name || 'Unknown Department'}
            </div>
            <div style={{ color: '#64748b', fontSize: '14px', marginTop: '2px' }}>
              Badge: <span style={{ color: '#60a5fa' }}>{myOfficer.badge}</span> • Unit: <span style={{ color: '#60a5fa' }}>{myOfficer.unitId}</span> • {myOfficer.subdivision}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <StatusBadge status={myOfficer.status} style={{ fontSize: '15px', padding: '4px 12px' }} />
            {myOfficer.callId && <div style={{ color: '#f59e0b', fontSize: '14px', marginTop: '6px' }}>On Call: {myOfficer.callId}</div>}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '16px' }}>
          {[
            { label: 'Reports Filed', val: myReports.length },
            { label: 'Calls Attended', val: myCallHistory.length },
            { label: 'Commendations', val: commendations.length },
            { label: 'Complaints', val: complaints.length },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '4px', padding: '8px 12px' }}>
              <div style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: 700 }}>{s.val}</div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #1e3060', marginBottom: '16px' }}>
        {[['info','My Info'],['reports','My Reports'],['calls','Call History'],['commendations','Commendations']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ background: tab === k ? '#0d2545' : 'transparent', border: tab === k ? '1px solid #4a9eff' : '1px solid transparent', borderBottom: 'none', borderRadius: '4px 4px 0 0', color: tab === k ? '#4a9eff' : '#64748b', padding: '7px 14px', fontSize: '14px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <InfoCard title="ASSIGNMENT">
            {[['Department', myDept?.name], ['Short Name', myDept?.short], ['Subdivision', myOfficer.subdivision], ['Rank', myOfficer.rank], ['Badge Number', myOfficer.badge], ['Unit Identifier', myOfficer.unitId], ['Radio Channel', myDept?.radioChannel || '—']].map(([k,v]) => (
              <InfoRow key={k} label={k} value={v || '—'} />
            ))}
          </InfoCard>
          <InfoCard title="TRANSFER REQUEST">
            {!requestingTransfer ? (
              <div>
                <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>Current subdivision: <span style={{ color: '#94a3b8' }}>{myOfficer.subdivision}</span></div>
                <button onClick={() => setRequestingTransfer(true)} style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '8px 14px', fontSize: '14px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>
                  Request Transfer
                </button>
              </div>
            ) : (
              <div>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>REQUESTED SUBDIVISION</div>
                <select style={{ background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', color: '#e2e8f0', padding: '7px 10px', fontSize: '14px', fontFamily: 'Ubuntu Mono, monospace', width: '100%', boxSizing: 'border-box', marginBottom: '8px' }}>
                  {(myDept?.subdivisions || []).map(s => <option key={s}>{s}</option>)}
                </select>
                <textarea value={transferNote} onChange={e => setTransferNote(e.target.value)} placeholder="Reason for transfer request..." rows={3} style={{ background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', color: '#e2e8f0', padding: '7px 10px', fontSize: '14px', fontFamily: 'Ubuntu Mono, monospace', width: '100%', boxSizing: 'border-box', resize: 'vertical', marginBottom: '8px' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { alert('Transfer request submitted!'); setRequestingTransfer(false); }} style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '7px 12px', fontSize: '14px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>Submit</button>
                  <button onClick={() => setRequestingTransfer(false)} style={{ background: 'transparent', border: '1px solid #1e3060', borderRadius: '4px', color: '#64748b', padding: '7px 12px', fontSize: '14px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>Cancel</button>
                </div>
              </div>
            )}
          </InfoCard>
        </div>
      )}

      {tab === 'reports' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#0a1a35' }}>
              {['Case #','Type','Date','Status','Call'].map(h => (
                <th key={h} style={{ padding: '7px 10px', textAlign: 'left', color: '#7a9ab8', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #1e4080' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myReports.map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 === 0 ? '#080f1e' : '#0a1525' }}>
                <td style={{ padding: '7px 10px', color: '#60a5fa', fontWeight: 700 }}>{r.caseNumber}</td>
                <td style={{ padding: '7px 10px', color: '#e2e8f0' }}>{r.type}</td>
                <td style={{ padding: '7px 10px', color: '#475569' }}>{r.date}</td>
                <td style={{ padding: '7px 10px' }}><StatusBadge status={r.status} /></td>
                <td style={{ padding: '7px 10px', color: '#60a5fa' }}>{r.callId || '—'}</td>
              </tr>
            ))}
            {myReports.length === 0 && <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#334155' }}>No reports filed.</td></tr>}
          </tbody>
        </table>
      )}

      {tab === 'calls' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#0a1a35' }}>
              {['Call #','Nature','Location','Priority','Status','Time'].map(h => (
                <th key={h} style={{ padding: '7px 10px', textAlign: 'left', color: '#7a9ab8', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #1e4080' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myCallHistory.map((c, i) => (
              <tr key={c.id} style={{ background: i % 2 === 0 ? '#080f1e' : '#0a1525' }}>
                <td style={{ padding: '7px 10px', color: '#60a5fa', fontWeight: 700 }}>{c.id}</td>
                <td style={{ padding: '7px 10px', color: '#e2e8f0' }}>{c.nature}</td>
                <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{c.location}</td>
                <td style={{ padding: '7px 10px' }}><span style={{ color: ['#ef4444','#f59e0b','#22c55e'][c.priority - 1] || '#fff', fontWeight: 700 }}>P{c.priority}</span></td>
                <td style={{ padding: '7px 10px' }}><StatusBadge status={c.status} /></td>
                <td style={{ padding: '7px 10px', color: '#475569', fontSize: '12px' }}>{c.timestamp}</td>
              </tr>
            ))}
            {myCallHistory.length === 0 && <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#334155' }}>No call history.</td></tr>}
          </tbody>
        </table>
      )}

      {tab === 'commendations' && (
        <div>
          {commendations.map(c => (
            <div key={c.id} style={{ background: '#051a05', border: '1px solid #22c55e', borderRadius: '4px', padding: '14px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '14px' }}>★ {c.type}</span>
                <span style={{ color: '#475569', fontSize: '12px' }}>{c.date}</span>
              </div>
              <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>From: {c.from}</div>
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>{c.note}</div>
            </div>
          ))}
          {complaints.length === 0 && commendations.length > 0 && (
            <div style={{ color: '#22c55e', fontSize: '14px', marginTop: '12px' }}>✓ No complaints on record.</div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '6px', padding: '16px' }}>
      <div style={{ color: '#4a9eff', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px', borderBottom: '1px solid #1e3060', paddingBottom: '6px' }}>{title}</div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ color: '#e2e8f0' }}>{value}</span>
    </div>
  );
}
