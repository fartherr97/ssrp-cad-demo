import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { AdminPanel, SonButton, ADMIN } from '../AdminKit';
import { MdSave, MdCheckCircle, MdAllInclusive } from 'react-icons/md';

export default function Limits() {
  const { state, dispatch } = useCAD();
  const [draft, setDraft] = useState({ ...state.limitsConfig });
  const [saved, setSaved] = useState(false);

  const isUnlimited = !draft.maxCivilianCharacters || draft.maxCivilianCharacters === 0;

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
      <div style={{
        background: ADMIN.panel2, border: `1px solid ${ADMIN.border}`,
        borderRadius: 10, padding: '20px 22px',
      }}>
        <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 700, color: ADMIN.text }}>
          Max Civilian Characters
        </div>
        <div style={{ fontSize: 12, color: ADMIN.textDim, marginBottom: 18, lineHeight: 1.5 }}>
          Maximum number of civilian characters a single user account can create. Set to Unlimited to allow any number.
        </div>

        {/* Unlimited toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isUnlimited}
            onChange={e => setDraft(d => ({ ...d, maxCivilianCharacters: e.target.checked ? 0 : 5 }))}
            style={{ width: 16, height: 16, accentColor: ADMIN.red, cursor: 'pointer' }}
          />
          <MdAllInclusive size={15} style={{ color: isUnlimited ? ADMIN.red : ADMIN.textMute }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: isUnlimited ? ADMIN.red : ADMIN.textDim }}>
            Unlimited
          </span>
        </label>

        {/* Slider — only shown when not unlimited */}
        {!isUnlimited && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <input
                  type="range" min={1} max={50} step={1}
                  value={draft.maxCivilianCharacters || 5}
                  onChange={e => setDraft(d => ({ ...d, maxCivilianCharacters: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: ADMIN.red }}
                />
              </div>
              <div style={{
                minWidth: 42, height: 42, borderRadius: 8, background: ADMIN.panel2,
                border: `1px solid ${ADMIN.border}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 20, fontWeight: 700, color: ADMIN.red, flexShrink: 0,
              }}>
                {draft.maxCivilianCharacters || 5}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: ADMIN.textMute }}>1 (minimum)</span>
              <span style={{ fontSize: 11, color: ADMIN.textMute }}>50 (maximum)</span>
            </div>
          </>
        )}

        {isUnlimited && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 8,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          }}>
            <MdAllInclusive size={16} style={{ color: ADMIN.red, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: ADMIN.text }}>
              Users may create an unlimited number of civilian characters.
            </span>
          </div>
        )}
      </div>
    </AdminPanel>
  );
}
