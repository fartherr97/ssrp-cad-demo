import { useState } from 'react';
import { useCAD } from '../../store/cadStore';
import { useToast } from '../../contexts/ToastContext';
import { MdPerson, MdAdd, MdEdit, MdClose, MdWarning, MdCheckCircle, MdAutoFixHigh } from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard, Field, PORTAL_INPUT, PORTAL_LABEL } from './PortalKit';
import { S_BTN_PRIMARY, S_BTN_SECONDARY, BADGE, sm } from '../../constants/styles';
import { useActiveCivilian } from '../../contexts/CivilianContext';

const DL_BADGE = {
  ACTIVE:    BADGE.green,
  SUSPENDED: BADGE.red,
  EXPIRED:   BADGE.orange,
};

const EMPTY_FORM = {
  firstName: '', lastName: '', dob: '', gender: 'Male', ethnicity: '',
  height: '', weight: '', hair: '', eyes: '', address: '', phone: '',
};

const FORM_FIELDS = [
  { key: 'firstName', label: 'First Name', type: 'text' },
  { key: 'lastName',  label: 'Last Name',  type: 'text' },
  { key: 'dob',       label: 'Date of Birth', type: 'date' },
  { key: 'gender',    label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
  { key: 'ethnicity', label: 'Ethnicity', type: 'text' },
  { key: 'height',    label: 'Height', type: 'text' },
  { key: 'weight',    label: 'Weight', type: 'text' },
  { key: 'hair',      label: 'Hair', type: 'text' },
  { key: 'eyes',      label: 'Eyes', type: 'text' },
  { key: 'phone',     label: 'Phone', type: 'text' },
];

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
const _STREETS = [
  '1234 N Dale Mabry Hwy', '567 W Kennedy Blvd', '891 S Howard Ave',
  '2345 E Hillsborough Ave', '678 N Armenia Ave', '234 W Waters Ave',
  '1567 Bayshore Blvd', '890 N Nebraska Ave', '3456 W Gandy Blvd',
  '789 N MacDill Ave', '4521 E Busch Blvd', '1123 S Florida Ave',
  '3302 W Columbus Dr', '2211 E Fletcher Ave', '5540 N 56th St',
  '4120 W Spruce St', '7810 N Himes Ave', '9001 N 30th St',
];
const _CITIES = [
  ['Tampa', '33602'], ['Tampa', '33603'], ['Tampa', '33605'], ['Tampa', '33609'],
  ['Tampa', '33611'], ['Tampa', '33612'], ['Tampa', '33614'], ['Tampa', '33617'],
  ['Brandon', '33510'], ['Brandon', '33511'], ['Riverview', '33578'],
  ['Temple Terrace', '33617'], ['Lutz', '33549'], ['Seffner', '33584'],
];

const _pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const _int  = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;

function generateCharacter() {
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

  const [city, zip] = _pick(_CITIES);
  const address     = `${_pick(_STREETS)}, ${city}, FL ${zip}`;

  const area  = Math.random() < 0.7 ? '813' : '727';
  const phone = `(${area}) ${_int(200, 999)}-${String(_int(1000, 9999)).padStart(4, '0')}`;

  return { firstName, lastName, dob, gender, ethnicity: _pick(_ETH),
           height, weight, hair: _pick(_HAIR), eyes: _pick(_EYES), address, phone };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function MyCharacters() {
  const { dispatch } = useCAD();
  const toast = useToast();
  const { myChars, activeChar, setActiveCharId } = useActiveCivilian();

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
    setForm({
      firstName: c.firstName || '', lastName: c.lastName || '', dob: c.dob || '',
      gender: c.gender || 'Male', ethnicity: c.ethnicity || '', height: c.height || '',
      weight: c.weight || '', hair: c.hair || '', eyes: c.eyes || '',
      address: c.address || '', phone: c.phone || '',
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
      const profile = generateCharacter();
      setForm(profile);
      setGenerating(false);
      toast.success(`Generated ${profile.firstName} ${profile.lastName}.`, { title: 'AI Generation Complete' });
    }, 1400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId != null) {
      dispatch({ type: 'UPDATE_CIVILIAN', payload: { id: editingId, ...form } });
      toast.success(`${form.firstName} ${form.lastName} updated.`, { title: 'Character Saved' });
    } else {
      dispatch({ type: 'ADD_CIVILIAN', payload: { ...form, ownedByPlayer: true } });
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
        <PortalCard accent="brand" style={{ marginBottom: 22 }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
              {FORM_FIELDS.map(f => (
                <div key={f.key}>
                  <label className={PORTAL_LABEL}>{f.label}</label>
                  {f.type === 'select' ? (
                    <select className={PORTAL_INPUT} value={form[f.key]} onChange={e => setField(f.key, e.target.value)}>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'date' ? (
                    <div className="relative w-full overflow-hidden rounded-lg border border-border-base bg-app-input focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/20 transition-all" style={{ height: 42 }}>
                      <input className="absolute inset-0 w-full h-full bg-transparent px-3.5 text-sm text-cad-text outline-none" type="date" value={form[f.key]} onChange={e => setField(f.key, e.target.value)} style={{ colorScheme: 'dark' }} />
                    </div>
                  ) : (
                    <input
                      className={PORTAL_INPUT}
                      type={f.type}
                      value={form[f.key]}
                      onChange={e => setField(f.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1' }}>
                <label className={PORTAL_LABEL}>Address</label>
                <input className={PORTAL_INPUT} type="text" value={form.address} onChange={e => setField('address', e.target.value)} />
              </div>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 330px), 1fr))', gap: 14 }}>
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
