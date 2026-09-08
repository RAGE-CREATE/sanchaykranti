import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Factory,
  Home,
  IndianRupee,
  Leaf,
  LogIn,
  LogOut,
  Menu,
  Package,
  Plus,
  QrCode,
  Recycle,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Target,
  Truck,
  User,
  Warehouse,
  X,
} from "lucide-react";
import QRCode from "react-qr-code";

/* =========================================================
   STORAGE KEYS
========================================================= */

const REQUEST_KEY = "sanchaykranti_requests_v7";
const USER_KEY = "sanchaykranti_users_v7";
const SESSION_KEY = "sanchaykranti_session_v7";
const PRICE_KEY = "sanchaykranti_prices_v7";
const DEMAND_KEY = "sanchaykranti_demands_v7";
const ORDER_KEY = "sanchaykranti_orders_v7";

/* =========================================================
   DEFAULT PRICES
========================================================= */

const DEFAULT_PRICES = {
  Plastic: 28,
  Paper: 15,
  Metal: 55,
  Glass: 10,
  "E-Waste": 70,
  Textile: 22,
};

/* =========================================================
   DEMO USERS
========================================================= */

const DEMO_USERS = [
  {
    id: "USR-SOURCE",
    name: "GreenTech Industries",
    email: "source@sanchay.com",
    password: "123456",
    role: "source",
  },
  {
    id: "USR-COLLECTION",
    name: "EcoMove Logistics",
    email: "collection@sanchay.com",
    password: "123456",
    role: "collection",
  },
  {
    id: "USR-RECOVERY",
    name: "Sanchay Recovery Center",
    email: "recovery@sanchay.com",
    password: "123456",
    role: "recovery",
  },
  {
    id: "USR-BUYER",
    name: "EcoManufacturing Pvt Ltd",
    email: "buyer@sanchay.com",
    password: "123456",
    role: "buyer",
  },
  {
    id: "USR-ADMIN",
    name: "SanchayKranti Admin",
    email: "admin@sanchay.com",
    password: "123456",
    role: "admin",
  },
];

/* =========================================================
   SAMPLE REQUESTS
========================================================= */

const SAMPLE_REQUESTS = [
  {
    id: "REQ-1001",
    sourceName: "GreenTech Industries",
    sourceEmail: "source@sanchay.com",
    material: "Plastic",
    quantity: 120,
    unit: "kg",
    location: "Pune",
    address: "Hinjewadi Phase 1, Pune",
    pickupDate: "2026-09-09",
    notes: "Clean HDPE and PET plastic scrap.",
    status: "Pending",
    createdAt: new Date().toISOString(),
    collectionPartner: "",
    acceptedAt: null,
    collectedAt: null,
    recoveryPartner: "",
    recoveryStatus: "",
    receivedAt: null,
    verifiedAt: null,
    verifiedWeight: null,
    grade: "",
    pricePerKg: null,
    recoveredValue: null,
    processedAt: null,
    availableQuantity: null,
  },
  {
    id: "REQ-1002",
    sourceName: "JSPM Campus",
    sourceEmail: "source@sanchay.com",
    material: "Paper",
    quantity: 80,
    unit: "kg",
    location: "Pune",
    address: "Hadapsar, Pune",
    pickupDate: "2026-09-09",
    notes: "Office paper and cardboard.",
    status: "Pending",
    createdAt: new Date().toISOString(),
    collectionPartner: "",
    acceptedAt: null,
    collectedAt: null,
    recoveryPartner: "",
    recoveryStatus: "",
    receivedAt: null,
    verifiedAt: null,
    verifiedWeight: null,
    grade: "",
    pricePerKg: null,
    recoveredValue: null,
    processedAt: null,
    availableQuantity: null,
  },
  {
    id: "REQ-1003",
    sourceName: "Metro Engineering",
    sourceEmail: "source@sanchay.com",
    material: "Metal",
    quantity: 150,
    unit: "kg",
    location: "Pimpri",
    address: "MIDC Pimpri, Pune",
    pickupDate: "2026-09-09",
    notes: "Mixed aluminium and steel scrap.",
    status: "Collected",
    createdAt: new Date().toISOString(),
    collectionPartner: "EcoMove Logistics",
    acceptedAt: new Date().toISOString(),
    collectedAt: new Date().toISOString(),
    recoveryPartner: "Sanchay Recovery Center",
    recoveryStatus: "Processed",
    receivedAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    verifiedWeight: 145,
    grade: "A",
    pricePerKg: 55,
    recoveredValue: 7975,
    processedAt: new Date().toISOString(),
    availableQuantity: 145,
  },
];

const SAMPLE_DEMANDS = [
  {
    id: "DEM-1001",
    buyerEmail: "buyer@sanchay.com",
    buyerName: "EcoManufacturing Pvt Ltd",
    material: "Metal",
    quantity: 100,
    grade: "A",
    location: "Pune",
    status: "Open",
    createdAt: new Date().toISOString(),
  },
];

/* =========================================================
   HELPERS
========================================================= */

function requestId() {
  return `REQ-${Date.now().toString().slice(-6)}`;
}

function userId() {
  return `USR-${Date.now().toString().slice(-6)}`;
}

function demandId() {
  return `DEM-${Date.now().toString().slice(-6)}`;
}

