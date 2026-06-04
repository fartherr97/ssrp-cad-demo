/* Single source of truth for computing age from a date of birth.
   Age is always derived from DOB (never stored) so it can't go stale. */
export function ageFromDob(dob) {
  if (!dob) return '';
  const d = new Date(dob);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a -= 1;
  return a < 0 ? '' : String(a);
}
