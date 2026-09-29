"use client";

import React from "react";
import { RefreshCw, Play, Pause, Activity } from "lucide-react";
import { formatTime } from "@/lib/utils/format";

interface HeaderProps {
  lastUpdated?: string | null;
  isLoading: boolean;
  onRefresh: () => void;
  autoRefreshEnabled: boolean;
  onToggleAutoRefresh: () => void;
  secondsUntilRefresh: number;
  totalIntervalSeconds: number;
}

export function Header({
  lastUpdated,
  isLoading,
  onRefresh,
  autoRefreshEnabled,
  onToggleAutoRefresh,
  secondsUntilRefresh,
  totalIntervalSeconds
}: HeaderProps) {
  const progressPercentage =
    totalIntervalSeconds > 0
      ? Math.max(0, Math.min(100, ((totalIntervalSeconds - secondsUntilRefresh) / totalIntervalSeconds) * 100))
      : 0;

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        {/* Brand & Market Status */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                OctaPortfolio
              </h1>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Yahoo Finance CMP &bull; Google Finance P/E &amp; Earnings
            </p>
          </div>
        </div>

        {/* Controls & Sync Status */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Refresh Timer Widget */}
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-xs text-slate-400">
              {autoRefreshEnabled ? (
                <>Next refresh in <span className="font-mono font-semibold text-blue-400">{secondsUntilRefresh}s</span></>
              ) : (
                <span className="text-amber-400 font-medium">Auto-refresh paused</span>
              )}
            </span>
            <div className="w-28 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  autoRefreshEnabled ? "bg-blue-500" : "bg-slate-600"
                }`}
                style={{ width: autoRefreshEnabled ? `${progressPercentage}%` : "0%" }}
              />
            </div>
          </div>

          {/* Toggle Auto Refresh Button */}
          <button
            onClick={onToggleAutoRefresh}
            title={autoRefreshEnabled ? "Pause automatic updates" : "Resume automatic updates"}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              autoRefreshEnabled
                ? "border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                : "border-amber-600/40 bg-amber-950/30 text-amber-300 hover:bg-amber-900/40"
            }`}
          >
            {autoRefreshEnabled ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden md:inline">Resume</span>
              </>
            )}
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Fetching..." : "Refresh Now"}</span>
          </button>

          {/* Timestamp Badge */}
          <div className="hidden lg:block border-l border-slate-800 pl-3 text-xs text-slate-400">
            <div>Last Updated:</div>
            <div className="font-mono text-slate-300">{formatTime(lastUpdated)}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
