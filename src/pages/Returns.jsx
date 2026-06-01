import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { CivilianTerminal, VehicleTerminal } from './MDT';
import { useResponsive } from '../hooks/useResponsive';

export default function Returns() {
  const { state } = useCAD();
  const { civilians, vehicles, warrants } = state;
  const [query, setQuery] = useState('');
  const [type, setType] = useState('plate');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([
    { time: '14:18', query: 'Plate: SUS-1109', result: 'OWNER WANTED' },
    { time: '14:02', query: 'Name: Darnell Washington', result: 'ACTIVE WARRANT' },
    { time: '13:45', query: 'Plate: ARC-1204', result: 'CLEAR' },
  ]);

  const runQuery = () => {
    const q = query.trim().toUpperCase();
    if (!q) return;
    let civ = null, veh = null, status = 'CLEAR';

    if (type === 'plate') {
      veh = vehicles.find(v => v.plate.toUpperCase().replace(/-/g,'').includes(q.replace(/-/g,'')));
      if (veh) {
        civ = civilians.find(c => c.id === veh.ownerId);
        const hasWarrant = warrants.some(w => w.civilianId === veh.ownerId && w.status === 'ACTIVE');
        status = hasWarrant ? 'OWNER WANTED' : veh.regStatus !== 'VALID' ? 'REG ISSUE' : 'CLEAR';
      }
    } else {
      civ = civilians.find(c => `${c.firstName} ${c.lastName}`.toUpperCase().includes(q) || c.ssn.replace(/-/g,'').includes(q.replace(/-/g,'')));
      if (civ) {
        const hasWarrant = warrants.some(w => w.civilianId === civ.id && w.status === 'ACTIVE');
        status = hasWarrant ? 'ACTIVE WARRANT' : 'CLEAR';
      }
    }

    setResult({ civ, veh });
    setHistory(h => [{ time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}), query: `${type === 'plate' ? 'Plate' : 'Name/SSN'}: ${query}`, result: status }, ...h.slice(0, 9)]);
  };

  const { isMobile } = useResponsive();

  return (
    <div style={{ padding: '14px', fontFamily: 'Ubuntu Mono, monospace', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 260px', gap: '14px', maxWidth: '1100px' }}>
      <div>
        {/* Terminal header */}
        <div style={{ background: '#0b0d14', border: '1px solid #1e2533', borderBottom: 'none', padding: '7px 14px', color: '#3b82f6', fontSize: '11px', letterSpacing: '2px', fontWeight: 700 }}>
          STATE OF FLORIDA &bull; NCIC / DMV QUERY TERMINAL &bull; OPERATOR: {state.currentUser?.name?.toUpperCase()}
        </div>
        <div style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            {[['plate','PLATE QUERY'],['name','NAME / SSN QUERY']].map(([v,l]) => (
              <button key={v} onClick={() => setType(v)} style={{ background: type === v ? '#0f172a' : 'transparent', border: `1px solid ${type === v ? '#3b82f6' : '#1f2937'}`, color: type === v ? '#3b82f6' : '#4b5563', padding: '5px 14px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', letterSpacing: '1px', fontWeight: 600 }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, fontFamily: 'Ubuntu Mono, monospace', color: '#22c55e', fontSize: '14px', background: '#090b10', border: '1px solid #166534', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#3b82f6' }}>{'>'}</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runQuery()}
                placeholder={type === 'plate' ? 'Enter plate (e.g. ABC-1234)...' : 'Enter name or SSN...'}
                style={{ background: 'transparent', border: 'none', color: '#22c55e', flex: 1, fontSize: '14px', fontFamily: 'Ubuntu Mono, monospace', outline: 'none' }}
              />
            </div>
            <button onClick={runQuery} style={{ background: '#052e16', border: '1px solid #166534', color: '#22c55e', padding: '8px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', letterSpacing: '1px' }}>
              SUBMIT
            </button>
          </div>
        </div>

        {result === null && (
          <div style={{ color: '#374151', fontSize: '14px', textAlign: 'center', padding: '40px' }}>
            Run a plate or name query to retrieve records.
          </div>
        )}

        {result && !result.civ && !result.veh && (
          <div style={{ background: '#090b10', border: '1px solid #991b1b', borderLeft: '3px solid #ef4444', padding: '14px', fontFamily: 'Ubuntu Mono, monospace', color: '#ef4444', fontSize: '14px' }}>
            *** NO RECORDS FOUND FOR QUERY: &quot;{query}&quot; ***<br />
            <span style={{ color: '#374151', fontSize: '11px' }}>Query returned no matching records in state database.</span>
          </div>
        )}

        {result?.civ && <CivilianTerminal civ={result.civ} />}
        {result?.veh && <VehicleTerminal veh={result.veh} civ={result.veh ? civilians.find(c => c.id === result.veh.ownerId) : null} />}
      </div>

      {/* History panel */}
      <div>
        <div style={{ background: '#0b0d14', border: '1px solid #1e2533', borderBottom: 'none', padding: '8px 12px', color: '#6b7280', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px' }}>
          QUERY HISTORY
        </div>
        <div style={{ border: '1px solid #1e2533' }}>
          {history.map((h, i) => (
            <div key={i} style={{ padding: '8px 12px', borderBottom: '1px solid #1f2937', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#374151', fontSize: '11px' }}>{h.time}</span>
                <span style={{ color: h.result === 'CLEAR' ? '#22c55e' : '#ef4444', fontSize: '11px', fontWeight: 700 }}>{h.result}</span>
              </div>
              <span style={{ color: '#4b5563', fontSize: '11px' }}>{h.query}</span>
            </div>
          ))}
          {history.length === 0 && <div style={{ padding: '16px 12px', color: '#374151', fontSize: '13px' }}>No queries yet.</div>}
        </div>
      </div>
    </div>
  );
}
