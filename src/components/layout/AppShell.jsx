import { useNavigate, useLocation } from 'react-router-dom';
import ActionBar from './ActionBar';
import BottomBar from './BottomBar';
import RadioToast from '../RadioToast';
import SiteFooter from '../SiteFooter';

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
      {!inAdmin && <BottomBar />}
      <SiteFooter />
      <RadioToast />
    </div>
  );
}
