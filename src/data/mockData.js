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
  { id: 1, firstName: "Michael", lastName: "Torres", dob: "1988-03-14", gender: "Male", ethnicity: "Hispanic", height: "5'11\"", weight: "185 lbs", hair: "Black", eyes: "Brown", ssn: "412-88-3301", phone: "555-0192", address: "1204 Riverside Dr, Tampa", dlNumber: "T8821044", dlClass: "Class E", dlStatus: "ACTIVE", dlExpiry: "2026-03-14", dlEndorsements: ["Motorcycle"], vehicles: [1,2], flags: [], ownedByPlayer: true, weaponPermit: "ACTIVE", weaponPermitExpiry: "2026-08-01",
    medicalProfile: { bloodType: "O+", organDonor: true, dnr: false, conditions: ["Type 2 Diabetes"], allergies: [], medications: ["Metformin 500mg daily"], emergencyContact: { name: "Carmen Torres", phone: "555-0199", relationship: "Spouse" }, safetyNotes: "", notes: "" },
  },
  { id: 2, firstName: "Amanda", lastName: "Chen", dob: "1995-07-22", gender: "Female", ethnicity: "Asian", height: "5'4\"", weight: "125 lbs", hair: "Black", eyes: "Brown", ssn: "509-44-2210", phone: "555-0334", address: "88 Orchid Lane, Tampa", dlNumber: "C5543219", dlClass: "Class C", dlStatus: "ACTIVE", dlExpiry: "2025-07-22", vehicles: [3], flags: ["CAUTION"], ownedByPlayer: true, weaponPermit: "NONE", weaponPermitExpiry: "",
    medicalProfile: { bloodType: "A-", organDonor: false, dnr: false, conditions: ["Generalized Anxiety Disorder"], allergies: ["Penicillin"], medications: ["Escitalopram 10mg daily"], emergencyContact: { name: "David Chen", phone: "555-0335", relationship: "Father" }, safetyNotes: "Known anxiety episodes; may appear agitated or erratic under stress.", notes: "" },
  },
  { id: 3, firstName: "Darnell", lastName: "Washington", dob: "1979-11-05", gender: "Male", ethnicity: "Black", height: "6'1\"", weight: "210 lbs", hair: "Black", eyes: "Dark Brown", ssn: "618-77-9901", phone: "555-0441", address: "330 Magnolia Blvd, Tampa", dlNumber: "W1109872", dlClass: "Class C", dlStatus: "SUSPENDED", dlExpiry: "2024-11-05", vehicles: [4], flags: ["WARRANT","CAUTION"],
    medicalProfile: { bloodType: "B+", organDonor: false, dnr: false, conditions: ["Bipolar Disorder", "Substance Use Disorder (Cocaine)"], allergies: [], medications: ["Lithium 600mg daily"], emergencyContact: { name: "Donna Washington", phone: "555-0442", relationship: "Sister" }, safetyNotes: "History of combative behavior during manic episodes. Active cocaine dependency * may be under influence. Non-compliant with medication history.", notes: "" },
  },
  { id: 4, firstName: "Jessica", lastName: "Huang", dob: "2001-04-18", gender: "Female", ethnicity: "Asian", height: "5'2\"", weight: "115 lbs", hair: "Brown", eyes: "Brown", ssn: "723-11-4456", phone: "555-0557", address: "21 College Ave Apt 4B, Tampa", dlNumber: "H4456012", dlClass: "Class C", dlStatus: "ACTIVE", dlExpiry: "2027-04-18", vehicles: [], flags: [],
    medicalProfile: { bloodType: "AB+", organDonor: true, dnr: false, conditions: [], allergies: ["Shellfish", "Sulfa drugs"], medications: [], emergencyContact: { name: "Linda Huang", phone: "555-0558", relationship: "Mother" }, safetyNotes: "", notes: "" },
  },
  { id: 5, firstName: "Robert", lastName: "Marino", dob: "1965-09-30", gender: "Male", ethnicity: "White", height: "5'9\"", weight: "195 lbs", hair: "Gray", eyes: "Blue", ssn: "301-55-8812", phone: "555-0678", address: "5 Harbor View Ct, Tampa", dlNumber: "M8812345", dlClass: "Class A CDL", dlStatus: "ACTIVE", dlExpiry: "2025-09-30", dlEndorsements: ["Motorcycle","Boating"], vehicles: [5,6], flags: ["VIOLENT"],
    medicalProfile: { bloodType: "A+", organDonor: false, dnr: true, conditions: ["Congestive Heart Failure", "Atrial Fibrillation"], allergies: ["Warfarin", "NSAIDs"], medications: ["Apixaban 5mg twice daily", "Carvedilol 25mg daily", "Furosemide 40mg daily"], emergencyContact: { name: "Monica Marino", phone: "555-0679", relationship: "Spouse" }, safetyNotes: "History of violent assault resulting in felony conviction. May become physically aggressive when confronted.", notes: "DNR in effect * do not resuscitate. Contact emergency contact prior to any transport." },
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

/* ─── Shared option sets & "premade" section builders ───────────────────────
   These mirror the live Sonoran premade sections (Department Identification,
   Agency Information, Flags, Civilian, Vehicle, Charges) so every report and
   record reuses the same lookups, auto-fill and styling. */
const _SEX   = ['Male','Female','Non-Binary','Unknown'];
const _SKIN  = ['Light','Fair','Tan','Medium','Olive','Brown','Dark','Black','Other'];
const _HAIR  = ['Black','Brown','Dark Brown','Blonde','Red','Auburn','Gray','White','Bald','Other'];
const _EYE   = ['Brown','Blue','Green','Hazel','Gray','Black','Other'];
const _VTYPE = ['Sedan','SUV','Truck','Van','Motorcycle','Coupe','Convertible','Hatchback','Bus','Other'];
const _COLOR = ['Black','White','Silver','Gray','Red','Blue','Green','Yellow','Orange','Brown','Tan','Purple','Other'];
const _YESNO = ['Yes','No'];
const _DEPTS = ['Tampa Police Department',"Hillsborough County Sheriff's Office",'Florida Highway Patrol','Hillsborough County Fire Rescue','Florida Dept of Transportation'];
const _CITIES = ['Tampa','St. Petersburg','Clearwater','Brandon','Riverview','Plant City','Temple Terrace','Unincorporated'];
const _FORCE = ['N/A','Verbal Commands','Open Hand Strike','Soft Empty Hand Control','Hard Empty Hand Control','OC Spray','Taser','Baton / Impact Weapon','K9 Deployment','Firearm','Other'];

const _agencyInfo = () => ({
  id: 'sAI', title: 'Agency Information', style: 'gray', fields: [
    { id: 'ai_dt',  label: 'Date',        type: 'date', span: 1, autoFill: 'date' },
    { id: 'ai_tm',  label: 'Time',        type: 'time', span: 1, autoFill: 'time' },
    { id: 'ai_rn',  label: 'Record #',    type: 'text', span: 1, mono: true, autoNumber: true },
    { id: 'ai_ag',  label: 'Department',  type: 'text', span: 1, autoFill: 'agencyName', readOnly: true },
    { id: 'ai_sd',  label: 'Subdivision', type: 'text', span: 1, autoFill: 'subdivision', readOnly: true },
    { id: 'ai_un',  label: 'Unit #',      type: 'text', span: 1, autoFill: 'unitNumber',  readOnly: true },
    { id: 'ai_unm', label: 'Unit Name',   type: 'text', span: 2, autoFill: 'unitName',    readOnly: true },
  ],
});

const _deptId = () => ({
  id: 'sDept', title: 'Department Identification', style: 'gray', fields: [
    { id: 'dept_sel', label: 'Department', type: 'dropdown', span: 4, required: true, options: _DEPTS },
  ],
});

const _flags = (opts) => ({
  id: 'sFlags', title: 'Flags', style: 'gray',
  fields: (opts || ['Escape Risk','Armed','Dangerous','Felon']).map((o, i) => ({ id: `flag_${i}`, label: o, type: 'checkbox', span: 1 })),
});

const _civ = ({ id = 'sCiv', title = 'Civilian Information', p = 'ci', mugshot = false, reqName = true, pre = [] } = {}) => ({
  id, title, style: 'dark', lookup: 'civilian', fields: [
    ...(mugshot ? [{ id: `${p}_mug`, label: 'Mugshot', type: 'mugshot', span: 4 }] : []),
    ...pre,
    { id: `${p}_first`, label: 'First Name', type: 'text', span: 2, required: reqName },
    { id: `${p}_last`,  label: 'Last Name',  type: 'text', span: 2, required: reqName },
    { id: `${p}_mi`,    label: 'M.I.',       type: 'text', span: 1 },
    { id: `${p}_dob`,   label: 'Date of Birth', type: 'date', span: 1 },
    { id: `${p}_age`,   label: 'Age', type: 'number', span: 1 },
    { id: `${p}_sex`,   label: 'Sex', type: 'dropdown', span: 1, options: _SEX },
    { id: `${p}_aka`,   label: 'A.K.A. / Former Alias', type: 'text', span: 4 },
    { id: `${p}_res`,   label: 'Residence', type: 'text', span: 2 },
    { id: `${p}_zip`,   label: 'Zip Code', type: 'text', span: 1 },
    { id: `${p}_occ`,   label: 'Occupation', type: 'text', span: 1 },
    { id: `${p}_ht`,    label: 'Height', type: 'text', span: 1 },
    { id: `${p}_wt`,    label: 'Weight', type: 'text', span: 1 },
    { id: `${p}_skin`,  label: 'Skin Tone', type: 'dropdown', span: 1, options: _SKIN },
    { id: `${p}_hair`,  label: 'Hair Color', type: 'dropdown', span: 1, options: _HAIR },
    { id: `${p}_eye`,   label: 'Eye Color', type: 'dropdown', span: 1, options: _EYE },
    { id: `${p}_ec`,    label: 'Emergency Contact', type: 'text', span: 1 },
    { id: `${p}_rel`,   label: 'Relationship', type: 'text', span: 1 },
    { id: `${p}_phone`, label: 'Contact Number', type: 'text', span: 1 },
  ],
});

const _veh = ({ id = 'sVeh', title = 'Vehicle Information', p = 'vi', pre = [], post = [] } = {}) => ({
  id, title, style: 'dark', lookup: 'vehicle', fields: [
    ...pre,
    { id: `${p}_type`,  label: 'Vehicle Type', type: 'dropdown', span: 2, options: _VTYPE },
    { id: `${p}_plate`, label: 'License Plate', type: 'text', span: 2, mono: true },
    { id: `${p}_make`,  label: 'Make', type: 'text', span: 1 },
    { id: `${p}_model`, label: 'Model', type: 'text', span: 1 },
    { id: `${p}_color`, label: 'Color', type: 'dropdown', span: 1, options: _COLOR },
    { id: `${p}_year`,  label: 'Year', type: 'number', span: 1 },
    ...post,
  ],
});

const _charges = ({ id = 'sCharges', title = 'Charges', fid = 'charges', required = false } = {}) => ({
  id, title, style: 'gray', fields: [{ id: fid, label: title, type: 'charges', span: 4, required }],
});

const _admin = () => ({
  id: 'sAdmin', title: 'Administrative', style: 'gray', fields: [
    { id: 'adm_obs',    label: 'Observing Unit',        type: 'text',     span: 2, required: true },
    { id: 'adm_status', label: 'Status',                type: 'dropdown', span: 2, required: true, options: ['Active','Pending Review','Closed'] },
    { id: 'adm_sup',    label: 'Supervisor Signature',  type: 'text',     span: 2, required: true },
    { id: 'adm_date',   label: 'Date',                  type: 'date',     span: 2, required: true },
  ],
});

export const REPORT_TEMPLATES = [
  /* ── 1. Florida Traffic Crash Report ── */
  {
    id: 1, name: 'Florida Traffic Crash Report',
    agency: 'FLORIDA HIGHWAY PATROL',
    formCode: 'FHP-CRASH-001',
    signatureSlots: ['Reporting Unit', 'Supervisor Signature', 'Date'],
    sections: [
      _deptId(),
      _agencyInfo(),
      { id: 'sCID', title: 'Crash Identifiers', style: 'blue', fields: [
        { id: 'cid_county',   label: 'County / City of Crash', type: 'dropdown', span: 2, required: true, options: _CITIES },
        { id: 'cid_limits',   label: 'Check if in City Limits', type: 'checkbox', span: 1 },
        { id: 'cid_notified', label: 'Notified By', type: 'dropdown', span: 1, required: true, options: ['Dispatch','Witness','Involved Party','Officer Observed','Other'] },
      ]},
      { id: 'sRoad', title: 'Roadway Information', style: 'gray', fields: [
        { id: 'rd_street',   label: 'Crash Occured (Street Name)', type: 'text', span: 2, required: true },
        { id: 'rd_postal',   label: 'Postal', type: 'text', span: 1 },
        { id: 'rd_sysid',    label: 'Road System Identifer', type: 'dropdown', span: 1, required: true, options: ['Interstate','US Highway','State Road','County Road','Local Street','Private Road'] },
        { id: 'rd_shoulder', label: 'Type of Shoulder', type: 'dropdown', span: 1, required: true, options: ['Paved','Unpaved','Curb & Gutter','None'] },
        { id: 'rd_inter',    label: 'Type of Intersection', type: 'dropdown', span: 1, required: true, options: ['Not at Intersection','Four-Way','T-Intersection','Y-Intersection','Roundabout','Other'] },
        { id: 'rd_aop',      label: 'AOP', type: 'dropdown', span: 1, required: true, options: ['On Roadway','Shoulder','Median','Off Roadway'] },
      ]},
      { id: 'sCrash', title: 'Crash Information', style: 'gray', fields: [
        { id: 'cr_light',   label: 'Light Condition', type: 'dropdown', span: 1, required: true, options: ['Daylight','Dawn','Dusk','Dark - Lighted','Dark - Not Lighted'] },
        { id: 'cr_weather', label: 'Weather Condition', type: 'dropdown', span: 1, required: true, options: ['Clear','Cloudy','Rain','Fog','Windy','Other'] },
        { id: 'cr_surface', label: 'Roadway Surface Condition', type: 'dropdown', span: 1, required: true, options: ['Dry','Wet','Slick','Icy','Sand / Debris','Other'] },
        { id: 'cr_wzrel',   label: 'Work Zone Related', type: 'dropdown', span: 1, required: true, options: _YESNO },
        { id: 'cr_wzin',    label: 'Crash in Work Zone', type: 'dropdown', span: 1, required: true, options: _YESNO },
        { id: 'cr_workers', label: 'Workers in Zone', type: 'dropdown', span: 1, required: true, options: _YESNO },
        { id: 'cr_leo',     label: 'Law Enforcement in Zone', type: 'dropdown', span: 1, required: true, options: _YESNO },
      ]},
      { id: 'sWit', title: 'Witnesses', style: 'gray', fields: [
        { id: 'w1_name', label: 'Name', type: 'text', span: 2 }, { id: 'w1_addr', label: 'Address (Street Name)', type: 'text', span: 1 }, { id: 'w1_postal', label: 'Postal', type: 'text', span: 1 },
        { id: 'w2_name', label: 'Name', type: 'text', span: 2 }, { id: 'w2_addr', label: 'Address (Street Name)', type: 'text', span: 1 }, { id: 'w2_postal', label: 'Postal', type: 'text', span: 1 },
        { id: 'w3_name', label: 'Name', type: 'text', span: 2 }, { id: 'w3_addr', label: 'Address (Street Name)', type: 'text', span: 1 }, { id: 'w3_postal', label: 'Postal', type: 'text', span: 1 },
      ]},
      _veh({ pre: [
        { id: 'vi_cond',  label: 'Vehicle Condition', type: 'text', span: 4 },
        { id: 'vi_cmv',   label: 'Check if Commercial Motor Vehicle', type: 'checkbox', span: 2 },
        { id: 'vi_towed', label: 'Check if Vehicle was Towed from Scene', type: 'checkbox', span: 2 },
      ]}),
      _civ({ id: 'sDriver', title: 'Driver Information', p: 'dr', reqName: false, pre: [
        { id: 'dr_action', label: 'Driver Actions at Time of Crash', type: 'dropdown', span: 4, options: ['No Improper Action','Failed to Yield','Followed Too Closely','Improper Lane Change','Distracted','DUI Suspected','Exceeding Speed Limit','Other'] },
      ]}),
      { id: 'sProp', title: 'Non-Vehicle Property Damage', style: 'gray', fields: [
        { id: 'pd_desc', label: 'Property Damaged other than Vehicles', type: 'text', span: 4 },
      ]},
      { id: 'sNarr', title: 'Narrative', style: 'gray', fields: [
        { id: 'narrative', label: 'Narrative', type: 'textarea', span: 4, required: true, minRows: 5 },
      ]},
      { id: 'sOther', title: 'Other Units', style: 'gray', fields: [
        { id: 'ou_fire',   label: 'Fire Department Dispatched', type: 'dropdown', span: 1, options: _YESNO },
        { id: 'ou_ems',    label: 'EMS Transport', type: 'dropdown', span: 1, options: _YESNO },
        { id: 'ou_assist', label: 'Other Units That Assisted', type: 'unit_lookup', span: 4 },
      ]},
      { id: 'sPhotos', title: 'Photos', style: 'gray', fields: [
        { id: 'photos', label: 'Photos', type: 'photos', max: 6, span: 4 },
      ]},
      { id: 'sLinked', title: 'Linked Records', style: 'gray', fields: [
        { id: 'linked', label: 'Linked Records', type: 'linked_records', span: 4 },
      ]},
      _admin(),
    ],
  },

  /* ── 2. General Police Report ── */
  {
    id: 2, name: 'General Police Report',
    agency: 'SSRP LAW ENFORCEMENT',
    formCode: 'LE-GPR-001',
    signatureSlots: ['Observing Unit', 'Supervisor Signature', 'Date'],
    sections: [
      _deptId(),
      _agencyInfo(),
      _civ(),
      _veh(),
      _charges(),
      { id: 'sNarr', title: 'Narrative', style: 'gray', fields: [
        { id: 'narrative', label: 'Narrative', type: 'textarea', span: 4, required: true, minRows: 5 },
      ]},
      { id: 'sPhotos', title: 'Photos', style: 'gray', fields: [
        { id: 'photos', label: 'Photos', type: 'photos', max: 8, span: 4 },
      ]},
      _admin(),
    ],
  },

  /* ── 3. Use of Force Report ── */
  {
    id: 3, name: 'Use of Force Report',
    agency: 'SSRP LAW ENFORCEMENT',
    formCode: 'LE-UOF-001',
    signatureSlots: ['Officer Involved', 'Supervisor Signature', 'Date'],
    sections: [
      _deptId(),
      _agencyInfo(),
      { id: 'sInc', title: 'Incident Information', style: 'blue', fields: [
        { id: 'uof_f1', label: 'Force Type (Primary)',   type: 'dropdown', span: 4, required: true, options: _FORCE },
        { id: 'uof_f2', label: 'Force Type (Secondary)', type: 'dropdown', span: 4, options: _FORCE },
        { id: 'uof_f3', label: 'Force Type (Tertiary)',  type: 'dropdown', span: 4, options: _FORCE },
      ]},
      { id: 'sEMS', title: 'EMS Involvement', style: 'gray', fields: [
        { id: 'ems_inv',  label: 'Was EMS Involved?', type: 'dropdown', span: 2, options: _YESNO },
        { id: 'ems_hosp', label: 'Was the Suspect Transported to the Hospital?', type: 'dropdown', span: 2, options: ['Yes','No','N/A'] },
      ]},
      { id: 'sAnimal', title: 'Animal Involvement', style: 'gray', fields: [
        { id: 'ani_inv',  label: 'Were Animals Involved?', type: 'dropdown', span: 2, options: _YESNO },
        { id: 'ani_live', label: 'Did the Animal Live?', type: 'dropdown', span: 2, options: ['Yes','No','N/A'] },
      ]},
      { id: 'sNarr', title: 'Narrative', style: 'gray', fields: [
        { id: 'incident_report', label: 'Incident Report', type: 'textarea', span: 4, required: true, minRows: 5 },
      ]},
      { id: 'sUnits', title: 'Additional Units', style: 'gray', fields: [
        { id: 'addl_units', label: 'Additional Units', type: 'unit_lookup', span: 4 },
      ]},
      { id: 'sStatus', title: 'Status', style: 'gray', fields: [
        { id: 'st_officer', label: 'Officer Involved', type: 'text', span: 2, required: true },
        { id: 'st_date',    label: 'Date of Occurrence', type: 'date', span: 2 },
        { id: 'st_status',  label: 'Status', type: 'dropdown', span: 2, options: ['Active','Under Review','Justified','Not Justified','Closed'] },
        { id: 'st_sup',     label: 'Supervisor Signature', type: 'text', span: 2, required: true },
      ]},
    ],
  },

  /* ── 4. Commercial Vehicle Inspection Report ── */
  {
    id: 4, name: 'Commercial Vehicle Inspection Report',
    agency: 'FLORIDA HIGHWAY PATROL',
    formCode: 'FHP-CVI-001',
    signatureSlots: ['Inspector Signature', 'Supervisor Signature', 'Date'],
    sections: [
      _deptId(),
      _agencyInfo(),
      { id: 'sInsp', title: 'Inspection Details', style: 'gray', fields: [
        { id: 'in_usdot',   label: 'USDOT #', type: 'text', span: 2, mono: true, required: true },
        { id: 'in_company', label: 'Company Name', type: 'text', span: 2, required: true },
        { id: 'in_loc',     label: 'Inspection Location', type: 'text', span: 4, required: true },
      ]},
      { id: 'sCargo', title: 'Cargo Information', style: 'gray', fields: [
        { id: 'cg_ostate',  label: 'Origin State', type: 'text', span: 2, required: true },
        { id: 'cg_ocity',   label: 'Origin City', type: 'text', span: 2, required: true },
        { id: 'cg_dstate',  label: 'Destination State', type: 'text', span: 2, required: true },
        { id: 'cg_dcity',   label: 'Destination City', type: 'text', span: 2, required: true },
        { id: 'cg_shipper', label: 'Shipper Name', type: 'text', span: 4 },
        { id: 'cg_type',    label: 'Cargo Type', type: 'dropdown', span: 4, required: true, options: ['General Freight','Hazardous Materials','Refrigerated','Livestock','Oversized / Heavy','Passengers','Household Goods','Other'] },
      ]},
      { id: 'sLevel', title: 'Inspection Level', style: 'gray', fields: [
        { id: 'lv_level', label: 'Pick Level of Inspection', type: 'dropdown', span: 4, required: true, options: ['Level One','Level Two','Level Three','Level Four','Level Five','Level Six'] },
      ]},
      { id: 'sVeh', title: 'Vehicle Information', style: 'dark', lookup: 'vehicle', fields: [
        { id: 'vi_dmv',    label: 'DMV Status', type: 'text', span: 1 },
        { id: 'vi_status', label: 'Status', type: 'dropdown', span: 1, options: ['Active','Suspended','Expired','Revoked'] },
        { id: 'vi_exp',    label: 'Expiration', type: 'date', span: 1 },
        { id: 'vi_gov',    label: 'Gov. Status', type: 'dropdown', span: 1, options: ['Compliant','Non-Compliant','Exempt'] },
        { id: 'vi_plate',  label: 'License Plate', type: 'text', span: 2, mono: true },
        { id: 'vi_gvwr',   label: 'GVWR', type: 'text', span: 1 },
        { id: 'vi_type',   label: 'Vehicle Type', type: 'dropdown', span: 1, options: ['Tractor','Trailer','Straight Truck','Bus','Other'] },
        { id: 'vi_make',   label: 'Make', type: 'text', span: 1 },
        { id: 'vi_model',  label: 'Model', type: 'text', span: 1 },
        { id: 'vi_color',  label: 'Color', type: 'dropdown', span: 1, options: _COLOR },
        { id: 'vi_year',   label: 'Year', type: 'number', span: 1 },
      ]},
      { id: 'sVViol', title: 'Vehicle Violations', style: 'gray', fields: [
        { id: 'vv_section', label: 'Violation Section', type: 'text', span: 2 },
        { id: 'vv_unit',    label: 'Unit', type: 'dropdown', span: 1, options: ['Tractor','Trailer','Both','N/A'] },
        { id: 'vv_oos',     label: 'OOS', type: 'dropdown', span: 1, options: _YESNO },
        { id: 'vv_notes',   label: 'Notes', type: 'text', span: 4 },
      ]},
      _civ({ id: 'sDriver', title: 'Driver Information', p: 'dr', reqName: true }),
      _civ({ id: 'sCoDriver', title: 'Co-Driver Information (If Applicable)', p: 'cd', reqName: false }),
      { id: 'sDViol', title: 'Driver Violations', style: 'gray', fields: [
        { id: 'dv_section', label: 'Violation Section', type: 'text', span: 2 },
        { id: 'dv_unit',    label: 'Unit', type: 'dropdown', span: 1, options: ['Driver','Co-Driver','N/A'] },
        { id: 'dv_oos',     label: 'OOS', type: 'dropdown', span: 1, options: _YESNO },
        { id: 'dv_notes',   label: 'Notes', type: 'text', span: 4 },
      ]},
      { id: 'sState', title: 'State Fields', style: 'gray', fields: [
        { id: 'sf_hire',     label: 'For Hire Carrier?', type: 'dropdown', span: 2, required: true, options: _YESNO },
        { id: 'sf_reason',   label: 'Reason for Inspection', type: 'dropdown', span: 2, required: true, options: ['Random','Post-Crash','Complaint','Follow-Up','Targeted Enforcement'] },
        { id: 'sf_fatal',    label: '# of Fatalities', type: 'number', span: 1, required: true },
        { id: 'sf_injuries', label: '# of Injuries', type: 'number', span: 1, required: true },
        { id: 'sf_coinsp',   label: 'Co-Inspector #', type: 'text', span: 2, required: true },
      ]},
      { id: 'sLinked', title: 'Linked Records', style: 'gray', fields: [
        { id: 'linked', label: 'Linked Records', type: 'linked_records', span: 4 },
      ]},
      { id: 'sNotes', title: 'Inspector Notes', style: 'gray', fields: [
        { id: 'insp_notes', label: 'Notes', type: 'textarea', span: 4, required: true, minRows: 4 },
      ]},
      { id: 'sAuth', title: 'Report Authorization', style: 'gray', fields: [
        { id: 'au_status', label: 'Status', type: 'dropdown', span: 2, required: true, options: ['Active','Pending','Closed'] },
        { id: 'au_insp',   label: 'Inspector Signature', type: 'signature', span: 2, required: true },
        { id: 'au_sup',    label: 'Supervisor Signature', type: 'text', span: 2, required: true },
        { id: 'au_date',   label: 'Date', type: 'date', span: 2, required: true },
      ]},
    ],
  },

  /* ── 5. Arrest Report ── */
  {
    id: 5, name: 'Arrest Report',
    agency: 'SSRP LAW ENFORCEMENT',
    formCode: 'LE-AR-001',
    signatureSlots: ['Observing Officer', 'Supervisor Signature', 'Date'],
    sections: [
      _deptId(),
      _flags(),
      _agencyInfo(),
      { id: 'sLoc', title: 'Location of Occurrence', style: 'blue', fields: [
        { id: 'lo_county', label: 'County', type: 'text', span: 1 },
        { id: 'lo_street', label: 'Street', type: 'text', span: 2, required: true },
        { id: 'lo_city',   label: 'City Of', type: 'dropdown', span: 1, required: true, options: _CITIES },
        { id: 'lo_state',  label: 'State', type: 'text', span: 1 },
        { id: 'lo_postal', label: 'Postal Code', type: 'text', span: 1, required: true },
      ]},
      _civ({ mugshot: true }),
      _veh(),
      _charges({ required: true }),
      { id: 'sInfo', title: 'Information Cont.', style: 'gray', fields: [
        { id: 'ic_weapons', label: 'Weapon(s)', type: 'text', span: 2 },
        { id: 'ic_arrtype', label: 'Arrest Type', type: 'dropdown', span: 1, options: ['On-View','Warrant','Probable Cause','Probation/Parole Violation'] },
        { id: 'ic_prob',    label: 'Probationary Officer', type: 'text', span: 1 },
      ]},
      { id: 'sNarr', title: 'Narrative', style: 'gray', fields: [
        { id: 'narrative', label: 'Narrative', type: 'textarea', span: 4, required: true, minRows: 5 },
      ]},
      { id: 'sStatus', title: 'Status', style: 'gray', fields: [
        { id: 'st_status', label: 'Status', type: 'dropdown', span: 2, required: true, options: ['Active','Booked','Released','Pending'] },
        { id: 'st_obs',    label: "Observing Officer's Signature", type: 'signature', span: 2, required: true },
        { id: 'st_sup',    label: 'Supervisor Signature', type: 'text', span: 2, required: true },
        { id: 'st_date',   label: 'Date', type: 'date', span: 2 },
      ]},
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
  { id: 1, from: "Dispatch (ECC-1)", to: "All Units",       subject: "WARRANT ALERT * Darnell Washington", body: "Active arrest warrant on file. Subject is a felony warrant * do not approach without backup. Last seen near 330 Magnolia Blvd.",     timestamp: "2026-06-01 14:05", read: false, priority: "HIGH"   },
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
      { id: 1, name: 'T1 * Light Duty',  spawnCode: 'towtruck',  type: 'Light Duty'  },
      { id: 2, name: 'T2 * Medium Duty', spawnCode: 'towtruck2', type: 'Medium Duty' },
      { id: 3, name: 'T3 * Flatbed',     spawnCode: 'flatbed',   type: 'Flatbed'     },
    ],
    license: "BL-2026-0445", licenseExpiry: "2026-12-31", licenseIssuedAt: "2026-04-15", licenseStatus: "ACTIVE", ownedByPlayer: true,
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
      { id: 1, name: 'FDOT-T1 * Heavy Rotator', spawnCode: 'rotator',   type: 'Heavy Duty'  },
      { id: 2, name: 'FDOT-T2 * Medium Duty',   spawnCode: 'towtruck2', type: 'Medium Duty' },
    ],
    license: "GOV-FDOT-D7-2026", licenseExpiry: "2026-12-31", licenseIssuedAt: "2026-04-15", licenseStatus: "ACTIVE", ownedByPlayer: true,
    employees: [
      { id: 1, name: "Ray Calhoun",    discordId: "100200305", roles: ["Inspector", "Supervisor"], phone: "813-975-6200", since: "2022-01-01" },
      { id: 2, name: "Jordan Maxwell", discordId: "205947291", roles: ["Supervisor", "Dispatcher"], phone: "555-0192",    since: "2024-06-01" },
    ],
  },
];

