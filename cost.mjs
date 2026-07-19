#!/usr/bin/env node
// LLM cost calculator / comparator. Computes $ cost for a request across models
// and gateways from a data file you control. Zero dependencies, Node 18+.
//
//   node cost.mjs --in 1000000 --out 200000            # compare all models
//   node cost.mjs --model "gpt-4o" --in 1500 --out 800 # one model
//   node cost.mjs --in 1e6 --out 2e5 --pricing pricing.example.json
//
// Prices are read from a JSON file you maintain (default: pricing.json). This
// tool NEVER invents prices — a null price shows as "set price" with its source.

import { readFile } from "node:fs/promises";

function parseArgs(argv) {
  const o = { in: 1_000_000, out: 200_000, pricing: "pricing.json", model: null, format: "table" };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--in") o.in = Number(argv[++i]);
    else if (a === "--out") o.out = Number(argv[++i]);
    else if (a === "--pricing") o.pricing = argv[++i];
    else if (a === "--model") o.model = argv[++i];
    else if (a === "--format") o.format = argv[++i];
    else if (a === "--help" || a === "-h") o.help = true;
  }
  if (!Number.isFinite(o.in) || o.in < 0 || !Number.isFinite(o.out) || o.out < 0) {
    throw new Error("--in and --out must be non-negative token counts");
  }
  return o;
}

function cost(price, tokensIn, tokensOut) {
  if (price?.input_per_1m == null || price?.output_per_1m == null) return null;
  return (tokensIn / 1e6) * price.input_per_1m + (tokensOut / 1e6) * price.output_per_1m;
}

function money(n) {
  if (n == null) return "set price";
  if (n === 0) return "$0.00";
  if (n < 0.01) return `$${n.toFixed(5)}`;
  return `$${n.toFixed(n < 1 ? 4 : 2)}`;
}

function pad(s, n) { s = String(s); return s + " ".repeat(Math.max(0, n - s.length)); }

function help() {
  return `LLM cost calculator (Node 18+, zero deps)

  node cost.mjs --in <tokens> --out <tokens> [--model <id>] [--pricing <file>]

Options:
  --in N         input tokens (default 1000000). Accepts 1e6 style.
  --out N        output tokens (default 200000)
  --model ID     show a single model instead of a comparison
  --pricing FILE pricing data file (default pricing.json)
  --format table|json

Prices come from the pricing file you maintain. Fill real numbers from each
provider's official pricing page; null prices are shown as "set price".
`;
}

async function main() {
  let o;
  try { o = parseArgs(process.argv.slice(2)); } catch (e) { console.error(`Error: ${e.message}\n`); process.stdout.write(help()); process.exit(2); }
  if (o.help) { process.stdout.write(help()); return; }

  let data;
  try { data = JSON.parse(await readFile(o.pricing, "utf8")); }
  catch { console.error(`Could not read pricing file: ${o.pricing}`); process.exit(1); }

  const models = Object.entries(data).filter(([k]) => !k.startsWith("_"));
  const rows = models
    .map(([id, p]) => ({ id, provider: p.provider ?? "-", total: cost(p, o.in, o.out), input_per_1m: p.input_per_1m, output_per_1m: p.output_per_1m }))
    .filter((r) => (o.model ? r.id === o.model : true));

  if (o.model && rows.length === 0) { console.error(`Model not found in ${o.pricing}: ${o.model}`); process.exit(1); }

  rows.sort((a, b) => (a.total == null ? Infinity : a.total) - (b.total == null ? Infinity : b.total));

  if (o.format === "json") {
    process.stdout.write(JSON.stringify({ input_tokens: o.in, output_tokens: o.out, results: rows }, null, 2) + "\n");
    return;
  }

  console.log(`\nCost for ${o.in.toLocaleString()} input + ${o.out.toLocaleString()} output tokens\n`);
  console.log(`${pad("Model", 26)}${pad("Provider", 20)}${pad("$/1M in", 12)}${pad("$/1M out", 12)}Total`);
  console.log("-".repeat(82));
  for (const r of rows) {
    console.log(`${pad(r.id, 26)}${pad(r.provider, 20)}${pad(r.input_per_1m ?? "—", 12)}${pad(r.output_per_1m ?? "—", 12)}${money(r.total)}`);
  }
  if (data._note) console.log(`\n${data._note}`);
}

main().catch((e) => { console.error(`cost calculator failed: ${e.message}`); process.exit(1); });
