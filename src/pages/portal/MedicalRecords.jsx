import { useState, useEffect } from 'react';
import Select from '../../components/ui/Select';
import { useCAD } from '../../store/cadStore';
import { useToast } from '../../contexts/ToastContext';
import {
  MdLocalHospital, MdPerson, MdEdit, MdSave, MdClose, MdAdd,
  MdExpandMore, MdExpandLess, MdShield, MdWarningAmber,
} from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard, CivFormField, PORTAL_INPUT, PORTAL_LABEL } from './PortalKit';
import { S_BTN_PRIMARY, S_BTN_SECONDARY, sm } from '../../constants/styles';
import { CIVILIAN_FORMS_DEFAULT } from '../../data/civilianFormsDefaults';
import { useActiveCivilian, CivilianSwitcher } from '../../contexts/CivilianContext';

const BLOOD_TYPES = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

const EMPTY_PROFILE = {
  bloodType: '',
  organDonor: false,
  dnr: false,
  conditions: [],
  allergies: [],
  medications: [],
  emergencyContact: { name: '', phone: '', relationship: '' },
  safetyNotes: '',
  notes: '',
};

function TagInput({ tags = [], onChange, placeholder }) {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (!v) return;
    onChange([...tags, v]);
    setInput('');
  };

  const remove = (i) => onChange(tags.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          className={`${PORTAL_INPUT} flex-1 text-[12.5px]`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
        />
        <button type="button" onClick={add}
          className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-brand/20 hover:bg-brand/30 border border-brand/30 text-brand-bright cursor-pointer transition-colors">
          <MdAdd size={18} />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 min-h-[24px]">
        {tags.map((t, i) => (
          <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand/10 border border-brand/25 text-[11px] text-brand-bright font-medium">
            {t}
            <button type="button" onClick={() => remove(i)}
              className="ml-0.5 opacity-50 hover:opacity-100 cursor-pointer"
              style={{ background: 'none', border: 'none', padding: 0, display: 'flex' }}>
              <MdClose size={10} />
            </button>
          </span>
        ))}
        {tags.length === 0 && <span className="text-[11px] text-slate-600 italic">None listed * type above and press Enter or +</span>}
      </div>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <div className="text-[10px] font-extrabold uppercase tracking-[0.8px] text-slate-500 pb-2 border-b border-white/[0.06] mb-3">
      {children}
    </div>
  );
}

function CheckToggle({ checked, onChange, label, description, color = '#3d82f0' }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none group">
      <div
        onClick={() => onChange(!checked)}
        className="mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all"
        style={{
          background: checked ? `${color}22` : 'transparent',
          borderColor: checked ? color : 'rgba(255,255,255,0.15)',
        }}
      >
        {checked && <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-slate-200 leading-tight">{label}</div>
        {description && <div className="text-[11px] text-slate-500 mt-0.5">{description}</div>}
      </div>
    </label>
  );
}

