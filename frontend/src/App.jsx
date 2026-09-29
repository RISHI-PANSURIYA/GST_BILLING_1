import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  ChevronDown,
  CircleHelp,
  FilePlus2,
  FileText,
  LayoutDashboard,
  Search,
  Settings2,
  WalletCards,
} from "lucide-react";

const filters = ["All invoices", "Paid", "Pending", "Overdue"];

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getStatus(invoice) {
  if (invoice.status === "Paid" || invoice.payment?.paymentstatus === "Paid") {
    return "Paid";
  }
  if (invoice.status === "Overdue") return "Overdue";
  return "Pending";
}

function App() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All invoices");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/invoices")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load invoices.");
        return response.json();
      })
      .then((result) => {
        if (!active) return;
        if (!result.success || !Array.isArray(result.data)) {
          throw new Error(result.message || "Unexpected invoice response.");
        }
        setInvoices(result.data);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredInvoices = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const status = getStatus(invoice);
      const matchesFilter = filter === "All invoices" || status === filter;
      const matchesSearch =
        !searchTerm ||
        String(invoice.invoiceid).toLowerCase().includes(searchTerm) ||
        (invoice.customer?.name || "").toLowerCase().includes(searchTerm);

      return matchesFilter && matchesSearch;
    });
  }, [filter, invoices, query]);

  const summary = useMemo(() => {
    const paid = invoices.filter((invoice) => getStatus(invoice) === "Paid");
    const pending = invoices.filter((invoice) => getStatus(invoice) === "Pending");

    return {
      total: invoices.reduce((sum, invoice) => sum + (Number(invoice.totalamount) || 0), 0),
      collected: paid.reduce((sum, invoice) => sum + (Number(invoice.totalamount) || 0), 0),
      outstanding: pending.reduce((sum, invoice) => sum + (Number(invoice.totalamount) || 0), 0),
      pendingCount: pending.length,
    };
  }, [invoices]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="VYAPAR home">
          <span className="brand-mark">V</span>
          <span>VYAPAR<span className="brand-period">.</span></span>
        </a>

        <div className="workspace-switcher">
          <span className="workspace-avatar">B</span>
          <span className="workspace-copy"><strong>Your business</strong><small>Business account</small></span>
          <ChevronDown size={16} />
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav className="main-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#overview"><LayoutDashboard size={18} />Overview</a>
          <a className="nav-item" href="#invoices"><FileText size={18} />Invoices<span className="nav-count">{invoices.length}</span></a>
          <a className="nav-item" href="#payments"><WalletCards size={18} />Payments</a>
        </nav>

        <div className="sidebar-bottom">
          <a className="nav-item" href="#help"><CircleHelp size={18} />Help centre</a>
          <a className="nav-item" href="#settings"><Settings2 size={18} />Settings</a>
          <div className="profile-row">
            <span className="profile-avatar">AO</span>
            <span className="workspace-copy"><strong>Account owner</strong><small>Owner</small></span>
            <ChevronDown size={16} />
          </div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>Overview</strong></div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Notifications"><Bell size={18} /><span className="notification-dot" /></button>
            <span className="topbar-divider" />
            <span className="today-label">{new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date())}</span>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <p className="eyebrow">YOUR BUSINESS AT A GLANCE</p>
              <h1>{getGreeting()}<span>.</span></h1>
              <p className="heading-subtitle">Here’s what’s happening with your business today.</p>
            </div>
            <a className="primary-button" href="#invoices"><FilePlus2 size={17} />Create invoice</a>
          </section>

          <section className="summary-grid" aria-label="Invoice summary">
            <article className="summary-card summary-card-dark">
              <div className="summary-label">Total invoiced <span className="summary-icon"><FileText size={17} /></span></div>
              <p className="summary-value">{formatCurrency(summary.total)}</p>
              <p className="summary-foot">Across {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}</p>
            </article>
            <article className="summary-card">
              <div className="summary-label">Collected <span className="summary-icon green-icon"><ArrowDownToLine size={17} /></span></div>
              <p className="summary-value">{formatCurrency(summary.collected)}</p>
              <p className="summary-foot">Payments received</p>
            </article>
            <article className="summary-card">
              <div className="summary-label">Outstanding <span className="summary-icon amber-icon"><WalletCards size={17} /></span></div>
              <p className="summary-value">{formatCurrency(summary.outstanding)}</p>
              <p className="summary-foot">{summary.pendingCount} awaiting payment</p>
            </article>
          </section>

          <section className="invoice-section" id="invoices">
            <div className="section-heading">
              <div><h2>Recent invoices</h2><p>Keep track of what’s been billed and paid.</p></div>
              <a className="text-link" href="#invoices">View all <ArrowUpRight size={15} /></a>
            </div>

            <div className="table-toolbar">
              <div className="filter-tabs" role="tablist" aria-label="Filter invoices">
                {filters.map((item) => (
                  <button
                    className={`filter-tab${filter === item ? " selected" : ""}`}
                    key={item}
                    onClick={() => setFilter(item)}
                    role="tab"
                    aria-selected={filter === item}
                  >
                    {item}
                    {item === "All invoices" && <span className="tab-count">{invoices.length}</span>}
                  </button>
                ))}
              </div>
              <label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search invoices" aria-label="Search invoices" /></label>
            </div>

            <div className="table-wrap">
              <table>
                <thead><tr><th>INVOICE</th><th>CUSTOMER</th><th>ISSUED</th><th>AMOUNT</th><th>STATUS</th><th aria-label="Actions" /></tr></thead>
                <tbody>
                  {loading && <tr><td className="table-message" colSpan="6">Loading invoices…</td></tr>}
                  {!loading && error && <tr><td className="table-message error-message" colSpan="6">{error} Check that the backend is running on port 5000.</td></tr>}
                  {!loading && !error && filteredInvoices.length === 0 && <tr><td className="table-message" colSpan="6">{invoices.length ? "No invoices match your search." : "No invoices yet. Create your first invoice to see it here."}</td></tr>}
                  {!loading && !error && filteredInvoices.map((invoice) => {
                    const status = getStatus(invoice);
                    return (
                      <tr key={invoice._id || invoice.invoiceid}>
                        <td><span className="invoice-number">INV-{String(invoice.invoiceid).padStart(4, "0")}</span></td>
                        <td><span className="customer-name">{invoice.customer?.name || "Unknown customer"}</span></td>
                        <td className="date-cell">{formatDate(invoice.invoicedate)}</td>
                        <td className="amount-cell">{formatCurrency(invoice.totalamount)}</td>
                        <td><span className={`status-pill status-${status.toLowerCase()}`}><span />{status}</span></td>
                        <td><button className="row-action" aria-label={`Open invoice ${invoice.invoiceid}`}><ArrowUpRight size={16} /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="table-footer"><span>Showing {filteredInvoices.length} of {invoices.length} invoices</span><span>Amounts in INR</span></div>
          </section>
          <footer className="page-footer">VYAPAR <span>·</span> GST billing, made clear.</footer>
        </div>
      </main>
    </div>
  );
}

export default App;