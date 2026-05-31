import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';

export default function BanManagement() {
  const { state, dispatch } = useCAD();
  const { bannedUsers } = state;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', discordId: '', reason: '', duration: 'Permanent' });

  const handleBan = (e) => {
    e.preventDefault();
    dispatch({ type: 'BAN_USER', payload: form });
    setShowForm(false);
    setForm({ name: '', discordId: '', reason: '', duration: 'Permanent' });
  };

  const base = { background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', color: '#e2e8f0', padding: '7px 10px', fontSize: '12px', fontFamily: 'Ubuntu Mono, monospace', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '16px', fontFamily: 'Ubuntu Mono, monospace' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <span style={{ color: '#ef4444', fontSize: '16px', fontWeight: 700, letterSpacing: '2px' }}>🔨 BAN MANAGEMENT</span>
        <button onClick={() => setShowForm(true)} style={{ background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '4px', color: '#ef4444', padding: '6px 14px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', fontWeight: 700 }}>
          + Issue Ban
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Total Bans', val: bannedUsers.length, color: '#ef4444' },
          { label: 'Active', val: bannedUsers.filter(b => b.status === 'Active').length, color: '#f59e0b' },
          { label: 'Permanent', val: bannedUsers.filter(b => b.duration === 'Permanent' && b.status === 'Active').length, color: '#ef4444' },
          { label: 'Expired/Lifted', val: bannedUsers.filter(b => b.status !== 'Active').length, color: '#475569' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0d1f3c', border: `1px solid ${s.color}30`, borderRadius: '4px', padding: '10px 14px' }}>
            <div style={{ color: s.color, fontSize: '20px', fontWeight: 700 }}>{s.val}</div>
            <div style={{ color: '#64748b', fontSize: '11px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ background: '#0a1a35' }}>
            {['User','Discord ID','Reason','Issued By','Date','Duration','Status','Actions'].map(h => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#ef4444', fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #1e4080' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bannedUsers.map((ban, i) => (
            <tr key={ban.id} style={{ background: i % 2 === 0 ? '#080f1e' : '#0a1525', opacity: ban.status !== 'Active' ? 0.5 : 1 }}>
              <td style={{ padding: '7px 10px', color: '#e2e8f0', fontWeight: 600 }}>{ban.name}</td>
              <td style={{ padding: '7px 10px', color: '#60a5fa', fontSize: '11px' }}>{ban.discordId}</td>
              <td style={{ padding: '7px 10px', color: '#fca5a5', maxWidth: '250px' }}>{ban.reason}</td>
              <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{ban.issuedBy}</td>
              <td style={{ padding: '7px 10px', color: '#475569' }}>{ban.date}</td>
              <td style={{ padding: '7px 10px' }}>
                <span style={{ color: ban.duration === 'Permanent' ? '#ef4444' : '#f59e0b', fontWeight: ban.duration === 'Permanent' ? 700 : 400 }}>{ban.duration}</span>
              </td>
              <td style={{ padding: '7px 10px' }}><StatusBadge status={ban.status} /></td>
              <td style={{ padding: '7px 10px' }}>
                {ban.status === 'Active' && (
                  <button onClick={() => dispatch({ type: 'UNBAN_USER', payload: ban.id })} style={{ background: '#14532d', border: '1px solid #22c55e', borderRadius: '3px', color: '#22c55e', padding: '4px 10px', fontSize: '10px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', fontWeight: 600 }}>
                    Unban
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {bannedUsers.length === 0 && (
        <div style={{ color: '#334155', textAlign: 'center', padding: '40px', fontSize: '13px' }}>No bans on record.</div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleBan} style={{ background: '#0d1f3c', border: '1px solid #ef4444', borderRadius: '8px', padding: '24px', maxWidth: '480px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '14px', fontFamily: 'Ubuntu Mono, monospace' }}>🔨 ISSUE BAN</span>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[['USERNAME *','name','text'],['DISCORD ID *','discordId','text']].map(([l,k,t]) => (
                <div key={k}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>{l}</label>
                  <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} type={t} required={l.includes('*')} style={base} />
                </div>
              ))}
              <div>
                <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>REASON *</label>
                <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required rows={3} style={{ ...base, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>DURATION</label>
                <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} style={base}>
                  {['1 Day','3 Days','7 Days','14 Days','30 Days','90 Days','Permanent'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <button type="submit" style={{ background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '4px', color: '#ef4444', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>
                CONFIRM BAN
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
