import React, { useState } from 'react';
import { api, fmt } from '../utils/api';

const BRACKETS = [
  { from: 0, to: 12000, rate: 0 },
  { from: 12001, to: 30000, rate: 0.10 },
  { from: 30001, to: 50000, rate: 0.15 },
  { from: 50001, to: 70000, rate: 0.20 },
  { from: 70001, to: Infinity, rate: 0.25 },
];

function InputField({ label, value, onChange, type = 'number', hint }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-input" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder="0" />
      {hint && <span style={{ fontSize: 11, color: '#7d8590', marginTop: 3 }}>{hint}</span>}
    </div>
  );
}

function ResultRow({ label, value, isTotal, highlight, dim }) {
  return (
    <div className={`calc-result-row ${isTotal ? 'total' : ''}`}>
      <span className="calc-result-label" style={{ color: dim ? '#484f58' : undefined }}>{label}</span>
      <span className="calc-result-value" style={{ color: highlight || undefined }}>{value}</span>
    </div>
  );
}

// ── PAYE CALCULATOR ───────────────────────────────────────────────────────────
function PAYECalc() {
  const [gross, setGross] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!gross) return;
    setLoading(true);
    try {
      const r = await api('/api/calculate/paye', { method: 'POST', body: JSON.stringify({ annual_gross: parseFloat(gross) }) });
      setResult(r);
    } finally { setLoading(false); }
  };

  return (
    <div className="calc-card">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>PAYE — Employee Income Tax</div>
        <div style={{ fontSize: 12, color: '#7d8590', lineHeight: 1.6 }}>
          Calculates annual PAYE tax using Tonga's 2026 progressive brackets. Includes TNRF deductions (employee 5%, employer 7.5%).
        </div>
      </div>

      <div style={{ background: '#1c2333', border: '1px solid #30363d', borderRadius: 8, padding: 16, marginBottom: 20 }}>
        <div className="section-title" style={{ marginBottom: 10 }}>2026 Tax Brackets</div>
        <table className="bracket-table">
          <thead><tr><th>Annual Income (TOP)</th><th>Rate</th></tr></thead>
          <tbody>
            {BRACKETS.map((b, i) => (
              <tr key={i}>
                <td className="mono" style={{ color: '#c9d1d9' }}>
                  {b.to === Infinity ? `${b.from.toLocaleString()}+` : `${b.from.toLocaleString()} – ${b.to.toLocaleString()}`}
                </td>
                <td><span className="badge" style={{ background: b.rate === 0 ? '#3fb95022' : b.rate <= 0.10 ? '#58a6ff22' : b.rate <= 0.15 ? '#e3b34122' : '#f8514922', color: b.rate === 0 ? '#3fb950' : b.rate <= 0.10 ? '#58a6ff' : b.rate <= 0.15 ? '#e3b341' : '#f85149' }}>{(b.rate * 100).toFixed(0)}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InputField label="Annual Gross Salary (TOP)" value={gross} onChange={setGross} hint="Enter the employee's total annual gross salary" />
      <button className="btn btn-primary" style={{ marginTop: 14, width: '100%' }} onClick={calculate} disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate PAYE'}
      </button>

      {result && (
        <div className="calc-result">
          <div className="section-title" style={{ marginBottom: 12 }}>Calculation Result</div>
          <ResultRow label="Annual Gross Salary" value={fmt(result.gross)} />
          <div style={{ margin: '8px 0 4px', fontSize: 11, color: '#7d8590', fontFamily: 'IBM Plex Mono', textTransform: 'uppercase', letterSpacing: 1 }}>Tax Breakdown by Bracket</div>
          {result.breakdown.map((b, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #21262d', fontSize: 12 }}>
              <span style={{ color: '#7d8590' }}>{b.range} @ {b.rate}</span>
              <span className="mono" style={{ color: b.tax > 0 ? '#e3b341' : '#3fb950' }}>{fmt(b.tax)}</span>
            </div>
          ))}
          <div className="divider" />
          <ResultRow label="Total Income Tax" value={fmt(result.income_tax)} highlight="#e3b341" />
          <ResultRow label={`TNRF — Employee (5%)`} value={fmt(result.tnrf_employee)} highlight="#58a6ff" />
          <ResultRow label={`TNRF — Employer (7.5%)`} value={fmt(result.tnrf_employer)} dim />
          <div className="divider" />
          <ResultRow label="Net Take-Home Pay" value={fmt(result.net_take_home)} isTotal highlight="#3fb950" />
          <ResultRow label="Effective Tax Rate" value={`${result.effective_rate.toFixed(2)}%`} />
        </div>
      )}
    </div>
  );
}

// ── CORPORATE TAX CALCULATOR ──────────────────────────────────────────────────
function CorporateCalc() {
  const [revenue, setRevenue] = useState('');
  const [deductions, setDeductions] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!revenue) return;
    setLoading(true);
    try {
      const r = await api('/api/calculate/corporate', { method: 'POST', body: JSON.stringify({ revenue: parseFloat(revenue), deductions: parseFloat(deductions) || 0 }) });
      setResult(r);
    } finally { setLoading(false); }
  };

  return (
    <div className="calc-card">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Corporate Tax (CT)</div>
        <div style={{ fontSize: 12, color: '#7d8590', lineHeight: 1.6 }}>
          Corporate income tax at a flat <strong style={{ color: '#c8a84b' }}>25%</strong> on net profit (revenue minus allowable deductions). Also calculates Consumption Tax liability on gross sales at <strong style={{ color: '#c8a84b' }}>15%</strong>.
        </div>
      </div>

      <div className="form-grid">
        <InputField label="Total Revenue (TOP)" value={revenue} onChange={setRevenue} hint="Gross business revenue for the fiscal year" />
        <InputField label="Allowable Deductions (TOP)" value={deductions} onChange={setDeductions} hint="Business expenses, depreciation, allowable costs" />
      </div>
      <button className="btn btn-primary" style={{ marginTop: 14, width: '100%' }} onClick={calculate} disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate Corporate Tax'}
      </button>

      {result && (
        <div className="calc-result">
          <div className="section-title" style={{ marginBottom: 12 }}>Corporate Tax Result</div>
          <ResultRow label="Gross Revenue" value={fmt(result.revenue)} />
          <ResultRow label="Allowable Deductions" value={`(${fmt(result.deductions)})`} highlight="#58a6ff" />
          <div className="divider" />
          <ResultRow label="Net Taxable Profit" value={fmt(result.net_profit)} />
          <ResultRow label="Corporate Tax @ 25%" value={fmt(result.corporate_tax)} highlight="#e3b341" isTotal />
          <div className="divider" />
          <ResultRow label="Consumption Tax on Sales @ 15%" value={fmt(result.consumption_tax_on_sales)} highlight="#f85149" />
          <div style={{ marginTop: 12, padding: '10px 12px', background: '#f8514920', borderRadius: 6, fontSize: 12, color: '#f85149' }}>
            ⚠ CT is collected from customers and remitted to MORC — it is not a cost to the business.
          </div>
        </div>
      )}
    </div>
  );
}

