import { useNavigate } from 'react-router-dom';
import {
  MdStore, MdGroup, MdReceiptLong,
  MdCheckCircle, MdBusiness, MdMenuBook,
} from 'react-icons/md';
import { PortalPage, PortalHeader, StatCard, PortalCard, SectionTitle } from './PortalKit';
import AccessDenied from './AccessDenied';
import { useActiveBusiness, BusinessSwitcher } from '../../contexts/BusinessContext';

const ACCENT = 'brand';

const QUICK_ACTIONS = [
  { to: '/portal/my-business', icon: MdBusiness,    title: 'My Business',  desc: 'View & edit your business profile' },
  { to: '/portal/employees',   icon: MdGroup,       title: 'Employees',    desc: 'Manage your staff roster' },
  { to: '/portal/laws',        icon: MdMenuBook,    title: 'State Laws',   desc: 'Browse the penal code reference' },
];

export default function BusinessHome() {
  const navigate = useNavigate();
  const { activeBiz: myBiz } = useActiveBusiness();

  if (!myBiz) return <AccessDenied portalName="the Business Center" />;

  return (
    <PortalPage>
      <BusinessSwitcher />
      <PortalHeader
        icon={MdStore}
        title={myBiz.name}
        subtitle={`${myBiz.type} · License ${myBiz.license}`}
        accent={ACCENT}
      />

      <div className="flex gap-3.5 flex-wrap mb-7">
        <StatCard label="Employees" value={myBiz.employees.length} accent={ACCENT} icon={MdGroup} hint="On the roster" />
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

    </PortalPage>
  );
}
