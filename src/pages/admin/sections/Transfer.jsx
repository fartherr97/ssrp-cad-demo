import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import { AdminPageTitle, AdminPanel, SonButton, SonField, SON_INPUT, ADMIN } from '../AdminKit';
import { MdSwapHoriz, MdWarningAmber, MdDeleteForever } from 'react-icons/md';

// Data slices a full wipe clears (operational data — keeps officers/config/templates
// so the running session and builder stay intact).
const WIPE_TARGETS = [
  'civilians', 'vehicles', 'warrants', 'criminalHistory', 'calls', 'dispatchLog',
  'towLogs', 'activeSessions', 'bannedUsers', 'civilianFlags', 'licensePoints',
  'allReports', 'allRecords', 'auditLog',
];

export default function Transfer() {
  const { state, dispatch } = useCAD();
  const cfg = state.communityConfig || {};
  const toast = useToast();
  const owner = cfg.ownerDiscord || '—';

  const [newOwner, setNewOwner] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const transfer = () => {
    const v = newOwner.trim();
    if (!v) { toast.error('Enter the new owner account.'); return; }
    if (!window.confirm(`Transfer ownership of this CAD from "${owner}" to "${v}"? You will lose owner privileges.`)) return;
    dispatch({ type: 'ADMIN_SET', payload: { key: 'communityConfig', value: { ...cfg, ownerDiscord: v } } });
    toast.success(`Ownership transferred to ${v}.`, { title: 'CAD Transferred' });
    setNewOwner('');
  };

  const deleteCad = () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') return;
    if (!window.confirm('Permanently delete ALL CAD data (civilians, vehicles, calls, reports, records, logs…)? This cannot be undone.')) return;
    WIPE_TARGETS.forEach(t => dispatch({ type: 'WIPE', payload: t }));
    setConfirmText('');
    toast.warning('All CAD data has been wiped.', { title: 'CAD Deleted' });
  };

  return (
    <>
      <AdminPageTitle>
        <span className="inline-flex items-center gap-2"><MdSwapHoriz size={20} className="text-brand-bright" /> Transfer or Delete CAD</span>
      </AdminPageTitle>

      {/* Transfer ownership */}
      <AdminPanel title="Transfer Ownership" subtitle="Hand this CAD over to another account. The new owner gains full administrative control.">
        <div className="max-w-[460px] flex flex-col gap-3">
          <div className="text-[12px]" style={{ color: ADMIN.textDim }}>
            Current owner: <b style={{ color: ADMIN.text }}>{owner}</b>
          </div>
          <SonField label="New Owner Account">
            <input style={SON_INPUT} value={newOwner} placeholder="e.g. newowner#0001"
              onChange={e => setNewOwner(e.target.value)} onKeyDown={e => e.key === 'Enter' && transfer()} />
          </SonField>
          <div>
            <SonButton variant="red" onClick={transfer}><MdSwapHoriz size={16} /> Transfer Ownership</SonButton>
          </div>
        </div>
      </AdminPanel>

      {/* Danger zone */}
      <AdminPanel title="Delete CAD" subtitle="Permanently wipe all operational data from this CAD.">
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <MdWarningAmber size={18} className="text-red-400 mt-0.5 shrink-0" />
          <div className="text-[12px] text-red-300 leading-relaxed">
            <span className="font-bold">Irreversible.</span> This deletes civilians, vehicles, warrants, calls, reports, records, and all logs. Officers, departments, and your templates/config are kept.
          </div>
        </div>
        <div className="max-w-[460px] flex flex-col gap-3">
          <SonField label={'Type "DELETE" to confirm'}>
            <input style={SON_INPUT} value={confirmText} placeholder="DELETE"
              onChange={e => setConfirmText(e.target.value)} />
          </SonField>
          <div>
            <SonButton variant="red" onClick={deleteCad} disabled={confirmText.trim().toUpperCase() !== 'DELETE'}>
              <MdDeleteForever size={16} /> Delete All CAD Data
            </SonButton>
          </div>
        </div>
      </AdminPanel>
    </>
  );
}
