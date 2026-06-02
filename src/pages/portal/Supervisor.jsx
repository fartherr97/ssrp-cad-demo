import { useState, useMemo } from 'react';
import {
  MdSupervisorAccount, MdSearch, MdFilterList, MdChevronRight, MdExpandMore,
  MdDescription, MdFolder, MdDownload, MdCheckCircle, MdCancel, MdEdit,
  MdOutlineRateReview,
} from 'react-icons/md';
import { useCAD } from '../../store/cadStore';

/* ── Status helpers ── */
const STATUS_META = {
  'Submitted':      { pill: 'bg-sky-500/15 text-sky-400 border-sky-500/30',    active: 'bg-sky-500 text-white border-sky-500' },
  'Pending Review': { pill: 'bg-amber-500/15 text-amber-400 border-amber-500/30', active: 'bg-amber-500 text-white border-amber-500' },
  'Approved':       { pill: 'bg-green-500/15 text-green-400 border-green-500/30',  active: 'bg-green-600 text-white border-green-600' },
  'Rejected':       { pill: 'bg-red-500/15 text-red-400 border-red-500/30',        active: 'bg-red-600 text-white border-red-600' },
};

function StatusPill({ status }) {
  const m = STATUS_META[status] || { pill: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
  return (
    <span className={`inline-flex items-center leading-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.3px] rounded-full border ${m.pill}`}>
      {status}
    </span>
  );
}

/* ── PDF export ── */
function exportPdf(entry, officer) {
  const rows = [
    ['Case #',     entry.caseNumber || '—'],
    ['Type',       entry.type || '—'],
    ['Date',       entry.date || '—'],
    ['Status',     entry.status || '—'],
    ['Officer',    officer ? `${officer.name} · ${officer.badge}` : (entry.officerBadge || '—')],
    ['Department', officer?.deptShort || '—'],
    ['Rank',       officer?.rank || '—'],
    ...(entry.callId ? [['Call ID', entry.callId]] : []),
  ];

  const extraRows = entry.formValues
    ? Object.entries(entry.formValues).filter(([, v]) => v && String(v).trim()).slice(0, 8)
    : [];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${entry.type} — ${entry.caseNumber}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,Helvetica,sans-serif;color:#111;background:#fff;padding:40px;max-width:760px;margin:0 auto}
  h1{font-size:22px;font-weight:700;margin-bottom:4px}
  .sub{color:#666;font-size:12px;margin-bottom:28px}
  table{width:100%;border-collapse:collapse;margin-bottom:20px}
  td{padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;vertical-align:top}
  td:first-child{font-weight:700;width:140px;color:#444;white-space:nowrap}
  .section{font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:#888;margin:22px 0 8px}
  .summary{padding:14px;background:#f6f6f6;border-radius:6px;font-size:13px;line-height:1.6;border:1px solid #e0e0e0}
  @media print{body{padding:20px}}
</style>
</head>
<body>
<h1>${entry.type || 'Report'} — ${entry.caseNumber || 'No Case #'}</h1>
<div class="sub">Generated ${new Date().toLocaleString()} · SSRP CAD</div>
<div class="section">Case Details</div>
<table>${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
${entry.summary ? `<div class="section">Summary</div><div class="summary">${entry.summary}</div>` : ''}
${extraRows.length ? `<div class="section">Form Data</div><table>${extraRows.map(([k, v]) => `<tr><td>${k}</td><td>${String(v).slice(0, 300)}</td></tr>`).join('')}</table>` : ''}
<div style="margin-top:40px;border-top:1px solid #ddd;padding-top:16px;font-size:11px;color:#aaa">
  Sunshine State Roleplay · Computer Aided Dispatch · ${new Date().toLocaleDateString()}
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  w?.addEventListener('load', () => w.print());
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/* ── Expanded detail panel ── */
function DetailPanel({ entry, officer, onSignOff }) {
  const rows = [
    { label: 'Case #',     value: entry.caseNumber },
    { label: 'Type',       value: entry.type },
    { label: 'Date',       value: entry.date },
    { label: 'Status',     value: <StatusPill status={entry.status} /> },
    { label: 'Officer',    value: officer ? `${officer.name} · ${officer.badge}` : entry.officerBadge },
    { label: 'Dept',       value: officer?.deptShort || '—' },
    { label: 'Rank',       value: officer?.rank || '—' },
    ...(entry.callId ? [{ label: 'Call ID', value: entry.callId }] : []),
  ];

  const extraFields = entry.formValues
    ? Object.entries(entry.formValues).filter(([, v]) => v && typeof v === 'string' && v.trim()).slice(0, 6)
    : [];

  const canApprove = entry.status !== 'Approved';
  const canReject  = entry.status !== 'Rejected';

  return (
    <div className="px-4 pb-4 pt-3 bg-white/[0.02] border-t border-border-faint">
      {/* Detail grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0 mb-4 max-w-3xl">
        {rows.map(r => (
          <div key={r.label} className="flex items-start gap-2 py-1.5 border-b border-border-faint last:border-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-slate-500 w-20 shrink-0 pt-0.5">{r.label}</span>
            <span className="text-[12.5px] text-slate-200 flex-1">{r.value}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      {entry.summary && (
        <div className="mb-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1.5">Summary</div>
          <div className="text-[12.5px] text-slate-300 leading-relaxed bg-app-bg/40 rounded-lg px-3 py-2.5 border border-border-faint">
            {entry.summary}
          </div>
        </div>
      )}

      {/* Extra form fields */}
      {extraFields.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1.5">Form Data</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            {extraFields.map(([k, v]) => (
              <div key={k} className="flex items-start gap-2 py-1 border-b border-border-faint last:border-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.4px] text-slate-600 w-20 shrink-0 pt-0.5 truncate">{k}</span>
                <span className="text-[11.5px] text-slate-400 flex-1 break-words">{String(v).slice(0, 120)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border-faint">
        <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-slate-500 mr-1">Sign Off:</span>

        {canApprove && (
          <button type="button" onClick={() => onSignOff('Approved')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-[11.5px] font-bold cursor-pointer transition-all border-0">
            <MdCheckCircle size={14} /> Approve
          </button>
        )}
        {canReject && (
          <button type="button" onClick={() => onSignOff('Rejected')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11.5px] font-bold cursor-pointer transition-all border-0">
            <MdCancel size={14} /> Reject
          </button>
        )}
        <button type="button" onClick={() => onSignOff('Pending Review')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-[11.5px] font-bold cursor-pointer transition-all border border-amber-500/30">
          <MdEdit size={13} /> Request Changes
        </button>

        <div className="ml-auto">
          <button type="button" onClick={() => exportPdf(entry, officer)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-elevated border border-border-base text-slate-300 hover:text-white text-[11.5px] font-semibold cursor-pointer transition-all hover:bg-white/[0.07]">
            <MdDownload size={14} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Mobile card ── */
function SubmissionCard({ entry, officer, isExpanded, onToggle, onSignOff }) {
  const m = STATUS_META[entry.status] || { pill: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
  return (
    <div className={`rounded-xl border overflow-hidden transition-colors mb-2 ${isExpanded ? 'border-brand/40 bg-brand/[0.04]' : 'border-border-base bg-app-elevated'}`}>
      <button type="button" onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-start gap-3 cursor-pointer">
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
        <div className="text-slate-500 shrink-0 mt-0.5">
          {isExpanded ? <MdExpandMore size={16} /> : <MdChevronRight size={16} />}
        </div>
      </button>
      {isExpanded && <DetailPanel entry={entry} officer={officer} onSignOff={onSignOff} />}
    </div>
  );
}

/* ══════════════════════════════════
   MAIN
══════════════════════════════════ */
export default function Supervisor() {
  const { state, dispatch } = useCAD();
  const { reports, records, officers } = state;

  const [deptFilter, setDeptFilter]     = useState('All');
  const [typeFilter, setTypeFilter]     = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch]             = useState('');
  const [expandedId, setExpandedId]     = useState(null);

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

  const STATUS_PILLS = ['All', 'Submitted', 'Pending Review', 'Approved', 'Rejected'];

  const signOff = (entry, newStatus) => {
    if (entry.kind === 'report') {
      dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id: entry.id, status: newStatus } });
    } else {
      dispatch({ type: 'UPDATE_RECORD_STATUS', payload: { id: entry.id, status: newStatus } });
    }
  };

  const toggleRow = (uid) => setExpandedId(prev => prev === uid ? null : uid);

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-5 font-ui">

      {/* Page header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center shrink-0">
          <MdSupervisorAccount size={20} className="text-brand-bright" />
        </div>
        <div className="min-w-0">
          <h1 className="text-[15px] font-bold text-white leading-none">Supervisor Portal</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Review all submitted reports and records</p>
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

        {/* Row 1: search + dept */}
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
            className="bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 outline-none cursor-pointer focus:border-brand/60 shrink-0"
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
          >
            <option value="All">All Depts</option>
            {deptOptions.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Row 2: type + status */}
        <div className="grid grid-cols-2 gap-2 px-4 pt-2">
          <select
            className="bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 outline-none cursor-pointer focus:border-brand/60 w-full"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            {typeOptions.slice(1).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            className="bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 outline-none cursor-pointer focus:border-brand/60 w-full"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {['Submitted', 'Pending Review', 'Approved', 'Rejected'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Row 3: quick status pills */}
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
                  {filtered.map((entry, idx) => {
                    const uid = `${entry.kind}-${entry.id}`;
                    const officer = officerByBadge[entry.officerBadge];
                    const isExpanded = expandedId === uid;
                    const rowBg = idx % 2 === 0 ? '' : 'bg-white/[0.02]';

                    return [
                      <tr
                        key={uid}
                        onClick={() => toggleRow(uid)}
                        className={`cursor-pointer transition-colors hover:bg-white/[0.05] ${rowBg} ${isExpanded ? 'bg-brand/[0.06]' : ''}`}
                      >
                        <td className="px-4 py-3 text-[12px] text-slate-400 border-b border-border-faint whitespace-nowrap font-mono">
                          {entry.date}
                        </td>
                        <td className="px-4 py-3 text-[11.5px] text-slate-300 border-b border-border-faint whitespace-nowrap font-mono">
                          {entry.caseNumber || '—'}
                        </td>
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
                        <td className="px-4 py-3 border-b border-border-faint">
                          <StatusPill status={entry.status} />
                        </td>
                        <td className="px-3 py-3 border-b border-border-faint text-slate-500 w-8">
                          {isExpanded ? <MdExpandMore size={16} /> : <MdChevronRight size={16} />}
                        </td>
                      </tr>,
                      isExpanded && (
                        <tr key={`${uid}-detail`}>
                          <td colSpan={7} className="border-b border-border-base">
                            <DetailPanel
                              entry={entry}
                              officer={officer}
                              onSignOff={(newStatus) => signOff(entry, newStatus)}
                            />
                          </td>
                        </tr>
                      ),
                    ];
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="block sm:hidden p-3">
              {filtered.map(entry => {
                const uid = `${entry.kind}-${entry.id}`;
                const officer = officerByBadge[entry.officerBadge];
                return (
                  <SubmissionCard
                    key={uid}
                    entry={entry}
                    officer={officer}
                    isExpanded={expandedId === uid}
                    onToggle={() => toggleRow(uid)}
                    onSignOff={(newStatus) => signOff(entry, newStatus)}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
