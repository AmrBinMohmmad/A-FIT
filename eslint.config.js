// flat ESLint config (kit v4.3.0 template), adapted to this app's
// `src/` root. FORCED: RN Text/TextInput → R-primitives, parent-relative imports → `@/`,
// no-console → logger. GUARDED: credential-shaped setItem → secure-store, `*_ar` reads.
const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  ...expoConfig,
  prettierConfig,
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "ios/**",
      "android/**",
      ".expo/**",
      ".impeccable/**",
      "expo-env.d.ts",
      "babel.config.js",
      "metro.config.js",
      "scripts/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-native",
              importNames: ["Text"],
              message: 'Import RText from "@/components/RText" instead of react-native Text.',
            },
            {
              name: "react-native",
              importNames: ["TextInput"],
              message: 'Import RTextInput from "@/components/RTextInput" instead of react-native TextInput.',
            },
          ],
          patterns: [
            { regex: "^\\.\\./", message: "Use the @/ alias instead of parent-relative (../) imports." },
          ],
        },
      ],
      "no-console": "error",
      "import/no-named-as-default-member": "off",
      "no-restricted-syntax": [
        "error",
        {
          selector:
            'CallExpression[callee.property.name="setItem"][arguments.0.value=/token|secret|password|credential|jwt/i]',
          message:
            "Credential-shaped value in AsyncStorage — the auth token lives ONLY in expo-secure-store (@/utils/secureStore).",
        },
        {
          selector: "MemberExpression[property.name=/_ar$/]",
          message:
            "Direct *_ar field read — resolve bilingual content through a localizedField helper (D3.2).",
        },
      ],
    },
  },
  {
    // OtpInput owns a hidden transport TextInput (not a styled field) — the third sanctioned importer.
    files: ["src/components/RText.tsx", "src/components/RTextInput.tsx", "src/components/auth/OtpInput.tsx"],
    rules: { "no-restricted-imports": "off" },
  },
  {
    files: ["src/utils/logger.ts"],
    rules: { "no-console": "off" },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/__tests__/**", "jest.setup.ts"],
    rules: { "no-console": "off", "@typescript-eslint/no-require-imports": "off" },
  },
];
