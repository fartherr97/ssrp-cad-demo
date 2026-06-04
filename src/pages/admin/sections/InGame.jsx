import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { AdminPageTitle } from '../AdminKit';
import {
  MdApi, MdVisibility, MdVisibilityOff,
  MdContentCopy, MdCheck, MdStorage,
} from 'react-icons/md';

/* ── Copy-to-clipboard button ── */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button type="button" onClick={copy}
      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] cursor-pointer transition-all">
      {copied ? <MdCheck size={14} className="text-green-400" /> : <MdContentCopy size={14} />}
    </button>
  );
}

export default function InGame() {
  const { state } = useCAD();
  const cfg = state.inGameConfig || {};
  const communityId = state.communityConfig?.communityId || 'ssrp';
  const [showKey, setShowKey] = useState(false);

  const masked = '•'.repeat(20);

  return (
    <>
      <AdminPageTitle>
        <span className="inline-flex items-center gap-2">
          <MdApi size={20} className="text-brand-bright" /> In-Game Integration
        </span>
      </AdminPageTitle>

      <div className="flex flex-col gap-4">
        <div className="px-4 py-4 rounded-xl bg-app-elevated border border-border-base text-[12.5px] text-slate-400 leading-relaxed text-center">
          The Web API allows you to update unit locations in real time, trigger PANIC alerts, generate 911 calls, and more * all from in-game.
        </div>

        {/* Community ID row */}
        <div className="flex items-center gap-4 px-4 py-4 rounded-xl bg-app-elevated border border-border-base">
          <div className="w-10 h-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
            <MdStorage size={20} className="text-brand-bright" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500 mb-0.5">Community ID</div>
            <div className="text-[14px] font-bold text-white font-mono">{communityId}</div>
          </div>
          <CopyBtn text={communityId} />
        </div>

        {/* API Key row */}
        <div className="flex items-center gap-4 px-4 py-4 rounded-xl bg-app-elevated border border-border-base">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <span className="text-red-400 text-[18px]">🔑</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500 mb-0.5">API Key</div>
            <div className="text-[13px] font-mono text-slate-300 tracking-[0.15em] truncate">
              {showKey ? cfg.apiKey : masked}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" onClick={() => setShowKey(v => !v)}
              className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-all">
              {showKey ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
            </button>
            {showKey && <CopyBtn text={cfg.apiKey} />}
          </div>
        </div>
      </div>
    </>
  );
}
