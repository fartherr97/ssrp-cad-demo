import { useState, useMemo } from 'react';
import { useCAD } from '../../store/cadStore';
import { useToast } from '../../contexts/ToastContext';
import {
  MdBadge, MdDriveEta, MdPerson, MdLock,
  MdWarningAmber, MdRefresh, MdAddCircleOutline, MdErrorOutline,
} from 'react-icons/md';
import {
  PortalPage, PortalHeader, PortalCard, Field,
  PORTAL_INPUT, PORTAL_LABEL,
} from './PortalKit';
import ReportForm from '../../components/ReportForm';

const DL_CLASSES = [
  { value: 'Class E',     label: 'Class E',     desc: 'Standard license — non-commercial vehicles under 26,001 lbs (most common)' },
  { value: 'Class A CDL', label: 'Class A CDL', desc: 'Combination vehicles with a GCWR of 26,001+ lbs towing a unit over 10,000 lbs' },
  { value: 'Class B CDL', label: 'Class B CDL', desc: 'Heavy straight vehicles 26,001+ lbs, or buses designed for 24+ passengers' },
  { value: 'Class C CDL', label: 'Class C CDL', desc: 'Vehicles carrying hazardous materials or transporting 16–23 passengers' },
  { value: 'Class M',     label: 'Class M',     desc: 'Motorcycle or moped only' },
  { value: 'Class E / M', label: 'Class E + M', desc: 'Standard license with motorcycle endorsement' },
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

/* ── Top-level issue form: character picker → class → expiry ── */
function IssueLicenseForm({ chars, onSubmit, onCancel, dlTemplate }) {
  const activeClasses = (dlTemplate?.dlClasses?.length > 0) ? dlTemplate.dlClasses : DL_CLASSES;
  const [selectedCharId, setSelectedCharId] = useState(chars[0]?.id || '');
  const [dlClass,          setDlClass]       = useState(activeClasses[0]?.value || 'Class E');
  const [dlStatus,         setDlStatus]      = useState('ACTIVE');
  const [dlExpiry,         setDlExpiry]      = useState(defaultExpiry());
  const [templateFormData, setTplData]       = useState({});
  const [confirming,       setConfirming]    = useState(false);

  const selectedChar = chars.find(c => c.id === selectedCharId);
  const statusMeta   = DL_STATUSES.find(s => s.value === dlStatus);

  const handleSubmit  = (e) => { e.preventDefault(); setConfirming(true); };
  const handleConfirm = () => { setConfirming(false); onSubmit(selectedCharId, { dlClass, dlStatus, dlExpiry, templateFormData: templateFormData }); };

  if (chars.length === 0) {
    return (
      <div className="bg-app-card/70 border border-border-base rounded-xl p-6 mb-5 text-center">
        <div className="text-[13px] text-slate-400">No eligible characters. Characters with suspended or revoked licenses cannot apply.</div>
        <button onClick={onCancel} className="mt-3 text-brand text-[12px] font-semibold cursor-pointer bg-transparent border-none">Dismiss</button>
      </div>
    );
  }

  return (
    <>
      {confirming && <ConfirmModal onConfirm={handleConfirm} onCancel={() => setConfirming(false)} />}
      <div className="bg-app-card/70 border border-brand/30 rounded-xl p-5 backdrop-blur-sm mb-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-lg bg-brand/15 border border-brand/30 flex items-center justify-center shrink-0">
            <MdAddCircleOutline size={20} color="#3d82f0" />
          </div>
          <div>
            <div className="text-[14px] font-bold text-white">Issue New Driver License</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Select a character, choose a class, then set the expiration date.</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Step 1: Character */}
          <div className="mb-5">
            <label className={PORTAL_LABEL}>Select Character</label>
            <div className="flex flex-col gap-2">
              {chars.map(c => {
                const hasActiveDL = c.dlNumber && c.dlStatus === 'ACTIVE' && c.dlExpiry && new Date(c.dlExpiry) > new Date();
                return (
                  <label key={c.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                      ${selectedCharId === c.id
                        ? 'bg-brand/10 border-brand/50'
                        : 'bg-app-bg/40 border-border-faint hover:border-border-base'
                      }`}>
                    <input type="radio" name="charSelect" value={c.id}
                      checked={selectedCharId === c.id} onChange={() => setSelectedCharId(c.id)}
                      className="accent-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-slate-200">{c.firstName} {c.lastName}</div>
                      {hasActiveDL
                        ? <div className="text-[10.5px] text-amber-400 mt-0.5">Has active license — issuing will replace it</div>
                        : c.dlNumber
                          ? <div className="text-[10.5px] text-slate-500 mt-0.5">Has expired license — issuing will replace it</div>
                          : <div className="text-[10.5px] text-slate-500 mt-0.5">No license on file</div>
                      }
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Applicant info from selected char */}
          {selectedChar && (
            <div className="bg-app-bg/40 border border-border-faint rounded-lg p-4 mb-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-3">Applicant Information</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                <Field label="Full Name"     value={`${selectedChar.firstName} ${selectedChar.lastName}`} />
                <Field label="Date of Birth" value={selectedChar.dob} />
                <Field label="Address"       value={selectedChar.address} />
                <Field label="Gender"        value={selectedChar.gender} />
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10.5px] text-slate-600">
                <MdLock size={11} />
                Pre-filled from character profile.
              </div>
            </div>
          )}

          {/* Step 2: License Class */}
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

          {/* Step 3: Status + Expiry */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className={PORTAL_LABEL}>Initial Status</label>
              <select value={dlStatus} onChange={e => setDlStatus(e.target.value)}
                className={PORTAL_INPUT} style={{ color: statusMeta?.color }}>
                {DL_STATUSES.map(s => (
                  <option key={s.value} value={s.value} style={{ color: s.color }}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={PORTAL_LABEL}>Expiration Date</label>
              <input type="date" required value={dlExpiry} onChange={e => setDlExpiry(e.target.value)}
                className={`${PORTAL_INPUT} h-[42px]`} style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          {/* Custom template fields */}
          {dlTemplate && (
            <div className="mb-5 border-t border-border-faint pt-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-3 flex items-center gap-2">
                🪪 <span>{dlTemplate.name} — Additional Fields</span>
              </div>
              <ReportForm
                template={dlTemplate}
                data={templateFormData}
                onChange={(k, v) => setTplData(p => ({ ...p, [k]: v }))}
                onBulkChange={(obj) => setTplData(p => ({ ...p, ...obj }))}
              />
            </div>
          )}

          {dlStatus === 'SUSPENDED' && (
            <div className="flex items-start gap-2 p-3 rounded-lg mb-4 text-[11.5px]"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: '#fca5a5' }}>
              <MdWarningAmber size={14} className="shrink-0 mt-0.5" />
              Setting status to Suspended will immediately lock this license.
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
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer border border-border-base bg-white/[0.04] text-slate-400 hover:text-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!selectedCharId}
              className="flex-1 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-brand hover:bg-brand/80 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

/* ── Renewal form: expiry-only (class carries over) ── */
function RenewForm({ civ, onSubmit, onCancel, dlTemplate }) {
  const [dlExpiry,         setDlExpiry] = useState(defaultExpiry());
  const [templateFormData, setTplData]  = useState({});
  const [confirming,       setConfirming] = useState(false);

  const handleSubmit  = (e) => { e.preventDefault(); setConfirming(true); };
  const handleConfirm = () => { setConfirming(false); onSubmit({ dlClass: civ.dlClass, dlStatus: 'ACTIVE', dlExpiry, templateFormData }); };

  return (
    <>
      {confirming && <ConfirmModal onConfirm={handleConfirm} onCancel={() => setConfirming(false)} />}
      <div className="bg-app-card/70 border border-border-base rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <MdRefresh size={20} color="#f59e0b" />
          </div>
          <div>
            <div className="text-[14px] font-bold text-white">Renew Driver License</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Class carries over from your current license.</div>
          </div>
        </div>

        <div className="bg-app-bg/40 border border-border-faint rounded-lg px-4 py-3 mb-5 flex items-center gap-2">
          <MdDriveEta size={14} className="text-slate-500 shrink-0" />
          <span className="text-[11.5px] text-slate-400">
            Renewing as <span className="text-white font-semibold">{civ.dlClass}</span>
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className={PORTAL_LABEL}>New Expiration Date</label>
            <input type="date" required value={dlExpiry} onChange={e => setDlExpiry(e.target.value)}
              className={`${PORTAL_INPUT} h-[42px]`} style={{ colorScheme: 'dark' }} />
          </div>

          {dlTemplate && (
            <div className="mb-5 border-t border-border-faint pt-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-3 flex items-center gap-2">
                🪪 <span>{dlTemplate.name} — Additional Fields</span>
              </div>
              <ReportForm
                template={dlTemplate}
                data={templateFormData}
                onChange={(k, v) => setTplData(p => ({ ...p, [k]: v }))}
                onBulkChange={(obj) => setTplData(p => ({ ...p, ...obj }))}
              />
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer border border-border-base bg-white/[0.04] text-slate-400 hover:text-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-amber-500 hover:bg-amber-400 text-black transition-colors">
              Renew License
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

/* ── DL status card ── */
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

      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <MdDriveEta size={20} style={{ color: borderColor }} />
          <span className="text-sm font-bold text-slate-100">Driver License</span>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-[0.4px] px-2 py-0.5 rounded-full border"
          style={{ color: borderColor, background: `${borderColor}18`, borderColor: `${borderColor}44` }}>
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
        <Field label="DL Number" value={civ.dlNumber} mono />
        <Field label="Class"     value={civ.dlClass} />
        <Field label="Issued"    value={civ.dlIssuedAt || '—'} />
        <Field label="Expires"   value={civ.dlExpiry || '—'} />
      </div>

      {nearExpiry && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg mb-3 text-[11px]"
          style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', color: '#facc15' }}>
          <MdWarningAmber size={13} />
          Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}. You may renew now.
        </div>
      )}

      {isLocked ? (
        <div className="flex items-start gap-2 p-2.5 rounded-lg text-[11px]"
          style={{
            background: isRevoked ? 'rgba(232,121,249,0.08)' : 'rgba(248,113,113,0.08)',
            border: `1px solid ${isRevoked ? 'rgba(232,121,249,0.2)' : 'rgba(248,113,113,0.2)'}`,
            color: isRevoked ? '#f0abfc' : '#fca5a5',
          }}>
          <MdLock size={13} className="shrink-0 mt-0.5" />
          {isRevoked
            ? 'License revoked. Contact your server administrator to appeal.'
            : 'License suspended. Contact your server administrator to appeal.'}
        </div>
      ) : isExpired ? (
        <button type="button" onClick={onRenew}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 transition-colors">
          <MdRefresh size={15} /> Renew License
        </button>
      ) : nearExpiry ? (
        <button type="button" onClick={onRenew}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/25 transition-colors">
          <MdRefresh size={15} /> Renew Early
        </button>
      ) : (
        <button type="button" onClick={onRenew}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-white/[0.04] hover:bg-white/[0.08] text-slate-500 hover:text-slate-300 border border-white/[0.08] transition-colors">
          <MdRefresh size={14} /> Renew Early
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════
   MAIN PAGE
══════════════════════════════════ */
export default function MyLicenses() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const myChars    = useMemo(() => state.civilians.filter(c => c.ownedByPlayer), [state.civilians]);
  const dlTemplate = useMemo(() => (state.recordTemplates || []).find(t => t.dlTemplate) || null, [state.recordTemplates]);

  const [issuingNew,    setIssuingNew]    = useState(false);
  const [renewingForId, setRenewingForId] = useState(null);

  // Chars that can apply for a new license (not suspended/revoked)
  const eligibleChars = useMemo(
    () => myChars.filter(c => c.dlStatus !== 'SUSPENDED' && c.dlStatus !== 'REVOKED'),
    [myChars],
  );

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
    setIssuingNew(false);
    toast.success(`${dlClass} license issued.`, { title: 'License Issued' });
  };

  const handleRenew = (civilianId, { dlClass, dlStatus, dlExpiry, templateFormData }) => {
    dispatch({ type: 'RENEW_DRIVER_LICENSE', payload: { civilianId, dlClass, dlStatus, dlExpiry } });
    storeDLRecord(civilianId, templateFormData);
    setRenewingForId(null);
    toast.success(`License renewed — valid through ${dlExpiry}.`, { title: 'License Renewed' });
  };

  return (
    <PortalPage>
      <PortalHeader
        icon={MdBadge}
        title="My Licenses"
        subtitle="Manage driver licenses for your characters."
        accent="brand"
        action={
          !issuingNew && myChars.length > 0 && eligibleChars.length > 0 ? (
            <button
              onClick={() => { setIssuingNew(true); setRenewingForId(null); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand hover:bg-brand/80 text-white text-[12px] font-bold cursor-pointer transition-colors shrink-0">
              <MdAddCircleOutline size={15} /> Issue New License
            </button>
          ) : null
        }
      />

      {/* ── Issue new license form ── */}
      {issuingNew && (
        <IssueLicenseForm
          chars={eligibleChars}
          onSubmit={handleIssue}
          onCancel={() => setIssuingNew(false)}
          dlTemplate={dlTemplate}
        />
      )}

      {/* ── Empty state ── */}
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
            const hasDL      = !!c.dlNumber;
            const isBlocked  = c.dlStatus === 'SUSPENDED' || c.dlStatus === 'REVOKED';
            const isRenewing = renewingForId === c.id;

            return (
              <PortalCard key={c.id} accent="brand">
                {/* Character header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[10px] shrink-0 flex items-center justify-center bg-brand/15 border border-brand/30">
                    <MdPerson size={22} color="#3d82f0" />
                  </div>
                  <div className="text-base font-extrabold text-slate-100">{c.firstName} {c.lastName}</div>
                </div>

                {/* DL section */}
                {isBlocked && !hasDL ? (
                  /* Blocked, no DL */
                  <div className="rounded-xl border p-5 flex items-start gap-3"
                    style={{
                      background: c.dlStatus === 'REVOKED' ? 'rgba(232,121,249,0.05)' : 'rgba(248,113,113,0.05)',
                      borderColor: c.dlStatus === 'REVOKED' ? 'rgba(232,121,249,0.3)' : 'rgba(248,113,113,0.3)',
                    }}>
                    <MdWarningAmber size={18} className={c.dlStatus === 'REVOKED' ? 'text-fuchsia-400 shrink-0 mt-0.5' : 'text-red-400 shrink-0 mt-0.5'} />
                    <div className={`text-[12.5px] font-semibold ${c.dlStatus === 'REVOKED' ? 'text-fuchsia-400' : 'text-red-400'}`}>
                      License {c.dlStatus === 'REVOKED' ? 'Revoked' : 'Suspended'} — contact your server administrator to appeal.
                    </div>
                  </div>
                ) : isRenewing ? (
                  <RenewForm
                    civ={c}
                    onSubmit={(payload) => handleRenew(c.id, payload)}
                    onCancel={() => setRenewingForId(null)}
                    dlTemplate={dlTemplate}
                  />
                ) : hasDL ? (
                  <DLCard civ={c} onRenew={() => { setRenewingForId(c.id); setIssuingNew(false); }} />
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border-base">
                    <MdDriveEta size={20} className="text-slate-600 shrink-0" />
                    <div className="text-[12px] text-slate-500">
                      No license on file — use <span className="text-brand font-semibold">Issue New License</span> above to apply.
                    </div>
                  </div>
                )}
              </PortalCard>
            );
          })}
        </div>
      )}
    </PortalPage>
  );
}
