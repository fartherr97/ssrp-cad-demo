import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';
import {
  AdminPanel, SonTable, SonRow, SonCell, SonSearch, SonBadge, SonButton, EmptyState, ADMIN,
  usePager, Pager,
} from '../AdminKit';

const STATUS_COLOR = { ACTIVE: ADMIN.green, SUSPENDED: ADMIN.amber, BANNED: ADMIN.red };

export default function Accounts() {
  const { state, dispatch } = useCAD();
  const { adminAccounts } = state;
  const toast = useToast();
  const confirm = useConfirm();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = adminAccounts.filter(a =>
    (statusFilter === 'ALL' || a.status === statusFilter) &&
    (!query || a.username.toLowerCase().includes(query.toLowerCase()) || (a.discordIds || []).some(id => id.includes(query))));

  const pager = usePager(filtered, 10);

  const cycleStatus = async (a) => {
    const next = a.status === 'ACTIVE' ? 'SUSPENDED' : a.status === 'SUSPENDED' ? 'BANNED' : 'ACTIVE';
    if (next === 'SUSPENDED' || next === 'BANNED') {
      if (!(await confirm({
        title: next === 'BANNED' ? 'Ban account' : 'Suspend account',
        message: `Set ${a.username} to ${next}?`,
        confirmLabel: next === 'BANNED' ? 'Ban' : 'Suspend',
        danger: true,
      }))) return;
    }
    dispatch({ type: 'ADMIN_UPDATE', payload: { key: 'adminAccounts', item: { id: a.id, status: next } } });
    toast.success(`${a.username} set to ${next}.`);
  };

  return (
    <AdminPanel
      title="User Accounts"
      subtitle={`${filtered.length} accounts`}
      right={<>
        {['ALL', 'ACTIVE', 'SUSPENDED', 'BANNED'].map(s => (
          <SonButton key={s} size="sm" variant={statusFilter === s ? 'red' : 'ghost'}
            onClick={() => { setStatusFilter(s); pager.setPage(1); }}>{s}</SonButton>
        ))}
        <SonSearch value={query} onChange={v => { setQuery(v); pager.setPage(1); }} placeholder="Search username / Discord ID…" />
      </>}
    >
      {filtered.length === 0 ? <EmptyState>No accounts match.</EmptyState> : (
        <>
          <SonTable columns={[
            { label: 'Username' }, { label: 'Status' }, { label: 'Permissions' },
            { label: 'Last Login' }, { label: 'Joined' }, { label: 'Discord ID' },
          ]}>
            {pager.pageItems.map((a, i) => (
              <SonRow key={a.id} i={i}>
                <SonCell bold>{a.username}</SonCell>
                <SonCell>
                  <span style={{ cursor: 'pointer' }} role="button" tabIndex={0}
                    aria-label={`Change status for ${a.username} (currently ${a.status})`}
                    onClick={() => cycleStatus(a)} title="Click to change status">
                    <SonBadge color={STATUS_COLOR[a.status]}>{a.status}</SonBadge>
                  </span>
                </SonCell>
                <SonCell color={ADMIN.textDim}>
                  {a.permissions.length ? a.permissions.join(', ') : <span style={{ color: ADMIN.textMute }}>—</span>}
                </SonCell>
                <SonCell color={ADMIN.textDim} mono>{a.lastLogin}</SonCell>
                <SonCell color={ADMIN.textDim} mono>{a.joined}</SonCell>
                <SonCell mono color={ADMIN.textMute}>{(a.discordIds || []).join(', ')}</SonCell>
              </SonRow>
            ))}
          </SonTable>
          <Pager {...pager} />
        </>
      )}
    </AdminPanel>
  );
}
