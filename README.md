# Hello API

A secure, offline-first HTTP API testing and management tool. No sign-up required, no backend, all data stored locally in the browser.

**Live** → [hello-api-cf7.pages.dev](https://hello-api-cf7.pages.dev)

[中文文档](README-zh.md)

---

## Features

### Request Builder

- **HTTP Methods** — GET / POST / PUT / PATCH / DELETE / HEAD / OPTIONS
- **Request Params** — Query Params, Headers, JSON Body (CodeMirror 6 editor), Form, Raw
- **Auth (Auth tab)** — Bearer Token, Basic Auth, API Key (Header or Query)
- **Variable Interpolation** — `{{variable}}` syntax with environment variables
- **Request Description** — Add notes to each request, persisted in storage

### Response Viewer

- Status code, duration, response size
- Formatted JSON with syntax highlighting, response headers list
- Media preview: images, audio/video, PDF, HTML, SVG
- **Copy Response Body** — one-click copy to clipboard

### Project Management

- **Project / Collection / Request** three-level tree navigation with rename and description support
- **Search & Filter** — real-time search across project, collection, and request names and URLs with match highlighting
- **Drag to Reorder** — collections and requests can be freely reordered within the same level via drag and drop
- Expand/collapse state persisted across page reloads
- Request duplication, quick-add request (no project required first)
- URL auto-synced as request title; locks after manual edit

### Quick Actions

- **⌘↩ / Ctrl↩** — send request
- **Copy as cURL** — generate a complete curl command including auth headers
- **Export Data** — serialize all projects to a JSON file download
- **Import Data** — restore project structure from a JSON file, without overwriting existing data

### Engineering

- **Offline-ready** — Service Worker caches all static assets, works without a network connection (PWA)
- **Local storage** — all data stored in IndexedDB, nothing uploaded to any server
- **Bilingual UI** — English / Chinese, auto-detected from browser language, persisted in `localStorage`
- **Theming** — light / dark mode toggle

---

## Design Principles

| Principle                 | Description                                                               |
| ------------------------- | ------------------------------------------------------------------------- |
| Zero runtime dependencies | No third-party JS libraries in the web app, eliminating supply chain risk |
| Offline-first             | Service Worker + Cache API, fully functional without a network connection |
| Local data                | IndexedDB storage, user has complete control over their data              |
| Responsive                | Mobile and desktop treated with equal priority                            |

## Tech Stack

- **UI**: Vanilla HTML/CSS + Web Components (Custom Elements + Shadow DOM)
- **Logic**: Vanilla JS (ES2024+, ES Modules, no build tools)
- **Storage**: IndexedDB
- **Offline**: Service Worker
- **Code editor**: CodeMirror 6 (JSON Body only, lazy-loaded from CDN on demand)
- **i18n**: Built-in bilingual (zh/en), zero dependencies

## Local Development

No dependencies required. Serve with any static file server:

```bash
# Option 1: VS Code Live Server extension — open index.html directly

# Option 2: Node.js
npx serve .

# Option 3: Python
python3 -m http.server 8080
```

Format code (requires Node.js):

```bash
pnpm install   # installs prettier (devDependency only)
pnpm format
```

Regenerate PWA icons:

```bash
pnpm gen-icons
```

## Deployment

The project is connected to GitHub and auto-deployed via **Cloudflare Pages**:

| Field                  | Value           |
| ---------------------- | --------------- |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | (leave empty)   |

Every push to the `main` branch triggers a new deployment.

## Project Structure

```
hello-api/
├── index.html              # entry point
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── assets/
│   ├── favicon.svg
│   ├── favicon.png
│   └── icons/              # PWA icons 192/512px
├── scripts/
│   └── gen-icons.js        # PNG icon generator (pure Node.js)
└── src/
    ├── app.js              # initialization entry
    ├── components/         # Web Components
    │   ├── app-shell.js
    │   ├── sidebar-nav.js
    │   ├── request-editor.js
    │   ├── response-viewer.js
    │   ├── env-manager.js
    │   └── storage-indicator.js
    ├── db/                 # IndexedDB data layer
    │   ├── index.js
    │   ├── projects.js
    │   ├── requests.js
    │   └── environments.js
    ├── core/               # core business logic
    │   ├── http-client.js
    │   ├── interpolation.js
    │   ├── dialog.js
    │   ├── i18n.js
    │   └── storage-stats.js
    └── styles/             # CSS design tokens and themes
        ├── tokens.css
        ├── base.css
        ├── layout.css
        └── themes/
```

## License

MIT
