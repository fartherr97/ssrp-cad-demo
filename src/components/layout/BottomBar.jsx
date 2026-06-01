import { useCAD } from '../../store/cadStore';

export default function BottomBar() {
  const { state } = useCAD();
  const { currentUser, officers, calls, myCallId } = state;

  const me = officers.find(o => o.id === currentUser?.id);
  const myCall = myCallId ? calls.find(c => c.id === myCallId) : null;
  const p1Count = calls.filter(c => c.priority === 1 && c.status !== 'CLOSED').length;
  const onDuty = officers.filter(o => o.status !== 'OFFDUTY').length;
  const available = officers.filter(o => o.status === 'AVAILABLE').length;
  const activeCalls = calls.filter(c => c.status !== 'CLOSED').length;

  return (
    <footer className="cad-statusbar">
      <span>CH: HILLSBOROUGH MAIN</span>
      <span className="cad-statusbar-sep" />

      <span>UNIT: <span className="hi">{me?.unitId || '—'}</span></span>
      <span className="cad-statusbar-sep" />

      <span>CALL: <span style={{ color: myCall ? 'var(--pr3-text)' : 'var(--n-text-muted)', fontWeight: myCall ? 600 : 400 }}>
        {myCall ? myCall.id : 'UNASSIGNED'}
      </span></span>
      <span className="cad-statusbar-sep" />

      <span>ACTIVE: <span className="hi">{activeCalls}</span></span>
      <span className="cad-statusbar-sep" />

      <span>PENDING: <span className="hi">{calls.filter(c => c.status === 'PENDING').length}</span></span>
      <span className="cad-statusbar-sep" />

      {p1Count > 0 && (
        <>
          <span className="p1">▲ P1 CRITICAL: {p1Count}</span>
          <span className="cad-statusbar-sep" />
        </>
      )}

      <span>ON DUTY: <span className="av">{onDuty}</span></span>
      <span className="cad-statusbar-sep" />

      <span>AVAILABLE: <span className="av">{available}</span></span>
      <span className="cad-statusbar-sep" />

      <span>DEPT: <span className="hi">{me?.deptShort || '—'}</span></span>
      <span className="cad-statusbar-sep" />

      <span>{me?.name || 'Unknown'} · {me?.rank || ''}</span>

      <span style={{ marginLeft: 'auto', color: '#1a2e44' }}>
        SSRP CAD v3.0 · HILLSBOROUGH CO. ECC
      </span>
    </footer>
  );
}
