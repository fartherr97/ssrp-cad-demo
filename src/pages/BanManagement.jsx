import { useState } from 'react';
import Select from '../components/ui/Select';
import { useCAD } from '../store/cadStore';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import {
  BADGE, S_PAGE, S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_CARD, S_TABLE, S_TABLE_TH, S_TABLE_TD, S_BTN_PRIMARY, S_BTN_SECONDARY,
  S_BTN_DANGER, S_BTN_WARNING, S_BTN_GHOST, S_INPUT, S_SELECT, S_LABEL,
  S_FIELD, S_DATA, trHoverOn, trHoverOff, xs, sm,
} from '../constants/styles';

const S_TEXTAREA = 'w-full bg-app-input border border-border-base rounded-lg px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none resize-y min-h-[60px] focus:border-brand/60 focus:ring-2 focus:ring-brand/20 transition-all';

export default function BanManagement() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const confirm = useConfirm();
  const { bannedUsers } = state;
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({ name:'', discordId:'', reason:'', duration:'Permanent' });

  const q = query.trim().toLowerCase();
  const filtered = bannedUsers.filter(b =>
    (filter === 'ALL' || b.status === filter) &&
    (!q || b.name?.toLowerCase().includes(q) || String(b.discordId || '').includes(q)));
  const active = bannedUsers.filter(b => b.status === 'Active').length;
  const perma = bannedUsers.filter(b => b.duration === 'Permanent' && b.status === 'Active').length;

  const issueBan = () => {
    if (!form.name || !form.discordId || !form.reason) return;
    if (!/^\d{17,19}$/.test(form.discordId.trim())) {
      toast.error('Enter a valid Discord ID (17–19 digits).', { title: 'Invalid Discord ID' });
      return;
    }
    dispatch({ type: 'BAN_USER', payload: { ...form, discordId: form.discordId.trim() } });
    toast.success(`${form.name} banned`, { title: 'Ban issued' });
    setForm({ name:'',discordId:'',reason:'',duration:'Permanent' });
    setShowForm(false);
  };

  const unban = async (b) => {
    if (!(await confirm({
      title: 'Lift ban',
      message: `Lift the ban on ${b.name}? They will regain access.`,
      confirmLabel: 'Lift ban',
      danger: true,
    }))) return;
    dispatch({ type: 'UNBAN_USER', payload: b.id });
    toast.success('Ban lifted');
  };

  const statusBadge = { Active: BADGE.red, Expired: BADGE.gray, Lifted: BADGE.green };

  return (
    <div className={`${S_PAGE} !p-0 overflow-hidden !gap-0`}>
      {/* Header */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 items-center px-4 py-3 bg-app-toolbar/80 backdrop-blur-md border-b border-border-base shrink-0">
        {[
          { label: 'TOTAL BANS', value: bannedUsers.length, cls: 'text-cad-text' },
          { label: 'ACTIVE', value: active, cls: 'text-red-400' },
          { label: 'PERMANENT', value: perma, cls: 'text-red-400' },
          { label: 'EXPIRED/LIFTED', value: bannedUsers.length - active, cls: 'text-slate-500' },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center">
            <span className={`font-mono text-[15px] font-bold ${s.cls}`}>{s.value}</span>
            <span className="text-[8px] text-cad-muted tracking-[0.6px] uppercase">{s.label}</span>
          </div>
        ))}
        <div className="ml-auto flex gap-1.5 items-center flex-wrap">
          <input
            className={`${S_INPUT} !w-[200px] !py-1 text-[11px]`}
            placeholder="Search name or Discord ID…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {['ALL','Active','Expired','Lifted'].map(f => (
            <button key={f} className={xs(filter === f ? S_BTN_PRIMARY : S_BTN_SECONDARY)}
              onClick={() => setFilter(f)}>{f}</button>
          ))}
          <button className={`press ${sm(S_BTN_DANGER)}`} onClick={() => setShowForm(true)}>
            Issue Ban
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-2.5 gap-2">
        {/* Issue form (inline) */}
        {showForm && (
          <div className={`${S_CARD} shrink-0`}>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.7px] mb-2.5">
              Issue New Ban
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              <div className={S_FIELD}><label className={S_LABEL}>Username *</label><input className={S_INPUT} placeholder="Discord username" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} /></div>
              <div className={S_FIELD}><label className={S_LABEL}>Discord ID *</label><input className={S_INPUT} placeholder="18-digit Discord ID" value={form.discordId} onChange={e => setForm(p=>({...p,discordId:e.target.value}))} /></div>
              <div className={S_FIELD}><label className={S_LABEL}>Duration</label>
                <Select className={S_SELECT} value={form.duration} onChange={e => setForm(p=>({...p,duration:e.target.value}))}>
                  <option>Permanent</option>
                  <option>30 Days</option>
                  <option>14 Days</option>
                  <option>7 Days</option>
                  <option>3 Days</option>
                  <option>24 Hours</option>
                </Select>
              </div>
            </div>
            <div className={`${S_FIELD} mb-2`}>
              <label className={S_LABEL}>Ban Reason *</label>
              <textarea className={S_TEXTAREA} rows={2} placeholder="Provide a clear, specific reason for this ban..." value={form.reason} onChange={e => setForm(p=>({...p,reason:e.target.value}))} />
            </div>
            <div className="flex gap-1.5 justify-end">
              <button className={sm(S_BTN_GHOST)} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={`press ${sm(S_BTN_DANGER)}`} onClick={issueBan} disabled={!form.name||!form.discordId||!form.reason}>
                Confirm Ban
              </button>
            </div>
          </div>
        )}

        {/* Ban list table */}
        <div className={`${S_PANEL} flex-1`}>
          <div className={S_PANEL_HEADER}>
            <div className={S_PANEL_TITLE}>Ban Registry</div>
            <span className="text-[9px] text-cad-muted font-mono">{filtered.length} RECORDS</span>
          </div>
          <div className={`${S_PANEL_BODY} overflow-auto`}>
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-cad-muted text-[11px]">No bans matching filter</div>
            ) : (
              <table className={`${S_TABLE} min-w-[760px]`}>
                <thead>
                  <tr>
                    {['Status','Username','Discord ID','Duration','Issued By','Date','Reason','Actions'].map(h => (
                      <th key={h} className={S_TABLE_TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id} onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}>
                      <td className={S_TABLE_TD}><span className={statusBadge[b.status] || BADGE.gray}>{b.status}</span></td>
                      <td className={`${S_TABLE_TD} font-medium`}>{b.name}</td>
                      <td className={S_TABLE_TD}><span className={`${S_DATA} text-[10px]`}>{b.discordId}</span></td>
                      <td className={S_TABLE_TD}>
                        <span className={`${b.duration === 'Permanent' ? BADGE.red : BADGE.orange} text-[9px]`}>
                          {b.duration}
                        </span>
                      </td>
                      <td className={`${S_TABLE_TD} text-[11px] text-slate-500`}>{b.issuedBy}</td>
                      <td className={S_TABLE_TD}><span className={`${S_DATA} text-[10px]`}>{b.date}</span></td>
                      <td className={`${S_TABLE_TD} text-[11px] text-slate-500 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap`}>{b.reason}</td>
                      <td className={S_TABLE_TD}>
                        {b.status === 'Active' && (
                          <button className={`press-sm ${xs(S_BTN_WARNING)}`} onClick={() => unban(b)}>Lift Ban</button>
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
