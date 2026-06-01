import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCAD } from '../../store/cadStore';
import {
  MdAdminPanelSettings, MdPeople, MdGroups, MdLocalPolice, MdCampaign,
  MdTune, MdMenuBook, MdBlock, MdBuild, MdHistory, MdChevronRight,
  MdDashboard, MdShield, MdDns,
} from 'react-icons/md';
import { PortalPage, PortalHeader, StatCard, PortalCard, SectionTitle } from './PortalKit';

const ACCENT = '#c09010';

const KIND_COLOR = {
  call:  '#3a88e8',
  unit:  '#2fd968',
  alert: '#ff5454',
  admin: ACCENT,
};

export default function AdminHome() {
  const { state } = useCAD();
  const navigate = useNavigate();
  const {
    officers, calls, adminAccounts, auditLog, departments,
    bannedUsers, adminServers, currentUser,
  } = state;

  const onDuty = useMemo(() => officers.filter(o => o.status !== 'OFFDUTY').length, [officers]);
  const activeCalls = useMemo(() => calls.filter(c => c.status !== 'CLOSED').length, [calls]);
  const priorityCalls = useMemo(() => calls.filter(c => c.priority === 1 && c.status !== 'CLOSED').length, [calls]);
  const suspended = useMemo(() => adminAccounts.filter(a => a.status !== 'ACTIVE').length, [adminAccounts]);
  const onlineServers = useMemo(() => (adminServers || []).filter(s => s.status === 'ONLINE').length, [adminServers]);

  const recentLog = useMemo(() => auditLog.slice(0, 5), [auditLog]);

  const MANAGE = [
    { route: '/admin',     icon: MdTune,                title: 'Customization Suite', desc: 'Community config, codes, departments & more.' },
    { route: '/admin/accounts', icon: MdPeople,         title: 'User Accounts',       desc: 'Manage members, permissions & API access.' },
    { route: '/penal',     icon: MdMenuBook,            title: 'Penal Code Editor',   desc: 'Edit statutes, charges, fines & bonds.' },
    { route: '/bans',      icon: MdBlock,               title: 'Ban Management',      desc: 'Review and issue community bans.' },
    { route: '/builder',   icon: MdBuild,               title: 'Form Builder',        desc: 'Design custom report templates.' },
    { route: '/admin/logs',icon: MdHistory,             title: 'System Logs',         desc: 'Full audit trail of every action.' },
  ];

  const OPS = [
    { route: '/cad',   icon: MdDashboard, title: 'Dispatch (CAD)', desc: 'Live calls & unit console.' },
    { route: '/units', icon: MdGroups,    title: 'Unit Management', desc: 'Roster & status overview.' },
    { route: '/board', icon: MdShield,    title: 'Dispatch Board',  desc: 'Assignment board view.' },
  ];

  return (
    <PortalPage>
      <PortalHeader
        icon={MdAdminPanelSettings}
        title="Command & Administration"
        subtitle={`Welcome back, ${currentUser?.name || 'Administrator'} — full oversight of the community.`}
        accent={ACCENT}
      />

      {priorityCalls > 0 && (
        <PortalCard accent="#ff5454" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#ff545422', border: '1px solid #ff545455',
          }}>
            <MdCampaign size={26} color="#ff5454" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#ff8080' }}>
              {priorityCalls} priority-1 call{priorityCalls !== 1 ? 's' : ''} active
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,180,180,0.75)', marginTop: 3 }}>
              High-priority incidents require command awareness — open the CAD console to review.
            </div>
          </div>
          <button className="n-btn n-btn-danger" onClick={() => navigate('/cad')}>Open CAD</button>
        </PortalCard>
      )}

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard label="Units On Duty"   value={onDuty}             accent="#2fd968" icon={MdLocalPolice} hint={`${officers.length} total members`} />
        <StatCard label="Active Calls"    value={activeCalls}        accent={priorityCalls > 0 ? '#ff5454' : ACCENT} icon={MdDashboard} hint={priorityCalls > 0 ? `${priorityCalls} priority-1` : 'Nominal'} />
        <StatCard label="User Accounts"   value={adminAccounts.length} accent={ACCENT} icon={MdPeople} hint={suspended > 0 ? `${suspended} restricted` : 'All in good standing'} />
        <StatCard label="Departments"     value={departments.length} accent="#44aacc" icon={MdShield} hint="Configured agencies" />
        <StatCard label="Servers Online"  value={`${onlineServers}/${(adminServers || []).length}`} accent={onlineServers === (adminServers || []).length ? '#2fd968' : '#f5a93b'} icon={MdDns} hint="Connected game servers" />
        <StatCard label="Active Bans"     value={(bannedUsers || []).length} accent={(bannedUsers || []).length > 0 ? '#ff5454' : ACCENT} icon={MdBlock} hint="Community-wide" />
      </div>

      <SectionTitle accent={ACCENT}>Administration</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 30 }}>
        {MANAGE.map(q => (
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

      <SectionTitle accent={ACCENT}>Operations</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14, marginBottom: 30 }}>
        {OPS.map(q => (
          <PortalCard key={q.route} accent="#3a88e8" hover onClick={() => navigate(q.route)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#3a88e81f', border: '1px solid #3a88e855',
            }}>
              <q.icon size={24} color="#3a88e8" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#e6eef6' }}>{q.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(170,195,225,0.55)', marginTop: 2 }}>{q.desc}</div>
            </div>
          </PortalCard>
        ))}
      </div>

      <SectionTitle accent={ACCENT}>Recent Activity</SectionTitle>
      <PortalCard accent={ACCENT}>
        {recentLog.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'rgba(150,175,205,0.5)', fontSize: 13 }}>
            No activity on record.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentLog.map((l, idx) => (
              <div key={l.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                borderTop: idx === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                  color: KIND_COLOR[l.module?.toLowerCase()] || ACCENT,
                  background: `${KIND_COLOR[l.module?.toLowerCase()] || ACCENT}1f`,
                  border: `1px solid ${KIND_COLOR[l.module?.toLowerCase()] || ACCENT}44`,
                  borderRadius: 5, padding: '3px 8px', flexShrink: 0, minWidth: 70, textAlign: 'center',
                }}>{l.module}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#e6eef6' }}>{l.action}</div>
                  <div style={{ fontSize: 12, color: 'rgba(160,185,215,0.6)', marginTop: 2 }}>{l.user} · {l.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <button className="n-btn n-btn-ghost" onClick={() => navigate('/admin/logs')}>View full audit log</button>
        </div>
      </PortalCard>
    </PortalPage>
  );
}
