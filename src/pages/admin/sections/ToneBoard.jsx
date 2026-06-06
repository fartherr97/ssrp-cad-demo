import { useRef } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import { AdminPageTitle, AdminPanel, ADMIN, EmptyState } from '../AdminKit';
import { MdGraphicEq, MdPlayArrow, MdNotificationsActive, MdSos } from 'react-icons/md';

export default function ToneBoard() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const { notificationTones = [], audioTones = {} } = state;
  const audioRef = useRef(null);

  const play = (url, name) => {
    if (!url) { toast.warning(`No audio file uploaded for "${name}".`); return; }
    try {
      if (audioRef.current) audioRef.current.pause();
      const a = new Audio(url);
      audioRef.current = a;
      a.play().then(() => toast.info(`Playing ${name}…`))
        .catch(() => toast.error(`Could not play "${name}" — file unavailable.`));
    } catch { toast.error(`Could not play "${name}".`); }
  };

  const toggleEnabled = (t) => {
    dispatch({ type: 'ADMIN_UPDATE', payload: { key: 'notificationTones', item: { id: t.id, enabled: !t.enabled } } });
  };

  // Uploaded tones (from Notification Tones) double as quick pads.
  const uploaded = [
    { id: 'u-toast', name: audioTones.toastName || 'Toast Tone', event: 'General notification', url: audioTones.toastUrl, Icon: MdNotificationsActive },
    { id: 'u-panic', name: audioTones.panicName || 'Panic Tone', event: 'Officer panic', url: audioTones.panicUrl, Icon: MdSos },
  ].filter(t => t.url);

  return (
    <>
      <AdminPageTitle>
        <span className="inline-flex items-center gap-2"><MdGraphicEq size={20} className="text-brand-bright" /> Tone Board</span>
      </AdminPageTitle>

      <AdminPanel title="Dispatch Tones" subtitle="Tap a pad to page units / stations. Toggle which tones are active for live dispatch.">
        {notificationTones.length === 0 ? (
          <EmptyState>No tones configured. Add audio in Notification Tones.</EmptyState>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {notificationTones.map(t => (
              <div key={t.id} className="rounded-xl border bg-app-card/60 p-3 flex flex-col gap-2.5"
                style={{ borderColor: t.enabled ? 'rgba(61,130,240,0.35)' : 'rgba(255,255,255,0.08)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold truncate" style={{ color: ADMIN.text }}>{t.name}</div>
                    <div className="text-[11px]" style={{ color: ADMIN.textMute }}>{t.event}</div>
                  </div>
                  <button type="button" onClick={() => toggleEnabled(t)} title={t.enabled ? 'Active' : 'Disabled'}
                    className="shrink-0 text-[9px] font-bold uppercase tracking-[0.4px] px-2 py-0.5 rounded-full border cursor-pointer transition-colors"
                    style={t.enabled
                      ? { color: '#4ade80', background: 'rgba(34,197,94,0.12)', borderColor: 'rgba(34,197,94,0.35)' }
                      : { color: '#94a3b8', background: 'transparent', borderColor: 'rgba(255,255,255,0.12)' }}>
                    {t.enabled ? 'Active' : 'Off'}
                  </button>
                </div>
                <button type="button" onClick={() => play(t.url, t.name)} disabled={!t.url}
                  title={t.url ? 'Play tone' : 'No audio file uploaded'}
                  className={`press w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-bold transition-colors ${
                    t.url
                      ? 'cursor-pointer bg-brand/20 border border-brand/40 text-brand-bright hover:bg-brand/30'
                      : 'cursor-not-allowed bg-white/[0.03] border border-white/10 text-slate-600'
                  }`}>
                  <MdPlayArrow size={16} /> {t.url ? 'Play' : 'No Audio'}
                </button>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>

      {uploaded.length > 0 && (
        <AdminPanel title="Uploaded Tones" subtitle="Audio uploaded in Notification Tones.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {uploaded.map(t => (
              <div key={t.id} className="rounded-xl border border-border-base bg-app-card/60 p-3 flex items-center gap-3">
                <t.Icon size={20} className="text-brand-bright shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold truncate" style={{ color: ADMIN.text }}>{t.name}</div>
                  <div className="text-[11px]" style={{ color: ADMIN.textMute }}>{t.event}</div>
                </div>
                <button type="button" onClick={() => play(t.url, t.name)}
                  className="press shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer transition-colors bg-brand/20 border border-brand/40 text-brand-bright hover:bg-brand/30">
                  <MdPlayArrow size={15} /> Play
                </button>
              </div>
            ))}
          </div>
        </AdminPanel>
      )}
    </>
  );
}
