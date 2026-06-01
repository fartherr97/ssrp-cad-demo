import { useState, useRef } from 'react';
import { useCAD } from '../../../store/cadStore';
import {
  ADMIN, AdminPageTitle, SonButton, SonSearch, SonBadge, SonIconBtn,
  SON_INPUT, SON_LABEL,
} from '../AdminKit';
import {
  MdAdd, MdDelete, MdContentCopy, MdSearch, MdArrowUpward, MdArrowDownward,
  MdTextFields, MdCalendarToday, MdCheckBox, MdListAlt, MdNotes, MdBadge,
  MdPerson, MdChevronRight, MdExpandMore, MdDragIndicator, MdClose,
  MdDescription, MdDirectionsCar, MdGavel,
} from 'react-icons/md';

/* ─── Field type catalog ─── */
const FIELD_TYPES = [
  { type: 'text',            icon: MdTextFields,   label: 'Text'          },
  { type: 'number',          icon: MdTextFields,   label: 'Number'        },
  { type: 'date',            icon: MdCalendarToday,label: 'Date'          },
  { type: 'dropdown',        icon: MdListAlt,      label: 'Dropdown'      },
  { type: 'checkbox',        icon: MdCheckBox,     label: 'Checkbox'      },
  { type: 'textarea',        icon: MdNotes,        label: 'Text Area'     },
  { type: 'civilian_lookup', icon: MdPerson,       label: 'Civilian'      },
  { type: 'badge_lookup',    icon: MdBadge,        label: 'Officer Badge' },
  { type: 'vehicle_lookup',  icon: MdDirectionsCar,label: 'Vehicle'       },
  { type: 'charges',         icon: MdGavel,        label: 'Charges'       },
];

/* ─── Premade section templates ─── */
const PREMADE_SECTIONS = [
  { key: 'subject', title: 'Subject Information', style: 'blue', fields: [
    { id: 'ps_f1', label: 'Full Name',     type: 'civilian_lookup', span: 3, required: true },
    { id: 'ps_f2', label: 'Date of Birth', type: 'date',            span: 1 },
    { id: 'ps_f3', label: 'Address',       type: 'text',            span: 4 },
  ]},
  { key: 'officer', title: 'Issuing Officer', style: 'gray', fields: [
    { id: 'ps_f4', label: 'Officer Badge #', type: 'badge_lookup', span: 2 },
    { id: 'ps_f5', label: 'Department',      type: 'text',         span: 2 },
  ]},
  { key: 'supervisor', title: 'Supervisor Review', style: 'amber', fields: [
    { id: 'ps_f6', label: 'Supervisor Badge #', type: 'badge_lookup', span: 2 },
    { id: 'ps_f7', label: 'Approval Status',    type: 'dropdown',     span: 2, options: ['Pending','Approved','Denied'] },
    { id: 'ps_f8', label: 'Notes',              type: 'textarea',     span: 4, minRows: 2 },
  ]},
  { key: 'narrative', title: 'Narrative', style: 'gray', fields: [
    { id: 'ps_f9', label: 'Narrative', type: 'textarea', span: 4, required: true, minRows: 5 },
  ]},
  { key: 'vehicle', title: 'Vehicle Information', style: 'gray', fields: [
    { id: 'ps_f10', label: 'Plate',  type: 'text', span: 1, mono: true },
    { id: 'ps_f11', label: 'Make',   type: 'text', span: 1 },
    { id: 'ps_f12', label: 'Model',  type: 'text', span: 1 },
    { id: 'ps_f13', label: 'Color',  type: 'text', span: 1 },
    { id: 'ps_f14', label: 'Year',   type: 'number', span: 1 },
    { id: 'ps_f15', label: 'VIN',    type: 'text', span: 3, mono: true },
  ]},
  { key: 'charges', title: 'Charges / Violations', style: 'red', fields: [
    { id: 'ps_f16', label: 'Primary Charge', type: 'text',     span: 3, required: true },
    { id: 'ps_f17', label: 'Charge Type',    type: 'dropdown', span: 1, options: ['Felony','Misdemeanor','Infraction','Ordinance'] },
    { id: 'ps_f18', label: 'Additional Charges', type: 'textarea', span: 4, minRows: 2 },
  ]},
];

