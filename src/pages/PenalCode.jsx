import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';

const TYPE_COLORS = { Felony: '#ef4444', Misdemeanor: '#f59e0b', Infraction: '#22c55e' };

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

  const base = { background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', color: '#e2e8f0', padding: '7px 10px', fontSize: '12px', fontFamily: 'Ubuntu Mono, monospace', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '16px', fontFamily: 'Ubuntu Mono, monospace' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <span style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 700, letterSpacing: '1px' }}>⚖ PENAL CODE EDITOR</span>
        <span style={{ color: '#475569', fontSize: '12px' }}>{penalCode.length} charges defined</span>
        <button onClick={() => { setShowForm(true); setEditCharge(null); setForm({ category: '', code: '', name: '', type: 'Misdemeanor', fine: 0, jailTime: '', points: 0 }); }}
          style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '6px 14px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', fontWeight: 700, marginLeft: 'auto' }}>
          + Add Charge
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search charges..." style={{ background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', color: '#e2e8f0', padding: '6px 10px', fontSize: '12px', fontFamily: 'Ubuntu Mono, monospace', width: '200px' }} />
        <div style={{ display: 'flex', gap: '4px' }}>
          {['ALL','Felony','Misdemeanor','Infraction'].map(t => (
            <button key={t} onClick={() => setFilterType(t)} style={{ background: filterType === t ? '#1e4080' : 'transparent', border: `1px solid ${filterType === t ? '#4a9eff' : '#1e3060'}`, borderRadius: '4px', color: filterType === t ? '#4a9eff' : '#64748b', padding: '5px 12px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>
              {t}
            </button>
          ))}
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', color: '#e2e8f0', padding: '6px 10px', fontSize: '12px', fontFamily: 'Ubuntu Mono, monospace' }}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Grouped charges */}
      {Object.entries(grouped).map(([cat, charges]) => (
        <div key={cat} style={{ marginBottom: '20px' }}>
          <div style={{ color: '#e2a84b', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px', borderBottom: '1px solid #1e3060', paddingBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {cat}
            <span style={{ background: '#1e4080', color: '#4a9eff', borderRadius: '4px', padding: '1px 6px', fontSize: '10px' }}>{charges.length}</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#0a1a35' }}>
                {['Code','Name','Type','Fine','Jail Time','Points','Actions'].map(h => (
                  <th key={h} style={{ padding: '7px 10px', textAlign: 'left', color: '#7a9ab8', fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #1e4080' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {charges.map((p, i) => (
                <tr key={p.id} style={{ background: i % 2 === 0 ? '#080f1e' : '#0a1525' }}>
                  <td style={{ padding: '6px 10px', color: '#60a5fa', fontWeight: 700 }}>{p.code}</td>
                  <td style={{ padding: '6px 10px', color: '#e2e8f0' }}>{p.name}</td>
                  <td style={{ padding: '6px 10px' }}>
                    <span style={{ color: TYPE_COLORS[p.type], fontWeight: 700, fontSize: '11px' }}>{p.type}</span>
                  </td>
                  <td style={{ padding: '6px 10px', color: p.fine > 0 ? '#f59e0b' : '#475569' }}>{p.fine > 0 ? `$${p.fine.toLocaleString()}` : '—'}</td>
                  <td style={{ padding: '6px 10px', color: p.jailTime !== 'None' ? '#ef4444' : '#475569' }}>{p.jailTime}</td>
                  <td style={{ padding: '6px 10px', color: p.points > 0 ? '#f59e0b' : '#475569' }}>{p.points}</td>
                  <td style={{ padding: '6px 10px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => startEdit(p)} style={btn('#1e4080','#4a9eff')}>Edit</button>
                      <button onClick={() => dispatch({ type: 'DELETE_CHARGE', payload: p.id })} style={btn('#7f1d1d','#ef4444')}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {Object.keys(grouped).length === 0 && (
        <div style={{ color: '#334155', textAlign: 'center', padding: '40px', fontSize: '13px' }}>No charges match the current filters.</div>
      )}

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleSave} style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '8px', padding: '24px', maxWidth: '500px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#4a9eff', fontWeight: 700, fontSize: '14px', fontFamily: 'Ubuntu Mono, monospace' }}>{editCharge ? 'EDIT CHARGE' : 'ADD CHARGE'}</span>
              <button type="button" onClick={() => { setShowForm(false); setEditCharge(null); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[['CATEGORY *','category'],['CODE *','code'],['CHARGE NAME *','name'],['JAIL TIME','jailTime']].map(([l,k]) => (
                <div key={k} style={k === 'name' || k === 'category' ? { gridColumn: '1/-1' } : {}}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>{l}</label>
                  <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} required={l.includes('*')} placeholder={k === 'jailTime' ? 'e.g. 5 Years, None' : ''} style={base} />
                </div>
              ))}
              <div>
                <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>TYPE</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={base}>
                  {['Felony','Misdemeanor','Infraction'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>FINE ($)</label>
                <input type="number" value={form.fine} onChange={e => setForm(f => ({ ...f, fine: e.target.value }))} min={0} style={base} />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>POINTS</label>
                <input type="number" value={form.points} onChange={e => setForm(f => ({ ...f, points: e.target.value }))} min={0} max={10} style={base} />
              </div>
            </div>
            <button type="submit" style={{ width: '100%', background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>
              {editCharge ? 'SAVE CHANGES' : 'ADD CHARGE'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const btn = (bg, c) => ({ background: bg, border: `1px solid ${c}`, borderRadius: '3px', color: c, padding: '4px 8px', fontSize: '10px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', fontWeight: 600 });
