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
  const { penalCode } = state;
  const accent = 'brand';
  const accentHex = '#3d82f0';

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
        subtitle="Public reference for the Florida penal code * fines, jail time, and classifications."
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
        <div className="flex gap-1.5 flex-wrap">
          {['ALL', 'Felony', 'Misdemeanor', 'Infraction'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-all select-none ${typeFilter === t ? '' : 'bg-app-input text-cad-dim border-border-base hover:text-cad-text'}`}
              style={typeFilter === t ? {
                background: TYPE_COLOR[t] || accentHex,
                color: '#fff',
                borderColor: 'transparent',
              } : undefined}
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
            className="text-[12px] font-bold tracking-[0.7px] uppercase mb-3 pb-1.5 border-b border-border-base text-cad-muted"
          >
            {category}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 330px), 1fr))', gap: 12 }}>
            {laws.map(law => (
              <div
                key={law.id}
                className="bg-app-card/70 border border-border-base rounded-xl px-4 py-3.5 backdrop-blur-sm"
                style={{ borderLeft: `3px solid ${TYPE_COLOR[law.type] || accentHex}` }}
              >
                <div className="flex justify-between items-start gap-2.5 mb-2">
                  <div className="text-sm font-bold text-slate-100 leading-tight">{law.name}</div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap border"
                    style={{
                      background: `${TYPE_COLOR[law.type] || accentHex}22`,
                      color: TYPE_COLOR[law.type] || accentHex,
                      borderColor: `${TYPE_COLOR[law.type] || accentHex}55`,
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
