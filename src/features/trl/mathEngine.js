import { all, create } from "mathjs";
import { formatNumber } from "./numberFormatter";

const math = create(all, {
  number: "BigNumber",
  precision: 64,
  predictable: true,
});

const ALLOWED_FUNCTIONS = new Set([
  "sqrt", "abs", "ceil", "floor", "round", "min", "max", "pow",
  "log", "log10", "exp", "sin", "cos", "tan", "asin", "acos",
  "atan", "factorial",
]);

const ALLOWED_SYMBOLS = new Set(["pi", "e", "tau", "phi", ...ALLOWED_FUNCTIONS]);
const ALLOWED_OPERATORS = new Set(["+", "-", "*", "/", "^", "!"]);
const DURATION_UNITS = {
  h: 3600, hr: 3600, hrs: 3600, hour: 3600, hours: 3600,
  min: 60, mins: 60, minute: 60, minutes: 60,
  s: 1, sec: 1, secs: 1, second: 1, seconds: 1,
};

const MAGNITUDE_WORDS = {
  thousand: "1e3",
  million: "1e6",
  billion: "1e9",
  trillion: "1e12",
  quadrillion: "1e15",
  quintillion: "1e18",
};

const MAGNITUDE_SUFFIXES = {
  k: "1e3",
  m: "1e6",
  b: "1e9",
  bn: "1e9",
  t: "1e12",
  qd: "1e15",
  qn: "1e18",
};

function replaceDurations(expression) {
  const chainPattern = /((?:\d+(?:\.\d+)?\s*(?:hours?|hrs?|hr|h|minutes?|mins?|min|seconds?|secs?|sec|s)\s*)+)/gi;
  return expression.replace(chainPattern, (chain) => {
    let seconds = math.bignumber(0);
    const partPattern = /(\d+(?:\.\d+)?)\s*(hours?|hrs?|hr|h|minutes?|mins?|min|seconds?|secs?|sec|s)/gi;
    let part;
    while ((part = partPattern.exec(chain)) !== null) {
      seconds = seconds.plus(math.bignumber(part[1]).times(DURATION_UNITS[part[2].toLowerCase()]));
    }
    return `(${seconds.toFixed()})`;
  });
}

function replaceMagnitudes(expression) {
  let normalized = expression.replace(
    /\b(\d+(?:\.\d+)?)\s*(thousand|million|billion|trillion|quadrillion|quintillion)\b/gi,
    (_, amount, unit) => `((${amount}) * ${MAGNITUDE_WORDS[unit.toLowerCase()]})`
  );

  normalized = normalized.replace(
    /\b(\d+(?:\.\d+)?)\s*(qd|qn|bn|k|m|b|t)\b/gi,
    (_, amount, suffix) => `((${amount}) * ${MAGNITUDE_SUFFIXES[suffix.toLowerCase()]})`
  );
  return normalized;
}

export function normalizeExpression(input) {
  let expression = String(input || "").trim();
  if (!expression) throw new Error("Enter an expression");
  if (expression.length > 240) throw new Error("Expression is too long");

  expression = expression
    .replace(/[×·]/g, "*")
    .replace(/÷/g, "/")
    .replace(/[−–—]/g, "-")
    .replace(/\bmultiplied\s+by\b/gi, "*")
    .replace(/\bdivided\s+by\b/gi, "/")
    .replace(/\btimes\b/gi, "*")
    .replace(/\bplus\b/gi, "+")
    .replace(/\bminus\b/gi, "-")
    .replace(/(\d),(?=\d{3}\b)/g, "$1");

  expression = replaceMagnitudes(expression);
  expression = replaceDurations(expression);
  expression = expression.replace(/(\d+(?:\.\d+)?)\s*%\s*of\s*/gi, "(($1) / 100) * ");
  expression = expression.replace(/(\d+(?:\.\d+)?|\([^()]+\))\s*%/g, "(($1) / 100)");
  return expression;
}

function validateNode(node) {
  node.traverse((child) => {
    if (child.isConstantNode || child.isParenthesisNode) return;
    if (child.isOperatorNode) {
      if (!ALLOWED_OPERATORS.has(child.op)) throw new Error(`Operator ${child.op} is not supported`);
      return;
    }
    if (child.isSymbolNode) {
      if (!ALLOWED_SYMBOLS.has(child.name)) throw new Error(`Unknown value: ${child.name}`);
      return;
    }
    if (child.isFunctionNode) {
      const name = child.fn?.name;
      if (!name || !ALLOWED_FUNCTIONS.has(name)) throw new Error(`Function ${name || ""} is not supported`.trim());
      return;
    }
    throw new Error("This expression type is not supported");
  });
}

export function calculate(input) {
  try {
    const normalized = normalizeExpression(input);
    const node = math.parse(normalized);
    validateNode(node);
    const value = node.compile().evaluate({
      pi: math.bignumber(math.pi.toString()),
      e: math.bignumber(math.e.toString()),
      tau: math.bignumber(math.pi.toString()).times(2),
      phi: math.bignumber("1.6180339887498948482045868343656381177203091798057628621354486227"),
    });

    if (!value?.isBigNumber) throw new Error("Result must be a real number");
    if (!value.isFinite()) throw new Error("Result is not finite");
    if (Math.abs(value.e || 0) > 308) throw new Error("Result is too large to display safely");

    return {
      expression: String(input).trim(),
      normalized,
      value,
      ...formatNumber(value),
    };
  } catch (error) {
    const message = error?.message || "Invalid expression";
    if (/Undefined symbol|Unexpected|Value expected|Parenthesis|SyntaxError/i.test(message)) {
      throw new Error("Invalid expression");
    }
    throw new Error(message);
  }
}
