import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useResponsive } from '../../../hooks/useResponsive';
import { MdStore, MdAdd, MdDelete, MdPerson, MdClose, MdCheck, MdArrowBack } from 'react-icons/md';

const BUSINESS_TYPES = [
  'Automotive / Towing', 'Restaurant / Food Service', 'Retail / Shop',
  'Security / Private Contractor', 'Medical / Pharmacy', 'Legal Services',
  'Transportation / Logistics', 'Real Estate', 'Entertainment / Nightlife',
  'Construction / Contracting', 'Finance / Banking', 'Other',
];

const STATUS_CFG = {
  ACTIVE:    { color: '#22c55e', bg: 'rgba(34,197,94,0.10)'  },
  SUSPENDED: { color: '#f97316', bg: 'rgba(249,115,22,0.10)' },
  REVOKED:   { color: '#ef4444', bg: 'rgba(239,68,68,0.10)'  },
};

const EMP_ROLES = ['Manager', 'Employee', 'Driver', 'Security', 'Dispatcher', 'Accountant'];

const BLANK_BIZ = { name: '', type: '', owner: '', ownerDiscordId: '', ein: '', phone: '', address: '', license: '', licenseExpiry: '', status: 'ACTIVE' };
const BLANK_EMP = { name: '', discordId: '', role: 'Employee', phone: '', since: '' };

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.ACTIVE;
  return (
    <span className="text-[9.5px] font-bold px-2 py-0.5 rounded"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.color}30` }}>
      {status}
    </span>
  );
}

function FInput({ label, value, onChange, placeholder, mono, span2 }) {
  return (
    <div className={span2 ? 'col-span-1 sm:col-span-2' : ''}>
      <div className="text-[9.5px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1.5">{label}</div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full text-[12.5px] text-white rounded-lg px-3 py-2 outline-none ${mono ? 'font-mono' : ''}`}
        style={{ background: '#111e2d', border: '1px solid rgba(255,255,255,0.10)' }} />
    </div>
  );
}

