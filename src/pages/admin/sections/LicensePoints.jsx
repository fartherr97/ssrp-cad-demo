import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import {
  ADMIN, AdminPageTitle, AdminPanel, SonButton, SonField, SON_INPUT,
  SonTable, SonRow, SonCell, SonBadge, SonIconBtn, EmptyState,
} from '../AdminKit';
import {
  MdGavel, MdAdd, MdDelete, MdRestartAlt, MdLockOpen, MdSave, MdBolt,
  MdSearch, MdClose,
} from 'react-icons/md';

const blank = (cfg) => JSON.parse(JSON.stringify(cfg));

function Toggle({ on, onClick, label, hint }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-3 w-full text-left cursor-pointer bg-transparent border-none p-0">
      <span className={`relative w-10 h-[22px] rounded-full transition-colors shrink-0 ${on ? 'bg-blue-600' : 'bg-white/10'}`}>
        <span className={`absolute top-[3px] w-4 h-4 rounded-full bg-white transition-all ${on ? 'left-[21px]' : 'left-[3px]'}`} />
      </span>
      <span>
        <span className="block text-[13px] font-semibold text-cad-text">{label}</span>
        {hint && <span className="block text-[11px] text-slate-500">{hint}</span>}
      </span>
    </button>
  );
}

const TYPE_COLOR = { Felony: '#f87171', Misdemeanor: '#fb923c', Infraction: '#4ade80' };

