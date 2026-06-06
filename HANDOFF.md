# SSRP CAD — Front-End → Back-End Handoff

This is a **front-end-only** React app driven by mock data. All state lives in one
reducer and every change flows through a **dispatched action**. That action set is
effectively the API contract. This doc gives the backend everything needed to wire in:
the integration seams, the action/event catalog, and the data model.

---

## 1. Architecture & stack

- **React 19 + Vite + Tailwind**, React Router 7.
- **State:** a single `useReducer` store — `src/store/cadStore.jsx` (`CADProvider` / `useCAD()`).
  - `const { state, dispatch } = useCAD();`
  - Components **never fetch or mutate directly** — they `dispatch({ type, payload })`.
  - There is exactly **one** reducer `switch` (~131 cases). This is the whole write surface.
- **Seed data:** `src/data/mockData.js`, `adminData.js`, `civilianFormsDefaults.js`, `helpDefaults.js`
  are imported into `initialState`. **These define the entity schemas.**
- **No network layer exists yet** (the only `fetch` is loading a logo image for PDF export).
- **Persistence today:** none for the main store (in-memory; resets on reload).
  `localStorage` is used only for: report/record **drafts** (ReportsCenter/RecordsCenter),
  **active character** (CivilianContext), and the mock **login** (LoginPage).

---

## 2. The four integration seams (Steve's surface)

1. **Hydration** — replace the synchronous `initialState` (mock imports) in
   `src/store/cadStore.jsx` with data fetched from the API on app load. Add a loading state.
2. **Persistence** — the ~90 *mutating* actions update local state only. Each needs to also
   call the API. Cleanest approach: a **middleware/effect** that maps `action.type → endpoint`
   so components stay unchanged (see §5).
3. **Real-time** — calls, unit statuses, panics, messages, notifications, tow/fire requests are
   single-session/in-memory. Multi-user needs websockets/SSE that dispatch the same actions
   inbound (the reducer already knows how to apply them).
4. **Auth** — `LOGIN` / `CONNECT_DISCORD` are mock. Wire real Discord OAuth + sessions; on success
   dispatch `LOGIN` with the resolved user (shape below).

### Smaller decisions to agree on
- **IDs:** the front-end currently generates IDs (`state.nextId` counter, `Date.now()`,
  `Math.random()`). With a backend the **server owns IDs** — return the created entity and let
  the reducer use the server ID (adjust the `ADD_*` reducers or echo the server response).
- **File uploads:** photos / mugshots / tones are stored as **base64 data URLs** in state.
  Replace with upload endpoints that return URLs; the UI already renders `<img src={url}>`, so
  swapping data-URLs → real URLs is trivial.
- **Config:** no env usage yet. Add `VITE_API_URL` (a `src/config.js` is the obvious home).

---

## 3. Action / event catalog (the API contract)

Format: `ACTION_TYPE` — payload — effect. "uses payload" = whole payload is the entity/patch.
Actions marked **(read-receipt/UI-only)** are local-only and need no backend (or a lightweight one).

### Auth / session
- `LOGIN` — `user` object — sets `currentUser`, marks connected.
- `LOGOUT` — none — clears session.
- `CONNECT_DISCORD` — `discordAccount?` — marks `discordConnected`.
- `EXIT_TO_HOME` — none — back to portal select.
- `SET_PAGE` — page — **(UI-only)**.
- `SET_SIGNATURE` — signature — sets the user's report signature.

### Dispatch / calls / units
- `CREATE_CALL` — call — new 911/dispatch call.
- `UPDATE_CALL` — `{ id, ...patch }`.
- `CLOSE_CALL` — `{ id }` (or callId).
- `ASSIGN_UNIT` — `{ callId, unitId }`.
- `DETACH_UNIT` — `{ callId, unitId }`.
- `SET_MY_CALL` — callId — current user's active call.
- `SET_STATUS` — statusCode (string) — own unit status.
- `SET_UNIT_STATUS` — `{ unitId, status }`.
- `PANIC` — `{ unit, name, location, officerId, x, y, z }` — raises a panic.
- `CLEAR_PANIC` — officerId.
- `DISMISS_PANIC_MAP` — **(UI-only)**.
- `DISPATCH_RADIO` — TX entry — radio log line.
- `MARK_RADIO_SEEN` — **(UI-only)**.
- `TOGGLE_SELF_DISPATCH` — none — **(UI-only toggle)**.
- `ADD_UNIT_GROUP` / `UPDATE_UNIT_GROUP` / `DELETE_UNIT_GROUP` — group CRUD.

