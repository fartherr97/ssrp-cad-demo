import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCAD } from '../store/cadStore';
import { FormDocWrap, ReportDocument } from '../components/FormDocument';
import {
  MdDirectionsCar, MdGavel, MdPerson, MdReport,
  MdRecordVoiceOver, MdNote, MdDescription, MdAssignment,
} from 'react-icons/md';
import {
  BADGE, S_BTN_PRIMARY, S_BTN_SECONDARY, S_BTN_GHOST,
  S_BTN_SUCCESS, S_BTN_WARNING, xs,
} from '../constants/styles';

const TEMPLATE_ICONS = {
  'Traffic Stop':      MdDirectionsCar,
  'Use of Force':      MdGavel,
  'Arrest Report':     MdPerson,
  'Incident Report':   MdReport,
  'Field Interview':   MdRecordVoiceOver,
  'Supplement Report': MdNote,
};

const BUILTIN_NAMES = Object.keys(TEMPLATE_ICONS);

const STATUS_BADGE = {
  'Submitted':      BADGE.blue,
  'Approved':       BADGE.green,
  'Pending Review': BADGE.orange,
  'Denied':         BADGE.red,
};

export default function ReportsCenter() {
  const { state, dispatch } = useCAD();
  const { reports, reportTemplates, currentUser, officers } = state;
  const [searchParams] = useSearchParams();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formValues, setFormValues]             = useState({});
  const [selectedReport, setSelectedReport]     = useState(null);
  const [reportTab, setReportTab]               = useState('MINE');

  useEffect(() => {
    const openName = searchParams.get('open');
    if (!openName || !reportTemplates?.length) return;
    const tpl = reportTemplates.find(t => t.name === decodeURIComponent(openName));
    if (tpl) { setSelectedTemplate(tpl); setFormValues({}); setSelectedReport(null); }
  }, [searchParams, reportTemplates]);

  const isAdmin   = currentUser?.role === 'admin' || currentUser?.role === 'dispatch';
  const me        = officers.find(o => o.id === currentUser?.id);
  const myReports = reports.filter(r => r.officerBadge === me?.badge);
  const pendingReports = reports.filter(r => r.status === 'Submitted' || r.status === 'Pending Review');

  const displayedReports =
    reportTab === 'MINE'    ? myReports :
    reportTab === 'PENDING' ? pendingReports :
    reports;

  const selReport = selectedReport ? reports.find(r => r.id === selectedReport) : null;

  const builtinTpls = reportTemplates.filter(t => BUILTIN_NAMES.includes(t.name));
  const customTpls  = reportTemplates.filter(t => !BUILTIN_NAMES.includes(t.name));

  const handleFormChange = (key, val) => setFormValues(prev => ({ ...prev, [key]: val }));

  const submitReport = () => {
    if (!selectedTemplate) return;
    const caseNum = `${me?.deptShort || 'RMS'}-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    dispatch({
      type: 'ADD_REPORT',
      payload: {
        type: selectedTemplate.name,
        caseNumber: caseNum,
        officerBadge: me?.badge || currentUser?.badge || '*',
        callId: formValues.callId || null,
        civilianId: null,
        summary: formValues.narrative || formValues.f10 || formValues.f4 || formValues.f8 ||
          Object.values(formValues).filter(v => typeof v === 'string' && v.length > 10).join(' | ').slice(0, 200) ||
          'Report submitted via CAD',
        formData: { ...formValues },
      },
    });
    setSelectedTemplate(null);
    setFormValues({});
    setReportTab('MINE');
  };

  const reviewReport = (id, status) => {
    dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id, status } });
  };

  const showForm   = selectedTemplate !== null;
  const showReport = !showForm && selReport !== null;

  const draftMeta = {
    caseNumber: `${me?.deptShort || 'RMS'}-${new Date().getFullYear()}-DRAFT`,
    status: 'Draft',
  };

  return (
    <div className="flex h-full overflow-hidden font-ui">

      {/* ══ LEFT: Template picker ══════════════════════════════════ */}
      <div className="w-[230px] shrink-0 flex flex-col border-r border-border-base bg-app-toolbar overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 border-b border-border-base shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-cad-text">File New Report</div>
          <div className="text-[10px] text-cad-muted mt-0.5">Select a report type to begin</div>
        </div>

        {/* Template list */}
        <div className="flex-1 overflow-y-auto py-2 px-1.5">
          <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-cad-muted px-1.5 pb-2 pt-1">Standard Reports</div>

          {(builtinTpls.length > 0 ? builtinTpls : BUILTIN_NAMES.map((n, i) => ({ id: `builtin-${i}`, name: n, fields: [] }))).map(t => {
            const IconComp = TEMPLATE_ICONS[t.name] || MdDescription;
            const isSelected = selectedTemplate?.id === t.id;
            const fieldCount = t.sections
              ? t.sections.reduce((a, s) => a + s.fields.length, 0)
              : (t.fields?.length || 0);
            return (
              <button key={t.id}
                onClick={() => {
                  const tpl = reportTemplates.find(r => r.name === t.name) || t;
                  setSelectedTemplate(tpl);
                  setFormValues({});
                  setSelectedReport(null);
                }}
                className={`w-full flex items-center gap-2.5 px-2 py-2.5 mb-0.5 text-left cursor-pointer border-l-[3px] transition-colors ${
                  isSelected
                    ? 'bg-sky-500/10 border-l-sky-500 text-sky-400'
                    : 'bg-transparent border-l-transparent text-cad-text hover:bg-white/[0.04]'
                }`}
              >
                <IconComp size={17} className="shrink-0 opacity-75" />
                <div className="min-w-0">
                  <div className={`text-[12px] leading-[1.3] ${isSelected ? 'font-bold text-sky-400' : 'font-medium text-cad-text'}`}>{t.name}</div>
                  {fieldCount > 0 && <div className="text-[9px] text-cad-muted mt-px">{fieldCount} fields</div>}
                </div>
              </button>
            );
          })}

          {customTpls.length > 0 && (
            <>
              <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-cad-muted px-1.5 pb-2 pt-3">Custom Forms</div>
              {customTpls.map(t => {
                const isSelected = selectedTemplate?.id === t.id;
                return (
                  <button key={t.id}
                    onClick={() => { setSelectedTemplate(t); setFormValues({}); setSelectedReport(null); }}
                    className={`w-full flex items-center gap-2.5 px-2 py-2.5 mb-0.5 text-left cursor-pointer border-l-[3px] transition-colors ${
                      isSelected
                        ? 'bg-sky-500/10 border-l-sky-500'
                        : 'bg-transparent border-l-transparent hover:bg-white/[0.04]'
                    }`}
                  >
                    <MdAssignment size={17} className={`shrink-0 opacity-75 ${isSelected ? 'text-sky-400' : 'text-cad-muted'}`} />
                    <div className={`text-[12px] ${isSelected ? 'font-bold text-sky-400' : 'font-medium text-cad-text'}`}>{t.name}</div>
                  </button>
                );
              })}
            </>
          )}
        </div>

      </div>

      {/* ══ CENTER: Document area ══════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#2e2e32]">

        {/* ── Creating a new report ── */}
        {showForm && (
          <>
            <div className="px-3 py-1.5 bg-app-toolbar border-b border-border-base flex items-center gap-2.5 shrink-0">
              <span className="text-[11px] font-bold text-cad-text uppercase tracking-[0.5px]">
                {selectedTemplate.name}
              </span>
              <span className="text-[9px] text-cad-muted font-mono">
                {me?.badge || '*'} · {me?.name || currentUser?.name}
              </span>
              <div className="ml-auto flex gap-2 items-center">
                <button className={xs(S_BTN_GHOST)} onClick={() => { setSelectedTemplate(null); setFormValues({}); }}>
                  ✕ Discard
                </button>
                <button className={xs(S_BTN_PRIMARY)} onClick={submitReport}>
                  Submit Report
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <FormDocWrap meta={draftMeta}>
                <ReportDocument
                  type={selectedTemplate.name}
                  template={selectedTemplate}
                  data={formValues}
                  editable
                  onChange={handleFormChange}
                  meta={draftMeta}
                />
              </FormDocWrap>
            </div>
          </>
        )}

        {/* ── Viewing a submitted report ── */}
        {showReport && (
          <>
            <div className="px-3 py-1.5 bg-app-toolbar border-b border-border-base flex items-center gap-2.5 shrink-0">
              <span className="text-[11px] font-bold text-cad-text uppercase tracking-[0.5px]">
                {selReport.type}
              </span>
              <span className="text-[9px] text-cad-muted font-mono">
                {selReport.caseNumber} · {selReport.date}
              </span>
              <span className={`${STATUS_BADGE[selReport.status] || BADGE.gray} text-[9px]`}>
                {selReport.status}
              </span>
              {isAdmin && (
                <div className="ml-auto flex gap-1.5">
                  {selReport.status !== 'Approved' && (
                    <button className={xs(S_BTN_SUCCESS)} onClick={() => reviewReport(selReport.id, 'Approved')}>
                      Approve
                    </button>
                  )}
                  {selReport.status === 'Submitted' && (
                    <button className={xs(S_BTN_WARNING)} onClick={() => reviewReport(selReport.id, 'Pending Review')}>
                      Flag for Review
                    </button>
                  )}
                  {selReport.status !== 'Submitted' && (
                    <button className={xs(S_BTN_SECONDARY)} onClick={() => reviewReport(selReport.id, 'Submitted')}>
                      Reset
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto p-4 px-5">
              <FormDocWrap meta={{
                caseNumber: selReport.caseNumber,
                status: selReport.status,
              }}>
                <ReportDocument
                  type={selReport.type}
                  template={reportTemplates.find(t => t.name === selReport.type)}
                  data={selReport.formData || { f10: selReport.summary, f4: selReport.summary, f8: selReport.summary }}
                  editable={false}
                  meta={{ caseNumber: selReport.caseNumber, status: selReport.status }}
                />
              </FormDocWrap>
            </div>
          </>
        )}

        {/* ── Empty state ── */}
        {!showForm && !showReport && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3.5 text-slate-600 p-10">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.3">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <div className="text-center">
              <div className="text-[13px] font-semibold text-slate-500 mb-1.5">No report open</div>
              <div className="text-[11px] text-slate-600 max-w-[260px] leading-relaxed">
                Select a report type from the left panel to start filing, or choose an existing report from the list on the right.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ RIGHT: Report queue ═══════════════════════════════════ */}
      <div className="w-[270px] shrink-0 flex flex-col border-l border-border-base bg-app-toolbar overflow-hidden">
        {/* Header + stats */}
        <div className="px-3 py-2 border-b border-border-base shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-cad-text">Reports</span>
            <span className="text-[9px] font-mono text-cad-muted">{reports.length} total</span>
          </div>
          <div className="flex gap-1">
            {[
              { label: 'Submitted', count: reports.filter(r => r.status === 'Submitted').length, color: 'text-sky-500', border: 'border-sky-500/10' },
              { label: 'Pending',   count: pendingReports.length,                                  color: 'text-amber-500', border: 'border-amber-500/10' },
              { label: 'Approved',  count: reports.filter(r => r.status === 'Approved').length,   color: 'text-green-500', border: 'border-green-500/10' },
            ].map(s => (
              <div key={s.label} className={`flex-1 bg-app-card border ${s.border} px-1.5 py-1 text-center`}>
                <div className={`text-[14px] font-bold ${s.color}`}>{s.count}</div>
                <div className="text-[8px] text-cad-muted uppercase tracking-[0.3px]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-base shrink-0 bg-app-card">
          {[
            { id: 'MINE', label: 'My Reports', count: myReports.length },
            { id: 'PENDING', label: 'Pending', count: pendingReports.length },
            ...(isAdmin ? [{ id: 'ALL', label: 'All', count: reports.length }] : []),
          ].map(t => (
            <button key={t.id}
              onClick={() => setReportTab(t.id)}
              className={`flex-1 py-1.5 px-1 border-none cursor-pointer text-[9px] font-bold uppercase tracking-[0.4px] font-ui transition-colors border-b-2 ${
                reportTab === t.id
                  ? 'bg-app-selected text-cad-text border-b-sky-500'
                  : 'bg-transparent text-cad-muted border-b-transparent hover:text-cad-text'
              }`}>
              {t.label}
              {t.count > 0 && reportTab !== t.id && (
                <span className="ml-0.5 text-[8px] bg-app-elevated text-cad-muted px-0.5">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Report list */}
        <div className="flex-1 overflow-y-auto">
          {displayedReports.length === 0 ? (
            <div className="p-5 text-center text-cad-muted text-[11px]">No reports</div>
          ) : displayedReports.map(r => (
            <div key={r.id}
              onClick={() => { setSelectedReport(r.id); setSelectedTemplate(null); setFormValues({}); }}
              className={`px-2.5 py-2 cursor-pointer border-b border-border-faint border-l-[3px] transition-colors ${
                selectedReport === r.id
                  ? 'border-l-sky-500 bg-app-selected'
                  : 'border-l-transparent bg-transparent hover:bg-app-hover'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`${STATUS_BADGE[r.status] || BADGE.gray} !text-[8px]`}>{r.status}</span>
                <span className="text-[8px] text-cad-muted font-mono ml-auto">{r.date}</span>
              </div>
              <div className="text-[12px] font-semibold text-cad-text mb-0.5 leading-[1.2]">{r.type}</div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-cad-muted font-mono">{r.caseNumber}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Admin action bar for selected report */}
        {isAdmin && selReport && selReport.status !== 'Approved' && (
          <div className="px-2.5 py-2 border-t border-border-base shrink-0 bg-app-card">
            <div className="text-[9px] text-cad-muted uppercase tracking-[0.5px] mb-1.5">
              Review: {selReport.caseNumber}
            </div>
            <div className="flex gap-1.5">
              <button className={`${xs(S_BTN_SUCCESS)} flex-1`}
                onClick={() => reviewReport(selReport.id, 'Approved')}>
                Approve
              </button>
              {selReport.status === 'Submitted' && (
                <button className={`${xs(S_BTN_WARNING)} flex-1`}
                  onClick={() => reviewReport(selReport.id, 'Pending Review')}>
                  Flag
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
