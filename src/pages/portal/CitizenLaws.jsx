import { useState, useMemo } from 'react';
import { useCAD } from '../../store/cadStore';
import { MdMenuBook, MdSearch } from 'react-icons/md';
import { PortalPage, PortalHeader, PORTAL_INPUT } from './PortalKit';

const TYPE_COLOR = {
  Felony:      '#ff5454',
  Misdemeanor: '#f5a93b',
  Infraction:  '#4d97ff',
};

export default function CitizenLaws() {
  const { state } = useCAD();
  const { penalCode, currentUser } = state;
  const accent = currentUser?.portal === 'business' ? '#44aacc' : '#9090cc';

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const categories = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = penalCode.filter(p => {
      const matchesQ = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchesType = typeFilter === 'ALL' || p.type === typeFilter;
      return matchesQ && matchesType;
    });
    const groups = {};
    filtered.forEach(p => { (groups[p.category] ||= []).push(p); });
    return groups;
  }, [penalCode, query, typeFilter]);

  const total = Object.values(categories).reduce((a, g) => a + g.length, 0);

  return (
    <PortalPage>
      <PortalHeader
        icon={MdMenuBook}
        title="State Laws & Statutes"
        subtitle="Public reference for the Florida penal code — fines, jail time, and classifications."
        accent={accent}
      />

      {/* Controls */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <MdSearch
            size={18}
            color="rgba(160,185,215,0.5)"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            className={`${PORTAL_INPUT} pl-[38px]`}
            placeholder="Search laws by name, code, or category…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {['ALL', 'Felony', 'Misdemeanor', 'Infraction'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded border cursor-pointer transition-all select-none"
              style={{
                background: typeFilter === t ? (TYPE_COLOR[t] || accent) : 'rgba(255,255,255,0.05)',
                color: typeFilter === t ? '#fff' : 'rgba(200,220,240,0.7)',
                borderColor: typeFilter === t ? 'transparent' : 'rgba(255,255,255,0.12)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-3.5">{total} statute{total !== 1 ? 's' : ''} shown</div>

      {Object.keys(categories).length === 0 && (
        <div className="text-center py-[60px] text-slate-500 text-sm">
          No statutes match your search.
        </div>
      )}

      {Object.entries(categories).map(([category, laws]) => (
        <div key={category} className="mb-[26px]">
          <div
            className="text-sm font-bold tracking-[0.6px] uppercase mb-3 pb-1.5 border-b border-white/[0.08]"
            style={{ color: accent }}
          >
            {category}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 12 }}>
            {laws.map(law => (
              <div
                key={law.id}
                className="bg-white/[0.035] border border-white/[0.08] rounded-[10px] px-4 py-3.5"
                style={{ borderLeft: `3px solid ${TYPE_COLOR[law.type] || accent}` }}
              >
                <div className="flex justify-between items-start gap-2.5 mb-2">
                  <div className="text-sm font-bold text-slate-100 leading-tight">{law.name}</div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap border"
                    style={{
                      background: `${TYPE_COLOR[law.type] || accent}22`,
                      color: TYPE_COLOR[law.type] || accent,
                      borderColor: `${TYPE_COLOR[law.type] || accent}55`,
                    }}
                  >
                    {law.type}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mb-2.5">{law.code}</div>
                <div className="flex gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Fine: </span>
                    <span className="text-green-400 font-semibold">${law.fine?.toLocaleString() || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Jail: </span>
                    <span className="text-amber-400 font-semibold">{law.jailTime || '—'}</span>
                  </div>
                  {law.points != null && (
                    <div>
                      <span className="text-slate-500">Pts: </span>
                      <span className="text-red-400 font-semibold">{law.points}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </PortalPage>
  );
}
