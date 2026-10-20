# Create a Thoughts plugin

A plugin is a folder whose name ends in `.thoughtsplugin`, with a `manifest.json` inside. It is data only: Thoughts reads it and never runs anything from it.

## 1. Make the folder

```
MyPlugin.thoughtsplugin/
├── manifest.json
└── fonts/              # only if the plugin adds fonts
    └── MyFont.ttf
```

Allowed files: `.json`, `.ttf`, `.otf`. No links, no executables, 20 MB in total, 10 MB per font.

## 2. Write `manifest.json`

Minimal plugin with one text color:

```json
{
  "id": "com.yourname.myplugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "apiVersion": 1,
  "author": "Your Name",
  "contributes": {
    "textColors": [{ "id": "mint", "name": "Mint", "hex": "#9FE3C8" }]
  }
}
```

- `id`: 3–100 characters, `a–z 0–9 . -`, unique to you (reverse domain works well).
- `version`: `1.0.0` style. To update an installed plugin, raise it.
- `apiVersion`: `1`.
- Item `id`s: `a–z 0–9 -`, unique within their list. Elsewhere an item is referred to as `<pluginID>/<itemID>`.

## 3. What a plugin can add (API 1)

| Key | Item fields | Shows up in |
|---|---|---|
| `fonts` | `id`, `name`, `file` (path inside the folder), `family` (the font's family name) | Settings → Appearance → Font |
| `textColors` | `id`, `name`, `hex` (`#RRGGBB`) | Settings → Appearance → Text Color |
| `patterns` | `id`, `name`, `kind` (`dots`, `grid`, `lines`, `crosses`, `diagonal`), optional `spacing` 4–200, `lineWidth` 0.25–10, `dotSize` 0.5–20 | Settings → Appearance → Pattern |
| `themes` | `id`, `name`, optional `font`, `textColor`, `pattern` (an item of this plugin as `<pluginID>/<itemID>`, or a built-in id below), `patternIntensity` 0.04–0.3 | Settings → Appearance → Theme Preset |
| `cardTemplates` | `id`, `name`, optional `note`, then either `text` + `size` + optional `tag`, or `variants` (1–12 items, each `name`, `note?`, `text`, `size`, `tag?`) and optional `menuTitle` | Right-click on an empty spot of the board; Settings → Plugins → Templates |

Built-in ids a theme may use:
- fonts: `builtin.system`, `builtin.rounded`, `builtin.serif`, `builtin.mono`
- text colors: `builtin.default`, `builtin.amber`, `builtin.darkBlue`, `builtin.black`
- patterns: `builtin.none`, `builtin.dots`, `builtin.grid`, `builtin.lines`, `builtin.crosses`, `builtin.diagonal`

Card templates:
- `text` is the card's Markdown. A kanban board starts with `::: board`; `## Name` starts a column, `- ` is an item, `||` separates columns.
- `size` is in grid tiles: `{ "columns": 2–24, "rows": 2–24 }` (a tile is 60 pt).
- `tag`: `red`, `orange`, `yellow`, `green`, `blue`, `indigo`, `purple`.
- With `variants`, the template becomes a submenu titled `menuTitle` (or `name`).

A complete example: [`examples/Midnight.thoughtsplugin`](examples/Midnight.thoughtsplugin/manifest.json).

## 4. Install and check

In Thoughts: Settings → Plugins → **Install Plugin…** and pick the folder, or drag it onto the Plugins list. If something is wrong, Thoughts says what and where (for example "theme “midnight”: textColor “…” doesn’t exist"). Fix the manifest and install again (remove the broken copy first), or edit the installed copy in place (**Open Plugins Folder**) and press **Reload Plugins**.

Full design and future plans: [docs/plugins.md](docs/plugins.md).
