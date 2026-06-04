/* Default content for the Help Center.
   Keys must match the portal IDs in portals.js.
   Each section has: id, iconKey, title, tip (optional), bullets[].
   iconKey values must be present in HELP_ICON_MAP (HelpCenter + HelpEditor). */

export const DEFAULT_HELP_CONTENT = {
  civilian: [
    {
      id: 'civ-1', iconKey: 'MdPerson', title: 'Multi-Character System',
      tip: 'Everything in the portal scopes to whoever is active.',
      bullets: [
        { id: 'b1', text: 'Register multiple character identities to a single account.' },
        { id: 'b2', text: 'Generate with AI — one click fills a full Los Santos character profile instantly with randomised demographics, address, and phone.' },
        { id: 'b3', text: 'Switch your active character from any page using the banner at the top — vehicles, licenses, reports, and medical records all update automatically.' },
        { id: 'b4', text: 'Your active character persists when you close and reopen the portal.' },
      ],
    },
    {
      id: 'civ-2', iconKey: 'MdPhone', title: 'Call 911',
      tip: 'For genuine in-game emergencies only — misuse may result in in-game consequences.',
      bullets: [
        { id: 'b1', text: 'Tap Call 911 from the home page to open the emergency form.' },
        { id: 'b2', text: 'Fill in your emergency description, location, and optional callback number.' },
        { id: 'b3', text: 'The call is stamped with your active character\'s name and immediately appears in the dispatch queue.' },
        { id: 'b4', text: 'Track the status of your call under My Reports.' },
      ],
    },
    {
      id: 'civ-3', iconKey: 'MdDirectionsCar', title: 'My Vehicles', tip: '',
      bullets: [
        { id: 'b1', text: 'Register vehicles to your active character (plate, make, model, year, colour, registration expiry).' },
        { id: 'b2', text: 'Vehicle details are locked after submission — double-check everything before confirming. Only admins can edit filed registrations.' },
        { id: 'b3', text: 'Each registered vehicle is visible to law enforcement during a search.' },
      ],
    },
    {
      id: 'civ-4', iconKey: 'MdBadge', title: 'My Licenses', tip: '',
      bullets: [
        { id: 'b1', text: 'Apply for a driver license — it is issued instantly once submitted.' },
        { id: 'b2', text: 'Renew a license approaching expiry from the same page.' },
        { id: 'b3', text: 'If your license is Suspended or Revoked, you cannot apply or renew — contact an admin to appeal.' },
      ],
    },
    {
      id: 'civ-5', iconKey: 'MdLocalHospital', title: 'Medical Records',
      tip: 'Tiered visibility — not all responders see the same data.',
      bullets: [
        { id: 'b1', text: 'Set blood type, allergies, conditions, medications, and emergency contacts for your character.' },
        { id: 'b2', text: 'LEO safety notes are visible to law enforcement when they look up your character.' },
        { id: 'b3', text: 'EMS / Fire notes are visible only to Fire & EMS personnel.' },
        { id: 'b4', text: 'Blood type, conditions, and allergies are visible to both LEO and Fire/EMS.' },
      ],
    },
    {
      id: 'civ-6', iconKey: 'MdReportProblem', title: 'File a Report', tip: '',
      bullets: [
        { id: 'b1', text: 'Submit non-emergency reports (theft, vandalism, etc.) directly to law enforcement.' },
        { id: 'b2', text: 'Choose a report type, incident date, location, and write a description.' },
        { id: 'b3', text: 'You receive a case number immediately on submission for follow-up.' },
      ],
    },
    {
      id: 'civ-7', iconKey: 'MdAssignment', title: 'My Reports', tip: '',
      bullets: [
        { id: 'b1', text: 'Unified timeline of all your filed reports and 911 calls in one place.' },
        { id: 'b2', text: 'Each item shows its current status (Pending, Dispatched, Reviewed, Closed, etc.).' },
      ],
    },
    {
      id: 'civ-8', iconKey: 'MdMenuBook', title: 'State Laws & Statutes', tip: '',
      bullets: [
        { id: 'b1', text: 'Search the full penal code by name, statute code, or category.' },
        { id: 'b2', text: 'Filter by Felony, Misdemeanor, or Infraction.' },
        { id: 'b3', text: 'Each statute shows fine, jail time, and any licence-point deduction.' },
      ],
    },
  ],

  business: [
    {
      id: 'biz-1', iconKey: 'MdStore', title: 'Business Dashboard', tip: '',
      bullets: [
        { id: 'b1', text: 'Overview of your business — employee count, licence status, and current standing at a glance.' },
        { id: 'b2', text: 'Quick-action cards navigate you to every section of the business portal.' },
      ],
    },
    {
      id: 'biz-2', iconKey: 'MdStoreMini', title: 'My Business', tip: '',
      bullets: [
        { id: 'b1', text: 'View and edit your business profile — name, type, address, contact info, and owner details.' },
        { id: 'b2', text: 'Business licence number is read-only and assigned by admins.' },
      ],
    },
    {
      id: 'biz-3', iconKey: 'MdGroup', title: 'Employees', tip: '',
      bullets: [
        { id: 'b1', text: 'Manage your staff roster — add or remove employees by name and role.' },
        { id: 'b2', text: 'Employee count is reflected on your business dashboard stat card.' },
      ],
    },
    {
      id: 'biz-4', iconKey: 'MdDirectionsCar', title: 'Business Fleet', tip: '',
      bullets: [
        { id: 'b1', text: 'Register vehicles under your business entity, separate from personal character vehicles.' },
        { id: 'b2', text: 'Like personal vehicles, fleet registrations are locked after submission.' },
        { id: 'b3', text: 'Fleet vehicles appear in law enforcement lookups linked to your business.' },
      ],
    },
    {
      id: 'biz-5', iconKey: 'MdLocalShipping', title: 'Tow CAD', tip: '',
      bullets: [
        { id: 'b1', text: 'Access the Tow CAD board directly from the business portal — for tow company operators.' },
      ],
    },
    {
      id: 'biz-6', iconKey: 'MdMenuBook', title: 'State Laws', tip: '',
      bullets: [
        { id: 'b1', text: 'Same searchable penal code reference available in the civilian portal.' },
      ],
    },
  ],

  supervisor: [
    {
      id: 'sup-1', iconKey: 'MdOutlineRateReview', title: 'Submissions Review',
      tip: 'Your primary workflow — review reports and records filed by officers in your department.',
      bullets: [
        { id: 'b1', text: 'See all pending reports and records submitted for review, scoped to your department.' },
        { id: 'b2', text: 'Filter by department, record type, and status (Pending / Approved / Returned).' },
        { id: 'b3', text: 'Open any submission to read the full form, add a supervisor signature, and leave inline comments.' },
        { id: 'b4', text: 'Approve — moves the submission to Approved status.' },
        { id: 'b5', text: 'Return for Revision — flags it back to the filing officer with your comments.' },
        { id: 'b6', text: 'Download any approved submission as a PDF.' },
      ],
    },
    {
      id: 'sup-2', iconKey: 'MdSearch', title: 'Personnel Lookup', tip: '',
      bullets: [
        { id: 'b1', text: 'Search officers by name or badge number to pull their full submission history.' },
        { id: 'b2', text: 'Search civilians by name, DL number, or SSN.' },
        { id: 'b3', text: 'View pending, approved, and total counts for any officer at a glance.' },
      ],
    },
    {
      id: 'sup-3', iconKey: 'MdCampaign', title: 'Notification Blast',
      tip: 'Blasts are department-scoped — you can only send to your own department.',
      bullets: [
        { id: 'b1', text: 'Send an instant toast notification to all online personnel in your department.' },
        { id: 'b2', text: 'Choose a title, message body, and colour (Blue, Green, Amber, Red, Violet, Cyan).' },
        { id: 'b3', text: 'Notification shows your name and badge as the sender.' },
      ],
    },
  ],

  command: [
    {
      id: 'cmd-1', iconKey: 'MdBarChart', title: 'Overview', tip: '',
      bullets: [
        { id: 'b1', text: 'Top-level stats across all departments — active calls, units on duty, pending submissions, open warrants.' },
        { id: 'b2', text: 'Filter by time range (Today / Last 7 Days / Last 30 Days).' },
        { id: 'b3', text: 'Charts for call volume, incident category breakdown, and unit status distribution.' },
      ],
    },
    {
      id: 'cmd-2', iconKey: 'MdPerson', title: 'By Officer', tip: '',
      bullets: [
        { id: 'b1', text: 'Per-officer activity — total submissions, reports filed, records issued, and pending reviews.' },
        { id: 'b2', text: 'Sort and filter by department or activity level.' },
      ],
    },
    {
      id: 'cmd-3', iconKey: 'MdShield', title: 'By Department', tip: '',
      bullets: [
        { id: 'b1', text: 'Department-level aggregate — active units, calls handled, and report completion rates.' },
        { id: 'b2', text: 'Side-by-side comparison across TPD, HCSO, FHP, HCFR, and FDOT.' },
      ],
    },
    {
      id: 'cmd-4', iconKey: 'MdGroup', title: 'Subdivision Hours', tip: '',
      bullets: [
        { id: 'b1', text: 'Track patrol hours logged per subdivision (Patrol, Traffic, K9, Detectives, etc.).' },
        { id: 'b2', text: 'Filterable by department and date range.' },
      ],
    },
    {
      id: 'cmd-5', iconKey: 'MdAssignment', title: 'Report Tracker', tip: '',
      bullets: [
        { id: 'b1', text: 'Full cross-department view of all submitted reports — status, type, filing officer, and date.' },
        { id: 'b2', text: 'Identify overdue or un-reviewed submissions quickly.' },
      ],
    },
    {
      id: 'cmd-6', iconKey: 'MdAccessTime', title: 'Response Times', tip: '',
      bullets: [
        { id: 'b1', text: 'Average time-to-dispatch and time-to-on-scene metrics per department.' },
        { id: 'b2', text: 'Priority-1 vs. lower-priority breakdowns to spot SLA gaps.' },
        { id: 'b3', text: 'Filter by department and date range.' },
      ],
    },
    {
      id: 'cmd-7', iconKey: 'MdCampaign', title: 'Notification Blast',
      tip: 'Unlike the supervisor blast, command can target any department or all at once.',
      bullets: [
        { id: 'b1', text: 'Send an instant notification to any department or broadcast to all personnel.' },
        { id: 'b2', text: 'Choose title, message, and accent colour.' },
        { id: 'b3', text: 'Notification shows your name and badge as the sender.' },
      ],
    },
  ],
};
