import { useState, useMemo } from 'react';
import { useCAD } from '../store/cadStore';
import { useActiveBusiness } from '../contexts/BusinessContext';
import {
  MdLocalShipping, MdAdd, MdClose, MdFilterList, MdLink, MdLinkOff,
  MdCheckCircle, MdCancel, MdDirectionsCar, MdLocationOn, MdPhone,
  MdWarning, MdArrowForward, MdBusiness, MdPerson,
} from 'react-icons/md';

/* ── Status pipeline ── */
const STATUSES = [
  { key: 'PENDING',    label: 'Pending',    color: '#f59e0b', bg: 'bg-amber-500/15',  border: 'border-amber-500/40',  text: 'text-amber-400'  },
  { key: 'DISPATCHED', label: 'Dispatched', color: '#3b82f6', bg: 'bg-blue-500/15',   border: 'border-blue-500/40',   text: 'text-blue-400'   },
  { key: 'EN_ROUTE',   label: 'En Route',   color: '#06b6d4', bg: 'bg-cyan-500/15',   border: 'border-cyan-500/40',   text: 'text-cyan-400'   },
  { key: 'ON_SCENE',   label: 'On Scene',   color: '#f97316', bg: 'bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-400' },
  { key: 'LOADED',     label: 'Loaded',     color: '#a855f7', bg: 'bg-purple-500/15', border: 'border-purple-500/40', text: 'text-purple-400' },
  { key: 'COMPLETED',  label: 'Completed',  color: '#22c55e', bg: 'bg-green-500/15',  border: 'border-green-500/40',  text: 'text-green-400'  },
  { key: 'CANCELLED',  label: 'Cancelled',  color: '#6b7280', bg: 'bg-slate-500/15',  border: 'border-slate-500/40',  text: 'text-slate-400'  },
];

const STATUS_NEXT = {
  PENDING: 'DISPATCHED', DISPATCHED: 'EN_ROUTE', EN_ROUTE: 'ON_SCENE',
  ON_SCENE: 'LOADED', LOADED: 'COMPLETED',
};

const STATUS_NEXT_LABEL = {
  PENDING: 'Dispatch', DISPATCHED: 'En Route', EN_ROUTE: 'On Scene',
  ON_SCENE: 'Loaded', LOADED: 'Complete',
};

const TOW_TYPES = [
  'Rotation Call', 'Private Property', 'Evidence / Hold',
  'Accident Recovery', 'Disabled Vehicle', 'Abandoned Vehicle',
  'Repossession', 'FDOT Clearance', 'Other',
];

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

function statusMeta(key) {
  return STATUSES.find(s => s.key === key) || STATUSES[0];
}

