import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { RecordReturn } from '../components/FormDocument';
import { BADGE, xs, S_PAGE, S_BTN_PRIMARY, S_BTN_SECONDARY } from '../constants/styles';

function FlagBadge({ flag }) {
  const map = { WARRANT: BADGE.red, CAUTION: BADGE.orange, VIOLENT: BADGE.fire };
  return <span className={map[flag] || BADGE.gray}>{flag}</span>;
}

export default function RecordsBureau() {
  const { state, dispatch } = useCAD();
  const { civilians, vehicles, warrants, criminalHistory, officers, currentUser } = state;

  const [searchType, setSearchType] = useState('PERSON');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('RETURN');
  const [searched, setSearched] = useState(false);

  const doSearch = () => {
    if (!query.trim()) return;
    setSearched(true);
    const q = query.trim().toLowerCase();
    if (searchType === 'PERSON') {
      setResults(civilians.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.ssn?.includes(q) || c.dlNumber?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
      ));
    } else if (searchType === 'VEHICLE') {
      setResults(vehicles.filter(v =>
        v.plate?.toLowerCase().includes(q) ||
        `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(q)
      ));
    } else if (searchType === 'WARRANT') {
      setResults(warrants.filter(w =>
        w.civilianName?.toLowerCase().includes(q) ||
        w.charge?.toLowerCase().includes(q)
      ));
    }
    setSelected(null);
    setTab('RETURN');
  };

  const selCiv = selected && searchType === 'PERSON' ? civilians.find(c => c.id === selected) : null;
  const selVeh = selected && searchType === 'VEHICLE' ? vehicles.find(v => v.id === selected) : null;
  const selWarrant = selected && searchType === 'WARRANT' ? warrants.find(w => w.id === selected) : null;

  const civVehicles = selCiv ? vehicles.filter(v => selCiv.vehicles?.includes(v.id)) : [];
  const civWarrants = selCiv ? warrants.filter(w => w.civilianId === selCiv.id) : [];
  const civHistory = selCiv ? criminalHistory.filter(h => h.civilianId === selCiv.id) : [];
  const vehOwner = selVeh ? civilians.find(c => c.id === selVeh.ownerId) : null;
  const vehWarrants = vehOwner ? warrants.filter(w => w.civilianId === vehOwner.id) : [];

  const SEARCH_TYPES = ['PERSON', 'VEHICLE', 'WARRANT'];

  const personTabs = ['RETURN', 'CRIMINAL HISTORY', 'WARRANTS', 'VEHICLES'];
  const vehTabs = ['RETURN', 'FLAGS'];
  const activeTabs = selCiv ? personTabs : selVeh ? vehTabs : ['RETURN'];

  return (
    <div className={`${S_PAGE} !p-0 overflow-hidden !gap-0`}>
      <div className="mob-two-pane grid flex-1 min-h-0 overflow-hidden" style={{ gridTemplateColumns: '260px 1fr', gap: 0 }}>

        {/* ── LEFT: Query panel ─────────────────────────────────────── */}
        <div className={`mob-list-panel${selected ? ' mob-gone' : ''} flex flex-col overflow-hidden border-r-2 border-border-base bg-app-bg`}>
          <div className="px-2 py-1.5 bg-app-card border-b border-border-base shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-cad-text">
              Records Query
            </span>
          </div>

          {/* Search type */}
          <div className="px-2 py-1.5 border-b border-border-base flex gap-1 shrink-0">
            {SEARCH_TYPES.map(t => (
              <button key={t}
                className={`${xs(searchType === t ? S_BTN_PRIMARY : S_BTN_SECONDARY)} flex-1 justify-center`}
                onClick={() => { setSearchType(t); setResults([]); setSelected(null); setSearched(false); setQuery(''); }}>
                {t}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="px-2 py-1.5 border-b border-border-base shrink-0">
            <div className="text-[8px] uppercase tracking-[0.5px] text-cad-muted mb-1 font-bold">
              {searchType === 'PERSON' ? 'Name / SSN / DL#' :
               searchType === 'VEHICLE' ? 'Plate / Make Model' : 'Subject Name / Charge'}
            </div>
            <div className="flex gap-1">
              <input
                className="flex-1 text-[11px] bg-app-input border border-border-base rounded text-cad-text px-2 py-1.5 outline-none focus:border-sky-700 transition-colors"
                placeholder={
                  searchType === 'PERSON' ? 'e.g. Washington' :
                  searchType === 'VEHICLE' ? 'e.g. SUS-1109' : 'e.g. possession'
                }
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
              />
              <button
                className={`${xs(S_BTN_PRIMARY)} shrink-0 !px-2`}
                onClick={doSearch}>
                RUN
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {!searched && (
              <div className="p-3 text-cad-muted text-[10px] leading-[1.7]">
                <div className="text-[8px] font-bold uppercase tracking-[0.7px] mb-1.5 text-cad-muted">
                  Query Examples
                </div>
                <div>• Full or partial name</div>
                <div>• SSN or DL number</div>
                <div>• Vehicle plate or description</div>
                <div>• Warrant by name or charge</div>
              </div>
            )}
            {searched && results.length === 0 && (
              <div className="p-5 text-center text-cad-muted text-[11px]">
                NO RECORDS FOUND
              </div>
            )}
            {results.map((r, idx) => {
              const isSelected = selected === r.id;
              if (searchType === 'PERSON') {
                return (
                  <div key={r.id}
                    className={`px-2 py-1.5 cursor-pointer border-b border-white/[0.05] border-l-[3px] transition-colors ${isSelected ? 'border-l-sky-500 bg-app-selected' : 'border-l-transparent hover:bg-app-hover'}`}
                    style={{ animationDelay: `${idx * 35}ms` }}
                    onClick={() => { setSelected(r.id); setTab('RETURN'); }}>
                    <div className="font-bold text-[11px] text-cad-text font-mono">
                      {r.lastName}, {r.firstName}
                    </div>
                    <div className="text-[9px] text-cad-muted font-mono mt-0.5">
                      DOB: {r.dob} · {r.gender}
                    </div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {r.flags?.map(f => <FlagBadge key={f} flag={f} />)}
                      {r.dlStatus === 'SUSPENDED' && <span className={BADGE.orange}>DL SUSP</span>}
                    </div>
                  </div>
                );
              } else if (searchType === 'VEHICLE') {
                return (
                  <div key={r.id}
                    className={`px-2 py-1.5 cursor-pointer border-b border-white/[0.05] border-l-[3px] transition-colors ${isSelected ? 'border-l-sky-500 bg-app-selected' : 'border-l-transparent hover:bg-app-hover'}`}
                    style={{ animationDelay: `${idx * 35}ms` }}
                    onClick={() => { setSelected(r.id); setTab('RETURN'); }}>
                    <div className="font-bold text-[12px] font-mono text-cad-data">{r.plate}</div>
                    <div className="text-[10px] text-cad-text mt-0.5">{r.year} {r.make} {r.model} · {r.color}</div>
                    <div className="flex gap-1 mt-1">
                      {r.stolen && <span className={BADGE.red}>STOLEN</span>}
                      {r.regStatus !== 'VALID' && <span className={BADGE.orange}>REG {r.regStatus}</span>}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={r.id}
                    className={`px-2 py-1.5 cursor-pointer border-b border-white/[0.05] border-l-[3px] transition-colors ${isSelected ? 'border-l-sky-500 bg-app-selected' : 'border-l-transparent hover:bg-app-hover'}`}
                    style={{ animationDelay: `${idx * 35}ms` }}
                    onClick={() => { setSelected(r.id); setTab('RETURN'); }}>
                    <div className="font-semibold text-[11px] text-cad-text">{r.civilianName}</div>
                    <div className="text-[10px] text-cad-dim mt-0.5">{r.charge}</div>
                    <div className="flex gap-1 mt-1">
                      <span className={r.status === 'ACTIVE' ? BADGE.red : BADGE.green}>{r.status}</span>
                      <span className={BADGE.gray}>{r.type}</span>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>

        {/* ── RIGHT: Record detail ──────────────────────────────────── */}
        <div className={`mob-detail-panel${!selected ? ' mob-gone' : ''} flex flex-col overflow-hidden bg-neutral-900`}>
          {/* Mobile back button */}
          <button className="mob-back-btn" onClick={() => setSelected(null)}>
            ← Back to Results
          </button>
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500 p-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <div className="text-center">
                <div className="text-[12px] font-medium text-slate-400 mb-1 uppercase tracking-[0.5px]">
                  No record selected
                </div>
                <div className="text-[10px] text-slate-500">Run a query and select a result</div>
              </div>
            </div>
          ) : (
            <>
              {/* Tab bar */}
              <div className="flex border-b border-neutral-800 bg-neutral-950 shrink-0">
                {activeTabs.map(t => (
                  <button key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-1.5 border-none cursor-pointer text-[9px] font-bold uppercase tracking-[0.5px] transition-colors ${tab === t ? 'bg-neutral-900 text-white border-b-2 border-sky-500' : 'bg-transparent text-slate-600 border-b-2 border-transparent'}`}>
                    {t}
                    {t === 'CRIMINAL HISTORY' && civHistory.length > 0 && (
                      <span className="ml-1 text-[8px] bg-red-700 text-white px-0.5">
                        {civHistory.length}
                      </span>
                    )}
                    {t === 'WARRANTS' && civWarrants.filter(w => w.status === 'ACTIVE').length > 0 && (
                      <span className="ml-1 text-[8px] bg-red-700 text-white px-0.5">
                        {civWarrants.filter(w => w.status === 'ACTIVE').length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col items-start">

                {/* RETURN tab — NCIC-style record return */}
                {tab === 'RETURN' && selCiv && (
                  <RecordReturn type="PERSON" data={selCiv} />
                )}
                {tab === 'RETURN' && selVeh && (
                  <RecordReturn type="VEHICLE" data={selVeh} subject={vehOwner} />
                )}
                {tab === 'RETURN' && selWarrant && (
                  <RecordReturn type="WARRANT" data={selWarrant} />
                )}

                {/* CRIMINAL HISTORY */}
                {tab === 'CRIMINAL HISTORY' && selCiv && (
                  <div className="w-full max-w-[760px]">
                    {civHistory.length === 0 ? (
                      <div className="text-slate-600 text-[11px] font-mono p-4 text-center">
                        NO CRIMINAL HISTORY ON FILE
                      </div>
                    ) : civHistory.map(h => (
                      <div key={h.id} className="mb-3 border border-border-base bg-app-card rounded overflow-hidden">
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-app-bg border-b border-border-base text-[10px] font-bold uppercase tracking-[0.5px] text-slate-500">
                          <span>CRIMINAL HISTORY ENTRY — {h.caseNumber}</span>
                          <span className="ml-auto font-normal text-[12px] opacity-85">{h.date}</span>
                        </div>
                        <div className="p-3 font-mono text-[12px] text-slate-300 flex flex-col gap-1">
                          <div className="text-sky-700 font-bold text-[11px] uppercase tracking-wider mb-1">*** CASE INFORMATION ***</div>
                          <div className="leading-[1.75]"><span className="text-slate-500 mr-2">CASE NUMBER: </span><span className="bg-sky-900/20 text-slate-200 px-1 rounded-sm">{h.caseNumber}</span></div>
                          <div className="leading-[1.75]"><span className="text-slate-500 mr-2">DATE: </span><span className="bg-sky-900/20 text-slate-200 px-1 rounded-sm">{h.date}</span></div>
                          <div className="leading-[1.75]"><span className="text-slate-500 mr-2">DISPOSITION: </span><span className="bg-sky-900/20 text-slate-200 px-1 rounded-sm">{h.disposition}</span></div>
                          <div className="leading-[1.75]"><span className="text-slate-500 mr-2">AGENCY: </span><span className="bg-sky-900/20 text-slate-200 px-1 rounded-sm">{h.agency}</span></div>
                          <div className="leading-[1.75]"><span className="text-slate-500 mr-2">OFFICER BADGE: </span><span className="bg-sky-900/20 text-slate-200 px-1 rounded-sm">{h.officerBadge}</span></div>
                          {h.sentence && <div className="leading-[1.75]"><span className="text-slate-500 mr-2">SENTENCE: </span><span className="bg-sky-900/20 text-slate-200 px-1 rounded-sm">{h.sentence}</span></div>}
                          <div className="text-sky-700 font-bold text-[11px] uppercase tracking-wider mt-1 mb-1">*** CHARGES ***</div>
                          {h.charges?.map((c, i) => (
                            <div key={i} className="leading-[1.75]">
                              <span className="text-slate-500 mr-2">CHARGE {i + 1}: </span>
                              <span className="bg-sky-900/20 text-slate-200 px-1 rounded-sm">{c}</span>
                            </div>
                          ))}
                          {h.notes && (
                            <>
                              <div className="text-sky-700 font-bold text-[11px] uppercase tracking-wider mt-1 mb-1">*** NOTES ***</div>
                              <div className="text-[12px] font-mono leading-[1.6] text-slate-400">{h.notes}</div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* WARRANTS */}
                {tab === 'WARRANTS' && selCiv && (
                  <div className="w-full max-w-[760px]">
                    {civWarrants.length === 0 ? (
                      <div className="text-slate-600 text-[11px] font-mono p-4 text-center">
                        NO WARRANTS ON FILE
                      </div>
                    ) : civWarrants.map(w => (
                      <div key={w.id} className="mb-3">
                        <RecordReturn type="WARRANT" data={w} />
                      </div>
                    ))}
                  </div>
                )}

                {/* VEHICLES */}
                {tab === 'VEHICLES' && selCiv && (
                  <div className="w-full max-w-[760px]">
                    {civVehicles.length === 0 ? (
                      <div className="text-slate-600 text-[11px] font-mono p-4 text-center">
                        NO VEHICLES ON FILE
                      </div>
                    ) : civVehicles.map(v => (
                      <div key={v.id} className="mb-3">
                        <RecordReturn type="VEHICLE" data={v} subject={selCiv} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Vehicle FLAGS tab */}
                {tab === 'FLAGS' && selVeh && (
                  <div className="w-full max-w-[760px] border border-border-base bg-app-card rounded overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-app-bg border-b border-border-base text-[10px] font-bold uppercase tracking-[0.5px] text-slate-500">
                      <span>VEHICLE FLAGS — {selVeh.plate}</span>
                      <span className="ml-auto font-normal text-[12px] opacity-85">{new Date().toLocaleString()}</span>
                    </div>
                    <div className="p-3 font-mono text-[12px] text-slate-300 flex flex-col gap-1.5">
                      {!selVeh.stolen && selVeh.flags?.length === 0 && !vehWarrants.some(w => w.status === 'ACTIVE') ? (
                        <div className="text-slate-600 text-[11px]">NO FLAGS ON FILE</div>
                      ) : (
                        <>
                          {selVeh.stolen && (
                            <div className="mb-1.5">
                              <span className={BADGE.red}>STOLEN VEHICLE</span>
                            </div>
                          )}
                          {vehWarrants.some(w => w.status === 'ACTIVE') && (
                            <div className="mb-1.5">
                              <span className={BADGE.red}>OWNER HAS ACTIVE WARRANT</span>
                            </div>
                          )}
                          {selVeh.flags?.map(f => (
                            <div key={f} className="mb-1.5">
                              <span className={BADGE.orange}>{f}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
