import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCAD } from '../store/cadStore';
import { useToast } from '../contexts/ToastContext';
import { MdLocalFireDepartment, MdClose, MdLocationOn, MdSend } from 'react-icons/md';

export const HCFR_ASSIST_TYPES = [
  'Medical Assist',
  'Fire Suppression Support',
  'HazMat Response',
  'Rescue / Extrication',
  'Mass Casualty Incident',
  'EMS Standby',
  'Scene Rehab',
  'Burn Investigation',
  'Other',
];

const PRIORITIES = [
  { val: 1, label: 'P1 * Emergency', color: '#ef4444' },
  { val: 2, label: 'P2 * Urgent',    color: '#f59e0b' },
  { val: 3, label: 'P3 * Routine',   color: '#6b7280' },
];

export default function RequestHCFRModal({ call, officer, onClose }) {
  const { dispatch } = useCAD();
  const toast = useToast();

  const [assistType,   setAssistType]   = useState(HCFR_ASSIST_TYPES[0]);
  const [location,     setLocation]     = useState(call?.location || '');
  const [postal,       setPostal]       = useState('');
  const [priority,     setPriority]     = useState(call?.priority && call.priority <= 3 ? call.priority : 1);
  const [description,  setDescription]  = useState('');

  const INPUT = 'w-full bg-[#111e2d] border border-[rgba(255,255,255,0.10)] rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-red-500/60 transition-all';
  const LABEL = 'block text-[11px] font-bold tracking-[0.5px] uppercase text-slate-500 mb-1.5';

  const canSubmit = location.trim() && description.trim();

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    dispatch({
      type: 'ADD_HCFR_REQUEST',
      payload: {
        assistType,
        location:         location.trim(),
        postal:           postal.trim(),
        priority:         Number(priority),
        description:      description.trim(),
        callId:           call?.id || null,
        callNature:       call?.nature || null,
        requestedBy:      officer?.name || 'Officer',
        requestedByBadge: officer?.badge || '',
        requestedByUnit:  officer?.unitId || '',
      },
    });
    toast.success(`${assistType} requested at ${location.trim()}.`, { title: 'HCFR Requested' });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center anim-overlay-in"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:max-w-[460px] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden anim-sheet-in sm:anim-modal-in max-h-[92dvh]"
        style={{ background: '#0c1929', border: '1px solid rgba(239,68,68,0.35)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 shrink-0">
          <span className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
            style={{ background: 'rgba(239,68,68,0.16)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}>
            <MdLocalFireDepartment size={20} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-extrabold text-white leading-tight">Request HCFR Assistance</div>
            {call && <div className="text-[11px] text-red-400/80 font-mono">Call {call.id} · {call.nature}</div>}
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
              {HCFR_ASSIST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className={LABEL}>Location</label>
            <div className="relative">
              <MdLocationOn size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input className={`${INPUT} pl-9`} value={location} onChange={e => setLocation(e.target.value)}
                placeholder="412 Oakwood Ave" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Postal (optional)</label>
              <input className={`${INPUT} font-mono`} value={postal} onChange={e => setPostal(e.target.value)} placeholder="e.g. 348" />
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
              placeholder="Brief description of situation and what you need from HCFR." required />
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
              className="press flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-red-600 hover:bg-red-500 text-white transition-colors border-0 disabled:opacity-40">
              <MdSend size={15} /> Send Request
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
