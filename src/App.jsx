import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { CADProvider, useCAD } from './store/cadStore';
import { PORTALS, DEFAULT_PORTAL } from './constants/portals';
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
import OfficerProfile from './pages/OfficerProfile';
// Citizen portals
import CivilianHome from './pages/portal/CivilianHome';
import MyCharacters from './pages/portal/MyCharacters';
import MyVehicles from './pages/portal/MyVehicles';
import MyLicenses from './pages/portal/MyLicenses';
import FileReport from './pages/portal/FileReport';
import CitizenLaws from './pages/portal/CitizenLaws';
import BusinessHome from './pages/portal/BusinessHome';
import MyBusiness from './pages/portal/MyBusiness';
import Employees from './pages/portal/Employees';
import BusinessIncidents from './pages/portal/BusinessIncidents';

function landingFor(user) {
  return (PORTALS[user?.portal] || PORTALS[DEFAULT_PORTAL]).landing;
}

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
  if (state.currentUser) return <Navigate to={landingFor(state.currentUser)} replace />;
  return <LoginPage />;
}

/* Catch-all: send users to their own portal's landing page. */
function PortalFallback() {
  const { state } = useCAD();
  return <Navigate to={landingFor(state.currentUser)} replace />;
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
        <Route path="/profile"       element={<OfficerProfile />} />

        {/* ── Civilian portal ── */}
        <Route path="/portal/civilian"    element={<CivilianHome />} />
        <Route path="/portal/characters"  element={<MyCharacters />} />
        <Route path="/portal/vehicles"    element={<MyVehicles />} />
        <Route path="/portal/licenses"    element={<MyLicenses />} />
        <Route path="/portal/file-report" element={<FileReport />} />
        <Route path="/portal/laws"        element={<CitizenLaws />} />

        {/* ── Business portal ── */}
        <Route path="/portal/business"    element={<BusinessHome />} />
        <Route path="/portal/my-business" element={<MyBusiness />} />
        <Route path="/portal/employees"   element={<Employees />} />
        <Route path="/portal/incidents"   element={<BusinessIncidents />} />

        <Route path="*" element={<PortalFallback />} />
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
