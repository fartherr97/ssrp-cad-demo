import { useState, useMemo } from 'react';
import {
  MdShield, MdSearch, MdPerson, MdWarningAmber,
  MdCheckCircle, MdClose, MdDescription, MdChevronRight,
} from 'react-icons/md';
import { useCAD } from '../../store/cadStore';
import { useResponsive } from '../../hooks/useResponsive';
import {
  PortalPage, PortalHeader, PortalCard, StatCard, Field,
} from './PortalKit';

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

/* ══════════════════════════════════
   REPORT DETAIL MODAL (read-only)
══════════════════════════════════ */
function ReportModal({ report, officer, onClose }) {
  if (!report) return null;
  const isUof = report.type === 'Use of Force';
  const borderColor = isUof ? 'rgba(251,146,60,0.4)' : 'rgba(61,130,240,0.4)';
  const accentColor = isUof ? '#fb923c' : '#3d82f0';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[520px] rounded-2xl flex flex-col overflow-hidden"
        style={{ background: '#0c1929', border: `1px solid ${borderColor}`, borderTop: `3px solid ${accentColor}` }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <MdDescription size={18} style={{ color: accentColor, flexShrink: 0 }} />
          <span className="flex-1 text-[14px] font-bold text-white truncate">{report.type}</span>
          {isUof && (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0"
              style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)' }}>
              Use of Force
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
            style={{ background: 'none', border: 'none' }}
          >
            <MdClose size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 grid grid-cols-2 gap-4">
          <Field label="Type" value={report.type} />
          <Field label="Case Number" value={report.caseNumber || '—'} mono />
          <Field label="Officer Badge" value={report.officerBadge || '—'} mono />
          <Field label="Date" value={report.date || '—'} />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold tracking-[0.6px] uppercase text-cad-muted">Status</span>
            <StatusPill status={report.status} />
          </div>
          {officer && (
            <Field label="Officer Name" value={officer.name} />
          )}
          {report.summary && (
            <div className="col-span-2 flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-[0.6px] uppercase text-cad-muted">Summary</span>
              <p className="text-[13px] text-slate-300 leading-relaxed">{report.summary}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-[12px] font-bold text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
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
function OverviewTab({ reports, officers, departments, calls, onOpenReport }) {
  const now = Date.now();
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

  const pendingReview = reports.filter(r => r.status === 'Pending Review');
  const approved      = reports.filter(r => r.status === 'Approved');
  const uofReports    = reports.filter(r => r.type === 'Use of Force');

  /* Compliance alerts: LEO officers with zero reports in last 30 days */
  const noRecentReport = useMemo(() => {
    return leoOfficers.filter(o => {
      const recent = reports.filter(r => {
        if (r.officerBadge !== o.badge) return false;
        if (!r.date) return false;
        return (now - new Date(r.date).getTime()) <= ms30d;
      });
      return recent.length === 0;
    });
  }, [leoOfficers, reports, now, ms30d]);

  /* Recent submissions: last 5 by date */
  const recentReports = useMemo(() => {
    return [...reports]
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 5);
  }, [reports]);

  const officerByBadge = useMemo(() => {
    const m = {};
    officers.forEach(o => { m[o.badge] = o; });
    return m;
  }, [officers]);

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="flex flex-wrap gap-3">
        <StatCard label="Total Reports" value={reports.length} accent="violet" icon={MdDescription} />
        <StatCard label="Pending Review" value={pendingReview.length} accent="amber" icon={MdWarningAmber} />
        <StatCard label="Approved" value={approved.length} accent="green" icon={MdCheckCircle} />
        <StatCard label="UOFs Filed" value={uofReports.length} accent="red" icon={MdShield} />
      </div>

      {/* Compliance Alerts */}
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
                style={{ background: 'rgba(251,146,60,0.07)', border: '1px solid rgba(251,146,60,0.18)' }}
              >
                <MdPerson size={15} className="text-amber-400 shrink-0" />
                <span className="text-[13px] font-semibold text-white flex-1">{o.name}</span>
                <span className="font-mono text-[11px] text-slate-400">{o.badge}</span>
                <span className="text-[10px] text-slate-500">{o.deptShort || deptById[o.dept]?.short || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </PortalCard>

      {/* Recent Submissions */}
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
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onOpenReport(r)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors hover:bg-white/[0.05] ${idx !== 0 ? 'border-t border-border-faint' : ''}`}
                >
                  <MdDescription size={14} className="text-sky-400 shrink-0" />
                  <span className="text-[13px] text-slate-200 flex-1 truncate">{r.type}</span>
                  <span className="font-mono text-[11px] text-slate-400 shrink-0">{r.officerBadge}</span>
                  <span className="text-[11px] text-slate-500 shrink-0">{r.date}</span>
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
function ByOfficerTab({ reports, officers, departments, calls, onOpenReport }) {
  const [search, setSearch]   = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [timePeriod, setTimePeriod] = useState('All Time');
  const { isMobile } = useResponsive();

  const leoDepts = useMemo(
    () => departments.filter(d => d.type === 'LEO'),
    [departments]
  );
  const leoDeptIds = useMemo(() => new Set(leoDepts.map(d => d.id)), [leoDepts]);

  const leoOfficers = useMemo(
    () => officers.filter(o => leoDeptIds.has(o.dept)),
    [officers, leoDeptIds]
  );

  const now = Date.now();
  const timeMs = useMemo(() => {
    if (timePeriod === 'This Month') {
      const d = new Date(); d.setDate(1); d.setHours(0,0,0,0);
      return d.getTime();
    }
    if (timePeriod === 'Last 7 Days') return now - 7 * 24 * 60 * 60 * 1000;
    return 0;
  }, [timePeriod, now]);

  const filteredReports = useMemo(() => {
    if (timeMs === 0) return reports;
    return reports.filter(r => r.date && new Date(r.date).getTime() >= timeMs);
  }, [reports, timeMs]);

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
        const uofCount  = myReports.filter(r => r.type === 'Use of Force').length;
        const sortedDates = myReports
          .map(r => r.date)
          .filter(Boolean)
          .sort((a, b) => b.localeCompare(a));
        const lastSub = sortedDates[0] || null;
        const hasAnyCalls = calls.some(c => Array.isArray(c.units) && c.units.includes(o.unitId));
        let compStatus, compColor;
        if (myReports.length === 0) {
          compStatus = 'No Reports'; compColor = 'red';
        } else if (uofCount === 0 && hasAnyCalls) {
          compStatus = 'No UOF'; compColor = 'amber';
        } else {
          compStatus = 'Compliant'; compColor = 'green';
        }
        return { officer: o, reportCount: myReports.length, uofCount, lastSub, compStatus, compColor };
      });
  }, [leoOfficers, filteredReports, calls, search, deptFilter]);

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-app-input border border-border-base rounded-lg px-3 py-2">
          <MdSearch size={14} className="text-slate-500 shrink-0" />
          <input
            className="flex-1 min-w-0 bg-transparent text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none"
            placeholder="Name or badge…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 outline-none cursor-pointer"
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
        >
          <option value="All">All Depts</option>
          {leoDepts.map(d => <option key={d.id} value={d.short}>{d.short}</option>)}
        </select>
        <select
          className="bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 outline-none cursor-pointer"
          value={timePeriod}
          onChange={e => setTimePeriod(e.target.value)}
        >
          <option>All Time</option>
          <option>This Month</option>
          <option>Last 7 Days</option>
        </select>
      </div>

      {isMobile ? (
        /* Mobile cards */
        <div className="flex flex-col gap-3">
          {officerRows.map(({ officer: o, reportCount, uofCount, lastSub, compStatus, compColor }) => (
            <PortalCard key={o.id}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-violet-400/10 border border-violet-400/30 flex items-center justify-center shrink-0">
                  <MdShield size={16} className="text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-white truncate">{o.name}</div>
                  <div className="text-[10.5px] text-slate-500 font-mono">{o.badge} · {o.deptShort}</div>
                </div>
                <CompBadge label={compStatus} color={compColor} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-app-bg/60 rounded-lg py-2">
                  <div className="text-[18px] font-extrabold font-mono text-slate-200">{reportCount}</div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-slate-600">Reports</div>
                </div>
                <div className="bg-app-bg/60 rounded-lg py-2">
                  <div className="text-[18px] font-extrabold font-mono text-red-400">{uofCount}</div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-slate-600">UOFs</div>
                </div>
                <div className="bg-app-bg/60 rounded-lg py-2">
                  <div className="text-[12px] font-mono text-slate-400">{lastSub || '—'}</div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-slate-600">Last Sub</div>
                </div>
              </div>
            </PortalCard>
          ))}
          {officerRows.length === 0 && (
            <div className="text-[13px] text-slate-500 py-8 text-center">No officers match your filters.</div>
          )}
        </div>
      ) : (
        /* Desktop table */
        <div className="bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Officer', 'Badge', 'Dept', 'Reports', 'UOFs', 'Last Submission', 'Status'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 bg-app-bg/60 border-b border-border-base whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {officerRows.map(({ officer: o, reportCount, uofCount, lastSub, compStatus, compColor }, idx) => (
                  <tr key={o.id} className={idx % 2 === 0 ? '' : 'bg-white/[0.02]'}>
                    <td className="px-4 py-3 border-b border-border-faint">
                      <div className="flex items-center gap-2">
                        <MdShield size={13} className="text-violet-400 shrink-0" />
                        <span className="text-[12.5px] text-slate-200">{o.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b border-border-faint text-[11.5px] font-mono text-slate-300 whitespace-nowrap">{o.badge}</td>
                    <td className="px-4 py-3 border-b border-border-faint text-[11.5px] font-mono text-slate-400 whitespace-nowrap">{o.deptShort}</td>
                    <td className="px-4 py-3 border-b border-border-faint text-[13px] font-bold font-mono text-slate-200">{reportCount}</td>
                    <td className="px-4 py-3 border-b border-border-faint text-[13px] font-bold font-mono text-red-400">{uofCount}</td>
                    <td className="px-4 py-3 border-b border-border-faint text-[11.5px] font-mono text-slate-400 whitespace-nowrap">{lastSub || '—'}</td>
                    <td className="px-4 py-3 border-b border-border-faint"><CompBadge label={compStatus} color={compColor} /></td>
                  </tr>
                ))}
                {officerRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500 text-[13px]">
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

function ByDeptTab({ reports, officers, departments }) {
  const leoDepts = useMemo(
    () => departments.filter(d => d.type === 'LEO'),
    [departments]
  );

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      {leoDepts.map((dept, idx) => {
        const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];
        const deptOfficers = officers.filter(o => o.dept === dept.id);
        const deptReports  = reports.filter(r => deptOfficers.some(o => o.badge === r.officerBadge));
        const deptUofs     = deptReports.filter(r => r.type === 'Use of Force');
        const avgReports   = deptOfficers.length > 0
          ? (deptReports.length / deptOfficers.length).toFixed(1)
          : '0.0';
        const officersWithReports = deptOfficers.filter(o => deptReports.some(r => r.officerBadge === o.badge)).length;
        const pct = deptOfficers.length > 0
          ? Math.round((officersWithReports / deptOfficers.length) * 100)
          : 0;
        const barColor = pct >= 80 ? '#2fd968' : pct >= 50 ? '#f5a93b' : '#ff5454';

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

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { label: 'Officers',            value: deptOfficers.length, color: '#94a3b8' },
                { label: 'Reports Filed',        value: deptReports.length,  color: '#9090cc' },
                { label: 'UOFs Filed',           value: deptUofs.length,     color: '#ff5454' },
                { label: 'Avg Reports/Officer',  value: avgReports,          color: '#44aacc' },
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
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
              </div>
              <div className="text-[9.5px] text-slate-600 mt-1">{officersWithReports} of {deptOfficers.length} officers have filed at least 1 report</div>
            </div>
          </PortalCard>
        );
      })}
      {leoDepts.length === 0 && (
        <div className="col-span-3 text-[13px] text-slate-500 py-10 text-center">No LEO departments configured.</div>
      )}
    </div>
  );
}

/* ══════════════════════════════════
   TAB 4: UOF TRACKER
══════════════════════════════════ */
function UofTrackerTab({ reports, officers, calls, onOpenReport }) {
  const officerByBadge = useMemo(() => {
    const m = {};
    officers.forEach(o => { m[o.badge] = o; });
    return m;
  }, [officers]);

  const submittedUofs = useMemo(() => {
    return [...reports.filter(r => r.type === 'Use of Force')]
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [reports]);

  const outstandingOfficers = useMemo(() => {
    return officers.filter(o => {
      const assignedToCalls = calls.some(c => Array.isArray(c.units) && c.units.includes(o.unitId));
      if (!assignedToCalls) return false;
      const uofFiled = reports.some(r => r.officerBadge === o.badge && r.type === 'Use of Force');
      return !uofFiled;
    });
  }, [officers, calls, reports]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-violet-400 mb-1">
        Use of Force Report Compliance
      </div>

      {/* Section A: Submitted UOFs */}
      <PortalCard>
        <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-slate-400 mb-3 flex items-center gap-2">
          <MdDescription size={14} className="text-red-400" />
          Submitted UOF Reports
          <span className="ml-auto text-slate-600 font-mono normal-case text-[10px]">{submittedUofs.length} record{submittedUofs.length !== 1 ? 's' : ''}</span>
        </div>

        {submittedUofs.length === 0 ? (
          <div className="text-[12px] text-slate-600 py-4 text-center">No UOF reports on file.</div>
        ) : (
          <div className="flex flex-col">
            {submittedUofs.map((r, idx) => {
              const off = officerByBadge[r.officerBadge];
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onOpenReport(r)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors hover:bg-white/[0.05] ${idx !== 0 ? 'border-t border-border-faint' : ''}`}
                >
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,84,84,0.12)', border: '1px solid rgba(255,84,84,0.25)' }}>
                    <MdShield size={13} className="text-red-400" />
                  </div>
                  <span className="font-mono text-[11.5px] text-slate-300 shrink-0">{r.officerBadge}</span>
                  {off && <span className="text-[12.5px] text-slate-200 flex-1 truncate">{off.name}</span>}
                  {!off && <span className="flex-1" />}
                  <span className="text-[11px] text-slate-500 shrink-0">{r.date}</span>
                  <span className="font-mono text-[10.5px] text-slate-500 shrink-0 hidden sm:block">{r.caseNumber || '—'}</span>
                  <StatusPill status={r.status} />
                  <MdChevronRight size={14} className="text-slate-600 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </PortalCard>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-border-base" />
        <span className="text-[10px] font-bold uppercase tracking-[0.7px] text-slate-600">Outstanding</span>
        <div className="flex-1 border-t border-border-base" />
      </div>

      {/* Section B: Outstanding */}
      <PortalCard accent="amber">
        <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-amber-400 mb-3 flex items-center gap-2">
          <MdWarningAmber size={14} />
          Officers Without UOF — Assigned to Calls
          <span className="ml-auto text-slate-600 font-mono normal-case text-[10px]">{outstandingOfficers.length} officer{outstandingOfficers.length !== 1 ? 's' : ''}</span>
        </div>

        {outstandingOfficers.length === 0 ? (
          <div className="flex items-center gap-2 text-green-400">
            <MdCheckCircle size={16} />
            <span className="text-[13px] font-semibold">No outstanding UOF obligations detected.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {outstandingOfficers.map(o => (
              <div key={o.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{ background: 'rgba(251,146,60,0.07)', border: '1px solid rgba(251,146,60,0.18)' }}
              >
                <MdWarningAmber size={14} className="text-amber-400 shrink-0" />
                <span className="text-[13px] font-semibold text-white flex-1">{o.name}</span>
                <span className="font-mono text-[11px] text-slate-400">{o.badge}</span>
                <span className="text-[10px] text-slate-500">{o.deptShort}</span>
              </div>
            ))}
          </div>
        )}
      </PortalCard>
    </div>
  );
}

/* ══════════════════════════════════
   MAIN: COMMAND PORTAL
══════════════════════════════════ */
const TABS = ['Overview', 'By Officer', 'By Department', 'UOF Tracker'];

export default function CommandPortal() {
  const { state } = useCAD();
  const {
    reports = [], officers = [], departments = [], calls = [],
    reportTemplates = [], communityConfig,
  } = state;

  const [activeTab, setActiveTab] = useState('Overview');
  const [modalReport, setModalReport] = useState(null);

  const officerByBadge = useMemo(() => {
    const m = {};
    officers.forEach(o => { m[o.badge] = o; });
    return m;
  }, [officers]);

  const openReport = (r) => setModalReport(r);
  const closeModal = () => setModalReport(null);

  return (
    <PortalPage>
      <PortalHeader
        icon={MdShield}
        title="Command Portal"
        subtitle="Officer compliance, report oversight, and force tracking."
        accent="violet"
      />

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {TABS.map(tab => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-all border ${
                active
                  ? 'bg-violet-400/20 border-violet-400/50 text-violet-300'
                  : 'bg-transparent border-border-base text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'Overview' && (
        <OverviewTab
          reports={reports}
          officers={officers}
          departments={departments}
          calls={calls}
          onOpenReport={openReport}
        />
      )}
      {activeTab === 'By Officer' && (
        <ByOfficerTab
          reports={reports}
          officers={officers}
          departments={departments}
          calls={calls}
          onOpenReport={openReport}
        />
      )}
      {activeTab === 'By Department' && (
        <ByDeptTab
          reports={reports}
          officers={officers}
          departments={departments}
        />
      )}
      {activeTab === 'UOF Tracker' && (
        <UofTrackerTab
          reports={reports}
          officers={officers}
          calls={calls}
          onOpenReport={openReport}
        />
      )}

      {/* Report detail modal */}
      {modalReport && (
        <ReportModal
          report={modalReport}
          officer={officerByBadge[modalReport.officerBadge]}
          onClose={closeModal}
        />
      )}
    </PortalPage>
  );
}