function orderId() {
  return `ORD-${Date.now().toString().slice(-6)}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function money(value = 0) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function dateText(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function MaterialIcon({ material, size = 18 }) {
  if (material === "Metal") return <Factory size={size} />;
  if (material === "E-Waste") return <Sparkles size={size} />;
  return <Recycle size={size} />;
}

function StatusBadge({ status }) {
  const text = status || "Not Started";
  const lower = text.toLowerCase();

  let type = "requested";
  if (lower.includes("pending") || lower.includes("open")) type = "pending";
  if (
    lower.includes("accepted") ||
    lower.includes("received") ||
    lower.includes("ordered")
  )
    type = "accepted";
  if (lower.includes("collected")) type = "collected";
  if (
    lower.includes("verified") ||
    lower.includes("processed") ||
    lower.includes("completed")
  )
    type = "verified";

  return (
    <span className={`status-badge ${type}`}>
      <span />
      {text}
    </span>
  );
}

function StatCard({ icon, label, value, tone = "" }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function EmptyState({ title, text, icon }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon || <Package size={25} />}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action && <div className="page-heading-action">{action}</div>}
    </div>
  );
}

/* =========================================================
   LANDING
========================================================= */

function LandingPage({ openAuth }) {
  return (
    <div className="app-shell">
      <nav className="landing-nav">
        <div className="brand">
          <div className="brand-mark">
            <Leaf size={22} />
          </div>
          <div>
            <strong>SanchayKranti</strong>
            <span>Circular Economy Network</span>
          </div>
        </div>

        <div className="nav-actions">
          <button
            className="button button-outline"
            onClick={() => openAuth("login")}
          >
            Login
          </button>
          <button
            className="button button-primary"
            onClick={() => openAuth("register")}
          >
            Register
          </button>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">DIGITAL CIRCULAR ECONOMY NETWORK</span>
          <h1>
            Waste becomes
            <span>valuable resource.</span>
          </h1>
          <p>
            SanchayKranti connects waste generators, collection partners,
            recovery centers, manufacturers and platform administrators through
            one traceable circular economy ecosystem.
          </p>

          <div className="hero-buttons">
            <button
              className="button button-primary button-large"
              onClick={() => openAuth("login")}
            >
              Enter Platform
              <ArrowRight size={17} />
            </button>
            <button
              className="button button-outline button-large"
              onClick={() => openAuth("register")}
            >
              Join Network
            </button>
          </div>
        </div>

        <div className="hero-flow-card">
          <div className="flow-card-header">
            <div>
              <span className="small-label">CIRCULAR MATERIAL JOURNEY</span>
              <h3>Closed-loop material network</h3>
            </div>
            <Recycle size={25} />
          </div>

          <div className="hero-flow">
            <div className="flow-box">
              <div className="flow-box-icon">
                <Building2 size={18} />
              </div>
              <strong>Source</strong>
              <span>Waste generation</span>
            </div>

            <ArrowRight className="flow-arrow" />

            <div className="flow-box">
              <div className="flow-box-icon">
                <Truck size={18} />
              </div>
              <strong>Collection</strong>
              <span>Pickup</span>
            </div>

            <ArrowRight className="flow-arrow" />

            <div className="flow-box">
              <div className="flow-box-icon">
                <Recycle size={18} />
              </div>
              <strong>Recovery</strong>
              <span>Processing</span>
            </div>

            <ArrowRight className="flow-arrow" />

            <div className="flow-box">
              <div className="flow-box-icon">
                <Factory size={18} />
              </div>
              <strong>Buyer</strong>
              <span>Reuse</span>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-strip">
        <div>
          <strong>5</strong>
          <span>Platform Roles</span>
        </div>
        <div>
          <strong>100%</strong>
          <span>Material Traceability</span>
        </div>
        <div>
          <strong>Smart</strong>
          <span>Demand Matching</span>
        </div>
        <div>
          <strong>Live</strong>
          <span>Admin Analytics</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   AUTH
========================================================= */

function AuthPage({ mode, setMode, onBack, login, register }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "source",
  });
  const [error, setError] = useState("");

  const roles = [
    ["source", "Waste Source", <Building2 size={16} />],
    ["collection", "Collection", <Truck size={16} />],
    ["recovery", "Recovery", <Recycle size={16} />],
    ["buyer", "Buyer / Manufacturer", <Factory size={16} />],
  ];

  function submit(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    if (mode === "register") {
      if (!form.name.trim()) {
        setError("Organization name is required.");
        return;
      }

      const result = register(form);
      if (!result.ok) setError(result.message);
      return;
    }

    const result = login(form.email, form.password);
    if (!result.ok) setError(result.message);
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="auth-brand">
          <div className="brand-mark large">
            <Leaf size={26} />
          </div>
          <div>
            <strong>SanchayKranti</strong>
            <span>Circular Economy Network</span>
          </div>
        </div>

        <div className="auth-message">
          <span className="eyebrow">CONNECT • COLLECT • RECOVER • REUSE</span>
          <h1>One network for the complete material lifecycle.</h1>
          <p>
            Digitally connect waste generators, logistics partners, recovery
            facilities and manufacturers.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <span className="eyebrow">PARTNER PORTAL</span>
            <h2>{mode === "login" ? "Welcome back" : "Create partner account"}</h2>
            <p>Access your SanchayKranti workspace.</p>
          </div>

          <div className="auth-tabs">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Login
            </button>
            <button
              className={mode === "register" ? "active" : ""}
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              Register
            </button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {mode === "register" && (
              <>
                <label>
                  Organization / Name
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </label>

                <div>
                  <span className="field-label">Select Partner Role</span>
                  <div className="role-selection">
                    {roles.map(([id, name, icon]) => (
                      <button
                        type="button"
                        key={id}
                        className={`role-select ${form.role === id ? "active" : ""}`}
                        onClick={() => setForm({ ...form, role: id })}
                      >
                        {icon}
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <label>
              Email
              <input
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>

            {error && (
              <div className="error-message">
                <X size={15} />
                {error}
              </div>
            )}

            <button className="button button-primary button-full">
              <LogIn size={16} />
              {mode === "login" ? "Login" : "Create Account"}
            </button>
          </form>

          {mode === "login" && (
            <div className="demo-login">
              <strong>Demo password for all: 123456</strong>
              <span>source@sanchay.com</span>
              <span>collection@sanchay.com</span>
              <span>recovery@sanchay.com</span>
              <span>buyer@sanchay.com</span>
              <span>admin@sanchay.com</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR + LAYOUT
========================================================= */

function Sidebar({ user, page, setPage, mobileOpen, setMobileOpen, logout }) {
  const menus = {
    source: [
      ["dashboard", "Dashboard", <Home size={17} />],
      ["new-request", "New Request", <Plus size={17} />],
      ["my-requests", "My Requests", <Package size={17} />],
    ],
    collection: [
      ["dashboard", "Dashboard", <Home size={17} />],
      ["requests", "Available Requests", <Package size={17} />],
      ["today", "Collections", <Truck size={17} />],
      ["earnings", "Earnings", <IndianRupee size={17} />],
    ],
    recovery: [
      ["dashboard", "Dashboard", <Home size={17} />],
      ["incoming", "Incoming Materials", <Truck size={17} />],
      ["verification", "Verification", <ShieldCheck size={17} />],
      ["inventory", "Inventory", <Warehouse size={17} />],
      ["prices", "Price Board", <IndianRupee size={17} />],
      ["processed", "Processed Materials", <CheckCircle2 size={17} />],
      ["passports", "Material Passports", <QrCode size={17} />],
    ],
    buyer: [
      ["dashboard", "Dashboard", <Home size={17} />],
      ["marketplace", "Marketplace", <ShoppingCart size={17} />],
      ["demand", "Create Demand", <Target size={17} />],
      ["matching", "Smart Matching", <Sparkles size={17} />],
      ["orders", "My Orders", <Package size={17} />],
    ],
    admin: [
      ["dashboard", "Overview", <Home size={17} />],
      ["network", "Network Activity", <Sparkles size={17} />],
      ["partners", "Partners", <User size={17} />],
      ["transactions", "Transactions", <IndianRupee size={17} />],
      ["impact", "Impact Metrics", <Leaf size={17} />],
      ["passports", "Material Passports", <QrCode size={17} />],
    ],
  };

  const roleNames = {
    source: "Waste Source Partner",
    collection: "Collection Partner",
    recovery: "Material Recovery Partner",
    buyer: "Buyer / Manufacturer",
    admin: "Platform Administrator",
  };

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Leaf size={20} />
          </div>
          <div>
            <strong>SanchayKranti</strong>
            <span>Circular Economy</span>
          </div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-role">
          <div className="role-icon">
            {user.role === "source" && <Building2 size={18} />}
            {user.role === "collection" && <Truck size={18} />}
            {user.role === "recovery" && <Recycle size={18} />}
            {user.role === "buyer" && <Factory size={18} />}
            {user.role === "admin" && <ShieldCheck size={18} />}
          </div>
          <div>
            <span>ACTIVE ROLE</span>
            <strong>{roleNames[user.role]}</strong>
          </div>
        </div>

        <div className="sidebar-menu">
          <div className="menu-label">WORKSPACE</div>
          {menus[user.role].map(([id, label, icon]) => (
            <button
              key={id}
              className={`sidebar-link ${page === id ? "active" : ""}`}
              onClick={() => {
                setPage(id);
                setMobileOpen(false);
              }}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <button className="sidebar-link logout-link" onClick={logout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function Layout({ user, page, setPage, logout, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <Sidebar
        user={user}
        page={page}
        setPage={setPage}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        logout={logout}
      />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              className="mobile-menu-button"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div>
              <span className="header-date">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <h1>SanchayKranti Network</h1>
            </div>
          </div>

          <div className="header-user">
            <div className="header-avatar">
              <User size={17} />
            </div>
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}

/* =========================================================
   SHARED REQUEST TABLE
========================================================= */

function RequestTable({ requests }) {
  if (!requests.length) {
    return <EmptyState title="No requests" text="Requests will appear here." />;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Request</th>
            <th>Material</th>
            <th>Quantity</th>
            <th>Location</th>
            <th>Collection</th>
            <th>Recovery</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <td>
                <div className="table-primary">{r.id}</div>
                <div className="table-secondary">{r.sourceName}</div>
              </td>
              <td>{r.material}</td>
              <td>
                {r.quantity} {r.unit}
              </td>
              <td>{r.location}</td>
              <td>
                <StatusBadge status={r.status} />
              </td>
              <td>
                <StatusBadge
                  status={
                    r.recoveryStatus ||
                    (r.status === "Collected" ? "Awaiting Recovery" : "Not Started")
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   SOURCE
========================================================= */

function SourceDashboard({ user, requests, setPage }) {
  const own = requests.filter(
    (r) => r.sourceEmail === user.email || r.sourceName === user.name,
  );

  return (
    <>
      <PageHeading
        eyebrow="SOURCE PARTNER"
        title="Waste Source Dashboard"
        description="Track collection and material recovery."
        action={
          <button
            className="button button-primary"
            onClick={() => setPage("new-request")}
          >
            <Plus size={16} />
            New Request
          </button>
        }
      />

      <div className="stats-grid four">
        <StatCard
          icon={<Clock size={18} />}
          label="Pending"
          value={own.filter((r) => r.status === "Pending").length}
          tone="warning"
        />
        <StatCard
          icon={<Truck size={18} />}
          label="Accepted"
          value={own.filter((r) => r.status === "Accepted").length}
          tone="info"
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Collected"
          value={own.filter((r) => r.status === "Collected").length}
        />
        <StatCard
          icon={<Recycle size={18} />}
          label="Processed"
          value={own.filter((r) => r.recoveryStatus === "Processed").length}
        />
      </div>

      <div className="panel">
        <RequestTable requests={own} />
      </div>
    </>
  );
}

function NewRequest({ user, addRequest, setPage }) {
  const [form, setForm] = useState({
    material: "Plastic",
    quantity: "",
    location: "Pune",
    address: "",
    pickupDate: todayISO(),
    notes: "",
  });

  function submit(e) {
    e.preventDefault();

    if (!form.quantity || Number(form.quantity) <= 0) {
      alert("Enter valid quantity.");
      return;
    }

    addRequest({
      id: requestId(),
      sourceName: user.name,
      sourceEmail: user.email,
      material: form.material,
      quantity: Number(form.quantity),
      unit: "kg",
      location: form.location,
      address: form.address,
      pickupDate: form.pickupDate,
      notes: form.notes,
      status: "Pending",
      createdAt: new Date().toISOString(),
      collectionPartner: "",
      acceptedAt: null,
      collectedAt: null,
      recoveryPartner: "",
      recoveryStatus: "",
      receivedAt: null,
      verifiedAt: null,
      verifiedWeight: null,
      grade: "",
      pricePerKg: null,
      recoveredValue: null,
      processedAt: null,
      availableQuantity: null,
    });

    setPage("my-requests");
  }

  return (
    <>
      <PageHeading
        eyebrow="NEW REQUEST"
        title="Schedule Material Collection"
        description="Add waste material to the circular economy network."
      />

      <form className="panel request-form-panel" onSubmit={submit}>
        <div className="form-section">
          <div className="form-grid three">
            <label>
              <span className="field-label">Material</span>
              <select
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
              >
                {Object.keys(DEFAULT_PRICES).map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="field-label">Quantity kg</span>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </label>

            <label>
              <span className="field-label">Pickup Date</span>
              <input
                type="date"
                value={form.pickupDate}
                onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
              />
            </label>
          </div>
        </div>

        <div className="form-section">
          <div className="form-grid two">
            <label>
              <span className="field-label">City</span>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </label>

            <label>
              <span className="field-label">Address</span>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </label>
          </div>

          <label style={{ marginTop: 18 }}>
            <span className="field-label">Notes</span>
            <textarea
              rows="4"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
        </div>

        <div className="form-footer">
          <span />
          <button className="button button-primary">
            <Plus size={16} />
            Create Request
          </button>
        </div>
      </form>
    </>
  );
}

function MyRequests({ user, requests }) {
  const own = requests.filter(
    (r) => r.sourceEmail === user.email || r.sourceName === user.name,
  );

  return (
    <>
      <PageHeading
        eyebrow="TRACKING"
        title="My Requests"
        description="Follow materials through the entire network."
      />
      <div className="panel">
        <RequestTable requests={own} />
      </div>
    </>
  );
}

/* =========================================================
   COLLECTION
========================================================= */

function CollectionList({ requests, acceptRequest, collectRequest }) {
  if (!requests.length) {
    return (
      <EmptyState
        title="No collection requests"
        text="New source requests will appear here."
      />
    );
  }

  return (
    <div className="partner-request-list">
      {requests.map((r) => (
        <div className="partner-request-card" key={r.id}>
          <div className="partner-request-main">
            <div className="request-type-icon">
              <MaterialIcon material={r.material} />
            </div>
            <div>
              <div className="request-card-title">
                <strong>{r.id}</strong>
                <StatusBadge status={r.status} />
              </div>
              <h4>
                {r.material} · {r.quantity} kg
              </h4>
              <div className="request-meta">
                <span>{r.sourceName}</span>
                <span>{r.location}</span>
              </div>
            </div>
          </div>

          <div>
            {r.status === "Pending" && (
              <button
                className="button button-primary"
                onClick={() => acceptRequest(r.id)}
              >
                Accept
              </button>
            )}

            {r.status === "Accepted" && (
              <button
                className="button button-success"
                onClick={() => collectRequest(r.id)}
              >
                Mark Collected
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CollectionDashboard({ requests, setPage, acceptRequest, collectRequest }) {
  const pending = requests.filter((r) => r.status === "Pending");
  const accepted = requests.filter((r) => r.status === "Accepted");
  const collected = requests.filter((r) => r.status === "Collected");

  return (
    <>
      <PageHeading
        eyebrow="COLLECTION PARTNER"
        title="Collection Operations"
        description="Manage waste pickup and transportation."
      />

      <div className="stats-grid four">
        <StatCard icon={<Package size={18} />} label="Available" value={pending.length} />
        <StatCard icon={<Truck size={18} />} label="Accepted" value={accepted.length} />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Collected"
          value={collected.length}
        />
        <StatCard
          icon={<IndianRupee size={18} />}
          label="Earnings"
          value={money(collected.reduce((sum, r) => sum + r.quantity * 3, 0))}
        />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Collection Requests</h3>
          </div>
          <button className="text-button" onClick={() => setPage("requests")}>
            View all
          </button>
        </div>

        <CollectionList
          requests={[...accepted, ...pending]}
          acceptRequest={acceptRequest}
          collectRequest={collectRequest}
        />
      </div>
    </>
  );
}

function CollectionRequests({ requests, acceptRequest, collectRequest }) {
  const visible = requests.filter((r) => ["Pending", "Accepted"].includes(r.status));

  return (
    <>
      <PageHeading
        eyebrow="COLLECTION MARKETPLACE"
        title="Available Requests"
        description="Accept new waste collection requests."
      />
      <div className="panel">
        <CollectionList
          requests={visible}
          acceptRequest={acceptRequest}
          collectRequest={collectRequest}
        />
      </div>
    </>
  );
}

function CollectionHistory({ requests }) {
  const collected = requests.filter((r) => r.status === "Collected");

  return (
    <>
      <PageHeading
        eyebrow="COLLECTION HISTORY"
        title="Completed Collections"
        description="Previously collected waste material."
      />
      <div className="panel">
        <CollectionList
          requests={collected}
          acceptRequest={() => {}}
          collectRequest={() => {}}
        />
      </div>
    </>
  );
}

function Earnings({ requests }) {
  const collected = requests.filter((r) => r.status === "Collected");
  const total = collected.reduce((sum, r) => sum + r.quantity * 3, 0);

  return (
    <>
      <PageHeading
        eyebrow="FINANCIALS"
        title="Collection Earnings"
        description="Prototype earnings at ₹3/kg."
      />

      <div className="earnings-highlight">
        <div className="earnings-icon">
          <CircleDollarSign size={25} />
        </div>
        <div>
          <span>TOTAL EARNINGS</span>
          <strong>{money(total)}</strong>
        </div>
      </div>

      <div className="panel">
        <div className="earnings-list">
          {collected.map((r) => (
            <div className="earnings-row" key={r.id}>
              <div>
                <strong>{r.id}</strong>
                <span>{r.sourceName}</span>
              </div>
              <div>
                <strong>{r.quantity} kg</strong>
                <span>{r.material}</span>
              </div>
              <div className="earning-amount">{money(r.quantity * 3)}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* =========================================================
   RECOVERY
========================================================= */

function IncomingList({ requests, receiveMaterial }) {
  if (!requests.length) {
    return (
      <EmptyState
        title="No incoming materials"
        text="Collected materials appear here automatically."
      />
    );
  }

  return (
    <div className="partner-request-list">
      {requests.map((r) => (
        <div className="partner-request-card" key={r.id}>
          <div className="partner-request-main">
            <div className="request-type-icon">
              <MaterialIcon material={r.material} />
            </div>
            <div>
              <strong>{r.id}</strong>
              <h4>
                {r.material} · {r.quantity} kg
              </h4>
              <div className="request-meta">
                <span>{r.sourceName}</span>
                <span>{r.collectionPartner}</span>
              </div>
            </div>
          </div>

          <button
            className="button button-primary"
            onClick={() => receiveMaterial(r.id)}
          >
            Confirm Received
          </button>
        </div>
      ))}
    </div>
  );
}

function RecoveryDashboard({ requests, receiveMaterial }) {
  const incoming = requests.filter(
    (r) =>
      r.status === "Collected" &&
      (!r.recoveryStatus || r.recoveryStatus === "Awaiting Recovery"),
  );
  const received = requests.filter((r) => r.recoveryStatus === "Received");
  const verified = requests.filter((r) => r.recoveryStatus === "Verified");
  const processed = requests.filter((r) => r.recoveryStatus === "Processed");

  return (
    <>
      <PageHeading
        eyebrow="MATERIAL RECOVERY"
        title="Recovery Operations"
        description="Receive, verify and process recovered waste."
      />

      <div className="stats-grid four">
        <StatCard icon={<Truck size={18} />} label="Incoming" value={incoming.length} />
        <StatCard icon={<Boxes size={18} />} label="Verification" value={received.length} />
        <StatCard icon={<ShieldCheck size={18} />} label="Verified" value={verified.length} />
        <StatCard icon={<Recycle size={18} />} label="Processed" value={processed.length} />
      </div>

      <div className="panel">
        <IncomingList requests={incoming} receiveMaterial={receiveMaterial} />
      </div>
    </>
  );
}

function IncomingPage({ requests, receiveMaterial }) {
  const incoming = requests.filter(
    (r) =>
      r.status === "Collected" &&
      (!r.recoveryStatus || r.recoveryStatus === "Awaiting Recovery"),
  );

  return (
    <>
      <PageHeading
        eyebrow="RECOVERY INTAKE"
        title="Incoming Materials"
        description="Confirm received material batches."
      />
      <div className="panel">
        <IncomingList requests={incoming} receiveMaterial={receiveMaterial} />
      </div>
    </>
  );
}

function VerificationPage({ requests, verifyMaterial, prices }) {
  const received = requests.filter((r) => r.recoveryStatus === "Received");

  return (
    <>
      <PageHeading
        eyebrow="QUALITY CONTROL"
        title="Material Verification"
        description="Verify weight, grade and recovered value."
      />

      <div className="panel">
        {received.length ? (
          <div className="verification-list">
            {received.map((r) => (
              <VerificationRow
                key={r.id}
                request={r}
                defaultPrice={prices[r.material] || 20}
                verifyMaterial={verifyMaterial}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No verification pending" text="Receive material first." />
        )}
      </div>
    </>
  );
}

function VerificationRow({ request, defaultPrice, verifyMaterial }) {
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState(request.quantity);
  const [grade, setGrade] = useState("A");
  const [price, setPrice] = useState(defaultPrice);

  return (
    <>
      <div className="verification-row">
        <div className="verification-avatar">
          <MaterialIcon material={request.material} />
        </div>
        <div className="verification-info">
          <strong>
            {request.id} · {request.material}
          </strong>
          <span>Declared: {request.quantity} kg</span>
        </div>
        <button className="button button-primary" onClick={() => setOpen(true)}>
          Verify
        </button>
      </div>

      {open && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Verify {request.id}</h2>
              <button className="icon-button" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="form-grid three" style={{ marginTop: 24 }}>
              <label>
                <span className="field-label">Weight kg</span>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </label>

              <label>
                <span className="field-label">Grade</span>
                <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                  <option>A</option>
                  <option>B</option>
                  <option>C</option>
                </select>
              </label>

              <label>
                <span className="field-label">₹ / kg</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </label>
            </div>

            <div className="info-box">Value: {money(Number(weight) * Number(price))}</div>

            <div className="modal-footer">
              <button
                className="button button-primary"
                onClick={() => {
                  verifyMaterial(
                    request.id,
                    Number(weight),
                    grade,
                    Number(price),
                  );
                  setOpen(false);
                }}
              >
                Verify Material
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function InventoryPage({ requests, markProcessed }) {
  const inventory = requests.filter((r) =>
    ["Verified", "Processed"].includes(r.recoveryStatus),
  );

  return (
    <>
      <PageHeading
        eyebrow="RECOVERY INVENTORY"
        title="Material Inventory"
        description="Recovered material ready for downstream reuse."
      />

      <div className="panel">
        {inventory.length ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Material</th>
                  <th>Weight</th>
                  <th>Available</th>
                  <th>Grade</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {inventory.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.material}</td>
                    <td>{r.verifiedWeight} kg</td>
                    <td>{r.availableQuantity ?? r.verifiedWeight} kg</td>
                    <td>Grade {r.grade}</td>
                    <td>{money(r.pricePerKg)}/kg</td>
                    <td>
                      <StatusBadge status={r.recoveryStatus} />
                    </td>
                    <td>
                      {r.recoveryStatus === "Verified" && (
                        <button
                          className="button button-success"
                          onClick={() => markProcessed(r.id)}
                        >
                          Process
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Inventory empty" text="Verified material will appear here." />
        )}
      </div>
    </>
  );
}

function PriceBoard({ prices, setPrices }) {
  return (
    <>
      <PageHeading
        eyebrow="MATERIAL MARKET"
        title="Price Board"
        description="Set recovery material rates."
      />

      <div className="price-board-grid">
        {Object.entries(prices).map(([material, price]) => (
          <div className="price-card" key={material}>
            <div className="price-card-icon">
              <MaterialIcon material={material} />
            </div>
            <div>
              <span>{material}</span>
              <strong>{money(price)}/kg</strong>
              <input
                style={{ width: "100%", marginTop: 8, padding: 7 }}
                type="number"
                value={price}
                onChange={(e) =>
                  setPrices((prev) => ({
                    ...prev,
                    [material]: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ProcessedPage({ requests, orders, openPassport }) {
  const processed = requests.filter((r) => r.recoveryStatus === "Processed");

  return (
    <>
      <PageHeading
        eyebrow="RECOVERY OUTPUT"
        title="Processed Materials"
        description="Material ready to enter the buyer marketplace with a digital material passport."
      />

      <div className="panel">
        {processed.length ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Material</th>
                  <th>Verified</th>
                  <th>Available</th>
                  <th>Grade</th>
                  <th>Buyer Sales</th>
                  <th>Passport</th>
                </tr>
              </thead>
              <tbody>
                {processed.map((r) => {
                  const batchOrders = orders.filter((o) => o.requestId === r.id);
                  const sold = batchOrders.reduce((sum, o) => sum + Number(o.quantity || 0), 0);
                  return (
                    <tr key={r.id}>
                      <td className="table-primary">{r.id}</td>
                      <td>{r.material}</td>
                      <td>{r.verifiedWeight || r.quantity} kg</td>
                      <td>{r.availableQuantity ?? r.verifiedWeight ?? 0} kg</td>
                      <td>Grade {r.grade || "—"}</td>
                      <td>{sold} kg</td>
                      <td>
                        <button className="button button-outline" onClick={() => openPassport(r.id)}>
                          <QrCode size={15} />
                          Passport
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No processed materials"
            text="Process a verified material batch to generate its digital passport."
            icon={<QrCode size={25} />}
          />
        )}
      </div>
    </>
  );
}

function PassportTimelineStep({ label, title, detail, date, complete }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 12, marginBottom: 18 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: complete ? "#e7f4ec" : "#f1f4f2",
          color: complete ? "#1e6b47" : "#8a9790",
          border: "1px solid #e1e7e3",
        }}
      >
        {complete ? <Check size={16} /> : <Clock size={15} />}
      </div>
      <div>
        <span className="small-label">{label}</span>
        <strong style={{ display: "block", marginTop: 3, fontSize: 13 }}>{title}</strong>
        <span style={{ display: "block", color: "#6d7972", fontSize: 11, marginTop: 3 }}>{detail}</span>
        {date && <small style={{ display: "block", color: "#8a9790", marginTop: 4 }}>{dateText(date)}</small>}
      </div>
    </div>
  );
}

function MaterialPassport({ request, orders, onBack, publicView = false }) {
  if (!request) {
    return (
      <div className="app-shell" style={{ minHeight: "100vh", padding: 30 }}>
        <div className="panel" style={{ maxWidth: 700, margin: "60px auto" }}>
          <EmptyState title="Material passport not found" text="The requested material batch could not be found." icon={<QrCode size={25} />} />
          {!publicView && (
            <button className="button button-outline" onClick={onBack}>
              <ArrowLeft size={15} /> Back
            </button>
          )}
        </div>
      </div>
    );
  }

  const batchOrders = orders.filter((o) => o.requestId === request.id);
  const soldQuantity = batchOrders.reduce((sum, o) => sum + Number(o.quantity || 0), 0);
  const latestBuyer = batchOrders[0];
  const passportUrl = `${window.location.origin}${window.location.pathname}?passport=${encodeURIComponent(request.id)}`;
  const finalStatus = soldQuantity > 0 ? "Reintroduced to Manufacturing" : "Ready for Buyer";

  return (
    <div className="app-shell" style={{ minHeight: "100vh", background: "#f5f7f6" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div className="brand">
            <div className="brand-mark"><Leaf size={20} /></div>
            <div><strong>SanchayKranti</strong><span>Digital Material Passport</span></div>
          </div>
          {!publicView && (
            <button className="button button-outline" onClick={onBack}>
              <ArrowLeft size={15} /> Back to dashboard
            </button>
          )}
        </div>

        <div className="panel" style={{ marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start" }}>
            <div>
              <span className="eyebrow">VERIFIED MATERIAL IDENTITY</span>
              <h2 style={{ margin: "8px 0 4px", fontSize: 30 }}>{request.id}</h2>
              <p style={{ margin: 0, color: "#6d7972" }}>
                {request.material} · Grade {request.grade || "Pending"} · {request.verifiedWeight || request.quantity} kg verified
              </p>
              <div style={{ marginTop: 14 }}><StatusBadge status={finalStatus} /></div>
            </div>

            <div style={{ background: "white", padding: 14, border: "1px solid #e1e7e3", borderRadius: 12, textAlign: "center" }}>
              <QRCode value={passportUrl} size={150} />
              <small style={{ display: "block", marginTop: 8, color: "#6d7972", maxWidth: 180 }}>Scan to verify this material batch</small>
            </div>
          </div>
        </div>

        <div className="stats-grid four">
          <StatCard icon={<Package size={18} />} label="Original Quantity" value={`${request.quantity} kg`} />
          <StatCard icon={<ShieldCheck size={18} />} label="Verified Quantity" value={`${request.verifiedWeight || 0} kg`} />
          <StatCard icon={<ShoppingCart size={18} />} label="Sold to Buyers" value={`${soldQuantity} kg`} />
          <StatCard icon={<Warehouse size={18} />} label="Available" value={`${request.availableQuantity ?? request.verifiedWeight ?? 0} kg`} />
        </div>

        <div className="dashboard-grid">
          <div className="panel large-panel">
            <div className="panel-header">
              <div><h3>Material Journey</h3><p>Traceable lifecycle of this batch.</p></div>
            </div>

            <PassportTimelineStep label="01 · SOURCE" title={request.sourceName} detail={`${request.material} · ${request.quantity} kg · ${request.location}`} date={request.createdAt} complete />
            <PassportTimelineStep label="02 · COLLECTION" title={request.collectionPartner || "Awaiting collection partner"} detail={request.status === "Collected" ? "Material collected and transported" : request.status} date={request.collectedAt || request.acceptedAt} complete={request.status === "Collected"} />
            <PassportTimelineStep label="03 · RECOVERY" title={request.recoveryPartner || "Awaiting recovery center"} detail={request.recoveryStatus === "Processed" ? `${request.verifiedWeight} kg verified · Grade ${request.grade} · Processed` : (request.recoveryStatus || "Not started")} date={request.processedAt || request.verifiedAt || request.receivedAt} complete={request.recoveryStatus === "Processed"} />
            <PassportTimelineStep label="04 · SECOND LIFE" title={latestBuyer?.buyerName || "Available to manufacturers"} detail={soldQuantity > 0 ? `${soldQuantity} kg purchased through ${batchOrders.length} order(s)` : "Processed material is ready for circular reuse"} date={latestBuyer?.orderedAt} complete={soldQuantity > 0} />
          </div>

          <div className="panel">
            <div className="panel-header"><div><h3>Passport Details</h3><p>Batch verification data.</p></div></div>
            <div className="price-list">
              <div className="price-row"><span>Material</span><strong>{request.material}</strong></div>
              <div className="price-row"><span>Grade</span><strong>{request.grade || "—"}</strong></div>
              <div className="price-row"><span>Recovery rate</span><strong>{money(request.pricePerKg)}/kg</strong></div>
              <div className="price-row"><span>Recovered value</span><strong>{money(request.recoveredValue)}</strong></div>
              <div className="price-row"><span>Source location</span><strong>{request.location}</strong></div>
              <div className="price-row"><span>Current status</span><strong>{finalStatus}</strong></div>
            </div>
          </div>
        </div>

        {batchOrders.length > 0 && (
          <div className="panel" style={{ marginTop: 18 }}>
            <div className="panel-header"><div><h3>Buyer Transactions</h3><p>Second-life material allocation.</p></div></div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>Order</th><th>Buyer</th><th>Quantity</th><th>Rate</th><th>Total</th><th>Date</th></tr></thead>
                <tbody>
                  {batchOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="table-primary">{o.id}</td>
                      <td>{o.buyerName}</td>
                      <td>{o.quantity} kg</td>
                      <td>{money(o.pricePerKg)}/kg</td>
                      <td><strong>{money(o.total)}</strong></td>
                      <td>{dateText(o.orderedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PassportLibrary({ requests, orders, openPassport }) {
  const processed = requests.filter((r) => r.recoveryStatus === "Processed");
  return (
    <>
      <PageHeading
        eyebrow="DIGITAL TRACEABILITY"
        title="Material Passports"
        description="Open the digital identity and lifecycle record for every processed material batch."
      />
      <div className="panel">
        {processed.length ? (
          <div className="partner-request-list">
            {processed.map((r) => {
              const sold = orders.filter((o) => o.requestId === r.id).reduce((sum, o) => sum + Number(o.quantity || 0), 0);
              return (
                <div className="partner-request-card" key={r.id}>
                  <div className="partner-request-main">
                    <div className="request-type-icon"><QrCode size={20} /></div>
                    <div>
                      <div className="request-card-title"><strong>{r.id}</strong><StatusBadge status={sold > 0 ? "Circular Reuse" : "Processed"} /></div>
                      <h4>{r.material} · Grade {r.grade} · {r.verifiedWeight} kg</h4>
                      <div className="request-meta"><span>Source: {r.sourceName}</span><span>Recovery: {r.recoveryPartner}</span><span>Sold: {sold} kg</span></div>
                    </div>
                  </div>
                  <button className="button button-primary" onClick={() => openPassport(r.id)}>
                    <QrCode size={15} /> Open Passport
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No passports yet" text="A digital passport is created automatically when a material batch reaches Processed status." icon={<QrCode size={25} />} />
        )}
      </div>
    </>
  );
}

/* =========================================================
   BUYER
========================================================= */

function Marketplace({ requests, buyMaterial }) {
  const available = requests.filter(
    (r) =>
      r.recoveryStatus === "Processed" &&
      Number(r.availableQuantity ?? r.verifiedWeight ?? 0) > 0,
  );

  return (
    <>
      <PageHeading
        eyebrow="RECOVERED MATERIAL MARKETPLACE"
        title="Available Materials"
        description="Purchase verified recovered material directly from recovery partners."
      />

      {available.length ? (
        <div className="match-list">
          {available.map((r) => (
            <MarketplaceCard key={r.id} request={r} buyMaterial={buyMaterial} />
          ))}
        </div>
      ) : (
        <div className="panel">
          <EmptyState
            title="No material currently available"
            text="Processed recovered material will appear here."
          />
        </div>
      )}
    </>
  );
}

function MarketplaceCard({ request, buyMaterial }) {
  const available = request.availableQuantity ?? request.verifiedWeight ?? 0;
  const [quantity, setQuantity] = useState(Math.min(10, available));

  return (
    <div className="match-card">
      <div className="match-material-icon">
        <MaterialIcon material={request.material} size={22} />
      </div>

      <div className="match-content">
        <div className="match-top">
          <div>
            <span className="match-label">VERIFIED RECOVERED MATERIAL</span>
            <h3>{request.material}</h3>
          </div>
        </div>

        <div className="match-stats">
          <span>
            Available: <strong>{available} kg</strong>
          </span>
          <span>
            Grade: <strong>{request.grade}</strong>
          </span>
          <span>
            Price: <strong>{money(request.pricePerKg)}/kg</strong>
          </span>
          <span>
            Recovery Center: <strong>{request.recoveryPartner}</strong>
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <input
            type="number"
            min="1"
            max={available}
            value={quantity}
            onChange={(e) =>
              setQuantity(
                Math.min(available, Math.max(1, Number(e.target.value))),
              )
            }
            style={{
              width: 110,
              padding: "9px 10px",
              border: "1px solid #e1e7e3",
              borderRadius: 8,
            }}
          />

          <button
            className="button button-primary"
            onClick={() => buyMaterial(request.id, quantity)}
          >
            <ShoppingCart size={15} />
            Buy {quantity} kg
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateDemand({ user, addDemand, setPage }) {
  const [form, setForm] = useState({
    material: "Plastic",
    quantity: 100,
    grade: "Any",
    location: "Pune",
  });

  function submit(e) {
    e.preventDefault();

    addDemand({
      id: demandId(),
      buyerEmail: user.email,
      buyerName: user.name,
      material: form.material,
      quantity: Number(form.quantity),
      grade: form.grade,
      location: form.location,
      status: "Open",
      createdAt: new Date().toISOString(),
    });

    setPage("matching");
  }

  return (
    <>
      <PageHeading
        eyebrow="BUYER DEMAND"
        title="Create Material Demand"
        description="Tell the platform what recovered material your business needs."
      />

      <form className="panel request-form-panel" onSubmit={submit}>
        <div className="form-section">
          <div className="form-grid three">
            <label>
              <span className="field-label">Material</span>
              <select
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
              >
                {Object.keys(DEFAULT_PRICES).map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="field-label">Required Quantity kg</span>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </label>

            <label>
              <span className="field-label">Minimum Grade</span>
              <select
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
              >
                <option>Any</option>
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
            </label>
          </div>

          <label style={{ marginTop: 18 }}>
            <span className="field-label">Location</span>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </label>
        </div>

        <div className="form-footer">
          <span />
          <button className="button button-primary">
            <Sparkles size={16} />
            Find Smart Matches
          </button>
        </div>
      </form>
    </>
  );
}

function calculateMatchScore(demand, material) {
  let score = 0;

  if (demand.material === material.material) score += 50;

  const available = material.availableQuantity ?? material.verifiedWeight ?? 0;

  if (available >= demand.quantity) score += 25;
  else if (available >= demand.quantity * 0.5) score += 15;
  else score += 5;

  if (demand.grade === "Any" || demand.grade === material.grade) score += 15;

  if (
    demand.location &&
    material.location &&
    demand.location.toLowerCase() === material.location.toLowerCase()
  )
    score += 10;
  else score += 5;

  return Math.min(score, 100);
}

function SmartMatching({ user, demands, requests, buyMaterial }) {
  const myDemands = demands.filter((d) => d.buyerEmail === user.email);
  const latestDemand = myDemands[0];

  if (!latestDemand) {
    return (
      <>
        <PageHeading
          eyebrow="AI MATCHING"
          title="Smart Material Matching"
          description="Create a demand first to generate matches."
        />
        <div className="panel">
          <EmptyState
            title="No buyer demand found"
            text="Create a material demand to activate smart matching."
            icon={<Sparkles size={25} />}
          />
        </div>
      </>
    );
  }

  const matches = requests
    .filter(
      (r) =>
        r.recoveryStatus === "Processed" &&
        Number(r.availableQuantity ?? r.verifiedWeight ?? 0) > 0,
    )
    .map((r) => ({
      ...r,
      matchScore: calculateMatchScore(latestDemand, r),
    }))
    .filter((r) => r.material === latestDemand.material)
    .sort((a, b) => b.matchScore - a.matchScore);

  return (
    <>
      <PageHeading
        eyebrow="AI-ASSISTED MATCHING"
        title="Smart Material Matches"
        description="Matches are ranked using material type, quantity, grade and location."
      />

      <div className="smart-match-banner">
        <div className="smart-match-icon">
          <Sparkles size={18} />
        </div>
        <div>
          <strong>
            Demand: {latestDemand.quantity} kg {latestDemand.material}
          </strong>
          <p>
            Preferred grade: {latestDemand.grade} · Location: {latestDemand.location}
          </p>
        </div>
      </div>

      {matches.length ? (
        <div className="match-list">
          {matches.map((match) => {
            const available = match.availableQuantity ?? match.verifiedWeight ?? 0;
            const recommendedQty = Math.min(latestDemand.quantity, available);

            return (
              <div className="match-card" key={match.id}>
                <div className="match-material-icon">
                  <MaterialIcon material={match.material} size={22} />
                </div>
                <div className="match-content">
                  <div className="match-top">
                    <div>
                      <span className="match-label">SMART MATCH</span>
                      <h3>
                        {match.material} · Grade {match.grade}
                      </h3>
                    </div>
                    <div className="match-score">
                      <strong>{match.matchScore}%</strong>
                      <span>Match Score</span>
                    </div>
                  </div>
                  <div className="match-stats">
                    <span>
                      Available: <strong>{available} kg</strong>
                    </span>
                    <span>
                      Required: <strong>{latestDemand.quantity} kg</strong>
                    </span>
                    <span>
                      Price: <strong>{money(match.pricePerKg)}/kg</strong>
                    </span>
                  </div>
                </div>
                <button
                  className="button button-primary"
                  onClick={() => buyMaterial(match.id, recommendedQty)}
                >
                  Buy {recommendedQty} kg
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="panel">
          <EmptyState
            title="No matching inventory yet"
            text="The system will match new processed material when it becomes available."
          />
        </div>
      )}
    </>
  );
}

function BuyerOrders({ user, orders }) {
  const myOrders = orders.filter((o) => o.buyerEmail === user.email);

  return (
    <>
      <PageHeading
        eyebrow="PURCHASE HISTORY"
        title="My Material Orders"
        description="Recovered-material purchases made through the platform."
      />

      <div className="panel">
        {myOrders.length ? (
          <div>
            {myOrders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-icon">
                  <ShoppingCart size={18} />
                </div>
                <div className="order-info">
                  <strong>{order.id}</strong>
                  <span>
                    {order.material} · {order.quantity} kg
                  </span>
                </div>
                <div>
                  <strong>{money(order.total)}</strong>
                  <div className="table-secondary">{money(order.pricePerKg)}/kg</div>
                </div>
                <StatusBadge status={order.status} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No orders yet" text="Purchased materials will appear here." />
        )}
      </div>
    </>
  );
}

function BuyerDashboard({ user, requests, demands, orders, setPage }) {
  const available = requests.filter(
    (r) =>
      r.recoveryStatus === "Processed" &&
      Number(r.availableQuantity ?? r.verifiedWeight ?? 0) > 0,
  );

  const myDemands = demands.filter((d) => d.buyerEmail === user.email);
  const myOrders = orders.filter((o) => o.buyerEmail === user.email);
  const totalPurchased = myOrders.reduce(
    (sum, o) => sum + Number(o.quantity || 0),
    0,
  );

  return (
    <>
      <PageHeading
        eyebrow="BUYER / MANUFACTURER"
        title="Circular Material Procurement"
        description="Discover and purchase verified recovered materials."
        action={
          <button
            className="button button-primary"
            onClick={() => setPage("demand")}
          >
            <Plus size={16} />
            Create Demand
          </button>
        }
      />

      <div className="stats-grid four">
        <StatCard
          icon={<Warehouse size={18} />}
          label="Available Batches"
          value={available.length}
        />
        <StatCard
          icon={<Target size={18} />}
          label="My Demands"
          value={myDemands.length}
        />
        <StatCard
          icon={<ShoppingCart size={18} />}
          label="Orders"
          value={myOrders.length}
        />
        <StatCard
          icon={<Recycle size={18} />}
          label="Material Purchased"
          value={`${totalPurchased} kg`}
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel large-panel">
          <div className="panel-header">
            <div>
              <h3>Recovered Material Marketplace</h3>
              <p>Verified materials available for reuse.</p>
            </div>
            <button className="text-button" onClick={() => setPage("marketplace")}>
              View Marketplace
              <ChevronRight size={14} />
            </button>
          </div>

          {available.length ? (
            <div className="price-list">
              {available.slice(0, 5).map((r) => (
                <div className="price-row" key={r.id}>
                  <span>
                    {r.material}
                    <small>
                      Grade {r.grade} · {r.availableQuantity ?? r.verifiedWeight} kg
                    </small>
                  </span>
                  <strong>{money(r.pricePerKg)}/kg</strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No processed inventory"
              text="Recovery centers must process materials first."
            />
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Smart Matching</h3>
              <p>AI-assisted procurement</p>
            </div>
          </div>

          <div className="today-summary">
            <Sparkles size={32} />
            <p>
              Create your demand and automatically find the most suitable
              recovered material.
            </p>
            <button
              className="button button-primary button-full"
              onClick={() => setPage("matching")}
            >
              View Smart Matches
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   ADMIN
========================================================= */

function AdminDashboard({ users, requests, demands, orders, setPage }) {
  const totalRequestedWeight = requests.reduce(
    (sum, r) => sum + Number(r.quantity || 0),
    0,
  );

  const collectedRequests = requests.filter((r) => r.status === "Collected");
  const totalCollectedWeight = collectedRequests.reduce(
    (sum, r) => sum + Number(r.quantity || 0),
    0,
  );

  const processedRequests = requests.filter(
    (r) => r.recoveryStatus === "Processed",
  );

  const recoveredWeight = processedRequests.reduce(
    (sum, r) => sum + Number(r.verifiedWeight || 0),
    0,
  );

  const soldWeight = orders.reduce(
    (sum, order) => sum + Number(order.quantity || 0),
    0,
  );

  const transactionValue = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0,
  );

  const recoveryValue = requests.reduce(
    (sum, r) => sum + Number(r.recoveredValue || 0),
    0,
  );

  const openRequests = requests.filter((r) => r.status === "Pending").length;
  const activeDemands = demands.filter((d) => d.status === "Open").length;

  const circularCompletion =
    totalRequestedWeight > 0
      ? Math.round((soldWeight / totalRequestedWeight) * 100)
      : 0;

  const materialStats = Object.keys(DEFAULT_PRICES).map((material) => {
    const materialRequests = requests.filter((r) => r.material === material);

    const requested = materialRequests.reduce(
      (sum, r) => sum + Number(r.quantity || 0),
      0,
    );

    const recovered = materialRequests
      .filter((r) => r.recoveryStatus === "Processed")
      .reduce((sum, r) => sum + Number(r.verifiedWeight || 0), 0);

    const sold = orders
      .filter((o) => o.material === material)
      .reduce((sum, o) => sum + Number(o.quantity || 0), 0);

    return { material, requested, recovered, sold };
  });

  const recentActivity = [
    ...requests.map((r) => ({
      type: "request",
      id: r.id,
      title: `${r.material} collection request`,
      description: `${r.quantity} kg · ${r.sourceName}`,
      date:
        r.processedAt ||
        r.verifiedAt ||
        r.collectedAt ||
        r.acceptedAt ||
        r.createdAt,
      status: r.recoveryStatus || r.status,
    })),
    ...orders.map((o) => ({
      type: "order",
      id: o.id,
      title: `${o.material} purchased`,
      description: `${o.quantity} kg · ${o.buyerName}`,
      date: o.orderedAt,
      status: o.status,
    })),
  ]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 7);

  return (
    <>
      <PageHeading
        eyebrow="PLATFORM CONTROL CENTER"
        title="Circular Economy Analytics"
        description="Live overview of material movement across the SanchayKranti ecosystem."
      />

      <div className="stats-grid four">
        <StatCard
          icon={<Package size={18} />}
          label="Waste Registered"
          value={`${totalRequestedWeight} kg`}
          tone="warning"
        />
        <StatCard
          icon={<Truck size={18} />}
          label="Collected"
          value={`${totalCollectedWeight} kg`}
          tone="info"
        />
        <StatCard
          icon={<Recycle size={18} />}
          label="Recovered"
          value={`${recoveredWeight} kg`}
        />
        <StatCard
          icon={<ShoppingCart size={18} />}
          label="Sold to Buyers"
          value={`${soldWeight} kg`}
        />
      </div>

      <div className="stats-grid four">
        <StatCard
          icon={<User size={18} />}
          label="Network Partners"
          value={users.length}
        />
        <StatCard
          icon={<Clock size={18} />}
          label="Open Requests"
          value={openRequests}
          tone="warning"
        />
        <StatCard
          icon={<Target size={18} />}
          label="Buyer Demands"
          value={activeDemands}
          tone="info"
        />
        <StatCard
          icon={<IndianRupee size={18} />}
          label="Marketplace Value"
          value={money(transactionValue)}
        />
      </div>

      <div className="verification-banner">
        <Recycle size={25} />
        <div style={{ flex: 1 }}>
          <strong>Circular Economy Completion Rate: {circularCompletion}%</strong>
          <p>
            Percentage of registered waste that has completed the journey back
            into the economy through a buyer.
          </p>
          <div
            style={{
              marginTop: 12,
              height: 9,
              borderRadius: 20,
              background: "#dcebe2",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(circularCompletion, 100)}%`,
                height: "100%",
                background: "#278157",
              }}
            />
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel large-panel">
          <div className="panel-header">
            <div>
              <h3>Material Flow</h3>
              <p>Requested → recovered → sold</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Requested</th>
                  <th>Recovered</th>
                  <th>Sold</th>
                  <th>Recovery Rate</th>
                </tr>
              </thead>
              <tbody>
                {materialStats.map((item) => {
                  const rate =
                    item.requested > 0
                      ? Math.round((item.recovered / item.requested) * 100)
                      : 0;

                  return (
                    <tr key={item.material}>
                      <td>
                        <div className="material-name">
                          <div className="material-icon">
                            <MaterialIcon material={item.material} />
                          </div>
                          <strong>{item.material}</strong>
                        </div>
                      </td>
                      <td>{item.requested} kg</td>
                      <td>{item.recovered} kg</td>
                      <td>{item.sold} kg</td>
                      <td>
                        <strong>{rate}%</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Economic Value</h3>
              <p>Value generated by recovery.</p>
            </div>
          </div>

          <div className="price-list">
            <div className="price-row">
              <span>Recovery inventory value</span>
              <strong>{money(recoveryValue)}</strong>
            </div>
            <div className="price-row">
              <span>Buyer transactions</span>
              <strong>{money(transactionValue)}</strong>
            </div>
            <div className="price-row">
              <span>Orders completed</span>
              <strong>{orders.length}</strong>
            </div>
            <div className="price-row">
              <span>Material batches processed</span>
              <strong>{processedRequests.length}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="panel network-panel" style={{ marginTop: 20 }}>
        <div className="panel-header">
          <div>
            <h3>Live Circular Network</h3>
            <p>Complete digital material lifecycle.</p>
          </div>
          <span className="status-live">
            <span />
            SYSTEM ACTIVE
          </span>
        </div>

        <div className="network-flow">
          <div className="flow-box">
            <div className="flow-box-icon">
              <Building2 size={19} />
            </div>
            <strong>Waste Sources</strong>
            <span>{users.filter((u) => u.role === "source").length} partners</span>
          </div>

          <ArrowRight />

          <div className="flow-box">
            <div className="flow-box-icon">
              <Truck size={19} />
            </div>
            <strong>Collectors</strong>
            <span>
              {users.filter((u) => u.role === "collection").length} partners
            </span>
          </div>

          <ArrowRight />

          <div className="flow-box">
            <div className="flow-box-icon">
              <Recycle size={19} />
            </div>
            <strong>Recovery Centers</strong>
            <span>{users.filter((u) => u.role === "recovery").length} partners</span>
          </div>

          <ArrowRight />

          <div className="flow-box">
            <div className="flow-box-icon">
              <Factory size={19} />
            </div>
            <strong>Manufacturers</strong>
            <span>{users.filter((u) => u.role === "buyer").length} partners</span>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <div className="panel-header">
          <div>
            <h3>Recent Network Activity</h3>
            <p>Latest events across the ecosystem.</p>
          </div>
          <button className="text-button" onClick={() => setPage("network")}>
            View all
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="verification-list">
          {recentActivity.map((activity) => (
            <div
              className="verification-row"
              key={`${activity.type}-${activity.id}`}
            >
              <div className="verification-avatar">
                {activity.type === "order" ? (
                  <ShoppingCart size={17} />
                ) : (
                  <Recycle size={17} />
                )}
              </div>
              <div className="verification-info">
                <strong>{activity.title}</strong>
                <span>{activity.description}</span>
                <small>{dateText(activity.date)}</small>
              </div>
              <StatusBadge status={activity.status} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}


/* =========================================================
   ADMIN — ENVIRONMENTAL IMPACT METRICS
========================================================= */

function EnvironmentalImpactPage({ requests, orders }) {
  // Prototype-only factors for demonstration. These are intentionally
  // presented as estimates rather than certified environmental accounting.
  const impactFactors = {
    Plastic: { co2: 1.8, landfill: 1.0 },
    Paper: { co2: 0.9, landfill: 1.0 },
    Metal: { co2: 3.2, landfill: 1.0 },
    Glass: { co2: 0.5, landfill: 1.0 },
    "E-Waste": { co2: 2.4, landfill: 1.0 },
    Textile: { co2: 2.0, landfill: 1.0 },
  };

  const processed = requests.filter(
    (r) => r.recoveryStatus === "Processed",
  );

  const recoveredKg = processed.reduce(
    (sum, r) => sum + Number(r.verifiedWeight || 0),
    0,
  );

  const soldKg = orders.reduce(
    (sum, o) => sum + Number(o.quantity || 0),
    0,
  );

  const divertedKg = processed.reduce(
    (sum, r) =>
      sum +
      Number(r.verifiedWeight || 0) *
        (impactFactors[r.material]?.landfill || 1),
    0,
  );

  const estimatedCo2Kg = processed.reduce(
    (sum, r) =>
      sum +
      Number(r.verifiedWeight || 0) *
        (impactFactors[r.material]?.co2 || 1),
    0,
  );

  const totalRequestedKg = requests.reduce(
    (sum, r) => sum + Number(r.quantity || 0),
    0,
  );

  const recoveryRate =
    totalRequestedKg > 0
      ? Math.round((recoveredKg / totalRequestedKg) * 100)
      : 0;

  const reuseRate =
    recoveredKg > 0 ? Math.round((soldKg / recoveredKg) * 100) : 0;

  const circularityScore = Math.round(
    recoveryRate * 0.6 + reuseRate * 0.4,
  );

  const byMaterial = Object.keys(DEFAULT_PRICES)
    .map((material) => {
      const rows = processed.filter((r) => r.material === material);
      const recovered = rows.reduce(
        (sum, r) => sum + Number(r.verifiedWeight || 0),
        0,
      );
      const sold = orders
        .filter((o) => o.material === material)
        .reduce((sum, o) => sum + Number(o.quantity || 0), 0);
      const co2 = recovered * (impactFactors[material]?.co2 || 1);

      return { material, recovered, sold, co2 };
    })
    .filter((item) => item.recovered > 0 || item.sold > 0);

  return (
    <>
      <PageHeading
        eyebrow="ENVIRONMENTAL IMPACT"
        title="Circular Impact Metrics"
        description="Live prototype estimates generated from processed and reused material inside the SanchayKranti network."
      />

      <div className="verification-banner">
        <Leaf size={22} />
        <div>
          <strong>Prototype impact model</strong>
          <p>
            These values are demonstration estimates for the hackathon MVP.
            Production deployment should use verified lifecycle-assessment factors
            for each material and geography.
          </p>
        </div>
      </div>

      <div className="stats-grid four">
        <StatCard
          icon={<Recycle size={18} />}
          label="Waste Diverted"
          value={`${divertedKg.toFixed(0)} kg`}
        />

        <StatCard
          icon={<Leaf size={18} />}
          label="Estimated CO₂ Avoided"
          value={`${estimatedCo2Kg.toFixed(1)} kg CO₂e`}
        />

        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Recovery Rate"
          value={`${recoveryRate}%`}
        />

        <StatCard
          icon={<Sparkles size={18} />}
          label="Circularity Score"
          value={`${circularityScore}/100`}
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel large-panel">
          <div className="panel-header">
            <div>
              <h3>Material Impact Breakdown</h3>
              <p>Recovered quantity, reused quantity and estimated CO₂ benefit.</p>
            </div>
          </div>

          {byMaterial.length ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Recovered</th>
                    <th>Sold / Reused</th>
                    <th>Estimated CO₂ Avoided</th>
                    <th>Reuse Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {byMaterial.map((item) => {
                    const rate =
                      item.recovered > 0
                        ? Math.round((item.sold / item.recovered) * 100)
                        : 0;

                    return (
                      <tr key={item.material}>
                        <td>
                          <div className="material-name">
                            <div className="material-icon">
                              <MaterialIcon material={item.material} />
                            </div>
                            <strong>{item.material}</strong>
                          </div>
                        </td>
                        <td>{item.recovered.toFixed(0)} kg</td>
                        <td>{item.sold.toFixed(0)} kg</td>
                        <td>{item.co2.toFixed(1)} kg CO₂e</td>
                        <td><strong>{rate}%</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No impact data yet"
              text="Process material in the Recovery workflow to generate live impact metrics."
              icon={<Leaf size={25} />}
            />
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Circularity Progress</h3>
              <p>How much recovered material has reached a buyer.</p>
            </div>
          </div>

          <div className="price-list">
            <div className="price-row">
              <span>Total registered waste</span>
              <strong>{totalRequestedKg.toFixed(0)} kg</strong>
            </div>
            <div className="price-row">
              <span>Recovered material</span>
              <strong>{recoveredKg.toFixed(0)} kg</strong>
            </div>
            <div className="price-row">
              <span>Material reused by buyers</span>
              <strong>{soldKg.toFixed(0)} kg</strong>
            </div>
            <div className="price-row">
              <span>Reuse of recovered material</span>
              <strong>{reuseRate}%</strong>
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong style={{ fontSize: 12 }}>Circularity Score</strong>
              <strong style={{ color: "#278157" }}>{circularityScore}/100</strong>
            </div>

            <div
              style={{
                marginTop: 10,
                height: 10,
                borderRadius: 20,
                background: "#e2ebe6",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(circularityScore, 100)}%`,
                  height: "100%",
                  background: "#278157",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <div className="panel-header">
          <div>
            <h3>How the MVP calculates impact</h3>
            <p>Simple explainable logic for your hackathon demonstration.</p>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <span>LANDFILL DIVERSION</span>
            <strong>Processed verified weight</strong>
          </div>
          <div className="detail-item">
            <span>CO₂ ESTIMATE</span>
            <strong>Recovered kg × prototype material factor</strong>
          </div>
          <div className="detail-item">
            <span>RECOVERY RATE</span>
            <strong>Recovered weight ÷ registered weight</strong>
          </div>
          <div className="detail-item">
            <span>CIRCULARITY SCORE</span>
            <strong>60% recovery rate + 40% reuse rate</strong>
          </div>
        </div>
      </div>
    </>
  );
}

function AdminNetworkActivity({ requests, orders }) {
  const activity = [
    ...requests.map((r) => ({
      id: r.id,
      type: "Material",
      title: `${r.material} · ${r.quantity} kg`,
      partner: r.sourceName,
      status: r.recoveryStatus || r.status,
      date:
        r.processedAt ||
        r.verifiedAt ||
        r.receivedAt ||
        r.collectedAt ||
        r.acceptedAt ||
        r.createdAt,
    })),
    ...orders.map((order) => ({
      id: order.id,
      type: "Order",
      title: `${order.material} · ${order.quantity} kg`,
      partner: order.buyerName,
      status: order.status,
      date: order.orderedAt,
    })),
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  return (
    <>
      <PageHeading
        eyebrow="LIVE NETWORK"
        title="Network Activity"
        description="Material and transaction activity across SanchayKranti."
      />

      <div className="panel">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Activity</th>
                <th>Partner</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((item) => (
                <tr key={`${item.type}-${item.id}`}>
                  <td className="table-primary">{item.id}</td>
                  <td>{item.type}</td>
                  <td>{item.title}</td>
                  <td>{item.partner}</td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>{dateText(item.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function AdminPartners({ users }) {
  const roleName = {
    source: "Waste Source",
    collection: "Collection Partner",
    recovery: "Recovery Partner",
    buyer: "Buyer / Manufacturer",
    admin: "Administrator",
  };

  return (
    <>
      <PageHeading
        eyebrow="ECOSYSTEM"
        title="Network Partners"
        description="Organizations participating in the circular economy network."
      />

      <div className="stats-grid four">
        <StatCard
          icon={<Building2 size={18} />}
          label="Waste Sources"
          value={users.filter((u) => u.role === "source").length}
        />
        <StatCard
          icon={<Truck size={18} />}
          label="Collectors"
          value={users.filter((u) => u.role === "collection").length}
        />
        <StatCard
          icon={<Recycle size={18} />}
          label="Recovery Centers"
          value={users.filter((u) => u.role === "recovery").length}
        />
        <StatCard
          icon={<Factory size={18} />}
          label="Manufacturers"
          value={users.filter((u) => u.role === "buyer").length}
        />
      </div>

      <div className="panel">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Partner</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((partner) => (
                <tr key={partner.id}>
                  <td className="table-primary">{partner.name}</td>
                  <td>{partner.email}</td>
                  <td>{roleName[partner.role] || partner.role}</td>
                  <td>
                    <span className="status-live">
                      <span />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function AdminTransactions({ orders }) {
  const total = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const weight = orders.reduce(
    (sum, order) => sum + Number(order.quantity || 0),
    0,
  );

  return (
    <>
      <PageHeading
        eyebrow="MARKETPLACE"
        title="Material Transactions"
        description="Recovered-material purchases made through the network."
      />

      <div className="stats-grid four">
        <StatCard icon={<ShoppingCart size={18} />} label="Orders" value={orders.length} />
        <StatCard icon={<Boxes size={18} />} label="Material Sold" value={`${weight} kg`} />
        <StatCard
          icon={<IndianRupee size={18} />}
          label="Transaction Value"
          value={money(total)}
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Network Status"
          value="Active"
        />
      </div>

      <div className="panel">
        {orders.length ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Buyer</th>
                  <th>Material</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="table-primary">{order.id}</td>
                    <td>{order.buyerName}</td>
                    <td>{order.material}</td>
                    <td>{order.quantity} kg</td>
                    <td>{money(order.pricePerKg)}/kg</td>
                    <td>
                      <strong>{money(order.total)}</strong>
                    </td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No transactions yet"
            text="Buyer purchases will automatically appear here."
          />
        )}
      </div>
    </>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [authMode, setAuthMode] = useState("login");

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
      return null;
    }
  });

  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : DEMO_USERS;
    } catch {
      return DEMO_USERS;
    }
  });

  const [requests, setRequests] = useState(() => {
    try {
      const stored = localStorage.getItem(REQUEST_KEY);
      return stored ? JSON.parse(stored) : SAMPLE_REQUESTS;
    } catch {
      return SAMPLE_REQUESTS;
    }
  });

  const [prices, setPrices] = useState(() => {
    try {
      const stored = localStorage.getItem(PRICE_KEY);
      return stored
        ? { ...DEFAULT_PRICES, ...JSON.parse(stored) }
        : DEFAULT_PRICES;
    } catch {
      return DEFAULT_PRICES;
    }
  });

  const [demands, setDemands] = useState(() => {
    try {
      const stored = localStorage.getItem(DEMAND_KEY);
      return stored ? JSON.parse(stored) : SAMPLE_DEMANDS;
    } catch {
      return SAMPLE_DEMANDS;
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const stored = localStorage.getItem(ORDER_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [page, setPage] = useState("dashboard");
  const [passportId, setPassportId] = useState(null);

  useEffect(() => {
    localStorage.setItem(USER_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(REQUEST_KEY, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(PRICE_KEY, JSON.stringify(prices));
  }, [prices]);

  useEffect(() => {
    localStorage.setItem(DEMAND_KEY, JSON.stringify(demands));
  }, [demands]);

  useEffect(() => {
    localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  function openAuth(mode) {
    setAuthMode(mode);
    setScreen("auth");
  }

  function login(email, password) {
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );

    if (!found) {
      return { ok: false, message: "Invalid email or password." };
    }

    setUser(found);
    setPage("dashboard");
    return { ok: true };
  }

  function register(form) {
    const exists = users.some(
      (u) => u.email.toLowerCase() === form.email.toLowerCase(),
    );

    if (exists) return { ok: false, message: "Account already exists." };

    const newUser = {
      id: userId(),
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    };

    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    setPage("dashboard");
    return { ok: true };
  }

  function logout() {
    setUser(null);
    setPage("dashboard");
    setScreen("landing");
  }

  function addRequest(data) {
    setRequests((prev) => [data, ...prev]);
  }

  function updateRequest(id, updates) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    );
  }

  function acceptRequest(id) {
    updateRequest(id, {
      status: "Accepted",
      collectionPartner: user?.name || "Collection Partner",
      acceptedAt: new Date().toISOString(),
    });
  }

  function collectRequest(id) {
    updateRequest(id, {
      status: "Collected",
      collectedAt: new Date().toISOString(),
      recoveryStatus: "Awaiting Recovery",
    });
  }

  function receiveMaterial(id) {
    updateRequest(id, {
      recoveryPartner: user?.name || "Recovery Partner",
      recoveryStatus: "Received",
      receivedAt: new Date().toISOString(),
    });
  }

  function verifyMaterial(id, verifiedWeight, grade, pricePerKg) {
    const weight = Number(verifiedWeight);
    const price = Number(pricePerKg);

    updateRequest(id, {
      recoveryStatus: "Verified",
      verifiedWeight: weight,
      availableQuantity: weight,
      grade,
      pricePerKg: price,
      recoveredValue: weight * price,
      verifiedAt: new Date().toISOString(),
    });
  }

  function markProcessed(id) {
    updateRequest(id, {
      recoveryStatus: "Processed",
      processedAt: new Date().toISOString(),
    });
  }

  function addDemand(data) {
    setDemands((prev) => [data, ...prev]);
  }

  function buyMaterial(requestIdValue, quantity) {
    const material = requests.find((r) => r.id === requestIdValue);
    if (!material) return;

    const available =
      material.availableQuantity ?? material.verifiedWeight ?? 0;
    const qty = Number(quantity);

    if (qty <= 0) {
      alert("Enter valid quantity.");
      return;
    }

    if (qty > available) {
      alert(`Only ${available} kg is available.`);
      return;
    }

    const total = qty * Number(material.pricePerKg || 0);

    const order = {
      id: orderId(),
      buyerEmail: user.email,
      buyerName: user.name,
      requestId: material.id,
      recoveryPartner: material.recoveryPartner,
      material: material.material,
      grade: material.grade,
      quantity: qty,
      pricePerKg: material.pricePerKg,
      total,
      status: "Ordered",
      orderedAt: new Date().toISOString(),
    };

    setOrders((prev) => [order, ...prev]);
    updateRequest(material.id, {
      availableQuantity: available - qty,
    });

    alert(`Order placed successfully!\n\n${qty} kg ${material.material}\nTotal: ${money(total)}`);
  }


  function openPassport(id) {
    setPassportId(id);
  }

  function closePassport() {
    setPassportId(null);
  }

  const publicPassportId = new URLSearchParams(window.location.search).get("passport");

  if (publicPassportId) {
    return (
      <MaterialPassport
        request={requests.find((r) => r.id === publicPassportId)}
        orders={orders}
        publicView
      />
    );
  }

  if (passportId) {
    return (
      <MaterialPassport
        request={requests.find((r) => r.id === passportId)}
        orders={orders}
        onBack={closePassport}
      />
    );
  }

  if (!user) {
    if (screen === "auth") {
      return (
        <AuthPage
          mode={authMode}
          setMode={setAuthMode}
          onBack={() => setScreen("landing")}
          login={login}
          register={register}
        />
      );
    }

    return <LandingPage openAuth={openAuth} />;
  }

  let content = null;

  if (user.role === "source") {
    if (page === "dashboard") {
      content = (
        <SourceDashboard user={user} requests={requests} setPage={setPage} />
      );
    }
    if (page === "new-request") {
      content = (
        <NewRequest user={user} addRequest={addRequest} setPage={setPage} />
      );
    }
    if (page === "my-requests") {
      content = <MyRequests user={user} requests={requests} />;
    }
  }

  if (user.role === "collection") {
    if (page === "dashboard") {
      content = (
        <CollectionDashboard
          requests={requests}
          setPage={setPage}
          acceptRequest={acceptRequest}
          collectRequest={collectRequest}
        />
      );
    }
    if (page === "requests") {
      content = (
        <CollectionRequests
          requests={requests}
          acceptRequest={acceptRequest}
          collectRequest={collectRequest}
        />
      );
    }
    if (page === "today") {
      content = <CollectionHistory requests={requests} />;
    }
    if (page === "earnings") {
      content = <Earnings requests={requests} />;
    }
  }

  if (user.role === "recovery") {
    if (page === "dashboard") {
      content = (
        <RecoveryDashboard requests={requests} receiveMaterial={receiveMaterial} />
      );
    }
    if (page === "incoming") {
      content = <IncomingPage requests={requests} receiveMaterial={receiveMaterial} />;
    }
    if (page === "verification") {
      content = (
        <VerificationPage
          requests={requests}
          verifyMaterial={verifyMaterial}
          prices={prices}
        />
      );
    }
    if (page === "inventory") {
      content = (
        <InventoryPage requests={requests} markProcessed={markProcessed} />
      );
    }
    if (page === "prices") {
      content = <PriceBoard prices={prices} setPrices={setPrices} />;
    }
    if (page === "processed") {
      content = <ProcessedPage requests={requests} orders={orders} openPassport={openPassport} />;
    }
    if (page === "passports") {
      content = <PassportLibrary requests={requests} orders={orders} openPassport={openPassport} />;
    }
  }

  if (user.role === "buyer") {
    if (page === "dashboard") {
      content = (
        <BuyerDashboard
          user={user}
          requests={requests}
          demands={demands}
          orders={orders}
          setPage={setPage}
        />
      );
    }
    if (page === "marketplace") {
      content = <Marketplace requests={requests} buyMaterial={buyMaterial} />;
    }
    if (page === "demand") {
      content = (
        <CreateDemand user={user} addDemand={addDemand} setPage={setPage} />
      );
    }
    if (page === "matching") {
      content = (
        <SmartMatching
          user={user}
          demands={demands}
          requests={requests}
          buyMaterial={buyMaterial}
        />
      );
    }
    if (page === "orders") {
      content = <BuyerOrders user={user} orders={orders} />;
    }
  }

  if (user.role === "admin") {
    if (page === "dashboard") {
      content = (
        <AdminDashboard
          users={users}
          requests={requests}
          demands={demands}
          orders={orders}
          setPage={setPage}
        />
      );
    }
    if (page === "network") {
      content = <AdminNetworkActivity requests={requests} orders={orders} />;
    }
    if (page === "partners") {
      content = <AdminPartners users={users} />;
    }
    if (page === "transactions") {
      content = <AdminTransactions orders={orders} />;
    }
    if (page === "impact") {
      content = (
        <EnvironmentalImpactPage
          requests={requests}
          orders={orders}
        />
      );
    }
    if (page === "passports") {
      content = <PassportLibrary requests={requests} orders={orders} openPassport={openPassport} />;
    }
  }

  return (
    <Layout
      user={user}
      page={page}
      setPage={setPage}
      logout={logout}
    >
      {content}
    </Layout>
  );
}
