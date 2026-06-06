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
  { id: 1, username: 'fartherr',     status: 'ACTIVE',    permissions: ['Admin','Dispatch','Police'], lastLogin: '2026-06-01 15:14', joined: '2025-04-08', discordIds: ['205947291075078247'] },
  { id: 2, username: 'jreeves831',   status: 'ACTIVE',    permissions: ['Police','Supervisor'],       lastLogin: '2026-06-01 14:02', joined: '2025-02-11', discordIds: ['309182746800440531'] },
  { id: 3, username: 'msantos819',   status: 'ACTIVE',    permissions: ['Police'],                    lastLogin: '2026-05-31 22:46', joined: '2025-05-19', discordIds: ['419283746878013440'] },
  { id: 4, username: 'tbrooks422',   status: 'ACTIVE',    permissions: ['Police'],                    lastLogin: '2026-05-30 09:16', joined: '2025-06-23', discordIds: ['520394857504573451'] },
  { id: 5, username: 'cmendes209',   status: 'ACTIVE',    permissions: ['Police','Fire'],             lastLogin: '2026-05-29 18:31', joined: '2025-07-02', discordIds: ['621405968426967632'] },
  { id: 6, username: 'lpark_m3',     status: 'ACTIVE',    permissions: ['Fire','EMS'],                lastLogin: '2026-05-28 11:50', joined: '2025-03-07', discordIds: ['722516079504573451'] },
  { id: 7, username: 'newrecruit44', status: 'SUSPENDED', permissions: [],                            lastLogin: '2026-04-17 19:57', joined: '2026-04-17', discordIds: ['846025956057546792'] },
  { id: 8, username: 'oldmember19',  status: 'BANNED',    permissions: [],                            lastLogin: '2025-12-05 21:16', joined: '2025-01-16', discordIds: ['133596276453074536'] },
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
  { id: 3, name: 'Structure Fire',   event: 'Fire Dispatch',      url: 'tones/fire.mp3',      enabled: false },
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

/* ── Discord → CAD Role Mappings ───────────────────────────────────────────
   Each entry maps one Discord role (identified by its snowflake role ID, to
   be filled in by the backend developer) to a CAD portal and permission level.
   When a user authenticates via Discord OAuth, Steve's backend reads this
   table, finds the highest-priority rule that matches one of their Discord
   roles, and assigns them the corresponding cadPortal + cadRole.

   Priority: higher number wins. If a user holds multiple Discord roles that
   each match a rule, the rule with the greatest priority takes effect.

   discordRoleId is left blank here — fill in the actual Discord snowflake IDs
   from your server's role list before deploying. */
/* ── Management / Admin tier definitions ────────────────────────────────────
   Each tier controls which admin portal sections a management-level user can
   access and which destructive actions they can perform. Higher level = more
   authority. When a user has adminTierId set, their nav is filtered to only
   the sections their tier permits. No tierId = full access (backward compat). */

const _ALL_ON = {
  roleMapping: true, accounts: true, identifiers: true, permissionKeys: true, businesses: true,
  customization: true, customRecords: true, civilianForms: true, helpCenter: true, departments: true,
  callTypes: true, tenCodes: true, statutes: true, licensePoints: true, flags: true,
  logs: true, messageLogs: true, inGame: true, discord: true, limits: true, wipeRecords: true,
  canBanUsers: true, canUnbanUsers: true, canWipeData: true, canManageAdminTiers: true,
};

export const ADMIN_TIERS_DEFAULT = [
  {
    id: 1, name: 'Head Admin', level: 100, color: '#22c55e',
    description: 'Unrestricted access to every section of the admin portal. Can manage all other admin tiers.',
    permissions: { ..._ALL_ON },
  },
  {
    id: 2, name: 'Senior Admin', level: 60, color: '#3a88e8',
    description: 'Broad access to CAD configuration and user management. Cannot touch system config, role mappings, or data wipes.',
    permissions: {
      roleMapping: false, accounts: true, identifiers: true, permissionKeys: false, businesses: true,
      customization: true, customRecords: true, civilianForms: true, helpCenter: true, departments: true,
      callTypes: true, tenCodes: true, statutes: true, licensePoints: true, flags: true,
      logs: true, messageLogs: true, inGame: false, discord: false, limits: false, wipeRecords: false,
      canBanUsers: true, canUnbanUsers: true, canWipeData: false, canManageAdminTiers: false,
    },
  },
  {
    id: 3, name: 'Admin', level: 30, color: '#f59e0b',
    description: 'Moderation-focused. Can ban users, review logs and flags, and manage business records. No configuration access.',
    permissions: {
      roleMapping: false, accounts: true, identifiers: false, permissionKeys: false, businesses: true,
      customization: false, customRecords: false, civilianForms: false, helpCenter: false, departments: false,
      callTypes: false, tenCodes: false, statutes: false, licensePoints: false, flags: true,
      logs: true, messageLogs: true, inGame: false, discord: false, limits: false, wipeRecords: false,
      canBanUsers: true, canUnbanUsers: false, canWipeData: false, canManageAdminTiers: false,
    },
  },
];

