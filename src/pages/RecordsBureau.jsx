import { useState } from 'react';
import { useCAD } from '../store/cadStore';

function FlagBadge({ flag }) {
  const map = { WARRANT: 'badge-red', CAUTION: 'badge-orange', VIOLENT: 'badge-fire' };
  return <span className={`n-badge ${map[flag] || 'badge-gray'}`}>{flag}</span>;
}

function DetailRow({ label, value, mono }) {
  if (!value && value !== 0) return null;
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className={mono ? 'detail-value-mono' : 'detail-value'}>{value}</span>
    </div>
  );
}

export default function RecordsBureau() {
  const { state, dispatch } = useCAD();
  const { civilians, vehicles, warrants, criminalHistory, officers, calls, currentUser } = state;

  const [searchType, setSearchType] = useState('PERSON');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('SUMMARY');
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
    setTab('SUMMARY');
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

  const PERSON_TABS = ['SUMMARY', 'CRIMINAL HISTORY', 'WARRANTS', 'VEHICLES', 'CONTACTS'];
  const VEH_TABS = ['SUMMARY', 'OWNER', 'FLAGS'];

  const activeTabs = selCiv ? PERSON_TABS : selVeh ? VEH_TABS : ['SUMMARY'];

  return (
    <div className="n-page" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 0, flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* LEFT: Search Panel */}
        <div className="n-panel" style={{ borderRight: 'none', borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderBottom: 'none' }}>
          <div className="n-panel-header">
            <div className="n-panel-title">Records Query</div>
          </div>

          {/* Search type selector */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--n-border)', display: 'flex', gap: 4, flexShrink: 0 }}>
            {SEARCH_TYPES.map(t => (
              <button key={t}
                className={`n-btn n-btn-xs ${searchType === t ? 'n-btn-primary' : 'n-btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => { setSearchType(t); setResults([]); setSelected(null); setSearched(false); setQuery(''); }}>
                {t}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--n-border)', flexShrink: 0 }}>
            <div className="n-field" style={{ marginBottom: 6 }}>
              <label className="n-label">
                {searchType === 'PERSON' ? 'Name / SSN / DL#' :
                 searchType === 'VEHICLE' ? 'Plate / Make + Model' : 'Name / Charge'}
              </label>
              <input
                className="n-input"
                placeholder={
                  searchType === 'PERSON' ? 'e.g. Washington or 618-77-9901' :
                  searchType === 'VEHICLE' ? 'e.g. SUS-1109 or Dodge Charger' : 'e.g. Washington or possession'
                }
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
              />
            </div>
            <button className="n-btn n-btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={doSearch}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M6.5 11a4.5 4.5 0 110-9 4.5 4.5 0 010 9zm4.2-.8l3.5 3.5-1.1 1.1-3.5-3.5a5.5 5.5 0 111.1-1.1z"/></svg>
              Run Query
            </button>
          </div>

          {/* Results */}
          <div className="n-panel-body scroll-y">
            {!searched && (
              <div style={{ padding: '16px 12px', color: 'var(--n-text-muted)', fontSize: 11, lineHeight: 1.6 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 8, color: 'var(--n-text-muted)' }}>
                  Query Options
                </div>
                <ul style={{ paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <li>Full or partial name search</li>
                  <li>SSN or driver license number</li>
                  <li>Vehicle plate or description</li>
                  <li>Warrant by name or charge</li>
                </ul>
              </div>
            )}
            {searched && results.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--n-text-muted)', fontSize: 11 }}>
                No records found
              </div>
            )}
            {results.map((r) => {
              const isSelected = selected === r.id;
              if (searchType === 'PERSON') {
                const civ = r;
                return (
                  <div key={civ.id}
                    className="n-card n-card-hover"
                    style={{ margin: '4px 8px', padding: '7px 9px', borderRadius: 3, cursor: 'pointer',
                      border: isSelected ? '1px solid var(--n-border-accent)' : undefined,
                      background: isSelected ? 'var(--n-bg-selected)' : undefined }}
                    onClick={() => { setSelected(civ.id); setTab('SUMMARY'); }}>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{civ.firstName} {civ.lastName}</div>
                    <div className="n-data" style={{ fontSize: 10 }}>DOB: {civ.dob} · {civ.gender}</div>
                    <div style={{ display: 'flex', gap: 3, marginTop: 3, flexWrap: 'wrap' }}>
                      {civ.flags?.map(f => <FlagBadge key={f} flag={f} />)}
                      {civ.dlStatus === 'SUSPENDED' && <span className="n-badge badge-orange">DL SUSP</span>}
                    </div>
                  </div>
                );
              } else if (searchType === 'VEHICLE') {
                return (
                  <div key={r.id}
                    className="n-card n-card-hover"
                    style={{ margin: '4px 8px', padding: '7px 9px', borderRadius: 3, cursor: 'pointer',
                      border: isSelected ? '1px solid var(--n-border-accent)' : undefined,
                      background: isSelected ? 'var(--n-bg-selected)' : undefined }}
                    onClick={() => { setSelected(r.id); setTab('SUMMARY'); }}>
                    <div style={{ fontWeight: 600, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--n-text-data)' }}>{r.plate}</div>
                    <div style={{ fontSize: 11, color: 'var(--n-text)' }}>{r.year} {r.make} {r.model} · {r.color}</div>
                    <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
                      {r.stolen && <span className="n-badge badge-red">STOLEN</span>}
                      {r.regStatus !== 'VALID' && <span className="n-badge badge-orange">REG {r.regStatus}</span>}
                      {r.flags?.map(f => <span key={f} className="n-badge badge-orange">{f}</span>)}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={r.id}
                    className="n-card n-card-hover"
                    style={{ margin: '4px 8px', padding: '7px 9px', borderRadius: 3, cursor: 'pointer',
                      border: isSelected ? '1px solid var(--n-border-accent)' : undefined,
                      background: isSelected ? 'var(--n-bg-selected)' : undefined }}
                    onClick={() => { setSelected(r.id); setTab('SUMMARY'); }}>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{r.civilianName}</div>
                    <div style={{ fontSize: 11, color: 'var(--n-text-dim)' }}>{r.charge}</div>
                    <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
                      <span className={`n-badge ${r.status === 'ACTIVE' ? 'badge-red' : 'badge-green'}`}>{r.status}</span>
                      <span className="n-badge badge-gray">{r.type}</span>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>

        {/* RIGHT: Record Detail */}
        <div className="n-panel" style={{ borderRadius: 0, borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--n-text-muted)', padding: 24 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
              </svg>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--n-text-dim)', marginBottom: 4 }}>No record selected</div>
                <div style={{ fontSize: 11, color: 'var(--n-text-muted)' }}>Run a query and select a result to view the full record</div>
              </div>
            </div>
          ) : selCiv ? (
            <>
              {/* Person header */}
              <div style={{
                padding: '10px 14px', background: 'var(--n-bg-card)',
                borderBottom: '1px solid var(--n-border)', flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--n-text)' }}>
                      {selCiv.firstName} {selCiv.lastName}
                    </div>
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--n-text-dim)', marginTop: 2 }}>
                      DOB: {selCiv.dob} · {selCiv.gender} · {selCiv.ethnicity} · {selCiv.height} · {selCiv.weight}
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                      {selCiv.flags?.map(f => <FlagBadge key={f} flag={f} />)}
                      {selCiv.dlStatus === 'SUSPENDED' && <span className="n-badge badge-orange">DL SUSPENDED</span>}
                      {civWarrants.some(w => w.status === 'ACTIVE') && <span className="n-badge badge-red">ACTIVE WARRANT</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="n-data" style={{ fontSize: 12 }}>ID: {String(selCiv.id).padStart(6,'0')}</div>
                    <div style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                      HAIR: {selCiv.hair} · EYES: {selCiv.eyes}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="n-tabs">
                {PERSON_TABS.map(t => (
                  <button key={t} className={`n-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                    {t}
                    {t === 'CRIMINAL HISTORY' && civHistory.length > 0 && (
                      <span style={{ marginLeft: 4, fontSize: 9, background: 'var(--pr1-bg)', color: 'var(--pr1-text)', borderRadius: 2, padding: '0 4px', fontFamily: 'var(--font-mono)' }}>{civHistory.length}</span>
                    )}
                    {t === 'WARRANTS' && civWarrants.filter(w => w.status === 'ACTIVE').length > 0 && (
                      <span style={{ marginLeft: 4, fontSize: 9, background: 'var(--pr1-bg)', color: 'var(--pr1-text)', borderRadius: 2, padding: '0 4px', fontFamily: 'var(--font-mono)' }}>
                        {civWarrants.filter(w => w.status === 'ACTIVE').length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="n-panel-body scroll-y" style={{ padding: 14 }}>
                {tab === 'SUMMARY' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="n-card">
                      <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Personal Information</div>
                      <DetailRow label="Full Name" value={`${selCiv.firstName} ${selCiv.lastName}`} />
                      <DetailRow label="Date of Birth" value={selCiv.dob} mono />
                      <DetailRow label="Gender" value={selCiv.gender} />
                      <DetailRow label="Ethnicity" value={selCiv.ethnicity} />
                      <DetailRow label="Height" value={selCiv.height} />
                      <DetailRow label="Weight" value={selCiv.weight} />
                      <DetailRow label="Hair Color" value={selCiv.hair} />
                      <DetailRow label="Eye Color" value={selCiv.eyes} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div className="n-card">
                        <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Identification</div>
                        <DetailRow label="SSN" value={selCiv.ssn} mono />
                        <DetailRow label="Phone" value={selCiv.phone} mono />
                        <DetailRow label="Address" value={selCiv.address} />
                      </div>
                      <div className="n-card">
                        <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Driver License</div>
                        <DetailRow label="DL Number" value={selCiv.dlNumber} mono />
                        <DetailRow label="Class" value={selCiv.dlClass} />
                        <DetailRow label="Status" value={selCiv.dlStatus} />
                        <DetailRow label="Expiry" value={selCiv.dlExpiry} mono />
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'CRIMINAL HISTORY' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {civHistory.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 24, color: 'var(--n-text-muted)', fontSize: 11 }}>No criminal history on file</div>
                    ) : civHistory.map(h => (
                      <div key={h.id} className="n-card">
                        <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                          <span className="n-data" style={{ fontSize: 11 }}>{h.caseNumber}</span>
                          <span className={`n-badge ${h.disposition === 'Arrested' ? 'badge-red' : 'badge-orange'}`}>{h.disposition}</span>
                          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{h.date}</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                          {h.charges?.map((c, i) => (
                            <span key={i} className="n-badge badge-gray">{c}</span>
                          ))}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--n-text-dim)', lineHeight: 1.5 }}>
                          <span style={{ color: 'var(--n-text-muted)' }}>Officer:</span> {h.officerBadge} · <span style={{ color: 'var(--n-text-muted)' }}>Agency:</span> {h.agency}
                          {h.sentence && <> · <span style={{ color: 'var(--n-text-muted)' }}>Sentence:</span> {h.sentence}</>}
                        </div>
                        {h.notes && <div style={{ fontSize: 10, color: 'var(--n-text-dim)', marginTop: 4, fontStyle: 'italic' }}>{h.notes}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'WARRANTS' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {civWarrants.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 24, color: 'var(--n-text-muted)', fontSize: 11 }}>No warrants on file</div>
                    ) : civWarrants.map(w => (
                      <div key={w.id} className="n-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span className={`n-badge ${w.status === 'ACTIVE' ? 'badge-red' : 'badge-green'}`}>{w.status}</span>
                          <span className="n-badge badge-gray">{w.type}</span>
                          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{w.issuedDate}</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>{w.charge}</div>
                        <div style={{ fontSize: 10, color: 'var(--n-text-dim)' }}>Issued by: {w.issuedBy}</div>
                        {w.notes && <div style={{ fontSize: 10, color: 'var(--n-text-dim)', marginTop: 4 }}>{w.notes}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'VEHICLES' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {civVehicles.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 24, color: 'var(--n-text-muted)', fontSize: 11 }}>No vehicles on file</div>
                    ) : civVehicles.map(v => (
                      <div key={v.id} className="n-card">
                        <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                          <span className="n-data" style={{ fontSize: 13, fontWeight: 700 }}>{v.plate}</span>
                          <span className={`n-badge ${v.regStatus === 'VALID' ? 'badge-green' : 'badge-red'}`}>{v.regStatus}</span>
                          {v.stolen && <span className="n-badge badge-red">STOLEN</span>}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--n-text)' }}>{v.year} {v.make} {v.model} · {v.color}</div>
                        <div style={{ fontSize: 10, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                          Reg. Expires: {v.regExpiry}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'CONTACTS' && (
                  <div className="n-card">
                    <DetailRow label="Phone" value={selCiv.phone} mono />
                    <DetailRow label="Address" value={selCiv.address} />
                    <DetailRow label="SSN" value={selCiv.ssn} mono />
                  </div>
                )}
              </div>
            </>
          ) : selVeh ? (
            <>
              <div style={{ padding: '10px 14px', background: 'var(--n-bg-card)', borderBottom: '1px solid var(--n-border)', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--n-text-data)', marginBottom: 2 }}>{selVeh.plate}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--n-text)' }}>{selVeh.year} {selVeh.make} {selVeh.model}</div>
                    <div style={{ fontSize: 11, color: 'var(--n-text-dim)' }}>{selVeh.color}</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
                      {selVeh.stolen && <span className="n-badge badge-red">STOLEN</span>}
                      {selVeh.regStatus !== 'VALID' && <span className="n-badge badge-orange">REG {selVeh.regStatus}</span>}
                      {vehWarrants.some(w => w.status === 'ACTIVE') && <span className="n-badge badge-red">OWNER WARRANT</span>}
                      {selVeh.flags?.map(f => <span key={f} className="n-badge badge-orange">{f}</span>)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="n-tabs">
                {VEH_TABS.map(t => <button key={t} className={`n-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
              </div>
              <div className="n-panel-body scroll-y" style={{ padding: 14 }}>
                {tab === 'SUMMARY' && (
                  <div className="n-card">
                    <DetailRow label="Plate" value={selVeh.plate} mono />
                    <DetailRow label="Year" value={selVeh.year} />
                    <DetailRow label="Make" value={selVeh.make} />
                    <DetailRow label="Model" value={selVeh.model} />
                    <DetailRow label="Color" value={selVeh.color} />
                    <DetailRow label="Registration" value={selVeh.regStatus} />
                    <DetailRow label="Reg. Expiry" value={selVeh.regExpiry} mono />
                    <DetailRow label="Stolen" value={selVeh.stolen ? 'YES' : 'No'} />
                  </div>
                )}
                {tab === 'OWNER' && vehOwner && (
                  <div className="n-card">
                    <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Registered Owner</div>
                    <DetailRow label="Name" value={`${vehOwner.firstName} ${vehOwner.lastName}`} />
                    <DetailRow label="DOB" value={vehOwner.dob} mono />
                    <DetailRow label="Address" value={vehOwner.address} />
                    <DetailRow label="Phone" value={vehOwner.phone} mono />
                    <DetailRow label="DL Status" value={vehOwner.dlStatus} />
                    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                      {vehOwner.flags?.map(f => <FlagBadge key={f} flag={f} />)}
                    </div>
                  </div>
                )}
                {tab === 'FLAGS' && (
                  <div className="n-card">
                    {selVeh.flags?.length === 0 && !selVeh.stolen ? (
                      <div style={{ color: 'var(--n-text-muted)', fontSize: 11 }}>No flags</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {selVeh.stolen && <div className="n-badge badge-red" style={{ display: 'inline-flex', width: 'fit-content' }}>STOLEN VEHICLE</div>}
                        {selVeh.flags?.map(f => <div key={f} className="n-badge badge-orange" style={{ display: 'inline-flex', width: 'fit-content' }}>{f}</div>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : selWarrant ? (
            <div style={{ padding: 20 }}>
              <div className="n-card">
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                  <span className={`n-badge ${selWarrant.status === 'ACTIVE' ? 'badge-red' : 'badge-green'}`} style={{ fontSize: 11 }}>{selWarrant.status}</span>
                  <span className="n-badge badge-gray">{selWarrant.type}</span>
                </div>
                <DetailRow label="Subject" value={selWarrant.civilianName} />
                <DetailRow label="Charge" value={selWarrant.charge} />
                <DetailRow label="Issued By" value={selWarrant.issuedBy} />
                <DetailRow label="Issue Date" value={selWarrant.issuedDate} mono />
                {selWarrant.notes && <DetailRow label="Notes" value={selWarrant.notes} />}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
