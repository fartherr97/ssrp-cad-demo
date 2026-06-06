import { createContext, useContext, useCallback, useMemo, useRef, useState } from 'react';
import { MdWarningAmber, MdHelpOutline } from 'react-icons/md';
import Modal from '../components/ui/Modal';
import { S_BTN_SECONDARY, S_BTN_DANGER, S_BTN_SUBMIT } from '../constants/styles';

/*
  Promise-based confirm dialog — a styled, accessible replacement for the
  native window.confirm(). Lives once at the app root.

  Usage:
    const confirm = useConfirm();
    const ok = await confirm({
      title: 'Delete civilian?',
      message: 'This permanently removes the record and all linked data.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;

  Resolves true on confirm, false on cancel / backdrop / Escape.
*/

const ConfirmCtx = createContext(null);

export function ConfirmProvider({ children }) {
  const [opts, setOpts] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((options = {}) => {
    const o = typeof options === 'string' ? { message: options } : options;
    return new Promise((resolve) => {
      resolver.current = resolve;
      setOpts(o);
    });
  }, []);

  const settle = useCallback((result) => {
    resolver.current?.(result);
    resolver.current = null;
    setOpts(null);
  }, []);

  const api = useMemo(() => confirm, [confirm]);
  const open = !!opts;
  const danger = !!opts?.danger;

  return (
    <ConfirmCtx.Provider value={api}>
      {children}
      <Modal
        open={open}
        onClose={() => settle(false)}
        title={opts?.title || (danger ? 'Are you sure?' : 'Confirm')}
        icon={danger ? MdWarningAmber : MdHelpOutline}
        iconColor={danger ? '#ff5d5d' : '#3d82f0'}
        maxWidth={opts?.maxWidth || 420}
        sheetOnMobile={false}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className={S_BTN_SECONDARY} onClick={() => settle(false)}>
              {opts?.cancelLabel || 'Cancel'}
            </button>
            <button
              type="button"
              autoFocus
              className={danger ? S_BTN_DANGER : S_BTN_SUBMIT}
              onClick={() => settle(true)}
            >
              {opts?.confirmLabel || (danger ? 'Delete' : 'Confirm')}
            </button>
          </div>
        }
      >
        <div className="px-5 py-5 text-[13.5px] leading-relaxed text-slate-300 whitespace-pre-line">
          {opts?.message || 'Are you sure you want to continue?'}
        </div>
      </Modal>
    </ConfirmCtx.Provider>
  );
}

/* Safe fallback: outside a provider, fall back to native confirm so callers
   never throw (mirrors the toast no-op pattern). */
export function useConfirm() {
  return useContext(ConfirmCtx) || ((o) => Promise.resolve(
    typeof window !== 'undefined'
      ? window.confirm((typeof o === 'string' ? o : o?.message) || 'Are you sure?')
      : true
  ));
}
