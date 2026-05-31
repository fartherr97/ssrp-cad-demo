import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';

export default function FormsCenter() {
  const { state, dispatch } = useCAD();
  const { reports, reportTemplates, currentUser, civilians, officers } = state;
  const [activeTab, setActiveTab] = useState('submitted');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [reviewReport, setReviewReport] = useState(null);
  const isAdmin = currentUser?.role === 'admin';
  const tabs = ['submitted', 'create', ...(isAdmin ? ['builder', 'review'] : [])];

  const handleSubmitReport = (e) => {
    e.preventDefault();
    dispatch({
      type: 'ADD_REPORT',
      payload: {
        type: selectedTemplate.name,
        caseNumber: `SSRP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        officerBadge: currentUser?.badge || 'UNKN',
        summary: formValues['Narrative'] || formValues['Full Narrative'] || formValues['Supplement Narrative'] || 'Submitted via CAD',
        callId: null, civilianId: null,
      }
    });
    setSelectedTemplate(null);
    setFormValues({});
    setActiveTab('submitted');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: 700, letterSpacing: '1px', marginBottom: '18px' }}>REPORT CENTER</div>
      <TabBar tabs={tabs} active={activeTab} setActive={(t) => { setActiveTab(t); setSelectedTemplate(null); }} />

      {/* ── Submitted Reports ── */}
      {activeTab === 'submitted' && (
        <div style={{ marginTop: '18px' }}>
          <div style={{ marginBottom: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <StatusSummary label="Total" count={reports.length} color="#4a9eff" />
            <StatusSummary label="Pending" count={reports.filter(r => r.status === 'Submitted').length} color="#f59e0b" />
            <StatusSummary label="Approved" count={reports.filter(r => r.status === 'Approved').length} color="#22c55e" />
            <StatusSummary label="Review" count={reports.filter(r => r.status === 'Pending Review').length} color="#ef4444" />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px' }}>
            <thead>
              <tr style={{ background: '#0a1a35' }}>
                {['Case #','Type','Officer','Date','Status','Call','Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#7a9ab8', fontSize: '14px', fontWeight: 700, borderBottom: '1px solid #1e4080' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={r.id} style={{ background: i % 2 === 0 ? '#080f1e' : '#0a1525' }}>
                  <td style={{ padding: '9px 12px', color: '#60a5fa', fontWeight: 700 }}>{r.caseNumber}</td>
                  <td style={{ padding: '9px 12px', color: '#e2e8f0' }}>{r.type}</td>
                  <td style={{ padding: '9px 12px', color: '#94a3b8' }}>{r.officerBadge}</td>
                  <td style={{ padding: '9px 12px', color: '#64748b' }}>{r.date}</td>
                  <td style={{ padding: '9px 12px' }}><StatusBadge status={r.status} /></td>
                  <td style={{ padding: '9px 12px', color: '#60a5fa' }}>{r.callId || '—'}</td>
                  <td style={{ padding: '9px 12px' }}>
                    <button onClick={() => setReviewReport(r)} style={smallBtn('#1e4080','#4a9eff')}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create Report ── */}
      {activeTab === 'create' && (
        <div style={{ marginTop: '18px' }}>
          {!selectedTemplate ? (
            <>
              <div style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '14px' }}>Select a report template to begin:</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                {reportTemplates.map(t => (
                  <div key={t.id} onClick={() => { setSelectedTemplate(t); setFormValues({}); }}
                    style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '8px', padding: '18px', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#4a9eff'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#1e4080'}
                  >
                    <div style={{ color: '#4a9eff', fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>📋 {t.name}</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>{t.fields.length} fields</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <DocumentForm
              template={selectedTemplate}
              formValues={formValues}
              setFormValues={setFormValues}
              onBack={() => { setSelectedTemplate(null); setFormValues({}); }}
              onSubmit={handleSubmitReport}
              currentUser={currentUser}
              civilians={civilians}
              officers={officers}
            />
          )}
        </div>
      )}

      {/* ── Form Builder ── */}
      {activeTab === 'builder' && isAdmin && (
        <TemplateBuilder reportTemplates={reportTemplates} dispatch={dispatch} />
      )}

      {/* ── Review Queue ── */}
      {activeTab === 'review' && isAdmin && (
        <ReviewQueue reports={reports} dispatch={dispatch} />
      )}

      {/* Report detail modal */}
      {reviewReport && (
        <Modal onClose={() => setReviewReport(null)} title={`${reviewReport.type} — ${reviewReport.caseNumber}`}>
          <div style={{ fontSize: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <FieldRow label="Officer" value={reviewReport.officerBadge} />
            <FieldRow label="Date" value={reviewReport.date} />
            <FieldRow label="Status" value={<StatusBadge status={reviewReport.status} />} />
            <FieldRow label="Call" value={reviewReport.callId || '—'} />
            <div style={{ background: '#060d1a', border: '1px solid #1e3060', borderRadius: '4px', padding: '14px', color: '#94a3b8', lineHeight: '1.7', fontSize: '16px' }}>
              {reviewReport.summary}
            </div>
            {isAdmin && reviewReport.status === 'Submitted' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button onClick={() => { dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id: reviewReport.id, status: 'Approved' } }); setReviewReport(null); }} style={{ ...smallBtn('#14532d','#22c55e'), padding: '9px 18px', flex: 1, fontSize: '15px' }}>✓ Approve</button>
                <button onClick={() => { dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id: reviewReport.id, status: 'Denied' } }); setReviewReport(null); }} style={{ ...smallBtn('#7f1d1d','#ef4444'), padding: '9px 18px', flex: 1, fontSize: '15px' }}>✗ Deny</button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   DOCUMENT FORM — renders like a real paper form
════════════════════════════════════════════════════ */
function DocumentForm({ template, formValues, setFormValues, onBack, onSubmit, currentUser, civilians, officers }) {
  const formNumber = `SSRP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

  return (
    <div>
      {/* Controls above document */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ ...smallBtn('#1e4080','#94a3b8'), padding: '7px 14px', fontSize: '15px' }}>← Back</button>
        <span style={{ color: '#e2a84b', fontWeight: 700, fontSize: '15px' }}>{template.name}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
          <button onClick={() => window.print()} style={{ ...smallBtn('#1e3a50','#60a5fa'), padding: '7px 14px', fontSize: '15px' }}>🖨 Print</button>
          <button form="docform" type="submit" style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '5px', color: '#fff', padding: '7px 20px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>Submit Report</button>
        </div>
      </div>

      {/* The document itself */}
      <form id="docform" onSubmit={onSubmit}>
        <div style={{
          background: '#f8fafc',
          color: '#0f172a',
          border: '1px solid #cbd5e1',
          borderRadius: '4px',
          maxWidth: '860px',
          margin: '0 auto',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          fontFamily: "'Ubuntu', sans-serif",
          overflow: 'hidden',
        }}>
          {/* Document header */}
          <div style={{ background: '#0f2548', padding: '18px 28px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '3px solid #1e4080' }}>
            <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" style={{ height: '54px', width: 'auto' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '16px', letterSpacing: '1px' }}>SUNSHINE STATE ROLEPLAY</div>
              <div style={{ color: '#60a5fa', fontSize: '14px', letterSpacing: '1px', marginTop: '2px' }}>SUNSHINE STATE POLICE DEPARTMENT</div>
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '18px', marginTop: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{template.name}</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#94a3b8' }}>
              <div style={{ marginBottom: '4px' }}>Form #</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px', fontFamily: "'Ubuntu Mono', monospace" }}>{formNumber}</div>
              <div style={{ marginTop: '8px', color: '#94a3b8' }}>Date</div>
              <div style={{ color: '#fff', fontSize: '14px' }}>{today}</div>
            </div>
          </div>

          {/* Officer info bar */}
          <div style={{ background: '#e8edf5', borderBottom: '1px solid #cbd5e1', padding: '8px 28px', display: 'flex', gap: '32px', fontSize: '14px', color: '#334155' }}>
            <span><strong>Officer:</strong> {currentUser?.name} ({currentUser?.badge})</span>
            <span><strong>Department:</strong> {currentUser?.deptShort}</span>
            <span><strong>Rank:</strong> {currentUser?.rank}</span>
          </div>

          {/* Form fields as document cells */}
          <div style={{ padding: '0' }}>
            <DocFieldGrid
              fields={template.fields}
              formValues={formValues}
              setFormValues={setFormValues}
              civilians={civilians}
              officers={officers}
            />
          </div>

          {/* Signature section */}
          <div style={{ borderTop: '2px solid #cbd5e1', padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', background: '#f1f5f9' }}>
            <SigLine label="Submitting Officer Signature" />
            <SigLine label="Badge Number" value={currentUser?.badge} />
            <SigLine label="Date / Time" value={`${today} — ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} />
          </div>

          {/* Footer */}
          <div style={{ background: '#0f2548', padding: '8px 28px', fontSize: '11px', color: '#4a6a8a', textAlign: 'center', letterSpacing: '1px' }}>
            SUNSHINE STATE ROLEPLAY — COMPUTER AIDED DISPATCH — CONFIDENTIAL LAW ENFORCEMENT DOCUMENT
          </div>
        </div>
      </form>
    </div>
  );
}

function DocFieldGrid({ fields, formValues, setFormValues, civilians, officers }) {
  const rows = [];
  let i = 0;
  while (i < fields.length) {
    const f = fields[i];
    const isWide = f.type === 'textarea' || f.label.toLowerCase().includes('narrative') || f.label.toLowerCase().includes('description') || f.label.toLowerCase().includes('note');
    if (isWide) {
      rows.push([f]);
      i++;
    } else {
      const next = fields[i + 1];
      const nextWide = next && (next.type === 'textarea' || next.label.toLowerCase().includes('narrative'));
      if (next && !nextWide) {
        rows.push([f, next]);
        i += 2;
      } else {
        rows.push([f]);
        i++;
      }
    }
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((field, ci) => (
              <td
                key={field.id}
                colSpan={row.length === 1 ? 2 : 1}
                style={{
                  border: '1px solid #cbd5e1',
                  padding: '0',
                  verticalAlign: 'top',
                  width: row.length === 1 ? '100%' : '50%',
                }}
              >
                <div style={{ padding: '6px 12px 2px', background: '#e2e8f0', borderBottom: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {field.label}{field.required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
                  </span>
                </div>
                <div style={{ padding: '6px 12px 8px', minHeight: field.type === 'textarea' ? '80px' : '36px' }}>
                  <DocInput field={field} value={formValues[field.label] || ''} onChange={v => setFormValues(fv => ({ ...fv, [field.label]: v }))} civilians={civilians} officers={officers} />
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DocInput({ field, value, onChange, civilians, officers }) {
  const inputStyle = {
    width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #94a3b8',
    color: '#0f172a', fontSize: '16px', padding: '2px 0', outline: 'none', fontFamily: "'Ubuntu', sans-serif",
  };
  const selectStyle = { ...inputStyle, background: 'transparent', cursor: 'pointer' };

  if (field.type === 'textarea')
    return <textarea value={value} onChange={e => onChange(e.target.value)} required={field.required} rows={4} style={{ ...inputStyle, borderBottom: 'none', resize: 'vertical', lineHeight: '1.6', minHeight: '80px' }} />;
  if (field.type === 'text' || field.type === 'number')
    return <input type={field.type} value={value} onChange={e => onChange(e.target.value)} required={field.required} style={inputStyle} />;
  if (field.type === 'date')
    return <input type="date" value={value} onChange={e => onChange(e.target.value)} required={field.required} style={inputStyle} />;
  if (field.type === 'datetime')
    return <input type="datetime-local" value={value} onChange={e => onChange(e.target.value)} required={field.required} style={inputStyle} />;
  if (field.type === 'checkbox')
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#0f172a', fontSize: '16px' }}>
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#1e4080' }} />
        Yes
      </label>
    );
  if (field.type === 'dropdown')
    return (
      <select value={value} onChange={e => onChange(e.target.value)} required={field.required} style={selectStyle}>
        <option value="">— Select —</option>
        {field.options?.map(o => <option key={o}>{o}</option>)}
      </select>
    );
  if (field.type === 'civilian_lookup')
    return (
      <select value={value} onChange={e => onChange(e.target.value)} required={field.required} style={selectStyle}>
        <option value="">— Select Civilian —</option>
        {civilians.map(c => <option key={c.id}>{c.firstName} {c.lastName}</option>)}
      </select>
    );
  if (field.type === 'badge_lookup')
    return (
      <select value={value} onChange={e => onChange(e.target.value)} required={field.required} style={selectStyle}>
        <option value="">— Select Officer —</option>
        {officers.map(o => <option key={o.id}>{o.badge} — {o.name}</option>)}
      </select>
    );
  return <input value={value} onChange={e => onChange(e.target.value)} style={inputStyle} />;
}

function SigLine({ label, value }) {
  return (
    <div>
      <div style={{ borderBottom: '1.5px solid #334155', minHeight: '32px', padding: '4px 0', fontSize: '16px', color: '#0f172a' }}>{value || ''}</div>
      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   TEMPLATE BUILDER
════════════════════════════════════════════════════ */
function TemplateBuilder({ reportTemplates, dispatch }) {
  const [tpl, setTpl] = useState({ name: '', fields: [] });
  const [newField, setNewField] = useState({ label: '', type: 'text', required: false, options: '' });

  const addField = () => {
    if (!newField.label) return;
    const field = {
      id: `f${Date.now()}`, label: newField.label, type: newField.type, required: newField.required,
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
    tpl.id ? dispatch({ type: 'UPDATE_REPORT_TEMPLATE', payload: tpl }) : dispatch({ type: 'ADD_REPORT_TEMPLATE', payload: tpl });
    setTpl({ name: '', fields: [] });
  };

  const base = { background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', color: '#e2e8f0', padding: '8px 10px', fontSize: '15px', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ marginTop: '18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
      <div>
        <div style={{ color: '#e2a84b', fontSize: '15px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px' }}>EXISTING TEMPLATES</div>
        {reportTemplates.map(t => (
          <div key={t.id} style={{ background: '#0a1525', border: '1px solid #1e3060', borderRadius: '4px', padding: '10px 14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px' }}>
            <div>
              <span style={{ color: '#e2e8f0' }}>{t.name}</span>
              <span style={{ color: '#475569', marginLeft: '10px', fontSize: '14px' }}>{t.fields.length} fields</span>
            </div>
            <button onClick={() => setTpl({ ...t })} style={smallBtn('#1e4080','#4a9eff')}>Edit</button>
          </div>
        ))}
      </div>
      <div>
        <div style={{ color: '#e2a84b', fontSize: '15px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px' }}>{tpl.id ? 'EDIT TEMPLATE' : 'NEW TEMPLATE'}</div>
        <div style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '6px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ color: '#7a9ab8', fontSize: '14px', display: 'block', marginBottom: '5px' }}>TEMPLATE NAME</label>
            <input value={tpl.name} onChange={e => setTpl(t => ({ ...t, name: e.target.value }))} style={base} />
          </div>
          <div>
            <div style={{ color: '#7a9ab8', fontSize: '14px', marginBottom: '8px' }}>FIELDS ({tpl.fields.length})</div>
            {tpl.fields.map((f, idx) => (
              <div key={f.id} style={{ background: '#060d1a', border: '1px solid #1e3060', borderRadius: '4px', padding: '8px 10px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                <span style={{ color: '#64748b' }}>{idx + 1}.</span>
                <span style={{ color: '#e2e8f0', flex: 1 }}>{f.label}</span>
                <span style={{ color: '#4a9eff', fontSize: '12px' }}>[{f.type}]</span>
                {f.required && <span style={{ color: '#ef4444', fontSize: '12px' }}>*</span>}
                <button onClick={() => moveField(idx, -1)} style={sBtn()}>↑</button>
                <button onClick={() => moveField(idx, 1)} style={sBtn()}>↓</button>
                <button onClick={() => setTpl(t => ({ ...t, fields: t.fields.filter((_, i) => i !== idx) }))} style={{ ...sBtn(), background: '#7f1d1d', color: '#ef4444', border: '1px solid #ef4444' }}>✕</button>
              </div>
            ))}
          </div>
          <div style={{ background: '#060d1a', border: '1px dashed #1e4080', borderRadius: '4px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ color: '#7a9ab8', fontSize: '14px' }}>ADD FIELD</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input value={newField.label} onChange={e => setNewField(f => ({ ...f, label: e.target.value }))} placeholder="Field label" style={{ ...base, flex: 2 }} />
              <select value={newField.type} onChange={e => setNewField(f => ({ ...f, type: e.target.value }))} style={{ ...base, flex: 1 }}>
                {['text','textarea','dropdown','checkbox','date','datetime','badge_lookup','civilian_lookup'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            {newField.type === 'dropdown' && (
              <input value={newField.options} onChange={e => setNewField(f => ({ ...f, options: e.target.value }))} placeholder="Options (comma-separated)" style={base} />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '15px', cursor: 'pointer' }}>
                <input type="checkbox" checked={newField.required} onChange={e => setNewField(f => ({ ...f, required: e.target.checked }))} style={{ accentColor: '#4a9eff' }} />
                Required
              </label>
              <button onClick={addField} style={{ ...smallBtn('#1e4080','#4a9eff'), padding: '6px 14px', marginLeft: 'auto' }}>+ Add Field</button>
            </div>
          </div>
          <button onClick={handleSave} style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
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
    <div style={{ marginTop: '18px' }}>
      <div style={{ color: '#f59e0b', fontSize: '15px', fontWeight: 700, letterSpacing: '1px', marginBottom: '14px' }}>SUPERVISOR REVIEW QUEUE — {pending.length} pending</div>
      {pending.length === 0 && <div style={{ color: '#334155', fontSize: '16px' }}>No reports pending review.</div>}
      {pending.map(r => (
        <div key={r.id} style={{ background: '#0a1525', border: '1px solid #1e3060', borderRadius: '4px', padding: '14px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div>
              <span style={{ color: '#4a9eff', fontWeight: 700, fontSize: '16px' }}>{r.caseNumber}</span>
              <span style={{ color: '#94a3b8', marginLeft: '12px', fontSize: '15px' }}>{r.type}</span>
              <span style={{ color: '#64748b', marginLeft: '12px', fontSize: '14px' }}>Officer: {r.officerBadge}</span>
            </div>
            <StatusBadge status={r.status} />
          </div>
          <div style={{ color: '#64748b', fontSize: '15px', marginBottom: '10px' }}>{r.summary}</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id: r.id, status: 'Approved' } })} style={{ ...smallBtn('#14532d','#22c55e'), padding: '7px 16px' }}>✓ Approve</button>
            <button onClick={() => dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id: r.id, status: 'Denied' } })} style={{ ...smallBtn('#7f1d1d','#ef4444'), padding: '7px 16px' }}>✗ Deny</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Shared UI helpers ── */
function TabBar({ tabs, active, setActive }) {
  const labels = { submitted: 'Submitted Reports', create: 'Create Report', builder: 'Form Builder', review: 'Review Queue' };
  return (
    <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #1e3060' }}>
      {tabs.map(t => (
        <button key={t} onClick={() => setActive(t)} style={{ background: active === t ? '#0d2545' : 'transparent', border: active === t ? '1px solid #4a9eff' : '1px solid transparent', borderBottom: 'none', borderRadius: '4px 4px 0 0', color: active === t ? '#4a9eff' : '#64748b', padding: '8px 16px', fontSize: '15px', cursor: 'pointer' }}>
          {labels[t] || t}
        </button>
      ))}
    </div>
  );
}

function StatusSummary({ label, count, color }) {
  return (
    <div style={{ background: '#0d1f3c', border: `1px solid ${color}30`, borderRadius: '5px', padding: '8px 16px', textAlign: 'center', minWidth: '80px' }}>
      <div style={{ color, fontSize: '22px', fontWeight: 700 }}>{count}</div>
      <div style={{ color: '#64748b', fontSize: '12px' }}>{label}</div>
    </div>
  );
}

function FieldRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <span style={{ color: '#4a9eff', fontSize: '14px', minWidth: '80px' }}>{label}:</span>
      <span style={{ color: '#94a3b8', fontSize: '15px' }}>{value}</span>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '8px', padding: '26px', maxWidth: '560px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <span style={{ color: '#4a9eff', fontWeight: 700, fontSize: '15px' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const smallBtn = (bg, color) => ({ background: bg, border: `1px solid ${color}`, borderRadius: '4px', color, padding: '5px 12px', fontSize: '14px', cursor: 'pointer', fontWeight: 600 });
const sBtn = () => ({ background: '#0a1525', border: '1px solid #1e3060', borderRadius: '3px', color: '#64748b', padding: '2px 7px', fontSize: '12px', cursor: 'pointer' });
