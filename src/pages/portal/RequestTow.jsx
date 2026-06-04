import { useState, useMemo } from 'react';
import { useCAD } from '../../store/cadStore';
import { useToast } from '../../contexts/ToastContext';
import {
  MdLocalShipping, MdLocationOn, MdPhone, MdDescription, MdDirectionsCar,
  MdInfoOutline, MdCheckCircle, MdSend, MdBusiness,
} from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard, PORTAL_INPUT, PORTAL_LABEL } from './PortalKit';
import { useActiveCivilian, CivilianSwitcher } from '../../contexts/CivilianContext';

const BLANK = { location: '', postal: '', phone: '', vehicle: '', description: '', companyId: '' };

export default function RequestTow() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const { activeChar } = useActiveCivilian();

  const towCompanies = useMemo(() => (state.businesses || []).filter(b => b.isTowCompany), [state.businesses]);
  const fdotCompany = useMemo(() => towCompanies.find(b => b.isFDOT), [towCompanies]);

  const [form, setForm] = useState(BLANK);
  const [submitted, setSubmitted] = useState(null); // { company } after submit
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const callerName = activeChar ? `${activeChar.firstName} ${activeChar.lastName}` : 'Civilian';

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
        phone: form.phone.trim(),
        requestedByUnit: '',
      },
    });
    setSubmitted({ company: routedTo?.name || 'FDOT Tow Operations', specific: !!chosenCompany });
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

        {submitted && (
          <PortalCard accent="green" style={{ marginBottom: 18 }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0">
                <MdCheckCircle size={22} className="text-green-400" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-white mb-0.5">Tow request submitted</div>
                <div className="text-[12.5px] text-slate-400 leading-relaxed">
                  Your request was routed to <span className="font-semibold text-slate-200">{submitted.company}</span>
                  {submitted.specific ? '.' : ' (auto-routed — no company was selected).'} A dispatcher will review it shortly.
                  You can submit another request below if needed.
                </div>
              </div>
            </div>
          </PortalCard>
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
              <select className={PORTAL_INPUT} value={form.companyId} onChange={set('companyId')}>
                <option value="">No preference — auto-route to {fdotCompany?.name || 'FDOT'}</option>
                {towCompanies.map(b => (
                  <option key={b.id} value={b.id}>{b.name}{b.isFDOT ? ' (FDOT)' : ''}</option>
                ))}
              </select>
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
