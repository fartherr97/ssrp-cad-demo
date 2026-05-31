export const DEPARTMENTS = [
  { id: 1, name: "Arcadia Police Department", short: "ADPS", abbreviation: "APD", color: "#1a6bbf", type: "LEO", badgePrefix: "831", radioChannel: "PD-1", subdivisions: ["Patrol","K9","Traffic","SWAT","Detectives"] },
  { id: 2, name: "Arcadia County Sheriff's Office", short: "ACSO", abbreviation: "ACSO", color: "#2e7d32", type: "LEO", badgePrefix: "SO", radioChannel: "SO-1", subdivisions: ["Patrol","Marine","Air Support","Civil"] },
  { id: 3, name: "Arcadia Fire Department", short: "AFD", abbreviation: "AFD", color: "#c62828", type: "Fire", badgePrefix: "FD", radioChannel: "FIRE-1", subdivisions: ["Engine","Ladder","Rescue","Hazmat"] },
  { id: 4, name: "Arcadia EMS", short: "AEMS", abbreviation: "EMS", color: "#6a1b9a", type: "EMS", badgePrefix: "MED", radioChannel: "EMS-1", subdivisions: ["ALS","BLS","Supervisor"] },
  { id: 5, name: "State Highway Patrol", short: "SHP", abbreviation: "SHP", color: "#e65100", type: "LEO", badgePrefix: "SHP", radioChannel: "SHP-1", subdivisions: ["Patrol","Commercial Vehicle","Air"] },
];

export const RANKS = {
  LEO: ["Cadet","Officer","Corporal","Sergeant","Lieutenant","Captain","Deputy Chief","Chief"],
  Fire: ["Probationary Firefighter","Firefighter","Driver Engineer","Lieutenant","Captain","Battalion Chief","Assistant Chief","Fire Chief"],
  EMS: ["EMT-Basic","EMT-Advanced","Paramedic","Senior Paramedic","Supervisor","EMS Chief"],
};

export const OFFICERS = [
  { id: 1, name: "James Reeves", badge: "831-04", unitId: "831", dept: 1, deptShort: "ADPS", subdivision: "Patrol", rank: "Sergeant", status: "AVAILABLE", callId: null, location: "Oak & 5th", discordId: "205947291", role: "admin" },
  { id: 2, name: "Maria Santos", badge: "831-12", unitId: "831-12", dept: 1, deptShort: "ADPS", subdivision: "K9", rank: "Officer", status: "BUSY", callId: "23-1042", location: "Elm St / Route 9", discordId: "309182746", role: "user" },
  { id: 3, name: "Derek Walsh", badge: "831-07", unitId: "831-07", dept: 1, deptShort: "ADPS", subdivision: "Traffic", rank: "Corporal", status: "AVAILABLE", callId: null, location: "Highway 1 NB", discordId: "419283746", role: "user" },
  { id: 4, name: "Tanya Brooks", badge: "SO-22", unitId: "SO-22", dept: 2, deptShort: "ACSO", subdivision: "Patrol", rank: "Deputy", status: "UNAVAILABLE", callId: null, location: "County Line Rd", discordId: "520394857", role: "user" },
  { id: 5, name: "Carlos Mendes", badge: "SHP-09", unitId: "SHP-09", dept: 5, deptShort: "SHP", subdivision: "Patrol", rank: "Trooper", status: "AVAILABLE", callId: null, location: "I-90 MM 42", discordId: "621405968", role: "user" },
  { id: 6, name: "Lisa Park", badge: "MED-3", unitId: "MED-3", dept: 4, deptShort: "AEMS", subdivision: "ALS", rank: "Paramedic", status: "ENRT", callId: "23-1044", location: "County Hospital", discordId: "722516079", role: "user" },
  { id: 7, name: "Frank Donovan", badge: "FD-11", unitId: "FD-11", dept: 3, deptShort: "AFD", subdivision: "Engine", rank: "Firefighter", status: "AVAILABLE", callId: null, location: "Station 4", discordId: "823627180", role: "user" },
  { id: 8, name: "Priya Nair", badge: "831-19", unitId: "831-19", dept: 1, deptShort: "ADPS", subdivision: "Detectives", rank: "Detective", status: "AVAILABLE", callId: null, location: "PD HQ", discordId: "924738291", role: "user" },
];

