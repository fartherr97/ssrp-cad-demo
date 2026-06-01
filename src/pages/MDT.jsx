import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { RecordReturn } from '../components/FormDocument';
import {
  S_PAGE, S_TABS, tabStyle,
  S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_FIELD, S_LABEL, S_SELECT, S_INPUT,
  S_BTN_PRIMARY, btnHoverOn, btnHoverOff, btnActiveOn,
  BADGE, S_TX_ENTRY, S_TX_TIME, TX_KIND_COLOR,
} from '../constants/styles';

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
      ).map(c => ({ type: 'PERSON', data: c })));
    } else if (queryType === 'VEHICLE') {
      setResults(vehicles.filter(v =>
        v.plate?.toLowerCase().includes(q) || `${v.make} ${v.model}`.toLowerCase().includes(q)
      ).map(v => ({
        type: 'VEHICLE',
        data: v,
        subject: civilians.find(c => c.id === v.ownerId) || null,
      })));
    }
  };

  return (
    <div style={{ ...S_PAGE, padding: 0, overflow: 'hidden', gap: 0 }}>
      <div style={S_TABS}>
        {[
          { id: 'MESSAGES', label: 'Messages', badge: unread.length },
          { id: 'RADIO', label: 'Radio Log', badge: 0 },
          { id: 'QUERY', label: 'State Returns', badge: 0 },
        ].map(t => (
          <button key={t.id} style={tabStyle(tab === t.id)} onClick={() => setTab(t.id)}>
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
            <div style={{ ...S_PANEL, borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderBottom: 'none', borderRight: 'none' }}>
              <div style={S_PANEL_HEADER}>
                <div style={S_PANEL_TITLE}>Inbox</div>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--n-text-muted)' }}>{messages.length} MESSAGES</span>
              </div>
              <div style={S_PANEL_BODY}>
                {messages.map(m => (
                  <div key={m.id}
                    style={{
                      margin: '3px 8px', padding: '7px 9px', borderRadius: 3, cursor: 'pointer',
                      border: selectedMsg === m.id ? '1px solid var(--n-border-accent)' : '1px solid var(--n-border-subtle)',
                      background: selectedMsg === m.id ? 'var(--n-bg-selected)' : !m.read ? 'var(--n-bg-elevated)' : 'var(--n-bg-card)',
                      borderLeft: m.priority === 'HIGH' ? '3px solid var(--pr1-text)' : undefined,
                      transition: 'border-color 0.22s, background 0.22s',
                    }}
                    onClick={() => { setSelectedMsg(m.id); if (!m.read) markRead(m.id); }}>
                    <div style={{ display: 'flex', gap: 5, marginBottom: 2, alignItems: 'center' }}>
                      {!m.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--n-blue-active)', flexShrink: 0 }} />}
                      {m.priority === 'HIGH' && <span style={{ ...BADGE.red, fontSize: 8 }}>HIGH PRI</span>}
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
            <div style={{ ...S_PANEL, borderRadius: 0, borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}>
              {!selMsg ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--n-text-muted)', padding: 20 }}>
                  <span style={{ fontSize: 28, opacity: 0.2 }}>📨</span>
                  <span style={{ fontSize: 11 }}>Select a message to read</span>
                </div>
              ) : (
                <>
                  <div style={{ padding: '10px 14px', background: 'var(--n-bg-card)', borderBottom: '1px solid var(--n-border)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center' }}>
                      {selMsg.priority === 'HIGH' && <span style={BADGE.red}>HIGH PRIORITY</span>}
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
          <div style={{ ...S_PANEL, borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', flex: 1 }}>
            <div style={S_PANEL_HEADER}>
              <div style={S_PANEL_TITLE}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--st-av-text)', boxShadow: '0 0 5px var(--st-av-text)', display: 'inline-block', marginRight: 5 }} />
                Dispatch Radio Log
              </div>
              <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>CH: HILLSBOROUGH MAIN</span>
            </div>
            <div style={S_PANEL_BODY}>
              {dispatchLog.map(e => (
                <div key={e.id} style={S_TX_ENTRY}>
                  <span style={S_TX_TIME}>{e.time}</span>
                  <span style={{ color: TX_KIND_COLOR[e.kind] || 'var(--n-text-muted)' }}>{e.text}</span>
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
                <div style={{ ...S_FIELD, flex: '0 0 120px' }}>
                  <label style={S_LABEL}>Query Type</label>
                  <select style={S_SELECT} value={queryType} onChange={e => { setQueryType(e.target.value); setResults([]); setSearched(false); }}>
                    <option value="PERSON">Person</option>
                    <option value="VEHICLE">Vehicle</option>
                  </select>
                </div>
                <div style={{ ...S_FIELD, flex: 1 }}>
                  <label style={S_LABEL}>{queryType === 'PERSON' ? 'Name or SSN' : 'Plate or Description'}</label>
                  <input style={S_INPUT} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && runQuery()}
                    placeholder={queryType === 'PERSON' ? 'e.g. Washington or 618-77-9901' : 'e.g. SUS-1109 or Dodge Charger'} />
                </div>
                <button style={S_BTN_PRIMARY} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={runQuery}>Query</button>
              </div>
            </div>

            <div style={{ ...S_PANEL_BODY, flex: 1, padding: 12 }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--st-av-text)', marginBottom: 4, alignSelf: 'flex-start' }}>
                    QUERY RETURNED {results.length} RECORD(S)
                  </div>
                  {results.map((r, i) => (
                    <RecordReturn key={i} type={r.type} data={r.data} subject={r.subject} />
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
