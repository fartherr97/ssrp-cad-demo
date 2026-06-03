import { useState, useMemo } from 'react';
import { useCAD } from '../../store/cadStore';
import {
  MdBadge, MdDriveEta, MdGppGood, MdPerson, MdLock,
  MdCheckCircle, MdWarningAmber, MdRefresh, MdAddCircleOutline,
} from 'react-icons/md';
import {
  PortalPage, PortalHeader, PortalCard, Field,
  PORTAL_INPUT, PORTAL_LABEL,
} from './PortalKit';
import { statusBadge } from '../../constants/styles';

const DL_CLASSES = [
  { value: 'Class A', label: 'Class A', desc: 'Commercial vehicles over 26,000 lbs' },
  { value: 'Class B', label: 'Class B', desc: 'Single vehicles over 26,000 lbs' },
  { value: 'Class C', label: 'Class C', desc: 'Standard passenger vehicles' },
];

function WeaponPermitBlock({ civ }) {
  return (
    <div className="flex-1 min-w-[240px] bg-app-card/70 border border-border-base rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2.5 mb-3.5">
        <div className="flex items-center gap-2">
          <MdGppGood size={20} color="#3d82f0" />
          <span className="text-sm font-bold text-slate-100">Weapon Permit</span>
        </div>
        <span className={statusBadge(civ.weaponPermit)}>{civ.weaponPermit || 'NONE'}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Status" value={civ.weaponPermit} />
        <Field label="Expires" value={civ.weaponPermitExpiry || (civ.weaponPermit === 'NONE' ? '—' : '')} />
      </div>
    </div>
  );
}

