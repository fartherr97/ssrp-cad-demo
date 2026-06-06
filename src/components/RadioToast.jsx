import { useEffect, useRef } from 'react';
import { useCAD } from '../store/cadStore';
import { useToast } from '../contexts/ToastContext';

/* Bridges store radio broadcasts (lastRadio) into the top toast notifications.
   Renders nothing itself * replaced the old bottom-right toast card. */
function playAudio(url) {
  if (!url) return;
  try { new Audio(url).play().catch(() => { /* autoplay blocked until user gesture */ }); } catch (_) { /* ignore */ }
}

export default function RadioToast() {
  const { state } = useCAD();
  const toast = useToast();
  const { lastRadio, currentUser, audioTones } = state;

  // Baseline to whatever radio already exists on mount so a stale broadcast
  // can't re-fire when switching portals/users * only genuinely new ones do.
  const seenId = useRef(lastRadio?.id ?? null);

  useEffect(() => {
    if (!lastRadio || !currentUser) return;
    if (lastRadio.id === seenId.current) return;
    seenId.current = lastRadio.id;

    const panic = !!lastRadio.panic;
    // Skip echoing a broadcast back to whoever sent it * they already got a
    // local confirmation toast. Panic alerts also fire their own unit+location
    // toast at the trigger site, so skip those here too.
    const isSender = lastRadio.from != null && lastRadio.from === currentUser.id;
    if (panic || isSender) return;

    // Targeted broadcasts (e.g. HCFR/FDOT acknowledging a scene) carry a `to`
    // list of recipient officer ids * only on-scene units get the toast.
    // A null/empty `to` means a general broadcast to everyone.
    const targeted = Array.isArray(lastRadio.to) && lastRadio.to.length > 0;
    if (targeted && !lastRadio.to.includes(currentUser.id)) return;

    toast.info(lastRadio.text, { title: 'Dispatch Radio', duration: 6000 });
    playAudio(audioTones?.toastUrl);
  }, [lastRadio, currentUser, toast, audioTones]);

  return null;
}
