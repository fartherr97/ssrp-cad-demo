import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCAD } from '../store/cadStore';
import { useToast } from '../contexts/ToastContext';
import ReportForm from '../components/ReportForm';
import { downloadReportPDF } from '../components/ReportPDF';
import {
  MdDescription, MdArrowBack, MdDownload, MdDeleteOutline, MdCheckCircle,
  MdShield, MdPerson, MdInventory2, MdAssignment, MdDirectionsCar,
} from 'react-icons/md';
import {
  BADGE, S_BTN_PRIMARY, S_BTN_SECONDARY, S_BTN_GHOST, S_BTN_DANGER, xs,
} from '../constants/styles';


const STATUS_BADGE = {
  'Active':   BADGE.green,
  'Expired':  BADGE.red,
  'Revoked':  BADGE.red,
  'Pending':  BADGE.orange,
  'Draft':    BADGE.gray,
};

const DRAFT_KEY = (tplId) => `ssrp_record_draft_${tplId}`;

export default function RecordsCenter() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const { recordTemplates, currentUser, officers, communityConfig, departments, reportSeq = 1 } = state;
  const [searchParams] = useSearchParams();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formValues, setFormValues]             = useState({});
  const [selectedRecord, setSelectedRecord]     = useState(null);
  const [savedAt, setSavedAt]                   = useState(null);
  const [activeTab, setActiveTab]               = useState('Record');
  const [pdfLoading, setPdfLoading]             = useState(false);
  const [mobileTab, setMobileTab]               = useState('new'); // 'new' | 'history'

  const openTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    setSelectedRecord(null);
    let restored = {};
    try {
      const saved = localStorage.getItem(DRAFT_KEY(tpl.id));
      if (saved) restored = JSON.parse(saved);
    } catch { /* ignore */ }
    setFormValues(restored);
    setSavedAt(null);
  };

  useEffect(() => {
    const openName = searchParams.get('open');
    if (!openName || !recordTemplates?.length) return;
    const tpl = recordTemplates.find(t => t.name === decodeURIComponent(openName));
    if (tpl) openTemplate(tpl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, recordTemplates]);

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

  const me = officers.find(o => o.id === currentUser?.id);
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'dispatch';

  const records = state.records || [];
  const myRecords = records.filter(r => r.officerBadge === me?.badge);

  const handleFormChange = (key, val) => setFormValues(prev => ({ ...prev, [key]: val }));

  const closeForm = () => {
    setSelectedTemplate(null);
    setFormValues({});
    setSavedAt(null);
  };

  const submitRecord = () => {
    if (!selectedTemplate) return;
    // Shares the global sequential report number — store stamps the value.
    const recNum = String(reportSeq).padStart(4, '0');
    dispatch({
      type: 'ADD_RECORD',
      payload: {
        type: selectedTemplate.name,
        recordNumber: recNum,
        officerBadge: me?.badge || currentUser?.badge || '*',
        status: 'Active',
        formData: { ...formValues },
        summary: Object.values(formValues).filter(v => typeof v === 'string' && v.length > 2).join(' | ').slice(0, 200) || 'Record created via CAD',
      },
    });
    try { localStorage.removeItem(DRAFT_KEY(selectedTemplate.id)); } catch { /* ignore */ }
    toast.success(`${selectedTemplate.name} created as ${recNum}.`, { title: 'Record Created' });
    closeForm();
  };

  const showForm   = selectedTemplate !== null;
  const selRecord  = selectedRecord ? records.find(r => r.id === selectedRecord) : null;
  const showRecord = !showForm && selRecord !== null;

  const draftMeta = {
    caseNumber: String(reportSeq).padStart(4, '0'),
    status: 'Draft',
  };

  // ══ Hybrid record-writer (Record Details · paper document · Related) ══
  if (showForm) {
    const tpl = selectedTemplate;
    const sectionTitles = tpl.sections ? tpl.sections.map(s => s.title) : ['Details'];
    const tabs = ['Record', ...sectionTitles];
    const now = new Date();

    const scrollTo = (title) => {
      setActiveTab(title);
      const sel = title === 'Record' ? '[data-doc-top]' : `[data-section="${title}"]`;
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
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 px-4 pt-2.5 pb-1.5">
            <MdAssignment size={18} className="text-brand-bright shrink-0" />
            <span className="text-[13px] font-bold text-white uppercase tracking-[0.4px]">Record Writing</span>
            <span className="text-[11px] text-slate-500">{tpl.name}{tpl.formCode ? ` · ${tpl.formCode}` : ''}</span>
            <span className="ml-auto flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-400">
              <span className={`w-1.5 h-1.5 rounded-full ${savedAt ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              AUTOSAVE: ON{savedAt && <span className="text-slate-600 font-normal"> · {savedAt.toLocaleTimeString()}</span>}
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

        {/* ── Body: 3 columns ── */}
        <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_300px] overflow-auto xl:overflow-hidden">

          {/* LEFT: record details */}
          <aside className="flex flex-col border-b xl:border-b-0 xl:border-r border-border-base bg-app-panel/60 xl:overflow-y-auto">
            <div className="px-4 py-3 border-b border-border-faint shrink-0 text-[11px] font-bold uppercase tracking-[0.7px] text-slate-300">Record Details</div>
            <div className="px-4">
              <Detail label="Record #" value={draftMeta.caseNumber} />
              <Detail label="Record Type" value={tpl.name} />
              <Detail label="Date / Time" value={now.toLocaleString()} />
              <Detail label="Issuing Officer" value={`${me?.badge || currentUser?.badge || '*'} · ${me?.name || currentUser?.name || ''}`} />
              <Detail label="Status" value={<span className={BADGE.gray}>Draft</span>} />
            </div>
          </aside>

          {/* CENTER: info strip + paper document */}
          <main className="flex flex-col min-h-[70vh] xl:min-h-0 overflow-hidden">
            <div className="shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 px-4 py-3 bg-app-panel/40 border-b border-border-faint">
              <div><div className="text-[9px] uppercase tracking-[0.5px] text-slate-500">Status</div><div className="mt-1"><span className={BADGE.gray}>Draft</span></div></div>
              <div><div className="text-[9px] uppercase tracking-[0.5px] text-slate-500">Date</div><div className="text-[12.5px] text-slate-200 mt-0.5">{now.toLocaleDateString()}</div></div>
              <div><div className="text-[9px] uppercase tracking-[0.5px] text-slate-500">Last Saved</div><div className="text-[12.5px] text-slate-200 mt-0.5">{savedAt ? savedAt.toLocaleTimeString() : '—'}</div></div>
            </div>
            <div className="flex-1 overflow-auto bg-app-bg/30 p-4 lg:p-6">
              <ReportForm template={tpl} data={formValues} onChange={handleFormChange}
                onBulkChange={(obj) => setFormValues(p => ({ ...p, ...obj }))} />
            </div>
          </main>

          {/* RIGHT: related */}
          <aside className="flex flex-col border-t xl:border-t-0 xl:border-l border-border-base bg-app-panel/60 xl:overflow-y-auto">
            <div className="px-4 py-3 border-b border-border-faint shrink-0 text-[11px] font-bold uppercase tracking-[0.7px] text-slate-300">Related Records</div>
            <div className="p-3 flex flex-col gap-3">
              <div className="bg-app-card/70 border border-border-base rounded-xl p-3">
                <div className="text-[9.5px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-2">Issuing Officer</div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-app-elevated border border-border-base flex items-center justify-center shrink-0"><MdShield size={18} className="text-slate-400" /></div>
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-semibold text-white truncate">{me?.name || currentUser?.name}</div>
                    <div className="text-[10.5px] text-slate-500">#{me?.badge || currentUser?.badge} · {me?.deptShort || 'HCSO'}</div>
                  </div>
                </div>
              </div>
              {[
                { icon: MdPerson, label: 'Subject' },
                { icon: MdDirectionsCar, label: 'Vehicle' },
                { icon: MdInventory2, label: 'Attachments' },
              ].map(c => (
                <div key={c.label} className="bg-app-card/70 border border-border-base rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-1.5"><c.icon size={13} /> {c.label}</div>
                  <div className="text-[11.5px] text-slate-600">Link from Records search</div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* ── Bottom action bar ── */}
        <div className="shrink-0 bg-app-toolbar/80 backdrop-blur-md border-t border-border-base p-3 md:px-4 md:py-2.5">
          <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center">
            <button className={`${S_BTN_SECONDARY} w-full md:w-auto`} onClick={closeForm}><MdArrowBack size={15} /> Back</button>
            <button className={`${S_BTN_SECONDARY} w-full md:w-auto`} onClick={exportPDF} disabled={pdfLoading}>
              <MdDownload size={15} /> {pdfLoading ? 'Generating…' : 'Save as PDF'}
            </button>
            <button className={`${S_BTN_DANGER} w-full md:w-auto`} onClick={() => setFormValues({})}><MdDeleteOutline size={15} /> Clear</button>
            <button className={`${S_BTN_PRIMARY} col-span-2 w-full md:col-span-1 md:w-auto md:ml-auto`} onClick={submitRecord}><MdCheckCircle size={15} /> Issue Record</button>
          </div>
        </div>
      </div>
    );
  }

  const sortedTemplates = [...(recordTemplates || [])].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden font-ui">

      {/* ── Mobile tab bar ── */}
      <div className="lg:hidden shrink-0 flex border-b border-border-base bg-app-toolbar/80 backdrop-blur-md">
        {[
          { id: 'new',     label: 'New Record' },
          { id: 'history', label: `Records (${records.length})` },
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
      <div className={`w-full lg:w-[240px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-border-base bg-app-panel/80 backdrop-blur-sm overflow-hidden
        ${mobileTab === 'new' ? 'flex-1 lg:flex-none' : 'hidden lg:flex'} lg:max-h-none`}>
        <div className="px-4 py-3 border-b border-border-faint shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-slate-400">Issue New Record</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Select a record type to begin</div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-2">
          {sortedTemplates.map(t => {
            const isSelected = selectedTemplate?.id === t.id;
            return (
              <button key={t.id}
                onClick={() => openTemplate(t)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 mb-0.5 rounded-lg text-left cursor-pointer border-l-[3px] transition-all ${
                  isSelected
                    ? 'bg-brand/15 border-l-brand text-brand-bright'
                    : 'bg-transparent border-l-transparent text-cad-text hover:bg-white/[0.05]'
                }`}
              >
                <MdDescription size={17} className="shrink-0 opacity-75" />
                <div className="min-w-0">
                  <div className={`text-[12px] leading-[1.3] ${isSelected ? 'font-bold text-brand-bright' : 'font-medium text-cad-text'}`}>
                    {t.name}
                  </div>
                  {t.formCode && (
                    <div className="text-[9px] text-cad-muted font-mono mt-px">{t.formCode}</div>
                  )}
                </div>
              </button>
            );
          })}

          {(!recordTemplates || recordTemplates.length === 0) && (
            <div className="px-3 py-4 text-[11px] text-cad-muted italic">No record templates configured</div>
          )}
        </div>
      </div>

      {/* ══ CENTER: Document area ══ hidden on mobile unless a record is open */}
      <div className={`flex-1 flex-col overflow-hidden bg-app-bg/20 ${showRecord ? 'flex' : 'hidden lg:flex'}`}>

        {showRecord && (
          <>
            <div className="px-3 py-1.5 bg-app-toolbar border-b border-border-base flex flex-wrap items-center gap-x-2.5 gap-y-1 shrink-0">
              <button className="lg:hidden flex items-center gap-1 text-[12px] text-brand-bright font-semibold mr-1 cursor-pointer bg-transparent border-none"
                onClick={() => { setSelectedRecord(null); setMobileTab('history'); }}>
                <MdArrowBack size={15} /> Back
              </button>
              <span className="text-[11px] font-bold text-cad-text uppercase tracking-[0.5px]">
                {selRecord.type}
              </span>
              <span className="text-[9px] text-cad-muted font-mono">
                {selRecord.recordNumber} * {selRecord.date}
              </span>
              <span className={`${STATUS_BADGE[selRecord.status] || BADGE.gray} text-[9px]`}>
                {selRecord.status}
              </span>
              {isAdmin && selRecord.status === 'Active' && (
                <div className="ml-auto flex gap-1.5">
                  <button className={xs(S_BTN_SECONDARY)} onClick={() => {
                    dispatch({ type: 'UPDATE_RECORD_STATUS', payload: { id: selRecord.id, status: 'Revoked' } });
                    toast.warning(`${selRecord.recordNumber} revoked.`, { title: 'Record Revoked' });
                  }}>
                    Revoke
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto p-4 lg:p-6 bg-app-bg/30">
              {(() => {
                const t = (recordTemplates || []).find(t => t.name === selRecord.type);
                if (t && selRecord.formData) return <ReportForm template={t} data={selRecord.formData} readOnly />;
                return (
                  <div className="max-w-[1100px] mx-auto bg-app-card/70 border border-border-base rounded-xl p-4 text-[13px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {selRecord.summary || 'No details on file.'}
                  </div>
                );
              })()}
            </div>
          </>
        )}

        {!showForm && !showRecord && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3.5 text-slate-600 p-10">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.3">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <div className="text-center">
              <div className="text-[13px] font-semibold text-slate-500 mb-1.5">No record open</div>
              <div className="text-[11px] text-slate-600 max-w-[260px] leading-relaxed">
                Select a record type from the left panel to begin issuing, or choose an existing record from the list on the right.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ RIGHT: Record history ═════════════════════════════════ */}
      <div className={`w-full lg:w-[280px] shrink-0 flex flex-col border-t lg:border-t-0 lg:border-l border-border-base bg-app-panel/80 backdrop-blur-sm overflow-hidden
        ${mobileTab === 'history' ? 'flex-1 lg:flex-none' : 'hidden lg:flex'} lg:max-h-none`}>
        <div className="px-4 py-3 border-b border-border-faint shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.7px] text-slate-400">Issued Records</span>
            <span className="text-[9px] font-mono text-slate-500">{records.length} total</span>
          </div>
          <div className="flex gap-1.5">
            {[
              { label: 'Active',  count: records.filter(r => r.status === 'Active').length,  color: 'text-green-400',  border: 'border-green-500/20' },
              { label: 'Expired', count: records.filter(r => r.status === 'Expired').length, color: 'text-slate-400',  border: 'border-slate-500/20' },
              { label: 'Revoked', count: records.filter(r => r.status === 'Revoked').length, color: 'text-red-400',    border: 'border-red-500/20' },
            ].map(s => (
              <div key={s.label} className={`flex-1 bg-app-card/70 border ${s.border} rounded-lg px-1.5 py-1.5 text-center`}>
                <div className={`text-[15px] font-extrabold ${s.color}`}>{s.count}</div>
                <div className="text-[8px] text-slate-500 uppercase tracking-[0.3px] font-bold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {records.length === 0 ? (
            <div className="p-5 text-center text-cad-muted text-[11px]">No records issued yet</div>
          ) : records.map(r => (
            <div key={r.id}
              onClick={() => { setSelectedRecord(r.id); setSelectedTemplate(null); setFormValues({}); setMobileTab('new'); }}
              className={`px-3 py-2.5 cursor-pointer border-b border-border-faint border-l-[3px] transition-colors ${
                selectedRecord === r.id
                  ? 'border-l-brand bg-brand/15'
                  : 'border-l-transparent bg-transparent hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`${STATUS_BADGE[r.status] || BADGE.gray} !text-[8px]`}>{r.status}</span>
                <span className="text-[8px] text-slate-500 font-mono ml-auto">{r.date}</span>
              </div>
              <div className="text-[12.5px] font-semibold text-white mb-0.5 leading-[1.2]">{r.type}</div>
              <div className="text-[10px] text-slate-500 font-mono">{r.recordNumber}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
