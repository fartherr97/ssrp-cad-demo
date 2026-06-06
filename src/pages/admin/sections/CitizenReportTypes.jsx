import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import {
  AdminPanel, SonTable, SonRow, SonCell, SonButton, SonIconBtn, SON_INPUT, EmptyState,
} from '../AdminKit';
import { MdKeyboardArrowUp, MdKeyboardArrowDown, MdDelete, MdAdd } from 'react-icons/md';

const KEY = 'citizenReportTypes';

export default function CitizenReportTypes() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const types = state.citizenReportTypes || [];

  const [name, setName] = useState('');

  const add = () => {
    const v = name.trim();
    if (!v) { toast.error('Enter a report type name.'); return; }
    if (types.some(t => t.name.toLowerCase() === v.toLowerCase())) {
      toast.error(`"${v}" already exists.`);
      return;
    }
    dispatch({ type: 'ADMIN_ADD', payload: { key: KEY, item: { name: v } } });
    toast.success(`"${v}" added.`, { title: 'Report Type Added' });
    setName('');
  };

  return (
    <AdminPanel
      title="Citizen Report Types"
      subtitle="Non-emergency report types citizens can choose when filing a report from the civilian portal. An 'Other' free-text option is always offered automatically. Changes take effect instantly."
    >
      {/* Add row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ ...SON_INPUT, flex: 1, minWidth: 200 }}
          placeholder="Report type (e.g. Stolen Property)"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          maxLength={60}
        />
        <SonButton variant="red" onClick={add}><MdAdd size={16} /> Add</SonButton>
      </div>

      {types.length === 0 ? (
        <EmptyState>No citizen report types configured. Citizens will only see the "Other" option.</EmptyState>
      ) : (
        <SonTable columns={[
          { label: 'Order', width: 110 },
          { label: 'Report Type' },
        ]}>
          {types.map((t, i) => (
            <SonRow key={t.id} i={i}>
              <SonCell>
                <div style={{ display: 'flex', gap: 6 }}>
                  <SonIconBtn icon={MdKeyboardArrowUp}   title="Move up"
                    onClick={() => dispatch({ type: 'ADMIN_REORDER', payload: { key: KEY, id: t.id, dir: -1 } })} />
                  <SonIconBtn icon={MdKeyboardArrowDown} title="Move down"
                    onClick={() => dispatch({ type: 'ADMIN_REORDER', payload: { key: KEY, id: t.id, dir: 1 } })} />
                  <SonIconBtn icon={MdDelete} danger title="Delete"
                    onClick={() => {
                      dispatch({ type: 'ADMIN_REMOVE', payload: { key: KEY, id: t.id } });
                      toast.success(`"${t.name}" removed.`, { title: 'Report Type Removed' });
                    }} />
                </div>
              </SonCell>
              <SonCell>
                <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{t.name}</span>
              </SonCell>
            </SonRow>
          ))}
        </SonTable>
      )}
    </AdminPanel>
  );
}
