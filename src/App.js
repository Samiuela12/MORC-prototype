import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Taxpayers from './pages/Taxpayers';
import Returns from './pages/Returns';
import Risks from './pages/Risks';
import Staff from './pages/Staff';
import Visits from './pages/Visits';
import TaxCalculator from './pages/TaxCalculator';
import './App.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'taxpayers', label: 'Taxpayer Register', icon: '◉' },
  { id: 'returns', label: 'Returns Tracker', icon: '◈' },
  { id: 'risks', label: 'Compliance Risks', icon: '◬' },
  { id: 'staff', label: 'Staff Performance', icon: '◍' },
  { id: 'visits', label: 'Site Visit Log', icon: '◎' },
  { id: 'calculator', label: 'Tax Calculator', icon: '◇' },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pages = { dashboard: Dashboard, taxpayers: Taxpayers, returns: Returns, risks: Risks, staff: Staff, visits: Visits, calculator: TaxCalculator };
  const Page = pages[page] || Dashboard;
  return (
    <div className="app">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-mark">⬡</span>
            {sidebarOpen && <div className="logo-text"><span className="logo-main">TCMS</span><span className="logo-sub">Ministry of Revenue</span></div>}
          </div>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? '◂' : '▸'}</button>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <button key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              {sidebarOpen && <span className="nav-label">{n.label}</span>}
            </button>
          ))}
        </nav>
        {sidebarOpen && (
          <div className="sidebar-footer">
            <div className="user-badge">
              <div className="user-avatar">ST</div>
              <div className="user-info">
                <span className="user-name">S. Taukafa</span>
                <span className="user-role">Principal Rev. Officer</span>
              </div>
            </div>
          </div>
        )}
      </aside>
      <main className="main-content"><Page /></main>
    </div>
  );
}
