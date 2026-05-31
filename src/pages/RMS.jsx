import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';

const TABS = ['Criminal History', 'Warrants', 'Tow/Impound', 'Field Contacts', 'Custom Records'];

export default function RMS() {
  const { state, dispatch } = useCAD();
  const { criminalHistory, warrants, towLogs, civilians, vehicles, penalCode, currentUser, customRecordTypes } = state;
  const [tab, setTab] = useState('Criminal History');
  const [showAddArrest, setShowAddArrest] = useState(false);
  const [showAddWarrant, setShowAddWarrant] = useState(false);
  const [showAddTow, setShowAddTow] = useState(false);
  const [arrestForm, setArrestForm] = useState({ civilianId: '', charges: [], officerBadge: '', caseNumber: '', disposition: 'Arrested', sentence: '', notes: '' });
  const [warrantForm, setWarrantForm] = useState({ civilianId: '', type: 'Arrest Warrant', charge: '', notes: '' });
  const [towForm, setTowForm] = useState({ plate: '', make: '', model: '', reason: '', location: '' });

  const setA = (k, v) => setArrestForm(f => ({ ...f, [k]: v }));
  const setW = (k, v) => setWarrantForm(f => ({ ...f, [k]: v }));
  const setT = (k, v) => setTowForm(f => ({ ...f, [k]: v }));

  const submitArrest = (e) => {
    e.preventDefault();
    const civ = civilians.find(c => c.id === Number(arrestForm.civilianId));
    dispatch({
      type: 'ADD_ARREST',
      payload: {
        ...arrestForm,
        civilianId: Number(arrestForm.civilianId),
        date: new Date().toLocaleDateString(),
        caseNumber: `ADPS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        agency: currentUser?.deptShort || 'ADPS',
        officerBadge: arrestForm.officerBadge || currentUser?.badge,
        charges: arrestForm.charges,
      }
    });
    setShowAddArrest(false);
    setArrestForm({ civilianId: '', charges: [], officerBadge: '', caseNumber: '', disposition: 'Arrested', sentence: '', notes: '' });
  };

  const submitWarrant = (e) => {
    e.preventDefault();
    const civ = civilians.find(c => c.id === Number(warrantForm.civilianId));
    dispatch({
      type: 'ADD_WARRANT',
      payload: {
        ...warrantForm,
        civilianId: Number(warrantForm.civilianId),
        civilianName: civ ? `${civ.firstName} ${civ.lastName}` : 'Unknown',
        issuedBy: `${currentUser?.name} (${currentUser?.badge})`,
        issuedDate: new Date().toLocaleDateString(),
      }
    });
    setShowAddWarrant(false);
    setWarrantForm({ civilianId: '', type: 'Arrest Warrant', charge: '', notes: '' });
  };

  const submitTow = (e) => {
    e.preventDefault();
    dispatch({
      type: 'ADD_TOW',
      payload: {
        ...towForm,
        towedBy: `${currentUser?.name} (${currentUser?.badge})`,
        date: new Date().toLocaleDateString(),
      }
    });
    setShowAddTow(false);
    setTowForm({ plate: '', make: '', model: '', reason: '', location: '' });
  };

  const base = { background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', color: '#e2e8f0', padding: '7px 10px', fontSize: '12px', fontFamily: 'Courier New, monospace', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '16px', fontFamily: 'Courier New, monospace' }}>
      <div style={{ color: '#4a9eff', fontSize: '16px', fontWeight: 700, letterSpacing: '2px', marginBottom: '16px' }}>RECORDS MANAGEMENT SYSTEM</div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #1e3060', marginBottom: '16px' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? '#0d2545' : 'transparent', border: tab === t ? '1px solid #4a9eff' : '1px solid transparent', borderBottom: 'none', borderRadius: '4px 4px 0 0', color: tab === t ? '#4a9eff' : '#64748b', padding: '7px 14px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Courier New, monospace' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Criminal History */}
      {tab === 'Criminal History' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>{criminalHistory.length} records</span>
            <button onClick={() => setShowAddArrest(true)} style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '6px 14px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Courier New, monospace', fontWeight: 700 }}>+ Add Arrest Record</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#0a1a35' }}>
                {['Date','Case #','Subject','Charges','Officer','Agency','Disposition','Sentence'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#4a9eff', fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #1e4080' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criminalHistory.map((h, i) => {
                const civ = civilians.find(c => c.id === h.civilianId);
                return (
                  <tr key={h.id} style={{ background: i % 2 === 0 ? '#080f1e' : '#0a1525' }}>
                    <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{h.date}</td>
                    <td style={{ padding: '7px 10px', color: '#60a5fa', fontWeight: 700 }}>{h.caseNumber}</td>
                    <td style={{ padding: '7px 10px', color: '#e2e8f0' }}>{civ ? `${civ.firstName} ${civ.lastName}` : 'Unknown'}</td>
                    <td style={{ padding: '7px 10px', color: '#94a3b8', maxWidth: '200px' }}>{Array.isArray(h.charges) ? h.charges.join(', ') : h.charges}</td>
                    <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{h.officerBadge}</td>
                    <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{h.agency}</td>
                    <td style={{ padding: '7px 10px' }}><StatusBadge status={h.disposition} /></td>
                    <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{h.sentence}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Warrants */}
      {tab === 'Warrants' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>{warrants.filter(w => w.status === 'ACTIVE').length} active warrants</span>
            <button onClick={() => setShowAddWarrant(true)} style={{ background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '4px', color: '#ef4444', padding: '6px 14px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Courier New, monospace', fontWeight: 700 }}>+ Issue Warrant</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#0a1a35' }}>
                {['Subject','Type','Charge','Issued By','Date','Status','Actions'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#4a9eff', fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #1e4080' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {warrants.map((w, i) => (
                <tr key={w.id} style={{ background: i % 2 === 0 ? '#080f1e' : '#0a1525' }}>
                  <td style={{ padding: '7px 10px', color: '#e2e8f0', fontWeight: 700 }}>{w.civilianName}</td>
                  <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{w.type}</td>
                  <td style={{ padding: '7px 10px', color: '#fca5a5' }}>{w.charge}</td>
                  <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{w.issuedBy}</td>
                  <td style={{ padding: '7px 10px', color: '#475569' }}>{w.issuedDate}</td>
                  <td style={{ padding: '7px 10px' }}><StatusBadge status={w.status} /></td>
                  <td style={{ padding: '7px 10px' }}>
                    {w.status === 'ACTIVE' && (
                      <button onClick={() => dispatch({ type: 'SERVE_WARRANT', payload: w.id })} style={{ background: '#14532d', border: '1px solid #22c55e', borderRadius: '3px', color: '#22c55e', padding: '3px 8px', fontSize: '10px', cursor: 'pointer', fontFamily: 'Courier New, monospace' }}>Mark Served</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tow/Impound */}
      {tab === 'Tow/Impound' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>{towLogs.length} records</span>
            <button onClick={() => setShowAddTow(true)} style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '6px 14px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Courier New, monospace', fontWeight: 700 }}>+ Log Tow</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#0a1a35' }}>
                {['Plate','Vehicle','Towed By','Reason','Location','Date','Status'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#4a9eff', fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #1e4080' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {towLogs.map((t, i) => (
                <tr key={t.id} style={{ background: i % 2 === 0 ? '#080f1e' : '#0a1525' }}>
                  <td style={{ padding: '7px 10px', color: '#60a5fa', fontWeight: 700 }}>{t.plate}</td>
                  <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{t.make} {t.model}</td>
                  <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{t.towedBy}</td>
                  <td style={{ padding: '7px 10px', color: '#94a3b8', maxWidth: '180px' }}>{t.reason}</td>
                  <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{t.location}</td>
                  <td style={{ padding: '7px 10px', color: '#475569' }}>{t.date}</td>
                  <td style={{ padding: '7px 10px' }}><StatusBadge status={t.releaseStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Field Contacts' && (
        <div>
          <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '12px' }}>Field interview / FI card records</div>
          <div style={{ background: '#080f1e', border: '1px solid #1e3060', borderRadius: '4px', padding: '14px', fontSize: '12px', color: '#94a3b8' }}>
            <div style={{ marginBottom: '8px', fontWeight: 700, color: '#e2e8f0' }}>FIC-2023-0044</div>
            <div>Subject: Amanda Chen | Location: Park Ave near Oak St | Date: 2023-10-05</div>
            <div style={{ color: '#64748b', marginTop: '4px', fontSize: '11px' }}>Subject was approached near parked vehicles at 02:15. Stated she was looking for her cat. No criminal activity observed. No further action.</div>
          </div>
        </div>
      )}

      {tab === 'Custom Records' && (
        <div>
          {customRecordTypes.map(type => (
            <div key={type.id} style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '6px', padding: '14px', marginBottom: '12px' }}>
              <div style={{ color: '#4a9eff', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>📁 {type.name} ({type.fields.length} fields)</div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>Fields: {type.fields.map(f => f.label).join(' | ')}</div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Arrest */}
      {showAddArrest && (
        <Modal title="ADD ARREST RECORD" onClose={() => setShowAddArrest(false)}>
          <form onSubmit={submitArrest} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
            <FormField label="SUBJECT">
              <select value={arrestForm.civilianId} onChange={e => setA('civilianId', e.target.value)} required style={base}>
                <option value="">-- Select Civilian --</option>
                {civilians.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </FormField>
            <FormField label="CHARGES">
              <div style={{ maxHeight: '150px', overflowY: 'auto', background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', padding: '6px' }}>
                {penalCode.map(p => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 4px', cursor: 'pointer', color: arrestForm.charges.includes(p.name) ? '#4a9eff' : '#94a3b8', fontSize: '11px' }}>
                    <input type="checkbox" checked={arrestForm.charges.includes(p.name)} onChange={e => setA('charges', e.target.checked ? [...arrestForm.charges, p.name] : arrestForm.charges.filter(c => c !== p.name))} style={{ accentColor: '#4a9eff' }} />
                    {p.code} — {p.name}
                  </label>
                ))}
              </div>
            </FormField>
            <FormField label="OFFICER BADGE">
              <input value={arrestForm.officerBadge} onChange={e => setA('officerBadge', e.target.value)} placeholder={currentUser?.badge} style={base} />
            </FormField>
            <FormField label="DISPOSITION">
              <select value={arrestForm.disposition} onChange={e => setA('disposition', e.target.value)} style={base}>
                {['Arrested','Cited','Released','No Action'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="SENTENCE">
              <input value={arrestForm.sentence} onChange={e => setA('sentence', e.target.value)} placeholder="e.g. 6 months, $1500 fine..." style={base} />
            </FormField>
            <FormField label="NOTES">
              <textarea value={arrestForm.notes} onChange={e => setA('notes', e.target.value)} rows={3} style={{ ...base, resize: 'vertical' }} />
            </FormField>
            <button type="submit" style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Courier New, monospace' }}>
              SUBMIT ARREST RECORD
            </button>
          </form>
        </Modal>
      )}

      {/* Modal: Add Warrant */}
      {showAddWarrant && (
        <Modal title="ISSUE WARRANT" onClose={() => setShowAddWarrant(false)}>
          <form onSubmit={submitWarrant} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
            <FormField label="SUBJECT">
              <select value={warrantForm.civilianId} onChange={e => setW('civilianId', e.target.value)} required style={base}>
                <option value="">-- Select Civilian --</option>
                {civilians.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </FormField>
            <FormField label="WARRANT TYPE">
              <select value={warrantForm.type} onChange={e => setW('type', e.target.value)} style={base}>
                {['Arrest Warrant','Bench Warrant','Search Warrant'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="CHARGE">
              <select value={warrantForm.charge} onChange={e => setW('charge', e.target.value)} required style={base}>
                <option value="">-- Select Charge --</option>
                {penalCode.map(p => <option key={p.id} value={p.name}>{p.code} — {p.name}</option>)}
              </select>
            </FormField>
            <FormField label="NOTES">
              <textarea value={warrantForm.notes} onChange={e => setW('notes', e.target.value)} rows={3} style={{ ...base, resize: 'vertical' }} />
            </FormField>
            <button type="submit" style={{ background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '4px', color: '#ef4444', padding: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Courier New, monospace' }}>
              ISSUE WARRANT
            </button>
          </form>
        </Modal>
      )}

      {/* Modal: Add Tow */}
      {showAddTow && (
        <Modal title="LOG TOW" onClose={() => setShowAddTow(false)}>
          <form onSubmit={submitTow} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
            {[['PLATE *','plate',''],['MAKE','make',''],['MODEL','model',''],['REASON *','reason',''],['IMPOUND LOCATION','location','']].map(([l,k,ph]) => (
              <FormField key={k} label={l}>
                <input value={towForm[k]} onChange={e => setT(k, e.target.value)} placeholder={ph} required={l.includes('*')} style={base} />
              </FormField>
            ))}
            <button type="submit" style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Courier New, monospace' }}>
              LOG TOW
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '5px' }}>{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '8px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto', fontFamily: 'Courier New, monospace' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ color: '#4a9eff', fontWeight: 700, fontSize: '13px', letterSpacing: '1px' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
