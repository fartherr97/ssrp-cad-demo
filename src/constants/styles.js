/*
 * Shared inline style objects for the SSRP CAD dark theme.
 * Import these instead of CSS className="n-btn n-btn-primary" etc.
 * All visual styling lives here and in components — not in CSS files.
 */

const FONT_UI   = "'Ubuntu', 'Segoe UI', 'Tahoma', 'Arial', system-ui, sans-serif";
const FONT_MONO = "'Courier New', 'Lucida Console', 'Consolas', monospace";

/* ─── Page wrapper ─── */
export const S_PAGE = {
  flex: 1, overflow: 'auto', padding: 14,
  display: 'flex', flexDirection: 'column', gap: 12,
};

/* ─── Panel (dark bordered box) ─── */
export const S_PANEL = {
  background: 'var(--n-bg-panel)', border: '1px solid var(--n-border)',
  borderRadius: 'var(--n-radius)', overflow: 'hidden',
  display: 'flex', flexDirection: 'column',
};
export const S_PANEL_HEADER = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '4px 8px', background: 'var(--n-bg-card)',
  borderBottom: '1px solid var(--n-border)', flexShrink: 0, gap: 6,
};
export const S_PANEL_TITLE = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.9px',
  textTransform: 'uppercase', color: 'var(--n-gold)',
  display: 'flex', alignItems: 'center', gap: 4, fontFamily: FONT_MONO,
};
export const S_PANEL_BODY = { flex: 1, overflow: 'auto' };

