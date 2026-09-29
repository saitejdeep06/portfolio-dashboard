"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState
} from "@tanstack/react-table";
import type { PortfolioStock, SectorSummary } from "@/types/portfolio";
import { formatCurrency, formatPercentage, formatNumber } from "@/lib/utils/format";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Layers,
  List,
  Download,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface PortfolioTableProps {
  stocks: PortfolioStock[];
  sectors: SectorSummary[];
}

export function PortfolioTable({ stocks, sectors }: PortfolioTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"flat" | "grouped">("flat");

  // Filter stocks by selected sector if filtered
  const filteredStocks = useMemo(() => {
    if (selectedSector === "ALL") {
      return stocks;
    }
    return stocks.filter((stock) => stock.sector === selectedSector);
  }, [stocks, selectedSector]);

  // Unique sector names for filter dropdown
  const sectorOptions = useMemo(() => {
    const list = Array.from(new Set(stocks.map((s) => s.sector))).filter(Boolean);
    return ["ALL", ...list.sort()];
  }, [stocks]);

  // Define columns per assignment specifications
  const columns = useMemo<ColumnDef<PortfolioStock>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 font-semibold text-slate-300 hover:text-white"
          >
            <span>Particulars</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3 text-blue-400" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3 text-blue-400" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const stock = row.original;
          return (
            <div>
              <div className="font-semibold text-white">{stock.name}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="font-mono">{stock.symbol || "N/A"}</span>
                <span>&bull;</span>
                <span className="text-slate-500">{stock.sector}</span>
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: "purchasePrice",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 text-right w-full justify-end font-semibold text-slate-300 hover:text-white"
          >
            <span>Purchase Price</span>
            <ArrowUpDown className="h-3 w-3 opacity-40" />
          </button>
        ),
        cell: ({ getValue }) => (
          <div className="text-right font-medium text-slate-200">
            {formatCurrency(getValue<number>())}
          </div>
        )
      },
      {
        accessorKey: "quantity",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 text-right w-full justify-end font-semibold text-slate-300 hover:text-white"
          >
            <span>Qty</span>
            <ArrowUpDown className="h-3 w-3 opacity-40" />
          </button>
        ),
        cell: ({ getValue }) => (
          <div className="text-right text-slate-300 font-mono">
            {formatNumber(getValue<number>())}
          </div>
        )
      },
      {
        accessorKey: "investment",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 text-right w-full justify-end font-semibold text-slate-300 hover:text-white"
          >
            <span>Investment</span>
            <ArrowUpDown className="h-3 w-3 opacity-40" />
          </button>
        ),
        cell: ({ getValue }) => (
          <div className="text-right font-semibold text-slate-100">
            {formatCurrency(getValue<number>())}
          </div>
        )
      },
      {
        accessorKey: "portfolioPercentage",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 text-right w-full justify-end font-semibold text-slate-300 hover:text-white"
          >
            <span>Portfolio (%)</span>
            <ArrowUpDown className="h-3 w-3 opacity-40" />
          </button>
        ),
        cell: ({ getValue }) => (
          <div className="text-right font-mono text-xs text-blue-400 font-medium">
            {formatPercentage(getValue<number>())}
          </div>
        )
      },
      {
        accessorKey: "exchange",
        header: () => <div className="text-center font-semibold text-slate-300">NSE / BSE</div>,
        cell: ({ getValue }) => {
          const ex = getValue<string>();
          return (
            <div className="text-center">
              <span
                className={`inline-flex rounded px-1.5 py-0.5 text-xs font-semibold uppercase ${
                  ex === "NSE"
                    ? "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20"
                    : "bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20"
                }`}
              >
                {ex}
              </span>
            </div>
          );
        }
      },
      {
        accessorKey: "cmp",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 text-right w-full justify-end font-semibold text-slate-300 hover:text-white"
          >
            <span>CMP (Yahoo)</span>
            <ArrowUpDown className="h-3 w-3 opacity-40" />
          </button>
        ),
        cell: ({ row }) => {
          const stock = row.original;
          const isLive = stock.cmpStatus === "success";
          return (
            <div className="text-right">
              <div className="font-semibold text-white">
                {formatCurrency(stock.cmp)}
              </div>
              <div className="inline-flex items-center gap-1 text-[10px]">
                {isLive ? (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="h-2.5 w-2.5" /> Yahoo Live
                  </span>
                ) : (
                  <span className="text-amber-400/80 flex items-center gap-0.5">
                    <AlertCircle className="h-2.5 w-2.5" /> Excel
                  </span>
                )}
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: "presentValue",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 text-right w-full justify-end font-semibold text-slate-300 hover:text-white"
          >
            <span>Present Value</span>
            <ArrowUpDown className="h-3 w-3 opacity-40" />
          </button>
        ),
        cell: ({ getValue }) => (
          <div className="text-right font-semibold text-slate-100">
            {formatCurrency(getValue<number>())}
          </div>
        )
      },
      {
        accessorKey: "gainLoss",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 text-right w-full justify-end font-semibold text-slate-300 hover:text-white"
          >
            <span>Gain / Loss</span>
            <ArrowUpDown className="h-3 w-3 opacity-40" />
          </button>
        ),
        cell: ({ row }) => {
          const stock = row.original;
          const isGain = stock.gainLoss >= 0;
          return (
            <div className="text-right">
              <div
                className={`font-bold ${
                  isGain ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {formatCurrency(stock.gainLoss)}
              </div>
              <div
                className={`text-xs font-medium ${
                  isGain ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {formatPercentage(stock.gainLossPercentage, true)}
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: "peRatio",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 text-right w-full justify-end font-semibold text-slate-300 hover:text-white"
          >
            <span>P/E Ratio</span>
            <ArrowUpDown className="h-3 w-3 opacity-40" />
          </button>
        ),
        cell: ({ row }) => {
          const stock = row.original;
          const pe = stock.peRatio;
          const isLive = stock.peStatus === "success";
          return (
            <div className="text-right">
              <span className="font-mono text-slate-200">
                {pe !== null ? pe.toFixed(2) : "N/A"}
              </span>
              <div className="text-[10px] text-slate-500">
                {isLive ? "Google Fin" : "Excel"}
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: "latestEarnings",
        header: () => (
          <div className="text-right font-semibold text-slate-300">
            Latest Earnings
          </div>
        ),
        cell: ({ getValue }) => {
          const val = getValue<string>();
          return (
            <div className="text-right text-xs font-mono text-slate-300">
              {val || "N/A"}
            </div>
          );
        }
      }
    ],
    []
  );

  const table = useReactTable({
    data: filteredStocks,
    columns,
    state: {
      sorting,
      globalFilter
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  // Export to CSV helper
  const handleExportCSV = () => {
    const headers = [
      "Particulars",
      "Symbol",
      "Sector",
      "Exchange",
      "Purchase Price",
      "Quantity",
      "Investment",
      "Portfolio (%)",
      "CMP",
      "Present Value",
      "Gain/Loss",
      "Gain/Loss (%)",
      "P/E Ratio",
      "Latest Earnings"
    ];

    const rows = filteredStocks.map((s) => [
      `"${s.name}"`,
      `"${s.symbol}"`,
      `"${s.sector}"`,
      `"${s.exchange}"`,
      s.purchasePrice,
      s.quantity,
      s.investment,
      s.portfolioPercentage,
      s.cmp,
      s.presentValue,
      s.gainLoss,
      s.gainLossPercentage,
      s.peRatio ?? "N/A",
      `"${s.latestEarnings}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `portfolio_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Grouped stocks by sector for "Group by Sector" view
  const groupedBySector = useMemo(() => {
    const map = new Map<string, PortfolioStock[]>();
    for (const stock of filteredStocks) {
      const arr = map.get(stock.sector) ?? [];
      arr.push(stock);
      map.set(stock.sector, arr);
    }
    return map;
  }, [filteredStocks]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
      {/* Table Toolbar */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search & Sector Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search holding or symbol..."
              className="w-56 rounded-lg border border-slate-700 bg-slate-950 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none sm:w-64"
            />
          </div>

          {/* Sector Selector */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:border-blue-500 focus:outline-none"
          >
            {sectorOptions.map((sector) => (
              <option key={sector} value={sector}>
                {sector === "ALL" ? "All Sectors" : sector}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode & Export Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg bg-slate-800/80 p-0.5">
            <button
              onClick={() => setViewMode("flat")}
              title="Flat Table View"
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                viewMode === "flat"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode("grouped")}
              title="Sector Grouping View"
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                viewMode === "grouped"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>By Sector</span>
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            title="Export to CSV"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        {viewMode === "flat" ? (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 uppercase tracking-wider text-slate-400">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 text-xs font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center text-slate-500">
                    No holdings match your search criteria.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition hover:bg-slate-800/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="whitespace-nowrap p-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          /* Sector Grouping View */
          <div className="space-y-6 p-4">
            {Array.from(groupedBySector.entries()).map(([sectorName, items]) => {
              const sectorSummary = sectors.find((s) => s.sector === sectorName);
              const secInvestment = items.reduce((sum, i) => sum + i.investment, 0);
              const secValue = items.reduce((sum, i) => sum + i.presentValue, 0);
              const secGainLoss = secValue - secInvestment;
              const secGainLossPct = secInvestment > 0 ? (secGainLoss / secInvestment) * 100 : 0;
              const isGain = secGainLoss >= 0;

              return (
                <div
                  key={sectorName}
                  className="rounded-lg border border-slate-800 bg-slate-950/40 overflow-hidden"
                >
                  {/* Sector Header with Summary */}
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-800/50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                      <h4 className="text-sm font-bold text-white">{sectorName}</h4>
                      <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                        {items.length} stocks
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-slate-400">Invested: </span>
                        <span className="font-semibold text-white">
                          {formatCurrency(secInvestment)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Value: </span>
                        <span className="font-semibold text-white">
                          {formatCurrency(secValue)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Gain/Loss: </span>
                        <span
                          className={`font-bold ${
                            isGain ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {formatCurrency(secGainLoss)} ({formatPercentage(secGainLossPct, true)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Table for Sector */}
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-800 bg-slate-950/30 text-[11px] uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="p-2.5">Stock</th>
                        <th className="p-2.5 text-right">Price</th>
                        <th className="p-2.5 text-right">Qty</th>
                        <th className="p-2.5 text-right">Invested</th>
                        <th className="p-2.5 text-center">Exch</th>
                        <th className="p-2.5 text-right">CMP</th>
                        <th className="p-2.5 text-right">Present Val</th>
                        <th className="p-2.5 text-right">Gain / Loss</th>
                        <th className="p-2.5 text-right">P/E</th>
                        <th className="p-2.5 text-right">Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {items.map((stock) => {
                        const stockGain = stock.gainLoss >= 0;
                        return (
                          <tr key={stock.id} className="hover:bg-slate-800/30">
                            <td className="p-2.5 font-medium text-white">
                              {stock.name}
                              <span className="block text-[10px] font-mono text-slate-500">
                                {stock.symbol}
                              </span>
                            </td>
                            <td className="p-2.5 text-right text-slate-300">
                              {formatCurrency(stock.purchasePrice)}
                            </td>
                            <td className="p-2.5 text-right font-mono text-slate-300">
                              {stock.quantity}
                            </td>
                            <td className="p-2.5 text-right font-semibold text-slate-200">
                              {formatCurrency(stock.investment)}
                            </td>
                            <td className="p-2.5 text-center">
                              <span className="rounded bg-slate-800 px-1 py-0.5 text-[10px] text-slate-300">
                                {stock.exchange}
                              </span>
                            </td>
                            <td className="p-2.5 text-right font-semibold text-white">
                              {formatCurrency(stock.cmp)}
                            </td>
                            <td className="p-2.5 text-right font-semibold text-slate-200">
                              {formatCurrency(stock.presentValue)}
                            </td>
                            <td className="p-2.5 text-right">
                              <span
                                className={`font-bold ${
                                  stockGain ? "text-emerald-400" : "text-rose-400"
                                }`}
                              >
                                {formatCurrency(stock.gainLoss)}
                              </span>
                              <div
                                className={`text-[10px] ${
                                  stockGain ? "text-emerald-500" : "text-rose-500"
                                }`}
                              >
                                {formatPercentage(stock.gainLossPercentage, true)}
                              </div>
                            </td>
                            <td className="p-2.5 text-right font-mono text-slate-300">
                              {stock.peRatio !== null ? stock.peRatio.toFixed(2) : "N/A"}
                            </td>
                            <td className="p-2.5 text-right font-mono text-slate-400 text-[11px]">
                              {stock.latestEarnings}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Table Footer Count */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>
          Showing <span className="font-semibold text-white">{filteredStocks.length}</span> of{" "}
          <span className="font-semibold text-white">{stocks.length}</span> holdings
        </span>
        <span className="text-[11px] text-slate-500">
          Click column headers to sort &bull; Real-time calculations active
        </span>
      </div>
    </div>
  );
}
