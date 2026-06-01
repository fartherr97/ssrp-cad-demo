import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { CADProvider, useCAD } from './store/cadStore';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import DispatchCenter from './pages/DispatchCenter';
import IncidentDetail from './pages/IncidentDetail';
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
import FormBuilder from './pages/FormBuilder';

function AuthShell() {
  const { state } = useCAD();
  if (!state.currentUser) return <Navigate to="/" replace />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function LoginRoute() {
  const { state } = useCAD();
  if (state.currentUser) return <Navigate to="/cad" replace />;
  return <LoginPage />;
}

function CADApp() {
  return (
    <Routes>
      <Route path="/" element={<LoginRoute />} />
      <Route element={<AuthShell />}>
        <Route path="/cad"           element={<DispatchCenter />} />
        <Route path="/cad/:callId"   element={<IncidentDetail />} />
        <Route path="/search"        element={<RecordsBureau />} />
        <Route path="/returns"       element={<RecordsBureau />} />
        <Route path="/forms"         element={<ReportsCenter />} />
        <Route path="/board"         element={<DispatchBoard />} />
        <Route path="/fire"          element={<FireOpsBoard />} />
        <Route path="/map"           element={<LiveMap />} />
        <Route path="/units"         element={<UnitManagement />} />
        <Route path="/warrants"      element={<WarrantControl />} />
        <Route path="/civilians"     element={<CivilianRegistry />} />
        <Route path="/mdt"           element={<MDT />} />
        <Route path="/admin"         element={<AdminCenter />} />
        <Route path="/penal"         element={<PenalCodeEditor />} />
        <Route path="/bans"          element={<BanManagement />} />
        <Route path="/builder"       element={<FormBuilder />} />
        <Route path="*"              element={<Navigate to="/cad" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <CADProvider>
      <BrowserRouter>
        <CADApp />
      </BrowserRouter>
    </CADProvider>
  );
}
