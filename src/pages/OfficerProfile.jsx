import { useState, useRef } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';
import { useResponsive } from '../hooks/useResponsive';

const INPUT_CLS = 'w-full bg-app-input border border-border-base text-cad-text px-2.5 py-2 text-sm box-border';
const BLUE_BTN = 'bg-sky-950 border border-sky-700 text-sky-400 px-4 py-2 text-sm cursor-pointer font-semibold rounded';
const GHOST_BTN = 'bg-white/5 border border-border-base text-cad-dim px-4 py-2 text-sm cursor-pointer rounded';

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
    <div className="p-4 h-full overflow-auto box-border">
      {/* Profile header */}
      <div
        className="bg-app-card p-4 mb-4 max-w-[900px]"
        style={{ border: `1px solid ${accentColor}40`, borderLeft: `3px solid ${accentColor}` }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 bg-app-input flex items-center justify-center text-lg font-extrabold shrink-0 tracking-widest"
            style={{ border: `2px solid ${accentColor}`, color: accentColor }}
          >
            {initials}
          </div>
          <div className="flex-1">
            <div className="text-slate-50 text-lg font-bold tracking-wide">{myOfficer.name}</div>
            <div className="text-slate-400 text-sm mt-0.5">
              {myOfficer.rank} &bull; {myDept?.name || 'Unknown Department'}
            </div>
            <div className="text-slate-600 text-xs mt-0.5">
              Badge: <span className="text-sky-400">{myOfficer.badge}</span>
              &nbsp;&bull;&nbsp;Unit: <span className="text-sky-400">{myOfficer.unitId}</span>
              &nbsp;&bull;&nbsp;{myOfficer.subdivision}
            </div>
          </div>
          <div className="text-right">
            <StatusBadge status={myOfficer.status} />
            {myOfficer.callId && <div className="text-amber-400 text-xs mt-1.5">On Call: {myOfficer.callId}</div>}
          </div>
        </div>
        <div
          className="grid gap-2 mt-3.5"
          style={{ gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)' }}
        >
          {[
            { label: 'Reports Filed', val: myReports.length },
            { label: 'Calls Attended', val: myCallHistory.length },
            { label: 'Commendations', val: commendations.length },
            { label: 'Complaints', val: complaints.length },
          ].map(s => (
            <div key={s.label} className="bg-app-input border border-border-subtle px-3 py-2">
              <div className="text-slate-50 text-lg font-bold">{s.val}</div>
              <div className="text-slate-600 text-[11px] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-border-base mb-3.5 max-w-[900px]">
        {[['info','My Info'],['signature','Signature'],['reports','My Reports'],['calls','Call History'],['commendations','Commendations']].map(([k,l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`border border-b-0 px-3.5 py-1.5 text-xs cursor-pointer tracking-wide transition-colors ${
              tab === k
                ? 'bg-app-elevated border-sky-700 text-sky-500'
                : 'bg-transparent border-transparent text-slate-600 hover:text-cad-dim'
            }`}
          >
            {l}
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
                  <div className="text-slate-600 text-sm mb-3">Current subdivision: <span className="text-slate-400">{myOfficer.subdivision}</span></div>
                  <button onClick={() => setRequestingTransfer(true)} className={BLUE_BTN}>
                    Request Transfer
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-slate-400 text-[11px] tracking-widest mb-1.5">REQUESTED SUBDIVISION</div>
                  <select className={`${INPUT_CLS} mb-2`}>
                    {(myDept?.subdivisions || []).map(s => <option key={s}>{s}</option>)}
                  </select>
                  <textarea
                    value={transferNote}
                    onChange={e => setTransferNote(e.target.value)}
                    placeholder="Reason for transfer request..."
                    rows={3}
                    className={`${INPUT_CLS} resize-y mb-2`}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setRequestingTransfer(false)} className={BLUE_BTN}>Submit</button>
                    <button onClick={() => setRequestingTransfer(false)} className={GHOST_BTN}>Cancel</button>
                  </div>
                </div>
              )}
            </InfoCard>
          </div>
        )}

        {tab === 'signature' && (
          <SignatureTab currentUser={currentUser} dispatch={dispatch} />
        )}

        {tab === 'reports' && (
          <div className="table-scroll">
            <table className="w-full border-collapse text-sm">
              <THead cols={['Case #','Type','Date','Status','Call']} />
              <tbody>
                {myReports.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? 'bg-app-card' : 'bg-[#111218]'}>
                    <TD blue>{r.caseNumber}</TD>
                    <TD>{r.type}</TD>
                    <TD muted>{r.date}</TD>
                    <td className="px-2.5 py-1.5"><StatusBadge status={r.status} /></td>
                    <TD blue>{r.callId || '*'}</TD>
                  </tr>
                ))}
                {myReports.length === 0 && <tr><td colSpan={5} className="px-2.5 py-4 text-center text-slate-700">No reports filed.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'calls' && (
          <div className="table-scroll">
            <table className="w-full border-collapse text-sm">
              <THead cols={['Call #','Nature','Location','Priority','Status','Time']} />
              <tbody>
                {myCallHistory.map((c, i) => (
                  <tr key={c.id} className={i % 2 === 0 ? 'bg-app-card' : 'bg-[#111218]'}>
                    <TD blue>{c.id}</TD>
                    <TD>{c.nature}</TD>
                    <TD muted>{c.location}</TD>
                    <td className="px-2.5 py-1.5">
                      <span className={`font-bold text-xs ${['text-red-500','text-orange-500','text-yellow-500'][c.priority-1] || 'text-slate-300'}`}>
                        P{c.priority}
                      </span>
                    </td>
                    <td className="px-2.5 py-1.5"><StatusBadge status={c.status} /></td>
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
              <div key={c.id} className="bg-green-950 border border-green-900 border-l-[3px] border-l-green-500 px-3.5 py-3.5 mb-2">
                <div className="flex justify-between mb-1.5">
                  <span className="text-green-400 font-bold text-sm">{c.type.toUpperCase()}</span>
                  <span className="text-slate-600 text-[11px]">{c.date}</span>
                </div>
                <div className="text-slate-600 text-[11px] tracking-wide mb-1">FROM: {c.from.toUpperCase()}</div>
                <div className="text-slate-400 text-sm leading-relaxed">{c.note}</div>
              </div>
            ))}
            {complaints.length === 0 && commendations.length > 0 && (
              <div className="text-green-800 text-sm mt-2.5 bg-green-950 border border-green-900 px-3 py-2">NO COMPLAINTS ON RECORD</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SignatureTab({ currentUser, dispatch }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasMark, setHasMark] = useState(false);
  const [saved, setSaved] = useState(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const pt = e.touches ? e.touches[0] : e;
    return {
      x: (pt.clientX - rect.left) * (canvas.width / rect.width),
      y: (pt.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
    setHasMark(true);
    setSaved(false);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const stopDraw = () => setDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setHasMark(false);
    setSaved(false);
  };

  const save = () => {
    if (!hasMark) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    dispatch({ type: 'SET_SIGNATURE', payload: dataUrl });
    setSaved(true);
  };

  const remove = () => {
    dispatch({ type: 'SET_SIGNATURE', payload: null });
    clear();
  };

  return (
    <div className="grid grid-cols-2 gap-5 items-start">
      <div className="bg-app-card border border-border-subtle p-4">
        <div className="text-sky-500 text-[11px] font-bold tracking-[1.5px] mb-3 border-b border-border-base pb-1.5">
          SET UP YOUR SIGNATURE
        </div>
        <div className="text-slate-500 text-xs mb-2.5">
          Draw your signature below using your mouse or touchscreen. This will be applied to official reports.
        </div>
        <div className="relative mb-2.5">
          <canvas
            ref={canvasRef}
            width={480}
            height={140}
            className="border border-border-strong cursor-crosshair block w-full"
            style={{ background: '#fff', height: 140, touchAction: 'none' }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          {!hasMark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-sm italic">
              Sign here...
            </div>
          )}
          <div className="absolute bottom-2 left-3 right-3 border-b border-gray-300 pointer-events-none" />
        </div>
        <div className="flex gap-2">
          <button onClick={clear} className={GHOST_BTN}>Clear</button>
          <button onClick={save} disabled={!hasMark} className={`${BLUE_BTN} disabled:opacity-50 disabled:cursor-default`}>
            Save Signature
          </button>
        </div>
        {saved && <div className="text-green-400 text-xs mt-2">✓ Signature saved successfully.</div>}
      </div>

      <div className="bg-app-card border border-border-subtle p-4">
        <div className="text-sky-500 text-[11px] font-bold tracking-[1.5px] mb-3 border-b border-border-base pb-1.5">
          SIGNATURE ON FILE
        </div>
        {currentUser?.signature ? (
          <>
            <div className="text-slate-500 text-xs mb-2.5">
              Your saved signature will automatically appear in all official reports.
            </div>
            <div className="bg-white border border-border-strong px-4 py-3 mb-3 block min-w-full box-border">
              <img src={currentUser.signature} alt="Saved signature" className="h-20 object-contain block" />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-green-400 text-xs">✓ Active</span>
              <button onClick={remove} className="ml-auto bg-white/5 border border-red-900 text-red-400 px-4 py-2 text-sm cursor-pointer rounded">Remove</button>
            </div>
            <div className="mt-3.5 bg-app-input border border-border-subtle border-l-[3px] border-l-sky-700 p-3">
              <div className="text-slate-600 text-[10px] tracking-widest uppercase mb-1">Preview on form</div>
              <div className="bg-white border border-gray-300 p-2 flex flex-col gap-1">
                <img src={currentUser.signature} alt="signature" className="h-10 object-contain object-left" />
                <div className="text-[8px] text-gray-500 uppercase tracking-wide border-t border-gray-300 pt-0.5">
                  Officer Signature / Badge #
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-slate-600 text-sm text-center py-5">
            <div className="text-3xl mb-2 opacity-30">✍</div>
            No signature on file.<br />
            <span className="text-xs">Draw your signature on the left and click "Save Signature".</span>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, accentColor, children }) {
  return (
    <div className="bg-app-card border border-border-subtle px-4 py-3.5">
      <div
        className="text-[11px] font-bold tracking-[1.5px] mb-3 border-b border-border-base pb-1.5"
        style={{ color: accentColor || '#3b82f6' }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between mb-1.5 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-300">{value}</span>
    </div>
  );
}

function THead({ cols }) {
  return (
    <thead>
      <tr className="bg-app-input">
        {cols.map(h => (
          <th key={h} className="px-2.5 py-1.5 text-left text-slate-500 text-[11px] font-bold tracking-wide border-b border-border-subtle whitespace-nowrap">{h}</th>
        ))}
      </tr>
    </thead>
  );
}

function TD({ children, blue, muted, small }) {
  return (
    <td className={`px-2.5 py-1.5 ${blue ? 'text-sky-400 font-bold' : muted ? 'text-slate-500' : 'text-slate-300'} ${small ? 'text-[11px]' : 'text-sm'}`}>
      {children}
    </td>
  );
}
