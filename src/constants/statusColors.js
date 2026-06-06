export const STATUS_COLORS = {
  AVAILABLE:   '#4ade80',
  ENRT:        '#a78bfa',
  BUSY:        '#f87171',
  ARRVD:       '#4ade80',
  UNAVAILABLE: '#e879f9',
  OFFDUTY:     '#94a3b8',
};

export const STATUS_LABELS = {
  AVAILABLE:   'AVL',
  ENRT:        'ENRT',
  BUSY:        'BUSY',
  ARRVD:       'ARRVD',
  UNAVAILABLE: 'UNAVL',
  OFFDUTY:     'OFD',
};

/* Business operational status — owner-settable, shown as the user-chip dot
   and on business profile pages. Stored on the business as `opStatus`. */
export const BUSINESS_STATUSES = [
  { code: 'OPEN',      label: 'Open',             color: '#4ade80' },
  { code: 'BUSY',      label: 'Busy',             color: '#f5a93b' },
  { code: 'APPT_ONLY', label: 'Appointment Only', color: '#a78bfa' },
  { code: 'HIRING',    label: 'Hiring',           color: '#3a88e8' },
  { code: 'CLOSED',    label: 'Closed',           color: '#94a3b8' },
];

export const DEFAULT_BUSINESS_STATUS = 'OPEN';

export const BUSINESS_STATUS_COLORS = Object.fromEntries(
  BUSINESS_STATUSES.map(s => [s.code, s.color]),
);
export const BUSINESS_STATUS_LABELS = Object.fromEntries(
  BUSINESS_STATUSES.map(s => [s.code, s.label]),
);
