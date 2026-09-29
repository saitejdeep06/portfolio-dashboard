import type {
  Stock,
  PortfolioStock,
  SectorSummary,
  MarketQuote,
  GoogleFinanceMetrics
} from "@/types/portfolio";

/**
 * Computes individual stock metrics and overall portfolio weights.
 *
 * Formulas:
 * - Investment = Purchase Price × Quantity
 * - Present Value = CMP × Quantity
 * - Gain/Loss = Present Value - Investment
 * - Gain/Loss % = (Gain/Loss / Investment) × 100
 * - Portfolio % = (Stock Investment / Total Portfolio Investment) × 100
 */
export function calculatePortfolio(
  rawStocks: Stock[],
  yahooQuotes?: Map<number, MarketQuote>,
  googleMetrics?: Map<number, GoogleFinanceMetrics>
): {
  stocks: PortfolioStock[];
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
} {
  // First calculate total investment across the portfolio
  const totalInvestment = rawStocks.reduce(
    (sum, stock) => sum + stock.purchasePrice * stock.quantity,
    0
  );

  const stocks: PortfolioStock[] = rawStocks.map((stock) => {
    const yQuote = yahooQuotes?.get(stock.id);
    const gMetric = googleMetrics?.get(stock.id);

    const cmp = yQuote?.cmp ?? stock.cmp ?? stock.purchasePrice;
    const peRatio = gMetric?.peRatio ?? stock.peRatio;
    const latestEarnings = gMetric?.latestEarnings ?? stock.latestEarnings ?? "N/A";

    const investment = Number((stock.purchasePrice * stock.quantity).toFixed(2));
    const presentValue = Number((cmp * stock.quantity).toFixed(2));
    const gainLoss = Number((presentValue - investment).toFixed(2));

    const portfolioPercentage =
      totalInvestment > 0
        ? Number(((investment / totalInvestment) * 100).toFixed(2))
        : 0;

    const gainLossPercentage =
      investment > 0
        ? Number(((gainLoss / investment) * 100).toFixed(2))
        : 0;

    return {
      ...stock,
      cmp,
      peRatio,
      latestEarnings,
      investment,
      presentValue,
      gainLoss,
      portfolioPercentage,
      gainLossPercentage,
      cmpSource: yQuote?.source ?? "Excel",
      cmpStatus: yQuote?.status ?? "fallback",
      peSource: gMetric?.source ?? "Excel",
      peStatus: gMetric?.status ?? "fallback",
      quoteTime: yQuote?.quoteTime ?? null
    };
  });

  const totalPresentValue = Number(
    stocks.reduce((sum, s) => sum + s.presentValue, 0).toFixed(2)
  );

  const totalGainLoss = Number(
    (totalPresentValue - totalInvestment).toFixed(2)
  );

  const totalGainLossPercentage =
    totalInvestment > 0
      ? Number(((totalGainLoss / totalInvestment) * 100).toFixed(2))
      : 0;

  return {
    stocks,
    totalInvestment: Number(totalInvestment.toFixed(2)),
    totalPresentValue,
    totalGainLoss,
    totalGainLossPercentage
  };
}

/**
 * Groups stocks by sector and computes sector-level aggregates:
 * - Sector Investment
 * - Sector Present Value
 * - Sector Gain / Loss
 * - Sector Gain / Loss %
 * - Sector Portfolio Weight %
 */
export function calculateSectorSummary(
  stocks: PortfolioStock[],
  totalPortfolioInvestment: number
): SectorSummary[] {
  const map = new Map<string, SectorSummary>();

  for (const stock of stocks) {
    const sectorName = stock.sector || "Other";
    const existing = map.get(sectorName) ?? {
      sector: sectorName,
      investment: 0,
      presentValue: 0,
      gainLoss: 0,
      gainLossPercentage: 0,
      portfolioPercentage: 0,
      stockCount: 0
    };

    existing.investment += stock.investment;
    existing.presentValue += stock.presentValue;
    existing.gainLoss += stock.gainLoss;
    existing.stockCount += 1;

    map.set(sectorName, existing);
  }

  return Array.from(map.values())
    .map((s) => {
      const investment = Number(s.investment.toFixed(2));
      const presentValue = Number(s.presentValue.toFixed(2));
      const gainLoss = Number((presentValue - investment).toFixed(2));
      const gainLossPercentage =
        investment > 0
          ? Number(((gainLoss / investment) * 100).toFixed(2))
          : 0;
      const portfolioPercentage =
        totalPortfolioInvestment > 0
          ? Number(((investment / totalPortfolioInvestment) * 100).toFixed(2))
          : 0;

      return {
        ...s,
        investment,
        presentValue,
        gainLoss,
        gainLossPercentage,
        portfolioPercentage
      };
    })
    .sort((a, b) => b.investment - a.investment);
}
