import { useCAD } from '../../store/cadStore';

export default function ActionBar({ onCreateCall }) {
  const { state, dispatch } = useCAD();
  const { currentUser, officers, calls, myCallId } = state;

  const me = officers.find(o => o.id === currentUser?.id);
  const myStatus = me?.status || 'OFFDUTY';
  const myCall = myCallId ? calls.find(c => c.id === myCallId) : null;
  const isDispatch = currentUser?.role === 'dispatch' || currentUser?.role === 'admin';

  const setStatus = (s) => dispatch({ type: 'SET_STATUS', payload: s });

  const statusMap = {
    AVAILABLE:   { cls: 'st-available', label: 'AVL'   },
    BUSY:        { cls: 'st-busy',      label: 'BUSY'  },
    ENRT:        { cls: 'st-enrt',      label: 'ENRT'  },
    ARRVD:       { cls: 'st-arrvd',     label: 'ARRVD' },
    OFFDUTY:     { cls: 'st-offduty',   label: 'OFD'   },
    UNAVAILABLE: { cls: 'st-unavl',     label: 'UNAVL' },
  };

  const myCallDisplay = myCall ? myCall.id : 'UNASSIGNED';

  const assignSelf = () => {
    if (!me || !myCall) return;
    dispatch({ type: 'ASSIGN_UNIT', payload: { callId: myCall.id, unitId: me.unitId } });
  };

  return (
    <div className="cad-actionbar">
      {/* My Call indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px',
        height: '100%', borderRight: '1px solid var(--n-border-faint)',
        fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--n-text-muted)',
        flexShrink: 0,
      }}>
        MY CALL:&nbsp;
        <span style={{ color: myCall ? 'var(--pr3-text)' : 'var(--n-text-muted)', fontWeight: 600 }}>
          {myCallDisplay}
        </span>
        {myCall && (
          <span style={{ color: 'var(--n-text-dim)', marginLeft: 3 }}>
            · {myCall.nature}
          </span>
        )}
      </div>

      {isDispatch && (
        <>
          <button className="cad-action-btn btn-create" style={{ marginLeft: 4 }} onClick={onCreateCall}>
            + Create Call
          </button>
          <div className="cad-action-sep" />
        </>
      )}

      <button className="cad-action-btn" onClick={assignSelf} disabled={!myCall || !me} style={{ marginLeft: isDispatch ? 0 : 4 }}>
        Assign Self
      </button>
      <button className="cad-action-btn">
        Assist Unit
      </button>
      <button className="cad-action-btn">
        Primary Unit
      </button>

      <div className="cad-action-sep" />

      <button
        className="cad-action-btn"
        onClick={() => dispatch({ type: 'SET_PAGE', payload: 'dispatch' })}
      >
        CAD Board
      </button>
      <button
        className="cad-action-btn"
        onClick={() => dispatch({ type: 'SET_PAGE', payload: 'records' })}
      >
        Search
      </button>
      <button
        className="cad-action-btn"
        onClick={() => dispatch({ type: 'SET_PAGE', payload: 'map' })}
      >
        Live Map
      </button>

      {/* Status controls — right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 2, paddingRight: 6 }}>
        <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--n-text-muted)', alignSelf: 'center', marginRight: 4, letterSpacing: '0.5px' }}>
          STATUS:
        </span>
        {[
          { status: 'AVAILABLE',   label: 'AVL',   cls: 'st-available' },
          { status: 'ENRT',        label: 'ENRT',  cls: 'st-enrt'      },
          { status: 'BUSY',        label: 'BUSY',  cls: 'st-busy'      },
          { status: 'ARRVD',       label: 'ARRVD', cls: 'st-arrvd'     },
          { status: 'UNAVAILABLE', label: 'UNAVL', cls: 'st-unavl'     },
          { status: 'OFFDUTY',     label: 'OFD',   cls: 'st-offduty'   },
        ].map(s => (
          <button
            key={s.status}
            className={`cad-status-btn ${myStatus === s.status ? s.cls : ''}`}
            onClick={() => setStatus(s.status)}
            title={`Set status: ${s.status}`}
          >
            {s.label}
          </button>
        ))}

        <div className="cad-action-sep" />

        <button
          className="cad-action-btn"
          style={{ color: 'var(--n-text-muted)', fontSize: 9 }}
          onClick={() => dispatch({ type: 'LOGOUT' })}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