/* ─── FDOT Road-Use Permits ─── */
export const FDOT_PERMITS = [
  {
    id: 1,
    permitNumber: 'FDOT-P-2026-0001',
    type: 'Roadwork / Construction',
    holderName: 'Carlos Mendez',
    location: 'I-4 EB / MLK Blvd',
    postal: '347',
    description: 'Storm drain repair and partial lane closure on inside lane. Contractor must maintain one through lane at all times.',
    issuedAt: '2026-05-28',
    expiresAt: '2026-06-28',
    issuedBy: 'Ray Calhoun',
    status: 'ACTIVE',
  },
  {
    id: 2,
    permitNumber: 'FDOT-P-2026-0002',
    type: 'Utility Work',
    holderName: 'Brandon Torres',
    location: 'SR-60 WB / MacDill Ave',
    postal: '312',
    description: 'Emergency fiber optic cable repair. Full shoulder closure, no lane impact.',
    issuedAt: '2026-06-02',
    expiresAt: '2026-07-02',
    issuedBy: 'Ray Calhoun',
    status: 'ACTIVE',
  },
  {
    id: 3,
    permitNumber: 'FDOT-P-2026-0003',
    type: 'Oversize Load Transit',
    holderName: 'Apex Logistics LLC',
    location: 'US-41 SB corridor',
    postal: '501',
    description: 'Oversize load escort * 14-foot wide transformer in transit. LEO escort required at all highway on-ramps.',
    issuedAt: '2026-05-15',
    expiresAt: '2026-05-16',
    issuedBy: 'Jordan Maxwell',
    status: 'EXPIRED',
  },
];

