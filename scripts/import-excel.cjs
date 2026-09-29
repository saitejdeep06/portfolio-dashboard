/* eslint @typescript-eslint/no-require-imports: "off" */
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const input = path.resolve("portfolio.xlsx");
const output = path.resolve("src/data/portfolio.json");

if (!fs.existsSync(input)) {
  console.error("Excel file not found:", input);
  process.exit(1);
}

const workbook = XLSX.readFile(input);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const rows = XLSX.utils.sheet_to_json(sheet, {
  header: 1,
  defval: null,
  raw: true
});

const headerIndex = rows.findIndex(row =>
  String(row[0] ?? "").trim().toLowerCase() === "no" &&
  String(row[1] ?? "").trim().toLowerCase() === "particulars"
);

if (headerIndex === -1) {
  console.error("Could not find No / Particulars header.");
  process.exit(1);
}

// Actual columns from your Excel workbook.
const COL = {
  no: 0,
  name: 1,
  purchasePrice: 2,
  quantity: 3,
  investment: 4,
  portfolioPercent: 5,
  exchange: 6,
  cmp: 7,
  presentValue: 8,
  gainLoss: 9,
  gainLossPercent: 10,
  marketCap: 11,
  peRatio: 12,
  earnings: 13
};

function numberOrNull(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();

    if (!cleaned || cleaned === "#N/A" || cleaned === "NA") {
      return null;
    }

    const result = Number(cleaned);
    return Number.isFinite(result) ? result : null;
  }

  return null;
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function makeSymbol(exchangeValue) {
  const exchange = cleanText(exchangeValue);

  if (!exchange || exchange === "#N/A") {
    return "";
  }

  // Text ticker in the NSE/BSE column.
  if (/^[A-Za-z][A-Za-z0-9&-]*$/.test(exchange)) {
    return exchange.toUpperCase() + ".NS";
  }

  // Numeric BSE security code.
  if (/^\d+$/.test(exchange)) {
    return exchange + ".BO";
  }

  return "";
}

const holdings = [];
let currentSector = "Other";

for (let i = headerIndex + 1; i < rows.length; i++) {
  const row = rows[i];

  const serial = numberOrNull(row[COL.no]);
  const name = cleanText(row[COL.name]);
  const purchasePrice = numberOrNull(row[COL.purchasePrice]);
  const quantity = numberOrNull(row[COL.quantity]);

  const investment = numberOrNull(row[COL.investment]);

  // Sector heading rows have a sector name but no serial,
  // purchase price, or quantity.
  if (
    serial === null &&
    name &&
    purchasePrice === null &&
    quantity === null &&
    investment !== null
  ) {
    currentSector = name.replace(/\s+sector\s*$/i, "").trim();
    continue;
  }

  // Skip blank rows, totals, and non-holding rows.
  if (
    serial === null ||
    !name ||
    purchasePrice === null ||
    quantity === null ||
    purchasePrice <= 0 ||
    quantity <= 0
  ) {
    continue;
  }

  const cmp = numberOrNull(row[COL.cmp]);
  const peRatio = numberOrNull(row[COL.peRatio]);
  const earnings = numberOrNull(row[COL.earnings]);

  const exchangeValue = row[COL.exchange];
  const exchangeText = cleanText(exchangeValue);

  const exchange = /^\d+$/.test(exchangeText)
    ? "BSE"
    : "NSE";

  holdings.push({
    id: holdings.length + 1,
    name,
    sector: currentSector,
    symbol: makeSymbol(exchangeValue),
    exchange,
    purchasePrice,
    quantity,
    cmp: cmp ?? purchasePrice,
    peRatio,
    latestEarnings: earnings === null
      ? "N/A"
      : String(earnings)
  });
}

if (holdings.length === 0) {
  console.error("No holdings found. Portfolio JSON not changed.");
  process.exit(1);
}

fs.writeFileSync(
  output,
  JSON.stringify(holdings, null, 2),
  "utf8"
);

console.log("\nExcel import successful!");
console.log("Worksheet:", sheetName);
console.log("Total holdings:", holdings.length);
console.log("Sectors:");

[...new Set(holdings.map(stock => stock.sector))]
  .forEach(sector => console.log(" -", sector));

console.log("\nHoldings without ticker symbols:");

const missing = holdings.filter(stock => !stock.symbol);

if (missing.length === 0) {
  console.log("None");
} else {
  missing.forEach(stock => console.log(" -", stock.name));
}

console.log("\nSaved to:", output);

