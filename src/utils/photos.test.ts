import { describe, expect, it, jest } from "@jest/globals";

import { initials } from "@/utils/photos";

jest.mock("expo-image-picker", () => ({}));
jest.mock("expo-image-manipulator", () => ({}));

describe("initials", () => {
  it("takes the first letter of the first and last word", () => {
    expect(initials("Faisal Al-Amri")).toBe("FA");
    expect(initials("faisal")).toBe("F");
    expect(initials("  فيصل  العمري ")).toBe("فا");
  });

  it("never returns an empty string", () => {
    expect(initials("")).toBe("•");
    expect(initials("   ")).toBe("•");
  });
});
