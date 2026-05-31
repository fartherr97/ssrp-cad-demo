import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';
import { CivilianTerminal, VehicleTerminal } from './MDT';

export default function SearchPage() {
  const { state } = useCAD();
  const { civilians, vehicles, warrants, criminalHistory } = state;
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [results, setResults] = useState(null);

  const handleSearch = () => {
    const q = query.trim().toUpperCase();
    if (!q) return;

    let civResult = null;
    let vehResult = null;

    if (searchType === 'name') {
      civResult = civilians.find(c => `${c.firstName} ${c.lastName}`.toUpperCase().includes(q));
    } else if (searchType === 'ssn') {
      civResult = civilians.find(c => c.ssn.replace(/-/g, '').includes(q.replace(/-/g, '')));
    } else if (searchType === 'plate') {
      vehResult = vehicles.find(v => v.plate.toUpperCase().includes(q));
      if (vehResult) civResult = civilians.find(c => c.id === vehResult.ownerId);
    }

    const civWarrants = civResult ? warrants.filter(w => w.civilianId === civResult.id) : [];
    const civHistory = civResult ? criminalHistory.filter(h => h.civilianId === civResult.id) : [];
    const civVehicles = civResult ? vehicles.filter(v => civResult.vehicles.includes(v.id)) : [];

    setResults({ civResult, vehResult, civWarrants, civHistory, civVehicles });
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'Ubuntu Mono, monospace', maxWidth: '1000px' }}>
      <div style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 700, letterSpacing: '1px', marginBottom: '20px' }}>
        RECORDS SEARCH
      </div>

      {/* Search bar */}
      <div style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '6px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          {[['name','By Name'],['plate','By Plate'],['ssn','By SSN']].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setSearchType(v)}
              style={{ background: searchType === v ? '#1e4080' : 'transparent', border: `1px solid ${searchType === v ? '#4a9eff' : '#1e3060'}`, borderRadius: '4px', color: searchType === v ? '#4a9eff' : '#64748b', padding: '5px 14px', fontSize: '14px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}
            >
              {l}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={searchType === 'name' ? 'Enter first or last name...' : searchType === 'plate' ? 'Enter plate number...' : 'Enter SSN...'}
            style={{ flex: 1, background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', color: '#e2e8f0', padding: '10px 12px', fontSize: '15px', fontFamily: 'Ubuntu Mono, monospace' }}
          />
          <button onClick={handleSearch} style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '10px 20px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', letterSpacing: '1px' }}>
            SEARCH
          </button>
        </div>
      </div>

      {results && (
        <div>
          {!results.civResult && !results.vehResult && (
            <div style={{ color: '#ef4444', background: '#1a0505', border: '1px solid #ef4444', borderRadius: '4px', padding: '12px', fontSize: '15px' }}>
              *** NO RECORDS FOUND FOR QUERY: "{query}" ***
            </div>
          )}

          {results.civResult && <CivilianTerminal civ={results.civResult} />}
          {results.vehResult && <VehicleTerminal veh={results.vehResult} civ={civilians.find(c => c.id === results.vehResult.ownerId)} />}

          {results.civResult && results.civVehicles.length > 0 && (
            <Section title="REGISTERED VEHICLES">
              <div className="table-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#0a1a35' }}>
                    {['Plate','Year','Make','Model','Color','Registration','Stolen'].map(h => (
                      <th key={h} style={{ padding: '7px 10px', textAlign: 'left', color: '#7a9ab8', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #1e4080' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.civVehicles.map((v, i) => (
                    <tr key={v.id} style={{ background: i % 2 === 0 ? '#080f1e' : '#0a1525' }}>
                      <td style={{ padding: '6px 10px', color: '#60a5fa', fontWeight: 700 }}>{v.plate}</td>
                      <td style={{ padding: '6px 10px', color: '#94a3b8' }}>{v.year}</td>
                      <td style={{ padding: '6px 10px', color: '#94a3b8' }}>{v.make}</td>
                      <td style={{ padding: '6px 10px', color: '#94a3b8' }}>{v.model}</td>
                      <td style={{ padding: '6px 10px', color: '#94a3b8' }}>{v.color}</td>
                      <td style={{ padding: '6px 10px' }}><StatusBadge status={v.regStatus} /></td>
                      <td style={{ padding: '6px 10px' }}><StatusBadge status={v.stolen ? 'ACTIVE' : 'VALID'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </Section>
          )}

          {results.civResult && results.civWarrants.length > 0 && (
            <Section title="ACTIVE WARRANTS">
              {results.civWarrants.map(w => (
                <div key={w.id} style={{ background: '#1a0505', border: '1px solid #ef4444', borderRadius: '4px', padding: '12px', marginBottom: '8px', fontSize: '14px' }}>
                  <div style={{ color: '#ef4444', fontWeight: 700, marginBottom: '6px' }}>⚠ {w.type} — {w.status}</div>
                  <div style={{ color: '#fca5a5' }}>Charge: {w.charge}</div>
                  <div style={{ color: '#94a3b8', marginTop: '4px' }}>Issued by: {w.issuedBy} on {w.issuedDate}</div>
                  {w.notes && <div style={{ color: '#64748b', marginTop: '4px', fontSize: '12px' }}>{w.notes}</div>}
                </div>
              ))}
            </Section>
          )}

          {results.civResult && results.civHistory.length > 0 && (
            <Section title="CRIMINAL HISTORY">
              <div className="table-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#0a1a35' }}>
                    {['Date','Case #','Charges','Officer','Agency','Disposition','Sentence'].map(h => (
                      <th key={h} style={{ padding: '7px 10px', textAlign: 'left', color: '#7a9ab8', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #1e4080' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.civHistory.map((h, i) => (
                    <tr key={h.id} style={{ background: i % 2 === 0 ? '#080f1e' : '#0a1525' }}>
                      <td style={{ padding: '6px 10px', color: '#94a3b8' }}>{h.date}</td>
                      <td style={{ padding: '6px 10px', color: '#60a5fa' }}>{h.caseNumber}</td>
                      <td style={{ padding: '6px 10px', color: '#e2e8f0' }}>{h.charges.join(', ')}</td>
                      <td style={{ padding: '6px 10px', color: '#94a3b8' }}>{h.officerBadge}</td>
                      <td style={{ padding: '6px 10px', color: '#94a3b8' }}>{h.agency}</td>
                      <td style={{ padding: '6px 10px' }}><StatusBadge status={h.disposition} /></td>
                      <td style={{ padding: '6px 10px', color: '#94a3b8' }}>{h.sentence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </Section>
          )}

          {results.civResult && results.civWarrants.length === 0 && results.civHistory.length === 0 && (
            <div style={{ color: '#22c55e', background: '#051a05', border: '1px solid #22c55e', borderRadius: '4px', padding: '12px', fontSize: '15px' }}>
              *** SUBJECT RETURNS CLEAR — NO WARRANTS OR CRIMINAL HISTORY ***
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ color: '#e2a84b', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px', borderBottom: '1px solid #1e3060', paddingBottom: '6px' }}>
        {title}
      </div>
      {children}
    </div>
  );
}
