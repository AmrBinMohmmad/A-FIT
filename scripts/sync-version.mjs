#!/usr/bin/env node
/**
 * Stamps app.json (and package.json) with a version. CI passes the automatic release tag
 * (`node scripts/sync-version.mjs 0.3`); with no argument package.json's version is used.
 */
import { readFileSync, writeFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const version = process.argv[2] ?? pkg.version;
if (!/^\d+(\.\d+){1,2}$/.test(version)) {
  console.error(`Not a version: ${version}`);
  process.exit(1);
}

const app = JSON.parse(readFileSync("app.json", "utf8"));
app.expo.version = version;
writeFileSync("app.json", `${JSON.stringify(app, null, 2)}\n`);
if (pkg.version !== version) {
  pkg.version = version;
  writeFileSync("package.json", `${JSON.stringify(pkg, null, 2)}\n`);
}
console.log(`version -> ${version}`);
