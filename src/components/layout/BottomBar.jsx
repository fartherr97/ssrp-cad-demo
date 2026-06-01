import { useCAD } from '../../store/cadStore';
import { S_STATUSBAR, S_STATUSBAR_SEP, S_STATUSBAR_HI, S_STATUSBAR_AV, S_STATUSBAR_P1 } from '../../constants/styles';

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
    <footer className={S_STATUSBAR}>
      <span>CH: HILLSBOROUGH MAIN</span>
      <span className={S_STATUSBAR_SEP} />

      <span>UNIT: <span className={S_STATUSBAR_HI}>{me?.unitId || '—'}</span></span>
      <span className={S_STATUSBAR_SEP} />

      <span>CALL: <span style={{ color: myCall ? 'var(--pr3-text)' : 'var(--n-text-muted)', fontWeight: myCall ? 600 : 400 }}>
        {myCall ? myCall.id : 'UNASSIGNED'}
      </span></span>
      <span className={S_STATUSBAR_SEP} />

      <span>ACTIVE: <span className={S_STATUSBAR_HI}>{activeCalls}</span></span>
      <span className={S_STATUSBAR_SEP} />

      <span>PENDING: <span className={S_STATUSBAR_HI}>{calls.filter(c => c.status === 'PENDING').length}</span></span>
      <span className={S_STATUSBAR_SEP} />

      {p1Count > 0 && (
        <>
          <span className={S_STATUSBAR_P1}>▲ P1 CRITICAL: {p1Count}</span>
          <span className={S_STATUSBAR_SEP} />
        </>
      )}

      <span>ON DUTY: <span className={S_STATUSBAR_AV}>{onDuty}</span></span>
      <span className={S_STATUSBAR_SEP} />

      <span>AVAILABLE: <span className={S_STATUSBAR_AV}>{available}</span></span>
      <span className={S_STATUSBAR_SEP} />

      <span>DEPT: <span className={S_STATUSBAR_HI}>{me?.deptShort || '—'}</span></span>
      <span className={S_STATUSBAR_SEP} />

      <span>{me?.name || 'Unknown'} · {me?.rank || ''}</span>

      <span style={{ marginLeft: 'auto', color: '#1a2e44' }}>
        SSRP CAD v3.0 · HILLSBOROUGH CO. ECC
      </span>
    </footer>
  );
}
