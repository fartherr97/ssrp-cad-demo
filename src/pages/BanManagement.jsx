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

  return (
    <div style={{ padding: '14px', fontFamily: 'Ubuntu Mono, monospace' }}>
      {/* Header */}
      <div style={{ background: '#0b0d14', border: '1px solid #1e2533', borderBottom: 'none', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 700, letterSpacing: '2px' }}>BAN MANAGEMENT</span>
        <button onClick={() => setShowForm(true)} style={{ background: '#450a0a', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 12px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', fontWeight: 700, marginLeft: 'auto' }}>
          + Issue Ban
        </button>
      </div>

      <div style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '14px', marginBottom: '14px' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Bans', val: bannedUsers.length, color: '#ef4444' },
            { label: 'Active', val: bannedUsers.filter(b => b.status === 'Active').length, color: '#fbbf24' },
            { label: 'Permanent', val: bannedUsers.filter(b => b.duration === 'Permanent' && b.status === 'Active').length, color: '#ef4444' },
            { label: 'Expired/Lifted', val: bannedUsers.filter(b => b.status !== 'Active').length, color: '#374151' },
          ].map(s => (
            <div key={s.label} style={{ background: '#090b10', border: `1px solid ${s.color}25`, padding: '9px 14px' }}>
              <div style={{ color: s.color, fontSize: '20px', fontWeight: 700 }}>{s.val}</div>
              <div style={{ color: '#4b5563', fontSize: '11px', marginTop: '1px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#0b0d14' }}>
                {['User','Discord ID','Reason','Issued By','Date','Duration','Status','Actions'].map(h => (
                  <th key={h} style={{ padding: '7px 10px', textAlign: 'left', color: '#ef4444', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', borderBottom: '1px solid #1e2533', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bannedUsers.map((ban, i) => (
                <tr key={ban.id} style={{ background: i % 2 === 0 ? '#0d1117' : '#111218', opacity: ban.status !== 'Active' ? 0.45 : 1 }}>
                  <td style={{ padding: '7px 10px', color: '#d1d5db', fontWeight: 600 }}>{ban.name}</td>
                  <td style={{ padding: '7px 10px', color: '#60a5fa', fontSize: '11px' }}>{ban.discordId}</td>
                  <td style={{ padding: '7px 10px', color: '#fca5a5', maxWidth: '220px', fontSize: '12px' }}>{ban.reason}</td>
                  <td style={{ padding: '7px 10px', color: '#9ca3af' }}>{ban.issuedBy}</td>
                  <td style={{ padding: '7px 10px', color: '#374151' }}>{ban.date}</td>
                  <td style={{ padding: '7px 10px' }}>
                    <span style={{ color: ban.duration === 'Permanent' ? '#ef4444' : '#fbbf24', fontWeight: ban.duration === 'Permanent' ? 700 : 400 }}>{ban.duration}</span>
                  </td>
                  <td style={{ padding: '7px 10px' }}><StatusBadge status={ban.status} /></td>
                  <td style={{ padding: '7px 10px' }}>
                    {ban.status === 'Active' && (
                      <button onClick={() => dispatch({ type: 'UNBAN_USER', payload: ban.id })} style={{ background: '#052e16', border: '1px solid #166534', color: '#22c55e', padding: '3px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', fontWeight: 600 }}>
                        Unban
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {bannedUsers.length === 0 && (
          <div style={{ color: '#374151', textAlign: 'center', padding: '40px', fontSize: '14px' }}>No bans on record.</div>
        )}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleBan} style={{ background: '#0d1117', border: '1px solid #991b1b', padding: '22px', maxWidth: '480px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '13px', letterSpacing: '1.5px', fontFamily: 'Ubuntu Mono, monospace' }}>ISSUE BAN</span>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '16px' }}>X</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[['USERNAME *','name','text'],['DISCORD ID *','discordId','text']].map(([l,k,t]) => (
                <div key={k}>
                  <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>{l}</label>
                  <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} type={t} required={l.includes('*')} style={inputBase} />
                </div>
              ))}
              <div>
                <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>REASON *</label>
                <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required rows={3} style={{ ...inputBase, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>DURATION</label>
                <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} style={inputBase}>
                  {['1 Day','3 Days','7 Days','14 Days','30 Days','90 Days','Permanent'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <button type="submit" style={{ background: '#450a0a', border: '1px solid #ef4444', color: '#ef4444', padding: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', letterSpacing: '1px', marginTop: '4px' }}>
                CONFIRM BAN
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const inputBase = { width: '100%', background: '#090b10', border: '1px solid #1e2533', color: '#d1d5db', padding: '7px 10px', fontSize: '13px', fontFamily: 'Ubuntu Mono, monospace', boxSizing: 'border-box' };