// ── CONSUMPTION TAX CALCULATOR ────────────────────────────────────────────────
function CTCalc() {
  const [amount, setAmount] = useState('');
  const [inclusive, setInclusive] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      const r = await api('/api/calculate/ct', { method: 'POST', body: JSON.stringify({ amount: parseFloat(amount), inclusive }) });
      setResult(r);
    } finally { setLoading(false); }
  };

  return (
    <div className="calc-card">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Consumption Tax (CT/GST)</div>
        <div style={{ fontSize: 12, color: '#7d8590', lineHeight: 1.6 }}>
          Tonga's Consumption Tax is levied at <strong style={{ color: '#c8a84b' }}>15%</strong> on most goods and services. Calculate CT-exclusive (add-on) or CT-inclusive (extract from total) amounts.
        </div>
      </div>

      <InputField label="Amount (TOP)" value={amount} onChange={setAmount} />
      <div style={{ margin: '14px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
          <div
            onClick={() => setInclusive(false)}
            style={{ padding: '6px 14px', borderRadius: 6, background: !inclusive ? '#c8a84b' : '#21262d', color: !inclusive ? '#0d1117' : '#7d8590', cursor: 'pointer', fontSize: 12, fontWeight: 600, border: '1px solid ' + (!inclusive ? '#c8a84b' : '#30363d'), transition: 'all 0.15s' }}
          >CT Exclusive</div>
        </label>
        <div
          onClick={() => setInclusive(true)}
          style={{ padding: '6px 14px', borderRadius: 6, background: inclusive ? '#c8a84b' : '#21262d', color: inclusive ? '#0d1117' : '#7d8590', cursor: 'pointer', fontSize: 12, fontWeight: 600, border: '1px solid ' + (inclusive ? '#c8a84b' : '#30363d'), transition: 'all 0.15s' }}
        >CT Inclusive</div>
        <span style={{ fontSize: 11, color: '#7d8590' }}>{inclusive ? 'Extract CT from total' : 'Add CT to amount'}</span>
      </div>
      <button className="btn btn-primary" style={{ width: '100%' }} onClick={calculate} disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate CT'}
      </button>

      {result && (
        <div className="calc-result">
          <div className="section-title" style={{ marginBottom: 12 }}>CT Calculation</div>
          <ResultRow label={inclusive ? 'CT-Inclusive Amount' : 'Ex-CT Amount'} value={fmt(result.ex_ct_amount)} />
          <ResultRow label="Consumption Tax (15%)" value={fmt(result.ct_amount)} highlight="#e3b341" />
          <div className="divider" />
          <ResultRow label="Total (CT Inclusive)" value={fmt(result.total)} isTotal highlight="#3fb950" />
        </div>
      )}
    </div>
  );
}

// ── WHT CALCULATOR ────────────────────────────────────────────────────────────
function WHTCalc() {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('interest');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      const r = await api('/api/calculate/wht', { method: 'POST', body: JSON.stringify({ amount: parseFloat(amount), type }) });
      setResult(r);
    } finally { setLoading(false); }
  };

  return (
    <div className="calc-card">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Withholding Tax (WHT)</div>
        <div style={{ fontSize: 12, color: '#7d8590', lineHeight: 1.6 }}>
          WHT is deducted at source at <strong style={{ color: '#c8a84b' }}>15%</strong> on interest payments and natural resource royalties paid to non-residents and certain local payments.
        </div>
      </div>

      <div className="form-grid">
        <InputField label="Gross Payment Amount (TOP)" value={amount} onChange={setAmount} />
        <div className="form-group">
          <label className="form-label">Payment Type</label>
          <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
            <option value="interest">Interest</option>
            <option value="royalty">Natural Resource Royalty</option>
            <option value="dividend">Dividend</option>
            <option value="service">Service Payment (Non-resident)</option>
          </select>
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 14, width: '100%' }} onClick={calculate} disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate WHT'}
      </button>

      {result && (
        <div className="calc-result">
          <div className="section-title" style={{ marginBottom: 12 }}>WHT Calculation</div>
          <ResultRow label="Gross Payment" value={fmt(result.gross_amount)} />
          <ResultRow label={`WHT Rate`} value={result.wht_rate} />
          <ResultRow label="WHT to Remit to MORC" value={fmt(result.wht_amount)} highlight="#e3b341" />
          <div className="divider" />
          <ResultRow label="Net Payment to Recipient" value={fmt(result.net_payment)} isTotal highlight="#3fb950" />
          <div style={{ marginTop: 12, padding: '10px 12px', background: '#58a6ff15', borderRadius: 6, fontSize: 12, color: '#58a6ff' }}>
            ℹ WHT must be remitted to MORC by the 15th of the following month.
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'paye', label: 'PAYE / Employee Tax', component: PAYECalc },
  { id: 'corporate', label: 'Corporate Tax', component: CorporateCalc },
  { id: 'ct', label: 'Consumption Tax', component: CTCalc },
  { id: 'wht', label: 'Withholding Tax', component: WHTCalc },
];

