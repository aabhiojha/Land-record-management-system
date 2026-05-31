import {
  ArrowRightLeft,
  BadgeCheck,
  Bell,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileText,
  Filter,
  Fingerprint,
  Gavel,
  GitBranch,
  Home,
  Landmark,
  LockKeyhole,
  LogOut,
  Map,
  Menu,
  Search,
  ShieldCheck,
  UserRoundCog,
  UsersRound,
  X,
} from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

type ApiRole = 'CITIZEN' | 'MALPOT_OFFICER' | 'SUPER_ADMIN';
type Role = 'Citizen' | 'Malpot Officer' | 'Super Admin';
type Section = 'dashboard' | 'records' | 'transfers' | 'verification' | 'users';
type ApiError = { message: string; status?: number };

type AuthResponse = {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  role: ApiRole;
};

type UserResponse = {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  citizenshipNumber?: string;
  role: ApiRole;
  district?: string;
  isActive?: boolean;
  createdAt?: string;
};

type LandRecordResponse = {
  id: number;
  kittaNumber: string;
  areaSqMeters: number;
  district: string;
  municipality: string;
  wardNumber: number;
  landType: string;
  ownerId: number;
  ownerName: string;
  recordHash?: string;
  previousRecordHash?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type LandRecordRequest = {
  kittaNumber: string;
  areaSqMeters: number;
  district: string;
  municipality: string;
  wardNumber: number;
  landType: string;
  ownerId: number;
};

type TransferResponse = {
  id: number;
  landRecordId: number;
  kittaNumber?: string;
  sellerName?: string;
  buyerName?: string;
  status: string;
  initiatedAt?: string;
  officerVerifiedAt?: string;
  adminApprovedAt?: string;
  rejectionReason?: string;
  oldRecordHash?: string;
  newRecordHash?: string;
};

type TransferRequest = {
  landRecordId: number;
  buyerId: number;
};

type ProofStepResponse = {
  hash: string;
  position: string;
};

type VerificationResponse = {
  recordId: number;
  kittaNumber?: string;
  valid: boolean;
  computedHash?: string;
  storedHash?: string;
  merkleRootHash?: string;
  merkleProof?: ProofStepResponse[];
  message?: string;
};

type ChainVerificationResponse = {
  valid: boolean;
  totalRecords: number;
  brokenAtIndex?: number;
  message?: string;
};

type DashboardStat = {
  label: string;
  value: string;
  tone: string;
};

type AppData = {
  dashboard: DashboardStat[];
  records: LandRecordResponse[];
  transfers: TransferResponse[];
  users: UserResponse[];
  citizens: UserResponse[];
  chain?: ChainVerificationResponse;
  treeRoot?: Record<string, string>;
};

const roleLabels: Record<ApiRole, Role> = {
  CITIZEN: 'Citizen',
  MALPOT_OFFICER: 'Malpot Officer',
  SUPER_ADMIN: 'Super Admin',
};

const navItems: Array<{ id: Section; label: string; icon: typeof Home; roles: ApiRole[] }> = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['CITIZEN', 'MALPOT_OFFICER', 'SUPER_ADMIN'] },
  { id: 'records', label: 'Land records', icon: Map, roles: ['CITIZEN', 'MALPOT_OFFICER', 'SUPER_ADMIN'] },
  { id: 'transfers', label: 'Transfers', icon: ArrowRightLeft, roles: ['CITIZEN', 'MALPOT_OFFICER', 'SUPER_ADMIN'] },
  { id: 'verification', label: 'Verification', icon: ShieldCheck, roles: ['CITIZEN', 'MALPOT_OFFICER', 'SUPER_ADMIN'] },
  { id: 'users', label: 'Users', icon: UsersRound, roles: ['SUPER_ADMIN'] },
];

const defaultDashboard: Record<ApiRole, DashboardStat[]> = {
  CITIZEN: [
    { label: 'Owned parcels', value: '0', tone: 'blue' },
    { label: 'Active transfers', value: '0', tone: 'gold' },
    { label: 'Chain health', value: 'Live', tone: 'green' },
  ],
  MALPOT_OFFICER: [
    { label: 'Pending reviews', value: '0', tone: 'gold' },
    { label: 'Land records', value: '0', tone: 'blue' },
    { label: 'Chain health', value: 'Live', tone: 'green' },
  ],
  SUPER_ADMIN: [
    { label: 'Approval queue', value: '0', tone: 'gold' },
    { label: 'Registered users', value: '0', tone: 'blue' },
    { label: 'Chain health', value: 'Live', tone: 'green' },
  ],
};

