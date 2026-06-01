import { useState, useMemo } from 'react';
import { useCAD } from '../../store/cadStore';
import { MdPerson, MdAdd, MdEdit, MdClose, MdWarning } from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard, Field, PORTAL_INPUT, PORTAL_LABEL } from './PortalKit';
import { S_BTN_PRIMARY, S_BTN_SECONDARY, BADGE, sm } from '../../constants/styles';

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

export default function MyCharacters() {
  const { state, dispatch } = useCAD();
  const myChars = useMemo(() => state.civilians.filter(c => c.ownedByPlayer), [state.civilians]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId != null) {
      dispatch({ type: 'UPDATE_CIVILIAN', payload: { id: editingId, ...form } });
    } else {
      dispatch({ type: 'ADD_CIVILIAN', payload: { ...form, ownedByPlayer: true } });
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
            <button className={S_BTN_PRIMARY} onClick={openNew}>
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
            <button className={sm(S_BTN_SECONDARY)} onClick={closeForm}>
              <MdClose size={16} /> Cancel
            </button>
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
              <button type="submit" className={S_BTN_PRIMARY}>
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
            <button className={`${S_BTN_PRIMARY} mt-[18px]`} onClick={openNew}>
              <MdAdd size={18} /> Register Character
            </button>
          </div>
        </PortalCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 330px), 1fr))', gap: 14 }}>
          {myChars.map(c => (
            <PortalCard key={c.id} accent="brand">
              <div className="flex justify-between items-start gap-2.5 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] shrink-0 flex items-center justify-center bg-brand/15 border border-brand/30">
                    <MdPerson size={22} color="#3d82f0" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-slate-100">{c.firstName} {c.lastName}</div>
                    <span className={`${DL_BADGE[c.dlStatus] || BADGE.gray} mt-1`}>
                      DL {c.dlStatus || 'N/A'}
                    </span>
                  </div>
                </div>
                <button className={sm(S_BTN_SECONDARY)} onClick={() => openEdit(c)}>
                  <MdEdit size={15} /> Edit
                </button>
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
          ))}
        </div>
      )}
    </PortalPage>
  );
}
