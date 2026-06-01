import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAssignment, MdBusiness, MdInfo } from 'react-icons/md';
import { useCAD } from '../../store/cadStore';
import { PortalPage, PortalHeader, StatCard, PortalCard } from './PortalKit';
import { S_BTN_PRIMARY, BADGE } from '../../constants/styles';

const ACCENT = 'brand';

export default function BusinessIncidents() {
  const { state } = useCAD();
  const navigate = useNavigate();
  const myBiz = state.businesses.find(b => b.ownedByPlayer);

  const [filter, setFilter] = useState('ALL');

  if (!myBiz) {
    return (
      <PortalPage>
        <PortalHeader icon={MdAssignment} title="Business Incidents" subtitle="Incidents filed against your business by law enforcement." accent={ACCENT} />
        <PortalCard accent={ACCENT} className="text-center px-6 py-[44px]">
          <div className="text-sm text-slate-400 mb-[18px]">
            You need to register a business before you can view incidents.
          </div>
          <button className={`${S_BTN_PRIMARY} inline-flex items-center gap-1.5`} onClick={() => navigate('/portal/my-business')}>
            <MdBusiness size={16} /> Register your business
          </button>
        </PortalCard>
      </PortalPage>
    );
  }

  const incidents = myBiz.incidents;
  const openCount = incidents.filter(i => i.status === 'Open').length;
  const closedCount = incidents.filter(i => i.status === 'Closed').length;

  const COUNTS = { ALL: incidents.length, Open: openCount, Closed: closedCount };

  const filtered = (filter === 'ALL' ? incidents : incidents.filter(i => i.status === filter))
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <PortalPage>
      <PortalHeader
        icon={MdAssignment}
        title="Business Incidents"
        subtitle={`Incidents on record for ${myBiz.name}`}
        accent={ACCENT}
      />

      <div className="flex gap-3.5 flex-wrap mb-[22px]">
        <StatCard label="Total Incidents" value={incidents.length} accent={ACCENT} icon={MdAssignment} hint="All records" />
        <StatCard label="Open" value={openCount} accent={openCount > 0 ? 'amber' : ACCENT} icon={MdAssignment} hint={openCount > 0 ? 'Active investigations' : 'None open'} />
        <StatCard label="Closed" value={closedCount} accent="green" icon={MdAssignment} hint="Resolved" />
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-[18px] flex-wrap">
        {['ALL', 'Open', 'Closed'].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-semibold rounded-lg cursor-pointer border transition-all ${
              filter === t
                ? 'bg-blue-600 text-white border-transparent'
                : 'bg-white/[0.05] text-slate-300 border-border-base'
            }`}
          >
            {t} ({COUNTS[t]})
          </button>
        ))}
      </div>

      {/* Read-only note */}
      <div className="flex items-center gap-2 mb-[18px] text-xs text-slate-400">
        <MdInfo size={15} className="text-slate-400 shrink-0" />
        Incidents are filed by law enforcement and cannot be added or edited here.
      </div>

      {filtered.length === 0 ? (
        <PortalCard accent={ACCENT} className="text-center px-6 py-[44px]">
          <div className="w-14 h-14 rounded-[14px] mx-auto mb-4 flex items-center justify-center bg-brand/15 border border-brand/30">
            <MdAssignment size={30} className="text-brand-bright" />
          </div>
          <div className="text-[15px] font-bold text-slate-100 mb-1.5">
            {filter === 'ALL' ? 'No incidents on record' : `No ${filter.toLowerCase()} incidents`}
          </div>
          <div className="text-sm text-slate-400">
            {filter === 'ALL' ? 'Your business has a clean record.' : 'Try a different filter.'}
          </div>
        </PortalCard>
      ) : (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))' }}>
          {filtered.map(inc => (
            <PortalCard key={inc.id} accent={inc.status === 'Open' ? 'amber' : ACCENT}>
              <div className="flex justify-between items-start gap-2.5 mb-2">
                <div className="min-w-0">
                  <div className="text-[15px] font-bold text-slate-100 leading-tight">{inc.type}</div>
                  <div className="text-xs text-slate-400 mt-[3px]">{inc.date}</div>
                </div>
                <span className={inc.status === 'Open' ? BADGE.orange : BADGE.gray}>{inc.status}</span>
              </div>
              <div className="text-sm text-slate-300 leading-relaxed">{inc.summary}</div>
            </PortalCard>
          ))}
        </div>
      )}
    </PortalPage>
  );
}