/* ─── Card ─── */
export const S_CARD = {
  background: 'var(--n-bg-card)', border: '1px solid var(--n-border-subtle)',
  borderRadius: 'var(--n-radius)', padding: '10px 12px',
  transition: 'border-color 0.22s, background 0.22s, box-shadow 0.22s, transform 0.22s',
};
export const cardHoverOn  = e => { e.currentTarget.style.borderColor = 'var(--n-border-strong)'; e.currentTarget.style.background = 'var(--n-bg-elevated)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; };
export const cardHoverOff = e => { e.currentTarget.style.borderColor = 'var(--n-border-subtle)'; e.currentTarget.style.background = 'var(--n-bg-card)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = ''; };

/* ─── Inputs / Selects / Labels ─── */
export const S_INPUT = {
  background: 'var(--n-bg-input)', border: '1px solid var(--n-border)',
  borderRadius: 'var(--n-radius-sm)', color: 'var(--n-text)',
  fontFamily: FONT_UI, fontSize: 13, padding: '8px 11px',
  width: '100%', outline: 'none', lineHeight: 1.4, boxSizing: 'border-box',
};
export const S_SELECT = { ...S_INPUT, appearance: 'none', cursor: 'pointer' };
export const S_TEXTAREA = { ...S_INPUT, resize: 'vertical', minHeight: 60 };
export const S_LABEL = {
  display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.6px',
  textTransform: 'uppercase', color: 'var(--n-text-muted)', marginBottom: 2,
  fontFamily: FONT_MONO,
};
export const S_FIELD = { display: 'flex', flexDirection: 'column', gap: 2 };

/* ─── Buttons (base) ─── */
const BTN_BASE = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  fontFamily: FONT_UI, fontWeight: 600, borderRadius: 'var(--n-radius-sm)',
  cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.2px',
  lineHeight: 1.2, border: '1px solid transparent', position: 'relative',
  transition: 'background 0.14s, color 0.14s, border-color 0.14s, box-shadow 0.14s, transform 0.14s, filter 0.14s',
};
export const S_BTN    = { ...BTN_BASE, padding: '8px 16px',  fontSize: 13 };
export const S_BTN_SM = { ...BTN_BASE, padding: '5px 11px',  fontSize: 12 };
export const S_BTN_XS = { ...BTN_BASE, padding: '4px 9px',   fontSize: 11 };
export const S_BTN_LG = { ...BTN_BASE, padding: '11px 22px', fontSize: 14 };

export const S_BTN_PRIMARY = {
  ...S_BTN,
  background: 'linear-gradient(180deg, var(--acc-blue-hi), var(--acc-blue))',
  color: '#fff', boxShadow: '0 2px 10px var(--acc-blue-glow)',
};
export const S_BTN_SECONDARY = {
  ...S_BTN,
  background: 'rgba(255,255,255,0.05)', color: 'var(--n-text)',
  borderColor: 'rgba(255,255,255,0.12)',
};
export const S_BTN_GHOST = {
  ...S_BTN, background: 'transparent', color: 'var(--n-text-dim)',
};
export const S_BTN_DANGER = {
  ...S_BTN,
  background: 'linear-gradient(180deg, var(--acc-red-hi), var(--acc-red))',
  color: '#fff', boxShadow: '0 2px 10px var(--acc-red-glow)',
};
export const S_BTN_SUCCESS = {
  ...S_BTN,
  background: 'linear-gradient(180deg, var(--acc-green-hi), var(--acc-green))',
  color: '#02180a', boxShadow: '0 2px 10px var(--acc-green-glow)',
};
export const S_BTN_WARNING = {
  ...S_BTN,
  background: 'linear-gradient(180deg, var(--acc-amber-hi), var(--acc-amber))',
  color: '#1a0f00', boxShadow: '0 2px 10px var(--acc-amber-glow)',
};
export const S_BTN_GOLD = {
  ...S_BTN,
  background: 'linear-gradient(180deg, var(--acc-gold-hi), var(--acc-gold))',
  color: '#1a1200', boxShadow: '0 2px 10px var(--acc-gold-glow)',
};
export const S_BTN_FIRE = {
  ...S_BTN,
  background: 'linear-gradient(180deg, var(--acc-fire-hi), var(--acc-fire))',
  color: '#fff', boxShadow: '0 2px 10px var(--acc-fire-glow)',
};
/* Apply sm/xs sizing to any button variant */
export const sm = b => ({ ...b, padding: '5px 11px', fontSize: 12 });
export const xs = b => ({ ...b, padding: '4px 9px',  fontSize: 11 });
/* Hover/active handlers for buttons */
export const btnHoverOn  = e => { if (!e.currentTarget.disabled) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.12)'; } };
export const btnHoverOff = e => { e.currentTarget.style.transform = ''; e.currentTarget.style.filter = ''; };
export const btnActiveOn = e => { if (!e.currentTarget.disabled) e.currentTarget.style.transform = 'translateY(1px) scale(0.985)'; };

/* ─── Tabs ─── */
export const S_TABS = {
  display: 'flex', borderBottom: '1px solid var(--n-border)',
  background: 'var(--n-bg-panel)', flexShrink: 0, overflowX: 'auto',
  scrollbarWidth: 'none',
};
export const S_TAB = {
  padding: '10px 18px', fontSize: 13, fontWeight: 600,
  color: 'var(--n-text-dim)', cursor: 'pointer',
  borderBottom: '2px solid transparent',
  background: 'none', border: 'none', borderBottom: '2px solid transparent',
  letterSpacing: '0.2px', fontFamily: FONT_UI, whiteSpace: 'nowrap',
  transition: 'color 0.14s, background 0.14s, border-color 0.22s',
};
export const S_TAB_ACTIVE = {
  ...S_TAB,
  color: '#fff', borderBottom: '2px solid var(--acc-blue-hi)',
  background: 'rgba(47,127,232,0.08)',
};
export const tabStyle = active => active ? S_TAB_ACTIVE : S_TAB;

/* ─── Table ─── */
export const S_TABLE = { width: '100%', borderCollapse: 'collapse', fontSize: 13.5 };
export const S_TABLE_TH = {
  padding: '9px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700,
  letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--n-text-muted)',
  background: 'var(--n-bg-tblhdr)', borderBottom: '1px solid var(--n-border-strong)',
  whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 1, fontFamily: FONT_MONO,
};
export const S_TABLE_TD = {
  padding: '10px 12px', borderBottom: '1px solid var(--n-border-faint)',
  color: 'var(--n-text)', verticalAlign: 'middle', height: 42,
};
export const trHoverOn  = e => { e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = 'var(--n-bg-hover)'); e.currentTarget.style.transform = 'translateX(2px)'; };
export const trHoverOff = e => { e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = ''); e.currentTarget.style.transform = ''; };

