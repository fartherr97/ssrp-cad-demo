import { useState, useMemo } from 'react';
import { useCAD } from '../../store/cadStore';
import { useToast } from '../../contexts/ToastContext';
import {
  MdBadge, MdDriveEta, MdPerson, MdLock,
  MdCheckCircle, MdWarningAmber, MdRefresh, MdAddCircleOutline, MdErrorOutline,
} from 'react-icons/md';
import {
  PortalPage, PortalHeader, PortalCard, Field,
  PORTAL_INPUT, PORTAL_LABEL,
} from './PortalKit';
import ReportForm from '../../components/ReportForm';
import { useActiveCivilian, CivilianSwitcher } from '../../contexts/CivilianContext';

const DL_CLASSES = [
  { value: 'Class E',     label: 'Class E',         desc: 'Standard license * non-commercial vehicles under 26,001 lbs (most common)' },
  { value: 'Class A CDL', label: 'Class A CDL',     desc: 'Combination vehicles with a GCWR of 26,001+ lbs towing a unit over 10,000 lbs' },
  { value: 'Class B CDL', label: 'Class B CDL',     desc: 'Heavy straight vehicles 26,001+ lbs, or buses designed for 24+ passengers' },
  { value: 'Class C CDL', label: 'Class C CDL',     desc: 'Vehicles carrying hazardous materials or transporting 16–23 passengers' },
  { value: 'Class M',     label: 'Class M',         desc: 'Motorcycle or moped only' },
  { value: 'Class E / M', label: 'Class E + M',     desc: 'Standard license with motorcycle endorsement' },
];

const DL_STATUSES = [
  { value: 'ACTIVE',    label: 'Active',    color: '#4ade80' },
  { value: 'EXPIRED',   label: 'Expired',   color: '#fb923c' },
  { value: 'SUSPENDED', label: 'Suspended', color: '#f87171' },
  { value: 'REVOKED',   label: 'Revoked',   color: '#e879f9' },
];

const defaultExpiry = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
};

