import React, { useState, useEffect, useRef } from 'react';
import { orderService, carService, customerService } from '../services/api';
import { useToast } from '../components/Toast';

const STATUS_OPTIONS = ['Pending','Scheduled','In Progress','Completed','Cancelled'];
const STATUS_COLORS = { 'In Progress':'info','Completed':'success','Pending':'warning','Scheduled':'neutral','Cancelled':'danger' };
const SERVICE_TYPES = ['Oil Change','Full Service','Brake Inspection','Tire Change','Engine Diagnostics','Air Conditioning','Transmission Service','Battery Replacement','Bodywork','Pre-MOT Check'];
const PART_UNITS = ['pcs','ltr','set','kg','m'];

const uid = () => Date.now() + Math.random();
const newPart     = () => ({ id: uid(), partNumber: '', description: '', quantity: '1', unit: 'pcs', unitPrice: '' });
const newActivity = () => ({ id: uid(), activityCode: '', description: '', hours: '1', hourlyRate: '' });

const MOCK_ORDERS = [
  { id: 1, orderId: 'ORD-001', customerId: 'CUST-001', customerName: 'Jan de Vries', carId: 'CAR-001', carInfo: 'BMW 3 Series (2019)', licensePlate: 'AB-123-CD', serviceType: 'Full Service', status: 'In Progress', createdAt: '2024-01-15', price: '€280',
    partLines: [{ partNumber: 'OIL-5W30', description: 'Engine Oil 5W-30', quantity: '5', unit: 'ltr', unitPrice: '€12.00' }, { partNumber: 'FLT-001', description: 'Oil Filter', quantity: '1', unit: 'pcs', unitPrice: '€8.50' }],
    activityLines: [{ activityCode: 'ACT-OS', description: 'Oil drain and refill', hours: '0.5', hourlyRate: '€95' }] },
  { id: 2, orderId: 'ORD-002', customerId: 'CUST-002', customerName: 'Anna Bakker', carId: 'CAR-002', carInfo: 'Audi A4 (2021)', licensePlate: 'EF-456-GH', serviceType: 'Oil Change', status: 'Completed', createdAt: '2024-01-14', price: '€65', partLines: [], activityLines: [] },
  { id: 3, orderId: 'ORD-003', customerId: 'CUST-003', customerName: 'Pieter Smit', carId: 'CAR-003', carInfo: 'VW Golf (2018)', licensePlate: 'IJ-789-KL', serviceType: 'Brake Inspection', status: 'Pending', createdAt: '2024-01-14', price: '€120', partLines: [], activityLines: [] },
  { id: 4, orderId: 'ORD-004', customerId: 'CUST-004', customerName: 'Maria Jansen', carId: 'CAR-004', carInfo: 'Ford Focus (2020)', licensePlate: 'MN-012-OP', serviceType: 'Tire Change', status: 'Scheduled', createdAt: '2024-01-16', price: '€95', partLines: [], activityLines: [] },
];

const MOCK_CARS = [
  { id: 1, carId: 'CAR-001', make: 'BMW', model: '3 Series', year: 2019, licensePlate: 'AB-123-CD', color: 'Black', customerId: 'CUST-001' },
  { id: 2, carId: 'CAR-002', make: 'Audi', model: 'A4', year: 2021, licensePlate: 'EF-456-GH', color: 'Silver', customerId: 'CUST-002' },
  { id: 3, carId: 'CAR-003', make: 'Volkswagen', model: 'Golf', year: 2018, licensePlate: 'IJ-789-KL', color: 'White', customerId: 'CUST-003' },
  { id: 4, carId: 'CAR-004', make: 'Ford', model: 'Focus', year: 2020, licensePlate: 'MN-012-OP', color: 'Blue', customerId: 'CUST-004' },
  { id: 5, carId: 'CAR-005', make: 'Toyota', model: 'Corolla', year: 2022, licensePlate: 'QR-345-ST', color: 'Red', customerId: 'CUST-005' },
];