/* ── Status badge chip ── */
function StatusBadge({ status }) {
  const m = statusMeta(status);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${m.bg} ${m.border} ${m.text}`}>
      {m.label}
    </span>
  );
}

/* ── Elapsed time ── */
function useElapsed(createdAt) {
  const mins = Math.floor((Date.now() - createdAt) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

function ElapsedBadge({ createdAt }) {
  const label = useElapsed(createdAt);
  return <span className="text-[10px] text-slate-500">{label}</span>;
}

/* ── Job card ── */
function JobCard({ job, companies, calls, dispatch }) {
  const sm = statusMeta(job.status);
  const company = companies.find(b => b.id === job.companyId);
  const linkedCall = job.callId ? calls.find(c => c.id === job.callId) : null;
  const nextStatus = STATUS_NEXT[job.status];

  const advance = () => {
    if (nextStatus) dispatch({ type: 'UPDATE_TOW_JOB', payload: { id: job.id, status: nextStatus } });
  };
  const cancel = () => dispatch({ type: 'CANCEL_TOW_JOB', payload: job.id });

  return (
    <div
      className="bg-app-panel/80 border rounded-xl p-4 sm:p-5 backdrop-blur-sm flex flex-col gap-3"
      style={{ borderColor: `${sm.color}44`, borderLeft: `3px solid ${sm.color}` }}
    >
      {/* Top row */}
      <div className="flex justify-between items-start gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={job.status} />
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${PRIORITY_BADGE[job.priority]}`}>
            P{job.priority}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">#{job.id}</span>
        </div>
        <ElapsedBadge createdAt={job.createdAt} />
      </div>

      {/* Vehicle info */}
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

      {/* Location + type */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <MdLocationOn size={14} className="text-slate-500 shrink-0 mt-0.5" />
          <span className="text-xs text-slate-300 leading-relaxed">{job.location || '—'}</span>
        </div>
        <div className="text-[11px] font-semibold text-slate-500">{job.towType}</div>
      </div>

      {/* Driver + company */}
      <div className="flex gap-4 text-xs flex-wrap">
        {job.driverName && (
          <div className="flex items-center gap-1.5">
            <MdPerson size={13} className="text-slate-500" />
            <span className="text-slate-300">{job.driverName}</span>
          </div>
        )}
        {company && (
          <div className="flex items-center gap-1.5">
            <MdBusiness size={13} className="text-slate-500" />
            <span className="text-slate-400">{company.name}</span>
          </div>
        )}
      </div>

      {/* Linked LE call */}
      {linkedCall && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/25">
          <MdLink size={14} className="text-amber-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-amber-300">Linked to Call {linkedCall.id}</div>
            <div className="text-[10.5px] text-amber-400/80 truncate">{linkedCall.nature} — {linkedCall.location}</div>
          </div>
        </div>
      )}

      {/* Notes */}
      {job.notes && (
        <div className="text-xs text-slate-400 leading-relaxed border-t border-border-faint pt-2">{job.notes}</div>
      )}

      {/* Actions */}
      {job.status !== 'COMPLETED' && job.status !== 'CANCELLED' && (
        <div className="flex gap-2 flex-wrap pt-1">
          {nextStatus && (
            <button
              onClick={advance}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold cursor-pointer border-0 transition-colors"
              style={{ background: sm.color, color: '#000' }}
            >
              <MdArrowForward size={14} /> {STATUS_NEXT_LABEL[job.status]}
            </button>
          )}
          <button
            onClick={cancel}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-bold cursor-pointer border border-border-base bg-white/[0.04] text-slate-400 hover:text-red-400 hover:border-red-400/30 transition-colors"
          >
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
  location: '', towType: 'Rotation Call', driverName: '', priority: 2,
  notes: '', callId: '', companyId: '',
};

function NewJobForm({ companies, calls, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, companyId: companies[0]?.id || '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const INPUT = 'w-full bg-app-input border border-border-base rounded-lg px-3.5 py-2.5 text-sm text-cad-text placeholder:text-slate-600 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/20 transition-all';
  const LABEL = 'block text-[11px] font-bold tracking-[0.5px] uppercase text-cad-muted mb-1.5';

  const roadCalls = calls.filter(c =>
    c.status !== 'CLOSED' &&
    (c.category === 'police' || c.category === 'fire') &&
    ['Road Hazard', 'MVA w/ Injuries', 'Traffic Stop', 'Accident'].some(k => c.nature.includes(k))
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, companyId: Number(form.companyId), priority: Number(form.priority) });
  };

  return (
    <div className="bg-app-panel/80 border border-brand/30 rounded-xl p-4 sm:p-5 mb-5">
      <div className="flex justify-between items-center mb-4">
        <div className="text-[15px] font-extrabold text-slate-100">New Tow Job</div>
        <button onClick={onCancel} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold cursor-pointer border border-border-base bg-white/[0.04] text-slate-400 hover:text-slate-200 transition-colors">
          <MdClose size={15} /> Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
          {/* Company */}
          {companies.length > 1 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label className={LABEL}>Tow Company</label>
              <select className={INPUT} value={form.companyId} onChange={e => set('companyId', e.target.value)} required>
                {companies.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}
          {/* Vehicle */}
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
          {/* Location */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label className={LABEL}>Pickup Location</label>
            <input className={INPUT} value={form.location} onChange={e => set('location', e.target.value)} placeholder="I-275 SB / Sligh Ave" required />
          </div>
          {/* Tow type + priority */}
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
            <label className={LABEL}>Assigned Driver</label>
            <input className={INPUT} value={form.driverName} onChange={e => set('driverName', e.target.value)} placeholder="Driver name" />
          </div>
          {/* Link to LE call */}
          <div>
            <label className={LABEL}>Link to LE Call (optional)</label>
            <select className={INPUT} value={form.callId} onChange={e => set('callId', e.target.value)}>
              <option value="">— None —</option>
              {roadCalls.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} · {c.nature} @ {c.location}
                </option>
              ))}
            </select>
          </div>
          {/* Notes */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label className={LABEL}>Notes</label>
            <textarea className={INPUT} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional details…" />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-brand hover:bg-brand/80 text-white transition-colors border-0">
            <MdLocalShipping size={15} /> Create Job
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Main page ── */
export default function TowCAD() {
  const { state, dispatch } = useCAD();
  const { towJobs, calls, businesses, currentUser } = state;
  const bizCtx = useActiveBusiness();

  /* Which companies can this user see / dispatch for? */
  const isBusinessPortal = currentUser?.portal === 'business';
  const towCompanies = useMemo(() =>
    businesses.filter(b => b.isTowCompany),
    [businesses]
  );

  /* Business portal users see jobs only for their active business */
  const visibleCompanies = useMemo(() => {
    if (isBusinessPortal && bizCtx?.activeBiz) return [bizCtx.activeBiz].filter(b => b.isTowCompany);
    return towCompanies;
  }, [isBusinessPortal, bizCtx, towCompanies]);

  const visibleCompanyIds = useMemo(() => visibleCompanies.map(b => b.id), [visibleCompanies]);

  const [showForm, setShowForm]     = useState(false);
  const [statusFilter, setStatus]   = useState('ALL');
  const [companyFilter, setCompany] = useState('ALL');

  const filtered = useMemo(() => {
    let jobs = towJobs.filter(j => visibleCompanyIds.length === 0 || visibleCompanyIds.includes(j.companyId));
    if (statusFilter !== 'ALL') jobs = jobs.filter(j => j.status === statusFilter);
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

  const activeCalls = useMemo(() =>
    calls.filter(c => c.status !== 'CLOSED'),
    [calls]
  );

  const handleCreate = (form) => {
    const company = towCompanies.find(b => b.id === form.companyId) || towCompanies[0];
    dispatch({
      type: 'ADD_TOW_JOB',
      payload: { ...form, companyId: company?.id, companyName: company?.name },
    });
    setShowForm(false);
  };

  const defaultCompany = visibleCompanies[0];

  return (
    <div className="flex-1 w-full min-w-0 h-full overflow-auto box-border px-4 py-5 sm:px-10 sm:py-7 font-ui bg-app-bg"
      style={{ background: 'radial-gradient(ellipse at 20% -10%, rgba(234,88,12,0.10) 0%, transparent 55%), var(--n-bg-app)' }}
    >
      {/* Header */}
      <div className="flex items-center flex-wrap gap-x-4 gap-y-3 mb-6 pb-[18px] border-b border-border-base">
        <div className="w-11 h-11 sm:w-[52px] sm:h-[52px] rounded-xl shrink-0 flex items-center justify-center bg-orange-500/15 border border-orange-500/30">
          <MdLocalShipping size={28} color="#f97316" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[19px] sm:text-[22px] font-extrabold text-white tracking-[-0.3px]">Tow CAD</div>
          <div className="text-[13px] text-cad-muted mt-0.5">Towing dispatch and job management</div>
        </div>
        {!showForm && (visibleCompanies.length > 0 || !isBusinessPortal) && (
          <button
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-bold cursor-pointer bg-orange-500 hover:bg-orange-400 text-white transition-colors border-0"
            onClick={() => setShowForm(true)}
          >
            <MdAdd size={18} /> New Job
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="flex gap-3 flex-wrap mb-6">
        {[
          { label: 'Active Jobs', val: counts.ACTIVE,     color: '#f97316' },
          { label: 'Pending',     val: counts.PENDING,    color: '#f59e0b' },
          { label: 'En Route',    val: counts.EN_ROUTE,   color: '#06b6d4' },
          { label: 'On Scene',    val: counts.ON_SCENE,   color: '#f97316' },
          { label: 'Completed',   val: counts.COMPLETED,  color: '#22c55e' },
        ].map(s => (
          <div key={s.label} className="flex-1 min-w-[110px] bg-app-card/70 border border-border-base rounded-xl px-4 py-4 flex flex-col gap-1">
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
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap mb-5 items-center">
        <MdFilterList size={18} className="text-slate-500 shrink-0" />
        {/* Status filters */}
        <div className="flex gap-1.5 flex-wrap">
          {['ALL', 'PENDING', 'DISPATCHED', 'EN_ROUTE', 'ON_SCENE', 'LOADED', 'COMPLETED', 'CANCELLED'].map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer border transition-all ${
                statusFilter === s
                  ? 'bg-orange-500 text-white border-transparent'
                  : 'bg-white/[0.04] text-slate-400 border-border-base hover:text-slate-200'
              }`}
            >
              {s === 'ALL' ? `All (${filtered.length})` : statusMeta(s).label}
            </button>
          ))}
        </div>
        {/* Company filter (only when multiple visible companies) */}
        {towCompanies.length > 1 && !isBusinessPortal && (
          <select
            className="bg-app-input border border-border-base rounded-lg px-3 py-1.5 text-[11.5px] text-cad-text outline-none focus:border-brand/60 transition-all ml-auto"
            value={companyFilter}
            onChange={e => setCompany(e.target.value)}
          >
            <option value="ALL">All companies</option>
            {towCompanies.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      {/* FDOT call linkage notice */}
      {towCompanies.some(b => b.isFDOT) && activeCalls.some(c => c.nature.includes('Road Hazard') || c.nature.includes('MVA')) && (
        <div className="flex items-start gap-3 mb-5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
          <MdWarning size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[12.5px] text-amber-300 leading-relaxed">
            <span className="font-bold">Active road incidents detected.</span> Road Hazard or MVA calls are in the dispatch queue * consider linking new tow jobs to those calls for coordinated response.
          </div>
        </div>
      )}

      {/* Job grid */}
      {filtered.length === 0 ? (
        <div className="bg-app-panel/80 border border-border-base rounded-xl p-12 text-center">
          <MdLocalShipping size={48} color="rgba(249,115,22,0.3)" className="mx-auto" />
          <div className="text-[15px] font-bold text-slate-100 mt-3">No tow jobs</div>
          <div className="text-sm text-slate-400 mt-1.5">
            {statusFilter !== 'ALL' ? 'Try changing the status filter.' : 'Create a new job to get started.'}
          </div>
          {!showForm && (
            <button
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-orange-500 hover:bg-orange-400 text-white transition-colors border-0 mt-4"
              onClick={() => setShowForm(true)}
            >
              <MdAdd size={16} /> New Tow Job
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: 14 }}>
          {filtered.map(job => (
            <JobCard
              key={job.id}
              job={job}
              companies={towCompanies}
              calls={activeCalls}
              dispatch={dispatch}
            />
          ))}
        </div>
      )}
    </div>
  );
}
