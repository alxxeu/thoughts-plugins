# Create a Thoughts plugin

A plugin is a folder whose name ends in `.thoughtsplugin`, with a `manifest.json` inside and, for converters, a `main.js`.

Right now a plugin can add **converters**: type `12*3`, `5 ft in cm` or `100 usd in eur` on its own line in a card, the result appears in gray, Tab inserts it. A plugin can also add card templates, fonts, text colors, canvas patterns and themes (see the end of this page).

## 1. The folder

```
Currency.thoughtsplugin/
├── manifest.json
└── main.js
```

Allowed files: `.json`, `.js` (1 MB max), `.ttf`, `.otf`. No links, no executables, 20 MB in total.

## 2. `manifest.json`

```json
{
  "id": "com.yourname.currency",
  "name": "Currency",
  "version": "1.0.0",
  "apiVersion": 1,
  "author": "Your Name",
  "main": "main.js",
  "permissions": { "network": ["api.frankfurter.app"] },
  "contributes": {
    "converters": [
      { "id": "currency", "name": "Currency", "description": "100 usd in eur" }
    ]
  }
}
```

- `id`: 3–100 characters, `a–z 0–9 . -`, unique to you (reverse domain works well).
- `version`: `1.0.0` style. To update an installed plugin, raise it.
- `apiVersion`: `1`.
- `main`: the script, a path inside the folder.
- `permissions.network`: host names the script may call. Leave it out if the plugin works offline. The user sees this list when installing.
- `contributes.converters`: every converter the script registers (`id` is `a–z 0–9 -`).

## 3. `main.js`

```js
thoughts.converter("currency", {
  async convert(line) {
    const m = /^(\d+(?:\.\d+)?)\s*([a-z]{3})\s+(?:in|to)\s+([a-z]{3})$/i.exec(line)
    if (!m) return null                       // not mine — let other converters try
    const r = await thoughts.fetch(`https://api.frankfurter.app/latest?from=${m[2]}&to=${m[3]}`)
    const rate = r.json().rates[m[3].toUpperCase()]
    return (m[1] * rate).toFixed(2) + " " + m[3].toUpperCase()
  }
})
```

`convert(line)` gets the line the caret is on, trimmed and without a trailing `=`. Return a string or number to show, or `null` if the line isn't for this converter. It may be `async`.

**The whole API** (nothing else exists: no files, no timers, no access to cards):

| Call | What it does |
|---|---|
| `thoughts.converter(id, { convert(line) })` | Registers a converter. `id` must be listed in `contributes.converters`. |
| `thoughts.fetch(url, { method, headers, body })` | `https` only, only hosts from `permissions.network`. Resolves to `{ status, ok, text(), json() }`. 5 s timeout, 1 MB max. |
| `thoughts.storage.get(key)` / `.set(key, value)` | Small JSON storage for this plugin (for example a cache of rates). |
| `console.log(...)` | Goes to Console.app (subsystem `com.alxeu.Thoughts.plugins`). |

Rules that keep typing fast:
- Answer within **300 ms** (3 s if the plugin uses the network). A converter that misses the deadline three times in a row gets the plugin turned off.
- Return `null` quickly for lines that aren't yours; check with a regular expression first.
- Converters are asked in order; the first non-null answer is shown.

## 4. Install and check

Settings → Plugins → **Install Plugin…** and pick the folder, or drag it onto the Plugins list. Problems are shown under the plugin's name in red, for example a converter listed in the manifest that the script didn't register. To try a change: edit the installed copy (**Open Plugins Folder**) and press **Reload Plugins**, or raise `version` and install again.

**App Store version.** The App Store version of Thoughts installs plugins with a script only when they are signed with the Thoughts catalog key (App Store rules for plugins). The direct-download version and a build run from Xcode install any plugin — use them to test. Signing: `swift scripts/sign-plugin.swift Name.thoughtsplugin <keyfile>` — catalog maintainers only.

Examples: [`Calculator`](examples/Calculator.thoughtsplugin) (math and units, offline), [`Currency`](examples/Currency.thoughtsplugin) (network, cache in storage).

## 5. Also available: templates and appearance

These need no script.

| Key | Item fields | Shows up in |
|---|---|---|
| `cardTemplates` | `id`, `name`, optional `note`, then either `text` + `size` (`{columns, rows}`, 2–24 tiles) + optional `tag`, or `variants` (1–12 of `name`, `note?`, `text`, `size`, `tag?`) and optional `menuTitle` | Right-click on an empty spot of the board |
| `fonts` | `id`, `name`, `file` (.ttf/.otf inside the folder), `family` | Appearance → Font |
| `textColors` | `id`, `name`, `hex` (`#RRGGBB`) | Appearance → Text Color |
| `patterns` | `id`, `name`, `kind` (`dots`, `grid`, `lines`, `crosses`, `diagonal`), optional `spacing` 4–200, `lineWidth` 0.25–10, `dotSize` 0.5–20 | Appearance → Pattern |
| `themes` | `id`, `name`, optional `font`, `textColor`, `pattern` (`<pluginID>/<itemID>` or a built-in id), `patternIntensity` 0.04–0.3 | Appearance → Theme Preset |

Template text is the card's Markdown; a kanban board starts with `::: board`, `## Name` starts a column, `- ` is an item, `||` separates columns. Tags: `red`, `orange`, `yellow`, `green`, `blue`, `indigo`, `purple`. Built-in ids for themes: fonts `builtin.system|rounded|serif|mono`, colors `builtin.default|amber|darkBlue|black`, patterns `builtin.none|dots|grid|lines|crosses|diagonal`. Example: [`Midnight`](examples/Midnight.thoughtsplugin/manifest.json).

Long-term design: [docs/plugins.md](docs/plugins.md).
