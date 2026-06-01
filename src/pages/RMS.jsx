import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';
import {
  S_INPUT, S_SELECT,
  S_BTN_PRIMARY, S_BTN_DANGER, S_BTN_SUCCESS,
  S_TABLE_TH,
  S_OVERLAY, S_MODAL, S_MODAL_HEADER, S_MODAL_TITLE, S_MODAL_BODY, S_MODAL_FOOTER,
  S_BTN_SECONDARY, S_LABEL,
  xs,
} from '../constants/styles';

const TABS = ['Criminal History', 'Warrants', 'Tow/Impound', 'Field Contacts', 'Custom Records'];

export default function RMS() {
  const { state, dispatch } = useCAD();
  const { criminalHistory, warrants, towLogs, civilians, vehicles, penalCode, currentUser, customRecordTypes } = state;
  const [tab, setTab]                   = useState('Criminal History');
  const [showAddArrest,  setShowArrest]  = useState(false);
  const [showAddWarrant, setShowWarrant] = useState(false);
  const [showAddTow,     setShowTow]     = useState(false);

  const [arrestForm,  setArrestForm]  = useState({ civilianId: '', charges: [], officerBadge: '', disposition: 'Arrested', sentence: '', notes: '' });
  const [warrantForm, setWarrantForm] = useState({ civilianId: '', type: 'Arrest Warrant', charge: '', notes: '' });
  const [towForm,     setTowForm]     = useState({ plate: '', make: '', model: '', reason: '', location: '' });

  const setA = (k, v) => setArrestForm(f => ({ ...f, [k]: v }));
  const setW = (k, v) => setWarrantForm(f => ({ ...f, [k]: v }));
  const setT = (k, v) => setTowForm(f => ({ ...f, [k]: v }));

  const submitArrest = e => {
    e.preventDefault();
    dispatch({ type: 'ADD_ARREST', payload: { ...arrestForm, civilianId: Number(arrestForm.civilianId), date: new Date().toLocaleDateString(), caseNumber: `HCSO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`, agency: currentUser?.deptShort || 'TPD', officerBadge: arrestForm.officerBadge || currentUser?.badge, charges: arrestForm.charges } });
    setShowArrest(false);
    setArrestForm({ civilianId: '', charges: [], officerBadge: '', disposition: 'Arrested', sentence: '', notes: '' });
  };
  const submitWarrant = e => {
    e.preventDefault();
    const civ = civilians.find(c => c.id === Number(warrantForm.civilianId));
    dispatch({ type: 'ADD_WARRANT', payload: { ...warrantForm, civilianId: Number(warrantForm.civilianId), civilianName: civ ? `${civ.firstName} ${civ.lastName}` : 'Unknown', issuedBy: `${currentUser?.name} (${currentUser?.badge})`, issuedDate: new Date().toLocaleDateString() } });
    setShowWarrant(false);
    setWarrantForm({ civilianId: '', type: 'Arrest Warrant', charge: '', notes: '' });
  };
  const submitTow = e => {
    e.preventDefault();
    dispatch({ type: 'ADD_TOW', payload: { ...towForm, towedBy: `${currentUser?.name} (${currentUser?.badge})`, date: new Date().toLocaleDateString() } });
    setShowTow(false);
    setTowForm({ plate: '', make: '', model: '', reason: '', location: '' });
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto p-3.5 gap-3.5 bg-neutral-950 font-sans">

      {/* Page header */}
      <div className="flex items-center gap-2.5">
        <span className="text-slate-200 text-sm font-bold tracking-[1px]">RECORDS MANAGEMENT SYSTEM</span>
        <span className="text-slate-600 text-[11px]">— Hillsborough County, FL</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-slate-800 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-[11px] font-mono shrink-0 whitespace-nowrap cursor-pointer transition-colors rounded-t border ${tab === t ? 'bg-slate-900 border-sky-700 border-b-transparent text-sky-300 font-bold' : 'bg-transparent border-transparent text-slate-600 font-normal hover:text-slate-400'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Criminal History */}
      {tab === 'Criminal History' && (
        <div>
          <TabBar count={`${criminalHistory.length} records`} onAdd={() => setShowArrest(true)} addLabel="+ Add Arrest Record" variant="primary" />
          <div className="table-scroll">
            <table className="w-full border-collapse text-[12px]">
              <THead cols={['DATE', 'CASE #', 'SUBJECT', 'CHARGES', 'OFFICER', 'AGENCY', 'DISPOSITION', 'SENTENCE']} />
              <tbody>
                {criminalHistory.map((h, i) => {
                  const civ = civilians.find(c => c.id === h.civilianId);
                  return (
                    <tr key={h.id} className={i % 2 === 0 ? 'bg-slate-950' : 'bg-[#0b0d14]'}>
                      <TD dimmed>{h.date}</TD>
                      <td className="px-2.5 py-1.5 text-sky-300 font-bold">{h.caseNumber}</td>
                      <td className="px-2.5 py-1.5 text-slate-200">{civ ? `${civ.firstName} ${civ.lastName}` : 'Unknown'}</td>
                      <td className="px-2.5 py-1.5 text-slate-400 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">{Array.isArray(h.charges) ? h.charges.join(', ') : h.charges}</td>
                      <TD dimmed>{h.officerBadge}</TD>
                      <TD dimmed>{h.agency}</TD>
                      <td className="px-2.5 py-1.5"><StatusBadge status={h.disposition} /></td>
                      <TD dimmed>{h.sentence}</TD>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Warrants */}
      {tab === 'Warrants' && (
        <div>
          <TabBar count={`${warrants.filter(w => w.status === 'ACTIVE').length} active warrants`} onAdd={() => setShowWarrant(true)} addLabel="+ Issue Warrant" variant="danger" />
          <div className="table-scroll">
            <table className="w-full border-collapse text-[12px]">
              <THead cols={['SUBJECT', 'TYPE', 'CHARGE', 'ISSUED BY', 'DATE', 'STATUS', 'ACTIONS']} />
              <tbody>
                {warrants.map((w, i) => (
                  <tr key={w.id} className={i % 2 === 0 ? 'bg-slate-950' : 'bg-[#0b0d14]'}>
                    <td className="px-2.5 py-1.5 text-slate-200 font-bold">{w.civilianName}</td>
                    <TD dimmed>{w.type}</TD>
                    <td className="px-2.5 py-1.5 text-red-300">{w.charge}</td>
                    <TD dimmed>{w.issuedBy}</TD>
                    <TD dimmed>{w.issuedDate}</TD>
                    <td className="px-2.5 py-1.5"><StatusBadge status={w.status} /></td>
                    <td className="px-2 py-1.5">
                      {w.status === 'ACTIVE' && (
                        <button
                          onClick={() => dispatch({ type: 'SERVE_WARRANT', payload: w.id })}
                          className={xs(S_BTN_SUCCESS)}
                        >
                          Mark Served
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tow/Impound */}
      {tab === 'Tow/Impound' && (
        <div>
          <TabBar count={`${towLogs.length} records`} onAdd={() => setShowTow(true)} addLabel="+ Log Tow" variant="primary" />
          <div className="table-scroll">
            <table className="w-full border-collapse text-[12px]">
              <THead cols={['PLATE', 'VEHICLE', 'TOWED BY', 'REASON', 'LOCATION', 'DATE', 'STATUS']} />
              <tbody>
                {towLogs.map((t, i) => (
                  <tr key={t.id} className={i % 2 === 0 ? 'bg-slate-950' : 'bg-[#0b0d14]'}>
                    <td className="px-2.5 py-1.5 text-sky-300 font-bold">{t.plate}</td>
                    <TD>{t.make} {t.model}</TD>
                    <TD dimmed>{t.towedBy}</TD>
                    <td className="px-2.5 py-1.5 text-slate-400 max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">{t.reason}</td>
                    <TD dimmed>{t.location}</TD>
                    <TD dimmed>{t.date}</TD>
                    <td className="px-2.5 py-1.5"><StatusBadge status={t.releaseStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Field Contacts' && (
        <div>
          <div className="text-slate-600 text-[12px] mb-2.5">Field interview / FI card records</div>
          <div className="bg-app-card border border-border-base rounded p-3 text-[12px]">
            <div className="mb-1 font-bold text-slate-200">FIC-2023-0044</div>
            <div className="text-slate-400">Subject: Amanda Chen | Location: Park Ave near Oak St | Date: 2023-10-05</div>
            <div className="text-slate-600 mt-1 text-[11px]">Subject was approached near parked vehicles at 02:15. Stated she was looking for her cat. No criminal activity observed. No further action.</div>
          </div>
        </div>
      )}

      {tab === 'Custom Records' && (
        <div>
          {customRecordTypes.map(type => (
            <div key={type.id} className="bg-app-card border border-border-base border-l-[3px] border-l-sky-700 rounded p-3 mb-2">
              <div className="text-sky-300 font-bold mb-1 text-[13px]">{type.name}</div>
              <div className="text-slate-600 text-[11px]">{type.fields.length} fields: {type.fields.map(f => f.label).join(' | ')}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {showAddArrest && (
        <div className={S_OVERLAY}>
          <div className={S_MODAL}>
            <div className={S_MODAL_HEADER}>
              <div className={S_MODAL_TITLE}>ADD ARREST RECORD</div>
              <button className="text-slate-500 hover:text-slate-200 text-lg cursor-pointer bg-none border-none" onClick={() => setShowArrest(false)}>×</button>
            </div>
            <div className={S_MODAL_BODY}>
              <form onSubmit={submitArrest} className="flex flex-col gap-2.5">
                <FormField label="SUBJECT">
                  <select value={arrestForm.civilianId} onChange={e => setA('civilianId', e.target.value)} required className={S_SELECT}>
                    <option value="">— Select Civilian —</option>
                    {civilians.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                  </select>
                </FormField>
                <FormField label="CHARGES">
                  <div className="max-h-[140px] overflow-y-auto bg-app-input border border-border-base rounded p-1">
                    {penalCode.map(p => (
                      <label key={p.id} className={`flex items-center gap-1.5 px-1 py-0.5 cursor-pointer text-[11px] ${arrestForm.charges.includes(p.name) ? 'text-sky-300' : 'text-slate-600'}`}>
                        <input type="checkbox" checked={arrestForm.charges.includes(p.name)} onChange={e => setA('charges', e.target.checked ? [...arrestForm.charges, p.name] : arrestForm.charges.filter(c => c !== p.name))} className="accent-sky-700" />
                        {p.code} — {p.name}
                      </label>
                    ))}
                  </div>
                </FormField>
                <FormField label="OFFICER BADGE">
                  <input value={arrestForm.officerBadge} onChange={e => setA('officerBadge', e.target.value)} placeholder={currentUser?.badge} className={S_INPUT} />
                </FormField>
                <FormField label="DISPOSITION">
                  <select value={arrestForm.disposition} onChange={e => setA('disposition', e.target.value)} className={S_SELECT}>
                    {['Arrested','Cited','Released','No Action'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </FormField>
                <FormField label="SENTENCE">
                  <input value={arrestForm.sentence} onChange={e => setA('sentence', e.target.value)} placeholder="e.g. 6 months, $1,500 fine..." className={S_INPUT} />
                </FormField>
                <FormField label="NOTES">
                  <textarea value={arrestForm.notes} onChange={e => setA('notes', e.target.value)} rows={3} className="w-full bg-app-input border border-border-base rounded px-3 py-2 text-sm text-slate-200 outline-none resize-y" />
                </FormField>
                <div className={S_MODAL_FOOTER}>
                  <button type="submit" className={S_BTN_PRIMARY}>SUBMIT ARREST RECORD</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAddWarrant && (
        <div className={S_OVERLAY}>
          <div className={S_MODAL}>
            <div className={S_MODAL_HEADER}>
              <div className={S_MODAL_TITLE}>ISSUE WARRANT</div>
              <button className="text-slate-500 hover:text-slate-200 text-lg cursor-pointer bg-none border-none" onClick={() => setShowWarrant(false)}>×</button>
            </div>
            <div className={S_MODAL_BODY}>
              <form onSubmit={submitWarrant} className="flex flex-col gap-2.5">
                <FormField label="SUBJECT">
                  <select value={warrantForm.civilianId} onChange={e => setW('civilianId', e.target.value)} required className={S_SELECT}>
                    <option value="">— Select Civilian —</option>
                    {civilians.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                  </select>
                </FormField>
                <FormField label="WARRANT TYPE">
                  <select value={warrantForm.type} onChange={e => setW('type', e.target.value)} className={S_SELECT}>
                    {['Arrest Warrant','Bench Warrant','Search Warrant'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormField>
                <FormField label="CHARGE">
                  <select value={warrantForm.charge} onChange={e => setW('charge', e.target.value)} required className={S_SELECT}>
                    <option value="">— Select Charge —</option>
                    {penalCode.map(p => <option key={p.id} value={p.name}>{p.code} — {p.name}</option>)}
                  </select>
                </FormField>
                <FormField label="NOTES">
                  <textarea value={warrantForm.notes} onChange={e => setW('notes', e.target.value)} rows={3} className="w-full bg-app-input border border-border-base rounded px-3 py-2 text-sm text-slate-200 outline-none resize-y" />
                </FormField>
                <div className={S_MODAL_FOOTER}>
                  <button type="submit" className={S_BTN_DANGER}>ISSUE WARRANT</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAddTow && (
        <div className={S_OVERLAY}>
          <div className={S_MODAL}>
            <div className={S_MODAL_HEADER}>
              <div className={S_MODAL_TITLE}>LOG TOW / IMPOUND</div>
              <button className="text-slate-500 hover:text-slate-200 text-lg cursor-pointer bg-none border-none" onClick={() => setShowTow(false)}>×</button>
            </div>
            <div className={S_MODAL_BODY}>
              <form onSubmit={submitTow} className="flex flex-col gap-2.5">
                {[['PLATE *','plate'],['MAKE','make'],['MODEL','model'],['REASON *','reason'],['IMPOUND LOCATION','location']].map(([l, k]) => (
                  <FormField key={k} label={l}>
                    <input value={towForm[k]} onChange={e => setT(k, e.target.value)} required={l.includes('*')} className={S_INPUT} />
                  </FormField>
                ))}
                <div className={S_MODAL_FOOTER}>
                  <button type="submit" className={S_BTN_PRIMARY}>LOG TOW</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Small building blocks ── */

function THead({ cols }) {
  return (
    <thead>
      <tr className="bg-app-bg">
        {cols.map(h => (
          <th key={h} className={S_TABLE_TH}>{h}</th>
        ))}
      </tr>
    </thead>
  );
}

function TD({ children, dimmed }) {
  return <td className={`px-2.5 py-1.5 ${dimmed ? 'text-slate-500' : 'text-slate-400'}`}>{children}</td>;
}

function TabBar({ count, onAdd, addLabel, variant = 'primary' }) {
  return (
    <div className="flex justify-between items-center mb-2.5">
      <span className="text-slate-600 text-[12px]">{count}</span>
      {onAdd && (
        <button onClick={onAdd} className={variant === 'danger' ? xs(S_BTN_DANGER) : xs(S_BTN_PRIMARY)}>
          {addLabel}
        </button>
      )}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className={S_LABEL}>{label}</label>
      {children}
    </div>
  );
}
