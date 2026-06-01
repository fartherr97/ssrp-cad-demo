export default function SiteFooter() {
  return (
    <footer className="relative z-10 w-full shrink-0 bg-[rgba(4,10,24,0.9)] border-t border-white/[0.07] backdrop-blur-[8px]">
      <div className="flex items-center px-4 sm:px-8 py-3">
        {/* Logo + copyright */}
        <div className="flex items-center gap-2">
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" className="w-[20px] h-[20px] opacity-50" />
          <span className="text-[11px] text-[rgba(120,160,200,0.45)]">© 2026 Sunshine State RP</span>
        </div>
      </div>
    </footer>
  );
}
