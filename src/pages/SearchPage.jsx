import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { useResponsive } from '../hooks/useResponsive';
import StatusBadge from '../components/StatusBadge';

const MONO = "'Ubuntu', sans-serif";

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
  const [results,     setResults]     = useState([]);  // list of civilian matches
  const [selected,    setSelected]    = useState(null); // selected civilian
  const [selectedVeh, setSelectedVeh] = useState(null); // selected vehicle
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
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      height: '100%',
      fontFamily: MONO,
      background: '#080b12',
      overflow: 'hidden',
    }}>

      {isMobile && (
        <div style={{ display: 'flex', borderBottom: '1px solid #141720', background: '#0d1117', flexShrink: 0 }}>
          {[['search', 'SEARCH'], ['record', 'RECORD'], ['activity', 'ACTIVITY']].map(([v, l]) => (
            <button key={v} onClick={() => setMobilePanel(v)} style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: mobilePanel === v ? '2px solid #1d4ed8' : '2px solid transparent', color: mobilePanel === v ? '#93c5fd' : '#4b5563', padding: '10px 4px', fontSize: '11px', fontWeight: mobilePanel === v ? 700 : 500, letterSpacing: '0.5px', cursor: 'pointer', fontFamily: MONO }}>
              {l}
            </button>
          ))}
        </div>
      )}

      {/* ── LEFT: Search panel ── */}
      <div style={{
        background: '#09090f',
        flexDirection: 'column',
        overflow: 'hidden',
        ...(isMobile ? {
          display: mobilePanel === 'search' ? 'flex' : 'none',
          flex: 1,
        } : {
          display: 'flex',
          width: '260px',
          flexShrink: 0,
          borderRight: '1px solid #141720',
        }),
      }}>
        {/* Panel header */}
        <div style={{ padding: '8px 10px', borderBottom: '1px solid #141720', background: '#0d1117' }}>
          <div style={{ color: '#374151', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Search</div>
          {/* Search type tabs */}
          <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
            {SEARCH_TABS.map(t => (
              <button
                key={t}
                onClick={() => setSearchTab(t)}
                style={{
                  flex: 1,
                  background: searchTab === t ? '#1e3a5f' : 'transparent',
                  border: `1px solid ${searchTab === t ? '#1d4ed8' : '#1a1e2c'}`,
                  borderRadius: '2px',
                  color: searchTab === t ? '#93c5fd' : '#374151',
                  padding: '3px 2px',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>
          {/* Search input */}
          <div style={{ display: 'flex', gap: '4px' }}>
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
              style={{
                flex: 1,
                background: '#06070c',
                border: '1px solid #1a1e2c',
                borderRadius: '2px',
                color: '#d1d5db',
                padding: '5px 7px',
                fontSize: '11px',
                fontFamily: MONO,
              }}
            />
            <button
              onClick={runSearch}
              style={{ background: '#1e3a5f', border: '1px solid #1d4ed8', borderRadius: '2px', color: '#93c5fd', padding: '5px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
            >
              GO
            </button>
          </div>
          <button
            onClick={runSearch}
            style={{ width: '100%', background: '#0d1117', border: '1px solid #1a1e2c', borderRadius: '2px', color: '#374151', padding: '4px', fontSize: '10px', cursor: 'pointer', marginTop: '4px' }}
          >
            Narrow Search
          </button>
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {results.length === 0 && query && (
            <div style={{ padding: '12px 10px', color: '#dc2626', fontSize: '11px' }}>
              *** NO RECORDS FOUND ***
            </div>
          )}
          {results.map(civ => (
            <div
              key={civ.id}
              onClick={() => selectCiv(civ)}
              style={{
                padding: '8px 10px',
                cursor: 'pointer',
                borderBottom: '1px solid #141720',
                borderLeft: `3px solid ${selected?.id === civ.id ? '#1d4ed8' : 'transparent'}`,
                background: selected?.id === civ.id ? '#0f172a' : 'transparent',
              }}
              onMouseEnter={e => { if (selected?.id !== civ.id) e.currentTarget.style.background = '#0d1117'; }}
              onMouseLeave={e => { if (selected?.id !== civ.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ color: selected?.id === civ.id ? '#e2e8f0' : '#9ca3af', fontSize: '12px', fontWeight: 600 }}>
                {civ.firstName} {civ.lastName}
              </div>
              <div style={{ color: '#374151', fontSize: '10px', marginTop: '2px' }}>
                DOB: {civ.dob}
              </div>
              <div style={{ color: '#374151', fontSize: '10px' }}>
                SSN: ***-**-{(civ.ssn || '').slice(-4)}
              </div>
              {civ.flags?.length > 0 && (
                <div style={{ marginTop: '3px', display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                  {civ.flags.map(f => (
                    <span key={f} style={{ background: '#450a0a', color: '#f87171', border: '1px solid #991b1b', borderRadius: '2px', fontSize: '9px', padding: '0 4px', fontWeight: 700 }}>
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom actions */}
        <div style={{ padding: '6px 8px', borderTop: '1px solid #141720', display: 'flex', gap: '4px' }}>
          <button
            onClick={() => { setQuery(''); setResults([]); setSelected(null); setSelectedVeh(null); }}
            style={{ flex: 1, background: '#0d1117', border: '1px solid #1a1e2c', borderRadius: '2px', color: '#374151', padding: '4px', fontSize: '10px', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* ── CENTER: Record workspace ── */}
      <div style={{ flexDirection: 'column', overflow: 'hidden', minWidth: 0, ...(isMobile ? { display: mobilePanel === 'record' ? 'flex' : 'none', flex: 1 } : { display: 'flex', flex: 1 }) }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '10px', color: '#1f2937' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}>RECORDS SEARCH</div>
            <div style={{ fontSize: '11px' }}>Enter a name, SSN, or plate to begin a search</div>
          </div>
        ) : (
          <>
            {/* Record header */}
            <div style={{ background: '#0d1117', borderBottom: '1px solid #141720', padding: '8px 14px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1a1e2c', border: '1px solid #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>👤</span>
                </div>
                <div>
                  <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '16px', letterSpacing: '0.3px', fontFamily: 'Ubuntu, sans-serif' }}>
                    {selected.firstName} {selected.lastName}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '1px' }}>
                    <span style={{ color: '#374151', fontSize: '11px' }}>DOB: <span style={{ color: '#9ca3af' }}>{selected.dob}</span></span>
                    <span style={{ color: '#374151', fontSize: '11px' }}>SSN: <span style={{ color: '#9ca3af' }}>{selected.ssn}</span></span>
                  </div>
                </div>
                {activeWarrants.length > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#450a0a', color: '#f87171', border: '1px solid #991b1b', borderRadius: '2px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                    WANTED — {activeWarrants.length} WARRANT{activeWarrants.length > 1 ? 'S' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Record tabs */}
            <div className="tab-scroll" style={{ background: '#090b10', borderBottom: '1px solid #141720', display: 'flex', flexShrink: 0 }}>
              {RECORD_TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setRecordTab(t)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: recordTab === t ? '2px solid #1d4ed8' : '2px solid transparent',
                    color: recordTab === t ? '#93c5fd' : '#374151',
                    padding: '7px 12px',
                    fontSize: '11px',
                    fontWeight: recordTab === t ? 700 : 500,
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>

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
                <div style={{ color: '#1f2937', textAlign: 'center', paddingTop: '40px', fontSize: '12px' }}>
                  {recordTab} data not available in demo
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── RIGHT: Location + Activity ── */}
      <div style={{
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#09090f',
        ...(isMobile ? {
          display: mobilePanel === 'activity' ? 'flex' : 'none',
          flex: 1,
        } : {
          display: 'flex',
          width: '320px',
          flexShrink: 0,
          borderLeft: '1px solid #141720',
        }),
      }}>
        {/* Map placeholder */}
        <PanelHead title="LOCATION" />
        <div style={{
          height: '200px',
          background: '#0b0f18',
          borderBottom: '1px solid #141720',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Fake map grid */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${i * 14}%`, height: '1px', background: '#1d4ed8' }} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${i * 11}%`, width: '1px', background: '#1d4ed8' }} />
            ))}
          </div>
          {selected?.address ? (
            <div style={{ textAlign: 'center', zIndex: 1 }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', border: '2px solid #fff', margin: '0 auto 6px', boxShadow: '0 0 8px #3b82f6' }} />
              <div style={{ color: '#9ca3af', fontSize: '10px', fontFamily: MONO }}>{selected.address}</div>
            </div>
          ) : (
            <span style={{ color: '#1f2937', fontSize: '11px' }}>No location data</span>
          )}
        </div>

        {/* Recent activity */}
        <PanelHead title="RECENT ACTIVITY" />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {civHistory.length === 0 && civWarrants.length === 0 ? (
            <div style={{ padding: '12px 10px', color: '#1f2937', fontSize: '11px' }}>No recent activity on record.</div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Top 3-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>

        {/* Personal Information */}
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

        {/* Address */}
        <FieldCard title="ADDRESS(ES)">
          <div style={{ color: '#374151', fontSize: '10px', letterSpacing: '0.5px', marginBottom: '4px' }}>Primary Address</div>
          <div style={{ color: '#d1d5db', fontSize: '12px', lineHeight: 1.6 }}>{civ.address || 'N/A'}</div>
          {civ.phone && (
            <>
              <div style={{ borderTop: '1px solid #141720', marginTop: '10px', paddingTop: '8px', color: '#374151', fontSize: '10px', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Phone
              </div>
              <div style={{ color: '#d1d5db', fontSize: '12px' }}>{civ.phone}</div>
            </>
          )}
        </FieldCard>

        {/* Additional Information */}
        <FieldCard title="ADDITIONAL INFORMATION">
          <InfoRow label="Citizenship"   value="United States" />
          <InfoRow label="Occupation"    value="Unknown" />
          <InfoRow label="Employer"      value="N/A" />
          <InfoRow label="DL Class"      value={civ.dlClass || 'C'} />
          {civ.flags?.length > 0 && (
            <div style={{ marginTop: '6px' }}>
              <div style={{ color: '#374151', fontSize: '10px', marginBottom: '4px' }}>Cautions</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                {civ.flags.map(f => (
                  <span key={f} style={{ background: '#450a0a', color: '#f87171', border: '1px solid #991b1b', borderRadius: '2px', fontSize: '9px', padding: '1px 5px', fontWeight: 700 }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </FieldCard>
      </div>

      {/* Photo + Warrants + BOLOs row */}
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: '10px' }}>
        {/* Photo */}
        <FieldCard title="PHOTO">
          <div style={{
            height: '100px', background: '#0d1117', border: '1px solid #1a1e2c',
            borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#374151', fontSize: '28px' }}>👤</span>
          </div>
        </FieldCard>

        {/* Active Warrants */}
        <FieldCard title={`ACTIVE WARRANTS (${activeWarrants.length})`}>
          {activeWarrants.length === 0 ? (
            <div style={{ color: '#374151', fontSize: '11px', padding: '4px 0' }}>None</div>
          ) : (
            activeWarrants.map(w => (
              <div key={w.id} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #141720' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ color: '#93c5fd', fontSize: '11px', fontWeight: 700 }}>WARRANT # {w.id}</span>
                  <span style={{ color: '#374151', fontSize: '10px', marginLeft: 'auto' }}>{w.issuedDate}</span>
                </div>
                <div style={{ color: '#fca5a5', fontSize: '11px' }}>{w.charge}</div>
                <div style={{ color: '#374151', fontSize: '10px', marginTop: '2px' }}>Issued by: {w.issuedBy}</div>
                <span style={{ background: '#450a0a', color: '#f87171', border: '1px solid #991b1b', borderRadius: '2px', fontSize: '9px', padding: '0 5px', fontWeight: 700 }}>
                  FELONY
                </span>
              </div>
            ))
          )}
        </FieldCard>

        {/* BOLOs */}
        <FieldCard title="ACTIVE BOLOs / LOCATIONS (0)">
          <div style={{ color: '#374151', fontSize: '11px', padding: '4px 0' }}>No active BOLOs or lookout notices.</div>
        </FieldCard>
      </div>

      {/* Recent Incidents table */}
      <FieldCard title="RECENT INCIDENTS">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr>
              {['DATE / TIME', 'INCIDENT #', 'TYPE', 'LOCATION', 'DISPOSITION'].map(h => (
                <th key={h} style={{ padding: '5px 8px', textAlign: 'left', color: '#374151', fontSize: '10px', letterSpacing: '0.6px', borderBottom: '1px solid #141720', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {civVehicles.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '10px 8px', color: '#1f2937', textAlign: 'center' }}>No incidents on file</td></tr>
            ) : (
              civVehicles.slice(0, 5).map((v, i) => (
                <tr key={v.id} style={{ background: i % 2 === 0 ? '#0b0d14' : 'transparent' }}>
                  <td style={{ padding: '4px 8px', color: '#374151' }}>—</td>
                  <td style={{ padding: '4px 8px', color: '#93c5fd' }}>{v.plate}</td>
                  <td style={{ padding: '4px 8px', color: '#9ca3af' }}>Vehicle on file</td>
                  <td style={{ padding: '4px 8px', color: '#6b7280' }}>—</td>
                  <td style={{ padding: '4px 8px' }}><StatusBadge status={v.regStatus} /></td>
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
      <div style={{ padding: '12px', background: '#052e16', border: '1px solid #166534', borderRadius: '3px', color: '#4ade80', fontSize: '12px', fontFamily: MONO }}>
        *** SUBJECT RETURNS CLEAR — NO CRIMINAL HISTORY ON FILE ***
      </div>
    );
  }
  return (
    <div className="table-scroll">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ background: '#0d1117' }}>
            {['DATE', 'CASE #', 'CHARGES', 'OFFICER', 'AGENCY', 'DISPOSITION', 'SENTENCE'].map(h => (
              <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#374151', fontSize: '10px', letterSpacing: '0.7px', borderBottom: '1px solid #141720', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {civHistory.map((h, i) => (
            <tr key={h.id} style={{ background: i % 2 === 0 ? '#090b10' : '#0b0d14' }}>
              <td style={{ padding: '5px 10px', color: '#6b7280' }}>{h.date}</td>
              <td style={{ padding: '5px 10px', color: '#93c5fd', fontWeight: 700 }}>{h.caseNumber}</td>
              <td style={{ padding: '5px 10px', color: '#e2e8f0', maxWidth: '200px' }}>{Array.isArray(h.charges) ? h.charges.join(', ') : h.charges}</td>
              <td style={{ padding: '5px 10px', color: '#6b7280' }}>{h.officerBadge}</td>
              <td style={{ padding: '5px 10px', color: '#6b7280' }}>{h.agency}</td>
              <td style={{ padding: '5px 10px' }}><StatusBadge status={h.disposition} /></td>
              <td style={{ padding: '5px 10px', color: '#6b7280' }}>{h.sentence}</td>
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
      <div style={{ padding: '12px', background: '#052e16', border: '1px solid #166534', borderRadius: '3px', color: '#4ade80', fontSize: '12px', fontFamily: MONO }}>
        *** SUBJECT RETURNS CLEAR — NO ACTIVE WARRANTS ***
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {civWarrants.map(w => (
        <div key={w.id} style={{ background: '#0d1117', border: `1px solid ${w.status === 'ACTIVE' ? '#991b1b' : '#1a1e2c'}`, borderRadius: '3px', padding: '12px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ color: '#93c5fd', fontWeight: 700, fontSize: '12px' }}>WARRANT #{w.id}</span>
            <StatusBadge status={w.status} />
            <span style={{ marginLeft: 'auto', color: '#374151', fontSize: '11px' }}>{w.issuedDate}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
            <InfoRow label="Type"     value={w.type} />
            <InfoRow label="Charge"   value={w.charge} valueColor="#fca5a5" />
            <InfoRow label="Issued By" value={w.issuedBy} />
          </div>
          {w.notes && <div style={{ marginTop: '6px', color: '#4b5563', fontSize: '11px' }}>{w.notes}</div>}
        </div>
      ))}
    </div>
  );
}

function VehiclesTab({ civVehicles }) {
  if (civVehicles.length === 0) {
    return <div style={{ color: '#1f2937', fontSize: '12px' }}>No vehicles registered to this subject.</div>;
  }
  return (
    <div className="table-scroll">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ background: '#0d1117' }}>
            {['PLATE', 'YEAR', 'MAKE', 'MODEL', 'COLOR', 'REG STATUS', 'STOLEN', 'FLAGS'].map(h => (
              <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#374151', fontSize: '10px', letterSpacing: '0.7px', borderBottom: '1px solid #141720', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {civVehicles.map((v, i) => (
            <tr key={v.id} style={{ background: i % 2 === 0 ? '#090b10' : '#0b0d14' }}>
              <td style={{ padding: '5px 10px', color: '#93c5fd', fontWeight: 700 }}>{v.plate}</td>
              <td style={{ padding: '5px 10px', color: '#6b7280' }}>{v.year}</td>
              <td style={{ padding: '5px 10px', color: '#9ca3af' }}>{v.make}</td>
              <td style={{ padding: '5px 10px', color: '#9ca3af' }}>{v.model}</td>
              <td style={{ padding: '5px 10px', color: '#9ca3af' }}>{v.color}</td>
              <td style={{ padding: '5px 10px' }}><StatusBadge status={v.regStatus} /></td>
              <td style={{ padding: '5px 10px' }}><StatusBadge status={v.stolen ? 'ACTIVE' : 'VALID'} /></td>
              <td style={{ padding: '5px 10px', color: '#374151' }}>{v.flags?.join(', ') || '—'}</td>
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
    <div style={{
      padding: '5px 10px',
      background: '#0d1117',
      borderBottom: '1px solid #141720',
      color: '#374151',
      fontSize: '10px',
      letterSpacing: '1.5px',
      textTransform: 'uppercase',
      fontWeight: 700,
      flexShrink: 0,
    }}>
      {title}
    </div>
  );
}

function FieldCard({ title, children }) {
  return (
    <div style={{ background: '#0d1117', border: '1px solid #141720', borderRadius: '2px', overflow: 'hidden' }}>
      <div style={{ padding: '4px 8px', background: '#0b0f18', borderBottom: '1px solid #141720', color: '#374151', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
        {title}
      </div>
      <div style={{ padding: '8px 8px' }}>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '3px', fontSize: '11px' }}>
      <span style={{ color: '#374151', minWidth: '100px', flexShrink: 0 }}>{label}</span>
      <span style={{ color: valueColor || '#d1d5db' }}>{value || 'N/A'}</span>
    </div>
  );
}

function ActivityRow({ time, label, detail, color }) {
  return (
    <div style={{ padding: '6px 10px', borderBottom: '1px solid #141720', display: 'flex', gap: '8px', alignItems: 'baseline' }}>
      <span style={{ color: '#1f2937', fontSize: '10px', flexShrink: 0, fontFamily: MONO }}>{time}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ color, fontSize: '11px', fontWeight: 700 }}>{label}</div>
        <div style={{ color: '#374151', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{detail}</div>
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
