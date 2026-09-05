import { codeWindow } from "./VirtualCode";

test("only a small buffered window is highlighted for a long file", () => {
  const range = codeWindow(0, 600, 20, 6257);
  expect(range).toEqual({start:0,end:50});
});
test("scrolling through and to the bottom retains access to the full source", () => {
  expect(codeWindow(40000, 600, 20, 6257)).toEqual({start:1980,end:2050});
  expect(codeWindow(6257 * 20 - 600, 600, 20, 6257).end).toBe(6257);
});
