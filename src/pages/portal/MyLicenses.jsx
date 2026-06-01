import { useMemo } from 'react';
import { useCAD } from '../../store/cadStore';
import { MdBadge, MdDriveEta, MdGppGood, MdInfoOutline, MdPerson } from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard, Field } from './PortalKit';
import { statusBadge } from '../../constants/styles';

function LicenseBlock({ icon: Icon, title, status, rows }) {
  return (
    <div className="flex-1 min-w-[240px] bg-app-card/70 border border-border-base rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2.5 mb-3.5">
        <div className="flex items-center gap-2">
          <Icon size={20} color="#3d82f0" />
          <span className="text-sm font-bold text-slate-100">{title}</span>
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
        accent="brand"
      />

      <div className="flex items-center gap-2 mb-5 text-xs text-slate-400">
        <MdInfoOutline size={16} color="#3d82f0" />
        Licenses are issued and managed by the state. Contact your local DMV office to renew.
      </div>

      {myChars.length === 0 ? (
        <PortalCard accent="brand">
          <div className="text-center p-12">
            <MdBadge size={48} color="rgba(61,130,240,0.4)" />
            <div className="text-[15px] font-bold text-slate-100 mt-3">No characters yet</div>
            <div className="text-sm text-slate-400 mt-1.5">
              Register a character to view its licenses.
            </div>
          </div>
        </PortalCard>
      ) : (
        <div className="flex flex-col gap-4">
          {myChars.map(c => (
            <PortalCard key={c.id} accent="brand">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-[10px] shrink-0 flex items-center justify-center bg-brand/15 border border-brand/30">
                  <MdPerson size={22} color="#3d82f0" />
                </div>
                <div className="text-base font-extrabold text-slate-100">{c.firstName} {c.lastName}</div>
              </div>

              <div className="flex gap-3.5 flex-wrap">
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
                    { label: 'Expires', value: c.weaponPermitExpiry || (c.weaponPermit === 'NONE' ? '*' : '') },
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
