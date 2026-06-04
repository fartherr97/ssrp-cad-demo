import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import ActionBar from './ActionBar';
import RadioToast from '../RadioToast';
import SiteFooter from '../SiteFooter';
import GuidedTour from '../GuidedTour';
import { useCAD } from '../../store/cadStore';
import { useToast } from '../../contexts/ToastContext';

function BlastToast() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const { lastBlast, currentUser, officers } = state;
  const seenId = useRef(lastBlast?.id ?? null);

  useEffect(() => {
    if (!lastBlast || !currentUser) return;
    if (lastBlast.id === seenId.current) return;
    seenId.current = lastBlast.id;

    // Don't echo the blast back to whoever sent it.
    if (lastBlast.senderId != null && String(lastBlast.senderId) === String(currentUser.id)) return;

    // Department-targeted blast: only fire if current user is in the target dept.
    if (lastBlast.targetDeptId) {
      const me = officers.find(o => o.id === currentUser.id);
      if (!me || String(me.dept) !== String(lastBlast.targetDeptId)) return;
    }

    const body = `${lastBlast.body}\n\n— ${lastBlast.senderName} (${lastBlast.senderBadge})`;
    toast.info(body, { title: lastBlast.title || 'Notification', color: lastBlast.color, duration: 9000 });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { title: lastBlast.title || 'Notification', body, color: lastBlast.color, time: lastBlast.time } });
  }, [lastBlast, currentUser, officers, toast, dispatch]);

  return null;
}

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onCreateCall = () => navigate('/cad?new=1');

  // The Admin suite is a self-contained sub-app: it renders its own top nav
  // (AdminShell) and fills the whole shell, so the global chrome is hidden.
  const inAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  return (
    <div className="cad-shell">
      {!inAdmin && <ActionBar onCreateCall={onCreateCall} />}
      <div className="cad-workspace">
        {children}
      </div>
      <SiteFooter />
      <RadioToast />
      <BlastToast />
      {!inAdmin && <GuidedTour />}
    </div>
  );
}
