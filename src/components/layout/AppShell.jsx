import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import RadioToast from '../RadioToast';

export default function AppShell({ children }) {
  return (
    <div className="n-shell">
      <Sidebar />
      <div className="n-main">
        <TopBar />
        <div className="n-content">
          {children}
        </div>
        <BottomBar />
      </div>
      <RadioToast />
    </div>
  );
}
