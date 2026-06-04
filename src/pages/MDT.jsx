import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { RecordReturn } from '../components/FormDocument';
import ActivePanicsPanel from '../components/ActivePanicsPanel';
import {
  S_PAGE, S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_FIELD, S_LABEL, S_SELECT, S_INPUT,
  S_BTN_PRIMARY,
  BADGE, S_TX_ENTRY, S_TX_TIME, TX_KIND_COLOR,
} from '../constants/styles';
import { MdArrowBack } from 'react-icons/md';

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

  const TAB_BASE = 'relative px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.4px] cursor-pointer transition-colors shrink-0';
  const tabCls = (active) => active
    ? `${TAB_BASE} text-brand-bright`
    : `${TAB_BASE} text-slate-500 hover:text-slate-300`;

  return (
    <div className={`${S_PAGE} !p-0 overflow-hidden !gap-0`}>
      {/* Tab bar */}
      <div className="flex items-end gap-0.5 bg-app-toolbar/80 backdrop-blur-md border-b border-border-base shrink-0 px-2 pt-1">
        {[
          { id: 'MESSAGES', label: 'Messages', badge: unread.length },
          { id: 'RADIO', label: 'Radio Log', badge: 0 },
          { id: 'QUERY', label: 'State Returns', badge: 0 },
        ].map(t => (
          <button key={t.id} className={tabCls(tab === t.id)} onClick={() => setTab(t.id)}>
            {t.label}
            {t.badge > 0 && (
              <span className="ml-1.5 text-[9px] bg-red-500/20 text-red-400 rounded-full px-1.5 py-0.5 font-mono">
                {t.badge}
              </span>
            )}
            {tab === t.id && <span className="absolute -bottom-[1px] left-2 right-2 h-[3px] rounded-full bg-brand" />}
          </button>
        ))}
      </div>

      {/* Active panics * always visible across MDT tabs while unresolved */}
      <ActivePanicsPanel className="shrink-0 m-2" />

      <div className="flex-1 overflow-hidden flex">
        {/* MESSAGES */}
        {tab === 'MESSAGES' && (
          <div className="mob-two-pane grid flex-1 overflow-hidden min-h-0 grid-cols-1 md:grid-cols-[260px_1fr]">
            <div className={`mob-list-panel${selMsg ? ' mob-gone' : ''} ${S_PANEL} rounded-none border-t-0 border-l-0 border-b-0 border-r-0`}>
              <div className={S_PANEL_HEADER}>
                <div className={S_PANEL_TITLE}>Inbox</div>
                <span className="text-[9px] font-mono text-cad-muted">{messages.length} MESSAGES</span>
              </div>
              <div className={S_PANEL_BODY}>
                {messages.map(m => (
                  <div key={m.id}
                    className={`mx-2 my-[3px] px-3 py-2.5 rounded-lg cursor-pointer border transition-colors ${
                      selectedMsg === m.id
                        ? 'border-brand/40 bg-brand/15'
                        : !m.read
                        ? 'border-border-base bg-white/[0.03] hover:bg-white/[0.06]'
                        : 'border-border-faint bg-white/[0.02] hover:bg-white/[0.05]'
                    } ${m.priority === 'HIGH' ? 'border-l-[3px] border-l-red-400' : ''}`}
                    onClick={() => { setSelectedMsg(m.id); if (!m.read) markRead(m.id); }}>
                    <div className="flex gap-1.5 mb-0.5 items-center">
                      {!m.read && <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />}
                      {m.priority === 'HIGH' && <span className={`${BADGE.red} text-[8px]`}>HIGH PRI</span>}
                      <span className="text-[9px] text-cad-muted font-mono ml-auto">
                        {m.timestamp?.split(' ')[1] || ''}
                      </span>
                    </div>
                    <div className={`text-[11.5px] mb-px ${m.read ? 'font-normal' : 'font-semibold'}`}>{m.subject}</div>
                    <div className="text-[10px] text-cad-dim">From: {m.from}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`mob-detail-panel${!selMsg ? ' mob-gone' : ''} ${S_PANEL} rounded-none border-t-0 border-r-0 border-b-0`}>
              <button className="mob-back-btn" onClick={() => setSelectedMsg(null)}>
                <MdArrowBack size={14} /> Back to inbox
              </button>
              {!selMsg ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-cad-muted p-5">
                  <span className="text-[28px] opacity-20">📨</span>
                  <span className="text-[11px]">Select a message to read</span>
                </div>
              ) : (
                <>
                  <div className="px-4 py-3 bg-app-card/40 border-b border-border-faint shrink-0">
                    <div className="flex gap-2 mb-1 items-center">
                      {selMsg.priority === 'HIGH' && <span className={BADGE.red}>HIGH PRIORITY</span>}
                    </div>
                    <div className="text-[15px] font-bold mb-1">{selMsg.subject}</div>
                    <div className="text-[10px] text-cad-dim font-mono">
                      From: {selMsg.from} → {selMsg.to} · {selMsg.timestamp}
                    </div>
                  </div>
                  <div className="p-4 flex-1 overflow-auto">
                    <div className="text-[12.5px] leading-[1.8] text-cad-text">{selMsg.body}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* RADIO LOG */}
        {tab === 'RADIO' && (
          <div className={`${S_PANEL} rounded-none border-t-0 border-l-0 border-r-0 border-b-0 flex-1`}>
            <div className={S_PANEL_HEADER}>
              <div className={S_PANEL_TITLE}>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_5px_#2fd968] mr-1.5" />
                Dispatch Radio Log
              </div>
              <span className="text-[9px] text-cad-muted font-mono">CH: SSRP MAIN</span>
            </div>
            <div className={S_PANEL_BODY}>
              {dispatchLog.map(e => (
                <div key={e.id} className={`${S_TX_ENTRY} px-3 py-px`}>
                  <span className={S_TX_TIME}>{e.time}</span>
                  <span className={TX_KIND_COLOR[e.kind] || 'text-slate-500'}>{e.text}</span>
                </div>
              ))}
              {dispatchLog.length === 0 && (
                <div className="p-5 text-center text-cad-muted text-[11px]">No radio traffic</div>
              )}
            </div>
          </div>
        )}

        {/* STATE RETURNS */}
        {tab === 'QUERY' && (
          <div className="flex-1 flex flex-col gap-0 overflow-hidden">
            <div className="px-4 py-3 bg-app-toolbar/80 backdrop-blur-md border-b border-border-base shrink-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.7px] mb-2">
                STATE / NCIC QUERY TERMINAL
              </div>
              <div className="flex flex-wrap gap-1.5 items-end">
                <div className={`${S_FIELD} flex-[0_0_120px] min-w-[120px]`}>
                  <label className={S_LABEL}>Query Type</label>
                  <select className={S_SELECT} value={queryType} onChange={e => { setQueryType(e.target.value); setResults([]); setSearched(false); }}>
                    <option value="PERSON">Person</option>
                    <option value="VEHICLE">Vehicle</option>
                  </select>
                </div>
                <div className={`${S_FIELD} flex-1 min-w-[160px]`}>
                  <label className={S_LABEL}>{queryType === 'PERSON' ? 'Name or SSN' : 'Plate or Description'}</label>
                  <input className={S_INPUT} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && runQuery()}
                    placeholder={queryType === 'PERSON' ? 'e.g. Washington or 618-77-9901' : 'e.g. SUS-1109 or Dodge Charger'} />
                </div>
                <button className={S_BTN_PRIMARY} onClick={runQuery}>Query</button>
              </div>
            </div>

            <div className={`${S_PANEL_BODY} flex-1 p-3`}>
              {!searched ? (
                <div className="bg-app-panel/80 border border-border-base rounded-xl backdrop-blur-sm p-4 font-mono text-[11.5px] text-cad-dim leading-[1.8]">
                  <div className="text-green-400 mb-2 font-semibold">NCIC / DMV QUERY TERMINAL ONLINE</div>
                  <div>SYSTEM: SSRP STATE RECORDS BUREAU</div>
                  <div>ACCESS: AUTHORIZED PERSONNEL ONLY</div>
                  <div>CHANNEL: LAW ENFORCEMENT SECURE</div>
                  <div className="mt-3 text-cad-muted">Enter query parameters above and press QUERY or ENTER to retrieve records.</div>
                  <div className="mt-1 text-cad-muted">All queries are logged and audited.</div>
                  <div className="mt-3 text-border-strong">{'>'} READY_</div>
                </div>
              ) : results.length === 0 ? (
                <div className="bg-app-panel/80 border border-border-base rounded-xl backdrop-blur-sm p-4 font-mono text-[11.5px] text-cad-dim">
                  <div className="text-amber-400 mb-1.5">QUERY COMPLETE * NO RECORDS FOUND</div>
                  <div>Search terms: "{query}"</div>
                  <div className="text-border-strong mt-3">{'>'} READY_</div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 items-center">
                  <div className="font-mono text-[10px] text-green-400 mb-1 self-start">
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
