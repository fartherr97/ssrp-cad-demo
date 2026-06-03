import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import {
  AdminPanel, SonButton, SonField, SonIconBtn, SON_INPUT, SON_LABEL, ADMIN,
} from '../AdminKit';
import { MdSave, MdCheckCircle, MdContentCopy } from 'react-icons/md';

/* ── Inline toggle (uses inline styles for dot position as required) ── */
function Toggle({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      style={{
        width: 46, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0,
        background: on ? ADMIN.green : ADMIN.borderHi, transition: 'background .2s',
        position: 'relative', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: '50%',
        background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
      }} />
    </button>
  );
}

/* ── Copy-to-clipboard icon button ── */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <SonIconBtn
      icon={copied ? MdCheckCircle : MdContentCopy}
      onClick={copy}
      color={copied ? ADMIN.green : ADMIN.textDim}
      title="Copy to clipboard"
    />
  );
}

const US_TIMEZONES = [
  { value: 'America/New_York',    label: 'Eastern (EST/EDT) — America/New_York'    },
  { value: 'America/Chicago',     label: 'Central (CST/CDT) — America/Chicago'     },
  { value: 'America/Denver',      label: 'Mountain (MST/MDT) — America/Denver'     },
  { value: 'America/Los_Angeles', label: 'Pacific (PST/PDT) — America/Los_Angeles' },
  { value: 'America/Phoenix',     label: 'Mountain No DST (MST) — America/Phoenix' },
  { value: 'Pacific/Honolulu',    label: 'Hawaii (HST) — Pacific/Honolulu'         },
  { value: 'America/Anchorage',   label: 'Alaska (AKST/AKDT) — America/Anchorage' },
];

export default function CommunityInfo() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const [draft, setDraft] = useState({ ...state.communityConfig });
  const [saved, setSaved] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const set = (k, v) => {
    setDraft(d => ({ ...d, [k]: v }));
    setSaved(false);
    if (k === 'logoUrl') setLogoError(false);
  };

  const save = () => {
    dispatch({ type: 'ADMIN_SET', payload: { key: 'communityConfig', value: { ...draft } } });
    toast.success('Community info saved.');
    setSaved(true);
  };

  const showLogo = draft.logoUrl && !logoError;

  return (
    <AdminPanel
      title="Community Info"
      subtitle="Core identity and branding for your community."
      right={
        <>
          {saved && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: ADMIN.green }}>
              <MdCheckCircle size={15} /> Saved
            </span>
          )}
          <SonButton variant="red" onClick={save}><MdSave size={16} /> Save Changes</SonButton>
        </>
      }
    >
      {/* ── Logo section (full-width) ── */}
      <div style={{ marginBottom: 18 }}>
        <label style={SON_LABEL}>Community Logo</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {/* Preview box */}
          <div style={{
            width: 72, height: 72, borderRadius: 12, flexShrink: 0,
            background: ADMIN.panel2, border: `1px solid ${ADMIN.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            {showLogo ? (
              <img
                src={draft.logoUrl}
                alt="Logo preview"
                onError={() => setLogoError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <span style={{ fontSize: 11, color: ADMIN.textMute, textAlign: 'center', padding: 6, lineHeight: 1.3 }}>
                No<br />Logo
              </span>
            )}
          </div>
          {/* URL input */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              style={SON_INPUT}
              placeholder="https://example.com/logo.png"
              value={draft.logoUrl || ''}
              onChange={e => set('logoUrl', e.target.value)}
            />
            {logoError && draft.logoUrl && (
              <div style={{ marginTop: 4, fontSize: 11, color: ADMIN.amber }}>
                Could not load image — check the URL.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 2-col grid of fields ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>

        {/* Community ID — read-only + copy */}
        <SonField label="Community ID">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              style={{ ...SON_INPUT, flex: 1, fontFamily: 'var(--font-mono)', color: ADMIN.textDim, cursor: 'default' }}
              value={draft.communityId || ''}
              readOnly
            />
            <CopyBtn text={draft.communityId || ''} />
          </div>
        </SonField>

        {/* Community Name */}
        <SonField label="Community Name">
          <input
            style={SON_INPUT}
            value={draft.name || ''}
            onChange={e => set('name', e.target.value)}
          />
        </SonField>

        {/* Subtitle */}
        <SonField label="Subtitle">
          <input
            style={SON_INPUT}
            placeholder="e.g. Serious Roleplay Community"
            value={draft.subtitle || ''}
            onChange={e => set('subtitle', e.target.value)}
          />
        </SonField>

        {/* Voice Command Keyword */}
        <SonField label="Voice Command Keyword">
          <input
            style={SON_INPUT}
            placeholder="e.g. Hey CAD"
            value={draft.voiceCommandKeyword || ''}
            onChange={e => set('voiceCommandKeyword', e.target.value)}
          />
        </SonField>

        {/* Website + enabled toggle */}
        <SonField label="Website">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              style={{ ...SON_INPUT, flex: 1 }}
              placeholder="https://yourcommunity.com"
              value={draft.website || ''}
              onChange={e => set('website', e.target.value)}
            />
            <Toggle on={!!draft.websiteEnabled} onClick={() => set('websiteEnabled', !draft.websiteEnabled)} />
          </div>
        </SonField>

        {/* Discord + enabled toggle */}
        <SonField label="Discord">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              style={{ ...SON_INPUT, flex: 1 }}
              placeholder="https://discord.gg/invite"
              value={draft.discord || ''}
              onChange={e => set('discord', e.target.value)}
            />
            <Toggle on={!!draft.discordEnabled} onClick={() => set('discordEnabled', !draft.discordEnabled)} />
          </div>
        </SonField>

        {/* Timezone select */}
        <SonField label="Timezone">
          <select
            style={{ ...SON_INPUT, cursor: 'pointer', appearance: 'auto' }}
            value={draft.timezone || ''}
            onChange={e => set('timezone', e.target.value)}
          >
            <option value="">— Select Timezone —</option>
            {US_TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </SonField>

        {/* Default Language */}
        <SonField label="Default Language">
          <input
            style={SON_INPUT}
            value={draft.defaultLanguage || ''}
            onChange={e => set('defaultLanguage', e.target.value)}
          />
        </SonField>

        {/* Description — full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <SonField label="Description">
            <textarea
              style={{ ...SON_INPUT, minHeight: 90, resize: 'vertical', lineHeight: 1.5 }}
              value={draft.description || ''}
              onChange={e => set('description', e.target.value)}
            />
          </SonField>
        </div>

      </div>
    </AdminPanel>
  );
}
