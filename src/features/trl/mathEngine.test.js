import { calculate } from "./mathEngine";

test.each([
  ["5000 * 79", "395000"],
  ["(5000 * 79) + 20000", "415000"],
  ["2^10", "1024"],
  ["sqrt(144)", "12"],
  ["15% of 2500", "375"],
  ["2500 * 0.15", "375"],
  ["5 hours 36 minutes 54 seconds * 5000", "101070000"],
  ["243*2m", "486000000"],
  ["243 times 2 million", "486000000"],
  ["2.5k + 4 million", "4002500"],
  ["3b / 2", "1500000000"],
  ["2 hours 5 min * 3", "22500"],
  ["3245.34*(4.00)", "12981.36"],
])("calculates %s safely", (expression, expected) => {
  expect(calculate(expression).precise).toBe(expected);
});

test("retains repeating decimal precision", () => {
  expect(calculate("1234567 / 13").precise).toMatch(/^94966\.692307692307/);
});

test.each(["5 /** 2", "1 / 0", "import('x')", "a = 3"])("rejects %s", (expression) => {
  expect(() => calculate(expression)).toThrow();
});
