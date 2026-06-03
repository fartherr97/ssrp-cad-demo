import { useState, useMemo } from 'react';
import { useCAD } from '../store/cadStore';
import { useActiveBusiness } from '../contexts/BusinessContext';
import { useToast } from '../contexts/ToastContext';
import {
  MdLocalShipping, MdAdd, MdClose, MdFilterList, MdLink,
  MdCancel, MdDirectionsCar, MdLocationOn,
  MdWarning, MdArrowForward, MdBusiness, MdPerson,
  MdLogin, MdLogout, MdEngineering, MdCheckCircle, MdThumbDownAlt,
} from 'react-icons/md';

const STATUSES = [
  { key: 'PENDING',   label: 'Pending',   color: '#f59e0b', bg: 'bg-amber-500/15',  border: 'border-amber-500/40',  text: 'text-amber-400'  },
  { key: 'EN_ROUTE',  label: 'En Route',  color: '#06b6d4', bg: 'bg-cyan-500/15',   border: 'border-cyan-500/40',   text: 'text-cyan-400'   },
  { key: 'ON_SCENE',  label: 'On Scene',  color: '#f97316', bg: 'bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-400' },
  { key: 'TOWING',    label: 'Towing',    color: '#a855f7', bg: 'bg-purple-500/15', border: 'border-purple-500/40', text: 'text-purple-400' },
  { key: 'COMPLETED', label: 'Completed', color: '#22c55e', bg: 'bg-green-500/15',  border: 'border-green-500/40',  text: 'text-green-400'  },
  { key: 'CANCELLED', label: 'Cancelled', color: '#6b7280', bg: 'bg-slate-500/15',  border: 'border-slate-500/40',  text: 'text-slate-400'  },
];

const STATUS_NEXT       = { PENDING: 'EN_ROUTE', EN_ROUTE: 'ON_SCENE', ON_SCENE: 'TOWING', TOWING: 'COMPLETED' };
const STATUS_NEXT_LABEL = { PENDING: 'En Route', EN_ROUTE: 'On Scene', ON_SCENE: 'Towing', TOWING: 'Complete' };

const TOW_TYPES = [
  'Rotation Call', 'MVE (Motor Vehicle Enforcement)', 'Arrest Recovery',
  'Abandoned Vehicle', 'Disabled Vehicle', 'Accident Recovery',
  'Private Property', 'FDOT Clearance', 'Other',
];

const ZONES = ['City', 'County', 'Roaming'];

const PRIORITIES = [
  { val: 1, label: 'P1 — Emergency', color: '#ef4444' },
  { val: 2, label: 'P2 — Urgent',    color: '#f59e0b' },
  { val: 3, label: 'P3 — Routine',   color: '#6b7280' },
];

const PRIORITY_BADGE = {
  1: 'bg-red-500/15 border border-red-500/30 text-red-400',
  2: 'bg-amber-500/15 border border-amber-500/30 text-amber-400',
  3: 'bg-slate-500/15 border border-slate-500/30 text-slate-400',
};

const UNIT_STATUS_META = {
  AVAILABLE: { label: 'Available', color: '#22c55e', bg: 'bg-green-500/15',  border: 'border-green-500/30'  },
  ON_CALL:   { label: 'On Call',   color: '#f59e0b', bg: 'bg-amber-500/15',  border: 'border-amber-500/30'  },
  BREAK:     { label: 'Break',     color: '#3b82f6', bg: 'bg-blue-500/15',   border: 'border-blue-500/30'   },
};

function statusMeta(key) {
  return STATUSES.find(s => s.key === key) || STATUSES[0];
}

