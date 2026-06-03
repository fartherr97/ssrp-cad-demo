export const DEPARTMENTS = [
  { id: 1, name: "Tampa Police Department", short: "TPD", abbreviation: "TPD", color: "#1a6bbf", type: "LEO", badgePrefix: "TPD", radioChannel: "TPD-1", subdivisions: ["Patrol","K9","Traffic","SWAT","Detectives"] },
  { id: 2, name: "Hillsborough County Sheriff's Office", short: "HCSO", abbreviation: "HCSO", color: "#2e7d32", type: "LEO", badgePrefix: "HCSO", radioChannel: "SO-1", subdivisions: ["Patrol","Marine","Air Support","Civil"] },
  { id: 3, name: "Hillsborough County Fire Rescue", short: "HCFR", abbreviation: "HCFR", color: "#c62828", type: "Fire", badgePrefix: "HCFR", radioChannel: "FIRE-1", subdivisions: ["Engine","Ladder","Rescue","Hazmat"] },
  { id: 4, name: "Florida Highway Patrol", short: "FHP", abbreviation: "FHP", color: "#c8a860", type: "LEO", badgePrefix: "FHP", radioChannel: "FHP-1", subdivisions: ["Patrol","Commercial Vehicle","Air"] },
  { id: 5, name: "Florida Dept of Transportation", short: "FDOT", abbreviation: "FDOT", color: "#e07820", type: "Civilian", badgePrefix: "FDOT", radioChannel: "FDOT-1", subdivisions: ["Road Operations","Inspections","Signals"] },
  { id: 6, name: "Civilian Operations", short: "CIV-OPS", abbreviation: "CIV", color: "#7878aa", type: "Civilian", badgePrefix: "CIV", radioChannel: "CIV-1", subdivisions: ["ECC","Admin","Support"] },
];

export const RANKS = {
  LEO: ["Cadet","Officer","Corporal","Sergeant","Lieutenant","Captain","Deputy Chief","Chief"],
  Fire: ["Probationary Firefighter","Firefighter","Driver Engineer","Lieutenant","Captain","Battalion Chief","Assistant Chief","Fire Chief"],
  EMS: ["EMT-Basic","EMT-Advanced","Paramedic","Senior Paramedic","Supervisor","EMS Chief"],
};

export const OFFICERS = [
  { id: 1,  name: "James Reeves",     badge: "TPD-831",  unitId: "TPD-831",  dept: 1, deptShort: "TPD",     subdivision: "Patrol",    rank: "Sergeant",        status: "AVAILABLE",   callId: null,     location: "Oak & 5th Ave",          discordId: "205947291", role: "admin" },
  { id: 2,  name: "Maria Santos",     badge: "TPD-819",  unitId: "TPD-819",  dept: 1, deptShort: "TPD",     subdivision: "K9",        rank: "Officer",         status: "BUSY",        callId: "26-1042",location: "Elm St / Route 9",        discordId: "309182746", role: "user" },
  { id: 3,  name: "Derek Walsh",      badge: "TPD-807",  unitId: "TPD-807",  dept: 1, deptShort: "TPD",     subdivision: "Traffic",   rank: "Corporal",        status: "AVAILABLE",   callId: null,     location: "US-41 NB / Fletcher",    discordId: "419283746", role: "user" },
  { id: 4,  name: "Tanya Brooks",     badge: "HCSO-422", unitId: "HCSO-422", dept: 2, deptShort: "HCSO",    subdivision: "Patrol",    rank: "Deputy",          status: "UNAVAILABLE", callId: null,     location: "County Line Rd / Gunn",  discordId: "520394857", role: "user" },
  { id: 5,  name: "Kyle Jensen",      badge: "HCSO-318", unitId: "HCSO-318", dept: 2, deptShort: "HCSO",    subdivision: "Patrol",    rank: "Deputy",          status: "AVAILABLE",   callId: null,     location: "Bruce B Downs / 56th",   discordId: "520394858", role: "user" },
  { id: 6,  name: "Carlos Mendes",    badge: "FHP-209",  unitId: "FHP-209",  dept: 4, deptShort: "FHP",     subdivision: "Patrol",    rank: "Trooper",         status: "AVAILABLE",   callId: null,     location: "I-275 MM 42",            discordId: "621405968", role: "user" },
  { id: 7,  name: "Amanda Torres",    badge: "FHP-214",  unitId: "FHP-214",  dept: 4, deptShort: "FHP",     subdivision: "Patrol",    rank: "Trooper",         status: "ENRT",        callId: "26-1046",location: "I-4 EB / MLK Blvd",      discordId: "621405969", role: "user" },
  { id: 8,  name: "Lisa Park",        badge: "HCFR-M3",  unitId: "HCFR-M3",  dept: 3, deptShort: "HCFR",   subdivision: "Rescue",    rank: "Paramedic",       status: "ENRT",        callId: "26-1044",location: "88 Commerce Blvd",       discordId: "722516079", role: "user" },
  { id: 9,  name: "Frank Donovan",    badge: "HCFR-E11", unitId: "HCFR-E11", dept: 3, deptShort: "HCFR",   subdivision: "Engine",    rank: "Driver Engineer", status: "ENRT",        callId: "26-1044",location: "88 Commerce Blvd",       discordId: "823627180", role: "user" },
  { id: 10, name: "Marcus Hale",      badge: "HCFR-L7",  unitId: "HCFR-L7",  dept: 3, deptShort: "HCFR",   subdivision: "Ladder",    rank: "Firefighter",     status: "ENRT",        callId: "26-1044",location: "88 Commerce Blvd",       discordId: "100200301", role: "user" },
  { id: 11, name: "Elena Ruiz",       badge: "HCFR-M7",  unitId: "HCFR-M7",  dept: 3, deptShort: "HCFR",   subdivision: "Rescue",    rank: "Paramedic",       status: "AVAILABLE",   callId: null,     location: "Station 7 / Sheldon Rd", discordId: "100200302", role: "user" },
  { id: 12, name: "Owen Pratt",       badge: "HCFR-BC1", unitId: "HCFR-BC1", dept: 3, deptShort: "HCFR",   subdivision: "Command",   rank: "Battalion Chief", status: "AVAILABLE",   callId: null,     location: "Station 1 / Twiggs St",  discordId: "100200303", role: "user" },
  { id: 13, name: "Ray Calhoun",      badge: "FDOT-11",  unitId: "FDOT-11",  dept: 5, deptShort: "FDOT",    subdivision: "Road Ops",  rank: "Inspector",       status: "AVAILABLE",   callId: null,     location: "I-275 TMC",              discordId: "100200305", role: "user" },
  { id: 14, name: "Dana Mercer",      badge: "ECC-1",    unitId: "ECC-1",    dept: 6, deptShort: "CIV-OPS", subdivision: "Dispatch",  rank: "Lead Dispatcher", status: "AVAILABLE",   callId: null,     location: "Emergency Comm Center",  discordId: "100200300", role: "dispatch" },
  { id: 15, name: "Priya Nair",       badge: "TPD-839",  unitId: "TPD-839",  dept: 1, deptShort: "TPD",     subdivision: "Detectives",rank: "Detective",       status: "AVAILABLE",   callId: null,     location: "TPD HQ / Morgan St",     discordId: "924738291", role: "user" },
  { id: 16, name: "Sara Lindqvist",   badge: "HCFR-HZ2", unitId: "HCFR-HZ2", dept: 3, deptShort: "HCFR",   subdivision: "Hazmat",    rank: "Firefighter",     status: "OFFDUTY",     callId: null,     location: "Station 2 / Linebaugh",  discordId: "100200304", role: "user" },
];

export const CALLS = [
  { id: "26-1042", nature: "Traffic Stop",          category: "police", location: "Elm St / Route 9",          city: "Tampa",           county: "Hillsborough", priority: 3, status: "ACTIVE",  units: ["TPD-819"],                   description: "Speeding vehicle * driver appears impaired. Field sobriety in progress.", timestamp: "2026-06-01 14:22", reportingParty: "Officer Santos" },
  { id: "26-1043", nature: "Domestic Disturbance",  category: "police", location: "412 Oakwood Ave",           city: "Tampa",           county: "Hillsborough", priority: 1, status: "PENDING", units: [],                            description: "Caller reports loud arguing and breaking objects. Child in residence. Neighbor called 911.", timestamp: "2026-06-01 14:30", reportingParty: "911 Caller" },
  { id: "26-1044", nature: "Structure Fire",         category: "fire",   location: "88 Commerce Blvd",          city: "Brandon",         county: "Hillsborough", priority: 1, status: "ACTIVE",  units: ["HCFR-E11","HCFR-L7","HCFR-M3"], description: "2-story commercial building. Smoke visible 3rd floor. Occupants evacuating. Confirmed working fire.", timestamp: "2026-06-01 14:35", reportingParty: "911 Caller" },
  { id: "26-1045", nature: "Suspicious Person",      category: "police", location: "Curtis Hixon Waterfront Park",city: "Tampa",          county: "Hillsborough", priority: 2, status: "PENDING", units: [],                            description: "Male in black hoodie, early 20s, staring at parked vehicles. Possibly casing. No weapons seen.", timestamp: "2026-06-01 14:40", reportingParty: "Civilian Report" },
  { id: "26-1046", nature: "MVA w/ Injuries",        category: "fire",   location: "I-4 EB / MLK Blvd",         city: "Tampa",           county: "Hillsborough", priority: 1, status: "ENRT",    units: ["FHP-214"],                   description: "3-vehicle collision eastbound I-4. 2 confirmed injuries, 1 possible entrapment. Caller states airbags deployed.", timestamp: "2026-06-01 14:45", reportingParty: "911 Caller" },
  { id: "26-1047", nature: "Noise Complaint",         category: "police", location: "77 Pine Ridge Dr",          city: "Plant City",      county: "Hillsborough", priority: 3, status: "PENDING", units: [],                            description: "Loud music from backyard. Multiple callers. Ongoing since 2300 hrs.", timestamp: "2026-06-01 14:50", reportingParty: "Dispatch" },
  { id: "26-1048", nature: "Medical - Cardiac Arrest",category: "fire",   location: "210 Bayshore Blvd Apt 4B",  city: "Tampa",           county: "Hillsborough", priority: 1, status: "PENDING", units: [],                            description: "62 y/o male unresponsive. Bystander CPR in progress. Caller states no prior cardiac history. ALS requested.", timestamp: "2026-06-01 14:52", reportingParty: "911 Caller" },
  { id: "26-1049", nature: "Brush Fire",              category: "fire",   location: "Riverview Nature Preserve",  city: "Riverview",       county: "Hillsborough", priority: 2, status: "PENDING", units: [],                            description: "Approx 2 acres burning. Wind pushing toward tree line near residential area. Brush truck and tanker requested.", timestamp: "2026-06-01 14:55", reportingParty: "Park Ranger" },
  { id: "26-1050", nature: "Theft - Shoplifting",     category: "police", location: "4302 W Boy Scout Blvd",     city: "Tampa",           county: "Hillsborough", priority: 4, status: "PENDING", units: [],                            description: "Loss prevention holding male subject who concealed merchandise. Requesting unit for report. No weapons.", timestamp: "2026-06-01 15:01", reportingParty: "Loss Prevention" },
  { id: "26-1051", nature: "Road Hazard",              category: "police", location: "I-275 SB / Sligh Ave",      city: "Tampa",           county: "Hillsborough", priority: 3, status: "PENDING", units: [],                            description: "Vehicle debris in travel lane southbound I-275. Multiple callers. FDOT notified. Request unit for traffic control.", timestamp: "2026-06-01 15:04", reportingParty: "FDOT-11" },
];