/* ── Confirmation modal ── */
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
            <div className="text-[15px] font-bold text-white mb-1">Are you sure?</div>
            <div className="text-[12.5px] text-slate-400 leading-relaxed">
              Once submitted, <span className="text-white font-semibold">you will not be able to edit your license</span>. Only server administrators can make changes after issuance.
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
            Yes, Submit
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── DL Application / Renewal form ── */
function DLForm({ civ, isRenewal, onSubmit, onCancel, dlTemplate }) {
  const activeClasses = (dlTemplate?.dlClasses?.length > 0) ? dlTemplate.dlClasses : DL_CLASSES;
  const [dlClass,          setDlClass]         = useState(civ.dlClass || activeClasses[0]?.value || 'Class E');
  const [dlStatus,         setDlStatus]        = useState(isRenewal ? 'ACTIVE' : (civ.dlStatus || 'ACTIVE'));
  const [dlExpiry,         setDlExpiry]        = useState(isRenewal ? defaultExpiry() : (civ.dlExpiry || defaultExpiry()));
  const [templateFormData, setTemplateFormData] = useState({});
  const [confirming,       setConfirming]      = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirming(true);
  };

  const handleConfirm = () => {
    setConfirming(false);
    onSubmit({ dlClass, dlStatus, dlExpiry, templateFormData });
  };

  const statusMeta = DL_STATUSES.find(s => s.value === dlStatus);

  return (
    <>
      {confirming && <ConfirmModal onConfirm={handleConfirm} onCancel={() => setConfirming(false)} />}

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
              Your license will be issued immediately. This cannot be undone.
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
          {/* License Class */}
          <div className="mb-5">
            <label className={PORTAL_LABEL}>License Class</label>
            <div className="flex flex-col gap-2">
              {activeClasses.map(cls => (
                <label key={cls.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                    ${dlClass === cls.value
                      ? 'bg-brand/10 border-brand/50'
                      : 'bg-app-bg/40 border-border-faint hover:border-border-base'
                    }`}>
                  <input type="radio" name="dlClass" value={cls.value}
                    checked={dlClass === cls.value} onChange={() => setDlClass(cls.value)}
                    className="mt-0.5 accent-blue-500 shrink-0" />
                  <div>
                    <div className="text-[13px] font-semibold text-slate-200">{cls.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{cls.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Status + Expiry row */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className={PORTAL_LABEL}>Initial Status</label>
              <select
                value={dlStatus}
                onChange={e => setDlStatus(e.target.value)}
                className={PORTAL_INPUT}
                style={{ color: statusMeta?.color }}
              >
                {DL_STATUSES.map(s => (
                  <option key={s.value} value={s.value} style={{ color: s.color }}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={PORTAL_LABEL}>Expiration Date</label>
              <div className="relative w-full overflow-hidden rounded-lg border border-border-base bg-app-input focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/20 transition-all" style={{ height: 42 }}>
                <input className="absolute inset-0 w-full h-full bg-transparent px-3.5 text-sm text-cad-text outline-none" type="date" required value={dlExpiry} onChange={e => setDlExpiry(e.target.value)} style={{ colorScheme: 'dark' }} />
              </div>
            </div>
          </div>

          {/* Custom template fields */}
          {dlTemplate && (
            <div className="mb-5 border-t border-border-faint pt-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-3 flex items-center gap-2">
                🪪 <span>{dlTemplate.name} * Additional Fields</span>
              </div>
              <ReportForm
                template={dlTemplate}
                data={templateFormData}
                onChange={(k, v) => setTemplateFormData(p => ({ ...p, [k]: v }))}
                onBulkChange={(obj) => setTemplateFormData(p => ({ ...p, ...obj }))}
              />
            </div>
          )}

          {/* Suspension warning */}
          {dlStatus === 'SUSPENDED' && (
            <div className="flex items-start gap-2 p-3 rounded-lg mb-4 text-[11.5px]"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: '#fca5a5' }}>
              <MdWarningAmber size={14} className="shrink-0 mt-0.5" />
              Setting status to Suspended will immediately lock this license. You won't be able to renew or replace it without administrator assistance.
            </div>
          )}
          {dlStatus === 'REVOKED' && (
            <div className="flex items-start gap-2 p-3 rounded-lg mb-4 text-[11.5px]"
              style={{ background: 'rgba(232,121,249,0.08)', border: '1px solid rgba(232,121,249,0.25)', color: '#f0abfc' }}>
              <MdWarningAmber size={14} className="shrink-0 mt-0.5" />
              A revoked license cannot be renewed. Only an administrator can reinstate it.
            </div>
          )}

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
    </>
  );
}

/* ── Active / Expired / Suspended / Revoked DL card ── */
function DLCard({ civ, onRenew }) {
  const isExpired   = civ.dlExpiry && new Date(civ.dlExpiry) < new Date();
  const isSuspended = civ.dlStatus === 'SUSPENDED';
  const isRevoked   = civ.dlStatus === 'REVOKED';
  const isLocked    = isSuspended || isRevoked;
  const isActive    = civ.dlStatus === 'ACTIVE' && !isExpired;

  const daysUntilExpiry = civ.dlExpiry
    ? Math.ceil((new Date(civ.dlExpiry) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  const nearExpiry = isActive && daysUntilExpiry !== null && daysUntilExpiry <= 30;

  const statusLabel = isRevoked ? 'REVOKED' : isSuspended ? 'SUSPENDED' : isExpired ? 'EXPIRED' : civ.dlStatus || 'ACTIVE';
  const borderColor = isRevoked ? '#e879f9' : isSuspended ? '#f87171' : isExpired ? '#fb923c' : nearExpiry ? '#facc15' : '#4ade80';

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
        <Field label="Issued" value={civ.dlIssuedAt || '*'} />
        <Field label="Expires" value={civ.dlExpiry || '*'} />
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
      {isLocked ? (
        <div className="flex items-start gap-2 p-2.5 rounded-lg text-[11px]"
          style={{
            background: isRevoked ? 'rgba(232,121,249,0.08)' : 'rgba(248,113,113,0.08)',
            border: `1px solid ${isRevoked ? 'rgba(232,121,249,0.2)' : 'rgba(248,113,113,0.2)'}`,
            color: isRevoked ? '#f0abfc' : '#fca5a5',
          }}>
          <MdLock size={13} className="shrink-0 mt-0.5" />
          {isRevoked
            ? 'Your license has been revoked. Contact your server administrator to appeal.'
            : 'Your license is suspended. Contact your server administrator to appeal.'}
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
  const toast = useToast();
  const { myChars, activeChar } = useActiveCivilian();
  const dlTemplate = useMemo(() => (state.recordTemplates || []).find(t => t.dlTemplate) || null, [state.recordTemplates]);

  // Per-character UI state: null | 'applying' | 'renewing'
  const [formMode, setFormMode] = useState({});

  const storeDLRecord = (civilianId, templateFormData) => {
    if (!dlTemplate) return;
    dispatch({
      type: 'ADD_RECORD',
      payload: {
        type: dlTemplate.name,
        civilianId,
        isDL: true,
        status: 'Approved',
        formData: templateFormData || {},
      },
    });
  };

  const handleIssue = (civilianId, { dlClass, dlStatus, dlExpiry, templateFormData }) => {
    dispatch({ type: 'ISSUE_DRIVER_LICENSE', payload: { civilianId, dlClass, dlStatus, dlExpiry } });
    storeDLRecord(civilianId, templateFormData);
    setFormMode(p => ({ ...p, [civilianId]: null }));
    toast.success(`${dlClass} license issued.`, { title: 'License Issued' });
  };

  const handleRenew = (civilianId, { dlClass, dlStatus, dlExpiry, templateFormData }) => {
    dispatch({ type: 'RENEW_DRIVER_LICENSE', payload: { civilianId, dlClass, dlStatus, dlExpiry } });
    storeDLRecord(civilianId, templateFormData);
    setFormMode(p => ({ ...p, [civilianId]: null }));
    toast.success(`License renewed * valid through ${dlExpiry}.`, { title: 'License Renewed' });
  };

  return (
    <PortalPage>
      <PortalHeader
        icon={MdBadge}
        title="My Licenses"
        subtitle="Manage driver licenses and weapon permits for your active character."
        accent="brand"
      />

      <div className="max-w-[820px]">
      <CivilianSwitcher />

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
          {(activeChar ? [activeChar] : []).map(c => {
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
                    {(c.dlStatus === 'SUSPENDED' || c.dlStatus === 'REVOKED') && mode !== 'applying' && mode !== 'renewing' ? (
                      /* Suspended / Revoked * block all paths regardless of whether dlNumber exists */
                      (() => {
                        const isRev = c.dlStatus === 'REVOKED';
                        const bg = isRev ? 'rgba(232,121,249,0.05)' : 'rgba(248,113,113,0.05)';
                        const bc = isRev ? 'rgba(232,121,249,0.3)' : 'rgba(248,113,113,0.3)';
                        const tc = isRev ? 'text-fuchsia-400' : 'text-red-400';
                        return (
                          <div className="flex-1 min-w-[240px] rounded-xl border p-5 backdrop-blur-sm flex flex-col gap-3"
                            style={{ background: bg, borderColor: bc }}>
                            <div className="flex items-center gap-2">
                              <MdWarningAmber size={18} className={`${tc} shrink-0`} />
                              <span className={`text-[13px] font-bold ${tc}`}>License {isRev ? 'Revoked' : 'Suspended'}</span>
                            </div>
                            {c.dlNumber && (
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                <Field label="DL Number" value={c.dlNumber} mono />
                                <Field label="Class" value={c.dlClass} />
                              </div>
                            )}
                            <div className="text-[11.5px] text-slate-400 leading-relaxed">
                              {isRev
                                ? 'Your license has been revoked. You cannot apply for or renew a license. Contact your server administrator to appeal.'
                                : 'Your license has been suspended. You cannot apply for or renew a license while under suspension. Contact your server administrator to appeal.'}
                            </div>
                          </div>
                        );
                      })()
                    ) : mode === 'applying' ? (
                      <DLForm
                        civ={c}
                        isRenewal={false}
                        onSubmit={(payload) => handleIssue(c.id, payload)}
                        onCancel={() => setFormMode(p => ({ ...p, [c.id]: null }))}
                        dlTemplate={dlTemplate}
                      />
                    ) : mode === 'renewing' ? (
                      <DLForm
                        civ={c}
                        isRenewal={true}
                        onSubmit={(payload) => handleRenew(c.id, payload)}
                        onCancel={() => setFormMode(p => ({ ...p, [c.id]: null }))}
                        dlTemplate={dlTemplate}
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

                </div>
              </PortalCard>
            );
          })}
        </div>
      )}
      </div>
    </PortalPage>
  );
}