function FSelect({ label, value, onChange, options, span2 }) {
  return (
    <div className={span2 ? 'col-span-1 sm:col-span-2' : ''}>
      <div className="text-[9.5px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1.5">{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full text-[12.5px] text-white rounded-lg px-3 py-2 outline-none"
        style={{ background: '#111e2d', border: '1px solid rgba(255,255,255,0.10)' }}>
        {options.map(o => typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export default function AdminBusinesses() {
  const { state, dispatch } = useCAD();
  const { businesses, officers } = state;
  const { isMobile } = useResponsive();

  const [selected,      setSelected]      = useState(null);
  const [form,          setForm]          = useState(BLANK_BIZ);
  const [isNew,         setIsNew]         = useState(false);
  const [empForm,       setEmpForm]       = useState(BLANK_EMP);
  const [addingEmp,     setAddingEmp]     = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const sf = k => v => setForm(f => ({ ...f, [k]: v }));
  const se = k => v => setEmpForm(f => ({ ...f, [k]: v }));

  const selectedBiz = businesses.find(b => b.id === selected);
  const panelOpen   = isNew || selected !== null;

  const closePanel = () => { setSelected(null); setIsNew(false); };

  const openNew = () => {
    setForm({ ...BLANK_BIZ });
    setSelected(null);
    setIsNew(true);
    setAddingEmp(false);
    setDeleteConfirm(null);
  };

  const openEdit = (biz) => {
    setForm({ name: biz.name, type: biz.type || '', owner: biz.owner || '', ownerDiscordId: biz.ownerDiscordId || '', ein: biz.ein || '', phone: biz.phone || '', address: biz.address || '', license: biz.license || '', licenseExpiry: biz.licenseExpiry || '', status: biz.status || 'ACTIVE' });
    setSelected(biz.id);
    setIsNew(false);
    setAddingEmp(false);
    setDeleteConfirm(null);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (isNew) {
      dispatch({ type: 'ADD_BUSINESS', payload: { ...form } });
      setIsNew(false);
      setSelected(null);
    } else {
      dispatch({ type: 'UPDATE_BUSINESS', payload: { id: selected, ...form } });
    }
  };

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_BUSINESS', payload: id });
    setDeleteConfirm(null);
    setSelected(null);
    setIsNew(false);
  };

  const handleAddEmployee = () => {
    if (!empForm.name.trim() || !selected) return;
    dispatch({ type: 'ADD_EMPLOYEE', payload: { businessId: selected, employee: { ...empForm } } });
    setEmpForm(BLANK_EMP);
    setAddingEmp(false);
  };

  const handleRemoveEmployee = (bizId, empId) => {
    dispatch({ type: 'REMOVE_EMPLOYEE', payload: { businessId: bizId, employeeId: empId } });
  };

  /* On mobile: show list OR form, never both side by side */
  const showList = !isMobile || !panelOpen;
  const showForm = panelOpen;

  return (
    <div className="flex h-full min-h-0" style={{ background: '#08111c' }}>

      {/* ── Left: list ──────────────────────────────────────────────────────── */}
      {showList && (
        <div className="flex flex-col min-h-0 shrink-0"
          style={{
            width: (!isMobile && panelOpen) ? 340 : '100%',
            borderRight: (!isMobile && panelOpen) ? '1px solid rgba(255,255,255,0.07)' : 'none',
          }}>

          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#060e18' }}>
            <div className="flex items-center gap-2">
              <MdStore size={16} style={{ color: '#3a88e8' }} />
              <span className="text-[13px] font-extrabold text-white">Business Management</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#4a5568', border: '1px solid rgba(255,255,255,0.07)' }}>
                {businesses.length}
              </span>
            </div>
            <button onClick={openNew} type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold"
              style={{ cursor: 'pointer', background: 'rgba(58,136,232,0.12)', border: '1px solid rgba(58,136,232,0.28)', color: '#3a88e8' }}>
              <MdAdd size={14} /> New Business
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {businesses.length === 0 && (
              <div className="text-center py-12 text-[12px] text-slate-600">No businesses registered.</div>
            )}
            {businesses.map(biz => {
              const isActive = selected === biz.id && !isNew;
              return (
                <div key={biz.id} onClick={() => openEdit(biz)} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
                  style={{ background: isActive ? 'rgba(58,136,232,0.10)' : 'rgba(255,255,255,0.025)', border: `1px solid ${isActive ? 'rgba(58,136,232,0.28)' : 'rgba(255,255,255,0.07)'}` }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(58,136,232,0.10)', border: '1px solid rgba(58,136,232,0.18)' }}>
                    <MdStore size={17} style={{ color: '#3a88e8' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-white truncate">{biz.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{biz.type}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={biz.status} />
                    <span className="text-[10px] text-slate-600">{biz.employees?.length || 0} emp</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Right: form panel ────────────────────────────────────────────────── */}
      {showForm && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">

          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#060e18' }}>
            <div className="flex items-center gap-2 min-w-0">
              {isMobile && (
                <button onClick={closePanel} type="button"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', marginRight: 4 }}>
                  <MdArrowBack size={18} className="text-slate-400" />
                </button>
              )}
              <span className="text-[13px] font-extrabold text-white truncate">
                {isNew ? 'New Business' : selectedBiz?.name}
              </span>
            </div>
            {!isMobile && (
              <button onClick={closePanel} type="button"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
                <MdClose size={18} className="text-slate-600" />
              </button>
            )}
          </div>

          <div className="p-4 sm:p-5 flex flex-col gap-6">

            {/* Business details */}
            <section>
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-600 mb-3">Business Details</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FInput label="Business Name" value={form.name} onChange={sf('name')} placeholder="e.g. Bayshore Auto & Towing" span2 />
                <FSelect label="Type" value={form.type} onChange={sf('type')} options={['', ...BUSINESS_TYPES]} />
                <FSelect label="Status" value={form.status} onChange={sf('status')} options={['ACTIVE','SUSPENDED','REVOKED']} />
                <FInput label="EIN" value={form.ein} onChange={sf('ein')} placeholder="FL-XX-XXXXXXX" mono />
                <FInput label="Phone" value={form.phone} onChange={sf('phone')} placeholder="555-0000" />
                <FInput label="Address" value={form.address} onChange={sf('address')} placeholder="123 Main St, Tampa" span2 />
                <FInput label="License #" value={form.license} onChange={sf('license')} placeholder="BL-2026-XXXX" mono />
                <FInput label="License Expiry" value={form.licenseExpiry} onChange={sf('licenseExpiry')} placeholder="2026-12-31" />
              </div>
            </section>

            {/* Owner assignment */}
            <section>
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-600 mb-3">Owner Assignment</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <FInput label="Owner Name" value={form.owner} onChange={sf('owner')} placeholder="Full name" />
                <FInput label="Owner Discord ID" value={form.ownerDiscordId} onChange={sf('ownerDiscordId')} placeholder="Discord snowflake" mono />
              </div>
              <div className="text-[9.5px] font-bold uppercase tracking-[0.5px] text-slate-600 mb-1.5">Quick-assign from accounts</div>
              <div className="flex flex-col gap-0 max-h-40 overflow-y-auto rounded-xl"
                style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                {officers.map(o => {
                  const active = form.ownerDiscordId === o.discordId;
                  return (
                    <button key={o.id} type="button" onClick={() => setForm(f => ({ ...f, owner: o.name, ownerDiscordId: o.discordId || '' }))}
                      className="flex items-center gap-2.5 px-3 py-2 text-left"
                      style={{ cursor: 'pointer', background: active ? 'rgba(58,136,232,0.10)' : 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <MdPerson size={13} className="text-slate-600 shrink-0" />
                      <span className="text-[11.5px] text-slate-200 flex-1">{o.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">{o.badge}</span>
                      {active && <MdCheck size={13} style={{ color: '#3a88e8' }} />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Employees — only for saved businesses */}
            {!isNew && selectedBiz && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-600">
                    Employees ({selectedBiz.employees?.length || 0})
                  </div>
                  <button onClick={() => setAddingEmp(v => !v)} type="button"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold"
                    style={{ cursor: 'pointer', background: 'rgba(58,136,232,0.08)', border: '1px solid rgba(58,136,232,0.22)', color: '#3a88e8' }}>
                    <MdAdd size={12} /> Add Employee
                  </button>
                </div>

                {addingEmp && (
                  <div className="flex flex-col gap-2.5 p-3 rounded-xl mb-3"
                    style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <FInput label="Name"       value={empForm.name}      onChange={se('name')}      placeholder="Full name" />
                      <FSelect label="Role"      value={empForm.role}      onChange={se('role')}      options={EMP_ROLES} />
                      <FInput label="Discord ID" value={empForm.discordId} onChange={se('discordId')} placeholder="Snowflake ID" mono />
                      <FInput label="Phone"      value={empForm.phone}     onChange={se('phone')}     placeholder="555-0000" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setAddingEmp(false)} type="button"
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold"
                        style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#4a5568' }}>
                        Cancel
                      </button>
                      <button onClick={handleAddEmployee} type="button"
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold"
                        style={{ cursor: 'pointer', background: 'rgba(58,136,232,0.12)', border: '1px solid rgba(58,136,232,0.28)', color: '#3a88e8' }}>
                        Add
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  {(selectedBiz.employees || []).length === 0 && (
                    <span className="text-[11px] text-slate-600 italic px-1">No employees yet.</span>
                  )}
                  {(selectedBiz.employees || []).map(emp => (
                    <div key={emp.id} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-bold text-slate-200">{emp.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500">{emp.role}</span>
                          {emp.discordId && <span className="text-[10px] font-mono text-slate-600">{emp.discordId}</span>}
                        </div>
                      </div>
                      <button onClick={() => handleRemoveEmployee(selectedBiz.id, emp.id)} type="button"
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
                        <MdDelete size={15} className="text-slate-700 hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Save / Delete */}
            <div className="flex gap-3">
              {!isNew && (
                deleteConfirm === selected ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-red-400">Confirm delete?</span>
                    <button onClick={() => handleDelete(selected)} type="button"
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold"
                      style={{ cursor: 'pointer', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)', color: '#ef4444' }}>
                      Yes, Delete
                    </button>
                    <button onClick={() => setDeleteConfirm(null)} type="button"
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold"
                      style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#4a5568' }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(selected)} type="button"
                    className="px-4 py-2 rounded-xl text-[12px] font-bold"
                    style={{ cursor: 'pointer', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.16)', color: '#ef4444' }}>
                    Delete
                  </button>
                )
              )}
              <button onClick={handleSave} type="button"
                className="flex-1 py-2 rounded-xl text-[12px] font-bold"
                style={{ cursor: 'pointer', background: 'rgba(58,136,232,0.14)', border: '1px solid rgba(58,136,232,0.30)', color: '#3a88e8' }}>
                {isNew ? 'Create Business' : 'Save Changes'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
