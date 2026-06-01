import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { RecordReturn } from '../components/FormDocument';
import {
  BADGE,
  S_RECORD_RETURN, S_RECORD_RETURN_HEADER, S_RECORD_RETURN_BODY,
  S_RECORD_RETURN_SECTION, S_RECORD_RETURN_FLAG, S_RECORD_RETURN_FLAG_WARN,
  xs, btnHoverOn, btnHoverOff, btnActiveOn,
  S_BTN_PRIMARY, S_BTN_SECONDARY,
} from '../constants/styles';

function FlagBadge({ flag }) {
  const map = { WARRANT: BADGE.red, CAUTION: BADGE.orange, VIOLENT: BADGE.fire };
  return <span style={map[flag] || BADGE.gray}>{flag}</span>;
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
    <div style={{ flex: 1, overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div className="mob-two-pane" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 0, flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* ── LEFT: Query panel ─────────────────────────────────────── */}
        <div className={`mob-list-panel${selected ? ' mob-gone' : ''}`} style={{
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          borderRight: '2px solid var(--n-border)', background: 'var(--n-bg-base)',
        }}>
          <div style={{
            padding: '5px 8px', background: 'var(--n-bg-toolbar)',
            borderBottom: '1px solid var(--n-border)', flexShrink: 0,
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--n-text)' }}>
              Records Query
            </span>
          </div>

          {/* Search type */}
          <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--n-border)', display: 'flex', gap: 4, flexShrink: 0 }}>
            {SEARCH_TYPES.map(t => (
              <button key={t}
                style={{ ...xs(searchType === t ? S_BTN_PRIMARY : S_BTN_SECONDARY), flex: 1 }}
                onMouseDown={btnActiveOn}
                onClick={() => { setSearchType(t); setResults([]); setSelected(null); setSearched(false); setQuery(''); }}>
                {t}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--n-border)', flexShrink: 0 }}>
            <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--n-text-muted)', marginBottom: 4, fontWeight: 700 }}>
              {searchType === 'PERSON' ? 'Name / SSN / DL#' :
               searchType === 'VEHICLE' ? 'Plate / Make Model' : 'Subject Name / Charge'}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                style={{ flex: 1, fontSize: 11, background: 'var(--n-bg-input)', border: '1px solid var(--n-border)', borderRadius: 'var(--n-radius-sm)', color: 'var(--n-text)', padding: '6px 9px', outline: 'none', boxSizing: 'border-box' }}
                placeholder={
                  searchType === 'PERSON' ? 'e.g. Washington' :
                  searchType === 'VEHICLE' ? 'e.g. SUS-1109' : 'e.g. possession'
                }
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
              />
              <button
                style={{ ...xs(S_BTN_PRIMARY), flexShrink: 0, padding: '0 8px' }}
                onMouseDown={btnActiveOn}
                onClick={doSearch}>
                RUN
              </button>
            </div>
          </div>

          {/* Results */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {!searched && (
              <div style={{ padding: '12px 10px', color: 'var(--n-text-muted)', fontSize: 10, lineHeight: 1.7 }}>
                <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6, color: 'var(--n-text-muted)' }}>
                  Query Examples
                </div>
                <div>• Full or partial name</div>
                <div>• SSN or DL number</div>
                <div>• Vehicle plate or description</div>
                <div>• Warrant by name or charge</div>
              </div>
            )}
            {searched && results.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--n-text-muted)', fontSize: 11 }}>
                NO RECORDS FOUND
              </div>
            )}
            {results.map((r, idx) => {
              const isSelected = selected === r.id;
              const selStyle = {
                padding: '6px 8px', cursor: 'pointer',
                borderBottom: '1px solid var(--n-border-subtle)',
                borderLeft: isSelected ? '3px solid var(--n-blue)' : '3px solid transparent',
                background: isSelected ? 'var(--n-bg-selected)' : 'transparent',
                transition: 'background var(--t-fast) var(--ease-soft), border-color var(--t-fast) var(--ease-soft)',
                animationDelay: `${idx * 35}ms`,
                animation: 'slideInLeft 0.22s cubic-bezier(0.4,0,0.2,1) both',
              };
              if (searchType === 'PERSON') {
                return (
                  <div key={r.id} style={selStyle} onClick={() => { setSelected(r.id); setTab('RETURN'); }}>
                    <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--n-text)', fontFamily: 'var(--font-mono)' }}>
                      {r.lastName}, {r.firstName}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
                      DOB: {r.dob} · {r.gender}
                    </div>
                    <div style={{ display: 'flex', gap: 3, marginTop: 3, flexWrap: 'wrap' }}>
                      {r.flags?.map(f => <FlagBadge key={f} flag={f} />)}
                      {r.dlStatus === 'SUSPENDED' && <span className={BADGE.orange}>DL SUSP</span>}
                    </div>
                  </div>
                );
              } else if (searchType === 'VEHICLE') {
                return (
                  <div key={r.id} style={selStyle} onClick={() => { setSelected(r.id); setTab('RETURN'); }}>
                    <div style={{ fontWeight: 700, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--n-text-data)' }}>{r.plate}</div>
                    <div style={{ fontSize: 10, color: 'var(--n-text)', marginTop: 1 }}>{r.year} {r.make} {r.model} · {r.color}</div>
                    <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
                      {r.stolen && <span className={BADGE.red}>STOLEN</span>}
                      {r.regStatus !== 'VALID' && <span className={BADGE.orange}>REG {r.regStatus}</span>}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={r.id} style={selStyle} onClick={() => { setSelected(r.id); setTab('RETURN'); }}>
                    <div style={{ fontWeight: 600, fontSize: 11, color: 'var(--n-text)' }}>{r.civilianName}</div>
                    <div style={{ fontSize: 10, color: 'var(--n-text-dim)', marginTop: 1 }}>{r.charge}</div>
                    <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
                      <span style={r.status === 'ACTIVE' ? BADGE.red : BADGE.green}>{r.status}</span>
                      <span className={BADGE.gray}>{r.type}</span>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>

        {/* ── RIGHT: Record detail ──────────────────────────────────── */}
        <div className={`mob-detail-panel${!selected ? ' mob-gone' : ''}`} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#1a1a1a' }}>
          {/* Mobile back button */}
          <button className="mob-back-btn" onClick={() => setSelected(null)}>
            ← Back to Results
          </button>
          {!selected ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 12, color: '#555', padding: 24,
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#777', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  No record selected
                </div>
                <div style={{ fontSize: 10, color: '#555' }}>Run a query and select a result</div>
              </div>
            </div>
          ) : (
            <>
              {/* Tab bar */}
              <div style={{
                display: 'flex', borderBottom: '1px solid #333',
                background: '#111', flexShrink: 0,
              }}>
                {activeTabs.map(t => (
                  <button key={t}
                    onClick={() => setTab(t)}
                    style={{
                      padding: '5px 12px', border: 'none', cursor: 'pointer',
                      fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                      background: tab === t ? '#1a1a1a' : 'transparent',
                      color: tab === t ? '#fff' : '#666',
                      borderBottom: tab === t ? '2px solid #4488ff' : '2px solid transparent',
                      fontFamily: 'var(--font-ui)',
                    }}>
                    {t}
                    {t === 'CRIMINAL HISTORY' && civHistory.length > 0 && (
                      <span style={{ marginLeft: 3, fontSize: 8, background: '#cc0000', color: '#fff', padding: '0 3px' }}>
                        {civHistory.length}
                      </span>
                    )}
                    {t === 'WARRANTS' && civWarrants.filter(w => w.status === 'ACTIVE').length > 0 && (
                      <span style={{ marginLeft: 3, fontSize: 8, background: '#cc0000', color: '#fff', padding: '0 3px' }}>
                        {civWarrants.filter(w => w.status === 'ACTIVE').length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

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
                  <div style={{ width: '100%', maxWidth: 760 }}>
                    {civHistory.length === 0 ? (
                      <div style={{ color: '#666', fontSize: 11, fontFamily: 'Courier New', padding: 16, textAlign: 'center' }}>
                        NO CRIMINAL HISTORY ON FILE
                      </div>
                    ) : civHistory.map(h => (
                      <div key={h.id} style={{ ...S_RECORD_RETURN, marginBottom: 12 }}>
                        <div className={S_RECORD_RETURN_HEADER}>
                          <span>CRIMINAL HISTORY ENTRY — {h.caseNumber}</span>
                          <span style={{ marginLeft: 'auto', fontWeight: 400, fontSize: 12, opacity: 0.85 }}>{h.date}</span>
                        </div>
                        <div style={S_RECORD_RETURN_BODY}>
                          <div style={S_RECORD_RETURN_SECTION}>
                            <span style={{color:'#4f7bb0'}}>*** </span>CASE INFORMATION<span style={{color:'#4f7bb0'}}> ***</span>
                          </div>
                          <div style={{ fontSize: 12.5, lineHeight: 1.75 }}><span style={{ color: '#7e8ea3', fontWeight: 400, marginRight: 7 }}>CASE NUMBER: </span><span style={{ background: 'rgba(58,136,232,0.18)', color: '#dfe9f5', padding: '0 5px', borderRadius: 2 }}>{h.caseNumber}</span></div>
                          <div style={{ fontSize: 12.5, lineHeight: 1.75 }}><span style={{ color: '#7e8ea3', fontWeight: 400, marginRight: 7 }}>DATE: </span><span style={{ background: 'rgba(58,136,232,0.18)', color: '#dfe9f5', padding: '0 5px', borderRadius: 2 }}>{h.date}</span></div>
                          <div style={{ fontSize: 12.5, lineHeight: 1.75 }}><span style={{ color: '#7e8ea3', fontWeight: 400, marginRight: 7 }}>DISPOSITION: </span><span style={{ background: 'rgba(58,136,232,0.18)', color: '#dfe9f5', padding: '0 5px', borderRadius: 2 }}>{h.disposition}</span></div>
                          <div style={{ fontSize: 12.5, lineHeight: 1.75 }}><span style={{ color: '#7e8ea3', fontWeight: 400, marginRight: 7 }}>AGENCY: </span><span style={{ background: 'rgba(58,136,232,0.18)', color: '#dfe9f5', padding: '0 5px', borderRadius: 2 }}>{h.agency}</span></div>
                          <div style={{ fontSize: 12.5, lineHeight: 1.75 }}><span style={{ color: '#7e8ea3', fontWeight: 400, marginRight: 7 }}>OFFICER BADGE: </span><span style={{ background: 'rgba(58,136,232,0.18)', color: '#dfe9f5', padding: '0 5px', borderRadius: 2 }}>{h.officerBadge}</span></div>
                          {h.sentence && <div style={{ fontSize: 12.5, lineHeight: 1.75 }}><span style={{ color: '#7e8ea3', fontWeight: 400, marginRight: 7 }}>SENTENCE: </span><span style={{ background: 'rgba(58,136,232,0.18)', color: '#dfe9f5', padding: '0 5px', borderRadius: 2 }}>{h.sentence}</span></div>}
                          <div style={S_RECORD_RETURN_SECTION}>
                            <span style={{color:'#4f7bb0'}}>*** </span>CHARGES<span style={{color:'#4f7bb0'}}> ***</span>
                          </div>
                          {h.charges?.map((c, i) => (
                            <div key={i} style={{ fontSize: 12.5, lineHeight: 1.75 }}>
                              <span style={{ color: '#7e8ea3', fontWeight: 400, marginRight: 7 }}>CHARGE {i + 1}: </span>
                              <span style={{ background: 'rgba(58,136,232,0.18)', color: '#dfe9f5', padding: '0 5px', borderRadius: 2 }}>{c}</span>
                            </div>
                          ))}
                          {h.notes && (
                            <>
                              <div style={S_RECORD_RETURN_SECTION}>
                                <span style={{color:'#4f7bb0'}}>*** </span>NOTES<span style={{color:'#4f7bb0'}}> ***</span>
                              </div>
                              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono), Courier New', lineHeight: 1.6, color: '#aeb9c8' }}>{h.notes}</div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* WARRANTS */}
                {tab === 'WARRANTS' && selCiv && (
                  <div style={{ width: '100%', maxWidth: 760 }}>
                    {civWarrants.length === 0 ? (
                      <div style={{ color: '#666', fontSize: 11, fontFamily: 'Courier New', padding: 16, textAlign: 'center' }}>
                        NO WARRANTS ON FILE
                      </div>
                    ) : civWarrants.map(w => (
                      <div key={w.id} style={{ marginBottom: 12 }}>
                        <RecordReturn type="WARRANT" data={w} />
                      </div>
                    ))}
                  </div>
                )}

                {/* VEHICLES */}
                {tab === 'VEHICLES' && selCiv && (
                  <div style={{ width: '100%', maxWidth: 760 }}>
                    {civVehicles.length === 0 ? (
                      <div style={{ color: '#666', fontSize: 11, fontFamily: 'Courier New', padding: 16, textAlign: 'center' }}>
                        NO VEHICLES ON FILE
                      </div>
                    ) : civVehicles.map(v => (
                      <div key={v.id} style={{ marginBottom: 12 }}>
                        <RecordReturn type="VEHICLE" data={v} subject={selCiv} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Vehicle FLAGS tab */}
                {tab === 'FLAGS' && selVeh && (
                  <div style={{ ...S_RECORD_RETURN, width: '100%', maxWidth: 760 }}>
                    <div className={S_RECORD_RETURN_HEADER}>
                      <span>VEHICLE FLAGS — {selVeh.plate}</span>
                      <span style={{ marginLeft: 'auto', fontWeight: 400, fontSize: 12, opacity: 0.85 }}>{new Date().toLocaleString()}</span>
                    </div>
                    <div style={S_RECORD_RETURN_BODY}>
                      {!selVeh.stolen && selVeh.flags?.length === 0 && !vehWarrants.some(w => w.status === 'ACTIVE') ? (
                        <div style={{ color: '#666', fontSize: 11 }}>NO FLAGS ON FILE</div>
                      ) : (
                        <>
                          {selVeh.stolen && (
                            <div style={{ marginBottom: 6 }}>
                              <span style={S_RECORD_RETURN_FLAG}>STOLEN VEHICLE</span>
                            </div>
                          )}
                          {vehWarrants.some(w => w.status === 'ACTIVE') && (
                            <div style={{ marginBottom: 6 }}>
                              <span style={S_RECORD_RETURN_FLAG}>OWNER HAS ACTIVE WARRANT</span>
                            </div>
                          )}
                          {selVeh.flags?.map(f => (
                            <div key={f} style={{ marginBottom: 6 }}>
                              <span style={S_RECORD_RETURN_FLAG_WARN}>{f}</span>
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
