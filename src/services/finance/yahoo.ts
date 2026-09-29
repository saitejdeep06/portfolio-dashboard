import type { Stock, MarketQuote } from "@/types/portfolio";

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        regularMarketTime?: number;
        currency?: string;
      };
    }>;
    error?: {
      code?: string;
      description?: string;
    } | null;
  };
}

// In-memory cache for Yahoo Finance quotes to reduce provider rate limits
interface CacheEntry {
  quote: MarketQuote;
  timestamp: number;
}

const quoteCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 25000; // 25 seconds cache TTL

/**
 * Fetches the Current Market Price (CMP) for a single stock from Yahoo Finance.
 * Includes in-memory caching, request timeout, and fallback resilience.
 */
export async function fetchYahooQuote(stock: Stock): Promise<MarketQuote> {
  const cacheKey = stock.symbol || `${stock.name}_${stock.id}`;
  const now = Date.now();

  const cached = quoteCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.quote;
  }

  // If no symbol is available, fallback to static excel price
  if (!stock.symbol) {
    const fallback: MarketQuote = {
      cmp: stock.cmp || stock.purchasePrice,
      quoteTime: null,
      source: "Excel",
      status: "fallback"
    };
    return fallback;
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      stock.symbol
    )}?range=1d&interval=1m`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "application/json"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance responded with status ${response.status}`);
    }

    const data = (await response.json()) as YahooChartResponse;
    const result = data.chart?.result?.[0];
    const price = result?.meta?.regularMarketPrice;
    const timestamp = result?.meta?.regularMarketTime;

    if (
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      throw new Error(`Invalid price received for ${stock.symbol}`);
    }

    const quote: MarketQuote = {
      cmp: Number(price.toFixed(2)),
      quoteTime: timestamp
        ? new Date(timestamp * 1000).toISOString()
        : new Date().toISOString(),
      source: "Yahoo Finance",
      status: "success"
    };

    quoteCache.set(cacheKey, { quote, timestamp: now });
    return quote;
  } catch (error) {
    // Graceful degradation: return Excel price on error
    const fallback: MarketQuote = {
      cmp: stock.cmp || stock.purchasePrice,
      quoteTime: null,
      source: "Excel",
      status: "fallback"
    };

    // Cache fallback briefly (10s) to prevent spamming failed symbols
    quoteCache.set(cacheKey, { quote: fallback, timestamp: now });
    return fallback;
  }
}

/**
 * Batches fetching Yahoo Finance quotes for an array of stocks.
 * Uses concurrency throttling (batch size of 6) to avoid 429 rate limit blocks.
 */
export async function batchFetchYahooQuotes(
  stocks: Stock[],
  batchSize = 6
): Promise<Map<number, MarketQuote>> {
  const quotes = new Map<number, MarketQuote>();

  for (let i = 0; i < stocks.length; i += batchSize) {
    const batch = stocks.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (stock) => {
        const quote = await fetchYahooQuote(stock);
        return { id: stock.id, quote };
      })
    );

    for (const { id, quote } of batchResults) {
      quotes.set(id, quote);
    }
  }

  return quotes;
}
