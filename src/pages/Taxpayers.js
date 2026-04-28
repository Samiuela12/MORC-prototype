import React, { useEffect, useState } from 'react';
import { api, fmt } from '../utils/api';

const BLANK = { tin: '', name: '', type: 'company', industry: '', address: '', phone: '', email: '', registration_date: '', status: 'active', annual_turnover: '' };

export default function Taxpayers() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [detail, setDetail] = useState(null);

  const load = () => api(`/api/taxpayers?search=${search}&type=${typeFilter}`).then(setRows);
  useEffect(() => { load(); }, [search, typeFilter]);

  const save = async () => {
    await api('/api/taxpayers', { method: 'POST', body: JSON.stringify(form) });
    setModal(false); setForm(BLANK); load();
  };

  const openDetail = async (id) => {
    const d = await api(`/api/taxpayers/${id}`);
    setDetail(d);
  };

  if (detail) return <DetailView data={detail} onBack={() => setDetail(null)} />;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Taxpayer Register</div>
          <div className="page-subtitle">Large Business — Registered Taxpayers</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setModal(true)}>+ Register Taxpayer</button>
        </div>
      </div>
      <div className="filters-bar">
        <input className="search-input" placeholder="Search by name or TIN..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="company">Company</option>
          <option value="individual">Individual</option>
        </select>
        <div className="spacer" />
        <span style={{ color: '#7d8590', fontSize: 12, fontFamily: 'IBM Plex Mono' }}>{rows.length} records</span>
      </div>
      <div className="page-body" style={{ padding: '20px 28px' }}>
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr><th>TIN</th><th>Name</th><th>Type</th><th>Industry</th><th>Annual Turnover</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td className="mono">{r.tin}</td>
                  <td style={{ fontWeight: 500 }}>{r.name}</td>
                  <td><span className={`badge ${r.type === 'company' ? 'badge-blue' : 'badge-purple'}`}>{r.type}</span></td>
                  <td style={{ color: '#7d8590' }}>{r.industry || '—'}</td>
                  <td className="mono">{fmt(r.annual_turnover)}</td>
                  <td><span className={`badge ${r.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{r.status}</span></td>
                  <td><button className="btn btn-secondary btn-sm" onClick={() => openDetail(r.id)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="empty-state">No taxpayers found</div>}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Register New Taxpayer</span>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="form-grid">
              {[['tin','TIN'],['name','Full Name / Business Name']].map(([k,l]) => (
                <div key={k} className="form-group form-full">
                  <label className="form-label">{l}</label>
                  <input className="form-input" value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm({...form,type:e.target.value})}>
                  <option value="company">Company</option>
                  <option value="individual">Individual</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Industry</label>
                <input className="form-input" value={form.industry} onChange={e => setForm({...form,industry:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={form.email} onChange={e => setForm({...form,email:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Annual Turnover (TOP)</label>
                <input className="form-input" type="number" value={form.annual_turnover} onChange={e => setForm({...form,annual_turnover:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Registration Date</label>
                <input className="form-input" type="date" value={form.registration_date} onChange={e => setForm({...form,registration_date:e.target.value})} />
              </div>
              <div className="form-group form-full">
                <label className="form-label">Address</label>
                <input className="form-input" value={form.address} onChange={e => setForm({...form,address:e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Register</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailView({ data, onBack }) {
  const { taxpayer: t, returns, risks, visits } = data;
  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn btn-secondary btn-sm" onClick={onBack} style={{ marginBottom: 8 }}>← Back</button>
          <div className="page-title">{t.name}</div>
          <div className="page-subtitle">{t.tin} · {t.type} · {t.industry}</div>
        </div>
        <div className="page-actions">
          <span className={`badge ${t.status === 'active' ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 12, padding: '4px 12px' }}>{t.status}</span>
        </div>
      </div>
      <div className="page-body">
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="table-card" style={{ padding: 20 }}>
            <div className="section-title">Contact Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Email', t.email],['Phone', t.phone],['Address', t.address],['Registered', t.registration_date],['Annual Turnover', new Intl.NumberFormat('en-TO',{style:'currency',currency:'TOP',maximumFractionDigits:0}).format(t.annual_turnover||0)]].map(([l,v])=>(
                <div key={l} style={{ display: 'flex', gap: 12 }}>
                  <span style={{ color: '#7d8590', fontSize: 12, width: 120, flexShrink: 0 }}>{l}</span>
                  <span style={{ fontSize: 13 }}>{v || '—'}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="stat-grid" style={{ margin: 0 }}>
            <div className="stat-card blue"><div className="stat-label">Returns Filed</div><div className="stat-value">{returns.length}</div></div>
            <div className="stat-card red"><div className="stat-label">Open Risks</div><div className="stat-value">{risks.filter(r=>r.status!=='resolved').length}</div></div>
            <div className="stat-card gold"><div className="stat-label">Site Visits</div><div className="stat-value">{visits.length}</div></div>
          </div>
        </div>

        <div className="table-card" style={{ marginBottom: 20 }}>
          <div className="table-card-header"><span className="table-card-title">Returns History</span></div>
          <table className="data-table">
            <thead><tr><th>Type</th><th>Period</th><th>Tax Due</th><th>Tax Paid</th><th>Status</th></tr></thead>
            <tbody>
              {returns.map(r => (
                <tr key={r.id}>
                  <td><span className="badge badge-blue">{r.return_type}</span></td>
                  <td className="mono">{r.period}</td>
                  <td className="mono">{new Intl.NumberFormat('en-TO',{style:'currency',currency:'TOP',maximumFractionDigits:0}).format(r.tax_due)}</td>
                  <td className="mono">{new Intl.NumberFormat('en-TO',{style:'currency',currency:'TOP',maximumFractionDigits:0}).format(r.tax_paid)}</td>
                  <td><span className={`badge ${r.status==='approved'?'badge-green':r.status==='flagged'?'badge-red':r.status==='reviewed'?'badge-orange':'badge-blue'}`}>{r.status}</span></td>
                </tr>
              ))}
              {returns.length === 0 && <tr><td colSpan={5} className="empty-state">No returns on file</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="table-card">
          <div className="table-card-header"><span className="table-card-title">Compliance Risks</span></div>
          <table className="data-table">
            <thead><tr><th>Type</th><th>Severity</th><th>Description</th><th>Status</th></tr></thead>
            <tbody>
              {risks.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>{r.risk_type}</td>
                  <td><span className="badge" style={{ background: `${({critical:'#f85149',high:'#e3b341',medium:'#58a6ff',low:'#3fb950'}[r.severity]||'#7d8590')}22`, color: ({critical:'#f85149',high:'#e3b341',medium:'#58a6ff',low:'#3fb950'}[r.severity]||'#7d8590') }}>{r.severity}</span></td>
                  <td style={{ color: '#7d8590', fontSize: 12 }}>{r.description}</td>
                  <td><span className={`badge ${r.status==='resolved'?'badge-green':r.status==='open'?'badge-red':'badge-orange'}`}>{r.status}</span></td>
                </tr>
              ))}
              {risks.length === 0 && <tr><td colSpan={4} className="empty-state">No risks recorded</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
