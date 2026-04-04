// <response-viewer> Web Component - response display (status, timing, body)

import { t, applyI18n } from '../core/i18n.js';
import { listHistory, clearHistory } from '../db/history.js';

const ICON_RESPONSE = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10H10a4 4 0 000 8h4"/><path d="M10 14l-4 4 4 4"/></svg>`;
const ICON_COPY = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="7.5" height="7.5" rx="1"/><path d="M2 9V2.5a1 1 0 011-1H9"/></svg>`;

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--color-bg-base);
      font-family: var(--font-sans);
      font-size: 13px;
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 12px;
      height: 40px;
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }
    .title {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-badge {
      font-size: 12px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      display: none;
    }
    .status-badge.visible { display: inline-flex; }
    .status-badge.s2xx { background: rgba(34,197,94,0.15); color: #22c55e; }
    .status-badge.s3xx { background: rgba(245,158,11,0.15); color: #f59e0b; }
    .status-badge.s4xx { background: rgba(239,68,68,0.15); color: #ef4444; }
    .status-badge.s5xx { background: rgba(239,68,68,0.15); color: #ef4444; }
    .status-badge.error { background: rgba(239,68,68,0.15); color: #ef4444; }
    .meta {
      display: flex;
      gap: 12px;
      margin-left: auto;
    }
    .meta-item {
      font-size: 11px;
      color: var(--color-text-tertiary);
    }
    .meta-item span { color: var(--color-text-secondary); }
    .cached-badge {
      font-size: 11px;
      color: var(--color-text-tertiary);
      padding: 1px 6px;
      border-radius: 9999px;
      border: 1px solid var(--color-border);
      white-space: nowrap;
    }
    .copy-body-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px;
      font-size: 11px;
      color: var(--color-text-secondary);
      background: none;
      border: 1px solid var(--color-border);
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .copy-body-btn:hover { color: var(--color-text-primary); background: var(--color-surface-3); border-color: var(--color-border-strong); }
    .copy-body-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .tabs {
      display: flex;
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }
    .tab {
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 500;
      color: var(--color-text-secondary);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: color 0.15s, border-color 0.15s;
    }
    .tab:hover { color: var(--color-text-primary); }
    .tab.active {
      color: var(--color-accent);
      border-bottom-color: var(--color-accent);
    }
    .panel {
      display: none;
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }
    .panel.active { display: flex; flex-direction: column; }
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--color-text-tertiary);
      gap: 8px;
    }
    .empty-icon { font-size: 32px; opacity: 0.4; }
    .loading-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: var(--color-text-tertiary);
      font-size: 12px;
    }
    .spinner {
      width: 22px;
      height: 22px;
      border: 2px solid var(--color-border);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .body-content {
      flex: 1;
      padding: 12px;
      font-family: var(--font-mono);
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-all;
      color: var(--color-text-primary);
      overflow-y: auto;
    }
    .body-content.json .string { color: var(--json-string); }
    .body-content.json .number { color: var(--json-number); }
    .body-content.json .boolean { color: var(--json-boolean); }
    .body-content.json .null { color: var(--json-null); }
    .body-content.json .key { color: var(--json-key); }
    .headers-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .headers-table th {
      text-align: left;
      padding: 6px 12px;
      font-weight: 600;
      color: var(--color-text-tertiary);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--color-border);
    }
    .headers-table td {
      padding: 6px 12px;
      border-bottom: 1px solid var(--color-border-subtle);
      word-break: break-all;
    }
    .headers-table td:first-child {
      font-family: var(--font-mono);
      color: var(--color-text-secondary);
      white-space: nowrap;
    }
    .headers-table td:last-child {
      font-family: var(--font-mono);
      color: var(--color-text-primary);
    }
    .error-body {
      flex: 1;
      padding: 16px;
      color: var(--color-error);
      font-family: var(--font-mono);
      font-size: 12px;
      white-space: pre-wrap;
    }
    /* Cancelled state */
    .cancelled-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--color-text-tertiary);
      font-size: 12px;
    }
    /* History panel */
    .history-header {
      display: flex;
      align-items: center;
      padding: 6px 12px;
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
      gap: 8px;
    }
    .history-count-label {
      flex: 1;
      font-size: 11px;
      color: var(--color-text-tertiary);
    }
    .history-clear-btn {
      font-size: 11px;
      color: var(--color-text-tertiary);
      background: none;
      border: 1px solid var(--color-border);
      border-radius: 3px;
      padding: 2px 8px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .history-clear-btn:hover {
      color: var(--color-error);
      border-color: var(--color-error);
      background: var(--color-error-muted);
    }
    .history-list { flex: 1; overflow-y: auto; }
    .history-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-size: 12px;
      color: var(--color-text-tertiary);
    }
    .history-entry {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 12px;
      border-bottom: 1px solid var(--color-border-subtle);
      cursor: pointer;
      transition: background 0.1s;
    }
    .history-entry:hover { background: var(--color-surface-2); }
    .history-method {
      font-size: 10px;
      font-weight: 700;
      font-family: var(--font-mono);
      min-width: 48px;
    }
    .history-status {
      font-size: 11px;
      font-weight: 600;
      min-width: 32px;
    }
    .history-status.s2xx { color: #22c55e; }
    .history-status.s3xx { color: #f59e0b; }
    .history-status.s4xx, .history-status.s5xx { color: #ef4444; }
    .history-status.error { color: #ef4444; }
    .history-url {
      flex: 1;
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--color-text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }
    .history-meta {
      font-size: 10px;
      color: var(--color-text-tertiary);
      white-space: nowrap;
      text-align: right;
    }
    /* Preview panel */
    #panel-preview {
      overflow: hidden;
    }
    .preview-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 8px;
    }
    .preview-wrap img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 4px;
    }
    .preview-wrap audio {
      width: 100%;
    }
    .preview-wrap video {
      max-width: 100%;
      max-height: 100%;
      border-radius: 4px;
    }
    .preview-wrap iframe {
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 4px;
    }
    .preview-unsupported {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      color: var(--color-text-tertiary);
      font-size: 12px;
    }
    .preview-unsupported code {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--color-text-secondary);
    }
  </style>
  <div class="toolbar">
    <span class="title" data-i18n="res.title">响应</span>
    <div class="status-badge" id="status-badge"></div>
    <div class="meta" id="meta"></div>
    <button class="copy-body-btn" id="copy-body-btn" disabled>${ICON_COPY} <span id="copy-body-label" data-i18n="res.copy">复制</span></button>
  </div>
  <div class="tabs" id="tabs">
    <div class="tab active" data-tab="body">Body</div>
    <div class="tab" data-tab="headers">Headers</div>
    <div class="tab" data-tab="preview">Preview</div>
    <div class="tab" data-tab="history" data-i18n="res.tabHistory">历史</div>
  </div>
  <div class="panel active" id="panel-body">
    <div class="empty-state" id="empty-state">
      <div class="empty-icon">${ICON_RESPONSE}</div>
      <div data-i18n="res.empty">发送请求后查看响应</div>
    </div>
    <div class="loading-state" id="loading-state" style="display:none">
      <div class="spinner"></div>
      <div data-i18n="res.sending">发送中…</div>
    </div>
    <div class="body-content" id="body-content" style="display:none"></div>
    <div class="error-body" id="error-body" style="display:none"></div>
    <div class="cancelled-state" id="cancelled-state" style="display:none">
      <div data-i18n="res.cancelled">已取消</div>
    </div>
  </div>
  <div class="panel" id="panel-headers">
    <table class="headers-table" id="headers-table">
      <thead><tr><th data-i18n="res.headerName">名称</th><th data-i18n="res.headerValue">值</th></tr></thead>
      <tbody id="headers-tbody"></tbody>
    </table>
  </div>
  <div class="panel" id="panel-preview">
    <div class="preview-wrap" id="preview-wrap">
      <div class="preview-unsupported">
        <div data-i18n="res.noPreview">发送请求后查看预览</div>
      </div>
    </div>
  </div>
  <div class="panel" id="panel-history">
    <div class="history-header">
      <span class="history-count-label" id="history-count-label"></span>
      <button class="history-clear-btn" id="history-clear-btn" data-i18n="res.historyClear">清除</button>
    </div>
    <div class="history-list" id="history-list"></div>
  </div>
`;

