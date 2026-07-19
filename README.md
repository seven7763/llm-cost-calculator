# llm-cost-calculator

**Compare LLM API cost per 1M tokens across models and OpenAI-compatible gateways.**
A tiny, data-driven CLI **and** a static web page. It never invents prices — you
fill them from official pricing pages, so the numbers are yours to trust.

[![Node](https://img.shields.io/badge/Node-18%2B-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Try DaoXE](https://img.shields.io/badge/Example_gateway-DaoXE-ff6b6b)](https://daoxe.com/?utm_source=github&utm_medium=organic&utm_campaign=cost_calculator&utm_content=readme_badge)

## CLI

```bash
# demo with illustrative example prices (clearly labeled, not real)
node cost.mjs --pricing pricing.example.json --in 1000000 --out 200000

# your real data (edit pricing.json first)
node cost.mjs --in 1500 --out 800
node cost.mjs --model "gpt-4o" --in 1e6 --out 2e5
```

Example output (demo data):

```
Cost for 1,000,000 input + 200,000 output tokens

Model                     Provider      $/1M in     $/1M out    Total
----------------------------------------------------------------------------
gpt-4o-mini               OpenAI (direct)0.15        0.6         $0.2700
deepseek-v3               DeepSeek (direct)0.27       1.1         $0.4900
...
```

## Web page

Open `index.html` (or host it on GitHub Pages). It loads `pricing.example.json`
by default with a clear "demo data" banner; switch the dropdown to your own
`pricing.json`. Sortable columns, highlights the cheapest option.

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Honesty by design

- **No fabricated prices.** Every number in `pricing.json` is dated and sourced.
  Official prices link each vendor's pricing page; DaoXE prices are derived from
  the public `daoxe.com/api/pricing` (crawled 2026-07-19) and link
  [daoxe.com/pricing](https://daoxe.com/pricing). Any unknown price stays `null`
  (shows as `set price`).
- **DaoXE `default` group = official parity.** Savings come from *choosing* a
  low-price group (~30–80% off for GPT/Claude/Gemini/Grok). The most aggressive
  reverse/subsidy channels go lower, but DaoXE itself labels them "quality not
  guaranteed / medium stability / subsidized" — flagged with `*`.
- **Honest counter-example (kept on purpose).** Cheap domestic models
  (DeepSeek/Qwen/GLM) have *no* price advantage here and can cost ~2–4× **more**
  than going direct — see the `deepseek-v4-pro` rows.
- `pricing.example.json` holds **clearly-labeled illustrative** numbers for a demo.

## Fill in your prices

Edit `pricing.json`:

```json
"gpt-5.5": { "provider": "OpenAI (direct)", "input_per_1m": 5, "output_per_1m": 30, "source": "https://developers.openai.com/api/docs/pricing" }
```

Add a gateway row to compare (e.g. DaoXE for Claude/GPT/Gemini/DeepSeek through
one key) and instantly see the delta for your token mix.

## Related

- **[seven7763/llm-gateway-benchmark](https://github.com/seven7763/llm-gateway-benchmark)** — latency / availability / price leaderboard (pairs well with this cost view).
- **[seven7763/DaoXE-AI](https://github.com/seven7763/DaoXE-AI)** — per-client setup for Cursor, Claude Code, Cline and more.
- **[seven7763/cursor-custom-openai-api](https://github.com/seven7763/cursor-custom-openai-api)** — verify a custom endpoint before wiring it into Cursor.

## About the example gateway

[DaoXE](https://daoxe.com/?utm_source=github&utm_medium=organic&utm_campaign=cost_calculator&utm_content=readme_about) is an OpenAI-compatible multi-model gateway (`https://daoxe.com/v1`). Any OpenAI-compatible endpoint works in the comparison. Free credit on signup: `{{FREE_CREDIT}}` *(to be confirmed)*.

> Disclosure: this repo's author operates DaoXE. The calculator is provider-neutral.

## Acknowledgements

Thanks to the [**LINUX DO**](https://linux.do) community for feedback on comparing
gateway pricing fairly.

## License

MIT