### Civilians / vehicles / licenses / medical / flags / notes
- `ADD_CIVILIAN` — civilian — new character.
- `UPDATE_CIVILIAN` — `{ id, ...patch }`.
- `DELETE_CIVILIAN` — id.
- `ADD_VEHICLE` — vehicle.
- `UPDATE_VEHICLE` — `{ id, ...patch }`.
- `ISSUE_DRIVER_LICENSE` — `{ civilianId, dlClass, dlStatus, dlExpiry, dlEndorsements }`.
- `RENEW_DRIVER_LICENSE` — same shape.
- `UPDATE_MEDICAL_PROFILE` — `{ id, medicalProfile }`.
- `ADD_CIVILIAN_FLAG` — `{ civilianId, flagId }`.
- `REMOVE_CIVILIAN_FLAG` — `{ civilianId, flagId }`.
- `ADD_CIVILIAN_NOTE` — `{ civilianId, text, author:{id,name,badge} }`.
- `UPDATE_CIVILIAN_NOTE` — `{ civilianId, noteId, text, editor }` (supervisor/command only).

### License points / suspension engine
- `ADD_LICENSE_POINTS` — `{ civilianId, points, reason }` — auto-suspends across `licensePointsConfig.tiers`.
- `RESET_LICENSE_POINTS` — civilianId.
- `MANUAL_SUSPEND` — `{ civilianId, reason }`.
- `LIFT_SUSPENSION` — civilianId.

### Warrants
- `ADD_WARRANT` — warrant (also stamps a `WARRANT` flag on the civilian).
- `SERVE_WARRANT` — warrant id, or `{ id, servedBy, caseNumber? }` — marks SERVED, stamps
  `servedBy`/`servedDate`(/`servedCaseNumber`), and clears the civilian's `WARRANT` flag once no ACTIVE warrants remain.
- **Auto-serve on filing:** a `warrant_lookup` template field stores linked warrants as
  `[{ warrantId, civilianId, civilianName, label }]`. `ADD_REPORT` / `ADD_RECORD` read those
  off the filed form (via the template snapshot) and serve each linked warrant automatically —
  same effect as `SERVE_WARRANT`, stamped with the filing officer + that report/record's number.
  Linking a warrant in the UI also merges its charges into the form's `charges` field and
  back-fills the subject civilian. `warrant_lookup` is a first-class field type in the records
  creator (Admin → Custom Records), so it can be added to any report/record template.

### Reports & records (templated documents)
- `ADD_REPORT` — `{ type, caseNumber, officerBadge, callId, civilianId, summary, formData }`
  — server should assign number/id; FE stamps `reportNumber`, `templateSnapshot`, signatures.
- `UPDATE_REPORT` — `{ id, formData }` (supplements/edits).
- `UPDATE_REPORT_STATUS` — `{ id, status, supervisorSignature }`.
- `RETURN_REPORT` — `{ id, comment, supervisorName, supervisorBadge }` — sends back + notifies officer.
- `RESUBMIT_REPORT` — `{ id, formData, officerSignature }`.
- `ADD_RECORD` / `UPDATE_RECORD` / `UPDATE_RECORD_STATUS` / `RESUBMIT_RECORD` — same pattern for records.
- `ADD_ARREST` — arrest record.
- **Note:** filed reports/records carry a `templateSnapshot` (frozen copy of the template) so they
  render even after the template changes/deletes — persist this with the document.

### Templates (the record/report builder output)
- `ADD_REPORT_TEMPLATE` / `UPDATE_REPORT_TEMPLATE` / `DELETE_REPORT_TEMPLATE` — template object;
  **FE keeps the builder-assigned id** (`tpl_…` / `r…`) — honor it server-side.
- `ADD_RECORD_TEMPLATE` / `UPDATE_RECORD_TEMPLATE` / `DELETE_RECORD_TEMPLATE`.
- `ADD_CUSTOM_RECORD_TYPE` / `UPDATE_CUSTOM_RECORD_TYPE`.

### Penal code & flag definitions
- `ADD_CHARGE` / `UPDATE_CHARGE` / `DELETE_CHARGE`.
- `ADD_FLAG_DEF` / `UPDATE_FLAG_DEF` / `DELETE_FLAG_DEF` (the admin Civilian-Flags config).

