import { useState, useMemo } from 'react';
import Select from '../../../components/ui/Select';
import { useCAD } from '../../../store/cadStore';
import {
  AdminPanel, SonTable, SonRow, SonCell, SonSearch, EmptyState, ADMIN, SON_INPUT,
} from '../AdminKit';

export default function Logs() {
  const { state } = useCAD();
  const { auditLog } = state;

  const modules = useMemo(() => ['ALL', ...Array.from(new Set(auditLog.map(l => l.module)))], [auditLog]);
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [query, setQuery] = useState('');

  const q = query.toLowerCase();
  const filtered = auditLog.filter(l =>
    (moduleFilter === 'ALL' || l.module === moduleFilter) &&
    (!query || l.action.toLowerCase().includes(q) || (l.user || '').toLowerCase().includes(q) || String(l.discordId || '').includes(query)));

  return (
    <AdminPanel
      title="Master Audit Log"
      subtitle={`${filtered.length} of ${auditLog.length} entries`}
      right={<>
        <Select style={{ ...SON_INPUT, width: 150 }} value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}>
          {modules.map(m => <option key={m}>{m}</option>)}
        </Select>
        <SonSearch value={query} onChange={setQuery} placeholder="Search action, user, or Discord ID…" />
      </>}
    >
      {filtered.length === 0 ? <EmptyState>No log entries match.</EmptyState> : (
        <SonTable columns={[
          { label: 'ID', width: 70 }, { label: 'Time', width: 180 }, { label: 'Module', width: 140 }, { label: 'Action' }, { label: 'User', width: 200 }, { label: 'Discord ID', width: 160 },
        ]}>
          {filtered.map((l, i) => (
            <SonRow key={l.id} i={i}>
              <SonCell mono color={ADMIN.textMute}>{l.id}</SonCell>
              <SonCell mono color={ADMIN.textDim}>{l.timestamp}</SonCell>
              <SonCell><span style={{ color: ADMIN.red, fontWeight: 700, fontSize: 12 }}>{l.module}</span></SonCell>
              <SonCell>{l.action}</SonCell>
              <SonCell color={ADMIN.textDim}>{l.user}</SonCell>
              <SonCell mono color={ADMIN.textMute}>{l.discordId || '—'}</SonCell>
            </SonRow>
          ))}
        </SonTable>
      )}
    </AdminPanel>
  );
}