export const CALLS = [
  { id: "23-1042", nature: "Traffic Stop", location: "Elm St / Route 9", city: "Arcadia", county: "Arcadia County", priority: 3, status: "ACTIVE", units: ["831-12"], description: "Speeding vehicle, driver appears intoxicated", timestamp: "2023-10-15 14:22", reportingParty: "Officer Santos" },
  { id: "23-1043", nature: "Domestic Disturbance", location: "412 Oakwood Ave", city: "Arcadia", county: "Arcadia County", priority: 1, status: "PENDING", units: [], description: "Caller reports loud arguing and sounds of breaking objects. Child in residence.", timestamp: "2023-10-15 14:30", reportingParty: "Dispatch" },
  { id: "23-1044", nature: "Structure Fire", location: "88 Commerce Blvd", city: "Greenview", county: "Arcadia County", priority: 1, status: "ACTIVE", units: ["FD-11","MED-3"], description: "2-story commercial building, smoke visible from 3rd floor, occupants evacuating", timestamp: "2023-10-15 14:35", reportingParty: "911 Caller" },
  { id: "23-1045", nature: "Suspicious Person", location: "Central Park, near fountain", city: "Arcadia", county: "Arcadia County", priority: 2, status: "PENDING", units: [], description: "Male in black hoodie staring at vehicles, possibly casing vehicles", timestamp: "2023-10-15 14:40", reportingParty: "Civilian Report" },
  { id: "23-1046", nature: "MVA w/ Injuries", location: "I-90 MM 42", city: "Unincorporated", county: "Arcadia County", priority: 1, status: "ENRT", units: ["SHP-09","MED-3"], description: "3-vehicle accident, 2 confirmed injuries, 1 entrapment reported", timestamp: "2023-10-15 14:45", reportingParty: "911 Caller" },
  { id: "23-1047", nature: "Noise Complaint", location: "77 Pine Ridge Dr", city: "Arcadia", county: "Arcadia County", priority: 3, status: "PENDING", units: [], description: "Loud music, multiple neighbors calling", timestamp: "2023-10-15 14:50", reportingParty: "Dispatch" },
];

export const CIVILIANS = [
  { id: 1, firstName: "Michael", lastName: "Torres", dob: "1988-03-14", gender: "Male", ethnicity: "Hispanic", height: "5'11\"", weight: "185 lbs", hair: "Black", eyes: "Brown", ssn: "412-88-3301", phone: "555-0192", address: "1204 Riverside Dr, Arcadia", dlNumber: "T8821044", dlClass: "Class C", dlStatus: "ACTIVE", dlExpiry: "2026-03-14", vehicles: [1,2], flags: [] },
  { id: 2, firstName: "Amanda", lastName: "Chen", dob: "1995-07-22", gender: "Female", ethnicity: "Asian", height: "5'4\"", weight: "125 lbs", hair: "Black", eyes: "Brown", ssn: "509-44-2210", phone: "555-0334", address: "88 Orchid Lane, Greenview", dlNumber: "C5543219", dlClass: "Class C", dlStatus: "ACTIVE", dlExpiry: "2025-07-22", vehicles: [3], flags: ["CAUTION"] },
  { id: 3, firstName: "Darnell", lastName: "Washington", dob: "1979-11-05", gender: "Male", ethnicity: "Black", height: "6'1\"", weight: "210 lbs", hair: "Black", eyes: "Dark Brown", ssn: "618-77-9901", phone: "555-0441", address: "330 Magnolia Blvd, Arcadia", dlNumber: "W1109872", dlClass: "Class C", dlStatus: "SUSPENDED", dlExpiry: "2024-11-05", vehicles: [4], flags: ["WARRANT","CAUTION"] },
  { id: 4, firstName: "Jessica", lastName: "Huang", dob: "2001-04-18", gender: "Female", ethnicity: "Asian", height: "5'2\"", weight: "115 lbs", hair: "Brown", eyes: "Brown", ssn: "723-11-4456", phone: "555-0557", address: "21 College Ave Apt 4B, Arcadia", dlNumber: "H4456012", dlClass: "Class C", dlStatus: "ACTIVE", dlExpiry: "2027-04-18", vehicles: [], flags: [] },
  { id: 5, firstName: "Robert", lastName: "Marino", dob: "1965-09-30", gender: "Male", ethnicity: "White", height: "5'9\"", weight: "195 lbs", hair: "Gray", eyes: "Blue", ssn: "301-55-8812", phone: "555-0678", address: "5 Harbor View Ct, Greenview", dlNumber: "M8812345", dlClass: "Class A", dlStatus: "ACTIVE", dlExpiry: "2025-09-30", vehicles: [5,6], flags: ["VIOLENT"] },
];

