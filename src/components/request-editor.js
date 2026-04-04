// <request-editor> Web Component - request builder (Method, URL, Headers, Body)

const ICON_CROSS = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M2 2l6 6M8 2l-6 6"/></svg>`;
const ICON_CURL = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="2" width="10" height="9" rx="1.5"/><path d="M3.5 6.5l2 1.5-2 1.5"/><path d="M7.5 9.5h2"/></svg>`;
const ICON_CURL_IN = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="2" width="10" height="9" rx="1.5"/><path d="M6.5 4.5v4"/><path d="M4.5 7l2 2 2-2"/></svg>`;

import { sendRequest } from '../core/http-client.js';
import { interpolateRequest, envToVariables } from '../core/interpolation.js';
import { updateRequest, saveRequestResponse } from '../db/requests.js';
import { addHistory } from '../db/history.js';
import { parseCurl } from '../core/curl-parser.js';
import { showConfirm, showForm } from '../core/dialog.js';
import { t, applyI18n } from '../core/i18n.js';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const RAW_CONTENT_TYPES = [
  'text/plain',
  'application/json',
  'application/xml',
  'text/html',
  'application/javascript',
  'text/css',
];

const METHOD_COLORS = {
  GET: '#22c55e',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  PATCH: '#8b5cf6',
  DELETE: '#ef4444',
  HEAD: '#06b6d4',
  OPTIONS: '#64748b',
};

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
    .url-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }
    .request-name {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-secondary);
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .request-name-input {
      background: none;
      border: none;
      outline: none;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-primary);
      flex: 1;
      min-width: 0;
    }
    .request-name-input::placeholder { color: var(--color-text-tertiary); }
    .desc-bar {
      padding: 0 12px 5px;
      flex-shrink: 0;
      display: none;
    }
    .desc-input {
      width: 100%;
      background: none;
      border: none;
      outline: none;
      font-size: 12px;
      color: var(--color-text-secondary);
      font-family: var(--font-sans);
      box-sizing: border-box;
    }
    .desc-input::placeholder { color: var(--color-text-tertiary); font-style: italic; }
    select.method {
      appearance: none;
      border: 1px solid var(--color-input-border);
      background: var(--color-input-bg);
      border-radius: 4px;
      padding: 6px 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      outline: none;
      min-width: 90px;
    }
    select.method:focus { border-color: var(--color-accent); }
    .url-input {
      flex: 1;
      border: 1px solid var(--color-input-border);
      background: var(--color-input-bg);
      border-radius: 4px;
      padding: 6px 10px;
      font-size: 13px;
      font-family: var(--font-mono);
      color: var(--color-text-primary);
      outline: none;
    }
    .url-input::placeholder { color: var(--color-input-placeholder); font-family: var(--font-sans); }
    .url-input:focus { border-color: var(--color-input-border-focus); }
    .send-btn {
      padding: 6px 16px;
      background: var(--color-accent);
      color: #fff;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: background 0.15s;
      white-space: nowrap;
    }
    .send-btn:hover { background: var(--color-accent-hover); }
    .send-btn:disabled { opacity: 0.6; cursor: not-allowed; }
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
      position: relative;
    }
    .tab:hover { color: var(--color-text-primary); }
    .tab.active { color: var(--color-accent); border-bottom-color: var(--color-accent); }
    .tab .count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      font-size: 10px;
      background: var(--color-accent-muted);
      color: var(--color-accent);
      border-radius: 9999px;
      margin-left: 4px;
    }
    .panel { display: none; flex: 1; min-height: 0; overflow-y: auto; padding: 8px; }
    .panel.active { display: flex; flex-direction: column; gap: 4px; }
    .kv-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .kv-row {
      display: grid;
      grid-template-columns: 24px 1fr 1fr 28px;
      gap: 4px;
      align-items: center;
      min-width: 0;
    }
    .kv-check { width: 14px; height: 14px; cursor: pointer; accent-color: var(--color-accent); flex-shrink: 0; }
    .kv-input {
      border: 1px solid var(--color-input-border);
      background: var(--color-input-bg);
      border-radius: 3px;
      padding: 4px 8px;
      font-size: 12px;
      font-family: var(--font-mono);
      color: var(--color-text-primary);
      outline: none;
      min-width: 0;
    }
    .kv-input::placeholder { color: var(--color-input-placeholder); font-family: var(--font-sans); }
    .kv-input:focus { border-color: var(--color-input-border-focus); }
    .kv-del {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-tertiary);
      cursor: pointer;
      border-radius: 3px;
    }
    .kv-del:hover { color: var(--color-error); background: var(--color-error-muted); }
    .add-row-btn {
      align-self: flex-start;
      margin-top: 4px;
      padding: 4px 10px;
      font-size: 12px;
      color: var(--color-accent);
      border: 1px dashed var(--color-accent);
      border-radius: 3px;
      background: none;
      cursor: pointer;
      transition: background 0.15s;
    }
    .add-row-btn:hover { background: var(--color-accent-muted); }
    .body-type-bar {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }
    .body-type-btn {
      padding: 3px 10px;
      font-size: 12px;
      border-radius: 9999px;
      border: 1px solid var(--color-border);
      background: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all 0.15s;
    }
    .body-type-btn.active {
      background: var(--color-accent-muted);
      color: var(--color-accent);
      border-color: var(--color-accent);
    }
    .body-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-height: 0;
    }
    .body-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-tertiary);
      font-size: 12px;
    }
    .raw-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .raw-bar-label {
      font-size: 12px;
      color: var(--color-text-secondary);
      white-space: nowrap;
    }
    select.raw-type {
      flex: 1;
      border: 1px solid var(--color-input-border);
      background: var(--color-input-bg);
      border-radius: 3px;
      padding: 4px 6px;
      font-size: 12px;
      font-family: var(--font-mono);
      color: var(--color-text-primary);
      outline: none;
      cursor: pointer;
    }
    select.raw-type:focus { border-color: var(--color-input-border-focus); }
    .json-toolbar {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      flex-shrink: 0;
    }
    .json-format-btn {
      padding: 2px 8px;
      font-size: 11px;
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
      border-radius: 3px;
      background: none;
      cursor: pointer;
      transition: all 0.15s;
    }
    .json-format-btn:hover {
      color: var(--color-text-primary);
      background: var(--color-surface-3);
      border-color: var(--color-border-strong);
    }
    .curl-import-btn {
      padding: 6px 10px;
      background: var(--color-surface-2);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .curl-import-btn:hover {
      color: var(--color-text-primary);
      background: var(--color-surface-3);
      border-color: var(--color-border-strong);
    }
    .import-notice {
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 500;
      flex-shrink: 0;
      display: none;
    }
    .import-notice.success {
      display: block;
      color: #22c55e;
      background: rgba(34, 197, 94, 0.08);
      border-bottom: 1px solid rgba(34, 197, 94, 0.2);
    }
    .import-notice.error {
      display: block;
      color: var(--color-error);
      background: var(--color-error-muted);
      border-bottom: 1px solid rgba(239, 68, 68, 0.2);
    }
    .cancel-btn {
      display: none;
      padding: 6px 12px;
      background: transparent;
      color: var(--color-error);
      border: 1px solid var(--color-error);
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
      white-space: nowrap;
    }
    .cancel-btn.visible { display: block; }
    .cancel-btn:hover { background: var(--color-error-muted); }
    .cm-container {
      flex: 1;
      min-height: 120px;
      border: 1px solid var(--color-input-border);
      border-radius: 4px;
      overflow: hidden;
      font-size: 12px;
    }
    .cm-container:focus-within {
      border-color: var(--color-input-border-focus);
    }
    .cm-container .cm-editor {
      height: 100%;
    }
    .cm-container .cm-scroller {
      font-family: var(--font-mono);
      font-size: 12px;
      line-height: 1.6;
    }
    .cm-loading {
      height: 100%;
      min-height: 120px;
      background: var(--color-input-bg);
      position: relative;
      overflow: hidden;
    }
    .cm-loading::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        var(--color-surface-3) 50%,
        transparent 100%
      );
      animation: cm-shimmer 1.4s ease-in-out infinite;
    }
    @keyframes cm-shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .body-textarea {
      flex: 1;
      border: 1px solid var(--color-input-border);
      background: var(--color-input-bg);
      border-radius: 4px;
      padding: 8px;
      font-size: 12px;
      font-family: var(--font-mono);
      color: var(--color-text-primary);
      resize: none;
      outline: none;
      line-height: 1.6;
      min-height: 120px;
    }
    .body-textarea:focus { border-color: var(--color-input-border-focus); }
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      color: var(--color-text-tertiary);
      font-size: 12px;
    }
    .curl-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 10px;
      background: var(--color-surface-2);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .curl-btn:hover {
      color: var(--color-text-primary);
      background: var(--color-surface-3);
      border-color: var(--color-border-strong);
    }
    .tab .dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-accent);
      margin-left: 4px;
      vertical-align: middle;
    }
    .auth-type-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .auth-type-label {
      font-size: 12px;
      color: var(--color-text-secondary);
      white-space: nowrap;
    }
    select.auth-type-select {
      border: 1px solid var(--color-input-border);
      background: var(--color-input-bg);
      border-radius: 4px;
      padding: 5px 8px;
      font-size: 12px;
      color: var(--color-text-primary);
      outline: none;
      cursor: pointer;
    }
    select.auth-type-select:focus { border-color: var(--color-input-border-focus); }
    .auth-fields { flex: 1; min-height: 0; overflow-y: auto; }
    .auth-empty {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-tertiary);
      font-size: 12px;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 4px 0;
    }
    .auth-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .auth-label {
      font-size: 11px;
      color: var(--color-text-secondary);
      font-weight: 500;
    }
    .auth-input {
      border: 1px solid var(--color-input-border);
      background: var(--color-input-bg);
      border-radius: 4px;
      padding: 6px 10px;
      font-size: 12px;
      font-family: var(--font-mono);
      color: var(--color-text-primary);
      outline: none;
    }
    .auth-input:focus { border-color: var(--color-input-border-focus); }
    select.auth-in-select {
      border: 1px solid var(--color-input-border);
      background: var(--color-input-bg);
      border-radius: 4px;
      padding: 5px 8px;
      font-size: 12px;
      color: var(--color-text-primary);
      outline: none;
      cursor: pointer;
    }
    select.auth-in-select:focus { border-color: var(--color-input-border-focus); }
  </style>
  <div class="request-name" id="name-bar" style="display:none">
    <input class="request-name-input" id="name-input" data-i18n-placeholder="req.namePlaceholder" placeholder="请求名称" />
  </div>
  <div class="desc-bar" id="desc-bar">
    <input class="desc-input" id="desc-input" data-i18n-placeholder="req.descPlaceholder" placeholder="添加备注…" />
  </div>
  <div class="url-bar">
    <select class="method" id="method-select"></select>
    <input class="url-input" id="url-input" placeholder="https://api.example.com/endpoint" />
    <button class="send-btn" id="send-btn" data-i18n="req.send">发送</button>
    <button class="cancel-btn" id="cancel-btn" data-i18n="req.cancel">取消</button>
    <button class="curl-btn" id="curl-btn" data-i18n-title="req.copyAsCurl" title="复制为 cURL">${ICON_CURL}</button>
    <button class="curl-import-btn" id="curl-import-btn" data-i18n-title="req.importCurlBtn" title="从 cURL 导入">${ICON_CURL_IN}</button>
  </div>
  <div class="import-notice" id="import-notice"></div>
  <div class="tabs" id="tabs">
    <div class="tab active" data-tab="params">Params</div>
    <div class="tab" data-tab="headers">Headers</div>
    <div class="tab" data-tab="body">Body</div>
    <div class="tab" data-tab="auth">Auth</div>
  </div>
  <div class="panel active" id="panel-params">
    <div class="kv-list" id="params-list"></div>
    <button class="add-row-btn" id="add-param-btn" data-i18n="req.addParam">+ 添加参数</button>
  </div>
  <div class="panel" id="panel-headers">
    <div class="kv-list" id="headers-list"></div>
    <button class="add-row-btn" id="add-header-btn" data-i18n="req.addHeader">+ 添加 Header</button>
  </div>
  <div class="panel" id="panel-body">
    <div class="body-type-bar" id="body-type-bar">
      <button class="body-type-btn active" data-type="none" data-i18n="req.bodyNone">无</button>
      <button class="body-type-btn" data-type="json">JSON</button>
      <button class="body-type-btn" data-type="form-urlencoded">Form</button>
      <button class="body-type-btn" data-type="raw">Raw</button>
    </div>
    <div class="body-area" id="body-area"></div>
  </div>
  <div class="panel" id="panel-auth">
    <div class="auth-type-row">
      <span class="auth-type-label" data-i18n="req.authType">认证类型</span>
      <select class="auth-type-select" id="auth-type">
        <option value="none" data-i18n="req.authNone">无</option>
        <option value="bearer">Bearer Token</option>
        <option value="basic">Basic Auth</option>
        <option value="apikey">API Key</option>
      </select>
    </div>
    <div class="auth-fields" id="auth-fields"></div>
  </div>