/* ─── Modal / Overlay ─── */
export const S_OVERLAY = {
  position: 'fixed', inset: 0, background: 'var(--n-bg-overlay)',
  backdropFilter: 'blur(4px)', zIndex: 200,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  animation: 'fadeIn 0.22s cubic-bezier(0.4,0,0.2,1)',
};
export const S_MODAL = {
  background: 'var(--n-bg-panel)', border: '1px solid var(--n-border-strong)',
  borderRadius: 'var(--n-radius-lg)', boxShadow: 'var(--n-shadow)',
  width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto',
  animation: 'modalPop 0.32s cubic-bezier(0.16,1,0.3,1)',
};
export const S_MODAL_HEADER = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '6px 10px', borderBottom: '1px solid var(--n-border)',
  background: 'var(--n-bg-card)',
};
export const S_MODAL_TITLE = {
  fontSize: 12, fontWeight: 700, letterSpacing: '0.8px',
  textTransform: 'uppercase', color: 'var(--n-gold)', fontFamily: FONT_MONO,
};
export const S_MODAL_BODY   = { padding: 10, display: 'flex', flexDirection: 'column', gap: 8 };
export const S_MODAL_FOOTER = {
  display: 'flex', justifyContent: 'flex-end', gap: 5,
  padding: '6px 10px', borderTop: '1px solid var(--n-border)',
  background: 'var(--n-bg-card)',
};

/* ─── Badges ─── */
const BB = {
  display: 'inline-flex', alignItems: 'center', padding: '1px 7px',
  fontSize: 10, fontWeight: 700, letterSpacing: '0.4px',
  border: '1px solid transparent', borderRadius: 999, whiteSpace: 'nowrap',
  textTransform: 'uppercase', fontFamily: FONT_MONO, lineHeight: '17px',
};
export const BADGE = {
  red:         { ...BB, background: '#0e0000', color: '#bb2222', borderColor: '#2c0000' },
  orange:      { ...BB, background: '#110800', color: '#aa6600', borderColor: '#2c1800' },
  yellow:      { ...BB, background: '#0e0c00', color: '#aaaa00', borderColor: '#2a2600' },
  green:       { ...BB, background: '#001a06', color: '#1a8840', borderColor: '#003810' },
  blue:        { ...BB, background: '#040c20', color: '#2870c0', borderColor: '#081e40' },
  purple:      { ...BB, background: '#0a0018', color: '#7030a0', borderColor: '#180030' },
  gold:        { ...BB, background: '#0e0a00', color: '#c09010', borderColor: '#5a3c04' },
  gray:        { ...BB, background: '#060c18', color: '#304050', borderColor: '#101c28' },
  cyan:        { ...BB, background: '#040e14', color: '#108090', borderColor: '#082030' },
  fire:        { ...BB, background: '#0e0200', color: '#b83010', borderColor: '#2e0800' },
  // Status
  available:   { ...BB, background: '#001a06', color: '#22ff66', borderColor: '#004010' },
  busy:        { ...BB, background: '#1a0000', color: '#ff3333', borderColor: '#3d0000' },
  enrt:        { ...BB, background: '#1a1400', color: '#ffd700', borderColor: '#3d3000' },
  arrvd:       { ...BB, background: '#001a1f', color: '#22ccff', borderColor: '#003d4d' },
  offduty:     { ...BB, background: '#141414', color: '#888888', borderColor: '#2e2e2e' },
  unavailable: { ...BB, background: '#180022', color: '#cc44ff', borderColor: '#3d0055' },
  // Priority
  p1: { ...BB, background: '#150000', color: '#ff2222', borderColor: '#3a0000' },
  p2: { ...BB, background: '#150800', color: '#ff8822', borderColor: '#3a1800' },
  p3: { ...BB, background: '#141200', color: '#ddcc00', borderColor: '#383000' },
  p4: { ...BB, background: '#001a04', color: '#22cc55', borderColor: '#003808' },
};

/* Convenience: get badge style from status string */
export const statusBadge = s => BADGE[s?.toLowerCase()] || BADGE.gray;

/* ─── Detail rows ─── */
export const S_DETAIL_ROW = {
  display: 'flex', gap: 5, padding: '3px 0',
  borderBottom: '1px solid var(--n-border-faint)',
  fontSize: 10, alignItems: 'baseline',
};
export const S_DETAIL_LABEL = {
  fontSize: 8, fontWeight: 600, letterSpacing: '0.4px',
  textTransform: 'uppercase', color: 'var(--n-text-muted)',
  minWidth: 100, flexShrink: 0, fontFamily: FONT_MONO,
};
export const S_DETAIL_VALUE      = { color: 'var(--n-text)', flex: 1 };
export const S_DETAIL_VALUE_MONO = { color: 'var(--n-text-data)', fontFamily: FONT_MONO, fontSize: 10 };

