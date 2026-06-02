import { useState, useEffect } from 'react';
import { useCAD } from '../store/cadStore';
import { useResponsive } from '../hooks/useResponsive';
import {
  MdPhone, MdLocationOn, MdClose, MdAdd, MdRadio,
  MdSend, MdGroup, MdDelete, MdPerson, MdHeadsetMic,
} from 'react-icons/md';

// ─── Shared utilities ──────────────────────────────────────────────────────────

function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function fmtElapsed(ms) {
  const secs = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const P_CFG = {
  1: { label: 'P1', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.30)'  },
  2: { label: 'P2', color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.30)' },
  3: { label: 'P3', color: '#eab308', bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.28)'  },
  4: { label: 'P4', color: '#22c55e', bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.25)'  },
};

const ST_CFG = {
  AVAILABLE:   { label: 'AVAIL',   color: '#22c55e', bg: 'rgba(34,197,94,0.10)'   },
  BUSY:        { label: 'BUSY',    color: '#f97316', bg: 'rgba(249,115,22,0.10)'  },
  ENRT:        { label: 'EN ROUTE',color: '#3b82f6', bg: 'rgba(59,130,246,0.10)'  },
  UNAVAILABLE: { label: 'UNAVAIL', color: '#6b7280', bg: 'rgba(107,114,128,0.08)' },
  OFFDUTY:     { label: 'OFF',     color: '#374151', bg: 'rgba(55,65,81,0.08)'    },
};

const CALL_STATUS_CFG = {
  ACTIVE:  { color: '#22c55e', label: 'ACTIVE'   },
  PENDING: { color: '#f97316', label: 'PENDING'  },
  ENRT:    { color: '#3b82f6', label: 'EN ROUTE' },
  CLOSED:  { color: '#6b7280', label: 'CLOSED'   },
};

const CALL_NATURES = [
  'Domestic Disturbance', 'Suspicious Person/Vehicle', 'Assault in Progress',
  'Robbery in Progress', 'Shots Fired', 'Burglary in Progress',
  'Vehicle Theft', 'Drug Activity', 'Disturbance/Fight',
  'Welfare Check', 'Vehicle Pursuit', 'DUI Driver',
  'Traffic Stop', 'MVA - No Injury', 'MVA w/ Injuries',
  'Noise Complaint', 'Trespassing', 'Warrant Service',
  'Missing Person', 'Theft', 'Vandalism',
  'Medical Emergency', 'Structure Fire', 'Brush Fire',
  'Hazmat Incident', 'Other',
];

const GROUP_COLORS = ['#3a88e8','#22c55e','#f97316','#a855f7','#ec4899','#eab308','#06b6d4','#ef4444'];

// ─── Tiny shared atoms ─────────────────────────────────────────────────────────

function PBadge({ p }) {
  const c = P_CFG[p] || P_CFG[4];
  return (
    <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded shrink-0"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  );
}

function StatusChip({ status }) {
  const c = ST_CFG[status] || ST_CFG.UNAVAILABLE;
  return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded tabular-nums shrink-0"
      style={{ color: c.color, background: c.bg }}>
      {c.label}
    </span>
  );
}

function ElapsedTimer({ receivedAt, now }) {
  const ms = now - receivedAt;
  const mins = ms / 60000;
  const color = mins >= 5 ? '#ef4444' : mins >= 2 ? '#f97316' : '#64748b';
  return (
    <span className="text-[11px] font-mono font-bold tabular-nums shrink-0" style={{ color }}>
      {fmtElapsed(ms)}
    </span>
  );
}

// ─── Modal shell ───────────────────────────────────────────────────────────────

function Modal({ title, icon: Icon, iconColor = '#3a88e8', onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="flex flex-col w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.10)', maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0"
          style={{ background: '#080f18', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            {Icon && <Icon size={15} style={{ color: iconColor }} />}
            <span className="text-[13px] font-extrabold text-white tracking-[-0.2px]">{title}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <MdClose size={18} className="text-slate-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">{children}</div>
        {footer && (
          <div className="flex items-center gap-3 px-5 py-3.5 shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#080f18' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function FieldLabel({ children }) {
  return <div className="text-[9.5px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1.5">{children}</div>;
}

function TextInput({ value, onChange, placeholder, className = '' }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className={`w-full text-[12.5px] text-white rounded-lg px-3 py-2 outline-none ${className}`}
      style={{ background: '#111e2d', border: '1px solid rgba(255,255,255,0.10)' }} />
  );
}

function PriorityRow({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[1,2,3,4].map(p => {
        const c = P_CFG[p];
        const on = value === p;
        return (
          <button key={p} onClick={() => onChange(p)} type="button"
            className="flex-1 py-1.5 rounded-lg text-[12px] font-bold"
            style={{
              cursor: 'pointer',
              background: on ? c.bg  : 'rgba(255,255,255,0.03)',
              border: `1px solid ${on ? c.border : 'rgba(255,255,255,0.07)'}`,
              color: on ? c.color : '#4a5568',
            }}>
            P{p}
          </button>
        );
      })}
    </div>
  );
}

// ─── Incoming 911 card ─────────────────────────────────────────────────────────

function IncomingCard({ call, now, onDispatch }) {
  const ms = now - call.receivedAt;
  const mins = ms / 60000;
  const urgBg     = mins >= 5 ? 'rgba(239,68,68,0.10)' : mins >= 2 ? 'rgba(249,115,22,0.05)' : 'rgba(255,255,255,0.02)';
  const urgBorder = mins >= 5 ? 'rgba(239,68,68,0.32)' : mins >= 2 ? 'rgba(249,115,22,0.22)' : 'rgba(255,255,255,0.07)';
  return (
    <div className="flex flex-col rounded-xl overflow-hidden"
      style={{ background: urgBg, border: `1px solid ${urgBorder}` }}>
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1">
        <PBadge p={call.priority} />
        <span className="text-[12px] font-semibold text-slate-200 truncate flex-1">{call.caller || 'Unknown Caller'}</span>
        <ElapsedTimer receivedAt={call.receivedAt} now={now} />
      </div>
      {call.location && (
        <div className="flex items-center gap-1 px-3 pb-1">
          <MdLocationOn size={10} className="text-slate-600 shrink-0" />
          <span className="text-[11px] text-slate-400 truncate">{call.location}</span>
        </div>
      )}
      <div className="px-3 pb-2">
        <p className="text-[11.5px] text-slate-300 leading-snug line-clamp-2">{call.message}</p>
      </div>
      {call.callbackNumber && (
        <div className="flex items-center gap-1 px-3 pb-1.5">
          <MdPhone size={10} className="text-slate-600 shrink-0" />
          <span className="text-[11px] text-slate-500 font-mono">{call.callbackNumber}</span>
        </div>
      )}
      <button onClick={() => onDispatch(call)} type="button"
        className="flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold"
        style={{ cursor: 'pointer', background: 'rgba(58,136,232,0.13)', borderTop: '1px solid rgba(58,136,232,0.20)', color: '#3a88e8', border: 'none' }}>
        <MdSend size={12} /> DISPATCH
      </button>
    </div>
  );
}

// ─── Active call card ──────────────────────────────────────────────────────────

function ActiveCallCard({ call, now, officers, onAddUnit, onDetachUnit, onClose }) {
  const [open, setOpen] = useState(false);
  const sc = CALL_STATUS_CFG[call.status] || CALL_STATUS_CFG.PENDING;
  const assigned = officers.filter(o => call.units?.includes(o.unitId));
  return (
    <div className="flex flex-col rounded-xl overflow-hidden"
      style={{ background: open ? '#0f1e2f' : 'rgba(255,255,255,0.03)', border: `1px solid ${open ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.07)'}` }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer select-none"
        onClick={() => setOpen(v => !v)}>
        <PBadge p={call.priority} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-bold text-white">{call.nature}</span>
            <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded shrink-0"
              style={{ color: sc.color, background: `${sc.color}1a` }}>
              {sc.label}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <MdLocationOn size={10} className="text-slate-600 shrink-0" />
            <span className="text-[11px] text-slate-400 truncate">{call.location}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] font-mono text-slate-600">#{call.id}</span>
          <ElapsedTimer receivedAt={call.createdAt || Date.now()} now={now} />
        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.25)' }}>
          {call.description && (
            <div className="px-3.5 pt-3 pb-2">
              <p className="text-[11.5px] text-slate-400 leading-relaxed">{call.description}</p>
            </div>
          )}
          <div className="px-3.5 pb-3">
            <div className="text-[9.5px] font-bold uppercase tracking-[0.5px] text-slate-600 mb-2">Assigned Units</div>
            <div className="flex flex-wrap gap-1.5">
              {assigned.length === 0 && <span className="text-[11px] text-slate-600 italic">No units assigned</span>}
              {assigned.map(u => (
                <div key={u.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <span className="font-mono text-slate-200">{u.badge}</span>
                  <button onClick={() => onDetachUnit(call.id, u.unitId)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 1, display: 'flex' }}>
                    <MdClose size={10} className="text-slate-500" />
                  </button>
                </div>
              ))}
              <button onClick={() => onAddUnit(call)} type="button"
                className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px]"
                style={{ cursor: 'pointer', background: 'rgba(58,136,232,0.10)', border: '1px solid rgba(58,136,232,0.22)', color: '#3a88e8' }}>
                <MdAdd size={11} /> Add Unit
              </button>
            </div>
          </div>
          <div className="flex items-center justify-end px-3.5 py-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => onClose(call.id)} type="button"
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg"
              style={{ cursor: 'pointer', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', color: '#ef4444' }}>
              Close Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Unit card ─────────────────────────────────────────────────────────────────

function UnitCard({ unit, groups, onStatusChange }) {
  const [editStatus, setEditStatus] = useState(false);
  const myGroup = groups.find(g => g.units.includes(unit.unitId));
  return (
    <div className="flex flex-col rounded-lg overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[12px] font-bold text-slate-200 truncate">{unit.name}</span>
            <button onClick={() => setEditStatus(v => !v)} type="button"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <StatusChip status={unit.status} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10.5px] font-mono text-slate-500">{unit.badge}</span>
            <span className="text-[10px] text-slate-600">{unit.subdivision}</span>
            {myGroup && (
              <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded"
                style={{ color: myGroup.color, background: `${myGroup.color}18`, border: `1px solid ${myGroup.color}30` }}>
                {myGroup.name}
              </span>
            )}
          </div>
        </div>
        {unit.callId && <span className="text-[10px] font-mono text-slate-600 shrink-0">{unit.callId}</span>}
      </div>
      {editStatus && (
        <div className="px-3 pb-2.5 pt-2 flex flex-wrap gap-1.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.18)' }}>
          <div className="w-full text-[9px] font-bold uppercase tracking-[0.5px] text-slate-700 mb-0.5">Set Status</div>
          {Object.entries(ST_CFG).map(([key, cfg]) => {
            const active = unit.status === key;
            return (
              <button key={key} type="button"
                onClick={() => { onStatusChange(unit.unitId, key); setEditStatus(false); }}
                className="text-[9.5px] font-bold px-2 py-1 rounded"
                style={{ cursor: 'pointer', background: active ? cfg.bg : 'rgba(255,255,255,0.03)', color: active ? cfg.color : '#4a5568', border: `1px solid ${active ? cfg.color + '40' : 'rgba(255,255,255,0.07)'}` }}>
                {cfg.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Group card ────────────────────────────────────────────────────────────────

function GroupCard({ group, officers, onDelete, onRename, onAddUnit, onRemoveUnit }) {
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(group.name);
  const members = officers.filter(o => group.units.includes(o.unitId));

  const commitRename = () => {
    if (nameVal.trim()) onRename(group.id, nameVal.trim());
    setEditing(false);
  };

  return (
    <div className="flex flex-col rounded-xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${group.color}28` }}>
      <div className="flex items-center gap-2 px-3 py-2"
        style={{ background: `${group.color}0d`, borderBottom: `1px solid ${group.color}1a` }}>
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: group.color }} />
        {editing
          ? <input className="flex-1 text-[12px] font-bold bg-transparent outline-none text-white"
              value={nameVal} onChange={e => setNameVal(e.target.value)}
              onBlur={commitRename} onKeyDown={e => e.key === 'Enter' && commitRename()}
              autoFocus />
          : <span className="flex-1 text-[12px] font-bold text-white cursor-text"
              onClick={() => setEditing(true)}>{group.name}</span>
        }
        <span className="text-[10px] text-slate-600 shrink-0">{members.length} units</span>
        <button onClick={() => onDelete(group.id)} type="button"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
          <MdDelete size={14} className="text-slate-700 hover:text-red-400" />
        </button>
      </div>
      <div className="px-3 py-2 flex flex-wrap gap-1.5">
        {members.map(u => (
          <div key={u.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <span className="font-mono text-slate-300">{u.badge}</span>
            <button onClick={() => onRemoveUnit(group.id, u.unitId)} type="button"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 1, display: 'flex' }}>
              <MdClose size={9} className="text-slate-600 hover:text-red-400" />
            </button>
          </div>
        ))}
        <button onClick={() => onAddUnit(group)} type="button"
          className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10.5px]"
          style={{ cursor: 'pointer', background: `${group.color}12`, border: `1px solid ${group.color}28`, color: group.color }}>
          <MdAdd size={11} /> Add
        </button>
      </div>
    </div>
  );
}

// ─── Unit picker (shared by multiple modals) ───────────────────────────────────

function UnitPicker({ officers, selected, onToggle, multi = true }) {
  const eligible = officers.filter(o => o.status !== 'OFFDUTY');
  return (
    <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto">
      {eligible.length === 0 && <span className="text-[11px] text-slate-600 italic">No units available</span>}
      {eligible.map(o => {
        const on = multi ? selected.includes(o.unitId) : selected === o.unitId;
        return (
          <label key={o.id} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
            style={{ background: on ? 'rgba(58,136,232,0.12)' : 'rgba(255,255,255,0.025)', border: `1px solid ${on ? 'rgba(58,136,232,0.28)' : 'rgba(255,255,255,0.06)'}` }}>
            <input type={multi ? 'checkbox' : 'radio'} name="unit-pick"
              checked={on} onChange={() => onToggle(o.unitId)}
              className="accent-blue-500" style={{ width: 13, height: 13 }} />
            <span className="text-[11px] font-mono text-slate-400">{o.badge}</span>
            <span className="text-[12px] text-slate-200 flex-1">{o.name}</span>
            <StatusChip status={o.status} />
          </label>
        );
      })}
    </div>
  );
}

// ─── Dispatch 911 modal ────────────────────────────────────────────────────────

function DispatchModal({ call, officers, onConfirm, onClose }) {
  const [nature, setNature]       = useState('');
  const [customNature, setCustomNature] = useState('');
  const [location, setLocation]   = useState(call?.location || '');
  const [priority, setPriority]   = useState(call?.priority || 2);
  const [units, setUnits]         = useState([]);

  const available = officers.filter(o =>
    o.status !== 'OFFDUTY' && !['HCFR','FDOT'].includes(o.deptShort)
  );

  const toggleUnit = id => setUnits(p => p.includes(id) ? p.filter(u => u !== id) : [...p, id]);

  const finalNature = nature === '__custom__' ? customNature.trim() : nature;
  const canSubmit = !!finalNature;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onConfirm({ nature: finalNature, location, priority, units, description: call.message, reportingParty: call.caller || '911 Caller' });
  };

  return (
    <Modal title="Dispatch 911 Call" icon={MdPhone} iconColor="#ef4444" onClose={onClose}
      footer={
        <>
          <button onClick={onClose} type="button"
            className="flex-1 py-2 rounded-xl text-[12px] font-bold"
            style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#4a5568' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!canSubmit} type="button"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold"
            style={{ cursor: canSubmit ? 'pointer' : 'default', background: canSubmit ? 'rgba(58,136,232,0.18)' : 'rgba(58,136,232,0.05)', border: `1px solid ${canSubmit ? 'rgba(58,136,232,0.38)' : 'rgba(58,136,232,0.08)'}`, color: canSubmit ? '#3a88e8' : '#1e3a50' }}>
            <MdSend size={13} /> Dispatch Call
          </button>
        </>
      }>
      {/* Caller info strip */}
      <div className="flex flex-col gap-1.5 p-3 rounded-xl -mt-1"
        style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.14)' }}>
        <div className="flex items-center gap-2">
          <MdPhone size={11} className="text-red-400 shrink-0" />
          <span className="text-[12px] font-bold text-red-300">{call.caller || 'Unknown Caller'}</span>
          {call.callbackNumber && <span className="text-[11px] text-slate-500 font-mono">{call.callbackNumber}</span>}
        </div>
        <p className="text-[11.5px] text-slate-300 leading-snug">{call.message}</p>
      </div>

      {/* Nature */}
      <div>
        <FieldLabel>Call Type / Nature</FieldLabel>
        <select value={nature} onChange={e => setNature(e.target.value)}
          className="w-full text-[12.5px] text-white rounded-lg px-3 py-2 outline-none"
          style={{ background: '#111e2d', border: '1px solid rgba(255,255,255,0.10)' }}>
          <option value="">Select nature…</option>
          {CALL_NATURES.map(n => <option key={n} value={n}>{n}</option>)}
          <option value="__custom__">Other (type in)</option>
        </select>
        {nature === '__custom__' && (
          <TextInput value={customNature} onChange={setCustomNature}
            placeholder="Enter call nature…" className="mt-2" />
        )}
      </div>

      {/* Location */}
      <div>
        <FieldLabel>Location</FieldLabel>
        <TextInput value={location} onChange={setLocation} placeholder="Address or cross street…" />
      </div>

      {/* Priority */}
      <div>
        <FieldLabel>Priority</FieldLabel>
        <PriorityRow value={priority} onChange={setPriority} />
      </div>

      {/* Units */}
      <div>
        <FieldLabel>Assign Units <span className="normal-case text-slate-600 font-normal">(optional)</span></FieldLabel>
        <UnitPicker officers={available} selected={units} onToggle={toggleUnit} multi />
      </div>
    </Modal>
  );
}

// ─── Simulate 911 modal ────────────────────────────────────────────────────────

function Sim911Modal({ onConfirm, onClose }) {
  const [caller,   setCaller]   = useState('');
  const [callback, setCallback] = useState('');
  const [message,  setMessage]  = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState(2);

  const canSubmit = !!message.trim();

  return (
    <Modal title="Incoming 911 Call" icon={MdPhone} iconColor="#ef4444" onClose={onClose}
      footer={
        <>
          <button onClick={onClose} type="button"
            className="flex-1 py-2 rounded-xl text-[12px] font-bold"
            style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#4a5568' }}>
            Cancel
          </button>
          <button onClick={() => canSubmit && onConfirm({ caller, callbackNumber: callback, message, location, priority })} type="button"
            className="flex-1 py-2 rounded-xl text-[12px] font-bold"
            style={{ cursor: canSubmit ? 'pointer' : 'default', background: canSubmit ? 'rgba(239,68,68,0.14)' : 'rgba(239,68,68,0.04)', border: `1px solid ${canSubmit ? 'rgba(239,68,68,0.32)' : 'rgba(239,68,68,0.09)'}`, color: canSubmit ? '#ef4444' : '#3a1a1a' }}>
            Receive Call
          </button>
        </>
      }>
      <div className="grid grid-cols-2 gap-3 -mt-1">
        <div>
          <FieldLabel>Caller Name</FieldLabel>
          <TextInput value={caller} onChange={setCaller} placeholder="Unknown" />
        </div>
        <div>
          <FieldLabel>Callback #</FieldLabel>
          <TextInput value={callback} onChange={setCallback} placeholder="555-0000" />
        </div>
      </div>
      <div>
        <FieldLabel>Message</FieldLabel>
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          placeholder="What did the caller report?" rows={3}
          className="w-full text-[12.5px] text-white rounded-lg px-3 py-2 outline-none resize-none"
          style={{ background: '#111e2d', border: '1px solid rgba(255,255,255,0.10)' }} />
      </div>
      <div>
        <FieldLabel>Location</FieldLabel>
        <TextInput value={location} onChange={setLocation} placeholder="Address or cross street" />
      </div>
      <div>
        <FieldLabel>Priority</FieldLabel>
        <PriorityRow value={priority} onChange={setPriority} />
      </div>
    </Modal>
  );
}

// ─── Add unit to call modal ────────────────────────────────────────────────────

function AddUnitToCallModal({ call, officers, onConfirm, onClose }) {
  const [sel, setSel] = useState(null);
  const eligible = officers.filter(o => !call.units?.includes(o.unitId) && o.status !== 'OFFDUTY');
  return (
    <Modal title={`Add Unit → ${call.nature}`} icon={MdPerson} onClose={onClose}
      footer={
        <>
          <button onClick={onClose} type="button" className="flex-1 py-2 rounded-xl text-[12px] font-bold"
            style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#4a5568' }}>
            Cancel
          </button>
          <button onClick={() => sel && onConfirm(call.id, sel)} disabled={!sel} type="button"
            className="flex-1 py-2 rounded-xl text-[12px] font-bold"
            style={{ cursor: sel ? 'pointer' : 'default', background: sel ? 'rgba(58,136,232,0.15)' : 'rgba(58,136,232,0.04)', border: `1px solid ${sel ? 'rgba(58,136,232,0.30)' : 'rgba(58,136,232,0.08)'}`, color: sel ? '#3a88e8' : '#1a2d40' }}>
            Assign
          </button>
        </>
      }>
      <UnitPicker officers={eligible} selected={sel} onToggle={id => setSel(id)} multi={false} />
    </Modal>
  );
}

// ─── Add unit to group modal ───────────────────────────────────────────────────

function AddUnitToGroupModal({ group, officers, onConfirm, onClose }) {
  const [sel, setSel] = useState(null);
  const eligible = officers.filter(o => !group.units.includes(o.unitId) && o.status !== 'OFFDUTY');
  return (
    <Modal title={`Add Unit → ${group.name}`} icon={MdGroup} iconColor={group.color} onClose={onClose}
      footer={
        <>
          <button onClick={onClose} type="button" className="flex-1 py-2 rounded-xl text-[12px] font-bold"
            style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#4a5568' }}>
            Cancel
          </button>
          <button onClick={() => sel && onConfirm(sel)} disabled={!sel} type="button"
            className="flex-1 py-2 rounded-xl text-[12px] font-bold"
            style={{ cursor: sel ? 'pointer' : 'default', background: sel ? 'rgba(58,136,232,0.15)' : 'rgba(58,136,232,0.04)', border: `1px solid ${sel ? 'rgba(58,136,232,0.30)' : 'rgba(58,136,232,0.08)'}`, color: sel ? '#3a88e8' : '#1a2d40' }}>
            Add to Group
          </button>
        </>
      }>
      <UnitPicker officers={eligible} selected={sel} onToggle={id => setSel(id)} multi={false} />
    </Modal>
  );
}

// ─── New group modal ───────────────────────────────────────────────────────────

function NewGroupModal({ onConfirm, onClose }) {
  const [name,  setName]  = useState('');
  const [color, setColor] = useState(GROUP_COLORS[0]);
  return (
    <Modal title="New Unit Group" icon={MdGroup} onClose={onClose}
      footer={
        <>
          <button onClick={onClose} type="button" className="flex-1 py-2 rounded-xl text-[12px] font-bold"
            style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#4a5568' }}>
            Cancel
          </button>
          <button onClick={() => name.trim() && onConfirm({ name: name.trim(), color })} type="button"
            className="flex-1 py-2 rounded-xl text-[12px] font-bold"
            style={{ cursor: name.trim() ? 'pointer' : 'default', background: name.trim() ? 'rgba(58,136,232,0.15)' : 'rgba(58,136,232,0.04)', border: `1px solid ${name.trim() ? 'rgba(58,136,232,0.30)' : 'rgba(58,136,232,0.08)'}`, color: name.trim() ? '#3a88e8' : '#1a2d40' }}>
            Create Group
          </button>
        </>
      }>
      <div>
        <FieldLabel>Group Name</FieldLabel>
        <TextInput value={name} onChange={setName} placeholder="e.g. Alpha Patrol, Traffic Unit…" />
      </div>
      <div>
        <FieldLabel>Color</FieldLabel>
        <div className="flex gap-2 flex-wrap">
          {GROUP_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} type="button"
              className="w-7 h-7 rounded-full"
              style={{ cursor: 'pointer', background: c, border: `2px solid ${color === c ? 'white' : 'transparent'}`, boxShadow: color === c ? `0 0 0 1px ${c}` : 'none' }} />
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ─── Column shell ──────────────────────────────────────────────────────────────

function Column({ icon: Icon, iconColor, title, count, countAlert, action, children }) {
  return (
    <div className="flex flex-col min-h-0 rounded-2xl overflow-hidden"
      style={{ background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2 px-3.5 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#080f18' }}>
        {Icon && <Icon size={13} style={{ color: iconColor || '#64748b' }} />}
        <span className="text-[10.5px] font-extrabold uppercase tracking-[0.6px] text-slate-400 flex-1">{title}</span>
        {count !== undefined && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: countAlert && count > 0 ? 'rgba(239,68,68,0.14)' : 'rgba(255,255,255,0.05)', color: countAlert && count > 0 ? '#ef4444' : '#4a5568', border: '1px solid rgba(255,255,255,0.06)' }}>
            {count}
          </span>
        )}
        {action}
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export default function DispatchPortal() {
  const { state, dispatch } = useCAD();
  const { isMobile } = useResponsive();
  const now = useNow();

  const [unitTab,           setUnitTab]           = useState('UNITS');
  const [dispatchTarget,    setDispatchTarget]    = useState(null);
  const [addUnitCallTarget, setAddUnitCallTarget] = useState(null);
  const [addUnitGrpTarget,  setAddUnitGrpTarget]  = useState(null);
  const [showSim911,        setShowSim911]        = useState(false);
  const [showNewGroup,      setShowNewGroup]      = useState(false);

  const { incoming911 = [], calls, officers, unitGroups = [] } = state;
  const activeCalls   = calls.filter(c => c.status !== 'CLOSED');
  const onDutyOfficers = officers.filter(o => o.status !== 'OFFDUTY');

  // ── Store actions ──────────────────────────────────────────────────────────

  const handleDispatch = ({ nature, location, priority, units, description, reportingParty }) => {
    dispatch({ type: 'CREATE_CALL', payload: { nature, location, priority, units, category: 'police', description, reportingParty, city: '', county: '', status: units.length ? 'ACTIVE' : 'PENDING', timestamp: new Date().toISOString().slice(0,16).replace('T',' ') } });
    dispatch({ type: 'REMOVE_INCOMING_911', payload: dispatchTarget.id });
    units.forEach(uid => dispatch({ type: 'SET_UNIT_STATUS', payload: { unitId: uid, status: 'ENRT' } }));
    setDispatchTarget(null);
  };

  const handleSim911 = ({ caller, callbackNumber, message, location, priority }) => {
    dispatch({ type: 'ADD_INCOMING_911', payload: { id: `inc_${Date.now()}`, caller, callbackNumber, message, location, priority, receivedAt: Date.now() } });
    setShowSim911(false);
  };

  const handleAddUnitToCall = (callId, unitId) => {
    dispatch({ type: 'ASSIGN_UNIT', payload: { callId, unitId } });
    setAddUnitCallTarget(null);
  };

  const handleDetachUnit = (callId, unitId) => {
    dispatch({ type: 'DETACH_UNIT', payload: { callId, unitId } });
  };

  const handleCloseCall = callId => {
    dispatch({ type: 'CLOSE_CALL', payload: callId });
  };

  const handleCreateGroup = ({ name, color }) => {
    dispatch({ type: 'ADD_UNIT_GROUP', payload: { id: `grp_${Date.now()}`, name, color, units: [] } });
    setShowNewGroup(false);
  };

  const handleRenameGroup = (id, name) => {
    dispatch({ type: 'UPDATE_UNIT_GROUP', payload: { id, changes: { name } } });
  };

  const handleDeleteGroup = id => {
    dispatch({ type: 'DELETE_UNIT_GROUP', payload: id });
  };

  const handleAddUnitToGroup = unitId => {
    const grp = addUnitGrpTarget;
    dispatch({ type: 'UPDATE_UNIT_GROUP', payload: { id: grp.id, changes: { units: [...grp.units, unitId] } } });
    setAddUnitGrpTarget(null);
  };

  const handleRemoveUnitFromGroup = (groupId, unitId) => {
    const grp = unitGroups.find(g => g.id === groupId);
    if (grp) dispatch({ type: 'UPDATE_UNIT_GROUP', payload: { id: groupId, changes: { units: grp.units.filter(u => u !== unitId) } } });
  };

  const handleStatusChange = (unitId, status) => {
    dispatch({ type: 'SET_UNIT_STATUS', payload: { unitId, status } });
  };

  return (
    <div className="flex flex-col h-full min-h-0" style={{ background: '#0a1520' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#080f18' }}>
        <div className="flex items-center gap-2.5">
          <MdHeadsetMic size={17} style={{ color: '#3aaa44' }} />
          <span className="text-[14px] font-extrabold text-white tracking-[-0.2px]">Dispatch Center</span>
          {incoming911.length > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse"
              style={{ background: 'rgba(239,68,68,0.18)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.32)' }}>
              {incoming911.length} NEW
            </span>
          )}
        </div>
        <button onClick={() => setShowSim911(true)} type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold"
          style={{ cursor: 'pointer', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.22)', color: '#ef4444' }}>
          <MdPhone size={12} /> Simulate 911
        </button>
      </div>

      {/* Three columns */}
      <div className="flex-1 min-h-0 p-4 grid gap-4"
        style={{ gridTemplateColumns: isMobile ? '1fr' : '280px 1fr 260px' }}>

        {/* Col 1 — Incoming 911 */}
        <Column icon={MdPhone} iconColor="#ef4444" title="Incoming 911"
          count={incoming911.length} countAlert>
          {incoming911.length === 0
            ? <div className="flex-1 flex items-center justify-center py-8">
                <span className="text-[11px] text-slate-700 text-center">No incoming calls</span>
              </div>
            : incoming911.map(c => (
              <IncomingCard key={c.id} call={c} now={now} onDispatch={setDispatchTarget} />
            ))
          }
        </Column>

        {/* Col 2 — Active Calls */}
        <Column icon={MdRadio} iconColor="#3aaa44" title="Active Calls" count={activeCalls.length}>
          {activeCalls.length === 0
            ? <div className="flex-1 flex items-center justify-center py-8">
                <span className="text-[11px] text-slate-700">No active calls</span>
              </div>
            : activeCalls.map(c => (
              <ActiveCallCard key={c.id} call={c} now={now} officers={officers}
                onAddUnit={setAddUnitCallTarget}
                onDetachUnit={handleDetachUnit}
                onClose={handleCloseCall} />
            ))
          }
        </Column>

        {/* Col 3 — Units & Groups */}
        <div className="flex flex-col min-h-0 rounded-2xl overflow-hidden"
          style={{ background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Tab bar */}
          <div className="flex shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#080f18' }}>
            {['UNITS','GROUPS'].map(tab => (
              <button key={tab} onClick={() => setUnitTab(tab)} type="button"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.5px]"
                style={{ cursor: 'pointer', background: 'none', border: 'none', color: unitTab === tab ? '#3a88e8' : '#3a4a5a', borderBottom: unitTab === tab ? '2px solid #3a88e8' : '2px solid transparent' }}>
                {tab === 'UNITS' ? <MdPerson size={12} /> : <MdGroup size={12} />}
                {tab}
                <span className="opacity-50 font-normal text-[9px]">
                  ({tab === 'UNITS' ? onDutyOfficers.length : unitGroups.length})
                </span>
              </button>
            ))}
          </div>

          {unitTab === 'UNITS' && (
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
              {onDutyOfficers.map(u => (
                <UnitCard key={u.id} unit={u} groups={unitGroups} onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}

          {unitTab === 'GROUPS' && (
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
              <button onClick={() => setShowNewGroup(true)} type="button"
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold"
                style={{ cursor: 'pointer', background: 'rgba(58,136,232,0.07)', border: '1px dashed rgba(58,136,232,0.22)', color: '#3a88e8' }}>
                <MdAdd size={14} /> New Group
              </button>
              {unitGroups.length === 0 && (
                <p className="text-center text-[11px] text-slate-700 mt-2">
                  No groups yet.
                </p>
              )}
              {unitGroups.map(grp => (
                <GroupCard key={grp.id} group={grp} officers={officers}
                  onDelete={handleDeleteGroup}
                  onRename={handleRenameGroup}
                  onAddUnit={g => setAddUnitGrpTarget(g)}
                  onRemoveUnit={handleRemoveUnitFromGroup} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {dispatchTarget    && <DispatchModal       call={dispatchTarget}    officers={officers} onConfirm={handleDispatch}       onClose={() => setDispatchTarget(null)}    />}
      {showSim911        && <Sim911Modal                                                      onConfirm={handleSim911}         onClose={() => setShowSim911(false)}        />}
      {addUnitCallTarget && <AddUnitToCallModal  call={addUnitCallTarget} officers={officers} onConfirm={handleAddUnitToCall}  onClose={() => setAddUnitCallTarget(null)} />}
      {addUnitGrpTarget  && <AddUnitToGroupModal group={addUnitGrpTarget} officers={officers} onConfirm={handleAddUnitToGroup} onClose={() => setAddUnitGrpTarget(null)}  />}
      {showNewGroup      && <NewGroupModal                                                    onConfirm={handleCreateGroup}    onClose={() => setShowNewGroup(false)}      />}
    </div>
  );
}
