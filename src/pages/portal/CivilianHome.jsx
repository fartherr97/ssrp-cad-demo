import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCAD } from '../../store/cadStore';
import { useToast } from '../../contexts/ToastContext';
import {
  MdHome, MdPerson, MdDirectionsCar, MdBadge, MdReportProblem,
  MdWarning, MdMenuBook, MdChevronRight, MdLocalHospital,
  MdPhone, MdClose,
} from 'react-icons/md';
import { PortalPage, PortalHeader, StatCard, PortalCard, SectionTitle, PORTAL_INPUT, PORTAL_LABEL } from './PortalKit';
import { useActiveCivilian, CivilianSwitcher } from '../../contexts/CivilianContext';
import {
  BADGE, S_BTN_DANGER, S_BTN_SECONDARY, S_BTN_GHOST, sm,
  S_OVERLAY, S_MODAL, S_MODAL_HEADER, S_MODAL_TITLE, S_MODAL_BODY, S_MODAL_FOOTER,
  S_FIELD, S_LABEL, S_INPUT, S_TEXTAREA,
} from '../../constants/styles';

const BLANK_911 = { message: '', location: '', callbackNumber: '' };

const ACCENT = 'brand';

const DL_BADGE = {
  ACTIVE:    BADGE.green,
  SUSPENDED: BADGE.red,
  EXPIRED:   BADGE.orange,
};