/* ── DL Application / Renewal form ── */
function DLForm({ civ, isRenewal, onSubmit, onCancel }) {
  const [dlClass, setDlClass] = useState(civ.dlClass || 'Class C');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(dlClass);
  };

  return (
    <div className="bg-app-card/70 border border-border-base rounded-xl p-5 backdrop-blur-sm">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-lg bg-brand/15 border border-brand/30 flex items-center justify-center shrink-0">
          <MdDriveEta size={20} color="#3d82f0" />
        </div>
        <div>
          <div className="text-[14px] font-bold text-white">
            {isRenewal ? 'Renew Driver License' : 'Apply for Driver License'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {isRenewal ? 'Your license will be renewed for 1 year.' : 'Your license will be issued immediately upon submission.'}
          </div>
        </div>
      </div>

      {/* Read-only applicant info */}
      <div className="bg-app-bg/40 border border-border-faint rounded-lg p-4 mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-3">Applicant Information</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          <Field label="Full Name" value={`${civ.firstName} ${civ.lastName}`} />
          <Field label="Date of Birth" value={civ.dob} />
          <Field label="Address" value={civ.address} />
          <Field label="Gender" value={civ.gender} />
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[10.5px] text-slate-600">
          <MdLock size={11} />
          Pre-filled from your character profile. Update your character to change these.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className={PORTAL_LABEL}>License Class</label>
          <div className="flex flex-col gap-2">
            {DL_CLASSES.map(cls => (
              <label key={cls.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                  ${dlClass === cls.value
                    ? 'bg-brand/10 border-brand/50'
                    : 'bg-app-bg/40 border-border-faint hover:border-border-base'
                  }`}>
                <input
                  type="radio"
                  name="dlClass"
                  value={cls.value}
                  checked={dlClass === cls.value}
                  onChange={() => setDlClass(cls.value)}
                  className="mt-0.5 accent-blue-500 shrink-0"
                />
                <div>
                  <div className="text-[13px] font-semibold text-slate-200">{cls.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{cls.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer border border-border-base bg-white/[0.04] text-slate-400 hover:text-slate-200 transition-colors">
              Cancel
            </button>
          )}
          <button type="submit"
            className="flex-1 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-brand hover:bg-brand/80 text-white transition-colors">
            {isRenewal ? 'Renew License' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Active / Expired / Suspended DL card ── */
function DLCard({ civ, onRenew }) {
  const isExpired   = civ.dlExpiry && new Date(civ.dlExpiry) < new Date();
  const isSuspended = civ.dlStatus === 'SUSPENDED';
  const isActive    = civ.dlStatus === 'ACTIVE' && !isExpired;

  const daysUntilExpiry = civ.dlExpiry
    ? Math.ceil((new Date(civ.dlExpiry) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  const nearExpiry = isActive && daysUntilExpiry !== null && daysUntilExpiry <= 30;

  const statusLabel = isSuspended ? 'SUSPENDED' : isExpired ? 'EXPIRED' : civ.dlStatus || 'ACTIVE';
  const statusColor = isSuspended ? 'text-red-400' : isExpired ? 'text-amber-400' : 'text-green-400';
  const borderColor = isSuspended ? '#f87171' : isExpired ? '#fb923c' : nearExpiry ? '#facc15' : '#4ade80';

  return (
    <div className="flex-1 min-w-[240px] rounded-xl border p-4 backdrop-blur-sm"
      style={{ background: 'rgba(255,255,255,0.03)', borderColor: `${borderColor}44` }}>

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <MdDriveEta size={20} style={{ color: borderColor }} />
          <span className="text-sm font-bold text-slate-100">Driver License</span>
        </div>
        <span className={`text-[11px] font-bold uppercase tracking-[0.4px] px-2 py-0.5 rounded-full border`}
          style={{ color: borderColor, background: `${borderColor}18`, borderColor: `${borderColor}44` }}>
          {statusLabel}
        </span>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
        <Field label="DL Number" value={civ.dlNumber} mono />
        <Field label="Class" value={civ.dlClass} />
        <Field label="Issued" value={civ.dlIssuedAt || '—'} />
        <Field label="Expires" value={civ.dlExpiry || '—'} />
      </div>

      {/* Expiry warning */}
      {nearExpiry && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg mb-3 text-[11px]"
          style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', color: '#facc15' }}>
          <MdWarningAmber size={13} />
          Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}. You may renew now.
        </div>
      )}

      {/* Footer */}
      {isSuspended ? (
        <div className="flex items-start gap-2 p-2.5 rounded-lg text-[11px]"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#fca5a5' }}>
          <MdLock size={13} className="shrink-0 mt-0.5" />
          Your license is suspended. Contact your server administrator to appeal.
        </div>
      ) : isExpired ? (
        <button type="button" onClick={onRenew}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 transition-colors">
          <MdRefresh size={15} /> Renew License
        </button>
      ) : (nearExpiry ? (
        <button type="button" onClick={onRenew}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/25 transition-colors">
          <MdRefresh size={15} /> Renew Early
        </button>
      ) : (
        <div className="flex items-center gap-2 p-2.5 rounded-lg text-[11px] text-slate-600"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <MdLock size={11} />
          Issued licenses cannot be modified by civilians.
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════
   MAIN PAGE
══════════════════════════════════ */
export default function MyLicenses() {
  const { state, dispatch } = useCAD();
  const myChars = useMemo(() => state.civilians.filter(c => c.ownedByPlayer), [state.civilians]);

  // Per-character UI state: null | 'applying' | 'renewing'
  const [formMode, setFormMode] = useState({});

  const handleIssue = (civilianId, dlClass) => {
    dispatch({ type: 'ISSUE_DRIVER_LICENSE', payload: { civilianId, dlClass } });
    setFormMode(p => ({ ...p, [civilianId]: null }));
  };

  const handleRenew = (civilianId, dlClass) => {
    dispatch({ type: 'RENEW_DRIVER_LICENSE', payload: { civilianId, dlClass } });
    setFormMode(p => ({ ...p, [civilianId]: null }));
  };

  return (
    <PortalPage>
      <PortalHeader
        icon={MdBadge}
        title="My Licenses"
        subtitle="Manage driver licenses and weapon permits for your characters."
        accent="brand"
      />

      {myChars.length === 0 ? (
        <PortalCard accent="brand">
          <div className="text-center p-12">
            <MdBadge size={48} color="rgba(61,130,240,0.4)" />
            <div className="text-[15px] font-bold text-slate-100 mt-3">No characters yet</div>
            <div className="text-sm text-slate-400 mt-1.5">
              Register a character to manage its licenses.
            </div>
          </div>
        </PortalCard>
      ) : (
        <div className="flex flex-col gap-5">
          {myChars.map(c => {
            const mode = formMode[c.id] || null;
            const hasDL = !!c.dlNumber;

            return (
              <PortalCard key={c.id} accent="brand">
                {/* Character header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[10px] shrink-0 flex items-center justify-center bg-brand/15 border border-brand/30">
                    <MdPerson size={22} color="#3d82f0" />
                  </div>
                  <div className="text-base font-extrabold text-slate-100">{c.firstName} {c.lastName}</div>
                </div>

                <div className="flex gap-3.5 flex-wrap">
                  {/* Driver License column */}
                  <div className="flex-1 min-w-[240px]">
                    {mode === 'applying' ? (
                      <DLForm
                        civ={c}
                        isRenewal={false}
                        onSubmit={(dlClass) => handleIssue(c.id, dlClass)}
                        onCancel={() => setFormMode(p => ({ ...p, [c.id]: null }))}
                      />
                    ) : mode === 'renewing' ? (
                      <DLForm
                        civ={c}
                        isRenewal={true}
                        onSubmit={(dlClass) => handleRenew(c.id, dlClass)}
                        onCancel={() => setFormMode(p => ({ ...p, [c.id]: null }))}
                      />
                    ) : hasDL ? (
                      <DLCard
                        civ={c}
                        onRenew={() => setFormMode(p => ({ ...p, [c.id]: 'renewing' }))}
                      />
                    ) : (
                      <div className="flex-1 min-w-[240px] bg-app-card/70 border border-dashed border-border-base rounded-xl p-5 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-center">
                        <MdDriveEta size={32} className="text-slate-600" />
                        <div>
                          <div className="text-[13px] font-semibold text-slate-300">No Driver License</div>
                          <div className="text-[11px] text-slate-500 mt-1">Apply to receive your license instantly.</div>
                        </div>
                        <button type="button"
                          onClick={() => setFormMode(p => ({ ...p, [c.id]: 'applying' }))}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand hover:bg-brand/80 text-white text-[12px] font-bold cursor-pointer transition-colors">
                          <MdAddCircleOutline size={15} /> Apply Now
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Weapon Permit (unchanged) */}
                  <WeaponPermitBlock civ={c} />
                </div>
              </PortalCard>
            );
          })}
        </div>
      )}
    </PortalPage>
  );
}
