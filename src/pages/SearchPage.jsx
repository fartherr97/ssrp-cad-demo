import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { useResponsive } from '../hooks/useResponsive';
import {
  MdSearch, MdPerson, MdDirectionsCar, MdPhone, MdReportProblem,
  MdAdd, MdManageSearch, MdGavel, MdWarning, MdDescription, MdArrowBack,
} from 'react-icons/md';

/* ─── helpers ─────────────────────────────────────────────── */
function age(dob) {
  if (!dob) return '?';
  const d = new Date(dob);
  if (isNaN(d)) return '?';
  const today = new Date();
  let a = today.getFullYear() - d.getFullYear();
  if (today < new Date(today.getFullYear(), d.getMonth(), d.getDate())) a--;
  return a;
}
function fmtDate(raw) {
  if (!raw) return 'N/A';
  const d = new Date(raw);
  if (isNaN(d)) return raw;
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
}
function fmtDateTime(raw) {
  if (!raw) return 'N/A';
  const d = new Date(raw);
  if (isNaN(d)) return raw;
  return `${fmtDate(raw)} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function maskSSN(ssn) {
  if (!ssn) return 'N/A';
  const digits = ssn.replace(/\D/g,'');
  return `***-**-${digits.slice(-4)}`;
}

const SEARCH_TABS = [
  { key: 'PERSON',   Icon: MdPerson },
  { key: 'VEHICLE',  Icon: MdDirectionsCar },
  { key: 'PHONE',    Icon: MdPhone },
  { key: 'INCIDENT', Icon: MdReportProblem },
];

const RECORD_TABS = [
  'SUMMARY','DETAILS','ADDRESSES','CONTACTS','ASSOCIATES',
  'INCIDENTS','CITATIONS','WARRANTS','VEHICLES','PROPERTY','REPORTS',
];

/* ─── shared primitives ───────────────────────────────────── */
function FieldCard({ title, children, accent }) {
  return (
    <div className="rounded-lg overflow-hidden flex flex-col"
      style={{ background: '#0c1828', border: `1px solid ${accent ? accent + '30' : 'rgba(255,255,255,0.07)'}` }}>
      <div className="px-3 py-1.5 text-[9.5px] font-bold uppercase tracking-[1px] shrink-0"
        style={{ background: accent ? accent + '14' : '#0a1420', color: accent || '#3d5470', borderBottom: `1px solid ${accent ? accent + '20' : 'rgba(255,255,255,0.06)'}` }}>
        {title}
      </div>
      <div className="p-3 flex-1">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, valueColor, mono }) {
  return (
    <div className="flex gap-2 mb-[3px]">
      <span className="text-[11px] shrink-0" style={{ color: '#3d5470', minWidth: 108 }}>{label}</span>
      <span className="text-[11px]" style={{ color: valueColor || '#c8d5e8', fontFamily: mono ? 'var(--font-mono)' : undefined }}>
        {value || 'N/A'}
      </span>
    </div>
  );
}

/* ─── SUMMARY tab ─────────────────────────────────────────── */
function SummaryTab({ civ, civVehicles, civHistory, activeWarrants }) {
  return (
    <div className="flex flex-col gap-3">

      {/* Row 1: Personal | Addresses | Additional */}
      <div className="grid grid-cols-3 gap-3">
        <FieldCard title="Personal Information">
          <InfoRow label="Full Name"       value={`${civ.firstName} ${civ.lastName}`} />
          <InfoRow label="DOB"             value={`${fmtDate(civ.dob)} (${age(civ.dob)})`} />
          <InfoRow label="Gender"          value={civ.gender} />
          <InfoRow label="Race"            value={civ.ethnicity} />
          <InfoRow label="Height / Weight" value={civ.height && civ.weight ? `${civ.height} / ${civ.weight}` : 'N/A'} />
          <InfoRow label="Hair / Eyes"     value={civ.hair && civ.eyes ? `${civ.hair} / ${civ.eyes}` : 'N/A'} />
          <InfoRow label="SSN"             value={maskSSN(civ.ssn)} mono />
          <InfoRow label="DL Number"       value={civ.dlNumber} mono
            valueColor={civ.dlStatus === 'SUSPENDED' ? '#f87171' : undefined} />
          <InfoRow label="State ID"        value={civ.stateId || 'N/A'} mono />
          <InfoRow label="FBI Number"      value={civ.fbiNumber || 'N/A'} mono />
        </FieldCard>

        <FieldCard title="Address(es)">
          {civ.address ? (
            <>
              <div className="text-[9.5px] font-bold uppercase tracking-[0.7px] mb-1" style={{ color: '#3d5470' }}>Primary Address</div>
              <div className="text-[12px] leading-[1.7] mb-3" style={{ color: '#c8d5e8' }}>{civ.address}</div>
              <div className="text-[9.5px] font-bold uppercase tracking-[0.7px] mb-1" style={{ color: '#3d5470' }}>County</div>
              <div className="text-[11px] mb-3" style={{ color: '#6b8299' }}>{civ.county || 'N/A'}</div>
              {civ.mailingAddress && (
                <>
                  <div className="text-[9.5px] font-bold uppercase tracking-[0.7px] mb-1" style={{ color: '#3d5470' }}>Mailing Address</div>
                  <div className="text-[12px] leading-[1.7]" style={{ color: '#c8d5e8' }}>{civ.mailingAddress}</div>
                </>
              )}
            </>
          ) : (
            <div className="text-[11px]" style={{ color: '#2d3f52' }}>No address on file</div>
          )}
        </FieldCard>

        <FieldCard title="Additional Information">
          <InfoRow label="Citizenship"    value={civ.citizenship || 'United States'} />
          <InfoRow label="Place of Birth" value={civ.birthPlace || 'N/A'} />
          <InfoRow label="Occupation"     value={civ.occupation || 'Unknown'} />
          <InfoRow label="Employer"       value={civ.employer || 'N/A'} />
          <InfoRow label="Marital Status" value={civ.maritalStatus || 'Unknown'} />
          <InfoRow label="Known Aliases"  value={civ.aliases?.join(', ') || 'None'} />
          <InfoRow label="Gang Affiliation" value={civ.gang || 'None'} />
          {civ.flags?.length > 0 ? (
            <div className="mt-2">
              <div className="text-[9.5px] font-bold uppercase tracking-[0.7px] mb-1" style={{ color: '#3d5470' }}>Caution(s)</div>
              <div className="flex flex-wrap gap-1">
                {civ.flags.map(f => (
                  <span key={f} className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                    style={{ background: 'rgba(239,68,68,0.14)', color: '#f87171', border: '1px solid rgba(239,68,68,0.28)' }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <InfoRow label="Caution(s)" value="None" />
          )}
        </FieldCard>
      </div>

      {/* Row 2: Photo | Active Warrants | BOLOs */}
      <div className="grid gap-3" style={{ gridTemplateColumns: '160px 1fr 1fr' }}>

        <FieldCard title="Photo">
          <div className="rounded-lg overflow-hidden flex items-center justify-center"
            style={{ height: 130, background: '#070e1a', border: '1px solid rgba(255,255,255,0.06)' }}>
            {civ.photoUrl
              ? <img src={civ.photoUrl} alt="Mugshot" className="w-full h-full object-cover" />
              : <MdPerson size={52} style={{ color: '#1e2d40' }} />
            }
          </div>
        </FieldCard>

        <FieldCard title={`Active Warrants (${activeWarrants.length})`}
          accent={activeWarrants.length > 0 ? '#ef4444' : undefined}>
          {activeWarrants.length === 0 ? (
            <div className="text-[11px] py-2" style={{ color: '#2d3f52' }}>No active warrants on file.</div>
          ) : activeWarrants.map(w => (
            <div key={w.id} className="mb-3 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11.5px] font-bold" style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
                  WARRANT #{String(w.id).padStart(2,'0')}CR{w.issuedDate?.replace(/-/g,'').slice(2) || '000000'}
                </span>
                <span className="text-[10px]" style={{ color: '#3d5470' }}>{fmtDate(w.issuedDate)}</span>
              </div>
              <InfoRow label="Charge" value={w.charge} valueColor="#fca5a5" />
              <InfoRow label="Bond"   value={w.bond ? `$${Number(w.bond).toLocaleString()}.00` : 'N/A'} />
              <InfoRow label="Issuing Agency" value={w.issuedBy} />
              <span className="mt-1 inline-block px-2 py-0.5 rounded text-[9px] font-bold"
                style={{ background: 'rgba(239,68,68,0.18)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.32)' }}>
                {w.type?.toUpperCase().includes('BENCH') ? 'BENCH WARRANT' : 'FELONY'}
              </span>
            </div>
          ))}
        </FieldCard>

        <FieldCard title={`Active BOLOs / Locations (${civ.bolos?.length || 0})`}>
          {!civ.bolos?.length ? (
            <div className="text-[11px] py-2" style={{ color: '#2d3f52' }}>No active BOLOs or lookout notices.</div>
          ) : civ.bolos.map((b, i) => (
            <div key={i} className="mb-2 text-[11px]" style={{ color: '#fbbf24' }}>{b}</div>
          ))}
        </FieldCard>
      </div>

      {/* Row 3: Recent Incidents */}
      <FieldCard title="Recent Incidents">
        {civHistory.length === 0 ? (
          <div className="text-[11px] py-1" style={{ color: '#2d3f52' }}>No incidents on file.</div>
        ) : (
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                {['Date / Time', 'Incident #', 'Type', 'Location', 'Disposition'].map(h => (
                  <th key={h} className="px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-[0.6px] whitespace-nowrap"
                    style={{ color: '#3d5470', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {civHistory.slice(0, 8).map((h, i) => (
                <tr key={h.id} style={{ background: i % 2 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <td className="px-2 py-1.5 text-[11px]" style={{ color: '#4a6070' }}>{fmtDateTime(h.date)}</td>
                  <td className="px-2 py-1.5 text-[11px] font-bold" style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
                    {h.caseNumber || h.callId || 'N/A'}
                  </td>
                  <td className="px-2 py-1.5 text-[11px]" style={{ color: '#9ab0c4' }}>
                    {Array.isArray(h.charges) ? h.charges[0] : h.charges}
                  </td>
                  <td className="px-2 py-1.5 text-[11px]" style={{ color: '#4a6070' }}>
                    {h.location || 'N/A'}
                  </td>
                  <td className="px-2 py-1.5">
                    <DispositionBadge d={h.disposition} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </FieldCard>
    </div>
  );
}

function DispositionBadge({ d }) {
  const lc = (d || '').toLowerCase();
  let bg = 'rgba(100,116,139,0.18)', color = '#64748b', border = 'rgba(100,116,139,0.28)';
  if (lc.includes('arrest')) { bg = 'rgba(239,68,68,0.14)'; color = '#f87171'; border = 'rgba(239,68,68,0.3)'; }
  else if (lc.includes('cit')) { bg = 'rgba(251,191,36,0.14)'; color = '#fbbf24'; border = 'rgba(251,191,36,0.3)'; }
  else if (lc.includes('warn')) { bg = 'rgba(249,115,22,0.14)'; color = '#fb923c'; border = 'rgba(249,115,22,0.3)'; }
  else if (lc.includes('clear') || lc.includes('ok')) { bg = 'rgba(34,197,94,0.12)'; color = '#4ade80'; border = 'rgba(34,197,94,0.28)'; }
  return (
    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
      style={{ background: bg, color, border: `1px solid ${border}` }}>
      {d || 'Unknown'}
    </span>
  );
}

/* ─── INCIDENTS tab ───────────────────────────────────────── */
function IncidentsTab({ civHistory }) {
  if (!civHistory.length) {
    return (
      <div className="px-4 py-3 rounded-lg text-[11.5px] font-bold"
        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80', fontFamily: 'var(--font-mono)' }}>
        *** SUBJECT RETURNS CLEAR · NO CRIMINAL HISTORY ON FILE ***
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr style={{ background: '#0a1420' }}>
            {['Date','Case #','Charges','Officer','Agency','Disposition','Sentence','Notes'].map(h => (
              <th key={h} className="px-3 py-2 text-left font-bold uppercase tracking-[0.6px] whitespace-nowrap"
                style={{ color: '#3d5470', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: 9.5 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {civHistory.map((h, i) => (
            <tr key={h.id} style={{ background: i % 2 ? '#0a1520' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td className="px-3 py-2 whitespace-nowrap" style={{ color: '#4a6070' }}>{fmtDate(h.date)}</td>
              <td className="px-3 py-2 font-bold whitespace-nowrap" style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>{h.caseNumber}</td>
              <td className="px-3 py-2" style={{ color: '#c8d5e8', maxWidth: 220 }}>
                {Array.isArray(h.charges) ? h.charges.join(', ') : h.charges}
              </td>
              <td className="px-3 py-2 whitespace-nowrap" style={{ color: '#4a6070' }}>{h.officerBadge}</td>
              <td className="px-3 py-2 whitespace-nowrap" style={{ color: '#4a6070' }}>{h.agency}</td>
              <td className="px-3 py-2 whitespace-nowrap"><DispositionBadge d={h.disposition} /></td>
              <td className="px-3 py-2" style={{ color: '#4a6070' }}>{h.sentence || '—'}</td>
              <td className="px-3 py-2 text-[10.5px]" style={{ color: '#3d5470', maxWidth: 200 }}>{h.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── WARRANTS tab ────────────────────────────────────────── */
function WarrantsTab({ civWarrants }) {
  if (!civWarrants.length) {
    return (
      <div className="px-4 py-3 rounded-lg text-[11.5px] font-bold"
        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80', fontFamily: 'var(--font-mono)' }}>
        *** SUBJECT RETURNS CLEAR · NO WARRANTS ON FILE ***
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {civWarrants.map(w => (
        <div key={w.id} className="rounded-lg px-4 py-3"
          style={{ background: '#0c1828', border: `1px solid ${w.status === 'ACTIVE' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
          <div className="flex items-center gap-3 mb-2.5">
            <span className="text-[13px] font-bold" style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>WARRANT #{w.id}</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold"
              style={{ background: w.status === 'ACTIVE' ? 'rgba(239,68,68,0.18)' : 'rgba(100,116,139,0.14)', color: w.status === 'ACTIVE' ? '#f87171' : '#64748b', border: `1px solid ${w.status === 'ACTIVE' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
              {w.status}
            </span>
            <span className="ml-auto text-[10.5px]" style={{ color: '#3d5470' }}>{fmtDate(w.issuedDate)}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6">
            <InfoRow label="Type"       value={w.type} />
            <InfoRow label="Issued By"  value={w.issuedBy} />
            <InfoRow label="Charge"     value={w.charge} valueColor="#fca5a5" />
            {w.notes && <InfoRow label="Notes" value={w.notes} />}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── VEHICLES tab ────────────────────────────────────────── */
function VehiclesTab({ civVehicles }) {
  if (!civVehicles.length) {
    return <div className="text-[11.5px]" style={{ color: '#2d3f52' }}>No vehicles registered to this subject.</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr style={{ background: '#0a1420' }}>
            {['Plate','Year','Make','Model','Color','Reg Status','Stolen','Flags'].map(h => (
              <th key={h} className="px-3 py-2 text-left font-bold uppercase tracking-[0.6px] whitespace-nowrap"
                style={{ color: '#3d5470', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: 9.5 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {civVehicles.map((v, i) => (
            <tr key={v.id} style={{ background: i % 2 ? '#0a1520' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td className="px-3 py-2 font-bold" style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>{v.plate}</td>
              <td className="px-3 py-2" style={{ color: '#6b8299' }}>{v.year}</td>
              <td className="px-3 py-2" style={{ color: '#c8d5e8' }}>{v.make}</td>
              <td className="px-3 py-2" style={{ color: '#c8d5e8' }}>{v.model}</td>
              <td className="px-3 py-2" style={{ color: '#9ab0c4' }}>{v.color}</td>
              <td className="px-3 py-2">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                  style={{ background: v.regStatus === 'VALID' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.14)', color: v.regStatus === 'VALID' ? '#4ade80' : '#f87171', border: `1px solid ${v.regStatus === 'VALID' ? 'rgba(34,197,94,0.28)' : 'rgba(239,68,68,0.3)'}` }}>
                  {v.regStatus}
                </span>
              </td>
              <td className="px-3 py-2">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                  style={{ background: v.stolen ? 'rgba(239,68,68,0.14)' : 'rgba(34,197,94,0.12)', color: v.stolen ? '#f87171' : '#4ade80', border: `1px solid ${v.stolen ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.28)'}` }}>
                  {v.stolen ? 'YES' : 'NO'}
                </span>
              </td>
              <td className="px-3 py-2" style={{ color: '#4a6070' }}>{v.flags?.join(', ') || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Mobile panels ──────────────────────────────────────── */
function MobileSearchPanel({ searchTab, setSearchTab, query, setQuery, runSearch, results, selected, warrants, selectCiv }) {
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#080f1c' }}>
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3" style={{ background: '#0b1627', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 mb-3">
          <MdSearch size={15} style={{ color: '#3d5470' }} />
          <span className="text-[11px] font-bold uppercase tracking-[1px]" style={{ color: '#3d5470' }}>Records Search</span>
        </div>
        <div className="flex gap-1 mb-3">
          {SEARCH_TABS.map(({ key, Icon }) => (
            <button key={key} type="button" onClick={() => setSearchTab(key)}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border-none cursor-pointer text-[9px] font-bold uppercase"
              style={{
                background: searchTab === key ? 'rgba(61,130,240,0.2)' : 'rgba(255,255,255,0.04)',
                color: searchTab === key ? '#3d82f0' : '#3d5470',
                border: `1px solid ${searchTab === key ? 'rgba(61,130,240,0.35)' : 'rgba(255,255,255,0.07)'}`,
              }}>
              <Icon size={16} />{key}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl text-[13px] outline-none"
            style={{ background: '#060d18', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', color: '#dde6f1', fontFamily: 'var(--font-ui)' }}
            placeholder={searchTab === 'PERSON' ? 'Name or SSN…' : searchTab === 'VEHICLE' ? 'Plate number…' : 'Search…'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runSearch()}
          />
          <button type="button" onClick={runSearch}
            className="rounded-xl px-5 text-[13px] font-bold border-none cursor-pointer"
            style={{ background: 'rgba(61,130,240,0.22)', color: '#3d82f0', border: '1px solid rgba(61,130,240,0.38)' }}>
            GO
          </button>
        </div>
      </div>
      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {results.length === 0 && query && (
          <div className="px-4 py-8 text-center text-[13px]" style={{ color: '#2d3f52' }}>No records found</div>
        )}
        {results.length === 0 && !query && (
          <div className="px-4 py-8 text-center text-[13px]" style={{ color: '#1e2d3d' }}>Enter a name, SSN, or plate</div>
        )}
        {results.map(civ => {
          const hasWarrant = warrants.some(w => w.civilianId === civ.id && w.status === 'ACTIVE');
          return (
            <div key={civ.id} onClick={() => selectCiv(civ)}
              className="px-4 py-3.5 cursor-pointer"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: selected?.id === civ.id ? 'rgba(61,130,240,0.08)' : 'transparent' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[14px] font-bold" style={{ color: '#c8d5e8' }}>{civ.firstName} {civ.lastName}</span>
                {hasWarrant && <MdGavel size={13} style={{ color: '#ef4444' }} />}
              </div>
              <div className="text-[11.5px]" style={{ color: '#3d5470' }}>DOB: {fmtDate(civ.dob)}</div>
              <div className="text-[11.5px]" style={{ color: '#3d5470' }}>SSN: {maskSSN(civ.ssn)}</div>
              {civ.flags?.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {civ.flags.map(f => (
                    <span key={f} className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: 'rgba(239,68,68,0.14)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>{f}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Quick actions */}
      <div className="shrink-0 px-3 py-3 flex gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#0b1627' }}>
        <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11.5px] font-semibold border-none cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#6b8299', border: '1px solid rgba(255,255,255,0.08)' }}>
          <MdAdd size={14} style={{ color: '#3d82f0' }} /> New Record
        </button>
        <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11.5px] font-semibold border-none cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#6b8299', border: '1px solid rgba(255,255,255,0.08)' }}>
          <MdManageSearch size={14} style={{ color: '#3d82f0' }} /> Advanced
        </button>
      </div>
    </div>
  );
}

function MobileRecordPanel({ selected, recordTab, setRecordTab, civWarrants, civHistory, civVehicles, activeWarrants, onBack }) {
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#07101c' }}>
      {/* Header */}
      <div className="shrink-0 px-4 py-3" style={{ background: '#0b1627', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 mb-2.5 border-none bg-transparent cursor-pointer"
          style={{ color: '#3d5470', padding: 0 }}>
          <MdArrowBack size={16} />
          <span className="text-[11px] font-semibold">Back to Search</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'rgba(61,130,240,0.14)', border: '1px solid rgba(61,130,240,0.28)' }}>
            <MdPerson size={22} style={{ color: '#3d82f0' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-extrabold leading-tight" style={{ color: '#e2eaf8' }}>
              {selected.firstName} {selected.lastName}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: '#3d5470' }}>
              DOB: <span style={{ color: '#6b8299' }}>{fmtDate(selected.dob)}</span>
              {' · '}SSN: <span style={{ color: '#6b8299', fontFamily: 'var(--font-mono)' }}>{maskSSN(selected.ssn)}</span>
            </div>
          </div>
          {activeWarrants.length > 0 && (
            <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <MdWarning size={13} style={{ color: '#ef4444' }} />
              <span className="text-[10px] font-bold" style={{ color: '#f87171' }}>WANTED</span>
            </div>
          )}
        </div>
      </div>
      {/* Tabs - horizontal scroll */}
      <div className="shrink-0 flex overflow-x-auto" style={{ background: '#08111c', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {RECORD_TABS.map(t => (
          <button key={t} type="button" onClick={() => setRecordTab(t)}
            className="px-4 py-3 text-[11px] font-bold whitespace-nowrap shrink-0 border-none cursor-pointer"
            style={{ background: 'transparent', color: recordTab === t ? '#3d82f0' : '#3d5470', borderBottom: `2px solid ${recordTab === t ? '#3d82f0' : 'transparent'}` }}>
            {t}
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {recordTab === 'SUMMARY'  && <MobileSummaryTab civ={selected} civHistory={civHistory} activeWarrants={activeWarrants} civVehicles={civVehicles} />}
        {recordTab === 'INCIDENTS'&& <IncidentsTab civHistory={civHistory} />}
        {recordTab === 'WARRANTS' && <WarrantsTab  civWarrants={civWarrants} />}
        {recordTab === 'VEHICLES' && <VehiclesTab  civVehicles={civVehicles} />}
        {['DETAILS','ADDRESSES','CONTACTS','ASSOCIATES','CITATIONS','PROPERTY','REPORTS'].includes(recordTab) && (
          <div className="text-center py-12 text-[12px]" style={{ color: '#2d3f52' }}>{recordTab} not available in demo</div>
        )}
      </div>
    </div>
  );
}

/* Mobile summary uses stacked single-column layout */
function MobileSummaryTab({ civ, civHistory, activeWarrants, civVehicles }) {
  return (
    <div className="flex flex-col gap-3">
      <FieldCard title="Personal Information">
        <InfoRow label="Full Name"       value={`${civ.firstName} ${civ.lastName}`} />
        <InfoRow label="DOB"             value={`${fmtDate(civ.dob)} (${age(civ.dob)})`} />
        <InfoRow label="Gender"          value={civ.gender} />
        <InfoRow label="Race"            value={civ.ethnicity} />
        <InfoRow label="Height / Weight" value={civ.height && civ.weight ? `${civ.height} / ${civ.weight}` : 'N/A'} />
        <InfoRow label="Hair / Eyes"     value={civ.hair && civ.eyes ? `${civ.hair} / ${civ.eyes}` : 'N/A'} />
        <InfoRow label="SSN"             value={maskSSN(civ.ssn)} mono />
        <InfoRow label="DL Number"       value={civ.dlNumber} mono
          valueColor={civ.dlStatus === 'SUSPENDED' ? '#f87171' : undefined} />
        <InfoRow label="DL Status"       value={civ.dlStatus}
          valueColor={civ.dlStatus === 'ACTIVE' ? '#4ade80' : '#f87171'} />
      </FieldCard>
      <FieldCard title="Address">
        <div className="text-[12px] leading-[1.7]" style={{ color: '#c8d5e8' }}>{civ.address || 'N/A'}</div>
      </FieldCard>
      <FieldCard title="Additional Information">
        <InfoRow label="Citizenship" value={civ.citizenship || 'United States'} />
        <InfoRow label="Occupation"  value={civ.occupation || 'Unknown'} />
        <InfoRow label="Employer"    value={civ.employer || 'N/A'} />
        {civ.flags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {civ.flags.map(f => (
              <span key={f} className="px-2 py-0.5 rounded text-[9.5px] font-bold"
                style={{ background: 'rgba(239,68,68,0.14)', color: '#f87171', border: '1px solid rgba(239,68,68,0.28)' }}>{f}</span>
            ))}
          </div>
        )}
      </FieldCard>
      <FieldCard title={`Active Warrants (${activeWarrants.length})`} accent={activeWarrants.length > 0 ? '#ef4444' : undefined}>
        {activeWarrants.length === 0
          ? <div className="text-[11.5px]" style={{ color: '#2d3f52' }}>No active warrants.</div>
          : activeWarrants.map(w => (
            <div key={w.id} className="mb-2">
              <div className="text-[12px] font-bold mb-1" style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>WARRANT #{w.id}</div>
              <InfoRow label="Charge" value={w.charge} valueColor="#fca5a5" />
              <InfoRow label="Issued By" value={w.issuedBy} />
              <InfoRow label="Date" value={fmtDate(w.issuedDate)} />
            </div>
          ))
        }
      </FieldCard>
      <FieldCard title="Recent Incidents">
        {civHistory.length === 0
          ? <div className="text-[11.5px]" style={{ color: '#2d3f52' }}>No incidents on file.</div>
          : civHistory.slice(0, 5).map(h => (
            <div key={h.id} className="py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-bold" style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>{h.caseNumber}</span>
                <DispositionBadge d={h.disposition} />
              </div>
              <div className="text-[11px]" style={{ color: '#9ab0c4' }}>{Array.isArray(h.charges) ? h.charges[0] : h.charges}</div>
              <div className="text-[10.5px] mt-0.5" style={{ color: '#3d5470' }}>{fmtDate(h.date)}</div>
            </div>
          ))
        }
      </FieldCard>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────── */
export default function SearchPage() {
  const { state } = useCAD();
  const { civilians, vehicles, warrants, criminalHistory } = state;
  const { isMobile } = useResponsive();

  const [searchTab,    setSearchTab]    = useState('PERSON');
  const [query,        setQuery]        = useState('');
  const [results,      setResults]      = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [recordTab,    setRecordTab]    = useState('SUMMARY');
  const [mobileView,   setMobileView]   = useState('search'); // 'search' | 'record'

  const runSearch = () => {
    const q = query.trim().toUpperCase();
    if (!q) return;
    if (searchTab === 'PERSON') {
      const found = civilians.filter(c =>
        `${c.firstName} ${c.lastName}`.toUpperCase().includes(q) ||
        (c.ssn || '').replace(/-/g, '').includes(q.replace(/-/g, '')) ||
        fmtDate(c.dob).includes(q)
      );
      setResults(found);
      setSelected(found[0] || null);
      setRecordTab('SUMMARY');
      if (isMobile && found.length) setMobileView('record');
    } else if (searchTab === 'VEHICLE') {
      const found = vehicles.filter(v => v.plate.toUpperCase().includes(q));
      if (found.length) {
        const owner = civilians.find(c => c.id === found[0].ownerId);
        setResults(owner ? [owner] : []);
        setSelected(owner || null);
        setRecordTab('VEHICLES');
        if (isMobile && owner) setMobileView('record');
      } else {
        setResults([]);
        setSelected(null);
      }
    }
  };

  const selectCiv = (civ) => {
    setSelected(civ);
    setRecordTab('SUMMARY');
    if (isMobile) setMobileView('record');
  };

  const civWarrants  = selected ? warrants.filter(w => w.civilianId === selected.id) : [];
  const civHistory   = selected ? criminalHistory.filter(h => h.civilianId === selected.id) : [];
  const civVehicles  = selected ? vehicles.filter(v => selected.vehicles?.includes(v.id)) : [];
  const activeWarrants = civWarrants.filter(w => w.status === 'ACTIVE');

  // Mobile: render full-screen panels one at a time
  if (isMobile) {
    return (
      <div className="h-full overflow-hidden flex flex-col font-ui" style={{ background: '#07101c' }}>
        {mobileView === 'search'
          ? <MobileSearchPanel
              searchTab={searchTab} setSearchTab={k => { setSearchTab(k); setResults([]); setSelected(null); }}
              query={query} setQuery={setQuery} runSearch={runSearch}
              results={results} selected={selected} warrants={warrants}
              selectCiv={selectCiv}
            />
          : <MobileRecordPanel
              selected={selected} recordTab={recordTab} setRecordTab={setRecordTab}
              civWarrants={civWarrants} civHistory={civHistory} civVehicles={civVehicles}
              activeWarrants={activeWarrants}
              onBack={() => setMobileView('search')}
            />
        }
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex font-ui" style={{ background: '#07101c' }}>

      {/* ── LEFT: Search panel (260px) ── */}
      <div className="shrink-0 flex flex-col overflow-hidden"
        style={{ width: 260, background: '#080f1c', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Header */}
        <div className="shrink-0 px-3 pt-3 pb-2.5"
          style={{ background: '#0b1627', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

          <div className="flex items-center gap-1.5 mb-2.5">
            <MdSearch size={13} style={{ color: '#3d5470' }} />
            <span className="text-[9px] font-bold uppercase tracking-[1.2px]" style={{ color: '#3d5470' }}>Search</span>
          </div>

          {/* Type tabs */}
          <div className="flex gap-0.5 mb-2.5">
            {SEARCH_TABS.map(({ key, Icon }) => (
              <button key={key} type="button" onClick={() => { setSearchTab(key); setResults([]); setSelected(null); }}
                className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-md border-none cursor-pointer transition-colors text-[8.5px] font-bold uppercase tracking-[0.4px]"
                style={{
                  background: searchTab === key ? 'rgba(61,130,240,0.2)' : 'rgba(255,255,255,0.04)',
                  color: searchTab === key ? '#3d82f0' : '#3d5470',
                  border: `1px solid ${searchTab === key ? 'rgba(61,130,240,0.35)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                <Icon size={13} />
                {key}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="text-[9px] font-semibold mb-1" style={{ color: '#3d5470' }}>
            {searchTab === 'PERSON' ? 'Search by Name, DOB, or SSN' :
             searchTab === 'VEHICLE' ? 'Search by Plate Number' :
             searchTab === 'PHONE' ? 'Search by Phone Number' :
             'Search by Incident Number'}
          </div>
          <div className="flex gap-1.5">
            <input
              className="flex-1 rounded-lg text-[11.5px] outline-none"
              style={{ background: '#060d18', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 10px', color: '#dde6f1', fontFamily: 'var(--font-ui)' }}
              placeholder={searchTab === 'PERSON' ? 'Full name or SSN…' : searchTab === 'VEHICLE' ? 'ABC-1234' : 'Search…'}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runSearch()}
            />
            <button type="button" onClick={runSearch}
              className="rounded-lg px-3 text-[11px] font-bold border-none cursor-pointer"
              style={{ background: 'rgba(61,130,240,0.2)', color: '#3d82f0', border: '1px solid rgba(61,130,240,0.35)' }}>
              GO
            </button>
          </div>

          <button type="button"
            className="w-full mt-1.5 py-1 rounded-md text-[9.5px] font-semibold border-none cursor-pointer flex items-center justify-center gap-1"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#3d5470', border: '1px solid rgba(255,255,255,0.07)' }}>
            <MdManageSearch size={11} /> Narrow Search
          </button>
        </div>

        {/* Results count */}
        {results.length > 0 && (
          <div className="shrink-0 px-3 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.6px]"
            style={{ color: '#3d5470', background: '#060d18', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            Results ({results.length})
          </div>
        )}

        {/* Result list */}
        <div className="flex-1 overflow-y-auto">
          {results.length === 0 && query && (
            <div className="px-3 py-4 text-center text-[11px]" style={{ color: '#2d3f52' }}>
              No records found
            </div>
          )}
          {results.length === 0 && !query && (
            <div className="px-3 py-4 text-center text-[11px]" style={{ color: '#1e2d3d' }}>
              Enter a name, SSN, or plate to search
            </div>
          )}
          {results.map(civ => {
            const isActive = selected?.id === civ.id;
            const hasWarrant = warrants.some(w => w.civilianId === civ.id && w.status === 'ACTIVE');
            return (
              <div key={civ.id} onClick={() => selectCiv(civ)}
                className="px-3 py-2.5 cursor-pointer transition-colors"
                style={{
                  background: isActive ? 'rgba(61,130,240,0.1)' : 'transparent',
                  borderLeft: `2px solid ${isActive ? '#3d82f0' : 'transparent'}`,
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12.5px] font-bold" style={{ color: isActive ? '#e2eaf8' : '#8da0b5' }}>
                    {civ.firstName} {civ.lastName}
                  </span>
                  {hasWarrant && <MdGavel size={11} style={{ color: '#ef4444', flexShrink: 0 }} />}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: '#3d5470' }}>DOB: {fmtDate(civ.dob)}</div>
                <div className="text-[10px]" style={{ color: '#3d5470' }}>SSN: {maskSSN(civ.ssn)}</div>
                {civ.flags?.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {civ.flags.map(f => (
                      <span key={f} className="px-1 py-0.5 rounded text-[8.5px] font-bold"
                        style={{ background: 'rgba(239,68,68,0.14)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom quick actions */}
        <div className="shrink-0 px-2.5 py-2.5 flex flex-col gap-1.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#0b1627' }}>
          <button type="button"
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10.5px] font-semibold border-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#6b8299', border: '1px solid rgba(255,255,255,0.07)' }}>
            <MdAdd size={13} style={{ color: '#3d82f0' }} /> Create New Record
          </button>
          <button type="button"
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10.5px] font-semibold border-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#6b8299', border: '1px solid rgba(255,255,255,0.07)' }}>
            <MdManageSearch size={13} style={{ color: '#3d82f0' }} /> Advanced Search
          </button>
        </div>
      </div>

      {/* ── RIGHT: Record workspace ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ color: '#1e2d3d' }}>
            <MdSearch size={48} style={{ opacity: 0.15 }} />
            <div className="text-[13px] font-bold tracking-[0.5px]" style={{ color: '#2d3f52' }}>Records Search</div>
            <div className="text-[11.5px]">Enter a name, SSN, or plate number to begin</div>
          </div>
        ) : (
          <>
            {/* Record header */}
            <div className="shrink-0 flex items-center gap-3 px-5 py-3"
              style={{ background: '#0b1627', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(61,130,240,0.14)', border: '1px solid rgba(61,130,240,0.28)' }}>
                <MdPerson size={20} style={{ color: '#3d82f0' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[20px] font-extrabold tracking-[-0.3px]" style={{ color: '#e2eaf8' }}>
                  {selected.firstName} {selected.lastName}
                </div>
                <div className="flex items-center gap-4 mt-px">
                  <span className="text-[11px]" style={{ color: '#3d5470' }}>
                    DOB: <span style={{ color: '#6b8299' }}>{fmtDate(selected.dob)}</span>
                  </span>
                  <span className="text-[11px]" style={{ color: '#3d5470' }}>
                    SSN: <span style={{ color: '#6b8299', fontFamily: 'var(--font-mono)' }}>{maskSSN(selected.ssn)}</span>
                  </span>
                </div>
              </div>
              {activeWarrants.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg shrink-0"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <MdWarning size={14} style={{ color: '#ef4444' }} />
                  <span className="text-[11px] font-bold" style={{ color: '#f87171' }}>
                    WANTED · {activeWarrants.length} WARRANT{activeWarrants.length > 1 ? 'S' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Tab bar */}
            <div className="shrink-0 flex overflow-x-auto"
              style={{ background: '#08111c', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {RECORD_TABS.map(t => (
                <button key={t} type="button" onClick={() => setRecordTab(t)}
                  className="px-3.5 py-2.5 text-[11px] font-bold tracking-[0.4px] border-none cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                  style={{
                    background: 'transparent',
                    color: recordTab === t ? '#3d82f0' : '#3d5470',
                    borderBottom: `2px solid ${recordTab === t ? '#3d82f0' : 'transparent'}`,
                  }}>
                  {t}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {recordTab === 'SUMMARY' && (
                <SummaryTab
                  civ={selected}
                  civVehicles={civVehicles}
                  civHistory={civHistory}
                  activeWarrants={activeWarrants}
                />
              )}
              {recordTab === 'INCIDENTS' && <IncidentsTab civHistory={civHistory} />}
              {recordTab === 'WARRANTS'  && <WarrantsTab  civWarrants={civWarrants} />}
              {recordTab === 'VEHICLES'  && <VehiclesTab  civVehicles={civVehicles} />}
              {['DETAILS','ADDRESSES','CONTACTS','ASSOCIATES','CITATIONS','PROPERTY','REPORTS'].includes(recordTab) && (
                <div className="flex flex-col items-center justify-center gap-2 py-16" style={{ color: '#1e2d3d' }}>
                  <MdDescription size={36} style={{ opacity: 0.18 }} />
                  <div className="text-[12px]" style={{ color: '#2d3f52' }}>{recordTab} data not available in demo</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
