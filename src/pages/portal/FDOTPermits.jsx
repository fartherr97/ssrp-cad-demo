import { useState } from 'react';
import Select from '../../components/ui/Select';
import { useCAD } from '../../store/cadStore';
import { useToast } from '../../contexts/ToastContext';
import { useResponsive } from '../../hooks/useResponsive';
import {
  MdVerifiedUser, MdAdd, MdBlock, MdClose, MdArrowBack, MdCheck,
  MdPerson, MdSearch,
} from 'react-icons/md';
import { useActiveBusiness } from '../../contexts/BusinessContext';
import AccessDenied from './AccessDenied';

const PERMIT_TYPES = [
  'Roadwork / Construction', 'Lane Closure', 'Utility Work',
  'Event / Filming', 'Emergency Access', 'Oversize Load Transit',
];

function permitStatus(p) {
  if (p.status === 'REVOKED') return 'REVOKED';
  if (p.expiresAt && new Date(p.expiresAt) < new Date()) return 'EXPIRED';
  return 'ACTIVE';
}

const STATUS_CFG = {
  ACTIVE:   { color: '#22c55e', bg: 'rgba(34,197,94,0.10)'  },
  EXPIRED:  { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)'},
  REVOKED:  { color: '#ef4444', bg: 'rgba(239,68,68,0.10)'  },
};

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.ACTIVE;
  return (
    <span className="text-[9.5px] font-bold px-2 py-0.5 rounded"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.color}30` }}>
      {status}
    </span>
  );
}

function FInput({ label, value, onChange, placeholder, mono, span2, type = 'text', textarea }) {
  const cls = `w-full text-[12.5px] text-white rounded-lg px-3 py-2 outline-none resize-none ${mono ? 'font-mono' : ''}`;
  const sty = { background: '#111e2d', border: '1px solid rgba(255,255,255,0.10)' };
  return (
    <div className={span2 ? 'col-span-1 sm:col-span-2' : ''}>
      <div className="text-[9.5px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1.5">{label}</div>
      {textarea
        ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} style={sty} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} style={sty} />}
    </div>
  );
}

function FSelect({ label, value, onChange, options, span2 }) {
  return (
    <div className={span2 ? 'col-span-1 sm:col-span-2' : ''}>
      <div className="text-[9.5px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1.5">{label}</div>
      <Select value={value} onChange={e => onChange(e.target.value)}
        className="w-full text-[12.5px] text-white rounded-lg px-3 py-2 outline-none"
        style={{ background: '#111e2d', border: '1px solid rgba(255,255,255,0.10)' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </Select>
    </div>
  );
}

/* Holder field with civilian auto-lookup. Pick an existing character from the
   dropdown, or just keep typing any name / company manually. */
function HolderLookup({ value, onChange, civilians }) {
  const [open, setOpen] = useState(false);
  const q = (value || '').trim().toLowerCase();
  const matches = q.length >= 1
    ? civilians.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(q)).slice(0, 6)
    : [];
  const exact = civilians.some(c => `${c.firstName} ${c.lastName}`.toLowerCase() === q);
  const showList = open && matches.length > 0 && !exact;
  return (
    <div className="col-span-1 sm:col-span-2 relative">
      <div className="text-[9.5px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1.5">Holder Name / Company</div>
      <div className="relative">
        <MdSearch size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
        <input
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search a civilian, or type any name / company"
          className="w-full text-[12.5px] text-white rounded-lg pl-8 pr-3 py-2 outline-none"
          style={{ background: '#111e2d', border: '1px solid rgba(255,255,255,0.10)' }}
        />
      </div>
      {showList && (
        <div className="absolute z-30 left-0 right-0 mt-1 rounded-lg overflow-hidden max-h-52 overflow-y-auto"
          style={{ background: '#0c1828', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 10px 28px rgba(0,0,0,0.55)' }}>
          {matches.map(c => (
            <button key={c.id} type="button"
              onMouseDown={e => { e.preventDefault(); onChange(`${c.firstName} ${c.lastName}`); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left cursor-pointer hover:bg-white/[0.05]"
              style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <MdPerson size={13} className="text-slate-500 shrink-0" />
              <span className="text-[12px] text-slate-200 flex-1 truncate">{c.firstName} {c.lastName}</span>
              {c.dob && <span className="text-[10px] font-mono text-slate-500 shrink-0">DOB {c.dob}</span>}
            </button>
          ))}
        </div>
      )}
      <p className="text-[10px] text-slate-500 mt-1">Pick a registered civilian, or type any name / company manually.</p>
    </div>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div>
      <div className="text-[9.5px] font-bold uppercase tracking-[0.5px] text-slate-600 mb-0.5">{label}</div>
      <div className={`text-[12.5px] text-slate-200 ${mono ? 'font-mono' : ''}`}>{value || '—'}</div>
    </div>
  );
}

const todayStr = () => new Date().toISOString().split('T')[0];
const futureStr = (days) => new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

export default function FDOTPermits() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const { activeBiz } = useActiveBusiness();
  const { isMobile } = useResponsive();
  const permits = state.permits || [];
  const { currentUser, civilians = [] } = state;

  const [selected,       setSelected]       = useState(null);
  const [isNew,          setIsNew]          = useState(false);
  const [revokeConfirm,  setRevokeConfirm]  = useState(null);
  const [form,           setForm]           = useState({
    type: PERMIT_TYPES[0], holderName: '', location: '', postal: '',
    description: '', issuedAt: todayStr(), expiresAt: futureStr(30),
  });

  if (!activeBiz?.isFDOT) return <AccessDenied portalName="FDOT Permit Management" />;

  const sf = k => v => setForm(f => ({ ...f, [k]: v }));
  const panelOpen = isNew || selected !== null;
  const selPermit = permits.find(p => p.id === selected);

  const openNew = () => {
    setForm({ type: PERMIT_TYPES[0], holderName: '', location: '', postal: '', description: '', issuedAt: todayStr(), expiresAt: futureStr(30) });
    setSelected(null);
    setIsNew(true);
    setRevokeConfirm(null);
  };

  const openView = (p) => {
    setSelected(p.id);
    setIsNew(false);
    setRevokeConfirm(null);
  };

  const closePanel = () => {
    setSelected(null);
    setIsNew(false);
    setRevokeConfirm(null);
  };

  const handleIssue = () => {
    if (!form.holderName.trim() || !form.location.trim()) return;
    if (new Date(form.expiresAt) <= new Date(form.issuedAt)) {
      toast.error('Expiry date must be after the issue date.');
      return;
    }
    dispatch({ type: 'ADD_PERMIT', payload: { ...form, issuedBy: currentUser?.name || activeBiz.owner } });
    toast.success('Permit issued.', { title: form.holderName });
    setIsNew(false);
  };

  const handleRevoke = (id) => {
    dispatch({ type: 'REVOKE_PERMIT', payload: id });
    toast.success('Permit revoked.');
    setRevokeConfirm(null);
    setSelected(null);
    setIsNew(false);
  };

  const showList  = !isMobile || !panelOpen;
  const showPanel = panelOpen;

  return (
    <div className="flex h-full min-h-0" style={{ background: '#08111c' }}>

      {/* ── Left: permit list ────────────────────────────────────────────── */}
      {showList && (
        <div className="flex flex-col min-h-0 shrink-0"
          style={{
            width: (!isMobile && panelOpen) ? 340 : '100%',
            borderRight: (!isMobile && panelOpen) ? '1px solid rgba(255,255,255,0.07)' : 'none',
          }}>

          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#060e18' }}>
            <div className="flex items-center gap-2">
              <MdVerifiedUser size={16} style={{ color: '#3a88e8' }} />
              <span className="text-[13px] font-extrabold text-white">FDOT Permits</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#4a5568', border: '1px solid rgba(255,255,255,0.07)' }}>
                {permits.length}
              </span>
            </div>
            <button onClick={openNew} type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer"
              style={{ background: 'rgba(58,136,232,0.12)', border: '1px solid rgba(58,136,232,0.28)', color: '#3a88e8' }}>
              <MdAdd size={14} /> Issue Permit
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {permits.length === 0 && (
              <div className="text-center py-12 text-[12px] text-slate-600">No permits issued yet.</div>
            )}
            {permits.map(p => {
              const st = permitStatus(p);
              const cfg = STATUS_CFG[st];
              const on = selected === p.id && !isNew;
              return (
                <button key={p.id} onClick={() => openView(p)} type="button"
                  className="flex items-start gap-3 px-4 py-3 rounded-xl text-left cursor-pointer w-full"
                  style={{ background: on ? 'rgba(58,136,232,0.10)' : 'rgba(255,255,255,0.025)', border: `1px solid ${on ? 'rgba(58,136,232,0.28)' : 'rgba(255,255,255,0.07)'}` }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[10.5px] font-mono font-bold" style={{ color: cfg.color }}>{p.permitNumber}</span>
                      <StatusBadge status={st} />
                    </div>
                    <div className="text-[12.5px] font-bold text-white truncate">{p.holderName}</div>
                    <div className="text-[10.5px] text-slate-500 truncate mt-0.5">{p.location}</div>
                    <div className="text-[10px] text-slate-600 mt-1">{p.type} · Exp {p.expiresAt}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Right: form / detail panel ───────────────────────────────────── */}
      {showPanel && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">

          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#060e18' }}>
            <div className="flex items-center gap-2 min-w-0">
              {isMobile && (
                <button onClick={closePanel} type="button" aria-label="Back"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', marginRight: 4 }}>
                  <MdArrowBack size={18} className="text-slate-400" />
                </button>
              )}
              <span className="text-[13px] font-extrabold text-white truncate">
                {isNew ? 'Issue New Permit' : selPermit?.permitNumber}
              </span>
              {selPermit && !isNew && <StatusBadge status={permitStatus(selPermit)} />}
            </div>
            {!isMobile && (
              <button onClick={closePanel} type="button" aria-label="Close"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
                <MdClose size={18} className="text-slate-600" />
              </button>
            )}
          </div>

          <div className="p-4 sm:p-5 flex flex-col gap-5">

            {isNew ? (
              <>
                <section>
                  <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-600 mb-3">Permit Details</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FSelect label="Permit Type" value={form.type} onChange={sf('type')} options={PERMIT_TYPES} span2 />
                    <HolderLookup value={form.holderName} onChange={sf('holderName')} civilians={civilians} />
                    <FInput label="Location / Road" value={form.location} onChange={sf('location')} placeholder="e.g. I-4 EB / MLK Blvd" />
                    <FInput label="Postal Code" value={form.postal} onChange={sf('postal')} placeholder="347" />
                    <FInput label="Issue Date" value={form.issuedAt} onChange={sf('issuedAt')} type="date" />
                    <FInput label="Expiry Date" value={form.expiresAt} onChange={sf('expiresAt')} type="date" />
                    <FInput label="Work Description / Conditions" value={form.description} onChange={sf('description')} placeholder="Scope of work, lane impact, safety requirements…" textarea span2 />
                  </div>
                </section>

                <div className="flex gap-3">
                  <button onClick={handleIssue} type="button"
                    disabled={!form.holderName.trim() || !form.location.trim()}
                    className="press flex-1 py-2 rounded-xl text-[12px] font-bold cursor-pointer disabled:opacity-40"
                    style={{ background: 'rgba(58,136,232,0.14)', border: '1px solid rgba(58,136,232,0.30)', color: '#3a88e8' }}>
                    Issue Permit
                  </button>
                </div>
              </>
            ) : selPermit ? (
              <>
                {/* Status banner */}
                {(() => {
                  const st = permitStatus(selPermit);
                  const cfg = STATUS_CFG[st];
                  return (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: `${cfg.color}0f`, border: `1px solid ${cfg.color}28` }}>
                      <div className="text-[10px] font-bold uppercase tracking-[0.5px] text-slate-500">Status</div>
                      <div className="flex-1 text-[14px] font-extrabold ml-2" style={{ color: cfg.color }}>{st}</div>
                      <StatusBadge status={st} />
                    </div>
                  );
                })()}

                {/* Details grid */}
                <section>
                  <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-600 mb-3">Permit Information</div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <DetailRow label="Permit #"   value={selPermit.permitNumber} mono />
                    <DetailRow label="Type"       value={selPermit.type} />
                    <DetailRow label="Holder"     value={selPermit.holderName} />
                    <DetailRow label="Location"   value={selPermit.location} />
                    <DetailRow label="Postal"     value={selPermit.postal} mono />
                    <DetailRow label="Issued By"  value={selPermit.issuedBy} />
                    <DetailRow label="Issue Date" value={selPermit.issuedAt} mono />
                    <DetailRow label="Expiry"     value={selPermit.expiresAt} mono />
                  </div>
                  {selPermit.description && (
                    <div className="mt-4">
                      <div className="text-[9.5px] font-bold uppercase tracking-[0.5px] text-slate-600 mb-1.5">Description / Conditions</div>
                      <div className="text-[12.5px] text-slate-300 leading-relaxed rounded-xl px-4 py-3"
                        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {selPermit.description}
                      </div>
                    </div>
                  )}
                </section>

                {/* Revoke */}
                {permitStatus(selPermit) === 'ACTIVE' && (
                  <div className="flex items-center gap-3 flex-wrap">
                    {revokeConfirm === selPermit.id ? (
                      <>
                        <span className="text-[11px] text-red-400">Revoke this permit?</span>
                        <button onClick={() => handleRevoke(selPermit.id)} type="button"
                          className="press flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer"
                          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)', color: '#ef4444' }}>
                          <MdCheck size={12} /> Confirm Revoke
                        </button>
                        <button onClick={() => setRevokeConfirm(null)} type="button"
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#4a5568' }}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setRevokeConfirm(selPermit.id)} type="button"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', color: '#ef4444' }}>
                        <MdBlock size={13} /> Revoke Permit
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : null}

          </div>
        </div>
      )}
    </div>
  );
}
