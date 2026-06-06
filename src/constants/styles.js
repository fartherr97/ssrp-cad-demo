/* ═══════════════════════════════════════════════════════════
   Shared Tailwind class-string constants for the SSRP CAD UI.
   Usage: className={S_BTN_PRIMARY}  (not style=)
   ═══════════════════════════════════════════════════════════ */

// ─── Buttons ───────────────────────────────────────────────

// Mirrors the login role-select buttons: a translucent accent surface with a
// matching border that brightens + lifts on hover (see .btn-glossy in index.css).
const _BTN_BASE = 'btn-glossy inline-flex items-center justify-center gap-2 whitespace-nowrap select-none cursor-pointer font-semibold rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed';

export const S_BTN_PRIMARY   = `${_BTN_BASE} px-4 py-2 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border-transparent`;
// Emphasized call-to-action * solid blue, white text, larger + glowing so the
// primary submit action on long forms can't be missed at the bottom of the page.
export const S_BTN_SUBMIT    = `${_BTN_BASE} px-4 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-600/30`;
export const S_BTN_SECONDARY = `${_BTN_BASE} px-4 py-2 text-sm bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 border-transparent`;
export const S_BTN_SUCCESS   = `${_BTN_BASE} px-4 py-2 text-sm bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-transparent`;
export const S_BTN_DANGER    = `${_BTN_BASE} px-4 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-200 border-transparent`;
export const S_BTN_WARNING   = `${_BTN_BASE} px-4 py-2 text-sm bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-transparent`;
export const S_BTN_GHOST     = `${_BTN_BASE} px-3 py-1.5 text-sm bg-transparent hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 border-transparent`;
export const S_BTN_GOLD      = `${_BTN_BASE} px-4 py-2 text-sm bg-amber-500/22 hover:bg-amber-500/32 text-amber-300 border-transparent`;
export const S_BTN_FIRE      = `${_BTN_BASE} px-4 py-2 text-sm bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border-transparent`;

// sm / xs * append smaller padding/size to any button class string
export const sm = (base) => base.replace('px-4 py-2 text-sm', 'px-3 py-1.5 text-xs');
export const xs = (base) => base.replace('px-4 py-2 text-sm', 'px-2 py-0.5 text-[11px]');

// No-ops * hover is now built into class strings via hover: prefix
export const btnHoverOn  = undefined;
export const btnHoverOff = undefined;
export const btnActiveOn = undefined;


// ─── Badges ────────────────────────────────────────────────

const _BADGE = 'inline-flex items-center leading-none px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.3px] rounded-full border';

export const BADGE = {
  red:         `${_BADGE} bg-red-500/15 text-red-400 border-red-500/30`,
  orange:      `${_BADGE} bg-amber-500/15 text-amber-400 border-amber-500/30`,
  yellow:      `${_BADGE} bg-yellow-500/15 text-yellow-400 border-yellow-500/30`,
  green:       `${_BADGE} bg-green-500/15 text-green-400 border-green-500/30`,
  blue:        `${_BADGE} bg-sky-500/15 text-sky-400 border-sky-500/30`,
  cyan:        `${_BADGE} bg-cyan-500/15 text-cyan-400 border-cyan-500/30`,
  purple:      `${_BADGE} bg-violet-500/15 text-violet-400 border-violet-500/30`,
  gold:        `${_BADGE} bg-yellow-900/40 text-yellow-600 border-yellow-700/30`,
  gray:        `${_BADGE} bg-slate-500/15 text-slate-400 border-slate-500/30`,
  fire:        `${_BADGE} bg-orange-500/15 text-orange-400 border-orange-500/30`,
  available:   `${_BADGE} bg-emerald-500/15 text-emerald-400 border-emerald-500/30`,
  busy:        `${_BADGE} bg-red-500/15 text-red-400 border-red-500/30`,
  enrt:        `${_BADGE} bg-violet-500/15 text-violet-400 border-violet-500/30`,
  arrvd:       `${_BADGE} bg-teal-500/15 text-teal-300 border-teal-500/30`,
  offduty:     `${_BADGE} bg-slate-500/15 text-slate-400 border-slate-500/30`,
  unavailable: `${_BADGE} bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30`,
  p1:          `${_BADGE} bg-red-500/15 text-red-400 border-red-500/30`,
  p2:          `${_BADGE} bg-orange-500/15 text-orange-400 border-orange-500/30`,
  p3:          `${_BADGE} bg-yellow-500/15 text-yellow-400 border-yellow-500/30`,
  p4:          `${_BADGE} bg-emerald-500/15 text-emerald-400 border-emerald-500/30`,
};


// ─── Layout shells ─────────────────────────────────────────

