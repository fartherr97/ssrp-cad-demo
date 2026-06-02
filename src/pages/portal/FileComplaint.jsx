import { MdOutlineGavel, MdOpenInNew, MdArrowForward } from 'react-icons/md';
import { PortalPage, PortalHeader, PortalCard } from './PortalKit';

export default function FileComplaint() {
  return (
    <PortalPage>
      <PortalHeader
        icon={MdOutlineGavel}
        title="File a Complaint"
        subtitle="Submit a complaint against a Law Enforcement Officer through our official Report Center."
        accent="red"
      />

      <PortalCard accent="red" className="max-w-[640px]">
        <div className="flex flex-col items-center text-center px-4 py-8 gap-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-red-500/10 border border-red-500/25 shrink-0">
            <MdOutlineGavel size={34} className="text-red-400" />
          </div>

          <div>
            <h2 className="text-[19px] font-extrabold text-white mb-3 leading-snug">
              Looking to File a Complaint Against a Law Enforcement Officer?
            </h2>
            <p className="text-[14px] text-slate-400 leading-relaxed max-w-[480px]">
              Head on over to our Report Center to be directed to the correct place.
              Our team reviews all submissions and will follow up as appropriate.
            </p>
          </div>

          <a
            href="https://ssrp.us/reports"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-red-500/15 border border-red-500/35 text-red-300 font-bold text-[14px] hover:bg-red-500/25 hover:border-red-400/50 hover:text-red-200 hover:-translate-y-0.5 transition-all duration-75"
          >
            Go to Report Center
            <MdOpenInNew size={16} />
          </a>

          <p className="text-[11px] text-slate-600 font-mono">
            ssrp.us/reports <MdArrowForward size={11} className="inline align-[-1px]" /> Complaint Forms
          </p>
        </div>
      </PortalCard>
    </PortalPage>
  );
}
