import { useState } from 'react';
import { useCAD } from '../../store/cadStore';
import {
  MdHelpOutline, MdPerson, MdDirectionsCar, MdBadge, MdLocalHospital,
  MdPhone, MdReportProblem, MdAssignment, MdMenuBook, MdGavel,
  MdStore, MdGroup, MdLocalShipping, MdSupervisorAccount, MdShield,
  MdCheckCircle, MdSearch, MdCampaign, MdBarChart, MdAccessTime,
  MdOutlineRateReview, MdChevronRight,
  MdDashboard, MdMap, MdLocalFireDepartment, MdLocalPolice, MdEngineering,
  MdWork, MdWarningAmber,
} from 'react-icons/md';
import { PortalPage, PortalHeader } from './PortalKit';
import { DEFAULT_HELP_CONTENT } from '../../data/helpDefaults';

/* Icon lookup * keys match iconKey values in helpDefaults */
export const HELP_ICON_MAP = {
  MdPerson, MdDirectionsCar, MdBadge, MdLocalHospital, MdPhone,
  MdReportProblem, MdAssignment, MdMenuBook, MdGavel, MdStore,
  MdStoreMini: MdStore, MdGroup, MdLocalShipping, MdSupervisorAccount,
  MdShield, MdSearch, MdCampaign, MdBarChart, MdAccessTime,
  MdOutlineRateReview, MdHelpOutline,
  MdDashboard, MdMap, MdLocalFireDepartment, MdLocalPolice, MdEngineering,
  MdWork, MdWarningAmber,
};

export const PORTAL_COLOR = {
  civilian:   '#9090cc',
  business:   '#44aacc',
  leo:        '#3a88e8',
  fire:       '#e04020',
  supervisor: '#f59e0b',
  command:    '#3d82f0',
};

/* Ranks that grant Command Portal access (mirrors CommandPortal.jsx). Supervisor
   and Command help are leadership tiers, gated the same way the portals are. */
export const COMMAND_RANKS = [
  'Sergeant', 'Lieutenant', 'Captain',
  'Deputy Chief', 'Chief', 'Commander', 'Battalion Chief',
];

const PORTAL_INTRO = {
  civilian:   'The Civilian Portal lets players manage their in-game identities, vehicles, licenses, and interact with emergency services.',
  business:   'The Business Portal lets business owners manage their entity, staff roster, and fleet vehicles.',
  leo:        'The Law Enforcement Portal gives officers the CAD console, records search, report and record filing, warrants, and the live map.',
  fire:       'The Fire & EMS Portal gives HCFR personnel the Fire Operations board, incoming 911 calls routed to EMS/Fire, apparatus management, and incident reporting.',
  supervisor: 'The Supervisor Portal gives department supervisors tools to review officer submissions, look up personnel, and blast department-wide notifications.',
  command:    'The Command Portal gives leadership a cross-department analytics dashboard, response-time tracking, and broadcast tools.',
};

const PORTAL_ICON = {
  civilian: MdPerson, business: MdStore, leo: MdLocalPolice, fire: MdLocalFireDepartment,
  supervisor: MdSupervisorAccount, command: MdShield,
};

/* Which help tabs the current user is allowed to even see. A tab is visible only
   if the user has access to that portal via their role * non-command can't see
   the command page, civilians can't see LEO, etc. Hidden tabs are not rendered. */
function accessibleTabs(currentUser, officers = []) {
  const portal = currentUser?.portal;
  // Only the Admin portal previews every help page. An officer whose *account*
  // role is 'admin' but who is signed into the LEO/Fire portal still only sees
  // the help for that portal (plus leadership tiers below), never the others.
  if (portal === 'admin') return ['civilian', 'business', 'leo', 'fire', 'supervisor', 'command'];

  const me = officers.find(o => o.id === currentUser?.id);
  const isLeadership = !!me && COMMAND_RANKS.includes(me.rank);

  const tabs = [];
  if (portal === 'civilian') tabs.push('civilian');
  if (portal === 'business') tabs.push('business');
  if (portal === 'leo' || portal === 'dispatch') tabs.push('leo');
  if (portal === 'fire') tabs.push('fire');
  // Supervisor + Command help are leadership-only, mirroring portal access.
  if ((portal === 'leo' || portal === 'fire' || portal === 'dispatch') && isLeadership) {
    tabs.push('supervisor', 'command');
  }
  return tabs.length ? tabs : ['civilian'];
}

/* The tab to open first * the operational page matching the user's own portal. */
function primaryTab(currentUser, allowed) {
  const portal = currentUser?.portal;
  const map = { civilian: 'civilian', business: 'business', fire: 'fire', leo: 'leo', dispatch: 'leo', admin: 'command' };
  const pref = map[portal];
  return allowed.includes(pref) ? pref : allowed[0];
}

/* A single question row — click to expand the answer. While a search is active,
   matching rows are forced open so players see answers without extra clicks. */
