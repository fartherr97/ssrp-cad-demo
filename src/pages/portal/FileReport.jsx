import { useState, useMemo } from 'react';
import { useCAD } from '../../store/cadStore';
import {
  MdReportProblem, MdCheckCircle, MdPerson, MdEventNote,
  MdPlace, MdDescription, MdCategory,
} from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard, Field, PORTAL_INPUT, PORTAL_LABEL } from './PortalKit';
import { S_BTN_PRIMARY } from '../../constants/styles';

const ACCENT = 'brand';

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
        type: `Citizen * ${form.reportType}`,
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
        <PortalCard accent="green" className="text-center px-6 py-[44px]">
          <div className="w-16 h-16 rounded-[16px] mx-auto mb-[18px] flex items-center justify-center bg-green-400/10 border border-green-400/30">
            <MdCheckCircle size={36} className="text-green-400" />
          </div>
          <div className="text-[19px] font-extrabold text-white mb-2">
            Report submitted
          </div>
          <div className="text-sm text-slate-400 max-w-[460px] mx-auto mb-[22px] leading-relaxed">
            Your report has been received and forwarded to law enforcement for review.
            Keep your case number for reference.
          </div>
          <div className="inline-block bg-app-input border border-border-base rounded-xl px-[26px] py-3.5 mb-6">
            <div className="text-[10px] font-bold tracking-[0.8px] uppercase text-slate-400">
              Case Number
            </div>
            <div className="text-2xl font-extrabold text-green-400 font-mono tracking-[1px] mt-1">
              {submitted.caseNumber}
            </div>
          </div>
          <div className="grid gap-4 max-w-[560px] mx-auto mb-[26px] text-left" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            <Field label="Report Type" value={submitted.reportType} />
            <Field label="Filed By" value={submitted.filedBy} />
            <Field label="Incident Date" value={submitted.incidentDate} />
            <Field label="Location" value={submitted.location} />
          </div>
          <div>
            <button className={S_BTN_PRIMARY} onClick={fileAnother}>File Another Report</button>
          </div>
        </PortalCard>
      ) : myChars.length === 0 ? (
        <PortalCard accent={ACCENT} className="text-center p-12">
          <MdReportProblem size={48} className="text-brand/40 mx-auto" />
          <div className="text-[15px] font-bold text-slate-100 mt-3">No characters yet</div>
          <div className="text-sm text-slate-400 mt-1.5">
            Register a character before filing a report.
          </div>
        </PortalCard>
      ) : (
        <PortalCard accent={ACCENT}>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              <div>
                <label className={PORTAL_LABEL}><MdCategory size={13} className="inline align-[-2px] mr-[5px]" />Report Type</label>
                <select className={PORTAL_INPUT} value={form.reportType} onChange={e => setField('reportType', e.target.value)}>
                  {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={PORTAL_LABEL}><MdPerson size={13} className="inline align-[-2px] mr-[5px]" />Filing As</label>
                <select className={PORTAL_INPUT} value={form.filerId} onChange={e => setField('filerId', e.target.value)} required>
                  {myChars.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={PORTAL_LABEL}><MdEventNote size={13} className="inline align-[-2px] mr-[5px]" />Incident Date</label>
                <input className={PORTAL_INPUT} type="date" value={form.incidentDate} onChange={e => setField('incidentDate', e.target.value)} required />
              </div>
              <div>
                <label className={PORTAL_LABEL}><MdPlace size={13} className="inline align-[-2px] mr-[5px]" />Location</label>
                <input className={PORTAL_INPUT} type="text" value={form.location} onChange={e => setField('location', e.target.value)} placeholder="Street, City" required />
              </div>
              <div className="col-span-full">
                <label className={PORTAL_LABEL}><MdDescription size={13} className="inline align-[-2px] mr-[5px]" />Description</label>
                <textarea
                  className={`${PORTAL_INPUT} min-h-[130px] resize-y`}
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                  placeholder="Describe what happened, including any details that may help (descriptions, times, items involved)…"
                  required
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button type="submit" className={S_BTN_PRIMARY} disabled={!canSubmit}>
                Submit Report
              </button>
            </div>
          </form>
        </PortalCard>
      )}
    </PortalPage>
  );
}
