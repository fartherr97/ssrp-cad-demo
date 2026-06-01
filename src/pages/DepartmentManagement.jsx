import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { RANKS } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import { useResponsive } from '../hooks/useResponsive';

const DEPT_TYPES = ['LEO','Fire','EMS','Dispatch','Civilian'];

export default function DepartmentManagement() {
  const { state, dispatch } = useCAD();
  const { departments, officers } = state;
  const { isMobile } = useResponsive();
  const [selectedDept, setSelectedDept] = useState(departments[0]);
  const [showForm, setShowForm] = useState(false);
  const [showSubForm, setShowSubForm] = useState(false);
  const [deptForm, setDeptForm] = useState({ name:'', short:'', abbreviation:'', color:'#1a6bbf', type:'LEO', badgePrefix:'', radioChannel:'' });
  const [subName, setSubName] = useState('');

  const deptOfficers = officers.filter(o => o.dept === selectedDept?.id);

  const handleAddDept = (e) => {
    e.preventDefault();
    dispatch({ type: 'ADD_DEPARTMENT', payload: deptForm });
    setShowForm(false);
    setDeptForm({ name:'', short:'', abbreviation:'', color:'#1a6bbf', type:'LEO', badgePrefix:'', radioChannel:'' });
  };

  const handleAddSub = (e) => {
    e.preventDefault();
    if (!subName || !selectedDept) return;
    const updated = { ...selectedDept, subdivisions: [...(selectedDept.subdivisions || []), subName] };
    dispatch({ type: 'UPDATE_DEPARTMENT', payload: updated });
    setSelectedDept(updated);
    setSubName('');
    setShowSubForm(false);
  };

  return (
    <div style={{ padding: '14px', fontFamily: 'Ubuntu, sans-serif' }}>
      {/* Mobile: dropdown selector */}
      {isMobile && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px' }}>DEPARTMENTS</span>
            <button onClick={() => setShowForm(true)} style={{ ...blueBtn, marginLeft: 'auto', fontSize: '11px', padding: '4px 10px' }}>+ New</button>
          </div>
          <select
            value={selectedDept?.id || ''}
            onChange={e => setSelectedDept(departments.find(d => d.id === Number(e.target.value)))}
            style={inputBase}
          >
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.short} — {dept.name}</option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: 'flex', gap: '14px', minHeight: isMobile ? 'auto' : 'calc(100vh - 80px)' }}>
        {/* Desktop: sidebar list */}
        {!isMobile && (
          <div style={{ width: '250px', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px' }}>DEPARTMENTS</span>
              <button onClick={() => setShowForm(true)} style={{ ...blueBtn, fontSize: '11px', padding: '3px 10px' }}>+ New</button>
            </div>
            {departments.map(dept => (
              <div
                key={dept.id}
                onClick={() => setSelectedDept(dept)}
                style={{
                  background: selectedDept?.id === dept.id ? '#0f172a' : '#090b10',
                  border: `1px solid ${selectedDept?.id === dept.id ? dept.color : '#1e2533'}`,
                  padding: '9px 12px',
                  cursor: 'pointer',
                  marginBottom: '4px',
                  borderLeft: `3px solid ${dept.color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#d1d5db', fontSize: '13px', fontWeight: 700 }}>{dept.short}</span>
                  <span style={{ color: '#4b5563', fontSize: '10px' }}>[{dept.type}]</span>
                </div>
                <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>{dept.name}</div>
                <div style={{ color: '#374151', fontSize: '10px', marginTop: '1px' }}>
                  {officers.filter(o => o.dept === dept.id).length} officers
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Department detail */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selectedDept && (
            <>
              {/* Dept header */}
              <div style={{ background: '#0d1117', border: `1px solid ${selectedDept.color}50`, borderLeft: `3px solid ${selectedDept.color}`, padding: '14px 16px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: 700 }}>{selectedDept.name}</span>
                  <span style={{ background: selectedDept.color + '25', border: `1px solid ${selectedDept.color}60`, color: selectedDept.color, padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>{selectedDept.type}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '8px', fontSize: '13px' }}>
                  {[['Abbreviation', selectedDept.abbreviation || selectedDept.short],['Badge Prefix', selectedDept.badgePrefix],['Radio Channel', selectedDept.radioChannel],['Active Officers', deptOfficers.filter(o => o.status !== 'OFFDUTY').length + ' / ' + deptOfficers.length]].map(([l,v]) => (
                    <div key={l} style={{ background: '#090b10', border: '1px solid #1f2937', padding: '8px 10px' }}>
                      <div style={{ color: '#3b82f6', fontSize: '10px', letterSpacing: '1px', marginBottom: '3px' }}>{l.toUpperCase()}</div>
                      <div style={{ color: '#d1d5db' }}>{v || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subdivisions */}
              <div style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '14px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px' }}>SUBDIVISIONS</span>
                  <button onClick={() => setShowSubForm(true)} style={{ ...blueBtn, fontSize: '11px', padding: '3px 10px' }}>+ Add</button>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(selectedDept.subdivisions || []).map(sub => (
                    <div key={sub} style={{ background: '#090b10', border: '1px solid #1f2937', padding: '5px 12px', fontSize: '12px', color: '#9ca3af' }}>
                      {sub}
                      <span style={{ color: '#374151', marginLeft: '8px', fontSize: '10px' }}>
                        ({deptOfficers.filter(o => o.subdivision === sub).length})
                      </span>
                    </div>
                  ))}
                  {(!selectedDept.subdivisions || selectedDept.subdivisions.length === 0) && (
                    <span style={{ color: '#374151', fontSize: '13px' }}>No subdivisions defined</span>
                  )}
                </div>
                {showSubForm && (
                  <form onSubmit={handleAddSub} style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <input value={subName} onChange={e => setSubName(e.target.value)} placeholder="Subdivision name..." required style={{ ...inputBase, flex: 1, minWidth: '150px' }} />
                    <button type="submit" style={blueBtn}>Add</button>
                    <button type="button" onClick={() => setShowSubForm(false)} style={ghostBtn}>Cancel</button>
                  </form>
                )}
              </div>

              {/* Rank structure */}
              <div style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '14px', marginBottom: '10px' }}>
                <div style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '10px' }}>RANK STRUCTURE</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(RANKS[selectedDept.type] || RANKS.LEO).map((rank, i) => (
                    <div key={rank} style={{ background: '#090b10', border: '1px solid #1f2937', padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ color: '#3b82f6', fontSize: '10px' }}>{i + 1}.</span>
                      <span style={{ color: '#9ca3af' }}>{rank}</span>
                      <span style={{ color: '#374151', fontSize: '10px' }}>({deptOfficers.filter(o => o.rank === rank).length})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roster */}
              <div style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '14px' }}>
                <div style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '10px' }}>DEPARTMENT ROSTER ({deptOfficers.length})</div>
                <div className="table-scroll">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#0b0d14' }}>
                        {['Name','Badge','Rank','Subdivision','Status'].map(h => (
                          <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#6b7280', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', borderBottom: '1px solid #1e2533', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {deptOfficers.map((o, i) => (
                        <tr key={o.id} style={{ background: i % 2 === 0 ? '#0d1117' : '#111218' }}>
                          <td style={{ padding: '6px 10px', color: '#d1d5db' }}>{o.name}</td>
                          <td style={{ padding: '6px 10px', color: '#60a5fa', fontWeight: 700 }}>{o.badge}</td>
                          <td style={{ padding: '6px 10px', color: '#9ca3af' }}>{o.rank}</td>
                          <td style={{ padding: '6px 10px', color: '#9ca3af' }}>{o.subdivision}</td>
                          <td style={{ padding: '6px 10px' }}><StatusBadge status={o.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {deptOfficers.length === 0 && <div style={{ color: '#374151', fontSize: '13px', textAlign: 'center', padding: '18px' }}>No officers in this department.</div>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Department Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <form onSubmit={handleAddDept} style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '22px', maxWidth: '500px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '13px', letterSpacing: '1.5px', fontFamily: 'Ubuntu, sans-serif' }}>CREATE DEPARTMENT</span>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '16px' }}>X</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              {[['Full Name *','name'],['Short Name *','short'],['Abbreviation','abbreviation'],['Badge Prefix','badgePrefix'],['Radio Channel','radioChannel']].map(([l,k]) => (
                <div key={k} style={k === 'name' ? { gridColumn: '1/-1' } : {}}>
                  <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>{l}</label>
                  <input value={deptForm[k]} onChange={e => setDeptForm(f => ({ ...f, [k]: e.target.value }))} required={l.includes('*')} style={inputBase} />
                </div>
              ))}
              <div>
                <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>TYPE</label>
                <select value={deptForm.type} onChange={e => setDeptForm(f => ({ ...f, type: e.target.value }))} style={inputBase}>
                  {DEPT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>COLOR</label>
                <input type="color" value={deptForm.color} onChange={e => setDeptForm(f => ({ ...f, color: e.target.value }))} style={{ ...inputBase, height: '36px', padding: '4px' }} />
              </div>
            </div>
            <button type="submit" style={{ width: '100%', ...blueBtn, padding: '9px', fontSize: '13px', letterSpacing: '1px' }}>
              CREATE DEPARTMENT
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const inputBase = { width: '100%', background: '#090b10', border: '1px solid #1e2533', color: '#d1d5db', padding: '7px 10px', fontSize: '13px', fontFamily: 'Ubuntu, sans-serif', boxSizing: 'border-box' };
const blueBtn = { background: '#0c1a2e', border: '1px solid #3b82f6', color: '#3b82f6', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif', fontWeight: 700 };
const ghostBtn = { background: 'transparent', border: '1px solid #1f2937', color: '#4b5563', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif' };
