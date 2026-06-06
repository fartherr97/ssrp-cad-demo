/* SSRP Admin customization UI kit.
   Deep navy panels, blue accent, translucent rounded cards. Shared by every admin section. */

import { useState, useMemo } from 'react';
import Select from '../../components/ui/Select';
import { MdFirstPage, MdChevronLeft, MdChevronRight, MdLastPage } from 'react-icons/md';

export const ADMIN = {
  red:      '#3d82f0',
  redHi:    '#5a97f5',
  redGlow:  'rgba(61,130,240,0.4)',
  bg:       '#0b1424',
  panel:    '#101d31',
  panel2:   '#13233b',
  row:      '#0f1c30',
  rowAlt:   '#101f34',
  border:   'rgba(255,255,255,0.10)',
  borderHi: 'rgba(255,255,255,0.14)',
  text:     '#dde6f1',
  textDim:  '#93a4bd',
  textMute: '#5d6f88',
  green:    '#22c55e',
  amber:    '#f59e0b',
  blue:     '#3d82f0',
};

/* Page wrapper * full-height scroll area with navy bg */
export function AdminContent({ children }) {
  return (
    <div className="flex-1 min-w-0 min-h-0 w-full overflow-auto p-3 md:p-6 box-border font-ui bg-app-bg">
      {children}
    </div>
  );
}

/* A titled translucent panel (the boxed sections) */
export function AdminPanel({ title, subtitle, right, children, center, style = {} }) {
  return (
    <div
      className="rounded-xl mb-5 overflow-hidden bg-app-panel border border-border-base shadow-lg shadow-black/20"
      style={style}
    >
      {(title || right) && (
        <div
          className={`flex items-center gap-3 px-5 py-4 flex-wrap relative border-b border-border-faint ${center ? 'justify-center' : 'justify-between'}`}
        >
          <div className="min-w-0" style={{ textAlign: center ? 'center' : 'left' }}>
            {title && <div className="text-[11px] font-bold uppercase tracking-[0.9px] text-slate-400">{title}</div>}
            {subtitle && <div className="text-[12px] mt-1 text-slate-500 normal-case">{subtitle}</div>}
          </div>
          {right && (
            <div className={`flex gap-2 items-center flex-wrap ${center ? 'sm:absolute sm:right-5' : ''}`}>{right}</div>
          )}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

/* Page-level header (e.g. "Community Customization") */
export function AdminPageTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl px-5 py-4 mb-5 bg-app-panel border border-border-base shadow-lg shadow-black/20">
      <div className="text-[18px] font-bold text-white tracking-[-0.2px]">{children}</div>
      {right && <div className="flex gap-2 flex-wrap">{right}</div>}
    </div>
  );
}

/* Customization hub card (icon + title) */
export function SonCard({ icon: Icon, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="son-card text-left rounded-xl p-5 cursor-pointer flex flex-col gap-7 min-h-[120px] bg-app-card border border-border-base transition-all duration-150 hover:-translate-y-0.5 hover:border-brand/50 hover:bg-app-elevated"
    >
      {Icon && <Icon size={26} className="text-brand-bright" />}
      <div>
        <div className="text-[14px] font-bold text-cad-text">{title}</div>
        {desc && <div className="text-[11px] mt-1 leading-[1.4] text-slate-500">{desc}</div>}
      </div>
    </button>
  );
}

/* Buttons */
export function SonButton({ children, onClick, variant = 'default', size, style = {}, type, disabled, title }) {
  const variants = {
    default: 'bg-white/[0.05] text-slate-200 border border-white/10 hover:bg-white/[0.1]',
    red:     'bg-blue-600 text-white border border-blue-400/30 shadow-sm shadow-blue-950/40 hover:bg-blue-500',
    green:   'bg-emerald-600 text-white border border-emerald-400/30 shadow-sm shadow-emerald-950/40 hover:bg-emerald-500',
    ghost:   'bg-transparent text-slate-400 border border-white/10 hover:bg-white/[0.06] hover:text-slate-200',
  };
  return (
    <button
      type={type} onClick={onClick} disabled={disabled} title={title}
      className={`inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg cursor-pointer font-ui whitespace-nowrap transition-all duration-150 active:scale-[0.98]
        ${size === 'sm' ? 'px-3 py-1.5 text-[12px]' : 'px-4 py-2 text-[13px]'}
        ${disabled ? 'opacity-40 cursor-not-allowed active:scale-100' : ''}
        ${variants[variant]}`}
      style={style}
    >
      {children}
    </button>
  );
}

export const SON_INPUT = {
  width: '100%', background: '#0d1a2c', border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 8, color: '#dde6f1', padding: '10px 14px', fontSize: 13,
  fontFamily: 'var(--font-ui)', boxSizing: 'border-box', outline: 'none',
};

export const SON_LABEL = {
  display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.5px',
  textTransform: 'uppercase', color: '#5d6f88', marginBottom: 6,
};

export function SonField({ label, children }) {
  return (
    <div>
      <label style={SON_LABEL}>{label}</label>
      {children}
    </div>
  );
}

/* Search input with icon */
export function SonSearch({ value, onChange, placeholder = 'Search' }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ ...SON_INPUT, width: 260, maxWidth: '100%' }} />
  );
}

