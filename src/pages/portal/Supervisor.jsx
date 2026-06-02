import { useState, useMemo } from 'react';
import {
  MdSupervisorAccount, MdSearch, MdFilterList, MdChevronRight,
  MdDescription, MdFolder, MdDownload, MdOutlineRateReview, MdArrowBack,
  MdSave, MdCheckCircle, MdShield,
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
function RecordEditor({ entry, officer, template, currentUser, allOfficers, communityConfig, onBack, onSave }) {
  const [editData, setEditData]     = useState({ ...(entry.formData || {}) });
  const [status, setStatus]         = useState(entry.status || 'Pending Review');
  const [supSig, setSupSig]         = useState(entry.supervisorSignature || '');
  const [saved, setSaved]           = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const buildSupSig = () => {
    const me = allOfficers.find(o => o.id === currentUser?.id);
    if (me) return `${me.badge} | ${(me.rank || me.role || 'SUPERVISOR').toUpperCase()} | ${me.name.toUpperCase()}`;
    return `${currentUser?.badge || '—'} | SUPERVISOR | ${(currentUser?.name || '—').toUpperCase()}`;
  };

  const signAndApprove = () => { setSupSig(buildSupSig()); setStatus('Approved'); };

  const handleSave = () => {
    onSave({ id: entry.id, kind: entry.kind, formData: editData, status, supervisorSignature: supSig || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        agency: officer?.deptShort || communityConfig?.name || 'SSRP',
        logoUrl: communityConfig?.logoUrl,
        officerSignature: entry.officerSignature,
        supervisorSignature: supSig || entry.supervisorSignature,
      });
    } finally { setPdfLoading(false); }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden font-ui">

      {/* ── Top bar — mirrors ReportsCenter exactly ── */}
      <div className="shrink-0 bg-app-toolbar/80 backdrop-blur-md border-b border-border-base">
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 px-4 pt-2.5 pb-1.5">
          <button type="button" onClick={onBack}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer transition-colors mr-1">
            <MdArrowBack size={14} /> Back
          </button>
          {entry.kind === 'report'
            ? <MdDescription size={18} className="text-brand-bright shrink-0" />
            : <MdFolder size={18} className="text-violet-400 shrink-0" />}
          <span className="text-[13px] font-bold text-white uppercase tracking-[0.4px]">Supervisor Review</span>
          <span className="text-[11px] text-slate-500">{entry.type}</span>
          <span className="ml-auto flex items-center gap-2">
            {saved && (
              <span className="flex items-center gap-1 text-[11px] text-green-400 font-semibold">
                <MdCheckCircle size={13} /> Saved
              </span>
            )}
            <button type="button" onClick={handleExport} disabled={pdfLoading}
              className={xs(S_BTN_SECONDARY)}>
              <MdDownload size={13} /> {pdfLoading ? '…' : 'PDF'}
            </button>
            <button type="button" onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11.5px] font-bold cursor-pointer transition-all border-0">
              <MdSave size={13} /> Save Changes
            </button>
          </span>
        </div>
      </div>

      {/* ── Body: left sidebar + center form + right sidebar ──
           Mobile: outer div scrolls everything (overflow-auto, no inner overflow-hidden)
           Desktop xl: each column scrolls independently (outer overflow-hidden, inner overflow-auto) ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[240px_minmax(0,1fr)_260px] overflow-auto xl:overflow-hidden">

        {/* LEFT: case meta */}
        <aside className="flex flex-col border-b xl:border-b-0 xl:border-r border-border-base bg-app-panel/60 xl:overflow-y-auto xl:max-h-full">
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
            <div className="flex flex-col gap-0.5 py-2">
              <span className="text-[9.5px] uppercase tracking-[0.5px] text-slate-500">Status</span>
              <StatusPill status={status} />
            </div>
          </div>
        </aside>

        {/* CENTER: dark form (same as report writing) */}
        <main className="flex flex-col xl:min-h-0 xl:overflow-hidden">
          {/* Status bar */}
          <div className="shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 px-4 py-3 bg-app-panel/40 border-b border-border-faint">
            <div>
              <div className="text-[9px] uppercase tracking-[0.5px] text-slate-500">Report Status</div>
              <div className="mt-1"><StatusPill status={status} /></div>
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
              <div className="text-[12.5px] text-slate-200 mt-0.5">{supSig ? '✓ Signed' : 'Not signed'}</div>
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

            {/* ── Status / Signature section at bottom of form ── */}
            <div data-section="Status" className="mt-6 rounded-xl overflow-hidden border border-border-base">
              <div className="bg-red-600 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.7px] text-white">
                Status
              </div>
              <div className="bg-app-panel/80 p-4 grid grid-cols-2 gap-3">

                {/* Status selector */}
                <div className="min-w-0 bg-app-bg/60 border border-border-base rounded-lg p-3">
                  <div className="text-[8px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-2">Status</div>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full bg-transparent text-[13px] font-bold text-slate-200 outline-none cursor-pointer border-0"
                  >
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Date */}
                <div className="min-w-0 overflow-hidden bg-app-bg/60 border border-border-base rounded-lg p-3">
                  <div className="text-[8px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-2">Date</div>
                  <div className="font-mono text-[13px] text-slate-300 break-words">{entry.date || new Date().toLocaleDateString()}</div>
                </div>

                {/* Officer signature (amber) */}
                <div className="min-w-0 rounded-lg p-3"
                  style={{ background: 'rgba(120,80,0,0.2)', border: '1px solid rgba(180,120,0,0.35)' }}>
                  <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#d97706', marginBottom: 6 }}>
                    Observing Officer's Signature
                  </div>
                  <div style={{ fontFamily: 'Courier New, monospace', fontSize: 13, fontWeight: 700, color: '#fbbf24', wordBreak: 'break-word' }}>
                    {entry.officerSignature || '—'}
                  </div>
                </div>

                {/* Supervisor signature */}
                <div className="min-w-0">
                  {supSig ? (
                    <div className="rounded-lg p-3 h-full"
                      style={{ background: 'rgba(0,80,30,0.2)', border: '1px solid rgba(0,150,60,0.35)' }}>
                      <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#22c55e', marginBottom: 6 }}>
                        Supervisor Signature
                      </div>
                      <div style={{ fontFamily: 'Courier New, monospace', fontSize: 13, fontWeight: 700, color: '#86efac', wordBreak: 'break-word' }}>
                        {supSig}
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSupSig(''); }}
                        className="mt-1 text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer underline bg-transparent border-0">
                        Clear
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={signAndApprove}
                      className="w-full h-full min-h-[56px] rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[13px] uppercase tracking-[0.7px] cursor-pointer transition-colors border-0">
                      Supervisor Signature
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT: officer / record info */}
        <aside className="flex flex-col border-t xl:border-t-0 xl:border-l border-border-base bg-app-panel/60 xl:overflow-y-auto xl:max-h-full">
          <div className="px-4 py-3 border-b border-border-faint shrink-0 text-[11px] font-bold uppercase tracking-[0.7px] text-slate-300">Record Info</div>
          <div className="p-3 flex flex-col gap-3">
            {/* Submitting officer */}
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
            {/* Sig status */}
            <div className="bg-app-card/70 border border-border-base rounded-xl p-3">
              <div className="text-[9.5px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-2">Signatures</div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${entry.officerSignature ? 'bg-amber-400' : 'bg-slate-600'}`} />
                  <span className="text-[11px] text-slate-400">Officer</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${supSig ? 'bg-green-400' : 'bg-slate-600'}`} />
                  <span className="text-[11px] text-slate-400">Supervisor</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
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
   MAIN
══════════════════════════════════ */
export default function Supervisor() {
  const { state, dispatch } = useCAD();
  const {
    reports, records, officers, currentUser,
    reportTemplates = [], recordTemplates = [], communityConfig,
  } = state;

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
          <p className="text-[11px] text-slate-500 mt-0.5">Click any row to open the full editable record</p>
        </div>
        <div className="ml-auto shrink-0 text-[11.5px] text-slate-500 font-mono">
          <span className="text-sky-400 font-bold">{reportCount}</span>R&nbsp;·&nbsp;
          <span className="text-violet-400 font-bold">{recordCount}</span>Rec&nbsp;·&nbsp;
          <span className="text-white font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* ── Filter bar ── */}
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

      {/* ── Submissions ── */}
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
    </div>
  );
}
