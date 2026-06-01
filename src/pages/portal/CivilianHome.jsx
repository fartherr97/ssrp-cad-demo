import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCAD } from '../../store/cadStore';
import {
  MdHome, MdPerson, MdDirectionsCar, MdBadge, MdReportProblem,
  MdWarning, MdMenuBook, MdChevronRight,
} from 'react-icons/md';
import { PortalPage, PortalHeader, StatCard, PortalCard, SectionTitle } from './PortalKit';
import { BADGE } from '../../constants/styles';

const ACCENT = 'brand';

const DL_BADGE = {
  ACTIVE:    BADGE.green,
  SUSPENDED: BADGE.red,
  EXPIRED:   BADGE.orange,
};

export default function CivilianHome() {
  const { state } = useCAD();
  const navigate = useNavigate();
  const { civilians, vehicles, warrants, currentUser } = state;

  const myChars = useMemo(() => civilians.filter(c => c.ownedByPlayer), [civilians]);
  const myCharIds = useMemo(() => myChars.map(c => c.id), [myChars]);
  const myVehicles = useMemo(() => vehicles.filter(v => myCharIds.includes(v.ownerId)), [vehicles, myCharIds]);
  const validLicenses = useMemo(() => myChars.filter(c => c.dlStatus === 'ACTIVE').length, [myChars]);
  const myWarrants = useMemo(
    () => warrants.filter(w => myCharIds.includes(w.civilianId) && w.status === 'ACTIVE'),
    [warrants, myCharIds],
  );

  const QUICK = [
    { route: '/portal/characters',  icon: MdPerson,        title: 'My Characters', desc: 'Register and manage your identities.' },
    { route: '/portal/vehicles',    icon: MdDirectionsCar, title: 'My Vehicles',   desc: 'Register vehicles and view registration.' },
    { route: '/portal/licenses',    icon: MdBadge,         title: 'My Licenses',   desc: 'Driver licenses and weapon permits.' },
    { route: '/portal/file-report', icon: MdReportProblem, title: 'File a Report', desc: 'Report theft, vandalism, and more.' },
    { route: '/portal/laws',        icon: MdMenuBook,      title: 'State Laws',    desc: 'Browse the public penal code.' },
  ];

  return (
    <PortalPage>
      <PortalHeader
        icon={MdHome}
        title="Civilian Services"
        subtitle={`Welcome back, ${currentUser?.name || 'Citizen'} * manage your records and services here.`}
        accent={ACCENT}
      />

      {myWarrants.length > 0 && (
        <PortalCard accent="red" className="mb-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-[10px] shrink-0 flex items-center justify-center bg-red-400/10 border border-red-400/30">
            <MdWarning size={26} className="text-red-400" />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-extrabold text-red-300">
              {myWarrants.length} active warrant{myWarrants.length !== 1 ? 's' : ''} on your record{myWarrants.length !== 1 ? 's' : ''}
            </div>
            <div className="text-xs text-red-300/75 mt-[3px]">
              {myWarrants.map(w => `${w.civilianName} * ${w.charge}`).join('  •  ')}
            </div>
          </div>
        </PortalCard>
      )}

      <div className="flex gap-3.5 flex-wrap mb-7">
        <StatCard label="My Characters"  value={myChars.length}    accent={ACCENT}   icon={MdPerson} />
        <StatCard label="My Vehicles"    value={myVehicles.length} accent={ACCENT}   icon={MdDirectionsCar} />
        <StatCard label="Valid Licenses" value={validLicenses}     accent="green"    icon={MdBadge} />
        <StatCard
          label="Active Warrants"
          value={myWarrants.length}
          accent={myWarrants.length > 0 ? 'red' : ACCENT}
          icon={MdWarning}
          hint={myWarrants.length > 0 ? 'Action required' : 'All clear'}
        />
      </div>

      <SectionTitle accent={ACCENT}>Quick Actions</SectionTitle>
      <div className="grid gap-3.5 mb-[30px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))' }}>
        {QUICK.map(q => (
          <PortalCard key={q.route} accent={ACCENT} hover onClick={() => navigate(q.route)}>
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-[10px] shrink-0 flex items-center justify-center bg-brand/15 border border-brand/30">
                <q.icon size={24} className="text-brand-bright" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold text-slate-100">{q.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{q.desc}</div>
              </div>
              <MdChevronRight size={22} className="text-slate-500 shrink-0" />
            </div>
          </PortalCard>
        ))}
      </div>

      <SectionTitle accent={ACCENT}>My Characters</SectionTitle>
      {myChars.length === 0 ? (
        <PortalCard accent={ACCENT}>
          <div className="text-sm text-slate-400">
            You haven't registered any characters yet. Head to{' '}
            <span className="text-brand-bright font-semibold">My Characters</span> to get started.
          </div>
        </PortalCard>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))' }}>
          {myChars.map(c => (
            <PortalCard key={c.id} accent={ACCENT} hover onClick={() => navigate('/portal/characters')}>
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <MdPerson size={22} className="text-brand-bright shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[15px] font-bold text-slate-100">{c.firstName} {c.lastName}</div>
                    <div className="text-[11px] text-slate-500">DOB {c.dob}</div>
                  </div>
                </div>
                <span className={DL_BADGE[c.dlStatus] || BADGE.gray}>{c.dlStatus || 'N/A'}</span>
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </PortalPage>
  );
}
