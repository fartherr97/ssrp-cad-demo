import { useState, useMemo } from 'react';
import {
  MdSupervisorAccount, MdSearch, MdFilterList, MdChevronRight, MdExpandMore,
  MdDescription, MdFolder,
} from 'react-icons/md';
import { useCAD } from '../../store/cadStore';

const S_INPUT = 'bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-brand/60';
const S_SELECT = 'bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 outline-none cursor-pointer focus:border-brand/60';

function statusBadge(status) {
  switch (status) {
    case 'Approved':       return { bg: 'bg-green-500/15 text-green-400 border-green-500/30' };
    case 'Submitted':      return { bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30' };
    case 'Pending Review': return { bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
    case 'Rejected':       return { bg: 'bg-red-500/15 text-red-400 border-red-500/30' };
    default:               return { bg: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
  }
}

function StatusPill({ status }) {
  const { bg } = statusBadge(status);
  return (
    <span className={`inline-flex items-center leading-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.3px] rounded-full border ${bg}`}>
      {status}
    </span>
  );
}

function DetailPanel({ entry, officer }) {
  const rows = [
    { label: 'Case #',  value: entry.caseNumber },
    { label: 'Type',    value: entry.type },
    { label: 'Date',    value: entry.date },
    { label: 'Status',  value: <StatusPill status={entry.status} /> },
    { label: 'Officer', value: officer ? `${officer.name} · ${officer.badge}` : entry.officerBadge },
    { label: 'Dept',    value: officer?.deptShort || '—' },
    { label: 'Rank',    value: officer?.rank || '—' },
    ...(entry.callId ? [{ label: 'Call ID', value: entry.callId }] : []),
    ...(entry.kind === 'report' && entry.civilianId != null
      ? [{ label: 'Civilian ID', value: String(entry.civilianId) }]
      : []),
  ];

  const extraFields = entry.formValues
    ? Object.entries(entry.formValues)
        .filter(([, v]) => v && typeof v === 'string' && v.trim())
        .slice(0, 6)
    : [];

  return (
    <div className="px-4 pb-4 pt-2 bg-white/[0.02] border-t border-border-faint">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0 mb-3 max-w-3xl">
        {rows.map(r => (
          <div key={r.label} className="flex items-start gap-2 py-1.5 border-b border-border-faint last:border-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-slate-500 w-20 shrink-0 pt-0.5">{r.label}</span>
            <span className="text-[12.5px] text-slate-200 flex-1">{r.value}</span>
          </div>
        ))}
      </div>
      {entry.summary && (
        <div className="mb-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1.5">Summary</div>
          <div className="text-[12.5px] text-slate-300 leading-relaxed bg-app-bg/40 rounded-lg px-3 py-2.5 border border-border-faint">
            {entry.summary}
          </div>
        </div>
      )}
      {extraFields.length > 0 && (
        <div>
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
    </div>
  );
}

export default function Supervisor() {
  const { state } = useCAD();
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

  const statusOptions = useMemo(() => {
    const seen = new Set();
    combined.forEach(e => { if (e.status) seen.add(e.status); });
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
        const haystack = [
          entry.caseNumber,
          entry.officerBadge,
          officer?.name,
          officer?.badge,
          entry.type,
          entry.status,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      return db - da || String(b.caseNumber).localeCompare(String(a.caseNumber));
    });
  }, [combined, deptFilter, typeFilter, statusFilter, search, officerByBadge]);

  const reportCount = filtered.filter(e => e.kind === 'report').length;
  const recordCount = filtered.filter(e => e.kind === 'record').length;

  const toggleRow = (uid) => setExpandedId(prev => (prev === uid ? null : uid));

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-5 font-ui">

      {/* Page header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center shrink-0">
          <MdSupervisorAccount size={20} className="text-brand-bright" />
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-white leading-none">Supervisor Portal</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Review all submitted reports and records</p>
        </div>
        <div className="ml-auto text-[11.5px] text-slate-500 font-mono hidden sm:block">
          <span className="text-sky-400 font-bold">{reportCount}</span> Reports
          &nbsp;·&nbsp;
          <span className="text-violet-400 font-bold">{recordCount}</span> Records
          &nbsp;·&nbsp;
          <span className="text-slate-300 font-bold">{filtered.length}</span> Total
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm mb-4">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-faint">
          <MdFilterList size={15} className="text-slate-400" />
          <span className="text-[11px] font-bold uppercase tracking-[0.6px] text-slate-400">Filters</span>
          <div className="ml-auto text-[11px] text-slate-500 sm:hidden font-mono">
            {reportCount}R · {recordCount}Rec · {filtered.length} total
          </div>
        </div>
        <div className="flex flex-wrap gap-3 px-4 py-3">
          <div className="flex items-center gap-1.5 flex-1 min-w-[160px]">
            <MdSearch size={14} className="text-slate-500 shrink-0" />
            <input
              className={`${S_INPUT} flex-1`}
              placeholder="Officer name, badge, case #…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className={S_SELECT} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="All">All Departments</option>
            {deptOptions.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className={S_SELECT} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            {typeOptions.slice(1).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className={S_SELECT} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            {statusOptions.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-faint">
          <MdDescription size={15} className="text-slate-400" />
          <span className="text-[11px] font-bold uppercase tracking-[0.6px] text-slate-400">Submissions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-slate-600">
            <MdFolder size={36} className="opacity-30" />
            <div className="text-[13px] font-semibold text-slate-500">No results match your filters</div>
            <div className="text-[11px] text-slate-600">Try adjusting the search or filter options.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                      className={`cursor-pointer transition-colors hover:bg-white/[0.05] ${rowBg} ${isExpanded ? 'bg-brand/5' : ''}`}
                    >
                      <td className="px-4 py-2.5 text-[12px] text-slate-400 border-b border-border-faint whitespace-nowrap font-mono">
                        {entry.date}
                      </td>
                      <td className="px-4 py-2.5 text-[11.5px] text-slate-300 border-b border-border-faint whitespace-nowrap font-mono">
                        {entry.caseNumber || '—'}
                      </td>
                      <td className="px-4 py-2.5 border-b border-border-faint">
                        <div className="flex items-center gap-1.5">
                          {entry.kind === 'report'
                            ? <MdDescription size={13} className="text-sky-500 shrink-0" />
                            : <MdFolder size={13} className="text-violet-400 shrink-0" />}
                          <span className="text-[12.5px] text-slate-200 whitespace-nowrap">{entry.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 border-b border-border-faint">
                        <span className="text-[12px] text-slate-300 font-mono">
                          {officer?.deptShort || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 border-b border-border-faint">
                        {officer ? (
                          <div className="min-w-0">
                            <div className="text-[12.5px] text-slate-200 whitespace-nowrap">{officer.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{officer.badge}</div>
                          </div>
                        ) : (
                          <span className="text-[12px] text-slate-500 font-mono">{entry.officerBadge || '—'}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 border-b border-border-faint">
                        <StatusPill status={entry.status} />
                      </td>
                      <td className="px-3 py-2.5 border-b border-border-faint text-slate-500">
                        {isExpanded
                          ? <MdExpandMore size={16} />
                          : <MdChevronRight size={16} />}
                      </td>
                    </tr>,
                    isExpanded && (
                      <tr key={`${uid}-detail`}>
                        <td colSpan={7} className="border-b border-border-base">
                          <DetailPanel entry={entry} officer={officer} />
                        </td>
                      </tr>
                    ),
                  ];
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
