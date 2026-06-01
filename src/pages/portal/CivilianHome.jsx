import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCAD } from '../../store/cadStore';
import {
  MdHome, MdPerson, MdDirectionsCar, MdBadge, MdReportProblem,
  MdWarning, MdMenuBook, MdChevronRight,
} from 'react-icons/md';
import { PortalPage, PortalHeader, StatCard, PortalCard, SectionTitle } from './PortalKit';
import { BADGE } from '../../constants/styles';

const ACCENT = '#9090cc';

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
        subtitle={`Welcome back, ${currentUser?.name || 'Citizen'} — manage your records and services here.`}
        accent={ACCENT}
      />

      {myWarrants.length > 0 && (
        <PortalCard accent="#ff5454" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#ff545422', border: '1px solid #ff545455',
          }}>
            <MdWarning size={26} color="#ff5454" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#ff8080' }}>
              {myWarrants.length} active warrant{myWarrants.length !== 1 ? 's' : ''} on your record{myWarrants.length !== 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,180,180,0.75)', marginTop: 3 }}>
              {myWarrants.map(w => `${w.civilianName} — ${w.charge}`).join('  •  ')}
            </div>
          </div>
        </PortalCard>
      )}

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard label="My Characters"  value={myChars.length}    accent={ACCENT}   icon={MdPerson} />
        <StatCard label="My Vehicles"    value={myVehicles.length} accent={ACCENT}   icon={MdDirectionsCar} />
        <StatCard label="Valid Licenses" value={validLicenses}     accent="#2fd968"  icon={MdBadge} />
        <StatCard
          label="Active Warrants"
          value={myWarrants.length}
          accent={myWarrants.length > 0 ? '#ff5454' : ACCENT}
          icon={MdWarning}
          hint={myWarrants.length > 0 ? 'Action required' : 'All clear'}
        />
      </div>

      <SectionTitle accent={ACCENT}>Quick Actions</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 30 }}>
        {QUICK.map(q => (
          <PortalCard key={q.route} accent={ACCENT} hover onClick={() => navigate(q.route)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${ACCENT}1f`, border: `1px solid ${ACCENT}55`,
              }}>
                <q.icon size={24} color={ACCENT} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#e6eef6' }}>{q.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(160,185,215,0.6)', marginTop: 2 }}>{q.desc}</div>
              </div>
              <MdChevronRight size={22} color="rgba(160,185,215,0.4)" />
            </div>
          </PortalCard>
        ))}
      </div>

      <SectionTitle accent={ACCENT}>My Characters</SectionTitle>
      {myChars.length === 0 ? (
        <PortalCard accent={ACCENT}>
          <div style={{ fontSize: 13, color: 'rgba(160,185,215,0.6)' }}>
            You haven't registered any characters yet. Head to{' '}
            <span style={{ color: ACCENT, fontWeight: 600 }}>My Characters</span> to get started.
          </div>
        </PortalCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {myChars.map(c => (
            <PortalCard key={c.id} accent={ACCENT} hover onClick={() => navigate('/portal/characters')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <MdPerson size={22} color={ACCENT} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#e6eef6' }}>{c.firstName} {c.lastName}</div>
                    <div style={{ fontSize: 11, color: 'rgba(160,185,215,0.55)' }}>DOB {c.dob}</div>
                  </div>
                </div>
                <span style={DL_BADGE[c.dlStatus] || BADGE.gray}>{c.dlStatus || 'N/A'}</span>
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </PortalPage>
  );
}
