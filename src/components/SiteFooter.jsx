import { MdLock } from 'react-icons/md';

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

        {/* Right-side network status */}
        <div className="ml-auto flex items-center gap-4 text-[10.5px] font-medium whitespace-nowrap">
          <span className="hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(74,222,128,0.8)] animate-pulse" />
            <span className="text-emerald-400 font-semibold tracking-[0.3px]">CONNECTED</span>
          </span>
          <span className="hidden md:inline text-slate-600">CAD v2.4.1</span>
          <span className="flex items-center gap-1.5 text-slate-500">
            ENCRYPTION <MdLock size={11} className="text-emerald-400" />
          </span>
        </div>
      </div>
    </footer>
  );
}
