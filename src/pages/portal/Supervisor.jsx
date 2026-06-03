import { useState, useMemo } from 'react';
import {
  MdSupervisorAccount, MdSearch, MdFilterList, MdChevronRight,
  MdDescription, MdFolder, MdDownload, MdOutlineRateReview, MdArrowBack,
  MdSave, MdCheckCircle, MdShield, MdReply, MdComment,
  MdPerson, MdWarningAmber,
} from 'react-icons/md';
import { useCAD } from '../../store/cadStore';
import ReportForm from '../../components/ReportForm';
import { downloadReportPDF } from '../../components/ReportPDF';
import { BADGE, S_BTN_SECONDARY, S_BTN_GHOST, xs } from '../../constants/styles';

/* ── Status helpers ── */
const STATUS_META = {
  'Pending Review':  { pill: 'bg-amber-500/15 text-amber-400 border-amber-500/30',  active: 'bg-amber-500 text-white border-amber-500' },
  'Pending Changes': { pill: 'bg-orange-500/15 text-orange-400 border-orange-500/30', active: 'bg-orange-500 text-white border-orange-500' },
  'Approved':        { pill: 'bg-green-500/15 text-green-400 border-green-500/30',   active: 'bg-green-600 text-white border-green-600' },
  'Rejected':        { pill: 'bg-red-500/15 text-red-400 border-red-500/30',         active: 'bg-red-600 text-white border-red-600' },
};
const ALL_STATUSES = ['Pending Review', 'Pending Changes', 'Approved', 'Rejected'];

