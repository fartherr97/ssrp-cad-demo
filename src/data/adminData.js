/* Seed data for the Sonoran-style Admin Customization suite. */

export const CALL_NATURES_DEFAULT = [
  { id: 101, name: 'Traffic Stop',             category: 'police' },
  { id: 102, name: 'Suspicious Person',         category: 'police' },
  { id: 103, name: 'Suspicious Vehicle',        category: 'police' },
  { id: 104, name: 'Domestic Disturbance',      category: 'police' },
  { id: 105, name: 'Assault',                   category: 'police' },
  { id: 106, name: 'Robbery',                   category: 'police' },
  { id: 107, name: 'Burglary',                  category: 'police' },
  { id: 108, name: 'MVA',                       category: 'police' },
  { id: 109, name: 'MVA w/ Injuries',           category: 'fire'   },
  { id: 110, name: 'Medical Emergency',         category: 'fire'   },
  { id: 111, name: 'Medical - Cardiac Arrest',  category: 'fire'   },
  { id: 112, name: 'Structure Fire',            category: 'fire'   },
  { id: 113, name: 'Vehicle Fire',              category: 'fire'   },
  { id: 114, name: 'Brush Fire',                category: 'fire'   },
  { id: 115, name: 'Officer Needs Assistance',  category: 'police' },
  { id: 116, name: 'Pursuit',                   category: 'police' },
  { id: 117, name: 'Noise Complaint',           category: 'police' },
  { id: 118, name: 'Check Welfare',             category: 'police' },
  { id: 119, name: 'Armed Subject',             category: 'police' },
  { id: 120, name: 'Shooting',                  category: 'police' },
  { id: 121, name: 'Stabbing',                  category: 'police' },
  { id: 122, name: 'Shots Fired',               category: 'police' },
  { id: 123, name: 'Drug Activity',             category: 'police' },
  { id: 124, name: 'Theft - Shoplifting',       category: 'police' },
  { id: 125, name: 'Road Hazard',               category: 'police' },
  { id: 126, name: 'Trespassing',               category: 'police' },
  { id: 127, name: 'Hazmat Incident',           category: 'fire'   },
  { id: 128, name: 'Missing Person',            category: 'police' },
  { id: 129, name: 'DUI Driver',                category: 'police' },
  { id: 130, name: 'Other',                     category: 'any'    },
];

export const TEN_CODES = [
  { id: 1,  code: '10-1',   label: 'Receiving Poorly' },
  { id: 2,  code: '10-2',   label: 'Receiving Well' },
  { id: 3,  code: '10-3',   label: 'Stop Transmitting' },
  { id: 4,  code: '10-4',   label: 'OK / Acknowledgment' },
  { id: 5,  code: '10-5',   label: 'Relay Radio Information' },
  { id: 6,  code: '10-6',   label: 'Busy' },
  { id: 7,  code: '10-7',   label: 'Out of Service' },
  { id: 8,  code: '10-8',   label: 'In Service' },
  { id: 9,  code: '10-9',   label: 'Repeat' },
  { id: 10, code: '10-10',  label: 'Out of Service, Subject to Calls' },
  { id: 11, code: '10-11',  label: 'Dispatching Too Rapidly' },
  { id: 12, code: '10-12',  label: 'Visitor or Official Present' },
  { id: 13, code: '10-13',  label: 'Conditions' },
  { id: 14, code: '10-15',  label: 'Prisoner in Custody' },
  { id: 15, code: '10-18',  label: 'Complete Assignment Quickly' },
  { id: 16, code: '10-19',  label: 'Return to Station / Office' },
  { id: 17, code: '10-20',  label: 'Location' },
  { id: 18, code: '10-22',  label: 'Disregard' },
  { id: 19, code: '10-23',  label: 'Standby' },
  { id: 20, code: '10-24',  label: 'TROUBLE * Send Help' },
  { id: 21, code: '10-76',  label: 'En Route' },
  { id: 22, code: '10-97',  label: 'Arrived on Scene' },
];

/* Charge types, bond types and statutes now live in the unified `penalCode`
   slice (mockData.PENAL_CODE), edited via the admin Penal Code / Statutes
   section. That single source feeds report charges, the citizen Laws page
   and the license-points engine. */