export const CIVILIANS = [
  { id: 1, firstName: "Michael", lastName: "Torres", dob: "1988-03-14", gender: "Male", ethnicity: "Hispanic", height: "5'11\"", weight: "185 lbs", hair: "Black", eyes: "Brown", ssn: "412-88-3301", phone: "555-0192", address: "1204 Riverside Dr, Tampa", dlNumber: "T8821044", dlClass: "Class C", dlStatus: "ACTIVE", dlExpiry: "2026-03-14", vehicles: [1,2], flags: [], ownedByPlayer: true, weaponPermit: "ACTIVE", weaponPermitExpiry: "2026-08-01",
    medicalProfile: { bloodType: "O+", organDonor: true, dnr: false, conditions: ["Type 2 Diabetes"], allergies: [], medications: ["Metformin 500mg daily"], emergencyContact: { name: "Carmen Torres", phone: "555-0199", relationship: "Spouse" }, safetyNotes: "", notes: "" },
  },
  { id: 2, firstName: "Amanda", lastName: "Chen", dob: "1995-07-22", gender: "Female", ethnicity: "Asian", height: "5'4\"", weight: "125 lbs", hair: "Black", eyes: "Brown", ssn: "509-44-2210", phone: "555-0334", address: "88 Orchid Lane, Tampa", dlNumber: "C5543219", dlClass: "Class C", dlStatus: "ACTIVE", dlExpiry: "2025-07-22", vehicles: [3], flags: ["CAUTION"], ownedByPlayer: true, weaponPermit: "NONE", weaponPermitExpiry: "",
    medicalProfile: { bloodType: "A-", organDonor: false, dnr: false, conditions: ["Generalized Anxiety Disorder"], allergies: ["Penicillin"], medications: ["Escitalopram 10mg daily"], emergencyContact: { name: "David Chen", phone: "555-0335", relationship: "Father" }, safetyNotes: "Known anxiety episodes; may appear agitated or erratic under stress.", notes: "" },
  },
  { id: 3, firstName: "Darnell", lastName: "Washington", dob: "1979-11-05", gender: "Male", ethnicity: "Black", height: "6'1\"", weight: "210 lbs", hair: "Black", eyes: "Dark Brown", ssn: "618-77-9901", phone: "555-0441", address: "330 Magnolia Blvd, Tampa", dlNumber: "W1109872", dlClass: "Class C", dlStatus: "SUSPENDED", dlExpiry: "2024-11-05", vehicles: [4], flags: ["WARRANT","CAUTION"],
    medicalProfile: { bloodType: "B+", organDonor: false, dnr: false, conditions: ["Bipolar Disorder", "Substance Use Disorder (Cocaine)"], allergies: [], medications: ["Lithium 600mg daily"], emergencyContact: { name: "Donna Washington", phone: "555-0442", relationship: "Sister" }, safetyNotes: "History of combative behavior during manic episodes. Active cocaine dependency — may be under influence. Non-compliant with medication history.", notes: "" },
  },
  { id: 4, firstName: "Jessica", lastName: "Huang", dob: "2001-04-18", gender: "Female", ethnicity: "Asian", height: "5'2\"", weight: "115 lbs", hair: "Brown", eyes: "Brown", ssn: "723-11-4456", phone: "555-0557", address: "21 College Ave Apt 4B, Tampa", dlNumber: "H4456012", dlClass: "Class C", dlStatus: "ACTIVE", dlExpiry: "2027-04-18", vehicles: [], flags: [],
    medicalProfile: { bloodType: "AB+", organDonor: true, dnr: false, conditions: [], allergies: ["Shellfish", "Sulfa drugs"], medications: [], emergencyContact: { name: "Linda Huang", phone: "555-0558", relationship: "Mother" }, safetyNotes: "", notes: "" },
  },
  { id: 5, firstName: "Robert", lastName: "Marino", dob: "1965-09-30", gender: "Male", ethnicity: "White", height: "5'9\"", weight: "195 lbs", hair: "Gray", eyes: "Blue", ssn: "301-55-8812", phone: "555-0678", address: "5 Harbor View Ct, Tampa", dlNumber: "M8812345", dlClass: "Class A", dlStatus: "ACTIVE", dlExpiry: "2025-09-30", vehicles: [5,6], flags: ["VIOLENT"],
    medicalProfile: { bloodType: "A+", organDonor: false, dnr: true, conditions: ["Congestive Heart Failure", "Atrial Fibrillation"], allergies: ["Warfarin", "NSAIDs"], medications: ["Apixaban 5mg twice daily", "Carvedilol 25mg daily", "Furosemide 40mg daily"], emergencyContact: { name: "Monica Marino", phone: "555-0679", relationship: "Spouse" }, safetyNotes: "History of violent assault resulting in felony conviction. May become physically aggressive when confronted.", notes: "DNR in effect — do not resuscitate. Contact emergency contact prior to any transport." },
  },
];

export const VEHICLES = [
  // type added for form autofill (Vehicle Type dropdown)
  { id: 1, plate: "ARC-1204", type: "Truck",      make: "Ford",            model: "F-150",    year: "2019", color: "Black",       regStatus: "VALID",     regExpiry: "2027-10-31", ownerId: 1, businessOwnerId: null, stolen: false, flags: [] },
  { id: 2, plate: "TRK-8821", type: "Truck",      make: "Chevrolet",       model: "Silverado",year: "2021", color: "White",       regStatus: "VALID",     regExpiry: "2027-01-15", ownerId: 1, businessOwnerId: null, stolen: false, flags: [] },
  { id: 3, plate: "GRN-5543", type: "Sedan",      make: "Honda",           model: "Civic",    year: "2020", color: "Silver",      regStatus: "EXPIRED",   regExpiry: "2025-07-22", ownerId: 2, businessOwnerId: null, stolen: false, flags: ["EXPIRED REG"] },
  { id: 4, plate: "SUS-1109", type: "Sedan",      make: "Dodge",           model: "Charger",  year: "2018", color: "Charcoal",    regStatus: "SUSPENDED", regExpiry: "2024-09-01", ownerId: 3, businessOwnerId: null, stolen: false, flags: ["OWNER WANTED"] },
  { id: 5, plate: "MAR-3012", type: "Sedan",      make: "BMW",             model: "740i",     year: "2022", color: "White",       regStatus: "VALID",     regExpiry: "2027-09-30", ownerId: 5, businessOwnerId: null, stolen: false, flags: [] },
  { id: 6, plate: "HAR-5512", type: "Motorcycle", make: "Harley-Davidson", model: "Road King",year: "2020", color: "Black",       regStatus: "VALID",     regExpiry: "2027-09-30", ownerId: 5, businessOwnerId: null, stolen: false, flags: [] },
  // Batavia Tow fleet (businessOwnerId: 1)
  { id: 7,  plate: "BAT-101", type: "Tow Truck", make: "Ford",      model: "F-450",   year: "2022", color: "White / Orange", regStatus: "VALID", regExpiry: "2027-06-01", ownerId: null, businessOwnerId: 1, stolen: false, flags: [] },
  { id: 8,  plate: "BAT-102", type: "Flatbed",   make: "Ram",       model: "5500",    year: "2021", color: "White",          regStatus: "VALID", regExpiry: "2027-04-15", ownerId: null, businessOwnerId: 1, stolen: false, flags: [] },
  { id: 9,  plate: "BAT-103", type: "Rollback",  make: "Kenworth",  model: "T270",    year: "2020", color: "Silver",         regStatus: "VALID", regExpiry: "2026-11-30", ownerId: null, businessOwnerId: 1, stolen: false, flags: [] },
  // FDOT Tow Operations fleet (businessOwnerId: 2)
  { id: 10, plate: "FDT-201", type: "Pickup",    make: "Ford",      model: "F-350",   year: "2023", color: "Orange / Yellow",regStatus: "VALID", regExpiry: "2027-12-31", ownerId: null, businessOwnerId: 2, stolen: false, flags: [] },
  { id: 11, plate: "FDT-202", type: "Heavy Tow", make: "Peterbilt", model: "367",     year: "2022", color: "Orange",         regStatus: "VALID", regExpiry: "2027-12-31", ownerId: null, businessOwnerId: 2, stolen: false, flags: [] },
];

export const WARRANTS = [
  { id: 1, civilianId: 3, civilianName: "Darnell Washington", type: "Arrest Warrant",   charge: "Possession of Controlled Substance", issuedBy: "Det. Nair (TPD-839)", issuedDate: "2026-04-12", status: "ACTIVE", notes: "Subject known to frequent 330 Magnolia Blvd area" },
  { id: 2, civilianId: 2, civilianName: "Amanda Chen",        type: "Bench Warrant",    charge: "Failure to Appear",                  issuedBy: "Judge Martinez",       issuedDate: "2026-03-05", status: "ACTIVE", notes: "FTA on 2026-02-28 court date for prior traffic charges" },
];