/* Table primitives */
export function SonTable({ columns, children }) {
  return (
    <div className="overflow-auto max-h-[600px] rounded-xl border border-border-base">
      <table className="w-full border-collapse text-[13px]">
        <thead className="sticky top-0 z-[1]">
          <tr className="bg-app-panel">
            {columns.map((c, i) => (
              <th key={i} className="text-[10px] font-bold tracking-[0.7px] uppercase py-3 px-4 whitespace-nowrap text-slate-500 border-b border-border-base"
                style={{ textAlign: c.align || 'left', width: c.width }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function SonRow({ children, i = 0 }) {
  return (
    <tr
      className="transition-colors"
      style={{ background: i % 2 ? ADMIN.rowAlt : ADMIN.row }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = i % 2 ? ADMIN.rowAlt : ADMIN.row; }}
    >
      {children}
    </tr>
  );
}

export function SonCell({ children, align, mono, color, bold, width }) {
  return (
    <td className="py-2.5 px-4 whitespace-nowrap border-b border-border-faint"
      style={{
        textAlign: align || 'left', color: color || ADMIN.text,
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-ui)',
        fontWeight: bold ? 700 : 400, width,
      }}>{children}</td>
  );
}

/* Small round icon action button (reorder / delete in lists) */
export function SonIconBtn({ icon: Icon, onClick, color = ADMIN.textDim, title, danger, 'aria-label': ariaLabel }) {
  return (
    <button onClick={onClick} title={title} aria-label={ariaLabel || title}
      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center cursor-pointer transition-all duration-150 border
        ${danger
          ? 'bg-red-500/12 border-red-500/40 text-red-400 hover:bg-red-500/20'
          : 'bg-white/[0.05] border-white/10 hover:bg-white/[0.1]'}`}
      style={danger ? undefined : { color }}>
      <Icon size={15} />
    </button>
  );
}

export function SonBadge({ children, color = ADMIN.blue }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold rounded-full tracking-[0.3px] whitespace-nowrap"
      style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
    >{children}</span>
  );
}

export function EmptyState({ children }) {
  return (
    <div className="text-center py-[50px] text-[13px] text-slate-500">{children}</div>
  );
}

/* ── Pagination ──────────────────────────────────────────────
   Splits a (already-filtered) array into pages and clamps the current page
   when the list shrinks (e.g. after filtering). Pair with <Pager>:
     const pager = usePager(filtered, 25);
     …{pager.pageItems.map(...)}…
     <Pager {...pager} />
*/
export function usePager(items, initialSize = 25) {
  const [pageSize, setPageSize] = useState(initialSize);
  const [rawPage, setPage] = useState(1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // Clamp during render (not in an effect) so a shrinking list never leaves us
  // stranded on an out-of-range page, with no extra re-render.
  const page = Math.min(Math.max(1, rawPage), totalPages);
  const start = (page - 1) * pageSize;
  const pageItems = useMemo(() => items.slice(start, start + pageSize), [items, start, pageSize]);
  return { page, setPage, pageSize, setPageSize, total, totalPages, start, pageItems };
}

function PagerBtn({ icon: Icon, onClick, disabled, label }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label}
      className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 enabled:hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors">
      <Icon size={16} />
    </button>
  );
}

/* Rows-per-page selector + first/prev/next/last. Spread a usePager() result
   straight in: <Pager {...pager} />. Renders nothing for an empty list. */
export function Pager({ page, setPage, pageSize, setPageSize, total, totalPages, sizes = [10, 25, 50, 100] }) {
  if (!total) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap pt-4 mt-2 border-t border-border-faint">
      <div className="flex items-center gap-2 text-[12px] text-slate-500">
        <span className="hidden sm:inline">Rows per page</span>
        <Select style={{ ...SON_INPUT, width: 78, padding: '6px 8px' }} value={String(pageSize)}
          onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
          {sizes.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        <span className="ml-1 whitespace-nowrap">{from}–{to} of {total}</span>
      </div>
      <div className="flex items-center gap-1">
        <PagerBtn icon={MdFirstPage}    onClick={() => setPage(1)}           disabled={page <= 1}          label="First page" />
        <PagerBtn icon={MdChevronLeft}  onClick={() => setPage(page - 1)}    disabled={page <= 1}          label="Previous page" />
        <span className="px-2.5 text-[12px] font-semibold text-slate-300 whitespace-nowrap">Page {page} / {totalPages}</span>
        <PagerBtn icon={MdChevronRight} onClick={() => setPage(page + 1)}    disabled={page >= totalPages} label="Next page" />
        <PagerBtn icon={MdLastPage}     onClick={() => setPage(totalPages)}  disabled={page >= totalPages} label="Last page" />
      </div>
    </div>
  );
}

/* "Coming soon" panel for sections not yet wired to real services */
export function ComingSoon({ icon: Icon, title, note }) {
  return (
    <AdminPanel center title={title}>
      <div className="text-center py-9 px-5 text-slate-400">
        {Icon && <Icon size={44} className="text-slate-600 mx-auto mb-3.5" />}
        <div className="text-[14px] mb-1.5 text-cad-text">{title}</div>
        <div className="text-[12px] max-w-[460px] mx-auto leading-[1.6] text-slate-500">
          {note || 'This integration panel is configured here. Live service connections are managed by your server administrator.'}
        </div>
      </div>
    </AdminPanel>
  );
}
