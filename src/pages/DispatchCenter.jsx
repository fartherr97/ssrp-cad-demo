import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCAD } from '../store/cadStore';
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
  MdLocationOn, MdDoNotDisturb, MdPowerSettingsNew, MdNotificationsActive,
} from 'react-icons/md';

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

function QuickAction({ Icon, label, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12.5px] font-semibold text-slate-200 bg-white/[0.03] hover:bg-white/[0.07] border border-border-base hover:border-border-strong cursor-pointer transition-all">
      <Icon size={17} className="text-brand-bright shrink-0" />
      <span className="text-left">{label}</span>
    </button>
  );
}

function Stat({ label, value, sub, color = '#ffffff' }) {
  return (
    <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-app-card/70 border border-border-base">
      <span className="text-[9.5px] font-bold uppercase tracking-[0.6px] text-slate-500">{label}</span>
      <span className="text-[26px] font-extrabold leading-none tabular-nums" style={{ color }}>{value}</span>
      {sub && <span className="text-[10px] text-slate-500">{sub}</span>}
    </div>
  );
}

const STATUS_BTNS = [
  { status: 'AVAILABLE',   label: 'Available',   Icon: MdCheckCircle      },
  { status: 'ENRT',        label: 'En Route',    Icon: MdDirectionsCar    },
  { status: 'BUSY',        label: 'Busy',        Icon: MdWarningAmber     },
  { status: 'ARRVD',       label: 'On Scene',    Icon: MdLocationOn       },
  { status: 'UNAVAILABLE', label: 'Unavailable', Icon: MdDoNotDisturb     },
  { status: 'OFFDUTY',     label: 'Off Duty',    Icon: MdPowerSettingsNew },
];

const NOTIF_COLOR = {
  alert: '#f87171', call: '#fb923c', unit: '#4ade80',
  status: '#5a97f5', dispatch: '#5a97f5', officer: '#4ade80',
  note: '#facc15', system: '#94a3b8', info: '#94a3b8',
};

const CALL_NATURES = [
  'Traffic Stop','Suspicious Person','Suspicious Vehicle','Domestic Disturbance',
  'Assault','Robbery','Burglary','MVA','MVA w/ Injuries','Medical Emergency',
  'Medical - Cardiac Arrest','Structure Fire','Vehicle Fire','Brush Fire',
  'Officer Needs Assistance','Pursuit','Noise Complaint','Check Welfare',
  'Armed Subject','Shooting','Stabbing','Shots Fired','Drug Activity',
  'Theft - Shoplifting','Road Hazard','Trespassing','Other',
];

export default function DispatchCenter() {
  const { state, dispatch } = useCAD();
  const { calls, officers, currentUser, selfDispatch, dispatchLog = [] } = state;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [priFilter, setPriFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [unitFilter, setUnitFilter] = useState('ALL');
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
  const showStatus   = currentUser?.portal !== 'civilian' && currentUser?.portal !== 'business';
  const isField      = currentUser?.portal === 'leo' || currentUser?.portal === 'fire';

  const me = officers.find(o => o.id === currentUser?.id);
  const myStatus = me?.status || 'OFFDUTY';
  const setStatus = (s) => dispatch({ type: 'SET_STATUS', payload: s });

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
            <QuickAction Icon={MdDescription} label="New Report" onClick={() => navigate('/forms')} />
            <QuickAction Icon={MdReceiptLong} label="Records" onClick={() => navigate('/records')} />
            <QuickAction Icon={MdSearch} label="Search" onClick={() => navigate('/search')} />
            <QuickAction Icon={MdMap} label="Live Map" onClick={() => navigate('/map')} />
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

          {/* Self-dispatch + status shortcuts */}
          {showStatus && (
            <div className="flex flex-col gap-2 p-3.5 bg-app-panel/80 border border-border-base rounded-xl backdrop-blur-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500 mb-0.5 px-1">My Status</div>
              {isField && (
                <button onClick={() => dispatch({ type: 'TOGGLE_SELF_DISPATCH' })}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold cursor-pointer transition-all border mb-1 ${selfDispatch ? 'bg-brand/15 border-brand/40 text-brand-bright' : 'bg-white/[0.03] border-border-base text-slate-300 hover:bg-white/[0.07]'}`}>
                  <MdGpsFixed size={16} /> Self-Dispatch {selfDispatch ? 'ON' : 'OFF'}
                </button>
              )}
              <div className="grid grid-cols-2 gap-1.5">
                {STATUS_BTNS.map(s => {
                  const on = myStatus === s.status;
                  const c = STATUS_COLORS[s.status];
                  return (
                    <button key={s.status} onClick={() => setStatus(s.status)}
                      className={`flex items-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-semibold cursor-pointer transition-all border ${on ? '' : 'border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'}`}
                      style={on ? { background: `${c}22`, borderColor: `${c}55`, color: c } : undefined}>
                      <s.Icon size={14} style={on ? { color: c } : undefined} /> {s.label}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => dispatch({
                type: 'PANIC',
                payload: { officerId: me?.id, unit: me?.unitId || currentUser?.badge || 'UNIT', name: me?.name || currentUser?.name, location: me?.location || 'LOCATION UNKNOWN' },
              })}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 mt-1 rounded-lg text-[12px] font-bold text-white bg-red-600 hover:bg-red-500 cursor-pointer transition-colors animate-pulse-red">
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
            <div className="overflow-auto max-h-[min(46vh,520px)]">
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
          </SectionCard>

          {/* Field units */}
          {showUnits && (
            <SectionCard title="Field Units" count={onDutyOfficers.length}
              action="View All" onAction={() => navigate('/units')}>
              <div className="overflow-auto max-h-[min(40vh,460px)]">
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
                          style={{ color: STATUS_COLORS[o.status] || '#fff' }}>{o.unitId}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={o.status} /></td>
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

      {/* Create Call Modal */}
      {showCreateForm && (
        <div className={S_OVERLAY} onClick={e => e.target === e.currentTarget && closeCreate()}>
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
                    {CALL_NATURES.map(n => <option key={n}>{n}</option>)}
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
              <button className={S_BTN_PRIMARY} onClick={createCall} disabled={!newCall.nature || !newCall.location}>
                Create Incident
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