export const CRIMINAL_HISTORY = [
  { id: 1, civilianId: 3, date: "2026-04-01", charges: ["Possession of Controlled Substance", "Resisting Arrest"], officerBadge: "TPD-831", agency: "TPD", caseNumber: "TPD-2026-0401", disposition: "Arrested", sentence: "Pending Trial",           callId: "26-0401", notes: "Subject fled on foot, caught after 2-block pursuit" },
  { id: 2, civilianId: 2, date: "2026-02-10", charges: ["Speeding (25+ Over)", "Reckless Driving"],                  officerBadge: "TPD-807", agency: "TPD", caseNumber: "TPD-2026-0210", disposition: "Cited",    sentence: "$850 fine",               callId: "26-0210", notes: "Vehicle traveling 72 in 45 zone on Dale Mabry" },
  { id: 3, civilianId: 5, date: "2025-11-20", charges: ["Assault with Deadly Weapon"],                               officerBadge: "TPD-831", agency: "TPD", caseNumber: "TPD-2025-1120", disposition: "Arrested", sentence: "18 months probation",     callId: "25-1120", notes: "Bar altercation * victim required hospitalization" },
  { id: 4, civilianId: 1, date: "2025-05-03", charges: ["DUI"],                                                       officerBadge: "TPD-807", agency: "TPD", caseNumber: "TPD-2025-0503", disposition: "Arrested", sentence: "License susp. 1 yr $1500",callId: "25-0503", notes: "BAC 0.14 on Kennedy Blvd" },
];

export const PENAL_CODE = [
  { id: 1,  category: "Crimes Against Persons",   code: "187 PC",    name: "Murder",                          type: "Felony",      fine: 0,     jailTime: "Life",     points: 10 },
  { id: 2,  category: "Crimes Against Persons",   code: "187(2) PC", name: "Attempted Murder",                type: "Felony",      fine: 0,     jailTime: "25 Years", points: 9  },
  { id: 3,  category: "Crimes Against Persons",   code: "240 PC",    name: "Assault",                         type: "Misdemeanor", fine: 2500,  jailTime: "6 Months", points: 3  },
  { id: 4,  category: "Crimes Against Persons",   code: "245 PC",    name: "Assault with Deadly Weapon",      type: "Felony",      fine: 5000,  jailTime: "10 Years", points: 7  },
  { id: 5,  category: "Crimes Against Persons",   code: "261 PC",    name: "Sexual Assault",                  type: "Felony",      fine: 0,     jailTime: "15 Years", points: 9  },
  { id: 6,  category: "Crimes Against Property",  code: "459 PC",    name: "Burglary",                        type: "Felony",      fine: 3000,  jailTime: "6 Years",  points: 6  },
  { id: 7,  category: "Crimes Against Property",  code: "487 PC",    name: "Grand Theft",                     type: "Felony",      fine: 5000,  jailTime: "3 Years",  points: 5  },
  { id: 8,  category: "Crimes Against Property",  code: "488 PC",    name: "Petty Theft",                     type: "Misdemeanor", fine: 1000,  jailTime: "6 Months", points: 2  },
  { id: 9,  category: "Crimes Against Property",  code: "594 PC",    name: "Vandalism",                       type: "Misdemeanor", fine: 1500,  jailTime: "1 Year",   points: 2  },
  { id: 10, category: "Drug Offenses",             code: "11350 HS",  name: "Possession of Controlled Sub.",  type: "Felony",      fine: 2000,  jailTime: "3 Years",  points: 4  },
  { id: 11, category: "Drug Offenses",             code: "11352 HS",  name: "Possession w/ Intent to Distrib",type: "Felony",      fine: 10000, jailTime: "9 Years",  points: 8  },
  { id: 12, category: "Drug Offenses",             code: "11357 HS",  name: "Possession of Marijuana",        type: "Infraction",  fine: 100,   jailTime: "None",     points: 0  },
  { id: 13, category: "Traffic Violations",        code: "22350 VC",  name: "Speeding",                       type: "Infraction",  fine: 250,   jailTime: "None",     points: 1  },
  { id: 14, category: "Traffic Violations",        code: "23152 VC",  name: "DUI",                            type: "Misdemeanor", fine: 1500,  jailTime: "6 Months", points: 3  },
  { id: 15, category: "Traffic Violations",        code: "2800.1 VC", name: "Evading an Officer",             type: "Misdemeanor", fine: 1000,  jailTime: "1 Year",   points: 3  },
  { id: 16, category: "Traffic Violations",        code: "2800.2 VC", name: "Felony Evading",                 type: "Felony",      fine: 5000,  jailTime: "5 Years",  points: 7  },
  { id: 17, category: "Weapons Offenses",          code: "25400 PC",  name: "Carrying Concealed Firearm",     type: "Felony",      fine: 3000,  jailTime: "3 Years",  points: 5  },
  { id: 18, category: "Weapons Offenses",          code: "417 PC",    name: "Brandishing a Weapon",           type: "Misdemeanor", fine: 1000,  jailTime: "1 Year",   points: 3  },
  { id: 19, category: "Public Order",              code: "148 PC",    name: "Resisting Arrest",               type: "Misdemeanor", fine: 1000,  jailTime: "1 Year",   points: 2  },
  { id: 20, category: "Public Order",              code: "415 PC",    name: "Disturbing the Peace",           type: "Infraction",  fine: 400,   jailTime: "None",     points: 0  },
];

export const REPORTS = [
  // ── TPD ──
  { id: 1,  type: "Traffic Stop",   caseNumber: "TPD-2026-1042",     officerBadge: "TPD-819", date: "2026-06-01", status: "Pending Review",  callId: "26-1042", civilianId: null, summary: "Traffic stop on Elm St. Driver showed signs of impairment. Field sobriety conducted." },
  { id: 2,  type: "Arrest Report",  caseNumber: "TPD-2026-0401",     officerBadge: "TPD-831", date: "2026-04-01", status: "Approved",         callId: "26-0401", civilianId: 3,    summary: "Arrest of Darnell Washington on narcotics charges following foot pursuit." },
  { id: 3,  type: "Use of Force",   caseNumber: "TPD-2026-0401-UOF", officerBadge: "TPD-831", date: "2026-04-01", status: "Pending Review",   callId: "26-0401", civilianId: 3,    summary: "Use of force during arrest. Subject resisted, officer used takedown technique." },
  { id: 4,  type: "Incident Report",caseNumber: "TPD-2026-0503",     officerBadge: "TPD-807", date: "2026-05-03", status: "Approved",         callId: "26-1038", civilianId: null, summary: "MVA at Oak & 5th. No injuries. Both drivers exchanged information." },
  { id: 5,  type: "Traffic Stop",   caseNumber: "TPD-2026-0518",     officerBadge: "TPD-807", date: "2026-05-18", status: "Approved",         callId: null,      civilianId: null, summary: "Speed enforcement on Dale Mabry Hwy. Citation issued for 18 over." },
  { id: 6,  type: "Traffic Stop",   caseNumber: "TPD-2026-0524",     officerBadge: "TPD-831", date: "2026-05-24", status: "Approved",         callId: null,      civilianId: null, summary: "Stop on Kennedy Blvd for expired registration. Warning issued." },
  { id: 7,  type: "Arrest Report",  caseNumber: "TPD-2026-0527",     officerBadge: "TPD-819", date: "2026-05-27", status: "Approved",         callId: null,      civilianId: null, summary: "DUI arrest on Bayshore. Subject blew 0.11 BAC. Vehicle towed." },
  { id: 8,  type: "Use of Force",   caseNumber: "TPD-2026-0527-UOF", officerBadge: "TPD-819", date: "2026-05-27", status: "Pending Changes",  callId: null,      civilianId: null, summary: "Verbal commands and soft restraint used during DUI arrest. Subject attempted to flee." },
  { id: 9,  type: "Incident Report",caseNumber: "TPD-2026-0601",     officerBadge: "TPD-839", date: "2026-06-01", status: "Pending Review",   callId: null,      civilianId: null, summary: "Commercial burglary reported at 4302 W Boy Scout Blvd. Victim statement taken." },
  { id: 10, type: "Arrest Report",  caseNumber: "TPD-2026-0602",     officerBadge: "TPD-839", date: "2026-06-02", status: "Approved",         callId: null,      civilianId: null, summary: "Warrant service at subject's residence. Arrested without incident." },
  // ── HCSO ──
  { id: 11, type: "Traffic Stop",   caseNumber: "HCSO-2026-0315",    officerBadge: "HCSO-422",date: "2026-03-15", status: "Approved",         callId: null,      civilianId: null, summary: "Traffic stop on US-301. Warning issued for expired registration." },
  { id: 12, type: "Arrest Report",  caseNumber: "HCSO-2026-0402",    officerBadge: "HCSO-422",date: "2026-04-02", status: "Approved",         callId: null,      civilianId: null, summary: "DUI arrest following traffic stop. Subject blew 0.14 BAC." },
  { id: 13, type: "Use of Force",   caseNumber: "HCSO-2026-0402-UOF",officerBadge: "HCSO-422",date: "2026-04-02", status: "Approved",         callId: null,      civilianId: null, summary: "Minor force used during DUI arrest. Subject became combative." },
  { id: 14, type: "Incident Report",caseNumber: "HCSO-2026-0519",    officerBadge: "HCSO-422",date: "2026-05-19", status: "Approved",         callId: null,      civilianId: null, summary: "Disturbance at County Line Rd. Peace restored, no arrests." },
  { id: 15, type: "Traffic Stop",   caseNumber: "HCSO-2026-0528",    officerBadge: "HCSO-318",date: "2026-05-28", status: "Pending Review",   callId: null,      civilianId: null, summary: "Speeding stop on Bruce B Downs. Citation issued." },
  // ── FHP ──
  { id: 16, type: "Traffic Stop",   caseNumber: "FHP-2026-0410",     officerBadge: "FHP-209", date: "2026-04-10", status: "Approved",         callId: null,      civilianId: null, summary: "Commercial vehicle weight inspection on I-275. Citation for overweight load." },
  { id: 17, type: "Incident Report",caseNumber: "FHP-2026-0501",     officerBadge: "FHP-209", date: "2026-05-01", status: "Approved",         callId: null,      civilianId: null, summary: "Multi-vehicle crash on I-75. No fatalities. Lane closure coordinated with FDOT." },
  { id: 18, type: "Traffic Stop",   caseNumber: "FHP-2026-0530",     officerBadge: "FHP-214", date: "2026-05-30", status: "Approved",         callId: null,      civilianId: null, summary: "Speed enforcement I-4. Two citations issued, one arrest for suspended DL." },
  { id: 19, type: "Arrest Report",  caseNumber: "FHP-2026-0530-ARR", officerBadge: "FHP-214", date: "2026-05-30", status: "Pending Review",   callId: null,      civilianId: null, summary: "Arrest for driving on suspended license following I-4 traffic stop." },
];

