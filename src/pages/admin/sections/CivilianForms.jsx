import { useState } from 'react';
import Select from '../../../components/ui/Select';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import { useTabParam } from '../../../hooks/useTabParam';
import {
  MdBadge, MdDirectionsCar, MdPerson, MdLocalHospital,
  MdAdd, MdDelete, MdArrowUpward, MdArrowDownward, MdSave, MdCheckCircle,
  MdStar, MdLock, MdInfoOutline,
} from 'react-icons/md';
import {
  AdminPageTitle, AdminPanel, SonButton, ADMIN,
} from '../AdminKit';
import { CIVILIAN_FIELD_TYPES, CIVILIAN_FORMS_DEFAULT } from '../../../data/civilianFormsDefaults';
import ReportForm from '../../../components/ReportForm';

const uid = () => `cf_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

const TABS = [
  { id: 'driverLicense',       label: 'Driver License',       Icon: MdBadge },
  { id: 'vehicleRegistration', label: 'Vehicle Registration', Icon: MdDirectionsCar },
  { id: 'character',           label: 'Character Profile',    Icon: MdPerson },
  { id: 'medical',             label: 'Medical Records',      Icon: MdLocalHospital },
];

const INPUT = {
  width: '100%', background: '#0d1a2c', border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 7, color: '#dde6f1', padding: '7px 11px', fontSize: 12.5,
  fontFamily: 'var(--font-ui)', boxSizing: 'border-box', outline: 'none',
};

/* ── Reorder/delete icon button ── */
function MiniBtn({ icon: Icon, onClick, title, danger, disabled }) {
  return (
    <button type="button" onClick={onClick} title={title} disabled={disabled}
      className="w-7 h-7 rounded-lg inline-flex items-center justify-center cursor-pointer transition-all border shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
      style={danger
        ? { background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.35)', color: '#f87171' }
        : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: ADMIN.textDim }}>
      <Icon size={14} />
    </button>
  );
}

/* ════════ Classes / Endorsements editor (DL only) ════════ */
function OptionListEditor({ title, hint, items, onChange, accent }) {
  const up = (idx, patch) => onChange(items.map((it, i) => {
    if (i !== idx) return it;
    const merged = { ...it, ...patch };
    if (patch.label !== undefined) merged.value = patch.label; // keep value synced to label
    return merged;
  }));
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
  const move = (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };
  const add = () => onChange([...items, { value: 'New Option', label: 'New Option', desc: '' }]);

  return (
    <div className="rounded-xl overflow-hidden mb-5" style={{ border: `1px solid ${accent}33` }}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: `${accent}12`, borderBottom: `1px solid ${accent}22` }}>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.6px]" style={{ color: accent }}>{title}</div>
          {hint && <div className="text-[10.5px] text-slate-500 mt-0.5 normal-case">{hint}</div>}
        </div>
        <SonButton size="sm" variant="ghost" onClick={add}><MdAdd size={14} /> Add</SonButton>
      </div>
      <div className="p-3 flex flex-col gap-2">
        {items.length === 0 && <div className="text-[11.5px] text-slate-600 italic text-center py-2">None defined.</div>}
        {items.map((it, idx) => (
          <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <input style={INPUT} value={it.label} placeholder="Label (e.g. Class E)"
                onChange={e => up(idx, { label: e.target.value })} />
              <input style={{ ...INPUT, fontSize: 11.5, color: '#93a4bd' }} value={it.desc || ''} placeholder="Description (shown to the civilian)"
                onChange={e => up(idx, { desc: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <div className="flex gap-1">
                <MiniBtn icon={MdArrowUpward} onClick={() => move(idx, -1)} title="Move up" disabled={idx === 0} />
                <MiniBtn icon={MdArrowDownward} onClick={() => move(idx, 1)} title="Move down" disabled={idx === items.length - 1} />
              </div>
              <MiniBtn icon={MdDelete} onClick={() => remove(idx)} title="Remove" danger />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════ Generic field-list builder ════════ */
function FieldListEditor({ fields, onChange, accent, note }) {
  const up = (idx, patch) => onChange(fields.map((f, i) => i === idx ? { ...f, ...patch } : f));
  const remove = (idx) => onChange(fields.filter((_, i) => i !== idx));
  const move = (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= fields.length) return;
    const next = [...fields];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };
  const add = () => onChange([...fields, { key: uid(), label: '', type: 'text' }]);

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}33` }}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: `${accent}12`, borderBottom: `1px solid ${accent}22` }}>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.6px]" style={{ color: accent }}>Fields</div>
          {note && <div className="text-[10.5px] text-slate-500 mt-0.5 normal-case">{note}</div>}
        </div>
        <SonButton size="sm" variant="ghost" onClick={add}><MdAdd size={14} /> Add Field</SonButton>
      </div>
      <div className="p-3 flex flex-col gap-2">
        {fields.length === 0 && <div className="text-[11.5px] text-slate-600 italic text-center py-3">No fields yet — click "Add Field".</div>}
        {fields.map((f, idx) => {
          const isCore = !!f.core;
          return (
            <div key={f.key} className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex flex-wrap items-center gap-2">
                <input style={{ ...INPUT, flex: '1 1 140px', minWidth: 140 }} value={f.label} placeholder="Field label"
                  onChange={e => up(idx, { label: e.target.value })} />
                {isCore ? (
                  <span className="inline-flex items-center justify-center text-[11px] font-bold rounded-lg shrink-0"
                    style={{ width: 120, height: 33, background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd' }}>
                    {f.type === 'age' ? 'Age (auto)' : (CIVILIAN_FIELD_TYPES.find(t => t.type === f.type)?.label || f.type)}
                  </span>
                ) : (
                  <Select style={{ ...INPUT, width: 120 }} value={f.type}
                    onChange={e => up(idx, { type: e.target.value })}>
                    {CIVILIAN_FIELD_TYPES.map(t => <option key={t.type} value={t.type} style={{ background: '#0d1827' }}>{t.label}</option>)}
                  </Select>
                )}
                <button type="button" onClick={() => up(idx, { required: !f.required })}
                  title="Required" disabled={isCore}
                  className="w-7 h-7 rounded-lg inline-flex items-center justify-center cursor-pointer border shrink-0 disabled:opacity-40"
                  style={f.required
                    ? { background: 'rgba(245,158,11,0.18)', borderColor: 'rgba(245,158,11,0.45)', color: '#f59e0b' }
                    : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: ADMIN.textMute }}>
                  <MdStar size={13} />
                </button>
                <div className="flex gap-1 shrink-0">
                  <MiniBtn icon={MdArrowUpward} onClick={() => move(idx, -1)} title="Move up" disabled={idx === 0} />
                  <MiniBtn icon={MdArrowDownward} onClick={() => move(idx, 1)} title="Move down" disabled={idx === fields.length - 1} />
                  {isCore
                    ? <span className="w-7 h-7 rounded-lg inline-flex items-center justify-center border shrink-0" style={{ background: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.3)', color: '#60a5fa' }} title="Core field — cannot be removed"><MdLock size={13} /></span>
                    : <MiniBtn icon={MdDelete} onClick={() => remove(idx)} title="Remove" danger />}
                </div>
              </div>
              {f.type === 'select' && (
                <textarea
                  style={{ ...INPUT, marginTop: 8, minHeight: 54, resize: 'vertical' }}
                  value={(f.options || []).join('\n')}
                  placeholder={'Options (one per line)\nOption 1\nOption 2'}
                  onChange={e => up(idx, { options: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                />
              )}
              {isCore && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 mt-1.5">
                  <MdInfoOutline size={11} /> Core profile field — you can rename it, but type/required are fixed and it can't be deleted.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════ Live preview of the configured fields ════════ */
function FieldsPreview({ fields, accent }) {
  if (!fields?.length) return null;
  const tpl = {
    name: 'Preview',
    sections: [{ id: 'p', title: 'Form Preview', style: 'gray',
      fields: fields.map(f => ({
        id: f.key, label: f.label || '(unlabeled)',
        type: f.type === 'select' ? 'dropdown' : f.type,
        options: f.options, span: f.full ? 4 : 2, required: f.required,
      })),
    }],
  };
  return (
    <div className="rounded-xl overflow-hidden mt-4" style={{ border: `1px solid ${accent}22` }}>
      <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.6px]" style={{ color: accent, background: `${accent}10` }}>Live Preview</div>
      <div className="p-3 bg-app-bg/40">
        <ReportForm template={tpl} data={{}} readOnly />
      </div>
    </div>
  );
}

/* ════════ Main ════════ */
export default function CivilianForms() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const [activeTab, setActiveTab] = useTabParam('tab', 'driverLicense');
  const [saved, setSaved] = useState(false);

  // Deep-clone the stored config into local editable draft
  const [draft, setDraft] = useState(() =>
    JSON.parse(JSON.stringify(state.civilianForms || CIVILIAN_FORMS_DEFAULT))
  );

  const cfg = draft[activeTab];
  const accent = ADMIN.blue;

  const patchTab = (patch) => setDraft(d => ({ ...d, [activeTab]: { ...d[activeTab], ...patch } }));

  const save = () => {
    dispatch({ type: 'UPDATE_CIVILIAN_FORMS', payload: { form: activeTab, config: draft[activeTab] } });
    toast.success(`${TABS.find(t => t.id === activeTab).label} form saved.`, { title: 'Civilian Forms' });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const resetTab = () => {
    const def = JSON.parse(JSON.stringify(CIVILIAN_FORMS_DEFAULT[activeTab]));
    setDraft(d => ({ ...d, [activeTab]: def }));
    toast.info('Reset to defaults — remember to Save.');
  };

  const TAB_NOTE = {
    driverLicense: 'Define the base license classes (single-select), optional endorsements (checkboxes), and any extra application fields.',
    vehicleRegistration: 'Plate, make, model, year, and color are always collected. Add any extra fields civilians should fill in when registering a vehicle.',
    character: 'Fields civilians fill in when creating a character. Core fields are required by the system; add your own below. "Generate with AI" adapts to whatever fields exist here.',
    medical: 'Blood type, organ donor, DNR, conditions, allergies, medications, and emergency contact are always present. Add extra fields to the medical profile here.',
  };

  return (
    <>
      <AdminPageTitle right={
        <div className="flex gap-2">
          <SonButton variant="ghost" size="sm" onClick={resetTab}>Reset Tab</SonButton>
          <SonButton variant="red" onClick={save}>
            {saved ? <><MdCheckCircle size={15} /> Saved</> : <><MdSave size={15} /> Save</>}
          </SonButton>
        </div>
      }>
        Civilian Forms
      </AdminPageTitle>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {TABS.map(t => {
          const on = activeTab === t.id;
          return (
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12.5px] font-bold cursor-pointer border transition-all"
              style={on
                ? { background: `${accent}1e`, borderColor: `${accent}55`, color: ADMIN.redHi }
                : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: ADMIN.textDim }}>
              <t.Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      <AdminPanel title={TABS.find(t => t.id === activeTab).label} subtitle={TAB_NOTE[activeTab]}>
        {activeTab === 'driverLicense' && (
          <>
            <OptionListEditor
              title="License Classes"
              hint="Single-select — the civilian picks exactly one base class."
              items={cfg.classes || []}
              onChange={(classes) => patchTab({ classes })}
              accent="#4ade80"
            />
            <OptionListEditor
              title="Endorsements"
              hint="Checkbox add-ons — the civilian can select any number (e.g. Motorcycle, Boating)."
              items={cfg.endorsements || []}
              onChange={(endorsements) => patchTab({ endorsements })}
              accent="#22d3ee"
            />
            <FieldListEditor fields={cfg.fields || []} onChange={(fields) => patchTab({ fields })} accent={accent}
              note="Extra fields appended to the license application." />
            <FieldsPreview fields={cfg.fields || []} accent={accent} />
          </>
        )}

        {activeTab !== 'driverLicense' && (
          <>
            <FieldListEditor fields={cfg.fields || []} onChange={(fields) => patchTab({ fields })} accent={accent}
              note={activeTab === 'character' ? 'Core fields are locked; add custom fields below.' : 'Custom fields for this form.'} />
            <FieldsPreview fields={cfg.fields || []} accent={accent} />
          </>
        )}
      </AdminPanel>
    </>
  );
}
