import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import { AdminPageTitle, AdminPanel, SonButton, SonField, SON_INPUT, ADMIN } from '../AdminKit';
import { MdVerifiedUser, MdLock, MdCheckCircle } from 'react-icons/md';

export default function Authenticate() {
  const { state } = useCAD();
  const cfg = state.communityConfig || {};
  const toast = useToast();
  const owner = cfg.ownerDiscord || '—';

  const [cred, setCred] = useState('');
  const [authed, setAuthed] = useState(false);
  const [until, setUntil] = useState(null);

  const authenticate = () => {
    const v = cred.trim();
    if (!v) { toast.error('Enter your owner credentials.'); return; }
    // Demo: accept the registered owner handle (case-insensitive) as the credential.
    if (v.toLowerCase() !== String(owner).toLowerCase()) {
      toast.error('Credentials do not match the community owner on file.');
      return;
    }
    const expiry = new Date(Date.now() + 15 * 60000);
    setAuthed(true);
    setUntil(expiry);
    setCred('');
    toast.success('Session authenticated for 15 minutes.', { title: 'Verified' });
  };

  return (
    <>
      <AdminPageTitle>
        <span className="inline-flex items-center gap-2"><MdVerifiedUser size={20} className="text-brand-bright" /> Authenticate</span>
      </AdminPageTitle>

      <AdminPanel title="Owner Verification" subtitle="Re-authenticate this session against your community owner credentials before performing sensitive actions.">
        {authed ? (
          <div className="flex items-start gap-3 rounded-xl px-4 py-3.5 border" style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.3)' }}>
            <MdCheckCircle size={20} className="text-green-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-[13px] font-bold text-green-300">Session authenticated</div>
              <div className="text-[11.5px] mt-0.5" style={{ color: ADMIN.textDim }}>
                Verified as <b>{owner}</b> · valid until {until?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
              </div>
              <button type="button" onClick={() => { setAuthed(false); setUntil(null); }}
                className="mt-2.5 text-[11px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
                Lock session
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-[460px] flex flex-col gap-3">
            <div className="text-[12px]" style={{ color: ADMIN.textDim }}>
              Community owner on file: <b style={{ color: ADMIN.text }}>{owner}</b>
            </div>
            <SonField label="Owner Credentials">
              <input style={SON_INPUT} type="text" value={cred} placeholder="Enter the owner account handle"
                onChange={e => setCred(e.target.value)} onKeyDown={e => e.key === 'Enter' && authenticate()} />
            </SonField>
            <div>
              <SonButton variant="red" onClick={authenticate}><MdLock size={15} /> Authenticate</SonButton>
            </div>
          </div>
        )}
      </AdminPanel>
    </>
  );
}
