import React, { useState, useEffect } from 'react';
import { carService } from '../services/api';
import { useToast } from '../components/Toast';

const MOCK = [
  { id: 1, carId: 'CAR-001', make: 'BMW', model: '3 Series', year: 2019, licensePlate: 'AB-123-CD', vin: 'WBA1234567890', color: 'Black', customerId: 'CUST-001', customerName: 'Jan de Vries', mileage: 58000 },
  { id: 2, carId: 'CAR-002', make: 'Audi', model: 'A4', year: 2021, licensePlate: 'EF-456-GH', vin: 'WAUZ1234567890', color: 'Silver', customerId: 'CUST-002', customerName: 'Anna Bakker', mileage: 24000 },
  { id: 3, carId: 'CAR-003', make: 'Volkswagen', model: 'Golf', year: 2018, licensePlate: 'IJ-789-KL', vin: 'WVWZ1234567890', color: 'White', customerId: 'CUST-003', customerName: 'Pieter Smit', mileage: 92000 },
  { id: 4, carId: 'CAR-004', make: 'Ford', model: 'Focus', year: 2020, licensePlate: 'MN-012-OP', vin: 'WF0Z1234567890', color: 'Blue', customerId: 'CUST-004', customerName: 'Maria Jansen', mileage: 41000 },
  { id: 5, carId: 'CAR-005', make: 'Toyota', model: 'Corolla', year: 2022, licensePlate: 'QR-345-ST', vin: 'SB1J1234567890', color: 'Red', customerId: 'CUST-005', customerName: 'Thomas Visser', mileage: 11000 },
];

const MAKES = ['Audi','BMW','Citroën','Dacia','Fiat','Ford','Honda','Hyundai','Kia','Mazda','Mercedes-Benz','Nissan','Opel','Peugeot','Renault','Seat','Skoda','Toyota','Volkswagen','Volvo'];

function CarBadge({ make }) {
  const colors = { BMW: '#1c69d4', Audi: '#bb0a30', Volkswagen: '#001e50', Ford: '#003380', Toyota: '#eb0a1e', Audi: '#bb0a30' };
  const bg = colors[make] || 'var(--navy)';
  return (
    <div style={{ width: 36, height: 36, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700, flexShrink: 0, letterSpacing: '0.04em' }}>
      {make?.slice(0,3).toUpperCase()}
    </div>
  );
}

export default function Cars() {
  const { addToast } = useToast();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ make: '', model: '', year: '', licensePlate: '', vin: '', color: '', customerId: '', mileage: '' });

  useEffect(() => { fetchCars(); }, []);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await carService.getAll();
      setCars(res.data?.length ? res.data : MOCK);
    } catch { setCars(MOCK); }
    finally { setLoading(false); }
  };

  const openNew = () => { setEditItem(null); setForm({ make: '', model: '', year: '', licensePlate: '', vin: '', color: '', customerId: '', mileage: '' }); setShowModal(true); };
  const openEdit = (c) => { setEditItem(c); setForm({ make: c.make || '', model: c.model || '', year: c.year || '', licensePlate: c.licensePlate || '', vin: c.vin || '', color: c.color || '', customerId: c.customerId || '', mileage: c.mileage || '' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.make || !form.model) { addToast('Make and model are required.', 'error'); return; }
    setSaving(true);
    try {
      if (editItem) { await carService.update(editItem.id, form); addToast('Car updated.', 'success'); }
      else { await carService.create(form); addToast('Car added.', 'success'); }
      setShowModal(false); fetchCars();
    } catch { addToast('Saved in demo mode.', 'error'); setShowModal(false); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Remove ${c.make} ${c.model}?`)) return;
    try { await carService.delete(c.id); addToast('Car removed.', 'success'); fetchCars(); }
    catch { addToast('Delete failed.', 'error'); }
  };

  const filtered = cars.filter(c => {
    const q = filter.toLowerCase();
    return !q || `${c.make} ${c.model}`.toLowerCase().includes(q) || (c.licensePlate || '').toLowerCase().includes(q) || (c.customerName || '').toLowerCase().includes(q);
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
        <input className="form-input" placeholder="Search by make, model, plate, owner..." value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 320 }} />
      </div>

      <div className="card">
        <div className="table-container">
          {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner"/></div> : (
            <table>
              <thead>
                <tr><th>Vehicle</th><th>Car ID</th><th>License Plate</th><th>VIN</th><th>Color</th><th>Owner</th><th>Mileage</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CarBadge make={c.make} />
                        <div>
                          <div style={{ fontWeight: 500 }}>{c.make} {c.model}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{c.year}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--navy)', fontWeight: 500, fontSize: 12 }}>{c.carId}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13, background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--gray-200)' }}>{c.licensePlate}</span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gray-500)' }}>{c.vin}</td>
                    <td style={{ color: 'var(--gray-600)' }}>{c.color}</td>
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
                {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px 0' }}>No cars found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
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
                  <select className="form-input" value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))}>
                    <option value="">Select make...</option>
                    {MAKES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Model *</label><input className="form-input" placeholder="e.g. Golf" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group"><label className="form-label">Year</label><input className="form-input" type="number" placeholder="2020" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Color</label><input className="form-input" placeholder="e.g. Black" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group"><label className="form-label">License Plate</label><input className="form-input" placeholder="AB-123-CD" value={form.licensePlate} onChange={e => setForm(f => ({ ...f, licensePlate: e.target.value.toUpperCase() }))} /></div>
                <div className="form-group"><label className="form-label">Mileage (km)</label><input className="form-input" type="number" placeholder="0" value={form.mileage} onChange={e => setForm(f => ({ ...f, mileage: e.target.value }))} /></div>
              </div>
              <div className="form-group"><label className="form-label">VIN</label><input className="form-input" placeholder="17-character VIN" value={form.vin} onChange={e => setForm(f => ({ ...f, vin: e.target.value.toUpperCase() }))} /></div>
              <div className="form-group"><label className="form-label">Customer ID</label><input className="form-input" placeholder="CUST-001" value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
                {saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Car'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
