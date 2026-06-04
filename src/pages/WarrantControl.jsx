import { useState, useMemo } from 'react';
import { useCAD } from '../store/cadStore';
import { useToast } from '../contexts/ToastContext';
import {
  MdArrowBack, MdAdd, MdDelete, MdSearch, MdGavel,
  MdCheckBox, MdCheckBoxOutlineBlank,
} from 'react-icons/md';
import {
  BADGE, S_PAGE, S_PANEL_HEADER, S_PANEL_TITLE,
  S_BTN_PRIMARY, S_BTN_SECONDARY, S_BTN_DANGER, S_BTN_SUCCESS,
  S_TABLE, S_TABLE_TH, S_TABLE_TD, S_STAT, S_STAT_LABEL, S_STAT_VALUE, S_DATA,
  trHoverOn, trHoverOff, sm,
} from '../constants/styles';

/* ── Constants ────────────────────────────────────────────────────────────── */

const TODAY = new Date().toISOString().split('T')[0];

const WARRANT_TYPES = [
  'Arrest Warrant',
  'Bench Warrant',
  'Search Warrant',
  'No Knock Search Warrant',
];

const SEX_OPTS  = ['', 'Male', 'Female', 'Non-Binary', 'Unknown'];
const SKIN_OPTS = ['', 'Light', 'Medium', 'Dark', 'Other'];
const HAIR_OPTS = ['', 'Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White', 'Bald', 'Other'];
const EYE_OPTS  = ['', 'Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Other'];
const BOND_OPTS = ['', 'Cite Release', 'Cash Bond', 'PR Bond', 'No Bond', 'Held Without Bond'];

const FLAG_DEFS = [
  { key: 'escapeRisk', label: 'ESCAPE RISK' },
  { key: 'felony',     label: 'FELONY' },
  { key: 'armed',      label: 'ARMED' },
  { key: 'dangerous',  label: 'DANGEROUS' },
  { key: 'warrant',    label: 'WARRANT' },
];

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function calcAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  if (isNaN(birth)) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function blankCharge() {
  return { _id: `${Date.now()}-${Math.random()}`, charge: '', chargeType: '', counts: 1, titleCode: '', bondType: '', bondFineAmount: 0, jailTime: '' };
}

function blankForm() {
  return {
    type: 'Arrest Warrant',
    flags: { escapeRisk: false, felony: false, armed: false, dangerous: false, warrant: false },
    civilianId: null,
    firstName: '', lastName: '', middleName: '',
    dob: '', sex: '',
    aka: '',
    residence: '', zipCode: '', occupation: '',
    height: '', weight: '',
    skin: '', hair: '', eyes: '',
    emergencyContact: '', relationship: '', contactNumber: '',
    charges: [blankCharge()],
    narrative: '',
    oocName: '',
    status: 'ACTIVE',
    authorization: '',
    observingOfficer: '',
  };
}

/* ── UI Primitives ────────────────────────────────────────────────────────── */

function Section({ title, right, children }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border-base">
      <div className="bg-red-600 px-3 py-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.7px] text-white">{title}</span>
        {right && <div className="shrink-0">{right}</div>}
      </div>
      <div className="bg-app-panel/80 p-2.5">{children}</div>
    </div>
  );
}

function Box({ label, span = 1, children }) {
  const spanCls = span === 2 ? 'col-span-2' : span === 3 ? 'col-span-3' : span === 4 ? 'col-span-4' : '';
  return (
    <div className={`min-w-0 bg-app-bg/60 border border-border-base rounded-lg px-2.5 py-2 ${spanCls}`}>
      <div className="text-[8px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1">{label}</div>
      {children}
    </div>
  );
}

function BVal({ v, mono }) {
  return (
    <div className={`text-[11.5px] font-bold text-slate-200 min-h-[16px] ${mono ? 'font-mono' : ''}`}>
      {v || '—'}
    </div>
  );
}

function BInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || ''}
      className="w-full bg-transparent text-[11.5px] text-slate-200 placeholder:text-slate-600 outline-none"
    />
  );
}

function BSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-transparent text-[11.5px] text-slate-200 outline-none cursor-pointer"
    >
      {options.map(o =>
        typeof o === 'string'
          ? <option key={o} value={o} style={{ background: '#0b1424' }}>{o || '—'}</option>
          : <option key={o.value} value={o.value} style={{ background: '#0b1424' }}>{o.label}</option>
      )}
    </select>
  );
}

/* ── Civilian inline search ───────────────────────────────────────────────── */

function CivSearch({ civilians, onSelect }) {
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const lq = q.toLowerCase();
    return civilians.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(lq) ||
      (c.dlNumber && c.dlNumber.toLowerCase().includes(lq)) ||
      (c.ssn && c.ssn.includes(q))
    ).slice(0, 8);
  }, [civilians, q]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 bg-app-bg/60 border border-border-base rounded-lg px-2.5 py-1.5">
        <MdSearch size={13} className="text-slate-500 shrink-0" />
        <input
          autoFocus
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by name, DL # or SSN…"
          className="flex-1 bg-transparent text-[12px] text-slate-200 placeholder:text-slate-600 outline-none"
        />
      </div>
      {results.length > 0 && (
        <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto">
          {results.map(c => (
            <button key={c.id} type="button" onClick={() => onSelect(c)}
              className="text-left px-3 py-2 rounded-lg bg-app-elevated/60 border border-border-faint hover:border-brand/40 hover:bg-brand/[0.05] transition-all cursor-pointer">
              <div className="text-[12px] font-bold text-slate-200">{c.firstName} {c.lastName}</div>
              <div className="text-[10.5px] text-slate-500 font-mono mt-0.5">DOB {c.dob} · DL {c.dlNumber || '—'}</div>
            </button>
          ))}
        </div>
      )}
      {q.trim() && results.length === 0 && (
        <div className="text-[11px] text-slate-600 px-1">No civilians found</div>
      )}
    </div>
  );
}

/* ── Single charge row ────────────────────────────────────────────────────── */

