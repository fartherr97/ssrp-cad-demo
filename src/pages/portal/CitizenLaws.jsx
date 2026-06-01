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
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <MdSearch size={18} color="rgba(160,185,215,0.5)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            style={{ ...PORTAL_INPUT, paddingLeft: 38 }}
            placeholder="Search laws by name, code, or category…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['ALL', 'Felony', 'Misdemeanor', 'Infraction'].map(t => (
            <button key={t}
              onClick={() => setTypeFilter(t)}
              className="n-btn"
              style={{
                background: typeFilter === t ? (TYPE_COLOR[t] || accent) : 'rgba(255,255,255,0.05)',
                color: typeFilter === t ? '#fff' : 'rgba(200,220,240,0.7)',
                border: '1px solid ' + (typeFilter === t ? 'transparent' : 'rgba(255,255,255,0.12)'),
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'rgba(150,175,205,0.5)', marginBottom: 14 }}>{total} statute{total !== 1 ? 's' : ''} shown</div>

      {Object.keys(categories).length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(150,175,205,0.4)', fontSize: 14 }}>
          No statutes match your search.
        </div>
      )}

      {Object.entries(categories).map(([category, laws]) => (
        <div key={category} style={{ marginBottom: 26 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase',
            color: accent, marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            {category}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 12 }}>
            {laws.map(law => (
              <div key={law.id} style={{
                background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)',
                borderLeft: `3px solid ${TYPE_COLOR[law.type] || accent}`,
                borderRadius: 10, padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e6eef6', lineHeight: 1.25 }}>{law.name}</div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap',
                    background: `${TYPE_COLOR[law.type] || accent}22`, color: TYPE_COLOR[law.type] || accent,
                    border: `1px solid ${TYPE_COLOR[law.type] || accent}55`,
                  }}>{law.type}</span>
                </div>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'rgba(160,185,215,0.7)', marginBottom: 10 }}>{law.code}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                  <div><span style={{ color: 'rgba(150,175,205,0.5)' }}>Fine: </span><span style={{ color: '#2fd968', fontWeight: 600 }}>${law.fine?.toLocaleString() || 0}</span></div>
                  <div><span style={{ color: 'rgba(150,175,205,0.5)' }}>Jail: </span><span style={{ color: '#f5a93b', fontWeight: 600 }}>{law.jailTime || '—'}</span></div>
                  {law.points != null && <div><span style={{ color: 'rgba(150,175,205,0.5)' }}>Pts: </span><span style={{ color: '#ff5454', fontWeight: 600 }}>{law.points}</span></div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </PortalPage>
  );
}
