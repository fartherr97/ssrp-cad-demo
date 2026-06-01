import { useCAD } from '../../store/cadStore';

function Seg({ children, highlight }) {
  return (
    <span style={{ color: highlight ? 'var(--n-text-data)' : undefined }}>
      {children}
    </span>
  );
}

export default function BottomBar() {
  const { state } = useCAD();
  const { currentUser, officers, calls, myCallId } = state;

  const me = officers.find(o => o.id === currentUser?.id);
  const myCall = myCallId ? calls.find(c => c.id === myCallId) : null;
  const p1Count = calls.filter(c => c.priority === 1 && c.status !== 'CLOSED').length;
  const onDuty = officers.filter(o => o.status !== 'OFFDUTY').length;
  const available = officers.filter(o => o.status === 'AVAILABLE').length;

  return (
    <footer className="n-bottombar">
      <Seg>CH: HILLSBOROUGH MAIN</Seg>
      <div className="n-bottombar-sep" />

      <Seg>UNIT: <span style={{ color: 'var(--n-text-data)' }}>{me?.unitId || '—'}</span></Seg>
      <div className="n-bottombar-sep" />

      <Seg>CALL: <span style={{ color: myCall ? 'var(--pr3-text)' : 'var(--n-text-muted)' }}>
        {myCall ? myCall.id : 'UNASSIGNED'}
      </span></Seg>
      <div className="n-bottombar-sep" />

      <Seg>
        ACTIVE: <span style={{ color: 'var(--pr2-text)', fontWeight: 600 }}>
          {calls.filter(c => c.status !== 'CLOSED').length}
        </span>
      </Seg>
      {p1Count > 0 && (
        <>
          <div className="n-bottombar-sep" />
          <span style={{ color: 'var(--pr1-text)', fontWeight: 700, animation: 'pulseRed 1.5s ease-in-out infinite' }}>
            ▲ P1 CRITICAL: {p1Count}
          </span>
        </>
      )}
      <div className="n-bottombar-sep" />

      <Seg>ON DUTY: <span style={{ color: 'var(--n-text-data)' }}>{onDuty}</span></Seg>
      <div className="n-bottombar-sep" />

      <Seg>AVL: <span style={{ color: 'var(--st-av-text)' }}>{available}</span></Seg>

      <span style={{ marginLeft: 'auto', color: 'var(--n-border-strong)', userSelect: 'none' }}>
        SSRP NEXUS CAD v2.0
      </span>
    </footer>
  );
}
