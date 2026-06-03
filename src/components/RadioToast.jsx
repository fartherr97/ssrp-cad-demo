import { useEffect, useRef } from 'react';
import { useCAD } from '../store/cadStore';
import { useToast } from '../contexts/ToastContext';

/* Bridges store radio broadcasts (lastRadio) into the top toast notifications.
   Renders nothing itself — replaced the old bottom-right toast card. */
export default function RadioToast() {
  const { state } = useCAD();
  const toast = useToast();
  const { lastRadio, currentUser } = state;

  // Baseline to whatever radio already exists on mount so a stale broadcast
  // can't re-fire when switching portals/users — only genuinely new ones do.
  const seenId = useRef(lastRadio?.id ?? null);

  useEffect(() => {
    if (!lastRadio || !currentUser) return;
    if (lastRadio.id === seenId.current) return;
    seenId.current = lastRadio.id;

    const panic = !!lastRadio.panic;
    // Normal radio traffic still hides for the dispatcher who sent it; panic
    // alerts go to everyone. (Panic also fires its own toast at the trigger
    // site with unit+location, so skip here to avoid a duplicate.)
    const isSender = currentUser.portal === 'dispatch';
    if (panic || isSender) return;

    toast.info(lastRadio.text, { title: 'Dispatch Radio', duration: 6000 });
  }, [lastRadio, currentUser, toast]);

  return null;
}
