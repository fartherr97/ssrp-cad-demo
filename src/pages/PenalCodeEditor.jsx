import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import {
  S_PAGE, S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_CARD, S_INPUT, S_SELECT, S_LABEL, S_FIELD,
  S_BTN_PRIMARY, S_BTN_SECONDARY, S_BTN_GHOST, S_BTN_DANGER,
  sm, xs, btnHoverOn, btnHoverOff, btnActiveOn,
  S_TABLE, S_TABLE_TH, S_TABLE_TD, trHoverOn, trHoverOff,
  S_OVERLAY, S_MODAL, S_MODAL_HEADER, S_MODAL_TITLE, S_MODAL_BODY, S_MODAL_FOOTER,
  BADGE, S_DATA, S_DETAIL_ROW, S_DETAIL_LABEL, S_DETAIL_VALUE, S_DETAIL_VALUE_MONO,
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

  const typeColors = { Felony: BADGE.red, Misdemeanor: BADGE.orange, Infraction: BADGE.yellow };

  return (
    <div style={{ ...S_PAGE, padding: 0, overflow: 'hidden', gap: 0 }}>
      {/* Header */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center', padding: '6px 10px',
        background: 'var(--n-bg-panel)', borderBottom: '1px solid var(--n-border)', flexShrink: 0,
      }}>
        <input style={{ ...S_INPUT, width: 200, fontSize: 11 }} placeholder="Search codes or names..." value={filter} onChange={e => setFilter(e.target.value)} />
        <select style={{ ...S_SELECT, width: 130, fontSize: 10 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="ALL">All Types</option>
          <option value="Felony">Felony</option>
          <option value="Misdemeanor">Misdemeanor</option>
          <option value="Infraction">Infraction</option>
        </select>
        <select style={{ ...S_SELECT, width: 200, fontSize: 10 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <span style={{ fontSize: 10, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 4 }}>
          {filtered.length} charges
        </span>
        {isAdmin && (
          <button style={{ ...sm(S_BTN_PRIMARY), marginLeft: 'auto' }} onMouseDown={btnActiveOn} onClick={() => setShowAdd(true)}>
            + Add Charge
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 0, flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Charges table */}
        <div style={{ ...S_PANEL, borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderBottom: 'none', borderRight: 'none' }}>
          <div className={S_PANEL_HEADER}>
            <div className={S_PANEL_TITLE}>Penal Code Reference</div>
            <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>SSRP LEGAL CODE</span>
          </div>
          <div className={S_PANEL_BODY}>
            <table className={S_TABLE}>
              <thead>
                <tr>
                  <th className={S_TABLE_TH}>Code</th>
                  <th className={S_TABLE_TH}>Offense</th>
                  <th className={S_TABLE_TH}>Category</th>
                  <th className={S_TABLE_TH}>Type</th>
                  <th className={S_TABLE_TH}>Fine</th>
                  <th className={S_TABLE_TH}>Jail Time</th>
                  <th className={S_TABLE_TH}>Points</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} onMouseEnter={trHoverOn} onMouseLeave={trHoverOff} onClick={() => setSelected(p.id)} style={{ cursor: 'pointer' }}>
                    <td className={S_TABLE_TD}><span style={{ ...S_DATA, fontSize: 11 }}>{p.code}</span></td>
                    <td style={{ ...S_TABLE_TD, fontWeight: 500 }}>{p.name}</td>
                    <td style={{ ...S_TABLE_TD, fontSize: 10, color: 'var(--n-text-dim)' }}>{p.category}</td>
                    <td className={S_TABLE_TD}><span style={typeColors[p.type] || BADGE.gray}>{p.type}</span></td>
                    <td style={{ ...S_TABLE_TD, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                      {p.fine > 0 ? `$${p.fine.toLocaleString()}` : '—'}
                    </td>
                    <td style={{ ...S_TABLE_TD, fontSize: 11, color: p.jailTime === 'None' ? 'var(--n-text-muted)' : 'var(--n-text)' }}>
                      {p.jailTime}
                    </td>
                    <td className={S_TABLE_TD}>
                      {p.points > 0 ? (
                        <span style={p.points >= 7 ? BADGE.red : p.points >= 4 ? BADGE.orange : BADGE.yellow}>
                          {p.points}
                        </span>
                      ) : <span style={{ color: 'var(--n-text-muted)', fontSize: 10 }}>0</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail / Edit Panel */}
        <div style={{ ...S_PANEL, borderRadius: 0, borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}>
          {!selCharge ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--n-text-muted)', padding: 20 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.25">
                <path d="M12 2L3 9l1.5 10.5L12 22l7.5-2.5L21 9z"/>
              </svg>
              <span style={{ fontSize: 11, textAlign: 'center' }}>Select a charge to view details</span>
            </div>
          ) : editing === selCharge.id ? (
            <>
              <div className={S_PANEL_HEADER}>
                <div className={S_PANEL_TITLE}>Edit Charge</div>
                <button className={sm(S_BTN_GHOST)} onMouseDown={btnActiveOn} onClick={() => setEditing(null)}>✕</button>
              </div>
              <div style={{ ...S_PANEL_BODY, padding: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={S_FIELD}><label className={S_LABEL}>Code</label><input className={S_INPUT} value={form.code} onChange={e => setForm(p=>({...p,code:e.target.value}))} /></div>
                  <div style={S_FIELD}><label className={S_LABEL}>Offense Name</label><input className={S_INPUT} value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} /></div>
                  <div style={S_FIELD}><label className={S_LABEL}>Category</label><input className={S_INPUT} value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} /></div>
                  <div style={S_FIELD}><label className={S_LABEL}>Type</label>
                    <select className={S_SELECT} value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))}>
                      <option>Felony</option><option>Misdemeanor</option><option>Infraction</option>
                    </select>
                  </div>
                  <div style={S_FIELD}><label className={S_LABEL}>Fine ($)</label><input className={S_INPUT} type="number" value={form.fine} onChange={e => setForm(p=>({...p,fine:e.target.value}))} /></div>
                  <div style={S_FIELD}><label className={S_LABEL}>Jail Time</label><input className={S_INPUT} placeholder="e.g. 5 Years or None" value={form.jailTime} onChange={e => setForm(p=>({...p,jailTime:e.target.value}))} /></div>
                  <div style={S_FIELD}><label className={S_LABEL}>Points</label><input className={S_INPUT} type="number" min="0" max="10" value={form.points} onChange={e => setForm(p=>({...p,points:e.target.value}))} /></div>
                </div>
              </div>
              <div style={{ padding: '8px 12px', borderTop: '1px solid var(--n-border)', display: 'flex', gap: 6, justifyContent: 'flex-end', background: 'var(--n-bg-card)', flexShrink: 0 }}>
                <button className={S_BTN_SECONDARY} onMouseDown={btnActiveOn} onClick={() => setEditing(null)}>Cancel</button>
                <button className={S_BTN_PRIMARY} onMouseDown={btnActiveOn} onClick={saveEdit}>Save Changes</button>
              </div>
            </>
          ) : (
            <>
              <div className={S_PANEL_HEADER}>
                <div>
                  <div className={S_PANEL_TITLE}><span className={S_DATA}>{selCharge.code}</span></div>
                  <div style={{ fontSize: 10, color: 'var(--n-text-dim)', marginTop: 1 }}>{selCharge.category}</div>
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className={sm(S_BTN_SECONDARY)} onMouseDown={btnActiveOn} onClick={() => startEdit(selCharge)}>Edit</button>
                    <button className={sm(S_BTN_DANGER)} onMouseDown={btnActiveOn} onClick={() => { dispatch({type:'DELETE_CHARGE',payload:selCharge.id}); setSelected(null); }}>Delete</button>
                  </div>
                )}
              </div>
              <div style={{ ...S_PANEL_BODY, padding: 12 }}>
                <div style={{ ...S_CARD, marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{selCharge.name}</div>
                  <span style={typeColors[selCharge.type] || BADGE.gray}>{selCharge.type}</span>
                </div>
                <div className={S_CARD}>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Penal Code</span><span className={S_DETAIL_VALUE_MONO}>{selCharge.code}</span></div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Category</span><span className={S_DETAIL_VALUE}>{selCharge.category}</span></div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Classification</span><span className={S_DETAIL_VALUE}>{selCharge.type}</span></div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Fine</span>
                    <span style={{ ...S_DETAIL_VALUE, fontFamily: 'var(--font-mono)', color: selCharge.fine > 0 ? 'var(--pr2-text)' : 'var(--n-text-muted)' }}>
                      {selCharge.fine > 0 ? `$${selCharge.fine.toLocaleString()}` : 'No fine'}
                    </span>
                  </div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Imprisonment</span>
                    <span style={{ ...S_DETAIL_VALUE, color: selCharge.jailTime !== 'None' ? 'var(--pr1-text)' : 'var(--n-text-muted)' }}>
                      {selCharge.jailTime}
                    </span>
                  </div>
                  <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Points</span>
                    <span style={selCharge.points >= 7 ? BADGE.red : selCharge.points >= 4 ? BADGE.orange : selCharge.points > 0 ? BADGE.yellow : BADGE.gray}>
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
              <button className={sm(S_BTN_GHOST)} onMouseDown={btnActiveOn} onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className={S_MODAL_BODY}>
              <div className="n-grid-2">
                <div style={S_FIELD}><label className={S_LABEL}>Code *</label><input className={S_INPUT} placeholder="e.g. 459 PC" value={form.code} onChange={e => setForm(p=>({...p,code:e.target.value}))} /></div>
                <div style={S_FIELD}><label className={S_LABEL}>Type</label><select className={S_SELECT} value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))}><option>Felony</option><option>Misdemeanor</option><option>Infraction</option></select></div>
              </div>
              <div style={S_FIELD}><label className={S_LABEL}>Offense Name *</label><input className={S_INPUT} value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} /></div>
              <div style={S_FIELD}><label className={S_LABEL}>Category</label><input className={S_INPUT} placeholder="e.g. Crimes Against Property" value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} /></div>
              <div className="n-grid-2">
                <div style={S_FIELD}><label className={S_LABEL}>Fine ($)</label><input className={S_INPUT} type="number" value={form.fine} onChange={e => setForm(p=>({...p,fine:e.target.value}))} /></div>
                <div style={S_FIELD}><label className={S_LABEL}>Jail Time</label><input className={S_INPUT} placeholder="e.g. 5 Years" value={form.jailTime} onChange={e => setForm(p=>({...p,jailTime:e.target.value}))} /></div>
                <div style={S_FIELD}><label className={S_LABEL}>Points</label><input className={S_INPUT} type="number" min="0" max="10" value={form.points} onChange={e => setForm(p=>({...p,points:e.target.value}))} /></div>
              </div>
            </div>
            <div className={S_MODAL_FOOTER}>
              <button className={S_BTN_SECONDARY} onMouseDown={btnActiveOn} onClick={() => setShowAdd(false)}>Cancel</button>
              <button className={S_BTN_PRIMARY} onMouseDown={btnActiveOn} onClick={addCharge} disabled={!form.code || !form.name}>Add to Code</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
