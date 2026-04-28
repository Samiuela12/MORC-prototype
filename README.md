# TCMS — Taxpayer Compliance Management System
### Ministry of Revenue & Customs, Tonga

A full-stack web application for managing large taxpayer compliance, built as a portfolio project demonstrating ICT capabilities for the Large Business Processing section.

---

## Modules

| Module | Description |
|---|---|
| **Dashboard** | Real-time overview of taxpayers, returns, risks, and collections |
| **Taxpayer Register** | Register and manage large taxpayers (companies & individuals) |
| **Returns Tracker** | Log and review IT, CT, PAYE, WHT returns with auto-calculation |
| **Compliance Risk Register** | Identify, assess, and track compliance risks by severity |
| **Staff Performance** | Monitor officer KPIs, caseloads, and performance ratings |
| **Site Visit Log** | Record field visits, findings, and follow-up actions |
| **Tax Calculator** | PAYE, Corporate Tax, Consumption Tax, and WHT calculators using Tonga 2026 rates |

---

## Tech Stack

- **Backend**: Python / Flask, SQLite
- **Frontend**: React, Recharts
- **Deployment**: Render (with persistent disk)

---

## Tonga 2026 Tax Rates (built-in)

| Tax Type | Rate |
|---|---|
| Personal Income Tax | Progressive 0% – 25% |
| Tax-Free Threshold | TOP 12,000/year |
| Corporate Tax | 25% flat on net profit |
| Consumption Tax | 15% |
| Withholding Tax | 15% (interest/royalties) |
| TNRF Employee | 5% of gross salary |
| TNRF Employer | 7.5% of gross salary |

---

## Deploy to Render

### Option 1 — render.yaml (recommended)
1. Push this repository to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your GitHub repo — Render will detect `render.yaml` automatically
4. Click **Apply** — Render handles the build and start commands

### Option 2 — Manual Web Service
1. Push to GitHub
2. Render → New Web Service → Connect repo
3. **Build Command:**
   ```
   pip install -r backend/requirements.txt && cd frontend && npm install && npm run build
   ```
4. **Start Command:**
   ```
   bash start.sh
   ```
5. **Add a Disk** (under Advanced):
   - Mount path: `/opt/render/project/src`
   - Size: 1 GB
6. **Environment Variable:**
   - `DB_PATH` = `/opt/render/project/src/tcms.db`

---

## Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
python app.py

# Frontend (separate terminal)
cd frontend
npm install
npm start   # proxies API to localhost:5000
```

Add to `frontend/package.json`:
```json
"proxy": "http://localhost:5000"
```

---

## Notes

- SQLite database is seeded with sample large taxpayers on first run
- The disk mount on Render ensures data persists across deploys
- All tax calculations are based on the Income Tax Act 2007 (Tonga) and 2026 rates
