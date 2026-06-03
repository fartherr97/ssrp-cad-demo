import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCAD } from '../store/cadStore';
import { useToast } from '../contexts/ToastContext';
import { STATUS_COLORS } from '../constants/statusColors';
import { DeptTag } from '../constants/deptLogos';
import {
  S_FIELD, S_LABEL, S_SELECT, S_INPUT, S_TEXTAREA,
  S_BTN_PRIMARY, S_BTN_SECONDARY, S_BTN_GHOST, xs,
  S_OVERLAY, S_MODAL, S_MODAL_HEADER, S_MODAL_TITLE, S_MODAL_BODY, S_MODAL_FOOTER,
  cadStatus, CAD_STATUS_LABEL, cadCallStatus, cadPri, cadElapsed,
  trHoverOn, trHoverOff,
} from '../constants/styles';
import {
  MdAddCall, MdDescription, MdSearch, MdMap, MdReceiptLong, MdCampaign,
  MdGpsFixed, MdSos, MdCheckCircle, MdDirectionsCar, MdWarningAmber,
  MdLocationOn, MdDoNotDisturb, MdPowerSettingsNew, MdNotificationsActive, MdBadge,
  MdPhone, MdSend, MdClose, MdAdd, MdCircle, MdRadio,
} from 'react-icons/md';
import ModifyIdentifier from '../components/ModifyIdentifier';

