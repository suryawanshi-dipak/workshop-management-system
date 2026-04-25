import React, { useState, useEffect, useRef } from 'react';
import { carService, customerService } from '../services/api';
import { useToast } from '../components/Toast';

const MOCK_CARS = [
  { id: 1, carId: 'CAR-001', brand: 'BMW', model: '3 Series', year: 2019, licensePlate: 'AB-123-CD', vin: 'WBA1234567890', color: 'Black', customerId: 'CUST-001', customerName: 'Jan de Vries', mileage: 58000 },
  { id: 2, carId: 'CAR-002', brand: 'Audi', model: 'A4', year: 2021, licensePlate: 'EF-456-GH', vin: 'WAUZ1234567890', color: 'Silver', customerId: 'CUST-002', customerName: 'Anna Bakker', mileage: 24000 },
  { id: 3, carId: 'CAR-003', brand: 'Volkswagen', model: 'Golf', year: 2018, licensePlate: 'IJ-789-KL', vin: 'WVWZ1234567890', color: 'White', customerId: 'CUST-003', customerName: 'Pieter Smit', mileage: 92000 },
  { id: 4, carId: 'CAR-004', brand: 'Ford', model: 'Focus', year: 2020, licensePlate: 'MN-012-OP', vin: 'WF0Z1234567890', color: 'Blue', customerId: 'CUST-004', customerName: 'Maria Jansen', mileage: 41000 },
  { id: 5, carId: 'CAR-005', brand: 'Toyota', model: 'Corolla', year: 2022, licensePlate: 'QR-345-ST', vin: 'SB1J1234567890', color: 'Red', customerId: 'CUST-005', customerName: 'Thomas Visser', mileage: 11000 },
];

const MOCK_CUSTOMERS = [
  { id: 1, customerId: 'CUST-001', firstName: 'Jan',    lastName: 'de Vries', city: 'Amsterdam' },
  { id: 2, customerId: 'CUST-002', firstName: 'Anna',   lastName: 'Bakker',   city: 'Rotterdam' },
  { id: 3, customerId: 'CUST-003', firstName: 'Pieter', lastName: 'Smit',     city: 'Utrecht'   },
  { id: 4, customerId: 'CUST-004', firstName: 'Maria',  lastName: 'Jansen',   city: 'Den Haag'  },
  { id: 5, customerId: 'CUST-005', firstName: 'Thomas', lastName: 'Visser',   city: 'Eindhoven' },
];

const BRANDS = ['Audi','BMW','Citroën','Dacia','Fiat','Ford','Honda','Hyundai','Kia','Mazda','Mercedes-Benz','Nissan','Opel','Peugeot','Renault','Seat','Skoda','Toyota','Volkswagen','Volvo'];

function CarBadge({ brand }) {
  const colors = { BMW: '#1c69d4', Audi: '#bb0a30', Volkswagen: '#001e50', Ford: '#003380', Toyota: '#eb0a1e' };
  const bg = colors[brand] || 'var(--navy)';
  return (
    <div style={{ width: 36, height: 36, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700, flexShrink: 0, letterSpacing: '0.04em' }}>
      {brand?.slice(0, 3).toUpperCase()}
    </div>
  );
}

function Avatar({ name }) {
  const safeName = String(name || '').trim();

  const initials = safeName
    ? safeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '--';

  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: 'var(--navy)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 600,
        flexShrink: 0
      }}
    >
      {initials}
    </div>
  );
}