export const S_PAGE         = 'flex flex-col flex-1 overflow-auto p-5 gap-5';
export const S_PANEL        = 'flex flex-col bg-app-panel/80 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm shadow-lg shadow-black/20';
export const S_PANEL_HEADER = 'flex items-center gap-2 px-4 py-3 border-b border-border-faint shrink-0';
export const S_PANEL_TITLE  = 'text-[11px] font-bold uppercase tracking-[0.9px] text-slate-400';
export const S_PANEL_BODY   = 'flex flex-col flex-1 overflow-y-auto';
export const S_CARD         = 'bg-app-card/70 border border-border-base rounded-xl p-4 backdrop-blur-sm';


// ─── Form controls ─────────────────────────────────────────

export const S_INPUT    = 'w-full min-w-0 max-w-full bg-app-input border border-border-base rounded-lg px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/20 transition-[border-color,box-shadow]';
export const S_SELECT   = 'w-full min-w-0 max-w-full bg-app-input border border-border-base rounded-lg px-3.5 py-2.5 text-sm text-slate-200 outline-none cursor-pointer focus:border-brand/60 focus:ring-2 focus:ring-brand/20 transition-[border-color,box-shadow]';
export const S_TEXTAREA = 'w-full min-w-0 max-w-full bg-app-input border border-border-base rounded-lg px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none resize-y min-h-[90px] focus:border-brand/60 focus:ring-2 focus:ring-brand/20 transition-[border-color,box-shadow]';
export const S_LABEL    = 'block text-[11px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1.5';
export const S_FIELD    = 'flex flex-col gap-0.5';


// ─── Tables ────────────────────────────────────────────────

export const S_TABLE    = 'w-full border-collapse table-fixed';
export const S_TABLE_TH = 'px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500 bg-app-bg/60 backdrop-blur-sm border-b border-border-base sticky top-0';
export const S_TABLE_TD = 'px-4 py-2.5 text-[12.5px] text-slate-300 border-b border-border-faint';

export const trHoverOn  = (e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; };
export const trHoverOff = (e) => { e.currentTarget.style.background = ''; };


// ─── Modals ────────────────────────────────────────────────

export const S_OVERLAY      = 'fixed inset-0 z-[800] bg-app-overlay backdrop-blur-sm flex items-center justify-center p-4';
export const S_MODAL        = 'relative bg-app-card border border-border-strong rounded-2xl shadow-2xl shadow-black/60 w-full max-w-[560px] max-h-[90vh] flex flex-col overflow-hidden animate-modal-pop';
export const S_MODAL_HEADER = 'flex items-center gap-3 px-5 py-4 border-b border-border-base shrink-0';
export const S_MODAL_TITLE  = 'flex-1 text-[15px] font-bold text-white tracking-[-0.2px]';
export const S_MODAL_BODY   = 'flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4';
export const S_MODAL_FOOTER = 'flex justify-end gap-2 px-5 py-3 border-t border-border-base shrink-0';


// ─── Status / Priority helpers ─────────────────────────────

export const cadStatus = (s) => ({
  AVAILABLE:   `${_BADGE} bg-emerald-500/15 text-emerald-400 border-emerald-500/30`,
  BUSY:        `${_BADGE} bg-red-500/15 text-red-400 border-red-500/30`,
  ENRT:        `${_BADGE} bg-violet-500/15 text-violet-400 border-violet-500/30`,
  ARRVD:       `${_BADGE} bg-teal-500/15 text-teal-300 border-teal-500/30`,
  OFFDUTY:     `${_BADGE} bg-slate-500/15 text-slate-400 border-slate-500/30`,
  UNAVAILABLE: `${_BADGE} bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30`,
}[s] || `${_BADGE} bg-slate-500/15 text-slate-400 border-slate-500/30`);

export const CAD_STATUS_LABEL = {
  AVAILABLE: 'AVAILABLE', BUSY: 'BUSY', ENRT: 'EN ROUTE',
  ARRVD: 'ON SCENE', OFFDUTY: 'OFF DUTY', UNAVAILABLE: 'UNAVAILABLE',
};

export const cadCallStatus = (s) => ({
  PENDING:   `${_BADGE} bg-amber-500/15 text-amber-400 border-amber-500/30`,
  ACTIVE:    `${_BADGE} bg-blue-500/15 text-blue-400 border-blue-500/30`,
  ENRT:      `${_BADGE} bg-violet-500/15 text-violet-400 border-violet-500/30`,
  ONSCENE:   `${_BADGE} bg-emerald-500/15 text-emerald-400 border-emerald-500/30`,
  CLOSED:    `${_BADGE} bg-slate-500/15 text-slate-400 border-slate-500/30`,
  CANCELLED: `${_BADGE} bg-slate-500/15 text-slate-400 border-slate-500/30`,
}[s] || `${_BADGE} bg-slate-500/15 text-slate-400 border-slate-500/30`);

