import React, { useState, useEffect } from 'react';
import { planningService, orderService } from '../services/api';
import { useToast } from '../components/Toast';

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TIME_SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];
const SERVICE_TYPES = ['Oil Change','Full Service','Brake Inspection','Tire Change','Engine Diagnostics','Air Conditioning','Transmission Service','Battery Replacement','Bodywork','Pre-MOT Check'];
const PART_UNITS = ['pcs','ltr','set','kg','m'];

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay + 6) % 7; // Mon-first
  const days = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

const uid = () => Date.now() + Math.random();
const newPart = () => ({ id: uid(), partNumber: '', description: '', quantity: '1', unit: 'pcs', unitPrice: '' });
const newActivity = () => ({ id: uid(), activityCode: '', description: '', hours: '1', hourlyRate: '' });

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

export default function Planning() {
  const { addToast } = useToast();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [selectedTime, setSelectedTime] = useState(null);
  const [plannings, setPlannings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customerId: '', carId: '', serviceType: '', notes: '', duration: '60', createOrder: false });
  const [partLines, setPartLines] = useState([newPart()]);
  const [activityLines, setActivityLines] = useState([newActivity()]);

  const days = getCalendarDays(viewYear, viewMonth);

  useEffect(() => { fetchPlannings(); }, [viewYear, viewMonth]);

  const fetchPlannings = async () => {
    try { const res = await planningService.getAll(); setPlannings(res.data || []); }
    catch { setPlannings([]); }
  };

  const hasPlanningOn = (day) => {
    if (!day) return false;
    const ds = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return plannings.some(p => p.date === ds || p.planningDate?.startsWith(ds));
  };

  const planningsForSelected = () => {
    if (!selectedDate) return [];
    const ds = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(selectedDate).padStart(2,'0')}`;
    return plannings.filter(p => p.date === ds || p.planningDate?.startsWith(ds));
  };

  const isToday = (d) => d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isPast = (d) => d && new Date(viewYear, viewMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y-1)) : setViewMonth(m => m-1);
  const nextMonth = () => viewMonth === 11 ? (setViewMonth(0), setViewYear(y => y+1)) : setViewMonth(m => m+1);

  const updPart = (id, k, v) => setPartLines(ls => ls.map(l => l.id === id ? { ...l, [k]: v } : l));
  const updAct  = (id, k, v) => setActivityLines(ls => ls.map(l => l.id === id ? { ...l, [k]: v } : l));

  const openModal = () => {
    if (!selectedDate) { addToast('Please select a date first.', 'error'); return; }
    setForm({ customerId: '', carId: '', serviceType: '', notes: '', duration: '60', createOrder: false });
    setPartLines([newPart()]); setActivityLines([newActivity()]);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedTime || !form.serviceType) { addToast('Select a time slot and service type.', 'error'); return; }
    setSaving(true);
    try {
      const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(selectedDate).padStart(2,'0')}`;
      const payload = {
        planningDate: `${dateStr}T${selectedTime}:00`, date: dateStr, time: selectedTime,
        customerId: form.customerId, carId: form.carId, serviceType: form.serviceType,
        duration: form.duration, notes: form.notes,
        partLines: partLines.filter(p => p.description),
        activityLines: activityLines.filter(a => a.description),
      };
      await planningService.create(payload);
      if (form.createOrder) {
        await orderService.create({ ...payload, status: 'Scheduled' });
        addToast('Planning + Order created!', 'success');
      } else {
        addToast('Planning created!', 'success');
      }
      setShowModal(false); fetchPlannings();
    } catch { addToast('Failed to save. Check connection.', 'error'); }
    finally { setSaving(false); }
  };

  const selPlannings = planningsForSelected();
  const selLabel = selectedDate ? `${String(selectedDate).padStart(2,'0')} ${SHORT_MONTHS[viewMonth]} ${viewYear}` : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Workshop Planning</h1>
          <p className="page-subtitle">Schedule and manage workshop appointments</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Planning
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Compact Calendar */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
              {DAYS.map(d => <div key={d} style={{ textAlign: 'center', padding: '6px 0', fontSize: 10, fontWeight: 600, color: 'var(--gray-500)', letterSpacing: '0.04em' }}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '4px 4px 2px' }}>
              {days.map((day, i) => {
                const active = day === selectedDate;
                const todayFlag = isToday(day);
                const past = isPast(day);
                const hasDot = hasPlanningOn(day);
                return (
                  <div key={i} onClick={() => day && !past && setSelectedDate(day)}
                    style={{ height: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: day && !past ? 'pointer' : 'default', background: active ? 'var(--navy)' : 'transparent', borderRadius: 5, position: 'relative', transition: 'background 0.1s' }}
                    onMouseEnter={e => { if (day && !past && !active) e.currentTarget.style.background = 'var(--gray-100)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {day && <>
                      <span style={{ fontSize: 12, lineHeight: 1, fontWeight: todayFlag ? 700 : 400, color: active ? 'white' : past ? 'var(--gray-300)' : todayFlag ? 'var(--rust)' : 'var(--gray-800)' }}>{day}</span>
                      {hasDot && <div style={{ width: 3, height: 3, borderRadius: '50%', background: active ? 'rgba(255,255,255,0.7)' : 'var(--amber)', marginTop: 2 }}/>}
                    </>}
                  </div>
                );
              })}
            </div>
            <div style={{ borderTop: '1px solid var(--gray-100)', padding: '7px 12px' }}>
              <button onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); setSelectedDate(today.getDate()); }}
                style={{ fontSize: 11, color: 'var(--navy)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}>
                → Jump to today
              </button>
            </div>
          </div>

          {/* Time Slots */}
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 9 }}>
              {selectedDate ? `Time — ${selLabel}` : 'Select a date first'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {TIME_SLOTS.map(t => (
                <button key={t} disabled={!selectedDate} onClick={() => setSelectedTime(t === selectedTime ? null : t)}
                  style={{ padding: '5px 2px', borderRadius: 5, fontSize: 11, fontWeight: selectedTime === t ? 600 : 400, background: selectedTime === t ? 'var(--navy)' : 'var(--gray-50)', color: selectedTime === t ? 'white' : 'var(--gray-700)', border: selectedTime === t ? 'none' : '1px solid var(--gray-200)', cursor: selectedDate ? 'pointer' : 'not-allowed', transition: 'all 0.1s', opacity: !selectedDate ? 0.4 : 1 }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Appointments */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                {selectedDate ? `Appointments — ${selLabel}` : 'Appointments'}
              </h3>
              {selectedDate && <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{selPlannings.length} scheduled</p>}
            </div>
            {selectedTime && (
              <span style={{ fontSize: 12, background: 'var(--navy)', color: 'white', padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>{selectedTime} selected</span>
            )}
          </div>
          <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
            {!selectedDate && <EmptyState title="No date selected" subtitle="Click a day in the calendar to see appointments" />}
            {selectedDate && selPlannings.length === 0 && (
              <EmptyState title={`No appointments on ${selLabel}`} subtitle="Select a time slot and click New Planning to schedule" action="Schedule appointment" onAction={openModal} />
            )}
            {selPlannings.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selPlannings.map((p, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: 'var(--gray-50)', borderRadius: 10, borderLeft: '3px solid var(--navy)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>{p.serviceType || 'Service'}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {(p.time || p.planningDate?.slice(11,16)) && <span>{p.time || p.planningDate?.slice(11,16)}</span>}
                        {p.carId && <span>Car #{p.carId}</span>}
                        {p.duration && <span>{p.duration} min</span>}
                      </div>
                    </div>
                    <span className="badge badge-info" style={{ fontSize: 11 }}>Scheduled</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: 17, fontFamily: 'var(--font-display)' }}>New Planning</h2>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>{selLabel}{selectedTime ? ` at ${selectedTime}` : ' — no time selected'}</p>
              </div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Header info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Customer ID</label>
                  <input className="form-input" placeholder="CUST-001" value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Car ID</label>
                  <input className="form-input" placeholder="CAR-001" value={form.carId} onChange={e => setForm(f => ({ ...f, carId: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Service Type *</label>
                  <select className="form-input" value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))}>
                    <option value="">Select...</option>
                    {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <select className="form-input" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}>
                    <option value="30">30 min</option><option value="60">1 hr</option>
                    <option value="90">1.5 hr</option><option value="120">2 hr</option>
                    <option value="180">3 hr</option><option value="240">4 hr</option>
                  </select>
                </div>
              </div>

              {/* Part Lines */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <label className="form-label" style={{ margin: 0 }}>Part Lines</label>
                    <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 8 }}>Spare parts and materials</span>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setPartLines(ls => [...ls, newPart()])}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Part
                  </button>
                </div>
                <div style={{ border: '1px solid var(--gray-200)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 56px 64px 80px 28px', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', padding: '6px 10px', gap: 6 }}>
                    {['Part No.','Description','Qty','Unit','Unit Price',''].map(h => (
                      <div key={h} style={{ fontSize: 10, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</div>
                    ))}
                  </div>
                  {partLines.map((l, idx) => (
                    <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 56px 64px 80px 28px', padding: '6px 10px', gap: 6, borderBottom: idx < partLines.length - 1 ? '1px solid var(--gray-100)' : 'none', alignItems: 'center' }}>
                      <input className="form-input" style={{ padding: '5px 7px', fontSize: 12 }} placeholder="P-001" value={l.partNumber} onChange={e => updPart(l.id,'partNumber',e.target.value)} />
                      <input className="form-input" style={{ padding: '5px 7px', fontSize: 12 }} placeholder="Description" value={l.description} onChange={e => updPart(l.id,'description',e.target.value)} />
                      <input className="form-input" style={{ padding: '5px 7px', fontSize: 12 }} type="number" min="0" value={l.quantity} onChange={e => updPart(l.id,'quantity',e.target.value)} />
                      <select className="form-input" style={{ padding: '5px 6px', fontSize: 12 }} value={l.unit} onChange={e => updPart(l.id,'unit',e.target.value)}>
                        {PART_UNITS.map(u => <option key={u}>{u}</option>)}
                      </select>
                      <input className="form-input" style={{ padding: '5px 7px', fontSize: 12 }} placeholder="€0.00" value={l.unitPrice} onChange={e => updPart(l.id,'unitPrice',e.target.value)} />
                      <button onClick={() => partLines.length > 1 && setPartLines(ls => ls.filter(x => x.id !== l.id))}
                        style={{ background: 'none', border: 'none', cursor: partLines.length > 1 ? 'pointer' : 'not-allowed', color: 'var(--gray-400)', padding: 0, opacity: partLines.length > 1 ? 1 : 0.3, display: 'flex', alignItems: 'center' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Lines */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <label className="form-label" style={{ margin: 0 }}>Activity Lines</label>
                    <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 8 }}>Labour and workshop activities</span>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActivityLines(ls => [...ls, newActivity()])}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Activity
                  </button>
                </div>
                <div style={{ border: '1px solid var(--gray-200)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 64px 82px 28px', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', padding: '6px 10px', gap: 6 }}>
                    {['Activity Code','Description','Hours','Rate/hr',''].map(h => (
                      <div key={h} style={{ fontSize: 10, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</div>
                    ))}
                  </div>
                  {activityLines.map((l, idx) => (
                    <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 64px 82px 28px', padding: '6px 10px', gap: 6, borderBottom: idx < activityLines.length - 1 ? '1px solid var(--gray-100)' : 'none', alignItems: 'center' }}>
                      <input className="form-input" style={{ padding: '5px 7px', fontSize: 12 }} placeholder="ACT-01" value={l.activityCode} onChange={e => updAct(l.id,'activityCode',e.target.value)} />
                      <input className="form-input" style={{ padding: '5px 7px', fontSize: 12 }} placeholder="e.g. Oil drain & refill" value={l.description} onChange={e => updAct(l.id,'description',e.target.value)} />
                      <input className="form-input" style={{ padding: '5px 7px', fontSize: 12 }} type="number" min="0" step="0.5" value={l.hours} onChange={e => updAct(l.id,'hours',e.target.value)} />
                      <input className="form-input" style={{ padding: '5px 7px', fontSize: 12 }} placeholder="€/hr" value={l.hourlyRate} onChange={e => updAct(l.id,'hourlyRate',e.target.value)} />
                      <button onClick={() => activityLines.length > 1 && setActivityLines(ls => ls.filter(x => x.id !== l.id))}
                        style={{ background: 'none', border: 'none', cursor: activityLines.length > 1 ? 'pointer' : 'not-allowed', color: 'var(--gray-400)', padding: 0, opacity: activityLines.length > 1 ? 1 : 0.3, display: 'flex', alignItems: 'center' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} placeholder="Additional notes or instructions..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>

              {/* Create Order checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: form.createOrder ? 'rgba(13,43,92,0.05)' : 'var(--gray-50)', border: `1.5px solid ${form.createOrder ? 'var(--navy)' : 'var(--gray-200)'}`, borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', userSelect: 'none' }}>
                <input type="checkbox" checked={form.createOrder} onChange={e => setForm(f => ({ ...f, createOrder: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: 'var(--navy)', cursor: 'pointer', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: form.createOrder ? 'var(--navy)' : 'var(--gray-800)' }}>Create Order</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 1 }}>Automatically creates a linked order with status "Scheduled"</div>
                </div>
              </label>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving && <span className="spinner" style={{ width: 14, height: 14 }} />}
                {saving ? 'Saving...' : form.createOrder ? 'Create Planning + Order' : 'Create Planning'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
