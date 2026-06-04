/* PDF-style government form document components */

import React, { useState } from 'react';
import Select from './ui/Select';
import { MdPerson, MdDirectionsCar, MdGavel } from 'react-icons/md';
import { useCAD } from '../store/cadStore';
import { ageFromDob } from '../utils/age';
import {
  S_RECORD_RETURN, S_RECORD_RETURN_HEADER, S_RECORD_RETURN_ALERT, S_RECORD_RETURN_ALERT_WARN,
  S_RECORD_RETURN_BODY, S_RECORD_RETURN_SECTION, S_RECORD_RETURN_LINE,
  S_RECORD_RETURN_KEY, S_RECORD_RETURN_VAL,
  S_RECORD_RETURN_FOOTER, S_RECORD_RETURN_FLAG, S_RECORD_RETURN_FLAG_WARN,
  S_FORM_DOC_WRAP, S_FORM_DOC,
  S_FORM_DOC_FOOTER_S,
  S_FORM_DOC_ALERT_RED, S_FORM_DOC_ALERT_ORANGE, S_FORM_DOC_ALERT_YELLOW,
} from '../constants/styles';

export const FormMetaContext = React.createContext({});

/* ── Primitives ──────────────────────────────────────────────────── */

export function FormDocWrap({ children, meta = {} }) {
  return (
    <FormMetaContext.Provider value={meta}>
      <div className={S_FORM_DOC_WRAP}>
        <div style={S_FORM_DOC}>{children}</div>
      </div>
    </FormMetaContext.Provider>
  );
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
    <div style={{ display: 'flex', borderBottom: '1px solid #ccc', minHeight: 48, ...style }}>
      {children}
    </div>
  );
}

/* A single labeled cell inside a FormRow */
export function FormCell({ label, value, onChange, type = 'text', options = [], mono, colSpan = 1, required, editable, style }) {
  const flex = colSpan;
  const labelStyle = {
    display: 'block', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.5px',
    color: '#666', marginBottom: 3, fontFamily: 'Arial, sans-serif', fontWeight: 700, lineHeight: 1,
  };
  const valueStyle = {
    fontFamily: mono ? 'Courier New, monospace' : 'inherit',
    fontSize: 12, color: '#000', minHeight: 16, lineHeight: 1.3,
  };
  const inputStyle = {
    width: '100%', border: 'none', outline: 'none', background: 'transparent',
    fontFamily: mono ? 'Courier New, monospace' : 'Arial, sans-serif',
    fontSize: 12, color: '#000', padding: 0, lineHeight: 1.3, cursor: 'text',
  };

  return (
    <div
      style={{
        flex, borderRight: '1px solid #ccc', padding: '5px 7px',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
        minWidth: 0, overflow: 'hidden', transition: 'background 0.1s',
        ...style,
      }}
      onMouseEnter={editable ? e => { e.currentTarget.style.background = '#fffde7'; } : undefined}
      onMouseLeave={editable ? e => { e.currentTarget.style.background = ''; } : undefined}
    >
      <span style={labelStyle}>{label}{required && <span style={{ color: '#cc0000' }}> *</span>}</span>
      {editable ? (
        type === 'textarea' ? (
          <textarea
            style={{ ...inputStyle, resize: 'none', height: 72, overflowY: 'auto' }}
            value={value || ''}
            onChange={e => onChange && onChange(e.target.value)}
          />
        ) : type === 'dropdown' ? (
          <Select style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }} value={value || ''} onChange={e => onChange && onChange(e.target.value)}>
            <option value="">—</option>
            {options.map(o => <option key={o}>{o}</option>)}
          </Select>
        ) : (type === 'date' || type === 'datetime') ? (
          <div style={{ position: 'relative', overflow: 'hidden', height: 22 }}>
            <input
              type={type === 'datetime' ? 'datetime-local' : 'date'}
              style={{ ...inputStyle, position: 'absolute', inset: 0, width: '100%', height: '100%', colorScheme: 'light' }}
              value={value || ''}
              onChange={e => onChange && onChange(e.target.value)}
            />
          </div>
        ) : (
          <input
            type={type === 'number' ? 'number' : 'text'}
            style={inputStyle}
            value={value || ''}
            onChange={e => onChange && onChange(e.target.value)}
          />
        )
      ) : (
        <span style={valueStyle}>{value || <span style={{ color: '#bbb' }}>—</span>}</span>
      )}
    </div>
  );
}