const METHOD_COLORS = {
  GET: '#22c55e',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  PATCH: '#8b5cf6',
  DELETE: '#ef4444',
  HEAD: '#06b6d4',
  OPTIONS: '#64748b',
};

class ResponseViewer extends HTMLElement {
  #blobUrl = null;
  #rawBody = null;
  #i18nHandler = null;
  #lastResponse = null;
  #lastCached = false;
  #requestId = null;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      this.#bindTabs();
      this.#bindCopyBody();
      applyI18n(this.shadowRoot);
    }
    this.#i18nHandler = () => {
      applyI18n(this.shadowRoot);
      this.#refreshMeta();
    };
    window.addEventListener('locale-changed', this.#i18nHandler);
  }

  disconnectedCallback() {
    this.#revokeBlobUrl();
    window.removeEventListener('locale-changed', this.#i18nHandler);
  }

  #refreshMeta() {
    if (!this.#lastResponse) return;
    const response = this.#lastResponse;
    const cached = this.#lastCached;
    const meta = this.shadowRoot.getElementById('meta');
    const badge = this.shadowRoot.getElementById('status-badge');

    if (response.error) {
      badge.textContent = t('res.error');
      meta.innerHTML = `<span class="meta-item">${this.#escHtml(t('res.durationLabel'))} <span>${response.duration}ms</span></span>`;
      return;
    }

    const cachedPart =
      cached && response.requestedAt
        ? `<span class="cached-badge">${this.#escHtml(t('res.cached'))} · ${new Date(response.requestedAt).toLocaleString(undefined, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>`
        : '';
    meta.innerHTML = [
      `<span class="meta-item">${this.#escHtml(t('res.durationLabel'))} <span>${response.duration}ms</span></span>`,
      `<span class="meta-item">${this.#escHtml(t('res.sizeLabel'))} <span>${this.#formatSize(response.size)}</span></span>`,
      cachedPart,
    ].join('');
  }

  #bindTabs() {
    this.shadowRoot.getElementById('tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      const name = tab.dataset.tab;
      this.shadowRoot
        .querySelectorAll('.tab')
        .forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
      this.shadowRoot
        .querySelectorAll('.panel')
        .forEach((p) => p.classList.toggle('active', p.id === `panel-${name}`));
      if (name === 'history') this.#loadHistory();
    });

    this.shadowRoot.getElementById('history-clear-btn').addEventListener('click', async () => {
      if (!this.#requestId) return;
      await clearHistory(this.#requestId).catch(() => {});
      this.#loadHistory();
    });
  }

  setRequestId(id) {
    this.#requestId = id;
  }

  async #loadHistory() {
    if (!this.#requestId) return;
    const entries = await listHistory(this.#requestId).catch(() => []);
    const list = this.shadowRoot.getElementById('history-list');
    const countLabel = this.shadowRoot.getElementById('history-count-label');
    countLabel.textContent = t('res.historyCount', { count: entries.length });

    if (!entries.length) {
      list.innerHTML = `<div class="history-empty">${this.#escHtml(t('res.historyEmpty'))}</div>`;
      return;
    }

    list.innerHTML = '';
    for (const entry of entries) {
      const row = document.createElement('div');
      row.className = 'history-entry';

      const statusCls = entry.status
        ? entry.status >= 500
          ? 's5xx'
          : entry.status >= 400
            ? 's4xx'
            : entry.status >= 300
              ? 's3xx'
              : 's2xx'
        : 'error';
      const statusLabel = entry.status ?? 'ERR';
      const color = METHOD_COLORS[entry.method] ?? 'inherit';
      const time = new Date(entry.requestedAt).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const duration = entry.duration != null ? `${entry.duration}ms` : '';

      row.innerHTML = `
        <span class="history-method" style="color:${color}">${this.#escHtml(entry.method)}</span>
        <span class="history-status ${statusCls}">${statusLabel}</span>
        <span class="history-url">${this.#escHtml(entry.url)}</span>
        <span class="history-meta">${duration}<br>${time}</span>
      `;

      row.addEventListener('click', () => {
        // Switch to Body tab and show this historical response
        this.shadowRoot.querySelectorAll('.tab').forEach((t) => {
          t.classList.toggle('active', t.dataset.tab === 'body');
        });
        this.shadowRoot.querySelectorAll('.panel').forEach((p) => {
          p.classList.toggle('active', p.id === 'panel-body');
        });
        this.setResponse(entry.response, { cached: true });
      });

      list.appendChild(row);
    }
  }

  #bindCopyBody() {
    this.shadowRoot.getElementById('copy-body-btn').addEventListener('click', async () => {
      if (this.#rawBody === null) return;
      await navigator.clipboard.writeText(this.#rawBody);
      const label = this.shadowRoot.getElementById('copy-body-label');
      label.textContent = t('res.copied');
      setTimeout(() => {
        label.textContent = t('res.copy');
      }, 2000);
    });
  }

  #revokeBlobUrl() {
    if (this.#blobUrl) {
      URL.revokeObjectURL(this.#blobUrl);
      this.#blobUrl = null;
    }
  }

  setLoading() {
    this.#revokeBlobUrl();
    this.#rawBody = null;
    this.#lastResponse = null;
    this.#lastCached = false;
    const copyBtn = this.shadowRoot.getElementById('copy-body-btn');
    copyBtn.disabled = true;
    this.shadowRoot.getElementById('copy-body-label').textContent = t('res.copy');
    const badge = this.shadowRoot.getElementById('status-badge');
    badge.className = 'status-badge visible';
    badge.textContent = t('res.sendingBadge');
    badge.style.background = 'var(--color-accent-muted)';
    badge.style.color = 'var(--color-accent)';
    this.shadowRoot.getElementById('meta').textContent = '';
    this.shadowRoot.getElementById('empty-state').style.display = 'none';
    this.shadowRoot.getElementById('body-content').style.display = 'none';
    this.shadowRoot.getElementById('error-body').style.display = 'none';
    this.shadowRoot.getElementById('cancelled-state').style.display = 'none';
    this.shadowRoot.getElementById('loading-state').style.display = 'flex';
    this.shadowRoot.getElementById('preview-wrap').innerHTML =
      `<div class="preview-unsupported"><div>${t('res.noPreview')}</div></div>`;
  }

  setResponse(response, { cached = false } = {}) {
    this.#revokeBlobUrl();
    this.#lastResponse = response;
    this.#lastCached = cached;

    const badge = this.shadowRoot.getElementById('status-badge');
    const copyBtn = this.shadowRoot.getElementById('copy-body-btn');
    const emptyState = this.shadowRoot.getElementById('empty-state');
    const bodyContent = this.shadowRoot.getElementById('body-content');
    const errorBody = this.shadowRoot.getElementById('error-body');
    const headersTbody = this.shadowRoot.getElementById('headers-tbody');

    emptyState.style.display = 'none';
    this.shadowRoot.getElementById('loading-state').style.display = 'none';
    this.shadowRoot.getElementById('cancelled-state').style.display = 'none';

    if (response.cancelled) {
      this.#rawBody = null;
      copyBtn.disabled = true;
      badge.className = 'status-badge visible';
      badge.textContent = t('res.cancelled');
      badge.style.background = 'var(--color-surface-3)';
      badge.style.color = 'var(--color-text-secondary)';
      this.shadowRoot.getElementById('meta').textContent = '';
      bodyContent.style.display = 'none';
      errorBody.style.display = 'none';
      this.shadowRoot.getElementById('cancelled-state').style.display = 'flex';
      return;
    }

    if (response.error) {
      this.#rawBody = null;
      copyBtn.disabled = true;
      badge.className = 'status-badge visible error';
      badge.style.cssText = '';
      bodyContent.style.display = 'none';
      errorBody.style.display = 'block';
      errorBody.textContent = response.error;
      this.shadowRoot.getElementById('preview-wrap').innerHTML =
        `<div class="preview-unsupported"><div>${t('res.failPreview')}</div></div>`;
      this.#refreshMeta();
      return;
    }

    const s = response.status;
    const cls = s >= 500 ? 's5xx' : s >= 400 ? 's4xx' : s >= 300 ? 's3xx' : 's2xx';
    badge.className = `status-badge visible ${cls}`;
    badge.style.cssText = '';
    badge.textContent = `${s} ${response.statusText}`;

    this.#refreshMeta();

    errorBody.style.display = 'none';
    bodyContent.style.display = 'block';
    this.#rawBody = response.body ?? '';
    copyBtn.disabled = false;

    const contentType = response.headers?.['content-type'] ?? '';
    if (contentType.includes('application/json')) {
      try {
        const parsed = JSON.parse(response.body);
        bodyContent.innerHTML = this.#colorizeJson(JSON.stringify(parsed, null, 2));
        bodyContent.className = 'body-content json';
      } catch {
        bodyContent.textContent = response.body;
        bodyContent.className = 'body-content';
      }
    } else {
      bodyContent.textContent = response.body;
      bodyContent.className = 'body-content';
    }

    headersTbody.innerHTML = Object.entries(response.headers ?? {})
      .map(([k, v]) => `<tr><td>${this.#escHtml(k)}</td><td>${this.#escHtml(v)}</td></tr>`)
      .join('');

    this.#renderPreview(response);
  }

  #renderPreview(response) {
    const wrap = this.shadowRoot.getElementById('preview-wrap');
    const contentType = response.headers?.['content-type'] ?? '';

    // Binary content: blobUrl already created by http-client
    if (response.blobUrl) {
      this.#blobUrl = response.blobUrl;
      if (/^image\//i.test(contentType)) {
        wrap.innerHTML = `<img src="${this.#blobUrl}" alt="image preview" />`;
      } else if (/^audio\//i.test(contentType)) {
        wrap.innerHTML = `<audio controls src="${this.#blobUrl}"></audio>`;
      } else if (/^video\//i.test(contentType)) {
        wrap.innerHTML = `<video controls src="${this.#blobUrl}"></video>`;
      } else if (contentType.includes('application/pdf')) {
        wrap.innerHTML = `<iframe src="${this.#blobUrl}" title="PDF preview"></iframe>`;
      } else {
        wrap.innerHTML = `<div class="preview-unsupported"><div>${t('res.unsupportedBinary')}</div><code>${this.#escHtml(contentType)}</code></div>`;
      }
      return;
    }

    // Text-based previewable types
    if (contentType.includes('text/html')) {
      const blob = new Blob([response.body], { type: 'text/html' });
      this.#blobUrl = URL.createObjectURL(blob);
      wrap.innerHTML = `<iframe src="${this.#blobUrl}" sandbox="allow-same-origin" title="HTML preview"></iframe>`;
      return;
    }

    if (contentType.includes('image/svg+xml')) {
      const blob = new Blob([response.body], { type: 'image/svg+xml' });
      this.#blobUrl = URL.createObjectURL(blob);
      wrap.innerHTML = `<img src="${this.#blobUrl}" alt="SVG preview" />`;
      return;
    }

    wrap.innerHTML = `<div class="preview-unsupported"><div>${t('res.unsupportedPreview')}</div>${contentType ? `<code>${this.#escHtml(contentType)}</code>` : ''}</div>`;
  }

  #formatSize(bytes) {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  #escHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  #colorizeJson(json) {
    return json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          let cls = 'number';
          if (/^"/.test(match)) {
            cls = /:$/.test(match) ? 'key' : 'string';
          } else if (/true|false/.test(match)) {
            cls = 'boolean';
          } else if (/null/.test(match)) {
            cls = 'null';
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );
  }
}

customElements.define('response-viewer', ResponseViewer);
