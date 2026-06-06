import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCAD } from '../../store/cadStore';
import { useToast } from '../../contexts/ToastContext';
import { useActiveCivilian } from '../../contexts/CivilianContext';
import { resizeImage } from '../../utils/image';
import { PortalPage, PortalHeader, StatCard, PortalCard, SectionTitle } from './PortalKit';
import {
  MdAccountCircle, MdCameraAlt, MdEdit, MdCheckCircle, MdClose, MdPerson,
  MdDirectionsCar, MdBadge, MdGavel, MdStore, MdSwapHoriz, MdAssignment,
  MdOpenInNew, MdNotificationsActive, MdContentCopy,
} from 'react-icons/md';
import { BADGE } from '../../constants/styles';

const ACCENT = 'brand';
const DL_BADGE = { ACTIVE: BADGE.green, SUSPENDED: BADGE.red, EXPIRED: BADGE.orange };

const PREF_DEFS = [
  { key: 'warrantAlerts',    label: 'Warrant alerts',    desc: 'Notify me when a warrant is issued for one of my characters.' },
  { key: 'reportUpdates',    label: 'Report updates',    desc: 'Notify me when a report or complaint I filed changes status.' },
  { key: 'licenseReminders', label: 'License reminders', desc: 'Remind me before a license or registration expires.' },
];