export const UNIT_STATUS_CODES = [
  { id: 1, code: 'AVAILABLE',   label: 'Available',    color: '#22ff66' },
  { id: 2, code: 'ENRT',        label: 'En Route',     color: '#ffd700' },
  { id: 3, code: 'BUSY',        label: 'Busy',         color: '#ff3333' },
  { id: 4, code: 'ARRVD',       label: 'On Scene',     color: '#22ccff' },
  { id: 5, code: 'UNAVAILABLE', label: 'Unavailable',  color: '#cc44ff' },
  { id: 6, code: 'OFFDUTY',     label: 'Off Duty',     color: '#888888' },
];

export const ADMIN_ACCOUNTS = [
  { id: 1, username: 'fartherr',     status: 'ACTIVE',    permissions: ['Admin','Dispatch','Police'], lastLogin: '2026-06-01 15:14', joined: '2025-04-08', apiIds: ['205947291075078247'] },
  { id: 2, username: 'jreeves831',   status: 'ACTIVE',    permissions: ['Police','Supervisor'],       lastLogin: '2026-06-01 14:02', joined: '2025-02-11', apiIds: ['309182746800440531'] },
  { id: 3, username: 'msantos819',   status: 'ACTIVE',    permissions: ['Police'],                    lastLogin: '2026-05-31 22:46', joined: '2025-05-19', apiIds: ['419283746878013440'] },
  { id: 4, username: 'tbrooks422',   status: 'ACTIVE',    permissions: ['Police'],                    lastLogin: '2026-05-30 09:16', joined: '2025-06-23', apiIds: ['520394857504573451'] },
  { id: 5, username: 'cmendes209',   status: 'ACTIVE',    permissions: ['Police','Fire'],             lastLogin: '2026-05-29 18:31', joined: '2025-07-02', apiIds: ['621405968426967632'] },
  { id: 6, username: 'lpark_m3',     status: 'ACTIVE',    permissions: ['Fire','EMS'],                lastLogin: '2026-05-28 11:50', joined: '2025-03-07', apiIds: ['722516079504573451'] },
  { id: 7, username: 'newrecruit44', status: 'SUSPENDED', permissions: [],                            lastLogin: '2026-04-17 19:57', joined: '2026-04-17', apiIds: ['846025956057546792'] },
  { id: 8, username: 'oldmember19',  status: 'BANNED',    permissions: [],                            lastLogin: '2025-12-05 21:16', joined: '2025-01-16', apiIds: ['133596276453074536'] },
];

export const PERMISSION_KEYS = [
  { id: 1, name: 'Admin',      scope: 'Full administrative access', members: 3 },
  { id: 2, name: 'Dispatch',   scope: 'Dispatch console + CAD',     members: 6 },
  { id: 3, name: 'Police',     scope: 'Law enforcement MDT',        members: 24 },
  { id: 4, name: 'Fire',       scope: 'Fire & EMS operations',      members: 9 },
  { id: 5, name: 'Supervisor', scope: 'Approve reports, manage units', members: 4 },
  { id: 6, name: 'Civilian',   scope: 'Civilian portal access',     members: 142 },
];

export const QUICK_LINKS = [
  { id: 1, label: 'Community Discord', url: 'https://discord.gg/ssrp' },
  { id: 2, label: 'Department SOPs',   url: 'https://ssrp.us/sops' },
  { id: 3, label: 'Penal Code Wiki',   url: 'https://ssrp.us/penal' },
  { id: 4, label: 'Staff Portal',      url: 'https://ssrp.us/staff' },
];

export const NOTIFICATION_TONES = [
  { id: 1, name: 'Dispatch Alert',   event: 'New Call Assigned',  url: 'tones/dispatch.mp3',  enabled: true },
  { id: 2, name: 'Panic Button',     event: 'Officer Panic',      url: 'tones/panic.mp3',     enabled: true },
  { id: 3, name: 'BOLO Broadcast',   event: 'BOLO Issued',        url: 'tones/bolo.mp3',      enabled: true },
  { id: 4, name: 'Structure Fire',   event: 'Fire Dispatch',      url: 'tones/fire.mp3',      enabled: false },
];

