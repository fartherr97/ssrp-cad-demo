import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { AdminPageTitle, AdminPanel, SonButton, ADMIN } from '../AdminKit';
import {
  MdExpandMore, MdExpandLess, MdSave, MdAdd, MdDelete,
  MdWebhook, MdInfoOutline,
} from 'react-icons/md';

/* ── Default webhook config structure ── */
const WEBHOOK_DEFAULTS = [
  {
    id: 'unit_panic',
    label: 'Unit Panic',
    desc: 'Sent when an officer triggers a panic alarm.',
    url: '',
    events: { enabled: true },
  },
  {
    id: 'dispatch_call',
    label: 'Dispatch Call',
    desc: 'Sent when a 911 / dispatch call is created, updated, or closed.',
    url: '',
    events: { new: false, modified: false, removed: false },
  },
  {
    id: '911_call',
    label: '911 Call',
    desc: 'Sent when a civilian files an emergency call.',
    url: '',
    events: { new: false, modified: false, removed: false },
  },
  {
    id: 'bolo',
    label: 'BOLO',
    desc: 'Sent when a BOLO is issued or updated.',
    url: '',
    events: { new: false, modified: false, removed: false },
  },
  {
    id: 'warrant',
    label: 'Warrant',
    desc: 'Sent when a warrant is issued, served, or voided.',
    url: '',
    events: { new: false, modified: false, removed: false },
  },
];

/* Build initial config from state or defaults */
function buildConfig(stored) {
  if (stored && stored.length > 0) return stored;
  return WEBHOOK_DEFAULTS;
}

