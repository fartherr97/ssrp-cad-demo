/* Default schemas for the admin-configurable civilian-facing forms.
   Edited live in Admin ▸ Civilian Forms and stored on state.civilianForms.
   Civilian portals (Licenses, Vehicles, Characters, Medical) read from here. */

export const CIVILIAN_FORMS_DEFAULT = {
  /* ── Driver License ── */
  driverLicense: {
    // Single-select base class (radio on the application form)
    classes: [
      { value: 'Class E',     label: 'Class E',     desc: 'Standard license · non-commercial vehicles under 26,001 lbs (most common)' },
      { value: 'Class A CDL', label: 'Class A CDL', desc: 'Combination vehicles with a GCWR of 26,001+ lbs towing a unit over 10,000 lbs' },
      { value: 'Class B CDL', label: 'Class B CDL', desc: 'Heavy straight vehicles 26,001+ lbs, or buses designed for 24+ passengers' },
      { value: 'Class C CDL', label: 'Class C CDL', desc: 'Vehicles carrying hazardous materials or transporting 16–23 passengers' },
    ],
    // Optional checkbox add-ons (multi-select)
    endorsements: [
      { value: 'Motorcycle', label: 'Motorcycle', desc: 'Authorizes operation of motorcycles and mopeds' },
      { value: 'Boating',    label: 'Boating',    desc: 'Authorizes operation of watercraft and vessels' },
    ],
    // Extra custom fields appended to the application form
    fields: [],
  },

  /* ── Vehicle Registration ── */
  vehicleRegistration: {
    // plate / make / model / year / color are always-present core fields.
    // These are extra custom fields appended to the registration form.
    fields: [],
  },

  /* ── Character Creation ── */
  character: {
    // `core` fields are required by the system and cannot be deleted (only relabeled).
    fields: [
      { key: 'firstName', label: 'First Name',    type: 'text',   core: true, required: true },
      { key: 'lastName',  label: 'Last Name',     type: 'text',   core: true, required: true },
      { key: 'dob',       label: 'Date of Birth', type: 'date',   core: true },
      { key: 'gender',    label: 'Gender',        type: 'select', core: true, options: ['Male', 'Female', 'Other'] },
      { key: 'ethnicity', label: 'Ethnicity',     type: 'text' },
      { key: 'height',    label: 'Height',        type: 'text' },
      { key: 'weight',    label: 'Weight',        type: 'text' },
      { key: 'hair',      label: 'Hair',          type: 'text' },
      { key: 'eyes',      label: 'Eyes',          type: 'text' },
      { key: 'phone',     label: 'Phone',         type: 'text' },
      { key: 'address',   label: 'Address',       type: 'text', core: true, full: true },
    ],
  },

  /* ── Medical Records ── */
  medical: {
    // Core medical fields (blood type, organ donor, DNR, conditions, allergies,
    // medications, emergency contact, notes) are always present. These are extra
    // custom fields appended to the medical profile.
    fields: [],
  },
};

/* Field types selectable in the Civilian Forms builder */
export const CIVILIAN_FIELD_TYPES = [
  { type: 'text',     label: 'Text'     },
  { type: 'textarea', label: 'Text Area'},
  { type: 'number',   label: 'Number'   },
  { type: 'date',     label: 'Date'     },
  { type: 'select',   label: 'Select'   },
  { type: 'checkbox', label: 'Checkbox' },
];
