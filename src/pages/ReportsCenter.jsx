import { useState } from 'react';
import { useCAD } from '../store/cadStore';

export default function ReportsCenter() {
  const { state, dispatch } = useCAD();
  const { reports, reportTemplates, currentUser, officers, civilians } = state;

  const [tab, setTab] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const me = officers.find(o => o.id === currentUser?.id);

  const myReports = reports.filter(r => r.officerBadge === me?.badge);
  const pendingReview = reports.filter(r => r.status === 'Pending Review');

  const displayedReports =
    tab === 'MY REPORTS' ? myReports :
    tab === 'PENDING' ? pendingReview :
    tab === 'APPROVED' ? reports.filter(r => r.status === 'Approved') :
    reports;

  const selReport = selectedReport ? reports.find(r => r.id === selectedReport) : null;

  const submitReport = () => {
    if (!selectedTemplate) return;
    dispatch({
      type: 'ADD_REPORT',
      payload: {
        type: selectedTemplate.name,
        caseNumber: `${me?.deptShort || 'RMS'}-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        officerBadge: me?.badge || currentUser?.badge || '—',
        callId: formValues.callId || null,
        civilianId: null,
        summary: formValues.narrative || formValues.supplement_narrative || Object.values(formValues).filter(Boolean).join(' | ').slice(0, 200),
        formData: formValues,
      },
    });
    setShowCreate(false);
    setSelectedTemplate(null);
    setFormValues({});
    setTab('MY REPORTS');
  };

  const reviewReport = (id, status) => {
    dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id, status } });
  };

  const statusColor = {
    'Submitted': 'badge-blue',
    'Approved': 'badge-green',
    'Pending Review': 'badge-orange',
  };

  return (
    <div className="n-page" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 0, flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* LEFT: Report List */}
        <div className="n-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderBottom: 'none', borderRight: 'none' }}>
          <div className="n-panel-header">
            <div className="n-panel-title">Reports</div>
            <button className="n-btn n-btn-primary n-btn-xs" onClick={() => { setShowCreate(true); setSelectedReport(null); }}>
              + File Report
            </button>
          </div>
          <div className="n-tabs">
            {['ALL', 'MY REPORTS', 'PENDING', 'APPROVED'].map(t => (
              <button key={t} className={`n-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)} style={{ fontSize: 9 }}>
                {t}
                {t === 'PENDING' && pendingReview.length > 0 && (
                  <span style={{ marginLeft: 3, fontSize: 8, background: 'var(--pr2-bg)', color: 'var(--pr2-text)', borderRadius: 2, padding: '0 3px', fontFamily: 'var(--font-mono)' }}>
                    {pendingReview.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="n-panel-body scroll-y">
            {displayedReports.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--n-text-muted)', fontSize: 11 }}>No reports</div>
            ) : displayedReports.map(r => (
              <div key={r.id}
                className="n-card n-card-hover"
                style={{
                  margin: '4px 8px', padding: '7px 9px', borderRadius: 3, cursor: 'pointer',
                  border: selectedReport === r.id ? '1px solid var(--n-border-accent)' : '1px solid var(--n-border-subtle)',
                  background: selectedReport === r.id ? 'var(--n-bg-selected)' : 'var(--n-bg-card)',
                }}
                onClick={() => { setSelectedReport(r.id); setShowCreate(false); }}>
                <div style={{ display: 'flex', gap: 5, marginBottom: 3, alignItems: 'center' }}>
                  <span className={`n-badge ${statusColor[r.status] || 'badge-gray'}`}>{r.status}</span>
                  <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>{r.date}</span>
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 2 }}>{r.type}</div>
                <div className="n-data" style={{ fontSize: 10 }}>{r.caseNumber}</div>
                <div style={{ fontSize: 10, color: 'var(--n-text-dim)', marginTop: 2 }}>
                  Badge: {r.officerBadge}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Detail / Create */}
        <div className="n-panel" style={{ borderRadius: 0, borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}>
          {showCreate && !selectedTemplate && (
            <>
              <div className="n-panel-header">
                <div className="n-panel-title">Select Report Template</div>
                <button className="n-btn n-btn-ghost n-btn-sm" onClick={() => setShowCreate(false)}>✕</button>
              </div>
              <div className="n-panel-body scroll-y" style={{ padding: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--n-text-dim)', marginBottom: 12 }}>
                  Select the appropriate template for this report. All reports are subject to supervisor review.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {reportTemplates.map(t => (
                    <button key={t.id}
                      onClick={() => { setSelectedTemplate(t); setFormValues({}); }}
                      style={{
                        background: 'var(--n-bg-card)', border: '1px solid var(--n-border)',
                        borderRadius: 'var(--n-radius)', padding: '12px 14px', textAlign: 'left',
                        cursor: 'pointer', transition: 'all 0.1s', fontFamily: 'var(--font-ui)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--n-bg-elevated)'; e.currentTarget.style.borderColor = 'var(--n-blue)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--n-bg-card)'; e.currentTarget.style.borderColor = 'var(--n-border)'; }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--n-text)', marginBottom: 3 }}>{t.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--n-text-dim)' }}>{t.fields.length} fields required</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {showCreate && selectedTemplate && (
            <>
              <div className="n-panel-header">
                <div className="n-panel-title">{selectedTemplate.name}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="n-btn n-btn-secondary n-btn-sm" onClick={() => setSelectedTemplate(null)}>← Templates</button>
                  <button className="n-btn n-btn-ghost n-btn-sm" onClick={() => setShowCreate(false)}>✕</button>
                </div>
              </div>
              <div className="n-panel-body scroll-y" style={{ padding: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div className="n-field">
                      <label className="n-label">Case Number (Auto-Generated)</label>
                      <input className="n-input" value={`${me?.deptShort || 'RMS'}-${new Date().getFullYear()}-XXXX`} readOnly style={{ opacity: 0.6 }} />
                    </div>
                    <div className="n-field">
                      <label className="n-label">Filing Officer Badge</label>
                      <input className="n-input" value={me?.badge || '—'} readOnly style={{ opacity: 0.6 }} />
                    </div>
                  </div>
                  {selectedTemplate.fields.map(f => (
                    <div key={f.id} className="n-field">
                      <label className="n-label">{f.label}{f.required && ' *'}</label>
                      {f.type === 'textarea' ? (
                        <textarea className="n-textarea" rows={3}
                          placeholder={f.label}
                          value={formValues[f.id] || ''}
                          onChange={e => setFormValues(p => ({ ...p, [f.id]: e.target.value }))} />
                      ) : f.type === 'dropdown' ? (
                        <select className="n-select"
                          value={formValues[f.id] || ''}
                          onChange={e => setFormValues(p => ({ ...p, [f.id]: e.target.value }))}>
                          <option value="">Select...</option>
                          {f.options?.map(o => <option key={o}>{o}</option>)}
                        </select>
                      ) : f.type === 'checkbox' ? (
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12 }}>
                          <input type="checkbox"
                            checked={!!formValues[f.id]}
                            onChange={e => setFormValues(p => ({ ...p, [f.id]: e.target.checked }))
                            } />
                          <span style={{ color: 'var(--n-text)' }}>{f.label}</span>
                        </label>
                      ) : f.type === 'civilian_lookup' ? (
                        <select className="n-select"
                          value={formValues[f.id] || ''}
                          onChange={e => setFormValues(p => ({ ...p, [f.id]: e.target.value }))}>
                          <option value="">Select civilian...</option>
                          {civilians.map(c => (
                            <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                          ))}
                        </select>
                      ) : f.type === 'badge_lookup' ? (
                        <select className="n-select"
                          value={formValues[f.id] || ''}
                          onChange={e => setFormValues(p => ({ ...p, [f.id]: e.target.value }))}>
                          <option value="">Select officer...</option>
                          {officers.map(o => (
                            <option key={o.id} value={o.badge}>{o.badge} — {o.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input className="n-input"
                          type={f.type === 'datetime' ? 'datetime-local' : 'text'}
                          placeholder={f.label}
                          value={formValues[f.id] || ''}
                          onChange={e => setFormValues(p => ({ ...p, [f.id]: e.target.value }))} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '8px 14px', borderTop: '1px solid var(--n-border)', display: 'flex', gap: 6, justifyContent: 'flex-end', background: 'var(--n-bg-card)', flexShrink: 0 }}>
                <button className="n-btn n-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="n-btn n-btn-primary" onClick={submitReport}>Submit Report</button>
              </div>
            </>
          )}

          {!showCreate && !selReport && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--n-text-muted)', padding: 24 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--n-text-dim)', marginBottom: 4 }}>No report selected</div>
                <div style={{ fontSize: 10, color: 'var(--n-text-muted)' }}>Select a report from the list or file a new report</div>
              </div>
              <button className="n-btn n-btn-primary" onClick={() => setShowCreate(true)}>File New Report</button>
            </div>
          )}

          {!showCreate && selReport && (
            <>
              <div className="n-panel-header">
                <div>
                  <div className="n-panel-title">{selReport.type}</div>
                  <div style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
                    {selReport.caseNumber} · {selReport.date}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className={`n-badge ${statusColor[selReport.status] || 'badge-gray'}`} style={{ fontSize: 10 }}>
                    {selReport.status}
                  </span>
                  {isAdmin && selReport.status === 'Submitted' && (
                    <button className="n-btn n-btn-warning n-btn-sm" onClick={() => reviewReport(selReport.id, 'Pending Review')}>
                      Flag for Review
                    </button>
                  )}
                  {isAdmin && selReport.status === 'Pending Review' && (
                    <button className="n-btn n-btn-success n-btn-sm" onClick={() => reviewReport(selReport.id, 'Approved')}>
                      Approve
                    </button>
                  )}
                  {isAdmin && selReport.status !== 'Approved' && (
                    <button className="n-btn n-btn-danger n-btn-sm" onClick={() => reviewReport(selReport.id, 'Submitted')}>
                      Reject
                    </button>
                  )}
                </div>
              </div>
              <div className="n-panel-body scroll-y" style={{ padding: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div className="n-card" style={{ padding: '7px 10px' }}>
                    <div className="n-label" style={{ marginBottom: 3 }}>Case Number</div>
                    <div className="n-data" style={{ fontSize: 12 }}>{selReport.caseNumber}</div>
                  </div>
                  <div className="n-card" style={{ padding: '7px 10px' }}>
                    <div className="n-label" style={{ marginBottom: 3 }}>Filing Officer</div>
                    <div style={{ fontSize: 12 }}>{selReport.officerBadge}</div>
                  </div>
                  <div className="n-card" style={{ padding: '7px 10px' }}>
                    <div className="n-label" style={{ marginBottom: 3 }}>Report Date</div>
                    <div className="n-data" style={{ fontSize: 12 }}>{selReport.date}</div>
                  </div>
                  <div className="n-card" style={{ padding: '7px 10px' }}>
                    <div className="n-label" style={{ marginBottom: 3 }}>Call Reference</div>
                    <div className="n-data" style={{ fontSize: 12 }}>{selReport.callId || '—'}</div>
                  </div>
                </div>

                <div className="n-card">
                  <div className="n-label" style={{ marginBottom: 6 }}>Narrative Summary</div>
                  <div style={{ fontSize: 12, color: 'var(--n-text)', lineHeight: 1.7 }}>
                    {selReport.summary || 'No narrative on file.'}
                  </div>
                </div>

                {isAdmin && (
                  <div className="n-card" style={{ marginTop: 10 }}>
                    <div className="n-label" style={{ marginBottom: 6 }}>Supervisor Review</div>
                    <div style={{ fontSize: 11, color: 'var(--n-text-dim)', marginBottom: 8 }}>
                      Current Status: <span style={{ color: 'var(--n-text)' }}>{selReport.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="n-btn n-btn-success n-btn-sm" onClick={() => reviewReport(selReport.id, 'Approved')}>
                        Mark Approved
                      </button>
                      <button className="n-btn n-btn-warning n-btn-sm" onClick={() => reviewReport(selReport.id, 'Pending Review')}>
                        Send for Review
                      </button>
                      <button className="n-btn n-btn-secondary n-btn-sm" onClick={() => reviewReport(selReport.id, 'Submitted')}>
                        Reset to Submitted
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
