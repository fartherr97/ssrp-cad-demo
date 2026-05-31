import { useState } from 'react';
import { useCAD } from '../store/cadStore';

const NATURES = ['Traffic Stop','Domestic Disturbance','Suspicious Person','MVA','MVA w/ Injuries','Structure Fire','Medical Emergency','Robbery','Burglary','Assault','Shots Fired','Welfare Check','Noise Complaint','Foot Pursuit','Vehicle Pursuit','Drug Activity','Trespassing','Stolen Vehicle','Hit and Run'];
const CITIES = ['Arcadia','Greenview','Roca Bay','Unincorporated'];
const COUNTIES = ['Arcadia County','Roca County'];

export default function CreateCall() {
  const { state, dispatch } = useCAD();
  const { officers, currentUser } = state;
  const [form, setForm] = useState({ nature: '', location: '', city: CITIES[0], county: COUNTIES[0], priority: '2', description: '', reportingParty: '' });
  const [submitted, setSubmitted] = useState(false);
  const [createdId, setCreatedId] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
      <div style={{ padding: '32px', fontFamily: 'Ubuntu Mono, monospace', maxWidth: '600px' }}>
        <div style={{ background: '#051a05', border: '1px solid #22c55e', borderRadius: '6px', padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
          <div style={{ color: '#22c55e', fontSize: '18px', fontWeight: 700, letterSpacing: '2px', marginBottom: '8px' }}>CALL CREATED</div>
          <div style={{ color: '#86efac', fontSize: '16px', marginBottom: '20px' }}>Call {createdId} is now in the dispatch queue.</div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={() => { setSubmitted(false); setForm({ nature: '', location: '', city: CITIES[0], county: COUNTIES[0], priority: '2', description: '', reportingParty: '' }); }}
              style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '8px 18px', cursor: 'pointer', fontSize: '14px', fontFamily: 'Ubuntu Mono, monospace' }}>
              + Create Another
            </button>
            <button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'dispatch' })}
              style={{ background: '#0a1a35', border: '1px solid #1e4080', borderRadius: '4px', color: '#94a3b8', padding: '8px 18px', cursor: 'pointer', fontSize: '14px', fontFamily: 'Ubuntu Mono, monospace' }}>
              View Dispatch Board
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', fontFamily: 'Ubuntu Mono, monospace', maxWidth: '700px' }}>
      <div style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 700, letterSpacing: '1px', marginBottom: '20px' }}>CREATE NEW CALL</div>
      <form onSubmit={handleSubmit}>
        <div style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '6px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="NATURE OF CALL *">
              <select value={form.nature} onChange={e => set('nature', e.target.value)} required style={selectStyle}>
                <option value="">-- Select Nature --</option>
                {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="PRIORITY *">
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1,2,3].map(p => (
                  <button
                    key={p} type="button"
                    onClick={() => set('priority', String(p))}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', fontWeight: 700,
                      background: form.priority === String(p) ? (p === 1 ? '#7f1d1d' : p === 2 ? '#78350f' : '#14532d') : '#060d1a',
                      border: `1px solid ${form.priority === String(p) ? (p === 1 ? '#ef4444' : p === 2 ? '#f59e0b' : '#22c55e') : '#1e3060'}`,
                      color: form.priority === String(p) ? '#fff' : '#64748b',
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
            <input value={form.reportingParty} onChange={e => set('reportingParty', e.target.value)} placeholder="Caller name or auto-fill with your name" style={inputStyle} />
          </Field>

          <Field label="DESCRIPTION">
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Call details, caller information, additional notes..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>

          <div style={{ borderTop: '1px solid #1e3060', paddingTop: '16px' }}>
            <div style={{ color: '#4a9eff', fontSize: '12px', letterSpacing: '1px', marginBottom: '10px' }}>ASSIGN UNITS</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {officers.filter(o => o.status === 'AVAILABLE').map(o => (
                <span key={o.id} style={{ background: '#0a1a35', border: '1px solid #1e4080', borderRadius: '4px', padding: '4px 10px', fontSize: '12px', color: '#60a5fa', cursor: 'pointer' }}>
                  {o.unitId} — {o.name}
                </span>
              ))}
              {officers.filter(o => o.status === 'AVAILABLE').length === 0 && (
                <span style={{ color: '#475569', fontSize: '14px' }}>No available units</span>
              )}
            </div>
          </div>

          <button type="submit" style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', letterSpacing: '2px' }}>
            📞 CREATE CALL
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = { width: '100%', background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', color: '#e2e8f0', padding: '8px 10px', fontSize: '15px', fontFamily: 'Ubuntu Mono, monospace', boxSizing: 'border-box' };
const selectStyle = { ...inputStyle };

function Field({ label, children }) {
  return (
    <div>
      <label style={{ color: '#7a9ab8', fontSize: '12px', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>{label}</label>
      {children}
    </div>
  );
}
