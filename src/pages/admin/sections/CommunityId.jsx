import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import { AdminPageTitle, AdminPanel, SonButton, SonField, SON_INPUT, ADMIN } from '../AdminKit';
import { MdFingerprint, MdSave, MdContentCopy, MdCheck } from 'react-icons/md';

export default function CommunityId() {
  const { state, dispatch } = useCAD();
  const cfg = state.communityConfig || {};
  const toast = useToast();
  const [id, setId] = useState(cfg.communityId || '');
  const [copied, setCopied] = useState('');

  const clean = id.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  const dirty = clean !== cfg.communityId;

  const save = () => {
    if (!clean) { toast.error('Community ID cannot be empty.'); return; }
    dispatch({ type: 'ADMIN_SET', payload: { key: 'communityConfig', value: { ...cfg, communityId: clean } } });
    toast.success('Community ID updated.');
  };

  const copy = (label, text) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
  };

  const endpoints = [
    { label: 'API Base', url: `https://api.ssrp.us/v1/${clean || 'your-id'}` },
    { label: 'Webhook',  url: `https://api.ssrp.us/v1/${clean || 'your-id'}/hook` },
    { label: 'CAD URL',  url: `https://cad.ssrp.us/${clean || 'your-id'}` },
  ];

  return (
    <>
      <AdminPageTitle right={<SonButton variant="red" onClick={save} disabled={!dirty || !clean}><MdSave size={16} /> {dirty ? 'Save Changes' : 'Saved'}</SonButton>}>
        <span className="inline-flex items-center gap-2"><MdFingerprint size={20} className="text-brand-bright" /> Change Community ID</span>
      </AdminPageTitle>

      <AdminPanel title="Community Identifier" subtitle="Your community's unique CAD identifier. It keys every integration endpoint below.">
        <SonField label="Community ID">
          <input style={SON_INPUT} value={id} onChange={e => setId(e.target.value)} placeholder="e.g. ssrp" />
        </SonField>
        {clean && clean !== id.trim() && (
          <div className="mt-1.5 text-[11px]" style={{ color: ADMIN.textMute }}>Will be saved as <b style={{ color: ADMIN.amber }}>{clean}</b> (lowercase · letters, numbers, hyphens).</div>
        )}
      </AdminPanel>

      <AdminPanel title="Integration Endpoints" subtitle="These update automatically when the Community ID changes.">
        <div className="flex flex-col gap-2">
          {endpoints.map(e => (
            <div key={e.label} className="flex items-center gap-2 rounded-lg px-3 py-2.5 border border-border-base bg-app-card/60">
              <span className="text-[10px] font-bold uppercase tracking-[0.5px] w-20 shrink-0" style={{ color: ADMIN.textMute }}>{e.label}</span>
              <span className="flex-1 min-w-0 truncate font-mono text-[12px]" style={{ color: ADMIN.textDim }}>{e.url}</span>
              <button type="button" onClick={() => copy(e.label, e.url)} title="Copy"
                className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-bold cursor-pointer transition-colors hover:bg-white/[0.08]"
                style={{ color: copied === e.label ? '#4ade80' : ADMIN.textDim }}>
                {copied === e.label ? <><MdCheck size={13} /> Copied</> : <><MdContentCopy size={13} /> Copy</>}
              </button>
            </div>
          ))}
        </div>
      </AdminPanel>
    </>
  );
}
