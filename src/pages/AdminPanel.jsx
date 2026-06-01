import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';
import { useResponsive } from '../hooks/useResponsive';

const TABS = ['Users', 'Active Sessions', 'Audit Log', 'Whitelist', 'Settings'];

export default function AdminPanel() {
  const { state, dispatch } = useCAD();
  const { officers, activeSessions, auditLog, whitelistApps, departments } = state;
  const [tab, setTab] = useState('Users');
  const [communityName, setCommunityName] = useState('Sunshine State Roleplay Community');
  const [logoUrl, setLogoUrl] = useState('');
  const [accentColor, setAccentColor] = useState('#1a3a6b');
  const { isMobile } = useResponsive();

  return (
    <div className="p-[14px] font-ui">
      {/* Page header */}
      <div className="bg-[#0b0d14] border border-[#1e2533] border-b-0 px-[14px] py-2 flex items-center gap-[10px]">
        <span className="text-amber-400 text-[12px] font-bold tracking-[2px]">ADMIN PANEL</span>
        <span className="text-[#374151] text-[11px]">Restricted &bull; Admin Access Only</span>
      </div>
      <div className="bg-[#0d1117] border border-[#1e2533] p-[14px] mb-[14px]">

        {/* Stats row */}
        <div className={`grid gap-2 mb-[14px] ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          {[
            { label: 'Total Officers', val: officers.length, color: '#3b82f6' },
            { label: 'Active Sessions', val: activeSessions.length, color: '#22c55e' },
            { label: 'Pending Whitelist', val: whitelistApps.filter(w => w.status === 'Pending').length, color: '#fbbf24' },
            { label: 'Departments', val: departments.length, color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} className="bg-[#090b10] p-[10px_14px]" style={{ border: `1px solid ${s.color}25` }}>
              <div className="text-[22px] font-bold" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[#4b5563] text-[11px] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tab-scroll flex gap-0.5 border-b border-[#1f2937] mb-[14px]">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-[14px] py-1.5 text-[12px] cursor-pointer font-ui border border-b-0 transition-colors
                ${tab === t
                  ? 'bg-[#0f172a] border-amber-400 text-amber-400'
                  : 'bg-transparent border-transparent text-[#4b5563] hover:text-[#9ca3af]'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Users' && (
          <div className="table-scroll">
            <table className="w-full border-collapse text-[13px]">
              <THead cols={['Name','Badge','Discord ID','Role','Department','Rank','Status','Actions']} gold />
              <tbody>
                {officers.map((o, i) => (
                  <tr key={o.id} className={i % 2 === 0 ? 'bg-[#0d1117]' : 'bg-[#111218]'}>
                    <td className="px-[10px] py-[7px] text-[#d1d5db] font-semibold">{o.name}</td>
                    <td className="px-[10px] py-[7px] text-blue-400">{o.badge}</td>
                    <td className="px-[10px] py-[7px] text-[#374151] text-[11px]">{o.discordId}</td>
                    <td className="px-[10px] py-[7px]">
                      <span className={o.role === 'admin' ? 'text-amber-400 font-bold' : 'text-[#9ca3af]'}>{o.role}</span>
                    </td>
                    <td className="px-[10px] py-[7px] text-[#9ca3af]">{o.deptShort}</td>
                    <td className="px-[10px] py-[7px] text-[#9ca3af]">{o.rank}</td>
                    <td className="px-[10px] py-[7px]"><StatusBadge status={o.status} /></td>
                    <td className="px-[10px] py-[7px]">
                      <div className="flex gap-1">
                        <button className="bg-[#0c1a2e] border border-blue-500 text-blue-500 px-2 py-[3px] text-[11px] cursor-pointer font-ui font-semibold hover:brightness-110">Edit</button>
                        <button className="bg-[#450a0a] border border-red-500 text-red-500 px-2 py-[3px] text-[11px] cursor-pointer font-ui font-semibold hover:brightness-110">Ban</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'Active Sessions' && (
          <div className="table-scroll">
            <table className="w-full border-collapse text-[13px]">
              <THead cols={['User','Role','Login Time','Last Active','IP']} gold />
              <tbody>
                {activeSessions.map((s, i) => (
                  <tr key={s.userId} className={i % 2 === 0 ? 'bg-[#0d1117]' : 'bg-[#111218]'}>
                    <td className="px-[10px] py-[7px] text-[#d1d5db]">{s.name}</td>
                    <td className="px-[10px] py-[7px] text-[#9ca3af]">{s.role}</td>
                    <td className="px-[10px] py-[7px] text-[#374151]">{s.loginTime}</td>
                    <td className="px-[10px] py-[7px] text-green-400">{s.lastActive}</td>
                    <td className="px-[10px] py-[7px] text-[#374151]">{s.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'Audit Log' && (
          <div className="table-scroll">
            <table className="w-full border-collapse text-[13px]">
              <THead cols={['Timestamp','User','Action','Module']} gold />
              <tbody>
                {auditLog.map((entry, i) => (
                  <tr key={entry.id} className={i % 2 === 0 ? 'bg-[#0d1117]' : 'bg-[#111218]'}>
                    <td className="px-[10px] py-[7px] text-[#374151] text-[11px] whitespace-nowrap">{entry.timestamp}</td>
                    <td className="px-[10px] py-[7px] text-[#9ca3af]">{entry.user}</td>
                    <td className="px-[10px] py-[7px] text-[#d1d5db]">{entry.action}</td>
                    <td className="px-[10px] py-[7px]">
                      <span className="bg-[#0f172a] text-blue-500 border border-[#1e2d4a] px-[7px] py-[2px] text-[10px] font-semibold">{entry.module}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'Whitelist' && (
          <div>
            <div className="text-amber-400 text-[12px] tracking-[1px] mb-[10px]">PENDING APPLICATIONS: {whitelistApps.filter(w => w.status === 'Pending').length}</div>
            <div className="table-scroll">
              <table className="w-full border-collapse text-[13px]">
                <THead cols={['Discord ID','Name','Applied','Status','Notes','Actions']} gold />
                <tbody>
                  {whitelistApps.map((app, i) => (
                    <tr key={app.id} className={i % 2 === 0 ? 'bg-[#0d1117]' : 'bg-[#111218]'}>
                      <td className="px-[10px] py-[7px] text-blue-400">{app.discordId}</td>
                      <td className="px-[10px] py-[7px] text-[#d1d5db]">{app.name}</td>
                      <td className="px-[10px] py-[7px] text-[#374151]">{app.appliedDate}</td>
                      <td className="px-[10px] py-[7px]"><StatusBadge status={app.status} /></td>
                      <td className="px-[10px] py-[7px] text-[#4b5563] text-[11px]">{app.notes || '—'}</td>
                      <td className="px-[10px] py-[7px]">
                        {app.status === 'Pending' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => dispatch({ type: 'APPROVE_WHITELIST', payload: app.id })}
                              className="bg-[#052e16] border border-green-500 text-green-500 px-2 py-[3px] text-[11px] cursor-pointer font-ui font-semibold hover:brightness-110"
                            >Approve</button>
                            <button
                              onClick={() => dispatch({ type: 'DENY_WHITELIST', payload: app.id })}
                              className="bg-[#450a0a] border border-red-500 text-red-500 px-2 py-[3px] text-[11px] cursor-pointer font-ui font-semibold hover:brightness-110"
                            >Deny</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'Settings' && (
          <div className="max-w-[480px]">
            <div className="bg-[#0d1117] border border-[#1e2533] p-[18px] flex flex-col gap-[14px]">
              <div className="text-amber-400 text-[12px] font-bold tracking-[1.5px] mb-0.5">COMMUNITY SETTINGS</div>
              {[['Community Name', communityName, setCommunityName], ['Logo URL', logoUrl, setLogoUrl]].map(([l, v, s]) => (
                <div key={l}>
                  <label className="text-[#6b7280] text-[11px] tracking-[1px] block mb-1">{l.toUpperCase()}</label>
                  <input
                    value={v}
                    onChange={e => s(e.target.value)}
                    className="w-full bg-[#090b10] border border-[#1e2533] text-[#d1d5db] px-[10px] py-[7px] text-[13px] font-ui box-border outline-none"
                  />
                </div>
              ))}
              <div>
                <label className="text-[#6b7280] text-[11px] tracking-[1px] block mb-1">CAD ACCENT COLOR</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={e => setAccentColor(e.target.value)}
                    className="bg-[#090b10] border border-[#1e2533] p-1 w-[50px] h-[34px] cursor-pointer"
                  />
                  <span className="text-[#9ca3af] text-[13px] font-ui">{accentColor}</span>
                </div>
              </div>
              <button className="bg-[#0c1a2e] border border-blue-500 text-blue-500 p-[9px] text-[13px] font-bold cursor-pointer font-ui tracking-[1px] mt-1 hover:brightness-110">
                SAVE SETTINGS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function THead({ cols, gold }) {
  return (
    <thead>
      <tr className="bg-[#0b0d14]">
        {cols.map(h => (
          <th
            key={h}
            className={`px-[10px] py-[7px] text-left text-[11px] font-bold tracking-[0.6px] border-b border-[#1e2533] whitespace-nowrap ${gold ? 'text-[#ca8a04]' : 'text-[#6b7280]'}`}
          >{h}</th>
        ))}
      </tr>
    </thead>
  );
}
