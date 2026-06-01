import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { useResponsive } from '../hooks/useResponsive';

const INPUT_CLS = 'w-full bg-app-input border border-border-base text-cad-text px-2.5 py-1.5 text-sm box-border';
const BLUE_BTN  = 'bg-sky-950 border border-sky-700 text-sky-400 px-3.5 py-1.5 text-xs cursor-pointer font-bold';
const GHOST_BTN = 'bg-transparent border border-border-base text-slate-600 px-2.5 py-1.5 text-xs cursor-pointer';
const GREEN_BTN = 'bg-green-950 border border-green-900 text-green-400 px-3.5 py-1.5 text-xs cursor-pointer font-bold';
const S_BTN     = 'bg-app-input border border-border-base text-slate-600 px-1.5 py-0.5 text-[11px] cursor-pointer';

export default function RecordTemplates() {
  const { state, dispatch } = useCAD();
  const { customRecordTypes, civilians, vehicles, officers } = state;
  const { isMobile } = useResponsive();
  const [selected, setSelected] = useState(customRecordTypes[0] || null);
  const [showForm, setShowForm] = useState(false);
  const [tpl, setTpl] = useState({ name: '', fields: [] });
  const [newField, setNewField] = useState({ label: '', type: 'text', required: false, options: '' });
  const [fillMode, setFillMode] = useState(null);
  const [fillValues, setFillValues] = useState({});

  const addField = () => {
    if (!newField.label) return;
    const field = {
      id: `f${Date.now()}`,
      label: newField.label,
      type: newField.type,
      required: newField.required,
      ...(newField.type === 'dropdown' && { options: newField.options.split(',').map(s => s.trim()).filter(Boolean) }),
    };
    setTpl(t => ({ ...t, fields: [...t.fields, field] }));
    setNewField({ label: '', type: 'text', required: false, options: '' });
  };

  const moveField = (idx, dir) => {
    const fields = [...tpl.fields];
    const swap = idx + dir;
    if (swap < 0 || swap >= fields.length) return;
    [fields[idx], fields[swap]] = [fields[swap], fields[idx]];
    setTpl(t => ({ ...t, fields }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!tpl.name) return;
    if (tpl.id) {
      dispatch({ type: 'UPDATE_CUSTOM_RECORD_TYPE', payload: tpl });
    } else {
      dispatch({ type: 'ADD_CUSTOM_RECORD_TYPE', payload: tpl });
    }
    setShowForm(false);
    setTpl({ name: '', fields: [] });
  };

  return (
    <div className="p-3.5">
      {/* Mobile: dropdown selector */}
      {isMobile && (
        <div className="mb-3">
          <div className="flex gap-2 items-center mb-2">
            <span className="text-sky-400 text-xs font-bold tracking-[1.5px]">RECORD TYPES</span>
            <button onClick={() => { setShowForm(true); setTpl({ name: '', fields: [] }); }} className={`${BLUE_BTN} ml-auto`}>+ New</button>
          </div>
          {customRecordTypes.length > 0 && (
            <select
              value={selected?.id || ''}
              onChange={e => { setSelected(customRecordTypes.find(t => t.id === Number(e.target.value))); setFillMode(null); }}
              className={INPUT_CLS}
            >
              {customRecordTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name} ({type.fields.length} fields)</option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="flex gap-3.5" style={{ minHeight: isMobile ? 'auto' : 'calc(100vh - 80px)' }}>
        {/* Desktop sidebar */}
        {!isMobile && (
          <div className="w-[210px] shrink-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sky-400 text-xs font-bold tracking-[1.5px]">RECORD TYPES</span>
              <button onClick={() => { setShowForm(true); setTpl({ name: '', fields: [] }); }} className={BLUE_BTN}>+ New</button>
            </div>
            {customRecordTypes.map(type => (
              <div
                key={type.id}
                onClick={() => { setSelected(type); setFillMode(null); }}
                className="px-3 py-2.5 cursor-pointer mb-1 transition-colors"
                style={{
                  background: selected?.id === type.id ? '#0f172a' : '#090b10',
                  border: `1px solid ${selected?.id === type.id ? '#3b82f6' : '#1e2533'}`,
                }}
              >
                <div className="text-slate-300 text-sm font-bold">{type.name}</div>
                <div className="text-slate-700 text-[11px] mt-0.5">{type.fields.length} fields</div>
              </div>
            ))}
          </div>
        )}

        {/* Detail panel */}
        <div className="flex-1 min-w-0">
          {selected && !showForm && (
            <div>
              <div className="bg-app-input border border-border-subtle border-b-0 px-3.5 py-2 flex items-center gap-2.5 flex-wrap">
                <span className="text-slate-50 text-sm font-bold">{selected.name}</span>
                <button onClick={() => { setTpl({ ...selected, fields: [...selected.fields] }); setShowForm(true); }} className={GHOST_BTN}>Edit Template</button>
                <button onClick={() => setFillMode(selected)} className={GREEN_BTN}>+ New Record</button>
              </div>

              {/* Field definitions */}
              <div className="bg-app-card border border-border-subtle p-3.5 mb-2.5">
                <div className="text-slate-500 text-[11px] font-bold tracking-[1.5px] mb-2.5">FORM FIELDS</div>
                <div className="table-scroll">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-app-input">
                        {['#','Label','Type','Required'].map(h => (
                          <th key={h} className="px-2.5 py-1.5 text-left text-slate-500 text-[11px] font-bold tracking-wide border-b border-border-subtle">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selected.fields.map((f, i) => (
                        <tr key={f.id} className={i % 2 === 0 ? 'bg-app-card' : 'bg-[#111218]'}>
                          <td className="px-2.5 py-1.5 text-slate-700">{i + 1}</td>
                          <td className="px-2.5 py-1.5 text-slate-300">{f.label}</td>
                          <td className="px-2.5 py-1.5 text-sky-400">{f.type}</td>
                          <td className={`px-2.5 py-1.5 ${f.required ? 'text-green-400' : 'text-slate-700'}`}>{f.required ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fill form */}
              {fillMode && (
                <div className="bg-app-card border border-green-900 border-l-[3px] border-l-green-500 p-3.5">
                  <div className="text-green-400 text-xs font-bold tracking-[1.5px] mb-3.5">CREATE NEW RECORD * {selected.name}</div>
                  <div
                    className="grid gap-2.5"
                    style={{ gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}
                  >
                    {selected.fields.map(field => {
                      const v = fillValues[field.label] || '';
                      return (
                        <div key={field.id} style={field.type === 'textarea' ? { gridColumn: '1/-1' } : {}}>
                          <label className="text-slate-500 text-[11px] tracking-widest block mb-1">
                            {field.label.toUpperCase()}{field.required && <span className="text-red-400"> *</span>}
                          </label>
                          {field.type === 'text' && <input value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} className={INPUT_CLS} />}
                          {field.type === 'textarea' && <textarea value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} rows={3} className={`${INPUT_CLS} resize-y`} />}
                          {field.type === 'date' && <input type="date" value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} className={INPUT_CLS} />}
                          {field.type === 'number' && <input type="number" value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} className={INPUT_CLS} />}
                          {field.type === 'checkbox' && (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={!!v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.checked }))} className="accent-sky-500" />
                              <span className="text-slate-400 text-sm">Yes</span>
                            </label>
                          )}
                          {field.type === 'dropdown' && (
                            <select value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} className={INPUT_CLS}>
                              <option value="">-- Select --</option>
                              {field.options?.map(o => <option key={o}>{o}</option>)}
                            </select>
                          )}
                          {field.type === 'civilian_lookup' && (
                            <select value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} className={INPUT_CLS}>
                              <option value="">-- Select Civilian --</option>
                              {civilians.map(c => <option key={c.id}>{c.firstName} {c.lastName}</option>)}
                            </select>
                          )}
                          {field.type === 'vehicle_lookup' && (
                            <select value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} className={INPUT_CLS}>
                              <option value="">-- Select Vehicle --</option>
                              {vehicles.map(v => <option key={v.id}>{v.plate} * {v.make} {v.model}</option>)}
                            </select>
                          )}
                          {field.type === 'officer_lookup' && (
                            <select value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} className={INPUT_CLS}>
                              <option value="">-- Select Officer --</option>
                              {officers.map(o => <option key={o.id}>{o.badge} * {o.name}</option>)}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 mt-3.5">
                    <button onClick={() => { alert('Record saved! (Demo mode * records stored in state)'); setFillMode(null); setFillValues({}); }} className={`${GREEN_BTN} px-5 py-2 text-sm`}>SAVE RECORD</button>
                    <button onClick={() => setFillMode(null)} className={GHOST_BTN}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {(!selected && !showForm) && (
            <div className="text-slate-700 text-center mt-20 text-sm">Select a record type or create a new one.</div>
          )}
        </div>
      </div>

      {/* Template builder modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/75 z-[2000] flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-app-card border border-border-subtle p-5 max-w-[540px] w-full max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sky-400 font-bold text-sm tracking-[1.5px]">{tpl.id ? 'EDIT RECORD TYPE' : 'CREATE RECORD TYPE'}</span>
              <button type="button" onClick={() => setShowForm(false)} className="bg-transparent border-none text-slate-600 cursor-pointer text-base">X</button>
            </div>
            <div className="mb-3">
              <label className="text-slate-500 text-[11px] tracking-widest block mb-1">RECORD TYPE NAME *</label>
              <input value={tpl.name} onChange={e => setTpl(t => ({ ...t, name: e.target.value }))} required className={INPUT_CLS} />
            </div>

            <div className="text-slate-500 text-[11px] tracking-widest mb-1.5">FIELDS ({tpl.fields.length})</div>
            {tpl.fields.map((f, idx) => (
              <div key={f.id} className="bg-app-input border border-border-base px-2.5 py-1.5 mb-1 flex items-center gap-1.5 text-sm">
                <span className="text-slate-700">{idx + 1}.</span>
                <span className="text-slate-300 flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{f.label}</span>
                <span className="text-sky-400 text-[10px] shrink-0">[{f.type}]</span>
                {f.required && <span className="text-red-400 text-[10px]">*</span>}
                <button type="button" onClick={() => moveField(idx, -1)} className={S_BTN}>^</button>
                <button type="button" onClick={() => moveField(idx, 1)} className={S_BTN}>v</button>
                <button type="button" onClick={() => setTpl(t => ({ ...t, fields: t.fields.filter((_, i) => i !== idx) }))} className="bg-red-950 border border-red-900 text-red-400 px-1.5 py-0.5 text-[11px] cursor-pointer">X</button>
              </div>
            ))}

            <div className="bg-app-input border border-dashed border-border-subtle p-3 mb-3 flex flex-col gap-2">
              <div className="text-slate-500 text-[11px] tracking-widest">ADD FIELD</div>
              <div className="flex gap-1.5 flex-wrap">
                <input value={newField.label} onChange={e => setNewField(f => ({ ...f, label: e.target.value }))} placeholder="Field label" className={`${INPUT_CLS} flex-[2_1_120px]`} />
                <select value={newField.type} onChange={e => setNewField(f => ({ ...f, type: e.target.value }))} className={`${INPUT_CLS} flex-[1_1_100px]`}>
                  {['text','number','textarea','dropdown','checkbox','date','civilian_lookup','vehicle_lookup','officer_lookup'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              {newField.type === 'dropdown' && (
                <input value={newField.options} onChange={e => setNewField(f => ({ ...f, options: e.target.value }))} placeholder="Options (comma-separated)" className={INPUT_CLS} />
              )}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-slate-400 text-sm cursor-pointer">
                  <input type="checkbox" checked={newField.required} onChange={e => setNewField(f => ({ ...f, required: e.target.checked }))} className="accent-sky-500" />
                  Required
                </label>
                <button type="button" onClick={addField} className={`${BLUE_BTN} ml-auto`}>+ Add</button>
              </div>
            </div>

            <button type="submit" className={`${BLUE_BTN} w-full py-2.5 text-sm tracking-widest`}>
              SAVE RECORD TYPE
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