export const REPORT_TEMPLATES = [
  {
    id: 1, name: "Traffic Stop",
    agency: "TAMPA POLICE DEPARTMENT",
    formCode: "TPD-TS-001",
    signatureSlots: ["Officer Signature / Badge #", "Supervisor Signature", "Date"],
    sections: [
      {
        id: "s1", title: "Incident Information", style: "blue",
        fields: [
          { id: "f1", label: "Date / Time",      type: "datetime",     span: 2, required: true },
          { id: "f3", label: "Location of Stop", type: "text",         span: 3, required: true },
          { id: "f2", label: "Officer Badge #",  type: "badge_lookup", span: 1, required: true, mono: true },
        ],
      },
      {
        id: "sCiv", title: "Civilian Information", style: "dark", lookup: "civilian",
        fields: [
          { id: "ci_first", label: "First Name",            type: "text",     span: 2, required: true },
          { id: "ci_last",  label: "Last Name",             type: "text",     span: 2 },
          { id: "ci_mi",    label: "M.I.",                  type: "text",     span: 1 },
          { id: "ci_dob",   label: "Date of Birth",         type: "date",     span: 1 },
          { id: "ci_age",   label: "Age",                   type: "number",   span: 1 },
          { id: "ci_sex",   label: "Sex",                   type: "dropdown", span: 1, options: ["Male","Female","Non-Binary","Unknown"] },
          { id: "ci_aka",   label: "A.K.A. / Former Alias", type: "text",     span: 4 },
          { id: "ci_res",   label: "Residence",             type: "text",     span: 2 },
          { id: "ci_zip",   label: "Zip Code",              type: "text",     span: 1 },
          { id: "ci_occ",   label: "Occupation",            type: "text",     span: 1 },
          { id: "ci_ht",    label: "Height",                type: "text",     span: 1 },
          { id: "ci_wt",    label: "Weight",                type: "text",     span: 1 },
          { id: "ci_skin",  label: "Skin Tone",             type: "dropdown", span: 1, options: ["Light","Fair","Tan","Medium","Olive","Brown","Dark","Black","Other"] },
          { id: "ci_hair",  label: "Hair Color",            type: "dropdown", span: 1, options: ["Black","Brown","Dark Brown","Blonde","Red","Auburn","Gray","White","Bald","Other"] },
          { id: "ci_eye",   label: "Eye Color",             type: "dropdown", span: 1, options: ["Brown","Blue","Green","Hazel","Gray","Black","Other"] },
          { id: "ci_ec",    label: "Emergency Contact",     type: "text",     span: 1 },
          { id: "ci_rel",   label: "Relationship",          type: "text",     span: 1 },
          { id: "ci_phone", label: "Contact Number",        type: "text",     span: 1 },
        ],
      },
      {
        id: "sVeh", title: "Vehicle Information", style: "dark", lookup: "vehicle",
        fields: [
          { id: "vi_type",  label: "Vehicle Type",  type: "dropdown", span: 2, options: ["Sedan","SUV","Truck","Van","Motorcycle","Coupe","Convertible","Hatchback","Bus","Other"] },
          { id: "vi_plate", label: "License Plate", type: "text",     span: 2, mono: true },
          { id: "vi_make",  label: "Make",          type: "text",     span: 1 },
          { id: "vi_model", label: "Model",         type: "text",     span: 1 },
          { id: "vi_color", label: "Color",         type: "dropdown", span: 1, options: ["Black","White","Silver","Gray","Red","Blue","Green","Yellow","Orange","Brown","Tan","Purple","Other"] },
          { id: "vi_year",  label: "Year",          type: "number",   span: 1 },
        ],
      },
      {
        id: "s2", title: "Stop Details", style: "gray",
        fields: [
          { id: "f6", label: "Reason for Stop",            type: "dropdown", span: 4, required: true, options: ["Speeding","Red Light Violation","Equipment Violation","Expired Registration","Erratic Driving","Other"] },
          { id: "f9", label: "Outcome",                    type: "dropdown", span: 4, required: true, options: ["Warning","Citation","Arrest","No Action"] },
          { id: "f7", label: "DL Checked",                 type: "checkbox", span: 2 },
          { id: "f8", label: "Sobriety Test Administered", type: "checkbox", span: 2 },
        ],
      },
      {
        id: "s2b", title: "Charges / Violations", style: "gray",
        fields: [
          { id: "f11", label: "Charges", type: "charges", span: 4 },
        ],
      },
      {
        id: "s3", title: "Narrative", style: "gray",
        fields: [
          { id: "f10", label: "Narrative", type: "textarea", span: 4, required: true, minRows: 5 },
        ],
      },
      {
        id: "sReview", title: "Report Review", style: "gray", supervisorOnly: true,
        fields: [
          { id: "rv_status",  label: "Status",               type: "dropdown", span: 1, supervisorOnly: true, options: ["Pending Review","Approved","Rejected","Pending Changes"] },
          { id: "rv_obs",     label: "Observing Officer",    type: "text",     span: 2 },
          { id: "rv_date",    label: "Review Date",          type: "date",     span: 1, supervisorOnly: true },
          { id: "rv_sig",     label: "Supervisor Signature", type: "text",     span: 4, supervisorOnly: true },
        ],
      },
    ],
  },
  {
    id: 2, name: "Use of Force",
    agency: "TAMPA POLICE DEPARTMENT",
    formCode: "TPD-UOF-001",
    signatureSlots: ["Officer Signature / Badge #", "Supervisor Signature / Badge #", "Review Date"],
    sections: [
      {
        id: "s1", title: "Incident Information", style: "blue",
        fields: [
          { id: "f1", label: "Date / Time",    type: "datetime",     span: 2, required: true },
          { id: "f4", label: "Location",       type: "text",         span: 3, required: true },
          { id: "f2", label: "Officer Badge #", type: "badge_lookup", span: 1, required: true, mono: true },
        ],
      },
      {
        id: "sCiv", title: "Civilian Information", style: "dark", lookup: "civilian",
        fields: [
          { id: "ci_first", label: "First Name",            type: "text",     span: 2, required: true },
          { id: "ci_last",  label: "Last Name",             type: "text",     span: 2 },
          { id: "ci_mi",    label: "M.I.",                  type: "text",     span: 1 },
          { id: "ci_dob",   label: "Date of Birth",         type: "date",     span: 1 },
          { id: "ci_age",   label: "Age",                   type: "number",   span: 1 },
          { id: "ci_sex",   label: "Sex",                   type: "dropdown", span: 1, options: ["Male","Female","Non-Binary","Unknown"] },
          { id: "ci_aka",   label: "A.K.A. / Former Alias", type: "text",     span: 4 },
          { id: "ci_res",   label: "Residence",             type: "text",     span: 2 },
          { id: "ci_zip",   label: "Zip Code",              type: "text",     span: 1 },
          { id: "ci_occ",   label: "Occupation",            type: "text",     span: 1 },
          { id: "ci_ht",    label: "Height",                type: "text",     span: 1 },
          { id: "ci_wt",    label: "Weight",                type: "text",     span: 1 },
          { id: "ci_skin",  label: "Skin Tone",             type: "dropdown", span: 1, options: ["Light","Fair","Tan","Medium","Olive","Brown","Dark","Black","Other"] },
          { id: "ci_hair",  label: "Hair Color",            type: "dropdown", span: 1, options: ["Black","Brown","Dark Brown","Blonde","Red","Auburn","Gray","White","Bald","Other"] },
          { id: "ci_eye",   label: "Eye Color",             type: "dropdown", span: 1, options: ["Brown","Blue","Green","Hazel","Gray","Black","Other"] },
          { id: "ci_ec",    label: "Emergency Contact",     type: "text",     span: 1 },
          { id: "ci_rel",   label: "Relationship",          type: "text",     span: 1 },
          { id: "ci_phone", label: "Contact Number",        type: "text",     span: 1 },
        ],
      },
      {
        id: "s2", title: "Force Used", style: "gray",
        fields: [
          { id: "f5", label: "Type of Force",   type: "dropdown", span: 4, required: true, options: ["Verbal Commands","Soft Empty Hand","Hard Empty Hand","OC Spray","Taser","Impact Weapon","K9","Firearm"] },
          { id: "f7", label: "Subject Injured", type: "checkbox", span: 1 },
          { id: "f8", label: "Officer Injured", type: "checkbox", span: 1 },
          { id: "f9", label: "EMS Called",      type: "checkbox", span: 1 },
        ],
      },
      {
        id: "s3", title: "Reason for Use of Force", style: "gray",
        fields: [
          { id: "f6", label: "Reason for Use of Force", type: "textarea", span: 4, required: true, minRows: 3 },
        ],
      },
      {
        id: "s4", title: "Full Narrative", style: "gray",
        fields: [
          { id: "f10", label: "Full Narrative", type: "textarea", span: 4, required: true, minRows: 5 },
        ],
      },
      {
        id: "sReview", title: "Report Review", style: "gray", supervisorOnly: true,
        fields: [
          { id: "rv_status",  label: "Status",               type: "dropdown", span: 1, supervisorOnly: true, options: ["Pending Review","Approved","Rejected","Pending Changes"] },
          { id: "rv_obs",     label: "Observing Officer",    type: "text",     span: 2 },
          { id: "rv_date",    label: "Review Date",          type: "date",     span: 1, supervisorOnly: true },
          { id: "rv_sig",     label: "Supervisor Signature", type: "text",     span: 4, supervisorOnly: true },
        ],
      },
    ],
  },
  {
    id: 3, name: "Arrest Report",
    agency: "TAMPA POLICE DEPARTMENT",
    formCode: "TPD-AR-001",
    signatureSlots: ["Arresting Officer / Badge #", "Supervisor / Badge #", "Booking Officer / Date"],
    sections: [
      {
        id: "s1", title: "Arrest Information", style: "blue",
        fields: [
          { id: "f1", label: "Date / Time of Arrest",   type: "datetime",     span: 2, required: true },
          { id: "f4", label: "Location of Arrest",      type: "text",         span: 3, required: true },
          { id: "f2", label: "Arresting Officer Badge", type: "badge_lookup", span: 1, required: true, mono: true },
        ],
      },
      {
        id: "sCiv", title: "Civilian Information", style: "dark", lookup: "civilian",
        fields: [
          { id: "ci_first", label: "First Name",            type: "text",     span: 2, required: true },
          { id: "ci_last",  label: "Last Name",             type: "text",     span: 2 },
          { id: "ci_mi",    label: "M.I.",                  type: "text",     span: 1 },
          { id: "ci_dob",   label: "Date of Birth",         type: "date",     span: 1 },
          { id: "ci_age",   label: "Age",                   type: "number",   span: 1 },
          { id: "ci_sex",   label: "Sex",                   type: "dropdown", span: 1, options: ["Male","Female","Non-Binary","Unknown"] },
          { id: "ci_aka",   label: "A.K.A. / Former Alias", type: "text",     span: 4 },
          { id: "ci_res",   label: "Residence",             type: "text",     span: 2 },
          { id: "ci_zip",   label: "Zip Code",              type: "text",     span: 1 },
          { id: "ci_occ",   label: "Occupation",            type: "text",     span: 1 },
          { id: "ci_ht",    label: "Height",                type: "text",     span: 1 },
          { id: "ci_wt",    label: "Weight",                type: "text",     span: 1 },
          { id: "ci_skin",  label: "Skin Tone",             type: "dropdown", span: 1, options: ["Light","Fair","Tan","Medium","Olive","Brown","Dark","Black","Other"] },
          { id: "ci_hair",  label: "Hair Color",            type: "dropdown", span: 1, options: ["Black","Brown","Dark Brown","Blonde","Red","Auburn","Gray","White","Bald","Other"] },
          { id: "ci_eye",   label: "Eye Color",             type: "dropdown", span: 1, options: ["Brown","Blue","Green","Hazel","Gray","Black","Other"] },
          { id: "ci_ec",    label: "Emergency Contact",     type: "text",     span: 1 },
          { id: "ci_rel",   label: "Relationship",          type: "text",     span: 1 },
          { id: "ci_phone", label: "Contact Number",        type: "text",     span: 1 },
        ],
      },
      {
        id: "sVeh", title: "Vehicle Information", style: "dark", lookup: "vehicle",
        fields: [
          { id: "vi_type",  label: "Vehicle Type",  type: "dropdown", span: 2, options: ["Sedan","SUV","Truck","Van","Motorcycle","Coupe","Convertible","Hatchback","Bus","Other"] },
          { id: "vi_plate", label: "License Plate", type: "text",     span: 2, mono: true },
          { id: "vi_make",  label: "Make",          type: "text",     span: 1 },
          { id: "vi_model", label: "Model",         type: "text",     span: 1 },
          { id: "vi_color", label: "Color",         type: "dropdown", span: 1, options: ["Black","White","Silver","Gray","Red","Blue","Green","Yellow","Orange","Brown","Tan","Purple","Other"] },
          { id: "vi_year",  label: "Year",          type: "number",   span: 1 },
        ],
      },
      {
        id: "s2", title: "Booking Information", style: "gray",
        fields: [
          { id: "f6", label: "Bail Set ($)", type: "text", span: 4, mono: true },
        ],
      },
      {
        id: "s3", title: "Charges", style: "gray",
        fields: [
          { id: "f5", label: "Charges", type: "charges", span: 4, required: true },
        ],
      },
      {
        id: "s4", title: "Evidence / Seizures", style: "gray",
        fields: [
          { id: "f7", label: "Weapons Seized",     type: "checkbox", span: 2 },
          { id: "f8", label: "Drugs Seized",       type: "checkbox", span: 2 },
          { id: "f9", label: "Evidence Collected", type: "textarea", span: 4, minRows: 2 },
        ],
      },
      {
        id: "sAddl", title: "Additional Information", style: "gray",
        fields: [
          { id: "ad_weapons",  label: "Weapon(s)",            type: "text",     span: 2 },
          { id: "ad_arrtype",  label: "Arrest Type",          type: "dropdown", span: 1, options: ["On-View","Warrant","Probable Cause","Probation/Parole Violation"] },
          { id: "ad_proboff",  label: "Probationary Officer", type: "text",     span: 1 },
        ],
      },
      {
        id: "s5", title: "Arrest Narrative", style: "gray",
        fields: [
          { id: "f10", label: "Narrative", type: "textarea", span: 4, required: true, minRows: 5 },
        ],
      },
      {
        id: "sReview", title: "Report Review", style: "gray", supervisorOnly: true,
        fields: [
          { id: "rv_status",  label: "Status",               type: "dropdown", span: 1, supervisorOnly: true, options: ["Pending Review","Approved","Rejected","Pending Changes"] },
          { id: "rv_obs",     label: "Observing Officer",    type: "text",     span: 2 },
          { id: "rv_date",    label: "Review Date",          type: "date",     span: 1, supervisorOnly: true },
          { id: "rv_sig",     label: "Supervisor Signature", type: "text",     span: 4, supervisorOnly: true },
        ],
      },
    ],
  },
  {
    id: 4, name: "Incident Report",
    agency: "HCSO LAW ENFORCEMENT",
    formCode: "HCSO-IR-001",
    signatureSlots: ["Reporting Officer / Badge #", "Supervisor Signature", "Date"],
    sections: [
      {
        id: "s1", title: "Incident Information", style: "blue",
        fields: [
          { id: "f1", label: "Date / Time",             type: "datetime",     span: 2, required: true },
          { id: "f4", label: "Location",                type: "text",         span: 3, required: true },
          { id: "f2", label: "Reporting Officer Badge", type: "badge_lookup", span: 1, required: true, mono: true },
          { id: "f3", label: "Incident Type",           type: "dropdown",     span: 4, required: true, options: ["MVA","Property Damage","Theft","Vandalism","Disturbance","Other"] },
        ],
      },
      {
        id: "sCiv", title: "Civilian Information", style: "dark", lookup: "civilian",
        fields: [
          { id: "ci_first", label: "First Name",            type: "text",     span: 2, required: true },
          { id: "ci_last",  label: "Last Name",             type: "text",     span: 2 },
          { id: "ci_mi",    label: "M.I.",                  type: "text",     span: 1 },
          { id: "ci_dob",   label: "Date of Birth",         type: "date",     span: 1 },
          { id: "ci_age",   label: "Age",                   type: "number",   span: 1 },
          { id: "ci_sex",   label: "Sex",                   type: "dropdown", span: 1, options: ["Male","Female","Non-Binary","Unknown"] },
          { id: "ci_aka",   label: "A.K.A. / Former Alias", type: "text",     span: 4 },
          { id: "ci_res",   label: "Residence",             type: "text",     span: 2 },
          { id: "ci_zip",   label: "Zip Code",              type: "text",     span: 1 },
          { id: "ci_occ",   label: "Occupation",            type: "text",     span: 1 },
          { id: "ci_ht",    label: "Height",                type: "text",     span: 1 },
          { id: "ci_wt",    label: "Weight",                type: "text",     span: 1 },
          { id: "ci_skin",  label: "Skin Tone",             type: "dropdown", span: 1, options: ["Light","Fair","Tan","Medium","Olive","Brown","Dark","Black","Other"] },
          { id: "ci_hair",  label: "Hair Color",            type: "dropdown", span: 1, options: ["Black","Brown","Dark Brown","Blonde","Red","Auburn","Gray","White","Bald","Other"] },
          { id: "ci_eye",   label: "Eye Color",             type: "dropdown", span: 1, options: ["Brown","Blue","Green","Hazel","Gray","Black","Other"] },
          { id: "ci_ec",    label: "Emergency Contact",     type: "text",     span: 1 },
          { id: "ci_rel",   label: "Relationship",          type: "text",     span: 1 },
          { id: "ci_phone", label: "Contact Number",        type: "text",     span: 1 },
        ],
      },
      {
        id: "sVeh", title: "Vehicle Information", style: "dark", lookup: "vehicle",
        fields: [
          { id: "vi_type",  label: "Vehicle Type",  type: "dropdown", span: 2, options: ["Sedan","SUV","Truck","Van","Motorcycle","Coupe","Convertible","Hatchback","Bus","Other"] },
          { id: "vi_plate", label: "License Plate", type: "text",     span: 2, mono: true },
          { id: "vi_make",  label: "Make",          type: "text",     span: 1 },
          { id: "vi_model", label: "Model",         type: "text",     span: 1 },
          { id: "vi_color", label: "Color",         type: "dropdown", span: 1, options: ["Black","White","Silver","Gray","Red","Blue","Green","Yellow","Orange","Brown","Tan","Purple","Other"] },
          { id: "vi_year",  label: "Year",          type: "number",   span: 1 },
        ],
      },
      {
        id: "s2", title: "Conditions", style: "gray",
        fields: [
          { id: "f6", label: "Injuries Reported", type: "checkbox", span: 2 },
          { id: "f7", label: "Property Damage",   type: "checkbox", span: 2 },
        ],
      },
      {
        id: "s3", title: "Parties Involved", style: "gray",
        fields: [
          { id: "f5", label: "Parties Involved", type: "textarea", span: 4, minRows: 2 },
        ],
      },
      {
        id: "s4", title: "Narrative", style: "gray",
        fields: [
          { id: "f8", label: "Narrative", type: "textarea", span: 4, required: true, minRows: 5 },
        ],
      },
      {
        id: "sReview", title: "Report Review", style: "gray", supervisorOnly: true,
        fields: [
          { id: "rv_status",  label: "Status",               type: "dropdown", span: 1, supervisorOnly: true, options: ["Pending Review","Approved","Rejected","Pending Changes"] },
          { id: "rv_obs",     label: "Observing Officer",    type: "text",     span: 2 },
          { id: "rv_date",    label: "Review Date",          type: "date",     span: 1, supervisorOnly: true },
          { id: "rv_sig",     label: "Supervisor Signature", type: "text",     span: 4, supervisorOnly: true },
        ],
      },
    ],
  },
  {
    id: 5, name: "Field Interview",
    agency: "SSRP LAW ENFORCEMENT",
    formCode: "HCSO-FI-001",
    signatureSlots: ["Officer Signature / Badge #", "Date"],
    sections: [
      {
        id: "s1", title: "Contact Information", style: "blue",
        fields: [
          { id: "f1", label: "Date / Time",        type: "datetime",     span: 2, required: true },
          { id: "f4", label: "Location",           type: "text",         span: 3, required: true },
          { id: "f2", label: "Officer Badge #",    type: "badge_lookup", span: 1, required: true, mono: true },
          { id: "f7", label: "Associates Present", type: "text",         span: 4 },
        ],
      },
      {
        id: "sCiv", title: "Civilian Information", style: "dark", lookup: "civilian",
        fields: [
          { id: "ci_first", label: "First Name",            type: "text",     span: 2, required: true },
          { id: "ci_last",  label: "Last Name",             type: "text",     span: 2 },
          { id: "ci_mi",    label: "M.I.",                  type: "text",     span: 1 },
          { id: "ci_dob",   label: "Date of Birth",         type: "date",     span: 1 },
          { id: "ci_age",   label: "Age",                   type: "number",   span: 1 },
          { id: "ci_sex",   label: "Sex",                   type: "dropdown", span: 1, options: ["Male","Female","Non-Binary","Unknown"] },
          { id: "ci_aka",   label: "A.K.A. / Former Alias", type: "text",     span: 4 },
          { id: "ci_res",   label: "Residence",             type: "text",     span: 2 },
          { id: "ci_zip",   label: "Zip Code",              type: "text",     span: 1 },
          { id: "ci_occ",   label: "Occupation",            type: "text",     span: 1 },
          { id: "ci_ht",    label: "Height",                type: "text",     span: 1 },
          { id: "ci_wt",    label: "Weight",                type: "text",     span: 1 },
          { id: "ci_skin",  label: "Skin Tone",             type: "dropdown", span: 1, options: ["Light","Fair","Tan","Medium","Olive","Brown","Dark","Black","Other"] },
          { id: "ci_hair",  label: "Hair Color",            type: "dropdown", span: 1, options: ["Black","Brown","Dark Brown","Blonde","Red","Auburn","Gray","White","Bald","Other"] },
          { id: "ci_eye",   label: "Eye Color",             type: "dropdown", span: 1, options: ["Brown","Blue","Green","Hazel","Gray","Black","Other"] },
          { id: "ci_ec",    label: "Emergency Contact",     type: "text",     span: 1 },
          { id: "ci_rel",   label: "Relationship",          type: "text",     span: 1 },
          { id: "ci_phone", label: "Contact Number",        type: "text",     span: 1 },
        ],
      },
      {
        id: "s2", title: "Contact Details", style: "gray",
        fields: [
          { id: "f5", label: "Reason for Contact",  type: "textarea", span: 4, required: true, minRows: 2 },
          { id: "f6", label: "Subject Description", type: "textarea", span: 4, minRows: 2 },
        ],
      },
      {
        id: "s3", title: "Outcome", style: "gray",
        fields: [
          { id: "f8", label: "Outcome", type: "dropdown", span: 4, required: true, options: ["No Action","Warned","Cited","Arrested","Referred"] },
        ],
      },
      {
        id: "s4", title: "Notes", style: "gray",
        fields: [
          { id: "f9", label: "Additional Notes", type: "textarea", span: 4, minRows: 2 },
        ],
      },
      {
        id: "sReview", title: "Report Review", style: "gray", supervisorOnly: true,
        fields: [
          { id: "rv_status",  label: "Status",               type: "dropdown", span: 1, supervisorOnly: true, options: ["Pending Review","Approved","Rejected","Pending Changes"] },
          { id: "rv_obs",     label: "Observing Officer",    type: "text",     span: 2 },
          { id: "rv_date",    label: "Review Date",          type: "date",     span: 1, supervisorOnly: true },
          { id: "rv_sig",     label: "Supervisor Signature", type: "text",     span: 4, supervisorOnly: true },
        ],
      },
    ],
  },
  {
    id: 6, name: "Supplement Report",
    agency: "SSRP LAW ENFORCEMENT",
    formCode: "HCSO-SUPP-001",
    signatureSlots: ["Supplement Author / Badge #", "Supervisor Approval", "Date"],
    sections: [
      {
        id: "s1", title: "Supplement Reference", style: "blue",
        fields: [
          { id: "f1", label: "Original Case Number",  type: "text",         span: 3, required: true, mono: true },
          { id: "f2", label: "Date / Time",           type: "datetime",     span: 2 },
          { id: "f3", label: "Author Badge #",        type: "badge_lookup", span: 1, mono: true },
        ],
      },
      {
        id: "s2", title: "Supplement Narrative", style: "gray",
        fields: [
          { id: "f4", label: "Supplement Narrative", type: "textarea", span: 4, required: true, minRows: 6 },
        ],
      },
      {
        id: "s3", title: "New Evidence / Information", style: "gray",
        fields: [
          { id: "f5", label: "New Evidence", type: "textarea", span: 4, minRows: 3 },
        ],
      },
    ],
  },
];

