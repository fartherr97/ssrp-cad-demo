import { useState, useEffect } from 'react';
import Select from '../../components/ui/Select';
import { useCAD } from '../../store/cadStore';
import { useToast } from '../../contexts/ToastContext';
import {
  MdReportProblem, MdCheckCircle, MdPerson, MdEventNote,
  MdPlace, MdDescription, MdCategory, MdLocalPolice,
} from 'react-icons/md';

const ES_SERVICES = [
  { id: 'LAW_ENFORCEMENT', label: 'Law Enforcement', icon: '🚔', color: '#3a88e8' },
  { id: 'EMS',             label: 'EMS',             icon: '🚑', color: '#22c55e' },
  { id: 'FIRE',            label: 'Fire',             icon: '🔥', color: '#ef4444' },
];
import { PortalPage, PortalHeader, PortalCard, Field, PORTAL_INPUT, PORTAL_LABEL } from './PortalKit';
import { S_BTN_PRIMARY } from '../../constants/styles';
import { useActiveCivilian, CivilianSwitcher } from '../../contexts/CivilianContext';

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
  esServices: ['LAW_ENFORCEMENT'],
};

export default function FileReport() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const { myChars, activeChar } = useActiveCivilian();

  const [form, setForm] = useState({ ...EMPTY_FORM, filerId: activeChar ? String(activeChar.id) : '' });
  const [submitted, setSubmitted] = useState(null);

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const toggleService = id => setForm(f => {
    const cur = f.esServices || ['LAW_ENFORCEMENT'];
    const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
    return next.length ? { ...f, esServices: next } : f;
  });

  // Keep the filer locked to whoever is the active character.
  useEffect(() => { if (activeChar) setForm(f => ({ ...f, filerId: String(activeChar.id) })); }, [activeChar?.id]);

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
    const esServices = form.esServices?.length ? form.esServices : ['LAW_ENFORCEMENT'];
    dispatch({
      type: 'ADD_REPORT',
      payload: {
        type: `Citizen * ${form.reportType}`,
        caseNumber,
        officerBadge: 'CITIZEN',
        summary: form.description,
        esServices,
        formData: {
          reportType: form.reportType,
          filedBy,
          filerId: form.filerId ? Number(form.filerId) : null,
          incidentDate: form.incidentDate,
          location: form.location,
          description: form.description,
          esServices,
        },
      },
    });
    setSubmitted({ caseNumber, reportType: form.reportType, filedBy, location: form.location, incidentDate: form.incidentDate });
    toast.success(`Case ${caseNumber} filed.`, { title: 'Report Submitted' });
  };

  const fileAnother = () => {
    setForm({ ...EMPTY_FORM, filerId: activeChar ? String(activeChar.id) : '' });
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

      {!submitted && <CivilianSwitcher />}

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
            <button className={`${S_BTN_PRIMARY} press`} onClick={fileAnother}>File Another Report</button>
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
            <div className="mb-4">
              <label className={PORTAL_LABEL}><MdLocalPolice size={13} className="inline align-[-2px] mr-[5px]" />Service(s) Needed *</label>
              <div className="flex gap-2 flex-wrap mt-1.5">
                {ES_SERVICES.map(svc => {
                  const on = (form.esServices || []).includes(svc.id);
                  return (
                    <button key={svc.id} type="button" onClick={() => toggleService(svc.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12.5px] font-semibold border cursor-pointer transition-all"
                      style={on
                        ? { background: `${svc.color}18`, border: `1px solid ${svc.color}45`, color: svc.color }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)', color: '#64748b' }}>
                      <span>{svc.icon}</span> {svc.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">Select all that apply. Your report will be routed to the appropriate services.</p>
            </div>
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))' }}>
              <div>
                <label className={PORTAL_LABEL}><MdCategory size={13} className="inline align-[-2px] mr-[5px]" />Report Type</label>
                <Select className={PORTAL_INPUT} value={form.reportType} onChange={e => setField('reportType', e.target.value)}>
                  {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </div>
              <div>
                <label className={PORTAL_LABEL}><MdPerson size={13} className="inline align-[-2px] mr-[5px]" />Filing As</label>
                <div className={`${PORTAL_INPUT} flex items-center gap-2 !cursor-default`}>
                  <MdPerson size={15} className="text-brand-bright shrink-0" />
                  <span className="font-semibold text-slate-200">{activeChar ? `${activeChar.firstName} ${activeChar.lastName}` : '—'}</span>
                  <span className="text-[10px] text-slate-500 ml-auto">Active character</span>
                </div>
              </div>
              <div>
                <label className={PORTAL_LABEL}><MdEventNote size={13} className="inline align-[-2px] mr-[5px]" />Incident Date</label>
                <div className="relative w-full overflow-hidden rounded-lg border border-border-base bg-app-input focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/20 transition-all" style={{ height: 42 }}>
                  <input className="absolute inset-0 w-full h-full bg-transparent px-3.5 text-sm text-cad-text outline-none" type="date" value={form.incidentDate} onChange={e => setField('incidentDate', e.target.value)} required style={{ colorScheme: 'dark' }} />
                </div>
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
              <button type="submit" className={`${S_BTN_PRIMARY} press`} disabled={!canSubmit}>
                Submit Report
              </button>
            </div>
          </form>
        </PortalCard>
      )}
    </PortalPage>
  );
}
