import { useState, useMemo } from 'react';
import { useCAD } from '../../store/cadStore';
import { useToast } from '../../contexts/ToastContext';
import { MdPerson, MdAdd, MdEdit, MdClose, MdWarning, MdCheckCircle, MdAutoFixHigh, MdCameraAlt, MdDelete } from 'react-icons/md';
import { resizeImage } from '../../utils/image';
import { PortalPage, PortalHeader, PortalCard, Field, CivFormField } from './PortalKit';
import { S_BTN_PRIMARY, S_BTN_SECONDARY, BADGE, sm } from '../../constants/styles';
import { CIVILIAN_FORMS_DEFAULT } from '../../data/civilianFormsDefaults';
import { ageFromDob } from '../../utils/age';
import { useActiveCivilian } from '../../contexts/CivilianContext';

const DL_BADGE = {
  ACTIVE:    BADGE.green,
  SUSPENDED: BADGE.red,
  EXPIRED:   BADGE.orange,
};

// Build a blank form object from the configured field list.
const blankForm = (fields) => Object.fromEntries(
  fields.map(f => [f.key, f.type === 'checkbox' ? false : (f.type === 'select' ? (f.options?.[0] || '') : '')])
);

// ── AI character generation data pool ────────────────────────────────────────

const _FM = ['James', 'Michael', 'David', 'Robert', 'John', 'William', 'Carlos', 'Marcus',
              'Anthony', 'Kevin', 'Tyler', 'Brandon', 'Derek', 'Jason', 'Nathan', 'Raymond',
              'Darnell', 'Luis', 'Victor', 'Patrick'];
const _FF = ['Sarah', 'Jessica', 'Amanda', 'Ashley', 'Brittany', 'Christina', 'Maria',
              'Jasmine', 'Destiny', 'Kayla', 'Nicole', 'Amber', 'Stephanie', 'Vanessa',
              'Alexis', 'Monique', 'Diana', 'Tiffany', 'Rachel', 'Brianna'];
const _LAST = ['Johnson', 'Williams', 'Brown', 'Davis', 'Martinez', 'Garcia', 'Rodriguez',
               'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Jackson',
               'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Perez', 'Hall',
               'Young', 'Allen', 'Sanchez', 'Wright', 'King', 'Scott', 'Green', 'Baker'];
const _ETH  = ['White / Caucasian', 'Black / African American', 'Hispanic / Latino',
               'Asian / Pacific Islander', 'Native American', 'Two or More Races'];
const _HAIR = ['Black', 'Brown', 'Dark Brown', 'Blonde', 'Light Brown', 'Auburn',
               'Red', 'Gray', 'Salt & Pepper', 'Bald'];
const _EYES = ['Brown', 'Dark Brown', 'Hazel', 'Green', 'Blue', 'Gray'];
// Tampa-area street names (Los Santos → Tampa, Paleto → Temple Terrace)
const _STREETS = [
  'Vinewood Blvd', 'Spanish Ave', 'Alta St', 'Power St', 'Strawberry Ave',
  'Carcer Way', 'Decker St', 'Forum Dr', 'Hawick Ave', 'Jamestown St',
  'Macdonald St', 'Magellan Ave', 'Mirror Park Blvd', 'San Andreas Ave',
  'Vespucci Blvd', 'West Eclipse Blvd', 'Boulevard Del Perro', 'Cougar Ave',
  'Davis Ave', 'El Rancho Blvd', 'Elgin Ave', 'Greenwich Pkwy', 'Little Bighorn Ave',
  'Marathon Ave', 'Portola Dr', 'Rockford Dr', 'Senora Way', 'Vinewood Park Dr',
  'Temple Terrace Blvd', 'Joshua Rd', 'Route 68', 'Niland Ave', 'Marina Dr',
];
// Tampa-area neighborhoods (Los Santos → Tampa, Paleto → Temple Terrace)
const _AREAS = [
  'Vinewood', 'Downtown Vinewood', 'Vinewood Hills', 'Vespucci', 'Vespucci Beach',
  'Del Perro', 'Rockford Hills', 'Mirror Park', 'Strawberry', 'Davis',
  'Chamberlain Hills', 'Rancho', 'La Mesa', 'Little Seoul', 'Pillbox Hill',
  'Burton', 'Morningwood', 'Richman', 'El Burro Heights', 'Sandy Shores',
  'Temple Terrace', 'Grapeseed', 'Harmony',
];

const _pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const _int  = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;

// Produces a value for a single configured field. Known character keys get
// realistic data; unknown custom fields fall back to type-appropriate values.
function _genForField(field, base) {
  const { key, type, options } = field;
  if (key in base) return base[key];        // known character attribute
  switch (type) {
    case 'select':   return options?.length ? _pick(options) : '';
    case 'checkbox': return Math.random() < 0.5;
    case 'number':   return String(_int(1, 100));
    case 'date': {
      const y = new Date().getFullYear() - _int(1, 40);
      return `${y}-${String(_int(1, 12)).padStart(2, '0')}-${String(_int(1, 28)).padStart(2, '0')}`;
    }
    default:         return '';             // free-text custom fields left blank
  }
}

