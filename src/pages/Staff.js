import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';

export default function Staff() {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [perfModal, setPerfModal] = useState(null);
  const [form, setForm] = useState({ employee_id: '', name: '', role: '', section: 'Large Business Processing', email: '', phone: '' });
  const [perf, setPerf] = useState({ period: '', cases_assigned: '', cases_completed: '', returns_reviewed: '', site_visits: '', rating: 'satisfactory', notes: '' });
  const [perfData, setPerfData] = useState([]);

  const load = () => api('/api/staff').then(setRows);
  useEffect(() => { load(); }, []);

  const save = async () => {
    await api('/api/staff', { method: 'POST', body: JSON.stringify(form) });
    setModal(false); load();
  };

  const openPerf = async (s) => {
    const data = await api(`/api/staff/${s.id}/performance`);
    setPerfData(data); setPerfModal(s);
    setPerf({ period: '', cases_assigned: '', cases_completed: '', returns_reviewed: '', site_visits: '', rating: 'satisfactory', notes: '' });
  };

  const savePerf = async () => {
    await api(`/api/staff/${perfModal.id}/performance`, { method: 'POST', body: JSON.stringify(perf) });
    const data = await api(`/api/staff/${perfModal.id}/performance`);
    setPerfData(data);
    setPerf({ period: '', cases_assigned: '', cases_completed: '', returns_reviewed: '', site_visits: '', rating: 'satisfactory', notes: '' });
  };

  const RATING_COLOR = { excellent: 'badge-green', satisfactory: 'badge-blue', 'needs improvement': 'badge-orange', unsatisfactory: 'badge-red' };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Staff Performance</div>
          <div className="page-subtitle">Large Business Processing — Team Monitoring</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setModal(true)}>+ Add Staff</button>
        </div>
      </div>
      <div className="page-body">
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr><th>Employee ID</th><th>Name</th><th>Role</th><th>Section</th><th>Contact</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td className="mono">{r.employee_id}</td>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>{r.role}</td>
                  <td style={{ color: '#7d8590', fontSize: 12 }}>{r.section}</td>
                  <td style={{ fontSize: 12 }}><div>{r.email}</div><div style={{ color: '#7d8590' }}>{r.phone}</div></td>
                  <td><span className={`badge ${r.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{r.status}</span></td>
                  <td><button className="btn btn-secondary btn-sm" onClick={() => openPerf(r)}>Performance</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="empty-state">No staff records</div>}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add Staff Member</span>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="form-grid">
              {[['employee_id','Employee ID'],['name','Full Name'],['role','Role'],['section','Section'],['email','Email'],['phone','Phone']].map(([k,l]) => (
                <div key={k} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-input" value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} />
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Add</button>
            </div>
          </div>
        </div>
      )}

      {perfModal && (
        <div className="modal-overlay" onClick={() => setPerfModal(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Performance — {perfModal.name}</span>
              <button className="modal-close" onClick={() => setPerfModal(null)}>×</button>
            </div>
            <div className="section-title" style={{ marginBottom: 12 }}>Performance History</div>
            {perfData.length > 0 ? (
              <table className="data-table" style={{ marginBottom: 20 }}>
                <thead><tr><th>Period</th><th>Cases Assigned</th><th>Completed</th><th>Returns Reviewed</th><th>Site Visits</th><th>Rating</th></tr></thead>
                <tbody>
                  {perfData.map(p => (
                    <tr key={p.id}>
                      <td className="mono">{p.period}</td>
                      <td className="mono">{p.cases_assigned}</td>
                      <td className="mono">{p.cases_completed}</td>
                      <td className="mono">{p.returns_reviewed}</td>
                      <td className="mono">{p.site_visits}</td>
                      <td><span className={`badge ${RATING_COLOR[p.rating]||'badge-gray'}`}>{p.rating}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="empty-state" style={{ marginBottom: 20 }}>No performance logs yet</div>}

            <div className="divider" />
            <div className="section-title" style={{ marginBottom: 12 }}>Log New Performance Entry</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Period</label>
                <input className="form-input" placeholder="e.g. 2025-Q2" value={perf.period} onChange={e => setPerf({...perf,period:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <select className="form-select" value={perf.rating} onChange={e => setPerf({...perf,rating:e.target.value})}>
                  {['excellent','satisfactory','needs improvement','unsatisfactory'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {[['cases_assigned','Cases Assigned'],['cases_completed','Cases Completed'],['returns_reviewed','Returns Reviewed'],['site_visits','Site Visits']].map(([k,l])=>(
                <div key={k} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-input" type="number" value={perf[k]} onChange={e => setPerf({...perf,[k]:e.target.value})} />
                </div>
              ))}
              <div className="form-group form-full">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={perf.notes} onChange={e => setPerf({...perf,notes:e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setPerfModal(null)}>Close</button>
              <button className="btn btn-primary" onClick={savePerf}>Log Entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
