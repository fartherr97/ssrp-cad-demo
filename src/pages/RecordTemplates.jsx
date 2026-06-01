import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { useResponsive } from '../hooks/useResponsive';

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
    <div style={{ padding: '14px', fontFamily: 'Ubuntu Mono, monospace' }}>
      {/* Mobile: dropdown selector */}
      {isMobile && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#3b82f6', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px' }}>RECORD TYPES</span>
            <button onClick={() => { setShowForm(true); setTpl({ name: '', fields: [] }); }} style={{ ...blueBtn, marginLeft: 'auto', fontSize: '11px', padding: '3px 10px' }}>+ New</button>
          </div>
          {customRecordTypes.length > 0 && (
            <select
              value={selected?.id || ''}
              onChange={e => { setSelected(customRecordTypes.find(t => t.id === Number(e.target.value))); setFillMode(null); }}
              style={inputBase}
            >
              {customRecordTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name} ({type.fields.length} fields)</option>
              ))}
            </select>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '14px', minHeight: isMobile ? 'auto' : 'calc(100vh - 80px)' }}>
        {/* Desktop sidebar */}
        {!isMobile && (
          <div style={{ width: '210px', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#3b82f6', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px' }}>RECORD TYPES</span>
              <button onClick={() => { setShowForm(true); setTpl({ name: '', fields: [] }); }} style={{ ...blueBtn, fontSize: '11px', padding: '3px 10px' }}>+ New</button>
            </div>
            {customRecordTypes.map(type => (
              <div key={type.id} onClick={() => { setSelected(type); setFillMode(null); }}
                style={{ background: selected?.id === type.id ? '#0f172a' : '#090b10', border: `1px solid ${selected?.id === type.id ? '#3b82f6' : '#1e2533'}`, padding: '9px 12px', cursor: 'pointer', marginBottom: '4px' }}>
                <div style={{ color: '#d1d5db', fontSize: '13px', fontWeight: 700 }}>{type.name}</div>
                <div style={{ color: '#374151', fontSize: '11px', marginTop: '2px' }}>{type.fields.length} fields</div>
              </div>
            ))}
          </div>
        )}

        {/* Detail panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selected && !showForm && (
            <div>
              <div style={{ background: '#0b0d14', border: '1px solid #1e2533', borderBottom: 'none', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ color: '#f9fafb', fontSize: '13px', fontWeight: 700 }}>{selected.name}</span>
                <button onClick={() => { setTpl({ ...selected, fields: [...selected.fields] }); setShowForm(true); }} style={{ ...ghostBtn, fontSize: '11px', padding: '3px 10px' }}>Edit Template</button>
                <button onClick={() => setFillMode(selected)} style={{ ...greenBtn, fontSize: '11px', padding: '3px 10px' }}>+ New Record</button>
              </div>

              {/* Field definitions */}
              <div style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '14px', marginBottom: '10px' }}>
                <div style={{ color: '#6b7280', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '10px' }}>FORM FIELDS</div>
                <div className="table-scroll">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#0b0d14' }}>
                        {['#','Label','Type','Required'].map(h => (
                          <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#6b7280', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', borderBottom: '1px solid #1e2533' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selected.fields.map((f, i) => (
                        <tr key={f.id} style={{ background: i % 2 === 0 ? '#0d1117' : '#111218' }}>
                          <td style={{ padding: '6px 10px', color: '#374151' }}>{i + 1}</td>
                          <td style={{ padding: '6px 10px', color: '#d1d5db' }}>{f.label}</td>
                          <td style={{ padding: '6px 10px', color: '#3b82f6' }}>{f.type}</td>
                          <td style={{ padding: '6px 10px', color: f.required ? '#22c55e' : '#374151' }}>{f.required ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fill form */}
              {fillMode && (
                <div style={{ background: '#0d1117', border: '1px solid #166534', borderLeft: '3px solid #22c55e', padding: '14px' }}>
                  <div style={{ color: '#22c55e', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '14px' }}>CREATE NEW RECORD — {selected.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                    {selected.fields.map(field => {
                      const v = fillValues[field.label] || '';
                      return (
                        <div key={field.id} style={field.type === 'textarea' ? { gridColumn: '1/-1' } : {}}>
                          <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>
                            {field.label.toUpperCase()}{field.required && <span style={{ color: '#ef4444' }}> *</span>}
                          </label>
                          {field.type === 'text' && <input value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} style={inputBase} />}
                          {field.type === 'textarea' && <textarea value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} rows={3} style={{ ...inputBase, resize: 'vertical' }} />}
                          {field.type === 'date' && <input type="date" value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} style={inputBase} />}
                          {field.type === 'number' && <input type="number" value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} style={inputBase} />}
                          {field.type === 'checkbox' && (
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={!!v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.checked }))} style={{ accentColor: '#3b82f6' }} />
                              <span style={{ color: '#9ca3af', fontSize: '13px' }}>Yes</span>
                            </label>
                          )}
                          {field.type === 'dropdown' && (
                            <select value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} style={inputBase}>
                              <option value="">-- Select --</option>
                              {field.options?.map(o => <option key={o}>{o}</option>)}
                            </select>
                          )}
                          {field.type === 'civilian_lookup' && (
                            <select value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} style={inputBase}>
                              <option value="">-- Select Civilian --</option>
                              {civilians.map(c => <option key={c.id}>{c.firstName} {c.lastName}</option>)}
                            </select>
                          )}
                          {field.type === 'vehicle_lookup' && (
                            <select value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} style={inputBase}>
                              <option value="">-- Select Vehicle --</option>
                              {vehicles.map(v => <option key={v.id}>{v.plate} — {v.make} {v.model}</option>)}
                            </select>
                          )}
                          {field.type === 'officer_lookup' && (
                            <select value={v} onChange={e => setFillValues(fv => ({ ...fv, [field.label]: e.target.value }))} style={inputBase}>
                              <option value="">-- Select Officer --</option>
                              {officers.map(o => <option key={o.id}>{o.badge} — {o.name}</option>)}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <button onClick={() => { alert('Record saved! (Demo mode — records stored in state)'); setFillMode(null); setFillValues({}); }} style={{ ...greenBtn, padding: '8px 20px', fontSize: '13px' }}>SAVE RECORD</button>
                    <button onClick={() => setFillMode(null)} style={ghostBtn}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {(!selected && !showForm) && (
            <div style={{ color: '#374151', textAlign: 'center', marginTop: '80px', fontSize: '14px' }}>Select a record type or create a new one.</div>
          )}
        </div>
      </div>

      {/* Template builder modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <form onSubmit={handleSave} style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '22px', maxWidth: '540px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '13px', letterSpacing: '1.5px', fontFamily: 'Ubuntu Mono, monospace' }}>{tpl.id ? 'EDIT RECORD TYPE' : 'CREATE RECORD TYPE'}</span>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '16px' }}>X</button>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>RECORD TYPE NAME *</label>
              <input value={tpl.name} onChange={e => setTpl(t => ({ ...t, name: e.target.value }))} required style={inputBase} />
            </div>

            <div style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', marginBottom: '6px' }}>FIELDS ({tpl.fields.length})</div>
            {tpl.fields.map((f, idx) => (
              <div key={f.id} style={{ background: '#090b10', border: '1px solid #1f2937', padding: '7px 10px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <span style={{ color: '#374151' }}>{idx + 1}.</span>
                <span style={{ color: '#d1d5db', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.label}</span>
                <span style={{ color: '#3b82f6', fontSize: '10px', flexShrink: 0 }}>[{f.type}]</span>
                {f.required && <span style={{ color: '#ef4444', fontSize: '10px' }}>*</span>}
                <button type="button" onClick={() => moveField(idx, -1)} style={sBtn}>^</button>
                <button type="button" onClick={() => moveField(idx, 1)} style={sBtn}>v</button>
                <button type="button" onClick={() => setTpl(t => ({ ...t, fields: t.fields.filter((_, i) => i !== idx) }))} style={{ ...sBtn, background: '#450a0a', color: '#ef4444', border: '1px solid #991b1b' }}>X</button>
              </div>
            ))}

            <div style={{ background: '#090b10', border: '1px dashed #1e2533', padding: '12px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px' }}>ADD FIELD</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <input value={newField.label} onChange={e => setNewField(f => ({ ...f, label: e.target.value }))} placeholder="Field label" style={{ ...inputBase, flex: '2 1 120px' }} />
                <select value={newField.type} onChange={e => setNewField(f => ({ ...f, type: e.target.value }))} style={{ ...inputBase, flex: '1 1 100px' }}>
                  {['text','number','textarea','dropdown','checkbox','date','civilian_lookup','vehicle_lookup','officer_lookup'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              {newField.type === 'dropdown' && (
                <input value={newField.options} onChange={e => setNewField(f => ({ ...f, options: e.target.value }))} placeholder="Options (comma-separated)" style={inputBase} />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={newField.required} onChange={e => setNewField(f => ({ ...f, required: e.target.checked }))} style={{ accentColor: '#3b82f6' }} />
                  Required
                </label>
                <button type="button" onClick={addField} style={{ ...blueBtn, marginLeft: 'auto', fontSize: '11px', padding: '4px 12px' }}>+ Add</button>
              </div>
            </div>

            <button type="submit" style={{ width: '100%', ...blueBtn, padding: '9px', fontSize: '13px', letterSpacing: '1px' }}>
              SAVE RECORD TYPE
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const inputBase = { width: '100%', background: '#090b10', border: '1px solid #1e2533', color: '#d1d5db', padding: '7px 10px', fontSize: '13px', fontFamily: 'Ubuntu Mono, monospace', boxSizing: 'border-box' };
const blueBtn = { background: '#0c1a2e', border: '1px solid #3b82f6', color: '#3b82f6', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', fontWeight: 700 };
const ghostBtn = { background: 'transparent', border: '1px solid #1f2937', color: '#4b5563', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' };
const greenBtn = { background: '#052e16', border: '1px solid #166534', color: '#22c55e', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', fontWeight: 700 };
const sBtn = { background: '#0b0d14', border: '1px solid #1f2937', color: '#4b5563', padding: '2px 6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' };
