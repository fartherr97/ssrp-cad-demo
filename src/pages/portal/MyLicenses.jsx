import { useMemo } from 'react';
import { useCAD } from '../../store/cadStore';
import { MdBadge, MdDriveEta, MdGppGood, MdInfoOutline, MdPerson } from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard, Field } from './PortalKit';
import { BADGE } from '../../constants/styles';

const ACCENT = '#9090cc';

function statusBadge(status) {
  switch (status) {
    case 'ACTIVE': return BADGE.green;
    case 'SUSPENDED': return BADGE.red;
    case 'EXPIRED': return BADGE.orange;
    default: return BADGE.gray;
  }
}

function LicenseBlock({ icon: Icon, title, status, rows }) {
  return (
    <div style={{
      flex: 1, minWidth: 240,
      background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10, padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={20} color={ACCENT} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e6eef6' }}>{title}</span>
        </div>
        <span className={statusBadge(status)}>{status || 'NONE'}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {rows.map(r => <Field key={r.label} label={r.label} value={r.value} mono={r.mono} />)}
      </div>
    </div>
  );
}

export default function MyLicenses() {
  const { state } = useCAD();
  const myChars = useMemo(() => state.civilians.filter(c => c.ownedByPlayer), [state.civilians]);

  return (
    <PortalPage>
      <PortalHeader
        icon={MdBadge}
        title="My Licenses"
        subtitle="View driver licenses and weapon permits for your characters."
        accent={ACCENT}
      />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
        fontSize: 12, color: 'rgba(160,185,215,0.6)',
      }}>
        <MdInfoOutline size={16} color={ACCENT} />
        Licenses are issued and managed by the state. Contact your local DMV office to renew.
      </div>

      {myChars.length === 0 ? (
        <PortalCard accent={ACCENT} style={{ textAlign: 'center', padding: 48 }}>
          <MdBadge size={48} color="rgba(144,144,204,0.4)" />
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e6eef6', marginTop: 12 }}>No characters yet</div>
          <div style={{ fontSize: 13, color: 'rgba(160,185,215,0.6)', marginTop: 6 }}>
            Register a character to view its licenses.
          </div>
        </PortalCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {myChars.map(c => (
            <PortalCard key={c.id} accent={ACCENT}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${ACCENT}1f`, border: `1px solid ${ACCENT}55`,
                }}>
                  <MdPerson size={22} color={ACCENT} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#e6eef6' }}>{c.firstName} {c.lastName}</div>
              </div>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <LicenseBlock
                  icon={MdDriveEta}
                  title="Driver License"
                  status={c.dlStatus}
                  rows={[
                    { label: 'DL Number', value: c.dlNumber, mono: true },
                    { label: 'Class', value: c.dlClass },
                    { label: 'Status', value: c.dlStatus },
                    { label: 'Expires', value: c.dlExpiry },
                  ]}
                />
                <LicenseBlock
                  icon={MdGppGood}
                  title="Weapon Permit"
                  status={c.weaponPermit}
                  rows={[
                    { label: 'Status', value: c.weaponPermit },
                    { label: 'Expires', value: c.weaponPermitExpiry || (c.weaponPermit === 'NONE' ? '—' : '') },
                  ]}
                />
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </PortalPage>
  );
}
