import { useState, useMemo, useRef } from 'react';
import { useCAD } from '../store/cadStore';
import { useResponsive } from '../hooks/useResponsive';
import {
  MdWork, MdAdd, MdArrowBack, MdSearch, MdLock, MdEdit, MdClose,
  MdPerson, MdDirectionsCar, MdDelete, MdPersonAdd, MdSend,
  MdFiberManualRecord, MdCheckCircle, MdPauseCircle, MdLockOutline,
  MdRefresh, MdExpandMore, MdTimeline, MdLink, MdFolder, MdNotes,
  MdWarningAmber, MdAssignment, MdCalendarToday, MdBadge,
} from 'react-icons/md';
import { FaUserSecret } from 'react-icons/fa6';

/* ── Constants ──────────────────────────────────────────────────────────── */

const CLASSIFICATIONS = [
  'Homicide', 'Robbery', 'Assault', 'Narcotics', 'Fraud',
  'Theft', 'Burglary', 'Sexual Assault', 'Kidnapping', 'Arson',
  'Cybercrime', 'Human Trafficking', 'Gang Activity', 'Organized Crime', 'Other',
];

const CASE_STATUS_META = {
  ACTIVE:    { label: 'Active',    Icon: MdFiberManualRecord, color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)'  },
  SUSPENDED: { label: 'Suspended', Icon: MdPauseCircle,       color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  CLOSED:    { label: 'Closed',    Icon: MdCheckCircle,       color: '#64748b', bg: 'rgba(100,116,139,0.1)',border: 'rgba(100,116,139,0.3)'},
  LOCKED:    { label: 'Locked',    Icon: MdLock,              color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)'  },
};

const SUBJECT_ROLE_META = {
  SUSPECT:           { label: 'Suspect',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.3)'    },
  VICTIM:            { label: 'Victim',   color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',   border: 'rgba(56,189,248,0.3)'   },
  WITNESS:           { label: 'Witness',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.3)'   },
  PERSON_OF_INTEREST:{ label: 'POI',      color: '#a78bfa', bg: 'rgba(167,139,250,0.1)',  border: 'rgba(167,139,250,0.3)'  },
};

const NOTE_TYPE_META = {
  UPDATE:   { label: 'Update',   color: '#38bdf8' },
  EVIDENCE: { label: 'Evidence', color: '#f59e0b' },
  LEAD:     { label: 'Lead',     color: '#a78bfa' },
  TIP:      { label: 'Tip',      color: '#22c55e' },
};

const PRIORITY_META = {
  1: { label: 'High',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.3)'    },
  2: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.3)'   },
  3: { label: 'Low',    color: '#22c55e', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.3)'    },
};

function fmtDate(ts) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return ts; }
}

function fmtDateTime(ts) {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  } catch { return ts; }
}

/* ── Small badge components ─────────────────────────────────────────────── */

function StatusBadge({ status, size = 'sm' }) {
  const m = CASE_STATUS_META[status] || CASE_STATUS_META.ACTIVE;
  const { Icon } = m;
  return (
    <span className={`inline-flex items-center gap-1 px-2 ${size === 'sm' ? 'py-0.5 text-[10px]' : 'py-1 text-[11px]'} rounded-full font-bold border whitespace-nowrap`}
      style={{ color: m.color, background: m.bg, borderColor: m.border }}>
      <Icon style={{ fontSize: size === 'sm' ? 9 : 11 }} />
      {m.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const m = PRIORITY_META[priority] || PRIORITY_META[3];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap"
      style={{ color: m.color, background: m.bg, borderColor: m.border }}>
      P{priority} · {m.label}
    </span>
  );
}

function SubjectRoleBadge({ role }) {
  const m = SUBJECT_ROLE_META[role] || SUBJECT_ROLE_META.PERSON_OF_INTEREST;
  return (
    <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold border"
      style={{ color: m.color, background: m.bg, borderColor: m.border }}>
      {m.label}
    </span>
  );
}

/* ── Case list item ──────────────────────────────────────────────────────── */

function CaseListItem({ c, active, onClick, officers }) {
  const det = officers.find(o => c.assignedDetectives?.includes(o.id));
  const subjectCount = c.subjects?.length || 0;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-border-faint transition-all duration-150
        ${active ? 'bg-sky-500/[0.08] border-l-[3px] border-l-sky-500' : 'hover:bg-white/[0.03] border-l-[3px] border-l-transparent'}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-mono font-bold text-slate-500">{c.caseNumber}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <PriorityBadge priority={c.priority} />
          <StatusBadge status={c.status} />
        </div>
      </div>
      <div className="text-[13px] font-semibold text-slate-100 leading-snug mb-1.5 line-clamp-2">{c.title}</div>
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-[10.5px] text-slate-500">{c.classification}</span>
        {subjectCount > 0 && (
          <span className="text-[10.5px] text-slate-600">
            <span className="text-slate-500">·</span> {subjectCount} subject{subjectCount !== 1 ? 's' : ''}
          </span>
        )}
        {det && (
          <span className="text-[10.5px] text-slate-600">
            <span className="text-slate-500">·</span> Det. {det.name.split(' ').pop()}
          </span>
        )}
      </div>
    </button>
  );
}

