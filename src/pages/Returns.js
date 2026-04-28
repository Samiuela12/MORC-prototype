import React, { useEffect, useState } from 'react';
import { api, fmt } from '../utils/api';

export default function Returns() {
  const [rows, setRows] = useState([]);
  const [taxpayers, setTaxpayers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(null);
  const [form, setForm] = useState({ taxpayer_id: '', tin: '', return_type: 'CT', period: '', gross_income: '', deductions: '', taxable_income: '', tax_due: '', tax_paid: '', submitted_date: '', notes: '' });
  const [review, setReview] = useState({ status: '', reviewed_by: '', notes: '' });

  const load = () => api(`/api/returns?status=${statusFilter}&type=${typeFilter}`).then(setRows);
  useEffect(() => { load(); }, [statusFilter, typeFilter]);
  useEffect(() => { api('/api/taxpayers').then(setTaxpayers); }, []);

  const handleTaxpayerChange = (id) => {
    const tp = taxpayers.find(t => t.id === parseInt(id));
    setForm(f => ({ ...f, taxpayer_id: id, tin: tp ? tp.tin : '' }));
  };

  const autoCalc = () => {
    const gross = parseFloat(form.gross_income) || 0;
    const ded = parseFloat(form.deductions) || 0;
    const taxable = Math.max(0, gross - ded);
    let tax = 0;
    if (form.return_type === 'CT') tax = taxable * 0.25;
    else if (form.return_type === 'PAYE') {
      const brackets = [[12000,0],[30000,0.10],[50000,0.15],[70000,0.20],[Infinity,0.25]];
      let prev = 0;
      for (const [lim, rate] of brackets) {
        if (taxable <= prev) break;
        tax += (Math.min(taxable, lim) - prev) * rate;
        prev = lim;
      }
    } else if (form.return_type === 'WHT') tax = gross * 0.15;
    setForm(f => ({ ...f, taxable_income: taxable.toFixed(2), tax_due: tax.toFixed(2) }));
  };

  const save = async () => {
    await api('/api/returns', { method: 'POST', body: JSON.stringify(form) });
    setModal(false); load();
  };

  const submitReview = async () => {
    await api(`/api/returns/${reviewModal.id}`, { method: 'PUT', body: JSON.stringify(review) });
    setReviewModal(null); load();
  };

  const STATUS_MAP = { pending: 'badge-blue', reviewed: 'badge-orange', approved: 'badge-green', flagged: 'badge-red' };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Returns Tracker</div>
          <div className="page-subtitle">IT · CT · PAYE · WHT — Review & Monitoring</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setModal(true)}>+ Log Return</button>
        </div>
      </div>
      <div className="filters-bar">
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="approved">Approved</option>
          <option value="flagged">Flagged</option>
        </select>
        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {['IT','CT','PAYE','WHT','CT_REFUND'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="spacer" />
        <span style={{ color: '#7d8590', fontSize: 12, fontFamily: 'IBM Plex Mono' }}>{rows.length} returns</span>
      </div>
      <div className="page-body" style={{ padding: '20px 28px' }}>
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr><th>Taxpayer</th><th>Type</th><th>Period</th><th>Gross Income</th><th>Tax Due</th><th>Tax Paid</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td><div style={{ fontWeight: 500 }}>{r.taxpayer_name}</div><div className="mono" style={{ color: '#7d8590', fontSize: 11 }}>{r.tin}</div></td>
                  <td><span className="badge badge-blue">{r.return_type}</span></td>
                  <td className="mono">{r.period}</td>
                  <td className="mono">{fmt(r.gross_income)}</td>
                  <td className="mono">{fmt(r.tax_due)}</td>
                  <td className="mono" style={{ color: r.tax_paid >= r.tax_due ? '#3fb950' : '#f85149' }}>{fmt(r.tax_paid)}</td>
                  <td><span className={`badge ${STATUS_MAP[r.status]||'badge-gray'}`}>{r.status}</span></td>
                  <td>
                    {r.status !== 'approved' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => { setReviewModal(r); setReview({ status: r.status, reviewed_by: 'S. Taukafa', notes: r.notes || '' }); }}>Review</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="empty-state">No returns found</div>}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Log New Return</span>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="form-grid">
              <div className="form-group form-full">
                <label className="form-label">Taxpayer</label>
                <select className="form-select" value={form.taxpayer_id} onChange={e => handleTaxpayerChange(e.target.value)}>
                  <option value="">Select taxpayer...</option>
                  {taxpayers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.tin})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Return Type</label>
                <select className="form-select" value={form.return_type} onChange={e => setForm({...form,return_type:e.target.value})}>
                  {['IT','CT','PAYE','WHT','CT_REFUND'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Period</label>
                <input className="form-input" placeholder="e.g. 2024-FY or 2024-Q4" value={form.period} onChange={e => setForm({...form,period:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Gross Income (TOP)</label>
                <input className="form-input" type="number" value={form.gross_income} onChange={e => setForm({...form,gross_income:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Deductions (TOP)</label>
                <input className="form-input" type="number" value={form.deductions} onChange={e => setForm({...form,deductions:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Taxable Income (TOP)</label>
                <input className="form-input" type="number" value={form.taxable_income} onChange={e => setForm({...form,taxable_income:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Tax Due (TOP)</label>
                <input className="form-input" type="number" value={form.tax_due} onChange={e => setForm({...form,tax_due:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Tax Paid (TOP)</label>
                <input className="form-input" type="number" value={form.tax_paid} onChange={e => setForm({...form,tax_paid:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Submitted Date</label>
                <input className="form-input" type="date" value={form.submitted_date} onChange={e => setForm({...form,submitted_date:e.target.value})} />
              </div>
              <div className="form-group form-full">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={autoCalc}>⟳ Auto-Calculate Tax</button>
              <span style={{ marginLeft: 10, fontSize: 12, color: '#7d8590' }}>Uses Tonga 2026 tax rates</span>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save Return</button>
            </div>
          </div>
        </div>
      )}

      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Review Return — {reviewModal.taxpayer_name}</span>
              <button className="modal-close" onClick={() => setReviewModal(null)}>×</button>
            </div>
            <div style={{ background: '#1c2333', borderRadius: 6, padding: 14, marginBottom: 16, fontSize: 13 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['Type',reviewModal.return_type],['Period',reviewModal.period],['Tax Due',fmt(reviewModal.tax_due)],['Tax Paid',fmt(reviewModal.tax_paid)]].map(([l,v])=>(
                  <div key={l}><span style={{ color: '#7d8590', fontSize: 11 }}>{l}: </span><span className="mono">{v}</span></div>
                ))}
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Update Status</label>
              <select className="form-select" value={review.status} onChange={e => setReview({...review,status:e.target.value})}>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Reviewed By</label>
              <input className="form-input" value={review.reviewed_by} onChange={e => setReview({...review,reviewed_by:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={review.notes} onChange={e => setReview({...review,notes:e.target.value})} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitReview}>Save Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
