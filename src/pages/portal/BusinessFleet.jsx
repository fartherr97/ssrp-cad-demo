import { useState, useMemo } from 'react';
import Select from '../../components/ui/Select';
import { useCAD } from '../../store/cadStore';
import { useActiveBusiness, BusinessSwitcher } from '../../contexts/BusinessContext';
import { useToast } from '../../contexts/ToastContext';
import {
  MdDirectionsCar, MdAdd, MdClose, MdStore, MdLock, MdErrorOutline,
  MdBadge, MdCalendarToday,
} from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard, Field, PORTAL_INPUT, PORTAL_LABEL } from './PortalKit';
import { S_BTN_PRIMARY, S_BTN_SECONDARY, sm, BADGE } from '../../constants/styles';

const VEHICLE_TYPES = [
  'Sedan', 'SUV', 'Truck', 'Pickup', 'Van', 'Box Truck',
  'Tow Truck', 'Flatbed', 'Rollback', 'Heavy Tow', 'Semi',
  'Motorcycle', 'Other',
];

const defaultExpiry = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
};

const EMPTY_FORM = {
  plate: '', type: 'Sedan', make: '', model: '', year: '', color: '', regExpiry: defaultExpiry(),
};

function ConfirmModal({ bizName, plate, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center anim-overlay-in"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="w-full sm:max-w-[440px] rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-5 anim-sheet-in sm:anim-modal-in"
        style={{ background: '#0c1929', border: '1px solid rgba(100,160,240,0.3)' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center shrink-0">
            <MdDirectionsCar size={22} className="text-brand-bright" />
          </div>
          <div>
            <div className="text-[15px] font-bold text-white mb-1">Register to {bizName}?</div>
            <div className="text-[12.5px] text-slate-400 leading-relaxed">
              Plate <span className="font-mono text-white font-bold">{plate}</span> will be registered under the business name.
              Details cannot be edited after filing * contact an admin for corrections.
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="press flex-1 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer border border-border-base bg-white/[0.04] text-slate-400 hover:text-slate-200 transition-colors">
            Go Back
          </button>
          <button type="button" onClick={onConfirm}
            className="press flex-1 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-brand hover:bg-brand/80 text-white transition-colors border-0">
            Yes, Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BusinessFleet() {
  const { state, dispatch } = useCAD();
  const { activeBiz } = useActiveBusiness();
  const toast = useToast();

  const bizVehicles = useMemo(
    () => state.vehicles.filter(v => v.businessOwnerId === activeBiz?.id),
    [state.vehicles, activeBiz?.id],
  );

  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [confirming, setConfirming] = useState(false);

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const openNew = () => {
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setConfirming(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirming(true);
  };

  const handleConfirm = () => {
    dispatch({
      type: 'ADD_VEHICLE',
      payload: {
        ...form,
        ownerId: null,
        businessOwnerId: activeBiz.id,
        regStatus: 'VALID',
      },
    });
    toast.success(`${form.plate} registered to ${activeBiz.name}.`, { title: 'Fleet Vehicle Registered' });
    closeForm();
  };

  if (!activeBiz) {
    return (
      <PortalPage>
        <PortalHeader icon={MdDirectionsCar} title="Business Fleet" subtitle="No active business." accent="cyan" />
        <PortalCard accent="cyan">
          <div className="text-center py-10 text-slate-500 text-[13px]">No business associated with your account.</div>
        </PortalCard>
      </PortalPage>
    );
  }

  return (
    <PortalPage>
      {confirming && (
        <ConfirmModal
          bizName={activeBiz.name}
          plate={form.plate}
          onConfirm={handleConfirm}
          onCancel={() => setConfirming(false)}
        />
      )}

      <PortalHeader
        icon={MdDirectionsCar}
        title="Business Fleet"
        subtitle={`Vehicles registered under ${activeBiz.name}.`}
        accent="cyan"
        action={
          !showForm && (
            <button className="press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-bold cursor-pointer border-0 transition-colors"
              style={{ background: '#44aacc22', border: '1px solid #44aacc55', color: '#44aacc' }}
              onClick={openNew}>
              <MdAdd size={18} /> Register Vehicle
            </button>
          )
        }
      />

      <BusinessSwitcher />

      {/* Business ID strip */}
      <div className="flex items-center gap-3 mb-5 px-4 py-2.5 rounded-xl border border-border-faint bg-app-card/40 text-[11px] text-slate-400">
        <MdStore size={15} className="shrink-0" style={{ color: '#44aacc' }} />
        <span className="font-bold text-slate-200">{activeBiz.name}</span>
        <span className="text-slate-600 mx-1">·</span>
        <span className="font-mono text-slate-500">EIN {activeBiz.ein}</span>
        <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: '#44aacc18', border: '1px solid #44aacc44', color: '#44aacc' }}>
          {bizVehicles.length} vehicle{bizVehicles.length !== 1 ? 's' : ''} on file
        </span>
      </div>

      {/* Registration form */}
      {showForm && (
        <PortalCard accent="cyan" style={{ marginBottom: 22 }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-[15px] font-extrabold text-slate-100">Register Fleet Vehicle</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Registering under <span className="text-slate-300 font-semibold">{activeBiz.name}</span></div>
            </div>
            <button className={`${sm(S_BTN_SECONDARY)} press`} onClick={closeForm}>
              <MdClose size={15} /> Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 195px), 1fr))', gap: 14 }}>
              <div>
                <label className={PORTAL_LABEL}>License Plate *</label>
                <input className={`${PORTAL_INPUT} font-mono tracking-widest uppercase`}
                  value={form.plate} onChange={e => setField('plate', e.target.value.toUpperCase())} required
                  placeholder="ABC-1234" />
              </div>
              <div>
                <label className={PORTAL_LABEL}>Vehicle Type</label>
                <Select className={PORTAL_INPUT} value={form.type} onChange={e => setField('type', e.target.value)}>
                  {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </div>
              <div>
                <label className={PORTAL_LABEL}>Make *</label>
                <input className={PORTAL_INPUT} value={form.make} onChange={e => setField('make', e.target.value)} required placeholder="Ford" />
              </div>
              <div>
                <label className={PORTAL_LABEL}>Model *</label>
                <input className={PORTAL_INPUT} value={form.model} onChange={e => setField('model', e.target.value)} required placeholder="F-450" />
              </div>
              <div>
                <label className={PORTAL_LABEL}>Year</label>
                <input className={PORTAL_INPUT} value={form.year} onChange={e => setField('year', e.target.value)} placeholder="2024" />
              </div>
              <div>
                <label className={PORTAL_LABEL}>Color</label>
                <input className={PORTAL_INPUT} value={form.color} onChange={e => setField('color', e.target.value)} placeholder="White / Orange" />
              </div>
              <div>
                <label className={PORTAL_LABEL}>Registration Expiry</label>
                <div className="relative w-full overflow-hidden rounded-lg border border-border-base bg-app-input focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/20 transition-all" style={{ height: 42 }}>
                  <input className="absolute inset-0 w-full h-full bg-transparent px-3.5 text-sm text-cad-text outline-none" type="date" value={form.regExpiry} onChange={e => setField('regExpiry', e.target.value)} style={{ colorScheme: 'dark' }} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 items-center mt-5">
              <button type="submit"
                className="press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer border-0 transition-colors"
                style={{ background: '#44aacc', color: '#000f18' }}>
                <MdDirectionsCar size={15} /> Register to Business
              </button>
              <span className="text-[10.5px] text-slate-600 flex items-center gap-1">
                <MdLock size={10} /> Cannot be edited after filing
              </span>
            </div>
          </form>
        </PortalCard>
      )}

      {/* Fleet list */}
      {bizVehicles.length === 0 && !showForm ? (
        <PortalCard accent="cyan">
          <div className="text-center py-12">
            <MdDirectionsCar size={48} style={{ color: 'rgba(68,170,204,0.35)', margin: '0 auto' }} />
            <div className="text-[15px] font-bold text-slate-100 mt-3">No fleet vehicles on file</div>
            <div className="text-sm text-slate-400 mt-1.5">Register the first vehicle for {activeBiz.name}.</div>
            <button
              className="press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer border-0 mt-5 transition-colors"
              style={{ background: '#44aacc22', border: '1px solid #44aacc55', color: '#44aacc' }}
              onClick={openNew}>
              <MdAdd size={18} /> Register Vehicle
            </button>
          </div>
        </PortalCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 14 }}>
          {bizVehicles.map(v => (
            <PortalCard key={v.id} accent="cyan">
              {/* Plate + status row */}
              <div className="flex justify-between items-start gap-2 mb-3">
                <div>
                  <div className="text-[22px] font-extrabold text-slate-100 font-mono tracking-[1px]">{v.plate}</div>
                  <div className="text-[13px] text-slate-400 mt-0.5">{v.year} {v.make} {v.model}</div>
                  {v.type && <div className="text-[11px] text-slate-500 mt-0.5">{v.type}</div>}
                </div>
                <span className={v.regStatus === 'VALID' ? BADGE.green : v.regStatus === 'EXPIRED' ? BADGE.orange : BADGE.red}>
                  {v.regStatus}
                </span>
              </div>

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Color" value={v.color} />
                <Field label="Reg. Expiry" value={v.regExpiry} />
              </div>

              {/* Business owner strip */}
              <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <MdStore size={13} style={{ color: '#44aacc' }} />
                  <span>{activeBiz.name}</span>
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
