import { createContext, useContext, useReducer } from 'react';
import {
  OFFICERS, CALLS, CIVILIANS, VEHICLES, WARRANTS, CRIMINAL_HISTORY,
  PENAL_CODE, REPORTS, REPORT_TEMPLATES, BANNED_USERS, AUDIT_LOG,
  MESSAGES, MESSAGE_LOG, CUSTOM_RECORD_TYPES, TOW_LOGS, DEPARTMENTS, WHITELIST_APPS, ACTIVE_SESSIONS,
  BUSINESSES, RECORD_TEMPLATES, INCOMING_911, UNIT_GROUPS, CALL_RESPONSE_LOGS, FDOT_PERMITS,
  CASE_FILES,
} from '../data/mockData';
import { DEFAULT_HELP_CONTENT } from '../data/helpDefaults';
import { CIVILIAN_FORMS_DEFAULT } from '../data/civilianFormsDefaults';
import {
  TEN_CODES, UNIT_STATUS_CODES,
  ADMIN_ACCOUNTS, PERMISSION_KEYS, QUICK_LINKS, NOTIFICATION_TONES,
  ADMIN_SERVERS, LOOKUP_TYPES, ADMIN_ADDRESSES, COMMUNITY_CONFIG,
  GEO_SETTINGS, LOGIN_PAGE_CONFIG, ACCOUNT_RESTRICTIONS, DISCORD_PRESENCE,
  LIMITS_CONFIG, CALL_NATURES_DEFAULT, DISCORD_ROLE_MAPPINGS_DEFAULT, ADMIN_TIERS_DEFAULT,
} from '../data/adminData';

/* ── Subdivision duty-hour tracking ───────────────────────────────────────
   Time accrues while an officer is on duty (any status except OFFDUTY) under a
   specialised subdivision * anything other than "Patrol". We bank elapsed
   seconds into the subdivision they were accrued under on each transition and
   keep a running start stamp; a subdivision's live total is its banked seconds
   plus (now − start) for whoever is currently clocked into it.

   Only the active session's officer runs a live clock (started via DUTY_SYNC);
   everyone else shows their banked baseline. An idle guard in the app auto-sets
   the current officer OFFDUTY after inactivity so nobody farms hours by leaving
   the CAD open while not actually playing. */
const DUTY_TRACKED = (sub) => !!sub && sub !== 'Patrol';

function syncDutyClock(o, now = Date.now()) {
  const tracking = o.status !== 'OFFDUTY' && DUTY_TRACKED(o.subdivision);
  let next = o;
  // Bank any running time into the subdivision it was accrued under.
  if (o.dutyClockStart != null) {
    const elapsed = Math.floor((now - o.dutyClockStart) / 1000);
    const sub = o.dutyClockSubdiv;
    if (elapsed > 0 && sub) {
      next = { ...next, dutyBySubdiv: { ...(next.dutyBySubdiv || {}), [sub]: (next.dutyBySubdiv?.[sub] || 0) + elapsed } };
    }
    next = { ...next, dutyClockStart: null, dutyClockSubdiv: null };
  }
  // (Re)start the clock if the officer is currently in a tracked state.
  if (tracking) {
    next = { ...next, dutyClockStart: now, dutyClockSubdiv: o.subdivision };
  }
  return next;
}

// Believable baseline hours (this week) per specialised subdivision so the
// Command Portal reads as populated in the demo. Patrol is never tracked.
const _DUTY_SEED_HOURS = {
  Command: 21, Detectives: 18, K9: 26, Traffic: 31, Engine: 28,
  Ladder: 24, Rescue: 30, Hazmat: 16, 'Road Ops': 27, Dispatch: 14,
};
function seedDutyOfficers(officers) {
  return officers.map(o => {
    const base = { ...o, dutyBySubdiv: {}, dutyClockStart: null, dutyClockSubdiv: null };
    if (!DUTY_TRACKED(o.subdivision)) return base;
    const seedH = (_DUTY_SEED_HOURS[o.subdivision] ?? 12) + ((o.id * 7) % 9) - 4;
    return { ...base, dutyBySubdiv: { [o.subdivision]: Math.max(1, seedH) * 3600 } };
  });
}

/* ── Template snapshots ───────────────────────────────────────────────────
   A filed report/record stores a frozen copy of the template it was written
   against, so it always renders with its original structure even after the
   template is later edited, renamed or deleted. This is purely about how the
   record is *rendered* — editing fields, supplements and officer/supervisor
   sign-off still operate on the record's own data and signatures, so every
   workflow stays functionally identical. */
const cloneTemplate = (t) => (t ? JSON.parse(JSON.stringify(t)) : null);
const snapshotFor = (templates, name, existing) =>
  existing || cloneTemplate((templates || []).find(t => t.name === name));

const initialState = {
  currentUser: null,
  currentPage: 'login',
  discordConnected: false,
  discordAccount: null,
  selfDispatch: false,
  officers: seedDutyOfficers(OFFICERS),
  // Stamp each seed call with a staggered creation time (most recent first) so
  // the live elapsed-time clocks in the console read realistically.
  calls: CALLS.map((c, i) => ({ ...c, createdAt: Date.now() - (i * 6 + 3) * 60000 })),
  callLogs: CALL_RESPONSE_LOGS,
  civilians: CIVILIANS,
  vehicles: VEHICLES,
  warrants: WARRANTS,
  criminalHistory: CRIMINAL_HISTORY,
  penalCode: PENAL_CODE,
  reports: REPORTS.map(r => ({ ...r, templateSnapshot: snapshotFor(REPORT_TEMPLATES, r.type, r.templateSnapshot) })),
  records: [],
  reportTemplates: REPORT_TEMPLATES,
  recordTemplates: RECORD_TEMPLATES,
  // Admin-configurable civilian-facing form schemas (DL, vehicle reg, character, medical)
  civilianForms: CIVILIAN_FORMS_DEFAULT,
  bannedUsers: BANNED_USERS,
  auditLog: AUDIT_LOG,
  messages: MESSAGES,
  directMessages: [],
  groupThreads: [],
  messageLog: MESSAGE_LOG,
  lastBlast: null,
  notifications: [],
  wipeBackups: [],   // auto-saved snapshots from admin Wipe Records (restorable)
  audioTones: { toastUrl: null, toastName: null, panicUrl: null, panicName: null },
  customRecordTypes: CUSTOM_RECORD_TYPES,
  towLogs: TOW_LOGS,
  towJobs: [],
  towUnits: [],
  // LEO → FDOT assistance requests (seed one tied to the active MVA call)
  fdotRequests: [
    {
      id: 'FDOT-2601', assistType: 'Vehicle Recovery',
      location: 'I-4 EB / MLK Blvd', postal: '347', priority: 1,
      description: '3-vehicle collision, one vehicle overturned blocking the inside lane. Need recovery + lane closure for clearance.',
      callId: '26-1046', callNature: 'MVA w/ Injuries',
      requestedBy: 'Amanda Torres', requestedByBadge: 'FHP-214', requestedByUnit: 'FHP-214',
      status: 'PENDING', createdAt: Date.now() - 8 * 60000,
    },
  ],
  // LEO → HCFR assistance requests (seed one tied to the domestic call)
  hcfrRequests: [
    {
      id: 'HCFR-2601', assistType: 'Medical Assist',
      location: '412 Oakwood Ave', postal: '348', priority: 1,
      description: 'Subject on scene may have sustained injuries during domestic incident. Requesting EMS evaluation before transport.',
      callId: '26-1043', callNature: 'Domestic Disturbance',
      requestedBy: 'James Reeves', requestedByBadge: 'TPD-831', requestedByUnit: 'TPD-831',
      status: 'PENDING', createdAt: Date.now() - 5 * 60000,
    },
  ],
  departments: DEPARTMENTS,
  whitelistApps: WHITELIST_APPS,
  activeSessions: ACTIVE_SESSIONS,
  businesses: BUSINESSES,
  permits: FDOT_PERMITS,
  incoming911: INCOMING_911,
  incoming911HCFR: [],
  civilian911Log: [],
  // Requests that could not be delivered because their receiver (business or
  // routing-role department) no longer exists. Steve's backend should monitor
  // this queue and alert ops staff. Items are never auto-discarded.
  unroutedRequests: [],
  unitGroups: UNIT_GROUPS,
  // ─── Admin customization config ───
  callNatures: CALL_NATURES_DEFAULT,
  tenCodes: TEN_CODES,
  unitStatusCodes: UNIT_STATUS_CODES,
  adminAccounts: ADMIN_ACCOUNTS,
  permissionKeys: PERMISSION_KEYS,
  quickLinks: QUICK_LINKS,
  notificationTones: NOTIFICATION_TONES,
  adminServers: ADMIN_SERVERS,
  lookupTypes: LOOKUP_TYPES,
  adminAddresses: ADMIN_ADDRESSES,
  communityConfig: COMMUNITY_CONFIG,
  helpContent: DEFAULT_HELP_CONTENT,
  geoSettings: GEO_SETTINGS,
  loginPageConfig: LOGIN_PAGE_CONFIG,
  accountRestrictions: ACCOUNT_RESTRICTIONS,
  discordPresence: DISCORD_PRESENCE,
  limitsConfig: LIMITS_CONFIG,
  discordRoleMappings: DISCORD_ROLE_MAPPINGS_DEFAULT,
  adminTiers: ADMIN_TIERS_DEFAULT,
  caseFiles: CASE_FILES,
  inGameConfig: {
    apiKey: 'a3f9e2b1-7c84-4d56-b012-9e3a7f2c10d8',
    liveMapEnabled: true,
    staticUrlOnly: false,
    mapType: 'CUSTOM',
    liveMapServers: [
      { id: 1, name: 'Server 1', ip: '40.160.51.62', gamePort: 30120, outboundIp: '' },
      { id: 2, name: 'Server 2', ip: '40.160.51.62', gamePort: 30121, outboundIp: '' },
      { id: 3, name: 'Server 3', ip: '40.160.51.62', gamePort: 30122, outboundIp: '' },
    ],
  },
  // ─── Custom civilian flags ───
  customFlags: [
    { id: 'WARRANT',  name: 'Warrant',          color: '#ef4444', description: 'Active arrest warrant on file' },
    { id: 'VIOLENT',  name: 'Violent',           color: '#dc2626', description: 'History of violent behavior' },
    { id: 'CAUTION',  name: 'Caution',           color: '#f59e0b', description: 'Exercise caution when approaching' },
    { id: 'FELON',    name: 'Felon',             color: '#f97316', description: 'Convicted felon' },
    { id: 'GANG',     name: 'Gang Affiliation',  color: '#a855f7', description: 'Known gang member or associate' },
    { id: 'ARMED',    name: 'Armed & Dangerous', color: '#b91c1c', description: 'May be armed, approach with caution' },
    { id: 'PAROLE',   name: 'On Parole',         color: '#3b82f6', description: 'Currently on parole or probation' },
    { id: 'MENTAL',   name: 'Mental Health',     color: '#06b6d4', description: 'Known mental health concerns' },
  ],
  uniqueIdentifiers: {
    civilian: ['ssn', 'dlNumber'],
    vehicle: ['plate'],
  },
  // ─── Auto license-suspension engine (configurable in Admin) ───
  licensePointsConfig: {
    enabled: true,
    threshold: 12,        // legacy single threshold (kept for back-compat)
    suspensionDays: 90,
    resetAfterSuspend: false,
    // Escalating suspension thresholds — a driver is re-suspended (for longer)
    // as their points climb past each tier. Admin can add/remove tiers.
    tiers: [
      { id: 'lt1', threshold: 12, suspensionDays: 90 },
      { id: 'lt2', threshold: 18, suspensionDays: 180 },
      { id: 'lt3', threshold: 24, suspensionDays: 365 },
    ],
    schedule: [
      { id: 'v1', label: 'Speeding (1–15 over)',   points: 3 },
      { id: 'v2', label: 'Speeding (16+ over)',    points: 4 },
      { id: 'v3', label: 'Running Red Light',      points: 4 },
      { id: 'v4', label: 'Improper Lane Change',   points: 2 },
      { id: 'v5', label: 'Reckless Driving',       points: 6 },
      { id: 'v6', label: 'No Insurance',           points: 5 },
      { id: 'v7', label: 'DUI',                    points: 12 },
    ],
  },
  myCallId: null,
  nextId: 1000,
  // Sequential report/record number. Every report or record filed through the
  // CAD is stamped with the next value, zero-padded to 4 digits * the first
  // one ever submitted is 0001 and it climbs from there.
  reportSeq: 1,
  // Radio broadcast counters drive the MDT nav badge + toast. `radioCount` is
  // the running total of dispatcher radio broadcasts; `radioSeen` is how many
  // the current viewer has acknowledged (by opening the MDT Radio feed).
  radioCount: 0,
  radioSeen: 0,
  lastRadio: null,
  panicAlert: null,
  // Every unresolved officer panic, newest first * drives the Active Panics
  // panel so LEOs can reference a panic after its toast is gone.
  activePanics: [],
  dispatchLog: [
    { id: 'seed-6', time: '15:04:11', kind: 'call',   text: 'Call 26-1051 created, Road Hazard (I-275 SB / Sligh Ave)' },
    { id: 'seed-5', time: '15:01:44', kind: 'call',   text: 'Call 26-1050 created, Theft / Shoplifting (4302 W Boy Scout Blvd)' },
    { id: 'seed-4', time: '14:52:00', kind: 'alert',  text: 'Call 26-1048, CARDIAC ARREST. 210 Bayshore Blvd Apt 4B. ALS required.' },
    { id: 'seed-3', time: '14:45:22', kind: 'unit',   text: 'Unit FHP-214 dispatched to 26-1046 (MVA w/ Injuries)' },
    { id: 'seed-2', time: '14:35:18', kind: 'unit',   text: 'Units HCFR-E11, HCFR-L7, HCFR-M3 dispatched to 26-1044 (Structure Fire)' },
    { id: 'seed-1', time: '14:22:04', kind: 'call',   text: 'Call 26-1042 created, Traffic Stop (Elm St / Route 9)' },
    { id: 'seed-0', time: '14:05:11', kind: 'alert',  text: 'BOLO, Black Dodge Charger plate SUS-1109. Owner has active warrant. No approach without backup.' },
  ],
};

