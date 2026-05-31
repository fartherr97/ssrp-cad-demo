import { useState } from 'react';
import { useCAD } from '../store/cadStore';
import StatusBadge from '../components/StatusBadge';

const PRIORITY_COLORS = { 1: '#ef4444', 2: '#f59e0b', 3: '#22c55e' };

export default function DispatchBoard() {
  const { state, dispatch } = useCAD();
  const { calls, officers, currentUser, myCallId } = state;
  const [selectedCall, setSelectedCall] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const activeCalls = calls.filter(c => c.status !== 'CLOSED');
  const filteredCalls = statusFilter === 'ALL' ? activeCalls : activeCalls.filter(c => c.status === statusFilter);
  const myOfficer = officers.find(o => o.id === currentUser?.id);

  const handleAssignSelf = (callId) => {
    if (!currentUser) return;
    const unitId = myOfficer?.unitId;
    dispatch({ type: 'ASSIGN_UNIT', payload: { callId, unitId } });
    dispatch({ type: 'SET_MY_CALL', payload: callId });
    dispatch({ type: 'SET_STATUS', payload: 'ENRT' });
  };

  const handleClose = (callId) => {
    dispatch({ type: 'CLOSE_CALL', payload: callId });
    if (myCallId === callId) {
      dispatch({ type: 'SET_MY_CALL', payload: null });
      dispatch({ type: 'SET_STATUS', payload: 'AVAILABLE' });
    }
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'Courier New, monospace' }}>
      {/* Status bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ color: '#94a3b8', fontSize: '12px', marginRight: '4px' }}>MY STATUS:</span>
        {['AVAILABLE', 'BUSY', 'UNAVAILABLE', 'OFFDUTY'].map(s => (
          <button
            key={s}
            onClick={() => dispatch({ type: 'SET_STATUS', payload: s })}
            style={{
              background: myOfficer?.status === s ? '#1e4080' : '#0d1f3c',
              border: `1px solid ${myOfficer?.status === s ? '#4a9eff' : '#1e3060'}`,
              borderRadius: '4px', color: myOfficer?.status === s ? '#4a9eff' : '#94a3b8',
              padding: '4px 12px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Courier New, monospace', fontWeight: 600,
            }}
          >
            {s}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
          {['ALL', 'ACTIVE', 'PENDING', 'ENRT'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              style={{ background: statusFilter === f ? '#1e4080' : '#0d1f3c', border: `1px solid ${statusFilter === f ? '#4a9eff' : '#1e3060'}`, borderRadius: '4px', color: statusFilter === f ? '#4a9eff' : '#64748b', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Courier New, monospace' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Calls Table */}
      <SectionHeader title="ACTIVE CALLS" count={filteredCalls.length} />
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#0a1a35' }}>
              {['Call #', 'Nature', 'Location', 'City', 'Priority', 'Status', 'Units', 'Time', 'Actions'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#4a9eff', fontSize: '11px', letterSpacing: '1px', fontWeight: 700, borderBottom: '1px solid #1e4080', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCalls.map((call, idx) => (
              <tr
                key={call.id}
                onClick={() => setSelectedCall(selectedCall?.id === call.id ? null : call)}
                style={{
                  background: selectedCall?.id === call.id ? '#0d2545' : idx % 2 === 0 ? '#080f1e' : '#0a1525',
                  cursor: 'pointer',
                  borderLeft: `3px solid ${PRIORITY_COLORS[call.priority] || '#334155'}`,
                }}
              >
                <td style={{ padding: '7px 10px', color: '#60a5fa', fontWeight: 700 }}>{call.id}</td>
                <td style={{ padding: '7px 10px', color: '#e2e8f0' }}>{call.nature}</td>
                <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{call.location}</td>
                <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{call.city}</td>
                <td style={{ padding: '7px 10px' }}>
                  <span style={{ background: PRIORITY_COLORS[call.priority], color: '#fff', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>P{call.priority}</span>
                </td>
                <td style={{ padding: '7px 10px' }}><StatusBadge status={call.status} /></td>
                <td style={{ padding: '7px 10px', color: '#60a5fa' }}>{call.units.join(', ') || '—'}</td>
                <td style={{ padding: '7px 10px', color: '#475569', fontSize: '11px' }}>{call.timestamp?.split(' ')[1]}</td>
                <td style={{ padding: '7px 10px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <ActionBtn label="Assign" color="#1e4080" onClick={(e) => { e.stopPropagation(); handleAssignSelf(call.id); }} />
                    <ActionBtn label="Close" color="#7f1d1d" onClick={(e) => { e.stopPropagation(); handleClose(call.id); }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Call Detail Panel */}
      {selectedCall && (
        <div style={{ background: '#0d1f3c', border: '1px solid #1e4080', borderRadius: '6px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#4a9eff', fontWeight: 700, fontSize: '14px' }}>CALL DETAIL — {selectedCall.id}</span>
            <button onClick={() => setSelectedCall(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', fontSize: '12px' }}>
            {[
              ['Nature', selectedCall.nature],
              ['Location', selectedCall.location],
              ['City', selectedCall.city],
              ['County', selectedCall.county],
              ['Priority', `P${selectedCall.priority}`],
              ['Status', selectedCall.status],
              ['Reporting Party', selectedCall.reportingParty],
              ['Timestamp', selectedCall.timestamp],
              ['Units Assigned', selectedCall.units.join(', ') || 'None'],
            ].map(([k, v]) => (
              <div key={k}>
                <span style={{ color: '#4a9eff', fontSize: '11px', letterSpacing: '1px' }}>{k}: </span>
                <span style={{ color: '#e2e8f0' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px' }}>
            <span style={{ color: '#4a9eff', fontSize: '11px', letterSpacing: '1px' }}>DESCRIPTION: </span>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>{selectedCall.description}</span>
          </div>
        </div>
      )}

      {/* Units Roster */}
      <SectionHeader title="UNITS ROSTER" count={officers.filter(o => o.status !== 'OFFDUTY').length} />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#0a1a35' }}>
              {['Officer', 'Unit #', 'Status', 'Call #', 'Agency', 'Subdivision', 'Location'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#4a9eff', fontSize: '11px', letterSpacing: '1px', fontWeight: 700, borderBottom: '1px solid #1e4080' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {officers.map((o, idx) => (
              <tr key={o.id} style={{ background: idx % 2 === 0 ? '#080f1e' : '#0a1525' }}>
                <td style={{ padding: '7px 10px', color: '#e2e8f0', fontWeight: o.id === currentUser?.id ? 700 : 400 }}>
                  {o.id === currentUser?.id ? '▶ ' : ''}{o.name}
                </td>
                <td style={{ padding: '7px 10px', color: '#60a5fa' }}>{o.unitId}</td>
                <td style={{ padding: '7px 10px' }}><StatusBadge status={o.status} /></td>
                <td style={{ padding: '7px 10px', color: '#f59e0b' }}>{o.callId || '—'}</td>
                <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{o.deptShort}</td>
                <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{o.subdivision}</td>
                <td style={{ padding: '7px 10px', color: '#475569' }}>{o.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionHeader({ title, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
      <span style={{ color: '#4a9eff', fontSize: '13px', fontWeight: 700, letterSpacing: '2px' }}>{title}</span>
      <span style={{ background: '#1e4080', color: '#4a9eff', borderRadius: '4px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 }}>{count}</span>
      <div style={{ flex: 1, height: '1px', background: '#1e3060' }} />
    </div>
  );
}

function ActionBtn({ label, color, onClick }) {
  return (
    <button onClick={onClick} style={{ background: color, border: 'none', borderRadius: '3px', color: '#fff', padding: '3px 8px', fontSize: '10px', cursor: 'pointer', fontFamily: 'Courier New, monospace', fontWeight: 600 }}>
      {label}
    </button>
  );
}
