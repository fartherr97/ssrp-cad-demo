import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import { AdminPageTitle, AdminPanel, SonButton, SonIconBtn } from '../AdminKit';
import { MdDeleteForever, MdWarningAmber, MdRestore, MdDownload, MdClose, MdHistory } from 'react-icons/md';

const CORE_TYPES = [
  { key: 'civilians',       label: 'Civilian Characters' },
  { key: 'vehicles',        label: 'Vehicle Registrations' },
  { key: 'warrants',        label: 'Warrants' },
  { key: 'criminalHistory', label: 'Criminal History' },
  { key: 'calls',           label: 'Dispatch Calls' },
  { key: 'dispatchLog',     label: 'Dispatch Logs' },
  { key: 'towLogs',         label: 'Tow Logs' },
  { key: 'auditLog',        label: 'Audit Logs' },
  { key: 'activeSessions',  label: 'Active Sessions' },
  { key: 'bannedUsers',     label: 'Banned Users' },
  { key: 'civilianFlags',   label: 'Civilian Flags' },
  { key: 'licensePoints',   label: 'License Points' },
];

function WipeBtn({ label, onWipe, toast }) {
  const handle = () => {
    if (window.confirm(`Delete ALL "${label}" records? A restorable backup is saved automatically.`)) {
      onWipe();
      toast.warning(`${label} wiped · backup saved.`);
    }
  };
  return (
    <button
      type="button"
      onClick={handle}
      className="press flex items-center justify-center text-center px-3 py-4 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-[11px] font-bold uppercase tracking-[0.6px] leading-[1.35] cursor-pointer transition-colors shadow-lg shadow-red-900/30 border border-red-500/40"
    >
      {label}
    </button>
  );
}

function WipeGrid({ children }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
      {children}
    </div>
  );
}

export default function WipeRecords() {
  const { state, dispatch } = useCAD();
  const { reportTemplates = [], recordTemplates = [], wipeBackups = [] } = state;
  const toast = useToast();

  const wipe = (target) => dispatch({ type: 'WIPE', payload: target });

  const restore = (b) => {
    dispatch({ type: 'RESTORE_BACKUP', payload: b.id });
    toast.success(`Restored ${b.label} (${b.count} item${b.count === 1 ? '' : 's'}).`, { title: 'Backup Restored' });
  };

  const download = (b) => {
    const blob = new Blob([JSON.stringify({ ...b, restoredFrom: 'SSRP CAD wipe backup' }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `wipe-backup-${b.target.replace(/[^a-z0-9]+/gi, '-')}-${b.id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <AdminPageTitle>
        <span className="inline-flex items-center gap-2">
          <MdDeleteForever size={20} className="text-red-400" />
          Wipe Records
        </span>
      </AdminPageTitle>

      {/* Warning banner */}
      <div className="mb-5 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-500/10 border border-red-500/30">
        <MdWarningAmber size={18} className="text-red-400 mt-0.5 shrink-0" />
        <div className="text-[12px] text-red-300 leading-relaxed">
          <span className="font-bold">Destructive action.</span> Wiped records are permanently deleted and cannot be restored. Use with caution.
        </div>
      </div>

      {/* Auto-saved backups */}
      {wipeBackups.length > 0 && (
        <AdminPanel title="Auto-Saved Backups" subtitle="Every wipe is snapshotted here — restore re-imports the data or download it as JSON.">
          <div className="flex flex-col gap-2">
            {wipeBackups.map(b => (
              <div key={b.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 border border-border-base bg-app-card/60 flex-wrap">
                <MdHistory size={16} className="text-brand-bright shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold text-cad-text truncate">
                    {b.label} <span className="text-slate-500 font-normal">· {b.count} item{b.count === 1 ? '' : 's'}</span>
                  </div>
                  <div className="text-[10.5px] text-slate-500 font-mono">{b.time}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <SonButton size="sm" variant="green" onClick={() => restore(b)}><MdRestore size={14} /> Restore</SonButton>
                  <SonIconBtn icon={MdDownload} title="Download JSON" onClick={() => download(b)} />
                  <SonIconBtn icon={MdClose} danger title="Discard backup" onClick={() => dispatch({ type: 'DELETE_BACKUP', payload: b.id })} />
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
      )}

      {/* Core data types */}
      <AdminPanel title="Core Records" subtitle="Base data stored for your community.">
        <WipeGrid>
          {CORE_TYPES.map(t => (
            <WipeBtn key={t.key} label={t.label} onWipe={() => wipe(t.key)} toast={toast} />
          ))}
        </WipeGrid>
      </AdminPanel>

      {/* Dynamic * report templates */}
      <AdminPanel
        title="Reports"
        subtitle="Wipe all submitted reports by type. New report templates you create will appear here automatically."
      >
        {reportTemplates.length === 0 ? (
          <div className="text-[12px] text-slate-500 italic">No report templates configured.</div>
        ) : (
          <WipeGrid>
            <WipeBtn label="All Reports" onWipe={() => wipe('allReports')} toast={toast} />
            {reportTemplates.map(t => (
              <WipeBtn key={t.id} label={t.name} onWipe={() => wipe(`report:${t.name}`)} toast={toast} />
            ))}
          </WipeGrid>
        )}
      </AdminPanel>

      {/* Dynamic * record templates */}
      <AdminPanel
        title="Records"
        subtitle="Wipe all saved records by type. New record templates you create will appear here automatically."
      >
        {recordTemplates.length === 0 ? (
          <div className="text-[12px] text-slate-500 italic">No record templates configured.</div>
        ) : (
          <WipeGrid>
            <WipeBtn label="All Records" onWipe={() => wipe('allRecords')} toast={toast} />
            {recordTemplates.map(t => (
              <WipeBtn key={t.id} label={t.name} onWipe={() => wipe(`record:${t.name}`)} toast={toast} />
            ))}
          </WipeGrid>
        )}
      </AdminPanel>
    </>
  );
}
