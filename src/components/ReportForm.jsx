/* Dark, app-themed renderer for report/record templates.
   Renders a template's sections + fields as native form controls that match
   the rest of the CAD UI. Lookup fields (civilian / vehicle / officer) search
   live data and auto-fill the rest of their section, Sonoran-style. */

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdSearch, MdPerson, MdDirectionsCar, MdShield, MdGavel, MdAdd, MdClose, MdAutorenew, MdDelete, MdCameraAlt, MdDriveFileRenameOutline, MdAddPhotoAlternate, MdZoomIn, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { useCAD } from '../store/cadStore';
import { S_INPUT, S_SELECT, S_TEXTAREA } from '../constants/styles';
import { FlagRow } from './CivilianFlags';

// Static span classes so Tailwind JIT picks them up.
const SPAN = {
  1: 'sm:col-span-1 lg:col-span-1',
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
function calcAge(dob) {
  if (!dob) return '';
  const d = new Date(dob);
  if (isNaN(d)) return '';
  return String(Math.abs(new Date(Date.now() - d.getTime()).getUTCFullYear() - 1970));
}

function buildAutofill(kind, rec, fields, civilians) {
  const out = {};
  const has = (L, ...keys) => keys.some(k => L.includes(k));
  for (const f of fields) {
    const L = (f.label || '').toLowerCase();
    if (kind === 'civilian') {
      if (has(L, 'business')) continue;
      // Split first / last name fields get individual values
      if (L === 'first name' || L === 'first') out[f.id] = rec.firstName;
      else if (L === 'last name' || L === 'last') out[f.id] = rec.lastName;
      else if (L === 'm.i.' || L === 'mi' || L === 'middle') out[f.id] = '';
      // Full-name fields (subject name, driver name, etc.)
      else if (has(L, 'name', 'holder', 'subject', 'driver', 'arrestee', 'party', 'person')) out[f.id] = `${rec.firstName} ${rec.lastName}`;
      else if (has(L, 'dob', 'birth')) out[f.id] = rec.dob;
      else if (L === 'age') out[f.id] = calcAge(rec.dob);
      else if (has(L, 'residence', 'address')) out[f.id] = rec.address;
      else if (has(L, 'zip')) out[f.id] = rec.zipCode || '';
      else if (has(L, 'occupation')) out[f.id] = rec.occupation || '';
      else if (has(L, 'license number', 'dl number', 'dl #', 'driver license', 'license #')) out[f.id] = rec.dlNumber;
      else if (has(L, 'dl class', 'license class')) out[f.id] = rec.dlClass;
      else if (has(L, 'ssn')) out[f.id] = rec.ssn;
      else if (has(L, 'phone', 'contact number')) out[f.id] = rec.phone;
      else if (has(L, 'gender', 'sex')) out[f.id] = rec.gender;
      else if (has(L, 'race', 'ethnic', 'skin')) out[f.id] = rec.ethnicity;
      else if (has(L, 'height')) out[f.id] = rec.height;
      else if (has(L, 'weight')) out[f.id] = rec.weight;
      else if (has(L, 'hair')) out[f.id] = rec.hair;
      else if (has(L, 'eye')) out[f.id] = rec.eyes;
    } else if (kind === 'vehicle') {
      if (has(L, 'plate', 'tag')) out[f.id] = rec.plate;
      else if (L === 'make') out[f.id] = rec.make;
      else if (L === 'model') out[f.id] = rec.model;
      else if (has(L, 'year')) out[f.id] = String(rec.year || '');
      else if (has(L, 'color', 'colour')) out[f.id] = rec.color;
      else if (has(L, 'vehicle type', 'type')) out[f.id] = rec.type || '';
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

/* ── Inline section-level autosuggest (replaces Search button) ── */
function SectionInlineSearch({ sec, data, onBulk }) {
  const { state } = useCAD();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const ref = useRef(null);
  const boxRef = useRef(null);
  const kind = sec.lookup;

  const sectionCiv = kind === 'vehicle' ? (() => {
    const fn = (data.ci_first || '').trim().toLowerCase();
    const ln = (data.ci_last || '').trim().toLowerCase();
    if (!fn && !ln) return null;
    return (state.civilians || []).find(c =>
      c.firstName.toLowerCase() === fn && c.lastName.toLowerCase() === ln
    ) || null;
  })() : null;

  let results = [];
  let ownerIds = new Set();
  if (open) {
    if (kind === 'vehicle') {
      const all = state.vehicles || [];
      const q = query.trim().toLowerCase();
      const ownerVeh = sectionCiv ? all.filter(v => v.ownerId === sectionCiv.id) : [];
      ownerIds = new Set(ownerVeh.map(v => v.id));
      const match = v => v.plate?.toLowerCase().includes(q) || `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(q);
      results = q
        ? [...ownerVeh.filter(match), ...searchData('vehicle', query, state).filter(v => !ownerIds.has(v.id))].slice(0, 8)
        : (ownerVeh.length ? ownerVeh : all).slice(0, 8);
    } else if (query.trim()) {
      results = searchData(kind, query, state);
    }
  }

  const place = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setCoords({ left: r.left, top: r.bottom + 4, width: r.width });
    }
  };

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (!ref.current?.contains(e.target) && !boxRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const pick = (rec) => {
    onBulk(buildAutofill(kind, rec, sec.fields, state.civilians));
    setQuery('');
    setOpen(false);
  };

  const Icon = kind === 'civilian' ? MdPerson : MdDirectionsCar;
  const placeholder = kind === 'civilian'
    ? 'Search by name, SSN or DL #…'
    : (sectionCiv ? `Search ${sectionCiv.firstName}'s vehicles or any plate…` : 'Search plate, make or model…');

  return (
    <div className="col-span-full" ref={ref}>
      <div className="relative">
        <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-bright pointer-events-none" />
        <input
          className="w-full bg-app-input border border-border-base focus:border-brand/50 rounded-lg pl-8 pr-8 py-2 text-[12.5px] text-white placeholder:text-slate-600 outline-none transition-colors"
          placeholder={placeholder}
          value={query}
          onChange={e => { setQuery(e.target.value); place(); setOpen(true); }}
          onFocus={() => { place(); setOpen(true); }}
          onKeyDown={e => e.key === 'Escape' && setOpen(false)}
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setOpen(false); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
            <MdClose size={14} />
          </button>
        )}
      </div>
      {open && results.length > 0 && coords && createPortal(
        <div ref={boxRef}
          className="fixed z-[3000] bg-app-card border border-border-strong shadow-2xl shadow-black/60 rounded-xl p-1.5 max-h-[300px] overflow-auto"
          style={{ left: coords.left, top: coords.top, width: coords.width, animation: 'dropdownFadeIn 0.12s ease-out' }}>
          {results.map(rec => (
            <button key={rec.id} type="button" onMouseDown={e => { e.preventDefault(); pick(rec); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left cursor-pointer hover:bg-white/[0.07] transition-colors">
              <Icon size={16} className="text-slate-500 shrink-0" />
              <div className="min-w-0 flex-1">
                {kind === 'civilian' && (<>
                  <div className="text-[12.5px] font-semibold text-white truncate">{rec.firstName} {rec.lastName}</div>
                  <div className="text-[10.5px] text-slate-500 font-mono">DOB {rec.dob} · DL {rec.dlNumber}</div>
                  {rec.flags?.length > 0 && <div className="mt-0.5"><FlagRow flags={rec.flags} /></div>}
                </>)}
                {kind === 'vehicle' && (<>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12.5px] font-semibold text-white font-mono">{rec.plate}</span>
                    {ownerIds.has(rec.id) && <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[8px] font-bold tracking-[0.4px]">REGISTERED</span>}
                  </div>
                  <div className="text-[10.5px] text-slate-500">{rec.year} {rec.make} {rec.model} · {rec.color}</div>
                </>)}
              </div>
              <MdAutorenew size={13} className="text-brand-bright/60 shrink-0" />
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
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
  Infraction: { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80', border: 'rgba(34,197,94,0.30)' },
};

const BOND_TYPES = ['No Bail', 'Bond Available', 'Cash Only', 'ROR', 'No Bond'];

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
    onChange(f.id, [...charges, {
      id: charge.id,
      code: charge.code,
      name: charge.name,
      type: charge.type,
      fine: charge.fine,
      jailTime: charge.jailTime,
      bondType: charge.fine > 0 ? 'Bond Available' : 'No Bail',
      bondAmount: String(charge.fine || 0),
      counts: '1',
    }]);
    setQuery('');
  };

  const removeCharge = (id) => onChange(f.id, charges.filter(c => c.id !== id));

  const updateCharge = (id, field, val) =>
    onChange(f.id, charges.map(c => c.id === id ? { ...c, [field]: val } : c));

  const totalFine = charges.reduce((sum, c) => {
    return sum + (parseFloat(c.bondAmount) || 0) * (parseInt(c.counts) || 1);
  }, 0);

  const typeStyle = (t) => CHARGE_TYPE_STYLE[t] || CHARGE_TYPE_STYLE.Infraction;

  const InlineInput = ({ chId, field, val, placeholder, mono, type: iType = 'text' }) => (
    <input
      type={iType}
      className="w-full bg-transparent text-[11.5px] text-slate-200 placeholder:text-slate-600 outline-none border-b border-transparent focus:border-white/20 transition-colors pb-0.5"
      value={val ?? ''}
      placeholder={placeholder}
      readOnly={readOnly}
      onChange={e => updateCharge(chId, field, e.target.value)}
      style={mono ? { fontFamily: 'monospace' } : undefined}
    />
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Fine total bar */}
      {charges.length > 0 && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.03] border border-border-faint">
          <span className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500">Fine Total</span>
          <span className="text-[13px] font-bold text-emerald-400 font-mono">
            ${totalFine.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {/* Charge cards */}
      {charges.map((c, idx) => {
        const ts = typeStyle(c.type);
        return (
          <div key={c.id} className="flex rounded-xl border overflow-hidden" style={{ borderColor: ts.border }}>
            {/* Left sidebar — number + delete */}
            <div className="flex flex-col items-center justify-between px-2.5 py-2.5 shrink-0 gap-2"
              style={{ background: ts.bg, minWidth: 38 }}>
              <span className="text-[10px] font-bold font-mono" style={{ color: ts.color }}>#{idx + 1}</span>
              {!readOnly && (
                <button type="button" onClick={() => removeCharge(c.id)}
                  className="w-5 h-5 rounded flex items-center justify-center transition-colors hover:bg-red-500/20 border-none bg-transparent cursor-pointer shrink-0"
                  title="Remove">
                  <MdDelete size={12} className="text-slate-500 hover:text-red-400" />
                </button>
              )}
            </div>

            {/* Field grid — 2 rows × 4 cols */}
            <div className="flex-1 min-w-0 p-2.5 grid grid-cols-4 gap-x-4 gap-y-2.5"
              style={{ background: 'rgba(255,255,255,0.015)' }}>
              {/* Row 1: CHARGE (×2) | TYPE | COUNTS */}
              <div className="col-span-2 flex flex-col min-w-0">
                <span className="text-[8.5px] font-bold uppercase tracking-[0.5px] text-slate-600 mb-1">Charge</span>
                <InlineInput chId={c.id} field="name" val={c.name} placeholder="Charge name" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8.5px] font-bold uppercase tracking-[0.5px] text-slate-600 mb-1">Charge Type</span>
                {readOnly ? (
                  <span className="text-[11.5px] font-semibold" style={{ color: ts.color }}>{c.type || '—'}</span>
                ) : (
                  <select
                    className="w-full bg-transparent text-[11.5px] outline-none border-b border-transparent focus:border-white/20 transition-colors pb-0.5 cursor-pointer"
                    style={{ color: ts.color }}
                    value={c.type || ''}
                    onChange={e => updateCharge(c.id, 'type', e.target.value)}
                  >
                    {['Felony', 'Misdemeanor', 'Infraction'].map(t => (
                      <option key={t} value={t} style={{ color: '#e2e8f0', background: '#1e2430' }}>{t}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8.5px] font-bold uppercase tracking-[0.5px] text-slate-600 mb-1">Counts</span>
                <InlineInput chId={c.id} field="counts" val={c.counts} placeholder="1" type="number" />
              </div>

              {/* Row 2: CODE | BOND TYPE | BOND / FINE | JAIL TIME */}
              <div className="flex flex-col min-w-0">
                <span className="text-[8.5px] font-bold uppercase tracking-[0.5px] text-slate-600 mb-1">Code</span>
                <InlineInput chId={c.id} field="code" val={c.code} placeholder="§ Code" mono />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8.5px] font-bold uppercase tracking-[0.5px] text-slate-600 mb-1">Bond Type</span>
                {readOnly ? (
                  <span className="text-[11.5px] text-slate-300">{c.bondType || '—'}</span>
                ) : (
                  <select
                    className="w-full bg-transparent text-[11.5px] text-slate-300 outline-none border-b border-transparent focus:border-white/20 transition-colors pb-0.5 cursor-pointer"
                    value={c.bondType || ''}
                    onChange={e => updateCharge(c.id, 'bondType', e.target.value)}
                  >
                    {BOND_TYPES.map(t => (
                      <option key={t} value={t} style={{ background: '#1e2430' }}>{t}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8.5px] font-bold uppercase tracking-[0.5px] text-slate-600 mb-1">Bond / Fine</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[10px] text-slate-600 shrink-0">$</span>
                  <InlineInput chId={c.id} field="bondAmount" val={c.bondAmount} placeholder="0.00" type="number" />
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8.5px] font-bold uppercase tracking-[0.5px] text-slate-600 mb-1">Jail Time</span>
                <InlineInput chId={c.id} field="jailTime" val={c.jailTime} placeholder="None" />
              </div>
            </div>
          </div>
        );
      })}

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

/* ── Mugshot upload field ── */
function MugshotField({ f, value, onChange, readOnly }) {
  const fileRef = useRef(null);
  const span = Math.min(f.span || 1, 4);
  const cls = SPAN[span] || SPAN[1];

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { alert('Image must be under 4 MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => onChange(f.id, ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className={`flex flex-col min-w-0 ${cls}`}>
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1.5">
        <MdCameraAlt size={12} />
        {f.label || 'Mugshot'}{f.required && <span className="text-red-400"> *</span>}
      </label>

      <div
        onClick={!readOnly && !value ? () => fileRef.current?.click() : undefined}
        className="relative rounded-xl overflow-hidden border border-border-base flex flex-col items-center justify-center transition-colors"
        style={{
          background: '#0a1018',
          aspectRatio: '3 / 4',
          maxWidth: 160,
          cursor: !readOnly && !value ? 'pointer' : 'default',
        }}
        onMouseEnter={e => { if (!readOnly && !value) e.currentTarget.style.borderColor = 'rgba(61,130,240,0.5)'; }}
        onMouseLeave={e => { if (!readOnly && !value) e.currentTarget.style.borderColor = ''; }}
      >
        {value ? (
          <>
            <img src={value} alt={f.label || 'Mugshot'}
              className="absolute inset-0 w-full h-full object-cover" />
            {!readOnly && (
              <button type="button"
                onClick={(e) => { e.stopPropagation(); onChange(f.id, null); fileRef.current && (fileRef.current.value = ''); }}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer border-none z-10"
                style={{ background: 'rgba(0,0,0,0.65)', color: '#f87171' }}
                title="Remove photo">
                <MdClose size={14} />
              </button>
            )}
            {!readOnly && (
              <button type="button"
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                className="absolute bottom-1.5 right-1.5 flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer border-none z-10 text-[9.5px] font-bold"
                style={{ background: 'rgba(0,0,0,0.65)', color: '#93c5fd' }}>
                <MdCameraAlt size={11} /> Replace
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 select-none px-3">
            <MdCameraAlt size={30} style={{ color: '#2d3f52' }} />
            <span className="text-[11px] font-semibold" style={{ color: '#3d5470' }}>
              {readOnly ? 'No photo on file' : 'Mugshot'}
            </span>
            {!readOnly && (
              <span className="text-[9px]" style={{ color: '#2d3f52' }}>Click to upload</span>
            )}
          </div>
        )}
      </div>

      {!readOnly && (
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
          className="hidden" onChange={handleFile} onClick={e => { e.target.value = ''; }} />
      )}
    </div>
  );
}

/* ── Generic image upload field (landscape; spans by f.span) ── */
function ImageField({ f, value, onChange, readOnly }) {
  const fileRef = useRef(null);
  const span = Math.min(f.span || 2, 4);
  const cls = SPAN[span] || SPAN[2];

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { alert('Image must be under 4 MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => onChange(f.id, ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className={`flex flex-col min-w-0 ${cls}`}>
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1.5">
        <MdCameraAlt size={12} />
        {f.label || 'Image'}{f.required && <span className="text-red-400"> *</span>}
      </label>
      <div
        onClick={!readOnly && !value ? () => fileRef.current?.click() : undefined}
        className="relative rounded-xl overflow-hidden border border-border-base flex flex-col items-center justify-center transition-colors"
        style={{ background: '#0a1018', aspectRatio: '16 / 9', cursor: !readOnly && !value ? 'pointer' : 'default' }}
        onMouseEnter={e => { if (!readOnly && !value) e.currentTarget.style.borderColor = 'rgba(61,130,240,0.5)'; }}
        onMouseLeave={e => { if (!readOnly && !value) e.currentTarget.style.borderColor = ''; }}
      >
        {value ? (
          <>
            <img src={value} alt={f.label || 'Image'} className="absolute inset-0 w-full h-full object-cover" />
            {!readOnly && (
              <button type="button"
                onClick={(e) => { e.stopPropagation(); onChange(f.id, null); fileRef.current && (fileRef.current.value = ''); }}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer border-none z-10"
                style={{ background: 'rgba(0,0,0,0.65)', color: '#f87171' }} title="Remove image">
                <MdClose size={14} />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 select-none px-3">
            <MdCameraAlt size={28} style={{ color: '#2d3f52' }} />
            <span className="text-[11px] font-semibold" style={{ color: '#3d5470' }}>
              {readOnly ? 'No image on file' : (f.placeholder || 'Click to upload')}
            </span>
          </div>
        )}
      </div>
      {!readOnly && (
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
          className="hidden" onChange={handleFile} onClick={e => { e.target.value = ''; }} />
      )}
    </div>
  );
}

/* Downscale an image file in the browser before we store it. Officers can drop
   in a huge phone/4K capture and it just works — we resize to fit within
   MAX_EDGE px and re-encode as JPEG, so what we keep is a few hundred KB rather
   than the multi-MB original. Keeps memory + draft auto-save well under limits. */
const PHOTO_MAX_EDGE = 1920;   // longest side, px
const PHOTO_QUALITY  = 0.82;   // JPEG quality
const PHOTO_HARD_CAP = 40 * 1024 * 1024; // sanity guard against absurd files (40 MB)

function downscaleImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const { width, height } = img;
        const scale = Math.min(1, PHOTO_MAX_EDGE / Math.max(width, height));
        const w = Math.round(width * scale);
        const h = Math.round(height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        // PNGs with transparency would go black on JPEG — but report photos are
        // opaque captures, so JPEG is the right call for size.
        resolve(canvas.toDataURL('image/jpeg', PHOTO_QUALITY));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ── Full-screen image viewer (lightbox) ── */
function PhotoLightbox({ photos, index, onClose, onNavigate }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onNavigate(-1);
      else if (e.key === 'ArrowRight') onNavigate(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNavigate]);

  const multi = photos.length > 1;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-10"
      style={{ background: 'rgba(3,7,12,0.92)', backdropFilter: 'blur(4px)' }}
    >
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer z-10"
        style={{ background: 'rgba(255,255,255,0.08)', color: '#e2e8f0' }}
        title="Close (Esc)"
      >
        <MdClose size={22} />
      </button>

      {/* Prev / Next */}
      {multi && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onNavigate(-1); }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer z-10"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#e2e8f0' }}
            title="Previous (←)"
          >
            <MdChevronLeft size={28} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onNavigate(1); }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer z-10"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#e2e8f0' }}
            title="Next (→)"
          >
            <MdChevronRight size={28} />
          </button>
        </>
      )}

      {/* Image — object-contain so nothing is cropped */}
      <img
        src={photos[index]}
        alt={`Photo ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
      />

      {/* Counter */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[12px] font-semibold text-slate-200"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        Photo {index + 1} of {photos.length}
      </div>
    </div>,
    document.body,
  );
}

/* ── Multi-photo gallery field (up to `f.max` photos, default 8) ── */
function PhotoGalleryField({ f, value, onChange, readOnly }) {
  const max = Math.min(f.max || 8, 8);
  const photos = Array.isArray(value) ? value : [];
  const fileRefs = useRef([]);
  const [viewerIdx, setViewerIdx] = useState(null);

  const handleFile = async (idx, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please choose an image file.'); return; }
    if (file.size > PHOTO_HARD_CAP) { alert('That image is unusually large (over 40 MB). Please pick a smaller file.'); return; }
    try {
      const dataUrl = await downscaleImage(file);
      const updated = [...photos];
      updated[idx] = dataUrl;
      onChange(f.id, updated.filter(Boolean));
    } catch {
      alert('Could not read that image. Please try a different file.');
    }
  };

  const removePhoto = (idx) => {
    const updated = [...photos];
    updated.splice(idx, 1);
    onChange(f.id, updated);
  };

  const slots = readOnly ? photos : [...photos, ...(photos.length < max ? [null] : [])].slice(0, max);

  return (
    <div className="sm:col-span-2 lg:col-span-4 flex flex-col min-w-0">
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-2">
        <MdAddPhotoAlternate size={12} />
        {f.label || 'Photos'}
        <span className="normal-case font-normal text-slate-600">({photos.length}/{max})</span>
        {f.required && <span className="text-red-400"> *</span>}
      </label>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((src, idx) => (
          <div key={idx}>
            {src ? (
              <div
                onClick={() => setViewerIdx(idx)}
                className="group relative rounded-lg overflow-hidden border border-border-base cursor-zoom-in"
                style={{ aspectRatio: '4/3' }}
                title="Click to view full size"
              >
                <img src={src} alt={`Photo ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                {/* Hover hint that the photo opens full size */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.35)' }}>
                  <MdZoomIn size={22} className="text-white/90" />
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center border-none cursor-pointer z-10"
                    style={{ background: 'rgba(0,0,0,0.65)', color: '#f87171' }}
                    title="Remove photo"
                  >
                    <MdClose size={12} />
                  </button>
                )}
                <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white/70 leading-none px-1 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  {idx + 1}
                </span>
              </div>
            ) : (
              <div
                onClick={() => fileRefs.current[idx]?.click()}
                className="rounded-lg border border-dashed border-border-base flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors hover:border-blue-500/50 hover:bg-blue-500/5"
                style={{ aspectRatio: '4/3', background: '#0a1018' }}
              >
                <MdAddPhotoAlternate size={20} style={{ color: '#2d3f52' }} />
                <span className="text-[10px] font-semibold" style={{ color: '#3d5470' }}>Add Photo</span>
              </div>
            )}
            {!readOnly && !src && (
              <input
                ref={el => fileRefs.current[idx] = el}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFile(photos.length, e)}
              />
            )}
          </div>
        ))}
        {readOnly && photos.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-4 text-[12px] text-slate-600 italic py-3">No photos attached.</div>
        )}
      </div>

      {viewerIdx != null && photos[viewerIdx] && (
        <PhotoLightbox
          photos={photos}
          index={viewerIdx}
          onClose={() => setViewerIdx(null)}
          onNavigate={(dir) => setViewerIdx(i => (i + dir + photos.length) % photos.length)}
        />
      )}
    </div>
  );
}

function Field({ f, value, data, onChange, onBulk, sectionFields, readOnly }) {
  const { state } = useCAD();
  const isSupervisor = ['admin', 'supervisor'].includes(state.currentUser?.role);
  const isSupOnly = !!f.supervisorOnly;
  // Honor the builder's field-level read-only flag in addition to supervisor gating.
  const effectiveReadOnly = readOnly || !!f.readOnly || (isSupOnly && !isSupervisor);

  const span = Math.min(f.span || 1, 4);
  const lookupKind = LOOKUP_KIND[f.type];

  // Mugshot — portrait image upload
  if (f.type === 'mugshot') {
    return <MugshotField f={f} value={value} onChange={onChange} readOnly={effectiveReadOnly} />;
  }

  // Image — generic landscape image upload
  if (f.type === 'image') {
    return <ImageField f={f} value={value} onChange={onChange} readOnly={effectiveReadOnly} />;
  }

  // Photos — multi-photo gallery (up to 8)
  if (f.type === 'photos') {
    return <PhotoGalleryField f={f} value={value} onChange={onChange} readOnly={effectiveReadOnly} />;
  }

  // Charges — full-width multi-select from penal code
  if (f.type === 'charges') {
    return (
      <div className={`flex flex-col sm:col-span-2 lg:col-span-4`}>
        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1.5">
          <MdGavel size={12} />
          {f.label || 'Charges'}{f.required && <span className="text-red-400"> *</span>}
          {isSupOnly && (
            <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[8px] font-bold tracking-[0.4px] normal-case">
              {isSupervisor ? 'SUP ONLY' : 'RESTRICTED'}
            </span>
          )}
          {!effectiveReadOnly && (
            <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[8px] font-bold tracking-[0.4px] normal-case">PENAL CODE</span>
          )}
        </label>
        <ChargesField f={f} value={value} onChange={onChange} readOnly={effectiveReadOnly} />
      </div>
    );
  }

  // Checkbox — compact toggle row
  if (f.type === 'checkbox') {
    return (
      <label className={`${SPAN[span]} flex items-center gap-2.5 self-end px-3 py-2.5 rounded-lg border text-[12.5px] text-slate-200 ${effectiveReadOnly ? '' : 'cursor-pointer hover:border-border-strong'} transition-colors
        ${isSupOnly && !isSupervisor ? 'bg-red-500/5 border-red-500/30' : 'bg-app-input border-border-base'}`}>
        <input type="checkbox" checked={!!value} disabled={effectiveReadOnly}
          onChange={e => onChange(f.id, e.target.checked)}
          className="w-4 h-4 accent-brand cursor-pointer disabled:cursor-default" />
        {f.label}
        {isSupOnly && <span className="ml-auto px-1 py-0.5 rounded bg-red-500/20 text-red-400 text-[8px] font-bold">{isSupervisor ? 'SUP' : '🔒'}</span>}
      </label>
    );
  }

  const isNarr = f.type === 'textarea';
  const cls = isNarr ? FULL : (SPAN[span] || SPAN[1]);

  // Signature fields get a one-click "Sign Off" that stamps the signer's
  // active identifier (badge | rank | name) — same format as filed reports.
  // An explicit `signature` builder field always qualifies; a plain text
  // field qualifies when its label reads like a signature (back-compat).
  const isSignatureField = f.type === 'signature' || (f.type === 'text' && /signature/i.test(f.label || ''));
  const signer = state.officers.find(o => o.id === state.currentUser?.id) || state.currentUser;
  const buildSignature = () => {
    if (!signer) return '';
    const rank = (signer.rank || signer.role || 'OFFICER').toString().toUpperCase();
    return [signer.badge, rank, signer.name?.toUpperCase()].filter(Boolean).join(' | ');
  };

  return (
    <div className={`flex flex-col min-w-0 ${cls}`}>
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1.5">
        {f.label}{f.required && <span className="text-red-400"> *</span>}
        {isSupOnly && (
          <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[8px] font-bold tracking-[0.4px] normal-case">
            {isSupervisor ? 'SUP ONLY' : 'RESTRICTED'}
          </span>
        )}
        {lookupKind && !effectiveReadOnly && (
          <span className="px-1.5 py-0.5 rounded bg-brand/15 text-brand-bright text-[8px] font-bold tracking-[0.4px] normal-case">LOOKUP</span>
        )}
      </label>

      {effectiveReadOnly ? (
        <div className={`min-h-[40px] px-3.5 py-2.5 rounded-lg border text-sm text-slate-200 ${f.mono ? 'font-mono' : ''} ${isNarr ? 'whitespace-pre-wrap leading-relaxed' : ''}
          ${isSupOnly && !isSupervisor ? 'bg-red-500/5 border-red-500/30' : 'bg-app-input border-border-base'}`}>
          {value || <span className="text-slate-600">—</span>}
        </div>
      ) : lookupKind ? (
        <LookupField f={f} kind={lookupKind} value={value} data={data} sectionFields={sectionFields} onChange={onChange} onBulk={onBulk} />
      ) : isNarr ? (
        <textarea className={`${S_TEXTAREA} ${isSupOnly ? 'border-red-500/40' : ''}`} rows={f.minRows || 4}
          placeholder={f.placeholder || ''}
          value={value || ''} onChange={e => onChange(f.id, e.target.value)} />
      ) : f.type === 'dropdown' ? (
        <select className={`${S_SELECT} ${isSupOnly ? 'border-red-500/40' : ''}`} value={value || ''} onChange={e => onChange(f.id, e.target.value)}>
          <option value="">{f.placeholder || '—'}</option>
          {(f.options || []).map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={inputType(f.type)} className={`${S_INPUT} ${f.mono ? 'font-mono' : ''} ${isSupOnly ? 'border-red-500/40' : ''}`}
          style={f.type === 'datetime' || f.type === 'date' ? { WebkitAppearance: 'none', appearance: 'none' } : undefined}
          placeholder={f.placeholder || ''}
          value={value || ''} onChange={e => onChange(f.id, e.target.value)} />
      )}

      {isSignatureField && !effectiveReadOnly && (
        <button type="button" onClick={() => onChange(f.id, buildSignature())} disabled={!signer}
          className="btn-glossy mt-2 self-start inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-bold cursor-pointer bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 hover:bg-emerald-500/25 hover:border-emerald-400/55 hover:text-emerald-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <MdDriveFileRenameOutline size={16} className="shrink-0" /> Sign Off On Report
        </button>
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

  const bulkFill = onBulkChange || ((updates) => Object.entries(updates).forEach(([k, v]) => change(k, v)));

  return (
    <div className="flex flex-col gap-5 max-w-[1100px] mx-auto w-full">
      <div data-doc-top />
      {sections.map(sec => (
        <section key={sec.id} data-section={sec.title}
          className={`border rounded-xl backdrop-blur-sm scroll-mt-4 ${sec.supervisorOnly ? 'bg-red-500/[0.03] border-red-500/25' : 'bg-app-card/70 border-border-base'}`}>
          <div className={`flex items-center gap-2 px-4 py-2.5 border-b text-[11px] font-bold uppercase tracking-[0.7px] ${sec.supervisorOnly ? 'border-red-500/20 text-red-400/80' : 'border-border-faint text-slate-300'}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sec.supervisorOnly ? 'bg-red-500' : 'bg-brand'}`} />
            {sec.title}
            {sec.supervisorOnly && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 text-[8px] font-bold tracking-[0.4px] normal-case">
                Supervisor Only
              </span>
            )}
          </div>
          <div className="p-4 sm:p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-4 sm:gap-y-3.5 overflow-hidden">
            {sec.lookup && !readOnly && (
              <SectionInlineSearch sec={sec} data={data} onBulk={bulkFill} />
            )}
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
