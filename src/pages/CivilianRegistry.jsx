import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import {
  S_PAGE, S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_CARD, cardHoverOn, cardHoverOff,
  S_INPUT, S_SELECT, S_LABEL, S_FIELD,
  S_BTN_PRIMARY, S_BTN_SECONDARY, S_BTN_GHOST, S_BTN_DANGER,
  sm, btnHoverOn, btnHoverOff, btnActiveOn,
  S_TABS, tabStyle,
  S_OVERLAY, S_MODAL, S_MODAL_HEADER, S_MODAL_TITLE, S_MODAL_BODY, S_MODAL_FOOTER,
  BADGE,
  S_DETAIL_ROW, S_DETAIL_LABEL, S_DETAIL_VALUE, S_DETAIL_VALUE_MONO,
  S_DATA,
} from '../constants/styles';

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
    <div style={{ ...S_PAGE, padding: 0, overflow: 'hidden', gap: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 0, flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* LEFT: Civilian List */}
        <div style={{ ...S_PANEL, borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderBottom: 'none', borderRight: 'none' }}>
          <div className={S_PANEL_HEADER}>
            <div className={S_PANEL_TITLE}>Civilian Registry</div>
            <button className={sm(S_BTN_PRIMARY)} onMouseDown={btnActiveOn} onClick={() => setShowCreate(true)}>+ New</button>
          </div>
          <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--n-border)', flexShrink: 0 }}>
            <input className={S_INPUT} placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className={S_PANEL_BODY}>
            <div style={{ fontSize: 9, color: 'var(--n-text-muted)', padding: '5px 10px 2px', letterSpacing: '0.5px' }}>
              {filtered.length} RECORDS
            </div>
            {filtered.map(c => {
              const hasWarrant = warrants.some(w => w.civilianId === c.id && w.status === 'ACTIVE');
              return (
                <div
                  key={c.id}
                  style={{
                    ...S_CARD,
                    margin: '3px 8px', padding: '7px 9px', borderRadius: 3, cursor: 'pointer',
                    border: selected === c.id ? '1px solid var(--n-border-accent)' : '1px solid var(--n-border-subtle)',
                    background: selected === c.id ? 'var(--n-bg-selected)' : 'var(--n-bg-card)',
                  }}
                  onMouseEnter={cardHoverOn}
                  onMouseLeave={cardHoverOff}
                  onClick={() => { setSelected(c.id); setTab('INFO'); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, flex: 1 }}>{c.firstName} {c.lastName}</div>
                    {hasWarrant && <span style={{ ...BADGE.red, fontSize: 8 }}>WARRANT</span>}
                  </div>
                  <div style={{ ...S_DATA, fontSize: 9 }}>DOB: {c.dob} · {c.gender}</div>
                  <div style={{ display: 'flex', gap: 3, marginTop: 3, flexWrap: 'wrap' }}>
                    {c.flags?.filter(f => f !== 'WARRANT').map(f => (
                      <span key={f} style={{ ...(f === 'VIOLENT' ? BADGE.fire : BADGE.orange), fontSize: 8 }}>{f}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Detail */}
        <div style={{ ...S_PANEL, borderRadius: 0, borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}>
          {!selCiv ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--n-text-muted)', padding: 24 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.2">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--n-text-dim)', marginBottom: 3 }}>No civilian selected</div>
                <div style={{ fontSize: 10 }}>Select a record or create a new civilian</div>
              </div>
              <button className={S_BTN_PRIMARY} onMouseDown={btnActiveOn} onClick={() => setShowCreate(true)}>Create New Civilian</button>
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
                      {civWarrants.length > 0 && <span className={BADGE.red}>ACTIVE WARRANT</span>}
                      {selCiv.dlStatus === 'SUSPENDED' && <span className={BADGE.orange}>DL SUSPENDED</span>}
                      {selCiv.flags?.filter(f => f !== 'WARRANT').map(f => (
                        <span key={f} style={f === 'VIOLENT' ? BADGE.fire : BADGE.orange}>{f}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button className={sm(S_BTN_SECONDARY)} onMouseDown={btnActiveOn} onClick={() => setShowAddVeh(true)}>+ Vehicle</button>
                    <button className={sm(S_BTN_DANGER)} onMouseDown={btnActiveOn} onClick={() => deleteCiv(selCiv.id)}>Delete</button>
                  </div>
                </div>
              </div>

              <div style={S_TABS}>
                {['INFO','VEHICLES','FLAGS'].map(t => (
                  <button key={t} style={tabStyle(tab === t)} onClick={() => setTab(t)}>
                    {t}
                    {t === 'VEHICLES' && civVehicles.length > 0 && (
                      <span style={{ marginLeft: 4, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--n-text-dim)' }}>({civVehicles.length})</span>
                    )}
                  </button>
                ))}
              </div>

              <div style={{ ...S_PANEL_BODY, padding: 14 }}>
                {tab === 'INFO' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className={S_CARD}>
                      <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Personal</div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Height</span><span className={S_DETAIL_VALUE}>{selCiv.height}</span></div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Weight</span><span className={S_DETAIL_VALUE}>{selCiv.weight}</span></div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Hair</span><span className={S_DETAIL_VALUE}>{selCiv.hair}</span></div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Eyes</span><span className={S_DETAIL_VALUE}>{selCiv.eyes}</span></div>
                    </div>
                    <div className={S_CARD}>
                      <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Identification</div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>SSN</span><span className={S_DETAIL_VALUE_MONO}>{selCiv.ssn}</span></div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Phone</span><span className={S_DETAIL_VALUE_MONO}>{selCiv.phone}</span></div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Address</span><span className={S_DETAIL_VALUE}>{selCiv.address}</span></div>
                    </div>
                    <div style={{ ...S_CARD, gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Driver License</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>DL Number</span><span className={S_DETAIL_VALUE_MONO}>{selCiv.dlNumber}</span></div>
                        <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Class</span><span className={S_DETAIL_VALUE}>{selCiv.dlClass}</span></div>
                        <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Status</span>
                          <span style={selCiv.dlStatus === 'ACTIVE' ? BADGE.green : BADGE.red}>{selCiv.dlStatus}</span>
                        </div>
                        <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Expiry</span><span className={S_DETAIL_VALUE_MONO}>{selCiv.dlExpiry}</span></div>
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
                        <button style={{ ...S_BTN_PRIMARY, marginTop: 10 }} onMouseDown={btnActiveOn} onClick={() => setShowAddVeh(true)}>Add Vehicle</button>
                      </div>
                    ) : civVehicles.map(v => (
                      <div key={v.id} className={S_CARD}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center' }}>
                          <span style={{ ...S_DATA, fontSize: 14, fontWeight: 700 }}>{v.plate}</span>
                          <span style={v.regStatus === 'VALID' ? BADGE.green : BADGE.red}>{v.regStatus}</span>
                          {v.stolen && <span className={BADGE.red}>STOLEN</span>}
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
                  <div className={S_CARD}>
                    <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>System Flags</div>
                    {selCiv.flags?.length === 0 && civWarrants.length === 0 ? (
                      <div style={{ fontSize: 11, color: 'var(--n-text-muted)' }}>No flags on record</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {civWarrants.length > 0 && <span style={{ ...BADGE.red, display: 'inline-flex', width: 'fit-content' }}>ACTIVE WARRANT ({civWarrants.length})</span>}
                        {selCiv.flags?.map(f => (
                          <span key={f} style={{ ...(f === 'VIOLENT' ? BADGE.fire : f === 'WARRANT' ? BADGE.red : BADGE.orange), display: 'inline-flex', width: 'fit-content' }}>{f}</span>
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
        <div className={S_OVERLAY} onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div style={{ ...S_MODAL, maxWidth: 600 }}>
            <div className={S_MODAL_HEADER}>
              <div className={S_MODAL_TITLE}>Create Civilian Record</div>
              <button className={sm(S_BTN_GHOST)} onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <div className={S_MODAL_BODY}>
              <div className="n-grid-2">
                <div style={S_FIELD}><label className={S_LABEL}>First Name *</label><input className={S_INPUT} value={form.firstName} onChange={e => setForm(p => ({...p, firstName: e.target.value}))} /></div>
                <div style={S_FIELD}><label className={S_LABEL}>Last Name *</label><input className={S_INPUT} value={form.lastName} onChange={e => setForm(p => ({...p, lastName: e.target.value}))} /></div>
                <div style={S_FIELD}><label className={S_LABEL}>Date of Birth</label><input className={S_INPUT} type="date" value={form.dob} onChange={e => setForm(p => ({...p, dob: e.target.value}))} /></div>
                <div style={S_FIELD}><label className={S_LABEL}>Gender</label><select className={S_SELECT} value={form.gender} onChange={e => setForm(p => ({...p, gender: e.target.value}))}><option>Male</option><option>Female</option><option>Non-Binary</option></select></div>
                <div style={S_FIELD}><label className={S_LABEL}>Ethnicity</label><select className={S_SELECT} value={form.ethnicity} onChange={e => setForm(p => ({...p, ethnicity: e.target.value}))}><option>White</option><option>Black</option><option>Hispanic</option><option>Asian</option><option>Other</option></select></div>
                <div style={S_FIELD}><label className={S_LABEL}>Hair Color</label><input className={S_INPUT} value={form.hair} onChange={e => setForm(p => ({...p, hair: e.target.value}))} /></div>
                <div style={S_FIELD}><label className={S_LABEL}>Eye Color</label><input className={S_INPUT} value={form.eyes} onChange={e => setForm(p => ({...p, eyes: e.target.value}))} /></div>
                <div style={S_FIELD}><label className={S_LABEL}>Height</label><input className={S_INPUT} value={form.height} onChange={e => setForm(p => ({...p, height: e.target.value}))} /></div>
                <div style={S_FIELD}><label className={S_LABEL}>Phone</label><input className={S_INPUT} value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} /></div>
                <div style={S_FIELD}><label className={S_LABEL}>SSN</label><input className={S_INPUT} placeholder="XXX-XX-XXXX" value={form.ssn} onChange={e => setForm(p => ({...p, ssn: e.target.value}))} /></div>
              </div>
              <div style={S_FIELD}><label className={S_LABEL}>Home Address</label><input className={S_INPUT} value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} /></div>
              <div className="n-grid-2">
                <div style={S_FIELD}><label className={S_LABEL}>DL Number</label><input className={S_INPUT} value={form.dlNumber} onChange={e => setForm(p => ({...p, dlNumber: e.target.value}))} /></div>
                <div style={S_FIELD}><label className={S_LABEL}>DL Status</label><select className={S_SELECT} value={form.dlStatus} onChange={e => setForm(p => ({...p, dlStatus: e.target.value}))}><option value="ACTIVE">ACTIVE</option><option value="SUSPENDED">SUSPENDED</option><option value="REVOKED">REVOKED</option><option value="EXPIRED">EXPIRED</option></select></div>
              </div>
            </div>
            <div className={S_MODAL_FOOTER}>
              <button className={S_BTN_SECONDARY} onMouseDown={btnActiveOn} onClick={() => setShowCreate(false)}>Cancel</button>
              <button className={S_BTN_PRIMARY} onMouseDown={btnActiveOn} onClick={createCivilian} disabled={!form.firstName || !form.lastName}>Create Record</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddVeh && selCiv && (
        <div className={S_OVERLAY} onClick={e => e.target === e.currentTarget && setShowAddVeh(false)}>
          <div className={S_MODAL}>
            <div className={S_MODAL_HEADER}>
              <div className={S_MODAL_TITLE}>Register Vehicle — {selCiv.firstName} {selCiv.lastName}</div>
              <button className={sm(S_BTN_GHOST)} onClick={() => setShowAddVeh(false)}>✕</button>
            </div>
            <div className={S_MODAL_BODY}>
              <div className="n-grid-2">
                <div style={S_FIELD}><label className={S_LABEL}>License Plate *</label><input className={S_INPUT} placeholder="e.g. ABC-1234" value={vehForm.plate} onChange={e => setVehForm(p => ({...p, plate: e.target.value}))} /></div>
                <div style={S_FIELD}><label className={S_LABEL}>Year</label><input className={S_INPUT} placeholder="2023" value={vehForm.year} onChange={e => setVehForm(p => ({...p, year: e.target.value}))} /></div>
                <div style={S_FIELD}><label className={S_LABEL}>Make *</label><input className={S_INPUT} placeholder="Ford" value={vehForm.make} onChange={e => setVehForm(p => ({...p, make: e.target.value}))} /></div>
                <div style={S_FIELD}><label className={S_LABEL}>Model</label><input className={S_INPUT} placeholder="F-150" value={vehForm.model} onChange={e => setVehForm(p => ({...p, model: e.target.value}))} /></div>
                <div style={S_FIELD}><label className={S_LABEL}>Color</label><input className={S_INPUT} value={vehForm.color} onChange={e => setVehForm(p => ({...p, color: e.target.value}))} /></div>
                <div style={S_FIELD}><label className={S_LABEL}>Reg. Status</label><select className={S_SELECT} value={vehForm.regStatus} onChange={e => setVehForm(p => ({...p, regStatus: e.target.value}))}><option value="VALID">VALID</option><option value="EXPIRED">EXPIRED</option><option value="SUSPENDED">SUSPENDED</option></select></div>
              </div>
              <div style={S_FIELD}><label className={S_LABEL}>Reg. Expiry Date</label><input className={S_INPUT} type="date" value={vehForm.regExpiry} onChange={e => setVehForm(p => ({...p, regExpiry: e.target.value}))} /></div>
            </div>
            <div className={S_MODAL_FOOTER}>
              <button className={S_BTN_SECONDARY} onMouseDown={btnActiveOn} onClick={() => setShowAddVeh(false)}>Cancel</button>
              <button className={S_BTN_PRIMARY} onMouseDown={btnActiveOn} onClick={addVehicle} disabled={!vehForm.plate || !vehForm.make}>Register Vehicle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
