import { useState, useRef, useEffect } from 'react';
import { useCAD } from '../../../store/cadStore';
import ReportForm from '../../../components/ReportForm';
import { ADMIN } from '../AdminKit';
import {
  MdAdd, MdDelete, MdContentCopy, MdArrowUpward, MdArrowDownward,
  MdDescription, MdFolder, MdSearch, MdExpandMore, MdChevronRight,
  MdPerson, MdDirectionsCar, MdGavel, MdSave, MdLock,
  MdVisibility, MdLink, MdEdit, MdCheckCircle, MdStar,
} from 'react-icons/md';

/* ── uid generators ── */
const uid  = () => `f${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
const sid  = () => `s${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;

/* ── Field type catalog ── */
const FIELD_TYPES = [
  { type: 'text',            label: 'Text'          },
  { type: 'number',          label: 'Number'        },
  { type: 'textarea',        label: 'Text Area'     },
  { type: 'date',            label: 'Date'          },
  { type: 'datetime',        label: 'Date & Time'   },
  { type: 'dropdown',        label: 'Select'        },
  { type: 'checkbox',        label: 'Checkbox'      },
  { type: 'civilian_lookup', label: 'Civilian'      },
  { type: 'vehicle_lookup',  label: 'Vehicle'       },
  { type: 'badge_lookup',    label: 'Officer Badge' },
  { type: 'charges',         label: 'Charges'       },
  { type: 'image',           label: 'Image'         },
];

const TYPE_COLOR = {
  text: '#60a5fa', number: '#60a5fa', textarea: '#60a5fa',
  date: '#fb923c', datetime: '#fb923c',
  dropdown: '#34d399', checkbox: '#34d399',
  civilian_lookup: '#f97316', vehicle_lookup: '#f97316', badge_lookup: '#a78bfa',
  charges: '#f87171', image: '#22d3ee',
};

/* ── Premade sections matching template structure ── */
const PREMADE_SECTIONS = [
  { key: 'flags', label: 'FLAGS', make: () => ({
    id: sid(), title: 'Flags', style: 'gray',
    fields: [
      { id: uid(), label: 'Escape Risk', type: 'checkbox', span: 1 },
      { id: uid(), label: 'Armed',       type: 'checkbox', span: 1 },
      { id: uid(), label: 'Dangerous',   type: 'checkbox', span: 1 },
      { id: uid(), label: 'Felon',       type: 'checkbox', span: 1 },
    ],
  })},
  { key: 'civilian', label: 'CIVILIAN', make: () => ({
    id: sid(), title: 'Civilian Information', style: 'gray', lookup: 'civilian',
    fields: [
      { id: uid(), label: 'First Name',          type: 'civilian_lookup', span: 1 },
      { id: uid(), label: 'Last Name',           type: 'text',            span: 1 },
      { id: uid(), label: 'M.I.',                type: 'text',            span: 1 },
      { id: uid(), label: 'DOB',                 type: 'date',            span: 1 },
      { id: uid(), label: 'Age',                 type: 'number',          span: 1 },
      { id: uid(), label: 'Sex',                 type: 'dropdown',        span: 1, options: ['Male','Female','Other'] },
      { id: uid(), label: 'AKA / Former Names',  type: 'text',            span: 4 },
      { id: uid(), label: 'Residence',           type: 'text',            span: 2 },
      { id: uid(), label: 'Zip Code',            type: 'text',            span: 1 },
      { id: uid(), label: 'Occupation',          type: 'text',            span: 1 },
      { id: uid(), label: 'Height',              type: 'text',            span: 1 },
      { id: uid(), label: 'Weight',              type: 'text',            span: 1 },
      { id: uid(), label: 'Skin Tone',           type: 'dropdown',        span: 1, options: ['Light','Medium','Tan','Brown','Dark'] },
      { id: uid(), label: 'Hair Color',          type: 'dropdown',        span: 1, options: ['Black','Brown','Blonde','Red','Gray','White','Other'] },
      { id: uid(), label: 'Eye Color',           type: 'dropdown',        span: 1, options: ['Brown','Blue','Green','Hazel','Gray'] },
      { id: uid(), label: 'Emergency Contact',   type: 'text',            span: 2 },
      { id: uid(), label: 'Relationship',        type: 'text',            span: 1 },
      { id: uid(), label: 'Contact #',           type: 'text',            span: 1 },
    ],
  })},
  { key: 'vehicle', label: 'VEHICLE', make: () => ({
    id: sid(), title: 'Vehicle Information', style: 'gray', lookup: 'vehicle',
    fields: [
      { id: uid(), label: 'Vehicle Type', type: 'dropdown',       span: 1, options: ['Sedan','SUV','Truck','Motorcycle','Van','Bus','Other'] },
      { id: uid(), label: 'Plate',        type: 'vehicle_lookup', span: 1, mono: true },
      { id: uid(), label: 'Make',         type: 'text',           span: 1 },
      { id: uid(), label: 'Model',        type: 'text',           span: 1 },
      { id: uid(), label: 'Color',        type: 'text',           span: 1 },
      { id: uid(), label: 'Year',         type: 'number',         span: 1 },
    ],
  })},
  { key: 'charges', label: 'CHARGES', make: () => ({
    id: sid(), title: 'Charges', style: 'gray',
    fields: [
      { id: uid(), label: 'Charges', type: 'charges', span: 4 },
    ],
  })},
  { key: 'narrative', label: 'NARRATIVE', make: () => ({
    id: sid(), title: 'Narrative', style: 'gray',
    fields: [
      { id: uid(), label: 'Narrative', type: 'textarea', span: 4, minRows: 5 },
    ],
  })},
  { key: 'record_link', label: 'RECORD LINK', make: () => ({
    id: sid(), title: 'Linked Record', style: 'gray',
    fields: [
      { id: uid(), label: 'Linked Case #', type: 'text',     span: 2, mono: true },
      { id: uid(), label: 'Link Type',     type: 'dropdown', span: 2, options: ['Related','Continuation','Supplement','Reference'] },
    ],
  })},
  { key: 'supervisor', label: 'SUPERVISOR REVIEW', make: () => ({
    id: sid(), title: 'Report Review', style: 'gray', supervisorOnly: true,
    fields: [
      { id: uid(), label: 'Status',               type: 'dropdown', span: 1, supervisorOnly: true, options: ['Pending Review','Approved','Rejected','Pending Changes'] },
      { id: uid(), label: 'Observing Officer',    type: 'text',     span: 2 },
      { id: uid(), label: 'Review Date',          type: 'date',     span: 1, supervisorOnly: true },
      { id: uid(), label: 'Supervisor Signature', type: 'text',     span: 4, supervisorOnly: true },
    ],
  })},
];

/* ── Tiny inline button ── */
function IconBtn({ icon: Icon, onClick, title, active, activeColor = '#3d82f0', size = 13, bg, color }) {
  return (
    <button type="button" onClick={onClick} title={title}
      className="rounded flex items-center justify-center border-none cursor-pointer shrink-0 transition-all"
      style={{
        width: 22, height: 22,
        background: bg || (active ? `${activeColor}28` : 'rgba(255,255,255,0.05)'),
        color: color || (active ? activeColor : '#5d6f88'),
        border: `1px solid ${active ? activeColor + '50' : 'rgba(255,255,255,0.08)'}`,
      }}>
      <Icon size={size} />
    </button>
  );
}

/* ── Per-field row ── */
function FieldRow({ field, onUpdate, onDelete, onMoveUp, onMoveDown }) {
  const [showOpts, setShowOpts] = useState(false);
  const tc = TYPE_COLOR[field.type] || '#60a5fa';

  const tog = (prop) => onUpdate({ ...field, [prop]: !field[prop] });

  return (
    <div className="rounded-lg mb-1.5 overflow-hidden"
      style={{ border: `1px solid ${showOpts ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}` }}>

      {/* Main row */}
      <div className="flex items-center gap-1.5 px-2 py-1.5" style={{ background: '#0a1520' }}>

        {/* Type selector */}
        <select
          value={field.type}
          onChange={e => onUpdate({ ...field, type: e.target.value })}
          className="rounded-md text-[10.5px] font-bold border-none outline-none cursor-pointer shrink-0"
          style={{
            background: `${tc}18`, color: tc, padding: '3px 6px',
            border: `1px solid ${tc}44`, minWidth: 88,
            fontFamily: 'var(--font-ui)',
          }}
        >
          {FIELD_TYPES.map(ft => (
            <option key={ft.type} value={ft.type} style={{ background: '#0d1827', color: '#dde6f1' }}>
              {ft.label}
            </option>
          ))}
        </select>

        {/* Label */}
        <input
          className="flex-1 bg-transparent text-[12px] outline-none min-w-0 border-b border-transparent focus:border-white/20 transition-colors"
          style={{ color: '#dde6f1', fontFamily: 'var(--font-ui)' }}
          placeholder="Field Label"
          value={field.label || ''}
          onChange={e => onUpdate({ ...field, label: e.target.value })}
        />

        {/* Width slider */}
        <div className="flex items-center gap-1.5 shrink-0" style={{ width: 72 }}>
          <input
            type="range" min={1} max={4} step={1}
            value={field.span || 2}
            onChange={e => onUpdate({ ...field, span: Number(e.target.value) })}
            className="flex-1 cursor-pointer accent-brand"
            style={{ height: 4 }}
          />
          <span className="text-[10px] font-bold tabular-nums shrink-0" style={{ color: '#6b7280', minWidth: 14 }}>
            {field.span || 2}
          </span>
        </div>

        {/* Property toggles */}
        <div className="flex gap-0.5 shrink-0">
          <IconBtn icon={MdStar}        onClick={() => tog('required')}      active={!!field.required}       activeColor="#f59e0b" title="Required"        size={12} />
          <IconBtn icon={MdVisibility}  onClick={() => tog('readOnly')}      active={!!field.readOnly}       activeColor="#60a5fa" title="Read Only"       size={12} />
          <IconBtn icon={MdLock}        onClick={() => tog('supervisorOnly')}active={!!field.supervisorOnly} activeColor="#ef4444" title="Supervisor Only" size={12} />
          <IconBtn icon={MdSearch}      onClick={() => tog('showInLookup')}  active={!!field.showInLookup}   activeColor="#22c55e" title="Show in Lookup"  size={12} />
          <IconBtn icon={MdLink}        onClick={() => tog('unique')}        active={!!field.unique}         activeColor="#a78bfa" title="Unique"          size={12} />
        </div>

        {/* Opts toggle (all types) */}
        <button type="button" onClick={() => setShowOpts(o => !o)}
          className="px-2 py-0.5 rounded text-[9.5px] font-bold border-none cursor-pointer shrink-0 transition-colors"
          style={{
            background: showOpts ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)',
            color: showOpts ? '#34d399' : '#4a5568',
            border: `1px solid ${showOpts ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.09)'}`,
          }}>
          OPTS
        </button>

        {/* Reorder + delete */}
        <div className="flex gap-0.5 shrink-0">
          <IconBtn icon={MdArrowUpward}   onClick={onMoveUp}   title="Move up"   size={12} />
          <IconBtn icon={MdArrowDownward} onClick={onMoveDown} title="Move down" size={12} />
          <IconBtn icon={MdDelete}        onClick={onDelete}   title="Remove"    size={12}
            bg="rgba(239,68,68,0.14)" color="#ef4444" />
        </div>
      </div>

      {/* Opts expansion: placeholder + dropdown options */}
      {showOpts && (
        <div className="px-2.5 pt-2 pb-2.5"
          style={{ background: 'rgba(52,211,153,0.04)', borderTop: '1px solid rgba(52,211,153,0.14)' }}>
          <div className="mb-2">
            <div className="text-[8.5px] font-bold uppercase tracking-[0.5px] mb-1" style={{ color: '#34d399' }}>Placeholder Text</div>
            <input
              style={{
                width: '100%', background: '#080f1a', border: '1px solid rgba(52,211,153,0.2)',
                borderRadius: 6, color: '#dde6f1', padding: '6px 10px', fontSize: 11.5,
                fontFamily: 'var(--font-ui)', boxSizing: 'border-box', outline: 'none',
              }}
              placeholder="e.g. Enter value…"
              value={field.placeholder || ''}
              onChange={e => onUpdate({ ...field, placeholder: e.target.value })}
            />
          </div>
          {field.type === 'dropdown' && (
            <div>
              <div className="text-[8.5px] font-bold uppercase tracking-[0.5px] mb-1" style={{ color: '#34d399' }}>Options (one per line)</div>
              <textarea
                style={{
                  width: '100%', background: '#080f1a', border: '1px solid rgba(52,211,153,0.2)',
                  borderRadius: 6, color: '#dde6f1', padding: '7px 10px', fontSize: 11.5,
                  fontFamily: 'var(--font-ui)', boxSizing: 'border-box', outline: 'none',
                  resize: 'vertical', minHeight: 60,
                }}
                value={(field.options || []).join('\n')}
                onChange={e => onUpdate({ ...field, options: e.target.value.split('\n') })}
                placeholder={'Option 1\nOption 2\nOption 3'}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Section block ── */
function SectionBlock({ section, onUpdate, onDelete, onMoveUp, onMoveDown }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    if (!showAddField) return;
    const fn = (e) => { if (!dropRef.current?.contains(e.target)) setShowAddField(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [showAddField]);

  const up = (patch) => onUpdate({ ...section, ...patch });

  const addField = (type) => {
    const span = type === 'charges' || type === 'textarea' ? 4 : type === 'checkbox' ? 1 : 2;
    up({ fields: [...(section.fields || []), { id: uid(), label: '', type, span }] });
    setShowAddField(false);
  };

  const updateField = (idx, f) => {
    const fields = [...(section.fields || [])];
    fields[idx] = f;
    up({ fields });
  };

  const deleteField   = (idx) => up({ fields: (section.fields || []).filter((_, i) => i !== idx) });
  const moveField     = (idx, dir) => {
    const fields = [...(section.fields || [])];
    const j = idx + dir;
    if (j < 0 || j >= fields.length) return;
    [fields[idx], fields[j]] = [fields[j], fields[idx]];
    up({ fields });
  };

  const toggleLookup  = (kind) => up({ lookup: section.lookup === kind ? undefined : kind });
  const isSupOnly     = !!section.supervisorOnly;

  return (
    <div className="mb-2.5 rounded-xl overflow-hidden"
      style={{ border: `1px solid ${isSupOnly ? 'rgba(239,68,68,0.28)' : 'rgba(255,255,255,0.09)'}` }}>

      {/* Section header */}
      <div className="flex items-center gap-1.5 px-2 py-2"
        style={{ background: isSupOnly ? 'rgba(239,68,68,0.10)' : '#0f1c31' }}>

        {/* Delete */}
        <button type="button" onClick={onDelete} title="Delete section"
          className="shrink-0 rounded flex items-center justify-center border-none cursor-pointer"
          style={{ width: 26, height: 26, background: 'rgba(239,68,68,0.18)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
          <MdDelete size={13} />
        </button>

        {/* Add field dropdown */}
        <div ref={dropRef} className="relative shrink-0">
          <button type="button" onClick={() => setShowAddField(o => !o)} title="Add field"
            className="rounded flex items-center justify-center border-none cursor-pointer"
            style={{ width: 26, height: 26, background: 'rgba(20,184,166,0.18)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.28)' }}>
            <MdAdd size={14} />
          </button>
          {showAddField && (
            <div className="absolute top-full left-0 mt-1 z-[300] rounded-xl p-1.5 shadow-2xl min-w-[200px] grid grid-cols-2 gap-0.5"
              style={{ background: '#0d1827', border: '1px solid rgba(255,255,255,0.14)', animation: 'dropdownFadeIn 0.12s ease-out' }}>
              {FIELD_TYPES.map(ft => (
                <button key={ft.type} type="button" onClick={() => addField(ft.type)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left border-none cursor-pointer text-[11px] font-semibold transition-colors"
                  style={{ background: 'transparent', color: TYPE_COLOR[ft.type] || '#93a4bd' }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${TYPE_COLOR[ft.type]}14`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  {ft.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Civilian / vehicle lookup toggles */}
        <IconBtn icon={MdPerson}       onClick={() => toggleLookup('civilian')} active={section.lookup === 'civilian'} activeColor="#f97316" title="Civilian lookup" />
        <IconBtn icon={MdDirectionsCar}onClick={() => toggleLookup('vehicle')}  active={section.lookup === 'vehicle'}  activeColor="#f97316" title="Vehicle lookup"  />

        {/* Supervisor-only toggle */}
        <IconBtn icon={MdLock} onClick={() => up({ supervisorOnly: !isSupOnly })} active={isSupOnly} activeColor="#ef4444" title="Supervisor only" />

        {/* Section title */}
        <input
          className="flex-1 bg-transparent text-[12.5px] font-bold outline-none min-w-0 border-b border-transparent focus:border-white/20 transition-colors"
          style={{ color: isSupOnly ? '#fca5a5' : '#dde6f1', fontFamily: 'var(--font-ui)' }}
          value={section.title || ''}
          onChange={e => up({ title: e.target.value })}
          placeholder="Section Title"
        />

        {/* Move + collapse */}
        <IconBtn icon={MdArrowUpward}   onClick={onMoveUp}                title="Move up"   size={12} />
        <IconBtn icon={MdArrowDownward} onClick={onMoveDown}              title="Move down" size={12} />
        <IconBtn icon={collapsed ? MdChevronRight : MdExpandMore}
          onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand' : 'Collapse'} size={14} />
      </div>

      {/* Fields */}
      {!collapsed && (
        <div className="px-2.5 pt-1.5 pb-2" style={{ background: '#080f1a' }}>
          {(section.fields || []).map((f, idx) => (
            <FieldRow key={f.id}
              field={f}
              onUpdate={u => updateField(idx, u)}
              onDelete={() => deleteField(idx)}
              onMoveUp={() => moveField(idx, -1)}
              onMoveDown={() => moveField(idx, 1)}
            />
          ))}
          {(section.fields || []).length === 0 && (
            <div className="py-3 text-center text-[11px]" style={{ color: '#2d3f52' }}>
              Click + to add a field to this section
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Live preview panel (right side) ── */
function PreviewPanel({ draft }) {
  const lookupCols = (draft?.sections || []).flatMap(s =>
    (s.fields || []).filter(f => f.showInLookup).map(f => f.label)
  );

  return (
    <div className="flex flex-col h-full overflow-hidden"
      style={{ background: '#08111d', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>

      {/* Header */}
      <div className="shrink-0 px-4 py-2.5"
        style={{ background: '#0b1627', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="text-[8.5px] font-bold uppercase tracking-[0.7px] mb-0.5" style={{ color: '#3d5470' }}>
          Lookup Preview
        </div>
        <div className="text-[13px] font-bold" style={{ color: '#ef4444' }}>
          {draft?.name?.toUpperCase() || 'UNTITLED'}
        </div>
      </div>

      {/* Lookup column chips */}
      {lookupCols.length > 0 && (
        <div className="shrink-0 flex flex-wrap gap-1 px-3 py-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#0a1422' }}>
          {lookupCols.map((l, i) => (
            <span key={i} className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-[0.4px]"
              style={{ background: 'rgba(61,130,240,0.14)', color: '#3d82f0', border: '1px solid rgba(61,130,240,0.24)' }}>
              {l}
            </span>
          ))}
        </div>
      )}

      {/* Record preview label */}
      <div className="shrink-0 px-4 py-1.5"
        style={{ background: '#0b1627', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="text-[8.5px] font-bold uppercase tracking-[0.6px] mb-0.5" style={{ color: '#3d5470' }}>
          Record Preview
        </div>
        <div className="text-[11px] font-bold" style={{ color: '#ef4444' }}>
          {draft?.name?.toUpperCase() || 'UNTITLED'}
        </div>
      </div>

      {/* Form preview */}
      <div className="flex-1 overflow-y-auto p-3">
        {!draft || (draft.sections || []).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-3" style={{ color: '#2d3f52' }}>
            <MdDescription size={36} style={{ opacity: 0.25 }} />
            <div className="text-[11.5px]">Add sections to see the live preview</div>
          </div>
        ) : (
          <ReportForm template={draft} data={{}} readOnly />
        )}
      </div>
    </div>
  );
}

/* ── Left panel: existing record list ── */
function RecordListPanel({ templates, selectedId, onSelect, onCreate, onDuplicate, onDelete, typeFilter, onTypeFilter }) {
  const [search, setSearch] = useState('');
  const filtered = templates.filter(t => {
    const q = search.toLowerCase();
    return (!q || t.name.toLowerCase().includes(q) || (t.formCode || '').toLowerCase().includes(q)) &&
      (typeFilter === 'all' || t._kind === typeFilter);
  });

  return (
    <div className="flex flex-col h-full overflow-hidden"
      style={{ background: '#08111d', borderRight: '1px solid rgba(255,255,255,0.08)' }}>

      {/* Header */}
      <div className="shrink-0 px-3 pt-3 pb-2"
        style={{ background: '#0b1627', borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
        <div className="text-[9px] font-bold uppercase tracking-[0.7px] mb-2" style={{ color: '#3d5470' }}>
          Existing Custom Record Types
        </div>
        <input
          className="w-full rounded-lg text-[11.5px] outline-none"
          style={{
            background: '#080f1a', border: '1px solid rgba(255,255,255,0.09)',
            padding: '6px 10px', color: '#dde6f1', fontFamily: 'var(--font-ui)',
          }}
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-1 mt-2">
          {[['all','All'],['report','Reports'],['record','Records']].map(([k,l]) => (
            <button key={k} type="button" onClick={() => onTypeFilter(k)}
              className="flex-1 py-1 rounded text-[9.5px] font-bold uppercase tracking-[0.4px] border-none cursor-pointer transition-colors"
              style={{
                background: typeFilter === k ? 'rgba(61,130,240,0.22)' : 'rgba(255,255,255,0.04)',
                color: typeFilter === k ? '#3d82f0' : '#4a5568',
              }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-[11px]" style={{ color: '#2d3f52' }}>
            {search ? 'No matches' : 'No templates yet'}
          </div>
        ) : filtered.map((t, i) => (
          <div key={t.id}
            onClick={() => onSelect(t)}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer"
            style={{
              background: selectedId === t.id ? 'rgba(61,130,240,0.10)' : i % 2 ? '#0a1422' : '#08111d',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              borderLeft: `2px solid ${selectedId === t.id ? '#3d82f0' : 'transparent'}`,
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => { if (selectedId !== t.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { if (selectedId !== t.id) e.currentTarget.style.background = i % 2 ? '#0a1422' : '#08111d'; }}
          >
            {t._kind === 'report'
              ? <MdDescription size={13} style={{ color: '#3d82f0', flexShrink: 0 }} />
              : <MdFolder       size={13} style={{ color: '#22c55e', flexShrink: 0 }} />
            }
            <div className="flex-1 min-w-0">
              <div className="text-[11.5px] font-semibold truncate" style={{ color: '#c8d5e8' }}>
                {t.name || <span style={{ color: '#3d5470', fontStyle: 'italic' }}>Untitled</span>}
              </div>
              <div className="text-[9.5px] truncate" style={{ color: '#3d5470' }}>
                {t._kind === 'report' ? 'Police Report' : 'Police Record'} · {(t.sections || []).length} sections
              </div>
            </div>
            <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
              <button type="button" onClick={() => onDelete(t)} title="Delete"
                className="rounded flex items-center justify-center border-none cursor-pointer"
                style={{ width: 22, height: 22, background: 'rgba(239,68,68,0.14)', color: '#ef4444' }}>
                <MdDelete size={11} />
              </button>
              <button type="button" onClick={() => onDuplicate(t)} title="Duplicate"
                className="rounded flex items-center justify-center border-none cursor-pointer"
                style={{ width: 22, height: 22, background: 'rgba(61,130,240,0.14)', color: '#3d82f0' }}>
                <MdContentCopy size={11} />
              </button>
              <button type="button" onClick={() => onSelect(t)} title="Edit"
                className="rounded flex items-center justify-center border-none cursor-pointer"
                style={{ width: 22, height: 22, background: 'rgba(245,158,11,0.14)', color: '#f59e0b' }}>
                <MdEdit size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New buttons */}
      <div className="shrink-0 px-2.5 py-2.5 flex gap-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#0b1627' }}>
        <button type="button" onClick={() => onCreate(true)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-bold border-none cursor-pointer"
          style={{ background: 'rgba(61,130,240,0.18)', color: '#3d82f0', border: '1px solid rgba(61,130,240,0.28)' }}>
          <MdAdd size={13} /> Report
        </button>
        <button type="button" onClick={() => onCreate(false)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-bold border-none cursor-pointer"
          style={{ background: 'rgba(34,197,94,0.14)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.24)' }}>
          <MdAdd size={13} /> Record
        </button>
      </div>
    </div>
  );
}

/* ── Center: template editor ── */
function TemplateEditor({ draft, onChange, isReport, isNew, onSave, onClose }) {
  const [showPremade, setShowPremade]   = useState(false);
  const [saved, setSaved]               = useState(false);
  const premadeRef = useRef(null);

  useEffect(() => {
    if (!showPremade) return;
    const fn = (e) => { if (!premadeRef.current?.contains(e.target)) setShowPremade(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [showPremade]);

  const up = (patch) => onChange({ ...draft, ...patch });

  const addSection = () => {
    onChange({ ...draft, sections: [...(draft.sections || []), { id: sid(), title: 'New Section', style: 'gray', fields: [] }] });
  };

  const addPremade = (ps) => {
    onChange({ ...draft, sections: [...(draft.sections || []), ps.make()] });
    setShowPremade(false);
  };

  const updateSection = (idx, sec) => {
    const sections = [...(draft.sections || [])];
    sections[idx] = sec;
    onChange({ ...draft, sections });
  };

  const deleteSection = (idx) =>
    onChange({ ...draft, sections: (draft.sections || []).filter((_, i) => i !== idx) });

  const moveSection = (idx, dir) => {
    const sections = [...(draft.sections || [])];
    const j = idx + dir;
    if (j < 0 || j >= sections.length) return;
    [sections[idx], sections[j]] = [sections[j], sections[idx]];
    onChange({ ...draft, sections });
  };

  const handleSave = () => {
    if (!draft.name?.trim()) { alert('Template name is required.'); return; }
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#0b1424' }}>

      {/* Toolbar */}
      <div className="shrink-0 flex items-center gap-2.5 px-4 py-2.5"
        style={{ background: '#0d1930', borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
        <div className="flex-1 min-w-0">
          <div className="text-[8.5px] font-bold uppercase tracking-[0.7px] mb-1" style={{ color: '#3d5470' }}>
            {isReport ? 'Report' : 'Record'} Builder · {isNew ? 'NEW' : 'EDITING'}
          </div>
          <input
            className="text-[14px] font-bold bg-transparent border-b outline-none w-full transition-colors"
            style={{ color: '#e2eaf8', borderColor: 'rgba(255,255,255,0.13)', paddingBottom: 2, fontFamily: 'var(--font-ui)' }}
            placeholder="Record Type Name"
            value={draft.name || ''}
            onChange={e => up({ name: e.target.value })}
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#6b7280' }}>
            Cancel
          </button>
          <button type="button" onClick={handleSave}
            className="px-3 py-1.5 rounded-lg text-[11.5px] font-bold border-none cursor-pointer flex items-center gap-1.5"
            style={{
              background: saved ? 'rgba(34,197,94,0.2)' : 'rgba(61,130,240,0.22)',
              color: saved ? '#22c55e' : '#3d82f0',
              border: `1px solid ${saved ? 'rgba(34,197,94,0.4)' : 'rgba(61,130,240,0.38)'}`,
            }}>
            {saved ? <><MdCheckCircle size={13} /> Saved!</> : <><MdSave size={13} /> Save</>}
          </button>
        </div>
      </div>

      {/* Meta (form code + agency) */}
      <div className="shrink-0 px-4 py-2 grid grid-cols-2 gap-3"
        style={{ background: '#0a1520', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <div className="text-[8.5px] font-bold uppercase tracking-[0.5px] mb-1" style={{ color: '#3d5470' }}>Form Code</div>
          <input
            className="w-full rounded-lg text-[12px] outline-none"
            style={{ background: '#070e1c', border: '1px solid rgba(255,255,255,0.08)', padding: '5px 10px', color: '#dde6f1', fontFamily: 'var(--font-ui)' }}
            placeholder="e.g. TPD-ARR-001"
            value={draft.formCode || ''}
            onChange={e => up({ formCode: e.target.value })}
          />
        </div>
        <div>
          <div className="text-[8.5px] font-bold uppercase tracking-[0.5px] mb-1" style={{ color: '#3d5470' }}>Agency</div>
          <input
            className="w-full rounded-lg text-[12px] outline-none"
            style={{ background: '#070e1c', border: '1px solid rgba(255,255,255,0.08)', padding: '5px 10px', color: '#dde6f1', fontFamily: 'var(--font-ui)' }}
            placeholder="e.g. Tampa Police Dept."
            value={draft.agency || ''}
            onChange={e => up({ agency: e.target.value })}
          />
        </div>
      </div>

      {/* Sections (scrollable body) */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {(draft.sections || []).length === 0 && (
          <div className="py-10 text-center" style={{ color: '#2d3f52' }}>
            <MdDescription size={34} style={{ opacity: 0.18, margin: '0 auto 8px' }} />
            <div className="text-[12px]">No sections yet — add a custom or premade section below</div>
          </div>
        )}

        {(draft.sections || []).map((sec, idx) => (
          <SectionBlock key={sec.id}
            section={sec}
            onUpdate={u => updateSection(idx, u)}
            onDelete={() => deleteSection(idx)}
            onMoveUp={() => moveSection(idx, -1)}
            onMoveDown={() => moveSection(idx, 1)}
          />
        ))}

        {/* Add section row */}
        <div className="flex gap-2 mt-2 flex-wrap">
          <button type="button" onClick={addSection}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11.5px] font-bold border-none cursor-pointer transition-colors"
            style={{ background: 'rgba(20,184,166,0.14)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.24)' }}>
            <MdAdd size={15} /> ADD CUSTOM SECTION
          </button>

          <div ref={premadeRef} className="relative">
            <button type="button" onClick={() => setShowPremade(o => !o)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11.5px] font-bold border-none cursor-pointer transition-colors"
              style={{ background: 'rgba(249,115,22,0.14)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.24)' }}>
              <MdAdd size={15} /> ADD PREMADE SECTION <MdExpandMore size={14} />
            </button>
            {showPremade && (
              <div className="absolute bottom-full left-0 mb-1 z-[200] rounded-xl py-1.5 shadow-2xl min-w-[210px]"
                style={{ background: '#0d1827', border: '1px solid rgba(255,255,255,0.14)', animation: 'dropdownFadeIn 0.12s ease-out' }}>
                {PREMADE_SECTIONS.map(ps => (
                  <button key={ps.key} type="button" onClick={() => addPremade(ps)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left border-none cursor-pointer text-[11.5px] font-bold uppercase tracking-[0.4px] transition-colors"
                    style={{ background: 'transparent', color: '#fb923c' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.10)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                    {ps.label}
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

/* ── Main ── */
export default function CustomRecords() {
  const { state, dispatch } = useCAD();
  const { reportTemplates = [], recordTemplates = [] } = state;

  const [typeFilter, setTypeFilter]       = useState('all');
  const [draft, setDraft]                 = useState(null);
  const [editingMeta, setEditingMeta]     = useState(null); // { id, isReport, isNew }

  const allTemplates = [
    ...reportTemplates.map(t => ({ ...t, _kind: 'report' })),
    ...recordTemplates.map(t => ({ ...t, _kind: 'record' })),
  ];

  const selectTemplate = (t) => {
    setDraft(JSON.parse(JSON.stringify(t)));
    setEditingMeta({ id: t.id, isReport: t._kind === 'report', isNew: false });
  };

  const createTemplate = (isReport) => {
    const blank = { id: `tpl_${Date.now()}`, name: '', formCode: '', agency: '', sections: [] };
    setDraft(blank);
    setEditingMeta({ id: blank.id, isReport, isNew: true });
  };

  const saveTemplate = () => {
    if (!draft?.name?.trim()) { alert('Template name is required.'); return; }
    const { isReport, isNew } = editingMeta;
    const payload = { ...draft };
    delete payload._kind;
    if (isNew) {
      dispatch({ type: isReport ? 'ADD_REPORT_TEMPLATE' : 'ADD_RECORD_TEMPLATE', payload });
      setEditingMeta(prev => ({ ...prev, isNew: false }));
    } else {
      dispatch({ type: isReport ? 'UPDATE_REPORT_TEMPLATE' : 'UPDATE_RECORD_TEMPLATE', payload });
    }
  };

  const deleteTemplate = (tpl) => {
    if (!confirm(`Delete "${tpl.name}"?`)) return;
    dispatch({ type: tpl._kind === 'report' ? 'DELETE_REPORT_TEMPLATE' : 'DELETE_RECORD_TEMPLATE', payload: tpl.id });
    if (editingMeta?.id === tpl.id) { setDraft(null); setEditingMeta(null); }
  };

  const duplicateTemplate = (tpl) => {
    const copy = { ...JSON.parse(JSON.stringify(tpl)), id: `tpl_${Date.now()}`, name: `${tpl.name} (Copy)` };
    delete copy._kind;
    dispatch({ type: tpl._kind === 'report' ? 'ADD_REPORT_TEMPLATE' : 'ADD_RECORD_TEMPLATE', payload: copy });
  };

  return (
    /* Negate AdminContent's p-6 padding so the builder is flush */
    <div className="-m-3 md:-m-6 flex overflow-hidden font-ui"
      style={{ height: 'calc(100vh - 56px)', background: '#08111d' }}>

      {/* Left: record list (260px fixed) */}
      <div className="shrink-0 flex flex-col" style={{ width: 260 }}>
        <RecordListPanel
          templates={allTemplates}
          selectedId={editingMeta?.id}
          onSelect={selectTemplate}
          onCreate={createTemplate}
          onDuplicate={duplicateTemplate}
          onDelete={deleteTemplate}
          typeFilter={typeFilter}
          onTypeFilter={setTypeFilter}
        />
      </div>

      {/* Right: editor + preview (or empty state) */}
      {draft ? (
        <div className="flex-1 min-w-0 grid overflow-hidden" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <TemplateEditor
            key={editingMeta.id}
            draft={draft}
            onChange={setDraft}
            isReport={editingMeta.isReport}
            isNew={editingMeta.isNew}
            onSave={saveTemplate}
            onClose={() => { setDraft(null); setEditingMeta(null); }}
          />
          <PreviewPanel draft={draft} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3"
          style={{ color: '#2d3f52' }}>
          <MdEdit size={44} style={{ opacity: 0.18 }} />
          <div className="text-[14px] font-semibold" style={{ color: '#3d5470' }}>Select a record type to edit</div>
          <div className="text-[11px]">or create a new Report / Record using the buttons on the left</div>
        </div>
      )}
    </div>
  );
}
