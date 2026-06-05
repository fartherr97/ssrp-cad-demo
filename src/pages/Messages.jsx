import { useState, useMemo, useRef, useEffect } from 'react';
import { useCAD } from '../store/cadStore';
import {
  MdInbox, MdSend, MdSearch, MdClose, MdPerson, MdLock,
  MdArrowBack, MdInfo, MdGroup, MdReply,
} from 'react-icons/md';
import {
  S_PAGE, S_INPUT, S_LABEL, S_FIELD, S_BTN_PRIMARY, S_BTN_SECONDARY,
} from '../constants/styles';

const DISCLAIMER = 'Messages in this system are monitored for security and compliance purposes.';

/* ── Compose modal with multi-recipient support ── */
function ComposeModal({ onClose, currentUser, officers, onSend, onGroupSend }) {
  const [toIds,   setToIds]   = useState(new Set());
  const [subject, setSubject] = useState('');
  const [body,    setBody]    = useState('');
  const [search,  setSearch]  = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return officers.filter(o =>
      o.id !== currentUser?.id &&
      !toIds.has(o.id) &&
      (!q || o.name?.toLowerCase().includes(q) || o.badge?.toLowerCase().includes(q))
    );
  }, [officers, currentUser, search, toIds]);

  const selectedOfficers = officers.filter(o => toIds.has(o.id));

  const addRecipient = (o) => { setToIds(p => new Set([...p, o.id])); setSearch(''); };
  const removeRecipient = (id) => setToIds(p => { const n = new Set(p); n.delete(id); return n; });

  const canSend = toIds.size > 0 && subject.trim() && body.trim();

  const handleSendSeparately = () => {
    if (!canSend) return;
    selectedOfficers.forEach(o => {
      onSend({
        fromName: currentUser?.name || 'Unknown',
        fromBadge: currentUser?.badge || '—',
        fromId: currentUser?.id,
        toName: o.name,
        toId: o.id,
        subject: subject.trim(),
        body: body.trim(),
      });
    });
    onClose();
  };

  const handleGroupSend = () => {
    if (!canSend) return;
    const allIds   = [currentUser?.id, ...selectedOfficers.map(o => o.id)];
    const allNames = [currentUser?.name || 'Unknown', ...selectedOfficers.map(o => o.name)];
    onGroupSend({
      fromName: currentUser?.name || 'Unknown',
      fromBadge: currentUser?.badge || '—',
      fromId: currentUser?.id,
      participantIds: allIds,
      participantNames: allNames,
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
          {/* Recipients */}
          <div className={S_FIELD}>
            <label className={S_LABEL}>To</label>

            {/* Selected recipient chips */}
            {selectedOfficers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedOfficers.map(o => (
                  <div key={o.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-semibold"
                    style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                    <MdPerson size={12} />
                    {o.name}
                    <button type="button" onClick={() => removeRecipient(o.id)}
                      className="text-blue-400/60 hover:text-blue-300 cursor-pointer ml-0.5" style={{ background: 'none', border: 'none' }}>
                      <MdClose size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Search box */}
            <div className="flex items-center gap-2 bg-app-input border border-border-base rounded-lg px-3 py-2 mb-1">
              <MdSearch size={14} className="text-slate-500 shrink-0" />
              <input className="flex-1 bg-transparent text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none"
                placeholder={selectedOfficers.length > 0 ? 'Add another recipient…' : 'Search by name or badge…'}
                value={search}
                onChange={e => setSearch(e.target.value)} />
            </div>
            {search && (
              <div className="bg-app-card border border-border-base rounded-xl overflow-hidden max-h-[150px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="px-3 py-2 text-[11px] text-slate-600">No accounts found</div>
                ) : filtered.map(o => (
                  <button key={o.id} type="button"
                    onClick={() => addRecipient(o)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/[0.06] cursor-pointer text-left transition-colors">
                    <MdPerson size={14} className="text-slate-400 shrink-0" />
                    <span className="text-[12px] text-slate-200">{o.name}</span>
                    <span className="text-[10.5px] text-slate-500 font-mono ml-auto">{o.badge}</span>
                  </button>
                ))}
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
          <div className="flex gap-2 flex-col sm:flex-row">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-bold cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
              Cancel
            </button>
            {/* Send individually * available for 1+ recipients */}
            <button type="button" onClick={handleSendSeparately}
              disabled={!canSend}
              className="press flex-1 py-2.5 rounded-xl text-[12px] font-bold cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
              style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.45)', color: '#60a5fa' }}>
              <MdSend size={13} />
              {toIds.size > 1 ? 'Send to Each' : 'Send'}
            </button>
            {/* Group chat * only available for 2+ recipients */}
            {toIds.size >= 2 && (
              <button type="button" onClick={handleGroupSend}
                disabled={!canSend}
                className="press flex-1 py-2.5 rounded-xl text-[12px] font-bold cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.4)', color: '#22d3ee' }}>
                <MdGroup size={14} /> Group Chat
              </button>
            )}
          </div>

          {toIds.size >= 2 && (
            <div className="text-[10px] text-slate-500 text-center -mt-2">
              <span className="text-cyan-400 font-semibold">Group Chat</span> creates a shared thread all recipients can reply to.
              <span className="text-blue-400 font-semibold"> Send to Each</span> sends separate private messages.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Group thread detail view ── */
function GroupThreadView({ thread, currentUserId, currentUserName, onReply }) {
  const [replyText, setReplyText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.messages.length]);

  const handleSend = () => {
    const text = replyText.trim();
    if (!text) return;
    onReply(thread.id, text);
    setReplyText('');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Thread header */}
      <div className="px-4 py-3 bg-app-card/40 border-b border-border-faint shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.3px] rounded-full border bg-cyan-500/15 text-cyan-400 border-cyan-500/30">
            GROUP THREAD
          </span>
        </div>
        <div className="text-[15px] font-bold mb-1">{thread.subject}</div>
        <div className="flex items-center gap-1 text-[10px] text-cad-dim flex-wrap">
          <MdGroup size={11} />
          {thread.participantNames.join(', ')}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {thread.messages.map((msg, i) => {
          const isMe = String(msg.fromId) === String(currentUserId);
          return (
            <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                <div className={`px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-[1.65] ${
                  isMe
                    ? 'rounded-br-sm bg-brand/25 border border-brand/35 text-white'
                    : 'rounded-bl-sm bg-white/[0.06] border border-white/10 text-cad-text'
                }`}>
                  {msg.body}
                </div>
                <div className={`text-[9px] px-1 flex items-center gap-1.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <span className="font-semibold text-slate-400">{isMe ? 'You' : msg.fromName}</span>
                  <span className="text-slate-600">{msg.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply bar */}
      <div className="shrink-0 border-t border-border-base p-3 flex gap-2 items-end bg-app-toolbar/60">
        <textarea
          className="flex-1 bg-app-input border border-border-base rounded-xl px-3 py-2 text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-brand/60 transition-colors resize-none"
          placeholder="Reply to group…"
          rows={1}
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          style={{ minHeight: 36, maxHeight: 100 }}
        />
        <button type="button" onClick={handleSend} disabled={!replyText.trim()}
          className="flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer disabled:opacity-40 transition-colors shrink-0"
          style={{ background: 'rgba(59,130,246,0.25)', border: '1px solid rgba(59,130,246,0.4)' }}>
          <MdSend size={15} className="text-brand-bright" />
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   MAIN PAGE
════════════════════════════════ */
export default function Messages() {
  const { state, dispatch } = useCAD();
  const { messages, directMessages, groupThreads = [], currentUser, officers } = state;

  const [selectedId,   setSelectedId]   = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'system' | 'direct' | 'group'
  const [composing,    setComposing]    = useState(false);
  const [tab,          setTab]          = useState('inbox');
  const [search,       setSearch]       = useState('');
  const [replyText,    setReplyText]    = useState('');

  // Clear any in-progress reply whenever the open message changes.
  useEffect(() => { setReplyText(''); }, [selectedId]);

  // Switching tabs always clears the open message
  const switchTab = (newTab) => {
    setTab(newTab);
    setSelectedId(null);
    setSelectedType(null);
  };

  // Inbox: system + direct-to-me + group threads I'm in
  const inbox = useMemo(() => {
    const sys = messages.map(m => ({ ...m, type: 'system' }));
    const dir = directMessages
      .filter(m => String(m.toId) === String(currentUser?.id))
      .map(m => ({ ...m }));
    const groups = groupThreads
      .filter(t => t.participantIds.some(id => String(id) === String(currentUser?.id)))
      .map(t => ({
        ...t,
        subject: t.subject,
        timestamp: t.messages.at(-1)?.timestamp || t.createdAt,
        read: (t.readBy || []).some(id => String(id) === String(currentUser?.id)),
        from: t.messages.at(-1)?.fromName || '',
      }));
    return [...sys, ...dir, ...groups]
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
  }, [messages, directMessages, groupThreads, currentUser, search]);

  const sent = useMemo(() => {
    const dir = directMessages
      .filter(m => String(m.fromId) === String(currentUser?.id))
      .filter(m => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return m.subject?.toLowerCase().includes(q) || m.toName?.toLowerCase().includes(q);
      });
    const groups = groupThreads
      .filter(t => String(t.createdBy) === String(currentUser?.id))
      .map(t => ({ ...t, timestamp: t.createdAt }));
    return [...dir, ...groups].sort((a, b) => b.id?.toString().localeCompare?.(a.id?.toString()) || 0);
  }, [directMessages, groupThreads, currentUser, search]);

  const list   = tab === 'inbox' ? inbox : sent;
  const unread = inbox.filter(m => !m.read).length;

  const selMsg = useMemo(() => {
    if (selectedId == null) return null;
    if (selectedType === 'system') return messages.find(m => m.id === selectedId);
    if (selectedType === 'group')  return groupThreads.find(t => t.id === selectedId);
    return directMessages.find(m => m.id === selectedId);
  }, [selectedId, selectedType, messages, directMessages, groupThreads]);

  const selectMsg = (m) => {
    const type = m.type === 'system' ? 'system' : m.type === 'group' ? 'group' : 'direct';
    setSelectedId(m.id);
    setSelectedType(type);
    if (!m.read) {
      if (type === 'system') dispatch({ type: 'MARK_MESSAGE_READ', payload: m.id });
      else if (type === 'group') dispatch({ type: 'MARK_GROUP_THREAD_READ', payload: { threadId: m.id, userId: currentUser?.id } });
      else dispatch({ type: 'MARK_DIRECT_MESSAGE_READ', payload: m.id });
    }
  };

  const handleSend = (payload) => dispatch({ type: 'SEND_DIRECT_MESSAGE', payload });
  const handleDirectReply = () => {
    const body = replyText.trim();
    if (!body || !selMsg || selMsg.type === 'system') return;
    const baseSubject = (selMsg.subject || '').replace(/^re:\s*/i, '');
    dispatch({ type: 'SEND_DIRECT_MESSAGE', payload: {
      fromName: currentUser?.name || 'Unknown',
      fromBadge: currentUser?.badge || '—',
      fromId: currentUser?.id,
      toName: selMsg.fromName,
      toId: selMsg.fromId,
      subject: `RE: ${baseSubject}`,
      body,
    }});
    setReplyText('');
  };
  const handleGroupSend = (payload) => dispatch({ type: 'CREATE_GROUP_THREAD', payload });
  const handleGroupReply = (threadId, body) => {
    dispatch({ type: 'SEND_GROUP_REPLY', payload: {
      threadId,
      fromId: currentUser?.id,
      fromName: currentUser?.name || currentUser?.username || 'Unknown',
      body,
    }});
  };

  const BADGE_BASE = 'px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.3px] rounded-full border';
  const TAB_BASE   = 'relative px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.4px] cursor-pointer transition-colors shrink-0';
  const tabCls = (id) => tab === id
    ? `${TAB_BASE} text-brand-bright`
    : `${TAB_BASE} text-slate-500 hover:text-slate-300`;

  return (
    <div className={`${S_PAGE} !p-0 overflow-hidden !gap-0`}>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 bg-app-toolbar/80 backdrop-blur-md border-b border-border-base shrink-0 px-3 pr-4">
        <div className="flex items-end gap-0.5 py-1">
          <button className={tabCls('inbox')} onClick={() => switchTab('inbox')}>
            Inbox
            {unread > 0 && (
              <span className="ml-1.5 text-[9px] bg-brand/20 text-brand-bright rounded-full px-1.5 py-0.5 font-mono">
                {unread}
              </span>
            )}
            {tab === 'inbox' && <span className="absolute -bottom-[1px] left-2 right-2 h-[3px] rounded-full bg-brand" />}
          </button>
          <button className={tabCls('sent')} onClick={() => switchTab('sent')}>
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

      {/* Disclaimer */}
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/[0.06] border-b border-amber-500/20 shrink-0 text-[10.5px] text-amber-400/80">
        <MdInfo size={13} className="shrink-0" />
        {DISCLAIMER}
      </div>

      <div className="flex-1 overflow-hidden flex">

        {/* Left: message list */}
        <div className={`mob-list-panel${selMsg ? ' mob-gone' : ''} flex flex-col w-full md:w-[280px] md:shrink-0 border-r border-border-base overflow-hidden`}>
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
              const isSel  = selectedId === m.id && selectedType === (m.type === 'system' ? 'system' : m.type === 'group' ? 'group' : 'direct');
              const isGroup = m.type === 'group';
              const sender  = m.type === 'system' ? (m.from || 'System')
                : isGroup ? `${m.participantNames?.length || 0} participants`
                : tab === 'sent' ? `→ ${m.toName}` : m.fromName;
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
                    {isGroup ? (
                      <span className={`${BADGE_BASE} bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[8px]`}>GROUP</span>
                    ) : m.type !== 'system' ? (
                      <span className={`${BADGE_BASE} bg-violet-500/20 text-violet-400 border-violet-500/30 text-[8px]`}>DIRECT</span>
                    ) : null}
                    <span className="text-[9px] text-cad-muted font-mono ml-auto">
                      {m.timestamp?.split(' ')[1] || ''}
                    </span>
                  </div>
                  <div className={`text-[11.5px] mb-px truncate ${isRead ? 'font-normal' : 'font-semibold'}`}>{m.subject}</div>
                  <div className="text-[10px] text-cad-dim truncate flex items-center gap-1">
                    {isGroup && <MdGroup size={10} className="shrink-0" />}
                    {sender}
                  </div>
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
          ) : selMsg.type === 'group' ? (
            <GroupThreadView
              thread={selMsg}
              currentUserId={currentUser?.id}
              currentUserName={currentUser?.name}
              onReply={handleGroupReply}
            />
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

              {/* Reply composer — direct messages only (system notices can't be replied to) */}
              {selMsg.type !== 'system' && (
                <div className="shrink-0 border-t border-border-faint p-3 bg-app-card/30">
                  <div className="text-[9.5px] font-bold uppercase tracking-[0.5px] text-slate-600 mb-1.5 px-0.5">
                    Reply to {selMsg.fromName}
                  </div>
                  <div className="flex items-end gap-2">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleDirectReply(); } }}
                      rows={2}
                      placeholder="Write a reply…  (Enter to send, Shift+Enter for new line)"
                      className="flex-1 resize-none bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/20 transition-[border-color,box-shadow]" />
                    <button
                      type="button"
                      onClick={handleDirectReply}
                      disabled={!replyText.trim()}
                      className="press shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-bold cursor-pointer transition-all bg-brand/20 border border-brand/40 text-brand-bright hover:bg-brand/30 disabled:opacity-40 disabled:cursor-not-allowed">
                      <MdSend size={14} /> Send
                    </button>
                  </div>
                </div>
              )}
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
          onGroupSend={handleGroupSend}
        />
      )}
    </div>
  );
}
