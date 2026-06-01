import MenuBar from './MenuBar';
import ActionBar from './ActionBar';
import BottomBar from './BottomBar';
import RadioToast from '../RadioToast';
import { useCAD } from '../../store/cadStore';
import { useState } from 'react';

export default function AppShell({ children, onCreateCall }) {
  const { state } = useCAD();

  return (
    <div className="cad-shell">
      <MenuBar />
      <ActionBar onCreateCall={onCreateCall} />
      <div className="cad-workspace">
        {children}
      </div>
      <BottomBar />
      <RadioToast />
    </div>
  );
}
