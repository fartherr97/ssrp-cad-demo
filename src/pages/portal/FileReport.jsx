import { useState, useMemo } from 'react';
import { useCAD } from '../../store/cadStore';
import {
  MdReportProblem, MdCheckCircle, MdPerson, MdEventNote,
  MdPlace, MdDescription, MdCategory,
} from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard, Field, PORTAL_INPUT, PORTAL_LABEL } from './PortalKit';

const ACCENT = '#9090cc';

const REPORT_TYPES = [
  'Theft',
  'Lost Property',
  'Vandalism',
  'Noise Complaint',
  'Suspicious Activity',
  'Other',
];

const EMPTY_FORM = {
  reportType: 'Theft',
  filerId: '',
  incidentDate: '',
  location: '',
  description: '',
};

export default function FileReport() {
  const { state, dispatch } = useCAD();
  const myChars = useMemo(() => state.civilians.filter(c => c.ownedByPlayer), [state.civilians]);

  const [form, setForm] = useState({ ...EMPTY_FORM, filerId: myChars[0] ? String(myChars[0].id) : '' });
  const [submitted, setSubmitted] = useState(null);

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const filerName = (id) => {
    const c = myChars.find(x => x.id === Number(id));
    return c ? `${c.firstName} ${c.lastName}` : '';
  };

  const canSubmit = form.description.trim() && form.location.trim() && form.incidentDate;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const caseNumber = `CIT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const filedBy = filerName(form.filerId);
    dispatch({
      type: 'ADD_REPORT',
      payload: {
        type: `Citizen — ${form.reportType}`,
        caseNumber,
        officerBadge: 'CITIZEN',
        summary: form.description,
        formData: {
          reportType: form.reportType,
          filedBy,
          filerId: form.filerId ? Number(form.filerId) : null,
          incidentDate: form.incidentDate,
          location: form.location,
          description: form.description,
        },
      },
    });
    setSubmitted({ caseNumber, reportType: form.reportType, filedBy, location: form.location, incidentDate: form.incidentDate });
  };

  const fileAnother = () => {
    setForm({ ...EMPTY_FORM, filerId: myChars[0] ? String(myChars[0].id) : '' });
    setSubmitted(null);
  };

  return (
    <PortalPage>
      <PortalHeader
        icon={MdReportProblem}
        title="File a Report"
        subtitle="Submit a non-emergency report to law enforcement. For emergencies, always call 911."
        accent={ACCENT}
      />

      {submitted ? (
        <PortalCard accent="#2fd968" style={{ textAlign: 'center', padding: '44px 24px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#2fd96822', border: '1px solid #2fd96855',
          }}>
            <MdCheckCircle size={36} color="#2fd968" />
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            Report submitted
          </div>
          <div style={{ fontSize: 13, color: 'rgba(180,200,230,0.65)', maxWidth: 460, margin: '0 auto 22px', lineHeight: 1.5 }}>
            Your report has been received and forwarded to law enforcement for review.
            Keep your case number for reference.
          </div>
          <div style={{
            display: 'inline-block', background: 'rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
            padding: '14px 26px', marginBottom: 24,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(160,185,215,0.55)' }}>
              Case Number
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#2fd968', fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginTop: 4 }}>
              {submitted.caseNumber}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, maxWidth: 560, margin: '0 auto 26px', textAlign: 'left' }}>
            <Field label="Report Type" value={submitted.reportType} />
            <Field label="Filed By" value={submitted.filedBy} />
            <Field label="Incident Date" value={submitted.incidentDate} />
            <Field label="Location" value={submitted.location} />
          </div>
          <div>
            <button className="n-btn n-btn-primary" onClick={fileAnother}>File Another Report</button>
          </div>
        </PortalCard>
      ) : myChars.length === 0 ? (
        <PortalCard accent={ACCENT} style={{ textAlign: 'center', padding: 48 }}>
          <MdReportProblem size={48} color="rgba(144,144,204,0.4)" />
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e6eef6', marginTop: 12 }}>No characters yet</div>
          <div style={{ fontSize: 13, color: 'rgba(160,185,215,0.6)', marginTop: 6 }}>
            Register a character before filing a report.
          </div>
        </PortalCard>
      ) : (
        <PortalCard accent={ACCENT}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <label style={PORTAL_LABEL}><MdCategory size={13} style={{ verticalAlign: '-2px', marginRight: 5 }} />Report Type</label>
                <select style={PORTAL_INPUT} value={form.reportType} onChange={e => setField('reportType', e.target.value)}>
                  {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={PORTAL_LABEL}><MdPerson size={13} style={{ verticalAlign: '-2px', marginRight: 5 }} />Filing As</label>
                <select style={PORTAL_INPUT} value={form.filerId} onChange={e => setField('filerId', e.target.value)} required>
                  {myChars.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={PORTAL_LABEL}><MdEventNote size={13} style={{ verticalAlign: '-2px', marginRight: 5 }} />Incident Date</label>
                <input style={PORTAL_INPUT} type="date" value={form.incidentDate} onChange={e => setField('incidentDate', e.target.value)} required />
              </div>
              <div>
                <label style={PORTAL_LABEL}><MdPlace size={13} style={{ verticalAlign: '-2px', marginRight: 5 }} />Location</label>
                <input style={PORTAL_INPUT} type="text" value={form.location} onChange={e => setField('location', e.target.value)} placeholder="Street, City" required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={PORTAL_LABEL}><MdDescription size={13} style={{ verticalAlign: '-2px', marginRight: 5 }} />Description</label>
                <textarea
                  style={{ ...PORTAL_INPUT, minHeight: 130, resize: 'vertical', fontFamily: 'var(--font-ui)' }}
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                  placeholder="Describe what happened, including any details that may help (descriptions, times, items involved)…"
                  required
                />
              </div>
            </div>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="n-btn n-btn-primary" disabled={!canSubmit}>
                Submit Report
              </button>
            </div>
          </form>
        </PortalCard>
      )}
    </PortalPage>
  );
}
