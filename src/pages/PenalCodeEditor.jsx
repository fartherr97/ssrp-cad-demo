import { useState } from 'react';
import { useCAD } from '../store/cadStore';

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

  const typeColors = { Felony: 'badge-red', Misdemeanor: 'badge-orange', Infraction: 'badge-yellow' };

  return (
    <div className="n-page" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
      {/* Header */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center', padding: '6px 10px',
        background: 'var(--n-bg-panel)', borderBottom: '1px solid var(--n-border)', flexShrink: 0,
      }}>
        <input className="n-input" style={{ width: 200, fontSize: 11 }} placeholder="Search codes or names..." value={filter} onChange={e => setFilter(e.target.value)} />
        <select className="n-select" style={{ width: 130, fontSize: 10 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="ALL">All Types</option>
          <option value="Felony">Felony</option>
          <option value="Misdemeanor">Misdemeanor</option>
          <option value="Infraction">Infraction</option>
        </select>
        <select className="n-select" style={{ width: 200, fontSize: 10 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <span style={{ fontSize: 10, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 4 }}>
          {filtered.length} charges
        </span>
        {isAdmin && (
          <button className="n-btn n-btn-primary n-btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setShowAdd(true)}>
            + Add Charge
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 0, flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Charges table */}
        <div className="n-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderBottom: 'none', borderRight: 'none' }}>
          <div className="n-panel-header">
            <div className="n-panel-title">Penal Code Reference</div>
            <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>SSRP LEGAL CODE</span>
          </div>
          <div className="n-panel-body scroll-y">
            <table className="n-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Offense</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Fine</th>
                  <th>Jail Time</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className={selected === p.id ? 'selected' : ''} onClick={() => setSelected(p.id)}>
                    <td><span className="n-data" style={{ fontSize: 11 }}>{p.code}</span></td>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td style={{ fontSize: 10, color: 'var(--n-text-dim)' }}>{p.category}</td>
                    <td><span className={`n-badge ${typeColors[p.type] || 'badge-gray'}`}>{p.type}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                      {p.fine > 0 ? `$${p.fine.toLocaleString()}` : '—'}
                    </td>
                    <td style={{ fontSize: 11, color: p.jailTime === 'None' ? 'var(--n-text-muted)' : 'var(--n-text)' }}>
                      {p.jailTime}
                    </td>
                    <td>
                      {p.points > 0 ? (
                        <span className={`n-badge ${p.points >= 7 ? 'badge-red' : p.points >= 4 ? 'badge-orange' : 'badge-yellow'}`}>
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
        <div className="n-panel" style={{ borderRadius: 0, borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}>
          {!selCharge ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--n-text-muted)', padding: 20 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.25">
                <path d="M12 2L3 9l1.5 10.5L12 22l7.5-2.5L21 9z"/>
              </svg>
              <span style={{ fontSize: 11, textAlign: 'center' }}>Select a charge to view details</span>
            </div>
          ) : editing === selCharge.id ? (
            <>
              <div className="n-panel-header">
                <div className="n-panel-title">Edit Charge</div>
                <button className="n-btn n-btn-ghost n-btn-sm" onClick={() => setEditing(null)}>✕</button>
              </div>
              <div className="n-panel-body scroll-y" style={{ padding: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="n-field"><label className="n-label">Code</label><input className="n-input" value={form.code} onChange={e => setForm(p=>({...p,code:e.target.value}))} /></div>
                  <div className="n-field"><label className="n-label">Offense Name</label><input className="n-input" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} /></div>
                  <div className="n-field"><label className="n-label">Category</label><input className="n-input" value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} /></div>
                  <div className="n-field"><label className="n-label">Type</label>
                    <select className="n-select" value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))}>
                      <option>Felony</option><option>Misdemeanor</option><option>Infraction</option>
                    </select>
                  </div>
                  <div className="n-field"><label className="n-label">Fine ($)</label><input className="n-input" type="number" value={form.fine} onChange={e => setForm(p=>({...p,fine:e.target.value}))} /></div>
                  <div className="n-field"><label className="n-label">Jail Time</label><input className="n-input" placeholder="e.g. 5 Years or None" value={form.jailTime} onChange={e => setForm(p=>({...p,jailTime:e.target.value}))} /></div>
                  <div className="n-field"><label className="n-label">Points</label><input className="n-input" type="number" min="0" max="10" value={form.points} onChange={e => setForm(p=>({...p,points:e.target.value}))} /></div>
                </div>
              </div>
              <div style={{ padding: '8px 12px', borderTop: '1px solid var(--n-border)', display: 'flex', gap: 6, justifyContent: 'flex-end', background: 'var(--n-bg-card)', flexShrink: 0 }}>
                <button className="n-btn n-btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
                <button className="n-btn n-btn-primary" onClick={saveEdit}>Save Changes</button>
              </div>
            </>
          ) : (
            <>
              <div className="n-panel-header">
                <div>
                  <div className="n-panel-title"><span className="n-data">{selCharge.code}</span></div>
                  <div style={{ fontSize: 10, color: 'var(--n-text-dim)', marginTop: 1 }}>{selCharge.category}</div>
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="n-btn n-btn-secondary n-btn-sm" onClick={() => startEdit(selCharge)}>Edit</button>
                    <button className="n-btn n-btn-danger n-btn-sm" onClick={() => { dispatch({type:'DELETE_CHARGE',payload:selCharge.id}); setSelected(null); }}>Delete</button>
                  </div>
                )}
              </div>
              <div className="n-panel-body scroll-y" style={{ padding: 12 }}>
                <div className="n-card" style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{selCharge.name}</div>
                  <span className={`n-badge ${typeColors[selCharge.type] || 'badge-gray'}`}>{selCharge.type}</span>
                </div>
                <div className="n-card">
                  <div className="detail-row"><span className="detail-label">Penal Code</span><span className="detail-value-mono">{selCharge.code}</span></div>
                  <div className="detail-row"><span className="detail-label">Category</span><span className="detail-value">{selCharge.category}</span></div>
                  <div className="detail-row"><span className="detail-label">Classification</span><span className="detail-value">{selCharge.type}</span></div>
                  <div className="detail-row"><span className="detail-label">Fine</span>
                    <span className="detail-value" style={{ fontFamily: 'var(--font-mono)', color: selCharge.fine > 0 ? 'var(--pr2-text)' : 'var(--n-text-muted)' }}>
                      {selCharge.fine > 0 ? `$${selCharge.fine.toLocaleString()}` : 'No fine'}
                    </span>
                  </div>
                  <div className="detail-row"><span className="detail-label">Imprisonment</span>
                    <span className="detail-value" style={{ color: selCharge.jailTime !== 'None' ? 'var(--pr1-text)' : 'var(--n-text-muted)' }}>
                      {selCharge.jailTime}
                    </span>
                  </div>
                  <div className="detail-row"><span className="detail-label">Points</span>
                    <span className={`n-badge ${selCharge.points >= 7 ? 'badge-red' : selCharge.points >= 4 ? 'badge-orange' : selCharge.points > 0 ? 'badge-yellow' : 'badge-gray'}`}>
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
        <div className="n-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="n-modal">
            <div className="n-modal-header">
              <div className="n-modal-title">Add Penal Code Entry</div>
              <button className="n-btn n-btn-ghost n-btn-sm" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="n-modal-body">
              <div className="n-grid-2">
                <div className="n-field"><label className="n-label">Code *</label><input className="n-input" placeholder="e.g. 459 PC" value={form.code} onChange={e => setForm(p=>({...p,code:e.target.value}))} /></div>
                <div className="n-field"><label className="n-label">Type</label><select className="n-select" value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))}><option>Felony</option><option>Misdemeanor</option><option>Infraction</option></select></div>
              </div>
              <div className="n-field"><label className="n-label">Offense Name *</label><input className="n-input" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} /></div>
              <div className="n-field"><label className="n-label">Category</label><input className="n-input" placeholder="e.g. Crimes Against Property" value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} /></div>
              <div className="n-grid-2">
                <div className="n-field"><label className="n-label">Fine ($)</label><input className="n-input" type="number" value={form.fine} onChange={e => setForm(p=>({...p,fine:e.target.value}))} /></div>
                <div className="n-field"><label className="n-label">Jail Time</label><input className="n-input" placeholder="e.g. 5 Years" value={form.jailTime} onChange={e => setForm(p=>({...p,jailTime:e.target.value}))} /></div>
                <div className="n-field"><label className="n-label">Points</label><input className="n-input" type="number" min="0" max="10" value={form.points} onChange={e => setForm(p=>({...p,points:e.target.value}))} /></div>
              </div>
            </div>
            <div className="n-modal-footer">
              <button className="n-btn n-btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="n-btn n-btn-primary" onClick={addCharge} disabled={!form.code || !form.name}>Add to Code</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
