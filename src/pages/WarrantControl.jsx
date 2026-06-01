import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import {
  BADGE, S_PAGE, S_PANEL_HEADER, S_PANEL_TITLE,
  S_CARD, S_TABLE, S_TABLE_TH, S_TABLE_TD, S_BTN_PRIMARY, S_BTN_SECONDARY,
  S_BTN_DANGER, S_BTN_GHOST, S_BTN_SUCCESS, S_INPUT, S_SELECT, S_LABEL, S_FIELD, S_TEXTAREA,
  S_STAT, S_STAT_LABEL, S_STAT_VALUE,
  S_DATA, S_OVERLAY, S_MODAL, S_MODAL_HEADER, S_MODAL_TITLE, S_MODAL_BODY, S_MODAL_FOOTER,
  S_DETAIL_ROW, S_DETAIL_LABEL, S_DETAIL_VALUE, S_DETAIL_VALUE_MONO,
  trHoverOn, trHoverOff, xs, sm,
} from '../constants/styles';
import { MdArrowBack } from 'react-icons/md';

export default function WarrantControl() {
  const { state, dispatch } = useCAD();
  const { warrants, civilians, officers, currentUser } = state;
  const [filter, setFilter] = useState('ACTIVE');
  const [selected, setSelected] = useState(null);
  const [showIssue, setShowIssue] = useState(false);
  const [form, setForm] = useState({ civilianId: '', type: 'Arrest Warrant', charge: '', notes: '' });

  const me = officers.find(o => o.id === currentUser?.id);

  const filtered = filter === 'ALL' ? warrants : warrants.filter(w => w.status === filter);
  const selWarrant = selected != null ? warrants.find(w => w.id === selected) : null;
  const selCiv = selWarrant ? civilians.find(c => c.id === selWarrant.civilianId) : null;

  const activeCount = warrants.filter(w => w.status === 'ACTIVE').length;

  const issueWarrant = () => {
    if (!form.civilianId || !form.charge) return;
    const civ = civilians.find(c => c.id === Number(form.civilianId));
    dispatch({
      type: 'ADD_WARRANT',
      payload: {
        civilianId: Number(form.civilianId),
        civilianName: civ ? `${civ.firstName} ${civ.lastName}` : '*',
        type: form.type,
        charge: form.charge,
        issuedBy: `${me?.rank || ''} ${me?.name || currentUser?.name} (${me?.badge})`,
        issuedDate: new Date().toISOString().split('T')[0],
        notes: form.notes,
      },
    });
    setForm({ civilianId: '', type: 'Arrest Warrant', charge: '', notes: '' });
    setShowIssue(false);
    setFilter('ACTIVE');
  };

  const serveWarrant = (id) => {
    dispatch({ type: 'SERVE_WARRANT', payload: id });
    setSelected(null);
  };

  return (
    <div className={`${S_PAGE} overflow-hidden !p-3 md:!p-5`}>
      {/* Header — stat widgets + actions */}
      <div className="flex flex-wrap gap-3 items-center shrink-0">
        <div className="grid grid-cols-3 gap-3 flex-1 min-w-0 sm:min-w-[240px]">
          {[
            { label: 'Active', value: activeCount, color: '#f87171' },
            { label: 'Served', value: warrants.filter(w => w.status === 'SERVED').length, color: '#4ade80' },
            { label: 'Total', value: warrants.length, color: '#ffffff' },
          ].map(s => (
            <div key={s.label} className={S_STAT}>
              <span className={S_STAT_LABEL}>{s.label}</span>
              <span className={S_STAT_VALUE} style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap gap-2 items-center">
          {['ALL','ACTIVE','SERVED'].map(f => (
            <button key={f} className={sm(filter === f ? S_BTN_PRIMARY : S_BTN_SECONDARY)}
              onClick={() => setFilter(f)}>{f}</button>
          ))}
          <button className={sm(S_BTN_DANGER)} onClick={() => setShowIssue(true)}>
            Issue Warrant
          </button>
        </div>
      </div>

      <div className="grid flex-1 overflow-hidden min-h-0 gap-4 lg:gap-5" style={{ gridTemplateColumns: '1fr 320px' }}>
        {/* Warrant Table */}
        <div className="flex flex-col min-h-0 bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm shadow-lg shadow-black/20">
          <div className={S_PANEL_HEADER}>
            <div className={S_PANEL_TITLE}>Warrant Registry</div>
            <span className="ml-auto px-1.5 py-0.5 rounded-md bg-brand/15 text-brand-bright text-[11px] font-bold leading-none">{filtered.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-cad-muted text-[11px]">No warrants on file</div>
            ) : (
              <table className={S_TABLE}>
                <thead>
                  <tr>
                    {['Status','Subject','Type','Charge','Issued By','Issue Date'].map(h => (
                      <th key={h} className={S_TABLE_TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(w => (
                    <tr key={w.id}
                      className={`cursor-pointer ${selected === w.id ? 'bg-app-selected' : ''}`}
                      onClick={() => setSelected(w.id)}
                      onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}>
                      <td className={S_TABLE_TD}>
                        <span className={w.status === 'ACTIVE' ? BADGE.red : BADGE.green}>{w.status}</span>
                      </td>
                      <td className={`${S_TABLE_TD} font-semibold`}>{w.civilianName}</td>
                      <td className={S_TABLE_TD}><span className={BADGE.gray}>{w.type}</span></td>
                      <td className={`${S_TABLE_TD} max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap text-[11px]`}>{w.charge}</td>
                      <td className={`${S_TABLE_TD} text-[10px] text-slate-500`}>{w.issuedBy}</td>
                      <td className={S_TABLE_TD}><span className={`${S_DATA} text-[10px]`}>{w.issuedDate}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="flex flex-col min-h-0 bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm shadow-lg shadow-black/20">
          {!selWarrant ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-cad-muted p-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.25">
                <rect x="4" y="1" width="16" height="22" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/>
              </svg>
              <span className="text-[11px] text-center">Select a warrant to view details</span>
            </div>
          ) : (
            <>
              <div className={S_PANEL_HEADER}>
                <div className={S_PANEL_TITLE}>Warrant Detail</div>
                <span className={selWarrant.status === 'ACTIVE' ? BADGE.red : BADGE.green}>
                  {selWarrant.status}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                <div className={`${S_CARD} ${selWarrant.status === 'ACTIVE' ? 'border-l-red-400' : 'border-l-green-400'} border-l-[3px]`}>
                  <div className="text-[14px] font-bold mb-0.5">{selWarrant.civilianName}</div>
                  <span className={BADGE.gray}>{selWarrant.type}</span>
                </div>

                <div className={S_CARD}>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Charge</span><span className={`${S_DETAIL_VALUE} font-medium`}>{selWarrant.charge}</span></div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Issued By</span><span className={S_DETAIL_VALUE}>{selWarrant.issuedBy}</span></div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Issue Date</span><span className={S_DETAIL_VALUE_MONO}>{selWarrant.issuedDate}</span></div>
                  {selWarrant.notes && <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Notes</span><span className={`${S_DETAIL_VALUE} italic text-slate-500`}>{selWarrant.notes}</span></div>}
                </div>

                {selCiv && (
                  <div className={S_CARD}>
                    <div className="text-[9px] text-cad-muted uppercase tracking-[0.7px] mb-2">Subject Information</div>
                    <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>DOB</span><span className={S_DETAIL_VALUE_MONO}>{selCiv.dob}</span></div>
                    <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>SSN</span><span className={S_DETAIL_VALUE_MONO}>{selCiv.ssn}</span></div>
                    <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Address</span><span className={S_DETAIL_VALUE}>{selCiv.address}</span></div>
                    <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>DL Status</span><span className={S_DETAIL_VALUE}>{selCiv.dlStatus}</span></div>
                  </div>
                )}

                {selWarrant.status === 'ACTIVE' && (
                  <button className={`${S_BTN_SUCCESS} w-full justify-center`} onClick={() => serveWarrant(selWarrant.id)}>
                    Mark as Served
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Issue Warrant Modal */}
      {showIssue && (
        <div className={S_OVERLAY} onClick={e => e.target === e.currentTarget && setShowIssue(false)}>
          <div className={S_MODAL}>
            <div className={S_MODAL_HEADER}>
              <div className={S_MODAL_TITLE}>Issue New Warrant</div>
              <button className={sm(S_BTN_GHOST)} onClick={() => setShowIssue(false)}>✕</button>
            </div>
            <div className={S_MODAL_BODY}>
              <div className={S_FIELD}>
                <label className={S_LABEL}>Subject *</label>
                <select className={S_SELECT} value={form.civilianId} onChange={e => setForm(p => ({ ...p, civilianId: e.target.value }))}>
                  <option value="">Select civilian...</option>
                  {civilians.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} * {c.dob}</option>
                  ))}
                </select>
              </div>
              <div className={S_FIELD}>
                <label className={S_LABEL}>Warrant Type</label>
                <select className={S_SELECT} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option>Arrest Warrant</option>
                  <option>Bench Warrant</option>
                  <option>Search Warrant</option>
                </select>
              </div>
              <div className={S_FIELD}>
                <label className={S_LABEL}>Charge / Basis *</label>
                <input className={S_INPUT} placeholder="e.g. Possession of Controlled Substance" value={form.charge} onChange={e => setForm(p => ({ ...p, charge: e.target.value }))} />
              </div>
              <div className={S_FIELD}>
                <label className={S_LABEL}>Notes</label>
                <textarea className={S_TEXTAREA} rows={2} placeholder="Subject description, last known location, etc." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div className={S_MODAL_FOOTER}>
              <button className={S_BTN_SECONDARY} onClick={() => setShowIssue(false)}>Cancel</button>
              <button className={S_BTN_DANGER} onClick={issueWarrant} disabled={!form.civilianId || !form.charge}>
                Issue Warrant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
