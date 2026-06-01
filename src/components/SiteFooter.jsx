const AGENCIES = [
  { abbr: 'TPD',  color: '#3a78cc' },
  { abbr: 'HCSO', color: '#3aaa44' },
  { abbr: 'FHP',  color: '#c8a050' },
  { abbr: 'HCFR', color: '#cc3333' },
  { abbr: 'FDOT', color: '#dd7820' },
];

export default function SiteFooter() {
  return (
    <footer className="relative z-10 w-full shrink-0 bg-[rgba(4,10,24,0.9)] border-t border-white/[0.07] backdrop-blur-[8px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 px-4 sm:px-8 py-3">
        {/* Logo + copyright */}
        <div className="flex items-center gap-2">
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" className="w-[20px] h-[20px] opacity-50" />
          <span className="text-[11px] text-[rgba(120,160,200,0.45)]">© 2026 Sunshine State RP</span>
        </div>

        {/* Agency tags */}
        <div className="flex gap-3 items-center">
          {AGENCIES.map(ag => (
            <span
              key={ag.abbr}
              className="text-[10px] font-bold tracking-[0.5px] opacity-60"
              style={{ color: ag.color }}
            >
              {ag.abbr}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
