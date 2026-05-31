import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { CivilianTerminal, VehicleTerminal } from './MDT';

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

  return (
    <div style={{ padding: '16px', fontFamily: 'Ubuntu Mono, monospace', display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', maxWidth: '1100px' }}>
      <div>
        {/* Terminal header */}
        <div style={{ background: '#040a10', border: '1px solid #1e4080', borderRadius: '4px 4px 0 0', padding: '8px 14px', color: '#4a9eff', fontSize: '12px', letterSpacing: '2px' }}>
          STATE OF FLORIDA — NCIC/DMV QUERY TERMINAL — OFFICER: {state.currentUser?.name?.toUpperCase()}
        </div>
        <div style={{ background: '#060d1a', border: '1px solid #1e4080', borderTop: 'none', borderRadius: '0 0 4px 4px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {[['plate','PLATE QUERY'],['name','NAME/SSN QUERY']].map(([v,l]) => (
              <button key={v} onClick={() => setType(v)} style={{ background: type === v ? '#1e4080' : 'transparent', border: `1px solid ${type === v ? '#4a9eff' : '#1e3060'}`, borderRadius: '4px', color: type === v ? '#4a9eff' : '#64748b', padding: '5px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', letterSpacing: '1px' }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, fontFamily: 'Ubuntu Mono, monospace', color: '#22c55e', fontSize: '15px', background: '#040a10', border: '1px solid #22c55e', borderRadius: '4px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#4a9eff' }}>{'>'}</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runQuery()}
                placeholder={type === 'plate' ? 'Enter plate (e.g. SUS-1109)...' : 'Enter name or SSN...'}
                style={{ background: 'transparent', border: 'none', color: '#22c55e', flex: 1, fontSize: '15px', fontFamily: 'Ubuntu Mono, monospace', outline: 'none' }}
              />
            </div>
            <button onClick={runQuery} style={{ background: '#0f3020', border: '1px solid #22c55e', borderRadius: '4px', color: '#22c55e', padding: '8px 18px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', letterSpacing: '1px' }}>
              SUBMIT
            </button>
          </div>
        </div>

        {result === null && (
          <div style={{ color: '#334155', fontSize: '15px', textAlign: 'center', padding: '40px' }}>
            Run a plate or name query to retrieve records.
          </div>
        )}

        {result && !result.civ && !result.veh && (
          <div style={{ background: '#040a10', border: '1px solid #ef4444', borderRadius: '4px', padding: '16px', fontFamily: 'Ubuntu Mono, monospace', color: '#ef4444', fontSize: '15px' }}>
            *** NO RECORDS FOUND FOR QUERY: "{query}" ***<br />
            <span style={{ color: '#475569', fontSize: '12px' }}>Query returned no matching records in state database.</span>
          </div>
        )}

        {result?.civ && <CivilianTerminal civ={result.civ} />}
        {result?.veh && <VehicleTerminal veh={result.veh} civ={result.veh ? civilians.find(c => c.id === result.veh.ownerId) : null} />}
      </div>

      {/* History panel */}
      <div>
        <div style={{ background: '#0a1a35', border: '1px solid #1e4080', borderRadius: '4px', padding: '10px 12px', marginBottom: '0', color: '#4a9eff', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>
          QUERY HISTORY
        </div>
        <div style={{ border: '1px solid #1e4080', borderTop: 'none', borderRadius: '0 0 4px 4px' }}>
          {history.map((h, i) => (
            <div key={i} style={{ padding: '8px 12px', borderBottom: '1px solid #0f1e35', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569', fontSize: '11px' }}>{h.time}</span>
                <span style={{ color: h.result === 'CLEAR' ? '#22c55e' : '#ef4444', fontSize: '11px', fontWeight: 700 }}>{h.result}</span>
              </div>
              <span style={{ color: '#64748b', fontSize: '12px' }}>{h.query}</span>
            </div>
          ))}
          {history.length === 0 && <div style={{ padding: '16px 12px', color: '#334155', fontSize: '14px' }}>No queries yet.</div>}
        </div>
      </div>
    </div>
  );
}
