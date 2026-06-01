import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';

const MONO = "'Ubuntu', sans-serif";
const TABS = ['Criminal History', 'Warrants', 'Tow/Impound', 'Field Contacts', 'Custom Records'];

const inp = {
  background: '#06070c',
  border: '1px solid #1a1e2c',
  borderRadius: '2px',
  color: '#d1d5db',
  padding: '6px 8px',
  fontSize: '12px',
  fontFamily: MONO,
  width: '100%',
};

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
    <div style={{ padding: '12px 14px', fontFamily: MONO, background: '#080b12', minHeight: 'calc(100vh - 70px)' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 700, letterSpacing: '1px' }}>RECORDS MANAGEMENT SYSTEM</span>
        <span style={{ color: '#374151', fontSize: '11px' }}>— Hillsborough County, FL</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #141720', marginBottom: '14px', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? '#0f172a' : 'transparent',
              border: `1px solid ${tab === t ? '#1d4ed8' : 'transparent'}`,
              borderBottom: 'none',
              borderRadius: '2px 2px 0 0',
              color: tab === t ? '#93c5fd' : '#374151',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: tab === t ? 700 : 400,
              cursor: 'pointer',
              letterSpacing: '0.3px',
              fontFamily: MONO,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Criminal History */}
      {tab === 'Criminal History' && (
        <div>
          <TabBar count={`${criminalHistory.length} records`} onAdd={() => setShowArrest(true)} addLabel="+ Add Arrest Record" addColor="#0f2451" />
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <THead cols={['DATE', 'CASE #', 'SUBJECT', 'CHARGES', 'OFFICER', 'AGENCY', 'DISPOSITION', 'SENTENCE']} />
              <tbody>
                {criminalHistory.map((h, i) => {
                  const civ = civilians.find(c => c.id === h.civilianId);
                  return (
                    <tr key={h.id} style={{ background: i % 2 === 0 ? '#090b10' : '#0b0d14' }}>
                      <TD dimmed>{h.date}</TD>
                      <td style={{ padding: '5px 10px', color: '#93c5fd', fontWeight: 700 }}>{h.caseNumber}</td>
                      <td style={{ padding: '5px 10px', color: '#e2e8f0' }}>{civ ? `${civ.firstName} ${civ.lastName}` : 'Unknown'}</td>
                      <td style={{ padding: '5px 10px', color: '#9ca3af', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{Array.isArray(h.charges) ? h.charges.join(', ') : h.charges}</td>
                      <TD dimmed>{h.officerBadge}</TD>
                      <TD dimmed>{h.agency}</TD>
                      <td style={{ padding: '5px 10px' }}><StatusBadge status={h.disposition} /></td>
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
          <TabBar count={`${warrants.filter(w => w.status === 'ACTIVE').length} active warrants`} onAdd={() => setShowWarrant(true)} addLabel="+ Issue Warrant" addColor="#450a0a" addBorderColor="#991b1b" addTextColor="#f87171" />
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <THead cols={['SUBJECT', 'TYPE', 'CHARGE', 'ISSUED BY', 'DATE', 'STATUS', 'ACTIONS']} />
              <tbody>
                {warrants.map((w, i) => (
                  <tr key={w.id} style={{ background: i % 2 === 0 ? '#090b10' : '#0b0d14' }}>
                    <td style={{ padding: '5px 10px', color: '#e2e8f0', fontWeight: 700 }}>{w.civilianName}</td>
                    <TD dimmed>{w.type}</TD>
                    <td style={{ padding: '5px 10px', color: '#fca5a5' }}>{w.charge}</td>
                    <TD dimmed>{w.issuedBy}</TD>
                    <TD dimmed>{w.issuedDate}</TD>
                    <td style={{ padding: '5px 10px' }}><StatusBadge status={w.status} /></td>
                    <td style={{ padding: '5px 8px' }}>
                      {w.status === 'ACTIVE' && (
                        <button
                          onClick={() => dispatch({ type: 'SERVE_WARRANT', payload: w.id })}
                          style={{ background: '#052e16', border: '1px solid #166534', borderRadius: '2px', color: '#4ade80', padding: '2px 8px', fontSize: '11px', cursor: 'pointer', fontFamily: MONO }}
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
          <TabBar count={`${towLogs.length} records`} onAdd={() => setShowTow(true)} addLabel="+ Log Tow" addColor="#0f2451" />
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <THead cols={['PLATE', 'VEHICLE', 'TOWED BY', 'REASON', 'LOCATION', 'DATE', 'STATUS']} />
              <tbody>
                {towLogs.map((t, i) => (
                  <tr key={t.id} style={{ background: i % 2 === 0 ? '#090b10' : '#0b0d14' }}>
                    <td style={{ padding: '5px 10px', color: '#93c5fd', fontWeight: 700 }}>{t.plate}</td>
                    <TD>{t.make} {t.model}</TD>
                    <TD dimmed>{t.towedBy}</TD>
                    <td style={{ padding: '5px 10px', color: '#9ca3af', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.reason}</td>
                    <TD dimmed>{t.location}</TD>
                    <TD dimmed>{t.date}</TD>
                    <td style={{ padding: '5px 10px' }}><StatusBadge status={t.releaseStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Field Contacts' && (
        <div>
          <div style={{ color: '#374151', fontSize: '12px', marginBottom: '10px' }}>Field interview / FI card records</div>
          <div style={{ background: '#0d1117', border: '1px solid #1a1e2c', borderRadius: '2px', padding: '12px', fontSize: '12px' }}>
            <div style={{ marginBottom: '4px', fontWeight: 700, color: '#e2e8f0' }}>FIC-2023-0044</div>
            <div style={{ color: '#9ca3af' }}>Subject: Amanda Chen | Location: Park Ave near Oak St | Date: 2023-10-05</div>
            <div style={{ color: '#374151', marginTop: '4px', fontSize: '11px' }}>Subject was approached near parked vehicles at 02:15. Stated she was looking for her cat. No criminal activity observed. No further action.</div>
          </div>
        </div>
      )}

      {tab === 'Custom Records' && (
        <div>
          {customRecordTypes.map(type => (
            <div key={type.id} style={{ background: '#0d1117', border: '1px solid #1a1e2c', borderLeft: '3px solid #1d4ed8', borderRadius: '2px', padding: '12px', marginBottom: '8px' }}>
              <div style={{ color: '#93c5fd', fontWeight: 700, marginBottom: '4px', fontSize: '13px' }}>{type.name}</div>
              <div style={{ color: '#374151', fontSize: '11px' }}>{type.fields.length} fields: {type.fields.map(f => f.label).join(' | ')}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {showAddArrest && (
        <Modal title="ADD ARREST RECORD" onClose={() => setShowArrest(false)}>
          <form onSubmit={submitArrest} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <FormField label="SUBJECT">
              <select value={arrestForm.civilianId} onChange={e => setA('civilianId', e.target.value)} required style={inp}>
                <option value="">— Select Civilian —</option>
                {civilians.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </FormField>
            <FormField label="CHARGES">
              <div style={{ maxHeight: '140px', overflowY: 'auto', background: '#06070c', border: '1px solid #1a1e2c', borderRadius: '2px', padding: '5px' }}>
                {penalCode.map(p => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '2px 4px', cursor: 'pointer', color: arrestForm.charges.includes(p.name) ? '#93c5fd' : '#374151', fontSize: '11px' }}>
                    <input type="checkbox" checked={arrestForm.charges.includes(p.name)} onChange={e => setA('charges', e.target.checked ? [...arrestForm.charges, p.name] : arrestForm.charges.filter(c => c !== p.name))} style={{ accentColor: '#1d4ed8' }} />
                    {p.code} — {p.name}
                  </label>
                ))}
              </div>
            </FormField>
            <FormField label="OFFICER BADGE">
              <input value={arrestForm.officerBadge} onChange={e => setA('officerBadge', e.target.value)} placeholder={currentUser?.badge} style={inp} />
            </FormField>
            <FormField label="DISPOSITION">
              <select value={arrestForm.disposition} onChange={e => setA('disposition', e.target.value)} style={inp}>
                {['Arrested','Cited','Released','No Action'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="SENTENCE">
              <input value={arrestForm.sentence} onChange={e => setA('sentence', e.target.value)} placeholder="e.g. 6 months, $1,500 fine..." style={inp} />
            </FormField>
            <FormField label="NOTES">
              <textarea value={arrestForm.notes} onChange={e => setA('notes', e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} />
            </FormField>
            <button type="submit" style={{ background: '#0f2451', border: '1px solid #1d4ed8', borderRadius: '2px', color: '#93c5fd', padding: '9px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: MONO }}>
              SUBMIT ARREST RECORD
            </button>
          </form>
        </Modal>
      )}

      {showAddWarrant && (
        <Modal title="ISSUE WARRANT" onClose={() => setShowWarrant(false)}>
          <form onSubmit={submitWarrant} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <FormField label="SUBJECT">
              <select value={warrantForm.civilianId} onChange={e => setW('civilianId', e.target.value)} required style={inp}>
                <option value="">— Select Civilian —</option>
                {civilians.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </FormField>
            <FormField label="WARRANT TYPE">
              <select value={warrantForm.type} onChange={e => setW('type', e.target.value)} style={inp}>
                {['Arrest Warrant','Bench Warrant','Search Warrant'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="CHARGE">
              <select value={warrantForm.charge} onChange={e => setW('charge', e.target.value)} required style={inp}>
                <option value="">— Select Charge —</option>
                {penalCode.map(p => <option key={p.id} value={p.name}>{p.code} — {p.name}</option>)}
              </select>
            </FormField>
            <FormField label="NOTES">
              <textarea value={warrantForm.notes} onChange={e => setW('notes', e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} />
            </FormField>
            <button type="submit" style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: '2px', color: '#f87171', padding: '9px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: MONO }}>
              ISSUE WARRANT
            </button>
          </form>
        </Modal>
      )}

      {showAddTow && (
        <Modal title="LOG TOW / IMPOUND" onClose={() => setShowTow(false)}>
          <form onSubmit={submitTow} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[['PLATE *','plate'],['MAKE','make'],['MODEL','model'],['REASON *','reason'],['IMPOUND LOCATION','location']].map(([l, k]) => (
              <FormField key={k} label={l}>
                <input value={towForm[k]} onChange={e => setT(k, e.target.value)} required={l.includes('*')} style={inp} />
              </FormField>
            ))}
            <button type="submit" style={{ background: '#0f2451', border: '1px solid #1d4ed8', borderRadius: '2px', color: '#93c5fd', padding: '9px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: MONO }}>
              LOG TOW
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ── Small building blocks ── */

function THead({ cols }) {
  return (
    <thead>
      <tr style={{ background: '#0d1117' }}>
        {cols.map(h => (
          <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#374151', fontSize: '10px', letterSpacing: '0.8px', fontWeight: 700, borderBottom: '1px solid #141720', whiteSpace: 'nowrap' }}>{h}</th>
        ))}
      </tr>
    </thead>
  );
}

function TD({ children, dimmed }) {
  return <td style={{ padding: '5px 10px', color: dimmed ? '#6b7280' : '#9ca3af' }}>{children}</td>;
}

function TabBar({ count, onAdd, addLabel, addColor, addBorderColor, addTextColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
      <span style={{ color: '#374151', fontSize: '12px' }}>{count}</span>
      {onAdd && (
        <button onClick={onAdd} style={{ background: addColor || '#0f2451', border: `1px solid ${addBorderColor || '#1d4ed8'}`, borderRadius: '2px', color: addTextColor || '#93c5fd', padding: '4px 12px', fontSize: '11px', cursor: 'pointer', fontFamily: MONO, fontWeight: 700 }}>
          {addLabel}
        </button>
      )}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={{ color: '#374151', fontSize: '10px', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0d1117', border: '1px solid #1a1e2c', borderTop: '2px solid #1d4ed8', borderRadius: '3px', padding: '20px', maxWidth: '480px', width: '90%', maxHeight: '80vh', overflowY: 'auto', fontFamily: MONO }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ color: '#93c5fd', fontWeight: 700, fontSize: '13px', letterSpacing: '1px' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
