// Fails if the built site contains private data or secrets.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const BANNED = ["API_KEY", "sk-ant"];
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
