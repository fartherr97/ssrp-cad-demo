import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';
import { useResponsive } from '../hooks/useResponsive';

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
        caseNumber: `HCSO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
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
    <div style={{ padding: '14px', fontFamily: 'Ubuntu, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#0b0d14', border: '1px solid #1e2533', borderBottom: 'none', padding: '8px 14px' }}>
        <span style={{ color: '#f9fafb', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px' }}>REPORT CENTER</span>
      </div>
      <div style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '14px' }}>
        <TabBar tabs={tabs} active={activeTab} setActive={(t) => { setActiveTab(t); setSelectedTemplate(null); }} />

        {/* Submitted Reports */}
        {activeTab === 'submitted' && (
          <div style={{ marginTop: '14px' }}>
            <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <StatusSummary label="Total" count={reports.length} color="#3b82f6" />
              <StatusSummary label="Pending" count={reports.filter(r => r.status === 'Submitted').length} color="#fbbf24" />
              <StatusSummary label="Approved" count={reports.filter(r => r.status === 'Approved').length} color="#22c55e" />
              <StatusSummary label="Review" count={reports.filter(r => r.status === 'Pending Review').length} color="#ef4444" />
            </div>
            <div className="table-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#0b0d14' }}>
                    {['Case #','Type','Officer','Date','Status','Call','Actions'].map(h => (
                      <th key={h} style={{ padding: '7px 10px', textAlign: 'left', color: '#6b7280', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', borderBottom: '1px solid #1e2533', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, i) => (
                    <tr key={r.id} style={{ background: i % 2 === 0 ? '#0d1117' : '#111218' }}>
                      <td style={{ padding: '7px 10px', color: '#60a5fa', fontWeight: 700 }}>{r.caseNumber}</td>
                      <td style={{ padding: '7px 10px', color: '#d1d5db' }}>{r.type}</td>
                      <td style={{ padding: '7px 10px', color: '#9ca3af' }}>{r.officerBadge}</td>
                      <td style={{ padding: '7px 10px', color: '#4b5563' }}>{r.date}</td>
                      <td style={{ padding: '7px 10px' }}><StatusBadge status={r.status} /></td>
                      <td style={{ padding: '7px 10px', color: '#60a5fa' }}>{r.callId || '—'}</td>
                      <td style={{ padding: '7px 10px' }}>
                        <button onClick={() => setReviewReport(r)} style={aBtn('#0c1a2e','#3b82f6')}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Report */}
        {activeTab === 'create' && (
          <div style={{ marginTop: '14px' }}>
            {!selectedTemplate ? (
              <>
                <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '12px' }}>Select a report template to begin:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                  {reportTemplates.map(t => (
                    <div key={t.id} onClick={() => { setSelectedTemplate(t); setFormValues({}); }}
                      style={{ background: '#090b10', border: '1px solid #1e2533', padding: '16px', cursor: 'pointer', borderLeft: '3px solid #3b82f6' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
                      onMouseLeave={e => e.currentTarget.style.borderLeftColor = '#3b82f6'}
                    >
                      <div style={{ color: '#3b82f6', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>{t.name}</div>
                      <div style={{ color: '#4b5563', fontSize: '11px' }}>{t.fields.length} fields</div>
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

        {/* Form Builder */}
        {activeTab === 'builder' && isAdmin && (
          <TemplateBuilder reportTemplates={reportTemplates} dispatch={dispatch} />
        )}

        {/* Review Queue */}
        {activeTab === 'review' && isAdmin && (
          <ReviewQueue reports={reports} dispatch={dispatch} />
        )}

        {/* Report detail modal */}
        {reviewReport && (
          <Modal onClose={() => setReviewReport(null)} title={`${reviewReport.type} — ${reviewReport.caseNumber}`}>
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <FieldRow label="Officer" value={reviewReport.officerBadge} />
              <FieldRow label="Date" value={reviewReport.date} />
              <FieldRow label="Status" value={<StatusBadge status={reviewReport.status} />} />
              <FieldRow label="Call" value={reviewReport.callId || '—'} />
              <div style={{ background: '#090b10', border: '1px solid #1f2937', padding: '12px', color: '#9ca3af', lineHeight: '1.6', fontSize: '13px' }}>
                {reviewReport.summary}
              </div>
              {isAdmin && reviewReport.status === 'Submitted' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button onClick={() => { dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id: reviewReport.id, status: 'Approved' } }); setReviewReport(null); }} style={{ ...aBtn('#052e16','#22c55e'), padding: '7px 16px', flex: 1, fontSize: '13px' }}>Approve</button>
                  <button onClick={() => { dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id: reviewReport.id, status: 'Denied' } }); setReviewReport(null); }} style={{ ...aBtn('#450a0a','#ef4444'), padding: '7px 16px', flex: 1, fontSize: '13px' }}>Deny</button>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

/* ════════════ DOCUMENT FORM — government citation / official report style ════════════ */
function DocumentForm({ template, formValues, setFormValues, onBack, onSubmit, currentUser, civilians, officers }) {
  const { isMobile } = useResponsive();
  const [formNumber] = useState(`HCSO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const DOC_FONT = "'Arial Narrow', Arial, sans-serif";
  const DATA_FONT = "'Courier New', Courier, monospace";
  const BORDER = '1px solid #1a1a2e';
  const LABEL_BG = '#cdd5e0';
  const FIELD_BG = '#ffffff';
  const SHADE_BG = '#f0f3f7';

  const cellLabel = (text, required) => (
    <div style={{ background: LABEL_BG, borderBottom: BORDER, padding: '2px 6px' }}>
      <span style={{ fontSize: '9px', fontWeight: 700, color: '#1a1a2e', letterSpacing: '0.6px', textTransform: 'uppercase', fontFamily: DOC_FONT }}>
        {text}{required && <span style={{ color: '#aa0000', marginLeft: '3px' }}>*</span>}
      </span>
    </div>
  );

  return (
    <div>
      {/* CAD-UI toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ background: '#090b10', border: '1px solid #1e2533', color: '#9ca3af', padding: '5px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif' }}>Back</button>
        <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '12px', fontFamily: 'Ubuntu, sans-serif', letterSpacing: '1px' }}>{template.name.toUpperCase()}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          {!isMobile && (
            <button onClick={() => window.print()} style={{ background: '#090b10', border: '1px solid #1e2533', color: '#60a5fa', padding: '5px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif' }}>Print</button>
          )}
          <button form="docform" type="submit" style={{ background: '#0f2548', border: '2px solid #1a1a2e', color: '#ffffff', padding: '5px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: DOC_FONT, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            SUBMIT REPORT
          </button>
        </div>
      </div>

      <form id="docform" onSubmit={onSubmit}>
        <div style={{
          background: FIELD_BG,
          color: '#0a0a1a',
          border: '2px solid #1a1a2e',
          maxWidth: '900px',
          margin: '0 auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          fontFamily: DOC_FONT,
          overflow: 'hidden',
        }}>
          {/* HEADER */}
          <div style={{ background: '#0f2548', display: 'flex', alignItems: 'stretch', borderBottom: '3px solid #1a1a2e' }}>
            <div style={{ flex: 1, padding: '10px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ color: '#b0c4d8', fontSize: isMobile ? '9px' : '11px', letterSpacing: '2px', fontWeight: 400, marginBottom: '1px', fontFamily: DOC_FONT }}>
                HILLSBOROUGH COUNTY, FLORIDA
              </div>
              <div style={{ color: '#7aa0bc', fontSize: isMobile ? '8px' : '10px', letterSpacing: '1.5px', marginBottom: '5px', fontFamily: DOC_FONT }}>
                {currentUser?.deptShort || 'LAW ENFORCEMENT'} — COMPUTER AIDED DISPATCH
              </div>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: isMobile ? '14px' : '18px', letterSpacing: '1px', textTransform: 'uppercase', borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: '5px', width: '100%', fontFamily: DOC_FONT }}>
                {template.name}
              </div>
            </div>
            <div style={{ padding: '10px 12px', borderLeft: '2px solid rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: isMobile ? '100px' : '140px' }}>
              <div style={{ color: '#6a8aa8', fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1px', fontFamily: DOC_FONT }}>REPORT NUMBER</div>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: isMobile ? '10px' : '12px', fontFamily: DATA_FONT, marginBottom: '7px' }}>{formNumber}</div>
              <div style={{ color: '#6a8aa8', fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1px', fontFamily: DOC_FONT }}>DATE</div>
              <div style={{ color: '#ffffff', fontSize: isMobile ? '10px' : '12px', fontFamily: DATA_FONT }}>{today}</div>
            </div>
          </div>

          {/* OFFICER INFO ROW */}
          <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '2px solid #1a1a2e' }}>
            <tbody>
              <tr>
                {[
                  ['REPORTING OFFICER', currentUser?.name || ''],
                  ['BADGE NUMBER', currentUser?.badge || ''],
                  ['DEPARTMENT', currentUser?.deptShort || ''],
                  ['RANK / TITLE', currentUser?.rank || ''],
                ].map(([label, val]) => (
                  <td key={label} style={{ border: BORDER, padding: 0, verticalAlign: 'top' }}>
                    {cellLabel(label, false)}
                    <div style={{ padding: '3px 7px 4px', minHeight: '22px', background: SHADE_BG }}>
                      <span style={{ fontSize: isMobile ? '10px' : '12px', color: '#0a0a1a', fontFamily: DATA_FONT, fontWeight: 600 }}>{val}</span>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* FORM FIELDS */}
          <DocFieldGrid
            fields={template.fields}
            formValues={formValues}
            setFormValues={setFormValues}
            civilians={civilians}
            officers={officers}
            isMobile={isMobile}
            cellLabel={cellLabel}
            BORDER={BORDER}
            FIELD_BG={FIELD_BG}
            DATA_FONT={DATA_FONT}
          />

          {/* CERTIFICATION BANNER */}
          <div style={{ background: LABEL_BG, borderTop: '2px solid #1a1a2e', borderBottom: BORDER, padding: '3px 10px' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, color: '#1a1a2e', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: DOC_FONT }}>
              THE UNDERSIGNED CERTIFIES THAT THE FOREGOING INFORMATION IS TRUE AND CORRECT TO THE BEST OF THEIR KNOWLEDGE
            </span>
          </div>

          {/* SIGNATURE ROW */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ border: BORDER, padding: 0, width: '45%' }}>
                  {cellLabel('SUBMITTING OFFICER SIGNATURE', false)}
                  <div style={{ padding: '4px 7px 8px', minHeight: '38px', background: FIELD_BG }}>
                    <div style={{ borderBottom: '1px solid #667', height: '26px' }} />
                  </div>
                </td>
                <td style={{ border: BORDER, padding: 0, width: '20%' }}>
                  {cellLabel('BADGE NUMBER', false)}
                  <div style={{ padding: '4px 7px 8px', minHeight: '38px', background: SHADE_BG }}>
                    <span style={{ fontSize: '13px', color: '#0a0a1a', fontFamily: DATA_FONT, fontWeight: 700 }}>{currentUser?.badge}</span>
                  </div>
                </td>
                <td style={{ border: BORDER, padding: 0, width: '35%' }}>
                  {cellLabel('DATE / TIME SUBMITTED', false)}
                  <div style={{ padding: '4px 7px 8px', minHeight: '38px', background: SHADE_BG }}>
                    <span style={{ fontSize: '12px', color: '#0a0a1a', fontFamily: DATA_FONT }}>
                      {today} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* FOOTER */}
          <div style={{ background: '#0f2548', borderTop: '2px solid #1a1a2e', padding: '4px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
            <span style={{ fontSize: '8px', color: '#4a6a8a', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: DOC_FONT }}>HILLSBOROUGH COUNTY, FL — COMPUTER AIDED DISPATCH</span>
            <span style={{ fontSize: '8px', color: '#4a6a8a', letterSpacing: '1px', fontFamily: DOC_FONT }}>CONFIDENTIAL LAW ENFORCEMENT DOCUMENT</span>
          </div>
        </div>
      </form>
    </div>
  );
}

function DocFieldGrid({ fields, formValues, setFormValues, civilians, officers, isMobile, cellLabel, BORDER, FIELD_BG, DATA_FONT }) {
  const rows = [];
  let i = 0;
  while (i < fields.length) {
    const f = fields[i];
    const lc = f.label.toLowerCase();
    const isWide = f.type === 'textarea'
      || lc.includes('narrative') || lc.includes('description')
      || lc.includes('note') || lc.includes('charge') || lc.includes('evidence')
      || lc.includes('reason for') || lc.includes('parties');
    if (isWide) {
      rows.push([f]);
      i++;
    } else {
      const next = fields[i + 1];
      const nextLc = next?.label.toLowerCase() || '';
      const nextWide = next && (next.type === 'textarea' || nextLc.includes('narrative') || nextLc.includes('reason for'));
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
            {row.map((field) => {
              const isTextarea = field.type === 'textarea';
              return (
                <td
                  key={field.id}
                  colSpan={row.length === 1 ? 2 : 1}
                  style={{ border: BORDER, padding: 0, verticalAlign: 'top' }}
                >
                  {cellLabel(field.label, field.required)}
                  <div style={{ padding: '4px 7px', minHeight: isTextarea ? '80px' : '30px', background: FIELD_BG, display: 'flex', alignItems: isTextarea ? 'flex-start' : 'center' }}>
                    <DocInput
                      field={field}
                      value={formValues[field.label] || ''}
                      onChange={v => setFormValues(fv => ({ ...fv, [field.label]: v }))}
                      civilians={civilians}
                      officers={officers}
                      DATA_FONT={DATA_FONT}
                    />
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DocInput({ field, value, onChange, civilians, officers, DATA_FONT }) {
  const base = { width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#0a0a1a', fontSize: '13px', fontFamily: DATA_FONT, padding: 0, boxSizing: 'border-box' };

  if (field.type === 'textarea')
    return <textarea value={value} onChange={e => onChange(e.target.value)} required={field.required} rows={5} style={{ ...base, resize: 'vertical', lineHeight: '1.8', minHeight: '76px', width: '100%' }} />;
  if (field.type === 'text' || field.type === 'number')
    return <input type={field.type} value={value} onChange={e => onChange(e.target.value)} required={field.required} style={base} />;
  if (field.type === 'date')
    return <input type="date" value={value} onChange={e => onChange(e.target.value)} required={field.required} style={{ ...base, fontSize: '12px' }} />;
  if (field.type === 'datetime')
    return <input type="datetime-local" value={value} onChange={e => onChange(e.target.value)} required={field.required} style={{ ...base, fontSize: '12px' }} />;
  if (field.type === 'checkbox')
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#0a0a1a', fontSize: '12px', fontFamily: DATA_FONT }}>
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} style={{ width: '13px', height: '13px', accentColor: '#0f2548', cursor: 'pointer', flexShrink: 0 }} />
        YES
      </label>
    );
  if (field.type === 'dropdown')
    return (
      <select value={value} onChange={e => onChange(e.target.value)} required={field.required} style={{ ...base, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}>
        <option value="">SELECT...</option>
        {field.options?.map(o => <option key={o}>{o}</option>)}
      </select>
    );
  if (field.type === 'civilian_lookup')
    return (
      <select value={value} onChange={e => onChange(e.target.value)} required={field.required} style={{ ...base, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}>
        <option value="">SELECT SUBJECT...</option>
        {civilians.map(c => <option key={c.id}>{c.firstName} {c.lastName}</option>)}
      </select>
    );
  if (field.type === 'badge_lookup')
    return (
      <select value={value} onChange={e => onChange(e.target.value)} required={field.required} style={{ ...base, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}>
        <option value="">SELECT OFFICER...</option>
        {officers.map(o => <option key={o.id}>{o.badge} - {o.name}</option>)}
      </select>
    );
  return <input value={value} onChange={e => onChange(e.target.value)} style={base} />;
}

/* ════════════ TEMPLATE BUILDER ════════════ */
function TemplateBuilder({ reportTemplates, dispatch }) {
  const { isMobile } = useResponsive();
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

  return (
    <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
      <div>
        <div style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '10px' }}>EXISTING TEMPLATES</div>
        {reportTemplates.map(t => (
          <div key={t.id} style={{ background: '#090b10', border: '1px solid #1e2533', padding: '9px 12px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <div>
              <span style={{ color: '#d1d5db' }}>{t.name}</span>
              <span style={{ color: '#374151', marginLeft: '10px', fontSize: '11px' }}>{t.fields.length} fields</span>
            </div>
            <button onClick={() => setTpl({ ...t })} style={aBtn('#0c1a2e','#3b82f6')}>Edit</button>
          </div>
        ))}
      </div>
      <div>
        <div style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '10px' }}>{tpl.id ? 'EDIT TEMPLATE' : 'NEW TEMPLATE'}</div>
        <div style={{ background: '#090b10', border: '1px solid #1e2533', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>TEMPLATE NAME</label>
            <input value={tpl.name} onChange={e => setTpl(t => ({ ...t, name: e.target.value }))} style={inputBase} />
          </div>
          <div>
            <div style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', marginBottom: '6px' }}>FIELDS ({tpl.fields.length})</div>
            {tpl.fields.map((f, idx) => (
              <div key={f.id} style={{ background: '#0d1117', border: '1px solid #1f2937', padding: '7px 10px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <span style={{ color: '#374151' }}>{idx + 1}.</span>
                <span style={{ color: '#d1d5db', flex: 1 }}>{f.label}</span>
                <span style={{ color: '#3b82f6', fontSize: '10px' }}>[{f.type}]</span>
                {f.required && <span style={{ color: '#ef4444', fontSize: '10px' }}>*</span>}
                <button onClick={() => moveField(idx, -1)} style={sBtn}>^</button>
                <button onClick={() => moveField(idx, 1)} style={sBtn}>v</button>
                <button onClick={() => setTpl(t => ({ ...t, fields: t.fields.filter((_, i) => i !== idx) }))} style={{ ...sBtn, background: '#450a0a', color: '#ef4444', border: '1px solid #991b1b' }}>X</button>
              </div>
            ))}
          </div>
          <div style={{ background: '#0d1117', border: '1px dashed #1e2533', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px' }}>ADD FIELD</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input value={newField.label} onChange={e => setNewField(f => ({ ...f, label: e.target.value }))} placeholder="Field label" style={{ ...inputBase, flex: 2 }} />
              <select value={newField.type} onChange={e => setNewField(f => ({ ...f, type: e.target.value }))} style={{ ...inputBase, flex: 1 }}>
                {['text','textarea','dropdown','checkbox','date','datetime','badge_lookup','civilian_lookup'].map(t => <option key={t}>{t}</option>)}
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
              <button onClick={addField} style={{ ...blueBtn, marginLeft: 'auto', fontSize: '11px', padding: '4px 10px' }}>+ Add Field</button>
            </div>
          </div>
          <button onClick={handleSave} style={{ ...blueBtn, padding: '9px', fontSize: '13px', letterSpacing: '1px', width: '100%', textAlign: 'center' }}>
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
    <div style={{ marginTop: '14px' }}>
      <div style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '12px' }}>SUPERVISOR REVIEW QUEUE — {pending.length} pending</div>
      {pending.length === 0 && <div style={{ color: '#374151', fontSize: '14px' }}>No reports pending review.</div>}
      {pending.map(r => (
        <div key={r.id} style={{ background: '#090b10', border: '1px solid #1e2533', padding: '12px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div>
              <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '13px' }}>{r.caseNumber}</span>
              <span style={{ color: '#9ca3af', marginLeft: '12px', fontSize: '12px' }}>{r.type}</span>
              <span style={{ color: '#4b5563', marginLeft: '12px', fontSize: '11px' }}>Officer: {r.officerBadge}</span>
            </div>
            <StatusBadge status={r.status} />
          </div>
          <div style={{ color: '#4b5563', fontSize: '12px', marginBottom: '8px' }}>{r.summary}</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id: r.id, status: 'Approved' } })} style={{ ...aBtn('#052e16','#22c55e'), padding: '5px 14px' }}>Approve</button>
            <button onClick={() => dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id: r.id, status: 'Denied' } })} style={{ ...aBtn('#450a0a','#ef4444'), padding: '5px 14px' }}>Deny</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* Shared UI helpers */
function TabBar({ tabs, active, setActive }) {
  const labels = { submitted: 'Submitted Reports', create: 'Create Report', builder: 'Form Builder', review: 'Review Queue' };
  return (
    <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #1f2937', overflowX: 'auto' }}>
      {tabs.map(t => (
        <button key={t} onClick={() => setActive(t)} style={{ background: active === t ? '#0f172a' : 'transparent', border: active === t ? '1px solid #3b82f6' : '1px solid transparent', borderBottom: 'none', color: active === t ? '#3b82f6' : '#4b5563', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif' }}>
          {labels[t] || t}
        </button>
      ))}
    </div>
  );
}

function StatusSummary({ label, count, color }) {
  return (
    <div style={{ background: '#090b10', border: `1px solid ${color}25`, padding: '7px 14px', textAlign: 'center', minWidth: '70px' }}>
      <div style={{ color, fontSize: '20px', fontWeight: 700 }}>{count}</div>
      <div style={{ color: '#4b5563', fontSize: '11px' }}>{label}</div>
    </div>
  );
}

function FieldRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <span style={{ color: '#3b82f6', fontSize: '12px', minWidth: '70px' }}>{label}:</span>
      <span style={{ color: '#9ca3af', fontSize: '13px' }}>{value}</span>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '22px', maxWidth: '540px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '13px', fontFamily: 'Ubuntu, sans-serif' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '18px' }}>X</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputBase = { width: '100%', background: '#090b10', border: '1px solid #1e2533', color: '#d1d5db', padding: '7px 10px', fontSize: '13px', fontFamily: 'Ubuntu, sans-serif', boxSizing: 'border-box' };
const blueBtn = { background: '#0c1a2e', border: '1px solid #3b82f6', color: '#3b82f6', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif', fontWeight: 700 };
const aBtn = (bg, c) => ({ background: bg, border: `1px solid ${c}`, color: c, padding: '4px 10px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif', fontWeight: 600 });
const sBtn = { background: '#0b0d14', border: '1px solid #1f2937', color: '#4b5563', padding: '2px 6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif' };
