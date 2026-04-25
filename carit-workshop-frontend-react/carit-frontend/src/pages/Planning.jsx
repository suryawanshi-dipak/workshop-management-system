import React, { useState, useEffect, useRef } from 'react';
import { planningService, orderService, carService, customerService } from '../services/api';
import { useToast } from '../components/Toast';

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TIME_SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];
const SERVICE_TYPES = ['Oil Change','Full Service','Brake Inspection','Tire Change','Engine Diagnostics','Air Conditioning','Transmission Service','Battery Replacement','Bodywork','Pre-MOT Check'];
const PART_UNITS = ['pcs','ltr','set','kg','m'];
const LINE_TYPES = ['Part', 'Activity'];

// ── Mock data for fallback ────────────────────────────────────────────────────
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

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay + 6) % 7;
  const days = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

const uid = () => Date.now() + Math.random();
const newLine = (type = 'Part') => ({
  id: uid(), type,
  partNumber: '', activityCode: '', description: '',
  quantity: '1', unit: 'pcs', unitPrice: '',
  hours: '1', hourlyRate: '',
});

const normalisePlannings = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  if (typeof data === 'object') return [data];
  return [];
};

const extractLines = (p) => {
  if (Array.isArray(p.lines) && p.lines.length > 0) {
    return p.lines.map((l) => ({
      ...newLine(l.lineType === 'ACTIVITY' ? 'Activity' : 'Part'),
      ...l,
      id: uid(),
      type: l.lineType === 'ACTIVITY' ? 'Activity' : 'Part',
      partNumber: l.itemCode || l.partNumber || '',
      activityCode: l.itemCode || l.activityCode || '',
      quantity: String(l.quantity ?? '1'),
      hours: String(l.quantity ?? '1'),
      unitPrice: String(l.price ?? l.unitPrice ?? ''),
      hourlyRate: String(l.price ?? l.hourlyRate ?? ''),
    }));
  }
  const parts = (p.partLines || []).map((l) => ({ ...newLine('Part'), ...l, id: uid(), type: 'Part' }));
  const acts  = (p.activityLines || []).map((l) => ({ ...newLine('Activity'), ...l, id: uid(), type: 'Activity' }));
  return [...parts, ...acts];
};

const EmptyState = ({ title, subtitle, action, onAction }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px 20px', gap: 12 }}>
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="6" y="9" width="36" height="32" rx="4" stroke="var(--gray-300)" strokeWidth="1.5" fill="none"/>
      <line x1="6" y1="17" x2="42" y2="17" stroke="var(--gray-300)" strokeWidth="1.5"/>
      <rect x="10" y="4" width="5" height="8" rx="2" fill="var(--gray-300)"/>
      <rect x="33" y="4" width="5" height="8" rx="2" fill="var(--gray-300)"/>
      <line x1="13" y1="25" x2="35" y2="25" stroke="var(--gray-200)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="13" y1="31" x2="28" y2="31" stroke="var(--gray-200)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-600)' }}>{title}</p>
      {subtitle && <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 3 }}>{subtitle}</p>}
    </div>
    {action && (
      <button className="btn btn-secondary btn-sm" onClick={onAction}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        {action}
      </button>
    )}
  </div>
);

// ── License Plate Lookup field ────────────────────────────────────────────────
function LicenseLookup({ allCars, allCustomers, onResolved, resolvedCar, resolvedCustomer, onClear }) {
  const [plate, setPlate] = useState(resolvedCar?.licensePlate || '');
  const [status, setStatus] = useState(resolvedCar ? 'found' : 'idle'); // idle | searching | found | notfound
  const debounceRef = useRef(null);

  const lookup = (value) => {
    const normalised = value.toUpperCase().trim();
    setPlate(normalised);
    if (!normalised) { setStatus('idle'); onClear(); return; }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setStatus('searching');
      const car = allCars.find(c => (c.licensePlate || '').toUpperCase() === normalised);
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

// ── Resolved vehicle + customer card ─────────────────────────────────────────
function ResolvedCard({ car, customer }) {
  if (!car) return null;
  const makeColors = { BMW: '#1c69d4', Audi: '#bb0a30', Volkswagen: '#001e50', Ford: '#003380', Toyota: '#eb0a1e' };
  const badgeBg = makeColors[car.make] || 'var(--navy)';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {/* Car card */}
      <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--gray-50)', border: '1.5px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 7, background: badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 700, flexShrink: 0, letterSpacing: '0.04em' }}>
          {car.make?.slice(0,3).toUpperCase()}
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

