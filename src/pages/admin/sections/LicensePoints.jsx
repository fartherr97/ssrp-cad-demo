import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import {
  ADMIN, AdminPageTitle, AdminPanel, SonButton, SonField, SON_INPUT,
  SonTable, SonRow, SonCell, SonBadge, SonIconBtn, EmptyState,
} from '../AdminKit';
import {
  MdGavel, MdAdd, MdDelete, MdRestartAlt, MdLockOpen, MdSave, MdBolt,
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

export default function LicensePoints() {
  const { state, dispatch } = useCAD();
  const stored = state.licensePointsConfig;
  const [cfg, setCfg] = useState(() => blank(stored));
  const [selViolation, setSelViolation] = useState({}); // civId -> violationId

  const dirty = JSON.stringify(cfg) !== JSON.stringify(stored);
  const save = () => dispatch({ type: 'ADMIN_SET', payload: { key: 'licensePointsConfig', value: cfg } });

  const setField = (k, v) => setCfg(p => ({ ...p, [k]: v }));
  const setSched = (id, patch) => setCfg(p => ({ ...p, schedule: p.schedule.map(s => s.id === id ? { ...s, ...patch } : s) }));
  const addSched = () => setCfg(p => ({ ...p, schedule: [...p.schedule, { id: `v${Date.now()}`, label: 'New Violation', points: 1 }] }));
  const delSched = (id) => setCfg(p => ({ ...p, schedule: p.schedule.filter(s => s.id !== id) }));

  // Drivers = civilians who hold a DL
  const drivers = (state.civilians || []).filter(c => c.dlNumber);
  const threshold = stored.threshold || 0;

  const applyPoints = (civ) => {
    const vId = selViolation[civ.id] || stored.schedule[0]?.id;
    const v = stored.schedule.find(s => s.id === vId);
    if (!v) return;
    dispatch({ type: 'ADD_LICENSE_POINTS', payload: { civilianId: civ.id, points: v.points, reason: v.label } });
  };

  const statusColor = (s) => s === 'SUSPENDED' ? '#f87171' : s === 'ACTIVE' ? '#22c55e' : ADMIN.textMute;

  return (
    <>
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
            : <span>Auto-suspension is currently <b className="text-red-400">disabled</b> — points still accumulate but no suspension triggers.</span>}
        </div>
      </AdminPanel>

      {/* ── Points schedule ── */}
      <AdminPanel title="Points Schedule" subtitle="Point value applied per violation type."
        right={<SonButton size="sm" onClick={addSched}><MdAdd size={15} /> Add Violation</SonButton>}>
        <SonTable columns={[{ label: 'Violation' }, { label: 'Points', align: 'center', width: 120 }, { label: '', align: 'right', width: 60 }]}>
          {cfg.schedule.map((s, i) => (
            <SonRow key={s.id} i={i}>
              <SonCell>
                <input style={{ ...SON_INPUT, padding: '6px 10px' }} value={s.label}
                  onChange={e => setSched(s.id, { label: e.target.value })} />
              </SonCell>
              <SonCell align="center">
                <input type="number" min="0" style={{ ...SON_INPUT, padding: '6px 10px', width: 80, textAlign: 'center' }}
                  value={s.points} onChange={e => setSched(s.id, { points: Number(e.target.value) })} />
              </SonCell>
              <SonCell align="right"><SonIconBtn icon={MdDelete} danger title="Remove" onClick={() => delSched(s.id)} /></SonCell>
            </SonRow>
          ))}
        </SonTable>
        {cfg.schedule.length === 0 && <EmptyState>No violations configured.</EmptyState>}
        {dirty && <div className="mt-3 text-[11px] text-amber-400">Unsaved changes — click “Save Changes” to apply.</div>}
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
                      <SonIconBtn icon={MdRestartAlt} title="Reset points" onClick={() => dispatch({ type: 'RESET_LICENSE_POINTS', payload: c.id })} />
                      {c.dlStatus === 'SUSPENDED' && (
                        <SonIconBtn icon={MdLockOpen} title="Lift suspension" onClick={() => dispatch({ type: 'LIFT_SUSPENSION', payload: c.id })} />
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
