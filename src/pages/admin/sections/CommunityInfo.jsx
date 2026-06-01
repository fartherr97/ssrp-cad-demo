import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import {
  AdminPanel, SonButton, SonField, SON_INPUT, ADMIN,
} from '../AdminKit';
import { MdSave, MdCheckCircle } from 'react-icons/md';

export default function CommunityInfo() {
  const { state, dispatch } = useCAD();
  const [draft, setDraft] = useState({ ...state.communityConfig });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => { setDraft(d => ({ ...d, [k]: v })); setSaved(false); };

  const save = () => {
    dispatch({ type: 'ADMIN_SET', payload: { key: 'communityConfig', value: { ...draft, maxCharacters: Number(draft.maxCharacters) || 0 } } });
    setSaved(true);
  };

  return (
    <AdminPanel
      title="Community Info"
      subtitle="Core identity and limits for your community."
      right={<>
        {saved && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: ADMIN.green }}>
            <MdCheckCircle size={15} /> Saved
          </span>
        )}
        <SonButton variant="red" onClick={save}><MdSave size={16} /> Save Changes</SonButton>
      </>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        <SonField label="Community Name">
          <input style={SON_INPUT} value={draft.name} onChange={e => set('name', e.target.value)} />
        </SonField>
        <SonField label="Community ID">
          <input style={SON_INPUT} value={draft.communityId} onChange={e => set('communityId', e.target.value)} />
        </SonField>
        <SonField label="Owner Discord">
          <input style={SON_INPUT} value={draft.ownerDiscord} onChange={e => set('ownerDiscord', e.target.value)} />
        </SonField>
        <SonField label="Timezone">
          <input style={SON_INPUT} value={draft.timezone} onChange={e => set('timezone', e.target.value)} />
        </SonField>
        <SonField label="Default Language">
          <input style={SON_INPUT} value={draft.defaultLanguage} onChange={e => set('defaultLanguage', e.target.value)} />
        </SonField>
        <SonField label="Max Characters">
          <input style={SON_INPUT} type="number" value={draft.maxCharacters} onChange={e => set('maxCharacters', e.target.value)} />
        </SonField>
        <div style={{ gridColumn: '1 / -1' }}>
          <SonField label="Description">
            <textarea
              style={{ ...SON_INPUT, minHeight: 90, resize: 'vertical', lineHeight: 1.5 }}
              value={draft.description}
              onChange={e => set('description', e.target.value)}
            />
          </SonField>
        </div>
      </div>
    </AdminPanel>
  );
}
