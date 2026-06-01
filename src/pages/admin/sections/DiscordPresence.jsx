import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import {
  AdminPanel, SonButton, SonField, SON_INPUT, SON_LABEL, ADMIN,
} from '../AdminKit';
import { MdSave, MdCheckCircle } from 'react-icons/md';

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

function ToggleRow({ label, desc, on, onToggle }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
      padding: '13px 0', borderBottom: `1px solid ${ADMIN.border}`,
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: ADMIN.text }}>{label}</div>
        <div style={{ fontSize: 12, color: ADMIN.textDim, marginTop: 2 }}>{desc}</div>
      </div>
      <Toggle on={on} onClick={onToggle} />
    </div>
  );
}

export default function DiscordPresence() {
  const { state, dispatch } = useCAD();
  const [draft, setDraft] = useState({ ...state.discordPresence });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => { setDraft(d => ({ ...d, [k]: v })); setSaved(false); };
  const toggle = k => set(k, !draft[k]);

  const save = () => {
    dispatch({ type: 'ADMIN_SET', payload: { key: 'discordPresence', value: { ...draft } } });
    setSaved(true);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16, alignItems: 'start' }}>
      <AdminPanel
        title="Discord Rich Presence"
        subtitle="Status shown on members' Discord profiles while connected."
        right={<>
          {saved && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: ADMIN.green }}>
              <MdCheckCircle size={15} /> Saved
            </span>
          )}
          <SonButton variant="red" onClick={save}><MdSave size={16} /> Save Changes</SonButton>
        </>}
      >
        <ToggleRow label="Enable Rich Presence" desc="Broadcast CAD activity to connected Discord clients."
          on={draft.enabled} onToggle={() => toggle('enabled')} />

        <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
          <SonField label="Details (Top Line)">
            <input style={SON_INPUT} value={draft.details} onChange={e => set('details', e.target.value)} />
          </SonField>
          <SonField label="State (Bottom Line)">
            <input style={SON_INPUT} value={draft.state} onChange={e => set('state', e.target.value)} />
          </SonField>
          <div style={{ ...SON_LABEL, marginTop: -4, color: ADMIN.textMute, textTransform: 'none', fontWeight: 400, letterSpacing: 0, fontSize: 11 }}>
            Supports placeholders like {'{department}'} and {'{callsign}'}, replaced live per user.
          </div>
          <SonField label="Large Image Key">
            <input style={SON_INPUT} value={draft.largeImage} onChange={e => set('largeImage', e.target.value)} />
          </SonField>
        </div>

        <ToggleRow label="Show Elapsed Time" desc="Display a running on-duty timer in the presence card."
          on={draft.showElapsed} onToggle={() => toggle('showElapsed')} />
      </AdminPanel>

      <AdminPanel title="Live Preview" subtitle="Reflects unsaved changes.">
        <div style={{
          background: 'linear-gradient(160deg, #1a1c22 0%, #14151a 100%)', borderRadius: 10,
          padding: 24, border: `1px solid ${ADMIN.border}`,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: ADMIN.textMute, marginBottom: 12 }}>
            Playing a game
          </div>
          <div style={{
            display: 'flex', gap: 14, alignItems: 'flex-start',
            opacity: draft.enabled ? 1 : 0.45, transition: 'opacity .2s',
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: 10, flexShrink: 0,
              background: `linear-gradient(135deg, ${ADMIN.red}, #8a1410)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: '#fff', textAlign: 'center', padding: 4,
              fontFamily: 'var(--font-mono)', boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            }}>
              {draft.largeImage || 'image'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: ADMIN.text }}>Sonoran CAD</div>
              <div style={{ fontSize: 13, color: ADMIN.text, marginTop: 4 }}>{draft.details || 'Details line'}</div>
              <div style={{ fontSize: 13, color: ADMIN.textDim, marginTop: 2 }}>{draft.state || 'State line'}</div>
              {draft.showElapsed && (
                <div style={{ fontSize: 12, color: ADMIN.textDim, marginTop: 2 }}>00:42:18 elapsed</div>
              )}
            </div>
          </div>
          {!draft.enabled && (
            <div style={{ fontSize: 11, color: ADMIN.amber, marginTop: 14 }}>Rich presence is currently disabled.</div>
          )}
        </div>
      </AdminPanel>
    </div>
  );
}