/* Toggle switch using inline style (avoids Tailwind JIT purge issue) */
function Toggle({ active, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-0 shrink-0 ${active ? 'bg-brand' : 'bg-slate-700'}`}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
        style={{ transform: active ? 'translateX(1.25rem)' : 'translateX(0)' }}
      />
    </button>
  );
}

/* Single webhook row (collapsible) */
function WebhookRow({ hook, onChange, onDelete, isCustom }) {
  const [open, setOpen] = useState(false);

  const setUrl = (url) => onChange({ ...hook, url });
  const setEvent = (key, val) => onChange({ ...hook, events: { ...hook.events, [key]: val } });

  const eventKeys = Object.keys(hook.events);
  const activeCount = eventKeys.filter(k => hook.events[k]).length;

  return (
    <div className="rounded-xl border border-border-base overflow-hidden mb-2 last:mb-0">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-app-elevated hover:bg-white/[0.04] cursor-pointer transition-colors text-left"
      >
        <MdWebhook size={18} className="text-slate-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-slate-200">{hook.label}</div>
          {hook.url
            ? <div className="text-[10.5px] text-slate-500 font-mono truncate mt-0.5">{hook.url}</div>
            : <div className="text-[10.5px] text-slate-600 italic mt-0.5">No webhook URL set</div>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-brand/15 text-brand-bright text-[9px] font-bold tracking-[0.4px]">
              {activeCount} ON
            </span>
          )}
          {open ? <MdExpandLess size={18} className="text-slate-500" /> : <MdExpandMore size={18} className="text-slate-500" />}
        </div>
      </button>

      {/* Expanded body */}
      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-border-faint bg-app-card/40 flex flex-col gap-4">
          {hook.desc && (
            <div className="flex items-start gap-2 text-[11.5px] text-slate-500">
              <MdInfoOutline size={14} className="mt-0.5 shrink-0 text-slate-600" />
              {hook.desc}
            </div>
          )}

          {/* URL input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500 mb-1.5">
              Webhook URL
            </label>
            <input
              className="w-full bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/20 transition-all font-mono"
              placeholder="https://discord.com/api/webhooks/…"
              value={hook.url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>

          {/* Event toggles */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500 mb-2">
              Events
            </label>
            <div className="flex flex-col gap-2.5">
              {eventKeys.map(key => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <span className="text-[12.5px] text-slate-300 capitalize">{key === 'enabled' ? 'Enabled' : key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <Toggle active={hook.events[key]} onChange={val => setEvent(key, val)} />
                </div>
              ))}
            </div>
          </div>

          {isCustom && (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1.5 text-[11px] text-red-400 hover:text-red-300 cursor-pointer transition-colors w-fit"
            >
              <MdDelete size={14} /> Remove webhook
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Custom webhook modal ── */
const CUSTOM_EVENT_OPTIONS = [
  { key: 'new',      label: 'New' },
  { key: 'modified', label: 'Modified' },
  { key: 'removed',  label: 'Removed' },
];

function AddCustomModal({ onAdd, onClose }) {
  const [label, setLabel] = useState('');
  const [url, setUrl]   = useState('');
  const [desc, setDesc] = useState('');

  const submit = () => {
    if (!label.trim()) return;
    onAdd({
      id: `custom_${Date.now()}`,
      label: label.trim(),
      desc: desc.trim(),
      url,
      events: { new: false, modified: false, removed: false },
      custom: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-app-card border border-border-strong rounded-2xl w-full max-w-[440px] shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-faint">
          <div className="text-[14px] font-bold text-white">Add Custom Webhook</div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 cursor-pointer">✕</button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500 mb-1.5">Label *</label>
            <input className="w-full bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-brand/60"
              placeholder="e.g. Police Record" value={label} onChange={e => setLabel(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500 mb-1.5">Description</label>
            <input className="w-full bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-brand/60"
              placeholder="Brief description of this webhook" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500 mb-1.5">Webhook URL</label>
            <input className="w-full bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 placeholder:text-slate-600 font-mono outline-none focus:border-brand/60"
              placeholder="https://discord.com/api/webhooks/…" value={url} onChange={e => setUrl(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 text-[12.5px] font-semibold cursor-pointer hover:bg-white/[0.08] transition-all">Cancel</button>
          <button onClick={submit} disabled={!label.trim()} className="flex-1 py-2.5 rounded-lg bg-brand hover:bg-brand-bright text-white text-[12.5px] font-bold cursor-pointer transition-all disabled:opacity-40">Add Webhook</button>
        </div>
      </div>
    </div>
  );
}

export default function DiscordIntegration() {
  const { state, dispatch } = useCAD();
  const [hooks, setHooks] = useState(() => buildConfig(state.discordWebhooks));
  const [saved, setSaved] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const save = () => {
    dispatch({ type: 'ADMIN_SET', payload: { key: 'discordWebhooks', value: hooks } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const update = (id, updated) => setHooks(hs => hs.map(h => h.id === id ? updated : h));
  const remove = (id) => setHooks(hs => hs.filter(h => h.id !== id));
  const addCustom = (hook) => setHooks(hs => [...hs, hook]);

  return (
    <>
      <AdminPageTitle right={
        <div className="flex items-center gap-2">
          {saved && <span style={{ color: ADMIN.green, fontSize: 12, fontWeight: 600 }}>Saved!</span>}
          <SonButton variant="red" onClick={save}><MdSave size={15} /> Save</SonButton>
          <SonButton onClick={() => setShowAdd(true)}><MdAdd size={15} /> Add Webhook</SonButton>
        </div>
      }>
        <span className="inline-flex items-center gap-2">
          <MdWebhook size={20} className="text-brand-bright" /> Discord Integration
        </span>
      </AdminPageTitle>

      {/* Info banner */}
      <div className="mb-5 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25">
        <MdInfoOutline size={16} className="text-indigo-400 mt-0.5 shrink-0" />
        <div className="text-[12px] text-indigo-300 leading-relaxed">
          Enable webhooks to receive real-time alerts in your Discord server. Enter the Discord webhook URL for each category and toggle the events you want to receive.
        </div>
      </div>

      <AdminPanel
        title="Webhooks"
        subtitle="Configure a Discord webhook URL and events for each notification type."
      >
        {hooks.map(hook => (
          <WebhookRow
            key={hook.id}
            hook={hook}
            onChange={updated => update(hook.id, updated)}
            onDelete={() => remove(hook.id)}
            isCustom={!!hook.custom}
          />
        ))}
        {hooks.length === 0 && (
          <div className="text-center py-6 text-[12px] text-slate-500">
            No webhooks configured. Click <strong className="text-slate-300">Add Webhook</strong> to create one.
          </div>
        )}
      </AdminPanel>

      {/* How-to panel */}
      <AdminPanel title="How to get a Webhook URL" subtitle="Step-by-step guide for Discord server owners.">
        <ol className="flex flex-col gap-3">
          {[
            'Open your Discord server and go to Server Settings.',
            'Navigate to Integrations → Webhooks.',
            'Click "New Webhook", give it a name, and select the channel.',
            'Click "Copy Webhook URL" and paste it into the field above.',
            'Toggle the events you want, then click Save.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-brand/15 border border-brand/30 text-brand-bright text-[10px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="text-[12.5px] text-slate-400 leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </AdminPanel>

      {showAdd && <AddCustomModal onAdd={addCustom} onClose={() => setShowAdd(false)} />}
    </>
  );
}
