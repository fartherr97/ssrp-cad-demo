const STATUS_COLORS = {
  AVAILABLE: '#22c55e',
  AVAIL: '#22c55e',
  ENRT: '#22c55e',
  BUSY: '#f59e0b',
  PENDING: '#f59e0b',
  UNAVAILABLE: '#ef4444',
  UNAVAIL: '#ef4444',
  ACTIVE: '#ef4444',
  EMERGENCY: '#ef4444',
  OFFDUTY: '#6b7280',
  OFF_DUTY: '#6b7280',
  CLOSED: '#6b7280',
  ACTIVE_WARRANT: '#ef4444',
  SUSPENDED: '#ef4444',
  EXPIRED: '#f59e0b',
  VALID: '#22c55e',
  SERVED: '#6b7280',
  APPROVED: '#22c55e',
  DENIED: '#ef4444',
  SUBMITTED: '#f59e0b',
  'PENDING REVIEW': '#f59e0b',
  CAUTION: '#f59e0b',
  WARRANT: '#ef4444',
  VIOLENT: '#ef4444',
  HIGH: '#ef4444',
  NORMAL: '#6b7280',
  HOLD: '#f59e0b',
  RELEASED: '#22c55e',
  Active: '#ef4444',
  Expired: '#6b7280',
  Lifted: '#6b7280',
};

export default function StatusBadge({ status, style }) {
  const key = typeof status === 'string' ? status.toUpperCase().replace(/ /g,'_') : '';
  const color = STATUS_COLORS[status] || STATUS_COLORS[key] || '#6b7280';
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 700,
      letterSpacing: '0.05em',
      color: '#fff',
      backgroundColor: color,
      border: `1px solid ${color}`,
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {status}
    </span>
  );
}