/* ─── Elapsed timer ─── */
function Elapsed({ createdAt }) {
  const [elapsed, setElapsed] = useState('');
  const [cls, setCls] = useState('ok');
  useEffect(() => {
    const tick = () => {
      const s = Math.floor((Date.now() - createdAt) / 1000);
      const m = Math.floor(s / 60);
      const sec = s % 60;
      setElapsed(`${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`);
      setCls(m >= 15 ? 'crit' : m >= 8 ? 'warn' : 'ok');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  return <span className={`font-mono tabular-nums ${cadElapsed(cls)}`}>{elapsed}</span>;
}

const StatusBadge = ({ status }) => <span className={cadStatus(status)}>{CAD_STATUS_LABEL[status] || status}</span>;
const CallStatus  = ({ status }) => <span className={cadCallStatus(status)}>{status}</span>;
const PriBadge    = ({ p }) => <span className={cadPri(p)}>P{p}</span>;

// Icons are matched to the standard status codes; admin-defined custom codes
// fall back to a neutral dot. Labels/colors/order come from admin config.
const STATUS_ICONS = {
  AVAILABLE:   MdCheckCircle,
  ENRT:        MdDirectionsCar,
  BUSY:        MdWarningAmber,
  ARRVD:       MdLocationOn,
  UNAVAILABLE: MdDoNotDisturb,
  OFFDUTY:     MdPowerSettingsNew,
};

function DispatchStatusPicker({ unit, onSet, options }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button type="button" onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className="cursor-pointer" style={{ background: 'none', border: 'none', padding: 0 }}>
        <StatusBadge status={unit.status} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[49]" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 flex flex-col gap-0.5 p-1.5 rounded-xl shadow-2xl min-w-[130px]"
            style={{ background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.12)' }}>
            {options.map(s => {
              const on = unit.status === s.code;
              return (
                <button key={s.code} type="button"
                  onClick={e => { e.stopPropagation(); onSet(unit.unitId, s.code); setOpen(false); }}
                  className="text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold w-full"
                  style={{ cursor: 'pointer', background: on ? `${s.color}22` : 'transparent', border: 'none', color: on ? s.color : '#94a3b8' }}>
                  {s.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Small building blocks ─── */
function SectionCard({ title, count, action, onAction, children, className = '' }) {
  return (
    <section className={`flex flex-col bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm shadow-lg shadow-black/20 ${className}`}>
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border-faint shrink-0">
        <h2 className="text-[12px] font-bold uppercase tracking-[0.7px] text-slate-200">{title}</h2>
        {count != null && (
          <span className="px-1.5 py-0.5 rounded-md bg-brand/15 text-brand-bright text-[11px] font-bold leading-none">{count}</span>
        )}
        {action && (
          <button onClick={onAction}
            className="ml-auto text-[11px] font-semibold text-brand-bright hover:text-white cursor-pointer transition-colors">
            {action}
          </button>
        )}
      </header>
      {children}
    </section>
  );
}

/* Admin-configured 10-code radio reference (collapsible + searchable). */
function TenCodeReference({ codes }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  if (!codes.length) return null;
  const filtered = q.trim()
    ? codes.filter(c => c.code.toLowerCase().includes(q.toLowerCase()) || c.label.toLowerCase().includes(q.toLowerCase()))
    : codes;
  return (
    <div className="flex flex-col p-3.5 bg-app-panel/80 border border-border-base rounded-xl backdrop-blur-sm">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0 text-left">
        <MdRadio size={13} className="text-brand-bright" />
        <div className="text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500 flex-1">10-Codes</div>
        <span className="px-1.5 py-0.5 rounded-md bg-brand/15 text-brand-bright text-[10px] font-bold leading-none">{codes.length}</span>
        <MdAdd size={14} className={`text-slate-500 transition-transform duration-300 ${open ? 'rotate-45' : ''}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="flex flex-col gap-2 pt-2">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search codes…"
              tabIndex={open ? 0 : -1}
              className="w-full bg-app-input border border-border-base focus:border-brand/50 rounded-lg px-2.5 py-1.5 text-[11.5px] text-white placeholder:text-slate-600 outline-none" />
            <div className="flex flex-col gap-0.5 max-h-[260px] overflow-y-auto -mx-1 px-1">
              {filtered.map(c => (
                <div key={c.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04]">
                  <span className="font-mono font-bold text-[11px] text-brand-bright shrink-0 w-12">{c.code}</span>
                  <span className="text-[11.5px] text-slate-300 truncate">{c.label}</span>
                </div>
              ))}
              {filtered.length === 0 && <div className="text-center text-slate-600 text-[11px] py-2">No codes match</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ Icon, label, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12.5px] font-normal text-slate-200 bg-white/[0.03] hover:bg-white/[0.07] border border-border-base hover:border-border-strong cursor-pointer transition-all">
      <Icon size={17} className="text-brand-bright shrink-0" />
      <span className="text-left">{label}</span>
    </button>
  );
}

function Stat({ label, value, color = '#ffffff' }) {
  return (
    <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-app-card/70 border border-border-base">
      <span className="text-[9.5px] font-bold uppercase tracking-[0.6px] text-slate-500">{label}</span>
      <span className="text-[26px] font-extrabold leading-none tabular-nums" style={{ color }}>{value}</span>
    </div>
  );
}

const NOTIF_COLOR = {
  alert: '#f87171', call: '#fb923c', unit: '#4ade80',
  status: '#5a97f5', dispatch: '#5a97f5', officer: '#4ade80',
  note: '#facc15', system: '#94a3b8', info: '#94a3b8',
};


/* ─── 911 urgency timer card ─── */
function IncomingCallCard({ call, onDispatch, onDismiss }) {
  const [elapsed, setElapsed] = useState('00:00');
  const [urgency, setUrgency] = useState(0);
  useEffect(() => {
    const tick = () => {
      const s = Math.floor((Date.now() - call.receivedAt) / 1000);
      const m = Math.floor(s / 60);
      const sec = s % 60;
      setElapsed(`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`);
      setUrgency(m >= 5 ? 2 : m >= 2 ? 1 : 0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [call.receivedAt]);
  const bg    = ['rgba(255,255,255,0.04)','rgba(251,146,60,0.10)','rgba(248,113,113,0.13)'][urgency];
  const bdr   = ['rgba(255,255,255,0.07)','rgba(251,146,60,0.35)','rgba(248,113,113,0.45)'][urgency];
  const clr   = ['#94a3b8','#fb923c','#f87171'][urgency];
  return (
    <div className="rounded-lg p-2.5 flex flex-col gap-1.5" style={{ background: bg, border: `1px solid ${bdr}` }}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-white leading-snug line-clamp-2">{call.message}</div>
          <div className="text-[10.5px] text-slate-400 truncate mt-0.5">{call.location}</div>
        </div>
        <span className="font-mono text-[11px] font-bold shrink-0 mt-0.5" style={{ color: clr }}>{elapsed}</span>
      </div>
      {call.caller && (
        <div className="text-[10px] text-slate-500">
          Caller: <span className="text-slate-400">{call.caller}</span>
          {call.callbackNumber && <span className="ml-1 text-slate-600">· {call.callbackNumber}</span>}
        </div>
      )}
      <div className="flex gap-1.5 mt-0.5">
        <button onClick={onDispatch}
          className="press flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors"
          style={{ background: 'rgba(58,136,232,0.22)', border: '1px solid rgba(58,136,232,0.38)', color: '#93c5fd' }}>
          <MdSend size={11} /> Dispatch
        </button>
        <button onClick={onDismiss}
          className="px-2 py-1 rounded-md text-slate-500 hover:text-red-400 cursor-pointer transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <MdClose size={13} />
        </button>
      </div>
    </div>
  );
}

/* ─── Create call from 911 ─── */
function Dispatch911Modal({ call, onClose }) {
  const { state, dispatch } = useCAD();
  const { callNatures = [] } = state;
  const toast = useToast();
  const [form, setForm] = useState({
    nature: '',
    location: call.location || '',
    city: 'Tampa',
    priority: call.priority || 1,
    category: 'police',
    description: call.message || '',
    reportingParty: call.caller ? `911 - ${call.caller}${call.callbackNumber ? ` (${call.callbackNumber})` : ''}` : '911 Caller',
  });
  const submit = () => {
    if (!form.nature || !form.location) return;
    dispatch({ type: 'CREATE_CALL', payload: { ...form, status: 'PENDING' } });
    toast.success(`${form.nature} dispatched`, { title: 'Incident created' });
    dispatch({ type: 'REMOVE_INCOMING_911', payload: call.id });
    onClose();
  };
  return (
    <div className={`${S_OVERLAY} anim-overlay-in`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`${S_MODAL} max-w-[600px]`}>
        <div className={S_MODAL_HEADER}>
          <div className={`${S_MODAL_TITLE} flex items-center gap-2`}>
            <MdPhone size={16} className="text-red-400 shrink-0" /> Dispatch 911 Call
          </div>
          <button className={xs(S_BTN_GHOST)} onClick={onClose}>✕</button>
        </div>
        <div className={S_MODAL_BODY}>
          {/* caller summary */}
          <div className="px-3 py-2.5 rounded-lg mb-3 text-[12px] text-slate-300 leading-relaxed"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
            <span className="font-semibold text-red-400 mr-1">911 Message:</span>{call.message}
          </div>
          <div className="n-grid-2">
            <div className={S_FIELD}>
              <label className={S_LABEL}>Nature of Call *</label>
              <select className={S_SELECT} value={form.nature} onChange={e => setForm(p => ({ ...p, nature: e.target.value }))}>
                <option value="">Select nature...</option>
                {callNatures.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
              </select>
            </div>
            <div className={S_FIELD}>
              <label className={S_LABEL}>Priority</label>
              <select className={S_SELECT} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: Number(e.target.value) }))}>
                <option value={1}>P1 — Critical / Life Safety</option>
                <option value={2}>P2 — High</option>
                <option value={3}>P3 — Medium</option>
                <option value={4}>P4 — Low / Routine</option>
              </select>
            </div>
          </div>
          <div className="n-grid-2">
            <div className={S_FIELD}>
              <label className={S_LABEL}>Category</label>
              <select className={S_SELECT} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                <option value="police">Law Enforcement</option>
                <option value="fire">Fire / EMS</option>
                <option value="traffic">Traffic / FDOT</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className={S_FIELD}>
              <label className={S_LABEL}>City</label>
              <select className={S_SELECT} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
                {['Tampa','Brandon','Plant City','Riverview','Ruskin','Gibsonton','Temple Terrace','Unincorporated'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className={S_FIELD}>
            <label className={S_LABEL}>Location / Address *</label>
            <input className={S_INPUT} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Address or cross-streets" />
          </div>
          <div className={S_FIELD}>
            <label className={S_LABEL}>Reporting Party</label>
            <input className={S_INPUT} value={form.reportingParty} onChange={e => setForm(p => ({ ...p, reportingParty: e.target.value }))} />
          </div>
          <div className={S_FIELD}>
            <label className={S_LABEL}>Incident Narrative</label>
            <textarea className={S_TEXTAREA} rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
        </div>
        <div className={S_MODAL_FOOTER}>
          <button className={S_BTN_SECONDARY} onClick={onClose}>Cancel</button>
          <button className={`press ${S_BTN_PRIMARY}`} onClick={submit} disabled={!form.nature || !form.location}>
            Create Incident
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Simulate an incoming 911 ─── */
function Sim911Modal({ onClose }) {
  const { dispatch } = useCAD();
  const toast = useToast();
  const [form, setForm] = useState({ message: '', location: '', caller: '', callbackNumber: '', priority: 2 });
  const submit = () => {
    if (!form.message) return;
    dispatch({ type: 'ADD_INCOMING_911', payload: {
      id: `inc_${Date.now()}`,
      caller: form.caller || 'Anonymous',
      callbackNumber: form.callbackNumber || null,
      message: form.message,
      location: form.location,
      receivedAt: Date.now(),
      priority: Number(form.priority),
    }});
    toast.info('Incoming 911 call queued');
    onClose();
  };
  return (
    <div className={`${S_OVERLAY} anim-overlay-in`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`${S_MODAL} max-w-[480px]`}>
        <div className={S_MODAL_HEADER}>
          <div className={`${S_MODAL_TITLE} flex items-center gap-2`}>
            <MdPhone size={16} className="text-red-400 shrink-0" /> Simulate 911 Call
          </div>
          <button className={xs(S_BTN_GHOST)} onClick={onClose}>✕</button>
        </div>
        <div className={S_MODAL_BODY}>
          <div className={S_FIELD}>
            <label className={S_LABEL}>911 Message *</label>
            <textarea className={S_TEXTAREA} rows={3} placeholder="What the caller says..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
          </div>
          <div className={S_FIELD}>
            <label className={S_LABEL}>Location</label>
            <input className={S_INPUT} placeholder="Address or area" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
          </div>
          <div className="n-grid-2">
            <div className={S_FIELD}>
              <label className={S_LABEL}>Caller Name</label>
              <input className={S_INPUT} placeholder="Anonymous" value={form.caller} onChange={e => setForm(p => ({ ...p, caller: e.target.value }))} />
            </div>
            <div className={S_FIELD}>
              <label className={S_LABEL}>Callback #</label>
              <input className={S_INPUT} placeholder="555-0000" value={form.callbackNumber} onChange={e => setForm(p => ({ ...p, callbackNumber: e.target.value }))} />
            </div>
          </div>
          <div className={S_FIELD}>
            <label className={S_LABEL}>Priority</label>
            <select className={S_SELECT} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
              <option value={1}>P1 — Critical</option>
              <option value={2}>P2 — High</option>
              <option value={3}>P3 — Medium</option>
              <option value={4}>P4 — Low</option>
            </select>
          </div>
        </div>
        <div className={S_MODAL_FOOTER}>
          <button className={S_BTN_SECONDARY} onClick={onClose}>Cancel</button>
          <button className={`press ${S_BTN_PRIMARY}`} onClick={submit} disabled={!form.message}>Add to Queue</button>
        </div>
      </div>
    </div>
  );
}

export default function DispatchCenter() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const { calls, officers, currentUser, selfDispatch, dispatchLog = [], incoming911 = [],
    unitStatusCodes = [], tenCodes = [], callNatures = [] } = state;
  // Status menu/badges are driven by admin-configured unit status codes.
  const statusOptions = unitStatusCodes.map(s => ({ ...s, Icon: STATUS_ICONS[s.code] || MdCircle }));
  const statusColor = (code) => unitStatusCodes.find(s => s.code === code)?.color || STATUS_COLORS[code] || '#fff';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [priFilter, setPriFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [unitFilter, setUnitFilter] = useState('ALL');
  const [showIdentifier, setShowIdentifier] = useState(false);
  const [dispatchTarget, setDispatchTarget] = useState(null);
  const [showSim911, setShowSim911] = useState(false);
  const [newCall, setNewCall] = useState({
    nature:'', location:'', city:'Tampa', county:'Hillsborough',
    priority:1, category:'police', description:'', reportingParty:'',
  });

  const showCreateForm = searchParams.get('new') === '1';
  const openCreate  = () => setSearchParams({ new:'1' });
  const closeCreate = () => setSearchParams({});

  const isDispatcher = currentUser?.portal === 'dispatch' || currentUser?.portal === 'admin';
  const canDispatch  = isDispatcher || selfDispatch;
  const showUnits    = canDispatch;
  const showStatus   = !isDispatcher && currentUser?.portal !== 'civilian' && currentUser?.portal !== 'business';
  const isField      = currentUser?.portal === 'leo' || currentUser?.portal === 'fire';

  const me = officers.find(o => o.id === currentUser?.id);
  const myStatus = me?.status || 'OFFDUTY';
  const statusLabel = (code) => unitStatusCodes.find(s => s.code === code)?.label || CAD_STATUS_LABEL[code] || code;
  const setStatus = (s) => {
    dispatch({ type: 'SET_STATUS', payload: s });
    toast.info(`Status set to ${statusLabel(s)}`, { color: statusColor(s) });
  };
  const setUnitStatus = (unitId, s) => {
    dispatch({ type: 'SET_UNIT_STATUS', payload: { unitId, status: s } });
    toast.info(`${unitId} → ${statusLabel(s)}`, { color: statusColor(s) });
  };

  const activeCalls = calls.filter(c => c.status !== 'CLOSED' && c.status !== 'CANCELLED');
  const filteredCalls = activeCalls.filter(c =>
    (priFilter === 'ALL' || c.priority === Number(priFilter)) &&
    (statusFilter === 'ALL' || c.status === statusFilter)
  );
  const sortedCalls = [...filteredCalls].sort((a,b) => a.priority - b.priority);

  const onDutyOfficers = officers.filter(o => o.status !== 'OFFDUTY');
  const filteredUnits = unitFilter === 'ALL'
    ? onDutyOfficers
    : onDutyOfficers.filter(o => o.status === unitFilter || o.deptShort === unitFilter);

  const createCall = () => {
    if (!newCall.nature || !newCall.location) return;
    dispatch({ type:'CREATE_CALL', payload:{ ...newCall, status:'PENDING' } });
    toast.success(`${newCall.nature} created`, { title: 'Incident created' });
    setNewCall({ nature:'', location:'', city:'Tampa', county:'Hillsborough', priority:1, category:'police', description:'', reportingParty:'' });
    closeCreate();
  };

  // ── Stats ──
  const p1Count        = activeCalls.filter(c => c.priority === 1).length;
  const pendingCount   = activeCalls.filter(c => c.status === 'PENDING').length;
  const availCount     = officers.filter(o => o.status === 'AVAILABLE').length;
  const busyCount      = officers.filter(o => o.status === 'BUSY' || o.status === 'ARRVD').length;
  const enrtCount      = officers.filter(o => o.status === 'ENRT').length;
  const fleet          = onDutyOfficers.length || 1;
  const pct            = (n) => `${Math.round((n / fleet) * 100)}% of fleet`;

  const notifications = [...dispatchLog].slice(-7).reverse();

  // ════════════════════════════════════════════
  return (
    <div className="flex-1 overflow-auto p-4 lg:p-5">
      <div className="grid gap-4 lg:gap-5 grid-cols-1 xl:grid-cols-[clamp(220px,17vw,260px)_minmax(0,1fr)_clamp(280px,21vw,340px)]">

        {/* ─────────── LEFT RAIL ─────────── */}
        <aside className="flex flex-col gap-4 order-2 xl:order-none">
          {/* Quick actions */}
          <div className="flex flex-col gap-2 p-3.5 bg-app-panel/80 border border-border-base rounded-xl backdrop-blur-sm">
            <div className="text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500 mb-0.5 px-1">Quick Actions</div>
            {canDispatch && <QuickAction Icon={MdAddCall} label="Create Call" onClick={openCreate} />}
            {!isDispatcher && <QuickAction Icon={MdBadge} label="Swap Identifier" onClick={() => setShowIdentifier(true)} />}
            {!isDispatcher && <QuickAction Icon={MdDescription} label="New Report" onClick={() => navigate('/forms')} />}
            {!isDispatcher && <QuickAction Icon={MdReceiptLong} label="Records" onClick={() => navigate('/records')} />}
            <QuickAction Icon={MdSearch} label="Search" onClick={() => navigate('/search')} />
            <QuickAction Icon={MdMap} label="Live Map" onClick={() => navigate('/map')} />
            {showIdentifier && <ModifyIdentifier onClose={() => setShowIdentifier(false)} />}
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 p-3.5 bg-app-panel/80 border border-border-base rounded-xl backdrop-blur-sm">
            <div className="text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500 px-1">Filters</div>
            <div className={S_FIELD}>
              <label className={S_LABEL}>Priority</label>
              <select className={S_SELECT} value={priFilter} onChange={e => setPriFilter(e.target.value)}>
                <option value="ALL">All Priorities</option>
                <option value="1">P1 — Critical</option>
                <option value="2">P2 — High</option>
                <option value="3">P3 — Medium</option>
                <option value="4">P4 — Low</option>
              </select>
            </div>
            <div className={S_FIELD}>
              <label className={S_LABEL}>Status</label>
              <select className={S_SELECT} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="ENRT">En Route</option>
                <option value="ONSCENE">On Scene</option>
              </select>
            </div>
          </div>

          {/* 10-code radio reference (admin-configured) */}
          <TenCodeReference codes={tenCodes} />

          {/* Incoming 911 — dispatcher only */}
          {isDispatcher && (
            <div className="flex flex-col gap-2 p-3.5 bg-app-panel/80 border border-border-base rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-1.5 mb-0.5">
                <MdPhone size={13} className="text-red-400" />
                <div className="text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500 flex-1">Incoming 911</div>
                {incoming911.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[10px] font-bold leading-none">{incoming911.length}</span>
                )}
                <button onClick={() => setShowSim911(true)}
                  className="ml-1 p-0.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/[0.07] cursor-pointer transition-colors"
                  title="Simulate 911">
                  <MdAdd size={14} />
                </button>
              </div>
              {incoming911.length === 0 ? (
                <div className="text-center text-slate-600 text-[11px] py-2">No incoming calls</div>
              ) : [...incoming911].map(c => (
                <IncomingCallCard key={c.id} call={c}
                  onDispatch={() => setDispatchTarget(c)}
                  onDismiss={() => dispatch({ type: 'REMOVE_INCOMING_911', payload: c.id })} />
              ))}
            </div>
          )}

          {/* Self-dispatch + status shortcuts */}
          {showStatus && (
            <div className="flex flex-col gap-2 p-3.5 bg-app-panel/80 border border-border-base rounded-xl backdrop-blur-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500 mb-0.5 px-1">My Status</div>
              {isField && (
                <button onClick={() => dispatch({ type: 'TOGGLE_SELF_DISPATCH' })}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold cursor-pointer transition-all border mb-1 ${selfDispatch ? 'bg-brand/15 border-brand/40 text-brand-bright' : 'bg-white/[0.03] border-border-base text-slate-300 hover:bg-white/[0.07]'}`}>
                  <MdGpsFixed size={16} /> Self-Dispatch {selfDispatch ? 'ON' : 'OFF'}
                </button>
              )}
              <div className="grid grid-cols-2 gap-1.5">
                {statusOptions.map(s => {
                  const on = myStatus === s.code;
                  const c = s.color;
                  return (
                    <button key={s.code} onClick={() => setStatus(s.code)}
                      className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-semibold cursor-pointer transition-all border ${on ? '' : 'border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'}`}
                      style={on ? { background: `${c}22`, borderColor: `${c}55`, color: c } : undefined}>
                      <s.Icon size={14} style={on ? { color: c } : undefined} /> {s.label}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => {
                const mockCoords = [
                  { x:  428,  y:  -980, z:  30, area: 'Mission Row'    },
                  { x: -640,  y:  -820, z:  23, area: 'Del Perro'      },
                  { x: 1960,  y:  3740, z:  32, area: 'Sandy Shores'   },
                  { x: -2000, y:   700, z: 140, area: 'Vinewood Hills' },
                  { x:  120,  y: -1630, z:  30, area: 'Strawberry'     },
                  { x: -1034, y: -2733, z:  20, area: 'LSIA'           },
                  { x: -140,  y:  6280, z:  31, area: 'Paleto Bay'     },
                  { x: 1140,  y:  2660, z:  45, area: 'Route 68'       },
                ];
                const c = mockCoords[Math.floor(Math.random() * mockCoords.length)];
                const unit = me?.unitId || currentUser?.badge || 'UNIT';
                const location = me?.location || c.area;
                dispatch({
                  type: 'PANIC',
                  payload: { officerId: me?.id, unit, name: me?.name || currentUser?.name, location, x: c.x, y: c.y, z: c.z },
                });
                toast.error(`${unit} — ${location}`, { title: 'PANIC — Officer in Distress' });
              }}
                className="press w-full flex items-center justify-center gap-2 px-3 py-2.5 mt-1 rounded-lg text-[12px] font-bold text-white bg-red-600 hover:bg-red-500 cursor-pointer transition-colors animate-pulse-red">
                <MdSos size={16} /> Panic Alert
              </button>
            </div>
          )}
        </aside>

        {/* ─────────── CENTER ─────────── */}
        <div className="flex flex-col gap-4 lg:gap-5 min-w-0 order-1 xl:order-none">
          {/* Active calls */}
          <SectionCard title="Active Calls" count={sortedCalls.length}
            action="View All" onAction={() => navigate('/board')}>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-auto max-h-[min(46vh,520px)]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-app-bg/40">
                    {['CALL #','NATURE','LOCATION','CITY','PRI','STATUS','ELAPSED','UNITS'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 border-b border-border-base sticky top-0 bg-app-panel z-[1] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedCalls.length === 0 ? (
                    <tr><td colSpan={8}><div className="p-8 text-center text-slate-600 text-[12px]">No active calls</div></td></tr>
                  ) : sortedCalls.map(c => {
                    const priColor = { 1:'#f87171', 2:'#fb923c', 3:'#facc15', 4:'#4ade80' }[c.priority] || 'transparent';
                    return (
                      <tr key={c.id}
                        className="cursor-pointer transition-colors"
                        style={{ borderLeft:`3px solid ${priColor}`, borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}
                        onClick={() => navigate('/cad/' + c.id)}>
                        <td className="px-4 py-2.5 text-[12.5px] font-mono font-bold text-white whitespace-nowrap">{c.id}</td>
                        <td className="px-4 py-2.5 text-[12.5px] font-semibold text-white whitespace-nowrap">{c.nature}</td>
                        <td className="px-4 py-2.5 text-[12.5px] text-slate-300 max-w-[200px] truncate">{c.location}</td>
                        <td className="px-4 py-2.5 text-[12.5px] text-slate-400 whitespace-nowrap">{c.city}</td>
                        <td className="px-4 py-2.5"><PriBadge p={c.priority} /></td>
                        <td className="px-4 py-2.5"><CallStatus status={c.status} /></td>
                        <td className="px-4 py-2.5 text-[12px]">{c.createdAt ? <Elapsed createdAt={c.createdAt} /> : <span className="text-slate-600">—</span>}</td>
                        <td className={`px-4 py-2.5 text-[12px] font-mono whitespace-nowrap ${c.units.length > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                          {c.units.length > 0 ? c.units.join(', ') : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="lg:hidden flex flex-col divide-y divide-border-faint max-h-[60vh] overflow-auto">
              {sortedCalls.length === 0 ? (
                <div className="p-8 text-center text-slate-600 text-[12px]">No active calls</div>
              ) : sortedCalls.map(c => {
                const priColor = { 1:'#f87171', 2:'#fb923c', 3:'#facc15', 4:'#4ade80' }[c.priority] || '#94a3b8';
                return (
                  <div key={c.id} onClick={() => navigate('/cad/' + c.id)}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.03] transition-colors"
                    style={{ borderLeft: `3px solid ${priColor}` }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-[13px] font-bold text-white">{c.nature}</span>
                        <PriBadge p={c.priority} />
                        <CallStatus status={c.status} />
                      </div>
                      <div className="text-[11.5px] text-slate-400 truncate">{c.location}{c.city ? ` · ${c.city}` : ''}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-mono text-[10.5px] text-slate-500">{c.id}</span>
                        {c.createdAt && <span className="text-[10.5px]"><Elapsed createdAt={c.createdAt} /></span>}
                        {c.units.length > 0 && <span className="text-[10.5px] font-mono text-emerald-400">{c.units.join(', ')}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Field units */}
          {showUnits && (
            <SectionCard title="Field Units" count={onDutyOfficers.length}>
              {/* Desktop table */}
              <div className="hidden lg:block overflow-auto max-h-[min(40vh,460px)]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-app-bg/40">
                      {['UNIT','STATUS','CALL #','AGENCY','LOCATION','OFFICER'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 border-b border-border-base sticky top-0 bg-app-panel z-[1] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUnits.length === 0 ? (
                      <tr><td colSpan={6}><div className="p-8 text-center text-slate-600 text-[12px]">No units on duty</div></td></tr>
                    ) : filteredUnits.map(o => (
                      <tr key={o.id}
                        className={`${o.callId ? 'cursor-pointer' : ''} transition-colors`}
                        style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}
                        onClick={() => o.callId && navigate('/cad/' + o.callId)}>
                        <td className="px-4 py-2.5 text-[12.5px] font-mono font-bold text-white whitespace-nowrap"
                          style={{ color: statusColor(o.status) }}>{o.unitId}</td>
                        <td className="px-4 py-2.5">
                          {isDispatcher
                            ? <DispatchStatusPicker unit={o} options={statusOptions} onSet={setUnitStatus} />
                            : <StatusBadge status={o.status} />}
                        </td>
                        <td className={`px-4 py-2.5 text-[12px] font-mono font-semibold whitespace-nowrap ${o.callId ? 'text-amber-300' : 'text-slate-600'}`}>{o.callId || '—'}</td>
                        <td className="px-4 py-2.5 text-[12.5px] whitespace-nowrap"><DeptTag code={o.deptShort} /></td>
                        <td className="px-4 py-2.5 text-[12.5px] text-slate-400 max-w-[200px] truncate">{o.location}</td>
                        <td className="px-4 py-2.5 text-[12.5px] text-white whitespace-nowrap">
                          {o.name}{o.rank && <span className="text-slate-500 ml-1">· {o.rank}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="lg:hidden flex flex-col divide-y divide-border-faint max-h-[55vh] overflow-auto">
                {filteredUnits.length === 0 ? (
                  <div className="p-8 text-center text-slate-600 text-[12px]">No units on duty</div>
                ) : filteredUnits.map(o => (
                  <div key={o.id}
                    onClick={() => o.callId && navigate('/cad/' + o.callId)}
                    className={`flex items-center gap-3 px-4 py-3 ${o.callId ? 'cursor-pointer' : ''} hover:bg-white/[0.03] transition-colors`}>
                    <div className="shrink-0 text-center min-w-[44px]">
                      <div className="text-[14px] font-mono font-bold" style={{ color: statusColor(o.status) }}>{o.unitId}</div>
                      <div className="mt-0.5"><DeptTag code={o.deptShort} /></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        {isDispatcher
                          ? <DispatchStatusPicker unit={o} options={statusOptions} onSet={setUnitStatus} />
                          : <StatusBadge status={o.status} />}
                        {o.callId && <span className="font-mono text-[11px] font-semibold text-amber-300">{o.callId}</span>}
                      </div>
                      <div className="text-[12.5px] text-white truncate">
                        {o.name}{o.rank && <span className="text-slate-500 ml-1">· {o.rank}</span>}
                      </div>
                      {o.location && <div className="text-[11px] text-slate-500 truncate mt-0.5">{o.location}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* ─────────── RIGHT RAIL ─────────── */}
        <aside className="flex flex-col gap-4 order-3 xl:order-none">
          {/* Status overview */}
          <div className="flex flex-col gap-3 p-3.5 bg-app-panel/80 border border-border-base rounded-xl backdrop-blur-sm">
            <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-slate-200">Status Overview</div>
            <div className="grid grid-cols-2 gap-2.5">
              <Stat label="Active Calls"    value={activeCalls.length} sub={p1Count > 0 ? `${p1Count} priority 1` : 'all clear'} color="#5a97f5" />
              <Stat label="Pending Calls"   value={pendingCount} sub="awaiting unit" color="#fb923c" />
              <Stat label="Units Available" value={availCount} sub={pct(availCount)} color="#4ade80" />
              <Stat label="Units Busy"      value={busyCount}  sub={pct(busyCount)} color="#f87171" />
              <Stat label="Units En Route"  value={enrtCount}  sub={pct(enrtCount)} color="#a78bfa" />
              <Stat label="On Duty"         value={onDutyOfficers.length} sub="total fleet" color="#ffffff" />
            </div>
          </div>

          {/* Notifications */}
          <div className="flex flex-col bg-app-panel/80 border border-border-base rounded-xl backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2 px-3.5 py-3 border-b border-border-faint">
              <MdNotificationsActive size={15} className="text-brand-bright" />
              <span className="text-[11px] font-bold uppercase tracking-[0.7px] text-slate-200">Notifications</span>
            </div>
            <div className="flex flex-col max-h-[420px] overflow-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-600 text-[12px]">No recent activity</div>
              ) : notifications.map(n => (
                <div key={n.id} className="flex items-start gap-2.5 px-3.5 py-2.5 border-b border-border-faint last:border-0 hover:bg-white/[0.03] transition-colors">
                  <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: NOTIF_COLOR[n.kind] || '#94a3b8' }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] text-slate-300 leading-snug">{n.text}</div>
                    <div className="text-[10px] text-slate-600 font-mono mt-0.5">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Dispatch 911 Modal */}
      {dispatchTarget && (
        <Dispatch911Modal call={dispatchTarget} onClose={() => setDispatchTarget(null)} />
      )}

      {/* Simulate 911 Modal */}
      {showSim911 && (
        <Sim911Modal onClose={() => setShowSim911(false)} />
      )}

      {/* Create Call Modal */}
      {showCreateForm && (
        <div className={`${S_OVERLAY} anim-overlay-in`} onClick={e => e.target === e.currentTarget && closeCreate()}>
          <div className={`${S_MODAL} max-w-[640px]`}>
            <div className={S_MODAL_HEADER}>
              <div className={S_MODAL_TITLE}>Create New Incident</div>
              <button className={xs(S_BTN_GHOST)} onClick={closeCreate}>✕</button>
            </div>
            <div className={S_MODAL_BODY}>
              <div className="n-grid-2">
                <div className={S_FIELD}>
                  <label className={S_LABEL}>Nature of Call *</label>
                  <select className={S_SELECT} value={newCall.nature} onChange={e => setNewCall(p => ({ ...p, nature:e.target.value }))}>
                    <option value="">Select nature...</option>
                    {callNatures.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                  </select>
                </div>
                <div className={S_FIELD}>
                  <label className={S_LABEL}>Priority</label>
                  <select className={S_SELECT} value={newCall.priority} onChange={e => setNewCall(p => ({ ...p, priority:Number(e.target.value) }))}>
                    <option value={1}>P1 — Critical / Life Safety</option>
                    <option value={2}>P2 — High</option>
                    <option value={3}>P3 — Medium</option>
                    <option value={4}>P4 — Low / Routine</option>
                  </select>
                </div>
              </div>
              <div className="n-grid-2">
                <div className={S_FIELD}>
                  <label className={S_LABEL}>Category</label>
                  <select className={S_SELECT} value={newCall.category} onChange={e => setNewCall(p => ({ ...p, category:e.target.value }))}>
                    <option value="police">Law Enforcement</option>
                    <option value="fire">Fire / EMS</option>
                    <option value="traffic">Traffic / FDOT</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className={S_FIELD}>
                  <label className={S_LABEL}>City</label>
                  <select className={S_SELECT} value={newCall.city} onChange={e => setNewCall(p => ({ ...p, city:e.target.value }))}>
                    {['Tampa','Brandon','Plant City','Riverview','Ruskin','Gibsonton','Temple Terrace','Unincorporated'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className={S_FIELD}>
                <label className={S_LABEL}>Location / Address *</label>
                <input className={S_INPUT} placeholder="e.g. 412 Oakwood Ave / I-275 MM 42 SB" value={newCall.location} onChange={e => setNewCall(p => ({ ...p, location:e.target.value }))} />
              </div>
              <div className={S_FIELD}>
                <label className={S_LABEL}>Reporting Party</label>
                <input className={S_INPUT} placeholder="911 Caller / Officer / FDOT / Dispatch..." value={newCall.reportingParty} onChange={e => setNewCall(p => ({ ...p, reportingParty:e.target.value }))} />
              </div>
              <div className={S_FIELD}>
                <label className={S_LABEL}>Incident Narrative</label>
                <textarea className={S_TEXTAREA} rows={3} placeholder="Describe the incident..." value={newCall.description} onChange={e => setNewCall(p => ({ ...p, description:e.target.value }))} />
              </div>
            </div>
            <div className={S_MODAL_FOOTER}>
              <button className={S_BTN_SECONDARY} onClick={closeCreate}>Cancel</button>
              <button className={`press ${S_BTN_PRIMARY}`} onClick={createCall} disabled={!newCall.nature || !newCall.location}>
                Create Incident
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
