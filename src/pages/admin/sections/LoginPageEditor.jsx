import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import {
  AdminPanel, SonButton, SonField, SonIconBtn, SON_INPUT, SON_LABEL, ADMIN,
} from '../AdminKit';
import { MdSave, MdCheckCircle, MdChat, MdLanguage, MdDelete } from 'react-icons/md';

const BG_STYLES = ['Gradient (Deep Blue)', 'Solid Dark', 'Image'];

function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} role="switch" aria-checked={on}
      style={{
        width: 46, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0,
        background: on ? ADMIN.green : ADMIN.borderHi, transition: 'background .2s', position: 'relative', flexShrink: 0,
      }}>
      <span style={{
        position: 'absolute', top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: '50%',
        background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
      }} />
    </button>
  );
}

export default function LoginPageEditor() {
  const { state, dispatch } = useCAD();
  const [draft, setDraft] = useState({ ...state.loginPageConfig });
  const [saved, setSaved] = useState(false);
  const [newDomain, setNewDomain] = useState('');

  const set = (k, v) => { setDraft(d => ({ ...d, [k]: v })); setSaved(false); };
  const save = () => {
    dispatch({ type: 'ADMIN_SET', payload: { key: 'loginPageConfig', value: { ...draft } } });
    setSaved(true);
  };

  const addDomain = () => {
    const d = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '');
    if (!d || draft.customDomains?.includes(d)) return;
    const updated = { ...draft, customDomains: [...(draft.customDomains || []), d] };
    setDraft(updated);
    dispatch({ type: 'ADMIN_SET', payload: { key: 'loginPageConfig', value: updated } });
    setNewDomain('');
  };
  const removeDomain = (domain) => {
    const updated = { ...draft, customDomains: (draft.customDomains || []).filter(x => x !== domain) };
    setDraft(updated);
    dispatch({ type: 'ADMIN_SET', payload: { key: 'loginPageConfig', value: updated } });
  };

  const bgPreview = draft.backgroundStyle === 'Solid Dark'
    ? '#0b0b10'
    : draft.backgroundStyle === 'Image'
      ? 'linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)), repeating-linear-gradient(45deg,#1a2230,#1a2230 12px,#141a26 12px,#141a26 24px)'
      : 'linear-gradient(160deg, #0a1b35 0%, #0e2547 50%, #08101f 100%)';

  return (
    <div style={{ display: 'grid', gap: 16 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16, alignItems: 'start' }}>
      <AdminPanel
        title="Custom Login Page"
        subtitle="Branding shown on your community sign-in screen."
        right={<>
          {saved && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: ADMIN.green }}>
              <MdCheckCircle size={15} /> Saved
            </span>
          )}
          <SonButton variant="red" onClick={save}><MdSave size={16} /> Save Changes</SonButton>
        </>}
      >
        <div style={{ display: 'grid', gap: 14 }}>
          <SonField label="Title">
            <input style={SON_INPUT} value={draft.title} onChange={e => set('title', e.target.value)} />
          </SonField>
          <SonField label="Subtitle">
            <input style={SON_INPUT} value={draft.subtitle} onChange={e => set('subtitle', e.target.value)} />
          </SonField>
          <SonField label="Description">
            <textarea style={{ ...SON_INPUT, minHeight: 80, resize: 'vertical', lineHeight: 1.5 }}
              value={draft.description} onChange={e => set('description', e.target.value)} />
          </SonField>
          <SonField label="Logo URL">
            <input style={SON_INPUT} value={draft.logoUrl} onChange={e => set('logoUrl', e.target.value)} />
          </SonField>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <SonField label="Primary Color">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="color" value={draft.primaryColor} onChange={e => set('primaryColor', e.target.value)}
                  style={{ width: 44, height: 38, padding: 0, border: `1px solid ${ADMIN.border}`, borderRadius: 6, background: ADMIN.bg, cursor: 'pointer' }} />
                <input style={{ ...SON_INPUT, fontFamily: 'var(--font-mono)' }} value={draft.primaryColor}
                  onChange={e => set('primaryColor', e.target.value)} />
              </div>
            </SonField>
            <SonField label="Background Style">
              <select style={SON_INPUT} value={draft.backgroundStyle} onChange={e => set('backgroundStyle', e.target.value)}>
                {BG_STYLES.map(s => <option key={s}>{s}</option>)}
              </select>
            </SonField>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <label style={{ ...SON_LABEL, marginBottom: 2 }}>Show Discord Connect</label>
              <div style={{ fontSize: 12, color: ADMIN.textDim }}>Display a "Connect Discord" button on the login card.</div>
            </div>
            <Toggle on={draft.showDiscordConnect} onClick={() => set('showDiscordConnect', !draft.showDiscordConnect)} />
          </div>
        </div>
      </AdminPanel>

      <AdminPanel title="Live Preview" subtitle="Reflects unsaved changes.">
        <div style={{
          background: bgPreview, borderRadius: 10, padding: '38px 20px',
          display: 'flex', justifyContent: 'center', border: `1px solid ${ADMIN.border}`,
        }}>
          <div style={{
            width: 280, maxWidth: '100%', background: 'rgba(14,16,22,0.92)', backdropFilter: 'blur(4px)',
            border: `1px solid ${ADMIN.border}`, borderRadius: 12, padding: 24, textAlign: 'center',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          }}>
            {draft.logoUrl && (
              <img src={draft.logoUrl} alt="logo"
                style={{ width: 56, height: 56, objectFit: 'contain', margin: '0 auto 14px', display: 'block' }}
                onError={e => { e.currentTarget.style.display = 'none'; }} />
            )}
            <div style={{ fontSize: 17, fontWeight: 700, color: ADMIN.text }}>{draft.title || 'Title'}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: draft.primaryColor, marginTop: 3, letterSpacing: '0.5px' }}>
              {draft.subtitle || 'Subtitle'}
            </div>
            <div style={{ fontSize: 11, color: ADMIN.textDim, marginTop: 12, lineHeight: 1.5 }}>
              {draft.description || 'Description text appears here.'}
            </div>
            {draft.showDiscordConnect && (
              <button style={{
                marginTop: 18, width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none',
                background: draft.primaryColor, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <MdChat size={16} /> Connect Discord
              </button>
            )}
          </div>
        </div>
      </AdminPanel>
    </div>

      <AdminPanel
        title="Custom Domains"
        subtitle="Point your own domain to your CAD login page."
      >
        <div>
          {(draft.customDomains || []).map(domain => (
            <div key={domain} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              background: ADMIN.panel2, borderRadius: 8, marginBottom: 6,
              border: `1px solid ${ADMIN.border}`,
            }}>
              <MdLanguage size={16} style={{ color: ADMIN.textMute, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, fontFamily: 'var(--font-mono)', color: ADMIN.text }}>{domain}</span>
              <SonIconBtn icon={MdDelete} danger title="Remove" onClick={() => removeDomain(domain)} />
            </div>
          ))}
          {(draft.customDomains || []).length === 0 && (
            <div style={{ fontSize: 13, color: ADMIN.textMute, marginBottom: 14 }}>No custom domains configured.</div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              style={{ ...SON_INPUT, flex: 1 }}
              placeholder="cad.yourdomain.com"
              value={newDomain}
              onChange={e => setNewDomain(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addDomain()}
            />
            <SonButton variant="red" onClick={addDomain}>Add Domain</SonButton>
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}
