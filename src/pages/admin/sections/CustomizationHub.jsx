import { useNavigate } from 'react-router-dom';
import { AdminPageTitle, SonCard } from '../AdminKit';
import {
  MdListAlt, MdPublic, MdShield, MdLogin, MdLink, MdNotificationsActive,
  MdEmail, MdPersonOff, MdChat, MdDns, MdLocationOn, MdSearch,
  MdGraphicEq, MdHub, MdNotifications,
} from 'react-icons/md';

const CARDS = [
  { icon: MdListAlt,            title: 'Community Info',          desc: 'Name, owner, timezone, character limits.',        route: '/admin/community-info' },
  { icon: MdPublic,             title: 'Geographical Settings',   desc: 'Cities, counties, and postal codes.',             route: '/admin/geographical' },
  { icon: MdShield,             title: 'Unit Status Codes',       desc: 'Status labels and colors for units.',             route: '/admin/status-codes' },
  { icon: MdLogin,              title: 'Custom Login Page',       desc: 'Branding shown on the login screen.',             route: '/admin/login-page' },
  { icon: MdLink,               title: 'Quick Links',             desc: 'Shortcut links shown across the CAD.',            route: '/admin/quick-links' },
  { icon: MdNotificationsActive,title: 'Notification Tones',      desc: 'Audio tones for dispatch events.',                route: '/admin/notification-tones' },
  { icon: MdEmail,              title: 'Custom Community Emails', desc: 'Transactional email templates.',                  route: '/admin/emails' },
  { icon: MdPersonOff,          title: 'User Account Restrictions',desc: 'Whitelist, age gates, and 2FA rules.',           route: '/admin/restrictions' },
  { icon: MdChat,               title: 'Discord Rich Presence',   desc: 'On-duty presence shown in Discord.',              route: '/admin/discord-presence' },
  { icon: MdDns,                title: 'Servers',                 desc: 'Connected game servers and status.',              route: '/admin/servers' },
  { icon: MdLocationOn,         title: 'Addresses',               desc: 'Named addresses for quick dispatch.',             route: '/admin/addresses' },
  { icon: MdSearch,             title: 'Lookup Types',            desc: 'Dropdown value lists used in records.',           route: '/admin/lookup-types' },
  { icon: MdGraphicEq,          title: 'Tone Board',              desc: 'Live dispatch tone board.',                       route: '/admin/tone-board' },
  { icon: MdHub,                title: 'RapidIQ',                 desc: 'Automated query routing & NLP lookups.',          route: '/admin/rapidiq' },
  { icon: MdNotifications,      title: 'Inferno Pagers',          desc: 'Fire/EMS station alerting & tone-out.',           route: '/admin/inferno-pagers' },
];

export default function CustomizationHub() {
  const navigate = useNavigate();
  return (
    <>
      <AdminPageTitle>Community Customization</AdminPageTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {CARDS.map(c => (
          <SonCard key={c.route} icon={c.icon} title={c.title} desc={c.desc} onClick={() => navigate(c.route)} />
        ))}
      </div>
    </>
  );
}
