import { useEffect, useState } from "react";
import { ArrowUpRight, BadgeCheck, Mail, MapPin, Phone, Plus, UserRound, X } from "lucide-react";
import { readApiResponse } from "./api.js";

function CustomerForm({ token, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", email: "", phone_no: "", gstin: "", address: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submitCustomer(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/customers/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const result = await readApiResponse(response);
      if (!response.ok) throw new Error(result.message || result.error || "Could not add customer.");
      onCreated(result);
    } catch (submitError) {
      setError(submitError.message || "Could not add customer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="entity-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="entity-modal" role="dialog" aria-modal="true" aria-labelledby="customer-form-title">
        <header className="entity-modal-heading">
          <div><p className="eyebrow">DIRECTORY</p><h2 id="customer-form-title">Add customer</h2><p>Save a customer for future invoices.</p></div>
          <button className="icon-button" onClick={onClose} aria-label="Close customer form"><X size={19} /></button>
        </header>
        <form className="entity-form" onSubmit={submitCustomer}>
          <label className="auth-field"><span>Customer name</span><span className="auth-input-wrap"><UserRound size={16} /><input name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} minLength="2" maxLength="100" autoComplete="name" required placeholder="Full name or business name" /></span></label>
          <label className="auth-field"><span>Email address</span><span className="auth-input-wrap"><Mail size={16} /><input name="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" required placeholder="customer@company.com" /></span></label>
          <label className="auth-field"><span>Mobile number</span><span className="auth-input-wrap"><Phone size={16} /><input name="phone_no" type="tel" value={form.phone_no} onChange={(event) => setForm({ ...form, phone_no: event.target.value })} autoComplete="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength="10" required placeholder="10-digit mobile number" /></span></label>
          <label className="auth-field"><span>GSTIN</span><span className="auth-input-wrap"><BadgeCheck size={16} /><input name="gstin" value={form.gstin} onChange={(event) => setForm({ ...form, gstin: event.target.value.toUpperCase() })} autoCapitalize="characters" pattern="[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z][1-9A-Za-z]Z[0-9A-Za-z]" minLength="15" maxLength="15" required placeholder="15-character GSTIN" /></span></label>
          <label className="auth-field"><span>Address</span><span className="auth-input-wrap"><MapPin size={16} /><input name="address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} autoComplete="street-address" minLength="5" maxLength="300" required placeholder="Customer billing address" /></span></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <footer className="entity-modal-footer"><button className="secondary-button" type="button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit" disabled={submitting}>{submitting ? "Saving…" : "Add customer"}<ArrowUpRight size={16} /></button></footer>
        </form>
      </section>
    </div>
  );
}

export default function CustomerPage({ token }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/customers", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const result = await readApiResponse(response);
        if (!response.ok) throw new Error(result.message || result.error || "Could not load customers.");
        if (!Array.isArray(result)) throw new Error("The server returned an invalid customer list.");
        if (active) setCustomers(result);
      })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  function addCustomer(customer) {
    setCustomers((current) => [...current, customer]);
    setShowForm(false);
  }

  return (
    <div className="page-content">
      <section className="page-heading">
        <div><p className="eyebrow">BUSINESS DIRECTORY</p><h1>Customers<span>.</span></h1><p className="heading-subtitle">Keep customer details ready for invoicing.</p></div>
        <button className="primary-button" onClick={() => setShowForm(true)}><Plus size={17} />Add customer</button>
      </section>
      <section className="invoice-section entity-list-section">
        <div className="section-heading"><div><h2>All customers</h2><p>{customers.length} saved {customers.length === 1 ? "customer" : "customers"}</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>CUSTOMER</th><th>GSTIN</th><th>ADDRESS</th><th>EMAIL</th><th>MOBILE</th></tr></thead><tbody>
          {loading && <tr><td className="table-message" colSpan="5">Loading customers…</td></tr>}
          {!loading && error && <tr><td className="table-message error-message" colSpan="5">{error}</td></tr>}
          {!loading && !error && customers.length === 0 && <tr><td className="table-message" colSpan="5">No customers yet. Add a customer to start creating invoices.</td></tr>}
          {!loading && !error && customers.map((customer) => <tr key={customer.customerid}><td><span className="customer-name">{customer.name}</span></td><td className="date-cell">{customer.gstin || "—"}</td><td className="date-cell">{customer.address || "—"}</td><td className="date-cell">{customer.email}</td><td className="date-cell">{customer.phone_no}</td></tr>)}
        </tbody></table></div>
        <div className="table-footer"><span>Showing {customers.length} customers</span><span>Customer directory</span></div>
      </section>
      {showForm && <CustomerForm token={token} onClose={() => setShowForm(false)} onCreated={addCustomer} />}
    </div>
  );
}