// ── Customer Picker ──────────────────────────────────────────────────────────
function CustomerPicker({ customers, selectedCustomerId, onSelect }) {
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    return !q || fullName.includes(q) || (c.customerId || '').toLowerCase().includes(q) || (c.city || '').toLowerCase().includes(q);
  });

  return (
    <div>
      <input
        ref={inputRef}
        className="form-input"
        placeholder="Search by name, ID or city…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--gray-400)', fontSize: 13 }}>No customers match</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
          {filtered.map(c => {
            const fullName = `${c.firstName} ${c.lastName}`;
            const isSelected = c.customerId === selectedCustomerId;
            return (
              <button
                key={c.customerId}
                type="button"
                onClick={() => onSelect(c)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                  background: isSelected ? 'rgba(13,43,92,0.08)' : 'var(--gray-50)',
                  border: isSelected ? '1.5px solid var(--navy)' : '1.5px solid var(--gray-200)',
                  transition: 'all 0.15s', textAlign: 'left',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--gray-400)'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--gray-200)'; }}
              >
                <Avatar name={fullName} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: isSelected ? 600 : 500, fontSize: 13, color: isSelected ? 'var(--navy)' : 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fullName}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 1 }}>{c.customerId}{c.city ? ` · ${c.city}` : ''}</div>
                </div>
                {isSelected && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Cars() {
  const { addToast } = useToast();
  const [cars, setCars] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ brand: '', model: '', year: '', licensePlate: '', vin: '', customerId: '', customerName: '', mileage: '' });

  useEffect(() => { fetchCars(); fetchCustomers(); }, []);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await carService.getAll();
      setCars(res.data?.length ? res.data : MOCK_CARS);
    } catch { setCars(MOCK_CARS); }
    finally { setLoading(false); }
  };

  const fetchCustomers = async () => {
    try {
      const res = await customerService.getAll();
      const list = Array.isArray(res.data) && res.data.length ? res.data : MOCK_CUSTOMERS;
      setCustomers(list);
    } catch { setCustomers(MOCK_CUSTOMERS); }
  };

  const openNew = () => {
    setEditItem(null);
    setForm({ brand: '', model: '', year: '', licensePlate: '', vin: '', color: '', customerId: '', customerName: '', mileage: '' });
    setShowCustomerPicker(false);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditItem(c);
    setForm({
      brand: c.brand || '', model: c.model || '', year: c.year || '',
      licensePlate: c.licensePlate || '', vin: c.vin || '', 
      customerId: c.customerId || '', customerName: c.customerName || '', mileage: c.mileage || '',
    });
    setShowCustomerPicker(false);
    setShowModal(true);
  };

  const handleCustomerSelect = (customer) => {
    const fullName = `${customer.firstName} ${customer.lastName}`;
    setForm(f => ({ ...f, customerId: customer.customerId, customerName: fullName }));
    setShowCustomerPicker(false);
  };

  const handleSave = async () => {
    if (!form.brand || !form.model) { addToast('Make and model are required.', 'error'); return; }
    setSaving(true);
    // Save customerId (not customerName) to the backend
    const payload = {
      brand: form.brand, model: form.model, year: form.year,
      licensePlate: form.licensePlate, vin: form.vin, 
      customerId: form.customerId, mileage: form.mileage,
    };
    try {
      if (editItem) { await carService.update(editItem.id, payload); addToast('Car updated.', 'success'); }
      else { await carService.create(payload); addToast('Car added.', 'success'); }
      setShowModal(false); fetchCars();
    } catch { addToast('Saved in demo mode.', 'error'); setShowModal(false); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Remove ${c.brand} ${c.model}?`)) return;
    try { await carService.delete(c.id); addToast('Car removed.', 'success'); fetchCars(); }
    catch { addToast('Delete failed.', 'error'); }
  };

  const filtered = cars.filter(c => {
    const q = filter.toLowerCase();
    return !q || `${c.brand} ${c.model}`.toLowerCase().includes(q) || (c.licensePlate || '').toLowerCase().includes(q) || (c.customerName || '').toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Cars</h1>
          <p className="page-subtitle">{cars.length} registered vehicles</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Car
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input className="form-input" placeholder="Search by brand, model, plate, owner…" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 320 }} />
      </div>

      <div className="card">
        <div className="table-container">
          {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner"/></div> : (
            <table>
              <thead>
                <tr><th>Vehicle</th><th>Car ID</th><th>License Plate</th><th>VIN</th><th>Owner</th><th>Mileage</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CarBadge brand={c.brand} />
                        <div>
                          <div style={{ fontWeight: 500 }}>{c.brand} {c.model}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{c.year}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--navy)', fontWeight: 500, fontSize: 12 }}>{c.carId}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13, background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--gray-200)' }}>{c.licensePlate}</span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gray-500)' }}>{c.vin}</td>
                    <td style={{ color: 'var(--gray-700)' }}>{c.customerName || c.customerId}</td>
                    <td style={{ color: 'var(--gray-600)' }}>{c.mileage ? `${c.mileage.toLocaleString()} km` : '—'}</td>
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
                {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px 0' }}>No cars found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 17, fontFamily: 'var(--font-display)' }}>{editItem ? 'Edit Car' : 'Add Car'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Make *</label>
                  <select className="form-input" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}>
                    <option value="">Select brand…</option>
                    {BRANDS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Model *</label>
                  <input className="form-input" placeholder="e.g. Golf" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input className="form-input" type="number" placeholder="2020" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">License Plate</label>
                  <input className="form-input" placeholder="AB-123-CD" value={form.licensePlate} onChange={e => setForm(f => ({ ...f, licensePlate: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mileage (km)</label>
                  <input className="form-input" type="number" placeholder="0" value={form.mileage} onChange={e => setForm(f => ({ ...f, mileage: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">VIN</label>
                <input className="form-input" placeholder="17-character VIN" value={form.vin} onChange={e => setForm(f => ({ ...f, vin: e.target.value.toUpperCase() }))} />
              </div>

              {/* ── Customer picker ── */}
              <div className="form-group">
                <label className="form-label">Owner</label>
                {form.customerId ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', border: '1.5px solid var(--navy)', borderRadius: 'var(--radius-sm)', background: 'rgba(13,43,92,0.04)' }}>
                    <Avatar name={form.customerName || form.customerId} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--gray-900)' }}>{form.customerName || form.customerId}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{form.customerId}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCustomerPicker(v => !v)}
                      style={{ fontSize: 12, color: 'var(--navy)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: '2px 6px' }}
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, customerId: '', customerName: '' }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 2, display: 'flex' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCustomerPicker(v => !v)}
                    className="form-input"
                    style={{ textAlign: 'left', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 8, background: 'white' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    Select customer…
                  </button>
                )}

                {/* Inline customer picker panel */}
                {showCustomerPicker && (
                  <div style={{ marginTop: 8, padding: 14, border: '1px solid var(--gray-200)', borderRadius: 10, background: 'white', boxShadow: 'var(--shadow-md)' }}>
                    <CustomerPicker
                      customers={customers}
                      selectedCustomerId={form.customerId}
                      onSelect={handleCustomerSelect}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
                {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Car'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
