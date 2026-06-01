import { useState } from 'react';
import { CADProvider, useCAD } from './store/cadStore';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
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
import FormBuilder from './pages/FormBuilder';

function CADApp() {
  const { state, dispatch: cadDispatch } = useCAD();
  const { currentUser, currentPage } = state;
  const [showCreateCall, setShowCreateCall] = useState(false);

  if (!currentUser) return <LoginPage />;

  const pages = {
    dispatch:  <DispatchCenter showCreateForm={showCreateCall} onCloseCreate={() => setShowCreateCall(false)} />,
    hub:       <DispatchCenter />,
    board:     <DispatchBoard />,
    fire:      <FireOpsBoard />,
    records:   <RecordsBureau />,
    returns:   <RecordsBureau />,
    reports:   <ReportsCenter />,
    units:     <UnitManagement />,
    warrants:  <WarrantControl />,
    civilian:  <CivilianRegistry />,
    penal:     <PenalCodeEditor />,
    admin:     <AdminCenter />,
    bans:      <BanManagement />,
    map:       <LiveMap />,
    mdt:          <MDT />,
    formbuilder:  <FormBuilder />,
  };

  return (
    <AppShell onCreateCall={() => {
      cadDispatch({ type: 'SET_PAGE', payload: 'dispatch' });
      setShowCreateCall(true);
    }}>
      {pages[currentPage] || <DispatchCenter />}
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
