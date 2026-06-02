import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { AdminPanel, SonButton, ADMIN } from '../AdminKit';
import { MdSave, MdCheckCircle } from 'react-icons/md';

export default function Limits() {
  const { state, dispatch } = useCAD();
  const [draft, setDraft] = useState({ ...state.limitsConfig });
  const [saved, setSaved] = useState(false);

  const save = () => {
    dispatch({ type: 'ADMIN_SET', payload: { key: 'limitsConfig', value: { ...draft } } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AdminPanel
      title="User Account Limits"
      subtitle="Control per-user resource limits for your community."
      right={
        <SonButton variant="red" onClick={save}>
          {saved ? <MdCheckCircle size={16} /> : <MdSave size={16} />}
          {saved ? 'Saved!' : 'Save'}
        </SonButton>
      }
    >
      {/* Max Civilian Characters */}
      <div style={{
        background: ADMIN.panel2, border: `1px solid ${ADMIN.border}`,
        borderRadius: 10, padding: '20px 22px',
      }}>
        <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 700, color: ADMIN.text }}>
          Max Civilian Characters
        </div>
        <div style={{ fontSize: 12, color: ADMIN.textDim, marginBottom: 18, lineHeight: 1.5 }}>
          Maximum number of civilian characters a single user account can create.
        </div>

        {/* Slider + value badge row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <input
              type="range" min={1} max={20} step={1}
              value={draft.maxCivilianCharacters}
              onChange={e => setDraft(d => ({ ...d, maxCivilianCharacters: Number(e.target.value) }))}
              style={{ width: '100%', accentColor: ADMIN.red }}
            />
          </div>
          <div style={{
            minWidth: 42, height: 42, borderRadius: 8, background: ADMIN.panel2,
            border: `1px solid ${ADMIN.border}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 20, fontWeight: 700, color: ADMIN.red, flexShrink: 0,
          }}>
            {draft.maxCivilianCharacters}
          </div>
        </div>

        {/* Min / max labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: ADMIN.textMute }}>1 (minimum)</span>
          <span style={{ fontSize: 11, color: ADMIN.textMute }}>20 (maximum)</span>
        </div>
      </div>
    </AdminPanel>
  );
}