### Messages & notifications
- `SEND_DIRECT_MESSAGE` — `{ fromName, fromBadge, fromId, toName, toId, subject, body }`.
- `CREATE_GROUP_THREAD` — `{ fromName, fromBadge, fromId, participantIds, participantNames, subject, body }`.
- `SEND_GROUP_REPLY` — `{ threadId, fromId, fromName, body }`.
- `MARK_MESSAGE_READ` / `MARK_DIRECT_MESSAGE_READ` / `MARK_GROUP_THREAD_READ` — **(read-receipts)**.
- `NOTIFICATION_BLAST` — `{ senderName, senderBadge, senderId, title, color, body, targetDeptId }`.
- `ADD_NOTIFICATION` — `{ title, body, sender, color, time }` — supports `recipientBadge` targeting.
- `MARK_NOTIFICATIONS_READ` / `DISMISS_NOTIFICATION` / `CLEAR_NOTIFICATIONS` — **(UI-only)**.

### Identifiers (officer call-sign profiles)
- `SAVE_IDENTIFIER` — `{ id, ...fields }`.
- `DELETE_IDENTIFIER` — id.
- `LOAD_IDENTIFIER` — id (activate).
- `PATCH_OFFICER` — `{ ...patch }` (name, avatar, active identifier…).

### Tow / FDOT / HCFR
- `ADD_TOW` / `ADD_TOW_JOB` / `UPDATE_TOW_JOB` / `CANCEL_TOW_JOB`.
- `ADD_TOW_UNIT` / `UPDATE_TOW_UNIT` / `REMOVE_TOW_UNIT`.
- `ADD_FDOT_REQUEST` / `UPDATE_FDOT_REQUEST`.
- `ADD_HCFR_REQUEST` / `UPDATE_HCFR_REQUEST`.
- `DISMISS_UNROUTED` / `RESOLVE_UNROUTED` `{ id, targetQueue }`.

### Businesses / permits
- `ADD_BUSINESS` / `UPDATE_BUSINESS` / `DELETE_BUSINESS`.
- `UPDATE_BUSINESS_LICENSE` — `{ id, action }`.
- `ADD_EMPLOYEE` — `{ businessId, employee }`.
- `REMOVE_EMPLOYEE` — `{ businessId, employeeId }`.
- `ADD_PERMIT` / `REVOKE_PERMIT`.

### Case files (CID / detectives)
- `ADD_CASE_FILE` / `UPDATE_CASE_FILE` / `CLOSE_CASE_FILE` `{ id, closedBy, closedByName }` /
  `REOPEN_CASE_FILE` `{ id }` / `LOCK_CASE_FILE` `{ id }`.
- `ADD_CASE_NOTE` — `{ caseId, note }`.
- `LINK_CASE_SUBJECT` `{ caseId, subject }` / `UNLINK_CASE_SUBJECT` `{ caseId, civilianId }`.
- `LINK_CASE_VEHICLE` `{ caseId, vehicle }` / `UNLINK_CASE_VEHICLE` `{ caseId, vehicleId }`.
- `LINK_CASE_CALL` `{ caseId, callId }` / `LINK_CASE_REPORT` `{ caseId, reportId }`.
- `SET_DETECTIVE` — `{ officerId, isDetective }`.

### Departments
- `ADD_DEPARTMENT` / `UPDATE_DEPARTMENT`.

### Whitelist & bans
- `APPROVE_WHITELIST` / `DENY_WHITELIST` — application id.
- `BAN_USER` — ban — / `UNBAN_USER` — id.

### Admin config (generic CRUD — used by most admin sections)
These five drive almost every admin settings page. `key` = the state slice name.
- `ADMIN_SET` — `{ key, value }` — replace a whole config object (single-record editors).
- `ADMIN_ADD` — `{ key, item }` — append to a keyed array.
- `ADMIN_UPDATE` — `{ key, item:{id,…} }` — merge by id.
- `ADMIN_REMOVE` — `{ key, id }`.
- `ADMIN_REORDER` — `{ key, id, dir }` — move ±1.
- Specific config writers: `SET_HELP_CONTENT`, `SET_TONE`, `UPDATE_CIVILIAN_FORMS` `{ form, config }`.

### Admin destructive / backups
- `WIPE` — target (e.g. `'civilians'`, `'allReports'`, `'report:<type>'`, `'civilianFlags'`, `'licensePoints'`)
  — clears the slice **and auto-saves a restorable snapshot** to `wipeBackups`.
- `RESTORE_BACKUP` — backupId — re-imports a snapshot.

> Every action above is audit-logged where it matters (see `auditLog` + the centralized
> audit map in the reducer). Mirror that server-side if you want a real audit trail.

---

## 4. Data model

