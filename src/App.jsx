import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { CADProvider, useCAD } from './store/cadStore';
import { PORTALS, DEFAULT_PORTAL } from './constants/portals';
import AppShell from './components/layout/AppShell';
import DutyGuard from './components/DutyGuard';
import HydrationGate, { LoadingScreen } from './components/HydrationGate';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import { BusinessProvider } from './contexts/BusinessContext';
import { CivilianProvider } from './contexts/CivilianContext';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmProvider } from './contexts/ConfirmContext';

/* Route components are code-split so the initial bundle stays small — each
   page loads on demand behind the <Suspense> boundary below. */
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AccessDeniedPage = lazy(() => import('./pages/AccessDeniedPage'));
const DispatchCenter = lazy(() => import('./pages/DispatchCenter'));
const IncidentDetail = lazy(() => import('./pages/IncidentDetail'));
const DispatchBoard = lazy(() => import('./pages/DispatchBoard'));
const DispatchPortal = lazy(() => import('./pages/DispatchPortal'));
const FireOpsBoard = lazy(() => import('./pages/FireOpsBoard'));
const RecordsBureau = lazy(() => import('./pages/RecordsBureau'));
const ReportsCenter = lazy(() => import('./pages/ReportsCenter'));
const RecordsCenter = lazy(() => import('./pages/RecordsCenter'));
const UnitManagement = lazy(() => import('./pages/UnitManagement'));
const WarrantControl = lazy(() => import('./pages/WarrantControl'));
const CivilianRegistry = lazy(() => import('./pages/CivilianRegistry'));
const PenalCodeEditor = lazy(() => import('./pages/PenalCodeEditor'));
const BanManagement = lazy(() => import('./pages/BanManagement'));
const LiveMap = lazy(() => import('./pages/LiveMap'));
const Messages = lazy(() => import('./pages/Messages'));
const OfficerProfile = lazy(() => import('./pages/OfficerProfile'));
// Citizen portals
const Supervisor = lazy(() => import('./pages/portal/Supervisor'));
const CommandPortal = lazy(() => import('./pages/portal/CommandPortal'));
const CivilianHome = lazy(() => import('./pages/portal/CivilianHome'));
const MyCharacters = lazy(() => import('./pages/portal/MyCharacters'));
const MyVehicles = lazy(() => import('./pages/portal/MyVehicles'));
const MyLicenses = lazy(() => import('./pages/portal/MyLicenses'));
const FileReport = lazy(() => import('./pages/portal/FileReport'));
const MyReports = lazy(() => import('./pages/portal/MyReports'));
const FileComplaint = lazy(() => import('./pages/portal/FileComplaint'));
const LEORecords = lazy(() => import('./pages/portal/LEORecords'));
const RequestTow = lazy(() => import('./pages/portal/RequestTow'));
const CitizenLaws = lazy(() => import('./pages/portal/CitizenLaws'));
const MedicalRecords = lazy(() => import('./pages/portal/MedicalRecords'));
const MyAccount = lazy(() => import('./pages/portal/MyAccount'));
const BusinessHome = lazy(() => import('./pages/portal/BusinessHome'));
const MyBusiness = lazy(() => import('./pages/portal/MyBusiness'));
const EmployeeProfile = lazy(() => import('./pages/portal/EmployeeProfile'));
const Employees = lazy(() => import('./pages/portal/Employees'));
const BusinessFleet = lazy(() => import('./pages/portal/BusinessFleet'));
const FDOTPermits = lazy(() => import('./pages/portal/FDOTPermits'));
const HelpCenter = lazy(() => import('./pages/portal/HelpCenter'));
const TowCAD = lazy(() => import('./pages/TowCAD'));
// Admin (Sonoran-style customization suite)
const AdminShell = lazy(() => import('./pages/admin/AdminShell'));
const CustomizationHub = lazy(() => import('./pages/admin/sections/CustomizationHub'));
const Accounts = lazy(() => import('./pages/admin/sections/Accounts'));
const Identifiers = lazy(() => import('./pages/admin/sections/Identifiers'));
const PermissionKeys = lazy(() => import('./pages/admin/sections/PermissionKeys'));
const CustomRecords = lazy(() => import('./pages/admin/sections/CustomRecords'));
const CivilianForms = lazy(() => import('./pages/admin/sections/CivilianForms'));
const Departments = lazy(() => import('./pages/admin/sections/Departments'));
const TenCodes = lazy(() => import('./pages/admin/sections/TenCodes'));
const Statutes = lazy(() => import('./pages/admin/sections/Statutes'));
const LicensePoints = lazy(() => import('./pages/admin/sections/LicensePoints'));
const Flags = lazy(() => import('./pages/admin/sections/Flags'));
const Logs = lazy(() => import('./pages/admin/sections/Logs'));
const MessageLogs = lazy(() => import('./pages/admin/sections/MessageLogs'));
const DiscordIntegration = lazy(() => import('./pages/admin/sections/DiscordIntegration'));
const Limits = lazy(() => import('./pages/admin/sections/Limits'));
const WipeRecords = lazy(() => import('./pages/admin/sections/WipeRecords'));
const Authenticate = lazy(() => import('./pages/admin/sections/Authenticate'));
const CommunityInfo = lazy(() => import('./pages/admin/sections/CommunityInfo'));
const Geographical = lazy(() => import('./pages/admin/sections/Geographical'));
const StatusCodes = lazy(() => import('./pages/admin/sections/StatusCodes'));
const QuickLinks = lazy(() => import('./pages/admin/sections/QuickLinks'));
const NotificationTones = lazy(() => import('./pages/admin/sections/NotificationTones'));
const Restrictions = lazy(() => import('./pages/admin/sections/Restrictions'));
const HelpEditor = lazy(() => import('./pages/admin/sections/HelpEditor'));
const Addresses = lazy(() => import('./pages/admin/sections/Addresses'));
const LookupTypes = lazy(() => import('./pages/admin/sections/LookupTypes'));
const ToneBoard = lazy(() => import('./pages/admin/sections/ToneBoard'));
const AdminBusinesses = lazy(() => import('./pages/admin/sections/AdminBusinesses'));
const CallTypes = lazy(() => import('./pages/admin/sections/CallTypes'));
const CitizenReportTypes = lazy(() => import('./pages/admin/sections/CitizenReportTypes'));
const RoleMapping = lazy(() => import('./pages/admin/sections/RoleMapping'));
const AdminTiers = lazy(() => import('./pages/admin/sections/AdminTiers'));
const CaseFiles = lazy(() => import('./pages/CaseFiles'));

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
      <HydrationGate>
      <DutyGuard />
      {/* Key on pathname (not location.key) so the page only remounts on a real
          page change. Keying on location.key remounted on every query-string
          update too — wiping in-page state like the records search results. */}
      <PageWrapper key={location.pathname}>
        <Outlet />
      </PageWrapper>
      </HydrationGate>
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
    <RouteErrorBoundary>
    <Suspense fallback={<LoadingScreen label="Loading…" />}>
    <Routes>
      <Route path="/" element={<LoginRoute />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />
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
          <Route path="civilian-forms"     element={<CivilianForms />} />
          <Route path="departments"        element={<Departments />} />
          <Route path="call-types"          element={<CallTypes />} />
          <Route path="citizen-report-types" element={<CitizenReportTypes />} />
          <Route path="ten-codes"          element={<TenCodes />} />
          <Route path="statutes"           element={<Statutes />} />
          <Route path="license-points"     element={<LicensePoints />} />
          <Route path="flags"              element={<Flags />} />
          <Route path="logs"               element={<Logs />} />
          <Route path="message-logs"       element={<MessageLogs />} />
          <Route path="discord"            element={<DiscordIntegration />} />
          <Route path="limits"             element={<Limits />} />
          <Route path="wipe"               element={<WipeRecords />} />
          <Route path="authenticate"       element={<Authenticate />} />
          <Route path="businesses"         element={<AdminBusinesses />} />
          <Route path="community-info"     element={<CommunityInfo />} />
          <Route path="geographical"       element={<Geographical />} />
          <Route path="status-codes"       element={<StatusCodes />} />
          <Route path="quick-links"        element={<QuickLinks />} />
          <Route path="notification-tones" element={<NotificationTones />} />
          <Route path="restrictions"       element={<Restrictions />} />
          <Route path="addresses"          element={<Addresses />} />
          <Route path="lookup-types"       element={<LookupTypes />} />
          <Route path="tone-board"         element={<ToneBoard />} />
          <Route path="help-center"        element={<HelpEditor />} />
          <Route path="role-mapping"       element={<RoleMapping />} />
          <Route path="admin-tiers"        element={<AdminTiers />} />
        </Route>
        <Route path="/cases"          element={<CaseFiles />} />
        <Route path="/penal"         element={<PenalCodeEditor />} />
        <Route path="/bans"          element={<BanManagement />} />
        <Route path="/profile"       element={<OfficerProfile />} />

        {/* ── Civilian portal ── */}
        <Route path="/portal/civilian"    element={<CivilianHome />} />
        <Route path="/portal/characters"  element={<MyCharacters />} />
        <Route path="/portal/vehicles"    element={<MyVehicles />} />
        <Route path="/portal/licenses"    element={<MyLicenses />} />
        <Route path="/portal/file-report" element={<FileReport />} />
        <Route path="/portal/my-reports"  element={<MyReports />} />
        <Route path="/portal/leo-records" element={<LEORecords />} />
        <Route path="/portal/request-tow" element={<RequestTow />} />
        <Route path="/portal/complaint"   element={<FileComplaint />} />
        <Route path="/portal/laws"        element={<CitizenLaws />} />
        <Route path="/portal/medical"     element={<MedicalRecords />} />
        <Route path="/portal/account"     element={<MyAccount />} />

        {/* ── Supervisor portal ── */}
        <Route path="/portal/supervisor"  element={<Supervisor />} />

        {/* ── Command portal ── */}
        <Route path="/portal/command"     element={<CommandPortal />} />

        {/* ── Business portal ── */}
        <Route path="/portal/business"           element={<BusinessHome />} />
        <Route path="/portal/my-business"        element={<MyBusiness />} />
        <Route path="/portal/employee-profile"   element={<EmployeeProfile />} />
        <Route path="/portal/employees"          element={<Employees />} />
        <Route path="/portal/business-fleet"  element={<BusinessFleet />} />
        <Route path="/portal/permits"          element={<FDOTPermits />} />
        <Route path="/portal/help"             element={<HelpCenter />} />

        {/* ── Tow CAD ── */}
        <Route path="/tow-cad"            element={<TowCAD />} />

        <Route path="*" element={<PortalFallback />} />
      </Route>
    </Routes>
    </Suspense>
    </RouteErrorBoundary>
  );
}

export default function App() {
  return (
    <CADProvider>
      <ToastProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <BusinessProvider>
              <CivilianProvider>
                <CADApp />
              </CivilianProvider>
            </BusinessProvider>
          </BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </CADProvider>
  );
}
