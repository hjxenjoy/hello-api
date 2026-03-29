// <response-viewer> Web Component - response display (status, timing, body)

const ICON_RESPONSE = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10H10a4 4 0 000 8h4"/><path d="M10 14l-4 4 4 4"/></svg>`;

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
    .body-content.json .string { color: #86efac; }
    .body-content.json .number { color: #93c5fd; }
    .body-content.json .boolean { color: #fbbf24; }
    .body-content.json .null { color: #f87171; }
    .body-content.json .key { color: #c4b5fd; }
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
    }
  </style>
  <div class="toolbar">
    <span class="title">响应</span>
    <div class="status-badge" id="status-badge"></div>
    <div class="meta" id="meta"></div>
  </div>
  <div class="tabs" id="tabs">
    <div class="tab active" data-tab="body">Body</div>
    <div class="tab" data-tab="headers">Headers</div>
  </div>
  <div class="panel active" id="panel-body">
    <div class="empty-state" id="empty-state">
      <div class="empty-icon">${ICON_RESPONSE}</div>
      <div>发送请求后查看响应</div>
    </div>
    <div class="body-content" id="body-content" style="display:none"></div>
    <div class="error-body" id="error-body" style="display:none"></div>
  </div>
  <div class="panel" id="panel-headers">
    <table class="headers-table" id="headers-table">
      <thead><tr><th>名称</th><th>值</th></tr></thead>
      <tbody id="headers-tbody"></tbody>
    </table>
  </div>
`;

class ResponseViewer extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      this.#bindTabs();
    }
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
    });
  }

  setLoading() {
    const badge = this.shadowRoot.getElementById('status-badge');
    badge.className = 'status-badge visible';
    badge.textContent = '发送中…';
    badge.style.background = 'var(--color-accent-muted)';
    badge.style.color = 'var(--color-accent)';
    this.shadowRoot.getElementById('meta').textContent = '';
    this.shadowRoot.getElementById('empty-state').style.display = 'none';
    this.shadowRoot.getElementById('body-content').style.display = 'none';
    this.shadowRoot.getElementById('error-body').style.display = 'none';
  }

  setResponse(response) {
    const badge = this.shadowRoot.getElementById('status-badge');
    const meta = this.shadowRoot.getElementById('meta');
    const emptyState = this.shadowRoot.getElementById('empty-state');
    const bodyContent = this.shadowRoot.getElementById('body-content');
    const errorBody = this.shadowRoot.getElementById('error-body');
    const headersTbody = this.shadowRoot.getElementById('headers-tbody');

    emptyState.style.display = 'none';

    if (response.error) {
      badge.className = 'status-badge visible error';
      badge.style.cssText = '';
      badge.textContent = '错误';
      meta.innerHTML = `<span class="meta-item">耗时 <span>${response.duration}ms</span></span>`;
      bodyContent.style.display = 'none';
      errorBody.style.display = 'block';
      errorBody.textContent = response.error;
      return;
    }

    const s = response.status;
    const cls = s >= 500 ? 's5xx' : s >= 400 ? 's4xx' : s >= 300 ? 's3xx' : 's2xx';
    badge.className = `status-badge visible ${cls}`;
    badge.style.cssText = '';
    badge.textContent = `${s} ${response.statusText}`;

    meta.innerHTML = [
      `<span class="meta-item">耗时 <span>${response.duration}ms</span></span>`,
      `<span class="meta-item">大小 <span>${this.#formatSize(response.size)}</span></span>`,
    ].join('');

    errorBody.style.display = 'none';
    bodyContent.style.display = 'block';

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
