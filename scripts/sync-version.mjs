#!/usr/bin/env node
/** `npm version` hook: copy package.json's version into app.json so the app and the tag agree. */
import { readFileSync, writeFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const app = JSON.parse(readFileSync("app.json", "utf8"));
app.expo.version = pkg.version;
writeFileSync("app.json", `${JSON.stringify(app, null, 2)}\n`);
console.log(`app.json version -> ${pkg.version}`);