export const RECORD_TEMPLATES = [
  /* ── Hunting License ── */
  {
    id: 'r1', name: 'Hunting License',
    agency: 'FLORIDA FISH AND WILDLIFE CONSERVATION COMMISSION',
    formCode: 'FWC-HL-001',
    sections: [
      _deptId(),
      _agencyInfo(),
      _civ(),
      { id: 'sStatus', title: 'Status', style: 'gray', fields: [
        { id: 'st_status', label: 'Status', type: 'dropdown', span: 2, required: true, options: ['Active','Expired','Revoked','Suspended'] },
        { id: 'st_exp',    label: 'Expiration Date', type: 'date', span: 2, required: true },
        { id: 'st_sup',    label: 'Supervisor Signature', type: 'text', span: 2, required: true },
        { id: 'st_obs',    label: "Observing Officer's Signature", type: 'signature', span: 2, required: true },
      ]},
    ],
  },

  /* ── Fishing License ── */
  {
    id: 'r2', name: 'Fishing License',
    agency: 'FLORIDA FISH AND WILDLIFE CONSERVATION COMMISSION',
    formCode: 'FWC-FL-001',
    sections: [
      _deptId(),
      _agencyInfo(),
      _civ(),
      { id: 'sStatus', title: 'Status', style: 'gray', fields: [
        { id: 'st_status', label: 'Status', type: 'dropdown', span: 2, required: true, options: ['Active','Expired','Revoked','Suspended'] },
        { id: 'st_exp',    label: 'Expiration Date', type: 'date', span: 2, required: true },
        { id: 'st_sup',    label: 'Supervisor Signature', type: 'text', span: 2, required: true },
        { id: 'st_obs',    label: "Observing Officer's Signature", type: 'signature', span: 2, required: true },
      ]},
    ],
  },

  /* ── Trespass Notice ── */
  {
    id: 'r3', name: 'Trespass Notice',
    agency: 'SSRP LAW ENFORCEMENT',
    formCode: 'LE-TN-001',
    sections: [
      _agencyInfo(),
      { id: 'sImg', title: 'Image', style: 'gray', fields: [
        { id: 'img_photo', label: 'Civilian Photo', type: 'image', span: 4 },
      ]},
      _civ(),
      { id: 'sProp', title: 'Property Information', style: 'gray', fields: [
        { id: 'pr_name',  label: 'Property Name', type: 'text', span: 2 },
        { id: 'pr_addr',  label: 'Address', type: 'text', span: 2 },
        { id: 'pr_type',  label: 'Property Type', type: 'dropdown', span: 2, options: ['Residential','Commercial','Retail','Industrial','Government','Other'] },
        { id: 'pr_auth',  label: 'Authorized By (Owner/Agent): [Name]', type: 'text', span: 2 },
        { id: 'pr_title', label: 'Title: [Owner / Manager / Security]', type: 'text', span: 2 },
        { id: 'pr_phone', label: 'Contact Phone Number', type: 'text', span: 2 },
      ]},
      { id: 'sDur', title: 'Duration of Warning', style: 'gray', fields: [
        { id: 'du_7',   label: '7 Day', type: 'checkbox', span: 1 },
        { id: 'du_14',  label: '14 Day', type: 'checkbox', span: 1 },
        { id: 'du_30',  label: '30 Day', type: 'checkbox', span: 1 },
        { id: 'du_60',  label: '60 Day', type: 'checkbox', span: 1 },
        { id: 'du_90',  label: '90 Day', type: 'checkbox', span: 1 },
        { id: 'du_ind', label: 'Indefinite (Until Rescinded by Owner/Agent)', type: 'checkbox', span: 2 },
        { id: 'du_exp', label: 'Expiration Date', type: 'date', span: 2, required: true },
      ]},
      { id: 'sNotice', title: 'Notice', style: 'gray', fields: [
        { id: 'tn_notice', label: 'Notice', type: 'textarea', span: 4, minRows: 4, placeholder: 'NOTICE: YOU ARE HEREBY GIVEN A TRESPASS WARNING FOR THE ABOVE LISTED PROPERTY. YOU ARE ORDERED TO LEAVE THE PREMISES IMMEDIATELY AND ARE NOT PERMITTED TO RETURN TO THIS PROPERTY. THIS WARNING IS ISSUED PURSUANT TO FLORIDA STATUTE 810.09. IF YOU RETURN TO THIS PROPERTY AFTER BEING WARNED, YOU MAY BE ARRESTED FOR TRESPASS AFTER WARNING, A CRIMINAL OFFENSE UNDER FLORIDA LAW.' },
      ]},
      { id: 'sNarr', title: 'Narrative', style: 'gray', fields: [
        { id: 'tn_narr', label: 'Narrative (Optional)', type: 'textarea', span: 4, minRows: 3 },
      ]},
      { id: 'sStatus', title: 'Status', style: 'gray', fields: [
        { id: 'st_obs',  label: "Observing Officer's Signature", type: 'signature', span: 2, required: true },
        { id: 'st_date', label: 'Date', type: 'date', span: 2 },
      ]},
    ],
  },

  /* ── Warrant (kept) ── */
  {
    id: 'r5', name: 'Warrant',
    agency: 'SUNSHINE STATE CIRCUIT COURT',
    formCode: 'HCCC-WR-001',
    sections: [
      { id: 'sAI', title: 'Agency Information', style: 'gray', fields: [
        { id: 'ai_dt',  label: 'Date',        type: 'date', span: 1, autoFill: 'date' },
        { id: 'ai_tm',  label: 'Time',        type: 'time', span: 1, autoFill: 'time' },
        { id: 'ai_rn',  label: 'Record #',    type: 'text', span: 1, mono: true, autoNumber: true },
        { id: 'ai_ag',  label: 'Department',  type: 'text', span: 1, autoFill: 'agencyName', readOnly: true },
        { id: 'ai_sd',  label: 'Subdivision', type: 'text', span: 1, autoFill: 'subdivision', readOnly: true },
        { id: 'ai_un',  label: 'Unit #',      type: 'text', span: 1, autoFill: 'unitNumber',  readOnly: true },
        { id: 'ai_unm', label: 'Unit Name',   type: 'text', span: 2, autoFill: 'unitName',    readOnly: true },
      ]},
      { id: 's1', title: 'Warrant Information', style: 'blue', fields: [
        { id: 'f1', label: 'Subject Name',   type: 'civilian_lookup', span: 3, required: true },
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

  /* ── Florida Uniform Traffic Citation ── */
  {
    id: 'r6', name: 'Florida Uniform Traffic Citation',
    agency: 'SSRP LAW ENFORCEMENT',
    formCode: 'FL-UFTC-001',
    sections: [
      _flags(),
      { id: 'sRec', title: 'Record Number', style: 'gray', fields: [
        { id: 'rec_id', label: 'ID', type: 'text', span: 4, mono: true, autoNumber: true },
      ]},
      { id: 'sUFTC', title: 'Florida Uniform Traffic Citation', style: 'blue', fields: [
        { id: 'uf_county',  label: 'County Of', type: 'text', span: 2 },
        { id: 'uf_fhp',     label: 'FHP', type: 'checkbox', span: 1 },
        { id: 'uf_pd',      label: 'PD', type: 'checkbox', span: 1 },
        { id: 'uf_so',      label: 'SO', type: 'checkbox', span: 1 },
        { id: 'uf_other',   label: 'Other', type: 'checkbox', span: 1 },
        { id: 'uf_city',    label: 'City Of', type: 'dropdown', span: 1, required: true, options: _CITIES },
        { id: 'uf_agency',  label: 'Agency', type: 'dropdown', span: 1, required: true, options: _DEPTS },
        { id: 'uf_summons', label: 'Summons #', type: 'text', span: 2, mono: true },
        { id: 'uf_dow',     label: 'Day of Week', type: 'dropdown', span: 1, options: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] },
        { id: 'uf_month',   label: 'Month', type: 'dropdown', span: 1, options: ['January','February','March','April','May','June','July','August','September','October','November','December'] },
        { id: 'uf_day',     label: 'Day', type: 'text', span: 1 },
        { id: 'uf_year',    label: 'Year', type: 'text', span: 1 },
        { id: 'uf_time',    label: 'Time', type: 'time', span: 1 },
        { id: 'uf_am',      label: 'A.M.', type: 'checkbox', span: 1 },
        { id: 'uf_pm',      label: 'P.M.', type: 'checkbox', span: 1 },
      ]},
      _civ(),
      _veh(),
      { id: 'sReg', title: 'Registration Information', style: 'gray', fields: [
        { id: 'rg_dmv',    label: 'DMV Status', type: 'text', span: 1 },
        { id: 'rg_status', label: 'Status', type: 'dropdown', span: 1, options: ['Active','Suspended','Expired','Revoked'] },
        { id: 'rg_exp',    label: 'Expiration', type: 'date', span: 1 },
        { id: 'rg_street', label: 'Upon a Public Street or Highway, or Other Location, Namely', type: 'text', span: 3, required: true },
        { id: 'rg_postal', label: 'Upon Postal', type: 'text', span: 1, required: true },
      ]},
      { id: 'sOffence', title: 'Did Unlawfully Commit the Following Offence (Check Only One Offence Each Citation)', style: 'gray', fields: [
        { id: 'off_0',  label: 'Careless Driving', type: 'checkbox', span: 1 },
        { id: 'off_1',  label: 'Child Restraint', type: 'checkbox', span: 1 },
        { id: 'off_2',  label: 'Expired Driver License', type: 'checkbox', span: 1 },
        { id: 'off_3',  label: 'Violation of Traffic Control Device', type: 'checkbox', span: 1 },
        { id: 'off_4',  label: 'Safety Belt Violation', type: 'checkbox', span: 1 },
        { id: 'off_5',  label: 'Expired DL More Than 6 Months', type: 'checkbox', span: 1 },
        { id: 'off_6',  label: 'Failure to Stop at a Traffic Signal', type: 'checkbox', span: 1 },
        { id: 'off_7',  label: 'Improper or Unsafe Equipment', type: 'checkbox', span: 1 },
        { id: 'off_8',  label: 'No Valid Driver License', type: 'checkbox', span: 1 },
        { id: 'off_9',  label: 'Improper Lane Change or Course', type: 'checkbox', span: 1 },
        { id: 'off_10', label: 'Expired Tag 6 Months or Less', type: 'checkbox', span: 1 },
        { id: 'off_11', label: 'Driving While Suspended or Revoked', type: 'checkbox', span: 1 },
        { id: 'off_12', label: 'No Proof of Insurance', type: 'checkbox', span: 1 },
        { id: 'off_13', label: 'Expired Tag More Than 6 Months', type: 'checkbox', span: 1 },
        { id: 'off_14', label: 'Violation of Right-of-Way', type: 'checkbox', span: 1 },
        { id: 'off_15', label: 'Improper Passing', type: 'checkbox', span: 1 },
        { id: 'off_16', label: 'Unlawful Speed', type: 'checkbox', span: 1 },
      ]},
      { id: 'sSpeed', title: 'Speed', style: 'gray', fields: [
        { id: 'sp_mph1',    label: 'MPH', type: 'text', span: 1 },
        { id: 'sp_limit',   label: 'Speed Limit', type: 'text', span: 1 },
        { id: 'sp_mph2',    label: 'MPH', type: 'text', span: 1 },
        { id: 'sp_interstate', label: 'Interstate', type: 'checkbox', span: 1 },
        { id: 'sp_school',  label: 'School Zone', type: 'checkbox', span: 1 },
        { id: 'sp_workers', label: 'Construction Workers Present', type: 'checkbox', span: 1 },
        { id: 'sp_device',  label: 'Speed Measurement Device', type: 'text', span: 2 },
        { id: 'sp_devtype', label: 'Device Type', type: 'dropdown', span: 2, options: ['Radar','Lidar','Pace','VASCAR','Aircraft'] },
      ]},
      _charges({ id: 'sOtherCharges', title: 'Other Charges', fid: 'other_charges' }),
      { id: 'sComments', title: 'Other Violations or Comments', style: 'gray', fields: [
        { id: 'uf_comments', label: 'Other Violations or Comments Pertaining to Offense', type: 'textarea', span: 4, minRows: 3 },
      ]},
      { id: 'sAppearance', title: 'Court Appearance', style: 'gray', fields: [
        { id: 'ap_criminal',   label: 'Criminal Violation Court Appearance Required', type: 'checkbox', span: 2 },
        { id: 'ap_infraction', label: 'Infraction Which Does Not Require Appearance in Court', type: 'checkbox', span: 2 },
      ]},
      { id: 'sSign', title: 'Signatures', style: 'gray', fields: [
        { id: 'sg_status',  label: 'Status', type: 'dropdown', span: 1, options: ['Active','Paid','Court Pending','Dismissed'] },
        { id: 'sg_officer', label: 'Officer Signature', type: 'signature', span: 3, required: true },
        { id: 'sg_sup',     label: 'Supervisor Signature', type: 'text', span: 4, required: true },
      ]},
    ],
  },

  /* ── General Citation ── */
  {
    id: 'r7', name: 'General Citation',
    agency: 'SSRP LAW ENFORCEMENT',
    formCode: 'LE-GC-001',
    sections: [
      _deptId(),
      _flags(),
      _agencyInfo(),
      _civ(),
      _veh(),
      { id: 'sCourt', title: 'Court Date', style: 'gray', fields: [
        { id: 'court_date', label: 'Court Date', type: 'date', span: 4, required: true },
      ]},
      _charges(),
      { id: 'sNarr', title: 'Narrative', style: 'gray', fields: [
        { id: 'narrative', label: 'Narrative', type: 'textarea', span: 4, required: true, minRows: 4 },
      ]},
      { id: 'sStatus', title: 'Status', style: 'gray', fields: [
        { id: 'st_status', label: 'Status', type: 'dropdown', span: 2, required: true, options: ['Active','Paid','Court Pending','Dismissed'] },
        { id: 'st_date',   label: 'Date', type: 'date', span: 2 },
        { id: 'st_sup',    label: 'Supervisor Signature', type: 'text', span: 2, required: true },
        { id: 'st_obs',    label: "Observing Unit's Signature", type: 'signature', span: 2, required: true },
      ]},
    ],
  },

  /* ── Written Warning ── */
  {
    id: 'r8', name: 'Written Warning',
    agency: 'SSRP LAW ENFORCEMENT',
    formCode: 'LE-WW-001',
    sections: [
      _deptId(),
      _agencyInfo(),
      _civ(),
      { id: 'sSpeed', title: 'Speed Information', style: 'gray', fields: [
        { id: 'sp_speed', label: 'Vehicle Speed', type: 'text', span: 1 },
        { id: 'sp_limit', label: 'Speed Limit', type: 'text', span: 1 },
        { id: 'sp_pace',  label: 'Pace Type', type: 'dropdown', span: 2, options: ['Radar','Lidar','Pace','VASCAR','Visual Estimate'] },
        { id: 'sp_cdate', label: 'Court Date', type: 'date', span: 1 },
        { id: 'sp_ctime', label: 'Court Time', type: 'time', span: 1 },
        { id: 'sp_fine',  label: 'Fine', type: 'text', span: 1, mono: true },
      ]},
      _veh(),
      { id: 'sViol', title: 'Violation / Charge', style: 'gray', fields: [
        { id: 'ww_text', label: 'Warning Citation', type: 'textarea', span: 4, minRows: 4 },
      ]},
    ],
  },

  /* ── Confidential Informant Record ── */
  {
    id: 'r9', name: 'Confidential Informant Record',
    agency: 'SSRP LAW ENFORCEMENT',
    formCode: 'LE-CI-001',
    sections: [
      _flags(['Armed','Dangerous','Gang Affiliated','Escape Risk']),
      { id: 'sImg', title: 'Image', style: 'gray', fields: [
        { id: 'img_photo', label: 'Civilian Photo', type: 'image', span: 4 },
      ]},
      _civ(),
      { id: 'sReg', title: 'Registration Information', style: 'gray', fields: [
        { id: 'rg_dmv',    label: 'DMV Status', type: 'text', span: 1, required: true },
        { id: 'rg_status', label: 'Status', type: 'dropdown', span: 1, options: ['Active','Suspended','Expired','Revoked'] },
        { id: 'rg_exp',    label: 'Expiration', type: 'date', span: 1 },
        { id: 'rg_gov',    label: 'Gov. Status', type: 'text', span: 1, required: true },
      ]},
      _veh(),
      { id: 'sCI', title: 'Confidential Informant', style: 'gray', fields: [
        { id: 'cinf_status',  label: 'Confidential Informant Status', type: 'dropdown', span: 1, required: true, options: ['Active','Inactive','Burned','Deactivated'] },
        { id: 'cinf_exp',     label: 'Expiration Date', type: 'date', span: 1, required: true },
        { id: 'cinf_contact', label: 'Law Enforcement Contact', type: 'text', span: 2, required: true },
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

