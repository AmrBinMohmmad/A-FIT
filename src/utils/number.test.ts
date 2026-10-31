import { describe, expect, it } from "@jest/globals";
import { formatCompact, parseFloatSafe, parseIntSafe, toWesternDigits } from "@/utils/number";

describe("number helpers", () => {
  it("normalises Arabic-Indic and Persian digits", () => {
    expect(toWesternDigits("٧٤٨٢")).toBe("7482");
    expect(toWesternDigits("۸۲٫۴")).toBe("82٫4");
  });
  it("parses safely", () => {
    expect(parseIntSafe("٧٬٤٨٢")).toBe(7482);
    expect(parseIntSafe("abc")).toBeNull();
    expect(parseFloatSafe("82,4")).toBe(82.4);
  });
  it("compacts station labels", () => {
    expect(formatCompact(0)).toBe("0");
    expect(formatCompact(2000)).toBe("2k");
    expect(formatCompact(7500)).toBe("7.5k");
  });
});
