import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCAD } from '../store/cadStore';
import {
  BADGE, S_PAGE, S_PANEL, S_PANEL_HEADER, S_PANEL_TITLE, S_PANEL_BODY,
  S_CARD, S_TABLE, S_TABLE_TH, S_TABLE_TD, S_BTN_PRIMARY, S_BTN_SECONDARY,
  S_BTN_DANGER, S_BTN_SUCCESS, S_INPUT, S_SELECT, S_LABEL, S_FIELD,
  S_DATA, S_DETAIL_ROW, S_DETAIL_LABEL, S_DETAIL_VALUE_MONO,
  trHoverOn, trHoverOff, xs, sm,
} from '../constants/styles';

export default function AdminCenter() {
  const { state, dispatch } = useCAD();
  const navigate = useNavigate();
  const { officers, activeSessions, auditLog, departments, whitelistApps, customRecordTypes, currentUser } = state;
  const [tab, setTab] = useState('USERS');
  const [deptForm, setDeptForm] = useState({ name:'',short:'',abbreviation:'',color:'#1060a0',type:'LEO',badgePrefix:'',radioChannel:'' });
  const [showDeptForm, setShowDeptForm] = useState(false);

  const TABS = ['USERS', 'SESSIONS', 'AUDIT LOG', 'DEPARTMENTS', 'WHITELIST', 'SETTINGS'];

  const pendingApps = whitelistApps.filter(w => w.status === 'Pending');

  const addDept = () => {
    if (!deptForm.name) return;
    dispatch({ type: 'ADD_DEPARTMENT', payload: { ...deptForm, subdivisions: [] } });
    setDeptForm({ name:'',short:'',abbreviation:'',color:'#1060a0',type:'LEO',badgePrefix:'',radioChannel:'' });
    setShowDeptForm(false);
  };

  return (
    <div className={`${S_PAGE} !p-0 overflow-hidden !gap-0`}>
      {/* Tabs */}
      <div className="flex shrink-0 border-b border-border-base bg-app-card">
        {TABS.map(t => (
          <button key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-[10px] font-bold uppercase tracking-[0.5px] border-none cursor-pointer transition-colors border-b-2 font-ui ${
              tab === t
                ? 'bg-app-selected text-cad-text border-b-sky-500'
                : 'bg-transparent text-cad-muted border-b-transparent hover:text-cad-text'
            }`}>
            {t}
            {t === 'WHITELIST' && pendingApps.length > 0 && (
              <span className="ml-1 text-[9px] bg-amber-900/60 text-amber-400 rounded px-0.5 font-mono">
                {pendingApps.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">

        {/* USERS */}
        {tab === 'USERS' && (
          <div className={S_PANEL}>
            <div className={S_PANEL_HEADER}>
              <div className={S_PANEL_TITLE}>Personnel Registry</div>
              <span className="text-[9px] text-cad-muted font-mono">{officers.length} MEMBERS</span>
            </div>
            <div className={S_PANEL_BODY}>
              <table className={S_TABLE}>
                <thead>
                  <tr>
                    {['Name','Badge','Department','Rank','Role','Status','Discord','Actions'].map(h => (
                      <th key={h} className={S_TABLE_TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {officers.map(o => (
                    <tr key={o.id} onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}>
                      <td className={`${S_TABLE_TD} font-medium`}>{o.name}</td>
                      <td className={S_TABLE_TD}><span className={`${S_DATA} text-[10px]`}>{o.badge}</span></td>
                      <td className={S_TABLE_TD}><span className={`${BADGE.blue} text-[9px]`}>{o.deptShort}</span></td>
                      <td className={`${S_TABLE_TD} text-[11px] text-slate-500`}>{o.rank}</td>
                      <td className={S_TABLE_TD}>
                        <span className={`${o.role === 'admin' ? BADGE.gold : o.role === 'dispatch' ? BADGE.cyan : BADGE.gray} text-[9px]`}>
                          {o.role}
                        </span>
                      </td>
                      <td className={S_TABLE_TD}>
                        <span className={`${o.status === 'OFFDUTY' ? BADGE.offduty : BADGE.available} text-[9px]`}>
                          {o.status === 'OFFDUTY' ? 'OFF DUTY' : 'ON DUTY'}
                        </span>
                      </td>
                      <td className={S_TABLE_TD}><span className={`${S_DATA} text-[9px]`}>{o.discordId}</span></td>
                      <td className={S_TABLE_TD}>
                        <div className="flex gap-1">
                          <button className={xs(S_BTN_SECONDARY)}>Edit</button>
                          <button className={xs(S_BTN_DANGER)} onClick={() => navigate('/bans')}>Ban</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SESSIONS */}
        {tab === 'SESSIONS' && (
          <div className={S_PANEL}>
            <div className={S_PANEL_HEADER}>
              <div className={S_PANEL_TITLE}>Active Sessions</div>
              <span className="text-[9px] text-cad-muted font-mono">{activeSessions.length} ONLINE</span>
            </div>
            <div className={S_PANEL_BODY}>
              <table className={S_TABLE}>
                <thead>
                  <tr>
                    {['Name','Role','Login Time','Last Active','IP Address'].map(h => (
                      <th key={h} className={S_TABLE_TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeSessions.map(s => (
                    <tr key={s.userId} onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}>
                      <td className={`${S_TABLE_TD} font-medium`}>{s.name}</td>
                      <td className={S_TABLE_TD}>
                        <span className={`${s.role === 'Admin' ? BADGE.gold : BADGE.gray} text-[9px]`}>{s.role}</span>
                      </td>
                      <td className={S_TABLE_TD}><span className={`${S_DATA} text-[10px]`}>{s.loginTime}</span></td>
                      <td className={S_TABLE_TD}><span className={`${S_DATA} text-[10px]`}>{s.lastActive}</span></td>
                      <td className={S_TABLE_TD}><span className={`${S_DATA} text-[10px]`}>{s.ip}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AUDIT LOG */}
        {tab === 'AUDIT LOG' && (
          <div className={S_PANEL}>
            <div className={S_PANEL_HEADER}>
              <div className={S_PANEL_TITLE}>System Audit Log</div>
              <span className="text-[9px] text-cad-muted font-mono">{auditLog.length} ENTRIES</span>
            </div>
            <div className={S_PANEL_BODY}>
              <table className={S_TABLE}>
                <thead>
                  <tr>
                    {['Timestamp','User','Module','Action'].map(h => (
                      <th key={h} className={S_TABLE_TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map(e => (
                    <tr key={e.id} onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}>
                      <td className={S_TABLE_TD}><span className={`${S_DATA} text-[10px]`}>{e.timestamp}</span></td>
                      <td className={`${S_TABLE_TD} text-[11px]`}>{e.user}</td>
                      <td className={S_TABLE_TD}><span className={`${BADGE.gray} text-[9px]`}>{e.module}</span></td>
                      <td className={`${S_TABLE_TD} text-[11px] text-slate-500`}>{e.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DEPARTMENTS */}
        {tab === 'DEPARTMENTS' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-end">
              <button className={sm(S_BTN_PRIMARY)} onClick={() => setShowDeptForm(!showDeptForm)}>
                {showDeptForm ? '✕ Cancel' : '+ Add Department'}
              </button>
            </div>

            {showDeptForm && (
              <div className={S_CARD}>
                <div className="text-[9px] text-yellow-600 uppercase tracking-[0.7px] mb-2.5">New Department</div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className={S_FIELD}><label className={S_LABEL}>Full Name</label><input className={S_INPUT} value={deptForm.name} onChange={e => setDeptForm(p=>({...p,name:e.target.value}))} /></div>
                  <div className={S_FIELD}><label className={S_LABEL}>Short Name</label><input className={S_INPUT} value={deptForm.short} onChange={e => setDeptForm(p=>({...p,short:e.target.value}))} /></div>
                  <div className={S_FIELD}><label className={S_LABEL}>Abbreviation</label><input className={S_INPUT} value={deptForm.abbreviation} onChange={e => setDeptForm(p=>({...p,abbreviation:e.target.value}))} /></div>
                  <div className={S_FIELD}><label className={S_LABEL}>Type</label>
                    <select className={S_SELECT} value={deptForm.type} onChange={e => setDeptForm(p=>({...p,type:e.target.value}))}>
                      <option value="LEO">LEO</option>
                      <option value="Fire">Fire</option>
                      <option value="EMS">EMS</option>
                      <option value="Dispatch">Dispatch</option>
                    </select>
                  </div>
                  <div className={S_FIELD}><label className={S_LABEL}>Badge Prefix</label><input className={S_INPUT} value={deptForm.badgePrefix} onChange={e => setDeptForm(p=>({...p,badgePrefix:e.target.value}))} /></div>
                  <div className={S_FIELD}><label className={S_LABEL}>Radio Channel</label><input className={S_INPUT} value={deptForm.radioChannel} onChange={e => setDeptForm(p=>({...p,radioChannel:e.target.value}))} /></div>
                  <div className={S_FIELD}><label className={S_LABEL}>Color</label>
                    <input type="color" value={deptForm.color} onChange={e => setDeptForm(p=>({...p,color:e.target.value}))}
                      className="w-full h-8 rounded border border-border-base bg-transparent cursor-pointer" />
                  </div>
                </div>
                <div className="flex justify-end gap-1.5">
                  <button className={sm(S_BTN_PRIMARY)} onClick={addDept}>Create Department</button>
                </div>
              </div>
            )}

            <div className={S_PANEL}>
              <div className={S_PANEL_HEADER}>
                <div className={S_PANEL_TITLE}>Departments</div>
                <span className="text-[9px] text-cad-muted font-mono">{departments.length}</span>
              </div>
              <div className={S_PANEL_BODY}>
                <table className={S_TABLE}>
                  <thead>
                    <tr>
                      {['Name','Abbrev','Type','Badge Prefix','Radio','Subdivisions'].map(h => (
                        <th key={h} className={S_TABLE_TH}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(d => (
                      <tr key={d.id} onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}>
                        <td className={`${S_TABLE_TD} font-medium`}>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-[2px] shrink-0" style={{ background: d.color }} />
                            {d.name}
                          </div>
                        </td>
                        <td className={S_TABLE_TD}><span className={S_DATA}>{d.abbreviation}</span></td>
                        <td className={S_TABLE_TD}>
                          <span className={`${d.type === 'LEO' ? BADGE.blue : d.type === 'Fire' ? BADGE.fire : BADGE.green} text-[9px]`}>{d.type}</span>
                        </td>
                        <td className={S_TABLE_TD}><span className={`${S_DATA} text-[10px]`}>{d.badgePrefix}</span></td>
                        <td className={S_TABLE_TD}><span className={`${S_DATA} text-[10px]`}>{d.radioChannel}</span></td>
                        <td className={`${S_TABLE_TD} text-[10px] text-slate-500`}>{d.subdivisions?.join(', ') || '*'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* WHITELIST */}
        {tab === 'WHITELIST' && (
          <div className={S_PANEL}>
            <div className={S_PANEL_HEADER}>
              <div className={S_PANEL_TITLE}>Whitelist Applications</div>
              <span className="text-[9px] text-cad-muted font-mono">{pendingApps.length} PENDING</span>
            </div>
            <div className={S_PANEL_BODY}>
              <table className={S_TABLE}>
                <thead>
                  <tr>
                    {['Name','Discord ID','Applied','Status','Notes','Actions'].map(h => (
                      <th key={h} className={S_TABLE_TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {whitelistApps.map(w => (
                    <tr key={w.id} onMouseEnter={trHoverOn} onMouseLeave={trHoverOff}>
                      <td className={`${S_TABLE_TD} font-medium`}>{w.name}</td>
                      <td className={S_TABLE_TD}><span className={`${S_DATA} text-[10px]`}>{w.discordId}</span></td>
                      <td className={S_TABLE_TD}><span className={`${S_DATA} text-[10px]`}>{w.appliedDate}</span></td>
                      <td className={S_TABLE_TD}>
                        <span className={w.status === 'Approved' ? BADGE.green : w.status === 'Pending' ? BADGE.orange : BADGE.red}>
                          {w.status}
                        </span>
                      </td>
                      <td className={`${S_TABLE_TD} text-[11px] text-slate-500`}>{w.notes || '*'}</td>
                      <td className={S_TABLE_TD}>
                        {w.status === 'Pending' && (
                          <div className="flex gap-1">
                            <button className={xs(S_BTN_SUCCESS)} onClick={() => dispatch({ type: 'APPROVE_WHITELIST', payload: w.id })}>Approve</button>
                            <button className={xs(S_BTN_DANGER)} onClick={() => dispatch({ type: 'DENY_WHITELIST', payload: w.id })}>Deny</button>
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

        {/* SETTINGS */}
        {tab === 'SETTINGS' && (
          <div className="grid grid-cols-2 gap-3">
            <div className={S_CARD}>
              <div className="text-[11px] font-semibold mb-2.5 text-yellow-600">Community Configuration</div>
              <div className={`${S_FIELD} mb-2`}><label className={S_LABEL}>Community Name</label><input className={S_INPUT} defaultValue="Sunshine State RP" /></div>
              <div className={`${S_FIELD} mb-2`}><label className={S_LABEL}>Dispatch Channel</label><input className={S_INPUT} defaultValue="Hillsborough Main" /></div>
              <div className={`${S_FIELD} mb-2`}><label className={S_LABEL}>CAD System Name</label><input className={S_INPUT} defaultValue="SSRP NEXUS CAD v2.0" /></div>
              <button className={sm(S_BTN_PRIMARY)}>Save Configuration</button>
            </div>
            <div className={S_CARD}>
              <div className="text-[11px] font-semibold mb-2.5 text-yellow-600">System Statistics</div>
              {[
                { label: 'Total Members', value: officers.length },
                { label: 'Total Departments', value: departments.length },
                { label: 'Active Sessions', value: activeSessions.length },
                { label: 'Pending Applications', value: pendingApps.length },
                { label: 'Audit Log Entries', value: auditLog.length },
              ].map(s => (
                <div key={s.label} className={S_DETAIL_ROW}>
                  <span className={S_DETAIL_LABEL}>{s.label}</span>
                  <span className={`${S_DETAIL_VALUE_MONO} text-[12px]`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