export const DISCORD_ROLE_MAPPINGS_DEFAULT = [
  {
    id: 1,  label: 'Community Admin',
    discordRoleName: 'Admin',        discordRoleId: '',
    cadPortal: 'admin',    cadRole: 'admin',
    deptId: null, autoRank: '',
    priority: 100,
    notes: 'Full access to all portals, CAD, and admin configuration.',
  },
  {
    id: 2,  label: 'CAD Dispatcher',
    discordRoleName: 'CAD Dispatcher', discordRoleId: '',
    cadPortal: 'dispatch', cadRole: 'dispatcher',
    deptId: null, autoRank: 'Dispatcher',
    priority: 60,
    notes: 'Access to the full dispatch console, CAD board, and unit management.',
  },
  {
    id: 3,  label: 'HCFR Command',
    discordRoleName: 'HCFR Command',   discordRoleId: '',
    cadPortal: 'fire',     cadRole: 'command',
    deptId: 3,    autoRank: 'Battalion Chief',
    priority: 75,
    notes: 'Fire chiefs and battalion chiefs — grants Command Portal analytics access.',
  },
  {
    id: 4,  label: 'HCFR Supervisor',
    discordRoleName: 'HCFR Supervisor', discordRoleId: '',
    cadPortal: 'fire',     cadRole: 'supervisor',
    deptId: 3,    autoRank: 'Lieutenant',
    priority: 65,
    notes: 'Lieutenants and Captains — can review and approve HCFR reports via Supervisor Portal.',
  },
  {
    id: 5,  label: 'HCFR Personnel',
    discordRoleName: 'HCFR Member',    discordRoleId: '',
    cadPortal: 'fire',     cadRole: 'fire',
    deptId: 3,    autoRank: 'Firefighter/EMT',
    priority: 40,
    notes: 'All active HCFR field personnel. Fire Board, apparatus, EMS calls.',
  },
  {
    id: 6,  label: 'LEO Command',
    discordRoleName: 'LEO Command',    discordRoleId: '',
    cadPortal: 'leo',      cadRole: 'command',
    deptId: null, autoRank: '',
    priority: 75,
    notes: 'Chiefs and command staff across all LEO agencies. Command Portal + Supervisor access.',
  },
  {
    id: 7,  label: 'LEO Supervisor',
    discordRoleName: 'LEO Supervisor', discordRoleId: '',
    cadPortal: 'leo',      cadRole: 'supervisor',
    deptId: null, autoRank: 'Sergeant',
    priority: 65,
    notes: 'Sergeants and above across all LEO agencies. Grants Supervisor Portal review access.',
  },
  {
    id: 8,  label: 'TPD Officer',
    discordRoleName: 'TPD Officer',    discordRoleId: '',
    cadPortal: 'leo',      cadRole: 'officer',
    deptId: 1,    autoRank: 'Officer',
    priority: 40,
    notes: 'Active Tampa Police Department officers.',
  },
  {
    id: 9,  label: 'HCSO Deputy',
    discordRoleName: 'HCSO Deputy',    discordRoleId: '',
    cadPortal: 'leo',      cadRole: 'officer',
    deptId: 2,    autoRank: 'Deputy',
    priority: 40,
    notes: 'Active Hillsborough County Sheriff Deputies.',
  },
  {
    id: 10, label: 'FHP Trooper',
    discordRoleName: 'FHP Trooper',    discordRoleId: '',
    cadPortal: 'leo',      cadRole: 'officer',
    deptId: 4,    autoRank: 'Trooper',
    priority: 40,
    notes: 'Active Florida Highway Patrol troopers.',
  },
  {
    id: 11, label: 'FDOT Employee',
    discordRoleName: 'FDOT',           discordRoleId: '',
    cadPortal: 'dispatch', cadRole: 'dispatcher',
    deptId: 5,    autoRank: 'Road Technician',
    priority: 45,
    notes: 'FDOT field staff — access to tow dispatch console and road ops tools.',
  },
  {
    id: 12, label: 'Tow Operator',
    discordRoleName: 'Tow Company',    discordRoleId: '',
    cadPortal: 'civilian', cadRole: 'civilian',
    deptId: null, autoRank: '',
    priority: 20,
    notes: 'Tow company employees — sign on via the Tow CAD (/tow-cad) after login.',
  },
  {
    id: 13, label: 'Whitelisted Member',
    discordRoleName: 'Whitelisted',    discordRoleId: '',
    cadPortal: 'civilian', cadRole: 'civilian',
    deptId: null, autoRank: '',
    priority: 10,
    notes: 'Default role granted after whitelist approval. Civilian portal access only.',
  },
];