export const BANNED_USERS = [
  { id: 1, name: "xX_GunRunner_Xx",  discordId: "111222333444", reason: "Mass RDM * killed 14 civilians in spawn area",                    issuedBy: "Admin Reeves", date: "2026-04-30", duration: "Permanent", status: "Active"  },
  { id: 2, name: "SpeedHack420",      discordId: "222333444555", reason: "Modding/hacking vehicle speed, evading RP consequences",          issuedBy: "Admin Santos", date: "2026-05-01", duration: "30 Days",  status: "Active"  },
  { id: 3, name: "ToxicPlayer99",     discordId: "333444555666", reason: "Verbal harassment of staff and community members",               issuedBy: "Admin Reeves", date: "2026-04-15", duration: "7 Days",   status: "Expired" },
];

export const AUDIT_LOG = [
  { id: 1, user: "Sgt. Reeves (TPD-831)",  action: "Created warrant for Darnell Washington",         timestamp: "2026-06-01 14:00", module: "Warrants" },
  { id: 2, user: "Ofc. Santos (TPD-819)",  action: "Created call 26-1042 (Traffic Stop)",            timestamp: "2026-06-01 14:22", module: "Dispatch" },
  { id: 3, user: "Admin Mercer (ECC-1)",   action: "Banned user xX_GunRunner_Xx (Permanent)",        timestamp: "2026-04-30 21:14", module: "Admin"    },
  { id: 4, user: "Sgt. Reeves (TPD-831)",  action: "Approved report TPD-2026-0401",                  timestamp: "2026-04-02 09:30", module: "Reports"  },
  { id: 5, user: "Cpl. Walsh (TPD-807)",   action: "Status changed to AVAILABLE",                    timestamp: "2026-06-01 14:05", module: "CAD"      },
  { id: 6, user: "Det. Nair (TPD-839)",    action: "Ran plate lookup: SUS-1109",                     timestamp: "2026-06-01 14:18", module: "Returns"  },
  { id: 7, user: "System",                 action: "New user registered: Jessica Huang (Discord: 722516079)", timestamp: "2026-05-10 18:44", module: "Admin" },
];

