import { createContext, useContext, useReducer } from 'react';
import {
  OFFICERS, CALLS, CIVILIANS, VEHICLES, WARRANTS, CRIMINAL_HISTORY,
  PENAL_CODE, REPORTS, REPORT_TEMPLATES, BANNED_USERS, AUDIT_LOG,
  MESSAGES, CUSTOM_RECORD_TYPES, TOW_LOGS, DEPARTMENTS, WHITELIST_APPS, ACTIVE_SESSIONS
} from '../data/mockData';

const initialState = {
  currentUser: null,
  currentPage: 'login',
  officers: OFFICERS,
  calls: CALLS,
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
  myCallId: null,
  nextId: 1000,
};

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
    case 'LOGIN':
      return { ...state, currentUser: action.payload, currentPage: 'dispatch' };
    case 'LOGOUT':
      return { ...state, currentUser: null, currentPage: 'login', myCallId: null };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };

    case 'SET_STATUS': {
      const officers = state.officers.map(o =>
        o.id === state.currentUser?.id ? { ...o, status: action.payload } : o
      );
      const audit = addAuditEntry(state, `Status changed to ${action.payload}`, 'CAD');
      return { ...state, officers, ...audit };
    }

    case 'CREATE_CALL': {
      const newCall = { ...action.payload, id: `23-${1048 + state.calls.length}`, timestamp: new Date().toLocaleString(), units: [] };
      const audit = addAuditEntry(state, `Created call ${newCall.id} (${newCall.nature})`, 'Dispatch');
      return { ...state, calls: [newCall, ...state.calls], ...audit };
    }
    case 'UPDATE_CALL': {
      const calls = state.calls.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c);
      return { ...state, calls };
    }
    case 'CLOSE_CALL': {
      const calls = state.calls.map(c => c.id === action.payload ? { ...c, status: 'CLOSED' } : c);
      const audit = addAuditEntry(state, `Closed call ${action.payload}`, 'Dispatch');
      return { ...state, calls, ...audit };
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
      return { ...state, calls, officers };
    }
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
