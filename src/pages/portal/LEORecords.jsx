import { useState, useMemo } from 'react';
import { useCAD } from '../../store/cadStore';
import {
  MdFolder, MdDescription, MdExpandMore, MdExpandLess,
  MdHourglassEmpty, MdCheckCircle, MdBlock,
} from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard } from './PortalKit';
import { useActiveCivilian, CivilianSwitcher } from '../../contexts/CivilianContext';
import ReportForm from '../../components/ReportForm';

const STATUS_COLOR = {
  Active:         '#4ade80',
  Approved:       '#4ade80',
  Closed:         '#60a5fa',
  'Pending Review': '#fb923c',
  'Pending Changes': '#fbbf24',
};

function StatusBadge({ status }) {
  const color = STATUS_COLOR[status] || '#94a3b8';
  return (
    <span className="text-[10px] font-bold uppercase tracking-[0.4px] px-2 py-0.5 rounded-full border"
      style={{ color, background: `${color}18`, borderColor: `${color}44` }}>
      {status}
    </span>
  );
}

function RecordRow({ record, template }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden border border-border-faint"
      style={{ background: 'rgba(255,255,255,0.025)' }}>
      <button type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer hover:bg-white/[0.04] transition-colors">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(61,130,240,0.12)', border: '1px solid rgba(61,130,240,0.25)' }}>
          {template ? <MdDescription size={16} style={{ color: '#3d82f0' }} /> : <MdFolder size={16} style={{ color: '#22c55e' }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13.5px] font-bold text-slate-100">{record.type}</span>
            <span className="font-mono text-[10px] text-slate-500">#{record.recordNumber || record.caseNumber}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{record.date}</div>
        </div>
        <StatusBadge status={record.status} />
        {open
          ? <MdExpandLess size={18} className="text-slate-500 shrink-0" />
          : <MdExpandMore size={18} className="text-slate-500 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-border-faint px-4 pb-4 pt-3">
          {template ? (
            <ReportForm
              template={template}
              data={record.formData || {}}
              readOnly
            />
          ) : (
            <div className="text-[12px] text-slate-400 italic py-2">
              Template no longer available.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReportRow({ report, template }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden border border-border-faint"
      style={{ background: 'rgba(255,255,255,0.025)' }}>
      <button type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer hover:bg-white/[0.04] transition-colors">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <MdDescription size={16} style={{ color: '#f87171' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13.5px] font-bold text-slate-100">{report.type}</span>
            <span className="font-mono text-[10px] text-slate-500">#{report.caseNumber}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{report.date || report.formData?.ai_dt}</div>
        </div>
        <StatusBadge status={report.status} />
        {open
          ? <MdExpandLess size={18} className="text-slate-500 shrink-0" />
          : <MdExpandMore size={18} className="text-slate-500 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-border-faint px-4 pb-4 pt-3">
          {template ? (
            <ReportForm
              template={template}
              data={report.formData || {}}
              readOnly
            />
          ) : (
            <div className="text-[12px] text-slate-400 italic py-2">
              Template no longer available.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LEORecords() {
  const { state } = useCAD();
  const { activeChar } = useActiveCivilian();
  const activeId = activeChar?.id ?? null;

  const myRecords = useMemo(() => {
    if (!activeId) return [];
    return (state.records || []).filter(r => r.civilianId === activeId && !r.isDL);
  }, [state.records, activeId]);

  const myReports = useMemo(() => {
    if (!activeId) return [];
    const civName = activeChar ? `${activeChar.firstName} ${activeChar.lastName}`.toLowerCase() : '';
    return (state.reports || []).filter(r => {
      if (r.officerBadge === 'CITIZEN') return false;
      const fd = r.formData || {};
      return Object.values(fd).some(v =>
        typeof v === 'string' && v.toLowerCase() === civName
      );
    });
  }, [state.reports, activeId, activeChar]);

  const allItems = useMemo(() => [
    ...myRecords.map(r => ({ ...r, _kind: 'record' })),
    ...myReports.map(r => ({ ...r, _kind: 'report' })),
  ].sort((a, b) => (b.id || 0) - (a.id || 0)), [myRecords, myReports]);

  const getRecordTemplate = (r) =>
    r.templateSnapshot || (state.recordTemplates || []).find(t => t.name === r.type) || null;

  const getReportTemplate = (r) =>
    r.templateSnapshot || (state.reportTemplates || []).find(t => t.name === r.type) || null;

  const empty = allItems.length === 0;

  return (
    <PortalPage>
      <PortalHeader
        icon={MdFolder}
        title="Law Enforcement Records"
        subtitle="Records and reports filed by law enforcement against your active character. Read-only."
        accent="brand"
      />

      <CivilianSwitcher />

      {!activeChar ? (
        <PortalCard accent="brand" className="text-center px-6 py-[44px]">
          <MdBlock size={40} className="mx-auto mb-3 text-slate-600" />
          <div className="text-[15px] font-bold text-slate-100 mb-1">No active character</div>
          <div className="text-sm text-slate-400">Select a character to view records against them.</div>
        </PortalCard>
      ) : empty ? (
        <PortalCard accent="brand" className="text-center px-6 py-[44px]">
          <div className="w-14 h-14 rounded-[14px] mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(61,130,240,0.12)', border: '1px solid rgba(61,130,240,0.25)' }}>
            <MdHourglassEmpty size={30} className="text-brand-bright" />
          </div>
          <div className="text-[15px] font-bold text-slate-100 mb-1.5">No records on file</div>
          <div className="text-sm text-slate-400">
            Law enforcement has not filed any records or reports against {activeChar.firstName} {activeChar.lastName}.
          </div>
        </PortalCard>
      ) : (
        <div className="flex flex-col gap-2.5">
          {allItems.map(item =>
            item._kind === 'record'
              ? <RecordRow key={`rec-${item.id}`} record={item} template={getRecordTemplate(item)} />
              : <ReportRow key={`rep-${item.id}`} report={item} template={getReportTemplate(item)} />
          )}
        </div>
      )}

      {!empty && (
        <div className="mt-4 p-3 rounded-xl text-[11px] text-slate-500 text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <MdCheckCircle size={12} className="inline mr-1.5 text-green-500/60" />
          {allItems.length} record{allItems.length !== 1 ? 's' : ''} on file for {activeChar?.firstName} {activeChar?.lastName}. For questions or disputes, contact server administration.
        </div>
      )}
    </PortalPage>
  );
}
