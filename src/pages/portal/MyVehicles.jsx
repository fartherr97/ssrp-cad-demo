import { useState, useMemo } from 'react';
import { useCAD } from '../../store/cadStore';
import { MdDirectionsCar, MdAdd, MdClose, MdPerson } from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard, Field, PORTAL_INPUT, PORTAL_LABEL } from './PortalKit';
import { S_BTN_PRIMARY, S_BTN_SECONDARY, BADGE, sm } from '../../constants/styles';

const EMPTY_FORM = { ownerId: '', plate: '', make: '', model: '', year: '', color: '', regExpiry: '' };

export default function MyVehicles() {
  const { state, dispatch } = useCAD();
  const { civilians, vehicles } = state;

  const myChars = useMemo(() => civilians.filter(c => c.ownedByPlayer), [civilians]);
  const myCharIds = useMemo(() => myChars.map(c => c.id), [myChars]);
  const myVehicles = useMemo(() => vehicles.filter(v => myCharIds.includes(v.ownerId)), [vehicles, myCharIds]);
  const ownerName = (id) => {
    const c = civilians.find(x => x.id === id);
    return c ? `${c.firstName} ${c.lastName}` : 'Unknown';
  };

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const openNew = () => {
    setForm({ ...EMPTY_FORM, ownerId: myChars[0] ? String(myChars[0].id) : '' });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setForm(EMPTY_FORM); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { ownerId, regExpiry, ...rest } = form;
    dispatch({
      type: 'ADD_VEHICLE',
      payload: { ...rest, regExpiry, regStatus: 'VALID', ownerId: Number(ownerId) },
    });
    closeForm();
  };

  return (
    <PortalPage>
      <PortalHeader
        icon={MdDirectionsCar}
        title="My Vehicles"
        subtitle="Register vehicles to your characters and view their registration status."
        accent="#9090cc"
        action={
          !showForm && myChars.length > 0 && (
            <button className={S_BTN_PRIMARY} onClick={openNew}>
              <MdAdd size={18} /> Register Vehicle
            </button>
          )
        }
      />

      {showForm && (
        <PortalCard accent="#9090cc" style={{ marginBottom: 22 }}>
          <div className="flex justify-between items-center mb-[18px]">
            <div className="text-[15px] font-extrabold text-slate-100">Register New Vehicle</div>
            <button className={sm(S_BTN_SECONDARY)} onClick={closeForm}>
              <MdClose size={16} /> Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className={PORTAL_LABEL}>Registered Owner</label>
                <select className={PORTAL_INPUT} value={form.ownerId} onChange={e => setField('ownerId', e.target.value)} required>
                  {myChars.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={PORTAL_LABEL}>License Plate</label>
                <input className={PORTAL_INPUT} type="text" value={form.plate} onChange={e => setField('plate', e.target.value.toUpperCase())} required />
              </div>
              <div>
                <label className={PORTAL_LABEL}>Make</label>
                <input className={PORTAL_INPUT} type="text" value={form.make} onChange={e => setField('make', e.target.value)} required />
              </div>
              <div>
                <label className={PORTAL_LABEL}>Model</label>
                <input className={PORTAL_INPUT} type="text" value={form.model} onChange={e => setField('model', e.target.value)} required />
              </div>
              <div>
                <label className={PORTAL_LABEL}>Year</label>
                <input className={PORTAL_INPUT} type="text" value={form.year} onChange={e => setField('year', e.target.value)} />
              </div>
              <div>
                <label className={PORTAL_LABEL}>Color</label>
                <input className={PORTAL_INPUT} type="text" value={form.color} onChange={e => setField('color', e.target.value)} />
              </div>
              <div>
                <label className={PORTAL_LABEL}>Registration Expiry</label>
                <input className={PORTAL_INPUT} type="date" value={form.regExpiry} onChange={e => setField('regExpiry', e.target.value)} />
              </div>
            </div>
            <div className="mt-[18px]">
              <button type="submit" className={S_BTN_PRIMARY}>Register Vehicle</button>
            </div>
          </form>
        </PortalCard>
      )}

      {myVehicles.length === 0 && !showForm ? (
        <PortalCard accent="#9090cc">
          <div className="text-center p-12">
            <MdDirectionsCar size={48} color="rgba(144,144,204,0.4)" />
            <div className="text-[15px] font-bold text-slate-100 mt-3">No vehicles registered</div>
            <div className="text-sm text-slate-400 mt-1.5">
              {myChars.length === 0
                ? 'Register a character first, then add vehicles to it.'
                : 'Register your first vehicle to get started.'}
            </div>
            {myChars.length > 0 && (
              <button className={`${S_BTN_PRIMARY} mt-[18px]`} onClick={openNew}>
                <MdAdd size={18} /> Register Vehicle
              </button>
            )}
          </div>
        </PortalCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {myVehicles.map(v => (
            <PortalCard key={v.id} accent="#9090cc">
              <div className="flex justify-between items-start gap-2.5 mb-3.5">
                <div>
                  <div className="text-[22px] font-extrabold text-slate-100 font-mono tracking-[1px]">
                    {v.plate}
                  </div>
                  <div className="text-sm text-slate-400 mt-0.5">
                    {v.year} {v.make} {v.model}
                  </div>
                </div>
                <span className={v.regStatus === 'VALID' ? BADGE.green : BADGE.red}>
                  {v.regStatus}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Color" value={v.color} />
                <Field label="Reg. Expiry" value={v.regExpiry} />
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                <MdPerson size={15} color="#9090cc" />
                <span>Registered to <span className="text-slate-200 font-semibold">{ownerName(v.ownerId)}</span></span>
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </PortalPage>
  );
}