const SECTION_STYLES = [
  { key: 'blue',  label: 'Blue',  color: '#1e3a5f' },
  { key: 'gray',  label: 'Gray',  color: '#1e2533' },
  { key: 'green', label: 'Green', color: '#1a3a20' },
  { key: 'red',   label: 'Red',   color: '#3a1a1a' },
  { key: 'amber', label: 'Amber', color: '#3a2a0a' },
];

const CATEGORY_OPTIONS = ['Incident', 'License', 'Legal', 'Citation', 'Notice', 'Registration'];

const uid = () => `f${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const sid = () => `s${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

/* ─── Field editor row ─── */
function FieldRow({ field, onUpdate, onDelete, onMoveUp, onMoveDown }) {
  const [expanded, setExpanded] = useState(false);
  const FIcon = FIELD_TYPES.find(f => f.type === field.type)?.icon || MdTextFields;
  return (
    <div style={{ border: `1px solid ${ADMIN.border}`, borderRadius: 6, marginBottom: 4, background: ADMIN.bg }}>
      <div className="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
        style={{ borderBottom: expanded ? `1px solid ${ADMIN.border}` : 'none' }}>
        <MdDragIndicator size={14} color={ADMIN.textMute} />
        <FIcon size={14} color={ADMIN.blue} />
        <span className="text-[12px] font-medium flex-1" style={{ color: ADMIN.text }}>
          {field.label || <span style={{ color: ADMIN.textMute, fontStyle: 'italic' }}>Untitled Field</span>}
        </span>
        <span className="text-[10px] font-mono" style={{ color: ADMIN.textMute }}>{field.type}</span>
        {field.required && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${ADMIN.red}22`, color: ADMIN.red }}>Required</span>}
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          <SonIconBtn icon={MdArrowUpward} onClick={onMoveUp} title="Move up" />
          <SonIconBtn icon={MdArrowDownward} onClick={onMoveDown} title="Move down" />
          <SonIconBtn icon={MdDelete} onClick={onDelete} danger title="Remove field" />
        </div>
        {expanded ? <MdExpandMore size={16} color={ADMIN.textDim} /> : <MdChevronRight size={16} color={ADMIN.textDim} />}
      </div>
      {expanded && (
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label style={SON_LABEL}>Field Label</label>
            <input style={SON_INPUT} value={field.label} onChange={e => onUpdate({ ...field, label: e.target.value })} placeholder="e.g. Subject Name" />
          </div>
          <div>
            <label style={SON_LABEL}>Field Type</label>
            <select style={SON_INPUT} value={field.type} onChange={e => onUpdate({ ...field, type: e.target.value })}>
              {FIELD_TYPES.map(ft => <option key={ft.type} value={ft.type}>{ft.label}</option>)}
            </select>
          </div>
          <div>
            <label style={SON_LABEL}>Column Span (1-4)</label>
            <select style={SON_INPUT} value={field.span || 2} onChange={e => onUpdate({ ...field, span: Number(e.target.value) })}>
              {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!field.required} onChange={e => onUpdate({ ...field, required: e.target.checked })} />
              <span className="text-[12px]" style={{ color: ADMIN.textDim }}>Required</span>
            </label>
            {field.type === 'text' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!field.mono} onChange={e => onUpdate({ ...field, mono: e.target.checked })} />
                <span className="text-[12px]" style={{ color: ADMIN.textDim }}>Monospace</span>
              </label>
            )}
          </div>
          {field.type === 'dropdown' && (
            <div className="col-span-2">
              <label style={SON_LABEL}>Options (one per line)</label>
              <textarea
                style={{ ...SON_INPUT, height: 80, resize: 'vertical' }}
                value={(field.options || []).join('\n')}
                onChange={e => onUpdate({ ...field, options: e.target.value.split('\n').filter(Boolean) })}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Section editor block ─── */
function SectionBlock({ section, onUpdate, onDelete, onMoveUp, onMoveDown }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const fieldTimer = useRef(null);
  const styleObj = SECTION_STYLES.find(s => s.key === section.style) || SECTION_STYLES[0];

  const openFieldMenu  = () => { clearTimeout(fieldTimer.current); setShowAddField(true); };
  const closeFieldMenu = () => { fieldTimer.current = setTimeout(() => setShowAddField(false), 120); };

  const addField = (type) => {
    const newField = { id: uid(), label: '', type, span: 2 };
    onUpdate({ ...section, fields: [...(section.fields || []), newField] });
    setShowAddField(false);
  };

  const updateField = (idx, updated) => {
    const fields = [...(section.fields || [])];
    fields[idx] = updated;
    onUpdate({ ...section, fields });
  };

  const deleteField = (idx) => {
    const fields = (section.fields || []).filter((_, i) => i !== idx);
    onUpdate({ ...section, fields });
  };

  const moveField = (idx, dir) => {
    const fields = [...(section.fields || [])];
    const swap = idx + dir;
    if (swap < 0 || swap >= fields.length) return;
    [fields[idx], fields[swap]] = [fields[swap], fields[idx]];
    onUpdate({ ...section, fields });
  };

  return (
    <div className="mb-3 rounded-lg overflow-hidden" style={{ border: `1px solid ${ADMIN.borderHi}` }}>
      {/* Section header */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: styleObj.color }}>
        <MdDragIndicator size={16} color="rgba(255,255,255,0.4)" />
        <button onClick={() => setCollapsed(c => !c)} className="flex-1 flex items-center gap-2 text-left bg-transparent border-none cursor-pointer">
          {collapsed ? <MdChevronRight size={16} color="rgba(255,255,255,0.7)" /> : <MdExpandMore size={16} color="rgba(255,255,255,0.7)" />}
          <input
            value={section.title}
            onChange={e => { e.stopPropagation(); onUpdate({ ...section, title: e.target.value }); }}
            onClick={e => e.stopPropagation()}
            className="bg-transparent border-none outline-none text-[13px] font-bold text-white/90 cursor-text"
            placeholder="Section Title"
          />
        </button>
        <div className="flex items-center gap-1">
          {/* Style picker */}
          <div className="flex gap-1 mr-1">
            {SECTION_STYLES.map(s => (
              <button key={s.key} onClick={() => onUpdate({ ...section, style: s.key })}
                className="w-4 h-4 rounded-full border-2 cursor-pointer"
                style={{ background: s.color, borderColor: section.style === s.key ? '#fff' : 'transparent' }}
                title={s.label}
              />
            ))}
          </div>
          <SonIconBtn icon={MdArrowUpward} onClick={onMoveUp} title="Move section up" />
          <SonIconBtn icon={MdArrowDownward} onClick={onMoveDown} title="Move section down" />
          <SonIconBtn icon={MdDelete} onClick={onDelete} danger title="Delete section" />
        </div>
      </div>

      {/* Fields */}
      {!collapsed && (
        <div className="p-3" style={{ background: ADMIN.panel }}>
          {(section.fields || []).map((field, idx) => (
            <FieldRow key={field.id}
              field={field}
              onUpdate={u => updateField(idx, u)}
              onDelete={() => deleteField(idx)}
              onMoveUp={() => moveField(idx, -1)}
              onMoveDown={() => moveField(idx, 1)}
            />
          ))}

          {/* Add field */}
          <div className="relative mt-2" onMouseEnter={openFieldMenu} onMouseLeave={closeFieldMenu}>
            <button
              onClick={() => (showAddField ? setShowAddField(false) : openFieldMenu())}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-[0.4px] cursor-pointer border-dashed transition-colors"
              style={{ background: 'transparent', border: `1px dashed ${ADMIN.border}`, color: ADMIN.textMute }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = ADMIN.blue; e.currentTarget.style.color = ADMIN.blue; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ADMIN.border; e.currentTarget.style.color = ADMIN.textMute; }}
            >
              <MdAdd size={14} /> Add Field
            </button>
            {showAddField && (
              <div className="absolute bottom-full left-0 mb-1 z-[100] p-2 rounded-lg shadow-2xl grid grid-cols-4 gap-1 min-w-[280px]"
                style={{ background: ADMIN.panel2, border: `1px solid ${ADMIN.borderHi}`, animation: 'dropdownFadeIn 0.13s ease-out' }}>
                {FIELD_TYPES.map(ft => {
                  const Icon = ft.icon;
                  return (
                    <button key={ft.type} onClick={() => addField(ft.type)}
                      className="flex flex-col items-center gap-1 p-2 rounded-md cursor-pointer border-none text-[10px] font-semibold"
                      style={{ background: ADMIN.panel, color: ADMIN.textDim, transition: 'all 0.1s ease-out' }}
                      onMouseEnter={e => { e.currentTarget.style.background = ADMIN.row; e.currentTarget.style.color = ADMIN.text; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = ADMIN.panel; e.currentTarget.style.color = ADMIN.textDim; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <Icon size={16} color={ADMIN.blue} />
                      {ft.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Template builder (right panel) ─── */
function TemplateBuilder({ template, isReport, onSave, onClose }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(template)));
  const [showPremade, setShowPremade] = useState(false);
  const premadeRef = useRef(null);
  const premadeTimer = useRef(null);

  const openPremade  = () => { clearTimeout(premadeTimer.current); setShowPremade(true); };
  const closePremade = () => { premadeTimer.current = setTimeout(() => setShowPremade(false), 120); };

  const up = (patch) => setDraft(d => ({ ...d, ...patch }));

  const addSection = () => {
    const newSec = { id: sid(), title: 'New Section', style: 'gray', fields: [] };
    setDraft(d => ({ ...d, sections: [...(d.sections || []), newSec] }));
  };

  const addPremade = (premade) => {
    const newSec = {
      ...JSON.parse(JSON.stringify(premade)),
      id: sid(),
      fields: premade.fields.map(f => ({ ...f, id: uid() })),
    };
    setDraft(d => ({ ...d, sections: [...(d.sections || []), newSec] }));
    setShowPremade(false);
  };

  const updateSection = (idx, updated) => {
    const sections = [...(draft.sections || [])];
    sections[idx] = updated;
    setDraft(d => ({ ...d, sections }));
  };

  const deleteSection = (idx) => {
    setDraft(d => ({ ...d, sections: (d.sections || []).filter((_, i) => i !== idx) }));
  };

  const moveSection = (idx, dir) => {
    const sections = [...(draft.sections || [])];
    const swap = idx + dir;
    if (swap < 0 || swap >= sections.length) return;
    [sections[idx], sections[swap]] = [sections[swap], sections[idx]];
    setDraft(d => ({ ...d, sections }));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: ADMIN.bg }}>
      {/* Builder header */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ background: ADMIN.panel, borderBottom: `1px solid ${ADMIN.border}` }}>
        <div className="flex-1 flex items-center gap-2">
          <MdDescription size={18} color={ADMIN.red} />
          <span className="text-[13px] font-bold" style={{ color: ADMIN.text }}>
            {isReport ? 'Report Builder' : 'Record Builder'}: <span style={{ color: ADMIN.textDim }}>{draft.name || 'Untitled'}</span>
          </span>
        </div>
        <SonButton variant="ghost" size="sm" onClick={onClose}>Cancel</SonButton>
        <SonButton variant="red" size="sm" onClick={() => onSave(draft)}>Save Template</SonButton>
      </div>

      {/* Meta fields */}
      <div className="px-4 pt-4 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0" style={{ borderBottom: `1px solid ${ADMIN.border}`, background: ADMIN.panel }}>
        <div>
          <label style={SON_LABEL}>Template Name *</label>
          <input style={SON_INPUT} value={draft.name} onChange={e => up({ name: e.target.value })} placeholder="e.g. Use of Force Report" />
        </div>
        <div>
          <label style={SON_LABEL}>Form Code</label>
          <input style={SON_INPUT} value={draft.formCode || ''} onChange={e => up({ formCode: e.target.value })} placeholder="e.g. TPD-UOF-001" />
        </div>
        <div>
          <label style={SON_LABEL}>Category</label>
          <select style={SON_INPUT} value={draft.category || ''} onChange={e => up({ category: e.target.value })}>
            <option value="">-- Select Category --</option>
            {(isReport
              ? ['Incident','Citation','Notice']
              : CATEGORY_OPTIONS
            ).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={SON_LABEL}>Issuing Agency</label>
          <input style={SON_INPUT} value={draft.agency || ''} onChange={e => up({ agency: e.target.value })} placeholder="e.g. Tampa Police Department" />
        </div>
      </div>

      {/* Section builder (scrollable) */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {(draft.sections || []).map((sec, idx) => (
          <SectionBlock key={sec.id}
            section={sec}
            onUpdate={u => updateSection(idx, u)}
            onDelete={() => deleteSection(idx)}
            onMoveUp={() => moveSection(idx, -1)}
            onMoveDown={() => moveSection(idx, 1)}
          />
        ))}

        {(draft.sections || []).length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-center" style={{ color: ADMIN.textMute }}>
            <MdListAlt size={36} color={ADMIN.border} />
            <div className="text-[13px]">No sections yet. Add a custom or premade section below.</div>
          </div>
        )}

        {/* Add section buttons */}
        <div className="flex gap-2 mt-2">
          <SonButton onClick={addSection} size="sm">
            <MdAdd size={15} /> Add Custom Section
          </SonButton>
          <div className="relative" ref={premadeRef} onMouseEnter={openPremade} onMouseLeave={closePremade}>
            <SonButton onClick={() => (showPremade ? setShowPremade(false) : openPremade())} size="sm">
              <MdAdd size={15} /> Add Premade Section <MdExpandMore size={14} />
            </SonButton>
            {showPremade && (
              <div className="absolute top-full left-0 mt-1 z-[100] min-w-[220px] rounded-lg p-1 shadow-2xl"
                style={{ background: ADMIN.panel2, border: `1px solid ${ADMIN.borderHi}`, animation: 'dropdownFadeIn 0.13s ease-out' }}>
                {PREMADE_SECTIONS.map(ps => (
                  <button key={ps.key} onClick={() => addPremade(ps)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left border-none cursor-pointer text-[12px]"
                    style={{ background: 'transparent', color: ADMIN.text, transition: 'all 0.1s ease-out' }}
                    onMouseEnter={e => { e.currentTarget.style.background = ADMIN.row; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: SECTION_STYLES.find(s => s.key === ps.style)?.color || '#333' }} />
                    {ps.title}
                    <span className="ml-auto text-[9px]" style={{ color: ADMIN.textMute }}>{ps.fields.length} fields</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function CustomRecords() {
  const { state, dispatch } = useCAD();
  const { reportTemplates = [], recordTemplates = [] } = state;
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // { template, isReport }
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'report' | 'record'

  const allTemplates = [
    ...reportTemplates.map(t => ({ ...t, _kind: 'report' })),
    ...recordTemplates.map(t => ({ ...t, _kind: 'record' })),
  ].filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || (t.formCode || '').toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || t._kind === typeFilter;
    return matchSearch && matchType;
  });

  const createTemplate = (isReport) => {
    const blank = { id: `tpl_${Date.now()}`, name: '', formCode: '', category: '', agency: '', sections: [] };
    setEditing({ template: blank, isReport, isNew: true });
  };

  const duplicate = (tpl) => {
    const copy = { ...JSON.parse(JSON.stringify(tpl)), id: `tpl_${Date.now()}`, name: `${tpl.name} (Copy)` };
    const isReport = tpl._kind === 'report';
    if (isReport) dispatch({ type: 'ADD_REPORT_TEMPLATE', payload: copy });
    else dispatch({ type: 'ADD_RECORD_TEMPLATE', payload: copy });
  };

  const deleteTemplate = (tpl) => {
    if (!confirm(`Delete "${tpl.name}"? This cannot be undone.`)) return;
    if (tpl._kind === 'report') dispatch({ type: 'DELETE_REPORT_TEMPLATE', payload: tpl.id });
    else dispatch({ type: 'DELETE_RECORD_TEMPLATE', payload: tpl.id });
    if (editing?.template?.id === tpl.id) setEditing(null);
  };

  const saveTemplate = (draft) => {
    if (!draft.name.trim()) return alert('Template name is required.');
    const isReport = editing.isReport;
    if (editing.isNew) {
      if (isReport) dispatch({ type: 'ADD_REPORT_TEMPLATE', payload: draft });
      else dispatch({ type: 'ADD_RECORD_TEMPLATE', payload: draft });
    } else {
      if (isReport) dispatch({ type: 'UPDATE_REPORT_TEMPLATE', payload: draft });
      else dispatch({ type: 'UPDATE_RECORD_TEMPLATE', payload: draft });
    }
    setEditing(null);
  };

  if (editing) {
    return <TemplateBuilder template={editing.template} isReport={editing.isReport} onSave={saveTemplate} onClose={() => setEditing(null)} />;
  }

  return (
    <div className="p-3 md:p-[22px]" style={{ background: ADMIN.bg, minHeight: '100%' }}>
      <AdminPageTitle
        right={
          <div className="flex gap-2">
            <SonButton size="sm" onClick={() => createTemplate(true)}>
              <MdAdd size={15} /> New Report Template
            </SonButton>
            <SonButton variant="red" size="sm" onClick={() => createTemplate(false)}>
              <MdAdd size={15} /> New Record Template
            </SonButton>
          </div>
        }
      >
        Custom Records & Reports
      </AdminPageTitle>

      {/* Filters + search */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <SonSearch value={search} onChange={setSearch} placeholder="Search templates..." />
        <div className="flex gap-1">
          {[
            { key: 'all',    label: 'All' },
            { key: 'report', label: 'Reports' },
            { key: 'record', label: 'Records' },
          ].map(f => (
            <button key={f.key} onClick={() => setTypeFilter(f.key)}
              className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.4px] rounded-md cursor-pointer border-none transition-colors"
              style={{
                background: typeFilter === f.key ? ADMIN.red : ADMIN.panel2,
                color: typeFilter === f.key ? '#fff' : ADMIN.textDim,
              }}>
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-[11px] ml-auto" style={{ color: ADMIN.textMute }}>
          {allTemplates.length} template{allTemplates.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Template table */}
      <div className="rounded-lg overflow-x-auto" style={{ border: `1px solid ${ADMIN.border}` }}>
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr style={{ background: ADMIN.panel2 }}>
              {['Name', 'Type', 'Category', 'Form Code', 'Sections', 'Actions'].map((h, i) => (
                <th key={i} className="text-[11px] font-bold tracking-[0.5px] uppercase py-[11px] px-[14px] text-left whitespace-nowrap"
                  style={{ color: ADMIN.textDim, borderBottom: `1px solid ${ADMIN.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allTemplates.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[13px]" style={{ color: ADMIN.textMute, background: ADMIN.row }}>
                  {search ? 'No templates match your search.' : 'No templates yet. Create your first template above.'}
                </td>
              </tr>
            ) : allTemplates.map((t, i) => (
              <tr key={t.id}
                style={{ background: i % 2 ? ADMIN.rowAlt : ADMIN.row }}
                onMouseEnter={e => { e.currentTarget.style.background = ADMIN.panel2; }}
                onMouseLeave={e => { e.currentTarget.style.background = i % 2 ? ADMIN.rowAlt : ADMIN.row; }}
              >
                <td className="py-[10px] px-[14px]" style={{ borderBottom: `1px solid ${ADMIN.border}` }}>
                  <button onClick={() => setEditing({ template: { ...t }, isReport: t._kind === 'report', isNew: false })}
                    className="text-[13px] font-semibold cursor-pointer bg-transparent border-none p-0 text-left transition-colors"
                    style={{ color: ADMIN.text }}
                    onMouseEnter={e => { e.currentTarget.style.color = ADMIN.blue; }}
                    onMouseLeave={e => { e.currentTarget.style.color = ADMIN.text; }}>
                    {t.name || <span style={{ color: ADMIN.textMute, fontStyle: 'italic' }}>Untitled</span>}
                  </button>
                </td>
                <td className="py-[10px] px-[14px]" style={{ borderBottom: `1px solid ${ADMIN.border}` }}>
                  <SonBadge color={t._kind === 'report' ? ADMIN.blue : ADMIN.green}>
                    {t._kind === 'report' ? 'Report' : 'Record'}
                  </SonBadge>
                </td>
                <td className="py-[10px] px-[14px] text-[12px]" style={{ borderBottom: `1px solid ${ADMIN.border}`, color: ADMIN.textDim }}>
                  {t.category || <span style={{ color: ADMIN.textMute }}>*</span>}
                </td>
                <td className="py-[10px] px-[14px]" style={{ borderBottom: `1px solid ${ADMIN.border}` }}>
                  <span className="text-[11px] font-mono" style={{ color: ADMIN.textMute }}>{t.formCode || '*'}</span>
                </td>
                <td className="py-[10px] px-[14px] text-[12px]" style={{ borderBottom: `1px solid ${ADMIN.border}`, color: ADMIN.textDim }}>
                  {(t.sections || []).length} sections, {(t.sections || []).reduce((a, s) => a + (s.fields || []).length, 0)} fields
                </td>
                <td className="py-[10px] px-[14px]" style={{ borderBottom: `1px solid ${ADMIN.border}` }}>
                  <div className="flex gap-1.5">
                    <SonButton size="sm" onClick={() => setEditing({ template: { ...t }, isReport: t._kind === 'report', isNew: false })}>
                      Edit
                    </SonButton>
                    <SonIconBtn icon={MdContentCopy} onClick={() => duplicate(t)} title="Duplicate" />
                    <SonIconBtn icon={MdDelete} onClick={() => deleteTemplate(t)} danger title="Delete" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