export const VEHICLES = [
  { id: 1, plate: "ARC-1204", make: "Ford", model: "F-150", year: "2019", color: "Black", regStatus: "VALID", regExpiry: "2024-10-31", ownerId: 1, stolen: false, flags: [] },
  { id: 2, plate: "TRK-8821", make: "Chevrolet", model: "Silverado", year: "2021", color: "White", regStatus: "VALID", regExpiry: "2025-01-15", ownerId: 1, stolen: false, flags: [] },
  { id: 3, plate: "GRN-5543", make: "Honda", model: "Civic", year: "2020", color: "Silver", regStatus: "EXPIRED", regExpiry: "2023-07-22", ownerId: 2, stolen: false, flags: ["EXPIRED REG"] },
  { id: 4, plate: "SUS-1109", make: "Dodge", model: "Charger", year: "2018", color: "Charcoal", regStatus: "SUSPENDED", regExpiry: "2023-09-01", ownerId: 3, stolen: false, flags: ["OWNER WANTED"] },
  { id: 5, plate: "MAR-3012", make: "BMW", model: "740i", year: "2022", color: "White", regStatus: "VALID", regExpiry: "2025-09-30", ownerId: 5, stolen: false, flags: [] },
  { id: 6, plate: "HAR-5512", make: "Harley-Davidson", model: "Road King", year: "2020", color: "Black/Chrome", regStatus: "VALID", regExpiry: "2025-09-30", ownerId: 5, stolen: false, flags: [] },
];

export const WARRANTS = [
  { id: 1, civilianId: 3, civilianName: "Darnell Washington", type: "Arrest Warrant", charge: "Possession of Controlled Substance", issuedBy: "Det. Priya Nair", issuedDate: "2023-09-12", status: "ACTIVE", notes: "Subject known to frequent 330 Magnolia Blvd area" },
  { id: 2, civilianId: 2, civilianName: "Amanda Chen", type: "Bench Warrant", charge: "Failure to Appear", issuedBy: "Judge Martinez", issuedDate: "2023-08-05", status: "ACTIVE", notes: "FTA on 2023-07-28 court date for prior traffic charges" },
];

export const CRIMINAL_HISTORY = [
  { id: 1, civilianId: 3, date: "2023-09-01", charges: ["Possession of Controlled Substance", "Resisting Arrest"], officerBadge: "831-04", agency: "ADPS", caseNumber: "ADPS-2023-0912", disposition: "Arrested", sentence: "Pending Trial", callId: "23-0912", notes: "Subject fled on foot, caught after 2-block pursuit" },
  { id: 2, civilianId: 2, date: "2023-07-10", charges: ["Speeding (25+ Over)", "Reckless Driving"], officerBadge: "831-12", agency: "ADPS", caseNumber: "ADPS-2023-0710", disposition: "Cited", sentence: "$850 fine", callId: "23-0710", notes: "Vehicle traveling 72 in 45 zone" },
  { id: 3, civilianId: 5, date: "2022-11-20", charges: ["Assault with Deadly Weapon"], officerBadge: "831-04", agency: "ADPS", caseNumber: "ADPS-2022-1120", disposition: "Arrested", sentence: "18 months probation", callId: "22-1120", notes: "Bar altercation, victim required hospitalization" },
  { id: 4, civilianId: 1, date: "2021-05-03", charges: ["DUI"], officerBadge: "831-07", agency: "ADPS", caseNumber: "ADPS-2021-0503", disposition: "Arrested", sentence: "License suspended 1 year, $1500 fine", callId: "21-0503", notes: "BAC 0.14" },
];

