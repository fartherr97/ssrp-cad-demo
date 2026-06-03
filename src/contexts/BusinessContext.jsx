import { createContext, useContext, useState, useMemo } from 'react';
import { useCAD } from '../store/cadStore';
import { MdSwapHoriz } from 'react-icons/md';

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const { state } = useCAD();
  const { businesses, currentUser } = state;
  const [activeBizId, setActiveBizId] = useState(null);

  const myBizList = useMemo(() => businesses.filter(b =>
    b.ownedByPlayer ||
    (currentUser?.discordId && b.ownerDiscordId === currentUser.discordId) ||
    (currentUser?.discordId && b.employees?.some(e => e.discordId === currentUser.discordId))
  ), [businesses, currentUser]);

  const activeBiz = useMemo(() =>
    myBizList.find(b => b.id === activeBizId) || myBizList[0] || null,
    [myBizList, activeBizId]
  );

  return (
    <BusinessContext.Provider value={{ myBizList, activeBiz, setActiveBizId }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useActiveBusiness() {
  return useContext(BusinessContext) || { myBizList: [], activeBiz: null, setActiveBizId: () => {} };
}

/* Renders a business switcher banner when the user belongs to >1 business. */
export function BusinessSwitcher() {
  const { myBizList, activeBiz, setActiveBizId } = useActiveBusiness();
  if (myBizList.length <= 1) return null;

  return (
    <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl border border-border-base bg-app-card/60">
      <MdSwapHoriz size={20} className="text-brand-bright shrink-0" />
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Active Business</span>
      <select
        className="flex-1 bg-app-input border border-border-base rounded-lg px-3 py-2 text-sm text-cad-text outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/20 transition-all"
        value={activeBiz?.id ?? ''}
        onChange={e => setActiveBizId(Number(e.target.value))}
      >
        {myBizList.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
    </div>
  );
}
