import { createContext, useContext, useReducer } from 'react';
import {
  OFFICERS, CALLS, CIVILIANS, VEHICLES, WARRANTS, CRIMINAL_HISTORY,
  PENAL_CODE, REPORTS, REPORT_TEMPLATES, BANNED_USERS, AUDIT_LOG,
  MESSAGES, CUSTOM_RECORD_TYPES, TOW_LOGS, DEPARTMENTS, WHITELIST_APPS, ACTIVE_SESSIONS,
  BUSINESSES
} from '../data/mockData';
import {
  TEN_CODES, CHARGE_TYPES, BOND_TYPES, STATUTES, UNIT_STATUS_CODES,
  ADMIN_ACCOUNTS, PERMISSION_KEYS, QUICK_LINKS, NOTIFICATION_TONES,
  ADMIN_SERVERS, LOOKUP_TYPES, ADMIN_ADDRESSES, COMMUNITY_CONFIG,
  GEO_SETTINGS, LOGIN_PAGE_CONFIG, ACCOUNT_RESTRICTIONS, DISCORD_PRESENCE,
} from '../data/adminData';

const initialState = {
  currentUser: null,
  currentPage: 'login',
  discordConnected: false,
  officers: OFFICERS,
  // Stamp each seed call with a staggered creation time (most recent first) so
  // the live elapsed-time clocks in the console read realistically.
  calls: CALLS.map((c, i) => ({ ...c, createdAt: Date.now() - (i * 6 + 3) * 60000 })),
  civilians: CIVILIANS,
  vehicles: VEHICLES,
  warrants: WARRANTS,
  criminalHistory: CRIMINAL_HISTORY,
  penalCode: PENAL_CODE,
  reports: REPORTS,
  reportTemplates: REPORT_TEMPLATES,
  bannedUsers: BANNED_USERS,
  auditLog: AUDIT_LOG,
  messages: MESSAGES,
  customRecordTypes: CUSTOM_RECORD_TYPES,
  towLogs: TOW_LOGS,
  departments: DEPARTMENTS,
  whitelistApps: WHITELIST_APPS,
  activeSessions: ACTIVE_SESSIONS,
  businesses: BUSINESSES,
  // ─── Admin customization config ───
  tenCodes: TEN_CODES,
  chargeTypes: CHARGE_TYPES,
  bondTypes: BOND_TYPES,
  statutes: STATUTES,
  unitStatusCodes: UNIT_STATUS_CODES,
  adminAccounts: ADMIN_ACCOUNTS,
  permissionKeys: PERMISSION_KEYS,
  quickLinks: QUICK_LINKS,
  notificationTones: NOTIFICATION_TONES,
  adminServers: ADMIN_SERVERS,
  lookupTypes: LOOKUP_TYPES,
  adminAddresses: ADMIN_ADDRESSES,
  communityConfig: COMMUNITY_CONFIG,
  geoSettings: GEO_SETTINGS,
  loginPageConfig: LOGIN_PAGE_CONFIG,
  accountRestrictions: ACCOUNT_RESTRICTIONS,
  discordPresence: DISCORD_PRESENCE,
  myCallId: null,
  nextId: 1000,
  // Radio broadcast counters drive the MDT nav badge + toast. `radioCount` is
  // the running total of dispatcher radio broadcasts; `radioSeen` is how many
  // the current viewer has acknowledged (by opening the MDT Radio feed).
  radioCount: 0,
  radioSeen: 0,
  lastRadio: null,
  dispatchLog: [
    { id: 'seed-6', time: '15:04:11', kind: 'call',   text: 'Call 26-1051 created — Road Hazard (I-275 SB / Sligh Ave)' },
    { id: 'seed-5', time: '15:01:44', kind: 'call',   text: 'Call 26-1050 created — Theft / Shoplifting (4302 W Boy Scout Blvd)' },
    { id: 'seed-4', time: '14:52:00', kind: 'alert',  text: 'Call 26-1048 — CARDIAC ARREST. 210 Bayshore Blvd Apt 4B. ALS required.' },
    { id: 'seed-3', time: '14:45:22', kind: 'unit',   text: 'Unit FHP-214 dispatched to 26-1046 (MVA w/ Injuries)' },
    { id: 'seed-2', time: '14:35:18', kind: 'unit',   text: 'Units HCFR-E11, HCFR-L7, HCFR-M3 dispatched to 26-1044 (Structure Fire)' },
    { id: 'seed-1', time: '14:22:04', kind: 'call',   text: 'Call 26-1042 created — Traffic Stop (Elm St / Route 9)' },
    { id: 'seed-0', time: '14:05:11', kind: 'alert',  text: 'BOLO — Black Dodge Charger plate SUS-1109. Owner has active warrant. No approach without backup.' },
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

function addAuditEntry(state, action, module) {
  const user = state.currentUser;
  const entry = {
    id: state.nextId,
    user: user ? `${user.name} (${user.badge || user.role})` : 'System',
    action,
    timestamp: new Date().toLocaleString(),
    module,
  };
  return { auditLog: [entry, ...state.auditLog], nextId: state.nextId + 1 };
}

function reducer(state, action) {
  switch (action.type) {
    case 'CONNECT_DISCORD':
      return { ...state, discordConnected: true };
    case 'LOGIN':
      return { ...state, currentUser: action.payload, currentPage: 'dispatch', discordConnected: true };
    case 'EXIT_TO_HOME':
      // Return to the portal-selection screen — drop the active role but keep
      // the Discord connection so the role grid is shown immediately.
      return { ...state, currentUser: null, currentPage: 'login', myCallId: null, discordConnected: true };
    case 'LOGOUT':
      return { ...state, currentUser: null, currentPage: 'login', myCallId: null, discordConnected: false };
    case 'SET_SIGNATURE':
      return { ...state, currentUser: { ...state.currentUser, signature: action.payload } };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };

    case 'SET_STATUS': {
      const me = state.officers.find(o => o.id === state.currentUser?.id);
      const officers = state.officers.map(o =>
        o.id === state.currentUser?.id ? { ...o, status: action.payload } : o
      );
      const audit = addAuditEntry(state, `Status changed to ${action.payload}`, 'CAD');
      const log = me ? addDispatchLog(state, `Unit ${me.unitId} (${me.name}) → ${action.payload}`, 'status') : {};
      return { ...state, officers, ...audit, ...log };
    }

    case 'CREATE_CALL': {
      const newCall = { ...action.payload, id: `23-${1048 + state.calls.length}`, timestamp: new Date().toLocaleString(), createdAt: Date.now(), units: [] };
      const audit = addAuditEntry(state, `Created call ${newCall.id} (${newCall.nature})`, 'Dispatch');
      const log = addDispatchLog(state, `Call ${newCall.id} created — ${newCall.nature} (${newCall.location})`, 'call');
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
      const log = addDispatchLog(state, `Call ${action.payload} closed — units cleared`, 'call');
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
      const officers = state.officers.map(o => o.unitId === unitId ? { ...o, status } : o);
      const audit = addAuditEntry(state, `Set unit ${unitId} status to ${status}`, 'Dispatch');
      const log = addDispatchLog(state, `Unit ${unitId}${target ? ` (${target.name})` : ''} → ${status}`, 'status');
      return { ...state, officers, ...audit, ...log };
    }
    case 'DISPATCH_RADIO': {
      const log = addDispatchLog(state, `[RADIO] ${action.payload}`, 'alert');
      return {
        ...state,
        ...log,
        radioCount: state.radioCount + 1,
        lastRadio: { text: action.payload, time: nowTime(), id: `${Date.now()}` },
      };
    }
    case 'MARK_RADIO_SEEN':
      return { ...state, radioSeen: state.radioCount };
    case 'SET_MY_CALL':
      return { ...state, myCallId: action.payload };

    case 'ADD_CIVILIAN': {
      const newCiv = { ...action.payload, id: state.nextId, vehicles: [], flags: [] };
      const audit = addAuditEntry(state, `Created civilian record: ${newCiv.firstName} ${newCiv.lastName}`, 'Civilian');
      return { ...state, civilians: [...state.civilians, newCiv], nextId: state.nextId + 1, ...audit };
    }
    case 'UPDATE_CIVILIAN': {
      const civilians = state.civilians.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c);
      return { ...state, civilians };
    }
    case 'DELETE_CIVILIAN': {
      const civilians = state.civilians.filter(c => c.id !== action.payload);
      return { ...state, civilians };
    }

    case 'ADD_VEHICLE': {
      const newVeh = { ...action.payload, id: state.nextId, flags: [], stolen: false };
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
      const warrants = state.warrants.map(w => w.id === action.payload ? { ...w, status: 'SERVED' } : w);
      const audit = addAuditEntry(state, `Marked warrant ${action.payload} as served`, 'Warrants');
      return { ...state, warrants, ...audit };
    }

    case 'ADD_ARREST': {
      const newArrest = { ...action.payload, id: state.nextId };
      const audit = addAuditEntry(state, `Added arrest record for civilian ID ${action.payload.civilianId}`, 'RMS');
      return { ...state, criminalHistory: [...state.criminalHistory, newArrest], nextId: state.nextId + 1, ...audit };
    }

    case 'ADD_REPORT': {
      const newReport = { ...action.payload, id: state.nextId, status: 'Submitted', date: new Date().toLocaleDateString() };
      const audit = addAuditEntry(state, `Submitted ${newReport.type} report`, 'Reports');
      return { ...state, reports: [...state.reports, newReport], nextId: state.nextId + 1, ...audit };
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
      const b = { ...action.payload, id: state.nextId, employees: [], incidents: [], ownedByPlayer: true, status: 'ACTIVE' };
      const audit = addAuditEntry(state, `Registered business: ${b.name}`, 'Business');
      return { ...state, businesses: [...state.businesses, b], nextId: state.nextId + 1, ...audit };
    }
    case 'UPDATE_BUSINESS': {
      const businesses = state.businesses.map(b => b.id === action.payload.id ? { ...b, ...action.payload } : b);
      return { ...state, businesses };
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
    case 'UPDATE_REPORT_STATUS': {
      const reports = state.reports.map(r => r.id === action.payload.id ? { ...r, status: action.payload.status } : r);
      const audit = addAuditEntry(state, `${action.payload.status} report ID ${action.payload.id}`, 'Reports');
      return { ...state, reports, ...audit };
    }
    case 'ADD_REPORT_TEMPLATE': {
      const newTpl = { ...action.payload, id: state.nextId };
      return { ...state, reportTemplates: [...state.reportTemplates, newTpl], nextId: state.nextId + 1 };
    }
    case 'UPDATE_REPORT_TEMPLATE': {
      const reportTemplates = state.reportTemplates.map(t => t.id === action.payload.id ? action.payload : t);
      return { ...state, reportTemplates };
    }
    case 'DELETE_REPORT_TEMPLATE': {
      const reportTemplates = state.reportTemplates.filter(t => t.id !== action.payload);
      return { ...state, reportTemplates };
    }

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

    default:
      return state;
  }
}

const CADContext = createContext(null);

export function CADProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <CADContext.Provider value={{ state, dispatch }}>{children}</CADContext.Provider>;
}

export function useCAD() {
  return useContext(CADContext);
}
