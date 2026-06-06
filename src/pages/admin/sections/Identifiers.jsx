import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import { AdminPageTitle, AdminPanel, SonButton, ADMIN } from '../AdminKit';

const CIVILIAN_FIELDS = [
  { key: 'fullName', label: 'Full Name (First + Last)', desc: "A civilian's first and last name combination must be unique — no two characters can share the same full name." },
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
  const toast = useToast();

  const [saved, setSaved] = useState(false);
  const [dlPrefix, setDlPrefix] = useState(config.dlPrefix || '');
  const [ssnPrefix, setSsnPrefix] = useState(config.ssnPrefix || '');

  const isOn = (group, key) => (config[group] || []).includes(key);

  const toggle = (group, key) => {
    const current = config[group] || [];
    const willEnable = !current.includes(key);
    const next = willEnable ? [...current, key] : current.filter(k => k !== key);
    const newConfig = { ...config, [group]: next };
    dispatch({ type: 'ADMIN_SET', payload: { key: 'uniqueIdentifiers', value: newConfig } });
    toast.success(`Unique identifier ${willEnable ? 'enabled' : 'disabled'}.`);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveDlPrefix = () => {
    const trimmed = dlPrefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setDlPrefix(trimmed);
    const newConfig = { ...config, dlPrefix: trimmed || null };
    dispatch({ type: 'ADMIN_SET', payload: { key: 'uniqueIdentifiers', value: newConfig } });
    toast.success('DL number format saved.');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveSsnPrefix = () => {
    const trimmed = ssnPrefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
    setSsnPrefix(trimmed);
    const newConfig = { ...config, ssnPrefix: trimmed || null };
    dispatch({ type: 'ADMIN_SET', payload: { key: 'uniqueIdentifiers', value: newConfig } });
    toast.success('SSN format saved.');
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

      <AdminPanel
        title="SSN Format"
        subtitle="Configure a prefix for auto-generated Social Security Numbers. Leave blank to use the default format (XXX-XX-XXXX). Prefix replaces the first group (max 3 characters)."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: ADMIN.textMute, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                Prefix (max 3 characters, A–Z / 0–9)
              </div>
              <input
                type="text"
                value={ssnPrefix}
                onChange={e => setSsnPrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3))}
                placeholder="e.g. FL or SS"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: ADMIN.row, border: `1px solid ${ADMIN.border}`,
                  borderRadius: 8, padding: '8px 12px',
                  fontSize: 13, color: ADMIN.text,
                  outline: 'none', fontFamily: 'monospace',
                }}
              />
            </div>
            <SonButton onClick={saveSsnPrefix} style={{ marginBottom: 0 }}>Save</SonButton>
          </div>
          <div style={{ fontSize: 11, color: ADMIN.textMute, background: ADMIN.panel2, border: `1px solid ${ADMIN.border}`, borderRadius: 8, padding: '8px 12px' }}>
            Preview:{' '}
            <span style={{ fontFamily: 'monospace', color: ADMIN.text, fontWeight: 600 }}>
              {ssnPrefix ? `${ssnPrefix}-45-6789` : '123-45-6789'}
            </span>
          </div>
        </div>
      </AdminPanel>

      <AdminPanel
        title="DL Number Format"
        subtitle="Configure a prefix for auto-generated driver's license numbers. Leave blank to use the default format (last-name initial + 7 digits)."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: ADMIN.textMute, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                Prefix (max 6 characters, A–Z / 0–9)
              </div>
              <input
                type="text"
                value={dlPrefix}
                onChange={e => setDlPrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                placeholder="e.g. FL or HCFD"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: ADMIN.row, border: `1px solid ${ADMIN.border}`,
                  borderRadius: 8, padding: '8px 12px',
                  fontSize: 13, color: ADMIN.text,
                  outline: 'none', fontFamily: 'monospace',
                }}
              />
            </div>
            <SonButton onClick={saveDlPrefix} style={{ marginBottom: 0 }}>Save</SonButton>
          </div>
          <div style={{ fontSize: 11, color: ADMIN.textMute, background: ADMIN.panel2, border: `1px solid ${ADMIN.border}`, borderRadius: 8, padding: '8px 12px' }}>
            Preview:{' '}
            <span style={{ fontFamily: 'monospace', color: ADMIN.text, fontWeight: 600 }}>
              {dlPrefix ? `${dlPrefix}-A1234567` : 'A1234567'}
            </span>
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}