export const PENAL_CODE = [
  { id: 1, category: "Crimes Against Persons", code: "187 PC", name: "Murder", type: "Felony", fine: 0, jailTime: "Life", points: 10 },
  { id: 2, category: "Crimes Against Persons", code: "187(2) PC", name: "Attempted Murder", type: "Felony", fine: 0, jailTime: "25 Years", points: 9 },
  { id: 3, category: "Crimes Against Persons", code: "240 PC", name: "Assault", type: "Misdemeanor", fine: 2500, jailTime: "6 Months", points: 3 },
  { id: 4, category: "Crimes Against Persons", code: "245 PC", name: "Assault with Deadly Weapon", type: "Felony", fine: 5000, jailTime: "10 Years", points: 7 },
  { id: 5, category: "Crimes Against Persons", code: "261 PC", name: "Sexual Assault", type: "Felony", fine: 0, jailTime: "15 Years", points: 9 },
  { id: 6, category: "Crimes Against Property", code: "459 PC", name: "Burglary", type: "Felony", fine: 3000, jailTime: "6 Years", points: 6 },
  { id: 7, category: "Crimes Against Property", code: "487 PC", name: "Grand Theft", type: "Felony", fine: 5000, jailTime: "3 Years", points: 5 },
  { id: 8, category: "Crimes Against Property", code: "488 PC", name: "Petty Theft", type: "Misdemeanor", fine: 1000, jailTime: "6 Months", points: 2 },
  { id: 9, category: "Crimes Against Property", code: "594 PC", name: "Vandalism", type: "Misdemeanor", fine: 1500, jailTime: "1 Year", points: 2 },
  { id: 10, category: "Drug Offenses", code: "11350 HS", name: "Possession of Controlled Substance", type: "Felony", fine: 2000, jailTime: "3 Years", points: 4 },
  { id: 11, category: "Drug Offenses", code: "11352 HS", name: "Possession w/ Intent to Distribute", type: "Felony", fine: 10000, jailTime: "9 Years", points: 8 },
  { id: 12, category: "Drug Offenses", code: "11357 HS", name: "Possession of Marijuana", type: "Infraction", fine: 100, jailTime: "None", points: 0 },
  { id: 13, category: "Traffic Violations", code: "22350 VC", name: "Speeding", type: "Infraction", fine: 250, jailTime: "None", points: 1 },
  { id: 14, category: "Traffic Violations", code: "23152 VC", name: "DUI", type: "Misdemeanor", fine: 1500, jailTime: "6 Months", points: 3 },
  { id: 15, category: "Traffic Violations", code: "2800.1 VC", name: "Evading an Officer", type: "Misdemeanor", fine: 1000, jailTime: "1 Year", points: 3 },
  { id: 16, category: "Traffic Violations", code: "2800.2 VC", name: "Felony Evading", type: "Felony", fine: 5000, jailTime: "5 Years", points: 7 },
  { id: 17, category: "Weapons Offenses", code: "25400 PC", name: "Carrying Concealed Firearm", type: "Felony", fine: 3000, jailTime: "3 Years", points: 5 },
  { id: 18, category: "Weapons Offenses", code: "417 PC", name: "Brandishing a Weapon", type: "Misdemeanor", fine: 1000, jailTime: "1 Year", points: 3 },
  { id: 19, category: "Public Order", code: "148 PC", name: "Resisting Arrest", type: "Misdemeanor", fine: 1000, jailTime: "1 Year", points: 2 },
  { id: 20, category: "Public Order", code: "415 PC", name: "Disturbing the Peace", type: "Infraction", fine: 400, jailTime: "None", points: 0 },
];

