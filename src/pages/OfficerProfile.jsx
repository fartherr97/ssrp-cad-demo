import { useState, useRef, useEffect } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';
import { useResponsive } from '../hooks/useResponsive';

export default function OfficerProfile() {
  const { state, dispatch } = useCAD();
  const { currentUser, officers, departments, reports, calls, criminalHistory } = state;
  const myOfficer = officers.find(o => o.id === currentUser?.id);
  const myDept = departments.find(d => d.id === myOfficer?.dept);
  const myReports = reports.filter(r => r.officerBadge === myOfficer?.badge);
  const myCallHistory = calls.filter(c => c.units.includes(myOfficer?.unitId));
  const [tab, setTab] = useState('info');
  const [requestingTransfer, setRequestingTransfer] = useState(false);
  const [transferNote, setTransferNote] = useState('');
  const { isMobile } = useResponsive();

  if (!myOfficer) return (
    <div style={{ padding: '32px', fontFamily: 'Ubuntu, sans-serif', color: '#4b5563', textAlign: 'center' }}>
      No officer profile found for current session.
    </div>
  );

  const commendations = [
    { id: 1, type: 'Commendation', date: '2023-09-15', from: 'Lt. Commander', note: 'Outstanding work on the Washington arrest. Demonstrated excellent tactical judgment.' },
    { id: 2, type: 'Commendation', date: '2023-08-02', from: 'Chief of Police', note: 'Community outreach award — monthly food drive coordination.' },
  ];
  const complaints = [];

  const initials = myOfficer.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const accentColor = myDept?.color || '#3b82f6';

  return (
    <div style={{ padding: '16px', fontFamily: 'Ubuntu, sans-serif', height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
      {/* Profile header */}
      <div style={{ background: '#0d1117', border: `1px solid ${accentColor}40`, borderLeft: `3px solid ${accentColor}`, padding: '16px 20px', marginBottom: '16px', maxWidth: 900 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', background: '#090b10', border: `2px solid ${accentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, color: accentColor, flexShrink: 0, letterSpacing: '1px' }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#f9fafb', fontSize: '18px', fontWeight: 700, letterSpacing: '0.5px' }}>{myOfficer.name}</div>
            <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '3px' }}>
              {myOfficer.rank} &bull; {myDept?.name || 'Unknown Department'}
            </div>
            <div style={{ color: '#4b5563', fontSize: '12px', marginTop: '2px' }}>
              Badge: <span style={{ color: '#60a5fa' }}>{myOfficer.badge}</span>
              &nbsp;&bull;&nbsp;Unit: <span style={{ color: '#60a5fa' }}>{myOfficer.unitId}</span>
              &nbsp;&bull;&nbsp;{myOfficer.subdivision}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <StatusBadge status={myOfficer.status} style={{ fontSize: '13px', padding: '4px 10px' }} />
            {myOfficer.callId && <div style={{ color: '#fbbf24', fontSize: '12px', marginTop: '6px' }}>On Call: {myOfficer.callId}</div>}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '8px', marginTop: '14px' }}>
          {[
            { label: 'Reports Filed', val: myReports.length },
            { label: 'Calls Attended', val: myCallHistory.length },
            { label: 'Commendations', val: commendations.length },
            { label: 'Complaints', val: complaints.length },
          ].map(s => (
            <div key={s.label} style={{ background: '#090b10', border: '1px solid #1f2937', padding: '8px 12px' }}>
              <div style={{ color: '#f9fafb', fontSize: '18px', fontWeight: 700 }}>{s.val}</div>
              <div style={{ color: '#4b5563', fontSize: '11px', marginTop: '1px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #1f2937', marginBottom: '14px', maxWidth: 900 }}>
        {[['info','My Info'],['signature','Signature'],['reports','My Reports'],['calls','Call History'],['commendations','Commendations']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ background: tab === k ? '#0f172a' : 'transparent', border: tab === k ? '1px solid #3b82f6' : '1px solid transparent', borderBottom: 'none', color: tab === k ? '#3b82f6' : '#4b5563', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif', letterSpacing: '0.5px' }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 900 }}>
        {tab === 'info' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
            <InfoCard title="ASSIGNMENT" accentColor={accentColor}>
              {[['Department', myDept?.name], ['Short Name', myDept?.short], ['Subdivision', myOfficer.subdivision], ['Rank', myOfficer.rank], ['Badge Number', myOfficer.badge], ['Unit Identifier', myOfficer.unitId], ['Radio Channel', myDept?.radioChannel || '—']].map(([k,v]) => (
                <InfoRow key={k} label={k} value={v || '—'} />
              ))}
            </InfoCard>
            <InfoCard title="TRANSFER REQUEST" accentColor={accentColor}>
              {!requestingTransfer ? (
                <div>
                  <div style={{ color: '#4b5563', fontSize: '13px', marginBottom: '12px' }}>Current subdivision: <span style={{ color: '#9ca3af' }}>{myOfficer.subdivision}</span></div>
                  <button onClick={() => setRequestingTransfer(true)} style={blueBtn}>
                    Request Transfer
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ color: '#9ca3af', fontSize: '11px', letterSpacing: '1px', marginBottom: '6px' }}>REQUESTED SUBDIVISION</div>
                  <select style={{ ...inputBase, marginBottom: '8px' }}>
                    {(myDept?.subdivisions || []).map(s => <option key={s}>{s}</option>)}
                  </select>
                  <textarea value={transferNote} onChange={e => setTransferNote(e.target.value)} placeholder="Reason for transfer request..." rows={3} style={{ ...inputBase, resize: 'vertical', marginBottom: '8px' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setRequestingTransfer(false); }} style={blueBtn}>Submit</button>
                    <button onClick={() => setRequestingTransfer(false)} style={ghostBtn}>Cancel</button>
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
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <THead cols={['Case #','Type','Date','Status','Call']} />
              <tbody>
                {myReports.map((r, i) => (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? '#0d1117' : '#111218' }}>
                    <TD blue>{r.caseNumber}</TD>
                    <TD>{r.type}</TD>
                    <TD muted>{r.date}</TD>
                    <td style={{ padding: '7px 10px' }}><StatusBadge status={r.status} /></td>
                    <TD blue>{r.callId || '—'}</TD>
                  </tr>
                ))}
                {myReports.length === 0 && <tr><td colSpan={5} style={{ padding: '18px', textAlign: 'center', color: '#374151' }}>No reports filed.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'calls' && (
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <THead cols={['Call #','Nature','Location','Priority','Status','Time']} />
              <tbody>
                {myCallHistory.map((c, i) => (
                  <tr key={c.id} style={{ background: i % 2 === 0 ? '#0d1117' : '#111218' }}>
                    <TD blue>{c.id}</TD>
                    <TD>{c.nature}</TD>
                    <TD muted>{c.location}</TD>
                    <td style={{ padding: '7px 10px' }}>
                      <span style={{ color: ['#dc2626','#ea580c','#ca8a04'][c.priority - 1] || '#d1d5db', fontWeight: 700, fontSize: '12px' }}>P{c.priority}</span>
                    </td>
                    <td style={{ padding: '7px 10px' }}><StatusBadge status={c.status} /></td>
                    <TD muted small>{c.timestamp}</TD>
                  </tr>
                ))}
                {myCallHistory.length === 0 && <tr><td colSpan={6} style={{ padding: '18px', textAlign: 'center', color: '#374151' }}>No call history.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'commendations' && (
          <div>
            {commendations.map(c => (
              <div key={c.id} style={{ background: '#051a05', border: '1px solid #166534', borderLeft: '3px solid #22c55e', padding: '14px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '13px' }}>{c.type.toUpperCase()}</span>
                  <span style={{ color: '#4b5563', fontSize: '11px' }}>{c.date}</span>
                </div>
                <div style={{ color: '#4b5563', fontSize: '11px', letterSpacing: '0.5px', marginBottom: '4px' }}>FROM: {c.from.toUpperCase()}</div>
                <div style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.5 }}>{c.note}</div>
              </div>
            ))}
            {complaints.length === 0 && commendations.length > 0 && (
              <div style={{ color: '#166534', fontSize: '13px', marginTop: '10px', background: '#051a05', border: '1px solid #166534', padding: '8px 12px' }}>NO COMPLAINTS ON RECORD</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Signature Tab ─────────────────────────────────────────────────── */
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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
      {/* Draw pad */}
      <div style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '16px' }}>
        <div style={{ color: '#3b82f6', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '12px', borderBottom: '1px solid #1f2937', paddingBottom: '6px' }}>
          SET UP YOUR SIGNATURE
        </div>
        <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '10px' }}>
          Draw your signature below using your mouse or touchscreen. This will be applied to official reports.
        </div>
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <canvas
            ref={canvasRef}
            width={480}
            height={140}
            style={{
              background: '#fff',
              border: '1px solid #374151',
              cursor: 'crosshair',
              display: 'block',
              width: '100%',
              height: 140,
              touchAction: 'none',
            }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          {!hasMark && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none', color: '#aab', fontSize: 13, fontStyle: 'italic',
            }}>
              Sign here...
            </div>
          )}
          <div style={{
            position: 'absolute', bottom: 8, left: 12, right: 12,
            borderBottom: '1px solid #ccc', pointerEvents: 'none',
          }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={clear} style={ghostBtn}>Clear</button>
          <button onClick={save} disabled={!hasMark} style={{ ...blueBtn, opacity: hasMark ? 1 : 0.5, cursor: hasMark ? 'pointer' : 'default' }}>
            Save Signature
          </button>
        </div>
        {saved && <div style={{ color: '#22c55e', fontSize: '12px', marginTop: '8px' }}>✓ Signature saved successfully.</div>}
      </div>

      {/* Current signature preview */}
      <div style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '16px' }}>
        <div style={{ color: '#3b82f6', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '12px', borderBottom: '1px solid #1f2937', paddingBottom: '6px' }}>
          SIGNATURE ON FILE
        </div>
        {currentUser?.signature ? (
          <>
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '10px' }}>
              Your saved signature will automatically appear in all official reports. You can apply it with one click when filing.
            </div>
            <div style={{ background: '#fff', border: '1px solid #374151', padding: '12px 16px', marginBottom: '12px', display: 'inline-block', minWidth: '100%', boxSizing: 'border-box' }}>
              <img src={currentUser.signature} alt="Saved signature" style={{ height: 80, objectFit: 'contain', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: '#22c55e', fontSize: '12px' }}>✓ Active</span>
              <button onClick={remove} style={{ ...ghostBtn, marginLeft: 'auto', borderColor: '#991b1b', color: '#ef4444' }}>Remove</button>
            </div>
            <div style={{ marginTop: 14, background: '#090b10', border: '1px solid #1e2533', padding: '12px', borderLeft: '3px solid #3b82f6' }}>
              <div style={{ color: '#6b7280', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Preview on form</div>
              <div style={{ background: '#fff', border: '1px solid #ccc', padding: '8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <img src={currentUser.signature} alt="signature" style={{ height: 40, objectFit: 'contain', objectPosition: 'left' }} />
                <div style={{ fontSize: 8, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Arial, sans-serif', borderTop: '1px solid #ccc', paddingTop: 3 }}>
                  Officer Signature / Badge #
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ color: '#4b5563', fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>✍</div>
            No signature on file.<br />
            <span style={{ fontSize: '12px' }}>Draw your signature on the left and click "Save Signature".</span>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, accentColor, children }) {
  return (
    <div style={{ background: '#0d1117', border: '1px solid #1e2533', padding: '14px 16px' }}>
      <div style={{ color: accentColor || '#3b82f6', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '12px', borderBottom: '1px solid #1f2937', paddingBottom: '6px' }}>{title}</div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px', fontSize: '13px' }}>
      <span style={{ color: '#4b5563' }}>{label}</span>
      <span style={{ color: '#d1d5db' }}>{value}</span>
    </div>
  );
}

function THead({ cols }) {
  return (
    <thead>
      <tr style={{ background: '#0b0d14' }}>
        {cols.map(h => (
          <th key={h} style={{ padding: '7px 10px', textAlign: 'left', color: '#6b7280', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', borderBottom: '1px solid #1e2533', whiteSpace: 'nowrap' }}>{h}</th>
        ))}
      </tr>
    </thead>
  );
}

function TD({ children, blue, muted, small }) {
  return (
    <td style={{ padding: '7px 10px', color: blue ? '#60a5fa' : muted ? '#6b7280' : '#d1d5db', fontWeight: blue ? 700 : 400, fontSize: small ? '11px' : '13px' }}>
      {children}
    </td>
  );
}

const inputBase = { width: '100%', background: '#090b10', border: '1px solid #1e2533', color: '#d1d5db', padding: '7px 10px', fontSize: '13px', fontFamily: 'Ubuntu, sans-serif', boxSizing: 'border-box' };
const blueBtn = { background: '#0c1a2e', border: '1px solid #3b82f6', color: '#3b82f6', padding: '7px 12px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif', fontWeight: 600 };
const ghostBtn = { background: 'transparent', border: '1px solid #1f2937', color: '#4b5563', padding: '7px 12px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Ubuntu, sans-serif' };
