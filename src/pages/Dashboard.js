import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api, fmt } from '../utils/api';

const SEVERITY_COLOR = { critical: '#f85149', high: '#e3b341', medium: '#58a6ff', low: '#3fb950' };
const STATUS_COLOR = { approved: '#3fb950', pending: '#58a6ff', flagged: '#f85149', reviewed: '#e3b341' };

function StatCard({ label, value, sub, color = '' }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${String(value).length > 8 ? 'small' : ''}`}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { api('/api/dashboard').then(setData); }, []);
  if (!data) return <div className="loading">Loading dashboard...</div>;
  const { stats, recent_returns, top_risks, returns_by_type } = data;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Large Taxpayer Section — Overview</div>
        </div>
      </div>
      <div className="page-body">
        <div className="stat-grid">
          <StatCard label="Total Taxpayers" value={stats.total_taxpayers} sub={`${stats.active_taxpayers} active`} color="blue" />
          <StatCard label="Pending Returns" value={stats.pending_returns} color="orange" />
          <StatCard label="Flagged Returns" value={stats.flagged_returns} color="red" />
          <StatCard label="Open Risks" value={stats.open_risks} sub={`${stats.critical_risks} critical`} color="red" />
          <StatCard label="Tax Due (All)" value={fmt(stats.total_tax_due)} color="gold" />
          <StatCard label="Tax Collected" value={fmt(stats.total_tax_collected)} color="green" />
          <StatCard label="Site Visits (30d)" value={stats.site_visits_month} color="blue" />
          <StatCard label="Collection Rate" value={`${stats.total_tax_due > 0 ? ((stats.total_tax_collected / stats.total_tax_due) * 100).toFixed(1) : 0}%`} color="green" />
        </div>

        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="table-card">
            <div className="table-card-header">
              <span className="table-card-title">Returns by Type</span>
            </div>
            <div style={{ padding: '16px' }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={returns_by_type} barSize={28}>
                  <XAxis dataKey="return_type" tick={{ fill: '#7d8590', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#7d8590', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, fontSize: 12 }} />
                  <Bar dataKey="total_due" name="Tax Due (TOP)" fill="#c8a84b" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="table-card">
            <div className="table-card-header">
              <span className="table-card-title">Risk Distribution</span>
            </div>
            <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width="60%" height={180}>
                <PieChart>
                  <Pie data={top_risks.map(r => ({ name: r.risk_type, value: 1, severity: r.severity }))} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                    {top_risks.map((r, i) => <Cell key={i} fill={SEVERITY_COLOR[r.severity] || '#7d8590'} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(SEVERITY_COLOR).map(([s, c]) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: c, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#7d8590', textTransform: 'capitalize' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="table-card">
            <div className="table-card-header">
              <span className="table-card-title">Recent Returns</span>
              <span className="table-card-count">{recent_returns.length}</span>
            </div>
            <table className="data-table">
              <thead><tr><th>Taxpayer</th><th>Type</th><th>Tax Due</th><th>Status</th></tr></thead>
              <tbody>
                {recent_returns.map(r => (
                  <tr key={r.id}>
                    <td><div style={{ fontWeight: 500 }}>{r.taxpayer_name}</div><div className="mono" style={{ color: '#7d8590', fontSize: 11 }}>{r.tin}</div></td>
                    <td><span className="badge badge-blue">{r.return_type}</span></td>
                    <td className="mono">{fmt(r.tax_due)}</td>
                    <td><span className={`badge badge-${r.status === 'approved' ? 'green' : r.status === 'flagged' ? 'red' : r.status === 'reviewed' ? 'orange' : 'blue'}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-card">
            <div className="table-card-header">
              <span className="table-card-title">Active Risks</span>
              <span className="table-card-count">{top_risks.length}</span>
            </div>
            <table className="data-table">
              <thead><tr><th>Taxpayer</th><th>Risk</th><th>Severity</th></tr></thead>
              <tbody>
                {top_risks.map(r => (
                  <tr key={r.id}>
                    <td><div style={{ fontWeight: 500 }}>{r.taxpayer_name}</div><div className="mono" style={{ color: '#7d8590', fontSize: 11 }}>{r.tin}</div></td>
                    <td style={{ fontSize: 12 }}>{r.risk_type}</td>
                    <td><span className="badge" style={{ background: `${SEVERITY_COLOR[r.severity]}22`, color: SEVERITY_COLOR[r.severity] }}>{r.severity}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