const MOCK_CUSTOMERS = [
  { id: 1, customerId: 'CUST-001', firstName: 'Jan',    lastName: 'de Vries', phone: '+31612345678', city: 'Amsterdam' },
  { id: 2, customerId: 'CUST-002', firstName: 'Anna',   lastName: 'Bakker',   phone: '+31623456789', city: 'Rotterdam' },
  { id: 3, customerId: 'CUST-003', firstName: 'Pieter', lastName: 'Smit',     phone: '+31634567890', city: 'Utrecht'   },
  { id: 4, customerId: 'CUST-004', firstName: 'Maria',  lastName: 'Jansen',   phone: '+31645678901', city: 'Den Haag'  },
  { id: 5, customerId: 'CUST-005', firstName: 'Thomas', lastName: 'Visser',   phone: '+31656789012', city: 'Eindhoven' },
];

// ── License Plate Lookup ──────────────────────────────────────────────────────
function LicenseLookup({ allCars, allCustomers, resolvedCar, resolvedCustomer, onResolved, onClear }) {
  const [plate, setPlate] = useState(resolvedCar?.licensePlate || '');
  const [status, setStatus] = useState(resolvedCar ? 'found' : 'idle');
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const lookup = (value) => {
    const norm = value.toUpperCase().trim();
    setPlate(norm);
    if (!norm) { setStatus('idle'); onClear(); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setStatus('searching');
      const car = allCars.find(c => (c.licensePlate || '').toUpperCase() === norm);
      if (!car) { setStatus('notfound'); onClear(); return; }
      const customer = allCustomers.find(c => c.customerId === car.customerId) || null;
      setStatus('found');
      onResolved(car, customer);
    }, 350);
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return (
    <div className="form-group">
      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        License Plate
        <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--gray-500)' }}>— auto-fills Customer &amp; Car</span>
      </label>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          className="form-input"
          placeholder="AB-123-CD"
          value={plate}
          onChange={e => lookup(e.target.value)}
          style={{
            fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.06em',
            paddingRight: 36,
            borderColor: status === 'found' ? 'var(--success)' : status === 'notfound' ? 'var(--danger)' : undefined,
          }}
        />
        <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
          {status === 'searching' && <span className="spinner" style={{ width: 14, height: 14 }} />}
          {status === 'found'     && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
          {status === 'notfound'  && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
        </div>
      </div>
      {status === 'notfound' && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>No car found with this license plate.</p>}
    </div>
  );
}

// ── Resolved Car + Customer summary cards — matches Planning exactly ──────────
function ResolvedCard({ car, customer }) {
  if (!car) return null;
  const makeColors = { BMW: '#1c69d4', Audi: '#bb0a30', Volkswagen: '#001e50', Ford: '#003380', Toyota: '#eb0a1e' };
  const badgeBg = makeColors[car.make] || 'var(--navy)';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {/* Car card */}
      <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--gray-50)', border: '1.5px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 7, background: badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 700, flexShrink: 0, letterSpacing: '0.04em' }}>
          {car.make?.slice(0, 3).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-900)' }}>{car.make} {car.model}</div>
          <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 1 }}>
            {car.year && <span>{car.year} · </span>}
            <span style={{ fontFamily: 'monospace' }}>{car.carId}</span>
          </div>
          {car.color && <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{car.color}</div>}
        </div>
      </div>

      {/* Customer card */}
      {customer ? (
        <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--gray-50)', border: '1.5px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--navy)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
            {`${customer.firstName?.[0] || ''}${customer.lastName?.[0] || ''}`.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-900)' }}>{customer.firstName} {customer.lastName}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 1 }}>
              <span style={{ fontFamily: 'monospace' }}>{customer.customerId}</span>
            </div>
            {customer.phone && <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{customer.phone}</div>}
          </div>
        </div>
      ) : (
        <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--warning-bg)', border: '1.5px solid #ffe0b2', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontSize: 12, color: 'var(--warning)' }}>No linked customer found</span>
        </div>
      )}
    </div>
  );
}

