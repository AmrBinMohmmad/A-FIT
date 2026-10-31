import { jest } from "@jest/globals";

// Minimal mocks so pure-logic tests run without native modules.
jest.mock("expo-localization", () => ({ getLocales: () => [{ languageCode: "ar" }] }));
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { slug: "a-fit", name: "A-FIT" } },
}));