export const MESSAGES = [
  { id: 1, from: "Dispatch (ECC-1)", to: "All Units",       subject: "BOLO * Black Dodge Charger",    body: "BOLO for black Dodge Charger plate SUS-1109. Owner has active warrant. Do not approach without backup. Last seen northbound US-41.",           timestamp: "2026-06-01 14:05", read: false, priority: "HIGH"   },
  { id: 2, from: "Sgt. Reeves (TPD-831)", to: "All TPD Units", subject: "Briefing Update",           body: "All patrol units: increased gang activity in Riverside district. Exercise caution. Extra patrol ordered for evening shift.",                   timestamp: "2026-06-01 13:00", read: true,  priority: "NORMAL" },
  { id: 3, from: "Lt. Commander",     to: "Supervisors",    subject: "Use of Force Policy Update",   body: "New UOF reporting requirements effective Monday. All use of force incidents require supervisor review within 24 hours. See department portal.", timestamp: "2026-05-31 09:15", read: true,  priority: "NORMAL" },
];

export const CUSTOM_RECORD_TYPES = [
  {
    id: 1, name: "Gang File",
    fields: [
      { id: "f1", label: "Subject Name",      type: "civilian_lookup", required: true  },
      { id: "f2", label: "Known Aliases",     type: "text",            required: false },
      { id: "f3", label: "Gang Affiliation",  type: "text",            required: true  },
      { id: "f4", label: "Known Associates",  type: "textarea",        required: false },
      { id: "f5", label: "Territory",         type: "text",            required: false },
      { id: "f6", label: "Notes",             type: "textarea",        required: false },
    ]
  },
  {
    id: 2, name: "Firearm Registration",
    fields: [
      { id: "f1", label: "Owner",              type: "civilian_lookup", required: true  },
      { id: "f2", label: "Make",               type: "text",            required: true  },
      { id: "f3", label: "Model",              type: "text",            required: true  },
      { id: "f4", label: "Serial Number",      type: "text",            required: true  },
      { id: "f5", label: "Caliber",            type: "text",            required: true  },
      { id: "f6", label: "Registration Date",  type: "date",            required: true  },
      { id: "f7", label: "Stolen?",            type: "checkbox",        required: false },
    ]
  },
];

export const TOW_LOGS = [
  { id: 1, plate: "SUS-1109", make: "Dodge", model: "Charger",   towedBy: "Ofc. Santos (TPD-819)", reason: "Evidence Hold * Active Warrant",            location: "TPD Impound Lot A",  date: "2026-05-10", releaseStatus: "Hold"     },
  { id: 2, plate: "GRN-5543", make: "Honda", model: "Civic",     towedBy: "Cpl. Walsh (TPD-807)",  reason: "Expired Registration * Roadway Obstruction", location: "City Impound Lot",   date: "2026-04-22", releaseStatus: "Released" },
];

export const ACTIVE_SESSIONS = [
  { userId: 1,  name: "James Reeves",   role: "Admin",    loginTime: "2026-06-01 13:45", lastActive: "2026-06-01 14:55", ip: "10.0.0.12" },
  { userId: 2,  name: "Maria Santos",   role: "User",     loginTime: "2026-06-01 14:00", lastActive: "2026-06-01 14:54", ip: "10.0.0.34" },
  { userId: 8,  name: "Lisa Park",      role: "User",     loginTime: "2026-06-01 14:10", lastActive: "2026-06-01 14:50", ip: "10.0.0.56" },
  { userId: 14, name: "Dana Mercer",    role: "Dispatch", loginTime: "2026-06-01 13:30", lastActive: "2026-06-01 15:05", ip: "10.0.0.10" },
];

export const WHITELIST_APPS = [
  { id: 1, discordId: "998877665544", name: "NewPlayer_Johnny",  appliedDate: "2026-05-30", status: "Pending",  notes: "Applied via website"          },
  { id: 2, discordId: "887766554433", name: "RPFan2023",         appliedDate: "2026-05-29", status: "Pending",  notes: "Referred by Sgt. Reeves"     },
  { id: 3, discordId: "776655443322", name: "OfficerHopeful",    appliedDate: "2026-05-28", status: "Approved", notes: ""                             },
];

