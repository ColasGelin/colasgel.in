// Copies Re-Fresh monthly grids into public/ and writes months.json, leaving out invalid files.
import { copyFileSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const source = join(homedir(), "Programmation/hackathon-nasa-2025/public/processed_data");
const output = "public/samples/refresh";
const months = [];

for (const file of readdirSync(source).sort()) {
  const match = file.match(/^data_(\d{2})_(\d{4})\.csv$/);
  if (!match) continue;
  const rows = readFileSync(join(source, file), "utf8").trim().split("\n").slice(1);
  const temps = rows.map((row) => Number(row.split(",")[2]));
  if (rows.length === 0 || temps.some((t) => !(t >= -30 && t <= 70))) {
    console.log(`left out ${file}: ${rows.length} rows, range ${Math.min(...temps)} to ${Math.max(...temps)}`);
    continue;
  }
  copyFileSync(join(source, file), join(output, file));
  months.push({ id: `${match[2]}-${match[1]}`, file });
}

months.sort((a, b) => a.id.localeCompare(b.id));
writeFileSync(join(output, "months.json"), JSON.stringify(months));
console.log(`${months.length} months, ${months[0].id} to ${months.at(-1).id}`);