function ImportModal({ penalCode, schedule, onImport, onClose }) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selected, setSelected] = useState(new Set());

  const importedIds = new Set(schedule.filter(s => s.penalCodeId).map(s => s.penalCodeId));

  const filtered = penalCode.filter(pc => {
    const textOk = !query || pc.name.toLowerCase().includes(query.toLowerCase()) || pc.code.toLowerCase().includes(query.toLowerCase());
    const typeOk = typeFilter === 'ALL' || pc.type === typeFilter;
    return textOk && typeOk;
  });

  const toggle = (id) => {
    if (importedIds.has(id)) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleImport = () => {
    const toAdd = penalCode
      .filter(pc => selected.has(pc.id))
      .map(pc => ({
        id: `pc_${pc.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        label: `${pc.code} – ${pc.name}`,
        points: pc.points,
        penalCodeId: pc.id,
      }));
    onImport(toAdd);
  };

  return (
    <div className="anim-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="anim-modal-in flex flex-col bg-app-panel border border-border-base rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh]">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-base shrink-0">
          <MdGavel size={18} className="text-brand-bright" />
          <div>
            <div className="text-[14px] font-bold text-white">Import from Penal Code</div>
            <div className="text-[11px] text-slate-500 mt-px">Select charges to add to the points schedule</div>
          </div>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-200 cursor-pointer bg-transparent border-none p-1">
            <MdClose size={18} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 px-4 py-3 border-b border-border-faint shrink-0">
          <div className="flex-1 min-w-0 flex items-center gap-2 bg-app-input border border-border-base rounded-lg px-3 py-2">
            <MdSearch size={14} className="text-slate-500 shrink-0" />
            <input
              className="flex-1 min-w-0 bg-transparent text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none"
              placeholder="Search code or offense name…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <select
            className="shrink-0 bg-app-input border border-border-base rounded-lg px-2 py-2 text-[12px] text-slate-200 outline-none cursor-pointer"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="Felony">Felony</option>
            <option value="Misdemeanor">Misd.</option>
            <option value="Infraction">Infr.</option>
          </select>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full border-collapse text-[11.5px]">
            <thead className="sticky top-0">
              <tr>
                {['', 'Code', 'Offense', 'Type', 'Pts'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.5px] text-slate-500 bg-app-bg/90 border-b border-border-base whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(pc => {
                const alreadyIn = importedIds.has(pc.id);
                const checked = selected.has(pc.id);
                return (
                  <tr key={pc.id}
                    onClick={() => toggle(pc.id)}
                    className={`border-b border-border-faint transition-colors
                      ${alreadyIn ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-white/[0.04]'}
                      ${checked ? 'bg-brand/10' : ''}`}>
                    <td className="px-3 py-2.5 w-8">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0
                        ${alreadyIn ? 'border-slate-700 bg-transparent' :
                          checked ? 'border-brand bg-brand' : 'border-slate-600 bg-transparent'}`}>
                        {(checked || alreadyIn) && (
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.5 6L8 1" stroke={alreadyIn ? '#4a5568' : 'white'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-400 whitespace-nowrap">{pc.code}</td>
                    <td className="px-3 py-2.5 text-slate-200 font-medium">
                      {pc.name}
                      {alreadyIn && <span className="ml-2 text-[10px] text-slate-600">(already added)</span>}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border"
                        style={{ color: TYPE_COLOR[pc.type] || '#94a3b8', borderColor: (TYPE_COLOR[pc.type] || '#94a3b8') + '50', background: (TYPE_COLOR[pc.type] || '#94a3b8') + '18' }}>
                        {pc.type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold"
                      style={{ color: pc.points >= 7 ? '#f87171' : pc.points >= 4 ? '#fb923c' : pc.points > 0 ? '#fbbf24' : '#4b5563' }}>
                      {pc.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-10 text-center text-[12px] text-slate-600">No charges match your search.</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border-base bg-app-bg/60 shrink-0">
          <span className="text-[11.5px] text-slate-500">
            {selected.size > 0
              ? <span className="text-brand-bright font-bold">{selected.size} selected</span>
              : 'Click rows to select charges'}
          </span>
          <div className="flex gap-2">
            <SonButton variant="ghost" onClick={onClose}>Cancel</SonButton>
            <SonButton variant="green" onClick={handleImport} disabled={selected.size === 0}>
              <MdAdd size={15} /> Import {selected.size > 0 ? `(${selected.size})` : ''}
            </SonButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LicensePoints() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const stored = state.licensePointsConfig;
  const penalCode = state.penalCode || [];
  const [cfg, setCfg] = useState(() => blank(stored));
  const [selViolation, setSelViolation] = useState({});
  const [showImport, setShowImport] = useState(false);

  const dirty = JSON.stringify(cfg) !== JSON.stringify(stored);
  const save = () => { dispatch({ type: 'ADMIN_SET', payload: { key: 'licensePointsConfig', value: cfg } }); toast.success('License points config saved.'); };

  const setField = (k, v) => setCfg(p => ({ ...p, [k]: v }));
  const setSched = (id, patch) => setCfg(p => ({ ...p, schedule: p.schedule.map(s => s.id === id ? { ...s, ...patch } : s) }));
  const delSched = (id) => setCfg(p => ({ ...p, schedule: p.schedule.filter(s => s.id !== id) }));

  const handleImport = (entries) => {
    setCfg(p => ({ ...p, schedule: [...p.schedule, ...entries] }));
    setShowImport(false);
  };

  const drivers = (state.civilians || []).filter(c => c.dlNumber);
  const threshold = stored.threshold || 0;

  const applyPoints = (civ) => {
    const vId = selViolation[civ.id] || stored.schedule[0]?.id;
    const v = stored.schedule.find(s => s.id === vId);
    if (!v) return;
    dispatch({ type: 'ADD_LICENSE_POINTS', payload: { civilianId: civ.id, points: v.points, reason: v.label } });
    toast.success(`+${v.points} points applied.`);
  };

  const statusColor = (s) => s === 'SUSPENDED' ? '#f87171' : s === 'ACTIVE' ? '#22c55e' : ADMIN.textMute;

  return (
    <>
      {showImport && (
        <ImportModal
          penalCode={penalCode}
          schedule={cfg.schedule}
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}

      <AdminPageTitle right={
        <SonButton variant="red" onClick={save} disabled={!dirty}>
          <MdSave size={16} /> {dirty ? 'Save Changes' : 'Saved'}
        </SonButton>
      }>
        <span className="inline-flex items-center gap-2"><MdGavel size={20} className="text-brand-bright" /> Auto License Suspend</span>
      </AdminPageTitle>

      {/* ── Rules ── */}
      <AdminPanel title="Suspension Rules" subtitle="Points accumulate as violations are applied; once a driver reaches the threshold their license is automatically suspended.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-4">
            <Toggle on={cfg.enabled} onClick={() => setField('enabled', !cfg.enabled)}
              label="Enable auto-suspension" hint="Master switch for the points engine" />
            <Toggle on={cfg.resetAfterSuspend} onClick={() => setField('resetAfterSuspend', !cfg.resetAfterSuspend)}
              label="Reset points after suspension" hint="Zero the driver's points once a suspension triggers" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SonField label="Point Threshold">
              <input type="number" min="1" style={SON_INPUT} value={cfg.threshold}
                onChange={e => setField('threshold', Number(e.target.value))} />
            </SonField>
            <SonField label="Suspension (days)">
              <input type="number" min="1" style={SON_INPUT} value={cfg.suspensionDays}
                onChange={e => setField('suspensionDays', Number(e.target.value))} />
            </SonField>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-[12px] text-slate-400 bg-app-card/60 border border-border-base rounded-lg px-3.5 py-2.5">
          <MdBolt size={15} className="text-brand-bright shrink-0" />
          {cfg.enabled
            ? <span>At <b className="text-cad-text">{cfg.threshold}</b> points a driver is auto-suspended for <b className="text-cad-text">{cfg.suspensionDays}</b> days{cfg.resetAfterSuspend ? ', then points reset to 0' : ''}.</span>
            : <span>Auto-suspension is currently <b className="text-red-400">disabled</b> * points still accumulate but no suspension triggers.</span>}
        </div>
      </AdminPanel>

      {/* ── Points schedule ── */}
      <AdminPanel
        title="Points Schedule"
        subtitle="Point value applied per violation type. Import charges directly from the penal code * edit points there if changes are needed."
        right={
          <SonButton size="sm" onClick={() => setShowImport(true)}><MdGavel size={14} /> Import from Penal Code</SonButton>
        }
      >
        <SonTable columns={[
          { label: 'Violation / Code' },
          { label: 'Points', align: 'center', width: 120 },
          { label: '', align: 'right', width: 60 },
        ]}>
          {cfg.schedule.map((s, i) => (
            <SonRow key={s.id} i={i}>
              <SonCell>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded border border-brand/40 text-brand-bright bg-brand/10 uppercase tracking-[0.3px]">
                    PC
                  </span>
                  <span style={{ fontSize: 13, color: ADMIN.text }}>{s.label}</span>
                </div>
              </SonCell>
              <SonCell align="center">
                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.points >= 7 ? '#f87171' : s.points >= 4 ? '#fb923c' : s.points > 0 ? '#fbbf24' : ADMIN.textMute }}>
                  {s.points}
                </span>
              </SonCell>
              <SonCell align="right"><SonIconBtn icon={MdDelete} danger title="Remove" onClick={() => delSched(s.id)} /></SonCell>
            </SonRow>
          ))}
        </SonTable>
        {cfg.schedule.length === 0 && <EmptyState>No violations configured. Use "Import from Penal Code" to add charges.</EmptyState>}
        {dirty && <div className="mt-3 text-[11px] text-amber-400">Unsaved changes * click "Save Changes" to apply.</div>}
      </AdminPanel>

      {/* ── Drivers ── */}
      <AdminPanel title="Driver License Points" subtitle={`Live points per licensed driver · suspends at ${threshold} pts`}>
        {drivers.length === 0 ? <EmptyState>No licensed drivers on file.</EmptyState> : (
          <SonTable columns={[
            { label: 'Driver' }, { label: 'DL #' }, { label: 'Status', align: 'center' },
            { label: 'Points', width: 200 }, { label: 'Apply Violation', align: 'right' },
          ]}>
            {drivers.map((c, i) => {
              const pts = c.licensePoints || 0;
              const pct = Math.min(100, Math.round((pts / (threshold || 1)) * 100));
              const near = pct >= 75;
              const barColor = c.dlStatus === 'SUSPENDED' ? '#f87171' : near ? '#f59e0b' : '#3d82f0';
              return (
                <SonRow key={c.id} i={i}>
                  <SonCell bold>{c.firstName} {c.lastName}</SonCell>
                  <SonCell mono color={ADMIN.textDim}>{c.dlNumber}</SonCell>
                  <SonCell align="center"><SonBadge color={statusColor(c.dlStatus)}>{c.dlStatus || 'ACTIVE'}</SonBadge></SonCell>
                  <SonCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden min-w-[80px]">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                      </div>
                      <span className="text-[12px] font-mono shrink-0" style={{ color: near ? '#f59e0b' : ADMIN.textDim }}>
                        {pts}/{threshold}
                      </span>
                    </div>
                  </SonCell>
                  <SonCell align="right">
                    <div className="inline-flex items-center gap-1.5 justify-end flex-wrap">
                      <select style={{ ...SON_INPUT, padding: '6px 10px', width: 170 }}
                        value={selViolation[c.id] || stored.schedule[0]?.id || ''}
                        onChange={e => setSelViolation(p => ({ ...p, [c.id]: e.target.value }))}>
                        {stored.schedule.map(v => <option key={v.id} value={v.id}>{v.label} (+{v.points})</option>)}
                      </select>
                      <SonButton size="sm" onClick={() => applyPoints(c)}><MdAdd size={14} /> Add</SonButton>
                      <SonIconBtn icon={MdRestartAlt} title="Reset points" onClick={() => { dispatch({ type: 'RESET_LICENSE_POINTS', payload: c.id }); toast.success('Points reset.'); }} />
                      {c.dlStatus === 'SUSPENDED' && (
                        <SonIconBtn icon={MdLockOpen} title="Lift suspension" onClick={() => { dispatch({ type: 'LIFT_SUSPENSION', payload: c.id }); toast.success('Suspension lifted.'); }} />
                      )}
                    </div>
                  </SonCell>
                </SonRow>
              );
            })}
          </SonTable>
        )}
      </AdminPanel>
    </>
  );
}
