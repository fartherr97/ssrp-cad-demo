import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCAD } from '../store/cadStore';
import { FormDocWrap, ReportDocument } from '../components/FormDocument';
import {
  MdDirectionsCar, MdGavel, MdPerson, MdReport,
  MdRecordVoiceOver, MdNote, MdDescription, MdAssignment,
} from 'react-icons/md';

const TEMPLATE_ICONS = {
  'Traffic Stop':      MdDirectionsCar,
  'Use of Force':      MdGavel,
  'Arrest Report':     MdPerson,
  'Incident Report':   MdReport,
  'Field Interview':   MdRecordVoiceOver,
  'Supplement Report': MdNote,
};

const BUILTIN_NAMES = Object.keys(TEMPLATE_ICONS);

const STATUS_CLS = {
  'Submitted':      'badge-blue',
  'Approved':       'badge-green',
  'Pending Review': 'badge-orange',
  'Denied':         'badge-red',
};

export default function ReportsCenter() {
  const { state, dispatch } = useCAD();
  const { reports, reportTemplates, currentUser, officers } = state;
  const navigate = useNavigate();

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formValues, setFormValues]             = useState({});
  const [selectedReport, setSelectedReport]     = useState(null);
  const [reportTab, setReportTab]               = useState('MINE');

  const isAdmin   = currentUser?.role === 'admin' || currentUser?.role === 'dispatch';
  const me        = officers.find(o => o.id === currentUser?.id);
  const myReports = reports.filter(r => r.officerBadge === me?.badge);
  const pendingReports = reports.filter(r => r.status === 'Submitted' || r.status === 'Pending Review');

  const displayedReports =
    reportTab === 'MINE'    ? myReports :
    reportTab === 'PENDING' ? pendingReports :
    reports;

  const selReport = selectedReport ? reports.find(r => r.id === selectedReport) : null;

  const builtinTpls = reportTemplates.filter(t => BUILTIN_NAMES.includes(t.name));
  const customTpls  = reportTemplates.filter(t => !BUILTIN_NAMES.includes(t.name));

  const handleFormChange = (key, val) => setFormValues(prev => ({ ...prev, [key]: val }));

  const applySignature = () => {
    if (currentUser?.signature) {
      setFormValues(fv => ({ ...fv, _officerSig: currentUser.signature }));
    }
  };

  const submitReport = () => {
    if (!selectedTemplate) return;
    const caseNum = `${me?.deptShort || 'RMS'}-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    dispatch({
      type: 'ADD_REPORT',
      payload: {
        type: selectedTemplate.name,
        caseNumber: caseNum,
        officerBadge: me?.badge || currentUser?.badge || '—',
        callId: formValues.callId || null,
        civilianId: null,
        summary: formValues.narrative || formValues.f10 || formValues.f4 || formValues.f8 ||
          Object.values(formValues).filter(v => typeof v === 'string' && v.length > 10).join(' | ').slice(0, 200) ||
          'Report submitted via CAD',
        formData: { ...formValues },
      },
    });
    setSelectedTemplate(null);
    setFormValues({});
    setReportTab('MINE');
  };

  const reviewReport = (id, status) => {
    dispatch({ type: 'UPDATE_REPORT_STATUS', payload: { id, status } });
  };

  const showForm   = selectedTemplate !== null;
  const showReport = !showForm && selReport !== null;
  const hasSig     = !!currentUser?.signature;
  const sigApplied = !!formValues._officerSig;

  const draftMeta = {
    caseNumber: `${me?.deptShort || 'RMS'}-${new Date().getFullYear()}-DRAFT`,
    status: 'Draft',
    officerSig:  formValues._officerSig || null,
    supervisorSig: null,
    onApplySig:  hasSig && !sigApplied ? applySignature : null,
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', fontFamily: 'var(--font-ui)' }}>

      {/* ══ LEFT: Template picker ══════════════════════════════════ */}
      <div style={{
        width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column',
        borderRight: '1px solid var(--n-border)', background: 'var(--n-bg-toolbar)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--n-border)', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--n-text)' }}>File New Report</div>
          <div style={{ fontSize: 10, color: 'var(--n-text-muted)', marginTop: 2 }}>Select a report type to begin</div>
        </div>

        {/* Template list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--n-text-muted)', padding: '4px 6px 8px' }}>Standard Reports</div>

          {(builtinTpls.length > 0 ? builtinTpls : BUILTIN_NAMES.map((n, i) => ({ id: `builtin-${i}`, name: n, fields: [] }))).map(t => {
            const IconComp = TEMPLATE_ICONS[t.name] || MdDescription;
            const isSelected = selectedTemplate?.id === t.id;
            const fieldCount = t.sections
              ? t.sections.reduce((a, s) => a + s.fields.length, 0)
              : (t.fields?.length || 0);
            return (
              <button key={t.id}
                onClick={() => {
                  const tpl = reportTemplates.find(r => r.name === t.name) || t;
                  setSelectedTemplate(tpl);
                  setFormValues({});
                  setSelectedReport(null);
                }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 8px', marginBottom: 2, textAlign: 'left', cursor: 'pointer',
                  background: isSelected ? 'rgba(59,130,246,0.12)' : 'transparent',
                  border: 'none',
                  borderLeft: `3px solid ${isSelected ? '#3b82f6' : 'transparent'}`,
                  color: isSelected ? '#60a5fa' : 'var(--n-text)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <IconComp size={17} style={{ flexShrink: 0, opacity: 0.75 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: isSelected ? 700 : 500, lineHeight: 1.3, color: isSelected ? '#60a5fa' : 'var(--n-text)' }}>{t.name}</div>
                  {fieldCount > 0 && <div style={{ fontSize: 9, color: 'var(--n-text-muted)', marginTop: 1 }}>{fieldCount} fields</div>}
                </div>
              </button>
            );
          })}

          {customTpls.length > 0 && (
            <>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--n-text-muted)', padding: '12px 6px 8px' }}>Custom Forms</div>
              {customTpls.map(t => {
                const isSelected = selectedTemplate?.id === t.id;
                return (
                  <button key={t.id}
                    onClick={() => { setSelectedTemplate(t); setFormValues({}); setSelectedReport(null); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 8px', marginBottom: 2, textAlign: 'left', cursor: 'pointer',
                      background: isSelected ? 'rgba(59,130,246,0.12)' : 'transparent',
                      border: 'none',
                      borderLeft: `3px solid ${isSelected ? '#3b82f6' : 'transparent'}`,
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <MdAssignment size={17} style={{ flexShrink: 0, opacity: 0.75, color: isSelected ? '#60a5fa' : 'var(--n-text-muted)' }} />
                    <div style={{ fontSize: 12, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#60a5fa' : 'var(--n-text)' }}>{t.name}</div>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Signature status */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--n-border)', flexShrink: 0, background: 'var(--n-bg-card)' }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--n-text-muted)', marginBottom: 6 }}>My Signature</div>
          {hasSig ? (
            <>
              <div style={{ background: '#fff', padding: '4px 8px', border: '1px solid #374151', marginBottom: 4 }}>
                <img src={currentUser.signature} alt="signature" style={{ height: 28, objectFit: 'contain', display: 'block' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 9, color: '#22c55e' }}>✓ Signature on file</span>
                <button onClick={() => navigate('/profile?tab=signature')} style={{ fontSize: 9, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Edit</button>
              </div>
            </>
          ) : (
            <div>
              <div style={{ fontSize: 10, color: 'var(--n-text-muted)', marginBottom: 4 }}>No signature on file</div>
              <button onClick={() => navigate('/profile')} style={{ fontSize: 10, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Set up in Profile →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══ CENTER: Document area ══════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#2e2e32' }}>

        {/* ── Creating a new report ── */}
        {showForm && (
          <>
            <div style={{
              padding: '6px 12px', background: 'var(--n-bg-toolbar)',
              borderBottom: '1px solid var(--n-border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--n-text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {selectedTemplate.name}
              </span>
              <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
                {me?.badge || '—'} · {me?.name || currentUser?.name}
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                {hasSig && !sigApplied && (
                  <button className="n-btn n-btn-secondary n-btn-xs" onClick={applySignature} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    ✍ Apply Signature
                  </button>
                )}
                {sigApplied && (
                  <span style={{ fontSize: 10, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                    ✓ Signed
                  </span>
                )}
                {!hasSig && (
                  <button onClick={() => navigate('/profile')} style={{ fontSize: 10, color: '#6b7280', background: 'none', border: '1px solid #374151', cursor: 'pointer', padding: '3px 8px' }}>
                    Set up signature
                  </button>
                )}
                <button className="n-btn n-btn-ghost n-btn-xs" onClick={() => { setSelectedTemplate(null); setFormValues({}); }}>
                  ✕ Discard
                </button>
                <button className="n-btn n-btn-primary n-btn-xs" onClick={submitReport}>
                  Submit Report
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
              <FormDocWrap meta={draftMeta}>
                <ReportDocument
                  type={selectedTemplate.name}
                  template={selectedTemplate}
                  data={formValues}
                  editable
                  onChange={handleFormChange}
                  meta={draftMeta}
                />
              </FormDocWrap>
            </div>
          </>
        )}

        {/* ── Viewing a submitted report ── */}
        {showReport && (
          <>
            <div style={{
              padding: '6px 12px', background: 'var(--n-bg-toolbar)',
              borderBottom: '1px solid var(--n-border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--n-text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {selReport.type}
              </span>
              <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>
                {selReport.caseNumber} · {selReport.date}
              </span>
              <span className={`n-badge ${STATUS_CLS[selReport.status] || 'badge-gray'}`} style={{ fontSize: 9 }}>
                {selReport.status}
              </span>
              {isAdmin && (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
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
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
              <FormDocWrap meta={{
                caseNumber: selReport.caseNumber,
                status: selReport.status,
                officerSig: selReport.formData?._officerSig || null,
                supervisorSig: selReport.status === 'Approved' ? 'APPROVED' : null,
              }}>
                <ReportDocument
                  type={selReport.type}
                  template={reportTemplates.find(t => t.name === selReport.type)}
                  data={selReport.formData || { f10: selReport.summary, f4: selReport.summary, f8: selReport.summary }}
                  editable={false}
                  meta={{ caseNumber: selReport.caseNumber, status: selReport.status }}
                />
              </FormDocWrap>
            </div>
          </>
        )}

        {/* ── Empty state ── */}
        {!showForm && !showReport && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: '#666', padding: 40 }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.3">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 6 }}>No report open</div>
              <div style={{ fontSize: 11, color: '#555', maxWidth: 260, lineHeight: 1.5 }}>
                Select a report type from the left panel to start filing, or choose an existing report from the list on the right.
              </div>
            </div>
            {!hasSig && (
              <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 4, padding: '10px 16px', fontSize: 11, color: '#60a5fa', textAlign: 'center', maxWidth: 280 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>✍ Set up your signature</div>
                <div style={{ color: '#4b7aaa', marginBottom: 8 }}>Apply your saved signature to reports with one click — like DocuSign.</div>
                <button onClick={() => navigate('/profile')} style={{ fontSize: 11, color: '#3b82f6', background: 'none', border: '1px solid #3b82f6', cursor: 'pointer', padding: '4px 12px' }}>
                  Go to Profile →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ RIGHT: Report queue ═══════════════════════════════════ */}
      <div style={{
        width: 270, flexShrink: 0, display: 'flex', flexDirection: 'column',
        borderLeft: '1px solid var(--n-border)', background: 'var(--n-bg-toolbar)', overflow: 'hidden',
      }}>
        {/* Header + stats */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--n-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--n-text)' }}>Reports</span>
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--n-text-muted)' }}>{reports.length} total</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { label: 'Submitted', count: reports.filter(r => r.status === 'Submitted').length, color: '#3b82f6' },
              { label: 'Pending',   count: pendingReports.length,                                  color: '#f59e0b' },
              { label: 'Approved',  count: reports.filter(r => r.status === 'Approved').length,   color: '#22c55e' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: 'var(--n-bg-card)', border: `1px solid ${s.color}22`, padding: '4px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: 8, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--n-border)', flexShrink: 0, background: 'var(--n-bg-card)' }}>
          {[
            { id: 'MINE', label: 'My Reports', count: myReports.length },
            { id: 'PENDING', label: 'Pending', count: pendingReports.length },
            ...(isAdmin ? [{ id: 'ALL', label: 'All', count: reports.length }] : []),
          ].map(t => (
            <button key={t.id}
              onClick={() => setReportTab(t.id)}
              style={{
                flex: 1, padding: '5px 4px', border: 'none', cursor: 'pointer',
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px',
                background: reportTab === t.id ? 'var(--n-bg-selected)' : 'transparent',
                color: reportTab === t.id ? 'var(--n-text)' : 'var(--n-text-muted)',
                borderBottom: reportTab === t.id ? '2px solid var(--n-blue)' : '2px solid transparent',
                fontFamily: 'var(--font-ui)',
              }}>
              {t.label}
              {t.count > 0 && reportTab !== t.id && (
                <span style={{ marginLeft: 3, fontSize: 8, background: 'var(--n-bg-elevated)', color: 'var(--n-text-muted)', padding: '0 3px' }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Report list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {displayedReports.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--n-text-muted)', fontSize: 11 }}>No reports</div>
          ) : displayedReports.map(r => (
            <div key={r.id}
              onClick={() => { setSelectedReport(r.id); setSelectedTemplate(null); setFormValues({}); }}
              style={{
                padding: '8px 10px', cursor: 'pointer',
                borderBottom: '1px solid var(--n-border-subtle)',
                borderLeft: selectedReport === r.id ? '3px solid var(--n-blue)' : '3px solid transparent',
                background: selectedReport === r.id ? 'var(--n-bg-selected)' : 'transparent',
              }}
              onMouseEnter={e => { if (selectedReport !== r.id) e.currentTarget.style.background = 'var(--n-bg-hover)'; }}
              onMouseLeave={e => { if (selectedReport !== r.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span className={`n-badge ${STATUS_CLS[r.status] || 'badge-gray'}`} style={{ fontSize: 8 }}>{r.status}</span>
                <span style={{ fontSize: 8, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>{r.date}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--n-text)', marginBottom: 2, lineHeight: 1.2 }}>{r.type}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 9, color: 'var(--n-text-muted)', fontFamily: 'var(--font-mono)' }}>{r.caseNumber}</span>
                {r.formData?._officerSig && <span style={{ fontSize: 9, color: '#22c55e' }}>✍</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Admin action bar for selected report */}
        {isAdmin && selReport && selReport.status !== 'Approved' && (
          <div style={{ padding: '8px 10px', borderTop: '1px solid var(--n-border)', flexShrink: 0, background: 'var(--n-bg-card)' }}>
            <div style={{ fontSize: 9, color: 'var(--n-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
              Review: {selReport.caseNumber}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="n-btn n-btn-success n-btn-xs" style={{ flex: 1 }}
                onClick={() => reviewReport(selReport.id, 'Approved')}>
                Approve
              </button>
              {selReport.status === 'Submitted' && (
                <button className="n-btn n-btn-warning n-btn-xs" style={{ flex: 1 }}
                  onClick={() => reviewReport(selReport.id, 'Pending Review')}>
                  Flag
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
