import { useState, useMemo } from 'react';
import { useCAD } from '../../store/cadStore';
import { MdPerson, MdAdd, MdEdit, MdClose, MdWarning } from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard, Field, PORTAL_INPUT, PORTAL_LABEL } from './PortalKit';
import { S_BTN_PRIMARY, S_BTN_SECONDARY, BADGE, sm, btnHoverOn, btnHoverOff } from '../../constants/styles';

const ACCENT = '#9090cc';

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
        accent={ACCENT}
        action={
          !showForm && (
            <button style={S_BTN_PRIMARY} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onClick={openNew}>
              <MdAdd size={18} style={{ marginRight: 6 }} /> Register Character
            </button>
          )
        }
      />

      {showForm && (
        <PortalCard accent={ACCENT} style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#e6eef6' }}>
              {editingId != null ? 'Edit Character' : 'Register New Character'}
            </div>
            <button style={sm(S_BTN_SECONDARY)} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onClick={closeForm}>
              <MdClose size={16} style={{ marginRight: 4 }} /> Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              {FORM_FIELDS.map(f => (
                <div key={f.key}>
                  <label style={PORTAL_LABEL}>{f.label}</label>
                  {f.type === 'select' ? (
                    <select style={PORTAL_INPUT} value={form[f.key]} onChange={e => setField(f.key, e.target.value)}>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      style={PORTAL_INPUT}
                      type={f.type}
                      value={form[f.key]}
                      onChange={e => setField(f.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={PORTAL_LABEL}>Address</label>
                <input style={PORTAL_INPUT} type="text" value={form.address} onChange={e => setField('address', e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
              <button type="submit" style={S_BTN_PRIMARY} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff}>
                {editingId != null ? 'Save Changes' : 'Register Character'}
              </button>
            </div>
          </form>
        </PortalCard>
      )}

      {myChars.length === 0 && !showForm ? (
        <PortalCard accent={ACCENT} style={{ textAlign: 'center', padding: 48 }}>
          <MdPerson size={48} color="rgba(144,144,204,0.4)" />
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e6eef6', marginTop: 12 }}>No characters yet</div>
          <div style={{ fontSize: 13, color: 'rgba(160,185,215,0.6)', marginTop: 6 }}>
            Register your first character to get started.
          </div>
          <button style={{ ...S_BTN_PRIMARY, marginTop: 18 }} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onClick={openNew}>
            <MdAdd size={18} style={{ marginRight: 6 }} /> Register Character
          </button>
        </PortalCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 14 }}>
          {myChars.map(c => (
            <PortalCard key={c.id} accent={ACCENT}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${ACCENT}1f`, border: `1px solid ${ACCENT}55`,
                  }}>
                    <MdPerson size={22} color={ACCENT} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#e6eef6' }}>{c.firstName} {c.lastName}</div>
                    <span style={{ ...(DL_BADGE[c.dlStatus] || BADGE.gray), marginTop: 4 }}>
                      DL {c.dlStatus || 'N/A'}
                    </span>
                  </div>
                </div>
                <button style={sm(S_BTN_SECONDARY)} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onClick={() => openEdit(c)}>
                  <MdEdit size={15} style={{ marginRight: 4 }} /> Edit
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
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <MdWarning size={16} color="#f5a93b" />
                  {c.flags.map(fl => (
                    <span key={fl} style={BADGE.orange}>{fl}</span>
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