export const ADMIN_SERVERS = [
  { id: 1, name: 'SSRP * Primary',  description: 'Main FiveM roleplay server. Max 128 players.' },
  { id: 2, name: 'SSRP * Overflow', description: 'Secondary server for player overflow. Max 64 players.' },
  { id: 3, name: 'SSRP * Staff',    description: 'Staff-only testing and development server.' },
];

export const LOOKUP_TYPES = [
  { id: 1, category: 'Hair Color',  values: ['Black','Brown','Blonde','Red','Gray','Bald'] },
  { id: 2, category: 'Eye Color',   values: ['Brown','Blue','Green','Hazel','Gray'] },
  { id: 3, category: 'Vehicle Color', values: ['Black','White','Silver','Red','Blue','Green'] },
  { id: 4, category: 'License Class', values: ['Class A','Class B','Class C','CDL','Motorcycle'] },
];

export const ADMIN_ADDRESSES = [
  { id: 1, name: 'City Hall',        street: '315 E Kennedy Blvd', area: 'Downtown Tampa', postal: '33602' },
  { id: 2, name: 'Tampa PD HQ',      street: '411 N Franklin St',  area: 'Downtown Tampa', postal: '33602' },
  { id: 3, name: 'County Jail',      street: '520 N Falkenburg Rd',area: 'Brandon',        postal: '33619' },
  { id: 4, name: 'General Hospital', street: '1 Tampa General Cir',area: 'Davis Islands',  postal: '33606' },
];

/* Config objects (single-record editors) */
export const COMMUNITY_CONFIG = {
  name: 'Sunshine State Roleplay',
  communityId: 'ssrp',
  ownerDiscord: 'fartherr#0001',
  timezone: 'America/New_York (EST)',
  defaultLanguage: 'English (US)',
  maxCharacters: 5,
  description: 'Florida-based serious roleplay community * emergency services, civilian operations, and command.',
  logoUrl: 'https://cdn.ssrp.us/images/ssrp.png',
  subtitle: 'Florida-Based Serious Roleplay',
  website: 'https://ssrp.us',
  websiteEnabled: true,
  discord: 'https://discord.gg/ssrp',
  discordEnabled: true,
  voiceCommandKeyword: 'CAD',
};

export const GEO_SETTINGS = {
  cities: ['Tampa', 'Brandon', 'Plant City', 'Riverview', 'Unincorporated'],
  counties: ['Hillsborough County', 'Pinellas County', 'Pasco County'],
  postals: ['33602', '33606', '33610', '33619', '33647'],
  emergencyCode: '911',
  penalCodeName: 'Statutes',
  tenCodeName: '10-Codes',
  currencyDelimiter: '$',
};

export const LOGIN_PAGE_CONFIG = {
  title: 'Sunshine State Roleplay',
  subtitle: 'Computer Aided Dispatch',
  description: 'Unified platform for Emergency Services, Civilian Operations, and Command * TPD, HCSO, FHP, HCFR, FDOT, and Civ-Ops.',
  logoUrl: 'https://cdn.ssrp.us/images/ssrp.png',
  primaryColor: '#3a88e8',
  backgroundStyle: 'Gradient (Deep Blue)',
  showDiscordConnect: true,
  customDomains: ['cad.ssrp.us'],
};

export const ACCOUNT_RESTRICTIONS = {
  requireWhitelist: true,
  minAccountAgeDays: 30,
  requireDiscordLink: true,
  require2FA: false,
  blockNewRegistrations: false,
  autoBanThreshold: 3,
};

export const DISCORD_PRESENCE = {
  enabled: true,
  clientId: '1234567890123456789',
  iconName: 'ssrp_logo',
  details: 'On Duty * {department}',
  state: 'Unit {callsign}',
  largeImage: 'ssrp_logo',
  showElapsed: true,
  buttons: [
    { label: 'Join Community', url: 'https://discord.gg/ssrp' },
    { label: 'Community Website', url: 'https://ssrp.us' },
  ],
};

export const LIMITS_CONFIG = {
  maxCivilianCharacters: 0,
};
