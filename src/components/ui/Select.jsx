import {
  Children, isValidElement, useEffect, useLayoutEffect,
  useMemo, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import { MdKeyboardArrowDown, MdCheck } from 'react-icons/md';
import { useMountTransition } from './Modal';

/*
  Select — a custom, animated drop-in replacement for native select.

  Designed to swap in 1:1 for the markup already used across the app:

    <Select className={S_SELECT} value={x} onChange={e => set(e.target.value)}>
      <option value="">Choose…</option>
      {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
    </Select>

  - Reads <option> children exactly like a native select (value falls back to
    the option's text when omitted; values are coerced to strings on change to
    match native DOM behaviour, so existing `Number(e.target.value)` handlers
    keep working).
  - Calls onChange({ target: { value } }) so existing handlers need no edits.
  - Portaled, flip-aware menu that animates open AND closed, keyboard-navigable,
    closes on outside-click / Escape, and inherits the same visual styling the
    native control had via the passed `className`.
  - Reduced-motion is honoured globally (see index.css).
*/

// Flatten an option's children down to a plain string (used for the value
// fallback and type-ahead) — mirrors how a native <option> with no `value`
// attribute uses its text content as the value.
function childText(c) {
  if (c == null || c === false) return '';
  if (typeof c === 'string' || typeof c === 'number') return String(c);
  if (Array.isArray(c)) return c.map(childText).join('');
  if (isValidElement(c)) return childText(c.props.children);
  return '';
}

// Pull a flat list of { value, label, disabled } out of arbitrary children
// (arrays, fragments and .map() results are all flattened by Children.toArray).
function collectOptions(children) {
  const out = [];
  Children.toArray(children).forEach(child => {
    if (!isValidElement(child)) return;
    if (child.type === 'option') {
      const raw = child.props.value !== undefined ? child.props.value : childText(child.props.children);
      out.push({
        value: raw,
        key: String(raw),
        label: child.props.children,
        text: childText(child.props.children),
        disabled: !!child.props.disabled,
      });
    } else if (child.props && child.props.children) {
      // Tolerate the occasional wrapper/fragment around options.
      out.push(...collectOptions(child.props.children));
    }
  });
  return out;
}

export default function Select({
  value,
  onChange,
  children,
  className = '',
  disabled = false,
  placeholder = 'Select…',
  name,
  id,
  'aria-label': ariaLabel,
  title,
  style,
}) {
  const options = useMemo(() => collectOptions(children), [children]);
  const selected = useMemo(
    () => options.find(o => String(o.value) === String(value ?? '')),
    [options, value],
  );

  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [rect, setRect] = useState(null);
  const [flip, setFlip] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const { mounted, show } = useMountTransition(open, 140);

  const MAX_MENU_H = 280;
  const optCount = options.length;

  // Keep the menu glued to (and flip-aware of) the trigger while it's open.
  useLayoutEffect(() => {
    if (!open) return undefined;
    const place = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const below = window.innerHeight - r.bottom;
      const above = r.top;
      const needed = Math.min(MAX_MENU_H, optCount * 36 + 12);
      const up = below < needed && above > below;
      setFlip(up);
      setRect({
        left: r.left,
        width: r.width,
        top: up ? undefined : r.bottom + 4,
        bottom: up ? window.innerHeight - r.top + 4 : undefined,
        maxH: Math.max(120, (up ? above : below) - 12),
      });
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, optCount]);

  // Outside-click + Escape to dismiss.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); } };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const openMenu = () => {
    if (disabled) return;
    const cur = options.findIndex(o => String(o.value) === String(value ?? ''));
    setActiveIdx(cur);
    setOpen(true);
  };

  const choose = (opt) => {
    if (opt.disabled) return;
    setOpen(false);
    triggerRef.current?.focus();
    // Coerce to string to match native select change semantics.
    onChange?.({ target: { value: String(opt.value), name } });
  };

  const moveActive = (dir) => {
    setActiveIdx(prev => {
      let i = prev;
      for (let step = 0; step < options.length; step++) {
        i = (i + dir + options.length) % options.length;
        if (!options[i].disabled) return i;
      }
      return prev;
    });
  };

  const onTriggerKey = (e) => {
    if (disabled) return;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openMenu(); }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (options[activeIdx]) choose(options[activeIdx]);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        name={name}
        title={title}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onTriggerKey}
        className={`${className} inline-flex items-center justify-between gap-2 text-left disabled:opacity-50 disabled:cursor-not-allowed`}
        style={style}
      >
        <span className={`truncate ${selected ? 'text-inherit' : 'text-slate-500'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <MdKeyboardArrowDown
          size={18}
          className={`shrink-0 -mr-1 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {mounted && rect && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          className={`fixed z-[4000] bg-app-card border border-border-strong shadow-2xl shadow-black/60 rounded-xl p-1 overflow-y-auto
            ${show ? 'anim-dropdown-in' : 'anim-dropdown-out'}`}
          style={{
            left: rect.left,
            width: rect.width,
            top: rect.top,
            bottom: rect.bottom,
            maxHeight: Math.min(MAX_MENU_H, rect.maxH),
            transformOrigin: flip ? 'bottom center' : 'top center',
          }}
        >
          {options.length === 0 && (
            <div className="px-3 py-2.5 text-[12px] text-slate-600 italic">No options</div>
          )}
          {options.map((opt, i) => {
            const isSel = String(opt.value) === String(value ?? '');
            const isActive = i === activeIdx;
            return (
              <button
                key={opt.key + i}
                type="button"
                role="option"
                aria-selected={isSel}
                disabled={opt.disabled}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => choose(opt)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-[12.5px] font-medium cursor-pointer transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed
                  ${isSel ? 'text-brand-bright' : 'text-slate-200'}
                  ${isActive && !opt.disabled ? 'bg-white/[0.07]' : ''}`}
              >
                <span className="flex-1 min-w-0 truncate">{opt.label}</span>
                {isSel && <MdCheck size={15} className="shrink-0 text-brand-bright" />}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}
