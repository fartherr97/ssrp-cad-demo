import { useState } from 'react';
import { useCAD } from '../store/cadStore';

export default function RecordTemplates() {
  const { state, dispatch } = useCAD();
  const { customRecordTypes, civilians, vehicles, officers } = state;
  const [selected, setSelected] = useState(customRecordTypes[0] || null);
  const [showForm, setShowForm] = useState(false);
  const [tpl, setTpl] = useState({ name: '', fields: [] });
  const [newField, setNewField] = useState({ label: '', type: 'text', required: false, options: '' });
  const [fillMode, setFillMode] = useState(null);
  const [fillValues, setFillValues] = useState({});

  const base = { background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', color: '#e2e8f0', padding: '7px 10px', fontSize: '12px', fontFamily: 'Ubuntu Mono, monospace', width: '100%', boxSizing: 'border-box' };

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
    <div style={{ padding: '16px', fontFamily: 'Ubuntu Mono, monospace', display: 'flex', gap: '16px', minHeight: 'calc(100vh - 80px)' }}>
      {/* Type list */}
      <div style={{ width: '220px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ color: '#4a9eff', fontSize: '13px', fontWeight: 700 }}>RECORD TYPES</span>
          <button onClick={() => { setShowForm(true); setTpl({ name: '', fields: [] }); }} style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>+ New</button>
        </div>
        {customRecordTypes.map(type => (
          <div key={type.id} onClick={() => { setSelected(type); setFillMode(null); }}
            style={{ background: selected?.id === type.id ? '#0d2545' : '#0a1525', border: `1px solid ${selected?.id === type.id ? '#4a9eff' : '#1e3060'}`, borderRadius: '4px', padding: '10px 12px', cursor: 'pointer', marginBottom: '6px' }}>
            <div style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 700 }}>📁 {type.name}</div>
            <div style={{ color: '#475569', fontSize: '11px', marginTop: '3px' }}>{type.fields.length} fields</div>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      <div style={{ flex: 1 }}>
        {selected && !showForm && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ color: '#4a9eff', fontSize: '15px', fontWeight: 700 }}>📁 {selected.name}</span>
              <button onClick={() => { setTpl({ ...selected, fields: [...selected.fields] }); setShowForm(true); }} style={{ background: 'transparent', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '4px 12px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>Edit Template</button>
              <button onClick={() => setFillMode(selected)} style={{ background: '#1e4080', border: '1px solid #22c55e', borderRadius: '4px', color: '#22c55e', padding: '4px 12px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>+ New Record</button>
            </div>

            {/* Field definitions */}
            <div style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ color: '#4a9eff', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px' }}>FORM FIELDS</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#0a1a35' }}>
                    {['#','Label','Type','Required'].map(h => (
                      <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#4a9eff', fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #1e4080' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selected.fields.map((f, i) => (
                    <tr key={f.id} style={{ background: i % 2 === 0 ? '#080f1e' : '#0a1525' }}>
                      <td style={{ padding: '6px 10px', color: '#475569' }}>{i + 1}</td>
                      <td style={{ padding: '6px 10px', color: '#e2e8f0' }}>{f.label}</td>
                      <td style={{ padding: '6px 10px', color: '#4a9eff' }}>{f.type}</td>
                      <td style={{ padding: '6px 10px', color: f.required ? '#22c55e' : '#475569' }}>{f.required ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Fill form */}
            {fillMode && (
              <div style={{ background: '#0d1f3c', border: '1px solid #22c55e', borderRadius: '6px', padding: '16px' }}>
                <div style={{ color: '#22c55e', fontSize: '12px', fontWeight: 700, marginBottom: '16px' }}>CREATE NEW RECORD — {selected.name}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {selected.fields.map(field => {
                    const v = fillValues[field.label] || '';
                    return (
                      <div key={field.id} style={field.type === 'textarea' ? { gridColumn: '1/-1' } : {}}>
                        <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>{field.label.toUpperCase()}{field.required && <span style={{ color: '#ef4444' }}> *</span>}</label>
                        {field.type === 'text' && <input value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} style={base} />}
                        {field.type === 'textarea' && <textarea value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} rows={3} style={{ ...base, resize: 'vertical' }} />}
                        {field.type === 'date' && <input type="date" value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} style={base} />}
                        {field.type === 'number' && <input type="number" value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} style={base} />}
                        {field.type === 'checkbox' && (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={!!v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.checked }))} style={{ accentColor: '#4a9eff' }} />
                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>Yes</span>
                          </label>
                        )}
                        {field.type === 'dropdown' && (
                          <select value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} style={base}>
                            <option value="">-- Select --</option>
                            {field.options?.map(o => <option key={o}>{o}</option>)}
                          </select>
                        )}
                        {field.type === 'civilian_lookup' && (
                          <select value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} style={base}>
                            <option value="">-- Select Civilian --</option>
                            {civilians.map(c => <option key={c.id}>{c.firstName} {c.lastName}</option>)}
                          </select>
                        )}
                        {field.type === 'vehicle_lookup' && (
                          <select value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} style={base}>
                            <option value="">-- Select Vehicle --</option>
                            {vehicles.map(v => <option key={v.id}>{v.plate} — {v.make} {v.model}</option>)}
                          </select>
                        )}
                        {field.type === 'officer_lookup' && (
                          <select value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} style={base}>
                            <option value="">-- Select Officer --</option>
                            {officers.map(o => <option key={o.id}>{o.badge} — {o.name}</option>)}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button onClick={() => { alert('Record saved! (Demo mode — records stored in state)'); setFillMode(null); setFillValues({}); }} style={{ background: '#14532d', border: '1px solid #22c55e', borderRadius: '4px', color: '#22c55e', padding: '10px 20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>SAVE RECORD</button>
                  <button onClick={() => setFillMode(null)} style={{ background: 'transparent', border: '1px solid #1e3060', borderRadius: '4px', color: '#64748b', padding: '10px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {(!selected && !showForm) && (
          <div style={{ color: '#334155', textAlign: 'center', marginTop: '80px', fontSize: '13px' }}>Select a record type or create a new one.</div>
        )}
      </div>

      {/* Template builder modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleSave} style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '8px', padding: '24px', maxWidth: '560px', width: '90%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#4a9eff', fontWeight: 700, fontSize: '14px', fontFamily: 'Ubuntu Mono, monospace' }}>{tpl.id ? 'EDIT RECORD TYPE' : 'CREATE RECORD TYPE'}</span>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>RECORD TYPE NAME *</label>
              <input value={tpl.name} onChange={e => setTpl(t => ({ ...t, name: e.target.value }))} required style={base} />
            </div>

            <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '8px' }}>FIELDS ({tpl.fields.length})</div>
            {tpl.fields.map((f, idx) => (
              <div key={f.id} style={{ background: '#060d1a', border: '1px solid #1e3060', borderRadius: '4px', padding: '8px 10px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>{idx + 1}.</span>
                <span style={{ color: '#e2e8f0', flex: 1 }}>{f.label}</span>
                <span style={{ color: '#4a9eff', fontSize: '10px' }}>[{f.type}]</span>
                {f.required && <span style={{ color: '#ef4444', fontSize: '10px' }}>*</span>}
                <button type="button" onClick={() => moveField(idx, -1)} style={sBtn()}>↑</button>
                <button type="button" onClick={() => moveField(idx, 1)} style={sBtn()}>↓</button>
                <button type="button" onClick={() => setTpl(t => ({ ...t, fields: t.fields.filter((_, i) => i !== idx) }))} style={{ ...sBtn(), background: '#7f1d1d', color: '#ef4444', border: '1px solid #ef4444' }}>✕</button>
              </div>
            ))}

            <div style={{ background: '#060d1a', border: '1px dashed #1e4080', borderRadius: '4px', padding: '12px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '11px' }}>ADD FIELD</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input value={newField.label} onChange={e => setNewField(f => ({ ...f, label: e.target.value }))} placeholder="Field label" style={{ ...base, flex: 2 }} />
                <select value={newField.type} onChange={e => setNewField(f => ({ ...f, type: e.target.value }))} style={{ ...base, flex: 1 }}>
                  {['text','number','textarea','dropdown','checkbox','date','civilian_lookup','vehicle_lookup','officer_lookup'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              {newField.type === 'dropdown' && (
                <input value={newField.options} onChange={e => setNewField(f => ({ ...f, options: e.target.value }))} placeholder="Options (comma-separated)" style={base} />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={newField.required} onChange={e => setNewField(f => ({ ...f, required: e.target.checked }))} style={{ accentColor: '#4a9eff' }} />
                  Required
                </label>
                <button type="button" onClick={addField} style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '5px 12px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', marginLeft: 'auto' }}>+ Add</button>
              </div>
            </div>

            <button type="submit" style={{ width: '100%', background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>
              SAVE RECORD TYPE
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const sBtn = () => ({ background: '#0a1525', border: '1px solid #1e3060', borderRadius: '3px', color: '#64748b', padding: '2px 6px', fontSize: '10px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' });
