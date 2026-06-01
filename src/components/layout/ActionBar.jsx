import { useCAD } from '../../store/cadStore';

/* ─── SVG icon helpers ─── */
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  cad:      ['M3 3h18v4H3z', 'M3 10h18v4H3z', 'M3 17h18v4H3z'],
  search:   'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z',
  returns:  ['M1 4v6h6', 'M23 20v-6h-6', 'M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15'],
  forms:    ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M16 13H8', 'M16 17H8', 'M10 9H8'],
  map:      ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z', 'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  board:    ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
  mycall:   ['M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 11.5 19.79 19.79 0 0 1 1 2.18 2 2 0 0 1 2.98 0h3.04a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 14.91v2.01z'],
  newcall:  ['M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 11.5 19.79 19.79 0 0 1 1 2.18 2 2 0 0 1 2.98 0h3.04a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 14.91v2.01z', 'M19 3v6', 'M22 6h-6'],
  assign:   ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M19 8v6', 'M22 11h-6'],
  assist:   ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  primary:  ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],
  signout:  ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
};

function ToolBtn({ iconKey, label, onClick, active, disabled, title, style = {} }) {
  return (
    <button
      className={`cad-tool-btn${active ? ' active' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      style={style}
    >
      <span className="cad-tool-icon">
        <Icon d={ICONS[iconKey]} size={20} />
      </span>
      <span className="cad-tool-label">{label}</span>
    </button>
  );
}

export default function ActionBar({ onCreateCall }) {
  const { state, dispatch } = useCAD();
  const { currentPage, currentUser, officers, calls, myCallId } = state;

  const me = officers.find(o => o.id === currentUser?.id);
  const myStatus = me?.status || 'OFFDUTY';
  const myCall = myCallId ? calls.find(c => c.id === myCallId) : null;
  const isDispatch = currentUser?.role === 'dispatch' || currentUser?.role === 'admin';

  const go = (page) => dispatch({ type: 'SET_PAGE', payload: page });
  const setStatus = (s) => dispatch({ type: 'SET_STATUS', payload: s });

  const assignSelf = () => {
    if (!me || !myCall) return;
    dispatch({ type: 'ASSIGN_UNIT', payload: { callId: myCall.id, unitId: me.unitId } });
  };

  const STATUS_BTNS = [
    { status: 'AVAILABLE',   label: 'AVL',   cls: 'st-available', color: '#22ff66' },
    { status: 'ENRT',        label: 'ENRT',  cls: 'st-enrt',      color: '#aaff33' },
    { status: 'BUSY',        label: 'BUSY',  cls: 'st-busy',      color: '#ff8822' },
    { status: 'ARRVD',       label: 'ARRVD', cls: 'st-arrvd',     color: '#ffee22' },
    { status: 'UNAVAILABLE', label: 'UNAVL', cls: 'st-unavl',     color: '#dd44aa' },
    { status: 'OFFDUTY',     label: 'OFD',   cls: 'st-offduty',   color: '#cc3333' },
  ];

  const activeStatusColor = STATUS_BTNS.find(s => s.status === myStatus)?.color || '#cc3333';

  return (
    <div className="cad-actionbar" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>

      {/* My call indicator */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        justifyContent: 'center', padding: '0 12px', height: '100%',
        borderRight: '1px solid #2a4060', flexShrink: 0, minWidth: 110,
      }}>
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#6090b8', letterSpacing: '0.5px', textTransform: 'uppercase' }}>My Call</span>
        <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700, color: myCall ? '#66ddff' : '#334455', lineHeight: 1.2 }}>
          {myCall ? myCall.id : 'UNASSIGNED'}
        </span>
        {myCall && (
          <span style={{ fontSize: 9, color: '#5090b0', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {myCall.nature}
          </span>
        )}
      </div>

      {/* ── Nav group ── */}
      <ToolBtn iconKey="cad"     label="CAD"     onClick={() => go('dispatch')} active={currentPage === 'dispatch'} />
      <ToolBtn iconKey="search"  label="Search"  onClick={() => go('records')}  active={currentPage === 'records'}  />
      <ToolBtn iconKey="returns" label="Returns" onClick={() => go('returns')}  active={currentPage === 'returns'}  />
      <ToolBtn iconKey="forms"   label="Forms"   onClick={() => go('reports')}  active={currentPage === 'reports'}  />
      <ToolBtn iconKey="map"     label="Map"     onClick={() => go('map')}      active={currentPage === 'map'}      />
      <ToolBtn iconKey="board"   label="Board"   onClick={() => go('board')}    active={currentPage === 'board'}    />

      <div className="cad-tool-sep" />

      {/* ── Call actions ── */}
      {isDispatch && (
        <ToolBtn iconKey="newcall" label="New Call" onClick={onCreateCall} />
      )}
      <ToolBtn iconKey="mycall"  label="My Call"    onClick={() => myCall && go('dispatch')} disabled={!myCall} />
      <ToolBtn iconKey="assign"  label="Assign Self" onClick={assignSelf} disabled={!myCall || !me} />
      <ToolBtn iconKey="assist"  label="Assist"      onClick={() => {}} />
      <ToolBtn iconKey="primary" label="Primary"     onClick={() => {}} />

      <div className="cad-tool-sep" />

      {/* ── Status buttons ── */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 1, padding: '0 4px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingRight: 8, borderRight: '1px solid #2a4060', marginRight: 4, height: 42 }}>
          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#6090b8', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Status</span>
          <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700, color: activeStatusColor }}>{STATUS_BTNS.find(s => s.status === myStatus)?.label || '—'}</span>
        </div>
        {STATUS_BTNS.map(s => (
          <button
            key={s.status}
            className={`cad-status-btn ${myStatus === s.status ? s.cls : ''}`}
            style={{ height: 30, padding: '0 9px', fontSize: 10 }}
            onClick={() => setStatus(s.status)}
            title={`Set status: ${s.status}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Sign out ── far right */}
      <div style={{ marginLeft: 'auto', borderLeft: '1px solid #0d1e32' }}>
        <ToolBtn iconKey="signout" label="Sign Out" onClick={() => dispatch({ type: 'LOGOUT' })} />
      </div>
    </div>
  );
}
