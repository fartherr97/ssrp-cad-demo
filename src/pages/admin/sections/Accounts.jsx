import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import {
  AdminPanel, SonTable, SonRow, SonCell, SonSearch, SonBadge, SonButton, EmptyState, ADMIN,
} from '../AdminKit';

const STATUS_COLOR = { ACTIVE: ADMIN.green, SUSPENDED: ADMIN.amber, BANNED: ADMIN.red };
const PER_PAGE = 6;

export default function Accounts() {
  const { state, dispatch } = useCAD();
  const { adminAccounts } = state;
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);

  const filtered = adminAccounts.filter(a =>
    (statusFilter === 'ALL' || a.status === statusFilter) &&
    (!query || a.username.toLowerCase().includes(query.toLowerCase()) || a.apiIds.some(id => id.includes(query))));

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  const cycleStatus = (a) => {
    const next = a.status === 'ACTIVE' ? 'SUSPENDED' : a.status === 'SUSPENDED' ? 'BANNED' : 'ACTIVE';
    dispatch({ type: 'ADMIN_UPDATE', payload: { key: 'adminAccounts', item: { id: a.id, status: next } } });
  };

  return (
    <AdminPanel
      title="User Accounts"
      subtitle={`${filtered.length} accounts`}
      right={<>
        {['ALL', 'ACTIVE', 'SUSPENDED', 'BANNED'].map(s => (
          <SonButton key={s} size="sm" variant={statusFilter === s ? 'red' : 'ghost'}
            onClick={() => { setStatusFilter(s); setPage(0); }}>{s}</SonButton>
        ))}
        <SonSearch value={query} onChange={v => { setQuery(v); setPage(0); }} placeholder="Search username / API ID…" />
      </>}
    >
      {filtered.length === 0 ? <EmptyState>No accounts match.</EmptyState> : (
        <>
          <SonTable columns={[
            { label: 'Username' }, { label: 'Status' }, { label: 'Permissions' },
            { label: 'Last Login' }, { label: 'Joined' }, { label: 'API IDs' },
          ]}>
            {pageItems.map((a, i) => (
              <SonRow key={a.id} i={i}>
                <SonCell bold>{a.username}</SonCell>
                <SonCell>
                  <span style={{ cursor: 'pointer' }} onClick={() => cycleStatus(a)} title="Click to change status">
                    <SonBadge color={STATUS_COLOR[a.status]}>{a.status}</SonBadge>
                  </span>
                </SonCell>
                <SonCell color={ADMIN.textDim}>
                  {a.permissions.length ? a.permissions.join(', ') : <span style={{ color: ADMIN.textMute }}>—</span>}
                </SonCell>
                <SonCell color={ADMIN.textDim} mono>{a.lastLogin}</SonCell>
                <SonCell color={ADMIN.textDim} mono>{a.joined}</SonCell>
                <SonCell mono color={ADMIN.textMute}>{a.apiIds.join(', ')}</SonCell>
              </SonRow>
            ))}
          </SonTable>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 14, color: ADMIN.textDim, fontSize: 12 }}>
            <span>{page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} of {filtered.length}</span>
            <SonButton size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹ Prev</SonButton>
            <span>{page + 1} / {pages}</span>
            <SonButton size="sm" variant="ghost" disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}>Next ›</SonButton>
          </div>
        </>
      )}
    </AdminPanel>
  );
}
