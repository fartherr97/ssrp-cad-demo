import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import Select from '../components/ui/Select';
import { useCAD } from '../store/cadStore';
import { MdPerson, MdSwapHoriz } from 'react-icons/md';
import { BADGE } from '../constants/styles';

const CivilianContext = createContext(null);
const STORAGE_KEY = 'ssrp_active_civilian';

export function CivilianProvider({ children }) {
  const { state } = useCAD();
  const { civilians } = state;

  const [activeCharId, setActiveCharIdRaw] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved != null ? Number(saved) : null;
    } catch { return null; }
  });

  const setActiveCharId = (id) => {
    setActiveCharIdRaw(id);
    try { localStorage.setItem(STORAGE_KEY, String(id)); } catch { /* ignore */ }
  };

  const myChars = useMemo(
    () => civilians.filter(c => c.ownedByPlayer),
    [civilians],
  );

  const activeChar = useMemo(
    () => myChars.find(c => c.id === activeCharId) || myChars[0] || null,
    [myChars, activeCharId],
  );

  // Keep the selection valid if the active character is deleted.
  useEffect(() => {
    if (myChars.length && !myChars.some(c => c.id === activeCharId)) {
      setActiveCharIdRaw(myChars[0].id);
    }
  }, [myChars, activeCharId]);

  return (
    <CivilianContext.Provider value={{ myChars, activeChar, activeCharId: activeChar?.id ?? null, setActiveCharId }}>
      {children}
    </CivilianContext.Provider>
  );
}

export function useActiveCivilian() {
  return useContext(CivilianContext) || { myChars: [], activeChar: null, activeCharId: null, setActiveCharId: () => {} };
}

const DL_BADGE = { ACTIVE: BADGE.green, SUSPENDED: BADGE.red, EXPIRED: BADGE.orange };

/* Active-character banner + switcher. Always shows who you're acting as when
   the player owns at least one character; becomes a dropdown when they own
   more than one. */
export function CivilianSwitcher() {
  const { myChars, activeChar, setActiveCharId } = useActiveCivilian();
  if (!activeChar) return null;

  const multi = myChars.length > 1;

  return (
    <div className="portal-card-enter flex items-center gap-3 mb-5 px-4 py-3 rounded-xl border border-border-base bg-app-card/60 transition-[border-color,box-shadow]">
      <div className="w-10 h-10 rounded-[10px] shrink-0 flex items-center justify-center bg-brand/15 border border-brand/30">
        <MdPerson size={22} className="text-brand-bright" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
          {multi ? <MdSwapHoriz size={13} className="text-brand-bright" /> : null}
          Active Character
        </div>
        {multi ? (
          <Select
            className="w-full max-w-[280px] bg-app-input border border-border-base rounded-lg px-3 py-2 text-sm font-semibold text-cad-text outline-none cursor-pointer focus:border-brand/60 focus:ring-2 focus:ring-brand/20 transition-[border-color,box-shadow]"
            value={activeChar.id}
            onChange={e => setActiveCharId(Number(e.target.value))}
          >
            {myChars.map(c => (
              <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
            ))}
          </Select>
        ) : (
          // key forces re-mount → triggers char-name-swap animation on character change
          <div key={activeChar.id} className="char-name-swap text-[15px] font-bold text-slate-100 truncate">
            {activeChar.firstName} {activeChar.lastName}
          </div>
        )}
      </div>
      {/* key forces badge to re-animate whenever active character changes */}
      <span key={activeChar.id} className="char-name-swap shrink-0">
        <span className={DL_BADGE[activeChar.dlStatus] || BADGE.gray}>
          DL {activeChar.dlStatus || 'N/A'}
        </span>
      </span>
    </div>
  );
}
