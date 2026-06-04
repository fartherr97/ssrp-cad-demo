import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MdClose } from 'react-icons/md';

/*
  useMountTransition * keeps a component mounted long enough to play an exit
  animation after `open` flips to false.

  const { mounted, show } = useMountTransition(open, 240);
  if (!mounted) return null;
  // `show` is true while entering/idle, false while exiting.
*/
export function useMountTransition(open, exitMs = 240) {
  const [mounted, setMounted] = useState(open);
  const [show, setShow] = useState(open);
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    if (open) {
      // Mount and enter in the same commit. CSS keyframe animations play from
      // their `from` state on insertion, so no rAF defer is needed * deferring
      // would leave one frame in the non-animated state and cause a flicker.
      setMounted(true);
      setShow(true);
      return undefined;
    }
    setShow(false);
    timer.current = setTimeout(() => setMounted(false), exitMs);
    return () => clearTimeout(timer.current);
  }, [open, exitMs]);

  return { mounted, show };
}

/*
  Modal * animated, portaled dialog with backdrop fade + card entrance.

  <Modal open={open} onClose={close} title="…" icon={MdStore} sheetOnMobile>
    …body…
  </Modal>

  - Animates in AND out (renders during exit via useMountTransition).
  - `sheetOnMobile` slides up as a bottom sheet on small screens.
  - Closes on backdrop click and Escape.
*/
export default function Modal({
  open,
  onClose,
  title,
  icon: Icon,
  iconColor = '#3d82f0',
  children,
  footer,
  maxWidth = 520,
  sheetOnMobile = true,
  closeOnBackdrop = true,
  zIndex = 50,
}) {
  const { mounted, show } = useMountTransition(open, 260);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const sheet = sheetOnMobile;
  const cardEnter = sheet ? 'anim-sheet-in sm:anim-modal-in' : 'anim-modal-in';
  const cardExit  = sheet ? 'anim-sheet-out sm:anim-modal-out' : 'anim-modal-out';

  return createPortal(
    <div
      className={`fixed inset-0 flex p-0 sm:p-4 ${sheet ? 'items-end sm:items-center' : 'items-center'} justify-center ${show ? 'anim-overlay-in' : 'anim-overlay-out'}`}
      style={{ zIndex, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={e => closeOnBackdrop && e.target === e.currentTarget && onClose?.()}
    >
      <div
        className={`w-full bg-app-card border border-border-strong shadow-2xl shadow-black/60 flex flex-col overflow-hidden
          ${sheet ? 'rounded-t-2xl sm:rounded-2xl max-h-[92dvh]' : 'rounded-2xl max-h-[88dvh]'}
          ${show ? cardEnter : cardExit}`}
        style={{ maxWidth }}
      >
        {title && (
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border-faint shrink-0">
            {Icon && (
              <span className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                style={{ background: `${iconColor}1f`, color: iconColor }}>
                <Icon size={18} />
              </span>
            )}
            <span className="flex-1 text-[15px] font-bold text-white truncate">{title}</span>
            <button type="button" onClick={onClose}
              className="press shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
              style={{ background: 'none', border: 'none' }} aria-label="Close">
              <MdClose size={18} />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-border-faint px-5 py-3.5">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}
