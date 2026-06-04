import { useState, useMemo } from 'react';
import { useCAD } from '../../store/cadStore';
import { useToast } from '../../contexts/ToastContext';
import {
  MdDirectionsCar, MdAdd, MdClose, MdPerson, MdLock, MdErrorOutline,
} from 'react-icons/md';
import {
  PortalPage, PortalHeader, PortalCard, Field, CivFormField,
  PORTAL_INPUT, PORTAL_LABEL,
} from './PortalKit';
import { BADGE } from '../../constants/styles';
import { CIVILIAN_FORMS_DEFAULT } from '../../data/civilianFormsDefaults';
import { useActiveCivilian, CivilianSwitcher } from '../../contexts/CivilianContext';

const defaultExpiry = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
};

/* ── Confirmation modal (same pattern as MyLicenses) ── */
function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center anim-overlay-in"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="w-full sm:max-w-[440px] rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-5 anim-sheet-in sm:anim-modal-in"
        style={{ background: '#0c1929', border: '1px solid rgba(251,146,60,0.3)' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <MdErrorOutline size={22} className="text-amber-400" />
          </div>
          <div>
            <div className="text-[15px] font-bold text-white mb-1">Register this vehicle?</div>
            <div className="text-[12.5px] text-slate-400 leading-relaxed">
              Once submitted, <span className="text-white font-semibold">vehicle details cannot be edited</span>. Only server administrators can make changes after registration.
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="press flex-1 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer border border-border-base bg-white/[0.04] text-slate-400 hover:text-slate-200 transition-colors">
            Go Back
          </button>
          <button type="button" onClick={onConfirm}
            className="press flex-1 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-amber-500 hover:bg-amber-400 text-black transition-colors">
            Yes, Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyVehicles() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const { civilians, vehicles } = state;
  const { myChars, activeChar } = useActiveCivilian();

  const extraFields = state.civilianForms?.vehicleRegistration?.fields || CIVILIAN_FORMS_DEFAULT.vehicleRegistration.fields;

  const myVehicles  = useMemo(() => vehicles.filter(v => v.ownerId === activeChar?.id), [vehicles, activeChar]);

  const ownerName = (id) => {
    const c = civilians.find(x => x.id === id);
    return c ? `${c.firstName} ${c.lastName}` : 'Unknown';
  };

  const EMPTY_FORM = { ownerId: '', plate: '', make: '', model: '', year: '', color: '', regExpiry: defaultExpiry() };

  const [showForm,        setShowForm]        = useState(false);
  const [form,            setForm]            = useState(EMPTY_FORM);
  const [templateData,    setTemplateData]    = useState({});
  const [confirming,      setConfirming]      = useState(false);

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const openNew = () => {
    setForm({ ...EMPTY_FORM, ownerId: activeChar ? String(activeChar.id) : '' });
    setTemplateData({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setTemplateData({});
    setConfirming(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirming(true);
  };

  const handleConfirm = () => {
    const { ownerId, regExpiry, ...rest } = form;
    dispatch({
      type: 'ADD_VEHICLE',
      payload: { ...rest, regExpiry, regStatus: 'VALID', ownerId: Number(ownerId) },
    });
    dispatch({
      type: 'ADD_RECORD',
      payload: {
        type: 'Vehicle Registration',
        civilianId: Number(ownerId),
        isVehicleReg: true,
        status: 'Approved',
        formData: { plate: form.plate, make: form.make, model: form.model, year: form.year, color: form.color, regExpiry, ...templateData },
      },
    });
    toast.success(`${form.plate} registered.`, { title: 'Vehicle Registered' });
    closeForm();
  };

  return (
    <PortalPage>
      {confirming && <ConfirmModal onConfirm={handleConfirm} onCancel={() => setConfirming(false)} />}

      <PortalHeader
        icon={MdDirectionsCar}
        title="My Vehicles"
        subtitle="Register vehicles to your active character and view their registration status."
        accent="brand"
        action={
          !showForm && myChars.length > 0 && (
            <button
              className="press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-bold cursor-pointer bg-brand hover:bg-brand/80 text-white transition-colors border-0"
              onClick={openNew}>
              <MdAdd size={18} /> Register Vehicle
            </button>
          )
        }
      />

      <CivilianSwitcher />

      {showForm && (
        <PortalCard accent="brand" style={{ marginBottom: 22 }}>
          <div className="flex justify-between items-center mb-[18px]">
            <div className="text-[15px] font-extrabold text-slate-100">Register New Vehicle</div>
            <button
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold cursor-pointer border border-border-base bg-white/[0.04] text-slate-400 hover:text-slate-200 transition-colors"
              onClick={closeForm}>
              <MdClose size={16} /> Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Standard vehicle fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className={PORTAL_LABEL}>Registered Owner</label>
                <div className={`${PORTAL_INPUT} flex items-center gap-2 !cursor-default`}>
                  <MdPerson size={16} className="text-brand-bright shrink-0" />
                  <span className="font-semibold text-slate-200">{activeChar ? `${activeChar.firstName} ${activeChar.lastName}` : '—'}</span>
                  <span className="text-[10px] text-slate-500 ml-auto">Active character</span>
                </div>
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
                <div className="relative w-full overflow-hidden rounded-lg border border-border-base bg-app-input focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/20 transition-all" style={{ height: 42 }}>
                  <input className="absolute inset-0 w-full h-full bg-transparent px-3.5 text-sm text-cad-text outline-none" type="date" value={form.regExpiry} onChange={e => setField('regExpiry', e.target.value)} style={{ colorScheme: 'dark' }} />
                </div>
              </div>
            </div>

            {/* Admin-configured extra fields */}
            {extraFields.length > 0 && (
              <div className="mt-5 pt-5 border-t border-border-faint">
                <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-3 flex items-center gap-2">
                  🚗 <span>Additional Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {extraFields.map(f => (
                    <CivFormField key={f.key} field={f}
                      value={templateData[f.key]}
                      onChange={v => setTemplateData(p => ({ ...p, [f.key]: v }))} />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-[18px] flex gap-3 items-center">
              <button type="submit"
                className="press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-brand hover:bg-brand/80 text-white transition-colors border-0">
                <MdDirectionsCar size={15} /> Register Vehicle
              </button>
              <span className="text-[10.5px] text-slate-600 flex items-center gap-1">
                <MdLock size={11} /> Cannot be edited after submission
              </span>
            </div>
          </form>
        </PortalCard>
      )}

      {myVehicles.length === 0 && !showForm ? (
        <PortalCard accent="brand">
          <div className="text-center p-12">
            <MdDirectionsCar size={48} color="rgba(61,130,240,0.4)" />
            <div className="text-[15px] font-bold text-slate-100 mt-3">No vehicles registered</div>
            <div className="text-sm text-slate-400 mt-1.5">
              {myChars.length === 0
                ? 'Register a character first, then add vehicles to it.'
                : 'Register your first vehicle to get started.'}
            </div>
            {myChars.length > 0 && (
              <button
                className="press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-brand hover:bg-brand/80 text-white transition-colors border-0 mt-[18px]"
                onClick={openNew}>
                <MdAdd size={18} /> Register Vehicle
              </button>
            )}
          </div>
        </PortalCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 14 }}>
          {myVehicles.map(v => (
            <PortalCard key={v.id} accent="brand">
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
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MdPerson size={15} color="#3d82f0" />
                  <span>Registered to <span className="text-slate-200 font-semibold">{ownerName(v.ownerId)}</span></span>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-slate-600">
                  <MdLock size={10} /> Filed
                </span>
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </PortalPage>
  );
}
