import { useNavigate } from 'react-router-dom';
import {
  MdStore, MdGroup, MdReceiptLong,
  MdCheckCircle, MdBusiness, MdMenuBook,
} from 'react-icons/md';
import { PortalPage, PortalHeader, StatCard, PortalCard, SectionTitle } from './PortalKit';
import AccessDenied from './AccessDenied';
import { useActiveBusiness, BusinessSwitcher } from '../../contexts/BusinessContext';

function licenseDaysLeft(issuedAt) {
  if (!issuedAt) return null;
  const expiry = new Date(issuedAt).getTime() + 90 * 24 * 60 * 60 * 1000;
  return Math.ceil((expiry - Date.now()) / (24 * 60 * 60 * 1000));
}

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

      {(() => {
        const days = licenseDaysLeft(myBiz.licenseIssuedAt);
        const licRevoked  = myBiz.licenseStatus === 'REVOKED';
        const licExpired  = !licRevoked && (days === null || days <= 0);
        const licWarn     = !licRevoked && !licExpired && days !== null && days <= 14;
        const licAccent   = licRevoked || licExpired ? 'red' : licWarn ? 'amber' : 'green';
        const licVal      = licRevoked ? 'REVOKED' : licExpired ? 'EXPIRED' : days !== null ? `${days}d` : (myBiz.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE');
        const licHint     = licRevoked ? 'License has been revoked'
          : licExpired  ? 'License has expired, contact admin'
          : licWarn     ? `Expires in ${days} day${days === 1 ? '' : 's'}, renew soon`
          : days !== null ? `${days} days remaining`
          : `Expires ${myBiz.licenseExpiry}`;
        return (
          <div className="flex gap-3.5 flex-wrap mb-7">
            <StatCard label="Employees"       value={myBiz.employees.length} accent={ACCENT}   icon={MdGroup}       hint="On the roster" />
            <StatCard label="License"         value={licVal}                 accent={licAccent} icon={MdReceiptLong} hint={licHint} />
            <StatCard label="Business Status" value={myBiz.status}           accent={myBiz.status === 'ACTIVE' ? 'green' : 'amber'} icon={MdCheckCircle} hint="Operating status" />
          </div>
        );
      })()}

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