const nowTime = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

// Append a line to the live dispatch (TX) log. `kind` drives the color of the
// entry in the console feed: call | unit | status | alert | info.
function addDispatchLog(state, text, kind = 'info') {
  const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, time: nowTime(), text, kind };
  return { dispatchLog: [entry, ...state.dispatchLog].slice(0, 250) };
}

function addSystemNotif(state, { title, body, color = '#f59e0b' }) {
  const entry = { id: `notif-sys-${Date.now()}`, title, body, sender: 'System', color, time: nowTime(), read: false };
  return { notifications: [entry, ...state.notifications] };
}

function addAuditEntry(state, action, module) {
  const user = state.currentUser;
  const entry = {
    id: state.nextId,
    user: user ? `${user.name} (${user.badge || user.role})` : 'System',
    discordId: user?.discordId || '',
    action,
    timestamp: new Date().toLocaleString(),
    module,
  };
  return { auditLog: [entry, ...state.auditLog], nextId: state.nextId + 1 };
}

/* Mark one or more warrants SERVED — stamping who/when (+ optional case number)
   and clearing each affected civilian's WARRANT flag once they have no ACTIVE
   warrants left. Shared by the manual SERVE_WARRANT action and the auto-serve
   that fires when a report/record links a warrant. Returns the next warrants +
   civilians slices; already-served warrants are left untouched. */
function serveWarrants(state, ids, { servedBy = '', caseNumber = '' } = {}) {
  const idSet = new Set(ids);
  if (idSet.size === 0) return { warrants: state.warrants, civilians: state.civilians };
  const servedDate = new Date().toISOString().split('T')[0];
  const warrants = state.warrants.map(w =>
    idSet.has(w.id) && w.status === 'ACTIVE'
      ? { ...w, status: 'SERVED', servedBy: servedBy || w.servedBy || '', servedDate,
          ...(caseNumber ? { servedCaseNumber: caseNumber } : {}) }
      : w
  );
  const affectedCivIds = new Set(
    state.warrants.filter(w => idSet.has(w.id) && w.civilianId != null).map(w => w.civilianId)
  );
  let civilians = state.civilians;
  if (affectedCivIds.size) {
    civilians = state.civilians.map(c => {
      if (!affectedCivIds.has(c.id)) return c;
      const stillActive = warrants.some(w => w.civilianId === c.id && w.status === 'ACTIVE');
      return stillActive ? c : { ...c, flags: (c.flags || []).filter(f => f !== 'WARRANT') };
    });
  }
  return { warrants, civilians };
}

/* Collect the warrant ids linked on a filed report/record: scans the template
   snapshot for warrant_lookup fields and reads the warrantId off each chip. */
function linkedWarrantIds(templateSnapshot, formData = {}) {
  const ids = [];
  for (const sec of templateSnapshot?.sections || []) {
    for (const f of sec.fields || []) {
      if (f.type === 'warrant_lookup' && Array.isArray(formData[f.id])) {
        formData[f.id].forEach(chip => { if (chip && chip.warrantId != null) ids.push(chip.warrantId); });
      }
    }
  }
  return [...new Set(ids)];
}

/* Officer signature line (badge | rank | name) used to stamp who served a warrant. */
function officerSignatureFor(state, badge) {
  const o = state.officers.find(off => off.badge === badge);
  return o
    ? `${o.badge} | ${(o.rank || o.role || 'OFFICER').toUpperCase()} | ${o.name.toUpperCase()}`
    : (badge || '');
}

