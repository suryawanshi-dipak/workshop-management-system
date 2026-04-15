import React, { useState, useEffect } from 'react';
import { planningService, orderService, customerService, carService } from '../services/api';

const StatCard = ({ label, value, icon, color, delta }) => (
  <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, animation: 'fadeIn 0.3s ease both' }}>
    <div style={{
      width: 48, height: 48, borderRadius: 12,
      background: color + '18',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--gray-900)', lineHeight: 1.2, marginTop: 2 }}>{value}</div>
    </div>
    {delta !== undefined && (
      <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 500 }}>+{delta}</div>
    )}
  </div>
);

const MOCK_ORDERS = [
  { id: 'ORD-001', customer: 'Jan de Vries', car: 'BMW 3 Series', service: 'Full Service', status: 'In Progress', date: '2024-01-15' },
  { id: 'ORD-002', customer: 'Anna Bakker', car: 'Audi A4', service: 'Oil Change', status: 'Completed', date: '2024-01-14' },
  { id: 'ORD-003', customer: 'Pieter Smit', car: 'VW Golf', service: 'Brake Inspection', status: 'Pending', date: '2024-01-14' },
  { id: 'ORD-004', customer: 'Maria Jansen', car: 'Ford Focus', service: 'Tire Change', status: 'Scheduled', date: '2024-01-16' },
];

const STATUS_COLORS = {
  'In Progress': 'info',
  'Completed': 'success',
  'Pending': 'warning',
  'Scheduled': 'neutral',
};

export default function Dashboard() {
  const [stats, setStats] = useState({ plannings: '--', orders: '--', customers: '--', cars: '--' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [p, o, c, ca] = await Promise.allSettled([
          planningService.getAll(),
          orderService.getAll(),
          customerService.getAll(),
          carService.getAll(),
        ]);
        setStats({
          plannings: p.status === 'fulfilled' ? (p.value.data?.length ?? '--') : '--',
          orders: o.status === 'fulfilled' ? (o.value.data?.length ?? '--') : '--',
          customers: c.status === 'fulfilled' ? (c.value.data?.length ?? '--') : '--',
          cars: ca.status === 'fulfilled' ? (ca.value.data?.length ?? '--') : '--',
        });
      } catch {}
    };
    fetchStats();
  }, []);

  const today = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{today} — Workshop overview</p>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Active Plannings" value={stats.plannings} color="var(--navy)" icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        } />
        <StatCard label="Total Orders" value={stats.orders} color="var(--rust)" icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        } />
        <StatCard label="Customers" value={stats.customers} color="var(--amber)" icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        } />
        <StatCard label="Cars Registered" value={stats.cars} color="#2e7d32" icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-1"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
        } />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 16, fontFamily: 'var(--font-display)' }}>Recent Orders</h2>
          <a href="/orders" style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 500 }}>View all →</a>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Car</th><th>Service</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ORDERS.map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--navy)', fontWeight: 500 }}>{o.id}</td>
                  <td>{o.customer}</td>
                  <td style={{ color: 'var(--gray-600)' }}>{o.car}</td>
                  <td>{o.service}</td>
                  <td><span className={`badge badge-${STATUS_COLORS[o.status]}`}>{o.status}</span></td>
                  <td style={{ color: 'var(--gray-500)' }}>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
