import { STATUS_COLORS as UNIT_STATUS_COLORS } from '../constants/statusColors';

const STATUS_COLORS = {
  AVAILABLE: UNIT_STATUS_COLORS.AVAILABLE,
  AVAIL:     UNIT_STATUS_COLORS.AVAILABLE,
  ENRT:      UNIT_STATUS_COLORS.ENRT,
  BUSY:      UNIT_STATUS_COLORS.BUSY,
  ARRVD:     UNIT_STATUS_COLORS.ARRVD,
  UNAVAILABLE: UNIT_STATUS_COLORS.UNAVAILABLE,
  UNAVAIL:   UNIT_STATUS_COLORS.UNAVAILABLE,
  OFFDUTY:   UNIT_STATUS_COLORS.OFFDUTY,
  OFF_DUTY:  UNIT_STATUS_COLORS.OFFDUTY,
  PENDING: '#f59e0b',
  ACTIVE: '#ef4444',
  EMERGENCY: '#ef4444',
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
