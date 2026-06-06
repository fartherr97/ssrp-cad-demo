import { useRef, useState } from 'react';
import { MdNotifications, MdSos, MdPlayArrow, MdCloudUpload, MdClose, MdCheckCircle } from 'react-icons/md';
import { useCAD } from '../../../store/cadStore';
import { AdminPanel, AdminPageTitle } from '../AdminKit';

function ToneSlot({ icon: Icon, accentColor, label, desc, url, name, onUpload, onClear }) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState(null); // null | 'playing' | 'done'

  const play = () => {
    if (!url) return;
    try {
      const audio = new Audio(url);
      audio.play().then(() => {
        setStatus('playing');
        audio.onended = () => {
          setStatus('done');
          setTimeout(() => setStatus(null), 1800);
        };
      }).catch(() => {});
    } catch (_) {}
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border"
      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accentColor}1a`, border: `1px solid ${accentColor}40` }}>
        <Icon size={22} style={{ color: accentColor }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-white">{label}</div>
        <div className="text-[11.5px] text-slate-500 mt-0.5">{desc}</div>
        {url && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accentColor }} />
            <span className="text-[11px] text-slate-400 font-mono truncate">{name || 'Custom tone'}</span>
          </div>
        )}
        {!url && (
          <div className="text-[11px] text-slate-600 mt-1 italic">No tone uploaded</div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {url && (
          <>
            <button
              onClick={play}
              title="Test tone"
              className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-all"
              style={{
                background: status === 'playing' ? `${accentColor}28` : 'rgba(255,255,255,0.06)',
                border: `1px solid ${status === 'playing' ? accentColor + '55' : 'rgba(255,255,255,0.10)'}`,
                color: status ? accentColor : '#94a3b8',
              }}
            >
              {status === 'done' ? <MdCheckCircle size={16} /> : <MdPlayArrow size={16} />}
            </button>
            <button
              onClick={onClear}
              title="Remove tone"
              className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-all text-slate-600 hover:text-red-400"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <MdClose size={15} />
            </button>
          </>
        )}
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold cursor-pointer transition-all"
          style={{
            background: `${accentColor}16`,
            border: `1px solid ${accentColor}38`,
            color: accentColor,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${accentColor}28`; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${accentColor}16`; }}
        >
          <MdCloudUpload size={15} />
          {url ? 'Replace' : 'Upload'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}

export default function NotificationTones() {
  const { state, dispatch } = useCAD();
  const { audioTones = {} } = state;

  const upload = (slot, file) => {
    const url = URL.createObjectURL(file);
    if (slot === 'toast') {
      if (audioTones.toastUrl) URL.revokeObjectURL(audioTones.toastUrl);
      dispatch({ type: 'SET_TONE', payload: { toastUrl: url, toastName: file.name } });
    } else {
      if (audioTones.panicUrl) URL.revokeObjectURL(audioTones.panicUrl);
      dispatch({ type: 'SET_TONE', payload: { panicUrl: url, panicName: file.name } });
    }
  };

  const clear = (slot) => {
    if (slot === 'toast') {
      if (audioTones.toastUrl) URL.revokeObjectURL(audioTones.toastUrl);
      dispatch({ type: 'SET_TONE', payload: { toastUrl: null, toastName: null } });
    } else {
      if (audioTones.panicUrl) URL.revokeObjectURL(audioTones.panicUrl);
      dispatch({ type: 'SET_TONE', payload: { panicUrl: null, panicName: null } });
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 font-ui">
      <AdminPageTitle>Notification Tones</AdminPageTitle>

      <AdminPanel title="Audio Tones" subtitle="Upload audio cues that play when CAD events occur. MP3, WAV, and OGG are supported.">
        <div className="flex flex-col gap-3">
          <ToneSlot
            icon={MdNotifications}
            accentColor="#3b82f6"
            label="Notification Tone"
            desc="Plays for incoming notification blasts and dispatch radio broadcasts."
            url={audioTones.toastUrl ?? null}
            name={audioTones.toastName ?? null}
            onUpload={file => upload('toast', file)}
            onClear={() => clear('toast')}
          />
          <ToneSlot
            icon={MdSos}
            accentColor="#ef4444"
            label="Panic Tone"
            desc="Plays when any officer triggers a panic alarm, kept separate for immediate urgency."
            url={audioTones.panicUrl ?? null}
            name={audioTones.panicName ?? null}
            onUpload={file => upload('panic', file)}
            onClear={() => clear('panic')}
          />
        </div>
      </AdminPanel>
    </div>
  );
}