function MedicalProfileEditor({ civilian, extraFields = [], onSave, onCancel }) {
  const profile = civilian.medicalProfile || EMPTY_PROFILE;
  const [form, setForm] = useState({
    bloodType:        profile.bloodType || '',
    organDonor:       profile.organDonor || false,
    dnr:              profile.dnr || false,
    conditions:       [...(profile.conditions || [])],
    allergies:        [...(profile.allergies || [])],
    medications:      [...(profile.medications || [])],
    emergencyContact: { ...(profile.emergencyContact || { name: '', phone: '', relationship: '' }) },
    safetyNotes:      profile.safetyNotes || '',
    notes:            profile.notes || '',
    custom:           { ...(profile.custom || {}) },
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setEC = (key, val) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, [key]: val } }));
  const setCustom = (key, val) => setForm(f => ({ ...f, custom: { ...f.custom, [key]: val } }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="flex flex-col gap-6 p-1">

      {/* Basic */}
      <div>
        <SectionHeader>Basic Information</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={PORTAL_LABEL}>Blood Type</label>
            <Select className={PORTAL_INPUT} value={form.bloodType} onChange={e => set('bloodType', e.target.value)}>
              {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt || 'Not specified'}</option>)}
            </Select>
          </div>
          <div className="flex flex-col justify-end gap-3 sm:col-span-2">
            <CheckToggle
              checked={form.organDonor}
              onChange={v => set('organDonor', v)}
              label="Organ Donor"
              description="Registered organ and tissue donor"
              color="#3d82f0"
            />
            <CheckToggle
              checked={form.dnr}
              onChange={v => set('dnr', v)}
              label="Do Not Resuscitate (DNR)"
              description="Valid DNR directive on file * do not attempt resuscitation"
              color="#ef4444"
            />
          </div>
        </div>
      </div>

      {/* Medical Conditions */}
      <div>
        <SectionHeader>Medical Conditions</SectionHeader>
        <TagInput
          tags={form.conditions}
          onChange={v => set('conditions', v)}
          placeholder="e.g. Type 2 Diabetes * press Enter to add"
        />
      </div>

      {/* Allergies */}
      <div>
        <SectionHeader>Known Allergies</SectionHeader>
        <TagInput
          tags={form.allergies}
          onChange={v => set('allergies', v)}
          placeholder="e.g. Penicillin * press Enter to add"
        />
      </div>

      {/* Medications */}
      <div>
        <SectionHeader>Current Medications</SectionHeader>
        <TagInput
          tags={form.medications}
          onChange={v => set('medications', v)}
          placeholder="e.g. Metformin 500mg daily * press Enter to add"
        />
      </div>

      {/* Emergency Contact */}
      <div>
        <SectionHeader>Emergency Contact</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={PORTAL_LABEL}>Full Name</label>
            <input className={PORTAL_INPUT} value={form.emergencyContact.name}
              onChange={e => setEC('name', e.target.value)} placeholder="Contact name" />
          </div>
          <div>
            <label className={PORTAL_LABEL}>Phone</label>
            <input className={`${PORTAL_INPUT} font-mono`} value={form.emergencyContact.phone}
              onChange={e => setEC('phone', e.target.value)} placeholder="555-0000" />
          </div>
          <div>
            <label className={PORTAL_LABEL}>Relationship</label>
            <input className={PORTAL_INPUT} value={form.emergencyContact.relationship}
              onChange={e => setEC('relationship', e.target.value)} placeholder="Spouse, Parent, etc." />
          </div>
        </div>
      </div>

      {/* Safety Notes * LEO visible */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded flex items-center justify-center shrink-0"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)' }}>
            <MdShield size={10} color="#f59e0b" />
          </div>
          <SectionHeader>Law Enforcement Safety Notes</SectionHeader>
        </div>
        <p className="text-[11px] text-amber-500/70 mb-2 -mt-1">
          Visible to law enforcement * use for behavioral conditions, substance dependencies, or anything relevant to officer and public safety.
        </p>
        <textarea className={PORTAL_INPUT} rows={3} value={form.safetyNotes}
          onChange={e => set('safetyNotes', e.target.value)}
          placeholder="e.g. History of combative episodes. Active substance dependency. Non-compliant with medications." />
      </div>

      {/* Medical Notes * EMS/Fire only */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded flex items-center justify-center shrink-0"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)' }}>
            <MdLocalHospital size={10} color="#ef4444" />
          </div>
          <SectionHeader>Medical Notes (EMS / Fire Only)</SectionHeader>
        </div>
        <p className="text-[11px] text-red-400/60 mb-2 -mt-1">
          Visible only to Fire &amp; EMS * include treatment preferences, surgical history, or other clinical notes.
        </p>
        <textarea className={PORTAL_INPUT} rows={3} value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="e.g. DNR in effect. Prior CABG surgery 2021. Contact spouse before any procedure." />
      </div>

      {/* Admin-configured extra fields */}
      {extraFields.length > 0 && (
        <div>
          <SectionHeader>Additional Information</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {extraFields.map(f => (
              <CivFormField key={f.key} field={f}
                value={form.custom[f.key]}
                onChange={v => setCustom(f.key, v)} />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2.5 pt-1">
        <button type="submit" className={`${S_BTN_PRIMARY} press`}>
          <MdSave size={16} /> Save Medical Profile
        </button>
        <button type="button" className={`${S_BTN_SECONDARY} press`} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function ProfileReadView({ profile, extraFields = [] }) {
  if (!profile) {
    return (
      <div className="text-[12px] text-slate-500 italic py-2">
        No medical profile on file. Click Edit to add one.
      </div>
    );
  }

  const hasData = profile.bloodType || profile.conditions?.length || profile.allergies?.length || profile.medications?.length || profile.notes || profile.safetyNotes;

  if (!hasData) {
    return (
      <div className="text-[12px] text-slate-500 italic py-2">
        Medical profile is empty. Click Edit to fill it in.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Left column */}
      <div className="flex flex-col gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-1.5">Basic</div>
          <div className="flex flex-wrap gap-2">
            {profile.bloodType && (
              <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/25 text-[12px] font-bold text-red-300">
                {profile.bloodType}
              </span>
            )}
            {profile.organDonor && (
              <span className="px-2.5 py-1 rounded-lg bg-brand/10 border border-brand/25 text-[11px] font-semibold text-brand-bright">
                Organ Donor
              </span>
            )}
            {profile.dnr && (
              <span className="px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/40 text-[11px] font-bold text-red-300">
                DNR
              </span>
            )}
            {!profile.bloodType && !profile.organDonor && !profile.dnr && (
              <span className="text-[11px] text-slate-600 italic">Not specified</span>
            )}
          </div>
        </div>

        {profile.conditions?.length > 0 && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-1.5">Conditions</div>
            <div className="flex flex-wrap gap-1.5">
              {profile.conditions.map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300">{c}</span>
              ))}
            </div>
          </div>
        )}

        {profile.allergies?.length > 0 && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-1.5">Allergies</div>
            <div className="flex flex-wrap gap-1.5">
              {profile.allergies.map((a, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/25 text-[11px] text-red-300">{a}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-3">
        {profile.medications?.length > 0 && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-1.5">Medications</div>
            <div className="flex flex-col gap-1">
              {profile.medications.map((m, i) => (
                <div key={i} className="text-[12px] text-slate-300 flex items-start gap-1.5">
                  <span className="text-slate-600 mt-0.5">•</span> {m}
                </div>
              ))}
            </div>
          </div>
        )}

        {(profile.emergencyContact?.name) && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-1.5">Emergency Contact</div>
            <div className="text-[12.5px] font-semibold text-slate-200">{profile.emergencyContact.name}</div>
            <div className="text-[11px] text-slate-400">{profile.emergencyContact.relationship}</div>
            <div className="text-[11px] font-mono text-slate-400">{profile.emergencyContact.phone}</div>
          </div>
        )}

        {profile.safetyNotes && (
          <div className="rounded-lg p-3" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <MdShield size={12} color="#f59e0b" />
              <span className="text-[10px] font-bold uppercase tracking-[0.6px] text-amber-500">LEO Safety Notes</span>
            </div>
            <div className="text-[12px] text-amber-200/80 leading-relaxed">{profile.safetyNotes}</div>
          </div>
        )}

        {profile.notes && (
          <div className="rounded-lg p-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <MdLocalHospital size={12} color="#ef4444" />
              <span className="text-[10px] font-bold uppercase tracking-[0.6px] text-red-400">EMS / Fire Notes</span>
            </div>
            <div className="text-[12px] text-red-200/80 leading-relaxed">{profile.notes}</div>
          </div>
        )}
      </div>

      {/* Admin-configured extra fields */}
      {extraFields.some(f => profile.custom?.[f.key] !== undefined && profile.custom?.[f.key] !== '' && profile.custom?.[f.key] !== false) && (
        <div className="sm:col-span-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-1.5">Additional Information</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {extraFields.map(f => {
              const v = profile.custom?.[f.key];
              if (v === undefined || v === '' || v === false) return null;
              return (
                <div key={f.key} className="flex justify-between gap-3 text-[12.5px]">
                  <span className="text-slate-500">{f.label}</span>
                  <span className="text-slate-200 font-medium text-right">{f.type === 'checkbox' ? 'Yes' : v}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MedicalRecords() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const { myChars, activeChar } = useActiveCivilian();
  const medicalFields = state.civilianForms?.medical?.fields || CIVILIAN_FORMS_DEFAULT.medical.fields;

  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(activeChar?.id ?? null);

  // Keep the active character's card expanded when switching characters.
  useEffect(() => { if (activeChar) setExpandedId(activeChar.id); }, [activeChar?.id]);

  const handleSave = (civId, profileData) => {
    dispatch({ type: 'UPDATE_MEDICAL_PROFILE', payload: { id: civId, medicalProfile: profileData } });
    toast.success('Medical profile updated.', { title: 'Medical Profile Saved' });
    setEditingId(null);
  };

  return (
    <PortalPage>
      <PortalHeader
        icon={MdLocalHospital}
        title="Medical Records"
        subtitle="Manage your active character's medical profile * allergies, conditions, medications, and emergency contacts."
        accent="brand"
      />

      <CivilianSwitcher />

      {myChars.length === 0 ? (
        <PortalCard accent="brand">
          <div className="text-center py-10">
            <MdPerson size={40} className="mx-auto text-slate-600 mb-3" />
            <div className="text-[14px] font-bold text-slate-300">No characters registered</div>
            <div className="text-[12px] text-slate-500 mt-1">Register a character first before adding a medical profile.</div>
          </div>
        </PortalCard>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Info callout */}
          <div className="rounded-xl px-4 py-3 flex items-start gap-3"
            style={{ background: 'rgba(61,130,240,0.07)', border: '1px solid rgba(61,130,240,0.18)' }}>
            <MdWarningAmber size={18} className="text-brand-bright shrink-0 mt-0.5" />
            <div className="text-[12px] text-slate-300 leading-relaxed">
              <span className="font-bold text-brand-bright">LEO safety notes</span> are visible to law enforcement when they search your character.{' '}
              <span className="font-bold text-red-300">EMS / Fire notes</span> and full medical details are visible only to Fire &amp; EMS personnel.
              Blood type, conditions, and allergies are visible to both.
            </div>
          </div>

          {(activeChar ? [activeChar] : []).map(c => {
            const isExpanded = expandedId === c.id;
            const isEditing = editingId === c.id;
            const profile = c.medicalProfile;
            const hasProfile = profile && (profile.bloodType || profile.conditions?.length || profile.allergies?.length || profile.medications?.length);

            return (
              <PortalCard key={c.id} accent="brand">
                {/* Character header row */}
                <div className="flex items-center gap-3 mb-0">
                  <div className="w-10 h-10 rounded-[10px] shrink-0 flex items-center justify-center bg-brand/15 border border-brand/30">
                    <MdPerson size={22} color="#3d82f0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-extrabold text-slate-100">{c.firstName} {c.lastName}</div>
                    <div className="text-[11px] text-slate-500">DOB {c.dob} · {c.gender}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {hasProfile && !isEditing && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-semibold text-emerald-400">
                        Profile on file
                      </span>
                    )}
                    {!isEditing && (
                      <button
                        className={`${sm(S_BTN_PRIMARY)} press`}
                        onClick={() => { setEditingId(c.id); setExpandedId(c.id); }}
                      >
                        <MdEdit size={14} /> Edit
                      </button>
                    )}
                    <button
                      className={`${sm(S_BTN_SECONDARY)} press-sm`}
                      onClick={() => { setExpandedId(isExpanded ? null : c.id); if (!isExpanded && isEditing) setEditingId(null); }}
                    >
                      {isExpanded ? <MdExpandLess size={16} /> : <MdExpandMore size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    {isEditing ? (
                      <MedicalProfileEditor
                        civilian={c}
                        extraFields={medicalFields}
                        onSave={(data) => handleSave(c.id, data)}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <ProfileReadView profile={profile} extraFields={medicalFields} />
                    )}
                  </div>
                )}
              </PortalCard>
            );
          })}
        </div>
      )}
    </PortalPage>
  );
}
