import type { Stock, GoogleFinanceMetrics } from "@/types/portfolio";

interface CacheEntry {
  metrics: GoogleFinanceMetrics;
  timestamp: number;
}

// In-memory cache for Google Finance metrics to prevent Google bot blocks
const metricsCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 120000; // 2 minutes cache TTL

/**
 * Builds the canonical Google Finance URL for an Indian stock
 * Examples:
 * - HDFCBANK.NS -> https://www.google.com/finance/quote/HDFCBANK:NSE
 * - 532174.BO -> https://www.google.com/finance/quote/532174:BOM
 */
function getGoogleFinanceUrl(stock: Stock): string | null {
  if (!stock.symbol) {
    return null;
  }

  const cleanSymbol = stock.symbol
    .replace(/\.NS$/i, "")
    .replace(/\.BO$/i, "")
    .trim();

  const exchange =
    stock.exchange?.toUpperCase() === "BSE" || stock.symbol.endsWith(".BO")
      ? "BOM"
      : "NSE";

  return `https://www.google.com/finance/quote/${encodeURIComponent(cleanSymbol)}:${exchange}`;
}

/**
 * Parses P/E ratio from Google Finance HTML
 */
function extractPeRatio(html: string): number | null {
  // Matches <div class="...">P/E ratio</div><div class="...">13.97</div>
  const peRegex = /P\/E ratio<\/div>\s*<div[^>]*>([0-9.,\-]+)<\/div>/i;
  const match = html.match(peRegex);

  if (!match || !match[1] || match[1].trim() === "-" || match[1].trim() === "N/A") {
    return null;
  }

  const parsed = parseFloat(match[1].replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : null;
}

/**
 * Parses EPS / Latest Earnings from Google Finance HTML
 */
function extractEarnings(html: string, fallback: string): string {
  // Matches EPS or Earnings per share or Quarterly earnings
  const epsRegex = /(?:EPS|Earnings per share)<\/div>\s*<div[^>]*>([^<]+)<\/div>/i;
  const match = html.match(epsRegex);

  if (match && match[1]) {
    const rawVal = match[1].trim();
    if (rawVal && rawVal !== "-" && rawVal !== "N/A") {
      // Clean up currency symbol if needed or keep clean numeric representation
      const cleaned = rawVal.replace(/[^\d.,\-]/g, "").trim();
      return cleaned || rawVal;
    }
  }

  return fallback;
}

/**
 * Fetches P/E ratio and Latest Earnings from Google Finance for a single stock.
 * Uses HTTP scraping with regex parsing, in-memory caching, and Excel fallback.
 */
export async function fetchGoogleFinanceMetrics(
  stock: Stock
): Promise<GoogleFinanceMetrics> {
  const cacheKey = stock.symbol || `${stock.name}_${stock.id}`;
  const now = Date.now();

  const cached = metricsCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.metrics;
  }

  const fallback: GoogleFinanceMetrics = {
    peRatio: stock.peRatio,
    latestEarnings: stock.latestEarnings || "N/A",
    source: "Excel",
    status: "fallback"
  };

  const url = getGoogleFinanceUrl(stock);
  if (!url) {
    return fallback;
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`Google Finance responded with status ${response.status}`);
    }

    const html = await response.text();

    const peRatio = extractPeRatio(html);
    const latestEarnings = extractEarnings(html, stock.latestEarnings);

    // If neither could be parsed, consider it a fallback
    const isSuccess = peRatio !== null || latestEarnings !== "N/A";

    const metrics: GoogleFinanceMetrics = {
      peRatio: peRatio !== null ? peRatio : stock.peRatio,
      latestEarnings: latestEarnings || stock.latestEarnings || "N/A",
      source: isSuccess ? "Google Finance" : "Excel",
      status: isSuccess ? "success" : "fallback"
    };

    metricsCache.set(cacheKey, { metrics, timestamp: now });
    return metrics;
  } catch (error) {
    metricsCache.set(cacheKey, { metrics: fallback, timestamp: now });
    return fallback;
  }
}

/**
 * Batches fetching Google Finance metrics for an array of stocks.
 * Uses concurrency throttling (batch size of 5) to prevent Google from triggering captchas.
 */
export async function batchFetchGoogleMetrics(
  stocks: Stock[],
  batchSize = 5
): Promise<Map<number, GoogleFinanceMetrics>> {
  const results = new Map<number, GoogleFinanceMetrics>();

  for (let i = 0; i < stocks.length; i += batchSize) {
    const batch = stocks.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (stock) => {
        const metrics = await fetchGoogleFinanceMetrics(stock);
        return { id: stock.id, metrics };
      })
    );

    for (const { id, metrics } of batchResults) {
      results.set(id, metrics);
    }
  }

  return results;
}
