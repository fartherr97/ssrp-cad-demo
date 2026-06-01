import { useState } from 'react';
import { useCAD } from '../store/cadStore';

const TYPE_COLORS = { Felony: '#ef4444', Misdemeanor: '#fbbf24', Infraction: '#22c55e' };
const TYPE_BG = { Felony: '#450a0a', Misdemeanor: '#431407', Infraction: '#052e16' };

export default function PenalCode() {
  const { state, dispatch } = useCAD();
  const { penalCode } = state;
  const [showForm, setShowForm] = useState(false);
  const [editCharge, setEditCharge] = useState(null);
  const [form, setForm] = useState({ category: '', code: '', name: '', type: 'Misdemeanor', fine: 0, jailTime: '', points: 0 });
  const [filterCat, setFilterCat] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');

  const categories = ['ALL', ...new Set(penalCode.map(p => p.category))];

  const filtered = penalCode.filter(p => {
    if (filterCat !== 'ALL' && p.category !== filterCat) return false;
    if (filterType !== 'ALL' && p.type !== filterType) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = categories.filter(c => c !== 'ALL' && (filterCat === 'ALL' || filterCat === c)).reduce((acc, cat) => {
    const items = filtered.filter(p => p.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  const startEdit = (charge) => {
    setEditCharge(charge);
    setForm({ ...charge });
    setShowForm(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editCharge) {
      dispatch({ type: 'UPDATE_CHARGE', payload: { ...editCharge, ...form, fine: Number(form.fine), points: Number(form.points) } });
    } else {
      dispatch({ type: 'ADD_CHARGE', payload: { ...form, fine: Number(form.fine), points: Number(form.points) } });
    }
    setShowForm(false);
    setEditCharge(null);
    setForm({ category: '', code: '', name: '', type: 'Misdemeanor', fine: 0, jailTime: '', points: 0 });
  };

  return (
    <div style={{ padding: '14px', fontFamily: 'Ubuntu Mono, monospace' }}>
      {/* Header */}
      <div style={{ background: '#0b0d14', border: '1px solid #1e2533', borderBottom: 'none', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#f9fafb', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px' }}>PENAL CODE EDITOR</span>
        <span style={{ color: '#4b5563', fontSize: '11px' }}>{penalCode.length} charges defined</span>
        <button
          onClick={() => { setShowForm(true); setEditCharge(null); setForm({ category: '', code: '', name: '', type: 'Misdemeanor', fine: 0, jailTime: '', points: 0 }); }}
          style={{ ...blueBtn, marginLeft: 'auto', fontSize: '11px', padding: '4px 12px' }}>
          + Add Charge
        </button>
      </div>

      <div style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '14px', marginBottom: '14px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search charges..." style={{ ...inputBase, width: '200px' }} />
          <div style={{ display: 'flex', gap: '4px' }}>
            {['ALL','Felony','Misdemeanor','Infraction'].map(t => (
              <button key={t} onClick={() => setFilterType(t)} style={{ background: filterType === t ? TYPE_BG[t] || '#0f172a' : 'transparent', border: `1px solid ${filterType === t ? TYPE_COLORS[t] || '#3b82f6' : '#1f2937'}`, color: filterType === t ? TYPE_COLORS[t] || '#3b82f6' : '#4b5563', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', fontWeight: 600 }}>
                {t}
              </button>
            ))}
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={inputBase}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Grouped charges */}
        {Object.entries(grouped).map(([cat, charges]) => (
          <div key={cat} style={{ marginBottom: '18px' }}>
            <div style={{ color: '#ca8a04', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '6px', borderBottom: '1px solid #1f2937', paddingBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {cat.toUpperCase()}
              <span style={{ background: '#0f172a', color: '#3b82f6', border: '1px solid #1e2533', padding: '1px 6px', fontSize: '10px', fontWeight: 700 }}>{charges.length}</span>
            </div>
            <div className="table-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#0b0d14' }}>
                    {['Code','Name','Type','Fine','Jail Time','Points','Actions'].map(h => (
                      <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#6b7280', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', borderBottom: '1px solid #1e2533', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {charges.map((p, i) => (
                    <tr key={p.id} style={{ background: i % 2 === 0 ? '#0d1117' : '#111218' }}>
                      <td style={{ padding: '6px 10px', color: '#60a5fa', fontWeight: 700 }}>{p.code}</td>
                      <td style={{ padding: '6px 10px', color: '#d1d5db' }}>{p.name}</td>
                      <td style={{ padding: '6px 10px' }}>
                        <span style={{ color: TYPE_COLORS[p.type], fontWeight: 700, fontSize: '11px', background: TYPE_BG[p.type], padding: '1px 6px', border: `1px solid ${TYPE_COLORS[p.type]}40` }}>{p.type}</span>
                      </td>
                      <td style={{ padding: '6px 10px', color: p.fine > 0 ? '#fbbf24' : '#374151' }}>{p.fine > 0 ? `$${p.fine.toLocaleString()}` : '—'}</td>
                      <td style={{ padding: '6px 10px', color: p.jailTime !== 'None' ? '#f87171' : '#374151' }}>{p.jailTime}</td>
                      <td style={{ padding: '6px 10px', color: p.points > 0 ? '#fbbf24' : '#374151' }}>{p.points}</td>
                      <td style={{ padding: '6px 10px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => startEdit(p)} style={aBtn('#0c1a2e','#3b82f6')}>Edit</button>
                          <button onClick={() => dispatch({ type: 'DELETE_CHARGE', payload: p.id })} style={aBtn('#450a0a','#ef4444')}>X</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {Object.keys(grouped).length === 0 && (
          <div style={{ color: '#374151', textAlign: 'center', padding: '40px', fontSize: '14px' }}>No charges match the current filters.</div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleSave} style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '22px', maxWidth: '480px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '13px', letterSpacing: '1.5px' }}>{editCharge ? 'EDIT CHARGE' : 'ADD CHARGE'}</span>
              <button type="button" onClick={() => { setShowForm(false); setEditCharge(null); }} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '16px' }}>X</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              {[['CATEGORY *','category'],['CODE *','code'],['CHARGE NAME *','name'],['JAIL TIME','jailTime']].map(([l,k]) => (
                <div key={k} style={k === 'name' || k === 'category' ? { gridColumn: '1/-1' } : {}}>
                  <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>{l}</label>
                  <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} required={l.includes('*')} placeholder={k === 'jailTime' ? 'e.g. 5 Years, None' : ''} style={inputBase} />
                </div>
              ))}
              <div>
                <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>TYPE</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputBase}>
                  {['Felony','Misdemeanor','Infraction'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>FINE ($)</label>
                <input type="number" value={form.fine} onChange={e => setForm(f => ({ ...f, fine: e.target.value }))} min={0} style={inputBase} />
              </div>
              <div>
                <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>POINTS</label>
                <input type="number" value={form.points} onChange={e => setForm(f => ({ ...f, points: e.target.value }))} min={0} max={10} style={inputBase} />
              </div>
            </div>
            <button type="submit" style={{ width: '100%', ...blueBtn, padding: '9px', fontSize: '13px', letterSpacing: '1px' }}>
              {editCharge ? 'SAVE CHANGES' : 'ADD CHARGE'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const inputBase = { width: '100%', background: '#090b10', border: '1px solid #1e2533', color: '#d1d5db', padding: '7px 10px', fontSize: '13px', fontFamily: 'Ubuntu Mono, monospace', boxSizing: 'border-box' };
const blueBtn = { background: '#0c1a2e', border: '1px solid #3b82f6', color: '#3b82f6', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', fontWeight: 700 };
const aBtn = (bg, c) => ({ background: bg, border: `1px solid ${c}`, color: c, padding: '3px 8px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', fontWeight: 600 });