export const REPORTS = [
  { id: 1, type: "Traffic Stop", caseNumber: "ADPS-2023-1042", officerBadge: "831-12", date: "2023-10-15", status: "Submitted", callId: "23-1042", civilianId: null, summary: "Traffic stop on Elm St. Driver showed signs of impairment. Field sobriety conducted." },
  { id: 2, type: "Arrest Report", caseNumber: "ADPS-2023-0912", officerBadge: "831-04", date: "2023-09-01", status: "Approved", callId: "23-0912", civilianId: 3, summary: "Arrest of Darnell Washington on narcotics charges following foot pursuit." },
  { id: 3, type: "Use of Force", caseNumber: "ADPS-2023-0912-UOF", officerBadge: "831-04", date: "2023-09-01", status: "Pending Review", callId: "23-0912", civilianId: 3, summary: "Use of force during arrest. Subject resisted, officer used takedown technique." },
  { id: 4, type: "Incident Report", caseNumber: "ADPS-2023-0503", officerBadge: "831-07", date: "2023-10-12", status: "Approved", callId: "23-1038", civilianId: null, summary: "MVA at Oak & 5th. No injuries. Both drivers exchanged information." },
];

export const REPORT_TEMPLATES = [
  {
    id: 1,
    name: "Traffic Stop",
    fields: [
      { id: "f1", label: "Date/Time", type: "datetime", required: true },
      { id: "f2", label: "Officer Badge", type: "badge_lookup", required: true },
      { id: "f3", label: "Location", type: "text", required: true },
      { id: "f4", label: "Vehicle Plate", type: "text", required: true },
      { id: "f5", label: "Driver Name", type: "civilian_lookup", required: true },
      { id: "f6", label: "Reason for Stop", type: "dropdown", required: true, options: ["Speeding","Red Light Violation","Equipment Violation","Expired Registration","Erratic Driving","Other"] },
      { id: "f7", label: "DL Checked", type: "checkbox", required: false },
      { id: "f8", label: "Sobriety Test Administered", type: "checkbox", required: false },
      { id: "f9", label: "Outcome", type: "dropdown", required: true, options: ["Warning","Citation","Arrest","No Action"] },
      { id: "f10", label: "Narrative", type: "textarea", required: true },
    ]
  },
  {
    id: 2,
    name: "Use of Force",
    fields: [
      { id: "f1", label: "Date/Time", type: "datetime", required: true },
      { id: "f2", label: "Officer Badge", type: "badge_lookup", required: true },
      { id: "f3", label: "Subject Name", type: "civilian_lookup", required: true },
      { id: "f4", label: "Location", type: "text", required: true },
      { id: "f5", label: "Force Type Used", type: "dropdown", required: true, options: ["Verbal Commands","Soft Empty Hand","Hard Empty Hand","OC Spray","Taser","Impact Weapon","K9","Firearm"] },
      { id: "f6", label: "Reason for Force", type: "textarea", required: true },
      { id: "f7", label: "Subject Injured", type: "checkbox", required: false },
      { id: "f8", label: "Officer Injured", type: "checkbox", required: false },
      { id: "f9", label: "EMS Called", type: "checkbox", required: false },
      { id: "f10", label: "Full Narrative", type: "textarea", required: true },
    ]
  },
  {
    id: 3,
    name: "Arrest Report",
    fields: [
      { id: "f1", label: "Date/Time of Arrest", type: "datetime", required: true },
      { id: "f2", label: "Arresting Officer Badge", type: "badge_lookup", required: true },
      { id: "f3", label: "Arrestee Name", type: "civilian_lookup", required: true },
      { id: "f4", label: "Location of Arrest", type: "text", required: true },
      { id: "f5", label: "Charges", type: "textarea", required: true },
      { id: "f6", label: "Bail Set ($)", type: "text", required: false },
      { id: "f7", label: "Weapons Seized", type: "checkbox", required: false },
      { id: "f8", label: "Drugs Seized", type: "checkbox", required: false },
      { id: "f9", label: "Evidence Collected", type: "textarea", required: false },
      { id: "f10", label: "Narrative", type: "textarea", required: true },
    ]
  },
  {
    id: 4,
    name: "Incident Report",
    fields: [
      { id: "f1", label: "Date/Time", type: "datetime", required: true },
      { id: "f2", label: "Reporting Officer Badge", type: "badge_lookup", required: true },
      { id: "f3", label: "Incident Type", type: "dropdown", required: true, options: ["MVA","Property Damage","Theft","Vandalism","Disturbance","Other"] },
      { id: "f4", label: "Location", type: "text", required: true },
      { id: "f5", label: "Parties Involved", type: "textarea", required: false },
      { id: "f6", label: "Injuries Reported", type: "checkbox", required: false },
      { id: "f7", label: "Property Damage", type: "checkbox", required: false },
      { id: "f8", label: "Narrative", type: "textarea", required: true },
    ]
  },
  {
    id: 5,
    name: "Field Interview",
    fields: [
      { id: "f1", label: "Date/Time", type: "datetime", required: true },
      { id: "f2", label: "Officer Badge", type: "badge_lookup", required: true },
      { id: "f3", label: "Subject Name", type: "civilian_lookup", required: true },
      { id: "f4", label: "Location", type: "text", required: true },
      { id: "f5", label: "Reason for Contact", type: "textarea", required: true },
      { id: "f6", label: "Subject Description", type: "textarea", required: false },
      { id: "f7", label: "Associates Present", type: "text", required: false },
      { id: "f8", label: "Outcome", type: "dropdown", required: true, options: ["No Action","Warned","Cited","Arrested","Referred"] },
      { id: "f9", label: "Notes", type: "textarea", required: false },
    ]
  },
  {
    id: 6,
    name: "Supplement Report",
    fields: [
      { id: "f1", label: "Original Case Number", type: "text", required: true },
      { id: "f2", label: "Date/Time", type: "datetime", required: true },
      { id: "f3", label: "Supplement Author Badge", type: "badge_lookup", required: true },
      { id: "f4", label: "Supplement Narrative", type: "textarea", required: true },
      { id: "f5", label: "New Evidence", type: "textarea", required: false },
    ]
  },
];