export default function Planning() {
  const { addToast } = useToast();
  const today = new Date();
  const [viewYear, setViewYear]     = useState(today.getFullYear());
  const [viewMonth, setViewMonth]   = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [plannings, setPlannings]   = useState([]);
  const [allCars, setAllCars]       = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [saving, setSaving]         = useState(false);

  // resolved from license plate lookup
  const [resolvedCar, setResolvedCar]           = useState(null);
  const [resolvedCustomer, setResolvedCustomer] = useState(null);

  const [form, setForm] = useState({
    serviceType: '', notes: '', duration: '60', createOrder: false, time: '',
  });
  const [lines, setLines] = useState([newLine('Part')]);

  const days = getCalendarDays(viewYear, viewMonth);

  useEffect(() => { fetchPlannings(); }, [viewYear, viewMonth]); // eslint-disable-line
  useEffect(() => { fetchAllCars(); fetchAllCustomers(); }, []);

  const fetchPlannings = async () => {
    try {
      const res = await planningService.getAll();
      setPlannings(normalisePlannings(res.data));
    } catch (e) {
      console.error('fetchPlannings error:', e);
      setPlannings([]);
    }
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

  const hasPlanningOn = (day) => {
    if (!day) return false;
    const ds = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return plannings.some((p) => p.date === ds || p.planningDate?.startsWith(ds));
  };

  const planningsForSelected = () => {
    if (!selectedDate) return [];
    const ds = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    return plannings.filter((p) => p.date === ds || p.planningDate?.startsWith(ds));
  };

  const isToday = (d) => d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isPast  = (d) => d && new Date(viewYear, viewMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => viewMonth === 0  ? (setViewMonth(11), setViewYear((y) => y - 1)) : setViewMonth((m) => m - 1);
  const nextMonth = () => viewMonth === 11 ? (setViewMonth(0),  setViewYear((y) => y + 1)) : setViewMonth((m) => m + 1);

  const updLine    = (id, k, v) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, [k]: v } : l)));
  const removeLine = (id)       => setLines((ls) => ls.length > 1 ? ls.filter((l) => l.id !== id) : ls);

  const openNew = () => {
    if (!selectedDate) { addToast('Please select a date first.', 'error'); return; }
    setEditItem(null);
    setResolvedCar(null);
    setResolvedCustomer(null);
    setForm({ serviceType: '', notes: '', duration: '60', createOrder: false, time: '' });
    setLines([newLine('Part')]);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditItem(p);
    setResolvedCar(null);
    setResolvedCustomer(null);
    // Try to pre-resolve car/customer from existing planning data
    if (p.carId) {
      const car = allCars.find(c => c.carId === p.carId) || null;
      const customer = car ? allCustomers.find(c => c.customerId === car.customerId) || null : null;
      setResolvedCar(car);
      setResolvedCustomer(customer);
    }
    setForm({
      serviceType: p.serviceType || '',
      notes:       p.notes       || '',
      duration:    p.duration    || '60',
      createOrder: false,
      time:        p.time || p.planningDate?.slice(11, 16) || '',
    });
    const extracted = extractLines(p);
    setLines(extracted.length ? extracted : [newLine('Part')]);
    setShowModal(true);
  };

  const handleDelete = async (p) => {
    if (!window.confirm('Delete this planning?')) return;
    try {
      await planningService.delete(p.id);
      addToast('Planning deleted.', 'success');
      fetchPlannings();
    } catch (e) {
      addToast('Delete failed: ' + (e?.response?.data?.message || e?.message || 'unknown error'), 'error');
    }
  };

  const handleSave = async () => {
    if (!form.time)        { addToast('Please select a time slot.', 'error');  return; }
    if (!form.serviceType) { addToast('Service type is required.',  'error');  return; }
    setSaving(true);
    try {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
      const payload = {
        planningDate: `${dateStr}T${form.time}:00`,
        date: dateStr,
        time: form.time,
        customerId: resolvedCustomer?.customerId || resolvedCar?.customerId || '',
        carId: resolvedCar?.carId || '',
        serviceType: form.serviceType,
        duration: form.duration,
        notes: form.notes,
        lines: lines
          .filter((l) => l.description)
          .map((l, index) => ({
            id: index + 1,
            lineType:    l.type === 'Part' ? 'PART' : 'ACTIVITY',
            itemCode:    l.type === 'Part' ? l.partNumber : l.activityCode,
            description: l.description,
            quantity:    Number(l.type === 'Part' ? l.quantity   : l.hours),
            price:       Number(l.type === 'Part' ? l.unitPrice  : l.hourlyRate),
          })),
      };

      if (editItem) {
        await planningService.update(editItem.id, payload);
        addToast('Planning updated!', 'success');
      } else {
        await planningService.create(payload);
        if (form.createOrder) {
          await orderService.create({ ...payload, status: 'Scheduled' });
          addToast('Planning + Order created!', 'success');
        } else {
          addToast('Planning created!', 'success');
        }
      }
      setShowModal(false);
      fetchPlannings();
    } catch (e) {
      console.error('handleSave error:', e);
      const msg = e?.response?.data?.message || e?.message || 'Unknown error';
      addToast('Save failed: ' + msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const selPlannings = planningsForSelected();
  const selLabel = selectedDate
    ? `${String(selectedDate).padStart(2, '0')} ${SHORT_MONTHS[viewMonth]} ${viewYear}`
    : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Workshop Planning</h1>
          <p className="page-subtitle">Schedule and manage workshop appointments</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Planning
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>

        {/* ── LEFT: Calendar ───────────────────────────────────── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', alignSelf: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--navy)' }}>
            <button onClick={prevMonth} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', borderRadius: 5, padding: '4px 8px', color: 'white', display: 'flex' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'white' }}>{MONTHS[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', borderRadius: 5, padding: '4px 8px', color: 'white', display: 'flex' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-100)' }}>
            {DAYS.map((d) => (
              <div key={d} style={{ textAlign: 'center', padding: '6px 0', fontSize: 10, fontWeight: 600, color: 'var(--gray-500)', letterSpacing: '0.04em' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '4px 4px 2px' }}>
            {days.map((day, i) => {
              const active    = day === selectedDate;
              const todayFlag = isToday(day);
              const past      = isPast(day);
              const hasDot    = hasPlanningOn(day);
              return (
                <div
                  key={i}
                  onClick={() => day && !past && setSelectedDate(day)}
                  style={{ height: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: day && !past ? 'pointer' : 'default', background: active ? 'var(--navy)' : 'transparent', borderRadius: 5, position: 'relative', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => { if (day && !past && !active) e.currentTarget.style.background = 'var(--gray-100)'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  {day && (
                    <>
                      <span style={{ fontSize: 12, lineHeight: 1, fontWeight: todayFlag ? 700 : 400, color: active ? 'white' : past ? 'var(--gray-300)' : todayFlag ? 'var(--rust)' : 'var(--gray-800)' }}>{day}</span>
                      {hasDot && <div style={{ width: 3, height: 3, borderRadius: '50%', background: active ? 'rgba(255,255,255,0.7)' : 'var(--amber)', marginTop: 2 }}/>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ borderTop: '1px solid var(--gray-100)', padding: '7px 12px' }}>
            <button
              onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); setSelectedDate(today.getDate()); }}
              style={{ fontSize: 11, color: 'var(--navy)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}
            >
              → Jump to today
            </button>
          </div>
        </div>

        {/* ── RIGHT: Appointments ──────────────────────────────── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                {selectedDate ? `Appointments — ${selLabel}` : 'Appointments'}
              </h3>
              {selectedDate && <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{selPlannings.length} scheduled</p>}
            </div>
          </div>
          <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', minHeight: 180 }}>
            {!selectedDate && <EmptyState title="No date selected" subtitle="Click a day in the calendar to see appointments" />}
            {selectedDate && selPlannings.length === 0 && (
              <EmptyState title={`No appointments on ${selLabel}`} subtitle="Click New Planning to schedule" action="Schedule appointment" onAction={openNew} />
            )}
            {selPlannings.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selPlannings.map((p, i) => (
                  <div key={p.id || i} style={{ padding: '12px 14px', background: 'var(--gray-50)', borderRadius: 10, borderLeft: '3px solid var(--navy)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>{p.serviceType || 'Service'}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {(p.time || p.planningDate?.slice(11, 16)) && <span>🕐 {p.time || p.planningDate?.slice(11, 16)}</span>}
                        {p.carId      && <span>Car #{p.carId}</span>}
                        {p.customerId && <span>Cust #{p.customerId}</span>}
                        {p.duration   && <span>{p.duration} min</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge badge-info" style={{ fontSize: 11 }}>Scheduled</span>
                      <button className="btn-icon" onClick={() => openEdit(p)} title="Edit">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="btn-icon" onClick={() => handleDelete(p)} title="Delete" style={{ color: 'var(--danger)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 780 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: 17, fontFamily: 'var(--font-display)' }}>{editItem ? 'Edit Planning' : 'New Planning'}</h2>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>{selLabel}</p>
              </div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* ── License plate lookup ── */}
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

              {/* ── Service type + duration ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Service Type *</label>
                  <select className="form-input" value={form.serviceType} onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))}>
                    <option value="">Select…</option>
                    {SERVICE_TYPES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <select className="form-input" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}>
                    <option value="30">30 min</option>
                    <option value="60">1 hr</option>
                    <option value="90">1.5 hr</option>
                    <option value="120">2 hr</option>
                    <option value="180">3 hr</option>
                    <option value="240">4 hr</option>
                  </select>
                </div>
              </div>

              {/* Time Slot */}
              <div className="form-group">
                <label className="form-label">
                  Time Slot *
                  {form.time && (
                    <span style={{ marginLeft: 8, fontWeight: 600, color: 'var(--navy)', background: 'rgba(13,43,92,0.08)', padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>
                      {form.time} selected
                    </span>
                  )}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 5 }}>
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, time: f.time === t ? '' : t }))}
                      style={{ padding: '6px 2px', borderRadius: 6, fontSize: 11, fontWeight: form.time === t ? 600 : 400, background: form.time === t ? 'var(--navy)' : 'var(--gray-50)', color: form.time === t ? 'white' : 'var(--gray-700)', border: form.time === t ? '1.5px solid var(--navy)' : '1px solid var(--gray-200)', cursor: 'pointer', transition: 'all 0.1s' }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unified Lines Grid */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <label className="form-label" style={{ margin: 0 }}>Lines</label>
                    <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 8 }}>Parts and labour activities</span>
                  </div>
                  <button className="btn btn-secondary btn-sm" type="button" onClick={() => setLines((ls) => [...ls, newLine('Part')])}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Line
                  </button>
                </div>
                <div style={{ border: '1px solid var(--gray-200)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '74px 92px 1fr 58px 64px 80px 28px', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', padding: '6px 10px', gap: 6 }}>
                    {['Type', 'Code / No.', 'Description', 'Qty / Hrs', 'Unit', 'Price / Rate', ''].map((h) => (
                      <div key={h} style={{ fontSize: 10, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</div>
                    ))}
                  </div>
                  {lines.map((l, idx) => (
                    <div
                      key={l.id}
                      style={{ display: 'grid', gridTemplateColumns: '74px 92px 1fr 58px 64px 80px 28px', padding: '6px 10px', gap: 6, borderBottom: idx < lines.length - 1 ? '1px solid var(--gray-100)' : 'none', alignItems: 'center', background: l.type === 'Activity' ? 'rgba(13,43,92,0.025)' : 'transparent' }}
                    >
                      <select className="form-input" style={{ padding: '5px 4px', fontSize: 11 }} value={l.type} onChange={(e) => updLine(l.id, 'type', e.target.value)}>
                        {LINE_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                      <input
                        className="form-input"
                        style={{ padding: '5px 7px', fontSize: 12 }}
                        placeholder={l.type === 'Part' ? 'P-001' : 'ACT-01'}
                        value={l.type === 'Part' ? l.partNumber : l.activityCode}
                        onChange={(e) => updLine(l.id, l.type === 'Part' ? 'partNumber' : 'activityCode', e.target.value)}
                      />
                      <input
                        className="form-input"
                        style={{ padding: '5px 7px', fontSize: 12 }}
                        placeholder={l.type === 'Part' ? 'Part description' : 'Labour description'}
                        value={l.description}
                        onChange={(e) => updLine(l.id, 'description', e.target.value)}
                      />
                      <input
                        className="form-input"
                        style={{ padding: '5px 7px', fontSize: 12 }}
                        type="number"
                        min="0"
                        step={l.type === 'Activity' ? '0.5' : '1'}
                        value={l.type === 'Part' ? l.quantity : l.hours}
                        onChange={(e) => updLine(l.id, l.type === 'Part' ? 'quantity' : 'hours', e.target.value)}
                      />
                      {l.type === 'Part' ? (
                        <select className="form-input" style={{ padding: '5px 6px', fontSize: 12 }} value={l.unit} onChange={(e) => updLine(l.id, 'unit', e.target.value)}>
                          {PART_UNITS.map((u) => <option key={u}>{u}</option>)}
                        </select>
                      ) : (
                        <div style={{ fontSize: 11, color: 'var(--gray-400)', paddingLeft: 6, display: 'flex', alignItems: 'center' }}>hr</div>
                      )}
                      <input
                        className="form-input"
                        style={{ padding: '5px 7px', fontSize: 12 }}
                        placeholder={l.type === 'Part' ? '€0.00' : '€/hr'}
                        value={l.type === 'Part' ? l.unitPrice : l.hourlyRate}
                        onChange={(e) => updLine(l.id, l.type === 'Part' ? 'unitPrice' : 'hourlyRate', e.target.value)}
                      />
                      <button
                        onClick={() => removeLine(l.id)}
                        style={{ background: 'none', border: 'none', cursor: lines.length > 1 ? 'pointer' : 'not-allowed', color: 'var(--gray-400)', padding: 0, opacity: lines.length > 1 ? 1 : 0.3, display: 'flex', alignItems: 'center' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Additional notes or instructions…"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Create Order toggle */}
              {!editItem && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: form.createOrder ? 'rgba(13,43,92,0.05)' : 'var(--gray-50)', border: `1.5px solid ${form.createOrder ? 'var(--navy)' : 'var(--gray-200)'}`, borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={form.createOrder}
                    onChange={(e) => setForm((f) => ({ ...f, createOrder: e.target.checked }))}
                    style={{ width: 16, height: 16, accentColor: 'var(--navy)', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: form.createOrder ? 'var(--navy)' : 'var(--gray-800)' }}>Create Order</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 1 }}>Automatically creates a linked order with status "Scheduled"</div>
                  </div>
                </label>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving && <span className="spinner" style={{ width: 14, height: 14 }} />}
                {saving ? 'Saving…' : editItem ? 'Save Changes' : form.createOrder ? 'Create Planning + Order' : 'Create Planning'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
