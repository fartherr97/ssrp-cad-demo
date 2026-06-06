/* Helpers for turning human tab labels into clean URL slugs and back.
   Used so multi-word tabs ("By Officer") deep-link as ?tab=by-officer. */

export function slugify(s) {
  return String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Resolve a slug back to the matching label from `options` (else `fallback`). */
export function unslugTab(slug, options, fallback = options[0]) {
  if (!slug) return fallback;
  return options.find(o => slugify(o) === slug) || fallback;
}
