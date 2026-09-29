export interface Stock {
  id: number;
  name: string;
  sector: string;
  symbol: string;
  exchange: "NSE" | "BSE" | string;
  purchasePrice: number;
  quantity: number;
  cmp: number;
  peRatio: number | null;
  latestEarnings: string;
}

export interface MarketQuote {
  cmp: number;
  quoteTime: string | null;
  source: "Yahoo Finance" | "Excel";
  status: "success" | "fallback";
}

export interface GoogleFinanceMetrics {
  peRatio: number | null;
  latestEarnings: string;
  source: "Google Finance" | "Excel";
  status: "success" | "fallback";
}

export interface PortfolioStock extends Stock {
  investment: number;
  portfolioPercentage: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  cmpSource: "Yahoo Finance" | "Excel";
  cmpStatus: "success" | "fallback";
  peSource: "Google Finance" | "Excel";
  peStatus: "success" | "fallback";
  quoteTime: string | null;
}

export interface SectorSummary {
  sector: string;
  investment: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  portfolioPercentage: number;
  stockCount: number;
}

export interface PortfolioApiResponse {
  success: boolean;
  updatedAt: string;
  liveCmpCount: number;
  liveGoogleCount: number;
  totalStocks: number;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  stocks: PortfolioStock[];
  sectors: SectorSummary[];
  message?: string;
}
