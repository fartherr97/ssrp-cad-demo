import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { CADProvider, useCAD } from './store/cadStore';
import { PORTALS, DEFAULT_PORTAL } from './constants/portals';
import AppShell from './components/layout/AppShell';
import DutyGuard from './components/DutyGuard';
import LoginPage from './pages/LoginPage';
import DispatchCenter from './pages/DispatchCenter';
import IncidentDetail from './pages/IncidentDetail';
import DispatchBoard from './pages/DispatchBoard';
import DispatchPortal from './pages/DispatchPortal';
import FireOpsBoard from './pages/FireOpsBoard';
import RecordsBureau from './pages/RecordsBureau';
import ReportsCenter from './pages/ReportsCenter';
import RecordsCenter from './pages/RecordsCenter';
import UnitManagement from './pages/UnitManagement';
import WarrantControl from './pages/WarrantControl';
import CivilianRegistry from './pages/CivilianRegistry';
import PenalCodeEditor from './pages/PenalCodeEditor';
import BanManagement from './pages/BanManagement';
import LiveMap from './pages/LiveMap';
import Messages from './pages/Messages';
import OfficerProfile from './pages/OfficerProfile';
// Citizen portals
import Supervisor from './pages/portal/Supervisor';
import CommandPortal from './pages/portal/CommandPortal';
import CivilianHome from './pages/portal/CivilianHome';
import MyCharacters from './pages/portal/MyCharacters';
import MyVehicles from './pages/portal/MyVehicles';
import MyLicenses from './pages/portal/MyLicenses';
import FileReport from './pages/portal/FileReport';
import FileComplaint from './pages/portal/FileComplaint';
import CitizenLaws from './pages/portal/CitizenLaws';
import MedicalRecords from './pages/portal/MedicalRecords';
import BusinessHome from './pages/portal/BusinessHome';
import MyBusiness from './pages/portal/MyBusiness';
import Employees from './pages/portal/Employees';
import BusinessFleet from './pages/portal/BusinessFleet';
import TowCAD from './pages/TowCAD';
import { BusinessProvider } from './contexts/BusinessContext';
import { ToastProvider } from './contexts/ToastContext';
// Admin (Sonoran-style customization suite)
import AdminShell from './pages/admin/AdminShell';
import CustomizationHub from './pages/admin/sections/CustomizationHub';
import Accounts from './pages/admin/sections/Accounts';
import Identifiers from './pages/admin/sections/Identifiers';
import PermissionKeys from './pages/admin/sections/PermissionKeys';
import CustomRecords from './pages/admin/sections/CustomRecords';
import Departments from './pages/admin/sections/Departments';
import TenCodes from './pages/admin/sections/TenCodes';
import Statutes from './pages/admin/sections/Statutes';
import LicensePoints from './pages/admin/sections/LicensePoints';
import Flags from './pages/admin/sections/Flags';
import Logs from './pages/admin/sections/Logs';
import MessageLogs from './pages/admin/sections/MessageLogs';
import InGame from './pages/admin/sections/InGame';
import DiscordIntegration from './pages/admin/sections/DiscordIntegration';
import Limits from './pages/admin/sections/Limits';
import WipeRecords from './pages/admin/sections/WipeRecords';
import CommunityId from './pages/admin/sections/CommunityId';
import Authenticate from './pages/admin/sections/Authenticate';
import Transfer from './pages/admin/sections/Transfer';
import CommunityInfo from './pages/admin/sections/CommunityInfo';
import Geographical from './pages/admin/sections/Geographical';
import StatusCodes from './pages/admin/sections/StatusCodes';
import LoginPageEditor from './pages/admin/sections/LoginPageEditor';
import QuickLinks from './pages/admin/sections/QuickLinks';
import NotificationTones from './pages/admin/sections/NotificationTones';
import Restrictions from './pages/admin/sections/Restrictions';
import DiscordPresence from './pages/admin/sections/DiscordPresence';
import Servers from './pages/admin/sections/Servers';
import Addresses from './pages/admin/sections/Addresses';
import LookupTypes from './pages/admin/sections/LookupTypes';
import ToneBoard from './pages/admin/sections/ToneBoard';
import AdminBusinesses from './pages/admin/sections/AdminBusinesses';
import CallTypes from './pages/admin/sections/CallTypes';

function landingFor(user) {
  return (PORTALS[user?.portal] || PORTALS[DEFAULT_PORTAL]).landing;
}

/* Mounts invisible then transitions in via rAF so mobile browsers
   always see the start state before animating (CSS-only animations
   are skipped on mobile when insertion + paint happen in one frame). */
function PageWrapper({ children }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      className="flex flex-col flex-1 min-h-0 overflow-hidden"
      style={{
        transition: 'opacity 280ms cubic-bezier(0.22,1,0.36,1), transform 280ms cubic-bezier(0.22,1,0.36,1)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.99)',
      }}
    >
      {children}
    </div>
  );
}

