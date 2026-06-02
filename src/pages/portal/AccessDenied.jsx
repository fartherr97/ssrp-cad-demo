import { useNavigate } from 'react-router-dom';
import { MdLock, MdArrowBack } from 'react-icons/md';

export default function AccessDenied({ portalName = 'this portal' }) {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex items-center justify-center p-8" style={{ minHeight: '60vh' }}>
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>
          <MdLock size={38} style={{ color: '#ef4444' }} />
        </div>
        <div className="text-[22px] font-extrabold text-white tracking-[-0.3px] mb-2">Access Denied</div>
        <p className="text-[13px] text-slate-400 leading-relaxed mb-1">
          You are not authorized to access {portalName}.
        </p>
        <p className="text-[12px] text-slate-600 mb-8">
          An administrator must assign you as an owner or employee before you can log in.
        </p>
        <button onClick={() => navigate('/')} type="button"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold"
          style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#94a3b8' }}>
          <MdArrowBack size={16} /> Back to Login
        </button>
      </div>
    </div>
  );
}