/* ─── Businesses (citizen Business portal) ─── */
export const BUSINESSES = [
  {
    id: 1, name: "Bayshore Auto & Towing", type: "Automotive / Towing",
    owner: "Jordan Maxwell", ownerDiscordId: "205947291", ein: "FL-88-2210445", phone: "555-0710",
    address: "412 Industrial Pkwy, Tampa", status: "ACTIVE",
    isTowCompany: true,
    fleet: [
      { id: 1, name: 'T1 — Light Duty',  spawnCode: 'towtruck',  type: 'Light Duty'  },
      { id: 2, name: 'T2 — Medium Duty', spawnCode: 'towtruck2', type: 'Medium Duty' },
      { id: 3, name: 'T3 — Flatbed',     spawnCode: 'flatbed',   type: 'Flatbed'     },
    ],
    license: "BL-2026-0445", licenseExpiry: "2026-12-31", ownedByPlayer: true,
    employees: [
      { id: 1, name: "Michael Torres", discordId: "419283746", roles: ["Manager", "Driver"],    phone: "555-0192", since: "2024-02-01" },
      { id: 2, name: "Amanda Chen",    discordId: "309182746", roles: ["Dispatcher"],             phone: "555-0334", since: "2025-01-15" },
      { id: 3, name: "Luis Romero",    discordId: "",          roles: ["Driver"],                 phone: "555-0911", since: "2025-06-20" },
    ],
  },
  {
    id: 2, name: "FDOT Tow Operations", type: "Government / Towing",
    owner: "State of Florida – FDOT District 7", ownerDiscordId: "100200305", ein: "FL-GOV-FDOT-TOW-7", phone: "800-511-0000",
    address: "FDOT District 7 HQ, 11201 N Malcolm McKinley Dr, Tampa", status: "ACTIVE",
    isTowCompany: true, isFDOT: true,
    fleet: [
      { id: 1, name: 'FDOT-T1 — Heavy Rotator', spawnCode: 'rotator',   type: 'Heavy Duty'  },
      { id: 2, name: 'FDOT-T2 — Medium Duty',   spawnCode: 'towtruck2', type: 'Medium Duty' },
    ],
    license: "GOV-FDOT-D7-2026", licenseExpiry: "2026-12-31", ownedByPlayer: true,
    employees: [
      { id: 1, name: "Ray Calhoun",    discordId: "100200305", roles: ["Inspector", "Supervisor"], phone: "813-975-6200", since: "2022-01-01" },
      { id: 2, name: "Jordan Maxwell", discordId: "205947291", roles: ["Supervisor", "Dispatcher"], phone: "555-0192",    since: "2024-06-01" },
    ],
  },
];

export const RECORD_TEMPLATES = [
  {
    id: 'r1', name: 'Hunting License',
    agency: 'FLORIDA FISH AND WILDLIFE CONSERVATION COMMISSION',
    formCode: 'FWC-HL-001',
    sections: [
      { id: 's1', title: 'License Holder', style: 'blue', fields: [
        { id: 'f1', label: 'Full Name',       type: 'civilian_lookup', span: 3, required: true },
        { id: 'f2', label: 'Date of Birth',   type: 'date',            span: 1, required: true },
        { id: 'f3', label: 'License Number',  type: 'text',            span: 2, mono: true, required: true },
        { id: 'f4', label: 'Issue Date',      type: 'date',            span: 1, required: true },
        { id: 'f5', label: 'Expiry Date',     type: 'date',            span: 1, required: true },
      ]},
      { id: 's2', title: 'License Details', style: 'gray', fields: [
        { id: 'f6', label: 'License Type',     type: 'dropdown', span: 2, options: ['Resident Annual','Non-Resident Annual','Resident 5-Day','Youth'] },
        { id: 'f7', label: 'Issuing Officer',  type: 'badge_lookup', span: 2 },
      ]},
    ],
  },
  {
    id: 'r2', name: 'Fishing License',
    agency: 'FLORIDA FISH AND WILDLIFE CONSERVATION COMMISSION',
    formCode: 'FWC-FL-001',
    sections: [
      { id: 's1', title: 'License Holder', style: 'blue', fields: [
        { id: 'f1', label: 'Full Name',       type: 'civilian_lookup', span: 3, required: true },
        { id: 'f2', label: 'Date of Birth',   type: 'date',            span: 1, required: true },
        { id: 'f3', label: 'License Number',  type: 'text',            span: 2, mono: true, required: true },
        { id: 'f4', label: 'Issue Date',      type: 'date',            span: 1, required: true },
        { id: 'f5', label: 'Expiry Date',     type: 'date',            span: 1, required: true },
      ]},
      { id: 's2', title: 'License Details', style: 'gray', fields: [
        { id: 'f6', label: 'License Type',    type: 'dropdown', span: 2, options: ['Freshwater','Saltwater','Combined','Youth'] },
        { id: 'f7', label: 'Issuing Officer', type: 'badge_lookup', span: 2 },
      ]},
    ],
  },
  {
    id: 'r3', name: 'Trespass Notice',
    agency: 'SSRP LAW ENFORCEMENTg',
    formCode: 'HCLE-TN-001',
    sections: [
      { id: 's1', title: 'Subject Information', style: 'blue', fields: [
        { id: 'f1', label: 'Subject Name',    type: 'civilian_lookup', span: 3, required: true },
        { id: 'f2', label: 'Date of Birth',   type: 'date',            span: 1, required: true },
        { id: 'f3', label: 'Notice Number',   type: 'text',            span: 2, mono: true },
        { id: 'f4', label: 'Issue Date',      type: 'date',            span: 2, required: true },
      ]},
      { id: 's2', title: 'Trespass Details', style: 'gray', fields: [
        { id: 'f5', label: 'Property Address',          type: 'text',     span: 4, required: true },
        { id: 'f6', label: 'Property Owner / Business', type: 'text',     span: 2 },
        { id: 'f7', label: 'Duration',                  type: 'dropdown', span: 2, options: ['1 Year','2 Years','5 Years','Permanent'] },
      ]},
      { id: 's3', title: 'Reason', style: 'gray', fields: [
        { id: 'f8', label: 'Reason for Trespass', type: 'textarea', span: 4, required: true, minRows: 3 },
      ]},
      { id: 's4', title: 'Issuing Officer', style: 'gray', fields: [
        { id: 'f9', label: 'Officer Badge #', type: 'badge_lookup', span: 2 },
      ]},
    ],
  },
  {
    id: 'r4', name: 'CCW Permit',
    agency: 'FLORIDA DEPARTMENT OF AGRICULTURE AND CONSUMER SERVICES',
    formCode: 'FDACS-CCW-001',
    sections: [
      { id: 's1', title: 'Permit Holder', style: 'blue', fields: [
        { id: 'f1', label: 'Full Name',       type: 'civilian_lookup', span: 3, required: true },
        { id: 'f2', label: 'Date of Birth',   type: 'date',            span: 1, required: true },
        { id: 'f3', label: 'Permit Number',   type: 'text',            span: 2, mono: true, required: true },
        { id: 'f4', label: 'Issue Date',      type: 'date',            span: 1, required: true },
        { id: 'f5', label: 'Expiry Date',     type: 'date',            span: 1, required: true },
      ]},
      { id: 's2', title: 'Restrictions', style: 'gray', fields: [
        { id: 'f6', label: 'Restrictions', type: 'textarea', span: 4, minRows: 2 },
      ]},
    ],
  },
  {
    id: 'r5', name: 'Warrant',
    agency: 'SUNSHINE STATE CIRCUIT COURT',
    formCode: 'HCCC-WR-001',
    sections: [
      { id: 's1', title: 'Warrant Information', style: 'blue', fields: [
        { id: 'f1', label: 'Subject Name',   type: 'civilian_lookup', span: 3, required: true },
        { id: 'f2', label: 'Warrant #',      type: 'text',            span: 1, mono: true },
        { id: 'f3', label: 'Warrant Type',   type: 'dropdown',        span: 2, required: true, options: ['Arrest Warrant','Bench Warrant','Search Warrant','Civil Warrant'] },
        { id: 'f4', label: 'Issue Date',     type: 'date',            span: 1, required: true },
        { id: 'f5', label: 'Issued By',      type: 'text',            span: 1, required: true },
      ]},
      { id: 's2', title: 'Charges', style: 'gray', fields: [
        { id: 'f6', label: 'Charges / Statutes', type: 'textarea', span: 4, required: true, minRows: 3 },
      ]},
      { id: 's3', title: 'Notes', style: 'gray', fields: [
        { id: 'f7', label: 'Additional Notes', type: 'textarea', span: 4, minRows: 2 },
      ]},
    ],
  },
  {
    id: 'r6', name: 'Florida Traffic Citation',
    agency: 'SSRP LAW ENFORCEMENTg',
    formCode: 'FL-UFTC-001',
    sections: [
      { id: 's1', title: 'Citation Information', style: 'blue', fields: [
        { id: 'f1', label: 'Citation #',      type: 'text',            span: 1, mono: true, required: true },
        { id: 'f2', label: 'Date / Time',     type: 'datetime',        span: 2, required: true },
        { id: 'f3', label: 'Officer Badge #', type: 'badge_lookup',    span: 1 },
      ]},
      { id: 's2', title: 'Driver Information', style: 'gray', fields: [
        { id: 'f4', label: 'Driver Name',       type: 'civilian_lookup', span: 3, required: true },
        { id: 'f5', label: 'DL Number',         type: 'text',            span: 1, mono: true },
        { id: 'f6', label: 'Vehicle Plate',     type: 'text',            span: 2, mono: true, required: true },
        { id: 'f7', label: 'Location / Street', type: 'text',            span: 2, required: true },
      ]},
      { id: 's3', title: 'Violation', style: 'gray', fields: [
        { id: 'f8', label: 'Violation / Statute', type: 'text', span: 3, required: true },
        { id: 'f9', label: 'Fine Amount ($)',      type: 'text', span: 1, mono: true },
      ]},
    ],
  },
  {
    id: 'r7', name: 'Firearm Registration',
    agency: 'HILLSBOROUGH COUNTY SHERIFF\'S OFFICE',
    formCode: 'HCSO-FR-001',
    sections: [
      { id: 's1', title: 'Owner Information', style: 'blue', fields: [
        { id: 'f1', label: 'Owner Name',    type: 'civilian_lookup', span: 3, required: true },
        { id: 'f2', label: 'Date of Birth', type: 'date',            span: 1, required: true },
      ]},
      { id: 's2', title: 'Firearm Details', style: 'gray', fields: [
        { id: 'f3', label: 'Make',          type: 'text', span: 2, required: true },
        { id: 'f4', label: 'Model',         type: 'text', span: 2, required: true },
        { id: 'f5', label: 'Serial Number', type: 'text', span: 2, mono: true, required: true },
        { id: 'f6', label: 'Caliber',       type: 'text', span: 2, required: true },
        { id: 'f7', label: 'Stolen',        type: 'checkbox', span: 1 },
        { id: 'f8', label: 'Reg Date',      type: 'date', span: 1 },
      ]},
    ],
  },
  {
    id: 'r8', name: 'License Suspension',
    agency: 'FLORIDA DEPARTMENT OF HIGHWAY SAFETY AND MOTOR VEHICLES',
    formCode: 'DHSMV-LS-001',
    sections: [
      { id: 's1', title: 'Subject Information', style: 'blue', fields: [
        { id: 'f1', label: 'Full Name',      type: 'civilian_lookup', span: 3, required: true },
        { id: 'f2', label: 'DL Number',      type: 'text',            span: 1, mono: true, required: true },
        { id: 'f3', label: 'Suspension #',   type: 'text',            span: 2, mono: true },
        { id: 'f4', label: 'Effective Date', type: 'date',            span: 1, required: true },
        { id: 'f5', label: 'End Date',       type: 'date',            span: 1 },
      ]},
      { id: 's2', title: 'Suspension Details', style: 'gray', fields: [
        { id: 'f6', label: 'Suspension Type',   type: 'dropdown', span: 2, required: true, options: ['DUI','Habitual Offender','Failure to Pay Fines','Medical','Other'] },
        { id: 'f7', label: 'Issuing Authority', type: 'text',     span: 2 },
        { id: 'f8', label: 'Notes',             type: 'textarea', span: 4, minRows: 2 },
      ]},
    ],
  },
];

