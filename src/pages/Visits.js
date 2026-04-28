import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';

export default function Visits() {
  const [rows, setRows] = useState([]);
  const [taxpayers, setTaxpayers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ taxpayer_id: '', tin: '', visit_date: '', officer: 'S. Taukafa', purpose: '', findings: '', recommendations: '', follow_up_required: false, follow_up_date: '', status: 'completed' });

  const load = () => api('/api/visits').then(setRows);
  useEffect(() => { load(); api('/api/taxpayers').then(setTaxpayers); }, []);

  const handleTP = (id) => {
    const tp = taxpayers.find(t => t.id === parseInt(id));
    setForm(f => ({ ...f, taxpayer_id: id, tin: tp ? tp.tin : '' }));
  };

  const save = async () => {
    await api('/api/visits', { method: 'POST', body: JSON.stringify({ ...form, follow_up_required: form.follow_up_required ? 1 : 0 }) });
    setModal(false); load();
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Site Visit Log</div>
          <div className="page-subtitle">Taxpayer Site Visits — Field Intelligence & Compliance Checks</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setModal(true)}>+ Log Visit</button>
        </div>
      </div>
      <div className="page-body">
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr><th>Taxpayer</th><th>Visit Date</th><th>Officer</th><th>Purpose</th><th>Findings (summary)</th><th>Follow-up</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td><div style={{ fontWeight: 500 }}>{r.taxpayer_name}</div><div className="mono" style={{ color: '#7d8590', fontSize: 11 }}>{r.tin}</div></td>
                  <td className="mono">{r.visit_date}</td>
                  <td>{r.officer}</td>
                  <td style={{ fontSize: 12, color: '#7d8590' }}>{r.purpose}</td>
                  <td style={{ fontSize: 12, maxWidth: 220, color: '#c9d1d9' }}>{r.findings ? r.findings.slice(0, 80) + (r.findings.length > 80 ? '...' : '') : '—'}</td>
                  <td>
                    {r.follow_up_required ? (
                      <div><span className="badge badge-orange">Required</span><div className="mono" style={{ fontSize: 10, color: '#7d8590', marginTop: 3 }}>{r.follow_up_date}</div></div>
                    ) : <span className="badge badge-gray">None</span>}
                  </td>
                  <td><span className={`badge ${r.status === 'completed' ? 'badge-green' : 'badge-orange'}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="empty-state">No site visits recorded</div>}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Log Site Visit</span>
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
                <label className="form-label">Visit Date</label>
                <input className="form-input" type="date" value={form.visit_date} onChange={e => setForm({...form,visit_date:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Officer</label>
                <input className="form-input" value={form.officer} onChange={e => setForm({...form,officer:e.target.value})} />
              </div>
              <div className="form-group form-full">
                <label className="form-label">Purpose</label>
                <input className="form-input" placeholder="e.g. Annual compliance review, Underpayment investigation..." value={form.purpose} onChange={e => setForm({...form,purpose:e.target.value})} />
              </div>
              <div className="form-group form-full">
                <label className="form-label">Findings</label>
                <textarea className="form-textarea" placeholder="Detailed findings from the visit..." value={form.findings} onChange={e => setForm({...form,findings:e.target.value})} />
              </div>
              <div className="form-group form-full">
                <label className="form-label">Recommendations</label>
                <textarea className="form-textarea" placeholder="Recommended actions..." value={form.recommendations} onChange={e => setForm({...form,recommendations:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm({...form,status:e.target.value})}>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={form.follow_up_required} onChange={e => setForm({...form,follow_up_required:e.target.checked})} />
                  Follow-up Required
                </label>
                {form.follow_up_required && (
                  <input className="form-input" type="date" value={form.follow_up_date} onChange={e => setForm({...form,follow_up_date:e.target.value})} style={{ marginTop: 8 }} />
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Log Visit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
