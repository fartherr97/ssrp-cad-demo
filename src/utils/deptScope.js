/* ────────────────────────────────────────────────────────────────────────────
   Department scoping for the Command & Supervisor portals.

   FOUNDATION — read before wiring the backend:

   Every ES (Emergency Services) department has its OWN Command role and its
   OWN Supervisor role in Discord (e.g. "TPD Command", "TPD Supervisor",
   "HCSO Command", …). There is intentionally NO agency-wide / cross-dept
   command role.

   ES departments are those with type "LEO" or "Fire" (see ES_DEPT_TYPES in
   constants/portals.js). Civilian-type departments — FDOT and CIV-OPS — are
   support/operational departments that are NOT subject to Command/Supervisor
   scoping and do not appear in ES-specific department filters.

   On login, the backend should populate two fields on currentUser from whatever
   dept Command/Supervisor Discord role the member holds:
     • currentUser.dept    → the CAD department id that role is bound to
     • currentUser.cadRole → 'command' | 'supervisor' (informational for now)

   Until the backend is connected, the demo falls back to the department on the
   signed-in officer record (myOfficer.dept), which mirrors the same shape.

   Community admins (currentUser.role === 'admin') are NOT department-bound —
   they get an unrestricted view with a department picker. This is the only
   "see everything" path and it is separate from the dept command/sup roles.
   ──────────────────────────────────────────────────────────────────────────── */

import { isESDept } from '../constants/portals';

/**
 * Resolve the department scope for a Command/Supervisor portal user.
 *
 * Only applies to ES departments (LEO / Fire). Civilian-type departments
 * (FDOT, CIV-OPS) are excluded from scoping entirely.
 *
 * @param {object|null} currentUser  the logged-in user (carries .dept, .cadRole, .role)
 * @param {object|null} myOfficer    the matching officer record (demo fallback for .dept)
 * @param {Array}       departments  full departments list (used to confirm the dept is ES)
 * @returns {{ deptId: number|null, unrestricted: boolean }}
 *   - unrestricted:true  → community admin, may view all departments
 *   - deptId:<id>        → scope every list/query to this ES department id
 *   - deptId:null + unrestricted:false → no ES department resolved
 */
export function getScopeDeptId(currentUser, myOfficer, departments = []) {
  if (currentUser?.role === 'admin') {
    return { deptId: null, unrestricted: true };
  }
  // Prefer the dept carried by the Command/Supervisor Discord role.
  const deptId = currentUser?.dept ?? myOfficer?.dept ?? null;
  // Ensure the resolved dept is actually an ES department.
  const dept = departments.find(d => d.id === deptId);
  if (dept && !isESDept(dept)) {
    return { deptId: null, unrestricted: false };
  }
  return { deptId, unrestricted: false };
}
