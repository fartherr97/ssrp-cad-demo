import { useState } from 'react';
import { useCAD } from '../store/cadStore';

export default function MDT() {
  const { state, dispatch } = useCAD();
  const { messages, dispatchLog, civilians, vehicles, warrants, currentUser } = state;

  const [tab, setTab] = useState('MESSAGES');
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [queryType, setQueryType] = useState('PERSON');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const unread = messages.filter(m => !m.read);

  const selMsg = selectedMsg != null ? messages.find(m => m.id === selectedMsg) : null;

  const markRead = (id) => dispatch({ type: 'MARK_MESSAGE_READ', payload: id });

  const runQuery = () => {
    if (!query.trim()) return;
    setSearched(true);
    const q = query.trim().toLowerCase();
    if (queryType === 'PERSON') {
      setResults(civilians.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || c.ssn?.includes(q)
      ).map(c => ({
        type: 'PERSON',
        title: `${c.firstName} ${c.lastName}`,
        sub: `DOB: ${c.dob} · SSN: ${c.ssn}`,
        flags: c.flags,
        extra: `DL: ${c.dlStatus} · Address: ${c.address}`,
      })));
    } else if (queryType === 'VEHICLE') {
      setResults(vehicles.filter(v =>
        v.plate?.toLowerCase().includes(q) || `${v.make} ${v.model}`.toLowerCase().includes(q)
      ).map(v => {
        const owner = civilians.find(c => c.id === v.ownerId);
        const ownerWarrant = owner ? warrants.find(w => w.civilianId === owner.id && w.status === 'ACTIVE') : null;
        return {
          type: 'VEHICLE',
          title: v.plate,
          sub: `${v.year} ${v.make} ${v.model} · ${v.color}`,
          flags: [...(v.flags || []), v.stolen ? 'STOLEN' : null].filter(Boolean),
          extra: owner ? `Owner: ${owner.firstName} ${owner.lastName}${ownerWarrant ? ' ⚠ WARRANT' : ''}` : 'Owner: Unknown',
          regStatus: v.regStatus,
        };
      }));
    }
  };

  return (
    <div className="n-page" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
      <div className="n-tabs">
        {[
          { id: 'MESSAGES', label: 'Messages', badge: unread.length },
          { id: 'RADIO', label: 'Radio Log', badge: 0 },
          { id: 'QUERY', label: 'State Returns', badge: 0 },
        ].map(t => (
          <button key={t.id} className={`n-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
            {t.badge > 0 && (
              <span style={{ marginLeft: 4, fontSize: 9, background: 'var(--pr1-bg)', color: 'var(--pr1-text)', borderRadius: 2, padding: '0 4px', fontFamily: 'var(--font-mono)' }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {/* MESSAGES */}
        {tab === 'MESSAGES' && (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <div className="n-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderBottom: 'none', borderRight: 'none' }}>
              <div className="n-panel-header">
                <div className="n-panel-title">Inbox</div>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--n-text-muted)' }}>{messages.length} MESSAGES</span>
              </div>
              <div className="n-panel-body scroll-y">
                {messages.map(m => (
                  <div key={m.id}
                    className="n-card n-card-hover"
                    style={{
                      margin: '3px 8px', padding: '7px 9px', borderRadius: 3, cursor: 'pointer',
                      border: selectedMsg === m.id ? '1px solid var(--n-border-accent)' : '1px solid var(--n-border-subtle)',
                      background: selectedMsg === m.id ? 'var(--n-bg-selected)' : !m.read ? 'var(--n-bg-elevated)' : 'var(--n-bg-card)',
                      borderLeft: m.priority === 'HIGH' ? '3px solid var(--pr1-text)' : undefined,
                    }}
                    onClick={() => { setSelectedMsg(m.id); if (!m.read) markRead(m.id); }}>
                    <div style={{ display: 'flex', gap: 5, marginBottom: 2, alignItems: 'center' }}>
                      {!m.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--n-blue-active)', flexShrink: 0 }} />}
                      {m.priority === 'HIGH' && <span className="n-badge badge-red" style={{ fontSize: 8 }}>HIGH PRI</span>}
                      <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
                        {m.timestamp?.split(' ')[1] || ''}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, fontWeight: m.read ? 400 : 600, marginBottom: 1 }}>{m.subject}</div>
                    <div style={{ fontSize: 10, color: 'var(--n-text-dim)' }}>From: {m.from}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="n-panel" style={{ borderRadius: 0, borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}>
              {!selMsg ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--n-text-muted)', padding: 20 }}>
                  <span style={{ fontSize: 28, opacity: 0.2 }}>📨</span>
                  <span style={{ fontSize: 11 }}>Select a message to read</span>
                </div>
              ) : (
                <>
                  <div style={{ padding: '10px 14px', background: 'var(--n-bg-card)', borderBottom: '1px solid var(--n-border)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center' }}>
                      {selMsg.priority === 'HIGH' && <span className="n-badge badge-red">HIGH PRIORITY</span>}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{selMsg.subject}</div>
                    <div style={{ fontSize: 10, color: 'var(--n-text-dim)', fontFamily: 'var(--font-mono)' }}>
                      From: {selMsg.from} → {selMsg.to} · {selMsg.timestamp}
                    </div>
                  </div>
                  <div style={{ padding: 16, flex: 1, overflow: 'auto' }}>
                    <div style={{ fontSize: 12.5, lineHeight: 1.8, color: 'var(--n-text)' }}>{selMsg.body}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* RADIO LOG */}
        {tab === 'RADIO' && (
          <div className="n-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', flex: 1 }}>
            <div className="n-panel-header">
              <div className="n-panel-title">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--st-av-text)', boxShadow: '0 0 5px var(--st-av-text)', display: 'inline-block', marginRight: 5 }} />
                Dispatch Radio Log
              </div>
              <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>CH: HILLSBOROUGH MAIN</span>
            </div>
            <div className="n-panel-body scroll-y">
              {dispatchLog.map(e => (
                <div key={e.id} className="tx-entry">
                  <span className="tx-time">{e.time}</span>
                  <span className={`tx-kind-${e.kind}`}>{e.text}</span>
                </div>
              ))}
              {dispatchLog.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--n-text-muted)', fontSize: 11 }}>No radio traffic</div>
              )}
            </div>
          </div>
        )}

        {/* STATE RETURNS */}
        {tab === 'QUERY' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', background: 'var(--n-bg-panel)', borderBottom: '1px solid var(--n-border)', flexShrink: 0 }}>
              <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                STATE / NCIC QUERY TERMINAL
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                <div className="n-field" style={{ flex: '0 0 120px' }}>
                  <label className="n-label">Query Type</label>
                  <select className="n-select" value={queryType} onChange={e => { setQueryType(e.target.value); setResults([]); setSearched(false); }}>
                    <option value="PERSON">Person</option>
                    <option value="VEHICLE">Vehicle</option>
                  </select>
                </div>
                <div className="n-field" style={{ flex: 1 }}>
                  <label className="n-label">{queryType === 'PERSON' ? 'Name or SSN' : 'Plate or Description'}</label>
                  <input className="n-input" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && runQuery()}
                    placeholder={queryType === 'PERSON' ? 'e.g. Washington or 618-77-9901' : 'e.g. SUS-1109 or Dodge Charger'} />
                </div>
                <button className="n-btn n-btn-primary" onClick={runQuery}>Query</button>
              </div>
            </div>

            <div className="n-panel-body scroll-y" style={{ flex: 1, padding: 12 }}>
              {!searched ? (
                <div style={{
                  background: 'var(--n-bg-panel)', border: '1px solid var(--n-border)', borderRadius: 3,
                  padding: 16, fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--n-text-dim)', lineHeight: 1.8,
                }}>
                  <div style={{ color: 'var(--st-av-text)', marginBottom: 8, fontWeight: 600 }}>NCIC / DMV QUERY TERMINAL ONLINE</div>
                  <div>SYSTEM: SSRP STATE RECORDS BUREAU</div>
                  <div>ACCESS: AUTHORIZED PERSONNEL ONLY</div>
                  <div>CHANNEL: LAW ENFORCEMENT SECURE</div>
                  <div style={{ marginTop: 12, color: 'var(--n-text-muted)' }}>Enter query parameters above and press QUERY or ENTER to retrieve records.</div>
                  <div style={{ marginTop: 4, color: 'var(--n-text-muted)' }}>All queries are logged and audited.</div>
                  <div style={{ marginTop: 12, color: 'var(--n-border-strong)' }}>{'>'} READY_</div>
                </div>
              ) : results.length === 0 ? (
                <div style={{ background: 'var(--n-bg-panel)', border: '1px solid var(--n-border)', borderRadius: 3, padding: 16, fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--n-text-dim)' }}>
                  <div style={{ color: 'var(--pr2-text)', marginBottom: 6 }}>QUERY COMPLETE — NO RECORDS FOUND</div>
                  <div>Search terms: "{query}"</div>
                  <div style={{ color: 'var(--n-border-strong)', marginTop: 12 }}>{'>'} READY_</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--st-av-text)', marginBottom: 4 }}>
                    QUERY RETURNED {results.length} RECORD(S)
                  </div>
                  {results.map((r, i) => (
                    <div key={i} style={{
                      background: 'var(--n-bg-panel)', border: '1px solid var(--n-border)',
                      borderRadius: 3, padding: 12, fontFamily: 'var(--font-mono)', fontSize: 11.5,
                    }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                        <span style={{ color: 'var(--n-text-data)', fontWeight: 600, fontSize: 13 }}>{r.title}</span>
                        {r.flags?.map(f => (
                          <span key={f} className={`n-badge ${f === 'STOLEN' || f === 'WARRANT' || f === 'VIOLENT' ? 'badge-red' : 'badge-orange'}`} style={{ fontSize: 9 }}>{f}</span>
                        ))}
                        {r.regStatus && r.regStatus !== 'VALID' && (
                          <span className="n-badge badge-orange" style={{ fontSize: 9 }}>REG {r.regStatus}</span>
                        )}
                      </div>
                      <div style={{ color: 'var(--n-text-dim)', marginBottom: 3 }}>{r.sub}</div>
                      <div style={{ color: 'var(--n-text-muted)', fontSize: 10.5 }}>{r.extra}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
