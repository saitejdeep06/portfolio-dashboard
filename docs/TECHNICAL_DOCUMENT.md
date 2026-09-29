# Dynamic Portfolio Dashboard — Technical Architecture & Case Study Report

**Company:** Octa Byte AI Pvt Ltd  
**Role / Assignment:** Full-Stack Portfolio Dashboard (React.js, TypeScript, Tailwind CSS, Node.js / Next.js)  
**Author / Candidate:** Submission Documentation  

---

## 1. Executive Summary

This project delivers a real-time, responsive financial portfolio dashboard designed for modern investors. The dashboard aggregates equity holdings, tracks capital allocation across diverse sectors, and pulls live market data:
- **Current Market Price (CMP)** fetched dynamically from **Yahoo Finance**.
- **Price-to-Earnings (P/E) Ratio** and **Latest Earnings (EPS)** scraped in real-time from **Google Finance**.
- **Dynamic periodic updates** executed every **15 seconds** with interactive pause/resume and manual refresh capabilities.
- **Visual indicators** color-coding gains (emerald green) and losses (rose red).
- **Sector grouping** with aggregated investment, valuation, gain/loss, and portfolio weighting.
- **Interactive visualizations** using **Recharts** for asset allocation (Donut Chart) and sector performance (Bar Chart).
- **Advanced data grid** powered by **@tanstack/react-table** featuring multi-column sorting, text filtering, sector filtering, and CSV export.

---

## 2. Technical Architecture & Data Flow

### 2.1 System Architecture Diagram

```
+-------------------------------------------------------------------------+
|                              CLIENT (Browser)                           |
|                                                                         |
|  +--------------------+  +--------------------+  +--------------------+ |
|  | Header & 15s Timer |  | PortfolioSummary   |  | Recharts (Donut/Bar)| |
|  +--------------------+  +--------------------+  +--------------------+ |
|  +--------------------------------------------------------------------+ |
|  |      TanStack React Table (All 11 Columns, Sorting, Sector Group)  | |
|  +--------------------------------------------------------------------+ |
+------------------------------------▲------------------------------------+
                                     │ (JSON polling every 15s)
                                     ▼
+-------------------------------------------------------------------------+
|                   NEXT.JS BACKEND (API Route: /api/portfolio)            |
|                                                                         |
|  +--------------------+  +--------------------+  +--------------------+ |
|  | Portfolio Math Eng |  | Yahoo Service      |  | Google Scraper     | |
|  | (Weights, P&L, Sec)|  | (CMP, Batching)    |  | (P/E, EPS, Regex)  | |
|  +--------------------+  +---------▲----------+  +---------▲----------+ |
|                                    │                       │            |
|                           +--------┴-------+      +--------┴-------+    |
|                           | In-Memory Cache|      | In-Memory Cache|    |
|                           | (25s TTL)      |      | (120s TTL)     |    |
|                           +----------------+      +----------------+    |
+------------------------------------▲-----------------------▲------------+
                                     │                       │
                                     ▼                       ▼
                           [Yahoo Finance API]     [Google Finance HTML]
                           query1.finance.yahoo    google.com/finance
```

### 2.2 Core Technologies Used
- **Frontend Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript 5 (Strict Mode for 100% type safety)
- **Styling:** Tailwind CSS (Modern dark-slate financial terminal design system)
- **Data Table:** `@tanstack/react-table` v8 (Headless, performant, sortable, filterable)
- **Visualizations:** `recharts` (Responsive SVG charts for asset allocation and performance)
- **Icons:** `lucide-react`
- **Data Persistence & Fallback:** Structured `portfolio.json` parsed from `portfolio.xlsx` via `xlsx`

---

## 3. API Strategy & Key Technical Challenges

### 3.1 Challenge 1: Unofficial APIs & Scraping
Neither Yahoo Finance nor Google Finance offers an officially sanctioned, free, unauthenticated REST API for retail developers. 

#### Solutions Implemented:
1. **Yahoo Finance Engine (`src/services/finance/yahoo.ts`):**
   - Leverages Yahoo's internal chart endpoint:  
     `https://query1.finance.yahoo.com/v8/finance/chart/{SYMBOL}?range=1d&interval=1m`
   - Handles both `.NS` (National Stock Exchange of India) and `.BO` (Bombay Stock Exchange) symbol conventions.
   - Extracts `meta.regularMarketPrice` and `meta.regularMarketTime`.
   - Sets a strict `AbortSignal.timeout(8000)` to ensure a slow external response never stalls our dashboard.

2. **Google Finance Scraper (`src/services/finance/google.ts`):**
   - Google Finance serves server-rendered HTML pages at:  
     `https://www.google.com/finance/quote/{SYMBOL}:{EXCHANGE}` (e.g., `HDFCBANK:NSE` or `532174:BOM`).
   - Uses lightweight HTTP GET requests mimicking modern browser headers (`User-Agent`, `Accept-Language`, `Accept: text/html`).
   - Parses the HTML using high-performance regex targeted at key statistic containers:
     - **P/E Ratio:** `P\/E ratio<\/div>\s*<div[^>]*>([0-9.,\-]+)<\/div>`
     - **Earnings / EPS:** `(?:EPS|Earnings per share)<\/div>\s*<div[^>]*>([^<]+)<\/div>`
   - Cleans numeric formats (removes currency symbols, commas, and handles `N/A` or `-`).

---

### 3.2 Challenge 2: Rate Limiting & Throttling
Aggressive continuous polling from 35+ stocks simultaneously risks hitting HTTP 429 (Too Many Requests) or bot verification captchas.

