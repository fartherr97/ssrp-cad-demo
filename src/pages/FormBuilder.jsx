import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { FormDocWrap, DynamicFormDoc } from '../components/FormDocument';
import {
  S_PAGE, S_INPUT, S_SELECT,
  S_BTN_PRIMARY, S_BTN_SECONDARY, S_BTN_GHOST,
  sm, xs,
} from '../constants/styles';

const FIELD_TYPES = [
  { value: 'text',            label: 'Text' },
  { value: 'number',          label: 'Number' },
  { value: 'datetime',        label: 'Date / Time' },
  { value: 'date',            label: 'Date' },
  { value: 'dropdown',        label: 'Dropdown' },
  { value: 'textarea',        label: 'Narrative / Textarea' },
  { value: 'checkbox',        label: 'Checkbox' },
  { value: 'badge_lookup',    label: 'Badge Lookup' },
  { value: 'civilian_lookup', label: 'Civilian Lookup' },
];

const SECTION_STYLES = [
  { value: 'gray', label: 'Gray' },
  { value: 'blue', label: 'Blue' },
  { value: 'dark', label: 'Dark' },
];

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const LABEL_CLS = 'block text-[8px] uppercase tracking-[0.5px] text-cad-muted mb-0.5 font-ui';

function blankTemplate() {
  return {
    name: 'New Template',
    agency: 'HILLSBOROUGH COUNTY LAW ENFORCEMENT',
    formCode: '',
    signatureSlots: ['Officer Signature / Badge #', 'Supervisor Signature', 'Date'],
    sections: [
      { id: uid(), title: 'General Information', style: 'blue', fields: [] },
    ],
  };
}

function countFields(t) {
  if (t.sections) return t.sections.reduce((a, s) => a + (s.fields?.length || 0), 0);
  return t.fields?.length || 0;
}

const BLANK_NEW_FIELD = { label: '', type: 'text', span: 1, required: false, mono: false, options: '' };

/* ── Add-field inline form ──────────────────────────────────────── */
function AddFieldForm({ value, onChange, onAdd, onCancel }) {
  return (
    <div className="mt-1.5 p-2 bg-app-card border border-sky-700">
      <div className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: '1fr 140px 70px' }}>
        <div>
          <label className={LABEL_CLS}>Field Label *</label>
          <input
            className={`${S_INPUT} box-border`}
            value={value.label}
            onChange={e => onChange(v => ({ ...v, label: e.target.value }))}
            placeholder="e.g. Date / Time"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter' && value.label.trim()) onAdd(); }}
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Type</label>
          <select className={`${S_SELECT} box-border`} value={value.type} onChange={e => onChange(v => ({ ...v, type: e.target.value }))}>
            {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        {value.type !== 'checkbox' && value.type !== 'textarea' ? (
          <div>
            <label className={LABEL_CLS}>Span (cols)</label>
            <select className={`${S_SELECT} box-border`} value={value.span} onChange={e => onChange(v => ({ ...v, span: parseInt(e.target.value) }))}>
              {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        ) : <div />}
      </div>
      {value.type === 'dropdown' && (
        <div className="mb-1.5">
          <label className={LABEL_CLS}>Options (comma-separated)</label>
          <input
            className={`${S_INPUT} box-border`}
            value={value.options}
            onChange={e => onChange(v => ({ ...v, options: e.target.value }))}
            placeholder="Option A, Option B, Option C"
          />
        </div>
      )}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1 cursor-pointer text-[9px] text-cad-text uppercase tracking-[0.4px]">
          <input type="checkbox" checked={value.required} onChange={e => onChange(v => ({ ...v, required: e.target.checked }))} className="accent-sky-700" />
          Required
        </label>
        <div className="flex gap-1.5">
          <button className={xs(S_BTN_GHOST)} onClick={onCancel}>Cancel</button>
          <button className={xs(S_BTN_PRIMARY)} onClick={onAdd} disabled={!value.label.trim()}>Add Field</button>
        </div>
      </div>
    </div>
  );
}

