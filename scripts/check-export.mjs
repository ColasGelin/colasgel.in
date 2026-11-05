// Fails if the built site contains private data or secrets.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";

// .check-export-terms is gitignored, so the private values never enter this repo.
const TERMS_FILE = ".check-export-terms";
const BANNED = ["API_KEY", "sk-ant"];
if (existsSync(TERMS_FILE)) {
  BANNED.push(...readFileSync(TERMS_FILE, "utf8").split("\n").filter(Boolean));
} else {
  console.warn(`${TERMS_FILE} not found: checking generic secrets only`);
}
const TEXT = new Set([".html", ".js", ".json", ".css", ".txt"]);

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path);
    else if (TEXT.has(extname(path))) yield path;
  }
}

let failed = false;
for (const path of files("out")) {
  if (path.startsWith("out/samples/snake/")) continue;
  const text = readFileSync(path, "utf8");
  for (const banned of BANNED) {
    if (text.includes(banned)) {
      console.error(`${path} contains ${banned}`);
      failed = true;
    }
  }
}
if (failed) process.exit(1);
console.log("export is clean");
