import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCAD } from '../store/cadStore';
import { useToast } from '../contexts/ToastContext';
import StatusBadge from '../components/StatusBadge';
import IdentifierEditor from '../components/IdentifierEditor';
import ReportForm from '../components/ReportForm';
import { ReportDocument } from '../components/FormDocument';
import { useResponsive } from '../hooks/useResponsive';
import { DeptTag } from '../constants/deptLogos.jsx';
import { S_BTN_PRIMARY, S_BTN_SECONDARY, S_BTN_DANGER, S_INPUT, S_LABEL } from '../constants/styles';
import { MdCameraAlt, MdAdd, MdDelete, MdBadge, MdCheckCircle, MdEdit, MdClose, MdDescription, MdReply, MdArrowBack, MdSend } from 'react-icons/md';

function resizeToDataUrl(file, maxPx = 300) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(maxPx / img.width, maxPx / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ── Returned report editor ── */
function ReturnedReportEditor({ report, reportTemplates, officer, onBack, onResubmit }) {
  const template = reportTemplates.find(t => t.name === report.type);
  const [formData, setFormData] = useState({ ...(report.formData || {}) });
  const [submitted, setSubmitted] = useState(false);

  const handleResubmit = () => {
    onResubmit(formData);
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm">
      {/* Header — just nav actions, no title crowding */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border-base shrink-0"
        style={{ background: 'rgba(251,146,60,0.05)' }}>
        <button onClick={onBack}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
          <MdArrowBack size={14} /> Back
        </button>
        <button onClick={handleResubmit} disabled={submitted}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer disabled:opacity-50 transition-colors"
          style={{ background: 'rgba(58,136,232,0.14)', border: '1px solid rgba(58,136,232,0.30)', color: '#3a88e8' }}>
          <MdSend size={11} /> {submitted ? 'Submitted' : 'Resubmit'}
        </button>
      </div>

      {/* Report info strip */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border-faint shrink-0"
        style={{ background: 'rgba(0,0,0,0.15)' }}>
        <span className="text-[13px] font-bold text-white truncate flex-1">{report.type}</span>
        <span className="text-[10.5px] font-mono text-slate-500 shrink-0">{report.caseNumber}</span>
      </div>

      {/* Supervisor comments banner */}
      {(report.supervisorComments || []).length > 0 && (
        <div className="px-4 py-3 border-b border-border-faint flex flex-col gap-2" style={{ background: 'rgba(251,146,60,0.04)' }}>
          <div className="text-[9.5px] font-bold uppercase tracking-[0.5px] text-amber-500">Supervisor Notes — Please Address Before Resubmitting</div>
          {(report.supervisorComments || []).map(c => (
            <div key={c.id} className="rounded-lg px-3 py-2.5 text-[12px] text-slate-300 leading-relaxed"
              style={{ background: 'rgba(251,146,60,0.07)', border: '1px solid rgba(251,146,60,0.18)' }}>
              <div>{c.text}</div>
              <div className="text-[10px] text-slate-600 font-mono mt-1">{c.supervisorBadge} · {c.timestamp}</div>
            </div>
          ))}
        </div>
      )}

      {/* Editable form */}
      <div className="p-4 lg:p-6 overflow-auto">
        {template ? (
          <ReportForm
            template={template}
            data={formData}
            onChange={(k, v) => setFormData(p => ({ ...p, [k]: v }))}
            onBulkChange={obj => setFormData(p => ({ ...p, ...obj }))}
          />
        ) : (
          <div className="text-slate-500 text-sm italic">No matching template found for "{report.type}".</div>
        )}
      </div>
    </div>
  );
}

export default function OfficerProfile() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const { currentUser, officers, departments, reports, calls, reportTemplates = [] } = state;
  const myOfficer = officers.find(o => o.id === currentUser?.id);
  const myDept = departments.find(d => d.id === myOfficer?.dept);
  const myReports = reports.filter(r => r.officerBadge === myOfficer?.badge && r.status !== 'Pending Changes');
  const returnedReports = reports.filter(r => r.officerBadge === myOfficer?.badge && r.status === 'Pending Changes');
  const myCallHistory = calls.filter(c => c.units.includes(myOfficer?.unitId));

  // Activity time sourced from Nexum duty-log integration (not yet wired)
  const nexumWeekly  = myOfficer?.dutyTimeWeek  ?? null; // minutes
  const nexumMonthly = myOfficer?.dutyTimeMonth ?? null; // minutes
  const fmtTime = (m) => {
    if (m === null || m === undefined) return '—';
    const h = Math.floor(m / 60), min = m % 60;
    if (!m) return '0m';
    if (!h) return `${min}m`;
    if (!min) return `${h}h`;
    return `${h}h ${min}m`;
  };

  const [tab, setTab] = useState('info');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [viewReport, setViewReport] = useState(null);
  const [editingReturned, setEditingReturned] = useState(null);
  const { isMobile } = useResponsive();
  const fileRef = useRef();
  const nameInputRef = useRef();

  const startEditName = () => {
    setNameDraft(myOfficer.name);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  };
  const saveName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== myOfficer.name) {
      dispatch({ type: 'PATCH_OFFICER', payload: { name: trimmed } });
      toast.success('Display name updated.', { title: 'Profile Saved' });
    }
    setEditingName(false);
  };
  const cancelName = () => setEditingName(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeToDataUrl(file);
    dispatch({ type: 'PATCH_OFFICER', payload: { avatarUrl: dataUrl } });
    e.target.value = '';
    toast.success('Profile photo updated.', { title: 'Profile Saved' });
  };

  if (!myOfficer) return (
    <div className="p-8 text-center text-slate-500">
      No officer profile found for current session.
    </div>
  );


  const initials = myOfficer.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  // Profile accent stays TPD Blue regardless of the officer's department.
  const accentColor = '#1a6bbf';

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-5 box-border">
      {/* Profile header */}
      <div
        className="bg-app-panel/80 border border-border-base rounded-xl backdrop-blur-sm shadow-lg shadow-black/20 p-5 mb-5 max-w-[900px]"
        style={{ borderLeft: `3px solid ${accentColor}` }}
      >
        <div className="flex items-center gap-4">
          {/* Avatar — click to upload */}
          <div
            className="relative w-14 h-14 rounded-xl shrink-0 cursor-pointer group overflow-hidden bg-app-elevated"
            style={{ border: `2px solid ${accentColor}` }}
            onClick={() => fileRef.current?.click()}
            title="Upload profile picture"
          >
            {myOfficer.avatarUrl ? (
              <img src={myOfficer.avatarUrl} alt="avatar" className="w-full h-full object-cover object-top" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-extrabold tracking-widest" style={{ color: accentColor }}>
                {initials}
              </div>
            )}
            {/* hover overlay */}
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <MdCameraAlt size={20} className="text-white" />
            </div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={nameInputRef}
                  className="bg-app-input border border-brand/50 rounded-lg px-2.5 py-1 text-white text-[15px] font-bold tracking-[-0.2px] outline-none focus:border-brand w-full max-w-[220px]"
                  value={nameDraft}
                  onChange={e => setNameDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') cancelName(); }}
                />
                <button onClick={saveName} className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-all duration-75" title="Save"><MdCheckCircle size={17} /></button>
                <button onClick={cancelName} className="p-1 rounded-lg text-slate-500 hover:bg-white/[0.06] transition-all duration-75" title="Cancel"><MdClose size={17} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group/name">
                <span className="text-white text-lg font-bold tracking-[-0.2px]">{myOfficer.name}</span>
                <button onClick={startEditName} className="opacity-0 group-hover/name:opacity-100 p-0.5 rounded text-slate-500 hover:text-slate-300 transition-all duration-75" title="Edit name"><MdEdit size={13} /></button>
              </div>
            )}
            <div className="text-slate-400 text-sm mt-0.5 flex items-center gap-1.5">
              {myOfficer.rank} &bull; {myDept?.short ? <DeptTag code={myDept.short} /> : (myDept?.name || 'Unknown Department')}
            </div>
            <div className="text-slate-500 text-xs mt-1">
              Unit: <span className="text-brand-bright font-semibold">{myOfficer.unitId}</span>
              &nbsp;&bull;&nbsp;{myOfficer.subdivision}
              {myOfficer.aop && <>&nbsp;&bull;&nbsp;AOP: {myOfficer.aop}</>}
            </div>
          </div>
          <div className="text-right shrink-0">
            {myOfficer.callId && <div className="text-amber-400 text-xs mt-1.5">On Call: {myOfficer.callId}</div>}
          </div>
        </div>
        <div
          className="grid gap-2.5 mt-4"
          style={{ gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)' }}
        >
          {[
            { label: 'Reports Filed',       val: myReports.length },
            { label: 'Calls Attended',      val: myCallHistory.length },
            { label: 'Activity This Week',  val: fmtTime(nexumWeekly) },
            { label: 'Activity This Month', val: fmtTime(nexumMonthly) },
          ].map(s => (
            <div key={s.label} className="bg-app-card/70 border border-border-base rounded-xl backdrop-blur-sm px-3.5 py-3">
              <div className="text-white text-2xl font-extrabold leading-none">{s.val}</div>
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.6px] mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-border-faint mb-4 max-w-[900px] overflow-x-auto n-tabs-wrap">
        {[
          ['info',      'My Info'],
          ['identifiers','Identifiers'],
          ['reports',   'My Reports'],
          ['returned',  'Returned'],
          ['calls',     'Call History'],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`relative px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.4px] whitespace-nowrap cursor-pointer transition-colors ${
              tab === k ? 'text-brand-bright' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {l}
              {k === 'returned' && returnedReports.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold leading-none bg-amber-500/20 text-amber-400">
                  {returnedReports.length}
                </span>
              )}
            </span>
            {tab === k && <span className="absolute -bottom-[1px] left-2 right-2 h-[3px] rounded-full bg-brand" />}
          </button>
        ))}
      </div>

      <div className="max-w-[900px]">
        {tab === 'info' && (
          <div
            className="grid gap-3.5"
            style={{ gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}
          >
            <InfoCard title="IDENTIFIER" accentColor={accentColor}>
              <IdentifierEditor />
            </InfoCard>
            <InfoCard title="TRANSFER REQUEST" accentColor={accentColor}>
              <div className="flex flex-col items-center justify-center text-center py-4 gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}40` }}>
                  <MdBadge size={26} style={{ color: accentColor }} />
                </div>
                <div>
                  <div className="text-[15px] font-extrabold text-white mb-2 leading-snug">
                    Looking to Transfer to Another ES Department?
                  </div>
                  <div className="text-[12.5px] text-slate-400 leading-relaxed">
                    Head on over to our Transfer Portal to submit your request and be directed to the correct place.
                  </div>
                </div>
                <a
                  href="https://transfer.ssrp.us"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[13px] hover:-translate-y-0.5 transition-all duration-75"
                  style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}50`, color: accentColor }}
                >
                  Open Transfer Portal
                </a>
                <p className="text-[10px] text-slate-600 font-mono">transfer.ssrp.us</p>
              </div>
            </InfoCard>
          </div>
        )}

        {tab === 'identifiers' && (
          <IdentifiersTab officer={myOfficer} accentColor={accentColor} />
        )}

        {tab === 'reports' && (
          <div className="table-scroll bg-app-panel/80 border border-border-base rounded-xl overflow-auto backdrop-blur-sm">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <THead cols={['Case #','Type','Date','Status','Call']} />
              <tbody>
                {myReports.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}>
                    <td className="px-3 py-2 border-b border-border-faint">
                      <button
                        onClick={() => setViewReport(r)}
                        className="text-brand-bright font-bold hover:underline hover:text-white transition-colors duration-75 text-left"
                      >
                        {r.caseNumber}
                      </button>
                    </td>
                    <TD>{r.type}</TD>
                    <TD muted>{r.date}</TD>
                    <td className="px-3 py-2 border-b border-border-faint"><StatusBadge status={r.status} /></td>
                    <TD blue>{r.callId || '*'}</TD>
                  </tr>
                ))}
                {myReports.length === 0 && <tr><td colSpan={5} className="px-2.5 py-4 text-center text-slate-700">No reports filed.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'returned' && (
          editingReturned ? (
            <ReturnedReportEditor
              report={editingReturned}
              reportTemplates={reportTemplates}
              officer={myOfficer}
              onBack={() => setEditingReturned(null)}
              onResubmit={(formData) => {
                dispatch({ type: 'RESUBMIT_REPORT', payload: { id: editingReturned.id, formData } });
                toast.success('Report resubmitted for review.', { title: 'Resubmitted' });
                setEditingReturned(null);
              }}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {returnedReports.length === 0 ? (
                <div className="bg-app-panel/80 border border-border-base rounded-xl p-10 text-center text-slate-600 text-[13px]">
                  No returned reports — you&apos;re all clear.
                </div>
              ) : returnedReports.map(r => {
                const latestComment = (r.supervisorComments || []).slice(-1)[0];
                return (
                  <div key={r.id} className="bg-app-panel/80 border rounded-xl overflow-hidden backdrop-blur-sm"
                    style={{ borderColor: 'rgba(251,146,60,0.30)' }}>
                    <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'rgba(251,146,60,0.15)', background: 'rgba(251,146,60,0.05)' }}>
                      <MdReply size={16} className="text-amber-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[13px] font-bold text-white truncate">{r.type}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">Returned</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{r.caseNumber} · {r.date}</div>
                      </div>
                      <button onClick={() => setEditingReturned(r)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                        style={{ background: 'rgba(58,136,232,0.12)', border: '1px solid rgba(58,136,232,0.28)', color: '#3a88e8' }}>
                        <MdEdit size={12} /> Edit & Resubmit
                      </button>
                    </div>
                    {(r.supervisorComments || []).length > 0 && (
                      <div className="px-4 py-3 flex flex-col gap-2">
                        <div className="text-[9.5px] font-bold uppercase tracking-[0.5px] text-slate-600">Supervisor Notes</div>
                        {(r.supervisorComments || []).map(c => (
                          <div key={c.id} className="rounded-lg px-3 py-2.5 text-[12px] text-slate-300 leading-relaxed"
                            style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.15)' }}>
                            <div>{c.text}</div>
                            <div className="text-[10px] text-slate-600 font-mono mt-1.5">{c.supervisorBadge} · {c.timestamp}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {tab === 'calls' && (
          <div className="table-scroll bg-app-panel/80 border border-border-base rounded-xl overflow-auto backdrop-blur-sm">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <THead cols={['Call #','Nature','Location','Priority','Status','Time']} />
              <tbody>
                {myCallHistory.map((c, i) => (
                  <tr key={c.id} className={i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}>
                    <TD blue>{c.id}</TD>
                    <TD>{c.nature}</TD>
                    <TD muted>{c.location}</TD>
                    <td className="px-3 py-2 border-b border-border-faint">
                      <span className={`font-bold text-xs ${['text-red-400','text-orange-400','text-yellow-400'][c.priority-1] || 'text-slate-300'}`}>
                        P{c.priority}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-b border-border-faint"><StatusBadge status={c.status} /></td>
                    <TD muted small>{c.timestamp}</TD>
                  </tr>
                ))}
                {myCallHistory.length === 0 && <tr><td colSpan={6} className="px-2.5 py-4 text-center text-slate-700">No call history.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* PDF Report Viewer Modal */}
      {viewReport && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex flex-col anim-overlay-in"
          style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(4px)' }}
        >
          {/* Modal header bar */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 bg-[#1a1c22] shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/15 border border-blue-500/25 shrink-0">
              <MdDescription size={16} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-extrabold text-white leading-tight truncate">{viewReport.type}</div>
              <div className="text-[10px] font-mono text-brand-bright">{viewReport.caseNumber}</div>
            </div>
            <button
              onClick={() => setViewReport(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all duration-75"
              title="Close"
            >
              <MdClose size={18} />
            </button>
          </div>

          {/* Paper document */}
          <div className="flex-1 overflow-y-auto bg-[#36363a] p-6">
            {(() => {
              const tpl = reportTemplates.find(t => t.name === viewReport.type);
              const data = {
                ...(viewReport.formData || {}),
                ...(viewReport.summary && !viewReport.formData?.f10 ? { f10: viewReport.summary } : {}),
              };
              return (
                <div style={{
                  background: '#ffffff',
                  color: '#000',
                  fontFamily: "'Arial','Helvetica',sans-serif",
                  fontSize: 11,
                  width: '100%',
                  maxWidth: 816,
                  minHeight: 1056,
                  margin: '0 auto',
                  border: '1px solid #888',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                }}>
                  <ReportDocument
                    type={viewReport.type}
                    template={tpl}
                    data={data}
                    editable={false}
                    meta={{
                      caseNumber: viewReport.caseNumber,
                      status: viewReport.status,
                      officer: viewReport.officerBadge,
                      dateTime: viewReport.date,
                    }}
                  />
                </div>
              );
            })()}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function IdentifiersTab({ officer, accentColor }) {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const { departments, unitStatusCodes } = state;
  const identifiers = officer.identifiers || [];
  const [editing, setEditing] = useState(null); // null | 'new' | id
  const blankDraft = { label: '', unitId: '', rank: '', status: 'AVAILABLE', location: '', aop: '', dept: '', subdivision: '' };
  const [draft, setDraft] = useState(blankDraft);

  const openNew = () => {
    setDraft({
      label: '', unitId: officer.unitId || '', rank: officer.rank || '',
      status: officer.status || 'AVAILABLE', location: officer.location || '',
      aop: officer.aop || '', dept: officer.dept || '', subdivision: officer.subdivision || '',
    });
    setEditing('new');
  };

  const openEdit = (ident) => {
    setDraft({ ...ident });
    setEditing(ident.id);
  };

  const saveCurrentAsNew = () => {
    const label = `Identifier ${identifiers.length + 1}`;
    dispatch({ type: 'SAVE_IDENTIFIER', payload: {
      label, unitId: officer.unitId, rank: officer.rank, status: officer.status,
      location: officer.location || '', aop: officer.aop || '',
      dept: officer.dept, deptShort: officer.deptShort, subdivision: officer.subdivision,
    }});
  };

  const submitDraft = () => {
    if (!draft.label.trim()) return;
    const deptObj = departments.find(d => d.id === Number(draft.dept));
    dispatch({ type: 'SAVE_IDENTIFIER', payload: {
      ...draft,
      id: editing !== 'new' ? editing : undefined,
      dept: Number(draft.dept),
      deptShort: deptObj?.short || officer.deptShort || '',
    }});
    toast.success(`Identifier "${draft.label.trim()}" saved.`, { title: 'Identifier Saved' });
    setEditing(null);
  };

  const setDraftField = (k, v) => setDraft(p => ({ ...p, [k]: v }));
  const selectedDeptSubs = departments.find(d => d.id === Number(draft.dept))?.subdivisions || [];

  return (
    <div className="grid gap-3">
      {/* Saved identifier cards */}
      {identifiers.length === 0 && editing === null && (
        <div className="text-slate-500 text-sm text-center py-6 bg-app-panel/60 border border-border-base rounded-xl">
          No saved identifiers yet. Save your current one or create a new one.
        </div>
      )}
      {identifiers.map(ident => {
        const deptObj = departments.find(d => d.id === ident.dept);
        const isActive = officer.unitId === ident.unitId && officer.subdivision === ident.subdivision && officer.dept === ident.dept;
        return (
          <div key={ident.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: isActive ? accentColor : 'var(--border-base)' }}>
            <MdBadge size={20} style={{ color: isActive ? accentColor : '#475569', flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-slate-200 flex items-center gap-2">
                {ident.label}
                {isActive && <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ background: `${accentColor}22`, color: accentColor }}>Active</span>}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {ident.unitId} · {ident.rank} · {deptObj?.short || ident.deptShort}{ident.subdivision ? ` / ${ident.subdivision}` : ''}
              </div>
            </div>
            <div className="flex gap-1.5 shrink-0">
              {!isActive && (
                <button className={S_BTN_PRIMARY + ' press !px-3 !py-1.5 !text-xs'} onClick={() => { dispatch({ type: 'LOAD_IDENTIFIER', payload: ident.id }); toast.success(`Now on duty as ${ident.unitId}.`, { title: ident.label }); }}>
                  <MdCheckCircle size={13} style={{ display: 'inline', marginRight: 4 }} />Activate
                </button>
              )}
              <button className={S_BTN_SECONDARY + ' press !px-3 !py-1.5 !text-xs'} onClick={() => openEdit(ident)}>
                <MdEdit size={13} style={{ display: 'inline', marginRight: 4 }} />Edit
              </button>
              <button className={S_BTN_DANGER + ' press !px-2 !py-1.5 !text-xs'} onClick={() => { dispatch({ type: 'DELETE_IDENTIFIER', payload: ident.id }); toast.success(`Identifier "${ident.label}" removed.`, { title: 'Identifier Deleted' }); }}>
                <MdDelete size={13} />
              </button>
            </div>
          </div>
        );
      })}

      {/* Edit / New form */}
      {editing !== null && (
        <div className="bg-app-panel/80 border border-border-base rounded-xl backdrop-blur-sm px-4 py-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.9px] mb-3" style={{ color: accentColor }}>
            {editing === 'new' ? 'New Identifier' : 'Edit Identifier'}
          </div>
          <div className="grid gap-3">
            <div>
              <label className={S_LABEL}>Label / Nickname</label>
              <input className={S_INPUT} value={draft.label} onChange={e => setDraftField('label', e.target.value)} placeholder="e.g. Patrol Unit, K9 Handler…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={S_LABEL}>Unit Number</label>
                <input className={S_INPUT} value={draft.unitId} onChange={e => setDraftField('unitId', e.target.value)} placeholder="e.g. TPD-831" />
              </div>
              <div>
                <label className={S_LABEL}>Rank</label>
                <input className={S_INPUT} value={draft.rank} onChange={e => setDraftField('rank', e.target.value)} placeholder="e.g. Officer" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={S_LABEL}>Status</label>
                <select className={S_INPUT} value={draft.status} onChange={e => setDraftField('status', e.target.value)}>
                  {unitStatusCodes.map(s => <option key={s.code} value={s.code}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={S_LABEL}>AOP</label>
                <input className={S_INPUT} value={draft.aop} onChange={e => setDraftField('aop', e.target.value)} placeholder="Area of Patrol" />
              </div>
            </div>
            <div>
              <label className={S_LABEL}>Agency</label>
              <select className={S_INPUT} value={draft.dept} onChange={e => {
                const dept = departments.find(d => d.id === Number(e.target.value));
                setDraft(p => ({ ...p, dept: Number(e.target.value), subdivision: dept?.subdivisions?.[0] || '' }));
              }}>
                <option value="">— Select Agency —</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            {selectedDeptSubs.length > 0 && (
              <div>
                <label className={S_LABEL}>Subdivision</label>
                <select className={S_INPUT} value={draft.subdivision} onChange={e => setDraftField('subdivision', e.target.value)}>
                  <option value="">— None —</option>
                  {selectedDeptSubs.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <button className={S_BTN_PRIMARY} onClick={submitDraft} disabled={!draft.label.trim()}>Save</button>
              <button className={S_BTN_SECONDARY} onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {editing === null && (
        <div className="flex gap-2 flex-wrap">
          <button className={S_BTN_PRIMARY} onClick={openNew}>
            <MdAdd size={15} style={{ display: 'inline', marginRight: 5 }} />New Identifier
          </button>
          <button className={S_BTN_SECONDARY} onClick={saveCurrentAsNew}>
            Save Current as New
          </button>
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, accentColor, children }) {
  return (
    <div className="bg-app-card/70 border border-border-base rounded-xl backdrop-blur-sm px-4 py-3.5">
      <div
        className="text-[10px] font-bold uppercase tracking-[0.9px] mb-3 border-b border-border-faint pb-2"
        style={{ color: accentColor || '#3d82f0' }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3 mb-1.5 text-sm">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-300 text-right">{value}</span>
    </div>
  );
}

function THead({ cols }) {
  return (
    <thead>
      <tr>
        {cols.map(h => (
          <th key={h} className="px-3 py-2.5 text-left text-slate-500 text-[10px] font-bold uppercase tracking-[0.7px] bg-app-bg/60 backdrop-blur-sm border-b border-border-base whitespace-nowrap sticky top-0">{h}</th>
        ))}
      </tr>
    </thead>
  );
}

function TD({ children, blue, muted, small }) {
  return (
    <td className={`px-3 py-2 border-b border-border-faint ${blue ? 'text-brand-bright font-bold' : muted ? 'text-slate-500' : 'text-slate-300'} ${small ? 'text-[11px]' : 'text-sm'}`}>
      {children}
    </td>
  );
}