/* ── Expanded field editor ──────────────────────────────────────── */
function FieldEditor({ field, onChange }) {
  return (
    <div className="p-2 bg-app-bg border border-sky-700 border-t-0 grid grid-cols-2 gap-2">
      <div>
        <label className={LABEL_CLS}>Label</label>
        <input className={`${S_INPUT} box-border`} value={field.label || ''} onChange={e => onChange({ label: e.target.value })} />
      </div>
      <div>
        <label className={LABEL_CLS}>Field Type</label>
        <select className={`${S_SELECT} box-border`} value={field.type || 'text'} onChange={e => onChange({ type: e.target.value })}>
          {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {field.type !== 'checkbox' && field.type !== 'textarea' && (
        <div>
          <label className={LABEL_CLS}>Column Span (1–4)</label>
          <select className={`${S_SELECT} box-border`} value={field.span || 1} onChange={e => onChange({ span: parseInt(e.target.value) })}>
            {[1,2,3,4].map(n => <option key={n} value={n}>{n} column{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>
      )}

      {field.type === 'textarea' && (
        <div>
          <label className={LABEL_CLS}>Min Rows</label>
          <input type="number" className={`${S_INPUT} box-border`} min={2} max={20} value={field.minRows || 4} onChange={e => onChange({ minRows: parseInt(e.target.value) || 4 })} />
        </div>
      )}

      <div className="flex items-center gap-4 pt-1">
        <label className="flex items-center gap-1 cursor-pointer text-[9px] text-cad-text uppercase tracking-[0.4px]">
          <input type="checkbox" checked={!!field.required} onChange={e => onChange({ required: e.target.checked })} className="accent-sky-700" />
          Required
        </label>
        {field.type !== 'checkbox' && field.type !== 'textarea' && field.type !== 'dropdown' && (
          <label className="flex items-center gap-1 cursor-pointer text-[9px] text-cad-text uppercase tracking-[0.4px]">
            <input type="checkbox" checked={!!field.mono} onChange={e => onChange({ mono: e.target.checked })} className="accent-sky-700" />
            Monospace
          </label>
        )}
      </div>

      {field.type === 'dropdown' && (
        <div className="col-span-2">
          <label className={LABEL_CLS}>Options (comma-separated)</label>
          <input
            className={`${S_INPUT} box-border`}
            value={Array.isArray(field.options) ? field.options.join(', ') : (field.options || '')}
            onChange={e => onChange({ options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) })}
            placeholder="Option 1, Option 2, Option 3"
          />
        </div>
      )}
    </div>
  );
}

/* ── Section editor block ───────────────────────────────────────── */
function SectionEditor({
  section, sIdx, totalSections,
  expandedField, isAddingField, newField,
  onSetProp, onMoveUp, onMoveDown, onDelete,
  onUpdateField, onDeleteField, onMoveFieldUp, onMoveFieldDown,
  onSetExpanded, onStartAdd, onCancelAdd, onNewFieldChange, onAddField,
}) {
  const dotColor = section.style === 'blue' ? '#1a3a6a' : section.style === 'dark' ? '#444' : '#aaa';

  return (
    <div className="border border-border-base mb-2.5">
      {/* Section header bar */}
      <div className="px-2 py-1.5 bg-app-card border-b border-border-base flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/15" style={{ background: dotColor }} />
        <input
          className={`${S_INPUT} flex-1 !text-[11px] font-semibold min-w-0 box-border`}
          value={section.title}
          onChange={e => onSetProp('title', e.target.value)}
          placeholder="Section title"
        />
        <select
          className={`${S_SELECT} !w-[72px] !text-[9px] box-border`}
          value={section.style || 'gray'}
          onChange={e => onSetProp('style', e.target.value)}
        >
          {SECTION_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button className={`${xs(S_BTN_GHOST)} !px-1 !py-0.5 !text-[9px]`} onClick={onMoveUp}  disabled={sIdx === 0}>↑</button>
        <button className={`${xs(S_BTN_GHOST)} !px-1 !py-0.5 !text-[9px]`} onClick={onMoveDown} disabled={sIdx === totalSections - 1}>↓</button>
        <button className={`${xs(S_BTN_GHOST)} !px-1 !py-0.5 !text-[9px] text-red-400`} onClick={onDelete}>✕</button>
      </div>

      {/* Fields */}
      <div className="px-2 py-1.5">
        {section.fields.length === 0 && !isAddingField && (
          <div className="text-[9px] text-cad-muted text-center py-2 uppercase tracking-[0.4px]">
            No fields * click Add Field
          </div>
        )}

        {section.fields.map((field, fIdx) => {
          const isExpanded = expandedField?.sectionId === section.id && expandedField?.fieldId === field.id;
          return (
            <div key={field.id} className="mb-0.5">
              <div
                className={`flex items-center gap-1 px-1.5 py-1 cursor-pointer border ${isExpanded ? 'bg-app-selected border-sky-700' : 'bg-app-card border-white/[0.06] hover:bg-app-hover'}`}
                onClick={() => onSetExpanded(isExpanded ? null : { sectionId: section.id, fieldId: field.id })}
              >
                <span className="text-[8px] text-cad-muted font-mono w-3.5 text-right shrink-0">{fIdx + 1}</span>
                <span className="flex-1 text-[10px] font-medium text-cad-text overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
                  {field.label || <em className="text-cad-muted">Untitled</em>}
                  {field.required && <span className="text-red-400 ml-0.5 text-[8px]">*</span>}
                </span>
                <span className="text-[8px] text-cad-dim bg-app-bg px-1 py-0.5 border border-border-base font-mono shrink-0">
                  {field.type}
                </span>
                {field.type !== 'checkbox' && field.type !== 'textarea' && (
                  <span className="text-[8px] text-cad-dim font-mono w-4 shrink-0">×{field.span || 1}</span>
                )}
                <div className="flex gap-0.5 shrink-0">
                  <button className={`${xs(S_BTN_GHOST)} !px-0.5 !py-0 !text-[9px]`} onClick={e => { e.stopPropagation(); onMoveFieldUp(section.id, fIdx); }} disabled={fIdx === 0}>↑</button>
                  <button className={`${xs(S_BTN_GHOST)} !px-0.5 !py-0 !text-[9px]`} onClick={e => { e.stopPropagation(); onMoveFieldDown(section.id, fIdx); }} disabled={fIdx === section.fields.length - 1}>↓</button>
                  <button className={`${xs(S_BTN_GHOST)} !px-0.5 !py-0 !text-[9px] text-red-400`} onClick={e => { e.stopPropagation(); onDeleteField(section.id, field.id); }}>✕</button>
                </div>
              </div>
              {isExpanded && (
                <FieldEditor
                  field={field}
                  onChange={updates => onUpdateField(section.id, field.id, updates)}
                />
              )}
            </div>
          );
        })}

        {isAddingField ? (
          <AddFieldForm
            value={newField}
            onChange={onNewFieldChange}
            onAdd={onAddField}
            onCancel={onCancelAdd}
          />
        ) : (
          <button className={`${xs(S_BTN_GHOST)} mt-1 !text-[9px]`} onClick={onStartAdd}>
            + Add Field
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Main FormBuilder page ──────────────────────────────────────── */
export default function FormBuilder() {
  const { state, dispatch } = useCAD();
  const { reportTemplates } = state;
  const isAdmin = state.currentUser?.role === 'admin';

  const [editing, setEditing] = useState(null);
  const [activeTab, setActiveTab] = useState('edit');
  const [expandedField, setExpandedField] = useState(null);
  const [addFieldSectionId, setAddFieldSectionId] = useState(null);
  const [newField, setNewField] = useState(BLANK_NEW_FIELD);

  const startEdit = (t) => {
    setEditing(JSON.parse(JSON.stringify(t)));
    setActiveTab('edit');
    setExpandedField(null);
    setAddFieldSectionId(null);
  };

  const startNew = () => {
    setEditing(blankTemplate());
    setActiveTab('edit');
    setExpandedField(null);
    setAddFieldSectionId(null);
  };

  const saveTemplate = () => {
    if (!editing) return;
    if (editing.id) {
      dispatch({ type: 'UPDATE_REPORT_TEMPLATE', payload: editing });
    } else {
      dispatch({ type: 'ADD_REPORT_TEMPLATE', payload: editing });
    }
    setEditing(null);
  };

  const deleteTemplate = (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this template? This cannot be undone.')) return;
    dispatch({ type: 'DELETE_REPORT_TEMPLATE', payload: id });
    if (editing?.id === id) setEditing(null);
  };

  /* Template-level */
  const setTplProp = (key, val) => setEditing(t => ({ ...t, [key]: val }));

  /* Section-level */
  const setSectionProp = (sId, key, val) =>
    setEditing(t => ({ ...t, sections: t.sections.map(s => s.id === sId ? { ...s, [key]: val } : s) }));

  const addSection = () => {
    const s = { id: uid(), title: 'New Section', style: 'gray', fields: [] };
    setEditing(t => ({ ...t, sections: [...t.sections, s] }));
  };

  const deleteSection = (sId) =>
    setEditing(t => ({ ...t, sections: t.sections.filter(s => s.id !== sId) }));

  const moveSectionUp = (idx) => setEditing(t => {
    if (idx <= 0) return t;
    const secs = [...t.sections];
    [secs[idx - 1], secs[idx]] = [secs[idx], secs[idx - 1]];
    return { ...t, sections: secs };
  });

  const moveSectionDown = (idx) => setEditing(t => {
    if (idx >= t.sections.length - 1) return t;
    const secs = [...t.sections];
    [secs[idx], secs[idx + 1]] = [secs[idx + 1], secs[idx]];
    return { ...t, sections: secs };
  });

  /* Field-level */
  const addField = (sId) => {
    const f = {
      id: uid(),
      label: newField.label.trim() || 'Untitled Field',
      type: newField.type,
      span: parseInt(newField.span) || 1,
      required: newField.required,
      ...(newField.mono ? { mono: true } : {}),
      ...(newField.type === 'dropdown' && newField.options
        ? { options: newField.options.split(',').map(o => o.trim()).filter(Boolean) }
        : {}),
      ...(newField.type === 'textarea' ? { minRows: 4 } : {}),
    };
    setEditing(t => ({
      ...t,
      sections: t.sections.map(s => s.id === sId ? { ...s, fields: [...s.fields, f] } : s),
    }));
    setNewField(BLANK_NEW_FIELD);
    setAddFieldSectionId(null);
  };

  const updateField = (sId, fId, updates) =>
    setEditing(t => ({
      ...t,
      sections: t.sections.map(s =>
        s.id === sId
          ? { ...s, fields: s.fields.map(f => f.id === fId ? { ...f, ...updates } : f) }
          : s
      ),
    }));

  const deleteField = (sId, fId) => {
    if (expandedField?.fieldId === fId) setExpandedField(null);
    setEditing(t => ({
      ...t,
      sections: t.sections.map(s => s.id === sId ? { ...s, fields: s.fields.filter(f => f.id !== fId) } : s),
    }));
  };

  const moveFieldUp = (sId, idx) => setEditing(t => ({
    ...t,
    sections: t.sections.map(s => {
      if (s.id !== sId || idx <= 0) return s;
      const flds = [...s.fields];
      [flds[idx - 1], flds[idx]] = [flds[idx], flds[idx - 1]];
      return { ...s, fields: flds };
    }),
  }));

  const moveFieldDown = (sId, idx) => setEditing(t => ({
    ...t,
    sections: t.sections.map(s => {
      if (s.id !== sId || idx >= s.fields.length - 1) return s;
      const flds = [...s.fields];
      [flds[idx], flds[idx + 1]] = [flds[idx + 1], flds[idx]];
      return { ...s, fields: flds };
    }),
  }));

  return (
    <div className={`${S_PAGE} !p-0 overflow-hidden !gap-0`}>
      <div className="grid flex-1 min-h-0 overflow-hidden" style={{ gridTemplateColumns: '260px 1fr', gap: 0 }}>

        {/* ── LEFT: Template list ───────────────────────────────── */}
        <div className="flex flex-col overflow-hidden border-r-2 border-border-base bg-app-bg">
          <div className="px-2 py-1.5 bg-app-card border-b border-border-base flex items-center justify-between shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-cad-text">
              Form Builder
            </span>
            {isAdmin && (
              <button className={xs(S_BTN_PRIMARY)} onClick={startNew}>+ New</button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {reportTemplates.map(t => (
              <div key={t.id}
                onClick={() => startEdit(t)}
                className={`px-2 py-1.5 cursor-pointer border-b border-white/[0.05] border-l-[3px] flex items-center gap-1.5 transition-colors ${editing?.id === t.id ? 'border-l-sky-500 bg-app-selected' : 'border-l-transparent hover:bg-app-hover'}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-cad-text mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                    {t.name}
                  </div>
                  <div className="text-[9px] text-cad-muted uppercase tracking-[0.4px]">
                    {t.sections
                      ? `${countFields(t)} fields · ${t.sections.length} sec`
                      : `${t.fields?.length || 0} fields`}
                  </div>
                </div>
                {isAdmin && t.id >= 7 && (
                  <button
                    className={`${xs(S_BTN_GHOST)} !text-[8px] !px-1 !py-0.5 text-red-400 shrink-0`}
                    onClick={e => deleteTemplate(t.id, e)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Editor / Preview ───────────────────────────── */}
        <div className={`flex flex-col overflow-hidden ${editing && activeTab === 'preview' ? 'bg-[#3a3a3a]' : 'bg-app-bg'}`}>
          {!editing ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500 p-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4">
                <rect x="3" y="3" width="18" height="18" rx="1"/>
                <line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="15" x2="12" y2="15"/>
              </svg>
              <div className="text-center">
                <div className="text-[11px] font-medium text-slate-400 mb-1">No template selected</div>
                <div className="text-[9px] text-slate-600 uppercase tracking-[0.5px]">
                  Select a template to edit or create new
                </div>
              </div>
              {isAdmin && (
                <button className={xs(S_BTN_PRIMARY)} onClick={startNew}>Create New Template</button>
              )}
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="px-2.5 py-1.5 bg-app-card border-b border-border-base flex items-center gap-2 shrink-0">
                <div className="flex gap-0">
                  {['edit', 'preview'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.4px] border cursor-pointer transition-colors ${activeTab === tab ? 'bg-app-selected text-cad-text border-border-base' : 'bg-transparent text-cad-muted border-border-base'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <span className="text-[9px] text-cad-muted tracking-[0.3px]">
                  {editing.name || 'Untitled'}{!editing.id ? ' * unsaved' : ''}
                </span>
                <div className="ml-auto flex gap-1.5 items-center">
                  <button className={xs(S_BTN_GHOST)} onClick={() => setEditing(null)}>Cancel</button>
                  {isAdmin && (
                    <button className={xs(S_BTN_PRIMARY)} onClick={saveTemplate}>
                      {editing.id ? 'Save Changes' : 'Create Template'}
                    </button>
                  )}
                </div>
              </div>

              {/* Edit panel */}
              {activeTab === 'edit' && (
                <div className="flex-1 overflow-y-auto p-3 pl-4">
                  {/* Template metadata */}
                  <div className="bg-app-card border border-border-base p-2.5 mb-3">
                    <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-cad-muted mb-2">
                      Template Settings
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={LABEL_CLS}>Template Name *</label>
                        <input className={`${S_INPUT} box-border`} value={editing.name || ''} onChange={e => setTplProp('name', e.target.value)} />
                      </div>
                      <div>
                        <label className={LABEL_CLS}>Form Code (optional)</label>
                        <input className={`${S_INPUT} box-border`} value={editing.formCode || ''} onChange={e => setTplProp('formCode', e.target.value)} placeholder="e.g. TPD-TS-001" />
                      </div>
                      <div className="col-span-2">
                        <label className={LABEL_CLS}>Agency Header</label>
                        <input className={`${S_INPUT} box-border`} value={editing.agency || ''} onChange={e => setTplProp('agency', e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className={LABEL_CLS}>Signature Slots (comma-separated)</label>
                        <input
                          className={`${S_INPUT} box-border`}
                          value={Array.isArray(editing.signatureSlots) ? editing.signatureSlots.join(', ') : (editing.signatureSlots || '')}
                          onChange={e => setTplProp('signatureSlots', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                          placeholder="Officer Signature / Badge #, Supervisor Signature, Date"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sections */}
                  {editing.sections.map((section, sIdx) => (
                    <SectionEditor
                      key={section.id}
                      section={section}
                      sIdx={sIdx}
                      totalSections={editing.sections.length}
                      expandedField={expandedField}
                      isAddingField={addFieldSectionId === section.id}
                      newField={newField}
                      onSetProp={(key, val) => setSectionProp(section.id, key, val)}
                      onMoveUp={() => moveSectionUp(sIdx)}
                      onMoveDown={() => moveSectionDown(sIdx)}
                      onDelete={() => deleteSection(section.id)}
                      onUpdateField={updateField}
                      onDeleteField={deleteField}
                      onMoveFieldUp={moveFieldUp}
                      onMoveFieldDown={moveFieldDown}
                      onSetExpanded={setExpandedField}
                      onStartAdd={() => { setAddFieldSectionId(section.id); setNewField(BLANK_NEW_FIELD); }}
                      onCancelAdd={() => setAddFieldSectionId(null)}
                      onNewFieldChange={setNewField}
                      onAddField={() => addField(section.id)}
                    />
                  ))}

                  <button
                    className={`${sm(S_BTN_SECONDARY)} w-full mt-1 box-border`}
                    onClick={addSection}
                  >
                    + Add Section
                  </button>
                </div>
              )}

              {/* Preview panel */}
              {activeTab === 'preview' && (
                <div className="flex-1 overflow-auto bg-[#3a3a3a]">
                  <FormDocWrap>
                    <DynamicFormDoc
                      template={editing}
                      data={{}}
                      editable={false}
                      meta={{ caseNumber: 'PREVIEW-0001', status: 'Draft' }}
                    />
                  </FormDocWrap>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