function StatusBadge({ status }) {
  const m = statusMeta(status);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${m.bg} ${m.border} ${m.text}`}>
      {m.label}
    </span>
  );
}

function elapsed(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

/* ── Sign-on modal ── */
function SignOnModal({ companies, currentUser, onSignOn, onCancel }) {
  const defaultCo = companies[0];
  const [companyId, setCompanyId] = useState(String(defaultCo?.id || ''));
  const [truckId,   setTruckId]   = useState('');
  const [zone,      setZone]      = useState('City');

  const company = companies.find(b => b.id === Number(companyId)) || companies[0];
  const fleet   = company?.fleet || [];

  const INPUT = 'w-full bg-[#111e2d] border border-[rgba(255,255,255,0.10)] rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-orange-500/60 transition-all';
  const LABEL = 'block text-[11px] font-bold tracking-[0.5px] uppercase text-slate-500 mb-1.5';

  const canSubmit = fleet.length === 0 || truckId;
  const truck     = fleet.find(t => t.id === Number(truckId));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSignOn({
      companyId:   company.id,
      companyName: company.name,
      truckId:     truck?.id   || null,
      truckName:   truck?.name || 'No truck assigned',
      zone,
      operatorName: currentUser?.name     || 'Unknown',
      discordId:    currentUser?.discordId || '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center anim-overlay-in"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="w-full sm:max-w-[420px] rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-5 anim-sheet-in sm:anim-modal-in"
        style={{ background: '#0c1929', border: '1px solid rgba(249,115,22,0.3)' }}>
        <div className="flex items-center justify-between">
          <div className="text-[16px] font-extrabold text-white flex items-center gap-2">
            <MdLogin size={20} className="text-orange-400" /> Sign On — Tow Unit
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <MdClose size={20} className="text-slate-500 hover:text-slate-300" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {companies.length > 1 && (
            <div>
              <label className={LABEL}>Company</label>
              <select className={INPUT} value={companyId}
                onChange={e => { setCompanyId(e.target.value); setTruckId(''); }}>
                {companies.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className={LABEL}>Assign Truck</label>
            {fleet.length === 0 ? (
              <div className="text-[12px] text-slate-500 italic px-1">No fleet configured for this company.</div>
            ) : (
              <select className={INPUT} value={truckId} onChange={e => setTruckId(e.target.value)} required>
                <option value="">— Select truck —</option>
                {fleet.map(t => <option key={t.id} value={t.id}>{t.name} ({t.spawnCode})</option>)}
              </select>
            )}
          </div>
          <div>
            <label className={LABEL}>Zone</label>
            <div className="flex gap-2">
              {ZONES.map(z => (
                <button key={z} type="button" onClick={() => setZone(z)}
                  className={`flex-1 py-2 rounded-lg text-[12px] font-bold cursor-pointer border transition-colors ${
                    zone === z
                      ? 'bg-orange-500 text-black border-transparent'
                      : 'bg-white/[0.04] text-slate-400 border-[rgba(255,255,255,0.1)] hover:text-slate-200'
                  }`}>
                  {z}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer border border-[rgba(255,255,255,0.1)] bg-white/[0.04] text-slate-400 hover:text-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!canSubmit}
              className="press flex-1 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-orange-500 hover:bg-orange-400 text-black transition-colors border-0 disabled:opacity-40">
              Sign On
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Active unit card ── */
function UnitCard({ unit, isMe, dispatch, toast }) {
  const m = UNIT_STATUS_META[unit.status] || UNIT_STATUS_META.AVAILABLE;
  return (
    <div className={`flex flex-col gap-2 px-3.5 py-3 rounded-xl border ${m.bg} ${m.border}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <MdLocalShipping size={15} style={{ color: m.color }} className="shrink-0" />
          <span className="text-[13px] font-bold text-white truncate">{unit.operatorName}</span>
          {isMe && (
            <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
              YOU
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
          style={{ color: m.color, background: 'transparent', borderColor: `${m.color}55` }}>
          {m.label}
        </span>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-slate-400">
        <span className="font-mono">{unit.truckName}</span>
        <span className="w-px h-3 bg-slate-700" />
        <span>{unit.zone}</span>
      </div>
      {isMe && (
        <div className="flex gap-1.5 flex-wrap pt-0.5">
          {['AVAILABLE', 'ON_CALL', 'BREAK'].filter(s => s !== unit.status).map(s => (
            <button key={s} type="button"
              onClick={() => {
                dispatch({ type: 'UPDATE_TOW_UNIT', payload: { id: unit.id, status: s } });
                toast.info(`Status set to ${UNIT_STATUS_META[s].label}`);
              }}
              className="press-sm px-2.5 py-1 rounded-lg text-[10.5px] font-bold cursor-pointer border border-[rgba(255,255,255,0.1)] bg-white/[0.04] text-slate-400 hover:text-slate-200 transition-colors">
              → {UNIT_STATUS_META[s].label}
            </button>
          ))}
          <button type="button"
            onClick={() => {
              dispatch({ type: 'REMOVE_TOW_UNIT', payload: unit.id });
              toast.success('Signed off duty');
            }}
            className="press-sm ml-auto px-2.5 py-1 rounded-lg text-[10.5px] font-bold cursor-pointer border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 transition-colors flex items-center gap-1">
            <MdLogout size={12} /> Sign Off
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Job card ── */
function JobCard({ job, companies, calls, towUnits, currentUnitId, dispatch, toast }) {
  const sm           = statusMeta(job.status);
  const company      = companies.find(b => b.id === job.companyId);
  const linkedCall   = job.callId ? calls.find(c => c.id === job.callId) : null;
  const nextStatus   = STATUS_NEXT[job.status];
  const assignedUnit = towUnits.find(u => u.id === job.unitId);
  const isMyJob      = job.unitId != null && job.unitId === currentUnitId;

  const advance = () => {
    if (!nextStatus) return;
    dispatch({ type: 'UPDATE_TOW_JOB', payload: { id: job.id, status: nextStatus } });
    toast.success(`Job #${job.id} → ${statusMeta(nextStatus).label}`);
    if (job.unitId) {
      dispatch({ type: 'UPDATE_TOW_UNIT', payload: { id: job.unitId, status: nextStatus === 'COMPLETED' ? 'AVAILABLE' : 'ON_CALL' } });
    }
  };

  const cancel = () => {
    dispatch({ type: 'CANCEL_TOW_JOB', payload: job.id });
    toast.warning(`Job #${job.id} cancelled`);
    if (job.unitId) dispatch({ type: 'UPDATE_TOW_UNIT', payload: { id: job.unitId, status: 'AVAILABLE' } });
  };

  const takeJob = () => {
    if (!currentUnitId) return;
    const unit = towUnits.find(u => u.id === currentUnitId);
    dispatch({ type: 'UPDATE_TOW_JOB', payload: { id: job.id, unitId: currentUnitId, status: 'EN_ROUTE', driverName: unit?.operatorName || '' } });
    dispatch({ type: 'UPDATE_TOW_UNIT', payload: { id: currentUnitId, status: 'ON_CALL' } });
    toast.success(`Took job #${job.id}`);
  };

  return (
    <div className="bg-app-panel/80 border rounded-xl p-4 sm:p-5 backdrop-blur-sm flex flex-col gap-3"
      style={{ borderColor: `${sm.color}44`, borderLeft: `3px solid ${sm.color}` }}>

      <div className="flex justify-between items-start gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={job.status} />
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${PRIORITY_BADGE[job.priority]}`}>
            P{job.priority}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">#{job.id}</span>
        </div>
        <span className="text-[10px] text-slate-500">{elapsed(job.createdAt)}</span>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <MdDirectionsCar size={15} className="text-slate-500 shrink-0" />
          <span className="text-[15px] font-extrabold text-slate-100 font-mono tracking-[1px]">{job.plate || '—'}</span>
          {job.color && <span className="text-sm text-slate-400">{job.color}</span>}
        </div>
        {(job.make || job.model) && (
          <div className="text-xs text-slate-400 mt-0.5 ml-[23px]">
            {[job.year, job.make, job.model].filter(Boolean).join(' ')}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <MdLocationOn size={14} className="text-slate-500 shrink-0 mt-0.5" />
          <span className="text-xs text-slate-300 leading-relaxed">{job.location || '—'}</span>
        </div>
        {job.pickupPostal && (
          <div className="text-[11px] text-slate-500 ml-[22px]">
            Pickup: <span className="font-mono text-slate-400">{job.pickupPostal}</span>
          </div>
        )}
        {job.dropoffPostal && (
          <div className="text-[11px] text-slate-500 ml-[22px]">
            Drop-off: <span className="font-mono text-slate-400">{job.dropoffPostal}</span>
          </div>
        )}
        <div className="text-[11px] font-semibold text-slate-500">{job.towType}</div>
        {job.zone && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/15 border border-slate-500/30 text-slate-400 w-fit">
            {job.zone}
          </span>
        )}
      </div>

      <div className="flex gap-4 text-xs flex-wrap items-center">
        {assignedUnit ? (
          <div className="flex items-center gap-1.5">
            <MdLocalShipping size={13} className="text-orange-400" />
            <span className="text-slate-300">{assignedUnit.operatorName}</span>
            <span className="text-slate-500 font-mono text-[10px]">({assignedUnit.truckName})</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-600 italic">Unassigned</span>
        )}
        {company && (
          <div className="flex items-center gap-1.5 ml-auto">
            <MdBusiness size={13} className="text-slate-500" />
            <span className="text-slate-400">{company.name}</span>
          </div>
        )}
      </div>

      {linkedCall && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/25">
          <MdLink size={14} className="text-amber-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-amber-300">Linked — Call {linkedCall.id}</div>
            <div className="text-[10.5px] text-amber-400/80 truncate">
              {linkedCall.nature} * {linkedCall.location}
            </div>
          </div>
        </div>
      )}

      {job.notes && (
        <div className="text-xs text-slate-400 leading-relaxed border-t border-border-faint pt-2">{job.notes}</div>
      )}

      {job.status !== 'COMPLETED' && job.status !== 'CANCELLED' && (
        <div className="flex gap-2 flex-wrap pt-1">
          {job.status === 'PENDING' && currentUnitId && !isMyJob && (
            <button onClick={takeJob}
              className="press flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold cursor-pointer border-0 bg-orange-500 hover:bg-orange-400 text-black transition-colors">
              <MdPerson size={14} /> Take Job
            </button>
          )}
          {(isMyJob || !job.unitId) && nextStatus && (
            <button onClick={advance}
              className="press flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold cursor-pointer border-0 transition-colors"
              style={{ background: sm.color, color: '#000' }}>
              <MdArrowForward size={14} /> {STATUS_NEXT_LABEL[job.status]}
            </button>
          )}
          <button onClick={cancel}
            className="press-sm inline-flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-bold cursor-pointer border border-border-base bg-white/[0.04] text-slate-400 hover:text-red-400 hover:border-red-400/30 transition-colors">
            <MdCancel size={14} /> Cancel
          </button>
        </div>
      )}
    </div>
  );
}

/* ── New job form ── */
const EMPTY_FORM = {
  plate: '', make: '', model: '', year: '', color: '',
  location: '', pickupPostal: '', dropoffPostal: '',
  towType: 'Rotation Call', priority: 2, zone: 'City',
  notes: '', callId: '', companyId: '', unitId: '',
};

function NewJobForm({ companies, calls, towUnits, initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, companyId: companies[0]?.id || '', ...(initial || {}) });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const fromRequest = !!initial;

  const INPUT = 'w-full bg-app-input border border-border-base rounded-lg px-3.5 py-2.5 text-sm text-cad-text placeholder:text-slate-600 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/20 transition-all';
  const LABEL = 'block text-[11px] font-bold tracking-[0.5px] uppercase text-cad-muted mb-1.5';

  const availableUnits = towUnits.filter(u =>
    u.status === 'AVAILABLE' &&
    (companies.length === 0 || companies.some(b => b.id === u.companyId))
  );

  const roadCalls = calls.filter(c =>
    c.status !== 'CLOSED' &&
    ['Road Hazard', 'MVA', 'Traffic Stop', 'Accident'].some(k => c.nature.includes(k))
  );
  // Make sure a prefilled linked call is selectable even if it isn't a road call.
  const linkedExtra = form.callId && !roadCalls.some(c => c.id === form.callId)
    ? calls.filter(c => c.id === form.callId)
    : [];
  const callOptions = [...linkedExtra, ...roadCalls];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      companyId: Number(form.companyId),
      priority:  Number(form.priority),
      unitId:    form.unitId ? Number(form.unitId) : null,
    });
  };

  return (
    <div className="bg-app-panel/80 border border-orange-500/30 rounded-xl p-4 sm:p-5 mb-5">
      <div className="flex justify-between items-center mb-4">
        <div className="text-[15px] font-extrabold text-slate-100">
          {fromRequest ? 'Dispatch — FDOT Assist' : 'New Tow Job'}
        </div>
        <button onClick={onCancel}
          className="press-sm inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold cursor-pointer border border-border-base bg-white/[0.04] text-slate-400 hover:text-slate-200 transition-colors">
          <MdClose size={15} /> Cancel
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
          {companies.length > 1 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label className={LABEL}>Tow Company</label>
              <select className={INPUT} value={form.companyId} onChange={e => set('companyId', e.target.value)} required>
                {companies.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className={LABEL}>License Plate</label>
            <input className={INPUT} value={form.plate} onChange={e => set('plate', e.target.value.toUpperCase())} placeholder="ABC-1234" />
          </div>
          <div>
            <label className={LABEL}>Make</label>
            <input className={INPUT} value={form.make} onChange={e => set('make', e.target.value)} placeholder="Ford" />
          </div>
          <div>
            <label className={LABEL}>Model</label>
            <input className={INPUT} value={form.model} onChange={e => set('model', e.target.value)} placeholder="F-150" />
          </div>
          <div>
            <label className={LABEL}>Year</label>
            <input className={INPUT} value={form.year} onChange={e => set('year', e.target.value)} placeholder="2020" />
          </div>
          <div>
            <label className={LABEL}>Color</label>
            <input className={INPUT} value={form.color} onChange={e => set('color', e.target.value)} placeholder="Black" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className={LABEL}>Pickup Location / Address</label>
            <input className={INPUT} value={form.location} onChange={e => set('location', e.target.value)} placeholder="I-275 SB / Sligh Ave" required />
          </div>
          <div>
            <label className={LABEL}>Pickup Postal</label>
            <input className={`${INPUT} font-mono`} value={form.pickupPostal} onChange={e => set('pickupPostal', e.target.value)} placeholder="e.g. 347" />
          </div>
          <div>
            <label className={LABEL}>Drop-off Postal</label>
            <input className={`${INPUT} font-mono`} value={form.dropoffPostal} onChange={e => set('dropoffPostal', e.target.value)} placeholder="e.g. 512" />
          </div>
          <div>
            <label className={LABEL}>Tow Type</label>
            <select className={INPUT} value={form.towType} onChange={e => set('towType', e.target.value)}>
              {TOW_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL}>Priority</label>
            <select className={INPUT} value={form.priority} onChange={e => set('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p.val} value={p.val}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL}>Zone</label>
            <select className={INPUT} value={form.zone} onChange={e => set('zone', e.target.value)}>
              {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL}>Assign Driver</label>
            <select className={INPUT} value={form.unitId} onChange={e => set('unitId', e.target.value)}>
              <option value="">— Unassigned —</option>
              {availableUnits.map(u => (
                <option key={u.id} value={u.id}>{u.operatorName} ({u.truckName})</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Link to LE Call</label>
            <select className={INPUT} value={form.callId} onChange={e => set('callId', e.target.value)}>
              <option value="">— None —</option>
              {callOptions.map(c => (
                <option key={c.id} value={c.id}>{c.id} * {c.nature} @ {c.location}</option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className={LABEL}>Notes</label>
            <textarea className={INPUT} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional details…" />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button type="submit"
            className="press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-orange-500 hover:bg-orange-400 text-black transition-colors border-0">
            <MdLocalShipping size={15} /> Create Job
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Quick Dispatch Modal — pick a unit, send it en route ── */
function QuickDispatchModal({ req, availableUnits, fdotCompany, onConfirm, onCancel }) {
  const [selectedUnitId, setSelectedUnitId] = useState(
    availableUnits.length === 1 ? availableUnits[0].id : null
  );

  const handleConfirm = () => {
    if (!selectedUnitId) return;
    onConfirm(req, selectedUnitId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center anim-overlay-in"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="w-full sm:max-w-[460px] rounded-t-2xl sm:rounded-2xl flex flex-col gap-4 anim-sheet-in sm:anim-modal-in"
        style={{ background: '#0c1929', border: '1px solid rgba(249,115,22,0.3)', padding: '20px' }}>

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shrink-0">
            <MdEngineering size={20} className="text-orange-400" />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-bold text-white">Dispatch Unit</div>
            <div className="text-[11.5px] text-slate-400 mt-0.5 truncate">{req.assistType} · {req.location}</div>
          </div>
        </div>

        {/* Unit list */}
        {availableUnits.length === 0 ? (
          <div className="py-6 text-center text-[13px] text-slate-500">
            No signed-on units available. Have a driver sign on first.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Select Unit</div>
            {availableUnits.map(u => {
              const active = selectedUnitId === u.id;
              return (
                <button key={u.id} type="button" onClick={() => setSelectedUnitId(u.id)}
                  className="press w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer"
                  style={{
                    background: active ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: active ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.06)' }}>
                    <MdLocalShipping size={16} style={{ color: active ? '#fb923c' : '#64748b' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-slate-100">{u.truckName}</div>
                    {u.operatorName && <div className="text-[11px] text-slate-400">{u.operatorName}</div>}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 shrink-0">
                    {u.status || 'AVAILABLE'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onCancel}
            className="press flex-1 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer border border-border-base bg-white/[0.04] text-slate-400 hover:text-slate-200 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} disabled={!selectedUnitId}
            className="press flex-[2] py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer transition-colors border-0 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: selectedUnitId ? '#f97316' : '#f9731650', color: '#0c0f14' }}>
            <span className="flex items-center justify-center gap-1.5">
              <MdArrowForward size={14} /> Dispatch En Route
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── FDOT assistance request card (FDOT inbound queue) ── */
const FDOT_REQ_META = {
  PENDING:      { label: 'Pending',      color: '#f59e0b' },
  ACKNOWLEDGED: { label: 'Acknowledged', color: '#06b6d4' },
};

function FDOTRequestCard({ req, calls, onAcknowledge, onDispatch, onDecline }) {
  const m = FDOT_REQ_META[req.status] || FDOT_REQ_META.PENDING;
  const linkedCall = req.callId ? calls.find(c => c.id === req.callId) : null;

  return (
    <div className="bg-app-panel/80 border rounded-xl p-4 flex flex-col gap-3"
      style={{ borderColor: `${m.color}55`, borderLeft: `3px solid ${m.color}` }}>
      <div className="flex justify-between items-start gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
            style={{ color: m.color, borderColor: `${m.color}55`, background: `${m.color}14` }}>
            {m.label}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${PRIORITY_BADGE[req.priority]}`}>
            P{req.priority}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">#{req.id}</span>
        </div>
        <span className="text-[10px] text-slate-500">{elapsed(req.createdAt)}</span>
      </div>

      <div className="flex items-center gap-2">
        <MdEngineering size={16} className="text-amber-400 shrink-0" />
        <span className="text-[14px] font-extrabold text-slate-100">{req.assistType}</span>
      </div>

      <div className="flex items-start gap-2">
        <MdLocationOn size={14} className="text-slate-500 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <span className="text-xs text-slate-300 leading-relaxed">{req.location}</span>
          {req.postal && <span className="text-[11px] text-slate-500 font-mono ml-2">({req.postal})</span>}
        </div>
      </div>

      <div className="flex-1 text-xs text-slate-400 leading-relaxed border-t border-border-faint pt-2">{req.description}</div>

      <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
        <MdPerson size={13} className="shrink-0" />
        <span>{req.requestedBy}{req.requestedByUnit ? ` · ${req.requestedByUnit}` : ''}</span>
        {linkedCall && (
          <span className="inline-flex items-center gap-1 ml-auto text-amber-400/80">
            <MdLink size={12} /> Call {linkedCall.id}
          </span>
        )}
      </div>

      <div className="mt-auto grid gap-2 pt-1" style={{ gridTemplateColumns: req.status === 'PENDING' ? 'repeat(3, 1fr)' : '1fr 1fr' }}>
        {req.status === 'PENDING' && (
          <button onClick={() => onAcknowledge(req)}
            className="btn-glossy inline-flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg text-[11.5px] font-bold cursor-pointer border border-transparent bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 whitespace-nowrap">
            <MdCheckCircle size={14} className="shrink-0" /> Acknowledge
          </button>
        )}
        <button onClick={() => onDispatch(req)}
          className="btn-glossy inline-flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg text-[11.5px] font-bold cursor-pointer border border-amber-400/35 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25 hover:border-amber-300/55 whitespace-nowrap">
          <MdArrowForward size={14} className="shrink-0" /> Dispatch
        </button>
        <button onClick={() => onDecline(req)}
          className="btn-glossy inline-flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg text-[11.5px] font-bold cursor-pointer border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] hover:border-white/20 whitespace-nowrap">
          <MdThumbDownAlt size={14} className="shrink-0" /> Decline
        </button>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function TowCAD() {
  const { state, dispatch } = useCAD();
  const { towJobs, towUnits = [], calls, businesses, currentUser, officers = [], fdotRequests = [] } = state;
  const bizCtx = useActiveBusiness();
  const toast = useToast();

  const isBusinessPortal = currentUser?.portal === 'business';
  const towCompanies = useMemo(() => businesses.filter(b => b.isTowCompany), [businesses]);

  const visibleCompanies = useMemo(() => {
    if (isBusinessPortal && bizCtx?.activeBiz) return [bizCtx.activeBiz].filter(b => b.isTowCompany);
    return towCompanies;
  }, [isBusinessPortal, bizCtx, towCompanies]);

  const visibleCompanyIds = useMemo(() => visibleCompanies.map(b => b.id), [visibleCompanies]);

  // FDOT inbound requests are only surfaced to the FDOT tow company's own view.
  const fdotCompany = useMemo(() => visibleCompanies.find(b => b.isFDOT), [visibleCompanies]);
  const isFdotView  = isBusinessPortal && !!fdotCompany;
  const inboundRequests = useMemo(
    () => fdotRequests.filter(r => r.status === 'PENDING' || r.status === 'ACKNOWLEDGED'),
    [fdotRequests]
  );

  const [showForm,       setShowForm]       = useState(false);
  const [showSignOn,     setShowSignOn]     = useState(false);
  const [statusFilter,   setStatus]         = useState('ALL');
  const [companyFilter,  setCompany]        = useState('ALL');
  const [formInitial,    setFormInitial]    = useState(null);
  const [pendingReqId,   setPendingReqId]   = useState(null);
  const [dispatchingReq, setDispatchingReq] = useState(null);

  const myUnit = useMemo(() =>
    towUnits.find(u =>
      (currentUser?.discordId && u.discordId === currentUser.discordId) ||
      u.operatorName === currentUser?.name
    ),
    [towUnits, currentUser]
  );

  const activeCalls   = useMemo(() => calls.filter(c => c.status !== 'CLOSED'), [calls]);
  // Road Hazard / MVA calls that still have no tow job linked to them. Once a
  // job is linked (e.g. by dispatching the matching FDOT request), the call
  // drops off this list — and the alert banner clears when none remain.
  const unhandledRoadCalls = useMemo(
    () => activeCalls.filter(c =>
      (c.nature.includes('Road Hazard') || c.nature.includes('MVA')) &&
      !towJobs.some(j => j.callId === c.id)
    ),
    [activeCalls, towJobs]
  );
  const visibleUnits  = useMemo(() =>
    towUnits.filter(u => visibleCompanyIds.length === 0 || visibleCompanyIds.includes(u.companyId)),
    [towUnits, visibleCompanyIds]
  );

  const filtered = useMemo(() => {
    let jobs = towJobs.filter(j =>
      visibleCompanyIds.length === 0 || visibleCompanyIds.includes(j.companyId)
    );
    if (statusFilter  !== 'ALL') jobs = jobs.filter(j => j.status === statusFilter);
    if (companyFilter !== 'ALL') jobs = jobs.filter(j => j.companyId === Number(companyFilter));
    return jobs;
  }, [towJobs, visibleCompanyIds, statusFilter, companyFilter]);

  const counts = useMemo(() => {
    const c = { ACTIVE: 0 };
    STATUSES.forEach(s => { c[s.key] = 0; });
    towJobs.forEach(j => {
      if (c[j.status] !== undefined) c[j.status]++;
      if (!['COMPLETED', 'CANCELLED'].includes(j.status)) c.ACTIVE++;
    });
    return c;
  }, [towJobs]);

  const handleCreate = (form) => {
    const company      = towCompanies.find(b => b.id === form.companyId) || towCompanies[0];
    const assignedUnit = form.unitId ? towUnits.find(u => u.id === form.unitId) : null;
    dispatch({
      type: 'ADD_TOW_JOB',
      payload: {
        ...form,
        companyId:   company?.id,
        companyName: company?.name,
        status:      form.unitId ? 'EN_ROUTE' : 'PENDING',
        driverName:  assignedUnit?.operatorName || '',
      },
    });
    toast.success(`Tow job created for ${form.plate || 'vehicle'}`, { title: 'Job created' });
    if (form.unitId) dispatch({ type: 'UPDATE_TOW_UNIT', payload: { id: form.unitId, status: 'ON_CALL' } });
    // If this job fulfils an FDOT request, mark that request dispatched.
    if (pendingReqId) {
      dispatch({ type: 'UPDATE_FDOT_REQUEST', payload: { id: pendingReqId, status: 'DISPATCHED' } });
      setPendingReqId(null);
    }
    setFormInitial(null);
    setShowForm(false);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormInitial(null);
    setPendingReqId(null);
  };

  const handleSignOn = (data) => {
    dispatch({ type: 'ADD_TOW_UNIT', payload: data });
    toast.success(`Signed on — ${data.truckName}`, { title: 'On duty' });
    setShowSignOn(false);
  };

  /* ── FDOT request actions ── */
  // Officer ids to notify: units attached to that scene's call, plus the
  // officer who made the request (matched by unit/badge).
  const recipientsFor = (req) => {
    const ids = officers.filter(o => req.callId && o.callId === req.callId).map(o => o.id);
    const requester = officers.find(o => o.unitId === req.requestedByUnit || o.badge === req.requestedByBadge);
    if (requester && !ids.includes(requester.id)) ids.push(requester.id);
    return ids;
  };
  const acknowledgeRequest = (req) => {
    dispatch({ type: 'UPDATE_FDOT_REQUEST', payload: { id: req.id, status: 'ACKNOWLEDGED' } });
    toast.info(`Acknowledged — ${req.assistType}`, { title: 'FDOT' });
    dispatch({
      type: 'DISPATCH_RADIO',
      payload: { from: currentUser?.id, to: recipientsFor(req), text: `FDOT has acknowledged the ${req.assistType} request at ${req.location}${req.callId ? ` (Call ${req.callId})` : ''} and is en route.` },
    });
  };
  const declineRequest = (req) => {
    dispatch({ type: 'UPDATE_FDOT_REQUEST', payload: { id: req.id, status: 'DECLINED' } });
    toast.warning(`Declined — ${req.assistType}`, { title: 'FDOT' });
  };
  const dispatchFromRequest = (req) => setDispatchingReq(req);

  const confirmQuickDispatch = (req, unitId) => {
    const unit = towUnits.find(u => u.id === unitId);
    dispatch({
      type: 'ADD_TOW_JOB',
      payload: {
        location:    req.location,
        pickupPostal: req.postal || '',
        towType:     'FDOT Clearance',
        priority:    req.priority || 2,
        zone:        'Roaming',
        notes:       `[FDOT Assist] ${req.assistType} — ${req.description}`,
        callId:      req.callId || '',
        companyId:   fdotCompany?.id,
        companyName: fdotCompany?.name || 'FDOT',
        unitId,
        driverName:  unit?.operatorName || '',
        status:      'EN_ROUTE',
        plate:       '',
      },
    });
    dispatch({ type: 'UPDATE_TOW_UNIT', payload: { id: unitId, status: 'ON_CALL' } });
    dispatch({ type: 'UPDATE_FDOT_REQUEST', payload: { id: req.id, status: 'DISPATCHED' } });
    toast.success(`${unit?.truckName || 'Unit'} dispatched en route.`, { title: 'Unit Dispatched' });
    dispatch({
      type: 'DISPATCH_RADIO',
      payload: { from: currentUser?.id, to: recipientsFor(req), text: `FDOT has dispatched ${unit?.truckName || 'a unit'} to the ${req.assistType} request at ${req.location}${req.callId ? ` (Call ${req.callId})` : ''}. Unit is en route.` },
    });
    setDispatchingReq(null);
  };

  return (
    <div className="flex-1 w-full min-w-0 h-full overflow-auto box-border px-4 py-5 sm:px-10 sm:py-7 font-ui bg-app-bg"
      style={{ background: 'radial-gradient(ellipse at 20% -10%, rgba(234,88,12,0.10) 0%, transparent 55%), var(--n-bg-app)' }}>

      {showSignOn && (
        <SignOnModal
          companies={visibleCompanies.length > 0 ? visibleCompanies : towCompanies}
          currentUser={currentUser}
          onSignOn={handleSignOn}
          onCancel={() => setShowSignOn(false)}
        />
      )}

      {dispatchingReq && (
        <QuickDispatchModal
          req={dispatchingReq}
          availableUnits={visibleUnits.filter(u => !['ON_CALL'].includes(u.status))}
          fdotCompany={fdotCompany}
          onConfirm={confirmQuickDispatch}
          onCancel={() => setDispatchingReq(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center flex-wrap gap-x-4 gap-y-3 mb-6 pb-[18px] border-b border-border-base">
        <div className="w-11 h-11 sm:w-[52px] sm:h-[52px] rounded-xl shrink-0 flex items-center justify-center bg-orange-500/15 border border-orange-500/30">
          <MdLocalShipping size={28} color="#f97316" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[19px] sm:text-[22px] font-extrabold text-white tracking-[-0.3px]">Tow CAD</div>
          <div className="text-[13px] text-cad-muted mt-0.5">Towing dispatch and job management</div>
        </div>
        <div className="flex gap-2">
          {!myUnit && (
            <button onClick={() => setShowSignOn(true)}
              className="press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-bold cursor-pointer bg-green-600 hover:bg-green-500 text-white transition-colors border-0">
              <MdLogin size={16} /> Sign On
            </button>
          )}
          {!showForm && (
            <button onClick={() => setShowForm(true)}
              className="press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-bold cursor-pointer bg-orange-500 hover:bg-orange-400 text-white transition-colors border-0">
              <MdAdd size={18} /> New Job
            </button>
          )}
        </div>
      </div>

      {/* FDOT inbound assistance requests — FDOT company view only */}
      {isFdotView && inboundRequests.length > 0 && (
        <div className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
            <MdEngineering size={14} /> Incoming LE Assistance Requests ({inboundRequests.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))', gap: 12 }}>
            {inboundRequests.map(req => (
              <FDOTRequestCard key={req.id} req={req} calls={calls}
                onAcknowledge={acknowledgeRequest}
                onDispatch={dispatchFromRequest}
                onDecline={declineRequest} />
            ))}
          </div>
        </div>
      )}

      {/* Active units panel */}
      {visibleUnits.length > 0 && (
        <div className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <MdLocalShipping size={13} /> On-Duty Units ({visibleUnits.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: 10 }}>
            {visibleUnits.map(u => (
              <UnitCard key={u.id} unit={u} isMe={myUnit?.id === u.id} dispatch={dispatch} toast={toast} />
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-3 flex-wrap mb-6">
        {[
          { label: 'Active Jobs', val: counts.ACTIVE,    color: '#f97316' },
          { label: 'Pending',     val: counts.PENDING,   color: '#f59e0b' },
          { label: 'En Route',    val: counts.EN_ROUTE,  color: '#06b6d4' },
          { label: 'On Scene',    val: counts.ON_SCENE,  color: '#f97316' },
          { label: 'Completed',   val: counts.COMPLETED, color: '#22c55e' },
        ].map(s => (
          <div key={s.label} className="flex-1 min-w-[100px] bg-app-card/70 border border-border-base rounded-xl px-4 py-4 flex flex-col gap-1">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-cad-muted">{s.label}</div>
            <div className="text-[28px] font-extrabold leading-none" style={{ color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* New job form */}
      {showForm && (
        <NewJobForm
          companies={visibleCompanies.length > 0 ? visibleCompanies : towCompanies}
          calls={activeCalls}
          towUnits={visibleUnits}
          initial={formInitial}
          onSubmit={handleCreate}
          onCancel={closeForm}
        />
      )}

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap mb-5 items-center">
        <MdFilterList size={18} className="text-slate-500 shrink-0" />
        <div className="flex gap-1.5 flex-wrap">
          {['ALL', ...STATUSES.map(s => s.key)].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer border transition-all ${
                statusFilter === s
                  ? 'bg-orange-500 text-white border-transparent'
                  : 'bg-white/[0.04] text-slate-400 border-border-base hover:text-slate-200'
              }`}>
              {s === 'ALL' ? `All (${filtered.length})` : statusMeta(s).label}
            </button>
          ))}
        </div>
        {towCompanies.length > 1 && !isBusinessPortal && (
          <select
            className="bg-app-input border border-border-base rounded-lg px-3 py-1.5 text-[11.5px] text-cad-text outline-none focus:border-brand/60 transition-all ml-auto"
            value={companyFilter} onChange={e => setCompany(e.target.value)}>
            <option value="ALL">All companies</option>
            {towCompanies.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      {/* FDOT road incident alert — only while road calls still lack a linked
          tow job; clears once every one has been handled. */}
      {towCompanies.some(b => b.isFDOT) && unhandledRoadCalls.length > 0 && (
        <div className="flex items-start gap-3 mb-5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
          <MdWarning size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[12.5px] text-amber-300 leading-relaxed">
            <span className="font-bold">
              {unhandledRoadCalls.length} active road incident{unhandledRoadCalls.length > 1 ? 's' : ''} awaiting a tow job.
            </span>{' '}
            Road Hazard or MVA calls in the dispatch queue have no tow job linked yet — link one to coordinate response.
          </div>
        </div>
      )}

      {/* Job grid */}
      {filtered.length === 0 ? (
        <div className="bg-app-panel/80 border border-border-base rounded-xl p-12 text-center">
          <MdLocalShipping size={48} color="rgba(249,115,22,0.3)" className="mx-auto" />
          <div className="text-[15px] font-bold text-slate-100 mt-3">No tow jobs</div>
          <div className="text-sm text-slate-400 mt-1.5">
            {statusFilter !== 'ALL' ? 'Try changing the filter.' : 'Create a new job to get started.'}
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)}
              className="press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-orange-500 hover:bg-orange-400 text-black transition-colors border-0 mt-4">
              <MdAdd size={16} /> New Tow Job
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: 14 }}>
          {filtered.map(job => (
            <JobCard key={job.id} job={job} companies={towCompanies} calls={activeCalls}
              towUnits={towUnits} currentUnitId={myUnit?.id} dispatch={dispatch} toast={toast} />
          ))}
        </div>
      )}
    </div>
  );
}
