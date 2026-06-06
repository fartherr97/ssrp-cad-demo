import { useState } from 'react';
import Select from '../../../components/ui/Select';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import { useTabParam } from '../../../hooks/useTabParam';
import {
  AdminPanel, SonTable, SonRow, SonCell, SonButton, SonIconBtn, SON_INPUT, EmptyState,
} from '../AdminKit';
import { MdKeyboardArrowUp, MdKeyboardArrowDown, MdDelete, MdAdd } from 'react-icons/md';

const CATEGORIES = [
  { value: 'police', label: 'Police / LEO',  color: '#3a88e8' },
  { value: 'fire',   label: 'Fire / EMS',    color: '#ef4444' },
  { value: 'any',    label: 'Any / Other',   color: '#94a3b8' },
];

function CatBadge({ cat }) {
  const cfg = CATEGORIES.find(c => c.value === cat) || CATEGORIES[2];
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 8px',
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      color: cfg.color,
      background: `${cfg.color}18`,
      border: `1px solid ${cfg.color}44`,
    }}>
      {cfg.label}
    </span>
  );
}

export default function CallTypes() {
  const { state, dispatch } = useCAD();
  const toast = useToast();
  const callNatures = state.callNatures || [];

  const [name, setName]         = useState('');
  const [category, setCategory] = useTabParam('tab', 'police');

  const add = () => {
    if (!name.trim()) return;
    dispatch({ type: 'ADMIN_ADD', payload: { key: 'callNatures', item: { name: name.trim(), category } } });
    toast.success(`"${name.trim()}" added.`, { title: 'Call Type Added' });
    setName('');
  };

  return (
    <AdminPanel
      title="Call Types"
      subtitle="Call natures available in the dispatch drop-down. Changes take effect instantly in all CAD views."
    >
      {/* Add row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ ...SON_INPUT, flex: 1, minWidth: 200 }}
          placeholder="Call nature (e.g. Traffic Stop)"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <Select
          style={{ ...SON_INPUT, width: 160 }}
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </Select>
        <SonButton variant="red" onClick={add}><MdAdd size={16} /> Add</SonButton>
      </div>

      {callNatures.length === 0 ? (
        <EmptyState>No call types configured.</EmptyState>
      ) : (
        <SonTable columns={[
          { label: 'Order', width: 110 },
          { label: 'Call Nature' },
          { label: 'Category', width: 160 },
        ]}>
          {callNatures.map((n, i) => (
            <SonRow key={n.id} i={i}>
              <SonCell>
                <div style={{ display: 'flex', gap: 6 }}>
                  <SonIconBtn icon={MdKeyboardArrowUp}   title="Move up"
                    onClick={() => dispatch({ type: 'ADMIN_REORDER', payload: { key: 'callNatures', id: n.id, dir: -1 } })} />
                  <SonIconBtn icon={MdKeyboardArrowDown} title="Move down"
                    onClick={() => dispatch({ type: 'ADMIN_REORDER', payload: { key: 'callNatures', id: n.id, dir: 1 } })} />
                  <SonIconBtn icon={MdDelete} danger title="Delete"
                    onClick={() => {
                      dispatch({ type: 'ADMIN_REMOVE', payload: { key: 'callNatures', id: n.id } });
                      toast.success(`"${n.name}" removed.`, { title: 'Call Type Removed' });
                    }} />
                </div>
              </SonCell>
              <SonCell>
                <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{n.name}</span>
              </SonCell>
              <SonCell>
                <CatBadge cat={n.category} />
              </SonCell>
            </SonRow>
          ))}
        </SonTable>
      )}
    </AdminPanel>
  );
}
