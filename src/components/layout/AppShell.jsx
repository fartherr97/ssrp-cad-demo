import { useNavigate } from 'react-router-dom';
import ActionBar from './ActionBar';
import BottomBar from './BottomBar';
import RadioToast from '../RadioToast';

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const onCreateCall = () => navigate('/cad?new=1');

  return (
    <div className="cad-shell">
      <ActionBar onCreateCall={onCreateCall} />
      <div className="cad-workspace">
        {children}
      </div>
      <BottomBar />
      <RadioToast />
    </div>
  );
}
