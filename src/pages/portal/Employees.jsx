import { useState } from 'react';
import { useCAD } from '../../store/cadStore';
import { useToast } from '../../contexts/ToastContext';
import { MdGroup, MdAdd, MdDelete, MdCheck } from 'react-icons/md';
import { PortalPage, PortalHeader, StatCard, PortalCard, PORTAL_INPUT, PORTAL_LABEL } from './PortalKit';
import { S_BTN_PRIMARY, S_BTN_SECONDARY, S_BTN_SUCCESS, S_BTN_DANGER, sm } from '../../constants/styles';
import AccessDenied from './AccessDenied';
import { useActiveBusiness, BusinessSwitcher } from '../../contexts/BusinessContext';

const ACCENT = 'brand';
const ROLES = ['Manager', 'Supervisor', 'Dispatcher', 'Driver', 'Inspector', 'Security', 'Employee'];
const BLANK = { name: '', roles: ['Employee'], phone: '', since: '' };

/* Normalise legacy single-role string to array */
function getRoles(emp) {
  if (Array.isArray(emp.roles)) return emp.roles;
  if (emp.role) return [emp.role];
  return [];
}

function RoleCheckboxes({ selected, onChange }) {
  const toggle = (r) => {
    if (selected.includes(r)) {
      onChange(selected.filter(x => x !== r));
    } else {
      onChange([...selected, r]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {ROLES.map(r => {
        const on = selected.includes(r);
        return (
          <button key={r} type="button" onClick={() => toggle(r)}
            className="press-sm inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-bold cursor-pointer transition-all border"
            style={{
              background:   on ? 'rgba(58,136,232,0.15)' : 'rgba(255,255,255,0.04)',
              borderColor:  on ? 'rgba(58,136,232,0.5)'  : 'rgba(255,255,255,0.1)',
              color:        on ? '#7fb3f5'               : '#64748b',
            }}>
            {on && <MdCheck size={12} />}
            {r}
          </button>
        );
      })}
    </div>
  );
}

export default function Employees() {
  const { dispatch } = useCAD();
  const toast = useToast();
  const { activeBiz: myBiz } = useActiveBusiness();

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(BLANK);
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const setField = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  if (!myBiz) return <AccessDenied portalName="the Business Center" />;

  const canSubmit = form.name.trim() && form.roles.length > 0 && form.phone.trim();

  const addEmployee = () => {
    if (!canSubmit) return;
    dispatch({ type: 'ADD_EMPLOYEE', payload: { businessId: myBiz.id, employee: { ...form } } });
    toast.success(`${form.name} added to the roster.`, { title: 'Employee Added' });
    setForm(BLANK);
    setAdding(false);
  };

  const removeEmployee = (emp) => {
    dispatch({ type: 'REMOVE_EMPLOYEE', payload: { businessId: myBiz.id, employeeId: emp.id } });
    toast.success(`${emp.name} removed from the roster.`, { title: 'Employee Removed' });
  };

  return (
    <PortalPage>
      <BusinessSwitcher />
      <PortalHeader
        icon={MdGroup}
        title="Employees"
        subtitle={`Staff roster for ${myBiz.name}`}
        accent={ACCENT}
        action={(
          <button className={`${S_BTN_PRIMARY} flex items-center gap-1.5`} onClick={() => setAdding(v => !v)}>
            <MdAdd size={18} /> Add Employee
          </button>
        )}
      />

      <div className="flex gap-3.5 flex-wrap mb-[22px]">
        <StatCard label="Total Employees" value={myBiz.employees.length} accent={ACCENT} icon={MdGroup} hint="On the roster" />
      </div>

      {adding && (
        <PortalCard accent={ACCENT} className="mb-5">
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))' }}>
            <div>
              <label className={PORTAL_LABEL}>Name</label>
              <input className={PORTAL_INPUT} value={form.name} onChange={setField('name')} placeholder="Full name" />
            </div>
            <div>
              <label className={PORTAL_LABEL}>Phone</label>
              <input className={PORTAL_INPUT} value={form.phone} onChange={setField('phone')} placeholder="555-0000" />
            </div>
            <div>
              <label className={PORTAL_LABEL}>Since</label>
              <input type="date" className={`${PORTAL_INPUT} h-[42px]`} value={form.since} onChange={setField('since')} style={{ colorScheme: 'dark' }} />
            </div>
          </div>
          <div className="mt-4">
            <label className={PORTAL_LABEL}>Roles <span className="text-slate-600 font-normal normal-case tracking-normal">(select all that apply)</span></label>
            <RoleCheckboxes selected={form.roles} onChange={set('roles')} />
            {form.roles.length === 0 && (
              <div className="text-[11px] text-amber-400 mt-1.5">At least one role required.</div>
            )}
          </div>
          <div className="flex justify-end gap-2.5 mt-[18px]">
            <button className={sm(S_BTN_SECONDARY)} onClick={() => { setForm(BLANK); setAdding(false); }}>Cancel</button>
            <button className={`${sm(S_BTN_SUCCESS)} press`} disabled={!canSubmit} onClick={addEmployee}>Add Employee</button>
          </div>
        </PortalCard>
      )}

      {myBiz.employees.length === 0 ? (
        <PortalCard accent={ACCENT} className="text-center px-6 py-[44px]">
          <div className="w-14 h-14 rounded-[14px] mx-auto mb-4 flex items-center justify-center bg-brand/15 border border-brand/30">
            <MdGroup size={30} className="text-brand-bright" />
          </div>
          <div className="text-[15px] font-bold text-slate-100 mb-1.5">No employees yet</div>
          <div className="text-sm text-slate-400">Use "Add Employee" to build your roster.</div>
        </PortalCard>
      ) : (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }}>
          {myBiz.employees.map(emp => {
            const empRoles = getRoles(emp);
            return (
              <PortalCard key={emp.id} accent={ACCENT}>
                <div className="flex justify-between items-start gap-2.5">
                  <div className="min-w-0">
                    <div className="text-[15px] font-bold text-slate-100">{emp.name}</div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {empRoles.map(r => (
                        <span key={r} className="inline-block text-[11px] font-bold px-[9px] py-0.5 rounded-full bg-brand/15 text-brand-bright border border-brand/30">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    className={`${sm(S_BTN_DANGER)} press-sm flex items-center gap-1`}
                    onClick={() => removeEmployee(emp)}
                  >
                    <MdDelete size={16} /> Remove
                  </button>
                </div>
                <div className="flex gap-6 mt-3.5 text-xs">
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.5px] uppercase text-slate-500">Phone</div>
                    <div className="text-slate-200 mt-0.5">{emp.phone || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.5px] uppercase text-slate-500">Since</div>
                    <div className="text-slate-200 mt-0.5">{emp.since || '—'}</div>
                  </div>
                </div>
              </PortalCard>
            );
          })}
        </div>
      )}
    </PortalPage>
  );
}
