/* Generates a government-document-style PDF for reports and records.
   Uses @react-pdf/renderer — all layout is React PDF primitives, no Tailwind. */

import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';

const navy  = '#0f2040';
const blue  = '#1a4a8a';
const mid   = '#2d5fa8';
const light = '#e8f0fb';
const black = '#1a1a1a';
const gray  = '#6b7280';
const lgray = '#d1d5db';
const red   = '#dc2626';
const amber = '#d97706';

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 44,
    paddingTop: 36,
    paddingBottom: 50,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: black,
    backgroundColor: '#ffffff',
    lineHeight: 1.35,
  },

  // ── Header ──
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', borderBottom: `2px solid ${navy}`, paddingBottom: 10, marginBottom: 14 },
  logoBox: { width: 48, height: 48, marginRight: 10, flexShrink: 0, borderRadius: 4 },
  headerLeft: { flex: 1 },
  agencyName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: navy, textTransform: 'uppercase', letterSpacing: 0.8 },
  formCode: { fontSize: 8, color: gray, marginTop: 2, fontFamily: 'Courier' },
  reportType: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: blue, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 4 },
  headerRight: { alignItems: 'flex-end', minWidth: 140 },
  caseNumber: { fontSize: 11, fontFamily: 'Courier-Bold', color: navy },
  caseLabel: { fontSize: 7, color: gray, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  statusBadge: { marginTop: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, alignSelf: 'flex-end' },
  statusText: { fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.3 },

  // ── Meta bar ──
  metaBar: { flexDirection: 'row', gap: 0, backgroundColor: light, borderRadius: 4, marginBottom: 14, overflow: 'hidden', border: `1px solid ${lgray}` },
  metaCell: { flex: 1, paddingHorizontal: 10, paddingVertical: 6, borderRight: `1px solid ${lgray}` },
  metaCellLast: { flex: 1, paddingHorizontal: 10, paddingVertical: 6 },
  metaLabel: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5, color: gray, marginBottom: 2 },
  metaValue: { fontSize: 9, color: black },

  // ── Sections ──
  section: { marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: navy, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3, marginBottom: 6 },
  sectionTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.7 },
  sectionDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: mid, marginRight: 6 },

  // Fields grid
  fieldsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  fieldBlock: { paddingHorizontal: 4, paddingVertical: 4, minWidth: '25%' },
  fieldBlockHalf: { paddingHorizontal: 4, paddingVertical: 4, minWidth: '50%' },
  fieldBlockFull: { paddingHorizontal: 4, paddingVertical: 4, width: '100%' },
  fieldLabel: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.4, color: gray, marginBottom: 2 },
  fieldValue: { fontSize: 9, color: black, borderBottom: `0.5px solid ${lgray}`, paddingBottom: 3, minHeight: 14 },
  fieldValueMono: { fontSize: 8.5, fontFamily: 'Courier', color: black, borderBottom: `0.5px solid ${lgray}`, paddingBottom: 3, minHeight: 14 },
  fieldValueNarr: { fontSize: 9, color: black, lineHeight: 1.6, paddingVertical: 4, paddingHorizontal: 6, backgroundColor: '#f9fafb', borderRadius: 3, border: `0.5px solid ${lgray}`, minHeight: 50 },

  // Charges
  chargesWrap: { marginTop: 2 },
  chargeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 6, marginBottom: 3, borderRadius: 3, border: `0.5px solid ${lgray}`, backgroundColor: '#f9fafb' },
  chargeCode: { fontSize: 8, fontFamily: 'Courier-Bold', color: blue, marginRight: 8, minWidth: 60 },
  chargeName: { flex: 1, fontSize: 9, color: black, fontFamily: 'Helvetica-Bold' },
  chargeType: { fontSize: 7.5, paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 2, marginLeft: 6 },
  chargeMeta: { fontSize: 7.5, color: gray, marginLeft: 8 },
  noCharges: { fontSize: 9, color: gray, fontStyle: 'italic' },

  // Checkbox
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 4, minWidth: '50%' },
  checkBox: { width: 9, height: 9, border: `1px solid ${gray}`, marginRight: 5, borderRadius: 1 },
  checkBoxChecked: { width: 9, height: 9, backgroundColor: blue, marginRight: 5, borderRadius: 1 },
  checkLabel: { fontSize: 9, color: black },
  checkMark: { fontSize: 7, color: '#ffffff', textAlign: 'center', lineHeight: 1.2 },

  // Signature lines
  sigsWrap: { marginTop: 14, borderTop: `1px solid ${lgray}`, paddingTop: 10 },
  sigTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5, color: gray, marginBottom: 10 },
  sigRow: { flexDirection: 'row', gap: 8 },
  sigBlock: { flex: 1, border: `0.5px solid ${lgray}`, borderRadius: 3, padding: '4px 6px', minHeight: 40 },
  sigBlockOfficer: { flex: 1, border: `1px solid #c49a00`, borderRadius: 3, padding: '4px 6px', minHeight: 40, backgroundColor: '#fffdf0' },
  sigBlockSuper: { flex: 1, border: `1px solid #b91c1c`, borderRadius: 3, padding: '4px 6px', minHeight: 40, backgroundColor: '#fff5f5' },
  sigLabel: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.4, color: gray, marginBottom: 4 },
  sigLabelOfficer: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.4, color: '#b45309', marginBottom: 4 },
  sigLabelSuper: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.4, color: '#b91c1c', marginBottom: 4 },
  sigValue: { fontSize: 9, fontFamily: 'Courier', color: black },
  sigLine: { borderBottom: `0.5px solid ${black}`, height: 22, marginBottom: 3 },

  // Footer
  footer: { position: 'absolute', bottom: 20, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between', borderTop: `0.5px solid ${lgray}`, paddingTop: 5 },
  footerText: { fontSize: 7, color: lgray },
});

