import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import { FormDocWrap, ReportDocument } from '../components/FormDocument';

export default function ReportsCenter() {
  const { state, dispatch } = useCAD();
  const { reports, reportTemplates, currentUser, officers, civilians } = state;

  const [tab, setTab] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formValues, setFormValues] = useState({});

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

  const handleFormChange = (key, val) => {
    setFormValues(prev => ({ ...prev, [key]: val }));
  };

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
        summary: formValues.narrative || formValues.f10 || formValues.f4 || Object.values(formValues).filter(v => typeof v === 'string' && v.length > 10).join(' | ').slice(0, 200),
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
    'Submitted':     'badge-blue',
    'Approved':      'badge-green',
    'Pending Review':'badge-orange',
  };

  return (
    <div className="n-page" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
      <div className="mob-two-pane" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0, flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* ── LEFT: Report list ─────────────────────────────────────── */}
        <div className={`mob-list-panel${(showCreate || selectedReport) ? ' mob-gone' : ''}`} style={{
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          borderRight: '2px solid var(--n-border)', background: 'var(--n-bg-base)',
        }}>
          {/* Header */}
          <div style={{
            padding: '5px 8px', background: 'var(--n-bg-toolbar)',
            borderBottom: '1px solid var(--n-border)', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--n-text)' }}>
              Reports
            </span>
            <button
              className="n-btn n-btn-primary n-btn-xs"
              onClick={() => { setShowCreate(true); setSelectedReport(null); setSelectedTemplate(null); setFormValues({}); }}>
              + File Report
            </button>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--n-border)', flexShrink: 0,
            background: 'var(--n-bg-card)',
          }}>
            {['ALL', 'MY REPORTS', 'PENDING', 'APPROVED'].map(t => (
              <button key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '4px 2px', border: 'none', cursor: 'pointer',
                  fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px',
                  background: tab === t ? 'var(--n-bg-selected)' : 'transparent',
                  color: tab === t ? 'var(--n-text)' : 'var(--n-text-muted)',
                  borderBottom: tab === t ? '2px solid var(--n-blue)' : '2px solid transparent',
                }}>
                {t}
                {t === 'PENDING' && pendingReview.length > 0 && (
                  <span style={{ marginLeft: 2, fontSize: 8, background: 'var(--pr2-bg)', color: 'var(--pr2-text)', padding: '0 3px', fontFamily: 'var(--font-mono)' }}>
                    {pendingReview.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {displayedReports.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--n-text-muted)', fontSize: 11 }}>No reports</div>
            ) : displayedReports.map(r => (
              <div key={r.id}
                onClick={() => { setSelectedReport(r.id); setShowCreate(false); }}
                style={{
                  padding: '6px 8px', cursor: 'pointer',
                  borderBottom: '1px solid var(--n-border-subtle)',
                  borderLeft: selectedReport === r.id ? '3px solid var(--n-blue)' : '3px solid transparent',
                  background: selectedReport === r.id ? 'var(--n-bg-selected)' : 'transparent',
                }}>
                <div style={{ display: 'flex', gap: 5, marginBottom: 2, alignItems: 'center' }}>
                  <span className={`n-badge ${statusColor[r.status] || 'badge-gray'}`} style={{ fontSize: 8 }}>{r.status}</span>
                  <span style={{ fontSize: 8, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>{r.date}</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 1, color: 'var(--n-text)' }}>{r.type}</div>
                <div style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{r.caseNumber}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Form document view ─────────────────────────────── */}
        <div className={`mob-detail-panel${(!showCreate && !selectedReport) ? ' mob-gone' : ''}`} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#3a3a3a' }}>
          {/* Mobile back button */}
          <button className="mob-back-btn" onClick={() => { setShowCreate(false); setSelectedReport(null); setSelectedTemplate(null); }}>
            ← Back to Reports
          </button>

          {/* Template picker */}
          {showCreate && !selectedTemplate && (
            <div style={{ flex: 1, overflow: 'auto', padding: 24, background: 'var(--n-bg-base)' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--n-text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Select Report Type
                </div>
                <button className="n-btn n-btn-ghost n-btn-sm" onClick={() => setShowCreate(false)}>✕ Cancel</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {reportTemplates.map(t => (
                  <button key={t.id}
                    onClick={() => { setSelectedTemplate(t); setFormValues({}); }}
                    style={{
                      background: 'var(--n-bg-card)', border: '1px solid var(--n-border)',
                      padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                      borderLeft: '4px solid var(--n-blue)',
                      fontFamily: 'var(--font-ui)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--n-bg-elevated)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--n-bg-card)'; }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--n-text)', marginBottom: 4 }}>{t.name}</div>
                    <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      {t.sections
                        ? `${t.sections.reduce((a, s) => a + s.fields.length, 0)} fields · ${t.sections.length} sections`
                        : `${t.fields?.length || 0} fields`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Editable form document */}
          {showCreate && selectedTemplate && (
            <>
              {/* Toolbar */}
              <div style={{
                padding: '5px 10px', background: 'var(--n-bg-toolbar)',
                borderBottom: '1px solid var(--n-border)', display: 'flex',
                alignItems: 'center', gap: 8, flexShrink: 0,
              }}>
                <button className="n-btn n-btn-secondary n-btn-xs" onClick={() => setSelectedTemplate(null)}>
                  ← Templates
                </button>
                <span style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Filing: {selectedTemplate.name} · Badge: {me?.badge || '—'}
                </span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  <button className="n-btn n-btn-ghost n-btn-xs" onClick={() => setShowCreate(false)}>Cancel</button>
                  <button className="n-btn n-btn-primary n-btn-xs" onClick={submitReport}>Submit Report</button>
                </div>
              </div>
              {/* Document */}
              <div style={{ flex: 1, overflow: 'auto', background: '#3a3a3a' }}>
                <FormDocWrap>
                  <ReportDocument
                    type={selectedTemplate.name}
                    template={selectedTemplate}
                    data={formValues}
                    editable
                    onChange={handleFormChange}
                    meta={{ caseNumber: `${me?.deptShort || 'RMS'}-${new Date().getFullYear()}-XXXX`, status: 'Draft' }}
                  />
                </FormDocWrap>
              </div>
            </>
          )}

          {/* Empty state */}
          {!showCreate && !selReport && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 12, color: '#888', padding: 24, background: '#3a3a3a',
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#aaa', marginBottom: 4 }}>No report selected</div>
                <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Select a report or file a new one
                </div>
              </div>
              <button className="n-btn n-btn-primary n-btn-xs" onClick={() => setShowCreate(true)}>File New Report</button>
            </div>
          )}

          {/* Submitted report viewer */}
          {!showCreate && selReport && (
            <>
              {/* Review toolbar */}
              <div style={{
                padding: '5px 10px', background: 'var(--n-bg-toolbar)',
                borderBottom: '1px solid var(--n-border)', display: 'flex',
                alignItems: 'center', gap: 8, flexShrink: 0,
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--n-text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {selReport.type}
                </span>
                <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {selReport.caseNumber} · {selReport.date}
                </span>
                <span className={`n-badge ${statusColor[selReport.status] || 'badge-gray'}`} style={{ fontSize: 9 }}>
                  {selReport.status}
                </span>
                {isAdmin && (
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
                    {selReport.status !== 'Approved' && (
                      <button className="n-btn n-btn-success n-btn-xs" onClick={() => reviewReport(selReport.id, 'Approved')}>
                        Approve
                      </button>
                    )}
                    {selReport.status === 'Submitted' && (
                      <button className="n-btn n-btn-warning n-btn-xs" onClick={() => reviewReport(selReport.id, 'Pending Review')}>
                        Flag for Review
                      </button>
                    )}
                    {selReport.status !== 'Submitted' && (
                      <button className="n-btn n-btn-secondary n-btn-xs" onClick={() => reviewReport(selReport.id, 'Submitted')}>
                        Reset
                      </button>
                    )}
                  </div>
                )}
              </div>
              {/* Document */}
              <div style={{ flex: 1, overflow: 'auto', background: '#3a3a3a' }}>
                <FormDocWrap>
                  <ReportDocument
                    type={selReport.type}
                    template={reportTemplates.find(t => t.name === selReport.type)}
                    data={selReport.formData || {
                      f10: selReport.summary,
                      f4: selReport.summary,
                      f8: selReport.summary,
                    }}
                    editable={false}
                    meta={{ caseNumber: selReport.caseNumber, status: selReport.status }}
                  />
                </FormDocWrap>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