function FaqItem({ faq, color, forceOpen }) {
  const [open, setOpen] = useState(false);
  const show = open || forceOpen;
  return (
    <div className="border-t border-border-faint first:border-t-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-2.5 px-2 py-3 cursor-pointer text-left transition-colors hover:bg-white/[0.02]"
        style={{ background: 'transparent', border: 'none' }}
      >
        <MdChevronRight size={16} className="shrink-0 mt-0.5 transition-transform"
          style={{ color, transform: show ? 'rotate(90deg)' : 'rotate(0deg)' }} />
        <span className="flex-1 text-[13.5px] font-semibold text-slate-100 leading-snug">{faq.q}</span>
      </button>
      {/* Animated expand/collapse — grid-rows 0fr→1fr smoothly tweens the height
         with no fixed measurement, and the inner content fades + slides in. */}
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${show ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className={`pl-[30px] pr-2 pb-3 -mt-0.5 text-[13px] text-slate-400 leading-relaxed whitespace-pre-wrap transition-all duration-300 ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}>
            {faq.a}
          </div>
        </div>
      </div>
    </div>
  );
}

/* A category groups related questions under an icon + title header. */
function Category({ sec, color, forceOpen }) {
  const Icon = HELP_ICON_MAP[sec.iconKey] || MdCheckCircle;
  const faqs = sec.faqs || [];
  if (faqs.length === 0) return null;
  return (
    <div className="portal-card-enter rounded-xl border border-border-base bg-app-panel/80 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-faint">
        <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <div className="text-[13.5px] font-bold text-slate-100">{sec.title}</div>
      </div>
      <div className="px-2 py-1">
        {faqs.map(f => (
          <FaqItem key={f.id} faq={f} color={color} forceOpen={forceOpen} />
        ))}
      </div>
    </div>
  );
}

const TABS = [
  { id: 'civilian',   label: 'Civilian',        icon: MdPerson              },
  { id: 'business',   label: 'Business',        icon: MdStore               },
  { id: 'leo',        label: 'Law Enforcement', icon: MdLocalPolice         },
  { id: 'fire',       label: 'Fire / EMS',      icon: MdLocalFireDepartment },
  { id: 'supervisor', label: 'Supervisor',      icon: MdSupervisorAccount   },
  { id: 'command',    label: 'Command',         icon: MdShield              },
];

export default function HelpCenter() {
  const { state } = useCAD();
  const { currentUser, officers = [] } = state;

  // Only the portals this user has access to are even shown.
  const allowed = accessibleTabs(currentUser, officers);
  const visibleTabs = TABS.filter(t => allowed.includes(t.id));
  const [activeTab, setActiveTab] = useState(() => primaryTab(currentUser, allowed));

  // Guard against an active tab that isn't accessible (e.g. role changed).
  const safeActive = allowed.includes(activeTab) ? activeTab : allowed[0];

  const color = PORTAL_COLOR[safeActive];
  const TabIcon = PORTAL_ICON[safeActive] || MdHelpOutline;

  // Merge stored content with defaults so new portals always have something
  const helpContent = state.helpContent || {};
  const sections = helpContent[safeActive] || DEFAULT_HELP_CONTENT[safeActive] || [];

  // FAQ search — filters questions + answers (and category titles) live.
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = !q
    ? sections
    : sections
        .map(sec => {
          const titleHit = (sec.title || '').toLowerCase().includes(q);
          const faqs = (sec.faqs || []).filter(f =>
            titleHit ||
            (f.q || '').toLowerCase().includes(q) ||
            (f.a || '').toLowerCase().includes(q)
          );
          return { ...sec, faqs };
        })
        .filter(sec => (sec.faqs || []).length > 0);
  const resultCount = filtered.reduce((n, s) => n + (s.faqs || []).length, 0);

  return (
    <PortalPage>
      <PortalHeader
        icon={MdHelpOutline}
        title="Help Center"
        subtitle="Frequently asked questions for your portal, search or browse by topic."
        accent="brand"
      />

      {/* Tab bar * only shows portals this user has access to */}
      <div className="flex gap-1.5 flex-wrap mb-6 p-1 rounded-xl bg-app-panel/60 border border-border-base backdrop-blur-sm w-fit">
        {visibleTabs.map(t => {
          const on = t.id === safeActive;
          const tc = PORTAL_COLOR[t.id];
          return (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setQuery(''); }}
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
          {PORTAL_INTRO[safeActive]}
        </p>
      </div>

      {/* Search box — filters questions and answers live */}
      <div className="flex items-center gap-2.5 mb-4 px-3.5 py-2.5 rounded-xl border bg-app-panel/60 backdrop-blur-sm focus-within:bg-app-panel/80 transition-colors"
        style={{ borderColor: `${color}30` }}>
        <MdSearch size={18} style={{ color }} className="shrink-0" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search frequently asked questions…"
          className="flex-1 bg-transparent text-[13px] text-slate-200 placeholder:text-slate-600 outline-none"
        />
        {query && (
          <button onClick={() => setQuery('')}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-300 cursor-pointer shrink-0"
            style={{ background: 'transparent', border: 'none' }}>
            Clear
          </button>
        )}
      </div>

      {q && (
        <div className="mb-3 text-[11.5px] text-slate-500">
          {resultCount} result{resultCount !== 1 ? 's' : ''} for “{query.trim()}”
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map(sec => (
          <Category key={sec.id} sec={sec} color={color} forceOpen={!!q} />
        ))}
        {sections.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-[13px]">
            No help content configured for this portal yet.
          </div>
        )}
        {sections.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 text-center py-12 text-slate-500">
            <MdSearch size={28} className="opacity-30" />
            <span className="text-[13px]">No questions match “{query.trim()}”.</span>
            <span className="text-[11.5px] text-slate-600">Try a different keyword, or clear the search to browse all topics.</span>
          </div>
        )}
      </div>
    </PortalPage>
  );
}