const _PRI = 'inline-flex items-center leading-none px-2 py-0.5 text-[10px] font-extrabold rounded-md border';
export const cadPri = (p) => ({
  1: `${_PRI} bg-red-500/15 text-red-400 border-red-500/30`,
  2: `${_PRI} bg-orange-500/15 text-orange-400 border-orange-500/30`,
  3: `${_PRI} bg-yellow-500/15 text-yellow-400 border-yellow-500/30`,
  4: `${_PRI} bg-emerald-500/15 text-emerald-400 border-emerald-500/30`,
}[p] || `${_PRI} bg-slate-500/15 text-slate-400 border-slate-500/30`);

export const cadElapsed = (cls) => ({
  normal:   'text-[10px] font-mono text-slate-400',
  warning:  'text-[10px] font-mono text-amber-400',
  critical: 'text-[10px] font-mono text-red-400 animate-pulse-red',
}[cls] || 'text-[10px] font-mono text-slate-400');


// ─── Status bar ────────────────────────────────────────────

export const S_STATUSBAR     = 'flex items-center h-5 min-h-5 bg-app-bg border-t border-border-faint px-2 gap-0 shrink-0 font-mono text-[9px] overflow-hidden';
export const S_STATUSBAR_SEP = 'w-px self-stretch bg-border-faint mx-1';
export const S_STATUSBAR_HI  = 'text-sky-400';
export const S_STATUSBAR_AV  = 'text-green-400';
export const S_STATUSBAR_P1  = 'text-red-400 animate-pulse-red';


// ─── Call cards ────────────────────────────────────────────

const _PRI_BORDER = { 1: 'border-l-red-600', 2: 'border-l-orange-500', 3: 'border-l-yellow-500', 4: 'border-l-green-600' };
const _PRI_BG     = { 1: 'bg-red-950/20', 2: 'bg-orange-950/20', 3: 'bg-yellow-950/20', 4: 'bg-app-card' };

export const S_CALL_CARD = (priority = 4, selected = false) =>
  `block w-full text-left p-2.5 border-b border-border-faint border-l-2 cursor-pointer transition-colors ${_PRI_BORDER[priority] || 'border-l-border-base'} ${selected ? 'bg-app-selected' : _PRI_BG[priority] || 'bg-app-card'} hover:bg-app-hover`;

export const callCardHoverOn  = undefined;
export const callCardHoverOff = undefined;


// ─── Unit rows ─────────────────────────────────────────────

export const S_UNIT_ROW     = 'flex items-center gap-2 px-3 py-2 border-b border-border-faint cursor-pointer hover:bg-app-hover transition-colors';
export const unitRowHoverOn  = undefined;
export const unitRowHoverOff = undefined;


// ─── Transmission log ──────────────────────────────────────

export const S_TX_ENTRY = 'flex gap-2 py-0.5 text-[11px] font-mono';
export const S_TX_TIME  = 'text-slate-500 shrink-0';
export const TX_KIND_COLOR = {
  dispatch: 'text-sky-400',
  officer:  'text-green-400',
  system:   'text-slate-500',
  alert:    'text-red-400',
  note:     'text-yellow-400',
};


// ─── Stat widgets ──────────────────────────────────────────

export const S_STAT       = 'flex flex-col gap-1.5 p-4 bg-app-card/70 border border-border-base rounded-xl backdrop-blur-sm';
export const S_STAT_LABEL = 'text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500';
export const S_STAT_VALUE = 'text-[28px] leading-none font-extrabold text-white';
export const S_STAT_SUB   = 'text-[10px] text-slate-500';


// ─── Record rows ───────────────────────────────────────────

export const S_RECORD_RETURN        = 'flex flex-col w-full max-w-[680px] bg-black/20 border border-border-base rounded-md overflow-hidden';
export const S_RECORD_RETURN_HEADER = 'flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.5px] text-slate-500 px-4 pt-3 pb-2';
export const S_RECORD_RETURN_MAIN   = 'text-[13px] font-semibold text-slate-200';
export const S_RECORD_RETURN_SUB    = 'text-[11px] text-slate-500';