// ── Reusable lines table ──────────────────────────────────────────────────────
function LinesTable({ title, hint, columns, rows, onAdd, onUpdate, onRemove, addLabel }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <label className="form-label" style={{ margin: 0 }}>{title}</label>
          {hint && <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 8 }}>{hint}</span>}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onAdd} type="button">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {addLabel}
        </button>
      </div>
      <div style={{ border: '1px solid var(--gray-200)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: columns.map(c => c.width).join(' ') + ' 28px', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', padding: '6px 10px', gap: 6 }}>
          {columns.map(c => <div key={c.key} style={{ fontSize: 10, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c.label}</div>)}
          <div/>
        </div>
        {rows.map((row, idx) => (
          <div key={row.id} style={{ display: 'grid', gridTemplateColumns: columns.map(c => c.width).join(' ') + ' 28px', padding: '6px 10px', gap: 6, borderBottom: idx < rows.length - 1 ? '1px solid var(--gray-100)' : 'none', alignItems: 'center' }}>
            {columns.map(c => c.type === 'select' ? (
              <select key={c.key} className="form-input" style={{ padding: '5px 6px', fontSize: 12 }} value={row[c.key]} onChange={e => onUpdate(row.id, c.key, e.target.value)}>
                {c.options.map(o => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input key={c.key} className="form-input" style={{ padding: '5px 7px', fontSize: 12 }} type={c.inputType || 'text'} placeholder={c.placeholder} min={c.min} step={c.step} value={row[c.key]} onChange={e => onUpdate(row.id, c.key, e.target.value)} />
            ))}
            <button onClick={() => rows.length > 1 && onRemove(row.id)} style={{ background: 'none', border: 'none', cursor: rows.length > 1 ? 'pointer' : 'not-allowed', color: 'var(--gray-400)', padding: 0, opacity: rows.length > 1 ? 1 : 0.3, display: 'flex', alignItems: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const PART_COLS = [
  { key: 'partNumber',  label: 'Part No.',    width: '100px', placeholder: 'P-001' },
  { key: 'description', label: 'Description', width: '1fr',   placeholder: 'Part description' },
  { key: 'quantity',    label: 'Qty',         width: '56px',  inputType: 'number', placeholder: '1', min: '0' },
  { key: 'unit',        label: 'Unit',        width: '64px',  type: 'select', options: PART_UNITS },
  { key: 'unitPrice',   label: 'Unit Price',  width: '80px',  placeholder: '€0.00' },
];
const ACT_COLS = [
  { key: 'activityCode', label: 'Activity Code', width: '110px', placeholder: 'ACT-01' },
  { key: 'description',  label: 'Description',   width: '1fr',   placeholder: 'Labour description' },
  { key: 'hours',        label: 'Hours',          width: '64px',  inputType: 'number', placeholder: '1', min: '0', step: '0.5' },
  { key: 'hourlyRate',   label: 'Rate/hr',        width: '82px',  placeholder: '€/hr' },
];

export default function Orders() {
  const { addToast } = useToast();
  const [orders, setOrders]               = useState([]);
  const [allCars, setAllCars]             = useState([]);
  const [allCustomers, setAllCustomers]   = useState([]);
  const [loading, setLoading]             = useState(false);
  const [showModal, setShowModal]         = useState(false);
  const [editItem, setEditItem]           = useState(null);
  const [expandedRow, setExpandedRow]     = useState(null);
  const [filter, setFilter]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [saving, setSaving]               = useState(false);

  // resolved via license plate lookup
  const [resolvedCar, setResolvedCar]           = useState(null);
  const [resolvedCustomer, setResolvedCustomer] = useState(null);

  const [form, setForm]                   = useState({ serviceType: '', status: 'Pending', notes: '', price: '' });
  const [partLines, setPartLines]         = useState([newPart()]);
  const [activityLines, setActivityLines] = useState([newActivity()]);

  useEffect(() => { fetchOrders(); fetchAllCars(); fetchAllCustomers(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getAll();
      const data = res.data;
      setOrders(Array.isArray(data) && data.length ? data : MOCK_ORDERS);
    } catch { setOrders(MOCK_ORDERS); }
    finally { setLoading(false); }
  };

  const fetchAllCars = async () => {
    try {
      const res = await carService.getAll();
      setAllCars(Array.isArray(res.data) && res.data.length ? res.data : MOCK_CARS);
    } catch { setAllCars(MOCK_CARS); }
  };

  const fetchAllCustomers = async () => {
    try {
      const res = await customerService.getAll();
      setAllCustomers(Array.isArray(res.data) && res.data.length ? res.data : MOCK_CUSTOMERS);
    } catch { setAllCustomers(MOCK_CUSTOMERS); }
  };

  const openNew = () => {
    setEditItem(null);
    setResolvedCar(null);
    setResolvedCustomer(null);
    setForm({ serviceType: '', status: 'Pending', notes: '', price: '' });
    setPartLines([newPart()]);
    setActivityLines([newActivity()]);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    const car = allCars.find(c => c.carId === item.carId) || null;
    const customer = car ? allCustomers.find(c => c.customerId === car.customerId) || null : null;
    setResolvedCar(car);
    setResolvedCustomer(customer);
    setForm({ serviceType: item.serviceType || '', status: item.status || 'Pending', notes: item.notes || '', price: item.price || '' });
    setPartLines(item.partLines?.length ? item.partLines.map(p => ({ ...p, id: uid() })) : [newPart()]);
    setActivityLines(item.activityLines?.length ? item.activityLines.map(a => ({ ...a, id: uid() })) : [newActivity()]);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.serviceType) { addToast('Service type is required.', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        customerId: resolvedCustomer?.customerId || resolvedCar?.customerId || '',
        carId: resolvedCar?.carId || '',
        partLines:     partLines.filter(p => p.description),
        activityLines: activityLines.filter(a => a.description),
      };
      if (editItem) {
        await orderService.update(editItem.id, payload);
        addToast('Order updated.', 'success');
      } else {
        await orderService.create(payload);
        addToast('Order created.', 'success');
      }
      setShowModal(false);
      fetchOrders();
    } catch {
      addToast('Saved in demo mode.', 'error');
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete order ${item.orderId}?`)) return;
    try {
      await orderService.delete(item.id);
      addToast('Order deleted.', 'success');
      fetchOrders();
    } catch { addToast('Delete failed.', 'error'); }
  };

  const handleStatusChange = async (item, newStatus) => {
    try {
      await orderService.updateStatus(item.id, newStatus);
      addToast('Status updated.', 'success');
      fetchOrders();
    } catch { addToast('Status update failed.', 'error'); }
  };

  const filtered = orders.filter(o => {
    const q = filter.toLowerCase();
    const matchText = !q
      || (o.customerName || '').toLowerCase().includes(q)
      || (o.orderId || '').toLowerCase().includes(q)
      || (o.carInfo || '').toLowerCase().includes(q)
      || (o.licensePlate || '').toLowerCase().includes(q)
      || (o.serviceType || '').toLowerCase().includes(q);
    return matchText && (!statusFilter || o.status === statusFilter);
  });

  const updPart = (id, k, v) => setPartLines(ls => ls.map(l => l.id === id ? { ...l, [k]: v } : l));
  const updAct  = (id, k, v) => setActivityLines(ls => ls.map(l => l.id === id ? { ...l, [k]: v } : l));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Order
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="form-input" placeholder="Search by customer, order ID, plate, service…" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 300 }} />
        <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 160 }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          {loading
            ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner"/></div>
            : (
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 32 }}></th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Car</th>
                    <th>License</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => (
                    <React.Fragment key={o.id}>
                      <tr>
                        <td>
                          <button
                            onClick={() => setExpandedRow(expandedRow === o.id ? null : o.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 2, display: 'flex', alignItems: 'center', transition: 'transform 0.15s', transform: expandedRow === o.id ? 'rotate(90deg)' : 'none' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                          </button>
                        </td>
                        <td style={{ fontFamily: 'monospace', color: 'var(--navy)', fontWeight: 600 }}>{o.orderId}</td>
                        <td>{o.customerName || o.customerId}</td>
                        <td style={{ color: 'var(--gray-600)' }}>{o.carInfo || o.carId}</td>
                        <td>
                          {o.licensePlate
                            ? <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12, background: 'var(--gray-100)', padding: '2px 7px', borderRadius: 4, border: '1px solid var(--gray-200)' }}>{o.licensePlate}</span>
                            : <span style={{ color: 'var(--gray-400)' }}>—</span>
                          }
                        </td>
                        <td>{o.serviceType}</td>
                        <td>
                          <select
                            value={o.status}
                            onChange={e => handleStatusChange(o, e.target.value)}
                            className={`badge badge-${STATUS_COLORS[o.status] || 'neutral'}`}
                            style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, background: 'transparent', padding: '3px 6px' }}
                          >
                            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                        <td style={{ fontWeight: 500 }}>{o.price || '—'}</td>
                        <td style={{ color: 'var(--gray-500)' }}>{o.createdAt}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-icon" onClick={() => openEdit(o)} title="Edit">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button className="btn-icon" onClick={() => handleDelete(o)} title="Delete" style={{ color: 'var(--danger)' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedRow === o.id && (
                        <tr>
                          <td colSpan={10} style={{ padding: 0, background: 'var(--gray-50)' }}>
                            <div style={{ padding: '14px 20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                              {/* Part Lines */}
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                                  Part Lines
                                </div>
                                {(!o.partLines || o.partLines.length === 0)
                                  ? <p style={{ fontSize: 12, color: 'var(--gray-400)', fontStyle: 'italic' }}>No parts added</p>
                                  : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                      <thead>
                                        <tr style={{ background: 'var(--gray-100)' }}>
                                          {['Part No.','Description','Qty','Unit','Unit Price'].map(h => (
                                            <th key={h} style={{ padding: '5px 10px', fontWeight: 600, color: 'var(--gray-500)', textAlign: 'left', fontSize: 11 }}>{h}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {o.partLines.map((p, i) => (
                                          <tr key={i} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                            <td style={{ padding: '5px 10px', fontFamily: 'monospace', fontSize: 11 }}>{p.partNumber}</td>
                                            <td style={{ padding: '5px 10px' }}>{p.description}</td>
                                            <td style={{ padding: '5px 10px' }}>{p.quantity}</td>
                                            <td style={{ padding: '5px 10px', color: 'var(--gray-500)' }}>{p.unit}</td>
                                            <td style={{ padding: '5px 10px', fontWeight: 500 }}>{p.unitPrice}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                              </div>

                              {/* Activity Lines */}
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                  Activity Lines
                                </div>
                                {(!o.activityLines || o.activityLines.length === 0)
                                  ? <p style={{ fontSize: 12, color: 'var(--gray-400)', fontStyle: 'italic' }}>No activities added</p>
                                  : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                      <thead>
                                        <tr style={{ background: 'var(--gray-100)' }}>
                                          {['Activity Code','Description','Hours','Rate/hr'].map(h => (
                                            <th key={h} style={{ padding: '5px 10px', fontWeight: 600, color: 'var(--gray-500)', textAlign: 'left', fontSize: 11 }}>{h}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {o.activityLines.map((a, i) => (
                                          <tr key={i} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                            <td style={{ padding: '5px 10px', fontFamily: 'monospace', fontSize: 11 }}>{a.activityCode}</td>
                                            <td style={{ padding: '5px 10px' }}>{a.description}</td>
                                            <td style={{ padding: '5px 10px' }}>{a.hours} hr</td>
                                            <td style={{ padding: '5px 10px', fontWeight: 500 }}>{a.hourlyRate}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px 0' }}>No orders found</td></tr>
                  )}
                </tbody>
              </table>
            )}
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 17, fontFamily: 'var(--font-display)' }}>{editItem ? 'Edit Order' : 'New Order'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* ── License plate lookup zone — matches Planning layout ── */}
              <div style={{ padding: '14px 16px', background: 'rgba(13,43,92,0.03)', border: '1px solid var(--gray-200)', borderRadius: 10 }}>
                <LicenseLookup
                  allCars={allCars}
                  allCustomers={allCustomers}
                  resolvedCar={resolvedCar}
                  resolvedCustomer={resolvedCustomer}
                  onResolved={(car, customer) => { setResolvedCar(car); setResolvedCustomer(customer); }}
                  onClear={() => { setResolvedCar(null); setResolvedCustomer(null); }}
                />
                {resolvedCar && (
                  <div style={{ marginTop: 12 }}>
                    <ResolvedCard car={resolvedCar} customer={resolvedCustomer} />
                  </div>
                )}
              </div>

              {/* ── Service type + status ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Service Type *</label>
                  <select className="form-input" value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))}>
                    <option value="">Select…</option>
                    {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <LinesTable
                title="Part Lines" hint="Spare parts and materials" addLabel="Add Part"
                columns={PART_COLS} rows={partLines}
                onAdd={() => setPartLines(ls => [...ls, newPart()])}
                onUpdate={updPart}
                onRemove={id => setPartLines(ls => ls.filter(x => x.id !== id))}
              />

              <LinesTable
                title="Activity Lines" hint="Labour and workshop activities" addLabel="Add Activity"
                columns={ACT_COLS} rows={activityLines}
                onAdd={() => setActivityLines(ls => [...ls, newActivity()])}
                onUpdate={updAct}
                onRemove={id => setActivityLines(ls => ls.filter(x => x.id !== id))}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Total Price</label>
                  <input className="form-input" placeholder="€0.00" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input className="form-input" placeholder="Internal notes…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving && <span className="spinner" style={{ width: 14, height: 14 }} />}
                {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}