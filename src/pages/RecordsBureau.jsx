import { useState } from 'react';
import Select from '../components/ui/Select';
import { useCAD } from '../store/cadStore';
import { useResponsive } from '../hooks/useResponsive';
import { RecordReturn } from '../components/FormDocument';
import ReportForm from '../components/ReportForm';
import { downloadReportPDF } from '../components/ReportPDF';
import { ageFromDob } from '../utils/age';
import { BADGE, statusBadge } from '../constants/styles';
import { FlagRow } from '../components/CivilianFlags';
import {
  MdPerson, MdDirectionsCar, MdGavel, MdSearch, MdArrowBack,
  MdWarningAmber, MdFolder, MdDescription, MdExpandMore,
  MdLocalHospital, MdShield, MdStore, MdReceiptLong, MdGroup, MdBusiness,
  MdVerifiedUser, MdLocationOn, MdClose,
} from 'react-icons/md';

function bizDaysLeft(issuedAt) {
  if (!issuedAt) return null;
  const expiry = new Date(issuedAt).getTime() + 90 * 24 * 60 * 60 * 1000;
  return Math.ceil((expiry - Date.now()) / (24 * 60 * 60 * 1000));
}

function bizExpiryStr(issuedAt) {
  if (!issuedAt) return '—';
  return new Date(new Date(issuedAt).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
}

const age = ageFromDob;

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

const DISP_COLOR = {
  'Guilty':          'text-red-400/80 bg-red-400/[0.08] border-red-400/20',
  'Convicted':       'text-red-400/80 bg-red-400/[0.08] border-red-400/20',
  'Not Guilty':      'text-emerald-400/75 bg-emerald-400/[0.07] border-emerald-400/18',
  'Dismissed':       'text-sky-400/75 bg-sky-400/[0.07] border-sky-400/20',
  'Pending':         'text-amber-400/80 bg-amber-400/[0.08] border-amber-400/20',
  'Plea Deal':       'text-purple-400/75 bg-purple-400/[0.08] border-purple-400/22',
};

function CollapsibleHistoryCard({ h }) {
  const [open, setOpen] = useState(false);
  const dispClass = DISP_COLOR[h.disposition] || 'text-slate-400/80 bg-slate-400/[0.07] border-slate-400/20';
  return (
    <div className="flex flex-col bg-app-card/70 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm">
      {/* Collapsed header * always visible */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left cursor-pointer"
        style={{ background: 'transparent', border: 'none' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-[11px] font-mono text-slate-300 font-bold shrink-0">{h.caseNumber}</span>
          <span className="text-[10.5px] text-slate-500 shrink-0">{h.date}</span>
          {h.charges?.length > 0 && (
            <span className="text-[10px] text-slate-500 truncate hidden sm:block">
              {h.charges.slice(0, 2).join(', ')}{h.charges.length > 2 ? ` +${h.charges.length - 2}` : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {h.disposition && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${dispClass}`}>
              {h.disposition}
            </span>
          )}
          <MdExpandMore
            className={`text-slate-600 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            style={{ fontSize: 16 }}
          />
        </div>
      </button>

      {/* Expandable body — grid-rows collapse keeps the reveal smooth */}
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 flex flex-col gap-2 border-t border-border-faint">
            <div className="pt-2 flex flex-col gap-2">
              <Row label="Agency"        value={h.agency} />
              <Row label="Officer Badge" value={h.officerBadge} mono />
              {h.sentence && <Row label="Sentence" value={h.sentence} />}
            </div>
            {h.charges?.length > 0 && (
              <>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.5px] text-slate-600">Charges</div>
                {h.charges.map((c, i) => (
                  <div key={i} className="text-[12.5px] text-slate-200">• {c}</div>
                ))}
              </>
            )}
            {h.notes && <div className="mt-1 text-[12px] text-slate-400 italic">{h.notes}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_CHIP = {
  'Pending Review':  'text-amber-400/80 bg-amber-400/[0.08] border-amber-400/20',
  'Approved':        'text-emerald-400/75 bg-emerald-400/[0.07] border-emerald-400/18',
  'Rejected':        'text-red-400/80 bg-red-400/[0.08] border-red-400/20',
  'Pending Changes': 'text-orange-400/80 bg-orange-400/[0.08] border-orange-400/20',
  'Active':          'text-emerald-400/75 bg-emerald-400/[0.07] border-emerald-400/18',
  'Expired':         'text-slate-400/70 bg-slate-400/[0.06] border-slate-400/18',
  'Revoked':         'text-red-400/80 bg-red-400/[0.08] border-red-400/20',
  'Draft':           'text-slate-500/70 bg-slate-500/[0.06] border-slate-500/18',
};
function StatusChip({ status }) {
  const cls = STATUS_CHIP[status] || 'text-slate-400/70 bg-slate-400/[0.06] border-slate-400/18';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-[3px] rounded-full border text-[10px] font-medium ${cls}`}>
      <span className="w-1 h-1 rounded-full bg-current opacity-70 shrink-0" />
      {status}
    </span>
  );
}

const SEARCH_TYPES = [
  { id: 'PERSON',   label: 'Person',            Icon: MdPerson },
  { id: 'VEHICLE',  label: 'Vehicle',            Icon: MdDirectionsCar },
  { id: 'WARRANT',  label: 'Warrant',            Icon: MdGavel },
  { id: 'CASES',    label: 'Reports & Records',  Icon: MdFolder, activeClass: 'bg-amber-400/15 border-amber-400/40 text-amber-300', hoverClass: 'hover:bg-amber-400/[0.08] hover:border-amber-400/25 hover:text-amber-300' },
  { id: 'BUSINESS', label: 'Business',           Icon: MdStore,        activeClass: 'bg-cyan-400/15 border-cyan-400/40 text-cyan-300',   hoverClass: 'hover:bg-cyan-400/[0.08] hover:border-cyan-400/25 hover:text-cyan-300'   },
  { id: 'PERMIT',   label: 'Permits',            Icon: MdVerifiedUser, activeClass: 'bg-green-400/15 border-green-400/40 text-green-300', hoverClass: 'hover:bg-green-400/[0.08] hover:border-green-400/25 hover:text-green-300' },
];

function InvestigationFlag({ cases, onTip }) {
  const [tipOpen, setTipOpen] = useState(false);
  const [tipCase, setTipCase] = useState(null);
  const [tipText, setTipText] = useState('');
  const { dispatch } = useCAD();
  const { state: { currentUser } } = useCAD();

  const openTip = (c) => { setTipCase(c); setTipText(''); setTipOpen(true); };
  const submitTip = () => {
    if (!tipText.trim() || !tipCase) return;
    dispatch({
      type: 'ADD_CASE_NOTE',
      payload: {
        caseId: tipCase.id,
        note: {
          text: tipText.trim(),
          type: 'TIP',
          authorId: currentUser?.id,
          authorName: currentUser?.name || 'Patrol',
        },
      },
    });
    setTipOpen(false);
    setTipCase(null);
  };

  return (
    <>
      <div className="shrink-0 flex flex-col gap-2 px-5 pt-3 pb-0">
        {cases.map(c => (
          <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
            style={{ background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.25)' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(239,68,68,0.12)' }}>
              <MdWarningAmber size={15} style={{ color: '#ef4444' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#ef4444' }}>
                Active Investigation
              </div>
              <div className="text-[11.5px] font-semibold text-slate-200 truncate">
                {c.caseNumber} · {c.title}
              </div>
            </div>
            <button onClick={() => openTip(c)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold shrink-0 transition-all"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              Submit Tip
            </button>
          </div>
        ))}
      </div>

      {tipOpen && tipCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md bg-app-card border border-border-base rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-faint">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-red-400">Submit Tip</div>
                <div className="text-[13px] font-bold text-white">{tipCase.caseNumber} · {tipCase.title}</div>
              </div>
              <button onClick={() => setTipOpen(false)} className="text-slate-500 hover:text-slate-300 p-1">
                <MdClose size={18} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <textarea
                rows={4}
                autoFocus
                placeholder="Enter your tip, observation, or information for the investigating detective..."
                value={tipText}
                onChange={e => setTipText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-[12.5px] bg-app-elevated border border-border-base text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500/40 resize-none leading-relaxed"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setTipOpen(false)}
                  className="px-4 py-2 rounded-lg text-[12px] font-semibold text-slate-400 hover:text-slate-200">
                  Cancel
                </button>
                <button onClick={submitTip} disabled={!tipText.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' }}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function RecordsBureau() {
  const { state, dispatch } = useCAD();
  const { civilians, vehicles, warrants, criminalHistory, reports = [], records = [], reportTemplates = [], recordTemplates = [], currentUser, officers = [], departments = [], communityConfig = {}, licensePointsConfig = {}, businesses = [], permits = [], caseFiles = [] } = state;
  const ptThreshold = licensePointsConfig.threshold || 12;
  const { isMobile } = useResponsive();

  const [searchType, setSearchType] = useState('PERSON');
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const [selected, setSelected]     = useState(null); // for PERSON/VEHICLE/WARRANT: id; for CASES: "report:id" | "record:id"
  const [tab, setTab]               = useState('SUMMARY');
  const [searched, setSearched]     = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // CASES-specific filters (live * no need to press search)
  const [caseKind, setCaseKind]     = useState('ALL');   // ALL | REPORTS | RECORDS
  const [caseStatus, setCaseStatus] = useState('ALL');

  const doSearch = () => {
    if (searchType === 'CASES') {
      setSearched(true);
      runCaseSearch(query, caseKind, caseStatus);
      return;
    }
    if (searchType === 'BUSINESS') {
      setSearched(true);
      const q = query.trim().toLowerCase();
      setResults(q
        ? businesses.filter(b =>
            b.name?.toLowerCase().includes(q) ||
            b.owner?.toLowerCase().includes(q) ||
            b.type?.toLowerCase().includes(q) ||
            b.ein?.toLowerCase().includes(q))
        : [...businesses]);
      setSelected(null);
      return;
    }
    if (searchType === 'PERMIT') {
      setSearched(true);
      const q = query.trim().toLowerCase();
      setResults(q
        ? permits.filter(p =>
            p.holderName?.toLowerCase().includes(q) ||
            p.location?.toLowerCase().includes(q) ||
            p.permitNumber?.toLowerCase().includes(q) ||
            p.type?.toLowerCase().includes(q))
        : [...permits]);
      setSelected(null);
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
  const selCiv     = selected && searchType === 'PERSON'   ? civilians.find(c => c.id === selected) : null;
  const selVeh     = selected && searchType === 'VEHICLE'  ? vehicles.find(v => v.id === selected) : null;
  const selWarrant = selected && searchType === 'WARRANT'  ? warrants.find(w => w.id === selected) : null;
  const selBiz     = selected && searchType === 'BUSINESS' ? businesses.find(b => b.id === selected) : null;
  const selPermit  = selected && searchType === 'PERMIT'   ? permits.find(p => p.id === selected)    : null;
  const selCase    = selected && searchType === 'CASES'    ? (() => {
    const [kind, id] = selected.split(':');
    const numId = Number(id);
    return kind === 'report' ? reports.find(r => r.id === numId || r.id === id)
                              : records.find(r => r.id === numId || r.id === id);
  })() : null;
  const selCaseKind = typeof selected === 'string' && selected.startsWith('report') ? 'report' : 'record';

  const civVehicles = selCiv ? vehicles.filter(v => selCiv.vehicles?.includes(v.id)) : [];
  const civWarrants = selCiv ? warrants.filter(w => w.civilianId === selCiv.id) : [];
  const civHistory  = selCiv ? criminalHistory.filter(h => h.civilianId === selCiv.id) : [];
  const vehOwner    = selVeh ? civilians.find(c => c.id === selVeh.ownerId) : null;
  const vehBizOwner = selVeh?.businessOwnerId ? businesses.find(b => b.id === selVeh.businessOwnerId) : null;
  const vehWarrants = vehOwner ? warrants.filter(w => w.civilianId === vehOwner.id) : [];

  // Active investigation flag — cases that reference the selected person or vehicle
  const activeCasesForCiv = selCiv
    ? caseFiles.filter(c => c.status === 'ACTIVE' && c.subjects?.some(s => s.civilianId === selCiv.id))
    : [];
  const activeCasesForVeh = selVeh
    ? caseFiles.filter(c => c.status === 'ACTIVE' && c.vehicles?.some(v => v.vehicleId === selVeh.id))
    : [];

  const personTabs = ['SUMMARY', 'RETURN', 'CRIMINAL HISTORY', 'WARRANTS', 'VEHICLES', 'MEDICAL'];
  const vehTabs    = ['RETURN', 'FLAGS'];
  const activeTabs = selCiv ? personTabs : selVeh ? vehTabs : ['RETURN'];
  const activeWarrants = civWarrants.filter(w => w.status === 'ACTIVE');

  const allCaseStatuses = [...new Set([...reports, ...records].map(i => i.status).filter(Boolean))].sort();

  const placeholder = searchType === 'CASES'    ? 'Case #, record #, or type…'
    : searchType === 'PERSON'   ? 'Name, DOB, SSN or DL #'
    : searchType === 'VEHICLE'  ? 'Plate or make / model'
    : searchType === 'BUSINESS' ? 'Business name, owner, or type…'
    : searchType === 'PERMIT'   ? 'Holder name, location, or permit #…'
    : 'Subject name or charge';

  return (
    <div className="flex-1 overflow-hidden p-4 lg:p-5">
      <div className="h-full min-h-0 grid gap-4 lg:gap-5"
        style={{ gridTemplateColumns: isMobile ? '1fr' : 'clamp(260px,24vw,320px) 1fr' }}>

        {/* ─────────── LEFT: Search ─────────── */}
        <div className="flex flex-col min-h-0 bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm"
          style={{ display: isMobile && selected ? 'none' : 'flex' }}>
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
            <div className="flex gap-1.5 px-2 pt-2 shrink-0 flex-wrap anim-dropdown-in">
              {[['ALL','All'],['REPORTS','Reports'],['RECORDS','Records']].map(([v,l]) => (
                <button key={v}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer transition-all ${caseKind === v ? 'bg-brand/15 border-brand/40 text-brand-bright' : 'bg-transparent border-border-faint text-slate-500 hover:text-slate-300'}`}
                  onClick={() => updateCaseKind(v)}>{l}</button>
              ))}
              <Select
                className="ml-auto bg-app-input border border-border-faint rounded-lg px-2 py-1 text-[10px] text-slate-400 outline-none cursor-pointer"
                value={caseStatus}
                onChange={e => updateCaseStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                {allCaseStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
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
                ) : searchType === 'BUSINESS' ? (
                  <>
                    <div>• Full or partial business name</div>
                    <div>• Owner name</div>
                    <div>• Business type</div>
                    <div>• Leave blank for all businesses</div>
                  </>
                ) : searchType === 'PERMIT' ? (
                  <>
                    <div>• Holder name or company</div>
                    <div>• Location / road name</div>
                    <div>• Permit number (FDOT-P-…)</div>
                    <div>• Leave blank to see all permits</div>
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
                if (searchType === 'VEHICLE') {
                  const bizOwner = r.businessOwnerId ? businesses.find(b => b.id === r.businessOwnerId) : null;
                  return (
                    <button key={r.id} className={base} onClick={() => { setSelected(r.id); setTab('RETURN'); }}>
                      <div className="text-[13px] font-bold font-mono text-brand-bright">{r.plate}</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">{r.year} {r.make} {r.model} · {r.color}</div>
                      {bizOwner && <div className="text-[10.5px] text-cyan-400 mt-0.5">{bizOwner.name}</div>}
                      <div className="flex gap-1 mt-1.5">
                        {r.stolen && <span className={BADGE.red}>STOLEN</span>}
                        {r.regStatus !== 'VALID' && <span className={BADGE.orange}>REG {r.regStatus}</span>}
                        {bizOwner && <span className={BADGE.blue}>COMMERCIAL</span>}
                      </div>
                    </button>
                  );
                }
                if (searchType === 'PERMIT') {
                  const pSt = r.status === 'REVOKED' ? 'REVOKED'
                    : r.expiresAt && new Date(r.expiresAt) < new Date() ? 'EXPIRED' : 'ACTIVE';
                  const pColor = pSt === 'ACTIVE' ? '#22c55e' : pSt === 'EXPIRED' ? '#94a3b8' : '#ef4444';
                  return (
                    <button key={r.id} className={base} onClick={() => setSelected(r.id)}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10.5px] font-mono font-bold" style={{ color: pColor }}>{r.permitNumber}</span>
                        <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded"
                          style={{ color: pColor, background: `${pColor}18`, border: `1px solid ${pColor}30` }}>{pSt}</span>
                      </div>
                      <div className="text-[12.5px] font-bold text-white truncate">{r.holderName}</div>
                      <div className="text-[10.5px] text-slate-500 mt-0.5 truncate">{r.location}</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">{r.type} · Exp {r.expiresAt}</div>
                    </button>
                  );
                }
                if (searchType === 'BUSINESS') {
                  const days = bizDaysLeft(r.licenseIssuedAt);
                  const licRevoked = r.licenseStatus === 'REVOKED';
                  const licExpired = !licRevoked && (days === null || days <= 0);
                  const licColor   = licRevoked || licExpired ? '#ef4444' : days !== null && days <= 14 ? '#f59e0b' : '#22c55e';
                  const licLabel   = licRevoked ? 'REVOKED' : licExpired ? 'EXPIRED' : `${days ?? '?'}d`;
                  return (
                    <button key={r.id} className={base} onClick={() => setSelected(r.id)}>
                      <div className="text-[12.5px] font-bold text-white truncate">{r.name}</div>
                      <div className="text-[10.5px] text-slate-500 mt-0.5">{r.type}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded"
                          style={{ color: licColor, background: `${licColor}18`, border: `1px solid ${licColor}30` }}>
                          {licLabel}
                        </span>
                        <span className="text-[10px] text-slate-500">{r.employees?.length || 0} emp</span>
                      </div>
                    </button>
                  );
                }
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
        <div className="flex flex-col min-h-0 bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm"
          style={{ display: isMobile && !selected ? 'none' : 'flex' }}>
          {isMobile && (
            <button className="flex items-center gap-1.5 px-3 py-2.5 border-none border-b border-border-faint bg-app-elevated cursor-pointer shrink-0 text-[11px] text-brand-bright"
              style={{ fontFamily: 'var(--font-ui)', width: '100%' }}
              onClick={() => setSelected(null)}>
              <MdArrowBack size={14} /> Back to results
            </button>
          )}

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
            (() => {
              const templates = selCaseKind === 'report' ? reportTemplates : recordTemplates;
              const tpl = selCase.templateSnapshot || templates.find(t => t.name === selCase.type);
              const data = {
                ...(selCase.formData || {}),
                ...(selCase.summary && !selCase.formData?.f10 ? { f10: selCase.summary } : {}),
              };
              const caseOfficer = officers.find(o => o.badge === selCase.officerBadge);
              const caseDept = departments.find(d => d.short === caseOfficer?.deptShort);
              const exportPDF = async () => {
                if (!tpl) return;
                setPdfLoading(true);
                try {
                  await downloadReportPDF(tpl, data, {
                    caseNumber: selCase.caseNumber || selCase.recordNumber,
                    status: selCase.status,
                    officer: selCase.officerBadge,
                    dateTime: selCase.date,
                    agency: caseDept?.name || caseOfficer?.deptShort || communityConfig?.name,
                    department: data._issuingDept || caseDept?.name || caseOfficer?.deptShort,
                    logoUrl: caseDept?.logoUrl || communityConfig?.logoUrl,
                  });
                } finally { setPdfLoading(false); }
              };
              return (
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
                    {tpl && (
                      <button
                        onClick={exportPDF}
                        disabled={pdfLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer disabled:opacity-50 transition-colors shrink-0"
                        style={{ background: 'rgba(58,136,232,0.14)', border: '1px solid rgba(58,136,232,0.30)', color: '#3a88e8' }}
                        title="Download as PDF"
                      >
                        <MdDescription size={13} /> {pdfLoading ? 'Generating…' : 'Save as PDF'}
                      </button>
                    )}
                    <StatusChip status={selCase.status} />
                  </div>

                  {/* Read-only document body * matches the profile/report viewer */}
                  <div className="flex-1 overflow-y-auto bg-app-bg/30 p-4 lg:p-6">
                    {tpl ? (
                      <ReportForm
                        template={tpl}
                        data={data}
                        readOnly
                        canSupplement
                        onSupplement={(fid, arr) => {
                          const action = selCaseKind === 'report' ? 'UPDATE_REPORT' : 'UPDATE_RECORD';
                          dispatch({ type: action, payload: { id: selCase.id, formData: { ...(selCase.formData || {}), [fid]: arr } } });
                        }}
                      />
                    ) : (
                      <div className="max-w-[1100px] mx-auto bg-app-card/70 border border-border-base rounded-xl p-4 text-[13px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {selCase.summary || 'No details on file.'}
                      </div>
                    )}
                  </div>
                </>
              );
            })()
          ) : selBiz ? (
            /* ── BUSINESS DETAIL ── */
            (() => {
              const days = bizDaysLeft(selBiz.licenseIssuedAt);
              const licRevoked = selBiz.licenseStatus === 'REVOKED';
              const licExpired = !licRevoked && (days === null || days <= 0);
              const licWarn    = !licRevoked && !licExpired && days !== null && days <= 14;
              const licColor   = licRevoked || licExpired ? '#ef4444' : licWarn ? '#f59e0b' : '#22c55e';
              const licLabel   = licRevoked ? 'REVOKED' : licExpired ? 'EXPIRED' : 'ACTIVE';
              const bizVehicles = vehicles.filter(v => v.businessOwnerId === selBiz.id);
              return (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-border-faint shrink-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-cyan-500/15 border border-cyan-500/25">
                      <MdStore size={20} className="text-cyan-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[18px] font-extrabold text-white tracking-[-0.2px] truncate">{selBiz.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{selBiz.type}</div>
                    </div>
                    <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-lg shrink-0"
                      style={{ color: licColor, background: `${licColor}18`, border: `1px solid ${licColor}30` }}>
                      {licLabel}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                    {/* License card */}
                    <InfoCard title="Business License">
                      <Row label="License #"    value={selBiz.license} mono />
                      <Row label="Status"       value={
                        <span className="font-bold" style={{ color: licColor }}>{licLabel}</span>
                      } />
                      <Row label="Issued"       value={selBiz.licenseIssuedAt || '—'} mono />
                      <Row label="Expires"      value={bizExpiryStr(selBiz.licenseIssuedAt)} mono />
                      {!licRevoked && days !== null && (
                        <div className="mt-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-slate-500">Days Remaining</span>
                            <span className="text-[12px] font-bold font-mono" style={{ color: licColor }}>
                              {licExpired ? 'Expired' : `${days} day${days === 1 ? '' : 's'}`}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full transition-all"
                              style={{ width: `${Math.max(0, Math.min(100, (days / 90) * 100))}%`, background: licColor }} />
                          </div>
                        </div>
                      )}
                    </InfoCard>

                    {/* Business info */}
                    <InfoCard title="Business Information">
                      <Row label="Owner"   value={selBiz.owner} />
                      <Row label="EIN"     value={selBiz.ein} mono />
                      <Row label="Phone"   value={selBiz.phone} mono />
                      <Row label="Address" value={selBiz.address} />
                      {selBiz.isTowCompany && <Row label="Type" value={<span className={BADGE.blue}>TOW COMPANY</span>} />}
                      {selBiz.isFDOT      && <Row label="Agency" value={<span className={BADGE.gray}>FDOT</span>} />}
                    </InfoCard>

                    {/* Employees */}
                    <InfoCard title={`Employees (${selBiz.employees?.length || 0})`}>
                      {(!selBiz.employees || selBiz.employees.length === 0)
                        ? <div className="text-[12px] text-slate-500">No employees on file.</div>
                        : selBiz.employees.map(emp => (
                          <div key={emp.id} className="flex items-center gap-2.5">
                            <MdGroup size={13} className="text-slate-600 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <div className="text-[12.5px] font-semibold text-slate-200">{emp.name}</div>
                              <div className="text-[10.5px] text-slate-500">
                                {Array.isArray(emp.roles) ? emp.roles.join(', ') : emp.role}
                                {emp.phone && <span className="font-mono ml-2">{emp.phone}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                    </InfoCard>

                    {/* Fleet / registered vehicles */}
                    {(selBiz.fleet?.length > 0 || bizVehicles.length > 0) && (
                      <InfoCard title={`Registered Vehicles (${(selBiz.fleet?.length || 0) + bizVehicles.length})`}>
                        {selBiz.fleet?.map(v => (
                          <div key={v.id} className="flex items-center gap-2">
                            <MdBusiness size={12} className="text-slate-600 shrink-0" />
                            <span className="text-[12px] text-slate-200">{v.name}</span>
                            <span className={`ml-auto ${BADGE.gray}`}>{v.type}</span>
                          </div>
                        ))}
                        {bizVehicles.map(v => (
                          <div key={v.id} className="flex items-center gap-2">
                            <MdDirectionsCar size={12} className="text-slate-600 shrink-0" />
                            <span className="text-[12px] text-slate-200">{v.year} {v.make} {v.model}</span>
                            <span className="text-[11px] font-mono text-brand-bright ml-auto">{v.plate}</span>
                          </div>
                        ))}
                      </InfoCard>
                    )}
                  </div>
                </>
              );
            })()
          ) : selPermit ? (
            /* ── PERMIT DETAIL ── */
            (() => {
              const pSt = selPermit.status === 'REVOKED' ? 'REVOKED'
                : selPermit.expiresAt && new Date(selPermit.expiresAt) < new Date() ? 'EXPIRED' : 'ACTIVE';
              const pColor = pSt === 'ACTIVE' ? '#22c55e' : pSt === 'EXPIRED' ? '#94a3b8' : '#ef4444';
              return (
                <>
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-border-faint shrink-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${pColor}18`, border: `1px solid ${pColor}28` }}>
                      <MdVerifiedUser size={20} style={{ color: pColor }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[18px] font-extrabold text-white tracking-[-0.2px] truncate">{selPermit.holderName}</div>
                      <div className="text-[11px] font-mono mt-0.5" style={{ color: pColor }}>{selPermit.permitNumber}</div>
                    </div>
                    <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-lg shrink-0"
                      style={{ color: pColor, background: `${pColor}18`, border: `1px solid ${pColor}30` }}>{pSt}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                    <InfoCard title="Permit Information">
                      <Row label="Permit #"   value={selPermit.permitNumber} mono />
                      <Row label="Type"       value={selPermit.type} />
                      <Row label="Holder"     value={selPermit.holderName} />
                      <Row label="Issued By"  value={selPermit.issuedBy} />
                      <Row label="Issue Date" value={selPermit.issuedAt} mono />
                      <Row label="Expiry"     value={selPermit.expiresAt} mono />
                      <Row label="Status"     value={<span className="font-bold" style={{ color: pColor }}>{pSt}</span>} />
                    </InfoCard>
                    <InfoCard title="Location">
                      <div className="flex items-start gap-2">
                        <MdLocationOn size={15} className="text-slate-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[13px] font-semibold text-slate-200">{selPermit.location}</div>
                          {selPermit.postal && <div className="text-[11px] text-slate-500 font-mono mt-0.5">Postal {selPermit.postal}</div>}
                        </div>
                      </div>
                    </InfoCard>
                    {selPermit.description && (
                      <InfoCard title="Description / Conditions">
                        <div className="text-[12.5px] text-slate-300 leading-relaxed">{selPermit.description}</div>
                      </InfoCard>
                    )}
                  </div>
                </>
              );
            })()
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border-faint shrink-0">
                <div className="min-w-0">
                  <div className="text-[18px] font-extrabold text-white tracking-[-0.2px] truncate">
                    {selCiv ? `${selCiv.firstName} ${selCiv.lastName}`
                      : selVeh ? selVeh.plate
                      : selWarrant?.civilianName}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {selCiv ? `DOB ${selCiv.dob} (${age(selCiv.dob)}) · ${selCiv.gender}`
                      : selVeh ? (
                          <>
                            {selVeh.year} {selVeh.make} {selVeh.model} · {selVeh.color}
                            {vehBizOwner && <span className="ml-2 text-cyan-400">Registered to: {vehBizOwner.name} · EIN {vehBizOwner.ein}</span>}
                          </>
                        )
                      : selWarrant?.charge}
                  </div>
                </div>
                <div className="ml-auto flex gap-1.5 flex-wrap justify-end">
                  {selCiv && <FlagRow flags={selCiv.flags || []} />}
                  {selVeh?.stolen && <span className={BADGE.red}>STOLEN</span>}
                  {vehBizOwner && <span className={BADGE.blue}>COMMERCIAL</span>}
                </div>
              </div>

              {/* Active investigation flags */}
              {(activeCasesForCiv.length > 0 || activeCasesForVeh.length > 0) && (
                <InvestigationFlag cases={[...activeCasesForCiv, ...activeCasesForVeh]} />
              )}

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
                    {/* Row 1: Personal · Address · Additional */}
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                      <InfoCard title="Personal Information">
                        <Row label="Full Name"       value={`${selCiv.firstName} ${selCiv.lastName}`} />
                        <Row label="DOB"             value={`${selCiv.dob} (${age(selCiv.dob)})`} />
                        <Row label="Gender"          value={selCiv.gender} />
                        <Row label="Ethnicity"       value={selCiv.ethnicity} />
                        <Row label="Height / Weight" value={`${selCiv.height} · ${selCiv.weight}`} />
                        <Row label="Hair / Eyes"     value={`${selCiv.hair} / ${selCiv.eyes}`} />
                        <Row label="SSN"             value={selCiv.ssn} mono />
                        <Row label="DL Number"       value={selCiv.dlNumber} mono />
                        <Row label="DL Points" value={(() => {
                          const pts = selCiv.licensePoints || 0;
                          const pct = ptThreshold > 0 ? pts / ptThreshold : 0;
                          const color = pts === 0 ? '#4ade80' : pct >= 1 ? '#f87171' : pct >= 0.7 ? '#fb923c' : pct >= 0.4 ? '#facc15' : '#4ade80';
                          return (
                            <span className="flex items-center gap-2">
                              <span className="font-mono font-bold" style={{ color }}>{pts}</span>
                              <span className="text-[11px] text-slate-500">/ {ptThreshold} pts</span>
                              <span className="h-1.5 w-14 rounded-full bg-white/10 overflow-hidden">
                                <span className="h-full block rounded-full transition-all" style={{ width: `${Math.min(pct * 100, 100)}%`, background: color }} />
                              </span>
                            </span>
                          );
                        })()} />
                        <Row label="DL Status"       value={
                          <span className={statusBadge(selCiv.dlStatus)}>{selCiv.dlStatus || 'ACTIVE'}</span>
                        } />
                      </InfoCard>

                      <InfoCard title="Address(es)">
                        <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-600 mb-1">Primary Address</div>
                        <div className="text-[12.5px] text-slate-200 leading-relaxed mb-3">{selCiv.address || '—'}</div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-600 mb-1">Phone</div>
                        <div className="text-[12.5px] text-slate-300 font-mono">{selCiv.phone || '—'}</div>
                      </InfoCard>

                      <InfoCard title="Additional Information">
                        <Row label="Citizenship"    value={selCiv.citizenship || 'United States'} />
                        <Row label="Occupation"     value={selCiv.occupation || 'Unknown'} />
                        <Row label="Employer"       value={selCiv.employer || 'N/A'} />
                        <Row label="DL Class"       value={selCiv.dlClass} />
                        <Row label="Endorsements"   value={(selCiv.dlEndorsements?.length > 0) ? selCiv.dlEndorsements.join(', ') : 'None'} />
                        <Row label="Weapon Permit"  value={selCiv.weaponPermit ? <span className={statusBadge(selCiv.weaponPermit)}>{selCiv.weaponPermit}</span> : 'None'} />
                        {selCiv.flags?.length > 0 && (
                          <div className="mt-1">
                            <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-600 mb-1">Caution(s)</div>
                            <FlagRow flags={selCiv.flags} />
                          </div>
                        )}
                      </InfoCard>
                    </div>

                    {/* Row 2: Photo (vertical) · Active Warrants · Active BOLOs */}
                    <div className="grid gap-4" style={{ gridTemplateColumns: isMobile ? '1fr' : '180px 1fr 1fr' }}>
                      <InfoCard title="Photo">
                        <div className="flex items-center justify-center w-full rounded-lg bg-app-elevated border border-border-base overflow-hidden"
                          style={{ aspectRatio: '3 / 4' }}>
                          {selCiv.photoUrl
                            ? <img src={selCiv.photoUrl} alt="Mugshot" className="w-full h-full object-cover" />
                            : <MdPerson size={56} className="text-slate-700" />}
                        </div>
                      </InfoCard>

                      <InfoCard title={`Active Warrants (${activeWarrants.length})`}>
                        {activeWarrants.length === 0
                          ? <div className="text-[12px] text-slate-500">No active warrants on file.</div>
                          : activeWarrants.map(w => (
                            <div key={w.id} className="flex items-start gap-2 mb-2 last:mb-0">
                              <MdWarningAmber size={16} className="text-red-400 mt-0.5 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-[12.5px] font-semibold text-slate-200">{w.charge}</div>
                                <div className="text-[11px] text-slate-500">{w.type} · {w.issuedDate || w.date || ''}</div>
                                {w.issuedBy && <div className="text-[10.5px] text-slate-600">Issued by: {w.issuedBy}</div>}
                              </div>
                            </div>
                          ))}
                      </InfoCard>

                      <InfoCard title={`Recent Incidents (${civHistory.length})`}>
                        {civHistory.length === 0
                          ? <div className="text-[12px] text-slate-500">No recent incidents on file.</div>
                          : (
                            <div className="flex flex-col gap-2">
                              {civHistory.slice(0, 4).map(h => (
                                <div key={h.id} className="flex items-start gap-2">
                                  <MdDescription size={15} className="text-slate-500 mt-0.5 shrink-0" />
                                  <div className="min-w-0">
                                    <div className="text-[12.5px] font-semibold text-slate-200 truncate">
                                      {h.charges?.length ? h.charges.join(', ') : h.caseNumber}
                                    </div>
                                    <div className="text-[11px] text-slate-500 truncate">
                                      {[h.date, h.disposition, h.agency].filter(Boolean).join(' · ')}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {civHistory.length > 4 && (
                                <div className="text-[11px] text-slate-600 pt-0.5">
                                  +{civHistory.length - 4} more — see Criminal History tab
                                </div>
                              )}
                            </div>
                          )}
                      </InfoCard>
                    </div>
                  </div>
                )}

                {tab === 'RETURN' && selCiv     && <RecordReturn type="PERSON"  data={selCiv} />}
                {tab === 'RETURN' && selVeh && <RecordReturn type="VEHICLE" data={selVeh} subject={vehOwner || (vehBizOwner ? { firstName: vehBizOwner.name, lastName: '', dob: '', address: vehBizOwner.address, phone: vehBizOwner.phone } : null)} />}
                {tab === 'RETURN' && selWarrant && <RecordReturn type="WARRANT" data={selWarrant} />}

                {tab === 'CRIMINAL HISTORY' && selCiv && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1 pb-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-slate-600">
                        {civHistory.length} {civHistory.length === 1 ? 'Entry' : 'Entries'}
                      </span>
                    </div>
                    {civHistory.length === 0
                      ? <div className="text-slate-500 text-[12px] p-4 text-center">No criminal history on file</div>
                      : civHistory.map(h => (
                        <CollapsibleHistoryCard key={h.id} h={h} />
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

                {tab === 'MEDICAL' && selCiv && (() => {
                  const mp = selCiv.medicalProfile;
                  const hasProfile = mp && (mp.bloodType || mp.conditions?.length || mp.allergies?.length || mp.safetyNotes);
                  return (
                    <div className="flex flex-col gap-4">
                      {/* LEO notice banner */}
                      <div className="flex items-start gap-3 rounded-xl px-4 py-3"
                        style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.22)' }}>
                        <MdShield size={16} className="text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-[11px] text-amber-300/80 leading-relaxed">
                          <span className="font-bold text-amber-300">LEO View</span> · showing safety-relevant information only.
                          Medications, emergency contacts, and clinical notes are restricted to Fire &amp; EMS.
                        </div>
                      </div>

                      {!hasProfile ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                          <MdLocalHospital size={40} className="text-slate-700" />
                          <div className="text-[13px] font-semibold text-slate-400">No medical profile on file</div>
                          <div className="text-[11px] text-slate-600">Subject has not filed a medical profile.</div>
                        </div>
                      ) : (
                        <>
                          {/* Blood type + flags row */}
                          <InfoCard title="Medical Identifiers">
                            <div className="flex flex-wrap gap-2.5 items-center">
                              {mp.bloodType && (
                                <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl"
                                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                                  <span className="text-[10px] font-bold uppercase tracking-[0.6px] text-red-400/70">Blood Type</span>
                                  <span className="text-[22px] font-extrabold text-red-300 leading-none">{mp.bloodType}</span>
                                </div>
                              )}
                              {mp.dnr && (
                                <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl"
                                  style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.35)' }}>
                                  <span className="text-[10px] font-bold uppercase tracking-[0.6px] text-red-400">DNR Status</span>
                                  <span className="text-[14px] font-extrabold text-red-300">DO NOT RESUSCITATE</span>
                                </div>
                              )}
                              {mp.organDonor && (
                                <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl"
                                  style={{ background: 'rgba(61,130,240,0.08)', border: '1px solid rgba(61,130,240,0.25)' }}>
                                  <span className="text-[10px] font-bold uppercase tracking-[0.6px] text-brand-bright/70">Donor</span>
                                  <span className="text-[14px] font-extrabold text-brand-bright">Organ Donor</span>
                                </div>
                              )}
                              {!mp.bloodType && !mp.dnr && !mp.organDonor && (
                                <span className="text-[12px] text-slate-500">No identifiers on file</span>
                              )}
                            </div>
                          </InfoCard>

                          {/* Conditions */}
                          <InfoCard title="Medical Conditions">
                            {(!mp.conditions || mp.conditions.length === 0)
                              ? <div className="text-[12px] text-slate-500">No conditions listed</div>
                              : (
                                <div className="flex flex-wrap gap-1.5">
                                  {mp.conditions.map((c, i) => (
                                    <span key={i} className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[11.5px] text-amber-200 font-medium">{c}</span>
                                  ))}
                                </div>
                              )}
                          </InfoCard>

                          {/* Allergies */}
                          <InfoCard title="Known Allergies">
                            {(!mp.allergies || mp.allergies.length === 0)
                              ? <div className="text-[12px] text-slate-500">No allergies listed</div>
                              : (
                                <div className="flex flex-wrap gap-1.5">
                                  {mp.allergies.map((a, i) => (
                                    <span key={i} className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-[11.5px] text-red-200 font-medium">{a}</span>
                                  ))}
                                </div>
                              )}
                          </InfoCard>

                          {/* Safety notes */}
                          {mp.safetyNotes && (
                            <InfoCard title="Officer Safety Notes">
                              <div className="flex items-start gap-2.5">
                                <MdWarningAmber size={16} className="text-amber-400 shrink-0 mt-0.5" />
                                <div className="text-[12.5px] text-amber-200/90 leading-relaxed">{mp.safetyNotes}</div>
                              </div>
                            </InfoCard>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
