import { useState, useMemo } from 'react';
import Select from '../../components/ui/Select';
import { useCAD } from '../../store/cadStore';
import { useToast } from '../../contexts/ToastContext';
import {
  MdLocalShipping, MdLocationOn, MdPhone, MdDescription, MdDirectionsCar,
  MdInfoOutline, MdSend, MdBusiness,
  MdHourglassEmpty, MdVisibility, MdBlock,
} from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard, PORTAL_INPUT, PORTAL_LABEL } from './PortalKit';
import { useActiveCivilian, CivilianSwitcher } from '../../contexts/CivilianContext';

const BLANK = { location: '', postal: '', phone: '', vehicle: '', description: '', companyId: '' };

const REQ_STATUS = {
  PENDING:      { label: 'Submitted',    sub: 'Waiting for a tow company to respond.',                  color: '#f59e0b', Icon: MdHourglassEmpty },
  ACKNOWLEDGED: { label: 'Acknowledged', sub: 'Your request was seen and a unit is being assigned.',    color: '#06b6d4', Icon: MdVisibility },
  DISPATCHED:   { label: 'Unit En Route', sub: 'A tow unit has been dispatched and is on the way.',      color: '#22c55e', Icon: MdLocalShipping },
  DECLINED:     { label: 'Declined',     sub: 'No unit was available. Try another company or resubmit.', color: '#ef4444', Icon: MdBlock },
};

