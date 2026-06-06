import { useState, useMemo } from 'react';
import Select from '../../../components/ui/Select';
import { MdMessage, MdSearch, MdShield, MdCampaign } from 'react-icons/md';
import { useCAD } from '../../../store/cadStore';
import { AdminPanel, AdminPageTitle } from '../AdminKit';

const TYPE_META = {
  direct: { label: 'Direct',    cls: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
  blast:  { label: 'Blast',     cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30'   },
  group:  { label: 'Group',     cls: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'       },
};

function TypeBadge({ type }) {
  const m = TYPE_META[type] || { label: type || 'System', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.3px] rounded-full border ${m.cls}`}>
      {m.label}
    </span>
  );
}

export default function MessageLogs() {
  const { state } = useCAD();
  const { messageLog = [] } = state;

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messageLog.filter(m => {
      if (typeFilter !== 'All' && m.type !== typeFilter) return false;
      if (q && !m.from?.toLowerCase().includes(q) && !m.subject?.toLowerCase().includes(q) && !m.to?.toLowerCase().includes(q) && !m.body?.toLowerCase().includes(q)
        && !String(m.fromDiscordId || '').includes(q) && !String(m.toDiscordId || '').includes(q)) return false;
      return true;
    });
  }, [messageLog, search, typeFilter]);

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 font-ui">
      <AdminPageTitle>Message Logs</AdminPageTitle>

      {/* Filters */}
      <AdminPanel title="Filters">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-app-input border border-border-base rounded-lg px-3 py-2">
            <MdSearch size={14} className="text-slate-500 shrink-0" />
            <input
              className="flex-1 min-w-0 bg-transparent text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none"
              placeholder="Search by sender, recipient, subject, or Discord ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')}
                className="text-slate-600 hover:text-slate-300 cursor-pointer text-[11px] font-bold shrink-0" style={{ background: 'none', border: 'none' }}>✕</button>
            )}
          </div>
          <Select
            className="bg-app-input border border-border-base rounded-lg px-3 py-2 text-[12.5px] text-slate-200 outline-none cursor-pointer shrink-0"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="direct">Direct Messages</option>
            <option value="group">Group Threads</option>
            <option value="blast">Notification Blasts</option>
          </Select>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          {filtered.length} log entr{filtered.length !== 1 ? 'ies' : 'y'}
        </div>
      </AdminPanel>

      {/* Log table */}
      <AdminPanel title="Log Entries">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-slate-600">
            <MdMessage size={36} className="opacity-25" />
            <div className="text-[13px]">No messages logged yet.</div>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-auto max-h-[600px] -mx-4 -mb-4">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-[1]">
                  <tr>
                    {['Time', 'Type', 'From', 'To / Title', 'Subject', 'Preview'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500 bg-app-panel border-b border-border-base whitespace-nowrap first:rounded-tl-xl last:rounded-tr-xl">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, idx) => (
                    <tr key={m.id} className={idx % 2 === 0 ? '' : 'bg-white/[0.02]'}>
                      <td className="px-4 py-3 text-[11px] font-mono text-slate-500 border-b border-border-faint whitespace-nowrap">
                        {m.timestamp}
                      </td>
                      <td className="px-4 py-3 border-b border-border-faint">
                        <TypeBadge type={m.type} />
                      </td>
                      <td className="px-4 py-3 border-b border-border-faint">
                        <div className="flex items-center gap-1.5">
                          {m.type === 'blast' ? <MdCampaign size={13} className="text-amber-400 shrink-0" /> : <MdShield size={13} className="text-violet-400 shrink-0" />}
                          <span className="text-[12px] text-slate-200 whitespace-nowrap">{m.from}</span>
                        </div>
                        {m.fromBadge && <div className="text-[10px] font-mono text-slate-500 pl-5">{m.fromBadge}</div>}
                        {m.fromDiscordId && <div className="text-[10px] font-mono text-slate-600 pl-5">ID {m.fromDiscordId}</div>}
                      </td>
                      <td className="px-4 py-3 border-b border-border-faint text-[12px] text-slate-300 whitespace-nowrap">
                        {m.type === 'blast' ? <span className="text-amber-400 font-semibold">{m.subject}</span> : (m.to || '—')}
                        {m.toDiscordId && <div className="text-[10px] font-mono text-slate-600">ID {m.toDiscordId}</div>}
                      </td>
                      <td className="px-4 py-3 border-b border-border-faint text-[12px] text-slate-200 max-w-[160px] truncate">
                        {m.subject}
                      </td>
                      <td className="px-4 py-3 border-b border-border-faint text-[11px] text-slate-500 max-w-[200px] truncate">
                        {m.body}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="block sm:hidden flex flex-col gap-2 max-h-[70vh] overflow-y-auto">
              {filtered.map(m => (
                <div key={m.id} className="bg-app-card/60 border border-border-faint rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TypeBadge type={m.type} />
                    <span className="font-mono text-[10px] text-slate-500 ml-auto">{m.timestamp}</span>
                  </div>
                  <div className="text-[13px] font-bold text-white mb-1">{m.subject}</div>
                  {m.body && <div className="text-[11px] text-slate-400 leading-relaxed mb-2 line-clamp-2">{m.body}</div>}
                  <div className="text-[10.5px] text-slate-500 border-t border-border-faint pt-1.5 mt-1">
                    From: <span className="text-slate-300 font-medium">{m.from}</span>
                    {m.to && <> → <span className="text-slate-300 font-medium">{m.to}</span></>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </AdminPanel>
    </div>
  );
}
