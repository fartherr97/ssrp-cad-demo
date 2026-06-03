import { useState } from 'react';
import { useCAD } from '../../store/cadStore';
import { MdBusiness, MdEdit } from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard, Field, PORTAL_INPUT, PORTAL_LABEL } from './PortalKit';
import { S_BTN_SECONDARY, S_BTN_SUCCESS, BADGE, sm } from '../../constants/styles';
import AccessDenied from './AccessDenied';
import { useActiveBusiness, BusinessSwitcher } from '../../contexts/BusinessContext';

const BLANK = { name: '', type: '', owner: '', ein: '', phone: '', address: '' };

export default function MyBusiness() {
  const { dispatch } = useCAD();
  const { activeBiz: myBiz } = useActiveBusiness();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(
    myBiz
      ? { name: myBiz.name, type: myBiz.type, owner: myBiz.owner, ein: myBiz.ein, phone: myBiz.phone, address: myBiz.address }
      : BLANK
  );

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  if (!myBiz) return <AccessDenied portalName="the Business Center" />;

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
      <BusinessSwitcher />
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 16 }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 20 }}>
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