function AuthShell() {
  const { state } = useCAD();
  const location = useLocation();
  if (!state.currentUser) return <Navigate to="/" replace />;
  return (
    <AppShell>
      <DutyGuard />
      <PageWrapper key={location.key}>
        <Outlet />
      </PageWrapper>
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
        <Route path="/dispatch"      element={<DispatchPortal />} />
        <Route path="/cad"           element={<DispatchCenter />} />
        <Route path="/cad/:callId"   element={<IncidentDetail />} />
        <Route path="/search"        element={<RecordsBureau />} />
        <Route path="/returns"       element={<RecordsBureau />} />
        <Route path="/forms"         element={<ReportsCenter />} />
        <Route path="/records"       element={<RecordsCenter />} />
        <Route path="/board"         element={<DispatchBoard />} />
        <Route path="/fire"          element={<FireOpsBoard />} />
        <Route path="/map"           element={<LiveMap />} />
        <Route path="/units"         element={<UnitManagement />} />
        <Route path="/warrants"      element={<WarrantControl />} />
        <Route path="/civilians"     element={<CivilianRegistry />} />
        <Route path="/messages"      element={<Messages />} />
        <Route path="/admin" element={<AdminShell />}>
          <Route index                     element={<CustomizationHub />} />
          <Route path="accounts"           element={<Accounts />} />
          <Route path="identifiers"        element={<Identifiers />} />
          <Route path="permission-keys"    element={<PermissionKeys />} />
          <Route path="custom-records"     element={<CustomRecords />} />
          <Route path="departments"        element={<Departments />} />
          <Route path="call-types"          element={<CallTypes />} />
          <Route path="ten-codes"          element={<TenCodes />} />
          <Route path="statutes"           element={<Statutes />} />
          <Route path="license-points"     element={<LicensePoints />} />
          <Route path="flags"              element={<Flags />} />
          <Route path="logs"               element={<Logs />} />
          <Route path="message-logs"       element={<MessageLogs />} />
          <Route path="in-game"            element={<InGame />} />
          <Route path="discord"            element={<DiscordIntegration />} />
          <Route path="limits"             element={<Limits />} />
          <Route path="wipe"               element={<WipeRecords />} />
          <Route path="community-id"       element={<CommunityId />} />
          <Route path="authenticate"       element={<Authenticate />} />
          <Route path="transfer"           element={<Transfer />} />
          <Route path="businesses"         element={<AdminBusinesses />} />
          <Route path="community-info"     element={<CommunityInfo />} />
          <Route path="geographical"       element={<Geographical />} />
          <Route path="status-codes"       element={<StatusCodes />} />
          <Route path="login-page"         element={<LoginPageEditor />} />
          <Route path="quick-links"        element={<QuickLinks />} />
          <Route path="notification-tones" element={<NotificationTones />} />
          <Route path="restrictions"       element={<Restrictions />} />
          <Route path="discord-presence"   element={<DiscordPresence />} />
          <Route path="servers"            element={<Servers />} />
          <Route path="addresses"          element={<Addresses />} />
          <Route path="lookup-types"       element={<LookupTypes />} />
          <Route path="tone-board"         element={<ToneBoard />} />
        </Route>
        <Route path="/penal"         element={<PenalCodeEditor />} />
        <Route path="/bans"          element={<BanManagement />} />
        <Route path="/profile"       element={<OfficerProfile />} />

        {/* ── Civilian portal ── */}
        <Route path="/portal/civilian"    element={<CivilianHome />} />
        <Route path="/portal/characters"  element={<MyCharacters />} />
        <Route path="/portal/vehicles"    element={<MyVehicles />} />
        <Route path="/portal/licenses"    element={<MyLicenses />} />
        <Route path="/portal/file-report" element={<FileReport />} />
        <Route path="/portal/complaint"   element={<FileComplaint />} />
        <Route path="/portal/laws"        element={<CitizenLaws />} />
        <Route path="/portal/medical"     element={<MedicalRecords />} />

        {/* ── Supervisor portal ── */}
        <Route path="/portal/supervisor"  element={<Supervisor />} />

        {/* ── Command portal ── */}
        <Route path="/portal/command"     element={<CommandPortal />} />

        {/* ── Business portal ── */}
        <Route path="/portal/business"        element={<BusinessHome />} />
        <Route path="/portal/my-business"     element={<MyBusiness />} />
        <Route path="/portal/employees"       element={<Employees />} />
        <Route path="/portal/business-fleet"  element={<BusinessFleet />} />

        {/* ── Tow CAD ── */}
        <Route path="/tow-cad"            element={<TowCAD />} />

        <Route path="*" element={<PortalFallback />} />
      </Route>
    </Routes>
  );
}

const VARIANT_COLORS = { success: '#2fd96b', error: '#ff5d5d', info: '#3d9bf0', warning: '#f5a93b' };
const VARIANT_LABELS = { success: 'Success', error: 'Error', info: 'Notice', warning: 'Warning' };

function AppWithToasts() {
  const { dispatch } = useCAD();
  const handlePush = useCallback((t) => {
    if (t.variant === 'loading') return;
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        title: t.title || VARIANT_LABELS[t.variant] || 'Notice',
        body: t.message || '',
        color: t.color || VARIANT_COLORS[t.variant] || '#3d9bf0',
      },
    });
  }, [dispatch]);

  return (
    <ToastProvider onPush={handlePush}>
      <BrowserRouter>
        <BusinessProvider>
          <CADApp />
        </BusinessProvider>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <CADProvider>
      <AppWithToasts />
    </CADProvider>
  );
}
