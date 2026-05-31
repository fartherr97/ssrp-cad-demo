import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';

const BLANK_CIV = { firstName:'',lastName:'',dob:'',gender:'Male',ethnicity:'',height:'',weight:'',hair:'',eyes:'',ssn:'',phone:'',address:'',dlNumber:'',dlClass:'Class C',dlStatus:'ACTIVE',dlExpiry:'' };
const BLANK_VEH = { plate:'',make:'',model:'',year:'',color:'',regStatus:'VALID',regExpiry:'',ownerId:'' };

export default function CivilianPortal() {
  const { state, dispatch } = useCAD();
  const { civilians, vehicles, warrants, criminalHistory, currentUser } = state;
  const [tab, setTab] = useState('list');
  const [editCiv, setEditCiv] = useState(null);
  const [showVehicleForm, setShowVehicleForm] = useState(null);
  const [civForm, setCivForm] = useState(BLANK_CIV);
  const [vehForm, setVehForm] = useState(BLANK_VEH);
  const [selectedCiv, setSelectedCiv] = useState(null);

  const setC = (k, v) => setCivForm(f => ({ ...f, [k]: v }));
  const setV = (k, v) => setVehForm(f => ({ ...f, [k]: v }));

  const handleSaveCiv = (e) => {
    e.preventDefault();
    if (editCiv) {
      dispatch({ type: 'UPDATE_CIVILIAN', payload: { ...editCiv, ...civForm } });
    } else {
      dispatch({ type: 'ADD_CIVILIAN', payload: civForm });
    }
    setTab('list');
    setEditCiv(null);
    setCivForm(BLANK_CIV);
  };

  const handleSaveVehicle = (e) => {
    e.preventDefault();
    dispatch({ type: 'ADD_VEHICLE', payload: { ...vehForm, ownerId: showVehicleForm } });
    setShowVehicleForm(null);
    setVehForm(BLANK_VEH);
  };

  const startEdit = (civ) => {
    setEditCiv(civ);
    setCivForm({ ...civ });
    setTab('form');
  };

  const base = { background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', color: '#e2e8f0', padding: '7px 10px', fontSize: '12px', fontFamily: 'Ubuntu Mono, monospace', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '16px', fontFamily: 'Ubuntu Mono, monospace' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <span style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 700, letterSpacing: '1px' }}>CIVILIAN PORTAL</span>
        {tab === 'list' && (
          <button onClick={() => { setTab('form'); setEditCiv(null); setCivForm(BLANK_CIV); }}
            style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '6px 14px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', fontWeight: 700 }}>
            + New Character
          </button>
        )}
        {tab !== 'list' && (
          <button onClick={() => { setTab('list'); setEditCiv(null); }}
            style={{ background: 'transparent', border: '1px solid #1e3060', borderRadius: '4px', color: '#64748b', padding: '6px 14px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>
            ← Back to List
          </button>
        )}
      </div>

      {tab === 'list' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
            {civilians.map(civ => {
              const civVehicles = vehicles.filter(v => civ.vehicles.includes(v.id));
              const civWarrants = warrants.filter(w => w.civilianId === civ.id && w.status === 'ACTIVE');
              return (
                <div key={civ.id} style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '6px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{civ.firstName} {civ.lastName}</div>
                      <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>{civ.gender} • {civ.ethnicity} • DOB: {civ.dob}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {civ.flags.map(f => <StatusBadge key={f} status={f} style={{ fontSize: '9px', padding: '1px 5px' }} />)}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                    <div>📍 {civ.address}</div>
                    <div>🚗 {civVehicles.length} vehicle(s) • DL: <span style={{ color: civ.dlStatus === 'ACTIVE' ? '#22c55e' : '#ef4444' }}>{civ.dlStatus}</span></div>
                    {civWarrants.length > 0 && <div style={{ color: '#ef4444', fontWeight: 700, marginTop: '4px' }}>⚠ {civWarrants.length} ACTIVE WARRANT(S)</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setSelectedCiv(selectedCiv?.id === civ.id ? null : civ)} style={{ ...sBtn('#0a1525','#4a9eff'), flex: 1 }}>View</button>
                    <button onClick={() => startEdit(civ)} style={{ ...sBtn('#0a1525','#f59e0b'), flex: 1 }}>Edit</button>
                    <button onClick={() => setShowVehicleForm(civ.id)} style={{ ...sBtn('#0a1525','#22c55e'), flex: 1 }}>+Veh</button>
                    <button onClick={() => dispatch({ type: 'DELETE_CIVILIAN', payload: civ.id })} style={{ ...sBtn('#7f1d1d','#ef4444') }}>✕</button>
                  </div>

                  {selectedCiv?.id === civ.id && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid #1e3060', paddingTop: '10px', fontSize: '11px', color: '#94a3b8' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        {[['SSN',civ.ssn],['Phone',civ.phone],['Height',civ.height],['Weight',civ.weight],['Hair',civ.hair],['Eyes',civ.eyes],['DL#',civ.dlNumber],['DL Class',civ.dlClass]].map(([k,v]) => (
                          <div key={k}><span style={{ color: '#4a9eff' }}>{k}: </span>{v}</div>
                        ))}
                      </div>
                      {civVehicles.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ color: '#4a9eff', marginBottom: '4px' }}>VEHICLES:</div>
                          {civVehicles.map(v => (
                            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                              <span style={{ color: '#60a5fa' }}>{v.plate}</span>
                              <span>{v.year} {v.make} {v.model} ({v.color})</span>
                              <StatusBadge status={v.regStatus} style={{ fontSize: '9px' }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'form' && (
        <form onSubmit={handleSaveCiv}>
          <div style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '6px', padding: '20px' }}>
            <div style={{ color: '#e2a84b', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>
              {editCiv ? 'EDIT CHARACTER' : 'CREATE CHARACTER'}
            </div>
            <SectionLabel label="PERSONAL INFORMATION" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {[['First Name','firstName'],['Last Name','lastName'],['Date of Birth','dob'],['SSN','ssn'],['Phone','phone']].map(([l,k]) => (
                <div key={k}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>{l.toUpperCase()}</label>
                  <input value={civForm[k]} onChange={e => setC(k, e.target.value)} type={k === 'dob' ? 'date' : 'text'} required={['firstName','lastName'].includes(k)} style={base} />
                </div>
              ))}
              {[['Gender','gender',['Male','Female','Non-Binary','Other']],['Ethnicity','ethnicity',['White','Black','Hispanic','Asian','Native American','Mixed','Other']],['DL Status','dlStatus',['ACTIVE','SUSPENDED','REVOKED','NONE']]].map(([l,k,opts]) => (
                <div key={k}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>{l.toUpperCase()}</label>
                  <select value={civForm[k]} onChange={e => setC(k, e.target.value)} style={base}>
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <SectionLabel label="PHYSICAL DESCRIPTION" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {[['Height','height'],['Weight','weight'],['Hair Color','hair'],['Eye Color','eyes']].map(([l,k]) => (
                <div key={k}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>{l.toUpperCase()}</label>
                  <input value={civForm[k]} onChange={e => setC(k, e.target.value)} style={base} placeholder={k === 'height' ? "5'11\"" : k === 'weight' ? '180 lbs' : ''} />
                </div>
              ))}
            </div>
            <SectionLabel label="ADDRESS" />
            <div style={{ marginBottom: '16px' }}>
              <input value={civForm.address} onChange={e => setC('address', e.target.value)} style={base} placeholder="123 Main St, Arcadia" />
            </div>
            <SectionLabel label="DRIVER'S LICENSE" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[['DL Number','dlNumber'],['DL Expiry','dlExpiry']].map(([l,k]) => (
                <div key={k}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>{l.toUpperCase()}</label>
                  <input value={civForm[k]} onChange={e => setC(k, e.target.value)} type={k.includes('Expiry') ? 'date' : 'text'} style={base} />
                </div>
              ))}
              <div>
                <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>DL CLASS</label>
                <select value={civForm.dlClass} onChange={e => setC('dlClass', e.target.value)} style={base}>
                  {['Class A','Class B','Class C','Commercial','Motorcycle'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '12px 24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', letterSpacing: '2px' }}>
              {editCiv ? 'SAVE CHANGES' : 'CREATE CHARACTER'}
            </button>
          </div>
        </form>
      )}

      {showVehicleForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleSaveVehicle} style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '8px', padding: '24px', maxWidth: '480px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#4a9eff', fontWeight: 700, fontSize: '13px', letterSpacing: '1px' }}>ADD VEHICLE</span>
              <button type="button" onClick={() => setShowVehicleForm(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[['PLATE *','plate'],['MAKE *','make'],['MODEL *','model'],['YEAR','year'],['COLOR','color']].map(([l,k]) => (
                <div key={k}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>{l}</label>
                  <input value={vehForm[k]} onChange={e => setV(k, e.target.value)} required={l.includes('*')} style={base} />
                </div>
              ))}
              <div>
                <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>REGISTRATION</label>
                <select value={vehForm.regStatus} onChange={e => setV('regStatus', e.target.value)} style={base}>
                  {['VALID','EXPIRED','SUSPENDED'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" style={{ width: '100%', background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>
              ADD VEHICLE
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ label }) {
  return (
    <div style={{ color: '#4a9eff', fontSize: '10px', letterSpacing: '2px', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid #1e3060', paddingBottom: '4px' }}>
      {label}
    </div>
  );
}

const sBtn = (bg, color) => ({ background: bg, border: `1px solid ${color}`, borderRadius: '3px', color, padding: '5px 8px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' });
