import { useState, useMemo } from 'react';
import { useCAD } from '../../store/cadStore';
import { MdDirectionsCar, MdAdd, MdClose, MdPerson } from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard, Field, PORTAL_INPUT, PORTAL_LABEL } from './PortalKit';

const ACCENT = '#9090cc';

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
        accent={ACCENT}
        action={
          !showForm && myChars.length > 0 && (
            <button className="n-btn n-btn-primary" onClick={openNew}>
              <MdAdd size={18} style={{ marginRight: 6 }} /> Register Vehicle
            </button>
          )
        }
      />

      {showForm && (
        <PortalCard accent={ACCENT} style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#e6eef6' }}>Register New Vehicle</div>
            <button className="n-btn n-btn-secondary" onClick={closeForm}>
              <MdClose size={16} style={{ marginRight: 4 }} /> Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={PORTAL_LABEL}>Registered Owner</label>
                <select style={PORTAL_INPUT} value={form.ownerId} onChange={e => setField('ownerId', e.target.value)} required>
                  {myChars.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={PORTAL_LABEL}>License Plate</label>
                <input style={PORTAL_INPUT} type="text" value={form.plate} onChange={e => setField('plate', e.target.value.toUpperCase())} required />
              </div>
              <div>
                <label style={PORTAL_LABEL}>Make</label>
                <input style={PORTAL_INPUT} type="text" value={form.make} onChange={e => setField('make', e.target.value)} required />
              </div>
              <div>
                <label style={PORTAL_LABEL}>Model</label>
                <input style={PORTAL_INPUT} type="text" value={form.model} onChange={e => setField('model', e.target.value)} required />
              </div>
              <div>
                <label style={PORTAL_LABEL}>Year</label>
                <input style={PORTAL_INPUT} type="text" value={form.year} onChange={e => setField('year', e.target.value)} />
              </div>
              <div>
                <label style={PORTAL_LABEL}>Color</label>
                <input style={PORTAL_INPUT} type="text" value={form.color} onChange={e => setField('color', e.target.value)} />
              </div>
              <div>
                <label style={PORTAL_LABEL}>Registration Expiry</label>
                <input style={PORTAL_INPUT} type="date" value={form.regExpiry} onChange={e => setField('regExpiry', e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <button type="submit" className="n-btn n-btn-primary">Register Vehicle</button>
            </div>
          </form>
        </PortalCard>
      )}

      {myVehicles.length === 0 && !showForm ? (
        <PortalCard accent={ACCENT} style={{ textAlign: 'center', padding: 48 }}>
          <MdDirectionsCar size={48} color="rgba(144,144,204,0.4)" />
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e6eef6', marginTop: 12 }}>No vehicles registered</div>
          <div style={{ fontSize: 13, color: 'rgba(160,185,215,0.6)', marginTop: 6 }}>
            {myChars.length === 0
              ? 'Register a character first, then add vehicles to it.'
              : 'Register your first vehicle to get started.'}
          </div>
          {myChars.length > 0 && (
            <button className="n-btn n-btn-primary" style={{ marginTop: 18 }} onClick={openNew}>
              <MdAdd size={18} style={{ marginRight: 6 }} /> Register Vehicle
            </button>
          )}
        </PortalCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {myVehicles.map(v => (
            <PortalCard key={v.id} accent={ACCENT}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#e6eef6', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
                    {v.plate}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(180,200,230,0.7)', marginTop: 2 }}>
                    {v.year} {v.make} {v.model}
                  </div>
                </div>
                <span className={`n-badge ${v.regStatus === 'VALID' ? 'badge-green' : 'badge-red'}`}>
                  {v.regStatus}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Color" value={v.color} />
                <Field label="Reg. Expiry" value={v.regExpiry} />
              </div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(160,185,215,0.7)' }}>
                <MdPerson size={15} color={ACCENT} />
                <span>Registered to <span style={{ color: '#dce6f0', fontWeight: 600 }}>{ownerName(v.ownerId)}</span></span>
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </PortalPage>
  );
}
