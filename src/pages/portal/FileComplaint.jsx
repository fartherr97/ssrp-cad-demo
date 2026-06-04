import { MdOutlineGavel, MdOpenInNew } from 'react-icons/md';

export default function FileComplaint() {
  return (
    <div
      className="flex-1 w-full h-full flex flex-col items-center justify-center px-4 py-10 font-ui"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.08) 0%, transparent 60%), var(--n-bg-app)' }}
    >
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-red-500/10 border border-red-500/25 mb-6 shrink-0">
        <MdOutlineGavel size={42} className="text-red-400" />
      </div>

      {/* Text */}
      <div className="text-center max-w-[520px] mb-8">
        <h1 className="text-[26px] font-extrabold text-white leading-snug mb-4">
          Looking to File a Complaint Against a Law Enforcement Officer?
        </h1>
        <p className="text-[15px] text-slate-400 leading-relaxed">
          Head on over to our Report Center to be directed to the correct place.
          Our team reviews all submissions and will follow up as appropriate.
        </p>
      </div>

      {/* CTA */}
      <a
        href="https://ssrp.us/reports"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-red-500/15 border border-red-500/35 text-red-300 font-bold text-[15px] hover:bg-red-500/25 hover:border-red-400/55 hover:text-red-200 hover:-translate-y-0.5 transition-all duration-75 mb-5"
      >
        Go to Report Center
        <MdOpenInNew size={17} />
      </a>
    </div>
  );
}
