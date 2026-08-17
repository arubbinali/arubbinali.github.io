import { bignumber } from "mathjs";

const ABBREVIATIONS = [
  { threshold: "1e18", divisor: "1e18", suffix: "qn" },
  { threshold: "1e15", divisor: "1e15", suffix: "qd" },
  { threshold: "1e12", divisor: "1e12", suffix: "t" },
  { threshold: "1e9", divisor: "1e9", suffix: "b" },
  { threshold: "1e6", divisor: "1e6", suffix: "m" },
  { threshold: "1e3", divisor: "1e3", suffix: "k" },
];

function asBigNumber(value) {
  return value?.isBigNumber ? value : bignumber(value);
}

function normalizeZero(value) {
  return /^-0(?:\.0+)?$/.test(value) ? value.slice(1) : value;
}

function trimFraction(value) {
  return normalizeZero(value).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

export function addThousandsSeparators(value) {
  const normalized = normalizeZero(String(value));
  const [integer, decimal] = normalized.split(".");
  const sign = integer.startsWith("-") ? "-" : "";
  const digits = sign ? integer.slice(1) : integer;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}${grouped}${decimal ? `.${decimal}` : ""}`;
}

export function formatNumber(value, { decimalPlaces = 3 } = {}) {
  const numeric = asBigNumber(value);
  const precise = normalizeZero(numeric.toFixed());
  const rounded = trimFraction(numeric.toDecimalPlaces(decimalPlaces).toFixed());
  const full = addThousandsSeparators(rounded);
  const absolute = numeric.abs();
  const abbreviation = ABBREVIATIONS.find(({ threshold }) => absolute.gte(threshold));

  if (!abbreviation) {
    return { compact: full, display: full, precise, full };
  }

  const scaled = numeric.div(abbreviation.divisor);
  const compactNumber = trimFraction(scaled.toDecimalPlaces(decimalPlaces).toFixed());
  const compact = `${compactNumber}${abbreviation.suffix}`;

  return {
    compact,
    display: `${compact} (${full})`,
    precise,
    full,
  };
}

export function formatExpressionForDisplay(expression) {
  return expression
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/\s+/g, " ")
    .trim();
}