// `fields` is the admin-configured character schema; the generator adapts to it
// so newly added/removed fields are always reflected in "Generate with AI".
function generateCharacter(fields) {
  const gender = Math.random() < 0.52 ? 'Male' : 'Female';
  const firstName = _pick(gender === 'Male' ? _FM : _FF);
  const lastName  = _pick(_LAST);

  const age     = _int(18, 65);
  const dobYear = new Date().getFullYear() - age;
  const dobMo   = String(_int(1, 12)).padStart(2, '0');
  const dobDay  = String(_int(1, 28)).padStart(2, '0');
  const dob     = `${dobYear}-${dobMo}-${dobDay}`;

  const ftBase = gender === 'Male' ? _int(5, 6) : 5;
  const inBase = gender === 'Male' ? _int(4, 11) : _int(1, 9);
  const height = `${ftBase}'${inBase}"`;
  const weight = gender === 'Male' ? `${_int(145, 225)} lbs` : `${_int(105, 165)} lbs`;

  const address = `${_int(100, 9999)} ${_pick(_STREETS)}, ${_pick(_AREAS)}, Tampa`;
  const phone = `(${_pick(['213', '310', '323', '424'])}) 555-${String(_int(0, 9999)).padStart(4, '0')}`;

  const base = { firstName, lastName, dob, gender, ethnicity: _pick(_ETH),
                 height, weight, hair: _pick(_HAIR), eyes: _pick(_EYES), address, phone };

  // Map onto the configured fields so the output matches the live schema exactly.
  return Object.fromEntries(fields.map(f => [f.key, _genForField(f, base)]));
}

// ─────────────────────────────────────────────────────────────────────────────