export default function TaxCalculator() {
  const [tab, setTab] = useState('paye');
  const Active = TABS.find(t => t.id === tab)?.component || PAYECalc;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Tax Calculator</div>
          <div className="page-subtitle">Tonga 2026 Tax Rates — PAYE · Corporate · CT · WHT</div>
        </div>
        <div style={{ background: '#1c2333', border: '1px solid #30363d', borderRadius: 6, padding: '6px 14px', fontSize: 12, color: '#7d8590' }}>
          Rates: Income Tax Act 2007 (as amended) · CT Act
        </div>
      </div>

      <div className="page-body">
        <div className="calc-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`calc-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: 680 }}>
          <Active />
        </div>

        <div style={{ marginTop: 32, padding: 20, background: '#161b22', border: '1px solid #30363d', borderRadius: 10, maxWidth: 680 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Quick Reference — Tonga 2026 Tax Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
            {[
              ['Personal Income Tax', 'Progressive 0% – 25%'],
              ['Tax-Free Threshold', 'TOP 12,000/year'],
              ['Corporate Tax Rate', '25% flat on net profit'],
              ['Consumption Tax (CT)', '15% on goods & services'],
              ['Withholding Tax (WHT)', '15% on interest/royalties'],
              ['TNRF Employee', '5% of gross salary'],
              ['TNRF Employer', '7.5% of gross salary'],
              ['PAYE Remittance', 'By 15th of following month'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #21262d', paddingBottom: 8 }}>
                <span style={{ color: '#7d8590' }}>{label}</span>
                <span className="mono" style={{ color: '#c8a84b', fontWeight: 600, fontSize: 12 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
