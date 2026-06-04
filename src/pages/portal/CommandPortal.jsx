import { useState, useMemo, useEffect } from 'react';
import {
  MdShield, MdSearch, MdPerson, MdWarningAmber,
  MdCheckCircle, MdClose, MdDescription, MdChevronRight,
  MdFilterList, MdTimer, MdDirectionsRun, MdInfoOutline,
  MdAccessTime, MdFiberManualRecord, MdCampaign,
} from 'react-icons/md';
import { useCAD } from '../../store/cadStore';
import { useToast } from '../../contexts/ToastContext';
import { useResponsive } from '../../hooks/useResponsive';
import {
  PortalPage, PortalHeader, PortalCard, StatCard, Field,
} from './PortalKit';
import AccessDenied from './AccessDenied';

const COMMAND_RANKS = [
  'Sergeant', 'Lieutenant', 'Captain',
  'Deputy Chief', 'Chief', 'Commander', 'Battalion Chief',
];

/* Cycles through these for per-type color coding */
const TYPE_COLORS = ['#9090cc', '#44aacc', '#3aaa44', '#c09010', '#e04020', '#3a88e8', '#aa44cc', '#cc8844'];
function typeColor(type, allTypes) {
  const idx = allTypes.indexOf(type);
  return TYPE_COLORS[Math.max(0, idx) % TYPE_COLORS.length];
}

function todayStr() { return new Date().toISOString().slice(0, 10); }
function daysAgoStr(n) { return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10); }

/* ── Status pill ── */
const STATUS_META = {
  'Pending Review':  'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Pending Changes': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'Approved':        'bg-green-500/15 text-green-400 border-green-500/30',
  'Rejected':        'bg-red-500/15 text-red-400 border-red-500/30',
};
function StatusPill({ status }) {
  const cls = STATUS_META[status] || 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.3px] rounded-full border ${cls}`}>
      {status}
    </span>
  );
}

/* ── Report type pill (color-coded per type) ── */
function TypePill({ type, allTypes }) {
  const color = typeColor(type, allTypes);
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full border shrink-0"
      style={{ background: `${color}18`, borderColor: `${color}44`, color }}>
      {type}
    </span>
  );
}

/* ── Compliance badge ── */
function CompBadge({ label, color }) {
  const palettes = {
    green: 'bg-green-500/15 text-green-400 border-green-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    red:   'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.3px] rounded-full border ${palettes[color] || palettes.green}`}>
      {label}
    </span>
  );
}

/* ── Date range preset bar ── */
const DATE_PRESETS = [
  { label: 'Today',   from: () => todayStr(),     to: () => todayStr()     },
  { label: '7 Days',  from: () => daysAgoStr(7),  to: () => todayStr()     },
  { label: '30 Days', from: () => daysAgoStr(30), to: () => todayStr()     },
  { label: '90 Days', from: () => daysAgoStr(90), to: () => todayStr()     },
  { label: 'All',     from: () => '',             to: () => ''             },
];

