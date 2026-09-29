import { NextResponse } from "next/server";
import portfolioData from "@/data/portfolio.json";
import type { Stock, PortfolioApiResponse } from "@/types/portfolio";
import { calculatePortfolio, calculateSectorSummary } from "@/lib/calculations/portfolio";
import { batchFetchYahooQuotes } from "@/services/finance/yahoo";
import { batchFetchGoogleMetrics } from "@/services/finance/google";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const rawStocks = portfolioData as Stock[];

    // Fetch Yahoo Finance (CMP) and Google Finance (PE, Earnings) concurrently in parallel
    const [yahooQuotes, googleMetrics] = await Promise.all([
      batchFetchYahooQuotes(rawStocks, 6),
      batchFetchGoogleMetrics(rawStocks, 5)
    ]);

    // Calculate individual stock values and overall portfolio aggregates
    const {
      stocks,
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      totalGainLossPercentage
    } = calculatePortfolio(rawStocks, yahooQuotes, googleMetrics);

    // Calculate sector-level summaries
    const sectors = calculateSectorSummary(stocks, totalInvestment);

    const liveCmpCount = stocks.filter((s) => s.cmpStatus === "success").length;
    const liveGoogleCount = stocks.filter((s) => s.peStatus === "success").length;

    const response: PortfolioApiResponse = {
      success: true,
      updatedAt: new Date().toISOString(),
      liveCmpCount,
      liveGoogleCount,
      totalStocks: stocks.length,
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      totalGainLossPercentage,
      stocks,
      sectors
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0"
      }
    });
  } catch (error) {
    console.error("API /api/portfolio error:", error);

    // If an unexpected crash occurs, perform fallback calculations using raw static data
    const rawStocks = portfolioData as Stock[];
    const {
      stocks,
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      totalGainLossPercentage
    } = calculatePortfolio(rawStocks);
    const sectors = calculateSectorSummary(stocks, totalInvestment);

    const fallbackResponse: PortfolioApiResponse = {
      success: true,
      updatedAt: new Date().toISOString(),
      liveCmpCount: 0,
      liveGoogleCount: 0,
      totalStocks: stocks.length,
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      totalGainLossPercentage,
      stocks,
      sectors,
      message: "External financial providers temporarily unavailable. Displaying cached baseline values."
    };

    return NextResponse.json(fallbackResponse);
  }
}