export default function CivilianHome() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const navigate = useNavigate();
  const { vehicles, warrants, currentUser } = state;
  const { myChars, activeChar, setActiveCharId } = useActiveCivilian();

  const [show911, setShow911] = useState(false);
  const [form911, setForm911] = useState(BLANK_911);
  const set911 = k => e => setForm911(f => ({ ...f, [k]: e.target.value }));

  const myVehicles = useMemo(() => vehicles.filter(v => v.ownerId === activeChar?.id), [vehicles, activeChar]);
  const myWarrants = useMemo(
    () => warrants.filter(w => w.civilianId === activeChar?.id && w.status === 'ACTIVE'),
    [warrants, activeChar],
  );

  const callerName = activeChar ? `${activeChar.firstName} ${activeChar.lastName}` : (currentUser?.name || 'Civilian');

  const submit911 = () => {
    if (!form911.message.trim() || !form911.location.trim()) return;
    dispatch({
      type: 'ADD_CIVILIAN_911',
      payload: {
        id: `inc_${Date.now()}`,
        filerId: activeChar?.id ?? null,
        caller: callerName,
        callbackNumber: form911.callbackNumber.trim() || null,
        message: form911.message.trim(),
        location: form911.location.trim(),
        receivedAt: Date.now(),
        priority: 1,
      },
    });
    toast.success('Your 911 call has been received. Help is on the way.', { title: '911 Dispatched' });
    setForm911(BLANK_911);
    setShow911(false);
  };

  const QUICK = [
    { route: '/portal/characters',  icon: MdPerson,        title: 'My Characters',   desc: 'Register and manage your identities.' },
    { route: '/portal/vehicles',    icon: MdDirectionsCar, title: 'My Vehicles',     desc: 'Register vehicles and view registration.' },
    { route: '/portal/licenses',    icon: MdBadge,         title: 'My Licenses',     desc: 'Driver licenses and weapon permits.' },
    { route: '/portal/medical',     icon: MdLocalHospital, title: 'Medical Records', desc: 'Manage medical profiles, allergies, and emergency contacts.' },
    { route: '/portal/file-report', icon: MdReportProblem, title: 'File a Report',   desc: 'Report theft, vandalism, and more.' },
    { route: '/portal/laws',        icon: MdMenuBook,      title: 'State Laws',      desc: 'Browse the public penal code.' },
  ];

  return (
    <PortalPage>
      <PortalHeader
        icon={MdHome}
        title="Civilian Services"
        subtitle={`Welcome back, ${currentUser?.name || 'Citizen'} * manage your records and services here.`}
        accent={ACCENT}
      />

      <CivilianSwitcher />

      {myWarrants.length > 0 && (
        <PortalCard accent="red" className="mb-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-[10px] shrink-0 flex items-center justify-center bg-red-400/10 border border-red-400/30">
            <MdWarning size={26} className="text-red-400" />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-extrabold text-red-300">
              {myWarrants.length} active warrant{myWarrants.length !== 1 ? 's' : ''} on your record{myWarrants.length !== 1 ? 's' : ''}
            </div>
            <div className="text-xs text-red-300/75 mt-[3px]">
              {myWarrants.map(w => `${w.civilianName} * ${w.charge}`).join('  •  ')}
            </div>
          </div>
        </PortalCard>
      )}

      {/* 911 Emergency Button */}
      <button
        type="button"
        onClick={() => setShow911(true)}
        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 transition-all mb-5 cursor-pointer group"
      >
        <div className="w-12 h-12 rounded-[14px] shrink-0 flex items-center justify-center bg-red-500/20 border border-red-500/40 group-hover:bg-red-500/30 transition-colors">
          <MdPhone size={26} className="text-red-400" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-[16px] font-extrabold text-red-300 tracking-tight">Call 911</div>
          <div className="text-[12px] text-red-300/60 mt-0.5">Report an emergency — dispatched immediately to law enforcement</div>
        </div>
        <div className="text-[13px] font-bold text-red-400 border border-red-500/40 rounded-lg px-3 py-1.5 bg-red-500/10">
          EMERGENCY
        </div>
      </button>

      <div className="flex gap-3.5 flex-wrap mb-7">
        <StatCard label="Characters"   value={myChars.length}    accent={ACCENT} icon={MdPerson} hint="Total on account" />
        <StatCard label="Vehicles"     value={myVehicles.length} accent={ACCENT} icon={MdDirectionsCar} hint={activeChar ? `${activeChar.firstName}'s vehicles` : undefined} />
        <StatCard label="License"      value={activeChar?.dlStatus || 'N/A'} accent={activeChar?.dlStatus === 'ACTIVE' ? 'green' : 'amber'} icon={MdBadge} />
        <StatCard
          label="Active Warrants"
          value={myWarrants.length}
          accent={myWarrants.length > 0 ? 'red' : ACCENT}
          icon={MdWarning}
          hint={myWarrants.length > 0 ? 'Action required' : 'All clear'}
        />
      </div>

      <SectionTitle accent={ACCENT}>Quick Actions</SectionTitle>
      <div className="stagger grid gap-3.5 mb-[30px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))' }}>
        {QUICK.map(q => (
          <PortalCard key={q.route} accent={ACCENT} hover onClick={() => navigate(q.route)}>
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-[10px] shrink-0 flex items-center justify-center bg-brand/15 border border-brand/30">
                <q.icon size={24} className="text-brand-bright" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold text-slate-100">{q.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{q.desc}</div>
              </div>
              <MdChevronRight size={22} className="text-slate-500 shrink-0" />
            </div>
          </PortalCard>
        ))}
      </div>

      <SectionTitle accent={ACCENT}>My Characters</SectionTitle>
      {myChars.length === 0 ? (
        <PortalCard accent={ACCENT}>
          <div className="text-sm text-slate-400">
            You haven't registered any characters yet. Head to{' '}
            <span className="text-brand-bright font-semibold">My Characters</span> to get started.
          </div>
        </PortalCard>
      ) : (
        <>
          <div className="text-[12px] text-slate-500 mb-3">Select a character to make them active across the portal.</div>
          <div className="stagger grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))' }}>
            {myChars.map(c => {
              const isActive = c.id === activeChar?.id;
              return (
                <PortalCard key={c.id} accent={ACCENT} hover onClick={() => setActiveCharId(c.id)}
                  className={isActive ? 'ring-2 ring-brand/60 border-brand/50' : ''}>
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <MdPerson size={22} className={`shrink-0 ${isActive ? 'text-brand-bright' : 'text-slate-400'}`} />
                      <div className="min-w-0">
                        <div className="text-[15px] font-bold text-slate-100">{c.firstName} {c.lastName}</div>
                        <div className="text-[11px] text-slate-500">DOB {c.dob}</div>
                      </div>
                    </div>
                    {isActive
                      ? <span className="text-[9px] font-bold uppercase tracking-wider text-brand-bright bg-brand/15 border border-brand/30 rounded px-1.5 py-0.5 shrink-0">Active</span>
                      : <span className={DL_BADGE[c.dlStatus] || BADGE.gray}>{c.dlStatus || 'N/A'}</span>}
                  </div>
                </PortalCard>
              );
            })}
          </div>
        </>
      )}
      {/* 911 Modal */}
      {show911 && (
        <div className={`${S_OVERLAY} anim-overlay-in`} onClick={e => e.target === e.currentTarget && (setShow911(false), setForm911(BLANK_911))}>
          <div className={`${S_MODAL} max-w-[480px]`}>
            <div className={S_MODAL_HEADER} style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/20 border border-red-500/40 shrink-0">
                <MdPhone size={18} className="text-red-400" />
              </div>
              <div className={S_MODAL_TITLE}>911 Emergency Call</div>
              <button className={sm(S_BTN_GHOST)} onClick={() => { setShow911(false); setForm911(BLANK_911); }}>
                <MdClose size={16} />
              </button>
            </div>
            <div className={S_MODAL_BODY}>
              <div className="text-[12px] text-red-400/80 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 font-medium">
                For genuine emergencies only. Misuse may result in in-game consequences.
              </div>
              <div className={S_FIELD}>
                <label className={S_LABEL}>What is your emergency? *</label>
                <textarea
                  className={`${S_TEXTAREA} min-h-[80px]`}
                  placeholder="Briefly describe the emergency…"
                  value={form911.message}
                  onChange={set911('message')}
                />
              </div>
              <div className={S_FIELD}>
                <label className={S_LABEL}>Your Location *</label>
                <input className={S_INPUT} placeholder="Street address or area" value={form911.location} onChange={set911('location')} />
              </div>
              <div className={S_FIELD}>
                <label className={S_LABEL}>Callback Number</label>
                <input className={S_INPUT} placeholder="Optional phone number" value={form911.callbackNumber} onChange={set911('callbackNumber')} />
              </div>
              <div className="text-[11px] text-slate-500">
                Calling as: <span className="text-slate-300 font-semibold">{callerName}</span>
              </div>
            </div>
            <div className={S_MODAL_FOOTER}>
              <button className={S_BTN_SECONDARY} onClick={() => { setShow911(false); setForm911(BLANK_911); }}>Cancel</button>
              <button
                className={`press ${S_BTN_DANGER} font-bold`}
                disabled={!form911.message.trim() || !form911.location.trim()}
                onClick={submit911}
              >
                <MdPhone size={16} /> Call 911
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalPage>
  );
}
