import { useState } from 'react';
import { useCAD } from '../../store/cadStore';
import { MdBusiness, MdEdit } from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard, Field, PORTAL_INPUT, PORTAL_LABEL } from './PortalKit';
import { S_BTN_PRIMARY, S_BTN_SECONDARY, S_BTN_SUCCESS, BADGE, sm } from '../../constants/styles';

const BLANK = { name: '', type: '', owner: '', ein: '', phone: '', address: '' };

export default function MyBusiness() {
  const { state, dispatch } = useCAD();
  const { currentUser } = state;
  const myBiz = state.businesses.find(b => b.ownedByPlayer);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(myBiz
    ? { name: myBiz.name, type: myBiz.type, owner: myBiz.owner, ein: myBiz.ein, phone: myBiz.phone, address: myBiz.address }
    : { ...BLANK, owner: currentUser?.name || '' });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  /* ─── Registration (no business yet) ─── */
  if (!myBiz) {
    const canSubmit = form.name.trim() && form.type.trim();
    const register = () => {
      if (!canSubmit) return;
      dispatch({ type: 'ADD_BUSINESS', payload: { ...form } });
    };
    return (
      <PortalPage>
        <PortalHeader
          icon={MdBusiness}
          title="Register Business"
          subtitle="Register your business with the city to access the self-service portal."
          accent="brand"
        />
        <PortalCard accent="brand">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div>
              <label className={PORTAL_LABEL}>Business Name</label>
              <input className={PORTAL_INPUT} value={form.name} onChange={set('name')} placeholder="e.g. Bayshore Auto & Towing" />
            </div>
            <div>
              <label className={PORTAL_LABEL}>Business Type</label>
              <input className={PORTAL_INPUT} value={form.type} onChange={set('type')} placeholder="e.g. Automotive / Towing" />
            </div>
            <div>
              <label className={PORTAL_LABEL}>Owner</label>
              <input className={PORTAL_INPUT} value={form.owner} onChange={set('owner')} placeholder="Owner full name" />
            </div>
            <div>
              <label className={PORTAL_LABEL}>EIN</label>
              <input className={`${PORTAL_INPUT} font-mono`} value={form.ein} onChange={set('ein')} placeholder="FL-00-0000000" />
            </div>
            <div>
              <label className={PORTAL_LABEL}>Phone</label>
              <input className={PORTAL_INPUT} value={form.phone} onChange={set('phone')} placeholder="555-0000" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className={PORTAL_LABEL}>Address</label>
              <input className={PORTAL_INPUT} value={form.address} onChange={set('address')} placeholder="Street, City" />
            </div>
          </div>
          <div className="flex justify-end mt-5">
            <button className={S_BTN_PRIMARY} disabled={!canSubmit} onClick={register}>
              Register Business
            </button>
          </div>
        </PortalCard>
      </PortalPage>
    );
  }

  /* ─── Profile + inline edit ─── */
  const startEdit = () => {
    setForm({ name: myBiz.name, type: myBiz.type, owner: myBiz.owner, ein: myBiz.ein, phone: myBiz.phone, address: myBiz.address });
    setEditing(true);
  };
  const save = () => {
    dispatch({ type: 'UPDATE_BUSINESS', payload: { id: myBiz.id, ...form } });
    setEditing(false);
  };

  return (
    <PortalPage>
      <PortalHeader
        icon={MdBusiness}
        title="My Business"
        subtitle="Your registered business profile."
        accent="brand"
        action={!editing && (
          <button className={`${sm(S_BTN_SECONDARY)} flex items-center gap-1.5`} onClick={startEdit}>
            <MdEdit size={16} /> Edit
          </button>
        )}
      />

      <PortalCard accent="brand">
        {editing ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div>
                <label className={PORTAL_LABEL}>Business Name</label>
                <input className={PORTAL_INPUT} value={form.name} onChange={set('name')} />
              </div>
              <div>
                <label className={PORTAL_LABEL}>Business Type</label>
                <input className={PORTAL_INPUT} value={form.type} onChange={set('type')} />
              </div>
              <div>
                <label className={PORTAL_LABEL}>Owner</label>
                <input className={PORTAL_INPUT} value={form.owner} onChange={set('owner')} />
              </div>
              <div>
                <label className={PORTAL_LABEL}>EIN</label>
                <input className={`${PORTAL_INPUT} font-mono`} value={form.ein} onChange={set('ein')} />
              </div>
              <div>
                <label className={PORTAL_LABEL}>Phone</label>
                <input className={PORTAL_INPUT} value={form.phone} onChange={set('phone')} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className={PORTAL_LABEL}>Address</label>
                <input className={PORTAL_INPUT} value={form.address} onChange={set('address')} />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 mt-5">
              <button className={sm(S_BTN_SECONDARY)} onClick={() => setEditing(false)}>Cancel</button>
              <button className={sm(S_BTN_SUCCESS)} disabled={!form.name.trim()} onClick={save}>Save Changes</button>
            </div>
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            <Field label="Business Name" value={myBiz.name} />
            <Field label="Type" value={myBiz.type} />
            <Field label="Owner" value={myBiz.owner} />
            <Field label="EIN" value={myBiz.ein} mono />
            <Field label="Phone" value={myBiz.phone} />
            <Field label="Address" value={myBiz.address} />
            <Field label="License" value={myBiz.license} mono />
            <Field label="License Expiry" value={myBiz.licenseExpiry} />
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold tracking-[0.6px] uppercase text-slate-500">Status</span>
              <span>
                <span className={myBiz.status === 'ACTIVE' ? BADGE.green : BADGE.gray}>{myBiz.status}</span>
              </span>
            </div>
          </div>
        )}
      </PortalCard>
    </PortalPage>
  );
}
