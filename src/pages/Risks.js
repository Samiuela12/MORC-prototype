import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';

const SEV_COLOR = { critical: '#f85149', high: '#e3b341', medium: '#58a6ff', low: '#3fb950' };

export default function Risks() {
  const [rows, setRows] = useState([]);
  const [taxpayers, setTaxpayers] = useState([]);
  const [modal, setModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(null);
  const [form, setForm] = useState({ taxpayer_id: '', tin: '', risk_type: '', severity: 'medium', description: '', assigned_to: '', identified_date: '' });
  const [upd, setUpd] = useState({ status: '', assigned_to: '' });

  const load = () => api('/api/risks').then(setRows);
  useEffect(() => { load(); api('/api/taxpayers').then(setTaxpayers); }, []);

  const handleTP = (id) => {
    const tp = taxpayers.find(t => t.id === parseInt(id));
    setForm(f => ({ ...f, taxpayer_id: id, tin: tp ? tp.tin : '' }));
  };

  const save = async () => {
    await api('/api/risks', { method: 'POST', body: JSON.stringify(form) });
    setModal(false); load();
  };

  const saveUpdate = async () => {
    await api(`/api/risks/${updateModal.id}`, { method: 'PUT', body: JSON.stringify(upd) });
    setUpdateModal(null); load();
  };

  const summary = { critical: rows.filter(r=>r.severity==='critical'&&r.status!=='resolved').length, high: rows.filter(r=>r.severity==='high'&&r.status!=='resolved').length, open: rows.filter(r=>r.status==='open').length, resolved: rows.filter(r=>r.status==='resolved').length };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Compliance Risk Register</div>
          <div className="page-subtitle">RMS Monitoring — Identify, Assess & Treat</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setModal(true)}>+ Log Risk</button>
        </div>
      </div>
      <div className="page-body">
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card red"><div className="stat-label">Critical Risks</div><div className="stat-value">{summary.critical}</div></div>
          <div className="stat-card orange"><div className="stat-label">High Risks</div><div className="stat-value">{summary.high}</div></div>
          <div className="stat-card blue"><div className="stat-label">Open</div><div className="stat-value">{summary.open}</div></div>
          <div className="stat-card green"><div className="stat-label">Resolved</div><div className="stat-value">{summary.resolved}</div></div>
        </div>
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr><th>Taxpayer</th><th>Risk Type</th><th>Severity</th><th>Description</th><th>Assigned To</th><th>Status</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td><div style={{ fontWeight: 500 }}>{r.taxpayer_name}</div><div className="mono" style={{ color: '#7d8590', fontSize: 11 }}>{r.tin}</div></td>
                  <td style={{ fontWeight: 500 }}>{r.risk_type}</td>
                  <td><span className="badge" style={{ background: `${SEV_COLOR[r.severity]}22`, color: SEV_COLOR[r.severity] }}>{r.severity}</span></td>
                  <td style={{ color: '#7d8590', fontSize: 12, maxWidth: 240 }}>{r.description}</td>
                  <td style={{ fontSize: 12 }}>{r.assigned_to || '—'}</td>
                  <td><span className={`badge ${r.status==='resolved'?'badge-green':r.status==='open'?'badge-red':r.status==='escalated'?'badge-purple':'badge-orange'}`}>{r.status}</span></td>
                  <td className="mono" style={{ fontSize: 11, color: '#7d8590' }}>{r.identified_date}</td>
                  <td>{r.status !== 'resolved' && <button className="btn btn-secondary btn-sm" onClick={() => { setUpdateModal(r); setUpd({ status: r.status, assigned_to: r.assigned_to || '' }); }}>Update</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="empty-state">No risks logged</div>}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Log Compliance Risk</span>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="form-grid">
              <div className="form-group form-full">
                <label className="form-label">Taxpayer</label>
                <select className="form-select" value={form.taxpayer_id} onChange={e => handleTP(e.target.value)}>
                  <option value="">Select...</option>
                  {taxpayers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.tin})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Risk Type</label>
                <input className="form-input" placeholder="e.g. Underpayment, Late Filing..." value={form.risk_type} onChange={e => setForm({...form,risk_type:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Severity</label>
                <select className="form-select" value={form.severity} onChange={e => setForm({...form,severity:e.target.value})}>
                  {['low','medium','high','critical'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assigned To</label>
                <input className="form-input" value={form.assigned_to} onChange={e => setForm({...form,assigned_to:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Identified Date</label>
                <input className="form-input" type="date" value={form.identified_date} onChange={e => setForm({...form,identified_date:e.target.value})} />
              </div>
              <div className="form-group form-full">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form,description:e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Log Risk</button>
            </div>
          </div>
        </div>
      )}

      {updateModal && (
        <div className="modal-overlay" onClick={() => setUpdateModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Update Risk — {updateModal.risk_type}</span>
              <button className="modal-close" onClick={() => setUpdateModal(null)}>×</button>
            </div>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Status</label>
              <select className="form-select" value={upd.status} onChange={e => setUpd({...upd,status:e.target.value})}>
                {['open','under_review','resolved','escalated'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assigned To</label>
              <input className="form-input" value={upd.assigned_to} onChange={e => setUpd({...upd,assigned_to:e.target.value})} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setUpdateModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveUpdate}>Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
