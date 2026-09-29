"use client";

import React from "react";
import { TrendingUp, TrendingDown, DollarSign, Wallet, PieChart, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils/format";

interface PortfolioSummaryProps {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  totalStocks: number;
  liveCmpCount: number;
  liveGoogleCount: number;
}

export function PortfolioSummary({
  totalInvestment,
  totalPresentValue,
  totalGainLoss,
  totalGainLossPercentage,
  totalStocks,
  liveCmpCount,
  liveGoogleCount
}: PortfolioSummaryProps) {
  const isPositive = totalGainLoss >= 0;

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Investment */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Total Investment
          </p>
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight text-white">
          {formatCurrency(totalInvestment)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Across {totalStocks} equity positions
        </p>
      </div>

      {/* 2. Current Portfolio Value */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Current Valuation
          </p>
          <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight text-white">
          {formatCurrency(totalPresentValue)}
        </p>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
          <span>Market value from live feeds</span>
        </div>
      </div>

      {/* 3. Total Gain / Loss */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Total Gain / Loss
          </p>
          <div
            className={`rounded-lg p-2 ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-rose-500/10 text-rose-400"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>
        </div>
        <p
          className={`mt-3 text-2xl font-bold tracking-tight ${
            isPositive ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {formatCurrency(totalGainLoss)}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold ${
              isPositive
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-rose-500/20 text-rose-400"
            }`}
          >
            {formatPercentage(totalGainLossPercentage, true)}
          </span>
          <span className="text-xs text-slate-400">Net Return</span>
        </div>
      </div>

      {/* 4. Live Data Feed Coverage */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Live Feed Status
          </p>
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold text-white">
              {liveCmpCount}
            </span>
            <span className="text-xs text-slate-400"> / {totalStocks} active</span>
          </div>
          <div className="text-right text-xs">
            <div className="text-emerald-400 font-medium">Yahoo: {liveCmpCount} live</div>
            <div className="text-blue-400 font-medium">Google: {liveGoogleCount} live</div>
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Auto-updates active every 15s
        </p>
      </div>
    </section>
  );
}
