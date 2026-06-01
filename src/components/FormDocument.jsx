/* PDF-style government form document components */

import { useState } from 'react';

/* ── Primitives ──────────────────────────────────────────────────── */

export function FormDocWrap({ children }) {
  return <div className="form-doc-wrap"><div className="form-doc">{children}</div></div>;
}

export function FormDocHeader({ agency = 'HILLSBOROUGH COUNTY SHERIFF\'S OFFICE', title, subtitle, caseNo, status }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '2px solid #000', flexShrink: 0 }}>
      {/* Left: Shield / seal placeholder */}
      <div style={{
        width: 64, flexShrink: 0, borderRight: '1px solid #000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '6px',
      }}>
        <svg viewBox="0 0 40 48" width="40" height="48" fill="none">
          <path d="M20 2L2 10v16c0 12 8 18 18 20C30 44 38 38 38 26V10L20 2z" stroke="#000" strokeWidth="1.5" fill="none"/>
          <path d="M20 7L6 14v12c0 9 6 14 14 16 8-2 14-7 14-16V14L20 7z" fill="#1a3a6a"/>
          <text x="20" y="32" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#fff" fontFamily="serif">★</text>
        </svg>
      </div>
      {/* Center: Agency + form title */}
      <div style={{ flex: 1, padding: '6px 10px', borderRight: '1px solid #000' }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#000', lineHeight: 1.4 }}>
          {agency}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', color: '#000', margin: '2px 0 1px' }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 8, color: '#444', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{subtitle}</div>
        )}
      </div>
      {/* Right: Case # box */}
      <div style={{ width: 140, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#fffde7', borderBottom: '1px solid #000', padding: '3px 6px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555', marginBottom: 2 }}>Case / Report No.</div>
          <div style={{ fontFamily: 'Courier New, monospace', fontSize: 11, fontWeight: 700, color: '#000', letterSpacing: '0.5px' }}>
            {caseNo || '________________'}
          </div>
        </div>
        {status && (
          <div style={{
            padding: '3px 6px', fontSize: 8, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.5px', textAlign: 'center',
            background: status === 'Approved' ? '#006600' : status === 'Pending Review' ? '#884400' : '#003399',
            color: '#fff',
          }}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}

/* A horizontal row that holds one or more FormCells */
export function FormRow({ children, style }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #ccc', minHeight: 36, ...style }}>
      {children}
    </div>
  );
}

/* A single labeled cell inside a FormRow */
export function FormCell({ label, value, onChange, type = 'text', options = [], mono, colSpan = 1, required, editable, style }) {
  const flex = colSpan;
  const labelStyle = {
    display: 'block', fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.5px',
    color: '#555', marginBottom: 2, fontFamily: 'Arial, sans-serif', fontWeight: 700,
  };
  const valueStyle = {
    fontFamily: mono ? 'Courier New, monospace' : 'inherit',
    fontSize: 11, color: '#000', minHeight: 14, lineHeight: 1.3,
  };
  const inputStyle = {
    width: '100%', border: 'none', outline: 'none', background: 'transparent',
    fontFamily: mono ? 'Courier New, monospace' : 'Arial, sans-serif',
    fontSize: 11, color: '#000', padding: 0, lineHeight: 1.3,
  };

  return (
    <div style={{
      flex, borderRight: '1px solid #ccc', padding: '3px 5px',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
      minWidth: 0, overflow: 'hidden',
      ':last-child': { borderRight: 'none' },
      ...style,
    }}>
      <span style={labelStyle}>{label}{required && <span style={{ color: '#cc0000' }}> *</span>}</span>
      {editable ? (
        type === 'textarea' ? (
          <textarea
            style={{ ...inputStyle, resize: 'none', height: 60, overflowY: 'auto' }}
            value={value || ''}
            onChange={e => onChange && onChange(e.target.value)}
          />
        ) : type === 'dropdown' ? (
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={value || ''} onChange={e => onChange && onChange(e.target.value)}>
            <option value="">—</option>
            {options.map(o => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <input
            type={type === 'datetime' ? 'datetime-local' : 'text'}
            style={inputStyle}
            value={value || ''}
            onChange={e => onChange && onChange(e.target.value)}
          />
        )
      ) : (
        <span style={valueStyle}>{value || <span style={{ color: '#aaa' }}>—</span>}</span>
      )}
    </div>
  );
}

/* Gray section divider bar */
export function FormSection({ title, dark, blue }) {
  return (
    <div style={{
      padding: '2px 6px',
      background: blue ? '#1a3a6a' : dark ? '#333' : '#d0d0d0',
      color: blue || dark ? '#fff' : '#000',
      fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px',
      borderBottom: '1px solid #888', borderTop: '1px solid #888',
      flexShrink: 0,
    }}>
      {title}
    </div>
  );
}

/* Wide narrative text block */
export function FormNarrative({ label = 'NARRATIVE', value, onChange, editable, minRows = 5 }) {
  return (
    <div style={{ borderBottom: '1px solid #ccc', padding: '3px 5px' }}>
      <div style={{ fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555', marginBottom: 3, fontWeight: 700 }}>
        {label}
      </div>
      {editable ? (
        <textarea
          style={{
            width: '100%', border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'Courier New, monospace', fontSize: 11, color: '#000',
            resize: 'none', padding: 0, lineHeight: 1.6,
            minHeight: minRows * 18,
          }}
          value={value || ''}
          onChange={e => onChange && onChange(e.target.value)}
        />
      ) : (
        <div style={{
          fontFamily: 'Courier New, monospace', fontSize: 11, color: '#000',
          lineHeight: 1.6, minHeight: minRows * 18, whiteSpace: 'pre-wrap',
        }}>
          {value || <span style={{ color: '#aaa' }}>No narrative on file.</span>}
        </div>
      )}
    </div>
  );
}

/* Checkbox row */
export function FormCheckboxes({ label, items, values = {}, onChange, editable }) {
  return (
    <div style={{ borderBottom: '1px solid #ccc', padding: '4px 6px' }}>
      {label && (
        <div style={{ fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555', marginBottom: 4, fontWeight: 700 }}>
          {label}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
        {items.map(item => (
          <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: editable ? 'pointer' : 'default', fontSize: 10, color: '#000', fontFamily: 'Arial, sans-serif' }}>
            <input
              type="checkbox"
              checked={!!values[item.id]}
              onChange={e => onChange && onChange(item.id, e.target.checked)}
              disabled={!editable}
              style={{ width: 11, height: 11, cursor: editable ? 'pointer' : 'default', accentColor: '#000' }}
            />
            {item.label}
          </label>
        ))}
      </div>
    </div>
  );
}

/* Signature row */
export function FormSignatureRow({ slots }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #ccc', minHeight: 48 }}>
      {slots.map((s, i) => (
        <div key={i} style={{ flex: 1, borderRight: i < slots.length - 1 ? '1px solid #ccc' : 'none', padding: '4px 6px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ borderBottom: '1px solid #000', marginBottom: 2, minHeight: 20 }} />
          <div style={{ fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555', fontWeight: 700 }}>{s}</div>
        </div>
      ))}
    </div>
  );
}

/* Form footer */
export function FormDocFooter({ left, right }) {
  return (
    <div className="form-doc-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>{left}</span>
      <span>SSRP CAD SYSTEM — HILLSBOROUGH COUNTY</span>
      <span>{right}</span>
    </div>
  );
}

/* ── Alert/Flag bar ────────────────────────────────────────────── */
export function FormAlert({ text, level = 'red' }) {
  return <div className={`form-doc-alert ${level}`}><span>⚠</span>{text}</div>;
}

/* ── Specific document layouts ────────────────────────────────── */

export function TrafficStopDoc({ data = {}, editable, onChange, meta = {} }) {
  const fv = (k) => data[k] || '';
  const ch = (k) => !!data[k];
  const set = (k) => (v) => onChange && onChange(k, v);

  return (
    <>
      <FormDocHeader
        agency="TAMPA POLICE DEPARTMENT / HILLSBOROUGH COUNTY"
        title="Traffic Stop Report"
        subtitle="Form TPD-TS-001 · For Official Use Only"
        caseNo={meta.caseNumber}
        status={meta.status}
      />
      <FormSection title="Incident Information" blue />
      <FormRow>
        <FormCell label="Date / Time" value={fv('f1')} onChange={set('f1')} type="datetime" editable={editable} colSpan={2} />
        <FormCell label="Location of Stop" value={fv('f3')} onChange={set('f3')} editable={editable} colSpan={3} />
        <FormCell label="Officer Badge #" value={fv('f2')} onChange={set('f2')} type="badge_lookup" editable={editable} mono colSpan={1} />
      </FormRow>
      <FormSection title="Subject / Vehicle Information" />
      <FormRow>
        <FormCell label="Driver Name" value={fv('f5')} onChange={set('f5')} editable={editable} colSpan={3} />
        <FormCell label="Vehicle Plate" value={fv('f4')} onChange={set('f4')} editable={editable} mono colSpan={2} />
        <FormCell label="Outcome" value={fv('f9')} onChange={set('f9')} type="dropdown"
          options={['Warning','Citation','Arrest','No Action']} editable={editable} colSpan={1} />
      </FormRow>
      <FormRow>
        <FormCell label="Reason for Stop" value={fv('f6')} onChange={set('f6')} type="dropdown"
          options={['Speeding','Red Light Violation','Equipment Violation','Expired Registration','Erratic Driving','Other']}
          editable={editable} colSpan={6} />
      </FormRow>
      <FormCheckboxes
        label="Actions Taken"
        items={[
          { id: 'f7', label: 'DL Checked' },
          { id: 'f8', label: 'Sobriety Test Administered' },
        ]}
        values={data}
        onChange={(k, v) => onChange && onChange(k, v)}
        editable={editable}
      />
      <FormSection title="Narrative" />
      <FormNarrative value={fv('f10')} onChange={set('f10')} editable={editable} />
      <FormSignatureRow slots={['Officer Signature / Badge #', 'Supervisor Signature', 'Date']} />
      <FormDocFooter left="TPD-TS-001 Rev. 2026-01" right={`Page 1 of 1`} />
    </>
  );
}

export function UseOfForceDoc({ data = {}, editable, onChange, meta = {} }) {
  const fv = (k) => data[k] || '';
  const set = (k) => (v) => onChange && onChange(k, v);

  return (
    <>
      <FormDocHeader
        agency="TAMPA POLICE DEPARTMENT / HILLSBOROUGH COUNTY"
        title="Use of Force Report"
        subtitle="Form TPD-UOF-001 · SUPERVISOR REVIEW REQUIRED"
        caseNo={meta.caseNumber}
        status={meta.status}
      />
      {meta.status === 'Pending Review' && <FormAlert text="PENDING SUPERVISOR REVIEW — DO NOT DISTRIBUTE" level="orange" />}
      <FormSection title="Incident Information" blue />
      <FormRow>
        <FormCell label="Date / Time" value={fv('f1')} onChange={set('f1')} type="datetime" editable={editable} colSpan={2} />
        <FormCell label="Location" value={fv('f4')} onChange={set('f4')} editable={editable} colSpan={3} />
        <FormCell label="Officer Badge #" value={fv('f2')} onChange={set('f2')} editable={editable} mono colSpan={1} />
      </FormRow>
      <FormRow>
        <FormCell label="Subject Name" value={fv('f3')} onChange={set('f3')} editable={editable} colSpan={6} />
      </FormRow>
      <FormSection title="Force Used" />
      <FormRow>
        <FormCell label="Type of Force" value={fv('f5')} onChange={set('f5')} type="dropdown"
          options={['Verbal Commands','Soft Empty Hand','Hard Empty Hand','OC Spray','Taser','Impact Weapon','K9','Firearm']}
          editable={editable} colSpan={6} />
      </FormRow>
      <FormCheckboxes
        label="Injuries / EMS"
        items={[
          { id: 'f7', label: 'Subject Injured' },
          { id: 'f8', label: 'Officer Injured' },
          { id: 'f9', label: 'EMS Called' },
        ]}
        values={data}
        onChange={(k, v) => onChange && onChange(k, v)}
        editable={editable}
      />
      <FormSection title="Reason for Use of Force" />
      <FormNarrative label="REASON FOR USE OF FORCE" value={fv('f6')} onChange={set('f6')} editable={editable} minRows={3} />
      <FormSection title="Full Narrative" />
      <FormNarrative value={fv('f10')} onChange={set('f10')} editable={editable} />
      <FormSignatureRow slots={['Officer Signature / Badge #', 'Supervisor Signature / Badge #', 'Review Date']} />
      <FormDocFooter left="TPD-UOF-001 Rev. 2026-01" right="Page 1 of 1" />
    </>
  );
}

export function ArrestReportDoc({ data = {}, editable, onChange, meta = {} }) {
  const fv = (k) => data[k] || '';
  const set = (k) => (v) => onChange && onChange(k, v);

  return (
    <>
      <FormDocHeader
        agency="TAMPA POLICE DEPARTMENT / HILLSBOROUGH COUNTY"
        title="Arrest Report"
        subtitle="Form TPD-AR-001 · For Official Use Only"
        caseNo={meta.caseNumber}
        status={meta.status}
      />
      <FormSection title="Arrest Information" blue />
      <FormRow>
        <FormCell label="Date / Time of Arrest" value={fv('f1')} onChange={set('f1')} type="datetime" editable={editable} colSpan={2} />
        <FormCell label="Location of Arrest" value={fv('f4')} onChange={set('f4')} editable={editable} colSpan={3} />
        <FormCell label="Arresting Officer Badge" value={fv('f2')} onChange={set('f2')} editable={editable} mono colSpan={1} />
      </FormRow>
      <FormSection title="Arrestee Information" />
      <FormRow>
        <FormCell label="Arrestee Name" value={fv('f3')} onChange={set('f3')} editable={editable} colSpan={4} />
        <FormCell label="Bail Amount ($)" value={fv('f6')} onChange={set('f6')} editable={editable} mono colSpan={2} />
      </FormRow>
      <FormSection title="Charges" />
      <FormNarrative label="CHARGES / STATUTES" value={fv('f5')} onChange={set('f5')} editable={editable} minRows={2} />
      <FormCheckboxes
        label="Evidence / Seizures"
        items={[
          { id: 'f7', label: 'Weapons Seized' },
          { id: 'f8', label: 'Narcotics / Drugs Seized' },
        ]}
        values={data}
        onChange={(k, v) => onChange && onChange(k, v)}
        editable={editable}
      />
      {(data.f8 || data.f7 || fv('f9')) && (
        <>
          <FormSection title="Evidence Collected" />
          <FormNarrative label="EVIDENCE DESCRIPTION" value={fv('f9')} onChange={set('f9')} editable={editable} minRows={2} />
        </>
      )}
      <FormSection title="Arrest Narrative" />
      <FormNarrative value={fv('f10')} onChange={set('f10')} editable={editable} />
      <FormSignatureRow slots={['Arresting Officer / Badge #', 'Supervisor / Badge #', 'Booking Officer / Date']} />
      <FormDocFooter left="TPD-AR-001 Rev. 2026-01" right="Page 1 of 1" />
    </>
  );
}

export function IncidentReportDoc({ data = {}, editable, onChange, meta = {} }) {
  const fv = (k) => data[k] || '';
  const set = (k) => (v) => onChange && onChange(k, v);

  return (
    <>
      <FormDocHeader
        agency="HILLSBOROUGH COUNTY SHERIFF'S OFFICE / LAW ENFORCEMENT"
        title="Incident Report"
        subtitle="Form HCSO-IR-001 · For Official Use Only"
        caseNo={meta.caseNumber}
        status={meta.status}
      />
      <FormSection title="Incident Information" blue />
      <FormRow>
        <FormCell label="Date / Time" value={fv('f1')} onChange={set('f1')} type="datetime" editable={editable} colSpan={2} />
        <FormCell label="Location" value={fv('f4')} onChange={set('f4')} editable={editable} colSpan={3} />
        <FormCell label="Reporting Officer Badge" value={fv('f2')} onChange={set('f2')} editable={editable} mono colSpan={1} />
      </FormRow>
      <FormRow>
        <FormCell label="Incident Type" value={fv('f3')} onChange={set('f3')} type="dropdown"
          options={['MVA','Property Damage','Theft','Vandalism','Disturbance','Other']}
          editable={editable} colSpan={6} />
      </FormRow>
      <FormCheckboxes
        label="Conditions"
        items={[
          { id: 'f6', label: 'Injuries Reported' },
          { id: 'f7', label: 'Property Damage' },
        ]}
        values={data}
        onChange={(k, v) => onChange && onChange(k, v)}
        editable={editable}
      />
      <FormSection title="Parties Involved" />
      <FormNarrative label="PARTIES INVOLVED" value={fv('f5')} onChange={set('f5')} editable={editable} minRows={2} />
      <FormSection title="Narrative" />
      <FormNarrative value={fv('f8')} onChange={set('f8')} editable={editable} />
      <FormSignatureRow slots={['Reporting Officer / Badge #', 'Supervisor Signature', 'Date']} />
      <FormDocFooter left="HCSO-IR-001 Rev. 2026-01" right="Page 1 of 1" />
    </>
  );
}

export function FieldInterviewDoc({ data = {}, editable, onChange, meta = {} }) {
  const fv = (k) => data[k] || '';
  const set = (k) => (v) => onChange && onChange(k, v);

  return (
    <>
      <FormDocHeader
        agency="HILLSBOROUGH COUNTY LAW ENFORCEMENT"
        title="Field Interview Card"
        subtitle="Form HCSO-FI-001 · For Official Use Only"
        caseNo={meta.caseNumber}
        status={meta.status}
      />
      <FormSection title="Contact Information" blue />
      <FormRow>
        <FormCell label="Date / Time" value={fv('f1')} onChange={set('f1')} type="datetime" editable={editable} colSpan={2} />
        <FormCell label="Location" value={fv('f4')} onChange={set('f4')} editable={editable} colSpan={3} />
        <FormCell label="Officer Badge #" value={fv('f2')} onChange={set('f2')} editable={editable} mono colSpan={1} />
      </FormRow>
      <FormRow>
        <FormCell label="Subject Name" value={fv('f3')} onChange={set('f3')} editable={editable} colSpan={4} />
        <FormCell label="Associates Present" value={fv('f7')} onChange={set('f7')} editable={editable} colSpan={2} />
      </FormRow>
      <FormSection title="Contact Details" />
      <FormNarrative label="REASON FOR CONTACT" value={fv('f5')} onChange={set('f5')} editable={editable} minRows={2} />
      <FormNarrative label="SUBJECT DESCRIPTION" value={fv('f6')} onChange={set('f6')} editable={editable} minRows={2} />
      <FormRow>
        <FormCell label="Outcome" value={fv('f8')} onChange={set('f8')} type="dropdown"
          options={['No Action','Warned','Cited','Arrested','Referred']}
          editable={editable} colSpan={6} />
      </FormRow>
      <FormSection title="Notes" />
      <FormNarrative label="ADDITIONAL NOTES" value={fv('f9')} onChange={set('f9')} editable={editable} minRows={2} />
      <FormSignatureRow slots={['Officer Signature / Badge #', 'Date']} />
      <FormDocFooter left="HCSO-FI-001 Rev. 2026-01" right="Page 1 of 1" />
    </>
  );
}

export function SupplementReportDoc({ data = {}, editable, onChange, meta = {} }) {
  const fv = (k) => data[k] || '';
  const set = (k) => (v) => onChange && onChange(k, v);

  return (
    <>
      <FormDocHeader
        agency="HILLSBOROUGH COUNTY LAW ENFORCEMENT"
        title="Supplement Report"
        subtitle="Form HCSO-SUPP-001 · For Official Use Only"
        caseNo={meta.caseNumber}
        status={meta.status}
      />
      <FormSection title="Supplement Reference" blue />
      <FormRow>
        <FormCell label="Original Case Number" value={fv('f1')} onChange={set('f1')} editable={editable} mono colSpan={3} required />
        <FormCell label="Date / Time" value={fv('f2')} onChange={set('f2')} type="datetime" editable={editable} colSpan={2} />
        <FormCell label="Author Badge #" value={fv('f3')} onChange={set('f3')} editable={editable} mono colSpan={1} />
      </FormRow>
      <FormSection title="Supplement Narrative" />
      <FormNarrative value={fv('f4')} onChange={set('f4')} editable={editable} minRows={6} />
      {(editable || fv('f5')) && (
        <>
          <FormSection title="New Evidence / Information" />
          <FormNarrative label="NEW EVIDENCE" value={fv('f5')} onChange={set('f5')} editable={editable} minRows={3} />
        </>
      )}
      <FormSignatureRow slots={['Supplement Author / Badge #', 'Supervisor Approval', 'Date']} />
      <FormDocFooter left="HCSO-SUPP-001 Rev. 2026-01" right="Page 1 of 1" />
    </>
  );
}

/* ── Generic fallback for unknown template types ─────────────── */
export function GenericFormDoc({ template, data = {}, editable, onChange, meta = {} }) {
  const fv = (k) => data[k] || '';
  const set = (k) => (v) => onChange && onChange(k, v);
  const textFields = template?.fields?.filter(f => f.type !== 'textarea' && f.type !== 'checkbox') || [];
  const checks = template?.fields?.filter(f => f.type === 'checkbox') || [];
  const narratives = template?.fields?.filter(f => f.type === 'textarea') || [];

  return (
    <>
      <FormDocHeader
        agency="HILLSBOROUGH COUNTY LAW ENFORCEMENT"
        title={template?.name || 'Report'}
        subtitle="For Official Use Only"
        caseNo={meta.caseNumber}
        status={meta.status}
      />
      <FormSection title="Report Fields" blue />
      {textFields.length > 0 && (
        <FormRow style={{ flexWrap: 'wrap', height: 'auto' }}>
          {textFields.map(f => (
            <FormCell
              key={f.id}
              label={f.label}
              value={fv(f.id)}
              onChange={set(f.id)}
              type={f.type}
              options={f.options}
              editable={editable}
              required={f.required}
              colSpan={1}
            />
          ))}
        </FormRow>
      )}
      {checks.length > 0 && (
        <FormCheckboxes
          items={checks.map(f => ({ id: f.id, label: f.label }))}
          values={data}
          onChange={(k, v) => onChange && onChange(k, v)}
          editable={editable}
        />
      )}
      {narratives.map(f => (
        <div key={f.id}>
          <FormSection title={f.label} />
          <FormNarrative label={f.label.toUpperCase()} value={fv(f.id)} onChange={set(f.id)} editable={editable} />
        </div>
      ))}
      <FormSignatureRow slots={['Officer Signature / Badge #', 'Supervisor Signature', 'Date']} />
      <FormDocFooter left={`${template?.name || 'FORM'} Rev. 2026-01`} right="Page 1 of 1" />
    </>
  );
}

/* ── Route to the right form by type name ────────────────────── */
export function ReportDocument({ type, template, data, editable, onChange, meta }) {
  const props = { data, editable, onChange, meta };
  switch (type) {
    case 'Traffic Stop':     return <TrafficStopDoc {...props} />;
    case 'Use of Force':     return <UseOfForceDoc {...props} />;
    case 'Arrest Report':    return <ArrestReportDoc {...props} />;
    case 'Incident Report':  return <IncidentReportDoc {...props} />;
    case 'Field Interview':  return <FieldInterviewDoc {...props} />;
    case 'Supplement Report':return <SupplementReportDoc {...props} />;
    default:                 return <GenericFormDoc template={template} {...props} />;
  }
}

/* ── NCIC-style Record Return ─────────────────────────────────── */
export function RecordReturn({ type, subject, data }) {
  const line = (key, val) => val ? (
    <div className="record-return-line" key={key}>
      <span className="record-return-key">{key}</span>
      <span className="record-return-val">{val}</span>
    </div>
  ) : null;

  if (type === 'PERSON' && data) {
    const flags = data.flags || [];
    const hasWarrant = flags.includes('WARRANT');
    const dlSusp = data.dlStatus === 'SUSPENDED';
    return (
      <div className="record-return">
        <div className="record-return-header">
          <span>FCIC/NCIC — PERSON RECORD RETURN</span>
          <span>{new Date().toLocaleString()}</span>
        </div>
        {hasWarrant && (
          <div style={{ padding: '4px 10px', background: '#cc0000', color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: 'Courier New', letterSpacing: '0.5px' }}>
            *** ACTIVE WARRANT ON FILE — DO NOT APPROACH WITHOUT BACKUP ***
          </div>
        )}
        {dlSusp && (
          <div style={{ padding: '4px 10px', background: '#cc5500', color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: 'Courier New', letterSpacing: '0.5px' }}>
            *** DRIVER LICENSE SUSPENDED — NO VALID DL ***
          </div>
        )}
        <div className="record-return-body">
          <div className="record-return-section">SUBJECT IDENTIFICATION</div>
          {line('NAME', `${data.lastName}, ${data.firstName}`)}
          {line('DOB', data.dob)}
          {line('SEX', data.gender)}
          {line('RACE/ETHNICITY', data.ethnicity)}
          {line('HEIGHT', data.height)}
          {line('WEIGHT', data.weight)}
          {line('HAIR', data.hair)}
          {line('EYES', data.eyes)}
          <div className="record-return-section">IDENTIFIERS</div>
          {line('SSN', data.ssn)}
          {line('ADDRESS', data.address)}
          {line('PHONE', data.phone)}
          <div className="record-return-section">DRIVER LICENSE</div>
          {line('DL NUMBER', data.dlNumber)}
          {line('DL CLASS', data.dlClass)}
          {line('DL STATUS', data.dlStatus)}
          {line('DL EXPIRY', data.dlExpiry)}
          {flags.length > 0 && (
            <>
              <div className="record-return-section">FLAGS / ALERTS</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '3px 0' }}>
                {flags.map(f => <span key={f} className="record-return-flag">{f}</span>)}
                {dlSusp && <span className="record-return-flag warn">DL SUSPENDED</span>}
              </div>
            </>
          )}
          <div style={{ fontSize: 9, marginTop: 10, color: '#666', fontFamily: 'Courier New', letterSpacing: '0.3px' }}>
            END OF RETURN — HCSO RMS — {new Date().toLocaleString().toUpperCase()}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'VEHICLE' && data) {
    return (
      <div className="record-return">
        <div className="record-return-header">
          <span>FCIC/NCIC — VEHICLE RECORD RETURN</span>
          <span>{new Date().toLocaleString()}</span>
        </div>
        {data.stolen && (
          <div style={{ padding: '4px 10px', background: '#cc0000', color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: 'Courier New', letterSpacing: '0.5px' }}>
            *** STOLEN VEHICLE — CAUTION ADVISED — CONTACT LOCAL LE IMMEDIATELY ***
          </div>
        )}
        {subject && subject.flags?.includes('WARRANT') && (
          <div style={{ padding: '4px 10px', background: '#cc5500', color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: 'Courier New', letterSpacing: '0.5px' }}>
            *** REGISTERED OWNER HAS ACTIVE WARRANT ON FILE ***
          </div>
        )}
        <div className="record-return-body">
          <div className="record-return-section">VEHICLE REGISTRATION</div>
          {line('PLATE', data.plate)}
          {line('STATE', 'FLORIDA')}
          {line('YEAR', String(data.year))}
          {line('MAKE', data.make)}
          {line('MODEL', data.model)}
          {line('COLOR', data.color)}
          {line('REG STATUS', data.regStatus)}
          {line('REG EXPIRY', data.regExpiry)}
          {line('STOLEN', data.stolen ? 'YES — REPORTED STOLEN' : 'NO')}
          {subject && (
            <>
              <div className="record-return-section">REGISTERED OWNER</div>
              {line('NAME', `${subject.lastName}, ${subject.firstName}`)}
              {line('DOB', subject.dob)}
              {line('ADDRESS', subject.address)}
              {line('PHONE', subject.phone)}
              {line('DL STATUS', subject.dlStatus)}
              {subject.flags?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '3px 0', marginTop: 2 }}>
                  {subject.flags.map(f => <span key={f} className="record-return-flag">{f}</span>)}
                </div>
              )}
            </>
          )}
          {data.flags?.length > 0 && (
            <>
              <div className="record-return-section">VEHICLE FLAGS</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '3px 0' }}>
                {data.flags.map(f => <span key={f} className="record-return-flag warn">{f}</span>)}
              </div>
            </>
          )}
          <div style={{ fontSize: 9, marginTop: 10, color: '#666', fontFamily: 'Courier New', letterSpacing: '0.3px' }}>
            END OF RETURN — HCSO RMS — {new Date().toLocaleString().toUpperCase()}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'WARRANT' && data) {
    return (
      <div className="record-return">
        <div className="record-return-header">
          <span>FCIC/NCIC — WARRANT RETURN</span>
          <span>{new Date().toLocaleString()}</span>
        </div>
        {data.status === 'ACTIVE' && (
          <div style={{ padding: '4px 10px', background: '#cc0000', color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: 'Courier New', letterSpacing: '0.5px' }}>
            *** ACTIVE WARRANT — SUBJECT MAY BE APPREHENDED ***
          </div>
        )}
        <div className="record-return-body">
          <div className="record-return-section">WARRANT INFORMATION</div>
          {line('STATUS', data.status)}
          {line('TYPE', data.type)}
          {line('SUBJECT', data.civilianName)}
          {line('CHARGE', data.charge)}
          {line('ISSUED BY', data.issuedBy)}
          {line('ISSUE DATE', data.issuedDate)}
          {data.notes && line('NOTES', data.notes)}
          <div style={{ fontSize: 9, marginTop: 10, color: '#666', fontFamily: 'Courier New', letterSpacing: '0.3px' }}>
            END OF RETURN — HCSO RMS — {new Date().toLocaleString().toUpperCase()}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
