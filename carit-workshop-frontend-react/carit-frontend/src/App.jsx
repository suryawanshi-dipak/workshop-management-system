import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Layout from './components/Layout';
import { ToastProvider } from './components/Toast';
import Dashboard from './pages/Dashboard';
import Planning from './pages/Planning';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Cars from './pages/Cars';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/cars" element={<Cars />} />
          </Routes>
        </Layout>
      </ToastProvider>
    </BrowserRouter>
  );
}