export default function MyAccount() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const navigate = useNavigate();
  const { currentUser, vehicles = [], warrants = [], businesses = [] } = state;
  const { myChars, activeChar, setActiveCharId } = useActiveCivilian();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(currentUser?.name || '');

  const avatar = currentUser?.accountAvatar || '';
  const uploadAvatar = async (file) => {
    if (!file) return;
    const data = await resizeImage(file);
    dispatch({ type: 'UPDATE_CURRENT_USER', payload: { accountAvatar: data } });
    toast.success('Account photo updated.', { title: 'Saved' });
  };

  const saveName = () => {
    const n = nameDraft.trim();
    if (!n) return;
    dispatch({ type: 'UPDATE_CURRENT_USER', payload: { name: n } });
    setEditingName(false);
    toast.success('Display name updated.', { title: 'Saved' });
  };

  // ── Aggregate across every character on the account ──
  const charIds       = new Set(myChars.map(c => c.id));
  const myVehicles    = vehicles.filter(v => charIds.has(v.ownerId));
  const licensedCount = myChars.filter(c => c.dlNumber).length;
  const activeWarrants = warrants.filter(w => charIds.has(w.civilianId) && w.status === 'ACTIVE');

  // ── Businesses linked to this Discord account ──
  const myBusinesses = businesses.filter(b =>
    (currentUser?.discordId && b.ownerDiscordId === currentUser.discordId) ||
    (currentUser?.discordId && b.employees?.some(e => e.discordId === currentUser.discordId))
  );

  const prefs = currentUser?.prefs || {};
  const togglePref = (key, cur) =>
    dispatch({ type: 'UPDATE_CURRENT_USER', payload: { prefs: { ...prefs, [key]: !cur } } });

  const copyId = () => {
    try { navigator.clipboard?.writeText(currentUser?.discordId || ''); toast.info('Discord ID copied.'); } catch { /* ignore */ }
  };

  return (
    <PortalPage>
      <PortalHeader icon={MdAccountCircle} title="My Account" accent={ACCENT}
        subtitle="Your community account — identity, characters, and settings." />

      {/* ── Identity hero ── */}
      <PortalCard accent={ACCENT} className="mb-5">
        <div className="flex items-center gap-4 sm:gap-5 flex-wrap">
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-app-input border border-border-base flex items-center justify-center">
              {avatar
                ? <img src={avatar} alt="Account" className="w-full h-full object-cover" />
                : <MdAccountCircle size={56} className="text-slate-600" />}
            </div>
            <label className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-brand hover:bg-brand-bright cursor-pointer flex items-center justify-center border-2 border-app-panel shadow-lg" title="Upload account photo">
              <MdCameraAlt size={15} className="text-white" />
              <input type="file" accept="image/*" className="hidden"
                onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; await uploadAvatar(f); }} />
            </label>
          </div>

          <div className="min-w-0 flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input autoFocus value={nameDraft} onChange={e => setNameDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                  className="bg-app-input border border-border-base rounded-lg px-3 py-1.5 text-[18px] font-extrabold text-white outline-none focus:border-brand/60 min-w-0" />
                <button onClick={saveName} className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-400/10 cursor-pointer" title="Save"><MdCheckCircle size={20} /></button>
                <button onClick={() => setEditingName(false)} className="p-1 rounded-lg text-slate-500 hover:bg-white/[0.06] cursor-pointer" title="Cancel"><MdClose size={20} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group/name">
                <span className="text-[20px] sm:text-[24px] font-extrabold text-white tracking-[-0.3px] truncate">{currentUser?.name || 'Citizen'}</span>
                <button onClick={() => { setNameDraft(currentUser?.name || ''); setEditingName(true); }}
                  className="opacity-0 group-hover/name:opacity-100 p-1 rounded text-slate-500 hover:text-slate-200 transition cursor-pointer" title="Edit display name"><MdEdit size={15} /></button>
              </div>
            )}
            <div className="text-[12px] font-semibold mt-0.5" style={{ color: '#9090cc' }}>Civilian Services Account</div>

            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2.5">
              {currentUser?.discordUsername && (
                <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
                  <span className="text-slate-600 font-semibold uppercase text-[10px] tracking-[0.5px]">Discord</span>
                  <span className="font-semibold text-slate-200">@{currentUser.discordUsername}</span>
                </div>
              )}
              {currentUser?.discordId && (
                <button onClick={copyId} className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-200 cursor-pointer group/id" title="Copy Discord ID">
                  <span className="text-slate-600 font-semibold uppercase text-[10px] tracking-[0.5px]">ID</span>
                  <span className="font-mono text-slate-300">{currentUser.discordId}</span>
                  <MdContentCopy size={12} className="opacity-0 group-hover/id:opacity-100" />
                </button>
              )}
              {currentUser?.memberSince && (
                <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
                  <span className="text-slate-600 font-semibold uppercase text-[10px] tracking-[0.5px]">Member since</span>
                  <span className="font-mono text-slate-300">{currentUser.memberSince}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </PortalCard>

      {/* ── Aggregate stats ── */}
      <div className="flex flex-wrap gap-3 mb-6">
        <StatCard label="Characters"      value={myChars.length}    accent={ACCENT} icon={MdPerson}        hint="On this account" />
        <StatCard label="Vehicles"        value={myVehicles.length} accent={ACCENT} icon={MdDirectionsCar} hint="Across all characters" />
        <StatCard label="Licensed"        value={licensedCount}     accent={ACCENT} icon={MdBadge}         hint="Characters with a DL" />
        <StatCard label="Active Warrants" value={activeWarrants.length} accent={activeWarrants.length ? 'red' : 'green'} icon={MdGavel} hint={activeWarrants.length ? 'Action needed' : 'All clear'} />
      </div>

      {/* ── Character roster ── */}
      <SectionTitle accent={ACCENT}><MdPerson size={14} /> My Characters</SectionTitle>
      {myChars.length === 0 ? (
        <PortalCard accent={ACCENT} className="mb-6">
          <div className="text-[13px] text-slate-400">
            No characters yet. Head to{' '}
            <button onClick={() => navigate('/portal/characters')} className="text-brand-bright font-semibold cursor-pointer bg-transparent border-none p-0">Characters</button>{' '}
            to create one.
          </div>
        </PortalCard>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {myChars.map(c => {
            const isActive = c.id === activeChar?.id;
            return (
              <PortalCard key={c.id} accent={isActive ? ACCENT : undefined} noAnim className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-app-input border border-border-base flex items-center justify-center shrink-0">
                  {c.profilePhoto
                    ? <img src={c.profilePhoto} alt="" className="w-full h-full object-cover" />
                    : <MdPerson size={24} className="text-slate-600" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-bold text-white truncate">{c.firstName} {c.lastName}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={DL_BADGE[c.dlStatus] || BADGE.gray}>DL {c.dlStatus || 'N/A'}</span>
                    {isActive && <span className="text-[9px] font-bold uppercase tracking-[0.5px] text-brand-bright">Active</span>}
                  </div>
                </div>
                {!isActive && (
                  <button onClick={() => { setActiveCharId(c.id); toast.info(`${c.firstName} is now your active character.`); }}
                    title="Set as active character"
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-300 bg-white/[0.05] border border-white/10 hover:bg-white/[0.09] cursor-pointer transition">
                    <MdSwapHoriz size={14} /> Use
                  </button>
                )}
              </PortalCard>
            );
          })}
        </div>
      )}

      {/* ── Owned / linked businesses ── */}
      {myBusinesses.length > 0 && (
        <>
          <SectionTitle accent={ACCENT}><MdStore size={14} /> My Businesses</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 mb-6">
            {myBusinesses.map(b => (
              <PortalCard key={b.id} accent={ACCENT} hover noAnim onClick={() => navigate('/portal/business')} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0"><MdStore size={20} className="text-brand-bright" /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-bold text-white truncate">{b.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{b.type || 'Business'} · {b.ownerDiscordId === currentUser?.discordId ? 'Owner' : 'Employee'}</div>
                </div>
                <MdOpenInNew size={15} className="text-slate-500 shrink-0" />
              </PortalCard>
            ))}
          </div>
        </>
      )}

      {/* ── Quick links ── */}
      <SectionTitle accent={ACCENT}><MdAssignment size={14} /> Quick Links</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { route: '/portal/characters', icon: MdPerson,        label: 'Characters' },
          { route: '/portal/vehicles',   icon: MdDirectionsCar, label: 'Vehicles' },
          { route: '/portal/licenses',   icon: MdBadge,         label: 'Licenses' },
          { route: '/portal/my-reports', icon: MdAssignment,    label: 'My Reports' },
        ].map(q => (
          <PortalCard key={q.route} accent={ACCENT} hover noAnim onClick={() => navigate(q.route)} className="flex items-center gap-3">
            <q.icon size={20} className="text-brand-bright shrink-0" />
            <span className="text-[13.5px] font-bold text-slate-100">{q.label}</span>
          </PortalCard>
        ))}
      </div>

      {/* ── Notification settings ── */}
      <SectionTitle accent={ACCENT}><MdNotificationsActive size={14} /> Notification Settings</SectionTitle>
      <PortalCard accent={ACCENT} className="mb-2">
        <div className="flex flex-col">
          {PREF_DEFS.map((p, i) => {
            const on = prefs[p.key] ?? true; // default on
            return (
              <div key={p.key} className={`flex items-center gap-4 py-3 ${i ? 'border-t border-border-faint' : ''}`}>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-slate-100">{p.label}</div>
                  <div className="text-[11.5px] text-slate-500">{p.desc}</div>
                </div>
                <button onClick={() => togglePref(p.key, on)} role="switch" aria-checked={on}
                  className={`relative w-11 h-6 rounded-full shrink-0 transition-colors cursor-pointer border-none ${on ? 'bg-brand' : 'bg-white/10'}`}>
                  <span className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all ${on ? 'left-[23px]' : 'left-[3px]'}`} />
                </button>
              </div>
            );
          })}
        </div>
      </PortalCard>
      <div className="text-[11px] text-slate-600 mb-2">Preferences are saved to your account.</div>
    </PortalPage>
  );
}
