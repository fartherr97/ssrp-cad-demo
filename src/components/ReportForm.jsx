/* Dark, app-themed renderer for report/record templates.
   Renders a template's sections + fields as native form controls that match
   the rest of the CAD UI. Lookup fields (civilian / vehicle / officer) search
   live data and auto-fill the rest of their section, Sonoran-style. */

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdSearch, MdPerson, MdDirectionsCar, MdShield, MdGavel, MdAdd, MdClose } from 'react-icons/md';
import { useCAD } from '../store/cadStore';
import { S_INPUT, S_SELECT, S_TEXTAREA } from '../constants/styles';
import { FlagRow } from './CivilianFlags';

// Static span classes so Tailwind JIT picks them up.
const SPAN = {
  1: 'lg:col-span-1',
  2: 'sm:col-span-2 lg:col-span-2',
  3: 'sm:col-span-2 lg:col-span-3',
  4: 'sm:col-span-2 lg:col-span-4',
};
const FULL = 'sm:col-span-2 lg:col-span-4';

const inputType = (t) =>
  t === 'datetime' ? 'datetime-local' : t === 'date' ? 'date' : t === 'number' ? 'number' : 'text';

const LOOKUP_KIND = {
  civilian_lookup: 'civilian',
  vehicle_lookup: 'vehicle',
  badge_lookup: 'officer',
};

