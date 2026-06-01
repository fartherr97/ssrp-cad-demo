import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import {
  S_PAGE, S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_CARD, S_INPUT, S_SELECT, S_TEXTAREA, S_LABEL, S_FIELD,
  S_BTN_PRIMARY, S_BTN_SECONDARY, S_BTN_GHOST, S_BTN_DANGER, S_BTN_WARNING,
  sm, xs, btnHoverOn, btnHoverOff, btnActiveOn,
  S_TABLE, S_TABLE_TH, S_TABLE_TD, trHoverOn, trHoverOff,
  BADGE, S_DATA,
} from '../constants/styles';

export default function BanManagement() {
  const { state, dispatch } = useCAD();
  const { bannedUsers } = state;
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

  const statusBadge = { Active: BADGE.red, Expired: BADGE.gray, Lifted: BADGE.green };

  return (
    <div style={{ ...S_PAGE, padding: 0, overflow: 'hidden', gap: 0 }}>
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
            <button key={f}
              style={xs(filter === f ? S_BTN_PRIMARY : S_BTN_SECONDARY)}
             
              onClick={() => setFilter(f)}>{f}</button>
          ))}
          <button className={sm(S_BTN_DANGER)}
            onMouseDown={btnActiveOn}
            onClick={() => setShowForm(true)}>
            Issue Ban
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 10, gap: 8 }}>
        {/* Issue form (inline) */}
        {showForm && (
          <div style={{ ...S_CARD, flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: 'var(--n-gold)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>
              Issue New Ban
            </div>
            <div className="n-grid-2" style={{ gap: 8, marginBottom: 8 }}>
              <div style={S_FIELD}><label className={S_LABEL}>Username *</label><input className={S_INPUT} placeholder="Discord username" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} /></div>
              <div style={S_FIELD}><label className={S_LABEL}>Discord ID *</label><input className={S_INPUT} placeholder="18-digit Discord ID" value={form.discordId} onChange={e => setForm(p=>({...p,discordId:e.target.value}))} /></div>
              <div style={S_FIELD}><label className={S_LABEL}>Duration</label>
                <select className={S_SELECT} value={form.duration} onChange={e => setForm(p=>({...p,duration:e.target.value}))}>
                  <option>Permanent</option>
                  <option>30 Days</option>
                  <option>14 Days</option>
                  <option>7 Days</option>
                  <option>3 Days</option>
                  <option>24 Hours</option>
                </select>
              </div>
            </div>
            <div style={{ ...S_FIELD, marginBottom: 8 }}>
              <label className={S_LABEL}>Ban Reason *</label>
              <textarea className={S_TEXTAREA} rows={2} placeholder="Provide a clear, specific reason for this ban..." value={form.reason} onChange={e => setForm(p=>({...p,reason:e.target.value}))} />
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button className={sm(S_BTN_GHOST)} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={sm(S_BTN_DANGER)} onMouseDown={btnActiveOn}
                onClick={issueBan} disabled={!form.name||!form.discordId||!form.reason}>
                Confirm Ban
              </button>
            </div>
          </div>
        )}

        {/* Ban list table */}
        <div style={{ ...S_PANEL, flex: 1 }}>
          <div className={S_PANEL_HEADER}>
            <div className={S_PANEL_TITLE}>Ban Registry</div>
            <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {filtered.length} RECORDS
            </span>
          </div>
          <div className={S_PANEL_BODY}>
            {filtered.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--n-text-muted)', fontSize: 11 }}>No bans matching filter</div>
            ) : (
              <table className={S_TABLE}>
                <thead>
                  <tr>
                    {['Status','Username','Discord ID','Duration','Issued By','Date','Reason','Actions'].map(h => (
                      <th key={h} className={S_TABLE_TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id} style={{ cursor: 'pointer', transition: 'background 0.14s, transform 0.14s' }}
                      onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}>
                      <td className={S_TABLE_TD}><span style={statusBadge[b.status] || BADGE.gray}>{b.status}</span></td>
                      <td style={{ ...S_TABLE_TD, fontWeight: 500 }}>{b.name}</td>
                      <td className={S_TABLE_TD}><span style={{ ...S_DATA, fontSize: 10 }}>{b.discordId}</span></td>
                      <td className={S_TABLE_TD}>
                        <span style={{ ...(b.duration === 'Permanent' ? BADGE.red : BADGE.orange), fontSize: 9 }}>
                          {b.duration}
                        </span>
                      </td>
                      <td style={{ ...S_TABLE_TD, fontSize: 11, color: 'var(--n-text-dim)' }}>{b.issuedBy}</td>
                      <td className={S_TABLE_TD}><span style={{ ...S_DATA, fontSize: 10 }}>{b.date}</span></td>
                      <td style={{ ...S_TABLE_TD, fontSize: 11, color: 'var(--n-text-dim)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.reason}</td>
                      <td className={S_TABLE_TD}>
                        {b.status === 'Active' && (
                          <button className={xs(S_BTN_WARNING)} onClick={() => unban(b.id)}>Lift Ban</button>
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
