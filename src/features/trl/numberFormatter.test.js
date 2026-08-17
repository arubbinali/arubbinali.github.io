import { bignumber } from "mathjs";
import { addThousandsSeparators, formatNumber } from "./numberFormatter";

test.each([
  ["345", "345"],
  ["3456", "3.456k (3,456)"],
  ["1284957", "1.285m (1,284,957)"],
  ["1250000000", "1.25b (1,250,000,000)"],
  ["1500000", "1.5m (1,500,000)"],
])("formats %s", (input, expected) => {
  expect(formatNumber(bignumber(input)).display).toBe(expected);
});

test("preserves precise decimals", () => {
  expect(addThousandsSeparators("94966.6923076923076923")).toBe("94,966.6923076923076923");
});

test("limits normal output to three decimal places and supports twelve", () => {
  const value = bignumber("145.066666666666666666");
  expect(formatNumber(value).full).toBe("145.067");
  expect(formatNumber(value, { decimalPlaces: 12 }).full).toBe("145.066666666667");
  expect(formatNumber(value).precise).toBe("145.066666666666666666");
});
