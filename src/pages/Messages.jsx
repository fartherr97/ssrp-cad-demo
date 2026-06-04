import { useState, useMemo } from 'react';
import { useCAD } from '../store/cadStore';
import {
  MdInbox, MdSend, MdSearch, MdClose, MdPerson, MdLock,
  MdArrowBack, MdInfo,
} from 'react-icons/md';
import {
  S_PAGE, S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_INPUT, S_LABEL, S_FIELD, S_BTN_PRIMARY, S_BTN_SECONDARY,
} from '../constants/styles';

const DISCLAIMER = 'Messages in this system are monitored for security and compliance purposes.';

function ComposeModal({ onClose, currentUser, officers, onSend }) {
  const [toId, setToId]       = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody]       = useState('');
  const [search, setSearch]   = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return officers.filter(o =>
      o.id !== currentUser?.id &&
      (!q || o.name?.toLowerCase().includes(q) || o.badge?.toLowerCase().includes(q))
    );
  }, [officers, currentUser, search]);

  const toOfficer = officers.find(o => o.id === Number(toId));

  const handleSend = () => {
    if (!toOfficer || !subject.trim() || !body.trim()) return;
    onSend({
      fromName: currentUser?.name || 'Unknown',
      fromBadge: currentUser?.badge || '—',
      fromId: currentUser?.id,
      toName: toOfficer.name,
      toId: toOfficer.id,
      subject: subject.trim(),
      body: body.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:max-w-[500px] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden max-h-[92dvh] overflow-y-auto anim-modal-in font-ui"
        style={{ background: '#0c1929', border: '1px solid rgba(59,130,246,0.3)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <MdSend size={18} className="text-brand-bright shrink-0" />
          <span className="flex-1 text-[14px] font-bold text-white">Compose Message</span>
          <button type="button" onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
            style={{ background: 'none', border: 'none' }}>
            <MdClose size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* To field */}
          <div className={S_FIELD}>
            <label className={S_LABEL}>To</label>
            <div className="flex items-center gap-2 bg-app-input border border-border-base rounded-lg px-3 py-2 mb-1">
              <MdSearch size={14} className="text-slate-500 shrink-0" />
              <input className="flex-1 bg-transparent text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none"
                placeholder="Search by name or badge…"
                value={search}
                onChange={e => { setSearch(e.target.value); setToId(''); }} />
            </div>
            {search && !toOfficer && (
              <div className="bg-app-card border border-border-base rounded-xl overflow-hidden max-h-[150px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="px-3 py-2 text-[11px] text-slate-600">No accounts found</div>
                ) : filtered.map(o => (
                  <button key={o.id} type="button"
                    onClick={() => { setToId(String(o.id)); setSearch(o.name); }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/[0.06] cursor-pointer text-left transition-colors">
                    <MdPerson size={14} className="text-slate-400 shrink-0" />
                    <span className="text-[12px] text-slate-200">{o.name}</span>
                    <span className="text-[10.5px] text-slate-500 font-mono ml-auto">{o.badge}</span>
                  </button>
                ))}
              </div>
            )}
            {toOfficer && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg mt-1"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
                <MdPerson size={13} className="text-brand-bright shrink-0" />
                <span className="text-[12px] text-brand-bright font-semibold">{toOfficer.name}</span>
                <span className="text-[10px] text-slate-500 font-mono ml-auto">{toOfficer.badge}</span>
                <button type="button" onClick={() => { setToId(''); setSearch(''); }}
                  className="text-slate-500 hover:text-slate-300 cursor-pointer ml-1" style={{ background: 'none', border: 'none' }}>
                  <MdClose size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Subject */}
          <div className={S_FIELD}>
            <label className={S_LABEL}>Subject</label>
            <input className={S_INPUT} placeholder="Enter subject…" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>

          {/* Body */}
          <div className={S_FIELD}>
            <label className={S_LABEL}>Message</label>
            <textarea
              className="w-full bg-app-input border border-border-base rounded-xl px-3 py-2.5 text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-brand/60 transition-[border-color,box-shadow] resize-none"
              placeholder="Write your message…"
              rows={5}
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          </div>

          {/* Disclaimer */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10.5px] text-slate-500"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <MdLock size={12} className="shrink-0" />
            {DISCLAIMER}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-bold cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
              Cancel
            </button>
            <button type="button" onClick={handleSend}
              disabled={!toOfficer || !subject.trim() || !body.trim()}
              className="press flex-1 py-2.5 rounded-xl text-[12px] font-bold cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
              style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.45)', color: '#60a5fa' }}>
              <MdSend size={13} /> Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Messages() {
  const { state, dispatch } = useCAD();
  const { messages, directMessages, currentUser, officers } = state;

  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'system' | 'direct'
  const [composing, setComposing] = useState(false);
  const [tab, setTab] = useState('inbox'); // 'inbox' | 'sent'
  const [search, setSearch] = useState('');

  // Inbox: system messages + direct messages addressed to current user
  const inbox = useMemo(() => {
    const sys = messages.map(m => ({ ...m, type: 'system' }));
    const dir = directMessages
      .filter(m => m.toId === currentUser?.id)
      .map(m => ({ ...m }));
    return [...sys, ...dir]
      .filter(m => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return m.subject?.toLowerCase().includes(q) ||
          (m.from || m.fromName)?.toLowerCase().includes(q) ||
          m.body?.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const ta = new Date(a.timestamp).getTime() || 0;
        const tb = new Date(b.timestamp).getTime() || 0;
        return tb - ta;
      });
  }, [messages, directMessages, currentUser, search]);

  const sent = useMemo(() => {
    return directMessages
      .filter(m => m.fromId === currentUser?.id)
      .filter(m => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return m.subject?.toLowerCase().includes(q) || m.toName?.toLowerCase().includes(q);
      })
      .sort((a, b) => b.id - a.id);
  }, [directMessages, currentUser, search]);

  const list = tab === 'inbox' ? inbox : sent;
  const unread = inbox.filter(m => !m.read).length;

  const selMsg = useMemo(() => {
    if (selectedId == null) return null;
    if (selectedType === 'system') return messages.find(m => m.id === selectedId);
    return directMessages.find(m => m.id === selectedId);
  }, [selectedId, selectedType, messages, directMessages]);

  const selectMsg = (m) => {
    setSelectedId(m.id);
    setSelectedType(m.type === 'system' ? 'system' : 'direct');
    if (!m.read) {
      if (m.type === 'system') dispatch({ type: 'MARK_MESSAGE_READ', payload: m.id });
      else dispatch({ type: 'MARK_DIRECT_MESSAGE_READ', payload: m.id });
    }
  };

  const handleSend = (payload) => {
    dispatch({ type: 'SEND_DIRECT_MESSAGE', payload });
  };

  const BADGE_BASE = 'px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.3px] rounded-full border';

  const TAB_BASE = 'relative px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.4px] cursor-pointer transition-colors shrink-0';
  const tabCls = (id) => tab === id
    ? `${TAB_BASE} text-brand-bright`
    : `${TAB_BASE} text-slate-500 hover:text-slate-300`;

  return (
    <div className={`${S_PAGE} !p-0 overflow-hidden !gap-0`}>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 bg-app-toolbar/80 backdrop-blur-md border-b border-border-base shrink-0 px-3 pr-4">
        <div className="flex items-end gap-0.5 py-1">
          <button className={tabCls('inbox')} onClick={() => setTab('inbox')}>
            Inbox
            {unread > 0 && (
              <span className="ml-1.5 text-[9px] bg-brand/20 text-brand-bright rounded-full px-1.5 py-0.5 font-mono">
                {unread}
              </span>
            )}
            {tab === 'inbox' && <span className="absolute -bottom-[1px] left-2 right-2 h-[3px] rounded-full bg-brand" />}
          </button>
          <button className={tabCls('sent')} onClick={() => setTab('sent')}>
            Sent
            {tab === 'sent' && <span className="absolute -bottom-[1px] left-2 right-2 h-[3px] rounded-full bg-brand" />}
          </button>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => setComposing(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11.5px] font-bold cursor-pointer transition-all shrink-0 bg-brand/20 border border-brand/40 text-brand-bright hover:bg-brand/30">
          <MdSend size={13} /> Compose
        </button>
      </div>

      {/* Disclaimer banner */}
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/[0.06] border-b border-amber-500/20 shrink-0 text-[10.5px] text-amber-400/80">
        <MdInfo size={13} className="shrink-0" />
        {DISCLAIMER}
      </div>

      <div className="flex-1 overflow-hidden flex">

        {/* Left: message list */}
        <div className={`mob-list-panel${selMsg ? ' mob-gone' : ''} flex flex-col w-full md:w-[280px] md:shrink-0 border-r border-border-base overflow-hidden`}>
          {/* Search */}
          <div className="p-2 border-b border-border-faint shrink-0">
            <div className="flex items-center gap-2 bg-app-input border border-border-base rounded-lg px-3 py-1.5">
              <MdSearch size={13} className="text-slate-500 shrink-0" />
              <input className="flex-1 bg-transparent text-[12px] text-slate-200 placeholder:text-slate-600 outline-none"
                placeholder="Search messages…"
                value={search}
                onChange={e => setSearch(e.target.value)} />
              {search && (
                <button type="button" onClick={() => setSearch('')}
                  className="text-slate-500 hover:text-slate-300 cursor-pointer text-[11px]" style={{ background: 'none', border: 'none' }}>✕</button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {list.length === 0 ? (
              <div className="p-6 text-center text-[12px] text-slate-600">
                {tab === 'sent' ? 'No sent messages' : 'No messages in your inbox'}
              </div>
            ) : list.map(m => {
              const isRead = m.read;
              const isSel  = selectedId === m.id && selectedType === (m.type === 'system' ? 'system' : 'direct');
              const sender = m.type === 'system' ? (m.from || 'System') : (tab === 'sent' ? `→ ${m.toName}` : m.fromName);
              return (
                <div key={`${m.type || 'direct'}-${m.id}`}
                  className={`mx-2 my-[3px] px-3 py-2.5 rounded-lg cursor-pointer border transition-colors ${
                    isSel
                      ? 'border-brand/40 bg-brand/15'
                      : !isRead
                      ? 'border-border-base bg-white/[0.03] hover:bg-white/[0.06]'
                      : 'border-border-faint bg-white/[0.02] hover:bg-white/[0.05]'
                  } ${m.priority === 'HIGH' ? 'border-l-[3px] border-l-red-400' : ''}`}
                  onClick={() => selectMsg(m)}>
                  <div className="flex gap-1.5 mb-0.5 items-center">
                    {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />}
                    {m.priority === 'HIGH' && (
                      <span className={`${BADGE_BASE} bg-red-500/20 text-red-400 border-red-500/30 text-[8px]`}>HIGH PRI</span>
                    )}
                    {m.type !== 'system' && (
                      <span className={`${BADGE_BASE} bg-violet-500/20 text-violet-400 border-violet-500/30 text-[8px]`}>DIRECT</span>
                    )}
                    <span className="text-[9px] text-cad-muted font-mono ml-auto">
                      {m.timestamp?.split(' ')[1] || ''}
                    </span>
                  </div>
                  <div className={`text-[11.5px] mb-px truncate ${isRead ? 'font-normal' : 'font-semibold'}`}>{m.subject}</div>
                  <div className="text-[10px] text-cad-dim truncate">{sender}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: message detail */}
        <div className={`mob-detail-panel${!selMsg ? ' mob-gone' : ''} flex-1 flex flex-col overflow-hidden`}>
          <button className="mob-back-btn" onClick={() => setSelectedId(null)}>
            <MdArrowBack size={14} /> Back to inbox
          </button>
          {!selMsg ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-cad-muted p-5">
              <MdInbox size={40} className="opacity-15" />
              <span className="text-[11px]">Select a message to read</span>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 bg-app-card/40 border-b border-border-faint shrink-0">
                <div className="flex gap-2 mb-1 items-center flex-wrap">
                  {selMsg.priority === 'HIGH' && (
                    <span className={`${BADGE_BASE} bg-red-500/20 text-red-400 border-red-500/30`}>HIGH PRIORITY</span>
                  )}
                  {selMsg.type !== 'system' && (
                    <span className={`${BADGE_BASE} bg-violet-500/20 text-violet-400 border-violet-500/30`}>DIRECT MESSAGE</span>
                  )}
                </div>
                <div className="text-[15px] font-bold mb-1">{selMsg.subject}</div>
                <div className="text-[10px] text-cad-dim font-mono">
                  {selMsg.type === 'system'
                    ? `From: ${selMsg.from} → ${selMsg.to} · ${selMsg.timestamp}`
                    : `From: ${selMsg.fromName} (${selMsg.fromBadge}) → ${selMsg.toName} · ${selMsg.timestamp}`}
                </div>
              </div>
              <div className="p-4 flex-1 overflow-auto">
                <div className="text-[12.5px] leading-[1.8] text-cad-text whitespace-pre-wrap">{selMsg.body}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {composing && (
        <ComposeModal
          onClose={() => setComposing(false)}
          currentUser={currentUser}
          officers={officers}
          onSend={handleSend}
        />
      )}
    </div>
  );
}