export default function RequestTow() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const { activeChar } = useActiveCivilian();

  const towCompanies = useMemo(() => (state.businesses || []).filter(b => b.isTowCompany), [state.businesses]);
  const fdotCompany = useMemo(() => towCompanies.find(b => b.isFDOT), [towCompanies]);

  const [form, setForm] = useState(BLANK);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const callerName = activeChar ? `${activeChar.firstName} ${activeChar.lastName}` : 'Civilian';

  // Live status of this character's tow requests (newest first).
  const myRequests = useMemo(
    () => (state.fdotRequests || [])
      .filter(r => r.source === 'CIVILIAN' && activeChar && r.filerId === activeChar.id)
      .slice()
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
    [state.fdotRequests, activeChar],
  );

  const chosenCompany = form.companyId ? towCompanies.find(b => String(b.id) === String(form.companyId)) : null;
  const routedTo = chosenCompany || fdotCompany;

  const submit = (e) => {
    e.preventDefault();
    if (!form.location.trim() || !form.description.trim()) {
      toast.error('Location and a brief description are required.');
      return;
    }
    const vehLine = form.vehicle.trim() ? `Vehicle: ${form.vehicle.trim()}. ` : '';
    dispatch({
      type: 'ADD_FDOT_REQUEST',
      payload: {
        source: 'CIVILIAN',
        assistType: 'Tow Request',
        location: form.location.trim(),
        postal: form.postal.trim(),
        priority: 3,
        description: `${vehLine}${form.description.trim()}`,
        targetCompanyId: chosenCompany ? chosenCompany.id : null,
        requestedBy: callerName,
        filerId: activeChar?.id ?? null,
        phone: form.phone.trim(),
        requestedByUnit: '',
      },
    });
    setForm(BLANK);
    toast.success(`Tow request sent to ${routedTo?.name || 'FDOT'}.`, { title: 'Request Submitted' });
  };

  return (
    <PortalPage>
      <PortalHeader
        icon={MdLocalShipping}
        title="Request a Tow"
        subtitle="Request roadside assistance or a tow for your vehicle. Choose a company or let it route automatically."
        accent="brand"
      />

      <div className="max-w-[760px]">
        <CivilianSwitcher />

        {myRequests.length > 0 && (
          <div className="mb-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-slate-500 mb-2.5">My Tow Requests</div>
            <div className="flex flex-col gap-2.5">
              {myRequests.map(req => {
                const st = REQ_STATUS[req.status] || REQ_STATUS.PENDING;
                const StIcon = st.Icon;
                const dest = req.dispatchedCompany || req.handledBy
                  || (req.targetCompanyId ? towCompanies.find(b => b.id === req.targetCompanyId)?.name : null)
                  || fdotCompany?.name || 'FDOT';
                return (
                  <div key={req.id} className="rounded-xl border p-3.5 flex items-start gap-3"
                    style={{ background: `${st.color}0d`, borderColor: `${st.color}40` }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${st.color}22`, border: `1px solid ${st.color}55` }}>
                      <StIcon size={18} style={{ color: st.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-bold" style={{ color: st.color }}>{st.label}</span>
                        <span className="text-[11px] text-slate-500 font-mono">#{req.id}</span>
                      </div>
                      <div className="text-[12px] text-slate-300 mt-0.5">{st.sub}</div>
                      {req.status === 'DISPATCHED' && (
                        <div className="text-[11.5px] text-green-300/90 mt-1 flex items-center gap-1.5">
                          <MdLocalShipping size={13} className="shrink-0" />
                          {req.dispatchedUnit ? `${req.dispatchedUnit} · ${dest}` : dest} is en route.
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1.5">
                        <MdLocationOn size={12} className="shrink-0" /> {req.location}
                        {req.status !== 'DISPATCHED' && req.status !== 'DECLINED' && (
                          <span className="ml-1">· routed to <span className="text-slate-400">{dest}</span></span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <PortalCard accent="brand">
          <form onSubmit={submit} className="flex flex-col gap-4">
            {/* Location */}
            <div>
              <label className={PORTAL_LABEL}><MdLocationOn size={12} className="inline mr-1 -mt-0.5" />Location <span className="text-red-400">*</span></label>
              <input className={PORTAL_INPUT} value={form.location} onChange={set('location')}
                placeholder="e.g. Bayshore Blvd & Gandy, southbound shoulder" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Postal (optional) */}
              <div>
                <label className={PORTAL_LABEL}>Postal / Cross Street <span className="text-slate-600 normal-case font-medium tracking-normal">· optional</span></label>
                <input className={PORTAL_INPUT} value={form.postal} onChange={set('postal')} placeholder="e.g. 347" />
              </div>
              {/* Phone (optional) */}
              <div>
                <label className={PORTAL_LABEL}><MdPhone size={12} className="inline mr-1 -mt-0.5" />Callback Phone <span className="text-slate-600 normal-case font-medium tracking-normal">· optional</span></label>
                <input className={PORTAL_INPUT} value={form.phone} onChange={set('phone')} placeholder={activeChar?.phone || '555-0000'} />
              </div>
            </div>

            {/* Vehicle (optional) */}
            <div>
              <label className={PORTAL_LABEL}><MdDirectionsCar size={12} className="inline mr-1 -mt-0.5" />Vehicle <span className="text-slate-600 normal-case font-medium tracking-normal">· optional</span></label>
              <input className={PORTAL_INPUT} value={form.vehicle} onChange={set('vehicle')}
                placeholder="e.g. Blue Sedan, plate ABC123" />
            </div>

            {/* Description */}
            <div>
              <label className={PORTAL_LABEL}><MdDescription size={12} className="inline mr-1 -mt-0.5" />Brief Description <span className="text-red-400">*</span></label>
              <textarea className={`${PORTAL_INPUT} min-h-[90px] resize-y`} value={form.description} onChange={set('description')}
                placeholder="What happened and what you need (flat tire, ran out of fuel, collision, won't start, etc.)" required />
            </div>

            {/* Company selector */}
            <div>
              <label className={PORTAL_LABEL}><MdBusiness size={12} className="inline mr-1 -mt-0.5" />Tow Company</label>
              <Select className={PORTAL_INPUT} value={form.companyId} onChange={set('companyId')}>
                <option value="">No preference</option>
                {towCompanies.map(b => (
                  <option key={b.id} value={b.id}>{b.name}{b.isFDOT ? ' (FDOT)' : ''}</option>
                ))}
              </Select>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg"
              style={{ background: 'rgba(61,130,240,0.07)', border: '1px solid rgba(61,130,240,0.2)' }}>
              <MdInfoOutline size={16} className="text-brand-bright shrink-0 mt-0.5" />
              <div className="text-[11.5px] text-slate-300 leading-relaxed">
                If you don't select a specific company, your request is automatically sent to{' '}
                <span className="font-semibold text-brand-bright">{fdotCompany?.name || 'FDOT Tow Operations'}</span> only.
                Choosing a company sends the request directly to them. Dispatch and response times are not guaranteed.
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button type="submit"
                className="press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer bg-brand hover:bg-brand/80 text-white transition-colors border-0">
                <MdSend size={15} /> Submit Request
              </button>
              <span className="text-[11px] text-slate-500">
                Routes to <span className="font-semibold text-slate-300">{routedTo?.name || 'FDOT'}</span>
              </span>
            </div>
          </form>
        </PortalCard>
      </div>
    </PortalPage>
  );
}
