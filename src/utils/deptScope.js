/* ────────────────────────────────────────────────────────────────────────────
   Department scoping for the Command & Supervisor portals.

   FOUNDATION — read before wiring the backend (Steve):

   Every LEO department has its OWN Command role and its OWN Supervisor role in
   Discord (e.g. "TPD Command", "TPD Supervisor", "HCSO Command", …). There is
   intentionally NO agency-wide / Emergency-Services command role. A user who
   holds a dept Command or Supervisor role may only see and act on personnel,
   reports, and records belonging to THAT department.

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

/**
 * Resolve the department scope for a Command/Supervisor portal user.
 *
 * @param {object|null} currentUser  the logged-in user (carries .dept, .cadRole, .role)
 * @param {object|null} myOfficer    the matching officer record (demo fallback for .dept)
 * @returns {{ deptId: number|null, unrestricted: boolean }}
 *   - unrestricted:true  → community admin, may view all departments
 *   - deptId:<id>        → scope every list/query to this department id
 *   - deptId:null + unrestricted:false → no department resolved (show nothing dept-specific)
 */
export function getScopeDeptId(currentUser, myOfficer) {
  if (currentUser?.role === 'admin') {
    return { deptId: null, unrestricted: true };
  }
  // Steve: prefer the dept carried by the Command/Supervisor Discord role.
  const deptId = currentUser?.dept ?? myOfficer?.dept ?? null;
  return { deptId, unrestricted: false };
}
