import { useNavigate } from 'react-router-dom';
import { useCAD } from '../../store/cadStore';
import {
  MdStore, MdGroup, MdAssignment, MdReceiptLong,
  MdCheckCircle, MdBusiness, MdMenuBook,
} from 'react-icons/md';
import { PortalPage, PortalHeader, StatCard, PortalCard, SectionTitle } from './PortalKit';

const ACCENT = '#44aacc';

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
        <PortalCard accent={ACCENT} style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${ACCENT}1f`, border: `1px solid ${ACCENT}55`,
          }}>
            <MdStore size={34} color={ACCENT} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            Welcome — let's get you set up
          </div>
          <div style={{ fontSize: 13, color: 'rgba(180,200,230,0.6)', maxWidth: 440, margin: '0 auto 22px', lineHeight: 1.5 }}>
            You don't have a registered business yet. Register one to manage your profile,
            employees, and track incidents filed by law enforcement.
          </div>
          <button className="n-btn n-btn-primary" onClick={() => navigate('/portal/my-business')}>
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

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard label="Employees" value={myBiz.employees.length} accent={ACCENT} icon={MdGroup} hint="On the roster" />
        <StatCard label="Open Incidents" value={openIncidents} accent={openIncidents > 0 ? '#ff5454' : ACCENT} icon={MdAssignment} hint={openIncidents > 0 ? 'Require attention' : 'All clear'} />
        <StatCard label="License" value={myBiz.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'} accent={myBiz.status === 'ACTIVE' ? '#2fd968' : '#f5a93b'} icon={MdReceiptLong} hint={`Expires ${myBiz.licenseExpiry}`} />
        <StatCard label="Business Status" value={myBiz.status} accent={myBiz.status === 'ACTIVE' ? '#2fd968' : '#f5a93b'} icon={MdCheckCircle} hint="Operating status" />
      </div>

      <SectionTitle accent={ACCENT}>Quick Actions</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14, marginBottom: 30 }}>
        {QUICK_ACTIONS.map(a => (
          <PortalCard key={a.to} accent={ACCENT} hover onClick={() => navigate(a.to)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${ACCENT}1f`, border: `1px solid ${ACCENT}55`,
            }}>
              <a.icon size={24} color={ACCENT} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#e6eef6' }}>{a.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(170,195,225,0.55)', marginTop: 2 }}>{a.desc}</div>
            </div>
          </PortalCard>
        ))}
      </div>

      <SectionTitle accent={ACCENT}>Recent Incidents</SectionTitle>
      <PortalCard accent={ACCENT}>
        {recentIncidents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'rgba(150,175,205,0.5)', fontSize: 13 }}>
            No incidents on record.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentIncidents.map((inc, idx) => (
              <div key={inc.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                borderTop: idx === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#e6eef6' }}>{inc.type}</div>
                  <div style={{ fontSize: 12, color: 'rgba(160,185,215,0.6)', marginTop: 2 }}>{inc.date}</div>
                </div>
                <span className={`n-badge ${inc.status === 'Open' ? 'badge-orange' : 'badge-gray'}`}>{inc.status}</span>
              </div>
            ))}
          </div>
        )}
      </PortalCard>
    </PortalPage>
  );
}
