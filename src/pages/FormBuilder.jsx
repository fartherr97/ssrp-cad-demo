import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { FormDocWrap, DynamicFormDoc } from '../components/FormDocument';
import {
  S_PAGE,
  S_INPUT, S_SELECT,
  S_BTN_PRIMARY, S_BTN_SECONDARY, S_BTN_GHOST,
  sm, xs, btnHoverOn, btnHoverOff, btnActiveOn,
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

const LABEL_STYLE = {
  display: 'block', fontSize: 8, textTransform: 'uppercase',
  letterSpacing: '0.5px', color: 'var(--n-text-muted)', marginBottom: 3, fontFamily: 'var(--font-ui)',
};

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
    <div style={{
      marginTop: 6, padding: '8px 10px', background: 'var(--n-bg-elevated)',
      border: '1px solid var(--n-blue)',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 70px', gap: 6, marginBottom: 6 }}>
        <div>
          <label style={LABEL_STYLE}>Field Label *</label>
          <input
            style={{ ...S_INPUT, width: '100%', boxSizing: 'border-box' }}
            value={value.label}
            onChange={e => onChange(v => ({ ...v, label: e.target.value }))}
            placeholder="e.g. Date / Time"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter' && value.label.trim()) onAdd(); }}
          />
        </div>
        <div>
          <label style={LABEL_STYLE}>Type</label>
          <select style={{ ...S_SELECT, width: '100%', boxSizing: 'border-box' }} value={value.type} onChange={e => onChange(v => ({ ...v, type: e.target.value }))}>
            {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        {value.type !== 'checkbox' && value.type !== 'textarea' ? (
          <div>
            <label style={LABEL_STYLE}>Span (cols)</label>
            <select style={{ ...S_SELECT, width: '100%', boxSizing: 'border-box' }} value={value.span} onChange={e => onChange(v => ({ ...v, span: parseInt(e.target.value) }))}>
              {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        ) : <div />}
      </div>
      {value.type === 'dropdown' && (
        <div style={{ marginBottom: 6 }}>
          <label style={LABEL_STYLE}>Options (comma-separated)</label>
          <input
            style={{ ...S_INPUT, width: '100%', boxSizing: 'border-box' }}
            value={value.options}
            onChange={e => onChange(v => ({ ...v, options: e.target.value }))}
            placeholder="Option A, Option B, Option C"
          />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 9, color: 'var(--n-text)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          <input type="checkbox" checked={value.required} onChange={e => onChange(v => ({ ...v, required: e.target.checked }))} style={{ accentColor: 'var(--n-blue)' }} />
          Required
        </label>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={xs(S_BTN_GHOST)} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={onCancel}>Cancel</button>
          <button style={xs(S_BTN_PRIMARY)} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={onAdd} disabled={!value.label.trim()}>Add Field</button>
        </div>
      </div>
    </div>
  );
}

/* ── Expanded field editor ──────────────────────────────────────── */
function FieldEditor({ field, onChange }) {
  return (
    <div style={{
      padding: '8px 10px', background: 'var(--n-bg-base)',
      border: '1px solid var(--n-blue)', borderTop: 'none',
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
    }}>
      <div>
        <label style={LABEL_STYLE}>Label</label>
        <input style={{ ...S_INPUT, width: '100%', boxSizing: 'border-box' }} value={field.label || ''} onChange={e => onChange({ label: e.target.value })} />
      </div>
      <div>
        <label style={LABEL_STYLE}>Field Type</label>
        <select style={{ ...S_SELECT, width: '100%', boxSizing: 'border-box' }} value={field.type || 'text'} onChange={e => onChange({ type: e.target.value })}>
          {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {field.type !== 'checkbox' && field.type !== 'textarea' && (
        <div>
          <label style={LABEL_STYLE}>Column Span (1–4)</label>
          <select style={{ ...S_SELECT, width: '100%', boxSizing: 'border-box' }} value={field.span || 1} onChange={e => onChange({ span: parseInt(e.target.value) })}>
            {[1,2,3,4].map(n => <option key={n} value={n}>{n} column{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>
      )}

      {field.type === 'textarea' && (
        <div>
          <label style={LABEL_STYLE}>Min Rows</label>
          <input type="number" style={{ ...S_INPUT, width: '100%', boxSizing: 'border-box' }} min={2} max={20} value={field.minRows || 4} onChange={e => onChange({ minRows: parseInt(e.target.value) || 4 })} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 4 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 9, color: 'var(--n-text)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          <input type="checkbox" checked={!!field.required} onChange={e => onChange({ required: e.target.checked })} style={{ accentColor: 'var(--n-blue)' }} />
          Required
        </label>
        {field.type !== 'checkbox' && field.type !== 'textarea' && field.type !== 'dropdown' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 9, color: 'var(--n-text)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            <input type="checkbox" checked={!!field.mono} onChange={e => onChange({ mono: e.target.checked })} style={{ accentColor: 'var(--n-blue)' }} />
            Monospace
          </label>
        )}
      </div>

      {field.type === 'dropdown' && (
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={LABEL_STYLE}>Options (comma-separated)</label>
          <input
            style={{ ...S_INPUT, width: '100%', boxSizing: 'border-box' }}
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
    <div style={{ border: '1px solid var(--n-border)', marginBottom: 10 }}>
      {/* Section header bar */}
      <div style={{
        padding: '5px 8px', background: 'var(--n-bg-toolbar)',
        borderBottom: '1px solid var(--n-border)', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor, flexShrink: 0, border: '1px solid rgba(255,255,255,0.15)' }} />
        <input
          style={{ ...S_INPUT, flex: 1, fontSize: 11, fontWeight: 600, minWidth: 0, boxSizing: 'border-box' }}
          value={section.title}
          onChange={e => onSetProp('title', e.target.value)}
          placeholder="Section title"
        />
        <select
          style={{ ...S_SELECT, width: 72, fontSize: 9, boxSizing: 'border-box' }}
          value={section.style || 'gray'}
          onChange={e => onSetProp('style', e.target.value)}
        >
          {SECTION_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button style={{ ...xs(S_BTN_GHOST), padding: '1px 4px', fontSize: 9 }} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={onMoveUp}  disabled={sIdx === 0}>↑</button>
        <button style={{ ...xs(S_BTN_GHOST), padding: '1px 4px', fontSize: 9 }} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={onMoveDown} disabled={sIdx === totalSections - 1}>↓</button>
        <button style={{ ...xs(S_BTN_GHOST), padding: '1px 4px', fontSize: 9, color: 'var(--pr1-text)' }} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={onDelete}>✕</button>
      </div>

      {/* Fields */}
      <div style={{ padding: '6px 8px' }}>
        {section.fields.length === 0 && !isAddingField && (
          <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textAlign: 'center', padding: '8px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            No fields — click Add Field
          </div>
        )}

        {section.fields.map((field, fIdx) => {
          const isExpanded = expandedField?.sectionId === section.id && expandedField?.fieldId === field.id;
          return (
            <div key={field.id} style={{ marginBottom: 3 }}>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '4px 6px',
                  background: isExpanded ? 'var(--n-bg-selected)' : 'var(--n-bg-elevated)',
                  border: isExpanded ? '1px solid var(--n-blue)' : '1px solid var(--n-border-subtle)',
                  cursor: 'pointer',
                }}
                onClick={() => onSetExpanded(isExpanded ? null : { sectionId: section.id, fieldId: field.id })}
              >
                <span style={{ fontSize: 8, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', width: 14, textAlign: 'right', flexShrink: 0 }}>{fIdx + 1}</span>
                <span style={{ flex: 1, fontSize: 10, fontWeight: 500, color: 'var(--n-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                  {field.label || <em style={{ color: 'var(--n-text-muted)' }}>Untitled</em>}
                  {field.required && <span style={{ color: 'var(--pr1-text)', marginLeft: 2, fontSize: 8 }}>*</span>}
                </span>
                <span style={{ fontSize: 8, color: 'var(--n-text-dim)', background: 'var(--n-bg-base)', padding: '1px 4px', border: '1px solid var(--n-border)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                  {field.type}
                </span>
                {field.type !== 'checkbox' && field.type !== 'textarea' && (
                  <span style={{ fontSize: 8, color: 'var(--n-text-dim)', fontFamily: 'var(--font-mono)', width: 16, flexShrink: 0 }}>×{field.span || 1}</span>
                )}
                <div style={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                  <button style={{ ...xs(S_BTN_GHOST), padding: '1px 3px', fontSize: 9 }} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={e => { e.stopPropagation(); onMoveFieldUp(section.id, fIdx); }} disabled={fIdx === 0}>↑</button>
                  <button style={{ ...xs(S_BTN_GHOST), padding: '1px 3px', fontSize: 9 }} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={e => { e.stopPropagation(); onMoveFieldDown(section.id, fIdx); }} disabled={fIdx === section.fields.length - 1}>↓</button>
                  <button style={{ ...xs(S_BTN_GHOST), padding: '1px 3px', fontSize: 9, color: 'var(--pr1-text)' }} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={e => { e.stopPropagation(); onDeleteField(section.id, field.id); }}>✕</button>
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
          <button style={{ ...xs(S_BTN_GHOST), marginTop: 4, fontSize: 9 }} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={onStartAdd}>
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
    <div style={{ ...S_PAGE, padding: 0, overflow: 'hidden', gap: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 0, flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* ── LEFT: Template list ───────────────────────────────── */}
        <div style={{
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          borderRight: '2px solid var(--n-border)', background: 'var(--n-bg-base)',
        }}>
          <div style={{
            padding: '5px 8px', background: 'var(--n-bg-toolbar)',
            borderBottom: '1px solid var(--n-border)', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--n-text)' }}>
              Form Builder
            </span>
            {isAdmin && (
              <button style={xs(S_BTN_PRIMARY)} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={startNew}>+ New</button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {reportTemplates.map(t => (
              <div key={t.id}
                onClick={() => startEdit(t)}
                style={{
                  padding: '6px 8px', cursor: 'pointer',
                  borderBottom: '1px solid var(--n-border-subtle)',
                  borderLeft: editing?.id === t.id ? '3px solid var(--n-blue)' : '3px solid transparent',
                  background: editing?.id === t.id ? 'var(--n-bg-selected)' : 'transparent',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--n-text)', marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    {t.sections
                      ? `${countFields(t)} fields · ${t.sections.length} sec`
                      : `${t.fields?.length || 0} fields`}
                  </div>
                </div>
                {isAdmin && t.id >= 7 && (
                  <button
                    style={{ ...xs(S_BTN_GHOST), fontSize: 8, color: 'var(--pr1-text)', padding: '1px 5px', flexShrink: 0 }}
                    onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn}
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
        <div style={{
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: editing && activeTab === 'preview' ? '#3a3a3a' : 'var(--n-bg-base)',
        }}>
          {!editing ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 12, color: '#888', padding: 24,
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4">
                <rect x="3" y="3" width="18" height="18" rx="1"/>
                <line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="15" x2="12" y2="15"/>
              </svg>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#aaa', marginBottom: 4 }}>No template selected</div>
                <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Select a template to edit or create new
                </div>
              </div>
              {isAdmin && (
                <button style={xs(S_BTN_PRIMARY)} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={startNew}>Create New Template</button>
              )}
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div style={{
                padding: '5px 10px', background: 'var(--n-bg-toolbar)',
                borderBottom: '1px solid var(--n-border)', display: 'flex',
                alignItems: 'center', gap: 8, flexShrink: 0,
              }}>
                <div style={{ display: 'flex', gap: 0 }}>
                  {['edit', 'preview'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: '3px 10px', fontSize: 9, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.4px',
                        border: '1px solid var(--n-border)',
                        background: activeTab === tab ? 'var(--n-bg-selected)' : 'transparent',
                        color: activeTab === tab ? 'var(--n-text)' : 'var(--n-text-muted)',
                        cursor: 'pointer', fontFamily: 'var(--font-ui)',
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: 9, color: 'var(--n-text-muted)', letterSpacing: '0.3px' }}>
                  {editing.name || 'Untitled'}{!editing.id ? ' — unsaved' : ''}
                </span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button style={xs(S_BTN_GHOST)} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={() => setEditing(null)}>Cancel</button>
                  {isAdmin && (
                    <button style={xs(S_BTN_PRIMARY)} onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn} onClick={saveTemplate}>
                      {editing.id ? 'Save Changes' : 'Create Template'}
                    </button>
                  )}
                </div>
              </div>

              {/* Edit panel */}
              {activeTab === 'edit' && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                  {/* Template metadata */}
                  <div style={{ background: 'var(--n-bg-card)', border: '1px solid var(--n-border)', padding: '10px 12px', marginBottom: 12 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--n-text-muted)', marginBottom: 8 }}>
                      Template Settings
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <label style={LABEL_STYLE}>Template Name *</label>
                        <input style={{ ...S_INPUT, width: '100%', boxSizing: 'border-box' }} value={editing.name || ''} onChange={e => setTplProp('name', e.target.value)} />
                      </div>
                      <div>
                        <label style={LABEL_STYLE}>Form Code (optional)</label>
                        <input style={{ ...S_INPUT, width: '100%', boxSizing: 'border-box' }} value={editing.formCode || ''} onChange={e => setTplProp('formCode', e.target.value)} placeholder="e.g. TPD-TS-001" />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={LABEL_STYLE}>Agency Header</label>
                        <input style={{ ...S_INPUT, width: '100%', boxSizing: 'border-box' }} value={editing.agency || ''} onChange={e => setTplProp('agency', e.target.value)} />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={LABEL_STYLE}>Signature Slots (comma-separated)</label>
                        <input
                          style={{ ...S_INPUT, width: '100%', boxSizing: 'border-box' }}
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
                    style={{ ...sm(S_BTN_SECONDARY), width: '100%', marginTop: 4, boxSizing: 'border-box' }}
                    onMouseEnter={btnHoverOn} onMouseLeave={btnHoverOff} onMouseDown={btnActiveOn}
                    onClick={addSection}
                  >
                    + Add Section
                  </button>
                </div>
              )}

              {/* Preview panel */}
              {activeTab === 'preview' && (
                <div style={{ flex: 1, overflow: 'auto', background: '#3a3a3a' }}>
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
