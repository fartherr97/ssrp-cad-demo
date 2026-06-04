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
        { id: 'b2', text: 'Generate with AI, one click fills a full character profile instantly with randomised demographics, address, and phone.' },
        { id: 'b3', text: 'Switch your active character from any page using the banner at the top, vehicles, licenses, reports, and medical records all update automatically.' },
        { id: 'b4', text: 'Your active character persists when you close and reopen the portal.' },
      ],
    },
    {
      id: 'civ-2', iconKey: 'MdPhone', title: 'Call 911',
      tip: 'For genuine in-game emergencies only, misuse may result in in-game consequences.',
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
        { id: 'b2', text: 'Vehicle details are locked after submission, double-check everything before confirming. Only admins can edit filed registrations.' },
        { id: 'b3', text: 'Each registered vehicle is visible to law enforcement during a search.' },
      ],
    },
    {
      id: 'civ-4', iconKey: 'MdBadge', title: 'My Licenses', tip: '',
      bullets: [
        { id: 'b1', text: 'Apply for a driver license, it is issued instantly once submitted.' },
        { id: 'b2', text: 'Renew a license approaching expiry from the same page.' },
        { id: 'b3', text: 'If your license is Suspended or Revoked, you cannot apply or renew, contact an admin to appeal.' },
      ],
    },
    {
      id: 'civ-5', iconKey: 'MdLocalHospital', title: 'Medical Records',
      tip: 'Tiered visibility, not all responders see the same data.',
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
        { id: 'b1', text: 'Overview of your business, employee count, licence status, and current standing at a glance.' },
        { id: 'b2', text: 'Quick-action cards navigate you to every section of the business portal.' },
      ],
    },
    {
      id: 'biz-2', iconKey: 'MdStoreMini', title: 'My Business', tip: '',
      bullets: [
        { id: 'b1', text: 'View and edit your business profile, name, type, address, contact info, and owner details.' },
        { id: 'b2', text: 'Business licence number is read-only and assigned by admins.' },
      ],
    },
    {
      id: 'biz-3', iconKey: 'MdGroup', title: 'Employees', tip: '',
      bullets: [
        { id: 'b1', text: 'Manage your staff roster, add or remove employees by name and role.' },
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
        { id: 'b1', text: 'Access the Tow CAD board directly from the business portal, for tow company operators.' },
      ],
    },
    {
      id: 'biz-6', iconKey: 'MdMenuBook', title: 'State Laws', tip: '',
      bullets: [
        { id: 'b1', text: 'Same searchable penal code reference available in the civilian portal.' },
      ],
    },
  ],

  leo: [
    {
      id: 'leo-1', iconKey: 'MdDashboard', title: 'CAD & Dispatch Console',
      tip: 'Your live operational picture, calls, units, and the radio feed.',
      bullets: [
        { id: 'b1', text: 'View all active calls with priority, status, location, and live elapsed timers.' },
        { id: 'b2', text: 'Set your unit status (Available, En Route, On Scene, Busy, etc.) from the status bar.' },
        { id: 'b3', text: 'Self-dispatch onto a call, or get attached to one by a dispatcher.' },
        { id: 'b4', text: 'Open any call to see full details, attached units, and the live dispatch log.' },
      ],
    },
    {
      id: 'leo-2', iconKey: 'MdSearch', title: 'Records Search',
      tip: 'One search tool, multiple record types, supports exact and partial matches.',
      bullets: [
        { id: 'b1', text: 'Search People by name, DOB, SSN, or DL number to pull a full civilian profile.' },
        { id: 'b2', text: 'Run a Vehicle by plate or make/model, includes commercial / business-owned vehicles.' },
        { id: 'b3', text: 'Look up Warrants by subject name or charge.' },
        { id: 'b4', text: 'Search Businesses by name, owner, or type to view license status, employees, and fleet.' },
        { id: 'b5', text: 'Verify FDOT Permits by holder, location, or permit number for roadwork authorization.' },
        { id: 'b6', text: 'Pull Reports & Records by case number, type, or status.' },
      ],
    },
    {
      id: 'leo-3', iconKey: 'MdReportProblem', title: 'Filing Reports', tip: '',
      bullets: [
        { id: 'b1', text: 'File incident, arrest, and supplemental reports from the Reports center.' },
        { id: 'b2', text: 'Forms auto-fill your agency, unit, and badge details.' },
        { id: 'b3', text: 'Each report is stamped with a sequential case number on submission.' },
        { id: 'b4', text: 'Save any report as a PDF, or submit it for supervisor review.' },
      ],
    },
    {
      id: 'leo-4', iconKey: 'MdAssignment', title: 'Issuing Records', tip: '',
      bullets: [
        { id: 'b1', text: 'Issue citations, licenses, and other custom records from the Records center.' },
        { id: 'b2', text: 'Records attach to a civilian and appear in their profile and search return.' },
        { id: 'b3', text: 'Citations carrying license points count automatically toward suspension thresholds.' },
      ],
    },
    {
      id: 'leo-5', iconKey: 'MdGavel', title: 'Warrants', tip: '',
      bullets: [
        { id: 'b1', text: 'View active, served, and expired warrants from Warrant Control.' },
        { id: 'b2', text: 'A subject with an active warrant is flagged in their profile and on every search return.' },
      ],
    },
    {
      id: 'leo-6', iconKey: 'MdEngineering', title: 'Requesting Assistance',
      tip: 'Pull in other agencies directly from a call.',
      bullets: [
        { id: 'b1', text: 'Request FDOT from a call for vehicle recovery, lane closures, or road hazards.' },
        { id: 'b2', text: 'Request HCFR (Fire / EMS) from a call for medical or fire support.' },
        { id: 'b3', text: 'The request lands on the target agency board and you are notified over radio when they respond.' },
      ],
    },
    {
      id: 'leo-7', iconKey: 'MdMap', title: 'Live Map', tip: '',
      bullets: [
        { id: 'b1', text: 'See active calls and live unit positions on the map.' },
      ],
    },
  ],

  fire: [
    {
      id: 'fire-1', iconKey: 'MdLocalFireDepartment', title: 'Fire Operations Board',
      tip: 'HCFR\'s command picture for active incidents and apparatus.',
      bullets: [
        { id: 'b1', text: 'View active fire / EMS incidents with priority and live elapsed timers.' },
        { id: 'b2', text: 'See the full apparatus roster, Engines, Ladders, Rescue/EMS, Hazmat, and Command, with live unit status.' },
        { id: 'b3', text: 'Self-assign to an incident, or dispatch apparatus to a scene.' },
      ],
    },
    {
      id: 'fire-2', iconKey: 'MdPhone', title: 'Incoming 911, EMS / Fire',
      tip: 'Civilian 911 calls that request EMS or Fire are routed straight to your board.',
      bullets: [
        { id: 'b1', text: 'When a civilian selects EMS or Fire on their 911 call, it appears in the Incoming 911 section of the Fire board.' },
        { id: 'b2', text: 'Each call shows the emergency, location, caller, and which services were requested.' },
        { id: 'b3', text: 'Dismiss a call once a unit has been assigned and is responding.' },
      ],
    },
    {
      id: 'fire-3', iconKey: 'MdShield', title: 'LE Assistance Requests', tip: '',
      bullets: [
        { id: 'b1', text: 'Law enforcement can request HCFR support directly from a call.' },
        { id: 'b2', text: 'Incoming requests appear on the Fire board, acknowledge, dispatch a unit, or decline.' },
        { id: 'b3', text: 'Dispatching a unit notifies the requesting officer over radio.' },
      ],
    },
    {
      id: 'fire-4', iconKey: 'MdLocalHospital', title: 'Patient Medical Records',
      tip: 'EMS sees the medical data civilians mark for Fire / EMS.',
      bullets: [
        { id: 'b1', text: 'Blood type, conditions, and allergies set by a civilian are visible to Fire / EMS.' },
        { id: 'b2', text: 'EMS / Fire notes are visible only to Fire & EMS personnel, not to law enforcement.' },
      ],
    },
    {
      id: 'fire-5', iconKey: 'MdAssignment', title: 'Reports & Records', tip: '',
      bullets: [
        { id: 'b1', text: 'File fire and EMS incident reports from the Reports center.' },
        { id: 'b2', text: 'Forms auto-fill your HCFR unit and subdivision details.' },
        { id: 'b3', text: 'Save reports as a PDF or submit them for supervisor review.' },
      ],
    },
    {
      id: 'fire-6', iconKey: 'MdGroup', title: 'Units', tip: '',
      bullets: [
        { id: 'b1', text: 'Manage on-duty apparatus and crew assignments from Unit Management.' },
      ],
    },
  ],

  supervisor: [
    {
      id: 'sup-1', iconKey: 'MdOutlineRateReview', title: 'Submissions Review',
      tip: 'Your primary workflow, review reports and records filed by officers in your department.',
      bullets: [
        { id: 'b1', text: 'See all pending reports and records submitted for review, scoped to your department.' },
        { id: 'b2', text: 'Filter by department, record type, and status (Pending / Approved / Returned).' },
        { id: 'b3', text: 'Open any submission to read the full form, add a supervisor signature, and leave inline comments.' },
        { id: 'b4', text: 'Approve, moves the submission to Approved status.' },
        { id: 'b5', text: 'Return for Revision, flags it back to the filing officer with your comments.' },
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
      tip: 'Blasts are department-scoped, you can only send to your own department.',
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
        { id: 'b1', text: 'Top-level stats across all departments, active calls, units on duty, pending submissions, open warrants.' },
        { id: 'b2', text: 'Filter by time range (Today / Last 7 Days / Last 30 Days).' },
        { id: 'b3', text: 'Charts for call volume, incident category breakdown, and unit status distribution.' },
      ],
    },
    {
      id: 'cmd-2', iconKey: 'MdPerson', title: 'By Officer', tip: '',
      bullets: [
        { id: 'b1', text: 'Per-officer activity, total submissions, reports filed, records issued, and pending reviews.' },
        { id: 'b2', text: 'Sort and filter by department or activity level.' },
      ],
    },
    {
      id: 'cmd-3', iconKey: 'MdShield', title: 'By Department', tip: '',
      bullets: [
        { id: 'b1', text: 'Department-level aggregate, active units, calls handled, and report completion rates.' },
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
        { id: 'b1', text: 'Full cross-department view of all submitted reports, status, type, filing officer, and date.' },
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
