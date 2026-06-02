import {
  MdDashboard, MdSearch, MdDescription, MdMap, MdGridView,
  MdGroups, MdGavel, MdPeopleAlt, MdPhoneAndroid, MdMenuBook,
  MdLocalFireDepartment, MdDirectionsCar, MdBadge, MdReportProblem,
  MdHome, MdPerson, MdStore, MdGroup, MdAssignment, MdFolder,
  MdSupervisorAccount, MdHeadsetMic,
} from 'react-icons/md';

export const PORTALS = {
  leo: { id: 'leo', label: 'Law Enforcement', subtitle: 'Law Enforcement', color: '#3a88e8', landing: '/cad',
    showStatus: true, showCalls: true, showNewCall: false,
    nav: [
      { Icon: MdDashboard,    label: 'CAD',      route: '/cad'      },
      { Icon: MdSearch,       label: 'Search',   route: '/search'   },
      { Icon: MdDescription,  label: 'Reports',  route: '/forms',   dropdown: 'reports' },
      { Icon: MdFolder,       label: 'Records',  route: '/records', dropdown: 'records' },
      { Icon: MdPhoneAndroid, label: 'MDT',      route: '/mdt'      },
      { Icon: MdGavel,              label: 'Warrants',   route: '/warrants'          },
      { Icon: MdMap,                label: 'Map',        route: '/map'               },
      { Icon: MdSupervisorAccount,  label: 'Supervisor', route: '/portal/supervisor' },
    ],
  },

  dispatch: { id: 'dispatch', label: 'Dispatch', subtitle: 'Dispatch Center', color: '#3aaa44', landing: '/cad',
    showStatus: true, showCalls: true, showNewCall: true,
    nav: [
      { Icon: MdDashboard,  label: 'Board',   route: '/cad'    },
      { Icon: MdMap,        label: 'Map',     route: '/map'    },
      { Icon: MdSearch,     label: 'Search',  route: '/search' },
    ],
  },

  fire: { id: 'fire', label: 'Fire & EMS', subtitle: 'Fire & EMS', color: '#e04020', landing: '/fire',
    showStatus: true, showCalls: true, showNewCall: false,
    nav: [
      { Icon: MdLocalFireDepartment, label: 'Fire Board', route: '/fire'     },
      { Icon: MdDashboard,           label: 'CAD',        route: '/cad'      },
      { Icon: MdGroups,              label: 'Units',      route: '/units'    },
      { Icon: MdMap,                 label: 'Map',        route: '/map'      },
      { Icon: MdDescription,         label: 'Reports',   route: '/forms',   dropdown: 'reports' },
      { Icon: MdFolder,              label: 'Records',   route: '/records', dropdown: 'records' },
    ],
  },

  admin: { id: 'admin', label: 'Administration', subtitle: 'Administration', color: '#c09010', landing: '/admin',
    showStatus: true, showCalls: true, showNewCall: true,
    nav: [
      { Icon: MdDashboard,    label: 'CAD',       route: '/cad'       },
      { Icon: MdSearch,       label: 'Search',    route: '/search'    },
      { Icon: MdDescription,  label: 'Reports',   route: '/forms',    dropdown: 'reports' },
      { Icon: MdFolder,       label: 'Records',   route: '/records',  dropdown: 'records' },
      { Icon: MdMap,          label: 'Map',       route: '/map'       },
      { Icon: MdGridView,     label: 'Board',     route: '/board'     },
      { Icon: MdGroups,       label: 'Units',     route: '/units'     },
      { Icon: MdGavel,        label: 'Warrants',  route: '/warrants'  },
      { Icon: MdPeopleAlt,         label: 'Civilians',  route: '/civilians'         },
      { Icon: MdPhoneAndroid,      label: 'MDT',        route: '/mdt'               },
      { Icon: MdSupervisorAccount, label: 'Supervisor', route: '/portal/supervisor' },
    ],
  },

  civilian: { id: 'civilian', label: 'Civilian Services', subtitle: 'Civilian Portal', color: '#9090cc', landing: '/portal/civilian',
    showStatus: false, showCalls: false, showNewCall: false,
    nav: [
      { Icon: MdHome,          label: 'Home',        route: '/portal/civilian'    },
      { Icon: MdPerson,        label: 'Characters',  route: '/portal/characters'  },
      { Icon: MdDirectionsCar, label: 'Vehicles',    route: '/portal/vehicles'    },
      { Icon: MdBadge,         label: 'Licenses',    route: '/portal/licenses'    },
      { Icon: MdReportProblem, label: 'File Report', route: '/portal/file-report' },
      { Icon: MdGavel,         label: 'Complaint',   route: '/portal/complaint'   },
      { Icon: MdMenuBook,      label: 'Laws',        route: '/portal/laws'        },
    ],
  },

  business: { id: 'business', label: 'Business Services', subtitle: 'Business Center', color: '#44aacc', landing: '/portal/business',
    showStatus: false, showCalls: false, showNewCall: false,
    nav: [
      { Icon: MdHome,       label: 'Home',        route: '/portal/business'    },
      { Icon: MdStore,      label: 'My Business', route: '/portal/my-business' },
      { Icon: MdGroup,      label: 'Employees',   route: '/portal/employees'   },
      { Icon: MdAssignment, label: 'Incidents',   route: '/portal/incidents'   },
      { Icon: MdMenuBook,   label: 'Laws',        route: '/portal/laws'        },
    ],
  },
};

export const DEFAULT_PORTAL = 'leo';