function ChargeRow({ charge, idx, penalCode, onChange, onRemove, canRemove }) {
  const set = (k, v) => onChange({ ...charge, [k]: v });

  const handleChargeSelect = (name) => {
    const match = penalCode.find(p => p.name === name);
    if (match) {
      onChange({
        ...charge,
        charge:          match.name,
        chargeType:      match.type    || '',
        titleCode:       match.code    || '',
        bondFineAmount:  match.fine    || 0,
        jailTime:        match.jailTime|| '',
      });
    } else {
      set('charge', name);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border-base">
      <div className="bg-app-bg/40 border-b border-border-faint px-3 py-1.5 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5px]">#{idx + 1}</span>
        {canRemove && (
          <button type="button" onClick={onRemove}
            className="flex items-center justify-center w-6 h-6 rounded bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 cursor-pointer transition-colors">
            <MdDelete size={12} />
          </button>
        )}
      </div>
      <div className="bg-app-panel/80 p-2.5 grid grid-cols-2 gap-1.5">
        <Box label="Charge" span={2}>
          <select
            value={charge.charge}
            onChange={e => handleChargeSelect(e.target.value)}
            className="w-full bg-transparent text-[11.5px] text-slate-200 outline-none cursor-pointer"
          >
            <option value="" style={{ background: '#0b1424' }}>— Select charge —</option>
            {penalCode.map(p => (
              <option key={p.id} value={p.name} style={{ background: '#0b1424' }}>{p.code} – {p.name}</option>
            ))}
          </select>
        </Box>
        <Box label="Charge Type">
          <BInput value={charge.chargeType} onChange={v => set('chargeType', v)} placeholder="Felony, Misdemeanor…" />
        </Box>
        <Box label="Counts">
          <BInput type="number" value={charge.counts} onChange={v => set('counts', Math.max(1, Number(v)))} />
        </Box>
        <Box label="Title, Code">
          <BInput value={charge.titleCode} onChange={v => set('titleCode', v)} placeholder="e.g. 187 PC" />
        </Box>
        <Box label="Bond Type">
          <BSelect value={charge.bondType} onChange={v => set('bondType', v)} options={BOND_OPTS} />
        </Box>
        <Box label="Bond / Fine Amount">
          <div className="flex items-center gap-1 text-[11.5px] text-slate-200">
            <span className="text-slate-400">$</span>
            <BInput type="number" value={charge.bondFineAmount} onChange={v => set('bondFineAmount', Number(v))} />
          </div>
        </Box>
        <Box label="Jail Time" span={2}>
          <BInput value={charge.jailTime} onChange={v => set('jailTime', v)} placeholder="e.g. 3 Years, Life, None" />
        </Box>
      </div>
    </div>
  );
}

/* ── Full Warrant Form ────────────────────────────────────────────────────── */

function WarrantForm({ me, communityConfig, departments, civilians, penalCode, onCancel, onSubmit }) {
  const [form, setForm] = useState(blankForm);
  const [showCivSearch, setShowCivSearch] = useState(false);

  const dept = departments?.find(d => d.id === me?.dept);
  const set  = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleFlag = k => setForm(p => ({
    ...p, flags: { ...p.flags, [k]: !p.flags[k] },
  }));

  const fillCivilian = (c) => {
    setForm(p => ({
      ...p,
      civilianId:    c.id,
      firstName:     c.firstName     || '',
      lastName:      c.lastName      || '',
      middleName:    c.middleName    || '',
      dob:           c.dob           || '',
      sex:           c.gender        || '',
      residence:     c.address       || '',
      occupation:    c.occupation    || '',
      height:        c.height        || '',
      weight:        c.weight        || '',
      skin:          c.skin          || '',
      hair:          c.hair          || '',
      eyes:          c.eyes          || '',
    }));
    setShowCivSearch(false);
  };

  const addCharge    = () => setForm(p => ({ ...p, charges: [...p.charges, blankCharge()] }));
  const removeCharge = id  => setForm(p => ({ ...p, charges: p.charges.filter(c => c._id !== id) }));
  const updateCharge = (id, val) => setForm(p => ({ ...p, charges: p.charges.map(c => c._id === id ? val : c) }));

  const fineTotal = form.charges.reduce(
    (s, c) => s + (Number(c.bondFineAmount) || 0) * (Number(c.counts) || 1), 0,
  );

  const age       = calcAge(form.dob);
  const canSubmit = form.firstName.trim() || form.lastName.trim();

  const buildSig = () =>
    me ? `${me.badge} | ${(me.rank || 'OFFICER').toUpperCase()} | ${me.name.toUpperCase()}` : '';

  const handleSubmit = () => {
    const civName      = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ');
    const primaryCharge = form.charges[0]?.charge || '';
    const flagList     = FLAG_DEFS.filter(f => form.flags[f.key]).map(f => f.label);

    onSubmit({
      type:        form.type,
      flags:       flagList,
      civilianId:  form.civilianId,
      civilianName: civName || 'UNKNOWN',
      subject: {
        firstName: form.firstName, lastName: form.lastName, middleName: form.middleName,
        dob: form.dob, sex: form.sex, aka: form.aka,
        residence: form.residence, zipCode: form.zipCode, occupation: form.occupation,
        height: form.height, weight: form.weight,
        skin: form.skin, hair: form.hair, eyes: form.eyes,
        emergencyContact: form.emergencyContact,
        relationship: form.relationship, contactNumber: form.contactNumber,
      },
      charges:       form.charges,
      fineTotal,
      narrative:     form.narrative,
      oocName:       form.oocName,
      status:        form.status,
      authorization: form.authorization,
      observingOfficer: form.observingOfficer,
      charge:        primaryCharge,
      issuedBy:      me ? `${me.rank || ''} ${me.name} (${me.badge})`.trim() : '',
      issuedDate:    TODAY,
      notes:         form.narrative,
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden font-ui">

      {/* Top bar */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-border-base bg-app-toolbar/80 backdrop-blur-md">
        <button type="button" onClick={onCancel}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
          <MdArrowBack size={14} /> Back
        </button>
        <span className="text-[13px] font-bold text-white uppercase tracking-[0.4px]">New Warrant</span>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-[11.5px] font-semibold bg-white/[0.05] border border-white/10 text-slate-300 hover:bg-white/[0.1] cursor-pointer transition-all">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={!canSubmit}
            className="press px-3 py-1.5 rounded-lg text-[11.5px] font-bold bg-red-600 hover:bg-red-500 text-white cursor-pointer transition-all disabled:opacity-40 border border-red-400/30">
            Issue Warrant
          </button>
        </div>
      </div>

      {/* Scrollable form body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-app-bg/30">

        {/* WARRANT TYPE */}
        <Section title="Warrant Type">
          <Box label="Warrant">
            <BSelect value={form.type} onChange={v => set('type', v)} options={WARRANT_TYPES} />
          </Box>
        </Section>

        {/* FLAGS */}
        <Section title="Flags">
          <div className="flex flex-wrap gap-2">
            {FLAG_DEFS.map(f => {
              const on = form.flags[f.key];
              return (
                <button key={f.key} type="button" onClick={() => toggleFlag(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10.5px] font-bold uppercase tracking-[0.3px] cursor-pointer transition-all
                    ${on
                      ? 'bg-red-500/15 border-red-500/50 text-red-300'
                      : 'bg-app-bg/60 border-border-base text-slate-500 hover:text-slate-300 hover:border-slate-500/50'}`}>
                  {on
                    ? <MdCheckBox size={14} className="text-red-400" />
                    : <MdCheckBoxOutlineBlank size={14} />}
                  {f.label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* AGENCY INFORMATION */}
        <Section title="Agency Information">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <Box label="Record #"><BVal v="NEW" mono /></Box>
            <Box label="Agency"><BVal v={communityConfig?.name || 'SSRP'} /></Box>
            <Box label="Department"><BVal v={dept?.short || me?.deptShort || '—'} /></Box>
            <Box label="Subdivision"><BVal v={me?.subdivision || '—'} /></Box>
            <Box label="Unit #"><BVal v={me?.badge || '—'} mono /></Box>
            <Box label="Unit Name"><BVal v={me?.name || '—'} /></Box>
            <Box label="Date" span={2}><BVal v={TODAY} mono /></Box>
          </div>
        </Section>

        {/* CIVILIAN INFORMATION */}
        <Section
          title="Civilian Information"
          right={
            <button type="button" onClick={() => setShowCivSearch(p => !p)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.1] hover:bg-white/[0.18] text-white text-[10.5px] font-bold uppercase tracking-[0.3px] cursor-pointer transition-all border border-white/20">
              <MdSearch size={13} /> Search
            </button>
          }
        >
          {showCivSearch && (
            <div className="mb-3 p-3 rounded-xl border border-border-base bg-app-bg/60">
              <div className="text-[9px] font-bold uppercase tracking-[0.6px] text-slate-500 mb-2">Search Civilian Registry</div>
              <CivSearch civilians={civilians} onSelect={fillCivilian} />
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <Box label="First">
              <BInput value={form.firstName} onChange={v => set('firstName', v)} />
            </Box>
            <Box label="Last">
              <BInput value={form.lastName} onChange={v => set('lastName', v)} />
            </Box>
            <Box label="M.I.">
              <BInput value={form.middleName} onChange={v => set('middleName', v)} />
            </Box>
            <Box label="Sex">
              <BSelect value={form.sex} onChange={v => set('sex', v)} options={SEX_OPTS} />
            </Box>

            {/* DOB with iOS clipping wrapper */}
            <Box label="DOB">
              <div className="relative overflow-hidden" style={{ height: 18 }}>
                <input
                  type="date"
                  value={form.dob}
                  onChange={e => set('dob', e.target.value)}
                  className="absolute inset-0 w-full h-full bg-transparent text-[11.5px] text-slate-200 outline-none cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </Box>
            <Box label="Age">
              <BVal v={age != null ? `${age} yrs` : ''} />
            </Box>
            <Box label="A.K.A." span={2}>
              <BInput value={form.aka} onChange={v => set('aka', v)} placeholder="Former / known alias" />
            </Box>

            <Box label="Residence" span={2}>
              <BInput value={form.residence} onChange={v => set('residence', v)} />
            </Box>
            <Box label="Zip Code">
              <BInput value={form.zipCode} onChange={v => set('zipCode', v)} />
            </Box>
            <Box label="Occupation">
              <BInput value={form.occupation} onChange={v => set('occupation', v)} />
            </Box>

            <Box label="Height">
              <BInput value={form.height} onChange={v => set('height', v)} placeholder="e.g. 5ft 11in" />
            </Box>
            <Box label="Weight">
              <BInput value={form.weight} onChange={v => set('weight', v)} placeholder="180 lbs" />
            </Box>
            <Box label="Skin Tone">
              <BSelect value={form.skin} onChange={v => set('skin', v)} options={SKIN_OPTS} />
            </Box>
            <Box label="Hair Color">
              <BSelect value={form.hair} onChange={v => set('hair', v)} options={HAIR_OPTS} />
            </Box>
            <Box label="Eye Color">
              <BSelect value={form.eyes} onChange={v => set('eyes', v)} options={EYE_OPTS} />
            </Box>
            <Box label="Emergency Contact">
              <BInput value={form.emergencyContact} onChange={v => set('emergencyContact', v)} />
            </Box>
            <Box label="Relationship">
              <BInput value={form.relationship} onChange={v => set('relationship', v)} />
            </Box>
            <Box label="Contact Number">
              <BInput value={form.contactNumber} onChange={v => set('contactNumber', v)} />
            </Box>
          </div>
        </Section>

        {/* CHARGES */}
        <Section
          title={`Charges · Fine Total: $${fineTotal.toLocaleString()}`}
          right={
            <button type="button" onClick={addCharge}
              className="flex items-center justify-center w-6 h-6 rounded bg-white/[0.15] hover:bg-white/[0.22] text-white cursor-pointer transition-colors border border-white/20">
              <MdAdd size={14} />
            </button>
          }
        >
          <div className="flex flex-col gap-2">
            {form.charges.map((c, idx) => (
              <ChargeRow
                key={c._id}
                charge={c}
                idx={idx}
                penalCode={penalCode}
                onChange={v => updateCharge(c._id, v)}
                onRemove={() => removeCharge(c._id)}
                canRemove={form.charges.length > 1}
              />
            ))}
          </div>
        </Section>

        {/* NARRATIVE */}
        <Section title="Narrative">
          <textarea
            value={form.narrative}
            onChange={e => set('narrative', e.target.value)}
            rows={4}
            placeholder="Describe the circumstances, evidence, and basis for this warrant…"
            className="w-full bg-app-bg/60 border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-red-500/40 transition-colors resize-none"
          />
        </Section>

        {/* OOC NAME */}
        <Section title="Out of Character Name">
          <Box label="OOC Name">
            <BInput value={form.oocName} onChange={v => set('oocName', v)} placeholder="Your out-of-character username" />
          </Box>
        </Section>

        {/* STATUS */}
        <Section title="Status">
          <div className="grid grid-cols-2 gap-1.5">
            <Box label="Status">
              <BSelect value={form.status} onChange={v => set('status', v)} options={['ACTIVE', 'SERVED', 'VOID']} />
            </Box>
            <Box label="Date"><BVal v={TODAY} mono /></Box>
          </div>
        </Section>

        {/* Authorization buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button type="button"
            onClick={() => set('authorization', form.authorization ? '' : buildSig())}
            className="press py-3 rounded-xl text-[11.5px] font-bold uppercase tracking-[0.4px] cursor-pointer transition-all border"
            style={form.authorization
              ? { background: 'rgba(0,80,30,0.2)',   border: '1px solid rgba(0,150,60,0.35)',   color: '#86efac' }
              : { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5' }}>
            {form.authorization
              ? <>✓ {form.authorization}</>
              : 'Warrant Authorization'}
          </button>
          <button type="button"
            onClick={() => set('observingOfficer', form.observingOfficer ? '' : buildSig())}
            className="press py-3 rounded-xl text-[11.5px] font-bold uppercase tracking-[0.4px] cursor-pointer transition-all border"
            style={form.observingOfficer
              ? { background: 'rgba(0,80,30,0.2)',   border: '1px solid rgba(0,150,60,0.35)',   color: '#86efac' }
              : { background: 'rgba(61,130,240,0.12)', border: '1px solid rgba(61,130,240,0.35)', color: '#93c5fd' }}>
            {form.observingOfficer
              ? <>✓ {form.observingOfficer}</>
              : "Observing Officer's Signature"}
          </button>
        </div>

      </div>
    </div>
  );
}

/* ── Warrant Detail Panel ─────────────────────────────────────────────────── */

function WarrantDetail({ warrant, civilians }) {
  if (!warrant) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 flex-1 p-5 text-cad-muted">
        <MdGavel size={32} className="opacity-20" />
        <span className="text-[11px] text-center">Select a warrant to view details</span>
      </div>
    );
  }

  const subj    = warrant.subject || {};
  const flagList = warrant.flags  || [];
  const age     = calcAge(subj.dob || (civilians.find(c => c.id === warrant.civilianId)?.dob));

  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">

      {/* Header */}
      <div className={`rounded-xl p-3 border-l-[3px] flex flex-col gap-2
        ${warrant.status === 'ACTIVE'
          ? 'bg-red-500/[0.05] border border-red-500/20 border-l-red-500'
          : 'bg-green-500/[0.05] border border-green-500/20 border-l-green-500'}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[14px] font-bold text-white">{warrant.civilianName}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{warrant.type}</div>
          </div>
          <span className={warrant.status === 'ACTIVE' ? BADGE.red : BADGE.green}>{warrant.status}</span>
        </div>
        {flagList.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {flagList.map(f => (
              <span key={f} className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/25">{f}</span>
            ))}
          </div>
        )}
      </div>

      {/* Issued by */}
      <div className="bg-app-card/60 border border-border-faint rounded-xl p-3">
        <div className="text-[9px] text-cad-muted uppercase tracking-[0.7px] mb-1">Issued By</div>
        <div className="text-[12px] text-slate-200">{warrant.issuedBy || '—'}</div>
        <div className="text-[10.5px] font-mono text-slate-500 mt-0.5">{warrant.issuedDate}</div>
      </div>

      {/* Subject info */}
      {(subj.dob || subj.sex || subj.residence) && (
        <div className="bg-app-card/60 border border-border-faint rounded-xl p-3">
          <div className="text-[9px] text-cad-muted uppercase tracking-[0.7px] mb-2">Subject</div>
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-3">
            {[
              ['DOB',     subj.dob],
              ['Age',     age != null ? `${age} yrs` : null],
              ['Sex',     subj.sex],
              ['Height',  subj.height],
              ['Weight',  subj.weight],
              ['Hair',    subj.hair],
              ['Eyes',    subj.eyes],
              ['Address', subj.residence, 2],
              ['AKA',     subj.aka,       2],
            ].filter(([, v]) => v).map(([label, val, span]) => (
              <div key={label} className={span === 2 ? 'col-span-2' : ''}>
                <div className="text-[8.5px] text-slate-600 uppercase tracking-[0.4px]">{label}</div>
                <div className="text-[11.5px] text-slate-300">{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charges (new format) */}
      {warrant.charges?.length > 0 && (
        <div className="bg-app-card/60 border border-border-faint rounded-xl p-3">
          <div className="text-[9px] text-cad-muted uppercase tracking-[0.7px] mb-2">
            Charges ({warrant.charges.length})
          </div>
          {warrant.charges.map((c, i) => (
            <div key={i} className={`py-1.5 ${i > 0 ? 'border-t border-border-faint' : ''}`}>
              <div className="text-[12px] font-semibold text-slate-200">{c.charge || '—'}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {[c.chargeType, c.titleCode, c.counts > 1 ? `×${c.counts}` : null, c.jailTime]
                  .filter(Boolean).join(' · ')}
              </div>
            </div>
          ))}
          {(warrant.fineTotal || 0) > 0 && (
            <div className="mt-2 pt-2 border-t border-border-faint text-[11px] font-bold text-slate-300">
              Total: ${(warrant.fineTotal || 0).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Legacy single charge */}
      {!warrant.charges && warrant.charge && (
        <div className="bg-app-card/60 border border-border-faint rounded-xl p-3">
          <div className="text-[9px] text-cad-muted uppercase tracking-[0.7px] mb-1">Charge</div>
          <div className="text-[12px] font-semibold text-slate-200">{warrant.charge}</div>
        </div>
      )}

      {/* Narrative */}
      {warrant.narrative && (
        <div className="bg-app-card/60 border border-border-faint rounded-xl p-3">
          <div className="text-[9px] text-cad-muted uppercase tracking-[0.7px] mb-1">Narrative</div>
          <div className="text-[11.5px] text-slate-300 leading-relaxed whitespace-pre-wrap">{warrant.narrative}</div>
        </div>
      )}

      {/* OOC name */}
      {warrant.oocName && (
        <div className="bg-app-card/60 border border-border-faint rounded-xl p-3">
          <div className="text-[9px] text-cad-muted uppercase tracking-[0.7px] mb-1">OOC Name</div>
          <div className="text-[12px] text-slate-300">{warrant.oocName}</div>
        </div>
      )}

      {/* Notes (legacy) */}
      {warrant.notes && !warrant.narrative && (
        <div className="bg-app-card/60 border border-border-faint rounded-xl p-3">
          <div className="text-[9px] text-cad-muted uppercase tracking-[0.7px] mb-1">Notes</div>
          <div className="text-[11.5px] text-slate-400 italic">{warrant.notes}</div>
        </div>
      )}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */

export default function WarrantControl() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const {
    warrants, civilians, officers, currentUser,
    communityConfig, departments = [], penalCode = [],
  } = state;

  const [filter,   setFilter]   = useState('ACTIVE');
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);

  const me       = officers.find(o => o.id === currentUser?.id);
  const filtered = filter === 'ALL' ? warrants : warrants.filter(w => w.status === filter);
  const selWarrant = selected != null ? warrants.find(w => w.id === selected) : null;

  const activeCount = warrants.filter(w => w.status === 'ACTIVE').length;
  const servedCount = warrants.filter(w => w.status === 'SERVED').length;

  const handleIssue = (payload) => {
    dispatch({ type: 'ADD_WARRANT', payload });
    toast.success(`Warrant issued — ${payload.civilianName}`, { title: 'Warrant active' });
    setCreating(false);
    setFilter('ACTIVE');
  };

  const handleServe = () => {
    dispatch({ type: 'SERVE_WARRANT', payload: selected });
    toast.success('Warrant marked served');
    setSelected(null);
  };

  /* ── Creating view (full-page form) ── */
  if (creating) {
    return (
      <div className={`${S_PAGE} !p-0 overflow-hidden`}>
        <WarrantForm
          me={me}
          communityConfig={communityConfig}
          departments={departments}
          civilians={civilians}
          penalCode={penalCode}
          onCancel={() => setCreating(false)}
          onSubmit={handleIssue}
        />
      </div>
    );
  }

  /* ── List + detail view ── */
  return (
    <div className={`${S_PAGE} overflow-hidden !p-3 md:!p-5`}>

      {/* Header: stat widgets + filter buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
        <div className="grid grid-cols-3 gap-3 sm:flex-1 sm:min-w-0">
          {[
            { label: 'Active', value: activeCount,     color: '#f87171' },
            { label: 'Served', value: servedCount,     color: '#4ade80' },
            { label: 'Total',  value: warrants.length, color: '#ffffff' },
          ].map(s => (
            <div key={s.label} className={S_STAT}>
              <span className={S_STAT_LABEL}>{s.label}</span>
              <span className={S_STAT_VALUE} style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center sm:ml-auto">
          {['ALL', 'ACTIVE', 'SERVED'].map(f => (
            <button key={f} className={sm(filter === f ? S_BTN_PRIMARY : S_BTN_SECONDARY)}
              onClick={() => setFilter(f)}>{f}</button>
          ))}
          <button className={`press ${sm(S_BTN_DANGER)}`} onClick={() => setCreating(true)}>
            Issue Warrant
          </button>
        </div>
      </div>

      {/* Two-pane: table left, detail right */}
      <div className="mob-two-pane grid flex-1 overflow-hidden min-h-0 gap-4 lg:gap-5"
        style={{ gridTemplateColumns: '1fr 320px' }}>

        {/* Registry table */}
        <div className={`mob-list-panel${selected != null ? ' mob-gone' : ''} flex flex-col min-h-0 bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm shadow-lg shadow-black/20`}>
          <div className={S_PANEL_HEADER}>
            <div className={S_PANEL_TITLE}>Warrant Registry</div>
            <span className="ml-auto px-1.5 py-0.5 rounded-md bg-brand/15 text-brand-bright text-[11px] font-bold leading-none">
              {filtered.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-cad-muted text-[11px]">No warrants on file</div>
            ) : (
              <table className={`${S_TABLE} min-w-[560px]`}>
                <thead>
                  <tr>
                    {['Status', 'Subject', 'Type', 'Charge', 'Issued By', 'Issue Date'].map(h => (
                      <th key={h} className={S_TABLE_TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(w => (
                    <tr key={w.id}
                      className={`cursor-pointer ${selected === w.id ? 'bg-app-selected' : ''}`}
                      onClick={() => setSelected(w.id)}
                      onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}>
                      <td className={S_TABLE_TD}>
                        <span className={w.status === 'ACTIVE' ? BADGE.red : BADGE.green}>{w.status}</span>
                      </td>
                      <td className={`${S_TABLE_TD} font-semibold`}>{w.civilianName}</td>
                      <td className={S_TABLE_TD}><span className={BADGE.gray}>{w.type}</span></td>
                      <td className={`${S_TABLE_TD} max-w-[200px] truncate text-[11px]`}>
                        {w.charges?.[0]?.charge || w.charge || '—'}
                      </td>
                      <td className={`${S_TABLE_TD} text-[10px] text-slate-500`}>{w.issuedBy}</td>
                      <td className={S_TABLE_TD}>
                        <span className={`${S_DATA} text-[10px]`}>{w.issuedDate}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className={`mob-detail-panel${selected == null ? ' mob-gone' : ''} flex flex-col min-h-0 bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm shadow-lg shadow-black/20`}>
          <button className="mob-back-btn !rounded-none" onClick={() => setSelected(null)}>
            <MdArrowBack size={14} /> Back to registry
          </button>
          {selWarrant && (
            <>
              <div className={S_PANEL_HEADER}>
                <div className={S_PANEL_TITLE}>Warrant Detail</div>
                <span className={selWarrant.status === 'ACTIVE' ? BADGE.red : BADGE.green}>
                  {selWarrant.status}
                </span>
              </div>
              <WarrantDetail warrant={selWarrant} civilians={civilians} />
              {selWarrant.status === 'ACTIVE' && (
                <div className="p-3 border-t border-border-faint shrink-0">
                  <button className={`press ${S_BTN_SUCCESS} w-full justify-center`} onClick={handleServe}>
                    Mark as Served
                  </button>
                </div>
              )}
            </>
          )}
          {!selWarrant && (
            <WarrantDetail warrant={null} civilians={civilians} />
          )}
        </div>
      </div>
    </div>
  );
}
