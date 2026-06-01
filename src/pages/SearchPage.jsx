import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { useResponsive } from '../hooks/useResponsive';
import StatusBadge from '../components/StatusBadge';

const SEARCH_TABS = ['PERSON', 'VEHICLE', 'PHONE', 'INCIDENT'];

const RECORD_TABS = [
  'SUMMARY', 'DETAILS', 'ADDRESSES', 'CONTACTS',
  'ASSOCIATES', 'INCIDENTS', 'CITATIONS', 'WARRANTS',
  'VEHICLES', 'PROPERTY', 'REPORTS',
];

export default function SearchPage() {
  const { state } = useCAD();
  const { civilians, vehicles, warrants, criminalHistory } = state;

  const { isMobile } = useResponsive();
  const [searchTab,   setSearchTab]   = useState('PERSON');
  const [query,       setQuery]       = useState('');
  const [results,     setResults]     = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [selectedVeh, setSelectedVeh] = useState(null);
  const [recordTab,   setRecordTab]   = useState('SUMMARY');
  const [mobilePanel, setMobilePanel] = useState('search');

  const runSearch = () => {
    const q = query.trim().toUpperCase();
    if (!q) return;
    if (searchTab === 'PERSON') {
      const found = civilians.filter(c =>
        `${c.firstName} ${c.lastName}`.toUpperCase().includes(q) ||
        (c.ssn || '').replace(/-/g, '').includes(q.replace(/-/g, ''))
      );
      setResults(found);
      setSelected(found[0] || null);
      setSelectedVeh(null);
      if (isMobile && found.length > 0) setMobilePanel('record');
    } else if (searchTab === 'VEHICLE') {
      const found = vehicles.filter(v => v.plate.toUpperCase().includes(q));
      if (found.length > 0) {
        setSelectedVeh(found[0]);
        const owner = civilians.find(c => c.id === found[0].ownerId);
        setSelected(owner || null);
        setResults(owner ? [owner] : []);
        if (isMobile) setMobilePanel('record');
      } else {
        setResults([]);
        setSelected(null);
        setSelectedVeh(null);
      }
    }
  };

  const selectCiv = civ => {
    setSelected(civ);
    setSelectedVeh(null);
    setRecordTab('SUMMARY');
    if (isMobile) setMobilePanel('record');
  };

  const civWarrants  = selected ? warrants.filter(w => w.civilianId === selected.id)           : [];
  const civHistory   = selected ? criminalHistory.filter(h => h.civilianId === selected.id)    : [];
  const civVehicles  = selected ? vehicles.filter(v => selected.vehicles?.includes(v.id))       : [];

  const activeWarrants = civWarrants.filter(w => w.status === 'ACTIVE');

  return (
    <div
      className="h-full overflow-hidden bg-[#080b12] font-mono"
      style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}
    >

      {isMobile && (
        <div className="flex border-b border-[#141720] bg-[#0d1117] shrink-0">
          {[['search', 'SEARCH'], ['record', 'RECORD'], ['activity', 'ACTIVITY']].map(([v, l]) => (
            <button key={v} onClick={() => setMobilePanel(v)}
              className={`flex-1 bg-transparent border-none py-2.5 px-1 text-[11px] tracking-[0.5px] cursor-pointer font-mono
                ${mobilePanel === v ? 'border-b-2 border-blue-700 text-sky-300 font-bold' : 'border-b-2 border-transparent text-[#4b5563] font-medium'}`}>
              {l}
            </button>
          ))}
        </div>
      )}

      {/* ── LEFT: Search panel ── */}
      <div
        className="bg-[#09090f] flex-col overflow-hidden"
        style={{
          ...(isMobile ? {
            display: mobilePanel === 'search' ? 'flex' : 'none',
            flex: 1,
          } : {
            display: 'flex',
            width: 260,
            flexShrink: 0,
            borderRight: '1px solid #141720',
          }),
        }}
      >
        {/* Panel header */}
        <div className="px-2.5 py-2 border-b border-[#141720] bg-[#0d1117]">
          <div className="text-[#374151] text-[10px] tracking-[1.5px] uppercase mb-1.5">Search</div>
          {/* Search type tabs */}
          <div className="flex gap-0.5 mb-2">
            {SEARCH_TABS.map(t => (
              <button
                key={t}
                onClick={() => setSearchTab(t)}
                className={`flex-1 rounded-sm py-[3px] px-0.5 text-[9px] font-bold tracking-[0.5px] cursor-pointer border transition-colors
                  ${searchTab === t
                    ? 'bg-[#1e3a5f] border-blue-700 text-sky-300'
                    : 'bg-transparent border-[#1a1e2c] text-[#374151]'}`}
              >
                {t}
              </button>
            ))}
          </div>
          {/* Search input */}
          <div className="flex gap-1">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runSearch()}
              placeholder={
                searchTab === 'PERSON'   ? 'Name, DOB, or SSN...'  :
                searchTab === 'VEHICLE'  ? 'Plate number...'        :
                searchTab === 'PHONE'    ? 'Phone number...'        :
                                          'Incident number...'
              }
              className="flex-1 bg-[#06070c] border border-[#1a1e2c] rounded-sm text-slate-300 py-[5px] px-[7px] text-[11px] font-mono outline-none"
            />
            <button
              onClick={runSearch}
              className="bg-[#1e3a5f] border border-blue-700 rounded-sm text-sky-300 px-2 py-[5px] text-[11px] font-bold cursor-pointer"
            >
              GO
            </button>
          </div>
          <button
            onClick={runSearch}
            className="w-full mt-1 bg-[#0d1117] border border-[#1a1e2c] rounded-sm text-[#374151] py-1 text-[10px] cursor-pointer"
          >
            Narrow Search
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {results.length === 0 && query && (
            <div className="px-2.5 py-3 text-red-600 text-[11px]">
              *** NO RECORDS FOUND ***
            </div>
          )}
          {results.map(civ => (
            <div
              key={civ.id}
              onClick={() => selectCiv(civ)}
              className="px-2.5 py-2 cursor-pointer border-b border-[#141720] hover:bg-[#0d1117] transition-colors"
              style={{
                borderLeft: `3px solid ${selected?.id === civ.id ? '#1d4ed8' : 'transparent'}`,
                background: selected?.id === civ.id ? '#0f172a' : 'transparent',
              }}
            >
              <div className={`text-[12px] font-semibold ${selected?.id === civ.id ? 'text-slate-200' : 'text-[#9ca3af]'}`}>
                {civ.firstName} {civ.lastName}
              </div>
              <div className="text-[#374151] text-[10px] mt-0.5">DOB: {civ.dob}</div>
              <div className="text-[#374151] text-[10px]">SSN: ***-**-{(civ.ssn || '').slice(-4)}</div>
              {civ.flags?.length > 0 && (
                <div className="mt-[3px] flex gap-[3px] flex-wrap">
                  {civ.flags.map(f => (
                    <span key={f} className="bg-[#450a0a] text-red-400 border border-[#991b1b] rounded-sm text-[9px] px-1 font-bold">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom actions */}
        <div className="px-2 py-1.5 border-t border-[#141720] flex gap-1">
          <button
            onClick={() => { setQuery(''); setResults([]); setSelected(null); setSelectedVeh(null); }}
            className="flex-1 bg-[#0d1117] border border-[#1a1e2c] rounded-sm text-[#374151] py-1 text-[10px] cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ── CENTER: Record workspace ── */}
      <div
        className="flex-col overflow-hidden min-w-0"
        style={isMobile
          ? { display: mobilePanel === 'record' ? 'flex' : 'none', flex: 1 }
          : { display: 'flex', flex: 1 }}
      >
        {!selected ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-2.5 text-[#1f2937]">
            <div className="text-[13px] font-bold tracking-[1px]">RECORDS SEARCH</div>
            <div className="text-[11px]">Enter a name, SSN, or plate to begin a search</div>
          </div>
        ) : (
          <>
            {/* Record header */}
            <div className="bg-[#0d1117] border-b border-[#141720] px-3.5 py-2 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#1a1e2c] border border-[#374151] flex items-center justify-center shrink-0">
                  <span className="text-[#6b7280] text-[14px]">👤</span>
                </div>
                <div>
                  <div className="text-slate-200 font-bold text-[16px] tracking-[0.3px]">
                    {selected.firstName} {selected.lastName}
                  </div>
                  <div className="flex gap-2.5 mt-px">
                    <span className="text-[#374151] text-[11px]">DOB: <span className="text-[#9ca3af]">{selected.dob}</span></span>
                    <span className="text-[#374151] text-[11px]">SSN: <span className="text-[#9ca3af]">{selected.ssn}</span></span>
                  </div>
                </div>
                {activeWarrants.length > 0 && (
                  <span className="ml-auto bg-[#450a0a] text-red-400 border border-[#991b1b] rounded-sm px-2 py-0.5 text-[11px] font-bold">
                    WANTED — {activeWarrants.length} WARRANT{activeWarrants.length > 1 ? 'S' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Record tabs */}
            <div className="bg-[#090b10] border-b border-[#141720] flex shrink-0 overflow-x-auto">
              {RECORD_TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setRecordTab(t)}
                  className={`bg-transparent border-none py-[7px] px-3 text-[11px] tracking-[0.5px] cursor-pointer whitespace-nowrap shrink-0
                    ${recordTab === t
                      ? 'border-b-2 border-blue-700 text-sky-300 font-bold'
                      : 'border-b-2 border-transparent text-[#374151] font-medium'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-3.5 py-3">

              {recordTab === 'SUMMARY' && (
                <SummaryTab civ={selected} civVehicles={civVehicles} activeWarrants={activeWarrants} />
              )}

              {recordTab === 'INCIDENTS' && (
                <HistoryTab civHistory={civHistory} />
              )}

              {recordTab === 'WARRANTS' && (
                <WarrantsTab civWarrants={civWarrants} />
              )}

              {recordTab === 'VEHICLES' && (
                <VehiclesTab civVehicles={civVehicles} />
              )}

              {['DETAILS','ADDRESSES','CONTACTS','ASSOCIATES','CITATIONS','PROPERTY','REPORTS'].includes(recordTab) && (
                <div className="text-[#1f2937] text-center pt-10 text-[12px]">
                  {recordTab} data not available in demo
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── RIGHT: Location + Activity ── */}
      <div
        className="flex-col overflow-hidden bg-[#09090f]"
        style={isMobile
          ? { display: mobilePanel === 'activity' ? 'flex' : 'none', flex: 1 }
          : { display: 'flex', width: 320, flexShrink: 0, borderLeft: '1px solid #141720' }}
      >
        {/* Map placeholder */}
        <PanelHead title="LOCATION" />
        <div className="h-[200px] bg-[#0b0f18] border-b border-[#141720] flex items-center justify-center shrink-0 relative overflow-hidden">
          {/* Fake map grid */}
          <div className="absolute inset-0 opacity-15">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="absolute left-0 right-0 h-px bg-blue-700" style={{ top: `${i * 14}%` }} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="absolute top-0 bottom-0 w-px bg-blue-700" style={{ left: `${i * 11}%` }} />
            ))}
          </div>
          {selected?.address ? (
            <div className="text-center z-[1]">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white mx-auto mb-1.5 shadow-[0_0_8px_theme(colors.blue.500)]" />
              <div className="text-[#9ca3af] text-[10px] font-mono">{selected.address}</div>
            </div>
          ) : (
            <span className="text-[#1f2937] text-[11px]">No location data</span>
          )}
        </div>

        {/* Recent activity */}
        <PanelHead title="RECENT ACTIVITY" />
        <div className="flex-1 overflow-y-auto">
          {civHistory.length === 0 && civWarrants.length === 0 ? (
            <div className="px-2.5 py-3 text-[#1f2937] text-[11px]">No recent activity on record.</div>
          ) : (
            <>
              {civWarrants.map(w => (
                <ActivityRow
                  key={w.id}
                  time={w.issuedDate}
                  label={w.status === 'ACTIVE' ? 'Warrant Active' : 'Warrant Served'}
                  detail={w.charge}
                  color={w.status === 'ACTIVE' ? '#dc2626' : '#374151'}
                />
              ))}
              {civHistory.slice(0, 8).map(h => (
                <ActivityRow
                  key={h.id}
                  time={h.date}
                  label={h.disposition}
                  detail={Array.isArray(h.charges) ? h.charges[0] : h.charges}
                  color="#fbbf24"
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-tabs ── */

function SummaryTab({ civ, civVehicles, activeWarrants }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Top 3-column grid */}
      <div className="grid grid-cols-3 gap-2.5">

        <FieldCard title="PERSONAL INFORMATION">
          <InfoRow label="Full Name"       value={`${civ.firstName} ${civ.lastName}`} />
          <InfoRow label="DOB"             value={`${civ.dob} (${age(civ.dob)})`} />
          <InfoRow label="Gender"          value={civ.gender} />
          <InfoRow label="Race"            value={civ.ethnicity} />
          <InfoRow label="Height / Weight" value={`${civ.height} / ${civ.weight} lbs`} />
          <InfoRow label="Hair / Eyes"     value={`${civ.hair} / ${civ.eyes}`} />
          <InfoRow label="SSN"             value={civ.ssn} />
          <InfoRow label="DL Number"       value={civ.dlNumber} />
          <InfoRow label="DL Status"       value={civ.dlStatus} valueColor={civ.dlStatus === 'ACTIVE' ? '#4ade80' : '#f87171'} />
          <InfoRow label="DL Expiry"       value={civ.dlExpiry} />
        </FieldCard>

        <FieldCard title="ADDRESS(ES)">
          <div className="text-[#374151] text-[10px] tracking-[0.5px] mb-1">Primary Address</div>
          <div className="text-slate-300 text-[12px] leading-[1.6]">{civ.address || 'N/A'}</div>
          {civ.phone && (
            <>
              <div className="border-t border-[#141720] mt-2.5 pt-2 text-[#374151] text-[10px] tracking-[0.5px] mb-1">Phone</div>
              <div className="text-slate-300 text-[12px]">{civ.phone}</div>
            </>
          )}
        </FieldCard>

        <FieldCard title="ADDITIONAL INFORMATION">
          <InfoRow label="Citizenship"   value="United States" />
          <InfoRow label="Occupation"    value="Unknown" />
          <InfoRow label="Employer"      value="N/A" />
          <InfoRow label="DL Class"      value={civ.dlClass || 'C'} />
          {civ.flags?.length > 0 && (
            <div className="mt-1.5">
              <div className="text-[#374151] text-[10px] mb-1">Cautions</div>
              <div className="flex flex-wrap gap-[3px]">
                {civ.flags.map(f => (
                  <span key={f} className="bg-[#450a0a] text-red-400 border border-[#991b1b] rounded-sm text-[9px] px-[5px] py-px font-bold">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </FieldCard>
      </div>

      {/* Photo + Warrants + BOLOs row */}
      <div className="grid gap-2.5" style={{ gridTemplateColumns: '140px 1fr 1fr' }}>
        <FieldCard title="PHOTO">
          <div className="h-[100px] bg-[#0d1117] border border-[#1a1e2c] rounded-sm flex items-center justify-center">
            <span className="text-[#374151] text-[28px]">👤</span>
          </div>
        </FieldCard>

        <FieldCard title={`ACTIVE WARRANTS (${activeWarrants.length})`}>
          {activeWarrants.length === 0 ? (
            <div className="text-[#374151] text-[11px] py-1">None</div>
          ) : (
            activeWarrants.map(w => (
              <div key={w.id} className="mb-2 pb-2 border-b border-[#141720]">
                <div className="flex gap-2 items-center mb-0.5">
                  <span className="text-sky-300 text-[11px] font-bold">WARRANT # {w.id}</span>
                  <span className="text-[#374151] text-[10px] ml-auto">{w.issuedDate}</span>
                </div>
                <div className="text-[#fca5a5] text-[11px]">{w.charge}</div>
                <div className="text-[#374151] text-[10px] mt-0.5">Issued by: {w.issuedBy}</div>
                <span className="bg-[#450a0a] text-red-400 border border-[#991b1b] rounded-sm text-[9px] px-[5px] font-bold">FELONY</span>
              </div>
            ))
          )}
        </FieldCard>

        <FieldCard title="ACTIVE BOLOs / LOCATIONS (0)">
          <div className="text-[#374151] text-[11px] py-1">No active BOLOs or lookout notices.</div>
        </FieldCard>
      </div>

      {/* Recent Incidents table */}
      <FieldCard title="RECENT INCIDENTS">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr>
              {['DATE / TIME', 'INCIDENT #', 'TYPE', 'LOCATION', 'DISPOSITION'].map(h => (
                <th key={h} className="px-2 py-[5px] text-left text-[#374151] text-[10px] tracking-[0.6px] border-b border-[#141720] whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {civVehicles.length === 0 ? (
              <tr><td colSpan={5} className="px-2 py-2.5 text-[#1f2937] text-center">No incidents on file</td></tr>
            ) : (
              civVehicles.slice(0, 5).map((v, i) => (
                <tr key={v.id} className={i % 2 === 0 ? 'bg-[#0b0d14]' : ''}>
                  <td className="px-2 py-1 text-[#374151]">—</td>
                  <td className="px-2 py-1 text-sky-300">{v.plate}</td>
                  <td className="px-2 py-1 text-[#9ca3af]">Vehicle on file</td>
                  <td className="px-2 py-1 text-[#6b7280]">—</td>
                  <td className="px-2 py-1"><StatusBadge status={v.regStatus} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </FieldCard>
    </div>
  );
}

function HistoryTab({ civHistory }) {
  if (civHistory.length === 0) {
    return (
      <div className="px-3 py-3 bg-[#052e16] border border-[#166534] rounded-sm text-green-400 text-[12px] font-mono">
        *** SUBJECT RETURNS CLEAR — NO CRIMINAL HISTORY ON FILE ***
      </div>
    );
  }
  return (
    <div className="table-scroll">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="bg-[#0d1117]">
            {['DATE', 'CASE #', 'CHARGES', 'OFFICER', 'AGENCY', 'DISPOSITION', 'SENTENCE'].map(h => (
              <th key={h} className="px-2.5 py-1.5 text-left text-[#374151] text-[10px] tracking-[0.7px] border-b border-[#141720] whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {civHistory.map((h, i) => (
            <tr key={h.id} className={i % 2 === 0 ? 'bg-[#090b10]' : 'bg-[#0b0d14]'}>
              <td className="px-2.5 py-[5px] text-[#6b7280]">{h.date}</td>
              <td className="px-2.5 py-[5px] text-sky-300 font-bold">{h.caseNumber}</td>
              <td className="px-2.5 py-[5px] text-slate-200 max-w-[200px]">{Array.isArray(h.charges) ? h.charges.join(', ') : h.charges}</td>
              <td className="px-2.5 py-[5px] text-[#6b7280]">{h.officerBadge}</td>
              <td className="px-2.5 py-[5px] text-[#6b7280]">{h.agency}</td>
              <td className="px-2.5 py-[5px]"><StatusBadge status={h.disposition} /></td>
              <td className="px-2.5 py-[5px] text-[#6b7280]">{h.sentence}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WarrantsTab({ civWarrants }) {
  if (civWarrants.length === 0) {
    return (
      <div className="px-3 py-3 bg-[#052e16] border border-[#166534] rounded-sm text-green-400 text-[12px] font-mono">
        *** SUBJECT RETURNS CLEAR — NO ACTIVE WARRANTS ***
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {civWarrants.map(w => (
        <div key={w.id} className="bg-[#0d1117] rounded-sm px-3 py-3"
          style={{ border: `1px solid ${w.status === 'ACTIVE' ? '#991b1b' : '#1a1e2c'}` }}
        >
          <div className="flex gap-2.5 items-center mb-1.5">
            <span className="text-sky-300 font-bold text-[12px]">WARRANT #{w.id}</span>
            <StatusBadge status={w.status} />
            <span className="ml-auto text-[#374151] text-[11px]">{w.issuedDate}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <InfoRow label="Type"     value={w.type} />
            <InfoRow label="Charge"   value={w.charge} valueColor="#fca5a5" />
            <InfoRow label="Issued By" value={w.issuedBy} />
          </div>
          {w.notes && <div className="mt-1.5 text-[#4b5563] text-[11px]">{w.notes}</div>}
        </div>
      ))}
    </div>
  );
}

function VehiclesTab({ civVehicles }) {
  if (civVehicles.length === 0) {
    return <div className="text-[#1f2937] text-[12px]">No vehicles registered to this subject.</div>;
  }
  return (
    <div className="table-scroll">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="bg-[#0d1117]">
            {['PLATE', 'YEAR', 'MAKE', 'MODEL', 'COLOR', 'REG STATUS', 'STOLEN', 'FLAGS'].map(h => (
              <th key={h} className="px-2.5 py-1.5 text-left text-[#374151] text-[10px] tracking-[0.7px] border-b border-[#141720] whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {civVehicles.map((v, i) => (
            <tr key={v.id} className={i % 2 === 0 ? 'bg-[#090b10]' : 'bg-[#0b0d14]'}>
              <td className="px-2.5 py-[5px] text-sky-300 font-bold">{v.plate}</td>
              <td className="px-2.5 py-[5px] text-[#6b7280]">{v.year}</td>
              <td className="px-2.5 py-[5px] text-[#9ca3af]">{v.make}</td>
              <td className="px-2.5 py-[5px] text-[#9ca3af]">{v.model}</td>
              <td className="px-2.5 py-[5px] text-[#9ca3af]">{v.color}</td>
              <td className="px-2.5 py-[5px]"><StatusBadge status={v.regStatus} /></td>
              <td className="px-2.5 py-[5px]"><StatusBadge status={v.stolen ? 'ACTIVE' : 'VALID'} /></td>
              <td className="px-2.5 py-[5px] text-[#374151]">{v.flags?.join(', ') || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Shared components ── */

function PanelHead({ title }) {
  return (
    <div className="px-2.5 py-[5px] bg-[#0d1117] border-b border-[#141720] text-[#374151] text-[10px] tracking-[1.5px] uppercase font-bold shrink-0">
      {title}
    </div>
  );
}

function FieldCard({ title, children }) {
  return (
    <div className="bg-[#0d1117] border border-[#141720] rounded-sm overflow-hidden">
      <div className="px-2 py-1 bg-[#0b0f18] border-b border-[#141720] text-[#374151] text-[9px] tracking-[1px] uppercase font-bold">
        {title}
      </div>
      <div className="p-2">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value, valueColor }) {
  return (
    <div className="flex gap-1.5 mb-[3px] text-[11px]">
      <span className="text-[#374151] min-w-[100px] shrink-0">{label}</span>
      <span style={{ color: valueColor || '#d1d5db' }}>{value || 'N/A'}</span>
    </div>
  );
}

function ActivityRow({ time, label, detail, color }) {
  return (
    <div className="px-2.5 py-1.5 border-b border-[#141720] flex gap-2 items-baseline">
      <span className="text-[#1f2937] text-[10px] shrink-0 font-mono">{time}</span>
      <div className="min-w-0">
        <div className="text-[11px] font-bold" style={{ color }}>{label}</div>
        <div className="text-[#374151] text-[10px] overflow-hidden text-ellipsis whitespace-nowrap">{detail}</div>
      </div>
    </div>
  );
}

function age(dob) {
  if (!dob) return '?';
  const [m, d, y] = dob.split('/').map(Number);
  if (!y) return '?';
  const today = new Date();
  const birthDate = new Date(y, m - 1, d);
  let a = today.getFullYear() - birthDate.getFullYear();
  if (today < new Date(today.getFullYear(), m - 1, d)) a--;
  return a;
}
