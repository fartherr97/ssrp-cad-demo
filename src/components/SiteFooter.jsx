import { MdLock } from 'react-icons/md';

export default function SiteFooter() {
  return (
    <footer className="relative z-10 w-full shrink-0 flex items-center gap-4 px-4 h-[30px] bg-app-toolbar/80 border-t border-border-base backdrop-blur-md text-[10.5px] font-medium overflow-hidden whitespace-nowrap">
      {/* Connection */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(74,222,128,0.8)] animate-pulse" />
        <span className="text-emerald-400 font-semibold tracking-[0.4px]">CONNECTED TO SSRP NETWORK</span>
      </div>

      <span className="text-slate-600 shrink-0">CAD v2.4.1</span>

      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <span className="text-slate-600">DISPATCH:</span>
        <span className="text-slate-400">Hillsborough Communications</span>
      </div>

      <div className="ml-auto hidden lg:flex items-center gap-1.5 shrink-0">
        <span className="text-slate-600">PRIMARY CHANNEL:</span>
        <span className="text-brand-bright font-semibold">COUNTY OPS 1</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-slate-600">ENCRYPTION:</span>
        <span className="text-emerald-400 font-semibold">ACTIVE</span>
        <MdLock size={11} className="text-emerald-400" />
      </div>
    </footer>
  );
}
