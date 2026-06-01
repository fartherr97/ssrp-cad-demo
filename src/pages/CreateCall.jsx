import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { useResponsive } from '../hooks/useResponsive';

const NATURES = ['Traffic Stop','Domestic Disturbance','Suspicious Person','MVA','MVA w/ Injuries','Structure Fire','Medical Emergency','Robbery','Burglary','Assault','Shots Fired','Welfare Check','Noise Complaint','Foot Pursuit','Vehicle Pursuit','Drug Activity','Trespassing','Stolen Vehicle','Hit and Run'];
const CITIES = ['Tampa','Brandon','Plant City','Riverview','Unincorporated'];
const COUNTIES = ['Hillsborough County'];

const PR_COLORS = { 1: '#dc2626', 2: '#ea580c', 3: '#16a34a' };
const PR_BG = { 1: '#450a0a', 2: '#431407', 3: '#052e16' };

export default function CreateCall() {
  const { state, dispatch } = useCAD();
  const { officers, currentUser } = state;
  const [form, setForm] = useState({ nature: '', location: '', city: CITIES[0], county: COUNTIES[0], priority: '2', description: '', reportingParty: '' });
  const [submitted, setSubmitted] = useState(false);
  const [createdId, setCreatedId] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const { isMobile } = useResponsive();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nature || !form.location) return;
    const call = {
      nature: form.nature,
      location: form.location,
      city: form.city,
      county: form.county,
      priority: Number(form.priority),
      description: form.description,
      reportingParty: form.reportingParty || `${currentUser?.name} (${currentUser?.badge})`,
      status: 'PENDING',
    };
    dispatch({ type: 'CREATE_CALL', payload: call });
    setCreatedId(`23-${1048 + state.calls.length}`);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ padding: '32px', fontFamily: 'Ubuntu Mono, monospace', maxWidth: '540px' }}>
        <div style={{ background: '#052e16', border: '1px solid #166534', borderLeft: '3px solid #22c55e', padding: '24px' }}>
          <div style={{ color: '#22c55e', fontSize: '13px', fontWeight: 700, letterSpacing: '2px', marginBottom: '8px' }}>CALL CREATED</div>
          <div style={{ color: '#86efac', fontSize: '15px', marginBottom: '20px' }}>Call {createdId} is now in the dispatch queue.</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { setSubmitted(false); setForm({ nature: '', location: '', city: CITIES[0], county: COUNTIES[0], priority: '2', description: '', reportingParty: '' }); }}
              style={blueBtn}>
              + Create Another
            </button>
            <button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'dispatch' })}
              style={ghostBtn}>
              View Dispatch Board
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', fontFamily: 'Ubuntu Mono, monospace', maxWidth: '700px' }}>
      {/* Header strip */}
      <div style={{ background: '#0b0d14', border: '1px solid #1e2533', borderBottom: 'none', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: '#f9fafb', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px' }}>CREATE NEW CALL</span>
        <span style={{ color: '#4b5563', fontSize: '11px' }}>Dispatch &bull; Hillsborough County, FL</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
            <Field label="NATURE OF CALL *">
              <select value={form.nature} onChange={e => set('nature', e.target.value)} required style={selectStyle}>
                <option value="">-- Select Nature --</option>
                {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="PRIORITY *">
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1,2,3].map(p => (
                  <button
                    key={p} type="button"
                    onClick={() => set('priority', String(p))}
                    style={{
                      flex: 1, padding: '8px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', fontWeight: 700, fontSize: '13px',
                      background: form.priority === String(p) ? PR_BG[p] : '#090b10',
                      border: `1px solid ${form.priority === String(p) ? PR_COLORS[p] : '#1e2533'}`,
                      color: form.priority === String(p) ? PR_COLORS[p] : '#4b5563',
                    }}
                  >
                    P{p}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <Field label="LOCATION *">
            <input value={form.location} onChange={e => set('location', e.target.value)} required placeholder="Street address or intersection..." style={inputStyle} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field label="CITY">
              <select value={form.city} onChange={e => set('city', e.target.value)} style={selectStyle}>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="COUNTY">
              <select value={form.county} onChange={e => set('county', e.target.value)} style={selectStyle}>
                {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <Field label="REPORTING PARTY">
            <input value={form.reportingParty} onChange={e => set('reportingParty', e.target.value)} placeholder="Caller name (auto-fills with your identity)" style={inputStyle} />
          </Field>

          <Field label="DESCRIPTION / NOTES">
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Call details, caller information, additional notes..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>

          <div style={{ borderTop: '1px solid #1f2937', paddingTop: '14px' }}>
            <div style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1.5px', marginBottom: '8px' }}>AVAILABLE UNITS</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {officers.filter(o => o.status === 'AVAILABLE').map(o => (
                <span key={o.id} style={{ background: '#090b10', border: '1px solid #1e2533', padding: '4px 10px', fontSize: '11px', color: '#60a5fa' }}>
                  {o.unitId} &bull; {o.name}
                </span>
              ))}
              {officers.filter(o => o.status === 'AVAILABLE').length === 0 && (
                <span style={{ color: '#374151', fontSize: '13px' }}>No available units</span>
              )}
            </div>
          </div>

          <button type="submit" style={{ background: '#0c1a2e', border: '1px solid #3b82f6', color: '#3b82f6', padding: '11px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', letterSpacing: '2px' }}>
            CREATE CALL FOR SERVICE
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = { width: '100%', background: '#090b10', border: '1px solid #1e2533', color: '#d1d5db', padding: '8px 10px', fontSize: '13px', fontFamily: 'Ubuntu Mono, monospace', boxSizing: 'border-box' };
const selectStyle = { ...inputStyle };
const blueBtn = { background: '#0c1a2e', border: '1px solid #3b82f6', color: '#3b82f6', padding: '8px 18px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Ubuntu Mono, monospace', fontWeight: 700 };
const ghostBtn = { background: '#090b10', border: '1px solid #1e2533', color: '#9ca3af', padding: '8px 18px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Ubuntu Mono, monospace' };

function Field({ label, children }) {
  return (
    <div>
      <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '5px' }}>{label}</label>
      {children}
    </div>
  );
}
