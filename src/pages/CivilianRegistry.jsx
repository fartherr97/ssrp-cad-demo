import { useState } from 'react';
import Select from '../components/ui/Select';
import { useCAD } from '../store/cadStore';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { FlagRow, FlagManager } from '../components/CivilianFlags';
import {
  BADGE, S_PAGE, S_PANEL_HEADER, S_PANEL_TITLE,
  S_CARD, S_BTN_PRIMARY, S_BTN_SECONDARY,
  S_BTN_DANGER, S_BTN_GHOST, S_INPUT, S_SELECT, S_LABEL, S_FIELD, S_DATA,
  S_OVERLAY, S_MODAL, S_MODAL_HEADER, S_MODAL_TITLE, S_MODAL_BODY, S_MODAL_FOOTER,
  S_DETAIL_ROW, S_DETAIL_LABEL, S_DETAIL_VALUE, S_DETAIL_VALUE_MONO,
  xs, sm,
} from '../constants/styles';
import { MdArrowBack, MdPerson, MdCameraAlt, MdDelete } from 'react-icons/md';
import { ageFromDob } from '../utils/age';
import { resizeImage } from '../utils/image';

export default function CivilianRegistry() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const confirm = useConfirm();
  const { civilians, vehicles, warrants } = state;

  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showAddVeh, setShowAddVeh] = useState(false);
  const [tab, setTab] = useState('INFO');
  const [form, setForm] = useState({
    firstName: '', lastName: '', dob: '', gender: 'Male', ethnicity: 'White',
    height: "5'10\"", weight: '180 lbs', hair: 'Brown', eyes: 'Brown',
    ssn: '', phone: '', address: '', dlNumber: '', dlClass: 'Class C', dlStatus: 'ACTIVE', dlExpiry: '', profilePhoto: '',
  });
  const [vehForm, setVehForm] = useState({ plate: '', make: '', model: '', year: '', color: '', regStatus: 'VALID', regExpiry: '' });
  const [createError, setCreateError] = useState('');
  const [vehError, setVehError] = useState('');

  const fieldLabel = f => ({ ssn: 'SSN', dlNumber: 'DL Number', phone: 'Phone', fullName: 'Full Name' }[f] || f);

  const selCiv = selected != null ? civilians.find(c => c.id === selected) : null;
  const civVehicles = selCiv ? vehicles.filter(v => selCiv.vehicles?.includes(v.id)) : [];
  const civWarrants = selCiv ? warrants.filter(w => w.civilianId === selCiv.id && w.status === 'ACTIVE') : [];

  const filtered = civilians.filter(c =>
    search ? `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) : true
  );

  const createCivilian = () => {
    if (!form.firstName || !form.lastName) {
      setCreateError('First and last name are required.');
      return;
    }
    const uniqueFields = state.uniqueIdentifiers?.civilian || [];
    for (const field of uniqueFields) {
      if (field === 'fullName') {
        const wanted = `${form.firstName} ${form.lastName}`.trim().toLowerCase();
        const conflict = civilians.find(c => `${c.firstName} ${c.lastName}`.trim().toLowerCase() === wanted);
        if (conflict) {
          setCreateError(`The name "${form.firstName} ${form.lastName}" is already in use`);
          return;
        }
        continue;
      }
      if (form[field]) {
        const conflict = civilians.find(c => c[field] === form[field]);
        if (conflict) {
          setCreateError(`${fieldLabel(field)} "${form[field]}" is already in use by ${conflict.firstName} ${conflict.lastName}`);
          return;
        }
      }
    }
    setCreateError('');
    dispatch({ type: 'ADD_CIVILIAN', payload: { ...form } });
    toast.success(`${form.firstName} ${form.lastName} added`, { title: 'Civilian created' });
    setForm({ firstName:'',lastName:'',dob:'',gender:'Male',ethnicity:'White',height:"5'10\"",weight:'180 lbs',hair:'Brown',eyes:'Brown',ssn:'',phone:'',address:'',dlNumber:'',dlClass:'Class C',dlStatus:'ACTIVE',dlExpiry:'',profilePhoto:'' });
    setShowCreate(false);
  };

  const addVehicle = () => {
    if (!vehForm.plate || !vehForm.make || !selCiv) {
      setVehError('License plate and make are required.');
      return;
    }
    const uniqueFields = state.uniqueIdentifiers?.vehicle || [];
    for (const field of uniqueFields) {
      if (vehForm[field]) {
        const conflict = vehicles.find(v => v[field] === vehForm[field]);
        if (conflict) {
          const owner = civilians.find(c => c.id === conflict.ownerId);
          setVehError(`${fieldLabel(field)} "${vehForm[field]}" is already registered${owner ? ` to ${owner.firstName} ${owner.lastName}` : ''}`);
          return;
        }
      }
    }
    setVehError('');
    dispatch({ type: 'ADD_VEHICLE', payload: { ...vehForm, ownerId: selCiv.id } });
    toast.success(`${vehForm.plate} registered`, { title: 'Vehicle added' });
    setVehForm({ plate:'',make:'',model:'',year:'',color:'',regStatus:'VALID',regExpiry:'' });
    setShowAddVeh(false);
  };

  const deleteCiv = async (id) => {
    if (!(await confirm({
      title: 'Delete civilian?',
      message: 'This permanently removes the record and all linked data.',
      confirmLabel: 'Delete',
      danger: true,
    }))) return;
    dispatch({ type: 'DELETE_CIVILIAN', payload: id });
    toast.success('Civilian record deleted');
    setSelected(null);
  };

  return (
    <div className={`${S_PAGE} !p-0 overflow-hidden !gap-0`}>
      <div className="mob-two-pane grid overflow-hidden flex-1 min-h-0 p-3 md:p-5 gap-4 lg:gap-5" style={{ gridTemplateColumns: '280px minmax(0, 1fr)' }}>
        {/* LEFT: Civilian List */}
        <div className={`mob-list-panel${selected != null ? ' mob-gone' : ''} flex flex-col min-h-0 bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm shadow-lg shadow-black/20`}>
          <div className={S_PANEL_HEADER}>
            <div className={S_PANEL_TITLE}>Civilian Registry</div>
            <button className={`press-sm ${xs(S_BTN_PRIMARY)} ml-auto`} onClick={() => setShowCreate(true)}>+ New</button>
          </div>
          <div className="px-3 py-2.5 border-b border-border-faint shrink-0">
            <input className={S_INPUT} placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-[10px] font-bold uppercase text-slate-600 px-1.5 pt-1 pb-1.5 tracking-[0.6px]">
              {filtered.length} Records
            </div>
            {filtered.map(c => {
              const hasWarrant = warrants.some(w => w.civilianId === c.id && w.status === 'ACTIVE');
              return (
                <button
                  type="button"
                  key={c.id}
                  className={`my-1 px-3 py-2.5 rounded-lg cursor-pointer border transition-all text-left w-full ${
                    selected === c.id
                      ? 'border-brand/40 bg-brand/15'
                      : 'border-border-faint bg-white/[0.02] hover:bg-white/[0.05] hover:border-border-base'
                  }`}
                  onClick={() => { setSelected(c.id); setTab('INFO'); }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="font-semibold text-[12.5px] text-white flex-1">{c.firstName} {c.lastName}</div>
                    {hasWarrant && <span className={`${BADGE.red} text-[8px]`}>WARRANT</span>}
                  </div>
                  <div className={`${S_DATA} text-[10px]`}>DOB: {c.dob} · {c.gender}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <FlagRow flags={c.flags || []} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Detail */}
        <div className={`mob-detail-panel${selected == null ? ' mob-gone' : ''} flex flex-col min-h-0 bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm shadow-lg shadow-black/20`}>
          <button className="mob-back-btn !rounded-none" onClick={() => setSelected(null)}>
            <MdArrowBack size={14} /> Back to registry
          </button>
          {!selCiv ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-cad-muted p-6">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.2">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              <div className="text-center">
                <div className="text-[12px] font-medium text-slate-500 mb-0.5">No civilian selected</div>
                <div className="text-[10px] text-cad-muted">Select a record or create a new civilian</div>
              </div>
              <button className={`press ${S_BTN_PRIMARY}`} onClick={() => setShowCreate(true)}>Create New Civilian</button>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-border-faint shrink-0">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="text-[18px] font-extrabold text-white tracking-[-0.2px]">{selCiv.firstName} {selCiv.lastName}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      DOB: {selCiv.dob}{ageFromDob(selCiv.dob) ? ` (${ageFromDob(selCiv.dob)})` : ''} · {selCiv.gender} · {selCiv.ethnicity}
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap items-center">
                      {civWarrants.length > 0 && <span className={BADGE.red}>ACTIVE WARRANT</span>}
                      {selCiv.dlStatus === 'SUSPENDED' && <span className={BADGE.orange}>DL SUSPENDED</span>}
                      <FlagRow flags={selCiv.flags || []} />
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <button className={`press-sm ${sm(S_BTN_SECONDARY)}`} onClick={() => setShowAddVeh(true)}>+ Vehicle</button>
                    <button className={`press-sm ${sm(S_BTN_DANGER)}`} onClick={() => deleteCiv(selCiv.id)}>Delete</button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-0.5 px-3 pt-2 border-b border-border-faint shrink-0">
                {['INFO','VEHICLES','FLAGS'].map(t => {
                  const on = tab === t;
                  return (
                    <button key={t}
                      onClick={() => setTab(t)}
                      className={`relative px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.4px] whitespace-nowrap cursor-pointer transition-colors ${
                        on ? 'text-brand-bright' : 'text-slate-500 hover:text-slate-300'
                      }`}>
                      {t}
                      {t === 'VEHICLES' && civVehicles.length > 0 && (
                        <span className="ml-1 text-[9px] font-mono text-slate-500">({civVehicles.length})</span>
                      )}
                      {on && <span className="absolute -bottom-[2px] left-2 right-2 h-[3px] rounded-full bg-brand" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {tab === 'INFO' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className={S_CARD}>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.7px] mb-2">Personal</div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Height</span><span className={S_DETAIL_VALUE}>{selCiv.height}</span></div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Weight</span><span className={S_DETAIL_VALUE}>{selCiv.weight}</span></div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Hair</span><span className={S_DETAIL_VALUE}>{selCiv.hair}</span></div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Eyes</span><span className={S_DETAIL_VALUE}>{selCiv.eyes}</span></div>
                    </div>
                    <div className={S_CARD}>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.7px] mb-2">Identification</div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>SSN</span><span className={S_DETAIL_VALUE_MONO}>{selCiv.ssn}</span></div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Phone</span><span className={S_DETAIL_VALUE_MONO}>{selCiv.phone}</span></div>
                      <div className={S_DETAIL_ROW}><span className={S_DETAIL_LABEL}>Address</span><span className={S_DETAIL_VALUE}>{selCiv.address}</span></div>
                    </div>
                    <div className={`${S_CARD} col-span-2`}>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.7px] mb-2">Driver License</div>
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
                        <button className={`press ${S_BTN_PRIMARY} mt-2.5`} onClick={() => setShowAddVeh(true)}>Add Vehicle</button>
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
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.7px] mb-3">Civilian Flags</div>
                    <FlagManager civilianId={selCiv.id} flags={selCiv.flags || []} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Civilian Modal */}
      {showCreate && (
        <div className={`${S_OVERLAY} anim-overlay-in`} onClick={e => e.target === e.currentTarget && (setShowCreate(false), setCreateError(''))}>
          <div className={`${S_MODAL} max-w-[600px]`}>
            <div className={S_MODAL_HEADER}>
              <div className={S_MODAL_TITLE}>Create Civilian Record</div>
              <button className={sm(S_BTN_GHOST)} onClick={() => { setShowCreate(false); setCreateError(''); }}>✕</button>
            </div>
            <div className={S_MODAL_BODY}>
              {/* Profile photo (ID / driver-license headshot) */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 rounded-lg overflow-hidden bg-app-elevated border border-border-base flex items-center justify-center shrink-0">
                  {form.profilePhoto
                    ? <img src={form.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    : <MdPerson size={28} className="text-slate-700" />}
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <label className={S_LABEL} style={{ marginBottom: 0 }}>Profile Photo</label>
                  <div className="flex gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-white/[0.06] hover:bg-white/[0.1] border border-transparent text-slate-200 transition-all">
                      <MdCameraAlt size={14} /> {form.profilePhoto ? 'Replace' : 'Upload Photo'}
                      <input type="file" accept="image/*" className="hidden"
                        onChange={async e => { const f = e.target.files?.[0]; if (f) { const url = await resizeImage(f); setForm(p => ({ ...p, profilePhoto: url })); } e.target.value = ''; }} />
                    </label>
                    {form.profilePhoto && (
                      <button type="button" onClick={() => setForm(p => ({ ...p, profilePhoto: '' }))}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-transparent transition-all cursor-pointer">
                        <MdDelete size={14} /> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={S_FIELD}><label className={S_LABEL}>First Name *</label><input className={S_INPUT} value={form.firstName} onChange={e => setForm(p => ({...p, firstName: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Last Name *</label><input className={S_INPUT} value={form.lastName} onChange={e => setForm(p => ({...p, lastName: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Date of Birth</label><div className="relative w-full overflow-hidden rounded-lg border border-border-base bg-app-input focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/20 transition-all" style={{ height: 42 }}><input className="absolute inset-0 w-full h-full bg-transparent px-3.5 text-sm text-cad-text outline-none" type="date" value={form.dob} onChange={e => setForm(p => ({...p, dob: e.target.value}))} style={{ colorScheme: 'dark' }} /></div></div>
                <div className={S_FIELD}><label className={S_LABEL}>Age</label><div className={`${S_INPUT} flex items-center justify-between`} style={{ opacity: 0.85 }}><span className={ageFromDob(form.dob) ? '' : 'text-slate-600'}>{ageFromDob(form.dob) || 'Auto from DOB'}</span><span className="text-[9px] font-bold uppercase tracking-[0.5px] text-slate-600">Auto</span></div></div>
                <div className={S_FIELD}><label className={S_LABEL}>Gender</label><Select className={S_SELECT} value={form.gender} onChange={e => setForm(p => ({...p, gender: e.target.value}))}><option>Male</option><option>Female</option><option>Non-Binary</option></Select></div>
                <div className={S_FIELD}><label className={S_LABEL}>Ethnicity</label><Select className={S_SELECT} value={form.ethnicity} onChange={e => setForm(p => ({...p, ethnicity: e.target.value}))}><option>White</option><option>Black</option><option>Hispanic</option><option>Asian</option><option>Other</option></Select></div>
                <div className={S_FIELD}><label className={S_LABEL}>Hair Color</label><input className={S_INPUT} value={form.hair} onChange={e => setForm(p => ({...p, hair: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Eye Color</label><input className={S_INPUT} value={form.eyes} onChange={e => setForm(p => ({...p, eyes: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Height</label><input className={S_INPUT} value={form.height} onChange={e => setForm(p => ({...p, height: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Phone</label><input className={S_INPUT} value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>SSN</label><input className={S_INPUT} placeholder="XXX-XX-XXXX" value={form.ssn} onChange={e => setForm(p => ({...p, ssn: e.target.value}))} /></div>
              </div>
              <div className={S_FIELD}><label className={S_LABEL}>Home Address</label><input className={S_INPUT} value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={S_FIELD}><label className={S_LABEL}>DL Number</label><input className={S_INPUT} value={form.dlNumber} onChange={e => setForm(p => ({...p, dlNumber: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>DL Status</label><Select className={S_SELECT} value={form.dlStatus} onChange={e => setForm(p => ({...p, dlStatus: e.target.value}))}><option value="ACTIVE">ACTIVE</option><option value="SUSPENDED">SUSPENDED</option><option value="REVOKED">REVOKED</option><option value="EXPIRED">EXPIRED</option></Select></div>
              </div>
            </div>
            {createError && (
              <div className="px-5 pb-3">
                <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{createError}</div>
              </div>
            )}
            <div className={S_MODAL_FOOTER}>
              <button className={S_BTN_SECONDARY} onClick={() => { setShowCreate(false); setCreateError(''); }}>Cancel</button>
              <button className={`press ${S_BTN_PRIMARY}`} onClick={createCivilian} disabled={!form.firstName || !form.lastName}>Create Record</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddVeh && selCiv && (
        <div className={`${S_OVERLAY} anim-overlay-in`} onClick={e => e.target === e.currentTarget && (setShowAddVeh(false), setVehError(''))}>
          <div className={S_MODAL}>
            <div className={S_MODAL_HEADER}>
              <div className={S_MODAL_TITLE}>Register Vehicle, {selCiv.firstName} {selCiv.lastName}</div>
              <button className={sm(S_BTN_GHOST)} onClick={() => { setShowAddVeh(false); setVehError(''); }}>✕</button>
            </div>
            <div className={S_MODAL_BODY}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={S_FIELD}><label className={S_LABEL}>License Plate *</label><input className={S_INPUT} placeholder="e.g. ABC-1234" value={vehForm.plate} onChange={e => setVehForm(p => ({...p, plate: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Year</label><input className={S_INPUT} placeholder="2023" value={vehForm.year} onChange={e => setVehForm(p => ({...p, year: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Make *</label><input className={S_INPUT} placeholder="Ford" value={vehForm.make} onChange={e => setVehForm(p => ({...p, make: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Model</label><input className={S_INPUT} placeholder="F-150" value={vehForm.model} onChange={e => setVehForm(p => ({...p, model: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Color</label><input className={S_INPUT} value={vehForm.color} onChange={e => setVehForm(p => ({...p, color: e.target.value}))} /></div>
                <div className={S_FIELD}><label className={S_LABEL}>Reg. Status</label><Select className={S_SELECT} value={vehForm.regStatus} onChange={e => setVehForm(p => ({...p, regStatus: e.target.value}))}><option value="VALID">VALID</option><option value="EXPIRED">EXPIRED</option><option value="SUSPENDED">SUSPENDED</option></Select></div>
              </div>
              <div className={S_FIELD}><label className={S_LABEL}>Reg. Expiry Date</label><div className="relative w-full overflow-hidden rounded-lg border border-border-base bg-app-input focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/20 transition-all" style={{ height: 42 }}><input className="absolute inset-0 w-full h-full bg-transparent px-3.5 text-sm text-cad-text outline-none" type="date" value={vehForm.regExpiry} onChange={e => setVehForm(p => ({...p, regExpiry: e.target.value}))} style={{ colorScheme: 'dark' }} /></div></div>
            </div>
            {vehError && (
              <div className="px-5 pb-3">
                <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{vehError}</div>
              </div>
            )}
            <div className={S_MODAL_FOOTER}>
              <button className={S_BTN_SECONDARY} onClick={() => { setShowAddVeh(false); setVehError(''); }}>Cancel</button>
              <button className={`press ${S_BTN_PRIMARY}`} onClick={addVehicle} disabled={!vehForm.plate || !vehForm.make}>Register Vehicle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
