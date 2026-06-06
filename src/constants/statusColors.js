export const STATUS_COLORS = {
  AVAILABLE:   '#4ade80',
  ENRT:        '#a78bfa',
  BUSY:        '#f87171',
  // ON SCENE / arrived — distinct teal so it is never confused with the green
  // AVAILABLE status (they used to share #4ade80, which read as a bug).
  ARRVD:       '#2dd4bf',
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

