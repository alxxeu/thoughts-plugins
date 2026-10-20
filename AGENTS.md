# Instructions for AI agents

Usual task: "make a Thoughts plugin that converts …". Do this:

1. Read [CREATE.md](CREATE.md) — the complete, current format (plugin API 1). [docs/plugins.md](docs/plugins.md) is long-term design; anything there that CREATE.md doesn't list (commands, card access, Reminders, OAuth, image patterns) is **not available yet** — don't use it.
2. Produce one folder `<Name>.thoughtsplugin/` with `manifest.json` and `main.js`. Start from [`examples/Calculator.thoughtsplugin`](examples/Calculator.thoughtsplugin) (offline) or [`examples/Currency.thoughtsplugin`](examples/Currency.thoughtsplugin) (network).
3. In `main.js` use only `thoughts.converter`, `thoughts.fetch`, `thoughts.storage`, `console.log`. No `setTimeout`, no `require`/`import`, no DOM.
4. Check before handing over:
   - `manifest.json` is valid JSON; `id` `[a-z0-9.-]{3,100}`; `version` like `1.0.0`; `apiVersion: 1`; `main` points to the script.
   - Every `thoughts.converter("x", …)` id is listed in `contributes.converters`, and every listed id is registered.
   - Every host the script fetches (https only) is in `permissions.network`; nothing else is.
   - `convert` returns `null` fast for lines it doesn't handle (regex first), answers within 300 ms offline / 3 s with network, never throws for odd input.
   - Test the converter logic with a few lines (e.g. in Node with a stub `thoughts` object) before delivering.
5. Tell the user: install via Settings → Plugins → Install Plugin… (the direct-download version of Thoughts; the App Store version needs a catalog signature).