/* ── Create / Edit modal ─────────────────────────────────────────────────── */

function CaseModal({ caseFile, officers, currentUser, onSave, onClose }) {
  const isEdit = !!caseFile;
  const detectives = officers.filter(o =>
    o.subdivision === 'Detectives' || o.rank?.toLowerCase().includes('detective') || o.isDetective === true
  );
  const meId = currentUser?.id;
  const [form, setForm] = useState({
    title: caseFile?.title || '',
    classification: caseFile?.classification || CLASSIFICATIONS[0],
    priority: caseFile?.priority || 2,
    status: caseFile?.status || 'ACTIVE',
    summary: caseFile?.summary || '',
    assignedDetectives: caseFile?.assignedDetectives || (meId ? [meId] : []),
  });

  const toggleDet = (id) => {
    setForm(f => ({
      ...f,
      assignedDetectives: f.assignedDetectives.includes(id)
        ? f.assignedDetectives.filter(x => x !== id)
        : [...f.assignedDetectives, id],
    }));
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave(isEdit ? { ...caseFile, ...form } : form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg bg-app-card border border-border-base rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-faint shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sky-500/15">
              <MdWork size={16} className="text-sky-400" />
            </div>
            <span className="text-[14px] font-bold text-white">{isEdit ? 'Edit Case' : 'New Case File'}</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
            <MdClose size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Case Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Magnolia Blvd Narcotics Investigation"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] bg-app-elevated border border-border-base text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
            />
          </div>

          {/* Classification + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Classification</label>
              <select
                value={form.classification}
                onChange={e => setForm(f => ({ ...f, classification: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-[12.5px] bg-app-elevated border border-border-base text-slate-100 focus:outline-none focus:border-sky-500/50 cursor-pointer"
              >
                {CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Priority</label>
              <div className="flex gap-2">
                {[1, 2, 3].map(p => {
                  const m = PRIORITY_META[p];
                  const active = form.priority === p;
                  return (
                    <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                      className="flex-1 py-2.5 rounded-lg text-[11px] font-bold border transition-all"
                      style={active
                        ? { color: m.color, background: m.bg, borderColor: m.border }
                        : { color: '#64748b', background: 'transparent', borderColor: 'rgba(255,255,255,0.08)' }
                      }>
                      P{p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status (edit only) */}
          {isEdit && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Status</label>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(CASE_STATUS_META).filter(([k]) => k !== 'LOCKED').map(([k, m]) => (
                  <button key={k} onClick={() => setForm(f => ({ ...f, status: k }))}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold border transition-all"
                    style={form.status === k
                      ? { color: m.color, background: m.bg, borderColor: m.border }
                      : { color: '#64748b', background: 'transparent', borderColor: 'rgba(255,255,255,0.08)' }
                    }>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Summary</label>
            <textarea
              rows={4}
              value={form.summary}
              onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
              placeholder="Brief description of the investigation..."
              className="w-full px-3.5 py-2.5 rounded-lg text-[12.5px] bg-app-elevated border border-border-base text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500/50 resize-none leading-relaxed"
            />
          </div>

          {/* Assigned Detectives */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Assigned Detectives</label>
            {detectives.length === 0 ? (
              <div className="text-[12px] text-slate-600 py-2">No detectives in system</div>
            ) : (
              <div className="flex flex-col gap-1">
                {detectives.map(o => {
                  const selected = form.assignedDetectives.includes(o.id);
                  return (
                    <button key={o.id} onClick={() => toggleDet(o.id)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all
                        ${selected ? 'bg-sky-500/10 border-sky-500/30' : 'border-border-faint hover:bg-white/[0.03]'}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0
                        ${selected ? 'bg-sky-500 border-sky-500' : 'border-slate-600'}`}>
                        {selected && <span style={{ fontSize: 10, color: '#fff', fontWeight: 900 }}>✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] font-semibold text-slate-200">{o.name}</div>
                        <div className="text-[10.5px] text-slate-500">{o.rank} · {o.badge} · {o.deptShort}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-border-faint shrink-0">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!form.title.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-[12.5px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'rgba(58,136,232,0.2)', border: '1px solid rgba(58,136,232,0.4)', color: '#3a88e8' }}>
            {isEdit ? <MdEdit size={14} /> : <MdAdd size={14} />}
            {isEdit ? 'Save Changes' : 'Open Case'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Overview tab ────────────────────────────────────────────────────────── */

function OverviewTab({ caseFile, officers, dispatch, canManage, currentUser }) {
  const [editSummary, setEditSummary] = useState(false);
  const [summary, setSummary] = useState(caseFile.summary || '');
  const assignedOfficers = officers.filter(o => caseFile.assignedDetectives?.includes(o.id));
  const creator = officers.find(o => o.id === caseFile.createdBy);
  const isLocked = caseFile.status === 'LOCKED';
  const isClosed = caseFile.status === 'CLOSED';

  const saveSummary = () => {
    dispatch({ type: 'UPDATE_CASE_FILE', payload: { id: caseFile.id, summary } });
    setEditSummary(false);
  };

  const handleStatus = (status) => {
    if (status === 'CLOSED') {
      dispatch({ type: 'CLOSE_CASE_FILE', payload: { id: caseFile.id, closedBy: currentUser?.id } });
    } else if (status === 'LOCKED') {
      dispatch({ type: 'LOCK_CASE_FILE', payload: { id: caseFile.id } });
    } else if (status === 'ACTIVE') {
      dispatch({ type: 'REOPEN_CASE_FILE', payload: { id: caseFile.id } });
    } else {
      dispatch({ type: 'UPDATE_CASE_FILE', payload: { id: caseFile.id, status } });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Case info grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-app-elevated/60 rounded-xl p-3.5 border border-border-faint">
          <div className="text-[9.5px] font-bold uppercase tracking-widest text-slate-600 mb-1">Classification</div>
          <div className="text-[13px] font-semibold text-slate-200">{caseFile.classification}</div>
        </div>
        <div className="bg-app-elevated/60 rounded-xl p-3.5 border border-border-faint">
          <div className="text-[9.5px] font-bold uppercase tracking-widest text-slate-600 mb-1">Opened</div>
          <div className="text-[13px] font-semibold text-slate-200">{fmtDate(caseFile.createdAt)}</div>
        </div>
        {creator && (
          <div className="bg-app-elevated/60 rounded-xl p-3.5 border border-border-faint">
            <div className="text-[9.5px] font-bold uppercase tracking-widest text-slate-600 mb-1">Opened By</div>
            <div className="text-[12.5px] font-semibold text-slate-200 truncate">{creator.name}</div>
            <div className="text-[10px] text-slate-500 font-mono">{creator.badge}</div>
          </div>
        )}
        {(isClosed || isLocked) && caseFile.closedAt && (
          <div className="bg-app-elevated/60 rounded-xl p-3.5 border border-border-faint">
            <div className="text-[9.5px] font-bold uppercase tracking-widest text-slate-600 mb-1">Closed</div>
            <div className="text-[13px] font-semibold text-slate-200">{fmtDate(caseFile.closedAt)}</div>
          </div>
        )}
      </div>

      {/* Assigned Detectives */}
      {assignedOfficers.length > 0 && (
        <div className="bg-app-elevated/60 rounded-xl border border-border-faint overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border-faint">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assigned Detectives</span>
          </div>
          <div className="flex flex-col divide-y divide-border-faint">
            {assignedOfficers.map(o => (
              <div key={o.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="w-7 h-7 rounded-full bg-sky-500/15 flex items-center justify-center shrink-0">
                  <MdBadge size={14} className="text-sky-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold text-slate-200">{o.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{o.rank} · {o.badge}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-app-elevated/60 rounded-xl border border-border-faint overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-faint">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Investigation Summary</span>
          {canManage && !isLocked && !editSummary && (
            <button onClick={() => { setSummary(caseFile.summary || ''); setEditSummary(true); }}
              className="text-[10px] font-medium text-slate-500 hover:text-sky-400 flex items-center gap-1 transition-colors">
              <MdEdit size={12} /> Edit
            </button>
          )}
        </div>
        {editSummary ? (
          <div className="p-4 flex flex-col gap-2">
            <textarea
              rows={5}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-[12.5px] bg-app-bg/50 border border-border-base text-slate-100 focus:outline-none focus:border-sky-500/50 resize-none leading-relaxed"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditSummary(false)}
                className="px-3 py-1.5 rounded-lg text-[11.5px] font-medium text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
              <button onClick={saveSummary}
                className="px-4 py-1.5 rounded-lg text-[11.5px] font-bold transition-colors"
                style={{ background: 'rgba(58,136,232,0.18)', border: '1px solid rgba(58,136,232,0.35)', color: '#3a88e8' }}>
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 text-[12.5px] text-slate-300 leading-relaxed">
            {caseFile.summary || <span className="text-slate-600 italic">No summary provided.</span>}
          </div>
        )}
      </div>

      {/* Status controls */}
      {canManage && !isLocked && (
        <div className="bg-app-elevated/60 rounded-xl border border-border-faint p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">Case Status</div>
          <div className="flex flex-wrap gap-2">
            {caseFile.status !== 'ACTIVE' && (
              <button onClick={() => handleStatus('ACTIVE')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11.5px] font-bold border transition-all"
                style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)' }}>
                <MdRefresh size={13} /> Reopen Active
              </button>
            )}
            {caseFile.status !== 'SUSPENDED' && !isClosed && (
              <button onClick={() => handleStatus('SUSPENDED')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11.5px] font-bold border transition-all"
                style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' }}>
                <MdPauseCircle size={13} /> Suspend
              </button>
            )}
            {!isClosed && (
              <button onClick={() => handleStatus('CLOSED')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11.5px] font-bold border transition-all"
                style={{ color: '#94a3b8', background: 'rgba(100,116,139,0.1)', borderColor: 'rgba(100,116,139,0.3)' }}>
                <MdCheckCircle size={13} /> Close Case
              </button>
            )}
            {(isClosed || caseFile.status === 'SUSPENDED') && (
              <button onClick={() => handleStatus('LOCKED')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11.5px] font-bold border transition-all"
                style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}>
                <MdLock size={13} /> Lock (Supervisor)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Subjects tab ────────────────────────────────────────────────────────── */

function SubjectsTab({ caseFile, civilians, dispatch, canManage }) {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const isLocked = caseFile.status === 'LOCKED';

  const runSearch = (q) => {
    setSearch(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const lq = q.toLowerCase();
    setSearchResults(
      civilians.filter(c =>
        !caseFile.subjects?.some(s => s.civilianId === c.id) &&
        (`${c.firstName} ${c.lastName}`.toLowerCase().includes(lq) ||
          c.dlNumber?.toLowerCase().includes(lq) ||
          c.ssn?.includes(lq))
      ).slice(0, 6)
    );
  };

  const linkedCivs = (caseFile.subjects || []).map(s => ({
    ...s,
    civ: civilians.find(c => c.id === s.civilianId),
  })).filter(s => s.civ);

  const addSubject = (civilianId, role) => {
    dispatch({ type: 'LINK_CASE_SUBJECT', payload: { caseId: caseFile.id, subject: { civilianId, role } } });
    setSearch('');
    setSearchResults([]);
  };

  const removeSubject = (civilianId) => {
    dispatch({ type: 'UNLINK_CASE_SUBJECT', payload: { caseId: caseFile.id, civilianId } });
  };

  const changeRole = (civilianId, role) => {
    const subjects = (caseFile.subjects || []).map(s =>
      s.civilianId === civilianId ? { ...s, role } : s
    );
    dispatch({ type: 'UPDATE_CASE_FILE', payload: { id: caseFile.id, subjects } });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Current subjects */}
      {linkedCivs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-slate-600">
          <MdPerson size={32} className="opacity-20" />
          <span className="text-[12px]">No subjects linked yet</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {linkedCivs.map(({ civ, role }) => (
            <div key={civ.id} className="flex items-center gap-3 bg-app-elevated/60 rounded-xl border border-border-faint px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-slate-700/60 flex items-center justify-center shrink-0">
                <MdPerson size={16} className="text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-slate-100">{civ.firstName} {civ.lastName}</div>
                <div className="text-[10.5px] text-slate-500 font-mono">
                  {civ.dob} · {civ.dlNumber || '—'}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {canManage && !isLocked ? (
                  <select
                    value={role}
                    onChange={e => changeRole(civ.id, e.target.value)}
                    className="text-[10.5px] font-bold px-2 py-1 rounded border bg-app-bg cursor-pointer focus:outline-none"
                    style={{
                      color: SUBJECT_ROLE_META[role]?.color || '#94a3b8',
                      borderColor: SUBJECT_ROLE_META[role]?.border || 'rgba(255,255,255,0.1)',
                      background: SUBJECT_ROLE_META[role]?.bg || 'transparent',
                    }}
                  >
                    {Object.entries(SUBJECT_ROLE_META).map(([k, m]) => (
                      <option key={k} value={k} style={{ color: '#fff', background: '#1e293b' }}>{m.label}</option>
                    ))}
                  </select>
                ) : (
                  <SubjectRoleBadge role={role} />
                )}
                {canManage && !isLocked && (
                  <button onClick={() => removeSubject(civ.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors p-1">
                    <MdDelete size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add subject search */}
      {canManage && !isLocked && (
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Link Subject</div>
          <div className="relative">
            <MdSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, DL #, or SSN..."
              value={search}
              onChange={e => runSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 rounded-lg text-[12px] bg-app-elevated border border-border-base text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="flex flex-col gap-1 bg-app-elevated rounded-xl border border-border-base overflow-hidden">
              {searchResults.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-border-faint last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-slate-200">{c.firstName} {c.lastName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{c.dob} · {c.dlNumber}</div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {Object.entries(SUBJECT_ROLE_META).map(([k, m]) => (
                      <button key={k} onClick={() => addSubject(c.id, k)}
                        className="px-2 py-1 rounded text-[9.5px] font-bold border transition-all hover:opacity-80"
                        style={{ color: m.color, background: m.bg, borderColor: m.border }}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Vehicles tab ────────────────────────────────────────────────────────── */

function VehiclesTab({ caseFile, vehicles, civilians, dispatch, canManage }) {
  const [search, setSearch] = useState('');
  const [note, setNote] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const isLocked = caseFile.status === 'LOCKED';

  const runSearch = (q) => {
    setSearch(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const lq = q.toLowerCase();
    setSearchResults(
      vehicles.filter(v =>
        !caseFile.vehicles?.some(cv => cv.vehicleId === v.id) &&
        (v.plate?.toLowerCase().includes(lq) || `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(lq))
      ).slice(0, 6)
    );
  };

  const linkedVehicles = (caseFile.vehicles || []).map(cv => ({
    ...cv,
    veh: vehicles.find(v => v.id === cv.vehicleId),
  })).filter(cv => cv.veh);

  const addVehicle = (vehicleId) => {
    dispatch({ type: 'LINK_CASE_VEHICLE', payload: { caseId: caseFile.id, vehicle: { vehicleId, note } } });
    setSearch('');
    setNote('');
    setSearchResults([]);
  };

  const removeVehicle = (vehicleId) => {
    dispatch({ type: 'UNLINK_CASE_VEHICLE', payload: { caseId: caseFile.id, vehicleId } });
  };

  return (
    <div className="flex flex-col gap-4">
      {linkedVehicles.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-slate-600">
          <MdDirectionsCar size={32} className="opacity-20" />
          <span className="text-[12px]">No vehicles linked yet</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {linkedVehicles.map(({ veh, vehicleId, note: vNote }) => {
            const owner = veh.ownerId ? civilians.find(c => c.id === veh.ownerId) : null;
            return (
              <div key={vehicleId} className="bg-app-elevated/60 rounded-xl border border-border-faint p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                      <MdDirectionsCar size={14} className="text-sky-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-bold font-mono text-sky-300">{veh.plate}</div>
                      <div className="text-[11px] text-slate-400">{veh.year} {veh.make} {veh.model} · {veh.color}</div>
                      {owner && <div className="text-[10px] text-slate-500">Owner: {owner.firstName} {owner.lastName}</div>}
                    </div>
                  </div>
                  {canManage && !isLocked && (
                    <button onClick={() => removeVehicle(vehicleId)}
                      className="text-slate-600 hover:text-red-400 transition-colors p-1 shrink-0">
                      <MdDelete size={15} />
                    </button>
                  )}
                </div>
                {vNote && <div className="mt-2 text-[11.5px] text-slate-400 pl-9 leading-relaxed">{vNote}</div>}
              </div>
            );
          })}
        </div>
      )}

      {canManage && !isLocked && (
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Link Vehicle</div>
          <div className="relative">
            <MdSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by plate or make / model..."
              value={search}
              onChange={e => runSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 rounded-lg text-[12px] bg-app-elevated border border-border-base text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
            />
          </div>
          <input
            type="text"
            placeholder="Note (optional) — e.g. seen at scene"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg text-[12px] bg-app-elevated border border-border-base text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
          />
          {searchResults.length > 0 && (
            <div className="flex flex-col gap-1 bg-app-elevated rounded-xl border border-border-base overflow-hidden">
              {searchResults.map(v => (
                <button key={v.id} onClick={() => addVehicle(v.id)}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-border-faint last:border-b-0 hover:bg-white/[0.04] text-left transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold font-mono text-sky-300">{v.plate}</div>
                    <div className="text-[10.5px] text-slate-400">{v.year} {v.make} {v.model} · {v.color}</div>
                  </div>
                  <span className="text-[10px] text-sky-400 font-bold shrink-0">+ Link</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Timeline tab ────────────────────────────────────────────────────────── */

function TimelineTab({ caseFile, currentUser, dispatch }) {
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('UPDATE');
  const isLocked = caseFile.status === 'LOCKED';
  const sorted = [...(caseFile.notes || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const submit = () => {
    if (!noteText.trim()) return;
    dispatch({
      type: 'ADD_CASE_NOTE',
      payload: {
        caseId: caseFile.id,
        note: {
          text: noteText.trim(),
          type: noteType,
          authorId: currentUser?.id,
          authorName: currentUser?.name || 'Unknown',
        },
      },
    });
    setNoteText('');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Add note */}
      {!isLocked && (
        <div className="bg-app-elevated/60 rounded-xl border border-border-faint p-4 flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(NOTE_TYPE_META).map(([k, m]) => (
              <button key={k} onClick={() => setNoteType(k)}
                className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all"
                style={noteType === k
                  ? { color: m.color, background: `${m.color}18`, borderColor: `${m.color}40` }
                  : { color: '#475569', background: 'transparent', borderColor: 'rgba(255,255,255,0.07)' }
                }>
                {m.label}
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            placeholder="Add a case note, evidence entry, lead, or tip..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); }}
            className="w-full px-3.5 py-2.5 rounded-lg text-[12.5px] bg-app-bg/50 border border-border-base text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500/50 resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-600">Ctrl+Enter to submit</span>
            <button onClick={submit} disabled={!noteText.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11.5px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'rgba(58,136,232,0.18)', border: '1px solid rgba(58,136,232,0.35)', color: '#3a88e8' }}>
              <MdSend size={12} /> Post Note
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-slate-600">
          <MdTimeline size={32} className="opacity-20" />
          <span className="text-[12px]">No entries yet</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map(n => {
            const meta = NOTE_TYPE_META[n.type] || NOTE_TYPE_META.UPDATE;
            return (
              <div key={n.id} className="flex gap-3 bg-app-elevated/50 rounded-xl border border-border-faint p-3.5">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-2 h-2 rounded-full mt-1" style={{ background: meta.color }} />
                  <div className="w-px flex-1 bg-border-faint" style={{ minHeight: 8 }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                      style={{ color: meta.color, background: `${meta.color}12`, borderColor: `${meta.color}30` }}>
                      {meta.label}
                    </span>
                    <span className="text-[10.5px] font-semibold text-slate-400">{n.authorName}</span>
                    <span className="text-[10px] text-slate-600">{fmtDateTime(n.timestamp)}</span>
                  </div>
                  <div className="text-[12.5px] text-slate-300 leading-relaxed">{n.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Case detail panel ───────────────────────────────────────────────────── */

const DETAIL_TABS = [
  { id: 'OVERVIEW',  label: 'Overview',  Icon: MdNotes        },
  { id: 'SUBJECTS',  label: 'Subjects',  Icon: MdPerson       },
  { id: 'VEHICLES',  label: 'Vehicles',  Icon: MdDirectionsCar},
  { id: 'TIMELINE',  label: 'Timeline',  Icon: MdTimeline     },
];

function CaseDetail({ caseFile, state, dispatch, currentUser, onBack, onEdit }) {
  const [tab, setTab] = useState('OVERVIEW');
  const { isMobile } = useResponsive();
  const officers = state.officers || [];
  const civilians = state.civilians || [];
  const vehicles = state.vehicles || [];

  const canManage = (
    currentUser?.portal === 'admin' ||
    currentUser?.portal === 'supervisor' ||
    (() => { const me = officers.find(o => o.id === currentUser?.id); return me?.subdivision === 'Detectives' || me?.rank?.toLowerCase().includes('detective') || me?.isDetective === true; })() ||
    caseFile.assignedDetectives?.includes(currentUser?.id)
  );

  const subjectCount  = caseFile.subjects?.length || 0;
  const vehicleCount  = caseFile.vehicles?.length || 0;
  const timelineCount = caseFile.notes?.length || 0;

  const tabWithBadge = (t) => {
    if (t.id === 'SUBJECTS' && subjectCount > 0) return subjectCount;
    if (t.id === 'VEHICLES' && vehicleCount > 0) return vehicleCount;
    if (t.id === 'TIMELINE' && timelineCount > 0) return timelineCount;
    return null;
  };

  return (
    <div className="flex flex-col min-h-0 h-full bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 sm:px-5 py-4 border-b border-border-faint shrink-0">
        {isMobile && (
          <button onClick={onBack}
            className="flex items-center gap-1 text-sky-400 text-[11px] font-bold mt-1 shrink-0 hover:text-sky-300 transition-colors">
            <MdArrowBack size={15} /> Back
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10.5px] font-mono font-bold text-slate-500">{caseFile.caseNumber}</span>
            <StatusBadge status={caseFile.status} size="md" />
            <PriorityBadge priority={caseFile.priority} />
          </div>
          <div className="text-[16px] sm:text-[18px] font-extrabold text-white leading-snug">{caseFile.title}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{caseFile.classification} · Opened {fmtDate(caseFile.createdAt)}</div>
        </div>
        {canManage && caseFile.status !== 'LOCKED' && (
          <button onClick={() => onEdit(caseFile)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
            <MdEdit size={13} /> Edit
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border-faint shrink-0 overflow-x-auto">
        {DETAIL_TABS.map(t => {
          const badge = tabWithBadge(t);
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-[11px] sm:text-[12px] font-semibold whitespace-nowrap border-b-2 transition-all shrink-0
                ${tab === t.id
                  ? 'border-sky-400 text-sky-300'
                  : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              <t.Icon size={14} />
              {t.label}
              {badge !== null && (
                <span className={`px-1.5 py-0 rounded-full text-[9px] font-bold ml-0.5
                  ${tab === t.id ? 'bg-sky-500/25 text-sky-300' : 'bg-white/[0.07] text-slate-500'}`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {tab === 'OVERVIEW' && (
          <OverviewTab
            caseFile={caseFile}
            officers={officers}
            dispatch={dispatch}
            canManage={canManage}
            currentUser={currentUser}
          />
        )}
        {tab === 'SUBJECTS' && (
          <SubjectsTab
            caseFile={caseFile}
            civilians={civilians}
            dispatch={dispatch}
            canManage={canManage}
          />
        )}
        {tab === 'VEHICLES' && (
          <VehiclesTab
            caseFile={caseFile}
            vehicles={vehicles}
            civilians={civilians}
            dispatch={dispatch}
            canManage={canManage}
          />
        )}
        {tab === 'TIMELINE' && (
          <TimelineTab
            caseFile={caseFile}
            currentUser={currentUser}
            dispatch={dispatch}
          />
        )}
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */

export default function CaseFiles() {
  const { state, dispatch } = useCAD();
  const { isMobile } = useResponsive();
  const [selectedId, setSelectedId] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editCase, setEditCase] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQ, setSearchQ] = useState('');

  const cases = useMemo(() => {
    let list = state.caseFiles || [];
    if (filterStatus !== 'ALL') list = list.filter(c => c.status === filterStatus);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.caseNumber.toLowerCase().includes(q) ||
        c.classification.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      const order = { ACTIVE: 0, SUSPENDED: 1, CLOSED: 2, LOCKED: 3 };
      const so = (order[a.status] ?? 4) - (order[b.status] ?? 4);
      if (so !== 0) return so;
      if (a.priority !== b.priority) return a.priority - b.priority;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [state.caseFiles, filterStatus, searchQ]);

  const selectedCase = (state.caseFiles || []).find(c => c.id === selectedId);
  const showList   = !isMobile || !selectedId;
  const showDetail = !isMobile || !!selectedId;

  const counts = {
    ALL:       (state.caseFiles || []).length,
    ACTIVE:    (state.caseFiles || []).filter(c => c.status === 'ACTIVE').length,
    SUSPENDED: (state.caseFiles || []).filter(c => c.status === 'SUSPENDED').length,
    CLOSED:    (state.caseFiles || []).filter(c => c.status === 'CLOSED').length,
    LOCKED:    (state.caseFiles || []).filter(c => c.status === 'LOCKED').length,
  };

  return (
    <div className="flex-1 overflow-hidden p-3 sm:p-4 lg:p-5">
      <div className="h-full min-h-0 flex gap-3 sm:gap-4 lg:gap-5">

        {/* ── LEFT: Case List ── */}
        {showList && (
          <div className="flex flex-col min-h-0 bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm"
            style={{ width: isMobile ? '100%' : 'clamp(280px,28vw,340px)', flexShrink: 0 }}>

            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border-faint shrink-0">
              <FaUserSecret size={15} className="text-brand-bright opacity-80" />
              <span className="text-[13px] font-bold text-white flex-1">Case Files</span>
              <button onClick={() => setShowNewModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                style={{ background: 'rgba(58,136,232,0.14)', border: '1px solid rgba(58,136,232,0.30)', color: '#3a88e8' }}>
                <MdAdd size={14} /> New
              </button>
            </div>

            {/* Search */}
            <div className="px-3 py-2 border-b border-border-faint shrink-0">
              <div className="relative">
                <MdSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search case files..."
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg text-[12px] bg-app-elevated border border-border-base text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
                />
              </div>
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-0.5 px-2.5 py-2 border-b border-border-faint shrink-0 overflow-x-auto">
              {['ALL', 'ACTIVE', 'SUSPENDED', 'CLOSED', 'LOCKED'].map(s => {
                const active = filterStatus === s;
                const m = s !== 'ALL' ? CASE_STATUS_META[s] : null;
                return (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border shrink-0"
                    style={active && m
                      ? { color: m.color, background: m.bg, borderColor: m.border }
                      : active
                        ? { color: '#3a88e8', background: 'rgba(58,136,232,0.12)', borderColor: 'rgba(58,136,232,0.3)' }
                        : { color: '#475569', background: 'transparent', borderColor: 'transparent' }
                    }>
                    {s === 'ALL' ? 'All' : CASE_STATUS_META[s].label}
                    {counts[s] > 0 && (
                      <span className="ml-0.5 opacity-60">{counts[s]}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {cases.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-600">
                  <MdWork size={40} className="opacity-15" />
                  <div className="text-[12px] text-center">No cases found</div>
                </div>
              ) : cases.map(c => (
                <CaseListItem
                  key={c.id}
                  c={c}
                  active={c.id === selectedId}
                  onClick={() => setSelectedId(c.id)}
                  officers={state.officers || []}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── RIGHT: Detail ── */}
        {showDetail && (
          <div className="flex-1 min-w-0 min-h-0">
            {selectedCase ? (
              <CaseDetail
                key={selectedCase.id}
                caseFile={selectedCase}
                state={state}
                dispatch={dispatch}
                currentUser={state.currentUser}
                onBack={() => setSelectedId(null)}
                onEdit={(c) => setEditCase(c)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-600 bg-app-panel/80 border border-border-base rounded-xl">
                <FaUserSecret size={52} className="opacity-10" />
                <div className="text-center">
                  <div className="text-[13px] font-semibold text-slate-500 mb-1">Select a Case File</div>
                  <div className="text-[11px] text-slate-600">Choose a case from the list or open a new one</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewModal && (
        <CaseModal
          officers={state.officers || []}
          currentUser={state.currentUser}
          onSave={(data) => {
            dispatch({ type: 'ADD_CASE_FILE', payload: data });
            setShowNewModal(false);
          }}
          onClose={() => setShowNewModal(false)}
        />
      )}
      {editCase && (
        <CaseModal
          caseFile={editCase}
          officers={state.officers || []}
          currentUser={state.currentUser}
          onSave={(data) => {
            dispatch({ type: 'UPDATE_CASE_FILE', payload: data });
            setEditCase(null);
          }}
          onClose={() => setEditCase(null)}
        />
      )}
    </div>
  );
}
