import { useState } from 'react';
import { useCAD } from '../store/cadStore';

export default function WarrantControl() {
  const { state, dispatch } = useCAD();
  const { warrants, civilians, officers, currentUser } = state;
  const [filter, setFilter] = useState('ACTIVE');
  const [selected, setSelected] = useState(null);
  const [showIssue, setShowIssue] = useState(false);
  const [form, setForm] = useState({ civilianId: '', type: 'Arrest Warrant', charge: '', notes: '' });

  const me = officers.find(o => o.id === currentUser?.id);

  const filtered = filter === 'ALL' ? warrants : warrants.filter(w => w.status === filter);
  const selWarrant = selected != null ? warrants.find(w => w.id === selected) : null;
  const selCiv = selWarrant ? civilians.find(c => c.id === selWarrant.civilianId) : null;

  const activeCount = warrants.filter(w => w.status === 'ACTIVE').length;

  const issueWarrant = () => {
    if (!form.civilianId || !form.charge) return;
    const civ = civilians.find(c => c.id === Number(form.civilianId));
    dispatch({
      type: 'ADD_WARRANT',
      payload: {
        civilianId: Number(form.civilianId),
        civilianName: civ ? `${civ.firstName} ${civ.lastName}` : '—',
        type: form.type,
        charge: form.charge,
        issuedBy: `${me?.rank || ''} ${me?.name || currentUser?.name} (${me?.badge})`,
        issuedDate: new Date().toISOString().split('T')[0],
        notes: form.notes,
      },
    });
    setForm({ civilianId: '', type: 'Arrest Warrant', charge: '', notes: '' });
    setShowIssue(false);
    setFilter('ACTIVE');
  };

  const serveWarrant = (id) => {
    dispatch({ type: 'SERVE_WARRANT', payload: id });
    setSelected(null);
  };

  return (
    <div className="n-page" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
      {/* Header */}
      <div style={{
        display: 'flex', gap: 20, alignItems: 'center', padding: '5px 10px',
        background: 'var(--n-bg-panel)', borderBottom: '1px solid var(--n-border)', flexShrink: 0,
      }}>
        {[
          { label: 'ACTIVE', value: activeCount, color: 'var(--pr1-text)' },
          { label: 'SERVED', value: warrants.filter(w => w.status === 'SERVED').length, color: 'var(--st-av-text)' },
          { label: 'TOTAL', value: warrants.length, color: 'var(--n-text-data)' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 8, color: 'var(--n-text-muted)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>{s.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {['ALL','ACTIVE','SERVED'].map(f => (
            <button key={f} className={`n-btn n-btn-xs ${filter === f ? 'n-btn-primary' : 'n-btn-secondary'}`}
              onClick={() => setFilter(f)}>{f}</button>
          ))}
          <button className="n-btn n-btn-danger n-btn-sm" onClick={() => setShowIssue(true)}>
            Issue Warrant
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 0, flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Warrant Table */}
        <div className="n-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderBottom: 'none', borderRight: 'none' }}>
          <div className="n-panel-header">
            <div className="n-panel-title">Warrant Registry</div>
            <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{filtered.length} WARRANTS</span>
          </div>
          <div className="n-panel-body scroll-y">
            {filtered.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--n-text-muted)', fontSize: 11 }}>No warrants on file</div>
            ) : (
              <table className="n-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>Charge</th>
                    <th>Issued By</th>
                    <th>Issue Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(w => (
                    <tr key={w.id} className={selected === w.id ? 'selected' : ''} onClick={() => setSelected(w.id)}>
                      <td>
                        <span className={`n-badge ${w.status === 'ACTIVE' ? 'badge-red' : 'badge-green'}`}>{w.status}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{w.civilianName}</td>
                      <td><span className="n-badge badge-gray">{w.type}</span></td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11 }}>{w.charge}</td>
                      <td style={{ fontSize: 10, color: 'var(--n-text-dim)' }}>{w.issuedBy}</td>
                      <td><span className="n-data" style={{ fontSize: 10 }}>{w.issuedDate}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="n-panel" style={{ borderRadius: 0, borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}>
          {!selWarrant ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--n-text-muted)', padding: 20 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.25">
                <rect x="4" y="1" width="16" height="22" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/>
              </svg>
              <span style={{ fontSize: 11, textAlign: 'center' }}>Select a warrant to view details</span>
            </div>
          ) : (
            <>
              <div className="n-panel-header">
                <div className="n-panel-title">Warrant Detail</div>
                <span className={`n-badge ${selWarrant.status === 'ACTIVE' ? 'badge-red' : 'badge-green'}`}>
                  {selWarrant.status}
                </span>
              </div>
              <div className="n-panel-body scroll-y" style={{ padding: 12 }}>
                <div className="n-card" style={{ marginBottom: 8, borderLeft: selWarrant.status === 'ACTIVE' ? '3px solid var(--pr1-text)' : '3px solid var(--st-av-text)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{selWarrant.civilianName}</div>
                  <span className="n-badge badge-gray">{selWarrant.type}</span>
                </div>

                <div className="n-card" style={{ marginBottom: 8 }}>
                  <div className="detail-row"><span className="detail-label">Charge</span><span className="detail-value" style={{ fontWeight: 500 }}>{selWarrant.charge}</span></div>
                  <div className="detail-row"><span className="detail-label">Issued By</span><span className="detail-value">{selWarrant.issuedBy}</span></div>
                  <div className="detail-row"><span className="detail-label">Issue Date</span><span className="detail-value-mono">{selWarrant.issuedDate}</span></div>
                  {selWarrant.notes && <div className="detail-row"><span className="detail-label">Notes</span><span className="detail-value" style={{ fontStyle: 'italic', color: 'var(--n-text-dim)' }}>{selWarrant.notes}</span></div>}
                </div>

                {selCiv && (
                  <div className="n-card" style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Subject Information</div>
                    <div className="detail-row"><span className="detail-label">DOB</span><span className="detail-value-mono">{selCiv.dob}</span></div>
                    <div className="detail-row"><span className="detail-label">SSN</span><span className="detail-value-mono">{selCiv.ssn}</span></div>
                    <div className="detail-row"><span className="detail-label">Address</span><span className="detail-value">{selCiv.address}</span></div>
                    <div className="detail-row"><span className="detail-label">DL Status</span><span className="detail-value">{selCiv.dlStatus}</span></div>
                  </div>
                )}

                {selWarrant.status === 'ACTIVE' && (
                  <button className="n-btn n-btn-success" style={{ width: '100%', justifyContent: 'center' }} onClick={() => serveWarrant(selWarrant.id)}>
                    Mark as Served
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Issue Warrant Modal */}
      {showIssue && (
        <div className="n-overlay" onClick={e => e.target === e.currentTarget && setShowIssue(false)}>
          <div className="n-modal">
            <div className="n-modal-header">
              <div className="n-modal-title">Issue New Warrant</div>
              <button className="n-btn n-btn-ghost n-btn-sm" onClick={() => setShowIssue(false)}>✕</button>
            </div>
            <div className="n-modal-body">
              <div className="n-field">
                <label className="n-label">Subject *</label>
                <select className="n-select" value={form.civilianId} onChange={e => setForm(p => ({ ...p, civilianId: e.target.value }))}>
                  <option value="">Select civilian...</option>
                  {civilians.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.dob}</option>
                  ))}
                </select>
              </div>
              <div className="n-field">
                <label className="n-label">Warrant Type</label>
                <select className="n-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option>Arrest Warrant</option>
                  <option>Bench Warrant</option>
                  <option>Search Warrant</option>
                </select>
              </div>
              <div className="n-field">
                <label className="n-label">Charge / Basis *</label>
                <input className="n-input" placeholder="e.g. Possession of Controlled Substance" value={form.charge} onChange={e => setForm(p => ({ ...p, charge: e.target.value }))} />
              </div>
              <div className="n-field">
                <label className="n-label">Notes</label>
                <textarea className="n-textarea" rows={2} placeholder="Subject description, last known location, etc." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div className="n-modal-footer">
              <button className="n-btn n-btn-secondary" onClick={() => setShowIssue(false)}>Cancel</button>
              <button className="n-btn n-btn-danger" onClick={issueWarrant} disabled={!form.civilianId || !form.charge}>
                Issue Warrant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
