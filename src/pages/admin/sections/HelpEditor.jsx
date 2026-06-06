import { useState, useCallback } from 'react';
import Select from '../../../components/ui/Select';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import { useTabParam } from '../../../hooks/useTabParam';
import { HELP_ICON_MAP, PORTAL_COLOR } from '../../portal/HelpCenter';
import { DEFAULT_HELP_CONTENT } from '../../../data/helpDefaults';
import {
  MdPerson, MdStore, MdSupervisorAccount, MdShield,
  MdAdd, MdDelete, MdDragIndicator, MdSave, MdUndo,
  MdExpandMore, MdExpandLess, MdHelpOutline,
  MdLocalPolice, MdLocalFireDepartment,
} from 'react-icons/md';

const PORTAL_TABS = [
  { id: 'civilian',   label: 'Civilian',        icon: MdPerson              },
  { id: 'business',   label: 'Business',        icon: MdStore               },
  { id: 'leo',        label: 'Law Enforcement', icon: MdLocalPolice         },
  { id: 'fire',       label: 'Fire / EMS',      icon: MdLocalFireDepartment },
  { id: 'supervisor', label: 'Supervisor',      icon: MdSupervisorAccount   },
  { id: 'command',    label: 'Command',         icon: MdShield              },
];

const ICON_OPTIONS = Object.keys(HELP_ICON_MAP).filter(k => k !== 'MdStoreMini');

const uid = () => `h_${Math.random().toString(36).slice(2, 8)}`;

/* ── Inline input styles ─────────────────────────────────── */
const INP = 'w-full bg-app-input border border-border-base rounded-lg px-3 py-2 text-sm text-cad-text placeholder:text-slate-600 outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/20 transition-all';
const LBL = 'block text-[10px] font-bold tracking-[0.5px] uppercase text-slate-500 mb-1';