const demoAccounts = [
  { label: 'Admin', email: 'admin@landrecord.gov.np', password: 'admin123' },
  { label: 'Officer', email: 'hari@malpot.gov.np', password: 'officer123' },
  { label: 'Citizen', email: 'ram@example.com', password: 'citizen123' },
];

const emptyData: AppData = {
  dashboard: [],
  records: [],
  transfers: [],
  users: [],
  citizens: [],
};

async function apiRequest<T>(path: string, token?: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, { ...options, headers });

  if (!response.ok) {
    const message = await response.text();
    throw { status: response.status, message: message || response.statusText } satisfies ApiError;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function titleCase(value: string) {
  return value
    .replaceAll('_', ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function compactHash(value?: string) {
  if (!value) return 'No hash';
  if (value.length <= 14) return value;
  return `${value.slice(0, 6)}...${value.slice(-6)}`;
}

function formatDate(value?: string) {
  if (!value) return 'Not recorded';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function dashboardStats(raw: Record<string, unknown>, role: ApiRole): DashboardStat[] {
  const entries = Object.entries(raw).filter(([, value]) => typeof value !== 'object');

  if (!entries.length) {
    return defaultDashboard[role];
  }

  return entries.slice(0, 6).map(([key, value], index) => ({
    label: titleCase(key),
    value: String(value ?? '0'),
    tone: ['blue', 'gold', 'green', 'red'][index % 4],
  }));
}

function transferStage(status: string) {
  const normalized = status.toUpperCase();
  if (normalized.includes('APPROVED')) return 'Admin approval';
  if (normalized.includes('VERIFIED')) return 'Officer verification';
  if (normalized.includes('REJECT')) return 'Rejected';
  return 'Citizen submitted';
}

function App() {
  const [session, setSession] = useState<AuthResponse | null>(() => {
    const stored = localStorage.getItem('nepal-land-session');
    return stored ? (JSON.parse(stored) as AuthResponse) : null;
  });
  const [section, setSection] = useState<Section>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [data, setData] = useState<AppData>(emptyData);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const role = session?.role ?? 'CITIZEN';
  const roleLabel = roleLabels[role];

  const visibleNav = useMemo(() => navItems.filter((item) => item.roles.includes(role)), [role]);

  const loadData = useCallback(async () => {
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const dashboardPath =
        role === 'SUPER_ADMIN'
          ? '/api/admin/dashboard'
          : role === 'MALPOT_OFFICER'
            ? '/api/officer/dashboard'
            : '/api/citizen/dashboard';
      const recordsPath =
        role === 'CITIZEN'
          ? '/api/citizen/my-records'
          : `/api/land-records${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ''}`;
      const transfersPath =
        role === 'SUPER_ADMIN'
          ? '/api/admin/transfers/pending'
          : role === 'MALPOT_OFFICER'
            ? '/api/officer/transfers/pending'
            : '/api/citizen/transfers';

      const [dashboard, records, transfers, chain, treeRoot, users, citizens] = await Promise.all([
        apiRequest<Record<string, unknown>>(dashboardPath, session.token),
        apiRequest<LandRecordResponse[]>(recordsPath, session.token),
        apiRequest<TransferResponse[]>(transfersPath, session.token),
        apiRequest<ChainVerificationResponse>('/api/verification/chain', session.token),
        apiRequest<Record<string, string>>('/api/verification/tree-root', session.token),
        role === 'SUPER_ADMIN'
          ? apiRequest<UserResponse[]>('/api/admin/users', session.token)
          : Promise.resolve([] as UserResponse[]),
        apiRequest<UserResponse[]>('/api/users/citizens', session.token).catch(() => [] as UserResponse[]),
      ]);

      setData({
        dashboard: dashboardStats(dashboard, role),
        records,
        transfers,
        users,
        citizens,
        chain,
        treeRoot,
      });
    } catch (caught) {
      const apiError = caught as ApiError;
      if (apiError.status === 401 || apiError.status === 403) {
        setError('Your session does not have access to one of these endpoints. Login with the matching role.');
      } else {
        setError(apiError.message || 'Could not load backend data.');
      }
    } finally {
      setLoading(false);
    }
  }, [query, role, session]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function handleLogin(nextSession: AuthResponse) {
    localStorage.setItem('nepal-land-session', JSON.stringify(nextSession));
    setSession(nextSession);
    setSection('dashboard');
  }

  function logout() {
    localStorage.removeItem('nepal-land-session');
    setSession(null);
    setData(emptyData);
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
        <div className="brand-lockup">
          <div className="seal" aria-hidden="true">
            <Landmark size={25} />
          </div>
          <div>
            <p className="eyebrow">Nepal Sarkar</p>
            <h1>Land Records</h1>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary navigation">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={section === item.id ? 'nav-item active' : 'nav-item'}
                key={item.id}
                onClick={() => {
                  setSection(item.id);
                  setMobileNavOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="office-card">
          <Building2 size={18} />
          <div>
            <strong>{session.fullName}</strong>
            <span>{roleLabel}</span>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <button
            className="icon-button mobile-only"
            aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setMobileNavOpen((value) => !value)}
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <form
            className="search-box"
            onSubmit={(event) => {
              event.preventDefault();
              setSection('records');
              void loadData();
            }}
          >
            <Search size={18} />
            <input
              aria-label="Search land records"
              placeholder="Search parcel ID, owner, document number"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>

          <div className="session-chip" aria-label="Current session">
            <strong>{session.email}</strong>
            <span>{roleLabel}</span>
          </div>

          <button className="icon-button" aria-label="Refresh backend data" onClick={() => void loadData()}>
            <Bell size={19} />
          </button>
          <button className="icon-button" aria-label="Log out" onClick={logout}>
            <LogOut size={19} />
          </button>
        </header>

        <section className="hero-band">
          <div>
            <p className="eyebrow">Digital land administration</p>
            <h2>{roleLabel} command center</h2>
            <p>
              Live parcel records, transfer workflows, users, and cryptographic verification from the backend running on
              localhost:8080.
            </p>
          </div>
          <div className="trust-panel" aria-label="System trust status">
            <ShieldCheck size={28} />
            <div>
              <strong>{data.chain?.valid ? 'Hash chain valid' : 'Hash chain status'}</strong>
              <span>{data.chain?.message ?? 'Loaded from /api/verification/chain'}</span>
            </div>
          </div>
        </section>

        {error && <div className="notice error">{error}</div>}
        {loading && <div className="notice">Loading live backend data...</div>}

        {section === 'dashboard' && <Dashboard data={data} role={role} />}
        {section === 'records' && (
          <Records
            role={role}
            token={session.token}
            records={data.records}
            citizens={data.citizens}
            query={query}
            setQuery={setQuery}
            reload={loadData}
          />
        )}
        {section === 'transfers' && (
          <Transfers
            role={role}
            token={session.token}
            currentUserId={session.userId}
            records={data.records}
            citizens={data.citizens}
            transfers={data.transfers}
            reload={loadData}
          />
        )}
        {section === 'verification' && (
          <Verification token={session.token} records={data.records} chain={data.chain} treeRoot={data.treeRoot} />
        )}
        {section === 'users' && <Users users={data.users} citizens={data.citizens} />}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (session: AuthResponse) => void }) {
  const [email, setEmail] = useState('admin@landrecord.gov.np');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const auth = await apiRequest<AuthResponse>('/api/auth/login', undefined, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      onLogin(auth);
    } catch (caught) {
      const apiError = caught as ApiError;
      setError(apiError.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand-lockup login-brand">
          <div className="seal" aria-hidden="true">
            <Landmark size={25} />
          </div>
          <div>
            <p className="eyebrow">Nepal Sarkar</p>
            <h1>Land Records</h1>
          </div>
        </div>
        <h2>Sign in to the live registry</h2>
        <p>Uses `/api/auth/login`, stores the JWT locally, and sends it as a Bearer token to protected endpoints.</p>

        <form onSubmit={submit} className="login-form">
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <div className="notice error">{error}</div>}
          <button className="primary-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="demo-logins" aria-label="Default accounts">
          {demoAccounts.map((account) => (
            <button
              className="outline-button"
              key={account.email}
              onClick={() => {
                setEmail(account.email);
                setPassword(account.password);
              }}
            >
              {account.label}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function Dashboard({ data, role }: { data: AppData; role: ApiRole }) {
  const stats = data.dashboard.length ? data.dashboard : defaultDashboard[role];

  return (
    <div className="content-grid">
      <section className="stat-grid" aria-label="Dashboard summary">
        {stats.map((stat) => (
          <article className={`stat-card tone-${stat.tone}`} key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="panel wide">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Priority queue</p>
            <h3>Work requiring attention</h3>
          </div>
          <button className="subtle-button">
            View all <ChevronRight size={16} />
          </button>
        </div>
        <div className="task-list">
          <Task
            icon={ClipboardCheck}
            title={`${data.transfers.length} transfer item${data.transfers.length === 1 ? '' : 's'}`}
            meta="Loaded from the role-specific transfer endpoint"
            tone="gold"
          />
          <Task
            icon={Gavel}
            title={`${data.records.length} active record${data.records.length === 1 ? '' : 's'}`}
            meta="Loaded from land-record endpoints"
            tone="blue"
          />
          <Task
            icon={BookOpenCheck}
            title={data.chain?.valid ? 'Hash chain is valid' : 'Hash chain check available'}
            meta={data.chain?.message ?? 'Verification endpoint ready'}
            tone={data.chain?.valid ? 'green' : 'red'}
          />
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Office map</p>
            <h3>Parcel activity</h3>
          </div>
        </div>
        <div className="parcel-map" aria-label="Stylized cadastral parcel activity map">
          {data.records.slice(0, 3).map((record, index) => (
            <span className={`plot plot-${['a', 'b', 'c'][index]}`} key={record.id}>
              {record.kittaNumber}
            </span>
          ))}
          {!data.records.length && <span className="plot plot-a">No records</span>}
        </div>
      </section>
    </div>
  );
}

function Records({
  role,
  token,
  records,
  citizens,
  query,
  setQuery,
  reload,
}: {
  role: ApiRole;
  token: string;
  records: LandRecordResponse[];
  citizens: UserResponse[];
  query: string;
  setQuery: (query: string) => void;
  reload: () => Promise<void>;
}) {
  const [showCreate, setShowCreate] = useState(role === 'MALPOT_OFFICER');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    kittaNumber: '',
    areaSqMeters: '',
    district: '',
    municipality: '',
    wardNumber: '',
    landType: 'AABAD',
    ownerId: '',
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function createRecord(event: FormEvent) {
    event.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    const payload: LandRecordRequest = {
      kittaNumber: form.kittaNumber.trim(),
      areaSqMeters: Number(form.areaSqMeters),
      district: form.district.trim(),
      municipality: form.municipality.trim(),
      wardNumber: Number(form.wardNumber),
      landType: form.landType,
      ownerId: Number(form.ownerId),
    };

    if (
      !payload.kittaNumber ||
      !payload.district ||
      !payload.municipality ||
      !payload.landType ||
      !payload.ownerId ||
      !payload.areaSqMeters ||
      !payload.wardNumber
    ) {
      setCreateError('Fill all required land record fields before registering.');
      return;
    }

    setCreating(true);

    try {
      const created = await apiRequest<LandRecordResponse>('/api/officer/land-records', token, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setForm({
        kittaNumber: '',
        areaSqMeters: '',
        district: '',
        municipality: '',
        wardNumber: '',
        landType: 'AABAD',
        ownerId: '',
      });
      setCreateSuccess(`Registered land record LR-${created.id} for ${created.ownerName}.`);
      await reload();
    } catch (caught) {
      const apiError = caught as ApiError;
      setCreateError(apiError.message || 'Failed to create land record.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="panel full">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Registry</p>
          <h3>Land records</h3>
        </div>
        {role === 'MALPOT_OFFICER' && (
          <button className="primary-button" onClick={() => setShowCreate((value) => !value)}>
            <FileText size={17} />
            {showCreate ? 'Hide form' : 'Register land record'}
          </button>
        )}
      </div>

      {role === 'MALPOT_OFFICER' && showCreate && (
        <form className="create-record-form" onSubmit={createRecord}>
          <div className="form-heading">
            <div>
              <p className="eyebrow">Officer registration</p>
              <h4>New land record</h4>
            </div>
            <span>POST /api/officer/land-records</span>
          </div>

          {createError && <div className="notice error">{createError}</div>}
          {createSuccess && <div className="notice">{createSuccess}</div>}

          <div className="form-grid">
            <label>
              Kitta number
              <input
                required
                placeholder="KTM-1001"
                value={form.kittaNumber}
                onChange={(event) => updateField('kittaNumber', event.target.value)}
              />
            </label>
            <label>
              Area sq. meters
              <input
                required
                min="1"
                type="number"
                placeholder="500"
                value={form.areaSqMeters}
                onChange={(event) => updateField('areaSqMeters', event.target.value)}
              />
            </label>
            <label>
              District
              <input
                required
                placeholder="Kathmandu"
                value={form.district}
                onChange={(event) => updateField('district', event.target.value)}
              />
            </label>
            <label>
              Municipality
              <input
                required
                placeholder="Kathmandu Metropolitan City"
                value={form.municipality}
                onChange={(event) => updateField('municipality', event.target.value)}
              />
            </label>
            <label>
              Ward number
              <input
                required
                min="1"
                type="number"
                placeholder="10"
                value={form.wardNumber}
                onChange={(event) => updateField('wardNumber', event.target.value)}
              />
            </label>
            <label>
              Land type
              <select value={form.landType} onChange={(event) => updateField('landType', event.target.value)}>
                <option value="AABAD">Aabad (Residential)</option>
                <option value="KHET">Khet (Agricultural)</option>
                <option value="PAKHO">Pakho (Barren)</option>
              </select>
            </label>
            <label className="form-wide">
              Owner
              <select
                required
                value={form.ownerId}
                onChange={(event) => updateField('ownerId', event.target.value)}
              >
                <option value="">Select citizen owner</option>
                {citizens.map((citizen) => (
                  <option key={citizen.id} value={citizen.id}>
                    {citizen.fullName} ({citizen.citizenshipNumber || citizen.email})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button className="primary-button" disabled={creating || !citizens.length}>
              {creating ? 'Registering...' : 'Register land record'}
            </button>
            {!citizens.length && <span>No citizen users returned from /api/users/citizens.</span>}
          </div>
        </form>
      )}

      <form
        className="toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          void reload();
        }}
      >
        <div className="mini-search">
          <Search size={16} />
          <input
            aria-label="Filter records"
            placeholder="Filter by owner or parcel"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <button className="outline-button">
          <Filter size={16} />
          Apply
        </button>
      </form>

      <div className="record-table" role="table" aria-label="Land records">
        <div className="table-row table-head" role="row">
          <span>Record</span>
          <span>Owner</span>
          <span>Parcel</span>
          <span>Area</span>
          <span>Status</span>
          <span>Integrity</span>
        </div>
        {records.map((record) => (
          <div className="table-row" role="row" key={record.id}>
            <strong>LR-{record.id}</strong>
            <span>{record.ownerName}</span>
            <span>
              {record.kittaNumber}
              <small>
                {record.municipality}, ward {record.wardNumber}, {record.district}
              </small>
            </span>
            <span>{record.areaSqMeters} sq m</span>
            <Status label={record.isActive === false ? 'Transfer locked' : 'Verified'} />
            <span className="hash">
              <Fingerprint size={15} /> {compactHash(record.recordHash)}
            </span>
          </div>
        ))}
      </div>

      {!records.length && <EmptyState title="No land records returned" text="The backend returned an empty record list." />}
    </section>
  );
}

function Transfers({
  role,
  token,
  currentUserId,
  records,
  citizens,
  transfers,
  reload,
}: {
  role: ApiRole;
  token: string;
  currentUserId: number;
  records: LandRecordResponse[];
  citizens: UserResponse[];
  transfers: TransferResponse[];
  reload: () => Promise<void>;
}) {
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showInitiate, setShowInitiate] = useState(role === 'CITIZEN');
  const [creating, setCreating] = useState(false);
  const [transferForm, setTransferForm] = useState({
    landRecordId: '',
    buyerId: '',
  });

  const buyerOptions = citizens.filter((citizen) => citizen.id !== currentUserId);

  async function runAction(path: string, body?: object) {
    setError(null);
    setSuccess(null);
    try {
      await apiRequest<TransferResponse>(path, token, {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      });
      await reload();
    } catch (caught) {
      const apiError = caught as ApiError;
      setError(apiError.message || 'Transfer action failed.');
    } finally {
      setBusyId(null);
    }
  }

  async function initiateTransfer(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const payload: TransferRequest = {
      landRecordId: Number(transferForm.landRecordId),
      buyerId: Number(transferForm.buyerId),
    };

    if (!payload.landRecordId || !payload.buyerId) {
      setError('Select both the land record and the buyer before initiating transfer.');
      return;
    }

    setCreating(true);

    try {
      const created = await apiRequest<TransferResponse>('/api/citizen/transfers', token, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setTransferForm({ landRecordId: '', buyerId: '' });
      setSuccess(`Transfer TR-${created.id} was initiated and sent for officer verification.`);
      await reload();
    } catch (caught) {
      const apiError = caught as ApiError;
      setError(apiError.message || 'Failed to initiate ownership transfer.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="panel full">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Workflow</p>
          <h3>Ownership transfers</h3>
        </div>
        {role === 'CITIZEN' && (
          <button className="primary-button" onClick={() => setShowInitiate((value) => !value)}>
            <ArrowRightLeft size={17} />
            {showInitiate ? 'Hide form' : 'Transfer ownership'}
          </button>
        )}
      </div>

      {role === 'CITIZEN' && showInitiate && (
        <form className="create-record-form" onSubmit={initiateTransfer}>
          <div className="form-heading">
            <div>
              <p className="eyebrow">Citizen request</p>
              <h4>Transfer land ownership</h4>
            </div>
            <span>POST /api/citizen/transfers</span>
          </div>

          <div className="form-grid">
            <label>
              Land record
              <select
                required
                value={transferForm.landRecordId}
                onChange={(event) =>
                  setTransferForm((current) => ({ ...current, landRecordId: event.target.value }))
                }
              >
                <option value="">Select your land record</option>
                {records.map((record) => (
                  <option key={record.id} value={record.id}>
                    LR-{record.id} - {record.kittaNumber}, {record.district}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Buyer
              <select
                required
                value={transferForm.buyerId}
                onChange={(event) => setTransferForm((current) => ({ ...current, buyerId: event.target.value }))}
              >
                <option value="">Select buyer citizen</option>
                {buyerOptions.map((citizen) => (
                  <option key={citizen.id} value={citizen.id}>
                    {citizen.fullName} ({citizen.citizenshipNumber || citizen.email})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button className="primary-button" disabled={creating || !records.length || !buyerOptions.length}>
              {creating ? 'Initiating...' : 'Initiate transfer'}
            </button>
            {!records.length && <span>No owned land records returned from /api/citizen/my-records.</span>}
            {!buyerOptions.length && <span>No eligible buyer citizens returned from /api/users/citizens.</span>}
          </div>
        </form>
      )}

      {error && <div className="notice error">{error}</div>}
      {success && <div className="notice">{success}</div>}
      <div className="transfer-lanes">
        {transfers.map((transfer) => (
          <article className="transfer-card" key={transfer.id}>
            <div className="transfer-topline">
              <strong>TR-{transfer.id}</strong>
              <span>{formatDate(transfer.initiatedAt)}</span>
            </div>
            <div className="people-flow">
              <span>{transfer.sellerName ?? 'Seller'}</span>
              <ArrowRightLeft size={16} />
              <span>{transfer.buyerName ?? 'Buyer'}</span>
            </div>
            <div className="stepper" aria-label={`Transfer stage ${transfer.status}`}>
              {['Citizen submitted', 'Officer verification', 'Admin approval'].map((step) => (
                <span className={step === transferStage(transfer.status) ? 'current' : ''} key={step}>
                  {step}
                </span>
              ))}
              {transfer.status.toUpperCase().includes('REJECT') && <span className="current">Rejected</span>}
            </div>
            <div className="transfer-actions">
              <Status label={titleCase(transfer.status)} />
              {role === 'MALPOT_OFFICER' && (
                <button
                  className="outline-button"
                  disabled={busyId === transfer.id}
                  onClick={() => {
                    setBusyId(transfer.id);
                    void runAction(`/api/officer/transfers/${transfer.id}/verify`);
                  }}
                >
                  Verify
                </button>
              )}
              {role === 'SUPER_ADMIN' && (
                <>
                  <button
                    className="outline-button"
                    disabled={busyId === transfer.id}
                    onClick={() => {
                      setBusyId(transfer.id);
                      void runAction(`/api/admin/transfers/${transfer.id}/approve`);
                    }}
                  >
                    Approve
                  </button>
                  <button
                    className="outline-button danger"
                    disabled={busyId === transfer.id}
                    onClick={() => {
                      const reason = window.prompt('Reason for rejection');
                      if (!reason) return;
                      setBusyId(transfer.id);
                      void runAction(`/api/admin/transfers/${transfer.id}/reject`, { reason });
                    }}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
      {!transfers.length && <EmptyState title="No transfers returned" text="The role-specific transfer queue is empty." />}
    </section>
  );
}

function Verification({
  token,
  records,
  chain,
  treeRoot,
}: {
  token: string;
  records: LandRecordResponse[];
  chain?: ChainVerificationResponse;
  treeRoot?: Record<string, string>;
}) {
  const [recordId, setRecordId] = useState(records[0]?.id ? String(records[0].id) : '');
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [proof, setProof] = useState<ProofStepResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!recordId && records[0]?.id) {
      setRecordId(String(records[0].id));
    }
  }, [recordId, records]);

  async function verifyRecord() {
    if (!recordId) return;
    setLoading(true);
    setError(null);

    try {
      const [verification, proofPath] = await Promise.all([
        apiRequest<VerificationResponse>(`/api/verification/record/${recordId}`, token),
        apiRequest<ProofStepResponse[]>(`/api/verification/record/${recordId}/proof`, token),
      ]);
      setResult(verification);
      setProof(proofPath);
    } catch (caught) {
      const apiError = caught as ApiError;
      setError(apiError.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  }

  const proofSteps = proof.length ? proof : result?.merkleProof ?? [];
  const rootHash = result?.merkleRootHash ?? treeRoot?.rootHash ?? Object.values(treeRoot ?? {})[0];

  return (
    <div className="content-grid">
      <section className="panel wide">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Cryptographic proof</p>
            <h3>Record integrity verification</h3>
          </div>
          <span className="trust-chip">
            <CheckCircle2 size={16} /> {chain?.valid ? 'Chain valid' : 'Check chain'}
          </span>
        </div>

        <form
          className="toolbar"
          onSubmit={(event) => {
            event.preventDefault();
            void verifyRecord();
          }}
        >
          <div className="mini-search">
            <Fingerprint size={16} />
            <input
              aria-label="Record ID to verify"
              placeholder="Record ID"
              value={recordId}
              onChange={(event) => setRecordId(event.target.value)}
            />
          </div>
          <button className="outline-button" disabled={loading || !recordId}>
            {loading ? 'Verifying...' : 'Verify record'}
          </button>
        </form>

        {error && <div className="notice error">{error}</div>}

        <div className="proof-path">
          {proofSteps.map((step, index) => (
            <div className="proof-step" key={`${step.hash}-${index}`}>
              <div className="proof-node">{index + 1}</div>
              <div>
                <strong>{titleCase(step.position || `Proof step ${index + 1}`)}</strong>
                <span>{compactHash(step.hash)}</span>
              </div>
            </div>
          ))}
          {!proofSteps.length && (
            <EmptyState title="No proof loaded" text="Enter a record ID and call the verification endpoints." />
          )}
        </div>

        <MerkleTreeVisualization result={result} proofSteps={proofSteps} rootHash={rootHash} />
      </section>

      <section className="panel">
        <p className="eyebrow">Final result</p>
        <div className="verification-result">
          <BadgeCheck size={42} />
          <h3>{result ? (result.valid ? 'Record is authentic' : 'Record mismatch') : 'Ready to verify'}</h3>
          <p>{result?.message ?? chain?.message ?? 'Merkle proof, record hash, and chain status appear here.'}</p>
          <small>Root: {compactHash(rootHash)}</small>
        </div>
      </section>
    </div>
  );
}

function MerkleTreeVisualization({
  result,
  proofSteps,
  rootHash,
}: {
  result: VerificationResponse | null;
  proofSteps: ProofStepResponse[];
  rootHash?: string;
}) {
  if (!result && !proofSteps.length) {
    return (
      <div className="merkle-board">
        <div className="merkle-title">
          <GitBranch size={18} />
          <div>
            <strong>Merkle tree path</strong>
            <span>Verify a record to render its proof path.</span>
          </div>
        </div>
        <div className="merkle-empty">
          <div className="tree-node leaf">Record hash</div>
          <div className="tree-connector" />
          <div className="tree-node root">Merkle root</div>
        </div>
      </div>
    );
  }

  const leafHash = result?.computedHash ?? result?.storedHash;

  return (
    <div className="merkle-board">
      <div className="merkle-title">
        <GitBranch size={18} />
        <div>
          <strong>Merkle tree path</strong>
          <span>Leaf hash combines with each sibling proof hash until it reaches the trusted root.</span>
        </div>
      </div>

      <div className="merkle-tree" aria-label="Merkle tree proof visualization">
        <div className="tree-layer">
          <div className="tree-node leaf">
            <span>Record leaf</span>
            <strong>{compactHash(leafHash)}</strong>
          </div>
        </div>

        {proofSteps.map((step, index) => (
          <div className="tree-layer proof-layer" key={`${step.hash}-${index}`}>
            <div className="tree-connector" />
            <div className="tree-pair">
              <div className="tree-node current">
                <span>Current hash</span>
                <strong>{index === 0 ? compactHash(leafHash) : `Level ${index}`}</strong>
              </div>
              <div className="tree-node sibling">
                <span>{titleCase(step.position || 'Sibling')}</span>
                <strong>{compactHash(step.hash)}</strong>
              </div>
            </div>
          </div>
        ))}

        <div className="tree-layer">
          <div className="tree-connector" />
          <div className={result?.valid === false ? 'tree-node root invalid' : 'tree-node root'}>
            <span>Merkle root</span>
            <strong>{compactHash(rootHash)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function Users({ users, citizens }: { users: UserResponse[]; citizens: UserResponse[] }) {
  const grouped = [
    { role: 'SUPER_ADMIN' as ApiRole, label: 'Super Admin', count: users.filter((user) => user.role === 'SUPER_ADMIN').length },
    {
      role: 'MALPOT_OFFICER' as ApiRole,
      label: 'Malpot Officer',
      count: users.filter((user) => user.role === 'MALPOT_OFFICER').length,
    },
    { role: 'CITIZEN' as ApiRole, label: 'Citizen', count: citizens.length || users.filter((user) => user.role === 'CITIZEN').length },
  ];

  return (
    <section className="panel full">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Administration</p>
          <h3>User management</h3>
        </div>
        <button className="primary-button">
          <UserRoundCog size={17} />
          Admin create endpoint
        </button>
      </div>
      <div className="user-grid">
        {grouped.map((group) => (
          <article className="user-card" key={group.role}>
            <UsersRound size={22} />
            <strong>{group.label}</strong>
            <span>{group.count} account{group.count === 1 ? '' : 's'} returned</span>
          </article>
        ))}
      </div>

      <div className="record-table compact" role="table" aria-label="Users">
        <div className="table-row users-table table-head" role="row">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>District</span>
        </div>
        {users.map((user) => (
          <div className="table-row users-table" role="row" key={user.id}>
            <strong>{user.fullName}</strong>
            <span>{user.email}</span>
            <span>{roleLabels[user.role]}</span>
            <span>{user.district ?? 'Not assigned'}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Task({ icon: Icon, title, meta, tone }: { icon: typeof FileCheck2; title: string; meta: string; tone: string }) {
  return (
    <article className="task-row">
      <div className={`task-icon tone-${tone}`}>
        <Icon size={18} />
      </div>
      <div>
        <strong>{title}</strong>
        <span>{meta}</span>
      </div>
      <Clock3 size={17} />
    </article>
  );
}

function Status({ label }: { label: string }) {
  const normalized = label.toLowerCase();
  const Icon = normalized.includes('verified') || normalized.includes('approved') ? CheckCircle2 : normalized.includes('review') || normalized.includes('pending') ? CircleAlert : LockKeyhole;

  return (
    <span className={`status ${normalized.replaceAll(' ', '-').replaceAll('_', '-')}`}>
      <Icon size={14} />
      {label}
    </span>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

export default App;
