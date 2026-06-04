export default function SiteFooter() {
  return (
    <footer className="relative z-10 w-full shrink-0 bg-app-toolbar/80 border-t border-border-base backdrop-blur-md">
      <div className="flex items-center gap-4 px-4 sm:px-6 py-2.5">
        {/* Brand + copyright */}
        <div className="flex items-center gap-2.5">
          <img src="https://cdn.ssrp.us/images/ssrp.png" alt="SSRP" className="w-5 h-5 object-contain opacity-70" />
          <span className="text-[11px] text-slate-500">
            © 2026 Sunshine State <span style={{ color: '#f2800d' }}>RP</span>
          </span>
        </div>

        <div className="ml-auto text-[10.5px] font-medium text-slate-600 hidden md:block">
          CAD v2.4.1
        </div>
      </div>
    </footer>
  );
}
