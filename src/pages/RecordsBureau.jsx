import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { RecordReturn, FormDocWrap, ReportDocument } from '../components/FormDocument';
import { BADGE, statusBadge } from '../constants/styles';
import { FlagRow } from '../components/CivilianFlags';
import {
  MdPerson, MdDirectionsCar, MdGavel, MdSearch, MdArrowBack,
  MdWarningAmber, MdFolder, MdDescription,
} from 'react-icons/md';

function age(dob) {
  if (!dob) return '';
  const d = new Date(dob);
  if (isNaN(d)) return '';
  return Math.abs(new Date(Date.now() - d.getTime()).getUTCFullYear() - 1970);
}

function InfoCard({ title, children, className = '' }) {
  return (
    <div className={`flex flex-col bg-app-card/70 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm ${className}`}>
      <div className="px-4 py-2.5 border-b border-border-faint text-[10px] font-bold uppercase tracking-[0.7px] text-slate-400">{title}</div>
      <div className="p-4 flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[11px] text-slate-500 shrink-0">{label}</span>
      <span className={`text-[12.5px] text-slate-200 text-right ${mono ? 'font-mono' : 'font-medium'}`}>{value || '—'}</span>
    </div>
  );
}

const STATUS_CHIP = {
  'Pending Review':  'text-amber-400 bg-amber-400/10 border-amber-400/30',
  'Approved':        'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  'Rejected':        'text-red-400 bg-red-400/10 border-red-400/30',
  'Pending Changes': 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  'Active':          'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  'Expired':         'text-slate-400 bg-slate-400/10 border-slate-400/30',
  'Revoked':         'text-red-400 bg-red-400/10 border-red-400/30',
  'Draft':           'text-slate-500 bg-slate-500/10 border-slate-500/30',
};
function StatusChip({ status }) {
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-semibold tracking-wide ${STATUS_CHIP[status] || 'text-slate-400 bg-slate-400/10 border-slate-400/30'}`}>{status}</span>;
}

const SEARCH_TYPES = [
  { id: 'PERSON',  label: 'Person',            Icon: MdPerson },
  { id: 'VEHICLE', label: 'Vehicle',            Icon: MdDirectionsCar },
  { id: 'WARRANT', label: 'Warrant',            Icon: MdGavel },
  { id: 'CASES',   label: 'Reports & Records',  Icon: MdFolder, activeClass: 'bg-amber-400/15 border-amber-400/40 text-amber-300', hoverClass: 'hover:bg-amber-400/[0.08] hover:border-amber-400/25 hover:text-amber-300' },
];

export default function RecordsBureau() {
  const { state } = useCAD();
  const { civilians, vehicles, warrants, criminalHistory, reports = [], records = [], reportTemplates = [], recordTemplates = [] } = state;

  const [searchType, setSearchType] = useState('PERSON');
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const [selected, setSelected]     = useState(null); // for PERSON/VEHICLE/WARRANT: id; for CASES: "report:id" | "record:id"
  const [tab, setTab]               = useState('SUMMARY');
  const [searched, setSearched]     = useState(false);

  // CASES-specific filters (live — no need to press search)
  const [caseKind, setCaseKind]     = useState('ALL');   // ALL | REPORTS | RECORDS
  const [caseStatus, setCaseStatus] = useState('ALL');

  const doSearch = () => {
    if (searchType === 'CASES') {
      setSearched(true);
      runCaseSearch(query, caseKind, caseStatus);
      return;
    }
    if (!query.trim()) return;
    setSearched(true);
    const q = query.trim().toLowerCase();
    if (searchType === 'PERSON') {
      setResults(civilians.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.ssn?.includes(q) || c.dlNumber?.toLowerCase().includes(q) || c.phone?.includes(q)));
    } else if (searchType === 'VEHICLE') {
      setResults(vehicles.filter(v =>
        v.plate?.toLowerCase().includes(q) ||
        `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(q)));
    } else {
      setResults(warrants.filter(w =>
        w.civilianName?.toLowerCase().includes(q) || w.charge?.toLowerCase().includes(q)));
    }
    setSelected(null);
    setTab(searchType === 'PERSON' ? 'SUMMARY' : 'RETURN');
  };

  const runCaseSearch = (q, kind, status) => {
    const term = q.trim().toLowerCase();
    const all = [
      ...reports.map(r => ({ ...r, _kind: 'report', _number: r.caseNumber })),
      ...records.map(r => ({ ...r, _kind: 'record', _number: r.recordNumber })),
    ];
    setResults(all.filter(item => {
      const matchQ      = !term || item._number?.toLowerCase().includes(term) || item.type?.toLowerCase().includes(term);
      const matchKind   = kind === 'ALL' || (kind === 'REPORTS' ? item._kind === 'report' : item._kind === 'record');
      const matchStatus = status === 'ALL' || item.status === status;
      return matchQ && matchKind && matchStatus;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || '')));
    setSelected(null);
  };

  // When CASES filters change, re-run search live
  const updateCaseKind = (v) => { setCaseKind(v); if (searched) runCaseSearch(query, v, caseStatus); };
  const updateCaseStatus = (v) => { setCaseStatus(v); if (searched) runCaseSearch(query, caseKind, v); };

  // Selected item resolution
  const selCiv     = selected && searchType === 'PERSON'  ? civilians.find(c => c.id === selected) : null;
  const selVeh     = selected && searchType === 'VEHICLE' ? vehicles.find(v => v.id === selected) : null;
  const selWarrant = selected && searchType === 'WARRANT' ? warrants.find(w => w.id === selected) : null;
  const selCase    = selected && searchType === 'CASES'   ? (() => {
    const [kind, id] = selected.split(':');
    const numId = Number(id);
    return kind === 'report' ? reports.find(r => r.id === numId || r.id === id)
                              : records.find(r => r.id === numId || r.id === id);
  })() : null;
  const selCaseKind = selected?.startsWith('report') ? 'report' : 'record';

  const civVehicles = selCiv ? vehicles.filter(v => selCiv.vehicles?.includes(v.id)) : [];
  const civWarrants = selCiv ? warrants.filter(w => w.civilianId === selCiv.id) : [];
  const civHistory  = selCiv ? criminalHistory.filter(h => h.civilianId === selCiv.id) : [];
  const vehOwner    = selVeh ? civilians.find(c => c.id === selVeh.ownerId) : null;
  const vehWarrants = vehOwner ? warrants.filter(w => w.civilianId === vehOwner.id) : [];

  const personTabs = ['SUMMARY', 'RETURN', 'CRIMINAL HISTORY', 'WARRANTS', 'VEHICLES'];
  const vehTabs    = ['RETURN', 'FLAGS'];
  const activeTabs = selCiv ? personTabs : selVeh ? vehTabs : ['RETURN'];
  const activeWarrants = civWarrants.filter(w => w.status === 'ACTIVE');

  const allCaseStatuses = [...new Set([...reports, ...records].map(i => i.status).filter(Boolean))].sort();

  const placeholder = searchType === 'CASES'   ? 'Case #, record #, or type…'
    : searchType === 'PERSON'  ? 'Name, DOB, SSN or DL #'
    : searchType === 'VEHICLE' ? 'Plate or make / model'
    : 'Subject name or charge';

  return (
    <div className="flex-1 overflow-hidden p-4 lg:p-5">
      <div className="mob-two-pane grid h-full min-h-0 gap-4 lg:gap-5" style={{ gridTemplateColumns: 'clamp(260px,24vw,320px) 1fr' }}>

        {/* ─────────── LEFT: Search ─────────── */}
        <div className={`mob-list-panel${selected ? ' mob-gone' : ''} flex flex-col min-h-0 bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm`}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border-faint shrink-0">
            <MdSearch size={16} className="text-brand-bright" />
            <span className="text-[12px] font-bold uppercase tracking-[0.7px] text-slate-200">Records Search</span>
          </div>

          {/* Type tabs */}
          <div className="flex flex-wrap gap-1 p-2 border-b border-border-faint shrink-0">
            {SEARCH_TYPES.map(t => {
              const on = searchType === t.id;
              return (
                <button key={t.id}
                  onClick={() => { setSearchType(t.id); setResults([]); setSelected(null); setSearched(false); setQuery(''); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-semibold cursor-pointer transition-all border ${on ? (t.activeClass || 'bg-brand/15 border-brand/40 text-brand-bright') : `bg-transparent border-transparent text-slate-400 ${t.hoverClass || 'hover:bg-white/[0.05] hover:text-slate-200'}`}`}>
                  <t.Icon size={15} /> {t.label}
                </button>
              );
            })}
          </div>

          {/* CASES: inline kind + status filters */}
          {searchType === 'CASES' && (
            <div className="flex gap-1.5 px-2 pt-2 shrink-0 flex-wrap">
              {[['ALL','All'],['REPORTS','Reports'],['RECORDS','Records']].map(([v,l]) => (
                <button key={v}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer transition-all ${caseKind === v ? 'bg-brand/15 border-brand/40 text-brand-bright' : 'bg-transparent border-border-faint text-slate-500 hover:text-slate-300'}`}
                  onClick={() => updateCaseKind(v)}>{l}</button>
              ))}
              <select
                className="ml-auto bg-app-input border border-border-faint rounded-lg px-2 py-1 text-[10px] text-slate-400 outline-none cursor-pointer"
                value={caseStatus}
                onChange={e => updateCaseStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                {allCaseStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {/* Search input */}
          <div className={`p-3 border-b border-border-faint shrink-0 ${searchType === 'CASES' ? 'pt-2' : ''}`}>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/20 transition-all"
                placeholder={placeholder}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()} />
              <button onClick={doSearch}
                className="shrink-0 flex items-center justify-center px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-colors">
                <MdSearch size={18} />
              </button>
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5 px-0.5">Supports exact and partial matches</p>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {searched && <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.6px] text-slate-600">Results ({results.length})</div>}
            {!searched && (
              <div className="p-4 text-slate-500 text-[11px] leading-[1.9]">
                <div className="text-[10px] font-bold uppercase tracking-[0.7px] mb-1.5 text-slate-600">
                  {searchType === 'CASES' ? 'Search by' : 'Search by'}
                </div>
                {searchType === 'CASES' ? (
                  <>
                    <div>• Case or record number</div>
                    <div>• Partial number (e.g. TPD-2026)</div>
                    <div>• Report or record type</div>
                    <div>• Filter by status above</div>
                  </>
                ) : (
                  <>
                    <div>• Full or partial name</div>
                    <div>• SSN or DL number</div>
                    <div>• Vehicle plate or description</div>
                    <div>• Warrant by name or charge</div>
                  </>
                )}
              </div>
            )}
            {searched && results.length === 0 && (
              <div className="p-6 text-center text-slate-600 text-[12px]">No records found</div>
            )}
            <div className="flex flex-col gap-1.5 p-2">
              {results.map(r => {
                const key = searchType === 'CASES' ? `${r._kind}-${r.id}` : r.id;
                const selKey = searchType === 'CASES' ? `${r._kind}:${r.id}` : r.id;
                const on = selected === selKey;
                const isCase = searchType === 'CASES';
                const base = `text-left px-3 py-2.5 rounded-lg cursor-pointer border transition-all ${
                  on
                    ? isCase ? 'bg-amber-400/15 border-amber-400/40' : 'bg-brand/15 border-brand/40'
                    : isCase
                      ? 'bg-white/[0.02] border-border-faint hover:bg-amber-400/[0.07] hover:border-amber-400/30'
                      : 'bg-white/[0.02] border-border-faint hover:bg-white/[0.05] hover:border-border-base'
                }`;

                if (searchType === 'CASES') return (
                  <button key={key} className={base} onClick={() => setSelected(selKey)}>
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      {r._kind === 'report'
                        ? <MdDescription size={12} className="text-blue-400 shrink-0" />
                        : <MdFolder size={12} className="text-emerald-400 shrink-0" />}
                      <span className="text-[11px] font-mono text-brand-bright">{r._number}</span>
                      <StatusChip status={r.status} />
                    </div>
                    <div className="text-[12.5px] font-semibold text-white leading-tight">{r.type}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{r.date || '—'}</div>
                  </button>
                );

                if (searchType === 'PERSON') return (
                  <button key={r.id} className={base} onClick={() => { setSelected(r.id); setTab('SUMMARY'); }}>
                    <div className="text-[12.5px] font-bold text-white">{r.firstName} {r.lastName}</div>
                    <div className="text-[10.5px] text-slate-500 font-mono mt-0.5">DOB {r.dob} · {r.gender}</div>
                    <div className="flex gap-1 mt-1.5 flex-wrap items-center">
                      <FlagRow flags={r.flags || []} />
                      {r.dlStatus === 'SUSPENDED' && <span className={BADGE.orange}>DL SUSP</span>}
                    </div>
                  </button>
                );
                if (searchType === 'VEHICLE') return (
                  <button key={r.id} className={base} onClick={() => { setSelected(r.id); setTab('RETURN'); }}>
                    <div className="text-[13px] font-bold font-mono text-brand-bright">{r.plate}</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{r.year} {r.make} {r.model} · {r.color}</div>
                    <div className="flex gap-1 mt-1.5">
                      {r.stolen && <span className={BADGE.red}>STOLEN</span>}
                      {r.regStatus !== 'VALID' && <span className={BADGE.orange}>REG {r.regStatus}</span>}
                    </div>
                  </button>
                );
                return (
                  <button key={r.id} className={base} onClick={() => { setSelected(r.id); setTab('RETURN'); }}>
                    <div className="text-[12.5px] font-semibold text-white">{r.civilianName}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{r.charge}</div>
                    <div className="flex gap-1 mt-1.5">
                      <span className={r.status === 'ACTIVE' ? BADGE.red : BADGE.green}>{r.status}</span>
                      <span className={BADGE.gray}>{r.type}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─────────── RIGHT: Detail ─────────── */}
        <div className={`mob-detail-panel${!selected ? ' mob-gone' : ''} flex flex-col min-h-0 bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm`}>
          <button className="mob-back-btn !rounded-none" onClick={() => setSelected(null)}>
            <MdArrowBack size={14} /> Back to results
          </button>

          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-600 p-6">
              <MdSearch size={56} className="opacity-20" />
              <div className="text-center">
                <div className="text-[13px] font-semibold text-slate-400 mb-1">No record selected</div>
                <div className="text-[11px] text-slate-600">Run a query and pick a result</div>
              </div>
            </div>
          ) : selCase ? (
            /* ── CASE DETAIL ── */
            <>
              {/* Compact header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border-faint shrink-0">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${selCaseKind === 'report' ? 'bg-blue-500/15' : 'bg-emerald-500/15'}`}>
                  {selCaseKind === 'report'
                    ? <MdDescription size={18} className="text-blue-400" />
                    : <MdFolder size={18} className="text-emerald-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-extrabold text-white leading-tight truncate">{selCase.type}</div>
                  <div className="text-[10px] font-mono text-brand-bright">
                    {selCaseKind === 'report' ? selCase.caseNumber : selCase.recordNumber}
                    {selCase.date ? <span className="text-slate-500 ml-2">{selCase.date}</span> : null}
                  </div>
                </div>
                <StatusChip status={selCase.status} />
              </div>

              {/* Form document body */}
              <div className="flex-1 overflow-y-auto">
                {(() => {
                  const templates = selCaseKind === 'report' ? reportTemplates : recordTemplates;
                  const tpl = templates.find(t => t.name === selCase.type);
                  // Merge any top-level summary into formData so narrative fields show it
                  const data = {
                    ...(selCase.formData || {}),
                    ...(selCase.summary && !selCase.formData?.f10 ? { f10: selCase.summary } : {}),
                  };
                  return (
                    <FormDocWrap>
                      <ReportDocument
                        type={selCase.type}
                        template={tpl}
                        data={data}
                        editable={false}
                        meta={{
                          caseNumber: selCase.caseNumber || selCase.recordNumber,
                          status: selCase.status,
                          officer: selCase.officerBadge,
                          dateTime: selCase.date,
                        }}
                      />
                    </FormDocWrap>
                  );
                })()}
              </div>
            </>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border-faint shrink-0">
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-app-elevated border border-border-base shrink-0">
                  {selCiv ? <MdPerson size={24} className="text-slate-400" />
                    : selVeh ? <MdDirectionsCar size={24} className="text-slate-400" />
                    : <MdGavel size={24} className="text-slate-400" />}
                </div>
                <div className="min-w-0">
                  <div className="text-[18px] font-extrabold text-white tracking-[-0.2px] truncate">
                    {selCiv ? `${selCiv.firstName} ${selCiv.lastName}`
                      : selVeh ? selVeh.plate
                      : selWarrant?.civilianName}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {selCiv ? `DOB ${selCiv.dob} (${age(selCiv.dob)}) · ${selCiv.gender}`
                      : selVeh ? `${selVeh.year} ${selVeh.make} ${selVeh.model} · ${selVeh.color}`
                      : selWarrant?.charge}
                  </div>
                </div>
                <div className="ml-auto flex gap-1.5 flex-wrap justify-end">
                  {selCiv && <FlagRow flags={selCiv.flags || []} />}
                  {selVeh?.stolen && <span className={BADGE.red}>STOLEN</span>}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-0.5 px-3 pt-2 border-b border-border-faint shrink-0 overflow-x-auto n-tabs-wrap">
                {activeTabs.map(t => {
                  const on = tab === t;
                  const badgeN = t === 'CRIMINAL HISTORY' ? civHistory.length
                    : t === 'WARRANTS' ? activeWarrants.length : 0;
                  return (
                    <button key={t} onClick={() => setTab(t)}
                      className={`relative px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.4px] whitespace-nowrap cursor-pointer transition-colors ${on ? 'text-brand-bright' : 'text-slate-500 hover:text-slate-300'}`}>
                      {t}
                      {badgeN > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[9px]">{badgeN}</span>}
                      {on && <span className="absolute -bottom-[2px] left-2 right-2 h-[3px] rounded-full bg-brand" />}
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5">
                {tab === 'SUMMARY' && selCiv && (
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                      <InfoCard title="Personal Information" className="lg:col-span-2">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                          <Row label="Full Name"      value={`${selCiv.firstName} ${selCiv.lastName}`} />
                          <Row label="DOB"            value={`${selCiv.dob} (${age(selCiv.dob)})`} />
                          <Row label="Gender"         value={selCiv.gender} />
                          <Row label="Ethnicity"      value={selCiv.ethnicity} />
                          <Row label="Height / Weight" value={`${selCiv.height} · ${selCiv.weight}`} />
                          <Row label="Hair / Eyes"    value={`${selCiv.hair} / ${selCiv.eyes}`} />
                          <Row label="SSN"            value={selCiv.ssn} mono />
                          <Row label="Phone"          value={selCiv.phone} mono />
                          <Row label="DL Number"      value={selCiv.dlNumber} mono />
                          <Row label="DL Class"       value={selCiv.dlClass} />
                        </div>
                      </InfoCard>
                      <div className="flex flex-col gap-4">
                        <InfoCard title="Photo" className="items-center">
                          <div className="flex items-center justify-center w-full aspect-[4/5] max-h-[180px] rounded-lg bg-app-elevated border border-border-base">
                            <MdPerson size={64} className="text-slate-700" />
                          </div>
                        </InfoCard>
                      </div>
                    </div>
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                      <InfoCard title="License & Permits">
                        <Row label="DL Status"      value={<span className={statusBadge(selCiv.dlStatus)}>{selCiv.dlStatus}</span>} />
                        <Row label="DL Expiry"      value={selCiv.dlExpiry} mono />
                        <Row label="Weapon Permit"  value={selCiv.weaponPermit ? <span className={statusBadge(selCiv.weaponPermit)}>{selCiv.weaponPermit}</span> : '—'} />
                      </InfoCard>
                      <InfoCard title="Address">
                        <div className="text-[12.5px] text-slate-200 leading-relaxed">{selCiv.address || '—'}</div>
                      </InfoCard>
                      <InfoCard title="Active Warrants">
                        {activeWarrants.length === 0
                          ? <div className="text-[12px] text-slate-500">No active warrants</div>
                          : activeWarrants.map(w => (
                            <div key={w.id} className="flex items-start gap-2">
                              <MdWarningAmber size={16} className="text-red-400 mt-0.5 shrink-0" />
                              <div>
                                <div className="text-[12.5px] font-semibold text-slate-200">{w.charge}</div>
                                <div className="text-[11px] text-slate-500">{w.type} · {w.issuedDate || w.date || ''}</div>
                              </div>
                            </div>
                          ))}
                      </InfoCard>
                    </div>
                    <InfoCard title="Recent Incidents">
                      {civHistory.length === 0
                        ? <div className="text-[12px] text-slate-500">No criminal history on file</div>
                        : (
                          <table className="w-full border-collapse -mx-1">
                            <thead>
                              <tr>{['DATE','CASE #','CHARGES','DISPOSITION','AGENCY'].map(h => (
                                <th key={h} className="px-1.5 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-[0.5px] text-slate-600 border-b border-border-faint">{h}</th>
                              ))}</tr>
                            </thead>
                            <tbody>
                              {civHistory.map(h => (
                                <tr key={h.id} className="border-b border-border-faint last:border-0">
                                  <td className="px-1.5 py-2 text-[12px] text-slate-400 font-mono whitespace-nowrap">{h.date}</td>
                                  <td className="px-1.5 py-2 text-[12px] text-slate-300 font-mono whitespace-nowrap">{h.caseNumber}</td>
                                  <td className="px-1.5 py-2 text-[12px] text-slate-200">{h.charges?.join(', ')}</td>
                                  <td className="px-1.5 py-2 text-[12px] text-slate-400">{h.disposition}</td>
                                  <td className="px-1.5 py-2 text-[12px] text-slate-400 whitespace-nowrap">{h.agency}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                    </InfoCard>
                  </div>
                )}

                {tab === 'RETURN' && selCiv     && <RecordReturn type="PERSON"  data={selCiv} />}
                {tab === 'RETURN' && selVeh     && <RecordReturn type="VEHICLE" data={selVeh} subject={vehOwner} />}
                {tab === 'RETURN' && selWarrant && <RecordReturn type="WARRANT" data={selWarrant} />}

                {tab === 'CRIMINAL HISTORY' && selCiv && (
                  <div className="flex flex-col gap-3">
                    {civHistory.length === 0
                      ? <div className="text-slate-500 text-[12px] p-4 text-center">No criminal history on file</div>
                      : civHistory.map(h => (
                        <InfoCard key={h.id} title={`Case ${h.caseNumber} · ${h.date}`}>
                          <Row label="Disposition"   value={h.disposition} />
                          <Row label="Agency"        value={h.agency} />
                          <Row label="Officer Badge" value={h.officerBadge} mono />
                          {h.sentence && <Row label="Sentence" value={h.sentence} />}
                          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.5px] text-slate-600">Charges</div>
                          {h.charges?.map((c, i) => <div key={i} className="text-[12.5px] text-slate-200">• {c}</div>)}
                          {h.notes && <div className="mt-1 text-[12px] text-slate-400 italic">{h.notes}</div>}
                        </InfoCard>
                      ))}
                  </div>
                )}

                {tab === 'WARRANTS' && selCiv && (
                  <div className="flex flex-col gap-3">
                    {civWarrants.length === 0
                      ? <div className="text-slate-500 text-[12px] p-4 text-center">No warrants on file</div>
                      : civWarrants.map(w => <RecordReturn key={w.id} type="WARRANT" data={w} />)}
                  </div>
                )}

                {tab === 'VEHICLES' && selCiv && (
                  <div className="flex flex-col gap-3">
                    {civVehicles.length === 0
                      ? <div className="text-slate-500 text-[12px] p-4 text-center">No vehicles on file</div>
                      : civVehicles.map(v => <RecordReturn key={v.id} type="VEHICLE" data={v} subject={selCiv} />)}
                  </div>
                )}

                {tab === 'FLAGS' && selVeh && (
                  <InfoCard title={`Vehicle Flags · ${selVeh.plate}`}>
                    {!selVeh.stolen && (!selVeh.flags || selVeh.flags.length === 0) && !vehWarrants.some(w => w.status === 'ACTIVE')
                      ? <div className="text-[12px] text-slate-500">No flags on file</div>
                      : (
                        <div className="flex flex-wrap gap-2">
                          {selVeh.stolen && <span className={BADGE.red}>STOLEN VEHICLE</span>}
                          {vehWarrants.some(w => w.status === 'ACTIVE') && <span className={BADGE.red}>OWNER HAS ACTIVE WARRANT</span>}
                          {selVeh.flags?.map(f => <span key={f} className={BADGE.orange}>{f}</span>)}
                        </div>
                      )}
                  </InfoCard>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
