# Octa Byte AI — Dynamic Portfolio Dashboard

A full-stack, real-time stock portfolio analytics web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Node.js**.

The dashboard tracks equity investments across multiple sectors, dynamically retrieving real-time stock prices from **Yahoo Finance** and financial ratios (P/E ratio and latest earnings) from **Google Finance**.

---

## 🌐 Live Production Deployment

- **Live URL:** [https://portfolio-dashboard-nine-sigma.vercel.app](https://portfolio-dashboard-nine-sigma.vercel.app)
- **API Endpoint:** [https://portfolio-dashboard-nine-sigma.vercel.app/api/portfolio](https://portfolio-dashboard-nine-sigma.vercel.app/api/portfolio)

---

## 🚀 Key Features

- **Real-Time Data Integration:**
  - **Yahoo Finance:** Real-time Current Market Price (CMP) and quote timestamp.
  - **Google Finance:** Real-time scraping for Price-to-Earnings (P/E) Ratio and Latest Earnings (EPS).
- **Dynamic 15-Second Polling:**
  - Automatic background polling every 15 seconds per case study requirements.
  - Interactive header with live progress countdown, Play/Pause toggle, and manual "Refresh Now" button.
- **Visual Performance Indicators:**
  - Color-coded profit & loss: Green (`emerald-400`) for gains, Red (`rose-400`) for losses.
  - Badges displaying percentage returns, exchange tags (NSE / BSE), and data source indicators.
- **Sector Grouping & Summaries:**
  - Aggregates capital allocation, current market value, and net gain/loss across each industry sector.
  - Toggle between **Standard Table** and **Sector Grouping View** (with sector headers and subtotals).
- **Data Table Powered by `@tanstack/react-table` (v8):**
  - Displays all 11 required columns from the Excel specification:
    1. Particulars (Stock Name & Symbol)
    2. Purchase Price
    3. Quantity (Qty)
    4. Investment (Purchase Price × Qty)
    5. Portfolio (%) (Proportional weight)
    6. NSE / BSE (Stock Exchange Code)
    7. CMP (Yahoo Finance)
    8. Present Value (CMP × Qty)
    9. Gain / Loss (Present Value – Investment)
    10. P/E Ratio (Google Finance)
    11. Latest Earnings (Google Finance)
  - Column sorting (ascending/descending), real-time search filtering, and sector dropdown filter.
  - One-click **CSV Export** for portfolio analysis.
- **Interactive Visualizations with Recharts:**
  - **Sector Weight Donut Chart:** Interactive visualization of capital distribution by sector.
  - **Performance Bar Chart:** Direct visual comparison of Invested Capital vs Current Market Valuation.
- **Resilient Fallback & Rate Limiting Strategy:**
  - In-memory TTL caching (25s for prices, 120s for Google Finance metrics).
  - Concurrency batching to eliminate HTTP 429 rate limit blocks.
  - Graceful fallback to offline baseline data if external financial providers become temporarily unreachable.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Frontend Library** | React 19 |
| **Language** | TypeScript 5 (Strict Mode) |
| **Styling** | Tailwind CSS |
| **Data Grid** | `@tanstack/react-table` v8 |
| **Charting** | Recharts 3 |
| **Icons** | Lucide React |
| **Excel Parser** | xlsx (SheetJS) |
| **Backend / API** | Next.js API Routes (Node.js runtime) |

---

## 📁 Project Structure

```
portfolio-dashboard/
├── docs/
│   └── TECHNICAL_DOCUMENT.md      # Detailed architecture, scraping strategy & interview guide
├── public/                        # Static assets & icons
├── scripts/
│   └── import-excel.cjs           # Script to parse and convert portfolio.xlsx to JSON
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── portfolio/
│   │   │       └── route.ts       # Backend API coordinating Yahoo & Google Finance scraping
│   │   ├── globals.css            # Tailwind styling
│   │   ├── layout.tsx             # Root HTML layout & fonts
│   │   └── page.tsx               # Main Dashboard page (integrates summary, charts, table)
│   ├── components/
│   │   ├── charts/
│   │   │   └── PortfolioChart.tsx # Recharts Donut & Bar charts
│   │   ├── dashboard/
│   │   │   └── PortfolioSummary.tsx # Top KPI metric summary cards
│   │   ├── layout/
│   │   │   └── Header.tsx         # Top bar with 15s refresh timer & controls
│   │   └── portfolio/
│   │       └── PortfolioTable.tsx # TanStack Table v8 with all 11 columns & sector grouping
│   ├── data/
│   │   └── portfolio.json         # Structured stock holdings dataset
│   ├── lib/
│   │   ├── calculations/
│   │   │   └── portfolio.ts       # Math formulas (Investment, PV, Gain/Loss, Sector stats)
│   │   └── utils/
│   │       └── format.ts          # INR currency, percentage, and date formatters
│   ├── services/
│   │   └── finance/
│   │       ├── google.ts          # Google Finance P/E & Latest Earnings scraper
│   │       └── yahoo.ts           # Yahoo Finance CMP quote fetcher
│   └── types/
│       └── portfolio.ts           # Complete TypeScript interfaces
├── portfolio.xlsx                 # Original portfolio dataset
├── package.json
└── tsconfig.json
```

---

## 💻 Getting Started

### 1. Prerequisites
- **Node.js:** v18.18.0 or later (v20+ recommended)
- **npm:** v9+ or later

### 2. Installation
Clone the repository and install dependencies:
```bash
cd portfolio-dashboard
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

### 4. Build for Production
To create an optimized production build:
```bash
npm run build
npm run start
```

### 5. Re-import Excel Sheet (Optional)
If you update `portfolio.xlsx`, you can regenerate `src/data/portfolio.json`:
```bash
node scripts/import-excel.cjs
```

---

## 📊 Evaluation Criteria Alignment

| Requirement | Implementation Details | Status |
|---|---|:---:|
| **All 11 Specified Columns** | Name, Purchase Price, Qty, Investment, Portfolio %, Exchange, CMP, Present Value, Gain/Loss, P/E, Earnings | ✅ Complete |
| **Yahoo Finance CMP** | Scraped via chart API with batching, caching, and fallback | ✅ Complete |
| **Google Finance P/E & Earnings** | Scraped via Google Finance HTML with regex parser, caching, and fallback | ✅ Complete |
| **Dynamic 15s Updates** | Real-time interval timer with progress countdown and pause/resume | ✅ Complete |
| **Visual Indicators** | Color-coded emerald gains and rose losses with trend badges | ✅ Complete |
| **Sector Grouping** | Sector summary cards, sector aggregation table, and grouped table view | ✅ Complete |
| **TanStack React Table** | Headless table with sorting, search filtering, and sector dropdown | ✅ Complete |
| **Recharts Visualizations** | Asset allocation donut chart and sector performance bar chart | ✅ Complete |
| **Deliverables & Documentation** | Full source code, README, and `docs/TECHNICAL_DOCUMENT.md` | ✅ Complete |

---

## 📖 Technical Documentation

For an in-depth explanation of the scraping architecture, concurrency batching, caching design, mathematical proofs, and interview preparation questions, see [docs/TECHNICAL_DOCUMENT.md](docs/TECHNICAL_DOCUMENT.md).
