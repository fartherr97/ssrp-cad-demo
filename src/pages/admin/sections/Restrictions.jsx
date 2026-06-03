import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
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

export default function Restrictions() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const [draft, setDraft] = useState({ ...state.accountRestrictions });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => { setDraft(d => ({ ...d, [k]: v })); setSaved(false); };
  const toggle = k => set(k, !draft[k]);

  const save = () => {
    dispatch({ type: 'ADMIN_SET', payload: { key: 'accountRestrictions', value: {
      ...draft,
      minAccountAgeDays: Number(draft.minAccountAgeDays) || 0,
      autoBanThreshold: Number(draft.autoBanThreshold) || 0,
    } } });
    toast.success('Restrictions saved.');
    setSaved(true);
  };

  return (
    <AdminPanel
      title="User Account Restrictions"
      subtitle="Control who can register and how accounts are gated."
      right={<>
        {saved && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: ADMIN.green }}>
            <MdCheckCircle size={15} /> Saved
          </span>
        )}
        <SonButton variant="red" onClick={save}><MdSave size={16} /> Save Changes</SonButton>
      </>}
    >
      <ToggleRow label="Require Whitelist" desc="Only whitelisted members may access the CAD."
        on={draft.requireWhitelist} onToggle={() => toggle('requireWhitelist')} />
      <ToggleRow label="Require Discord Link" desc="Accounts must link a Discord identity."
        on={draft.requireDiscordLink} onToggle={() => toggle('requireDiscordLink')} />
      <ToggleRow label="Require 2FA" desc="Enforce two-factor authentication on login."
        on={draft.require2FA} onToggle={() => toggle('require2FA')} />
      <ToggleRow label="Block New Registrations" desc="Temporarily prevent new sign-ups."
        on={draft.blockNewRegistrations} onToggle={() => toggle('blockNewRegistrations')} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 18 }}>
        <SonField label="Min Account Age (Days)">
          <input style={SON_INPUT} type="number" value={draft.minAccountAgeDays}
            onChange={e => set('minAccountAgeDays', e.target.value)} />
        </SonField>
        <SonField label="Auto-Ban Threshold">
          <input style={SON_INPUT} type="number" value={draft.autoBanThreshold}
            onChange={e => set('autoBanThreshold', e.target.value)} />
        </SonField>
      </div>
      <div style={{ ...SON_LABEL, marginTop: 8, color: ADMIN.textMute, textTransform: 'none', fontWeight: 400, letterSpacing: 0, fontSize: 11 }}>
        Auto-ban threshold is the number of strikes before an account is automatically banned.
      </div>
    </AdminPanel>
  );
}
