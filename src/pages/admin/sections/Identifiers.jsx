import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { AdminPageTitle, AdminPanel, SonButton, ADMIN } from '../AdminKit';

const CIVILIAN_FIELDS = [
  { key: 'ssn',      label: 'SSN',              desc: 'Social Security Number must be unique across all civilian records.' },
  { key: 'dlNumber', label: "Driver's License #", desc: "Driver's license number must be unique across all civilian records." },
  { key: 'phone',    label: 'Phone Number',       desc: 'Phone number must be unique across all civilian records.' },
];

const VEHICLE_FIELDS = [
  { key: 'plate', label: 'License Plate', desc: 'License plate must be unique across all registered vehicles.' },
  { key: 'vin',   label: 'VIN',           desc: 'Vehicle Identification Number must be unique across all registered vehicles.' },
];

export default function Identifiers() {
  const { state, dispatch } = useCAD();
  const config = state.uniqueIdentifiers || { civilian: ['ssn', 'dlNumber'], vehicle: ['plate'] };

  const [saved, setSaved] = useState(false);

  const isOn = (group, key) => (config[group] || []).includes(key);

  const toggle = (group, key) => {
    const current = config[group] || [];
    const next = current.includes(key) ? current.filter(k => k !== key) : [...current, key];
    const newConfig = { ...config, [group]: next };
    dispatch({ type: 'ADMIN_SET', payload: { key: 'uniqueIdentifiers', value: newConfig } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <AdminPageTitle
        right={saved && (
          <span style={{ color: ADMIN.green, fontSize: 13, fontWeight: 600 }}>Saved!</span>
        )}
      >
        Unique Identifiers
      </AdminPageTitle>

      <AdminPanel
        title="Civilian Fields"
        subtitle="Fields that must be unique across all civilian records. Duplicate values will be rejected on creation."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {CIVILIAN_FIELDS.map((f, i) => {
            const active = isOn('civilian', f.key);
            return (
              <div
                key={f.key}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 0',
                  borderBottom: i < CIVILIAN_FIELDS.length - 1 ? `1px solid ${ADMIN.border}` : 'none',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: ADMIN.text, marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: ADMIN.textMute, lineHeight: 1.5 }}>{f.desc}</div>
                </div>
                <button
                  type="button"
                  onClick={() => toggle('civilian', f.key)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-0 ${active ? 'bg-brand' : 'bg-slate-700'}`}
                >
                  <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                    style={{ transform: active ? 'translateX(1.25rem)' : 'translateX(0)' }} />
                </button>
              </div>
            );
          })}
        </div>
      </AdminPanel>

      <AdminPanel
        title="Vehicle Fields"
        subtitle="Fields that must be unique across all registered vehicles. Duplicate values will be rejected on registration."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {VEHICLE_FIELDS.map((f, i) => {
            const active = isOn('vehicle', f.key);
            return (
              <div
                key={f.key}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 0',
                  borderBottom: i < VEHICLE_FIELDS.length - 1 ? `1px solid ${ADMIN.border}` : 'none',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: ADMIN.text, marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: ADMIN.textMute, lineHeight: 1.5 }}>{f.desc}</div>
                </div>
                <button
                  type="button"
                  onClick={() => toggle('vehicle', f.key)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-0 ${active ? 'bg-brand' : 'bg-slate-700'}`}
                >
                  <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                    style={{ transform: active ? 'translateX(1.25rem)' : 'translateX(0)' }} />
                </button>
              </div>
            );
          })}
        </div>
      </AdminPanel>
    </div>
  );
}
