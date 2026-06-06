import { useState } from 'react';
import Select from '../../../components/ui/Select';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import {
  ADMIN, AdminPageTitle, AdminPanel, SonButton, SON_INPUT,
  SonTable, SonRow, SonCell, SonBadge, SonIconBtn, EmptyState,
} from '../AdminKit';
import {
  MdGavel, MdAdd, MdDelete, MdLockOpen, MdSave, MdBolt,
  MdSearch, MdClose, MdBlock,
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
          <Select
            className="shrink-0 bg-app-input border border-border-base rounded-lg px-2 py-2 text-[12px] text-slate-200 outline-none cursor-pointer"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="Felony">Felony</option>
            <option value="Misdemeanor">Misd.</option>
            <option value="Infraction">Infr.</option>
          </Select>
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
  const [showImport, setShowImport] = useState(false);
  const [driverSearch, setDriverSearch] = useState('');

  const dirty = JSON.stringify(cfg) !== JSON.stringify(stored);
  const save = () => { dispatch({ type: 'ADMIN_SET', payload: { key: 'licensePointsConfig', value: cfg } }); toast.success('License points config saved.'); };

  const setField = (k, v) => setCfg(p => ({ ...p, [k]: v }));
  const delSched = (id) => setCfg(p => ({ ...p, schedule: p.schedule.filter(s => s.id !== id) }));

  // ── Escalating suspension thresholds (tiers) ──
  const tierUid = () => `lt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
  const tierList = [...(cfg.tiers || [])].sort((a, b) => (a.threshold || 0) - (b.threshold || 0));
  const setTier = (id, patch) => setCfg(p => ({ ...p, tiers: (p.tiers || []).map(t => t.id === id ? { ...t, ...patch } : t) }));
  const addTier = () => setCfg(p => ({ ...p, tiers: [...(p.tiers || []), { id: tierUid(), threshold: 0, suspensionDays: 30 }] }));
  const delTier = (id) => setCfg(p => ({ ...p, tiers: (p.tiers || []).filter(t => t.id !== id) }));

  const handleImport = (entries) => {
    setCfg(p => ({ ...p, schedule: [...p.schedule, ...entries] }));
    setShowImport(false);
  };

  const allDrivers = (state.civilians || []).filter(c => c.dlNumber);
  // Bar maxes out at the highest configured threshold.
  const threshold = (stored.tiers && stored.tiers.length)
    ? Math.max(...stored.tiers.map(t => t.threshold || 0))
    : (stored.threshold || 0);
  const drivers = (() => {
    const q = driverSearch.trim().toLowerCase();
    if (!q) return allDrivers;
    return allDrivers.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.dlNumber?.toLowerCase().includes(q) ||
      c.ssn?.includes(q) ||
      c.ownerDiscordId?.includes(q) ||
      c.discordId?.includes(q)
    );
  })();

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
      <AdminPanel title="Suspension Rules" subtitle="Points accumulate as violations are applied; a license is auto-suspended each time the driver's total crosses one of the thresholds below.">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-10">
            <Toggle on={cfg.enabled} onClick={() => setField('enabled', !cfg.enabled)}
              label="Enable auto-suspension" hint="Master switch for the points engine" />
            <Toggle on={cfg.resetAfterSuspend} onClick={() => setField('resetAfterSuspend', !cfg.resetAfterSuspend)}
              label="Reset points after suspension" hint="Only applies with a single threshold; tiers keep accumulating" />
          </div>

          {/* Threshold tiers */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.6px] text-slate-500">Suspension Thresholds</span>
              <SonButton size="sm" onClick={addTier}><MdAdd size={14} /> Add Threshold</SonButton>
            </div>
            {tierList.length === 0 ? (
              <div className="text-[12px] text-slate-500 italic px-1 py-2">No thresholds yet — add one to enable auto-suspension.</div>
            ) : tierList.map((t, i) => (
              <div key={t.id} className="flex items-center gap-2 flex-wrap bg-app-card/60 border border-border-base rounded-lg px-3 py-2">
                <span className="text-[10px] font-bold text-slate-600 w-5 shrink-0">#{i + 1}</span>
                <span className="text-[12px] text-slate-400">At</span>
                <input type="number" min="1" style={{ ...SON_INPUT, width: 76, padding: '6px 8px' }} value={t.threshold}
                  onChange={e => setTier(t.id, { threshold: Number(e.target.value) })} />
                <span className="text-[12px] text-slate-400">pts → suspend</span>
                <input type="number" min="1" style={{ ...SON_INPUT, width: 76, padding: '6px 8px' }} value={t.suspensionDays}
                  onChange={e => setTier(t.id, { suspensionDays: Number(e.target.value) })} />
                <span className="text-[12px] text-slate-400">days</span>
                <button type="button" onClick={() => delTier(t.id)} title="Remove threshold"
                  className="ml-auto shrink-0 flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-colors">
                  <MdClose size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 text-[12px] text-slate-400 bg-app-card/60 border border-border-base rounded-lg px-3.5 py-2.5">
          <MdBolt size={15} className="text-brand-bright shrink-0 mt-0.5" />
          {!cfg.enabled
            ? <span>Auto-suspension is currently <b className="text-red-400">disabled</b> · points still accumulate but no suspension triggers.</span>
            : tierList.length === 0
              ? <span>No thresholds configured — add at least one.</span>
              : <span>A driver is auto-suspended as their points cross each threshold: {tierList.map(t => `${t.threshold} pts → ${t.suspensionDays}d`).join(' · ')}.</span>}
        </div>
      </AdminPanel>

      {/* ── Points schedule ── */}
      <AdminPanel
        title="Points Schedule"
        subtitle="Point value applied per violation type. Import charges directly from the penal code · edit points there if changes are needed."
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
        {dirty && <div className="mt-3 text-[11px] text-amber-400">Unsaved changes · click "Save Changes" to apply.</div>}
      </AdminPanel>

      {/* ── Drivers ── */}
      <AdminPanel
        title="Driver License Points"
        subtitle={`Live points per licensed driver · auto-suspends at the configured thresholds · search to manually suspend or reinstate`}
        right={
          <div className="flex items-center gap-2 bg-app-input border border-border-base rounded-lg px-3 py-2 w-[260px] max-w-full">
            <MdSearch size={14} className="text-slate-500 shrink-0" />
            <input
              className="flex-1 min-w-0 bg-transparent text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none"
              placeholder="Search name, DL #, SSN, or Discord ID…"
              value={driverSearch}
              onChange={e => setDriverSearch(e.target.value)}
            />
            {driverSearch && (
              <button onClick={() => setDriverSearch('')} className="text-slate-500 hover:text-slate-200 cursor-pointer bg-transparent border-none p-0 shrink-0">
                <MdClose size={15} />
              </button>
            )}
          </div>
        }
      >
        {allDrivers.length === 0 ? <EmptyState>No licensed drivers on file.</EmptyState>
          : drivers.length === 0 ? <EmptyState>No drivers match "{driverSearch}".</EmptyState> : (
          <div className="flex flex-col gap-2">
            {drivers.map((c) => {
              const pts = c.licensePoints || 0;
              const pct = Math.min(100, Math.round((pts / (threshold || 1)) * 100));
              const near = pct >= 75;
              const barColor = c.dlStatus === 'SUSPENDED' ? '#f87171' : near ? '#f59e0b' : '#3d82f0';
              const suspended = c.dlStatus === 'SUSPENDED';
              return (
                <div key={c.id} className="rounded-xl border border-border-base bg-app-card/60 p-3 flex flex-col gap-2.5">
                  {/* Identity + status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold text-cad-text truncate">{c.firstName} {c.lastName}</div>
                      <div className="text-[11px] font-mono text-cad-dim">DL {c.dlNumber}</div>
                    </div>
                    <SonBadge color={statusColor(c.dlStatus)}>{c.dlStatus || 'ACTIVE'}</SonBadge>
                  </div>
                  {/* Points bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden min-w-[80px]">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                    <span className="text-[12px] font-mono shrink-0" style={{ color: near ? '#f59e0b' : ADMIN.textDim }}>
                      {pts}/{threshold}
                    </span>
                  </div>
                  {/* Actions — manual suspend / reinstate */}
                  <div className="flex">
                    {suspended ? (
                      <SonButton size="sm" variant="green" onClick={() => { dispatch({ type: 'LIFT_SUSPENSION', payload: c.id }); toast.success(`${c.firstName} ${c.lastName} reinstated.`); }}>
                        <MdLockOpen size={14} /> Reinstate
                      </SonButton>
                    ) : (
                      <SonButton size="sm" variant="red" onClick={() => { dispatch({ type: 'MANUAL_SUSPEND', payload: { civilianId: c.id, reason: 'Manual admin action' } }); toast.success(`${c.firstName} ${c.lastName} suspended.`); }}>
                        <MdBlock size={14} /> Suspend
                      </SonButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AdminPanel>
    </>
  );
}