function StatusPill({ status }) {
  const m = STATUS_META[status] || { pill: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
  return (
    <span className={`inline-flex items-center leading-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.3px] rounded-full border ${m.pill}`}>
      {status}
    </span>
  );
}

/* ══════════════════════════════════
   FULL RECORD EDITOR (opened when a row is clicked)
   Uses the same dark ReportForm the officer fills out
══════════════════════════════════ */
function RecordEditor({ entry, officer, template, currentUser, allOfficers, communityConfig, departments, onBack, onSave }) {
  const { dispatch: cadDispatch } = useCAD();
  const hasSReview = !!template?.sections?.some(s => s.id === 'sReview');

  const [editData, setEditData] = useState(() => {
    const base = { ...(entry.formData || {}) };
    if (hasSReview) {
      if (!base.rv_status) base.rv_status = entry.status || 'Pending Review';
      if (base.rv_sig == null) base.rv_sig = entry.supervisorSignature || '';
    }
    return base;
  });
  const [status, setStatus]         = useState(entry.status || 'Pending Review');
  const [supSig, setSupSig]         = useState(entry.supervisorSignature || '');
  const [saved, setSaved]           = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [returning, setReturning]   = useState(false);

  const effectiveStatus = hasSReview ? (editData.rv_status || status) : status;
  const effectiveSupSig = hasSReview ? (editData.rv_sig || supSig) : supSig;

  const buildSupSig = () => {
    const me = allOfficers.find(o => o.id === currentUser?.id);
    if (me) return `${me.badge} | ${(me.rank || me.role || 'SUPERVISOR').toUpperCase()} | ${me.name.toUpperCase()}`;
    return `${currentUser?.badge || '—'} | SUPERVISOR | ${(currentUser?.name || '—').toUpperCase()}`;
  };

  const signAndApprove = () => {
    const sig = buildSupSig();
    if (hasSReview) {
      setEditData(p => ({ ...p, rv_status: 'Approved', rv_sig: sig }));
    }
    setSupSig(sig);
    setStatus('Approved');
  };

  const handleSave = () => {
    onSave({ id: entry.id, kind: entry.kind, formData: editData, status: effectiveStatus, supervisorSignature: effectiveSupSig || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReturn = () => {
    if (!commentDraft.trim()) return;
    const me = allOfficers.find(o => o.id === currentUser?.id);
    cadDispatch({
      type: 'RETURN_REPORT',
      payload: {
        id: entry.id,
        comment: commentDraft.trim(),
        supervisorName: me?.name || currentUser?.name || 'Supervisor',
        supervisorBadge: me?.badge || currentUser?.badge || '—',
      },
    });
    onBack();
  };

  const handleExport = async () => {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      await downloadReportPDF(template || { name: entry.type }, editData, {
        caseNumber: entry.caseNumber,
        status,
        dateTime: entry.date,
        officer: officer ? `${officer.badge} · ${officer.name}` : (entry.officerBadge || '—'),
        agency: departments?.find(d => d.short === officer?.deptShort)?.name || officer?.deptShort || communityConfig?.name || 'SSRP',
        logoUrl: departments?.find(d => d.short === officer?.deptShort)?.logoUrl || communityConfig?.logoUrl,
        officerSignature: entry.officerSignature,
        supervisorSignature: supSig || entry.supervisorSignature,
      });
    } finally { setPdfLoading(false); }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden font-ui">

      {/* ── Top bar ── */}
      <div className="shrink-0 bg-app-toolbar/80 backdrop-blur-md border-b border-border-base">
        {/* Row 1: back + title */}
        <div className="flex items-center gap-2 px-4 pt-2.5 pb-1">
          <button type="button" onClick={onBack}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer transition-colors shrink-0">
            <MdArrowBack size={14} /> Back
          </button>
          <span className="text-slate-700 mx-1 hidden sm:block">|</span>
          {entry.kind === 'report'
            ? <MdDescription size={16} className="text-brand-bright shrink-0 hidden sm:block" />
            : <MdFolder size={16} className="text-violet-400 shrink-0 hidden sm:block" />}
          <span className="text-[12px] font-bold text-white uppercase tracking-[0.4px] truncate">Supervisor Review</span>
          <span className="text-[11px] text-slate-500 truncate hidden sm:block">{entry.type}</span>
          {saved && (
            <span className="ml-auto flex items-center gap-1 text-[10px] text-green-400 font-semibold shrink-0">
              <MdCheckCircle size={12} /> Saved
            </span>
          )}
        </div>
        {/* Row 2: actions */}
        <div className="flex items-center gap-2 px-4 pb-2 overflow-x-auto">
          <span className="text-[11px] text-slate-500 truncate mr-auto sm:hidden">{entry.type}</span>
          <button type="button" onClick={handleExport} disabled={pdfLoading}
            className={xs(S_BTN_SECONDARY) + ' shrink-0'}>
            <MdDownload size={13} /> {pdfLoading ? '…' : 'PDF'}
          </button>
          <button type="button" onClick={() => setReturning(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-bold cursor-pointer transition-all border-0 shrink-0 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25">
            <MdReply size={13} /> Return to Officer
          </button>
          <button type="button" onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11.5px] font-bold cursor-pointer transition-all border-0 shrink-0">
            <MdSave size={13} /> Save Changes
          </button>
        </div>
      </div>

      {/* ── Mobile-only compact meta strip ── */}
      <div className="xl:hidden shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-border-faint overflow-x-auto"
        style={{ background: 'rgba(0,0,0,0.2)' }}>
        <StatusPill status={effectiveStatus} />
        <span className="text-[11px] font-mono text-slate-400 shrink-0">{entry.caseNumber || '—'}</span>
        <span className="text-[11px] text-slate-500 shrink-0">·</span>
        <span className="text-[11px] text-slate-400 shrink-0">
          {officer ? `${officer.badge} · ${officer.name}` : (entry.officerBadge || '—')}
        </span>
        {effectiveSupSig && <span className="text-[10px] text-green-400 font-bold shrink-0 ml-auto">✓ Signed</span>}
      </div>

      {/* ── Body: left sidebar + center form + right sidebar ──
           Mobile: outer div scrolls everything; xl: each col scrolls independently ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[240px_minmax(0,1fr)_260px] overflow-auto xl:overflow-hidden">

        {/* LEFT: case meta — desktop only */}
        <aside className="hidden xl:flex flex-col border-r border-border-base bg-app-panel/60 overflow-y-auto max-h-full">
          <div className="px-4 py-3 border-b border-border-faint shrink-0 text-[11px] font-bold uppercase tracking-[0.7px] text-slate-300">Case Details</div>
          <div className="px-4">
            {[
              { label: 'Case #',    value: entry.caseNumber || '—' },
              { label: 'Type',      value: entry.type },
              { label: 'Date',      value: entry.date },
              { label: 'Officer',   value: officer ? `${officer.badge} · ${officer.name}` : (entry.officerBadge || '—') },
              { label: 'Dept',      value: officer?.deptShort || '—' },
            ].map(d => (
              <div key={d.label} className="flex flex-col gap-0.5 py-2 border-b border-border-faint last:border-0">
                <span className="text-[9.5px] uppercase tracking-[0.5px] text-slate-500">{d.label}</span>
                <span className="text-[12.5px] text-slate-200">{d.value}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER: dark form (same as report writing) */}
        <main className="flex flex-col xl:min-h-0 xl:overflow-hidden">
          {/* Status bar — hidden on mobile (compact strip above handles it) */}
          <div className="hidden xl:grid shrink-0 grid-cols-4 gap-x-4 gap-y-2 px-4 py-3 bg-app-panel/40 border-b border-border-faint">
            <div>
              <div className="text-[9px] uppercase tracking-[0.5px] text-slate-500">Report Status</div>
              <div className="mt-1"><StatusPill status={effectiveStatus} /></div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.5px] text-slate-500">Date</div>
              <div className="text-[12.5px] text-slate-200 mt-0.5">{entry.date}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.5px] text-slate-500">Case #</div>
              <div className="text-[12.5px] font-mono text-slate-200 mt-0.5">{entry.caseNumber || '—'}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.5px] text-slate-500">Sup. Signed</div>
              <div className="text-[12.5px] text-slate-200 mt-0.5">{effectiveSupSig ? '✓ Signed' : 'Not signed'}</div>
            </div>
          </div>

          {/* Form fields — xl: this div scrolls; mobile: outer body div scrolls */}
          <div data-doc-top className="xl:flex-1 xl:overflow-auto bg-app-bg/30 p-4 lg:p-6">
            {template ? (
              <ReportForm
                template={template}
                data={editData}
                onChange={(k, v) => setEditData(p => ({ ...p, [k]: v }))}
                onBulkChange={(obj) => setEditData(p => ({ ...p, ...obj }))}
              />
            ) : (
              <div className="text-slate-500 text-sm italic">
                No matching template found for "{entry.type}". The form data is stored but cannot be displayed.
              </div>
            )}

            {/* ── Status / Signature section at bottom of form — hidden when template has sReview ── */}
            {!hasSReview && <div data-section="Status" className="mt-6 rounded-xl overflow-hidden border border-border-base">
              <div className="bg-red-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.7px] text-white">
                Status
              </div>
              <div className="bg-app-panel/80 p-2.5 grid grid-cols-2 gap-2">

                {/* Status selector */}
                <div className="min-w-0 bg-app-bg/60 border border-border-base rounded-lg px-2.5 py-2">
                  <div className="text-[8px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1">Status</div>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full bg-transparent text-[11.5px] font-bold text-slate-200 outline-none cursor-pointer border-0 px-1 py-0.5 -mx-1 rounded"
                  >
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Date */}
                <div className="min-w-0 overflow-hidden bg-app-bg/60 border border-border-base rounded-lg px-2.5 py-2">
                  <div className="text-[8px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1">Date</div>
                  <div className="font-mono text-[11.5px] text-slate-300 break-words">{entry.date || new Date().toLocaleDateString()}</div>
                </div>

                {/* Officer signature (amber) */}
                <div className="min-w-0 rounded-lg px-2.5 py-2"
                  style={{ background: 'rgba(120,80,0,0.2)', border: '1px solid rgba(180,120,0,0.35)' }}>
                  <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#d97706', marginBottom: 4 }}>
                    Officer Signature
                  </div>
                  <div style={{ fontFamily: 'Courier New, monospace', fontSize: 11, fontWeight: 700, color: '#fbbf24', wordBreak: 'break-word' }}>
                    {entry.officerSignature || '—'}
                  </div>
                </div>

                {/* Supervisor signature */}
                <div className="min-w-0">
                  {supSig ? (
                    <div className="rounded-lg px-2.5 py-2 h-full"
                      style={{ background: 'rgba(0,80,30,0.2)', border: '1px solid rgba(0,150,60,0.35)' }}>
                      <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#22c55e', marginBottom: 4 }}>
                        Supervisor Signature
                      </div>
                      <div style={{ fontFamily: 'Courier New, monospace', fontSize: 11, fontWeight: 700, color: '#86efac', wordBreak: 'break-word' }}>
                        {supSig}
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSupSig(''); }}
                        className="mt-1 text-[9px] text-slate-500 hover:text-slate-300 cursor-pointer underline bg-transparent border-0">
                        Clear
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={signAndApprove}
                      className="w-full h-full min-h-[44px] rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] uppercase tracking-[0.5px] cursor-pointer transition-colors border-0">
                      Supervisor Signature
                    </button>
                  )}
                </div>
              </div>
            </div>}
          </div>
        </main>

        {/* RIGHT: officer / record info — desktop only */}
        <aside className="hidden xl:flex flex-col border-l border-border-base bg-app-panel/60 overflow-y-auto max-h-full">
          <div className="px-4 py-3 border-b border-border-faint shrink-0 text-[11px] font-bold uppercase tracking-[0.7px] text-slate-300">Record Info</div>
          <div className="p-3 flex flex-col gap-3">
            <div className="bg-app-card/70 border border-border-base rounded-xl p-3">
              <div className="text-[9.5px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-2">Submitted By</div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-app-elevated border border-border-base flex items-center justify-center shrink-0">
                  <MdShield size={18} className="text-slate-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-semibold text-white truncate">{officer?.name || entry.officerBadge || '—'}</div>
                  <div className="text-[10.5px] text-slate-500">#{officer?.badge || entry.officerBadge} · {officer?.deptShort || '—'}</div>
                </div>
              </div>
            </div>
            <div className="bg-app-card/70 border border-border-base rounded-xl p-3">
              <div className="text-[9.5px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-2">Signatures</div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${entry.officerSignature ? 'bg-amber-400' : 'bg-slate-600'}`} />
                  <span className="text-[11px] text-slate-400">Officer</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${effectiveSupSig ? 'bg-green-400' : 'bg-slate-600'}`} />
                  <span className="text-[11px] text-slate-400">Supervisor</span>
                </div>
              </div>
            </div>
            {(entry.supervisorComments || []).length > 0 && (
              <div className="bg-app-card/70 border border-border-base rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <MdComment size={12} className="text-slate-500" />
                  <div className="text-[9.5px] font-bold uppercase tracking-[0.6px] text-slate-500">Prior Notes</div>
                </div>
                <div className="flex flex-col gap-2">
                  {(entry.supervisorComments || []).map(c => (
                    <div key={c.id} className="rounded-lg p-2.5" style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.18)' }}>
                      <div className="text-[11px] text-slate-300 leading-snug">{c.text}</div>
                      <div className="text-[9.5px] text-slate-600 mt-1.5 font-mono">{c.supervisorBadge} · {c.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Return to Officer modal — works on all screen sizes ── */}
      {returning && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)' }}
          onClick={e => e.target === e.currentTarget && setReturning(false)}>
          <div className="w-full sm:max-w-[480px] rounded-t-2xl sm:rounded-xl p-5 flex flex-col gap-4"
            style={{ background: '#0c1929', border: '1px solid rgba(251,146,60,0.25)' }}>
            <div className="flex items-center gap-2">
              <MdReply size={18} className="text-amber-400 shrink-0" />
              <span className="text-[14px] font-bold text-white flex-1">Return Report to Officer</span>
              <button type="button" onClick={() => setReturning(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
                <MdComment size={16} className="text-slate-500 hover:text-slate-300" />
              </button>
            </div>
            <div className="text-[11.5px] text-slate-400 -mt-1">
              <span className="font-semibold text-amber-400">{officer?.name || entry.officerBadge}</span>
              &nbsp;· {entry.type} · {entry.caseNumber}
            </div>
            {/* Show prior notes if any */}
            {(entry.supervisorComments || []).length > 0 && (
              <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto rounded-lg px-3 py-2.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-slate-600 mb-1">Prior notes</div>
                {(entry.supervisorComments || []).map(c => (
                  <div key={c.id} className="text-[11px] text-slate-400 leading-snug">
                    <span className="text-slate-500 font-mono">{c.supervisorBadge}:</span> {c.text}
                  </div>
                ))}
              </div>
            )}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-amber-500 mb-2">What needs to be corrected? *</div>
              <textarea
                autoFocus
                className="w-full text-[13px] text-slate-200 rounded-xl px-3.5 py-3 resize-none outline-none placeholder:text-slate-600"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(251,146,60,0.28)', minHeight: 100 }}
                placeholder="Describe what the officer needs to fix before this report can be approved…"
                value={commentDraft}
                onChange={e => setCommentDraft(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setReturning(false)}
                className="flex-1 py-2.5 rounded-xl text-[12px] font-bold cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
                Cancel
              </button>
              <button type="button" onClick={handleReturn} disabled={!commentDraft.trim()}
                className="flex-1 py-2.5 rounded-xl text-[12px] font-bold cursor-pointer disabled:opacity-40"
                style={{ background: 'rgba(251,146,60,0.20)', border: '1px solid rgba(251,146,60,0.45)', color: '#fb923c' }}>
                <MdReply size={13} style={{ display: 'inline', marginRight: 5 }} />Send Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════
   LIST ROW
══════════════════════════════════ */
function EntryRow({ entry, officer, onClick, idx }) {
  const rowBg = idx % 2 === 0 ? '' : 'bg-white/[0.02]';
  return (
    <tr onClick={onClick}
      className={`cursor-pointer transition-colors hover:bg-white/[0.05] ${rowBg}`}>
      <td className="px-4 py-3 text-[12px] text-slate-400 border-b border-border-faint whitespace-nowrap font-mono">{entry.date}</td>
      <td className="px-4 py-3 text-[11.5px] text-slate-300 border-b border-border-faint whitespace-nowrap font-mono">{entry.caseNumber || '—'}</td>
      <td className="px-4 py-3 border-b border-border-faint">
        <div className="flex items-center gap-1.5">
          {entry.kind === 'report'
            ? <MdDescription size={13} className="text-sky-500 shrink-0" />
            : <MdFolder size={13} className="text-violet-400 shrink-0" />}
          <span className="text-[12.5px] text-slate-200 whitespace-nowrap">{entry.type}</span>
        </div>
      </td>
      <td className="px-4 py-3 border-b border-border-faint">
        <span className="text-[12px] text-slate-300 font-mono">{officer?.deptShort || '—'}</span>
      </td>
      <td className="px-4 py-3 border-b border-border-faint">
        {officer ? (
          <div className="min-w-0">
            <div className="text-[12.5px] text-slate-200 whitespace-nowrap">{officer.name}</div>
            <div className="text-[10px] text-slate-500 font-mono">{officer.badge}</div>
          </div>
        ) : (
          <span className="text-[12px] text-slate-500 font-mono">{entry.officerBadge || '—'}</span>
        )}
      </td>
      <td className="px-4 py-3 border-b border-border-faint"><StatusPill status={entry.status} /></td>
      <td className="px-3 py-3 border-b border-border-faint text-slate-500 w-8">
        <MdChevronRight size={16} />
      </td>
    </tr>
  );
}

/* Mobile card */
function MobileCard({ entry, officer, onClick }) {
  return (
    <div onClick={onClick}
      className="rounded-xl border border-border-base bg-app-elevated mb-2 cursor-pointer hover:border-brand/40 transition-colors">
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {entry.kind === 'report'
            ? <MdDescription size={15} className="text-sky-500" />
            : <MdFolder size={15} className="text-violet-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-white">{entry.type}</span>
            <StatusPill status={entry.status} />
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
            {entry.caseNumber || '—'} · {officer?.deptShort || '—'} · {entry.date}
          </div>
          {officer && (
            <div className="text-[11px] text-slate-400 mt-0.5">{officer.name} · {officer.badge}</div>
          )}
        </div>
        <MdChevronRight size={16} className="text-slate-500 shrink-0 mt-0.5" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   OFFICER PROFILE VIEW
══════════════════════════════════ */
function OfficerProfileView({ officer, submissions, departments }) {
  const dept = departments.find(d => d.short === officer.deptShort);
  const pending  = submissions.filter(r => r.status === 'Pending Review').length;
  const approved = submissions.filter(r => r.status === 'Approved').length;
  const SC = { AVAILABLE:'#4ade80', ENRT:'#a78bfa', BUSY:'#f87171', ARRVD:'#4ade80', UNAVAILABLE:'#e879f9', OFFDUTY:'#94a3b8' };
  const sc = SC[officer.status] || '#94a3b8';
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 py-4 border-b border-border-faint flex items-center gap-4 shrink-0">
        <div className="w-14 h-14 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center shrink-0">
          <MdShield size={28} className="text-brand-bright" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[18px] font-extrabold text-white tracking-[-0.2px]">{officer.name}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Badge <span className="font-mono text-brand-bright">#{officer.badge}</span>
            {officer.rank && <span className="ml-2 text-slate-500">· {officer.rank}</span>}
          </div>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
          style={{ background: `${sc}22`, color: sc, border: `1px solid ${sc}44` }}>
          {officer.status || 'OFFDUTY'}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {[
            { label: 'Department', value: dept?.name || officer.deptShort || '—' },
            { label: 'Unit ID',    value: officer.unitId || '—', mono: true },
            { label: 'Location',   value: officer.location || '—' },
            { label: 'Call',       value: officer.callId || 'None', mono: !!officer.callId },
          ].map(({ label, value, mono }) => (
            <div key={label} className="bg-app-card/60 border border-border-faint rounded-lg px-3 py-2.5">
              <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-slate-600 mb-0.5">{label}</div>
              <div className={`text-[12.5px] text-slate-200 truncate ${mono ? 'font-mono' : ''}`}>{value}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[{ label:'Total', value: submissions.length, c:'#94a3b8' }, { label:'Pending', value: pending, c:'#fb923c' }, { label:'Approved', value: approved, c:'#4ade80' }].map(s => (
            <div key={s.label} className="bg-app-card/60 border border-border-faint rounded-lg px-3 py-3 text-center">
              <div className="text-[22px] font-extrabold font-mono leading-none" style={{ color: s.c }}>{s.value}</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-slate-600 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-600 mb-2">Recent Submissions</div>
        {submissions.length === 0
          ? <div className="text-[12px] text-slate-600 py-3 text-center">No submissions on file</div>
          : submissions.slice(0, 10).map(r => (
            <div key={`${r.kind}-${r.id}`} className="flex items-center gap-3 py-2 border-b border-border-faint last:border-0">
              {r.kind === 'report'
                ? <MdDescription size={13} className="text-sky-400 shrink-0" />
                : <MdFolder size={13} className="text-violet-400 shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-slate-200 truncate">{r.type}</div>
                <div className="text-[10px] text-slate-600 font-mono">{r.caseNumber || r.recordNumber} · {r.date}</div>
              </div>
              <StatusPill status={r.status} />
            </div>
          ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   CIVILIAN PROFILE VIEW
══════════════════════════════════ */
function CivilianProfileView({ civilian, activeWarrants, civHistory, ptThreshold }) {
  const pts = civilian.licensePoints || 0;
  const pct = ptThreshold > 0 ? pts / ptThreshold : 0;
  const ptC = pts === 0 ? '#4ade80' : pct >= 1 ? '#f87171' : pct >= 0.7 ? '#fb923c' : pct >= 0.4 ? '#facc15' : '#4ade80';
  const ageYrs = (dob) => { if (!dob) return ''; const d = new Date(dob); return isNaN(d) ? '' : Math.abs(new Date(Date.now()-d.getTime()).getUTCFullYear()-1970); };
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 py-4 border-b border-border-faint flex items-center gap-4 shrink-0">
        <div className="w-14 h-14 rounded-xl bg-slate-500/15 border border-slate-500/30 flex items-center justify-center shrink-0 overflow-hidden">
          {civilian.photoUrl ? <img src={civilian.photoUrl} alt="" className="w-full h-full object-cover" /> : <MdPerson size={28} className="text-slate-500" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[18px] font-extrabold text-white">{civilian.firstName} {civilian.lastName}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">DOB {civilian.dob} ({ageYrs(civilian.dob)}) · {civilian.gender}</div>
        </div>
        {activeWarrants.length > 0 && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/25 shrink-0">
            <MdWarningAmber size={12} /> {activeWarrants.length} WARRANT{activeWarrants.length > 1 ? 'S' : ''}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {/* DL info */}
        <div className="bg-app-card/60 border border-border-faint rounded-xl p-4 flex flex-col gap-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500">Driver's License</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[9px] text-slate-600 uppercase tracking-[0.5px] mb-0.5">DL Number</div>
              <div className="text-[12.5px] font-mono text-slate-200">{civilian.dlNumber || '—'}</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-600 uppercase tracking-[0.5px] mb-0.5">Status</div>
              <div className={`text-[13px] font-bold ${civilian.dlStatus === 'SUSPENDED' ? 'text-red-400' : 'text-green-400'}`}>
                {civilian.dlStatus || 'ACTIVE'}
              </div>
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-600 uppercase tracking-[0.5px] mb-1.5">Accumulated Points</div>
            <div className="flex items-center gap-3">
              <span className="text-[22px] font-extrabold font-mono leading-none" style={{ color: ptC }}>{pts}</span>
              <div className="flex-1">
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden mb-1">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(pct*100,100)}%`, background: ptC }} />
                </div>
                <div className="text-[9.5px] text-slate-600">{pts} / {ptThreshold} pts to suspension</div>
              </div>
            </div>
          </div>
        </div>
        {/* Personal */}
        <div className="bg-app-card/60 border border-border-faint rounded-xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-3">Personal Info</div>
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
            {[['SSN', civilian.ssn, true],['Occupation', civilian.occupation],['Height', civilian.height],['Weight', civilian.weight],['Hair', civilian.hair],['Eyes', civilian.eyes]]
              .filter(([,v]) => v).map(([l, v, mono]) => (
                <div key={l}>
                  <div className="text-[9px] text-slate-600 uppercase tracking-[0.5px]">{l}</div>
                  <div className={`text-[12px] text-slate-300 ${mono ? 'font-mono' : ''}`}>{v}</div>
                </div>
              ))}
          </div>
          {civilian.flags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border-faint">
              {civilian.flags.map(f => (
                <span key={f} className="px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/25">{f}</span>
              ))}
            </div>
          )}
        </div>
        {/* Active warrants */}
        {activeWarrants.length > 0 && (
          <div className="bg-red-500/[0.05] border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <MdWarningAmber size={13} className="text-red-400" />
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-red-400">Active Warrants</div>
            </div>
            {activeWarrants.map(w => (
              <div key={w.id} className="py-2 border-b border-red-500/10 last:border-0">
                <div className="text-[12px] font-semibold text-slate-200">{w.charge}</div>
                <div className="text-[10.5px] text-slate-500 mt-0.5">{w.type} · {w.issuedDate || w.date || ''}</div>
              </div>
            ))}
          </div>
        )}
        {/* Criminal history */}
        <div className="bg-app-card/60 border border-border-faint rounded-xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-2">Criminal History ({civHistory.length})</div>
          {civHistory.length === 0
            ? <div className="text-[12px] text-slate-600">No criminal history on file</div>
            : civHistory.slice(0, 6).map(h => (
              <div key={h.id} className="flex items-start justify-between gap-2 py-2 border-b border-border-faint last:border-0">
                <div className="min-w-0">
                  <div className="text-[12px] text-slate-200 truncate">{h.charges?.join(', ')}</div>
                  <div className="text-[10px] text-slate-600 font-mono mt-0.5">{h.caseNumber} · {h.date}</div>
                </div>
                {h.disposition && <span className="shrink-0 text-[9.5px] px-1.5 py-0.5 rounded border text-slate-400 border-border-faint whitespace-nowrap">{h.disposition}</span>}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   PERSONNEL LOOKUP
══════════════════════════════════ */
function PersonnelLookup({ officers, civilians, warrants, criminalHistory, reports, records, licensePointsConfig, departments }) {
  const [type, setType]           = useState('officers');
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState([]);
  const [searched, setSearched]   = useState(false);
  const [selected, setSelected]   = useState(null);

  const ptThreshold = licensePointsConfig?.threshold || 12;

  const doSearch = () => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    if (type === 'officers') {
      setResults(officers.filter(o => o.name?.toLowerCase().includes(q) || o.badge?.toLowerCase().includes(q)));
    } else {
      setResults(civilians.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.dlNumber?.toLowerCase().includes(q) || c.ssn?.includes(q)
      ));
    }
    setSearched(true);
    setSelected(null);
  };

  const selOfficer  = type === 'officers'  && selected ? officers.find(o => o.id === selected)  : null;
  const selCivilian = type === 'civilians' && selected ? civilians.find(c => c.id === selected)  : null;

  const officerSubmissions = selOfficer ? [
    ...reports.filter(r => r.officerBadge === selOfficer.badge).map(r => ({ ...r, kind: 'report' })),
    ...records.filter(r => r.officerBadge === selOfficer.badge).map(r => ({ ...r, kind: 'record' })),
  ].sort((a, b) => (b.date || '').localeCompare(a.date || '')) : [];

  const civWarrants     = selCivilian ? warrants.filter(w => w.civilianId === selCivilian.id) : [];
  const civHistory      = selCivilian ? criminalHistory.filter(h => h.civilianId === selCivilian.id) : [];
  const activeWarrants  = civWarrants.filter(w => w.status === 'ACTIVE');

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-[320px_1fr]">
      {/* ── Left: search + results ── */}
      <div className="bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm flex flex-col">
        {/* Type toggle */}
        <div className="flex gap-1 p-2 border-b border-border-faint shrink-0">
          {[['officers', MdShield, 'Officers'], ['civilians', MdPerson, 'Civilians']].map(([v, Icon, l]) => (
            <button key={v} type="button"
              onClick={() => { setType(v); setResults([]); setSearched(false); setSelected(null); setQuery(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold cursor-pointer transition-all border ${type === v ? 'bg-brand/15 border-brand/40 text-brand-bright' : 'bg-transparent border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'}`}>
              <Icon size={14} /> {l}
            </button>
          ))}
        </div>
        {/* Search input */}
        <div className="p-3 border-b border-border-faint shrink-0">
          <div className="flex gap-2">
            <input
              className="flex-1 bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-brand/60 transition-all"
              placeholder={type === 'officers' ? 'Name or badge #…' : 'Name, DL # or SSN…'}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
            />
            <button type="button" onClick={doSearch}
              className="shrink-0 flex items-center justify-center px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-colors">
              <MdSearch size={17} />
            </button>
          </div>
        </div>
        {/* Results list */}
        <div className="flex-1 overflow-y-auto max-h-[50vh] lg:max-h-none">
          {!searched ? (
            <div className="p-4 text-[11px] text-slate-600 leading-relaxed">
              Search for {type === 'officers' ? 'an officer by name or badge #' : 'a civilian by name, DL #, or SSN'}
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-slate-600 text-[12px]">No {type} found</div>
          ) : (
            <div className="flex flex-col gap-1 p-2">
              {results.map(r => {
                const on = selected === r.id;
                const base = `text-left px-3 py-2.5 rounded-lg cursor-pointer border transition-all w-full ${on ? 'bg-brand/15 border-brand/40' : 'bg-white/[0.02] border-border-faint hover:bg-white/[0.05] hover:border-border-base'}`;
                if (type === 'officers') {
                  const subs = reports.filter(rp => rp.officerBadge === r.badge).length + records.filter(rc => rc.officerBadge === r.badge).length;
                  return (
                    <button key={r.id} type="button" className={base} onClick={() => setSelected(r.id)}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-[11px] font-bold text-brand-bright">#{r.badge}</span>
                        <span className="text-[12.5px] font-bold text-white truncate">{r.name}</span>
                      </div>
                      <div className="text-[10.5px] text-slate-500">{r.rank} · {r.deptShort || '—'} · {subs} submissions</div>
                    </button>
                  );
                }
                const pts = r.licensePoints || 0;
                return (
                  <button key={r.id} type="button" className={base} onClick={() => setSelected(r.id)}>
                    <div className="text-[12.5px] font-bold text-white">{r.firstName} {r.lastName}</div>
                    <div className="text-[10.5px] text-slate-500 font-mono mt-0.5">DOB {r.dob} · DL {r.dlNumber || '—'}</div>
                    <div className="flex gap-1 mt-1.5 flex-wrap items-center">
                      {r.dlStatus === 'SUSPENDED' && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-orange-500/15 text-orange-400 border border-orange-500/25">DL SUSP</span>}
                      {r.flags?.map(f => <span key={f} className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/25">{f}</span>)}
                      {pts > 0 && <span className="text-[9.5px] text-slate-500 font-mono">{pts} pts</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: profile detail ── */}
      <div className="bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm" style={{ minHeight: 320 }}>
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16 text-slate-600">
            <MdSearch size={44} className="opacity-20" />
            <div className="text-[12px] text-slate-500">Select a person to view their profile</div>
          </div>
        ) : selOfficer ? (
          <OfficerProfileView officer={selOfficer} submissions={officerSubmissions} departments={departments} />
        ) : selCivilian ? (
          <CivilianProfileView civilian={selCivilian} activeWarrants={activeWarrants} civHistory={civHistory} ptThreshold={ptThreshold} />
        ) : null}
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   MAIN
══════════════════════════════════ */
export default function Supervisor() {
  const { state, dispatch } = useCAD();
  const {
    reports, records, officers, currentUser,
    reportTemplates = [], recordTemplates = [], communityConfig, departments = [],
    civilians = [], warrants = [], criminalHistory = [], licensePointsConfig = {},
  } = state;

  const [portalMode, setPortalMode]     = useState('submissions');
  const [deptFilter, setDeptFilter]     = useState('All');
  const [typeFilter, setTypeFilter]     = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch]             = useState('');
  const [openEntry, setOpenEntry]       = useState(null); // null = list, object = edit

  const combined = useMemo(() => [
    ...reports.map(r => ({ ...r, kind: 'report' })),
    ...records.map(r => ({ ...r, kind: 'record' })),
  ], [reports, records]);

  const deptOptions = useMemo(() => {
    const seen = new Set();
    officers.forEach(o => { if (o.deptShort) seen.add(o.deptShort); });
    return ['All', ...Array.from(seen).sort()];
  }, [officers]);

  const typeOptions = useMemo(() => {
    const seen = new Set();
    combined.forEach(e => { if (e.type) seen.add(e.type); });
    return ['All', ...Array.from(seen).sort()];
  }, [combined]);

  const officerByBadge = useMemo(() => {
    const map = {};
    officers.forEach(o => { map[o.badge] = o; });
    return map;
  }, [officers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return combined.filter(entry => {
      const officer = officerByBadge[entry.officerBadge];
      if (deptFilter !== 'All' && officer?.deptShort !== deptFilter) return false;
      if (typeFilter !== 'All' && entry.type !== typeFilter) return false;
      if (statusFilter !== 'All' && entry.status !== statusFilter) return false;
      if (q) {
        const hay = [entry.caseNumber, entry.officerBadge, officer?.name, entry.type, entry.status]
          .filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date) || String(b.caseNumber).localeCompare(String(a.caseNumber)));
  }, [combined, deptFilter, typeFilter, statusFilter, search, officerByBadge]);

  const reportCount = filtered.filter(e => e.kind === 'report').length;
  const recordCount = filtered.filter(e => e.kind === 'record').length;
  const STATUS_PILLS = ['All', 'Pending Review', 'Pending Changes', 'Approved', 'Rejected'];

  /* ── Open / save handlers ── */
  const openRecord = (entry) => {
    // Re-hydrate from current state so edits made mid-session are reflected
    const latest = entry.kind === 'report'
      ? reports.find(r => r.id === entry.id)
      : records.find(r => r.id === entry.id);
    setOpenEntry({ ...(latest || entry), kind: entry.kind });
  };

  const saveEntry = ({ id, kind, formData, status, supervisorSignature }) => {
    if (kind === 'report') {
      dispatch({
        type: 'UPDATE_REPORT',
        payload: { id, formData, status, ...(supervisorSignature ? { supervisorSignature } : {}) },
      });
    } else {
      dispatch({
        type: 'UPDATE_RECORD',
        payload: { id, formData, status, ...(supervisorSignature ? { supervisorSignature } : {}) },
      });
    }
    // Update the open entry to reflect saved state
    setOpenEntry(prev => ({ ...prev, formData, status, ...(supervisorSignature ? { supervisorSignature } : {}) }));
  };

  /* ── If a record is open, show full editor ── */
  if (openEntry) {
    const allTpls = [...reportTemplates, ...recordTemplates];
    const template = allTpls.find(t => t.name === openEntry.type);
    const officer = officerByBadge[openEntry.officerBadge];
    return (
      <RecordEditor
        entry={openEntry}
        officer={officer}
        template={template}
        currentUser={currentUser}
        allOfficers={officers}
        communityConfig={communityConfig}
        departments={departments}
        onBack={() => setOpenEntry(null)}
        onSave={saveEntry}
      />
    );
  }

  /* ── List view ── */
  return (
    <div className="flex-1 overflow-auto p-4 lg:p-5 font-ui">

      {/* Page header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center shrink-0">
          <MdSupervisorAccount size={20} className="text-brand-bright" />
        </div>
        <div className="min-w-0">
          <h1 className="text-[15px] font-bold text-white leading-none">Supervisor Portal</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {portalMode === 'submissions' ? 'Click any row to open the full editable record' : 'Search officers and civilians by name, badge, DL #, or SSN'}
          </p>
        </div>
        {portalMode === 'submissions' && (
          <div className="ml-auto shrink-0 text-[11.5px] text-slate-500 font-mono">
            <span className="text-sky-400 font-bold">{reportCount}</span>R&nbsp;·&nbsp;
            <span className="text-violet-400 font-bold">{recordCount}</span>Rec&nbsp;·&nbsp;
            <span className="text-white font-bold">{filtered.length}</span>
          </div>
        )}
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1.5 mb-4">
        {[
          { id: 'submissions', icon: MdOutlineRateReview, label: 'Submissions' },
          { id: 'personnel',   icon: MdPerson,            label: 'Personnel Lookup' },
        ].map(({ id, icon: Icon, label }) => (
          <button key={id} type="button"
            onClick={() => setPortalMode(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold cursor-pointer transition-all border
              ${portalMode === id
                ? 'bg-brand/15 border-brand/40 text-brand-bright'
                : 'bg-app-panel/60 border-border-base text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── Personnel Lookup ── */}
      {portalMode === 'personnel' && (
        <PersonnelLookup
          officers={officers}
          civilians={civilians}
          warrants={warrants}
          criminalHistory={criminalHistory}
          reports={reports}
          records={records}
          licensePointsConfig={licensePointsConfig}
          departments={departments}
        />
      )}

      {/* ── Submissions mode ── */}
      {portalMode === 'submissions' && <>
      <div className="bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm mb-4">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-faint">
          <MdFilterList size={14} className="text-slate-400 shrink-0" />
          <span className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-slate-400">Filters</span>
        </div>

        <div className="flex items-center gap-2 px-4 pt-3">
          <div className="flex items-center gap-2 flex-1 min-w-0 bg-app-input border border-border-base rounded-lg px-3 py-2">
            <MdSearch size={14} className="text-slate-500 shrink-0" />
            <input
              className="flex-1 min-w-0 bg-transparent text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none"
              placeholder="Officer name, badge, case #…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')}
                className="text-slate-600 hover:text-slate-300 cursor-pointer text-[11px] font-bold shrink-0">✕</button>
            )}
          </div>
          <select
            className="bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 outline-none cursor-pointer shrink-0"
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
          >
            <option value="All">All Depts</option>
            {deptOptions.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2 px-4 pt-2">
          <select
            className="bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 outline-none cursor-pointer w-full"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            {typeOptions.slice(1).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            className="bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 outline-none cursor-pointer w-full"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex gap-1.5 px-4 py-3 overflow-x-auto">
          {STATUS_PILLS.map(s => {
            const active = statusFilter === s;
            const m = s === 'All' ? null : STATUS_META[s];
            return (
              <button key={s} type="button" onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.3px] rounded-full border whitespace-nowrap cursor-pointer transition-all shrink-0
                  ${active
                    ? (m ? m.active : 'bg-brand text-white border-brand')
                    : (m ? m.pill : 'bg-transparent text-slate-500 border-border-base hover:text-slate-200')
                  }`}>
                {s}
                {s !== 'All' && (
                  <span className="ml-1 opacity-60">
                    {combined.filter(e => e.status === s).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-faint">
          <MdOutlineRateReview size={15} className="text-slate-400" />
          <span className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-slate-400">Submissions</span>
          <span className="ml-auto text-[11px] text-slate-600 font-mono">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-slate-600">
            <MdFolder size={36} className="opacity-30" />
            <div className="text-[13px] font-semibold text-slate-500">No results match your filters</div>
            <div className="text-[11px] text-slate-600">Try adjusting the search or filter options.</div>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['Date', 'Case #', 'Type', 'Dept', 'Officer', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 bg-app-bg/60 border-b border-border-base whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry, idx) => (
                    <EntryRow
                      key={`${entry.kind}-${entry.id}`}
                      entry={entry}
                      officer={officerByBadge[entry.officerBadge]}
                      idx={idx}
                      onClick={() => openRecord(entry)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="block sm:hidden p-3">
              {filtered.map(entry => (
                <MobileCard
                  key={`${entry.kind}-${entry.id}`}
                  entry={entry}
                  officer={officerByBadge[entry.officerBadge]}
                  onClick={() => openRecord(entry)}
                />
              ))}
            </div>
          </>
        )}
      </div>
      </>}
    </div>
  );
}
