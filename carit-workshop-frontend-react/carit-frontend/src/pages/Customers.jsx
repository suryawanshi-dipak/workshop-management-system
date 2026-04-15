import React, { useState, useEffect } from 'react';
import { customerService } from '../services/api';
import { useToast } from '../components/Toast';

const MOCK = [
  { id: 1, customerId: 'CUST-001', firstName: 'Jan', lastName: 'de Vries', email: 'jan.devries@email.com', phone: '+31 6 12345678', city: 'Amsterdam', createdAt: '2023-06-10' },
  { id: 2, customerId: 'CUST-002', firstName: 'Anna', lastName: 'Bakker', email: 'anna.bakker@email.com', phone: '+31 6 23456789', city: 'Rotterdam', createdAt: '2023-07-22' },
  { id: 3, customerId: 'CUST-003', firstName: 'Pieter', lastName: 'Smit', email: 'p.smit@email.com', phone: '+31 6 34567890', city: 'Utrecht', createdAt: '2023-09-05' },
  { id: 4, customerId: 'CUST-004', firstName: 'Maria', lastName: 'Jansen', email: 'maria.j@email.com', phone: '+31 6 45678901', city: 'Den Haag', createdAt: '2023-11-18' },
  { id: 5, customerId: 'CUST-005', firstName: 'Thomas', lastName: 'Visser', email: 'thomas.v@email.com', phone: '+31 6 56789012', city: 'Eindhoven', createdAt: '2024-01-03' },
];

function Avatar({ name }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--navy)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export default function Customers() {
  const { addToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', city: '', address: '' });

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerService.getAll();
      setCustomers(res.data?.length ? res.data : MOCK);
    } catch { setCustomers(MOCK); }
    finally { setLoading(false); }
  };

  const openNew = () => { setEditItem(null); setForm({ firstName: '', lastName: '', email: '', phone: '', city: '', address: '' }); setShowModal(true); };
  const openEdit = (c) => { setEditItem(c); setForm({ firstName: c.firstName || '', lastName: c.lastName || '', email: c.email || '', phone: c.phone || '', city: c.city || '', address: c.address || '' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName) { addToast('First and last name are required.', 'error'); return; }
    setSaving(true);
    try {
      if (editItem) { await customerService.update(editItem.id, form); addToast('Customer updated.', 'success'); }
      else { await customerService.create(form); addToast('Customer created.', 'success'); }
      setShowModal(false); fetchCustomers();
    } catch { addToast('Saved in demo mode.', 'error'); setShowModal(false); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete ${c.firstName} ${c.lastName}?`)) return;
    try { await customerService.delete(c.id); addToast('Customer deleted.', 'success'); fetchCustomers(); }
    catch { addToast('Delete failed.', 'error'); }
  };

  const filtered = customers.filter(c => {
    const q = filter.toLowerCase();
    return !q || `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.city || '').toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{customers.length} registered customers</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Customer
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input className="form-input" placeholder="Search by name, email, city..." value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 300 }} />
      </div>

      <div className="card">
        <div className="table-container">
          {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner"/></div> : (
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
                    <td style={{ color: 'var(--gray-600)' }}>{c.email}</td>
                    <td style={{ color: 'var(--gray-600)' }}>{c.phone}</td>
                    <td>{c.city || '—'}</td>
                    <td style={{ color: 'var(--gray-500)' }}>{c.createdAt}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" onClick={() => openEdit(c)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="btn-icon" onClick={() => handleDelete(c)} style={{ color: 'var(--danger)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px 0' }}>No customers found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 17, fontFamily: 'var(--font-display)' }}>{editItem ? 'Edit Customer' : 'New Customer'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Last Name *</label><input className="form-input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></div>
              </div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
                {saving ? 'Saving...' : editItem ? 'Save Changes' : 'Create Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
