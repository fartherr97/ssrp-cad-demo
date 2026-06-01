import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCAD } from '../store/cadStore';
import { FormDocWrap, ReportDocument } from '../components/FormDocument';
import {
  MdBadge, MdGavel, MdDirectionsCar, MdWarning, MdDescription, MdAssignment,
} from 'react-icons/md';
import {
  BADGE, S_BTN_PRIMARY, S_BTN_SECONDARY, S_BTN_GHOST, xs,
} from '../constants/styles';

const CATEGORY_ICONS = {
  License:      MdBadge,
  Legal:        MdGavel,
  Citation:     MdDirectionsCar,
  Notice:       MdWarning,
  Registration: MdAssignment,
};

const CATEGORY_ORDER = ['License', 'Legal', 'Citation', 'Notice', 'Registration'];

const STATUS_BADGE = {
  'Active':   BADGE.green,
  'Expired':  BADGE.red,
  'Revoked':  BADGE.red,
  'Pending':  BADGE.orange,
  'Draft':    BADGE.gray,
};

export default function RecordsCenter() {
  const { state, dispatch } = useCAD();
  const { recordTemplates, currentUser, officers } = state;
  const [searchParams] = useSearchParams();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formValues, setFormValues]             = useState({});
  const [selectedRecord, setSelectedRecord]     = useState(null);

  useEffect(() => {
    const openName = searchParams.get('open');
    if (!openName || !recordTemplates?.length) return;
    const tpl = recordTemplates.find(t => t.name === decodeURIComponent(openName));
    if (tpl) { setSelectedTemplate(tpl); setFormValues({}); setSelectedRecord(null); }
  }, [searchParams, recordTemplates]);

  const me = officers.find(o => o.id === currentUser?.id);
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'dispatch';

  const records = state.records || [];
  const myRecords = records.filter(r => r.officerBadge === me?.badge);

  const handleFormChange = (key, val) => setFormValues(prev => ({ ...prev, [key]: val }));

  const submitRecord = () => {
    if (!selectedTemplate) return;
    const recNum = `REC-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    dispatch({
      type: 'ADD_RECORD',
      payload: {
        type: selectedTemplate.name,
        category: selectedTemplate.category,
        recordNumber: recNum,
        officerBadge: me?.badge || currentUser?.badge || '*',
        status: 'Active',
        formData: { ...formValues },
        summary: Object.values(formValues).filter(v => typeof v === 'string' && v.length > 2).join(' | ').slice(0, 200) || 'Record created via CAD',
      },
    });
    setSelectedTemplate(null);
    setFormValues({});
  };

  const showForm   = selectedTemplate !== null;
  const selRecord  = selectedRecord ? records.find(r => r.id === selectedRecord) : null;
  const showRecord = !showForm && selRecord !== null;

  const draftMeta = {
    caseNumber: `REC-${new Date().getFullYear()}-DRAFT`,
    status: 'Draft',
  };

  const groupedTemplates = {};
  (recordTemplates || []).forEach(t => {
    const cat = t.category || 'General';
    (groupedTemplates[cat] ||= []).push(t);
  });
  const sortedCats = Object.keys(groupedTemplates).sort(
    (a, b) => (CATEGORY_ORDER.indexOf(a) + 1 || 99) - (CATEGORY_ORDER.indexOf(b) + 1 || 99)
  );

  return (
    <div className="flex h-full overflow-hidden font-ui">

      {/* ══ LEFT: Template picker ══════════════════════════════════ */}
      <div className="w-[230px] shrink-0 flex flex-col border-r border-border-base bg-app-toolbar overflow-hidden">
        <div className="px-3 py-2 border-b border-border-base shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-cad-text">Issue New Record</div>
          <div className="text-[10px] text-cad-muted mt-0.5">Select a record type to begin</div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-1.5">
          {sortedCats.map(cat => {
            const IconComp = CATEGORY_ICONS[cat] || MdDescription;
            return (
              <div key={cat}>
                <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-cad-muted px-1.5 pb-2 pt-3 first:pt-1">
                  {cat}
                </div>
                {groupedTemplates[cat].map(t => {
                  const isSelected = selectedTemplate?.id === t.id;
                  return (
                    <button key={t.id}
                      onClick={() => { setSelectedTemplate(t); setFormValues({}); setSelectedRecord(null); }}
                      className={`w-full flex items-center gap-2.5 px-2 py-2.5 mb-0.5 text-left cursor-pointer border-l-[3px] transition-colors ${
                        isSelected
                          ? 'bg-sky-500/10 border-l-sky-500 text-sky-400'
                          : 'bg-transparent border-l-transparent text-cad-text hover:bg-white/[0.04]'
                      }`}
                    >
                      <IconComp size={17} className="shrink-0 opacity-75" />
                      <div className="min-w-0">
                        <div className={`text-[12px] leading-[1.3] ${isSelected ? 'font-bold text-sky-400' : 'font-medium text-cad-text'}`}>
                          {t.name}
                        </div>
                        {t.formCode && (
                          <div className="text-[9px] text-cad-muted font-mono mt-px">{t.formCode}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}

          {(!recordTemplates || recordTemplates.length === 0) && (
            <div className="px-3 py-4 text-[11px] text-cad-muted italic">No record templates configured</div>
          )}
        </div>
      </div>

      {/* ══ CENTER: Document area ══════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#2e2e32]">

        {showForm && (
          <>
            <div className="px-3 py-1.5 bg-app-toolbar border-b border-border-base flex items-center gap-2.5 shrink-0">
              <span className="text-[11px] font-bold text-cad-text uppercase tracking-[0.5px]">
                {selectedTemplate.name}
              </span>
              {selectedTemplate.formCode && (
                <span className="text-[9px] text-cad-muted font-mono">{selectedTemplate.formCode}</span>
              )}
              <span className="text-[9px] text-cad-muted font-mono">
                {me?.badge || '*'} * {me?.name || currentUser?.name}
              </span>
              <div className="ml-auto flex gap-2 items-center">
                <button className={xs(S_BTN_GHOST)} onClick={() => { setSelectedTemplate(null); setFormValues({}); }}>
                  * Discard
                </button>
                <button className={xs(S_BTN_PRIMARY)} onClick={submitRecord}>
                  Issue Record
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

        {showRecord && (
          <>
            <div className="px-3 py-1.5 bg-app-toolbar border-b border-border-base flex items-center gap-2.5 shrink-0">
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
                  <button className={xs(S_BTN_SECONDARY)} onClick={() =>
                    dispatch({ type: 'UPDATE_RECORD_STATUS', payload: { id: selRecord.id, status: 'Revoked' } })
                  }>
                    Revoke
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <FormDocWrap meta={{ caseNumber: selRecord.recordNumber, status: selRecord.status }}>
                <ReportDocument
                  type={selRecord.type}
                  template={(recordTemplates || []).find(t => t.name === selRecord.type)}
                  data={selRecord.formData || {}}
                  editable={false}
                  meta={{ caseNumber: selRecord.recordNumber, status: selRecord.status }}
                />
              </FormDocWrap>
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
      <div className="w-[270px] shrink-0 flex flex-col border-l border-border-base bg-app-toolbar overflow-hidden">
        <div className="px-3 py-2 border-b border-border-base shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-cad-text">Issued Records</span>
            <span className="text-[9px] font-mono text-cad-muted">{records.length} total</span>
          </div>
          <div className="flex gap-1">
            {[
              { label: 'Active',  count: records.filter(r => r.status === 'Active').length,  color: 'text-green-500',  border: 'border-green-500/10' },
              { label: 'Expired', count: records.filter(r => r.status === 'Expired').length, color: 'text-slate-500',  border: 'border-slate-500/10' },
              { label: 'Revoked', count: records.filter(r => r.status === 'Revoked').length, color: 'text-red-500',    border: 'border-red-500/10' },
            ].map(s => (
              <div key={s.label} className={`flex-1 bg-app-card border ${s.border} px-1.5 py-1 text-center`}>
                <div className={`text-[14px] font-bold ${s.color}`}>{s.count}</div>
                <div className="text-[8px] text-cad-muted uppercase tracking-[0.3px]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {records.length === 0 ? (
            <div className="p-5 text-center text-cad-muted text-[11px]">No records issued yet</div>
          ) : records.map(r => (
            <div key={r.id}
              onClick={() => { setSelectedRecord(r.id); setSelectedTemplate(null); setFormValues({}); }}
              className={`px-2.5 py-2 cursor-pointer border-b border-border-faint border-l-[3px] transition-colors ${
                selectedRecord === r.id
                  ? 'border-l-sky-500 bg-app-selected'
                  : 'border-l-transparent bg-transparent hover:bg-app-hover'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`${STATUS_BADGE[r.status] || BADGE.gray} !text-[8px]`}>{r.status}</span>
                <span className="text-[8px] text-cad-muted font-mono ml-auto">{r.date}</span>
              </div>
              <div className="text-[12px] font-semibold text-cad-text mb-0.5 leading-[1.2]">{r.type}</div>
              <div className="text-[10px] text-cad-muted font-mono">{r.recordNumber}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