function DateRangeBar({ dateFrom, setDateFrom, dateTo, setDateTo }) {
  const activePreset = DATE_PRESETS.find(p => dateFrom === p.from() && dateTo === p.to());
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {DATE_PRESETS.map(p => {
        const active = activePreset?.label === p.label;
        return (
          <button key={p.label} type="button"
            onClick={() => { setDateFrom(p.from()); setDateTo(p.to()); }}
            className={`press-sm px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer transition-all ${
              active
                ? 'bg-violet-400/20 border-violet-400/50 text-violet-300'
                : 'bg-transparent border-border-base text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >{p.label}</button>
        );
      })}
      <div className="flex items-center gap-1.5">
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="bg-app-input border border-border-base rounded-lg px-2.5 py-1 text-[11.5px] text-slate-300 outline-none focus:border-violet-400/50 transition-all cursor-pointer w-[130px]"
          style={{ colorScheme: 'dark' }} />
        <span className="text-[11px] text-slate-600">→</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="bg-app-input border border-border-base rounded-lg px-2.5 py-1 text-[11.5px] text-slate-300 outline-none focus:border-violet-400/50 transition-all cursor-pointer w-[130px]"
          style={{ colorScheme: 'dark' }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   REPORT DETAIL MODAL
══════════════════════════════════ */
function ReportModal({ report, officer, allTypes, onClose }) {
  if (!report) return null;
  const color = typeColor(report.type, allTypes);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-overlay-in"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[520px] rounded-2xl flex flex-col overflow-hidden anim-modal-in"
        style={{ background: '#0c1929', border: `1px solid ${color}44`, borderTop: `3px solid ${color}` }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <MdDescription size={18} style={{ color, flexShrink: 0 }} />
          <span className="flex-1 text-[14px] font-bold text-white truncate">{report.type}</span>
          <TypePill type={report.type} allTypes={allTypes} />
          <button type="button" onClick={onClose}
            className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
            style={{ background: 'none', border: 'none' }}>
            <MdClose size={16} />
          </button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          <Field label="Type" value={report.type} />
          <Field label="Case Number" value={report.caseNumber || '—'} mono />
          <Field label="Officer Badge" value={report.officerBadge || '—'} mono />
          <Field label="Date" value={report.date || '—'} />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold tracking-[0.6px] uppercase text-cad-muted">Status</span>
            <StatusPill status={report.status} />
          </div>
          {officer && <Field label="Officer Name" value={officer.name} />}
          {report.summary && (
            <div className="col-span-2 flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-[0.6px] uppercase text-cad-muted">Summary</span>
              <p className="text-[13px] text-slate-300 leading-relaxed">{report.summary}</p>
            </div>
          )}
        </div>
        <div className="px-5 pb-5">
          <button type="button" onClick={onClose}
            className="w-full py-2.5 rounded-xl text-[12px] font-bold text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   TAB 1: OVERVIEW
══════════════════════════════════ */
function OverviewTab({ reports, officers, departments, reportTypes, onOpenReport }) {
  const now   = Date.now();
  const ms30d = 30 * 24 * 60 * 60 * 1000;

  const leoDeptIds = useMemo(
    () => new Set(departments.filter(d => d.type === 'LEO').map(d => d.id)),
    [departments]
  );
  const leoOfficers = useMemo(
    () => officers.filter(o => leoDeptIds.has(o.dept)),
    [officers, leoDeptIds]
  );
  const deptById = useMemo(() => {
    const m = {};
    departments.forEach(d => { m[d.id] = d; });
    return m;
  }, [departments]);

  const pendingReview = reports.filter(r => r.status === 'Pending Review').length;
  const approved      = reports.filter(r => r.status === 'Approved').length;

  const typeCounts = useMemo(() => {
    const m = {};
    reportTypes.forEach(t => { m[t] = reports.filter(r => r.type === t).length; });
    return m;
  }, [reports, reportTypes]);

  const noRecentReport = useMemo(() => {
    return leoOfficers.filter(o => {
      const recent = reports.filter(r =>
        r.officerBadge === o.badge &&
        r.date &&
        (now - new Date(r.date).getTime()) <= ms30d
      );
      return recent.length === 0;
    });
  }, [leoOfficers, reports, now, ms30d]);

  const recentReports = useMemo(() => {
    return [...reports]
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 6);
  }, [reports]);

  const officerByBadge = useMemo(() => {
    const m = {};
    officers.forEach(o => { m[o.badge] = o; });
    return m;
  }, [officers]);

  return (
    <div className="flex flex-col gap-6">
      {/* Summary stat cards */}
      <div className="flex flex-wrap gap-3">
        <StatCard label="Total Reports" value={reports.length} accent="violet" icon={MdDescription} />
        <StatCard label="Pending Review" value={pendingReview} accent="amber" icon={MdWarningAmber} />
        <StatCard label="Approved" value={approved} accent="green" icon={MdCheckCircle} />
      </div>

      {/* Reports by type */}
      {reportTypes.length > 0 && (
        <PortalCard>
          <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-slate-400 mb-3 flex items-center gap-2">
            <MdFilterList size={14} />
            Reports by Type
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {reportTypes.map(t => {
              const color = typeColor(t, reportTypes);
              const count = typeCounts[t] || 0;
              const pct   = reports.length > 0 ? Math.round((count / reports.length) * 100) : 0;
              return (
                <div key={t} className="rounded-lg px-3 py-2.5 flex flex-col gap-1.5"
                  style={{ background: `${color}0e`, border: `1px solid ${color}28` }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold truncate" style={{ color }}>{t}</span>
                    <span className="text-[20px] font-extrabold font-mono shrink-0 leading-none" style={{ color }}>{count}</span>
                  </div>
                  <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <span className="text-[9.5px] text-slate-600">{pct}% of total</span>
                </div>
              );
            })}
          </div>
        </PortalCard>
      )}

      {/* Compliance alerts */}
      <PortalCard accent="amber">
        <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-amber-400 mb-3 flex items-center gap-2">
          <MdWarningAmber size={14} />
          Compliance Alerts — No Reports (Last 30 Days)
        </div>
        {noRecentReport.length === 0 ? (
          <div className="flex items-center gap-2 text-green-400">
            <MdCheckCircle size={16} />
            <span className="text-[13px] font-semibold">All clear — all LEO officers have submitted within 30 days.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {noRecentReport.map(o => (
              <div key={o.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{ background: 'rgba(251,146,60,0.07)', border: '1px solid rgba(251,146,60,0.18)' }}>
                <MdPerson size={15} className="text-amber-400 shrink-0" />
                <span className="text-[13px] font-semibold text-white flex-1">{o.name}</span>
                <span className="font-mono text-[11px] text-slate-400">{o.badge}</span>
                <span className="text-[10px] text-slate-500">{o.deptShort || deptById[o.dept]?.short || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </PortalCard>

      {/* Recent submissions */}
      <PortalCard>
        <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-slate-400 mb-3">
          Recent Submissions
        </div>
        {recentReports.length === 0 ? (
          <div className="text-[12px] text-slate-600 py-2">No submissions on file.</div>
        ) : (
          <div className="flex flex-col">
            {recentReports.map((r, idx) => {
              const off = officerByBadge[r.officerBadge];
              return (
                <button key={r.id} type="button" onClick={() => onOpenReport(r)}
                  className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors hover:bg-white/[0.05] ${idx !== 0 ? 'border-t border-border-faint' : ''}`}>
                  <TypePill type={r.type} allTypes={reportTypes} />
                  <span className="font-mono text-[11px] text-slate-400 shrink-0">{r.officerBadge}</span>
                  {off && <span className="text-[12px] text-slate-300 flex-1 truncate">{off.name}</span>}
                  {!off && <span className="flex-1" />}
                  <span className="text-[11px] text-slate-500 shrink-0 hidden sm:block">{r.date}</span>
                  <StatusPill status={r.status} />
                  <MdChevronRight size={14} className="text-slate-600 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </PortalCard>
    </div>
  );
}

/* ══════════════════════════════════
   TAB 2: BY OFFICER
══════════════════════════════════ */
function ByOfficerTab({ reports, officers, departments, reportTypes }) {
  const [search,     setSearch]     = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFrom,   setDateFrom]   = useState('');
  const [dateTo,     setDateTo]     = useState('');
  const { isMobile } = useResponsive();

  const leoDepts   = useMemo(() => departments.filter(d => d.type === 'LEO'), [departments]);
  const leoDeptIds = useMemo(() => new Set(leoDepts.map(d => d.id)), [leoDepts]);
  const leoOfficers = useMemo(
    () => officers.filter(o => leoDeptIds.has(o.dept)),
    [officers, leoDeptIds]
  );

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (typeFilter !== 'All' && r.type !== typeFilter) return false;
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo   && r.date > dateTo)   return false;
      return true;
    });
  }, [reports, typeFilter, dateFrom, dateTo]);

  const visibleTypes = typeFilter === 'All' ? reportTypes : [typeFilter];

  const officerRows = useMemo(() => {
    return leoOfficers
      .filter(o => {
        const q = search.trim().toLowerCase();
        if (q && !o.name.toLowerCase().includes(q) && !o.badge.toLowerCase().includes(q)) return false;
        if (deptFilter !== 'All' && o.deptShort !== deptFilter) return false;
        return true;
      })
      .map(o => {
        const myReports = filteredReports.filter(r => r.officerBadge === o.badge);
        const perType   = {};
        reportTypes.forEach(t => { perType[t] = myReports.filter(r => r.type === t).length; });
        const lastSub = [...myReports]
          .map(r => r.date).filter(Boolean)
          .sort((a, b) => b.localeCompare(a))[0] || null;
        let compStatus, compColor;
        if (myReports.length === 0) {
          compStatus = 'No Reports'; compColor = 'red';
        } else {
          const pending = myReports.filter(r =>
            r.status === 'Pending Review' || r.status === 'Pending Changes'
          ).length;
          compStatus = pending > 0 ? 'Pending' : 'Compliant';
          compColor  = pending > 0 ? 'amber'   : 'green';
        }
        return { officer: o, total: myReports.length, perType, lastSub, compStatus, compColor };
      })
      .sort((a, b) => b.total - a.total);
  }, [leoOfficers, filteredReports, reportTypes, search, deptFilter]);

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: search, dept, type filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-app-input border border-border-base rounded-lg px-3 py-2">
          <MdSearch size={14} className="text-slate-500 shrink-0" />
          <input className="flex-1 min-w-0 bg-transparent text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none"
            placeholder="Name or badge…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 outline-none cursor-pointer"
          value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="All">All Depts</option>
          {leoDepts.map(d => <option key={d.id} value={d.short}>{d.short}</option>)}
        </select>
        <select className="bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 outline-none cursor-pointer"
          value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="All">All Types</option>
          {reportTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Row 2: date range */}
      <DateRangeBar dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo} />

      {isMobile ? (
        <div className="flex flex-col gap-3">
          {officerRows.map(({ officer: o, total, perType, lastSub, compStatus, compColor }) => (
            <PortalCard key={o.id}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-violet-400/10 border border-violet-400/30 flex items-center justify-center shrink-0">
                  <MdShield size={16} className="text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-white truncate">{o.name}</div>
                  <div className="text-[10.5px] text-slate-500 font-mono">{o.badge} · {o.deptShort}</div>
                </div>
                <CompBadge label={compStatus} color={compColor} />
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                {visibleTypes.map(t => {
                  const color = typeColor(t, reportTypes);
                  const cnt   = perType[t] || 0;
                  return (
                    <div key={t} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg gap-2"
                      style={{ background: `${color}0d`, border: `1px solid ${color}20` }}>
                      <span className="text-[10px] font-semibold truncate" style={{ color, opacity: 0.9 }}>{t}</span>
                      <span className="text-[13px] font-extrabold font-mono shrink-0"
                        style={{ color: cnt > 0 ? color : '#475569' }}>{cnt}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-1 text-[10.5px] text-slate-500">
                <span>Total: <span className="font-mono text-slate-300">{total}</span></span>
                <span>Last: <span className="font-mono text-slate-300">{lastSub || '—'}</span></span>
              </div>
            </PortalCard>
          ))}
          {officerRows.length === 0 && (
            <div className="text-[13px] text-slate-500 py-8 text-center">No officers match your filters.</div>
          )}
        </div>
      ) : (
        <div className="bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Officer', 'Badge', 'Dept'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 bg-app-bg/60 border-b border-border-base whitespace-nowrap">{h}</th>
                  ))}
                  {visibleTypes.map(t => (
                    <th key={t} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.6px] bg-app-bg/60 border-b border-border-base whitespace-nowrap"
                      style={{ color: typeColor(t, reportTypes) }}>{t}</th>
                  ))}
                  {['Total', 'Last Sub', 'Status'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 bg-app-bg/60 border-b border-border-base whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {officerRows.map(({ officer: o, total, perType, lastSub, compStatus, compColor }, idx) => (
                  <tr key={o.id} className={idx % 2 === 0 ? '' : 'bg-white/[0.02]'}>
                    <td className="px-4 py-3 border-b border-border-faint">
                      <div className="flex items-center gap-2">
                        <MdShield size={13} className="text-violet-400 shrink-0" />
                        <span className="text-[12.5px] text-slate-200">{o.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b border-border-faint text-[11.5px] font-mono text-slate-300 whitespace-nowrap">{o.badge}</td>
                    <td className="px-4 py-3 border-b border-border-faint text-[11.5px] font-mono text-slate-400 whitespace-nowrap">{o.deptShort}</td>
                    {visibleTypes.map(t => {
                      const color = typeColor(t, reportTypes);
                      const cnt   = perType[t] || 0;
                      return (
                        <td key={t} className="px-4 py-3 border-b border-border-faint">
                          <span className="text-[13px] font-bold font-mono"
                            style={{ color: cnt > 0 ? color : '#475569' }}>{cnt}</span>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 border-b border-border-faint text-[13px] font-bold font-mono text-slate-200">{total}</td>
                    <td className="px-4 py-3 border-b border-border-faint text-[11.5px] font-mono text-slate-400 whitespace-nowrap">{lastSub || '—'}</td>
                    <td className="px-4 py-3 border-b border-border-faint"><CompBadge label={compStatus} color={compColor} /></td>
                  </tr>
                ))}
                {officerRows.length === 0 && (
                  <tr>
                    <td colSpan={3 + visibleTypes.length + 3}
                      className="px-4 py-12 text-center text-slate-500 text-[13px]">
                      No officers match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════
   TAB 3: BY DEPARTMENT
══════════════════════════════════ */
const CARD_ACCENTS = ['violet', 'brand', 'cyan', 'green', 'amber'];

function ByDeptTab({ reports, officers, departments, reportTypes }) {
  const leoDepts = useMemo(
    () => departments.filter(d => d.type === 'LEO'),
    [departments]
  );

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      {leoDepts.map((dept, idx) => {
        const accent          = CARD_ACCENTS[idx % CARD_ACCENTS.length];
        const deptOfficers    = officers.filter(o => o.dept === dept.id);
        const deptReports     = reports.filter(r => deptOfficers.some(o => o.badge === r.officerBadge));
        const avgReports      = deptOfficers.length > 0
          ? (deptReports.length / deptOfficers.length).toFixed(1)
          : '0.0';
        const officersWithRep = deptOfficers.filter(o => deptReports.some(r => r.officerBadge === o.badge)).length;
        const pct             = deptOfficers.length > 0
          ? Math.round((officersWithRep / deptOfficers.length) * 100)
          : 0;
        const barColor    = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f97316' : '#ef4444';
        const barGradient = pct >= 80
          ? 'linear-gradient(90deg, #16a34a, #22c55e)'
          : pct >= 50
            ? 'linear-gradient(90deg, #c2410c, #ea580c, #f97316)'
            : 'linear-gradient(90deg, #991b1b, #ef4444)';

        return (
          <PortalCard key={dept.id} accent={accent}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${dept.color}22`, border: `1px solid ${dept.color}55` }}>
                <MdShield size={16} style={{ color: dept.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-white truncate">{dept.name}</div>
                <div className="text-[10.5px] text-slate-500">{dept.short} · {deptOfficers.length} officer{deptOfficers.length !== 1 ? 's' : ''}</div>
              </div>
            </div>

            {/* Top stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { label: 'Officers',       value: deptOfficers.length, color: '#94a3b8' },
                { label: 'Total Reports',  value: deptReports.length,  color: '#9090cc' },
                { label: 'Avg / Officer',  value: avgReports,          color: '#44aacc' },
                { label: 'Compliance',     value: `${pct}%`,           color: barColor  },
              ].map(s => (
                <div key={s.label} className="bg-app-bg/60 rounded-lg px-3 py-2.5 text-center">
                  <div className="text-[20px] font-extrabold font-mono leading-none" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-slate-600 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Compliance bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-slate-500">Report Compliance</span>
                <span className="text-[11px] font-bold font-mono" style={{ color: barColor }}>{pct}%</span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barGradient }} />
              </div>
              <div className="text-[9.5px] text-slate-600 mt-1">
                {officersWithRep} of {deptOfficers.length} officers filed at least 1 report
              </div>
            </div>

            {/* Per-type breakdown */}
            {reportTypes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border-faint">
                <div className="text-[9.5px] font-bold uppercase tracking-[0.5px] text-slate-600 mb-2">By Type</div>
                <div className="grid grid-cols-2 gap-1">
                  {reportTypes.map(t => {
                    const color = typeColor(t, reportTypes);
                    const cnt   = deptReports.filter(r => r.type === t).length;
                    return (
                      <div key={t} className="flex items-center justify-between px-2 py-1 rounded"
                        style={{ background: `${color}0d` }}>
                        <span className="text-[10px] truncate" style={{ color, opacity: 0.85 }}>{t}</span>
                        <span className="text-[11px] font-bold font-mono shrink-0 ml-1.5"
                          style={{ color: cnt > 0 ? color : '#475569' }}>{cnt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </PortalCard>
        );
      })}
      {leoDepts.length === 0 && (
        <div className="col-span-3 text-[13px] text-slate-500 py-10 text-center">
          No LEO departments configured.
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════
   TAB 4: REPORT TRACKER
══════════════════════════════════ */
const ALL_STATUSES = ['Pending Review', 'Pending Changes', 'Approved', 'Rejected'];

function ReportTrackerTab({ reports, officers, reportTypes, onOpenReport }) {
  const [typeFilter,    setTypeFilter]    = useState('All');
  const [statusFilter,  setStatusFilter]  = useState('All');
  const [officerSearch, setOfficerSearch] = useState('');
  const [dateFrom,      setDateFrom]      = useState('');
  const [dateTo,        setDateTo]        = useState('');

  const officerByBadge = useMemo(() => {
    const m = {};
    officers.forEach(o => { m[o.badge] = o; });
    return m;
  }, [officers]);

  const filtered = useMemo(() => {
    return [...reports]
      .filter(r => {
        if (typeFilter   !== 'All' && r.type   !== typeFilter)   return false;
        if (statusFilter !== 'All' && r.status !== statusFilter) return false;
        if (dateFrom && r.date < dateFrom) return false;
        if (dateTo   && r.date > dateTo)   return false;
        if (officerSearch) {
          const q   = officerSearch.toLowerCase();
          const off = officerByBadge[r.officerBadge];
          if (!r.officerBadge?.toLowerCase().includes(q) && !off?.name?.toLowerCase().includes(q))
            return false;
        }
        return true;
      })
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [reports, typeFilter, statusFilter, dateFrom, dateTo, officerSearch, officerByBadge]);

  return (
    <div className="flex flex-col gap-4">
      {/* Filter row 1 */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-app-input border border-border-base rounded-lg px-3 py-2">
          <MdSearch size={14} className="text-slate-500 shrink-0" />
          <input className="flex-1 min-w-0 bg-transparent text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none"
            placeholder="Officer name or badge…"
            value={officerSearch}
            onChange={e => setOfficerSearch(e.target.value)} />
        </div>
        <select className="bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 outline-none cursor-pointer"
          value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="All">All Types</option>
          {reportTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 outline-none cursor-pointer"
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Date range row */}
      <DateRangeBar dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo} />

      {/* Result count */}
      <div className="text-[11px] text-slate-500">
        {filtered.length} report{filtered.length !== 1 ? 's' : ''} match filters
      </div>

      {/* Report list */}
      <PortalCard>
        {filtered.length === 0 ? (
          <div className="text-[13px] text-slate-600 py-6 text-center">No reports match your filters.</div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((r, idx) => {
              const off = officerByBadge[r.officerBadge];
              return (
                <button key={r.id} type="button" onClick={() => onOpenReport(r)}
                  className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors hover:bg-white/[0.05] ${idx !== 0 ? 'border-t border-border-faint' : ''}`}>
                  <TypePill type={r.type} allTypes={reportTypes} />
                  <span className="font-mono text-[11.5px] text-slate-400 shrink-0">{r.officerBadge}</span>
                  {off && <span className="text-[12.5px] text-slate-200 flex-1 truncate">{off.name}</span>}
                  {!off && <span className="flex-1" />}
                  <span className="text-[11px] text-slate-500 shrink-0 hidden sm:block">{r.date}</span>
                  <span className="font-mono text-[10.5px] text-slate-600 shrink-0 hidden md:block">{r.caseNumber || '—'}</span>
                  <StatusPill status={r.status} />
                  <MdChevronRight size={14} className="text-slate-600 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </PortalCard>
    </div>
  );
}

/* ══════════════════════════════════
   TAB 5: RESPONSE TIMES
══════════════════════════════════ */
function fmtMin(m) {
  if (m == null || isNaN(m)) return '—';
  const mins = Math.floor(m);
  const secs = Math.round((m - mins) * 60);
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

function avg(arr, key) {
  const vals = arr.map(l => l[key]).filter(v => v != null && !isNaN(v));
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

const RT_PERIODS = [
  { label: 'Today',    days: 0  },
  { label: '7 Days',   days: 7  },
  { label: '30 Days',  days: 30 },
  { label: 'All Time', days: null },
];

const PRIORITY_LABELS = { 1: 'Priority 1', 2: 'Priority 2', 3: 'Priority 3', 4: 'Priority 4' };
const PRIORITY_COLORS = { 1: '#e04020', 2: '#f59e0b', 3: '#3a88e8', 4: '#6b7280' };

function FilterPill({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className={`press-sm px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all border ${
        active
          ? 'bg-violet-400/20 border-violet-400/50 text-violet-300'
          : 'border-border-base text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
      }`}>
      {children}
    </button>
  );
}

function ResponseTimesTab({ callLogs }) {
  const allDepts = useMemo(() => {
    const seen = new Set(callLogs.map(l => l.respondingDept).filter(Boolean));
    return ['All', ...Array.from(seen).sort()];
  }, [callLogs]);

  const [deptFilter, setDeptFilter] = useState('All');
  const [period,     setPeriod]     = useState('7 Days');

  const filtered = useMemo(() => {
    let logs = callLogs;
    const p = RT_PERIODS.find(x => x.label === period);
    if (p && p.days != null) {
      const cutoff = p.days === 0 ? todayStr() : daysAgoStr(p.days);
      logs = p.days === 0
        ? logs.filter(l => l.date === cutoff)
        : logs.filter(l => l.date >= cutoff);
    }
    if (deptFilter !== 'All') logs = logs.filter(l => l.respondingDept === deptFilter);
    return logs;
  }, [callLogs, deptFilter, period]);

  const avgAssigned = avg(filtered, 'assignedMin');
  const avgOnScene  = avg(filtered, 'onSceneMin');

  const deptBreakdown = useMemo(() => {
    const depts = [...new Set(filtered.map(l => l.respondingDept))].sort();
    return depts.map(d => {
      const rows = filtered.filter(l => l.respondingDept === d);
      return { dept: d, count: rows.length, avgAssigned: avg(rows, 'assignedMin'), avgOnScene: avg(rows, 'onSceneMin') };
    });
  }, [filtered]);

  const priorityBreakdown = useMemo(() => {
    const prios = [...new Set(filtered.map(l => l.priority))].sort();
    return prios.map(p => {
      const rows = filtered.filter(l => l.priority === p);
      return { priority: p, count: rows.length, avgAssigned: avg(rows, 'assignedMin'), avgOnScene: avg(rows, 'onSceneMin') };
    });
  }, [filtered]);

  return (
    <div className="flex flex-col gap-5">

      {/* Filter bar */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 items-center">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0 mr-0.5">Dept</span>
          {allDepts.map(d => (
            <FilterPill key={d} active={deptFilter === d} onClick={() => setDeptFilter(d)}>{d}</FilterPill>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0 mr-0.5">Period</span>
          {RT_PERIODS.map(p => (
            <FilterPill key={p.label} active={period === p.label} onClick={() => setPeriod(p.label)}>{p.label}</FilterPill>
          ))}
        </div>
      </div>

      {/* Hero stat cards */}
      <div className="flex gap-4 flex-wrap">
        <StatCard
          icon={MdTimer}
          label="Avg Time to Assignment"
          value={fmtMin(avgAssigned)}
          accent="violet"
          hint={filtered.length ? `${filtered.length} call${filtered.length !== 1 ? 's' : ''} in period` : 'No data'}
        />
        <StatCard
          icon={MdDirectionsRun}
          label="Avg Time to On-Scene"
          value={fmtMin(avgOnScene)}
          accent="violet"
          hint={filtered.length ? `First unit on scene` : 'No data'}
        />
      </div>

      {/* Breakdown rows */}
      <PortalCard accent="violet">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          {deptFilter === 'All' ? 'By Department' : `${deptFilter} — By Priority`}
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-[13px]">No closed calls in this period.</div>
        ) : (
          <div className="flex flex-col divide-y divide-white/[0.05]">
            {(deptFilter === 'All' ? deptBreakdown : priorityBreakdown).map(row => {
              const key   = deptFilter === 'All' ? row.dept : row.priority;
              const label = deptFilter === 'All' ? row.dept : (PRIORITY_LABELS[row.priority] || `P${row.priority}`);
              const color = deptFilter !== 'All' ? (PRIORITY_COLORS[row.priority] || '#e2e8f0') : '#e2e8f0';
              return (
                <div key={key} className="py-3 first:pt-0 last:pb-0">
                  {/* Name + call count */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-extrabold" style={{ color }}>{label}</span>
                    <span className="text-[10.5px] text-slate-500 font-semibold">
                      {row.count} call{row.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {/* Two metric cells */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.15)' }}>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Assignment</div>
                      <div className="text-[15px] font-extrabold font-mono text-violet-300 leading-none">{fmtMin(row.avgAssigned)}</div>
                    </div>
                    <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.15)' }}>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">On-Scene</div>
                      <div className="text-[15px] font-extrabold font-mono text-violet-300 leading-none">{fmtMin(row.avgOnScene)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PortalCard>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-border-faint text-[11px] text-slate-500">
        <MdInfoOutline size={14} className="shrink-0 mt-0.5 text-slate-500" />
        Response times are calculated from CAD event logs. Accuracy depends on units actively updating their status in the CAD system in real time.
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   TAB 6: SUBDIVISION HOURS
══════════════════════════════════ */
function fmtDuty(sec) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

// Live seconds an officer has logged under a given subdivision (banked + any
// currently-running clock for that subdivision).
function dutySecondsFor(o, sub, now) {
  let s = o.dutyBySubdiv?.[sub] || 0;
  if (o.dutyClockStart != null && o.dutyClockSubdiv === sub) {
    s += Math.floor((now - o.dutyClockStart) / 1000);
  }
  return s;
}

const SUBDIV_ACCENTS = ['#a78bfa', '#22d3ee', '#34d399', '#f59e0b', '#f472b6', '#60a5fa', '#fb923c', '#4ade80'];

function SubdivisionHoursTab({ officers }) {
  const [, setTick]       = useState(0);
  const [search, setSearch]       = useState('');
  const [subdivFilter, setSubdivFilter] = useState('All');

  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(i);
  }, []);
  const now = Date.now();

  // Build per-subdivision rows from every officer's banked + live duty time.
  const allRows = useMemo(() => {
    const map = {};
    officers.forEach(o => {
      const subs = new Set([
        ...Object.keys(o.dutyBySubdiv || {}),
        ...(o.dutyClockSubdiv ? [o.dutyClockSubdiv] : []),
      ]);
      subs.forEach(sub => {
        const seconds = dutySecondsFor(o, sub, now);
        if (seconds <= 0) return;
        if (!map[sub]) map[sub] = { sub, total: 0, officers: [], liveCount: 0 };
        const live = o.dutyClockStart != null && o.dutyClockSubdiv === sub;
        map[sub].total += seconds;
        map[sub].officers.push({ officer: o, seconds, live });
        if (live) map[sub].liveCount += 1;
      });
    });
    return Object.values(map)
      .map(r => ({ ...r, officers: r.officers.sort((a, b) => b.seconds - a.seconds) }))
      .sort((a, b) => b.total - a.total);
  }, [officers, now]);

  const subdivNames = useMemo(() => ['All', ...allRows.map(r => r.sub)], [allRows]);

  // Apply subdivision + officer search filters.
  const rows = useMemo(() => {
    let r = allRows;
    if (subdivFilter !== 'All') r = r.filter(row => row.sub === subdivFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.map(row => ({
        ...row,
        officers: row.officers.filter(({ officer: o }) =>
          o.name?.toLowerCase().includes(q) || o.badge?.toLowerCase().includes(q)
        ),
      })).filter(row => row.officers.length > 0);
    }
    return r;
  }, [allRows, subdivFilter, search]);

  const grandTotal = allRows.reduce((s, r) => s + r.total, 0);
  const liveOfficers = allRows.reduce((s, r) => s + r.liveCount, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Summary cards */}
      <div className="flex flex-wrap gap-3">
        <StatCard label="Tracked Hours" value={fmtDuty(grandTotal)} accent="violet" icon={MdAccessTime} hint="All specialised subdivisions" />
        <StatCard label="Subdivisions" value={allRows.length} accent="cyan" icon={MdShield} hint="With logged time" />
        <StatCard label="Clocked In Now" value={liveOfficers} accent="green" icon={MdDirectionsRun} hint="Accruing live" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-app-input border border-border-base rounded-lg px-3 py-2">
          <MdSearch size={14} className="text-slate-500 shrink-0" />
          <input className="flex-1 min-w-0 bg-transparent text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none"
            placeholder="Search officer name or badge…"
            value={search}
            onChange={e => setSearch(e.target.value)} />
          {search && (
            <button type="button" onClick={() => setSearch('')}
              className="text-slate-500 hover:text-slate-300 cursor-pointer text-[11px] font-bold" style={{ background: 'none', border: 'none' }}>✕</button>
          )}
        </div>
        <select className="bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 outline-none cursor-pointer shrink-0"
          value={subdivFilter} onChange={e => setSubdivFilter(e.target.value)}>
          {subdivNames.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {allRows.length === 0 ? (
        <PortalCard>
          <div className="text-[13px] text-slate-500 py-6 text-center">
            No subdivision hours logged yet. Time accrues once an officer goes on duty under a subdivision other than Patrol.
          </div>
        </PortalCard>
      ) : rows.length === 0 ? (
        <PortalCard>
          <div className="text-[13px] text-slate-500 py-6 text-center">No results match your filters.</div>
        </PortalCard>
      ) : (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {rows.map((r) => {
            const colorIdx = allRows.findIndex(x => x.sub === r.sub);
            const color = SUBDIV_ACCENTS[colorIdx % SUBDIV_ACCENTS.length];
            const pct = grandTotal > 0 ? Math.round((r.total / grandTotal) * 100) : 0;
            return (
              <PortalCard key={r.sub}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}1e`, border: `1px solid ${color}55` }}>
                    <MdShield size={17} style={{ color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-bold text-white truncate">{r.sub}</div>
                    <div className="text-[10.5px] text-slate-500">{r.officers.length} officer{r.officers.length !== 1 ? 's' : ''} · {pct}% of total</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[18px] font-extrabold font-mono leading-none" style={{ color }}>{fmtDuty(r.total)}</div>
                    {r.liveCount > 0 && (
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9.5px] font-bold text-green-400">
                        <MdFiberManualRecord size={8} className="animate-pulse" /> {r.liveCount} ON NOW
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-1.5 w-full rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>

                <div className="flex flex-col">
                  {r.officers.map(({ officer: o, seconds, live }, i) => (
                    <div key={o.id} className={`flex items-center gap-2.5 py-1.5 ${i > 0 ? 'border-t border-border-faint' : ''}`}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: live ? '#4ade80' : '#475569' }} />
                      <span className="text-[12px] text-slate-200 truncate flex-1">{o.name}</span>
                      <span className="font-mono text-[10.5px] text-slate-500 shrink-0">{o.badge}</span>
                      <span className="font-mono text-[12px] font-bold shrink-0" style={{ color: live ? '#4ade80' : '#cbd5e1' }}>{fmtDuty(seconds)}</span>
                    </div>
                  ))}
                </div>
              </PortalCard>
            );
          })}
        </div>
      )}

      {/* Anti-abuse note */}
      <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-border-faint text-[11px] text-slate-500">
        <MdInfoOutline size={14} className="shrink-0 mt-0.5" />
        Hours accrue for any status except Off Duty, only under specialised subdivisions (anything but Patrol). To prevent
        inactive farming, an officer who leaves the CAD idle for 15 minutes is automatically set Off Duty, and closing the
        tab clocks them out.
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   NOTIFICATION BLAST (Command version)
   — dept-scoped; admins choose dept or all, commanders locked to theirs
══════════════════════════════════ */
const BLAST_COLORS = [
  { label: 'Blue',   value: '#3b82f6' },
  { label: 'Green',  value: '#22c55e' },
  { label: 'Amber',  value: '#f59e0b' },
  { label: 'Red',    value: '#ef4444' },
  { label: 'Violet', value: '#a78bfa' },
  { label: 'Cyan',   value: '#22d3ee' },
];

function NotificationBlastTab({ currentUser, myOfficer, isAdmin, departments }) {
  const { dispatch } = useCAD();
  const toast = useToast();

  const leoDepts = useMemo(() => departments.filter(d => d.type === 'LEO'), [departments]);

  // Admins can choose which dept (or all); non-admin commanders are locked to their dept.
  const [targetDeptId, setTargetDeptId] = useState(isAdmin ? '' : (myOfficer?.dept ?? ''));
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('#3b82f6');
  const [body, setBody]     = useState('');
  const [sent, setSent]     = useState(false);

  const senderName  = myOfficer?.name  || currentUser?.name  || 'Unknown';
  const senderBadge = myOfficer?.badge || currentUser?.badge || '—';

  const targetLabel = isAdmin
    ? (targetDeptId ? (leoDepts.find(d => String(d.id) === String(targetDeptId))?.short || 'Dept') : 'All Departments')
    : (leoDepts.find(d => d.id === myOfficer?.dept)?.short || 'Your Department');

  const handleSend = () => {
    if (!title.trim() || !body.trim()) return;
    dispatch({
      type: 'NOTIFICATION_BLAST',
      payload: { senderName, senderBadge, senderId: myOfficer?.id ?? currentUser?.id, title: title.trim(), color, body: body.trim(), targetDeptId: targetDeptId || null },
    });
    toast.success(`Blast "${title.trim()}" sent to ${targetLabel}.`, { title: 'Blast Sent', color });
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setTitle('');
    setBody('');
  };

  return (
    <div className="max-w-[600px]">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
          <MdCampaign size={20} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-white leading-none">Notification Blast</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Sends a toast notification to targeted personnel immediately.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 bg-app-panel/80 border border-border-base rounded-2xl p-5 backdrop-blur-sm">
        {/* Sender tag */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <MdShield size={14} className="text-slate-400 shrink-0" />
          <span className="text-[11.5px] text-slate-400">Sent as: </span>
          <span className="text-[11.5px] font-bold text-white">{senderName}</span>
          <span className="text-[10.5px] font-mono text-slate-500 ml-0.5">({senderBadge})</span>
        </div>

        {/* Target dept selector — only for admins */}
        {isAdmin ? (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-400">Send To</label>
            <select
              className="w-full bg-app-input border border-border-base rounded-xl px-3.5 py-2.5 text-[13px] text-slate-200 outline-none focus:border-brand/60 transition-[border-color,box-shadow] cursor-pointer"
              value={targetDeptId}
              onChange={e => setTargetDeptId(e.target.value)}>
              <option value="">All Departments</option>
              {leoDepts.map(d => <option key={d.id} value={String(d.id)}>{d.name} ({d.short})</option>)}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-[11.5px] text-slate-400">Sending to: </span>
            <span className="text-[11.5px] font-bold text-white">{targetLabel}</span>
          </div>
        )}

        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-400">Notification Title</label>
          <input
            className="w-full bg-app-input border border-border-base rounded-xl px-3.5 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-brand/60 transition-[border-color,box-shadow]"
            placeholder="e.g. Shift Briefing, BOLO Update, Code Change…"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Color */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-400">Accent Color</label>
          <div className="flex gap-2 flex-wrap">
            {BLAST_COLORS.map(c => (
              <button key={c.value} type="button"
                onClick={() => setColor(c.value)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all border"
                style={color === c.value
                  ? { background: `${c.value}22`, borderColor: `${c.value}66`, color: c.value }
                  : { borderColor: 'transparent', color: '#94a3b8', background: 'rgba(255,255,255,0.04)' }}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.value }} />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-400">Message</label>
          <textarea
            className="w-full bg-app-input border border-border-base rounded-xl px-3.5 py-2.5 text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-brand/60 transition-[border-color,box-shadow] resize-none"
            placeholder="Write the notification message…"
            rows={4}
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>

        {/* Preview */}
        {(title || body) && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-400">Preview</label>
            <div className="rounded-xl px-4 py-3 text-[12px]"
              style={{ background: `${color}12`, border: `1px solid ${color}44`, borderLeft: `4px solid ${color}` }}>
              <div className="font-bold mb-0.5" style={{ color }}>{title || 'Title'}</div>
              <div className="text-slate-300 leading-snug whitespace-pre-wrap">{body || 'Message…'}</div>
              <div className="text-slate-500 text-[10px] mt-1.5">— {senderName} ({senderBadge})</div>
            </div>
          </div>
        )}

        {/* Send button */}
        <button type="button" onClick={handleSend}
          disabled={!title.trim() || !body.trim() || sent}
          className="press flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[13px] font-bold cursor-pointer transition-all disabled:opacity-40"
          style={{ background: `${color}22`, border: `1px solid ${color}55`, color }}>
          {sent
            ? <><MdCheckCircle size={16} /> Blast Sent!</>
            : <><MdCampaign size={16} /> Send to {targetLabel}</>}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   MAIN: COMMAND PORTAL
══════════════════════════════════ */
const TABS = ['Overview', 'By Officer', 'By Department', 'Subdivision Hours', 'Report Tracker', 'Response Times', 'Notification Blast'];

export default function CommandPortal() {
  const { state } = useCAD();
  const {
    reports = [], officers = [], departments = [], calls = [],
    reportTemplates = [], currentUser, callLogs = [],
  } = state;

  /* ── Access control ── */
  const isAdmin   = currentUser?.role === 'admin';
  const myOfficer = useMemo(
    () => officers.find(o => o.id === currentUser?.id),
    [officers, currentUser]
  );
  const hasCommandAccess = isAdmin || (myOfficer && COMMAND_RANKS.includes(myOfficer.rank));

  if (!hasCommandAccess) return <AccessDenied portalName="the Command Portal" />;

  /* ── Department scoping ── */
  const leoDepts = useMemo(() => departments.filter(d => d.type === 'LEO'), [departments]);
  const [adminDeptId, setAdminDeptId] = useState(null);

  const scopeDeptId = isAdmin ? adminDeptId : (myOfficer?.dept ?? null);
  const scopeDept   = departments.find(d => d.id === scopeDeptId) ?? null;

  const scopedOfficers = useMemo(() => {
    if (!scopeDeptId) return officers;
    return officers.filter(o => o.dept === scopeDeptId);
  }, [officers, scopeDeptId]);

  const scopedBadges = useMemo(
    () => new Set(scopedOfficers.map(o => o.badge)),
    [scopedOfficers]
  );

  const scopedReports = useMemo(
    () => reports.filter(r => scopedBadges.has(r.officerBadge)),
    [reports, scopedBadges]
  );

  const scopedDepts = useMemo(() => {
    if (!scopeDeptId) return departments;
    return departments.filter(d => d.id === scopeDeptId);
  }, [departments, scopeDeptId]);

  /* Report types come from the admin record builder (reportTemplates).
     Any types found on submitted reports that no longer have a template
     are included as a fallback so historical data stays visible. */
  const reportTypes = useMemo(() => {
    const fromTemplates = reportTemplates.map(t => t.name);
    const fromReports   = scopedReports.map(r => r.type).filter(Boolean);
    return [...new Set([...fromTemplates, ...fromReports])].sort();
  }, [reportTemplates, scopedReports]);

  /* ── UI state ── */
  const [activeTab,   setActiveTab]   = useState('Overview');
  const [modalReport, setModalReport] = useState(null);

  const officerByBadge = useMemo(() => {
    const m = {};
    officers.forEach(o => { m[o.badge] = o; });
    return m;
  }, [officers]);

  return (
    <PortalPage>
      <PortalHeader
        icon={MdShield}
        title="Command Portal"
        subtitle="Officer compliance, report oversight, and force tracking."
        accent="violet"
      />

      {/* Scope bar */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span
          className="inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border shrink-0"
          style={{ background: 'rgba(167,139,250,0.1)', borderColor: 'rgba(167,139,250,0.3)', color: '#c4b5fd' }}
        >
          {scopeDept ? `Viewing: ${scopeDept.short}` : 'All Departments'}
        </span>
        {isAdmin && (
          <select
            className="bg-app-input border border-border-base rounded-lg px-3 py-1.5 text-[12px] text-slate-300 outline-none focus:border-violet-400/50 transition-all cursor-pointer"
            value={adminDeptId ?? ''}
            onChange={e => setAdminDeptId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">All Departments</option>
            {leoDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {TABS.map(tab => {
          const active = activeTab === tab;
          return (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className={`press-sm px-3.5 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-all border ${
                active
                  ? 'bg-violet-400/20 border-violet-400/50 text-violet-300'
                  : 'bg-transparent border-border-base text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              }`}>
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab content — all tabs receive scoped data */}
      {activeTab === 'Overview' && (
        <OverviewTab
          reports={scopedReports}
          officers={scopedOfficers}
          departments={scopedDepts}
          reportTypes={reportTypes}
          onOpenReport={r => setModalReport(r)}
        />
      )}
      {activeTab === 'By Officer' && (
        <ByOfficerTab
          reports={scopedReports}
          officers={scopedOfficers}
          departments={scopedDepts}
          reportTypes={reportTypes}
        />
      )}
      {activeTab === 'By Department' && (
        <ByDeptTab
          reports={scopedReports}
          officers={scopedOfficers}
          departments={scopedDepts}
          reportTypes={reportTypes}
        />
      )}
      {activeTab === 'Subdivision Hours' && (
        <SubdivisionHoursTab officers={scopedOfficers} />
      )}
      {activeTab === 'Report Tracker' && (
        <ReportTrackerTab
          reports={scopedReports}
          officers={scopedOfficers}
          reportTypes={reportTypes}
          onOpenReport={r => setModalReport(r)}
        />
      )}
      {activeTab === 'Response Times' && (
        <ResponseTimesTab callLogs={callLogs} />
      )}
      {activeTab === 'Notification Blast' && (
        <NotificationBlastTab
          currentUser={currentUser}
          myOfficer={myOfficer}
          isAdmin={isAdmin}
          departments={departments}
        />
      )}

      {modalReport && (
        <ReportModal
          report={modalReport}
          officer={officerByBadge[modalReport.officerBadge]}
          allTypes={reportTypes}
          onClose={() => setModalReport(null)}
        />
      )}
    </PortalPage>
  );
}
