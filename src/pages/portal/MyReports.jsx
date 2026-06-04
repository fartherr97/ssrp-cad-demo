import { useMemo } from 'react';
import { useCAD } from '../../store/cadStore';
import {
  MdAssignment, MdHourglassEmpty, MdPersonSearch,
  MdDirectionsCar, MdLocationOn, MdCheckCircle, MdPhone,
} from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard } from './PortalKit';
import { useActiveCivilian, CivilianSwitcher } from '../../contexts/CivilianContext';

const REPORT_STATUS_MAP = {
  'Pending Review': { label: 'Awaiting review by law enforcement',          color: '#94a3b8', Icon: MdHourglassEmpty },
  'Under Review':   { label: 'An officer has been assigned to your report', color: '#3a88e8', Icon: MdPersonSearch   },
  'En Route':       { label: 'An officer is en route to your location',     color: '#f5a93b', Icon: MdDirectionsCar  },
  'On Scene':       { label: 'An officer is on scene',                      color: '#e07020', Icon: MdLocationOn     },
  'Resolved':       { label: 'Your report has been resolved',               color: '#22c55e', Icon: MdCheckCircle    },
};

const CALL_STATUS_MAP = {
  'Pending Dispatch': { label: 'Your call is in the dispatch queue',      color: '#f5a93b', Icon: MdHourglassEmpty },
  'Dispatched':       { label: 'Help has been dispatched to your location', color: '#22c55e', Icon: MdCheckCircle   },
};

function MetaRow({ items }) {
  const visible = items.filter(Boolean);
  if (!visible.length) return null;
  return (
    <div className="flex flex-wrap gap-5 mt-3 border-t border-border-faint pt-3">
      {visible.map(({ label, value }) => (
        <div key={label}>
          <div className="text-[10px] font-bold tracking-[0.6px] uppercase text-cad-muted mb-0.5">{label}</div>
          <div className="text-[13px] text-cad-text">{value}</div>
        </div>
      ))}
    </div>
  );
}

function ReportCard({ title, badge, st, body, meta }) {
  const StIcon = st.Icon;
  return (
    <PortalCard accent="brand">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="w-9 h-9 rounded-[10px] shrink-0 flex items-center justify-center"
          style={{ background: `${st.color}22`, border: `1px solid ${st.color}55` }}>
          <StIcon size={18} style={{ color: st.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[15px] font-bold text-slate-100">{title}</span>
            {badge && <span className="font-mono text-[10px] text-slate-500">{badge}</span>}
          </div>
          <div className="text-[12.5px] font-semibold" style={{ color: st.color }}>{st.label}</div>
          {body && <div className="mt-2 text-[12px] text-slate-400 line-clamp-2">{body}</div>}
        </div>
      </div>
      {meta}
    </PortalCard>
  );
}

export default function MyReports() {
  const { state } = useCAD();
  const { activeChar } = useActiveCivilian();
  const activeId = activeChar?.id ?? null;

  const nonEmergency = useMemo(
    () => state.reports
      .filter(r => r.officerBadge === 'CITIZEN' && r.formData?.filerId === activeId)
      .map(r => ({ _kind: 'report', _sortKey: r.id, ...r }))
      .reverse(),
    [state.reports, activeId],
  );

  const calls911 = useMemo(
    () => (state.civilian911Log || [])
      .filter(c => c.filerId === activeId)
      .map(c => ({ _kind: '911', _sortKey: c.receivedAt, ...c }))
      .slice()
      .reverse(),
    [state.civilian911Log, activeId],
  );

  const allItems = useMemo(
    () => [...nonEmergency, ...calls911].sort((a, b) => b._sortKey - a._sortKey),
    [nonEmergency, calls911],
  );

  const empty = allItems.length === 0;

  return (
    <PortalPage>
      <PortalHeader
        icon={MdAssignment}
        title="My Reports"
        subtitle="Track your active character's filed reports and 911 calls."
        accent="brand"
      />

      <CivilianSwitcher />

      {empty ? (
        <PortalCard accent="brand" className="text-center px-6 py-[44px]">
          <div className="w-14 h-14 rounded-[14px] mx-auto mb-4 flex items-center justify-center bg-brand/15 border border-brand/30">
            <MdAssignment size={30} className="text-brand-bright" />
          </div>
          <div className="text-[15px] font-bold text-slate-100 mb-1.5">Nothing filed yet</div>
          <div className="text-sm text-slate-400">Your filed reports and 911 calls will appear here.</div>
        </PortalCard>
      ) : (
        <div className="flex flex-col gap-3.5">
          {allItems.map(item => {
            if (item._kind === '911') {
              const st = CALL_STATUS_MAP[item.status] || CALL_STATUS_MAP['Pending Dispatch'];
              return (
                <ReportCard
                  key={item.id}
                  title="911 Emergency Call"
                  badge={<span className="inline-flex items-center gap-1 text-red-400"><MdPhone size={11} />911</span>}
                  st={st}
                  body={item.message}
                  meta={
                    <MetaRow items={[
                      item.location     && { label: 'Location',   value: item.location },
                      item.caller       && { label: 'Caller',     value: item.caller   },
                    ]} />
                  }
                />
              );
            }
            const st = REPORT_STATUS_MAP[item.status] || REPORT_STATUS_MAP['Pending Review'];
            return (
              <ReportCard
                key={item.id}
                title={item.formData?.reportType || item.type}
                badge={item.caseNumber}
                st={st}
                body={item.formData?.description}
                meta={
                  <MetaRow items={[
                    item.formData?.incidentDate && { label: 'Incident Date', value: item.formData.incidentDate },
                    item.formData?.location     && { label: 'Location',      value: item.formData.location     },
                    item.formData?.filedBy      && { label: 'Filed As',      value: item.formData.filedBy      },
                  ]} />
                }
              />
            );
          })}
        </div>
      )}
    </PortalPage>
  );
}
