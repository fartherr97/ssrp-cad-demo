/* Default content for the Help Center, structured as a searchable FAQ.
   Keys must match the portal IDs in portals.js.
   Each entry is a CATEGORY: { id, iconKey, title, faqs[] }
   where each faq is a question/answer pair: { id, q, a }.
   iconKey values must be present in HELP_ICON_MAP (HelpCenter + HelpEditor). */

export const DEFAULT_HELP_CONTENT = {
  civilian: [
    {
      id: 'civ-1', iconKey: 'MdPerson', title: 'Characters',
      faqs: [
        { id: 'q1', q: 'Can I have more than one character?', a: 'Yes. You can register multiple character identities under a single account. Everything in the portal — vehicles, licenses, reports, and medical records — scopes to whichever character is currently active.' },
        { id: 'q2', q: 'How do I switch my active character?', a: 'Use the character banner at the top of any page. When you switch, every section updates automatically to that character. Your active character also persists after you close and reopen the portal.' },
        { id: 'q3', q: 'What does the "Generate with AI" button do?', a: 'It fills a full character profile in one click — randomised demographics, address, and phone number — so you can create a character instantly instead of typing every field.' },
      ],
    },
    {
      id: 'civ-2', iconKey: 'MdPhone', title: 'Calling 911',
      faqs: [
        { id: 'q1', q: 'How do I call 911?', a: 'Tap "Call 911" on the home page to open the emergency form, then fill in your emergency description, location, and an optional callback number.' },
        { id: 'q2', q: 'What happens after I submit a 911 call?', a: 'The call is stamped with your active character\'s name and appears immediately in the dispatch queue. You can track its status under My Reports.' },
        { id: 'q3', q: 'Can I get in trouble for misusing 911?', a: 'Yes. 911 is for genuine in-game emergencies only — misuse may result in in-game consequences.' },
      ],
    },
    {
      id: 'civ-3', iconKey: 'MdDirectionsCar', title: 'Vehicles',
      faqs: [
        { id: 'q1', q: 'How do I register a vehicle?', a: 'Register vehicles to your active character with the plate, make, model, year, colour, and registration expiry. Each registered vehicle is visible to law enforcement during a search.' },
        { id: 'q2', q: 'Can I edit a vehicle after registering it?', a: 'No. Vehicle details are locked after submission, so double-check everything before confirming. Only admins can edit a filed registration.' },
      ],
    },
    {
      id: 'civ-4', iconKey: 'MdBadge', title: 'Licenses',
      faqs: [
        { id: 'q1', q: 'How do I get a driver license?', a: 'Apply from My Licenses — it is issued instantly once you submit.' },
        { id: 'q2', q: 'How do I renew my license?', a: 'Renew a license approaching expiry from the same My Licenses page.' },
        { id: 'q3', q: 'My license is suspended or revoked — what can I do?', a: 'While suspended or revoked you cannot apply or renew. Contact an admin to appeal.' },
      ],
    },
    {
      id: 'civ-5', iconKey: 'MdLocalHospital', title: 'Medical Records',
      faqs: [
        { id: 'q1', q: 'What medical information can I set?', a: 'Blood type, allergies, conditions, medications, and emergency contacts for your character.' },
        { id: 'q2', q: 'Who can see my medical records?', a: 'Visibility is tiered. Blood type, conditions, and allergies are visible to both LEO and Fire/EMS. LEO safety notes are visible only to law enforcement; EMS/Fire notes are visible only to Fire & EMS personnel.' },
      ],
    },
    {
      id: 'civ-6', iconKey: 'MdReportProblem', title: 'Reports',
      faqs: [
        { id: 'q1', q: 'How do I file a non-emergency report?', a: 'Submit reports such as theft or vandalism directly to law enforcement: choose a report type, set the incident date and location, and write a description. You receive a case number immediately for follow-up.' },
        { id: 'q2', q: 'Where do I track my reports and 911 calls?', a: 'My Reports is a unified timeline of every report and 911 call you have filed, each showing its current status (Pending, Dispatched, Reviewed, Closed, etc.).' },
      ],
    },
    {
      id: 'civ-7', iconKey: 'MdMenuBook', title: 'Laws & Statutes',
      faqs: [
        { id: 'q1', q: 'How do I look up the law?', a: 'Search the full penal code by name, statute code, or category, and filter by Felony, Misdemeanor, or Infraction.' },
        { id: 'q2', q: 'What does each statute show?', a: 'Each statute lists its fine, jail time, and any license-point deduction.' },
      ],
    },
  ],

  business: [
    {
      id: 'biz-1', iconKey: 'MdStore', title: 'Business Dashboard',
      faqs: [
        { id: 'q1', q: 'What does the dashboard show?', a: 'An overview of your business — employee count, licence status, and current standing at a glance — plus quick-action cards that navigate to every section of the portal.' },
      ],
    },
    {
      id: 'biz-2', iconKey: 'MdStoreMini', title: 'My Business',
      faqs: [
        { id: 'q1', q: 'How do I edit my business profile?', a: 'From My Business you can view and edit your name, type, address, contact info, and owner details.' },
        { id: 'q2', q: 'Can I change my business licence number?', a: 'No. The licence number is read-only and assigned by admins.' },
      ],
    },
    {
      id: 'biz-3', iconKey: 'MdGroup', title: 'Employees',
      faqs: [
        { id: 'q1', q: 'How do I manage my staff?', a: 'Add or remove employees by name and role from the Employees page. Your employee count is reflected on the dashboard stat card.' },
      ],
    },
    {
      id: 'biz-4', iconKey: 'MdDirectionsCar', title: 'Business Fleet',
      faqs: [
        { id: 'q1', q: 'How do I register a business vehicle?', a: 'Register vehicles under your business entity, separate from personal character vehicles. Fleet vehicles appear in law enforcement lookups linked to your business.' },
        { id: 'q2', q: 'Can I edit a fleet vehicle later?', a: 'No. Like personal vehicles, fleet registrations are locked after submission.' },
      ],
    },
    {
      id: 'biz-5', iconKey: 'MdLocalShipping', title: 'Tow CAD',
      faqs: [
        { id: 'q1', q: 'How do I access Tow CAD?', a: 'Tow company operators can open the Tow CAD board directly from the business portal.' },
      ],
    },
    {
      id: 'biz-6', iconKey: 'MdMenuBook', title: 'State Laws',
      faqs: [
        { id: 'q1', q: 'Where is the penal code?', a: 'The same searchable penal code reference available in the civilian portal is also here in the business portal.' },
      ],
    },
  ],

  leo: [
    {
      id: 'leo-1', iconKey: 'MdDashboard', title: 'CAD & Dispatch Console',
      faqs: [
        { id: 'q1', q: 'How do I see active calls?', a: 'The console shows all active calls with priority, status, location, and live elapsed timers. Open any call for full details, attached units, and the live dispatch log.' },
        { id: 'q2', q: 'How do I set my unit status?', a: 'Set your status (Available, En Route, On Scene, Busy, etc.) from the status bar at any time.' },
        { id: 'q3', q: 'How do I get onto a call?', a: 'Self-dispatch onto a call from the console, or get attached to one by a dispatcher.' },
      ],
    },
    {
      id: 'leo-2', iconKey: 'MdSearch', title: 'Records Search',
      faqs: [
        { id: 'q1', q: 'How do I look up a person?', a: 'Search People by name, DOB, SSN, or DL number to pull a full civilian profile. Exact and partial matches are both supported.' },
        { id: 'q2', q: 'How do I run a vehicle or plate?', a: 'Search Vehicle by plate or make/model — results include commercial / business-owned vehicles.' },
        { id: 'q3', q: 'What else can I search?', a: 'Warrants (by subject name or charge), Businesses (by name, owner, or type), FDOT Permits (by holder, location, or permit number), and Reports & Records (by case number, type, or status).' },
      ],
    },
    {
      id: 'leo-3', iconKey: 'MdReportProblem', title: 'Filing Reports',
      faqs: [
        { id: 'q1', q: 'How do I file a report?', a: 'File incident, arrest, and supplemental reports from the Reports center. Forms auto-fill your agency, unit, and badge details, and each report is stamped with a sequential case number on submission.' },
        { id: 'q2', q: 'Can I export or submit a report for review?', a: 'Yes — save any report as a PDF, or submit it for supervisor review.' },
      ],
    },
    {
      id: 'leo-4', iconKey: 'MdAssignment', title: 'Issuing Records',
      faqs: [
        { id: 'q1', q: 'How do I issue a citation or license?', a: 'Issue citations, licenses, and other custom records from the Records center. Records attach to a civilian and appear in their profile and search return.' },
        { id: 'q2', q: 'Do citation points affect a license automatically?', a: 'Yes. Citations carrying license points count automatically toward the suspension thresholds.' },
      ],
    },
    {
      id: 'leo-5', iconKey: 'MdGavel', title: 'Warrants',
      faqs: [
        { id: 'q1', q: 'Where do I see a person\'s warrants?', a: 'A subject with an active warrant is flagged in their profile and on every search return. Warrant Control lists all warrants and lets you filter by Active, Served, or All.' },
        { id: 'q2', q: 'Someone was arrested on a warrant — how do I clear it so other officers don\'t re-arrest them?', a: 'Mark the warrant served. Fastest way: open the subject in Records Search and tap "Mark Served" on the active warrant. You can also do it from Warrant Control by selecting the warrant and choosing "Mark as Served". Once served, it stamps who cleared it and when, and it drops off the active-warrant flags other officers see — so nobody arrests on it again.' },
        { id: 'q3', q: 'Does a served warrant disappear from the system?', a: 'No. Served warrants are kept permanently and stay fully searchable — filter to Served (or All) in Warrant Control, or open the subject\'s Warrants tab in Records Search. The record keeps who served it, the date, and any linked case number for later review.' },
      ],
    },
    {
      id: 'leo-6', iconKey: 'MdEngineering', title: 'Requesting Assistance',
      faqs: [
        { id: 'q1', q: 'How do I request FDOT or Fire/EMS from a call?', a: 'From a call you can request FDOT (vehicle recovery, lane closures, road hazards) or HCFR / Fire & EMS (medical or fire support). The request lands on the target agency board and you are notified over radio when they respond.' },
      ],
    },
    {
      id: 'leo-7', iconKey: 'MdMap', title: 'Live Map',
      faqs: [
        { id: 'q1', q: 'What does the Live Map show?', a: 'Active calls and live unit positions plotted on the map.' },
      ],
    },
    {
      id: 'leo-8', iconKey: 'MdWork', title: 'Case Files (CID)',
      faqs: [
        { id: 'q1', q: 'What are Case Files?', a: 'Case Files (reached from the Cases link in the nav bar) is the CID detective investigation system. Detectives in the Detectives subdivision create and manage cases — opening them, adding subjects, linking vehicles, and updating the timeline.' },
        { id: 'q2', q: 'How is a case organised?', a: 'Each case has a priority (High / Medium / Low), a classification (Narcotics, Assault, Fraud, etc.), and four tabs: Overview (summary and status controls), Subjects (linked civilians and roles), Vehicles (linked plates), and Timeline (notes, evidence, leads, and tips).' },
        { id: 'q3', q: 'What do the case statuses mean?', a: 'Active = investigation ongoing. Suspended = paused, waiting on evidence or legal process. Closed = investigation concluded. Locked = sealed by a supervisor, no further edits. Supervisors and Command can view all cases and lock a closed one.' },
      ],
    },
    {
      id: 'leo-9', iconKey: 'MdWarningAmber', title: 'Active Investigation Flag',
      faqs: [
        { id: 'q1', q: 'What is the red "Active Investigation" banner on a search return?', a: 'It means the person or vehicle is linked to an active CID case. The banner shows the case number and title so you know which investigation it belongs to. The flag is informational — it does not by itself make someone a wanted person, so check for active warrants separately.' },
        { id: 'q2', q: 'What should I do — and not do — when I see it?', a: 'Do NOT disclose to the subject that they are under investigation; it can compromise surveillance or a prosecution. If you have new information (a location, an associate, something you observed), tap Submit Tip on the flag — it posts to the case timeline and notifies the assigned detective.' },
        { id: 'q3', q: 'I made an unrelated arrest on a flagged subject — what now?', a: 'Contact CID before transporting. The detective may need to respond to scene or coordinate the process. Flagged vehicles are treated the same way — note where and when you observed it in your tip.' },
      ],
    },
  ],

  fire: [
    {
      id: 'fire-1', iconKey: 'MdLocalFireDepartment', title: 'Fire Operations Board',
      faqs: [
        { id: 'q1', q: 'What is on the Fire Operations board?', a: 'HCFR\'s command picture: active fire/EMS incidents with priority and live elapsed timers, plus the full apparatus roster (Engines, Ladders, Rescue/EMS, Hazmat, Command) with live unit status.' },
        { id: 'q2', q: 'How do I respond to an incident?', a: 'Self-assign to an incident, or dispatch apparatus to a scene from the board.' },
      ],
    },
    {
      id: 'fire-2', iconKey: 'MdPhone', title: 'Incoming 911 (EMS / Fire)',
      faqs: [
        { id: 'q1', q: 'Where do civilian EMS/Fire 911 calls go?', a: 'When a civilian selects EMS or Fire on their 911 call, it appears in the Incoming 911 section of the Fire board, showing the emergency, location, caller, and which services were requested.' },
        { id: 'q2', q: 'When should I dismiss a call?', a: 'Dismiss a call once a unit has been assigned and is responding.' },
      ],
    },
    {
      id: 'fire-3', iconKey: 'MdShield', title: 'LE Assistance Requests',
      faqs: [
        { id: 'q1', q: 'How do law enforcement requests reach us?', a: 'Officers can request HCFR support directly from a call. Incoming requests appear on the Fire board — acknowledge, dispatch a unit, or decline. Dispatching a unit notifies the requesting officer over radio.' },
      ],
    },
    {
      id: 'fire-4', iconKey: 'MdLocalHospital', title: 'Patient Medical Records',
      faqs: [
        { id: 'q1', q: 'What patient medical data can EMS see?', a: 'Blood type, conditions, and allergies set by a civilian are visible to Fire/EMS. EMS/Fire notes are visible only to Fire & EMS personnel, not to law enforcement.' },
      ],
    },
    {
      id: 'fire-5', iconKey: 'MdAssignment', title: 'Reports & Records',
      faqs: [
        { id: 'q1', q: 'How do I file a fire or EMS report?', a: 'File incident reports from the Reports center. Forms auto-fill your HCFR unit and subdivision details, and you can save as a PDF or submit for supervisor review.' },
      ],
    },
    {
      id: 'fire-6', iconKey: 'MdGroup', title: 'Units',
      faqs: [
        { id: 'q1', q: 'How do I manage apparatus and crews?', a: 'Manage on-duty apparatus and crew assignments from Unit Management.' },
      ],
    },
  ],

  supervisor: [
    {
      id: 'sup-1', iconKey: 'MdOutlineRateReview', title: 'Submissions Review',
      faqs: [
        { id: 'q1', q: 'What submissions can I review?', a: 'All pending reports and records filed by officers in your department. Filter by department, record type, and status (Pending / Approved / Returned).' },
        { id: 'q2', q: 'How do I approve or return a submission?', a: 'Open any submission to read the full form, add your supervisor signature, and leave inline comments. Approve to move it to Approved status, or Return for Revision to send it back to the filing officer with your comments. Approved submissions can be downloaded as a PDF.' },
      ],
    },
    {
      id: 'sup-2', iconKey: 'MdSearch', title: 'Personnel Lookup',
      faqs: [
        { id: 'q1', q: 'How do I look up an officer\'s activity?', a: 'Search officers by name or badge number to pull their full submission history, with pending, approved, and total counts at a glance.' },
        { id: 'q2', q: 'Can I look up civilians too?', a: 'Yes — search civilians by name, DL number, or SSN.' },
      ],
    },
    {
      id: 'sup-3', iconKey: 'MdCampaign', title: 'Notification Blast',
      faqs: [
        { id: 'q1', q: 'How do I send a department notification?', a: 'Send an instant toast notification to all online personnel in your department. Choose a title, message body, and colour (Blue, Green, Amber, Red, Violet, Cyan); it shows your name and badge as the sender.' },
        { id: 'q2', q: 'Can I send to other departments?', a: 'No. Supervisor blasts are department-scoped — you can only send to your own department. (Command can target any department.)' },
      ],
    },
  ],

  command: [
    {
      id: 'cmd-1', iconKey: 'MdBarChart', title: 'Overview',
      faqs: [
        { id: 'q1', q: 'What does the Overview dashboard show?', a: 'Top-level stats across all departments — active calls, units on duty, pending submissions, open warrants — plus charts for call volume, incident category breakdown, and unit status. Filter by time range (Today / Last 7 Days / Last 30 Days).' },
      ],
    },
    {
      id: 'cmd-2', iconKey: 'MdPerson', title: 'By Officer',
      faqs: [
        { id: 'q1', q: 'How do I see per-officer activity?', a: 'The By Officer view shows total submissions, reports filed, records issued, and pending reviews per officer. Sort and filter by department or activity level.' },
      ],
    },
    {
      id: 'cmd-3', iconKey: 'MdShield', title: 'By Department',
      faqs: [
        { id: 'q1', q: 'How do I compare departments?', a: 'The By Department view aggregates active units, calls handled, and report completion rates, with side-by-side comparison across TPD, HCSO, FHP, HCFR, and FDOT.' },
      ],
    },
    {
      id: 'cmd-4', iconKey: 'MdGroup', title: 'Subdivision Hours',
      faqs: [
        { id: 'q1', q: 'How do I track subdivision hours?', a: 'Track patrol hours logged per subdivision (Patrol, Traffic, K9, Detectives, etc.), filterable by department and date range.' },
      ],
    },
    {
      id: 'cmd-5', iconKey: 'MdAssignment', title: 'Report Tracker',
      faqs: [
        { id: 'q1', q: 'What is the Report Tracker?', a: 'A full cross-department view of all submitted reports — status, type, filing officer, and date — so you can quickly identify overdue or un-reviewed submissions.' },
      ],
    },
    {
      id: 'cmd-6', iconKey: 'MdAccessTime', title: 'Response Times',
      faqs: [
        { id: 'q1', q: 'What response-time metrics are available?', a: 'Average time-to-dispatch and time-to-on-scene per department, with Priority-1 vs. lower-priority breakdowns to spot SLA gaps. Filter by department and date range.' },
      ],
    },
    {
      id: 'cmd-7', iconKey: 'MdCampaign', title: 'Notification Blast',
      faqs: [
        { id: 'q1', q: 'How is the Command blast different from Supervisor?', a: 'Command can send an instant notification to any department or broadcast to all personnel at once (Supervisor is limited to their own department). Choose title, message, and accent colour; it shows your name and badge as the sender.' },
      ],
    },
  ],
};
