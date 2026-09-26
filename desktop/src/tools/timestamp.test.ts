import { describe, it, expect } from "vitest";
import { dateInput, parseTimestamp, timestampPreview, discordFormats } from "./timestamp";
describe("Discord timestamps", () => {
  it("parses UTC exactly", () => expect(parseTimestamp("2026-09-24T12:30:00", true)).toBe(Date.UTC(2026,8,24,12,30)/1000));
  it("round-trips local time", () => { const d = new Date(2026,8,24,12,30); expect(parseTimestamp(dateInput(d,false), false)).toBe(d.getTime()/1000); });
  it("rejects malformed and rolled dates", () => { for(const s of ["", "foo", "2026-02-30T12:00", "2026-09-24T25:00"]) expect(parseTimestamp(s,true)).toBeNull(); });
  it("previews all seven formats and relative time", () => { for(const [format] of discordFormats) expect(timestampPreview(1000000,format,true)).not.toContain("Invalid"); expect(timestampPreview(1000060,"R",true,1000000000)).toContain("minute"); });
});
