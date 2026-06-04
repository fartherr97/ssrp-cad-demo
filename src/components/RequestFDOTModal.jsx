import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCAD } from '../store/cadStore';
import { useToast } from '../contexts/ToastContext';
import {
  MdEngineering, MdClose, MdLocationOn, MdSend,
} from 'react-icons/md';

export const FDOT_ASSIST_TYPES = [
  'Lane / Road Closure',
  'Traffic Control',
  'Vehicle Recovery',
  'Heavy / Commercial Tow',
  'Debris / Hazard Removal',
  'Disabled Vehicle',
  'Roadway Damage / Signage',
  'Other',
];

const PRIORITIES = [
  { val: 1, label: 'P1 * Emergency', color: '#ef4444' },
  { val: 2, label: 'P2 * Urgent',    color: '#f59e0b' },
  { val: 3, label: 'P3 * Routine',   color: '#6b7280' },
];

/*
  RequestFDOTModal * officer-facing form to request FDOT assistance on a scene.
  Self-contained: dispatches ADD_FDOT_REQUEST and toasts on submit.

  Props: { call, officer, onClose }
*/
export default function RequestFDOTModal({ call, officer, onClose }) {
  const { dispatch } = useCAD();
  const toast = useToast();

  const [assistType, setAssistType] = useState(FDOT_ASSIST_TYPES[0]);
  const [location,   setLocation]   = useState(call?.location || '');
  const [postal,     setPostal]     = useState('');
  const [priority,   setPriority]   = useState(call?.priority && call.priority <= 3 ? call.priority : 2);
  const [description, setDescription] = useState('');

  const INPUT = 'w-full bg-[#111e2d] border border-[rgba(255,255,255,0.10)] rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500/60 transition-all';
  const LABEL = 'block text-[11px] font-bold tracking-[0.5px] uppercase text-slate-500 mb-1.5';

  const canSubmit = location.trim() && description.trim();

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    dispatch({
      type: 'ADD_FDOT_REQUEST',
      payload: {
        assistType,
        location: location.trim(),
        postal: postal.trim(),
        priority: Number(priority),
        description: description.trim(),
        callId: call?.id || null,
        callNature: call?.nature || null,
        requestedBy: officer?.name || 'Officer',
        requestedByBadge: officer?.badge || '',
        requestedByUnit: officer?.unitId || '',
      },
    });
    toast.success(`${assistType} requested at ${location.trim()}.`, { title: 'FDOT Requested' });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center anim-overlay-in"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:max-w-[460px] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden anim-sheet-in sm:anim-modal-in max-h-[92dvh]"
        style={{ background: '#0c1929', border: '1px solid rgba(245,158,11,0.35)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 shrink-0">
          <span className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
            style={{ background: 'rgba(245,158,11,0.16)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b' }}>
            <MdEngineering size={20} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-extrabold text-white leading-tight">Request FDOT Assistance</div>
            {call && <div className="text-[11px] text-amber-400/80 font-mono">Call {call.id} · {call.nature}</div>}
          </div>
          <button type="button" onClick={onClose}
            className="press shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
            style={{ background: 'none', border: 'none' }}>
            <MdClose size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="flex flex-col gap-4 p-5 overflow-y-auto">
          <div>
            <label className={LABEL}>Assistance Needed</label>
            <select className={INPUT} value={assistType} onChange={e => setAssistType(e.target.value)}>
              {FDOT_ASSIST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className={LABEL}>Location</label>
            <div className="relative">
              <MdLocationOn size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input className={`${INPUT} pl-9`} value={location} onChange={e => setLocation(e.target.value)}
                placeholder="I-275 SB / Sligh Ave" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Postal (optional)</label>
              <input className={`${INPUT} font-mono`} value={postal} onChange={e => setPostal(e.target.value)} placeholder="e.g. 347" />
            </div>
            <div>
              <label className={LABEL}>Priority</label>
              <select className={INPUT} value={priority} onChange={e => setPriority(e.target.value)}>
                {PRIORITIES.map(p => <option key={p.val} value={p.val}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL}>What's Needed</label>
            <textarea className={INPUT} rows={3} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Brief description * e.g. Overturned semi blocking 2 lanes, need heavy rotator + lane closure." required />
          </div>

          {officer && (
            <div className="text-[11px] text-slate-500">
              Requesting as <span className="text-slate-300 font-semibold">{officer.name}</span>
              {officer.unitId && <span className="font-mono"> · {officer.unitId}</span>}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="press flex-1 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer border border-[rgba(255,255,255,0.1)] bg-white/[0.04] text-slate-400 hover:text-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!canSubmit}
              className="press flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-amber-500 hover:bg-amber-400 text-black transition-colors border-0 disabled:opacity-40">
              <MdSend size={15} /> Send Request
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
