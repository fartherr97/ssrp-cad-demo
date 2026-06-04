import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCAD } from '../store/cadStore';
import { useToast } from '../contexts/ToastContext';
import ReportForm from '../components/ReportForm';
import { downloadReportPDF } from '../components/ReportPDF';
import {
  MdDirectionsCar, MdGavel, MdPerson, MdReport,
  MdRecordVoiceOver, MdNote, MdDescription, MdAssignment,
  MdArrowBack, MdDownload, MdDeleteOutline, MdSend,
  MdInventory2, MdPhone, MdShield, MdCarCrash,
} from 'react-icons/md';
import { DeptBadge } from '../constants/deptLogos';
import {
  BADGE, S_BTN_PRIMARY, S_BTN_SECONDARY, S_BTN_GHOST, S_BTN_DANGER,
  S_BTN_SUCCESS, S_BTN_WARNING, S_BTN_SUBMIT, xs,
} from '../constants/styles';

const TEMPLATE_ICONS = {
  'Traffic Stop':      MdDirectionsCar,
  'Use of Force':      MdGavel,
  'Arrest Report':     MdPerson,
  'Incident Report':   MdReport,
  'Field Interview':   MdRecordVoiceOver,
  'Supplement Report': MdNote,
  'Accident Report':   MdCarCrash,
};

const BUILTIN_NAMES = Object.keys(TEMPLATE_ICONS);

const STATUS_BADGE = {
  'Pending Review':  BADGE.orange,
  'Pending Changes': BADGE.yellow,
  'Approved':        BADGE.green,
  'Rejected':        BADGE.red,
};

const DRAFT_KEY = (tplId) => `ssrp_report_draft_${tplId}`;