/* ─── CAD status/priority inline text ─── */
export const CAD_STATUS = {
  AVAILABLE:   { color: '#22ff66', fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  BUSY:        { color: '#ff8822', fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  ENRT:        { color: '#aaff33', fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  ARRVD:       { color: '#ffee22', fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  OFFDUTY:     { color: '#cc3333', fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  UNAVAILABLE: { color: '#dd44aa', fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' },
};
export const CAD_STATUS_LABEL = { AVAILABLE:'AVL', BUSY:'BUSY', ENRT:'ENRT', ARRVD:'ARRVD', OFFDUTY:'OFD', UNAVAILABLE:'UNAVL' };
export const cadStatus = s => CAD_STATUS[s] || CAD_STATUS.OFFDUTY;

export const CAD_CALL_STATUS = {
  PENDING: { color: '#ff8822', fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  ACTIVE:  { color: '#22ff66', fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  ENRT:    { color: '#aaff33', fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  CLOSED:  { color: '#334455', fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.5px', whiteSpace: 'nowrap' },
};
export const cadCallStatus = s => CAD_CALL_STATUS[s] || CAD_CALL_STATUS.CLOSED;

export const CAD_PRI = {
  1: { color: '#ff3333', fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, letterSpacing: '0.3px', whiteSpace: 'nowrap' },
  2: { color: '#ff8822', fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, letterSpacing: '0.3px', whiteSpace: 'nowrap' },
  3: { color: '#ffee22', fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, letterSpacing: '0.3px', whiteSpace: 'nowrap' },
  4: { color: '#22ff66', fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, letterSpacing: '0.3px', whiteSpace: 'nowrap' },
};
export const cadPri = p => CAD_PRI[p] || CAD_PRI[4];

const ELAPSED_BASE = { fontFamily: FONT_MONO, fontSize: 12, fontWeight: 600, letterSpacing: '0.2px' };
export const CAD_ELAPSED = {
  ok:   { ...ELAPSED_BASE, color: '#4890c0' },
  warn: { ...ELAPSED_BASE, color: '#ff8822' },
  crit: { ...ELAPSED_BASE, color: '#ff2222' },
};
export const cadElapsed = cls => CAD_ELAPSED[cls] || CAD_ELAPSED.ok;

/* ─── Bottom/status bar ─── */
export const S_STATUSBAR = {
  display: 'flex', alignItems: 'center',
  background: '#020810', borderTop: '1px solid var(--n-border-faint)',
  padding: '0 8px', gap: 0, flexShrink: 0,
  fontSize: 9, color: 'var(--n-text-muted)', fontFamily: FONT_MONO, letterSpacing: '0.2px',
  overflowX: 'auto',
};
export const S_STATUSBAR_SEP = {
  display: 'inline-block', width: 1, height: 10,
  background: '#1a2e44', margin: '0 8px', flexShrink: 0,
};
export const S_STATUSBAR_HI  = { color: 'var(--n-text-data)' };
export const S_STATUSBAR_AV  = { color: '#22ff66' };
export const S_STATUSBAR_P1  = { color: '#ff2222', fontWeight: 700, animation: 'pulseRed 1.5s ease-in-out infinite' };

/* ─── Call card ─── */
export const S_CALL_CARD = (pri, selected) => ({
  padding: '5px 8px',
  borderLeft: `3px solid ${{ 1:'#ff2222', 2:'#ff8822', 3:'#ddcc00', 4:'#22cc55' }[pri] || 'transparent'}`,
  borderBottom: '1px solid var(--n-border-faint)', cursor: 'pointer',
  background: selected ? 'var(--n-bg-selected)' : 'transparent',
  transform: selected ? 'translateX(2px)' : '',
  transition: 'background 0.14s, border-color 0.14s, transform 0.14s',
});
export const callCardHoverOn  = e => { e.currentTarget.style.background = 'var(--n-bg-hover)'; e.currentTarget.style.transform = 'translateX(2px)'; };
export const callCardHoverOff = (selected, e) => { if (!selected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = ''; } };

/* ─── Unit row ─── */
export const S_UNIT_ROW = {
  display: 'flex', alignItems: 'center', padding: '3px 8px', gap: 6,
  borderBottom: '1px solid var(--n-border-faint)', fontSize: 10, cursor: 'pointer',
};
export const unitRowHoverOn  = e => { e.currentTarget.style.background = 'var(--n-bg-hover)'; };
export const unitRowHoverOff = e => { e.currentTarget.style.background = ''; };

/* ─── Dispatch log entry ─── */
export const S_TX_ENTRY = {
  padding: '2px 8px', fontFamily: FONT_MONO, fontSize: 11,
  borderBottom: '1px solid var(--n-border-faint)',
  display: 'flex', gap: 6, alignItems: 'flex-start', lineHeight: 1.4,
};
export const S_TX_TIME = { color: 'var(--n-text-muted)', minWidth: 44, flexShrink: 0 };
export const TX_KIND_COLOR = {
  call:   '#ddcc00', unit: '#ffd700', status: '#22ff66',
  alert:  '#ff2222', info: 'var(--n-text-muted)',
};

/* ─── Stat card ─── */
export const S_STAT = {
  background: 'var(--n-bg-panel)', border: '1px solid var(--n-border)',
  padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0,
};
export const S_STAT_LABEL = { fontSize: 7, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--n-text-muted)', fontFamily: FONT_MONO };
export const S_STAT_VALUE = { fontFamily: FONT_MONO, fontSize: 18, fontWeight: 600, color: 'var(--n-text)', lineHeight: 1.1 };
export const S_STAT_SUB   = { fontSize: 9, color: 'var(--n-text-dim)', marginTop: 1 };

/* ─── Record return (dark NCIC terminal) ─── */
export const S_RECORD_RETURN = {
  background: '#0b0c10', color: '#aeb9c8',
  fontFamily: `${FONT_MONO}, 'Courier New', monospace`,
  fontSize: 12.5, maxWidth: 840, width: '100%',
  border: '1px solid #1d2531', borderRadius: 6, overflow: 'hidden',
  boxShadow: '0 12px 40px rgba(0,0,0,0.55)', flexShrink: 0,
  animation: 'slideUp 0.22s cubic-bezier(0.4,0,0.2,1)',
};
export const S_RECORD_RETURN_HEADER = {
  display: 'flex', alignItems: 'center', gap: 10,
  background: 'linear-gradient(90deg, #1d4f8c 0%, #143257 100%)',
  color: '#fff', fontFamily: FONT_UI, fontSize: 14, fontWeight: 700,
  padding: '10px 14px', letterSpacing: '0.2px', borderBottom: '1px solid #2b3f5e',
};
export const S_RECORD_RETURN_ALERT       = { padding: '6px 14px', background: '#c41818', color: '#fff', fontFamily: `${FONT_MONO}, 'Courier New', monospace`, fontSize: 11, fontWeight: 700, letterSpacing: '0.4px' };
export const S_RECORD_RETURN_ALERT_WARN  = { ...S_RECORD_RETURN_ALERT, background: '#c4621a' };
export const S_RECORD_RETURN_BODY        = { padding: '14px 16px 16px', lineHeight: 1.9, color: '#aeb9c8' };
export const S_RECORD_RETURN_SECTION     = { color: '#eaf1f9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', margin: '15px 0 4px', fontSize: 12.5 };
export const S_RECORD_RETURN_LINE        = { fontSize: 12.5, lineHeight: 1.75 };
export const S_RECORD_RETURN_KEY         = { color: '#7e8ea3', fontWeight: 400, marginRight: 7 };
export const S_RECORD_RETURN_VAL         = { background: 'rgba(58,136,232,0.18)', color: '#dfe9f5', padding: '0 5px', borderRadius: 2 };
export const S_RECORD_RETURN_FLAG        = { display: 'inline-block', background: '#c41818', color: '#fff', fontWeight: 700, padding: '2px 8px', fontSize: 10, letterSpacing: '0.5px', borderRadius: 3, marginRight: 4 };
export const S_RECORD_RETURN_FLAG_WARN   = { ...S_RECORD_RETURN_FLAG, background: '#c4621a' };
export const S_RECORD_RETURN_FOOTER      = { fontSize: 10, marginTop: 14, color: '#5a6678', letterSpacing: '0.3px' };

/* ─── Form document (paper / PDF aesthetic) ─── */
export const S_FORM_DOC_WRAP      = { background: '#3a3a3a', overflow: 'auto', padding: '20px 16px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' };
export const S_FORM_DOC           = { background: '#ffffff', color: '#000000', fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: 11, width: '100%', maxWidth: 800, border: '1px solid #888', boxShadow: '0 6px 28px rgba(0,0,0,0.7)', flexShrink: 0 };
export const S_FORM_DOC_HEADER    = { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '10px 14px 8px', borderBottom: '2px solid #000' };
export const S_FORM_DOC_AGENCY    = { fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: '#000', letterSpacing: '0.3px', lineHeight: 1.2 };
export const S_FORM_DOC_TITLE     = { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#000', marginTop: 3, letterSpacing: '0.2px' };
export const S_FORM_DOC_SUBTITLE  = { fontSize: 9, color: '#444', marginTop: 2, letterSpacing: '0.2px' };
export const S_FORM_DOC_IDROW     = { display: 'flex', borderBottom: '1px solid #000' };
export const S_FORM_DOC_IDLABEL   = { fontSize: 7.5, fontWeight: 600, letterSpacing: '0.3px', color: '#333', textTransform: 'uppercase', lineHeight: 1.4, display: 'block' };
export const S_FORM_DOC_IDVALUE   = { fontFamily: "'Courier New', monospace", fontSize: 13, fontWeight: 700, color: '#000', letterSpacing: '0.5px', lineHeight: 1.3 };
export const S_FORM_ROW           = { display: 'flex', borderBottom: '1px solid #000', minHeight: 36 };
export const S_FORM_CELL          = { display: 'flex', flexDirection: 'column', borderRight: '1px solid #000', padding: '2px 5px 4px', minWidth: 0, overflow: 'hidden' };
export const S_FORM_CELL_LABEL    = { fontSize: 7, fontWeight: 600, letterSpacing: '0.2px', color: '#000', textTransform: 'uppercase', lineHeight: 1.4, whiteSpace: 'nowrap', marginBottom: 1 };
export const S_FORM_CELL_VALUE    = { fontSize: 11, color: '#000', fontFamily: "'Courier New', monospace", lineHeight: 1.4, flex: 1, display: 'flex', alignItems: 'flex-start' };
export const S_FORM_SECTION       = { padding: '3px 8px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #000', borderTop: '1px solid #000', color: '#000', background: '#e0e0e0', display: 'flex', alignItems: 'center', gap: 8 };
export const S_FORM_SECTION_DARK  = { ...S_FORM_SECTION, background: '#2a2a2a', color: '#fff' };
export const S_FORM_SECTION_BLUE  = { ...S_FORM_SECTION, background: '#003366', color: '#fff' };
export const S_FORM_NARRATIVE     = { padding: '5px 8px', borderBottom: '1px solid #000', minHeight: 72 };
export const S_FORM_CHECKBOX_ROW  = { display: 'flex', gap: 18, padding: '5px 8px', borderBottom: '1px solid #000', flexWrap: 'wrap', alignItems: 'center' };
export const S_FORM_CHARGE_ROW    = { display: 'flex', gap: 6, alignItems: 'center', padding: '1px 0', borderBottom: '1px solid #ddd', fontSize: 10 };
export const S_FORM_SIG_ROW       = { display: 'flex', borderBottom: '1px solid #000', minHeight: 48 };
export const S_FORM_SIG_CELL      = { flex: 1, padding: '4px 8px', borderRight: '1px solid #000', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' };
export const S_FORM_SIG_LINE      = { borderBottom: '1px solid #000', marginBottom: 2, minHeight: 22, fontFamily: "'Courier New', monospace", fontSize: 11, color: '#000' };
export const S_FORM_SIG_LABEL     = { fontSize: 7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', color: '#444' };
export const S_FORM_DOC_FOOTER_S  = { padding: '4px 10px', fontSize: 7.5, color: '#666', textAlign: 'center', background: '#f4f4f4', borderTop: '1px solid #ccc', letterSpacing: '0.2px' };
export const S_FORM_DOC_ALERT     = { padding: '5px 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', borderBottom: '1px solid #000', display: 'flex', gap: 12 };
export const S_FORM_DOC_ALERT_RED    = { ...S_FORM_DOC_ALERT, background: '#cc0000', color: '#fff' };
export const S_FORM_DOC_ALERT_ORANGE = { ...S_FORM_DOC_ALERT, background: '#cc5500', color: '#fff' };
export const S_FORM_DOC_ALERT_YELLOW = { ...S_FORM_DOC_ALERT, background: '#ccaa00', color: '#000' };

/* ─── Grid helpers ─── */
export const S_GRID_2 = { display: 'grid', gridTemplateColumns: '1fr 1fr',     gap: 6 };
export const S_GRID_3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 };
export const S_GRID_4 = { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 };

/* ─── Miscellaneous ─── */
export const S_DATA  = { fontFamily: FONT_MONO, color: 'var(--n-text-data)', fontSize: 10 };
export const S_MONO  = { fontFamily: FONT_MONO };
export const S_MUTED = { color: 'var(--n-text-muted)' };
export const S_DIM   = { color: 'var(--n-text-dim)' };
