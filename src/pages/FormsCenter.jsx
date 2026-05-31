import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';

export default function FormsCenter() {
  const { state, dispatch } = useCAD();
  const { reports, reportTemplates, currentUser, civilians, officers } = state;
  const [activeTab, setActiveTab] = useState('submitted');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [editTemplate, setEditTemplate] = useState(null);
  const [reviewReport, setReviewReport] = useState(null);
  const isAdmin = currentUser?.role === 'admin';

  const tabs = ['submitted', 'create', ...(isAdmin ? ['builder', 'review'] : [])];

  const handleSubmitReport = (e) => {
    e.preventDefault();
    dispatch({
      type: 'ADD_REPORT',
      payload: {
        type: selectedTemplate.name,
        caseNumber: `ADPS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        officerBadge: currentUser?.badge || 'UNKN',
        summary: formValues['Narrative'] || formValues['Full Narrative'] || formValues['Supplement Narrative'] || 'Submitted via CAD',
        callId: null,
        civilianId: null,
      }
    });
    setSelectedTemplate(null);
    setFormValues({});
    setActiveTab('submitted');
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'Courier New, monospace' }}>
      <div style={{ color: '#4a9eff', fontSize: '16px', fontWeight: 700, letterSpacing: '2px', marginBottom: '16px' }}>REPORT CENTER</div>

      <TabBar tabs={tabs} active={activeTab} setActive={(t) => { setActiveTab(t); setSelectedTemplate(null); }} />

      {activeTab === 'submitted' && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <StatusSummary label="Total" count={reports.length} color="#4a9eff" />
            <StatusSummary label="Pending" count={reports.filter(r => r.status === 'Submitted').length} color="#f59e0b" />
            <StatusSummary label="Approved" count={reports.filter(r => r.status === 'Approved').length} color="#22c55e" />
            <StatusSummary label="Review" count={reports.filter(r => r.status === 'Pending Review').length} color="#ef4444" />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#0a1a35' }}>
                {['Case #','Type','Officer','Date','Status','Call','Actions'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#4a9eff', fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #1e4080' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={r.id} style={{ background: i % 2 === 0 ? '#080f1e' : '#0a1525' }}>
                  <td style={{ padding: '7px 10px', color: '#60a5fa', fontWeight: 700 }}>{r.caseNumber}</td>
                  <td style={{ padding: '7px 10px', color: '#e2e8f0' }}>{r.type}</td>
                  <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{r.officerBadge}</td>
                  <td style={{ padding: '7px 10px', color: '#475569' }}>{r.date}</td>
                  <td style={{ padding: '7px 10px' }}><StatusBadge status={r.status} /></td>
                  <td style={{ padding: '7px 10px', color: '#60a5fa' }}>{r.callId || '—'}</td>
                  <td style={{ padding: '7px 10px' }}>
                    <button onClick={() => setReviewReport(r)} style={smallBtn('#1e4080','#4a9eff')}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'create' && (
        <div style={{ marginTop: '16px' }}>
          {!selectedTemplate ? (
            <>
              <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '12px' }}>Select a report template to begin:</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {reportTemplates.map(t => (
                  <div key={t.id} onClick={() => setSelectedTemplate(t)}
                    style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '6px', padding: '16px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#4a9eff'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#1e4080'}
                  >
                    <div style={{ color: '#4a9eff', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>📋 {t.name}</div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>{t.fields.length} fields</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmitReport}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <button type="button" onClick={() => setSelectedTemplate(null)} style={smallBtn('#1e4080','#94a3b8')}>← Back</button>
                <span style={{ color: '#4a9eff', fontWeight: 700, fontSize: '14px' }}>{selectedTemplate.name}</span>
              </div>
              <div style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '6px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {selectedTemplate.fields.map(field => (
                  <ReportField key={field.id} field={field} value={formValues[field.label] || ''} onChange={v => setFormValues(fv => ({ ...fv, [field.label]: v }))} civilians={civilians} officers={officers} />
                ))}
                <button type="submit" style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Courier New, monospace', letterSpacing: '2px', marginTop: '8px' }}>
                  SUBMIT REPORT
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {activeTab === 'builder' && isAdmin && (
        <TemplateBuilder reportTemplates={reportTemplates} dispatch={dispatch} editTemplate={editTemplate} setEditTemplate={setEditTemplate} />
      )}

      {activeTab === 'review' && isAdmin && (
        <ReviewQueue reports={reports} dispatch={dispatch} />
      )}

      {/* Report detail modal */}
      {reviewReport && (
        <Modal onClose={() => setReviewReport(null)} title={`${reviewReport.type} — ${reviewReport.caseNumber}`}>
          <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Field2 label="Officer" value={reviewReport.officerBadge} />
            <Field2 label="Date" value={reviewReport.date} />
            <Field2 label="Status" value={<StatusBadge status={reviewReport.status} />} />
            <Field2 label="Call" value={reviewReport.callId || '—'} />
            <div style={{ background: '#060d1a', border: '1px solid #1e3060', borderRadius: '4px', padding: '12px', color: '#94a3b8', lineHeight: '1.6' }}>
              {reviewReport.summary}
            </div>
            {isAdmin && reviewReport.status === 'Submitted' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button onClick={() => { dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id: reviewReport.id, status: 'Approved' } }); setReviewReport(null); }} style={{ ...smallBtn('#14532d','#22c55e'), padding: '8px 16px', flex: 1, fontSize: '12px' }}>✓ Approve</button>
                <button onClick={() => { dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id: reviewReport.id, status: 'Denied' } }); setReviewReport(null); }} style={{ ...smallBtn('#7f1d1d','#ef4444'), padding: '8px 16px', flex: 1, fontSize: '12px' }}>✗ Deny</button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function ReportField({ field, value, onChange, civilians, officers }) {
  const base = { background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', color: '#e2e8f0', padding: '7px 10px', fontSize: '12px', fontFamily: 'Courier New, monospace', width: '100%', boxSizing: 'border-box' };
  return (
    <div>
      <label style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '5px' }}>
        {field.label.toUpperCase()} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {field.type === 'textarea' && <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} required={field.required} style={{ ...base, resize: 'vertical' }} />}
      {field.type === 'text' && <input value={value} onChange={e => onChange(e.target.value)} required={field.required} style={base} />}
      {field.type === 'date' && <input type="date" value={value} onChange={e => onChange(e.target.value)} required={field.required} style={base} />}
      {field.type === 'datetime' && <input type="datetime-local" value={value} onChange={e => onChange(e.target.value)} required={field.required} style={base} />}
      {field.type === 'checkbox' && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} style={{ accentColor: '#4a9eff' }} />
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Yes</span>
        </label>
      )}
      {field.type === 'dropdown' && (
        <select value={value} onChange={e => onChange(e.target.value)} required={field.required} style={base}>
          <option value="">-- Select --</option>
          {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
      {field.type === 'civilian_lookup' && (
        <select value={value} onChange={e => onChange(e.target.value)} required={field.required} style={base}>
          <option value="">-- Select Civilian --</option>
          {civilians.map(c => <option key={c.id} value={`${c.firstName} ${c.lastName}`}>{c.firstName} {c.lastName}</option>)}
        </select>
      )}
      {field.type === 'badge_lookup' && (
        <select value={value} onChange={e => onChange(e.target.value)} required={field.required} style={base}>
          <option value="">-- Select Officer --</option>
          {officers.map(o => <option key={o.id} value={o.badge}>{o.badge} — {o.name}</option>)}
        </select>
      )}
    </div>
  );
}

function TemplateBuilder({ reportTemplates, dispatch, editTemplate, setEditTemplate }) {
  const [tpl, setTpl] = useState(editTemplate || { name: '', fields: [] });
  const [newField, setNewField] = useState({ label: '', type: 'text', required: false, options: '' });

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
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= fields.length) return;
    [fields[idx], fields[swapIdx]] = [fields[swapIdx], fields[idx]];
    setTpl(t => ({ ...t, fields }));
  };

  const removeField = (idx) => setTpl(t => ({ ...t, fields: t.fields.filter((_, i) => i !== idx) }));

  const handleSave = () => {
    if (!tpl.name) return;
    if (tpl.id) {
      dispatch({ type: 'UPDATE_REPORT_TEMPLATE', payload: tpl });
    } else {
      dispatch({ type: 'ADD_REPORT_TEMPLATE', payload: tpl });
    }
    setTpl({ name: '', fields: [] });
    setEditTemplate(null);
  };

  const base = { background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', color: '#e2e8f0', padding: '7px 10px', fontSize: '12px', fontFamily: 'Courier New, monospace' };

  return (
    <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <div>
        <div style={{ color: '#4a9eff', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px' }}>EXISTING TEMPLATES</div>
        {reportTemplates.map(t => (
          <div key={t.id} style={{ background: '#0a1525', border: '1px solid #1e3060', borderRadius: '4px', padding: '10px 12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <div>
              <span style={{ color: '#e2e8f0' }}>{t.name}</span>
              <span style={{ color: '#475569', marginLeft: '8px' }}>{t.fields.length} fields</span>
            </div>
            <button onClick={() => { setTpl({ ...t }); }} style={smallBtn('#1e4080','#4a9eff')}>Edit</button>
          </div>
        ))}
      </div>
      <div>
        <div style={{ color: '#4a9eff', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px' }}>{tpl.id ? 'EDIT TEMPLATE' : 'NEW TEMPLATE'}</div>
        <div style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>TEMPLATE NAME</label>
            <input value={tpl.name} onChange={e => setTpl(t => ({ ...t, name: e.target.value }))} style={{ ...base, width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '8px' }}>FIELDS ({tpl.fields.length})</div>
            {tpl.fields.map((f, idx) => (
              <div key={f.id} style={{ background: '#060d1a', border: '1px solid #1e3060', borderRadius: '4px', padding: '8px 10px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>{idx + 1}.</span>
                <span style={{ color: '#e2e8f0', flex: 1 }}>{f.label}</span>
                <span style={{ color: '#4a9eff', fontSize: '10px' }}>[{f.type}]</span>
                {f.required && <span style={{ color: '#ef4444', fontSize: '10px' }}>*</span>}
                <button onClick={() => moveField(idx, -1)} style={{ ...smallBtn('#0a1525','#64748b'), padding: '2px 6px' }}>↑</button>
                <button onClick={() => moveField(idx, 1)} style={{ ...smallBtn('#0a1525','#64748b'), padding: '2px 6px' }}>↓</button>
                <button onClick={() => removeField(idx)} style={{ ...smallBtn('#7f1d1d','#ef4444'), padding: '2px 6px' }}>✕</button>
              </div>
            ))}
          </div>
          <div style={{ background: '#060d1a', border: '1px dashed #1e4080', borderRadius: '4px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>ADD FIELD</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input value={newField.label} onChange={e => setNewField(f => ({ ...f, label: e.target.value }))} placeholder="Field label" style={{ ...base, flex: 2 }} />
              <select value={newField.type} onChange={e => setNewField(f => ({ ...f, type: e.target.value }))} style={{ ...base, flex: 1 }}>
                {['text','textarea','dropdown','checkbox','date','datetime','badge_lookup','civilian_lookup'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {newField.type === 'dropdown' && (
              <input value={newField.options} onChange={e => setNewField(f => ({ ...f, options: e.target.value }))} placeholder="Options (comma-separated)" style={{ ...base, width: '100%', boxSizing: 'border-box' }} />
            )}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={newField.required} onChange={e => setNewField(f => ({ ...f, required: e.target.checked }))} style={{ accentColor: '#4a9eff' }} />
                Required
              </label>
              <button onClick={addField} style={{ ...smallBtn('#1e4080','#4a9eff'), padding: '6px 14px', marginLeft: 'auto' }}>+ Add Field</button>
            </div>
          </div>
          <button onClick={handleSave} style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Courier New, monospace', letterSpacing: '1px' }}>
            SAVE TEMPLATE
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewQueue({ reports, dispatch }) {
  const pending = reports.filter(r => r.status === 'Submitted' || r.status === 'Pending Review');
  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px' }}>SUPERVISOR REVIEW QUEUE — {pending.length} pending</div>
      {pending.length === 0 && <div style={{ color: '#334155', fontSize: '13px' }}>No reports pending review.</div>}
      {pending.map(r => (
        <div key={r.id} style={{ background: '#0a1525', border: '1px solid #1e3060', borderRadius: '4px', padding: '12px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div>
              <span style={{ color: '#4a9eff', fontWeight: 700 }}>{r.caseNumber}</span>
              <span style={{ color: '#94a3b8', marginLeft: '12px', fontSize: '12px' }}>{r.type}</span>
              <span style={{ color: '#64748b', marginLeft: '12px', fontSize: '11px' }}>Officer: {r.officerBadge}</span>
            </div>
            <StatusBadge status={r.status} />
          </div>
          <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '10px' }}>{r.summary}</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id: r.id, status: 'Approved' } })} style={{ ...smallBtn('#14532d','#22c55e'), padding: '6px 14px' }}>✓ Approve</button>
            <button onClick={() => dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id: r.id, status: 'Denied' } })} style={{ ...smallBtn('#7f1d1d','#ef4444'), padding: '6px 14px' }}>✗ Deny</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabBar({ tabs, active, setActive }) {
  const labels = { submitted: 'Submitted Reports', create: 'Create Report', builder: 'Form Builder', review: 'Review Queue' };
  return (
    <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #1e3060', paddingBottom: '0' }}>
      {tabs.map(t => (
        <button key={t} onClick={() => setActive(t)} style={{ background: active === t ? '#0d2545' : 'transparent', border: active === t ? '1px solid #4a9eff' : '1px solid transparent', borderBottom: 'none', borderRadius: '4px 4px 0 0', color: active === t ? '#4a9eff' : '#64748b', padding: '7px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Courier New, monospace' }}>
          {labels[t] || t}
        </button>
      ))}
    </div>
  );
}

function StatusSummary({ label, count, color }) {
  return (
    <div style={{ background: '#0d1f3c', border: `1px solid ${color}`, borderRadius: '4px', padding: '6px 14px', textAlign: 'center' }}>
      <div style={{ color, fontSize: '18px', fontWeight: 700 }}>{count}</div>
      <div style={{ color: '#64748b', fontSize: '10px' }}>{label}</div>
    </div>
  );
}

function Field2({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <span style={{ color: '#4a9eff', fontSize: '11px', minWidth: '80px' }}>{label}:</span>
      <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '8px', padding: '24px', maxWidth: '540px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ color: '#4a9eff', fontWeight: 700, fontSize: '14px', fontFamily: 'Courier New, monospace' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const smallBtn = (bg, color) => ({ background: bg, border: `1px solid ${color}`, borderRadius: '3px', color, padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Courier New, monospace', fontWeight: 600 });
