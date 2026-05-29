# Debate Partner

An adversarial reasoning engine built as a local Obsidian plugin. It challenges your thinking using your own vault data and a local LLM.

## How It Works

1. **Thesis Extraction**: Grabs the currently selected text in the active editor when you trigger the command.
2. **Local TF-IDF Search**: A lightweight, mathematical Term Frequency-Inverse Document Frequency (TF-IDF) engine crawls all `.md` files in your vault to find the top 5 most relevant notes matching the concepts in your thesis.
3. **Steel-Man Engine**: Sends the selected thesis and the matching notes context to your local Ollama endpoint (`http://localhost:11434/api/generate`) running `llama3` (or your model of choice).
4. **Adversarial UI**: Renders 3 ranked counterarguments in a custom right-sidebar leaf. The arguments highlight the severity of the conceptual contradiction and insert functioning internal links (e.g., `[[My Note]]`) referencing the source material, which you can click to navigate back directly to the source notes.

## Installation

1. Copy the plugin folder to your vault's `.obsidian/plugins/` directory.
2. Ensure you have the `main.js`, `manifest.json`, and `styles.css` files inside that directory.
3. Reload Obsidian and enable **Debate Partner** in the Community Plugins settings.

## Development

Install dependencies:
```bash
npm install
```

Build the bundle:
```bash
npm run build
```
