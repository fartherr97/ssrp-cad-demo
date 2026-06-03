import {
  createContext, useContext, useState, useCallback, useMemo, useRef, useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import {
  MdCheckCircle, MdErrorOutline, MdInfoOutline, MdWarningAmber, MdClose,
} from 'react-icons/md';

/*
  Lightweight, dependency-free toast system.

  Usage:
    const toast = useToast();
    toast.success('Business saved');
    toast.error('Could not save', { title: 'Save failed' });
    const t = toast.loading('Processing…');
    // …later…
    t.success('Done!');   // promote the same toast
    t.dismiss();

  Variants: success | error | info | warning | loading
*/

const ToastCtx = createContext(null);

const VARIANTS = {
  success: { Icon: MdCheckCircle,  color: '#2fd96b', label: 'Success'    },
  error:   { Icon: MdErrorOutline, color: '#ff5d5d', label: 'Error'      },
  info:    { Icon: MdInfoOutline,  color: '#3d9bf0', label: 'Notice'     },
  warning: { Icon: MdWarningAmber, color: '#f5a93b', label: 'Warning'    },
  loading: { Icon: null,           color: '#9090cc', label: 'Working'    },
};

const EXIT_MS = 260;
let __seq = 0;

/* Accept either toast('text') or toast({ title, message, variant, duration }) */
function normalize(input, extra = {}) {
  if (typeof input === 'string') return { message: input, ...extra };
  return { ...input, ...extra };
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  useEffect(() => () => {
    Object.values(timers.current).forEach(clearTimeout);
  }, []);

  const remove = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(ts => ts.filter(t => t.id !== id));
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(ts => ts.map(t => (t.id === id ? { ...t, leaving: true } : t)));
    timers.current[`x${id}`] = setTimeout(() => remove(id), EXIT_MS);
  }, [remove]);

  const arm = useCallback((id, duration) => {
    clearTimeout(timers.current[id]);
    if (duration && duration > 0) {
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  const push = useCallback((opts) => {
    const id = ++__seq;
    const t = {
      id,
      variant: 'info',
      duration: 4000,
      leaving: false,
      ...opts,
    };
    if (t.variant === 'loading' && opts.duration === undefined) t.duration = 0;
    setToasts(ts => [...ts, t]);
    arm(id, t.duration);

    const handle = {
      id,
      dismiss: () => dismiss(id),
      update: (next) => {
        const patch = normalize(next);
        setToasts(ts => ts.map(x => (x.id === id ? { ...x, ...patch } : x)));
        if (patch.duration !== undefined) arm(id, patch.duration);
      },
    };
    // Convenience promoters: t.success('Done') turns a loading toast green, etc.
    ['success', 'error', 'info', 'warning'].forEach(v => {
      handle[v] = (msg, ex) => handle.update({ variant: v, duration: 4000, ...normalize(msg, ex) });
    });
    return handle;
  }, [arm, dismiss]);

  const api = useMemo(() => {
    const fn = (input, extra) => push(normalize(input, extra));
    fn.success = (msg, ex) => push(normalize(msg, { variant: 'success', ...ex }));
    fn.error   = (msg, ex) => push(normalize(msg, { variant: 'error',   ...ex }));
    fn.info    = (msg, ex) => push(normalize(msg, { variant: 'info',    ...ex }));
    fn.warning = (msg, ex) => push(normalize(msg, { variant: 'warning', ...ex }));
    fn.loading = (msg, ex) => push(normalize(msg, { variant: 'loading', duration: 0, ...ex }));
    fn.dismiss = dismiss;
    fn.push    = push;
    return fn;
  }, [push, dismiss]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastCtx.Provider>
  );
}

/* Safe fallback so calling useToast() outside a provider never throws. */
const NOOP_HANDLE = { id: 0, dismiss() {}, update() {}, success() {}, error() {}, info() {}, warning() {} };
function makeNoop() {
  const fn = () => NOOP_HANDLE;
  ['success', 'error', 'info', 'warning', 'loading', 'push'].forEach(k => { fn[k] = () => NOOP_HANDLE; });
  fn.dismiss = () => {};
  return fn;
}
export function useToast() {
  return useContext(ToastCtx) || makeNoop();
}

/* ── Single toast card ── */
function ToastCard({ toast, onDismiss }) {
  const meta = VARIANTS[toast.variant] || VARIANTS.info;
  const { Icon, color } = meta;
  const loading = toast.variant === 'loading';

  return (
    <div
      role="status"
      onClick={() => onDismiss(toast.id)}
      className={`group pointer-events-auto relative flex items-start gap-3 w-full sm:w-[340px] px-3.5 py-3 rounded-xl cursor-pointer overflow-hidden
        bg-app-card/95 backdrop-blur-md border border-border-strong shadow-2xl shadow-black/50
        ${toast.leaving
          ? 'toast-out-up sm:toast-out'
          : 'toast-in-up sm:toast-in-right'}`}
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <span
        className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 mt-0.5"
        style={{ background: `${color}22`, color }}
      >
        {loading
          ? <span className="ui-spinner" style={{ width: 15, height: 15 }} />
          : <Icon size={17} />}
      </span>

      <div className="min-w-0 flex-1">
        {toast.title && (
          <div className="text-[12.5px] font-bold text-white leading-tight mb-0.5">{toast.title}</div>
        )}
        {toast.message && (
          <div className={`text-[12px] leading-[1.45] ${toast.title ? 'text-slate-400' : 'text-slate-200'}`}>
            {toast.message}
          </div>
        )}
      </div>

      <MdClose size={15} className="shrink-0 mt-0.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* progress bar for timed toasts */}
      {!loading && toast.duration > 0 && !toast.leaving && (
        <span
          className="absolute left-0 bottom-0 h-[2px] origin-left"
          style={{
            width: '100%',
            background: color,
            opacity: 0.6,
            animation: `barGrow ${toast.duration}ms linear reverse forwards`,
          }}
        />
      )}
    </div>
  );
}

/* ── Stacked viewport (portaled to body) ── */
function ToastViewport({ toasts, onDismiss }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed z-[1600] inset-x-3 bottom-4 sm:inset-x-auto sm:right-5 sm:bottom-24 flex flex-col items-stretch sm:items-end gap-2.5 pointer-events-none">
      {toasts.map(t => (
        <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  );
}
