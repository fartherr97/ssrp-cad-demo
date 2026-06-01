import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import {
  BADGE, S_PAGE, S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_CARD, S_TABLE, S_TABLE_TH, S_TABLE_TD, S_BTN_PRIMARY, S_BTN_SECONDARY,
  S_BTN_DANGER, S_BTN_GHOST, S_INPUT, S_SELECT, S_LABEL, S_FIELD, S_DATA,
  S_OVERLAY, S_MODAL, S_MODAL_HEADER, S_MODAL_TITLE, S_MODAL_BODY, S_MODAL_FOOTER,
  S_DETAIL_ROW, S_DETAIL_LABEL, S_DETAIL_VALUE, S_DETAIL_VALUE_MONO,
  trHoverOn, trHoverOff, xs, sm,
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
    <div className={`${S_PAGE} !p-0 overflow-hidden !gap-0`}>
      <div className="grid overflow-hidden flex-1 min-h-0" style={{ gridTemplateColumns: '260px 1fr' }}>
        {/* LEFT: Civilian List */}
        <div className="flex flex-col border-r border-border-base overflow-hidden">
          <div className={S_PANEL_HEADER}>
            <div className={S_PANEL_TITLE}>Civilian Registry</div>
            <button className={xs(S_BTN_PRIMARY)} onClick={() => setShowCreate(true)}>+ New</button>
          </div>
          <div className="px-2 py-1.5 border-b border-border-base shrink-0">
            <input className={S_INPUT} placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="text-[9px] text-cad-muted px-2.5 pt-1.5 pb-0.5 tracking-[0.5px]">
              {filtered.length} RECORDS
            </div>
            {filtered.map(c => {
              const hasWarrant = warrants.some(w => w.civilianId === c.id && w.status === 'ACTIVE');
              return (
                <div
                  key={c.id}
                  className={`mx-2 my-0.5 px-2.5 py-1.5 rounded cursor-pointer border transition-colors ${
                    selected === c.id
                      ? 'border-sky-700/60 bg-app-selected'
                      : 'border-border-faint bg-app-card hover:bg-app-hover'
                  }`}
                  onClick={() => { setSelected(c.id); setTab('INFO'); }}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="font-semibold text-[12px] flex-1">{c.firstName} {c.lastName}</div>
                    {hasWarrant && <span className={`${BADGE.red} text-[8px]`}>WARRANT</span>}
                  </div>
                  <div className={`${S_DATA} text-[9px]`}>DOB: {c.dob} · {c.gender}</div>
                  <div className="flex gap-0.5 mt-0.5 flex-wrap">
                    {c.flags?.filter(f => f !== 'WARRANT').map(f => (
                      <span key={f} className={`${f === 'VIOLENT' ? BADGE.fire : BADGE.orange} text-[8px]`}>{f}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Detail */}
        <div className="flex flex-col overflow-hidden">
          {!selCiv ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-cad-muted p-6">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.2">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              <div className="text-center">
                <div className="text-[12px] font-medium text-slate-500 mb-0.5">No civilian selected</div>
                <div className="text-[10px] text-cad-muted">Select a record or create a new civilian</div>
              </div>
              <button className={S_BTN_PRIMARY} onClick={() => setShowCreate(true)}>Create New Civilian</button>
            </div>
          ) : (
            <>
              <div className="px-3.5 py-2.5 bg-app-card border-b border-border-base shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[16px] font-bold">{selCiv.firstName} {selCiv.lastName}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      DOB: {selCiv.dob} · {selCiv.gender} · {selCiv.ethnicity}
                    </div>
                    <div className="flex gap-1 mt-1.5">
                      {civWarrants.length > 0 && <span className={BADGE.red}>ACTIVE WARRANT</span>}
                      {selCiv.dlStatus === 'SUSPENDED' && <span className={BADGE.orange}>DL SUSPENDED</span>}
                      {selCiv.flags?.filter(f => f !== 'WARRANT').map(f => (
                        <span key={f} className={f === 'VIOLENT' ? BADGE.fire : BADGE.orange}>{f}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button className={sm(S_BTN_SECONDARY)} onClick={() => setShowAddVeh(true)}>+ Vehicle</button>
                    <button className={sm(S_BTN_DANGER)} onClick={() => deleteCiv(selCiv.id)}>Delete</button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border-base shrink-0 bg-app-card">
                {['INFO','VEHICLES','FLAGS'].map(t => (
                  <button key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.5px] border-none cursor-pointer transition-colors border-b-2 font-ui ${
                      tab === t
                        ? 'bg-app-selected text-cad-text border-b-sky-500'
                        : 'bg-transparent text-cad-muted border-b-transparent hover:text-cad-text'
                    }`}>
                    {t}
                    {t === 'VEHICLES' && civVehicles.length > 0 && (
                      <span className="ml-1 text-[9px] font-mono text-slate-500">({civVehicles.length})</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-3.5">
                {tab === 'INFO' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className={S_CARD}>
                      <div className="text-[9px] text-cad-muted uppercase tracking-[0.7px] mb-2">Personal</div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Height</span><span className={S_DETAIL_VALUE}>{selCiv.height}</span></div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Weight</span><span className={S_DETAIL_VALUE}>{selCiv.weight}</span></div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Hair</span><span className={S_DETAIL_VALUE}>{selCiv.hair}</span></div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Eyes</span><span className={S_DETAIL_VALUE}>{selCiv.eyes}</span></div>
                    </div>
                    <div className={S_CARD}>
                      <div className="text-[9px] text-cad-muted uppercase tracking-[0.7px] mb-2">Identification</div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>SSN</span><span className={S_DETAIL_VALUE_MONO}>{selCiv.ssn}</span></div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Phone</span><span className={S_DETAIL_VALUE_MONO}>{selCiv.phone}</span></div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Address</span><span className={S_DETAIL_VALUE}>{selCiv.address}</span></div>
                    </div>
                    <div className={`${S_CARD} col-span-2`}>
                      <div className="text-[9px] text-cad-muted uppercase tracking-[0.7px] mb-2">Driver License</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>DL Number</span><span className={S_DETAIL_VALUE_MONO}>{selCiv.dlNumber}</span></div>
                        <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Class</span><span className={S_DETAIL_VALUE}>{selCiv.dlClass}</span></div>
                        <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Status</span>
                          <span className={selCiv.dlStatus === 'ACTIVE' ? BADGE.green : BADGE.red}>{selCiv.dlStatus}</span>
                        </div>
                        <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Expiry</span><span className={S_DETAIL_VALUE_MONO}>{selCiv.dlExpiry}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'VEHICLES' && (
                  <div className="flex flex-col gap-2">
                    {civVehicles.length === 0 ? (
                      <div className="text-center p-6 text-cad-muted text-[11px]">
                        No vehicles registered
                        <br />
                        <button className={`${S_BTN_PRIMARY} mt-2.5`} onClick={() => setShowAddVeh(true)}>Add Vehicle</button>
                      </div>
                    ) : civVehicles.map(v => (
                      <div key={v.id} className={S_CARD}>
                        <div className="flex gap-2 mb-1 items-center">
                          <span className={`${S_DATA} text-[14px] font-bold`}>{v.plate}</span>
                          <span className={v.regStatus === 'VALID' ? BADGE.green : BADGE.red}>{v.regStatus}</span>
                          {v.stolen && <span className={BADGE.red}>STOLEN</span>}
                        </div>
                        <div className="text-[12px]">{v.year} {v.make} {v.model} · {v.color}</div>
                        <div className="text-[10px] text-cad-muted font-mono mt-0.5">
                          Reg. Expires: {v.regExpiry}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'FLAGS' && (
                  <div className={S_CARD}>
                    <div className="text-[9px] text-cad-muted uppercase tracking-[0.7px] mb-2">System Flags</div>
                    {selCiv.flags?.length === 0 && civWarrants.length === 0 ? (
                      <div className="text-[11px] text-cad-muted">No flags on record</div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {civWarrants.length > 0 && <span className={`${BADGE.red} inline-flex w-fit`}>ACTIVE WARRANT ({civWarrants.length})</span>}
                        {selCiv.flags?.map(f => (
                          <span key={f} className={`${f === 'VIOLENT' ? BADGE.fire : f === 'WARRANT' ? BADGE.red : BADGE.orange} inline-flex w-fit`}>{f}</span>
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
          <div className={`${S_MODAL} max-w-[600px]`}>
            <div className={S_MODAL_HEADER}>
              <div className={S_MODAL_TITLE}>Create Civilian Record</div>
              <button className={sm(S_BTN_GHOST)} onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <div className={S_MODAL_BODY}>
              <div className="grid grid-cols-2 gap-3">
                <div className={S_FIELD}><label className={S_LABEL}>First Name *</label><input className={S_INPUT} value={form.firstName} onChange={e => setForm(p => ({...p, firstName: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Last Name *</label><input className={S_INPUT} value={form.lastName} onChange={e => setForm(p => ({...p, lastName: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Date of Birth</label><input className={S_INPUT} type="date" value={form.dob} onChange={e => setForm(p => ({...p, dob: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Gender</label><select className={S_SELECT} value={form.gender} onChange={e => setForm(p => ({...p, gender: e.target.value}))}><option>Male</option><option>Female</option><option>Non-Binary</option></select></div>
                <div className={S_FIELD}><label className={S_LABEL}>Ethnicity</label><select className={S_SELECT} value={form.ethnicity} onChange={e => setForm(p => ({...p, ethnicity: e.target.value}))}><option>White</option><option>Black</option><option>Hispanic</option><option>Asian</option><option>Other</option></select></div>
                <div className={S_FIELD}><label className={S_LABEL}>Hair Color</label><input className={S_INPUT} value={form.hair} onChange={e => setForm(p => ({...p, hair: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Eye Color</label><input className={S_INPUT} value={form.eyes} onChange={e => setForm(p => ({...p, eyes: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Height</label><input className={S_INPUT} value={form.height} onChange={e => setForm(p => ({...p, height: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Phone</label><input className={S_INPUT} value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>SSN</label><input className={S_INPUT} placeholder="XXX-XX-XXXX" value={form.ssn} onChange={e => setForm(p => ({...p, ssn: e.target.value}))} /></div>
              </div>
              <div className={S_FIELD}><label className={S_LABEL}>Home Address</label><input className={S_INPUT} value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className={S_FIELD}><label className={S_LABEL}>DL Number</label><input className={S_INPUT} value={form.dlNumber} onChange={e => setForm(p => ({...p, dlNumber: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>DL Status</label><select className={S_SELECT} value={form.dlStatus} onChange={e => setForm(p => ({...p, dlStatus: e.target.value}))}><option value="ACTIVE">ACTIVE</option><option value="SUSPENDED">SUSPENDED</option><option value="REVOKED">REVOKED</option><option value="EXPIRED">EXPIRED</option></select></div>
              </div>
            </div>
            <div className={S_MODAL_FOOTER}>
              <button className={S_BTN_SECONDARY} onClick={() => setShowCreate(false)}>Cancel</button>
              <button className={S_BTN_PRIMARY} onClick={createCivilian} disabled={!form.firstName || !form.lastName}>Create Record</button>
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
              <div className="grid grid-cols-2 gap-3">
                <div className={S_FIELD}><label className={S_LABEL}>License Plate *</label><input className={S_INPUT} placeholder="e.g. ABC-1234" value={vehForm.plate} onChange={e => setVehForm(p => ({...p, plate: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Year</label><input className={S_INPUT} placeholder="2023" value={vehForm.year} onChange={e => setVehForm(p => ({...p, year: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Make *</label><input className={S_INPUT} placeholder="Ford" value={vehForm.make} onChange={e => setVehForm(p => ({...p, make: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Model</label><input className={S_INPUT} placeholder="F-150" value={vehForm.model} onChange={e => setVehForm(p => ({...p, model: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Color</label><input className={S_INPUT} value={vehForm.color} onChange={e => setVehForm(p => ({...p, color: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Reg. Status</label><select className={S_SELECT} value={vehForm.regStatus} onChange={e => setVehForm(p => ({...p, regStatus: e.target.value}))}><option value="VALID">VALID</option><option value="EXPIRED">EXPIRED</option><option value="SUSPENDED">SUSPENDED</option></select></div>
              </div>
              <div className={S_FIELD}><label className={S_LABEL}>Reg. Expiry Date</label><input className={S_INPUT} type="date" value={vehForm.regExpiry} onChange={e => setVehForm(p => ({...p, regExpiry: e.target.value}))} /></div>
            </div>
            <div className={S_MODAL_FOOTER}>
              <button className={S_BTN_SECONDARY} onClick={() => setShowAddVeh(false)}>Cancel</button>
              <button className={S_BTN_PRIMARY} onClick={addVehicle} disabled={!vehForm.plate || !vehForm.make}>Register Vehicle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
