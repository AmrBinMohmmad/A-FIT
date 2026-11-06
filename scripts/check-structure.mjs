#!/usr/bin/env node
/**
 * Executable folder contract — MOBILE track (Rakaya kit v4.3.0 template), adapted to this
 * app's `src/` root (Expo Router reads `src/app`). Twelve plain-regex rules (naive-GUARDED);
 * the prose lives in the skill's references/react-native.md and this script DECIDES.
 * Edit only the PROJECT CONFIG block.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  ".expo",
  "dist",
  "android",
  "ios",
  ".husky",
  ".github",
  ".vscode",
  "assets",
  "docs",
  "scripts",
  "targets",
  ".impeccable",
]);

const ALLOWED_TOP_LEVEL = new Set([
  "app",
  "components",
  "contexts",
  "hooks",
  "constants",
  "data",
  "types",
  "utils",
  "targets",
  "assets",
  "docs",
  "scripts",
]);

// ════════════════════════ PROJECT CONFIG — edit only this ════════════════════════
/** Folders outside the contract tolerated for a dated reason. Start EMPTY; add an entry only with a reason + date. */
const LEGACY_FOLDERS = new Map([
  // ["folder", "<reason> — <YYYY-MM-DD>"],
]);

const COLOR_LITERAL_EXEMPT = new Map([
  // ["app/+html.tsx", "<reason> — <YYYY-MM-DD>"],
]);

const SIZE_LIMIT = 250;
const SIZE_EXEMPT = new Map([
  ["types/api.ts", "one DTO per backend Resource; splitting hides the contract — 2026-10-30"],
]);

const CLIENT_PAGINATION_HELPERS = ["usePagination(", "paginate("];
const PAGINATION_JUSTIFICATION = "data provably complete";

const TOUCHABLES = /<(Pressable|TouchableOpacity|TouchableHighlight|TouchableWithoutFeedback)\b/;
// ══════════════════════════════════════════════════════════════════════════════════

const failures = [];
const fail = (rule, detail) => failures.push({ rule, detail });

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(full, out);
    } else if (/\.tsx?$/.test(entry.name)) {
      out.push(relative(SRC, full).replace(/\\/g, "/"));
    }
  }
  return out;
}

const isTest = (p) => p.includes("__tests__") || p.includes(".test.") || p.endsWith(".d.ts");
const read = (p) => readFileSync(join(SRC, p), "utf8");

// ── Rule 1: no unexpected top-level folders under src/ ───────────────────────
for (const entry of await readdir(SRC, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
  if (ALLOWED_TOP_LEVEL.has(entry.name) || LEGACY_FOLDERS.has(entry.name)) continue;
  fail("top-level folders", `"src/${entry.name}/" is not in the folder contract`);
}

const files = (await walk(SRC)).filter((p) => !isTest(p));

for (const path of files) {
  const src = read(path);
  const [area] = path.split("/");
  const legacyShim = LEGACY_FOLDERS.has(area) || /@deprecated Legacy module/.test(src);

  // ── Rule 2: app/ routes default-export ─────────────────────────────────────
  if (area === "app" && !/^export default/m.test(src))
    fail("app/ default exports", `${path} has no default export`);

  // ── Rule 3: named exports elsewhere ────────────────────────────────────────
  if (area !== "app" && /^export default/m.test(src) && path !== "utils/localization/i18n.ts")
    fail("named exports", `${path} default-exports; use a named export`);

  // ── Rule 4: placement ──────────────────────────────────────────────────────
  const rendersJsx = /return \(?\s*</.test(src) || /=> \(?\s*</.test(src);
  const definesContext = /createContext</.test(src);
  const isHookFile = /export function use[A-Z]/.test(src);
  if (definesContext && area !== "contexts")
    fail("placement", `${path} creates a context; that belongs in contexts/`);
  if (rendersJsx && (area === "utils" || area === "constants" || area === "types"))
    fail("placement", `${path} renders JSX; that belongs in components/`);
  if (isHookFile && (area === "utils" || area === "constants"))
    fail("placement", `${path} exports a hook; that belongs in hooks/`);
  if (area === "types" && /^(export )?(const|function|class|let|var) /m.test(src))
    fail("types/ is types only", `${path} contains runtime code`);

  // ── Rule 5: tokens only (hex) in app/ + components/ ────────────────────────
  if (!COLOR_LITERAL_EXEMPT.has(path) && (area === "app" || area === "components")) {
    const hex = src.match(/#[0-9a-fA-F]{3,8}\b/g);
    if (hex) fail("tokens only", `${path} hardcodes ${hex.join(", ")}; use theme.colors`);
  }

  // ── Rule 6: logical layout props ───────────────────────────────────────────
  const physical = src.match(/\b(marginLeft|marginRight|paddingLeft|paddingRight):/g);
  if (physical) fail("RTL", `${path} uses ${[...new Set(physical)].join(", ")}; use the Start/End variants`);

  // ── Rule 7: console only in the logger ─────────────────────────────────────
  if (/\bconsole\./.test(src) && path !== "utils/logger.ts")
    fail("logging", `${path} calls console directly; use @/utils/logger`);

  // ── Rule 8: file size ──────────────────────────────────────────────────────
  const lines = src.split("\n").length;
  if (lines > SIZE_LIMIT && !SIZE_EXEMPT.has(path) && !legacyShim)
    fail("file size", `${path} is ${lines} lines (limit ${SIZE_LIMIT}); split it or add a carve-out`);

  // ── Rule 11: a11y on touchables ────────────────────────────────────────────
  if ((area === "app" || area === "components") && TOUCHABLES.test(src) && !/accessibilityRole/.test(src))
    fail("a11y", `${path} renders a touchable but declares no accessibilityRole`);

  // ── Rule 12: server-driven lists ───────────────────────────────────────────
  if (area === "app" || area === "hooks" || area === "components") {
    for (const helper of CLIENT_PAGINATION_HELPERS) {
      if (src.includes(helper) && !src.includes(PAGINATION_JUSTIFICATION))
        fail(
          "server-driven lists",
          `${path} calls ${helper} without the "${PAGINATION_JUSTIFICATION}" justification`,
        );
    }
  }
}

// ── Rule 9: every context exports a hook that throws outside its provider ────
for (const path of files.filter((p) => p.startsWith("contexts/"))) {
  const src = read(path);
  if (!/createContext</.test(src)) continue;
  if (!/must be used within/.test(src))
    fail("contexts/", `${path} creates a context but no hook that throws outside its provider`);
}

// ── Rule 10: tracked filename casing ─────────────────────────────────────────
try {
  const tracked = execSync("git -c core.quotepath=false ls-files", {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  })
    .split("\n")
    .filter(Boolean);
  const realPaths = new Set();
  const collect = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      const full = join(dir, entry.name);
      realPaths.add(relative(ROOT, full).replace(/\\/g, "/"));
      if (entry.isDirectory()) await collect(full);
    }
  };
  await collect(ROOT);
  for (const path of tracked) {
    if (realPaths.has(path)) continue;
    const match = [...realPaths].find((p) => p.toLowerCase() === path.toLowerCase());
    fail(
      "filename casing",
      match
        ? `git tracks "${path}" but the file on disk is "${match}"`
        : `${path} is tracked by git but absent on disk`,
    );
  }
} catch {
  // Not a git checkout; the other rules still apply.
}

if (failures.length === 0) {
  console.log(`Structure OK — ${files.length} files, 12 rules, 0 violations.`);
  process.exit(0);
}
console.error(`Structure check failed (${failures.length}):\n`);
for (const { rule, detail } of failures) console.error(`  [${rule}] ${detail}`);
process.exit(1);
