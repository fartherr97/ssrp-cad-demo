import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAssignment, MdBusiness, MdInfo } from 'react-icons/md';
import { useCAD } from '../../store/cadStore';
import { PortalPage, PortalHeader, StatCard, PortalCard } from './PortalKit';
import { S_BTN_PRIMARY, BADGE, btnHoverOn, btnHoverOff } from '../../constants/styles';

const ACCENT = '#44aacc';

export default function BusinessIncidents() {
  const { state } = useCAD();
  const navigate = useNavigate();
  const myBiz = state.businesses.find(b => b.ownedByPlayer);

  const [filter, setFilter] = useState('ALL');

  if (!myBiz) {
    return (
      <PortalPage>
        <PortalHeader icon={MdAssignment} title="Business Incidents" subtitle="Incidents filed against your business by law enforcement." accent={ACCENT} />
        <PortalCard accent={ACCENT} style={{ textAlign: 'center', padding: '44px 24px' }}>
          <div style={{ fontSize: 14, color: 'rgba(180,200,230,0.6)', marginBottom: 18 }}>
            You need to register a business before you can view incidents.
          </div>
          <button style={{ ...S_BTN_PRIMARY, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => navigate('/portal/my-business')}>
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

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 22 }}>
        <StatCard label="Total Incidents" value={incidents.length} accent={ACCENT} icon={MdAssignment} hint="All records" />
        <StatCard label="Open" value={openCount} accent={openCount > 0 ? '#f5a93b' : ACCENT} icon={MdAssignment} hint={openCount > 0 ? 'Active investigations' : 'None open'} />
        <StatCard label="Closed" value={closedCount} accent="#2fd968" icon={MdAssignment} hint="Resolved" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {['ALL', 'Open', 'Closed'].map(t => (
          <button key={t}
            onClick={() => setFilter(t)}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '6px 14px', fontSize: 13, fontWeight: 600, borderRadius: 'var(--n-radius-sm)',
              cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.14s',
              background: filter === t ? ACCENT : 'rgba(255,255,255,0.05)',
              color: filter === t ? '#fff' : 'rgba(200,220,240,0.7)',
              borderColor: filter === t ? 'transparent' : 'rgba(255,255,255,0.12)',
            }}>
            {t} ({COUNTS[t]})
          </button>
        ))}
      </div>

      {/* Read-only note */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18,
        fontSize: 12, color: 'rgba(160,185,215,0.6)',
      }}>
        <MdInfo size={15} color="rgba(160,185,215,0.6)" />
        Incidents are filed by law enforcement and cannot be added or edited here.
      </div>

      {filtered.length === 0 ? (
        <PortalCard accent={ACCENT} style={{ textAlign: 'center', padding: '44px 24px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${ACCENT}1f`, border: `1px solid ${ACCENT}55`,
          }}>
            <MdAssignment size={30} color={ACCENT} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e6eef6', marginBottom: 6 }}>
            {filter === 'ALL' ? 'No incidents on record' : `No ${filter.toLowerCase()} incidents`}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(180,200,230,0.6)' }}>
            {filter === 'ALL' ? 'Your business has a clean record.' : 'Try a different filter.'}
          </div>
        </PortalCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
          {filtered.map(inc => (
            <PortalCard key={inc.id} accent={inc.status === 'Open' ? '#f5a93b' : ACCENT}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#e6eef6', lineHeight: 1.25 }}>{inc.type}</div>
                  <div style={{ fontSize: 12, color: 'rgba(160,185,215,0.6)', marginTop: 3 }}>{inc.date}</div>
                </div>
                <span style={inc.status === 'Open' ? BADGE.orange : BADGE.gray}>{inc.status}</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(200,215,235,0.75)', lineHeight: 1.5 }}>{inc.summary}</div>
            </PortalCard>
          ))}
        </div>
      )}
    </PortalPage>
  );
}
