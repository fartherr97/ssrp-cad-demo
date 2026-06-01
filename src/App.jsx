import { CADProvider, useCAD } from './store/cadStore';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import CommandDashboard from './pages/CommandDashboard';
import DispatchCenter from './pages/DispatchCenter';
import DispatchBoard from './pages/DispatchBoard';
import FireOpsBoard from './pages/FireOpsBoard';
import RecordsBureau from './pages/RecordsBureau';
import ReportsCenter from './pages/ReportsCenter';
import UnitManagement from './pages/UnitManagement';
import WarrantControl from './pages/WarrantControl';
import CivilianRegistry from './pages/CivilianRegistry';
import PenalCodeEditor from './pages/PenalCodeEditor';
import AdminCenter from './pages/AdminCenter';
import BanManagement from './pages/BanManagement';
import LiveMap from './pages/LiveMap';
import MDT from './pages/MDT';

function CADApp() {
  const { state } = useCAD();
  const { currentUser, currentPage } = state;

  if (!currentUser) return <LoginPage />;

  const pages = {
    dashboard: <CommandDashboard />,
    dispatch:  <DispatchCenter />,
    board:     <DispatchBoard />,
    fire:      <FireOpsBoard />,
    records:   <RecordsBureau />,
    reports:   <ReportsCenter />,
    units:     <UnitManagement />,
    warrants:  <WarrantControl />,
    civilian:  <CivilianRegistry />,
    penal:     <PenalCodeEditor />,
    admin:     <AdminCenter />,
    bans:      <BanManagement />,
    map:       <LiveMap />,
    mdt:       <MDT />,
  };

  return (
    <AppShell>
      {pages[currentPage] || <CommandDashboard />}
    </AppShell>
  );
}

export default function App() {
  return (
    <CADProvider>
      <CADApp />
    </CADProvider>
  );
}
