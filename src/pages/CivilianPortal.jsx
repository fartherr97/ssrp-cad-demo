import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';
import { useResponsive } from '../hooks/useResponsive';

const BLANK_CIV = { firstName:'',lastName:'',dob:'',gender:'Male',ethnicity:'',height:'',weight:'',hair:'',eyes:'',ssn:'',phone:'',address:'',dlNumber:'',dlClass:'Class C',dlStatus:'ACTIVE',dlExpiry:'' };
const BLANK_VEH = { plate:'',make:'',model:'',year:'',color:'',regStatus:'VALID',regExpiry:'',ownerId:'' };

export default function CivilianPortal() {
  const { state, dispatch } = useCAD();
  const { civilians, vehicles, warrants, currentUser } = state;
  const [tab, setTab] = useState('list');
  const [editCiv, setEditCiv] = useState(null);
  const [showVehicleForm, setShowVehicleForm] = useState(null);
  const [civForm, setCivForm] = useState(BLANK_CIV);
  const [vehForm, setVehForm] = useState(BLANK_VEH);
  const [selectedCiv, setSelectedCiv] = useState(null);

  const setC = (k, v) => setCivForm(f => ({ ...f, [k]: v }));
  const setV = (k, v) => setVehForm(f => ({ ...f, [k]: v }));
  const { isMobile } = useResponsive();

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

  return (
    <div style={{ padding: '14px', fontFamily: 'Ubuntu, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#0b0d14', border: '1px solid #1e2533', borderBottom: 'none', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#f9fafb', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px' }}>CIVILIAN PORTAL</span>
        {tab === 'list' && (
          <button onClick={() => { setTab('form'); setEditCiv(null); setCivForm(BLANK_CIV); }}
            style={{ ...blueBtn, marginLeft: 'auto' }}>
            + New Character
          </button>
        )}
        {tab !== 'list' && (
          <button onClick={() => { setTab('list'); setEditCiv(null); }}
            style={{ ...ghostBtn, marginLeft: 'auto' }}>
            Back to List
          </button>
        )}
      </div>

      <div style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '14px' }}>
        {tab === 'list' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: '10px' }}>
            {civilians.map(civ => {
              const civVehicles = vehicles.filter(v => civ.vehicles.includes(v.id));
              const civWarrants = warrants.filter(w => w.civilianId === civ.id && w.status === 'ACTIVE');
              return (
                <div key={civ.id} style={{ background: '#090b10', border: '1px solid #1e2533', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ color: '#f9fafb', fontWeight: 700, fontSize: '14px' }}>{civ.firstName} {civ.lastName}</div>
                      <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>{civ.gender} &bull; {civ.ethnicity} &bull; DOB: {civ.dob}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {civ.flags.map(f => <StatusBadge key={f} status={f} style={{ fontSize: '9px', padding: '1px 4px' }} />)}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '10px', lineHeight: 1.6 }}>
                    <div>{civ.address}</div>
                    <div>{civVehicles.length} vehicle(s) &bull; DL: <span style={{ color: civ.dlStatus === 'ACTIVE' ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{civ.dlStatus}</span></div>
                    {civWarrants.length > 0 && <div style={{ color: '#ef4444', fontWeight: 700, marginTop: '2px' }}>{civWarrants.length} ACTIVE WARRANT(S)</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => setSelectedCiv(selectedCiv?.id === civ.id ? null : civ)} style={{ ...sBtn('#0c1a2e','#3b82f6'), flex: 1 }}>View</button>
                    <button onClick={() => startEdit(civ)} style={{ ...sBtn('#361c00','#fbbf24'), flex: 1 }}>Edit</button>
                    <button onClick={() => setShowVehicleForm(civ.id)} style={{ ...sBtn('#052e16','#22c55e'), flex: 1 }}>+Veh</button>
                    <button onClick={() => dispatch({ type: 'DELETE_CIVILIAN', payload: civ.id })} style={sBtn('#450a0a','#ef4444')}>X</button>
                  </div>

                  {selectedCiv?.id === civ.id && (
                    <div style={{ marginTop: '10px', borderTop: '1px solid #1f2937', paddingTop: '10px', fontSize: '11px', color: '#9ca3af' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        {[['SSN',civ.ssn],['Phone',civ.phone],['Height',civ.height],['Weight',civ.weight],['Hair',civ.hair],['Eyes',civ.eyes],['DL#',civ.dlNumber],['DL Class',civ.dlClass]].map(([k,v]) => (
                          <div key={k}><span style={{ color: '#3b82f6' }}>{k}: </span>{v}</div>
                        ))}
                      </div>
                      {civVehicles.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ color: '#3b82f6', marginBottom: '4px', fontSize: '11px', letterSpacing: '1px', fontWeight: 700 }}>VEHICLES:</div>
                          {civVehicles.map(v => (
                            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
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
        )}

        {tab === 'form' && (
          <form onSubmit={handleSaveCiv}>
            <div style={{ background: '#090b10', border: '1px solid #1e2533', padding: '18px' }}>
              <div style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '16px' }}>
                {editCiv ? 'EDIT CHARACTER' : 'CREATE CHARACTER'}
              </div>
              <SectionLabel label="PERSONAL INFORMATION" />
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                {[['First Name','firstName'],['Last Name','lastName'],['Date of Birth','dob'],['SSN','ssn'],['Phone','phone']].map(([l,k]) => (
                  <div key={k}>
                    <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>{l.toUpperCase()}</label>
                    <input value={civForm[k]} onChange={e => setC(k, e.target.value)} type={k === 'dob' ? 'date' : 'text'} required={['firstName','lastName'].includes(k)} style={inputBase} />
                  </div>
                ))}
                {[['Gender','gender',['Male','Female','Non-Binary','Other']],['Ethnicity','ethnicity',['White','Black','Hispanic','Asian','Native American','Mixed','Other']],['DL Status','dlStatus',['ACTIVE','SUSPENDED','REVOKED','NONE']]].map(([l,k,opts]) => (
                  <div key={k}>
                    <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>{l.toUpperCase()}</label>
                    <select value={civForm[k]} onChange={e => setC(k, e.target.value)} style={inputBase}>
                      {opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <SectionLabel label="PHYSICAL DESCRIPTION" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
                {[['Height','height'],['Weight','weight'],['Hair Color','hair'],['Eye Color','eyes']].map(([l,k]) => (
                  <div key={k}>
                    <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>{l.toUpperCase()}</label>
                    <input value={civForm[k]} onChange={e => setC(k, e.target.value)} style={inputBase} placeholder={k === 'height' ? "5'11\"" : k === 'weight' ? '180 lbs' : ''} />
                  </div>
                ))}
              </div>
              <SectionLabel label="ADDRESS" />
              <div style={{ marginBottom: '14px' }}>
                <input value={civForm.address} onChange={e => setC('address', e.target.value)} style={inputBase} placeholder="123 Main St, Tampa, FL" />
              </div>
              <SectionLabel label="DRIVER'S LICENSE" />
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
                {[['DL Number','dlNumber'],['DL Expiry','dlExpiry']].map(([l,k]) => (
                  <div key={k}>
                    <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>{l.toUpperCase()}</label>
                    <input value={civForm[k]} onChange={e => setC(k, e.target.value)} type={k.includes('Expiry') ? 'date' : 'text'} style={inputBase} />
                  </div>
                ))}
                <div>
                  <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>DL CLASS</label>
                  <select value={civForm.dlClass} onChange={e => setC('dlClass', e.target.value)} style={inputBase}>
                    {['Class A','Class B','Class C','Commercial','Motorcycle'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" style={{ ...blueBtn, padding: '10px 24px', fontSize: '13px', letterSpacing: '2px', width: '100%' }}>
                {editCiv ? 'SAVE CHANGES' : 'CREATE CHARACTER'}
              </button>
            </div>
          </form>
        )}
      </div>

      {showVehicleForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleSaveVehicle} style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '22px', maxWidth: '480px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '13px', letterSpacing: '1.5px' }}>ADD VEHICLE</span>
              <button type="button" onClick={() => setShowVehicleForm(null)} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '16px' }}>X</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              {[['PLATE *','plate'],['MAKE *','make'],['MODEL *','model'],['YEAR','year'],['COLOR','color']].map(([l,k]) => (
                <div key={k}>
                  <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>{l}</label>
                  <input value={vehForm[k]} onChange={e => setV(k, e.target.value)} required={l.includes('*')} style={inputBase} />
                </div>
              ))}
              <div>
                <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>REGISTRATION</label>
                <select value={vehForm.regStatus} onChange={e => setV('regStatus', e.target.value)} style={inputBase}>
                  {['VALID','EXPIRED','SUSPENDED'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" style={{ width: '100%', ...blueBtn, padding: '9px', fontSize: '13px', letterSpacing: '1px' }}>
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
    <div style={{ color: '#3b82f6', fontSize: '10px', letterSpacing: '2px', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid #1f2937', paddingBottom: '4px' }}>
      {label}
    </div>
  );
}

const inputBase = { width: '100%', background: '#090b10', border: '1px solid #1e2533', color: '#d1d5db', padding: '7px 10px', fontSize: '13px', fontFamily: 'Ubuntu, sans-serif', boxSizing: 'border-box' };
const blueBtn = { background: '#0c1a2e', border: '1px solid #3b82f6', color: '#3b82f6', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif', fontWeight: 700 };
const ghostBtn = { background: 'transparent', border: '1px solid #1f2937', color: '#4b5563', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif' };
const sBtn = (bg, color) => ({ background: bg, border: `1px solid ${color}`, color, padding: '4px 8px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif', fontWeight: 600 });