/* ── Charge type colours ── */
function chargeTypeStyle(type) {
  if (type === 'Felony')     return { bg: '#fee2e2', color: red };
  if (type === 'Misdemeanor') return { bg: '#fef3c7', color: amber };
  return { bg: '#f1f5f9', color: gray };
}

/* ── Render a single field value ── */
function renderField(f, value) {
  if (f.type === 'charges') {
    const charges = Array.isArray(value) ? value : [];
    return (
      <View style={styles.fieldBlockFull}>
        <Text style={styles.fieldLabel}>{f.label || 'Charges'}</Text>
        <View style={styles.chargesWrap}>
          {charges.length === 0
            ? <Text style={styles.noCharges}>No charges added.</Text>
            : charges.map(c => {
                const ts = chargeTypeStyle(c.type);
                return (
                  <View key={c.id} style={styles.chargeRow}>
                    <Text style={styles.chargeCode}>{c.code}</Text>
                    <Text style={styles.chargeName}>{c.name}</Text>
                    <Text style={[styles.chargeType, { backgroundColor: ts.bg, color: ts.color }]}>{c.type}</Text>
                    {c.fine > 0 && <Text style={styles.chargeMeta}>${c.fine.toLocaleString()} fine</Text>}
                    {c.jailTime && c.jailTime !== 'None' && <Text style={styles.chargeMeta}>{c.jailTime}</Text>}
                  </View>
                );
              })}
        </View>
      </View>
    );
  }

  if (f.type === 'checkbox') {
    const checked = !!value;
    return (
      <View style={styles.checkRow}>
        <View style={checked ? styles.checkBoxChecked : styles.checkBox}>
          {checked && <Text style={styles.checkMark}>✓</Text>}
        </View>
        <Text style={styles.checkLabel}>{f.label}</Text>
      </View>
    );
  }

  const val = value != null && value !== '' ? String(value) : '—';
  const isNarr = f.type === 'textarea';
  const span = f.span || 1;
  const blockStyle = isNarr ? styles.fieldBlockFull : span >= 3 ? styles.fieldBlockFull : span === 2 ? styles.fieldBlockHalf : styles.fieldBlock;

  return (
    <View key={f.id} style={blockStyle}>
      <Text style={styles.fieldLabel}>{f.label}</Text>
      {isNarr
        ? <Text style={styles.fieldValueNarr}>{val}</Text>
        : <Text style={f.mono ? styles.fieldValueMono : styles.fieldValue}>{val}</Text>}
    </View>
  );
}

