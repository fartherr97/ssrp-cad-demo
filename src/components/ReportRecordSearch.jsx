import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCAD } from '../store/cadStore';
import { MdSearch, MdClose, MdDescription, MdFolder, MdFilterList } from 'react-icons/md';

const STATUS_COLORS = {
  'Pending Review':   'text-amber-400 bg-amber-400/10 border-amber-400/25',
  'Approved':         'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
  'Rejected':         'text-red-400 bg-red-400/10 border-red-400/25',
  'Pending Changes':  'text-orange-400 bg-orange-400/10 border-orange-400/25',
  'Active':           'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
  'Expired':          'text-slate-400 bg-slate-400/10 border-slate-400/25',
  'Revoked':          'text-red-400 bg-red-400/10 border-red-400/25',
  'Draft':            'text-slate-500 bg-slate-500/10 border-slate-500/25',
};

function StatusChip({ status }) {
  const cls = STATUS_COLORS[status] || 'text-slate-400 bg-slate-400/10 border-slate-400/25';
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-semibold tracking-wide ${cls}`}>
      {status}
    </span>
  );
}

const CHIP = (active) =>
  `px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer transition-all ${
    active
      ? 'bg-brand/15 text-brand-bright border-brand/40'
      : 'bg-white/[0.03] text-slate-400 border-border-base hover:bg-white/[0.06] hover:text-slate-200'
  }`;

export default function ReportRecordSearch({ onClose }) {
  const { state } = useCAD();
  const { reports = [], records = [] } = state;

  const [query, setQuery]           = useState('');
  const [kindFilter, setKindFilter] = useState('ALL');   // ALL | REPORTS | RECORDS
  const [statusFilter, setStatus]   = useState('ALL');
  const [selected, setSelected]     = useState(null);
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const allItems = [
    ...reports.map(r => ({ ...r, _kind: 'report', _number: r.caseNumber  })),
    ...records.map(r => ({ ...r, _kind: 'record', _number: r.recordNumber })),
  ];

  const allStatuses = [...new Set(allItems.map(i => i.status).filter(Boolean))].sort();

  const q = query.trim().toLowerCase();
  const filtered = allItems.filter(item => {
    const matchQ      = !q || item._number?.toLowerCase().includes(q) || item.type?.toLowerCase().includes(q);
    const matchKind   = kindFilter === 'ALL' || (kindFilter === 'REPORTS' ? item._kind === 'report' : item._kind === 'record');
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchQ && matchKind && matchStatus;
  }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const sel = selected ? allItems.find(i => i._kind === selected._kind && i.id === selected.id) : null;

  return createPortal(
    <div className="fixed inset-0 z-[3500] flex items-start justify-center p-3 sm:p-6" style={{ paddingTop: 'clamp(40px, 8vh, 100px)' }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[640px] rounded-2xl border border-border-base shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
        style={{ background: 'var(--app-card, #161b22)', maxHeight: '80vh' }}>

        {/* Search bar */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border-base shrink-0">
          <MdSearch size={18} className="text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-[14px] text-slate-200 placeholder:text-slate-600 outline-none"
            placeholder="Case number, record number, or type…"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setSelected(null); }} className="text-slate-500 hover:text-slate-300 transition-colors">
              <MdClose size={15} />
            </button>
          )}
          <div className="w-px h-5 bg-border-base shrink-0" />
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-0.5">
            <MdClose size={17} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-border-faint shrink-0">
          <div className="flex gap-1.5">
            {[['ALL','All'],['REPORTS','Reports'],['RECORDS','Records']].map(([v,l]) => (
              <button key={v} className={CHIP(kindFilter === v)} onClick={() => { setKindFilter(v); setSelected(null); }}>{l}</button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <MdFilterList size={13} className="text-slate-500" />
            <select
              className="bg-app-input border border-border-base rounded-lg px-2 py-1 text-[11px] text-slate-300 outline-none cursor-pointer"
              value={statusFilter}
              onChange={e => { setStatus(e.target.value); setSelected(null); }}
            >
              <option value="ALL">All Statuses</option>
              {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <span className="text-[10px] text-slate-600 font-mono ml-1">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Results + detail split */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* List */}
          <div className={`flex flex-col overflow-y-auto ${sel ? 'hidden sm:flex sm:w-[240px] sm:border-r sm:border-border-faint' : 'flex-1'}`}>
            {filtered.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 py-12 text-slate-600">
                <MdSearch size={28} className="opacity-30" />
                <p className="text-[12px]">{q ? 'No matches found' : 'Start typing to search'}</p>
                {q && <p className="text-[11px] text-slate-700">Supports partial matches — try a shorter term</p>}
              </div>
            ) : filtered.map(item => (
              <button
                key={`${item._kind}-${item.id}`}
                className={`text-left w-full px-4 py-3 border-b border-border-faint transition-colors ${
                  sel?.id === item.id && sel?._kind === item._kind
                    ? 'bg-brand/10'
                    : 'hover:bg-white/[0.03]'
                }`}
                onClick={() => setSelected(item)}
              >
                <div className="flex items-center gap-2 mb-1">
                  {item._kind === 'report'
                    ? <MdDescription size={13} className="text-blue-400 shrink-0" />
                    : <MdFolder size={13} className="text-emerald-400 shrink-0" />
                  }
                  <span className="text-[11px] font-mono text-brand-bright font-semibold">{item._number}</span>
                  <StatusChip status={item.status} />
                </div>
                <div className="text-[12px] text-slate-200 font-medium leading-tight">{item.type}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{item.date || '—'}</div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          {sel && (
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Mobile back */}
              <button
                className="sm:hidden flex items-center gap-1.5 px-4 py-2.5 text-[11px] text-slate-400 border-b border-border-faint hover:text-slate-200 transition-colors"
                onClick={() => setSelected(null)}
              >
                ← Back to results
              </button>

              <div className="px-5 py-4 flex-1">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${sel._kind === 'report' ? 'bg-blue-500/15' : 'bg-emerald-500/15'}`}>
                    {sel._kind === 'report'
                      ? <MdDescription size={16} className="text-blue-400" />
                      : <MdFolder size={16} className="text-emerald-400" />
                    }
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500 mb-0.5">
                      {sel._kind === 'report' ? 'Report' : 'Record'}
                    </div>
                    <div className="text-[15px] font-bold text-white leading-tight">{sel.type}</div>
                    <div className="text-[11px] font-mono text-brand-bright mt-0.5">{sel._number}</div>
                  </div>
                </div>

                {/* Fields */}
                {[
                  ['Status',  <StatusChip status={sel.status} />],
                  ['Date',    sel.date || '—'],
                  ['Officer', sel.officerBadge || '—'],
                  ['Call ID', sel.callId || '—'],
                  ['Summary', sel.summary || sel.formData?.summary || '—'],
                ].map(([label, val]) => (
                  <div key={label} className="mb-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-0.5">{label}</div>
                    <div className="text-[12.5px] text-slate-300 leading-[1.6]">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