// NCIC terminal teletype aesthetics * must remain as style objects
const FONT_MONO = '"Courier New"';
export const S_RECORD_RETURN_ALERT      = { padding: '6px 14px', background: '#c41818', color: '#fff', fontFamily: `${FONT_MONO}, monospace`, fontSize: 11, fontWeight: 700, letterSpacing: '0.4px' };
export const S_RECORD_RETURN_ALERT_WARN = { ...S_RECORD_RETURN_ALERT, background: '#c4621a' };
export const S_RECORD_RETURN_BODY       = { padding: '14px 16px 16px', lineHeight: 1.9, color: '#aeb9c8', maxHeight: '62vh', overflowY: 'auto' };
export const S_RECORD_RETURN_SECTION    = { color: '#eaf1f9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', margin: '15px 0 4px', fontSize: 12.5 };
export const S_RECORD_RETURN_LINE       = { fontSize: 12.5, lineHeight: 1.75 };
export const S_RECORD_RETURN_KEY        = { color: '#7e8ea3', fontWeight: 400, marginRight: 7 };
export const S_RECORD_RETURN_VAL        = { background: 'rgba(58,136,232,0.18)', color: '#dfe9f5', padding: '0 5px', borderRadius: 2 };
export const S_RECORD_RETURN_FLAG       = { display: 'inline-block', background: '#c41818', color: '#fff', fontWeight: 700, padding: '2px 8px', fontSize: 10, letterSpacing: '0.5px', borderRadius: 3, marginRight: 4 };
export const S_RECORD_RETURN_FLAG_WARN  = { ...S_RECORD_RETURN_FLAG, background: '#c4621a' };
export const S_RECORD_RETURN_FOOTER     = { fontSize: 10, marginTop: 14, color: '#5a6678', letterSpacing: '0.3px' };

export const S_DETAIL_ROW        = 'flex items-start gap-3 py-1.5 border-b border-border-faint last:border-0';
export const S_DETAIL_LABEL      = 'text-[10px] font-bold uppercase tracking-[0.5px] text-slate-500 w-24 shrink-0 pt-0.5';
export const S_DETAIL_VALUE      = 'text-[13px] text-slate-200 flex-1';
export const S_DETAIL_VALUE_MONO = 'text-[13px] text-slate-200 flex-1 font-mono';


// ─── Form document ─────────────────────────────────────────

export const S_FORM_DOC_WRAP    = 'flex-1 overflow-auto bg-[#2e2e32] p-5';
// Paper document (white background, print-fidelity) * must remain style objects
export const S_FORM_DOC         = { background: '#ffffff', color: '#000000', fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: 11, width: '100%', minHeight: '100%', border: '1px solid #888', boxShadow: '0 6px 28px rgba(0,0,0,0.7)' };
const _S_FORM_DOC_ALERT         = { padding: '5px 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', borderBottom: '1px solid #000', display: 'flex', gap: 12 };
export const S_FORM_DOC_FOOTER_S   = { padding: '4px 10px', fontSize: 7.5, color: '#666', textAlign: 'center', background: '#f4f4f4', borderTop: '1px solid #ccc', letterSpacing: '0.2px' };
export const S_FORM_DOC_ALERT_RED    = { ..._S_FORM_DOC_ALERT, background: '#cc0000', color: '#fff' };
export const S_FORM_DOC_ALERT_ORANGE = { ..._S_FORM_DOC_ALERT, background: '#cc5500', color: '#fff' };
export const S_FORM_DOC_ALERT_YELLOW = { ..._S_FORM_DOC_ALERT, background: '#ccaa00', color: '#000' };
export const S_FORM_DOC_HEADER  = 'flex items-center gap-2 px-4 py-3 bg-app-card border-b border-border-strong shrink-0';
export const S_FORM_DOC_BODY    = 'flex-1 overflow-y-auto p-4 flex flex-col gap-4';
export const S_FORM_DOC_SECTION = 'flex flex-col gap-2 p-3 bg-app-panel border border-border-base rounded';
export const S_FORM_ROW         = 'flex gap-3 flex-wrap';
export const S_FORM_CELL        = 'flex flex-col flex-1 min-w-[140px] gap-1';
export const S_FORM_CELL_WIDE   = 'flex flex-col w-full gap-1';


// ─── Data value ────────────────────────────────────────────

export const S_DATA = 'font-mono text-[11px] text-cad-data';


// ─── Grid helpers ──────────────────────────────────────────

export const S_GRID_2 = 'grid grid-cols-2 gap-1.5';
export const S_GRID_3 = 'grid grid-cols-3 gap-1.5';
export const S_GRID_4 = 'grid grid-cols-4 gap-1.5';


// ─── Generic status badge helper ───────────────────────────

export const statusBadge = (status) => ({
  ACTIVE: BADGE.green, APPROVED: BADGE.green, VALID: BADGE.green,
  SUSPENDED: BADGE.red, DENIED: BADGE.red, EXPIRED: BADGE.red,
  PENDING: BADGE.orange, REVIEW: BADGE.orange,
  INACTIVE: BADGE.gray, NONE: BADGE.gray, CLOSED: BADGE.gray,
}[status] || BADGE.gray);
