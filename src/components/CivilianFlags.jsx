/* Shared components for displaying and assigning civilian flags. */

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdFlag, MdAdd, MdClose } from 'react-icons/md';
import { useCAD } from '../store/cadStore';

/* Single flag pill */
export function FlagBadge({ flag, onRemove }) {
  if (!flag) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap"
      style={{ background: `${flag.color}22`, color: flag.color, border: `1px solid ${flag.color}44` }}>
      <MdFlag size={9} />
      {flag.name}
      {onRemove && (
        <button type="button" onClick={onRemove}
          className="ml-0.5 w-3 h-3 rounded-full flex items-center justify-center cursor-pointer hover:opacity-70 bg-transparent border-none"
          style={{ color: flag.color }}>
          <MdClose size={9} />
        </button>
      )}
    </span>
  );
}

/* Row of flag badges for a civilian (read-only) */
export function FlagRow({ flags = [], size = 'sm' }) {
  const { state } = useCAD();
  const defs = state.customFlags || [];
  const resolved = flags.map(id => defs.find(f => f.id === id)).filter(Boolean);
  if (resolved.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {resolved.map(f => <FlagBadge key={f.id} flag={f} />)}
    </div>
  );
}

/* Inline flag manager * shows current flags + add button with dropdown */
export function FlagManager({ civilianId, flags = [] }) {
  const { state, dispatch } = useCAD();
  const defs = state.customFlags || [];
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const btnRef = useRef(null);
  const boxRef = useRef(null);

  const resolved = flags.map(id => defs.find(f => f.id === id)).filter(Boolean);
  const available = defs.filter(f => !flags.includes(f.id));

  const place = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setCoords({ left: r.left, top: r.bottom + 4 });
    }
  };

  useEffect(() => {
    if (!open) return;
    const h = e => {
      if (!btnRef.current?.contains(e.target) && !boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const add = (flagId) => {
    dispatch({ type: 'ADD_CIVILIAN_FLAG', payload: { civilianId, flagId } });
    setOpen(false);
  };

  const remove = (flagId) => {
    dispatch({ type: 'REMOVE_CIVILIAN_FLAG', payload: { civilianId, flagId } });
  };

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {resolved.map(f => (
        <FlagBadge key={f.id} flag={f} onRemove={() => remove(f.id)} />
      ))}
      <div className="relative" ref={btnRef}>
        <button type="button" onClick={() => { place(); setOpen(o => !o); }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all border border-white/10 bg-white/[0.04] text-slate-500 hover:text-slate-200 hover:bg-white/[0.08]">
          <MdAdd size={11} /> Add Flag
        </button>
        {open && coords && createPortal(
          <div ref={boxRef}
            className="fixed z-[3000] bg-app-card border border-border-strong shadow-2xl shadow-black/60 rounded-xl p-1.5 min-w-[200px] max-h-[280px] overflow-auto"
            style={{ left: coords.left, top: coords.top, animation: 'dropdownFadeIn 0.12s ease-out' }}>
            {available.length === 0
              ? <div className="px-3 py-2 text-[11px] text-slate-500 italic">All flags assigned</div>
              : available.map(f => (
                <button key={f.id} type="button" onMouseDown={e => { e.preventDefault(); add(f.id); }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left cursor-pointer transition-colors hover:bg-white/[0.07]">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: f.color }} />
                  <span className="text-[12.5px] font-semibold text-white">{f.name}</span>
                  {f.description && <span className="text-[10px] text-slate-500 truncate">{f.description}</span>}
                </button>
              ))}
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
