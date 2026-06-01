import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { RANKS } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import { useResponsive } from '../hooks/useResponsive';

const DEPT_TYPES = ['LEO','Fire','EMS','Dispatch','Civilian'];

const INPUT_CLS = 'w-full bg-app-input border border-border-base text-cad-text px-2.5 py-1.5 text-sm box-border';
const BLUE_BTN  = 'bg-sky-950 border border-sky-700 text-sky-400 px-3.5 py-1.5 text-xs cursor-pointer font-bold';
const GHOST_BTN = 'bg-transparent border border-border-base text-slate-600 px-2.5 py-1.5 text-xs cursor-pointer';

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
    <div className="p-3.5">
      {/* Mobile: dropdown selector */}
      {isMobile && (
        <div className="mb-3">
          <div className="flex gap-2 items-center mb-2">
            <span className="text-amber-400 text-xs font-bold tracking-[1.5px]">DEPARTMENTS</span>
            <button onClick={() => setShowForm(true)} className={`${BLUE_BTN} ml-auto`}>+ New</button>
          </div>
          <select
            value={selectedDept?.id || ''}
            onChange={e => setSelectedDept(departments.find(d => d.id === Number(e.target.value)))}
            className={INPUT_CLS}
          >
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.short} — {dept.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-3.5" style={{ minHeight: isMobile ? 'auto' : 'calc(100vh - 80px)' }}>
        {/* Desktop: sidebar list */}
        {!isMobile && (
          <div className="w-[250px] shrink-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-amber-400 text-xs font-bold tracking-[1.5px]">DEPARTMENTS</span>
              <button onClick={() => setShowForm(true)} className={BLUE_BTN}>+ New</button>
            </div>
            {departments.map(dept => (
              <div
                key={dept.id}
                onClick={() => setSelectedDept(dept)}
                className="px-3 py-2.5 cursor-pointer mb-1 transition-colors"
                style={{
                  background: selectedDept?.id === dept.id ? '#0f172a' : '#090b10',
                  border: `1px solid ${selectedDept?.id === dept.id ? dept.color : '#1e2533'}`,
                  borderLeft: `3px solid ${dept.color}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 text-sm font-bold">{dept.short}</span>
                  <span className="text-slate-600 text-[10px]">[{dept.type}]</span>
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">{dept.name}</div>
                <div className="text-slate-700 text-[10px] mt-px">
                  {officers.filter(o => o.dept === dept.id).length} officers
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Department detail */}
        <div className="flex-1 min-w-0">
          {selectedDept && (
            <>
              {/* Dept header */}
              <div
                className="bg-app-card p-3.5 mb-3"
                style={{ border: `1px solid ${selectedDept.color}50`, borderLeft: `3px solid ${selectedDept.color}` }}
              >
                <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                  <span className="text-slate-50 text-base font-bold">{selectedDept.name}</span>
                  <span
                    className="px-2 py-0.5 text-[11px] font-bold"
                    style={{ background: selectedDept.color + '25', border: `1px solid ${selectedDept.color}60`, color: selectedDept.color }}
                  >
                    {selectedDept.type}
                  </span>
                </div>
                <div
                  className="grid gap-2 text-sm"
                  style={{ gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)' }}
                >
                  {[['Abbreviation', selectedDept.abbreviation || selectedDept.short],['Badge Prefix', selectedDept.badgePrefix],['Radio Channel', selectedDept.radioChannel],['Active Officers', deptOfficers.filter(o => o.status !== 'OFFDUTY').length + ' / ' + deptOfficers.length]].map(([l,v]) => (
                    <div key={l} className="bg-app-input border border-border-base px-2.5 py-2">
                      <div className="text-sky-400 text-[10px] tracking-widest mb-0.5">{l.toUpperCase()}</div>
                      <div className="text-slate-300">{v || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subdivisions */}
              <div className="bg-app-card border border-border-subtle p-3.5 mb-2.5">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-amber-400 text-[11px] font-bold tracking-[1.5px]">SUBDIVISIONS</span>
                  <button onClick={() => setShowSubForm(true)} className={BLUE_BTN}>+ Add</button>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {(selectedDept.subdivisions || []).map(sub => (
                    <div key={sub} className="bg-app-input border border-border-base px-3 py-1 text-xs text-slate-400">
                      {sub}
                      <span className="text-slate-700 ml-2 text-[10px]">
                        ({deptOfficers.filter(o => o.subdivision === sub).length})
                      </span>
                    </div>
                  ))}
                  {(!selectedDept.subdivisions || selectedDept.subdivisions.length === 0) && (
                    <span className="text-slate-700 text-sm">No subdivisions defined</span>
                  )}
                </div>
                {showSubForm && (
                  <form onSubmit={handleAddSub} className="flex gap-2 mt-2.5 flex-wrap">
                    <input value={subName} onChange={e => setSubName(e.target.value)} placeholder="Subdivision name..." required className={`${INPUT_CLS} flex-1 min-w-[150px]`} />
                    <button type="submit" className={BLUE_BTN}>Add</button>
                    <button type="button" onClick={() => setShowSubForm(false)} className={GHOST_BTN}>Cancel</button>
                  </form>
                )}
              </div>

              {/* Rank structure */}
              <div className="bg-app-card border border-border-subtle p-3.5 mb-2.5">
                <div className="text-amber-400 text-[11px] font-bold tracking-[1.5px] mb-2.5">RANK STRUCTURE</div>
                <div className="flex gap-1.5 flex-wrap">
                  {(RANKS[selectedDept.type] || RANKS.LEO).map((rank, i) => (
                    <div key={rank} className="bg-app-input border border-border-base px-2.5 py-1 text-[11px] flex items-center gap-1">
                      <span className="text-sky-400 text-[10px]">{i + 1}.</span>
                      <span className="text-slate-400">{rank}</span>
                      <span className="text-slate-700 text-[10px]">({deptOfficers.filter(o => o.rank === rank).length})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roster */}
              <div className="bg-app-card border border-border-subtle p-3.5">
                <div className="text-amber-400 text-[11px] font-bold tracking-[1.5px] mb-2.5">DEPARTMENT ROSTER ({deptOfficers.length})</div>
                <div className="table-scroll">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-app-input">
                        {['Name','Badge','Rank','Subdivision','Status'].map(h => (
                          <th key={h} className="px-2.5 py-1.5 text-left text-slate-500 text-[11px] font-bold tracking-wide border-b border-border-subtle whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {deptOfficers.map((o, i) => (
                        <tr key={o.id} className={i % 2 === 0 ? 'bg-app-card' : 'bg-[#111218]'}>
                          <td className="px-2.5 py-1.5 text-slate-300">{o.name}</td>
                          <td className="px-2.5 py-1.5 text-sky-400 font-bold">{o.badge}</td>
                          <td className="px-2.5 py-1.5 text-slate-400">{o.rank}</td>
                          <td className="px-2.5 py-1.5 text-slate-400">{o.subdivision}</td>
                          <td className="px-2.5 py-1.5"><StatusBadge status={o.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {deptOfficers.length === 0 && <div className="text-slate-700 text-sm text-center py-4">No officers in this department.</div>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Department Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/75 z-[2000] flex items-center justify-center p-4">
          <form onSubmit={handleAddDept} className="bg-app-card border border-border-subtle p-5 max-w-[500px] w-full">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sky-400 font-bold text-sm tracking-[1.5px]">CREATE DEPARTMENT</span>
              <button type="button" onClick={() => setShowForm(false)} className="bg-transparent border-none text-slate-600 cursor-pointer text-base">X</button>
            </div>
            <div
              className="grid gap-2.5 mb-3.5"
              style={{ gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}
            >
              {[['Full Name *','name'],['Short Name *','short'],['Abbreviation','abbreviation'],['Badge Prefix','badgePrefix'],['Radio Channel','radioChannel']].map(([l,k]) => (
                <div key={k} style={k === 'name' ? { gridColumn: '1/-1' } : {}}>
                  <label className="text-slate-500 text-[11px] tracking-widest block mb-1">{l}</label>
                  <input value={deptForm[k]} onChange={e => setDeptForm(f => ({ ...f, [k]: e.target.value }))} required={l.includes('*')} className={INPUT_CLS} />
                </div>
              ))}
              <div>
                <label className="text-slate-500 text-[11px] tracking-widest block mb-1">TYPE</label>
                <select value={deptForm.type} onChange={e => setDeptForm(f => ({ ...f, type: e.target.value }))} className={INPUT_CLS}>
                  {DEPT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-500 text-[11px] tracking-widest block mb-1">COLOR</label>
                <input type="color" value={deptForm.color} onChange={e => setDeptForm(f => ({ ...f, color: e.target.value }))} className={`${INPUT_CLS} h-9 py-1`} />
              </div>
            </div>
            <button type="submit" className={`${BLUE_BTN} w-full py-2.5 text-sm tracking-widest`}>
              CREATE DEPARTMENT
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
