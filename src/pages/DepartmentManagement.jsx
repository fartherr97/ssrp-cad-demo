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
  const base = { background: '#060d1a', border: '1px solid #1e4080', borderRadius: '4px', color: '#e2e8f0', padding: '7px 10px', fontSize: '14px', fontFamily: 'Ubuntu Mono, monospace', width: '100%', boxSizing: 'border-box' };

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
    <div style={{ padding: '16px', fontFamily: 'Ubuntu Mono, monospace' }}>
      {/* Mobile: dropdown selector */}
      {isMobile && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#e2a84b', fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}>DEPARTMENTS</span>
            <button onClick={() => setShowForm(true)} style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace', marginLeft: 'auto' }}>+ New</button>
          </div>
          <select
            value={selectedDept?.id || ''}
            onChange={e => setSelectedDept(departments.find(d => d.id === Number(e.target.value)))}
            style={{ ...base, marginBottom: '0' }}
          >
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.short} — {dept.name}</option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', minHeight: isMobile ? 'auto' : 'calc(100vh - 80px)' }}>
        {/* Desktop: sidebar list */}
        {!isMobile && (
          <div style={{ width: '260px', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: '#e2a84b', fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}>DEPARTMENTS</span>
              <button onClick={() => setShowForm(true)} style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>+ New</button>
            </div>
            {departments.map(dept => (
              <div
                key={dept.id}
                onClick={() => setSelectedDept(dept)}
                style={{
                  background: selectedDept?.id === dept.id ? '#0d2545' : '#0a1525',
                  border: `1px solid ${selectedDept?.id === dept.id ? dept.color : '#1e3060'}`,
                  borderRadius: '4px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  marginBottom: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: dept.color, flexShrink: 0 }} />
                  <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 700 }}>{dept.short}</span>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>[{dept.type}]</span>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '3px', marginLeft: '18px' }}>{dept.name}</div>
                <div style={{ color: '#475569', fontSize: '11px', marginTop: '2px', marginLeft: '18px' }}>
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
              {/* Header */}
              <div style={{ background: '#0d1f3c', border: `1px solid ${selectedDept.color}`, borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: selectedDept.color, flexShrink: 0 }} />
                  <span style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>{selectedDept.name}</span>
                  <span style={{ background: selectedDept.color + '30', border: `1px solid ${selectedDept.color}`, borderRadius: '4px', color: selectedDept.color, padding: '2px 8px', fontSize: '14px' }}>{selectedDept.type}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', fontSize: '14px' }}>
                  {[['Abbreviation', selectedDept.abbreviation || selectedDept.short],['Badge Prefix', selectedDept.badgePrefix],['Radio Channel', selectedDept.radioChannel],['Active Officers', deptOfficers.filter(o => o.status !== 'OFFDUTY').length + ' / ' + deptOfficers.length]].map(([l,v]) => (
                    <div key={l} style={{ background: '#060d1a', border: '1px solid #1e3060', borderRadius: '4px', padding: '8px 10px' }}>
                      <div style={{ color: '#4a9eff', fontSize: '11px', letterSpacing: '1px', marginBottom: '4px' }}>{l}</div>
                      <div style={{ color: '#e2e8f0' }}>{v || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subdivisions */}
              <div style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: '#e2a84b', fontSize: '14px', fontWeight: 700, letterSpacing: '1px' }}>SUBDIVISIONS</span>
                  <button onClick={() => setShowSubForm(true)} style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>+ Add</button>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(selectedDept.subdivisions || []).map(sub => (
                    <div key={sub} style={{ background: '#060d1a', border: '1px solid #1e3060', borderRadius: '4px', padding: '6px 12px', fontSize: '14px', color: '#94a3b8' }}>
                      {sub}
                      <span style={{ color: '#475569', marginLeft: '8px', fontSize: '11px' }}>
                        ({deptOfficers.filter(o => o.subdivision === sub).length})
                      </span>
                    </div>
                  ))}
                  {(!selectedDept.subdivisions || selectedDept.subdivisions.length === 0) && (
                    <span style={{ color: '#334155', fontSize: '14px' }}>No subdivisions defined</span>
                  )}
                </div>
                {showSubForm && (
                  <form onSubmit={handleAddSub} style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    <input value={subName} onChange={e => setSubName(e.target.value)} placeholder="Subdivision name..." required style={{ ...base, flex: 1, minWidth: '150px' }} />
                    <button type="submit" style={{ background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '7px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>Add</button>
                    <button type="button" onClick={() => setShowSubForm(false)} style={{ background: 'transparent', border: '1px solid #1e3060', borderRadius: '4px', color: '#64748b', padding: '7px 10px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>Cancel</button>
                  </form>
                )}
              </div>

              {/* Rank structure */}
              <div style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ color: '#e2a84b', fontSize: '14px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px' }}>RANK STRUCTURE</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(RANKS[selectedDept.type] || RANKS.LEO).map((rank, i) => (
                    <div key={rank} style={{ background: '#060d1a', border: '1px solid #1e3060', borderRadius: '4px', padding: '5px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#4a9eff', fontSize: '11px' }}>{i + 1}.</span>
                      <span style={{ color: '#94a3b8' }}>{rank}</span>
                      <span style={{ color: '#475569', fontSize: '11px' }}>({deptOfficers.filter(o => o.rank === rank).length})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roster */}
              <div style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '6px', padding: '16px' }}>
                <div style={{ color: '#e2a84b', fontSize: '14px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px' }}>DEPARTMENT ROSTER ({deptOfficers.length})</div>
                <div className="table-scroll">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#0a1a35' }}>
                      {['Name','Badge','Rank','Subdivision','Status'].map(h => (
                        <th key={h} style={{ padding: '7px 10px', textAlign: 'left', color: '#7a9ab8', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #1e4080' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {deptOfficers.map((o, i) => (
                      <tr key={o.id} style={{ background: i % 2 === 0 ? '#080f1e' : '#0a1525' }}>
                        <td style={{ padding: '7px 10px', color: '#e2e8f0' }}>{o.name}</td>
                        <td style={{ padding: '7px 10px', color: '#60a5fa', fontWeight: 700 }}>{o.badge}</td>
                        <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{o.rank}</td>
                        <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{o.subdivision}</td>
                        <td style={{ padding: '7px 10px' }}><StatusBadge status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                {deptOfficers.length === 0 && <div style={{ color: '#334155', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No officers in this department.</div>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Department Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <form onSubmit={handleAddDept} style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '8px', padding: '24px', maxWidth: '500px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#4a9eff', fontWeight: 700, fontSize: '16px', fontFamily: 'Ubuntu Mono, monospace' }}>CREATE DEPARTMENT</span>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[['Full Name *','name'],['Short Name *','short'],['Abbreviation','abbreviation'],['Badge Prefix','badgePrefix'],['Radio Channel','radioChannel']].map(([l,k]) => (
                <div key={k} style={k === 'name' ? { gridColumn: '1/-1' } : {}}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '4px' }}>{l}</label>
                  <input value={deptForm[k]} onChange={e => setDeptForm(f => ({ ...f, [k]: e.target.value }))} required={l.includes('*')} style={base} />
                </div>
              ))}
              <div>
                <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '4px' }}>TYPE</label>
                <select value={deptForm.type} onChange={e => setDeptForm(f => ({ ...f, type: e.target.value }))} style={base}>
                  {DEPT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '4px' }}>COLOR</label>
                <input type="color" value={deptForm.color} onChange={e => setDeptForm(f => ({ ...f, color: e.target.value }))} style={{ ...base, height: '38px', padding: '4px' }} />
              </div>
            </div>
            <button type="submit" style={{ width: '100%', background: '#1e4080', border: '1px solid #4a9eff', borderRadius: '4px', color: '#4a9eff', padding: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Ubuntu Mono, monospace' }}>
              CREATE DEPARTMENT
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
