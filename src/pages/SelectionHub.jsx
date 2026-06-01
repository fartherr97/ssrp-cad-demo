import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import {
  FaUser, FaIdCard, FaGavel, FaShieldHalved, FaFireFlameCurved,
  FaKitMedical, FaTowerBroadcast, FaUsersGear, FaRightFromBracket,
  FaBullhorn, FaDatabase, FaMap,
} from 'react-icons/fa6';

const MODULES = [
  {
    key: 'dispatch', label: 'DISPATCH',
    desc: 'Active calls, unit assignments & CAD board',
    Icon: FaBullhorn, page: 'dispatch', color: '#2563eb',
    dept: 'Law Enforcement',
  },
  {
    key: 'console', label: 'CONSOLE',
    desc: 'Dispatcher console — radio, units, call control',
    Icon: FaTowerBroadcast, page: 'console', color: '#7c3aed',
    dept: 'Dispatch',
  },
  {
    key: 'rms', label: 'RECORDS',
    desc: 'Warrants, criminal history, tow logs, RMS',
    Icon: FaDatabase, page: 'rms', color: '#0891b2',
    dept: 'All Agencies',
  },
  {
    key: 'police', label: 'MDT',
    desc: 'Mobile data terminal — messages, returns, alerts',
    Icon: FaShieldHalved, page: 'mdt', color: '#1d4ed8',
    dept: 'TPD / HCSO / FHP',
  },
  {
    key: 'fire', label: 'FIRE / EMS',
    desc: 'HCFR incident board & resource management',
    Icon: FaFireFlameCurved, page: 'fire', color: '#dc2626',
    dept: 'HCFR',
  },
  {
    key: 'civilian', label: 'CIVILIAN',
    desc: 'Civilian character files & record creation',
    Icon: FaUser, page: 'civilian', color: '#059669',
    dept: 'Civilian',
  },
  {
    key: 'livemap', label: 'LIVE MAP',
    desc: 'Real-time dispatch map & unit locations',
    Icon: FaMap, page: 'livemap', color: '#d97706',
    dept: 'All Units',
  },
  {
    key: 'admin', label: 'ADMIN',
    desc: 'Staff tools, audit log & system management',
    Icon: FaUsersGear, page: 'admin', color: '#ea580c',
    adminOnly: true, dept: 'Staff Only',
  },
];

export default function SelectionHub() {
  const { state, dispatch } = useCAD();
  const { currentUser } = state;

  const tiles = MODULES.filter(m => !m.adminOnly || currentUser?.role === 'admin');
  const go = page => dispatch({ type: 'SET_PAGE', payload: page });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #06080f 0%, #080b14 60%, #06070c 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Ubuntu', system-ui, sans-serif",
    }}>

      {/* Top bar */}
      <div style={{
        background: '#08090e',
        borderBottom: '1px solid #1a1e2c',
        padding: '0 24px',
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" style={{ height: '22px' }} />
          <span style={{ color: '#cbd5e1', fontWeight: 700, fontSize: '13px' }}>
            SSRP <span style={{ color: '#f97316' }}>CAD</span>
          </span>
          <span style={{ color: '#1e3a5f', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginLeft: '6px' }}>
            Module Selection
          </span>
        </div>
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
              <div style={{ color: '#d1d5db', fontSize: '12px', fontWeight: 600 }}>
                {currentUser.rank} {currentUser.name}
              </div>
              <div style={{ color: '#4b5563', fontSize: '10px' }}>
                Badge: {currentUser.badge} · {currentUser.deptShort}
              </div>
            </div>
            <button
              onClick={() => dispatch({ type: 'LOGOUT' })}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: '#4b5563', border: '1px solid #1a1e2c', borderRadius: '3px', padding: '5px 10px', fontSize: '11px', cursor: 'pointer' }}
            >
              <FaRightFromBracket size={11} />
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <div style={{ color: '#374151', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px', fontFamily: "'Ubuntu', sans-serif" }}>
            Hillsborough County, FL — Integrated CAD/RMS
          </div>
          <div style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
            Select a Module
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '10px',
          width: '100%',
          maxWidth: '860px',
        }}>
          {tiles.map(m => (
            <ModuleTile key={m.key} module={m} onClick={() => go(m.page)} />
          ))}
        </div>

        <div style={{ marginTop: '28px', display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Tampa Police Department', 'Hillsborough County Sheriff\'s Office', 'Florida Highway Patrol', 'Hillsborough County Fire Rescue'].map(d => (
            <span key={d} style={{ color: '#1e3a5f', fontSize: '11px', fontFamily: "'Ubuntu', sans-serif" }}>{d}</span>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        background: '#06070c',
        borderTop: '1px solid #141720',
        padding: '0 24px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color: '#1f2937', fontSize: '10px', fontFamily: "'Ubuntu', sans-serif" }}>
          Sunshine State Roleplay • Computer Aided Dispatch
        </span>
      </div>
    </div>
  );
}

function ModuleTile({ module, onClick }) {
  const [hov, setHov] = useState(false);
  const { label, desc, Icon, color, dept } = module;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        textAlign: 'left',
        background: hov ? '#0d1117' : '#090b10',
        border: `1px solid ${hov ? color + '55' : '#1a1e2c'}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: '3px',
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'background 0.1s, border-color 0.1s',
        boxShadow: hov ? `0 0 0 1px ${color}22` : 'none',
      }}
    >
      <span style={{
        width: '40px', height: '40px', flexShrink: 0,
        borderRadius: '4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${color}18`,
        border: `1px solid ${color}33`,
        color,
      }}>
        <Icon size={18} />
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', color: hov ? '#f1f5f9' : '#d1d5db', fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}>
          {label}
        </span>
        <span style={{ display: 'block', color: '#374151', fontSize: '11px', marginTop: '2px' }}>
          {desc}
        </span>
        <span style={{ display: 'block', color: color + '99', fontSize: '10px', marginTop: '3px', fontFamily: "'Ubuntu', sans-serif", letterSpacing: '0.5px' }}>
          {dept}
        </span>
      </span>
    </button>
  );
}

