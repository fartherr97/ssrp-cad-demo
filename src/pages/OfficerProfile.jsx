import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';
import { useResponsive } from '../hooks/useResponsive';
import { DeptTag } from '../constants/deptLogos.jsx';
import {
  S_SELECT, S_TEXTAREA, S_BTN_PRIMARY, S_BTN_SECONDARY,
} from '../constants/styles';

export default function OfficerProfile() {
  const { state, dispatch } = useCAD();
  const { currentUser, officers, departments, reports, calls } = state;
  const myOfficer = officers.find(o => o.id === currentUser?.id);
  const myDept = departments.find(d => d.id === myOfficer?.dept);
  const myReports = reports.filter(r => r.officerBadge === myOfficer?.badge);
  const myCallHistory = calls.filter(c => c.units.includes(myOfficer?.unitId));
  const [tab, setTab] = useState('info');
  const [requestingTransfer, setRequestingTransfer] = useState(false);
  const [transferNote, setTransferNote] = useState('');
  const { isMobile } = useResponsive();

  if (!myOfficer) return (
    <div className="p-8 text-center text-slate-500">
      No officer profile found for current session.
    </div>
  );

  const commendations = [
    { id: 1, type: 'Commendation', date: '2023-09-15', from: 'Lt. Commander', note: 'Outstanding work on the Washington arrest. Demonstrated excellent tactical judgment.' },
    { id: 2, type: 'Commendation', date: '2023-08-02', from: 'Chief of Police', note: 'Community outreach award * monthly food drive coordination.' },
  ];
  const complaints = [];

  const initials = myOfficer.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const accentColor = myDept?.color || '#3b82f6';

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-5 box-border">
      {/* Profile header */}
      <div
        className="bg-app-panel/80 border border-border-base rounded-xl backdrop-blur-sm shadow-lg shadow-black/20 p-5 mb-5 max-w-[900px]"
        style={{ borderLeft: `3px solid ${accentColor}` }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl bg-app-elevated flex items-center justify-center text-lg font-extrabold shrink-0 tracking-widest"
            style={{ border: `2px solid ${accentColor}`, color: accentColor }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-lg font-bold tracking-[-0.2px]">{myOfficer.name}</div>
            <div className="text-slate-400 text-sm mt-0.5 flex items-center gap-1.5">
              {myOfficer.rank} &bull; {myDept?.short ? <DeptTag code={myDept.short} /> : (myDept?.name || 'Unknown Department')}
            </div>
            <div className="text-slate-500 text-xs mt-1">
              Badge: <span className="text-brand-bright font-semibold">{myOfficer.badge}</span>
              &nbsp;&bull;&nbsp;Unit: <span className="text-brand-bright font-semibold">{myOfficer.unitId}</span>
              &nbsp;&bull;&nbsp;{myOfficer.subdivision}
            </div>
          </div>
          <div className="text-right shrink-0">
            <StatusBadge status={myOfficer.status} />
            {myOfficer.callId && <div className="text-amber-400 text-xs mt-1.5">On Call: {myOfficer.callId}</div>}
          </div>
        </div>
        <div
          className="grid gap-2.5 mt-4"
          style={{ gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)' }}
        >
          {[
            { label: 'Reports Filed', val: myReports.length },
            { label: 'Calls Attended', val: myCallHistory.length },
            { label: 'Commendations', val: commendations.length },
            { label: 'Complaints', val: complaints.length },
          ].map(s => (
            <div key={s.label} className="bg-app-card/70 border border-border-base rounded-xl backdrop-blur-sm px-3.5 py-3">
              <div className="text-white text-2xl font-extrabold leading-none">{s.val}</div>
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.6px] mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-border-faint mb-4 max-w-[900px] overflow-x-auto n-tabs-wrap">
        {[['info','My Info'],['reports','My Reports'],['calls','Call History'],['commendations','Commendations']].map(([k,l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`relative px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.4px] whitespace-nowrap cursor-pointer transition-colors ${
              tab === k
                ? 'text-brand-bright'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {l}
            {tab === k && <span className="absolute -bottom-[1px] left-2 right-2 h-[3px] rounded-full bg-brand" />}
          </button>
        ))}
      </div>

      <div className="max-w-[900px]">
        {tab === 'info' && (
          <div
            className="grid gap-3.5"
            style={{ gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}
          >
            <InfoCard title="ASSIGNMENT" accentColor={accentColor}>
              {[['Department', myDept?.name], ['Short Name', myDept?.short], ['Subdivision', myOfficer.subdivision], ['Rank', myOfficer.rank], ['Badge Number', myOfficer.badge], ['Unit Identifier', myOfficer.unitId], ['Radio Channel', myDept?.radioChannel || '*']].map(([k,v]) => (
                <InfoRow key={k} label={k} value={v || '*'} />
              ))}
            </InfoCard>
            <InfoCard title="TRANSFER REQUEST" accentColor={accentColor}>
              {!requestingTransfer ? (
                <div>
                  <div className="text-slate-500 text-sm mb-3">Current subdivision: <span className="text-slate-300">{myOfficer.subdivision}</span></div>
                  <button onClick={() => setRequestingTransfer(true)} className={S_BTN_PRIMARY}>
                    Request Transfer
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-slate-500 mb-1.5">Requested Subdivision</div>
                  <select className={`${S_SELECT} mb-2`}>
                    {(myDept?.subdivisions || []).map(s => <option key={s}>{s}</option>)}
                  </select>
                  <textarea
                    value={transferNote}
                    onChange={e => setTransferNote(e.target.value)}
                    placeholder="Reason for transfer request..."
                    rows={3}
                    className={`${S_TEXTAREA} mb-2`}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setRequestingTransfer(false)} className={S_BTN_PRIMARY}>Submit</button>
                    <button onClick={() => setRequestingTransfer(false)} className={S_BTN_SECONDARY}>Cancel</button>
                  </div>
                </div>
              )}
            </InfoCard>
          </div>
        )}

        {tab === 'reports' && (
          <div className="table-scroll bg-app-panel/80 border border-border-base rounded-xl overflow-auto backdrop-blur-sm">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <THead cols={['Case #','Type','Date','Status','Call']} />
              <tbody>
                {myReports.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}>
                    <TD blue>{r.caseNumber}</TD>
                    <TD>{r.type}</TD>
                    <TD muted>{r.date}</TD>
                    <td className="px-3 py-2 border-b border-border-faint"><StatusBadge status={r.status} /></td>
                    <TD blue>{r.callId || '*'}</TD>
                  </tr>
                ))}
                {myReports.length === 0 && <tr><td colSpan={5} className="px-2.5 py-4 text-center text-slate-700">No reports filed.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'calls' && (
          <div className="table-scroll bg-app-panel/80 border border-border-base rounded-xl overflow-auto backdrop-blur-sm">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <THead cols={['Call #','Nature','Location','Priority','Status','Time']} />
              <tbody>
                {myCallHistory.map((c, i) => (
                  <tr key={c.id} className={i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}>
                    <TD blue>{c.id}</TD>
                    <TD>{c.nature}</TD>
                    <TD muted>{c.location}</TD>
                    <td className="px-3 py-2 border-b border-border-faint">
                      <span className={`font-bold text-xs ${['text-red-400','text-orange-400','text-yellow-400'][c.priority-1] || 'text-slate-300'}`}>
                        P{c.priority}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-b border-border-faint"><StatusBadge status={c.status} /></td>
                    <TD muted small>{c.timestamp}</TD>
                  </tr>
                ))}
                {myCallHistory.length === 0 && <tr><td colSpan={6} className="px-2.5 py-4 text-center text-slate-700">No call history.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'commendations' && (
          <div>
            {commendations.map(c => (
              <div key={c.id} className="bg-emerald-500/[0.07] border border-emerald-500/25 rounded-xl border-l-[3px] border-l-emerald-500 px-4 py-3.5 mb-2.5 backdrop-blur-sm">
                <div className="flex justify-between mb-1.5">
                  <span className="text-emerald-400 font-bold text-sm">{c.type.toUpperCase()}</span>
                  <span className="text-slate-500 text-[11px]">{c.date}</span>
                </div>
                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.5px] mb-1">From: {c.from}</div>
                <div className="text-slate-300 text-sm leading-relaxed">{c.note}</div>
              </div>
            ))}
            {complaints.length === 0 && commendations.length > 0 && (
              <div className="text-emerald-400/80 text-sm mt-1 bg-emerald-500/[0.07] border border-emerald-500/25 rounded-xl px-4 py-3 backdrop-blur-sm">NO COMPLAINTS ON RECORD</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, accentColor, children }) {
  return (
    <div className="bg-app-card/70 border border-border-base rounded-xl backdrop-blur-sm px-4 py-3.5">
      <div
        className="text-[10px] font-bold uppercase tracking-[0.9px] mb-3 border-b border-border-faint pb-2"
        style={{ color: accentColor || '#3d82f0' }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3 mb-1.5 text-sm">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-300 text-right">{value}</span>
    </div>
  );
}

function THead({ cols }) {
  return (
    <thead>
      <tr>
        {cols.map(h => (
          <th key={h} className="px-3 py-2.5 text-left text-slate-500 text-[10px] font-bold uppercase tracking-[0.7px] bg-app-bg/60 backdrop-blur-sm border-b border-border-base whitespace-nowrap sticky top-0">{h}</th>
        ))}
      </tr>
    </thead>
  );
}

function TD({ children, blue, muted, small }) {
  return (
    <td className={`px-3 py-2 border-b border-border-faint ${blue ? 'text-brand-bright font-bold' : muted ? 'text-slate-500' : 'text-slate-300'} ${small ? 'text-[11px]' : 'text-sm'}`}>
      {children}
    </td>
  );
}
