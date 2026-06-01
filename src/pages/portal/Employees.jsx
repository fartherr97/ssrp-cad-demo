import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCAD } from '../../store/cadStore';
import { MdGroup, MdAdd, MdDelete, MdBusiness } from 'react-icons/md';
import { PortalPage, PortalHeader, StatCard, PortalCard, PORTAL_INPUT, PORTAL_LABEL } from './PortalKit';
import { S_BTN_PRIMARY, S_BTN_SECONDARY, S_BTN_SUCCESS, S_BTN_DANGER, sm, btnHoverOn, btnHoverOff } from '../../constants/styles';

const ACCENT = '#44aacc';
const ROLES = ['Manager', 'Employee', 'Driver', 'Security', 'Dispatcher'];
const BLANK = { name: '', role: 'Employee', phone: '', since: '' };

export default function Employees() {
  const { state, dispatch } = useCAD();
  const navigate = useNavigate();
  const myBiz = state.businesses.find(b => b.ownedByPlayer);

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(BLANK);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  if (!myBiz) {
    return (
      <PortalPage>
        <PortalHeader icon={MdGroup} title="Employees" subtitle="Manage your business staff roster." accent={ACCENT} />
        <PortalCard accent={ACCENT} style={{ textAlign: 'center', padding: '44px 24px' }}>
          <div style={{ fontSize: 14, color: 'rgba(180,200,230,0.6)', marginBottom: 18 }}>
            You need to register a business before you can manage employees.
          </div>
          <button style={{ ...S_BTN_PRIMARY, display: 'inline-flex', alignItems: 'center', gap: 6 }} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onClick={() => navigate('/portal/my-business')}>
            <MdBusiness size={16} /> Register your business
          </button>
        </PortalCard>
      </PortalPage>
    );
  }

  const canSubmit = form.name.trim() && form.role && form.phone.trim();
  const addEmployee = () => {
    if (!canSubmit) return;
    dispatch({ type: 'ADD_EMPLOYEE', payload: { businessId: myBiz.id, employee: { ...form } } });
    setForm(BLANK);
    setAdding(false);
  };

  return (
    <PortalPage>
      <PortalHeader
        icon={MdGroup}
        title="Employees"
        subtitle={`Staff roster for ${myBiz.name}`}
        accent={ACCENT}
        action={(
          <button style={{ ...S_BTN_PRIMARY, display: 'flex', alignItems: 'center', gap: 6 }} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onClick={() => setAdding(v => !v)}>
            <MdAdd size={18} /> Add Employee
          </button>
        )}
      />

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 22 }}>
        <StatCard label="Total Employees" value={myBiz.employees.length} accent={ACCENT} icon={MdGroup} hint="On the roster" />
      </div>

      {adding && (
        <PortalCard accent={ACCENT} style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label style={PORTAL_LABEL}>Name</label>
              <input style={PORTAL_INPUT} value={form.name} onChange={set('name')} placeholder="Full name" />
            </div>
            <div>
              <label style={PORTAL_LABEL}>Role</label>
              <select style={PORTAL_INPUT} value={form.role} onChange={set('role')}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={PORTAL_LABEL}>Phone</label>
              <input style={PORTAL_INPUT} value={form.phone} onChange={set('phone')} placeholder="555-0000" />
            </div>
            <div>
              <label style={PORTAL_LABEL}>Since</label>
              <input type="date" style={PORTAL_INPUT} value={form.since} onChange={set('since')} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button style={sm(S_BTN_SECONDARY)} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onClick={() => { setForm(BLANK); setAdding(false); }}>Cancel</button>
            <button style={sm(S_BTN_SUCCESS)} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} disabled={!canSubmit} onClick={addEmployee}>Add Employee</button>
          </div>
        </PortalCard>
      )}

      {myBiz.employees.length === 0 ? (
        <PortalCard accent={ACCENT} style={{ textAlign: 'center', padding: '44px 24px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${ACCENT}1f`, border: `1px solid ${ACCENT}55`,
          }}>
            <MdGroup size={30} color={ACCENT} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e6eef6', marginBottom: 6 }}>No employees yet</div>
          <div style={{ fontSize: 13, color: 'rgba(180,200,230,0.6)' }}>Use “Add Employee” to build your roster.</div>
        </PortalCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {myBiz.employees.map(emp => (
            <PortalCard key={emp.id} accent={ACCENT}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#e6eef6' }}>{emp.name}</div>
                  <span style={{
                    display: 'inline-block', marginTop: 6, fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999,
                    background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}55`,
                  }}>{emp.role}</span>
                </div>
                <button style={{ ...sm(S_BTN_DANGER), display: 'flex', alignItems: 'center', gap: 5 }} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onClick={() => dispatch({ type: 'REMOVE_EMPLOYEE', payload: { businessId: myBiz.id, employeeId: emp.id } })}>
                  <MdDelete size={16} /> Remove
                </button>
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 14, fontSize: 12 }}>
                <div>
                  <div style={{ color: 'rgba(150,175,205,0.5)', fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Phone</div>
                  <div style={{ color: '#dce6f0', marginTop: 2 }}>{emp.phone || '—'}</div>
                </div>
                <div>
                  <div style={{ color: 'rgba(150,175,205,0.5)', fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Since</div>
                  <div style={{ color: '#dce6f0', marginTop: 2 }}>{emp.since || '—'}</div>
                </div>
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </PortalPage>
  );
}
