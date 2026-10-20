# thoughts-plugins

Plugins for [Thoughts](https://github.com/alxxeu/Thoughts), a Mac app for scattered ideas.

Plugins add **converters** to cards, like Spotlight: type `12*3`, `5 ft in cm` or `100 usd in eur`, see the result in gray, press Tab to insert it. A plugin is a `.thoughtsplugin` folder with `manifest.json` and a small `main.js` that runs isolated, with no access to your cards and the internet only for the sites it lists. Plugins can also add card templates, fonts and colors.

- **[Create a plugin](CREATE.md)** — format and script API.
- **Examples:** [Calculator](examples/Calculator.thoughtsplugin) · [Currency](examples/Currency.thoughtsplugin) · [Midnight](examples/Midnight.thoughtsplugin) (templates and appearance).
- **[For AI agents](AGENTS.md)** — how to generate a plugin that installs on the first try.
- **[Design](docs/plugins.md)** — the long-term plan: commands, Reminders and Calendar, OAuth integrations, the catalog.

Install: Thoughts → Settings → Plugins → Install Plugin…, or drag the folder onto the Plugins list.
