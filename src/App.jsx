import { CADProvider, useCAD } from './store/cadStore';
import NavBar from './components/NavBar';
import { useResponsive } from './hooks/useResponsive';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import DispatchBoard from './pages/DispatchBoard';
import MDT from './pages/MDT';
import SearchPage from './pages/SearchPage';
import CreateCall from './pages/CreateCall';
import FormsCenter from './pages/FormsCenter';
import RMS from './pages/RMS';
import Returns from './pages/Returns';
import LiveMap from './pages/LiveMap';
import CivilianPortal from './pages/CivilianPortal';
import DepartmentManagement from './pages/DepartmentManagement';
import AdminPanel from './pages/AdminPanel';
import BanManagement from './pages/BanManagement';
import PenalCode from './pages/PenalCode';
import RecordTemplates from './pages/RecordTemplates';
import OfficerProfile from './pages/OfficerProfile';

function CADApp() {
  const { state } = useCAD();
  const { currentUser, currentPage } = state;
  const { isMobile } = useResponsive();

  if (!currentUser) return <LoginPage />;

  const pages = {
    dispatch: <DispatchBoard />,
    mdt: <MDT />,
    search: <SearchPage />,
    createcall: <CreateCall />,
    forms: <FormsCenter />,
    rms: <RMS />,
    returns: <Returns />,
    livemap: <LiveMap />,
    civilian: <CivilianPortal />,
    departments: <DepartmentManagement />,
    admin: <AdminPanel />,
    bans: <BanManagement />,
    penalcode: <PenalCode />,
    recordtemplates: <RecordTemplates />,
    profile: <OfficerProfile />,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#030810', color: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ paddingTop: isMobile ? '50px' : '102px', flex: 1, background: '#030810' }}>
        {pages[currentPage] || <DispatchBoard />}
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <CADProvider>
      <CADApp />
    </CADProvider>
  );
}
