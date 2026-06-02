import { MdClose, MdBadge } from 'react-icons/md';
import IdentifierEditor from './IdentifierEditor';

export default function ModifyIdentifier({ onClose }) {
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[420px] rounded-2xl border border-border-base shadow-2xl shadow-black/60 overflow-hidden"
        style={{ background: 'var(--app-card, #161b22)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-base">
          <MdBadge size={18} className="text-brand-bright shrink-0" />
          <span className="text-[13px] font-bold text-slate-200 tracking-wide uppercase">Modify Identifier</span>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
          >
            <MdClose size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4">
          <IdentifierEditor onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
