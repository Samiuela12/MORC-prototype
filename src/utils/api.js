const BASE = process.env.REACT_APP_API_URL || '';

export async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const fmt = (n) => new Intl.NumberFormat('en-TO', { style: 'currency', currency: 'TOP', maximumFractionDigits: 0 }).format(n || 0);
export const fmtNum = (n) => new Intl.NumberFormat().format(n || 0);
export const fmtPct = (n) => `${(n || 0).toFixed(1)}%`;