export const BANNED_USERS = [
  { id: 1, name: "xX_GunRunner_Xx", discordId: "111222333444", reason: "Mass RDM - killed 14 civilians in spawn area", issuedBy: "Admin Reeves", date: "2023-09-30", duration: "Permanent", status: "Active" },
  { id: 2, name: "SpeedHack420", discordId: "222333444555", reason: "Modding/hacking vehicle speed, evading RP consequences", issuedBy: "Admin Santos", date: "2023-10-01", duration: "30 Days", status: "Active" },
  { id: 3, name: "ToxicPlayer99", discordId: "333444555666", reason: "Verbal harassment of staff and community members", issuedBy: "Admin Reeves", date: "2023-08-15", duration: "7 Days", status: "Expired" },
];

export const AUDIT_LOG = [
  { id: 1, user: "Sgt. Reeves (831-04)", action: "Created warrant for Darnell Washington", timestamp: "2023-10-15 14:00", module: "Warrants" },
  { id: 2, user: "Off. Santos (831-12)", action: "Created call 23-1042 (Traffic Stop)", timestamp: "2023-10-15 14:22", module: "Dispatch" },
  { id: 3, user: "Dispatch Admin", action: "Banned user xX_GunRunner_Xx (Permanent)", timestamp: "2023-09-30 21:14", module: "Admin" },
  { id: 4, user: "Sgt. Reeves (831-04)", action: "Approved report ADPS-2023-0912", timestamp: "2023-09-02 09:30", module: "Reports" },
  { id: 5, user: "Off. Walsh (831-07)", action: "Status changed to AVAILABLE", timestamp: "2023-10-15 14:05", module: "CAD" },
  { id: 6, user: "Det. Nair (831-19)", action: "Ran plate lookup: SUS-1109", timestamp: "2023-10-15 14:18", module: "Returns" },
  { id: 7, user: "Admin System", action: "New user registered: Jessica Huang (Discord: 722516079)", timestamp: "2023-10-10 18:44", module: "Admin" },
];