#### Solutions Implemented:
1. **Concurrency Batching (`batchFetch`):**
   - Rather than firing 35 parallel HTTP requests simultaneously, requests are chunked into small batches of 5 to 6 using `Promise.all`:
     ```ts
     for (let i = 0; i < stocks.length; i += batchSize) {
       const batch = stocks.slice(i, i + batchSize);
       await Promise.all(batch.map(fetchQuote));
     }
     ```
2. **Dual-Layer In-Memory Caching:**
   - **Yahoo CMP Cache (25s TTL):** Since the dashboard polls every 15 seconds, a 25-second cache avoids redundant requests during simultaneous browser tab sessions or rapid manual refreshes.
   - **Google Finance Metrics Cache (120s TTL):** Fundamental metrics such as P/E ratio and quarterly earnings do not change by the second. Caching them for 2 minutes dramatically slashes outbound traffic by over 85%, ensuring Google never blocks the server IP.

---

### 3.3 Challenge 3: Asynchronous Operations & Error Resilience
External financial web scrapers can fail at any time due to network hiccups, market closures, or HTML layout updates.

#### Solutions Implemented:
1. **Graceful Fallback Mechanism:**
   - Every stock holding carries baseline data extracted from `portfolio.xlsx`.
   - If Yahoo or Google Finance fails to respond, returns HTTP error, or times out, the service automatically falls back to the baseline price, logs the failure, and flags the holding with `marketStatus: "fallback"`.
   - The user interface transparently indicates the data source for every single row (`Yahoo Live`, `Google Fin`, or `Excel`).
2. **Parallel Promise Orchestration:**
   - In `/api/portfolio/route.ts`, both Yahoo Finance and Google Finance batch operations execute in parallel via `Promise.all([batchFetchYahooQuotes, batchFetchGoogleMetrics])`.
   - Total latency is bounded by `max(yahooTime, googleTime)` rather than `yahooTime + googleTime`.

---

## 4. Mathematical Modeling & Data Transformations

The calculations strictly follow the requirements in the assignment specification:

| Field | Mathematical Formula | Purpose |
|---|---|---|
| **Investment** | $\text{Purchase Price} \times \text{Quantity}$ | Total capital spent to acquire the position |
| **Present Value** | $\text{CMP} \times \text{Quantity}$ | Current liquid market value of the position |
| **Gain / Loss** | $\text{Present Value} - \text{Investment}$ | Absolute profit or loss in INR |
| **Gain / Loss %** | $\left( \frac{\text{Gain / Loss}}{\text{Investment}} \right) \times 100$ | Relative return percentage on the position |
| **Portfolio (%)** | $\left( \frac{\text{Stock Investment}}{\text{Total Portfolio Investment}} \right) \times 100$ | Proportional capital weight within the entire portfolio |
| **Sector Investment** | $\sum_{\text{sector}} \text{Stock Investment}$ | Total capital allocated to a given industry sector |
| **Sector Value** | $\sum_{\text{sector}} \text{Stock Present Value}$ | Total current valuation of all holdings in that sector |
| **Sector Gain / Loss** | $\text{Sector Value} - \text{Sector Investment}$ | Net dollar performance of the sector |

All currency outputs are formatted according to the Indian numbering system (e.g. `₹1,24,500.00`).

---

## 5. User Interface & User Experience (UI/UX)

The user interface was engineered to meet the standards of modern financial terminals (such as Bloomberg or Zerodha Kite):
1. **Dark Theme Palette:** Built using Tailwind CSS `slate-950` background, `slate-900` card surfaces, and `slate-800` subtle border divisions to minimize eye strain.
2. **Dynamic 15-Second Refresh Widget:**
   - Interactive progress bar and countdown indicator showing `Next refresh in Xs`.
   - Play/Pause toggle allowing users to freeze updates during deep analysis.
   - Manual `Refresh Now` button with animated spin feedback.
3. **Visual Indicators:**
   - Positive gains displayed in vibrant `emerald-400` with positive return badges.
   - Losses displayed in crisp `rose-400` with negative return badges.
4. **TanStack Table v8:**
   - Supports ascending and descending sorting on any column.
   - Instant text search across holding names, tickers, and sectors.
   - Sector filter dropdown.
   - **View Mode Switcher:** Toggle between standard flat table view and **Sector Grouping View** (which includes sector-level subtotals).
   - **CSV Export:** Download real-time enriched portfolio tables with a single click.
5. **Interactive Recharts:**
   - **Sector Allocation Donut Chart:** Interactive tooltip with total investment, present value, and % weight.
   - **Performance Bar Chart:** Direct comparison between invested capital vs current value per sector.

---

## 6. Interview Explanation Guide (Talking Points)

When explaining this solution in an interview, emphasize the following points:

1. **Why TanStack Table v8?**
   - TanStack Table is a headless table utility. Unlike rigid component libraries, it provides full control over UI rendering, markup, and accessibility while managing complex sorting, multi-filtering, and state memoization without unnecessary re-renders.

2. **How is scraping handled without breaking?**
   - Explain the dual fallback design: We scrape Yahoo's JSON chart endpoint and Google Finance's HTML. If Google updates their DOM or throttles requests, the server catches the exception and falls back to our offline Excel dataset, preventing 500 errors or app crashes.

3. **How is rate limiting managed?**
   - Explain the two-tier approach:
     a) Concurrency throttling (chunking requests into batches of 5-6 rather than firing 35 requests at once).
     b) In-memory TTL caching (25s for prices, 120s for P/E & earnings) so rapid polls do not abuse external providers.

4. **Why Next.js App Router API routes instead of a separate Express server?**
   - Next.js API routes provide seamless full-stack cohesion with shared TypeScript definitions (`Stock`, `PortfolioStock`, `SectorSummary`) between client and server, zero CORS overhead, and instant deployment on Vercel or Node.js containers.
