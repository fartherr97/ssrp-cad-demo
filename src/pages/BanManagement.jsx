import { useState } from 'react';
import { useCAD } from '../store/cadStore';

export default function BanManagement() {
  const { state, dispatch } = useCAD();
  const { bannedUsers, currentUser } = state;
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [form, setForm] = useState({ name:'', discordId:'', reason:'', duration:'Permanent' });

  const filtered = filter === 'ALL' ? bannedUsers : bannedUsers.filter(b => b.status === filter);
  const active = bannedUsers.filter(b => b.status === 'Active').length;
  const perma = bannedUsers.filter(b => b.duration === 'Permanent' && b.status === 'Active').length;

  const issueBan = () => {
    if (!form.name || !form.discordId || !form.reason) return;
    dispatch({ type: 'BAN_USER', payload: { ...form } });
    setForm({ name:'',discordId:'',reason:'',duration:'Permanent' });
    setShowForm(false);
  };

  const unban = (id) => dispatch({ type: 'UNBAN_USER', payload: id });

  const statusColor = { Active:'badge-red', Expired:'badge-gray', Lifted:'badge-green' };

  return (
    <div className="n-page" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
      {/* Header */}
      <div style={{
        display: 'flex', gap: 20, alignItems: 'center', padding: '5px 10px',
        background: 'var(--n-bg-panel)', borderBottom: '1px solid var(--n-border)', flexShrink: 0,
      }}>
        {[
          { label: 'TOTAL BANS', value: bannedUsers.length, color: 'var(--n-text)' },
          { label: 'ACTIVE', value: active, color: 'var(--pr1-text)' },
          { label: 'PERMANENT', value: perma, color: 'var(--pr1-text)' },
          { label: 'EXPIRED/LIFTED', value: bannedUsers.length - active, color: 'var(--n-text-dim)' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 8, color: 'var(--n-text-muted)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>{s.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          {['ALL','Active','Expired','Lifted'].map(f => (
            <button key={f} className={`n-btn n-btn-xs ${filter === f ? 'n-btn-primary' : 'n-btn-secondary'}`}
              onClick={() => setFilter(f)}>{f}</button>
          ))}
          <button className="n-btn n-btn-danger n-btn-sm" onClick={() => setShowForm(true)}>
            Issue Ban
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 10, gap: 8 }}>
        {/* Issue form (inline) */}
        {showForm && (
          <div className="n-card" style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: 'var(--n-gold)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>
              Issue New Ban
            </div>
            <div className="n-grid-2" style={{ gap: 8, marginBottom: 8 }}>
              <div className="n-field"><label className="n-label">Username *</label><input className="n-input" placeholder="Discord username" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} /></div>
              <div className="n-field"><label className="n-label">Discord ID *</label><input className="n-input" placeholder="18-digit Discord ID" value={form.discordId} onChange={e => setForm(p=>({...p,discordId:e.target.value}))} /></div>
              <div className="n-field"><label className="n-label">Duration</label>
                <select className="n-select" value={form.duration} onChange={e => setForm(p=>({...p,duration:e.target.value}))}>
                  <option>Permanent</option>
                  <option>30 Days</option>
                  <option>14 Days</option>
                  <option>7 Days</option>
                  <option>3 Days</option>
                  <option>24 Hours</option>
                </select>
              </div>
            </div>
            <div className="n-field" style={{ marginBottom: 8 }}>
              <label className="n-label">Ban Reason *</label>
              <textarea className="n-textarea" rows={2} placeholder="Provide a clear, specific reason for this ban..." value={form.reason} onChange={e => setForm(p=>({...p,reason:e.target.value}))} />
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button className="n-btn n-btn-ghost n-btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="n-btn n-btn-danger n-btn-sm" onClick={issueBan} disabled={!form.name||!form.discordId||!form.reason}>
                Confirm Ban
              </button>
            </div>
          </div>
        )}

        {/* Ban list table */}
        <div className="n-panel" style={{ flex: 1 }}>
          <div className="n-panel-header">
            <div className="n-panel-title">Ban Registry</div>
            <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {filtered.length} RECORDS
            </span>
          </div>
          <div className="n-panel-body scroll-y">
            {filtered.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--n-text-muted)', fontSize: 11 }}>No bans matching filter</div>
            ) : (
              <table className="n-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Username</th>
                    <th>Discord ID</th>
                    <th>Duration</th>
                    <th>Issued By</th>
                    <th>Date</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id}>
                      <td><span className={`n-badge ${statusColor[b.status] || 'badge-gray'}`}>{b.status}</span></td>
                      <td style={{ fontWeight: 500 }}>{b.name}</td>
                      <td><span className="n-data" style={{ fontSize: 10 }}>{b.discordId}</span></td>
                      <td>
                        <span className={`n-badge ${b.duration === 'Permanent' ? 'badge-red' : 'badge-orange'}`} style={{ fontSize: 9 }}>
                          {b.duration}
                        </span>
                      </td>
                      <td style={{ fontSize: 11, color: 'var(--n-text-dim)' }}>{b.issuedBy}</td>
                      <td><span className="n-data" style={{ fontSize: 10 }}>{b.date}</span></td>
                      <td style={{ fontSize: 11, color: 'var(--n-text-dim)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.reason}</td>
                      <td>
                        {b.status === 'Active' && (
                          <button className="n-btn n-btn-warning n-btn-xs" onClick={() => unban(b.id)}>Lift Ban</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