function baseReducer(state, action) {
  switch (action.type) {
    case 'CONNECT_DISCORD':
      return { ...state, discordConnected: true, discordAccount: action.payload || state.discordAccount };
    case 'TOGGLE_SELF_DISPATCH':
      return { ...state, selfDispatch: !state.selfDispatch };
    case 'LOGIN':
      return { ...state, currentUser: action.payload, currentPage: 'dispatch', discordConnected: true };
    case 'EXIT_TO_HOME':
      // Return to the portal-selection screen * drop the active role but keep
      // the Discord connection so the role grid is shown immediately.
      return { ...state, currentUser: null, currentPage: 'login', myCallId: null, selfDispatch: false, discordConnected: true };
    case 'LOGOUT':
      return { ...state, currentUser: null, currentPage: 'login', myCallId: null, selfDispatch: false, discordConnected: false };
    case 'SET_SIGNATURE':
      return { ...state, currentUser: { ...state.currentUser, signature: action.payload } };

    case 'UPDATE_CURRENT_USER':
      // Merge a patch into the logged-in account (display name, avatar,
      // notification prefs, etc.). Used by the civilian My Account page.
      return { ...state, currentUser: { ...state.currentUser, ...action.payload } };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };

    case 'DUTY_SYNC': {
      // Reconcile the current officer's duty clock (e.g. on login or focus) so a
      // tracked on-duty officer starts accruing without needing a status change.
      if (!state.currentUser?.id) return state;
      const officers = state.officers.map(o =>
        o.id === state.currentUser.id ? syncDutyClock(o) : o
      );
      return { ...state, officers };
    }
    case 'SET_STATUS': {
      const me = state.officers.find(o => o.id === state.currentUser?.id);
      const officers = state.officers.map(o =>
        o.id === state.currentUser?.id ? syncDutyClock({ ...o, status: action.payload }) : o
      );
      const audit = addAuditEntry(state, `Status changed to ${action.payload}`, 'CAD');
      const log = me ? addDispatchLog(state, `Unit ${me.unitId} (${me.name}) → ${action.payload}`, 'status') : {};
      return { ...state, officers, ...audit, ...log };
    }

    case 'PATCH_OFFICER': {
      const prev = state.officers.find(o => o.id === state.currentUser?.id);
      const officers = state.officers.map(o =>
        o.id === state.currentUser?.id ? syncDutyClock({ ...o, ...action.payload }) : o
      );
      const next = officers.find(o => o.id === state.currentUser?.id);
      const statusChanged = prev?.status !== next?.status;
      const log = next ? addDispatchLog(
        state,
        statusChanged
          ? `Unit ${next.unitId} (${next.name}) → ${next.status}`
          : `Unit ${next.unitId} (${next.name}) identifier updated`,
        statusChanged ? 'status' : 'unit'
      ) : {};
      const audit = addAuditEntry(state, `Identifier updated for ${next?.name}`, 'CAD');
      const currentUser = action.payload.name
        ? { ...state.currentUser, name: action.payload.name }
        : state.currentUser;
      return { ...state, officers, currentUser, ...log, ...audit };
    }

    case 'SAVE_IDENTIFIER': {
      // payload: { label, unitId, rank, dept, deptShort, subdivision, status, location, aop, id? }
      const { id, ...fields } = action.payload;
      const officers = state.officers.map(o => {
        if (o.id !== state.currentUser?.id) return o;
        const existing = o.identifiers || [];
        if (id) {
          return { ...o, identifiers: existing.map(x => x.id === id ? { ...x, ...fields } : x) };
        }
        return { ...o, identifiers: [...existing, { ...fields, id: Date.now() }] };
      });
      return { ...state, officers };
    }

    case 'DELETE_IDENTIFIER': {
      const officers = state.officers.map(o =>
        o.id === state.currentUser?.id
          ? { ...o, identifiers: (o.identifiers || []).filter(x => x.id !== action.payload) }
          : o
      );
      return { ...state, officers };
    }

    case 'LOAD_IDENTIFIER': {
      // Apply a saved identifier's fields to the officer's active record
      const me = state.officers.find(o => o.id === state.currentUser?.id);
      const ident = (me?.identifiers || []).find(x => x.id === action.payload);
      if (!me || !ident) return state;
      const { label, id: _id, ...fields } = ident;
      const officers = state.officers.map(o =>
        o.id === state.currentUser?.id ? syncDutyClock({ ...o, ...fields }) : o
      );
      const log = addDispatchLog(state, `Unit ${fields.unitId} (${me.name}) → activated identifier "${label}"`, 'unit');
      return { ...state, officers, ...log };
    }

    case 'CREATE_CALL': {
      const newCall = { ...action.payload, id: `23-${1048 + state.calls.length}`, timestamp: new Date().toLocaleString(), createdAt: Date.now(), units: [] };
      const audit = addAuditEntry(state, `Created call ${newCall.id} (${newCall.nature})`, 'Dispatch');
      const log = addDispatchLog(state, `Call ${newCall.id} created, ${newCall.nature} (${newCall.location})`, 'call');
      return { ...state, calls: [newCall, ...state.calls], ...audit, ...log };
    }
    case 'UPDATE_CALL': {
      const calls = state.calls.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c);
      const log = addDispatchLog(state, `Call ${action.payload.id} updated`, 'call');
      return { ...state, calls, ...log };
    }
    case 'CLOSE_CALL': {
      // Clear the closed call from any units attached to it.
      const officers = state.officers.map(o =>
        o.callId === action.payload ? { ...o, callId: null, status: o.status === 'OFFDUTY' ? o.status : 'AVAILABLE' } : o
      );
      const calls = state.calls.map(c => c.id === action.payload ? { ...c, status: 'CLOSED' } : c);
      const audit = addAuditEntry(state, `Closed call ${action.payload}`, 'Dispatch');
      const log = addDispatchLog(state, `Call ${action.payload} closed, units cleared`, 'call');
      return { ...state, calls, officers, ...audit, ...log };
    }
    case 'ASSIGN_UNIT': {
      const { callId, unitId } = action.payload;
      const calls = state.calls.map(c => {
        if (c.id === callId && !c.units.includes(unitId)) {
          return { ...c, units: [...c.units, unitId], status: c.units.length === 0 ? 'ENRT' : c.status };
        }
        return c;
      });
      const officers = state.officers.map(o => o.unitId === unitId ? { ...o, callId, status: 'ENRT' } : o);
      const log = addDispatchLog(state, `Unit ${unitId} dispatched to ${callId}`, 'unit');
      return { ...state, calls, officers, ...log };
    }
    case 'DETACH_UNIT': {
      const { callId, unitId } = action.payload;
      const calls = state.calls.map(c =>
        c.id === callId ? { ...c, units: c.units.filter(u => u !== unitId) } : c
      );
      const officers = state.officers.map(o =>
        o.unitId === unitId ? { ...o, callId: null, status: o.status === 'OFFDUTY' ? o.status : 'AVAILABLE' } : o
      );
      const log = addDispatchLog(state, `Unit ${unitId} cleared from ${callId}`, 'unit');
      return { ...state, calls, officers, ...log };
    }
    // Dispatcher control over ANY unit's status (not just the current user).
    case 'SET_UNIT_STATUS': {
      const { unitId, status } = action.payload;
      const target = state.officers.find(o => o.unitId === unitId);
      const officers = state.officers.map(o => o.unitId === unitId ? syncDutyClock({ ...o, status }) : o);
      const audit = addAuditEntry(state, `Set unit ${unitId} status to ${status}`, 'Dispatch');
      const log = addDispatchLog(state, `Unit ${unitId}${target ? ` (${target.name})` : ''} → ${status}`, 'status');
      return { ...state, officers, ...audit, ...log };
    }
    case 'DISPATCH_RADIO': {
      // Payload may be a plain string (legacy) or { text, from, to }:
      //   from * sender's user id; the bridge never echoes a broadcast back to
      //          whoever sent it.
      //   to   * optional array of recipient officer ids. When present, only
      //          those users see the toast (units attached to the scene); when
      //          absent/null the broadcast goes to everyone (general radio).
      const text = typeof action.payload === 'string' ? action.payload : action.payload?.text;
      const from = typeof action.payload === 'string' ? null : (action.payload?.from ?? null);
      const to   = typeof action.payload === 'string' ? null : (action.payload?.to ?? null);
      const log = addDispatchLog(state, `[RADIO] ${text}`, 'alert');
      return {
        ...state,
        ...log,
        radioCount: state.radioCount + 1,
        lastRadio: { text, time: nowTime(), id: `${Date.now()}`, from, to },
      };
    }
    case 'MARK_RADIO_SEEN':
      return { ...state, radioSeen: state.radioCount };

    case 'PANIC': {
      const { unit, name, location, officerId, x, y, z } = action.payload || {};
      const text = `OFFICER PANIC, ${unit || 'UNIT'}${name ? ` (${name})` : ''}, ${location || 'LOCATION UNKNOWN'}, ALL UNITS RESPOND`;
      const log = addDispatchLog(state, `[PANIC] ${text}`, 'alert');
      const officers = state.officers.map(o => o.id === officerId ? { ...o, panic: true } : o);
      const id = `${Date.now()}`;
      const panicEntry = { officerId, unit, name, location, x, y, z, time: nowTime(), id };
      // Replace any prior unresolved panic from the same officer, newest first.
      const activePanics = [panicEntry, ...(state.activePanics || []).filter(p => p.officerId !== officerId)];
      return {
        ...state,
        ...log,
        officers,
        radioCount: state.radioCount + 1,
        lastRadio: { text, time: nowTime(), id, panic: true },
        panicAlert: panicEntry,
        activePanics,
      };
    }
    case 'CLEAR_PANIC': {
      const officers = state.officers.map(o => o.id === action.payload ? { ...o, panic: false } : o);
      const activePanics = (state.activePanics || []).filter(p => p.officerId !== action.payload);
      const panicAlert = state.panicAlert?.officerId === action.payload ? null : state.panicAlert;
      return { ...state, officers, activePanics, panicAlert };
    }
    case 'DISMISS_PANIC_MAP':
      return { ...state, panicAlert: null };
    case 'SET_MY_CALL':
      return { ...state, myCallId: action.payload };

    case 'ADD_INCOMING_911':
      return { ...state, incoming911: [action.payload, ...state.incoming911] };
    case 'DISMISS_HCFR_911':
      return { ...state, incoming911HCFR: (state.incoming911HCFR || []).filter(c => c.id !== action.payload) };
    case 'ADD_CIVILIAN_911': {
      const { filerId, ...incPayload } = action.payload;
      const esServices = incPayload.esServices?.length ? incPayload.esServices : ['LAW_ENFORCEMENT'];
      const goesToLEO  = esServices.includes('LAW_ENFORCEMENT');
      const goesToHCFR = esServices.includes('EMS') || esServices.includes('FIRE');
      const logEntry = {
        id: action.payload.id,
        filerId,
        esServices,
        caller: action.payload.caller,
        message: action.payload.message,
        location: action.payload.location,
        callbackNumber: action.payload.callbackNumber,
        receivedAt: action.payload.receivedAt,
        priority: action.payload.priority,
        status: 'Pending Dispatch',
      };
      return {
        ...state,
        incoming911:     goesToLEO  ? [incPayload, ...state.incoming911]                         : state.incoming911,
        incoming911HCFR: goesToHCFR ? [incPayload, ...(state.incoming911HCFR || [])]             : (state.incoming911HCFR || []),
        civilian911Log: [logEntry, ...(state.civilian911Log || [])],
      };
    }
    case 'REMOVE_INCOMING_911': {
      const civilian911Log = (state.civilian911Log || []).map(e =>
        e.id === action.payload ? { ...e, status: 'Dispatched' } : e
      );
      return { ...state, incoming911: state.incoming911.filter(c => c.id !== action.payload), civilian911Log };
    }
    case 'ADD_UNIT_GROUP':
      return { ...state, unitGroups: [...state.unitGroups, action.payload] };
    case 'UPDATE_UNIT_GROUP':
      return { ...state, unitGroups: state.unitGroups.map(g => g.id === action.payload.id ? { ...g, ...action.payload.changes } : g) };
    case 'DELETE_UNIT_GROUP':
      return { ...state, unitGroups: state.unitGroups.filter(g => g.id !== action.payload) };

    case 'ADD_CIVILIAN': {
      const rPad = (n) => String(Math.floor(Math.random() * (10 ** n))).padStart(n, '0');
      const ssnPrefix = state.uniqueIdentifiers?.ssnPrefix?.trim();
      const genSSN = () => ssnPrefix ? `${ssnPrefix}-${rPad(2)}-${rPad(4)}` : `${rPad(3)}-${rPad(2)}-${rPad(4)}`;
      const takenSSNs = new Set(state.civilians.map(c => c.ssn).filter(Boolean));
      let autoSSN = action.payload.ssn;
      if (!autoSSN) {
        do { autoSSN = genSSN(); } while (takenSSNs.has(autoSSN));
      }
      const newCiv = { ...action.payload, ssn: autoSSN, id: state.nextId, vehicles: [], flags: [] };
      const audit = addAuditEntry(state, `Created civilian record: ${newCiv.firstName} ${newCiv.lastName}`, 'Civilian');
      return { ...state, civilians: [...state.civilians, newCiv], nextId: state.nextId + 1, ...audit };
    }
    case 'UPDATE_CIVILIAN': {
      const civilians = state.civilians.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c);
      return { ...state, civilians };
    }
    case 'ISSUE_DRIVER_LICENSE': {
      const { civilianId, dlClass, dlStatus = 'ACTIVE', dlExpiry, dlEndorsements = [] } = action.payload;
      const civ = state.civilians.find(c => c.id === civilianId);
      // Block if they already have a DL that's suspended or revoked
      if (!civ || (civ.dlNumber && (civ.dlStatus === 'SUSPENDED' || civ.dlStatus === 'REVOKED'))) return state;
      const lastInitial = (civ.lastName?.[0] || 'X').toUpperCase();
      const randomDigits = Math.floor(Math.random() * 9000000 + 1000000);
      const adminPrefix = state.uniqueIdentifiers?.dlPrefix?.trim();
      const dlNumber = adminPrefix
        ? `${adminPrefix}-${lastInitial}${randomDigits}`
        : `${lastInitial}${randomDigits}`;
      const today = new Date().toISOString().split('T')[0];
      const civilians = state.civilians.map(c => c.id === civilianId ? {
        ...c,
        dlNumber,
        dlClass,
        dlStatus,
        dlEndorsements,
        dlIssuedAt: today,
        dlExpiry: dlExpiry || (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().split('T')[0]; })(),
        licensePoints: 0,
      } : c);
      return { ...state, civilians };
    }
    case 'RENEW_DRIVER_LICENSE': {
      const { civilianId, dlClass, dlStatus = 'ACTIVE', dlExpiry, dlEndorsements = [] } = action.payload;
      const civ = state.civilians.find(c => c.id === civilianId);
      if (!civ || civ.dlStatus === 'SUSPENDED' || civ.dlStatus === 'REVOKED') return state;
      const today = new Date().toISOString().split('T')[0];
      const civilians = state.civilians.map(c => c.id === civilianId ? {
        ...c,
        dlClass,
        dlStatus,
        dlEndorsements,
        dlIssuedAt: today,
        dlExpiry: dlExpiry || (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().split('T')[0]; })(),
        licensePoints: 0,
      } : c);
      return { ...state, civilians };
    }
    case 'UPDATE_CIVILIAN_FORMS': {
      // payload: { form: 'driverLicense'|'vehicleRegistration'|'character'|'medical', config }
      const { form, config } = action.payload;
      return { ...state, civilianForms: { ...state.civilianForms, [form]: config } };
    }
    case 'DELETE_CIVILIAN': {
      const civilians = state.civilians.filter(c => c.id !== action.payload);
      return { ...state, civilians };
    }

    case 'UPDATE_MEDICAL_PROFILE': {
      const { id, medicalProfile } = action.payload;
      const civilians = state.civilians.map(c => c.id === id ? { ...c, medicalProfile } : c);
      return { ...state, civilians };
    }

    case 'ADD_VEHICLE': {
      const newVeh = { ...action.payload, id: state.nextId, flags: [], stolen: false };
      if (action.payload.businessOwnerId) {
        return { ...state, vehicles: [...state.vehicles, newVeh], nextId: state.nextId + 1 };
      }
      const civilians = state.civilians.map(c => c.id === action.payload.ownerId ? { ...c, vehicles: [...c.vehicles, state.nextId] } : c);
      return { ...state, vehicles: [...state.vehicles, newVeh], civilians, nextId: state.nextId + 1 };
    }
    case 'UPDATE_VEHICLE': {
      const vehicles = state.vehicles.map(v => v.id === action.payload.id ? { ...v, ...action.payload } : v);
      return { ...state, vehicles };
    }

    case 'ADD_WARRANT': {
      const newWar = { ...action.payload, id: state.nextId, status: 'ACTIVE' };
      const civilians = state.civilians.map(c =>
        c.id === action.payload.civilianId ? { ...c, flags: c.flags.includes('WARRANT') ? c.flags : [...c.flags, 'WARRANT'] } : c
      );
      const audit = addAuditEntry(state, `Created warrant for ${action.payload.civilianName}`, 'Warrants');
      return { ...state, warrants: [...state.warrants, newWar], civilians, nextId: state.nextId + 1, ...audit };
    }
    case 'SERVE_WARRANT': {
      // Payload may be a bare warrant id (legacy) or { id, servedBy, caseNumber }.
      const id         = typeof action.payload === 'object' ? action.payload.id : action.payload;
      const servedBy   = (typeof action.payload === 'object' && action.payload.servedBy) || '';
      const caseNumber = (typeof action.payload === 'object' && action.payload.caseNumber) || '';
      const { warrants, civilians } = serveWarrants(state, [id], { servedBy, caseNumber });
      const audit = addAuditEntry(state, `Marked warrant ${id} as served`, 'Warrants');
      return { ...state, warrants, civilians, ...audit };
    }

    case 'ADD_ARREST': {
      const newArrest = { ...action.payload, id: state.nextId };
      const audit = addAuditEntry(state, `Added arrest record for civilian ID ${action.payload.civilianId}`, 'RMS');
      return { ...state, criminalHistory: [...state.criminalHistory, newArrest], nextId: state.nextId + 1, ...audit };
    }

    case 'ADD_REPORT': {
      const officer = state.officers.find(o => o.badge === action.payload.officerBadge);
      const officerSignature = officer
        ? `${officer.badge} | ${(officer.rank || officer.role || 'OFFICER').toUpperCase()} | ${officer.name.toUpperCase()}`
        : (action.payload.officerBadge || '—');
      const reportNumber = String(state.reportSeq).padStart(4, '0');
      const newReport = {
        ...action.payload,
        id: state.nextId,
        reportNumber,
        caseNumber: reportNumber,
        status: 'Pending Review',
        date: new Date().toLocaleDateString(),
        officerSignature,
        supervisorSignature: null,
        // Freeze the template structure so this report always renders, even if
        // the template is later changed or deleted.
        templateSnapshot: snapshotFor(state.reportTemplates, action.payload.type, action.payload.templateSnapshot),
      };
      // Auto-serve any warrants linked on the form (warrant_lookup fields),
      // stamping this report's officer + case number so an arrest filed on a
      // warrant clears it everywhere other officers look.
      const wIds = linkedWarrantIds(newReport.templateSnapshot, action.payload.formData);
      const { warrants, civilians } = serveWarrants(state, wIds, { servedBy: officerSignature, caseNumber: reportNumber });
      const auditMsg = wIds.length
        ? `Filed ${newReport.type} report ${reportNumber} (served ${wIds.length} warrant${wIds.length > 1 ? 's' : ''})`
        : `Filed ${newReport.type} report ${reportNumber}`;
      const audit = addAuditEntry(state, auditMsg, 'Reports');
      return { ...state, reports: [...state.reports, newReport], warrants, civilians, nextId: state.nextId + 1, reportSeq: state.reportSeq + 1, ...audit };
    }

    /* ─── Generic admin-customization CRUD ───
       key  = the state slice (e.g. 'tenCodes', 'statutes', 'quickLinks')
       These let every Sonoran-style editor share one consistent API. */
    case 'ADMIN_SET': {
      // Replace a whole config object/value (single-record editors).
      const { key, value } = action.payload;
      const audit = addAuditEntry(state, `Updated ${key} configuration`, 'Customization');
      return { ...state, [key]: value, ...audit };
    }

    case 'IMPORT_BUILDER_BUNDLE': {
      // Restore an exported bundle of report/record templates AND their filed
      // data. Only the slices present in the file are replaced; missing slices
      // are left untouched. Used by Records Builder → Import (for moving the
      // demo's built-up reports/records into the live backend).
      const b = action.payload || {};
      const next = { ...state };
      let parts = [];
      if (Array.isArray(b.reportTemplates)) { next.reportTemplates = b.reportTemplates; parts.push(`${b.reportTemplates.length} report template(s)`); }
      if (Array.isArray(b.recordTemplates)) { next.recordTemplates = b.recordTemplates; parts.push(`${b.recordTemplates.length} record template(s)`); }
      if (Array.isArray(b.reports))         { next.reports = b.reports;                 parts.push(`${b.reports.length} report(s)`); }
      if (Array.isArray(b.records))         { next.records = b.records;                 parts.push(`${b.records.length} record(s)`); }
      // Keep the auto-number sequence ahead of anything just imported.
      const nums = [...(next.reports || []), ...(next.records || [])]
        .map(r => parseInt(String(r.number || r.reportNumber || '').replace(/\D/g, ''), 10))
        .filter(n => Number.isFinite(n));
      if (nums.length) next.reportSeq = Math.max(state.reportSeq || 1, Math.max(...nums) + 1);
      const audit = addAuditEntry(next, `Imported builder bundle · ${parts.join(', ') || 'no data'}`, 'Customization');
      return { ...next, ...audit };
    }

    case 'WIPE': {
      // Admin "Wipe Records" — clears a data slice AND auto-saves a restorable
      // backup snapshot of exactly what was removed (see wipeBackups).
      const target = action.payload;
      const CLEARABLE = ['civilians', 'vehicles', 'warrants', 'criminalHistory', 'calls', 'dispatchLog', 'towLogs', 'auditLog', 'activeSessions', 'bannedUsers'];
      let next;
      let backup;   // { label, count, payload }
      if (target === 'allReports') {
        backup = { label: 'All Reports', count: state.reports.length, payload: { type: 'reports', items: state.reports } };
        next = { ...state, reports: [] };
      } else if (target === 'allRecords') {
        backup = { label: 'All Records', count: state.records.length, payload: { type: 'records', items: state.records } };
        next = { ...state, records: [] };
      } else if (typeof target === 'string' && target.startsWith('report:')) {
        const name = target.slice(7);
        const removed = state.reports.filter(r => r.type === name);
        backup = { label: `Reports · ${name}`, count: removed.length, payload: { type: 'reports', items: removed } };
        next = { ...state, reports: state.reports.filter(r => r.type !== name) };
      } else if (typeof target === 'string' && target.startsWith('record:')) {
        const name = target.slice(7);
        const removed = state.records.filter(r => r.type === name);
        backup = { label: `Records · ${name}`, count: removed.length, payload: { type: 'records', items: removed } };
        next = { ...state, records: state.records.filter(r => r.type !== name) };
      } else if (target === 'civilianFlags') {
        const map = {}; let count = 0;
        state.civilians.forEach(c => { if ((c.flags || []).length) { map[c.id] = c.flags; count += c.flags.length; } });
        backup = { label: 'Civilian Flags', count, payload: { type: 'civFlags', map } };
        next = { ...state, civilians: state.civilians.map(c => ({ ...c, flags: [] })) };
      } else if (target === 'licensePoints') {
        const map = {}; let count = 0;
        state.civilians.forEach(c => { if (c.licensePoints) { map[c.id] = c.licensePoints; count++; } });
        backup = { label: 'License Points', count, payload: { type: 'civPoints', map } };
        next = { ...state, civilians: state.civilians.map(c => ({ ...c, licensePoints: 0 })) };
      } else if (CLEARABLE.includes(target)) {
        const items = state[target] || [];
        backup = { label: target, count: items.length, payload: { type: 'slice', key: target, items } };
        next = { ...state, [target]: [] };
      } else return state;

      const entry = {
        id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        time: new Date().toLocaleString(),
        target,
        label: backup.label,
        count: backup.count,
        payload: backup.payload,
      };
      const base = { ...next, wipeBackups: [entry, ...(state.wipeBackups || [])].slice(0, 25) };
      // Log the wipe (skip when we just cleared the audit log itself).
      if (target === 'auditLog') return base;
      return { ...base, ...addAuditEntry(base, `Wiped ${target} · backup saved (${backup.count})`, 'Admin') };
    }

    case 'RESTORE_BACKUP': {
      const bk = (state.wipeBackups || []).find(b => b.id === action.payload);
      if (!bk) return state;
      const p = bk.payload;
      let next = state;
      if (p.type === 'slice') {
        const cur = state[p.key] || [];
        const ids = new Set(cur.map(x => x.id));
        next = { ...state, [p.key]: [...p.items.filter(x => !ids.has(x.id)), ...cur] };
      } else if (p.type === 'reports') {
        const ids = new Set(state.reports.map(r => r.id));
        next = { ...state, reports: [...state.reports, ...p.items.filter(r => !ids.has(r.id))] };
      } else if (p.type === 'records') {
        const ids = new Set(state.records.map(r => r.id));
        next = { ...state, records: [...state.records, ...p.items.filter(r => !ids.has(r.id))] };
      } else if (p.type === 'civFlags') {
        next = { ...state, civilians: state.civilians.map(c => p.map[c.id] ? { ...c, flags: p.map[c.id] } : c) };
      } else if (p.type === 'civPoints') {
        next = { ...state, civilians: state.civilians.map(c => p.map[c.id] != null ? { ...c, licensePoints: p.map[c.id] } : c) };
      }
      const wipeBackups = (state.wipeBackups || []).filter(b => b.id !== bk.id);
      const audit = addAuditEntry({ ...next, wipeBackups }, `Restored backup · ${bk.label} (${bk.count})`, 'Admin');
      return { ...next, wipeBackups, ...audit };
    }

    case 'ADD_LICENSE_POINTS': {
      // Accumulate points on a driver; auto-suspend (and re-suspend for longer)
      // each time their total crosses one of the configured threshold tiers.
      const cfg = state.licensePointsConfig || {};
      const { civilianId, points, reason } = action.payload;
      const civ = state.civilians.find(c => c.id === civilianId);
      // Tier ladder (fall back to the legacy single threshold if none set).
      const tiers = (cfg.tiers && cfg.tiers.length)
        ? [...cfg.tiers].filter(t => t.threshold > 0).sort((a, b) => a.threshold - b.threshold)
        : [{ threshold: cfg.threshold, suspensionDays: cfg.suspensionDays }];
      const multiTier = tiers.length > 1;
      let suspended = false;
      let firedTier = null;
      let expiry = null;
      const civilians = state.civilians.map(c => {
        if (c.id !== civilianId) return c;
        const oldPoints = c.licensePoints || 0;
        const newPoints = oldPoints + Number(points || 0);
        // Tiers newly crossed by this increment (so each tier fires once).
        const crossed = cfg.enabled
          ? tiers.filter(t => oldPoints < t.threshold && newPoints >= t.threshold)
          : [];
        if (crossed.length) {
          suspended = true;
          firedTier = crossed[crossed.length - 1]; // highest tier crossed
          expiry = new Date(Date.now() + (firedTier.suspensionDays || 0) * 86400000).toISOString().slice(0, 10);
          return {
            ...c,
            // Keep points climbing across tiers; only zero them when a single
            // legacy threshold is configured with reset-after-suspension on.
            licensePoints: (cfg.resetAfterSuspend && !multiTier) ? 0 : newPoints,
            dlStatus: 'SUSPENDED',
            dlExpiry: expiry,
            suspendedUntil: expiry,
          };
        }
        return { ...c, licensePoints: newPoints };
      });
      const name = civ ? `${civ.firstName} ${civ.lastName}` : 'Driver';
      const audit = addAuditEntry(
        state,
        `${points} pts → ${name}${reason ? ` (${reason})` : ''}${suspended ? ' · AUTO-SUSPENDED' : ''}`,
        'License Points'
      );
      const log = suspended
        ? addDispatchLog(state, `LICENSE AUTO-SUSPENDED · ${name} reached ${firedTier.threshold} pts · ${firedTier.suspensionDays}-day suspension`, 'alert')
        : {};
      return { ...state, civilians, ...audit, ...log };
    }
    case 'RESET_LICENSE_POINTS': {
      const civilians = state.civilians.map(c => c.id === action.payload ? { ...c, licensePoints: 0 } : c);
      return { ...state, civilians, ...addAuditEntry(state, 'License points reset to 0', 'License Points') };
    }
    case 'LIFT_SUSPENSION': {
      const civilians = state.civilians.map(c =>
        c.id === action.payload ? { ...c, dlStatus: 'ACTIVE', licensePoints: 0, suspendedUntil: null } : c);
      return { ...state, civilians, ...addAuditEntry(state, 'License suspension lifted (reinstated)', 'License Points') };
    }
    case 'MANUAL_SUSPEND': {
      // Manually suspend a driver's license from the admin Auto Suspend page
      // (independent of point accumulation). Uses the configured suspension
      // length when available.
      const cfg = state.licensePointsConfig || {};
      const { civilianId, reason } = action.payload;
      const civ = state.civilians.find(c => c.id === civilianId);
      if (!civ) return state;
      const expiry = cfg.suspensionDays
        ? new Date(Date.now() + cfg.suspensionDays * 86400000).toISOString().slice(0, 10)
        : null;
      const civilians = state.civilians.map(c =>
        c.id === civilianId ? { ...c, dlStatus: 'SUSPENDED', suspendedUntil: expiry } : c);
      const name = `${civ.firstName} ${civ.lastName}`;
      const audit = addAuditEntry(state, `License manually suspended · ${name}${reason ? ` (${reason})` : ''}`, 'License Points');
      const log = addDispatchLog(state, `LICENSE SUSPENDED (manual) · ${name}`, 'alert');
      return { ...state, civilians, ...audit, ...log };
    }
    // ── Custom flag definitions ──
    case 'ADD_FLAG_DEF': {
      const flag = { ...action.payload, id: `flag_${Date.now()}` };
      return { ...state, customFlags: [...state.customFlags, flag] };
    }
    case 'UPDATE_FLAG_DEF': {
      const customFlags = state.customFlags.map(f => f.id === action.payload.id ? { ...f, ...action.payload } : f);
      return { ...state, customFlags };
    }
    case 'DELETE_FLAG_DEF': {
      const customFlags = state.customFlags.filter(f => f.id !== action.payload);
      // Remove this flag id from all civilians
      const civilians = state.civilians.map(c => ({
        ...c, flags: (c.flags || []).filter(fid => fid !== action.payload),
      }));
      return { ...state, customFlags, civilians };
    }
    // ── Civilian flag assignment ──
    case 'ADD_CIVILIAN_FLAG': {
      const { civilianId, flagId } = action.payload;
      const civilians = state.civilians.map(c =>
        c.id === civilianId
          ? { ...c, flags: [...new Set([...(c.flags || []), flagId])] }
          : c
      );
      const civ = state.civilians.find(c => c.id === civilianId);
      const fname = (state.customFlags.find(f => f.id === flagId) || {}).name || flagId;
      const audit = addAuditEntry(state, `Flagged ${civ ? `${civ.firstName} ${civ.lastName}` : `civilian #${civilianId}`} · ${fname}`, 'Civilian Flags');
      return { ...state, civilians, ...audit };
    }
    case 'REMOVE_CIVILIAN_FLAG': {
      const { civilianId, flagId } = action.payload;
      const civilians = state.civilians.map(c =>
        c.id === civilianId ? { ...c, flags: (c.flags || []).filter(f => f !== flagId) } : c
      );
      const civ = state.civilians.find(c => c.id === civilianId);
      const fname = (state.customFlags.find(f => f.id === flagId) || {}).name || flagId;
      const audit = addAuditEntry(state, `Removed flag from ${civ ? `${civ.firstName} ${civ.lastName}` : `civilian #${civilianId}`} · ${fname}`, 'Civilian Flags');
      return { ...state, civilians, ...audit };
    }
    case 'ADD_CIVILIAN_NOTE': {
      // Any LEO may add a short note; it locks once submitted (UI gates editing
      // to supervisors/command).
      const { civilianId, text, author } = action.payload;
      const note = {
        id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        text: String(text || '').slice(0, 300),
        authorId: author?.id ?? null,
        authorName: author?.name || 'Officer',
        authorBadge: author?.badge || '',
        timestamp: new Date().toLocaleString(),
        edited: false,
      };
      const civilians = state.civilians.map(c =>
        c.id === civilianId ? { ...c, notes: [note, ...(c.notes || [])] } : c
      );
      const civ = state.civilians.find(c => c.id === civilianId);
      const audit = addAuditEntry(state, `Added note to ${civ ? `${civ.firstName} ${civ.lastName}` : `civilian #${civilianId}`}`, 'Civilian Notes');
      return { ...state, civilians, ...audit };
    }
    case 'UPDATE_CIVILIAN_NOTE': {
      const { civilianId, noteId, text, editor } = action.payload;
      const civilians = state.civilians.map(c =>
        c.id === civilianId
          ? { ...c, notes: (c.notes || []).map(n => n.id === noteId
              ? { ...n, text: String(text || '').slice(0, 300), edited: true, editedBy: editor?.badge || editor?.name || 'Supervisor', editedAt: new Date().toLocaleString() }
              : n) }
          : c
      );
      const civ = state.civilians.find(c => c.id === civilianId);
      const audit = addAuditEntry(state, `Edited a note on ${civ ? `${civ.firstName} ${civ.lastName}` : `civilian #${civilianId}`}`, 'Civilian Notes');
      return { ...state, civilians, ...audit };
    }
    case 'ADMIN_ADD': {
      const { key, item } = action.payload;
      const newItem = { ...item, id: state.nextId };
      const audit = addAuditEntry(state, `Added entry to ${key}`, 'Customization');
      return { ...state, [key]: [...(state[key] || []), newItem], nextId: state.nextId + 1, ...audit };
    }
    case 'ADMIN_UPDATE': {
      const { key, item } = action.payload;
      return { ...state, [key]: state[key].map(x => x.id === item.id ? { ...x, ...item } : x) };
    }
    case 'ADMIN_REMOVE': {
      const { key, id } = action.payload;
      const audit = addAuditEntry(state, `Removed entry from ${key}`, 'Customization');
      return { ...state, [key]: state[key].filter(x => x.id !== id), ...audit };
    }
    case 'ADMIN_REORDER': {
      // Move a list item up (-1) or down (+1).
      const { key, id, dir } = action.payload;
      const list = [...state[key]];
      const idx = list.findIndex(x => x.id === id);
      const swap = idx + dir;
      if (idx < 0 || swap < 0 || swap >= list.length) return state;
      [list[idx], list[swap]] = [list[swap], list[idx]];
      return { ...state, [key]: list };
    }

    /* ─── Business portal ─── */
    case 'ADD_BUSINESS': {
      const yr = new Date().getFullYear();
      const licenseNum = action.payload.license?.trim() || `BL-${yr}-${String(state.nextId).padStart(4, '0')}`;
      const issuedAt = new Date().toISOString().split('T')[0];
      const b = {
        ...action.payload,
        id: state.nextId,
        employees: [],
        status: 'ACTIVE',
        license: licenseNum,
        licenseIssuedAt: issuedAt,
        licenseStatus: 'ACTIVE',
      };
      const audit = addAuditEntry(state, `Created business: ${b.name} (License: ${licenseNum}, expires in 90 days)`, 'Admin');
      return { ...state, businesses: [...state.businesses, b], nextId: state.nextId + 1, ...audit };
    }
    case 'UPDATE_BUSINESS': {
      const businesses = state.businesses.map(b => b.id === action.payload.id ? { ...b, ...action.payload } : b);
      return { ...state, businesses };
    }
    case 'UPDATE_BUSINESS_LICENSE': {
      const { id, action: licAction } = action.payload;
      const businesses = state.businesses.map(b => {
        if (b.id !== id) return b;
        if (licAction === 'EXTEND') {
          return { ...b, licenseIssuedAt: new Date().toISOString().split('T')[0], licenseStatus: 'ACTIVE' };
        }
        if (licAction === 'REVOKE') return { ...b, licenseStatus: 'REVOKED' };
        if (licAction === 'REINSTATE') return { ...b, licenseIssuedAt: new Date().toISOString().split('T')[0], licenseStatus: 'ACTIVE' };
        return b;
      });
      const target = state.businesses.find(b => b.id === id);
      const audit = addAuditEntry(state, `Business license ${licAction.toLowerCase()}d: ${target?.name}`, 'Admin');
      return { ...state, businesses, ...audit };
    }
    case 'ADD_EMPLOYEE': {
      const { businessId, employee } = action.payload;
      const businesses = state.businesses.map(b =>
        b.id === businessId ? { ...b, employees: [...b.employees, { ...employee, id: state.nextId }] } : b
      );
      return { ...state, businesses, nextId: state.nextId + 1 };
    }
    case 'REMOVE_EMPLOYEE': {
      const { businessId, employeeId } = action.payload;
      const businesses = state.businesses.map(b =>
        b.id === businessId ? { ...b, employees: b.employees.filter(e => e.id !== employeeId) } : b
      );
      return { ...state, businesses };
    }
    case 'DELETE_BUSINESS': {
      const businesses = state.businesses.filter(b => b.id !== action.payload);
      const audit = addAuditEntry(state, `Deleted business ID ${action.payload}`, 'Admin');
      return { ...state, businesses, ...audit };
    }

    /* ─── FDOT Permits ─── */
    case 'ADD_PERMIT': {
      const seq = state.nextId;
      const permitNumber = `FDOT-P-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`;
      const permit = { ...action.payload, id: seq, permitNumber, status: 'ACTIVE' };
      const audit = addAuditEntry(state, `Issued permit ${permitNumber} to ${permit.holderName}`, 'Permits');
      return { ...state, permits: [permit, ...state.permits], nextId: seq + 1, ...audit };
    }
    case 'REVOKE_PERMIT': {
      const permits = state.permits.map(p => p.id === action.payload ? { ...p, status: 'REVOKED' } : p);
      const target = state.permits.find(p => p.id === action.payload);
      const audit = addAuditEntry(state, `Revoked permit ${target?.permitNumber} (${target?.holderName})`, 'Permits');
      return { ...state, permits, ...audit };
    }

    case 'UPDATE_REPORT_STATUS': {
      const { id, status, supervisorSignature } = action.payload;
      const reports = state.reports.map(r =>
        r.id === id ? { ...r, status, ...(supervisorSignature ? { supervisorSignature } : {}) } : r
      );
      const audit = addAuditEntry(state, `${status} report ID ${id}`, 'Reports');
      return { ...state, reports, ...audit };
    }
    case 'ADD_REPORT_TEMPLATE': {
      // Keep the builder-assigned id (so it can keep editing the same template
      // and per-template flags target the right id); only mint one if missing.
      const hasId = action.payload.id != null;
      const newTpl = { ...action.payload, id: hasId ? action.payload.id : state.nextId };
      return { ...state, reportTemplates: [...state.reportTemplates, newTpl], nextId: hasId ? state.nextId : state.nextId + 1 };
    }
    case 'UPDATE_REPORT_TEMPLATE': {
      const reportTemplates = state.reportTemplates.map(t => t.id === action.payload.id ? action.payload : t);
      return { ...state, reportTemplates };
    }
    case 'DELETE_REPORT_TEMPLATE': {
      const reportTemplates = state.reportTemplates.filter(t => t.id !== action.payload);
      return { ...state, reportTemplates };
    }

    case 'ADD_RECORD': {
      const recordNumber = String(state.reportSeq).padStart(4, '0');
      const fd = action.payload.formData || {};
      const civId = action.payload.civilianId || fd._civilianId || undefined;
      const newRecord = { ...action.payload, id: state.nextId, recordNumber, caseNumber: recordNumber, status: action.payload.status || 'Pending Review', date: new Date().toLocaleDateString(), templateSnapshot: snapshotFor(state.recordTemplates, action.payload.type, action.payload.templateSnapshot), ...(civId !== undefined ? { civilianId: civId } : {}) };
      // Records can carry a warrant_lookup field too — serve any linked warrants.
      const wIds = linkedWarrantIds(newRecord.templateSnapshot, fd);
      const { warrants, civilians } = serveWarrants(state, wIds, { servedBy: officerSignatureFor(state, action.payload.officerBadge), caseNumber: recordNumber });
      return { ...state, records: [...state.records, newRecord], warrants, civilians, nextId: state.nextId + 1, reportSeq: state.reportSeq + 1 };
    }
    case 'UPDATE_REPORT': {
      const reports = state.reports.map(r =>
        r.id === action.payload.id ? { ...r, ...action.payload } : r
      );
      const audit = addAuditEntry(state, `Updated report ID ${action.payload.id}`, 'Reports');
      return { ...state, reports, ...audit };
    }
    case 'RETURN_REPORT': {
      // payload: { id, comment, supervisorName, supervisorBadge }
      // Handles both reports and records (ids are unique across both since they
      // share the nextId counter). Drops a notification into the authoring
      // officer's inbox so they know to edit + resubmit.
      const { id: rid, comment, supervisorName, supervisorBadge } = action.payload;
      const newComment = { id: `cmt_${Date.now()}`, text: comment, supervisorName, supervisorBadge, timestamp: new Date().toLocaleString() };
      const mark = (r) => r.id === rid
        ? { ...r, status: 'Pending Changes', supervisorComments: [...(r.supervisorComments || []), newComment] }
        : r;
      const reports = state.reports.map(mark);
      const records = state.records.map(mark);
      const item = state.reports.find(r => r.id === rid) || state.records.find(r => r.id === rid);
      const label = state.records.some(r => r.id === rid) ? 'Record' : 'Report';
      const notif = item ? {
        id: `notif-ret-${Date.now()}`,
        title: `${label} Returned for Changes`,
        body: `${item.type || label} ${item.caseNumber || ''} was returned by ${supervisorName || 'a supervisor'}${comment ? ` — “${comment}”` : ''}. Open it to edit and resubmit.`,
        sender: supervisorName ? `${supervisorName}${supervisorBadge ? ` (${supervisorBadge})` : ''}` : 'Supervisor',
        color: '#f59e0b',
        time: nowTime(),
        read: false,
        recipientBadge: item.officerBadge || null,
        // Opens straight into the officer's returned-item resubmit editor
        // (works for both reports and records).
        link: `/profile?returned=${rid}`,
      } : null;
      const notifications = notif ? [notif, ...state.notifications] : state.notifications;
      const audit = addAuditEntry(state, `Returned ${label.toLowerCase()} ${rid} to officer`, 'Reports');
      return { ...state, reports, records, notifications, ...audit };
    }
    case 'RESUBMIT_REPORT': {
      // payload: { id, formData, officerSignature }
      const { id: rid2, formData, officerSignature } = action.payload;
      const reports = state.reports.map(r =>
        r.id === rid2 ? { ...r, formData, status: 'Pending Review', ...(officerSignature ? { officerSignature } : {}) } : r
      );
      const audit = addAuditEntry(state, `Officer resubmitted report ${rid2}`, 'Reports');
      return { ...state, reports, ...audit };
    }
    case 'RESUBMIT_RECORD': {
      // payload: { id, formData, officerSignature }
      const { id: rid3, formData, officerSignature } = action.payload;
      const records = state.records.map(r =>
        r.id === rid3 ? { ...r, formData, status: 'Pending Review', ...(officerSignature ? { officerSignature } : {}) } : r
      );
      const audit = addAuditEntry(state, `Officer resubmitted record ${rid3}`, 'Records');
      return { ...state, records, ...audit };
    }
    case 'UPDATE_RECORD': {
      const records = state.records.map(r =>
        r.id === action.payload.id ? { ...r, ...action.payload } : r
      );
      return { ...state, records };
    }
    case 'UPDATE_RECORD_STATUS': {
      const { id: rid, status: rstatus, supervisorSignature: rsig } = action.payload;
      return {
        ...state,
        records: state.records.map(r =>
          r.id === rid ? { ...r, status: rstatus, ...(rsig ? { supervisorSignature: rsig } : {}) } : r
        ),
      };
    }

    case 'ADD_RECORD_TEMPLATE':
      return { ...state, recordTemplates: [...state.recordTemplates, { ...action.payload, id: action.payload.id || `r${Date.now()}` }] };
    case 'UPDATE_RECORD_TEMPLATE':
      return { ...state, recordTemplates: state.recordTemplates.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_RECORD_TEMPLATE':
      return { ...state, recordTemplates: state.recordTemplates.filter(t => t.id !== action.payload) };

    case 'ADD_CHARGE': {
      const newCharge = { ...action.payload, id: state.nextId };
      const audit = addAuditEntry(state, `Added penal code: ${newCharge.code} - ${newCharge.name}`, 'Penal Code');
      return { ...state, penalCode: [...state.penalCode, newCharge], nextId: state.nextId + 1, ...audit };
    }
    case 'UPDATE_CHARGE': {
      const penalCode = state.penalCode.map(p => p.id === action.payload.id ? action.payload : p);
      return { ...state, penalCode };
    }
    case 'DELETE_CHARGE': {
      const penalCode = state.penalCode.filter(p => p.id !== action.payload);
      return { ...state, penalCode };
    }

    case 'ADD_DEPARTMENT': {
      const newDept = { ...action.payload, id: state.nextId, subdivisions: [] };
      const audit = addAuditEntry(state, `Created department: ${newDept.name}`, 'Admin');
      return { ...state, departments: [...state.departments, newDept], nextId: state.nextId + 1, ...audit };
    }
    case 'UPDATE_DEPARTMENT': {
      const departments = state.departments.map(d => d.id === action.payload.id ? action.payload : d);
      return { ...state, departments };
    }

    case 'SET_HELP_CONTENT':
      return { ...state, helpContent: { ...state.helpContent, ...action.payload } };

    case 'BAN_USER': {
      const ban = { ...action.payload, id: state.nextId, status: 'Active', date: new Date().toLocaleDateString(), issuedBy: state.currentUser?.name };
      const audit = addAuditEntry(state, `Banned user ${ban.name}: ${ban.reason}`, 'Admin');
      return { ...state, bannedUsers: [...state.bannedUsers, ban], nextId: state.nextId + 1, ...audit };
    }
    case 'UNBAN_USER': {
      const bannedUsers = state.bannedUsers.map(b => b.id === action.payload ? { ...b, status: 'Lifted' } : b);
      const audit = addAuditEntry(state, `Unbanned user ID ${action.payload}`, 'Admin');
      return { ...state, bannedUsers, ...audit };
    }

    case 'APPROVE_WHITELIST': {
      const whitelistApps = state.whitelistApps.map(w => w.id === action.payload ? { ...w, status: 'Approved' } : w);
      return { ...state, whitelistApps };
    }
    case 'DENY_WHITELIST': {
      const whitelistApps = state.whitelistApps.map(w => w.id === action.payload ? { ...w, status: 'Denied' } : w);
      return { ...state, whitelistApps };
    }

    case 'ADD_TOW': {
      const newTow = { ...action.payload, id: state.nextId, releaseStatus: 'Hold' };
      return { ...state, towLogs: [...state.towLogs, newTow], nextId: state.nextId + 1 };
    }

    case 'ADD_TOW_JOB': {
      const job = { ...action.payload, id: state.nextId, status: action.payload.status || 'PENDING', createdAt: Date.now() };
      const log = addDispatchLog(state, `Tow job #${state.nextId} created, ${job.plate || 'Unknown plate'} @ ${job.location}`, 'info');
      return { ...state, towJobs: [job, ...state.towJobs], nextId: state.nextId + 1, ...log };
    }
    case 'UPDATE_TOW_JOB': {
      const towJobs = state.towJobs.map(j => j.id === action.payload.id ? { ...j, ...action.payload } : j);
      return { ...state, towJobs };
    }
    case 'CANCEL_TOW_JOB': {
      const towJobs = state.towJobs.map(j => j.id === action.payload ? { ...j, status: 'CANCELLED' } : j);
      return { ...state, towJobs };
    }
    case 'ADD_TOW_UNIT': {
      // payload: { operatorName, discordId, companyId, companyName, truckId, truckName, zone }
      const unit = { ...action.payload, id: state.nextId, status: 'AVAILABLE', signedOnAt: Date.now() };
      const log = addDispatchLog(state, `Tow unit online: ${unit.operatorName} (${unit.truckName}), ${unit.zone}`, 'unit');
      return { ...state, towUnits: [...state.towUnits, unit], nextId: state.nextId + 1, ...log };
    }
    case 'UPDATE_TOW_UNIT': {
      const towUnits = state.towUnits.map(u => u.id === action.payload.id ? { ...u, ...action.payload } : u);
      return { ...state, towUnits };
    }
    case 'REMOVE_TOW_UNIT': {
      const unit = state.towUnits.find(u => u.id === action.payload);
      const towUnits = state.towUnits.filter(u => u.id !== action.payload);
      const log = unit ? addDispatchLog(state, `Tow unit offline: ${unit.operatorName} (${unit.truckName})`, 'unit') : {};
      return { ...state, towUnits, ...log };
    }

    case 'ADD_FDOT_REQUEST': {
      // payload: { assistType, location, postal, priority, description, callId,
      //            callNature, requestedBy, requestedByBadge, requestedByUnit }
      const req = { ...action.payload, id: state.nextId, status: 'PENDING', createdAt: Date.now() };

      // For civilian tow requests routed to a specific company, verify the
      // receiver still exists. If it was deleted, park the request in the
      // unrouted queue so it isn't silently lost.
      if (req.source === 'CIVILIAN' && req.targetCompanyId) {
        const receiverExists = state.businesses.some(b => b.id === req.targetCompanyId);
        if (!receiverExists) {
          const fallback = { ...req, status: 'UNROUTED', routingFailure: `Receiver company ID ${req.targetCompanyId} not found` };
          const log = addDispatchLog(state, `[UNROUTED] Civilian tow request (${req.assistType || 'Assist'} @ ${req.location}) — receiver company no longer exists`, 'alert');
          const notif = addSystemNotif(state, {
            title: 'Tow Request Unrouted',
            body: `Civilian tow (${req.assistType || 'Assist'} @ ${req.location}) could not be delivered — target company no longer exists. Check Unrouted Requests.`,
          });
          return { ...state, unroutedRequests: [fallback, ...(state.unroutedRequests || [])], nextId: state.nextId + 1, ...log, ...notif };
        }
      }

      const target = req.targetCompanyId ? state.businesses.find(b => b.id === req.targetCompanyId) : null;
      const dest = target?.name || 'FDOT';
      const who = req.source === 'CIVILIAN' ? `Civilian tow request (${req.requestedBy || 'unknown'})` : 'FDOT assistance requested';
      const log = addDispatchLog(
        state,
        `${who}, ${req.assistType || 'Assist'} @ ${req.location}${req.source === 'CIVILIAN' ? ` → ${dest}` : ''}${req.callId ? ` (Call ${req.callId})` : ''}`,
        'alert'
      );
      return { ...state, fdotRequests: [req, ...state.fdotRequests], nextId: state.nextId + 1, ...log };
    }
    case 'UPDATE_FDOT_REQUEST': {
      const prev = state.fdotRequests.find(r => r.id === action.payload.id);
      const fdotRequests = state.fdotRequests.map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r);
      let log = {};
      if (prev && action.payload.status && action.payload.status !== prev.status) {
        const verb = {
          ACKNOWLEDGED: 'acknowledged', DISPATCHED: 'dispatched a unit for',
          ON_SCENE: 'marked units on scene for',
          DECLINED: 'declined', COMPLETED: 'completed',
        }[action.payload.status] || 'updated';
        log = addDispatchLog(
          state,
          `FDOT ${verb} assistance request${prev.callId ? ` for Call ${prev.callId}` : ''} (${prev.assistType || 'Assist'} @ ${prev.location})`,
          action.payload.status === 'DECLINED' ? 'alert' : 'unit'
        );
      }
      return { ...state, fdotRequests, ...log };
    }

    case 'ADD_HCFR_REQUEST': {
      const req = { ...action.payload, id: state.nextId, status: 'PENDING', createdAt: Date.now() };

      // Verify at least one department with routingRole 'HCFR' still exists.
      // If not, the Fire Ops Board has no agency configured to receive this
      // request — park it in the unrouted queue.
      const hcfrReceiverExists = state.departments.some(d => d.routingRole === 'HCFR');
      if (!hcfrReceiverExists) {
        const fallback = { ...req, status: 'UNROUTED', routingFailure: 'No department with routingRole HCFR found' };
        const log = addDispatchLog(state, `[UNROUTED] HCFR assistance request (${req.assistType || 'Assist'} @ ${req.location}) — no HCFR agency configured`, 'alert');
        const notif = addSystemNotif(state, {
          title: 'HCFR Request Unrouted',
          body: `HCFR assistance (${req.assistType || 'Assist'} @ ${req.location}) could not be delivered — no HCFR agency is configured. Check Unrouted Requests.`,
        });
        return { ...state, unroutedRequests: [fallback, ...(state.unroutedRequests || [])], nextId: state.nextId + 1, ...log, ...notif };
      }

      const log = addDispatchLog(
        state,
        `HCFR assistance requested, ${req.assistType || 'Assist'} @ ${req.location}${req.callId ? ` (Call ${req.callId})` : ''}`,
        'alert'
      );
      return { ...state, hcfrRequests: [req, ...(state.hcfrRequests || [])], nextId: state.nextId + 1, ...log };
    }
    case 'UPDATE_HCFR_REQUEST': {
      const prev = (state.hcfrRequests || []).find(r => r.id === action.payload.id);
      const hcfrRequests = (state.hcfrRequests || []).map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r);
      let log = {};
      if (prev && action.payload.status && action.payload.status !== prev.status) {
        const verb = {
          ACKNOWLEDGED: 'acknowledged', DISPATCHED: 'dispatched a unit for',
          ON_SCENE: 'marked units on scene for',
          DECLINED: 'declined', COMPLETED: 'completed',
        }[action.payload.status] || 'updated';
        log = addDispatchLog(
          state,
          `HCFR ${verb} assistance request${prev.callId ? ` for Call ${prev.callId}` : ''} (${prev.assistType || 'Assist'} @ ${prev.location})`,
          action.payload.status === 'DECLINED' ? 'alert' : 'unit'
        );
      }
      return { ...state, hcfrRequests, ...log };
    }

    case 'DISMISS_UNROUTED': {
      return { ...state, unroutedRequests: (state.unroutedRequests || []).filter(r => r.id !== action.payload) };
    }
    case 'RESOLVE_UNROUTED': {
      // Manually re-route an unrouted request to the right queue.
      const { id: unreId, targetQueue } = action.payload;
      const req = (state.unroutedRequests || []).find(r => r.id === unreId);
      if (!req) return state;
      const resolved = { ...req, status: 'PENDING', routingFailure: undefined, resolvedAt: Date.now() };
      const unroutedRequests = (state.unroutedRequests || []).filter(r => r.id !== unreId);
      if (targetQueue === 'fdot') {
        return { ...state, unroutedRequests, fdotRequests: [resolved, ...state.fdotRequests] };
      }
      if (targetQueue === 'hcfr') {
        return { ...state, unroutedRequests, hcfrRequests: [resolved, ...(state.hcfrRequests || [])] };
      }
      return { ...state, unroutedRequests };
    }

    case 'ADD_CUSTOM_RECORD_TYPE': {
      const newType = { ...action.payload, id: state.nextId };
      return { ...state, customRecordTypes: [...state.customRecordTypes, newType], nextId: state.nextId + 1 };
    }
    case 'UPDATE_CUSTOM_RECORD_TYPE': {
      const customRecordTypes = state.customRecordTypes.map(t => t.id === action.payload.id ? action.payload : t);
      return { ...state, customRecordTypes };
    }

    case 'MARK_MESSAGE_READ': {
      const messages = state.messages.map(m => m.id === action.payload ? { ...m, read: true } : m);
      return { ...state, messages };
    }

    case 'MARK_DIRECT_MESSAGE_READ': {
      const directMessages = state.directMessages.map(m => m.id === action.payload ? { ...m, read: true } : m);
      return { ...state, directMessages };
    }

    case 'CREATE_GROUP_THREAD': {
      const { fromName, fromBadge, fromId, participantIds, participantNames, subject, body } = action.payload;
      const now = new Date();
      const ts = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const thread = {
        id: `gt-${state.nextId}`,
        type: 'group',
        subject,
        participantIds,
        participantNames,
        createdBy: fromId,
        createdAt: ts,
        messages: [{ id: `gm-${state.nextId}`, fromId, fromName, body, timestamp: ts }],
        readBy: [fromId],
      };
      const discOf = (oid) => state.officers.find(o => o.id === oid)?.discordId || '';
      const logEntry = {
        id: state.nextId + 1, type: 'group',
        from: fromName, fromBadge, fromDiscordId: discOf(fromId),
        to: participantNames.filter((_, i) => participantIds[i] !== fromId).join(', '),
        toDiscordId: participantIds.filter(pid => pid !== fromId).map(discOf).filter(Boolean).join(', '),
        subject, body, timestamp: ts,
      };
      return {
        ...state,
        groupThreads: [thread, ...(state.groupThreads || [])],
        messageLog: [logEntry, ...state.messageLog],
        nextId: state.nextId + 2,
      };
    }

    case 'SEND_GROUP_REPLY': {
      const { threadId, fromId, fromName, body } = action.payload;
      const now = new Date();
      const ts = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const newMsg = { id: `gm-${state.nextId}`, fromId, fromName, body, timestamp: ts };
      const groupThreads = (state.groupThreads || []).map(t => {
        if (t.id !== threadId) return t;
        return { ...t, messages: [...t.messages, newMsg], readBy: [fromId] };
      });
      return { ...state, groupThreads, nextId: state.nextId + 1 };
    }

    case 'MARK_GROUP_THREAD_READ': {
      const { threadId, userId } = action.payload;
      const groupThreads = (state.groupThreads || []).map(t => {
        if (t.id !== threadId) return t;
        return { ...t, readBy: [...new Set([...(t.readBy || []), userId])] };
      });
      return { ...state, groupThreads };
    }

    case 'SEND_DIRECT_MESSAGE': {
      const { fromName, fromBadge, fromId, toName, toId, subject, body } = action.payload;
      const now = new Date();
      const ts = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const entry = { id: state.nextId, fromName, fromBadge, fromId, toName, toId, subject, body, timestamp: ts, read: false, type: 'direct' };
      const discOf = (oid) => state.officers.find(o => o.id === oid)?.discordId || '';
      const logEntry = { id: state.nextId, from: fromName, fromBadge, fromDiscordId: discOf(fromId), to: toName, toDiscordId: discOf(toId), subject, body, timestamp: ts };
      return {
        ...state,
        directMessages: [...state.directMessages, entry],
        messageLog: [logEntry, ...state.messageLog],
        nextId: state.nextId + 1,
      };
    }

    case 'NOTIFICATION_BLAST': {
      const { senderName, senderBadge, senderId, title, color, body, targetDeptId } = action.payload;
      const id = `blast-${Date.now()}`;
      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const logEntry = { id: state.nextId, from: `${senderName} (${senderBadge})`, fromDiscordId: state.officers.find(o => o.id === senderId)?.discordId || '', subject: title, body, timestamp: ts, type: 'blast' };
      return {
        ...state,
        messageLog: [logEntry, ...state.messageLog],
        lastBlast: { id, senderName, senderBadge, senderId: senderId ?? null, title, color, body, time: ts, targetDeptId: targetDeptId ?? null },
        nextId: state.nextId + 1,
      };
    }

    case 'ADD_NOTIFICATION': {
      const { title, body, sender, color, time } = action.payload;
      const ts = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const entry = { id: `notif-${Date.now()}-${state.nextId}`, title, body, sender: sender || null, color: color || '#3a88e8', time: ts, read: false };
      return { ...state, notifications: [entry, ...state.notifications], nextId: state.nextId + 1 };
    }

    case 'MARK_NOTIFICATIONS_READ': {
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
    }

    case 'DISMISS_NOTIFICATION': {
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    }

    case 'CLEAR_NOTIFICATIONS': {
      return { ...state, notifications: [] };
    }

    case 'SET_TONE': {
      return { ...state, audioTones: { ...state.audioTones, ...action.payload } };
    }

    /* ─── Case Files / CID ─── */
    case 'ADD_CASE_FILE': {
      const seq = String((state.caseFiles || []).length + 1).padStart(4, '0');
      const newCase = {
        ...action.payload,
        id: state.nextId,
        caseNumber: `CID-${seq}`,
        notes: [],
        linkedCalls: [],
        linkedReports: [],
        createdAt: new Date().toISOString(),
        closedAt: null,
        closedBy: null,
      };
      const audit = addAuditEntry(state, `Opened case ${newCase.caseNumber}: ${newCase.title}`, 'CID');
      return { ...state, caseFiles: [...(state.caseFiles || []), newCase], nextId: state.nextId + 1, ...audit };
    }
    case 'UPDATE_CASE_FILE': {
      const caseFiles = (state.caseFiles || []).map(c =>
        c.id === action.payload.id ? { ...c, ...action.payload } : c
      );
      return { ...state, caseFiles };
    }
    case 'CLOSE_CASE_FILE': {
      const { id, closedBy, closedByName } = action.payload;
      const caseFiles = (state.caseFiles || []).map(c =>
        c.id === id ? { ...c, status: 'CLOSED', closedAt: new Date().toISOString(), closedBy } : c
      );
      const target = (state.caseFiles || []).find(c => c.id === id);
      const audit = addAuditEntry(state, `Closed case ${target?.caseNumber}: ${target?.title}`, 'CID');
      return { ...state, caseFiles, ...audit };
    }
    case 'LOCK_CASE_FILE': {
      const { id } = action.payload;
      const caseFiles = (state.caseFiles || []).map(c =>
        c.id === id ? { ...c, status: 'LOCKED' } : c
      );
      const target = (state.caseFiles || []).find(c => c.id === id);
      const audit = addAuditEntry(state, `Locked case ${target?.caseNumber}: ${target?.title}`, 'CID');
      return { ...state, caseFiles, ...audit };
    }
    case 'REOPEN_CASE_FILE': {
      const { id } = action.payload;
      const caseFiles = (state.caseFiles || []).map(c =>
        c.id === id ? { ...c, status: 'ACTIVE', closedAt: null, closedBy: null } : c
      );
      return { ...state, caseFiles };
    }
    case 'ADD_CASE_NOTE': {
      const { caseId, note } = action.payload;
      const newNote = { ...note, id: state.nextId, timestamp: new Date().toISOString() };
      const caseFiles = (state.caseFiles || []).map(c =>
        c.id === caseId ? { ...c, notes: [...(c.notes || []), newNote] } : c
      );
      // Tips fire a notification so assigned detectives are alerted
      let notifState = {};
      if (note.type === 'TIP') {
        const targetCase = (state.caseFiles || []).find(c => c.id === caseId);
        if (targetCase) {
          notifState = addSystemNotif(state, {
            title: `Tip — ${targetCase.caseNumber}`,
            body: `New patrol tip on "${targetCase.title}" from ${note.authorName || 'Unknown'}. Check case timeline.`,
            color: '#22c55e',
          });
        }
      }
      return { ...state, caseFiles, nextId: state.nextId + 1, ...notifState };
    }
    case 'SET_DETECTIVE': {
      const { officerId, isDetective } = action.payload;
      const officers = state.officers.map(o =>
        o.id === officerId ? { ...o, isDetective } : o
      );
      const target = state.officers.find(o => o.id === officerId);
      const audit = addAuditEntry(state, `${isDetective ? 'Designated' : 'Removed'} detective designation for ${target?.name} (${target?.badge})`, 'Command');
      return { ...state, officers, ...audit };
    }
    case 'LINK_CASE_SUBJECT': {
      const { caseId, subject } = action.payload;
      const caseFiles = (state.caseFiles || []).map(c => {
        if (c.id !== caseId) return c;
        if ((c.subjects || []).some(s => s.civilianId === subject.civilianId)) return c;
        return { ...c, subjects: [...(c.subjects || []), subject] };
      });
      return { ...state, caseFiles };
    }
    case 'UNLINK_CASE_SUBJECT': {
      const { caseId, civilianId } = action.payload;
      const caseFiles = (state.caseFiles || []).map(c =>
        c.id === caseId ? { ...c, subjects: (c.subjects || []).filter(s => s.civilianId !== civilianId) } : c
      );
      return { ...state, caseFiles };
    }
    case 'LINK_CASE_VEHICLE': {
      const { caseId, vehicle } = action.payload;
      const caseFiles = (state.caseFiles || []).map(c => {
        if (c.id !== caseId) return c;
        if ((c.vehicles || []).some(v => v.vehicleId === vehicle.vehicleId)) return c;
        return { ...c, vehicles: [...(c.vehicles || []), vehicle] };
      });
      return { ...state, caseFiles };
    }
    case 'UNLINK_CASE_VEHICLE': {
      const { caseId, vehicleId } = action.payload;
      const caseFiles = (state.caseFiles || []).map(c =>
        c.id === caseId ? { ...c, vehicles: (c.vehicles || []).filter(v => v.vehicleId !== vehicleId) } : c
      );
      return { ...state, caseFiles };
    }
    case 'LINK_CASE_CALL': {
      const { caseId, callId } = action.payload;
      const caseFiles = (state.caseFiles || []).map(c => {
        if (c.id !== caseId) return c;
        if ((c.linkedCalls || []).includes(callId)) return c;
        return { ...c, linkedCalls: [...(c.linkedCalls || []), callId] };
      });
      return { ...state, caseFiles };
    }
    case 'LINK_CASE_REPORT': {
      const { caseId, reportId } = action.payload;
      const caseFiles = (state.caseFiles || []).map(c => {
        if (c.id !== caseId) return c;
        if ((c.linkedReports || []).includes(reportId)) return c;
        return { ...c, linkedReports: [...(c.linkedReports || []), reportId] };
      });
      return { ...state, caseFiles };
    }

    default:
      return state;
  }
}

/* ── Centralized audit layer ──────────────────────────────────────────────
   Every meaningful mutation is recorded in the Master Audit Log. Reducers that
   already write their own audit entry are left alone (we detect that by the
   auditLog reference changing); everything mapped here is auto-logged. Noisy
   UI-only actions (page switches, read receipts, notification dismissals, duty
   ticks, radio seen, etc.) are intentionally NOT mapped so the log stays clean. */
const _civNm = (s, id) => {
  const c = (s.civilians || []).find(c => c.id === id);
  return c ? `${c.firstName} ${c.lastName}` : 'a civilian';
};
const _s = (v) => (v == null ? '' : String(v));

const AUDIT_MAP = {
  // Records (filing + edits + status decisions)
  ADD_RECORD:           { module: 'Records', msg: (p) => `Filed ${_s(p.type) || 'a record'}` },
  UPDATE_RECORD:        { module: 'Records', msg: (p) => `Updated record ${_s(p.id)}`.trim() },
  UPDATE_RECORD_STATUS: { module: 'Records', msg: (p) => `Set record ${_s(p.id)} status to ${_s(p.status)}` },

  // Civilians / vehicles / licenses / medical
  UPDATE_CIVILIAN:        { module: 'Civilians', msg: (p, s) => `Updated ${_civNm(s, p.id)}` },
  DELETE_CIVILIAN:        { module: 'Civilians', msg: (p, s) => `Deleted ${_civNm(s, typeof p === 'object' ? p.id : p)}` },
  ADD_VEHICLE:            { module: 'Vehicles', msg: (p) => `Registered vehicle ${_s(p.plate)}`.trim() },
  UPDATE_MEDICAL_PROFILE: { module: 'Medical', msg: (p, s) => `Updated medical profile · ${_civNm(s, p.id)}` },
  ISSUE_DRIVER_LICENSE:   { module: 'Licenses', msg: (p, s) => `Issued driver license · ${_civNm(s, p.civilianId)}` },
  RENEW_DRIVER_LICENSE:   { module: 'Licenses', msg: (p, s) => `Renewed driver license · ${_civNm(s, p.civilianId)}` },

  // Identifiers
  SAVE_IDENTIFIER:   { module: 'Identifiers', msg: () => 'Saved an identifier' },
  DELETE_IDENTIFIER: { module: 'Identifiers', msg: () => 'Deleted an identifier' },

  // Penal code
  UPDATE_CHARGE: { module: 'Penal Code', msg: () => 'Updated a charge' },
  DELETE_CHARGE: { module: 'Penal Code', msg: () => 'Deleted a charge' },

  // Flag definitions
  ADD_FLAG_DEF:    { module: 'Flags', msg: (p) => `Created flag definition ${_s(p.name)}`.trim() },
  UPDATE_FLAG_DEF: { module: 'Flags', msg: (p) => `Updated flag definition ${_s(p.name)}`.trim() },
  DELETE_FLAG_DEF: { module: 'Flags', msg: () => 'Deleted a flag definition' },

  // Templates
  ADD_REPORT_TEMPLATE:       { module: 'Templates', msg: (p) => `Created report template ${_s(p.name)}`.trim() },
  UPDATE_REPORT_TEMPLATE:    { module: 'Templates', msg: (p) => `Updated report template ${_s(p.name)}`.trim() },
  DELETE_REPORT_TEMPLATE:    { module: 'Templates', msg: () => 'Deleted a report template' },
  ADD_RECORD_TEMPLATE:       { module: 'Templates', msg: (p) => `Created record template ${_s(p.name)}`.trim() },
  UPDATE_RECORD_TEMPLATE:    { module: 'Templates', msg: (p) => `Updated record template ${_s(p.name)}`.trim() },
  DELETE_RECORD_TEMPLATE:    { module: 'Templates', msg: () => 'Deleted a record template' },
  ADD_CUSTOM_RECORD_TYPE:    { module: 'Templates', msg: () => 'Added a custom record type' },
  UPDATE_CUSTOM_RECORD_TYPE: { module: 'Templates', msg: () => 'Updated a custom record type' },

  // Admin / customization
  ADMIN_UPDATE:          { module: 'Customization', msg: (p) => `Updated ${_s(p.key) || 'a setting'}` },
  ADMIN_REORDER:         { module: 'Customization', msg: (p) => `Reordered ${_s(p.key) || 'entries'}` },
  UPDATE_DEPARTMENT:     { module: 'Customization', msg: () => 'Updated a department' },
  SET_HELP_CONTENT:      { module: 'Customization', msg: () => 'Updated help content' },
  UPDATE_CIVILIAN_FORMS: { module: 'Customization', msg: () => 'Updated civilian forms' },
  SET_TONE:              { module: 'Customization', msg: () => 'Updated a notification tone' },

  // Business
  UPDATE_BUSINESS:   { module: 'Business', msg: () => 'Updated a business' },
  ADD_EMPLOYEE:      { module: 'Business', msg: () => 'Added an employee' },
  REMOVE_EMPLOYEE:   { module: 'Business', msg: () => 'Removed an employee' },
  APPROVE_WHITELIST: { module: 'Admin', msg: () => 'Approved a whitelist application' },
  DENY_WHITELIST:    { module: 'Admin', msg: () => 'Denied a whitelist application' },

  // Broadcast messages (mass notifications only — routine DMs are not logged)
  NOTIFICATION_BLAST: { module: 'Messages', msg: (p) => `Sent a notification blast: ${_s(p.title)}`.trim() },
};

function reducer(state, action) {
  const next = baseReducer(state, action);
  // No-op, unmapped, or the reducer already wrote its own audit entry → leave it.
  if (next === state || !AUDIT_MAP[action.type] || next.auditLog !== state.auditLog) return next;
  const meta = AUDIT_MAP[action.type];
  let text;
  try { text = meta.msg(action.payload || {}, state, next); } catch { text = null; }
  if (!text) return next;
  const user = state.currentUser || next.currentUser;
  const entry = {
    id: next.nextId,
    user: user ? `${user.name} (${user.badge || user.role})` : 'System',
    action: text,
    timestamp: new Date().toLocaleString(),
    module: meta.module,
  };
  return { ...next, auditLog: [entry, ...next.auditLog], nextId: next.nextId + 1 };
}

const CADContext = createContext(null);

export function CADProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <CADContext.Provider value={{ state, dispatch }}>{children}</CADContext.Provider>;
}

export function useCAD() {
  return useContext(CADContext);
}