/* ── Per-section editor ──────────────────────────────────── */
function SectionEditor({ sec, color, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [open, setOpen] = useState(true);
  const Icon = HELP_ICON_MAP[sec.iconKey] || MdHelpOutline;

  const setField = (key, val) => onChange({ ...sec, [key]: val });

  const setBullet = (id, text) =>
    onChange({ ...sec, bullets: sec.bullets.map(b => b.id === id ? { ...b, text } : b) });

  const addBullet = () =>
    onChange({ ...sec, bullets: [...sec.bullets, { id: uid(), text: '' }] });

  const removeBullet = (id) =>
    onChange({ ...sec, bullets: sec.bullets.filter(b => b.id !== id) });

  const moveBullet = (idx, dir) => {
    const arr = [...sec.bullets];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    onChange({ ...sec, bullets: arr });
  };

  return (
    <div className="rounded-xl border border-border-base bg-app-card/60 overflow-hidden"
      style={{ borderLeft: `3px solid ${color}` }}>
      {/* Section header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-app-panel/50 border-b border-border-faint">
        <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
          <Icon size={14} style={{ color }} />
        </div>
        <span className="flex-1 text-[13px] font-bold text-slate-200 truncate">{sec.title || 'Untitled Section'}</span>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onMoveUp()} disabled={isFirst}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-slate-200 disabled:opacity-25 transition-colors cursor-pointer"
            style={{ background: 'transparent', border: 'none', fontSize: 11, fontWeight: 700 }}>▲</button>
          <button onClick={() => onMoveDown()} disabled={isLast}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-slate-200 disabled:opacity-25 transition-colors cursor-pointer"
            style={{ background: 'transparent', border: 'none', fontSize: 11, fontWeight: 700 }}>▼</button>
          <button onClick={() => setOpen(o => !o)}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
            style={{ background: 'transparent', border: 'none' }}>
            {open ? <MdExpandLess size={16} /> : <MdExpandMore size={16} />}
          </button>
          <button onClick={onDelete}
            className="w-6 h-6 flex items-center justify-center rounded text-red-500/60 hover:text-red-400 transition-colors cursor-pointer"
            style={{ background: 'transparent', border: 'none' }}>
            <MdDelete size={14} />
          </button>
        </div>
      </div>

      {open && (
        <div className="p-4 flex flex-col gap-4">
          {/* Title + Icon row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={LBL}>Section Title</label>
              <input className={INP} value={sec.title} onChange={e => setField('title', e.target.value)} placeholder="e.g. My Vehicles" />
            </div>
            <div>
              <label className={LBL}>Icon</label>
              <Select className={INP} value={sec.iconKey} onChange={e => setField('iconKey', e.target.value)}
                style={{ transform: 'translateZ(0)' }}>
                {ICON_OPTIONS.map(k => <option key={k} value={k}>{k.replace('Md', '')}</option>)}
              </Select>
            </div>
          </div>

          {/* Tip */}
          <div>
            <label className={LBL}>Tip / Subtitle <span className="normal-case font-normal text-slate-600">(optional)</span></label>
            <input className={INP} value={sec.tip || ''} onChange={e => setField('tip', e.target.value)} placeholder="Shown as a muted callout above the bullets" />
          </div>

          {/* Bullets */}
          <div>
            <label className={LBL}>Bullet Points</label>
            <div className="flex flex-col gap-2">
              {sec.bullets.map((b, idx) => (
                <div key={b.id} className="flex items-center gap-2">
                  <MdDragIndicator size={14} className="text-slate-600 shrink-0" />
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => moveBullet(idx, -1)} disabled={idx === 0}
                      className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-slate-300 disabled:opacity-25 cursor-pointer"
                      style={{ background: 'transparent', border: 'none', fontSize: 10, fontWeight: 700 }}>▲</button>
                    <button onClick={() => moveBullet(idx, 1)} disabled={idx === sec.bullets.length - 1}
                      className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-slate-300 disabled:opacity-25 cursor-pointer"
                      style={{ background: 'transparent', border: 'none', fontSize: 10, fontWeight: 700 }}>▼</button>
                  </div>
                  <input className={`${INP} flex-1`} value={b.text}
                    onChange={e => setBullet(b.id, e.target.value)}
                    placeholder={`Bullet ${idx + 1}`} />
                  <button onClick={() => removeBullet(b.id)}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-red-500/60 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    style={{ background: 'transparent', border: 'none' }}>
                    <MdDelete size={14} />
                  </button>
                </div>
              ))}
              <button onClick={addBullet}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-border-base text-[12px] text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors cursor-pointer w-fit"
                style={{ background: 'transparent' }}>
                <MdAdd size={14} /> Add Bullet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function HelpEditor() {
  const { state, dispatch } = useCAD();
  const toast = useToast();

  const stored = state.helpContent || {};
  const [activePortal, setActivePortal] = useTabParam('tab', 'civilian');
  // Working copy * keyed by portal id
  const [drafts, setDrafts] = useState({});

  const color = PORTAL_COLOR[activePortal];

  const baseSections = stored[activePortal] || DEFAULT_HELP_CONTENT[activePortal] || [];
  const sections = drafts[activePortal] ?? baseSections;
  const isDirty = drafts[activePortal] !== undefined;

  const setSections = useCallback((next) => {
    setDrafts(d => ({ ...d, [activePortal]: next }));
  }, [activePortal]);

  const updateSection = (idx, updated) => {
    const arr = [...sections];
    arr[idx] = updated;
    setSections(arr);
  };

  const deleteSection = (idx) => setSections(sections.filter((_, i) => i !== idx));

  const moveSection = (idx, dir) => {
    const arr = [...sections];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    setSections(arr);
  };

  const addSection = () => {
    setSections([...sections, {
      id: uid(),
      iconKey: 'MdCheckCircle',
      title: 'New Section',
      tip: '',
      bullets: [{ id: uid(), text: '' }],
    }]);
  };

  const handleSave = () => {
    dispatch({ type: 'SET_HELP_CONTENT', payload: { [activePortal]: sections } });
    setDrafts(d => { const n = { ...d }; delete n[activePortal]; return n; });
    toast.success(`Help content saved for ${activePortal} portal.`, { title: 'Saved' });
  };

  const handleReset = () => {
    setDrafts(d => { const n = { ...d }; delete n[activePortal]; return n; });
    dispatch({ type: 'SET_HELP_CONTENT', payload: { [activePortal]: DEFAULT_HELP_CONTENT[activePortal] } });
    toast.info(`Reset to defaults for ${activePortal} portal.`, { title: 'Reset' });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden font-ui">
      {/* Top bar */}
      <div className="shrink-0 flex flex-wrap items-center gap-3 px-5 py-3.5 bg-app-toolbar/80 border-b border-border-base backdrop-blur-md">
        <MdHelpOutline size={18} className="text-brand-bright shrink-0" />
        <span className="text-[13px] font-bold text-white tracking-[0.3px]">Help Center Editor</span>
        <span className="text-[11px] text-slate-500">Edit what players see on the /portal/help page for each portal.</span>
        {isDirty && (
          <span className="ml-auto flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Unsaved changes
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-5">
        {/* Portal tabs */}
        <div className="flex gap-1.5 flex-wrap mb-6 p-1 rounded-xl bg-app-panel/60 border border-border-base backdrop-blur-sm w-fit">
          {PORTAL_TABS.map(t => {
            const on = t.id === activePortal;
            const tc = PORTAL_COLOR[t.id];
            const dirty = drafts[t.id] !== undefined;
            return (
              <button key={t.id} onClick={() => setActivePortal(t.id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-bold cursor-pointer transition-all border relative"
                style={on
                  ? { background: `${tc}20`, borderColor: `${tc}50`, color: tc }
                  : { background: 'transparent', borderColor: 'transparent', color: '#64748b' }
                }
              >
                <t.icon size={15} />
                {t.label}
                {dirty && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </button>
            );
          })}
        </div>

        {/* Section count + actions */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[12px] text-slate-500">{sections.length} section{sections.length !== 1 ? 's' : ''}</span>
          <div className="ml-auto flex gap-2">
            <button onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-base bg-white/[0.03] text-[12px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
              style={{ background: 'transparent' }}>
              <MdUndo size={14} /> Reset to Default
            </button>
            <button onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-bold cursor-pointer transition-colors"
              style={{ background: color, color: '#fff', border: 'none', opacity: isDirty ? 1 : 0.5 }}>
              <MdSave size={15} /> Save Changes
            </button>
          </div>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-3 max-w-[860px]">
          {sections.map((sec, idx) => (
            <SectionEditor
              key={sec.id}
              sec={sec}
              color={color}
              onChange={(updated) => updateSection(idx, updated)}
              onDelete={() => deleteSection(idx)}
              onMoveUp={() => moveSection(idx, -1)}
              onMoveDown={() => moveSection(idx, 1)}
              isFirst={idx === 0}
              isLast={idx === sections.length - 1}
            />
          ))}
          <button onClick={addSection}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border-base text-[13px] text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors cursor-pointer"
            style={{ background: 'transparent' }}>
            <MdAdd size={16} /> Add Section
          </button>
        </div>
      </div>
    </div>
  );
}
