"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { PortfolioStock, SectorSummary, PortfolioApiResponse } from "@/types/portfolio";
import { Header } from "@/components/layout/Header";
import { PortfolioSummary } from "@/components/dashboard/PortfolioSummary";
import { PortfolioChart } from "@/components/charts/PortfolioChart";
import { PortfolioTable } from "@/components/portfolio/PortfolioTable";
import { AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils/format";

const REFRESH_INTERVAL_SECONDS = 15; // Dynamic update interval per specification

export default function Home() {
  const [stocks, setStocks] = useState<PortfolioStock[]>([]);
  const [sectors, setSectors] = useState<SectorSummary[]>([]);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [totalPresentValue, setTotalPresentValue] = useState(0);
  const [totalGainLoss, setTotalGainLoss] = useState(0);
  const [totalGainLossPercentage, setTotalGainLossPercentage] = useState(0);
  const [liveCmpCount, setLiveCmpCount] = useState(0);
  const [liveGoogleCount, setLiveGoogleCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-refresh control state
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(REFRESH_INTERVAL_SECONDS);

  const isFetchingRef = useRef(false);

  // Main data loader function
  const fetchPortfolioData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const response = await fetch("/api/portfolio", {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: PortfolioApiResponse = await response.json();

      if (data.success) {
        setStocks(data.stocks);
        setSectors(data.sectors);
        setTotalInvestment(data.totalInvestment);
        setTotalPresentValue(data.totalPresentValue);
        setTotalGainLoss(data.totalGainLoss);
        setTotalGainLossPercentage(data.totalGainLossPercentage);
        setLiveCmpCount(data.liveCmpCount);
        setLiveGoogleCount(data.liveGoogleCount);
        setLastUpdated(data.updatedAt);
        setErrorMessage(null);
      } else {
        throw new Error(data.message || "Failed to load portfolio metrics");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error connecting to market data services";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
      setSecondsUntilRefresh(REFRESH_INTERVAL_SECONDS);
    }
  }, []);

  // Initial load
  useEffect(() => {
    void fetchPortfolioData();
  }, [fetchPortfolioData]);

  // Dynamic 15-second interval timer
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const timer = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          void fetchPortfolioData();
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, fetchPortfolioData]);

  const handleToggleAutoRefresh = () => {
    setAutoRefreshEnabled((prev) => !prev);
    setSecondsUntilRefresh(REFRESH_INTERVAL_SECONDS);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      {/* 1. Header with dynamic update controls */}
      <Header
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        onRefresh={() => void fetchPortfolioData()}
        autoRefreshEnabled={autoRefreshEnabled}
        onToggleAutoRefresh={handleToggleAutoRefresh}
        secondsUntilRefresh={secondsUntilRefresh}
        totalIntervalSeconds={REFRESH_INTERVAL_SECONDS}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {/* Error / Provider Notice Banner */}
        {errorMessage && (
          <div className="flex items-center justify-between rounded-xl border border-rose-800/60 bg-rose-950/40 p-4 text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage} (Using resilient baseline data)</span>
            </div>
            <button
              onClick={() => void fetchPortfolioData()}
              className="font-semibold text-rose-200 underline hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* First time loading skeleton */}
        {isLoading && stocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-4 text-sm font-medium text-slate-300">
              Fetching live market prices from Yahoo Finance &amp; Google Finance...
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Scraping real-time CMP, P/E ratios, and latest earnings
            </p>
          </div>
        ) : (
          <>
            {/* 2. Top Summary KPI Cards */}
            <PortfolioSummary
              totalInvestment={totalInvestment}
              totalPresentValue={totalPresentValue}
              totalGainLoss={totalGainLoss}
              totalGainLossPercentage={totalGainLossPercentage}
              totalStocks={stocks.length}
              liveCmpCount={liveCmpCount}
              liveGoogleCount={liveGoogleCount}
            />

            {/* 3. Recharts Visualizations */}
            <PortfolioChart sectors={sectors} />

            {/* 4. Sector Summary Table */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Sector Summaries
                  </h3>
                  <p className="text-xs text-slate-400">
                    Aggregated capital distribution and profit/loss by market segment
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {sectors.length} sectors active
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950/60 uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="p-3">Sector</th>
                      <th className="p-3 text-right">Holdings</th>
                      <th className="p-3 text-right">Total Investment</th>
                      <th className="p-3 text-right">Weight (%)</th>
                      <th className="p-3 text-right">Present Value</th>
                      <th className="p-3 text-right">Gain / Loss</th>
                      <th className="p-3 text-right">Return (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
                    {sectors.map((sec) => {
                      const isGain = sec.gainLoss >= 0;
                      return (
                        <tr key={sec.sector} className="hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-white">
                            {sec.sector}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-300">
                            {sec.stockCount}
                          </td>
                          <td className="p-3 text-right font-medium text-slate-200">
                            {formatCurrency(sec.investment)}
                          </td>
                          <td className="p-3 text-right font-mono text-blue-400">
                            {formatPercentage(sec.portfolioPercentage)}
                          </td>
                          <td className="p-3 text-right font-semibold text-slate-100">
                            {formatCurrency(sec.presentValue)}
                          </td>
                          <td
                            className={`p-3 text-right font-bold ${
                              isGain ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {formatCurrency(sec.gainLoss)}
                          </td>
                          <td
                            className={`p-3 text-right font-bold ${
                              isGain ? "text-emerald-500" : "text-rose-500"
                            }`}
                          >
                            {formatPercentage(sec.gainLossPercentage, true)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 5. Complete Holdings Table with @tanstack/react-table */}
            <section>
              <PortfolioTable stocks={stocks} sectors={sectors} />
            </section>
          </>
        )}

        {/* Footer & Compliance Disclaimer */}
        <footer className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-800 py-6 text-xs text-slate-500 sm:flex-row">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>
              Dynamic updates interval: <span className="font-semibold text-slate-300">15s</span>. Market data scraped via Yahoo &amp; Google Finance APIs.
            </span>
          </div>
          <div>
            Case Study: Octa Byte AI Pvt Ltd &bull; Full-stack Next.js, React, Tailwind &amp; TypeScript
          </div>
        </footer>
      </main>
    </div>
  );
}
