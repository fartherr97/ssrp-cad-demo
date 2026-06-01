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
    <div className="p-3.5 font-ui">
      {/* Header */}
      <div className="bg-[#0b0d14] border border-[#1e2533] border-b-0 px-3.5 py-2">
        <span className="text-slate-100 text-[12px] font-bold tracking-[1.5px]">REPORT CENTER</span>
      </div>
      <div className="bg-[#0d1117] border border-[#1e2533] p-3.5">
        <TabBar tabs={tabs} active={activeTab} setActive={(t) => { setActiveTab(t); setSelectedTemplate(null); }} />

        {/* Submitted Reports */}
        {activeTab === 'submitted' && (
          <div className="mt-3.5">
            <div className="mb-3 flex gap-2 flex-wrap">
              <StatusSummary label="Total"    count={reports.length}                                            color="#3b82f6" />
              <StatusSummary label="Pending"  count={reports.filter(r => r.status === 'Submitted').length}     color="#fbbf24" />
              <StatusSummary label="Approved" count={reports.filter(r => r.status === 'Approved').length}      color="#22c55e" />
              <StatusSummary label="Review"   count={reports.filter(r => r.status === 'Pending Review').length} color="#ef4444" />
            </div>
            <div className="table-scroll">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[#0b0d14]">
                    {['Case #','Type','Officer','Date','Status','Call','Actions'].map(h => (
                      <th key={h} className="px-2.5 py-[7px] text-left text-[#6b7280] text-[11px] font-bold tracking-[0.6px] border-b border-[#1e2533] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 0 ? 'bg-[#0d1117]' : 'bg-[#111218]'}>
                      <td className="px-2.5 py-[7px] text-blue-400 font-bold">{r.caseNumber}</td>
                      <td className="px-2.5 py-[7px] text-slate-300">{r.type}</td>
                      <td className="px-2.5 py-[7px] text-[#9ca3af]">{r.officerBadge}</td>
                      <td className="px-2.5 py-[7px] text-[#4b5563]">{r.date}</td>
                      <td className="px-2.5 py-[7px]"><StatusBadge status={r.status} /></td>
                      <td className="px-2.5 py-[7px] text-blue-400">{r.callId || '—'}</td>
                      <td className="px-2.5 py-[7px]">
                        <button onClick={() => setReviewReport(r)} className="bg-[#0c1a2e] border border-blue-500 text-blue-500 px-2.5 py-1 text-[12px] cursor-pointer font-semibold font-ui">View</button>
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
          <div className="mt-3.5">
            {!selectedTemplate ? (
              <>
                <div className="text-[#9ca3af] text-[13px] mb-3">Select a report template to begin:</div>
                <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))' }}>
                  {reportTemplates.map(t => (
                    <div key={t.id}
                      onClick={() => { setSelectedTemplate(t); setFormValues({}); }}
                      className="bg-[#090b10] border border-[#1e2533] border-l-[3px] border-l-blue-500 p-4 cursor-pointer hover:border-blue-500 transition-colors"
                    >
                      <div className="text-blue-500 font-bold text-[13px] mb-1">{t.name}</div>
                      <div className="text-[#4b5563] text-[11px]">{t.fields.length} fields</div>
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
            <div className="text-[13px] flex flex-col gap-2">
              <FieldRow label="Officer" value={reviewReport.officerBadge} />
              <FieldRow label="Date"    value={reviewReport.date} />
              <FieldRow label="Status"  value={<StatusBadge status={reviewReport.status} />} />
              <FieldRow label="Call"    value={reviewReport.callId || '—'} />
              <div className="bg-[#090b10] border border-[#1f2937] p-3 text-[#9ca3af] leading-[1.6] text-[13px]">
                {reviewReport.summary}
              </div>
              {isAdmin && reviewReport.status === 'Submitted' && (
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => { dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id: reviewReport.id, status: 'Approved' } }); setReviewReport(null); }}
                    className="flex-1 bg-[#052e16] border border-green-500 text-green-500 py-[7px] px-4 text-[13px] font-semibold cursor-pointer font-ui"
                  >Approve</button>
                  <button
                    onClick={() => { dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id: reviewReport.id, status: 'Denied' } }); setReviewReport(null); }}
                    className="flex-1 bg-[#450a0a] border border-red-500 text-red-500 py-[7px] px-4 text-[13px] font-semibold cursor-pointer font-ui"
                  >Deny</button>
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
      <div className="flex items-center gap-2.5 mb-3 flex-wrap">
        <button onClick={onBack} className="bg-[#090b10] border border-[#1e2533] text-[#9ca3af] px-3 py-[5px] text-[12px] cursor-pointer font-ui">Back</button>
        <span className="text-amber-400 font-bold text-[12px] font-ui tracking-[1px]">{template.name.toUpperCase()}</span>
        <div className="ml-auto flex gap-2">
          {!isMobile && (
            <button onClick={() => window.print()} className="bg-[#090b10] border border-[#1e2533] text-blue-400 px-3 py-[5px] text-[12px] cursor-pointer font-ui">Print</button>
          )}
          <button form="docform" type="submit" className="bg-[#0f2548] border-2 border-[#1a1a2e] text-white px-[18px] py-[5px] text-[12px] font-bold cursor-pointer uppercase tracking-[1.5px]" style={{ fontFamily: DOC_FONT }}>
            SUBMIT REPORT
          </button>
        </div>
      </div>

      <form id="docform" onSubmit={onSubmit}>
        <div style={{
          background: FIELD_BG, color: '#0a0a1a', border: '2px solid #1a1a2e',
          maxWidth: 900, margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          fontFamily: DOC_FONT, overflow: 'hidden',
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
    <div className="mt-3.5 grid gap-4" style={{ gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
      <div>
        <div className="text-amber-400 text-[12px] font-bold tracking-[1.5px] mb-2.5">EXISTING TEMPLATES</div>
        {reportTemplates.map(t => (
          <div key={t.id} className="bg-[#090b10] border border-[#1e2533] px-3 py-[9px] mb-1.5 flex justify-between items-center text-[13px]">
            <div>
              <span className="text-slate-300">{t.name}</span>
              <span className="text-[#374151] ml-2.5 text-[11px]">{t.fields.length} fields</span>
            </div>
            <button onClick={() => setTpl({ ...t })} className="bg-[#0c1a2e] border border-blue-500 text-blue-500 px-2.5 py-1 text-[12px] cursor-pointer font-semibold font-ui">Edit</button>
          </div>
        ))}
      </div>
      <div>
        <div className="text-amber-400 text-[12px] font-bold tracking-[1.5px] mb-2.5">{tpl.id ? 'EDIT TEMPLATE' : 'NEW TEMPLATE'}</div>
        <div className="bg-[#090b10] border border-[#1e2533] p-4 flex flex-col gap-2.5">
          <div>
            <label className="text-[#6b7280] text-[11px] tracking-[1px] block mb-1">TEMPLATE NAME</label>
            <input value={tpl.name} onChange={e => setTpl(t => ({ ...t, name: e.target.value }))} className="w-full bg-[#090b10] border border-[#1e2533] text-slate-300 px-2.5 py-[7px] text-[13px] font-ui box-border outline-none" />
          </div>
          <div>
            <div className="text-[#6b7280] text-[11px] tracking-[1px] mb-1.5">FIELDS ({tpl.fields.length})</div>
            {tpl.fields.map((f, idx) => (
              <div key={f.id} className="bg-[#0d1117] border border-[#1f2937] px-2.5 py-[7px] mb-1 flex items-center gap-1.5 text-[13px]">
                <span className="text-[#374151]">{idx + 1}.</span>
                <span className="text-slate-300 flex-1">{f.label}</span>
                <span className="text-blue-500 text-[10px]">[{f.type}]</span>
                {f.required && <span className="text-red-500 text-[10px]">*</span>}
                <button onClick={() => moveField(idx, -1)} className="bg-[#0b0d14] border border-[#1f2937] text-[#4b5563] px-1.5 py-px text-[11px] cursor-pointer font-ui">^</button>
                <button onClick={() => moveField(idx, 1)} className="bg-[#0b0d14] border border-[#1f2937] text-[#4b5563] px-1.5 py-px text-[11px] cursor-pointer font-ui">v</button>
                <button onClick={() => setTpl(t => ({ ...t, fields: t.fields.filter((_, i) => i !== idx) }))} className="bg-[#450a0a] border border-[#991b1b] text-red-500 px-1.5 py-px text-[11px] cursor-pointer font-ui">X</button>
              </div>
            ))}
          </div>
          <div className="bg-[#0d1117] border border-dashed border-[#1e2533] p-2.5 flex flex-col gap-1.5">
            <div className="text-[#6b7280] text-[11px] tracking-[1px]">ADD FIELD</div>
            <div className="flex gap-1.5">
              <input value={newField.label} onChange={e => setNewField(f => ({ ...f, label: e.target.value }))} placeholder="Field label"
                className="bg-[#090b10] border border-[#1e2533] text-slate-300 px-2.5 py-[7px] text-[13px] font-ui box-border outline-none" style={{ flex: 2 }} />
              <select value={newField.type} onChange={e => setNewField(f => ({ ...f, type: e.target.value }))}
                className="bg-[#090b10] border border-[#1e2533] text-slate-300 px-2.5 py-[7px] text-[13px] font-ui box-border outline-none" style={{ flex: 1 }}>
                {['text','textarea','dropdown','checkbox','date','datetime','badge_lookup','civilian_lookup'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            {newField.type === 'dropdown' && (
              <input value={newField.options} onChange={e => setNewField(f => ({ ...f, options: e.target.value }))} placeholder="Options (comma-separated)"
                className="w-full bg-[#090b10] border border-[#1e2533] text-slate-300 px-2.5 py-[7px] text-[13px] font-ui box-border outline-none" />
            )}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-[#9ca3af] text-[13px] cursor-pointer">
                <input type="checkbox" checked={newField.required} onChange={e => setNewField(f => ({ ...f, required: e.target.checked }))} className="accent-blue-500" />
                Required
              </label>
              <button onClick={addField} className="ml-auto bg-[#0c1a2e] border border-blue-500 text-blue-500 px-2.5 py-1 text-[11px] font-bold cursor-pointer font-ui">+ Add Field</button>
            </div>
          </div>
          <button onClick={handleSave} className="w-full text-center bg-[#0c1a2e] border border-blue-500 text-blue-500 py-[9px] text-[13px] font-bold cursor-pointer font-ui tracking-[1px]">
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
    <div className="mt-3.5">
      <div className="text-amber-400 text-[12px] font-bold tracking-[1.5px] mb-3">SUPERVISOR REVIEW QUEUE — {pending.length} pending</div>
      {pending.length === 0 && <div className="text-[#374151] text-[14px]">No reports pending review.</div>}
      {pending.map(r => (
        <div key={r.id} className="bg-[#090b10] border border-[#1e2533] p-3 mb-2">
          <div className="flex justify-between items-center mb-1.5">
            <div>
              <span className="text-blue-500 font-bold text-[13px]">{r.caseNumber}</span>
              <span className="text-[#9ca3af] ml-3 text-[12px]">{r.type}</span>
              <span className="text-[#4b5563] ml-3 text-[11px]">Officer: {r.officerBadge}</span>
            </div>
            <StatusBadge status={r.status} />
          </div>
          <div className="text-[#4b5563] text-[12px] mb-2">{r.summary}</div>
          <div className="flex gap-1.5">
            <button onClick={() => dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id: r.id, status: 'Approved' } })} className="bg-[#052e16] border border-green-500 text-green-500 px-3.5 py-[5px] text-[12px] font-semibold cursor-pointer font-ui">Approve</button>
            <button onClick={() => dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id: r.id, status: 'Denied' } })} className="bg-[#450a0a] border border-red-500 text-red-500 px-3.5 py-[5px] text-[12px] font-semibold cursor-pointer font-ui">Deny</button>
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
    <div className="flex gap-0.5 border-b border-[#1f2937] overflow-x-auto">
      {tabs.map(t => (
        <button key={t} onClick={() => setActive(t)}
          className={`border-b-0 px-3.5 py-1.5 text-[12px] cursor-pointer font-ui transition-colors
            ${active === t
              ? 'bg-[#0f172a] border border-blue-500 text-blue-500'
              : 'bg-transparent border border-transparent text-[#4b5563]'}`}>
          {labels[t] || t}
        </button>
      ))}
    </div>
  );
}

function StatusSummary({ label, count, color }) {
  return (
    <div className="bg-[#090b10] px-3.5 py-[7px] text-center min-w-[70px]" style={{ border: `1px solid ${color}25` }}>
      <div className="text-[20px] font-bold" style={{ color }}>{count}</div>
      <div className="text-[#4b5563] text-[11px]">{label}</div>
    </div>
  );
}

function FieldRow({ label, value }) {
  return (
    <div className="flex gap-2.5">
      <span className="text-blue-500 text-[12px] min-w-[70px]">{label}:</span>
      <span className="text-[#9ca3af] text-[13px]">{value}</span>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/75 z-[2000] flex items-center justify-center">
      <div className="bg-[#0d1117] border border-[#1e2533] p-[22px] max-w-[540px] w-[90%] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="text-blue-500 font-bold text-[13px] font-ui">{title}</span>
          <button onClick={onClose} className="bg-none border-none text-[#4b5563] cursor-pointer text-[18px]">X</button>
        </div>
        {children}
      </div>
    </div>
  );
}
