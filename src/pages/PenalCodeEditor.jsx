import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import {
  BADGE, S_PAGE, S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_CARD, S_TABLE, S_TABLE_TH, S_TABLE_TD, S_BTN_PRIMARY, S_BTN_SECONDARY,
  S_BTN_DANGER, S_BTN_GHOST, S_INPUT, S_SELECT, S_LABEL, S_FIELD, S_DATA,
  S_OVERLAY, S_MODAL, S_MODAL_HEADER, S_MODAL_TITLE, S_MODAL_BODY, S_MODAL_FOOTER,
  S_DETAIL_ROW, S_DETAIL_LABEL, S_DETAIL_VALUE, S_DETAIL_VALUE_MONO,
  trHoverOn, trHoverOff, xs, sm,
} from '../constants/styles';

export default function PenalCodeEditor() {
  const { state, dispatch } = useCAD();
  const { penalCode, currentUser } = state;

  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [catFilter, setCatFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ category: '', code: '', name: '', type: 'Misdemeanor', fine: '', jailTime: '', points: 0 });

  const isAdmin = currentUser?.role === 'admin';

  const categories = ['ALL', ...new Set(penalCode.map(p => p.category))];

  const filtered = penalCode.filter(p => {
    const textMatch = !filter || p.name.toLowerCase().includes(filter.toLowerCase()) || p.code.toLowerCase().includes(filter.toLowerCase());
    const typeMatch = typeFilter === 'ALL' || p.type === typeFilter;
    const catMatch = catFilter === 'ALL' || p.category === catFilter;
    return textMatch && typeMatch && catMatch;
  });

  const selCharge = selected != null ? penalCode.find(p => p.id === selected) : null;

  const startEdit = (charge) => {
    setEditing(charge.id);
    setForm({ ...charge, fine: String(charge.fine), points: String(charge.points) });
  };

  const saveEdit = () => {
    dispatch({
      type: 'UPDATE_CHARGE',
      payload: { ...form, id: editing, fine: Number(form.fine), points: Number(form.points) },
    });
    setEditing(null);
    setSelected(editing);
  };

  const addCharge = () => {
    if (!form.code || !form.name) return;
    dispatch({ type: 'ADD_CHARGE', payload: { ...form, fine: Number(form.fine), points: Number(form.points) } });
    setForm({ category: '', code: '', name: '', type: 'Misdemeanor', fine: '', jailTime: '', points: 0 });
    setShowAdd(false);
  };

  const typeBadge = { Felony: BADGE.red, Misdemeanor: BADGE.orange, Infraction: BADGE.yellow };

  return (
    <div className={`${S_PAGE} !p-0 overflow-hidden !gap-0`}>
      {/* Header */}
      <div className="flex gap-2.5 items-center px-2.5 py-1.5 bg-app-panel border-b border-border-base shrink-0">
        <input className={`${S_INPUT} !w-[200px] text-[11px]`} placeholder="Search codes or names..." value={filter} onChange={e => setFilter(e.target.value)} />
        <select className={`${S_SELECT} !w-[130px] text-[10px]`} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="ALL">All Types</option>
          <option value="Felony">Felony</option>
          <option value="Misdemeanor">Misdemeanor</option>
          <option value="Infraction">Infraction</option>
        </select>
        <select className={`${S_SELECT} !w-[200px] text-[10px]`} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <span className="text-[10px] text-cad-muted font-mono ml-1">
          {filtered.length} charges
        </span>
        {isAdmin && (
          <button className={`${sm(S_BTN_PRIMARY)} ml-auto`} onClick={() => setShowAdd(true)}>
            + Add Charge
          </button>
        )}
      </div>

      <div className="grid flex-1 overflow-hidden min-h-0" style={{ gridTemplateColumns: '1fr 320px' }}>
        {/* Charges table */}
        <div className="flex flex-col border-r border-border-base overflow-hidden">
          <div className={S_PANEL_HEADER}>
            <div className={S_PANEL_TITLE}>Penal Code Reference</div>
            <span className="text-[9px] text-cad-muted font-mono">SSRP LEGAL CODE</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className={S_TABLE}>
              <thead>
                <tr>
                  {['Code','Offense','Category','Type','Fine','Jail Time','Points'].map(h => (
                    <th key={h} className={S_TABLE_TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}
                    className={`cursor-pointer ${selected === p.id ? 'bg-app-selected' : ''}`}
                    onClick={() => setSelected(p.id)}
                    onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}>
                    <td className={S_TABLE_TD}><span className={`${S_DATA} text-[11px]`}>{p.code}</span></td>
                    <td className={`${S_TABLE_TD} font-medium`}>{p.name}</td>
                    <td className={`${S_TABLE_TD} text-[10px] text-slate-500`}>{p.category}</td>
                    <td className={S_TABLE_TD}><span className={typeBadge[p.type] || BADGE.gray}>{p.type}</span></td>
                    <td className={`${S_TABLE_TD} font-mono text-[11px]`}>
                      {p.fine > 0 ? `$${p.fine.toLocaleString()}` : '*'}
                    </td>
                    <td className={`${S_TABLE_TD} text-[11px] ${p.jailTime === 'None' ? 'text-slate-500' : 'text-cad-text'}`}>
                      {p.jailTime}
                    </td>
                    <td className={S_TABLE_TD}>
                      {p.points > 0 ? (
                        <span className={p.points >= 7 ? BADGE.red : p.points >= 4 ? BADGE.orange : BADGE.yellow}>
                          {p.points}
                        </span>
                      ) : <span className="text-slate-500 text-[10px]">0</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail / Edit Panel */}
        <div className="flex flex-col overflow-hidden">
          {!selCharge ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-cad-muted p-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.25">
                <path d="M12 2L3 9l1.5 10.5L12 22l7.5-2.5L21 9z"/>
              </svg>
              <span className="text-[11px] text-center">Select a charge to view details</span>
            </div>
          ) : editing === selCharge.id ? (
            <>
              <div className={S_PANEL_HEADER}>
                <div className={S_PANEL_TITLE}>Edit Charge</div>
                <button className={xs(S_BTN_GHOST)} onClick={() => setEditing(null)}>✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <div className="flex flex-col gap-2">
                  <div className={S_FIELD}><label className={S_LABEL}>Code</label><input className={S_INPUT} value={form.code} onChange={e => setForm(p=>({...p,code:e.target.value}))} /></div>
                  <div className={S_FIELD}><label className={S_LABEL}>Offense Name</label><input className={S_INPUT} value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} /></div>
                  <div className={S_FIELD}><label className={S_LABEL}>Category</label><input className={S_INPUT} value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} /></div>
                  <div className={S_FIELD}><label className={S_LABEL}>Type</label>
                    <select className={S_SELECT} value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))}>
                      <option>Felony</option><option>Misdemeanor</option><option>Infraction</option>
                    </select>
                  </div>
                  <div className={S_FIELD}><label className={S_LABEL}>Fine ($)</label><input className={S_INPUT} type="number" value={form.fine} onChange={e => setForm(p=>({...p,fine:e.target.value}))} /></div>
                  <div className={S_FIELD}><label className={S_LABEL}>Jail Time</label><input className={S_INPUT} placeholder="e.g. 5 Years or None" value={form.jailTime} onChange={e => setForm(p=>({...p,jailTime:e.target.value}))} /></div>
                  <div className={S_FIELD}><label className={S_LABEL}>Points</label><input className={S_INPUT} type="number" min="0" max="10" value={form.points} onChange={e => setForm(p=>({...p,points:e.target.value}))} /></div>
                </div>
              </div>
              <div className="px-3 py-2 border-t border-border-base flex gap-1.5 justify-end bg-app-card shrink-0">
                <button className={S_BTN_SECONDARY} onClick={() => setEditing(null)}>Cancel</button>
                <button className={S_BTN_PRIMARY} onClick={saveEdit}>Save Changes</button>
              </div>
            </>
          ) : (
            <>
              <div className={S_PANEL_HEADER}>
                <div>
                  <div className={S_PANEL_TITLE}><span className={S_DATA}>{selCharge.code}</span></div>
                  <div className="text-[10px] text-slate-500 mt-px">{selCharge.category}</div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button className={sm(S_BTN_SECONDARY)} onClick={() => startEdit(selCharge)}>Edit</button>
                    <button className={sm(S_BTN_DANGER)} onClick={() => { dispatch({type:'DELETE_CHARGE',payload:selCharge.id}); setSelected(null); }}>Delete</button>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                <div className={S_CARD}>
                  <div className="text-[14px] font-bold mb-1">{selCharge.name}</div>
                  <span className={typeBadge[selCharge.type] || BADGE.gray}>{selCharge.type}</span>
                </div>
                <div className={S_CARD}>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Penal Code</span><span className={S_DETAIL_VALUE_MONO}>{selCharge.code}</span></div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Category</span><span className={S_DETAIL_VALUE}>{selCharge.category}</span></div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Classification</span><span className={S_DETAIL_VALUE}>{selCharge.type}</span></div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Fine</span>
                    <span className={`${S_DETAIL_VALUE} font-mono ${selCharge.fine > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                      {selCharge.fine > 0 ? `$${selCharge.fine.toLocaleString()}` : 'No fine'}
                    </span>
                  </div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Imprisonment</span>
                    <span className={`${S_DETAIL_VALUE} ${selCharge.jailTime !== 'None' ? 'text-red-400' : 'text-slate-500'}`}>
                      {selCharge.jailTime}
                    </span>
                  </div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Points</span>
                    <span className={selCharge.points >= 7 ? BADGE.red : selCharge.points >= 4 ? BADGE.orange : selCharge.points > 0 ? BADGE.yellow : BADGE.gray}>
                      {selCharge.points}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Charge Modal */}
      {showAdd && (
        <div className={S_OVERLAY} onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className={S_MODAL}>
            <div className={S_MODAL_HEADER}>
              <div className={S_MODAL_TITLE}>Add Penal Code Entry</div>
              <button className={sm(S_BTN_GHOST)} onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className={S_MODAL_BODY}>
              <div className="grid grid-cols-2 gap-3">
                <div className={S_FIELD}><label className={S_LABEL}>Code *</label><input className={S_INPUT} placeholder="e.g. 459 PC" value={form.code} onChange={e => setForm(p=>({...p,code:e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Type</label><select className={S_SELECT} value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))}><option>Felony</option><option>Misdemeanor</option><option>Infraction</option></select></div>
              </div>
              <div className={S_FIELD}><label className={S_LABEL}>Offense Name *</label><input className={S_INPUT} value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} /></div>
              <div className={S_FIELD}><label className={S_LABEL}>Category</label><input className={S_INPUT} placeholder="e.g. Crimes Against Property" value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className={S_FIELD}><label className={S_LABEL}>Fine ($)</label><input className={S_INPUT} type="number" value={form.fine} onChange={e => setForm(p=>({...p,fine:e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Jail Time</label><input className={S_INPUT} placeholder="e.g. 5 Years" value={form.jailTime} onChange={e => setForm(p=>({...p,jailTime:e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Points</label><input className={S_INPUT} type="number" min="0" max="10" value={form.points} onChange={e => setForm(p=>({...p,points:e.target.value}))} /></div>
              </div>
            </div>
            <div className={S_MODAL_FOOTER}>
              <button className={S_BTN_SECONDARY} onClick={() => setShowAdd(false)}>Cancel</button>
              <button className={S_BTN_PRIMARY} onClick={addCharge} disabled={!form.code || !form.name}>Add to Code</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
