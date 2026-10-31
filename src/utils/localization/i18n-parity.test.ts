/**
 * Locale key-parity gate (Rakaya D3.7): en and ar expose the identical set of key paths.
 * Key-set only — translation completeness is review's job.
 */
import { describe, expect, it } from "@jest/globals";

import ar from "@/utils/localization/locales/ar.json";
import en from "@/utils/localization/locales/en.json";

function keyPaths(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === "object" ? keyPaths(value as Record<string, unknown>, path) : [path];
  });
}

describe("i18n locale parity", () => {
  it("en and ar expose the identical set of keys", () => {
    expect(keyPaths(ar as Record<string, unknown>).sort()).toEqual(
      keyPaths(en as Record<string, unknown>).sort(),
    );
  });

  it("no value is empty in either locale", () => {
    const empties = (obj: Record<string, unknown>, prefix = ""): string[] =>
      Object.entries(obj).flatMap(([k, v]) =>
        v && typeof v === "object"
          ? empties(v as Record<string, unknown>, `${prefix}${k}.`)
          : typeof v === "string" && v.trim() === ""
            ? [`${prefix}${k}`]
            : [],
      );
    expect(empties(en as Record<string, unknown>)).toEqual([]);
    expect(empties(ar as Record<string, unknown>)).toEqual([]);
  });
});
