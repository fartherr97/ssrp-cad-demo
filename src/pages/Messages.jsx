import { useState, useMemo, useRef, useEffect } from 'react';
import { useCAD } from '../store/cadStore';
import {
  MdSend, MdSearch, MdClose, MdPerson, MdLock,
  MdArrowBack, MdGroup, MdForum,
} from 'react-icons/md';
import {
  S_PAGE, S_INPUT, S_LABEL, S_FIELD,
} from '../constants/styles';

const COMPOSE_DISCLAIMER = 'Messages in this system are monitored for security and compliance purposes.';

/* Parse our stored "M/D/YYYY h:mm AM" timestamps into a sortable number. */
const tval = (s) => { const t = new Date(s).getTime(); return Number.isNaN(t) ? 0 : t; };

/* ── Compose modal — start a direct conversation or a group chat ── */
function ComposeModal({ onClose, currentUser, officers, onSend, onGroupSend }) {
  const [toIds,    setToIds]    = useState(new Set());
  const [groupName, setGroupName] = useState('');
  const [body,     setBody]     = useState('');
  const [search,   setSearch]   = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return officers.filter(o =>
      o.id !== currentUser?.id &&
      !toIds.has(o.id) &&
      (!q || o.name?.toLowerCase().includes(q) || o.badge?.toLowerCase().includes(q))
    );
  }, [officers, currentUser, search, toIds]);

  const selectedOfficers = officers.filter(o => toIds.has(o.id));
  const isGroup = toIds.size >= 2;

  const addRecipient = (o) => { setToIds(p => new Set([...p, o.id])); setSearch(''); };
  const removeRecipient = (id) => setToIds(p => { const n = new Set(p); n.delete(id); return n; });

  const canSend = toIds.size > 0 && body.trim() && (!isGroup || groupName.trim());

  const handleSend = () => {
    if (!canSend) return;
    if (isGroup) {
      const allIds   = [currentUser?.id, ...selectedOfficers.map(o => o.id)];
      const allNames = [currentUser?.name || 'Unknown', ...selectedOfficers.map(o => o.name)];
      onGroupSend({
        fromName: currentUser?.name || 'Unknown',
        fromBadge: currentUser?.badge || '—',
        fromId: currentUser?.id,
        participantIds: allIds,
        participantNames: allNames,
        subject: groupName.trim(),
        body: body.trim(),
      });
    } else {
      const o = selectedOfficers[0];
      onSend({
        fromName: currentUser?.name || 'Unknown',
        fromBadge: currentUser?.badge || '—',
        fromId: currentUser?.id,
        toName: o.name,
        toId: o.id,
        subject: 'Direct Message',
        body: body.trim(),
      });
    }
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
          <MdForum size={18} className="text-brand-bright shrink-0" />
          <span className="flex-1 text-[14px] font-bold text-white">New Message</span>
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
                onChange={e => setSearch(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                name="dm-recipient-search"
              />
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
            {isGroup && (
              <div className="text-[10px] text-cyan-400 mt-1.5 flex items-center gap-1">
                <MdGroup size={11} /> 2+ recipients — this will start a group chat.
              </div>
            )}
          </div>

          {/* Group name — only for group chats */}
          {isGroup && (
            <div className={S_FIELD}>
              <label className={S_LABEL}>Group Name</label>
              <input className={S_INPUT} placeholder="e.g. Patrol Shift Channel"
                value={groupName} onChange={e => setGroupName(e.target.value)}
                autoComplete="off" spellCheck={false} name="dm-group-name" />
            </div>
          )}

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
            {COMPOSE_DISCLAIMER}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-col sm:flex-row">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-bold cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
              Cancel
            </button>
            <button type="button" onClick={handleSend}
              disabled={!canSend}
              className="press flex-1 py-2.5 rounded-xl text-[12px] font-bold cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
              style={isGroup
                ? { background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.4)', color: '#22d3ee' }
                : { background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.45)', color: '#60a5fa' }}>
              {isGroup ? <><MdGroup size={14} /> Create Group</> : <><MdSend size={13} /> Send</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Chat bubble thread (shared by direct conversations and group threads) ── */
function ChatView({ header, badge, badgeCls, subtitle, messages, currentUserId, onReply, replyPlaceholder }) {
  const [replyText, setReplyText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    const text = replyText.trim();
    if (!text) return;
    onReply(text);
    setReplyText('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 py-3 bg-app-card/40 border-b border-border-faint shrink-0">
        {badge && (
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.3px] rounded-full border ${badgeCls}`}>
              {badge}
            </span>
          </div>
        )}
        <div className="text-[15px] font-bold mb-0.5">{header}</div>
        {subtitle && (
          <div className="flex items-center gap-1 text-[10px] text-cad-dim flex-wrap">{subtitle}</div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
        {messages.map((msg, i) => {
          const isMe = String(msg.fromId) === String(currentUserId);
          return (
            <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                <div className={`px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-[1.65] whitespace-pre-wrap ${
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
      {onReply && (
        <div className="shrink-0 border-t border-border-base p-3 flex gap-2 items-end bg-app-toolbar/60" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <textarea
            className="flex-1 bg-app-input border border-border-base rounded-xl px-3 py-2 text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-brand/60 transition-colors resize-none"
            placeholder={replyPlaceholder || 'Message…'}
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
      )}
    </div>
  );
}

/* ════════════════════════════════
   MAIN PAGE
════════════════════════════════ */
export default function Messages() {
  const { state, dispatch } = useCAD();
  const { directMessages, groupThreads = [], currentUser, officers } = state;

  const [selectedKey, setSelectedKey] = useState(null); // 'direct:<id>' | 'group:<id>' | 'system'
  const [composing,   setComposing]   = useState(false);
  const [search,      setSearch]      = useState('');

  const meId = String(currentUser?.id);

  // ── Build Discord-style conversations from the flat message stores ──
  const conversations = useMemo(() => {
    // Direct messages grouped by the other participant
    const dmMap = new Map();
    directMessages.forEach(m => {
      const fromMe = String(m.fromId) === meId;
      const otherId = fromMe ? m.toId : m.fromId;
      const otherName = fromMe ? m.toName : m.fromName;
      const key = String(otherId);
      if (!dmMap.has(key)) dmMap.set(key, { kind: 'direct', key: `direct:${key}`, otherId, otherName, messages: [] });
      const c = dmMap.get(key);
      c.messages.push(m);
      if (!fromMe && m.fromName) c.otherName = m.fromName; // prefer their display name
    });
    const directConvos = [...dmMap.values()].map(c => {
      const msgs = [...c.messages].sort((a, b) => tval(a.timestamp) - tval(b.timestamp));
      const last = msgs.at(-1);
      return {
        ...c, messages: msgs, last,
        preview: last?.body || '',
        ts: tval(last?.timestamp),
        unread: msgs.some(m => String(m.toId) === meId && !m.read),
      };
    });

    // Group threads I'm a participant in
    const groupConvos = groupThreads
      .filter(t => t.participantIds.some(id => String(id) === meId))
      .map(t => {
        const last = t.messages.at(-1);
        return {
          kind: 'group', key: `group:${t.id}`, thread: t,
          title: t.subject, last,
          preview: last ? `${String(last.fromId) === meId ? 'You' : last.fromName}: ${last.body}` : '',
          ts: tval(last?.timestamp || t.createdAt),
          unread: !(t.readBy || []).some(id => String(id) === meId),
          participants: t.participantNames,
        };
      });

    const all = [...directConvos, ...groupConvos];
    const q = search.trim().toLowerCase();
    return all
      .filter(c => {
        if (!q) return true;
        return (c.otherName || c.title || '').toLowerCase().includes(q)
          || (c.preview || '').toLowerCase().includes(q);
      })
      .sort((a, b) => b.ts - a.ts);
  }, [directMessages, groupThreads, meId, search]);

  const selected = useMemo(
    () => conversations.find(c => c.key === selectedKey) || null,
    [conversations, selectedKey],
  );

  const totalUnread = conversations.filter(c => c.unread).length;

  const openConversation = (c) => {
    setSelectedKey(c.key);
    if (!c.unread) return;
    if (c.kind === 'direct') {
      c.messages.forEach(m => {
        if (String(m.toId) === meId && !m.read) dispatch({ type: 'MARK_DIRECT_MESSAGE_READ', payload: m.id });
      });
    } else if (c.kind === 'group') {
      dispatch({ type: 'MARK_GROUP_THREAD_READ', payload: { threadId: c.thread.id, userId: currentUser?.id } });
    }
  };

  const handleSend = (payload) => dispatch({ type: 'SEND_DIRECT_MESSAGE', payload });
  const handleGroupSend = (payload) => dispatch({ type: 'CREATE_GROUP_THREAD', payload });

  const replyDirect = (convo) => (body) => {
    dispatch({ type: 'SEND_DIRECT_MESSAGE', payload: {
      fromName: currentUser?.name || 'Unknown',
      fromBadge: currentUser?.badge || '—',
      fromId: currentUser?.id,
      toName: convo.otherName,
      toId: convo.otherId,
      subject: 'Direct Message',
      body,
    }});
  };

  const replyGroup = (thread) => (body) => {
    dispatch({ type: 'SEND_GROUP_REPLY', payload: {
      threadId: thread.id,
      fromId: currentUser?.id,
      fromName: currentUser?.name || currentUser?.username || 'Unknown',
      body,
    }});
  };

  const initialOf = (name) => (name || '?').charAt(0).toUpperCase();

  return (
    <div className={`${S_PAGE} !p-0 overflow-hidden !gap-0`}>

      {/* Toolbar */}
      <div className="flex items-center gap-2 bg-app-toolbar/80 backdrop-blur-md border-b border-border-base shrink-0 px-4 py-2.5">
        <MdForum size={17} className="text-brand-bright shrink-0" />
        <span className="text-[13px] font-bold text-white">Direct Messages</span>
        {totalUnread > 0 && (
          <span className="text-[9px] bg-brand/20 text-brand-bright rounded-full px-1.5 py-0.5 font-mono">{totalUnread}</span>
        )}
        <div className="flex-1" />
        <button
          onClick={() => setComposing(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11.5px] font-bold cursor-pointer transition-all shrink-0 bg-brand/20 border border-brand/40 text-brand-bright hover:bg-brand/30">
          <MdSend size={13} /> New Message
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex min-h-0">

        {/* Left: conversation list */}
        <div className={`mob-list-panel${selected ? ' mob-gone' : ''} flex flex-col w-full md:w-[300px] md:shrink-0 border-r border-border-base overflow-hidden min-h-0`}>
          <div className="p-2 border-b border-border-faint shrink-0">
            <div className="flex items-center gap-2 bg-app-input border border-border-base rounded-lg px-3 py-1.5">
              <MdSearch size={13} className="text-slate-500 shrink-0" />
              <input className="flex-1 bg-transparent text-[12px] text-slate-200 placeholder:text-slate-600 outline-none"
                placeholder="Search conversations…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoComplete="off" spellCheck={false} name="dm-convo-search" />
              {search && (
                <button type="button" onClick={() => setSearch('')}
                  className="text-slate-500 hover:text-slate-300 cursor-pointer text-[11px]" style={{ background: 'none', border: 'none' }}>✕</button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-[12px] text-slate-600">
                No conversations yet. Start one with "New Message".
              </div>
            ) : conversations.map(c => {
              const isSel = selectedKey === c.key;
              const title = c.otherName || c.title;
              const Icon = c.kind === 'group' ? MdGroup : null;
              const avatarCls = c.kind === 'group' ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                : 'bg-brand/15 text-brand-bright border-brand/30';
              return (
                <div key={c.key}
                  className={`mx-2 my-[3px] px-2.5 py-2.5 rounded-lg cursor-pointer border transition-colors flex items-center gap-2.5 ${
                    isSel ? 'border-brand/40 bg-brand/15'
                      : c.unread ? 'border-border-base bg-white/[0.03] hover:bg-white/[0.06]'
                      : 'border-transparent hover:bg-white/[0.04]'
                  }`}
                  onClick={() => openConversation(c)}>
                  <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 text-[13px] font-bold ${avatarCls}`}>
                    {Icon ? <Icon size={17} /> : initialOf(title)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[12.5px] truncate ${c.unread ? 'font-bold text-white' : 'font-semibold text-slate-200'}`}>{title}</span>
                      {c.unread && <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 ml-auto" />}
                    </div>
                    <div className="text-[10.5px] text-cad-dim truncate mt-0.5">{c.preview || 'No messages yet'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: conversation detail */}
        <div className={`mob-detail-panel${!selected ? ' mob-gone' : ''} flex-1 flex flex-col min-h-0 overflow-hidden`}>
          <button className="mob-back-btn" onClick={() => setSelectedKey(null)}>
            <MdArrowBack size={14} /> Back to messages
          </button>

          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-cad-muted p-5">
              <MdForum size={40} className="opacity-15" />
              <span className="text-[11px]">Select a conversation to read</span>
            </div>
          ) : selected.kind === 'direct' ? (
            <ChatView
              header={selected.otherName}
              messages={selected.messages}
              currentUserId={currentUser?.id}
              onReply={replyDirect(selected)}
              replyPlaceholder={`Message ${selected.otherName}…`}
            />
          ) : (
            <ChatView
              header={selected.thread.subject}
              badge="GROUP CHAT"
              badgeCls="bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
              subtitle={<><MdGroup size={11} /> {selected.thread.participantNames.join(', ')}</>}
              messages={selected.thread.messages}
              currentUserId={currentUser?.id}
              onReply={replyGroup(selected.thread)}
              replyPlaceholder="Reply to group…"
            />
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
