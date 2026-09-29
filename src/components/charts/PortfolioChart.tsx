"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import type { SectorSummary } from "@/types/portfolio";
import { formatCurrency, formatPercentage } from "@/lib/utils/format";
import { PieChart as PieIcon, BarChart3 } from "lucide-react";

interface PortfolioChartProps {
  sectors: SectorSummary[];
}

const COLORS = [
  "#3B82F6", // blue-500
  "#10B981", // emerald-500
  "#8B5CF6", // purple-500
  "#F59E0B", // amber-500
  "#EC4899", // pink-500
  "#06B6D4", // cyan-500
  "#6366F1", // indigo-500
  "#14B8A6", // teal-500
  "#F97316"  // orange-500
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: SectorSummary & { fill?: string };
  }>;
}

const CustomPieTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-sm">
        <p className="font-semibold text-white">{data.sector}</p>
        <p className="mt-1 text-xs text-slate-300">
          Investment: <span className="font-medium text-white">{formatCurrency(data.investment)}</span>
        </p>
        <p className="text-xs text-slate-300">
          Present Value: <span className="font-medium text-white">{formatCurrency(data.presentValue)}</span>
        </p>
        <p className="text-xs text-slate-300">
          Weight: <span className="font-medium text-blue-400">{formatPercentage(data.portfolioPercentage)}</span>
        </p>
        <p className="text-xs text-slate-300">
          Gain/Loss:{" "}
          <span className={`font-semibold ${data.gainLoss >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {formatCurrency(data.gainLoss)} ({formatPercentage(data.gainLossPercentage, true)})
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export function PortfolioChart({ sectors }: PortfolioChartProps) {
  const [activeTab, setActiveTab] = useState<"allocation" | "performance">("allocation");

  if (!sectors || sectors.length === 0) {
    return null;
  }

  const pieData = sectors.map((s, index) => ({
    ...s,
    name: s.sector,
    value: s.investment,
    fill: COLORS[index % COLORS.length]
  }));

  const barData = sectors.map((s) => ({
    name: s.sector,
    Investment: s.investment,
    "Present Value": s.presentValue,
    gainLoss: s.gainLoss
  }));

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
      {/* Header & View Switcher */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">
            Portfolio Visualizations
          </h3>
          <p className="text-xs text-slate-400">
            Interactive breakdown of capital allocation &amp; sector performance
          </p>
        </div>

        <div className="flex rounded-lg bg-slate-800/80 p-1">
          <button
            onClick={() => setActiveTab("allocation")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "allocation"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <PieIcon className="h-3.5 w-3.5" />
            <span>Sector Weight</span>
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "performance"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Performance</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        {activeTab === "allocation" ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(val) => <span className="text-xs text-slate-300">{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#fff"
                }}
                formatter={(val) => {
                  const num = typeof val === "number" ? val : parseFloat(String(val ?? 0));
                  return formatCurrency(num);
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(val) => <span className="text-xs text-slate-300">{val}</span>}
              />
              <Bar dataKey="Investment" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Present Value" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
