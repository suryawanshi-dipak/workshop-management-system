import React, { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';

const API_BASE = 'http://localhost:8083/api/customers';

const MOCK = [
  { id: 1, customerId: 'CUST-001', firstName: 'Jan',    lastName: 'de Vries', email: 'jan.devries@email.com', phone: '+31612345678', city: 'Amsterdam', createdAt: '2023-06-10' },
  { id: 2, customerId: 'CUST-002', firstName: 'Anna',   lastName: 'Bakker',   email: 'anna.bakker@email.com', phone: '+31623456789', city: 'Rotterdam', createdAt: '2023-07-22' },
  { id: 3, customerId: 'CUST-003', firstName: 'Pieter', lastName: 'Smit',     email: 'p.smit@email.com',      phone: '+31634567890', city: 'Utrecht',   createdAt: '2023-09-05' },
  { id: 4, customerId: 'CUST-004', firstName: 'Maria',  lastName: 'Jansen',   email: 'maria.j@email.com',     phone: '+31645678901', city: 'Den Haag',  createdAt: '2023-11-18' },
  { id: 5, customerId: 'CUST-005', firstName: 'Thomas', lastName: 'Visser',   email: 'thomas.v@email.com',    phone: '+31656789012', city: 'Eindhoven', createdAt: '2024-01-03' },
];

// ── Inline API helpers ──────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || res.statusText);
    err.status = res.status;
    err.body   = text;
    throw err;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const api = {
  getAll:  ()         => apiFetch(''),
  create:  (data)     => apiFetch('',       { method: 'POST',   body: JSON.stringify(data) }),
  update:  (id, data) => apiFetch(`/${id}`, { method: 'PUT',    body: JSON.stringify(data) }),
  remove:  (id)       => apiFetch(`/${id}`, { method: 'DELETE' }),
};
// ───────────────────────────────────────────────────────────────────────────

function Avatar({ name }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: 34, height: 34, borderRadius: '50%',
      background: 'var(--navy)', color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 600, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '', city: '', address: '', license: '' };

export default function Customers() {
  const { addToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [filter,    setFilter]    = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.getAll();
      setCustomers(Array.isArray(data) && data.length ? data : MOCK);
    } catch {
      setCustomers(MOCK);
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (c) => {
    setEditItem(c);
    setForm({
      firstName: c.firstName || '', lastName:  c.lastName  || '',
      email:     c.email     || '', phone:     c.phone     || '',
      city:      c.city      || '', address:   c.address   || '',
      license:   c.license   || '',
    });
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);
  const setField = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) { addToast('First and last name are required.', 'error'); return; }
    if (!form.phone.trim()) { addToast('Phone number is required.', 'error'); return; }
    setSaving(true);
    try {
      if (editItem) { await api.update(editItem.id, form); addToast('Customer updated successfully.', 'success'); }
      else          { await api.create(form);               addToast('Customer created successfully.', 'success'); }
      closeModal();
      fetchCustomers();
    } catch (err) {
      addToast(err.body || err.message || 'Could not save customer.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete ${c.firstName} ${c.lastName}?`)) return;
    try {
      await api.remove(c.id);
      addToast('Customer deleted.', 'success');
      fetchCustomers();
    } catch (err) {
      addToast(err.body || err.message || 'Delete failed.', 'error');
    }
  };

  const filtered = customers.filter(c => {
    const q = filter.toLowerCase();
    return !q
      || `${c.firstName} ${c.lastName}`.toLowerCase().includes(q)
      || (c.email      || '').toLowerCase().includes(q)
      || (c.city       || '').toLowerCase().includes(q)
      || (c.customerId || '').toLowerCase().includes(q)
      || (c.phone      || '').includes(q);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{customers.length} registered customers</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Customer
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input className="form-input" placeholder="Search by name, email, phone, city or ID…"
          value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 320 }} />
      </div>

      <div className="card">
        <div className="table-container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner"/></div>
          ) : (
            <table>
              <thead>
                <tr><th>Customer</th><th>Customer ID</th><th>Email</th><th>Phone</th><th>City</th><th>Since</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={`${c.firstName} ${c.lastName}`} />
                        <span style={{ fontWeight: 500 }}>{c.firstName} {c.lastName}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--navy)', fontWeight: 500, fontSize: 12 }}>{c.customerId}</td>
                    <td style={{ color: 'var(--gray-600)' }}>{c.email || '—'}</td>
                    <td style={{ color: 'var(--gray-600)' }}>{c.phone}</td>
                    <td>{c.city || '—'}</td>
                    <td style={{ color: 'var(--gray-500)' }}>{c.createdAt ? String(c.createdAt).slice(0, 10) : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" title="Edit" onClick={() => openEdit(c)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button className="btn-icon" title="Delete" onClick={() => handleDelete(c)} style={{ color: 'var(--danger)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px 0' }}>No customers found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 17, fontFamily: 'var(--font-display)' }}>
                {editItem ? `Edit — ${editItem.customerId}` : 'New Customer'}
              </h2>
              <button className="btn-icon" onClick={closeModal}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input className="form-input" value={form.firstName} onChange={setField('firstName')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input className="form-input" value={form.lastName} onChange={setField('lastName')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={setField('email')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" value={form.phone} onChange={setField('phone')} />
                </div>
                <div className="form-group">
                  <label className="form-label">License No.</label>
                  <input className="form-input" value={form.license} onChange={setField('license')} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={form.city} onChange={setField('city')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" value={form.address} onChange={setField('address')} />
                </div>
              </div>
              {!editItem && (
                <p style={{ fontSize: 12, color: 'var(--gray-500)', margin: 0 }}>
                  ℹ️ Customer ID (e.g. CUST-001) is auto-generated on save.
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving && <span className="spinner" style={{ width: 14, height: 14 }} />}
                {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Create Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}