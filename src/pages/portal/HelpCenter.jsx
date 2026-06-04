import { useState } from 'react';
import { useCAD } from '../../store/cadStore';
import {
  MdHelpOutline, MdPerson, MdDirectionsCar, MdBadge, MdLocalHospital,
  MdPhone, MdReportProblem, MdAssignment, MdMenuBook, MdGavel,
  MdStore, MdGroup, MdLocalShipping, MdSupervisorAccount, MdShield,
  MdCheckCircle, MdSearch, MdCampaign, MdBarChart, MdAccessTime,
  MdOutlineRateReview, MdChevronRight, MdInfoOutline,
} from 'react-icons/md';
import { PortalPage, PortalHeader } from './PortalKit';
import { DEFAULT_HELP_CONTENT } from '../../data/helpDefaults';

/* Icon lookup — keys match iconKey values in helpDefaults */
export const HELP_ICON_MAP = {
  MdPerson, MdDirectionsCar, MdBadge, MdLocalHospital, MdPhone,
  MdReportProblem, MdAssignment, MdMenuBook, MdGavel, MdStore,
  MdStoreMini: MdStore, MdGroup, MdLocalShipping, MdSupervisorAccount,
  MdShield, MdSearch, MdCampaign, MdBarChart, MdAccessTime,
  MdOutlineRateReview, MdHelpOutline,
};

export const PORTAL_COLOR = {
  civilian:   '#9090cc',
  business:   '#44aacc',
  supervisor: '#f59e0b',
  command:    '#3d82f0',
};

const PORTAL_INTRO = {
  civilian:   'The Civilian Portal lets players manage their in-game identities, vehicles, licenses, and interact with emergency services.',
  business:   'The Business Portal lets business owners manage their entity, staff roster, and fleet vehicles.',
  supervisor: 'The Supervisor Portal gives department supervisors tools to review officer submissions, look up personnel, and blast department-wide notifications.',
  command:    'The Command Portal gives leadership a cross-department analytics dashboard, response-time tracking, and broadcast tools.',
};

const PORTAL_ICON = {
  civilian: MdPerson, business: MdStore, supervisor: MdSupervisorAccount, command: MdShield,
};

function usePortalId() {
  const { state } = useCAD();
  const p = state.currentUser?.portal;
  if (p === 'dispatch' || p === 'leo' || p === 'fire' || p === 'admin') {
    return state.currentUser?.role === 'admin' ? 'command' : 'supervisor';
  }
  if (p === 'business') return 'business';
  return 'civilian';
}

function Section({ sec, color }) {
  const [open, setOpen] = useState(true);
  const Icon = HELP_ICON_MAP[sec.iconKey] || MdCheckCircle;
  return (
    <div className="portal-card-enter rounded-xl border border-border-base bg-app-panel/80 backdrop-blur-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 cursor-pointer text-left transition-colors hover:bg-white/[0.03]"
        style={{ background: 'transparent', border: 'none' }}
      >
        <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-slate-100">{sec.title}</div>
          {sec.tip && !open && (
            <div className="text-[11px] text-slate-500 truncate mt-0.5">{sec.tip}</div>
          )}
        </div>
        <MdChevronRight size={18} className="text-slate-500 shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-border-faint flex flex-col gap-0.5">
          {sec.tip && (
            <div className="flex items-start gap-2 mb-2 px-2 py-1.5 rounded-lg bg-white/[0.025] text-[11.5px] text-slate-500 leading-relaxed">
              <MdInfoOutline size={13} className="shrink-0 mt-0.5 text-slate-600" />
              {sec.tip}
            </div>
          )}
          {(sec.bullets || []).map(b => (
            <div key={b.id} className="flex items-start gap-2.5 py-1.5">
              <MdCheckCircle size={14} style={{ color, flexShrink: 0, marginTop: 2 }} />
              <span className="text-[13px] text-slate-300 leading-relaxed">{b.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id: 'civilian',   label: 'Civilian',   icon: MdPerson            },
  { id: 'business',   label: 'Business',   icon: MdStore             },
  { id: 'supervisor', label: 'Supervisor', icon: MdSupervisorAccount },
  { id: 'command',    label: 'Command',    icon: MdShield            },
];

export default function HelpCenter() {
  const { state } = useCAD();
  const defaultTab = usePortalId();
  const [activeTab, setActiveTab] = useState(defaultTab);

  const color = PORTAL_COLOR[activeTab];
  const TabIcon = PORTAL_ICON[activeTab] || MdHelpOutline;

  // Merge stored content with defaults so new portals always have something
  const helpContent = state.helpContent || {};
  const sections = helpContent[activeTab] || DEFAULT_HELP_CONTENT[activeTab] || [];

  return (
    <PortalPage>
      <PortalHeader
        icon={MdHelpOutline}
        title="Help Center"
        subtitle="Feature guides for every portal — pick a section below."
        accent="brand"
      />

      {/* Tab bar */}
      <div className="flex gap-1.5 flex-wrap mb-6 p-1 rounded-xl bg-app-panel/60 border border-border-base backdrop-blur-sm w-fit">
        {TABS.map(t => {
          const on = t.id === activeTab;
          const tc = PORTAL_COLOR[t.id];
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-bold cursor-pointer transition-all border"
              style={on
                ? { background: `${tc}20`, borderColor: `${tc}50`, color: tc }
                : { background: 'transparent', borderColor: 'transparent', color: '#64748b' }
              }
            >
              <t.icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Intro banner */}
      <div className="portal-card-enter rounded-xl border px-4 py-3 flex items-start gap-3 mb-5 backdrop-blur-sm"
        style={{ background: `${color}0d`, borderColor: `${color}30` }}>
        <TabIcon size={18} style={{ color, flexShrink: 0, marginTop: 1 }} />
        <p className="text-[12.5px] text-slate-300 leading-relaxed">
          {PORTAL_INTRO[activeTab]}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {sections.map(sec => (
          <Section key={sec.id} sec={sec} color={color} />
        ))}
        {sections.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-[13px]">
            No help content configured for this portal yet.
          </div>
        )}
      </div>
    </PortalPage>
  );
}
