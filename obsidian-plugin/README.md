# Obsidian Local Agent Plugin

Minimal Obsidian plugin for this project.

## What it does

- Opens a right-side panel inside Obsidian
- Reads the current markdown note
- Can include first-level `[[wikilinks]]`, same-folder notes, shared-tag notes, and backlinks
- Sends the note content and selected context notes to the FastAPI backend
- Streams the answer back into the panel
- Renders Obsidian wiki links and vault file paths in the answer panel
- Shows collapsible card lists for sent context notes and retrieved sources
- Adds snippet previews on both context and source cards
- Opens source notes in the current tab, a split pane, or a new tab
- Saves answers back into your vault or appends them to the current note
- Adds quick note actions for summarize, organize, and next actions
- Adds commands for asking about the current selection and running note actions
- Includes `Generator`, `Tagger`, and `Ingest` workflow panels inside the same sidebar
- Loads workflow config from the backend and can browse generator input files
- Keeps a combined workflow log panel for chat, generator, tagger, and ingest runs
- Uses top tabs like `Chat / Generator / Tagger / Ingest / Logs` so the workflow matches the old Streamlit flow more closely

## Source opening

- Source cards can open in the `current tab`, a `split pane`, or a `new tab`
- Split pane mode can open to the `left`, `right`, or `down`
- `down` uses a horizontal split
- `left` and `right` both use a vertical split because Obsidian's plugin API does not expose strict left/right placement control per click

## Local setup

```bash
cd obsidian-plugin
npm install
npm run build
```

## Install into Obsidian

Copy these files into your vault plugin directory:

```text
<vault>/.obsidian/plugins/obsidian-local-agent/
  manifest.json
  main.js
  styles.css
  versions.json
```

Then enable `Obsidian Local Agent` in Obsidian community plugins.

## Commands

- `Open Local Agent`
- `Ask Selection With Local Agent`
- `Summarize Current Note With Local Agent`
- `Organize Current Note With Local Agent`
- `Extract Next Actions With Local Agent`

## Context controls

The panel has quick toggles for:

- `Links`
- `Folder`
- `Tags`
- `Backlinks`

## Workflow panels

- `Generator`: choose a job or direct mode, input/output paths, subject, model, temperature, patterns, and source files
- `Tagger`: run frontmatter tag refresh for `summary`, `raw`, or `all`
- `Ingest`: run incremental/reset/cleanup indexing with layer and chunking options
- `Workflow Logs`: review recent activity across the plugin without switching to Streamlit

## Backend requirement

The plugin expects the backend at:

```text
http://127.0.0.1:8011
```

You can change it from the plugin settings tab.
