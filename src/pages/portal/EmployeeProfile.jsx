import { useNavigate } from 'react-router-dom';
import {
  MdPerson, MdBusiness, MdGroup, MdPhone, MdCalendarToday,
  MdVerifiedUser, MdStore, MdCheck,
} from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard, SectionTitle } from './PortalKit';
import AccessDenied from './AccessDenied';
import { useActiveBusiness, BusinessSwitcher } from '../../contexts/BusinessContext';
import { BADGE } from '../../constants/styles';

const ACCENT = 'brand';

function getRoles(emp) {
  if (Array.isArray(emp?.roles)) return emp.roles;
  if (emp?.role) return [emp.role];
  return [];
}

function RoleBadge({ role }) {
  const special = { Manager: 'bg-amber-500/15 text-amber-300 border-amber-500/30', Supervisor: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
  const cls = special[role] || 'bg-brand/15 text-brand-bright border-brand/30';
  return <span className={`inline-block text-[11px] font-bold px-[9px] py-0.5 rounded-full border ${cls}`}>{role}</span>;
}

/* Avatar with initial */
function Avatar({ name, size = 'lg' }) {
  const initial = (name || '?').charAt(0).toUpperCase();
  const dim = size === 'lg' ? 'w-16 h-16 text-[22px]' : 'w-9 h-9 text-[13px]';
  return (
    <div className={`${dim} rounded-full bg-brand/20 border-2 border-brand/40 flex items-center justify-center font-bold text-brand-bright shrink-0`}>
      {initial}
    </div>
  );
}

export default function EmployeeProfile() {
  const navigate = useNavigate();
  const { activeBiz: myBiz, isOwner, myEmployeeRecord } = useActiveBusiness();

  if (!myBiz) return <AccessDenied portalName="the Business Center" />;

  const myRoles = isOwner ? ['Owner'] : getRoles(myEmployeeRecord);
  const myName = isOwner ? myBiz.owner : myEmployeeRecord?.name;
  const myPhone = isOwner ? myBiz.phone : myEmployeeRecord?.phone;
  const mySince = isOwner ? myBiz.licenseIssuedAt : myEmployeeRecord?.since;

  return (
    <PortalPage>
      <BusinessSwitcher />
      <PortalHeader
        icon={MdPerson}
        title="My Profile"
        subtitle={`${isOwner ? 'Owner' : 'Employee'} · ${myBiz.name}`}
        accent={ACCENT}
      />

      {/* Identity card */}
      <PortalCard accent={ACCENT} className="mb-5">
        <div className="flex items-center gap-4">
          <Avatar name={myName} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="text-[18px] font-bold text-white leading-tight">{myName || '—'}</div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {myRoles.map(r => <RoleBadge key={r} role={r} />)}
            </div>
          </div>
        </div>
        <div className="grid gap-5 mt-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))' }}>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-1 flex items-center gap-1.5">
              <MdPhone size={11} /> Phone
            </div>
            <div className="text-[13px] text-slate-200 font-medium">{myPhone || '—'}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-1 flex items-center gap-1.5">
              <MdCalendarToday size={11} /> {isOwner ? 'Business Since' : 'Employed Since'}
            </div>
            <div className="text-[13px] text-slate-200 font-medium">{mySince || '—'}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-1 flex items-center gap-1.5">
              <MdStore size={11} /> Employer
            </div>
            <div className="text-[13px] text-slate-200 font-medium">{myBiz.name}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-1 flex items-center gap-1.5">
              <MdVerifiedUser size={11} /> Business Status
            </div>
            <div>
              <span className={myBiz.status === 'ACTIVE' ? BADGE.green : BADGE.gray}>{myBiz.status}</span>
            </div>
          </div>
        </div>
      </PortalCard>

      {/* Business info */}
      <SectionTitle accent={ACCENT}><MdBusiness size={13} /> Business Information</SectionTitle>
      <PortalCard accent={ACCENT} className="mb-5">
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))' }}>
          {[
            { label: 'Business Name', value: myBiz.name },
            { label: 'Type', value: myBiz.type },
            { label: 'Owner', value: myBiz.owner },
            { label: 'EIN', value: myBiz.ein, mono: true },
            { label: 'Phone', value: myBiz.phone },
            { label: 'Address', value: myBiz.address },
            { label: 'License #', value: myBiz.license, mono: true },
            { label: 'License Status', value: myBiz.licenseStatus },
          ].map(({ label, value, mono }) => (
            <div key={label}>
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-1">{label}</div>
              <div className={`text-[13px] text-slate-200 font-medium ${mono ? 'font-mono' : ''}`}>{value || '—'}</div>
            </div>
          ))}
        </div>
      </PortalCard>

      {/* Team roster — read-only */}
      <SectionTitle accent={ACCENT}><MdGroup size={13} /> Our Team</SectionTitle>
      {myBiz.employees.length === 0 ? (
        <PortalCard accent={ACCENT} className="text-center py-10">
          <div className="text-sm text-slate-400">No team members listed yet.</div>
        </PortalCard>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))' }}>
          {myBiz.employees.map(emp => {
            const isMe = myEmployeeRecord?.id === emp.id;
            const empRoles = getRoles(emp);
            return (
              <PortalCard key={emp.id} accent={ACCENT} className="flex items-center gap-3.5">
                <Avatar name={emp.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[13px] font-bold text-slate-100 truncate">{emp.name}</span>
                    {isMe && (
                      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
                        <MdCheck size={10} /> You
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {empRoles.map(r => <RoleBadge key={r} role={r} />)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1.5">{emp.phone || ''}{emp.since ? ` · Since ${emp.since}` : ''}</div>
                </div>
              </PortalCard>
            );
          })}
        </div>
      )}

      {/* Owner shortcut to management */}
      {isOwner && (
        <div className="mt-6 flex gap-3 flex-wrap">
          <button
            onClick={() => navigate('/portal/my-business')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12.5px] font-bold bg-brand/15 border border-brand/30 text-brand-bright hover:bg-brand/25 transition-colors cursor-pointer press-sm"
          >
            <MdBusiness size={16} /> Edit Business Profile
          </button>
          <button
            onClick={() => navigate('/portal/employees')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12.5px] font-bold bg-brand/15 border border-brand/30 text-brand-bright hover:bg-brand/25 transition-colors cursor-pointer press-sm"
          >
            <MdGroup size={16} /> Manage Employees
          </button>
        </div>
      )}
    </PortalPage>
  );
}
