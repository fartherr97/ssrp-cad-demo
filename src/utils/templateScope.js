/* Decides which report / record templates a given portal is allowed to see.

   A template with no `portals` array is a standard law-enforcement template,
   visible to the LEO and Dispatch portals. A template that declares a
   `portals` array (e.g. the EMS Patient Care Report uses `portals: ['fire']`)
   is visible only in the portals it names. The Admin portal always sees every
   template for oversight and editing in the record/report builder. */
export function templateInPortal(tpl, portalId) {
  if (portalId === 'admin') return true;
  const scope = tpl?.portals;
  if (Array.isArray(scope) && scope.length) return scope.includes(portalId);
  // Untagged templates are the default LEO / Dispatch reports.
  return portalId === 'leo' || portalId === 'dispatch';
}

export function templatesForPortal(templates = [], portalId) {
  return templates.filter(t => templateInPortal(t, portalId));
}
