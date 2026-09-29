/**
 * Formats a number as Indian Rupee (INR) currency.
 * Example: 124500.5 -> ₹1,24,500.50
 */
export function formatCurrency(
  value: number | null | undefined,
  decimals = 2
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "₹0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Formats a number as a percentage string.
 * Example: 12.3456 -> +12.35% or -5.12%
 */
export function formatPercentage(
  value: number | null | undefined,
  includeSign = false,
  decimals = 2
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "0.00%";
  }

  const prefix = includeSign && value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(decimals)}%`;
}

/**
 * Formats a number with Indian thousand separators.
 */
export function formatNumber(
  value: number | null | undefined,
  decimals = 0
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Formats large Indian numbers in Lakhs (L) and Crores (Cr).
 * Example: 15000000 -> ₹1.50 Cr
 */
export function formatCompactINR(value: number): string {
  if (!Number.isFinite(value)) return "₹0";

  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  }
  return formatCurrency(value);
}

/**
 * Formats an ISO date/time string to localized Indian time.
 */
export function formatTime(isoString?: string | null): string {
  if (!isoString) return "N/A";
  try {
    return new Date(isoString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  } catch {
    return "N/A";
  }
}
