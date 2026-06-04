import { useMemo } from 'react';
import { useCAD } from '../../store/cadStore';
import {
  MdAssignment, MdHourglassEmpty, MdPersonSearch,
  MdDirectionsCar, MdLocationOn, MdCheckCircle,
} from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard } from './PortalKit';

const STATUS_MAP = {
  'Pending Review': { label: 'Awaiting review by law enforcement',        color: '#94a3b8', Icon: MdHourglassEmpty  },
  'Under Review':   { label: 'An officer has been assigned to your report', color: '#3a88e8', Icon: MdPersonSearch   },
  'En Route':       { label: 'An officer is en route to your location',     color: '#f5a93b', Icon: MdDirectionsCar  },
  'On Scene':       { label: 'An officer is on scene',                      color: '#e07020', Icon: MdLocationOn     },
  'Resolved':       { label: 'Your report has been resolved',               color: '#22c55e', Icon: MdCheckCircle    },
};

export default function MyReports() {
  const { state } = useCAD();

  const myCharIds = useMemo(
    () => state.civilians.filter(c => c.ownedByPlayer).map(c => c.id),
    [state.civilians],
  );

  const myReports = useMemo(
    () => state.reports
      .filter(r => r.officerBadge === 'CITIZEN' && myCharIds.includes(r.formData?.filerId))
      .slice()
      .reverse(),
    [state.reports, myCharIds],
  );

  return (
    <PortalPage>
      <PortalHeader
        icon={MdAssignment}
        title="My Reports"
        subtitle="Track the status of non-emergency reports you've filed."
        accent="brand"
      />

      {myReports.length === 0 ? (
        <PortalCard accent="brand" className="text-center px-6 py-[44px]">
          <div className="w-14 h-14 rounded-[14px] mx-auto mb-4 flex items-center justify-center bg-brand/15 border border-brand/30">
            <MdAssignment size={30} className="text-brand-bright" />
          </div>
          <div className="text-[15px] font-bold text-slate-100 mb-1.5">No reports filed yet</div>
          <div className="text-sm text-slate-400">Reports you file through "File Report" will appear here.</div>
        </PortalCard>
      ) : (
        <div className="flex flex-col gap-3.5">
          {myReports.map(r => {
            const st = STATUS_MAP[r.status] || STATUS_MAP['Pending Review'];
            const StIcon = st.Icon;
            return (
              <PortalCard key={r.id} accent="brand">
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="w-9 h-9 rounded-[10px] shrink-0 flex items-center justify-center"
                    style={{ background: `${st.color}22`, border: `1px solid ${st.color}55` }}>
                    <StIcon size={18} style={{ color: st.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[15px] font-bold text-slate-100">{r.formData?.reportType || r.type}</span>
                      <span className="font-mono text-[10px] text-slate-500">{r.caseNumber}</span>
                    </div>
                    <div className="text-[12.5px] font-semibold" style={{ color: st.color }}>{st.label}</div>
                    {r.formData?.description && (
                      <div className="mt-2 text-[12px] text-slate-400 line-clamp-2">{r.formData.description}</div>
                    )}
                  </div>
                </div>
                {(r.formData?.incidentDate || r.formData?.location || r.formData?.filedBy) && (
                  <div className="flex flex-wrap gap-5 mt-3 text-xs border-t border-border-faint pt-3">
                    {r.formData?.incidentDate && (
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.6px] uppercase text-cad-muted mb-0.5">Incident Date</div>
                        <div className="text-[13px] text-cad-text">{r.formData.incidentDate}</div>
                      </div>
                    )}
                    {r.formData?.location && (
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.6px] uppercase text-cad-muted mb-0.5">Location</div>
                        <div className="text-[13px] text-cad-text">{r.formData.location}</div>
                      </div>
                    )}
                    {r.formData?.filedBy && (
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.6px] uppercase text-cad-muted mb-0.5">Filed As</div>
                        <div className="text-[13px] text-cad-text">{r.formData.filedBy}</div>
                      </div>
                    )}
                  </div>
                )}
              </PortalCard>
            );
          })}
        </div>
      )}
    </PortalPage>
  );
}