export default function ReportsCenter() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const { reports, reportTemplates, currentUser, officers, calls = [], myCallId, communityConfig, departments, reportSeq = 1 } = state;
  const [searchParams] = useSearchParams();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formValues, setFormValues]             = useState({});
  const [selectedReport, setSelectedReport]     = useState(null);
  const [reportTab, setReportTab]               = useState('MINE');
  const [savedAt, setSavedAt]                   = useState(null);
  const [activeTab, setActiveTab]               = useState('Report');
  const [pdfLoading, setPdfLoading]             = useState(false);
  const [mobileTab, setMobileTab]               = useState('new'); // 'new' | 'queue'

  // Open a template for editing, restoring any auto-saved draft.
  const openTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    setSelectedReport(null);
    let restored = {};
    try {
      const saved = localStorage.getItem(DRAFT_KEY(tpl.id));
      if (saved) restored = JSON.parse(saved);
    } catch { /* ignore */ }

    // Auto-fill officer fields when opening a fresh form (no saved draft)
    if (!Object.keys(restored).length) {
      const officer = officers.find(o => o.id === currentUser?.id);
      if (officer) {
        const myDeptObj = departments?.find(d => d.id === officer.dept);
        const allFields = (tpl.sections || []).flatMap(s => s.fields || []);
        const autoFill = {};
        for (const field of allFields) {
          const l = (field.label || '').toLowerCase();
          if (field.type === 'badge_lookup') {
            autoFill[field.id] = officer.badge || '';
          } else if (/department|agency|dept/.test(l) && field.type === 'text') {
            autoFill[field.id] = myDeptObj?.name || officer.deptShort || '';
          }
        }
        if (Object.keys(autoFill).length) restored = autoFill;
      }
    }

    // Auto-numbered fields always reflect the next shared report number.
    const caseNum = String(reportSeq).padStart(4, '0');
    const meOff = officers.find(o => o.id === currentUser?.id);
    const deptObj = departments?.find(d => d.short === meOff?.deptShort) || departments?.find(d => d.id === meOff?.dept);
    const af = (kind) => {
      switch (kind) {
        case 'agencyName':  return deptObj?.name || meOff?.deptShort || communityConfig?.name || '';
        case 'department':  return meOff?.deptShort || '';
        case 'subdivision': return meOff?.subdivision || '';
        case 'unitNumber':  return meOff?.unitId || meOff?.badge || '';
        case 'unitName':    return meOff?.name || currentUser?.name || '';
        case 'date':        return new Date().toISOString().slice(0, 10);
        case 'time':        return new Date().toTimeString().slice(0, 5);
        case 'county':      return 'Hillsborough County';
        default:            return '';
      }
    };
    (tpl.sections || []).forEach(s => (s.fields || []).forEach(f => {
      if (f.autoNumber) restored[f.id] = caseNum;
      else if (f.autoFill) {
        if (f.autoFill === 'date' || f.autoFill === 'time') { if (!restored[f.id]) restored[f.id] = af(f.autoFill); }
        else restored[f.id] = af(f.autoFill);
      }
    }));

    setFormValues(restored);
    setSavedAt(null);
  };

  useEffect(() => {
    const openName = searchParams.get('open');
    if (!openName || !reportTemplates?.length) return;
    const tpl = reportTemplates.find(t => t.name === decodeURIComponent(openName));
    if (tpl) openTemplate(tpl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, reportTemplates]);

  // ── Auto-save draft as the user types (debounced) ──
  useEffect(() => {
    if (!selectedTemplate) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY(selectedTemplate.id), JSON.stringify(formValues));
        setSavedAt(new Date());
      } catch { /* ignore */ }
    }, 600);
    return () => clearTimeout(id);
  }, [formValues, selectedTemplate]);

  const isAdmin   = currentUser?.role === 'admin' || currentUser?.role === 'dispatch';
  const me        = officers.find(o => o.id === currentUser?.id);
  const myReports = reports.filter(r => r.officerBadge === me?.badge);
  const pendingReports = reports.filter(r => r.status === 'Pending Review' || r.status === 'Pending Changes');

  const displayedReports =
    reportTab === 'MINE'    ? myReports :
    reportTab === 'PENDING' ? pendingReports :
    reports;

  const selReport = selectedReport ? reports.find(r => r.id === selectedReport) : null;

  const builtinTpls = reportTemplates.filter(t => BUILTIN_NAMES.includes(t.name));
  const customTpls  = reportTemplates.filter(t => !BUILTIN_NAMES.includes(t.name));

  const handleFormChange = (key, val) => setFormValues(prev => ({ ...prev, [key]: val }));

  const closeForm = () => {
    setSelectedTemplate(null);
    setFormValues({});
    setSavedAt(null);
  };

  const submitReport = () => {
    if (!selectedTemplate) return;
    // Sequential report number — the store stamps the authoritative value; we
    // mirror it here for the confirmation toast.
    const caseNum = String(reportSeq).padStart(4, '0');
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
    try { localStorage.removeItem(DRAFT_KEY(selectedTemplate.id)); } catch { /* ignore */ }
    toast.success(`${selectedTemplate.name} filed as ${caseNum}.`, { title: 'Report Submitted' });
    closeForm();
    setReportTab('MINE');
  };

  const reviewReport = (id, status) => {
    dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id, status } });
    toast.success(`Report marked ${status}.`, { title: 'Report Updated' });
  };

  const showForm   = selectedTemplate !== null;
  const showReport = !showForm && selReport !== null;

  const draftMeta = {
    caseNumber: String(reportSeq).padStart(4, '0'),
    status: 'Draft',
  };

  // ══ Hybrid report-writer (Case Details · paper document · Related Records) ══
  if (showForm) {
    const tpl = selectedTemplate;
    const sectionTitles = tpl.sections ? tpl.sections.map(s => s.title) : ['Narrative'];
    const tabs = ['Report', ...sectionTitles];
    const relatedCall = (formValues.callId || myCallId)
      ? calls.find(c => c.id === (formValues.callId || myCallId)) : null;
    const now = new Date();

    const scrollTo = (title) => {
      setActiveTab(title);
      const sel = title === 'Report' ? '[data-doc-top]' : `[data-section="${title}"]`;
      document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const saveDraftNow = () => {
      try { localStorage.setItem(DRAFT_KEY(tpl.id), JSON.stringify(formValues)); setSavedAt(new Date()); } catch { /* ignore */ }
    };
    const exportPDF = async () => {
      setPdfLoading(true);
      try {
        await downloadReportPDF(tpl, formValues, {
          caseNumber: draftMeta.caseNumber,
          status: 'Draft',
          dateTime: now.toLocaleString(),
          officer: `${me?.badge || currentUser?.badge || '*'} · ${me?.name || currentUser?.name || ''}`,
          agency: departments?.find(d => d.short === me?.deptShort)?.name || me?.deptShort || communityConfig?.name || 'SSRP',
          logoUrl: departments?.find(d => d.short === me?.deptShort)?.logoUrl || communityConfig?.logoUrl,
        });
      } finally { setPdfLoading(false); }
    };
    const Detail = ({ label, value }) => (
      <div className="flex flex-col gap-0.5 py-2 border-b border-border-faint last:border-0">
        <span className="text-[9.5px] uppercase tracking-[0.5px] text-slate-500">{label}</span>
        <span className="text-[12.5px] text-slate-200">{value || '—'}</span>
      </div>
    );

    return (
      <div className="flex flex-col h-full overflow-hidden font-ui">

        {/* ── Top bar: title + section tabs + autosave ── */}
        <div className="shrink-0 bg-app-toolbar/80 backdrop-blur-md border-b border-border-base">
          <div className="flex items-center gap-x-3 px-4 pt-2.5 pb-1.5">
            <MdDescription size={18} className="text-brand-bright shrink-0" />
            <span className="text-[13px] font-bold text-white uppercase tracking-[0.4px] shrink-0">Report Writing</span>
            <span className="text-[11px] text-slate-500 truncate min-w-0">{tpl.name}</span>
            <span className="ml-auto flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-400 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${savedAt ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              <span className="hidden sm:inline">AUTOSAVE: ON</span>
              {savedAt && <span className="hidden sm:inline text-slate-600 font-normal"> · {savedAt.toLocaleTimeString()}</span>}
            </span>
          </div>
          <div className="flex items-center gap-0.5 px-3 overflow-x-auto n-tabs-wrap">
            {tabs.map(t => {
              const on = activeTab === t;
              return (
                <button key={t} onClick={() => scrollTo(t)}
                  className={`relative px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.3px] whitespace-nowrap cursor-pointer transition-colors ${on ? 'text-brand-bright' : 'text-slate-500 hover:text-slate-300'}`}>
                  {t}
                  {on && <span className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-brand" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 min-h-0 grid grid-cols-1 overflow-auto xl:overflow-hidden">

          {/* CENTER: report information + paper document */}
          <main className="flex flex-col xl:min-h-0 xl:overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-4 shrink-0 gap-x-4 gap-y-2 px-4 py-3 bg-app-panel/40 border-b border-border-faint">
              <div><div className="text-[9px] uppercase tracking-[0.5px] text-slate-500">Report Status</div><div className="mt-1"><span className={BADGE.gray}>Draft</span></div></div>
              <div><div className="text-[9px] uppercase tracking-[0.5px] text-slate-500">Date</div><div className="text-[12.5px] text-slate-200 mt-0.5">{now.toLocaleDateString()}</div></div>
              <div><div className="text-[9px] uppercase tracking-[0.5px] text-slate-500">Review</div><div className="text-[12.5px] text-slate-200 mt-0.5">Not submitted</div></div>
              <div><div className="text-[9px] uppercase tracking-[0.5px] text-slate-500">Last Saved</div><div className="text-[12.5px] text-slate-200 mt-0.5">{savedAt ? savedAt.toLocaleTimeString() : '—'}</div></div>
            </div>
            <div className="xl:flex-1 xl:overflow-auto bg-app-bg/30 p-4 lg:p-6">
              <ReportForm template={tpl} data={formValues} onChange={handleFormChange}
                onBulkChange={(obj) => setFormValues(p => ({ ...p, ...obj }))} canSupplement />

              {/* ── Action buttons: stacked directly below the document ── */}
              <div className="max-w-[1100px] mx-auto w-full mt-5 pt-4 border-t border-border-faint">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                  <button className={`${S_BTN_SECONDARY} w-full sm:w-auto`} onClick={closeForm}><MdArrowBack size={15} /> Back</button>
                  <button className={`${S_BTN_SECONDARY} hidden sm:flex sm:w-auto`} onClick={exportPDF} disabled={pdfLoading}>
                    <MdDownload size={15} /> {pdfLoading ? 'Generating…' : 'Save as PDF'}
                  </button>
                  <button className={`${S_BTN_DANGER} hidden sm:flex sm:w-auto`} onClick={() => setFormValues({})}><MdDeleteOutline size={15} /> Clear</button>
                  <button className={`${S_BTN_SUBMIT} w-full sm:w-auto sm:ml-auto`} onClick={submitReport}><MdSend size={17} /> Submit Report</button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden font-ui">

      {/* ── Mobile tab bar ── */}
      <div className="md:hidden shrink-0 flex border-b border-border-base bg-app-toolbar/80 backdrop-blur-md">
        {[
          { id: 'new',   label: 'New Report' },
          { id: 'queue', label: `Reports (${reports.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setMobileTab(t.id)}
            className={`relative flex-1 py-2.5 text-[12px] font-semibold uppercase tracking-[0.4px] cursor-pointer border-none font-ui transition-colors
              ${mobileTab === t.id ? 'text-brand-bright' : 'bg-transparent text-slate-500 hover:text-slate-300'}`}>
            {t.label}
            {mobileTab === t.id && <span className="absolute bottom-0 left-4 right-4 h-[3px] rounded-full bg-brand" />}
          </button>
        ))}
      </div>

      {/* ══ LEFT: Template picker ══════════════════════════════════ */}
      <div className={`w-full md:w-[230px] shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-border-base bg-app-toolbar/80 backdrop-blur-md overflow-hidden
        ${mobileTab === 'new' ? 'flex-1 md:flex-none' : 'hidden md:flex'} md:max-h-none`}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-border-faint shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-slate-200">File New Report</div>
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
                onClick={() => openTemplate(reportTemplates.find(r => r.name === t.name) || t)}
                className={`w-full flex items-center gap-2.5 px-2 py-2.5 mb-0.5 rounded-lg text-left cursor-pointer border-l-[3px] transition-colors ${
                  isSelected
                    ? 'bg-brand/15 border-l-brand text-brand-bright'
                    : 'bg-transparent border-l-transparent text-cad-text hover:bg-white/[0.04]'
                }`}
              >
                <IconComp size={17} className="shrink-0 opacity-75" />
                <div className="min-w-0">
                  <div className={`text-[12px] leading-[1.3] ${isSelected ? 'font-bold text-brand-bright' : 'font-medium text-cad-text'}`}>{t.name}</div>
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
                    onClick={() => openTemplate(t)}
                    className={`w-full flex items-center gap-2.5 px-2 py-2.5 mb-0.5 rounded-lg text-left cursor-pointer border-l-[3px] transition-colors ${
                      isSelected
                        ? 'bg-brand/15 border-l-brand'
                        : 'bg-transparent border-l-transparent hover:bg-white/[0.04]'
                    }`}
                  >
                    <MdAssignment size={17} className={`shrink-0 opacity-75 ${isSelected ? 'text-brand-bright' : 'text-cad-muted'}`} />
                    <div className={`text-[12px] ${isSelected ? 'font-bold text-brand-bright' : 'font-medium text-cad-text'}`}>{t.name}</div>
                  </button>
                );
              })}
            </>
          )}
        </div>

      </div>

      {/* ══ CENTER: Document area ══════════════════════════════════ */}
      <div className={`flex-1 flex-col overflow-hidden bg-app-bg/20 ${showReport ? 'flex' : 'hidden md:flex'}`}>

        {/* ── Viewing a submitted report ── */}
        {showReport && (
          <>
            <div className="px-4 py-2.5 bg-app-toolbar/80 backdrop-blur-md border-b border-border-base flex items-center flex-wrap gap-2.5 shrink-0">
              <button className="md:hidden flex items-center gap-1 text-[12px] text-brand-bright font-semibold mr-1 cursor-pointer bg-transparent border-none"
                onClick={() => { setSelectedReport(null); setMobileTab('queue'); }}>
                <MdArrowBack size={15} /> Back
              </button>
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
                  {selReport.status !== 'Rejected' && (
                    <button className={xs(S_BTN_SECONDARY)} onClick={() => reviewReport(selReport.id, 'Rejected')}>
                      Reject
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto p-4 lg:p-6 bg-app-bg/30">
              {(() => {
                const t = reportTemplates.find(t => t.name === selReport.type);
                if (t && selReport.formData) return <ReportForm template={t} data={selReport.formData} readOnly canSupplement
                  onSupplement={(fid, arr) => dispatch({ type: 'UPDATE_REPORT', payload: { id: selReport.id, formData: { ...selReport.formData, [fid]: arr } } })} />;
                return (
                  <div className="max-w-[1100px] mx-auto bg-app-card/70 border border-border-base rounded-xl p-4 text-[13px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {selReport.summary || 'No details on file.'}
                  </div>
                );
              })()}
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
      <div className={`w-full md:w-[270px] shrink-0 flex flex-col border-t md:border-t-0 md:border-l border-border-base bg-app-toolbar/80 backdrop-blur-md overflow-hidden
        ${mobileTab === 'queue' ? 'flex-1 md:flex-none' : 'hidden md:flex'} md:max-h-none`}>
        {/* Header + stats */}
        <div className="px-3 py-3 border-b border-border-faint shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.7px] text-slate-200">Reports</span>
            <span className="text-[9px] font-mono text-cad-muted">{reports.length} total</span>
          </div>
          <div className="flex gap-1.5">
            {[
              { label: 'Pending',   count: pendingReports.length,                                  color: 'text-amber-400', border: 'border-amber-500/20' },
              { label: 'Approved',  count: reports.filter(r => r.status === 'Approved').length,   color: 'text-green-400', border: 'border-green-500/20' },
            ].map(s => (
              <div key={s.label} className={`flex-1 bg-app-card/70 border ${s.border} rounded-lg px-1.5 py-1.5 text-center`}>
                <div className={`text-[14px] font-bold ${s.color}`}>{s.count}</div>
                <div className="text-[8px] text-cad-muted uppercase tracking-[0.3px] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-faint shrink-0">
          {[
            { id: 'MINE', label: 'My Reports', count: myReports.length },
            { id: 'PENDING', label: 'Pending', count: pendingReports.length },
            ...(isAdmin ? [{ id: 'ALL', label: 'All', count: reports.length }] : []),
          ].map(t => (
            <button key={t.id}
              onClick={() => setReportTab(t.id)}
              className={`relative flex-1 py-2 px-1 border-none cursor-pointer text-[9px] font-bold uppercase tracking-[0.4px] font-ui transition-colors ${
                reportTab === t.id
                  ? 'text-brand-bright'
                  : 'bg-transparent text-cad-muted hover:text-cad-text'
              }`}>
              {t.label}
              {t.count > 0 && reportTab !== t.id && (
                <span className="ml-0.5 text-[8px] bg-app-elevated text-cad-muted px-1 py-0.5 rounded">
                  {t.count}
                </span>
              )}
              {reportTab === t.id && <span className="absolute -bottom-[1px] left-2 right-2 h-[3px] rounded-full bg-brand" />}
            </button>
          ))}
        </div>

        {/* Report list */}
        <div className="flex-1 overflow-y-auto">
          {displayedReports.length === 0 ? (
            <div className="p-5 text-center text-cad-muted text-[11px]">No reports</div>
          ) : displayedReports.map(r => (
            <div key={r.id}
              onClick={() => { setSelectedReport(r.id); setSelectedTemplate(null); setFormValues({}); setMobileTab('new'); }}
              className={`px-2.5 py-2 cursor-pointer border-b border-border-faint border-l-[3px] transition-colors ${
                selectedReport === r.id
                  ? 'border-l-brand bg-brand/10'
                  : 'border-l-transparent bg-transparent hover:bg-white/[0.04]'
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
          <div className="px-2.5 py-2.5 border-t border-border-faint shrink-0 bg-app-card/60">
            <div className="text-[9px] text-cad-muted uppercase tracking-[0.5px] mb-1.5">
              Review: {selReport.caseNumber}
            </div>
            <div className="flex gap-1.5">
              <button className={`${xs(S_BTN_SUCCESS)} flex-1`}
                onClick={() => reviewReport(selReport.id, 'Approved')}>
                Approve
              </button>
              {selReport.status !== 'Rejected' && (
                <button className={`${xs(S_BTN_SECONDARY)} flex-1`}
                  onClick={() => reviewReport(selReport.id, 'Rejected')}>
                  Reject
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
