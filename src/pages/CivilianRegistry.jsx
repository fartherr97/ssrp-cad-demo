import { useState } from 'react';
import { useCAD } from '../store/cadStore';

export default function CivilianRegistry() {
  const { state, dispatch } = useCAD();
  const { civilians, vehicles, warrants } = state;

  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showAddVeh, setShowAddVeh] = useState(false);
  const [tab, setTab] = useState('INFO');
  const [form, setForm] = useState({
    firstName: '', lastName: '', dob: '', gender: 'Male', ethnicity: 'White',
    height: "5'10\"", weight: '180 lbs', hair: 'Brown', eyes: 'Brown',
    ssn: '', phone: '', address: '', dlNumber: '', dlClass: 'Class C', dlStatus: 'ACTIVE', dlExpiry: '',
  });
  const [vehForm, setVehForm] = useState({ plate: '', make: '', model: '', year: '', color: '', regStatus: 'VALID', regExpiry: '' });

  const selCiv = selected != null ? civilians.find(c => c.id === selected) : null;
  const civVehicles = selCiv ? vehicles.filter(v => selCiv.vehicles?.includes(v.id)) : [];
  const civWarrants = selCiv ? warrants.filter(w => w.civilianId === selCiv.id && w.status === 'ACTIVE') : [];

  const filtered = civilians.filter(c =>
    search ? `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) : true
  );

  const createCivilian = () => {
    if (!form.firstName || !form.lastName) return;
    dispatch({ type: 'ADD_CIVILIAN', payload: { ...form } });
    setForm({ firstName:'',lastName:'',dob:'',gender:'Male',ethnicity:'White',height:"5'10\"",weight:'180 lbs',hair:'Brown',eyes:'Brown',ssn:'',phone:'',address:'',dlNumber:'',dlClass:'Class C',dlStatus:'ACTIVE',dlExpiry:'' });
    setShowCreate(false);
  };

  const addVehicle = () => {
    if (!vehForm.plate || !vehForm.make || !selCiv) return;
    dispatch({ type: 'ADD_VEHICLE', payload: { ...vehForm, ownerId: selCiv.id } });
    setVehForm({ plate:'',make:'',model:'',year:'',color:'',regStatus:'VALID',regExpiry:'' });
    setShowAddVeh(false);
  };

  const deleteCiv = (id) => {
    if (confirm('Delete this civilian record?')) {
      dispatch({ type: 'DELETE_CIVILIAN', payload: id });
      setSelected(null);
    }
  };

  return (
    <div className="n-page" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 0, flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* LEFT: Civilian List */}
        <div className="n-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderBottom: 'none', borderRight: 'none' }}>
          <div className="n-panel-header">
            <div className="n-panel-title">Civilian Registry</div>
            <button className="n-btn n-btn-primary n-btn-xs" onClick={() => setShowCreate(true)}>+ New</button>
          </div>
          <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--n-border)', flexShrink: 0 }}>
            <input className="n-input" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="n-panel-body scroll-y">
            <div style={{ fontSize: 9, color: 'var(--n-text-muted)', padding: '5px 10px 2px', letterSpacing: '0.5px' }}>
              {filtered.length} RECORDS
            </div>
            {filtered.map(c => {
              const hasWarrant = warrants.some(w => w.civilianId === c.id && w.status === 'ACTIVE');
              return (
                <div
                  key={c.id}
                  className="n-card n-card-hover"
                  style={{
                    margin: '3px 8px', padding: '7px 9px', borderRadius: 3, cursor: 'pointer',
                    border: selected === c.id ? '1px solid var(--n-border-accent)' : '1px solid var(--n-border-subtle)',
                    background: selected === c.id ? 'var(--n-bg-selected)' : 'var(--n-bg-card)',
                  }}
                  onClick={() => { setSelected(c.id); setTab('INFO'); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, flex: 1 }}>{c.firstName} {c.lastName}</div>
                    {hasWarrant && <span className="n-badge badge-red" style={{ fontSize: 8 }}>WARRANT</span>}
                  </div>
                  <div className="n-data" style={{ fontSize: 9 }}>DOB: {c.dob} · {c.gender}</div>
                  <div style={{ display: 'flex', gap: 3, marginTop: 3, flexWrap: 'wrap' }}>
                    {c.flags?.filter(f => f !== 'WARRANT').map(f => (
                      <span key={f} className={`n-badge ${f === 'VIOLENT' ? 'badge-fire' : 'badge-orange'}`} style={{ fontSize: 8 }}>{f}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Detail */}
        <div className="n-panel" style={{ borderRadius: 0, borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}>
          {!selCiv ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--n-text-muted)', padding: 24 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.2">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--n-text-dim)', marginBottom: 3 }}>No civilian selected</div>
                <div style={{ fontSize: 10 }}>Select a record or create a new civilian</div>
              </div>
              <button className="n-btn n-btn-primary" onClick={() => setShowCreate(true)}>Create New Civilian</button>
            </div>
          ) : (
            <>
              <div style={{ padding: '10px 14px', background: 'var(--n-bg-card)', borderBottom: '1px solid var(--n-border)', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{selCiv.firstName} {selCiv.lastName}</div>
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--n-text-dim)', marginTop: 2 }}>
                      DOB: {selCiv.dob} · {selCiv.gender} · {selCiv.ethnicity}
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
                      {civWarrants.length > 0 && <span className="n-badge badge-red">ACTIVE WARRANT</span>}
                      {selCiv.dlStatus === 'SUSPENDED' && <span className="n-badge badge-orange">DL SUSPENDED</span>}
                      {selCiv.flags?.filter(f => f !== 'WARRANT').map(f => (
                        <span key={f} className={`n-badge ${f === 'VIOLENT' ? 'badge-fire' : 'badge-orange'}`}>{f}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button className="n-btn n-btn-secondary n-btn-sm" onClick={() => setShowAddVeh(true)}>+ Vehicle</button>
                    <button className="n-btn n-btn-danger n-btn-sm" onClick={() => deleteCiv(selCiv.id)}>Delete</button>
                  </div>
                </div>
              </div>

              <div className="n-tabs">
                {['INFO','VEHICLES','FLAGS'].map(t => (
                  <button key={t} className={`n-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                    {t}
                    {t === 'VEHICLES' && civVehicles.length > 0 && (
                      <span style={{ marginLeft: 4, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--n-text-dim)' }}>({civVehicles.length})</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="n-panel-body scroll-y" style={{ padding: 14 }}>
                {tab === 'INFO' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="n-card">
                      <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Personal</div>
                      <div className="detail-row"><span className="detail-label">Height</span><span className="detail-value">{selCiv.height}</span></div>
                      <div className="detail-row"><span className="detail-label">Weight</span><span className="detail-value">{selCiv.weight}</span></div>
                      <div className="detail-row"><span className="detail-label">Hair</span><span className="detail-value">{selCiv.hair}</span></div>
                      <div className="detail-row"><span className="detail-label">Eyes</span><span className="detail-value">{selCiv.eyes}</span></div>
                    </div>
                    <div className="n-card">
                      <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Identification</div>
                      <div className="detail-row"><span className="detail-label">SSN</span><span className="detail-value-mono">{selCiv.ssn}</span></div>
                      <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-value-mono">{selCiv.phone}</span></div>
                      <div className="detail-row"><span className="detail-label">Address</span><span className="detail-value">{selCiv.address}</span></div>
                    </div>
                    <div className="n-card" style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Driver License</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div className="detail-row"><span className="detail-label">DL Number</span><span className="detail-value-mono">{selCiv.dlNumber}</span></div>
                        <div className="detail-row"><span className="detail-label">Class</span><span className="detail-value">{selCiv.dlClass}</span></div>
                        <div className="detail-row"><span className="detail-label">Status</span>
                          <span className={`n-badge ${selCiv.dlStatus === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>{selCiv.dlStatus}</span>
                        </div>
                        <div className="detail-row"><span className="detail-label">Expiry</span><span className="detail-value-mono">{selCiv.dlExpiry}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'VEHICLES' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {civVehicles.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 24, color: 'var(--n-text-muted)', fontSize: 11 }}>
                        No vehicles registered
                        <br />
                        <button className="n-btn n-btn-primary" style={{ marginTop: 10 }} onClick={() => setShowAddVeh(true)}>Add Vehicle</button>
                      </div>
                    ) : civVehicles.map(v => (
                      <div key={v.id} className="n-card">
                        <div style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center' }}>
                          <span className="n-data" style={{ fontSize: 14, fontWeight: 700 }}>{v.plate}</span>
                          <span className={`n-badge ${v.regStatus === 'VALID' ? 'badge-green' : 'badge-red'}`}>{v.regStatus}</span>
                          {v.stolen && <span className="n-badge badge-red">STOLEN</span>}
                        </div>
                        <div style={{ fontSize: 12 }}>{v.year} {v.make} {v.model} · {v.color}</div>
                        <div style={{ fontSize: 10, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                          Reg. Expires: {v.regExpiry}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'FLAGS' && (
                  <div className="n-card">
                    <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>System Flags</div>
                    {selCiv.flags?.length === 0 && civWarrants.length === 0 ? (
                      <div style={{ fontSize: 11, color: 'var(--n-text-muted)' }}>No flags on record</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {civWarrants.length > 0 && <span className="n-badge badge-red" style={{ display: 'inline-flex', width: 'fit-content' }}>ACTIVE WARRANT ({civWarrants.length})</span>}
                        {selCiv.flags?.map(f => (
                          <span key={f} className={`n-badge ${f === 'VIOLENT' ? 'badge-fire' : f === 'WARRANT' ? 'badge-red' : 'badge-orange'}`} style={{ display: 'inline-flex', width: 'fit-content' }}>{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Civilian Modal */}
      {showCreate && (
        <div className="n-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="n-modal n-modal-wide" style={{ maxWidth: 600 }}>
            <div className="n-modal-header">
              <div className="n-modal-title">Create Civilian Record</div>
              <button className="n-btn n-btn-ghost n-btn-sm" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <div className="n-modal-body">
              <div className="n-grid-2">
                <div className="n-field"><label className="n-label">First Name *</label><input className="n-input" value={form.firstName} onChange={e => setForm(p => ({...p, firstName: e.target.value}))} /></div>
                <div className="n-field"><label className="n-label">Last Name *</label><input className="n-input" value={form.lastName} onChange={e => setForm(p => ({...p, lastName: e.target.value}))} /></div>
                <div className="n-field"><label className="n-label">Date of Birth</label><input className="n-input" type="date" value={form.dob} onChange={e => setForm(p => ({...p, dob: e.target.value}))} /></div>
                <div className="n-field"><label className="n-label">Gender</label><select className="n-select" value={form.gender} onChange={e => setForm(p => ({...p, gender: e.target.value}))}><option>Male</option><option>Female</option><option>Non-Binary</option></select></div>
                <div className="n-field"><label className="n-label">Ethnicity</label><select className="n-select" value={form.ethnicity} onChange={e => setForm(p => ({...p, ethnicity: e.target.value}))}><option>White</option><option>Black</option><option>Hispanic</option><option>Asian</option><option>Other</option></select></div>
                <div className="n-field"><label className="n-label">Hair Color</label><input className="n-input" value={form.hair} onChange={e => setForm(p => ({...p, hair: e.target.value}))} /></div>
                <div className="n-field"><label className="n-label">Eye Color</label><input className="n-input" value={form.eyes} onChange={e => setForm(p => ({...p, eyes: e.target.value}))} /></div>
                <div className="n-field"><label className="n-label">Height</label><input className="n-input" value={form.height} onChange={e => setForm(p => ({...p, height: e.target.value}))} /></div>
                <div className="n-field"><label className="n-label">Phone</label><input className="n-input" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} /></div>
                <div className="n-field"><label className="n-label">SSN</label><input className="n-input" placeholder="XXX-XX-XXXX" value={form.ssn} onChange={e => setForm(p => ({...p, ssn: e.target.value}))} /></div>
              </div>
              <div className="n-field"><label className="n-label">Home Address</label><input className="n-input" value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} /></div>
              <div className="n-grid-2">
                <div className="n-field"><label className="n-label">DL Number</label><input className="n-input" value={form.dlNumber} onChange={e => setForm(p => ({...p, dlNumber: e.target.value}))} /></div>
                <div className="n-field"><label className="n-label">DL Status</label><select className="n-select" value={form.dlStatus} onChange={e => setForm(p => ({...p, dlStatus: e.target.value}))}><option value="ACTIVE">ACTIVE</option><option value="SUSPENDED">SUSPENDED</option><option value="REVOKED">REVOKED</option><option value="EXPIRED">EXPIRED</option></select></div>
              </div>
            </div>
            <div className="n-modal-footer">
              <button className="n-btn n-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="n-btn n-btn-primary" onClick={createCivilian} disabled={!form.firstName || !form.lastName}>Create Record</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddVeh && selCiv && (
        <div className="n-overlay" onClick={e => e.target === e.currentTarget && setShowAddVeh(false)}>
          <div className="n-modal">
            <div className="n-modal-header">
              <div className="n-modal-title">Register Vehicle — {selCiv.firstName} {selCiv.lastName}</div>
              <button className="n-btn n-btn-ghost n-btn-sm" onClick={() => setShowAddVeh(false)}>✕</button>
            </div>
            <div className="n-modal-body">
              <div className="n-grid-2">
                <div className="n-field"><label className="n-label">License Plate *</label><input className="n-input" placeholder="e.g. ABC-1234" value={vehForm.plate} onChange={e => setVehForm(p => ({...p, plate: e.target.value}))} /></div>
                <div className="n-field"><label className="n-label">Year</label><input className="n-input" placeholder="2023" value={vehForm.year} onChange={e => setVehForm(p => ({...p, year: e.target.value}))} /></div>
                <div className="n-field"><label className="n-label">Make *</label><input className="n-input" placeholder="Ford" value={vehForm.make} onChange={e => setVehForm(p => ({...p, make: e.target.value}))} /></div>
                <div className="n-field"><label className="n-label">Model</label><input className="n-input" placeholder="F-150" value={vehForm.model} onChange={e => setVehForm(p => ({...p, model: e.target.value}))} /></div>
                <div className="n-field"><label className="n-label">Color</label><input className="n-input" value={vehForm.color} onChange={e => setVehForm(p => ({...p, color: e.target.value}))} /></div>
                <div className="n-field"><label className="n-label">Reg. Status</label><select className="n-select" value={vehForm.regStatus} onChange={e => setVehForm(p => ({...p, regStatus: e.target.value}))}><option value="VALID">VALID</option><option value="EXPIRED">EXPIRED</option><option value="SUSPENDED">SUSPENDED</option></select></div>
              </div>
              <div className="n-field"><label className="n-label">Reg. Expiry Date</label><input className="n-input" type="date" value={vehForm.regExpiry} onChange={e => setVehForm(p => ({...p, regExpiry: e.target.value}))} /></div>
            </div>
            <div className="n-modal-footer">
              <button className="n-btn n-btn-secondary" onClick={() => setShowAddVeh(false)}>Cancel</button>
              <button className="n-btn n-btn-primary" onClick={addVehicle} disabled={!vehForm.plate || !vehForm.make}>Register Vehicle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