export const INCOMING_911 = [
  { id: 'inc_001', caller: 'Carlos Rivera',  callbackNumber: '555-0912', message: 'My neighbor is screaming and I hear things being thrown. Please send someone quick.',   location: '218 Magnolia Ave, Tampa',          receivedAt: Date.now() - 145000, priority: 1 },
  { id: 'inc_002', caller: 'Anonymous',      callbackNumber: null,       message: 'Two guys in hoodies are breaking into a car on Dale Mabry. Black sedan.',              location: 'Dale Mabry Hwy / Hillsborough Ave', receivedAt: Date.now() - 62000,  priority: 2 },
  { id: 'inc_003', caller: 'Beth Nguyen',    callbackNumber: '555-0443', message: 'My mother collapsed and is not breathing. We need an ambulance right now, please.',    location: '7714 Sunset Blvd Apt 2, Tampa',    receivedAt: Date.now() - 18000,  priority: 1 },
];

export const UNIT_GROUPS = [
  { id: 'grp_001', name: 'Alpha Patrol',  color: '#3a88e8', units: ['TPD-831', 'TPD-807'] },
  { id: 'grp_002', name: 'Traffic Unit',  color: '#f59e0b', units: ['FHP-209', 'FHP-214'] },
];

/* ── Call Response Time Logs ──────────────────────────────────────────────
   Historical closed calls used by the Command Portal Response Times tab.
   assignedMin: minutes from call received to first unit assigned.
   onSceneMin:  minutes from call received to first unit on scene.
   Dates are computed at import time so "Today / 7 Days / 30 Days" filters
   always work relative to the actual session date.
*/
function _dAgo(n) { return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10); }

export const CALL_RESPONSE_LOGS = [
  // ── TODAY ──────────────────────────────────────────────────────────────
  { id: 'RL-001', date: _dAgo(0), nature: 'Traffic Stop',           category: 'police', respondingDept: 'TPD',  priority: 3, assignedMin: 3,  onSceneMin: 7  },
  { id: 'RL-002', date: _dAgo(0), nature: 'Disturbance',             category: 'police', respondingDept: 'TPD',  priority: 2, assignedMin: 5,  onSceneMin: 11 },
  { id: 'RL-003', date: _dAgo(0), nature: 'Domestic Disturbance',   category: 'police', respondingDept: 'HCSO', priority: 1, assignedMin: 4,  onSceneMin: 13 },
  { id: 'RL-004', date: _dAgo(0), nature: 'Medical - Chest Pain',   category: 'fire',   respondingDept: 'HCFR', priority: 1, assignedMin: 2,  onSceneMin: 6  },
  { id: 'RL-005', date: _dAgo(0), nature: 'MVA w/ Injuries',         category: 'fire',   respondingDept: 'HCFR', priority: 1, assignedMin: 3,  onSceneMin: 8  },
  { id: 'RL-006', date: _dAgo(0), nature: 'Traffic Stop',            category: 'police', respondingDept: 'FHP',  priority: 3, assignedMin: 3,  onSceneMin: 8  },

  // ── YESTERDAY ──────────────────────────────────────────────────────────
  { id: 'RL-007', date: _dAgo(1), nature: 'Robbery',                 category: 'police', respondingDept: 'TPD',  priority: 1, assignedMin: 4,  onSceneMin: 9  },
  { id: 'RL-008', date: _dAgo(1), nature: 'Noise Complaint',         category: 'police', respondingDept: 'TPD',  priority: 4, assignedMin: 7,  onSceneMin: 14 },
  { id: 'RL-009', date: _dAgo(1), nature: 'Theft - Shoplifting',     category: 'police', respondingDept: 'HCSO', priority: 3, assignedMin: 6,  onSceneMin: 15 },
  { id: 'RL-010', date: _dAgo(1), nature: 'Suspicious Vehicle',      category: 'police', respondingDept: 'HCSO', priority: 2, assignedMin: 5,  onSceneMin: 11 },
  { id: 'RL-011', date: _dAgo(1), nature: 'Structure Fire',          category: 'fire',   respondingDept: 'HCFR', priority: 1, assignedMin: 2,  onSceneMin: 7  },
  { id: 'RL-012', date: _dAgo(1), nature: 'Medical - Seizure',       category: 'fire',   respondingDept: 'HCFR', priority: 1, assignedMin: 2,  onSceneMin: 6  },
  { id: 'RL-013', date: _dAgo(1), nature: 'MVA No Injuries',         category: 'police', respondingDept: 'FHP',  priority: 3, assignedMin: 3,  onSceneMin: 9  },
  { id: 'RL-014', date: _dAgo(1), nature: 'Reckless Driver',         category: 'police', respondingDept: 'FHP',  priority: 2, assignedMin: 4,  onSceneMin: 11 },

  // ── LAST 7 DAYS ────────────────────────────────────────────────────────
  { id: 'RL-015', date: _dAgo(2), nature: 'Assault',                 category: 'police', respondingDept: 'TPD',  priority: 1, assignedMin: 4,  onSceneMin: 8  },
  { id: 'RL-016', date: _dAgo(2), nature: 'Traffic Stop',            category: 'police', respondingDept: 'TPD',  priority: 3, assignedMin: 3,  onSceneMin: 7  },
  { id: 'RL-017', date: _dAgo(3), nature: 'Burglary',                category: 'police', respondingDept: 'TPD',  priority: 1, assignedMin: 5,  onSceneMin: 11 },
  { id: 'RL-018', date: _dAgo(3), nature: 'Warrant Service',         category: 'police', respondingDept: 'HCSO', priority: 2, assignedMin: 6,  onSceneMin: 14 },
  { id: 'RL-019', date: _dAgo(4), nature: 'DUI',                     category: 'police', respondingDept: 'HCSO', priority: 2, assignedMin: 5,  onSceneMin: 12 },
  { id: 'RL-020', date: _dAgo(4), nature: 'Brush Fire',              category: 'fire',   respondingDept: 'HCFR', priority: 2, assignedMin: 2,  onSceneMin: 9  },
  { id: 'RL-021', date: _dAgo(5), nature: 'Medical - Cardiac Arrest',category: 'fire',   respondingDept: 'HCFR', priority: 1, assignedMin: 2,  onSceneMin: 7  },
  { id: 'RL-022', date: _dAgo(5), nature: 'MVA Fatal',               category: 'fire',   respondingDept: 'FHP',  priority: 1, assignedMin: 3,  onSceneMin: 10 },
  { id: 'RL-023', date: _dAgo(6), nature: 'Vehicle Pursuit',         category: 'police', respondingDept: 'FHP',  priority: 1, assignedMin: 2,  onSceneMin: 6  },
  { id: 'RL-024', date: _dAgo(6), nature: 'Traffic Enforcement',     category: 'police', respondingDept: 'FHP',  priority: 3, assignedMin: 4,  onSceneMin: 9  },

  // ── LAST 30 DAYS ───────────────────────────────────────────────────────
  { id: 'RL-025', date: _dAgo(10), nature: 'Robbery',                category: 'police', respondingDept: 'TPD',  priority: 1, assignedMin: 5,  onSceneMin: 11 },
  { id: 'RL-026', date: _dAgo(12), nature: 'Domestic Violence',      category: 'police', respondingDept: 'HCSO', priority: 1, assignedMin: 7,  onSceneMin: 15 },
  { id: 'RL-027', date: _dAgo(14), nature: 'Structure Fire',         category: 'fire',   respondingDept: 'HCFR', priority: 1, assignedMin: 2,  onSceneMin: 8  },
  { id: 'RL-028', date: _dAgo(16), nature: 'MVA w/ Injuries',        category: 'fire',   respondingDept: 'FHP',  priority: 2, assignedMin: 3,  onSceneMin: 10 },
  { id: 'RL-029', date: _dAgo(18), nature: 'Theft - Grand',          category: 'police', respondingDept: 'TPD',  priority: 3, assignedMin: 4,  onSceneMin: 9  },
  { id: 'RL-030', date: _dAgo(20), nature: 'Drug Arrest',            category: 'police', respondingDept: 'HCSO', priority: 2, assignedMin: 6,  onSceneMin: 16 },
  { id: 'RL-031', date: _dAgo(22), nature: 'Medical - Overdose',     category: 'fire',   respondingDept: 'HCFR', priority: 1, assignedMin: 2,  onSceneMin: 5  },
  { id: 'RL-032', date: _dAgo(25), nature: 'Traffic Stop',           category: 'police', respondingDept: 'FHP',  priority: 3, assignedMin: 3,  onSceneMin: 7  },
  { id: 'RL-033', date: _dAgo(27), nature: 'Noise Complaint',        category: 'police', respondingDept: 'TPD',  priority: 4, assignedMin: 8,  onSceneMin: 16 },
  { id: 'RL-034', date: _dAgo(29), nature: 'Suspicious Person',      category: 'police', respondingDept: 'HCSO', priority: 3, assignedMin: 5,  onSceneMin: 13 },
];

