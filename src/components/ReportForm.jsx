/* Dark, app-themed renderer for report/record templates.
   Renders a template's sections + fields as native form controls that match
   the rest of the CAD UI (replaces the white "paper" document look). */

import { S_INPUT, S_SELECT, S_TEXTAREA } from '../constants/styles';

// Static span classes so Tailwind JIT picks them up.
const SPAN = {
  1: 'lg:col-span-1',
  2: 'sm:col-span-2 lg:col-span-2',
  3: 'sm:col-span-2 lg:col-span-3',
  4: 'sm:col-span-2 lg:col-span-4',
};
const FULL = 'sm:col-span-2 lg:col-span-4';

const inputType = (t) =>
  t === 'datetime' ? 'datetime-local' : t === 'date' ? 'date' : t === 'number' ? 'number' : 'text';

function Field({ f, value, onChange, readOnly }) {
  const span = Math.min(f.span || 1, 4);

  // Checkbox — compact toggle row
  if (f.type === 'checkbox') {
    return (
      <label className={`${SPAN[span]} flex items-center gap-2.5 self-end px-3 py-2.5 rounded-lg bg-app-input border border-border-base text-[12.5px] text-slate-200 ${readOnly ? '' : 'cursor-pointer hover:border-border-strong'} transition-colors`}>
        <input type="checkbox" checked={!!value} disabled={readOnly}
          onChange={e => onChange && onChange(e.target.checked)}
          className="w-4 h-4 accent-brand cursor-pointer disabled:cursor-default" />
        {f.label}
      </label>
    );
  }

  const isNarr = f.type === 'textarea';
  const cls = isNarr ? FULL : (SPAN[span] || SPAN[1]);

  return (
    <div className={`flex flex-col ${cls}`}>
      <label className="text-[11px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1.5">
        {f.label}{f.required && <span className="text-red-400"> *</span>}
      </label>

      {readOnly ? (
        <div className={`min-h-[40px] px-3.5 py-2.5 rounded-lg bg-app-input border border-border-base text-sm text-slate-200 ${f.mono ? 'font-mono' : ''} ${isNarr ? 'whitespace-pre-wrap leading-relaxed' : ''}`}>
          {value || <span className="text-slate-600">—</span>}
        </div>
      ) : isNarr ? (
        <textarea className={S_TEXTAREA} rows={f.minRows || 4}
          value={value || ''} onChange={e => onChange && onChange(e.target.value)} />
      ) : f.type === 'dropdown' ? (
        <select className={S_SELECT} value={value || ''} onChange={e => onChange && onChange(e.target.value)}>
          <option value="">—</option>
          {(f.options || []).map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={inputType(f.type)} className={`${S_INPUT} ${f.mono ? 'font-mono' : ''}`}
          value={value || ''} onChange={e => onChange && onChange(e.target.value)} />
      )}
    </div>
  );
}

export default function ReportForm({ template, data = {}, onChange, readOnly = false }) {
  const sections = template?.sections || [];
  const set = (k) => (v) => onChange && onChange(k, v);

  if (sections.length === 0) {
    return (
      <div className="max-w-[1100px] mx-auto w-full p-6 text-center text-slate-600 text-[12px]">
        This template has no fields configured.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1100px] mx-auto w-full">
      <div data-doc-top />
      {sections.map(sec => (
        <section key={sec.id} data-section={sec.title}
          className="bg-app-card/70 border border-border-base rounded-xl overflow-hidden backdrop-blur-sm scroll-mt-4">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-faint text-[11px] font-bold uppercase tracking-[0.7px] text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            {sec.title}
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3.5">
            {sec.fields.map(f => (
              <Field key={f.id} f={f} value={data[f.id]} onChange={set(f.id)} readOnly={readOnly} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