### Top-level state slices (`initialState`)
`currentUser, currentPage, discordConnected, selfDispatch, officers, calls, callLogs,
civilians, vehicles, warrants, criminalHistory, penalCode, reports, records, reportTemplates,
recordTemplates, civilianForms, bannedUsers, auditLog, messages, directMessages, groupThreads,
messageLog, notifications, wipeBackups, audioTones, customRecordTypes, towLogs, towJobs,
towUnits, fdotRequests, hcfrRequests, departments, whitelistApps, activeSessions, businesses,
permits, unroutedRequests, unitGroups, callNatures, tenCodes, unitStatusCodes, adminAccounts,
permissionKeys, quickLinks, notificationTones, adminServers, lookupTypes, adminAddresses,
communityConfig, helpContent, geoSettings, loginPageConfig, accountRestrictions, discordPresence,
limitsConfig, discordRoleMappings, adminTiers, caseFiles, inGameConfig, customFlags,
uniqueIdentifiers, licensePointsConfig, nextId, reportSeq, dispatchLog, activePanics`

### Key entity shapes (from `src/data/`)
- **Officer:** `id, name, badge, unitId, dept, deptShort, subdivision, rank, status, callId, location, discordId, role`
- **Civilian:** `id, firstName, lastName, dob, gender, ethnicity, height, weight, hair, eyes, ssn, phone, address, dlNumber, dlClass, dlStatus, dlExpiry, dlEndorsements, vehicles[], flags[], notes[], profilePhoto, weaponPermit, medicalProfile, licensePoints`
- **Vehicle:** `id, plate, type, make, model, year, color, regStatus, regExpiry, ownerId, businessOwnerId, stolen, flags[]`
- **Call:** `id, nature, category, location, city, county, priority, status, units[], description, timestamp, reportingParty`
- **Report/Record:** `id, type, caseNumber/recordNumber, officerBadge, date, status, callId, civilianId, summary, formData{}, templateSnapshot{}, officerSignature, supervisorSignature, supervisorComments[]`
- **Warrant:** `id, civilianId, civilianName, type, charge, issuedBy, issuedDate, status, notes` (+ on serve: `servedBy, servedDate, servedCaseNumber`)
- **Template:** `id, name, agency, formCode, showDept, portals[], sections[ { id, title, style, lookup, supervisorOnly, fields[ {id,label,type,span,required,unique,readOnly,…} ] } ]`

> Full canonical examples live in `src/data/mockData.js` — point Steve there for exact fields.

---

## 5. Recommended integration approach (no UI rewrite)

Because every write is a typed action, the lowest-friction path is a **persistence middleware**:

```js
// 1) Hydrate: fetch initial state, pass to the reducer instead of mock initialState.
// 2) Wrap dispatch so mutating actions also hit the API:
const ACTION_ENDPOINTS = {
  ADD_CIVILIAN:   (p) => ({ method: 'POST',  url: '/civilians', body: p }),
  UPDATE_CIVILIAN:(p) => ({ method: 'PATCH', url: `/civilians/${p.id}`, body: p }),
  // … one line per mutating action
};
function withApi(dispatch) {
  return (action) => {
    dispatch(action);                          // optimistic local update
    const map = ACTION_ENDPOINTS[action.type];
    if (map) api(map(action.payload));         // fire to backend (reconcile id/errors)
  };
}
// 3) Real-time: socket.on('event', a => dispatch(a)) — inbound events reuse the same actions.
```

This keeps all 80+ pages untouched. Read-receipt / UI-only actions can be skipped or debounced.

---

## 6. Gotchas / notes for Steve
- **Optimistic IDs:** FE assigns `nextId`/`tpl_…`/`note_…` before the server replies — reconcile
  with server IDs (or have the FE wait for the response and swap).
- **`templateSnapshot`** must be stored with each filed report/record (renders historical docs).
- **Photos/tones are base64 data URLs** in state today — move to object storage; UI just needs URLs.
- **Portal scoping** of templates is driven by `template.portals[]` (see `src/utils/templateScope.js`).
- **Auth/permissions** are currently role/rank strings on the officer (`role`, `rank`) + `adminTiers`
  / `permissionKeys` / `discordRoleMappings` config — that's the model to enforce server-side.
- **localStorage** keys: `ssrp_report_draft_*`, `ssrp_record_draft_*`, active-character, login — client-only, fine to keep.

---

_Generated as a front-end handoff reference. The reducer in `src/store/cadStore.jsx` is the
authoritative source — this doc summarizes it._