/* ── Status badge ── */
function statusBadgeStyle(status) {
  const s = (status || '').toLowerCase();
  if (s === 'approved' || s === 'active') return { bg: '#dcfce7', color: '#15803d' };
  if (s === 'denied'   || s === 'expired' || s === 'revoked') return { bg: '#fee2e2', color: red };
  if (s === 'pending review' || s === 'submitted') return { bg: '#eff6ff', color: blue };
  return { bg: '#f1f5f9', color: gray };
}

/* ── Main PDF document ── */
function ReportPDF({ template, data = {}, meta = {} }) {
  const sections = template?.sections || [];
  const now = new Date();
  const ss = statusBadgeStyle(meta.status || 'Draft');

  return (
    <Document title={`${template?.name || 'Report'} — ${meta.caseNumber || 'DRAFT'}`}
      author="Sunshine State RP CAD" creator="SSRP CAD System">
      <Page size="LETTER" style={styles.page}>

        {/* Header */}
        <View style={styles.headerRow}>
          {meta.logoUrl ? (
            <Image src={meta.logoUrl} style={styles.logoBox} />
          ) : null}
          <View style={styles.headerLeft}>
            <Text style={styles.agencyName}>{meta.agency || template?.agency || 'Sunshine State RP Law Enforcement'}</Text>
            {template?.formCode && <Text style={styles.formCode}>Form: {template.formCode}</Text>}
            <Text style={styles.reportType}>{template?.name || 'Report'}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.caseLabel}>Case / Record No.</Text>
            <Text style={styles.caseNumber}>{meta.caseNumber || 'DRAFT'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: ss.bg }]}>
              <Text style={[styles.statusText, { color: ss.color }]}>{meta.status || 'Draft'}</Text>
            </View>
          </View>
        </View>

        {/* Meta bar */}
        <View style={styles.metaBar}>
          {[
            { label: 'Date / Time', value: meta.dateTime || now.toLocaleString() },
            { label: 'Primary Officer', value: meta.officer || '—' },
            { label: 'Agency', value: meta.agency || 'HCSO' },
            { label: 'Report Type', value: template?.name || '—' },
          ].map((m, i, arr) => (
            <View key={m.label} style={i === arr.length - 1 ? styles.metaCellLast : styles.metaCell}>
              <Text style={styles.metaLabel}>{m.label}</Text>
              <Text style={styles.metaValue}>{m.value}</Text>
            </View>
          ))}
        </View>

        {/* Sections — wrap freely so long content flows to the next page naturally */}
        {sections.map(sec => {
          const regularFields = sec.fields.filter(f => f.type !== 'checkbox' && f.type !== 'charges' && f.type !== 'textarea' && f.type !== 'photos' && f.type !== 'image' && f.type !== 'mugshot');
          const textareaFields = sec.fields.filter(f => f.type === 'textarea');
          const checkboxFields = sec.fields.filter(f => f.type === 'checkbox');
          const chargeFields   = sec.fields.filter(f => f.type === 'charges');
          const photoFields    = sec.fields.filter(f => f.type === 'photos');

          return (
            <View key={sec.id} style={styles.section}>
              {/* Header stays with first content row so it's never orphaned at page bottom */}
              <View wrap={false}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionDot} />
                  <Text style={styles.sectionTitle}>{sec.title}</Text>
                </View>
                {regularFields.length > 0 && (
                  <View style={styles.fieldsGrid}>
                    {regularFields.map(f => renderField(f, data[f.id]))}
                  </View>
                )}
              </View>
              {/* Checkboxes */}
              {checkboxFields.length > 0 && (
                <View wrap={false} style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: regularFields.length ? 4 : 0 }}>
                  {checkboxFields.map(f => renderField(f, data[f.id]))}
                </View>
              )}
              {/* Charges — each row is atomic */}
              {chargeFields.map(f => {
                const charges = Array.isArray(data[f.id]) ? data[f.id] : [];
                return (
                  <View key={f.id} style={{ paddingHorizontal: 4, paddingTop: 4 }}>
                    <Text style={styles.fieldLabel}>{f.label || 'Charges'}</Text>
                    <View style={styles.chargesWrap}>
                      {charges.length === 0
                        ? <Text style={styles.noCharges}>No charges added.</Text>
                        : charges.map(c => {
                            const ts = chargeTypeStyle(c.type);
                            return (
                              <View key={c.id} wrap={false} style={styles.chargeRow}>
                                <Text style={styles.chargeCode}>{c.code}</Text>
                                <Text style={styles.chargeName}>{c.name}</Text>
                                <Text style={[styles.chargeType, { backgroundColor: ts.bg, color: ts.color }]}>{c.type}</Text>
                                {c.fine > 0 && <Text style={styles.chargeMeta}>${c.fine.toLocaleString()} fine</Text>}
                                {c.jailTime && c.jailTime !== 'None' && <Text style={styles.chargeMeta}>{c.jailTime}</Text>}
                              </View>
                            );
                          })}
                    </View>
                  </View>
                );
              })}
              {/* Textareas — long narratives can span pages */}
              {textareaFields.map(f => (
                <View key={f.id} style={{ paddingHorizontal: 4, paddingTop: 4 }}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  <Text style={styles.fieldValueNarr}>{data[f.id] || '—'}</Text>
                </View>
              ))}
              {/* Photo galleries — 4-up grid, each image aspect 4:3 */}
              {photoFields.map(f => {
                const imgs = Array.isArray(data[f.id]) ? data[f.id].filter(Boolean) : [];
                return (
                  <View key={f.id} style={{ paddingHorizontal: 4, paddingTop: 6 }}>
                    <Text style={styles.fieldLabel}>{f.label || 'Scene Photographs'} ({imgs.length})</Text>
                    {imgs.length === 0 ? (
                      <Text style={{ fontSize: 9, color: gray, fontStyle: 'italic', marginTop: 2 }}>No photos attached.</Text>
                    ) : (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                        {imgs.map((src, i) => (
                          <View key={i} style={{ width: '23%' }}>
                            <Image src={src} style={{ width: '100%', aspectRatio: 1.33, borderRadius: 2, border: `0.5px solid ${lgray}` }} />
                            <Text style={{ fontSize: 6.5, color: gray, textAlign: 'center', marginTop: 1 }}>Photo {i + 1}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Signature lines — keep together, never split across pages */}
        <View wrap={false} style={styles.sigsWrap}>
          <Text style={styles.sigTitle}>Signatures</Text>
          <View style={styles.sigRow}>
            {/* Officer signature */}
            <View style={styles.sigBlockOfficer}>
              <Text style={styles.sigLabelOfficer}>Observing Officer's Signature</Text>
              <Text style={styles.sigValue}>{meta.officerSignature || (meta.officer || '—')}</Text>
            </View>
            {/* Supervisor signature */}
            <View style={styles.sigBlockSuper}>
              <Text style={styles.sigLabelSuper}>Supervisor Signature</Text>
              <Text style={styles.sigValue}>{meta.supervisorSignature || '— Pending Supervisor Review —'}</Text>
            </View>
            {/* Date */}
            <View style={styles.sigBlock}>
              <Text style={styles.sigLabel}>Date</Text>
              <Text style={styles.sigValue}>{meta.dateTime || now.toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Sunshine State RP CAD · {template?.formCode || template?.name || 'Report'}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          <Text style={styles.footerText}>{now.toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );
}

/* Convert an external URL to a base64 data URI so @react-pdf/renderer
   can embed it without making a separate (CORS-blocked) network request. */
async function toDataUri(url) {
  if (!url) return null;
  try {
    const res = await fetch(url, { mode: 'cors', cache: 'force-cache' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/* ── Public download helper called from page buttons ── */
export async function downloadReportPDF(template, data, meta) {
  const logoDataUri = await toDataUri(meta.logoUrl);
  const resolvedMeta = { ...meta, logoUrl: logoDataUri };
  const blob = await pdf(<ReportPDF template={template} data={data} meta={resolvedMeta} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(meta.caseNumber || template?.name || 'report').replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export default ReportPDF;
