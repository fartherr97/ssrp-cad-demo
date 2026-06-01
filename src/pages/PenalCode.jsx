import { useState } from 'react';
import { useCAD } from '../store/cadStore';

const TYPE_COLORS = { Felony: '#ef4444', Misdemeanor: '#fbbf24', Infraction: '#22c55e' };
const TYPE_BG     = { Felony: '#450a0a', Misdemeanor: '#431407', Infraction: '#052e16' };

const INPUT_CLS = 'w-full bg-app-input border border-border-base text-cad-text px-2.5 py-1.5 text-sm box-border';
const BLUE_BTN  = 'bg-sky-950 border border-sky-700 text-sky-400 px-3.5 py-1.5 text-xs cursor-pointer font-bold';

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
    <div className="p-3.5">
      {/* Header */}
      <div className="bg-app-input border border-border-subtle border-b-0 px-3.5 py-2 flex items-center gap-3">
        <span className="text-slate-50 text-xs font-bold tracking-[1.5px]">PENAL CODE EDITOR</span>
        <span className="text-slate-600 text-[11px]">{penalCode.length} charges defined</span>
        <button
          onClick={() => { setShowForm(true); setEditCharge(null); setForm({ category: '', code: '', name: '', type: 'Misdemeanor', fine: 0, jailTime: '', points: 0 }); }}
          className={`${BLUE_BTN} ml-auto`}
        >
          + Add Charge
        </button>
      </div>

      <div className="bg-app-card border border-border-subtle p-3.5 mb-3.5">
        {/* Filters */}
        <div className="flex gap-2 mb-3.5 flex-wrap items-center">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search charges..." className={`${INPUT_CLS} w-[200px]`} />
          <div className="flex gap-1">
            {['ALL','Felony','Misdemeanor','Infraction'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className="px-2.5 py-1 text-[11px] cursor-pointer font-bold transition-colors"
                style={{
                  background: filterType === t ? TYPE_BG[t] || '#0f172a' : 'transparent',
                  border: `1px solid ${filterType === t ? TYPE_COLORS[t] || '#3b82f6' : '#1f2937'}`,
                  color: filterType === t ? TYPE_COLORS[t] || '#3b82f6' : '#4b5563',
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className={INPUT_CLS}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Grouped charges */}
        {Object.entries(grouped).map(([cat, charges]) => (
          <div key={cat} className="mb-4">
            <div className="text-amber-400 text-xs font-bold tracking-[1.5px] mb-1.5 border-b border-border-base pb-1 flex items-center gap-2">
              {cat.toUpperCase()}
              <span className="bg-app-elevated text-sky-400 border border-border-subtle px-1.5 py-px text-[10px] font-bold">{charges.length}</span>
            </div>
            <div className="table-scroll">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-app-input">
                    {['Code','Name','Type','Fine','Jail Time','Points','Actions'].map(h => (
                      <th key={h} className="px-2.5 py-1.5 text-left text-slate-500 text-[11px] font-bold tracking-wide border-b border-border-subtle whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {charges.map((p, i) => (
                    <tr key={p.id} className={i % 2 === 0 ? 'bg-app-card' : 'bg-[#111218]'}>
                      <td className="px-2.5 py-1.5 text-sky-400 font-bold">{p.code}</td>
                      <td className="px-2.5 py-1.5 text-slate-300">{p.name}</td>
                      <td className="px-2.5 py-1.5">
                        <span
                          className="font-bold text-[11px] px-1.5 py-px"
                          style={{ color: TYPE_COLORS[p.type], background: TYPE_BG[p.type], border: `1px solid ${TYPE_COLORS[p.type]}40` }}
                        >
                          {p.type}
                        </span>
                      </td>
                      <td className={`px-2.5 py-1.5 ${p.fine > 0 ? 'text-amber-400' : 'text-slate-700'}`}>{p.fine > 0 ? `$${p.fine.toLocaleString()}` : '—'}</td>
                      <td className={`px-2.5 py-1.5 ${p.jailTime !== 'None' ? 'text-red-400' : 'text-slate-700'}`}>{p.jailTime}</td>
                      <td className={`px-2.5 py-1.5 ${p.points > 0 ? 'text-amber-400' : 'text-slate-700'}`}>{p.points}</td>
                      <td className="px-2.5 py-1.5">
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(p)}
                            className="bg-sky-950 border border-sky-800 text-sky-400 px-2 py-0.5 text-[11px] cursor-pointer font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => dispatch({ type: 'DELETE_CHARGE', payload: p.id })}
                            className="bg-red-950 border border-red-800 text-red-400 px-2 py-0.5 text-[11px] cursor-pointer font-semibold"
                          >
                            X
                          </button>
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
          <div className="text-slate-700 text-center py-10 text-sm">No charges match the current filters.</div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/75 z-[2000] flex items-center justify-center">
          <form onSubmit={handleSave} className="bg-app-card border border-border-subtle p-5 max-w-[480px] w-[90%]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sky-400 font-bold text-sm tracking-[1.5px]">{editCharge ? 'EDIT CHARGE' : 'ADD CHARGE'}</span>
              <button type="button" onClick={() => { setShowForm(false); setEditCharge(null); }} className="bg-transparent border-none text-slate-600 cursor-pointer text-base">X</button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-3.5">
              {[['CATEGORY *','category'],['CODE *','code'],['CHARGE NAME *','name'],['JAIL TIME','jailTime']].map(([l,k]) => (
                <div key={k} style={k === 'name' || k === 'category' ? { gridColumn: '1/-1' } : {}}>
                  <label className="text-slate-500 text-[11px] tracking-widest block mb-1">{l}</label>
                  <input
                    value={form[k]}
                    onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    required={l.includes('*')}
                    placeholder={k === 'jailTime' ? 'e.g. 5 Years, None' : ''}
                    className={INPUT_CLS}
                  />
                </div>
              ))}
              <div>
                <label className="text-slate-500 text-[11px] tracking-widest block mb-1">TYPE</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={INPUT_CLS}>
                  {['Felony','Misdemeanor','Infraction'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-500 text-[11px] tracking-widest block mb-1">FINE ($)</label>
                <input type="number" value={form.fine} onChange={e => setForm(f => ({ ...f, fine: e.target.value }))} min={0} className={INPUT_CLS} />
              </div>
              <div>
                <label className="text-slate-500 text-[11px] tracking-widest block mb-1">POINTS</label>
                <input type="number" value={form.points} onChange={e => setForm(f => ({ ...f, points: e.target.value }))} min={0} max={10} className={INPUT_CLS} />
              </div>
            </div>
            <button type="submit" className={`${BLUE_BTN} w-full py-2.5 text-sm tracking-widest`}>
              {editCharge ? 'SAVE CHANGES' : 'ADD CHARGE'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
