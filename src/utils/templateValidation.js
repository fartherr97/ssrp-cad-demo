/* Validates a filled report/record against its template's field rules.
   - `required` fields must have a value (auto-number / read-only fields are
     skipped since they're filled automatically).
   - `unique` fields must not duplicate a value already on file for the same
     template type.
   Returns { ok: true } or { ok: false, error }. */
export function validateTemplate(template, values = {}, existing = []) {
  const fields = (template?.sections || []).flatMap(s => s.fields || []);

  const isEmpty = (f, v) => {
    if (f.type === 'checkbox') return !v;
    if (Array.isArray(v)) return v.length === 0;
    return v == null || String(v).trim() === '';
  };

  for (const f of fields) {
    if (!f.required || f.readOnly || f.autoNumber) continue;
    if (isEmpty(f, values[f.id])) {
      return { ok: false, error: `"${f.label || 'A required field'}" is required.` };
    }
  }

  for (const f of fields) {
    if (!f.unique) continue;
    const v = values[f.id];
    if (v == null || String(v).trim() === '') continue;
    const norm = String(v).trim().toLowerCase();
    const dup = existing.find(item => {
      const ev = item.formData?.[f.id];
      return ev != null && String(ev).trim().toLowerCase() === norm;
    });
    if (dup) {
      return {
        ok: false,
        error: `"${f.label}" must be unique — "${v}" is already on file${dup.caseNumber || dup.recordNumber ? ` (${dup.caseNumber || dup.recordNumber})` : ''}.`,
      };
    }
  }

  return { ok: true };
}
