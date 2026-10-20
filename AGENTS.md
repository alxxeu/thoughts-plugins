# Instructions for AI agents

Your task here is usually "make a Thoughts plugin that …". Do this:

1. Read [CREATE.md](CREATE.md) — it is the complete, current format (plugin API 1). [docs/plugins.md](docs/plugins.md) is the long-term design; parts of it (`aiActions`, image patterns, the catalog) are **not implemented yet**, so do not use them.
2. Produce one folder `<Name>.thoughtsplugin/` with `manifest.json` (and font files only if the user supplied them or they are licensed for redistribution).
3. Before handing it over, check it against the rules in CREATE.md:
   - valid JSON; `id` `[a-z0-9.-]{3,100}`; `version` like `1.0.0`; `apiVersion: 1`;
   - item ids `[a-z0-9-]`, unique per list; names 1–40 characters (templates up to 60);
   - colors `#RRGGBB`; pattern kinds and number ranges as listed;
   - theme references are `<pluginID>/<itemID>` of items in the same manifest, or built-in ids;
   - template `size` 2–24 tiles each way, `tag` from the list, either `text`+`size` or `variants`;
   - only `.json`, `.ttf`, `.otf` files; paths inside the folder.
4. Tell the user to install it via Settings → Plugins → Install Plugin… in Thoughts.

Use [`examples/Midnight.thoughtsplugin/manifest.json`](examples/Midnight.thoughtsplugin/manifest.json) as a template.