`;

class RequestEditor extends HTMLElement {
  #request = null;
  #environment = null;
  #saveTimer = null;
  #cmEditor = null;
  #i18nHandler = null;
  #abortController = null;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      this.#init();
      this.#applyI18n();
    }
    this.#i18nHandler = () => this.#applyI18n();
    window.addEventListener('locale-changed', this.#i18nHandler);
  }

  disconnectedCallback() {
    window.removeEventListener('locale-changed', this.#i18nHandler);
  }

  #applyI18n() {
    if (!this.shadowRoot) return;
    applyI18n(this.shadowRoot);
    // Re-render dynamic areas if currently visible
    if (this.#request) {
      if (this.shadowRoot.getElementById('panel-body')?.classList.contains('active')) {
        if (!this.#cmEditor) this.#renderBodyArea();
        else {
          // CodeMirror is active — just update the format button text
          const fmtBtn = this.shadowRoot.querySelector('.json-format-btn');
          if (fmtBtn) fmtBtn.textContent = t('req.formatJson');
        }
      }
      if (this.shadowRoot.getElementById('panel-auth')?.classList.contains('active')) {
        this.#renderAuthPanel();
      }
    }
  }

  #init() {
    // Method select options
    const sel = this.shadowRoot.getElementById('method-select');
    for (const m of METHODS) {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      opt.style.color = METHOD_COLORS[m] ?? 'inherit';
      sel.appendChild(opt);
    }
    sel.addEventListener('change', () => {
      sel.style.color = METHOD_COLORS[sel.value] ?? 'inherit';
      this.#scheduleSave();
    });

    // Tabs
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
      // Render body area only when panel is visible (CodeMirror needs a sized container)
      if (name === 'body' && this.#request) this.#renderBodyArea();
      if (name === 'auth' && this.#request) this.#renderAuthPanel();
    });

    // Body type switching
    this.shadowRoot.getElementById('body-type-bar').addEventListener('click', (e) => {
      const btn = e.target.closest('.body-type-btn');
      if (!btn) return;
      const type = btn.dataset.type;
      this.shadowRoot
        .querySelectorAll('.body-type-btn')
        .forEach((b) => b.classList.toggle('active', b === btn));

      if (this.#request) {
        // Capture current body values before switching
        const prevType = this.#request.body?.type;
        if (prevType === 'json' && this.#cmEditor) {
          this.#request.body.content = this.#cmEditor.state.doc.toString();
        } else if (prevType === 'raw') {
          const ta = this.shadowRoot.getElementById('body-textarea');
          if (ta) this.#request.body.content = ta.value;
          const rs = this.shadowRoot.getElementById('raw-type-select');
          if (rs) this.#request.body.contentType = rs.value;
        }
        this.#request.body.type = type;
        if (type === 'form-urlencoded' && !Array.isArray(this.#request.body.pairs)) {
          this.#request.body.pairs = [];
        }
      }

      this.#renderBodyArea();
      this.#scheduleSave();
    });

    // Send
    this.shadowRoot.getElementById('send-btn').addEventListener('click', () => this.#send());

    // Keyboard shortcut: ⌘+Enter / Ctrl+Enter
    this.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        this.#send();
      }
    });

    // URL auto-save; if name is still auto-derived, keep it in sync with URL
    this.shadowRoot.getElementById('url-input').addEventListener('input', () => {
      if (this.#request?.nameIsAuto) {
        const url = this.shadowRoot.getElementById('url-input').value.trim();
        this.shadowRoot.getElementById('name-input').value = url || t('req.namePlaceholder');
      }
      this.#scheduleSave();
    });

    // Name save; manual edit locks auto-name
    this.shadowRoot.getElementById('name-input').addEventListener('input', () => {
      if (this.#request) this.#request.nameIsAuto = false;
      this.#scheduleSave();
    });

    // Description save
    this.shadowRoot
      .getElementById('desc-input')
      .addEventListener('input', () => this.#scheduleSave());

    // Auth type change
    this.shadowRoot.getElementById('auth-type').addEventListener('change', (e) => {
      if (!this.#request) return;
      this.#request.auth = { type: e.target.value };
      this.#renderAuthPanel();
      this.#updateAuthDot();
      this.#scheduleSave();
    });

    // Cancel in-flight request
    this.shadowRoot.getElementById('cancel-btn').addEventListener('click', () => {
      this.#abortController?.abort();
    });

    // Import from cURL — button opens dialog
    this.shadowRoot.getElementById('curl-import-btn').addEventListener('click', async () => {
      const result = await showForm(
        t('req.importCurlTitle'),
        [
          {
            id: 'curl',
            label: t('req.importCurlLabel'),
            placeholder: t('req.importCurlPlaceholder'),
            type: 'textarea',
          },
        ],
        { confirmLabel: t('req.importCurlConfirm') }
      );
      if (result?.curl) this.#importFromCurl(result.curl);
    });

    // Import from cURL — paste detection in URL input
    this.shadowRoot.getElementById('url-input').addEventListener('paste', (e) => {
      const text = e.clipboardData?.getData('text') ?? '';
      if (/^curl\b/i.test(text.trim())) {
        e.preventDefault();
        this.#importFromCurl(text);
      }
    });

    // Copy as cURL
    this.shadowRoot.getElementById('curl-btn').addEventListener('click', async () => {
      const cmd = this.#buildCurlCommand();
      await navigator.clipboard.writeText(cmd);
      const btn = this.shadowRoot.getElementById('curl-btn');
      btn.title = t('req.curlCopied');
      setTimeout(() => (btn.title = t('req.copyAsCurl')), 2000);
    });

    // Add param/header
    this.shadowRoot.getElementById('add-param-btn').addEventListener('click', () => {
      if (this.#request) this.#request.params.push({ key: '', value: '', enabled: true });
      this.#renderKvList('params');
      this.#scheduleSave();
    });
    this.shadowRoot.getElementById('add-header-btn').addEventListener('click', () => {
      if (this.#request) this.#request.headers.push({ key: '', value: '', enabled: true });
      this.#renderKvList('headers');
      this.#scheduleSave();
    });
  }

  loadRequest(request, environment = null) {
    this.#request = {
      ...request,
      headers: [...(request.headers ?? [])],
      params: [...(request.params ?? [])],
      body: {
        type: request.body?.type ?? 'none',
        content: request.body?.content ?? '',
        contentType: request.body?.contentType ?? 'text/plain',
        pairs: Array.isArray(request.body?.pairs) ? [...request.body.pairs] : [],
      },
      auth: request.auth ? { ...request.auth } : { type: 'none' },
    };
    this.#environment = environment;

    const nameBar = this.shadowRoot.getElementById('name-bar');
    nameBar.style.display = 'flex';
    this.shadowRoot.getElementById('name-input').value = request.name ?? '';
    this.shadowRoot.getElementById('desc-bar').style.display = 'block';
    this.shadowRoot.getElementById('desc-input').value = request.description ?? '';

    const sel = this.shadowRoot.getElementById('method-select');
    sel.value = request.method ?? 'GET';
    sel.style.color = METHOD_COLORS[sel.value] ?? 'inherit';

    this.shadowRoot.getElementById('url-input').value = request.url ?? '';

    this.#renderKvList('params');
    this.#renderKvList('headers');

    // Destroy any existing editor — new request content must be loaded fresh
    if (this.#cmEditor) {
      this.#cmEditor.destroy();
      this.#cmEditor = null;
    }

    const bodyType = this.#request.body.type;
    this.shadowRoot.querySelectorAll('.body-type-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.type === bodyType);
    });
    // Only render body area when the panel is already visible
    if (this.shadowRoot.getElementById('panel-body')?.classList.contains('active')) {
      this.#renderBodyArea();
    }

    // Sync auth panel if already visible
    if (this.shadowRoot.getElementById('panel-auth')?.classList.contains('active')) {
      this.#renderAuthPanel();
    }
    this.#updateAuthDot();
  }

  setEnvironment(environment) {
    this.#environment = environment;
  }

  #renderBodyArea() {
    const type = this.#request?.body?.type ?? 'none';

    // Reuse existing json editor when switching back to the Body tab
    if (type === 'json' && this.#cmEditor) return;

    // Destroy any existing CodeMirror instance before clearing the DOM
    if (this.#cmEditor) {
      this.#cmEditor.destroy();
      this.#cmEditor = null;
    }

    const area = this.shadowRoot.getElementById('body-area');
    area.innerHTML = '';

    if (type === 'none') {
      const el = document.createElement('div');
      el.className = 'body-empty';
      el.textContent = t('req.bodyNoneHint');
      area.appendChild(el);
      return;
    }

    if (type === 'form-urlencoded') {
      this.#renderFormPairs();
      return;
    }

    if (type === 'json') {
      const toolbar = document.createElement('div');
      toolbar.className = 'json-toolbar';
      const fmtBtn = document.createElement('button');
      fmtBtn.className = 'json-format-btn';
      fmtBtn.textContent = t('req.formatJson');
      fmtBtn.addEventListener('click', () => this.#formatJson());
      toolbar.appendChild(fmtBtn);
      area.appendChild(toolbar);

      const container = document.createElement('div');
      container.className = 'cm-container';
      area.appendChild(container);
      this.#createJsonEditor(container, this.#request.body.content ?? '');
      return;
    }

    if (type === 'raw') {
      const rawBar = document.createElement('div');
      rawBar.className = 'raw-bar';

      const label = document.createElement('span');
      label.className = 'raw-bar-label';
      label.textContent = 'Content-Type';

      const sel = document.createElement('select');
      sel.className = 'raw-type';
      sel.id = 'raw-type-select';
      for (const ct of RAW_CONTENT_TYPES) {
        const opt = document.createElement('option');
        opt.value = ct;
        opt.textContent = ct;
        if (ct === (this.#request.body.contentType ?? 'text/plain')) opt.selected = true;
        sel.appendChild(opt);
      }
      sel.addEventListener('change', () => this.#scheduleSave());

      rawBar.appendChild(label);
      rawBar.appendChild(sel);
      area.appendChild(rawBar);
    }

    // json or raw: textarea
    const textarea = document.createElement('textarea');
    textarea.className = 'body-textarea';
    textarea.id = 'body-textarea';
    textarea.placeholder = type === 'json' ? 'JSON 内容' : '请求体内容';
    textarea.value = this.#request.body.content ?? '';
    textarea.addEventListener('input', () => this.#scheduleSave());
    area.appendChild(textarea);
  }

  async #createJsonEditor(container, initialValue) {
    const loadingEl = document.createElement('div');
    loadingEl.className = 'cm-loading';
    container.appendChild(loadingEl);
    try {
      const [viewMod, cmdsMod, { json }, { oneDark }, langMod, acMod] = await Promise.all([
        import('@codemirror/view'),
        import('@codemirror/commands'),
        import('@codemirror/lang-json'),
        import('@codemirror/theme-one-dark'),
        import('@codemirror/language'),
        import('@codemirror/autocomplete'),
      ]);
      // esm.sh may wrap exports in .default on some builds
      const {
        EditorView,
        keymap,
        lineNumbers,
        highlightActiveLine,
        drawSelection,
        rectangularSelection,
      } = viewMod.default ?? viewMod;
      const { defaultKeymap, historyKeymap, history, indentWithTab } = cmdsMod.default ?? cmdsMod;
      const { syntaxHighlighting, defaultHighlightStyle, bracketMatching, indentOnInput } =
        langMod.default ?? langMod;
      const { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } =
        acMod.default ?? acMod;

      const basicSetup = [
        lineNumbers(),
        highlightActiveLine(),
        drawSelection(),
        history(),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          ...completionKeymap,
          indentWithTab,
        ]),
      ];

      // Guard: body type may have changed while loading
      if (this.#request?.body?.type !== 'json') return;
      loadingEl.remove();

      const isDark =
        document.documentElement.dataset.theme === 'dark' ||
        (!document.documentElement.dataset.theme &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);

      const extensions = [
        basicSetup,
        json(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) this.#scheduleSave();
        }),
        EditorView.theme({
          '&': { height: '100%', backgroundColor: 'var(--color-input-bg)' },
          '&.cm-focused': { outline: 'none' },
          '.cm-gutters': {
            backgroundColor: 'var(--color-surface-2)',
            borderRight: '1px solid var(--color-border)',
            color: 'var(--color-text-tertiary)',
          },
          '.cm-activeLineGutter': { backgroundColor: 'var(--color-surface-3)' },
          '.cm-activeLine': { backgroundColor: 'var(--color-bg-subtle)' },
        }),
      ];
      if (isDark) extensions.push(oneDark);

      this.#cmEditor = new EditorView({
        doc: initialValue,
        extensions,
        parent: container,
        // Must pass the shadow root so CodeMirror injects its styles here
        // instead of document.head (which doesn't apply inside Shadow DOM)
        root: this.shadowRoot,
      });
    } catch (err) {
      console.error('[CodeMirror] init failed:', err);
      loadingEl.remove();
      // Fallback to plain textarea when CDN unavailable
      if (this.#request?.body?.type !== 'json') return;
      const area = this.shadowRoot.getElementById('body-area');
      const container2 = area?.querySelector('.cm-container');
      if (!container2) return;
      container2.innerHTML = '';
      const ta = document.createElement('textarea');
      ta.className = 'body-textarea';
      ta.id = 'body-textarea';
      ta.placeholder = t('req.bodyJson');
      ta.value = this.#request.body.content ?? '';
      ta.addEventListener('input', () => this.#scheduleSave());
      container2.appendChild(ta);
    }
  }

  #formatJson() {
    if (!this.#cmEditor) return;
    const content = this.#cmEditor.state.doc.toString();
    try {
      const formatted = JSON.stringify(JSON.parse(content), null, 2);
      this.#cmEditor.dispatch({
        changes: { from: 0, to: this.#cmEditor.state.doc.length, insert: formatted },
      });
      this.#scheduleSave();
    } catch {
      // Invalid JSON — ignore silently
    }
  }

  #renderFormPairs() {
    const area = this.shadowRoot.getElementById('body-area');
    area.innerHTML = '';

    const pairs = this.#request.body.pairs ?? [];

    const list = document.createElement('div');
    list.className = 'kv-list';

    pairs.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'kv-row';
      row.innerHTML = `
        <input type="checkbox" class="kv-check" ${item.enabled !== false ? 'checked' : ''} />
        <input class="kv-input" placeholder="${this.#esc(t('req.authKey'))}" value="${this.#esc(item.key)}" />
        <input class="kv-input" placeholder="${this.#esc(t('req.authValue'))}" value="${this.#esc(item.value ?? '')}" />
        <div class="kv-del">${ICON_CROSS}</div>
      `;
      row.querySelector('.kv-check').addEventListener('change', (e) => {
        pairs[i].enabled = e.target.checked;
        this.#scheduleSave();
      });
      row.querySelectorAll('.kv-input')[0].addEventListener('input', (e) => {
        pairs[i].key = e.target.value;
        this.#scheduleSave();
      });
      row.querySelectorAll('.kv-input')[1].addEventListener('input', (e) => {
        pairs[i].value = e.target.value;
        this.#scheduleSave();
      });
      row.querySelector('.kv-del').addEventListener('click', () => {
        pairs.splice(i, 1);
        this.#renderFormPairs();
        this.#scheduleSave();
      });
      list.appendChild(row);
    });

    area.appendChild(list);

    const addBtn = document.createElement('button');
    addBtn.className = 'add-row-btn';
    addBtn.textContent = t('req.addFormField');
    addBtn.addEventListener('click', () => {
      this.#request.body.pairs.push({ key: '', value: '', enabled: true });
      this.#renderFormPairs();
      this.#scheduleSave();
    });
    area.appendChild(addBtn);
  }

  #renderKvList(type) {
    const list = this.shadowRoot.getElementById(`${type}-list`);
    const items = this.#request?.[type] ?? [];
    list.innerHTML = '';
    items.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'kv-row';
      row.innerHTML = `
        <input type="checkbox" class="kv-check" ${item.enabled !== false ? 'checked' : ''} />
        <input class="kv-input" placeholder="${this.#esc(t('res.headerName'))}" value="${this.#esc(item.key)}" />
        <input class="kv-input" placeholder="${this.#esc(t('res.headerValue'))}" value="${this.#esc(item.value ?? '')}" />
        <div class="kv-del">${ICON_CROSS}</div>
      `;
      row.querySelector('.kv-check').addEventListener('change', (e) => {
        items[i].enabled = e.target.checked;
        this.#scheduleSave();
      });
      row.querySelectorAll('.kv-input')[0].addEventListener('input', (e) => {
        items[i].key = e.target.value;
        this.#scheduleSave();
      });
      row.querySelectorAll('.kv-input')[1].addEventListener('input', (e) => {
        items[i].value = e.target.value;
        this.#scheduleSave();
      });
      row.querySelector('.kv-del').addEventListener('click', () => {
        items.splice(i, 1);
        this.#renderKvList(type);
        this.#scheduleSave();
      });
      list.appendChild(row);
    });
  }

  #buildCurrentRequest() {
    const method = this.shadowRoot.getElementById('method-select').value;
    const url = this.shadowRoot.getElementById('url-input').value;
    const name = this.shadowRoot.getElementById('name-input').value;
    const activeType =
      this.shadowRoot.querySelector('.body-type-btn.active')?.dataset.type ?? 'none';

    const body = { type: activeType };
    if (activeType === 'form-urlencoded') {
      body.pairs = this.#request?.body?.pairs ?? [];
    } else if (activeType === 'raw') {
      body.content = this.shadowRoot.getElementById('body-textarea')?.value ?? '';
      body.contentType =
        this.shadowRoot.getElementById('raw-type-select')?.value ??
        this.#request?.body?.contentType ??
        'text/plain';
    } else if (activeType === 'json') {
      body.content = this.#cmEditor
        ? this.#cmEditor.state.doc.toString()
        : (this.shadowRoot.getElementById('body-textarea')?.value ?? '');
    } else if (activeType !== 'none') {
      body.content = this.shadowRoot.getElementById('body-textarea')?.value ?? '';
    }

    const description = this.shadowRoot.getElementById('desc-input')?.value ?? '';

    return {
      ...this.#request,
      name,
      method,
      url,
      description,
      headers: this.#request?.headers ?? [],
      params: this.#request?.params ?? [],
      body,
    };
  }

  #scheduleSave() {
    clearTimeout(this.#saveTimer);
    this.#saveTimer = setTimeout(() => this.#save(), 800);
  }

  async #save() {
    if (!this.#request?.id) return;
    const prevName = this.#request.name;
    const data = this.#buildCurrentRequest();
    try {
      await updateRequest(this.#request.id, data);
      this.#request = data;
      if (data.name !== prevName) {
        this.dispatchEvent(
          new CustomEvent('request-name-changed', {
            detail: { id: data.id, name: data.name },
            bubbles: true,
            composed: true,
          })
        );
      }
    } catch {
      // ignore save errors silently
    }
  }

  async #send() {
    if (!this.shadowRoot) return;
    const btn = this.shadowRoot.getElementById('send-btn');
    const cancelBtn = this.shadowRoot.getElementById('cancel-btn');
    btn.disabled = true;
    btn.textContent = t('req.sending');
    cancelBtn.classList.add('visible');

    this.#abortController = new AbortController();
    this.dispatchEvent(new CustomEvent('request-sending', { bubbles: true, composed: true }));

    const req = this.#buildCurrentRequest();

    // Validate JSON body before sending
    if (req.body?.type === 'json' && req.body?.content?.trim()) {
      try {
        JSON.parse(req.body.content);
      } catch {
        const confirmed = await showConfirm(t('req.jsonInvalidMsg'), {
          title: t('req.jsonInvalidTitle'),
          confirmLabel: t('req.jsonInvalidSend'),
        });
        if (!confirmed) {
          btn.disabled = false;
          btn.textContent = t('req.send');
          cancelBtn.classList.remove('visible');
          this.#abortController = null;
          return;
        }
      }
    }

    const vars = envToVariables(this.#environment);
    const interpolated = interpolateRequest(req, vars);
    const withAuth = this.#applyAuth(interpolated);

    const response = await sendRequest({ ...withAuth, signal: this.#abortController.signal });

    btn.disabled = false;
    btn.textContent = t('req.send');
    cancelBtn.classList.remove('visible');
    this.#abortController = null;

    // Persist and record history for non-cancelled responses
    if (this.#request?.id && !response.cancelled) {
      const { blobUrl, ...storable } = response;
      const requestedAt = Date.now();
      storable.requestedAt = requestedAt;

      if (!response.error) {
        saveRequestResponse(this.#request.id, storable).catch(() => {});
      }

      addHistory({
        requestId: this.#request.id,
        requestedAt,
        method: req.method,
        url: req.url,
        status: response.status ?? null,
        duration: response.duration,
        size: response.size ?? null,
        response: storable,
      }).catch(() => {});
    }

    this.dispatchEvent(
      new CustomEvent('request-response', {
        detail: response,
        bubbles: true,
        composed: true,
      })
    );
  }

  #esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }

  #renderAuthPanel() {
    const type = this.#request?.auth?.type ?? 'none';
    this.shadowRoot.getElementById('auth-type').value = type;
    const fields = this.shadowRoot.getElementById('auth-fields');
    fields.innerHTML = '';

    if (type === 'none') {
      const el = document.createElement('div');
      el.className = 'auth-empty';
      el.textContent = t('req.authEmpty');
      fields.appendChild(el);
      return;
    }

    const form = document.createElement('div');
    form.className = 'auth-form';

    if (type === 'bearer') {
      form.appendChild(
        this.#authField(
          t('req.authToken'),
          this.#request.auth.token ?? '',
          t('req.authTokenPlaceholder'),
          (v) => {
            this.#request.auth.token = v;
          }
        )
      );
    } else if (type === 'basic') {
      form.appendChild(
        this.#authField(
          t('req.authUsername'),
          this.#request.auth.username ?? '',
          t('req.authUsernamePlaceholder'),
          (v) => {
            this.#request.auth.username = v;
          }
        )
      );
      form.appendChild(
        this.#authField(
          t('req.authPassword'),
          this.#request.auth.password ?? '',
          t('req.authPasswordPlaceholder'),
          (v) => {
            this.#request.auth.password = v;
          }
        )
      );
    } else if (type === 'apikey') {
      form.appendChild(
        this.#authField(
          t('req.authKey'),
          this.#request.auth.key ?? '',
          t('req.authKeyPlaceholder'),
          (v) => {
            this.#request.auth.key = v;
          }
        )
      );
      form.appendChild(
        this.#authField(
          t('req.authValue'),
          this.#request.auth.value ?? '',
          t('req.authValuePlaceholder'),
          (v) => {
            this.#request.auth.value = v;
          }
        )
      );

      const inField = document.createElement('div');
      inField.className = 'auth-field';
      const inLabel = document.createElement('label');
      inLabel.className = 'auth-label';
      inLabel.textContent = t('req.authAddTo');
      const inSel = document.createElement('select');
      inSel.className = 'auth-in-select';
      for (const [val, txt] of [
        ['header', t('req.authHeader')],
        ['query', t('req.authQuery')],
      ]) {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = txt;
        if ((this.#request.auth.in ?? 'header') === val) opt.selected = true;
        inSel.appendChild(opt);
      }
      inSel.addEventListener('change', () => {
        this.#request.auth.in = inSel.value;
        this.#scheduleSave();
      });
      inField.appendChild(inLabel);
      inField.appendChild(inSel);
      form.appendChild(inField);
    }

    fields.appendChild(form);
  }

  #authField(label, value, placeholder, onChange) {
    const field = document.createElement('div');
    field.className = 'auth-field';
    const lbl = document.createElement('label');
    lbl.className = 'auth-label';
    lbl.textContent = label;
    const input = document.createElement('input');
    input.className = 'auth-input';
    input.value = value;
    input.placeholder = placeholder;
    input.addEventListener('input', () => {
      onChange(input.value);
      this.#updateAuthDot();
      this.#scheduleSave();
    });
    field.appendChild(lbl);
    field.appendChild(input);
    return field;
  }

  #updateAuthDot() {
    const tab = this.shadowRoot.querySelector('.tab[data-tab="auth"]');
    if (!tab) return;
    const type = this.#request?.auth?.type ?? 'none';
    const existing = tab.querySelector('.dot');
    if (type !== 'none') {
      if (!existing) {
        const dot = document.createElement('span');
        dot.className = 'dot';
        tab.appendChild(dot);
      }
    } else {
      existing?.remove();
    }
  }

  #applyAuth(req) {
    const auth = this.#request?.auth;
    if (!auth || auth.type === 'none') return req;

    const headers = [...(req.headers ?? [])];
    const params = [...(req.params ?? [])];

    if (auth.type === 'bearer' && auth.token) {
      headers.push({ key: 'Authorization', value: `Bearer ${auth.token}`, enabled: true });
    } else if (auth.type === 'basic') {
      const encoded = btoa(`${auth.username ?? ''}:${auth.password ?? ''}`);
      headers.push({ key: 'Authorization', value: `Basic ${encoded}`, enabled: true });
    } else if (auth.type === 'apikey' && auth.key) {
      if ((auth.in ?? 'header') === 'header') {
        headers.push({ key: auth.key, value: auth.value ?? '', enabled: true });
      } else {
        params.push({ key: auth.key, value: auth.value ?? '', enabled: true });
      }
    }

    return { ...req, headers, params };
  }

  #importFromCurl(curlStr) {
    const parsed = parseCurl(curlStr);
    if (!parsed || !this.#request) {
      this.#showImportNotice(false);
      return;
    }

    // Apply parsed values onto the current request
    this.#request.method = parsed.method;
    this.#request.url = parsed.url;
    this.#request.headers = parsed.headers;
    this.#request.params = parsed.params;
    this.#request.body = parsed.body;
    this.#request.auth = parsed.auth;

    // Keep name in sync if it was auto-derived
    if (this.#request.nameIsAuto) {
      this.#request.name = parsed.url;
      this.shadowRoot.getElementById('name-input').value = parsed.url;
    }

    // Update method select
    const sel = this.shadowRoot.getElementById('method-select');
    sel.value = parsed.method;
    sel.style.color = METHOD_COLORS[parsed.method] ?? 'inherit';

    // Update URL input
    this.shadowRoot.getElementById('url-input').value = parsed.url;

    // Re-render KV lists
    this.#renderKvList('params');
    this.#renderKvList('headers');

    // Destroy CodeMirror if present so it reloads with new content
    if (this.#cmEditor) {
      this.#cmEditor.destroy();
      this.#cmEditor = null;
    }

    // Sync body type buttons
    this.shadowRoot.querySelectorAll('.body-type-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.type === parsed.body.type);
    });
    if (this.shadowRoot.getElementById('panel-body')?.classList.contains('active')) {
      this.#renderBodyArea();
    }

    // Sync auth panel if visible
    if (this.shadowRoot.getElementById('panel-auth')?.classList.contains('active')) {
      this.#renderAuthPanel();
    }
    this.#updateAuthDot();

    this.#showImportNotice(true);
    this.#scheduleSave();
  }

  #showImportNotice(success) {
    const notice = this.shadowRoot.getElementById('import-notice');
    if (!notice) return;
    notice.textContent = success ? t('req.importSuccess') : t('req.importError');
    notice.className = `import-notice ${success ? 'success' : 'error'}`;
    clearTimeout(this._noticeTimer);
    this._noticeTimer = setTimeout(() => {
      notice.className = 'import-notice';
    }, 2500);
  }

  #buildCurlCommand() {
    const req = this.#buildCurrentRequest();
    const vars = envToVariables(this.#environment);
    const interpolated = interpolateRequest(req, vars);
    const withAuth = this.#applyAuth(interpolated);

    const parts = [`curl -X ${withAuth.method}`];

    let url = withAuth.url || '';
    const enabledParams = (withAuth.params ?? []).filter((p) => p.enabled !== false && p.key);
    if (enabledParams.length) {
      const qs = enabledParams
        .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value ?? '')}`)
        .join('&');
      url += (url.includes('?') ? '&' : '?') + qs;
    }
    parts.push(this.#shellQuote(url));

    for (const h of withAuth.headers ?? []) {
      if (h.enabled !== false && h.key) {
        parts.push(`-H ${this.#shellQuote(`${h.key}: ${h.value ?? ''}`)}`);
      }
    }

    const body = withAuth.body;
    if (body?.type === 'json' && body.content) {
      parts.push(`-H ${this.#shellQuote('Content-Type: application/json')}`);
      parts.push(`-d ${this.#shellQuote(body.content)}`);
    } else if (body?.type === 'raw' && body.content) {
      parts.push(`-H ${this.#shellQuote(`Content-Type: ${body.contentType ?? 'text/plain'}`)}`);
      parts.push(`-d ${this.#shellQuote(body.content)}`);
    } else if (body?.type === 'form-urlencoded') {
      const enabledPairs = (body.pairs ?? []).filter((p) => p.enabled !== false && p.key);
      if (enabledPairs.length) {
        const formData = enabledPairs
          .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value ?? '')}`)
          .join('&');
        parts.push(`--data-urlencode ${this.#shellQuote(formData)}`);
      }
    }

    return parts.join(' \\\n  ');
  }

  #shellQuote(str) {
    return `'${String(str).replace(/'/g, "'\\''")}'`;
  }
}

customElements.define('request-editor', RequestEditor);