export const MESSAGES = [
  { id: 1, from: "Dispatch", to: "All Units", subject: "BOLO - Black Dodge Charger", body: "BOLO for a black Dodge Charger, plate SUS-1109. Owner has active warrant. Do not approach without backup. Last seen northbound on Highway 1.", timestamp: "2023-10-15 14:05", read: false, priority: "HIGH" },
  { id: 2, from: "Sgt. Reeves (831-04)", to: "All ADPS Units", subject: "Briefing Update", body: "All patrol units be advised: increased gang activity reported in the Riverside district. Exercise caution. Extra patrol ordered for evening shift.", timestamp: "2023-10-15 13:00", read: true, priority: "NORMAL" },
  { id: 3, from: "Lt. Commander", to: "Supervisors", subject: "Use of Force Policy Update", body: "New UOF reporting requirements take effect Monday. All use of force incidents must now include supervisor review within 24 hours. See full policy on department portal.", timestamp: "2023-10-14 09:15", read: true, priority: "NORMAL" },
];

export const CUSTOM_RECORD_TYPES = [
  {
    id: 1,
    name: "Gang File",
    fields: [
      { id: "f1", label: "Subject Name", type: "civilian_lookup", required: true },
      { id: "f2", label: "Known Aliases", type: "text", required: false },
      { id: "f3", label: "Gang Affiliation", type: "text", required: true },
      { id: "f4", label: "Known Associates", type: "textarea", required: false },
      { id: "f5", label: "Territory", type: "text", required: false },
      { id: "f6", label: "Notes", type: "textarea", required: false },
    ]
  },
  {
    id: 2,
    name: "Firearm Registration",
    fields: [
      { id: "f1", label: "Owner", type: "civilian_lookup", required: true },
      { id: "f2", label: "Make", type: "text", required: true },
      { id: "f3", label: "Model", type: "text", required: true },
      { id: "f4", label: "Serial Number", type: "text", required: true },
      { id: "f5", label: "Caliber", type: "text", required: true },
      { id: "f6", label: "Registration Date", type: "date", required: true },
      { id: "f7", label: "Stolen?", type: "checkbox", required: false },
    ]
  },
];

export const TOW_LOGS = [
  { id: 1, plate: "SUS-1109", make: "Dodge", model: "Charger", towedBy: "Off. Santos (831-12)", reason: "Evidence Hold - Active Warrant", location: "PD Impound Lot A", date: "2023-10-10", releaseStatus: "Hold" },
  { id: 2, plate: "GRN-5543", make: "Honda", model: "Civic", towedBy: "Off. Walsh (831-07)", reason: "Expired Registration - Roadway Obstruction", location: "City Impound Lot", date: "2023-09-22", releaseStatus: "Released" },
];

export const ACTIVE_SESSIONS = [
  { userId: 1, name: "James Reeves", role: "Admin", loginTime: "2023-10-15 13:45", lastActive: "2023-10-15 14:55", ip: "10.0.0.12" },
  { userId: 2, name: "Maria Santos", role: "User", loginTime: "2023-10-15 14:00", lastActive: "2023-10-15 14:54", ip: "10.0.0.34" },
  { userId: 6, name: "Lisa Park", role: "User", loginTime: "2023-10-15 14:10", lastActive: "2023-10-15 14:50", ip: "10.0.0.56" },
];

export const WHITELIST_APPS = [
  { id: 1, discordId: "998877665544", name: "NewPlayer_Johnny", appliedDate: "2023-10-14", status: "Pending", notes: "Applied via website" },
  { id: 2, discordId: "887766554433", name: "RPFan2023", appliedDate: "2023-10-13", status: "Pending", notes: "Referred by Sgt. Reeves" },
  { id: 3, discordId: "776655443322", name: "OfficerHopeful", appliedDate: "2023-10-12", status: "Approved", notes: "" },
];