/* Gray section divider bar */
export function FormSection({ title, dark, blue }) {
  return (
    <div
      data-section={title}
      style={{
        padding: '2px 6px',
        background: blue ? '#1a3a6a' : dark ? '#333' : '#d0d0d0',
        color: blue || dark ? '#fff' : '#000',
        fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px',
        borderBottom: '1px solid #888', borderTop: '1px solid #888',
        flexShrink: 0, scrollMarginTop: 8,
      }}>
      {title}
    </div>
  );
}

/* Wide narrative text block */
export function FormNarrative({ label = 'NARRATIVE', value, onChange, editable, minRows = 5 }) {
  return (
    <div style={{ borderBottom: '1px solid #ccc', padding: '5px 7px', background: editable ? '#fffde7' : undefined, transition: 'background 0.1s' }}>
      <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666', marginBottom: 4, fontWeight: 700 }}>
        {label}
      </div>
      {editable ? (
        <textarea
          style={{
            width: '100%', border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'Courier New, monospace', fontSize: 12, color: '#000',
            resize: 'vertical', padding: 0, lineHeight: 1.7,
            minHeight: minRows * 20,
          }}
          value={value || ''}
          onChange={e => onChange && onChange(e.target.value)}
        />
      ) : (
        <div style={{
          fontFamily: 'Courier New, monospace', fontSize: 12, color: '#000',
          lineHeight: 1.7, minHeight: minRows * 20, whiteSpace: 'pre-wrap',
        }}>
          {value || <span style={{ color: '#bbb' }}>No narrative on file.</span>}
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

/* Signature row * slots: string labels; values: { officerSignature, supervisorSignature, date } */
export function FormSignatureRow({ slots, meta = {} }) {
  const slotValues = [meta.officerSignature, meta.supervisorSignature, meta.dateTime || meta.date];
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #ccc', minHeight: 56 }}>
      {slots.map((s, i) => {
        const isSupervisor = s.toLowerCase().includes('supervisor');
        const isOfficer    = i === 0;
        const filled       = slotValues[i];
        return (
          <div key={i} style={{
            flex: 1,
            borderRight: i < slots.length - 1 ? '1px solid #ccc' : 'none',
            padding: '5px 8px',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            background: isSupervisor && !filled ? '#fff5f5' : isOfficer && filled ? '#fffdf0' : undefined,
          }}>
            {filled ? (
              <div style={{
                fontFamily: 'Courier New, monospace', fontSize: 11, fontWeight: 700,
                color: isSupervisor ? '#15803d' : '#92400e',
                marginBottom: 4, wordBreak: 'break-all',
              }}>{filled}</div>
            ) : (
              <div style={{ borderBottom: isSupervisor ? '1px dashed #dc2626' : '1px solid #000', marginBottom: 6, minHeight: 22 }} />
            )}
            <div style={{
              fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.5px',
              color: isSupervisor ? '#dc2626' : '#555',
              fontWeight: 700, fontFamily: 'Arial, sans-serif',
            }}>{s}</div>
          </div>
        );
      })}
    </div>
  );
}

/* Form footer */
export function FormDocFooter({ left, right }) {
  return (
    <div style={{ ...S_FORM_DOC_FOOTER_S, display: 'flex', justifyContent: 'space-between' }}>
      <span>{left}</span>
      <span>SSRP CAD SYSTEM</span>
      <span>{right}</span>
    </div>
  );
}

/* ── Alert/Flag bar ────────────────────────────────────────────── */
export function FormAlert({ text, level = 'red' }) {
  const alertStyle = level === 'red' ? S_FORM_DOC_ALERT_RED : level === 'orange' ? S_FORM_DOC_ALERT_ORANGE : S_FORM_DOC_ALERT_YELLOW;
  return <div style={alertStyle}><span>⚠</span>{text}</div>;
}

/* ── Specific document layouts ────────────────────────────────── */

export function TrafficStopDoc({ data = {}, editable, onChange, meta = {} }) {
  const fv = (k) => data[k] || '';
  const ch = (k) => !!data[k];
  const set = (k) => (v) => onChange && onChange(k, v);

  return (
    <>
      <FormDocHeader
        agency="TAMPA POLICE DEPARTMENT"
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
        agency="TAMPA POLICE DEPARTMENT"
        title="Use of Force Report"
        subtitle="Form TPD-UOF-001 · SUPERVISOR REVIEW REQUIRED"
        caseNo={meta.caseNumber}
        status={meta.status}
      />
      {meta.status === 'Pending Review' && <FormAlert text="PENDING SUPERVISOR REVIEW · DO NOT DISTRIBUTE" level="orange" />}
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
        agency="TAMPA POLICE DEPARTMENT"
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
        agency="SUNSHINE STATE RP LAW ENFORCEMENT / LAW ENFORCEMENT"
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
        agency="SUNSHINE STATE RP LAW ENFORCEMENT"
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
        agency="SUNSHINE STATE RP LAW ENFORCEMENT"
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
        agency="SUNSHINE STATE RP LAW ENFORCEMENT"
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

/* ── Dynamic form renderer * renders any sections-based template ─ */

function packRows(fields, cols = 4) {
  const rows = [];
  let row = [];
  let rowSpan = 0;
  for (const f of fields) {
    const span = Math.min(f.span || 1, cols);
    if (rowSpan + span > cols && row.length > 0) {
      rows.push(row);
      row = [f];
      rowSpan = span;
    } else {
      row.push(f);
      rowSpan += span;
    }
  }
  if (row.length) rows.push(row);
  return rows;
}

export function DynamicFormDoc({ template, data = {}, editable, onChange, meta = {} }) {
  const fv = (k) => (data[k] !== undefined ? data[k] : '');
  const set = (k) => (v) => onChange && onChange(k, v);
  const sections = template?.sections || [];

  return (
    <>
      <FormDocHeader
        agency={template?.agency || 'SUNSHINE STATE RP LAW ENFORCEMENT'}
        title={template?.name || 'Report'}
        subtitle={template?.formCode ? `Form ${template.formCode} · For Official Use Only` : 'For Official Use Only'}
        caseNo={meta.caseNumber}
        status={meta.status}
      />
      {template?.showDept !== false && (meta.department || data._issuingDept) && (
        <FormRow style={{ minHeight: 32, borderBottom: '1px solid #bbb' }}>
          <FormCell label="Issuing Department" value={data._issuingDept || meta.department} colSpan={4} editable={false} />
        </FormRow>
      )}
      {sections.map(section => {
        const inlineFields  = section.fields.filter(f => f.type !== 'checkbox' && f.type !== 'textarea' && f.type !== 'supplemental');
        const checkboxFields = section.fields.filter(f => f.type === 'checkbox');
        const narrativeFields = section.fields.filter(f => f.type === 'textarea');
        const supplementalFields = section.fields.filter(f => f.type === 'supplemental');
        const rows = packRows(inlineFields);
        return (
          <React.Fragment key={section.id}>
            <FormSection
              title={section.title}
              blue={section.style === 'blue'}
              dark={section.style === 'dark'}
            />
            {rows.map((row, ri) => (
              <FormRow key={ri}>
                {row.map(field => (
                  <FormCell
                    key={field.id}
                    label={field.autoNumber ? 'Record Number' : field.label}
                    value={field.autoNumber ? (fv(field.id) || meta.caseNumber) : fv(field.id)}
                    onChange={set(field.id)}
                    type={field.type}
                    options={field.options || []}
                    mono={field.mono || field.autoNumber}
                    colSpan={field.span || 1}
                    required={field.required}
                    editable={editable && !field.autoNumber}
                  />
                ))}
              </FormRow>
            ))}
            {checkboxFields.length > 0 && (
              <FormCheckboxes
                items={checkboxFields.map(f => ({ id: f.id, label: f.label }))}
                values={data}
                onChange={(k, v) => onChange && onChange(k, v)}
                editable={editable}
              />
            )}
            {narrativeFields.map(field => (
              <FormNarrative
                key={field.id}
                label={field.label.toUpperCase()}
                value={fv(field.id)}
                onChange={set(field.id)}
                editable={editable}
                minRows={field.minRows || 4}
              />
            ))}
            {supplementalFields.map(field => {
              const entries = Array.isArray(fv(field.id)) ? fv(field.id) : [];
              return (
                <div key={field.id} style={{ borderBottom: '1px solid #ccc', padding: '5px 7px' }}>
                  <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666', marginBottom: 4, fontWeight: 700 }}>
                    {(field.label || 'Supplemental Reports').toUpperCase()}
                  </div>
                  {entries.length === 0 ? (
                    <div style={{ fontFamily: 'Courier New, monospace', fontSize: 12, color: '#bbb' }}>No supplements filed.</div>
                  ) : entries.map((s, i) => (
                    <div key={s.id || i} style={{ marginBottom: 8, paddingBottom: 6, borderBottom: i < entries.length - 1 ? '1px dashed #ddd' : 'none' }}>
                      <div style={{ fontSize: 8, fontWeight: 700, color: '#444', marginBottom: 2 }}>
                        SUPPLEMENT #{i + 1} * {s.date}
                      </div>
                      <div style={{ fontFamily: 'Courier New, monospace', fontSize: 12, color: '#000', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {s.text}
                      </div>
                      <div style={{ fontFamily: 'Courier New, monospace', fontSize: 10, color: '#666', marginTop: 2 }}>
                        * {s.authorLine || s.author || s.badge}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
      <FormSignatureRow slots={template?.signatureSlots || ['Officer Signature / Badge #', 'Supervisor Signature', 'Date']} />
      <FormDocFooter
        left={template?.formCode ? `${template.formCode} Rev. 2026-01` : 'FORM Rev. 2026-01'}
        right="Page 1 of 1"
      />
    </>
  );
}

/* ── Route to the right form by type name ────────────────────── */
export function ReportDocument({ type, template, data, editable, onChange, meta }) {
  const props = { data, editable, onChange, meta };
  if (template?.sections) return <DynamicFormDoc template={template} {...props} />;
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
const RETURN_ICON = { PERSON: MdPerson, VEHICLE: MdDirectionsCar, WARRANT: MdGavel };

function ReturnHeader({ type, title }) {
  const Icon = RETURN_ICON[type] || MdPerson;
  return (
    <div className={S_RECORD_RETURN_HEADER}>
      <Icon size={18} />
      <span>{title}</span>
    </div>
  );
}

function ReturnFooter() {
  return (
    <div style={S_RECORD_RETURN_FOOTER}>
      END OF RETURN * RMS * {new Date().toLocaleString().toUpperCase()}
    </div>
  );
}

export function RecordReturn({ type, subject, data }) {
  const { state } = useCAD();
  const line = (key, val) => (val !== undefined && val !== null && val !== '') ? (
    <div style={S_RECORD_RETURN_LINE} key={key}>
      <span style={S_RECORD_RETURN_KEY}>{key}: </span>
      <span style={S_RECORD_RETURN_VAL}>{val}</span>
    </div>
  ) : null;

  const now = new Date().toLocaleString();

  if (type === 'PERSON' && data) {
    const flags = data.flags || [];
    const hasWarrant = flags.includes('WARRANT');
    const dlSusp = data.dlStatus === 'SUSPENDED';
    const allRecords = state?.records || [];
    const civRecords = allRecords.filter(r => r.civilianId === data.id);
    const huntingLic = civRecords.find(r => r.type === 'Hunting License');
    const fishingLic = civRecords.find(r => r.type === 'Fishing License');
    return (
      <div className={S_RECORD_RETURN}>
        <ReturnHeader type="PERSON" title={`DR · Name: ${data.firstName} ${data.lastName}`} />
        {hasWarrant && (
          <div style={S_RECORD_RETURN_ALERT}>*** ACTIVE WARRANT ON FILE · DO NOT APPROACH WITHOUT BACKUP ***</div>
        )}
        {dlSusp && (
          <div style={S_RECORD_RETURN_ALERT_WARN}>*** DRIVER LICENSE SUSPENDED · NO VALID DL ***</div>
        )}
        <div style={S_RECORD_RETURN_BODY}>
          <div style={S_RECORD_RETURN_SECTION}>
            <span style={{color:'#4f7bb0'}}>*** </span>Query Data<span style={{color:'#4f7bb0'}}> ***</span>
          </div>
          {line('Query Type', 'Driver / Person')}
          {line('Source', 'FCIC / NCIC')}
          {line('Returned', now)}

          <div style={S_RECORD_RETURN_SECTION}>
            <span style={{color:'#4f7bb0'}}>*** </span>Driver Details<span style={{color:'#4f7bb0'}}> ***</span>
          </div>
          {line('Name', `${data.firstName} ${data.lastName}`)}
          {line('Gender', data.gender)}
          {line('Race', data.ethnicity)}
          {line('Date of Birth', data.dob)}
          {line('Age', ageFromDob(data.dob))}
          {line('Height', data.height)}
          {line('Weight', data.weight)}
          {line('Hair Color', data.hair)}
          {line('Eye Color', data.eyes)}
          {line('SSN', data.ssn)}

          <div style={S_RECORD_RETURN_SECTION}>
            <span style={{color:'#4f7bb0'}}>*** </span>Address Information<span style={{color:'#4f7bb0'}}> ***</span>
          </div>
          {line('Residence', data.address)}
          {line('Phone', data.phone)}

          <div style={S_RECORD_RETURN_SECTION}>
            <span style={{color:'#4f7bb0'}}>*** </span>Driver License<span style={{color:'#4f7bb0'}}> ***</span>
          </div>
          {line('DL Number', data.dlNumber)}
          {line('DL Class', data.dlClass)}
          {line('Endorsements', (data.dlEndorsements?.length > 0) ? data.dlEndorsements.join(', ') : (data.dlNumber ? 'None' : ''))}
          {line('DL Status', data.dlStatus)}
          {line('DL Expiry', data.dlExpiry)}
          {line('Weapon Permit', data.weaponPermit)}

          {huntingLic && (
            <>
              <div style={S_RECORD_RETURN_SECTION}>
                <span style={{color:'#4f7bb0'}}>*** </span>Hunting License<span style={{color:'#4f7bb0'}}> ***</span>
              </div>
              {line('Record #', huntingLic.recordNumber)}
              {line('Status', huntingLic.status)}
              {line('Issued', huntingLic.date)}
              {line('License #', huntingLic.formData?.hl_licno || huntingLic.formData?.licenseNumber || '')}
              {line('Expiry', huntingLic.formData?.hl_exp || huntingLic.formData?.expiryDate || '')}
            </>
          )}

          {fishingLic && (
            <>
              <div style={S_RECORD_RETURN_SECTION}>
                <span style={{color:'#4f7bb0'}}>*** </span>Fishing License<span style={{color:'#4f7bb0'}}> ***</span>
              </div>
              {line('Record #', fishingLic.recordNumber)}
              {line('Status', fishingLic.status)}
              {line('Issued', fishingLic.date)}
              {line('License #', fishingLic.formData?.fl_licno || fishingLic.formData?.licenseNumber || '')}
              {line('Expiry', fishingLic.formData?.fl_exp || fishingLic.formData?.expiryDate || '')}
            </>
          )}

          {!huntingLic && !fishingLic && (
            <>
              <div style={S_RECORD_RETURN_SECTION}>
                <span style={{color:'#4f7bb0'}}>*** </span>Hunting / Fishing Licenses<span style={{color:'#4f7bb0'}}> ***</span>
              </div>
              {line('Hunting License', 'NO RECORD ON FILE')}
              {line('Fishing License', 'NO RECORD ON FILE')}
            </>
          )}

          {flags.length > 0 && (
            <>
              <div style={S_RECORD_RETURN_SECTION}>
                <span style={{color:'#4f7bb0'}}>*** </span>Flags / Alerts<span style={{color:'#4f7bb0'}}> ***</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '4px 0' }}>
                {flags.map(f => <span key={f} style={S_RECORD_RETURN_FLAG}>{f}</span>)}
                {dlSusp && <span style={S_RECORD_RETURN_FLAG_WARN}>DL SUSPENDED</span>}
              </div>
            </>
          )}
          <ReturnFooter />
        </div>
      </div>
    );
  }

  if (type === 'VEHICLE' && data) {
    return (
      <div className={S_RECORD_RETURN}>
        <ReturnHeader type="VEHICLE" title={`VR · Plate: ${data.plate}`} />
        {data.stolen && (
          <div style={S_RECORD_RETURN_ALERT}>*** STOLEN VEHICLE * CAUTION ADVISED · CONTACT LOCAL LE IMMEDIATELY ***</div>
        )}
        {subject && subject.flags?.includes('WARRANT') && (
          <div style={S_RECORD_RETURN_ALERT_WARN}>*** REGISTERED OWNER HAS ACTIVE WARRANT ON FILE ***</div>
        )}
        <div style={S_RECORD_RETURN_BODY}>
          <div style={S_RECORD_RETURN_SECTION}>
            <span style={{color:'#4f7bb0'}}>*** </span>Query Data<span style={{color:'#4f7bb0'}}> ***</span>
          </div>
          {line('Query Type', 'Vehicle / Plate')}
          {line('Source', 'FCIC / NCIC')}
          {line('Returned', now)}

          <div style={S_RECORD_RETURN_SECTION}>
            <span style={{color:'#4f7bb0'}}>*** </span>Vehicle Registration<span style={{color:'#4f7bb0'}}> ***</span>
          </div>
          {line('Plate', data.plate)}
          {line('State', 'Florida')}
          {line('Year', String(data.year))}
          {line('Make', data.make)}
          {line('Model', data.model)}
          {line('Color', data.color)}
          {line('Registration', data.regStatus)}
          {line('Reg Expiry', data.regExpiry)}
          {line('Stolen', data.stolen ? 'YES · REPORTED STOLEN' : 'No')}

          {subject && (
            <>
              <div style={S_RECORD_RETURN_SECTION}>
                <span style={{color:'#4f7bb0'}}>*** </span>Registered Owner<span style={{color:'#4f7bb0'}}> ***</span>
              </div>
              {line('Name', `${subject.firstName} ${subject.lastName}`)}
              {line('Date of Birth', subject.dob)}
              {line('Residence', subject.address)}
              {line('Phone', subject.phone)}
              {line('DL Status', subject.dlStatus)}
              {subject.flags?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '4px 0' }}>
                  {subject.flags.map(f => <span key={f} style={S_RECORD_RETURN_FLAG}>{f}</span>)}
                </div>
              )}
            </>
          )}
          {data.flags?.length > 0 && (
            <>
              <div style={S_RECORD_RETURN_SECTION}>
                <span style={{color:'#4f7bb0'}}>*** </span>Vehicle Flags<span style={{color:'#4f7bb0'}}> ***</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '4px 0' }}>
                {data.flags.map(f => <span key={f} style={S_RECORD_RETURN_FLAG_WARN}>{f}</span>)}
              </div>
            </>
          )}
          <ReturnFooter />
        </div>
      </div>
    );
  }

  if (type === 'WARRANT' && data) {
    return (
      <div className={S_RECORD_RETURN}>
        <ReturnHeader type="WARRANT" title={`WR · Subject: ${data.civilianName}`} />
        {data.status === 'ACTIVE' && (
          <div style={S_RECORD_RETURN_ALERT}>*** ACTIVE WARRANT · SUBJECT MAY BE APPREHENDED ***</div>
        )}
        <div style={S_RECORD_RETURN_BODY}>
          <div style={S_RECORD_RETURN_SECTION}>
            <span style={{color:'#4f7bb0'}}>*** </span>Query Data<span style={{color:'#4f7bb0'}}> ***</span>
          </div>
          {line('Query Type', 'Warrant')}
          {line('Source', 'FCIC / NCIC')}
          {line('Returned', now)}

          <div style={S_RECORD_RETURN_SECTION}>
            <span style={{color:'#4f7bb0'}}>*** </span>Warrant Information<span style={{color:'#4f7bb0'}}> ***</span>
          </div>
          {line('Status', data.status)}
          {line('Type', data.type)}
          {line('Subject', data.civilianName)}
          {line('Charge', data.charge)}
          {line('Issued By', data.issuedBy)}
          {line('Issue Date', data.issuedDate)}
          {line('Notes', data.notes)}
          <ReturnFooter />
        </div>
      </div>
    );
  }

  return null;
}
