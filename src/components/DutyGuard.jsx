import { useEffect, useRef } from 'react';
import { useCAD } from '../store/cadStore';
import { useToast } from '../contexts/ToastContext';

/*
  Keeps subdivision duty-hour tracking honest:

  - On mount / when the active officer changes, reconciles their duty clock
    (DUTY_SYNC) so a tracked on-duty officer starts accruing immediately.
  - Auto-sets the officer OFFDUTY after IDLE_LIMIT of no interaction, so nobody
    racks up hours by leaving the CAD open while not actually playing.
  - Best-effort OFFDUTY on tab close.

  Mounted once inside the authenticated shell. Renders nothing.
*/
const IDLE_LIMIT_MS = 15 * 60 * 1000;   // 15 min with no input → off duty

export default function DutyGuard() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const userId = state.currentUser?.id;
  const me = state.officers.find(o => o.id === userId);
  const onDuty = !!me && me.status !== 'OFFDUTY';
  const idleTimer = useRef(null);

  // Start/reconcile the duty clock whenever the active officer changes.
  useEffect(() => {
    if (userId) dispatch({ type: 'DUTY_SYNC' });
  }, [userId, dispatch]);

  // Idle auto-off-duty * only armed while the officer is actually on duty.
  useEffect(() => {
    if (!onDuty) return undefined;

    const arm = () => {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        dispatch({ type: 'SET_STATUS', payload: 'OFFDUTY' });
        toast.warning('Set off duty after 15 min of inactivity * duty hours paused.', {
          title: 'Auto Off-Duty',
          color: '#f59e0b',
        });
      }, IDLE_LIMIT_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, arm, { passive: true }));
    arm();

    return () => {
      clearTimeout(idleTimer.current);
      events.forEach(e => window.removeEventListener(e, arm));
    };
  }, [onDuty, dispatch, toast]);

  // Best-effort clock-out on tab close so an abandoned session stops accruing.
  useEffect(() => {
    if (!onDuty) return undefined;
    const onUnload = () => dispatch({ type: 'SET_STATUS', payload: 'OFFDUTY' });
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [onDuty, dispatch]);

  return null;
}