export default function MyCharacters() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const { myChars, activeChar, setActiveCharId } = useActiveCivilian();

  const characterFields = state.civilianForms?.character?.fields || CIVILIAN_FORMS_DEFAULT.character.fields;
  const EMPTY_FORM = useMemo(() => blankForm(characterFields), [characterFields]);

  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [generating, setGenerating] = useState(false);

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (c) => {
    // Seed each configured field from the character record (falling back to blank),
    // plus the profile photo which lives outside the configurable field schema.
    setForm({
      ...Object.fromEntries(characterFields.map(f => [f.key, c[f.key] ?? EMPTY_FORM[f.key]])),
      profilePhoto: c.profilePhoto || '',
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleGenerateAI = () => {
    if (generating) return;
    setGenerating(true);
    setTimeout(() => {
      const profile = generateCharacter(characterFields);
      setForm(profile);
      setGenerating(false);
      const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'character';
      toast.success(`Generated ${name}.`, { title: 'AI Generation Complete' });
    }, 1400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Enforce admin-configured unique identifiers (e.g. unique full name).
    const uniqueFields = state.uniqueIdentifiers?.civilian || [];
    const allCivs = state.civilians || [];
    for (const field of uniqueFields) {
      if (field === 'fullName') {
        const wanted = `${form.firstName} ${form.lastName}`.trim().toLowerCase();
        const conflict = allCivs.find(c => c.id !== editingId && `${c.firstName} ${c.lastName}`.trim().toLowerCase() === wanted);
        if (conflict) { toast.error(`The name "${form.firstName} ${form.lastName}" is already taken.`, { title: 'Name Unavailable' }); return; }
      } else if (form[field]) {
        const conflict = allCivs.find(c => c.id !== editingId && c[field] === form[field]);
        if (conflict) { toast.error(`That ${field} is already in use.`, { title: 'Duplicate Value' }); return; }
      }
    }
    // Age is derived from DOB on display — never persist it.
    const payload = { ...form };
    characterFields.filter(f => f.type === 'age').forEach(f => { delete payload[f.key]; });
    if (editingId != null) {
      dispatch({ type: 'UPDATE_CIVILIAN', payload: { id: editingId, ...payload } });
      toast.success(`${form.firstName} ${form.lastName} updated.`, { title: 'Character Saved' });
    } else {
      dispatch({ type: 'ADD_CIVILIAN', payload: { ...payload, ownedByPlayer: true } });
      toast.success(`${form.firstName} ${form.lastName} registered.`, { title: 'Character Registered' });
    }
    closeForm();
  };

  return (
    <PortalPage>
      <PortalHeader
        icon={MdPerson}
        title="My Characters"
        subtitle="Register and manage the identities tied to your account."
        accent="brand"
        action={
          !showForm && (
            <button className={`${S_BTN_PRIMARY} press`} onClick={openNew}>
              <MdAdd size={18} /> Register Character
            </button>
          )
        }
      />

      {showForm && (
        <PortalCard accent="brand" noAnim style={{ marginBottom: 22 }} className="portal-form-enter">
          <div className="flex justify-between items-center mb-[18px]">
            <div className="text-[15px] font-extrabold text-slate-100">
              {editingId != null ? 'Edit Character' : 'Register New Character'}
            </div>
            <div className="flex items-center gap-2">
              {editingId == null && (
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={generating}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-bold border transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: generating
                      ? 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)'
                      : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    borderColor: 'rgba(167,139,250,0.35)',
                    color: '#e9d5ff',
                    boxShadow: '0 2px 12px rgba(124,58,237,0.35)',
                  }}
                >
                  <MdAutoFixHigh
                    size={15}
                    className={generating ? 'animate-spin' : ''}
                    style={{ flexShrink: 0 }}
                  />
                  {generating ? 'Generating…' : 'Generate with AI'}
                </button>
              )}
              <button className={sm(S_BTN_SECONDARY)} onClick={closeForm}>
                <MdClose size={16} /> Cancel
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            {/* Profile photo (the character's ID / DL photo) */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-24 rounded-lg overflow-hidden bg-app-elevated border border-border-base flex items-center justify-center shrink-0">
                {form.profilePhoto
                  ? <img src={form.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  : <MdPerson size={34} className="text-slate-700" />}
              </div>
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-slate-500">Profile Photo</div>
                <div className="text-[11px] text-slate-500 leading-snug">A headshot of your character — used as their ID / driver-license photo.</div>
                <div className="flex gap-2 mt-0.5">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-white/[0.06] hover:bg-white/[0.1] border border-transparent text-slate-200 transition-all">
                    <MdCameraAlt size={14} /> {form.profilePhoto ? 'Replace' : 'Upload Photo'}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={async e => { const f = e.target.files?.[0]; if (f) setField('profilePhoto', await resizeImage(f)); e.target.value = ''; }} />
                  </label>
                  {form.profilePhoto && (
                    <button type="button" onClick={() => setField('profilePhoto', '')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-transparent transition-all cursor-pointer">
                      <MdDelete size={14} /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
              {characterFields.map(f => {
                const isAge = f.type === 'age';
                const val = isAge ? ageFromDob(form.dob) : form[f.key];
                return (
                  <div key={f.key} style={f.full ? { gridColumn: '1 / -1' } : undefined}>
                    <CivFormField field={f} value={val} onChange={isAge ? () => {} : v => setField(f.key, v)} />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2.5 mt-[18px]">
              <button type="submit" className={`${S_BTN_PRIMARY} press`}>
                {editingId != null ? 'Save Changes' : 'Register Character'}
              </button>
            </div>
          </form>
        </PortalCard>
      )}

      {myChars.length === 0 && !showForm ? (
        <PortalCard accent="brand">
          <div className="text-center p-12">
            <MdPerson size={48} color="rgba(61,130,240,0.4)" />
            <div className="text-[15px] font-bold text-slate-100 mt-3">No characters yet</div>
            <div className="text-sm text-slate-400 mt-1.5">
              Register your first character to get started.
            </div>
            <button className={`${S_BTN_PRIMARY} press mt-[18px]`} onClick={openNew}>
              <MdAdd size={18} /> Register Character
            </button>
          </div>
        </PortalCard>
      ) : (
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 330px), 1fr))', gap: 14 }}>
          {myChars.map(c => {
            const isActive = c.id === activeChar?.id;
            return (
            <PortalCard key={c.id} accent="brand" className={isActive ? 'ring-2 ring-brand/60 border-brand/50' : ''}>
              <div className="flex justify-between items-start gap-2.5 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] shrink-0 flex items-center justify-center bg-brand/15 border border-brand/30">
                    <MdPerson size={22} color="#3d82f0" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                      {c.firstName} {c.lastName}
                      {isActive && <span className="text-[9px] font-bold uppercase tracking-wider text-brand-bright bg-brand/15 border border-brand/30 rounded px-1.5 py-0.5">Active</span>}
                    </div>
                    <span className={`${DL_BADGE[c.dlStatus] || BADGE.gray} mt-1`}>
                      DL {c.dlStatus || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button className={`${sm(S_BTN_SECONDARY)} press-sm`} onClick={() => openEdit(c)}>
                    <MdEdit size={15} /> Edit
                  </button>
                  {!isActive && (
                    <button className={`${sm(S_BTN_SECONDARY)} press-sm`} onClick={() => setActiveCharId(c.id)}>
                      <MdCheckCircle size={15} /> Set Active
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Date of Birth" value={c.dob} />
                <Field label="Age" value={ageFromDob(c.dob)} />
                <Field label="Gender" value={c.gender} />
                <Field label="Address" value={c.address} />
                <Field label="Phone" value={c.phone} mono />
                <Field label="Height" value={c.height} />
                <Field label="Weight" value={c.weight} />
              </div>

              {c.flags?.length > 0 && (
                <div className="mt-3.5 flex items-center gap-2 flex-wrap">
                  <MdWarning size={16} color="#f5a93b" />
                  {c.flags.map(fl => (
                    <span key={fl} className={BADGE.orange}>{fl}</span>
                  ))}
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
