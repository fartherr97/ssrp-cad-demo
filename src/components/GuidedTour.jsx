import { useState, useLayoutEffect, useEffect, useCallback } from 'react';
import { useCAD } from '../store/cadStore';

/* First-run guided tour * a spotlight walkthrough that teaches the CAD layout.
   Shows once per user (tracked in localStorage); fully skippable. */

const TOUR_KEY = 'ssrp_tour_done_v1';

const STEPS = [
  {
    selector: null,
    title: 'Welcome to SSRP CAD 👋',
    body: "This is your Computer-Aided Dispatch console. It looks like a lot, but you'll only use a few things day to day. Let's take 30 seconds to walk through the basics.",
  },
  {
    selector: '.cad-actionbar',
    title: 'Your toolbar',
    body: 'Everything lives up here: jump between CAD, Search, Reports and Records, set your duty status, and reach your profile. Hover any button to see what it does.',
    placement: 'bottom',
  },
  {
    selector: '.calls-panel',
    title: 'Active calls',
    body: 'Service calls appear here, sorted by priority. Click any call to open it, see details, and attach yourself to it.',
    placement: 'right',
  },
  {
    selector: '[data-tour="panic"]',
    title: 'Panic button',
    body: 'If you ever need immediate backup, hit PANIC. It instantly broadcasts your unit and location to every unit and dispatch.',
    placement: 'bottom',
  },
  {
    selector: '[data-tour="account"]',
    title: 'Profile & sign out',
    body: 'Your profile, a quick way back to the portal picker (Home), and sign-out are always here on the right.',
    placement: 'bottom',
  },
  {
    selector: null,
    title: "You're all set ✅",
    body: "That's the tour! Take your time exploring * nothing here is permanent in the demo. You can always hover a button to learn what it does.",
  },
];

const PADDING = 8;

export default function GuidedTour() {
  const { state } = useCAD();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);

  // Start the tour once, shortly after a user logs in.
  useEffect(() => {
    if (!state.currentUser) return;
    let done = false;
    try { done = localStorage.getItem(TOUR_KEY) === '1'; } catch { /* ignore */ }
    if (done) return;
    const t = setTimeout(() => { setStep(0); setActive(true); }, 700);
    return () => clearTimeout(t);
  }, [state.currentUser]);

  const finish = useCallback(() => {
    setActive(false);
    try { localStorage.setItem(TOUR_KEY, '1'); } catch { /* ignore */ }
  }, []);

  const measure = useCallback(() => {
    const cur = STEPS[step];
    if (!cur || !cur.selector) { setRect(null); return; }
    const el = document.querySelector(cur.selector);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  useLayoutEffect(() => {
    if (!active) return undefined;
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [active, step, measure]);

  if (!active) return null;

  const cur = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const next = () => (isLast ? finish() : setStep(s => s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  // ── Spotlight cutout ──
  const spotlight = rect ? {
    position: 'fixed',
    top: rect.top - PADDING,
    left: rect.left - PADDING,
    width: rect.width + PADDING * 2,
    height: rect.height + PADDING * 2,
    borderRadius: 8,
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)',
    border: '2px solid rgba(120,180,255,0.7)',
    pointerEvents: 'none',
    zIndex: 4000,
    transition: 'all 0.25s ease',
  } : null;

  // ── Tooltip card placement ──
  let cardStyle = { position: 'fixed', zIndex: 4001, width: 320, maxWidth: 'calc(100vw - 32px)' };
  if (!rect) {
    cardStyle = { ...cardStyle, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  } else {
    const place = cur.placement || 'bottom';
    const gap = 16;
    if (place === 'bottom') {
      cardStyle.top = Math.min(rect.top + rect.height + gap, window.innerHeight - 200);
      cardStyle.left = Math.min(Math.max(rect.left, 16), window.innerWidth - 336);
    } else if (place === 'right') {
      cardStyle.top = Math.min(Math.max(rect.top, 16), window.innerHeight - 200);
      cardStyle.left = Math.min(rect.left + rect.width + gap, window.innerWidth - 336);
    } else { // top
      cardStyle.top = Math.max(rect.top - 180, 16);
      cardStyle.left = Math.min(Math.max(rect.left, 16), window.innerWidth - 336);
    }
  }

  return (
    <>
      {/* Full dim when there's no spotlight target */}
      {!rect && (
        <div className="fixed inset-0 z-[4000]" style={{ background: 'rgba(0,0,0,0.72)' }} onClick={() => {}} />
      )}
      {rect && <div style={spotlight} />}

      {/* Tooltip card */}
      <div
        style={cardStyle}
        className="bg-[#0d1b2e] border border-sky-700/50 rounded-xl shadow-2xl p-4 animate-modal-pop"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold font-mono uppercase tracking-[1px] text-sky-400">
            Step {step + 1} of {STEPS.length}
          </span>
          <button onClick={finish}
            className="ml-auto text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer bg-transparent border-none">
            Skip tour
          </button>
        </div>
        <div className="text-[15px] font-bold text-white mb-1.5">{cur.title}</div>
        <div className="text-[12.5px] leading-[1.6] text-slate-300 mb-4">{cur.body}</div>

        {/* Progress dots */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === step ? 'bg-sky-400' : 'bg-slate-600'}`} />
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            {!isFirst && (
              <button onClick={back}
                className="px-3 py-1.5 rounded-md text-[12px] font-semibold text-slate-300 bg-white/[0.06] hover:bg-white/[0.12] border-none cursor-pointer transition-colors">
                Back
              </button>
            )}
            <button onClick={next}
              className="px-3.5 py-1.5 rounded-md text-[12px] font-bold text-white bg-sky-600 hover:bg-sky-500 border-none cursor-pointer transition-colors">
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