/* ── Search a dataset for the lookup dropdown ── */
function searchData(kind, q, state) {
  const s = (q || '').trim().toLowerCase();
  if (!s) return [];
  if (kind === 'civilian') {
    return (state.civilians || []).filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(s) ||
      c.ssn?.includes(s) || c.dlNumber?.toLowerCase().includes(s) || c.phone?.includes(s)
    ).slice(0, 8);
  }
  if (kind === 'vehicle') {
    return (state.vehicles || []).filter(v =>
      v.plate?.toLowerCase().includes(s) ||
      `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(s)
    ).slice(0, 8);
  }
  // officer
  return (state.officers || []).filter(o =>
    o.name?.toLowerCase().includes(s) || String(o.badge || '').includes(s) ||
    o.unitId?.toLowerCase().includes(s)
  ).slice(0, 8);
}

/* ── Map a picked record onto the section's fields by label ── */
function buildAutofill(kind, rec, fields, civilians) {
  const out = {};
  const has = (L, ...keys) => keys.some(k => L.includes(k));
  for (const f of fields) {
    const L = (f.label || '').toLowerCase();
    if (kind === 'civilian') {
      if (has(L, 'business')) continue;
      if (has(L, 'name', 'holder', 'subject', 'driver', 'arrestee', 'party', 'person')) out[f.id] = `${rec.firstName} ${rec.lastName}`;
      else if (has(L, 'dob', 'birth')) out[f.id] = rec.dob;
      else if (has(L, 'residence', 'address')) out[f.id] = rec.address;
      else if (has(L, 'license number', 'dl number', 'dl #', 'driver license', 'license #')) out[f.id] = rec.dlNumber;
      else if (has(L, 'dl class', 'license class')) out[f.id] = rec.dlClass;
      else if (has(L, 'ssn')) out[f.id] = rec.ssn;
      else if (has(L, 'phone')) out[f.id] = rec.phone;
      else if (has(L, 'gender', 'sex')) out[f.id] = rec.gender;
      else if (has(L, 'race', 'ethnic')) out[f.id] = rec.ethnicity;
      else if (has(L, 'height')) out[f.id] = rec.height;
      else if (has(L, 'weight')) out[f.id] = rec.weight;
      else if (has(L, 'hair')) out[f.id] = rec.hair;
      else if (has(L, 'eye')) out[f.id] = rec.eyes;
    } else if (kind === 'vehicle') {
      if (has(L, 'plate', 'tag')) out[f.id] = rec.plate;
      else if (has(L, 'make')) out[f.id] = rec.make;
      else if (has(L, 'model')) out[f.id] = rec.model;
      else if (has(L, 'year')) out[f.id] = String(rec.year || '');
      else if (has(L, 'color', 'colour')) out[f.id] = rec.color;
      else if (has(L, 'vin')) out[f.id] = rec.vin || '';
      else if (has(L, 'registration', 'reg ')) out[f.id] = rec.regStatus;
      else if (has(L, 'owner')) {
        const o = (civilians || []).find(c => c.id === rec.ownerId);
        if (o) out[f.id] = `${o.firstName} ${o.lastName}`;
      }
    } else if (kind === 'officer') {
      if (has(L, 'badge')) out[f.id] = String(rec.badge || '');
      else if (has(L, 'rank')) out[f.id] = rec.rank;
      else if (has(L, 'unit')) out[f.id] = rec.unitId;
      else if (has(L, 'officer', 'author', 'reporting', 'name', 'supervisor', 'deputy', 'trooper')) out[f.id] = rec.name;
      else if (has(L, 'department', 'agency')) out[f.id] = rec.deptShort;
    }
  }
  return out;
}

function LookupField({ f, kind, value, data, sectionFields, onChange, onBulk }) {
  const { state } = useCAD();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const ref = useRef(null);
  const boxRef = useRef(null);

  // A civilian already chosen in this section (used to scope vehicle results).
  const sectionCiv = (() => {
    const cf = sectionFields.find(ff => ff.type === 'civilian_lookup');
    const val = (data?.[cf?.id] || '').trim().toLowerCase();
    if (!val) return null;
    return (state.civilians || []).find(c => `${c.firstName} ${c.lastName}`.toLowerCase() === val) || null;
  })();

  // Build results — vehicle lookup is scoped to the section's civilian when one
  // is selected (their registered vehicles first), but still allows any plate.
  let results = [];
  let ownerIds = new Set();
  if (open) {
    if (kind === 'vehicle') {
      const all = state.vehicles || [];
      const q = (value || '').trim().toLowerCase();
      const ownerVeh = sectionCiv ? all.filter(v => v.ownerId === sectionCiv.id) : [];
      ownerIds = new Set(ownerVeh.map(v => v.id));
      const match = (v) => v.plate?.toLowerCase().includes(q) || `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(q);
      if (!q) {
        results = (ownerVeh.length ? ownerVeh : all).slice(0, 8);
      } else {
        const ownerM = ownerVeh.filter(match);
        const globalM = searchData('vehicle', value, state).filter(v => !ownerIds.has(v.id));
        results = [...ownerM, ...globalM].slice(0, 8);
      }
    } else {
      results = searchData(kind, value, state);
    }
  }

  const place = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setCoords({ left: r.left, top: r.bottom + 4, width: r.width });
    }
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (!ref.current?.contains(e.target) && !boxRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const pick = (rec) => {
    let updates;
    if (kind === 'vehicle') {
      updates = buildAutofill('vehicle', rec, sectionFields, state.civilians);
      // Back-fill the registered owner into the section's person fields.
      const owner = (state.civilians || []).find(c => c.id === rec.ownerId);
      if (owner) updates = { ...buildAutofill('civilian', owner, sectionFields, state.civilians), ...updates };
      updates[f.id] = rec.plate;
    } else if (kind === 'civilian') {
      updates = buildAutofill('civilian', rec, sectionFields, state.civilians);
      updates[f.id] = `${rec.firstName} ${rec.lastName}`;
    } else {
      updates = buildAutofill('officer', rec, sectionFields, state.civilians);
      updates[f.id] = String(rec.badge || rec.name);
    }
    onBulk ? onBulk(updates) : Object.entries(updates).forEach(([k, v]) => onChange(k, v));
    setOpen(false);
  };

  const KindIcon = kind === 'civilian' ? MdPerson : kind === 'vehicle' ? MdDirectionsCar : MdShield;
  const placeholder = kind === 'civilian' ? 'Search person…'
    : kind === 'vehicle' ? (sectionCiv ? `Search ${sectionCiv.firstName}'s vehicles or any plate…` : 'Search plate / vehicle…')
    : 'Search officer / badge…';

  return (
    <>
      <div ref={ref} className="relative">
        <MdSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-bright pointer-events-none" />
        <input
          className={`${S_INPUT} pl-9 pr-3`}
          placeholder={placeholder}
          value={value || ''}
          onChange={e => { onChange(f.id, e.target.value); place(); setOpen(true); }}
          onFocus={() => { place(); setOpen(true); }}
        />
      </div>
      {open && results.length > 0 && coords && createPortal(
        <div ref={boxRef}
          className="fixed z-[3000] bg-app-card border border-border-strong shadow-2xl shadow-black/60 rounded-xl p-1.5 max-h-[280px] overflow-auto"
          style={{ left: coords.left, top: coords.top, width: Math.max(coords.width, 240), animation: 'dropdownFadeIn 0.12s ease-out' }}>
          {results.map(rec => (
            <button key={rec.id} type="button" onMouseDown={(e) => { e.preventDefault(); pick(rec); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left cursor-pointer transition-colors hover:bg-white/[0.07]">
              <KindIcon size={16} className="text-slate-500 shrink-0" />
              <div className="min-w-0">
                {kind === 'civilian' && (<>
                  <div className="text-[12.5px] font-semibold text-white truncate">{rec.firstName} {rec.lastName}</div>
                  <div className="text-[10.5px] text-slate-500 font-mono">DOB {rec.dob} · DL {rec.dlNumber}</div>
                  {(rec.flags?.length > 0) && <div className="mt-0.5"><FlagRow flags={rec.flags} /></div>}
                </>)}
                {kind === 'vehicle' && (<>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12.5px] font-semibold text-white truncate font-mono">{rec.plate}</span>
                    {ownerIds.has(rec.id) && <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[8px] font-bold tracking-[0.4px]">REGISTERED</span>}
                  </div>
                  <div className="text-[10.5px] text-slate-500">{rec.year} {rec.make} {rec.model} · {rec.color}</div>
                </>)}
                {kind === 'officer' && (<>
                  <div className="text-[12.5px] font-semibold text-white truncate">{rec.name}</div>
                  <div className="text-[10.5px] text-slate-500 font-mono">#{rec.badge} · {rec.deptShort}{rec.unitId ? ` · ${rec.unitId}` : ''}</div>
                </>)}
              </div>
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

/* ── Charge type badge colours ── */
const CHARGE_TYPE_STYLE = {
  Felony:     { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', border: 'rgba(239,68,68,0.35)' },
  Misdemeanor:{ bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24', border: 'rgba(245,158,11,0.35)' },
  Infraction: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: 'rgba(148,163,184,0.25)' },
};

function ChargesField({ f, value, onChange, readOnly }) {
  const { state } = useCAD();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const ref = useRef(null);
  const boxRef = useRef(null);

  const charges = Array.isArray(value) ? value : [];
  const penalCode = state.penalCode || [];

  const filtered = penalCode
    .filter(p => !charges.some(c => c.id === p.id))
    .filter(p => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    })
    .slice(0, 10);

  const place = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setCoords({ left: r.left, top: r.bottom + 4, width: Math.max(r.width, 400) });
    }
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target) && !boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const addCharge = (charge) => {
    onChange(f.id, [...charges, { id: charge.id, code: charge.code, name: charge.name, type: charge.type, fine: charge.fine, jailTime: charge.jailTime }]);
    setQuery('');
  };

  const removeCharge = (id) => onChange(f.id, charges.filter(c => c.id !== id));

  const typeStyle = (t) => CHARGE_TYPE_STYLE[t] || CHARGE_TYPE_STYLE.Infraction;

  return (
    <div className="flex flex-col gap-2">
      {/* Selected charges */}
      {charges.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {charges.map((c) => {
            const ts = typeStyle(c.type);
            return (
              <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                style={{ background: ts.bg, borderColor: ts.border }}>
                <MdGavel size={13} style={{ color: ts.color, flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <span className="text-[12px] font-semibold text-white">{c.name}</span>
                  <span className="ml-2 text-[10px] font-mono text-slate-400">{c.code}</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: ts.bg, color: ts.color, border: `1px solid ${ts.border}` }}>
                  {c.type}
                </span>
                {c.fine > 0 && <span className="text-[9px] text-slate-500 shrink-0">${c.fine.toLocaleString()}</span>}
                {c.jailTime !== 'None' && <span className="text-[9px] text-slate-500 shrink-0">{c.jailTime}</span>}
                {!readOnly && (
                  <button type="button" onClick={() => removeCharge(c.id)}
                    className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer border-none bg-transparent transition-colors shrink-0">
                    <MdClose size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Search input */}
      {!readOnly && (
        <div ref={ref} className="relative">
          <MdGavel size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-bright pointer-events-none" />
          <input
            className={`${S_INPUT} pl-9 pr-3`}
            placeholder="Search penal code — name, code, or category…"
            value={query}
            onChange={e => { setQuery(e.target.value); place(); setOpen(true); }}
            onFocus={() => { place(); setOpen(true); }}
          />
        </div>
      )}

      {readOnly && charges.length === 0 && (
        <div className="text-[12px] text-slate-600 px-1">No charges added.</div>
      )}

      {/* Dropdown */}
      {open && coords && createPortal(
        <div ref={boxRef}
          className="fixed z-[3000] bg-app-card border border-border-strong shadow-2xl shadow-black/60 rounded-xl p-1.5 max-h-[320px] overflow-auto"
          style={{ left: coords.left, top: coords.top, width: coords.width, animation: 'dropdownFadeIn 0.12s ease-out' }}>
          {filtered.length === 0 && (
            <div className="px-3 py-3 text-[12px] text-slate-500 text-center">No charges match "{query}"</div>
          )}
          {filtered.map(p => {
            const ts = typeStyle(p.type);
            return (
              <button key={p.id} type="button" onMouseDown={(e) => { e.preventDefault(); addCharge(p); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left cursor-pointer transition-colors hover:bg-white/[0.07]">
                <MdGavel size={15} className="text-slate-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[12.5px] font-semibold text-white">{p.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{p.code}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{p.category}{p.fine > 0 ? ` · $${p.fine.toLocaleString()} fine` : ''}{p.jailTime !== 'None' ? ` · ${p.jailTime}` : ''}</div>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: ts.bg, color: ts.color, border: `1px solid ${ts.border}` }}>
                  {p.type}
                </span>
                <MdAdd size={14} className="text-brand-bright shrink-0" />
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}

function Field({ f, value, data, onChange, onBulk, sectionFields, readOnly }) {
  const span = Math.min(f.span || 1, 4);
  const lookupKind = LOOKUP_KIND[f.type];

  // Charges — full-width multi-select from penal code
  if (f.type === 'charges') {
    return (
      <div className={`flex flex-col sm:col-span-2 lg:col-span-4`}>
        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1.5">
          <MdGavel size={12} />
          {f.label || 'Charges'}{f.required && <span className="text-red-400"> *</span>}
          {!readOnly && (
            <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[8px] font-bold tracking-[0.4px] normal-case">PENAL CODE</span>
          )}
        </label>
        <ChargesField f={f} value={value} onChange={onChange} readOnly={readOnly} />
      </div>
    );
  }

  // Checkbox — compact toggle row
  if (f.type === 'checkbox') {
    return (
      <label className={`${SPAN[span]} flex items-center gap-2.5 self-end px-3 py-2.5 rounded-lg bg-app-input border border-border-base text-[12.5px] text-slate-200 ${readOnly ? '' : 'cursor-pointer hover:border-border-strong'} transition-colors`}>
        <input type="checkbox" checked={!!value} disabled={readOnly}
          onChange={e => onChange(f.id, e.target.checked)}
          className="w-4 h-4 accent-brand cursor-pointer disabled:cursor-default" />
        {f.label}
      </label>
    );
  }

  const isNarr = f.type === 'textarea';
  const cls = isNarr ? FULL : (SPAN[span] || SPAN[1]);

  return (
    <div className={`flex flex-col ${cls}`}>
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1.5">
        {f.label}{f.required && <span className="text-red-400"> *</span>}
        {lookupKind && !readOnly && (
          <span className="px-1.5 py-0.5 rounded bg-brand/15 text-brand-bright text-[8px] font-bold tracking-[0.4px] normal-case">LOOKUP</span>
        )}
      </label>

      {readOnly ? (
        <div className={`min-h-[40px] px-3.5 py-2.5 rounded-lg bg-app-input border border-border-base text-sm text-slate-200 ${f.mono ? 'font-mono' : ''} ${isNarr ? 'whitespace-pre-wrap leading-relaxed' : ''}`}>
          {value || <span className="text-slate-600">—</span>}
        </div>
      ) : lookupKind ? (
        <LookupField f={f} kind={lookupKind} value={value} data={data} sectionFields={sectionFields} onChange={onChange} onBulk={onBulk} />
      ) : isNarr ? (
        <textarea className={S_TEXTAREA} rows={f.minRows || 4}
          value={value || ''} onChange={e => onChange(f.id, e.target.value)} />
      ) : f.type === 'dropdown' ? (
        <select className={S_SELECT} value={value || ''} onChange={e => onChange(f.id, e.target.value)}>
          <option value="">—</option>
          {(f.options || []).map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={inputType(f.type)} className={`${S_INPUT} ${f.mono ? 'font-mono' : ''}`}
          value={value || ''} onChange={e => onChange(f.id, e.target.value)} />
      )}
    </div>
  );
}

export default function ReportForm({ template, data = {}, onChange, onBulkChange, readOnly = false }) {
  const sections = template?.sections || [];
  // Per-key change; fall back to bulk if a single onChange isn't supplied.
  const change = (k, v) => {
    if (onChange) onChange(k, v);
    else if (onBulkChange) onBulkChange({ [k]: v });
  };

  if (sections.length === 0) {
    return (
      <div className="max-w-[1100px] mx-auto w-full p-6 text-center text-slate-600 text-[12px]">
        This template has no fields configured.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1100px] mx-auto w-full">
      <div data-doc-top />
      {sections.map(sec => (
        <section key={sec.id} data-section={sec.title}
          className="bg-app-card/70 border border-border-base rounded-xl backdrop-blur-sm scroll-mt-4">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-faint text-[11px] font-bold uppercase tracking-[0.7px] text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            {sec.title}
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3.5">
            {sec.fields.map(f => (
              <Field key={f.id} f={f} value={data[f.id]} data={data}
                onChange={change} onBulk={onBulkChange} sectionFields={sec.fields} readOnly={readOnly} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
