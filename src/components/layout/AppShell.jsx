import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import ActionBar from './ActionBar';
import RadioToast from '../RadioToast';
import SiteFooter from '../SiteFooter';
import { useCAD } from '../../store/cadStore';
import { useToast } from '../../contexts/ToastContext';

function playAudio(url) {
  if (!url) return;
  try { new Audio(url).play().catch(() => {}); } catch (_) {}
}

function BlastToast() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const { lastBlast, currentUser, officers, audioTones } = state;
  const seenId = useRef(lastBlast?.id ?? null);

  useEffect(() => {
    if (!lastBlast || !currentUser) return;
    if (lastBlast.id === seenId.current) return;
    seenId.current = lastBlast.id;

    const toastBody = `${lastBlast.body}\n\n* ${lastBlast.senderName} (${lastBlast.senderBadge})`;
    const notifPayload = {
      title: lastBlast.title || 'Notification',
      body: lastBlast.body,
      sender: `${lastBlast.senderName} (${lastBlast.senderBadge})`,
      color: lastBlast.color,
      time: lastBlast.time,
    };

    // Sender: skip the popup but still record in their inbox.
    if (lastBlast.senderId != null && String(lastBlast.senderId) === String(currentUser.id)) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notifPayload });
      return;
    }

    // Department-targeted blast: only fire if current user is in the target dept.
    if (lastBlast.targetDeptId) {
      const me = officers.find(o => o.id === currentUser.id);
      if (!me || String(me.dept) !== String(lastBlast.targetDeptId)) return;
    }

    toast.info(toastBody, { title: lastBlast.title || 'Notification', color: lastBlast.color, duration: 9000 });
    dispatch({ type: 'ADD_NOTIFICATION', payload: notifPayload });
    playAudio(audioTones?.toastUrl);
  }, [lastBlast, currentUser, officers, toast, dispatch, audioTones]);

  return null;
}

function MessageToast() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const { directMessages, currentUser } = state;
  const seenIds = useRef(new Set(directMessages.map(m => m.id)));

  useEffect(() => {
    if (!currentUser) return;
    const unseen = directMessages.filter(
      m => String(m.toId) === String(currentUser.id) && !seenIds.current.has(m.id)
    );
    unseen.forEach(m => {
      seenIds.current.add(m.id);
      toast.info(`${m.subject}`, { title: `Message from ${m.fromName}`, color: '#a78bfa', duration: 6000 });
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        title: `Message from ${m.fromName}`,
        body: m.subject,
        color: '#a78bfa',
      }});
    });
  }, [directMessages, currentUser, toast, dispatch]);

  return null;
}

function PanicTone() {
  const { state } = useCAD();
  const { lastRadio, audioTones } = state;
  const seenId = useRef(lastRadio?.id ?? null);

  useEffect(() => {
    if (!lastRadio?.panic) return;
    if (lastRadio.id === seenId.current) return;
    seenId.current = lastRadio.id;
    playAudio(audioTones?.panicUrl);
  }, [lastRadio, audioTones]);

  return null;
}

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onCreateCall = () => navigate('/cad?new=1');

  // The Admin suite is a self-contained sub-app: it renders its own top nav
  // (AdminShell) and fills the whole shell, so the global chrome is hidden.
  const inAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  // Hide the footer on fullscreen immersive pages where every pixel counts on mobile.
  const hideFooter = inAdmin || pathname === '/messages' || pathname.startsWith('/messages/');

  return (
    <div className="cad-shell">
      {!inAdmin && <ActionBar onCreateCall={onCreateCall} />}
      <div className="cad-workspace">
        {children}
      </div>
      {!hideFooter && <SiteFooter />}
      <RadioToast />
      <BlastToast />
      <MessageToast />
      <PanicTone />
    </div>
  );
}
