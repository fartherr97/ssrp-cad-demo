import { useNavigate } from 'react-router-dom';
import { useCAD } from '../../store/cadStore';
import {
  MdStore, MdGroup, MdAssignment, MdReceiptLong,
  MdCheckCircle, MdBusiness, MdMenuBook,
} from 'react-icons/md';
import { PortalPage, PortalHeader, StatCard, PortalCard, SectionTitle } from './PortalKit';
import { S_BTN_PRIMARY, BADGE } from '../../constants/styles';

const ACCENT = 'brand';

const QUICK_ACTIONS = [
  { to: '/portal/my-business', icon: MdBusiness,    title: 'My Business',  desc: 'View & edit your business profile' },
  { to: '/portal/employees',   icon: MdGroup,       title: 'Employees',    desc: 'Manage your staff roster' },
  { to: '/portal/incidents',   icon: MdAssignment,  title: 'Incidents',    desc: 'Review filed business incidents' },
  { to: '/portal/laws',        icon: MdMenuBook,    title: 'State Laws',   desc: 'Browse the penal code reference' },
];

export default function BusinessHome() {
  const { state } = useCAD();
  const navigate = useNavigate();
  const myBiz = state.businesses.find(b => b.ownedByPlayer);

  if (!myBiz) {
    return (
      <PortalPage>
        <PortalHeader
          icon={MdStore}
          title="Business Portal"
          subtitle="Register your business to access the self-service dashboard."
          accent={ACCENT}
        />
        <PortalCard accent={ACCENT} className="text-center p-12">
          <div className="w-16 h-16 rounded-[16px] mx-auto mb-[18px] flex items-center justify-center bg-brand/15 border border-brand/30">
            <MdStore size={34} className="text-brand-bright" />
          </div>
          <div className="text-lg font-extrabold text-white mb-2">
            Welcome * let's get you set up
          </div>
          <div className="text-sm text-slate-400 max-w-[440px] mx-auto mb-[22px] leading-relaxed">
            You don't have a registered business yet. Register one to manage your profile,
            employees, and track incidents filed by law enforcement.
          </div>
          <button className={S_BTN_PRIMARY} onClick={() => navigate('/portal/my-business')}>
            Register your business
          </button>
        </PortalCard>
      </PortalPage>
    );
  }

  const openIncidents = myBiz.incidents.filter(i => i.status === 'Open').length;
  const recentIncidents = [...myBiz.incidents]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  return (
    <PortalPage>
      <PortalHeader
        icon={MdStore}
        title={myBiz.name}
        subtitle={`${myBiz.type} · License ${myBiz.license}`}
        accent={ACCENT}
      />

      <div className="flex gap-3.5 flex-wrap mb-7">
        <StatCard label="Employees" value={myBiz.employees.length} accent={ACCENT} icon={MdGroup} hint="On the roster" />
        <StatCard label="Open Incidents" value={openIncidents} accent={openIncidents > 0 ? 'red' : ACCENT} icon={MdAssignment} hint={openIncidents > 0 ? 'Require attention' : 'All clear'} />
        <StatCard label="License" value={myBiz.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'} accent={myBiz.status === 'ACTIVE' ? 'green' : 'amber'} icon={MdReceiptLong} hint={`Expires ${myBiz.licenseExpiry}`} />
        <StatCard label="Business Status" value={myBiz.status} accent={myBiz.status === 'ACTIVE' ? 'green' : 'amber'} icon={MdCheckCircle} hint="Operating status" />
      </div>

      <SectionTitle accent={ACCENT}>Quick Actions</SectionTitle>
      <div className="grid gap-3.5 mb-[30px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))' }}>
        {QUICK_ACTIONS.map(a => (
          <PortalCard key={a.to} accent={ACCENT} hover onClick={() => navigate(a.to)} className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[10px] shrink-0 flex items-center justify-center bg-brand/15 border border-brand/30">
              <a.icon size={24} className="text-brand-bright" />
            </div>
            <div className="min-w-0">
              <div className="text-[15px] font-bold text-slate-100">{a.title}</div>
              <div className="text-xs text-slate-400 mt-0.5">{a.desc}</div>
            </div>
          </PortalCard>
        ))}
      </div>

      <SectionTitle accent={ACCENT}>Recent Incidents</SectionTitle>
      <PortalCard accent={ACCENT}>
        {recentIncidents.length === 0 ? (
          <div className="text-center p-6 text-slate-500 text-sm">
            No incidents on record.
          </div>
        ) : (
          <div className="flex flex-col">
            {recentIncidents.map((inc, idx) => (
              <div key={inc.id} className={`flex items-center gap-3 py-3 ${idx !== 0 ? 'border-t border-border-faint' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-100">{inc.type}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{inc.date}</div>
                </div>
                <span className={inc.status === 'Open' ? BADGE.orange : BADGE.gray}>{inc.status}</span>
              </div>
            ))}
          </div>
        )}
      </PortalCard>
    </PortalPage>
  );
}
