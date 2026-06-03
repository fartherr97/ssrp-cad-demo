import { useState } from 'react';
import { useCAD } from '../../../store/cadStore';
import { useToast } from '../../../contexts/ToastContext';
import { AdminPageTitle, AdminPanel, SonButton, ADMIN } from '../AdminKit';
import {
  MdApi, MdGamepad, MdMap, MdSync, MdVisibility, MdVisibilityOff,
  MdContentCopy, MdCheck, MdAdd, MdDelete, MdSave, MdRefresh,
  MdOpenInNew, MdWifi, MdStorage, MdExpandMore, MdChevronRight,
} from 'react-icons/md';

const TABS = [
  { id: 'api',      label: 'API',           Icon: MdApi     },
  { id: 'fivem',    label: 'FiveM',         Icon: MdGamepad },
  { id: 'erlc',     label: 'ER:LC',         Icon: MdGamepad },
  { id: 'dbsync',   label: 'Database Sync', Icon: MdStorage },
  { id: 'livemap',  label: 'Live Map',      Icon: MdMap     },
];

/* ── Toggle switch (inline style to avoid Tailwind JIT purge) ── */
function Toggle({ active, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!active)}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-0 shrink-0 ${active ? 'bg-brand' : 'bg-slate-700'}`}>
      <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
        style={{ transform: active ? 'translateX(1.25rem)' : 'translateX(0)' }} />
    </button>
  );
}

/* ── Copy-to-clipboard button ── */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button type="button" onClick={copy}
      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] cursor-pointer transition-all">
      {copied ? <MdCheck size={14} className="text-green-400" /> : <MdContentCopy size={14} />}
    </button>
  );
}

/* ══════════════════════════════════
   TAB: API
══════════════════════════════════ */
function ApiTab() {
  const { state } = useCAD();
  const cfg = state.inGameConfig || {};
  const communityId = state.communityConfig?.communityId || 'ssrp';
  const [showKey, setShowKey] = useState(false);

  const masked = '•'.repeat(20);

  return (
    <div className="flex flex-col gap-4">
      <div className="px-4 py-4 rounded-xl bg-app-elevated border border-border-base text-[12.5px] text-slate-400 leading-relaxed text-center">
        The Web API allows you to update unit locations in real time, trigger PANIC alerts, generate 911 calls, and more — all from in-game.
      </div>

      {/* Community ID row */}
      <div className="flex items-center gap-4 px-4 py-4 rounded-xl bg-app-elevated border border-border-base">
        <div className="w-10 h-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
          <MdStorage size={20} className="text-brand-bright" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500 mb-0.5">Community ID</div>
          <div className="text-[14px] font-bold text-white font-mono">{communityId}</div>
        </div>
        <CopyBtn text={communityId} />
      </div>

      {/* API Key row */}
      <div className="flex items-center gap-4 px-4 py-4 rounded-xl bg-app-elevated border border-border-base">
        <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
          <span className="text-red-400 text-[18px]">🔑</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.7px] text-slate-500 mb-0.5">API Key</div>
          <div className="text-[13px] font-mono text-slate-300 tracking-[0.15em] truncate">
            {showKey ? cfg.apiKey : masked}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={() => setShowKey(v => !v)}
            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-all">
            {showKey ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
          </button>
          {showKey && <CopyBtn text={cfg.apiKey} />}
        </div>
      </div>

    </div>
  );
}

/* ══════════════════════════════════
   SHARED: Setup wizard (FiveM / ER:LC)
══════════════════════════════════ */
function SetupWizard({ platform, steps, resourceUrl }) {
  return (
    <div className="flex flex-col gap-4">
      <AdminPanel title={`${platform} Plugin Setup`} subtitle={`Connect your ${platform} server to the CAD in 3 steps.`}>
        <ol className="flex flex-col gap-0">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              {/* timeline */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-7 h-7 rounded-full bg-brand/15 border border-brand/30 text-brand-bright text-[11px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                {i < steps.length - 1 && <div className="w-px flex-1 bg-border-faint my-1" />}
              </div>
              {/* content */}
              <div className="pb-5 flex-1 min-w-0 pt-0.5">
                <div className="text-[13px] font-semibold text-slate-200 mb-1">{step.title}</div>
                <div className="text-[12px] text-slate-500 leading-relaxed">{step.desc}</div>
                {step.action && (
                  <a href={step.action.url || '#'} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 mt-2.5 px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-bright text-white text-[12px] font-bold cursor-pointer transition-all">
                    {step.action.label} <MdOpenInNew size={12} />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </AdminPanel>

      {resourceUrl && resourceUrl !== '#' && (
        <AdminPanel title="Resources">
          <div className="flex flex-wrap gap-2">
            <a href={resourceUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-app-elevated border border-border-base text-[12px] font-semibold text-slate-300 hover:text-white hover:bg-white/[0.07] cursor-pointer transition-all">
              ⬇ Download Resource <MdOpenInNew size={12} className="text-slate-500" />
            </a>
          </div>
        </AdminPanel>
      )}
    </div>
  );
}

const FIVEM_STEPS = [
  {
    title: 'Get a FiveM Game Server',
    desc: 'You need a FiveM-compatible game server to run the CAD integration resource.',
    action: { label: 'Browse Hosting', url: 'https://zap-hosting.com' },
  },
  {
    title: 'Download & Install the Resource',
    desc: 'Download the SSRP CAD FiveM resource and place it in your server\'s resources folder. Ensure it is started in your server.cfg.',
    action: { label: 'Download Resource', url: '#' },
  },
  {
    title: 'Configure the Resource',
    desc: 'Open the config.lua file and enter your Community ID and API Key from the API tab. Restart your server.',
  },
  {
    title: 'Verify Connection',
    desc: 'Start your server and look for "CAD: Connected" in your server console. Officers will now have live location sync.',
  },
];

const ERLC_STEPS = [
  {
    title: 'Join the ER:LC Discord',
    desc: 'You must have an active ER:LC Private Server to use the integration.',
    action: { label: 'ER:LC Discord', url: '#' },
  },
  {
    title: 'Enable the Integration',
    desc: 'In your ER:LC Private Server settings, navigate to Integrations and enable the CAD webhook option.',
  },
  {
    title: 'Enter your API Key',
    desc: 'Paste your Community ID and API Key (found in the API tab) into the ER:LC integration settings panel.',
  },
  {
    title: 'Sync and Test',
    desc: 'Officers who join the ER:LC server will be automatically synced to the CAD. Test by having an officer go on duty.',
  },
];

/* ══════════════════════════════════
   TAB: LIVE MAP
══════════════════════════════════ */
const MAP_TYPES = ['CUSTOM', 'GTA V', 'FiveM Default', 'Sonoran County'];

function LiveMapTab() {
  const { state, dispatch } = useCAD();
  const cfg = state.inGameConfig || {};
  const [local, setLocal] = useState({
    liveMapEnabled: cfg.liveMapEnabled ?? true,
    staticUrlOnly: cfg.staticUrlOnly ?? false,
    mapType: cfg.mapType || 'CUSTOM',
    liveMapServers: cfg.liveMapServers || [],
  });
  const [saved, setSaved] = useState(false);

  const set = (key, val) => setLocal(p => ({ ...p, [key]: val }));

  const updateServer = (id, field, val) =>
    setLocal(p => ({ ...p, liveMapServers: p.liveMapServers.map(s => s.id === id ? { ...s, [field]: val } : s) }));

  const addServer = () =>
    setLocal(p => ({ ...p, liveMapServers: [...p.liveMapServers, { id: Date.now(), name: `Server ${p.liveMapServers.length + 1}`, ip: '', gamePort: 30120, outboundIp: '' }] }));

  const removeServer = (id) =>
    setLocal(p => ({ ...p, liveMapServers: p.liveMapServers.filter(s => s.id !== id) }));

  const save = () => {
    dispatch({ type: 'ADMIN_SET', payload: { key: 'inGameConfig', value: { ...cfg, ...local } } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const undo = () => setLocal({
    liveMapEnabled: cfg.liveMapEnabled ?? true,
    staticUrlOnly: cfg.staticUrlOnly ?? false,
    mapType: cfg.mapType || 'CUSTOM',
    liveMapServers: cfg.liveMapServers || [],
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="text-[12.5px] text-slate-400 leading-relaxed px-1">
        The integrated live map shows all online units, active calls, and player positions in real time.
        Enter your server details below to enable live data push.
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" onClick={() => set('liveMapEnabled', !local.liveMapEnabled)}
          className={`px-3.5 py-2 rounded-lg text-[12px] font-bold cursor-pointer transition-all border ${local.liveMapEnabled ? 'bg-green-600 hover:bg-green-500 border-green-500/50 text-white' : 'bg-app-elevated border-border-base text-slate-400 hover:text-slate-200'}`}>
          {local.liveMapEnabled ? '● ENABLED' : '○ DISABLED'}
        </button>
        <button type="button" onClick={undo}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-app-elevated border border-border-base text-[12px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer transition-all">
          <MdRefresh size={14} /> UNDO
        </button>
        <button type="button" onClick={save}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-bright text-white text-[12px] font-bold cursor-pointer transition-all">
          <MdSave size={14} /> {saved ? 'SAVED!' : 'SAVE'}
        </button>
      </div>

      <AdminPanel title="Map Settings">
        {/* Static URL Only toggle */}
        <div className="flex items-center justify-between gap-4 py-2 border-b border-border-faint pb-4 mb-4">
          <div>
            <div className="text-[13px] font-semibold text-slate-200">Static URL Only</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Use a fixed URL for the live map embed instead of auto-detection.</div>
          </div>
          <Toggle active={local.staticUrlOnly} onChange={v => set('staticUrlOnly', v)} />
        </div>

        {/* Map type */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[13px] font-semibold text-slate-200">Available Maps</div>
            <div className="text-[11px] text-slate-500 mt-0.5">The map background to use in the live map view.</div>
          </div>
          <select
            value={local.mapType}
            onChange={e => set('mapType', e.target.value)}
            className="bg-app-input border border-border-base rounded-lg px-3 py-1.5 text-[12.5px] text-slate-200 outline-none focus:border-brand/60 cursor-pointer min-w-[140px]"
          >
            {MAP_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </AdminPanel>

      {/* Server list */}
      <AdminPanel title="Game Servers"
        subtitle="Add each game server that should push live data to the CAD."
        right={
          <button type="button" onClick={addServer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand/10 border border-brand/25 text-brand-bright text-[11.5px] font-bold cursor-pointer hover:bg-brand/20 transition-all">
            <MdAdd size={14} /> Add Server
          </button>
        }
      >
        {local.liveMapServers.length === 0 ? (
          <div className="text-center py-4 text-[12px] text-slate-500">No servers added. Click Add Server to begin.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {local.liveMapServers.map((s, i) => (
              <div key={s.id} className="rounded-xl border border-border-base bg-app-elevated overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border-faint bg-white/[0.02]">
                  <MdWifi size={14} className="text-slate-500 shrink-0" />
                  <input
                    className="flex-1 bg-transparent text-[12.5px] font-semibold text-slate-200 outline-none placeholder:text-slate-600"
                    value={s.name}
                    onChange={e => updateServer(s.id, 'name', e.target.value)}
                    placeholder={`Server ${i + 1}`}
                  />
                  <button type="button" onClick={() => removeServer(s.id)}
                    className="text-slate-600 hover:text-red-400 cursor-pointer transition-colors">
                    <MdDelete size={15} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 p-3">
                  <div>
                    <label className="block text-[9.5px] font-bold uppercase tracking-[0.5px] text-slate-600 mb-1">IP Address</label>
                    <input
                      className="w-full bg-app-input border border-border-base rounded-lg px-2.5 py-1.5 text-[12px] text-slate-200 font-mono placeholder:text-slate-600 outline-none focus:border-brand/60 transition-all"
                      value={s.ip}
                      onChange={e => updateServer(s.id, 'ip', e.target.value)}
                      placeholder="40.160.51.62"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] font-bold uppercase tracking-[0.5px] text-slate-600 mb-1">Game Port</label>
                    <input
                      className="w-full bg-app-input border border-border-base rounded-lg px-2.5 py-1.5 text-[12px] text-slate-200 font-mono placeholder:text-slate-600 outline-none focus:border-brand/60 transition-all"
                      value={s.gamePort}
                      onChange={e => updateServer(s.id, 'gamePort', e.target.value)}
                      placeholder="30120"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[9.5px] font-bold uppercase tracking-[0.5px] text-slate-600 mb-1">Outbound IP (if different)</label>
                    <input
                      className="w-full bg-app-input border border-border-base rounded-lg px-2.5 py-1.5 text-[12px] text-slate-200 font-mono placeholder:text-slate-600 outline-none focus:border-brand/60 transition-all"
                      value={s.outboundIp}
                      onChange={e => updateServer(s.id, 'outboundIp', e.target.value)}
                      placeholder="Leave blank if same as IP"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}

/* ══════════════════════════════════
   TAB: DATABASE SYNC
══════════════════════════════════ */
const CHAR_MAPPING = [
  { cad: 'First Name',    col: 'firstname',    table: 'users' },
  { cad: 'Last Name',     col: 'lastname',     table: 'users' },
  { cad: 'Date of Birth', col: 'dateofbirth',  table: 'users' },
  { cad: 'Gender',        col: 'gender',       table: 'users' },
  { cad: 'Job',           col: 'job',          table: 'jobs'  },
];

const LICENSE_MAPPING = [
  { cad: 'Driver License', col: 'license',        table: 'users' },
  { cad: 'Weapon License', col: 'weapon_license',  table: 'users' },
  { cad: 'Pilot License',  col: 'pilot_license',   table: 'users' },
];

const VEHICLE_MAPPING = [
  { cad: 'Plate', col: 'plate',          table: 'owned_vehicles' },
  { cad: 'Model', col: 'model',          table: 'owned_vehicles' },
  { cad: 'Color', col: 'color',          table: 'owned_vehicles' },
  { cad: 'Owner', col: 'owner',          table: 'owned_vehicles' },
];

function MappingTable({ rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr style={{ background: 'rgba(0,0,0,0.25)' }}>
            {['CAD Field', 'SQL Column', 'Table'].map(h => (
              <th key={h} style={{
                textAlign: 'left', padding: '8px 14px',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.6px',
                textTransform: 'uppercase', color: ADMIN.textMute,
                borderBottom: `1px solid ${ADMIN.border}`,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ background: i % 2 ? ADMIN.rowAlt : ADMIN.row }}>
              <td style={{ padding: '8px 14px', color: ADMIN.text, borderBottom: `1px solid rgba(255,255,255,0.05)` }}>{r.cad}</td>
              <td style={{ padding: '8px 14px', color: '#7dd3fc', fontFamily: 'var(--font-mono)', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>{r.col}</td>
              <td style={{ padding: '8px 14px', color: ADMIN.textDim, fontFamily: 'var(--font-mono)', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>{r.table}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CollapsibleSection({ title, children, open, onToggle }) {
  return (
    <div style={{
      border: `1px solid ${ADMIN.border}`, borderRadius: 10,
      overflow: 'hidden', marginBottom: 10,
    }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, padding: '11px 16px', background: ADMIN.panel2,
          border: 'none', cursor: 'pointer', color: ADMIN.text,
          fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-ui)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MdStorage size={14} style={{ color: ADMIN.textMute, flexShrink: 0 }} />
          {title}
        </span>
        {open
          ? <MdExpandMore size={18} style={{ color: ADMIN.textDim, flexShrink: 0 }} />
          : <MdChevronRight size={18} style={{ color: ADMIN.textDim, flexShrink: 0 }} />
        }
      </button>
      {open && (
        <div style={{ background: ADMIN.panel, borderTop: `1px solid ${ADMIN.border}` }}>
          {children}
        </div>
      )}
    </div>
  );
}

const DB_INPUT = {
  width: '100%', background: '#0d1a2c', border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 8, color: '#dde6f1', padding: '9px 13px', fontSize: 13,
  fontFamily: 'var(--font-ui)', boxSizing: 'border-box', outline: 'none',
};

const DB_LABEL = {
  display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.5px',
  textTransform: 'uppercase', color: ADMIN.textMute, marginBottom: 5,
};

function DatabaseSyncTab() {
  const [creds, setCreds] = useState({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'essentialmode',
  });
  const [showPw, setShowPw]     = useState(false);
  const [testState, setTest]    = useState('idle'); // idle | testing | ok | fail
  const [dbSaved, setDbSaved]   = useState(false);
  const [open, setOpen]         = useState({ char: false, license: false, vehicle: false });

  const set = (k, v) => { setCreds(p => ({ ...p, [k]: v })); setDbSaved(false); };

  const testConn = () => {
    setTest('testing');
    setTimeout(() => setTest(Math.random() > 0.4 ? 'ok' : 'fail'), 1400);
  };

  const save = () => { setDbSaved(true); setTimeout(() => setDbSaved(false), 2500); };

  const toggle = (k) => setOpen(o => ({ ...o, [k]: !o[k] }));

  const testLabel = { idle: 'Test Connection', testing: 'Testing…', ok: '✓ Connected', fail: '✗ Failed' }[testState];
  const testColor = { idle: '#3d82f0', testing: ADMIN.textDim, ok: ADMIN.green, fail: '#ef4444' }[testState];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <AdminPanel title="SQL Connection Credentials" subtitle="Configure your database connection for player data sync.">
        {/* 2-col credentials grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 18 }}>
          {/* Host */}
          <div>
            <label style={DB_LABEL}>SQL Host</label>
            <input style={DB_INPUT} value={creds.host} onChange={e => set('host', e.target.value)} placeholder="localhost" />
          </div>
          {/* Port */}
          <div>
            <label style={DB_LABEL}>SQL Port</label>
            <input style={DB_INPUT} value={creds.port} onChange={e => set('port', e.target.value)} placeholder="3306" />
          </div>
          {/* User */}
          <div>
            <label style={DB_LABEL}>SQL User</label>
            <input style={DB_INPUT} value={creds.user} onChange={e => set('user', e.target.value)} placeholder="root" />
          </div>
          {/* Password */}
          <div>
            <label style={DB_LABEL}>SQL Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                style={{ ...DB_INPUT, paddingRight: 38 }}
                type={showPw ? 'text' : 'password'}
                value={creds.password}
                onChange={e => set('password', e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: 10, background: 'none', border: 'none',
                  cursor: 'pointer', color: ADMIN.textDim, display: 'flex', alignItems: 'center',
                }}
              >
                {showPw ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
              </button>
            </div>
          </div>
          {/* Database */}
          <div>
            <label style={DB_LABEL}>SQL Database</label>
            <input style={DB_INPUT} value={creds.database} onChange={e => set('database', e.target.value)} placeholder="essentialmode" />
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={testConn}
            disabled={testState === 'testing'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '9px 18px', borderRadius: 8, border: 'none',
              background: testColor, color: '#fff', fontSize: 13, fontWeight: 700,
              fontFamily: 'var(--font-ui)', cursor: testState === 'testing' ? 'default' : 'pointer',
              opacity: testState === 'testing' ? 0.7 : 1, transition: 'all .2s',
            }}
          >
            <MdWifi size={15} />
            {testLabel}
          </button>
          <button
            type="button"
            onClick={save}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '9px 18px', borderRadius: 8, border: 'none',
              background: dbSaved ? ADMIN.green : ADMIN.panel2,
              border: `1px solid ${dbSaved ? ADMIN.green : ADMIN.borderHi}`,
              color: dbSaved ? '#fff' : ADMIN.text, fontSize: 13, fontWeight: 700,
              fontFamily: 'var(--font-ui)', cursor: 'pointer', transition: 'all .2s',
            }}
          >
            <MdSave size={15} />
            {dbSaved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </AdminPanel>

      {/* Collapsible mapping sections */}
      <CollapsibleSection title="Character Mapping" open={open.char} onToggle={() => toggle('char')}>
        <MappingTable rows={CHAR_MAPPING} />
      </CollapsibleSection>

      <CollapsibleSection title="License Mapping" open={open.license} onToggle={() => toggle('license')}>
        <MappingTable rows={LICENSE_MAPPING} />
      </CollapsibleSection>

      <CollapsibleSection title="Vehicle Mapping" open={open.vehicle} onToggle={() => toggle('vehicle')}>
        <MappingTable rows={VEHICLE_MAPPING} />
      </CollapsibleSection>
    </div>
  );
}

/* ══════════════════════════════════
   ROOT COMPONENT
══════════════════════════════════ */
export default function InGame() {
  const [tab, setTab] = useState('api');

  return (
    <>
      <AdminPageTitle>
        <span className="inline-flex items-center gap-2">
          <MdGamepad size={20} className="text-brand-bright" /> In-Game Integration
        </span>
      </AdminPageTitle>

      {/* Tab bar */}
      <div className="flex gap-0.5 mb-5 bg-app-panel/80 border border-border-base rounded-xl p-1.5 overflow-x-auto">
        {TABS.map(t => {
          const on = tab === t.id;
          return (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-bold whitespace-nowrap cursor-pointer transition-all flex-1 justify-center
                ${on ? 'bg-brand/15 border border-brand/35 text-brand-bright' : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] border border-transparent'}`}>
              <t.Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'api'     && <ApiTab />}
      {tab === 'fivem'   && (
        <SetupWizard platform="FiveM" steps={FIVEM_STEPS} resourceUrl="#" />
      )}
      {tab === 'erlc'    && (
        <SetupWizard platform="ER:LC" steps={ERLC_STEPS} resourceUrl="#" />
      )}
      {tab === 'dbsync'  && <DatabaseSyncTab />}
      {tab === 'livemap' && <LiveMapTab />}
    </>
  );
}
